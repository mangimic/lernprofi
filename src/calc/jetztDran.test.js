import { describe, it, expect } from "vitest";
import { jetztDran, feldTitel } from "./jetztDran.js";
import { leeresDokument } from "./migrateData.js";
import { wochenMontag, tagDatum, WOCHENTAGE } from "./wochenplan.js";

// Fiktives Datum (ein Mittwoch) – nie echte Daten des Kindes.
const HEUTE = "2026-01-14";
const montag = wochenMontag(HEUTE);
const idx = WOCHENTAGE.findIndex((_, i) => tagDatum(montag, i) === HEUTE);
const doc = (aenderung = {}) => {
  const d = leeresDokument(HEUTE);
  return { ...d, ...aenderung, lernstand: { ...d.lernstand, ...aenderung.lernstand }, profil: { ...d.profil, ...aenderung.profil } };
};
const block = (id, typ, notiz, fertig, slot) => ({ id, tag: idx, typ, notiz, fertig, slot });

describe("jetztDran – die EINE Handlung der Tagesbühne", () => {
  it("nimmt den ersten offenen Plan-Block von heute (nach Uhrzeit sortiert) und zählt die Blöcke", () => {
    const d = doc({ lernstand: { wochenplan: { montag, bloecke: [
      block("b2", "eigen", "Fußball", false, 990),
      block("b1", "eigen", "Hausaufgaben", true, 840),
      block("b3", "eigen", "Lesen", false, 900),
    ] } } });
    const j = jetztDran(d, HEUTE);
    expect(j.art).toBe("plan");
    expect(j.titel).toBe("Lesen");
    expect(j.blockId).toBe("b3");
    expect(j.untertitel).toContain("15:00 Uhr");
    expect(j.geschafft).toBe(1);
    expect(j.gesamt).toBe(3);
    expect(j.knopf).toBe("Zum Plan"); // eigener Block ohne Lernfeld → in den Plan
  });

  it("ein Kompass-Block kennt sein Lernfeld und springt direkt in die Übung", () => {
    const d = doc({ lernstand: { wochenplan: { montag, bloecke: [block("k", "deutsch", "Grundwortschatz", false, 900)] } } });
    const j = jetztDran(d, HEUTE);
    expect(j.art).toBe("plan");
    expect(j.feld).toBe("gws");
    expect(j.knopf).toBe("Los geht's");
  });

  it("ohne offenen Block: gemessene Einstufung schlägt die Eltern-Schwerpunkte", () => {
    const d = doc({
      lernstand: { einstufung: { tag: HEUTE, ergebnisse: {}, empfehlung: ["dd", "gws"] } },
      profil: { schwerpunkte: ["mathe"] },
    });
    const j = jetztDran(d, HEUTE);
    expect(j.art).toBe("feld");
    expect(j.feld).toBe("dd");
    expect(j.titel).toBe("das oder dass?");
    expect(j.untertitel).toContain("Kennenlern-Runde");
  });

  it("nur Schwerpunkte: erstes Feld des ersten Schwerpunkts", () => {
    const j = jetztDran(doc({ profil: { schwerpunkte: ["mathe"] } }), HEUTE);
    expect(j).toMatchObject({ art: "feld", feld: "mrechnen", titel: "Rechnen" });
  });

  it("ganz ohne Plan und Empfehlung: „Eine Runde üben“ mit Kennzahlen", () => {
    const d = doc({ lernstand: { muenzen: 7, zeit: { tag: HEUTE, sek: 8 * 60 } }, einstellungen: { ...leeresDokument(HEUTE).einstellungen, zeitLimit: 20 } });
    const j = jetztDran(d, HEUTE);
    expect(j.art).toBe("ueben");
    expect(j.muenzen).toBe(7);
    expect(j.zeitFrei).toBe(12);
    expect(j.gesamt).toBe(0);
  });

  it("feldTitel kennt Deutsch, Mathe, Sachkunde und Stark", () => {
    expect(feldTitel("muhr")).toBe("Uhrzeit & Zeitspannen");
    expect(feldTitel("szeit")).toBe("Zeit & Geschichte");
    expect(feldTitel("stark")).toBe("Stark mit Leo");
    expect(feldTitel("quatsch")).toBe("quatsch");
  });
});
