/* ============================================================
   👪 Konto-Client (Multi-Tenant, ab v0.71).
   Zero-Knowledge-Anmeldung nach dem Passwortmanager-Muster:
   Aus dem EINEN Eltern-Passwort entstehen zwei getrennte Ableitungen –
   der Tresor-Wrap (vault.js, zufälliger Salt) und der ANMELDE-BEWEIS
   hier (deterministischer Salt aus der E-Mail, damit die Anmeldung
   ohne Server-Rundreise auskommt). Der Server sieht nie das Passwort
   und speichert vom Beweis nur einen Hash – den Tresor kann er nie öffnen.
   ============================================================ */
import { geheimnisBits, toB64, PBKDF2_ITERATIONEN } from "./crypto.js";
import { rettungsCodeNormal } from "./vault.js";

export const emailNormal = (email) => String(email || "").trim().toLowerCase();
export const EMAIL_GUELTIG = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Der Anmelde-Beweis: PBKDF2(passwort, Salt aus der E-Mail) als Base64. */
export async function authBeweis(email, passwort, iterationen = PBKDF2_ITERATIONEN) {
  const salt = new TextEncoder().encode(`lernprofi-anmeldung:${emailNormal(email)}`);
  return toB64(await geheimnisBits(passwort, salt, iterationen));
}

async function post(pfad, body) {
  const r = await fetch(pfad, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body || {}),
  });
  let daten = null;
  try { daten = await r.json(); } catch { /* leere Antwort */ }
  return { ok: r.ok, status: r.status, ...(daten || {}) };
}

/** Wer bin ich? { angemeldet, kontoId?, art?, email? } – offline ehrlich gemeldet. */
export async function kontoStatus() {
  try {
    const r = await fetch("/api/konto", { headers: { accept: "application/json" } });
    if (!r.ok) return { angemeldet: false, grund: "fehler" };
    return await r.json();
  } catch {
    return { angemeldet: false, grund: "offline" };
  }
}

/** Konto anlegen: mit Einladungs-Code – oder als Stamm-Verknüpfung (stamm: true). */
export async function kontoRegistrieren({ einladung, email, passwort, stamm }) {
  const beweis = await authBeweis(email, passwort);
  return post("/api/konto/registrieren", {
    ...(stamm ? { stamm: true } : { einladung: String(einladung || "").trim().toLowerCase() }),
    email: emailNormal(email),
    authBeweis: beweis,
  });
}

export async function kontoAnmelden(email, passwort) {
  return post("/api/konto/login", { email: emailNormal(email), authBeweis: await authBeweis(email, passwort) });
}

export async function kontoAbmelden() {
  return post("/api/konto/abmelden");
}

/* 🧯 Wiederherstellungs-Code am Konto: eigener Beweis mit „rettung:"-Präfix
   (Domänen-Trennung vom Passwort-Beweis), derselbe Zero-Knowledge-Weg. */
export async function rettungsBeweis(email, code, iterationen = PBKDF2_ITERATIONEN) {
  return authBeweis(email, `rettung:${rettungsCodeNormal(code)}`, iterationen);
}

/** Hinterlegt den Code-Beweis am angemeldeten Konto (für den Code-Login). */
export async function kontoRettungHinterlegen(email, code) {
  return post("/api/konto/rettung", { rettungAuthBeweis: await rettungsBeweis(email, code) });
}

/** Anmelden mit dem Wiederherstellungs-Code statt Passwort. */
export async function kontoAnmeldenMitCode(email, code) {
  return post("/api/konto/login", { email: emailNormal(email), authBeweis: await rettungsBeweis(email, code) });
}

/** Setzt den Passwort-Beweis am Konto neu – legitimiert durch den Code
    ODER das alte Passwort. */
export async function kontoPasswortSetzen({ email, code, altesPasswort, neuesPasswort }) {
  const beweis = code ? await rettungsBeweis(email, code) : await authBeweis(email, altesPasswort);
  return post("/api/konto/passwort", { beweis, authBeweis: await authBeweis(email, neuesPasswort) });
}

/** 🗑️ Löscht das Konto samt ALLER Server-Daten (Tresor, Dokumente) –
    endgültig. Die lokalen Daten auf den Geräten bleiben unberührt. */
export async function kontoLoeschen(email, passwort) {
  return post("/api/konto/loeschen", { beweis: await authBeweis(email, passwort) });
}
