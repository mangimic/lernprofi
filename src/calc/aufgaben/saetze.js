/* Satz-Pools für den „Wörter antippen"-Übungstyp (aus der Alt-App v1.86):
   Subjekte, Prädikate (auch zweiteilige wie „wechselt … aus"), Groß/Klein.
   Reine Daten + Normalisierer auf das Tippen-Format:
   { woerter, ziel:[Indizes], frage, loesung, tipp } */
export const SUBJ_THEMEN = {
  alltag:{ name:"Alltag", emoji:"🌳", saetze:[
    {woerter:["Der","kleine","Junge","spielt","mit","dem","Ball."], subj:[0,1,2], subjektText:"Der kleine Junge", art:"wer", frage:"Wer oder was spielt mit dem Ball?"},
    {woerter:["Ein","Mädchen","streichelt","die","süße","Katze."], subj:[0,1], subjektText:"Ein Mädchen", art:"wer", frage:"Wer oder was streichelt die süße Katze?"},
    {woerter:["Der","Postbote","kommt","mit","dem","Fahrrad."], subj:[0,1], subjektText:"Der Postbote", art:"wer", frage:"Wer oder was kommt mit dem Fahrrad?"},
    {woerter:["Der","Mann","öffnet","die","Tür."], subj:[0,1], subjektText:"Der Mann", art:"wer", frage:"Wer oder was öffnet die Tür?"},
    {woerter:["Der","Ball","springt","hoch."], subj:[0,1], subjektText:"Der Ball", art:"was", frage:"Wer oder was springt hoch?"},
    {woerter:["Schildkröten","sind","Reptilien."], subj:[0], subjektText:"Schildkröten", art:"was", frage:"Wer oder was sind Reptilien?"},
    {woerter:["Ihr","Panzer","schützt","sie","vor","Gefahren."], subj:[0,1], subjektText:"Ihr Panzer", art:"was", frage:"Wer oder was schützt sie vor Gefahren?"},
    {woerter:["Sie","fressen","Früchte","und","Gemüse."], subj:[0], subjektText:"Sie", art:"was", frage:"Wer oder was frisst Früchte und Gemüse?"},
    {woerter:["Am","Morgen","singt","der","Vogel","laut."], subj:[3,4], subjektText:"der Vogel", art:"was", frage:"Wer oder was singt laut?"},
    {woerter:["Heute","backt","die","Oma","einen","Kuchen."], subj:[2,3], subjektText:"die Oma", art:"wer", frage:"Wer oder was backt einen Kuchen?"},
    {woerter:["Im","Garten","spielen","die","Kinder."], subj:[3,4], subjektText:"die Kinder", art:"wer", frage:"Wer oder was spielt im Garten?"}
  ]},
  angeln:{ name:"Angeln", emoji:"🎣", saetze:[
    {woerter:["Der","Angler","wirft","die","Schnur","aus."], subj:[0,1], subjektText:"Der Angler", art:"wer", frage:"Wer oder was wirft die Schnur aus?"},
    {woerter:["Ein","großer","Hecht","schwimmt","im","See."], subj:[0,1,2], subjektText:"Ein großer Hecht", art:"was", frage:"Wer oder was schwimmt im See?"},
    {woerter:["Die","Pose","taucht","plötzlich","unter."], subj:[0,1], subjektText:"Die Pose", art:"was", frage:"Wer oder was taucht plötzlich unter?"},
    {woerter:["Der","Junge","fängt","einen","Zander."], subj:[0,1], subjektText:"Der Junge", art:"wer", frage:"Wer oder was fängt einen Zander?"},
    {woerter:["Der","Wurm","zappelt","am","Haken."], subj:[0,1], subjektText:"Der Wurm", art:"was", frage:"Wer oder was zappelt am Haken?"},
    {woerter:["Die","Rotfeder","frisst","kleine","Insekten."], subj:[0,1], subjektText:"Die Rotfeder", art:"was", frage:"Wer oder was frisst kleine Insekten?"},
    {woerter:["Am","Ufer","sitzt","der","Angler","ruhig."], subj:[3,4], subjektText:"der Angler", art:"wer", frage:"Wer oder was sitzt ruhig am Ufer?"},
    {woerter:["Die","Angelrute","biegt","sich","stark."], subj:[0,1], subjektText:"Die Angelrute", art:"was", frage:"Wer oder was biegt sich stark?"},
    {woerter:["Im","Wasser","glänzen","die","Fische."], subj:[3,4], subjektText:"die Fische", art:"was", frage:"Wer oder was glänzt im Wasser?"},
    {woerter:["Der","Kescher","hebt","den","Fisch","heraus."], subj:[0,1], subjektText:"Der Kescher", art:"was", frage:"Wer oder was hebt den Fisch heraus?"},
    {woerter:["Zwei","Angler","teilen","sich","ein","Boot."], subj:[0,1], subjektText:"Zwei Angler", art:"wer", frage:"Wer oder was teilt sich ein Boot?"}
  ]},
  tennis:{ name:"Tennis", emoji:"🎾", saetze:[
    {woerter:["Der","Junge","schlägt","den","Ball."], subj:[0,1], subjektText:"Der Junge", art:"wer", frage:"Wer oder was schlägt den Ball?"},
    {woerter:["Die","Spielerin","gewinnt","das","Spiel."], subj:[0,1], subjektText:"Die Spielerin", art:"wer", frage:"Wer oder was gewinnt das Spiel?"},
    {woerter:["Der","Ball","fliegt","über","das","Netz."], subj:[0,1], subjektText:"Der Ball", art:"was", frage:"Wer oder was fliegt über das Netz?"},
    {woerter:["Der","Trainer","zeigt","den","Aufschlag."], subj:[0,1], subjektText:"Der Trainer", art:"wer", frage:"Wer oder was zeigt den Aufschlag?"},
    {woerter:["Zwei","Freunde","spielen","ein","Match."], subj:[0,1], subjektText:"Zwei Freunde", art:"wer", frage:"Wer oder was spielt ein Match?"},
    {woerter:["Am","Netz","steht","der","Spieler","bereit."], subj:[3,4], subjektText:"der Spieler", art:"wer", frage:"Wer oder was steht am Netz bereit?"},
    {woerter:["Die","Zuschauer","klatschen","laut."], subj:[0,1], subjektText:"Die Zuschauer", art:"wer", frage:"Wer oder was klatscht laut?"}
  ]},
  fussball:{ name:"Fußball", emoji:"⚽", saetze:[
    {woerter:["Der","Stürmer","schießt","ein","Tor."], subj:[0,1], subjektText:"Der Stürmer", art:"wer", frage:"Wer oder was schießt ein Tor?"},
    {woerter:["Der","Torwart","hält","den","Ball."], subj:[0,1], subjektText:"Der Torwart", art:"wer", frage:"Wer oder was hält den Ball?"},
    {woerter:["Die","Mannschaft","gewinnt","das","Spiel."], subj:[0,1], subjektText:"Die Mannschaft", art:"wer", frage:"Wer oder was gewinnt das Spiel?"},
    {woerter:["Der","Ball","rollt","ins","Tor."], subj:[0,1], subjektText:"Der Ball", art:"was", frage:"Wer oder was rollt ins Tor?"},
    {woerter:["Der","Schiedsrichter","pfeift","ein","Foul."], subj:[0,1], subjektText:"Der Schiedsrichter", art:"wer", frage:"Wer oder was pfeift ein Foul?"},
    {woerter:["Am","Spielfeldrand","steht","der","Trainer."], subj:[3,4], subjektText:"der Trainer", art:"wer", frage:"Wer oder was steht am Spielfeldrand?"},
    {woerter:["Die","Fans","jubeln","laut."], subj:[0,1], subjektText:"Die Fans", art:"wer", frage:"Wer oder was jubelt laut?"}
  ]}
};

export const SUBJ_K4 = {
  alltag:[
    {woerter:["Am","frühen","Morgen","weckt","der","laute","Hahn","die","Kinder."], subj:[4,5,6], subjektText:"der laute Hahn", art:"was", frage:"Wer oder was weckt die Kinder?"},
    {woerter:["Nach","dem","Essen","räumt","der","Junge","den","Tisch","ab."], subj:[4,5], subjektText:"der Junge", art:"wer", frage:"Wer oder was räumt den Tisch ab?"},
    {woerter:["Der","Junge","und","seine","Schwester","bauen","eine","Sandburg."], subj:[0,1,2,3,4], subjektText:"Der Junge und seine Schwester", art:"wer", frage:"Wer oder was baut eine Sandburg?"},
    {woerter:["Am","Abend","liest","die","Mutter","eine","Geschichte","vor."], subj:[3,4], subjektText:"die Mutter", art:"wer", frage:"Wer oder was liest eine Geschichte vor?"},
    {woerter:["Nach","der","Schule","haben","die","Kinder","Fußball","gespielt."], subj:[4,5], subjektText:"die Kinder", art:"wer", frage:"Wer oder was hat Fußball gespielt?"}
  ],
  angeln:[
    {woerter:["Am","frühen","Morgen","wirft","der","Angler","die","Schnur","aus."], subj:[4,5], subjektText:"der Angler", art:"wer", frage:"Wer oder was wirft die Schnur aus?"},
    {woerter:["Der","Angler","und","sein","Sohn","sitzen","im","Boot."], subj:[0,1,2,3,4], subjektText:"Der Angler und sein Sohn", art:"wer", frage:"Wer oder was sitzt im Boot?"},
    {woerter:["Plötzlich","taucht","die","rote","Pose","unter."], subj:[2,3,4], subjektText:"die rote Pose", art:"was", frage:"Wer oder was taucht unter?"},
    {woerter:["Am","Ufer","packt","der","Junge","seine","Angel","ein."], subj:[3,4], subjektText:"der Junge", art:"wer", frage:"Wer oder was packt seine Angel ein?"},
    {woerter:["Nach","einer","Stunde","hat","der","Angler","einen","Hecht","gefangen."], subj:[4,5], subjektText:"der Angler", art:"wer", frage:"Wer oder was hat einen Hecht gefangen?"}
  ],
  tennis:[
    {woerter:["Vor","dem","Spiel","räumt","der","Junge","die","Bälle","weg."], subj:[4,5], subjektText:"der Junge", art:"wer", frage:"Wer oder was räumt die Bälle weg?"},
    {woerter:["Der","Junge","und","seine","Freundin","spielen","ein","Match."], subj:[0,1,2,3,4], subjektText:"Der Junge und seine Freundin", art:"wer", frage:"Wer oder was spielt ein Match?"},
    {woerter:["Am","Netz","gibt","der","Spieler","dem","Trainer","die","Hand."], subj:[3,4], subjektText:"der Spieler", art:"wer", frage:"Wer oder was gibt die Hand?"},
    {woerter:["Nach","dem","Aufschlag","läuft","der","Junge","zum","Netz."], subj:[4,5], subjektText:"der Junge", art:"wer", frage:"Wer oder was läuft zum Netz?"},
    {woerter:["Am","Ende","hat","die","Spielerin","das","Match","gewonnen."], subj:[3,4], subjektText:"die Spielerin", art:"wer", frage:"Wer oder was hat das Match gewonnen?"}
  ],
  fussball:[
    {woerter:["In","der","Pause","wechselt","der","Trainer","den","Torwart","aus."], subj:[4,5], subjektText:"der Trainer", art:"wer", frage:"Wer oder was wechselt den Torwart aus?"},
    {woerter:["Der","Stürmer","und","der","Verteidiger","laufen","schnell."], subj:[0,1,2,3,4], subjektText:"Der Stürmer und der Verteidiger", art:"wer", frage:"Wer oder was läuft schnell?"},
    {woerter:["Nach","dem","Foul","zeigt","der","Schiedsrichter","die","Karte."], subj:[4,5], subjektText:"der Schiedsrichter", art:"wer", frage:"Wer oder was zeigt die Karte?"},
    {woerter:["Am","Spielfeldrand","feuert","der","Trainer","die","Spieler","an."], subj:[3,4], subjektText:"der Trainer", art:"wer", frage:"Wer oder was feuert die Spieler an?"},
    {woerter:["Am","Ende","hat","die","Mannschaft","das","Spiel","gewonnen."], subj:[3,4], subjektText:"die Mannschaft", art:"wer", frage:"Wer oder was hat das Spiel gewonnen?"}
  ]
};

export const PRAED_THEMEN = {
  alltag:{ name:"Alltag", emoji:"🌳", saetze:[
    {woerter:["Der","kleine","Junge","spielt","mit","dem","Ball."], praed:[3], praedText:"spielt"},
    {woerter:["Ein","Mädchen","streichelt","die","süße","Katze."], praed:[2], praedText:"streichelt"},
    {woerter:["Der","Postbote","kommt","mit","dem","Fahrrad."], praed:[2], praedText:"kommt"},
    {woerter:["Der","Mann","öffnet","die","Tür."], praed:[2], praedText:"öffnet"},
    {woerter:["Der","Ball","springt","hoch."], praed:[2], praedText:"springt"},
    {woerter:["Schildkröten","sind","Reptilien."], praed:[1], praedText:"sind"},
    {woerter:["Ihr","Panzer","schützt","sie","vor","Gefahren."], praed:[2], praedText:"schützt"},
    {woerter:["Sie","fressen","Früchte","und","Gemüse."], praed:[1], praedText:"fressen"},
    {woerter:["Am","Morgen","singt","der","Vogel","laut."], praed:[2], praedText:"singt"},
    {woerter:["Heute","backt","die","Oma","einen","Kuchen."], praed:[1], praedText:"backt"},
    {woerter:["Im","Garten","spielen","die","Kinder."], praed:[2], praedText:"spielen"}
  ]},
  angeln:{ name:"Angeln", emoji:"🎣", saetze:[
    {woerter:["Der","Angler","wirft","die","Schnur","aus."], praed:[2,5], praedText:"wirft … aus"},
    {woerter:["Ein","großer","Hecht","schwimmt","im","See."], praed:[3], praedText:"schwimmt"},
    {woerter:["Die","Pose","taucht","plötzlich","unter."], praed:[2,4], praedText:"taucht … unter"},
    {woerter:["Der","Junge","fängt","einen","Zander."], praed:[2], praedText:"fängt"},
    {woerter:["Der","Wurm","zappelt","am","Haken."], praed:[2], praedText:"zappelt"},
    {woerter:["Die","Rotfeder","frisst","kleine","Insekten."], praed:[2], praedText:"frisst"},
    {woerter:["Am","Ufer","sitzt","der","Angler","ruhig."], praed:[2], praedText:"sitzt"},
    {woerter:["Die","Angelrute","biegt","sich","stark."], praed:[2], praedText:"biegt"},
    {woerter:["Im","Wasser","glänzen","die","Fische."], praed:[2], praedText:"glänzen"},
    {woerter:["Der","Kescher","hebt","den","Fisch","heraus."], praed:[2,5], praedText:"hebt … heraus"},
    {woerter:["Zwei","Angler","teilen","sich","ein","Boot."], praed:[2], praedText:"teilen"}
  ]},
  tennis:{ name:"Tennis", emoji:"🎾", saetze:[
    {woerter:["Der","Junge","schlägt","den","Ball."], praed:[2], praedText:"schlägt"},
    {woerter:["Die","Spielerin","gewinnt","das","Spiel."], praed:[2], praedText:"gewinnt"},
    {woerter:["Der","Ball","fliegt","über","das","Netz."], praed:[2], praedText:"fliegt"},
    {woerter:["Der","Trainer","zeigt","den","Aufschlag."], praed:[2], praedText:"zeigt"},
    {woerter:["Zwei","Freunde","spielen","ein","Match."], praed:[2], praedText:"spielen"},
    {woerter:["Am","Netz","steht","der","Spieler","bereit."], praed:[2], praedText:"steht"},
    {woerter:["Die","Zuschauer","klatschen","laut."], praed:[2], praedText:"klatschen"}
  ]},
  fussball:{ name:"Fußball", emoji:"⚽", saetze:[
    {woerter:["Der","Stürmer","schießt","ein","Tor."], praed:[2], praedText:"schießt"},
    {woerter:["Der","Torwart","hält","den","Ball."], praed:[2], praedText:"hält"},
    {woerter:["Die","Mannschaft","gewinnt","das","Spiel."], praed:[2], praedText:"gewinnt"},
    {woerter:["Der","Ball","rollt","ins","Tor."], praed:[2], praedText:"rollt"},
    {woerter:["Der","Schiedsrichter","pfeift","ein","Foul."], praed:[2], praedText:"pfeift"},
    {woerter:["Am","Spielfeldrand","steht","der","Trainer."], praed:[2], praedText:"steht"},
    {woerter:["Die","Fans","jubeln","laut."], praed:[2], praedText:"jubeln"}
  ]}
};

export const PRAED_K4 = {
  alltag:[
    {woerter:["Am","frühen","Morgen","weckt","der","laute","Hahn","die","Kinder."], praed:[3], praedText:"weckt"},
    {woerter:["Nach","dem","Essen","räumt","der","Junge","den","Tisch","ab."], praed:[3,8], praedText:"räumt … ab"},
    {woerter:["Der","Junge","und","seine","Schwester","bauen","eine","Sandburg."], praed:[5], praedText:"bauen"},
    {woerter:["Am","Abend","liest","die","Mutter","eine","Geschichte","vor."], praed:[2,7], praedText:"liest … vor"},
    {woerter:["Nach","der","Schule","haben","die","Kinder","Fußball","gespielt."], praed:[3,7], praedText:"haben … gespielt"}
  ],
  angeln:[
    {woerter:["Am","frühen","Morgen","wirft","der","Angler","die","Schnur","aus."], praed:[3,8], praedText:"wirft … aus"},
    {woerter:["Der","Angler","und","sein","Sohn","sitzen","im","Boot."], praed:[5], praedText:"sitzen"},
    {woerter:["Plötzlich","taucht","die","rote","Pose","unter."], praed:[1,5], praedText:"taucht … unter"},
    {woerter:["Am","Ufer","packt","der","Junge","seine","Angel","ein."], praed:[2,7], praedText:"packt … ein"},
    {woerter:["Nach","einer","Stunde","hat","der","Angler","einen","Hecht","gefangen."], praed:[3,8], praedText:"hat … gefangen"}
  ],
  tennis:[
    {woerter:["Vor","dem","Spiel","räumt","der","Junge","die","Bälle","weg."], praed:[3,8], praedText:"räumt … weg"},
    {woerter:["Der","Junge","und","seine","Freundin","spielen","ein","Match."], praed:[5], praedText:"spielen"},
    {woerter:["Am","Netz","gibt","der","Spieler","dem","Trainer","die","Hand."], praed:[2], praedText:"gibt"},
    {woerter:["Nach","dem","Aufschlag","läuft","der","Junge","zum","Netz."], praed:[3], praedText:"läuft"},
    {woerter:["Am","Ende","hat","die","Spielerin","das","Match","gewonnen."], praed:[2,7], praedText:"hat … gewonnen"}
  ],
  fussball:[
    {woerter:["In","der","Pause","wechselt","der","Trainer","den","Torwart","aus."], praed:[3,8], praedText:"wechselt … aus"},
    {woerter:["Der","Stürmer","und","der","Verteidiger","laufen","schnell."], praed:[5], praedText:"laufen"},
    {woerter:["Nach","dem","Foul","zeigt","der","Schiedsrichter","die","Karte."], praed:[3], praedText:"zeigt"},
    {woerter:["Am","Spielfeldrand","feuert","der","Trainer","die","Spieler","an."], praed:[2,7], praedText:"feuert … an"},
    {woerter:["Am","Ende","hat","die","Mannschaft","das","Spiel","gewonnen."], praed:[2,7], praedText:"hat … gewonnen"}
  ]
};

export const GK_THEMEN = {
  alltag:{ name:"Alltag", emoji:"🌳", saetze:[
    {woerter:["der","kleine","junge","spielt","mit","dem","ball."], gross:[0,2,6]},
    {woerter:["ein","mädchen","streichelt","die","süße","katze."], gross:[0,1,5]},
    {woerter:["der","postbote","kommt","mit","dem","fahrrad."], gross:[0,1,5]},
    {woerter:["am","morgen","singt","der","vogel","laut."], gross:[0,1,4]},
    {woerter:["die","kinder","spielen","im","garten."], gross:[0,1,4]},
    {woerter:["heute","backt","die","oma","einen","kuchen."], gross:[0,3,5]}
  ]},
  angeln:{ name:"Angeln", emoji:"🎣", saetze:[
    {woerter:["der","angler","wirft","die","schnur","aus."], gross:[0,1,4]},
    {woerter:["ein","großer","hecht","schwimmt","im","see."], gross:[0,2,5]},
    {woerter:["die","pose","taucht","plötzlich","unter."], gross:[0,1]},
    {woerter:["der","junge","fängt","einen","zander."], gross:[0,1,4]},
    {woerter:["der","wurm","zappelt","am","haken."], gross:[0,1,4]},
    {woerter:["der","kescher","hebt","den","fisch","heraus."], gross:[0,1,4]}
  ]},
  tennis:{ name:"Tennis", emoji:"🎾", saetze:[
    {woerter:["der","junge","schlägt","den","ball."], gross:[0,1,4]},
    {woerter:["die","spielerin","gewinnt","das","spiel."], gross:[0,1,4]},
    {woerter:["der","ball","fliegt","über","das","netz."], gross:[0,1,5]},
    {woerter:["der","trainer","zeigt","den","aufschlag."], gross:[0,1,4]},
    {woerter:["zwei","freunde","spielen","ein","match."], gross:[0,1,4]},
    {woerter:["die","zuschauer","klatschen","laut."], gross:[0,1]}
  ]},
  fussball:{ name:"Fußball", emoji:"⚽", saetze:[
    {woerter:["der","stürmer","schießt","ein","tor."], gross:[0,1,4]},
    {woerter:["der","torwart","hält","den","ball."], gross:[0,1,4]},
    {woerter:["die","mannschaft","gewinnt","das","spiel."], gross:[0,1,4]},
    {woerter:["der","junge","spielt","im","verein."], gross:[0,1,4]},
    {woerter:["der","ball","rollt","ins","tor."], gross:[0,1,4]},
    {woerter:["die","fans","jubeln","laut."], gross:[0,1]}
  ]}
};

import { nurThema } from "./themen.js";
const flach = (themen, thema) => Object.values(nurThema(themen, thema)).flatMap((t) => Array.isArray(t) ? t : t.saetze);

export function subjektPool(thema) {
  const norm = (a) => ({
    woerter: a.woerter, ziel: a.subj,
    frage: a.frage || "Wer oder was? Tippe das Subjekt an.",
    loesung: a.subjektText,
    tipp: "Frage „Wer oder was …?“ – die Antwort ist das Subjekt (kann aus mehreren Wörtern bestehen).",
  });
  return { easy: flach(SUBJ_THEMEN, thema).map(norm), hard: flach(SUBJ_K4, thema).map(norm) };
}

export function praedikatPool(thema) {
  const norm = (a) => ({
    woerter: a.woerter, ziel: a.praed,
    frage: "Was tut jemand? Tippe das Prädikat an.",
    loesung: a.praedText,
    tipp: "Das Prädikat ist das Tu-Wort des Satzes – manchmal zweiteilig (räumt … ab).",
  });
  return { easy: flach(PRAED_THEMEN, thema).map(norm), hard: flach(PRAED_K4, thema).map(norm) };
}

export function gkPool(thema) {
  const gross = (w) => w.charAt(0).toUpperCase() + w.slice(1);
  const norm = (a) => ({
    woerter: a.woerter, ziel: a.gross,
    frage: "Welche Wörter schreibt man GROSS? Tippe sie an.",
    loesung: a.gross.map((i) => gross(a.woerter[i])).join(", "),
    tipp: "Großgeschrieben werden Satzanfänge und Nomen (Namenwörter) – mach die Artikel-Probe: der/die/das davor?",
  });
  return { easy: flach(GK_THEMEN, thema).map(norm), hard: [] };
}
