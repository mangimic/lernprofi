/* ============================================================
   🎾⚽ BALLSPORT-SKINS für die Match-Engine (Migration v0.80):
   Tennis- und Fußball-Match laufen jetzt auf derselben Engine wie
   Dino- und Raketen-Rennen – ORIGINALGETREU: gleiche Felder, gleiche
   Zählweisen, gleiche Coach-Leo-Karten (tennis.json/fussball.json,
   per mentalMap auf die festen Engine-Ids übersetzt).
   - Tennis (regeln "saetze"): 15–30–40–Spiel, Entscheidungsball bei
     40:40 (s.mir === 3 && s.ihm === 3), 2 Gewinnspiele, Ballflug.
   - Fußball (regeln "abschnitte"): 2 Halbzeiten × 5 Torchancen,
     bei Gleichstand entscheidet EIN Elfmeter.
   ============================================================ */
import TENNIS from "./tennis.json";
import FUSSBALL from "./fussball.json";

const P = ["0", "15", "30", "40"]; // die Tennis-Zählweise

export const TENNIS_SKIN = {
  key: "tennis",
  testPrefix: "tennis",
  titel: "🎾 Tennis-Match",
  wissen: "Tennis-Wissen",
  daten: TENNIS,
  regeln: { typ: "saetze", punkte: 4, spiele: 2 },
  mentalMap: { aktion1: "aufschlag", aktion2: "return", aktion3: "-", pause: "seitenwechsel", entscheidung: "tiebreak" },
  texte: {
    intro: "Richtige Antwort (Wörter &amp; Mathe) = Punkt für dich, falsche = Punkt für den Gegner. Ein <b>Spiel</b> geht bis 4 Punkte (15 – 30 – 40 – Spiel). Wer zuerst <b>2 Spiele</b> hat, gewinnt das Match.",
    startKnopf: "🎾 Los geht's!",
    kopfzeile: (s) => `Spiel ${s.spielNr} · Spiele ${s.spieleMir}:${s.spieleIhm}`,
    stand: (s) => `${P[Math.min(3, s.mir)]} : ${P[Math.min(3, s.ihm)]}`,
    aktionKopf: (s) => (s.balls % 2 === 0 ? "🎯 Dein <b>Aufschlag</b>" : "🧲 Dein <b>Return</b>"),
    entscheidungsBall: (s) => s.mir === 3 && s.ihm === 3,
    entscheidungsBallText: "⚡ <b>40:40 – Entscheidungsball!</b> Der nächste Punkt holt das Spiel.",
    okText: (s) => `🎾 <b>Punkt für dich!</b> Jetzt steht es ${P[Math.min(3, s.mir)]} : ${P[Math.min(3, s.ihm)]}.`,
    fehlerText: (richtig, s) => `Ins Netz – richtig wäre <b>„${richtig}“</b>! Jetzt steht es ${P[Math.min(3, s.mir)]} : ${P[Math.min(3, s.ihm)]}.`,
    naechste: "Nächster Ball 🎾",
    pausenTitel: (s) => (s.letzterSieg ? "🎉 Spiel für dich!" : `😮 Spiel für ${s.gegner.name}!`),
    pausenText: (s) => `<b>Spiele ${s.spieleMir} : ${s.spieleIhm}</b> – jetzt ist Seitenwechsel.`,
    pausenWeiter: (s) => `Weiter – Spiel ${s.spielNr + 1} 🎾`,
    endstand: (s) => `${s.spieleMir} : ${s.spieleIhm}`,
    endeBilanz: (s) => `Du hast <b>${s.wins} von ${s.balls}</b> Bällen gewonnen.`,
    siegTitel: "🏆 Match gewonnen!",
    niederlageTitel: "💪 Starkes Match!",
  },
  feldSVG: (s) => `<svg id="tennisFeld" viewBox="0 0 340 180" xmlns="http://www.w3.org/2000/svg">
      <rect width="340" height="180" rx="14" fill="#b85f3e"/>
      <rect x="28" y="22" width="284" height="136" fill="#d98559" stroke="#fff" stroke-width="3"/>
      <line x1="98" y1="22" x2="98" y2="158" stroke="#fff" stroke-width="2"/>
      <line x1="242" y1="22" x2="242" y2="158" stroke="#fff" stroke-width="2"/>
      <line x1="98" y1="90" x2="242" y2="90" stroke="#fff" stroke-width="2"/>
      <line x1="170" y1="14" x2="170" y2="166" stroke="#2f2f2f" stroke-width="3"/>
      <line x1="170" y1="14" x2="170" y2="166" stroke="#fff" stroke-width="1" stroke-dasharray="3 3"/>
      <text id="tennisIch" x="56" y="96" font-size="26" text-anchor="middle">🧒</text>
      <text x="56" y="122" font-size="11" text-anchor="middle" fill="#fff" font-weight="700">${s.name}</text>
      <text id="tennisGegner" x="284" y="96" font-size="26" text-anchor="middle">${s.gegner.emoji}</text>
      <text x="284" y="122" font-size="11" text-anchor="middle" fill="#fff" font-weight="700">${s.gegner.name}</text>
      <text id="tennisBall" x="76" y="86" font-size="13" text-anchor="middle">🎾</text>
    </svg>`,
  // Ballflug: gewonnen → vorbei am Gegner, verloren → ins Netz (landet unten)
  anim: (s, correct) => ({
    id: "tennisBall", x0: 76, y0: 86,
    x1: correct ? 300 : 168,
    y1: correct ? (52 + (s.balls % 3) * 30) : 112,
    bogen: 34,
  }),
};

export const FUSSBALL_SKIN = {
  key: "fussball",
  testPrefix: "fb",
  titel: "⚽ Fußball-Match",
  wissen: "Fußball-Wissen",
  daten: FUSSBALL,
  regeln: { typ: "abschnitte", abschnitte: 2, chancen: 5 },
  mentalMap: { aktion1: "torschuss", aktion2: "abwehr", aktion3: "torwart", pause: "halbzeit", entscheidung: "elfmeter" },
  texte: {
    intro: "Richtige Antwort (Wörter &amp; Mathe) = <b>Tor für dich</b>, falsche = Konter-Tor für den Gegner. Es gibt <b>2 Halbzeiten mit je 5 Torchancen</b> – bei Gleichstand entscheidet ein Elfmeter!",
    startKnopf: "⚽ Anstoß!",
    abschnittName: "Halbzeit",
    standLabel: "Tore",
    aktionKopf: (s) => `🎯 <b>Torchance ${s.chance + 1} von 5</b>`,
    entscheidungKopf: "⚡ <b>Elfmeterschießen!</b> Dieser Ball entscheidet das Match",
    entscheidungKurz: "⚡ Elfmeter",
    okText: (s) => `⚽ <b>TOOOR!</b> Jetzt steht es ${s.mir} : ${s.ihm}.`,
    fehlerText: (richtig, s) => `${s.gegner.emoji} Gehalten – richtig wäre <b>„${richtig}“</b>! Konter: Jetzt steht es ${s.mir} : ${s.ihm}.`,
    naechste: "Nächster Ball ⚽",
    pausenTitel: () => "🔁 Halbzeit!",
    pausenText: (s) => `<b>Spielstand: ${s.mir} : ${s.ihm}</b> – kurz durchatmen und auftanken.`,
    pausenWeiter: () => "Weiter – 2. Halbzeit ⚽",
    endeBilanz: (s) => `Du hast <b>${s.wins} von ${s.balls}</b> Bällen verwandelt.`,
    siegTitel: "🏆 Match gewonnen!",
    niederlageTitel: "💪 Starkes Match!",
  },
  feldSVG: (s) => `<svg id="fbFeld" viewBox="0 0 340 180" xmlns="http://www.w3.org/2000/svg">
      <rect width="340" height="180" rx="14" fill="#3f9d54"/>
      <rect x="10" y="12" width="320" height="156" fill="none" stroke="#eaf7ea" stroke-width="2.5"/>
      ${[26, 58, 90, 122, 154, 186, 218, 250, 282].map((x, i) => `<rect x="${x}" y="14" width="16" height="152" fill="#ffffff" opacity="${i % 2 ? 0.05 : 0}"/>`).join("")}
      <circle cx="110" cy="90" r="30" fill="none" stroke="#eaf7ea" stroke-width="2"/>
      <rect x="264" y="42" width="66" height="96" fill="none" stroke="#eaf7ea" stroke-width="2"/>
      <line x1="306" y1="40" x2="306" y2="140" stroke="#fff" stroke-width="4"/>
      <line x1="306" y1="40" x2="330" y2="52" stroke="#fff" stroke-width="3"/>
      <line x1="306" y1="140" x2="330" y2="128" stroke="#fff" stroke-width="3"/>
      ${[52, 68, 84, 100, 116, 132].map((y) => `<line x1="306" y1="${y}" x2="330" y2="${y + 6}" stroke="#dfe8df" stroke-width="1" opacity="0.8"/>`).join("")}
      <text id="fbKeeper" x="296" y="98" font-size="24" text-anchor="middle">${s.gegner.emoji}</text>
      <text x="285" y="160" font-size="11" text-anchor="middle" fill="#fff" font-weight="700">${s.gegner.name}</text>
      <text id="fbIch" x="70" y="112" font-size="26" text-anchor="middle">🧒</text>
      <text x="70" y="134" font-size="11" text-anchor="middle" fill="#fff" font-weight="700">${s.name}</text>
      <text id="fbBall" x="86" y="118" font-size="13" text-anchor="middle">⚽</text>
    </svg>`,
  // Schuss: Tor → Ball fliegt in die Ecke, sonst → der Keeper hält ihn fest
  anim: (s, correct) => ({
    id: "fbBall", x0: 86, y0: 118,
    x1: correct ? 314 : 294,
    y1: correct ? (56 + (s.balls % 3) * 32) : 96,
    bogen: 30,
  }),
};
