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
