import { describe, it, expect } from "vitest";
import { KARTEIKARTEN, kartenSeiten } from "./karteikarten.js";

describe("karteikarten", () => {
  it("Kartensatz: je 16 Karten pro Fach, druckfertige Längen, saubere Sprache", () => {
    expect(KARTEIKARTEN.filter((k) => k.fach === "deutsch").length).toBe(16);
    expect(KARTEIKARTEN.filter((k) => k.fach === "mathe").length).toBe(16);
    expect(KARTEIKARTEN.length % 4).toBe(0); // volle A4-Blätter
    for (const k of KARTEIKARTEN) {
      expect(k.vs.length, k.vs).toBeLessThanOrEqual(80);
      expect(k.rs.length, k.vs).toBeLessThanOrEqual(45);
      expect(k.merk.length, k.vs).toBeLessThanOrEqual(120);
      if (k.typ === "schreiben") expect(k.vs.startsWith("🔊")).toBe(true);
    }
    expect(/ADHS|Störung|dumm|Versager/i.test(JSON.stringify(KARTEIKARTEN))).toBe(false);
  });

  it("kartenSeiten: Rückseiten je Zeile gespiegelt (beidseitiger Druck, lange Kante)", () => {
    const seiten = kartenSeiten(KARTEIKARTEN);
    expect(seiten.length).toBe(KARTEIKARTEN.length / 4);
    for (const s of seiten) {
      expect(s.hinten[0]).toBe(s.vorne[1]);
      expect(s.hinten[1]).toBe(s.vorne[0]);
      expect(s.hinten[2]).toBe(s.vorne[3]);
      expect(s.hinten[3]).toBe(s.vorne[2]);
    }
    // Rest-Blatt: fehlende Karten werden mit null aufgefüllt
    const rest = kartenSeiten(KARTEIKARTEN.slice(0, 5));
    expect(rest.length).toBe(2);
    expect(rest[1].vorne).toEqual([KARTEIKARTEN[4], null, null, null]);
    expect(rest[1].hinten).toEqual([null, KARTEIKARTEN[4], null, null]);
  });
});
