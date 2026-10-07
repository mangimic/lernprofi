/* ============================================================
   Stufen je Lernfeld (wie in der Alt-App):
   Stufe 1 = Aufwärmen (easy) · Stufe 2/3 = Klasse-4-Niveau (hard).
   Eine FEHLERFREIE Runde schaltet die nächste Stufe frei; wer die
   höchste Stufe fehlerfrei schafft, bekommt die Krone 👑.
   Klasse 4 startet direkt auf Stufe 2 (wenn es schwere Aufgaben gibt).
   Fortschritt je Feld: { freigeschaltet, runden, krone }.
   ============================================================ */
export const STUFEN_NAMEN = { 1: "Aufwärmen", 2: "Fortgeschritten", 3: "Profi" };

export function leererFortschritt() {
  return { freigeschaltet: 1, runden: 0, krone: false };
}

export function stufenMax(pool) {
  return pool.hard && pool.hard.length ? 3 : 2;
}

export function stufenStart(klasse, pool) {
  return klasse === 4 && pool.hard && pool.hard.length ? 2 : 1;
}

/** Eltern-Vorgabe aus den Einstellungen: Feld vor Global, 0 = automatisch. */
export function stufenVorgabe(einstellungen, key) {
  const v = einstellungen?.stufenVorgabe || {};
  return (v.felder || {})[key] || v.global || 0;
}

/** Aktive Stufe aus Fortschritt, Klassenstufe und (später) Eltern-Vorgabe. */
export function aktiveStufe(fortschritt, klasse, pool, vorgabe = 0) {
  const max = stufenMax(pool);
  if (vorgabe >= 1) return Math.min(vorgabe, max);
  const basis = Math.max(fortschritt?.freigeschaltet || 1, stufenStart(klasse, pool));
  return Math.min(basis, max);
}

/**
 * Wertet eine abgeschlossene Runde aus.
 * Rückgabe: { fortschritt, stufeNeu, krone } – stufeNeu/krone nur bei 0 Fehlern.
 */
export function rundeAbschliessen(fortschritt, { fehler, klasse, pool }) {
  const alt = fortschritt || leererFortschritt();
  const max = stufenMax(pool);
  const stufe = aktiveStufe(alt, klasse, pool);
  const neu = { ...alt, runden: (alt.runden || 0) + 1 };
  let stufeNeu = false;
  let krone = false;
  if (fehler === 0) {
    if (stufe < max) {
      neu.freigeschaltet = Math.max(alt.freigeschaltet || 1, stufe + 1);
      stufeNeu = true;
    } else if (!alt.krone) {
      neu.krone = true;
      krone = true;
    }
  }
  return { fortschritt: neu, stufeNeu, krone };
}
