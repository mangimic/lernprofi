import { describe, it, expect } from "vitest";
import { sucheIndex, suchen, sucheNorm } from "./suche.js";
import { migrateData } from "./migrateData.js";

const HEUTE = "2026-10-12";

describe("suche", () => {
  const daten = migrateData({
    einstellungen: { termine: [{ id: 1, tag: "2026-11-18", art: "kompass", fach: "Deutsch" }] },
    doks: [{ id: "dabc123", name: "Kompass-Heft Mathe.pdf", kategorie: "kompass-mathe", groesse: 5, datum: HEUTE }],
  }, HEUTE);

  it("Index deckt Übungen, Karten, Termine, Dokumente, Seiten ab – Eltern-Einträge nur im Eltern-Modus", () => {
    const kind = sucheIndex(daten, false);
    const eltern = sucheIndex(daten, true);
    expect(kind.length).toBeGreaterThan(100); // ~30 Bereiche + 64 Karten + Seiten …
    expect(eltern.length).toBe(kind.length + 2);
    expect(kind.some((e) => e.titel === "Elternbereich")).toBe(false);
    expect(eltern.some((e) => e.titel === "Elternbereich")).toBe(true);
    expect(kind.some((e) => e.detail.startsWith("Termin"))).toBe(true);
    expect(kind.some((e) => e.titel === "Kompass-Heft Mathe.pdf")).toBe(true);
  });

  it("Normalisierung: wurfel findet Würfel, gross findet Groß & Klein", () => {
    expect(sucheNorm("Würfel")).toBe("wurfel");
    expect(sucheNorm("Groß")).toBe("gross");
    const index = sucheIndex(daten, false);
    const wuerfel = suchen(index, "wurfel");
    expect(wuerfel.length).toBeGreaterThanOrEqual(2); // Karteikarten m8/m16 …
    expect(wuerfel.every((t) => sucheNorm(`${t.titel} ${t.detail}`).includes("wurfel"))).toBe(true);
    expect(suchen(index, "gross")[0].titel).toBe("Groß & Klein");
  });

  it("Rangfolge und Ziel: Titel-Treffer zuerst, Übungen tragen ihr Lernfeld", () => {
    const index = sucheIndex(daten, false);
    const kompass = suchen(index, "kompass");
    expect(kompass[0].rang).toBe(0); // Titel-Treffer vorn
    expect(kompass.some((t) => t.titel === "Kompass-Countdown & Lernplan")).toBe(true);
    expect(kompass.some((t) => t.titel === "Kompass-Test Deutsch")).toBe(true);
    const lesen = suchen(index, "lese detektiv");
    expect(lesen[0].ziel).toEqual({ route: "ueben", feld: "lesen" });
    expect(suchen(index, "")).toEqual([]);
    expect(suchen(index, "gibtsnicht")).toEqual([]);
    expect(suchen(index, "e", 5).length).toBe(5); // Deckel greift
  });
});
