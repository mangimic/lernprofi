import { describe, it, expect } from "vitest";
import { K2_MATHE_DATEN, K2_MATHE_BEREICHE, k2MatheErzeugen } from "./klasse2Mathe.js";
import { poolGesund } from "../aufgabenRunde.js";

/* 🔢 Mathe Klasse 2: Der Test rechnet ALLES selbst nach – mit eigenen
   Rechnern, die nichts aus der Daten-Datei übernehmen. Keine Lösung im
   Pool darf falsch sein, keine Falschantwort darf zufällig stimmen. */

const D = K2_MATHE_DATEN;
const KEYS = ["k2zahlen", "k2plus", "k2minus", "k2einmaleins", "k2teilen", "k2geld", "k2uhr", "k2laengen", "k2sach", "k2spiegeln"];
const alle = (key) => [...D[key].easy, ...D[key].hard];
const jede = KEYS.flatMap((key) => alle(key).map((a) => ({ key, a })));
const mit = (key, test) => alle(key).filter(test);
const finde = (key, f) => alle(key).find((a) => a.f === f);

/* ---------- eigene Rechner ---------- */
function rechne(a, op, b) {
  switch (op) {
    case "+": return a + b;
    case "-": return a - b;
    case "·": return a * b;
    case ":": return Number.isInteger(a / b) ? a / b : NaN;
    default: return NaN;
  }
}
/** Rechenschritte; "e" = Ergebnis des vorigen Schritts. */
function gehe(weg) {
  let e = 0;
  for (const [a, op, b] of weg) e = rechne(a === "e" ? e : a, op, b === "e" ? e : b);
  return e;
}
const zahlen = (text) => (String(text).match(/\d+/g) || []).map(Number);
const wegZahlen = (weg) => weg.flat().filter((w) => typeof w === "number");
function geldText(cent) {
  const euro = Math.floor(cent / 100), rest = cent % 100;
  if (rest === 0) return `${euro} Euro`;
  return euro === 0 ? `${rest} Cent` : `${euro} Euro ${rest} Cent`;
}
/** „2 Euro 50 Cent" / „85 Cent" / „3 Euro" → Cent. */
function cent(text) {
  const e = /(\d+) Euro/.exec(text), c = /(\d+) Cent/.exec(text);
  return (e ? Number(e[1]) * 100 : 0) + (c ? Number(c[1]) : 0);
}
/** „1 m 10 cm" / „90 cm" / „2 m" → cm. */
function inCm(text) {
  const m = /(\d+) m\b/.exec(text), c = /(\d+) cm\b/.exec(text);
  return (m ? Number(m[1]) * 100 : 0) + (c ? Number(c[1]) : 0);
}
const minuten = (zeit) => { const [h, m] = zeit.split(":").map(Number); return h * 60 + m; };
const alsZeit = (min) => `${Math.floor(min / 60)}:${String(min % 60).padStart(2, "0")}`;
const STUNDEN = ["zwölf", "eins", "zwei", "drei", "vier", "fünf", "sechs", "sieben", "acht", "neun", "zehn", "elf"];
/** Sprechweise für volle, halbe und Viertelstunden. */
function inWorten(zeit) {
  const [h, m] = zeit.split(":").map(Number);
  if (m === 0) return h % 12 === 1 ? "ein Uhr" : `${STUNDEN[h % 12]} Uhr`;
  if (m === 30) return `halb ${STUNDEN[(h + 1) % 12]}`;
  if (m === 15) return `Viertel nach ${STUNDEN[h % 12]}`;
  if (m === 45) return `Viertel vor ${STUNDEN[(h + 1) % 12]}`;
  return null;
}
const EINER = ["", "ein", "zwei", "drei", "vier", "fünf", "sechs", "sieben", "acht", "neun"];
const ZEHNER = ["", "zehn", "zwanzig", "dreißig", "vierzig", "fünfzig", "sechzig", "siebzig", "achtzig", "neunzig"];
const zahlwort = (n) => `${EINER[n % 10]}und${ZEHNER[Math.floor(n / 10)]}`;

const RECHENZEICHEN = /[+−·=]|__|\d : [\d?]|(^|\s)\?(\s|$)/; // dann ist `sprich` Pflicht
const EMOJI = /\p{Extended_Pictographic}/u;
const BILD_ARTEN = ["zwanzig", "muenzen", "formen", "emoji", "uhr", "strahl"];
const GELD_STUECKE = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000];
const FORMEN = ["kreis", "dreieck", "quadrat", "rechteck"];
const FARBEN = ["rot", "blau", "gelb", "gruen"];

describe("Mathe Klasse 2 – Vertrag für alle Pools", () => {
  it("Bereiche: zehn Felder in der Reihenfolge des Lernwegs", () => {
    expect(K2_MATHE_BEREICHE.map((b) => b.key)).toEqual(KEYS);
    expect(Object.keys(D)).toEqual(KEYS);
    expect(K2_MATHE_BEREICHE.map((b) => b.name)).toEqual([
      "Zahlen bis 100", "Plus bis 100", "Minus bis 100", "Einmaleins", "Teilen",
      "Geld bis 100 Euro", "Uhr: halb & viertel", "Längen", "Sachaufgaben", "Spiegeln & Körper",
    ]);
    for (const b of K2_MATHE_BEREICHE) expect(b.emoji, b.key).toMatch(EMOJI);
  });

  it.each(KEYS)("%s: gesund, groß genug, genau 2 Falschantworten, keine Duplikate", (key) => {
    const pool = D[key];
    expect(poolGesund(pool)).toBe(true);
    expect(pool.easy.length).toBeGreaterThanOrEqual(24);
    expect(pool.hard.length).toBeGreaterThanOrEqual(20);
    for (const stufe of ["easy", "hard"]) {
      const gesehen = new Set();
      for (const a of pool[stufe]) {
        expect(a.x, a.f).toHaveLength(2);
        expect(new Set([a.r, ...a.x]).size, `${a.f} → ${a.r} | ${a.x}`).toBe(3);
        for (const text of [a.r, ...a.x]) {
          expect(typeof text).toBe("string");
          expect(text.length, `${a.f}: ${text}`).toBeGreaterThan(0);
          // kurze Antwort-Knöpfe; nur „Viertel nach zwei" (Uhr) darf ein Zeichen länger sein
          expect(text.length, `${a.f}: ${text}`).toBeLessThanOrEqual(key === "k2uhr" ? 17 : 16);
        }
        expect(a.f.length, a.f).toBeLessThanOrEqual(70);
        if (a.kontext !== undefined) {
          expect(a.kontext.length, a.kontext).toBeGreaterThan(10);
          expect(a.kontext.length, a.kontext).toBeLessThanOrEqual(160);
        }
        // Tipp: ein kurzer Satz zum Weg – keine Frage zurück, kein Roman
        expect(a.tipp.length, a.tipp).toBeLessThanOrEqual(110);
        expect(a.tipp, a.f).toMatch(/[.!?…]$/);
        const schluessel = a.f + JSON.stringify(a.bild || null);
        expect(gesehen.has(schluessel), `doppelt: ${a.f}`).toBe(false);
        gesehen.add(schluessel);
      }
      // Fragen zu Zahlenblöcken unterscheiden sich schon im Text (das Feld `bloecke` ist kein `bild`)
      const blockFragen = pool[stufe].filter((a) => a.bloecke).map((a) => a.f);
      expect(new Set(blockFragen).size).toBe(blockFragen.length);
    }
  });

  it("keine Emojis in Frage, Antworten, Tipp und Vorlesetext; nur die acht erlaubten Namen", () => {
    const fremd = /\b(Leo|Kai|Samira|David|Mina|Alex|Anna|Paul|Lisa|Max|Jonas|Lea|Otto|Finn|Marie)\b/;
    for (const { a } of jede) {
      for (const text of [a.f, a.r, ...a.x, a.tipp, a.sprich || "", a.kontext || ""]) {
        expect(EMOJI.test(text), text).toBe(false);
        expect(fremd.test(text), text).toBe(false);
      }
    }
    expect(/ADHS|Störung|dumm|Versager|falsch gemacht/i.test(JSON.stringify(D))).toBe(false);
  });

  it("jede Aufgabe mit `term` ist nachgerechnet – Ergebnis oder gesuchte Zahl", () => {
    const terme = jede.filter(({ a }) => a.term);
    expect(terme.length).toBeGreaterThanOrEqual(220);
    for (const { a } of terme) {
      const { a: links, op, b: rechts, gesucht } = a.term;
      expect(["+", "-", "·", ":"], a.f).toContain(op);
      const ergebnis = rechne(links, op, rechts);
      expect(Number.isInteger(ergebnis), a.f).toBe(true); // Teilen nur ohne Rest
      expect(ergebnis, a.f).toBeGreaterThanOrEqual(0);
      expect(ergebnis, a.f).toBeLessThanOrEqual(100);
      if (gesucht) {
        expect(["a", "b"], a.f).toContain(gesucht);
        expect(a.r, a.f).toBe(String(gesucht === "a" ? links : rechts));
        // In der Frage stehen die bekannte Zahl und das Ergebnis – die gesuchte Zahl nicht als Lösung
        expect(zahlen(a.f), a.f).toEqual(expect.arrayContaining([gesucht === "a" ? rechts : links, ergebnis]));
      } else {
        expect(a.r, a.f).toBe(String(ergebnis));
        const inFrage = zahlen(a.f);
        expect(inFrage, a.f).toContain(links);
        if (!(rechts === 2 && /Hälfte/.test(a.f))) expect(inFrage, a.f).toContain(rechts);
      }
      // Falschantworten sind Zahlen und nie negativ
      for (const x of a.x) expect(x, a.f).toMatch(/^\d+$/);
    }
  });

  it("jede Aufgabe mit Rechenschritten (`weg`) ist nachgerechnet", () => {
    const wege = jede.filter(({ a }) => a.weg);
    expect(wege.length).toBeGreaterThanOrEqual(120);
    for (const { key, a } of wege) {
      const wert = gehe(a.weg);
      expect(Number.isInteger(wert) && wert >= 0, a.f).toBe(true);
      if (key === "k2geld") {
        expect(a.r, a.f).toBe(geldText(wert)); // Geld rechnet in Cent
      } else {
        const m = /^(\d+) (\S+)$/.exec(a.r);
        expect(m, `${a.f} → ${a.r}`).not.toBeNull();
        expect(Number(m[1]), a.f).toBe(wert);
        if (key !== "k2laengen") for (const x of a.x) expect(x.endsWith(` ${m[2]}`), `${a.f}: ${x}`).toBe(true);
      }
      expect(a.term, a.f).toBeUndefined(); // Antwort mit Einheit → kein `term`
    }
  });

  it("`sprich` ist da, wo Rechenzeichen oder Platzhalter in der Frage stehen – und selbst zeichenfrei", () => {
    let pflicht = 0;
    for (const { a } of jede) {
      expect(/\d\s?-\s?\d/.test(a.f), `Bindestrich statt Minus: ${a.f}`).toBe(false);
      if (RECHENZEICHEN.test(a.f)) {
        pflicht++;
        expect(typeof a.sprich, a.f).toBe("string");
      }
      if (a.sprich !== undefined) {
        expect(a.sprich.length, a.f).toBeGreaterThan(8);
        expect(a.sprich.length, a.sprich).toBeLessThanOrEqual(160);
        expect(/[+−·=<>]|__| : |\bcm\b| \? /.test(a.sprich), a.sprich).toBe(false);
        expect(a.sprich, a.f).toMatch(/[?.]$/);
      }
    }
    expect(pflicht).toBeGreaterThanOrEqual(250);
  });

  it("Bilder: nur erlaubte Arten und gültige Formen", () => {
    const arten = new Set();
    for (const { a } of jede) {
      expect(a.merkbild, a.f).toBeUndefined();
      if (a.bloecke) {
        expect(a.bild, a.f).toBeUndefined();
        expect(Object.keys(a.bloecke).sort(), a.f).toEqual(["e", "z"]);
        expect(a.bloecke.z >= 0 && a.bloecke.z <= 9 && a.bloecke.e >= 0 && a.bloecke.e <= 19, a.f).toBe(true);
      }
      if (!a.bild) continue;
      const b = a.bild;
      arten.add(b.art);
      expect(BILD_ARTEN, a.f).toContain(b.art);
      if (b.art === "muenzen") {
        expect(Object.keys(b).sort()).toEqual(["art", "werte"]);
        expect(b.werte.length >= 1 && b.werte.length <= 6, a.f).toBe(true);
        for (const w of b.werte) expect(GELD_STUECKE, a.f).toContain(w);
      } else if (b.art === "uhr") {
        expect(Object.keys(b).sort()).toEqual(["art", "zeit"]);
        expect(b.zeit, a.f).toMatch(/^([1-9]|1[0-2]):[0-5]\d$/);
      } else if (b.art === "strahl") {
        expect(Object.keys(b).sort()).toEqual(["art", "bis", "frage", "schritt", "von"]);
        expect((b.bis - b.von) % b.schritt, a.f).toBe(0);
        expect((b.bis - b.von) / b.schritt, a.f).toBeLessThanOrEqual(10); // höchstens 11 Striche – bleibt lesbar
        for (const q of b.frage) expect((q - b.von) % b.schritt === 0 && q >= b.von && q <= b.bis, a.f).toBe(true);
      } else if (b.art === "formen") {
        expect(Object.keys(b).sort()).toEqual(["art", "folge"]);
        expect(b.folge.length >= 1 && b.folge.length <= 6, a.f).toBe(true);
        for (const teil of b.folge) {
          if (teil === "?") continue;
          const [form, farbe] = teil.split(":");
          expect(FORMEN, a.f).toContain(form);
          if (farbe !== undefined) expect(FARBEN, a.f).toContain(farbe);
        }
        expect(b.folge.filter((t) => t === "?").length, a.f).toBeLessThanOrEqual(1);
      }
    }
    expect([...arten].sort()).toEqual(["formen", "muenzen", "strahl", "uhr"]);
  });

  it("deterministisch: zweimal erzeugen liefert genau dieselben Pools", () => {
    expect(k2MatheErzeugen()).toEqual(K2_MATHE_DATEN);
    expect(JSON.stringify(k2MatheErzeugen())).toBe(JSON.stringify(k2MatheErzeugen()));
  });

  it("der feste Seed liefert genau diese erzeugten Aufgaben (Stichproben mit festen Erwartungen)", () => {
    expect(D.k2plus.easy[0]).toEqual({
      f: "50 + 20 = ?", r: "70", x: ["7", "80"], tipp: "Denk an 5 + 2 – nur sind es hier Zehner.",
      sprich: "Wie viel ist 50 plus 20?", term: { a: 50, op: "+", b: 20 },
    });
    expect(D.k2plus.hard[0]).toMatchObject({ f: "43 + 8 = ?", r: "51", x: ["41", "52"], tipp: "Erst bis zum Zehner: 43 + 7 = 50, dann noch 1 dazu." });
    expect(D.k2minus.hard[1]).toMatchObject({ f: "71 − 45 = ?", r: "26", x: ["34", "36"], term: { a: 71, op: "-", b: 45 } });
    expect(D.k2einmaleins.hard[0]).toMatchObject({ f: "9 · 9 = ?", r: "81", x: ["90", "72"], sprich: "Wie viel ist 9 mal 9?" });
    expect(D.k2teilen.easy[0]).toMatchObject({ f: "12 : 2 = ?", r: "6", x: ["5", "10"], term: { a: 12, op: ":", b: 2 } });
    expect(D.k2zahlen.hard[1]).toMatchObject({ f: "2 Zehner und 13 Einer – welche Zahl ist das?", r: "33", x: ["213", "23"] });
    expect(D.k2zahlen.easy[0]).toMatchObject({ f: "Welche Zahl zeigen die Blöcke?", r: "35", x: ["53", "8"], bloecke: { z: 3, e: 5 } });
    expect(D.k2geld.easy[0]).toMatchObject({ f: "Wie viel Geld ist das?", r: "72 Euro", bild: { art: "muenzen", werte: [5000, 2000, 200] } });
    expect(D.k2uhr.hard[0]).toMatchObject({ r: "12:15 Uhr", x: ["12:03 Uhr", "12:45 Uhr"], bild: { art: "uhr", zeit: "12:15" } });
  });
});

describe("k2zahlen – Zahlen bis 100", () => {
  // Jede Aufgabe ohne `term` wird über ihre Frage erkannt und nachgerechnet.
  const REGELN = [
    [/^Wie heißt der Nachfolger von (\d+)\?$/, (m) => String(+m[1] + 1)],
    [/^Wie heißt der Vorgänger von (\d+)\?$/, (m) => String(+m[1] - 1)],
    [/^Wie heißen die Nachbarzehner von (\d+)\?$/, (m) => `${Math.floor(+m[1] / 10) * 10} und ${Math.floor(+m[1] / 10) * 10 + 10}`],
    [/^Wie heißen die Nachbarzahlen von (\d+)\?$/, (m) => `${+m[1] - 1} und ${+m[1] + 1}`],
    [/^Wie viele Zehner hat die Zahl (\d+)\?$/, (m) => String(Math.floor(+m[1] / 10))],
    [/^Wie viele Einer hat die Zahl (\d+)\?$/, (m) => String(+m[1] % 10)],
    [/^(\d+) Zehner und (\d+) Einer/, (m) => String(10 * +m[1] + +m[2])],
    [/^Wie schreibst du (\S+) als Zahl\?$/, (m, a) => (zahlwort(+a.r) === m[1] ? a.r : "Zahlwort passt nicht")],
    [/^Wie sprichst du die Zahl (\d+)\?$/, (m) => zahlwort(+m[1])],
    [/^Welche Zahl ist gerade: (\d+), (\d+) oder (\d+)\?$/, (m) => String(m.slice(1, 4).map(Number).filter((n) => n % 2 === 0).join("/"))],
    [/^Welche Zahl ist ungerade: (\d+), (\d+) oder (\d+)\?$/, (m) => String(m.slice(1, 4).map(Number).filter((n) => n % 2 === 1).join("/"))],
    [/^Welche Zahl ist am größten: (\d+), (\d+) oder (\d+)\?$/, (m) => String(Math.max(...m.slice(1, 4).map(Number)))],
    [/^Welche Zahl ist am kleinsten: (\d+), (\d+) oder (\d+)\?$/, (m) => String(Math.min(...m.slice(1, 4).map(Number)))],
    [/^Setze fort: (\d+), (\d+), (\d+), \?$/, (m) => (+m[2] - +m[1] === +m[3] - +m[2] ? String(2 * +m[3] - +m[2]) : "keine gleichen Schritte")],
    [/Hunderterfeld direkt unter der (\d+)\?$/, (m) => String(+m[1] + 10)],
    [/Hunderterfeld direkt über der (\d+)\?$/, (m) => String(+m[1] - 10)],
    [/Hunderterfeld direkt links neben der (\d+)\?$/, (m) => String(+m[1] - 1)],
    [/^Welche Zahl liegt genau in der Mitte zwischen (\d+) und (\d+)\?$/, (m) => String((+m[1] + +m[2]) / 2)],
    [/^Welches Zeichen passt\? (\d+) __ (\d+)$/, (m) => (+m[1] < +m[2] ? "kleiner als (<)" : +m[1] > +m[2] ? "größer als (>)" : "gleich (=)")],
    [/^Ordne von klein nach groß: (\d+), (\d+), (\d+)\.$/, (m) => m.slice(1, 4).map(Number).sort((p, q) => p - q).join(", ")],
    [/^Ordne von groß nach klein: (\d+), (\d+), (\d+)\.$/, (m) => m.slice(1, 4).map(Number).sort((p, q) => q - p).join(", ")],
    [/^Welcher Zehner liegt näher an (\d+)\?$/, (m) => String(Math.round(+m[1] / 10) * 10)],
    [/^Meine Zahl ist um 10 größer als (\d+)\./, (m) => String(+m[1] + 10)],
    [/^Meine Zahl ist um 10 kleiner als (\d+)\./, (m) => String(+m[1] - 10)],
    [/^Meine Zahl liegt zwischen (\d+) und (\d+) und hat (\d+) Einer\./, (m) => (+m[2] - +m[1] === 10 ? String(+m[1] + +m[3]) : "kein Zehnerabstand")],
    [/^Wie viel fehlt von (\d+) bis zum nächsten Zehner\?$/, (m) => String(10 - (+m[1] % 10))],
    [/^Wie viel fehlt von (\d+) bis 100\?$/, (m) => String(100 - +m[1])],
  ];

  it("jede Aufgabe ist über Term, Blöcke, Zahlenstrahl oder ihre Frage nachgerechnet", () => {
    let geprueft = 0;
    for (const a of alle("k2zahlen")) {
      if (a.bloecke) {
        expect(a.r, a.f).toBe(String(10 * a.bloecke.z + a.bloecke.e));
        expect(a.x.includes(String(10 * a.bloecke.z + a.bloecke.e)), a.f).toBe(false);
      } else if (a.f === "Welche Zahl fehlt am Zahlenstrahl?") {
        expect(a.bild.frage, a.f).toEqual([Number(a.r)]);
        // Falschantworten stehen nicht schon sichtbar am Strahl
        for (const x of a.x) expect((Number(x) - a.bild.von) % a.bild.schritt === 0 && Number(x) >= a.bild.von && Number(x) <= a.bild.bis, `${a.r}: ${x}`).toBe(false);
      } else if (!a.term) {
        const regel = REGELN.find(([muster]) => muster.test(a.f));
        expect(regel, `keine Prüfregel für: ${a.f}`).toBeDefined();
        expect(a.r, a.f).toBe(regel[1](regel[0].exec(a.f), a));
      }
      geprueft++;
    }
    expect(geprueft).toBe(alle("k2zahlen").length);
  });

  it("Zahlenraum bleibt bei 100; Nachbarzehner zeigen den Strahl mit zwei Fragezeichen", () => {
    for (const a of alle("k2zahlen")) {
      for (const n of zahlen(a.f)) expect(n, a.f).toBeLessThanOrEqual(100);
      if (/^\d+$/.test(a.r)) expect(Number(a.r), a.f).toBeLessThanOrEqual(100);
    }
    const nz = mit("k2zahlen", (a) => /Nachbarzehner/.test(a.f));
    expect(nz.length).toBeGreaterThanOrEqual(3);
    for (const a of nz) {
      const n = zahlen(a.f)[0];
      expect(a.bild, a.f).toEqual({ art: "strahl", von: Math.floor(n / 10) * 10, bis: Math.floor(n / 10) * 10 + 10, schritt: 1, frage: [Math.floor(n / 10) * 10, Math.floor(n / 10) * 10 + 10] });
      expect(a.x, a.f).toContain(`${n - 1} und ${n + 1}`); // typischer Fehler: Nachbarzahlen statt Nachbarzehner
    }
  });

  it("Stichproben: Zahlendreher als Falschantwort, Bündeln, alle Themen sind da", () => {
    // Blöcke lesen: Der Zahlendreher (Zehner und Einer vertauscht) ist immer dabei
    for (const a of D.k2zahlen.easy.filter((q) => q.bloecke && q.bloecke.e > 0)) {
      expect(a.x, a.f).toContain(String(10 * a.bloecke.e + a.bloecke.z));
    }
    // Bündeln: 3 Zehner und 14 Einer sind NICHT „314"
    const buendel = D.k2zahlen.hard.filter((a) => a.bloecke);
    expect(buendel).toHaveLength(2);
    for (const a of buendel) {
      expect(a.bloecke.e).toBeGreaterThan(9);
      expect(a.x, a.f).toContain(`${a.bloecke.z}${a.bloecke.e}`);
    }
    const text = alle("k2zahlen").map((a) => a.f).join(" | ");
    for (const thema of [/Nachfolger/, /Vorgänger/, /Nachbarzehner/, /gerade/, /ungerade/, /Zahlenstrahl/, /Ordne/, /Hunderterfeld/, /Setze fort/]) {
      expect(text).toMatch(thema);
    }
    expect(D.k2zahlen.easy.filter((a) => a.bild?.art === "strahl").length).toBeGreaterThanOrEqual(6);
  });
});

describe("k2plus und k2minus – Rechnen bis 100", () => {
  const einer = (n) => n % 10;

  it("jede Aufgabe ist eine nachrechenbare Plus- bzw. Minusaufgabe im Hunderterraum", () => {
    for (const [key, op] of [["k2plus", "+"], ["k2minus", "-"]]) {
      for (const a of alle(key)) {
        expect(a.term, a.f).toBeDefined();
        expect(a.term.op, a.f).toBe(op);
        expect(a.sprich, a.f).toMatch(op === "+" ? /plus/ : /minus/);
        expect(a.f, a.f).toContain(op === "+" ? " + " : " − ");
        for (const n of [a.term.a, a.term.b, rechne(a.term.a, op, a.term.b), ...a.x.map(Number)]) {
          expect(n >= 0 && n <= 100, `${a.f}: ${n}`).toBe(true);
        }
      }
    }
  });

  it("easy rechnet ohne Zehnerübergang (Z+Z, ZE+E, ZE+Z und Z−Z, ZE−E, ZE−Z)", () => {
    for (const a of D.k2plus.easy) {
      expect(einer(a.term.a) + einer(a.term.b), a.f).toBeLessThan(10);
      expect(a.term.b < 10 || a.term.b % 10 === 0, a.f).toBe(true);
      expect(a.term.gesucht, a.f).toBeUndefined();
    }
    for (const a of D.k2minus.easy) {
      expect(einer(a.term.a), a.f).toBeGreaterThanOrEqual(einer(a.term.b));
      expect(a.term.b < 10 || a.term.b % 10 === 0, a.f).toBe(true);
      expect(a.term.gesucht, a.f).toBeUndefined();
    }
    for (const pool of [D.k2plus.easy, D.k2minus.easy]) {
      expect(pool.filter((a) => a.term.a % 10 === 0 && a.term.b % 10 === 0)).toHaveLength(10); // Zehner mit Zehner
      expect(pool.filter((a) => a.term.a % 10 !== 0 && a.term.b < 10)).toHaveLength(10); // ZE mit E
      expect(pool.filter((a) => a.term.a % 10 !== 0 && a.term.b >= 10)).toHaveLength(10); // ZE mit Z
    }
  });

  it("hard übt den Zehnerübergang – der vergessene Übergang steht als Falschantwort da", () => {
    const plusUeber = D.k2plus.hard.filter((a) => !a.term.gesucht && einer(a.term.a) + einer(a.term.b) > 10);
    expect(plusUeber.length).toBeGreaterThanOrEqual(16);
    for (const a of plusUeber) expect(a.x, a.f).toContain(String(a.term.a + a.term.b - 10));
    expect(plusUeber.filter((a) => a.term.b >= 10).length).toBeGreaterThanOrEqual(8); // ZE+ZE

    const minusUeber = D.k2minus.hard.filter((a) => !a.term.gesucht && einer(a.term.a) < einer(a.term.b));
    expect(minusUeber.length).toBeGreaterThanOrEqual(16);
    for (const a of minusUeber) expect(a.x, a.f).toContain(String(a.term.a - a.term.b + 10));
    // ZE−ZE: „kleinere Ziffer von der größeren abziehen" (72 − 38 → 46) ist der klassische Fehler
    const zeZe = minusUeber.filter((a) => a.term.b >= 10 && a.term.a < 100);
    expect(zeZe.length).toBeGreaterThanOrEqual(8);
    for (const a of zeZe) {
      const klassisch = 10 * (Math.floor(a.term.a / 10) - Math.floor(a.term.b / 10)) + (einer(a.term.b) - einer(a.term.a));
      expect(a.x.includes(String(klassisch)) || klassisch === a.term.a - a.term.b + 10, a.f).toBe(true);
    }
    for (const pool of [D.k2plus.hard, D.k2minus.hard]) {
      expect(pool.filter((a) => a.term.gesucht).length).toBeGreaterThanOrEqual(5); // Platzhalter
    }
  });

  it("Stichproben: Aufbau der Frage, Tipp nennt den Weg und nicht das Ergebnis", () => {
    const erste = D.k2plus.easy[0];
    expect(erste.f).toBe(`${erste.term.a} + ${erste.term.b} = ?`);
    expect(erste.sprich).toBe(`Wie viel ist ${erste.term.a} plus ${erste.term.b}?`);
    const minus = D.k2minus.easy[0];
    expect(minus.f).toBe(`${minus.term.a} − ${minus.term.b} = ?`);
    expect(minus.sprich).toBe(`Wie viel ist ${minus.term.a} minus ${minus.term.b}?`);
    // Erst bis zum Zehner: Der Tipp zerlegt richtig
    for (const a of D.k2plus.hard.filter((q) => q.tipp.startsWith("Erst bis zum Zehner"))) {
      const [x1, x2, zehner, rest] = zahlen(a.tipp);
      expect(x1, a.tipp).toBe(a.term.a);
      expect(x1 + x2, a.tipp).toBe(zehner);
      expect(zehner % 10, a.tipp).toBe(0);
      expect(zehner + rest, a.tipp).toBe(a.term.a + a.term.b);
    }
    for (const a of D.k2minus.hard.filter((q) => q.tipp.startsWith("Erst bis zum Zehner"))) {
      const [x1, x2, zehner, rest] = zahlen(a.tipp);
      expect(x1 - x2, a.tipp).toBe(zehner);
      expect(zehner - rest, a.tipp).toBe(a.term.a - a.term.b);
    }
    for (const a of [...D.k2plus.hard, ...D.k2minus.hard].filter((q) => q.tipp.startsWith("Erst die Zehner"))) {
      const [x1, x2, zwischen] = zahlen(a.tipp);
      expect(rechne(x1, a.term.op, x2), a.tipp).toBe(zwischen);
      expect(x2 % 10, a.tipp).toBe(0);
    }
  });
});

describe("k2einmaleins und k2teilen", () => {
  it("Einmaleins easy: Kernaufgaben und die Reihen 2, 5, 10 – hard: alle Reihen bis 10 · 10", () => {
    const kern = [1, 2, 5, 10];
    const easy = D.k2einmaleins.easy.filter((a) => a.term);
    expect(easy.length).toBeGreaterThanOrEqual(24);
    for (const a of easy) {
      expect(a.term.op, a.f).toBe("·");
      expect(kern.includes(a.term.a) || kern.includes(a.term.b), a.f).toBe(true);
      expect(a.f, a.f).toBe(`${a.term.a} · ${a.term.b} = ?`);
      expect(a.sprich, a.f).toBe(`Wie viel ist ${a.term.a} mal ${a.term.b}?`);
    }
    for (const reihe of [2, 5, 10]) expect(easy.filter((a) => a.term.b === reihe).length, `Reihe ${reihe}`).toBeGreaterThanOrEqual(6);
    const hard = D.k2einmaleins.hard.filter((a) => a.term);
    for (const a of [...easy, ...hard]) {
      expect(a.term.a >= 1 && a.term.a <= 10 && a.term.b >= 1 && a.term.b <= 10, a.f).toBe(true);
    }
    const schwer = hard.filter((a) => !kern.includes(a.term.a) && !kern.includes(a.term.b));
    expect(schwer.length).toBeGreaterThanOrEqual(14);
    for (const reihe of [3, 4, 6, 7, 8, 9]) expect(schwer.some((a) => a.term.a === reihe || a.term.b === reihe), `Reihe ${reihe}`).toBe(true);
    expect(hard.filter((a) => a.term.gesucht).length).toBeGreaterThanOrEqual(6); // Platzhalter
  });

  it("Einmaleins: Falschantworten sind Nachbaraufgaben oder „Plus statt Mal“", () => {
    for (const a of alle("k2einmaleins").filter((q) => q.term && !q.term.gesucht && q.f.endsWith("= ?"))) {
      const { a: p, b: q } = a.term;
      const typisch = [(p + 1) * q, (p - 1) * q, p * (q + 1), p * (q - 1), p + q].map(String);
      for (const x of a.x) expect(typisch, `${a.f}: ${x}`).toContain(x);
    }
  });

  it("Einmaleins: Tauschaufgaben, Mal- und Plusaufgaben passen zusammen", () => {
    const tausch = mit("k2einmaleins", (a) => a.f.startsWith("Wie heißt die Tauschaufgabe zu"));
    expect(tausch.length).toBeGreaterThanOrEqual(3);
    for (const a of tausch) {
      const [p, q] = zahlen(a.f);
      expect(a.r, a.f).toBe(`${q} · ${p}`);
      expect(p, a.f).not.toBe(q);
    }
    const malZu = mit("k2einmaleins", (a) => a.f.startsWith("Welche Malaufgabe passt zu"));
    expect(malZu.length).toBeGreaterThanOrEqual(3);
    for (const a of malZu) {
      const summanden = zahlen(a.f);
      expect(new Set(summanden).size, a.f).toBe(1);
      expect(a.r, a.f).toBe(`${summanden.length} · ${summanden[0]}`);
      // keine Falschantwort hat zufällig denselben Wert
      for (const x of a.x) expect(x.includes("·") && zahlen(x)[0] * zahlen(x)[1] === summanden.length * summanden[0], x).toBe(false);
    }
    const plusZu = mit("k2einmaleins", (a) => a.f.startsWith("Welche Plusaufgabe passt zu"));
    expect(plusZu.length).toBeGreaterThanOrEqual(2);
    for (const a of plusZu) {
      const [anzahl, summand] = zahlen(a.f);
      expect(a.r, a.f).toBe(Array(anzahl).fill(summand).join(" + "));
      for (const x of a.x) expect(zahlen(x).reduce((s, n) => s + n, 0), x).not.toBe(anzahl * summand);
    }
    // jede Einmaleins-Aufgabe ohne Term gehört zu einer dieser drei Arten
    expect(alle("k2einmaleins").filter((a) => !a.term).length).toBe(tausch.length + malZu.length + plusZu.length);
  });

  it("Teilen: nur ohne Rest, easy mit 2, 5 und 10 – hard mit allen Reihen und Geschichten", () => {
    const easy = D.k2teilen.easy.filter((a) => a.term);
    expect(easy.length).toBeGreaterThanOrEqual(24);
    for (const a of easy) {
      expect(a.term.op, a.f).toBe(":");
      expect([2, 5, 10], a.f).toContain(a.term.b);
      expect(a.term.a % a.term.b, a.f).toBe(0);
    }
    const hard = D.k2teilen.hard.filter((a) => a.term);
    for (const a of hard) {
      expect(a.term.op, a.f).toBe(":");
      expect(a.term.a % a.term.b, a.f).toBe(0);
      expect(a.term.a <= 100 && a.term.b <= 10 && a.term.a / a.term.b <= 10, a.f).toBe(true);
    }
    expect(hard.filter((a) => [3, 4, 6, 7, 8, 9].includes(a.term.b)).length).toBeGreaterThanOrEqual(14);
    for (const a of D.k2teilen.hard.filter((q) => q.f.endsWith("= ?"))) {
      expect(a.f, a.f).toBe(`${a.term.a} : ${a.term.b} = ?`);
      expect(a.sprich, a.f).toBe(`Wie viel ist ${a.term.a} geteilt durch ${a.term.b}?`);
    }
    const hilfe = mit("k2teilen", (a) => a.f.startsWith("Welche Malaufgabe hilft dir bei"));
    expect(hilfe).toHaveLength(3);
    for (const a of hilfe) {
      const [c, b] = zahlen(a.f);
      expect(a.r, a.f).toBe(`${c / b} · ${b}`);
      for (const x of a.x) expect(zahlen(x)[0] * zahlen(x)[1], x).not.toBe(c);
    }
  });

  it("Teilen: Geschichten zum Verteilen und Aufteilen stehen in hard und stimmen mit ihrem Text überein", () => {
    expect(D.k2teilen.easy.some((a) => a.kontext)).toBe(false);
    const geschichten = D.k2teilen.hard.filter((a) => a.kontext);
    expect(geschichten.length).toBeGreaterThanOrEqual(10);
    for (const a of geschichten) {
      expect(a.weg, a.f).toHaveLength(1);
      expect(a.weg[0][1], a.f).toBe(":");
      expect(zahlen(a.kontext).sort(), a.kontext).toEqual(wegZahlen(a.weg).sort());
      expect(a.x, a.f).toContain(`${a.weg[0][0] - a.weg[0][2]} ${a.r.split(" ")[1]}`); // Minus statt Geteilt
    }
    expect(geschichten.filter((a) => /verteil|teilen sich|legt|pflanzt/.test(a.kontext)).length).toBeGreaterThanOrEqual(4); // Verteilen
    expect(geschichten.filter((a) => /passen|je |braucht|kostet|stehen/.test(a.kontext)).length).toBeGreaterThanOrEqual(4); // Aufteilen
    const kekse = finde("k2teilen", "Wie viele Kekse bekommt jedes Kind?");
    expect(kekse.r).toBe("4 Kekse");
    expect(kekse.kontext).toBe("Mia verteilt 12 Kekse gerecht an 3 Kinder.");
  });
});

describe("k2geld – Geld bis 100 Euro", () => {
  it("Beträge lesen: Die Antwort ist die Summe der abgebildeten Münzen und Scheine", () => {
    const lesen = mit("k2geld", (a) => a.bild && /^Wie viel(e Cent sind das zusammen| Geld ist das)\?$/.test(a.f));
    expect(lesen.length).toBeGreaterThanOrEqual(16);
    for (const a of lesen) {
      const summe = a.bild.werte.reduce((s, w) => s + w, 0);
      expect(a.r, JSON.stringify(a.bild.werte)).toBe(geldText(summe));
      expect(summe, a.f).toBeLessThanOrEqual(10000);
      for (const x of a.x) expect(cent(x), x).not.toBe(summe);
      expect([...a.bild.werte].sort((p, q) => q - p), a.f).toEqual(a.bild.werte); // vom größten zum kleinsten Stück
    }
    // easy: nur Euro ODER nur Cent – hard: Euro und Cent gemischt
    for (const a of D.k2geld.easy.filter((q) => lesen.includes(q))) expect(/^\d+ (Euro|Cent)$/.test(a.r), a.r).toBe(true);
    const gemischt = D.k2geld.hard.filter((q) => lesen.includes(q));
    expect(gemischt.length).toBeGreaterThanOrEqual(6);
    for (const a of gemischt) {
      expect(a.r, a.f).toMatch(/^\d+ Euro \d+ Cent$/);
      const [e, c] = zahlen(a.r);
      expect(a.x, a.f).toContain(`${e} Euro ${c / 10} Cent`); // typisch: 50 Cent als „5 Cent" gelesen
    }
  });

  it("Preise, Wechselgeld und zwei Schritte: nachgerechnet in Cent, Zahlen stehen im Text", () => {
    const sachen = mit("k2geld", (a) => a.weg);
    expect(sachen.length).toBeGreaterThanOrEqual(30);
    for (const a of sachen) {
      const wert = gehe(a.weg);
      expect(wert > 0 && wert <= 10000, a.f).toBe(true);
      for (const x of a.x) {
        expect(cent(x), `${a.f}: ${x}`).not.toBe(wert);
        expect(x, a.f).toMatch(/^\d+ (Euro|Cent)$|^\d+ Euro \d+ Cent$/);
      }
      // Jede Zahl des Textes kommt in der Rechnung vor (als Euro, als Cent oder als Anzahl)
      const imWeg = wegZahlen(a.weg);
      for (const n of zahlen(`${a.kontext || ""} ${a.f}`)) {
        expect(imWeg.includes(n) || imWeg.includes(n * 100) || imWeg.some((w) => w % 100 === n || Math.floor(w / 100) === n), `${a.kontext}: ${n}`).toBe(true);
      }
    }
    expect(D.k2geld.easy.filter((a) => a.weg).every((a) => /^\d+ Euro$/.test(a.r))).toBe(true); // easy bleibt bei ganzen Euro
    expect(D.k2geld.hard.filter((a) => a.weg && a.weg.length === 2).length).toBeGreaterThanOrEqual(4);
    const rueck = mit("k2geld", (a) => /zurück|Rückgeld/.test(a.f));
    expect(rueck.length).toBeGreaterThanOrEqual(11);
    for (const a of rueck) expect(a.weg.some(([, op]) => op === "-"), a.f).toBe(true);
  });

  it("Münzen und Scheine kennen, legen und vergleichen (Stichproben mit festen Erwartungen)", () => {
    const scheine = [5, 10, 20, 50, 100, 200];
    const schein = finde("k2geld", "Welchen Schein gibt es wirklich?");
    expect(scheine).toContain(zahlen(schein.r)[0]);
    for (const x of schein.x) expect(scheine).not.toContain(zahlen(x)[0]);
    const muenze = finde("k2geld", "Welche Münze gibt es wirklich?");
    expect([1, 2, 5, 10, 20, 50]).toContain(zahlen(muenze.r)[0]);
    for (const x of muenze.x) expect([1, 2, 5, 10, 20, 50]).not.toContain(zahlen(x)[0]);
    const wert = finde("k2geld", "Welche Münze ist am meisten wert?");
    expect(cent(wert.r)).toBe(200);
    for (const x of wert.x) expect(cent(x)).toBeLessThan(200);
    expect(finde("k2geld", "1 Euro = ? Cent").r).toBe("100 Cent");
    const bezahlen = finde("k2geld", "Mit welchem Schein kannst du 18 Euro bezahlen?");
    expect(zahlen(bezahlen.r)[0]).toBeGreaterThanOrEqual(18);
    for (const x of bezahlen.x) expect(zahlen(x)[0]).toBeLessThan(18);

    const legen = mit("k2geld", (a) => /^Mit welchen zwei (Scheinen|Münzen)/.test(a.f));
    expect(legen).toHaveLength(3);
    for (const a of legen) {
      const ziel = zahlen(a.f)[0];
      expect(zahlen(a.r).reduce((s, n) => s + n, 0), a.f).toBe(ziel);
      for (const x of a.x) expect(zahlen(x).reduce((s, n) => s + n, 0), x).not.toBe(ziel);
      for (const n of zahlen(a.r)) expect([1, 2, 5, 10, 20, 50, 100], a.r).toContain(n);
    }
    expect(finde("k2geld", "Wie viele 50-Cent-Münzen sind so viel wert wie 2 Euro?").r).toBe(String(200 / 50));
    const meisten = finde("k2geld", "Was ist am meisten wert: 99 Cent, 1 Euro oder 1 Euro 5 Cent?");
    expect(cent(meisten.r)).toBe(Math.max(99, 100, 105));
    for (const x of meisten.x) expect(cent(x)).toBeLessThan(105);
    // Eis: 2 · 1 Euro 50 Cent = 3 Euro – „2 Euro 100 Cent" wäre gleich viel und darf keine Falschantwort sein
    const eis = finde("k2geld", "Wie viel bezahlt Ben für das Eis?");
    expect(eis.r).toBe("3 Euro");
    expect(eis.x).toEqual(["2 Euro 50 Cent", "3 Euro 50 Cent"]);
    // jede Geld-Aufgabe ist über Bild, Weg, Term oder die Stichproben oben abgedeckt
    const offen = alle("k2geld").filter((a) => !a.weg && !a.term && !(a.bild && a.f.startsWith("Wie viel")));
    expect(offen.map((a) => a.f).sort()).toEqual([
      "1 Euro = ? Cent", "Mit welchem Schein kannst du 18 Euro bezahlen?", "Mit welchen zwei Münzen legst du genau 3 Euro?",
      "Mit welchen zwei Münzen legst du genau 70 Cent?", "Mit welchen zwei Scheinen bezahlst du genau 30 Euro?",
      "Was ist am meisten wert: 99 Cent, 1 Euro oder 1 Euro 5 Cent?", "Welche Münze gibt es wirklich?",
      "Welche Münze ist am meisten wert?", "Welchen Schein gibt es wirklich?", "Wie viele 50-Cent-Münzen sind so viel wert wie 2 Euro?",
    ].sort());
  });
});

describe("k2uhr – Uhr: halb & viertel", () => {
  const uhrBild = (a) => a.bild?.art === "uhr";

  it("Ablesen: Die Antwort nennt genau die Zeit auf dem Ziffernblatt – digital oder in Worten", () => {
    const digital = mit("k2uhr", (a) => uhrBild(a) && a.f === "Wie spät ist es?");
    const worte = mit("k2uhr", (a) => uhrBild(a) && a.f === "Wie heißt diese Uhrzeit in Worten?");
    expect(digital.length).toBeGreaterThanOrEqual(22);
    expect(worte.length).toBeGreaterThanOrEqual(9);
    for (const a of digital) {
      expect(a.r, a.f).toBe(`${a.bild.zeit} Uhr`);
      for (const x of a.x) expect(x, a.f).toMatch(/^\d{1,2}:\d{2} Uhr$/);
    }
    for (const a of worte) {
      expect(inWorten(a.bild.zeit), a.bild.zeit).not.toBeNull();
      expect(a.r, a.bild.zeit).toBe(inWorten(a.bild.zeit));
    }
    // Der klassische Fehler bei „halb": die falsche Stunde (3:30 ist halb VIER, nicht halb drei)
    for (const a of worte.filter((q) => q.bild.zeit.endsWith(":30"))) {
      expect(a.x, a.bild.zeit).toContain(`halb ${STUNDEN[Number(a.bild.zeit.split(":")[0]) % 12]}`);
    }
  });

  it("easy: nur volle und halbe Stunden – hard: Viertel und 5-Minuten-Schritte", () => {
    for (const a of D.k2uhr.easy.filter(uhrBild)) expect(a.bild.zeit, a.f).toMatch(/:(00|30)$/);
    const hard = D.k2uhr.hard.filter(uhrBild);
    for (const a of hard) expect(Number(a.bild.zeit.split(":")[1]) % 5, a.bild.zeit).toBe(0);
    expect(hard.filter((a) => a.bild.zeit.endsWith(":15")).length).toBeGreaterThanOrEqual(5);
    expect(hard.filter((a) => a.bild.zeit.endsWith(":45")).length).toBeGreaterThanOrEqual(5);
    expect(hard.filter((a) => !/:(00|15|30|45)$/.test(a.bild.zeit)).length).toBeGreaterThanOrEqual(6);
    expect(D.k2uhr.easy.filter(uhrBild).length).toBeGreaterThanOrEqual(18);
    expect(hard.length).toBeGreaterThanOrEqual(20);
  });

  it("später und früher: nachgerechnet in Minuten, das Ziffernblatt läuft nicht über die 12", () => {
    const wandern = mit("k2uhr", (a) => a.delta !== undefined);
    expect(wandern.length).toBeGreaterThanOrEqual(12);
    const dauerWort = { 60: "eine Stunde", 30: "eine halbe Stunde", 15: "eine Viertelstunde" };
    for (const a of wandern) {
      const ziel = minuten(a.bild.zeit) + a.delta;
      expect(ziel >= 60 && ziel < 13 * 60, a.f).toBe(true);
      expect(a.r, `${a.bild.zeit} ${a.delta}`).toBe(`${alsZeit(ziel)} Uhr`);
      expect(a.f, a.f).toContain(dauerWort[Math.abs(a.delta)]);
      expect(a.f, a.f).toContain(a.delta > 0 ? "später" : "früher");
    }
    expect(D.k2uhr.easy.filter((a) => a.delta !== undefined).every((a) => a.delta === 60)).toBe(true);
    expect(D.k2uhr.hard.filter((a) => a.delta === 30).length).toBeGreaterThanOrEqual(4);
    expect(wandern.some((a) => a.x.includes("7:60 Uhr"))).toBe(true); // 7:30 + 30 Minuten ist NICHT 7:60
    const dauern = mit("k2uhr", (a) => a.dauer);
    expect(dauern.length).toBeGreaterThanOrEqual(3);
    for (const a of dauern) {
      const min = minuten(a.dauer.bis) - minuten(a.dauer.von);
      expect(a.r, a.f).toBe(min % 60 === 0 ? `${min / 60} Stunden` : `${min} Minuten`);
      expect(a.f, a.f).toContain(`${a.dauer.von} Uhr`);
      expect(a.f, a.f).toContain(`${a.dauer.bis} Uhr`);
    }
  });

  it("Sprechweise und Uhr-Wissen (Stichproben mit festen Erwartungen)", () => {
    const sprache = mit("k2uhr", (a) => /^Es ist halb (\S+)\. Was zeigt die Digitaluhr\?$/.test(a.f));
    expect(sprache).toHaveLength(3);
    for (const a of sprache) {
      expect(inWorten(a.r.replace(" Uhr", "")), a.f).toBe(/^Es ist (halb \S+)\./.exec(a.f)[1]);
      for (const x of a.x) expect(inWorten(x.replace(" Uhr", "")), x).not.toBe(/^Es ist (halb \S+)\./.exec(a.f)[1]);
    }
    const WISSEN = {
      "Welcher Zeiger zeigt die Stunden?": "der kurze Zeiger",
      "Welcher Zeiger zeigt die Minuten?": "der lange Zeiger",
      "Wo steht der lange Zeiger bei einer vollen Stunde?": "auf der 12",
      "Wo steht der lange Zeiger bei halb?": "auf der 6",
      "Wo steht der lange Zeiger bei Viertel nach?": "auf der 3",
      "Wo steht der lange Zeiger bei Viertel vor?": "auf der 9",
      "Wie viele Minuten hat eine Stunde?": `${60} Minuten`,
      "Wie viele Minuten hat eine halbe Stunde?": `${60 / 2} Minuten`,
      "Wie viele Minuten hat eine Viertelstunde?": `${60 / 4} Minuten`,
      "Wie viele Minuten sind drei Viertelstunden?": `${3 * 15} Minuten`,
      "Wie viele Viertelstunden hat eine Stunde?": String(60 / 15),
      "Wie viele Stunden hat ein Tag?": `${2 * 12} Stunden`,
      "Der lange Zeiger wandert von der 1 zur 2. Wie lange dauert das?": `${60 / 12} Minuten`,
      "Es ist 3 Uhr am Nachmittag. Was zeigt die Digitaluhr?": `${12 + 3}:00 Uhr`,
      "Die Digitaluhr zeigt 20:00 Uhr. Wie spät ist es am Abend?": `${20 - 12} Uhr`,
    };
    for (const [f, r] of Object.entries(WISSEN)) expect(finde("k2uhr", f)?.r, f).toBe(r);
    // jede Uhr-Aufgabe ist über Bild, Dauer, Sprechweise oder die Wissens-Tabelle abgedeckt
    const offen = alle("k2uhr").filter((a) => !a.bild && !a.dauer && !sprache.includes(a) && !(a.f in WISSEN));
    expect(offen.map((a) => a.f)).toEqual([]);
    // Duden: „Viertel nach/vor" wird großgeschrieben
    expect(JSON.stringify(D.k2uhr)).not.toMatch(/"viertel (nach|vor)/);
  });
});

describe("k2laengen – Längen", () => {
  it("Rechnungen mit cm und m: nachgerechnet, Falschantworten haben nie denselben Wert", () => {
    const rechnungen = mit("k2laengen", (a) => a.weg);
    expect(rechnungen.length).toBeGreaterThanOrEqual(26);
    for (const a of rechnungen) {
      const [, wert, einheit] = /^(\d+) (cm|m)$/.exec(a.r);
      expect(Number(wert), a.f).toBe(gehe(a.weg));
      for (const x of a.x) {
        expect(x, a.f).toMatch(/^\d+ (cm|m)$/);
        expect(inCm(x), `${a.f}: ${x}`).not.toBe(inCm(a.r));
      }
      // Aufgaben der Form „a cm + b cm = ?": Die Zahlen der Frage sind die Zahlen der Rechnung
      const m = /^(\d+) (cm|m) ([+−]) (\d+) (cm|m) = \?$/.exec(a.f);
      if (m) {
        expect(a.weg, a.f).toEqual([[Number(m[1]), m[3] === "+" ? "+" : "-", Number(m[4])]]);
        expect(m[2] === einheit && m[5] === einheit, a.f).toBe(true);
        expect(a.sprich, a.f).toBe(`Wie viel sind ${m[1]} ${einheit === "cm" ? "Zentimeter" : "Meter"} ${m[3] === "+" ? "plus" : "minus"} ${m[4]} ${einheit === "cm" ? "Zentimeter" : "Meter"}?`);
      }
    }
    expect(rechnungen.filter((a) => a.f.endsWith("= ?")).length).toBeGreaterThanOrEqual(12);
    // Geschichten: Jede Zahl des Textes kommt in der Rechnung vor (1 m zählt als 100 cm)
    const sachen = rechnungen.filter((a) => a.kontext);
    expect(sachen.length).toBeGreaterThanOrEqual(6);
    for (const a of sachen) {
      const imWeg = wegZahlen(a.weg);
      for (const n of zahlen(a.kontext)) expect(imWeg.includes(n) || imWeg.includes(n * 100), `${a.kontext}: ${n}`).toBe(true);
    }
  });

  it("Vergleichen: Die Antwort ist wirklich die längste bzw. kürzeste Länge", () => {
    const vergleiche = mit("k2laengen", (a) => /^Was ist (am längsten|am kürzesten|länger|kürzer): /.test(a.f));
    expect(vergleiche.length).toBeGreaterThanOrEqual(8);
    for (const a of vergleiche) {
      const teile = a.f.replace(/^[^:]+: /, "").replace(/\?$/, "").split(/, | oder /);
      const werte = teile.map(inCm);
      const ziel = /längsten|länger/.test(a.f) ? Math.max(...werte) : Math.min(...werte);
      expect(inCm(a.r), a.f).toBe(ziel);
      expect(teile, a.f).toContain(a.r);
      expect(werte.filter((w) => w === ziel), a.f).toHaveLength(1);
    }
  });

  it("Schätzen und Umrechnen (Stichproben mit festen Erwartungen)", () => {
    expect(finde("k2laengen", "1 m = ? cm").r).toBe("100 cm");
    expect(finde("k2laengen", "1 m = ? cm").sprich).toBe("Wie viele Zentimeter sind 1 Meter?");
    expect(finde("k2laengen", "100 cm = ? m").r).toBe("1 m");
    expect(finde("k2laengen", "50 cm + 50 cm = ? m").r).toBe(`${(50 + 50) / 100} m`);
    expect(finde("k2laengen", "1 m 20 cm = ? cm").r).toBe(`${inCm("1 m 20 cm")} cm`);
    expect(finde("k2laengen", "Was ist genauso lang wie 1 m?").r).toBe("100 cm");
    expect(finde("k2laengen", "Wie hoch ist etwa eine Zimmertür?").r).toBe("2 m");
    expect(finde("k2laengen", "Wie lang ist etwa ein neuer Bleistift?").r).toBe("18 cm");
    expect(finde("k2laengen", "Mia ist 120 cm groß, Ben ist 130 cm groß. Wer ist größer?").r).toBe("Ben");
    // Schätzaufgaben: Die Falschantworten liegen deutlich daneben (mindestens Faktor 2) – kein Streit um Zentimeter
    const schaetzen = mit("k2laengen", (a) => /etwa/.test(a.f));
    expect(schaetzen.length).toBeGreaterThanOrEqual(14);
    for (const a of schaetzen) {
      expect(a.r, a.f).toMatch(/^\d+ (cm|m)$/);
      for (const x of a.x) {
        const faktor = Math.max(inCm(x), inCm(a.r)) / Math.min(inCm(x), inCm(a.r));
        expect(faktor, `${a.f}: ${a.r} gegen ${x}`).toBeGreaterThanOrEqual(2);
      }
    }
    // realistische Größenordnung: Tür etwa 2 m, Bleistift unter 30 cm, Auto zwischen 3 und 6 m
    expect(inCm(finde("k2laengen", "Wie lang ist etwa ein Auto?").r)).toBeGreaterThanOrEqual(300);
    expect(inCm(finde("k2laengen", "Wie lang ist etwa ein Auto?").r)).toBeLessThanOrEqual(600);
    // Lineal-Aufgaben: Länge = Ende minus Anfang, das Bild ist ein Zahlenstrahl von 0 bis 10
    const lineal = mit("k2laengen", (a) => /am Lineal von der (\d+) bis zur (\d+)/.test(a.f));
    expect(lineal).toHaveLength(3);
    for (const a of lineal) {
      const [von, bis] = zahlen(a.f);
      expect(a.r, a.f).toBe(`${bis - von} cm`);
      expect(a.bild, a.f).toEqual({ art: "strahl", von: 0, bis: 10, schritt: 1, frage: [] });
    }
    expect(lineal.some((a) => zahlen(a.f)[0] > 0 && a.x.includes(`${zahlen(a.f)[1]} cm`))).toBe(true); // typisch: nur das Ende ablesen
    // Vorlesetext schreibt die Einheiten aus
    for (const a of alle("k2laengen").filter((q) => /\d (cm|m)\b/.test(q.f))) {
      expect(a.sprich, a.f).toMatch(/Zentimeter|Meter/);
    }
  });
});

describe("k2sach – Sachaufgaben", () => {
  it("easy rechnet in einem Schritt, hard in zwei – immer im Hunderterraum", () => {
    for (const a of D.k2sach.easy) expect(a.weg, a.f).toHaveLength(1);
    for (const a of D.k2sach.hard) expect(a.weg, a.f).toHaveLength(2);
    for (const a of alle("k2sach")) {
      let e = 0;
      for (const [p, op, q] of a.weg) {
        e = rechne(p === "e" ? e : p, op, q === "e" ? e : q);
        expect(Number.isInteger(e) && e >= 0 && e <= 100, `${a.kontext}: Zwischenergebnis ${e}`).toBe(true);
      }
      expect(a.r, a.kontext).toBe(`${e} ${a.r.split(" ")[1]}`);
      for (const x of a.x) expect(Number(x.split(" ")[0]) <= 100, `${a.f}: ${x}`).toBe(true);
    }
    // in hard hängt der zweite Schritt am ersten
    for (const a of D.k2sach.hard) expect(a.weg[1].includes("e"), a.f).toBe(true);
  });

  it("Text und Rechnung passen zusammen: Jede Zahl der Geschichte wird gebraucht – und keine fehlt", () => {
    for (const a of alle("k2sach")) {
      expect(typeof a.kontext, a.f).toBe("string");
      expect(zahlen(a.f), `Zahlen gehören in den Kontext: ${a.f}`).toEqual([]);
      const imText = zahlen(a.kontext), imWeg = wegZahlen(a.weg);
      for (const n of imText) expect(imWeg, `${a.kontext}: ${n} wird nicht gebraucht`).toContain(n);
      for (const n of imWeg) {
        const versteckt = n === 2 && /doppelt|Hälfte/.test(a.kontext); // „doppelt" und „die Hälfte" stehen als Wort da
        const zweimal = imWeg.filter((w) => w === n).length > 1; // dieselbe Zahl darf im Weg zweimal vorkommen
        expect(imText.includes(n) || versteckt, `${a.kontext}: ${n} steht nicht im Text`).toBe(true);
        if (zweimal) expect(imText, a.kontext).toContain(n);
      }
      expect(a.f, a.f).toMatch(/^Wie (viele?|alt|lange) .*\?$/);
    }
  });

  it("alle vier Rechenarten kommen vor; Falschantworten sind typische Fehler (Stichproben)", () => {
    const ops = (liste) => new Set(liste.flatMap((a) => a.weg.map(([, op]) => op)));
    expect([...ops(D.k2sach.easy)].sort()).toEqual(["+", "-", "·", ":"].sort());
    expect([...ops(D.k2sach.hard)].sort()).toEqual(["+", "-", "·", ":"].sort());
    // easy mit Plus oder Minus: Die verwechselte Rechenart steht als Falschantwort da
    const plusMinus = D.k2sach.easy.filter((a) => ["+", "-"].includes(a.weg[0][1]) && a.weg[0][0] + a.weg[0][2] <= 100);
    expect(plusMinus.length).toBeGreaterThanOrEqual(15);
    for (const a of plusMinus) {
      const [p, op, q] = a.weg[0];
      const verwechselt = op === "+" ? Math.abs(p - q) : p + q;
      expect(a.x.map((x) => Number(x.split(" ")[0])), a.kontext).toContain(verwechselt);
    }
    // hard: „zweiten Schritt vergessen" steht als Falschantwort da
    for (const a of D.k2sach.hard) {
      const [p, op, q] = a.weg[0];
      expect(a.x.map((x) => Number(x.split(" ")[0])), a.kontext).toContain(rechne(p, op, q));
    }
    const sticker = finde("k2sach", "Wie viele Sticker hat Mia jetzt?");
    expect(sticker).toMatchObject({ r: "29 Sticker", x: ["19 Sticker", "28 Sticker"], kontext: "Mia hat 24 Sticker. Von Ben bekommt sie 5 Sticker dazu." });
    expect(finde("k2sach", "Wie viel Geld bekommt Emma zurück?").r).toBe(`${10 - 2 * 3} Euro`);
    expect(finde("k2sach", "Wie alt ist Toms Mutter?").r).toBe(`${4 * 9 - 2} Jahre`);
    expect(finde("k2sach", "Wie viele Sticker haben beide zusammen?").r).toBe(`${27 + (27 + 9)} Sticker`);
  });
});

describe("k2spiegeln – Spiegeln & Körper", () => {
  // Druckbuchstaben mit mindestens einer Spiegelachse (senkrecht oder waagerecht)
  const SENKRECHT = new Set("AHIMOTUVWXY");
  const WAAGERECHT = new Set("BCDEHIKOX");
  const hatAchse = (b) => SENKRECHT.has(b) || WAAGERECHT.has(b);
  const ECKEN = { kreis: 0, dreieck: 3, quadrat: 4, rechteck: 4 };
  const NAME = { kreis: "Kreis", dreieck: "Dreieck", quadrat: "Quadrat", rechteck: "Rechteck" };
  const FARBE = { rot: "rot", blau: "blau", gelb: "gelb", gruen: "grün" };
  /** „kreis:rot" → „roter Kreis", „quadrat" → „Quadrat". */
  const nenne = (teil) => {
    const [form, farbe] = teil.split(":");
    if (!farbe) return NAME[form];
    return `${FARBE[farbe]}${form === "kreis" ? "er" : "es"} ${NAME[form]}`;
  };
  const formenBild = (a) => a.bild?.art === "formen";

  it("ohne neue Bildart: nur Formen-Bilder oder gar kein Bild", () => {
    for (const a of alle("k2spiegeln")) {
      if (a.bild) expect(a.bild.art, a.f).toBe("formen");
      expect(a.bloecke, a.f).toBeUndefined();
    }
  });

  it("Spiegelachsen bei Buchstaben: genau eine Antwort passt", () => {
    const mitAchse = mit("k2spiegeln", (a) => a.f.startsWith("Welcher Buchstabe hat eine Spiegelachse: "));
    const ohneAchse = mit("k2spiegeln", (a) => a.f.startsWith("Welcher Buchstabe hat keine Spiegelachse: "));
    expect(mitAchse.length).toBeGreaterThanOrEqual(6);
    expect(ohneAchse.length).toBeGreaterThanOrEqual(4);
    for (const a of [...mitAchse, ...ohneAchse]) {
      const drei = a.f.match(/\b[A-Z]\b/g);
      expect(drei, a.f).toHaveLength(3);
      expect([...drei].sort(), a.f).toEqual(drei); // alphabetisch – die Reihenfolge verrät nichts
      expect([a.r, ...a.x].sort(), a.f).toEqual(drei);
      const soll = mitAchse.includes(a);
      expect(drei.filter((b) => hatAchse(b) === soll), a.f).toEqual([a.r]);
    }
    expect(finde("k2spiegeln", "Wie viele Spiegelachsen hat der Buchstabe H?").r).toBe(String(Number(SENKRECHT.has("H")) + Number(WAAGERECHT.has("H"))));
    expect(finde("k2spiegeln", "Wie viele Spiegelachsen hat der Buchstabe T?").r).toBe(String(Number(SENKRECHT.has("T")) + Number(WAAGERECHT.has("T"))));
    expect(finde("k2spiegeln", "Wie verläuft die Spiegelachse beim Buchstaben T?").r).toBe(SENKRECHT.has("T") ? "senkrecht" : "waagerecht");
    expect(finde("k2spiegeln", "Wie verläuft die Spiegelachse beim Buchstaben E?").r).toBe(WAAGERECHT.has("E") ? "waagerecht" : "senkrecht");
    // Spiegelwort: vorwärts wie rückwärts gleich UND jeder Buchstabe hat eine senkrechte Achse
    const wort = finde("k2spiegeln", "Welches Wort sieht im Spiegel genauso aus: HUT, UFO oder UHU?");
    const spiegelfest = (w) => [...w].every((b) => SENKRECHT.has(b)) && [...w].reverse().join("") === w;
    expect([wort.r, ...wort.x].filter(spiegelfest)).toEqual([wort.r]);
  });

  it("Formen: Namen, Ecken, Muster und gespiegelte Reihen stimmen mit dem Bild überein", () => {
    for (const a of mit("k2spiegeln", (q) => q.f === "Wie heißt diese Form?")) {
      expect(a.bild.folge, a.f).toHaveLength(1);
      expect(a.r, a.f).toBe(NAME[a.bild.folge[0]]);
    }
    for (const a of mit("k2spiegeln", (q) => q.f === "Wie viele Ecken hat diese Form?")) {
      const ecken = ECKEN[a.bild.folge[0]];
      expect(a.r, a.bild.folge[0]).toBe(ecken === 0 ? "keine" : String(ecken));
    }
    for (const a of mit("k2spiegeln", (q) => q.f === "Wie viele Ecken haben diese Formen zusammen?")) {
      expect(a.r, a.f).toBe(String(a.bild.folge.reduce((s, t) => s + ECKEN[t], 0)));
    }
    expect(finde("k2spiegeln", "Wie viele Dreiecke siehst du?").r).toBe(String(finde("k2spiegeln", "Wie viele Dreiecke siehst du?").bild.folge.filter((t) => t === "dreieck").length));
    expect(finde("k2spiegeln", "Wie viele Vierecke siehst du?").r).toBe(String(finde("k2spiegeln", "Wie viele Vierecke siehst du?").bild.folge.filter((t) => ECKEN[t] === 4).length));

    // Muster: Die Reihe wiederholt sich mit der kleinsten passenden Periode
    const muster = mit("k2spiegeln", (q) => formenBild(q) && /^Welche Form (kommt als Nächstes|fehlt in der Reihe)\?$/.test(q.f));
    expect(muster.length).toBeGreaterThanOrEqual(5);
    for (const a of muster) {
      const folge = a.bild.folge, luecke = folge.indexOf("?");
      expect(luecke, a.f).toBeGreaterThanOrEqual(0);
      const passt = (p) => folge.every((t, i) => t === "?" || i + p >= folge.length || folge[i + p] === "?" || folge[i + p] === t);
      const periode = [1, 2, 3].find(passt);
      expect(periode, JSON.stringify(folge)).toBeDefined();
      const partner = luecke - periode >= 0 ? folge[luecke - periode] : folge[luecke + periode];
      expect(a.r, JSON.stringify(folge)).toBe(nenne(partner));
      for (const x of a.x) expect(x, a.f).not.toBe(nenne(partner));
    }
    // Gespiegelte Reihe: Das Gegenstück liegt gleich weit von der Mitte entfernt
    const gespiegelt = mit("k2spiegeln", (q) => /in der Mitte gespiegelt/.test(q.f));
    expect(gespiegelt.length).toBeGreaterThanOrEqual(3);
    for (const a of gespiegelt) {
      const folge = a.bild.folge, luecke = folge.indexOf("?");
      folge.forEach((t, i) => { if (i !== luecke && folge.length - 1 - i !== luecke) expect(folge[folge.length - 1 - i], JSON.stringify(folge)).toBe(t); });
      expect(a.r, JSON.stringify(folge)).toBe(nenne(folge[folge.length - 1 - luecke]));
    }
  });

  it("Körper-Wissen: Ecken, Flächen, Kanten und „Was rollt?“ (feste Erwartungen)", () => {
    const WISSEN = {
      "Wie viele Ecken hat ein Würfel?": "8",
      "Wie viele Flächen hat ein Würfel?": "6",
      "Wie viele Kanten hat ein Würfel?": "12",
      "Wie viele Ecken hat ein Quader?": "8",
      "Wie viele Flächen hat ein Quader?": "6",
      "Wie viele Ecken hat eine Kugel?": "keine",
      "Wie viele flache Kreisflächen hat ein Zylinder?": "2",
      "Welche Form haben die Flächen eines Würfels?": "Quadrate",
      "Welche Form haben die Flächen eines Quaders?": "Rechtecke",
      "Welcher Körper kann rollen: Kugel, Quader oder Würfel?": "Kugel",
      "Welcher Körper kann rollen und auch sicher stehen?": "Zylinder",
      "Welcher Körper hat keine Ecken und keine Kanten?": "Kugel",
      "Welcher Körper kann nicht rollen: Kugel, Quader oder Zylinder?": "Quader",
      "Welchen Körper kannst du nicht stapeln?": "Kugel",
      "Alle 6 Flächen sind gleich große Quadrate. Welcher Körper ist das?": "Würfel",
      "Welche Körperform hat ein Spielwürfel?": "Würfel",
      "Welche Körperform hat ein Fußball?": "Kugel",
      "Welche Körperform hat ein Schuhkarton?": "Quader",
      "Welche Körperform hat eine Konservendose?": "Zylinder",
      "Welche Körperform hat eine Murmel?": "Kugel",
      "Welche Körperform hat ein dickes Buch?": "Quader",
      "Welcher Gegenstand ist ein Zylinder?": "Dose",
      "Welcher Gegenstand ist ein Quader?": "Ziegelstein",
      "Welche Form hat keine Ecken?": "Kreis",
      "Welche Form hat 4 gleich lange Seiten?": "Quadrat",
      "Was ist eine Spiegelachse?": "eine Faltlinie",
      "Ein Schmetterling hat zwei gleiche Hälften. Wie nennt man das?": "symmetrisch",
      "Welche Ziffer hat eine Spiegelachse: 2, 5 oder 8?": "8",
      "Du faltest ein Quadrat Kante auf Kante. Welche Form entsteht?": "Rechteck",
      "Du faltest ein Quadrat Ecke auf Ecke. Welche Form entsteht?": "Dreieck",
    };
    for (const [f, r] of Object.entries(WISSEN)) expect(finde("k2spiegeln", f)?.r, f).toBe(r);
    // Euler prüft den Würfel mit: Ecken − Kanten + Flächen = 2
    expect(8 - 12 + 6).toBe(2);
    const koerper = ["Würfel", "Kugel", "Quader", "Zylinder"];
    for (const a of mit("k2spiegeln", (q) => /Körper/.test(q.f))) {
      for (const text of [a.r, ...a.x]) expect(koerper, a.f).toContain(text);
    }
    // jede Aufgabe ist über Bild, Buchstaben-Regel oder die Wissens-Tabelle abgedeckt
    const offen = alle("k2spiegeln").filter((a) => !a.bild && !/Buchstabe|Wort sieht/.test(a.f) && !(a.f in WISSEN));
    expect(offen.map((a) => a.f)).toEqual([]);
    expect(D.k2spiegeln.easy.filter((a) => /Körper/.test(a.f)).length).toBeGreaterThanOrEqual(6);
    expect(D.k2spiegeln.hard.filter((a) => /Würfel|Quader|Kugel|Zylinder/.test(a.f + a.r)).length).toBeGreaterThanOrEqual(12);
  });
});
