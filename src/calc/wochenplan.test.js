import { describe, it, expect } from "vitest";
import {
  BAUSTEINE, TERMIN_ARTEN, FESTE_TERMINE_STANDARD, festerTermin,
  kalenderWoche, routineAusPlan, routineAnwenden, schulStunden, schulFaecher,
  wochenMontag, tagDatum, leererPlan, planFuerWoche,
  blockHinzu, blockWeg, blockFertig, tagGeschafft, heuteBelohnt, belohnungEintragen,
  wochenBilanz, termineDerWoche, planPruefung, bausteinInfo,
} from "./wochenplan.js";

describe("wochenplan – Wochen-Rechnung", () => {
  it("wochenMontag und tagDatum über Monats-/Jahresgrenzen", () => {
    expect(wochenMontag("2026-10-08")).toBe("2026-10-05"); // Do → Mo
    expect(wochenMontag("2026-10-05")).toBe("2026-10-05"); // Mo bleibt Mo
    expect(wochenMontag("2026-10-04")).toBe("2026-09-28"); // So → Vorwochen-Mo
    expect(wochenMontag("2026-01-01")).toBe("2025-12-29");
    expect(tagDatum("2026-10-05", 0)).toBe("2026-10-05");
    expect(tagDatum("2026-10-05", 6)).toBe("2026-10-11");
  });

  it("planFuerWoche: alte Woche startet frisch; Alt-Blöcke ohne Slot bekommen freie Stunden", () => {
    const alt = { montag: "2026-09-28", bloecke: [{ id: 1, tag: 0, typ: "lernen" }] };
    expect(planFuerWoche(alt, "2026-10-05").bloecke).toEqual([]);
    expect(planFuerWoche(null, "2026-10-05")).toEqual(leererPlan("2026-10-05"));
    // Plan mit Slots bleibt identisch, Alt-Blöcke werden der Reihe nach einsortiert
    const mitSlots = { montag: "2026-09-28", bloecke: [{ id: 1, tag: 0, slot: 960, typ: "lernen" }] };
    expect(planFuerWoche(mitSlots, "2026-09-28")).toBe(mitSlots);
    const gemischt = { montag: "2026-09-28", bloecke: [
      { id: 1, tag: 0, slot: 0, typ: "lernen" },   // Index-Slot (v0.27) → 14:00
      { id: 2, tag: 0, slot: 15, typ: "konz" },    // Stunden-Slot → 15:00
      { id: 3, tag: 0, typ: "sport" },             // ohne Slot → erster freier Slot
      { id: 4, tag: 5, typ: "freunde" },           // Wochenende → ab 9:00
    ] };
    const norm = planFuerWoche(gemischt, "2026-09-28");
    expect(norm.bloecke.map((b) => b.slot)).toEqual([840, 900, 780, 540]);
  });

  it("blockHinzu/blockWeg: fortlaufende Ids, Unsinn wird ignoriert, mutiert nicht", () => {
    let p = leererPlan("2026-10-05");
    p = blockHinzu(p, 2, "lernen", 840);
    p = blockHinzu(p, 2, "sport", 870);
    expect(p.bloecke.map((b) => b.id)).toEqual([1, 2]);
    expect(blockHinzu(p, 7, "lernen", 840)).toBe(p);  // Tag außerhalb
    expect(blockHinzu(p, 0, "quatsch", 840)).toBe(p); // unbekannter Baustein
    expect(blockHinzu(p, 2, "sport", 840)).toBe(p);   // Slot schon belegt
    expect(blockHinzu(p, 2, "sport", 855)).toBe(p);   // keine krummen Zeiten
    expect(blockHinzu(p, 2, "sport", 540)).toBe(p);   // 9 Uhr gibt es nur am Wochenende
    expect(blockHinzu(p, 5, "sport", 540).bloecke.length).toBe(3); // Samstag ab 9 Uhr ok
    const ohne = blockWeg(p, 1);
    expect(ohne.bloecke.map((b) => b.typ)).toEqual(["sport"]);
    expect(p.bloecke.length).toBe(2); // Original unangetastet
  });

  it("Wächter: zu viele Lernboxen → voll; nur Lernen → einseitig; sonst ok", () => {
    let p = leererPlan("2026-10-05");
    p = blockHinzu(p, 0, "lernen", 840);
    p = blockHinzu(p, 0, "lernen", 870);
    p = blockHinzu(p, 0, "lernen", 900);
    // zeitLimit 20 → höchstens 2 Lernboxen pro Tag
    const voll = planPruefung(p, [], 20);
    expect(voll.maxLern).toBe(2);
    expect(voll.tage[0].status).toBe("voll");
    expect(voll.tage[0].hinweis).toContain("Schieb");
    expect(voll.ok).toBe(false);
    // 2 Lernboxen ohne Ausgleich → einseitig, mit Sport → ok
    let p2 = leererPlan("2026-10-05");
    p2 = blockHinzu(p2, 1, "lernen", 900);
    p2 = blockHinzu(p2, 1, "schrift", 930);
    expect(planPruefung(p2, [], 20).tage[1].status).toBe("einseitig");
    p2 = blockHinzu(p2, 1, "sport", 990);
    const ok = planPruefung(p2, [], 20);
    expect(ok.tage[1]).toMatchObject({ status: "ok", lern: 2, frei: 1, lernMin: 20 });
    expect(ok.ok).toBe(true);
  });

  it("Wächter: vor Klassenarbeit wird Verteilen empfohlen, mit 2 Übungstagen ist Ruhe", () => {
    const termine = [{ id: 1, tag: "2026-10-09", art: "ka", fach: "Mathe" }]; // Freitag
    let p = leererPlan("2026-10-05");
    const leer = planPruefung(p, termine, 20);
    expect(leer.hinweise[0]).toContain("Klassenarbeit");
    expect(leer.hinweise[0]).toContain("2 Tagen");
    p = blockHinzu(p, 1, "lernen", 900); // Dienstag
    expect(planPruefung(p, termine, 20).hinweise[0]).toContain("zweiter Übungstag");
    p = blockHinzu(p, 3, "lernen", 840); // Donnerstag
    const gut = planPruefung(p, termine, 20);
    expect(gut.hinweise).toEqual([]);
  });

  it("Kalenderwoche, Vorplanung der Folgewoche und Wochen-Routine ohne Freunde-Zeit", () => {
    expect(kalenderWoche("2026-10-05")).toBe(41);
    expect(kalenderWoche("2025-12-29")).toBe(1); // ISO: gehört schon zu KW 1/2026
    // Vorplanung wird beim Wochenwechsel zur aktiven Woche
    const alt = {
      montag: "2026-09-28", bloecke: [{ id: 1, tag: 0, slot: 840, typ: "lernen", fertig: true }],
      belohnt: ["2026-09-28"],
      naechste: { montag: "2026-10-05", bloecke: [{ id: 1, tag: 2, slot: 900, typ: "lernen" }] },
    };
    const neu = planFuerWoche(alt, "2026-10-05");
    expect(neu.montag).toBe("2026-10-05");
    expect(neu.bloecke).toEqual([{ id: 1, tag: 2, slot: 900, typ: "lernen" }]);
    expect(neu.belohnt).toEqual([]);
    expect(neu.naechste).toBeNull();
    // Routine: Freunde-Zeit bleibt draußen, Übernehmen füllt nur freie Slots
    let p = leererPlan("2026-10-05");
    p = blockHinzu(p, 1, "lernen", 900);
    p = blockHinzu(p, 2, "freunde", 840);
    const routine = routineAusPlan(p);
    expect(routine).toEqual([{ tag: 1, slot: 900, typ: "lernen" }]);
    let ziel = blockHinzu(leererPlan("2026-10-12"), 1, "sport", 900); // Slot schon belegt
    ziel = routineAnwenden(ziel, routine);
    expect(ziel.bloecke.length).toBe(1); // nichts doppelt gelegt
    const frei = routineAnwenden(leererPlan("2026-10-12"), routine);
    expect(frei.bloecke).toEqual([{ id: 1, tag: 1, slot: 900, typ: "lernen" }]);
  });

  it("Stundenplan: 5 Schultage, saubere Zeiten, Fächerfolge ohne AGs und Dubletten", () => {
    for (let t = 0; t <= 4; t++) {
      expect(schulStunden(t).length).toBeGreaterThanOrEqual(5);
      for (const [von, bis] of schulStunden(t)) {
        expect(von).toBeGreaterThanOrEqual(470); // frühestens 7:50
        expect(bis).toBeGreaterThan(von);
        expect(bis).toBeLessThanOrEqual(780);    // spätestens 13:00
      }
    }
    expect(schulStunden(5)).toEqual([]);
    expect(schulFaecher(0)).toEqual(["Deutsch", "Französisch", "Mathe", "SU"]); // Doppelstunde nur 1×, AG raus
    expect(schulFaecher(3)).toEqual(["Mathe", "KoKo", "KuW"]);
    expect(schulFaecher(4)).toContain("Musik");
    expect(schulFaecher(1).join(" ")).not.toContain("Chor"); // AG ist freiwillig
    expect(schulFaecher(6)).toEqual([]);
  });

  it("Durchführung: abhaken, Tag geschafft, Belohnung nur 1× je Datum, Bilanz", () => {
    let p = leererPlan("2026-10-05");
    p = blockHinzu(p, 3, "lernen", 840);
    p = blockHinzu(p, 3, "schlagzeug", 870);
    expect(tagGeschafft(p, 3)).toBe(false);
    expect(tagGeschafft(p, 0)).toBe(false); // leerer Tag zählt nicht als geschafft
    p = blockFertig(p, 1);
    expect(p.bloecke[0].fertig).toBe(true);
    expect(tagGeschafft(p, 3)).toBe(false);
    p = blockFertig(p, 2);
    expect(tagGeschafft(p, 3)).toBe(true);
    expect(wochenBilanz(p)).toEqual({ gesamt: 2, fertig: 2, lernFertig: 1, alles: true });
    // Belohnung idempotent
    expect(heuteBelohnt(p, "2026-10-08")).toBe(false);
    p = belohnungEintragen(p, "2026-10-08");
    expect(heuteBelohnt(p, "2026-10-08")).toBe(true);
    expect(belohnungEintragen(p, "2026-10-08")).toBe(p);
  });

  it("feste Termine: gültige Slots, Wächter zählt Aktiv-Termine als Ausgleich", () => {
    for (const f of FESTE_TERMINE_STANDARD) {
      expect(f.tag).toBeGreaterThanOrEqual(0); expect(f.tag).toBeLessThanOrEqual(6);
      expect(f.beginn).toBeGreaterThanOrEqual(540); expect(f.beginn).toBeLessThanOrEqual(1110);
      expect(f.beginn % 30).toBe(0);
      expect(f.dauer).toBeGreaterThanOrEqual(30);
      expect(typeof f.aktiv).toBe("boolean");
    }
    expect(festerTermin(FESTE_TERMINE_STANDARD, 0, 1080)?.name).toBe("Bandprobe");
    expect(festerTermin(FESTE_TERMINE_STANDARD, 0, 990)?.name).toBe("Musikalische Spiele"); // 16:30 ist mit abgedeckt
    expect(festerTermin(FESTE_TERMINE_STANDARD, 1, 990)).toBeNull(); // Schlagzeug nur 30 Min
    expect(festerTermin(FESTE_TERMINE_STANDARD, 4, 840)).toBeNull();
    // 2 Lernboxen am Montag: ohne feste Termine „einseitig", MIT Bandprobe & Co. ok
    let p = leererPlan("2026-10-05");
    p = blockHinzu(p, 0, "lernen", 840);
    p = blockHinzu(p, 0, "schrift", 870);
    expect(planPruefung(p, [], 20).tage[0].status).toBe("einseitig");
    expect(planPruefung(p, [], 20, FESTE_TERMINE_STANDARD).tage[0].status).toBe("ok");
  });

  it("termineDerWoche gruppiert nur Termine dieser Woche; Stammdaten vollständig", () => {
    const je = termineDerWoche([
      { id: 1, tag: "2026-10-05", art: "wdw" },
      { id: 2, tag: "2026-10-11", art: "kompass" },
      { id: 3, tag: "2026-10-12", art: "ka" }, // nächste Woche
    ], "2026-10-05");
    expect(je[0].length).toBe(1);
    expect(je[6].length).toBe(1);
    expect(je.flat().length).toBe(2);
    expect(Object.keys(TERMIN_ARTEN)).toEqual(["ka", "kompass", "wdw"]);
    expect(BAUSTEINE.filter((b) => b.lern).map((b) => b.typ)).toEqual(["lernen", "schrift", "konz", "hausaufgaben"]);
    expect(bausteinInfo("unbekannt").lern).toBe(false);
  });
});
