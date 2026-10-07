/* ============================================================
   🔧 ELTERN-WERKZEUGE – reine Logik, originalgetreu aus der Alt-App:
   1) ⏰ Lernzeit pro Tag (Time-Boxing): Tageszähler, Limit-Stufen,
      „abgelaufen“/„übrig“ – „heute" kommt als ISO-Datum herein.
   2) 🎮 Spiele-Schalter: deaktivierte Spiele verschwinden aus der
      Spielhalle, die Lernfelder bleiben immer verfügbar.
   3) 💬 Gesprächsimpulse: 20 offene Fragen in 4 Bereichen
      (kindgerecht für 8–10 Jahre), mit „Frage des Tages“.
   ============================================================ */
export const ZEIT_STUFEN = [0, 10, 15, 20, 30, 45, 60];

/** Tageszähler: beim Tageswechsel beginnt er bei 0. */
export function zeitHeute(zeit, heute) {
  return zeit && zeit.tag === heute ? zeit : { tag: heute, sek: 0 };
}
export function zeitAbgelaufen(zeit, limitMin, heute) {
  return (limitMin || 0) > 0 && zeitHeute(zeit, heute).sek >= limitMin * 60;
}
export function zeitUebrigMin(zeit, limitMin, heute) {
  return Math.max(0, Math.ceil(((limitMin || 0) * 60 - zeitHeute(zeit, heute).sek) / 60));
}

/** Spiel sichtbar? Standard: an – nur ein ausdrückliches false schaltet aus. */
export function spielAktiv(einstellungen, id) {
  const s = einstellungen && einstellungen.spieleAktiv;
  return !s || s[id] !== false;
}

export const SPIELE_SCHALTER = [
  { id: "see", name: "🎣 See-Abenteuer" },
  { id: "blockwelt", name: "⛏️ Blockwelt" },
  { id: "tennis", name: "🎾 Tennis-Match" },
  { id: "fussball", name: "⚽ Fußball-Match" },
  { id: "schach", name: "♟️ Schach" },
];

/* --- 💬 Gesprächsimpulse (nach einer Coaching-Fragensammlung,
   kindgerecht übersetzt). Keine Tests, sondern Tür-Öffner. --- */
export const GESPRAECH_BEREICHE = [
  { emoji: "🚧", titel: "Grenzen", fragen: [
    "Was machst du, wenn dich jemand zu etwas überreden will, das du nicht willst?",
    "Was tust du, wenn du „Stopp“ sagst – und jemand macht trotzdem weiter?",
    "Darf man auch zu einem Erwachsenen Nein sagen? Wann?",
    "Woran merkst du, dass eine Freundschaft dich klein fühlen lässt statt stark?",
    "Was machst du, wenn jemand sagt: „Trau dich doch – alle machen das“?"] },
  { emoji: "💪", titel: "Stehauf-Kraft", fragen: [
    "Was machst du, wenn sich etwas völlig aussichtslos anfühlt?",
    "Erzähl mal: Wann ist dir etwas so richtig danebengegangen – und was hast du danach gemacht?",
    "Wie machst du weiter, wenn du am liebsten aufgeben würdest?",
    "Was hilft dir, wenn jemand deine Gefühle richtig verletzt hat?",
    "Bei welchen Freunden kannst du ganz du selbst sein – und woran merkst du das?"] },
  { emoji: "🧠", titel: "Denkweise", fragen: [
    "Glaubst du, man kann in etwas besser werden, das man noch nicht gut kann? Wie?",
    "Was sagst du zu dir selbst, wenn du einen Fehler machst?",
    "Wie geht es dir, wenn jemand besser ist in etwas, das dir wichtig ist?",
    "Was bedeutet Erfolg für DICH – nicht für deine Freunde, nicht für uns – für dich?",
    "Was für ein Freund möchtest DU sein – was sollen andere über dich sagen können?"] },
  { emoji: "🔍", titel: "Probleme lösen", fragen: [
    "Wenn du ein Problem hast – was machst du als Erstes?",
    "Was machst du, wenn du und ein Freund völlig verschiedener Meinung seid?",
    "Stell dir vor, du hast aus Versehen jemanden verletzt – wie würdest du es wiedergutmachen?",
    "Was würdest du tun, wenn sich etwas falsch anfühlt – aber alle anderen finden es okay?",
    "Was kannst du tun, wenn alle über jemanden lachen – und du merkst, dass es ihn verletzt?"] },
];

/** Frage des Tages: wandert jeden Tag eine Frage weiter (determiniert aus dem Datum). */
export function gespraechDesTages(heute) {
  const alle = GESPRAECH_BEREICHE.flatMap((b) => b.fragen.map((f) => ({ bereich: `${b.emoji} ${b.titel}`, frage: f })));
  const [j, m, t] = String(heute).split("-").map((x) => parseInt(x, 10));
  const tagNr = Number.isFinite(j) ? Math.floor(Date.UTC(j, (m || 1) - 1, t || 1) / 86400000) : 0;
  return alle[((tagNr % alle.length) + alle.length) % alle.length];
}
