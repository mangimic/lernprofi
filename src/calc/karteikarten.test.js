import { describe, it, expect } from "vitest";
import { KARTEIKARTEN, kartenSeiten, aktiveKarten } from "./karteikarten.js";

describe("karteikarten", () => {
  it("Kartensatz: 32 Deutsch + 24 Mathe, eindeutige IDs, druckfertige Längen, saubere Sprache", () => {
    expect(KARTEIKARTEN.filter((k) => k.fach === "deutsch").length).toBe(32);
    expect(KARTEIKARTEN.filter((k) => k.fach === "mathe").length).toBe(24);
    expect(new Set(KARTEIKARTEN.map((k) => k.id)).size).toBe(KARTEIKARTEN.length);
    expect(KARTEIKARTEN.length % 4).toBe(0); // volle A4-Blätter
    for (const k of KARTEIKARTEN) {
      expect(k.vs.length, k.vs).toBeLessThanOrEqual(80);
      expect(k.rs.length, k.vs).toBeLessThanOrEqual(45);
      expect(k.merk.length, k.vs).toBeLessThanOrEqual(120);
      if (k.typ === "schreiben") expect(k.vs.startsWith("🔊")).toBe(true);
    }
    expect(/ADHS|Störung|dumm|Versager/i.test(JSON.stringify(KARTEIKARTEN))).toBe(false);
    // 🖼️ Grafik-Lösungen: bekannte Bild-Arten, mindestens 8 Karten illustriert
    const ARTEN = ["strahl", "folge", "mauer", "form", "buchstaben", "kaestchen", "wuerfelturm", "netz", "uhr", "kugeln", "rad", "balken", "striche", "schilder", "stromkreis", "kompassrose", "sonne", "dkarte", "wuerfel", "spielwuerfel", "laengen"];
    const mitBild = KARTEIKARTEN.filter((k) => k.bild);
    expect(mitBild.length).toBeGreaterThanOrEqual(8);
    for (const k of mitBild) expect(ARTEN, k.id).toContain(k.bild.art);
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

import { faelligeKarten, karteWerten, kastenZaehler, istFaellig, RUNDEN_GROESSE } from "./karteikasten.js";

describe("karteikasten (digital, Leitner)", () => {
  const HEUTE = "2026-10-09";
  const MINI = [{ id: "a" }, { id: "b" }, { id: "c" }, { id: "d" }, { id: "e" }, { id: "f" }];

  it("neu = fällig; Fach-Abstände 1/3/7 Tage; heute Geübtes ruht", () => {
    expect(istFaellig({}, "a", HEUTE)).toBe(true);
    expect(istFaellig({ a: { fach: 1, zuletzt: "2026-10-08" } }, "a", HEUTE)).toBe(true);
    expect(istFaellig({ a: { fach: 1, zuletzt: HEUTE } }, "a", HEUTE)).toBe(false);
    expect(istFaellig({ a: { fach: 2, zuletzt: "2026-10-07" } }, "a", HEUTE)).toBe(false); // erst nach 3 Tagen
    expect(istFaellig({ a: { fach: 2, zuletzt: "2026-10-06" } }, "a", HEUTE)).toBe(true);
    expect(istFaellig({ a: { fach: 3, zuletzt: "2026-10-03" } }, "a", HEUTE)).toBe(false);
    expect(istFaellig({ a: { fach: 3, zuletzt: "2026-10-02" } }, "a", HEUTE)).toBe(true);
  });

  it("Runde: höchstens 5 Karten, wackligste (Fach 1) zuerst, deterministisch", () => {
    const stand = { a: { fach: 3, zuletzt: "2026-10-01" }, b: { fach: 2, zuletzt: "2026-10-01" } };
    const runde = faelligeKarten(MINI, stand, HEUTE);
    expect(runde.length).toBe(RUNDEN_GROESSE);
    expect(runde.map((k) => k.id)).toEqual(["c", "d", "e", "f", "b"]); // neue zuerst, dann Fach 2, Fach 3 fliegt raus
  });

  it("Werten: Gewusst wandert vor (max Fach 3), Nochmal zurück in Fach 1", () => {
    let stand = {};
    stand = karteWerten(stand, "a", true, HEUTE);
    expect(stand.a).toEqual({ fach: 2, zuletzt: HEUTE });
    stand = karteWerten(stand, "a", true, HEUTE);
    stand = karteWerten(stand, "a", true, HEUTE);
    expect(stand.a.fach).toBe(3); // Deckel
    stand = karteWerten(stand, "a", false, HEUTE);
    expect(stand.a.fach).toBe(1);
    expect(kastenZaehler(MINI, stand)).toEqual({ 1: 6, 2: 0, 3: 0 });
  });
});

describe("aktiveKarten (Eltern-Kontrolle)", () => {
  it("filtert ausgeblendete, hängt eigene mit e-Prefix an", () => {
    const einst = {
      kartenAus: ["d1", "m1", "e2"],
      eigeneKarten: [
        { id: 1, fach: "deutsch", vs: "Lernwort: Fahrradhelm", rs: "Fahrradhelm", merk: "fahr + Rad + Helm" },
        { id: 2, fach: "mathe", vs: "8 · 8 = ?", rs: "64", merk: "" },
      ],
    };
    const karten = aktiveKarten(einst);
    expect(karten.length).toBe(KARTEIKARTEN.length - 1); // 2 Standard raus, 2 eigene rein, 1 eigene raus
    expect(karten.some((k) => k.id === "d1" || k.id === "m1" || k.id === "e2")).toBe(false);
    const eigene = karten.find((k) => k.id === "e1");
    expect(eigene).toMatchObject({ fach: "deutsch", rs: "Fahrradhelm", eigen: true });
    expect(aktiveKarten({}).length).toBe(KARTEIKARTEN.length); // ohne Einstellungen: alles aktiv
  });
});
