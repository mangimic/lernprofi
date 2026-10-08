import { describe, it, expect } from "vitest";
import {
  BAUSTEINE, TERMIN_ARTEN, FESTE_TERMINE_STANDARD, festerTermin,
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
    const mitSlots = { montag: "2026-09-28", bloecke: [{ id: 1, tag: 0, slot: 2, typ: "lernen" }] };
    expect(planFuerWoche(mitSlots, "2026-09-28")).toBe(mitSlots);
    const gemischt = { montag: "2026-09-28", bloecke: [
      { id: 1, tag: 0, slot: 0, typ: "lernen" },
      { id: 2, tag: 0, typ: "sport" },
      { id: 3, tag: 0, typ: "freunde" },
    ] };
    const norm = planFuerWoche(gemischt, "2026-09-28");
    expect(norm.bloecke.map((b) => b.slot)).toEqual([0, 1, 2]);
  });

  it("blockHinzu/blockWeg: fortlaufende Ids, Unsinn wird ignoriert, mutiert nicht", () => {
    let p = leererPlan("2026-10-05");
    p = blockHinzu(p, 2, "lernen", 0);
    p = blockHinzu(p, 2, "sport", 1);
    expect(p.bloecke.map((b) => b.id)).toEqual([1, 2]);
    expect(blockHinzu(p, 7, "lernen", 0)).toBe(p);  // Tag außerhalb
    expect(blockHinzu(p, 0, "quatsch", 0)).toBe(p); // unbekannter Baustein
    expect(blockHinzu(p, 2, "sport", 0)).toBe(p);   // Stunde schon belegt
    expect(blockHinzu(p, 2, "sport", 5)).toBe(p);   // Stunde außerhalb 14-19
    const ohne = blockWeg(p, 1);
    expect(ohne.bloecke.map((b) => b.typ)).toEqual(["sport"]);
    expect(p.bloecke.length).toBe(2); // Original unangetastet
  });

  it("Wächter: zu viele Lernboxen → voll; nur Lernen → einseitig; sonst ok", () => {
    let p = leererPlan("2026-10-05");
    p = blockHinzu(p, 0, "lernen", 0);
    p = blockHinzu(p, 0, "lernen", 1);
    p = blockHinzu(p, 0, "lernen", 2);
    // zeitLimit 20 → höchstens 2 Lernboxen pro Tag
    const voll = planPruefung(p, [], 20);
    expect(voll.maxLern).toBe(2);
    expect(voll.tage[0].status).toBe("voll");
    expect(voll.tage[0].hinweis).toContain("Schieb");
    expect(voll.ok).toBe(false);
    // 2 Lernboxen ohne Ausgleich → einseitig, mit Sport → ok
    let p2 = leererPlan("2026-10-05");
    p2 = blockHinzu(p2, 1, "lernen", 0);
    p2 = blockHinzu(p2, 1, "schrift", 1);
    expect(planPruefung(p2, [], 20).tage[1].status).toBe("einseitig");
    p2 = blockHinzu(p2, 1, "sport", 2);
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
    p = blockHinzu(p, 1, "lernen", 0); // Dienstag
    expect(planPruefung(p, termine, 20).hinweise[0]).toContain("zweiter Übungstag");
    p = blockHinzu(p, 3, "lernen", 0); // Donnerstag
    const gut = planPruefung(p, termine, 20);
    expect(gut.hinweise).toEqual([]);
  });

  it("Durchführung: abhaken, Tag geschafft, Belohnung nur 1× je Datum, Bilanz", () => {
    let p = leererPlan("2026-10-05");
    p = blockHinzu(p, 3, "lernen", 0);
    p = blockHinzu(p, 3, "schlagzeug", 1);
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
      expect(f.slot).toBeGreaterThanOrEqual(0); expect(f.slot).toBeLessThanOrEqual(4);
      expect(typeof f.aktiv).toBe("boolean");
    }
    expect(festerTermin(FESTE_TERMINE_STANDARD, 0, 4)?.name).toBe("Bandprobe");
    expect(festerTermin(FESTE_TERMINE_STANDARD, 4, 0)).toBeNull();
    // 2 Lernboxen am Montag: ohne feste Termine „einseitig", MIT Bandprobe & Co. ok
    let p = leererPlan("2026-10-05");
    p = blockHinzu(p, 0, "lernen", 0);
    p = blockHinzu(p, 0, "schrift", 1);
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
