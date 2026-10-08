import { describe, it, expect } from "vitest";
import {
  SCHREIB_SAETZE, schreibSatz, leererSchriftStand, reiseEintragen, heuteGeschrieben,
} from "./schrift.js";

const VERBOTEN = /\b(dumm|faul|krank)\b|adhs|störung|diagnose|defizit|unmotiviert|versager|zappel/i;

describe("schrift – Schreib-Satz des Tages", () => {
  it("alle Sätze: höchstens 8 Wörter, Sprachregeln eingehalten, 4 Welten à 8 Sätze", () => {
    const welten = Object.keys(SCHREIB_SAETZE);
    expect(welten.sort()).toEqual(["alltag", "angeln", "fussball", "tennis"]);
    for (const w of welten) {
      expect(SCHREIB_SAETZE[w].length).toBe(8);
      for (const satz of SCHREIB_SAETZE[w]) {
        expect(satz.trim().split(/\s+/).length).toBeLessThanOrEqual(8);
        expect(satz).not.toMatch(VERBOTEN);
        expect(satz.endsWith(".")).toBe(true);
      }
    }
  });

  it("deterministisch: gleicher Tag → gleicher Satz; Folgetage rotieren durch die Liste", () => {
    expect(schreibSatz("2026-10-08", "angeln")).toBe(schreibSatz("2026-10-08", "angeln"));
    const a = schreibSatz("2026-10-08", "angeln");
    const b = schreibSatz("2026-10-09", "angeln");
    expect(a).not.toBe(b);
    // nach 8 Tagen ist derselbe Satz wieder dran
    expect(schreibSatz("2026-10-16", "angeln")).toBe(a);
    // unbekannte Welt fällt auf Alltag zurück, kaputtes Datum stürzt nicht ab
    expect(SCHREIB_SAETZE.alltag).toContain(schreibSatz("2026-10-08", "quatsch"));
    expect(typeof schreibSatz("kein-datum", "alltag")).toBe("string");
  });

  it("reiseEintragen: ersetzt den Tages-Eintrag, hält höchstens 30, mutiert nicht", () => {
    const leer = leererSchriftStand();
    const e1 = { tag: "2026-10-08", satz: "A.", buchstabe: "e", thumb: "x" };
    const s1 = reiseEintragen(leer, e1);
    expect(s1.reise).toEqual([e1]);
    expect(leer.reise).toEqual([]); // Original unangetastet
    // zweites Foto am selben Tag ersetzt den Eintrag
    const s2 = reiseEintragen(s1, { ...e1, buchstabe: "m" });
    expect(s2.reise.length).toBe(1);
    expect(s2.reise[0].buchstabe).toBe("m");
    // 35 Tage → nur die letzten 30 bleiben
    let s = leererSchriftStand();
    for (let i = 1; i <= 35; i++) s = reiseEintragen(s, { tag: `2026-11-${String(i).padStart(2, "0")}`, satz: "x" });
    expect(s.reise.length).toBe(30);
    expect(s.reise[0].tag).toBe("2026-11-06");
    // kaputter Stand wird repariert
    expect(reiseEintragen(null, e1).reise).toEqual([e1]);
  });

  it("heuteGeschrieben erkennt den Tages-Eintrag", () => {
    const s = reiseEintragen(leererSchriftStand(), { tag: "2026-10-08", satz: "A." });
    expect(heuteGeschrieben(s, "2026-10-08")).toBe(true);
    expect(heuteGeschrieben(s, "2026-10-09")).toBe(false);
    expect(heuteGeschrieben(null, "2026-10-08")).toBe(false);
  });
});
