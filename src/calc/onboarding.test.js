import { describe, it, expect } from "vitest";
import { SCHWERPUNKTE, SCHWERPUNKT_KEYS, ZEIT_WAHL, schwerpunktFelder, istEmpfohlen, erstStartLage } from "./onboarding.js";
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

describe("onboarding – geführter Erst-Start (erstStartLage)", () => {
  const profil = (extra = {}) => ({ erstStart: "offen", onboardingEltern: "", interessen: [], interessenGefragt: "", ...extra });
  const lern = (einstufung = null) => ({ einstufung });

  it("ist null, sobald der Erst-Start fertig ist oder das Feld fehlt (Bestandsdaten)", () => {
    expect(erstStartLage(profil({ erstStart: "fertig" }), lern(), true)).toBeNull();
    expect(erstStartLage({ onboardingEltern: "", interessen: [] }, lern(), true)).toBeNull();
  });

  it("Schritt 1 für Eltern, danach Übergabe, dann Welten fürs Kind, Kennenlern-Runde, Abschluss", () => {
    expect(erstStartLage(profil(), lern(), true).schritt).toBe("eltern");
    // Eltern-Fragen beantwortet, noch im Eltern-Modus → Übergabe ans Kind
    expect(erstStartLage(profil({ onboardingEltern: "2026-01-15" }), lern(), true).schritt).toBe("uebergabe");
    // im Kind-Modus geht es direkt mit den Welten weiter
    expect(erstStartLage(profil({ onboardingEltern: "2026-01-15" }), lern(), false).schritt).toBe("welten");
    // Welten gewählt ODER weggeklickt → Kennenlern-Runde
    expect(erstStartLage(profil({ onboardingEltern: "x", interessen: ["dinos"] }), lern(), false).schritt).toBe("kennenlernen");
    expect(erstStartLage(profil({ onboardingEltern: "x", interessenGefragt: "x" }), lern(), false).schritt).toBe("kennenlernen");
    // Einstufung übernommen → Abschluss-Ansicht
    expect(erstStartLage(profil({ onboardingEltern: "x", interessenGefragt: "x" }), lern({ tag: "x" }), false).schritt).toBe("fertig");
  });

  it("Kind entsperrt per PIN, bevor die Eltern dran waren: Welten zuerst, Eltern-Schritt wartet", () => {
    const lage = erstStartLage(profil(), lern(), false);
    expect(lage.schritt).toBe("welten");
    expect(lage.elternWartet).toBe(true);
    // zurück im Eltern-Modus holen die Eltern ihren Schritt nach
    expect(erstStartLage(profil({ interessen: ["dinos"] }), lern(), true).schritt).toBe("eltern");
    expect(erstStartLage(profil(), lern(), true).elternWartet).toBe(false);
  });

  it("erledigt-Flags und Schritt-Nummer fürs Fortschritts-Band (3 Schritte)", () => {
    const lage = erstStartLage(profil({ onboardingEltern: "x", interessen: ["dinos"] }), lern(), false);
    expect(lage.erledigt).toEqual({ eltern: true, welten: true, kennenlernen: false });
    expect(lage.nummer).toBe(3);
    expect(erstStartLage(profil(), lern(), true).nummer).toBe(1);
    expect(erstStartLage(profil({ onboardingEltern: "x" }), lern(), true).nummer).toBe(2); // Übergabe zählt zu Schritt 2
    expect(erstStartLage(profil({ onboardingEltern: "x", interessenGefragt: "x" }), lern({ tag: "x" }), false).nummer).toBe(3);
  });
});
