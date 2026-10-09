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

/** 🧮 Tipp-Eingabe: Wo die Lösung eine reine Zahl ist, tippt das Kind
    das Ergebnis selbst ein (objektive Wertung statt Selbst-Einschätzung).
    Eine Lösungszeile „8 · 6 = 48" wird zum Feld „8 · 6 =" mit Lösung 48;
    eine reine Zahl („56") zu einem einzelnen Feld. Alles andere (Wörter,
    Einheiten, Erklär-Gleichungen in einer Zeile) bleibt beim Umdrehen. */
export function eingabeFelder(karte) {
  const zeilen = karte.rs.split("\n");
  if (zeilen.length >= 2 && zeilen.every((z) => /^.+ = \d+$/.test(z))) {
    return zeilen.map((z) => {
      const teile = z.split(" = ");
      return { label: `${teile[0]} =`, loesung: teile[1] };
    });
  }
  if (/^\d+$/.test(karte.rs)) return [{ label: null, loesung: karte.rs }];
  return null;
}

/** Vergleich je Feld als Zahl (Leerzeichen und führende Nullen egal). */
export function eingabePruefen(felder, antworten) {
  const richtig = felder.map((f, i) => parseInt(String(antworten[i] || "").trim(), 10) === parseInt(f.loesung, 10));
  return { richtig, alle: richtig.every(Boolean) };
}
