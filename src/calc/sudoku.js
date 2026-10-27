/* ============================================================
   🧩 SUDOKU-TRAINING – REINE Fachlogik (kein DOM, Zufall als Seed).
   Lernweg in Stufen: erst Mini-Sudoku mit den Zahlen 1–4, dann 6×6,
   am Ende das große 9×9 mit den Zahlen 1–9 – „wie die Profis".
   Jedes Rätsel wird aus einer vollen Lösung erzeugt und hat GENAU
   EINE Lösung (beim Ausräumen wird die Eindeutigkeit geprüft).
   Gitter: Array aus Zeilen, 0 = leeres Feld.
   ============================================================ */
import { rngAusSeed, mischen } from "./rng.js";

export const SUDOKU_JE_STUFE = 3; // gelöste Rätsel bis zum Aufstieg

export const SUDOKU_STUFEN = [
  { stufe: 1, groesse: 4, boxB: 2, boxH: 2, leer: 6, name: "Mini-Sudoku zum Kennenlernen", zahlen: "1–4" },
  { stufe: 2, groesse: 4, boxB: 2, boxH: 2, leer: 10, name: "Mini-Sudoku mit mehr Lücken", zahlen: "1–4" },
  { stufe: 3, groesse: 6, boxB: 3, boxH: 2, leer: 14, name: "Mittel-Sudoku", zahlen: "1–6" },
  { stufe: 4, groesse: 6, boxB: 3, boxH: 2, leer: 20, name: "Mittel-Sudoku für Könner", zahlen: "1–6" },
  { stufe: 5, groesse: 9, boxB: 3, boxH: 3, leer: 34, name: "Das große Sudoku", zahlen: "1–9" },
  { stufe: 6, groesse: 9, boxB: 3, boxH: 3, leer: 44, name: "Meister-Sudoku", zahlen: "1–9" },
];
export const SUDOKU_MAX_STUFE = SUDOKU_STUFEN.length;

export function sudokuStufe(stufe) {
  return SUDOKU_STUFEN.find((s) => s.stufe === stufe) || SUDOKU_STUFEN[0];
}

/** Passt der Wert an Position (r, c), ohne die Sudoku-Regel zu brechen? */
export function passtRein(gitter, meta, r, c, wert) {
  return konflikte(gitter, meta, r, c, wert).length === 0;
}

/** Alle Zellen, die dem Wert an (r, c) widersprechen – fürs Lern-Highlight:
    das Kind SIEHT, wo die Zahl schon steht (Reihe, Spalte, Kästchen). */
export function konflikte(gitter, meta, r, c, wert) {
  const treffer = [];
  const { groesse, boxB, boxH } = meta;
  for (let i = 0; i < groesse; i++) {
    if (i !== c && gitter[r][i] === wert) treffer.push({ r, c: i });
    if (i !== r && gitter[i][c] === wert) treffer.push({ r: i, c });
  }
  const r0 = Math.floor(r / boxH) * boxH;
  const c0 = Math.floor(c / boxB) * boxB;
  for (let i = r0; i < r0 + boxH; i++) {
    for (let j = c0; j < c0 + boxB; j++) {
      if ((i !== r || j !== c) && gitter[i][j] === wert
        && !treffer.some((t) => t.r === i && t.c === j)) treffer.push({ r: i, c: j });
    }
  }
  return treffer;
}

function leeresGitter(g) {
  return Array.from({ length: g }, () => Array(g).fill(0));
}

/** Füllt das Gitter per Backtracking zu einer vollen Lösung (gemischt). */
function loesen(gitter, meta, rng, zaehlen) {
  const g = meta.groesse;
  let frei = null;
  for (let r = 0; r < g && !frei; r++) {
    for (let c = 0; c < g; c++) {
      if (gitter[r][c] === 0) { frei = { r, c }; break; }
    }
  }
  if (!frei) return 1; // voll = eine Lösung gefunden
  const kandidaten = rng
    ? mischen(Array.from({ length: g }, (_, i) => i + 1), rng)
    : Array.from({ length: g }, (_, i) => i + 1);
  let gefunden = 0;
  for (const wert of kandidaten) {
    if (!passtRein(gitter, meta, frei.r, frei.c, wert)) continue;
    gitter[frei.r][frei.c] = wert;
    const unten = loesen(gitter, meta, rng, zaehlen);
    if (!zaehlen) {
      if (unten) return 1; // die Lösung steht jetzt IM Gitter – nichts zurücksetzen
      gitter[frei.r][frei.c] = 0;
    } else {
      gefunden += unten;
      gitter[frei.r][frei.c] = 0;
      if (gefunden >= 2) return gefunden; // mehr als eine = nicht eindeutig
    }
  }
  return gefunden;
}

/** Zählt Lösungen (bricht bei 2 ab) – prüft die Eindeutigkeit. */
export function loesungenZaehlen(gitter, meta) {
  const kopie = gitter.map((z) => z.slice());
  return loesen(kopie, meta, null, true);
}

/** Erzeugt ein Rätsel der Stufe – deterministisch zum Seed.
    Ergebnis: { stufe, groesse, boxB, boxH, gitter (0 = leer), loesung, leer }. */
export function sudokuErzeugen(stufe, seed) {
  const meta = sudokuStufe(stufe);
  const rng = rngAusSeed(`sudoku:${meta.stufe}:${seed}`);
  const loesung = leeresGitter(meta.groesse);
  loesen(loesung, meta, rng, false);

  const gitter = loesung.map((z) => z.slice());
  const zellen = mischen(
    Array.from({ length: meta.groesse * meta.groesse }, (_, i) => ({
      r: Math.floor(i / meta.groesse), c: i % meta.groesse,
    })), rng);
  let entfernt = 0;
  for (const { r, c } of zellen) {
    if (entfernt >= meta.leer) break;
    const wert = gitter[r][c];
    gitter[r][c] = 0;
    if (loesungenZaehlen(gitter, meta) === 1) entfernt++;
    else gitter[r][c] = wert; // würde mehrdeutig – Zahl bleibt stehen
  }
  return { stufe: meta.stufe, groesse: meta.groesse, boxB: meta.boxB, boxH: meta.boxH, gitter, loesung, leer: entfernt };
}

export function istGeloest(gitter) {
  return gitter.every((zeile) => zeile.every((w) => w !== 0));
}

/** Säubert den gespeicherten Stand (für migrateData). */
export function sudokuStand(roh) {
  const s = roh && typeof roh === "object" ? roh : {};
  return {
    stufe: Number.isInteger(s.stufe) && s.stufe >= 1 && s.stufe <= SUDOKU_MAX_STUFE ? s.stufe : 1,
    geloest: Number.isInteger(s.geloest) && s.geloest >= 0 && s.geloest < SUDOKU_JE_STUFE ? s.geloest : 0,
    gesamt: Number.isInteger(s.gesamt) && s.gesamt >= 0 ? s.gesamt : 0,
  };
}

/** Fortschritt nach einem gelösten Rätsel: 3 Siege = nächste Stufe. */
export function sudokuNachSieg(roh) {
  const s = sudokuStand(roh);
  const geloest = s.geloest + 1;
  const aufgestiegen = geloest >= SUDOKU_JE_STUFE && s.stufe < SUDOKU_MAX_STUFE;
  return {
    stufe: aufgestiegen ? s.stufe + 1 : s.stufe,
    geloest: geloest >= SUDOKU_JE_STUFE ? (aufgestiegen ? 0 : SUDOKU_JE_STUFE - 1) : geloest,
    gesamt: s.gesamt + 1,
    aufgestiegen,
  };
}
