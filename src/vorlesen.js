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

/** Liest den Text vor (Laufendes wird abgebrochen). true = Auftrag erteilt. */
export function vorlesen(text) {
  const sauber = sprechSauber(text);
  if (!vorlesbar() || !sauber) return false;
  try {
    window.speechSynthesis.cancel();
    const u = new window.SpeechSynthesisUtterance(sauber);
    u.lang = "de-DE";
    u.rate = 0.9;
    window.speechSynthesis.speak(u);
    return true;
  } catch {
    return false; // manche Browser werfen ohne Nutzer-Geste – dann bleibt es still
  }
}

export function vorleseStopp() {
  if (vorlesbar()) { try { window.speechSynthesis.cancel(); } catch { /* still */ } }
}
