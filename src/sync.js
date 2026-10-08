/* ============================================================
   Geräte-Abgleich (Client): schiebt/holt die TRESOR-CHIFFRATE
   (tresor.meta + tresor.daten) zum/vom Worker – der Server sieht
   nie Klartext. Die zuletzt bekannte Server-Revision liegt als
   rein technischer Wert im Gerätespeicher (sync.rev).
   Konflikte (409) werden GEMELDET, nie still überschrieben.
   ============================================================ */
import { META_SCHLUESSEL, DATEN_SCHLUESSEL } from "./vault.js";

const REV_SCHLUESSEL = "sync.rev";
export const DIRTY_SCHLUESSEL = "sync.dirty"; // lokal Ungesichertes offen?

export async function syncStatus() {
  try {
    const r = await fetch("/api/meta", { headers: { accept: "application/json" } });
    if (r.status === 401) return { verfuegbar: false, grund: "kein-zugang" };
    if (r.status === 503) return { verfuegbar: false, grund: "nicht-eingerichtet" };
    if (!r.ok) return { verfuegbar: false, grund: "fehler" };
    const meta = await r.json();
    return { verfuegbar: true, rev: meta.rev, aktualisiert: meta.aktualisiert };
  } catch {
    return { verfuegbar: false, grund: "offline" };
  }
}

/** Lädt die lokalen Chiffrate auf den Server (nach Konflikt-Prüfung). */
export async function hochladen(speicher) {
  const blobs = {
    "tresor.meta": await speicher.get(META_SCHLUESSEL),
    "tresor.daten": await speicher.get(DATEN_SCHLUESSEL),
  };
  if (!blobs["tresor.meta"] || !blobs["tresor.daten"]) {
    return { ok: false, grund: "lokal-leer" };
  }
  const baseRev = (await speicher.get(REV_SCHLUESSEL)) ?? 0;
  const r = await fetch("/api/vault", {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ baseRev, blobs }),
  });
  if (r.status === 409) {
    const s = await r.json();
    return { ok: false, grund: "konflikt", serverRev: s.rev, aktualisiert: s.aktualisiert };
  }
  if (!r.ok) return { ok: false, grund: "fehler" };
  const { rev } = await r.json();
  await speicher.set(REV_SCHLUESSEL, rev);
  await speicher.set(DIRTY_SCHLUESSEL, false);
  return { ok: true, rev };
}

/** Holt den Server-Stand und ERSETZT die lokalen Chiffrate (nach Rückfrage!). */
export async function herunterladen(speicher) {
  const r = await fetch("/api/vault");
  if (!r.ok) return { ok: false, grund: "fehler" };
  const s = await r.json();
  if (!s.blobs) return { ok: false, grund: "server-leer" };
  await speicher.set(META_SCHLUESSEL, s.blobs["tresor.meta"]);
  await speicher.set(DATEN_SCHLUESSEL, s.blobs["tresor.daten"]);
  await speicher.set(REV_SCHLUESSEL, s.rev);
  await speicher.set(DIRTY_SCHLUESSEL, false);
  return { ok: true, rev: s.rev };
}

/** Nach einem Hochlade-Konflikt: Server-Stand bewusst übernehmen ODER
    bewusst überschreiben (baseRev auf Server-Stand setzen, dann hochladen). */
export async function konfliktUeberschreiben(speicher, serverRev) {
  await speicher.set(REV_SCHLUESSEL, serverRev);
  return hochladen(speicher);
}
