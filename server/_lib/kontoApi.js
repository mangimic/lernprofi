/* ============================================================
   👪 Konto-API (läuft im Cloudflare Worker) – Multi-Tenant-Fundament.
   Zero-Knowledge bleibt: Der Server kennt je Konto NUR
   - die E-Mail (Login-Name + Kontaktweg, kein Reset-Kanal),
   - einen HASH des Auth-Beweises (der Auth-Beweis ist selbst schon
     eine PBKDF2-Ableitung des Eltern-Passworts mit EIGENEM Salt –
     getrennt vom Wrap-Salt, er verrät den Tresor-Schlüssel nicht),
   - technische Meta (Salts, Zeiten).
   Tresor-Chiffrate und Dokumente hängen am Konto (vaultApi).

   Zugangs-Auflösung (kontoVonAnfrage) für ALLE /api/*-Routen:
   1. Gültiges Sitzungs-Cookie  → dieses Konto      (art "sitzung")
   2. Cloudflare-Access-Header  → Stamm-Konto        (art "stamm")
      – die Brücke fürs Bestandskonto, bis der Login-Client da ist.
   3. sonst                     → null (401 beim Aufrufer)

   Endpunkte:
     GET  /api/konto                 → { angemeldet, kontoId?, art?, email? }
     POST /api/konto/einladung       → { code }            (nur Stamm/Access)
     POST /api/konto/registrieren    { einladung, email, authBeweis }
                                     → 201 { kontoId } + Sitzungs-Cookie
     POST /api/konto/login           { email, authBeweis }
                                     → 200 { kontoId } + Sitzungs-Cookie
                                       (401 falsch · 429 zu viele Versuche)
     POST /api/konto/abmelden        → 200, Cookie gelöscht

   Sitzungen: HMAC-SHA256-Token (Worker-Secret SESSION_GEHEIM, anlegen mit
   `npx wrangler secret put SESSION_GEHEIM` – langer Zufallswert), 30 Tage,
   HttpOnly-Cookie. Ohne Secret antworten die Konto-Routen 503; die
   Stamm-Brücke funktioniert auch ohne.
   ============================================================ */

export const STAMM_KONTO = "stamm"; // das Bestandskonto (Familie 1)
export const SITZUNG_COOKIE = "lp_sitzung";
export const SITZUNG_TAGE = 30;
const MAX_LOGIN_VERSUCHE = 10;      // je E-Mail und Stunde
const LOGIN_FENSTER_SEK = 3600;
const KONTO_ID = /^[a-z0-9]{4,40}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Einladungs-Codes ohne verwechselbare Zeichen (kein i/l/o/0/1)
const CODE_ZEICHEN = "abcdefghjkmnpqrstuvwxyz23456789";
const CODE_MUSTER = /^[a-z2-9]{5}-[a-z2-9]{5}$/;

const TE = new TextEncoder();

function json(status, body, extraHeaders) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...(extraHeaders || {}),
    },
  });
}

function zufallsBytes(n) {
  const b = new Uint8Array(n);
  globalThis.crypto.getRandomValues(b);
  return b;
}

const b64url = (bytes) => btoa(String.fromCharCode(...bytes))
  .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

async function sha256Hex(text) {
  const h = await globalThis.crypto.subtle.digest("SHA-256", TE.encode(String(text)));
  return [...new Uint8Array(h)].map((x) => x.toString(16).padStart(2, "0")).join("");
}

async function hmacSignatur(geheim, text) {
  const key = await globalThis.crypto.subtle.importKey(
    "raw", TE.encode(String(geheim)), { name: "HMAC", hash: "SHA-256" }, false, ["sign"],
  );
  const sig = await globalThis.crypto.subtle.sign("HMAC", key, TE.encode(text));
  return b64url(new Uint8Array(sig));
}

export function neueKontoId() {
  return [...zufallsBytes(8)].map((x) => x.toString(16).padStart(2, "0")).join("");
}

export function neuerEinladungsCode() {
  const teil = () => [...zufallsBytes(5)].map((x) => CODE_ZEICHEN[x % CODE_ZEICHEN.length]).join("");
  return `${teil()}-${teil()}`;
}

/** Stellt ein Sitzungs-Token aus: "<kontoId>.<ablaufSek>.<signatur>". */
export async function sitzungAusstellen(geheim, kontoId, jetzt = new Date()) {
  const ablauf = Math.floor(jetzt.getTime() / 1000) + SITZUNG_TAGE * 86400;
  const kern = `${kontoId}.${ablauf}`;
  return `${kern}.${await hmacSignatur(geheim, kern)}`;
}

/** Prüft ein Sitzungs-Token; gibt die kontoId zurück oder null. */
export async function sitzungPruefen(geheim, token, jetzt = new Date()) {
  if (!geheim || typeof token !== "string") return null;
  const teile = token.split(".");
  if (teile.length !== 3) return null;
  const [kontoId, ablauf, sig] = teile;
  if (!KONTO_ID.test(kontoId) || !/^\d+$/.test(ablauf)) return null;
  if (parseInt(ablauf, 10) * 1000 < jetzt.getTime()) return null;
  const soll = await hmacSignatur(geheim, `${kontoId}.${ablauf}`);
  return soll === sig ? kontoId : null;
}

function cookieLesen(request, name) {
  const roh = request.headers.get("cookie") || "";
  for (const paar of roh.split(";")) {
    const [k, ...rest] = paar.trim().split("=");
    if (k === name) return rest.join("=");
  }
  return null;
}

function sitzungsCookie(token, loeschen = false) {
  const alter = loeschen ? 0 : SITZUNG_TAGE * 86400;
  return `${SITZUNG_COOKIE}=${loeschen ? "" : token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${alter}`;
}

/** Löst die Anfrage auf ein Konto auf (Sitzung → Konto, Access → Stamm). */
export async function kontoVonAnfrage(request, env, jetzt = new Date()) {
  const token = cookieLesen(request, SITZUNG_COOKIE);
  if (token && env?.SESSION_GEHEIM) {
    const kontoId = await sitzungPruefen(env.SESSION_GEHEIM, token, jetzt);
    if (kontoId) return { kontoId, art: "sitzung" };
  }
  if (env?.DEV_OHNE_ACCESS === "1" || request.headers.get("Cf-Access-Authenticated-User-Email")) {
    return { kontoId: STAMM_KONTO, art: "stamm" };
  }
  return null;
}

/** Behandelt /api/konto*-Anfragen. Gibt null zurück, wenn die Route fremd ist. */
export async function kontoApi(request, env, jetzt = new Date()) {
  const url = new URL(request.url);
  if (url.pathname !== "/api/konto" && !url.pathname.startsWith("/api/konto/")) return null;
  const kv = env?.TRESOR;
  if (!kv) return json(503, { fehler: "Konten sind noch nicht eingerichtet (KV-Namespace fehlt)." });

  // Wer bin ich? (ohne Anmeldung erreichbar – Antwort sagt es ehrlich)
  if (url.pathname === "/api/konto" && request.method === "GET") {
    const konto = await kontoVonAnfrage(request, env, jetzt);
    if (!konto) return json(200, { angemeldet: false });
    const satz = await kv.get(`konto:${konto.kontoId}`, "json"); // auch fürs (verknüpfte) Stamm-Konto
    return json(200, { angemeldet: true, kontoId: konto.kontoId, art: konto.art, ...(satz?.email ? { email: satz.email } : {}) });
  }
  if (request.method !== "POST") return json(404, { fehler: "Unbekannte Konto-Route." });

  // 🎟️ Einladungs-Code erzeugen – nur das Stamm-Konto (Access) darf das.
  if (url.pathname === "/api/konto/einladung") {
    const konto = await kontoVonAnfrage(request, env, jetzt);
    if (!konto || konto.kontoId !== STAMM_KONTO) {
      return json(403, { fehler: "Einladungen kann nur das Stamm-Konto erzeugen." });
    }
    const code = neuerEinladungsCode();
    await kv.put(`einladung:${code}`, JSON.stringify({ erstellt: jetzt.toISOString(), benutztVon: null }));
    return json(200, { code });
  }

  if (!env?.SESSION_GEHEIM) {
    return json(503, { fehler: "Konto-Anmeldung ist noch nicht eingerichtet (Secret SESSION_GEHEIM fehlt)." });
  }
  let eingabe;
  try { eingabe = await request.json(); } catch { eingabe = {}; }

  const emailNorm = typeof eingabe?.email === "string" ? eingabe.email.trim().toLowerCase() : "";
  const beweis = typeof eingabe?.authBeweis === "string" ? eingabe.authBeweis : "";
  const beweisGueltig = beweis.length >= 20 && beweis.length <= 200;

  // 📝 Registrieren: gültiger Einladungs-Code + freie E-Mail + Auth-Beweis.
  // Sonderweg { stamm: true }: das Bestandskonto (Access-Brücke) verknüpft
  // sich OHNE Code mit E-Mail + Beweis – genau einmal.
  if (url.pathname === "/api/konto/registrieren") {
    if (!EMAIL.test(emailNorm) || emailNorm.length > 120) return json(400, { fehler: "Bitte eine gültige E-Mail-Adresse angeben." });
    if (!beweisGueltig) return json(400, { fehler: "Auth-Beweis fehlt oder hat die falsche Länge." });
    if (await kv.get(`email:${emailNorm}`)) return json(409, { fehler: "Für diese E-Mail gibt es schon ein Konto." });

    let kontoId;
    let einladungVerbrauchen = null;
    if (eingabe?.stamm === true) {
      const konto = await kontoVonAnfrage(request, env, jetzt);
      if (!konto || konto.kontoId !== STAMM_KONTO) {
        return json(403, { fehler: "Die Stamm-Verknüpfung geht nur über den Familien-Zugang (Access)." });
      }
      if (await kv.get(`konto:${STAMM_KONTO}`)) return json(409, { fehler: "Das Stamm-Konto ist schon verknüpft." });
      kontoId = STAMM_KONTO;
    } else {
      const code = typeof eingabe?.einladung === "string" ? eingabe.einladung.trim().toLowerCase() : "";
      if (!CODE_MUSTER.test(code)) return json(400, { fehler: "Erwartet einen Einladungs-Code (xxxxx-xxxxx)." });
      const einladung = await kv.get(`einladung:${code}`, "json");
      if (!einladung || einladung.benutztVon) return json(403, { fehler: "Dieser Einladungs-Code ist unbekannt oder schon benutzt." });
      kontoId = neueKontoId();
      einladungVerbrauchen = { code, einladung };
    }
    await kv.put(`konto:${kontoId}`, JSON.stringify({
      kontoId, email: emailNorm,
      authHash: await sha256Hex(beweis),
      erstellt: jetzt.toISOString(),
    }));
    await kv.put(`email:${emailNorm}`, kontoId);
    if (einladungVerbrauchen) {
      await kv.put(`einladung:${einladungVerbrauchen.code}`,
        JSON.stringify({ ...einladungVerbrauchen.einladung, benutztVon: kontoId, benutztAm: jetzt.toISOString() }));
    }
    const token = await sitzungAusstellen(env.SESSION_GEHEIM, kontoId, jetzt);
    return json(201, { kontoId }, { "set-cookie": sitzungsCookie(token) });
  }

  // 🔑 Login: Auth-Beweis vergleichen (Passwort-Beweis ODER hinterlegter
  // Wiederherstellungs-Beweis), Fehlversuche je E-Mail drosseln.
  if (url.pathname === "/api/konto/login") {
    if (!EMAIL.test(emailNorm) || !beweisGueltig) return json(400, { fehler: "Erwartet { email, authBeweis }." });
    const limitKey = `limit:login:${emailNorm}`;
    const versuche = parseInt((await kv.get(limitKey)) || "0", 10) || 0;
    if (versuche >= MAX_LOGIN_VERSUCHE) {
      return json(429, { fehler: "Zu viele Fehlversuche – bitte in einer Stunde noch einmal." });
    }
    const kontoId = await kv.get(`email:${emailNorm}`);
    const satz = kontoId ? await kv.get(`konto:${kontoId}`, "json") : null;
    const hash = await sha256Hex(beweis); // immer rechnen – kein Timing-Orakel auf die E-Mail
    const rettung = !!satz?.rettungAuthHash && satz.rettungAuthHash === hash;
    if (!satz || (satz.authHash !== hash && !rettung)) {
      await kv.put(limitKey, String(versuche + 1), { expirationTtl: LOGIN_FENSTER_SEK });
      return json(401, { fehler: "E-Mail oder Passwort stimmt nicht." });
    }
    await kv.delete(limitKey);
    const token = await sitzungAusstellen(env.SESSION_GEHEIM, kontoId, jetzt);
    return json(200, { kontoId, ...(rettung ? { rettung: true } : {}) }, { "set-cookie": sitzungsCookie(token) });
  }

  // 🧯 Wiederherstellungs-Beweis hinterlegen (ersetzt einen alten) –
  // braucht ein angemeldetes Konto (Sitzung oder verknüpftes Stamm-Konto).
  if (url.pathname === "/api/konto/rettung") {
    const konto = await kontoVonAnfrage(request, env, jetzt);
    const satz = konto ? await kv.get(`konto:${konto.kontoId}`, "json") : null;
    if (!satz) return json(401, { fehler: "Bitte zuerst anmelden bzw. das Konto verknüpfen." });
    const rb = typeof eingabe?.rettungAuthBeweis === "string" ? eingabe.rettungAuthBeweis : "";
    if (rb.length < 20 || rb.length > 200) return json(400, { fehler: "Rettungs-Beweis fehlt oder hat die falsche Länge." });
    satz.rettungAuthHash = await sha256Hex(rb);
    await kv.put(`konto:${konto.kontoId}`, JSON.stringify(satz));
    return json(200, { ok: true });
  }

  // 🔁 Passwort-Beweis neu setzen – legitimiert durch den ALTEN Beweis
  // (Passwort oder Wiederherstellungs-Code) am angemeldeten Konto.
  if (url.pathname === "/api/konto/passwort") {
    const konto = await kontoVonAnfrage(request, env, jetzt);
    const satz = konto ? await kv.get(`konto:${konto.kontoId}`, "json") : null;
    if (!satz) return json(401, { fehler: "Bitte zuerst anmelden bzw. das Konto verknüpfen." });
    const alt = typeof eingabe?.beweis === "string" ? eingabe.beweis : "";
    if (alt.length < 20 || alt.length > 200 || !beweisGueltig) {
      return json(400, { fehler: "Erwartet { beweis, authBeweis } (alter und neuer Beweis)." });
    }
    const altHash = await sha256Hex(alt);
    if (altHash !== satz.authHash && altHash !== satz.rettungAuthHash) {
      return json(401, { fehler: "Der alte Beweis stimmt nicht." });
    }
    satz.authHash = await sha256Hex(beweis);
    await kv.put(`konto:${konto.kontoId}`, JSON.stringify(satz));
    return json(200, { ok: true });
  }

  if (url.pathname === "/api/konto/abmelden") {
    return json(200, { ok: true }, { "set-cookie": sitzungsCookie("", true) });
  }
  return json(404, { fehler: "Unbekannte Konto-Route." });
}
