/* ============================================================
   👋 Onboarding (Phase 2) – REINE Fachlogik.
   Eltern beantworten beim ersten Start drei kurze Fragen
   (Klasse, tägliche Lernzeit, Schwerpunkte). Die Schwerpunkte
   empfehlen Übungs-Felder, SOLANGE es noch keine Kennenlern-
   Runde (Einstufung) gibt – danach gilt deren Empfehlung, weil
   sie das Kind wirklich gemessen hat.
   Kind-sichtbare Namen bleiben neutral und ermutigend.
   ============================================================ */
export const SCHWERPUNKTE = [
  { key: "rechtschreiben", emoji: "✍️", name: "Richtig schreiben", felder: ["gws", "hoeren", "doppel"] },
  { key: "lesen", emoji: "🔍", name: "Lesen & Verstehen", felder: ["lesen"] },
  { key: "mathe", emoji: "🔢", name: "Mathe-Grundlagen", felder: ["mrechnen", "mzahlen"] },
  { key: "mut", emoji: "💪", name: "Selbstvertrauen", felder: ["stark"] },
];
export const SCHWERPUNKT_KEYS = SCHWERPUNKTE.map((s) => s.key);
export const ZEIT_WAHL = [10, 15, 20, 30]; // Minuten pro Tag (Time-Boxing)

/** Übungs-Felder zu den gewählten Schwerpunkten (eindeutig, Reihenfolge stabil). */
export function schwerpunktFelder(schwerpunkte) {
  const felder = (Array.isArray(schwerpunkte) ? schwerpunkte : [])
    .map((k) => SCHWERPUNKTE.find((s) => s.key === k))
    .filter(Boolean)
    .flatMap((s) => s.felder);
  return [...new Set(felder)];
}

/** 🎯 „empfohlen"-Markierung: Die Einstufung (gemessen) schlägt die
    Eltern-Schwerpunkte (geschätzt); ohne Einstufung zählen die Schwerpunkte. */
export function istEmpfohlen(feldKey, einstufung, schwerpunkte) {
  if (einstufung?.empfehlung) return einstufung.empfehlung.includes(feldKey);
  return schwerpunktFelder(schwerpunkte).includes(feldKey);
}
