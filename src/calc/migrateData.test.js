import { describe, it, expect } from "vitest";
import { migrateData, leeresDokument, SCHEMA_VERSION } from "./migrateData.js";

// Fiktives Test-Datum – niemals echte Daten des Kindes in Tests.
const HEUTE = "2026-01-15";

describe("migrateData", () => {
  it("macht aus nichts ein gültiges Dokument", () => {
    for (const eingabe of [undefined, null, 0, "", [], {}]) {
      const d = migrateData(eingabe, HEUTE);
      expect(d.schemaVersion).toBe(SCHEMA_VERSION);
      expect(d.profil.klasse).toBe(4);
      expect(d.lernstand.muenzen).toBe(0);
      expect(Array.isArray(d.lernstand.lerntage)).toBe(true);
      expect(d.protokoll).toEqual([]);
    }
  });

  it("ist idempotent", () => {
    const einmal = migrateData({ profil: { name: "Kind" } }, HEUTE);
    const zweimal = migrateData(einmal, HEUTE);
    expect(zweimal).toEqual(einmal);
  });

  it("repariert kaputte Werte, behält gute", () => {
    const d = migrateData(
      {
        profil: { name: "Kind", klasse: 99 },
        lernstand: { muenzen: -5, stufen: { subj: { freigeschaltet: 2 } } },
        einstellungen: { thema: "neon" },
      },
      HEUTE,
    );
    expect(d.profil.name).toBe("Kind");
    expect(d.profil.klasse).toBe(4);
    expect(d.lernstand.muenzen).toBe(0);
    expect(d.lernstand.stufen.subj.freigeschaltet).toBe(2);
    expect(d.einstellungen.thema).toBe("hell");
  });

  it("ist verlustfrei: unbekannte Schlüssel bleiben erhalten", () => {
    const d = migrateData({ zukunftsFeld: { a: 1 }, profil: { spitzname: "Blitz" } }, HEUTE);
    expect(d.zukunftsFeld).toEqual({ a: 1 });
    expect(d.profil.spitzname).toBe("Blitz");
  });

  it("leeresDokument ist bereits migriert", () => {
    const leer = leeresDokument(HEUTE);
    expect(migrateData(leer, HEUTE)).toEqual(leer);
  });
});
