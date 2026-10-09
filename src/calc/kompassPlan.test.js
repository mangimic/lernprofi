import { describe, it, expect } from "vitest";
import { tageBis, kompassTermine, kompassWochen, KOMPASS_STANDARD } from "./kompassPlan.js";

// Fixes Test-Datum: 6 Wochen vor den Kompass-Terminen (fiktive Daten, kein Kind-Bezug).
const HEUTE = "2026-10-09";

describe("kompassPlan", () => {
  it("tageBis zählt volle Tage", () => {
    expect(tageBis(HEUTE, "2026-10-09")).toBe(0);
    expect(tageBis(HEUTE, "2026-11-18")).toBe(40);
    expect(tageBis(HEUTE, "2026-11-19")).toBe(41);
  });

  it("kompassTermine: eingetragene Termine haben Vorrang vor den amtlichen", () => {
    const standard = kompassTermine([], HEUTE);
    expect(standard.map((z) => z.tag)).toEqual(["2026-11-18", "2026-11-19"]);
    expect(standard.every((z) => !z.eingetragen)).toBe(true);
    const eigene = kompassTermine([
      { id: 1, tag: "2026-11-25", art: "kompass", fach: "Deutsch" },
      { id: 2, tag: "2026-09-01", art: "kompass", fach: "Mathe" }, // Vergangenheit fliegt raus
      { id: 3, tag: "2026-11-20", art: "ka", fach: "Mathe" },      // andere Art zählt nicht
    ], HEUTE);
    expect(eigene).toEqual([{ fach: "Deutsch", tag: "2026-11-25", eingetragen: true }]);
    expect(KOMPASS_STANDARD.length).toBe(2);
  });

  it("kompassWochen: 7 Wochen, drei Phasen, Ferien erkannt, Rotation deterministisch", () => {
    const w = kompassWochen(HEUTE, [], {});
    expect(w.length).toBe(7);
    expect(w[0].montag).toBe("2026-10-05");
    expect(w.map((x) => x.phase)).toEqual([
      "grundlagen", "grundlagen", "grundlagen", "grundlagen", "gezielt", "gezielt", "test",
    ]);
    expect(w[3].ferien).toBe(true); // 26.10.–31.10. sind Herbstferien
    expect(w[3].hinweis).toContain("Herbstferien");
    // Rotation: Woche 0 beginnt vorn, Woche 1 dreht weiter – nichts bleibt liegen
    expect(w[0].deutsch).toEqual(["lesen", "strategie"]);
    expect(w[1].deutsch).toEqual(["wortfam", "zusnomen"]);
    expect(w[0].mathe).toEqual(["mrechnen", "mzahlen"]);
    expect(w[1].mathe).toEqual(["mgeo", "mgroessen"]);
    expect(w[6].hinweis).toContain("auffrischen");
  });

  it("gezielte Wochen nehmen die Felder mit den wenigsten Runden", () => {
    const stufen = {
      lesen: { runden: 9 }, strategie: { runden: 9 }, wortfam: { runden: 9 }, zusnomen: { runden: 9 },
      steigern: { runden: 0 }, verbform: { runden: 1 }, gws: { runden: 9 }, zeit: { runden: 9 },
      mrechnen: { runden: 9 }, mzahlen: { runden: 9 }, mgeo: { runden: 0 }, mgroessen: { runden: 9 }, mdaten: { runden: 1 },
    };
    const w = kompassWochen(HEUTE, [], stufen);
    expect(w[4].deutsch).toEqual(["steigern", "verbform"]);
    expect(w[4].mathe).toEqual(["mgeo", "mdaten"]);
  });
});
