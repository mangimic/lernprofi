/* ============================================================
   🕐 UHRZEIT & ZEITSPANNEN (Klasse 4, Bildungsplan BW / Kompass 4):
   Uhren minutengenau ablesen, 12- und 24-Stunden-Schreibweise,
   Sprechweisen (auch süddeutsch: „viertel vier“, „dreiviertel vier“),
   Zeitspannen über die volle Stunde und über Mittag, Zeiteinheiten
   umrechnen (h, min, s, Tage, Wochen), Fahrplan- und Stundenplan-
   Aufgaben. Format wie alle Pools: MC mit 2 Distraktoren, Tipp =
   Rechenweg. Bilder: `uhr` (Ziffernblatt), `uhrplus` (Start → Ziel).
   Die Lösungen der Uhr-Aufgaben werden im Test NACHGERECHNET
   (uhrzeit.test.js) – darum liegen die Rechner hier mit im Modul.
   ============================================================ */

/** "H:MM" + Minuten (auch negativ) → "H:MM", rund um die 24-Stunden-Uhr. */
export function uhrPlus(von, plus) {
  const [h, m] = von.split(":").map((x) => parseInt(x, 10));
  const gesamt = (((h * 60 + m + plus) % 1440) + 1440) % 1440;
  return `${Math.floor(gesamt / 60)}:${String(gesamt % 60).padStart(2, "0")}`;
}

/** Dauer in Minuten von "H:MM" bis "H:MM" (bis liegt am selben Tag danach). */
export function uhrDauer(von, bis) {
  const [h1, m1] = von.split(":").map((x) => parseInt(x, 10));
  const [h2, m2] = bis.split(":").map((x) => parseInt(x, 10));
  return (((h2 * 60 + m2) - (h1 * 60 + m1)) % 1440 + 1440) % 1440;
}

// Kurzschreiber: Uhr-PLUS-Aufgabe mit nachrechenbarer Lösung (Bild + Merk-Bild).
const plus = (f, von, dauer, x, tipp) => ({
  f, r: `${uhrPlus(von, dauer)} Uhr`, x, tipp,
  bild: { art: "uhrplus", von, plus: dauer }, merkbild: { art: "uhrplus", von, plus: dauer, zeigt: true },
});
// Kurzschreiber: Ziffernblatt ablesen (12-Stunden-Zeit fürs Bild).
const lesen = (f, zeit, r, x, tipp) => ({ f, r, x, tipp, bild: { art: "uhr", zeit }, merkbild: { art: "uhr", zeit } });
// Kurzschreiber: Dauer zwischen zwei Zeitpunkten (Lösung wird im Test nachgerechnet).
const dauer = (f, von, bis, r, x, tipp) => ({ f, r, x, tipp, dauer: { von, bis } });

export const UHR_DATEN = {
  muhr: {
    easy: [
      lesen("Die Uhr zeigt … Wie spät ist es?", "7:00", "7:00 Uhr", ["12:35 Uhr", "6:00 Uhr"],
        "Der kurze Zeiger zeigt die Stunde (7), der lange steht auf der 12: volle Stunde."),
      lesen("Wie spät ist es?", "3:30", "halb vier (3:30 Uhr)", ["halb drei (2:30 Uhr)", "drei Uhr (3:00 Uhr)"],
        "Der lange Zeiger auf der 6 heißt „halb“. Der kurze steht schon ZWISCHEN 3 und 4 – also halb VIER."),
      lesen("Wie spät ist es?", "9:15", "viertel nach neun (9:15 Uhr)", ["viertel vor neun (8:45 Uhr)", "halb zehn (9:30 Uhr)"],
        "Der lange Zeiger auf der 3 = eine Viertelstunde ist um: 15 Minuten nach 9."),
      lesen("Wie spät ist es?", "10:45", "10:45 Uhr", ["9:45 Uhr", "10:15 Uhr"],
        "Langer Zeiger auf der 9 = 45 Minuten. Der kurze ist fast bei der 11, aber noch nicht da: Stunde 10."),
      lesen("Wie spät ist es?", "4:20", "4:20 Uhr", ["4:04 Uhr", "5:20 Uhr"],
        "Jede Ziffer ist 5 Minuten wert: langer Zeiger auf der 4 → 4 · 5 = 20 Minuten."),
      lesen("Wie spät ist es?", "11:50", "11:50 Uhr", ["12:50 Uhr", "11:10 Uhr"],
        "Langer Zeiger auf der 10 → 10 · 5 = 50. Der kurze steht kurz VOR der 12: Stunde noch 11."),
      lesen("Wie spät ist es?", "6:35", "6:35 Uhr", ["7:35 Uhr", "6:07 Uhr"],
        "Langer Zeiger auf der 7 → 7 · 5 = 35 Minuten. Der kurze ist zwischen 6 und 7: Stunde 6."),
      { f: "Nachmittags um 3 Uhr – wie heißt das in der 24-Stunden-Schreibweise?", r: "15:00 Uhr", x: ["3:00 Uhr", "13:00 Uhr"],
        tipp: "Nachmittags rechnest du 12 dazu: 3 + 12 = 15." },
      lesen("Der Digitalwecker zeigt 19:30. Welche Zeit zeigt die Zeiger-Uhr?", "7:30", "halb acht abends (19:30 Uhr)", ["halb sieben abends (18:30 Uhr)", "halb neun abends (20:30 Uhr)"],
        "19 − 12 = 7. Der lange Zeiger auf der 6 heißt halb – halb ACHT, weil die 7 schon vorbei ist."),
      lesen("Es ist dreiviertel vier. Wie heißt das digital?", "3:45", "3:45 Uhr", ["4:45 Uhr", "3:15 Uhr"],
        "„Dreiviertel vier“: Drei Viertel der VIERTEN Stunde sind um. Das ist 15 Minuten vor 4 Uhr."),
      lesen("Es ist viertel sechs. Wie spät ist es?", "5:15", "5:15 Uhr", ["6:15 Uhr", "5:45 Uhr"],
        "„Viertel sechs“: Ein Viertel der SECHSTEN Stunde ist um – 15 Minuten nach 5 Uhr."),
      { f: "Eine Viertelstunde = ? Minuten", r: "15 Minuten", x: ["25 Minuten", "30 Minuten"],
        tipp: "60 Minuten geteilt durch 4 = 15." },
      { f: "Eine Dreiviertelstunde = ? Minuten", r: "45 Minuten", x: ["35 Minuten", "75 Minuten"],
        tipp: "3 · 15 Minuten = 45." },
      { f: "1 Stunde = ? Minuten", r: "60 Minuten", x: ["100 Minuten", "50 Minuten"],
        tipp: "Der lange Zeiger braucht 60 Minuten für eine ganze Runde." },
      { f: "1 Minute = ? Sekunden", r: "60 Sekunden", x: ["100 Sekunden", "30 Sekunden"],
        tipp: "Genau wie bei Stunde und Minute: 60." },
      plus("8:10 Uhr + 20 Minuten = ?", "8:10", 20, ["8:20 Uhr", "8:40 Uhr"],
        "10 + 20 = 30 Minuten. Die Stunde bleibt 8."),
      plus("14:30 Uhr + 30 Minuten = ?", "14:30", 30, ["14:60 Uhr", "15:30 Uhr"],
        "30 + 30 = 60 Minuten = eine volle Stunde → 15:00 Uhr."),
      plus("6:45 Uhr + 15 Minuten = ?", "6:45", 15, ["6:60 Uhr", "7:15 Uhr"],
        "45 + 15 = 60 → die volle Stunde ist erreicht: 7:00 Uhr."),
    ],
    hard: [
      lesen("Wie spät ist es – minutengenau?", "2:37", "2:37 Uhr", ["7:12 Uhr", "2:35 Uhr"],
        "Langer Zeiger: 7 Ziffern = 35 Minuten, dazu 2 kleine Striche = 37. Kurzer Zeiger zwischen 2 und 3."),
      lesen("Wie spät ist es – minutengenau?", "8:53", "8:53 Uhr", ["9:53 Uhr", "8:47 Uhr"],
        "10 · 5 = 50, plus 3 Striche = 53. Der kurze Zeiger steht kurz vor der 9 – Stunde noch 8."),
      lesen("Wie spät ist es – minutengenau?", "11:04", "11:04 Uhr", ["12:04 Uhr", "11:20 Uhr"],
        "Nur 4 kleine Striche nach der 12 = 4 Minuten. Der kurze Zeiger steht noch fast auf der 11."),
      lesen("Abends zeigt die Uhr diese Zeit. Wie heißt sie in der 24-Stunden-Schreibweise?", "9:45", "21:45 Uhr (dreiviertel zehn)", ["20:45 Uhr (dreiviertel neun)", "21:15 Uhr (viertel zehn)"],
        "Abends: 9 + 12 = 21. Langer Zeiger auf der 9 = 45 Minuten → dreiviertel zehn."),
      plus("7:40 Uhr + 35 Minuten = ?", "7:40", 35, ["7:75 Uhr", "8:05 Uhr"],
        "Erst 20 Minuten bis 8:00 Uhr, dann noch 15 Minuten."),
      plus("Um 11:40 Uhr beginnt die Probe und dauert 50 Minuten. Wann ist sie zu Ende?", "11:40", 50, ["11:90 Uhr", "13:30 Uhr"],
        "Erst 20 Minuten bis 12:00 Uhr (über Mittag!), dann noch 30 Minuten."),
      plus("Jede Schulstunde dauert 45 Minuten. Die 1. Stunde beginnt um 7:50 Uhr, die 2. folgt sofort. Wann endet die 2. Stunde?", "7:50", 90, ["9:30 Uhr", "8:35 Uhr"],
        "2 · 45 = 90 Minuten = 1 Stunde 30 Minuten. 7:50 + 1 h = 8:50, + 30 Min = 9:20."),
      plus("Um 6:45 Uhr klingelt der Wecker. Mia braucht 50 Minuten bis zum Losgehen. Wann geht sie los?", "6:45", 50, ["7:25 Uhr", "7:45 Uhr"],
        "Erst 15 Minuten bis 7:00 Uhr, dann noch 35 Minuten."),
      dauer("Der Unterricht beginnt um 7:50 Uhr, die große Pause um 9:20 Uhr. Wie lange dauert der Unterricht bis zur Pause?", "7:50", "9:20", "1 Stunde 30 Minuten", ["1 Stunde 10 Minuten", "2 Stunden 30 Minuten"],
        "Erst bis zur vollen Stunde: 7:50 → 8:00 = 10 Min. Dann 8:00 → 9:20 = 1 h 20 Min. Zusammen 1 h 30 Min."),
      dauer("Der Bus fährt um 13:52 Uhr ab und kommt um 14:21 Uhr an. Wie lange dauert die Fahrt?", "13:52", "14:21", "29 Minuten", ["31 Minuten", "69 Minuten"],
        "13:52 → 14:00 = 8 Minuten, dann noch 21 Minuten: 8 + 21 = 29."),
      dauer("Das Training geht von 17:15 Uhr bis 18:45 Uhr. Wie lange dauert es?", "17:15", "18:45", "1 Stunde 30 Minuten", ["1 Stunde 15 Minuten", "2 Stunden"],
        "17:15 → 18:15 = 1 Stunde, dann noch 30 Minuten bis 18:45."),
      dauer("Leo liest von 19:35 Uhr bis 20:00 Uhr. Wie lange hat er gelesen?", "19:35", "20:00", "25 Minuten", ["35 Minuten", "65 Minuten"],
        "Ergänze bis zur vollen Stunde: 35 + 25 = 60."),
      { f: "Der Film endet um 20:10 Uhr und dauert 95 Minuten. Wann hat er begonnen?", r: "18:35 Uhr", x: ["19:15 Uhr", "18:45 Uhr"],
        tipp: "Rückwärts: 20:10 − 10 Min = 20:00, − 60 Min = 19:00, − 25 Min = 18:35.",
        merkbild: { art: "uhrplus", von: "18:35", plus: 95, zeigt: true } },
      { f: "Fahrplan: Abfahrt 8:05 Uhr · 8:35 Uhr · 9:05 Uhr. Mia kommt um 8:40 Uhr an die Haltestelle. Wie lange wartet sie?", r: "25 Minuten", x: ["5 Minuten", "35 Minuten"],
        tipp: "Der 8:35-Bus ist weg. Nächster: 9:05. Von 8:40 bis 9:00 sind 20 Min, dann noch 5." },
      { f: "2 Stunden 15 Minuten = ? Minuten", r: "135 Minuten", x: ["215 Minuten", "125 Minuten"],
        tipp: "2 · 60 = 120, dazu 15." },
      { f: "90 Minuten = ?", r: "1 Stunde 30 Minuten", x: ["1 Stunde 90 Minuten", "9 Stunden"],
        tipp: "90 = 60 + 30: eine Stunde und 30 Minuten." },
      { f: "3 Minuten = ? Sekunden", r: "180 Sekunden", x: ["300 Sekunden", "120 Sekunden"],
        tipp: "3 · 60 = 180." },
      { f: "Ein Tag hat 24 Stunden. Wie viele Stunden haben 3 Tage?", r: "72 Stunden", x: ["48 Stunden", "64 Stunden"],
        tipp: "3 · 24 = 3 · 20 + 3 · 4 = 60 + 12." },
      { f: "Wie viele Tage haben 5 Wochen?", r: "35 Tage", x: ["30 Tage", "40 Tage"],
        tipp: "Eine Woche hat 7 Tage: 5 · 7." },
      { f: "Was ist eine ZEITSPANNE?", r: "Die Dauer von 15:00 Uhr bis 16:30 Uhr", x: ["Der Moment, in dem die Uhr genau 15:00 Uhr zeigt", "Die Ziffer 3 auf dem Ziffernblatt"],
        tipp: "Zeitpunkt = ein Moment (15:00 Uhr). Zeitspanne = die Dauer dazwischen (1 h 30 Min)." },
    ],
  },
};

export const UHR_BEREICHE = [
  { key: "muhr", emoji: "🕐", name: "Uhrzeit & Zeitspannen" },
];
