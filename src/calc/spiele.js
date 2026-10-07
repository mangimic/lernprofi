/* ============================================================
   Spielhalle – reine Logik:
   - Münz-Regel wie in der Alt-App: 1 Übungsrunde = 1 Münze,
     1 Spielbesuch kostet 1 Münze (Spiele geben KEINE Münzen).
   - Blitz-Fragen: kurze gemischte Fragen (Deutsch + Mathe) aus den
     vorhandenen Pools, seedbar gemischt – fürs Angeln & künftige Spiele.
   ============================================================ */
import { rngAusSeed, mischen } from "./rng.js";
import { MATHE_DATEN } from "./aufgaben/mathe.js";
import { gwsPool, zeitPool } from "./aufgaben/deutschKonverter.js";
import { ddPool, doppelPool } from "./aufgaben/deutsch.js";

export function spielStartbar(muenzen) {
  return (muenzen || 0) >= 1;
}

/** Zieht die Eintritts-Münze ab (vorher mit spielStartbar prüfen). */
export function muenzeEinloesen(muenzen) {
  return Math.max(0, (muenzen || 0) - 1);
}

/** Kurz genug für ein flottes Spiel? */
function blitzTauglich(a) {
  return !a.kontext && a.f.length <= 90 && [a.r, ...a.x].every((o) => o.length <= 16);
}

/**
 * n gemischte Blitz-Fragen, abwechselnd Deutsch und Mathe (soweit möglich).
 * Deterministisch über den Seed – gleiche Runde, gleiche Fragen.
 */
export function blitzFragen(n, seed) {
  const rng = rngAusSeed(seed);
  const deutsch = mischen(
    [...ddPool().easy, ...doppelPool().easy, ...gwsPool().easy, ...zeitPool().easy].filter(blitzTauglich),
    rng,
  );
  const mathe = mischen(
    [...MATHE_DATEN.mrechnen.easy, ...MATHE_DATEN.mzahlen.easy, ...MATHE_DATEN.mrechnen.hard].filter(blitzTauglich),
    rng,
  );
  const fragen = [];
  for (let i = 0; i < n; i++) {
    const quelle = i % 2 === 0 ? deutsch : mathe;
    const andere = i % 2 === 0 ? mathe : deutsch;
    const a = quelle.length ? quelle.pop() : andere.pop();
    if (!a) break;
    fragen.push({ ...a, optionen: mischen([a.r, ...a.x], rng) });
  }
  return fragen;
}

/* --- See-Abenteuer: Je länger die Serie richtiger Antworten,
       desto dicker der Fisch. Falsch = Fisch entwischt, Serie reißt. --- */
export const SEE_WUERFE = 10;

export function fischFuerSerie(serie) {
  if (serie >= 5) return { emoji: "🐋", name: "Riesenwal", punkte: 4 };
  if (serie >= 4) return { emoji: "🦈", name: "Hai", punkte: 3 };
  if (serie >= 2) return { emoji: "🐠", name: "Prachtfisch", punkte: 2 };
  return { emoji: "🐟", name: "Fisch", punkte: 1 };
}

/** Wertet einen Wurf: richtig → Fang je Serie, falsch → Serie reißt. */
export function wurfWerten(stand, richtig) {
  const s = stand || { serie: 0, punkte: 0, fang: [] };
  if (!richtig) return { ...s, serie: 0, fang: [...s.fang, { emoji: "💨", name: "entwischt", punkte: 0 }] };
  const serie = s.serie + 1;
  const fisch = fischFuerSerie(serie);
  return { serie, punkte: s.punkte + fisch.punkte, fang: [...s.fang, fisch] };
}
