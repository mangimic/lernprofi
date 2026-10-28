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
      expect(skin.regeln).toEqual({ typ: "abschnitte", abschnitte: 2, chancen: 5 });
    });
  }

  it("Katalog: beide Skins unter ihrem Welt-Schlüssel erreichbar", () => {
    expect(Object.keys(MATCH_SKINS).sort()).toEqual(["dino", "rakete"]);
    expect(MATCH_SKINS.dino.titel).toContain("Dino");
    expect(MATCH_SKINS.rakete.titel).toContain("Raketen");
  });
});

describe("Angel-Wettfischen (dritter Welten-Skin)", async () => {
  const { WETTFISCHEN_SKIN } = await import("./wettfischenSkin.js");

  it("Skin vollständig: Gegner, Fakten, alle Mental-Karten ohne Map, bewährte Regeln", () => {
    const skin = WETTFISCHEN_SKIN;
    expect(skin.regeln).toEqual({ typ: "abschnitte", abschnitte: 2, chancen: 5 });
    expect(skin.daten.gegner.map((g) => g.staerke)).toEqual([1, 2, 3]);
    expect(skin.daten.fakten.length).toBeGreaterThanOrEqual(6);
    const ids = skin.daten.mental.map((m) => m.id);
    for (const id of MENTAL_IDS) expect(ids, `fischen mental ${id}`).toContain(id);
    expect(/adhs|störung|diagnose|defizit|unmotiviert|versager|zappel/i.test(JSON.stringify(skin.daten))).toBe(false);
  });

  it("Fang-Animation: gefangen springt der Fisch zu DEINEM Eimer (links), sonst zum Gegner", () => {
    const s = { name: "Kind", mir: 2, ihm: 1, balls: 3, chance: 3, gegner: WETTFISCHEN_SKIN.daten.gegner[0] };
    const svg = WETTFISCHEN_SKIN.feldSVG(s);
    expect(svg).toContain('id="fischenFisch"');
    expect(svg).toContain("🐟 2"); // die Eimer zählen mit
    expect(svg).toContain("🐟 1");
    const fang = WETTFISCHEN_SKIN.anim(s, true);
    expect(fang.id).toBe("fischenFisch");
    expect(fang.x1).toBeLessThan(fang.x0);   // nach links zu dir
    expect(WETTFISCHEN_SKIN.anim(s, false).x1).toBeGreaterThan(fang.x0); // nach rechts zum Gegner
  });
});

describe("Ballsport-Skins (Tennis, Fußball – Migration auf die Engine)", async () => {
  const { TENNIS_SKIN, FUSSBALL_SKIN } = await import("./ballsport.js");

  it("mentalMap zeigt nur auf Karten, die es in den JSONs wirklich gibt", () => {
    for (const skin of [TENNIS_SKIN, FUSSBALL_SKIN]) {
      const ids = skin.daten.mental.map((m) => m.id);
      for (const id of MENTAL_IDS) {
        const ziel = (skin.mentalMap && skin.mentalMap[id]) || id;
        if (ziel === "-") continue; // bewusst ausgeblendet (Tennis aktion3)
        expect(ids, `${skin.key}: ${id} → ${ziel}`).toContain(ziel);
      }
    }
  });

  it("Tennis: saetze-Regeln (bis 4 Punkte, 2 Gewinnspiele), 15-30-40-Zählweise, Entscheidungsball bei 40:40", () => {
    expect(TENNIS_SKIN.regeln).toEqual({ typ: "saetze", punkte: 4, spiele: 2 });
    const s = { mir: 2, ihm: 3, balls: 4, spielNr: 1, spieleMir: 1, spieleIhm: 0, gegner: TENNIS_SKIN.daten.gegner[0], name: "Kind" };
    expect(TENNIS_SKIN.texte.stand(s)).toBe("30 : 40");
    expect(TENNIS_SKIN.texte.entscheidungsBall({ mir: 3, ihm: 3 })).toBe(true);
    expect(TENNIS_SKIN.texte.entscheidungsBall({ mir: 3, ihm: 2 })).toBe(false);
    expect(TENNIS_SKIN.texte.endstand(s)).toBe("1 : 0");
    expect(TENNIS_SKIN.feldSVG(s)).toContain('id="tennisBall"');
    // Ballflug: gewonnen → am Gegner vorbei, verloren → ins Netz (Mitte)
    expect(TENNIS_SKIN.anim(s, true).x1).toBe(300);
    expect(TENNIS_SKIN.anim(s, false).x1).toBe(168);
  });

  it("Fußball: abschnitte-Regeln (2 Halbzeiten × 5 Chancen), Keeper hält beim Fehler", () => {
    expect(FUSSBALL_SKIN.regeln).toEqual({ typ: "abschnitte", abschnitte: 2, chancen: 5 });
    const s = { mir: 1, ihm: 1, balls: 2, chance: 2, abschnitt: 1, gegner: FUSSBALL_SKIN.daten.gegner[0], name: "Kind" };
    expect(FUSSBALL_SKIN.texte.aktionKopf(s)).toContain("Torchance 3 von 5");
    expect(FUSSBALL_SKIN.feldSVG(s)).toContain('id="fbBall"');
    expect(FUSSBALL_SKIN.anim(s, true).x1).toBe(314);  // in die Ecke
    expect(FUSSBALL_SKIN.anim(s, false).x1).toBe(294); // beim Keeper
  });
});
