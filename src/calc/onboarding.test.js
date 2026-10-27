import { describe, it, expect } from "vitest";
import { SCHWERPUNKTE, SCHWERPUNKT_KEYS, ZEIT_WAHL, schwerpunktFelder, istEmpfohlen } from "./onboarding.js";
import { DEUTSCH_LISTE } from "./uebenGruppen.js";
import { MATHE_BEREICHE } from "./aufgaben/mathe.js";

describe("onboarding – Eltern-Fragebogen", () => {
  it("jeder Schwerpunkt zeigt auf echte Übungs-Felder, Namen bleiben ermutigend", () => {
    const bekannt = new Set([
      ...DEUTSCH_LISTE.map((b) => b.key),
      ...MATHE_BEREICHE.map((b) => b.key),
      "stark",
    ]);
    for (const s of SCHWERPUNKTE) {
      expect(s.felder.length).toBeGreaterThan(0);
      for (const f of s.felder) expect(bekannt.has(f), `${s.key} → ${f}`).toBe(true);
      expect(/adhs|störung|schwäche|defizit|problem/i.test(s.name)).toBe(false);
    }
    expect(SCHWERPUNKT_KEYS.length).toBe(new Set(SCHWERPUNKT_KEYS).size);
    expect(ZEIT_WAHL).toContain(20); // der bisherige Standard bleibt wählbar
  });

  it("schwerpunktFelder: eindeutig, stabil, ignoriert Unbekanntes", () => {
    expect(schwerpunktFelder(["rechtschreiben", "mathe"])).toEqual(["gws", "hoeren", "doppel", "mrechnen", "mzahlen"]);
    expect(schwerpunktFelder(["quatsch", "lesen", "lesen"])).toEqual(["lesen"]);
    expect(schwerpunktFelder(undefined)).toEqual([]);
  });

  it("istEmpfohlen: die gemessene Einstufung schlägt die geschätzten Schwerpunkte", () => {
    expect(istEmpfohlen("gws", null, ["rechtschreiben"])).toBe(true);
    expect(istEmpfohlen("gws", undefined, [])).toBe(false);
    // sobald eine Einstufung da ist, zählt NUR noch sie
    expect(istEmpfohlen("gws", { empfehlung: ["faelle"] }, ["rechtschreiben"])).toBe(false);
    expect(istEmpfohlen("faelle", { empfehlung: ["faelle"] }, [])).toBe(true);
    expect(istEmpfohlen("stark", null, ["mut"])).toBe(true);
  });
});
