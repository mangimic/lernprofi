/* 🗃️ KARTEIKARTEN zum Ausdrucken (Kompass-Vorbereitung Klasse 4 BW).
   Nur Abruf-Wissen: Lernwörter, Einmaleins, Regeln, Merksätze, Anker –
   Verständnis üben die App-Bereiche. 4 Karten je A4-Blatt; die
   Rückseiten-Seite ist je Zeile gespiegelt, damit beidseitiger Druck
   (an der langen Kante spiegeln) Vorder- und Rückseite übereinanderlegt.
   typ "schreiben": Erwachsene lesen vor, das Kind SCHREIBT, dann vergleichen. */

export const KARTEIKARTEN = [
  // ── 📖 Deutsch (16) ──
  { id: "d1", fach: "deutsch", vs: "Ich wei_, dass … · Ihr wis_t genau …", hinweis: "ß oder ss? (Familie „wissen“)", rs: "weiß (ß) · wisst (ss)", merk: "Langes ei → ß, kurzes i → ss. Eine Familie, zwei Laute!" },
  { id: "d2", fach: "deutsch", vs: "bräunlich – warum äu?", hinweis: "Welche Strategie hilft?", rs: "Ableiten von „braun“", merk: "äu kommt fast immer von einem Wort mit au." },
  { id: "d3", fach: "deutsch", vs: "gut – ? – ?", hinweis: "Steigere das Adjektiv", rs: "gut – besser – am besten", merk: "„gut“ ist ein Ausreißer – wie „viel – mehr – am meisten“. Sag es laut!" },
  { id: "d4", fach: "deutsch", vs: "Karl sagt __ Ich habe Hunger __", hinweis: "Setze die Zeichen der wörtlichen Rede", rs: "Karl sagt: „Ich habe Hunger.“", merk: "Doppelpunkt – Gänsefüßchen unten „ … dann oben “." },
  { id: "d5", fach: "deutsch", vs: "Grundform von „ging“?", rs: "gehen", merk: "gehen – ging – gegangen. Die Grundform steht im Wörterbuch." },
  { id: "d6", fach: "deutsch", vs: "das Schwimmbad – Bestimmungswort und Wortart?", rs: "schwimmen → Verb", merk: "Frag: Was TUT man dort? Hinten steht, was es IST (Bad)." },
  { id: "d7", fach: "deutsch", vs: "Ein Regal für Bücher ist ein …?", rs: "Bücherregal", merk: "Das Grundwort hinten bestimmt den Artikel: DAS Bücherregal." },
  { id: "d8", fach: "deutsch", typ: "schreiben", vs: "🔊 Vorlesen: „Fahrrad“ – schreib es auf!", hinweis: "Erst schreiben, DANN umdrehen", rs: "Fahrrad", merk: "fahr + Rad – zwei r treffen sich! Buchstabe für Buchstabe vergleichen." },
  { id: "d9", fach: "deutsch", vs: "Hund – d oder t am Ende?", hinweis: "Wie prüfst du es?", rs: "Verlängern: die Hun-de → d", merk: "Mehrzahl bilden, dann hörst du den Buchstaben." },
  { id: "d10", fach: "deutsch", vs: "klug – ? – ?", hinweis: "Steigere das Adjektiv", rs: "klug – klüger – am klügsten", merk: "u wird zu ü – in BEIDEN Vergleichsstufen." },
  { id: "d11", fach: "deutsch", vs: "„wir füttern“ im Präteritum?", rs: "wir fütterten", merk: "Regelmäßige Verben: einfach -ten anhängen." },
  { id: "d12", fach: "deutsch", vs: "„Ich habe ein Bild gemalt.“ – welche Zeitform?", rs: "Perfekt (gesprochene Vergangenheit)", merk: "haben/sein + ge-Wort = Perfekt. „malte“ wäre Präteritum." },
  { id: "d13", fach: "deutsch", vs: "sie fährt · Mitfahrer · abgefahren – der Wortstamm?", rs: "fahr (einmal mit ä: fähr)", merk: "Vorsilben und Endungen weg – was übrig bleibt, ist der Stamm." },
  { id: "d14", fach: "deutsch", vs: "Mit welcher Frage findest du das Subjekt?", rs: "Wer oder was …?", merk: "Wer rennt über den Hof? → Luis und Ali = Subjekt." },
  { id: "d15", fach: "deutsch", typ: "schreiben", vs: "🔊 Vorlesen: „Wir müssen …“ – schreib „müssen“!", hinweis: "Erst schreiben, DANN umdrehen", rs: "müssen", merk: "Kurzes ü → doppelter Mitlaut ss. Vergleiche Buchstabe für Buchstabe." },
  { id: "d16", fach: "deutsch", vs: "Räuber – warum äu?", rs: "Kommt von „rauben“ mit au", merk: "Erst ans verwandte Wort denken, dann schreiben." },
  // ── 🔢 Mathe (16) ──
  { id: "m1", fach: "mathe", vs: "7 · 8 = ?", rs: "56", merk: "7·8 = 7·4 doppelt → 28 + 28. Merksatz: 5-6-7-8 → 56 = 7·8." },
  { id: "m2", fach: "mathe", vs: "Nachbarzehner von 7496?", rs: "7490 und 7500", merk: "Die Zehner direkt davor und danach." , bild:{art:"strahl",von:7480,bis:7510,schritt:10,marken:[7496]}},
  { id: "m3", fach: "mathe", vs: "Trick: 478 − 97 = ?", rs: "478 − 100 + 3 = 381", merk: "Erst 100 weg (3 zu viel!), dann 3 wieder dazu." },
  { id: "m4", fach: "mathe", vs: "5 · 18 = ?", rs: "90", merk: "5·20 − 5·2 = 100 − 10. Runde Zahl nehmen, Rest abziehen." },
  { id: "m5", fach: "mathe", vs: "Zahlenmauer: Wann wird der Deckstein am größten?", rs: "Größte Zahl in die MITTE", merk: "Die mittlere Zahl wird zweimal mitgezählt." , bild:{art:"mauer",reihe:[20,25,30]}},
  { id: "m6", fach: "mathe", vs: "16:18 Uhr + 45 Minuten = ?", rs: "17:03 Uhr", merk: "Erst bis 17:00 (42 Min), dann noch 3 Minuten." , bild:{art:"uhr",zeit:"17:03"}},
  { id: "m7", fach: "mathe", vs: "1 m = ? cm · 1 km = ? m · 1 € = ? ct", rs: "100 cm · 1000 m · 100 ct", merk: "Kilo heißt tausend – Meter und Euro teilen in 100." },
  { id: "m8", fach: "mathe", vs: "Würfel zeigt eine 7 – sicher, möglich oder unmöglich?", rs: "unmöglich", merk: "Auf dem Würfel stehen nur 1 bis 6." },
  { id: "m9", fach: "mathe", vs: "Wie hoch ist eine Tür? Wie breit ein Finger?", rs: "≈ 2 m · ≈ 1 cm", merk: "Anker: Tür 2 m · Finger 1 cm · Bleistiftspitze 1 mm · Fußballplatz 100 m." },
  { id: "m10", fach: "mathe", vs: "Sack A: 1 von 2 weiß · Sack B: 2 von 4 weiß – wo gewinnst du eher?", rs: "In beiden gleich", merk: "Beides ist die Hälfte – Anteile vergleichen, nicht Anzahlen!" , bild:{art:"kugeln",saecke:[{w:1,b:1},{w:2,b:2}]}},
  { id: "m11", fach: "mathe", vs: "Welche Zahl liegt genau in der Mitte von 340 und 480?", rs: "410", merk: "Abstand 140 → die Hälfte (70) zu 340 dazu." },
  { id: "m12", fach: "mathe", vs: "6 · 38 = ?", rs: "228", merk: "6·40 − 6·2 = 240 − 12." },
  { id: "m13", fach: "mathe", vs: "Runde 3467 auf den nächsten Hunderter.", rs: "3500", merk: "Die Zehnerziffer entscheidet: 6 heißt aufrunden." },
  { id: "m14", fach: "mathe", vs: "Rechteck 6 cm lang, 4 cm breit – der Umfang?", rs: "20 cm", merk: "Einmal außen herum: 6+4+6+4." },
  { id: "m15", fach: "mathe", vs: "2,80 m − 2,10 m = ? cm", rs: "70 cm", merk: "0,70 m sind 70 cm – das Komma trennt Meter und Zentimeter." },
  { id: "m16", fach: "mathe", vs: "Würfel: wie viele Flächen, Kanten, Ecken?", rs: "6 Flächen · 12 Kanten · 8 Ecken", merk: "Merkreihe 6-12-8. Zähl am Spielwürfel nach!" , bild:{art:"netz",form:"kreuz"}},
];


// ═══ 📚 Nachschub aus der Kompass-Übungssammlung (v0.51) ═══
export const KARTEIKARTEN_FUNDUS = [
  { id: "d17", fach: "deutsch", vs: "Das Boot sin_t · Mila sin_t ein Lied", hinweis: "g oder k? Verlängere!", rs: "sinkt (sinken) · singt (singen)", merk: "Zwei fast gleiche Wörter – die Grundform entscheidet!" },
  { id: "d18", fach: "deutsch", vs: "der Stau_ (auf dem Regal) – b oder p?", rs: "Staub – Verlängern: staubig", merk: "stau-big macht das b hörbar." },
  { id: "d19", fach: "deutsch", vs: "das Kal_ (junges Rind) – b oder p?", rs: "Kalb – die Kälber", merk: "Mehrzahl bilden: Käl-ber → b." },
  { id: "d20", fach: "deutsch", vs: "die Kr_ter (im Beet) – eu oder äu?", rs: "Kräuter – von „das Kraut“", merk: "äu leitest du von einem au-Wort ab." },
  { id: "d21", fach: "deutsch", vs: "der B_r · die B_te (Piraten!)", hinweis: "ä/eu – ableiten oder merken?", rs: "Bär (Merkwort!) · Beute (eu)", merk: "Ohne verwandtes a/au-Wort: merken statt ableiten." },
  { id: "d22", fach: "deutsch", typ: "schreiben", vs: "🔊 Vorlesen: „die Treppe“ – schreib es auf!", hinweis: "Erst schreiben, DANN umdrehen", rs: "Treppe", merk: "Kurzes e → doppeltes pp. Vergleiche Buchstabe für Buchstabe." },
  { id: "d23", fach: "deutsch", typ: "schreiben", vs: "🔊 Vorlesen: „die Straße“ – schreib es auf!", hinweis: "Erst schreiben, DANN umdrehen", rs: "Straße", merk: "Langes a → ß. (der Fluss: kurzes u → ss!)" },
  { id: "d24", fach: "deutsch", vs: "Fluss oder Fluß? Füße oder Füsse?", rs: "Fluss (kurz → ss) · Füße (lang → ß)", merk: "Kurzer Selbstlaut → ss, langer → ß." },
  { id: "d25", fach: "deutsch", vs: "Mehrzahl: das Land · die Maus · das Museum", rs: "die Länder · die Mäuse · die Museen", merk: "Im Plural heißt der Artikel IMMER „die“." },
  { id: "d26", fach: "deutsch", vs: "„du bist“ und „es hat“ im Präteritum?", rs: "du warst · es hatte", merk: "sein und haben sind die zwei großen Ausnahme-Verben." },
  { id: "d27", fach: "deutsch", vs: "„wir fahren“ und „wir springen“ im Präteritum?", rs: "wir fuhren · wir sprangen", merk: "Starke Verben wechseln den Selbstlaut: a→u, i→a." },
  { id: "d28", fach: "deutsch", vs: "Synonym und Antonym zu „tapfer“?", rs: "mutig (ähnlich) · feige (Gegenteil)", merk: "Synonym = Freund-Wort, Antonym = Gegenteil-Wort." },
  { id: "d29", fach: "deutsch", vs: "Wie steigert man „tot“ und „einzig“?", rs: "Gar nicht – beide sind nicht steigerbar", merk: "Entweder tot oder nicht – „töter“ gibt es nicht." },
  { id: "d30", fach: "deutsch", vs: "im = ? + ? (Präposition zerlegen)", rs: "in + dem", merk: "Auch: zum = zu + dem, ans = an + das." },
  { id: "d31", fach: "deutsch", vs: "Streiche das unpassende Wort: käuflich – verkaufen – verlaufen – Kaufladen", rs: "verlaufen", merk: "Es gehört zur Familie LAUFEN – die anderen zu KAUFEN." },
  { id: "d32", fach: "deutsch", vs: "Warum ist „die Freiheit“ ein Nomen?", rs: "Typische Nomen-Endung -heit", merk: "-heit, -keit, -ung, -nis: fast immer Nomen (großschreiben!)." },
  { id: "m17", fach: "mathe", vs: "Nachbartausender von 6280?", rs: "6000 und 7000", merk: "Volle Tausender davor und danach." , bild:{art:"strahl",von:5000,bis:8000,schritt:1000,marken:[6280]}},
  { id: "m18", fach: "mathe", vs: "96 : 8 = ?", rs: "12", merk: "80:8 = 10 und 16:8 = 2 → 10 + 2." },
  { id: "m19", fach: "mathe", vs: "1000 − 763 = ?", rs: "237", merk: "Ergänzen: 763 + 37 = 800, dann + 200 = 1000." },
  { id: "m20", fach: "mathe", vs: "3,5 km = ? m", rs: "3500 m", merk: "3 km = 3000 m und 0,5 km = 500 m." },
  { id: "m21", fach: "mathe", vs: "Glücksrad: 3 blaue, 2 rote, 1 gelbes Feld – was kommt am ehesten?", rs: "Blau", merk: "Die Farbe mit den meisten Feldern gewinnt am öftesten – sicher ist es nie!" , bild:{art:"rad",felder:{b:3,r:2,g:1}}},
  { id: "m22", fach: "mathe", vs: "Wie rundest du auf den Hunderter?", rs: "Zehnerziffer 0–4 → ab, 5–9 → auf", merk: "3467 → 3500, denn die 6 sagt: aufrunden." , bild:{art:"strahl",von:3400,bis:3500,schritt:50,marken:[3467]}},
  { id: "m23", fach: "mathe", vs: "halbe Stunde = ? Min · Viertelstunde = ? Min", rs: "30 Minuten · 15 Minuten", merk: "Eine Stunde hat 60 Minuten – halbieren, vierteln." },
  { id: "m24", fach: "mathe", vs: "9 · 7 = ?", rs: "63", merk: "Trick: 10·7 − 7 = 70 − 7." },
];
KARTEIKARTEN.push(...KARTEIKARTEN_FUNDUS);

/** Der wirksame Kartensatz: Standard + eigene Eltern-Karten, minus
    ausgeblendete. Gilt für Druck UND digitalen Kasten gleichermassen. */
export function aktiveKarten(einstellungen) {
  const aus = new Set(einstellungen?.kartenAus || []);
  const eigene = (einstellungen?.eigeneKarten || []).map((k) => ({
    id: `e${k.id}`, fach: k.fach, vs: k.vs, rs: k.rs, merk: k.merk, eigen: true,
  }));
  return [...KARTEIKARTEN, ...eigene].filter((k) => !aus.has(k.id));
}

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
