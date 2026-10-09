/* 🗃️ DIGITALER KARTEIKASTEN (Leitner, 3 Fächer):
   Fach 1 = jeden Tag · Fach 2 = alle 3 Tage · Fach 3 = alle 7 Tage.
   „Gewusst“ → ein Fach weiter, „Nochmal“ → zurück in Fach 1.
   Reine Logik ohne DOM – „heute“ kommt als Parameter. Der Stand lebt
   im Tresor (lernstand.karteikasten.stand) und synct mit. */
import { tageBis } from "./kompassPlan.js";

export const KASTEN_ABSTAND = { 1: 1, 2: 3, 3: 7 };
export const RUNDEN_GROESSE = 5;

export function kartenFach(stand, id) {
  return (stand && stand[id] && stand[id].fach) || 1;
}

/** Fällig = neu, oder der Fach-Abstand seit dem letzten Mal ist um. */
export function istFaellig(stand, id, heute) {
  const e = stand && stand[id];
  if (!e) return true;
  return tageBis(e.zuletzt, heute) >= (KASTEN_ABSTAND[e.fach] || 1);
}

/** Die nächste Runde: fällige Karten, wackligste (Fach 1) zuerst,
    innerhalb eines Fachs in Stapel-Reihenfolge – deterministisch. */
export function faelligeKarten(karten, stand, heute, n = RUNDEN_GROESSE) {
  return karten
    .filter((k) => istFaellig(stand, k.id, heute))
    .sort((a, b) => kartenFach(stand, a.id) - kartenFach(stand, b.id))
    .slice(0, n);
}

export function karteWerten(stand, id, gewusst, heute) {
  const fach = gewusst ? Math.min(3, kartenFach(stand, id) + 1) : 1;
  return { ...stand, [id]: { fach, zuletzt: heute } };
}

export function kastenZaehler(karten, stand) {
  const z = { 1: 0, 2: 0, 3: 0 };
  for (const k of karten) z[kartenFach(stand, k.id)]++;
  return z;
}
