/* ============================================================
   Tresor-Sync-API (läuft im Cloudflare Worker, Etappe 6).
   Zero-Knowledge: Der Server speichert AUSSCHLIESSLICH die
   Chiffrate des Geräte-Tresors (tresor.meta + tresor.daten) und
   eine monotone Revisionsnummer – nie Klartext, nie Schlüssel.

   Endpunkte:
     GET /api/meta   → { rev, aktualisiert }            (ohne Blobs)
     GET /api/vault  → { rev, blobs }
     PUT /api/vault  { baseRev, blobs } → { rev }
                       bei fremder baseRev: 409 { rev } – der Client
                       fragt nach, nichts wird still überschrieben.

   Zugang (seit v0.70 Multi-Tenant): kontoVonAnfrage (kontoApi.js)
   löst jede Anfrage auf EIN Konto auf – Sitzungs-Cookie ODER die
   Stamm-Brücke (Cloudflare Access → Bestandskonto "stamm").
   Jedes Konto hat seinen eigenen Tresor (tresor:<kontoId>) und
   eigene Dokumente (dok:<kontoId>:<id>). Die Alt-Schlüssel ohne
   Konto-Präfix (tresor:v1, dok:<id>) wandern beim ersten Zugriff
   des Stamm-Kontos verlustfrei aufs neue Layout.
   DEV_OHNE_ACCESS=1 nur für lokales `wrangler dev`, nie produktiv.
   ============================================================ */
import { kontoVonAnfrage, STAMM_KONTO } from "./kontoApi.js";

const ALT_KV_SCHLUESSEL = "tresor:v1"; // Lage vor den Konten (nur Stamm)
const BLOB_SCHLUESSEL = ["tresor.meta", "tresor.daten"];
const MAX_BYTES = 2 * 1024 * 1024; // 2 MiB Chiffrat reichen weit
// 📂 Dokumenten-Ablage: je Datei EIN KV-Eintrag "dok:<id>" mit dem
// Chiffrat { iv, chiffrat } – der Server sieht nie Klartext. Die
// Dateiliste (Namen, Kategorien) lebt verschlüsselt im Tresor selbst.
const DOK_MAX_BYTES = 18 * 1024 * 1024; // unter dem KV-Limit von 25 MiB
const DOK_ID = /^[a-z0-9][a-z0-9-]{3,40}$/;

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}

export function zugriffErlaubt(request, env) {
  if (env && env.DEV_OHNE_ACCESS === "1") return true;
  return !!request.headers.get("Cf-Access-Authenticated-User-Email");
}

function blobsGueltig(blobs) {
  if (!blobs || typeof blobs !== "object" || Array.isArray(blobs)) return false;
  const schluessel = Object.keys(blobs);
  if (!schluessel.length || !schluessel.every((k) => BLOB_SCHLUESSEL.includes(k))) return false;
  return JSON.stringify(blobs).length <= MAX_BYTES;
}

/** Behandelt /api/*-Anfragen. Gibt null zurück, wenn die Route fremd ist. */
export async function vaultApi(request, env) {
  const url = new URL(request.url);
  if (!url.pathname.startsWith("/api/")) return null;
  const konto = await kontoVonAnfrage(request, env);
  if (!konto) return json(401, { fehler: "Bitte anmelden (Sitzung oder Zugang fehlt)." });
  if (!env || !env.TRESOR) return json(503, { fehler: "Sync ist noch nicht eingerichtet (KV-Namespace fehlt)." });

  const tresorKey = `tresor:${konto.kontoId}`;
  const stand = async () => {
    let s = await env.TRESOR.get(tresorKey, "json");
    if (!s && konto.kontoId === STAMM_KONTO) {
      // Einmalige Migration der Alt-Lage (vor den Konten) aufs neue Layout.
      s = await env.TRESOR.get(ALT_KV_SCHLUESSEL, "json");
      if (s) await env.TRESOR.put(tresorKey, JSON.stringify(s));
    }
    return s || { rev: 0, blobs: null, aktualisiert: null };
  };

  if (url.pathname === "/api/meta" && request.method === "GET") {
    const s = await stand();
    return json(200, { rev: s.rev, aktualisiert: s.aktualisiert });
  }
  if (url.pathname === "/api/vault" && request.method === "GET") {
    const s = await stand();
    return json(200, { rev: s.rev, blobs: s.blobs, aktualisiert: s.aktualisiert });
  }
  if (url.pathname === "/api/vault" && request.method === "PUT") {
    let eingabe;
    try { eingabe = await request.json(); } catch { return json(400, { fehler: "Kein gültiges JSON." }); }
    if (!Number.isInteger(eingabe?.baseRev) || !blobsGueltig(eingabe?.blobs)) {
      return json(400, { fehler: "Erwartet { baseRev, blobs } mit Tresor-Chiffraten." });
    }
    const s = await stand();
    if (eingabe.baseRev !== s.rev) {
      return json(409, { rev: s.rev, aktualisiert: s.aktualisiert });
    }
    const neu = { rev: s.rev + 1, blobs: eingabe.blobs, aktualisiert: new Date().toISOString() };
    await env.TRESOR.put(tresorKey, JSON.stringify(neu));
    return json(200, { rev: neu.rev });
  }
  const dok = url.pathname.match(/^\/api\/doks\/([^/]+)$/);
  if (dok) {
    const id = dok[1];
    if (!DOK_ID.test(id)) return json(400, { fehler: "Ungültige Dokument-ID." });
    const dokKey = `dok:${konto.kontoId}:${id}`;
    if (request.method === "GET") {
      let wert = await env.TRESOR.get(dokKey);
      if (!wert && konto.kontoId === STAMM_KONTO) {
        // Alt-Dok ohne Konto-Präfix: lesen, umhängen, Alt-Schlüssel räumen.
        wert = await env.TRESOR.get(`dok:${id}`);
        if (wert) {
          await env.TRESOR.put(dokKey, wert);
          await env.TRESOR.delete(`dok:${id}`);
        }
      }
      if (!wert) return json(404, { fehler: "Dokument nicht gefunden." });
      return new Response(wert, {
        status: 200,
        headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
      });
    }
    if (request.method === "PUT") {
      let eingabe;
      try { eingabe = await request.json(); } catch { return json(400, { fehler: "Kein gültiges JSON." }); }
      if (typeof eingabe?.iv !== "string" || typeof eingabe?.chiffrat !== "string") {
        return json(400, { fehler: "Erwartet { iv, chiffrat } (verschlüsselte Datei)." });
      }
      const wert = JSON.stringify({ iv: eingabe.iv, chiffrat: eingabe.chiffrat });
      if (wert.length > DOK_MAX_BYTES) return json(413, { fehler: "Dokument zu groß (max. ca. 12 MB Datei)." });
      await env.TRESOR.put(dokKey, wert);
      return json(200, { ok: true });
    }
    if (request.method === "DELETE") {
      await env.TRESOR.delete(dokKey);
      if (konto.kontoId === STAMM_KONTO) await env.TRESOR.delete(`dok:${id}`);
      return json(200, { ok: true });
    }
  }
  return json(404, { fehler: "Unbekannte API-Route." });
}
