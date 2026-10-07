import { describe, it, expect } from "vitest";
import { importAltdaten, istAltExport } from "./importAltdaten.js";

// Fiktiver Alt-App-Export (Form wie „Lernstand sichern" in v1.86) –
// niemals echte Kind-Daten in Tests.
const HEUTE = "2026-10-07";
const ALT_EXPORT = {
  app: "lernprofi",
  version: "1.86.0",
  exportiert: "2026-10-07T10:00:00.000Z",
  daten: {
    name: "Testkind",
    level: 3,
    thema: "fussball",
    muenzen: 7,
    missionsZiel: 3,
    leseKontrolle: "mix",
    stimmPaket: { geladen: true, aktiv: true },
    ferien: { etappe: 7, fertig: "05.09.2026" },
    progress: {
      subj: { unlocked: 3, runs: 9, crown: true },
      mrechnen: { unlocked: 2, runs: 4, crown: false },
      "gws:dopp": { unlocked: 2, runs: 3, crown: false },
      "gws:ie": { unlocked: 3, runs: 5, crown: false },
      unbekanntesFeld: { unlocked: 2, runs: 1, crown: false },
    },
    lerntage: [
      { t: "2026-10-05", m: "gruen", mi: 4, bo: 1, z: 1 },
      { t: "2026-10-06", m: "gelb", mi: 2, z: 0 },
    ],
    kette: { zahlen: [3, 7, 1], erweitertAm: "2026-10-06", rekord: 6 },
    abcBest: { v2: 0, r2: 3 },
    blitz: { runden: [40, 44], best: 44 },
    mutSatz: { tag: "2026-10-07", idx: 4 },
  },
};

describe("importAltdaten", () => {
  it("erkennt Alt-Exporte und Neubau-Backups auseinander", () => {
    expect(istAltExport(ALT_EXPORT)).toBe(true);
    expect(istAltExport(ALT_EXPORT.daten)).toBe(true);
    expect(istAltExport({ daten: { schemaVersion: 1, lernstand: {} } })).toBe(false);
    expect(istAltExport({})).toBe(false);
  });

  it("übernimmt Name, Münzen, Stufen, Lerntage, Rekorde und Tagesziel", () => {
    const { dokument } = importAltdaten(ALT_EXPORT, HEUTE);
    expect(dokument.schemaVersion).toBe(1);
    expect(dokument.profil.name).toBe("Testkind");
    expect(dokument.profil.klasse).toBe(4);
    expect(dokument.lernstand.muenzen).toBe(7);
    expect(dokument.lernstand.stufen.subj).toEqual({ freigeschaltet: 3, runden: 9, krone: true });
    expect(dokument.lernstand.stufen.mrechnen.freigeschaltet).toBe(2);
    expect(dokument.lernstand.lerntage).toEqual([
      { tag: "2026-10-05", aufgaben: 16, missionen: 4, zielErreicht: true },
      { tag: "2026-10-06", aufgaben: 8, missionen: 2, zielErreicht: false },
    ]);
    expect(dokument.lernstand.rekorde).toEqual({ zahlenkette: 6, blitzlesen: 44 });
    expect(dokument.einstellungen.missionsZiel).toBe(3);
  });

  it("übernimmt Konzentrations-Training und Mut-Satz vollständig", () => {
    const { dokument, bericht } = importAltdaten(ALT_EXPORT, HEUTE);
    expect(dokument.lernstand.konzentration).toEqual({
      kette: { zahlen: [3, 7, 1], erweitertAm: "2026-10-06", rekord: 6 },
      abcBest: { v2: 0, r2: 3 },
      blitz: { runden: [40, 44], best: 44 },
    });
    expect(dokument.lernstand.mutSatz).toEqual({ tag: "2026-10-07", idx: 4 });
    expect(bericht.some((b) => b.feld === "Konzentrations-Training" && b.status === "übernommen")).toBe(true);
    expect(bericht.some((b) => b.feld === "Mut-Satz" && b.status === "übernommen")).toBe(true);
  });

  it("fasst Grundwortschatz-Gruppen zusammen (beste Stufe, Runden summiert)", () => {
    const { dokument } = importAltdaten(ALT_EXPORT, HEUTE);
    expect(dokument.lernstand.stufen.gws).toEqual({ freigeschaltet: 3, runden: 8, krone: false });
  });

  it("verwirft bewusst (Stimme, Ferien, Thema, Lese-Check) und berichtet alles", () => {
    const { dokument, bericht } = importAltdaten(ALT_EXPORT, HEUTE);
    expect("stimmPaket" in dokument).toBe(false);
    expect("ferien" in dokument).toBe(false);
    const verworfen = bericht.filter((b) => b.status === "verworfen").map((b) => b.feld);
    expect(verworfen).toEqual(expect.arrayContaining(["stimmPaket", "ferien", "thema", "leseKontrolle"]));
    expect(bericht.some((b) => b.feld === "Münzen" && b.status === "übernommen")).toBe(true);
    // Unbekannte Progress-Schlüssel landen nicht im Dokument
    expect("unbekanntesFeld" in dokument.lernstand.stufen).toBe(false);
  });

  it("übersteht kaputte Eingaben (leer, Müll) und liefert ein gültiges Dokument", () => {
    for (const roh of [null, {}, { daten: null }, { app: "lernprofi" }, { progress: "quatsch" }]) {
      const { dokument } = importAltdaten(roh, HEUTE);
      expect(dokument.schemaVersion).toBe(1);
      expect(dokument.lernstand.muenzen).toBe(0);
    }
  });
});
