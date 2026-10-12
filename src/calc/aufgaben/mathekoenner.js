/* ============================================================
   🏅 MATHEKÖNNER-TRAINING (Klasse 4): drei Schwerpunkte des Tests –
   das 1×1 (mit Umkehraufgaben und großem 1×1), Rechengeschichten
   (ein- und zweischrittige Sachaufgaben aus der Kinderwelt) und der
   Zahlenraum bis 10 000 (Stellenwert, Nachbarzahlen, Runden, Folgen).
   Format wie alle Pools: MC mit 2 Distraktoren, Tipp = Rechenweg.
   ============================================================ */

export const MK_DATEN = {
  mk1x1: {
    easy: [
      {f:"7 · 8 = ?", r:"56", x:["54","48"], tipp:"Merksatz 5-6-7-8: 56 = 7·8."},
      {f:"6 · 7 = ?", r:"42", x:["36","48"], tipp:"6·7 = 6·6 + 6 = 36 + 6."},
      {f:"8 · 8 = ?", r:"64", x:["56","72"], tipp:"Quadratzahl: 8·8 = 64."},
      {f:"9 · 6 = ?", r:"54", x:["56","45"], tipp:"Erst ·10, dann einmal weg: 60 − 6."},
      {f:"7 · 4 = ?", r:"28", x:["24","32"], tipp:"Verdoppeln und nochmal: 7 → 14 → 28."},
      {f:"56 : 8 = ?", r:"7", x:["6","8"], tipp:"Umkehraufgabe: 7·8 = 56."},
      {f:"42 : 6 = ?", r:"7", x:["8","6"], tipp:"Denk rückwärts: 6 · ? = 42."},
      {f:"63 : 9 = ?", r:"7", x:["6","8"], tipp:"9·7 = 63 – also 63:9 = 7."},
      {f:"8 · 3 = ?", r:"24", x:["21","27"], tipp:"8·3 = 8 + 8 + 8."},
      {f:"9 · 9 = ?", r:"81", x:["72","99"], tipp:"Quadratzahl: 9·9 = 81 (10·9 − 9)."},
      {f:"36 : 4 = ?", r:"9", x:["8","7"], tipp:"4 · ? = 36 – die 4er-Reihe hochzählen."},
      {f:"6 · 6 = ?", r:"36", x:["30","42"], tipp:"Quadratzahl: 6·6 = 36."},
    ],
    hard: [
      {f:"11 · 8 = ?", r:"88", x:["98","80"], tipp:"·11 = ·10 und einmal dazu: 80 + 8."},
      {f:"12 · 6 = ?", r:"72", x:["66","84"], tipp:"Zerlegen: 10·6 + 2·6 = 60 + 12."},
      {f:"15 · 4 = ?", r:"60", x:["54","64"], tipp:"15 = 10 + 5: 40 + 20."},
      {f:"13 · 4 = ?", r:"52", x:["48","56"], tipp:"10·4 + 3·4 = 40 + 12."},
      {f:"19 · 6 = ?", r:"114", x:["124","104"], tipp:"Runde Zahl: 20·6 − 6 = 120 − 6."},
      {f:"12 · 12 = ?", r:"144", x:["124","142"], tipp:"12·10 + 12·2 = 120 + 24."},
      {f:"96 : 8 = ?", r:"12", x:["11","14"], tipp:"80:8 = 10 und 16:8 = 2."},
      {f:"7 · 30 = ?", r:"210", x:["21","2100"], tipp:"7·3 = 21, dann die 0 anhängen."},
      {f:"40 · 6 = ?", r:"240", x:["24","2400"], tipp:"4·6 = 24, dann die 0 anhängen."},
      {f:"14 · 5 = ?", r:"70", x:["60","75"], tipp:"10·5 + 4·5 = 50 + 20."},
      {f:"16 · 5 = ?", r:"80", x:["70","85"], tipp:"Trick: 16·10 = 160, davon die Hälfte."},
      {f:"120 : 12 = ?", r:"10", x:["12","11"], tipp:"12 · 10 = 120."},
    ],
  },
  mkgesch: {
    easy: [
      {f:"Im Bus sitzen 23 Kinder. 8 steigen aus, 5 steigen ein. Wie viele sind jetzt im Bus?", r:"20", x:["26","18"], tipp:"Erst 23 − 8 = 15, dann 15 + 5."},
      {f:"Eine Kugel Eis kostet 2 €. Lena kauft 4 Kugeln. Wie viel bezahlt sie?", r:"8 €", x:["6 €","12 €"], tipp:"4 · 2 €."},
      {f:"Tim hat 35 Sticker und verschenkt 12. Wie viele behält er?", r:"23", x:["27","13"], tipp:"35 − 12: erst −10, dann −2."},
      {f:"4 Freunde teilen 28 Gummibärchen gerecht. Wie viele bekommt jeder?", r:"7", x:["6","8"], tipp:"28 : 4 – denk an 4·7."},
      {f:"Eine Woche hat 7 Tage. Wie viele Tage sind 3 Wochen?", r:"21", x:["14","24"], tipp:"3 · 7."},
      {f:"Im Regal stehen 6 Kisten mit je 8 Äpfeln. Wie viele Äpfel sind das?", r:"48", x:["42","54"], tipp:"6 · 8 – die 8er-Reihe."},
      {f:"Ein Block hat 50 Blatt. 18 sind schon verbraucht. Wie viele sind übrig?", r:"32", x:["38","42"], tipp:"50 − 18: erst −20, dann +2."},
      {f:"3 Pizzen mit je 8 Stücken, 5 Stücke sind gegessen. Wie viele sind übrig?", r:"19", x:["24","15"], tipp:"Erst 3·8 = 24, dann −5."},
      {f:"4 Pfandflaschen bringen je 25 Cent. Wie viel Geld gibt es zurück?", r:"1 €", x:["75 Cent","1,25 €"], tipp:"4 · 25 ct = 100 ct."},
      {f:"Der Film beginnt um 15:00 Uhr und dauert 2 Stunden. Wann ist er zu Ende?", r:"17:00 Uhr", x:["16:00 Uhr","17:30 Uhr"], tipp:"15 + 2 Stunden."},
      {f:"9 Tüten mit je 5 Murmeln – wie viele Murmeln zusammen?", r:"45", x:["40","54"], tipp:"9 · 5 – die 5er-Reihe."},
      {f:"16 Kinder spielen auf dem Hof. Es kommen doppelt so viele dazu. Wie viele kommen dazu?", r:"32", x:["16","48"], tipp:"Doppelt so viele wie 16 = 2·16. Gefragt ist nur, wer DAZUKOMMT."},
    ],
    hard: [
      {f:"Die Klasse sammelt für den Ausflug: Montag 145 €, Dienstag 238 €. Das Ziel sind 500 €. Wie viel fehlt noch?", r:"117 €", x:["127 €","383 €"], tipp:"Erst 145 + 238 = 383, dann 500 − 383."},
      {f:"Der Bäcker backt 12 Bleche mit je 15 Brezeln. 96 Brezeln werden verkauft. Wie viele sind übrig?", r:"84", x:["96","76"], tipp:"12·15 = 180, dann 180 − 96."},
      {f:"Die Familienkarte kostet 24 €. Eine Einzelkarte kostet 7 €. Wie viel sparen 4 Personen mit der Familienkarte?", r:"4 €", x:["17 €","3 €"], tipp:"4·7 = 28 €, dann 28 − 24."},
      {f:"Der Zug fährt insgesamt 280 km. Nach 174 km macht er Halt. Wie weit ist es noch?", r:"106 km", x:["116 km","94 km"], tipp:"280 − 174: erst −100, dann −74."},
      {f:"3 Kisten mit je 25 Flaschen, 19 Flaschen sind leer. Wie viele volle Flaschen gibt es?", r:"56", x:["66","44"], tipp:"3·25 = 75, dann 75 − 19."},
      {f:"Mia bekommt 5 € Taschengeld pro Woche und spart 8 Wochen. Dann kauft sie ein Buch für 29 €. Wie viel bleibt übrig?", r:"11 €", x:["9 €","21 €"], tipp:"8·5 = 40 €, dann 40 − 29."},
      {f:"Beim Turnier spielen 6 Mannschaften mit je 11 Kindern. 9 Kinder sind krank. Wie viele spielen?", r:"57", x:["66","48"], tipp:"6·11 = 66, dann 66 − 9."},
      {f:"Ein Puzzle hat 1000 Teile. 350 und noch einmal 280 Teile sind gelegt. Wie viele fehlen?", r:"370", x:["430","270"], tipp:"350 + 280 = 630, dann 1000 − 630."},
      {f:"4 Klassen mit je 24 Kindern. 12 Kinder singen im Chor. Wie viele singen NICHT?", r:"84", x:["96","72"], tipp:"4·24 = 96, dann 96 − 12."},
      {f:"Beim Sportfest turnen 15 Riegen mit je 8 Kindern. Wie viele Kinder turnen?", r:"120", x:["110","135"], tipp:"15·8 = 10·8 + 5·8 = 80 + 40."},
      {f:"Ben kauft 3 Hefte für je 2 € und einen Füller für 4 €. Er bezahlt mit 20 €. Wie viel bekommt er zurück?", r:"10 €", x:["14 €","6 €"], tipp:"3·2 + 4 = 10 €, dann 20 − 10."},
      {f:"Ein Buch hat 240 Seiten. Emma liest 30 Seiten pro Tag. Wie viele Tage braucht sie?", r:"8", x:["7","9"], tipp:"240 : 30 – wie oft passt 30 in 240?"},
    ],
  },
  mkzr: {
    easy: [
      {f:"Welche Zahl hat 4 Tausender, 2 Hunderter, 0 Zehner und 7 Einer?", r:"4207", x:["4270","427"], tipp:"T-H-Z-E: die 0 bei den Zehnern nicht vergessen!", bloecke:{t:4,h:2,z:0,e:7}},
      {f:"Zwischen welchen Nachbartausendern liegt 6500?", r:"6000 und 7000", x:["5000 und 6000","6400 und 6600"], tipp:"Die Tausender direkt davor und danach."},
      {f:"Zähle in Hunderterschritten weiter: 4800, 4900, …?", r:"5000", x:["4910","5900"], tipp:"Nach 49 Hundertern kommen 50 Hunderter."},
      {f:"Welche Zahl ist am größten?", r:"8909", x:["8099","8090"], tipp:"Vergleiche Stelle für Stelle von links."},
      {f:"3999 + 1 = ?", r:"4000", x:["3100","4999"], tipp:"Nach 3999 kommt der nächste Tausender."},
      {f:"Welche Zahl liegt genau in der Mitte zwischen 6000 und 7000?", r:"6500", x:["6050","6600"], tipp:"Die Hälfte von 1000 dazu.", bild:{art:"strahl",von:6000,bis:7000,schritt:500,frage:[6500]}},
      {f:"Runde 7489 auf den nächsten Tausender.", r:"7000", x:["8000","7500"], tipp:"Die Hunderterziffer 4 sagt: abrunden."},
      {f:"10 Hunderter sind …?", r:"1000", x:["100","10 000"], tipp:"10 · 100."},
      {f:"Was bedeutet die 3 in der Zahl 7306?", r:"3 Hunderter", x:["3 Zehner","3 Tausender"], tipp:"Von rechts: Einer, Zehner, Hunderter …", bloecke:{t:7,h:3,z:0,e:6}},
      {f:"5000 + 300 + 20 + 9 = ?", r:"5329", x:["5239","53 209"], tipp:"Jede Zahl an ihre Stelle."},
      {f:"Baue aus den Ziffern 7, 0, 2, 5 die KLEINSTE vierstellige Zahl (jede einmal).", r:"2057", x:["0257","2075"], tipp:"Die 0 darf nicht vorn stehen – kleinste Ziffer zuerst, die 0 gleich danach."},
      {f:"9999 + 1 = ?", r:"10 000", x:["9100","99 991"], tipp:"Die größte vierstellige Zahl plus 1."},
    ],
    hard: [
      {f:"6500 − 800 = ?", r:"5700", x:["5800","6300"], tipp:"Erst −500 bis 6000, dann −300."},
      {f:"Welche Zahl liegt genau in der Mitte zwischen 5200 und 5800?", r:"5500", x:["5400","5600"], tipp:"Abstand 600 → die Hälfte (300) zu 5200.", bild:{art:"strahl",von:5200,bis:5800,schritt:300,frage:[5500]}},
      {f:"4 · 2500 = ?", r:"10 000", x:["8500","1000"], tipp:"4·25 = 100, dann zwei Nullen anhängen."},
      {f:"Zwischen welchen Nachbarzehnern liegt 8095?", r:"8090 und 8100", x:["8000 und 8100","8094 und 8096"], tipp:"Die Zehner direkt davor und danach."},
      {f:"7000 − 1 = ?", r:"6999", x:["6099","7001"], tipp:"Einen Schritt zurück über die Tausendergrenze."},
      {f:"4600 + ? = 5000", r:"400", x:["600","1400"], tipp:"Ergänzen bis zum nächsten Tausender."},
      {f:"Um wie viel ist 8200 größer als 7900?", r:"300", x:["700","1300"], tipp:"7900 + 100 = 8000, dann noch 200."},
      {f:"Runde 8501 auf den nächsten Tausender.", r:"9000", x:["8000","8500"], tipp:"Die Hunderterziffer 5 sagt: aufrunden."},
      {f:"Setze die Folge fort: 9100, 9300, 9500, …?", r:"9700", x:["9600","9900"], tipp:"Es geht in 200er-Schritten.", bild:{art:"folge",zahlen:[9100,9300,9500],weiter:true}},
      {f:"Tausche in 4725 die Hunderter- und die Einerziffer. Welche Zahl entsteht?", r:"4527", x:["7425","4752"], tipp:"Aus 7 Hunderter · 5 Einer wird 5 Hunderter · 7 Einer."},
      {f:"Wie viele Zehner stecken in 4300?", r:"430", x:["43","4300"], tipp:"4300 = 430 · 10."},
      {f:"Welche Zahl gehört ans Fragezeichen?", r:"9750", x:["9500","9775"], tipp:"Die Striche gehen in 250er-Schritten.", bild:{art:"strahl",von:9000,bis:10000,schritt:250,frage:[9750]}},
    ],
  },
};

export const MK_BEREICHE = [
  { key: "mk1x1", emoji: "✖️", name: "1×1-Training" },
  { key: "mkgesch", emoji: "📖", name: "Rechengeschichten" },
  { key: "mkzr", emoji: "🔢", name: "Zahlen bis 10 000" },
];
