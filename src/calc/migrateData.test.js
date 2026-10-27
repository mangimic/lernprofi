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

  it("interessen: Whitelist aus den Übungs-Welten, eindeutig, höchstens 3", () => {
    const leer = migrateData(null, HEUTE);
    expect(leer.profil.interessen).toEqual([]);
    expect(leer.profil.interessenGefragt).toBe("");
    const d = migrateData({ profil: {
      interessen: ["dinos", "quatsch", "dinos", "weltraum", "gaming", "fussball"],
      interessenGefragt: HEUTE,
    } }, HEUTE);
    expect(d.profil.interessen).toEqual(["dinos", "weltraum", "gaming"]); // ohne Fremdes/Doppeltes, max 3
    expect(d.profil.interessenGefragt).toBe(HEUTE);
    expect(migrateData({ profil: { interessen: "alle", interessenGefragt: 7 } }, HEUTE).profil.interessen).toEqual([]);
    // neue Welten sind gültige Übungs-Welten
    expect(migrateData({ einstellungen: { uebungsThema: "dinos" } }, HEUTE).einstellungen.uebungsThema).toBe("dinos");
    expect(migrateData({ einstellungen: { uebungsThema: "neon" } }, HEUTE).einstellungen.uebungsThema).toBe("alltag");
  });

  it("schwerpunkte und onboardingEltern: Whitelist, Säuberung, Standardwerte", () => {
    const leer = migrateData(null, HEUTE);
    expect(leer.profil.schwerpunkte).toEqual([]);
    expect(leer.profil.onboardingEltern).toBe("");
    const d = migrateData({ profil: {
      schwerpunkte: ["rechtschreiben", "zaubern", "mathe", "rechtschreiben"],
      onboardingEltern: HEUTE,
    } }, HEUTE);
    expect(d.profil.schwerpunkte).toEqual(["rechtschreiben", "mathe"]);
    expect(d.profil.onboardingEltern).toBe(HEUTE);
    expect(migrateData({ profil: { schwerpunkte: "alle", onboardingEltern: 7 } }, HEUTE).profil.schwerpunkte).toEqual([]);
  });

  it("ist verlustfrei: unbekannte Schlüssel bleiben erhalten", () => {
    const d = migrateData({ zukunftsFeld: { a: 1 }, profil: { spitzname: "Blitz" } }, HEUTE);
    expect(d.zukunftsFeld).toEqual({ a: 1 });
    expect(d.profil.spitzname).toBe("Blitz");
  });

  it("konzentration und mutSatz: Standardwerte, Reparatur, Erhalt", () => {
    const leer = migrateData(null, HEUTE);
    expect(leer.lernstand.konzentration).toBe(null);
    expect(leer.lernstand.mutSatz).toEqual({ tag: "", idx: 0 });

    const kaputt = migrateData(
      { lernstand: { konzentration: "quatsch", mutSatz: { tag: 7, idx: 999 } } },
      HEUTE,
    );
    expect(kaputt.lernstand.konzentration).toBe(null);
    expect(kaputt.lernstand.mutSatz).toEqual({ tag: "", idx: 0 });

    const gut = migrateData(
      {
        lernstand: {
          konzentration: { kette: { zahlen: [3, 9], erweitertAm: HEUTE, rekord: 5 }, abcBest: { v2: 0 }, blitz: { runden: [30], best: 30 } },
          mutSatz: { tag: HEUTE, idx: 2 },
        },
      },
      HEUTE,
    );
    expect(gut.lernstand.konzentration.kette.zahlen).toEqual([3, 9]);
    expect(gut.lernstand.mutSatz).toEqual({ tag: HEUTE, idx: 2 });
  });

  it("Plan-Kategorien: kaputte Einträge fliegen raus, gute bleiben", () => {
    const d = migrateData({ einstellungen: { bausteine: {
      aus: ["pfadfinder", 7, "x".repeat(40)],
      namen: { angeln: "  Fliegenfischen  ", sport: "", mathe: 3 },
      eigene: [{ id: 1, name: " Lego-Zeit ", emoji: "🧱" }, { name: "" }, "quatsch", { id: 2, name: "a".repeat(30) }],
    } } }, HEUTE);
    const b = d.einstellungen.bausteine;
    expect(b.aus).toEqual(["pfadfinder", "x".repeat(20)]);
    expect(b.namen).toEqual({ angeln: "Fliegenfischen" });
    expect(b.eigene).toEqual([
      { id: 1, name: "Lego-Zeit", emoji: "🧱" },
      { id: 2, name: "a".repeat(18), emoji: "⭐" },
    ]);
    expect(migrateData({}, HEUTE).einstellungen.bausteine).toEqual({ aus: [], namen: {}, eigene: [] });
  });

  it("📂 doks: nur saubere Einträge, Kategorie-Whitelist, höchstens 60", () => {
    const d = migrateData({ doks: [
      { id: "dabc123", name: "  Kompass Deutsch 2025.pdf  ", kategorie: "kompass-deutsch", groesse: 1234, datum: "2026-10-12" },
      { id: "dxyz999", name: "Zeugnis.pdf", kategorie: "quatsch", groesse: -5 },
      { id: "BÖSE/../x", name: "haxx.pdf", kategorie: "schule" },
      { id: "dok4ohne", name: "", kategorie: "schule" },
      "quatsch",
    ] }, HEUTE);
    expect(d.doks).toEqual([
      { id: "dabc123", name: "Kompass Deutsch 2025.pdf", kategorie: "kompass-deutsch", groesse: 1234, datum: "2026-10-12" },
      { id: "dxyz999", name: "Zeugnis.pdf", kategorie: "sonstiges", groesse: 0, datum: "" },
    ]);
    expect(migrateData({}, HEUTE).doks).toEqual([]);
    const viele = migrateData({ doks: Array.from({ length: 70 }, (_, i) => ({ id: `dok${i}xx`, name: `n${i}` })) }, HEUTE);
    expect(viele.doks.length).toBe(60);
  });

  it("leeresDokument ist bereits migriert", () => {
    const leer = leeresDokument(HEUTE);
    expect(migrateData(leer, HEUTE)).toEqual(leer);
  });
});
