/* ============================================================
   Münzen und Lerntage (Missionen, Tagesziel, Lernspur) – rein.
   „heute" ist überall ein ISO-Datum "JJJJ-MM-TT" als Parameter.
   Regeln wie in der Alt-App:
   - Eine ABGESCHLOSSENE Übungsrunde = 1 Spiel-Münze.
   - missionsLaenge gelöste Aufgaben = 1 Mini-Mission;
     missionsZiel Missionen = Tagesziel erreicht.
   - Lernspur = Kette von Tagen mit erreichtem Tagesziel;
     Lücken bis 3 Tage (z. B. Wochenende) unterbrechen sie nicht.
   ============================================================ */
export const MISSIONS_LAENGE = 4;

export function muenzenNachRunde(muenzen) {
  return (muenzen || 0) + 1;
}

function tagFinden(lerntage, heute) {
  return lerntage.find((t) => t.tag === heute);
}

/** Zählt gelöste Aufgaben auf den heutigen Lerntag (gibt NEUE Liste zurück).
    missionsLaenge folgt der Tagesform: rot 3 · normal 4 · grün 5. */
export function aufgabenZaehlen(lerntage, heute, anzahl, { missionsZiel = 4, missionsLaenge = MISSIONS_LAENGE } = {}) {
  const liste = Array.isArray(lerntage) ? lerntage.slice(-60) : [];
  const vorhanden = tagFinden(liste, heute);
  const tag = vorhanden
    ? { ...vorhanden }
    : { tag: heute, aufgaben: 0, missionen: 0, zielErreicht: false };
  tag.aufgaben += anzahl;
  tag.missionen = Math.floor(tag.aufgaben / Math.max(1, missionsLaenge));
  tag.zielErreicht = tag.zielErreicht || tag.missionen >= missionsZiel;
  return vorhanden ? liste.map((t) => (t.tag === heute ? tag : t)) : [...liste, tag];
}

export function heutigerTag(lerntage, heute) {
  return tagFinden(lerntage || [], heute) || { tag: heute, aufgaben: 0, missionen: 0, zielErreicht: false };
}

function tagesDifferenz(a, b) {
  return Math.round((new Date(a + "T12:00:00") - new Date(b + "T12:00:00")) / 86400000);
}

/** Lernspur: Tage mit Tagesziel, rückwärts ab heute, Lücken ≤ 3 Tage erlaubt. */
export function lernspur(lerntage, heute) {
  const erreicht = (lerntage || []).filter((t) => t.zielErreicht).map((t) => t.tag).sort().reverse();
  if (!erreicht.length) return 0;
  if (tagesDifferenz(heute, erreicht[0]) > 3) return 0;
  let spur = 1;
  for (let i = 1; i < erreicht.length; i++) {
    if (tagesDifferenz(erreicht[i - 1], erreicht[i]) <= 3) spur++;
    else break;
  }
  return spur;
}
