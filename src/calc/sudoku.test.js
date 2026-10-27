import { describe, it, expect } from "vitest";
import {
  SUDOKU_STUFEN, SUDOKU_JE_STUFE, SUDOKU_MAX_STUFE,
  sudokuErzeugen, sudokuStufe, konflikte, passtRein, istGeloest,
  loesungenZaehlen, sudokuStand, sudokuNachSieg,
} from "./sudoku.js";

function loesungGueltig(loesung, meta) {
  const g = meta.groesse;
  for (let r = 0; r < g; r++) {
    for (let c = 0; c < g; c++) {
      const wert = loesung[r][c];
      if (wert < 1 || wert > g) return false;
      const kopie = loesung.map((z) => z.slice());
      kopie[r][c] = 0;
      if (!passtRein(kopie, meta, r, c, wert)) return false;
    }
  }
  return true;
}

describe("sudoku – Erzeugung", () => {
  it("Lernweg: 4×4 (Zahlen 1–4) → 6×6 → 9×9 (Zahlen 1–9), Lücken wachsen", () => {
    expect(SUDOKU_STUFEN.map((s) => s.groesse)).toEqual([4, 4, 6, 6, 9, 9]);
    expect(SUDOKU_STUFEN[0].zahlen).toBe("1–4");
    expect(SUDOKU_STUFEN[SUDOKU_MAX_STUFE - 1].zahlen).toBe("1–9");
    for (let i = 1; i < SUDOKU_STUFEN.length; i++) {
      expect(SUDOKU_STUFEN[i].leer).toBeGreaterThan(SUDOKU_STUFEN[i - 1].leer
        * (SUDOKU_STUFEN[i].groesse === SUDOKU_STUFEN[i - 1].groesse ? 1 : 0));
    }
    expect(sudokuStufe(99).stufe).toBe(1); // Unbekanntes fällt auf den Anfang
  });

  it("jede Stufe: gültige Lösung, Vorgaben stimmen mit der Lösung überein, GENAU eine Lösung", () => {
    for (const meta of SUDOKU_STUFEN) {
      const r = sudokuErzeugen(meta.stufe, "test-seed");
      expect(loesungGueltig(r.loesung, meta), `Stufe ${meta.stufe}: Lösung gültig`).toBe(true);
      let leer = 0;
      for (let i = 0; i < r.groesse; i++) {
        for (let j = 0; j < r.groesse; j++) {
          if (r.gitter[i][j] === 0) leer++;
          else expect(r.gitter[i][j]).toBe(r.loesung[i][j]);
        }
      }
      expect(leer).toBe(r.leer);
      expect(leer).toBeGreaterThanOrEqual(Math.min(meta.leer, 4)); // genug zu tun
      expect(loesungenZaehlen(r.gitter, meta), `Stufe ${meta.stufe}: eindeutig`).toBe(1);
    }
  });

  it("deterministisch: gleicher Seed → gleiches Rätsel, anderer Seed → anderes", () => {
    const a = sudokuErzeugen(1, "a");
    expect(sudokuErzeugen(1, "a").gitter).toEqual(a.gitter);
    expect(JSON.stringify(sudokuErzeugen(1, "b").loesung)).not.toBe(JSON.stringify(a.loesung));
  });

  it("konflikte zeigen, WO die Zahl schon steht (Reihe, Spalte, Kästchen)", () => {
    const meta = sudokuStufe(1);
    const g = [
      [1, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 1],
    ];
    expect(konflikte(g, meta, 0, 3, 1)).toEqual([{ r: 0, c: 0 }, { r: 3, c: 3 }]); // Reihe + Spalte
    expect(konflikte(g, meta, 1, 1, 1)).toEqual([{ r: 0, c: 0 }]); // Kästchen (nicht doppelt)
    expect(passtRein(g, meta, 1, 2, 1)).toBe(true);
    expect(istGeloest(g)).toBe(false);
    expect(istGeloest([[1, 2], [2, 1]])).toBe(true);
  });
});

describe("sudoku – Lern-Fortschritt", () => {
  it("3 Siege = Aufstieg; Meister-Stufe bleibt; Stand wird gesäubert", () => {
    expect(sudokuStand(null)).toEqual({ stufe: 1, geloest: 0, gesamt: 0 });
    expect(sudokuStand({ stufe: 99, geloest: -2, gesamt: "x" })).toEqual({ stufe: 1, geloest: 0, gesamt: 0 });
    let s = sudokuStand(null);
    s = sudokuNachSieg(s);
    expect(s).toMatchObject({ stufe: 1, geloest: 1, gesamt: 1, aufgestiegen: false });
    s = sudokuNachSieg(sudokuNachSieg(s));
    expect(s).toMatchObject({ stufe: 2, geloest: 0, gesamt: 3, aufgestiegen: true });
    // Meister-Stufe: kein Aufstieg mehr, aber die Zählung läuft weiter
    let m = { stufe: SUDOKU_MAX_STUFE, geloest: SUDOKU_JE_STUFE - 1, gesamt: 20 };
    m = sudokuNachSieg(m);
    expect(m).toMatchObject({ stufe: SUDOKU_MAX_STUFE, aufgestiegen: false, gesamt: 21 });
  });
});
