/* Aufgaben-Pools Mathe (aus der Alt-App v1.86 übernommen, Kompass-4-Basis).
   Reine Daten: je Bereich { easy, hard }, Aufgabe = { f, r, x:[2], tipp, kontext? } */
export const MATHE_DATEN={
  mrechnen:{
    easy:[
      {f:"356 + 123 = ?", r:"479", x:["469","489"], tipp:"Rechne stellenweise: erst die Einer, dann Zehner, dann Hunderter."},
      {f:"487 − 234 = ?", r:"253", x:["263","243"], tipp:"400−200=200, 80−30=50, 7−4=3."},
      {f:"45 + 38 = ?", r:"83", x:["73","84"], tipp:"45+38 = 45+40−2."},
      {f:"92 − 47 = ?", r:"45", x:["55","44"], tipp:"92−47 = 92−50+3."},
      {f:"6 · 7 = ?", r:"42", x:["36","48"], tipp:"Das kleine Einmaleins: 6·7=42."},
      {f:"63 : 9 = ?", r:"7", x:["6","8"], tipp:"Frag dich: 9 mal was ist 63?"},
      {f:"230 + 150 = ?", r:"380", x:["370","390"], tipp:"200+100=300 und 30+50=80."},
      {f:"560 − 280 = ?", r:"280", x:["380","270"], tipp:"560−200=360, dann noch −80."},
      {f:"3 · 25 = ?", r:"75", x:["65","85"], tipp:"25+25+25 = 75."},
      {f:"96 : 8 = ?", r:"12", x:["11","14"], tipp:"80:8=10 und 16:8=2 → 10+2."},
      {f:"407 + 95 = ?", r:"502", x:["492","512"], tipp:"Trick: 407+100−5."},
      {f:"811 − 406 = ?", r:"405", x:["415","395"], tipp:"811−400=411, dann noch −6."}
    ],
    hard:[
      {f:"1691 + 268 = ?", r:"1959", x:["1859","1949"], tipp:"Schriftlich: Einer 1+8=9, Zehner 9+6=15 → 5 und Übertrag!"},
      {f:"1739 − 658 = ?", r:"1081", x:["1181","1121"], tipp:"Schriftlich rechnen – beim Hunderter musst du entbündeln."},
      {f:"5 · 18 = ?", r:"90", x:["80","95"], tipp:"5·18 = 5·20 − 5·2 = 100−10."},
      {f:"6 · 38 = ?", r:"228", x:["218","238"], tipp:"6·38 = 6·40 − 6·2 = 240−12."},
      {f:"48 : 4 = ?", r:"12", x:["11","16"], tipp:"40:4=10 und 8:4=2."},
      {f:"2456 + 1378 = ?", r:"3834", x:["3734","3824"], tipp:"Schriftlich – achte auf die Überträge!"},
      {f:"3405 − 1287 = ?", r:"2118", x:["2218","2128"], tipp:"Schriftlich – bei den Einern brauchst du einen Übertrag."},
      {f:"7 · 46 = ?", r:"322", x:["312","332"], tipp:"7·46 = 7·40 + 7·6 = 280+42."},
      {f:"96 : 6 = ?", r:"16", x:["14","18"], tipp:"60:6=10 und 36:6=6."},
      {f:"Lena rechnet 478 − 97 mit einem Trick: „Zuerst 478 − 100 = 378.“ Was muss sie jetzt noch rechnen?", r:"378 + 3", x:["378 − 3","378 + 97"], tipp:"Sie hat 3 zu viel abgezogen – die kommen wieder dazu."},
      {f:"Rechne geschickt: 299 + 156 = ?", r:"455", x:["445","465"], tipp:"Trick: 300 + 156 − 1."},
      {f:"1000 − 763 = ?", r:"237", x:["247","337"], tipp:"763 + 237 = 1000. Ergänze bis 800, dann bis 1000."}
    ]
  },
  mzahlen:{
    easy:[
      {f:"Wie heißen die Nachbarzehner von 346?", r:"340 und 350", x:["345 und 355","300 und 400"], tipp:"Nachbarzehner sind die Zehnerzahlen direkt davor und danach.", bild:{art:"strahl",von:330,bis:360,schritt:10,marken:[346],frage:[340,350]}},
      {f:"Wie heißen die Nachbarhunderter von 782?", r:"700 und 800", x:["780 und 790","770 und 800"], tipp:"Nachbarhunderter sind volle Hunderter.", bild:{art:"strahl",von:600,bis:900,schritt:100,marken:[782],frage:[700,800]}},
      {f:"Welche Zahl liegt genau in der Mitte zwischen 40 und 60?", r:"50", x:["45","55"], tipp:"Von 40 und von 60 gleich weit weg.", bild:{art:"strahl",von:40,bis:60,schritt:10,frage:[50]}},
      {f:"Setze die Zahlenfolge fort: 5, 10, 15, 20, ?", r:"25", x:["30","24"], tipp:"Es geht immer +5 weiter.", bild:{art:"folge",zahlen:[5,10,15,20],weiter:true}},
      {f:"H = 2, Z = 4, E = 6. Wie heißt die Zahl?", r:"246", x:["264","426"], tipp:"2 Hunderter, 4 Zehner, 6 Einer.", bloecke:{h:2,z:4,e:6}},
      {f:"Welche Zahl ist am größten?", r:"998", x:["989","899"], tipp:"Vergleiche zuerst die Hunderter, dann die Zehner."},
      {f:"Zahlenmauer: Unten stehen 2 und 3 nebeneinander. Welche Zahl steht auf dem Stein darüber?", r:"5", x:["6","1"], tipp:"In der Zahlenmauer wird immer addiert: 2+3.", bild:{art:"mauer",reihe:[2,3]}},
      {f:"Setze die Zahlenfolge fort: 30, 27, 24, ?", r:"21", x:["22","20"], tipp:"Es geht immer −3 weiter.", bild:{art:"folge",zahlen:[30,27,24],weiter:true}},
      {f:"Wie heißen die Nachbarzehner von 605?", r:"600 und 610", x:["605 und 615","500 und 700"], tipp:"605 liegt zwischen den Zehnern 600 und 610.", bild:{art:"strahl",von:590,bis:620,schritt:10,marken:[605],frage:[600,610]}},
      {f:"Welche Zahl liegt genau in der Mitte zwischen 120 und 140?", r:"130", x:["125","135"], tipp:"120 +10 und 140 −10.", bild:{art:"strahl",von:120,bis:140,schritt:10,frage:[130]}},
      {f:"Welche Zahl ist gerade?", r:"52", x:["47","61"], tipp:"Gerade Zahlen enden auf 0, 2, 4, 6 oder 8."},
      {f:"Was bedeutet die 7 in der Zahl 372?", r:"7 Zehner (70)", x:["7 Einer (7)","7 Hunderter (700)"], tipp:"Die mittlere Stelle ist die Zehnerstelle.", bloecke:{h:3,z:7,e:2}},
      {f:"Welche Zahl zeigen die Blöcke?", r:"235", x:["253","325"], tipp:"Zähle: 2 Hunderterplatten, 3 Zehnerstangen, 5 Einerwürfel.", bloecke:{h:2,z:3,e:5}},
      {f:"Welche Zahl zeigen die Blöcke?", r:"304", x:["340","34"], tipp:"3 Hunderter, KEIN Zehner, 4 Einer – die 0 in der Mitte ist wichtig!", bloecke:{h:3,z:0,e:4}}
    ],
    hard:[
      {f:"Wie heißen die Nachbarzehner von 7496?", r:"7490 und 7500", x:["7495 und 7505","7400 und 7500"], tipp:"Die Zehner direkt vor und nach 7496.", bild:{art:"strahl",von:7480,bis:7510,schritt:10,marken:[7496],frage:[7490,7500]}},
      {f:"Wie heißen die Nachbartausender von 6280?", r:"6000 und 7000", x:["6200 und 6300","5000 und 7000"], tipp:"Volle Tausender davor und danach.", bild:{art:"strahl",von:5000,bis:8000,schritt:1000,marken:[6280],frage:[6000,7000]}},
      {f:"H = 5, Z = 13, E = 2. Wie heißt die Zahl?", r:"632", x:["5132","532"], tipp:"13 Zehner sind 130 – also 500+130+2.", bloecke:{h:5,z:13,e:2}},
      {f:"Welche Zahl zeigen die Blöcke?", r:"1240", x:["1024","1420"], tipp:"1 Tausenderwürfel, 2 Hunderterplatten, 4 Zehnerstangen – und keine Einer.", bloecke:{t:1,h:2,z:4,e:0}},
      {f:"Welche Zahl zeigen die Blöcke?", r:"2056", x:["2560","256"], tipp:"2 Tausender, KEIN Hunderter, 5 Zehner, 6 Einer.", bloecke:{t:2,h:0,z:5,e:6}},
      {f:"Welche Zahl liegt genau in der Mitte zwischen 750 und 850?", r:"800", x:["775","825"], tipp:"Von beiden Zahlen 50 entfernt.", bild:{art:"strahl",von:750,bis:850,schritt:50,frage:[800]}},
      {f:"Welche Zahl liegt genau in der Mitte zwischen 340 und 480?", r:"410", x:["400","420"], tipp:"Der Abstand ist 140 – die Hälfte davon ist 70. 340+70.", bild:{art:"strahl",von:340,bis:480,schritt:70,frage:[410]}},
      {f:"Setze fort: 460, 510, 490, 540, 520, ?", r:"570", x:["500","550"], tipp:"Die Regel ist: erst +50, dann −20.", bild:{art:"folge",zahlen:[460,510,490,540,520],weiter:true}},
      {f:"Welche Regel steckt in der Folge 460, 510, 490, 540, 520?", r:"erst +50, dann −20", x:["immer +50","erst +30, dann −10"], tipp:"460→510 ist +50, 510→490 ist −20 – im Wechsel.", bild:{art:"folge",zahlen:[460,510,490,540,520],weiter:false}},
      {f:"Zahlenmauer mit 20, 25 und 30 in der ersten Reihe: Wann wird der Deckstein am größten?", r:"Wenn die größte Zahl in der Mitte steht", x:["Wenn die größte Zahl außen steht","Die Reihenfolge ist egal"], tipp:"Die mittlere Zahl wird zweimal mitgezählt!"},
      {f:"Zahlenmauer: erste Reihe 20 | 30 | 25. Wie groß ist der Deckstein?", r:"105", x:["95","100"], tipp:"20+30=50 und 30+25=55, dann 50+55.", bild:{art:"mauer",reihe:[20,30,25]}},
      {f:"Setze fort: 1200, 1150, 1250, 1200, 1300, ?", r:"1250", x:["1350","1400"], tipp:"Die Regel: erst −50, dann +100.", bild:{art:"folge",zahlen:[1200,1150,1250,1200,1300],weiter:true}},
      {f:"Welche Zahl liegt näher an 5000: 4890 oder 5120?", r:"4890", x:["5120","beide gleich nah"], tipp:"4890 ist 110 entfernt, 5120 ist 120 entfernt.", bild:{art:"strahl",von:4800,bis:5200,schritt:100,marken:[4890,5120]}},
      {f:"Runde 3467 auf den nächsten Hunderter.", r:"3500", x:["3400","3000"], tipp:"Die Zehnerziffer 6 sagt: aufrunden.", bild:{art:"strahl",von:3400,bis:3500,schritt:50,marken:[3467]}}
    ]
  },
  mgeo:{
    easy:[
      {f:"Wie viele Ecken hat ein Rechteck?", r:"4", x:["3","6"], tipp:"Rechteck = 4 Ecken, 4 rechte Winkel.", bild:{art:"form",form:"rechteck"}},
      {f:"Wie viele Spiegelachsen hat ein Quadrat?", r:"4", x:["2","1"], tipp:"Zwei durch die Seitenmitten und zwei durch die Ecken.", bild:{art:"form",form:"quadrat"}},
      {f:"Welche Figur hat keine Ecken?", r:"Kreis", x:["Dreieck","Quadrat"], tipp:"Der Kreis ist ganz rund."},
      {f:"Wie viele Flächen hat ein Würfel?", r:"6", x:["4","8"], tipp:"Denk an einen Spielwürfel: oben, unten und 4 Seiten."},
      {f:"Figur A besteht aus 6 Kästchen, Figur B auch aus 6 Kästchen – nur anders gelegt. Was gilt?", r:"Die Flächen sind gleich groß", x:["Figur A ist größer","Figur B ist größer"], tipp:"Zähle die Kästchen – die Form ist egal!", bild:{art:"kaestchen",figuren:[[[1,1,1],[1,1,1]],[[1,1,1,1],[1,1,0,0]]]}},
      {f:"Wie viele Spiegelachsen hat ein Rechteck (das kein Quadrat ist)?", r:"2", x:["4","1"], tipp:"Nur durch die Seitenmitten – nicht durch die Ecken!", bild:{art:"form",form:"rechteck"}},
      {f:"Welcher Körper kann rollen?", r:"Kugel", x:["Würfel","Quader"], tipp:"Rund rollt!"},
      {f:"Aus wie vielen Quadraten besteht ein Würfelnetz?", r:"6", x:["5","8"], tipp:"So viele wie der Würfel Flächen hat.", bild:{art:"netz",form:"kreuz"}},
      {f:"Wie viele Seiten hat ein Dreieck?", r:"3", x:["2","4"], tipp:"Drei Ecken, drei Seiten.", bild:{art:"form",form:"dreieck"}},
      {f:"Ein Turm aus Würfeln: 3 unten, 2 darauf, 1 ganz oben. Wie viele Würfel sind es?", r:"6", x:["5","7"], tipp:"3+2+1.", bild:{art:"wuerfelturm",reihen:[3,2,1]}},
      {f:"Welcher Buchstabe hat eine senkrechte Spiegelachse?", r:"A", x:["F","G"], tipp:"Falte das A in der Mitte – beide Hälften passen aufeinander.", bild:{art:"buchstaben",zeichen:["A","F","G"]}},
      {f:"Ein Quadrat hat 4 gleich lange …?", r:"Seiten", x:["Ecken","Kreise"], tipp:"Beim Quadrat sind alle Seiten gleich lang.", bild:{art:"form",form:"quadrat"}}
    ],
    hard:[
      {f:"Wie viele Spiegelachsen hat ein Kreis?", r:"Unendlich viele", x:["4","8"], tipp:"Jede Linie durch den Mittelpunkt ist eine Spiegelachse.", bild:{art:"form",form:"kreis"}},
      {f:"6 Quadrate alle in einer Reihe nebeneinander – ergibt das ein Würfelnetz?", r:"Nein", x:["Ja","Nur bei großen Würfeln"], tipp:"Beim Falten überlappen sich die Flächen – Deckel und Boden fehlen.", bild:{art:"netz",form:"reihe"}},
      {f:"4 Quadrate in einer Reihe, 1 oben und 1 unten angehängt – ergibt das ein Würfelnetz?", r:"Ja", x:["Nein","Nur ohne den Deckel"], tipp:"Das ist das bekannteste Würfelnetz (T-Form/Kreuz).", bild:{art:"netz",form:"kreuz"}},
      {f:"Zwei gleiche rechtwinklige Dreiecke zusammengelegt können ein … ergeben.", r:"Rechteck", x:["Kreis","Fünfeck"], tipp:"Die schrägen Seiten aneinanderlegen!"},
      {f:"Wie viele Spiegelachsen hat ein gleichseitiges Dreieck?", r:"3", x:["1","6"], tipp:"Eine durch jede Ecke zur gegenüberliegenden Seitenmitte.", bild:{art:"form",form:"dreieck"}},
      {f:"Figur A: 8 Kästchen. Figur B: ein Rechteck aus 2·4 Kästchen. Sind die Flächen gleich groß?", r:"Ja, beide 8 Kästchen", x:["Nein, A ist größer","Nein, B ist größer"], tipp:"2·4 = 8 – zählen schlägt schauen!", bild:{art:"kaestchen",figuren:[[[1,1,1],[1,1,1],[1,1,0]],[[1,1,1,1],[1,1,1,1]]]}},
      {f:"Welche Figur hat die größere Fläche: ein Quadrat aus 3·3 Kästchen oder ein Rechteck aus 2·5 Kästchen?", r:"Das Rechteck (10 > 9)", x:["Das Quadrat","Beide gleich groß"], tipp:"3·3=9 und 2·5=10.", bild:{art:"kaestchen",figuren:[[[1,1,1],[1,1,1],[1,1,1]],[[1,1,1,1,1],[1,1,1,1,1]]]}},
      {f:"Wie viele Kanten hat ein Würfel?", r:"12", x:["8","6"], tipp:"4 oben, 4 unten und 4 senkrechte."},
      {f:"Ein Rechteck ist 6 cm lang und 4 cm breit. Wie groß ist der Umfang?", r:"20 cm", x:["24 cm","10 cm"], tipp:"6+4+6+4 – einmal ganz außen herum."},
      {f:"Welcher Buchstabe hat KEINE Spiegelachse?", r:"F", x:["A","M"], tipp:"A und M kann man senkrecht falten – F nicht.", bild:{art:"buchstaben",zeichen:["F","A","M"]}},
      {f:"Ein Würfelgebäude: 3 Würfel in einer Reihe, auf dem mittleren steht noch einer. Wie viele Würfel siehst du von vorne?", r:"4", x:["3","6"], tipp:"Von vorne siehst du alle: 3 unten und 1 oben.", bild:{art:"wuerfelturm",reihen:[3,1]}},
      {f:"Du drehst ein Puzzleteil um 90 Grad. Was ändert sich an seiner Fläche?", r:"Nichts – sie bleibt gleich groß", x:["Sie wird größer","Sie wird kleiner"], tipp:"Drehen verändert die Größe nie."}
    ]
  },
  mgroessen:{
    easy:[
      {f:"1 Euro = ? Cent", r:"100 Cent", x:["10 Cent","1000 Cent"], tipp:"1 € = 100 ct."},
      {f:"7:30 Uhr + 30 Minuten = ?", r:"8:00 Uhr", x:["7:60 Uhr","8:30 Uhr"], tipp:"30+30=60 Minuten = eine volle Stunde.", bild:{art:"uhr",zeit:"7:30"}},
      {f:"1 m = ? cm", r:"100 cm", x:["10 cm","1000 cm"], tipp:"1 Meter = 100 Zentimeter."},
      {f:"Wie lang ist etwa ein Schul-Lineal?", r:"30 cm", x:["30 mm","3 m"], tipp:"Ein Lineal ist ungefähr so lang wie dein Unterarm."},
      {f:"3 € + 2,50 € = ?", r:"5,50 €", x:["5,80 €","6,50 €"], tipp:"3+2=5 Euro und 50 Cent dazu."},
      {f:"10:15 Uhr + 1 Stunde = ?", r:"11:15 Uhr", x:["10:75 Uhr","11:45 Uhr"], tipp:"Nur die Stunde ändert sich.", bild:{art:"uhr",zeit:"10:15"}},
      {f:"Wie schwer ist etwa eine Tafel Schokolade?", r:"100 g", x:["1 kg","10 g"], tipp:"Steht sogar auf der Packung!"},
      {f:"1 km = ? m", r:"1000 m", x:["100 m","10 m"], tipp:"Kilo bedeutet tausend."},
      {f:"Du bezahlst 7 € mit einem 10-€-Schein. Wie viel Rückgeld bekommst du?", r:"3 €", x:["2 €","4 €"], tipp:"7+3=10."},
      {f:"Eine halbe Stunde = ? Minuten", r:"30 Minuten", x:["50 Minuten","15 Minuten"], tipp:"Eine Stunde hat 60 Minuten."},
      {f:"2 m = ? cm", r:"200 cm", x:["20 cm","2000 cm"], tipp:"1 m = 100 cm, also 2·100."},
      {f:"Eine Viertelstunde nach 9:00 Uhr ist es …?", r:"9:15 Uhr", x:["9:45 Uhr","9:25 Uhr"], tipp:"Eine Viertelstunde = 15 Minuten.", bild:{art:"uhr",zeit:"9:00"}}
    ],
    hard:[
      {f:"Kai fährt eine Strecke von 286 km. 174 km ist er schon gefahren. Wie viele km muss er noch fahren?", r:"112 km", x:["122 km","102 km"], tipp:"286−174: erst −100, dann −74."},
      {f:"Samira geht um 16:18 Uhr los und braucht 45 Minuten. Wann kommt sie an?", r:"17:03 Uhr", x:["16:63 Uhr","17:13 Uhr"], tipp:"16:18 + 42 Min = 17:00, dann noch 3 Minuten.", bild:{art:"uhr",zeit:"16:18"}},
      {f:"4 Personen essen je 2 Kugeln Eis. Eine Kugel kostet 1,50 €. Was kostet das zusammen?", r:"12 €", x:["8 €","10 €"], tipp:"8 Kugeln · 1,50 € – oder 8 · 1 € + 8 · 50 ct."},
      {f:"Das Eis kostet 12 €. Bezahlt wird mit einem 50-€-Schein. Wie viel Geld gibt es zurück?", r:"38 €", x:["48 €","42 €"], tipp:"12+38=50. Ergänze von 12 bis 50."},
      {f:"Wie hoch ist ungefähr eine Zimmertür?", r:"2 m", x:["1 m","10 m"], tipp:"Ein Erwachsener passt aufrecht durch – mit etwas Platz."},
      {f:"Wie breit ist ungefähr ein Finger?", r:"1 cm", x:["1 mm","10 cm"], tipp:"Miss nach – ziemlich genau 1 cm!"},
      {f:"Wie breit ist ungefähr eine Bleistiftspitze?", r:"1 mm", x:["1 cm","5 cm"], tipp:"Winzig klein – Millimeter!"},
      {f:"Wie lang ist ungefähr ein Fußballplatz?", r:"100 m", x:["10 km","100 cm"], tipp:"Etwa so weit wie 100 große Schritte."},
      {f:"Tom springt 2,80 m weit, Alex 2,10 m. Wie viele cm ist Tom weiter gesprungen?", r:"70 cm", x:["7 cm","60 cm"], tipp:"2,80 m − 2,10 m = 0,70 m = 70 cm.", bild:{art:"balken",werte:[["Tom",280,"2,80 m"],["Alex",210,"2,10 m"]]}},
      {f:"3,5 km = ? m", r:"3500 m", x:["350 m","3050 m"], tipp:"3 km = 3000 m und 0,5 km = 500 m."},
      {f:"Der Film beginnt um 19:45 Uhr und dauert 90 Minuten. Wann ist er zu Ende?", r:"21:15 Uhr", x:["20:75 Uhr","21:35 Uhr"], tipp:"19:45 + 15 Min = 20:00, dann noch 75 Minuten.", bild:{art:"uhr",zeit:"19:45"}},
      {f:"250 cm = ? m", r:"2,50 m", x:["25 m","2,05 m"], tipp:"100 cm = 1 m, also 250 cm = 2 m und 50 cm."}
    ]
  },
  mdaten:{
    easy:[
      {f:"Im Sack sind nur blaue Kugeln. Du ziehst eine Kugel. Was gilt?", r:"Es ist sicher, dass sie blau ist", x:["Es ist unmöglich, dass sie blau ist","Es ist nur möglich, dass sie blau ist"], tipp:"Wenn ALLE Kugeln blau sind, kann nichts anderes kommen.", bild:{art:"kugeln",saecke:[{b:4}]}},
      {f:"Du würfelst mit einem normalen Würfel (1 bis 6). Eine 7 zu würfeln ist …?", r:"unmöglich", x:["sicher","möglich"], tipp:"Die 7 gibt es auf dem Würfel gar nicht."},
      {f:"Im Sack: 3 rote und 1 blaue Kugel. Welche Farbe ziehst du wahrscheinlicher?", r:"Rot", x:["Blau","Beide gleich"], tipp:"Von Rot sind mehr Kugeln im Sack.", bild:{art:"kugeln",saecke:[{r:3,b:1}]}},
      {f:"Weitsprung: Ida 1,90 m · Mina 2,50 m · Tom 2,80 m. Wer sprang am weitesten?", r:"Tom", x:["Mina","Ida"], tipp:"Vergleiche die Zahlen: 2,80 ist am größten.", bild:{art:"balken",werte:[["Ida",190,"1,90 m"],["Mina",250,"2,50 m"],["Tom",280,"2,80 m"]]}},
      {f:"„Morgen regnet es.“ Das ist …?", r:"möglich", x:["sicher","unmöglich"], tipp:"Es kann regnen – muss aber nicht."},
      {f:"Im Sack: 2 rote und 2 blaue Kugeln. Rot zu ziehen ist …?", r:"genauso wahrscheinlich wie Blau", x:["wahrscheinlicher als Blau","unmöglich"], tipp:"Gleich viele rote und blaue Kugeln!", bild:{art:"kugeln",saecke:[{r:2,b:2}]}},
      {f:"Strichliste: 𝍸 𝍡 (5 Striche und 2 Striche). Wie viele sind das?", r:"7", x:["6","8"], tipp:"Das Bündel zählt 5, dazu die einzelnen Striche.", bild:{art:"striche",n:7}},
      {f:"Mit einem normalen Würfel eine Zahl von 1 bis 6 zu würfeln ist …?", r:"sicher", x:["möglich","unmöglich"], tipp:"Etwas anderes kann gar nicht kommen."},
      {f:"Im Sack sind nur rote Kugeln. Eine blaue zu ziehen ist …?", r:"unmöglich", x:["möglich","sicher"], tipp:"Was nicht drin ist, kann nicht gezogen werden.", bild:{art:"kugeln",saecke:[{r:4}]}},
      {f:"Punkte-Tabelle: Anna 8 · Ben 12 · Carla 10. Wer hat die meisten Punkte?", r:"Ben", x:["Anna","Carla"], tipp:"12 ist die größte Zahl."},
      {f:"Ein Glücksrad hat nur gelbe Felder. Gelb zu drehen ist …?", r:"sicher", x:["möglich","unmöglich"], tipp:"Alle Felder sind gelb.", bild:{art:"rad",felder:{g:6}}},
      {f:"Im Sack: 1 rote und 5 blaue Kugeln. Rot zu ziehen ist …?", r:"möglich, aber unwahrscheinlich", x:["sicher","unmöglich"], tipp:"Eine rote ist drin – aber Blau kommt viel öfter.", bild:{art:"kugeln",saecke:[{r:1,b:5}]}}
    ],
    hard:[
      {f:"Sack A: 1 von 2 Kugeln ist weiß. Sack B: 2 von 4 Kugeln sind weiß. Wo gewinnst du (Weiß) eher?", r:"In beiden gleich", x:["In Sack A","In Sack B"], tipp:"1 von 2 und 2 von 4 – beides ist die Hälfte!", bild:{art:"kugeln",saecke:[{w:1,b:1},{w:2,b:2}]}},
      {f:"Es soll SICHER sein, eine blaue Kugel zu ziehen. Was muss gelten?", r:"Im Sack sind nur blaue Kugeln", x:["Im Sack ist mindestens eine blaue","Im Sack sind mehr blaue als rote"], tipp:"Sicher heißt: Es kann nichts anderes passieren."},
      {f:"Es soll MÖGLICH sein, eine rote Kugel zu ziehen. Was muss gelten?", r:"Mindestens eine rote Kugel ist im Sack", x:["Alle Kugeln sind rot","Mehr als die Hälfte ist rot"], tipp:"Eine einzige rote reicht schon."},
      {f:"Im Sack: 5 Kugeln, davon 4 weiße. Weiß zu ziehen ist …?", r:"sehr wahrscheinlich, aber nicht sicher", x:["sicher","unwahrscheinlich"], tipp:"Die eine andere Kugel kann trotzdem kommen.", bild:{art:"kugeln",saecke:[{w:4,b:1}]}},
      {f:"Weitsprung: Tom 2,80 m · David 3,00 m. Wie viel weiter sprang David?", r:"20 cm", x:["2 cm","30 cm"], tipp:"3,00 − 2,80 = 0,20 m.", bild:{art:"balken",werte:[["Tom",280,"2,80 m"],["David",300,"3,00 m"]]}},
      {f:"Glücksrad: 6 Felder – 3 blau, 2 rot, 1 gelb. Welche Farbe kommt am wahrscheinlichsten?", r:"Blau", x:["Rot","Gelb"], tipp:"Blau hat die meisten Felder.", bild:{art:"rad",felder:{b:3,r:2,g:1}}},
      {f:"Münzwurf: Kopf zu werfen ist …?", r:"möglich – genauso wahrscheinlich wie Zahl", x:["sicher","unmöglich"], tipp:"Kopf und Zahl haben die gleiche Chance."},
      {f:"Sack A: 1 von 3 Kugeln weiß. Sack B: 1 von 2 Kugeln weiß. Wo ist Gewinnen (Weiß) wahrscheinlicher?", r:"In Sack B", x:["In Sack A","In beiden gleich"], tipp:"Die Hälfte ist mehr als ein Drittel.", bild:{art:"kugeln",saecke:[{w:1,b:2},{w:1,b:1}]}},
      {f:"Weitsprung: Mina 2,50 m · Alex 2,10 m. Wer sprang 40 cm weiter als Alex?", r:"Mina", x:["Niemand","Alex selbst"], tipp:"2,10 + 0,40 = 2,50."},
      {f:"Welcher Satz stimmt?", r:"Es ist unmöglich, mit einem Würfel eine 0 zu würfeln", x:["Es ist sicher, morgen Schnee zu haben","Es ist unmöglich, dass eine Münze Kopf zeigt"], tipp:"Auf dem Würfel stehen nur 1 bis 6."},
      {f:"Im Sack: 6 Kugeln, 3 davon weiß. Damit BEIDE Säcke die gleiche Gewinnchance haben, wie viele von 2 Kugeln müssen im anderen Sack weiß sein?", r:"1 von 2", x:["2 von 2","0 von 2"], tipp:"3 von 6 ist die Hälfte – 1 von 2 auch.", bild:{art:"kugeln",saecke:[{w:3,b:3}]}},
      {f:"Tabelle: Ida 1,90 m · Mina 2,50 m · Tom 2,80 m · Alex 2,10 m · David 3,00 m. Wer sprang genau 90 cm weiter als Ida?", r:"Tom", x:["Mina","David"], tipp:"1,90 + 0,90 = 2,80.", bild:{art:"balken",werte:[["Ida",190,"1,90 m"],["Mina",250,"2,50 m"],["Tom",280,"2,80 m"],["Alex",210,"2,10 m"],["David",300,"3,00 m"]]}}
    ]
  }
};
export const MATHE_BEREICHE = [
  { key: "mrechnen", emoji: "🧮", name: "Rechnen" },
  { key: "mzahlen", emoji: "🔢", name: "Zahlen-Profi" },
  { key: "mgeo", emoji: "📐", name: "Formen & Flächen" },
  { key: "mgroessen", emoji: "⏰", name: "Größen & Sachaufgaben" },
  { key: "mdaten", emoji: "🎲", name: "Daten & Zufall" },
];
