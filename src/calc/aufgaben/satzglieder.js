/* ============================================================
   🔀 SATZGLIEDER UMSTELLEN & ZEIT/ORT – originalgetreu aus der
   Alt-App (nach Könnernachweis 8 „Sprache untersuchen"):
   1) Umstellprobe (art "um"): Satzglied-Bausteine antippen und den
      Satz NEU zusammenbauen – Regel: das Prädikat (Verb) bleibt an
      2. Stelle, und die Reihenfolge muss sich vom Ausgangssatz
      unterscheiden.
   2) Zeit- und Ortsbestimmungen (art "zo"): erst die Zeitbestimmung
      (Wann?), dann die Ortsbestimmung (Wo?) antippen – inklusive
      Sätzen OHNE Ortsbestimmung („Keine da!").
   Bausteine stehen in Satzmitte-Schreibung; am Satzanfang wird der
   erste Buchstabe automatisch groß. Reine Logik, kein DOM.
   ============================================================ */
export const SG_UM_AUFGABEN = [
  { art: "um", teile: ["Nico", "hat", "ein Aquarium", "im Zimmer"], verb: 1 },
  { art: "um", teile: ["tagsüber", "sitzt", "der Wasserfrosch", "auf einem Seerosenblatt"], verb: 1 },
  { art: "um", teile: ["Peter", "spielt", "morgens", "am Seeufer"], verb: 1 },
  { art: "um", teile: ["regelmäßig", "versorgt", "Nico", "die Fische"], verb: 1 },
  { art: "um", teile: ["die Kinder", "besuchen", "am Sonntag", "ihre Großeltern"], verb: 1 },
  { art: "zo", teile: ["jeden Montag", "habe", "ich", "Training"], zeit: 0, ort: null },
  { art: "zo", teile: ["drei Stunden", "üben", "wir", "in der Turnhalle"], zeit: 0, ort: 3 },
  { art: "zo", teile: ["heute", "spielen", "die Kinder", "im Garten"], zeit: 0, ort: 3 },
  { art: "zo", teile: ["morgens", "füttert", "Opa", "auf dem Bauernhof", "die Hühner"], zeit: 0, ort: 3 },
];

/** Pool im Runden-Format (keine schwere Stufe – wie im Original ein fester Satz Aufgaben). */
export function umstellenPool() {
  return { easy: SG_UM_AUFGABEN, hard: [] };
}

/** Baut aus Bausteinen + Reihenfolge den Satz (Satzanfang groß, Punkt am Ende). */
export function umSatzText(teile, folge) {
  const s = folge.map((i) => teile[i]).join(" ");
  return s.charAt(0).toUpperCase() + s.slice(1) + ".";
}

/**
 * Prüft eine vollständige Umstellung.
 * Rückgabe: { richtig, grund } – grund "gleich" (noch der Ausgangssatz)
 * oder "verb" (Prädikat nicht an 2. Stelle).
 */
export function umstellenPruefen(aufgabe, folge) {
  const gleich = folge.length === aufgabe.teile.length && folge.every((v, i) => v === i);
  const verbAn2 = folge[1] === aufgabe.verb;
  if (!gleich && verbAn2) return { richtig: true, grund: null };
  return { richtig: false, grund: gleich ? "gleich" : "verb" };
}

/** Datenqualität (für Tests): Indizes gültig, Arten bekannt. */
export function umstellenGesund(aufgaben = SG_UM_AUFGABEN) {
  return aufgaben.length > 0 && aufgaben.every((a) => {
    if (!Array.isArray(a.teile) || a.teile.length < 4) return false;
    if (a.art === "um") return Number.isInteger(a.verb) && a.verb >= 0 && a.verb < a.teile.length;
    if (a.art === "zo") {
      const zeitOk = Number.isInteger(a.zeit) && a.zeit >= 0 && a.zeit < a.teile.length;
      const ortOk = a.ort === null || (Number.isInteger(a.ort) && a.ort >= 0 && a.ort < a.teile.length && a.ort !== a.zeit);
      return zeitOk && ortOk;
    }
    return false;
  });
}
