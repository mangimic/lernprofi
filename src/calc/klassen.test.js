import { describe, it, expect } from "vitest";
import {
  KLASSEN, KLASSEN_WAEHLBAR, faecherFuerKlasse, bereicheFuerKlasse, feldInKlasse, feldTitel,
  einstufungFelder, einstufungPools, spielQuellen, vorleseModus, klasseWechseln, antwortenVorlesbar,
} from "./klassen.js";
import { schwerpunkteFuerKlasse, schwerpunktFelder, SCHWERPUNKT_KEYS, istEmpfohlen } from "./onboarding.js";
import { einstufungPlan } from "./einstufung.js";
import { jetztDran } from "./jetztDran.js";
import { leeresDokument, migrateData } from "./migrateData.js";
import { poolGesund } from "./aufgabenRunde.js";
import { rngAusSeed } from "./rng.js";
import { sucheIndex } from "./suche.js";

const HEUTE = "2026-01-14"; // fiktiv

describe("Klassenstufen – jede Klasse hat ihre eigene Lernwelt", () => {
  it("jede wählbare Klasse liefert Fächer, und jeder Bereich hat einen gesunden Pool", () => {
    expect(KLASSEN).toEqual([1, 2, 3, 4]);
    for (const klasse of KLASSEN_WAEHLBAR) {
      const faecher = faecherFuerKlasse(klasse, "alltag");
      expect(faecher.map((f) => f.id)).toContain("deutsch");
      expect(faecher.map((f) => f.id)).toContain("mathe");
      expect(faecher.map((f) => f.id)).toContain("stark");
      for (const f of faecher) {
        for (const b of f.bereiche) {
          if (b.typ === "modul") continue;
          expect(f.daten[b.key], `${klasse}/${b.key}`).toBeTruthy();
          if (!b.typ || b.typ === "mc") expect(poolGesund(f.daten[b.key]), `${klasse}/${b.key}`).toBe(true);
        }
        // Gruppen verweisen nur auf vorhandene Bereiche und decken alle ab
        if (f.gruppen) {
          const inGruppen = f.gruppen.flatMap((g) => g.felder);
          for (const key of inGruppen) expect(f.bereiche.some((b) => b.key === key), `${klasse}/Gruppe/${key}`).toBe(true);
          for (const b of f.bereiche) expect(inGruppen, `${klasse}/${b.key} fehlt in den Gruppen`).toContain(b.key);
        }
      }
    }
  });

  it("Klasse 1 hat eigene Felder (kein dass/das, keine Sachkunde), Klasse 4 bleibt wie sie war", () => {
    const k1 = bereicheFuerKlasse(1).map((b) => b.key);
    expect(k1).toEqual(expect.arrayContaining(["k1anlaut", "k1laute", "k1silben", "k1reime", "k1lesen", "k1saetze",
      "k1zahlen", "k1zerlegen", "k1plus", "k1minus", "k1geld", "k1formen", "k1uhr", "stark"]));
    expect(k1).not.toContain("dd");
    expect(faecherFuerKlasse(1).map((f) => f.id)).toEqual(["deutsch", "mathe", "stark"]);
    expect(faecherFuerKlasse(1)[0].welten).toBe(false);
    const k4 = bereicheFuerKlasse(4).map((b) => b.key);
    expect(k4).toEqual(expect.arrayContaining(["dd", "gws", "mrechnen", "muhr", "szeit", "stark"]));
    expect(k4).not.toContain("k1plus");
    expect(bereicheFuerKlasse(3)).toEqual(bereicheFuerKlasse(4));
    // Schlüssel sind über alle Klassen eindeutig (Stufen-Speicher teilt sich einen Namensraum)
    const alle = [...new Set([...k1.filter((k) => k !== "stark"), ...k4])];
    expect(alle.length).toBe(k1.length - 1 + k4.length);
    expect(feldInKlasse("k1plus", 1)).toBe(true);
    expect(feldInKlasse("k1plus", 4)).toBe(false);
    expect(feldInKlasse("stark", 1)).toBe(true);
    expect(feldTitel("k1plus")).toBe("Plus bis 20");
    expect(feldTitel("muhr")).toBe("Uhrzeit & Zeitspannen");
    expect(feldTitel("stark")).toBe("Stark mit Leo");
    expect(feldTitel("quatsch")).toBe("quatsch");
  });

  it("Kennenlern-Runde: 6 Felder je Klasse, jedes gehört zur Klasse und hat einen Pool für den Testplan", () => {
    for (const klasse of KLASSEN_WAEHLBAR) {
      const felder = einstufungFelder(klasse);
      const pools = einstufungPools(klasse);
      expect(felder.length).toBe(6);
      // Klasse 1: 3 Deutsch + 3 Mathe; Klasse 3/4 wie gehabt 4 Deutsch + 2 Mathe
      expect(felder.filter((f) => f.fach === "Deutsch").length).toBe(klasse === 1 ? 3 : 4);
      expect(felder.filter((f) => f.fach === "Mathe").length).toBe(klasse === 1 ? 3 : 2);
      for (const f of felder) {
        expect(feldInKlasse(f.key, klasse), f.key).toBe(true);
        expect(pools[f.key].easy.length, f.key).toBeGreaterThanOrEqual(2);
        expect(f.name).toBeTruthy();
      }
      const plan = einstufungPlan(pools, rngAusSeed(`test:${klasse}`), felder);
      expect(plan.length).toBe(6);
      expect(plan.every((p) => p.easy.length === 2)).toBe(true);
    }
    expect(einstufungFelder(1).map((f) => f.key)).toEqual(["k1anlaut", "k1silben", "k1lesen", "k1zahlen", "k1zerlegen", "k1plus"]);
    expect(einstufungFelder(4).map((f) => f.key)).toEqual(["gws", "dd", "zeit", "faelle", "mrechnen", "mzahlen"]);
  });

  it("Schwerpunkte je Klasse zeigen nur auf Felder dieser Klasse; alle Schlüssel sind migrierbar", () => {
    for (const klasse of KLASSEN_WAEHLBAR) {
      for (const s of schwerpunkteFuerKlasse(klasse)) {
        expect(SCHWERPUNKT_KEYS).toContain(s.key);
        for (const key of s.felder) expect(feldInKlasse(key, klasse), `${klasse}/${s.key}/${key}`).toBe(true);
      }
    }
    expect(schwerpunktFelder(["mathe"], 1)).toEqual(["k1plus", "k1minus"]);
    expect(schwerpunktFelder(["mathe"], 4)).toEqual(["mrechnen", "mzahlen"]);
    expect(schwerpunktFelder(["mathe"])).toEqual(["mrechnen", "mzahlen"]); // Standard bleibt Klasse 4
    expect(schwerpunktFelder(["laute"], 4)).toEqual([]); // Schwerpunkt einer anderen Klasse zählt nicht
    expect(istEmpfohlen("k1anlaut", null, ["laute"], 1)).toBe(true);
    expect(istEmpfohlen("k1anlaut", null, ["laute"], 4)).toBe(false);
    expect(migrateData({ profil: { klasse: 1, schwerpunkte: ["laute", "zahlen", "unfug"] } }, HEUTE).profil.schwerpunkte).toEqual(["laute", "zahlen"]);
  });

  it("Spiel-Fragen: Klasse 1 zieht kurze Aufgaben ohne Bild aus den eigenen Pools, 3/4 bleibt beim Alten", () => {
    expect(spielQuellen(4)).toBeNull();
    expect(spielQuellen(3)).toBeNull();
    const q = spielQuellen(1);
    expect(q.leicht.length).toBeGreaterThanOrEqual(30);
    expect(q.schwer.length).toBeGreaterThanOrEqual(20);
    for (const a of [...q.leicht, ...q.schwer]) {
      expect(a.bild).toBeUndefined();
      expect(a.f.length).toBeLessThanOrEqual(80);
      expect([a.r, ...a.x].every((o) => o.length <= 16)).toBe(true);
      expect(a.x.length).toBe(2);
    }
  });

  it("Vorlesen: Standard je Klasse, die Eltern-Einstellung schlägt ihn", () => {
    expect(vorleseModus({ vorlesen: "" }, 1)).toBe("auto");
    expect(vorleseModus({ vorlesen: "" }, 2)).toBe("knopf");
    expect(vorleseModus({ vorlesen: "" }, 3)).toBe("aus");
    expect(vorleseModus({}, 4)).toBe("aus");
    expect(vorleseModus({ vorlesen: "aus" }, 1)).toBe("aus");
    expect(vorleseModus({ vorlesen: "knopf" }, 4)).toBe("knopf");
    expect(vorleseModus({ vorlesen: "laut" }, 1)).toBe("auto"); // Unbekanntes → Standard
    // Lese-Aufgaben: Antworten werden NICHT vorgelesen (sonst wäre die Aufgabe gelöst)
    expect(antwortenVorlesbar("k1lesen")).toBe(false);
    expect(antwortenVorlesbar("k1saetze")).toBe(false);
    expect(antwortenVorlesbar("k1plus")).toBe(true);
    expect(antwortenVorlesbar("k1reime")).toBe(true);
    expect(migrateData({ einstellungen: { vorlesen: "laut" } }, HEUTE).einstellungen.vorlesen).toBe("");
    expect(migrateData({ einstellungen: { vorlesen: "knopf" } }, HEUTE).einstellungen.vorlesen).toBe("knopf");
  });

  it("Klassenwechsel räumt Kennenlern-Ergebnis und Schwerpunkte, behält Münzen und Stufen – keine fremden Empfehlungen", () => {
    const d = leeresDokument(HEUTE);
    const alt = {
      ...d, profil: { ...d.profil, klasse: 4, schwerpunkte: ["rechtschreiben"] },
      lernstand: { ...d.lernstand, muenzen: 9, stufen: { dd: { freigeschaltet: 2, runden: 3, krone: false } },
        einstufung: { tag: HEUTE, ergebnisse: {}, empfehlung: ["dd", "gws"] } },
    };
    const neu = klasseWechseln(alt, 1);
    expect(neu.profil.klasse).toBe(1);
    expect(neu.profil.schwerpunkte).toEqual([]);
    expect(neu.lernstand.einstufung).toBeNull();
    expect(neu.lernstand.muenzen).toBe(9);
    expect(neu.lernstand.stufen.dd.runden).toBe(3);
    expect(klasseWechseln(alt, 4)).toBe(alt);   // gleiche Klasse: nichts tun
    expect(klasseWechseln(alt, 7)).toBe(alt);   // ungültig: nichts tun
    expect(migrateData({ profil: { klasse: 1 } }, HEUTE).profil.klasse).toBe(1);
    expect(migrateData({ profil: { klasse: 2 } }, HEUTE).profil.klasse).toBe(2);
    expect(migrateData({ profil: { klasse: 5 } }, HEUTE).profil.klasse).toBe(4);
    // Selbst wenn eine alte Empfehlung im Dokument bleibt (z. B. per Import): Die Bühne zeigt kein fremdes Feld
    const schief = { ...alt, profil: { ...alt.profil, klasse: 1 } };
    const j = jetztDran(schief, HEUTE);
    expect(j.feld === null || feldInKlasse(j.feld, 1)).toBe(true);
    expect(j.art).toBe("ueben"); // dd/gws und der Schwerpunkt „Richtig schreiben“ gehören nicht zu Klasse 1
  });

  it("Suche: Klasse 1 findet ihre Übungen, aber keine Klasse-4-Felder und keinen Karteikasten", () => {
    const d = leeresDokument(HEUTE);
    const k1 = sucheIndex({ ...d, profil: { ...d.profil, klasse: 1 } }, false).map((e) => e.titel);
    expect(k1).toContain("Plus bis 20");
    expect(k1).not.toContain("das oder dass?");
    expect(k1).not.toContain("Karteikasten (digital üben)");
    const k4 = sucheIndex(d, false).map((e) => e.titel);
    expect(k4).toContain("das oder dass?");
    expect(k4).toContain("Karteikasten (digital üben)");
    expect(k4).not.toContain("Plus bis 20");
  });
});
