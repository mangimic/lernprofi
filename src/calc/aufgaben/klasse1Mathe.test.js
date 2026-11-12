import { describe, it, expect, vi } from "vitest";
import { K1_MATHE_DATEN, K1_MATHE_BEREICHE, k1MatheErzeugen } from "./klasse1Mathe.js";
import { poolGesund } from "../aufgabenRunde.js";

/* Mathe Klasse 1 (Zahlenraum bis 20): Hier wird ALLES nachgerechnet –
   jede Rechnung über `term`, Geld über `bild.werte`, Uhrzeiten über
   `bild.zeit`, Muster über die kleinste Wiederholung. Keine Lösung im
   Pool darf falsch sein, kein Distraktor versehentlich richtig. */

const KEYS = ["k1zahlen", "k1zerlegen", "k1plus", "k1minus", "k1geld", "k1formen", "k1uhr"];
const BILD_ARTEN = ["zwanzig", "muenzen", "formen", "emoji", "uhr", "strahl"];
const FELDER = ["f", "r", "x", "tipp", "sprich", "bild", "bloecke", "kontext", "term"];
const SPRICH_PFLICHT = /[+\-−·:=]|__|\?(?!\s*$)/; // Rechenzeichen, Platzhalter, „?“ mitten im Text
const EMOJI = /\p{Extended_Pictographic}/u;
const NAMEN = ["Mia", "Ben", "Lena", "Tom", "Ali", "Emma", "Noah", "Ida"];

const pool = (key) => K1_MATHE_DATEN[key];
const alle = (key) => [...pool(key).easy, ...pool(key).hard];
const zahlenIn = (text) => (text.match(/\d+/g) || []).map(Number);
const rechne = ({ a, op, b }) => ({ "+": a + b, "-": a - b, "·": a * b, ":": a / b })[op];
const finde = (key, f) => {
  const a = alle(key).find((x) => x.f === f);
  expect(a, `Aufgabe fehlt: ${f}`).toBeTruthy();
  return a;
};
const summe = (werte) => werte.reduce((s, w) => s + w, 0);

describe("Klasse 1 Mathe – Aufbau", () => {
  it("hat sieben Bereiche in Lernweg-Reihenfolge, je mit Pool", () => {
    expect(K1_MATHE_BEREICHE.map((b) => b.key)).toEqual(KEYS);
    expect(K1_MATHE_BEREICHE.map((b) => b.name)).toEqual([
      "Zahlen bis 20", "Zahlen zerlegen", "Plus bis 20", "Minus bis 20",
      "Geld bis 20 Euro", "Formen & Muster", "Uhr: volle Stunden",
    ]);
    for (const b of K1_MATHE_BEREICHE) expect(b.emoji, b.key).toMatch(EMOJI);
    expect(Object.keys(K1_MATHE_DATEN)).toEqual(KEYS);
  });

  it("ist deterministisch: zweimal erzeugen liefert dasselbe, ganz ohne Math.random", () => {
    const spion = vi.spyOn(Math, "random");
    const eins = k1MatheErzeugen();
    const zwei = k1MatheErzeugen();
    expect(spion).not.toHaveBeenCalled();
    spion.mockRestore();
    expect(eins).toEqual(zwei);
    expect(eins).toEqual(K1_MATHE_DATEN);
  });
});

describe.each(KEYS)("Pool %s – Form", (key) => {
  it("ist gesund und groß genug (24 easy, 20 hard)", () => {
    expect(poolGesund(pool(key))).toBe(true);
    expect(pool(key).easy.length).toBeGreaterThanOrEqual(24);
    expect(pool(key).hard.length).toBeGreaterThanOrEqual(20);
  });

  it("jede Aufgabe: 2 verschiedene Falschantworten, kurze Frage, Tipp, keine Emojis im Text", () => {
    for (const a of alle(key)) {
      expect(Object.keys(a).filter((k) => !FELDER.includes(k)), a.f).toEqual([]);
      expect(a.x, a.f).toHaveLength(2);
      expect(new Set([a.r, ...a.x]).size, a.f).toBe(3);
      for (const t of [a.r, ...a.x]) {
        expect(typeof t, a.f).toBe("string");
        expect(t.length, `${a.f} → ${t}`).toBeLessThanOrEqual(17);
      }
      expect(a.f.length, a.f).toBeLessThanOrEqual(70);
      expect(a.tipp.length, a.tipp).toBeLessThanOrEqual(120);
      expect(a.tipp, a.f).toMatch(/[.?!…]$/);
      for (const t of [a.f, a.r, ...a.x, a.tipp, a.sprich || ""]) expect(t, a.f).not.toMatch(EMOJI);
    }
  });

  it("keine doppelten Aufgaben (gleiche Frage + gleiches Bild) im ganzen Bereich", () => {
    const schluessel = alle(key).map((a) => JSON.stringify([a.f, a.bild || null, a.bloecke || null]));
    const doppelt = schluessel.filter((s, i) => schluessel.indexOf(s) !== i);
    expect(doppelt).toEqual([]);
  });

  it("sprich ist da, wo vorgelesen werden muss (Rechenzeichen, Platzhalter, jede Rechnung)", () => {
    for (const a of alle(key)) {
      if (SPRICH_PFLICHT.test(a.f) || a.term) {
        expect(typeof a.sprich, a.f).toBe("string");
        expect(a.sprich.length, a.f).toBeGreaterThan(5);
        expect(a.sprich, a.f).not.toMatch(/[+−=]|__/); // vorgelesen wird in Wörtern
      }
    }
  });

  it("alle term-Aufgaben sind nachgerechnet und bleiben im Zahlenraum bis 20", () => {
    for (const a of alle(key).filter((x) => x.term)) {
      const { a: links, op, b: rechts, gesucht } = a.term;
      expect(["+", "-", "·", ":"], a.f).toContain(op);
      const ergebnis = rechne(a.term);
      for (const n of [links, rechts, ergebnis]) {
        expect(Number.isInteger(n) && n >= 0 && n <= 20, `${a.f}: ${n}`).toBe(true);
      }
      if (gesucht) {
        expect(["a", "b"], a.f).toContain(gesucht);
        expect(a.r, a.f).toBe(String(a.term[gesucht]));
        // Ergebnis und bekannter Teil müssen in der Frage stehen – sonst wäre sie nicht lösbar
        const bekannt = gesucht === "a" ? rechts : links;
        const verliebt = /verliebt/.test(a.f) && ergebnis === 10;
        if (!verliebt) expect(zahlenIn(a.f), a.f).toContain(ergebnis);
        expect(zahlenIn(a.f).includes(bekannt) || a.bild?.rot === bekannt, a.f).toBe(true);
      } else {
        expect(a.r, a.f).toBe(String(ergebnis));
        if (!/Hälfte|Doppelte|teilen/.test(a.f)) {
          expect(zahlenIn(a.f), a.f).toEqual(expect.arrayContaining([links, rechts]));
        }
      }
      for (const x of a.x) expect(x, a.f).toMatch(/^\d+$/);
    }
  });

  it("Bilder: nur erlaubte Arten, Werte passen zur Bild-Form", () => {
    for (const a of alle(key)) {
      if (a.bloecke) {
        expect(a.bloecke.z, a.f).toBe(1);
        expect(a.bloecke.e >= 0 && a.bloecke.e <= 9, a.f).toBe(true);
      }
      const b = a.bild;
      if (!b) continue;
      expect(BILD_ARTEN, a.f).toContain(b.art);
      if (b.art === "zwanzig") {
        expect(Number.isInteger(b.rot) && Number.isInteger(b.blau) && b.rot >= 0 && b.blau >= 0, a.f).toBe(true);
        expect(b.rot + b.blau, a.f).toBeLessThanOrEqual(20);
      }
      if (b.art === "muenzen") {
        expect(b.werte.length, a.f).toBeGreaterThan(0);
        for (const w of b.werte) expect([1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000], a.f).toContain(w);
      }
      if (b.art === "formen") {
        expect(b.folge.length >= 1 && b.folge.length <= 8, a.f).toBe(true);
        for (const t of b.folge) expect(t, a.f).toMatch(/^(\?|(kreis|dreieck|quadrat|rechteck)(:(rot|blau|gelb|gruen))?)$/);
        expect(b.folge.filter((t) => t === "?").length, a.f).toBeLessThanOrEqual(1);
      }
      if (b.art === "emoji") {
        expect(b.zeichen, a.f).toMatch(EMOJI);
        expect(b.anzahl >= 1 && b.anzahl <= 10, a.f).toBe(true);
      }
      if (b.art === "uhr") {
        expect(b.zeit, a.f).toMatch(/^([1-9]|1[0-2]):(00|30)$/);
      }
      if (b.art === "strahl") {
        expect(b.von >= 0 && b.bis <= 20 && b.von < b.bis, a.f).toBe(true);
        for (const n of b.frage) expect((n - b.von) % b.schritt === 0 && n >= b.von && n <= b.bis, a.f).toBe(true);
      }
    }
  });

  it("Sachaufgaben nutzen nur die erlaubten Namen", () => {
    // Wer in einer Geschichte etwas hat, isst, spart … ist ein erlaubter Name (oder ein Fürwort/Fragewort).
    const KEIN_NAME = ["Er", "Sie", "Es", "Du", "Wer", "Wie", "Was", "Wann", "Ein", "Eine", "Welche", "Welches", "Oma", "Opa"];
    const TUN = "hat|isst|spart|zahlt|liest|pflückt|würfelt|kommt|möchte|nimmt|schenkt|gibt|kauft|und [A-ZÄÖÜ][a-zäöüß]+ teilen";
    const muster = new RegExp(`(?:^|[.?!,] )([A-ZÄÖÜ][a-zäöüß]+) (?:${TUN})(?= )`, "g");
    for (const a of alle(key)) {
      for (const [, wort] of a.f.matchAll(muster)) {
        if (!KEIN_NAME.includes(wort)) expect(NAMEN, a.f).toContain(wort);
      }
    }
  });
});

/* ---------- 1) Zahlen bis 20 ---------- */
describe("k1zahlen – Inhalt", () => {
  const { easy, hard } = pool("k1zahlen");

  it("easy bleibt im Zahlenraum bis 10, hard geht bis 20", () => {
    for (const a of easy) {
      for (const n of [...zahlenIn(a.f), ...zahlenIn(a.r)]) expect(n, a.f).toBeLessThanOrEqual(10);
      if (a.bild?.art === "strahl") expect(a.bild.bis, a.f).toBeLessThanOrEqual(10);
      if (a.bild?.art === "zwanzig") expect(a.bild.rot + a.bild.blau, a.f).toBeLessThanOrEqual(10);
      expect(a.bloecke, a.f).toBeUndefined();
    }
    expect(hard.filter((a) => zahlenIn(a.r).some((n) => n > 10)).length).toBeGreaterThanOrEqual(20);
    for (const a of hard) for (const n of zahlenIn(a.r)) expect(n, a.f).toBeLessThanOrEqual(20);
  });

  it("Zählen, Zwanzigerfeld, Blöcke und Zahlenstrahl: Antwort stimmt mit dem Bild überein", () => {
    const zaehl = alle("k1zahlen").filter((a) => a.bild?.art === "emoji");
    expect(zaehl.length).toBeGreaterThanOrEqual(5);
    for (const a of zaehl) expect(a.r, a.f).toBe(String(a.bild.anzahl));

    const feld = alle("k1zahlen").filter((a) => a.bild?.art === "zwanzig");
    expect(feld.length).toBeGreaterThanOrEqual(8);
    for (const a of feld) {
      const soll = /rote/.test(a.f) ? a.bild.rot : /blaue/.test(a.f) ? a.bild.blau : a.bild.rot + a.bild.blau;
      expect(a.r, a.f).toBe(String(soll));
    }

    const strahl = alle("k1zahlen").filter((a) => a.bild?.art === "strahl");
    expect(strahl.length).toBeGreaterThanOrEqual(8);
    for (const a of strahl) {
      expect(a.bild.frage, a.f).toHaveLength(1);
      expect(a.r, a.f).toBe(String(a.bild.frage[0]));
    }

    const bloecke = hard.filter((a) => a.bloecke);
    expect(bloecke.length).toBeGreaterThanOrEqual(3);
    for (const a of bloecke) {
      const zahl = a.bloecke.z * 10 + a.bloecke.e;
      const soll = /Einer hat/.test(a.f) ? a.bloecke.e : /Zehner stecken/.test(a.f) ? a.bloecke.z : zahl;
      expect(a.r, a.f).toBe(String(soll));
      if (/Zahl \d+/.test(a.f)) expect(zahlenIn(a.f), a.f).toContain(zahl);
    }
  });

  it("Vorgänger, Nachfolger, Nachbarn und Zahlenfolgen sind nachgerechnet", () => {
    let gezaehlt = 0;
    for (const a of alle("k1zahlen")) {
      const [n] = zahlenIn(a.f);
      if (/kommt nach der/.test(a.f)) { expect(a.r, a.f).toBe(String(n + 1)); gezaehlt++; }
      if (/kommt vor der/.test(a.f)) { expect(a.r, a.f).toBe(String(n - 1)); gezaehlt++; }
      if (/Nachbarn der/.test(a.f)) { expect(a.r, a.f).toBe(`${n - 1} und ${n + 1}`); gezaehlt++; }
      if (/liegt zwischen/.test(a.f)) {
        const [u, o] = zahlenIn(a.f);
        expect(o - u, a.f).toBe(2);
        expect(a.r, a.f).toBe(String(u + 1));
        gezaehlt++;
      }
      if (/^Zähle .*: .*\?$/.test(a.f)) {
        const [z1, z2, z3] = zahlenIn(a.f);
        expect(z3 - z2, a.f).toBe(z2 - z1);
        expect(a.r, a.f).toBe(String(z3 + (z2 - z1)));
        expect(a.sprich, a.f).toContain(`${z1}, ${z2}, ${z3}`);
        gezaehlt++;
      }
    }
    expect(gezaehlt).toBeGreaterThanOrEqual(25);
  });

  it("Vergleichen und Ordnen: richtige Antwort stimmt, falsche stimmen nicht", () => {
    const wahr = (s) => {
      const [, a, z, b] = s.match(/^(\d+) ([<>=]) (\d+)$/);
      return z === "<" ? +a < +b : z === ">" ? +a > +b : +a === +b;
    };
    const vergleiche = alle("k1zahlen").filter((a) => a.f.startsWith("Vergleiche"));
    expect(vergleiche.length).toBeGreaterThanOrEqual(5);
    for (const a of vergleiche) {
      expect(wahr(a.r), a.f).toBe(true);
      for (const x of a.x) expect(wahr(x), `${a.f} → ${x}`).toBe(false);
      expect(zahlenIn(a.r), a.f).toEqual(zahlenIn(a.f));
    }
    for (const a of alle("k1zahlen")) {
      const z = zahlenIn(a.f);
      if (/die größte von/.test(a.f)) expect(a.r, a.f).toBe(String(Math.max(...z)));
      if (/die kleinste von/.test(a.f)) expect(a.r, a.f).toBe(String(Math.min(...z)));
      if (/die (größte|kleinste) von/.test(a.f)) expect([a.r, ...a.x].map(Number).sort(), a.f).toEqual([...z].sort());
      if (/ist größer als/.test(a.f)) {
        expect(+a.r, a.f).toBeGreaterThan(z[0]);
        for (const x of a.x) expect(+x, a.f).toBeLessThan(z[0]);
      }
      if (/ist kleiner als/.test(a.f)) {
        expect(+a.r, a.f).toBeLessThan(z[0]);
        for (const x of a.x) expect(+x, a.f).toBeGreaterThan(z[0]);
      }
      if (a.f.startsWith("Ordne")) {
        expect(a.r, a.f).toBe([...z].sort((p, q) => p - q).join(", "));
        for (const x of a.x) expect(zahlenIn(x).sort(), a.f).toEqual([...z].sort());
      }
    }
  });

  it("Stichproben", () => {
    expect(finde("k1zahlen", "Welche Zahl kommt nach der 19?").r).toBe("20");
    expect(finde("k1zahlen", "Welche Zahl kommt vor der 20?").r).toBe("19");
    const zwoelf = finde("k1zahlen", "Wie schreibst du zwölf als Zahl?");
    expect(zwoelf.r).toBe("12");
    expect(zwoelf.x).toContain("20"); // typische Verwechslung zwölf/zwanzig
    expect(finde("k1zahlen", "Zähle in Fünferschritten: 5, 10, 15, ?").r).toBe("20");
    expect(easy.some((a) => a.bild?.art === "emoji")).toBe(true);
    expect(hard.some((a) => a.bild?.art === "strahl" && a.bild.bis === 20)).toBe(true);
  });
});

/* ---------- 2) Zahlen zerlegen ---------- */
describe("k1zerlegen – Inhalt", () => {
  const { easy, hard } = pool("k1zerlegen");

  it("easy zerlegt Zahlen bis 10, hard ergänzt zur 10 und zur 20", () => {
    for (const a of easy.filter((x) => x.term)) {
      expect(a.term.gesucht, a.f).toBeTruthy();
      expect(a.term.a + a.term.b, a.f).toBeLessThanOrEqual(10);
    }
    for (const a of hard) {
      expect(a.term?.gesucht, a.f).toBeTruthy();
      const t = a.term.a + a.term.b;
      expect(t === 10 || t === 20 || (a.term.a === 10 && t < 20), `${a.f} → ${t}`).toBe(true);
    }
    expect(hard.filter((a) => a.term.a + a.term.b === 10).length).toBeGreaterThanOrEqual(8);
    expect(hard.filter((a) => a.term.a + a.term.b === 20).length).toBeGreaterThanOrEqual(8);
    expect(alle("k1zerlegen").filter((a) => a.term?.gesucht && a.f.includes("?")).length).toBeGreaterThanOrEqual(20);
  });

  it("Zwanzigerfeld passt zur Zerlegung, „Welche Zerlegung passt“ ist nachgerechnet", () => {
    const feld = alle("k1zerlegen").filter((a) => a.bild);
    expect(feld.length).toBeGreaterThanOrEqual(10);
    for (const a of feld) {
      expect(a.bild.art, a.f).toBe("zwanzig");
      expect(a.bild.rot, a.f).toBe(a.term.a);
      if (/fehlen bis zur/.test(a.f)) expect(a.bild.blau, a.f).toBe(0);
      else expect(a.bild.blau, a.f).toBe(a.term.b);
    }
    const passt = easy.filter((a) => /Welche Zerlegung passt zur/.test(a.f));
    expect(passt.length).toBeGreaterThanOrEqual(2);
    for (const a of passt) {
      const [ziel] = zahlenIn(a.f);
      expect(summe(zahlenIn(a.r)), a.f).toBe(ziel);
      for (const x of a.x) expect(summe(zahlenIn(x)), a.f).not.toBe(ziel);
    }
  });

  it("verliebte Zahlen ergeben immer 10", () => {
    const verliebt = hard.filter((a) => /verliebt/.test(a.f));
    expect(verliebt.length).toBeGreaterThanOrEqual(5);
    for (const a of verliebt) expect(+a.r + zahlenIn(a.f)[0], a.f).toBe(10);
  });

  it("Stichproben", () => {
    expect(finde("k1zerlegen", "Ben hat 16 Sticker. Er möchte 20 haben. Wie viele fehlen ihm noch?").r).toBe("4");
    expect(finde("k1zerlegen", "Mia hat 8 Murmeln. 5 sind rot, die anderen blau. Wie viele sind blau?").r).toBe("3");
    const luecke = hard.find((a) => /^\d+ \+ \? = 20$/.test(a.f));
    expect(+luecke.r + zahlenIn(luecke.f)[0]).toBe(20);
    expect(luecke.sprich).toMatch(/plus wie viel ist 20\?$/);
  });
});

/* ---------- 3) Plus bis 20 ---------- */
describe("k1plus – Inhalt", () => {
  const { easy, hard } = pool("k1plus");
  const uebergang = ({ a, b }) => a < 10 && b < 10 && a + b > 10;

  it("jede Aufgabe ist eine Plus-Rechnung mit Ergebnis als Antwort", () => {
    for (const a of alle("k1plus")) {
      expect(a.term?.op, a.f).toBe("+");
      expect(a.term.gesucht, a.f).toBeUndefined();
    }
  });

  it("easy rechnet ohne Zehnerübergang, hard mit Übergang oder verdoppelt", () => {
    for (const a of easy) {
      const { a: l, b: r } = a.term;
      expect(uebergang(a.term), a.f).toBe(false);
      expect((l % 10) + (r % 10), a.f).toBeLessThanOrEqual(10);
    }
    expect(easy.slice(0, 10).every((a) => a.term.a + a.term.b <= 10)).toBe(true); // erstes Paket: bis 10
    expect(easy.filter((a) => a.term.a === 10 || a.term.b === 10).length).toBeGreaterThanOrEqual(5);
    expect(easy.filter((a) => a.term.a > 10 && a.term.b < 10).length).toBeGreaterThanOrEqual(6);
    for (const a of hard) expect(uebergang(a.term) || a.term.a === a.term.b, a.f).toBe(true);
    expect(hard.filter((a) => a.term.a === a.term.b).length).toBeGreaterThanOrEqual(5);
    expect(hard.filter((a) => uebergang(a.term)).length).toBeGreaterThanOrEqual(15);
  });

  it("ein Teil zeigt das Zwanzigerfeld – rot und blau sind die beiden Summanden", () => {
    const feld = alle("k1plus").filter((a) => a.bild);
    expect(feld.filter((a) => easy.includes(a)).length).toBeGreaterThanOrEqual(5);
    expect(feld.filter((a) => hard.includes(a)).length).toBeGreaterThanOrEqual(3);
    for (const a of feld) expect(a.bild, a.f).toEqual({ art: "zwanzig", rot: a.term.a, blau: a.term.b });
  });

  it("Stichproben", () => {
    const acht = finde("k1plus", "8 + 8 = ?");
    expect(acht.r).toBe("16");
    expect(acht.sprich).toBe("Wie viel ist 8 plus 8?");
    expect(finde("k1plus", "Was ist das Doppelte von 7?").r).toBe("14");
    expect(finde("k1plus", "Tom hat 7 Autos. Zum Geburtstag bekommt er 6 dazu. Wie viele hat er?").r).toBe("13");
    expect(finde("k1plus", "4 + 0 = ?").r).toBe("4");
  });
});

/* ---------- 4) Minus bis 20 ---------- */
describe("k1minus – Inhalt", () => {
  const { easy, hard } = pool("k1minus");
  const uebergang = ({ a, b }) => a > 10 && b < 10 && a % 10 < b;

  it("jede Aufgabe ist eine Minus-Rechnung (op \"-\") mit Ergebnis als Antwort", () => {
    for (const a of alle("k1minus")) {
      expect(a.term?.op, a.f).toBe("-");
      expect(a.term.gesucht, a.f).toBeUndefined();
      if (/ − /.test(a.f)) expect(a.sprich, a.f).toBe(`Wie viel ist ${a.term.a} minus ${a.term.b}?`);
    }
  });

  it("easy rechnet ohne Zehnerübergang, hard mit Übergang, Halbieren oder von der 20", () => {
    for (const a of easy) expect(uebergang(a.term) || a.term.a === 20, a.f).toBe(false);
    expect(easy.filter((a) => a.term.a <= 10).length).toBeGreaterThanOrEqual(12);
    expect(easy.filter((a) => a.term.a > 10).length).toBeGreaterThanOrEqual(8);
    for (const a of hard) {
      const halb = a.term.a === 2 * a.term.b;
      expect(uebergang(a.term) || halb || a.term.a === 20, a.f).toBe(true);
    }
    expect(hard.filter((a) => uebergang(a.term)).length).toBeGreaterThanOrEqual(14);
    const haelfte = hard.filter((a) => /Hälfte/.test(a.f));
    expect(haelfte.length).toBeGreaterThanOrEqual(6);
    for (const a of haelfte) expect(+a.r * 2, a.f).toBe(a.term.a);
  });

  it("Zwanzigerfeld zeigt die Ausgangszahl als Zehner (rot) und Einer (blau)", () => {
    const feld = hard.filter((a) => a.bild);
    expect(feld.length).toBeGreaterThanOrEqual(3);
    for (const a of feld) expect(a.bild, a.f).toEqual({ art: "zwanzig", rot: 10, blau: a.term.a - 10 });
  });

  it("Stichproben", () => {
    expect(finde("k1minus", "Was ist die Hälfte von 12?").r).toBe("6");
    expect(finde("k1minus", "Im Bus sitzen 15 Kinder. 7 steigen aus. Wie viele sitzen noch im Bus?").r).toBe("8");
    expect(finde("k1minus", "6 − 6 = ?").r).toBe("0");
    const dreizehn = hard.find((a) => a.term.a === 13 && uebergang(a.term));
    if (dreizehn) expect(+dreizehn.r).toBe(13 - dreizehn.term.b);
  });
});

/* ---------- 5) Geld ---------- */
describe("k1geld – Inhalt", () => {
  const { easy, hard } = pool("k1geld");
  const betrag = (text) => {
    const m = text.match(/^(\d+) (Euro|Cent)$/);
    return m ? +m[1] * (m[2] === "Euro" ? 100 : 1) : null;
  };
  const betraege = (text) => [...text.matchAll(/(\d+)[ -](Euro|Cent)/g)].map((m) => +m[1] * (m[2] === "Euro" ? 100 : 1));
  const alsText = (centWert) => (centWert % 100 === 0 ? `${centWert / 100} Euro` : `${centWert} Cent`);

  it("easy: nur Euro bis 10 Euro – hard: bis 20 Euro, Cent höchstens bis 1 Euro", () => {
    for (const a of easy) {
      expect(JSON.stringify([a.f, a.r, a.x]), a.f).not.toMatch(/Cent/);
      for (const n of betraege([a.f, a.r, ...a.x].join(" | "))) expect(n, a.f).toBeLessThanOrEqual(1000);
      if (a.bild) {
        for (const w of a.bild.werte) expect([100, 200, 500, 1000], a.f).toContain(w);
        expect(summe(a.bild.werte), a.f).toBeLessThanOrEqual(1000);
      }
    }
    for (const a of hard) {
      for (const n of betraege([a.f, a.r].join(" | "))) expect(n, a.f).toBeLessThanOrEqual(2000);
      if (a.bild) {
        const s = summe(a.bild.werte);
        expect(s, a.f).toBeLessThanOrEqual(2000);
        if (a.bild.werte.some((w) => w < 100)) expect(s, a.f).toBeLessThanOrEqual(100); // Cent nicht mit Euro mischen
      }
    }
    expect(hard.filter((a) => /Cent/.test(a.r)).length).toBeGreaterThanOrEqual(6);
    expect(hard.filter((a) => a.bild && summe(a.bild.werte) > 1000).length).toBeGreaterThanOrEqual(8);
  });

  it("Münzen zählen: Antwort ist die Summe aus bild.werte", () => {
    const zaehlen = alle("k1geld").filter((a) => a.f === "Wie viel Geld ist das?");
    expect(zaehlen.length).toBeGreaterThanOrEqual(20);
    for (const a of zaehlen) {
      const s = summe(a.bild.werte);
      expect(a.r, a.f).toBe(alsText(s));
      for (const x of a.x) {
        expect(betrag(x), `${a.r} → ${x}`).not.toBeNull();
        expect(betrag(x), `${a.r} → ${x}`).not.toBe(s);
      }
    }
  });

  it("Reicht das Geld? – Geld aus dem Bild gegen den Preis nachgerechnet", () => {
    const reicht = alle("k1geld").filter((a) => a.f.endsWith("Reicht das?"));
    expect(reicht.length).toBeGreaterThanOrEqual(6);
    for (const a of reicht) {
      const hat = summe(a.bild.werte);
      const [preis] = betraege(a.f);
      const soll = hat === preis ? "Ja, genau" : hat > preis ? "Ja, sogar mehr" : "Nein, zu wenig";
      expect(a.r, a.f).toBe(soll);
      expect([a.r, ...a.x].sort(), a.f).toEqual(["Ja, genau", "Ja, sogar mehr", "Nein, zu wenig"]);
    }
    expect(new Set(reicht.map((a) => a.r)).size).toBe(3); // alle drei Fälle kommen vor

    const wer = alle("k1geld").filter((a) => a.f.endsWith("Wer hat genug Geld?"));
    expect(wer.length).toBeGreaterThanOrEqual(4);
    for (const a of wer) {
      const [preis] = betraege(a.f);
      expect(betraege(a.r)[0], a.f).toBeGreaterThanOrEqual(preis);
      for (const x of a.x) expect(betraege(x)[0], a.f).toBeLessThan(preis);
    }

    const kaufen = alle("k1geld").filter((a) => /Was kann (sie|er) davon kaufen\?$/.test(a.f));
    expect(kaufen.length).toBeGreaterThanOrEqual(3);
    for (const a of kaufen) {
      const hat = summe(a.bild.werte);
      expect(betraege(a.r)[0], a.f).toBeLessThanOrEqual(hat);
      for (const x of a.x) expect(betraege(x)[0], a.f).toBeGreaterThan(hat);
    }
  });

  it("passend bezahlen: nur die richtige Antwort ergibt genau den Preis – mit echten Münzen und Scheinen", () => {
    const passend = alle("k1geld").filter((a) => a.f.endsWith("Womit bezahlst du passend?"));
    expect(passend.length).toBeGreaterThanOrEqual(9);
    for (const a of passend) {
      const [preis] = betraege(a.f);
      expect(summe(betraege(a.r)), a.f).toBe(preis);
      for (const x of a.x) expect(summe(betraege(x)), `${a.f} → ${x}`).not.toBe(preis);
      for (const t of [a.r, ...a.x]) {
        for (const w of betraege(t)) expect([1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000], t).toContain(w);
      }
    }
  });

  it("Rechnen mit Geld: zusammen, übrig, zurück und fehlt sind nachgerechnet", () => {
    const plus = alle("k1geld").filter((a) => /kostet beides\?$|hat (sie|er) jetzt\?$/.test(a.f));
    const minus = alle("k1geld").filter((a) => /bleibt ihm\?$|bleibt übrig\?$|zurück\?$|fehlt (ihm|ihr) noch\?$/.test(a.f));
    expect(plus.length).toBeGreaterThanOrEqual(6);
    expect(minus.length).toBeGreaterThanOrEqual(5);
    for (const a of plus) expect(betrag(a.r), a.f).toBe(summe(betraege(a.f)));
    for (const a of minus) {
      const [p, q] = betraege(a.f);
      expect(betraege(a.f), a.f).toHaveLength(2);
      expect(betrag(a.r), a.f).toBe(Math.abs(p - q));
    }
    for (const a of [...plus, ...minus]) for (const x of a.x) expect(betrag(x), a.f).not.toBe(betrag(a.r));
  });

  it("Wechseln: gleich viel wert", () => {
    const wechseln = alle("k1geld").filter((a) => /^Wie viele .* (sind so viel wert wie|bekommst du für)/.test(a.f));
    expect(wechseln.length).toBeGreaterThanOrEqual(5);
    for (const a of wechseln) {
      const [klein, gross] = betraege(a.f);
      expect(+a.r * klein, a.f).toBe(gross);
      expect(a.sprich, a.f).toBeTruthy();
    }
  });

  it("Stichproben", () => {
    const fuenfzig = hard.find((a) => a.bild && a.bild.werte.join() === "50,50");
    expect(fuenfzig.r).toBe("1 Euro");
    expect(finde("k1geld", "Tom zahlt 12 Euro mit einem 20-Euro-Schein. Was bekommt er zurück?").r).toBe("8 Euro");
    expect(finde("k1geld", "Der Ball kostet 7 Euro. Womit bezahlst du passend?").r).toBe("5 Euro + 2 Euro");
    expect(finde("k1geld", "Welche dieser Münzen ist am meisten wert?").r).toBe("50 Cent");
  });
});

/* ---------- 6) Formen & Muster ---------- */
describe("k1formen – Inhalt", () => {
  const { easy, hard } = pool("k1formen");
  const NAME = { kreis: "Kreis", dreieck: "Dreieck", quadrat: "Quadrat", rechteck: "Rechteck" };
  const MEHR = { Kreise: "kreis", Dreiecke: "dreieck", Quadrate: "quadrat", Rechtecke: "rechteck" };
  const ECKEN = { kreis: 0, dreieck: 3, quadrat: 4, rechteck: 4 };
  const FARBE = { rot: "rot", blau: "blau", gelb: "gelb", gruen: "grün" };
  const name = (teil) => {
    const [form, farbe] = teil.split(":");
    return farbe ? `${FARBE[farbe]}${form === "kreis" ? "er" : "es"} ${NAME[form]}` : NAME[form];
  };
  /** Kleinste Wiederholung, die zu allen sichtbaren Formen passt → was gehört an die Lücke? */
  const musterLoesung = (folge) => {
    const luecke = folge.indexOf("?");
    for (let p = 1; p < folge.length; p++) {
      const passt = folge.every((t, i) => t === "?" || folge.every((u, j) => u === "?" || i % p !== j % p || t === u));
      const quelle = folge.find((t, i) => t !== "?" && i % p === luecke % p);
      if (passt && quelle) return { periode: p, teil: quelle };
    }
    return null;
  };
  const muster = (liste) => liste.filter((a) => a.bild?.folge.includes("?"));

  it("Muster fortsetzen: Lösung folgt aus der kleinsten Wiederholung", () => {
    expect(muster(easy).length).toBeGreaterThanOrEqual(8);
    expect(muster(hard).length).toBeGreaterThanOrEqual(8);
    for (const a of muster(alle("k1formen"))) {
      const l = musterLoesung(a.bild.folge);
      expect(l, a.bild.folge.join(" ")).not.toBeNull();
      expect(a.r, a.bild.folge.join(" ")).toBe(name(l.teil));
      // jede Form des Musters ist mindestens einmal ganz zu sehen
      expect(a.bild.folge.length, a.bild.folge.join(" ")).toBeGreaterThanOrEqual(2 * l.periode - 1);
      // Quadrat und Rechteck nie im selben Muster
      const formen = new Set(a.bild.folge.filter((t) => t !== "?").map((t) => t.split(":")[0]));
      expect(formen.has("quadrat") && formen.has("rechteck"), a.bild.folge.join(" ")).toBe(false);
      const amEnde = a.bild.folge.indexOf("?") === a.bild.folge.length - 1;
      expect(a.f, a.bild.folge.join(" ")).toBe(amEnde ? "Wie geht das Muster weiter?" : "Welche Form fehlt im Muster?");
    }
  });

  it("easy hat AB-Muster, hard längere Muster (ABB, AAB, AABB, ABC)", () => {
    for (const a of muster(easy)) expect(musterLoesung(a.bild.folge).periode, a.bild.folge.join(" ")).toBe(2);
    const perioden = muster(hard).map((a) => musterLoesung(a.bild.folge).periode);
    for (const p of perioden) expect(p).toBeGreaterThanOrEqual(3);
    expect(perioden).toContain(3);
    expect(perioden).toContain(4);
  });

  it("Formen erkennen, zählen, Farben und Ecken stimmen mit dem Bild überein", () => {
    const erkennen = easy.filter((a) => a.f === "Wie heißt diese Form?");
    expect(erkennen.map((a) => a.r).sort()).toEqual(["Dreieck", "Kreis", "Quadrat", "Rechteck"]);
    for (const a of erkennen) {
      expect(a.bild.folge, a.r).toHaveLength(1);
      expect(a.r).toBe(NAME[a.bild.folge[0].split(":")[0]]);
      if (a.r === "Quadrat") expect(a.x).not.toContain("Rechteck"); // ein Quadrat IST auch ein Rechteck
    }
    const zaehlen = easy.filter((a) => /^Wie viele (Kreise|Dreiecke|Quadrate|Rechtecke) siehst du\?$/.test(a.f));
    expect(zaehlen).toHaveLength(4);
    for (const a of zaehlen) {
      const form = MEHR[a.f.split(" ")[2]];
      expect(a.r, a.f).toBe(String(a.bild.folge.filter((t) => t.split(":")[0] === form).length));
    }
    const farbe = easy.filter((a) => a.f.startsWith("Welche Farbe hat"));
    expect(farbe.length).toBeGreaterThanOrEqual(2);
    for (const a of farbe) {
      const form = Object.keys(NAME).find((k) => a.f.includes(NAME[k]));
      const treffer = a.bild.folge.filter((t) => t.startsWith(`${form}:`));
      expect(treffer, a.f).toHaveLength(1);
      expect(a.r, a.f).toBe(FARBE[treffer[0].split(":")[1]]);
    }
    const ecken = hard.filter((a) => /^Wie viele Ecken haben (beide|alle) Formen zusammen\?$/.test(a.f));
    expect(ecken.length).toBeGreaterThanOrEqual(4);
    for (const a of ecken) expect(a.r, a.bild.folge.join(" ")).toBe(String(summe(a.bild.folge.map((t) => ECKEN[t]))));
    for (const a of easy) {
      const m = a.f.match(/^Wie viele Ecken hat ein (Kreis|Dreieck|Quadrat|Rechteck)\?$/);
      if (m) expect(a.r, a.f).toBe(m[1] === "Kreis" ? "keine" : String(ECKEN[m[1].toLowerCase()]));
    }
  });

  it("Stichproben: Formen in der Umwelt", () => {
    expect(finde("k1formen", "Welche Form hat eine Tür?").r).toBe("Rechteck");
    expect(finde("k1formen", "Die Uhr im Klassenzimmer ist rund. Welche Form hat sie?").r).toBe("Kreis");
    expect(finde("k1formen", "Welche Form hat eine Seite vom Spielwürfel?").r).toBe("Quadrat");
    expect(finde("k1formen", "Wie viele Ecken hat ein Dreieck?").r).toBe("3");
    expect(hard.filter((a) => a.f.startsWith("Welche Form hat")).length).toBeGreaterThanOrEqual(8);
  });
});

/* ---------- 7) Uhr ---------- */
describe("k1uhr – Inhalt", () => {
  const { easy, hard } = pool("k1uhr");
  const zeit = (a) => a.bild.zeit.split(":").map(Number);
  const plus = (h, d) => ((h - 1 + d + 24) % 12) + 1;

  it("easy: nur volle Stunden – die Antwort nennt die Stunde aus bild.zeit", () => {
    const mitUhr = easy.filter((a) => a.bild);
    expect(mitUhr.length).toBeGreaterThanOrEqual(16);
    for (const a of mitUhr) {
      const [h, m] = zeit(a);
      expect(m, a.f).toBe(0);
      expect(a.r, a.f).toBe(`${h} Uhr`);
      for (const x of a.x) expect(x, a.f).toMatch(/^([1-9]|1[0-2]) Uhr$/);
    }
    const lesen = easy.filter((a) => a.f === "Wie spät ist es?");
    expect(lesen.map((a) => zeit(a)[0]).sort((p, q) => p - q)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    expect(JSON.stringify(easy)).not.toMatch(/halb/);
    for (const a of easy) {
      const m = a.f.match(/^Kleiner Zeiger auf der (\d+), großer Zeiger auf der 12/);
      if (m) expect(a.r, a.f).toBe(`${m[1]} Uhr`);
      const w = a.f.match(/kleine Zeiger um (\d+) Uhr/);
      if (w) expect(a.r, a.f).toBe(`auf die ${w[1]}`);
    }
  });

  it("hard: eine Stunde später/früher und in 2 Stunden sind aus bild.zeit nachgerechnet", () => {
    const rechnen = { "Wie spät ist es eine Stunde später?": 1, "Wie spät war es vor einer Stunde?": -1, "Wie spät ist es in 2 Stunden?": 2 };
    let gezaehlt = 0;
    for (const a of hard) {
      if (!(a.f in rechnen)) continue;
      const [h, m] = zeit(a);
      expect(m, a.f).toBe(0);
      expect(a.r, `${a.f} (${a.bild.zeit})`).toBe(`${plus(h, rechnen[a.f])} Uhr`);
      expect(a.x, `${a.f} (${a.bild.zeit})`).toContain(`${h} Uhr`); // nur abgelesen, nicht gerechnet
      gezaehlt++;
    }
    expect(gezaehlt).toBeGreaterThanOrEqual(9);
    expect(plus(12, 1)).toBe(1);
    expect(plus(1, -1)).toBe(12);
  });

  it("hard: Tageszeiten und Zeitspannen", () => {
    const tag = hard.filter((a) => ["morgens", "mittags", "abends"].includes(a.r));
    expect(tag.length).toBeGreaterThanOrEqual(6);
    for (const a of tag) expect([a.r, ...a.x].sort(), a.f).toEqual(["abends", "mittags", "morgens"]);
    expect(new Set(tag.map((a) => a.r)).size).toBe(3);
    for (const a of hard) {
      const m = a.f.match(/von (\d+) Uhr bis (\d+) Uhr/);
      if (m) expect(zahlenIn(a.r)[0], a.f).toBe(+m[2] - +m[1]);
      const d = a.f.match(/um (\d+) Uhr .* (\d+) Stunden?\. Wann/);
      if (d) expect(a.r, a.f).toBe(`um ${+d[1] + +d[2]} Uhr`);
    }
  });

  it("halbe Stunden sind nur ein Ausblick: höchstens 6 Aufgaben, alle am Ende, richtig benannt", () => {
    const halb = hard.filter((a) => /halb/.test(JSON.stringify([a.f, a.r, a.x])) || a.bild?.zeit.endsWith(":30"));
    expect(halb.length).toBeGreaterThanOrEqual(2);
    expect(halb.length).toBeLessThanOrEqual(6);
    expect(hard.slice(-halb.length)).toEqual(halb);
    for (const a of halb.filter((x) => x.bild)) {
      const [h, m] = zeit(a);
      expect(m, a.f).toBe(30);
      expect(a.r, a.bild.zeit).toBe(`halb ${plus(h, 1)}`);
      expect(a.x, a.bild.zeit).toContain(`halb ${h}`); // typischer Fehler: die vergangene Stunde genannt
    }
  });

  it("Stichproben", () => {
    expect(finde("k1uhr", "Wann frühstückst du?").r).toBe("morgens");
    expect(finde("k1uhr", "Wann gehst du schlafen?").r).toBe("abends");
    const zwoelf = hard.find((a) => a.f === "Wie spät ist es eine Stunde später?" && a.bild.zeit === "12:00");
    expect(zwoelf.r).toBe("1 Uhr");
    expect(finde("k1uhr", "Die Schule geht von 8 Uhr bis 12 Uhr. Wie viele Stunden sind das?").r).toBe("4 Stunden");
    expect(finde("k1uhr", "Wohin zeigt der große Zeiger bei jeder vollen Stunde?").r).toBe("auf die 12");
  });
});
