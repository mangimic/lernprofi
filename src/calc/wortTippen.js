/* ============================================================
   „Wörter antippen" – reine Prüf-Logik für Subjekt/Prädikat/
   Groß-Klein: Das Kind wählt Wort-Indizes, die Auswahl wird mit
   der Ziel-Menge verglichen. Kein DOM, kein Zufall.
   ============================================================ */

/** Vergleicht die Auswahl mit dem Ziel. */
export function auswahlPruefen(aufgabe, auswahl) {
  const ziel = new Set(aufgabe.ziel);
  const aus = new Set(auswahl);
  const fehlend = [...ziel].filter((i) => !aus.has(i));
  const zuviel = [...aus].filter((i) => !ziel.has(i));
  return { richtig: fehlend.length === 0 && zuviel.length === 0, fehlend, zuviel };
}

/** Datenqualität eines Tippen-Pools (für Tests und Regression). */
export function tippenPoolGesund(pool) {
  const alle = [...(pool.easy || []), ...(pool.hard || [])];
  return alle.length > 0 && alle.every(
    (a) => Array.isArray(a.woerter) && a.woerter.length >= 3
      && Array.isArray(a.ziel) && a.ziel.length >= 1
      && a.ziel.every((i) => Number.isInteger(i) && i >= 0 && i < a.woerter.length)
      && typeof a.frage === "string" && a.frage
      && typeof a.loesung === "string" && a.loesung
      && typeof a.tipp === "string" && a.tipp,
  );
}
