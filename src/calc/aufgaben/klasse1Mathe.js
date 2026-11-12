/* ============================================================
   MATHE KLASSE 1 (Bildungsplan BW, Zahlenraum bis 20):
   Zahlen bis 20, Zerlegen, Plus, Minus, Geld, Formen & Muster,
   Uhr mit vollen Stunden. Format wie alle Pools: MC mit genau
   2 Distraktoren (typische Kinderfehler), Tipp = Rechenweg.
   `easy` = 1. Halbjahr, `hard` = 2. Halbjahr.

   Die Zahlen-Aufgaben entstehen EINMAL beim Laden aus Generatoren
   mit festem Seed (`rngAusSeed("<key>")`) – kein Math.random, kein
   Datum. Rechenaufgaben tragen `term` und `sprich` (wird
   Erstklässlern vorgelesen); alle Lösungen werden im Test
   NACHGERECHNET (klasse1Mathe.test.js).
   ============================================================ */
import { rngAusSeed, mischen } from "../rng.js";

/* ---------- Helfer ---------- */

/** Zwei Falschantworten: zuerst die typischen Fehler, dann ±1/±2 als Reserve. */
function falsch(r, typisch, { min = 0, max = 20 } = {}) {
  const x = [];
  for (const k of [...typisch, r + 1, r - 1, r + 2, r - 2, r + 3]) {
    if (!Number.isInteger(k) || k === r || k < min || k > max || x.includes(k)) continue;
    x.push(k);
    if (x.length === 2) break;
  }
  return x.map(String);
}

/** Reißverschluss: nimmt reihum aus jeder Liste – so wird jedes 10er-Paket bunt. */
function verzahnen(...listen) {
  const aus = [];
  const laenge = Math.max(...listen.map((l) => l.length));
  for (let i = 0; i < laenge; i++) for (const l of listen) if (i < l.length) aus.push(l[i]);
  return aus;
}

const ziehen = (liste, n, rng) => mischen(liste, rng).slice(0, n);
const bereich = (von, bis) => Array.from({ length: bis - von + 1 }, (_, i) => von + i);
const rechne = (a, op, b) => (op === "+" ? a + b : a - b);
const ZEICHEN = { "+": "+", "-": "−" };
const WORT = { "+": "plus", "-": "minus" };

// Kurzschreiber: „a + b = ?“ bzw. „a − b = ?“ (Lösung wird im Test nachgerechnet).
function rechnung(a, op, b, typisch, tipp, bild) {
  const r = rechne(a, op, b);
  return {
    f: `${a} ${ZEICHEN[op]} ${b} = ?`, r: String(r), x: falsch(r, typisch), tipp,
    sprich: `Wie viel ist ${a} ${WORT[op]} ${b}?`, term: { a, op, b }, ...(bild ? { bild } : {}),
  };
}

// Kurzschreiber: Sachaufgabe mit Rechnung dahinter (wird ganz vorgelesen).
// Mit `gesucht` ist nicht das Ergebnis gefragt, sondern der fehlende Teil.
function sach(f, a, op, b, typisch, tipp, gesucht) {
  const r = gesucht === "a" ? a : gesucht === "b" ? b : rechne(a, op, b);
  return {
    f, r: String(r), x: falsch(r, typisch, { min: gesucht ? 1 : 0 }), tipp, sprich: f,
    term: gesucht ? { a, op, b, gesucht } : { a, op, b },
  };
}

// Kurzschreiber: Platzhalter-Aufgabe in drei Schreibweisen.
function luecke(form, a, b, typisch, tipp) {
  const t = a + b;
  const formen = {
    "a+?=t": { f: `${a} + ? = ${t}`, sprich: `${a} plus wie viel ist ${t}?`, gesucht: "b" },
    "?+b=t": { f: `? + ${b} = ${t}`, sprich: `Welche Zahl plus ${b} ist ${t}?`, gesucht: "a" },
    "t=a+?": { f: `${t} = ${a} + ?`, sprich: `${t} ist ${a} plus wie viel?`, gesucht: "b" },
  };
  const { f, sprich, gesucht } = formen[form];
  const r = gesucht === "a" ? a : b;
  return { f, r: String(r), x: falsch(r, typisch, { min: 1 }), tipp, sprich, term: { a, op: "+", b, gesucht } };
}

/* ============================================================
   1) ZAHLEN BIS 20
   ============================================================ */

const ZAEHL_DINGE = [
  ["🍎", "Äpfel"], ["⭐", "Sterne"], ["🐟", "Fische"], ["🎈", "Luftballons"],
  ["🌼", "Blumen"], ["🚗", "Autos"], ["🐞", "Käfer"], ["⚽", "Bälle"],
];
const KROKODIL = "Das Zeichen öffnet sein Maul immer zur größeren Zahl – wie ein hungriges Krokodil.";

function feldLesen(n) {
  const tipp = n === 20 ? "Beide Reihen sind voll – das sind 10 und noch einmal 10."
    : n > 10 ? "Die obere Reihe ist voll, das sind 10 – zähle unten von der 10 aus weiter."
      : n === 10 ? "Eine volle Reihe im Zwanzigerfeld sind immer 10 Plättchen."
        : n > 5 ? "Die ersten fünf Plättchen siehst du auf einen Blick – zähle von der 5 aus weiter."
          : "Zähle die Plättchen der Reihe nach von links nach rechts.";
  return {
    f: "Wie viele Plättchen liegen im Zwanzigerfeld?", r: String(n),
    x: falsch(n, n > 10 ? [n - 10, n + 1] : [n + 1, n - 1], { min: 1 }), tipp,
    bild: { art: "zwanzig", rot: n, blau: 0 },
  };
}

const nachfolger = (n) => ({
  f: `Welche Zahl kommt nach der ${n}?`, r: String(n + 1), x: falsch(n + 1, [n - 1, n + 2]),
  tipp: `Zähle weiter: ${n - 1}, ${n} … und dann?`,
});
const vorgaenger = (n) => ({
  f: `Welche Zahl kommt vor der ${n}?`, r: String(n - 1), x: falsch(n - 1, [n + 1, n - 2]),
  tipp: n < 20 ? `Zähle rückwärts: ${n + 1}, ${n} … und dann?` : "Zähle von der 20 aus einen Schritt rückwärts.",
});

function vergleiche(a, b) {
  const z = a < b ? "<" : a > b ? ">" : "=";
  return {
    f: `Vergleiche ${a} und ${b}. Was stimmt?`, r: `${a} ${z} ${b}`,
    x: ["<", ">", "="].filter((s) => s !== z).map((s) => `${a} ${s} ${b}`),
    tipp: z === "=" ? "Beide Zahlen sind gleich groß – dann passt das Gleichheitszeichen." : KROKODIL,
  };
}

const groesste = ([a, b, c]) => {
  const r = Math.max(a, b, c);
  return {
    f: `Welche Zahl ist die größte von ${a}, ${b} und ${c}?`, r: String(r), x: [a, b, c].filter((n) => n !== r).map(String),
    tipp: "Die größte Zahl kommt beim Zählen als letzte dran.",
  };
};
const kleinste = ([a, b, c]) => {
  const r = Math.min(a, b, c);
  return {
    f: `Welche Zahl ist die kleinste von ${a}, ${b} und ${c}?`, r: String(r), x: [a, b, c].filter((n) => n !== r).map(String),
    tipp: "Die kleinste Zahl kommt beim Zählen als erste dran.",
  };
};

const strahl = (von, bis, schritt, n, f, typisch, tipp) => ({
  f, r: String(n), x: falsch(n, typisch), tipp, bild: { art: "strahl", von, bis, schritt, frage: [n] },
});

// Kurzschreiber: Zahlenfolge fortsetzen („3, 4, 5, ?“).
function folge(einleitung, start, schritt, typisch, tipp) {
  const zahlen = [0, 1, 2].map((i) => start + i * schritt);
  const r = start + 3 * schritt;
  return {
    f: `${einleitung}: ${zahlen.join(", ")}, ?`, r: String(r), x: falsch(r, typisch(r)), tipp,
    sprich: `${einleitung}: ${zahlen.join(", ")}. Welche Zahl kommt dann?`,
  };
}

function zahlenPool(rng) {
  /* --- easy: bis 10 --- */
  const dinge = mischen(ZAEHL_DINGE, rng);
  const zaehlen = ziehen(bereich(3, 10), 6, rng).map((n, i) => ({
    f: `Wie viele ${dinge[i][1]} siehst du?`, r: String(n), x: falsch(n, [n + 1, n - 1], { min: 1 }),
    tipp: n > 5 ? "Zähle erst fünf ab und dann von der 5 aus weiter."
      : "Tippe beim Zählen jedes Bild einmal an, dann vergisst du keins.",
    bild: { art: "emoji", zeichen: dinge[i][0], anzahl: n },
  }));
  const felder = ziehen([4, 6, 7, 8, 9, 10], 4, rng).map(feldLesen);
  const farbPaare = ziehen([[6, 3], [4, 5], [7, 2], [3, 6], [5, 4]], 2, rng);
  const farbig = [
    { f: "Wie viele rote Plättchen siehst du?", r: String(farbPaare[0][0]),
      x: [String(farbPaare[0][1]), String(farbPaare[0][0] + farbPaare[0][1])],
      tipp: "Zähle nur die roten Plättchen, die blauen lässt du weg.",
      bild: { art: "zwanzig", rot: farbPaare[0][0], blau: farbPaare[0][1] } },
    { f: "Wie viele blaue Plättchen siehst du?", r: String(farbPaare[1][1]),
      x: [String(farbPaare[1][0]), String(farbPaare[1][0] + farbPaare[1][1])],
      tipp: "Zähle nur die blauen Plättchen, die roten lässt du weg.",
      bild: { art: "zwanzig", rot: farbPaare[1][0], blau: farbPaare[1][1] } },
  ];
  const nach = ziehen(bereich(2, 8), 3, rng).map(nachfolger);
  const vor = ziehen(bereich(3, 10), 3, rng).map(vorgaenger);
  const zwischen = ziehen(bereich(3, 8), 2, rng).map((n) => ({
    f: `Welche Zahl liegt zwischen ${n - 1} und ${n + 1}?`, r: String(n), x: falsch(n, [n + 2, n - 2]),
    tipp: `Zähle von der ${n - 1} aus einen Schritt weiter.`,
  }));
  const dreier = (von, bis) => ziehen(bereich(von, bis), 3, rng);
  const maxMin = [groesste(dreier(1, 10)), kleinste(dreier(1, 10)), groesste(dreier(2, 10)), kleinste(dreier(0, 9))];
  const [v1, v2, v3, v4, v5] = ziehen(bereich(1, 10), 5, rng);
  const vergleich = [vergleiche(Math.min(v1, v2), Math.max(v1, v2)), vergleiche(Math.max(v3, v4), Math.min(v3, v4)), vergleiche(v5, v5)];
  const strahlen = ziehen(bereich(2, 9), 3, rng).map((n) => strahl(0, 10, 1, n,
    "Welche Zahl fehlt am Zahlenstrahl?", [n + 1, n - 1], "Schau auf die Nachbarn links und rechts und zähle von dort einen Schritt."));
  const [f1, f2] = ziehen(bereich(1, 6), 2, rng);
  const [f3, f4] = ziehen(bereich(5, 10), 2, rng);
  const folgen = [
    folge("Zähle weiter", f1, 1, (r) => [r + 1, r - 2], "Es wird immer um 1 mehr."),
    folge("Zähle rückwärts", f3, -1, (r) => [r + 2, r - 1], "Es wird immer um 1 weniger."),
    folge("Zähle weiter", f2, 1, (r) => [r - 1, r + 1], "Es wird immer um 1 mehr."),
    folge("Zähle rückwärts", f4, -1, (r) => [r + 1, r - 1], "Es wird immer um 1 weniger."),
  ];
  const easy = verzahnen(zaehlen, felder, nach, vor, vergleich, strahlen, maxMin, folgen, farbig, zwischen);

  /* --- hard: bis 20 --- */
  const felderH = ziehen(bereich(11, 19), 4, rng).map(feldLesen);
  const [e1, e2, e3, e4, e5] = ziehen(bereich(2, 9), 5, rng);
  const dreher = (e) => [String(e * 10 + 1), String(e + 1)]; // Zahlendreher / Ziffern addiert
  const stellen = [
    { f: "Welche Zahl zeigen die Blöcke?", r: String(10 + e1), x: dreher(e1),
      tipp: "Die Stange ist ein Zehner, die Würfel sind die Einer – erst 10, dann weiterzählen.", bloecke: { z: 1, e: e1 } },
    { f: `Welche Zahl hat 1 Zehner und ${e2} Einer?`, r: String(10 + e2), x: dreher(e2),
      tipp: "Der Zehner steht links, die Einer stehen rechts." },
    { f: `Wie viele Einer hat die Zahl ${10 + e3}?`, r: String(e3), x: ["1", String(10 + e3)],
      tipp: "Die Einer sind die einzelnen Würfel – sie stehen in der Zahl rechts.", bloecke: { z: 1, e: e3 } },
    { f: `Wie viele Zehner stecken in der Zahl ${10 + e4}?`, r: "1", x: [String(e4), "10"],
      tipp: "Ein Zehner ist eine volle Zehnerstange, der Rest sind Einer.", bloecke: { z: 1, e: e4 } },
    { f: "Wie heißt die Zahl aus Zehnerstange und Würfeln?", r: String(10 + e5), x: dreher(e5),
      tipp: "Zähle von der 10 aus die einzelnen Würfel weiter.", bloecke: { z: 1, e: e5 } },
  ];
  const nachH = [19, ...ziehen(bereich(10, 18), 2, rng)].map(nachfolger);
  const vorH = [20, 11, ...ziehen(bereich(12, 19), 1, rng)].map(vorgaenger);
  const nachbarn = ziehen(bereich(11, 18), 2, rng).map((n) => ({
    f: `Welche Zahlen sind die Nachbarn der ${n}?`, r: `${n - 1} und ${n + 1}`,
    x: [`${n - 2} und ${n - 1}`, `${n + 1} und ${n + 2}`],
    tipp: "Ein Nachbar ist um 1 kleiner, der andere um 1 größer.",
  }));
  // Einer-Falle: Die 9 sieht „groß“ aus, ist aber kleiner als jede Zahl mit Zehner.
  const [g1, g2] = ziehen(bereich(12, 15), 2, rng);
  const groesserKleiner = [
    { f: `Welche Zahl ist größer als ${g1}?`, r: String(g1 + 3), x: [String(g1 - 1), "9"],
      tipp: `Zähle von der ${g1} aus weiter – alle Zahlen, die danach kommen, sind größer.` },
    { f: `Welche Zahl ist kleiner als ${g2 + 2}?`, r: "8", x: [String(g2 + 3), String(g2 + 5)],
      tipp: "Die 8 hat keinen Zehner – sie ist kleiner als jede Zahl ab 10." },
    groesste([...ziehen(bereich(11, 19), 2, rng), 9]),
    kleinste([...ziehen(bereich(12, 20), 2, rng), 8]),
  ];
  const [w1, w2] = ziehen(bereich(11, 19), 2, rng);
  const [w3] = ziehen(bereich(13, 19), 1, rng);
  const vergleichH = [vergleiche(Math.min(w1, w2), Math.max(w1, w2)), vergleiche(w3, w3 - 10)];
  const ordnen = [ziehen(bereich(11, 20), 2, rng), ziehen(bereich(12, 19), 2, rng)].map((zwei, i) => {
    const [k, m, g] = [...zwei, i ? 7 : 9].sort((a, b) => a - b);
    return {
      f: `Ordne ${g}, ${k} und ${m} von klein nach groß.`, r: `${k}, ${m}, ${g}`,
      x: [`${g}, ${m}, ${k}`, `${m}, ${k}, ${g}`],
      tipp: "Suche zuerst die kleinste Zahl, dann die nächstgrößere.",
    };
  });
  const [s1, s2] = ziehen(bereich(11, 19), 2, rng);
  const [s3, s4] = ziehen(bereich(12, 18), 2, rng);
  const strahlenH = [
    strahl(10, 20, 1, s1, "Welche Zahl fehlt am Zahlenstrahl?", [s1 + 1, s1 - 1],
      "Schau auf die Nachbarn links und rechts und zähle von dort einen Schritt."),
    strahl(0, 20, 1, s3, "Welche Zahl fehlt am Zahlenstrahl?", [s3 - 10, s3 + 1],
      "Suche die 10 und zähle von dort aus weiter."),
    strahl(0, 20, 2, 12, "Der Zahlenstrahl springt in Zweierschritten. Welche Zahl fehlt?", [11, 13],
      "Von Strich zu Strich sind es immer 2 mehr."),
    strahl(10, 20, 1, s2, "Welche Zahl steht beim Fragezeichen?", [s2 - 1, s2 + 1],
      "Zähle von der 10 aus Strich für Strich mit."),
    strahl(0, 20, 5, 15, "Der Zahlenstrahl springt in Fünferschritten. Welche Zahl fehlt?", [11, 14],
      "Von Strich zu Strich sind es immer 5 mehr."),
    strahl(0, 20, 1, s4, "Welche Zahl steht beim Fragezeichen?", [s4 + 1, s4 - 1],
      "Suche die 10 und zähle von dort aus weiter."),
  ];
  const [z1] = ziehen([2, 4, 6, 8, 10], 1, rng);
  const folgenH = [
    folge("Zähle weiter", ziehen(bereich(11, 16), 1, rng)[0], 1, (r) => [r + 1, r - 2], "Es wird immer um 1 mehr."),
    folge("Zähle rückwärts", ziehen(bereich(14, 20), 1, rng)[0], -1, (r) => [r + 2, r - 1], "Es wird immer um 1 weniger."),
    folge("Zähle in Zweierschritten", z1, 2, (r) => [r - 1, r + 2], "Es wird immer um 2 mehr – eine Zahl überspringst du."),
    folge("Zähle rückwärts", 12, -1, (r) => [r + 1, r - 1], "Nach der 10 kommt beim Rückwärtszählen die 9."),
    folge("Zähle in Fünferschritten", 5, 5, () => [16, 19], "Es wird immer um 5 mehr – wie die Finger einer Hand."),
  ];
  const zahlwort = (wort, n, x, tipp) => ({ f: `Wie schreibst du ${wort} als Zahl?`, r: String(n), x, tipp });
  const woerter = [
    zahlwort("zwölf", 12, ["20", "2"], "Zwölf kommt gleich nach der Elf: ein Zehner und 2 Einer."),
    zahlwort("sechzehn", 16, ["61", "6"], "Du hörst zuerst die Sechs, schreibst aber zuerst den Zehner."),
    zahlwort("elf", 11, ["1", "12"], "Elf kommt gleich nach der Zehn: ein Zehner und 1 Einer."),
    zahlwort("zwanzig", 20, ["12", "2"], "Zwanzig sind zwei volle Zehner und kein Einer."),
    zahlwort("dreizehn", 13, ["31", "3"], "Du hörst zuerst die Drei, schreibst aber zuerst den Zehner."),
  ];
  const hard = verzahnen(felderH, stellen, nachH, vorH, strahlenH, groesserKleiner, folgenH, woerter, vergleichH, nachbarn, ordnen);

  return { easy, hard };
}

/* ============================================================
   2) ZAHLEN ZERLEGEN
   ============================================================ */

function zerlegenPool(rng) {
  /* --- easy: Zerlegungen der Zahlen 4 bis 9 (und der 10 mit Material) --- */
  const paare = mischen(bereich(4, 9).flatMap((t) => bereich(1, t - 1).map((a) => [a, t - a])), rng);
  const nimm = (n) => paare.splice(0, n);

  const plaettchen = nimm(5).map(([a, b]) => ({
    ...sach(`Von ${a + b} Plättchen sind ${a} rot. Wie viele sind blau?`, a, "+", b, [a + b, a],
      "Zähle nur die blauen Plättchen – rot und blau zusammen sind alle.", "b"),
    bild: { art: "zwanzig", rot: a, blau: b },
  }));
  const tippZerlegen = (a, t) => `Zähle von der ${a} weiter bis zur ${t} und merke dir die Schritte.`;
  const gleichVorn = nimm(6).map(([a, b], i) => luecke("t=a+?", a, b, i % 2 ? [b - 1, b + 1] : [a + a + b, b + 1], tippZerlegen(a, a + b)));
  const hinten = nimm(5).map(([a, b], i) => luecke("a+?=t", a, b, i % 2 ? [a + a + b, b - 1] : [b + 1, b - 1], tippZerlegen(a, a + b)));
  const vorn = nimm(3).map(([a, b]) => luecke("?+b=t", a, b, [a + 1, a + b + b],
    `Tausche im Kopf: ${b} plus wie viel ergibt ${a + b}?`));
  const haus = nimm(4).map(([a, b]) => sach(`Im Zahlenhaus der ${a + b} wohnt die ${a}. Welche Zahl wohnt daneben?`,
    a, "+", b, [b + 1, b - 1], `Beide Zahlen in einem Stockwerk ergeben zusammen immer die Dachzahl ${a + b}.`, "b"));
  const verschieden = paare.filter(([a, b], i) => paare.findIndex(([c, d]) => c + d === a + b) === i);
  const passt = verschieden.slice(0, 3).map(([a, b]) => {
    const [k, g] = [Math.min(a, b), Math.max(a, b)]; // g ≥ 2, damit „g − 1“ nie 0 wird
    return {
      f: `Welche Zerlegung passt zur ${a + b}?`, r: `${g} + ${k}`, x: [`${g} + ${k + 1}`, `${g - 1} + ${k}`],
      tipp: `Rechne alle drei Aufgaben aus – nur eine ergibt ${a + b}.`,
    };
  });
  const geschichten = [
    sach("Mia hat 8 Murmeln. 5 sind rot, die anderen blau. Wie viele sind blau?", 5, "+", 3, [4, 13],
      "Zähle von der 5 weiter bis zur 8 – so viele Murmeln sind blau.", "b"),
    sach("In der Schüttelbox sind 7 Kugeln. Links liegen 3. Wie viele rechts?", 3, "+", 4, [5, 10],
      "Links und rechts zusammen sind immer alle 7 Kugeln.", "b"),
    sach("Lena würfelt mit 2 Würfeln eine 7. Ein Würfel zeigt 5. Und der andere?", 5, "+", 2, [3, 12],
      "Beide Würfel zusammen ergeben 7 – zähle von der 5 weiter.", "b"),
    sach("Auf dem Teller sind 9 Kekse, 4 mit Schoko. Wie viele sind ohne Schoko?", 4, "+", 5, [6, 13],
      "Zähle von der 4 weiter bis zur 9.", "b"),
    sach("Ben hat 6 Stifte. 2 sind rot, der Rest ist grün. Wie viele sind grün?", 2, "+", 4, [3, 8],
      "Rote und grüne Stifte zusammen sind 6 – zähle von der 2 weiter.", "b"),
    {
      ...sach("Von 10 Plättchen sind 6 rot. Wie viele sind blau?", 6, "+", 4, [10, 6],
        "Eine volle Reihe sind 10 – zähle die blauen Plättchen.", "b"),
      bild: { art: "zwanzig", rot: 6, blau: 4 },
    },
  ];
  const easy = verzahnen(plaettchen, gleichVorn, hinten, haus, geschichten, vorn, passt);

  /* --- hard: verliebte Zahlen, Ergänzen zur 10 und zur 20 --- */
  const zehner = mischen(bereich(1, 9), rng);
  const verliebt = zehner.slice(0, 6).map((a) => sach(`Welche Zahl ist mit der ${a} verliebt?`, a, "+", 10 - a,
    [10 - a + 1, 10 - a - 1], `Verliebte Zahlen ergeben zusammen 10 – zähle von der ${a} weiter bis zur 10.`, "b"));
  const zehn2 = mischen(bereich(2, 8), rng);
  const tippZehn = "Denk an deine Finger: Wie viele fehlen noch bis zur 10?";
  const zurZehn = [
    luecke("a+?=t", zehn2[0], 10 - zehn2[0], [10 - zehn2[0] + 1, 10 - zehn2[0] - 1], tippZehn),
    luecke("?+b=t", 10 - zehn2[1], zehn2[1], [10 - zehn2[1] + 1, 10 + zehn2[1]], tippZehn),
    luecke("t=a+?", zehn2[2], 10 - zehn2[2], [10 + zehn2[2], 10 - zehn2[2] - 1], tippZehn),
    luecke("a+?=t", zehn2[3], 10 - zehn2[3], [10 + zehn2[3], 10 - zehn2[3] + 1], tippZehn),
    luecke("?+b=t", 10 - zehn2[4], zehn2[4], [10 - zehn2[4] - 1, 10 - zehn2[4] + 1], tippZehn),
    luecke("t=a+?", zehn2[5], 10 - zehn2[5], [10 - zehn2[5] + 1, 10 - zehn2[5] - 1], tippZehn),
  ];
  const feldZehn = ziehen(bereich(3, 8), 3, rng).map((a) => ({
    ...sach("Wie viele Plättchen fehlen bis zur 10?", a, "+", 10 - a, [a, 10 - a + 1],
      "Zähle die leeren Felder in der oberen Reihe.", "b"),
    bild: { art: "zwanzig", rot: a, blau: 0 },
  }));
  const feldZwanzig = ziehen(bereich(11, 18), 3, rng).map((a) => ({
    ...sach("Wie viele Plättchen fehlen bis zur 20?", a, "+", 20 - a, [20 - a + 10, 20 - a + 1],
      "Die obere Reihe ist voll – zähle die leeren Felder in der unteren Reihe.", "b"),
    bild: { art: "zwanzig", rot: a, blau: 0 },
  }));
  const zwanzig = mischen(bereich(11, 19), rng);
  const tippZwanzig = (a) => `Denk an die verliebten Zahlen: Was passt zur ${a - 10}, damit es 10 wird?`;
  const zurZwanzig = zwanzig.slice(0, 8).map((a, i) => {
    const b = 20 - a;
    const form = ["a+?=t", "t=a+?", "a+?=t", "?+b=t"][i % 4];
    return form === "?+b=t"
      ? luecke(form, b, a, [b + 10, b + 1], `Tausche im Kopf: ${a} plus wie viel ergibt 20?`)
      : luecke(form, a, b, i % 2 ? [b + 1, b - 1] : [b + 10, b + 1], tippZwanzig(a));
  });
  const zehnerEiner = ziehen(bereich(12, 19), 3, rng).map((t) => luecke("t=a+?", 10, t - 10, [1, t - 10 + 1],
    "Zerlege in Zehner und Einer: Die 10 ist der Zehner, der Rest sind die Einer."));
  const geschichtenH = [
    sach("Du hast 10 Finger. 6 sind gestreckt. Wie viele sind gebeugt?", 6, "+", 4, [5, 16],
      "Verliebte Zahlen helfen: 6 und wie viel sind zusammen 10?", "b"),
    sach("Ben hat 16 Sticker. Er möchte 20 haben. Wie viele fehlen ihm noch?", 16, "+", 4, [14, 5],
      "Denk an die verliebten Zahlen: Was passt zur 6, damit es 10 wird?", "b"),
    sach("In den Eierkarton passen 10 Eier. 7 sind drin. Wie viele fehlen noch?", 7, "+", 3, [4, 17],
      "Zähle von der 7 weiter bis zur 10.", "b"),
    sach("Im Bus sind 20 Plätze. 15 sind besetzt. Wie viele Plätze sind frei?", 15, "+", 5, [15, 6],
      "Denk an die verliebten Zahlen: Was passt zur 5, damit es 10 wird?", "b"),
    sach("Emma hat 12 Perlen. Für die Kette braucht sie 20. Wie viele fehlen?", 12, "+", 8, [18, 7],
      "Denk an die verliebten Zahlen: Was passt zur 2, damit es 10 wird?", "b"),
  ];
  const hard = verzahnen(verliebt, zurZehn, feldZehn, geschichtenH, zurZwanzig, feldZwanzig, zehnerEiner);

  return { easy, hard };
}

/* ============================================================
   3) PLUS BIS 20
   ============================================================ */

function plusPool(rng) {
  /* --- easy: ohne Zehnerübergang --- */
  const bis10 = mischen(bereich(2, 8).flatMap((a) => bereich(2, 10 - a).filter((b) => b !== a).map((b) => [a, b])), rng);
  const tippBis10 = (a, b) => (b - a >= 3 ? `Tausche die Zahlen: ${b} + ${a} rechnet sich leichter.`
    : `Zähle von der ${Math.max(a, b)} aus ${Math.min(a, b)} Schritte weiter.`);
  const fehlerBis10 = (a, b, i) => [[Math.abs(a - b), a + b + 1], [a + b - 1, a + b + 1], [a + b + 1, a + b + 2]][i % 3];
  const klein = [
    ...bis10.slice(0, 8).map(([a, b], i) => rechnung(a, "+", b, fehlerBis10(a, b, i), tippBis10(a, b))),
    rechnung(4, "+", 0, [0, 5], "Plus null heißt: Es kommt nichts dazu."),
    rechnung(6, "+", 1, [5, 8], "Plus 1 ist immer die nächste Zahl beim Zählen."),
    rechnung(5, "+", 5, [9, 11], "Zwei Hände haben zusammen so viele Finger."),
  ];
  const kleinBild = bis10.slice(8, 13).map(([a, b], i) => rechnung(a, "+", b, fehlerBis10(a, b, i + 1),
    "Zähle erst die roten Plättchen und dann bei den blauen weiter.", { art: "zwanzig", rot: a, blau: b }));
  const geschichten = [
    sach("Mia hat 4 Äpfel. Ben gibt ihr 3 dazu. Wie viele hat Mia jetzt?", 4, "+", 3, [1, 8],
      "„Dazu“ heißt plus – zähle von der 4 aus 3 Schritte weiter."),
    sach("Auf dem Ast sitzen 5 Vögel. 2 kommen dazu. Wie viele sind es jetzt?", 5, "+", 2, [3, 8],
      "Es werden mehr Vögel – rechne 5 plus 2."),
    sach("Tom hat 6 rote und 3 blaue Autos. Wie viele Autos hat er zusammen?", 6, "+", 3, [3, 8],
      "„Zusammen“ heißt plus – zähle von der 6 aus 3 Schritte weiter."),
  ];
  const einer = mischen(bereich(1, 9), rng);
  const zehnPlus = [
    ...einer.slice(0, 2).map((e) => rechnung(10, "+", e, [e + 1, 10 + e + 1],
      `Zehn und ${e} – das ist ein voller Zehner und ${e} Einer.`)),
    ...einer.slice(2, 4).map((e) => rechnung(10, "+", e, [10 + e - 1, e + 1],
      "Oben liegt eine volle Reihe mit 10 – zähle unten von der 10 aus weiter.", { art: "zwanzig", rot: 10, blau: e })),
    ...einer.slice(4, 6).map((e) => rechnung(e, "+", 10, [e + 1, 10 + e - 1],
      `Tausche die Zahlen: 10 + ${e} rechnet sich leichter.`)),
  ];
  const teen = mischen(bereich(11, 17).flatMap((a) => bereich(2, 9 - (a % 10)).map((b) => [a, b])), rng);
  const tippTeen = (a, b) => `Rechne erst die kleine Aufgabe ${a % 10} + ${b} – der Zehner kommt wieder dazu.`;
  const fehlerTeen = (r, i) => [[r - 10, r + 1], [r - 10, r - 1], [r + 1, r - 1]][i % 3];
  const ohne = [
    ...teen.slice(0, 5).map(([a, b], i) => rechnung(a, "+", b, fehlerTeen(a + b, i), tippTeen(a, b))),
    ...teen.slice(5, 7).map(([a, b], i) => rechnung(a, "+", b, fehlerTeen(a + b, i), tippTeen(a, b),
      { art: "zwanzig", rot: a, blau: b })),
  ];
  const geschichten2 = [
    sach("Lena hat 11 Sticker. Sie bekommt 4 dazu. Wie viele hat sie jetzt?", 11, "+", 4, [5, 7],
      "Rechne erst 1 + 4 – der Zehner kommt wieder dazu."),
    sach("Im Stall stehen 10 Kühe und 6 Kälber. Wie viele Tiere sind das?", 10, "+", 6, [7, 4],
      "Zehn und 6 – das ist ein voller Zehner und 6 Einer."),
  ];
  const easy = [...verzahnen(klein, kleinBild, geschichten), ...verzahnen(zehnPlus, ohne, geschichten2)];

  /* --- hard: mit Zehnerübergang, Verdoppeln --- */
  const ueber = mischen(bereich(5, 9).flatMap((a) => bereich(3, 9)
    .filter((b) => a + b >= 11 && Math.abs(a - b) >= 2).map((b) => [a, b])), rng);
  const tippUeber = (a, b) => (a === 9 ? `Trick mit der 9: Rechne 10 + ${b} und nimm 1 wieder weg.`
    : `Rechne erst bis zur 10: ${a} + ${10 - a} = 10, dann noch ${b - (10 - a)} dazu.`);
  const fehlerUeber = (r, i) => [[r - 10, r + 1], [r - 1, r + 1], [r - 10, r - 1]][i % 3];
  const uebergang = ueber.slice(0, 10).map(([a, b], i) => rechnung(a, "+", b, fehlerUeber(a + b, i), tippUeber(a, b)));
  const uebergangBild = ueber.slice(10, 14).map(([a, b], i) => rechnung(a, "+", b, fehlerUeber(a + b, i + 1),
    "Fülle erst die obere Reihe bis zur 10 – der Rest der blauen Plättchen liegt unten.", { art: "zwanzig", rot: a, blau: b }));
  const kraft5 = (n) => `Kraft der 5: 5 + 5 = 10 und ${n - 5} + ${n - 5} = ${2 * (n - 5)} – beides zusammen.`;
  const doppelt = [
    rechnung(6, "+", 6, [11, 14], kraft5(6)),
    sach("Was ist das Doppelte von 7?", 7, "+", 7, [15, 12], kraft5(7)),
    rechnung(8, "+", 8, [18, 15], kraft5(8)),
    sach("Was ist das Doppelte von 9?", 9, "+", 9, [17, 16], "Rechne 10 + 10 = 20 und nimm 2 wieder weg."),
    rechnung(10, "+", 10, [10, 19], "Zwei volle Zehner sind zusammen 20."),
  ];
  const nachbar = ziehen([[5, 6], [6, 7], [7, 8], [8, 9], [7, 6], [9, 8]], 3, rng).map(([a, b]) => {
    const k = Math.min(a, b);
    return rechnung(a, "+", b, [2 * k, 2 * k + 2], `Nachbaraufgabe vom Verdoppeln: ${k} + ${k} = ${2 * k}, dann noch 1 dazu.`);
  });
  const geschichtenH = [
    sach("Tom hat 7 Autos. Zum Geburtstag bekommt er 6 dazu. Wie viele hat er?", 7, "+", 6, [1, 12],
      "Rechne erst bis zur 10: 7 + 3 = 10, dann noch 3 dazu."),
    sach("Im Bus sitzen 8 Kinder. 4 steigen ein. Wie viele sind es jetzt?", 8, "+", 4, [4, 11],
      "„Einsteigen“ heißt plus: 8 + 2 = 10, dann noch 2 dazu."),
    sach("Ida hat 9 Muscheln. Ali schenkt ihr 6. Wie viele hat Ida jetzt?", 9, "+", 6, [3, 14],
      "Trick mit der 9: Rechne 10 + 6 und nimm 1 wieder weg."),
    sach("Emma liest 6 Seiten am Morgen und 6 am Abend. Wie viele zusammen?", 6, "+", 6, [11, 13],
      "Das ist eine Verdopplungsaufgabe: 6 + 6."),
    sach("Noah pflückt 8 Äpfel, Lena 8 Birnen. Wie viele Früchte sind das?", 8, "+", 8, [15, 18],
      "Das ist eine Verdopplungsaufgabe: 8 + 8."),
  ];
  const hard = verzahnen(uebergang, uebergangBild, doppelt, geschichtenH, nachbar);

  return { easy, hard };
}

/* ============================================================
   4) MINUS BIS 20
   ============================================================ */

function minusPool(rng) {
  /* --- easy: ohne Zehnerübergang --- */
  const bis10 = mischen(bereich(4, 9).flatMap((a) => bereich(2, a - 2).map((b) => [a, b])), rng);
  const tippBis10 = (a, b, i) => (i % 2 ? `Denk an die Plusaufgabe: Welche Zahl plus ${b} ergibt ${a}?`
    : `Zähle von der ${a} aus ${b} Schritte zurück.`);
  const fehlerBis10 = (a, b, i) => [[a + b, a - b + 1], [a - b - 1, a - b + 1], [a + b, a - b - 1]][i % 3];
  const klein = [
    ...bis10.slice(0, 9).map(([a, b], i) => rechnung(a, "-", b, fehlerBis10(a, b, i), tippBis10(a, b, i))),
    rechnung(7, "-", 0, [0, 6], "Minus null heißt: Es wird nichts weggenommen."),
    rechnung(6, "-", 6, [6, 1], "Wenn du alles wegnimmst, bleibt nichts übrig."),
    rechnung(8, "-", 1, [9, 6], "Minus 1 ist immer die Zahl davor beim Zählen."),
  ];
  const vonZehn = ziehen(bereich(2, 8), 4, rng).map((b, i) => rechnung(10, "-", b, i % 2 ? [10 - b + 1, b] : [10 - b - 1, 10 - b + 1],
    `Verliebte Zahlen helfen: ${b} und wie viel sind zusammen 10?`));
  const geschichten = [
    sach("Lena hat 9 Kekse. Sie isst 3 davon. Wie viele sind noch da?", 9, "-", 3, [12, 5],
      "„Isst“ heißt: Es werden weniger – rechne 9 minus 3."),
    sach("Auf dem Teich schwimmen 7 Enten. 3 fliegen weg. Wie viele bleiben?", 7, "-", 3, [10, 3],
      "„Weg“ heißt minus – zähle von der 7 aus 3 Schritte zurück."),
    sach("Ben hat 8 Luftballons. 2 platzen. Wie viele hat er noch?", 8, "-", 2, [10, 5],
      "Es werden weniger – zähle von der 8 aus 2 Schritte zurück."),
  ];
  const teen = mischen(bereich(12, 19).flatMap((a) => bereich(2, a % 10).map((b) => [a, b])), rng);
  const fehlerTeen = (r, i) => [[r - 10, r + 1], [r - 10, r - 1], [r + 1, r - 1]][i % 3];
  const ohne = teen.slice(0, 7).map(([a, b], i) => rechnung(a, "-", b, fehlerTeen(a - b, i),
    `Rechne erst die kleine Aufgabe ${a % 10} − ${b} – der Zehner bleibt stehen.`));
  const minusZehn = ziehen(bereich(12, 19), 2, rng).map((a) => rechnung(a, "-", 10, [a - 10 + 1, 10],
    "Nimm den ganzen Zehner weg – übrig bleiben nur die Einer."));
  const geschichten2 = [
    sach("Ali hat 16 Murmeln. Er verschenkt 5. Wie viele hat er noch?", 16, "-", 5, [1, 12],
      "Rechne erst 6 − 5 – der Zehner bleibt stehen."),
    sach("Im Korb liegen 18 Nüsse. Ida nimmt 6 heraus. Wie viele bleiben?", 18, "-", 6, [2, 13],
      "Rechne erst 8 − 6 – der Zehner bleibt stehen."),
  ];
  const easy = [...verzahnen(klein, geschichten), ...verzahnen(ohne, vonZehn, minusZehn, geschichten2)];

  /* --- hard: mit Zehnerübergang, Halbieren --- */
  const ueber = mischen(bereich(11, 18).flatMap((a) => bereich((a % 10) + 1, 9)
    .filter((b) => a !== 2 * b).map((b) => [a, b])), rng);
  // typische Fehler: Einer „verkehrt herum“ abgezogen (13 − 5 → 12), Zehner stehen gelassen (→ 18), ±1
  const fehlerUeber = (a, b, i) => {
    const r = a - b;
    return [[10 + b - (a % 10), r + 1], [r - 1, r + 10], [10 + b - (a % 10), r - 1], [r + 1, r - 1]][i % 4];
  };
  const tippUeber = (a, b) => `Rechne erst zurück zur 10: ${a} − ${a % 10} = 10, dann noch ${b - (a % 10)} weg.`;
  const uebergang = ueber.slice(0, 10).map(([a, b], i) => rechnung(a, "-", b, fehlerUeber(a, b, i), tippUeber(a, b)));
  const uebergangBild = ueber.slice(10, 14).map(([a, b], i) => {
    const e = a % 10;
    const rest = b - e;
    return rechnung(a, "-", b, fehlerUeber(a, b, i + 1),
      `Nimm erst ${e === 1 ? "das eine blaue Plättchen" : `die ${e} blauen Plättchen`} weg, dann noch ${rest === 1 ? "1 rotes" : `${rest} rote`}.`,
      { art: "zwanzig", rot: 10, blau: e });
  });
  const tippHalb = (n) => `Halbieren ist Verdoppeln rückwärts: Welche Zahl plus sich selbst ergibt ${n}?`;
  const haelfte = [12, 16, 10, 20, 14, 18].map((n) => sach(`Was ist die Hälfte von ${n}?`, n, "-", n / 2,
    [n - 2, n / 2 + 1], tippHalb(n)));
  const doppelRueck = ziehen([12, 14, 16, 18], 3, rng).map((a) => rechnung(a, "-", a / 2, [a / 2 + 1, a / 2 - 1],
    `Denk ans Verdoppeln: ${a / 2} + ${a / 2} = ${a}.`));
  const vonZwanzig = ziehen(bereich(2, 9), 3, rng).map((b, i) => rechnung(20, "-", b, i % 2 ? [10 - b, 20 - b + 1] : [10 + b, 20 - b - 1],
    `Rechne erst 10 − ${b} – ein voller Zehner bleibt noch übrig.`));
  const geschichtenH = [
    sach("Im Bus sitzen 15 Kinder. 7 steigen aus. Wie viele sitzen noch im Bus?", 15, "-", 7, [12, 9],
      "„Aussteigen“ heißt minus: 15 − 5 = 10, dann noch 2 weg."),
    sach("Tom hat 13 Karten. 4 verliert er. Wie viele Karten hat er noch?", 13, "-", 4, [11, 17],
      "Rechne erst zurück zur 10: 13 − 3 = 10, dann noch 1 weg."),
    sach("Mia und Ben teilen 12 Kekse gerecht. Wie viele bekommt jeder?", 12, "-", 6, [10, 5],
      "Gerecht teilen heißt halbieren: Welche Zahl plus sich selbst ergibt 12?"),
    sach("Auf der Leine hängen 11 Socken. 3 fallen ab. Wie viele hängen noch?", 11, "-", 3, [12, 14],
      "Rechne erst zurück zur 10: 11 − 1 = 10, dann noch 2 weg."),
    sach("Emma hat 14 Erdbeeren. Sie isst die Hälfte. Wie viele isst sie?", 14, "-", 7, [12, 8],
      "Denk ans Verdoppeln: 7 + 7 = 14."),
  ];
  const hard = verzahnen(uebergang, uebergangBild, haelfte, geschichtenH, doppelRueck, vonZwanzig);

  return { easy, hard };
}

/* ============================================================
   5) GELD BIS 20 EURO
   Werte im Bild in Cent: 100/200 = Euro-Münzen, ab 500 = Scheine.
   ============================================================ */

const summe = (werte) => werte.reduce((s, w) => s + w, 0);
const euro = (n) => `${n} Euro`;
const cent = (n) => `${n} Cent`;

// Kurzschreiber: Geld im Bild zählen (Summe wird im Test aus bild.werte nachgerechnet).
function geldZaehlen(werte, i) {
  const inEuro = werte.every((w) => w >= 100);
  const teiler = inEuro ? 100 : 1;
  const s = summe(werte) / teiler;
  const stufen = [];
  werte.forEach((w) => stufen.push((stufen[stufen.length - 1] || 0) + w / teiler));
  const letzter = werte[werte.length - 1] / teiler;
  // typische Fehler: Stücke gezählt statt Werte, letzte Münze vergessen, um 1 verzählt
  const zahlen = falsch(s, i % 2 ? [s - letzter, s + 1] : [werte.length, s - 1], { min: 1 });
  return {
    f: "Wie viel Geld ist das?", r: inEuro ? euro(s) : cent(s),
    x: inEuro ? zahlen.map(euro) : [euro(s), cent(Number(zahlen[0]))],
    tipp: inEuro ? `Beginne beim größten Wert und zähle weiter: ${stufen.slice(0, -1).join(", ")} …`
      : `Beginne bei der größten Münze und zähle weiter: ${stufen.slice(0, -1).join(", ")} …`,
    bild: { art: "muenzen", werte },
  };
}

const REICHT = ["Ja, genau", "Ja, sogar mehr", "Nein, zu wenig"];
// Kurzschreiber: „Reicht das Geld?“ – das Kind zählt und vergleicht mit dem Preis.
function reicht(name, ding, werte, preis) {
  const hat = summe(werte) / 100;
  const r = hat === preis ? REICHT[0] : hat > preis ? REICHT[1] : REICHT[2];
  return {
    f: `${name} hat dieses Geld. ${ding} kostet ${preis} Euro. Reicht das?`, r, x: REICHT.filter((o) => o !== r),
    tipp: `Zähle zuerst das Geld und vergleiche es dann mit dem Preis von ${preis} Euro.`,
    bild: { art: "muenzen", werte },
  };
}
const werHatGenug = (ding, preis, [n, hat], [n1, h1], [n2, h2]) => ({
  f: `${ding} kostet ${preis} Euro. Wer hat genug Geld?`, r: `${n} mit ${hat} Euro`,
  x: [`${n1} mit ${h1} Euro`, `${n2} mit ${h2} Euro`],
  tipp: "Genug Geld hat, wer mindestens so viel hat wie der Preis.",
});
const wasKaufen = (name, pronomen, werte, [ding, p], [d1, p1], [d2, p2]) => ({
  f: `${name} hat dieses Geld. Was kann ${pronomen} davon kaufen?`, r: `${ding} für ${p} Euro`,
  x: [`${d1} für ${p1} Euro`, `${d2} für ${p2} Euro`],
  tipp: "Zähle zuerst das Geld – der Preis darf nicht größer sein.",
  bild: { art: "muenzen", werte },
});
const passend = (ding, preis, einheit, r, x1, x2, tipp) => ({
  f: `${ding} kostet ${preis} ${einheit}. Womit bezahlst du passend?`,
  r: r.map((w) => `${w} ${einheit}`).join(" + "),
  x: [x1, x2].map((p) => p.map((w) => `${w} ${einheit}`).join(" + ")), tipp,
});
const tippPassend = "Rechne die Werte zusammen – passend ist es, wenn genau der Preis herauskommt.";

function geldPool(rng) {
  /* --- easy: Euro-Münzen und -Scheine bis 10 Euro --- */
  const saetze = mischen([
    [100, 100], [200, 100], [200, 200], [200, 200, 100], [500, 100], [500, 200], [500, 200, 100],
    [500, 200, 200], [500, 500], [200, 100, 100], [500, 200, 200, 100], [100, 100, 100], [200, 200, 200],
  ], rng);
  const zaehlen = saetze.slice(0, 9).map(geldZaehlen);
  const kennen = [
    { f: "Was ist am meisten wert?", r: "10 Euro", x: ["5 Euro", "2 Euro"],
      tipp: "Die Zahl auf dem Geld sagt dir den Wert – die größte Zahl gewinnt." },
    { f: "Welches Geld ist ein Schein?", r: "5 Euro", x: ["1 Euro", "2 Euro"],
      tipp: "1 Euro und 2 Euro sind Münzen – ab 5 Euro gibt es Scheine." },
    { f: "Wie viele 1-Euro-Münzen sind so viel wert wie eine 2-Euro-Münze?", r: "2", x: ["1", "3"],
      tipp: "Rechne 1 Euro + 1 Euro.", sprich: "Wie viele Ein-Euro-Münzen sind so viel wert wie eine Zwei-Euro-Münze?" },
    { f: "Was ist am wenigsten wert?", r: "1 Euro", x: ["2 Euro", "5 Euro"],
      tipp: "Die Zahl auf dem Geld sagt dir den Wert – die kleinste Zahl ist am wenigsten." },
    { f: "Wie viele 1-Euro-Münzen bekommst du für einen 5-Euro-Schein?", r: "5", x: ["1", "4"],
      tipp: "Zähle in Euro-Schritten bis zur 5.", sprich: "Wie viele Ein-Euro-Münzen bekommst du für einen Fünf-Euro-Schein?" },
  ];
  const reichen = [
    reicht("Mia", "Der Ball", [500, 200], 6),
    werHatGenug("Das Buch", 7, ["Lena", 8], ["Ben", 6], ["Tom", 5]),
    wasKaufen("Emma", "sie", [200, 200, 100], ["Seil", 4], ["Ball", 6], ["Buch", 8]),
    reicht("Ali", "Das Auto", [200, 200], 5),
    reicht("Ida", "Die Puppe", [500, 200, 200], 9),
    werHatGenug("Das Eis", 3, ["Noah", 3], ["Mia", 2], ["Ali", 1]),
    wasKaufen("Tom", "er", [500, 100], ["Ball", 6], ["Spiel", 9], ["Buch", 7]),
  ];
  const bezahlen = [
    passend("Der Ball", 7, "Euro", [5, 2], [5, 1], [2, 2], tippPassend),
    passend("Das Heft", 3, "Euro", [2, 1], [2, 2], [1, 1], tippPassend),
    passend("Das Auto", 6, "Euro", [5, 1], [5, 2], [2, 2], tippPassend),
    passend("Der Stift", 4, "Euro", [2, 2], [2, 1], [5, 1], tippPassend),
    passend("Das Spiel", 10, "Euro", [5, 5], [5, 2], [2, 2], tippPassend),
  ];
  const rechnen = [
    { f: "Ein Heft kostet 2 Euro, ein Stift 3 Euro. Wie viel kostet beides?", r: "5 Euro", x: ["1 Euro", "6 Euro"],
      tipp: "„Beides“ heißt zusammenrechnen: 2 plus 3." },
    { f: "Mia hat 5 Euro. Oma schenkt ihr 2 Euro. Wie viel hat sie jetzt?", r: "7 Euro", x: ["3 Euro", "8 Euro"],
      tipp: "Geschenkt bekommen heißt plus: 5 plus 2." },
    { f: "Ben hat 8 Euro. Er kauft ein Eis für 2 Euro. Wie viel bleibt ihm?", r: "6 Euro", x: ["10 Euro", "5 Euro"],
      tipp: "Beim Bezahlen wird das Geld weniger: 8 minus 2." },
    { f: "Tom hat 4 Euro. Das Spiel kostet 9 Euro. Wie viel fehlt ihm noch?", r: "5 Euro", x: ["4 Euro", "6 Euro"],
      tipp: "Zähle von der 4 weiter bis zur 9 – so viel fehlt." },
    { f: "Ida spart 3 Euro und noch einmal 3 Euro. Wie viel hat sie jetzt?", r: "6 Euro", x: ["3 Euro", "5 Euro"],
      tipp: "Das ist eine Verdopplungsaufgabe: 3 plus 3." },
  ];
  const easy = verzahnen(zaehlen, kennen, reichen, bezahlen, rechnen);

  /* --- hard: bis 20 Euro, auch Cent-Münzen --- */
  const saetzeH = mischen([
    [1000, 100], [1000, 200, 100], [500, 500, 200, 200], [1000, 500], [1000, 500, 200],
    [1000, 500, 200, 100], [1000, 1000], [1000, 200], [1000, 500, 100], [1000, 500, 200, 200],
  ], rng);
  const zaehlenH = saetzeH.slice(0, 7).map(geldZaehlen);
  const centSaetze = mischen([[10, 5, 2], [5, 2, 2, 1], [10, 10], [5, 5, 2], [10, 2, 2, 1], [10, 5, 1], [5, 2, 1], [10, 5, 5]], rng);
  const centZaehlen = [
    ...centSaetze.slice(0, 6).map(geldZaehlen),
    { f: "Wie viel Geld ist das?", r: "1 Euro", x: ["50 Cent", "2 Euro"],
      tipp: "Zweimal 50 Cent sind 100 Cent – und 100 Cent sind genau 1 Euro.", bild: { art: "muenzen", werte: [50, 50] } },
  ];
  const kennenH = [
    { f: "Welche dieser Münzen ist am meisten wert?", r: "50 Cent", x: ["20 Cent", "5 Cent"],
      tipp: "Nicht die Größe zählt – schau auf die Zahl auf der Münze." },
    { f: "Was ist mehr wert als 50 Cent?", r: "1 Euro", x: ["20 Cent", "10 Cent"],
      tipp: "1 Euro ist so viel wert wie 100 Cent." },
    { f: "Wie viele 10-Cent-Münzen sind so viel wert wie eine 20-Cent-Münze?", r: "2", x: ["1", "10"],
      tipp: "Rechne 10 Cent + 10 Cent.", sprich: "Wie viele Zehn-Cent-Münzen sind so viel wert wie eine Zwanzig-Cent-Münze?" },
    { f: "Wie viele 5-Euro-Scheine sind so viel wert wie ein 10-Euro-Schein?", r: "2", x: ["5", "1"],
      tipp: "Rechne 5 Euro + 5 Euro.", sprich: "Wie viele Fünf-Euro-Scheine sind so viel wert wie ein Zehn-Euro-Schein?" },
    { f: "Wie viele 2-Cent-Münzen sind so viel wert wie eine 10-Cent-Münze?", r: "5", x: ["2", "8"],
      tipp: "Zähle in Zweierschritten bis zur 10: 2, 4, 6, 8, 10.",
      sprich: "Wie viele Zwei-Cent-Münzen sind so viel wert wie eine Zehn-Cent-Münze?" },
  ];
  const reichenH = [
    reicht("Emma", "Der Malkasten", [1000, 500], 12),
    werHatGenug("Das Spiel", 15, ["Ali", 16], ["Emma", 14], ["Noah", 11]),
    reicht("Noah", "Der Drachen", [1000, 200], 14),
    wasKaufen("Lena", "sie", [1000, 200, 100], ["Buch", 12], ["Ball", 14], ["Spiel", 17]),
    reicht("Ben", "Das Stofftier", [1000, 500, 200, 100], 18),
    werHatGenug("Der Rucksack", 19, ["Ida", 20], ["Tom", 18], ["Mia", 9]),
  ];
  const bezahlenH = [
    passend("Das Buch", 12, "Euro", [10, 2], [10, 1], [5, 5], tippPassend),
    passend("Der Ball", 15, "Euro", [10, 5], [10, 2], [5, 5], tippPassend),
    passend("Das Bonbon", 7, "Cent", [5, 2], [5, 1], [2, 2], tippPassend),
    passend("Die Karte", 11, "Euro", [10, 1], [10, 2], [5, 5], tippPassend),
    passend("Der Kaugummi", 15, "Cent", [10, 5], [10, 2], [5, 5], tippPassend),
  ];
  const rechnenH = [
    { f: "Ein Ball kostet 8 Euro, ein Seil 6 Euro. Wie viel kostet beides?", r: "14 Euro", x: ["2 Euro", "13 Euro"],
      tipp: "Rechne erst bis zur 10: 8 + 2 = 10, dann noch 4 dazu." },
    { f: "Tom zahlt 12 Euro mit einem 20-Euro-Schein. Was bekommt er zurück?", r: "8 Euro", x: ["18 Euro", "7 Euro"],
      tipp: "Zähle von 12 weiter bis 20 – so viel bekommt er zurück.",
      sprich: "Tom zahlt 12 Euro mit einem Zwanzig-Euro-Schein. Was bekommt er zurück?" },
    { f: "Emma hat 13 Euro. Das Buch kostet 9 Euro. Wie viel bleibt übrig?", r: "4 Euro", x: ["6 Euro", "5 Euro"],
      tipp: "Rechne erst zurück zur 10: 13 − 3 = 10, dann noch 6 weg." },
    { f: "Noah hat 7 Euro gespart. Opa gibt ihm 5 Euro. Wie viel hat er jetzt?", r: "12 Euro", x: ["2 Euro", "11 Euro"],
      tipp: "Rechne erst bis zur 10: 7 + 3 = 10, dann noch 2 dazu." },
    { f: "Ida hat 9 Euro. Das Spiel kostet 15 Euro. Wie viel fehlt ihr noch?", r: "6 Euro", x: ["7 Euro", "5 Euro"],
      tipp: "Zähle von 9 weiter: 1 bis zur 10, dann noch 5 bis zur 15." },
    { f: "Ein Bonbon kostet 5 Cent, ein Lolli 10 Cent. Wie viel kostet beides?", r: "15 Cent", x: ["15 Euro", "5 Cent"],
      tipp: "„Beides“ heißt zusammenrechnen – und die Einheit bleibt Cent." },
  ];
  const hard = verzahnen(zaehlenH, centZaehlen, reichenH, kennenH, bezahlenH, rechnenH);

  return { easy, hard };
}

/* ============================================================
   6) FORMEN & MUSTER
   ============================================================ */

const FORM = {
  kreis: { name: "Kreis", mehr: "Kreise", artikel: "der", ecken: 0 },
  dreieck: { name: "Dreieck", mehr: "Dreiecke", artikel: "das", ecken: 3 },
  quadrat: { name: "Quadrat", mehr: "Quadrate", artikel: "das", ecken: 4 },
  rechteck: { name: "Rechteck", mehr: "Rechtecke", artikel: "das", ecken: 4 },
};
const FARBE = { rot: "rot", blau: "blau", gelb: "gelb", gruen: "grün" };
// Quadrat und Rechteck stehen nie im selben Muster – sie sehen sich zu ähnlich.
const FORM_GRUPPEN = [["kreis", "dreieck", "quadrat"], ["kreis", "dreieck", "rechteck"]];

/** "kreis:rot" → "roter Kreis", "dreieck" → "Dreieck" */
function formName(teil) {
  const [form, farbe] = teil.split(":");
  const { name, artikel } = FORM[form];
  return farbe ? `${FARBE[farbe]}${artikel === "der" ? "er" : "es"} ${name}` : name;
}

// Kurzschreiber: Muster aus einer Einheit (z. B. A-B-B), die sich wiederholt; eine Stelle ist „?“.
function muster(einheit, laenge, stelle, ersatz) {
  const voll = Array.from({ length: laenge }, (_, k) => einheit[k % einheit.length]);
  const loesung = voll[stelle];
  const andere = [...new Set(einheit)].filter((t) => t !== loesung);
  return {
    f: stelle === laenge - 1 ? "Wie geht das Muster weiter?" : "Welche Form fehlt im Muster?",
    r: formName(loesung), x: [...andere, ersatz].slice(0, 2).map(formName),
    tipp: `Sprich das Muster laut mit: ${einheit.map(formName).join(", ")} – und wieder von vorn.`,
    bild: { art: "formen", folge: voll.map((t, k) => (k === stelle ? "?" : t)) },
  };
}

// Baut Muster nach Bauplänen; Formen und Farben wählt der Zufall, doppelte Bilder werden neu gezogen.
function musterReihe(plaene, rng) {
  const gesehen = new Set();
  return plaene.map(({ bau, laenge, stelle, art }) => {
    for (;;) {
      const [a, b, c] = mischen(mischen(FORM_GRUPPEN, rng)[0], rng);
      const [fa, fb, fc, fd] = mischen(Object.keys(FARBE), rng);
      const teile = art === "form" ? { A: a, B: b, C: c, X: c }
        : art === "farbe" ? { A: `${a}:${fa}`, B: `${a}:${fb}`, C: `${a}:${fc}`, X: `${a}:${fd}` }
          : { A: `${a}:${fa}`, B: `${b}:${fb}`, C: `${c}:${fc}`, X: `${c}:${fc}` };
      const einheit = [...bau].map((z) => teile[z]);
      // Ersatz-Distraktor, falls das Muster nur zwei verschiedene Teile hat
      const aufgabe = muster(einheit, laenge, stelle, bau.includes("C") ? teile.A : teile.X);
      const schluessel = aufgabe.f + aufgabe.bild.folge.join(",");
      if (gesehen.has(schluessel)) continue;
      gesehen.add(schluessel);
      return aufgabe;
    }
  });
}

const formWahl = (f, form, x, tipp, bild) => ({ f, r: FORM[form].name, x: x.map((k) => FORM[k].name), tipp, ...(bild ? { bild } : {}) });

function formenPool(rng) {
  /* --- easy: Formen erkennen, Ecken zählen, AB-Muster --- */
  const farben = mischen(Object.keys(FARBE), rng);
  const erkennen = [
    formWahl("Wie heißt diese Form?", "kreis", ["dreieck", "quadrat"], "Diese Form ist rund und hat keine einzige Ecke."),
    formWahl("Wie heißt diese Form?", "dreieck", ["kreis", "rechteck"], "Zähle die Ecken – es sind genau drei."),
    formWahl("Wie heißt diese Form?", "quadrat", ["dreieck", "kreis"], "Vier Ecken und vier gleich lange Seiten."),
    formWahl("Wie heißt diese Form?", "rechteck", ["quadrat", "dreieck"], "Vier Ecken – zwei Seiten sind lang und zwei sind kurz."),
  ].map((a, i) => ({ ...a, bild: { art: "formen", folge: [`${Object.keys(FORM)[i]}:${farben[i]}`] } }));
  const wissen = [
    formWahl("Welche Form ist rund und hat keine Ecke?", "kreis", ["dreieck", "quadrat"], "Fahre die Form in Gedanken mit dem Finger nach – nirgends ist eine Spitze."),
    { f: "Wie viele Ecken hat ein Dreieck?", r: "3", x: ["4", "2"], tipp: "Das Wort verrät es schon: Drei-Eck." },
    { f: "Wie viele Ecken hat ein Quadrat?", r: "4", x: ["3", "5"], tipp: "Tippe in Gedanken jede Ecke einmal an und zähle mit." },
    formWahl("Welche Form hat genau 3 Ecken?", "dreieck", ["quadrat", "kreis"], "Im Namen der Form steckt die Zahl Drei."),
    { f: "Wie viele Ecken hat ein Kreis?", r: "keine", x: ["1", "4"], tipp: "Ein Kreis ist überall rund – da ist nirgends eine Spitze." },
    formWahl("Bei welcher Form sind alle 4 Seiten gleich lang?", "quadrat", ["rechteck", "dreieck"], "Beim Rechteck sind zwei Seiten länger – bei dieser Form sind alle gleich."),
    { f: "Wie viele Ecken hat ein Rechteck?", r: "4", x: ["3", "2"], tipp: "Ein Rechteck hat genauso viele Ecken wie ein Quadrat." },
    formWahl("Welche Form hat 2 lange und 2 kurze Seiten?", "rechteck", ["quadrat", "dreieck"], "Denk an eine Tür: oben und unten kurz, links und rechts lang."),
    { f: "Wie viele Seiten hat ein Dreieck?", r: "3", x: ["4", "1"], tipp: "Ein Dreieck hat genauso viele Seiten wie Ecken." },
  ];
  // Formen im Bild zählen: die gesuchte Form c-mal, dazu zwei andere Formen als Ablenkung.
  const anzahlen = mischen([[2, 3, 1], [3, 2, 1], [4, 1, 1], [3, 1, 2]], rng);
  const zaehlen = Object.keys(FORM).map((ziel, i) => {
    const [c, d, e] = anzahlen[i];
    const [b1, b2] = mischen(Object.keys(FORM).filter((k) => k !== ziel && !(ziel === "quadrat" && k === "rechteck") && !(ziel === "rechteck" && k === "quadrat")), rng);
    const teile = [...Array(c).fill(ziel), ...Array(d).fill(b1), ...Array(e).fill(b2)];
    return {
      f: `Wie viele ${FORM[ziel].mehr} siehst du?`, r: String(c), x: falsch(c, [d, c + d + e, c + 1], { min: 1 }),
      tipp: `Zähle nur die ${FORM[ziel].mehr}, die anderen Formen lässt du aus.`,
      bild: { art: "formen", folge: mischen(teile, rng) },
    };
  });
  const suchTipp = {
    kreis: "Suche die runde Form ohne Ecken.", dreieck: "Suche die Form mit drei Ecken.",
    quadrat: "Suche die Form mit vier gleich langen Seiten.", rechteck: "Suche die Form mit zwei langen und zwei kurzen Seiten.",
  };
  const farbFrage = [["kreis", 0], ["rechteck", 1], ["dreieck", 0]].map(([gesucht, g]) => {
    const formen = mischen(FORM_GRUPPEN[g], rng);
    const bunt = mischen(Object.keys(FARBE), rng).slice(0, 3);
    const ziel = formen.indexOf(gesucht);
    return {
      f: `Welche Farbe hat ${FORM[gesucht].artikel} ${FORM[gesucht].name}?`, r: FARBE[bunt[ziel]],
      x: bunt.filter((_, k) => k !== ziel).map((k) => FARBE[k]), tipp: suchTipp[gesucht],
      bild: { art: "formen", folge: formen.map((k, j) => `${k}:${bunt[j]}`) },
    };
  });
  const musterEasy = musterReihe([
    { bau: "AB", laenge: 6, stelle: 5, art: "form" },
    { bau: "AB", laenge: 5, stelle: 4, art: "form" },
    { bau: "AB", laenge: 6, stelle: 5, art: "farbe" },
    { bau: "AB", laenge: 6, stelle: 2, art: "form" },
    { bau: "AB", laenge: 5, stelle: 4, art: "farbe" },
    { bau: "AB", laenge: 6, stelle: 5, art: "bunt" },
    { bau: "AB", laenge: 6, stelle: 3, art: "form" },
    { bau: "AB", laenge: 6, stelle: 4, art: "farbe" },
    { bau: "AB", laenge: 5, stelle: 4, art: "bunt" },
  ], rng);
  const easy = verzahnen(erkennen, musterEasy, wissen, zaehlen, farbFrage);

  /* --- hard: längere Muster (ABB, AAB, AABB, ABC), Formen in der Umwelt --- */
  const musterHard = musterReihe([
    { bau: "ABB", laenge: 7, stelle: 6, art: "form" },
    { bau: "ABC", laenge: 7, stelle: 6, art: "form" },
    { bau: "AABB", laenge: 7, stelle: 6, art: "form" },
    { bau: "AAB", laenge: 6, stelle: 5, art: "form" },
    { bau: "ABC", laenge: 6, stelle: 5, art: "farbe" },
    { bau: "ABB", laenge: 6, stelle: 5, art: "farbe" },
    { bau: "ABC", laenge: 6, stelle: 4, art: "form" },
    { bau: "AABB", laenge: 8, stelle: 7, art: "farbe" },
    { bau: "AAB", laenge: 8, stelle: 7, art: "bunt" },
    { bau: "ABC", laenge: 7, stelle: 6, art: "bunt" },
    { bau: "ABB", laenge: 6, stelle: 3, art: "form" },
  ], rng);
  const umwelt = [
    formWahl("Die Uhr im Klassenzimmer ist rund. Welche Form hat sie?", "kreis", ["quadrat", "dreieck"], "Runde Dinge ohne Ecken haben diese Form."),
    formWahl("Welche Form hat eine Tür?", "rechteck", ["quadrat", "kreis"], "Eine Tür hat vier Ecken und ist höher als breit."),
    formWahl("Welche Form hat ein Rad am Fahrrad?", "kreis", ["quadrat", "dreieck"], "Nur eine runde Form kann gut rollen."),
    formWahl("Welche Form hat ein Zelt, wenn du es von vorn ansiehst?", "dreieck", ["kreis", "quadrat"], "Das Zelt läuft oben spitz zusammen – zähle die Ecken."),
    formWahl("Welche Form hat ein Geldschein?", "rechteck", ["quadrat", "kreis"], "Ein Geldschein hat vier Ecken und ist länger als hoch."),
    formWahl("Welche Form hat eine Seite vom Spielwürfel?", "quadrat", ["kreis", "dreieck"], "Jede Würfelseite hat vier Ecken und vier gleich lange Seiten."),
    formWahl("Welche Form hat eine Münze?", "kreis", ["rechteck", "dreieck"], "Eine Münze ist rund und hat keine Ecke."),
    formWahl("Welche Form hat dein Schulheft?", "rechteck", ["kreis", "dreieck"], "Dein Heft hat vier Ecken, zwei lange und zwei kurze Seiten."),
    formWahl("Welche Form hat ein Feld auf dem Schachbrett?", "quadrat", ["kreis", "dreieck"], "Jedes Feld hat vier Ecken und ist so breit wie hoch."),
    formWahl("Welche Form hat ein Teller, wenn du von oben schaust?", "kreis", ["rechteck", "dreieck"], "Fahre in Gedanken den Tellerrand nach – er ist überall rund."),
  ];
  const eckenTipp = "Zähle die Ecken jeder Form einzeln und rechne sie dann zusammen.";
  const ecken = [
    { f: "Wie viele Ecken haben beide Formen zusammen?", r: "6", x: ["3", "5"], tipp: eckenTipp, bild: { art: "formen", folge: ["dreieck", "dreieck"] } },
    { f: "Wie viele Ecken haben beide Formen zusammen?", r: "7", x: ["4", "8"], tipp: eckenTipp, bild: { art: "formen", folge: ["quadrat", "dreieck"] } },
    { f: "Wie viele Ecken haben beide Formen zusammen?", r: "3", x: ["4", "2"], tipp: "Der Kreis hat keine Ecke – es zählen nur die Ecken vom Dreieck.", bild: { art: "formen", folge: ["dreieck", "kreis"] } },
    { f: "Wie viele Ecken haben beide Formen zusammen?", r: "8", x: ["4", "6"], tipp: eckenTipp, bild: { art: "formen", folge: ["rechteck", "quadrat"] } },
    { f: "Wie viele Ecken haben alle Formen zusammen?", r: "9", x: ["3", "6"], tipp: "Rechne 3 + 3 + 3 – jedes Dreieck bringt drei Ecken mit.", bild: { art: "formen", folge: ["dreieck", "dreieck", "dreieck"] } },
  ];
  const legen = [
    { ...formWahl("Du legst zwei gleiche Quadrate aneinander. Welche Form entsteht?", "rechteck", ["quadrat", "dreieck"],
      "Die neue Form ist doppelt so breit wie hoch – zwei Seiten sind jetzt länger."), bild: { art: "formen", folge: ["quadrat", "quadrat"] } },
    { f: "Du schneidest ein Quadrat von Ecke zu Ecke durch. Was entsteht?", r: "zwei Dreiecke", x: ["zwei Quadrate", "zwei Rechtecke"],
      tipp: "Der Schnitt läuft schräg – zähle die Ecken von einem der beiden Teile." },
    formWahl("Welche dieser Formen hat die meisten Ecken?", "quadrat", ["dreieck", "kreis"], "Vergleiche: keine Ecke, drei Ecken oder vier Ecken."),
  ];
  const hard = verzahnen(musterHard, umwelt, ecken, legen);

  return { easy, hard };
}

/* ============================================================
   7) UHR: VOLLE STUNDEN
   ============================================================ */

const nachStunde = (h) => (h % 12) + 1;
const vorStunde = (h) => ((h + 10) % 12) + 1;
const uhrBild = (h, m = "00") => ({ art: "uhr", zeit: `${h}:${m}` });
const uhr = (h) => `${h} Uhr`;

function uhrPool(rng) {
  /* --- easy: Ziffernblatt mit vollen Stunden lesen --- */
  const lesen = mischen(bereich(1, 12), rng).map((h, i) => ({
    f: "Wie spät ist es?", r: uhr(h),
    // typische Fehler: Zeiger verwechselt (der große steht auf der 12) oder um eine Zahl verrutscht
    x: i % 2 && ![1, 11, 12].includes(h) ? [uhr(12), uhr(nachStunde(h))] : [uhr(nachStunde(h)), uhr(vorStunde(h))],
    tipp: i % 2 ? "Der große Zeiger steht auf der 12 – das heißt volle Stunde, der kleine zeigt dir welche."
      : "Schau auf den kleinen Zeiger – er zeigt genau auf die Stunde.",
    bild: uhrBild(h),
  }));
  const alltag = [
    ["Die Uhr zeigt, wann die Schule beginnt. Wie spät ist es dann?", 8, [9, 12]],
    ["Die Uhr zeigt, wann Mia aufsteht. Wie spät ist es dann?", 7, [6, 12]],
    ["Die Uhr zeigt, wann Ben zu Mittag isst. Wie spät ist es dann?", 12, [11, 1]],
    ["Die Uhr zeigt, wann Tom zum Fußball geht. Wie spät ist es dann?", 4, [5, 3]],
    ["Die Uhr zeigt, wann es Abendessen gibt. Wie spät ist es dann?", 6, [12, 7]],
    ["Die Uhr zeigt, wann die große Pause beginnt. Wie spät ist es dann?", 10, [9, 11]],
  ].map(([f, h, x]) => ({
    f, r: uhr(h), x: x.map(uhr), tipp: "Der kleine Zeiger zeigt die Stunde, der große steht bei der vollen Stunde auf der 12.", bild: uhrBild(h),
  }));
  const beschrieben = ziehen([2, 3, 5, 9, 10], 3, rng).map((h) => ({
    f: `Kleiner Zeiger auf der ${h}, großer Zeiger auf der 12. Wie spät ist es?`, r: uhr(h), x: [uhr(12), uhr(nachStunde(h))],
    tipp: "Der kleine Zeiger ist der Stundenzeiger – seine Zahl nennt die Uhrzeit.",
  }));
  const [k1, k2] = ziehen([2, 4, 5, 7, 8, 10], 2, rng);
  const wissen = [
    { f: "Welcher Zeiger zeigt dir die Stunde?", r: "der kleine", x: ["der große", "der dünne"],
      tipp: "Der kleine Zeiger ist der Stundenzeiger – er wandert langsam von Zahl zu Zahl." },
    { f: "Wohin zeigt der große Zeiger bei jeder vollen Stunde?", r: "auf die 12", x: ["auf die 6", "auf die 1"],
      tipp: "Bei der vollen Stunde steht der große Zeiger ganz oben." },
    { f: `Wohin zeigt der kleine Zeiger um ${k1} Uhr?`, r: `auf die ${k1}`, x: ["auf die 12", `auf die ${k1 + 1}`],
      tipp: "Der kleine Zeiger zeigt immer auf die Zahl der Stunde." },
    { f: "Wie viele Zahlen stehen auf dem Ziffernblatt?", r: "12", x: ["10", "24"],
      tipp: "Zähle einmal rund um die Uhr – von der 1 bis ganz nach oben." },
    { f: "Welche Zahl steht auf der Uhr ganz oben?", r: "12", x: ["1", "6"],
      tipp: "Ganz oben steht die größte Zahl der Uhr." },
    { f: `Wohin zeigt der kleine Zeiger um ${k2} Uhr?`, r: `auf die ${k2}`, x: [`auf die ${k2 - 1}`, "auf die 12"],
      tipp: "Der kleine Zeiger zeigt immer auf die Zahl der Stunde." },
    { f: "Welche Zahl steht auf der Uhr ganz unten?", r: "6", x: ["12", "9"],
      tipp: "Die 6 steht genau gegenüber von der 12." },
  ];
  const easy = verzahnen(lesen, [...alltag, ...beschrieben], wissen);

  /* --- hard: Tageszeiten, eine Stunde später, Ausblick halbe Stunden --- */
  const tag = (f, r, tipp, bild) => ({
    f, r, x: ["morgens", "mittags", "abends"].filter((t) => t !== r), tipp, ...(bild ? { bild } : {}),
  });
  const tageszeiten = [
    tag("Wann frühstückst du?", "morgens", "Das Frühstück ist das erste Essen nach dem Aufstehen."),
    tag("Wann gehst du schlafen?", "abends", "Schlafen gehst du, wenn der Tag zu Ende ist und es dunkel wird."),
    tag("Wann ist die Schule aus und es gibt Mittagessen?", "mittags", "Im Wort Mittagessen steckt die Tageszeit schon drin."),
    tag("Es ist 7 Uhr und du stehst gerade auf. Welche Tageszeit ist es?", "morgens", "Nach dem Aufstehen beginnt dein Tag."),
    tag("Es ist 7 Uhr und draußen wird es dunkel. Welche Tageszeit ist es?", "abends", "Wenn es dunkel wird, geht der Tag zu Ende."),
    tag("Wann geht die Sonne auf?", "morgens", "Mit dem Sonnenaufgang beginnt der Tag."),
    tag("Die Schule fängt an. Welche Tageszeit ist es?", "morgens", "Die Schule beginnt am Anfang des Tages.", uhrBild(8)),
    tag("Wann geht die Sonne unter?", "abends", "Mit dem Sonnenuntergang geht der Tag zu Ende."),
    tag("Es ist 12 Uhr und die Sonne steht ganz hoch. Welche Tageszeit ist es?", "mittags", "In der Mitte des Tages steht die Sonne am höchsten."),
  ];
  const stunden = mischen(bereich(2, 10), rng);
  const spaeter = [12, 11, ...stunden.slice(0, 4)].map((h) => ({
    f: "Wie spät ist es eine Stunde später?", r: uhr(nachStunde(h)), x: [uhr(h), uhr(vorStunde(h))],
    tipp: h === 12 ? "Nach der 12 fängt die Uhr wieder bei der 1 an." : "In einer Stunde wandert der kleine Zeiger genau eine Zahl weiter.",
    bild: uhrBild(h),
  }));
  const frueher = [1, ...stunden.slice(4, 6)].map((h) => ({
    f: "Wie spät war es vor einer Stunde?", r: uhr(vorStunde(h)), x: [uhr(h), uhr(nachStunde(h))],
    tipp: h === 1 ? "Vor der 1 steht auf der Uhr die 12." : "Vor einer Stunde stand der kleine Zeiger noch auf der Zahl davor.",
    bild: uhrBild(h),
  }));
  const zweiStunden = stunden.slice(6, 8).map((h) => ({
    f: "Wie spät ist es in 2 Stunden?", r: uhr(nachStunde(nachStunde(h))), x: [uhr(nachStunde(h)), uhr(h)],
    tipp: "In 2 Stunden wandert der kleine Zeiger zwei Zahlen weiter.", bild: uhrBild(h),
  }));
  const geschichten = [
    { f: "Ben kommt um 2 Uhr zum Spielplatz. Er bleibt 2 Stunden. Wann geht er?", r: "um 4 Uhr", x: ["um 3 Uhr", "um 2 Uhr"],
      tipp: "Zähle von der 2 aus zwei Stunden weiter." },
    { f: "Wie lange dauert es von 3 Uhr bis 5 Uhr?", r: "2 Stunden", x: ["8 Stunden", "1 Stunde"],
      tipp: "Zähle die Schritte des kleinen Zeigers von der 3 bis zur 5." },
    { f: "Der Film beginnt um 5 Uhr und dauert 1 Stunde. Wann ist er zu Ende?", r: "um 6 Uhr", x: ["um 5 Uhr", "um 4 Uhr"],
      tipp: "Eine Stunde später steht der kleine Zeiger eine Zahl weiter." },
    { f: "Die Schule geht von 8 Uhr bis 12 Uhr. Wie viele Stunden sind das?", r: "4 Stunden", x: ["5 Stunden", "3 Stunden"],
      tipp: "Zähle die Schritte, nicht die Zahlen: von 8 zu 9 ist der erste Schritt." },
    { f: "Um 3 Uhr steht der kleine Zeiger auf der 3. Wo steht er um 4 Uhr?", r: "auf der 4", x: ["auf der 12", "auf der 3"],
      tipp: "In einer Stunde wandert der kleine Zeiger genau eine Zahl weiter." },
    { f: "Wie lange braucht der große Zeiger für eine ganze Runde?", r: "1 Stunde", x: ["1 Minute", "1 Tag"],
      tipp: "Wenn der große Zeiger einmal herum ist, steht der kleine eine Zahl weiter." },
  ];
  // Ausblick auf Klasse 2 – bewusst nur wenige Aufgaben mit halben Stunden.
  const halb = [
    ...ziehen([2, 3, 5, 7, 9, 12], 4, rng).map((h) => ({
      f: "Der große Zeiger steht auf der 6. Wie spät ist es?", r: `halb ${nachStunde(h)}`, x: [`halb ${h}`, uhr(h)],
      tipp: "Bei halb steht der kleine Zeiger zwischen zwei Zahlen – du nennst die Zahl, die als nächste kommt.",
      bild: uhrBild(h, "30"),
    })),
    { f: "Wohin zeigt der große Zeiger, wenn es halb ist?", r: "auf die 6", x: ["auf die 12", "auf die 3"],
      tipp: "Bei halb hat der große Zeiger eine halbe Runde geschafft – er steht ganz unten." },
  ];
  const hard = [...verzahnen(tageszeiten, spaeter, geschichten, frueher, zweiStunden), ...halb];

  return { easy, hard };
}

/* ============================================================
   Zusammenbau
   ============================================================ */

const BAUER = {
  k1zahlen: zahlenPool, k1zerlegen: zerlegenPool, k1plus: plusPool, k1minus: minusPool,
  k1geld: geldPool, k1formen: formenPool, k1uhr: uhrPool,
};

/** Erzeugt alle Pools neu – jeder Bereich mit eigenem, festem Seed (immer dasselbe Ergebnis). */
export function k1MatheErzeugen() {
  return Object.fromEntries(Object.entries(BAUER).map(([key, bauen]) => [key, bauen(rngAusSeed(key))]));
}

export const K1_MATHE_DATEN = k1MatheErzeugen();

export const K1_MATHE_BEREICHE = [
  { key: "k1zahlen", emoji: "🔢", name: "Zahlen bis 20" },
  { key: "k1zerlegen", emoji: "🧩", name: "Zahlen zerlegen" },
  { key: "k1plus", emoji: "➕", name: "Plus bis 20" },
  { key: "k1minus", emoji: "➖", name: "Minus bis 20" },
  { key: "k1geld", emoji: "💶", name: "Geld bis 20 Euro" },
  { key: "k1formen", emoji: "🔺", name: "Formen & Muster" },
  { key: "k1uhr", emoji: "🕒", name: "Uhr: volle Stunden" },
];
