/* ============================================================
   🔊 Vorlesen (v0.87): Erst- und Zweitklässler bekommen Frage und
   Antworten vorgelesen – über die Sprachausgabe des GERÄTS
   (window.speechSynthesis). Kein Audio im Bundle, kein Dienst, nichts
   verlässt das Gerät. Ohne Sprachausgabe passiert einfach nichts
   (vorlesbar() === false → Knöpfe werden gar nicht erst gezeigt).
   ============================================================ */
const EMOJI = /\p{Extended_Pictographic}|\u{FE0F}|\u{200D}|\p{Emoji_Modifier}/gu;

/** Gibt es auf diesem Gerät eine Sprachausgabe? */
export function vorlesbar() {
  return typeof window !== "undefined" && !!window.speechSynthesis && typeof window.SpeechSynthesisUtterance === "function";
}

/** Text fürs Vorlesen säubern: Emojis raus, Platzhalter-Striche als „Lücke", Leerraum glätten. */
export function sprechSauber(text) {
  return String(text || "").replace(EMOJI, " ").replace(/_{2,}/g, " Lücke ")
    // Rechen- und Vergleichszeichen ausschreiben – nicht jede Stimme kennt sie
    .replace(/(\d)\s*<\s*(\d)/g, "$1 ist kleiner als $2").replace(/(\d)\s*>\s*(\d)/g, "$1 ist größer als $2")
    .replace(/(\d)\s*\+\s*(?=[\d?])/g, "$1 plus ").replace(/(\d)\s*[−–-]\s*(?=[\d?])/g, "$1 minus ")
    .replace(/(\d)\s*·\s*(?=[\d?])/g, "$1 mal ").replace(/(\d)\s+:\s+(?=[\d?])/g, "$1 geteilt durch ") // nur mit Leerzeichen – „7:30 Uhr" bleibt eine Uhrzeit
    .replace(/\s=\s/g, " ist gleich ")
    .replace(/\s+/g, " ").trim();
}

/** Vorlesetext einer Aufgabe: `sprich` schlägt die sichtbare Frage. */
export function sprechText(aufgabe) {
  if (!aufgabe) return "";
  return sprechSauber(aufgabe.sprich || aufgabe.f || aufgabe.frage || "");
}

/* ---------- ▶️⏹️ Start/Stopp mit Merk-Stelle (v0.90) ----------
   Lange Texte (z. B. die Zeugenaussage beim Bericht) werden Satz für Satz
   gesprochen. So weiß die App jederzeit, bei welchem Satz sie ist: „Stopp"
   merkt sich die Stelle, „Start" liest ab genau diesem Satz weiter.
   (Pause/Fortsetzen der Geräte-Sprachausgabe selbst ist auf iPad und
   Android unzuverlässig – darum der Weg über einzelne Sätze.)
   Die Merk-Stellen leben nur im Arbeitsspeicher: nichts wird gespeichert
   oder übertragen, nach dem Neuladen beginnt jeder Text wieder vorn. */
const LANG_AB = 120;   // kürzere Texte (Fragen, Antworten) bleiben EIN Stück
const MERK_MAX = 30;

/** Teilt einen langen Text in Sätze; kurze Texte bleiben ganz. */
export function saetzeTeilen(text) {
  const sauber = sprechSauber(text);
  if (!sauber) return [];
  if (sauber.length <= LANG_AB) return [sauber];
  const roh = sauber.match(/[^.!?…]*[.!?…]+["“”»«'’)]*\s*|[^.!?…]+$/g) || [sauber];
  const teile = [];
  let puffer = "";
  for (const r of roh) {
    puffer += r;
    const t = puffer.trim();
    // „17." (Datum) und Mini-Stücke („z. B.", „Rums!") sind kein Satzende
    if (/\d\.$/.test(t) || t.length < 12) continue;
    teile.push(t);
    puffer = "";
  }
  const rest = puffer.trim();
  if (rest) {
    if (teile.length && rest.length < 12) teile[teile.length - 1] += " " + rest;
    else teile.push(rest);
  }
  return teile;
}

let lauf = null;             // { key, teile, i, id, u } – was gerade gesprochen wird
let laufNr = 0;
let stand = 0;               // zählt jede Änderung (für useSyncExternalStore)
const stellen = new Map();   // Text → Satz-Index, bei dem gestoppt wurde
const hoerer = new Set();

function melden() {
  stand++;
  hoerer.forEach((f) => { try { f(); } catch { /* ein Hörer darf die anderen nicht stören */ } });
}
/** Knöpfe abonnieren den Zustand (läuft / gestoppt / fertig). */
export function vorleseAbo(fn) { hoerer.add(fn); return () => hoerer.delete(fn); }
export function vorleseStand() { return stand; }
/** Wird genau dieser Text gerade vorgelesen? */
export function vorleseLaeuft(text) { return !!lauf && lauf.key === sprechSauber(text); }
/** Gemerkter Satz-Index für diesen Text (0 = von vorn). */
export function vorleseStelle(text) { return stellen.get(sprechSauber(text)) || 0; }

function merken() {
  if (!lauf) return;
  stellen.delete(lauf.key);
  if (lauf.i > 0 && lauf.i < lauf.teile.length) {
    stellen.set(lauf.key, lauf.i);
    if (stellen.size > MERK_MAX) stellen.delete(stellen.keys().next().value);
  }
}

function sprichTeil(id) {
  if (!lauf || lauf.id !== id) return;
  if (lauf.i >= lauf.teile.length) { // zu Ende gelesen → beim nächsten Mal wieder von vorn
    stellen.delete(lauf.key);
    lauf = null;
    melden();
    return;
  }
  const u = new window.SpeechSynthesisUtterance(lauf.teile[lauf.i]);
  u.lang = "de-DE";
  u.rate = 0.9;
  u.onend = () => { if (lauf && lauf.id === id) { lauf.i++; sprichTeil(id); } };
  u.onerror = () => { if (lauf && lauf.id === id) { lauf = null; melden(); } };
  lauf.u = u; // Referenz halten – sonst verliert iOS manchmal das Ende-Ereignis
  window.speechSynthesis.speak(u);
}

function starten(text, ab, altesMerken) {
  const sauber = sprechSauber(text);
  if (!vorlesbar() || !sauber) return false;
  try {
    if (altesMerken) merken();
    lauf = null;
    window.speechSynthesis.cancel();
    const teile = saetzeTeilen(sauber);
    lauf = { key: sauber, teile, i: Math.min(Math.max(0, ab), teile.length - 1), id: ++laufNr, u: null };
    sprichTeil(lauf.id);
    melden();
    return true;
  } catch {
    lauf = null;
    melden();
    return false; // manche Browser werfen ohne Nutzer-Geste – dann bleibt es still
  }
}

/** Liest den Text von vorn vor (Laufendes wird abgebrochen). true = Auftrag erteilt. */
export function vorlesen(text) {
  return starten(text, 0, false);
}

/** ▶️ Start: liest ab der gemerkten Stelle weiter (ohne Merk-Stelle: von vorn). */
export function vorlesenWeiter(text) {
  return starten(text, vorleseStelle(text), true);
}

/** ↺ Von vorn: vergisst die Merk-Stelle und beginnt neu. */
export function vorlesenVonVorn(text) {
  if (lauf) merken();
  stellen.delete(sprechSauber(text));
  return starten(text, 0, false);
}

/** ⏹️ Stopp: hält an und merkt sich den Satz, bei dem das Vorlesen war. */
export function vorlesePause() {
  merken();
  vorleseStopp();
}

/** Bricht ab, OHNE sich die Stelle zu merken (z. B. beim Wechsel zur nächsten Frage). */
export function vorleseStopp() {
  const lief = !!lauf;
  lauf = null;
  if (vorlesbar()) { try { window.speechSynthesis.cancel(); } catch { /* still */ } }
  if (lief) melden();
}
