/* ============================================================
   🏁 RENN-SKINS für die Match-Engine: 🦖 Dino-Rennen (Welt Dinos)
   und 🚀 Raketen-Rennen (Welt Weltraum). Beide teilen dieselbe
   Streckenlogik: zwei Bahnen, richtig = DU rückst vor, falsch =
   der Gegner. 2 Runden × 5 Aktionen, Gleichstand → Entscheidungs-
   Frage. Nur Farben, Figuren und Sprache unterscheiden sich –
   genau das ist der Beweis für „eine Engine, viele Welten".
   ============================================================ */
import DINO from "./dino.json";
import RAKETE from "./rakete.json";

// Position auf der Strecke (max 11 Punkte: 2×5 + Entscheidung)
const pos = (punkte) => 36 + Math.min(Math.max(punkte, 0), 10) * 26;
const BAHN_ICH = 72, BAHN_GEGNER = 138;

/** Gemeinsames Strecken-SVG: Hintergrund + Ziel + zwei Läufer. */
function rennFeld(p, deko) {
  return (s) => `<svg id="${p}Feld" viewBox="0 0 340 180" xmlns="http://www.w3.org/2000/svg">
      ${deko.hintergrund}
      <line x1="318" y1="14" x2="318" y2="166" stroke="#fff" stroke-width="3" stroke-dasharray="6 4"/>
      <text x="327" y="30" font-size="14" text-anchor="middle">🏁</text>
      <line x1="20" y1="${BAHN_ICH + 16}" x2="320" y2="${BAHN_ICH + 16}" stroke="#ffffff" stroke-width="1" opacity="0.35" stroke-dasharray="2 6"/>
      <line x1="20" y1="${BAHN_GEGNER + 16}" x2="320" y2="${BAHN_GEGNER + 16}" stroke="#ffffff" stroke-width="1" opacity="0.35" stroke-dasharray="2 6"/>
      <text id="${p}Ich" x="${pos(s.mir)}" y="${BAHN_ICH}" font-size="26" text-anchor="middle">${deko.laeufer}</text>
      <text x="30" y="${BAHN_ICH - 26}" font-size="11" fill="#fff" font-weight="700">${s.name}</text>
      <text id="${p}Gegner" x="${pos(s.ihm)}" y="${BAHN_GEGNER}" font-size="26" text-anchor="middle">${s.gegner.emoji}</text>
      <text x="30" y="${BAHN_GEGNER + 34}" font-size="11" fill="#fff" font-weight="700">${s.gegner.name}</text>
    </svg>`;
}

/** Bewegung für die Engine: der Richtige rückt von der alten auf die neue Position. */
function rennAnim(p, bogen) {
  return (s, correct) => {
    const wert = correct ? s.mir : s.ihm;
    const bahn = correct ? BAHN_ICH : BAHN_GEGNER;
    return { id: correct ? `${p}Ich` : `${p}Gegner`, x0: pos(wert - 1), x1: pos(wert), y0: bahn, y1: bahn, bogen };
  };
}

export const DINO_SKIN = {
  key: "dino",
  testPrefix: "dino",
  titel: "🦖 Dino-Rennen",
  wissen: "Dino-Wissen",
  daten: DINO,
  regeln: { typ: "abschnitte", abschnitte: 2, chancen: 5 },
  texte: {
    intro: "Richtige Antwort (Wörter &amp; Mathe) = <b>dein Dino macht einen Riesensprung</b>, falsche = der Gegner sprintet los. <b>2 Runden mit je 5 Sprüngen</b> – bei Gleichstand entscheidet ein Foto-Finish!",
    startKnopf: "🦖 Auf die Plätze!",
    abschnittName: "Runde",
    aktionKopf: (s) => `🦶 <b>Sprung ${s.chance + 1} von 5</b>`,
    entscheidungKopf: "⚡ <b>Foto-Finish!</b> Diese Frage entscheidet das Rennen",
    entscheidungKurz: "⚡ Foto-Finish",
    okText: (s) => `🦖 <b>Riesensprung!</b> Jetzt steht es ${s.mir} : ${s.ihm}.`,
    fehlerText: (richtig, s) => `Gestolpert – richtig wäre <b>„${richtig}“</b>! ${s.gegner.name} sprintet: Jetzt steht es ${s.mir} : ${s.ihm}.`,
    naechste: "Nächster Sprung 🦖",
    pausenTitel: () => "🔁 Verschnaufpause!",
    pausenWeiter: (s) => `Weiter – Runde ${s.abschnitt + 1} 🦖`,
    pausenText: (s) => `<b>Zwischenstand: ${s.mir} : ${s.ihm}</b> – kurz durchatmen und auftanken.`,
    siegTitel: "🏆 Rennen gewonnen!",
  },
  feldSVG: rennFeld("dino", {
    laeufer: "🦖",
    hintergrund: `<rect width="340" height="180" rx="14" fill="#7a9a4e"/>
      <rect y="110" width="340" height="70" rx="14" fill="#8a6242" opacity="0.55"/>
      <text x="300" y="166" font-size="16">🌋</text>
      <text x="48" y="24" font-size="13">🌿</text><text x="150" y="20" font-size="12">🌴</text><text x="252" y="26" font-size="13">🌿</text>`,
  }),
  anim: rennAnim("dino", 22),
};

export const RAKETE_SKIN = {
  key: "rakete",
  testPrefix: "rakete",
  titel: "🚀 Raketen-Rennen",
  wissen: "Weltraum-Wissen",
  daten: RAKETE,
  regeln: { typ: "abschnitte", abschnitte: 2, chancen: 5 },
  texte: {
    intro: "Richtige Antwort (Wörter &amp; Mathe) = <b>deine Rakete bekommt vollen Schub</b>, falsche = der Gegner zieht davon. <b>2 Etappen mit je 5 Zündungen</b> – bei Gleichstand entscheidet das Ziel-Foto an der Mondlinie!",
    startKnopf: "🚀 Countdown starten!",
    abschnittName: "Etappe",
    aktionKopf: (s) => `🔥 <b>Zündung ${s.chance + 1} von 5</b>`,
    entscheidungKopf: "⚡ <b>Ziel-Foto!</b> Diese Frage entscheidet den Wettflug",
    entscheidungKurz: "⚡ Ziel-Foto",
    okText: (s) => `🚀 <b>Voller Schub!</b> Jetzt steht es ${s.mir} : ${s.ihm}.`,
    fehlerText: (richtig, s) => `Fehlzündung – richtig wäre <b>„${richtig}“</b>! ${s.gegner.name} zieht davon: Jetzt steht es ${s.mir} : ${s.ihm}.`,
    naechste: "Nächste Zündung 🚀",
    pausenTitel: () => "🛰️ Boxenstopp an der Raumstation!",
    pausenWeiter: (s) => `Weiter – Etappe ${s.abschnitt + 1} 🚀`,
    pausenText: (s) => `<b>Zwischenstand: ${s.mir} : ${s.ihm}</b> – kurz durchatmen und auftanken.`,
    siegTitel: "🏆 Wettflug gewonnen!",
  },
  feldSVG: rennFeld("rakete", {
    laeufer: "🚀",
    hintergrund: `<rect width="340" height="180" rx="14" fill="#1d2b53"/>
      <text x="300" y="36" font-size="20">🌕</text>
      <text x="60" y="30" font-size="9">✨</text><text x="140" y="46" font-size="8">⭐</text>
      <text x="220" y="24" font-size="9">✨</text><text x="96" y="168" font-size="9">⭐</text>
      <text x="258" y="162" font-size="8">✨</text><text x="180" y="156" font-size="14">🪐</text>`,
  }),
  anim: rennAnim("rakete", 10),
};

export const MATCH_SKINS = { dino: DINO_SKIN, rakete: RAKETE_SKIN };
