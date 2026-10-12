import { describe, it, expect } from "vitest";
import { koennerEinplanen, KOENNER_FELD_NAMEN } from "./koennerPlan.js";
import { feldVonNotiz } from "./kompassPlan.js";
import { MK_DATEN, MK_BEREICHE } from "./aufgaben/mathekoenner.js";
import { MATHE_DATEN, MATHE_BEREICHE } from "./aufgaben/mathe.js";
import { planFuerWoche, blockHinzu, planSchreiben, FESTE_TERMINE_STANDARD } from "./wochenplan.js";

const MONTAG = "2026-10-12"; // Montag → Wochenende 17./18.10.

describe("Mathekönner", () => {
  it("Pools hängen in Mathe, Namen passen in Block-Notizen, Notiz führt zurück zum Feld", () => {
    for (const b of MK_BEREICHE) {
      expect(MATHE_DATEN[b.key]).toBe(MK_DATEN[b.key]);
      expect(MATHE_BEREICHE.some((x) => x.key === b.key)).toBe(true);
      expect(KOENNER_FELD_NAMEN[b.key].length).toBeLessThanOrEqual(24);
      expect(feldVonNotiz(KOENNER_FELD_NAMEN[b.key])).toBe(b.key);
    }
    expect(feldVonNotiz("Lese-Detektiv")).toBe("lesen"); // Kompass bleibt unberührt
  });

  it("plant Sa 1×1 + Rechengeschichten (mit Pause), So Zahlenraum – idempotent", () => {
    const erg = koennerEinplanen(null, MONTAG, FESTE_TERMINE_STANDARD);
    expect(erg.eingeplant).toBe(3);
    expect(erg.montag).toBe(MONTAG);
    const plan = planFuerWoche(erg.doc, MONTAG);
    const sa = plan.bloecke.filter((b) => b.tag === 5).sort((a, b) => a.slot - b.slot);
    const so = plan.bloecke.filter((b) => b.tag === 6);
    expect(sa.map((b) => b.notiz)).toEqual(["1×1-Training", "Rechengeschichten"]);
    expect(sa[1].slot - sa[0].slot).toBeGreaterThanOrEqual(60); // Pause dazwischen
    expect(so.map((b) => b.notiz)).toEqual(["Zahlen bis 10 000"]);
    expect(so[0].typ).toBe("mathe");
    // Zweiter Lauf ändert nichts
    const nochmal = koennerEinplanen(erg.doc, MONTAG, FESTE_TERMINE_STANDARD);
    expect(nochmal.eingeplant).toBe(0);
    expect(nochmal.schonDa).toBe(3);
    expect(planFuerWoche(nochmal.doc, MONTAG).bloecke.length).toBe(3);
  });

  it("belegte Fenster bleiben: Blöcke rutschen nach hinten; Sonntag → nächste Woche", () => {
    // Samstag 9:00 und 9:30 sind schon belegt → 1×1 beginnt erst um 10:00
    let plan = planFuerWoche(null, MONTAG);
    plan = blockHinzu(blockHinzu(plan, 5, "sport", 540), 5, "sport", 570);
    const erg = koennerEinplanen(planSchreiben(null, plan), MONTAG, []);
    const sa = planFuerWoche(erg.doc, MONTAG).bloecke
      .filter((b) => b.tag === 5 && b.typ === "mathe").sort((a, b) => a.slot - b.slot);
    expect(sa[0].slot).toBeGreaterThanOrEqual(600);
    // Am Sonntag gestartet: alles wandert in die Folgewoche
    const spaet = koennerEinplanen(null, "2026-10-18", []);
    expect(spaet.montag).toBe("2026-10-19");
    expect(spaet.eingeplant).toBe(3);
  });
});
