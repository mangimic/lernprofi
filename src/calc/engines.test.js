import { describe, it, expect } from "vitest";
import { rngAusSeed, mischen } from "./rng.js";
import { STUFEN_NAMEN, leererFortschritt, stufenMax, stufenStart, aktiveStufe, rundeAbschliessen } from "./stufen.js";
import { PAKET_GROESSE, paketWaehlen, antwortOptionen, antwortRichtig, poolGesund, stufenListe } from "./aufgabenRunde.js";
import { muenzenNachRunde, aufgabenZaehlen, heutigerTag, lernspur, MISSIONS_LAENGE } from "./lerntage.js";
import { MATHE_DATEN, MATHE_BEREICHE } from "./aufgaben/mathe.js";
import { SACH_DATEN, SACH_BEREICHE } from "./aufgaben/sachkunde.js";

// Fiktive Fixtures – niemals echte Daten.
const HEUTE = "2026-01-15";
const POOL = {
  easy: [
    { f: "1+1=?", r: "2", x: ["1", "3"], tipp: "Zähle weiter." },
    { f: "2+2=?", r: "4", x: ["3", "5"], tipp: "Verdopple." },
  ],
  hard: [{ f: "12·12=?", r: "144", x: ["124", "142"], tipp: "12·10 + 12·2." }],
};
const POOL_OHNE_HARD = { easy: POOL.easy, hard: [] };

describe("rng", () => {
  it("gleicher Seed → gleiche Folge, Mischen verändert die Eingabe nicht", () => {
    const a = rngAusSeed("test"), b = rngAusSeed("test");
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
    const liste = [1, 2, 3, 4, 5];
    const gemischt = mischen(liste, rngAusSeed(42));
    expect(liste).toEqual([1, 2, 3, 4, 5]);
    expect(gemischt.slice().sort()).toEqual([1, 2, 3, 4, 5]);
  });
});

describe("stufen", () => {
  it("Max und Start hängen am hard-Pool und der Klasse", () => {
    expect(stufenMax(POOL)).toBe(3);
    expect(stufenMax(POOL_OHNE_HARD)).toBe(2);
    expect(stufenStart(3, POOL)).toBe(1);
    expect(stufenStart(4, POOL)).toBe(2);
    expect(stufenStart(4, POOL_OHNE_HARD)).toBe(1);
  });

  it("fehlerfreie Runde schaltet frei, höchste Stufe gibt die Krone", () => {
    let f = leererFortschritt();
    expect(aktiveStufe(f, 3, POOL)).toBe(1);
    let erg = rundeAbschliessen(f, { fehler: 0, klasse: 3, pool: POOL });
    expect(erg.stufeNeu).toBe(true);
    expect(aktiveStufe(erg.fortschritt, 3, POOL)).toBe(2);
    erg = rundeAbschliessen(erg.fortschritt, { fehler: 2, klasse: 3, pool: POOL });
    expect(erg.stufeNeu).toBe(false); // mit Fehlern keine neue Stufe
    erg = rundeAbschliessen(erg.fortschritt, { fehler: 0, klasse: 3, pool: POOL });
    expect(aktiveStufe(erg.fortschritt, 3, POOL)).toBe(3);
    erg = rundeAbschliessen(erg.fortschritt, { fehler: 0, klasse: 3, pool: POOL });
    expect(erg.krone).toBe(true);
    expect(erg.fortschritt.runden).toBe(4);
  });

  it("Eltern-Vorgabe übersteuert, bleibt aber im Max", () => {
    expect(aktiveStufe(leererFortschritt(), 3, POOL, 3)).toBe(3);
    expect(aktiveStufe(leererFortschritt(), 3, POOL_OHNE_HARD, 3)).toBe(2);
    expect(STUFEN_NAMEN[1]).toBe("Aufwärmen");
  });
});

describe("aufgabenRunde", () => {
  it("Stufe 1 übt easy, Stufe 2 hard; Pakete rotieren", () => {
    expect(stufenListe(POOL, 1)).toBe(POOL.easy);
    expect(stufenListe(POOL, 2)).toBe(POOL.hard);
    const gross = { easy: Array.from({ length: 25 }, (_, i) => ({ f: `A${i}`, r: "r", x: ["a", "b"], tipp: "t" })), hard: [] };
    const r0 = paketWaehlen(gross, 1, 0), r1 = paketWaehlen(gross, 1, 1), r3 = paketWaehlen(gross, 1, 3);
    expect(r0.pakete).toBe(3);
    expect(r0.aufgaben.length).toBe(PAKET_GROESSE);
    expect(r1.paket).toBe(2);
    expect(r3.paket).toBe(1); // rotiert zurück zum Anfang
  });

  it("Optionen enthalten genau die 3 Antworten, Prüfung stimmt", () => {
    const a = POOL.easy[0];
    const o = antwortOptionen(a, rngAusSeed(1));
    expect(o.slice().sort()).toEqual(["1", "2", "3"]);
    expect(antwortRichtig(a, "2")).toBe(true);
    expect(antwortRichtig(a, "3")).toBe(false);
  });

  it("die echten Pools (Mathe 5 · Sachkunde 6) sind gesund", () => {
    expect(MATHE_BEREICHE.length).toBe(5);
    expect(SACH_BEREICHE.length).toBe(6);
    for (const b of MATHE_BEREICHE) expect(poolGesund(MATHE_DATEN[b.key]), b.key).toBe(true);
    for (const b of SACH_BEREICHE) expect(poolGesund(SACH_DATEN[b.key]), b.key).toBe(true);
    for (const b of MATHE_BEREICHE) {
      expect(MATHE_DATEN[b.key].easy.length).toBe(12);
      expect(MATHE_DATEN[b.key].hard.length).toBe(12);
    }
    for (const b of SACH_BEREICHE) {
      expect(SACH_DATEN[b.key].easy.length).toBe(10);
      expect(SACH_DATEN[b.key].hard.length).toBe(10);
    }
  });

  it("keine Beschämungs-/Diagnosesprache in den Pools", () => {
    const alles = JSON.stringify(MATHE_DATEN) + JSON.stringify(SACH_DATEN);
    expect(/ADHS|Störung|unmotiviert|Versager|dumm/i.test(alles)).toBe(false);
  });
});

describe("lerntage", () => {
  it("Runde → Münze; Aufgaben → Missionen → Tagesziel", () => {
    expect(muenzenNachRunde(0)).toBe(1);
    expect(muenzenNachRunde(7)).toBe(8);
    let tage = aufgabenZaehlen([], HEUTE, 3, { missionsZiel: 2 });
    expect(heutigerTag(tage, HEUTE).missionen).toBe(0);
    tage = aufgabenZaehlen(tage, HEUTE, 1, { missionsZiel: 2 });
    expect(heutigerTag(tage, HEUTE).missionen).toBe(1); // 4 Aufgaben = 1 Mission
    tage = aufgabenZaehlen(tage, HEUTE, MISSIONS_LAENGE, { missionsZiel: 2 });
    expect(heutigerTag(tage, HEUTE).zielErreicht).toBe(true);
  });

  it("Lernspur überlebt Wochenenden (Lücke ≤ 3 Tage), reißt bei langer Pause", () => {
    const ziel = (tag) => ({ tag, aufgaben: 16, missionen: 4, zielErreicht: true });
    // Fr + Mo (Lücke 3 Tage) + Di → Spur 3
    const tage = [ziel("2026-01-09"), ziel("2026-01-12"), ziel("2026-01-13")];
    expect(lernspur(tage, "2026-01-13")).toBe(3);
    // 5 Tage nichts → Spur 0
    expect(lernspur(tage, "2026-01-18")).toBe(0);
    // Lücke von 4 Tagen in der Mitte reißt die Kette
    const gerissen = [ziel("2026-01-05"), ziel("2026-01-12"), ziel("2026-01-13")];
    expect(lernspur(gerissen, "2026-01-13")).toBe(2);
    expect(lernspur([], HEUTE)).toBe(0);
  });
});
