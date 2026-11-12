/* 🧪 FIKTIVE Testdaten für Vitest – wird von der App NICHT importiert
   und landet darum nie im Bundle. Kein Eintrag gehört einer echten
   Familie: Namen und Fächer sind erfunden, nur die Zeit-Raster passen
   zu den Regeln, die die Tests prüfen (30-Minuten-Slots, Mittag,
   Schlagzeug-Stunde vor dem Üben). */
import { mittagErzwingen, stundenplanAusText, SCHULE_STANDARD } from "./wochenplan.js";

export const TEST_FESTE = mittagErzwingen([
  { tag: 0, beginn: 960, dauer: 60, name: "Töpfern", emoji: "🏺", hinweis: "freiwillig", aktiv: true },
  { tag: 0, beginn: 1080, dauer: 60, name: "Orchester", emoji: "🎻", hinweis: "", aktiv: true },
  { tag: 1, beginn: 840, dauer: 60, name: "Englisch-AG", emoji: "🏫", hinweis: "bis 14:50", aktiv: false },
  { tag: 1, beginn: 960, dauer: 30, name: "Schlagzeug-Stunde", emoji: "🥁", hinweis: "", aktiv: true },
  { tag: 1, beginn: 1020, dauer: 60, name: "Turnen", emoji: "🤸", hinweis: "", aktiv: true },
  { tag: 2, beginn: 900, dauer: 60, name: "Lernzeit", emoji: "🤝", hinweis: "", aktiv: false },
  { tag: 3, beginn: 1020, dauer: 60, name: "Schwimmen", emoji: "🏊", hinweis: "", aktiv: true },
  { tag: 3, beginn: 1110, dauer: 90, name: "Jugendfeuerwehr", emoji: "🚒", hinweis: "bis 20:00", aktiv: true },
]);

export const TEST_STUNDENPLAN_TEXT = [
  "Mo: Deutsch, Deutsch, Englisch, Mathe, Sachkunde, Kunst",
  "Di: Mathe, Lesen, Sport, Sport, Sachkunde, Garten (AG)",
  "Mi: Deutsch, Englisch, Mathe, Mathe, Lesen, Musik",
  "Do: Mathe, Mathe, Werken, Werken, Religion, Religion",
  "Fr: Sachkunde, Deutsch, Englisch, Musik, Sport, Sport",
].join("\n");

export const TEST_SCHULE = { ...SCHULE_STANDARD, stunden: stundenplanAusText(TEST_STUNDENPLAN_TEXT), mittag: true };
