import { describe, it, expect } from "vitest";
import { modulAn, routeErlaubt, modulInfo } from "./module.js";
import { leeresDokument, migrateData } from "./migrateData.js";
import { sucheIndex } from "./suche.js";

const HEUTE = "2026-01-14"; // fiktiv
const kern = leeresDokument(HEUTE);
const voll = migrateData({ einstellungen: {} }, HEUTE); // Bestand → alles an

describe("Module – Lern-App-Kern und freigeschaltete Bereiche", () => {
  it("modulAn liest nur echte true-Werte und verträgt kaputte Dokumente", () => {
    expect(modulAn(kern, "plan")).toBe(false);
    expect(modulAn(voll, "plan")).toBe(true);
    expect(modulAn(voll, "quatsch")).toBe(false);
    expect(modulAn(null, "ki")).toBe(false);
    expect(modulAn({ einstellungen: { module: { ki: "ja" } } }, "ki")).toBe(false);
  });

  it("routeErlaubt sperrt Plan, Kompass, Unterlagen, Schrift und Aufsatz im Kern", () => {
    for (const r of ["plan", "kompass", "doks", "schrift", "aufsatz"]) {
      expect(routeErlaubt(r, kern)).toBe(false);
      expect(routeErlaubt(r, voll)).toBe(true);
    }
    for (const r of ["start", "ueben", "spiele", "training", "konz", "sudoku", "kasten", "einstufung", "eltern", "karten"]) {
      expect(routeErlaubt(r, kern)).toBe(true);
    }
    // einzeln schaltbar: nur Schrift an
    const nurSchrift = { einstellungen: { module: { schrift: true } } };
    expect(routeErlaubt("schrift", nurSchrift)).toBe(true);
    expect(routeErlaubt("aufsatz", nurSchrift)).toBe(false);
  });

  it("modulInfo nennt den Stand in einem Satz", () => {
    expect(modulInfo(kern)).toContain("Lern-App-Kern");
    expect(modulInfo(voll)).toBe("Freigeschaltet: Plan · Leo · Schreib-Training");
  });

  it("Suche: Seiten, Termine und Unterlagen abgeschalteter Module fehlen im Kern", () => {
    const mitDaten = (d) => ({
      ...d, doks: [{ id: "dok-1", name: "Heft", kategorie: "schule", groesse: 1, datum: HEUTE }],
      einstellungen: { ...d.einstellungen, termine: [{ id: 1, tag: "2026-02-02", art: "ka", fach: "Mathe" }] },
    });
    const titel = (d) => sucheIndex(mitDaten(d), false).map((e) => e.titel);
    for (const t of ["Mein Wochenplan", "Kompass-Countdown & Lernplan", "Schreib-Training", "Aufsatz-Check", "Unsere Unterlagen", "Heft", "Klassenarbeit Mathe"]) {
      expect(titel(kern)).not.toContain(t);
      expect(titel(voll)).toContain(t);
    }
    for (const t of ["Spielhalle", "Sudoku-Training", "Konzentrations-Training"]) expect(titel(kern)).toContain(t);
  });
});
