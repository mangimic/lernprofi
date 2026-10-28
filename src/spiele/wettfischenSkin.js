/* ============================================================
   🎣 ANGEL-WETTFISCHEN – dritter Welten-Skin auf der Match-Engine
   (Welt „angeln", Felix' Heimspiel). Richtige Antwort = DU fängst
   den Fisch, falsche = er entwischt zum Gegner. 2 Beißzeiten mit
   je 5 Würfen – bei Gleichstand entscheidet der große Hecht.
   Die Fang-Animation: der Fisch springt aus der See-Mitte zu
   deinem Eimer (links) oder zum Gegner (rechts).
   ============================================================ */
import WETTFISCHEN from "./wettfischen.json";

export const WETTFISCHEN_SKIN = {
  key: "fischen",
  testPrefix: "fischen",
  titel: "🎣 Angel-Wettfischen",
  wissen: "Angel-Wissen",
  daten: WETTFISCHEN,
  regeln: { typ: "abschnitte", abschnitte: 2, chancen: 5 },
  texte: {
    intro: "Richtige Antwort (Wörter &amp; Mathe) = <b>du fängst den Fisch</b>, falsche = er entwischt zum Gegner. <b>2 Beißzeiten mit je 5 Würfen</b> – bei Gleichstand entscheidet der große Hecht!",
    startKnopf: "🎣 Angel auswerfen!",
    abschnittName: "Beißzeit",
    standLabel: "Fische",
    aktionKopf: (s) => `🎯 <b>Wurf ${s.chance + 1} von 5</b>`,
    entscheidungKopf: "⚡ <b>Der große Hecht beißt!</b> Wer diese Frage knackt, landet ihn",
    entscheidungKurz: "⚡ Hecht-Duell",
    okText: (s) => `🐟 <b>Gefangen!</b> Jetzt steht es ${s.mir} : ${s.ihm}.`,
    fehlerText: (richtig, s) => `Vom Haken – richtig wäre <b>„${richtig}“</b>! ${s.gegner.name} schnappt ihn sich: Jetzt steht es ${s.mir} : ${s.ihm}.`,
    naechste: "Nächster Wurf 🎣",
    pausenTitel: () => "🥪 Pausenbrot am Ufer!",
    pausenText: (s) => `<b>Zwischenstand: ${s.mir} : ${s.ihm} Fische</b> – kurz durchatmen und aufs Wasser schauen.`,
    pausenWeiter: (s) => `Weiter – Beißzeit ${s.abschnitt + 1} 🎣`,
    siegTitel: "🏆 Wettfischen gewonnen!",
    endeBilanz: (s) => `Du hast <b>${s.wins} von ${s.balls}</b> Fischen gefangen.`,
  },
  feldSVG: (s) => `<svg id="fischenFeld" viewBox="0 0 340 180" xmlns="http://www.w3.org/2000/svg">
      <rect width="340" height="180" rx="14" fill="#7a9a4e"/>
      <ellipse cx="170" cy="105" rx="130" ry="58" fill="#5d9fd4"/>
      <ellipse cx="170" cy="105" rx="130" ry="58" fill="none" stroke="#cfe8f7" stroke-width="2" opacity="0.7"/>
      <text x="120" y="92" font-size="10" opacity="0.8">🌊</text>
      <text x="216" y="128" font-size="10" opacity="0.8">🌊</text>
      <text x="252" y="76" font-size="11">🪷</text>
      <text x="92" y="142" font-size="11">🪷</text>
      <text id="fischenIch" x="38" y="60" font-size="24" text-anchor="middle">🧒</text>
      <text x="38" y="34" font-size="11" text-anchor="middle" fill="#fff" font-weight="700">${s.name}</text>
      <text x="38" y="84" font-size="15" text-anchor="middle">🪣</text>
      <text x="38" y="102" font-size="10" text-anchor="middle" fill="#fff" font-weight="700">🐟 ${s.mir}</text>
      <text id="fischenGegner" x="302" y="60" font-size="24" text-anchor="middle">${s.gegner.emoji}</text>
      <text x="302" y="34" font-size="11" text-anchor="middle" fill="#fff" font-weight="700">${s.gegner.name}</text>
      <text x="302" y="84" font-size="15" text-anchor="middle">🪣</text>
      <text x="302" y="102" font-size="10" text-anchor="middle" fill="#fff" font-weight="700">🐟 ${s.ihm}</text>
      <text id="fischenFisch" x="170" y="112" font-size="16" text-anchor="middle">🐟</text>
    </svg>`,
  // Der Fisch springt aus der See-Mitte: gefangen → zu deinem Eimer
  // (links), entwischt → hinüber zum Gegner (rechts).
  anim: (s, correct) => ({
    id: "fischenFisch", x0: 170, y0: 112,
    x1: correct ? 44 : 296,
    y1: 78,
    bogen: 42,
  }),
};
