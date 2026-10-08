/* 🧭 „Wozu übe ich das?“ – ein Sinn-Satz je Lernfeld (Muster
   „Relevanz schlägt Routine“). Wird beim Rundenstart gezeigt:
   kurz, konkret, aus der Kinderwelt – nie belehrend. */
export const WOZU = {
  subj: "Wer das Subjekt findet, baut Sätze um wie ein Reporter.",
  praed: "Das Prädikat ist der Motor des Satzes – finde ihn, und du kannst jeden Satz lenken.",
  satzglied: "Sätze umstellen = deine Aufsätze klingen spannend statt immer gleich.",
  rede: "Wörtliche Rede macht deine Geschichten lebendig – wie Sprechblasen im Comic.",
  zeit: "Mit Zeitformen erzählst du, was war, ist und sein wird – wie ein Sportreporter.",
  wa: "Wortarten sind deine Werkzeugkiste: Du weißt, welches Wort welchen Job macht.",
  faelle: "Die 4 Fälle sagen dir, wem der Ball gehört und wen du anspielst.",
  gk: "Groß/klein richtig = deine Texte sehen sofort nach Profi aus.",
  gws: "Diese Wörter brauchst du in JEDEM Diktat – einmal sicher, immer sicher.",
  gesch: "Gute Geschichten schreibt, wer weiß, wie sie gebaut sind.",
  dd: "das oder dass steht in fast jedem Text – knack den Trick, und es sitzt für immer.",
  doppel: "Doppelte Mitlaute hört man – wer sie schreibt, gewinnt beim Diktat.",
  vorgang: "Wer gut beschreibt, dem kann jeder folgen – vom Waffelrezept bis zur Bauanleitung.",
  mrechnen: "Kopfrechnen brauchst du beim Einkaufen, beim Taschengeld – jeden Tag.",
  mzahlen: "Wer Zahlen versteht, liest Tabellen und Spielstände wie ein Trainer.",
  mgeo: "Formen und Flächen stecken in allem, was du baust – auch in der Blockwelt.",
  mgroessen: "Uhrzeiten, Meter, Gramm: Damit planst du Training, Rezepte und Angel-Touren.",
  mdaten: "Daten und Zufall: Damit durchschaust du Spiele – und Glücksversprechen.",
  sstrom: "Strom steckt überall – wer ihn versteht, bleibt sicher und kann mitreden.",
  srad: "Das brauchst du für die Radfahrprüfung – und für jeden Weg zur Schule.",
  skarte: "Mit Karten findest du dich überall zurecht – sogar ohne Handy.",
  sgemeinde: "So funktioniert deine Stadt – und du weißt, wer was entscheidet.",
  skoerper: "Dein Körper ist dein Team – kenn deine Spieler.",
  szeit: "Wer Geschichte kennt, versteht, warum heute alles so ist, wie es ist.",
  stark: "Stark mit Leo: die Sätze und Tricks, die dich auf dem Schulhof wirklich stark machen.",
};

export function wozuSatz(key) {
  return WOZU[key] || "";
}
