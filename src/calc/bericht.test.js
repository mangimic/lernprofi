import { describe, it, expect } from "vitest";
import { berichtDaten, isoMinusTage } from "./bericht.js";
import { leeresDokument } from "./migrateData.js";

describe("bericht – anonyme Wochen-Zusammenfassung", () => {
  it("isoMinusTage rechnet über Monatsgrenzen", () => {
    expect(isoMinusTage("2026-10-08", 6)).toBe("2026-10-02");
    expect(isoMinusTage("2026-10-03", 6)).toBe("2026-09-27");
    expect(isoMinusTage("2026-01-02", 6)).toBe("2025-12-27");
  });

  it("nimmt nur die letzten 7 Tage und NIE den Namen mit", () => {
    const d = leeresDokument("2026-09-01");
    d.profil.name = "Geheim";
    d.lernstand.lerntage = [
      { tag: "2026-09-20", aufgaben: 8, missionen: 2, zielErreicht: false },
      { tag: "2026-10-02", aufgaben: 16, missionen: 4, zielErreicht: true, form: "gruen" },
      { tag: "2026-10-08", aufgaben: 12, missionen: 3, zielErreicht: false, form: "rot" },
    ];
    d.lernstand.stufen = {
      faelle: { freigeschaltet: 2, runden: 5, krone: false },
      gk: { freigeschaltet: 1, runden: 0, krone: false }, // noch nichts geübt → fliegt raus
    };
    d.lernstand.fokusRekord = 7;
    d.lernstand.schrift = { reise: [{ tag: "2026-09-20" }, { tag: "2026-10-07" }] };
    d.lernstand.einstufung = { tag: "2026-10-01", ergebnisse: {}, empfehlung: ["faelle"] };
    const b = berichtDaten(d, "2026-10-08");
    expect(b.tage.map((t) => t.tag)).toEqual(["2026-10-02", "2026-10-08"]);
    expect(b.tage[1]).toEqual({ tag: "2026-10-08", aufgaben: 12, missionen: 3, ziel: false, form: "rot" });
    expect(b.stufen).toEqual([{ feld: "faelle", stufe: 2, runden: 5, krone: false }]);
    expect(b.fokusRekord).toBe(7);
    expect(b.geschrieben).toBe(1);
    expect(b.empfehlung).toEqual(["faelle"]);
    expect(JSON.stringify(b)).not.toContain("Geheim");
  });
});
