import { describe, it, expect } from "vitest";
import { tageBis, kompassTermine, kompassWochen, KOMPASS_STANDARD, kompassUebernehmen } from "./kompassPlan.js";
import { planFuerWoche, blockHinzu, blockFertig, FESTE_TERMINE_STANDARD, leererPlan, planSchreiben } from "./wochenplan.js";

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

describe("kompassUebernehmen", () => {
  const LEER = { plaene: {} };

  it("Pflicht zuerst: Hausaufgaben + Schlagzeug stehen vor dem Kompass-Thema", () => {
    const wochen = kompassWochen(HEUTE, [], {});
    const erg = kompassUebernehmen(LEER, wochen.slice(0, 1), FESTE_TERMINE_STANDARD);
    const plan = planFuerWoche(erg.doc, wochen[0].montag);
    const mo = plan.bloecke.filter((b) => b.tag === 0).sort((a, b) => a.slot - b.slot);
    expect(mo.map((b) => b.typ)).toEqual(["hausaufgaben", "schlagzeug", "deutsch"]);
    expect(mo[2].notiz).toBe("Lese-Detektiv");
    expect(mo[2].slot).toBeGreaterThan(mo[1].slot); // Thema HINTER der Pflicht
    // Dienstag: die feste Schlagzeug-Stunde zählt – kein Extra-Baustein nötig
    const di = plan.bloecke.filter((b) => b.tag === 1);
    expect(di.some((b) => b.typ === "schlagzeug")).toBe(false);
    expect(di.some((b) => b.typ === "hausaufgaben")).toBe(true);
    const diDeutsch = di.find((b) => b.typ === "deutsch");
    expect(diDeutsch.notiz).toBe("Ableiten & Verlängern");
    expect(diDeutsch.slot).toBeGreaterThanOrEqual(990); // nach der Schlagzeug-Stunde (16:00–16:30)
    expect(erg.eingeplant).toBe(4);

    // Idempotent: zweiter Lauf plant nichts doppelt
    const nochmal = kompassUebernehmen(erg.doc, wochen.slice(0, 1), FESTE_TERMINE_STANDARD);
    expect(nochmal.eingeplant).toBe(0);
  });

  it("Kompass hat Vorrang: ersetzt Freizeit, nie Erledigtes", () => {
    const montag = "2026-10-05";
    let plan = leererPlan(montag);
    plan = blockHinzu(plan, 0, "hausaufgaben", 780);
    plan = blockHinzu(plan, 0, "schlagzeug", 810);
    for (let slot = 840; slot < 1140; slot += 30) plan = blockHinzu(plan, 0, "freunde", slot); // Tag voll
    plan = blockFertig(plan, 3); // 14:00-Freunde ist erledigt → tabu
    const doc = planSchreiben(LEER, plan);
    const erg = kompassUebernehmen(doc, [{ montag, deutsch: ["lesen"], mathe: [] }], []);
    const neu = planFuerWoche(erg.doc, montag);
    expect(erg.ersetzt).toBe(1);
    expect(neu.bloecke.find((b) => b.slot === 840).typ).toBe("freunde");  // fertig bleibt
    const thema = neu.bloecke.find((b) => b.typ === "deutsch");
    expect(thema.slot).toBe(870); // erster ersetzbarer Freizeit-Block danach
    expect(thema.notiz).toBe("Lese-Detektiv");
  });
});
