/* ============================================================
   🖐️ SCHREIB-TRAINING – reine Logik.
   Jeden Tag EIN kurzer Satz (höchstens 8 Wörter) zum Abschreiben
   mit der Hand – aus der gewählten Übungs-Welt, deterministisch
   über das Datum rotiert. Hat das Kind heute seinen Mut-Satz
   gewählt, ist DER die Schreibaufgabe (doppelt wirksam).
   Die Schrift-Reise (kleine Vorschaubilder) lebt im Tresor:
   höchstens 30 Einträge, Neues verdrängt Ältestes.
   ============================================================ */
export const SCHREIB_SAETZE = {
  alltag: [
    "Am Morgen singt der Vogel laut.",
    "Oma backt heute einen Kuchen.",
    "Der Ball springt über den Zaun.",
    "Im Garten blühen bunte Blumen.",
    "Papa kocht Nudeln mit Soße.",
    "Die Katze schläft auf dem Sofa.",
    "Wir bauen eine hohe Höhle.",
    "Der Regen trommelt ans Fenster.",
  ],
  angeln: [
    "Der Hecht wehrt sich dreimal.",
    "Die Pose taucht plötzlich unter.",
    "Am Ufer sitzt der Angler still.",
    "Der Wurm windet sich am Haken.",
    "Im See glänzen viele Fische.",
    "Der Kescher hebt den Zander.",
    "Die Schnur surrt von der Rolle.",
    "Ein Boot gleitet über den See.",
  ],
  tennis: [
    "Der Ball fliegt über das Netz.",
    "Mein Aufschlag wird immer besser.",
    "Die Spielerin gewinnt den Satz.",
    "Der Schläger liegt gut in der Hand.",
    "Wir spielen bis zum Matchball.",
    "Der Trainer zeigt den Aufschlag.",
    "Nach dem Spiel klatschen alle ab.",
    "Der Ball springt vom Sand hoch.",
  ],
  fussball: [
    "Der Torwart hält jeden Ball.",
    "Unser Team jubelt nach dem Tor.",
    "Der Elfmeter landet im Winkel.",
    "Beim Training üben wir Pässe.",
    "Die Fans singen auf der Tribüne.",
    "Der Schiedsrichter pfeift das Spiel an.",
    "Mein Trikot ist voller Matsch.",
    "Zum Schluss geben wir alles.",
  ],
};

/** Tages-Nummer (deterministisch aus dem ISO-Datum). */
function tagNr(heute) {
  const [j, m, t] = String(heute).split("-").map((x) => parseInt(x, 10));
  return Number.isFinite(j) ? Math.floor(Date.UTC(j, (m || 1) - 1, t || 1) / 86400000) : 0;
}

/** Der Schreib-Satz des Tages: eigene (von den Eltern freigegebene)
    Sätze haben Vorrang vor der Übungs-Welt. */
export function schreibSatz(heute, thema, eigene) {
  const liste = Array.isArray(eigene) && eigene.length
    ? eigene
    : SCHREIB_SAETZE[thema] || SCHREIB_SAETZE.alltag;
  const n = tagNr(heute);
  return liste[((n % liste.length) + liste.length) % liste.length];
}

export function leererSchriftStand() {
  return { reise: [] }; // { tag, satz, buchstabe, thumb }
}

/** Hängt den heutigen Eintrag an die Schrift-Reise (ersetzt den Tages-Eintrag, max 30). */
export function reiseEintragen(stand, eintrag) {
  const s = stand && Array.isArray(stand.reise) ? stand : leererSchriftStand();
  const ohneHeute = s.reise.filter((e) => e.tag !== eintrag.tag);
  return { ...s, reise: [...ohneHeute, eintrag].slice(-30) };
}

/** Heute schon geschrieben (und belohnt)? */
export function heuteGeschrieben(stand, heute) {
  return !!(stand && Array.isArray(stand.reise) && stand.reise.some((e) => e.tag === heute));
}
