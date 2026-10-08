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
import { spielStartbar, muenzeEinloesen, blitzFragen, wurfWerten, fischFuerSerie, SEE_WUERFE } from "./spiele.js";

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
      expect(MATHE_DATEN[b.key].easy.length).toBeGreaterThanOrEqual(12);
      expect(MATHE_DATEN[b.key].hard.length).toBeGreaterThanOrEqual(12);
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

describe("spiele", () => {
  it("Münz-Regel: Start nur mit Münze, Besuch kostet genau eine", () => {
    expect(spielStartbar(0)).toBe(false);
    expect(spielStartbar(1)).toBe(true);
    expect(muenzeEinloesen(3)).toBe(2);
    expect(muenzeEinloesen(0)).toBe(0);
  });

  it("Blitz-Fragen: kurz, eindeutige Optionen, deterministisch je Seed, Deutsch+Mathe gemischt", () => {
    const a = blitzFragen(SEE_WUERFE, "test-seed");
    const b = blitzFragen(SEE_WUERFE, "test-seed");
    const c = blitzFragen(SEE_WUERFE, "anderer-seed");
    expect(a.length).toBe(SEE_WUERFE);
    expect(a.map((q) => q.f)).toEqual(b.map((q) => q.f));
    expect(a.map((q) => q.f)).not.toEqual(c.map((q) => q.f));
    expect(a.every((q) => !q.kontext && q.f.length <= 90
      && q.optionen.includes(q.r)
      && q.optionen.every((o) => o.length <= 16)
      && new Set(q.optionen).size === q.optionen.length)).toBe(true);
    // gerade Positionen Deutsch, ungerade Mathe (Mathe: Ziffern in Frage oder Antworten)
    expect(a.filter((_, i) => i % 2 === 1).every((q) => /\d/.test(q.f + q.optionen.join("")))).toBe(true);
  });

  it("See-Abenteuer: Serie macht dicke Fische, Fehler reißt die Serie", () => {
    let s = wurfWerten(null, true);
    s = wurfWerten(s, true);
    expect(s.serie).toBe(2);
    expect(s.fang[1].emoji).toBe("🐠");
    s = wurfWerten(s, false);
    expect(s.serie).toBe(0);
    expect(s.fang[2].punkte).toBe(0);
    for (let i = 0; i < 5; i++) s = wurfWerten(s, true);
    expect(s.fang[s.fang.length - 1].emoji).toBe("🐋");
    expect(fischFuerSerie(1).punkte).toBe(1);
    // Würfe: 1✓(1) 2✓(2) ✗(0) dann Serien 1-5 → 1+2+2+3+4
    expect(s.punkte).toBe(1 + 2 + 0 + 1 + 2 + 2 + 3 + 4);
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

describe("konzentration (Engine-Daten)", () => {
  it("ABC-Folgen stimmen (vorwärts/rückwärts, jeder 2./3.), Pools gesund", async () => {
    const { ABC_STUFEN, abcFolge, BLITZ_TIERE, KETTE_ZIEL, leererKonzStand } = await import("../spiele/konzentration.js");
    expect(KETTE_ZIEL).toBe(7);
    expect(ABC_STUFEN.map((s) => s.id)).toEqual(["v2", "v3", "r2", "r3"]);
    const v2 = abcFolge(ABC_STUFEN[0]);
    expect(v2.slice(0, 4)).toEqual(["A", "C", "E", "G"]);
    expect(v2.length).toBe(13);
    const r3 = abcFolge(ABC_STUFEN[3]);
    expect(r3.slice(0, 3)).toEqual(["Z", "W", "T"]);
    expect(BLITZ_TIERE.length).toBe(80);
    expect(new Set(BLITZ_TIERE).size).toBe(80); // keine Doppelten
    const leer = leererKonzStand();
    expect(leer.kette).toEqual({ zahlen: [], erweitertAm: "", rekord: 0 });
    expect(leer.blitz).toEqual({ runden: [], best: 0 });
  });
});

describe("schachLogik (echte Regeln)", () => {
  it("Startstellung: 20 Züge, kein Schach; Schäfermatt wird als Matt erkannt", async () => {
    const L = await import("../spiele/schachLogik.js");
    const start = L.schFen(L.SCH_START);
    expect(L.schZuege(start).length).toBe(20);
    expect(L.schImSchach(start, true)).toBe(false);
    // Schäfermatt-Stellung: Dame auf f7, von Läufer c4 gedeckt → Schwarz ist matt
    const matt = L.schFen("r1bqkbnr/pppp1Qpp/2n5/4p3/2B1P3/8/PPPP1PPP/RNB1K1NR b KQkq -");
    expect(L.schZuege(matt).length).toBe(0);
    expect(L.schImSchach(matt, false)).toBe(true);
  });

  it("Rochade und en passant sind möglich, Umwandlung macht eine Dame", async () => {
    const L = await import("../spiele/schachLogik.js");
    // Weiß kann kurz rochieren (f1/g1 frei, Turm h1)
    const ro = L.schFen("r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPPBPPP/RNBQK2R w KQkq -");
    const rochade = L.schZuege(ro).find((z) => z.roch === "k");
    expect(rochade).toBeTruthy();
    const nachRo = L.schZug(ro, rochade);
    expect(nachRo.b[L.schFeldIdx("g1")]).toBe("K");
    expect(nachRo.b[L.schFeldIdx("f1")]).toBe("R");
    // En passant: schwarzer Bauer zog gerade d7–d5, weißer Bauer auf e5
    const ep = L.schFen("rnbqkbnr/ppp1pppp/8/3pP3/8/8/PPPP1PPP/RNBQKBNR w KQkq d6");
    const schlag = L.schZuege(ep).find((z) => z.ep);
    expect(schlag).toBeTruthy();
    const nachEp = L.schZug(ep, schlag);
    expect(nachEp.b[L.schFeldIdx("d5")]).toBe(""); // geschlagener Bauer ist weg
    // Umwandlung auf der letzten Reihe
    const umw = L.schFen("8/P7/8/8/8/8/7k/K7 w - -");
    const zuUmw = L.schZuege(umw).find((z) => z.umw);
    expect(L.schZug(umw, zuUmw).b[L.schFeldIdx("a8")]).toBe("Q");
  });

  it("KI liefert immer einen legalen Zug und schlägt eine hängende Dame", async () => {
    const L = await import("../spiele/schachLogik.js");
    // Schwarze Dame hängt auf d4 – die KI (Schwarz am Zug ist hier Weiß dran? Nein: Weiß zieht) muss sie schlagen
    const st = L.schFen("rnb1kbnr/pppppppp/8/8/3q4/4P3/PPPP1PPP/RNBQKBNR w KQkq -");
    for (let i = 0; i < 5; i++) {
      const z = L.schKI(st);
      expect(L.schZuege(st).some((x) => x.von === z.von && x.nach === z.nach)).toBe(true);
      expect(z.nach).toBe(L.schFeldIdx("d4")); // Dame schlagen ist klar der beste Zug
    }
  });

  it("Schach-Daten sind gesund (6 Lektionen, 10 Aufgaben, Züge/Ziele gültig)", async () => {
    const L = await import("../spiele/schachLogik.js");
    const { default: SCHACH } = await import("../spiele/schach.json");
    expect(SCHACH.lektionen.length).toBe(6);
    expect(SCHACH.aufgaben.length).toBe(10);
    // Jede Lektion ist nachspielbar: alle Schritte sind legale Züge
    for (const lek of SCHACH.lektionen) {
      let st = L.schFen(lek.fen || L.SCH_START);
      for (const schritt of lek.schritte) {
        const von = L.schFeldIdx(schritt.zug.slice(0, 2)), nach = L.schFeldIdx(schritt.zug.slice(2, 4));
        const z = L.schZuege(st).find((x) => x.von === von && x.nach === nach);
        expect(z, `${lek.id}: Zug ${schritt.zug} muss legal sein`).toBeTruthy();
        st = L.schZug(st, z);
      }
    }
    // Jede Aufgabe hat gültige FEN, Zielfeld, Tipp und Erfolgstext
    for (const a of SCHACH.aufgaben) {
      expect(L.schFen(a.fen).b.filter(Boolean).length).toBeGreaterThan(2);
      expect(a.ziel).toMatch(/^[a-h][1-8]$/);
      expect(a.tipp.length).toBeGreaterThan(3);
      expect(a.erfolg.length).toBeGreaterThan(3);
    }
  });
});

describe("satzglieder umstellen", () => {
  it("Pool gesund, Satzbau mit großem Anfang und Punkt", async () => {
    const S = await import("./aufgaben/satzglieder.js");
    expect(S.SG_UM_AUFGABEN.length).toBe(9);
    expect(S.SG_UM_AUFGABEN.filter((a) => a.art === "um").length).toBe(5);
    expect(S.SG_UM_AUFGABEN.filter((a) => a.art === "zo").length).toBe(4);
    expect(S.umstellenGesund()).toBe(true);
    const a = S.SG_UM_AUFGABEN[1]; // "tagsüber sitzt der Wasserfrosch …"
    expect(S.umSatzText(a.teile, [0, 1, 2, 3])).toBe("Tagsüber sitzt der Wasserfrosch auf einem Seerosenblatt.");
    expect(S.umSatzText(a.teile, [2, 1, 0, 3])).toBe("Der Wasserfrosch sitzt tagsüber auf einem Seerosenblatt.");
  });

  it("Prüfung: anders als Ausgangssatz UND Prädikat an 2. Stelle", async () => {
    const S = await import("./aufgaben/satzglieder.js");
    const a = S.SG_UM_AUFGABEN[0]; // verb an Index 1
    expect(S.umstellenPruefen(a, [3, 1, 0, 2])).toEqual({ richtig: true, grund: null });
    expect(S.umstellenPruefen(a, [0, 1, 2, 3])).toEqual({ richtig: false, grund: "gleich" });
    expect(S.umstellenPruefen(a, [1, 0, 2, 3])).toEqual({ richtig: false, grund: "verb" });
  });
});

describe("vorgangsbeschreibung (Daten + Logik)", () => {
  it("7 Abläufe gesund (5 Lösungs-Sätze, 5 Schritt-Stichworte, Zuerst/Zum Schluss)", async () => {
    const V = await import("./aufgaben/vorgang.js");
    expect(Object.keys(V.REZEPTE)).toEqual(["waffel", "toast", "flieger", "fahrrad", "angeln", "tennis", "fussball"]);
    expect(V.vorgangGesund()).toBe(true);
    expect(V.KRIT_INHALT.length + V.KRIT_SPRACHE.length + V.KRIT_FORM.length).toBe(12);
    expect(V.zutatenListe(V.REZEPTE.toast)).toEqual(["2 Scheiben Toastbrot", "Butter", "Toaster", "Messer", "Teller"]);
  });

  it("Satzanfang-Logik: Zuerst am Start, Zum Schluss am Ende, Mitte flexibel", async () => {
    const V = await import("./aufgaben/vorgang.js");
    expect(V.anfangRichtig("Zuerst", 0, 5)).toBe(true);
    expect(V.anfangRichtig("Danach", 0, 5)).toBe(false);
    expect(V.anfangRichtig("Zum Schluss", 4, 5)).toBe(true);
    expect(V.anfangRichtig("Nun", 2, 5)).toBe(true);
    expect(V.anfangRichtig("Zum Schluss", 2, 5)).toBe(false);
    expect(V.vgStrip("Zuerst lege ich den Ball hin.")).toBe("lege ich den Ball hin.");
    expect(V.vgStrip("Zum Schluss esse ich den Toast.")).toBe("esse ich den Toast.");
    for (let i = 0; i < 5; i++) {
      const opts = V.anfangOptionen(i);
      expect(opts.length).toBeGreaterThanOrEqual(3);
      expect(opts.some((w) => V.anfangRichtig(w, i, 5))).toBe(true);
      expect(opts.some((w) => !V.anfangRichtig(w, i, 5))).toBe(true);
    }
  });
});

describe("elternWerkzeuge (Zeitlimit, Spiele-Schalter, Gespräche)", () => {
  it("Zeit: Tageswechsel setzt auf 0, abgelaufen/übrig rechnen richtig", async () => {
    const E = await import("./elternWerkzeuge.js");
    expect(E.zeitHeute(null, HEUTE)).toEqual({ tag: HEUTE, sek: 0 });
    expect(E.zeitHeute({ tag: "2026-01-14", sek: 900 }, HEUTE)).toEqual({ tag: HEUTE, sek: 0 });
    expect(E.zeitHeute({ tag: HEUTE, sek: 300 }, HEUTE).sek).toBe(300);
    expect(E.zeitAbgelaufen({ tag: HEUTE, sek: 1200 }, 20, HEUTE)).toBe(true);
    expect(E.zeitAbgelaufen({ tag: HEUTE, sek: 1199 }, 20, HEUTE)).toBe(false);
    expect(E.zeitAbgelaufen({ tag: HEUTE, sek: 99999 }, 0, HEUTE)).toBe(false); // 0 = aus
    expect(E.zeitUebrigMin({ tag: HEUTE, sek: 600 }, 20, HEUTE)).toBe(10);
    expect(E.ZEIT_STUFEN).toEqual([0, 10, 15, 20, 30, 45, 60]);
  });

  it("Spiele-Schalter: Standard an, nur ausdrückliches false blendet aus", async () => {
    const E = await import("./elternWerkzeuge.js");
    expect(E.spielAktiv({}, "see")).toBe(true);
    expect(E.spielAktiv({ spieleAktiv: {} }, "see")).toBe(true);
    expect(E.spielAktiv({ spieleAktiv: { see: false } }, "see")).toBe(false);
    expect(E.spielAktiv({ spieleAktiv: { see: true } }, "see")).toBe(true);
    expect(E.SPIELE_SCHALTER.map((s) => s.id)).toEqual(["see", "blockwelt", "tennis", "fussball", "schach"]);
  });

  it("Gesprächsimpulse: 20 Fragen, Frage des Tages determiniert und täglich anders", async () => {
    const E = await import("./elternWerkzeuge.js");
    expect(E.GESPRAECH_BEREICHE.flatMap((b) => b.fragen).length).toBe(20);
    const a = E.gespraechDesTages("2026-01-15");
    expect(a).toEqual(E.gespraechDesTages("2026-01-15"));
    expect(a.frage).not.toBe(E.gespraechDesTages("2026-01-16").frage);
    expect(a.bereich).toMatch(/Grenzen|Stehauf|Denkweise|Probleme/);
  });

  it("Alt-Übernahme bringt Zeitlimit, Münz-Schalter und Spiele-Schalter mit", async () => {
    const { importAltdaten } = await import("./importAltdaten.js");
    const { dokument, bericht } = importAltdaten(
      { progress: {}, zeitLimit: 30, muenzenAktiv: false, spieleAktiv: { spiel: false, schach: true, tennis: false } },
      HEUTE,
    );
    expect(dokument.einstellungen.zeitLimit).toBe(30);
    expect(dokument.einstellungen.muenzenAktiv).toBe(false);
    expect(dokument.einstellungen.spieleAktiv).toEqual({ see: false, tennis: false });
    expect(bericht.some((b) => b.feld === "Lernzeit-Limit")).toBe(true);
  });
});

describe("tagesform & fokus", () => {
  it("Modus gilt nur heute; rot macht Missionen kürzer, Ziel kleiner", async () => {
    const F = await import("./tagesform.js");
    expect(F.tagesModus({ tag: HEUTE, modus: "rot" }, HEUTE)).toBe("rot");
    expect(F.tagesModus({ tag: "2026-01-14", modus: "rot" }, HEUTE)).toBe("");
    expect(F.tagesformNoetig({ tagesformAktiv: true }, { tag: "", modus: "" }, HEUTE)).toBe(true);
    expect(F.tagesformNoetig({ tagesformAktiv: false }, { tag: "", modus: "" }, HEUTE)).toBe(false);
    expect(F.tagesformNoetig({}, { tag: HEUTE, modus: "" }, HEUTE)).toBe(false); // übersprungen zählt
    expect(F.missionsLaengeHeute("rot")).toBe(3);
    expect(F.missionsLaengeHeute("")).toBe(4);
    expect(F.missionsLaengeHeute("gruen")).toBe(5);
    expect(F.tagesZiel(4, "rot")).toBe(3);
    expect(F.tagesZiel(2, "rot")).toBe(2); // nie unter 2
    expect(F.missionsOpts({ missionsZiel: 4 }, { tag: HEUTE, modus: "rot" }, HEUTE))
      .toEqual({ missionsZiel: 3, missionsLaenge: 3 });
  });

  it("aufgabenZaehlen folgt der Missions-Länge; rundeAbschliessen stoppt Stufen an roten Tagen", async () => {
    const { aufgabenZaehlen: zaehlen } = await import("./lerntage.js");
    const { rundeAbschliessen: abschluss } = await import("./stufen.js");
    const tage = zaehlen([], HEUTE, 9, { missionsZiel: 3, missionsLaenge: 3 });
    expect(tage[0].missionen).toBe(3);
    expect(tage[0].zielErreicht).toBe(true);
    const POOL2 = { easy: [{}], hard: [{}] };
    const rot = abschluss(undefined, { fehler: 0, klasse: 4, pool: POOL2, stufenStopp: true });
    expect(rot.stufeNeu).toBe(false);
    expect(rot.fortschritt.freigeschaltet).toBe(1);
    const normal = abschluss(undefined, { fehler: 0, klasse: 4, pool: POOL2 });
    expect(normal.stufeNeu).toBe(true);
  });

  it("Fokus-Serie wächst nur bei < 90 s Abstand; 9 Pausen-Ideen", async () => {
    const F = await import("./tagesform.js");
    expect(F.fokusSerieWeiter(0, 0, 1000)).toBe(1);
    expect(F.fokusSerieWeiter(3, 10000, 99000)).toBe(4);   // 89 s später
    expect(F.fokusSerieWeiter(3, 10000, 100001)).toBe(1);  // 90 s später: reißt
    expect(F.FOKUS_PAUSEN.length).toBe(9);
    expect(F.PAUSEN_INTERVALLE).toEqual([5, 10, 15]);
    const tage = F.tagesformEintragen([], HEUTE, "gelb");
    expect(tage[0]).toEqual({ tag: HEUTE, aufgaben: 0, missionen: 0, zielErreicht: false, form: "gelb" });
  });
});

describe("zahlenblöcke (Dienes-Material)", () => {
  it("jede Blöcke-Aufgabe mit Zahl-Antwort stimmt mit den Blöcken überein", async () => {
    const { MATHE_DATEN } = await import("./aufgaben/mathe.js");
    const alle = Object.values(MATHE_DATEN).flatMap((p2) => [...p2.easy, ...p2.hard]).filter((a) => a.bloecke);
    expect(alle.length).toBeGreaterThanOrEqual(7);
    for (const a of alle) {
      const b = a.bloecke;
      for (const k of Object.keys(b)) expect(["t", "h", "z", "e"]).toContain(k);
      if (/^\d+$/.test(a.r)) {
        const wert = (b.t || 0) * 1000 + (b.h || 0) * 100 + (b.z || 0) * 10 + (b.e || 0);
        expect(wert, a.f + " / " + a.r).toBe(parseInt(a.r, 10));
      }
    }
  });

  it("Blöcke-Aufgaben bleiben den Übungen vorbehalten (Spiele filtern sie aus)", async () => {
    const { spielMatheFrage } = await import("../spiele/fragen.js");
    for (let i = 0; i < 60; i++) {
      const q = spielMatheFrage(i % 2 === 1);
      expect(q.frage.includes("Blöcke")).toBe(false);
    }
  });
});
