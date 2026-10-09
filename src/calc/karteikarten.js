/* 🗃️ KARTEIKARTEN zum Ausdrucken (Kompass-Vorbereitung Klasse 4 BW).
   Nur Abruf-Wissen: Lernwörter, Einmaleins, Regeln, Merksätze, Anker –
   Verständnis üben die App-Bereiche. 4 Karten je A4-Blatt; die
   Rückseiten-Seite ist je Zeile gespiegelt, damit beidseitiger Druck
   (an der langen Kante spiegeln) Vorder- und Rückseite übereinanderlegt.
   typ "schreiben": Erwachsene lesen vor, das Kind SCHREIBT, dann vergleichen. */

export const KARTEIKARTEN = [
  // ── 📖 Deutsch (16) ──
  { fach: "deutsch", vs: "Ich wei_, dass … · Ihr wis_t genau …", hinweis: "ß oder ss? (Familie „wissen“)", rs: "weiß (ß) · wisst (ss)", merk: "Langes ei → ß, kurzes i → ss. Eine Familie, zwei Laute!" },
  { fach: "deutsch", vs: "bräunlich – warum äu?", hinweis: "Welche Strategie hilft?", rs: "Ableiten von „braun“", merk: "äu kommt fast immer von einem Wort mit au." },
  { fach: "deutsch", vs: "gut – ? – ?", hinweis: "Steigere das Adjektiv", rs: "gut – besser – am besten", merk: "„gut“ ist ein Ausreißer – wie „viel – mehr – am meisten“. Sag es laut!" },
  { fach: "deutsch", vs: "Karl sagt __ Ich habe Hunger __", hinweis: "Setze die Zeichen der wörtlichen Rede", rs: "Karl sagt: „Ich habe Hunger.“", merk: "Doppelpunkt – Gänsefüßchen unten „ … dann oben “." },
  { fach: "deutsch", vs: "Grundform von „ging“?", rs: "gehen", merk: "gehen – ging – gegangen. Die Grundform steht im Wörterbuch." },
  { fach: "deutsch", vs: "das Schwimmbad – Bestimmungswort und Wortart?", rs: "schwimmen → Verb", merk: "Frag: Was TUT man dort? Hinten steht, was es IST (Bad)." },
  { fach: "deutsch", vs: "Ein Regal für Bücher ist ein …?", rs: "Bücherregal", merk: "Das Grundwort hinten bestimmt den Artikel: DAS Bücherregal." },
  { fach: "deutsch", typ: "schreiben", vs: "🔊 Vorlesen: „Fahrrad“ – schreib es auf!", hinweis: "Erst schreiben, DANN umdrehen", rs: "Fahrrad", merk: "fahr + Rad – zwei r treffen sich! Buchstabe für Buchstabe vergleichen." },
  { fach: "deutsch", vs: "Hund – d oder t am Ende?", hinweis: "Wie prüfst du es?", rs: "Verlängern: die Hun-de → d", merk: "Mehrzahl bilden, dann hörst du den Buchstaben." },
  { fach: "deutsch", vs: "klug – ? – ?", hinweis: "Steigere das Adjektiv", rs: "klug – klüger – am klügsten", merk: "u wird zu ü – in BEIDEN Vergleichsstufen." },
  { fach: "deutsch", vs: "„wir füttern“ im Präteritum?", rs: "wir fütterten", merk: "Regelmäßige Verben: einfach -ten anhängen." },
  { fach: "deutsch", vs: "„Ich habe ein Bild gemalt.“ – welche Zeitform?", rs: "Perfekt (gesprochene Vergangenheit)", merk: "haben/sein + ge-Wort = Perfekt. „malte“ wäre Präteritum." },
  { fach: "deutsch", vs: "sie fährt · Mitfahrer · abgefahren – der Wortstamm?", rs: "fahr (einmal mit ä: fähr)", merk: "Vorsilben und Endungen weg – was übrig bleibt, ist der Stamm." },
  { fach: "deutsch", vs: "Mit welcher Frage findest du das Subjekt?", rs: "Wer oder was …?", merk: "Wer rennt über den Hof? → Luis und Ali = Subjekt." },
  { fach: "deutsch", typ: "schreiben", vs: "🔊 Vorlesen: „Wir müssen …“ – schreib „müssen“!", hinweis: "Erst schreiben, DANN umdrehen", rs: "müssen", merk: "Kurzes ü → doppelter Mitlaut ss. Vergleiche Buchstabe für Buchstabe." },
  { fach: "deutsch", vs: "Räuber – warum äu?", rs: "Kommt von „rauben“ mit au", merk: "Erst ans verwandte Wort denken, dann schreiben." },
  // ── 🔢 Mathe (16) ──
  { fach: "mathe", vs: "7 · 8 = ?", rs: "56", merk: "7·8 = 7·4 doppelt → 28 + 28. Merksatz: 5-6-7-8 → 56 = 7·8." },
  { fach: "mathe", vs: "Nachbarzehner von 7496?", rs: "7490 und 7500", merk: "Die Zehner direkt davor und danach." },
  { fach: "mathe", vs: "Trick: 478 − 97 = ?", rs: "478 − 100 + 3 = 381", merk: "Erst 100 weg (3 zu viel!), dann 3 wieder dazu." },
  { fach: "mathe", vs: "5 · 18 = ?", rs: "90", merk: "5·20 − 5·2 = 100 − 10. Runde Zahl nehmen, Rest abziehen." },
  { fach: "mathe", vs: "Zahlenmauer: Wann wird der Deckstein am größten?", rs: "Größte Zahl in die MITTE", merk: "Die mittlere Zahl wird zweimal mitgezählt." },
  { fach: "mathe", vs: "16:18 Uhr + 45 Minuten = ?", rs: "17:03 Uhr", merk: "Erst bis 17:00 (42 Min), dann noch 3 Minuten." },
  { fach: "mathe", vs: "1 m = ? cm · 1 km = ? m · 1 € = ? ct", rs: "100 cm · 1000 m · 100 ct", merk: "Kilo heißt tausend – Meter und Euro teilen in 100." },
  { fach: "mathe", vs: "Würfel zeigt eine 7 – sicher, möglich oder unmöglich?", rs: "unmöglich", merk: "Auf dem Würfel stehen nur 1 bis 6." },
  { fach: "mathe", vs: "Wie hoch ist eine Tür? Wie breit ein Finger?", rs: "≈ 2 m · ≈ 1 cm", merk: "Anker: Tür 2 m · Finger 1 cm · Bleistiftspitze 1 mm · Fußballplatz 100 m." },
  { fach: "mathe", vs: "Sack A: 1 von 2 weiß · Sack B: 2 von 4 weiß – wo gewinnst du eher?", rs: "In beiden gleich", merk: "Beides ist die Hälfte – Anteile vergleichen, nicht Anzahlen!" },
  { fach: "mathe", vs: "Welche Zahl liegt genau in der Mitte von 340 und 480?", rs: "410", merk: "Abstand 140 → die Hälfte (70) zu 340 dazu." },
  { fach: "mathe", vs: "6 · 38 = ?", rs: "228", merk: "6·40 − 6·2 = 240 − 12." },
  { fach: "mathe", vs: "Runde 3467 auf den nächsten Hunderter.", rs: "3500", merk: "Die Zehnerziffer entscheidet: 6 heißt aufrunden." },
  { fach: "mathe", vs: "Rechteck 6 cm lang, 4 cm breit – der Umfang?", rs: "20 cm", merk: "Einmal außen herum: 6+4+6+4." },
  { fach: "mathe", vs: "2,80 m − 2,10 m = ? cm", rs: "70 cm", merk: "0,70 m sind 70 cm – das Komma trennt Meter und Zentimeter." },
  { fach: "mathe", vs: "Würfel: wie viele Flächen, Kanten, Ecken?", rs: "6 Flächen · 12 Kanten · 8 Ecken", merk: "Merkreihe 6-12-8. Zähl am Spielwürfel nach!" },
];

/** Blätter à 4 Karten. `hinten` ist je Zeile links/rechts getauscht, damit
    beidseitiger Druck (lange Kante) Vorder- und Rückseite deckungsgleich macht. */
export function kartenSeiten(karten) {
  const seiten = [];
  for (let i = 0; i < karten.length; i += 4) {
    const vier = [0, 1, 2, 3].map((j) => karten[i + j] || null);
    seiten.push({ vorne: vier, hinten: [vier[1], vier[0], vier[3], vier[2]] });
  }
  return seiten;
}
