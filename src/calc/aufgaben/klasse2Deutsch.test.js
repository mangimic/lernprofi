import { describe, it, expect } from "vitest";
import {
  K2_DEUTSCH_DATEN, K2_DEUTSCH_BEREICHE, K2_DEUTSCH_GRUPPEN,
  K2_WOERTER, K2_VERBEN, K2_ADJEKTIVE, k2AbcErzeugen,
} from "./klasse2Deutsch.js";
import { poolGesund } from "../aufgabenRunde.js";

/* 📚 Deutsch Klasse 2: Jede Aufgabe wird gegen die Wortlisten NACHGEPRÜFT
   (Artikel, Mehrzahl, Silben, Verbformen, Gegenteile) – keine Lösung im
   Pool darf falsch sein. Die Silbentrennung prüft zusätzlich ein eigener,
   von den Daten unabhängiger Trenner nach den Duden-Grundregeln. */

const KEYS = [
  "k2lesen", "k2nomen", "k2mehrzahl", "k2verben", "k2adjektive",
  "k2satzzeichen", "k2silben", "k2verlaengern", "k2abc", "k2zusnomen",
];
const alle = (key) => [...K2_DEUTSCH_DATEN[key].easy, ...K2_DEUTSCH_DATEN[key].hard];
const vomTyp = (key, typ) => alle(key).filter((a) => a.typ === typ);
const sucheF = (key, teil) => {
  const a = alle(key).find((x) => x.f.includes(teil));
  if (!a) throw new Error(`Keine Aufgabe mit „${teil}“ in ${key}`);
  return a;
};

const NOMEN = new Map(K2_WOERTER.map((e) => [e.w, e]));
const MEHRZAHLEN = new Map(K2_WOERTER.map((e) => [e.mehrzahl, e]));
const VERBEN = new Map(K2_VERBEN.map((e) => [e.grund, e]));
const ADJEKTIVE = new Map(K2_ADJEKTIVE.map((e) => [e.w, e]));
const ARTIKEL = ["der", "die", "das"];
const NAMEN = ["Mia", "Ben", "Lena", "Tom", "Ali", "Emma", "Noah", "Ida"];
const ohneUmlaut = (s) => s.toLowerCase().replace(/ä/g, "a").replace(/ö/g, "o").replace(/ü/g, "u");
const gross = (s) => s[0].toUpperCase() + s.slice(1);

/** Unabhängiger Silbentrenner (Duden-Grundregeln für einfache Wörter):
    Von mehreren Mitlauten kommt der letzte in die nächste Silbe;
    ch, sch und ck bleiben zusammen; au, ei, eu, äu, ie und Doppel-
    Selbstlaute zählen als EIN Selbstlaut. */
function trenne(wort) {
  const teile = wort.match(/sch|ch|ck|äu|au|ei|eu|ie|aa|ee|oo|[a-zäöüß]/gi);
  const istSelbstlaut = (t) => /^(äu|au|ei|eu|ie|aa|ee|oo|[aeiouäöüy])$/i.test(t);
  const stellen = teile.map((t, i) => (istSelbstlaut(t) ? i : -1)).filter((i) => i >= 0);
  const schnitte = new Set();
  for (let k = 0; k < stellen.length - 1; k++) {
    const [a, b] = [stellen[k], stellen[k + 1]];
    schnitte.add(b - a > 1 ? b - 1 : b);
  }
  return teile.map((t, i) => (schnitte.has(i) ? `-${t}` : t)).join("");
}

describe("Deutsch Klasse 2 – Vertrag für alle Pools", () => {
  it("Bereiche und Gruppen passen zu den Daten", () => {
    expect(Object.keys(K2_DEUTSCH_DATEN)).toEqual(KEYS);
    expect(K2_DEUTSCH_BEREICHE.map((b) => b.key)).toEqual(KEYS);
    for (const b of K2_DEUTSCH_BEREICHE) {
      expect(b.name.length, b.key).toBeGreaterThan(2);
      expect(b.emoji, b.key).toBeTruthy();
    }
    expect(K2_DEUTSCH_BEREICHE.find((b) => b.key === "k2lesen").name).toBe("Lesen & Verstehen");
    expect(K2_DEUTSCH_BEREICHE.find((b) => b.key === "k2zusnomen").name).toBe("Zusammengesetzte Nomen");

    expect(K2_DEUTSCH_GRUPPEN.map((g) => [g.name, g.felder])).toEqual([
      ["Lesen", ["k2lesen"]],
      ["Wörter", ["k2nomen", "k2mehrzahl", "k2verben", "k2adjektive", "k2zusnomen"]],
      ["Richtig schreiben", ["k2verlaengern", "k2silben", "k2abc"]],
      ["Sätze", ["k2satzzeichen"]],
    ]);
    // jedes Feld steckt in genau einer Gruppe
    expect(K2_DEUTSCH_GRUPPEN.flatMap((g) => g.felder).sort()).toEqual(KEYS.slice().sort());
    expect(new Set(K2_DEUTSCH_GRUPPEN.map((g) => g.key)).size).toBe(K2_DEUTSCH_GRUPPEN.length);
  });

  it.each(KEYS)("%s: gesund, groß genug, Form der Aufgaben stimmt", (key) => {
    const pool = K2_DEUTSCH_DATEN[key];
    expect(poolGesund(pool)).toBe(true);
    expect(pool.easy.length).toBeGreaterThanOrEqual(24);
    expect(pool.hard.length).toBeGreaterThanOrEqual(20);
    for (const a of alle(key)) {
      expect(a.x, a.f).toHaveLength(2);
      expect(new Set([a.r, ...a.x]).size, a.f).toBe(3);
      for (const antwort of [a.r, ...a.x]) {
        expect(typeof antwort, a.f).toBe("string");
        expect(antwort.length, `${a.f} → ${antwort}`).toBeGreaterThan(0);
        expect(antwort.length, `${a.f} → ${antwort}`).toBeLessThanOrEqual(16);
        expect(antwort, a.f).toBe(antwort.trim());
      }
      expect(a.f.length, a.f).toBeLessThanOrEqual(70);
      // Tipp: ein kurzer Satz, der mehr sagt als nur die Lösung
      expect(a.tipp.length, a.tipp).toBeLessThanOrEqual(110);
      expect(a.tipp.length, a.tipp).toBeGreaterThan(a.r.length + 15);
      expect(a.tipp, a.f).toMatch(/[.!“]$/);
      // keine Emojis in den Texten, keine Bilder/Rechen-Terme in Deutsch Klasse 2
      for (const text of [a.f, a.r, ...a.x, a.tipp, a.sprich || "", a.kontext || ""]) {
        expect(/\p{Extended_Pictographic}/u.test(text), text).toBe(false);
      }
      expect(a.bild, a.f).toBeUndefined();
      expect(a.bloecke, a.f).toBeUndefined();
      expect(a.term, a.f).toBeUndefined();
    }
  });

  it.each(KEYS)("%s: keine doppelten Aufgaben", (key) => {
    for (const stufe of ["easy", "hard"]) {
      const fragen = K2_DEUTSCH_DATEN[key][stufe].map((a) => a.f);
      expect(new Set(fragen).size, `${key}.${stufe}`).toBe(fragen.length);
    }
  });

  it.each(KEYS)("%s: „sprich“ genau dort, wo f einen Platzhalter oder ein Rechenzeichen zeigt", (key) => {
    const pflicht = /_|[+=]|(^|\s)\?/;
    for (const a of alle(key)) {
      if (pflicht.test(a.f)) {
        expect(typeof a.sprich, a.f).toBe("string");
        expect(a.sprich.length, a.f).toBeGreaterThan(10);
        expect(pflicht.test(a.sprich), a.sprich).toBe(false); // Vorlesetext ohne Platzhalter
        // der Vorlesetext verrät die Lösung nicht als eigenes Wort (außer beim Verlängern: gleicher Klang)
        if (a.typ !== "verlaengern") expect(a.sprich.split(/[\s,.?]+/), a.sprich).not.toContain(a.r);
      } else {
        expect(a.sprich, a.f).toBeUndefined();
      }
    }
  });

  it("nur die vereinbarten Kindernamen, keine abwertenden Wörter", () => {
    const text = JSON.stringify(K2_DEUTSCH_DATEN);
    for (const fremd of ["Paul", "Anna", "Max", "Lisa", "Felix", "Leon", "Lukas", "Marie", "Jonas", "Hannah", "Finn", "Lea"]) {
      expect(new RegExp(`\\b${fremd}\\b`).test(text), fremd).toBe(false);
    }
    expect(/dumm|blöd|Versager|falsch gemacht|streng dich/i.test(text)).toBe(false);
    // alle acht Namen kommen in den Lesetexten vor
    const lesetexte = alle("k2lesen").map((a) => a.kontext).join(" ");
    for (const name of NAMEN) expect(lesetexte, name).toContain(name);
  });
});

describe("Deutsch Klasse 2 – Wortlisten", () => {
  it("Nomen: mindestens 80, eindeutig, Artikel und Mehrzahl plausibel", () => {
    expect(K2_WOERTER.length).toBeGreaterThanOrEqual(80);
    expect(NOMEN.size).toBe(K2_WOERTER.length);
    for (const e of K2_WOERTER) {
      expect(e.w, e.w).toMatch(/^[A-ZÄÖÜ][a-zäöüß]+$/);
      expect(ARTIKEL, e.w).toContain(e.artikel);
      expect(e.mehrzahl, e.w).toMatch(/^[A-ZÄÖÜ][a-zäöüß]+$/);
      // Mehrzahl = Einzahl (evtl. mit Umlaut) + eine der deutschen Mehrzahl-Endungen
      const rest = ohneUmlaut(e.mehrzahl).slice(e.w.length);
      expect(ohneUmlaut(e.mehrzahl).startsWith(ohneUmlaut(e.w)), `${e.w} → ${e.mehrzahl}`).toBe(true);
      expect(["", "e", "n", "en", "er", "s", "se"], `${e.w} → ${e.mehrzahl}`).toContain(rest);
    }
    // alle drei Artikel sind gut vertreten
    for (const artikel of ARTIKEL) {
      expect(K2_WOERTER.filter((e) => e.artikel === artikel).length, artikel).toBeGreaterThanOrEqual(25);
    }
  });

  it("Nomen: Stichproben für Artikel, Mehrzahl und Silben", () => {
    const erwartet = [
      ["Baum", "der", "Bäume", "Baum"], ["Blume", "die", "Blumen", "Blu-me"], ["Haus", "das", "Häuser", "Haus"],
      ["Apfel", "der", "Äpfel", "Ap-fel"], ["Fenster", "das", "Fenster", "Fens-ter"], ["Katze", "die", "Katzen", "Kat-ze"],
      ["Kartoffel", "die", "Kartoffeln", "Kar-tof-fel"], ["Brücke", "die", "Brücken", "Brü-cke"], ["Korb", "der", "Körbe", "Korb"],
      ["Mädchenfrei", null, null, null],
    ];
    for (const [w, artikel, mehrzahl, silben] of erwartet) {
      if (!artikel) { expect(NOMEN.has(w)).toBe(false); continue; }
      const e = NOMEN.get(w);
      expect([e.artikel, e.mehrzahl, e.silben.join("-")], w).toEqual([artikel, mehrzahl, silben]);
    }
  });

  it("Nomen: Silben ergeben das Wort, jede Silbe hat einen Selbstlaut, Trennung folgt den Duden-Regeln", () => {
    for (const e of K2_WOERTER) {
      expect(e.silben.join(""), e.w).toBe(e.w);
      for (const silbe of e.silben) expect(silbe, e.w).toMatch(/[aeiouäöüAEIOUÄÖÜ]/);
      expect(e.silben.join("-"), e.w).toBe(trenne(e.w));
      expect(e.silben.join("-"), e.w).not.toMatch(/c-k|s-ch|c-h/);
    }
    // der Prüf-Trenner selbst kann die Klasse-2-Regeln
    expect(trenne("Wasser")).toBe("Was-ser");
    expect(trenne("Zucker")).toBe("Zu-cker");
    expect(trenne("Katze")).toBe("Kat-ze");
    expect(trenne("Tasche")).toBe("Ta-sche");
    expect(trenne("Schmetterling")).toBe("Schmet-ter-ling");
  });

  it("Verben: eindeutig, Endungen stimmen, Stichproben", () => {
    expect(K2_VERBEN.length).toBeGreaterThanOrEqual(40);
    expect(VERBEN.size).toBe(K2_VERBEN.length);
    for (const e of K2_VERBEN) {
      expect(e.grund, e.grund).toMatch(/[a-zäöü]n$/);
      expect(e.ich, e.grund).toMatch(/e$/);
      expect(e.er, e.grund).toMatch(/t$/);
      expect(e.du.endsWith("st") || e.du === e.er, e.grund).toBe(true);
      expect(e.du.endsWith("t"), e.grund).toBe(true);
    }
    expect(VERBEN.get("bellen")).toEqual({ grund: "bellen", ich: "belle", du: "bellst", er: "bellt" });
    expect(VERBEN.get("laufen").er).toBe("läuft");
    expect(VERBEN.get("lesen").du).toBe("liest");
    expect(VERBEN.get("essen").er).toBe("isst");
    expect(VERBEN.get("helfen").du).toBe("hilfst");
    expect(VERBEN.get("nehmen").er).toBe("nimmt");
  });

  it("Adjektive: eindeutig, jedes Gegenteil steht selbst in der Liste", () => {
    expect(K2_ADJEKTIVE.length).toBeGreaterThanOrEqual(40);
    expect(ADJEKTIVE.size).toBe(K2_ADJEKTIVE.length);
    for (const e of K2_ADJEKTIVE) {
      expect(e.w, e.w).toMatch(/^[a-zäöüß]+$/);
      if (e.gegenteil) expect(ADJEKTIVE.has(e.gegenteil), `${e.w} ↔ ${e.gegenteil}`).toBe(true);
    }
    expect(ADJEKTIVE.get("groß").gegenteil).toBe("klein");
    expect(ADJEKTIVE.get("klein").gegenteil).toBe("groß");
    expect(ADJEKTIVE.get("laut").gegenteil).toBe("leise");
    expect(ADJEKTIVE.get("nass").gegenteil).toBe("trocken");
  });
});

describe("k2lesen – Lesen & Verstehen", () => {
  it("jede Aufgabe hat einen kurzen Text mit 3–4 Sätzen und eine Frage", () => {
    for (const a of alle("k2lesen")) {
      expect(typeof a.kontext, a.f).toBe("string");
      expect(a.kontext.length, a.kontext).toBeLessThanOrEqual(220);
      expect(a.kontext.length, a.kontext).toBeGreaterThanOrEqual(60);
      const saetze = a.kontext.match(/[^.!?]+[.!?]/g);
      expect(saetze.join(""), a.kontext).toBe(a.kontext);
      expect(saetze.length, a.kontext).toBeGreaterThanOrEqual(3);
      expect(saetze.length, a.kontext).toBeLessThanOrEqual(4);
      for (const satz of saetze) expect(satz.trim().split(/\s+/).length, satz).toBeLessThanOrEqual(14);
      expect(a.f, a.f).toMatch(/\?$/);
    }
  });

  it("mindestens 24 + 20 VERSCHIEDENE Texte mit abwechslungsreichen Themen", () => {
    const { easy, hard } = K2_DEUTSCH_DATEN.k2lesen;
    const texte = alle("k2lesen").map((a) => a.kontext);
    expect(new Set(texte).size).toBe(texte.length);
    expect(easy.length).toBeGreaterThanOrEqual(24);
    expect(hard.length).toBeGreaterThanOrEqual(20);
    const gesamt = texte.join(" ");
    for (const thema of [/Hund|Katze|Igel|Kuh/, /Schule|Pause|Heft/, /regnet|Schnee|windig|Sonne/, /Spielplatz|Rutsche|schaukelt/,
      /Oma|Opa|Papa|Mama/, /Herbst/, /Winter/, /Frühling/, /Sommer/]) {
      expect(gesamt).toMatch(thema);
    }
  });

  it("easy: die Antwort steht wörtlich im Text; hard: Schlussfolgern (Warum, zuerst, …)", () => {
    for (const a of K2_DEUTSCH_DATEN.k2lesen.easy) {
      expect(a.kontext.toLowerCase(), `${a.f} → ${a.r}`).toContain(a.r.toLowerCase());
    }
    const hard = K2_DEUTSCH_DATEN.k2lesen.hard;
    expect(hard.filter((a) => a.f.startsWith("Warum")).length).toBeGreaterThanOrEqual(4);
    expect(hard.some((a) => /zuerst/.test(a.f))).toBe(true);
    // beim Schlussfolgern steht die Lösung meist NICHT wörtlich da
    const woertlich = hard.filter((a) => a.kontext.toLowerCase().includes(a.r.toLowerCase().replace(/\.$/, "")));
    expect(woertlich.length).toBeLessThanOrEqual(3);
  });

  it("Stichproben", () => {
    expect(sucheF("k2lesen", "Welche Farbe hat der Hund?")).toMatchObject({ r: "braun", x: ["schwarz", "weiß"] });
    expect(sucheF("k2lesen", "Was passiert zuerst?").r).toBe("Äpfel waschen");
    expect(sucheF("k2lesen", "Warum geht Mia ins Bett?").r).toBe("Sie ist müde.");
    expect(sucheF("k2lesen", "Was frisst die Kuh?")).toMatchObject({ r: "Gras", x: ["Heu", "Milch"] });
  });
});

describe("k2nomen – Nomen & Artikel", () => {
  it("Artikel-Aufgaben stimmen mit der Wortliste überein", () => {
    const artikel = vomTyp("k2nomen", "artikel");
    expect(artikel.length).toBeGreaterThanOrEqual(15);
    for (const a of artikel) {
      expect(a.f, a.f).toBe(`Welcher Artikel passt zu ${a.wort}?`);
      expect(a.r, a.f).toBe(NOMEN.get(a.wort).artikel);
      expect([a.r, ...a.x].sort(), a.f).toEqual(ARTIKEL.slice().sort());
    }
    // alle drei Artikel kommen als Lösung vor
    expect(new Set(artikel.map((a) => a.r)).size).toBe(3);
    for (const a of vomTyp("k2nomen", "einartikel")) {
      expect(a.r, a.f).toBe(NOMEN.get(a.wort).artikel === "die" ? "eine" : "ein");
      expect(NOMEN.get(a.wort).artikel, a.f).not.toBe("der"); // „einen Hund“ wäre auch richtig – darum nur die/das
    }
  });

  it("Nomen erkennen: Lösung ist ein Nomen der Liste, die Falschantworten sind keine Nomen", () => {
    const wahl = vomTyp("k2nomen", "nomenwahl");
    const satz = vomTyp("k2nomen", "nomensatz");
    expect(wahl.length).toBeGreaterThanOrEqual(6);
    expect(satz.length).toBeGreaterThanOrEqual(6);
    for (const a of [...wahl, ...satz]) {
      expect(NOMEN.has(a.r), a.f).toBe(true);
      expect(a.f, a.f).toContain(a.r);
      for (const x of a.x) {
        expect(x, a.f).toMatch(/^[a-zäöüß]+$/); // klein geschrieben = kein Nomen
        expect(a.f, a.f).toContain(x);
      }
    }
  });

  it("Großschreibung: nur das Nomen wird groß, gezeigt wird es klein", () => {
    const drei = vomTyp("k2nomen", "gross");
    const imSatz = vomTyp("k2nomen", "grosssatz");
    expect(drei.length).toBeGreaterThanOrEqual(5);
    expect(imSatz.length).toBeGreaterThanOrEqual(5);
    for (const a of [...drei, ...imSatz]) {
      expect(NOMEN.has(a.r), a.f).toBe(true);
      expect(a.f, a.f).toContain(a.r.toLowerCase());
      expect(a.f.replace(/^Welches Wort[^?]*\? /, ""), a.f).not.toContain(a.r);
      for (const x of a.x) {
        expect(NOMEN.has(x), `${a.f} → ${x}`).toBe(false);
        expect(a.f.toLowerCase(), a.f).toContain(x.toLowerCase());
      }
    }
  });

  it("Nomen zählen: Anzahl stimmt mit den großgeschriebenen Wörtern im Satz überein", () => {
    const zahl = vomTyp("k2nomen", "nomenzahl");
    expect(zahl.length).toBeGreaterThanOrEqual(5);
    for (const a of zahl) {
      const satz = a.f.replace("Wie viele Nomen hat der Satz? ", "");
      const woerter = satz.replace(/[.!?]/g, "").split(" ");
      const grossImSatz = woerter.slice(1).filter((w) => /^[A-ZÄÖÜ]/.test(w));
      expect(grossImSatz, a.f).toEqual(a.nomen);
      expect(a.r, a.f).toBe(String(a.nomen.length));
      for (const nomen of a.nomen) expect(NOMEN.has(nomen), `${a.f} → ${nomen}`).toBe(true);
      expect(NAMEN.some((name) => satz.includes(name)), a.f).toBe(false); // Namen wären auch Nomen
    }
  });

  it("Stichproben", () => {
    expect(sucheF("k2nomen", "passt zu Hund?")).toMatchObject({ r: "der", x: ["die", "das"] });
    expect(sucheF("k2nomen", "passt zu Messer?").r).toBe("das");
    expect(sucheF("k2nomen", "laufen, blume, schön")).toMatchObject({ r: "Blume", x: ["Laufen", "Schön"] });
    expect(sucheF("k2nomen", "Was passt zu Blume, ein oder eine?")).toMatchObject({ r: "eine", x: ["ein", "einen"] });
  });
});

describe("k2mehrzahl – Einzahl & Mehrzahl", () => {
  it("Mehrzahl bilden: Lösung = Mehrzahl der Wortliste, Umlaute erst im 2. Halbjahr", () => {
    const { easy, hard } = K2_DEUTSCH_DATEN.k2mehrzahl;
    const bilden = vomTyp("k2mehrzahl", "mehrzahl");
    expect(bilden.length).toBeGreaterThanOrEqual(24);
    for (const a of bilden) {
      const e = NOMEN.get(a.wort);
      expect(a.f, a.f).toBe(`Wie heißt die Mehrzahl von „${e.artikel} ${e.w}“?`);
      expect(a.r, a.f).toBe(`die ${e.mehrzahl}`);
      for (const x of a.x) {
        expect(x, a.f).toMatch(/^die [A-ZÄÖÜ]/);
        expect(MEHRZAHLEN.has(x.slice(4)), `${a.f} → ${x}`).toBe(false); // keine echte Mehrzahl als Falschantwort
      }
      expect(a.tipp, a.f).toContain(e.mehrzahl);
    }
    // 1. Halbjahr: die Mehrzahl hängt nur etwas an (kein neuer Umlaut)
    for (const a of easy.filter((x) => x.typ === "mehrzahl")) expect(a.r.startsWith(`die ${a.wort}`), a.f).toBe(true);
    const mitUmlaut = hard.filter((a) => a.typ === "mehrzahl" && /[äöüÄÖÜ]/.test(a.r) && !/[äöü]/.test(a.wort));
    expect(mitUmlaut.length).toBeGreaterThanOrEqual(10);
    // typischer Fehler „ohne Umlaut“ ist immer dabei
    for (const a of mitUmlaut) expect(a.x.map(ohneUmlaut).some((x) => x.startsWith(ohneUmlaut(`die ${a.wort}`))), a.f).toBe(true);
    // gleich bleibende Mehrzahl (Fenster – Fenster)
    expect(hard.filter((a) => a.typ === "mehrzahl" && NOMEN.get(a.wort).mehrzahl === a.wort).length).toBeGreaterThanOrEqual(3);
  });

  it("Einzahl nennen: Artikel und Wort stimmen", () => {
    const einzahl = vomTyp("k2mehrzahl", "einzahl");
    expect(einzahl.length).toBeGreaterThanOrEqual(12);
    for (const a of einzahl) {
      const e = NOMEN.get(a.wort);
      expect(a.f, a.f).toBe(`Wie heißt die Einzahl von „die ${e.mehrzahl}“?`);
      expect(a.r, a.f).toBe(`${e.artikel} ${e.w}`);
      expect(e.mehrzahl, a.f).not.toBe(e.w);
    }
  });

  it("Mehrzahl/Einzahl aus drei Wörtern: genau eine Form passt", () => {
    const mz = vomTyp("k2mehrzahl", "mzwahl");
    const ez = vomTyp("k2mehrzahl", "ezwahl");
    expect(mz.length).toBeGreaterThanOrEqual(6);
    expect(ez.length).toBeGreaterThanOrEqual(4);
    for (const a of mz) {
      expect(a.r, a.f).toBe(NOMEN.get(a.wort).mehrzahl);
      expect(a.r, a.f).not.toBe(a.wort);
      for (const x of a.x) {
        expect(NOMEN.has(x), `${a.f} → ${x}`).toBe(true); // Einzahl-Wort …
        expect(MEHRZAHLEN.has(x), `${a.f} → ${x}`).toBe(false); // … das nicht zugleich Mehrzahl ist
      }
    }
    for (const a of ez) {
      expect(NOMEN.has(a.r), a.f).toBe(true);
      expect(MEHRZAHLEN.has(a.r), a.f).toBe(false);
      for (const x of a.x) {
        expect(MEHRZAHLEN.has(x), `${a.f} → ${x}`).toBe(true);
        expect(NOMEN.has(x), `${a.f} → ${x}`).toBe(false);
      }
    }
    for (const a of [...mz, ...ez]) for (const w of [a.r, ...a.x]) expect(a.f, a.f).toContain(w);
  });

  it("Stichproben", () => {
    expect(sucheF("k2mehrzahl", "Mehrzahl von „der Baum“")).toMatchObject({ r: "die Bäume", x: ["die Baume", "die Bäumen"] });
    expect(sucheF("k2mehrzahl", "Mehrzahl von „der Hund“").r).toBe("die Hunde");
    expect(sucheF("k2mehrzahl", "Mehrzahl von „das Fenster“").r).toBe("die Fenster");
    expect(sucheF("k2mehrzahl", "Einzahl von „die Füße“").r).toBe("der Fuß");
    expect(K2_DEUTSCH_DATEN.k2mehrzahl.easy.some((a) => a.wort === "Baum" && a.typ === "mehrzahl")).toBe(false);
  });
});

describe("k2verben – Verben", () => {
  const formVon = (e, person) => (person === "wir" || person === "sie" ? e.grund : e[person]);

  it("Verb aus drei Wörtern: nur die Lösung ist ein Verb", () => {
    const wahl = vomTyp("k2verben", "verbwahl");
    expect(wahl.length).toBeGreaterThanOrEqual(8);
    for (const a of wahl) {
      expect(VERBEN.has(a.r), a.f).toBe(true);
      for (const x of a.x) {
        expect(VERBEN.has(x), `${a.f} → ${x}`).toBe(false);
        expect(x, a.f).not.toMatch(/en$/);
      }
    }
  });

  it("passende Form: Lösung = Personalform aus der Verbliste, Lücke im Satz", () => {
    const formen = vomTyp("k2verben", "verbform");
    expect(formen.length).toBeGreaterThanOrEqual(18);
    const subjekt = { ich: /\? Ich __/, du: /\? Du __/, wir: /\? Wir __/, sie: /\? Die \w+ __/, er: /\? (Der|Das|Die|Oma|[A-Z][a-z]+) / };
    for (const a of formen) {
      const e = VERBEN.get(a.wort);
      expect(a.r, a.f).toBe(formVon(e, a.person));
      expect(a.f.match(/__/g), a.f).toHaveLength(1);
      expect(a.f, a.f).toMatch(subjekt[a.person]);
      expect(a.sprich, a.f).toContain("Lücke");
      // Falschantworten sind andere Formen desselben Verbs (auch falsch gebildete), nie die richtige
      for (const x of a.x) expect(ohneUmlaut(x).slice(0, 2), `${a.f} → ${x}`).toBe(ohneUmlaut(e.grund).slice(0, 2));
      // der Tipp zeigt den vollständigen, richtigen Satz oder beide Formen
      expect(a.tipp, a.f).toContain(a.r);
    }
    // alle fünf Personen-Arten werden geübt, Selbstlaut-Wechsel nur im 2. Halbjahr
    expect(new Set(formen.map((a) => a.person))).toEqual(new Set(["ich", "du", "er", "wir", "sie"]));
    for (const a of K2_DEUTSCH_DATEN.k2verben.easy.filter((x) => x.typ === "verbform")) {
      const e = VERBEN.get(a.wort);
      expect(ohneUmlaut(e.er), a.f).toBe(e.er);
      expect(e.er.slice(0, 2), a.f).toBe(e.grund.slice(0, 2));
    }
    const wechsel = K2_DEUTSCH_DATEN.k2verben.hard.filter((a) => a.typ === "verbform");
    expect(wechsel.length).toBeGreaterThanOrEqual(8);
    for (const a of wechsel) expect(a.x, a.f).toContain(a.wort); // Grundform als typischer Fehler
  });

  it("Grundform nennen: passt zur gezeigten Personalform", () => {
    const grund = vomTyp("k2verben", "grundform");
    expect(grund.length).toBeGreaterThanOrEqual(9);
    for (const a of grund) {
      const e = VERBEN.get(a.wort);
      const [pronomen, formWort] = a.formText.split(" ");
      expect(a.r, a.f).toBe(e.grund);
      expect(formWort, a.f).toBe(pronomen === "du" ? e.du : e.er);
      for (const x of a.x) expect(VERBEN.has(x), `${a.f} → ${x}`).toBe(false);
    }
    expect(K2_DEUTSCH_DATEN.k2verben.easy.some((a) => a.typ === "grundform")).toBe(false);
  });

  it("Verb im Satz finden: Lösung und Falschantworten stehen im Satz", () => {
    const imSatz = vomTyp("k2verben", "verbsatz");
    expect(imSatz.length).toBeGreaterThanOrEqual(10);
    for (const a of imSatz) for (const w of [a.r, ...a.x]) expect(a.f.split(/[\s.?]+/), a.f).toContain(w);
  });

  it("Stichproben", () => {
    expect(sucheF("k2verben", "Der Hund __.")).toMatchObject({
      r: "bellt", x: ["bellen", "bellst"], sprich: "Welches Wort passt in die Lücke? Der Hund, Lücke.",
    });
    expect(sucheF("k2verben", "Die Kinder __ im Garten.")).toMatchObject({
      r: "spielen", sprich: "Welches Wort passt in die Lücke? Die Kinder, Lücke, im Garten.",
    });
    expect(sucheF("k2verben", "Grundform von „er läuft“").r).toBe("laufen");
    expect(sucheF("k2verben", "Tom __ schnell")).toMatchObject({ r: "läuft", x: ["lauft", "laufen"] });
    expect(sucheF("k2verben", "Ball, spielen, rund").r).toBe("spielen");
  });
});

describe("k2adjektive – Adjektive", () => {
  it("Adjektiv aus drei Wörtern und passendes Adjektiv: Lösung steht in der Adjektiv-Liste", () => {
    const wahl = vomTyp("k2adjektive", "adjwahl");
    const passt = vomTyp("k2adjektive", "adjpasst");
    expect(wahl.length).toBeGreaterThanOrEqual(8);
    expect(passt.length).toBeGreaterThanOrEqual(8);
    for (const a of wahl) {
      expect(ADJEKTIVE.has(a.r), a.f).toBe(true);
      for (const x of a.x) expect(ADJEKTIVE.has(x), `${a.f} → ${x}`).toBe(false);
      expect(a.tipp, a.f).toContain(`ist ${a.r}.`);
    }
    for (const a of passt) {
      expect(ADJEKTIVE.has(a.r), a.f).toBe(true);
      expect(a.tipp, a.f).toContain(a.r);
    }
  });

  it("Gegensätze: Lösung = Gegenteil aus der Liste, kein zweites Gegenteil unter den Falschantworten", () => {
    const gegen = vomTyp("k2adjektive", "gegenteil");
    expect(gegen.length).toBeGreaterThanOrEqual(18);
    for (const a of gegen) {
      expect(a.f, a.f).toBe(`Was ist das Gegenteil von ${a.wort}?`);
      expect(a.r, a.f).toBe(ADJEKTIVE.get(a.wort).gegenteil);
      const auchGegenteil = K2_ADJEKTIVE.filter((e) => e.gegenteil === a.wort).map((e) => e.w);
      for (const x of a.x) expect(auchGegenteil, `${a.f} → ${x}`).not.toContain(x);
    }
    expect(new Set(gegen.map((a) => a.wort)).size).toBe(gegen.length);
  });

  it("Adjektiv im Satz finden: Lösung und Falschantworten stehen im Satz", () => {
    const imSatz = vomTyp("k2adjektive", "adjsatz");
    expect(imSatz.length).toBeGreaterThanOrEqual(12);
    for (const a of imSatz) {
      for (const w of [a.r, ...a.x]) expect(a.f.split(/[\s.?]+/), a.f).toContain(w);
      // die Lösung ist ein (gebeugtes) Adjektiv der Liste
      expect(K2_ADJEKTIVE.some((e) => a.r.startsWith(e.w)), a.f).toBe(true);
    }
  });

  it("Stichproben", () => {
    expect(sucheF("k2adjektive", "Gegenteil von groß").r).toBe("klein");
    expect(sucheF("k2adjektive", "Gegenteil von mutig").r).toBe("ängstlich");
    expect(sucheF("k2adjektive", "passt zu Zitrone")).toMatchObject({ r: "sauer", x: ["süß", "salzig"] });
    expect(sucheF("k2adjektive", "Der kleine Hund schläft.").r).toBe("kleine");
  });
});

describe("k2satzzeichen – Satzzeichen", () => {
  const ZEICHEN = ["Ausrufezeichen", "Fragezeichen", "Punkt"];
  const FRAGEWORT = /^(Wie|Wo|Wer|Wann|Was|Warum|Wohin|Welche)\b/;

  it("Satzzeichen wählen: immer Punkt, Fragezeichen oder Ausrufezeichen", () => {
    const zeichen = vomTyp("k2satzzeichen", "zeichen");
    expect(zeichen.length).toBeGreaterThanOrEqual(30);
    for (const a of zeichen) {
      expect([a.r, ...a.x].sort(), a.f).toEqual(ZEICHEN);
      expect(a.f, a.f).toBe(`Was fehlt am Ende? ${a.satz} __`);
      expect(a.sprich, a.f).toBe(`Welches Satzzeichen fehlt am Ende? ${a.satz}`);
      expect(a.satz, a.f).not.toMatch(/[.!?]/); // das Zeichen fehlt wirklich
      expect(a.satz, a.f).toMatch(/^[A-ZÄÖÜ]/);
      if (FRAGEWORT.test(a.satz)) expect(a.r, a.f).toBe("Fragezeichen");
      if (/^(Hilfe|Aua|Halt|Hurra|Oh|Achtung|Pass auf)/.test(a.satz)) expect(a.r, a.f).toBe("Ausrufezeichen");
      if (/^(Der|Die|Das|Ich|Wir|Heute|Im|Tom|Mia) /.test(a.satz)) expect(a.r, a.f).toBe("Punkt");
    }
    // alle drei Zeichen kommen in beiden Stufen als Lösung vor
    for (const stufe of ["easy", "hard"]) {
      const loesungen = K2_DEUTSCH_DATEN.k2satzzeichen[stufe].filter((a) => a.typ === "zeichen").map((a) => a.r);
      expect(new Set(loesungen).size, stufe).toBe(3);
    }
    // 1. Halbjahr: Fragen nur mit Fragewort; 2. Halbjahr: Fragen mit dem Verb vorn
    const fragen = (stufe) => K2_DEUTSCH_DATEN.k2satzzeichen[stufe].filter((a) => a.typ === "zeichen" && a.r === "Fragezeichen");
    for (const a of fragen("easy")) expect(a.satz, a.f).toMatch(FRAGEWORT);
    for (const a of fragen("hard")) expect(a.satz, a.f).not.toMatch(FRAGEWORT);
  });

  it("Satzarten (hard): Satzart passt zum Schlusszeichen", () => {
    const arten = vomTyp("k2satzzeichen", "satzart");
    expect(arten.length).toBeGreaterThanOrEqual(6);
    const von = { ".": "Aussagesatz", "?": "Fragesatz", "!": "Ausrufesatz" };
    for (const a of arten) {
      expect(a.r, a.f).toBe(von[a.satz.slice(-1)]);
      expect([a.r, ...a.x].sort(), a.f).toEqual(Object.values(von).sort());
    }
    expect(new Set(arten.map((a) => a.r)).size).toBe(3);
    expect(K2_DEUTSCH_DATEN.k2satzzeichen.easy.some((a) => a.typ === "satzart")).toBe(false);
    const wissen = vomTyp("k2satzzeichen", "zeichenwissen");
    expect(wissen.map((a) => `${a.satzart} – ${a.r}`).sort()).toEqual([
      "Ausrufesatz – Ausrufezeichen", "Aussagesatz – Punkt", "Fragesatz – Fragezeichen",
    ]);
  });

  it("Satzanfang groß und Satzgrenzen (hard)", () => {
    const anfang = vomTyp("k2satzzeichen", "satzanfang");
    expect(anfang.length).toBeGreaterThanOrEqual(5);
    for (const a of anfang) {
      const erstes = a.satz.split(" ")[0];
      expect(erstes, a.f).toMatch(/^[a-zäöü]/);
      expect(a.r, a.f).toBe(gross(erstes));
      for (const x of a.x) {
        expect(a.satz.split(/[\s.?!]+/).slice(1), a.f).toContain(x.toLowerCase()); // steht klein im Satz, bleibt klein
        expect(NOMEN.has(x), `${a.f} → ${x}`).toBe(false);
      }
    }
    const grenze = vomTyp("k2satzzeichen", "satzgrenze");
    expect(grenze.length).toBeGreaterThanOrEqual(3);
    for (const a of grenze) {
      const woerter = a.text.split(" ");
      const stelle = woerter.indexOf(a.nach);
      expect(a.r, a.f).toBe(`nach ${a.nach}`);
      expect(stelle, a.f).toBeGreaterThanOrEqual(1); // erster Satz hat mindestens zwei Wörter
      expect(woerter.length - stelle - 1, a.f).toBeGreaterThanOrEqual(3); // der zweite auch
      expect(woerter.filter((w) => w === a.nach), a.f).toHaveLength(1);
      expect(a.text, a.f).not.toMatch(/[.!?,]/);
      for (const x of a.x) expect(woerter, a.f).toContain(x.replace("nach ", ""));
    }
  });

  it("Stichproben", () => {
    expect(sucheF("k2satzzeichen", "Wie heißt du __").r).toBe("Fragezeichen");
    expect(sucheF("k2satzzeichen", "Der Hund schläft im Korb __").r).toBe("Punkt");
    expect(sucheF("k2satzzeichen", "Hilfe, es brennt __").r).toBe("Ausrufezeichen");
    expect(sucheF("k2satzzeichen", "Kommst du mit __").r).toBe("Fragezeichen");
    expect(sucheF("k2satzzeichen", "Welche Satzart ist das? Wo wohnst du?").r).toBe("Fragesatz");
    expect(sucheF("k2satzzeichen", "heute scheint die Sonne.")).toMatchObject({ r: "Heute", x: ["Scheint", "Die"] });
  });
});

describe("k2silben – Silbentrennung", () => {
  it("Trennung: Lösung nach Wortliste UND nach den Duden-Regeln, Falschantworten sind falsche Schnitte", () => {
    const trennen = vomTyp("k2silben", "trennen");
    expect(trennen.length).toBeGreaterThanOrEqual(40);
    for (const a of trennen) {
      expect(a.f, a.f).toBe(`Wie trennst du ${a.wort}?`);
      expect(a.r.replace(/-/g, ""), a.f).toBe(a.wort);
      expect(a.r, a.f).toBe(trenne(a.wort));
      if (NOMEN.has(a.wort)) expect(a.r, a.f).toBe(NOMEN.get(a.wort).silben.join("-"));
      expect(a.r.split("-").every((s) => s.length >= 2), a.f).toBe(true); // kein einzelner Buchstabe abgetrennt
      for (const x of a.x) {
        expect(x.replace(/-/g, ""), `${a.f} → ${x}`).toBe(a.wort); // gleiches Wort, anderer Schnitt
        expect(x.split("-").length, `${a.f} → ${x}`).toBe(a.r.split("-").length);
      }
      expect(a.tipp, a.f).toContain(a.r);
    }
  });

  it("easy: einfache zweisilbige Wörter; hard: Doppelkonsonanten, ck, tz, sch/ch", () => {
    const { easy, hard } = K2_DEUTSCH_DATEN.k2silben;
    for (const a of easy.filter((x) => x.typ === "trennen")) {
      expect(a.r.split("-"), a.f).toHaveLength(2);
      expect(a.wort, a.f).not.toMatch(/([bdfglmnprst])\1|ck|tz|[aeiouäöü]s?ch/); // Sch- am Wortanfang ist erlaubt
    }
    const regel = (name) => hard.filter((a) => a.regel === name);
    expect(regel("doppelt").length).toBeGreaterThanOrEqual(8);
    for (const a of regel("doppelt")) expect(a.r, a.f).toMatch(/([bdfglmnprst])-\1/);
    expect(regel("ck").length).toBeGreaterThanOrEqual(4);
    for (const a of regel("ck")) {
      expect(a.r, a.f).toMatch(/[aeiouäöü]-ck/);
      expect(a.x.some((x) => x.includes("c-k")), a.f).toBe(true); // typischer Fehler: ck zerreißen
    }
    expect(regel("tz").length).toBeGreaterThanOrEqual(3);
    for (const a of regel("tz")) expect(a.r, a.f).toMatch(/t-z/);
    expect(regel("sch").length).toBeGreaterThanOrEqual(3);
    for (const a of regel("sch")) expect(a.r, a.f).not.toMatch(/s-ch|c-h/);
    for (const a of regel("drei")) expect(a.r.split("-"), a.f).toHaveLength(3);
  });

  it("Silben zählen stimmt mit der Wortliste", () => {
    const zahl = vomTyp("k2silben", "silbenzahl");
    expect(zahl.length).toBeGreaterThanOrEqual(8);
    for (const a of zahl) {
      expect(a.r, a.f).toBe(String(NOMEN.get(a.wort).silben.length));
      expect(a.r, a.f).toBe(String(trenne(a.wort).split("-").length));
    }
    expect(new Set(zahl.map((a) => a.r))).toEqual(new Set(["1", "2", "3"]));
  });

  it("Stichproben", () => {
    expect(sucheF("k2silben", "trennst du Blume?")).toMatchObject({ r: "Blu-me", x: ["Bl-ume", "Blum-e"] });
    expect(sucheF("k2silben", "trennst du Wasser?")).toMatchObject({ r: "Was-ser", x: ["Wa-sser", "Wass-er"] });
    expect(sucheF("k2silben", "trennst du Zucker?")).toMatchObject({ r: "Zu-cker", x: ["Zuc-ker", "Zuck-er"] });
    expect(sucheF("k2silben", "trennst du Katze?")).toMatchObject({ r: "Kat-ze", x: ["Ka-tze", "Katz-e"] });
    expect(sucheF("k2silben", "Silben hat Banane?").r).toBe("3");
  });
});

describe("k2verlaengern – Verlängern", () => {
  const PAARE = { d: "dt", t: "dt", g: "gk", k: "gk", b: "bp", p: "bp" };

  it("Lücke + Lösung ergibt das Wort, das Verlängerungswort macht den Buchstaben hörbar", () => {
    const liste = alle("k2verlaengern");
    for (const a of liste) {
      expect(a.typ, a.f).toBe("verlaengern");
      const [luecke, frage] = a.f.split(" – ");
      expect(luecke.match(/_/g), a.f).toHaveLength(1);
      expect(frage, a.f).toBe(`${PAARE[a.r][0]} oder ${PAARE[a.r][1]}?`);
      // richtige Antwort ergibt das Wort (bei Verben: die Personalform nach dem Pronomen)
      const voll = luecke.replace("_", a.r);
      expect(a.wortart === "verb" ? voll.split(" ")[1] : voll, a.f).toBe(a.wort);
      // Falschantworten: der Partner-Buchstabe und eine falsche Verdopplung
      const partner = PAARE[a.r].replace(a.r, "");
      expect(a.x[0], a.f).toBe(partner);
      expect(a.x[1], a.f).toMatch(/^(tt|ck|pp)$/);
      // Verlängerungswort: Wortstamm + Buchstabe + SELBSTLAUT – erst dadurch wird er hörbar
      const stamm = ohneUmlaut(a.wortart === "verb" ? a.wort.slice(0, -1) : a.wort);
      expect(ohneUmlaut(a.lang).startsWith(stamm), `${a.wort} → ${a.lang}`).toBe(true);
      expect(ohneUmlaut(a.lang)[stamm.length], `${a.wort} → ${a.lang}`).toMatch(/[aeiou]/);
      expect(stamm.slice(-1), a.f).toBe(a.r);
      expect(a.tipp, a.f).toContain(a.lang);
      expect(a.sprich, a.f).toContain(a.wort);
      expect(a.sprich, a.f).toContain(frage);
    }
  });

  it("easy: Nomen mit ihrer Mehrzahl; hard: Adjektive und Verben", () => {
    const { easy, hard } = K2_DEUTSCH_DATEN.k2verlaengern;
    for (const a of easy) {
      expect(a.wortart, a.f).toBe("nomen");
      expect(a.lang, a.f).toBe(NOMEN.get(a.wort).mehrzahl);
    }
    const adjektive = hard.filter((a) => a.wortart === "adjektiv");
    const verben = hard.filter((a) => a.wortart === "verb");
    expect(adjektive.length).toBeGreaterThanOrEqual(8);
    expect(verben.length).toBeGreaterThanOrEqual(8);
    expect(adjektive.length + verben.length).toBe(hard.length);
    for (const a of adjektive) {
      expect(ADJEKTIVE.has(a.wort), a.f).toBe(true);
      expect(a.lang, a.f).toMatch(/er$/);
    }
    for (const a of verben) {
      expect(VERBEN.get(a.lang).er, a.f).toBe(a.wort);
      expect(a.f, a.f).toMatch(/^(er|sie|es) \w+_t – /);
    }
    // beide Buchstaben jedes Paares kommen als Lösung vor – „immer d“ darf keine Strategie sein
    for (const stufe of [easy, hard]) {
      const loesungen = new Set(stufe.map((a) => a.r));
      for (const buchstabe of ["d", "t", "g", "k", "b"]) expect(loesungen.has(buchstabe), buchstabe).toBe(true);
    }
  });

  it("Stichproben", () => {
    expect(sucheF("k2verlaengern", "Hun_")).toMatchObject({
      f: "Hun_ – d oder t?", r: "d", x: ["t", "tt"], lang: "Hunde", sprich: "Hund. Schreibst du am Ende d oder t?",
    });
    expect(sucheF("k2verlaengern", "Ber_")).toMatchObject({ r: "g", lang: "Berge" });
    expect(sucheF("k2verlaengern", "Kor_")).toMatchObject({ r: "b", lang: "Körbe" });
    expect(sucheF("k2verlaengern", "Bro_")).toMatchObject({ r: "t", x: ["d", "tt"], lang: "Brote" });
    expect(sucheF("k2verlaengern", "wil_")).toMatchObject({ r: "d", lang: "wilder" });
    expect(sucheF("k2verlaengern", "er le_t")).toMatchObject({ r: "g", lang: "legen", wort: "legt" });
  });
});

describe("k2abc – ABC und Wörterbuch", () => {
  const ABC = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const woerterVon = (a) => a.f.split("? ")[1].split(", ");
  const sortiert = (woerter) => woerter.slice().sort((x, y) => x.localeCompare(y, "de"));

  it("zweimal erzeugen liefert dasselbe (fester Seed)", () => {
    expect(k2AbcErzeugen()).toEqual(k2AbcErzeugen());
    expect(k2AbcErzeugen()).toEqual(K2_DEUTSCH_DATEN.k2abc);
  });

  it("Buchstaben-Nachbarn sind nachgerechnet", () => {
    const nach = vomTyp("k2abc", "abcnach");
    const vor = vomTyp("k2abc", "abcvor");
    const zwischen = vomTyp("k2abc", "abczwischen");
    expect(nach.length).toBeGreaterThanOrEqual(8);
    expect(vor.length).toBeGreaterThanOrEqual(6);
    expect(zwischen.length).toBeGreaterThanOrEqual(4);
    for (const a of nach) {
      expect(a.f, a.f).toBe(`Welcher Buchstabe kommt nach ${a.buchstabe}?`);
      expect(a.r, a.f).toBe(ABC[ABC.indexOf(a.buchstabe) + 1]);
    }
    for (const a of vor) {
      expect(a.f, a.f).toBe(`Welcher Buchstabe kommt vor ${a.buchstabe}?`);
      expect(a.r, a.f).toBe(ABC[ABC.indexOf(a.buchstabe) - 1]);
    }
    for (const a of zwischen) {
      expect(a.f, a.f).toBe(`Welcher Buchstabe steht zwischen ${a.von} und ${a.bis}?`);
      expect(ABC.indexOf(a.bis) - ABC.indexOf(a.von), a.f).toBe(2);
      expect(a.r, a.f).toBe(ABC[ABC.indexOf(a.von) + 1]);
    }
    for (const a of [...nach, ...vor, ...zwischen]) {
      for (const antwort of [a.r, ...a.x]) expect(antwort, a.f).toMatch(/^[A-Z]$/);
      // Falschantworten liegen direkt in der Nachbarschaft (typischer Fehler: eins daneben)
      for (const x of a.x) expect(Math.abs(ABC.indexOf(x) - ABC.indexOf(a.r)), a.f).toBeLessThanOrEqual(3);
    }
  });

  it("Wörterbuch: Lösung ist nach dem ABC nachsortiert", () => {
    const { easy, hard } = K2_DEUTSCH_DATEN.k2abc;
    const zuerst = vomTyp("k2abc", "abczuerst");
    const zuletzt = vomTyp("k2abc", "abczuletzt");
    expect(zuerst.length).toBeGreaterThanOrEqual(16);
    expect(zuletzt.length).toBeGreaterThanOrEqual(5);
    for (const a of [...zuerst, ...zuletzt]) {
      const woerter = woerterVon(a);
      expect(woerter, a.f).toHaveLength(3);
      expect(woerter.slice().sort(), a.f).toEqual([a.r, ...a.x].sort());
      for (const w of woerter) expect(NOMEN.has(w), `${a.f} → ${w}`).toBe(true);
      const reihe = sortiert(woerter);
      expect(a.r, a.f).toBe(a.typ === "abczuerst" ? reihe[0] : reihe[2]);
    }
    // 1. Halbjahr: drei verschiedene Anfangsbuchstaben, und nicht immer gewinnt derselbe
    const leicht = easy.filter((a) => a.typ === "abczuerst");
    expect(leicht.length).toBeGreaterThanOrEqual(8);
    for (const a of leicht) expect(new Set(woerterVon(a).map((w) => w[0])).size, a.f).toBe(3);
    expect(new Set(leicht.map((a) => a.r[0])).size).toBe(leicht.length);
    // 2. Halbjahr: gleicher Anfangsbuchstabe, der ZWEITE Buchstabe entscheidet (ohne Umlaut-Zweifel)
    const schwer = hard.filter((a) => a.typ === "abczuerst" || a.typ === "abczuletzt");
    expect(schwer.length).toBe(hard.length - hard.filter((a) => a.typ === "abcdazwischen").length);
    for (const a of schwer) {
      const woerter = woerterVon(a);
      expect(new Set(woerter.map((w) => w[0])).size, a.f).toBe(1);
      expect(new Set(woerter.map((w) => w[1])).size, a.f).toBe(3);
      for (const w of woerter) expect(w.slice(0, 2), a.f).toMatch(/^[A-Z][a-z]$/);
      expect(a.tipp, a.f).toContain("zweite");
    }
  });

  it("Einordnen: nur die Lösung liegt zwischen den beiden Wörtern", () => {
    const dazwischen = vomTyp("k2abc", "abcdazwischen");
    expect(dazwischen.length).toBeGreaterThanOrEqual(4);
    const liegtDazwischen = (w, a) => a.von.localeCompare(w, "de") < 0 && w.localeCompare(a.bis, "de") < 0;
    for (const a of dazwischen) {
      expect(a.f, a.f).toBe(`Welches Wort passt zwischen ${a.von} und ${a.bis}?`);
      expect(liegtDazwischen(a.r, a), a.f).toBe(true);
      for (const x of a.x) expect(liegtDazwischen(x, a), `${a.f} → ${x}`).toBe(false);
      expect(a.x[0][0], a.f).toBe(a.r[0]); // eine Falschantwort beginnt gleich – der 2. Buchstabe ist nötig
      expect(a.x[1][0], a.f).not.toBe(a.r[0]);
    }
  });

  it("Stichproben", () => {
    expect(sucheF("k2abc", "kommt nach M?")).toMatchObject({ r: "N", x: ["L", "O"] });
    expect(sucheF("k2abc", "kommt nach A?").r).toBe("B");
    expect(sucheF("k2abc", "kommt vor Z?").r).toBe("Y");
    expect(K2_DEUTSCH_DATEN.k2abc.easy[0].f).toBe("Welcher Buchstabe kommt nach M?");
  });
});

describe("k2zusnomen – Zusammengesetzte Nomen", () => {
  it("Zusammensetzen: a + b ergibt das Wort, vertauscht ist falsch", () => {
    const bilden = vomTyp("k2zusnomen", "zusbilden");
    expect(bilden.length).toBeGreaterThanOrEqual(12);
    for (const a of bilden) {
      expect(a.f, a.f).toBe(`${a.a} + ${a.b} = ?`);
      expect(a.sprich, a.f).toBe(`Welches Wort entsteht aus ${a.a} und ${a.b}?`);
      expect(a.r, a.f).toBe(a.a + a.b.toLowerCase());
      expect(a.x[0], a.f).toBe(a.b + a.a.toLowerCase());
      expect(a.x[1].startsWith(a.a), a.f).toBe(true); // echtes Wort mit gleichem Anfang, aber anderem Ende
      expect(a.x[1].endsWith(a.b.toLowerCase()), a.f).toBe(false);
    }
    expect(K2_DEUTSCH_DATEN.k2zusnomen.hard.some((a) => a.typ === "zusbilden")).toBe(false);
  });

  it("Fugen (hard): an der Nahtstelle ändert sich etwas, „einfach zusammen“ ist der typische Fehler", () => {
    const fuge = vomTyp("k2zusnomen", "zusfuge");
    expect(fuge.length).toBeGreaterThanOrEqual(8);
    for (const a of fuge) {
      expect(a.r, a.f).not.toBe(a.a + a.b.toLowerCase());
      expect(a.x[0], a.f).toBe(a.a + a.b.toLowerCase());
      expect(a.r.endsWith(a.b.toLowerCase()), a.f).toBe(true);
      expect(a.r.slice(0, 4), a.f).toBe(a.a.slice(0, 4));
      expect(a.x[1].startsWith(a.b.slice(0, 4)), a.f).toBe(true); // vertauscht
      expect(a.tipp, a.f).toContain(a.r);
    }
    expect(K2_DEUTSCH_DATEN.k2zusnomen.easy.some((a) => a.typ === "zusfuge")).toBe(false);
  });

  it("Zerlegen: die zwei Teile ergeben zusammen das Wort", () => {
    const teile = vomTyp("k2zusnomen", "zusteile");
    expect(teile.length).toBeGreaterThanOrEqual(12);
    for (const a of teile) {
      expect(a.f, a.f).toBe(`Welche zwei Wörter stecken in ${a.wort}?`);
      expect(a.a + a.b.toLowerCase(), a.f).toBe(a.wort);
      expect(a.r, a.f).toBe(`${a.a} und ${a.b}`);
      for (const x of a.x) {
        const [x1, x2] = x.split(" und ");
        expect(x1 + x2.toLowerCase(), `${a.f} → ${x}`).not.toBe(a.wort);
        // genau EIN Teil ist richtig – man muss beide Hälften prüfen
        expect([x1 === a.a, x2 === a.b].filter(Boolean), `${a.f} → ${x}`).toHaveLength(1);
      }
    }
  });

  it("Artikel (hard): das letzte Wort bestimmt – und unterscheidet sich vom ersten", () => {
    const artikel = vomTyp("k2zusnomen", "zusartikel");
    expect(artikel.length).toBeGreaterThanOrEqual(8);
    for (const a of artikel) {
      expect(a.wort, a.f).toBe(a.a + a.b.toLowerCase());
      expect(a.r, a.f).toBe(NOMEN.get(a.b).artikel);
      expect(NOMEN.get(a.a).artikel, a.f).not.toBe(a.r); // sonst wäre die Regel nicht nötig
      expect([a.r, ...a.x].sort(), a.f).toEqual(ARTIKEL.slice().sort());
      expect(a.tipp, a.f).toContain(`${a.r} ${a.b}`);
    }
    expect(new Set(artikel.map((a) => a.r)).size).toBe(3);
    expect(K2_DEUTSCH_DATEN.k2zusnomen.easy.some((a) => a.typ === "zusartikel")).toBe(false);

    for (const a of vomTyp("k2zusnomen", "zusbedeutung")) {
      const e = NOMEN.get(a.b);
      const ein = e.artikel === "die" ? "eine" : "ein";
      expect(a.wort.endsWith(a.b.toLowerCase()), a.f).toBe(true);
      expect(a.f, a.f).toBe(`Was ist ${ein} ${a.wort}?`);
      expect(a.r, a.f).toBe(`${ein} ${a.b}`);
    }
  });

  it("Stichproben", () => {
    expect(sucheF("k2zusnomen", "Haus + Tür = ?")).toMatchObject({
      r: "Haustür", x: ["Türhaus", "Hausdach"], sprich: "Welches Wort entsteht aus Haus und Tür?",
    });
    expect(sucheF("k2zusnomen", "stecken in Handtuch?").r).toBe("Hand und Tuch");
    expect(sucheF("k2zusnomen", "werden Haustür.")).toMatchObject({ r: "die", x: ["der", "das"] });
    expect(sucheF("k2zusnomen", "werden Baumhaus.").r).toBe("das");
    expect(sucheF("k2zusnomen", "Sonne + Blume = ?")).toMatchObject({ r: "Sonnenblume", x: ["Sonneblume", "Blumensonne"] });
    expect(sucheF("k2zusnomen", "Was ist ein Apfelbaum?").r).toBe("ein Baum");
  });
});
