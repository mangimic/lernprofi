import { describe, it, expect } from "vitest";
import { rngAusSeed, mischen } from "./rng.js";
import { STUFEN_NAMEN, leererFortschritt, stufenMax, stufenStart, aktiveStufe, rundeAbschliessen, stufenVorgabe } from "./stufen.js";
import { PAKET_GROESSE, paketWaehlen, antwortOptionen, antwortRichtig, poolGesund, stufenListe } from "./aufgabenRunde.js";
import { muenzenNachRunde, aufgabenZaehlen, heutigerTag, lernspur, MISSIONS_LAENGE } from "./lerntage.js";
import { MATHE_DATEN, MATHE_BEREICHE } from "./aufgaben/mathe.js";
import { SACH_DATEN, SACH_BEREICHE } from "./aufgaben/sachkunde.js";
import { GESCH_DATEN, ddPool, doppelPool, DEUTSCH_BEREICHE } from "./aufgaben/deutsch.js";
import { STARK_DATEN, STARK_SAETZE } from "./aufgaben/stark.js";
import { subjektPool, praedikatPool, gkPool } from "./aufgaben/saetze.js";
import { zeitPool, wortartenPool, faellePool, redePool, gwsPool, ZEIT_NAMEN, FALL_NAMEN } from "./aufgaben/deutschKonverter.js";
import { auswahlPruefen, tippenPoolGesund } from "./wortTippen.js";

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

  it("stufenVorgabe: Feld schlägt Global, 0 heißt automatisch", () => {
    const e = { stufenVorgabe: { global: 2, felder: { subj: 1 } } };
    expect(stufenVorgabe(e, "subj")).toBe(1);
    expect(stufenVorgabe(e, "praed")).toBe(2);
    expect(stufenVorgabe({ stufenVorgabe: { global: 0, felder: {} } }, "subj")).toBe(0);
    expect(stufenVorgabe(undefined, "subj")).toBe(0);
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
    const alles = JSON.stringify(MATHE_DATEN) + JSON.stringify(SACH_DATEN)
      + JSON.stringify(GESCH_DATEN) + JSON.stringify(STARK_DATEN)
      + JSON.stringify(ddPool()) + JSON.stringify(doppelPool());
    expect(/ADHS|Störung|unmotiviert|Versager|dumm/i.test(alles)).toBe(false);
  });

  it("Deutsch-Pools: Geschichten-Werkstatt, dass/das und Doppel-Konverter sind gesund", () => {
    expect(DEUTSCH_BEREICHE.map((b) => b.key)).toEqual(["gesch", "dd", "doppel"]);
    expect(poolGesund(GESCH_DATEN)).toBe(true);
    const dd = ddPool();
    expect(poolGesund(dd)).toBe(true);
    expect(dd.easy.length).toBeGreaterThanOrEqual(20);
    // dass/das: Lösung und Alternative sind immer das Gegenpaar
    expect(dd.easy.every((a) => ["das", "dass"].includes(a.r)
      && a.x.length === 1 && a.x[0] === (a.r === "das" ? "dass" : "das")
      && a.f.includes("___"))).toBe(true);
    const dp = doppelPool();
    expect(poolGesund(dp)).toBe(true);
    expect(dp.easy.length).toBeGreaterThanOrEqual(24);
    // Doppel: die richtige Schreibweise ist länger als die falsche (Doppelbuchstabe)
    expect(dp.easy.every((a) => a.r.length === a.x[0].length + 1)).toBe(true);
  });

  it("Stark-mit-Leo-Pool und Mut-Sätze sind vollständig", () => {
    expect(poolGesund(STARK_DATEN)).toBe(true);
    expect(STARK_DATEN.easy.length).toBe(17);
    expect(STARK_DATEN.hard.length).toBe(24);
    expect(STARK_SAETZE.length).toBe(16);
  });
});

describe("wortTippen", () => {
  const AUFGABE = { woerter: ["Der", "Hund", "bellt", "laut."], ziel: [0, 1], frage: "Subjekt?", loesung: "Der Hund", tipp: "Wer oder was?" };

  it("auswahlPruefen erkennt richtig, fehlend und zu viel", () => {
    expect(auswahlPruefen(AUFGABE, [0, 1]).richtig).toBe(true);
    expect(auswahlPruefen(AUFGABE, [1, 0]).richtig).toBe(true); // Reihenfolge egal
    const fehlt = auswahlPruefen(AUFGABE, [0]);
    expect(fehlt.richtig).toBe(false);
    expect(fehlt.fehlend).toEqual([1]);
    const zuViel = auswahlPruefen(AUFGABE, [0, 1, 2]);
    expect(zuViel.richtig).toBe(false);
    expect(zuViel.zuviel).toEqual([2]);
    expect(auswahlPruefen(AUFGABE, []).richtig).toBe(false);
  });

  it("die echten Satz-Pools sind gesund (Ziel-Indizes gültig, Lösungen da)", () => {
    const subj = subjektPool(), praed = praedikatPool(), gk = gkPool();
    expect(tippenPoolGesund(subj)).toBe(true);
    expect(tippenPoolGesund(praed)).toBe(true);
    expect(tippenPoolGesund(gk)).toBe(true);
    expect(subj.easy.length).toBeGreaterThanOrEqual(30);
    expect(subj.hard.length).toBeGreaterThanOrEqual(16);
    expect(praed.hard.length).toBeGreaterThanOrEqual(16);
    expect(gk.easy.length).toBeGreaterThanOrEqual(20);
    // Lösungstext passt zu den Ziel-Wörtern (Stichprobe über alle Subjekte)
    expect(subj.easy.concat(subj.hard).every((a) =>
      a.loesung.toLowerCase().includes(a.woerter[a.ziel[0]].toLowerCase().replace(/[.,!?]/g, "")))).toBe(true);
  });

  it("wörtliche Rede: Tippen-Pool gesund, Lösung = gesprochene Wörter", () => {
    const rede = redePool();
    expect(tippenPoolGesund(rede)).toBe(true);
    expect(rede.easy.length).toBeGreaterThanOrEqual(16);
    expect(rede.hard.length).toBeGreaterThanOrEqual(12);
    expect(rede.easy.every((a) => a.loesung === a.ziel.map((i) => a.woerter[i]).join(" "))).toBe(true);
  });
});

describe("deutschKonverter (MC)", () => {
  it("Zeitformen: easy = Präsens/Präteritum, hard = Perfekt/Futur, Optionen eindeutig", () => {
    const z = zeitPool();
    expect(poolGesund(z)).toBe(true);
    expect(z.easy.every((a) => [ZEIT_NAMEN.praesens, ZEIT_NAMEN.praeteritum].includes(a.r))).toBe(true);
    expect(z.hard.every((a) => [ZEIT_NAMEN.perfekt, ZEIT_NAMEN.futur].includes(a.r))).toBe(true);
    expect(z.easy.concat(z.hard).every((a) => new Set([a.r, ...a.x]).size === 3)).toBe(true);
  });

  it("Wortarten und Fälle: markierte Wörter im Kontext, 3 eindeutige Optionen", () => {
    const w = wortartenPool(), f = faellePool();
    expect(poolGesund(w)).toBe(true);
    expect(poolGesund(f)).toBe(true);
    expect(w.easy.concat(w.hard).every((a) => a.kontext && a.f.includes("„"))).toBe(true);
    expect(f.easy.every((a) => Object.values(FALL_NAMEN).includes(a.r) && a.tipp.includes("Frage"))).toBe(true);
  });

  it("Grundwortschatz: alle 12 Regelgruppen vertreten, Regel steht im Kontext", () => {
    const g = gwsPool();
    expect(poolGesund(g)).toBe(true);
    expect(g.easy.length).toBeGreaterThanOrEqual(80);
    expect(g.hard.length).toBeGreaterThanOrEqual(120);
    expect(g.easy.concat(g.hard).every((a) => a.kontext.includes("Regel:") && !/<[^>]+>/.test(a.kontext + a.tipp))).toBe(true);
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
