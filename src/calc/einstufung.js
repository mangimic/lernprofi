/* ============================================================
   🧪 EINSTUFUNGSTEST – reine Logik.
   Idee: 6 Kern-Lernfelder (Deutsch + Mathe), je Feld erst 2 leichte
   Aufgaben; sind BEIDE richtig, kommen 2 schwere dazu (adaptiv).
   Aus dem Ergebnis wird je Feld die Start-Stufe bestimmt:
     Stufe 1 = hier zuerst üben (leicht noch nicht sicher)
     Stufe 2 = sicher auf Klasse-Niveau (leicht fehlerfrei)
     Stufe 3 = Profi (auch schwer fehlerfrei; nur wo es Schweres gibt)
   Der Test stellt die Stufen ALLER getesteten Felder genau darauf ein
   (auch nach unten – dafür ist er da) und erstellt den Trainingsplan:
   die schwächsten Felder zuerst, höchstens 3 Empfehlungen.
   Der Test ist KEINE Übung: keine Münzen, keine Missionen.
   ============================================================ */
import { mischen } from "./rng.js";
import { stufenMax } from "./stufen.js";

export const EINSTUFUNG_FELDER = [
  { key: "gws", emoji: "📖", name: "Grundwortschatz", fach: "Deutsch" },
  { key: "dd", emoji: "🔤", name: "das oder dass?", fach: "Deutsch" },
  { key: "zeit", emoji: "⏳", name: "Zeitformen", fach: "Deutsch" },
  { key: "faelle", emoji: "🎯", name: "Die 4 Fälle", fach: "Deutsch" },
  { key: "mrechnen", emoji: "🧮", name: "Rechnen", fach: "Mathe" },
  { key: "mzahlen", emoji: "🔢", name: "Zahlen-Profi", fach: "Mathe" },
];
export const PRO_STUFE = 2; // Aufgaben je Schwierigkeit und Feld

/** Testplan: je Feld 2 leichte + (falls vorhanden) 2 schwere Aufgaben,
    per rng gezogen – deterministisch bei gleichem Seed. */
export function einstufungPlan(pools, rng) {
  return EINSTUFUNG_FELDER.map((feld) => {
    const pool = pools[feld.key];
    return {
      ...feld,
      easy: mischen(pool.easy, rng).slice(0, PRO_STUFE),
      hard: pool.hard && pool.hard.length ? mischen(pool.hard, rng).slice(0, PRO_STUFE) : [],
      max: stufenMax(pool),
    };
  });
}

/** Stufe aus dem Feld-Ergebnis. hardGefragt = Feld hatte schwere Aufgaben
    UND sie wurden gestellt (beide leichten richtig). */
export function einstufungStufe({ easyOk, hardOk, hardGefragt, max }) {
  if (easyOk < PRO_STUFE) return 1;
  if (!hardGefragt || hardOk < PRO_STUFE) return 2;
  return Math.min(3, max);
}

/** Deutung für die Ergebnis-Karte. */
export function stufenDeutung(stufe, max) {
  if (stufe === 1) return "hier zuerst üben 💪";
  if (stufe >= max) return "Profi – höchste Stufe 🌟";
  return "sicher – Klasse-4-Niveau ✅";
}

/** Stellt die Stufen der getesteten Felder exakt auf das Ergebnis ein
    (auch nach unten); Runden und Krone bleiben erhalten. */
export function einstufungAnwenden(stufen, ergebnisse) {
  const neu = { ...stufen };
  for (const [key, e] of Object.entries(ergebnisse)) {
    const alt = neu[key] || { freigeschaltet: 1, runden: 0, krone: false };
    neu[key] = { ...alt, freigeschaltet: e.stufe };
  }
  return neu;
}

/** Trainingsplan: schwächste Felder zuerst (Stufe aufsteigend, bei
    Gleichstand mehr Fehler zuerst), nur Felder unter der Höchststufe,
    höchstens 3. */
export function einstufungEmpfehlung(ergebnisse) {
  return Object.entries(ergebnisse)
    .filter(([, e]) => e.stufe < e.max)
    .sort((a, b) => (a[1].stufe - b[1].stufe) || (b[1].fehler - a[1].fehler))
    .slice(0, 3)
    .map(([key]) => key);
}
