/* Rohdaten aus der Alt-App v1.86: Zeitformen, Wortarten, Fälle,
   wörtliche Rede, Grundwortschatz-Regelgruppen. Konverter in deutschKonverter.js */
export const ZEIT_THEMEN = {
  alltag:{ name:"Alltag", emoji:"🌳", saetze:[
    {satz:"Der Junge spielt mit dem Ball.", form:"praesens"},
    {satz:"Der Junge spielte mit dem Ball.", form:"praeteritum"},
    {satz:"Der Junge hat mit dem Ball gespielt.", form:"perfekt"},
    {satz:"Der Junge wird mit dem Ball spielen.", form:"futur"},
    {satz:"Die Oma backt einen Kuchen.", form:"praesens"},
    {satz:"Die Oma backte einen Kuchen.", form:"praeteritum"},
    {satz:"Die Oma hat einen Kuchen gebacken.", form:"perfekt"},
    {satz:"Die Oma wird einen Kuchen backen.", form:"futur"}
  ]},
  angeln:{ name:"Angeln", emoji:"🎣", saetze:[
    {satz:"Der Angler wirft die Schnur aus.", form:"praesens"},
    {satz:"Der Angler warf die Schnur aus.", form:"praeteritum"},
    {satz:"Der Angler hat die Schnur ausgeworfen.", form:"perfekt"},
    {satz:"Der Angler wird die Schnur auswerfen.", form:"futur"},
    {satz:"Der Junge fängt einen Zander.", form:"praesens"},
    {satz:"Der Junge fing einen Zander.", form:"praeteritum"},
    {satz:"Der Junge hat einen Zander gefangen.", form:"perfekt"},
    {satz:"Der Junge wird einen Zander fangen.", form:"futur"}
  ]},
  tennis:{ name:"Tennis", emoji:"🎾", saetze:[
    {satz:"Der Junge schlägt den Ball.", form:"praesens"},
    {satz:"Der Junge schlug den Ball.", form:"praeteritum"},
    {satz:"Der Junge hat den Ball geschlagen.", form:"perfekt"},
    {satz:"Der Junge wird den Ball schlagen.", form:"futur"},
    {satz:"Die Spielerin gewinnt das Match.", form:"praesens"},
    {satz:"Die Spielerin gewann das Match.", form:"praeteritum"},
    {satz:"Die Spielerin hat das Match gewonnen.", form:"perfekt"},
    {satz:"Die Spielerin wird das Match gewinnen.", form:"futur"}
  ]},
  fussball:{ name:"Fußball", emoji:"⚽", saetze:[
    {satz:"Der Stürmer schießt ein Tor.", form:"praesens"},
    {satz:"Der Stürmer schoss ein Tor.", form:"praeteritum"},
    {satz:"Der Stürmer hat ein Tor geschossen.", form:"perfekt"},
    {satz:"Der Stürmer wird ein Tor schießen.", form:"futur"},
    {satz:"Der Torwart hält den Ball.", form:"praesens"},
    {satz:"Der Torwart hielt den Ball.", form:"praeteritum"},
    {satz:"Der Torwart hat den Ball gehalten.", form:"perfekt"},
    {satz:"Der Torwart wird den Ball halten.", form:"futur"}
  ]}
};

export const WA_THEMEN = {
  alltag:{ name:"Alltag", emoji:"🌳", saetze:[
    {woerter:["Der","schnelle","Hund","bellt","laut."], ziel:2, art:"nomen"},
    {woerter:["Die","kleine","Katze","schläft."], ziel:1, art:"adjektiv"},
    {woerter:["Der","Junge","rennt","schnell."], ziel:2, art:"verb"},
    {woerter:["Ein","großer","Baum","steht","dort."], ziel:1, art:"adjektiv"},
    {woerter:["Die","Oma","backt","einen","Kuchen."], ziel:2, art:"verb"},
    {woerter:["Das","rote","Auto","fährt."], ziel:2, art:"nomen"}
  ]},
  angeln:{ name:"Angeln", emoji:"🎣", saetze:[
    {woerter:["Der","große","Hecht","schwimmt."], ziel:2, art:"nomen"},
    {woerter:["Der","Angler","wirft","die","Schnur."], ziel:2, art:"verb"},
    {woerter:["Die","schöne","Pose","tanzt."], ziel:1, art:"adjektiv"},
    {woerter:["Der","Wurm","zappelt","am","Haken."], ziel:1, art:"nomen"},
    {woerter:["Der","Junge","fängt","einen","Zander."], ziel:2, art:"verb"},
    {woerter:["Die","glänzenden","Fische","springen."], ziel:1, art:"adjektiv"}
  ]},
  tennis:{ name:"Tennis", emoji:"🎾", saetze:[
    {woerter:["Der","schnelle","Ball","fliegt."], ziel:2, art:"nomen"},
    {woerter:["Die","junge","Spielerin","gewinnt."], ziel:1, art:"adjektiv"},
    {woerter:["Der","Junge","schlägt","stark."], ziel:2, art:"verb"},
    {woerter:["Ein","neuer","Schläger","liegt","dort."], ziel:1, art:"adjektiv"},
    {woerter:["Der","Trainer","lobt","das","Kind."], ziel:2, art:"verb"},
    {woerter:["Das","gelbe","Netz","hängt","hoch."], ziel:2, art:"nomen"}
  ]},
  fussball:{ name:"Fußball", emoji:"⚽", saetze:[
    {woerter:["Der","starke","Stürmer","schießt."], ziel:2, art:"nomen"},
    {woerter:["Die","gute","Mannschaft","gewinnt."], ziel:1, art:"adjektiv"},
    {woerter:["Der","Torwart","hält","sicher."], ziel:2, art:"verb"},
    {woerter:["Ein","schnelles","Tor","fällt","gleich."], ziel:1, art:"adjektiv"},
    {woerter:["Der","Junge","schießt","den","Ball."], ziel:2, art:"verb"},
    {woerter:["Das","runde","Tor","steht","dort."], ziel:2, art:"nomen"}
  ]}
};

export const WA_K4 = {
  alltag:[
    {woerter:["Der","Junge","zeigt","große","Freude."], ziel:4, art:"nomen"},
    {woerter:["Der","schnellere","Läufer","gewinnt","das","Rennen."], ziel:1, art:"adjektiv"},
    {woerter:["Am","Abend","liest","die","Mutter","ein","Buch."], ziel:2, art:"verb"},
    {woerter:["Das","Klassenzimmer","ist","hell","und","sauber."], ziel:1, art:"nomen"},
    {woerter:["Der","kluge","Schüler","denkt","genau","nach."], ziel:1, art:"adjektiv"},
    {woerter:["Im","Garten","pflanzt","der","Opa","Blumen."], ziel:2, art:"verb"}
  ],
  angeln:[
    {woerter:["Der","Angler","hat","große","Geduld."], ziel:4, art:"nomen"},
    {woerter:["Der","größere","Hecht","frisst","kleine","Fische."], ziel:1, art:"adjektiv"},
    {woerter:["Am","Ufer","wartet","der","Angler","ruhig."], ziel:2, art:"verb"},
    {woerter:["Die","Angelrute","liegt","im","Boot."], ziel:1, art:"nomen"},
    {woerter:["Der","geduldige","Angler","fängt","viele","Fische."], ziel:1, art:"adjektiv"},
    {woerter:["Im","See","schwimmen","die","großen","Hechte."], ziel:2, art:"verb"}
  ],
  tennis:[
    {woerter:["Die","Spielerin","zeigt","große","Freude."], ziel:4, art:"nomen"},
    {woerter:["Der","bessere","Spieler","gewinnt","das","Match."], ziel:1, art:"adjektiv"},
    {woerter:["Am","Netz","wartet","der","Junge","gespannt."], ziel:2, art:"verb"},
    {woerter:["Der","Tennisplatz","ist","heute","frei."], ziel:1, art:"nomen"},
    {woerter:["Der","starke","Spieler","schlägt","fest."], ziel:1, art:"adjektiv"},
    {woerter:["Nach","dem","Spiel","trinken","die","Kinder","Wasser."], ziel:3, art:"verb"}
  ],
  fussball:[
    {woerter:["Die","Mannschaft","zeigt","großen","Mut."], ziel:4, art:"nomen"},
    {woerter:["Der","schnellere","Stürmer","schießt","ein","Tor."], ziel:1, art:"adjektiv"},
    {woerter:["Am","Tor","steht","der","Torwart","bereit."], ziel:2, art:"verb"},
    {woerter:["Das","Fußballspiel","beginnt","gleich."], ziel:1, art:"nomen"},
    {woerter:["Der","starke","Verteidiger","gewinnt","den","Zweikampf."], ziel:1, art:"adjektiv"},
    {woerter:["Nach","dem","Tor","jubeln","die","Fans","laut."], ziel:3, art:"verb"}
  ]
};

export const FAELLE_THEMEN = {
  alltag:{ name:"Alltag", emoji:"🌳", saetze:[
    {woerter:["Der","Hund","bellt","laut."], ziel:[0,1], fall:"nom", frage:"Wer bellt?"},
    {woerter:["Ich","sehe","den","Hund."], ziel:[2,3], fall:"akk", frage:"Wen sehe ich?"},
    {woerter:["Ich","gebe","dem","Hund","einen","Knochen."], ziel:[2,3], fall:"dat", frage:"Wem gebe ich einen Knochen?"},
    {woerter:["Das","ist","das","Haus","des","Nachbarn."], ziel:[4,5], fall:"gen", frage:"Wessen Haus ist das?"},
    {woerter:["Die","Katze","schläft."], ziel:[0,1], fall:"nom", frage:"Wer schläft?"},
    {woerter:["Ich","streichle","die","Katze."], ziel:[2,3], fall:"akk", frage:"Wen streichle ich?"}
  ]},
  angeln:{ name:"Angeln", emoji:"🎣", saetze:[
    {woerter:["Der","Angler","wirft","die","Schnur."], ziel:[0,1], fall:"nom", frage:"Wer wirft die Schnur?"},
    {woerter:["Der","Angler","fängt","den","Hecht."], ziel:[3,4], fall:"akk", frage:"Wen fängt der Angler?"},
    {woerter:["Der","Junge","gibt","dem","Angler","den","Kescher."], ziel:[3,4], fall:"dat", frage:"Wem gibt der Junge den Kescher?"},
    {woerter:["Das","ist","die","Rute","des","Anglers."], ziel:[4,5], fall:"gen", frage:"Wessen Rute ist das?"},
    {woerter:["Der","Hecht","schwimmt","im","See."], ziel:[0,1], fall:"nom", frage:"Wer oder was schwimmt?"},
    {woerter:["Ich","sehe","den","Zander."], ziel:[2,3], fall:"akk", frage:"Wen oder was sehe ich?"}
  ]},
  tennis:{ name:"Tennis", emoji:"🎾", saetze:[
    {woerter:["Der","Spieler","schlägt","den","Ball."], ziel:[0,1], fall:"nom", frage:"Wer schlägt den Ball?"},
    {woerter:["Ich","sehe","den","Ball."], ziel:[2,3], fall:"akk", frage:"Wen oder was sehe ich?"},
    {woerter:["Der","Trainer","gibt","dem","Kind","den","Schläger."], ziel:[3,4], fall:"dat", frage:"Wem gibt der Trainer den Schläger?"},
    {woerter:["Das","ist","der","Schläger","des","Spielers."], ziel:[4,5], fall:"gen", frage:"Wessen Schläger ist das?"},
    {woerter:["Die","Spielerin","gewinnt."], ziel:[0,1], fall:"nom", frage:"Wer gewinnt?"},
    {woerter:["Ich","hole","den","Ball."], ziel:[2,3], fall:"akk", frage:"Wen oder was hole ich?"}
  ]},
  fussball:{ name:"Fußball", emoji:"⚽", saetze:[
    {woerter:["Der","Stürmer","schießt","das","Tor."], ziel:[0,1], fall:"nom", frage:"Wer schießt das Tor?"},
    {woerter:["Ich","sehe","das","Tor."], ziel:[2,3], fall:"akk", frage:"Wen oder was sehe ich?"},
    {woerter:["Der","Junge","gibt","dem","Torwart","den","Ball."], ziel:[3,4], fall:"dat", frage:"Wem gibt der Junge den Ball?"},
    {woerter:["Das","ist","der","Ball","des","Stürmers."], ziel:[4,5], fall:"gen", frage:"Wessen Ball ist das?"},
    {woerter:["Die","Mannschaft","jubelt."], ziel:[0,1], fall:"nom", frage:"Wer jubelt?"},
    {woerter:["Ich","hole","den","Ball."], ziel:[2,3], fall:"akk", frage:"Wen oder was hole ich?"}
  ]}
};

export const REDE_THEMEN = {
  alltag:{ name:"Alltag", emoji:"🌳", saetze:[
    {woerter:["Die","Lehrerin","sagt:","Setzt","euch","bitte","hin!"], rede:[3,4,5,6]},
    {woerter:["Der","Junge","ruft:","Ich","habe","gewonnen!"], rede:[3,4,5]},
    {woerter:["Mama","fragt:","Hast","du","Hunger?"], rede:[2,3,4]},
    {woerter:["Der","Mann","sagt:","Es","regnet","heute."], rede:[3,4,5]},
    {woerter:["Das","Mädchen","flüstert:","Ich","habe","ein","Geheimnis."], rede:[3,4,5,6]}
  ]},
  angeln:{ name:"Angeln", emoji:"🎣", saetze:[
    {woerter:["Der","Angler","ruft:","Ich","habe","einen","Zander!"], rede:[3,4,5,6]},
    {woerter:["Der","Junge","sagt:","Der","Hecht","ist","riesig!"], rede:[3,4,5,6]},
    {woerter:["Opa","fragt:","Beißt","schon","ein","Fisch?"], rede:[2,3,4,5]},
    {woerter:["Der","Mann","ruft:","Die","Pose","geht","unter!"], rede:[3,4,5,6]},
    {woerter:["Das","Kind","sagt:","Ich","mag","Rotfedern."], rede:[3,4,5]}
  ]},
  tennis:{ name:"Tennis", emoji:"🎾", saetze:[
    {woerter:["Der","Trainer","ruft:","Guter","Schlag!"], rede:[3,4]},
    {woerter:["Der","Junge","sagt:","Ich","habe","gewonnen!"], rede:[3,4,5]},
    {woerter:["Die","Spielerin","fragt:","Bist","du","bereit?"], rede:[3,4,5]},
    {woerter:["Der","Mann","ruft:","Der","Ball","war","drin!"], rede:[3,4,5,6]},
    {woerter:["Das","Kind","sagt:","Ich","mag","Tennis."], rede:[3,4,5]}
  ]},
  fussball:{ name:"Fußball", emoji:"⚽", saetze:[
    {woerter:["Der","Trainer","ruft:","Schießt","ein","Tor!"], rede:[3,4,5]},
    {woerter:["Der","Stürmer","sagt:","Ich","habe","getroffen!"], rede:[3,4,5]},
    {woerter:["Der","Junge","ruft:","Wir","haben","gewonnen!"], rede:[3,4,5]},
    {woerter:["Der","Torwart","fragt:","Wer","kommt","zum","Training?"], rede:[3,4,5,6]},
    {woerter:["Das","Kind","sagt:","Ich","spiele","gern","Fußball."], rede:[3,4,5,6]}
  ]}
};

export const REDE_K4 = {
  alltag:[
    {woerter:["Die","neue","Lehrerin","sagt","zu","den","Kindern:","Bitte","seid","jetzt","leise!"], rede:[7,8,9,10]},
    {woerter:["Der","kleine","Junge","ruft","laut:","Ich","habe","den","Wettlauf","gewonnen!"], rede:[5,6,7,8,9]},
    {woerter:["Am","Morgen","fragt","die","Mutter:","Hast","du","schon","deine","Zähne","geputzt?"], rede:[5,6,7,8,9,10]},
    {woerter:["Der","Vater","sagt","am","Telefon:","Wir","kommen","etwas","später","nach","Hause."], rede:[5,6,7,8,9,10]}
  ],
  angeln:[
    {woerter:["Der","alte","Angler","ruft","vom","Boot:","Ich","habe","einen","riesigen","Hecht","gefangen!"], rede:[6,7,8,9,10,11]},
    {woerter:["Am","Ufer","fragt","der","Junge:","Beißt","heute","überhaupt","ein","Fisch?"], rede:[5,6,7,8,9]},
    {woerter:["Der","Großvater","sagt","leise:","Wir","müssen","jetzt","ganz","ruhig","sein."], rede:[4,5,6,7,8,9]},
    {woerter:["Nach","dem","Fang","ruft","das","Kind:","Das","war","der","größte","Fisch!"], rede:[6,7,8,9,10]}
  ],
  tennis:[
    {woerter:["Der","Trainer","ruft","über","den","Platz:","Halte","den","Schläger","richtig","fest!"], rede:[6,7,8,9,10]},
    {woerter:["Nach","dem","Spiel","sagt","die","Spielerin:","Das","war","ein","spannendes","Match!"], rede:[6,7,8,9,10]},
    {woerter:["Am","Netz","fragt","der","Junge:","Möchtest","du","noch","einen","Satz","spielen?"], rede:[5,6,7,8,9,10]},
    {woerter:["Der","Trainer","sagt","zu","dem","Kind:","Du","hast","heute","toll","gespielt!"], rede:[6,7,8,9,10]}
  ],
  fussball:[
    {woerter:["Der","Trainer","ruft","vom","Rand:","Lauft","schneller","nach","vorne!"], rede:[5,6,7,8]},
    {woerter:["Nach","dem","Tor","jubelt","der","Stürmer:","Wir","haben","endlich","getroffen!"], rede:[6,7,8,9]},
    {woerter:["Der","Torwart","ruft","laut:","Verteidigt","bitte","den","linken","Pfosten!"], rede:[4,5,6,7,8]},
    {woerter:["Am","Ende","fragt","der","Junge:","Wer","kommt","morgen","zum","Training","mit?"], rede:[5,6,7,8,9,10]}
  ]
};

export const GWS_KATEGORIEN = [
  {id:"dopp", name:"Doppelte Mitlaute", emoji:"🔡",
   regel:"Nach einem <b>kurzen</b> Selbstlaut kommt ein <b>doppelter</b> Mitlaut.", 
   tipp:"Kurzer Selbstlaut → doppelter Mitlaut (Son-ne).",
   leicht:[
     {richtig:"bitten", falsch:"biten"},
     {richtig:"die Butter", falsch:"die Buter"},
     {richtig:"essen", falsch:"esen"},
     {richtig:"fallen", falsch:"falen"},
     {richtig:"der Füller", falsch:"der Füler"},
     {richtig:"der Himmel", falsch:"der Himel"},
     {richtig:"kennen", falsch:"kenen"},
     {richtig:"das Kissen", falsch:"das Kisen"},
     {richtig:"die Klasse", falsch:"die Klase"},
     {richtig:"können", falsch:"könen"},
     {richtig:"der Koffer", falsch:"der Kofer"},
     {richtig:"kommen", falsch:"komen"},
     {richtig:"lassen", falsch:"lasen"},
     {richtig:"der Löffel", falsch:"der Löfel"},
     {richtig:"das Messer", falsch:"das Meser"},
     {richtig:"müssen", falsch:"müsen"},
     {richtig:"die Mutter", falsch:"die Muter"},
     {richtig:"die Puppe", falsch:"die Pupe"},
     {richtig:"rennen", falsch:"renen"},
     {richtig:"der Schlitten", falsch:"der Schliten"},
     {richtig:"der Schlüssel", falsch:"der Schlüsel"},
     {richtig:"sollen", falsch:"solen"},
     {richtig:"die Sonne", falsch:"die Sone"},
     {richtig:"die Spinne", falsch:"die Spine"},
     {richtig:"die Suppe", falsch:"die Supe"},
     {richtig:"der Teller", falsch:"der Teler"},
     {richtig:"treffen", falsch:"trefen"},
     {richtig:"die Treppe", falsch:"die Trepe"},
     {richtig:"das Wasser", falsch:"das Waser"},
     {richtig:"das Wetter", falsch:"das Weter"},
     {richtig:"wissen", falsch:"wisen"},
     {richtig:"wollen", falsch:"wolen"},
     {richtig:"das Zimmer", falsch:"das Zimer"}
   ],
   schwer:[
     {richtig:"beginnen", falsch:"beginen"},
     {richtig:"besser", falsch:"beser"},
     {richtig:"das Bett", falsch:"das Bet"},
     {richtig:"brennen", falsch:"brenen"},
     {richtig:"die Brille", falsch:"die Brile"},
     {richtig:"brüllen", falsch:"brülen"},
     {richtig:"donnern", falsch:"donern"},
     {richtig:"doppelt", falsch:"dopelt"},
     {richtig:"dünn", falsch:"dün"},
     {richtig:"dumm", falsch:"dum"},
     {richtig:"die Flosse", falsch:"die Flose"},
     {richtig:"der Fluss", falsch:"der Flus"},
     {richtig:"fressen", falsch:"fresen"},
     {richtig:"füttern", falsch:"fütern"},
     {richtig:"gefallen", falsch:"gefalen"},
     {richtig:"gewinnen", falsch:"gewinen"},
     {richtig:"glatt", falsch:"glat"},
     {richtig:"hell", falsch:"hel"},
     {richtig:"der Herr", falsch:"der Her"},
     {richtig:"hoffen", falsch:"hofen"},
     {richtig:"kaputt", falsch:"kaput"},
     {richtig:"klettern", falsch:"kletern"},
     {richtig:"krumm", falsch:"krum"},
     {richtig:"küssen", falsch:"küsen"},
     {richtig:"der Mann", falsch:"der Man"},
     {richtig:"die Mitte", falsch:"die Mite"},
     {richtig:"der Müll", falsch:"der Mül"},
     {richtig:"nass", falsch:"nas"},
     {richtig:"nett", falsch:"net"},
     {richtig:"die Nuss", falsch:"die Nus"},
     {richtig:"öffnen", falsch:"öfnen"},
     {richtig:"offen", falsch:"ofen"},
     {richtig:"passen", falsch:"pasen"},
     {richtig:"retten", falsch:"reten"},
     {richtig:"sammeln", falsch:"sameln"},
     {richtig:"satt", falsch:"sat"},
     {richtig:"schaffen", falsch:"schafen"},
     {richtig:"das Schiff", falsch:"das Schif"},
     {richtig:"schlimm", falsch:"schlim"},
     {richtig:"das Schloss", falsch:"das Schlos"},
     {richtig:"der Schluss", falsch:"der Schlus"},
     {richtig:"schnell", falsch:"schnel"},
     {richtig:"schwimmen", falsch:"schwimen"},
     {richtig:"stellen", falsch:"stelen"},
     {richtig:"still", falsch:"stil"},
     {richtig:"stimmen", falsch:"stimen"},
     {richtig:"der Stoff", falsch:"der Stof"},
     {richtig:"stumm", falsch:"stum"},
     {richtig:"toll", falsch:"tol"}
   ]},
  {id:"cktz", name:"ck und tz", emoji:"🧦",
   regel:"Nach kurzem Selbstlaut schreibt man <b>ck</b> und <b>tz</b>.", 
   tipp:"Nach kurzem Selbstlaut: ck und tz (Ja-cke, Ka-tze).",
   leicht:[
     {richtig:"backen", falsch:"baken"},
     {richtig:"die Decke", falsch:"die Deke"},
     {richtig:"die Jacke", falsch:"die Jake"},
     {richtig:"kicken", falsch:"kiken"},
     {richtig:"lecker", falsch:"leker"},
     {richtig:"packen", falsch:"paken"},
     {richtig:"schicken", falsch:"schiken"},
     {richtig:"schmecken", falsch:"schmeken"},
     {richtig:"die Schnecke", falsch:"die Schneke"},
     {richtig:"die Socke", falsch:"die Soke"},
     {richtig:"die Hitze", falsch:"die Hize"},
     {richtig:"die Katze", falsch:"die Kaze"},
     {richtig:"die Mütze", falsch:"die Müze"},
     {richtig:"sitzen", falsch:"sizen"},
     {richtig:"die Spitze", falsch:"die Spize"}
   ],
   schwer:[
     {richtig:"die Brücke", falsch:"die Brüke"},
     {richtig:"dick", falsch:"dik"},
     {richtig:"drücken", falsch:"drüken"},
     {richtig:"erschrecken", falsch:"erschreken"},
     {richtig:"der Fleck", falsch:"der Flek"},
     {richtig:"das Glück", falsch:"das Glük"},
     {richtig:"nicken", falsch:"niken"},
     {richtig:"pflücken", falsch:"pflüken"},
     {richtig:"der Rock", falsch:"der Rok"},
     {richtig:"der Rücken", falsch:"der Rüken"},
     {richtig:"der Schreck", falsch:"der Schrek"},
     {richtig:"das Stück", falsch:"das Stük"},
     {richtig:"trocken", falsch:"troken"},
     {richtig:"der Wecker", falsch:"der Weker"},
     {richtig:"der Zucker", falsch:"der Zuker"},
     {richtig:"blitzen", falsch:"blizen"},
     {richtig:"kratzen", falsch:"krazen"},
     {richtig:"die Pfütze", falsch:"die Pfüze"},
     {richtig:"der Platz", falsch:"der Plaz"},
     {richtig:"der Satz", falsch:"der Saz"},
     {richtig:"der Schatz", falsch:"der Schaz"},
     {richtig:"schwitzen", falsch:"schwizen"},
     {richtig:"der Spatz", falsch:"der Spaz"},
     {richtig:"spritzen", falsch:"sprizen"},
     {richtig:"der Witz", falsch:"der Wiz"}
   ]},
  {id:"h", name:"Stilles h", emoji:"👻",
   regel:"Viele Wörter haben ein <b>stilles h</b> (ge-hen, Ru-he, der Schuh).", 
   tipp:"Sprich in Silben: ge-hen – das h gehört dazu. Merk-Wort!",
   leicht:[],
   schwer:[
     {richtig:"blühen", falsch:"blüen"},
     {richtig:"drehen", falsch:"dreen"},
     {richtig:"früh", falsch:"frü"},
     {richtig:"gehen", falsch:"geen"},
     {richtig:"die Kuh", falsch:"die Ku"},
     {richtig:"leihen", falsch:"leien"},
     {richtig:"die Mühe", falsch:"die Müe"},
     {richtig:"das Reh", falsch:"das Re"},
     {richtig:"die Reihe", falsch:"die Reie"},
     {richtig:"die Ruhe", falsch:"die Rue"},
     {richtig:"der Schuh", falsch:"der Schu"},
     {richtig:"sehen", falsch:"seen"},
     {richtig:"stehen", falsch:"steen"},
     {richtig:"der Zeh", falsch:"der Ze"},
     {richtig:"ziehen", falsch:"zieen"}
   ]},
  {id:"sz", name:"ß oder ss", emoji:"🥨",
   regel:"Nach <b>langem</b> Selbstlaut: <b>ß</b>. Nach <b>kurzem</b>: <b>ss</b>.", 
   tipp:"Langer Selbstlaut → ß (Straße). Kurzer → ss (Fluss).",
   leicht:[
     {richtig:"fließen", falsch:"fliessen"},
     {richtig:"der Fuß", falsch:"der Fuss"},
     {richtig:"weiß", falsch:"weiss"}
   ],
   schwer:[
     {richtig:"draußen", falsch:"draussen"},
     {richtig:"groß", falsch:"gross"},
     {richtig:"der Gruß", falsch:"der Gruss"},
     {richtig:"heiß", falsch:"heiss"},
     {richtig:"heißen", falsch:"heissen"},
     {richtig:"schließen", falsch:"schliessen"},
     {richtig:"die Straße", falsch:"die Strasse"},
     {richtig:"süß", falsch:"süss"}
   ]},
  {id:"ae", name:"Merkwörter mit ä", emoji:"🐻",
   regel:"Diese Wörter schreibt man mit <b>ä</b> – auswendig merken!", 
   tipp:"Merk-Wort mit ä (der Bär, das Mädchen).",
   leicht:[
     {richtig:"der Bär", falsch:"der Ber"},
     {richtig:"der Käse", falsch:"der Kese"},
     {richtig:"die Säge", falsch:"die Sege"}
   ],
   schwer:[
     {richtig:"ändern", falsch:"endern"},
     {richtig:"ärgern", falsch:"ergern"},
     {richtig:"erklären", falsch:"erkleren"},
     {richtig:"der Käfer", falsch:"der Kefer"},
     {richtig:"der Käfig", falsch:"der Kefig"},
     {richtig:"der Lärm", falsch:"der Lerm"},
     {richtig:"das Mädchen", falsch:"das Medchen"},
     {richtig:"das Märchen", falsch:"das Merchen"},
     {richtig:"nächste", falsch:"nechste"},
     {richtig:"nämlich", falsch:"nemlich"},
     {richtig:"das Rätsel", falsch:"das Retsel"},
     {richtig:"spät", falsch:"spet"},
     {richtig:"die Träne", falsch:"die Trene"}
   ]},
  {id:"v", name:"Wörter mit V", emoji:"🌋",
   regel:"Man hört <b>f</b> oder <b>w</b>, schreibt aber <b>V</b> – merken!", 
   tipp:"Merk-Wort mit V (der Vogel, der Vulkan).",
   leicht:[
     {richtig:"der Vater", falsch:"der Fater"},
     {richtig:"vier", falsch:"fier"},
     {richtig:"der Vogel", falsch:"der Fogel"},
     {richtig:"die Vase", falsch:"die Wase"},
     {richtig:"der Vulkan", falsch:"der Wulkan"},
     {richtig:"vom", falsch:"fom"},
     {richtig:"von", falsch:"fon"},
     {richtig:"vor", falsch:"for"}
   ],
   schwer:[
     {richtig:"der Advent", falsch:"der Adwent"},
     {richtig:"das Silvester", falsch:"das Silwester"},
     {richtig:"der Verein", falsch:"der Ferein"},
     {richtig:"das Virus", falsch:"das Wirus"},
     {richtig:"voll", falsch:"foll"},
     {richtig:"vorbei", falsch:"forbei"},
     {richtig:"vorher", falsch:"forher"},
     {richtig:"vorne", falsch:"forne"}
   ]},
  {id:"x", name:"Wörter mit x", emoji:"🧙",
   regel:"Man hört <b>ks</b>, schreibt aber <b>x</b> (die Hexe).", 
   tipp:"Merk-Wort mit x (die Hexe, der Text).",
   leicht:[
     {richtig:"boxen", falsch:"boksen"},
     {richtig:"die Hexe", falsch:"die Hekse"},
     {richtig:"das Taxi", falsch:"das Taksi"}
   ],
   schwer:[
     {richtig:"die Axt", falsch:"die Akst"},
     {richtig:"das Lexikon", falsch:"das Leksikon"},
     {richtig:"der Text", falsch:"der Tekst"}
   ]},
  {id:"y", name:"Wörter mit y", emoji:"🧸",
   regel:"Diese Wörter schreibt man mit <b>y</b> (das Baby, die Pyramide).", 
   tipp:"Merk-Wort mit y – auswendig merken.",
   leicht:[
     {richtig:"das Baby", falsch:"das Babi"},
     {richtig:"das Handy", falsch:"das Handi"},
     {richtig:"das Pony", falsch:"das Poni"}
   ],
   schwer:[
     {richtig:"das Hobby", falsch:"das Hobbi"},
     {richtig:"die Party", falsch:"die Parti"},
     {richtig:"die Pyramide", falsch:"die Piramide"},
     {richtig:"der Teddy", falsch:"der Teddi"},
     {richtig:"der Zylinder", falsch:"der Zilinder"}
   ]},
  {id:"spst", name:"sp und st", emoji:"⭐",
   regel:"Am Wortanfang hörst du „schp/scht“, schreibst aber <b>sp/st</b>.", 
   tipp:"Am Anfang: sp und st (der Stern, das Spiel).",
   leicht:[
     {richtig:"sparen", falsch:"schparen"},
     {richtig:"der Spaten", falsch:"der Schpaten"},
     {richtig:"der Spiegel", falsch:"der Schpiegel"},
     {richtig:"das Spiel", falsch:"das Schpiel"},
     {richtig:"spielen", falsch:"schpielen"},
     {richtig:"spülen", falsch:"schpülen"},
     {richtig:"staunen", falsch:"schtaunen"},
     {richtig:"der Stein", falsch:"der Schtein"},
     {richtig:"der Stempel", falsch:"der Schtempel"},
     {richtig:"der Stern", falsch:"der Schtern"},
     {richtig:"der Stiefel", falsch:"der Schtiefel"},
     {richtig:"der Stift", falsch:"der Schtift"},
     {richtig:"stören", falsch:"schtören"},
     {richtig:"die Stufe", falsch:"die Schtufe"},
     {richtig:"die Stunde", falsch:"die Schtunde"}
   ],
   schwer:[
     {richtig:"die Sprache", falsch:"die Schprache"},
     {richtig:"sprechen", falsch:"schprechen"},
     {richtig:"springen", falsch:"schpringen"},
     {richtig:"der Sprung", falsch:"der Schprung"},
     {richtig:"die Strafe", falsch:"die Schtrafe"},
     {richtig:"streicheln", falsch:"schtreicheln"},
     {richtig:"streichen", falsch:"schtreichen"},
     {richtig:"der Streifen", falsch:"der Schtreifen"},
     {richtig:"streiten", falsch:"schtreiten"},
     {richtig:"streng", falsch:"schtreng"},
     {richtig:"der Strom", falsch:"der Schtrom"}
   ]},
  {id:"qu", name:"Wörter mit qu", emoji:"🐸",
   regel:"Man hört „kw“, schreibt aber <b>qu</b> (die Quelle).", 
   tipp:"qu schreiben, auch wenn man „kw“ hört.",
   leicht:[
     {richtig:"bequem", falsch:"bekwem"},
     {richtig:"quaken", falsch:"kwaken"},
     {richtig:"der Qualm", falsch:"der Kwalm"}
   ],
   schwer:[
     {richtig:"das Aquarium", falsch:"das Akwarium"},
     {richtig:"der Quader", falsch:"der Kwader"},
     {richtig:"das Quadrat", falsch:"das Kwadrat"},
     {richtig:"der Quatsch", falsch:"der Kwatsch"},
     {richtig:"die Quelle", falsch:"die Kwelle"},
     {richtig:"quer", falsch:"kwer"}
   ]},
  {id:"chs", name:"Wörter mit chs", emoji:"🦊",
   regel:"Man hört „ks“, schreibt aber <b>chs</b> (der Fuchs).", 
   tipp:"Merk-Wort mit chs (der Fuchs, der Dachs).",
   leicht:[
     {richtig:"der Dachs", falsch:"der Dax"},
     {richtig:"der Fuchs", falsch:"der Fux"},
     {richtig:"der Luchs", falsch:"der Lux"},
     {richtig:"wachsen", falsch:"waxen"}
   ],
   schwer:[]},
  {id:"merk", name:"Besondere Merkwörter", emoji:"💡",
   regel:"Besondere Merkwörter (th, ai, Pizza …) – auswendig merken!", 
   tipp:"Merk-Wort – genau einprägen (vielleicht, das Theater).",
   leicht:[
     {richtig:"der Cent", falsch:"der Zent"}
   ],
   schwer:[
     {richtig:"der Hai", falsch:"der Hei"},
     {richtig:"der Kaiser", falsch:"der Keiser"},
     {richtig:"der Mais", falsch:"der Meis"},
     {richtig:"die Pizza", falsch:"die Piza"},
     {richtig:"die Stadt", falsch:"die Stat"},
     {richtig:"das Theater", falsch:"das Teater"},
     {richtig:"das Thema", falsch:"das Tema"},
     {richtig:"das Thermometer", falsch:"das Termometer"},
     {richtig:"verwandt", falsch:"verwand"},
     {richtig:"vielleicht", falsch:"vieleicht"},
     {richtig:"während", falsch:"wärend"},
     {richtig:"der Clown", falsch:"der Klaun"}
   ]}
];
