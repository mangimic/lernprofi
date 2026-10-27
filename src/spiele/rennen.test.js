import { describe, it, expect } from "vitest";
import { DINO_SKIN, RAKETE_SKIN, MATCH_SKINS } from "./rennen.js";
import { MENTAL_IDS } from "./matchEngine.js";

const VERBOTEN = /adhs|störung|diagnose|defizit|unmotiviert|versager|zappel/i;

describe("Match-Engine-Skins (Dino-Rennen, Raketen-Rennen)", () => {
  for (const skin of [DINO_SKIN, RAKETE_SKIN]) {
    it(`${skin.key}: Skin vollständig – Gegner, Fakten, alle Mental-Karten, Feld, Bewegung`, () => {
      // Gegner: drei Stärken wie bei Tennis/Fußball (Rotation je Match)
      expect(skin.daten.gegner.map((g) => g.staerke)).toEqual([1, 2, 3]);
      for (const g of skin.daten.gegner) expect(g.name && g.emoji && g.spruch).toBeTruthy();
      // Wissen: genug Fakten für mehrere Matches
      expect(skin.daten.fakten.length).toBeGreaterThanOrEqual(6);
      // Mental-Karten: ALLE festen Engine-Ids vorhanden und vollständig
      const ids = skin.daten.mental.map((m) => m.id);
      for (const id of MENTAL_IDS) expect(ids, `${skin.key} mental ${id}`).toContain(id);
      for (const m of skin.daten.mental) {
        for (const feld of ["titel", "emoji", "trainieren", "mission", "mut", "punkt", "schluss"]) {
          expect(m[feld], `${skin.key} ${m.id}.${feld}`).toBeTruthy();
        }
      }
      // Sprachregeln: keine Diagnose-/Druck-Wörter in kind-sichtbaren Texten
      expect(JSON.stringify(skin.daten)).not.toMatch(VERBOTEN);
      // Feld-SVG trägt die Elemente, die die Engine bewegt
      const s = { name: "Kind", mir: 2, ihm: 1, gegner: skin.daten.gegner[0] };
      const svg = skin.feldSVG(s);
      expect(svg).toContain(`id="${skin.testPrefix}Ich"`);
      expect(svg).toContain(`id="${skin.testPrefix}Gegner"`);
      expect(svg).toContain("🏁");
      // Bewegung: richtig bewegt MICH vorwärts, falsch den Gegner
      const vor = skin.anim(s, true);
      expect(vor.id).toBe(`${skin.testPrefix}Ich`);
      expect(vor.x1).toBeGreaterThan(vor.x0);
      const gegner = skin.anim(s, false);
      expect(gegner.id).toBe(`${skin.testPrefix}Gegner`);
      expect(gegner.x1).toBeGreaterThan(gegner.x0);
      // Regeln wie beim Fußball bewährt: 2 Abschnitte × 5 Chancen
      expect(skin.abschnitte).toBe(2);
      expect(skin.chancen).toBe(5);
    });
  }

  it("Katalog: beide Skins unter ihrem Welt-Schlüssel erreichbar", () => {
    expect(Object.keys(MATCH_SKINS).sort()).toEqual(["dino", "rakete"]);
    expect(MATCH_SKINS.dino.titel).toContain("Dino");
    expect(MATCH_SKINS.rakete.titel).toContain("Raketen");
  });
});
