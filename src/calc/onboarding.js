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

/* 🚀 Geführter Erst-Start (3 Schritte): 1 Eltern-Fragen → Übergabe ans
   Kind → 2 Welten-Wahl → 3 Kennenlern-Runde (überspringbar) → Abschluss.
   profil.erstStart: "offen" (neuer Tresor) | "fertig" (Bestand/abgeschlossen).
   Liefert null, wenn nichts zu führen ist – sonst den aktuellen Schritt. */
export function erstStartLage(profil, lernstand, elternModus) {
  if (!profil || profil.erstStart !== "offen") return null;
  const erledigt = {
    eltern: !!profil.onboardingEltern,
    welten: !!profil.interessenGefragt || (Array.isArray(profil.interessen) && profil.interessen.length > 0),
    kennenlernen: !!lernstand?.einstufung,
  };
  let schritt;
  if (!erledigt.eltern && elternModus) schritt = "eltern";
  else if (!erledigt.welten) schritt = erledigt.eltern && elternModus ? "uebergabe" : "welten";
  else if (!erledigt.kennenlernen) schritt = "kennenlernen";
  else schritt = "fertig";
  const nummer = { eltern: 1, uebergabe: 2, welten: 2, kennenlernen: 3, fertig: 3 }[schritt];
  // Kind ist per PIN da, bevor die Eltern ihren Schritt gemacht haben
  const elternWartet = !erledigt.eltern && !elternModus;
  return { schritt, nummer, erledigt, elternWartet };
}
