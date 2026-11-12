import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import {
  K1_DEUTSCH_DATEN, K1_DEUTSCH_BEREICHE, K1_DEUTSCH_GRUPPEN, K1_WOERTER, K1_REIMFAMILIEN,
  k1DeutschErzeugen, k1Anlaut,
} from "./klasse1Deutsch.js";
import { poolGesund } from "../aufgabenRunde.js";

/* 🔤 Deutsch Klasse 1: Laute, Silben, erstes Lesen.
   Anlaute, Silbenzahlen, Reime und Satz-Fehler werden hier EIGENSTÄNDIG
   nachgerechnet (nicht mit den Helfern aus dem Modul) – keine Lösung im
   Pool darf falsch sein. */
const KEYS = ["k1anlaut", "k1laute", "k1silben", "k1reime", "k1lesen", "k1saetze"];
const alle = (key) => [...K1_DEUTSCH_DATEN[key].easy, ...K1_DEUTSCH_DATEN[key].hard];
const ueberall = () => KEYS.flatMap(alle);
const finde = (key, f) => alle(key).find((a) => a.f === f || a.sprich === f);

const EMOJI = /\p{Extended_Pictographic}/u;
const VOKAL = "aeiouäöü";
const istVokal = (z) => !!z && VOKAL.includes(z.toLowerCase());
const WORT = new Map(K1_WOERTER.map((e) => [e.w, e]));
const NACH_BILD = new Map(K1_WOERTER.map((e) => [e.bild, e]));

// Eigene Rechner (unabhängig vom Modul)
const MEHRLAUTE = ["Sch", "St", "Sp", "Pf", "Qu", "Ei", "Au", "Eu"];
const anlaut = (w) => MEHRLAUTE.find((m) => w.startsWith(m)) ?? w[0];
const auslaut = (w) => {
  const k = w.toLowerCase();
  const mehr = ["sch", "ch", "ei", "au"].find((e) => k.endsWith(e));
  if (mehr) return mehr;
  return /[aeiou]h$/.test(k) ? k.at(-2) : k.at(-1); // stummes Dehnungs-h zählt nicht als Laut
};
// Lang/kurz nur für eindeutige Fälle: Doppel-/Mehrfach-Mitlaut danach = kurz,
// Dehnungs-h, einzelner Mitlaut oder Wortende danach = lang.
const laenge = (w, vokal) => {
  const k = w.toLowerCase();
  const danach = k.slice(k.indexOf(vokal.toLowerCase()) + 1).match(/^[^aeiouäöü]*/)[0];
  return !danach.startsWith("h") && danach.length >= 2 ? "kurz" : "lang";
};
// Klang-Schreibung: macht gleich Klingendes gleich (Boot/Brot, bunt/Hund).
const klang = (w) => w.toLowerCase()
  .replace(/eh/g, "ee").replace(/([aiouäöü])h/g, "$1").replace(/ie/g, "i").replace(/aa/g, "a").replace(/oo/g, "o")
  .replace(/ai/g, "ei").replace(/äu/g, "eu").replace(/ß/g, "s").replace(/ck/g, "k").replace(/tz/g, "z")
  .replace(/dt/g, "t").replace(/d$/, "t").replace(/b$/, "p").replace(/g$/, "k").replace(/v/g, "f")
  .replace(/([bdfgklmnprst])\1/g, "$1");
const reimtAuf = (w, endung) => {
  const kw = klang(w), ke = klang(endung);
  return kw.endsWith(ke) && !istVokal(kw[kw.length - ke.length - 1]);
};
const familie = (w) => K1_REIMFAMILIEN.find((fam) => fam.woerter.includes(w));
// Ähnliches Wortbild: gleicher Anfangsbuchstabe, gleiche zwei Endbuchstaben oder 3 gleiche Buchstaben am Stück.
const aehnlich = (a, b) => {
  const x = a.toLowerCase(), y = b.toLowerCase();
  if (x[0] === y[0] || x.slice(-2) === y.slice(-2)) return true;
  for (let i = 0; i + 3 <= x.length; i++) if (y.includes(x.slice(i, i + 3))) return true;
  return false;
};

describe("Klasse 1 Deutsch – Aufbau und Vertrag", () => {
  it("Bereiche, Gruppen und Daten passen zusammen (Reihenfolge = Lernweg)", () => {
    expect(K1_DEUTSCH_BEREICHE.map((b) => b.key)).toEqual(KEYS);
    expect(Object.keys(K1_DEUTSCH_DATEN)).toEqual(KEYS);
    expect(K1_DEUTSCH_BEREICHE.map((b) => b.name)).toEqual(["Anlaute", "Laute hören", "Silben", "Reime", "Wörter erlesen", "Erste Sätze"]);
    for (const b of K1_DEUTSCH_BEREICHE) expect(b.emoji, b.key).toMatch(EMOJI);
    expect(K1_DEUTSCH_GRUPPEN.map((g) => [g.name, g.felder])).toEqual([
      ["Hören & Laute", ["k1anlaut", "k1laute", "k1reime"]],
      ["Silben", ["k1silben"]],
      ["Lesen", ["k1lesen", "k1saetze"]],
    ]);
    expect(new Set(K1_DEUTSCH_GRUPPEN.map((g) => g.key)).size).toBe(3);
    expect(K1_DEUTSCH_GRUPPEN.flatMap((g) => g.felder).sort()).toEqual([...KEYS].sort());
  });

  it.each(KEYS)("Pool %s: gesund, groß genug, genau 2 Falschantworten, keine Duplikate", (key) => {
    const pool = K1_DEUTSCH_DATEN[key];
    expect(poolGesund(pool)).toBe(true);
    expect(pool.easy.length).toBeGreaterThanOrEqual(24);
    expect(pool.hard.length).toBeGreaterThanOrEqual(20);
    const maxAntwort = key === "k1saetze" ? 28 : 16;
    const gesehen = new Set();
    for (const a of alle(key)) {
      expect(a.x, a.f).toHaveLength(2);
      expect(new Set([a.r, ...a.x]).size, `${a.f} → ${a.r}`).toBe(3);
      for (const antwort of [a.r, ...a.x]) {
        expect(typeof antwort, a.f).toBe("string");
        expect(antwort.length, `${a.f} → ${antwort}`).toBeLessThanOrEqual(maxAntwort);
        expect(antwort.trim(), a.f).toBe(antwort);
      }
      expect(a.f.length, a.f).toBeLessThanOrEqual(70);
      const schluessel = `${a.f}|${JSON.stringify(a.bild ?? null)}`;
      expect(gesehen.has(schluessel), `doppelt: ${schluessel}`).toBe(false);
      gesehen.add(schluessel);
    }
  });

  it("jede Aufgabe wird vorgelesen: `sprich` ist überall da und frei von Platzhaltern", () => {
    for (const a of ueberall()) {
      expect(typeof a.sprich, a.f).toBe("string");
      expect(a.sprich.length, a.f).toBeGreaterThan(10);
      expect(a.sprich, a.f).not.toMatch(/__|[+=_]/);
      expect(a.sprich, a.f).toMatch(/\?$/);
      // Pflicht laut Vertrag: Platzhalter oder Rechenzeichen in `f` brauchen einen eigenen Vorlesetext
      if (/__|[+=]/.test(a.f)) expect(a.sprich, a.f).not.toBe(a.f);
    }
  });

  it("keine Emojis in Frage, Antworten, Tipp und Vorlesetext; Tipp ist EIN kurzer Satz", () => {
    for (const a of ueberall()) {
      for (const text of [a.f, a.r, ...a.x, a.tipp, a.sprich]) expect(text, a.f).not.toMatch(EMOJI);
      expect(a.tipp, a.f).toMatch(/\.$/);
      expect(a.tipp.length, a.tipp).toBeLessThanOrEqual(120);
      expect(a.tipp, a.f).not.toMatch(/[.!?]\s+\S/); // kein zweiter Satz
      expect(a.tipp, a.f).not.toBe(a.r);
    }
    expect(/ADHS|Störung|unmotiviert|Versager|dumm|falsch gemacht/i.test(JSON.stringify(K1_DEUTSCH_DATEN))).toBe(false);
  });

  it("Bilder: nur die Art „emoji“, Zeichen aus der Wortliste, Anzahl 1 bis 10; keine Rechen-Felder", () => {
    for (const a of ueberall()) {
      expect(a.term, a.f).toBeUndefined();
      expect(a.bloecke, a.f).toBeUndefined();
      if (!a.bild) continue;
      expect(Object.keys(a.bild).sort(), a.f).toEqual(["anzahl", "art", "zeichen"]);
      expect(a.bild.art, a.f).toBe("emoji");
      expect(NACH_BILD.has(a.bild.zeichen), `${a.f} ${a.bild.zeichen}`).toBe(true);
      expect(Number.isInteger(a.bild.anzahl) && a.bild.anzahl >= 1 && a.bild.anzahl <= 10, a.f).toBe(true);
    }
    // Anlaut-, Lese- und Satz-Aufgaben haben IMMER ein Bild
    for (const key of ["k1anlaut", "k1lesen", "k1saetze"]) for (const a of alle(key)) expect(a.bild, a.f).toBeTruthy();
  });

  it("deterministisch: zweimal erzeugen liefert dasselbe, ohne Math.random und ohne Datum", () => {
    expect(k1DeutschErzeugen()).toEqual(k1DeutschErzeugen());
    expect(k1DeutschErzeugen()).toEqual(K1_DEUTSCH_DATEN);
    const quelle = readFileSync(new URL("./klasse1Deutsch.js", import.meta.url), "utf8");
    expect(quelle).not.toMatch(/Math\.random|Date\.now|new Date/);
    expect(quelle).toMatch(/rngAusSeed\(/);
  });
});

describe("Klasse 1 Deutsch – Wortliste K1_WOERTER", () => {
  it("mindestens 70 Nomen mit Artikel, Silben und je einem eigenen Bild", () => {
    expect(K1_WOERTER.length).toBeGreaterThanOrEqual(70);
    expect(new Set(K1_WOERTER.map((e) => e.w)).size).toBe(K1_WOERTER.length);
    expect(new Set(K1_WOERTER.map((e) => e.bild)).size).toBe(K1_WOERTER.length); // kein Emoji für zwei Wörter
    for (const e of K1_WOERTER) {
      expect(e.w, e.w).toMatch(/^[A-ZÄÖÜ][a-zäöüß]+$/); // Nomen groß
      expect(["der", "die", "das"], e.w).toContain(e.artikel);
      expect(e.bild, e.w).toMatch(/^\p{Extended_Pictographic}️?$/u);
      expect(e.silben.join(""), e.w).toBe(e.w);
    }
  });

  it("Silben stimmen: jede Silbe hat genau EINEN Selbstlaut-Kern (a, ei, au, ie …)", () => {
    const KERNE = new Set(["a", "e", "i", "o", "u", "ä", "ö", "ü", "ie", "ei", "ai", "au", "eu", "äu", "ee", "oo", "aa"]);
    for (const e of K1_WOERTER) {
      for (const silbe of e.silben) {
        const kerne = silbe.toLowerCase().replace(/^qu/, "q").match(/[aeiouäöü]+/g) || [];
        expect(kerne, `${e.w}: Silbe „${silbe}“`).toHaveLength(1);
        expect(KERNE.has(kerne[0]), `${e.w}: Kern „${kerne[0]}“`).toBe(true);
      }
    }
  });

  it("Stichproben: Silbenzahl und Artikel", () => {
    const zahl = (w) => WORT.get(w).silben.length;
    expect(zahl("Hund")).toBe(1);
    expect(zahl("Schwein")).toBe(1);
    expect(zahl("Hase")).toBe(2);
    expect(zahl("Feuer")).toBe(2);
    expect(zahl("Banane")).toBe(3);
    expect(zahl("Pinguin")).toBe(3);
    expect(zahl("Schmetterling")).toBe(3);
    expect(zahl("Schokolade")).toBe(4);
    expect(zahl("Regenbogen")).toBe(4);
    expect(WORT.get("Banane")).toEqual({ w: "Banane", artikel: "die", silben: ["Ba", "na", "ne"], bild: "🍌" });
    expect(WORT.get("Sofa").artikel).toBe("das");
    expect(WORT.get("Käse").artikel).toBe("der");
  });
});

describe("k1anlaut – Anlaute", () => {
  const SCHWER = ["Sch", "St", "Sp", "Ei", "Au", "Eu", "Qu", "Pf", "Z"];

  it("die richtige Antwort ist der Anlaut des Bild-Wortes, `sprich` nennt das Wort", () => {
    for (const a of alle("k1anlaut")) {
      const e = WORT.get(a.wort);
      expect(e, a.wort).toBeTruthy();
      expect(a.bild.zeichen, a.wort).toBe(e.bild);
      expect(a.r, a.wort).toBe(anlaut(a.wort));
      expect(k1Anlaut(a.wort), a.wort).toBe(anlaut(a.wort));
      expect(a.sprich, a.wort).toContain(a.wort);
      expect(a.f, a.wort).not.toContain(a.wort); // die Frage selbst verrät das Wort nicht
      for (const x of a.x) expect(x, a.wort).toMatch(/^[A-ZÄÖÜ][a-z]{0,3}$/);
    }
  });

  it("easy = klare Einzellaute, hard = Sch, St, Sp, Ei, Au, Eu, Qu, Pf, Z und Mitlaut-Häufungen", () => {
    for (const a of K1_DEUTSCH_DATEN.k1anlaut.easy) {
      expect(a.r, a.wort).toHaveLength(1);
      expect(SCHWER, a.wort).not.toContain(a.r);
      expect(istVokal(a.wort[1]) || istVokal(a.wort[0]), a.wort).toBe(true); // keine Mitlaut-Häufung am Anfang
    }
    const schwer = new Set(K1_DEUTSCH_DATEN.k1anlaut.hard.map((a) => a.r));
    for (const laut of SCHWER) expect(schwer.has(laut), laut).toBe(true);
    for (const a of K1_DEUTSCH_DATEN.k1anlaut.hard) {
      const haeufung = !istVokal(a.wort[0]) && !istVokal(a.wort[1]);
      expect(SCHWER.includes(a.r) || haeufung, a.wort).toBe(true);
    }
  });

  it("Falschantworten sind nie gleich klingende Schreibungen (F/V, E/Ä, Ei/Ai, Eu/Äu, K/C, Z/C)", () => {
    const TABU = { F: ["V", "Ph"], W: ["V"], V: ["F", "W"], E: ["Ä"], Ei: ["Ai"], Eu: ["Äu"], K: ["C", "Q", "Ch"], Z: ["C", "Ts"], I: ["Ie"], Sch: ["St", "Sp"] };
    for (const a of alle("k1anlaut")) {
      for (const x of a.x) expect(TABU[a.r] || [], `${a.wort}: ${x}`).not.toContain(x);
    }
  });

  it("St und Sp: gefragt sind die Buchstaben, „Sch“-Hörschreibungen sind die Falle", () => {
    const st = alle("k1anlaut").filter((a) => a.r === "St" || a.r === "Sp");
    expect(st.length).toBeGreaterThanOrEqual(4);
    for (const a of st) {
      expect(a.f, a.wort).toBe("Mit welchen Buchstaben fängt das Wort an?");
      expect(a.x.some((x) => x.startsWith("Sch")), a.wort).toBe(true);
      expect(a.x, a.wort).not.toContain("S"); // „S“ wäre als erster Buchstabe auch richtig
    }
  });

  it("Stichproben", () => {
    const von = (w) => alle("k1anlaut").find((a) => a.wort === w);
    expect(von("Affe")).toMatchObject({ f: "Mit welchem Laut fängt das Wort an?", r: "A", sprich: "Mit welchem Laut fängt Affe an?", bild: { art: "emoji", zeichen: "🐒", anzahl: 1 } });
    expect(von("Schaf")).toMatchObject({ r: "Sch", x: ["S", "Ch"] });
    expect(von("Eule").r).toBe("Eu");
    expect(von("Quadrat").r).toBe("Qu");
    expect(von("Stern")).toMatchObject({ r: "St", x: ["Scht", "Sp"] });
    expect(K1_DEUTSCH_DATEN.k1anlaut.easy.some((a) => a.wort === "Maus")).toBe(true);
    expect(K1_DEUTSCH_DATEN.k1anlaut.hard.some((a) => a.wort === "Zebra")).toBe(true);
  });
});

describe("k1laute – Laute hören", () => {
  const ORTE = ["am Anfang", "in der Mitte", "am Ende"];

  it("„Wo hörst du …?“: der Laut steht genau einmal im Wort, die Stelle ist nachgerechnet", () => {
    const wo = alle("k1laute").filter((a) => ORTE.includes(a.r));
    expect(wo.length).toBeGreaterThanOrEqual(16);
    for (const a of wo) {
      const k = a.wort.toLowerCase(), l = a.laut.toLowerCase();
      expect(k.split(l).length - 1, a.f).toBe(1);
      const i = k.indexOf(l);
      const ort = i === 0 ? "am Anfang" : i + l.length === k.length ? "am Ende" : "in der Mitte";
      expect(a.r, a.f).toBe(ort);
      expect([a.r, ...a.x].sort(), a.f).toEqual([...ORTE].sort());
      expect(a.f, a.f).toContain(a.wort);
      expect(a.bild.zeichen, a.f).toBe(WORT.get(a.wort).bild);
    }
    // alle drei Stellen kommen in beiden Stufen vor
    for (const stufe of ["easy", "hard"]) {
      const orte = new Set(K1_DEUTSCH_DATEN.k1laute[stufe].filter((a) => ORTE.includes(a.r)).map((a) => a.r));
      expect(orte.size, stufe).toBe(3);
    }
  });

  it("„In welchem Wort hörst du ein …?“: nur das richtige Wort enthält den Laut", () => {
    const hat = alle("k1laute").filter((a) => a.f.startsWith("In welchem Wort hörst du ein "));
    expect(hat.length).toBeGreaterThanOrEqual(8);
    for (const a of hat) {
      const l = a.laut.toLowerCase();
      // der Laut steht im richtigen Wort frei – nicht nur versteckt in sch, ei, au, ie, eu, st …
      const frei = a.r.toLowerCase().replace(/sch|ch|ei|ie|eu|äu|au|qu|^st|^sp/g, "·");
      expect(frei, a.f).toContain(l);
      for (const x of a.x) expect(x.toLowerCase(), `${a.f}: ${x}`).not.toContain(l);
    }
  });

  it("„Welches Wort fängt genauso an wie …?“: gleicher Anlaut nur bei der richtigen Antwort", () => {
    const wie = alle("k1laute").filter((a) => a.gleicherAnlaut);
    expect(wie.length).toBeGreaterThanOrEqual(8);
    for (const a of wie) {
      expect(a.r, a.f).not.toBe(a.wort);
      expect(anlaut(a.r), a.f).toBe(anlaut(a.wort));
      for (const x of a.x) expect(x[0], `${a.f}: ${x}`).not.toBe(a.wort[0]);
    }
  });

  it("Endlaute: klar hörbares Wortende (kein b/d/g/r am Schluss), Antwort nachgerechnet", () => {
    const ende = alle("k1laute").filter((a) => a.endlaut);
    expect(ende.length).toBeGreaterThanOrEqual(8);
    for (const a of ende) {
      expect(a.wort, a.wort).not.toMatch(/([bdgrß]|ng|ig|e)$/); // Auslautverhärtung, vokalisiertes r, Schwa
      expect(a.r.toLowerCase(), a.wort).toBe(auslaut(a.wort));
      for (const x of a.x) expect(x.toLowerCase(), a.wort).not.toBe(auslaut(a.wort));
    }
    expect(K1_DEUTSCH_DATEN.k1laute.easy.some((a) => a.endlaut)).toBe(false); // Endlaute erst im 2. Halbjahr
  });

  it("Laut in der Mitte: das Wort hat genau einen Selbstlaut – der ist die Antwort", () => {
    const mitte = alle("k1laute").filter((a) => a.inlaut);
    expect(mitte.length).toBeGreaterThanOrEqual(5);
    for (const a of mitte) {
      const vokale = [...a.wort.toLowerCase()].filter(istVokal);
      expect(vokale, a.wort).toHaveLength(1);
      expect(a.r, a.wort).toBe(vokale[0].toUpperCase());
      expect(istVokal(a.wort[0]) || istVokal(a.wort.at(-1)), a.wort).toBe(false);
    }
  });

  it("lange und kurze Selbstlaute: nur eindeutige Wörter, Falschantworten haben die andere Länge", () => {
    const lk = alle("k1laute").filter((a) => a.laenge);
    expect(lk.filter((a) => a.laenge === "lang").length).toBeGreaterThanOrEqual(3);
    expect(lk.filter((a) => a.laenge === "kurz").length).toBeGreaterThanOrEqual(3);
    for (const a of lk) {
      expect(a.f, a.f).toBe(`In welchem Wort klingt das ${a.vokal} ${a.laenge}?`);
      for (const w of [a.r, ...a.x]) expect(w.toLowerCase().split(a.vokal.toLowerCase()).length - 1, `${a.f}: ${w}`).toBe(1);
      expect(laenge(a.r, a.vokal), `${a.f}: ${a.r}`).toBe(a.laenge);
      for (const x of a.x) expect(laenge(x, a.vokal), `${a.f}: ${x}`).not.toBe(a.laenge);
    }
    expect(K1_DEUTSCH_DATEN.k1laute.easy.some((a) => a.laenge)).toBe(false);
  });

  it("Stichproben", () => {
    expect(finde("k1laute", "Wo hörst du das O in Rose?")).toMatchObject({ r: "in der Mitte", x: ["am Anfang", "am Ende"] });
    expect(finde("k1laute", "Wo hörst du den Laut Ei in Papagei?").r).toBe("am Ende");
    expect(finde("k1laute", "Mit welchem Laut hört Fisch auf?")).toMatchObject({ r: "Sch", x: ["F", "S"] });
    expect(finde("k1laute", "Mit welchem Laut hört Kuh auf?").r).toBe("U");
    expect(finde("k1laute", "In welchem Wort hörst du ein O?")).toMatchObject({ r: "Mond", x: ["Mund", "Hund"] });
    expect(finde("k1laute", "In welchem Wort klingt das A lang?").r).toBe("Hase");
  });
});

describe("k1silben – Silben", () => {
  it("„Wie viele Silben hat …?“ stimmt mit der Wortliste überein, Antworten sind „1“ bis „4“", () => {
    const zahl = alle("k1silben").filter((a) => a.silbenzahl);
    expect(zahl.length).toBeGreaterThanOrEqual(20);
    for (const a of zahl) {
      const e = WORT.get(a.wort);
      expect(a.f, a.wort).toBe(`Wie viele Silben hat ${a.wort}?`);
      expect(a.r, a.wort).toBe(String(e.silben.length));
      for (const antwort of [a.r, ...a.x]) expect(["1", "2", "3", "4"], a.wort).toContain(antwort);
      expect(a.bild.zeichen, a.wort).toBe(e.bild);
    }
    for (const a of K1_DEUTSCH_DATEN.k1silben.easy.filter((a) => a.silbenzahl)) expect(Number(a.r), a.wort).toBeLessThanOrEqual(3);
    for (const a of K1_DEUTSCH_DATEN.k1silben.hard.filter((a) => a.silbenzahl)) expect(Number(a.r), a.wort).toBeGreaterThanOrEqual(3);
    expect(K1_DEUTSCH_DATEN.k1silben.hard.filter((a) => a.silbenzahl && a.r === "4").length).toBeGreaterThanOrEqual(3);
  });

  it("„Welche Silbe fehlt?“: Lücke + richtige Silbe ergibt das Wort, die falschen Silben ergeben kein Bild-Wort", () => {
    const fehlt = alle("k1silben").filter((a) => a.luecke !== undefined);
    expect(fehlt.length).toBeGreaterThanOrEqual(16);
    for (const a of fehlt) {
      const e = WORT.get(a.wort);
      const muster = a.f.replace("Welche Silbe fehlt? ", "");
      expect(muster.split("-"), a.f).toHaveLength(e.silben.length);
      expect(muster.split("-")[a.luecke], a.f).toBe("__");
      expect(a.r, a.f).toBe(e.silben[a.luecke]);
      expect(muster.replace("__", a.r).replaceAll("-", ""), a.f).toBe(a.wort);
      for (const x of a.x) {
        const falsch = muster.replace("__", x).replaceAll("-", "");
        expect(WORT.has(falsch), `${a.f} + ${x} = ${falsch}`).toBe(false);
        expect(/^[A-ZÄÖÜ]/.test(x), `${a.f}: ${x}`).toBe(a.luecke === 0); // vorne groß, sonst klein
        expect(e.silben.length > 1 && x !== a.r, a.f).toBe(true);
      }
      expect(a.sprich, a.f).toContain(a.wort);
      const ort = a.luecke === 0 ? "am Anfang" : a.luecke === e.silben.length - 1 ? "am Ende" : "in der Mitte";
      expect(a.sprich, a.f).toContain(ort);
    }
    // 1. Halbjahr: Lücke nur am Rand; 2. Halbjahr: auch mitten im Wort
    for (const a of K1_DEUTSCH_DATEN.k1silben.easy.filter((a) => a.luecke !== undefined)) expect(a.sprich, a.f).not.toContain("in der Mitte");
    expect(K1_DEUTSCH_DATEN.k1silben.hard.some((a) => a.sprich.includes("in der Mitte"))).toBe(true);
  });

  it("Silben zusammensetzen: „To + ma + te = ?“ ergibt genau das Wort, Falschantworten sehen ähnlich aus", () => {
    const bau = alle("k1silben").filter((a) => a.bauen);
    expect(bau.length).toBeGreaterThanOrEqual(6);
    for (const a of bau) {
      const e = WORT.get(a.wort);
      expect(a.f, a.wort).toBe(`${e.silben.join(" + ")} = ?`);
      expect(a.r, a.wort).toBe(e.silben.join(""));
      expect(e.silben.length, a.wort).toBeGreaterThanOrEqual(3);
      expect(a.sprich, a.wort).toBe(`${e.silben.join(", ")}. Welches Wort wird daraus?`);
      expect(a.bild, a.wort).toBeUndefined(); // ohne Bild – sonst müsste man nicht lesen
      for (const x of a.x) expect(aehnlich(a.r, x), `${a.r} / ${x}`).toBe(true);
    }
    expect(K1_DEUTSCH_DATEN.k1silben.easy.some((a) => a.bauen)).toBe(false);
  });

  it("„Welches Wort hat … Silben?“: nur die richtige Antwort hat die gefragte Silbenzahl", () => {
    const welches = alle("k1silben").filter((a) => a.anzahl);
    expect(welches.map((a) => a.anzahl).sort()).toEqual([1, 2, 3, 4]);
    for (const a of welches) {
      expect(WORT.get(a.r).silben.length, a.f).toBe(a.anzahl);
      for (const x of a.x) expect(WORT.get(x).silben.length, `${a.f}: ${x}`).not.toBe(a.anzahl);
    }
  });

  it("Stichproben", () => {
    expect(finde("k1silben", "Wie viele Silben hat Banane?")).toMatchObject({ r: "3", x: ["2", "4"] });
    expect(finde("k1silben", "Wie viele Silben hat Schokolade?").r).toBe("4");
    expect(finde("k1silben", "Welche Silbe fehlt? Ba-na-__")).toMatchObject({ r: "ne", sprich: "Das Wort heißt Banane. Welche Silbe fehlt am Ende?" });
    expect(finde("k1silben", "To + ma + te = ?")).toMatchObject({ r: "Tomate", sprich: "To, ma, te. Welches Wort wird daraus?" });
    expect(finde("k1silben", "Welches Wort hat 1 Silbe?").r).toBe("Schwein");
  });
});

describe("k1reime – Reime", () => {
  it("Reimfamilien: alle Wörter enden gleich ab dem Selbstlaut, kein Wort steht doppelt", () => {
    const gesehen = new Set();
    for (const fam of K1_REIMFAMILIEN) {
      expect(fam.woerter.length, fam.endung).toBeGreaterThanOrEqual(2);
      expect(istVokal(fam.endung[0]), fam.endung).toBe(true);
      for (const w of fam.woerter) {
        const k = w.toLowerCase();
        expect(k.endsWith(fam.endung), `${w} / ${fam.endung}`).toBe(true);
        expect(istVokal(k[k.length - fam.endung.length - 1]), `${w} / ${fam.endung}`).toBe(false);
        expect(gesehen.has(w), w).toBe(false);
        gesehen.add(w);
      }
    }
  });

  it("„Was reimt sich auf …?“: die richtige Antwort reimt sich, die falschen nicht (auch nicht nur dem Klang nach)", () => {
    const auf = alle("k1reime").filter((a) => a.reim.auf);
    expect(auf.length).toBeGreaterThanOrEqual(36);
    for (const a of auf) {
      const fam = familie(a.reim.auf);
      expect(fam, a.f).toBeTruthy();
      expect(fam.woerter, a.f).toContain(a.r);
      expect(a.r, a.f).not.toBe(a.reim.auf);
      expect(reimtAuf(a.r, fam.endung), a.f).toBe(true);
      for (const x of a.x) expect(reimtAuf(x, fam.endung), `${a.f}: ${x}`).toBe(false);
      expect(a.sprich, a.f).toContain(a.reim.auf);
      if (a.bild) expect(a.bild.zeichen, a.f).toBe(WORT.get(a.reim.auf).bild);
    }
  });

  it("easy: einfache Reimwort-Frage; hard: Reimpaare im Satz und „reimt sich NICHT“", () => {
    for (const a of K1_DEUTSCH_DATEN.k1reime.easy) expect(a.f, a.f).toBe(`Was reimt sich auf ${a.reim.auf}?`);
    const verse = K1_DEUTSCH_DATEN.k1reime.hard.filter((a) => a.reim.auf);
    const nicht = K1_DEUTSCH_DATEN.k1reime.hard.filter((a) => a.reim.nicht);
    expect(verse.length).toBeGreaterThanOrEqual(8);
    expect(nicht.length).toBeGreaterThanOrEqual(8);
    for (const a of verse) {
      expect(a.f, a.f).toMatch(/^Was reimt sich\? .+ __\.$/);
      expect(a.f, a.f).toContain(a.reim.auf);
      expect(a.sprich, a.f).toBe(`${a.f.slice("Was reimt sich? ".length, -" __.".length)} … Welches Wort reimt sich auf ${a.reim.auf}?`);
    }
    for (const a of nicht) {
      const [p, q] = a.x;
      const fam = familie(p);
      expect(fam && fam.woerter.includes(q), a.f).toBe(true);
      expect(reimtAuf(a.r, fam.endung), a.f).toBe(false);
      const genannt = a.f.split(":")[0].split(", ");
      expect([...genannt].sort(), a.f).toEqual([a.r, p, q].sort());
      expect(aehnlich(a.r, p) || aehnlich(a.r, q), a.f).toBe(true); // das Kuckucksei sieht ähnlich aus
    }
    // das Wort, das sich nicht reimt, steht nicht immer an derselben Stelle
    const stellen = new Set(nicht.map((a) => a.f.split(":")[0].split(", ").indexOf(a.r)));
    expect(stellen.size).toBe(3);
  });

  it("Stichproben", () => {
    expect(finde("k1reime", "Was reimt sich auf Haus?")).toMatchObject({ r: "Maus", x: ["Hand", "Hut"], bild: { art: "emoji", zeichen: "🏠", anzahl: 1 } });
    expect(finde("k1reime", "Was reimt sich auf Ei?").r).toBe("zwei");
    expect(finde("k1reime", "Was reimt sich? Die Maus wohnt im __.")).toMatchObject({ r: "Haus", x: ["Loch", "Nest"] });
    expect(finde("k1reime", "Hose, Rose, Hase: Welches Wort reimt sich nicht?").r).toBe("Hase");
    // der Klang-Prüfer selbst erkennt Reime, die anders geschrieben sind
    expect(reimtAuf("Boot", "ot")).toBe(true);
    expect(reimtAuf("bunt", "und")).toBe(true);
    expect(reimtAuf("Haut", "ut")).toBe(false);
  });
});

describe("k1lesen – Wörter erlesen", () => {
  const SCHWER = /sch|ch|ei|au|ie|eu|^st|^sp|z|ö|ü|ck|pf|ah|uh/i;

  it("das richtige Wort gehört zum Bild, der Vorlesetext verrät es nicht", () => {
    for (const a of alle("k1lesen")) {
      const e = WORT.get(a.r);
      expect(e, a.r).toBeTruthy();
      expect(a.bild, a.r).toEqual({ art: "emoji", zeichen: e.bild, anzahl: 1 });
      expect(a.f, a.r).toBe("Welches Wort passt zum Bild?");
      expect(a.sprich, a.r).toBe("Welches Wort passt zum Bild?");
      for (const x of a.x) {
        expect(x, a.r).toMatch(/^[A-ZÄÖÜ][a-zäöüß]+$/); // Nomen, groß geschrieben
        expect(aehnlich(a.r, x), `${a.r} / ${x}`).toBe(true); // ähnliches Wortbild
        expect(klang(x), `${a.r} / ${x}`).not.toBe(klang(a.r)); // keine gleich klingenden Wörter (Wal/Wahl)
      }
    }
  });

  it("easy: kurze lautgetreue Wörter; hard: länger oder mit Sch/ch/ei/au/ie …", () => {
    for (const a of K1_DEUTSCH_DATEN.k1lesen.easy) {
      expect(a.r.length, a.r).toBeLessThanOrEqual(6);
      expect(a.r, a.r).not.toMatch(/sch|ch|ei|au|ie|eu|ä|ö|ü|ß|ck|tz|pf|qu|v|x|y/i);
    }
    for (const a of K1_DEUTSCH_DATEN.k1lesen.hard) {
      expect(a.r.length >= 7 || SCHWER.test(a.r), a.r).toBe(true);
    }
    for (const laut of ["Sch", "ch", "ei", "au", "ie"]) {
      expect(K1_DEUTSCH_DATEN.k1lesen.hard.some((a) => a.r.includes(laut)), laut).toBe(true);
    }
  });

  it("Stichproben", () => {
    const von = (w) => alle("k1lesen").find((a) => a.r === w);
    expect(von("Fisch").x).toEqual(["Tisch", "Frosch"]);
    expect(von("Oma").x).toEqual(["Opa", "Mama"]);
    expect(von("Biene").x).toEqual(["Beine", "Birne"]);
    expect(von("Fisch").tipp).toBe("Lies Laut für Laut und zieh die Laute zusammen: F-i-sch.");
    expect(K1_DEUTSCH_DATEN.k1lesen.easy.some((a) => a.r === "Sofa")).toBe(true);
    expect(K1_DEUTSCH_DATEN.k1lesen.hard.some((a) => a.r === "Schokolade")).toBe(true);
  });
});

describe("k1saetze – Erste Sätze", () => {
  const NAMEN = ["Mia", "Ben", "Lena", "Tom", "Ali", "Emma", "Noah", "Ida"];
  const ANFAENGE = ["Der", "Die", "Das", "Da", "Ich", "Wir", "Wo", "Oma", "Opa", "Papa", ...NAMEN];
  const ZAHLWORT = { 2: "zwei", 3: "drei", 4: "vier" };
  const ohneUmlaut = (s) => s.toLowerCase().replace(/ä/g, "a").replace(/ö/g, "o").replace(/ü/g, "u");
  const fehlerArt = (r, x) => {
    if (x === r[0].toLowerCase() + r.slice(1)) return "anfang";
    if (x === r.slice(0, -1)) return "punkt";
    const stellen = [...r].map((z, i) => i).filter((i) => r[i] !== x[i]);
    if (x.length === r.length && stellen.length === 1 && stellen[0] > 0 && x[stellen[0]] === r[stellen[0]].toLowerCase()) return "nomen";
    return null;
  };

  it("alle Sätze: höchstens 5 Wörter und 28 Zeichen, Satzanfang aus der erlaubten Liste (Namen nur fiktive)", () => {
    for (const a of alle("k1saetze")) {
      for (const s of [a.r, ...a.x]) {
        expect(s.length, s).toBeLessThanOrEqual(28);
        expect(s.split(" ").length, s).toBeLessThanOrEqual(5);
        expect(s.split(" ").length, s).toBeGreaterThanOrEqual(3);
        const erstes = s.split(" ")[0];
        expect(ANFAENGE.map((w) => w.toLowerCase()), s).toContain(erstes.toLowerCase());
      }
      expect(a.r, a.r).toMatch(/^[A-ZÄÖÜ].*[.?]$/);
      expect(a.sprich, a.r).toBe(a.f); // verrät weder das Bild noch den Satz
    }
  });

  it("„Welcher Satz passt zum Bild?“: nur der richtige Satz nennt, was das Bild zeigt", () => {
    const bild = alle("k1saetze").filter((a) => a.satz === "bild");
    expect(bild.length).toBeGreaterThanOrEqual(40);
    for (const a of bild) {
      expect(a.f, a.r).toBe("Welcher Satz passt zum Bild?");
      const e = NACH_BILD.get(a.bild.zeichen);
      const stamm = ohneUmlaut(e.w).slice(0, -1);
      expect(ohneUmlaut(a.r), a.r).toContain(stamm);
      // … und zwar groß geschrieben (Nomen!) – auch in der Mehrzahl mit Umlaut („Äpfel“)
      expect(a.r.replace(/Ä/g, "A").replace(/Ö/g, "O").replace(/Ü/g, "U"), a.r).toContain(e.w.slice(0, -1));
      for (const x of a.x) expect(x, a.r).toMatch(/^[A-ZÄÖÜ].*\.$/); // falsch ist hier nur der Inhalt, nie die Schreibung
      if (a.bild.anzahl > 1) {
        expect(a.r, a.r).toContain(ZAHLWORT[a.bild.anzahl]);
        for (const x of a.x) expect(x.includes(ZAHLWORT[a.bild.anzahl]) && ohneUmlaut(x).includes(stamm), x).toBe(false);
      } else {
        expect(a.r, a.r).not.toMatch(/zwei|drei|vier/);
      }
    }
    expect(bild.filter((a) => a.bild.anzahl > 1).length).toBeGreaterThanOrEqual(4);
  });

  it("„Welcher Satz ist richtig geschrieben?“: jede Falschantwort hat genau EINEN Fehler, zwei verschiedene Arten", () => {
    const schreibung = alle("k1saetze").filter((a) => a.satz === "schreibung");
    expect(schreibung.length).toBeGreaterThanOrEqual(10);
    const arten = new Set();
    for (const a of schreibung) {
      expect(a.f, a.r).toBe("Welcher Satz ist richtig geschrieben?");
      const gefunden = a.x.map((x) => fehlerArt(a.r, x));
      expect(gefunden, a.r).not.toContain(null);
      expect(new Set(gefunden).size, a.r).toBe(2);
      expect(gefunden, a.r).toEqual(a.fehler);
      gefunden.forEach((art) => arten.add(art));
      // das Bild-Wort steht groß im richtigen Satz
      expect(a.r, a.r).toContain(NACH_BILD.get(a.bild.zeichen).w);
    }
    expect([...arten].sort()).toEqual(["anfang", "nomen", "punkt"]);
    expect(K1_DEUTSCH_DATEN.k1saetze.easy.some((a) => a.satz === "schreibung")).toBe(false); // erst im 2. Halbjahr
  });

  it("Stichproben", () => {
    const bildSatz = (r) => alle("k1saetze").find((a) => a.satz === "bild" && a.r === r);
    expect(bildSatz("Der Hund bellt.")).toMatchObject({ x: ["Die Hand winkt.", "Der Mund lacht."], bild: { art: "emoji", zeichen: "🐶", anzahl: 1 } });
    expect(bildSatz("Da sind drei Äpfel.").bild).toEqual({ art: "emoji", zeichen: "🍎", anzahl: 3 });
    expect(bildSatz("Die Banane ist gelb.").x).toEqual(["Die Banane ist blau.", "Die Banane ist rot."]);
    const schreib = (r) => alle("k1saetze").find((a) => a.satz === "schreibung" && a.r === r);
    expect(schreib("Der Hund bellt.").x).toEqual(["der Hund bellt.", "Der hund bellt."]);
    expect(schreib("Die Katze schläft.").x).toEqual(["Die Katze schläft", "die Katze schläft."]);
    expect(schreib("Wo ist mein Schuh?").x).toEqual(["wo ist mein Schuh?", "Wo ist mein schuh?"]);
  });
});
