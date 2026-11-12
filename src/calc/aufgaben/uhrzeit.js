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
// Kurzschreiber: Heft-Aufgabe „Wie spät ist es in …" (delta > 0) bzw. „Wie spät
// war es vor …" (delta < 0): Die Zeiger-Uhr zeigt JETZT (12-Stunden-Blatt), die
// Lösung ist die 24-Stunden-Zeit; das Merk-Bild läuft wie der Heft-Pfeil immer
// vom früheren zum späteren Zeitpunkt.
const zwoelf = (z) => { const [h, m] = z.split(":").map(Number); return `${h % 12 || 12}:${String(m).padStart(2, "0")}`; };
const ab = (f, jetzt, delta, x, tipp) => ({
  f, r: `${uhrPlus(jetzt, delta)} Uhr`, x, tipp, jetzt, delta,
  bild: { art: "uhr", zeit: zwoelf(jetzt) },
  merkbild: { art: "uhrplus", von: delta > 0 ? jetzt : uhrPlus(jetzt, delta), plus: Math.abs(delta), zeigt: true },
});
// Kurzschreiber: Umrechnung in Minuten oder Sekunden (Lösung wird im Test nachgerechnet).
const um = (f, wert, x, tipp) => ({
  f, r: wert.minuten !== undefined ? `${wert.minuten} Minuten` : `${wert.sekunden} Sekunden`, x, tipp, ...wert,
});

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
      // 📗 Heft „Zeit": Wandle um
      um("6 h 30 min = ? Minuten", { minuten: 390 }, ["630 Minuten", "360 Minuten"], "6 · 60 = 360, dazu die 30."),
      um("5 min 12 s = ? Sekunden", { sekunden: 312 }, ["512 Sekunden", "302 Sekunden"], "5 · 60 = 300, dazu die 12."),
      um("½ min = ? Sekunden", { sekunden: 30 }, ["50 Sekunden", "5 Sekunden"], "Die Hälfte von 60 Sekunden."),
      um("480 Sekunden = ? Minuten", { minuten: 8 }, ["48 Minuten", "4 Minuten"], "480 : 60 = 8."),
      { f: "Welche Zeitspanne ist genauso lang wie 15 Minuten?", r: "eine viertel Stunde", x: ["eine halbe Stunde", "480 Sekunden"],
        tipp: "60 : 4 = 15 – ein Viertel der Stunde." },
      // 📗 Heft: Wie spät ist es in … (Zeiger-Uhr zeigt JETZT)
      ab("Die Uhr zeigt die Zeit jetzt – es ist Nachmittag. Wie spät ist es in einer Viertelstunde?", "17:00", 15, ["17:45 Uhr", "16:45 Uhr"],
        "Nachmittags: 5 + 12 = 17. Eine Viertelstunde = 15 Minuten dazu."),
      ab("Die Uhr zeigt die Zeit jetzt – es ist Nachmittag. Wie spät ist es in einer halben Stunde?", "13:20", 30, ["13:40 Uhr", "14:20 Uhr"],
        "Nachmittags: 1 + 12 = 13. 20 + 30 = 50 Minuten."),
      ab("Die Uhr zeigt die Zeit jetzt – es ist Nachmittag. Wie spät ist es in eineinhalb Stunden?", "17:00", 90, ["17:30 Uhr", "19:30 Uhr"],
        "Eineinhalb Stunden = 1 Stunde und 30 Minuten: 17:00 → 18:00 → 18:30."),
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
      // 📗 Heft „Zeit – Zeitspannen": Wie spät ist es in … (Zeiger-Uhr zeigt JETZT: 13:27 Uhr)
      ab("Die Uhr zeigt die Zeit jetzt – es ist Nachmittag. Wie spät ist es in 54 Minuten?", "13:27", 54, ["14:11 Uhr", "13:81 Uhr"],
        "Jetzt ist 13:27 Uhr. Erst 33 Min bis 14:00, dann noch 21 Min."),
      ab("Die Uhr zeigt die Zeit jetzt – es ist Nachmittag. Wie spät ist es in 2 h 35 min?", "13:27", 155, ["15:62 Uhr", "16:12 Uhr"],
        "Erst die 2 Stunden: 15:27. Dann 33 Min bis 16:00 und noch 2 Min."),
      ab("Die Uhr zeigt die Zeit jetzt – es ist Nachmittag. Wie spät ist es in 3 h 24 min?", "13:27", 204, ["16:41 Uhr", "17:01 Uhr"],
        "Erst die 3 Stunden: 16:27. Dann 24 Min dazu: 16:51."),
      // 📗 Heft: Wie spät war es vor … (Zeiger-Uhr zeigt JETZT: 7:54 Uhr)
      ab("Die Uhr zeigt die Zeit jetzt – es ist Morgen. Wie spät war es vor 51 Minuten?", "7:54", -51, ["7:13 Uhr", "6:03 Uhr"],
        "Rückwärts: 54 − 51 = 3 → 7:03 Uhr. Die Stunde bleibt."),
      ab("Die Uhr zeigt die Zeit jetzt – es ist Morgen. Wie spät war es vor 1 h 32 min?", "7:54", -92, ["6:32 Uhr", "6:12 Uhr"],
        "Erst 1 Stunde zurück: 6:54. Dann 32 Min zurück: 6:22."),
      ab("Die Uhr zeigt die Zeit jetzt – es ist Morgen. Wie spät war es vor 2 h 58 min?", "7:54", -178, ["5:56 Uhr", "4:46 Uhr"],
        "Erst 2 Stunden zurück: 5:54. Dann 54 Min bis 5:00, noch 4 Min: 4:56."),
      // 📗 Heft: Wie viel Zeit ist vergangen?
      dauer("Wie viel Zeit ist vergangen? Von 10:28 Uhr bis 13:25 Uhr.", "10:28", "13:25", "2 Stunden 57 Minuten", ["3 Stunden 3 Minuten", "2 Stunden 47 Minuten"],
        "10:28 → 12:28 = 2 Stunden. Dann 32 Min bis 13:00 und 25 Min: 57 Min."),
      dauer("Wie viel Zeit ist vergangen? Von 12:36 Uhr bis 15:11 Uhr.", "12:36", "15:11", "2 Stunden 35 Minuten", ["3 Stunden 25 Minuten", "2 Stunden 25 Minuten"],
        "12:36 → 14:36 = 2 Stunden. Dann 24 Min bis 15:00 und 11 Min: 35 Min."),
      dauer("Wie viel Zeit ist vergangen? Von 6:42 Uhr bis 8:25 Uhr.", "6:42", "8:25", "1 Stunde 43 Minuten", ["1 Stunde 23 Minuten", "2 Stunden 17 Minuten"],
        "6:42 → 7:42 = 1 Stunde. Dann 18 Min bis 8:00 und 25 Min: 43 Min."),
      // 📗 Heft: Fahrplan (Abfahrt · Fahrzeit · Ankunft – eins fehlt)
      plus("Fahrplan: Abfahrt 13:10 Uhr, Fahrzeit 40 Minuten. Wann ist die Ankunft?", "13:10", 40, ["13:40 Uhr", "14:10 Uhr"],
        "10 + 40 = 50 Minuten."),
      ab("Fahrplan: Die Uhr zeigt die Ankunft (mittags, 12:24 Uhr). Die Fahrt dauerte 44 Minuten. Wann war die Abfahrt?", "12:24", -44, ["11:50 Uhr", "11:20 Uhr"],
        "Rückwärts: 24 Min bis 12:00, dann noch 20 Min: 11:40 Uhr."),
      dauer("Fahrplan: Abfahrt 13:05 Uhr, Ankunft 17:12 Uhr. Wie lange dauert die Fahrt?", "13:05", "17:12", "4 Stunden 7 Minuten", ["4 Stunden 17 Minuten", "3 Stunden 53 Minuten"],
        "13:05 → 17:05 = 4 Stunden, dann noch 7 Min."),
      plus("Fahrplan: Abfahrt 0:07 Uhr (nachts), Fahrzeit 2 h 56 min. Wann kommt der Zug an?", "0:07", 176, ["2:63 Uhr", "3:13 Uhr"],
        "Erst 2 Stunden: 2:07. Dann 53 Min bis 3:00 und noch 3 Min."),
      dauer("Fahrplan: Hannover ab 10:36 Uhr · Hamburg an 11:56 Uhr · Umsteigezeit 9 Minuten · Hamburg ab 12:05 Uhr · Lübeck an 12:48 Uhr. Wie lange ist Familie Förster von Hannover bis Lübeck unterwegs?", "10:36", "12:48", "2 Stunden 12 Minuten", ["2 Stunden 3 Minuten", "1 Stunde 20 Minuten"],
        "Von der Abfahrt in Hannover bis zur Ankunft in Lübeck – das Umsteigen ist mit drin: 10:36 → 12:36 = 2 h, dann 12 Min."),
      // 📗 Heft „Zeit": Wandle um – mit Vierteln, Sekunden und Tagen
      um("5 ¼ h = ? Minuten", { minuten: 315 }, ["325 Minuten", "300 Minuten"], "5 · 60 = 300, eine Viertelstunde = 15."),
      um("4 ¾ h = ? Minuten", { minuten: 285 }, ["275 Minuten", "300 Minuten"], "4 · 60 = 240, drei Viertel = 45."),
      um("7 min 28 s = ? Sekunden", { sekunden: 448 }, ["728 Sekunden", "438 Sekunden"], "7 · 60 = 420, dazu die 28."),
      um("2 ½ min = ? Sekunden", { sekunden: 150 }, ["250 Sekunden", "120 Sekunden"], "2 · 60 = 120, eine halbe Minute = 30."),
      um("1 h = ? Sekunden", { sekunden: 3600 }, ["360 Sekunden", "600 Sekunden"], "60 Minuten · 60 Sekunden = 3600."),
      { f: "538 s = ? min ? s", r: "8 Minuten 58 Sekunden", x: ["9 Minuten 8 Sekunden", "8 Minuten 38 Sekunden"],
        tipp: "8 · 60 = 480. Rest: 538 − 480 = 58." },
      { f: "1000 s = ? min ? s", r: "16 Minuten 40 Sekunden", x: ["17 Minuten 40 Sekunden", "10 Minuten"],
        tipp: "16 · 60 = 960. Rest: 1000 − 960 = 40." },
      { f: "220 min = ? h ? min", r: "3 Stunden 40 Minuten", x: ["2 Stunden 20 Minuten", "3 Stunden 20 Minuten"],
        tipp: "3 · 60 = 180. Rest: 220 − 180 = 40." },
      // 📗 Heft: Tabelle „Wie spät ist es in einer Dreiviertelstunde / in eineinhalb Stunden?"
      ab("Die Uhr zeigt die Zeit jetzt – es ist Abend. Wie spät ist es in einer Dreiviertelstunde?", "20:05", 45, ["20:35 Uhr", "21:05 Uhr"],
        "Abends: 8 + 12 = 20. Eine Dreiviertelstunde = 45 Min: 5 + 45 = 50."),
      ab("Die Uhr zeigt die Zeit jetzt – es ist Morgen. Wie spät ist es in eineinhalb Stunden?", "7:27", 90, ["8:27 Uhr", "9:57 Uhr"],
        "Eineinhalb Stunden = 1 h 30 min: 7:27 → 8:27 → 8:57."),
    ],
  },
};

export const UHR_BEREICHE = [
  { key: "muhr", emoji: "🕐", name: "Uhrzeit & Zeitspannen" },
];
