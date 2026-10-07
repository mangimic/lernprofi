/* ============================================================
   Aufgaben-Auswahl (fachneutral, für Mathe/Sachkunde-MC):
   - Pool je Lernfeld: { easy, hard }
   - Pakete à 10 Aufgaben, rotieren mit der Rundenzahl
   - Antwort-Optionen gemischt (Zufall kommt als rng-Parameter)
   ============================================================ */
import { mischen } from "./rng.js";

export const PAKET_GROESSE = 10;

/** Aufgabenliste der aktiven Stufe (1 = easy, ab 2 = hard, wenn vorhanden). */
export function stufenListe(pool, stufe) {
  return stufe >= 2 && pool.hard && pool.hard.length ? pool.hard : pool.easy;
}

/** Wählt das Paket der aktuellen Runde (rotiert über alle Pakete). */
export function paketWaehlen(pool, stufe, runden) {
  const liste = stufenListe(pool, stufe);
  const pakete = Math.max(1, Math.ceil(liste.length / PAKET_GROESSE));
  const i = ((runden || 0) % pakete + pakete) % pakete;
  return {
    aufgaben: liste.slice(i * PAKET_GROESSE, (i + 1) * PAKET_GROESSE),
    paket: i + 1,
    pakete,
  };
}

/** Mischt richtige und falsche Antworten einer Aufgabe. */
export function antwortOptionen(aufgabe, rng) {
  return mischen([aufgabe.r, ...aufgabe.x], rng);
}

export function antwortRichtig(aufgabe, wahl) {
  return wahl === aufgabe.r;
}

/** Datenqualität eines Pools (für Tests und Regression).
    1–2 Falsch-Antworten: dass/das hat natürlich nur eine Alternative. */
export function poolGesund(pool) {
  const alle = [...(pool.easy || []), ...(pool.hard || [])];
  return alle.length > 0 && alle.every(
    (a) => typeof a.f === "string" && a.f
      && typeof a.r === "string" && a.r
      && Array.isArray(a.x) && a.x.length >= 1 && a.x.length <= 2 && !a.x.includes(a.r)
      && typeof a.tipp === "string" && a.tipp,
  );
}
