/* ============================================================
   🚦 TAGESFORM & 🤸 FOKUS-PAKET – reine Logik, originalgetreu:
   1) Tagesform: freiwillige Abfrage vor der ersten Lerneinheit des
      Tages („Wie fühlt sich Lernen heute an?“). Gilt NUR heute,
      ist KEINE Fähigkeitseinstufung. Rot = kürzere Mini-Missionen
      (3 statt 4 Aufgaben), Tagesziel eine Mission früher, Stufen
      steigen heute nicht. Grün = 5 Aufgaben je Mission.
   2) Fokus-Serie: gelöste Aufgaben AM STÜCK (Abstand < 90 s)
      werden gezählt – Dranbleiben wird belohnt, nicht nur
      Richtigkeit. Der Rekord wandert in den Tresor.
   3) Bewegungspausen: nach einstellbarer Fokuszeit (5/10/15 Min)
      schlägt Leo eine 2-Minuten-Bewegungspause vor – das beste
      Mittel gegen Aufmerksamkeits-Ermüdung. Pausenzeit zählt
      nicht als Lernzeit.
   ============================================================ */
export const TAGESFORM_MODI = { gruen: "💪 fit", gelb: "🙂 normal", rot: "🌧️ schwer" };
export const PAUSEN_INTERVALLE = [5, 10, 15]; // Minuten Fokuszeit bis zur Pause
export const FOKUS_SERIE_ABSTAND = 90000;     // ms: so schnell müssen Aufgaben aufeinander folgen

export const FOKUS_PAUSEN = [
  "Mach 10 Hampelmänner!",
  "Schüttel Arme und Beine kräftig aus!",
  "Öffne das Fenster und atme 5-mal ganz tief durch!",
  "Hüpfe 10-mal auf der Stelle – so hoch du kannst!",
  "Kreise deine Arme 10-mal rückwärts wie ein Adler!",
  "Stell dich auf ein Bein und zähle bis 15 – dann das andere Bein!",
  "Steh auf und strecke dich 5-mal ganz lang zur Decke!",
  "Hole einen blauen Gegenstand und bring ihn zurück!",
  "Gehe einmal langsam zur Tür und wieder zurück!",
];

/** Heutiger Modus: "" (nicht gefragt/übersprungen) | gruen | gelb | rot. */
export function tagesModus(tagesform, heute) {
  return tagesform && tagesform.tag === heute ? (tagesform.modus || "") : "";
}

/** Muss die Tagesform-Frage heute noch gestellt werden? */
export function tagesformNoetig(einstellungen, tagesform, heute) {
  return einstellungen?.tagesformAktiv !== false && (!tagesform || tagesform.tag !== heute);
}

/** Mini-Missions-Länge nach Tagesform: rot 3 · normal 4 · grün 5 Aufgaben. */
export function missionsLaengeHeute(modus) {
  return modus === "rot" ? 3 : modus === "gruen" ? 5 : 4;
}

/** Tagesziel nach Tagesform: an roten Tagen eine Mission früher (mind. 2). */
export function tagesZiel(missionsZiel, modus) {
  const ziel = missionsZiel || 4;
  return modus === "rot" ? Math.max(2, ziel - 1) : ziel;
}

/** Fertige Optionen für aufgabenZaehlen – Tagesform eingerechnet. */
export function missionsOpts(einstellungen, tagesform, heute) {
  const modus = tagesModus(tagesform, heute);
  return {
    missionsZiel: tagesZiel(einstellungen?.missionsZiel, modus),
    missionsLaenge: missionsLaengeHeute(modus),
  };
}

/** Fokus-Serie: nächster Stand nach einer gelösten Aufgabe. */
export function fokusSerieWeiter(serie, letzteZeit, jetzt) {
  return jetzt - letzteZeit < FOKUS_SERIE_ABSTAND ? (serie || 0) + 1 : 1;
}

/** Trägt die heutige Tagesform in die Lerntage-Liste ein (neue Liste). */
export function tagesformEintragen(lerntage, heute, modus) {
  const liste = Array.isArray(lerntage) ? lerntage.slice(-60) : [];
  const vorhanden = liste.find((t) => t.tag === heute);
  if (vorhanden) return liste.map((t) => (t.tag === heute ? { ...t, form: modus } : t));
  return [...liste, { tag: heute, aufgaben: 0, missionen: 0, zielErreicht: false, form: modus }];
}
