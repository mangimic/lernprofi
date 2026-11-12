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

  it("v0.86 Module: neu = Lern-App-Kern, Bestand (Einstellungen ohne Module) = Vollausbau", () => {
    // Neues Dokument und alles ohne Einstellungen: Kern, keine Termine, kein Mittags-Block
    for (const d of [leeresDokument(HEUTE), migrateData(null, HEUTE), migrateData({ profil: { name: "Kind" } }, HEUTE)]) {
      expect(d.einstellungen.module).toEqual({ plan: false, ki: false, schrift: false });
      expect(d.einstellungen.festeTermine).toEqual([]);
      expect(d.einstellungen.schule).toEqual({ tage: [0, 1, 2, 3, 4], von: 470, bis: 780, stunden: {}, mittag: false });
    }
    expect(leeresDokument(HEUTE).schemaVersion).toBe(2);
    // Bestandsfamilie: Termine bleiben, Mittag bleibt, alle Module an
    const termin = { tag: 2, beginn: 900, dauer: 60, name: "Chor", emoji: "🎵", hinweis: "", aktiv: true };
    const bestand = migrateData({ einstellungen: { festeTermine: [termin] } }, HEUTE);
    expect(bestand.einstellungen.module).toEqual({ plan: true, ki: true, schrift: true });
    expect(bestand.einstellungen.schule.mittag).toBe(true);
    expect(bestand.einstellungen.festeTermine.filter((f) => f.name === "Mittag & Spielzeit").length).toBe(7);
    expect(bestand.einstellungen.festeTermine.at(-1)).toEqual(termin);
    expect(migrateData(bestand, HEUTE)).toEqual(bestand); // idempotent, Module bleiben an
    // Uralt-Stand ohne Termin-Liste: nur der Mittags-Block, KEIN fremder Termin
    const uralt = migrateData({ einstellungen: {} }, HEUTE);
    expect(uralt.einstellungen.festeTermine.every((f) => f.name === "Mittag & Spielzeit")).toBe(true);
    expect(uralt.einstellungen.festeTermine.length).toBe(7);
    // Gespeicherte Module zählen genau (nur echte true), Fremdes fliegt raus
    const teil = migrateData({ einstellungen: { module: { plan: true, ki: "ja", quatsch: true } } }, HEUTE);
    expect(teil.einstellungen.module).toEqual({ plan: true, ki: false, schrift: false });
    expect(teil.einstellungen.schule.mittag).toBe(false);
  });

  it("v0.86 Schule: Stundenplan nur im Raster, Fächer gekürzt, AG-Marker bleibt", () => {
    const d = migrateData({ einstellungen: { module: { plan: true }, schule: { mittag: true, stunden: {
      0: [[470, 515, "Deutsch"], [1, 2, "Unfug"], [625, 670, "  Werken  ", true], [515, 560, ""]],
      6: [[470, 515, "Sonntag"]], 1: "kaputt",
    } } } }, HEUTE);
    expect(d.einstellungen.schule.stunden).toEqual({ 0: [[470, 515, "Deutsch"], [625, 670, "Werken", true]] });
    expect(d.einstellungen.schule.mittag).toBe(true);
    expect(d.einstellungen.festeTermine.length).toBe(7);
    expect(migrateData(d, HEUTE)).toEqual(d);
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

  it("erstStart: neues Dokument startet offen, Bestandsdaten ohne das Feld gelten als fertig", () => {
    expect(leeresDokument(HEUTE).profil.erstStart).toBe("offen");
    expect(migrateData(null, HEUTE).profil.erstStart).toBe("offen");
    // Bestandsfamilie: Profil vorhanden, Feld fehlt → den Erst-Start nie zeigen
    expect(migrateData({ profil: { name: "Kind" } }, HEUTE).profil.erstStart).toBe("fertig");
    expect(migrateData({ profil: { erstStart: "offen" } }, HEUTE).profil.erstStart).toBe("offen");
    expect(migrateData({ profil: { erstStart: "fertig" } }, HEUTE).profil.erstStart).toBe("fertig");
    expect(migrateData({ profil: { erstStart: 42 } }, HEUTE).profil.erstStart).toBe("fertig");
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
