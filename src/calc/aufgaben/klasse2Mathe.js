/* ============================================================
   🔢 MATHE KLASSE 2 (Bildungsplan Baden-Württemberg):
   Zahlenraum bis 100, Plus und Minus mit Zehnerübergang,
   Einmaleins und Teilen, Geld, Uhr, Längen, Sachaufgaben,
   Spiegeln und Körper.
   Format wie alle Pools: MC mit 2 Falschantworten, Tipp = Rechenweg.
   `easy` = Stoff des 1. Halbjahrs, `hard` = Stoff des 2. Halbjahrs.
   Zahlen-Aufgaben entstehen EINMAL beim Laden aus Generatoren mit
   festem Seed (`rngAusSeed("<key>")`) – jede Installation sieht
   dieselben Aufgaben. Falschantworten sind typische Kinderfehler
   (Zahlendreher, Zehnerübergang vergessen, Plus statt Minus,
   Nachbaraufgabe im Einmaleins).
   Zum Nachrechnen im Test (klasse2Mathe.test.js) tragen Aufgaben:
   - `term: { a, op, b, gesucht? }` – reine Rechenaufgabe, r = Ergebnis
   - `weg: [[a, op, b], …]` – Rechenschritte bei Antworten mit Einheit;
     "e" steht für das Ergebnis des vorigen Schritts (Geld in Cent)
   - `delta` (Minuten zur Uhr im Bild) und `dauer: { von, bis }`
   ============================================================ */
import { rngAusSeed, mischen } from "../rng.js";
import { uhrPlus } from "./uhrzeit.js";

/* ---------- Werkzeuge ---------- */
const ZEICHEN = { "+": "+", "-": "−", "·": "·", ":": ":" };
const WORT = { "+": "plus", "-": "minus", "·": "mal", ":": "geteilt durch" };

function rechne(a, op, b) {
  if (op === "+") return a + b;
  if (op === "-") return a - b;
  if (op === "·") return a * b;
  if (op === ":" && b !== 0 && a % b === 0) return a / b;
  throw new Error(`k2: ${a} ${op} ${b} geht nicht auf`);
}
/** Rechenschritte nacheinander; "e" = Ergebnis des vorigen Schritts. */
const gehe = (weg) => weg.reduce((e, [a, op, b]) => rechne(a === "e" ? e : a, op, b === "e" ? e : b), 0);

const zahl = (rng, von, bis) => von + Math.floor(rng() * (bis - von + 1));
const eins = (rng, liste) => liste[Math.floor(rng() * liste.length)];
const dreher = (n) => (n % 10) * 10 + Math.floor(n / 10);

/** Die ersten zwei brauchbaren Falschantworten aus einer Liste typischer Fehler. */
function falsch(r, kandidaten) {
  const x = [];
  for (const k of kandidaten) {
    if (k === null || k === undefined) continue;
    if (typeof k === "number" && (!Number.isInteger(k) || k < 0)) continue;
    const s = String(k);
    if (s !== String(r) && !x.includes(s)) x.push(s);
    if (x.length === 2) return x;
  }
  throw new Error(`k2: zu wenige Falschantworten für ${r}`);
}

/** Sammelt `anzahl` verschiedene Aufgaben aus einem Erzeuger (null = verwerfen). */
function sammle(anzahl, erzeuge) {
  const liste = [];
  const gesehen = new Set();
  for (let i = 0; liste.length < anzahl; i++) {
    if (i > 5000) throw new Error("k2: Generator findet nicht genug Aufgaben");
    const a = erzeuge(liste.length);
    if (!a) continue;
    const schluessel = a.f + JSON.stringify(a.bild || a.bloecke || "");
    if (gesehen.has(schluessel)) continue;
    gesehen.add(schluessel);
    liste.push(a);
  }
  return liste;
}

/** Türsteher: lässt jeden Wert höchstens `max`-mal durch (gegen eintönige Zahlen). */
function begrenzer(max = 1) {
  const gezaehlt = new Map();
  const tor = (wert) => (tor.frei(wert) ? (tor.nimm(wert), true) : false);
  tor.frei = (wert) => (gezaehlt.get(wert) || 0) < max;
  tor.nimm = (wert) => gezaehlt.set(wert, (gezaehlt.get(wert) || 0) + 1);
  return tor;
}
/** Mehrere Türsteher auf einmal: Erst wenn ALLE Werte frei sind, werden sie vergeben. */
function alleFrei(...pruefungen) {
  if (!pruefungen.every(([tor, wert]) => tor.frei(wert))) return false;
  for (const [tor, wert] of pruefungen) tor.nimm(wert);
  return true;
}

/** Alle Paare [p, q] aus zwei Bereichen, die eine Bedingung erfüllen. */
function paare(pVon, pBis, qVon, qBis, passt) {
  const aus = [];
  for (let p = pVon; p <= pBis; p++) for (let q = qVon; q <= qBis; q++) if (passt(p, q)) aus.push([p, q]);
  return aus;
}

/** Mischt Aufgabenarten reihum, damit jedes 10er-Paket bunt ist. */
function reihum(...listen) {
  const aus = [];
  for (let i = 0; listen.some((l) => i < l.length); i++) {
    for (const l of listen) if (i < l.length) aus.push(l[i]);
  }
  return aus;
}

// Kurzschreiber: Rechenaufgabe „a op b = ?" mit Vorlesetext und nachrechenbarem Term.
const rechnung = (a, op, b, kandidaten, tipp) => {
  const r = rechne(a, op, b);
  return {
    f: `${a} ${ZEICHEN[op]} ${b} = ?`, r: String(r), x: falsch(r, kandidaten), tipp,
    sprich: `Wie viel ist ${a} ${WORT[op]} ${b}?`, term: { a, op, b },
  };
};
// Kurzschreiber: Platzhalter-Aufgabe „a op ? = c" (gesucht "b") oder „? op b = c" (gesucht "a").
const luecke = (a, op, b, gesucht, kandidaten, tipp) => {
  const c = rechne(a, op, b);
  const r = gesucht === "a" ? a : b;
  return {
    f: gesucht === "a" ? `? ${ZEICHEN[op]} ${b} = ${c}` : `${a} ${ZEICHEN[op]} ? = ${c}`,
    r: String(r), x: falsch(r, kandidaten), tipp,
    sprich: gesucht === "a" ? `Wie viel ${WORT[op]} ${b} ist ${c}?` : `${a} ${WORT[op]} wie viel ist ${c}?`,
    term: { a, op, b, gesucht },
  };
};
// Kurzschreiber: Rechengeschichte – Text in `kontext`, Frage in `f`, Antwort mit Einheit.
const geschichte = (kontext, f, weg, einheit, kandidaten, tipp) => {
  const r = gehe(weg);
  return { f, r: `${r} ${einheit}`, x: falsch(r, kandidaten).map((k) => `${k} ${einheit}`), tipp, kontext, weg };
};

/* ---------- 1. Zahlen bis 100 ---------- */
const EINER_WORT = ["", "ein", "zwei", "drei", "vier", "fünf", "sechs", "sieben", "acht", "neun"];
const ZEHNER_WORT = ["", "zehn", "zwanzig", "dreißig", "vierzig", "fünfzig", "sechzig", "siebzig", "achtzig", "neunzig"];
/** Zahlwort für gemischte Zahlen von 21 bis 99 („siebenundvierzig"). */
const zahlwort = (n) => `${EINER_WORT[n % 10]}und${ZEHNER_WORT[Math.floor(n / 10)]}`;

function zahlenPool() {
  const rng = rngAusSeed("k2zahlen");
  // gemischte Zahl mit zwei verschiedenen Ziffern – jede Zahl kommt im Bereich nur einmal dran
  const neu = begrenzer(1);
  const ze = (zVon = 2, zBis = 9, eVon = 1, eBis = 9) => {
    for (let i = 0; i < 5000; i++) {
      const z = zahl(rng, zVon, zBis), e = zahl(rng, eVon, eBis);
      if (z !== e && neu(10 * z + e)) return { z, e, n: 10 * z + e };
    }
    throw new Error("k2zahlen: keine frische Zahl mehr");
  };
  const blockTipp = "Jede Stange ist ein Zehner, jeder kleine Würfel ein Einer – zähle erst die Zehner.";
  const strahlFrage = "Welche Zahl fehlt am Zahlenstrahl?";

  /* ----- easy ----- */
  const blockFragen = ["Welche Zahl zeigen die Blöcke?", "Zähle Stangen und Würfel. Welche Zahl ist das?", "Welche Zahl ist hier gelegt?"];
  const bloecke = sammle(3, (i) => {
    const { z, e, n } = ze(1, 9, 1, 9);
    return { f: blockFragen[i], r: String(n), x: falsch(n, [dreher(n), z + e]), tipp: blockTipp, bloecke: { z, e } };
  });
  const nurZehner = zahl(rng, 3, 9);
  bloecke.push({
    f: "Hier liegen nur Zehnerstangen. Welche Zahl ist das?", r: String(10 * nurZehner), x: falsch(10 * nurZehner, [nurZehner, 10 + nurZehner]),
    tipp: "Zähle die Stangen in Zehnerschritten: 10, 20, 30 …", bloecke: { z: nurZehner, e: 0 },
  });

  const stellen = [
    (() => { const { z, e, n } = ze(); return { f: `Wie viele Zehner hat die Zahl ${n}?`, r: String(z), x: falsch(z, [e, 10 * z]), tipp: "Die Zehner stehen links, die Einer rechts." }; })(),
    (() => { const { z, e, n } = ze(); return { f: `Wie viele Einer hat die Zahl ${n}?`, r: String(e), x: falsch(e, [z, 10 * e]), tipp: "Die Einer stehen ganz rechts in der Zahl." }; })(),
    (() => { const { z, e, n } = ze(); return { f: `${z} Zehner und ${e} Einer. Wie heißt die Zahl?`, r: String(n), x: falsch(n, [dreher(n), z + e]), tipp: `Schreib die Zehner zuerst: ${z} Zehner sind ${10 * z}, dann kommen die Einer dazu.` }; })(),
  ];

  const woerter = sammle(2, () => {
    const { n } = ze();
    return {
      f: `Wie schreibst du ${zahlwort(n)} als Zahl?`, r: String(n), x: falsch(n, [dreher(n), Math.floor(n / 10) * 100 + (n % 10)]),
      tipp: "Wir sprechen die Einer zuerst – beim Schreiben stehen aber die Zehner vorne.",
    };
  });
  const gesprochen = ze();
  woerter.push({
    f: `Wie sprichst du die Zahl ${gesprochen.n}?`, r: zahlwort(gesprochen.n),
    x: falsch(zahlwort(gesprochen.n), [zahlwort(dreher(gesprochen.n)), `${ZEHNER_WORT[gesprochen.z]}${gesprochen.e === 1 ? "eins" : EINER_WORT[gesprochen.e]}`]),
    tipp: "Beim Sprechen kommen zuerst die Einer, dann „und“, dann die Zehner.",
  });

  const strahlEiner = sammle(3, () => {
    const { z, n } = ze(1, 8, 2, 8);
    return {
      f: strahlFrage, r: String(n), x: falsch(n, [dreher(n), n - 10, n + 10]),
      tipp: `Zähle vom Zehner ${10 * z} aus in Einerschritten weiter.`,
      bild: { art: "strahl", von: 10 * z, bis: 10 * z + 10, schritt: 1, frage: [n] },
    };
  });
  const strahlZehner = sammle(2, () => {
    const n = 10 * zahl(rng, 3, 9);
    return {
      f: strahlFrage, r: String(n), x: falsch(n, [n - 9, n - 5]),
      tipp: "Hier geht es in Zehnerschritten weiter: immer 10 mehr.",
      bild: { art: "strahl", von: 0, bis: 100, schritt: 10, frage: [n] },
    };
  });

  const nachfolger = sammle(3, (i) => {
    const n = i === 0 ? 10 * zahl(rng, 2, 8) + 9 : ze().n;
    if (i > 0 && n % 10 === 9) return null;
    return {
      f: `Wie heißt der Nachfolger von ${n}?`, r: String(n + 1), x: falsch(n + 1, n % 10 === 9 ? [n - 1, n - 9] : [n - 1, n + 10]),
      tipp: "Der Nachfolger kommt direkt danach: immer 1 mehr.",
    };
  });
  const vorgaenger = sammle(3, (i) => {
    const n = i === 0 ? 10 * zahl(rng, 3, 9) : ze().n;
    return {
      f: `Wie heißt der Vorgänger von ${n}?`, r: String(n - 1), x: falsch(n - 1, [n + 1, n - 10]),
      tipp: "Der Vorgänger steht direkt davor: immer 1 weniger.",
    };
  });

  const zehnerNeu = begrenzer(1);
  const nachbarzehner = sammle(3, () => {
    const z = zahl(rng, 1, 8), e = zahl(rng, 1, 9), n = 10 * z + e;
    if (!zehnerNeu(z)) return null;
    const r = `${10 * z} und ${10 * z + 10}`;
    return {
      f: `Wie heißen die Nachbarzehner von ${n}?`, r, x: falsch(r, [`${n - 1} und ${n + 1}`, `${10 * z - 10} und ${10 * z + 10}`]),
      tipp: "Nachbarzehner sind die glatten Zehnerzahlen direkt davor und direkt danach.",
      bild: { art: "strahl", von: 10 * z, bis: 10 * z + 10, schritt: 1, frage: [10 * z, 10 * z + 10] },
    };
  });

  const paritaet = (gerade, trick) => () => {
    // trick: Die Falschantworten haben eine „passende" Zehnerziffer – nur die Einer zählen.
    const e = gerade ? [0, 2, 4, 6, 8] : [1, 3, 5, 7, 9];
    const anders = gerade ? [1, 3, 5, 7, 9] : [0, 2, 4, 6, 8];
    const z = (liste) => (trick ? eins(rng, liste.filter((k) => k > 0)) : zahl(rng, 1, 9));
    const r = 10 * z(anders) + eins(rng, e);
    const x1 = 10 * z(e) + eins(rng, anders), x2 = 10 * z(e) + eins(rng, anders);
    if (new Set([r, x1, x2]).size < 3) return null;
    const sortiert = [r, x1, x2].sort((a, b) => a - b);
    return {
      f: `Welche Zahl ist ${gerade ? "gerade" : "ungerade"}: ${sortiert[0]}, ${sortiert[1]} oder ${sortiert[2]}?`,
      r: String(r), x: [String(x1), String(x2)],
      tipp: gerade ? "Schau nur auf die Einer: 0, 2, 4, 6 und 8 sind gerade." : "Schau nur auf die Einer: 1, 3, 5, 7 und 9 sind ungerade.",
    };
  };
  const geradeLeicht = [...sammle(2, paritaet(true, false)), ...sammle(1, paritaet(false, false))];

  const groessteNeu = begrenzer(1);
  const groesste = sammle(2, () => {
    const a = zahl(rng, 2, 8), b = zahl(rng, a + 1, 9), c = zahl(rng, 0, a - 1);
    if (!groessteNeu(b)) return null;
    const drei = [10 * a + b, 10 * b + a, 10 * b + c].sort((p, q) => p - q);
    return {
      f: `Welche Zahl ist am größten: ${drei[0]}, ${drei[1]} oder ${drei[2]}?`, r: String(10 * b + a), x: [String(10 * a + b), String(10 * b + c)],
      tipp: "Vergleiche zuerst die Zehner – sind sie gleich, entscheiden die Einer.",
    };
  });
  const kleinste = sammle(1, () => {
    const a = zahl(rng, 1, 6), b = zahl(rng, a + 1, 8), c = zahl(rng, b + 1, 9);
    const drei = [10 * a + b, 10 * b + a, 10 * a + c].sort((p, q) => p - q);
    return {
      f: `Welche Zahl ist am kleinsten: ${drei[0]}, ${drei[1]} oder ${drei[2]}?`, r: String(10 * a + b), x: [String(10 * b + a), String(10 * a + c)],
      tipp: "Die wenigsten Zehner gewinnen – bei gleichen Zehnern die wenigsten Einer.",
    };
  });

  const zerlegenA = ze(), zerlegenB = ze();
  const zerlegen = [
    {
      f: `${zerlegenA.n} = ${10 * zerlegenA.z} + ?`, r: String(zerlegenA.e), x: falsch(zerlegenA.e, [zerlegenA.z, 10 * zerlegenA.e]),
      tipp: `Die Zahl ${zerlegenA.n} besteht aus ${zerlegenA.z} Zehnern und ihren Einern.`,
      sprich: `${zerlegenA.n} ist ${10 * zerlegenA.z} plus wie viel?`, term: { a: 10 * zerlegenA.z, op: "+", b: zerlegenA.e, gesucht: "b" },
    },
    luecke(10 * zerlegenB.z, "+", zerlegenB.e, "a", [zerlegenB.z, 10 * zerlegenB.z - 10],
      `Die ${zerlegenB.e} sind die Einer – gesucht sind die Zehner von ${zerlegenB.n}.`),
  ];

  const easy = reihum(bloecke, nachfolger, strahlEiner, stellen, nachbarzehner, vorgaenger, geradeLeicht, woerter,
    [...groesste, ...kleinste], strahlZehner, zerlegen);

  /* ----- hard ----- */
  const buendelNeu = begrenzer(1);
  const buendelText = sammle(2, () => {
    const z = zahl(rng, 2, 7), e = zahl(rng, 11, 18), n = 10 * z + e;
    if (!buendelNeu(z)) return null;
    return {
      f: `${z} Zehner und ${e} Einer – welche Zahl ist das?`, r: String(n), x: falsch(n, [Number(`${z}${e}`), 10 * z + (e - 10)]),
      tipp: `Aus 10 von den ${e} Einern wird ein neuer Zehner.`,
    };
  });
  const buendelFragen = ["Hier liegen mehr als 9 Einer. Welche Zahl ist es?", "Tausche 10 Einer in eine Zehnerstange. Welche Zahl ist es?"];
  const buendelBild = sammle(2, (i) => {
    const z = zahl(rng, 2, 6), e = zahl(rng, 11, 15), n = 10 * z + e;
    if (!buendelNeu(z)) return null;
    return {
      f: buendelFragen[i], r: String(n), x: falsch(n, [Number(`${z}${e}`), 10 * z + (e - 10)]),
      tipp: "10 Einerwürfel sind so viel wert wie eine Zehnerstange – dann zähle neu.", bloecke: { z, e },
    };
  });

  const folge = (schritt, startVon, startBis) => () => {
    const a = zahl(rng, startVon, startBis);
    const start = Math.abs(schritt) === 10 ? a : a - (a % Math.abs(schritt));
    const glieder = [0, 1, 2, 3].map((i) => start + i * schritt);
    if (glieder.some((g) => g < 1 || g > 100)) return null;
    const r = glieder[3], vor = schritt > 0;
    return {
      f: `Setze fort: ${glieder[0]}, ${glieder[1]}, ${glieder[2]}, ?`, r: String(r), x: falsch(r, [glieder[2] + (vor ? 1 : -1), r + schritt]),
      tipp: `Es geht immer ${Math.abs(schritt)} ${vor ? "weiter" : "zurück"}.`,
      sprich: `Setze die Zahlenreihe fort: ${glieder[0]}, ${glieder[1]}, ${glieder[2]}. Welche Zahl kommt danach?`,
    };
  };
  const folgen = [
    ...sammle(1, folge(2, 22, 88)), ...sammle(1, folge(5, 20, 80)), ...sammle(1, folge(10, 11, 59)),
    ...sammle(1, folge(eins(rng, [-5, -10]), 60, 99)),
  ];

  const feld = [
    (() => { const { n } = ze(1, 8, 1, 9); return { f: `Welche Zahl steht im Hunderterfeld direkt unter der ${n}?`, r: String(n + 10), x: falsch(n + 10, [n + 1, n - 10]), tipp: "Im Hunderterfeld sind es eine Zeile tiefer immer 10 mehr." }; })(),
    (() => { const { n } = ze(2, 8, 1, 9); return { f: `Welche Zahl steht im Hunderterfeld direkt über der ${n}?`, r: String(n - 10), x: falsch(n - 10, [n + 10, n - 1]), tipp: "Im Hunderterfeld sind es eine Zeile höher immer 10 weniger." }; })(),
    (() => { const { n } = ze(1, 9, 2, 9); return { f: `Welche Zahl steht im Hunderterfeld direkt links neben der ${n}?`, r: String(n - 1), x: falsch(n - 1, [n + 1, n - 10]), tipp: "In einer Zeile geht es nach links immer 1 zurück." }; })(),
  ];

  const mitte = mischen([[20, 40], [40, 60], [60, 80], [30, 50], [50, 70], [70, 90]], rng).slice(0, 2).map(([von, bis]) => {
    const m = (von + bis) / 2;
    return {
      f: `Welche Zahl liegt genau in der Mitte zwischen ${von} und ${bis}?`, r: String(m), x: falsch(m, [m - 5, m + 5]),
      tipp: `Die Mitte ist von ${von} und von ${bis} gleich weit weg.`,
      bild: { art: "strahl", von, bis, schritt: m - von, frage: [m] },
    };
  });

  const zeichenText = { "<": "kleiner als (<)", ">": "größer als (>)", "=": "gleich (=)" };
  const vergleich = sammle(3, (i) => {
    const { n } = ze();
    const a = i === 1 ? Math.max(n, dreher(n)) : Math.min(n, dreher(n));
    const b = i === 2 ? 10 * Math.floor(a / 10) + (a % 10 === 9 ? 8 : 9) : dreher(a);
    if (a === b) return null;
    const z = a < b ? "<" : ">";
    return {
      f: `Welches Zeichen passt? ${a} __ ${b}`, r: zeichenText[z], x: [zeichenText[z === "<" ? ">" : "<"], zeichenText["="]],
      tipp: "Das Zeichen öffnet sich wie ein Maul immer zur größeren Zahl.",
      sprich: `Welches Zeichen passt zwischen ${a} und ${b}?`,
    };
  });

  const ordnenZiffern = new Set(); // jede Ziffer nur in einer Ordne-Aufgabe
  const ordnen = sammle(3, (i) => {
    const a = zahl(rng, 1, 8), b = zahl(rng, a + 1, 9);
    if (ordnenZiffern.has(a) || ordnenZiffern.has(b)) return null;
    ordnenZiffern.add(a).add(b);
    const sortiert = [10 * a + b, 10 * b + a, i === 1 ? 10 * a + a : 10 * b + b].sort((p, q) => p - q);
    const gezeigt = [sortiert[1], sortiert[0], sortiert[2]];
    const ab = i === 2; // einmal von groß nach klein
    const richtig = ab ? sortiert.slice().reverse() : sortiert;
    const verkehrt = richtig.slice().reverse();
    const vertauscht = [richtig[0], richtig[2], richtig[1]];
    return {
      f: `Ordne von ${ab ? "groß nach klein" : "klein nach groß"}: ${gezeigt.join(", ")}.`, r: richtig.join(", "),
      x: [verkehrt.join(", "), vertauscht.join(", ")],
      tipp: "Schau zuerst auf die Zehner, bei gleichen Zehnern auf die Einer.",
    };
  });

  const naeher = sammle(2, (i) => {
    const z = zahl(rng, 2, 8), e = i === 0 ? zahl(rng, 7, 9) : zahl(rng, 1, 3), n = 10 * z + e;
    const r = e >= 7 ? 10 * z + 10 : 10 * z;
    return {
      f: `Welcher Zehner liegt näher an ${n}?`, r: String(r), x: falsch(r, e >= 7 ? [10 * z, 10 * z + 20] : [10 * z + 10, 10 * z - 10]),
      tipp: `Zähle die Schritte von ${n} bis zu beiden Nachbarzehnern und vergleiche.`,
    };
  });

  const strahlFuenfer = sammle(2, () => {
    const von = 10 * zahl(rng, 1, 7), n = von + eins(rng, [5, 15]);
    return {
      f: strahlFrage, r: String(n), x: falsch(n, [n - 4, dreher(n), n + 1]),
      tipp: "Hier geht es in Fünferschritten weiter: immer 5 mehr.",
      bild: { art: "strahl", von, bis: von + 20, schritt: 5, frage: [n] },
    };
  });

  const raetsel = [
    (() => { const { n } = ze(2, 8, 1, 9); return { f: `Meine Zahl ist um 10 größer als ${n}. Wie heißt sie?`, r: String(n + 10), x: falsch(n + 10, [n + 1, n - 10]), tipp: "Um 10 größer: Der Zehner wächst um eins, die Einer bleiben." }; })(),
    (() => { const { n } = ze(3, 9, 1, 9); return { f: `Meine Zahl ist um 10 kleiner als ${n}. Wie heißt sie?`, r: String(n - 10), x: falsch(n - 10, [n - 1, n + 10]), tipp: "Um 10 kleiner: Ein Zehner fällt weg, die Einer bleiben." }; })(),
    (() => { const { z, e, n } = ze(2, 8, 1, 9); return { f: `Meine Zahl liegt zwischen ${10 * z} und ${10 * z + 10} und hat ${e} Einer. Wie heißt sie?`, r: String(n), x: falsch(n, [dreher(n), n + 10]), tipp: `Alle Zahlen zwischen ${10 * z} und ${10 * z + 10} haben ${z} Zehner.` }; })(),
  ];

  const geradeSchwer = [...sammle(1, paritaet(true, true)), ...sammle(1, paritaet(false, true))];

  const bisZehner = ze(2, 8, 2, 8);
  const bisHundert = 10 * eins(rng, [2, 3, 4, 6, 7, 8]);
  const ergaenzen = [
    {
      f: `Wie viel fehlt von ${bisZehner.n} bis zum nächsten Zehner?`, r: String(10 - bisZehner.e), x: falsch(10 - bisZehner.e, [bisZehner.e, 11 - bisZehner.e, 9 - bisZehner.e]),
      tipp: `Der nächste Zehner ist ${10 * bisZehner.z + 10} – zähle von ${bisZehner.n} aus weiter.`,
    },
    {
      f: `Wie viel fehlt von ${bisHundert} bis 100?`, r: String(100 - bisHundert), x: falsch(100 - bisHundert, [110 - bisHundert, 10 - bisHundert / 10, 90 - bisHundert]),
      tipp: `Denk an die kleine Aufgabe: ${bisHundert / 10} + ? = 10 – nur mit Zehnern.`,
    },
  ];

  const nachbarzahlen = [10 * zahl(rng, 3, 9), 10 * zahl(rng, 2, 8) + 9].map((n) => {
    const r = `${n - 1} und ${n + 1}`;
    return {
      f: `Wie heißen die Nachbarzahlen von ${n}?`, r, x: falsch(r, [`${n - 10} und ${n + 10}`, `${n - 2} und ${n + 2}`]),
      tipp: "Die Nachbarzahlen sind Vorgänger und Nachfolger: 1 weniger und 1 mehr.",
    };
  });

  const hard = reihum(folgen, buendelText, feld, vergleich, ordnen, raetsel, buendelBild, mitte, naeher, strahlFuenfer,
    geradeSchwer, ergaenzen, nachbarzahlen);
  return { easy, hard };
}

/* ---------- 2. Plus bis 100 ---------- */
// Einerpaare mit Zehnerübergang (Summe ab 11) und ohne (Summe höchstens 9)
const EINER_MIT_UEBERGANG = paare(2, 9, 2, 9, (p, q) => p + q >= 11);
const EINER_OHNE_UEBERGANG = paare(1, 8, 1, 8, (p, q) => p + q <= 9);

function plusPool() {
  const rng = rngAusSeed("k2plus");
  const pm = () => (rng() < 0.5 ? 1 : -1);
  // Falschantworten bleiben im Hunderterraum und wiederholen keinen Summanden
  const plus = (a, b, kandidaten, tipp) => rechnung(a, "+", b,
    [...kandidaten, a + b + 1, a + b - 1].filter((k) => k !== a && k !== b && k <= 100), tipp);

  // easy: Z+Z, ZE+E ohne Übergang, ZE+Z
  const leichtNeu = begrenzer(1);
  const zz = sammle(10, () => {
    const a = 10 * zahl(rng, 1, 8), b = 10 * zahl(rng, 1, 8), r = a + b;
    if (r > 100 || !leichtNeu(`${Math.min(a, b)}+${Math.max(a, b)}`)) return null;
    return plus(a, b, [r / 10, rng() < 0.5 ? r + 10 : r - 10, r + 10, r - 10],
      `Denk an ${a / 10} + ${b / 10} – nur sind es hier Zehner.`);
  });
  const zeE = sammle(10, () => {
    const z = zahl(rng, 2, 9), e = zahl(rng, 1, 7), b = zahl(rng, 2, 9 - e), a = 10 * z + e, r = a + b;
    if (!leichtNeu(a)) return null;
    return plus(a, b, [a + 10 * b <= 99 ? a + 10 * b : null, r + pm()],
      `Die Zehner bleiben – rechne nur die Einer: ${e} + ${b}.`);
  });
  const zeZ = sammle(10, () => {
    const z = zahl(rng, 1, 7), e = zahl(rng, 1, 9), k = zahl(rng, 1, 9 - z), a = 10 * z + e, r = a + 10 * k;
    if (!leichtNeu(a)) return null;
    return plus(a, 10 * k, [a + k, rng() < 0.5 ? r + 10 : r - 10, r + 10, r - 10],
      `Die Einer bleiben – rechne nur die Zehner: ${z} Zehner + ${k} Zehner.`);
  });

  // hard: ZE+E mit Übergang, ZE+ZE (ohne und mit Übergang), Ergänzen
  const schwerNeu = begrenzer(1);
  const einerHoechstens = begrenzer(2), zweiterHoechstens = begrenzer(2);
  const uebergangE = sammle(8, () => {
    const [e, b] = eins(rng, EINER_MIT_UEBERGANG), z = zahl(rng, 1, 8), a = 10 * z + e, r = a + b;
    if (b < 3 || !alleFrei([schwerNeu, a], [einerHoechstens, b])) return null;
    return plus(a, b, [r - 10, rng() < 0.5 ? r + pm() : r + 10],
      `Erst bis zum Zehner: ${a} + ${10 - e} = ${10 * z + 10}, dann noch ${b - (10 - e)} dazu.`);
  });
  const zeZeOhne = sammle(6, () => {
    const [e1, e2] = eins(rng, EINER_OHNE_UEBERGANG), z1 = zahl(rng, 1, 7), z2 = zahl(rng, 1, 9 - z1);
    const a = 10 * z1 + e1, b = 10 * z2 + e2, r = a + b;
    if (a === b || !alleFrei([schwerNeu, a], [schwerNeu, b])) return null;
    return plus(a, b, [a + 10 * z2, rng() < 0.5 ? r + 10 : r - 10, r - 10],
      `Erst die Zehner: ${a} + ${10 * z2} = ${a + 10 * z2}, dann noch ${e2} Einer dazu.`);
  });
  const zeZeMit = sammle(10, () => {
    const [e1, e2] = eins(rng, EINER_MIT_UEBERGANG), z1 = zahl(rng, 1, 7), z2 = zahl(rng, 1, 8 - z1);
    const a = 10 * z1 + e1, b = 10 * z2 + e2, r = a + b;
    if (a === b || !alleFrei([schwerNeu, a], [schwerNeu, b], [zweiterHoechstens, e2])) return null;
    return plus(a, b, [r - 10, rng() < 0.5 ? r + pm() : r + 10],
      `Erst die Zehner: ${a} + ${10 * z2} = ${a + 10 * z2}, dann die ${e2} Einer über den Zehner.`);
  });
  const zielNeu = begrenzer(1); // Platzhalter-Aufgaben unterscheiden sich in Zehner, Einer und Schrittweite
  const ergaenzen = [
    ...sammle(2, () => {
      const z = zahl(rng, 2, 8), e = zahl(rng, 2, 8), a = 10 * z + e, b = 10 - e;
      if (e === 5 || !alleFrei([schwerNeu, a], [zielNeu, z], [zielNeu, `E${e}`])) return null;
      return luecke(a, "+", b, "b", [e, b + 1, b - 1], `Wie viele Einer fehlen der ${e} bis zur 10?`);
    }),
    ...sammle(2, () => {
      const a = 10 * eins(rng, [2, 3, 4, 6, 7, 8]), b = 100 - a;
      return luecke(a, "+", b, "b", [b + 10, b / 10, b - 10], `Denk an ${a / 10} + ? = 10 – nur mit Zehnern.`);
    }),
    ...sammle(2, () => {
      const z = zahl(rng, 2, 6), e = zahl(rng, 1, 9), k = zahl(rng, 2, 9 - z), a = 10 * z + e, c = a + 10 * k;
      if (!alleFrei([schwerNeu, a], [zielNeu, `K${k}`])) return null;
      return luecke(a, "+", 10 * k, "a", [c + 10 * k <= 100 ? c + 10 * k : null, a + 10, a - 10].filter((n) => n !== c),
        `Rechne rückwärts: ${c} − ${10 * k}.`);
    }),
  ];

  return { easy: reihum(zz, zeE, zeZ), hard: reihum(uebergangE, zeZeMit, zeZeOhne, ergaenzen) };
}

/* ---------- 3. Minus bis 100 ---------- */
// Einerpaare [e, b] mit b > e: Beim Abziehen muss ein Zehner geöffnet werden
const EINER_ZU_KLEIN = paare(1, 8, 2, 9, (p, q) => q > p);

function minusPool() {
  const rng = rngAusSeed("k2minus");
  const pm = () => (rng() < 0.5 ? 1 : -1);
  // Falschantworten bleiben im Hunderterraum und wiederholen keine Zahl der Aufgabe
  const minus = (a, b, kandidaten, tipp) => rechnung(a, "-", b,
    [...kandidaten, a - b + 1, a - b - 1, a - b + 2].filter((k) => k !== a && k !== b && k <= 100), tipp);

  // easy: Z−Z, ZE−E ohne Übergang, ZE−Z
  const leichtNeu = begrenzer(1), zehnerHoechstens = begrenzer(2);
  const zz = sammle(10, () => {
    const a = 10 * zahl(rng, 2, 10), b = 10 * zahl(rng, 1, a / 10 - 1), r = a - b;
    if (!zehnerHoechstens(a)) return null;
    return minus(a, b, [r / 10, a + b <= 100 ? a + b : r + 10, r + 10, r - 10],
      `Denk an ${a / 10} − ${b / 10} – nur sind es hier Zehner.`);
  });
  const zeE = sammle(10, () => {
    const z = zahl(rng, 2, 9), e = zahl(rng, 3, 9), b = zahl(rng, 2, e), a = 10 * z + e, r = a - b;
    if (!leichtNeu(a)) return null;
    return minus(a, b, [a + b <= 99 ? a + b : null, r + pm()],
      `Die Zehner bleiben – rechne nur die Einer: ${e} − ${b}.`);
  });
  const zeZ = sammle(10, () => {
    const z = zahl(rng, 2, 9), e = zahl(rng, 1, 9), k = zahl(rng, 1, z - 1), a = 10 * z + e, r = a - 10 * k;
    if (!leichtNeu(a)) return null;
    return minus(a, 10 * k, [a - k, r >= 20 && rng() < 0.5 ? r - 10 : r + 10, r - 10],
      `Die Einer bleiben – rechne nur die Zehner: ${z} Zehner − ${k} Zehner.`);
  });

  // hard: Z−E, ZE−E mit Übergang, ZE−ZE (ohne und mit Übergang), 100−ZE, Platzhalter
  const schwerNeu = begrenzer(1);
  const einerHoechstens = begrenzer(2), zweiterHoechstens = begrenzer(2);
  const zE = sammle(2, () => {
    const z = zahl(rng, 3, 9), b = zahl(rng, 3, 9), a = 10 * z;
    if (!alleFrei([schwerNeu, a], [einerHoechstens, b])) return null;
    return minus(a, b, [a - b + 10, a + b],
      `Öffne einen Zehner: 10 − ${b} = ${10 - b}, davor bleiben ${z - 1} Zehner.`);
  });
  const uebergangE = sammle(7, () => {
    const [e, b] = eins(rng, EINER_ZU_KLEIN), z = zahl(rng, 2, 9), a = 10 * z + e, r = a - b;
    if (!alleFrei([schwerNeu, a], [einerHoechstens, b])) return null;
    return minus(a, b, [r + 10, eins(rng, [a + b <= 99 ? a + b : r + 1, r + 1, r - 1])],
      `Erst bis zum Zehner: ${a} − ${e} = ${10 * z}, dann noch ${b - e} weg.`);
  });
  const zeZeOhne = sammle(6, () => {
    const z1 = zahl(rng, 3, 9), z2 = zahl(rng, 1, z1 - 1), e1 = zahl(rng, 2, 9), e2 = zahl(rng, 1, e1 - 1);
    const a = 10 * z1 + e1, b = 10 * z2 + e2, r = a - b;
    if (!alleFrei([schwerNeu, a], [schwerNeu, b])) return null;
    return minus(a, b, [a - 10 * z2, r + 10, r - 10],
      `Erst die Zehner: ${a} − ${10 * z2} = ${a - 10 * z2}, dann noch ${e2} Einer weg.`);
  });
  const zeZeMit = sammle(8, () => {
    const [e1, e2] = eins(rng, EINER_ZU_KLEIN), z1 = zahl(rng, 3, 9), z2 = zahl(rng, 1, z1 - 1);
    const a = 10 * z1 + e1, b = 10 * z2 + e2, r = a - b;
    if (!alleFrei([schwerNeu, a], [schwerNeu, b], [zweiterHoechstens, e2])) return null;
    return minus(a, b, [10 * (z1 - z2) + (e2 - e1), r + 10, r - 10],
      `Erst die Zehner: ${a} − ${10 * z2} = ${a - 10 * z2}, dann die ${e2} Einer über den Zehner zurück.`);
  });
  const vonHundert = sammle(2, () => {
    const z = zahl(rng, 2, 7), e = zahl(rng, 2, 8), b = 10 * z + e, r = 100 - b;
    if (e === 5 || !schwerNeu(b)) return null;
    return minus(100, b, [r + 10, r - 10],
      `Erst die Zehner: 100 − ${10 * z} = ${100 - 10 * z}, dann noch ${e} Einer weg.`);
  });
  const platzhalter = [
    ...sammle(2, () => {
      const a = 10 * zahl(rng, 3, 9), b = zahl(rng, 3, 8), c = a - b;
      if (b === 5 || !alleFrei([schwerNeu, a], [schwerNeu, c])) return null;
      return luecke(a, "-", b, "b", [c % 10, b + 1, b - 1], `Ergänze von ${c} bis ${a} – so viel wurde weggenommen.`);
    }),
    ...sammle(1, () => {
      const z = zahl(rng, 2, 9), e = zahl(rng, 3, 9), a = 10 * z + e;
      if (z === e || !schwerNeu(a)) return null;
      return luecke(a, "-", e, "b", [z, e + 1, e - 1], `Schau auf die Einer von ${a}: Sie müssen ganz weg.`);
    }),
    ...sammle(2, () => {
      const c = 10 * zahl(rng, 2, 8), b = zahl(rng, 3, 9), a = c + b;
      if (!schwerNeu(a)) return null;
      return luecke(a, "-", b, "a", [c - b, a + pm(), a + 10], `Rechne rückwärts: ${c} + ${b}.`);
    }),
  ];

  return { easy: reihum(zz, zeE, zeZ), hard: reihum(uebergangE, zeZeMit, zeZeOhne, platzhalter, zE, vonHundert) };
}

/* ---------- 4. Einmaleins ---------- */
function einmaleinsPool() {
  const rng = rngAusSeed("k2einmaleins");
  // Falschantworten: Nachbaraufgaben der Reihe, Nachbarreihe, Plus statt Mal – immer im kleinen Einmaleins
  const malFalsch = (a, b) => {
    const reihe = [a < 10 ? (a + 1) * b : null, a > 1 ? (a - 1) * b : null];
    const andere = [a + b, b < 10 ? a * (b + 1) : null, b > 1 ? a * (b - 1) : null];
    return [eins(rng, reihe), eins(rng, andere), ...reihe, ...andere];
  };
  const mal = (a, b, tipp) => rechnung(a, "·", b, malFalsch(a, b), tipp);

  // easy: Reihen 2, 5, 10 und Kernaufgaben (1·, 2·, 5·, 10·)
  const reihe = (b, tipp) => mischen([2, 3, 4, 5, 6, 7, 8, 9, 10], rng).slice(0, 6).map((n) => mal(n, b, tipp(n)));
  const reihe2 = reihe(2, (n) => `Zähle in Zweierschritten bis zum ${n}. Schritt: 2, 4, 6 …`);
  const reihe5 = reihe(5, (n) => `Zähle in Fünferschritten bis zum ${n}. Schritt: 5, 10, 15 …`);
  const reihe10 = reihe(10, (n) => `${n} Zehner – zähle 10, 20, 30 … bis zum ${n}. Schritt.`);
  const kernTipp = {
    1: () => "Einmal heißt: Die Zahl steht genau ein Mal da.",
    2: (m) => `Das Doppelte: ${m} + ${m}.`,
    5: (m) => `Die Hälfte von 10 · ${m}: Halbiere ${10 * m}.`,
    10: (m) => `10-mal die ${m}: Das sind ${m} Zehner.`,
  };
  const kern = [1, 2, 5, 10].flatMap((k) => mischen([3, 4, 6, 7, 8, 9], rng).slice(0, 2).map((m) => mal(k, m, kernTipp[k](m))));
  const summandNeu = begrenzer(1);
  const plusZuMal = sammle(3, () => {
    const s = eins(rng, [2, 3, 4, 5, 10]), c = zahl(rng, 3, 5);
    if (s === c || !summandNeu(s)) return null;
    const kette = Array(c).fill(s);
    return {
      f: `Welche Malaufgabe passt zu ${kette.join(" + ")}?`, r: `${c} · ${s}`, x: [`${s} · ${s}`, `${c} + ${s}`],
      tipp: `Zähle, wie oft die ${s} dasteht: ${c}-mal.`,
      sprich: `Welche Malaufgabe passt zu ${kette.join(" plus ")}?`,
    };
  });
  const malZuPlus = sammle(2, () => {
    const c = zahl(rng, 3, 4), s = eins(rng, [2, 5, 10]);
    return {
      f: `Welche Plusaufgabe passt zu ${c} · ${s}?`, r: Array(c).fill(s).join(" + "), x: [`${c} + ${s}`, Array(c).fill(c).join(" + ")],
      tipp: `${c} · ${s} heißt: Die ${s} steht ${c}-mal da.`,
      sprich: `Welche Plusaufgabe passt zu ${c} mal ${s}?`,
    };
  });
  const easy = reihum(reihe2, reihe5, reihe10, kern, [...plusZuMal, ...malZuPlus]);

  // hard: alle Reihen, Nachbaraufgaben, Tauschaufgaben, Platzhalter, kurze Mal-Geschichten
  const wegTipp = (a, b) => ({
    3: `2 · ${b} = ${2 * b}, dann noch einmal ${b} dazu.`,
    4: `Verdopple 2 · ${b} = ${2 * b}.`,
    6: `5 · ${b} = ${5 * b}, dann noch einmal ${b} dazu.`,
    7: `5 · ${b} = ${5 * b} und 2 · ${b} = ${2 * b} – zähle beides zusammen.`,
    8: `10 · ${b} = ${10 * b}, dann 2 · ${b} = ${2 * b} wieder weg.`,
    9: `10 · ${b} = ${10 * b}, dann einmal ${b} wieder weg.`,
  }[a]);
  const SCHWER = [3, 4, 6, 7, 8, 9];
  const quadrate = mischen([6, 7, 8, 9], rng).slice(0, 3).map((n) => mal(n, n, wegTipp(n, n)));
  const paarNeu = begrenzer(1); // von Tauschaufgaben (6 · 7 und 7 · 6) kommt nur eine dran
  const alleReihen = [...quadrate, ...sammle(11, () => {
    const a = eins(rng, SCHWER), b = eins(rng, SCHWER);
    return a === b || !paarNeu(`${Math.min(a, b)}·${Math.max(a, b)}`) ? null : mal(a, b, wegTipp(a, b));
  })];
  const nachbar = [[5, 6], [10, 9], [2, 3]].map(([von, zu]) => {
    const b = eins(rng, [6, 7, 8, 9]), basis = von * b, mehr = zu > von;
    return {
      f: `${von} · ${b} = ${basis}. Wie viel ist dann ${zu} · ${b}?`, r: String(zu * b),
      x: falsch(zu * b, mehr ? [basis + 1, basis + von] : [basis - 1, basis - von]),
      tipp: mehr ? `Es kommt noch einmal die ${b} dazu.` : `Es fällt einmal die ${b} weg.`,
      sprich: `${von} mal ${b} ist ${basis}. Wie viel ist dann ${zu} mal ${b}?`, term: { a: zu, op: "·", b },
    };
  });
  const tausch = sammle(3, () => {
    const a = zahl(rng, 3, 9), b = zahl(rng, 3, 9);
    if (a === b) return null;
    return {
      f: `Wie heißt die Tauschaufgabe zu ${a} · ${b}?`, r: `${b} · ${a}`, x: [`${a * b} : ${b}`, `${a} + ${b}`],
      tipp: "Bei der Tauschaufgabe tauschen die beiden Zahlen die Plätze – das Ergebnis bleibt gleich.",
      sprich: `Wie heißt die Tauschaufgabe zu ${a} mal ${b}?`,
    };
  });
  const tauschWert = (() => {
    const a = eins(rng, [3, 4]), b = eins(rng, [7, 8, 9]);
    return {
      f: `${b} · ${a} = ${a * b}. Wie viel ist dann ${a} · ${b}?`, r: String(a * b), x: falsch(a * b, [a + b, a * b + a, a * b - b]),
      tipp: "Tauschaufgaben haben immer dasselbe Ergebnis.",
      sprich: `${b} mal ${a} ist ${a * b}. Wie viel ist dann ${a} mal ${b}?`, term: { a, op: "·", b },
    };
  })();
  const gesuchtNeu = begrenzer(1), reiheHoechstens = begrenzer(2);
  const platzhalter = sammle(7, (i) => {
    const a = zahl(rng, 2, 9), b = zahl(rng, 2, 9), c = a * b, gesucht = i % 2 === 0 ? "b" : "a";
    const r = gesucht === "a" ? a : b, reihe = gesucht === "a" ? b : a;
    if (a === b || !SCHWER.includes(reihe) || !alleFrei([gesuchtNeu, r], [reiheHoechstens, reihe])) return null;
    return luecke(a, "·", b, gesucht, [r + 1, r > 2 ? r - 1 : r + 2, r + 2],
      `Zähle die ${reihe}er-Reihe auf, bis du bei ${c} bist.`);
  });
  const malGeschichten = [
    { f: "Ein Auto hat 4 Räder. Wie viele Räder haben 6 Autos?", r: "24", x: ["10", "20"], tipp: "Jedes Auto hat gleich viele Räder – rechne 6 · 4.", term: { a: 6, op: "·", b: 4 } },
    { f: "Eine Woche hat 7 Tage. Wie viele Tage haben 3 Wochen?", r: "21", x: ["10", "14"], tipp: "Drei Wochen sind 3-mal 7 Tage.", term: { a: 3, op: "·", b: 7 } },
    { f: "Eine Spinne hat 8 Beine. Wie viele Beine haben 4 Spinnen?", r: "32", x: ["12", "24"], tipp: "Verdopple zweimal: 8, 16, 32.", term: { a: 4, op: "·", b: 8 } },
  ];
  const hard = reihum(alleReihen, platzhalter, [...tausch, tauschWert], nachbar, malGeschichten);
  return { easy, hard };
}

/* ---------- 5. Teilen ---------- */
function teilenPool() {
  const rng = rngAusSeed("k2teilen");
  const durch = (c, b, tipp) => {
    const r = c / b;
    return rechnung(c, ":", b, [rng() < 0.5 ? r + 1 : r - 1, c - b, r + 1, r + 2].map((k) => (k > 0 ? k : null)), tipp);
  };
  const reihe = (b, anzahl, tipp) => mischen([2, 3, 4, 5, 6, 7, 8, 9, 10], rng).slice(0, anzahl).map((n) => durch(n * b, b, tipp(n * b)));

  // easy: Umkehraufgaben zu den Reihen 2, 5 und 10, Halbieren
  const durch2 = reihe(2, 8, (c) => `Halbiere: Welche Zahl plus sich selbst ergibt ${c}?`);
  const durch5 = reihe(5, 8, (c) => `Wie oft passt die 5 in die ${c}? Zähle 5, 10, 15 …`);
  const durch10 = reihe(10, 5, (c) => `Wie viele Zehner stecken in ${c}?`);
  const haelfte = mischen([30, 40, 50, 60, 80, 100], rng).slice(0, 3).map((c) => {
    const r = c / 2, fuenfer = r % 10 === 5;
    return {
      f: `Was ist die Hälfte von ${c}?`, r: String(r), x: falsch(r, fuenfer ? [r - 5, r + 5] : [r - 10, r + 10]),
      tipp: `Zwei gleiche Zahlen ergeben zusammen ${c} – welche?`, term: { a: c, op: ":", b: 2 },
    };
  });
  const faktoren = mischen([3, 4, 6, 7, 8, 9], rng);
  const umkehr = [2, 5, 10].map((b, i) => {
    const a = faktoren[i], c = a * b;
    return {
      f: `${a} · ${b} = ${c}. Wie viel ist dann ${c} : ${b}?`, r: String(a), x: falsch(a, [b, c - b, a + 1]),
      tipp: "Teilen macht das Malnehmen rückgängig – schau auf die Malaufgabe.",
      sprich: `${a} mal ${b} ist ${c}. Wie viel ist dann ${c} geteilt durch ${b}?`, term: { a: c, op: ":", b },
    };
  });
  const hilfe = [2, 5, 10].map((b, i) => {
    const a = faktoren[i + 3], c = a * b;
    return {
      f: `Welche Malaufgabe hilft dir bei ${c} : ${b}?`, r: `${a} · ${b}`, x: [`${a + 1} · ${b}`, `${c} · ${b}`],
      tipp: `Such die Malaufgabe mit der ${b}, die ${c} ergibt.`,
      sprich: `Welche Malaufgabe hilft dir bei ${c} geteilt durch ${b}?`,
    };
  });
  const easy = reihum(durch2, durch5, durch10, reihum(haelfte, umkehr, hilfe));

  // hard: alle Reihen, Sonderfälle, Platzhalter, Verteilen und Aufteilen als Geschichten
  const SCHWER = [3, 4, 6, 7, 8, 9];
  // Die Zahlen der Geschichten (unten) kommen bei den reinen Rechenaufgaben nicht noch einmal vor
  const dividendNeu = begrenzer(1);
  [12, 30, 20, 28, 18, 45, 35, 40, 24, 32, 16].forEach(dividendNeu);
  const alleReihen = sammle(12, () => {
    const b = eins(rng, SCHWER), a = zahl(rng, 2, 9), c = a * b;
    if (!dividendNeu(c)) return null;
    return rechnung(c, ":", b, [a + 1, a > 2 ? a - 1 : a + 2], `Umkehraufgabe: Zähle die ${b}er-Reihe auf, bis du bei ${c} bist.`);
  });
  const vergeben = new Set(alleReihen.map((a) => a.term.a));
  const selbst = zahl(rng, 6, 9), durchEins = eins(rng, [6, 7, 8, 9].filter((k) => k !== selbst));
  const sonder = [
    rechnung(selbst, ":", selbst, [0, selbst], `${selbst} Kekse für ${selbst} Kinder: Jedes Kind bekommt gleich viel.`),
    rechnung(durchEins, ":", 1, [1, durchEins - 1], "Geteilt durch 1: Ein Kind bekommt alles."),
  ];
  const platzNeu = begrenzer(1);
  const platzhalter = sammle(4, (i) => {
    const b = eins(rng, [3, 4, 6, 7, 8]), a = zahl(rng, 3, 9), c = a * b;
    if (a === b || vergeben.has(c) || !platzNeu(c)) return null;
    return i % 2 === 0
      ? luecke(c, ":", b, "a", [a + b, c + b, c - b], `Rechne rückwärts mit Mal: ${a} · ${b}.`)
      : luecke(c, ":", b, "b", [b + 1, b - 1], `Frag dich: ${a} mal wie viel ist ${c}?`);
  });
  const verteilen = (kontext, f, c, b, einheit) => geschichte(kontext, f, [[c, ":", b]], einheit, [c - b, c / b + 1],
    `Verteile reihum, bis nichts mehr übrig ist: ${c} : ${b}.`);
  const aufteilen = (kontext, f, c, b, einheit) => geschichte(kontext, f, [[c, ":", b]], einheit, [c - b, c / b + 1],
    `Wie oft passt die ${b} in die ${c}? Rechne ${c} : ${b}.`);
  const geschichten = [
    verteilen("Mia verteilt 12 Kekse gerecht an 3 Kinder.", "Wie viele Kekse bekommt jedes Kind?", 12, 3, "Kekse"),
    aufteilen("Ali hat 30 Eier. In jede Schachtel passen 6 Eier.", "Wie viele Schachteln füllt Ali?", 30, 6, "Schachteln"),
    verteilen("Ben legt 20 Karten gleichmäßig auf 4 Stapel.", "Wie viele Karten liegen auf jedem Stapel?", 20, 4, "Karten"),
    aufteilen("Beim Sport sind 28 Kinder. Sie bilden Gruppen mit je 4 Kindern.", "Wie viele Gruppen entstehen?", 28, 4, "Gruppen"),
    verteilen("Lena pflanzt 18 Blumen in 6 Töpfe. In jedem Topf sind gleich viele.", "Wie viele Blumen kommen in jeden Topf?", 18, 6, "Blumen"),
    aufteilen("Emma hat 45 Perlen. Für ein Armband braucht sie 9 Perlen.", "Wie viele Armbänder kann Emma fädeln?", 45, 9, "Armbänder"),
    verteilen("5 Kinder teilen sich 35 Sticker gerecht.", "Wie viele Sticker bekommt jedes Kind?", 35, 5, "Sticker"),
    aufteilen("Ida stellt 40 Stühle in Reihen auf. In jeder Reihe stehen 8 Stühle.", "Wie viele Reihen werden es?", 40, 8, "Reihen"),
    verteilen("Tom verteilt 24 Murmeln gerecht an 8 Freunde.", "Wie viele Murmeln bekommt jeder Freund?", 24, 8, "Murmeln"),
    aufteilen("32 Kinder fahren Boot. In jedes Boot passen 4 Kinder.", "Wie viele Boote brauchen die Kinder?", 32, 4, "Boote"),
    aufteilen("Noah hat 16 Euro. Eine Kinokarte kostet 8 Euro.", "Wie viele Kinokarten kann Noah kaufen?", 16, 8, "Karten"),
  ];
  const hard = reihum(alleReihen, geschichten, platzhalter, sonder);
  return { easy, hard };
}

/* ---------- 6. Geld bis 100 Euro ---------- */
/** Cent → „35 Euro", „85 Cent" oder „2 Euro 50 Cent". */
const geldText = (cent) => (cent % 100 === 0 ? `${cent / 100} Euro`
  : cent < 100 ? `${cent} Cent` : `${Math.floor(cent / 100)} Euro ${cent % 100} Cent`);
const EURO = 100;

function geldPool() {
  const rng = rngAusSeed("k2geld");
  const summe = (werte) => werte.reduce((s, w) => s + w, 0);
  const muenzen = (werte) => ({ art: "muenzen", werte });
  const ziehe = (stuecke, anzahl) => Array.from({ length: anzahl }, () => eins(rng, stuecke)).sort((a, b) => b - a);
  // Geschichte mit Geld: `weg` rechnet in Cent, Falschantworten ebenfalls in Cent
  const geld = (kontext, f, weg, kandidaten, tipp) => {
    const r = geldText(gehe(weg));
    return { f, r, x: falsch(r, kandidaten.map(geldText)), tipp, kontext, weg };
  };

  /* ----- easy: Euro-Beträge, Cent-Beträge, einfache Preise ----- */
  const lesenEuro = sammle(8, () => {
    const werte = ziehe([5000, 2000, 1000, 500, 200, 100], zahl(rng, 2, 4)), s = summe(werte), klein = werte[werte.length - 1];
    if (s > 100 * EURO || s + klein > 100 * EURO) return null;
    return {
      f: "Wie viel Geld ist das?", r: geldText(s), x: falsch(geldText(s), [geldText(s - klein), geldText(s + klein)]),
      tipp: "Fang mit dem größten Wert an und zähle Stück für Stück weiter.", bild: muenzen(werte),
    };
  });
  const lesenCent = sammle(3, () => {
    const werte = ziehe([50, 20, 10, 5, 2, 1], zahl(rng, 2, 4)), s = summe(werte), klein = werte[werte.length - 1];
    if (s + klein >= 100 || new Set(werte).size < 2) return null;
    return {
      f: "Wie viele Cent sind das zusammen?", r: geldText(s), x: falsch(geldText(s), [geldText(s - klein), geldText(s + klein)]),
      tipp: "Auf jeder Münze steht ihr Wert – zähle von der größten zur kleinsten.", bild: muenzen(werte),
    };
  });
  const kennen = [
    { f: "Welchen Schein gibt es wirklich?", r: "20-Euro-Schein", x: ["30-Euro-Schein", "25-Euro-Schein"], tipp: "Kleine Scheine gibt es zu 5, 10, 20, 50 und 100 Euro." },
    { f: "Welche Münze gibt es wirklich?", r: "20 Cent", x: ["25 Cent", "30 Cent"], tipp: "Cent-Münzen gibt es zu 1, 2, 5, 10, 20 und 50 Cent." },
    { f: "Welche Münze ist am meisten wert?", r: "2 Euro", x: ["50 Cent", "1 Euro"], tipp: "Euro ist mehr als Cent: Schon 1 Euro sind 100 Cent." },
    { f: "1 Euro = ? Cent", r: "100 Cent", x: ["10 Cent", "1000 Cent"], tipp: "Für 1 Euro brauchst du 100 einzelne Cent.", sprich: "Wie viele Cent sind 1 Euro?" },
    { f: "Mit welchem Schein kannst du 18 Euro bezahlen?", r: "20-Euro-Schein", x: ["10-Euro-Schein", "5-Euro-Schein"], tipp: "Der Schein muss mindestens so viel wert sein wie der Preis." },
    { f: "Mia hat 3 Münzen zu 2 Euro. Wie viel Geld hat sie?", r: "6 Euro", x: ["5 Euro", "3 Euro"], tipp: "Zähle in Zweierschritten: 2, 4, 6.", bild: muenzen([200, 200, 200]), weg: [[3, "·", 2 * EURO]] },
  ];
  const preise = [
    geld("Ein Ball kostet 12 Euro, ein Springseil 6 Euro.", "Wie viel kosten Ball und Seil zusammen?", [[12 * EURO, "+", 6 * EURO]], [6 * EURO, 17 * EURO], "Zusammen heißt plus: 12 + 6."),
    geld("Ein Buch kostet 20 Euro, eine Tasche 30 Euro.", "Wie viel kosten Buch und Tasche zusammen?", [[20 * EURO, "+", 30 * EURO]], [5 * EURO, 60 * EURO], "Rechne mit den Zehnern: 2 Zehner + 3 Zehner."),
    geld("Ein Puzzle kostet 14 Euro, ein Malbuch 5 Euro.", "Wie viel kosten Puzzle und Malbuch zusammen?", [[14 * EURO, "+", 5 * EURO]], [9 * EURO, 64 * EURO], "Die Zehner bleiben, rechne nur die Einer: 4 + 5."),
    geld("Ein Helm kostet 40 Euro, eine Klingel 8 Euro.", "Wie viel kosten Helm und Klingel zusammen?", [[40 * EURO, "+", 8 * EURO]], [32 * EURO, 12 * EURO], "40 und 8 – die Einer kommen einfach zu den Zehnern dazu."),
    geld("Ein Rucksack kostet 35 Euro, eine Trinkflasche 10 Euro.", "Wie viel kosten Rucksack und Flasche?", [[35 * EURO, "+", 10 * EURO]], [36 * EURO, 25 * EURO], "Plus 10: Der Zehner wächst um eins, die Einer bleiben."),
    geld("Ein Stift kostet 2 Euro, ein Heft 3 Euro, ein Lineal 4 Euro.", "Wie viel kostet alles zusammen?", [[2 * EURO, "+", 3 * EURO], ["e", "+", 4 * EURO]], [5 * EURO, 8 * EURO], "Zähle alle drei Preise zusammen: 2 + 3 + 4."),
  ];
  const wechseln = [
    { f: "Wie viele 2-Euro-Münzen sind so viel wert wie 10 Euro?", r: "5", x: ["8", "20"], tipp: "Zähle in Zweierschritten bis 10: 2, 4, 6, 8, 10.", term: { a: 10, op: ":", b: 2 } },
    { f: "Wie viele 5-Euro-Scheine sind so viel wert wie 20 Euro?", r: "4", x: ["15", "5"], tipp: "Zähle in Fünferschritten bis 20: 5, 10, 15, 20.", term: { a: 20, op: ":", b: 5 } },
    { f: "Wie viele 10-Cent-Münzen sind zusammen 50 Cent?", r: "5", x: ["40", "10"], tipp: "Zähle in Zehnerschritten bis 50: 10, 20, 30, 40, 50.", term: { a: 50, op: ":", b: 10 } },
  ];
  const rueckgeld = [
    geld("Mia kauft ein Heft für 7 Euro. Sie zahlt mit einem 10-Euro-Schein.", "Wie viel Geld bekommt Mia zurück?", [[10 * EURO, "-", 7 * EURO]], [17 * EURO, 4 * EURO], "Ergänze vom Preis bis zum Schein: von 7 bis 10."),
    geld("Ben kauft ein Spiel für 14 Euro. Er zahlt mit einem 20-Euro-Schein.", "Wie viel Geld bekommt Ben zurück?", [[20 * EURO, "-", 14 * EURO]], [16 * EURO, 34 * EURO], "Ergänze von 14 bis 20."),
    geld("Lena kauft Schuhe für 30 Euro. Sie zahlt mit einem 50-Euro-Schein.", "Wie viel Geld bekommt Lena zurück?", [[50 * EURO, "-", 30 * EURO]], [80 * EURO, 2 * EURO], "Rechne mit den Zehnern: 5 Zehner − 3 Zehner."),
    geld("Tom kauft ein Buch für 16 Euro. Er zahlt mit einem 20-Euro-Schein.", "Wie viel Geld bekommt Tom zurück?", [[20 * EURO, "-", 16 * EURO]], [14 * EURO, 36 * EURO], "Ergänze von 16 bis 20."),
    geld("Ali kauft einen Ball für 45 Euro. Er zahlt mit einem 50-Euro-Schein.", "Wie viel Geld bekommt Ali zurück?", [[50 * EURO, "-", 45 * EURO]], [15 * EURO, 95 * EURO], "Ergänze von 45 bis 50."),
  ];
  const easy = reihum(lesenEuro, preise, rueckgeld, kennen, [...lesenCent, ...wechseln]);

  /* ----- hard: Euro und Cent, Preise mit Übergang, Wechselgeld, zwei Schritte ----- */
  const euroNeu = begrenzer(1), centHoechstens = begrenzer(2);
  const lesenGemischt = sammle(6, () => {
    const euro = ziehe([2000, 1000, 500, 200, 100], zahl(rng, 1, 2)), cent = ziehe([50, 20, 10], zahl(rng, 1, 2));
    const e = summe(euro) / 100, c = summe(cent);
    if (c >= 100 || !alleFrei([euroNeu, e], [centHoechstens, c])) return null;
    const r = geldText(100 * e + c);
    return {
      f: "Wie viel Geld ist das?", r, x: falsch(r, [`${e} Euro ${c / 10} Cent`, geldText(100 * e + c - cent[cent.length - 1]), geldText(100 * e + c + 100)]),
      tipp: "Zähle erst die Euro, dann die Cent – und nenne beides getrennt.", bild: muenzen([...euro, ...cent]),
    };
  });
  const teuer = [
    geld("Ein Helm kostet 28 Euro, ein Fahrradschloss 15 Euro.", "Wie viel kosten Helm und Schloss zusammen?", [[28 * EURO, "+", 15 * EURO]], [33 * EURO, 13 * EURO], "Erst 28 + 10 = 38, dann noch 5 dazu."),
    geld("Die Schuhe kosten 47 Euro, die Socken 6 Euro.", "Wie viel kosten Schuhe und Socken zusammen?", [[47 * EURO, "+", 6 * EURO]], [43 * EURO, 54 * EURO], "Erst bis zum Zehner: 47 + 3 = 50, dann noch 3 dazu."),
    geld("Ein Buch kostet 19 Euro, ein Spiel 25 Euro.", "Wie viel kosten Buch und Spiel zusammen?", [[19 * EURO, "+", 25 * EURO]], [34 * EURO, 45 * EURO], "Rechne 20 + 25 und zieh 1 wieder ab."),
    geld("Ein Rucksack kostet 36 Euro, ein Mäppchen 18 Euro.", "Wie viel kosten Rucksack und Mäppchen?", [[36 * EURO, "+", 18 * EURO]], [44 * EURO, 18 * EURO], "Erst 36 + 10 = 46, dann noch 8 dazu."),
    geld("Ein Roller kostet 65 Euro, ein Helm 27 Euro.", "Wie viel kosten Roller und Helm zusammen?", [[65 * EURO, "+", 27 * EURO]], [82 * EURO, 38 * EURO], "Erst 65 + 20 = 85, dann noch 7 dazu."),
  ];
  const wechselgeld = [
    geld("Emma kauft eine Hose für 23 Euro. Sie zahlt mit einem 50-Euro-Schein.", "Wie viel Geld bekommt Emma zurück?", [[50 * EURO, "-", 23 * EURO]], [37 * EURO, 33 * EURO], "Ergänze: von 23 bis 30 sind es 7, von 30 bis 50 noch 20."),
    geld("Noah kauft ein Spiel für 38 Euro. Er zahlt mit einem 50-Euro-Schein.", "Wie viel Geld bekommt Noah zurück?", [[50 * EURO, "-", 38 * EURO]], [22 * EURO, 88 * EURO], "Ergänze: von 38 bis 40 sind es 2, von 40 bis 50 noch 10."),
    geld("Ida kauft Inliner für 65 Euro. Sie zahlt mit einem 100-Euro-Schein.", "Wie viel Geld bekommt Ida zurück?", [[100 * EURO, "-", 65 * EURO]], [45 * EURO, 25 * EURO], "Ergänze: von 65 bis 70 sind es 5, von 70 bis 100 noch 30."),
    geld("Mia kauft eine Jacke für 72 Euro. Sie zahlt mit einem 100-Euro-Schein.", "Wie viel Rückgeld bekommt Mia?", [[100 * EURO, "-", 72 * EURO]], [38 * EURO, 32 * EURO], "Ergänze: von 72 bis 80 sind es 8, von 80 bis 100 noch 20."),
    geld("Ben kauft ein Buch für 9 Euro. Er zahlt mit einem 20-Euro-Schein.", "Wie viel Rückgeld bekommt Ben?", [[20 * EURO, "-", 9 * EURO]], [29 * EURO, 21 * EURO], "Rechne 20 − 10 und gib 1 wieder dazu."),
    geld("Tom kauft Fußballschuhe für 56 Euro. Er zahlt mit einem 100-Euro-Schein.", "Wie viel Rückgeld bekommt Tom?", [[100 * EURO, "-", 56 * EURO]], [54 * EURO, 46 * EURO], "Ergänze: von 56 bis 60 sind es 4, von 60 bis 100 noch 40."),
  ];
  const euroCent = [
    geld("Ein Eis kostet 1 Euro 50 Cent. Ben kauft 2 Eis.", "Wie viel bezahlt Ben für das Eis?", [[2, "·", 150]], [250, 350], "50 Cent und 50 Cent sind zusammen 1 Euro."),
    geld("Lena hat 5 Euro. Sie kauft ein Heft für 2 Euro 50 Cent.", "Wie viel Geld bleibt Lena übrig?", [[500, "-", 250]], [350, 750], "Erst 2 Euro weg, dann noch 50 Cent – dafür musst du 1 Euro wechseln."),
    geld("Ali hat 1 Euro 20 Cent. Er findet noch 30 Cent.", "Wie viel Geld hat Ali jetzt?", [[120, "+", 30]], [420, 140], "Die Euro bleiben, rechne nur die Cent: 20 + 30."),
    geld("Eine Brezel kostet 80 Cent. Lena zahlt mit einer 1-Euro-Münze.", "Wie viel Rückgeld bekommt Lena?", [[100, "-", 80]], [180, 30], "1 Euro sind 100 Cent – ergänze von 80 bis 100."),
    geld("Ein Apfel kostet 50 Cent. Noah kauft 4 Äpfel.", "Wie viel bezahlt Noah für die Äpfel?", [[4, "·", 50]], [54, 400], "Zwei Äpfel kosten zusammen 1 Euro."),
    geld("Ida hat 60 Cent, Tom hat 70 Cent.", "Wie viel Geld haben Ida und Tom zusammen?", [[60, "+", 70]], [103, 120], "60 + 70 = 130 Cent – 100 Cent davon sind 1 Euro."),
  ];
  const zweiSchritte = [
    geld("Mia kauft 2 Hefte zu je 3 Euro. Sie zahlt mit einem 10-Euro-Schein.", "Wie viel Rückgeld bekommt Mia für die Hefte?", [[2, "·", 3 * EURO], [10 * EURO, "-", "e"]], [7 * EURO, 6 * EURO], "Erst der Preis: 2 · 3 = 6, dann von 10 abziehen."),
    geld("Tom hat 10 Euro. Ein Ball kostet 8 Euro, eine Pumpe 5 Euro.", "Wie viel Geld fehlt Tom für beides?", [[8 * EURO, "+", 5 * EURO], ["e", "-", 10 * EURO]], [13 * EURO, 2 * EURO], "Erst beide Preise zusammenzählen, dann mit Toms 10 Euro vergleichen."),
    geld("Ben hat 20 Euro. Er kauft ein Buch für 9 Euro und ein Spiel für 7 Euro.", "Wie viel Geld bleibt Ben übrig?", [[9 * EURO, "+", 7 * EURO], [20 * EURO, "-", "e"]], [16 * EURO, 11 * EURO], "Erst beide Preise zusammenzählen: 9 + 7, dann von 20 abziehen."),
    geld("Emma hat 15 Euro. Sie spart 4 Wochen lang jede Woche 5 Euro dazu.", "Wie viel Geld hat Emma dann?", [[4, "·", 5 * EURO], ["e", "+", 15 * EURO]], [20 * EURO, 24 * EURO], "Erst das Gesparte: 4 · 5 = 20, dann die 15 Euro dazu."),
  ];
  const legen = [
    { f: "Mit welchen zwei Scheinen bezahlst du genau 30 Euro?", r: "20 und 10 Euro", x: ["20 und 5 Euro", "10 und 5 Euro"], tipp: "Nimm den größten Schein, der passt, und ergänze bis 30." },
    { f: "Mit welchen zwei Münzen legst du genau 70 Cent?", r: "50 und 20 Cent", x: ["50 und 10 Cent", "20 und 20 Cent"], tipp: "Nimm die größte Münze, die passt, und ergänze bis 70." },
    { f: "Mit welchen zwei Münzen legst du genau 3 Euro?", r: "2 und 1 Euro", x: ["2 und 2 Euro", "1 und 1 Euro"], tipp: "Nimm die größte Münze und ergänze bis 3." },
    { f: "Wie viele 50-Cent-Münzen sind so viel wert wie 2 Euro?", r: "4", x: ["2", "100"], tipp: "Zwei 50-Cent-Münzen sind 1 Euro – für 2 Euro brauchst du doppelt so viele." },
    { f: "Was ist am meisten wert: 99 Cent, 1 Euro oder 1 Euro 5 Cent?", r: "1 Euro 5 Cent", x: ["99 Cent", "1 Euro"], tipp: "1 Euro sind 100 Cent – vergleiche alles in Cent." },
  ];
  const hard = reihum(lesenGemischt, teuer, wechselgeld, euroCent, zweiSchritte, legen);
  return { easy, hard };
}

/* ---------- 7. Uhr: halb & viertel ---------- */
const STUNDE_WORT = ["zwölf", "eins", "zwei", "drei", "vier", "fünf", "sechs", "sieben", "acht", "neun", "zehn", "elf"];
const stundeWort = (h) => STUNDE_WORT[h % 12];
const volleUhr = (h) => (h % 12 === 1 ? "ein Uhr" : `${stundeWort(h)} Uhr`);
const nach = (h) => (h % 12) + 1; // die nächste Stunde auf dem Ziffernblatt
const vor = (h) => ((h + 10) % 12) + 1; // die Stunde davor
const zz = (m) => String(m).padStart(2, "0");

function uhrPool() {
  const rng = rngAusSeed("k2uhr");
  const stunden = (anzahl, erlaubt = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]) => mischen(erlaubt, rng).slice(0, anzahl);
  const uhr = (zeit) => ({ art: "uhr", zeit });
  const lesen = (zeit, r, x, tipp, f = "Wie spät ist es?") => ({ f, r, x, tipp, bild: uhr(zeit) });
  // Uhr im Bild zeigt JETZT, gefragt ist die Zeit `delta` Minuten später (oder früher)
  const spaeter = (f, zeit, delta, x, tipp) => ({ f, r: `${uhrPlus(zeit, delta)} Uhr`, x, tipp, bild: uhr(zeit), delta });
  const wissen = (f, r, x, tipp) => ({ f, r, x, tipp });
  const WORTE = "Wie heißt diese Uhrzeit in Worten?";

  /* ----- easy: volle und halbe Stunden ----- */
  const voll = stunden(6).map((h, i) => lesen(`${h}:00`, `${h}:00 Uhr`,
    i % 2 === 0 || h === 12 ? [`${h}:30 Uhr`, `${nach(h)}:00 Uhr`] : [`12:${zz(5 * h)} Uhr`, `${vor(h)}:00 Uhr`],
    "Der lange Zeiger steht auf der 12: volle Stunde – der kurze zeigt, welche."));
  const halbe = stunden(10); // zehn verschiedene Stunden: fünf für Worte, fünf für die Digitalzeit
  const halbWort = halbe.slice(0, 5).map((h) => lesen(`${h}:30`, `halb ${stundeWort(nach(h))}`, [`halb ${stundeWort(h)}`, volleUhr(nach(h))],
    `Langer Zeiger auf der 6 heißt halb – der kurze ist schon auf dem Weg zur ${nach(h)}.`, WORTE));
  const halbDigital = halbe.slice(5).map((h, i) => lesen(`${h}:30`, `${h}:30 Uhr`,
    [`${nach(h)}:30 Uhr`, i % 2 === 0 ? `${h}:06 Uhr` : `${h}:00 Uhr`],
    `Der kurze Zeiger ist an der ${h} vorbei, der lange steht auf der 6: 30 Minuten nach ${h} Uhr.`));
  const halbSprache = stunden(3, [2, 4, 6, 7, 8, 9, 10]).map((h) => wissen(
    `Es ist halb ${stundeWort(nach(h))}. Was zeigt die Digitaluhr?`, `${h}:30 Uhr`, [`${nach(h)}:30 Uhr`, `${nach(h)}:00 Uhr`],
    `Halb ${stundeWort(nach(h))} ist eine halbe Stunde vor ${nach(h)} Uhr.`));
  const zeiger = [
    wissen("Welcher Zeiger zeigt die Stunden?", "der kurze Zeiger", ["der lange Zeiger", "beide Zeiger"], "Der kurze, dicke Zeiger wandert langsam von Stunde zu Stunde."),
    wissen("Wo steht der lange Zeiger bei einer vollen Stunde?", "auf der 12", ["auf der 6", "auf der 3"], "Bei der 12 beginnt jede neue Stunde."),
    wissen("Wie viele Minuten hat eine Stunde?", "60 Minuten", ["100 Minuten", "30 Minuten"], "Der lange Zeiger braucht für eine ganze Runde 60 Minuten."),
    wissen("Welcher Zeiger zeigt die Minuten?", "der lange Zeiger", ["der kurze Zeiger", "kein Zeiger"], "Der lange, dünne Zeiger läuft in einer Stunde einmal ganz herum."),
    wissen("Wo steht der lange Zeiger bei halb?", "auf der 6", ["auf der 12", "auf der 9"], "Von der 12 bis zur 6 ist genau die halbe Runde."),
    wissen("Wie viele Minuten hat eine halbe Stunde?", "30 Minuten", ["50 Minuten", "15 Minuten"], "Eine halbe Stunde ist die Hälfte von 60 Minuten."),
    wissen("Wie viele Stunden hat ein Tag?", "24 Stunden", ["12 Stunden", "60 Stunden"], "Der kurze Zeiger läuft an einem Tag zweimal ganz herum: 12 + 12."),
  ];
  const stundeSpaeter = [
    ...stunden(3, [2, 3, 4, 5, 6, 7, 8, 9, 10]).map((h) => `${h}:00`),
    ...stunden(2, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]).map((h) => `${h}:30`),
  ].map((zeit) => spaeter("Wie spät ist es eine Stunde später?", zeit, 60, [`${uhrPlus(zeit, -60)} Uhr`, `${uhrPlus(zeit, 30)} Uhr`],
    "Der lange Zeiger läuft einmal ganz herum, der kurze rückt eine Zahl weiter."));
  const easy = reihum(voll, halbWort, zeiger, halbDigital, stundeSpaeter, halbSprache);

  /* ----- hard: Viertel nach, Viertel vor, 5-Minuten-Schritte, später und früher ----- */
  const KURZ = [1, 2, 3, 4, 5, 8, 9, 10, 11]; // kurze Stundenwörter – die Antwort bleibt lesbar
  const viertelNach = stunden(3).map((h) => lesen(`${h}:15`, `${h}:15 Uhr`, [`${h}:03 Uhr`, `${h}:45 Uhr`],
    "Langer Zeiger auf der 3: Eine Viertelstunde ist um – das sind 15 Minuten."));
  const viertelVor = stunden(3).map((h) => lesen(`${h}:45`, `${h}:45 Uhr`, [`${h}:09 Uhr`, `${nach(h)}:45 Uhr`],
    `Langer Zeiger auf der 9: 45 Minuten – der kurze ist fast bei der ${nach(h)}, aber noch nicht da.`));
  const nachWort = stunden(2, KURZ).map((h) => lesen(`${h}:15`, `Viertel nach ${stundeWort(h)}`, [`Viertel vor ${stundeWort(h)}`, `halb ${stundeWort(nach(h))}`],
    `Der kurze Zeiger ist gerade an der ${h} vorbei, der lange steht auf der 3: Viertel nach.`, WORTE));
  const vorWort = stunden(2, KURZ.filter((h) => KURZ.includes(nach(h)))).map((h) => lesen(`${h}:45`, `Viertel vor ${stundeWort(nach(h))}`,
    [`Viertel nach ${stundeWort(h)}`, `Viertel vor ${stundeWort(h)}`],
    `Der lange Zeiger steht auf der 9: Es fehlt noch eine Viertelstunde bis ${nach(h)} Uhr.`, WORTE));
  const fuenfStunden = stunden(6);
  const fuenfMinuten = mischen([5, 10, 20, 25, 35, 40, 50, 55], rng).slice(0, 6).map((m, i) => {
    const h = fuenfStunden[i];
    return lesen(`${h}:${zz(m)}`, `${h}:${zz(m)} Uhr`, [`${h}:${zz(m / 5)} Uhr`, m > 30 ? `${nach(h)}:${zz(m)} Uhr` : `${h}:${zz(60 - m)} Uhr`],
      `Jede Zahl am Rand zählt 5 Minuten – der lange Zeiger steht auf der ${m / 5}.`);
  });
  const HALB = "Wie spät ist es eine halbe Stunde später?";
  const wandern = [
    spaeter(HALB, "3:00", 30, ["4:00 Uhr", "2:30 Uhr"], "Eine halbe Stunde sind 30 Minuten: Der lange Zeiger wandert von der 12 zur 6."),
    spaeter(HALB, "7:30", 30, ["7:60 Uhr", "8:30 Uhr"], "30 + 30 = 60 Minuten – damit ist die Stunde voll."),
    spaeter("Wie spät ist es eine Viertelstunde später?", "6:00", 15, ["6:30 Uhr", "7:15 Uhr"], "Eine Viertelstunde sind 15 Minuten: Der lange Zeiger wandert bis zur 3."),
    spaeter(HALB, "5:15", 30, ["6:15 Uhr", "5:30 Uhr"], "Rechne 15 + 30 Minuten – die Stunde bleibt."),
    spaeter("Wie spät war es eine halbe Stunde früher?", "4:30", -30, ["5:00 Uhr", "3:30 Uhr"], "Dreh den langen Zeiger von der 6 zurück auf die 12."),
    spaeter(HALB, "9:45", 30, ["9:75 Uhr", "10:45 Uhr"], "Erst 15 Minuten bis zur vollen Stunde, dann noch 15 Minuten."),
    spaeter("Wie spät ist es eine Viertelstunde später?", "2:15", 15, ["2:45 Uhr", "3:15 Uhr"], "Rechne 15 + 15 Minuten – der lange Zeiger wandert von der 3 zur 6."),
  ];
  const wissenSchwer = [
    wissen("Wie viele Minuten hat eine Viertelstunde?", "15 Minuten", ["25 Minuten", "30 Minuten"], "Eine Stunde hat 60 Minuten – teile sie in 4 gleiche Teile."),
    wissen("Wo steht der lange Zeiger bei Viertel nach?", "auf der 3", ["auf der 9", "auf der 6"], "Nach einem Viertel der Runde ist der lange Zeiger bei der 3."),
    wissen("Der lange Zeiger wandert von der 1 zur 2. Wie lange dauert das?", "5 Minuten", ["1 Minute", "10 Minuten"], "12 Zahlen teilen sich 60 Minuten – jeder Schritt dauert gleich lang."),
    wissen("Wo steht der lange Zeiger bei Viertel vor?", "auf der 9", ["auf der 3", "auf der 6"], "Von der 9 fehlt noch ein Viertel der Runde bis zur 12."),
    wissen("Wie viele Minuten sind drei Viertelstunden?", "45 Minuten", ["30 Minuten", "75 Minuten"], "Rechne 15 + 15 + 15."),
    wissen("Wie viele Viertelstunden hat eine Stunde?", "4", ["2", "15"], "Viertel heißt: in 4 gleiche Teile geteilt."),
    wissen("Es ist 3 Uhr am Nachmittag. Was zeigt die Digitaluhr?", "15:00 Uhr", ["13:00 Uhr", "5:00 Uhr"], "Nach dem Mittag zählst du weiter: 12 + 3."),
    wissen("Die Digitaluhr zeigt 20:00 Uhr. Wie spät ist es am Abend?", "8 Uhr", ["10 Uhr", "2 Uhr"], "Am Abend ziehst du 12 ab: 20 − 12."),
  ];
  const dauer = (f, von, bis, r, x, tipp) => ({ f, r, x, tipp, dauer: { von, bis } });
  const dauern = [
    dauer("Die Pause geht von 10:00 Uhr bis 10:30 Uhr. Wie lange dauert sie?", "10:00", "10:30", "30 Minuten", ["10 Minuten", "60 Minuten"], "Der lange Zeiger wandert von der 12 bis zur 6."),
    dauer("Der Film läuft von 3:00 Uhr bis 5:00 Uhr. Wie lange dauert er?", "3:00", "5:00", "2 Stunden", ["8 Stunden", "3 Stunden"], "Zähle die vollen Stunden: von 3 bis 4, von 4 bis 5."),
    dauer("Mia spielt von 4:15 Uhr bis 4:45 Uhr. Wie lange spielt sie?", "4:15", "4:45", "30 Minuten", ["15 Minuten", "60 Minuten"], "Der lange Zeiger wandert von der 3 bis zur 9 – das ist eine halbe Runde."),
  ];
  const hard = reihum([...viertelNach, ...viertelVor], fuenfMinuten, wandern, wissenSchwer, [...nachWort, ...vorWort], dauern);
  return { easy, hard };
}

/* ---------- 8. Längen ---------- */
const EINHEIT_WORT = { cm: "Zentimeter", m: "Meter" };
/** Vorlesetext: Abkürzungen ausschreiben, damit „cm" nicht buchstabiert wird. */
const ausgeschrieben = (text) => text.replace(/(\d) cm\b/g, "$1 Zentimeter").replace(/(\d) m\b/g, "$1 Meter");

function laengenPool() {
  const rng = rngAusSeed("k2laengen");
  const wissen = (f, r, x, tipp, sprich) => ({ f, r, x, tipp, ...(sprich ? { sprich } : {}) });
  // Rechnung mit Längen: `weg` rechnet in der Einheit der Antwort
  const laenge = (f, weg, einheit, kandidaten, tipp, sprich) => {
    const r = gehe(weg);
    return {
      f, r: `${r} ${einheit}`, x: falsch(`${r} ${einheit}`, kandidaten.map((k) => (typeof k === "number" ? `${k} ${einheit}` : k))),
      tipp, weg, ...(sprich ? { sprich } : {}),
    };
  };
  const rechnen = (a, op, b, einheit, kandidaten, tipp) => laenge(`${a} ${einheit} ${ZEICHEN[op]} ${b} ${einheit} = ?`, [[a, op, b]], einheit, kandidaten, tipp,
    `Wie viel sind ${a} ${EINHEIT_WORT[einheit]} ${WORT[op]} ${b} ${EINHEIT_WORT[einheit]}?`);
  const sache = (kontext, f, weg, einheit, kandidaten, tipp) => ({ ...laenge(f, weg, einheit, kandidaten, tipp), kontext });
  const lineal = () => ({ art: "strahl", von: 0, bis: 10, schritt: 1, frage: [] }); // Zahlenstrahl als Lineal

  /* ----- easy: schätzen, vergleichen, am Lineal ablesen, einfach rechnen ----- */
  const schaetzen = [
    wissen("Wie hoch ist etwa eine Zimmertür?", "2 m", ["2 cm", "20 m"], "Eine Tür ist etwas höher als ein großer Erwachsener."),
    wissen("Wie lang ist etwa ein neuer Bleistift?", "18 cm", ["18 m", "2 cm"], "Ein Bleistift ist etwas länger als deine Hand."),
    wissen("Wie breit ist etwa dein Daumen?", "1 cm", ["10 cm", "1 m"], "Dein Daumen passt genau zwischen zwei Zahlen auf dem Lineal."),
    wissen("Wie lang ist etwa ein großes Schulheft?", "30 cm", ["3 cm", "3 m"], "Leg ein Lineal daneben: Heft und Lineal sind fast gleich lang."),
    wissen("Wie lang ist etwa ein Auto?", "4 m", ["40 cm", "40 m"], "Ein Auto ist etwa so lang wie zwei Betten hintereinander."),
    wissen("Wie hoch ist etwa dein Tisch in der Schule?", "70 cm", ["7 cm", "7 m"], "Der Tisch reicht dir im Stehen ungefähr bis zum Bauch."),
    wissen("Wie groß ist etwa ein Kind in der zweiten Klasse?", "130 cm", ["13 cm", "300 cm"], "Kinder in deinem Alter sind etwas größer als 1 m."),
    wissen("Wie lang ist etwa ein Bett?", "2 m", ["20 cm", "20 m"], "In ein Bett passt ein Erwachsener gerade so hinein."),
    wissen("Wie lang ist etwa ein Radiergummi?", "4 cm", ["40 cm", "4 m"], "Ein Radiergummi ist kürzer als dein kleiner Finger."),
    wissen("Wie lang ist etwa ein Bus?", "12 m", ["12 cm", "120 m"], "Ein Bus ist etwa so lang wie drei Autos hintereinander."),
  ];
  const einheiten = [
    wissen("Was misst du am besten in Zentimetern?", "einen Bleistift", ["einen Sportplatz", "eine Straße"], "Zentimeter passen zu kleinen Dingen, die auf den Tisch passen."),
    wissen("Wofür steht die Abkürzung cm?", "Zentimeter", ["Meter", "Kilometer"], "Das c kommt von „Zenti“, das m von „Meter“.", "Wofür steht die Abkürzung mit den Buchstaben c und m?"),
    wissen("Was misst du am besten in Metern?", "den Schulhof", ["einen Finger", "ein Heft"], "Meter passen zu großen Dingen, an denen du entlanggehen kannst."),
    wissen("Womit misst du, wie lang das Klassenzimmer ist?", "mit dem Maßband", ["mit der Waage", "mit der Uhr"], "Ein Maßband ist lang genug für mehrere Meter."),
    wissen("Wofür steht die Abkürzung m?", "Meter", ["Zentimeter", "Minute"], "Das m ist der erste Buchstabe des Wortes.", "Wofür steht bei Längen die Abkürzung mit dem Buchstaben m?"),
    wissen("Mia ist 120 cm groß, Ben ist 130 cm groß. Wer ist größer?", "Ben", ["Mia", "beide gleich"], "Vergleiche die Zehner: 12 Zehner oder 13 Zehner?"),
    wissen("Was ist am längsten: 1 cm, 10 cm oder 1 m?", "1 m", ["10 cm", "1 cm"], "1 m sind so viel wie 100 cm."),
  ];
  const vergleichen = [
    ...sammle(2, () => {
      const a = zahl(rng, 2, 8), b = zahl(rng, a + 1, 9), c = zahl(rng, 0, a - 1);
      const drei = [10 * a + b, 10 * b + a, 10 * b + c].sort((p, q) => p - q);
      return wissen(`Was ist am längsten: ${drei[0]} cm, ${drei[1]} cm oder ${drei[2]} cm?`, `${10 * b + a} cm`, [`${10 * a + b} cm`, `${10 * b + c} cm`],
        "Alle Längen sind in cm – vergleiche zuerst die Zehner, dann die Einer.");
    }),
    ...sammle(2, () => {
      const a = zahl(rng, 1, 6), b = zahl(rng, a + 1, 8), c = zahl(rng, b + 1, 9);
      const drei = [10 * a + b, 10 * b + a, 10 * a + c].sort((p, q) => p - q);
      return wissen(`Was ist am kürzesten: ${drei[0]} m, ${drei[1]} m oder ${drei[2]} m?`, `${10 * a + b} m`, [`${10 * b + a} m`, `${10 * a + c} m`],
        "Alle Längen sind in m – die kleinste Zahl ist die kürzeste Strecke.");
    }),
  ];
  const messen = [
    { ...laenge("Der Stift liegt am Lineal von der 0 bis zur 7. Wie lang ist er?", [[7, "-", 0]], "cm", [8, 6], "Beginnt etwas bei der 0, liest du die Länge am Ende ab."), bild: lineal() },
    { ...laenge("Der Nagel liegt am Lineal von der 2 bis zur 9. Wie lang ist er?", [[9, "-", 2]], "cm", [9, 11], "Zähle die Schritte von der 2 bis zur 9 – der Anfang ist nicht die 0."), bild: lineal() },
    { ...laenge("Die Schraube liegt am Lineal von der 3 bis zur 8. Wie lang ist sie?", [[8, "-", 3]], "cm", [8, 6], "Zähle die Schritte von der 3 bis zur 8."), bild: lineal() },
  ];
  const zehnerA = 10 * zahl(rng, 2, 5), zehnerB = 10 * zahl(rng, 1, 4);
  const mA = zahl(rng, 4, 9), mB = zahl(rng, 2, 9);
  const minusA = 10 * zahl(rng, 5, 9), minusB = 10 * zahl(rng, 1, 4);
  const gemischt = 10 * zahl(rng, 2, 8) + zahl(rng, 1, 4), dazu = zahl(rng, 2, 5);
  const mGross = zahl(rng, 6, 9), mKlein = zahl(rng, 2, 5);
  const wegA = 10 * zahl(rng, 3, 9) + zahl(rng, 6, 9), wegB = zahl(rng, 2, 5);
  const einfach = [
    rechnen(wegA, "-", wegB, "cm", [wegA + wegB, wegA - wegB - 10], "Die Zehner bleiben – zieh nur die Einer ab."),
    rechnen(zehnerA, "+", zehnerB, "cm", [(zehnerA + zehnerB) / 10, zehnerA + zehnerB + 10], "Rechne mit den Zehnern – die Einheit cm bleibt gleich."),
    rechnen(mA, "+", mB, "m", [`${mA + mB} cm`, mA + mB + 1], "Rechne nur mit den Zahlen und schreib dann die Einheit m dazu."),
    rechnen(minusA, "-", minusB, "cm", [minusA + minusB, minusA - minusB + 10], "Minus heißt: Es wird kürzer – rechne mit den Zehnern."),
    rechnen(gemischt, "+", dazu, "cm", [gemischt + 10 * dazu, `${gemischt + dazu} m`], "Die Zehner bleiben – rechne nur die Einer dazu."),
    rechnen(mGross, "-", mKlein, "m", [mGross + mKlein, mGross - mKlein + 1], "Rechne nur mit den Zahlen und schreib dann die Einheit m dazu."),
  ];
  const easy = reihum(schaetzen, einheiten, [...vergleichen, ...messen], einfach);

  /* ----- hard: m und cm umrechnen, vergleichen, rechnen, Geschichten ----- */
  const umrechnen = [
    wissen("1 m = ? cm", "100 cm", ["10 cm", "1000 cm"], "Ein Meterstab ist in 100 gleiche Zentimeter geteilt.", "Wie viele Zentimeter sind 1 Meter?"),
    wissen("100 cm = ? m", "1 m", ["10 m", "100 m"], "100 kleine Zentimeter ergeben zusammen einen ganzen Meter.", "Wie viele Meter sind 100 Zentimeter?"),
    laenge("Ein halber Meter = ? cm", [[100, ":", 2]], "cm", [5, 20], "Ein ganzer Meter hat 100 cm – nimm davon die Hälfte.", "Wie viele Zentimeter hat ein halber Meter?"),
    laenge("1 m − 30 cm = ? cm", [[100, "-", 30]], "cm", [130, 80], "Tausche 1 m in 100 cm um, dann kannst du abziehen.", "Wie viele Zentimeter sind 1 Meter minus 30 Zentimeter?"),
    laenge("60 cm + ? cm = 1 m", [[100, "-", 60]], "cm", [30, 50], "1 m sind 100 cm – ergänze von 60 bis 100.", "60 Zentimeter plus wie viele Zentimeter sind 1 Meter?"),
    laenge("Wie viel fehlt von 75 cm bis 1 m?", [[100, "-", 75]], "cm", [35, 15], "1 m sind 100 cm – ergänze erst bis 80, dann bis 100."),
    laenge("1 m 20 cm = ? cm", [[100, "+", 20]], "cm", [102, 12], "1 m sind 100 cm – die 20 cm kommen noch dazu.", "Wie viele Zentimeter sind 1 Meter und 20 Zentimeter?"),
    laenge("135 cm = 1 m und ? cm", [[135, "-", 100]], "cm", [135, 5], "Nimm von den 135 cm einen ganzen Meter weg, also 100 cm.", "135 Zentimeter sind 1 Meter und wie viele Zentimeter?"),
    laenge("2 m = ? cm", [[2, "·", 100]], "cm", [20, 102], "Jeder Meter hat 100 cm – nimm das zweimal.", "Wie viele Zentimeter sind 2 Meter?"),
    wissen("50 cm + 50 cm = ? m", "1 m", ["10 m", "100 m"], "Zusammen sind es 100 cm – und das ist genau ein ganzer Meter.", "Wie viele Meter sind 50 Zentimeter plus 50 Zentimeter?"),
  ];
  const vergleichSchwer = [
    wissen("Was ist länger: 90 cm oder 1 m?", "1 m", ["90 cm", "beide gleich"], "Rechne 1 m in 100 cm um, dann kannst du vergleichen."),
    wissen("Was ist am längsten: 99 cm, 1 m oder 1 m 10 cm?", "1 m 10 cm", ["99 cm", "1 m"], "Rechne alles in cm um: 99, 100 und 110."),
    wissen("Was ist genauso lang wie 1 m?", "100 cm", ["10 cm", "110 cm"], "Ein Meter hat genau 100 Zentimeter."),
    wissen("Was ist kürzer: 2 m oder 150 cm?", "150 cm", ["2 m", "beide gleich"], "Rechne 2 m in cm um: Das sind 200 cm."),
  ];
  const plusMit = sammle(2, () => {
    const z1 = zahl(rng, 1, 5), z2 = zahl(rng, 1, 8 - z1), e1 = zahl(rng, 3, 9), e2 = zahl(rng, 11 - e1, 9);
    const a = 10 * z1 + e1, b = 10 * z2 + e2;
    return rechnen(a, "+", b, "cm", [a + b - 10, a + b + 1], `Erst die Zehner: ${a} + ${10 * z2} = ${a + 10 * z2}, dann die ${e2} Einer dazu.`);
  });
  const einerNeu = begrenzer(1);
  const minusMit = sammle(2, () => {
    const z1 = zahl(rng, 4, 9), z2 = zahl(rng, 1, z1 - 2), e1 = zahl(rng, 1, 6), e2 = zahl(rng, e1 + 1, 9);
    const a = 10 * z1 + e1, b = 10 * z2 + e2;
    if (!alleFrei([einerNeu, e1], [einerNeu, e2])) return null;
    return rechnen(a, "-", b, "cm", [10 * (z1 - z2) + (e2 - e1), a - b + 10, a - b - 1], `Erst die Zehner: ${a} − ${10 * z2} = ${a - 10 * z2}, dann die ${e2} Einer weg.`);
  });
  const meterA = zahl(rng, 12, 18), meterB = zahl(rng, 21 - meterA > 3 ? 21 - meterA : 4, 9);
  const meterC = 10 * zahl(rng, 4, 8), meterD = 10 * zahl(rng, 1, 2) + 5;
  const rechnenSchwer = [
    ...plusMit, ...minusMit,
    rechnen(meterA, "+", meterB, "m", [meterA + meterB - 10, `${meterA + meterB} cm`, meterA + meterB + 1], `Erst bis zum Zehner: ${meterA} + ${20 - meterA} = 20, dann noch ${meterB - (20 - meterA)} dazu.`),
    rechnen(meterC, "-", meterD, "m", [meterC - meterD + 10, meterC + meterD], `Erst die Zehner: ${meterC} − ${meterD - 5} = ${meterC - meterD + 5}, dann noch 5 weg.`),
  ];
  const sachen = [
    sache("Ein Band ist 70 cm lang. Lena schneidet 25 cm ab.", "Wie lang ist das Band jetzt?", [[70, "-", 25]], "cm", [55, 95], "Abschneiden macht kürzer: 70 − 20 = 50, dann noch 5 weg."),
    sache("Ben springt 95 cm weit, Tom springt 78 cm weit.", "Wie viel weiter springt Ben?", [[95, "-", 78]], "cm", [27, 23], "Ergänze von 78 bis 95: erst bis 80, dann bis 95."),
    sache("Eine Bahn im Schwimmbad ist 25 m lang. Ida schwimmt 2 Bahnen.", "Wie weit schwimmt Ida?", [[2, "·", 25]], "m", [27, 45], "Zwei Bahnen sind das Doppelte: 25 + 25."),
    sache("Ali legt 3 Stifte hintereinander. Jeder Stift ist 10 cm lang.", "Wie lang ist die Reihe aus Stiften?", [[3, "·", 10]], "cm", [13, 20], "Drei gleich lange Stifte: 10 + 10 + 10."),
    sache("Emma wirft den Ball 14 m weit. Noah wirft 5 m weiter als Emma.", "Wie weit wirft Noah?", [[14, "+", 5]], "m", [9, 20], "Weiter heißt mehr Meter: 14 + 5."),
    sache("Ein Brett ist 1 m lang. Tom sägt 40 cm ab.", "Wie lang ist das Brett noch?", [[100, "-", 40]], "cm", [140, 50], "Tausche 1 m in 100 cm um, dann zieh 40 ab."),
  ];
  const schaetzenSchwer = [
    wissen("Wie breit ist etwa eine Zimmertür?", "90 cm", ["9 cm", "9 m"], "Eine Tür ist etwas schmaler als 1 m."),
    wissen("Wie lang ist etwa dein Fuß?", "20 cm", ["2 cm", "2 m"], "Dein Fuß ist kürzer als ein Lineal von 30 cm."),
    wissen("Wie hoch ist etwa ein Haus mit zwei Stockwerken?", "8 m", ["80 cm", "80 m"], "Ein Stockwerk ist etwa 3 m hoch, dazu kommt noch das Dach."),
    wissen("Wie lang ist etwa ein großer Schritt von dir?", "50 cm", ["5 cm", "5 m"], "Zwei große Schritte von dir sind ungefähr 1 m."),
  ];
  const hard = reihum(umrechnen, rechnenSchwer, sachen, vergleichSchwer, schaetzenSchwer);
  for (const a of [...easy, ...hard]) if (!a.sprich && /\d (cm|m)\b/.test(a.f)) a.sprich = ausgeschrieben(a.f);
  return { easy, hard };
}

/* ---------- 9. Sachaufgaben ---------- */
function sachPool() {
  const g = geschichte;
  const easy = [
    g("Mia hat 24 Sticker. Von Ben bekommt sie 5 Sticker dazu.", "Wie viele Sticker hat Mia jetzt?", [[24, "+", 5]], "Sticker", [19, 28], "Mia bekommt etwas dazu – also rechnest du plus: 24 + 5."),
    g("Im Bus sitzen 37 Kinder. An der Haltestelle steigen 6 Kinder aus.", "Wie viele Kinder sitzen noch im Bus?", [[37, "-", 6]], "Kinder", [43, 32], "Aussteigen heißt weniger werden: 37 − 6."),
    g("Tom hat 40 Murmeln, Ali hat 30 Murmeln.", "Wie viele Murmeln haben Tom und Ali zusammen?", [[40, "+", 30]], "Murmeln", [10, 60], "Zusammen heißt plus: 4 Zehner + 3 Zehner."),
    g("Ben hat 5 Tüten. In jeder Tüte sind 2 Äpfel.", "Wie viele Äpfel hat Ben?", [[5, "·", 2]], "Äpfel", [7, 12], "In jeder Tüte gleich viele – das ist eine Malaufgabe: 5 · 2."),
    g("Lenas Buch hat 68 Seiten. 20 Seiten hat sie schon gelesen.", "Wie viele Seiten muss Lena noch lesen?", [[68, "-", 20]], "Seiten", [88, 58], "Was schon gelesen ist, ziehst du ab: 68 − 20."),
    g("Emma ist 8 Jahre alt. Ihr Bruder Noah ist 5 Jahre älter.", "Wie alt ist Noah?", [[8, "+", 5]], "Jahre", [3, 12], "Älter heißt mehr Jahre: 8 + 5."),
    g("Auf der Wiese stehen 15 Kühe und 12 Schafe.", "Wie viele Tiere stehen auf der Wiese?", [[15, "+", 12]], "Tiere", [3, 37], "Alle Tiere zusammen: erst 15 + 10, dann noch 2."),
    g("Ida hat 50 Cent. Sie kauft ein Brötchen für 30 Cent.", "Wie viel Geld bleibt Ida übrig?", [[50, "-", 30]], "Cent", [80, 30], "Bezahlen macht das Geld weniger: 50 − 30."),
    g("In Bens Klasse sind 23 Kinder. Heute fehlen 3 Kinder.", "Wie viele Kinder sind heute in der Klasse?", [[23, "-", 3]], "Kinder", [26, 21], "Wer fehlt, wird abgezogen: 23 − 3."),
    g("Ein Heft kostet 2 Euro. Ali kauft 4 Hefte.", "Wie viel bezahlt Ali für die Hefte?", [[4, "·", 2]], "Euro", [6, 10], "4 Hefte kosten 4-mal so viel wie eins: 4 · 2."),
    g("Noah hat 36 Karten. Mia hat 4 Karten mehr als Noah.", "Wie viele Karten hat Mia?", [[36, "+", 4]], "Karten", [32, 39], "Mehr als Noah heißt plus: 36 + 4."),
    g("Im Regal stehen 45 Bücher. Lena stellt 30 Bücher dazu.", "Wie viele Bücher stehen jetzt im Regal?", [[45, "+", 30]], "Bücher", [15, 48], "Dazustellen heißt plus: Die Einer bleiben, die Zehner wachsen."),
    g("Tom hat 18 Euro gespart. Zum Geburtstag bekommt er 10 Euro.", "Wie viel Geld hat Tom jetzt?", [[18, "+", 10]], "Euro", [8, 19], "Er bekommt Geld dazu: 18 + 10."),
    g("Emma pflückt 60 Kirschen. 20 Kirschen isst sie gleich auf.", "Wie viele Kirschen bleiben übrig?", [[60, "-", 20]], "Kirschen", [80, 30], "Gegessene Kirschen sind weg: 6 Zehner − 2 Zehner."),
    g("Auf dem Teich schwimmen 14 Enten. 6 Enten fliegen weg.", "Wie viele Enten schwimmen noch auf dem Teich?", [[14, "-", 6]], "Enten", [20, 9], "Wegfliegen heißt minus: erst 4 weg bis zur 10, dann noch 2."),
    g("Jedes Kind hat 10 Finger. Am Tisch sitzen 3 Kinder.", "Wie viele Finger haben die Kinder zusammen?", [[3, "·", 10]], "Finger", [13, 20], "3 Kinder mit je 10 Fingern: 3 · 10."),
    g("Ida ist 9 Jahre alt. Ihre Mutter ist 39 Jahre alt.", "Wie viele Jahre ist die Mutter älter als Ida?", [[39, "-", 9]], "Jahre", [48, 20], "Den Unterschied findest du mit Minus: 39 − 9."),
    g("Ein Bus hat 50 Plätze. 42 Plätze sind schon besetzt.", "Wie viele Plätze sind noch frei?", [[50, "-", 42]], "Plätze", [92, 12], "Ergänze von 42 bis 50 – so viele Plätze fehlen noch."),
    g("Ali hat 5 Euro. Lena hat doppelt so viel Geld wie Ali.", "Wie viel Geld hat Lena?", [[5, "·", 2]], "Euro", [7, 15], "Doppelt heißt: zweimal dasselbe, also 5 + 5."),
    g("Noah sammelt Kastanien: am Montag 26 und am Dienstag 12.", "Wie viele Kastanien hat Noah gesammelt?", [[26, "+", 12]], "Kastanien", [14, 48], "Beide Tage zusammen: erst 26 + 10, dann noch 2."),
    g("Mia hat 16 Gummibärchen. Die Hälfte gibt sie Tom.", "Wie viele Gummibärchen bekommt Tom?", [[16, ":", 2]], "Gummibärchen", [14, 6], "Die Hälfte: Teile 16 in zwei gleich große Teile."),
    g("Emma hat 47 Perlen. Für eine Kette braucht sie 7 Perlen.", "Wie viele Perlen hat Emma danach noch?", [[47, "-", 7]], "Perlen", [54, 41], "Verbrauchte Perlen ziehst du ab: 47 − 7."),
    g("In einer Schachtel sind 5 Stifte. Tom hat 6 Schachteln.", "Wie viele Stifte hat Tom?", [[6, "·", 5]], "Stifte", [11, 25], "6 Schachteln mit je 5 Stiften: 6 · 5."),
    g("Ein Puzzle hat 90 Teile. Ida hat schon 60 Teile gelegt.", "Wie viele Teile fehlen noch?", [[90, "-", 60]], "Teile", [40, 20], "Was schon liegt, ziehst du ab: 9 Zehner − 6 Zehner."),
    g("Ali hat 12 rote und 7 blaue Bausteine.", "Wie viele Bausteine hat Ali?", [[12, "+", 7]], "Bausteine", [5, 18], "Rote und blaue zusammen: 12 + 7."),
    g("Mias Schulweg dauert 15 Minuten. Ben braucht 5 Minuten länger.", "Wie lange braucht Ben für den Schulweg?", [[15, "+", 5]], "Minuten", [10, 25], "Länger heißt mehr Minuten: 15 + 5."),
    g("Im Zoo leben 28 Affen. 2 Affenbabys kommen dazu.", "Wie viele Affen leben jetzt im Zoo?", [[28, "+", 2]], "Affen", [26, 48], "Dazukommen heißt plus: 28 + 2 macht den Zehner voll."),
    g("Ida backt 2 Bleche Plätzchen. Auf jedem Blech liegen 10 Plätzchen.", "Wie viele Plätzchen backt Ida?", [[2, "·", 10]], "Plätzchen", [12, 30], "2 Bleche mit je 10 Plätzchen: 2 · 10."),
  ];
  const hard = [
    g("Mia hat 35 Sticker. Sie bekommt 20 dazu und verschenkt dann 8.", "Wie viele Sticker hat Mia am Ende?", [[35, "+", 20], ["e", "-", 8]], "Sticker", [63, 55], "Zwei Schritte: erst 35 + 20, dann die 8 verschenkten abziehen."),
    g("Im Bus sitzen 42 Kinder. 15 steigen aus, danach steigen 6 ein.", "Wie viele Kinder sind jetzt im Bus?", [[42, "-", 15], ["e", "+", 6]], "Kinder", [27, 21], "Erst aussteigen: 42 − 15, dann die 6 neuen Kinder dazu."),
    g("Tom kauft 3 Hefte zu je 2 Euro und einen Stift für 4 Euro.", "Wie viel bezahlt Tom?", [[3, "·", 2], ["e", "+", 4]], "Euro", [9, 6], "Erst die Hefte: 3 · 2, dann den Stift dazu."),
    g("Lena hat 50 Euro. Sie kauft ein Spiel für 18 Euro und ein Buch für 12 Euro.", "Wie viel Geld bleibt Lena übrig?", [[18, "+", 12], [50, "-", "e"]], "Euro", [32, 30], "Erst beide Preise zusammen: 18 + 12, dann von 50 abziehen."),
    g("Ben hat 4 Tüten mit je 5 Bonbons. 3 Bonbons isst er auf.", "Wie viele Bonbons hat Ben noch?", [[4, "·", 5], ["e", "-", 3]], "Bonbons", [20, 6], "Erst alle Bonbons: 4 · 5, dann die 3 gegessenen abziehen."),
    g("In der Klasse sind 12 Mädchen und 13 Jungen. 4 Kinder sind heute krank.", "Wie viele Kinder sind heute da?", [[12, "+", 13], ["e", "-", 4]], "Kinder", [25, 29], "Erst alle Kinder: 12 + 13, dann die 4 kranken abziehen."),
    g("Ali verteilt 24 Karten gerecht an 4 Kinder. Eines ist Emma, sie hatte schon 5 Karten.", "Wie viele Karten hat Emma jetzt?", [[24, ":", 4], ["e", "+", 5]], "Karten", [6, 15], "Erst verteilen: 24 : 4, dann Emmas 5 Karten dazu."),
    g("Ida spart 6 Wochen lang jede Woche 5 Euro. Dann kauft sie ein Buch für 12 Euro.", "Wie viel Geld hat Ida danach noch?", [[6, "·", 5], ["e", "-", 12]], "Euro", [30, 42], "Erst das Gesparte: 6 · 5, dann den Preis abziehen."),
    g("Noah hat 60 Murmeln. Er gewinnt 15 und verliert danach 20.", "Wie viele Murmeln hat Noah am Ende?", [[60, "+", 15], ["e", "-", 20]], "Murmeln", [95, 75], "Erst gewinnen: 60 + 15, dann die 20 verlorenen abziehen."),
    g("Auf dem Parkplatz stehen 28 Autos. 9 fahren weg, dann kommen 14 dazu.", "Wie viele Autos stehen jetzt da?", [[28, "-", 9], ["e", "+", 14]], "Autos", [19, 51], "Erst wegfahren: 28 − 9, dann die 14 neuen Autos dazu."),
    g("Emma kauft 2 Eis zu je 3 Euro. Sie zahlt mit einem 10-Euro-Schein.", "Wie viel Geld bekommt Emma zurück?", [[2, "·", 3], [10, "-", "e"]], "Euro", [7, 6], "Erst der Preis: 2 · 3, dann von 10 abziehen."),
    g("Tom ist 9 Jahre alt. Sein Vater ist 4-mal so alt. Die Mutter ist 2 Jahre jünger als der Vater.", "Wie alt ist Toms Mutter?", [[4, "·", 9], ["e", "-", 2]], "Jahre", [36, 38], "Erst der Vater: 4 · 9, dann 2 Jahre abziehen."),
    g("Lena hat 30 Perlen. Sie fädelt 3 Ketten mit je 8 Perlen.", "Wie viele Perlen bleiben Lena übrig?", [[3, "·", 8], [30, "-", "e"]], "Perlen", [24, 19], "Erst die verbrauchten Perlen: 3 · 8, dann von 30 abziehen."),
    g("In einem Kasten sind 6 Flaschen. Ben trägt 2 Kästen und noch 3 einzelne Flaschen.", "Wie viele Flaschen trägt Ben?", [[2, "·", 6], ["e", "+", 3]], "Flaschen", [11, 12], "Erst die Kästen: 2 · 6, dann die 3 einzelnen Flaschen dazu."),
    g("Ali hat 45 Euro. Er bekommt 20 Euro und kauft dann einen Ball für 30 Euro.", "Wie viel Geld hat Ali danach?", [[45, "+", 20], ["e", "-", 30]], "Euro", [65, 95], "Erst dazurechnen: 45 + 20, dann den Ball abziehen."),
    g("Im Garten stehen 7 Reihen mit je 5 Tulpen. Ida pflückt 10 Tulpen.", "Wie viele Tulpen stehen noch im Garten?", [[7, "·", 5], ["e", "-", 10]], "Tulpen", [35, 22], "Erst alle Tulpen: 7 · 5, dann die 10 gepflückten abziehen."),
    g("Noah bringt 18 Kekse mit, Emma 14 Kekse. 4 Kinder teilen alle Kekse gerecht.", "Wie viele Kekse bekommt jedes Kind?", [[18, "+", 14], ["e", ":", 4]], "Kekse", [32, 7], "Erst alle Kekse zusammen: 18 + 14, dann durch 4 teilen."),
    g("Ein Buch hat 80 Seiten. Tom liest am Montag 25 Seiten und am Dienstag 30 Seiten.", "Wie viele Seiten muss Tom noch lesen?", [[25, "+", 30], [80, "-", "e"]], "Seiten", [55, 35], "Erst die gelesenen Seiten: 25 + 30, dann von 80 abziehen."),
    g("Lena hat 3 Schachteln mit je 10 Stiften und noch 4 einzelne Stifte.", "Wie viele Stifte hat Lena?", [[3, "·", 10], ["e", "+", 4]], "Stifte", [30, 43], "3 Schachteln sind 3 Zehner – die 4 einzelnen Stifte sind die Einer."),
    g("Ben hat 100 Punkte. Er verliert erst 30 Punkte und dann noch 25 Punkte.", "Wie viele Punkte hat Ben noch?", [[100, "-", 30], ["e", "-", 25]], "Punkte", [55, 70], "Schritt für Schritt: erst 100 − 30, dann noch 25 weg."),
    g("Mia ist 8 Jahre alt. Ida ist doppelt so alt wie Mia. Ali ist 3 Jahre jünger als Ida.", "Wie alt ist Ali?", [[8, "·", 2], ["e", "-", 3]], "Jahre", [16, 5], "Erst Ida: das Doppelte von 8, dann 3 Jahre abziehen."),
    g("Emma hat 20 Euro. Sie kauft 3 Kinokarten zu je 5 Euro.", "Wie viel Geld bleibt Emma übrig?", [[3, "·", 5], [20, "-", "e"]], "Euro", [15, 12], "Erst der Preis: 3 · 5, dann von 20 abziehen."),
    g("Auf dem Hof spielen 16 Kinder. Die Hälfte geht heim, dann kommen 5 neue Kinder.", "Wie viele Kinder spielen jetzt auf dem Hof?", [[16, ":", 2], ["e", "+", 5]], "Kinder", [8, 21], "Erst die Hälfte von 16, dann die 5 neuen Kinder dazu."),
    g("Tom hat 27 Sticker. Noah hat 9 Sticker mehr als Tom.", "Wie viele Sticker haben beide zusammen?", [[27, "+", 9], ["e", "+", 27]], "Sticker", [36, 45], "Erst Noahs Sticker: 27 + 9, dann beide Mengen zusammenzählen."),
  ];
  return { easy, hard };
}

/* ---------- 10. Spiegeln & Körper ---------- */
function spiegelnPool() {
  const w = (f, r, x, tipp, bild) => ({ f, r, x, tipp, ...(bild ? { bild } : {}) });
  const formen = (...folge) => ({ art: "formen", folge });
  const achse = (buchstaben, r, tipp) => w(`Welcher Buchstabe hat eine Spiegelachse: ${buchstaben[0]}, ${buchstaben[1]} oder ${buchstaben[2]}?`,
    r, buchstaben.filter((b) => b !== r), tipp);
  const keine = (buchstaben, r, tipp) => w(`Welcher Buchstabe hat keine Spiegelachse: ${buchstaben[0]}, ${buchstaben[1]} oder ${buchstaben[2]}?`,
    r, buchstaben.filter((b) => b !== r), tipp);
  const koerper = (ding, r, x, tipp) => w(`Welche Körperform hat ${ding}?`, r, x, tipp);
  const ECKEN = "Wie viele Ecken hat diese Form?";
  const NAME = "Wie heißt diese Form?";
  const WEITER = "Welche Form kommt als Nächstes?";

  const buchstaben = [
    achse(["A", "F", "G"], "A", "Falte das A in der Mitte von oben nach unten: Beide Hälften passen aufeinander."),
    achse(["M", "P", "R"], "M", "Stell einen Spiegel in die Mitte des M: Die linke Hälfte sieht aus wie die rechte."),
    keine(["A", "F", "M"], "F", "Beim F zeigen die Striche nur nach rechts – links fehlt das Gegenstück."),
    achse(["J", "L", "T"], "T", "Falte das T in der Mitte von oben nach unten: Der Querstrich ist links und rechts gleich lang."),
    achse(["H", "N", "Z"], "H", "N und Z haben einen schrägen Strich – beim Falten passen die Hälften nicht aufeinander."),
    keine(["R", "T", "U"], "R", "Beim R sind Bogen und Bein nur auf einer Seite."),
    achse(["G", "O", "Q"], "O", "Das O ist rundum gleich – G und Q haben an einer Seite einen Strich mehr."),
    achse(["P", "S", "U"], "U", "Falte das U in der Mitte: Der linke Bogen liegt genau auf dem rechten."),
  ];
  const begriffe = [
    w("Was ist eine Spiegelachse?", "eine Faltlinie", ["eine Ecke", "ein Kreis"], "An der Spiegelachse kannst du falten: Beide Hälften passen genau aufeinander."),
    w("Ein Schmetterling hat zwei gleiche Hälften. Wie nennt man das?", "symmetrisch", ["eckig", "schief"], "Symmetrisch heißt: Links und rechts von der Mitte sieht es gleich aus."),
    w("Welche Form hat keine Ecken?", "Kreis", ["Dreieck", "Quadrat"], "Fahre mit dem Finger am Rand entlang: Beim Kreis geht es immer rund weiter."),
    w("Welche Form hat 4 gleich lange Seiten?", "Quadrat", ["Rechteck", "Dreieck"], "Beim Rechteck sind nur die gegenüberliegenden Seiten gleich lang."),
  ];
  const namen = [
    w(NAME, "Rechteck", ["Quadrat", "Dreieck"], "Vier Ecken, aber zwei Seiten sind länger als die anderen.", formen("rechteck")),
    w(NAME, "Quadrat", ["Rechteck", "Kreis"], "Vier Ecken und alle vier Seiten sind gleich lang.", formen("quadrat")),
    w(NAME, "Dreieck", ["Quadrat", "Kreis"], "Zähle die Ecken: Der Name der Form verrät die Zahl.", formen("dreieck")),
    w(NAME, "Kreis", ["Dreieck", "Rechteck"], "Diese Form ist ganz rund und hat keine Ecke.", formen("kreis")),
  ];
  const ecken = [
    w(ECKEN, "3", ["4", "2"], "Tippe jede Ecke einmal an und zähle mit.", formen("dreieck")),
    w(ECKEN, "4", ["3", "6"], "Tippe jede Ecke einmal an – beim Quadrat sind alle gleich.", formen("quadrat")),
    w(ECKEN, "keine", ["1", "4"], "Fahre am Rand entlang: Wo du nie abbiegen musst, ist keine Ecke.", formen("kreis")),
    w(ECKEN, "4", ["2", "8"], "Tippe jede Ecke einmal an – lange und kurze Seiten treffen sich dort.", formen("rechteck")),
    w("Wie viele Dreiecke siehst du?", "3", ["2", "5"], "Zähle nur die Formen mit drei Ecken.", formen("dreieck", "kreis", "dreieck", "quadrat", "dreieck")),
    w("Wie viele Vierecke siehst du?", "3", ["2", "4"], "Quadrate und Rechtecke haben beide vier Ecken.", formen("quadrat", "kreis", "rechteck", "dreieck", "quadrat")),
  ];
  const muster = [
    w(WEITER, "Kreis", ["Dreieck", "Quadrat"], "Sprich das Muster laut mit: Kreis, Dreieck, Kreis, Dreieck …", formen("kreis", "dreieck", "kreis", "dreieck", "?")),
    w(WEITER, "Rechteck", ["Dreieck", "Kreis"], "Zwei Formen wechseln sich immer ab.", formen("dreieck", "rechteck", "dreieck", "rechteck", "dreieck", "?")),
    w(WEITER, "Dreieck", ["Kreis", "Quadrat"], "Hier wiederholen sich immer drei Formen: Kreis, Kreis, Dreieck.", formen("kreis", "kreis", "dreieck", "kreis", "kreis", "?")),
  ];
  const umwelt = [
    koerper("ein Spielwürfel", "Würfel", ["Kugel", "Zylinder"], "Alle sechs Seiten sind gleich große Quadrate."),
    koerper("ein Fußball", "Kugel", ["Würfel", "Zylinder"], "Er ist rundum rund und rollt in jede Richtung."),
    koerper("ein Schuhkarton", "Quader", ["Würfel", "Kugel"], "Er hat sechs Flächen, aber sie sind nicht alle gleich groß."),
    koerper("eine Konservendose", "Zylinder", ["Kugel", "Quader"], "Oben und unten ist ein Kreis, dazwischen ist sie rund."),
    koerper("eine Murmel", "Kugel", ["Zylinder", "Quader"], "Sie hat keine Ecke und keine Kante."),
    koerper("ein dickes Buch", "Quader", ["Würfel", "Zylinder"], "Es hat rechteckige Flächen: lang, breit und nicht so hoch."),
    w("Welcher Körper kann rollen: Kugel, Quader oder Würfel?", "Kugel", ["Quader", "Würfel"], "Was rundum rund ist, rollt – Ecken bremsen."),
  ];
  const easy = reihum(buchstaben, umwelt, ecken, [...namen, ...begriffe], muster);

  const eigenschaften = [
    w("Wie viele Ecken hat ein Würfel?", "8", ["6", "12"], "Zähle 4 Ecken oben und 4 Ecken unten."),
    w("Wie viele Flächen hat ein Würfel?", "6", ["4", "8"], "Denk an den Spielwürfel: Er zeigt die Zahlen 1 bis 6."),
    w("Wie viele Kanten hat ein Würfel?", "12", ["8", "6"], "Zähle 4 Kanten oben, 4 unten und 4, die dazwischen stehen."),
    w("Wie viele Ecken hat ein Quader?", "8", ["4", "6"], "Ein Quader hat genauso viele Ecken wie ein Würfel: 4 oben, 4 unten."),
    w("Wie viele Flächen hat ein Quader?", "6", ["4", "8"], "Zähle: oben, unten, vorne, hinten, links und rechts."),
    w("Wie viele Ecken hat eine Kugel?", "keine", ["1", "8"], "Streiche in Gedanken über einen Ball: Nirgends spürst du eine Spitze."),
    w("Wie viele flache Kreisflächen hat ein Zylinder?", "2", ["1", "3"], "Schau dir eine Dose an: Deckel und Boden."),
    w("Welche Form haben die Flächen eines Würfels?", "Quadrate", ["Kreise", "Dreiecke"], "Alle Kanten des Würfels sind gleich lang."),
    w("Welche Form haben die Flächen eines Quaders?", "Rechtecke", ["Kreise", "Dreiecke"], "Schau auf einen Schuhkarton: Jede Seite hat vier Ecken."),
  ];
  const koennen = [
    w("Welcher Körper kann rollen und auch sicher stehen?", "Zylinder", ["Kugel", "Würfel"], "Auf der runden Seite rollt er, auf der Kreisfläche steht er."),
    w("Welcher Körper hat keine Ecken und keine Kanten?", "Kugel", ["Würfel", "Zylinder"], "Dieser Körper ist überall gleich rund."),
    w("Welcher Körper kann nicht rollen: Kugel, Quader oder Zylinder?", "Quader", ["Kugel", "Zylinder"], "Rollen braucht eine runde Seite – der Quader hat nur ebene Flächen."),
    w("Welchen Körper kannst du nicht stapeln?", "Kugel", ["Würfel", "Quader"], "Zum Stapeln braucht ein Körper eine ebene Fläche."),
    w("Alle 6 Flächen sind gleich große Quadrate. Welcher Körper ist das?", "Würfel", ["Quader", "Zylinder"], "Beim Quader dürfen die Flächen verschieden groß sein – hier nicht."),
    w("Welcher Gegenstand ist ein Zylinder?", "Dose", ["Ball", "Buch"], "Ein Zylinder hat oben und unten einen Kreis."),
    w("Welcher Gegenstand ist ein Quader?", "Ziegelstein", ["Ball", "Dose"], "Ein Quader hat sechs rechteckige Flächen."),
  ];
  const spiegelSchwer = [
    keine(["H", "O", "S"], "S", "Das S sieht gleichmäßig aus – aber beim Falten passen die Bögen nicht aufeinander."),
    keine(["H", "N", "X"], "N", "Der schräge Strich im N läuft nur in eine Richtung."),
    w("Welche Ziffer hat eine Spiegelachse: 2, 5 oder 8?", "8", ["2", "5"], "Falte die 8 in der Mitte: Die Hälften passen aufeinander."),
    w("Wie viele Spiegelachsen hat der Buchstabe H?", "2", ["1", "4"], "Das H kannst du von oben nach unten falten – und auch von links nach rechts."),
    w("Wie viele Spiegelachsen hat der Buchstabe T?", "1", ["2", "keine"], "Das T kannst du nur von oben nach unten falten – oben und unten sind verschieden."),
    w("Wie verläuft die Spiegelachse beim Buchstaben T?", "senkrecht", ["waagerecht", "schräg"], "Senkrecht heißt: von oben nach unten, wie ein Baumstamm."),
    w("Wie verläuft die Spiegelachse beim Buchstaben E?", "waagerecht", ["senkrecht", "schräg"], "Beim E sind oben und unten gleich – die Achse liegt wie der Horizont."),
    w("Welches Wort sieht im Spiegel genauso aus: HUT, UFO oder UHU?", "UHU", ["HUT", "UFO"], "Lies rückwärts und prüfe jeden Buchstaben: U und H haben eine Spiegelachse."),
  ];
  const REIHE = "Die Reihe ist in der Mitte gespiegelt. Welche Form fehlt?";
  const spiegelReihen = [
    w(REIHE, "rotes Dreieck", ["blauer Kreis", "gelbes Quadrat"], "Die erste und die letzte Form müssen gleich sein.", formen("dreieck:rot", "kreis:blau", "quadrat:gelb", "kreis:blau", "?")),
    w(REIHE, "gelbes Dreieck", ["roter Kreis", "grünes Quadrat"], "Die zweite Form von links ist das Spiegelbild der zweiten von rechts.", formen("quadrat:gruen", "?", "kreis:rot", "dreieck:gelb", "quadrat:gruen")),
    w(REIHE, "rotes Rechteck", ["grünes Dreieck", "blauer Kreis"], "Zähle von beiden Enden zur Mitte: Die Partner sind immer gleich.", formen("kreis:blau", "rechteck:rot", "dreieck:gruen", "dreieck:gruen", "?", "kreis:blau")),
    w(WEITER, "gelbes Quadrat", ["roter Kreis", "blaues Dreieck"], "Hier wiederholen sich drei Formen mit ihren Farben.", formen("kreis:rot", "dreieck:blau", "quadrat:gelb", "kreis:rot", "dreieck:blau", "?")),
    w("Welche Form fehlt in der Reihe?", "Kreis", ["Dreieck", "Quadrat"], "Das Muster heißt: Dreieck, Kreis, Kreis – und dann von vorn.", formen("dreieck", "kreis", "kreis", "dreieck", "?", "kreis")),
  ];
  const ZUSAMMEN = "Wie viele Ecken haben diese Formen zusammen?";
  const falten = [
    w(ZUSAMMEN, "7", ["6", "8"], "Zähle für jede Form die Ecken und rechne dann zusammen.", formen("dreieck", "quadrat")),
    w("Du faltest ein Quadrat Kante auf Kante. Welche Form entsteht?", "Rechteck", ["Quadrat", "Kreis"], "Die Faltlinie teilt das Quadrat in zwei schmale Hälften."),
    w(ZUSAMMEN, "6", ["2", "3"], "Jedes Dreieck hat gleich viele Ecken – zähle beide.", formen("dreieck", "dreieck")),
    w("Du faltest ein Quadrat Ecke auf Ecke. Welche Form entsteht?", "Dreieck", ["Rechteck", "Quadrat"], "Die Faltlinie läuft schräg von einer Ecke zur gegenüberliegenden."),
    w(ZUSAMMEN, "7", ["3", "8"], "Der Kreis hat keine Ecke – zähle nur Dreieck und Quadrat.", formen("dreieck", "kreis", "quadrat")),
  ];
  const hard = reihum(eigenschaften, spiegelSchwer, koennen, spiegelReihen, falten);
  return { easy, hard };
}

/* ---------- Zusammenbau ---------- */
/** Erzeugt alle Pools neu – liefert bei jedem Aufruf genau dasselbe (fester Seed je Bereich). */
export function k2MatheErzeugen() {
  return {
    k2zahlen: zahlenPool(),
    k2plus: plusPool(),
    k2minus: minusPool(),
    k2einmaleins: einmaleinsPool(),
    k2teilen: teilenPool(),
    k2geld: geldPool(),
    k2uhr: uhrPool(),
    k2laengen: laengenPool(),
    k2sach: sachPool(),
    k2spiegeln: spiegelnPool(),
  };
}

export const K2_MATHE_DATEN = k2MatheErzeugen();

export const K2_MATHE_BEREICHE = [
  { key: "k2zahlen", emoji: "🔢", name: "Zahlen bis 100" },
  { key: "k2plus", emoji: "➕", name: "Plus bis 100" },
  { key: "k2minus", emoji: "➖", name: "Minus bis 100" },
  { key: "k2einmaleins", emoji: "✖️", name: "Einmaleins" },
  { key: "k2teilen", emoji: "➗", name: "Teilen" },
  { key: "k2geld", emoji: "💶", name: "Geld bis 100 Euro" },
  { key: "k2uhr", emoji: "🕐", name: "Uhr: halb & viertel" },
  { key: "k2laengen", emoji: "📏", name: "Längen" },
  { key: "k2sach", emoji: "📖", name: "Sachaufgaben" },
  { key: "k2spiegeln", emoji: "🎲", name: "Spiegeln & Körper" },
];
