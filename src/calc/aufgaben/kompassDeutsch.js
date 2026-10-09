/* 🧭 Kompass-Training Deutsch: die Aufgabenformate aus dem Kompass-4-Test,
   die bisher fehlten. Reine Daten im Pool-Format { easy, hard },
   Aufgabe = { f, r, x:[2], tipp, kontext? }. Alle Texte sind eigene,
   kindgerechte Sachtexte – keine Übernahmen aus Testheften, keine echten Namen. */

// ---------- 🔍 Lese-Detektiv: kurzen Abschnitt lesen, Frage beantworten ----------
const L_ANGELN = "Am Samstag geht Kai mit seinem Opa zum See. Sie nehmen zwei Angeln und einen Eimer mit. Zuerst graben sie im Garten nach Würmern. Dann radeln sie los. Am Steg ist es noch ganz still.";
const L_TROMMEL = "Mia spielt seit einem Jahr Schlagzeug. Jeden Dienstag hat sie Unterricht. Vor dem Spielen dehnt sie kurz ihre Handgelenke. Am liebsten mag sie das Becken, weil es so hell klingt.";
const L_HUND = "Ein Hund braucht jeden Tag Bewegung. Deshalb geht Ben morgens vor der Schule eine kleine Runde mit Rocky. Die große Runde kommt am Nachmittag. Bei Regen zieht Ben Gummistiefel an – Rocky stört das Wetter nicht.";
const L_FUSSBALL = "Vor dem Training zieht sich die Mannschaft um und läuft sich warm. Erst danach holt der Trainer die Bälle. Zum Schluss gibt es immer ein kleines Spiel. Darauf freuen sich alle am meisten.";
const L_PAUSE = "In der großen Pause ist der Schulhof voll. Wer klettern will, geht zum Gerüst. Wer lieber tauscht, trifft sich an der Bank mit seinen Sammelkarten. Kurz vor dem Klingeln stellen sich alle Klassen an ihrem Zeichen auf.";
const L_EIS = "Lena will am Kiosk ein Eis kaufen. Eine Kugel kostet 1 Euro 50. Lena hat 5 Euro dabei. Sie nimmt zwei Kugeln und bekommt Geld zurück. Auf dem Heimweg tropft das Eis, weil die Sonne so warm scheint.";
const L_HONIG = "Honig beginnt als süßer Nektar in den Blüten. Bienen saugen ihn auf und tragen ihn in ihren Stock. Dort geben sie ihn von Biene zu Biene weiter – dabei wird er immer dicker. Anschließend lagern die Bienen den Honig in Waben und verschließen sie mit einem Deckel aus Wachs. Später öffnet die Imkerin die Waben und schleudert den Honig heraus.";
const L_BROT = "Brot wird aus Mehl, Wasser, Salz und Hefe gemacht. Zuerst knetet der Bäcker alles zu einem Teig. Dann muss der Teig ruhen, denn die Hefe braucht Zeit: Sie bildet kleine Blasen, die den Teig größer werden lassen. Erst danach formt der Bäcker die Brote und schiebt sie in den heißen Ofen.";
const L_RAD = "Bevor du mit dem Rad losfährst, prüfe Bremsen, Licht und Klingel. Viele Unfälle passieren, weil ein Rad nicht verkehrssicher ist. Ein Helm ist für Kinder nicht in jedem Land vorgeschrieben, aber er schützt den Kopf bei jedem Sturz. Fachleute raten deshalb: Helm auf – bei jeder Fahrt.";
const L_EULE = "Eulen jagen nachts. Ihre Augen sind riesig und fangen auch schwaches Licht ein. Noch wichtiger sind ihre Ohren: Eulen hören eine Maus sogar unter einer Schneedecke rascheln. Ihre weichen Federn machen den Flug fast lautlos – die Beute bemerkt die Eule erst, wenn es zu spät ist.";
const L_ZELT = "Beim Zeltaufbau kommt es auf die Reihenfolge an. Zuerst suchst du einen ebenen Platz ohne spitze Steine. Dann breitest du die Plane aus und steckst die Stangen zusammen. Erst wenn das Zelt steht, schlägst du die Heringe in den Boden. Zum Schluss spannst du die Leinen – sonst flattert das Zelt beim ersten Wind.";
const L_SCHWIMM = "Im Schwimmbad gelten Regeln, die alle schützen. Gerannt wird am Beckenrand nie, denn die Fliesen sind nass und glatt. Ins tiefe Becken darf nur, wer sicher schwimmen kann. Und gesprungen wird nur dort, wo das Springen erlaubt ist – sonst erschreckt man Schwimmer, die man vom Rand aus nicht sieht.";

export const LESEN_DATEN = {
  easy: [
    { kontext: L_ANGELN, f: "Was nehmen Kai und sein Opa mit zum See?", r: "Zwei Angeln und einen Eimer", x: ["Zwei Eimer und ein Netz", "Eine Angel und ein Zelt"], tipp: "Steht im zweiten Satz – lies ihn noch einmal genau." },
    { kontext: L_ANGELN, f: "Was machen die beiden ZUERST?", r: "Sie graben nach Würmern", x: ["Sie radeln zum See", "Sie setzen sich an den Steg"], tipp: "Das Wort „Zuerst“ im Text verrät die Reihenfolge." },
    { kontext: L_TROMMEL, f: "Was macht Mia, bevor sie spielt?", r: "Sie dehnt ihre Handgelenke", x: ["Sie putzt das Becken", "Sie hört Musik"], tipp: "Such die Stelle mit „Vor dem Spielen“." },
    { kontext: L_TROMMEL, f: "Warum mag Mia das Becken am liebsten?", r: "Weil es so hell klingt", x: ["Weil es am größten ist", "Weil es glänzt"], tipp: "Nach dem Wort „weil“ steht die Begründung." },
    { kontext: L_HUND, f: "Wann geht Ben die GROSSE Runde mit Rocky?", r: "Am Nachmittag", x: ["Morgens vor der Schule", "Nur am Wochenende"], tipp: "Morgens ist die kleine Runde – lies weiter." },
    { kontext: L_HUND, f: "Stimmt das? „Rocky mag keinen Regen.“", r: "Stimmt nicht – das Wetter stört Rocky nicht", x: ["Stimmt – er bleibt bei Regen zu Hause", "Das steht nicht im Text"], tipp: "Der letzte Satz sagt es genau andersherum." },
    { kontext: L_FUSSBALL, f: "Was passiert beim Training ZUERST?", r: "Umziehen und warmlaufen", x: ["Der Trainer holt die Bälle", "Das kleine Spiel"], tipp: "„Vor dem Training“ und „Erst danach“ zeigen dir die Reihenfolge." },
    { kontext: L_FUSSBALL, f: "Worauf freuen sich alle am meisten?", r: "Auf das kleine Spiel am Schluss", x: ["Auf das Warmlaufen", "Auf das Umziehen"], tipp: "Steht in den letzten beiden Sätzen." },
    { kontext: L_PAUSE, f: "Wo treffen sich die Kinder, die Karten tauschen?", r: "An der Bank", x: ["Am Klettergerüst", "Am Klassenzeichen"], tipp: "Jeder Ort gehört im Text zu einer Sache – such das Tauschen." },
    { kontext: L_PAUSE, f: "Was machen alle kurz vor dem Klingeln?", r: "Sie stellen sich an ihrem Zeichen auf", x: ["Sie klettern aufs Gerüst", "Sie gehen zum Kiosk"], tipp: "Lies den letzten Satz." },
    { kontext: L_EIS, f: "Wie viele Kugeln Eis kauft Lena?", r: "Zwei", x: ["Eine", "Drei"], tipp: "„Sie nimmt zwei Kugeln …“" },
    { kontext: L_EIS, f: "Warum tropft das Eis auf dem Heimweg?", r: "Weil die Sonne so warm scheint", x: ["Weil Lena zu langsam isst", "Weil die Kugeln zu groß sind"], tipp: "Die Begründung steht nach dem Wort „weil“." },
  ],
  hard: [
    { kontext: L_HONIG, f: "In welcher Reihenfolge passiert es im Stock?", r: "Weitergeben → in Waben lagern → mit Wachs verschließen", x: ["In Waben lagern → weitergeben → verschließen", "Verschließen → weitergeben → lagern"], tipp: "„Dort … dabei … Anschließend“ – diese Wörter ordnen die Schritte." },
    { kontext: L_HONIG, f: "Wann wird der Nektar dicker?", r: "Wenn die Bienen ihn von Biene zu Biene weitergeben", x: ["Erst beim Schleudern durch die Imkerin", "Schon in der Blüte"], tipp: "Such den Satz mit dem Gedankenstrich – dahinter steht es." },
    { kontext: L_HONIG, f: "Welche Überschrift passt am besten zu diesem Text?", r: "Wie Honig entsteht", x: ["Warum Bienen stechen", "Der Beruf der Imkerin"], tipp: "Die Überschrift muss zum GANZEN Text passen, nicht nur zu einem Satz." },
    { kontext: L_BROT, f: "Warum muss der Teig ruhen?", r: "Die Hefe braucht Zeit, um Blasen zu bilden", x: ["Damit das Salz sich auflöst", "Weil der Ofen noch kalt ist"], tipp: "Nach „denn“ steht die Begründung." },
    { kontext: L_BROT, f: "Stimmt das? „Der Bäcker formt die Brote vor dem Ruhen.“", r: "Stimmt nicht – erst ruht der Teig, dann wird geformt", x: ["Stimmt – Formen kommt zuerst", "Das steht nicht im Text"], tipp: "„Erst danach formt der Bäcker …“ – prüfe die Reihenfolge." },
    { kontext: L_RAD, f: "Was ist mit „verkehrssicher“ gemeint?", r: "Bremsen, Licht und Klingel funktionieren", x: ["Das Rad ist neu gekauft", "Das Rad hat eine schöne Farbe"], tipp: "Der erste Satz zählt auf, was du prüfen sollst – genau das ist gemeint." },
    { kontext: L_RAD, f: "Stimmt das? „Ein Helm ist für Kinder überall vorgeschrieben.“", r: "Stimmt nicht – aber Fachleute raten trotzdem dazu", x: ["Stimmt – ohne Helm ist Radfahren verboten", "Das steht nicht im Text"], tipp: "Lies den Satz mit „nicht in jedem Land“ ganz genau." },
    { kontext: L_EULE, f: "Was ist für die Jagd der Eule am wichtigsten?", r: "Ihre Ohren", x: ["Ihre Krallen", "Ihre Federn"], tipp: "„Noch wichtiger sind …“ – dieses Signalwort hebt etwas hervor." },
    { kontext: L_EULE, f: "Warum bemerkt die Beute die Eule so spät?", r: "Weiche Federn machen den Flug fast lautlos", x: ["Die Eule jagt nur bei Vollmond", "Die Eule ruft vorher laut"], tipp: "Der vorletzte Satz erklärt es." },
    { kontext: L_ZELT, f: "Was machst du beim Zeltaufbau als LETZTES?", r: "Die Leinen spannen", x: ["Die Heringe einschlagen", "Die Stangen zusammenstecken"], tipp: "„Zum Schluss“ verrät den letzten Schritt." },
    { kontext: L_ZELT, f: "Welche Überschrift passt am besten?", r: "Ein Zelt richtig aufbauen", x: ["Das beste Zelt kaufen", "Gewitter beim Zelten"], tipp: "Worum geht es in JEDEM Satz? Genau darum muss es in der Überschrift gehen." },
    { kontext: L_SCHWIMM, f: "Warum darf am Beckenrand nicht gerannt werden?", r: "Die nassen Fliesen sind glatt", x: ["Weil es die Schwimmer stört", "Weil es dort zu eng ist"], tipp: "Nach „denn“ steht die Begründung im Text." },
  ],
};

// ---------- 🧰 Ableiten & Verlängern: die zwei Rechtschreib-Strategien ----------
export const STRATEGIE_DATEN = {
  easy: [
    { f: "Hund – hörst du am Ende d oder t? Welche Strategie hilft?", r: "Verlängern: die Hunde → d", x: ["Ableiten: von „Hand“", "Einfach raten"], tipp: "Mach das Wort länger, dann hörst du den Buchstaben deutlich." },
    { f: "Berg – b oder p am Ende? Verlängere!", r: "die Berge → g", x: ["die Berke → k", "die Bergs → s"], tipp: "Die Mehrzahl macht den letzten Buchstaben hörbar." },
    { f: "Wald – wie prüfst du das d am Ende?", r: "Verlängern: die Wälder", x: ["Ableiten: von „Welt“", "Das W großschreiben"], tipp: "Wäl-der – jetzt hörst du das d." },
    { f: "Bäume – warum mit ä? Leite ab!", r: "Von „Baum“ – a wird zu ä", x: ["Von „Bein“", "Von „bauen“"], tipp: "Ein ä kommt oft von einem verwandten Wort mit a." },
    { f: "Räuber – warum äu und nicht eu?", r: "Kommt von „rauben“ mit au", x: ["Kommt von „Rebe“", "äu klingt schöner"], tipp: "äu leitest du von einem Wort mit au ab." },
    { f: "Korb oder Korp? Verlängere!", r: "die Körbe → b", x: ["die Körpe → p", "die Korbs → s"], tipp: "Kör-be – das b ist jetzt gut zu hören." },
    { f: "„er fährt“ – mit ä oder e? Leite ab!", r: "Mit ä – von „fahren“ mit a", x: ["Mit e – von „Ferne“", "Mit e – klingt heller"], tipp: "fährt gehört zu fahren – a wird zu ä." },
    { f: "Welche Strategie brauchst du bei „Zug“ (g oder k)?", r: "Verlängern: die Züge", x: ["Ableiten von „zack“", "Großschreiben"], tipp: "Zü-ge – jetzt hörst du das g." },
    { f: "„Händler“ – warum mit ä?", r: "Kommt von „Handel/Hand“ mit a", x: ["Kommt von „Ende“", "Weil ein e folgt"], tipp: "ä leitet sich von a ab: Hand → Händler." },
    { f: "„Dieb“ – b oder p? Verlängere!", r: "die Diebe → b", x: ["die Diepe → p", "das Diebchen → p"], tipp: "Die-be – deutlich ein b." },
    { f: "„träumen“ – warum äu?", r: "Kommt von „Traum“ mit au", x: ["Kommt von „treu“", "äu ist immer richtig"], tipp: "Traum → träumen: au wird zu äu." },
    { f: "Wann hilft dir VERLÄNGERN?", r: "Wenn du den letzten Buchstaben nicht genau hörst", x: ["Wenn ein Wort großgeschrieben wird", "Wenn ein Satz zu kurz ist"], tipp: "b/p, d/t, g/k am Wortende: Mehrzahl bilden und hinhören!" },
  ],
  hard: [
    { f: "„bräunlich“ – von welchem Wort leitest du ab?", r: "braun", x: ["Brauerei", "Brille"], tipp: "äu kommt von au: braun → bräunlich." },
    { f: "„er tobt“ – b oder p? Wie prüfst du es?", r: "Verlängern: toben → b", x: ["Ableiten: von „Topf“", "Merken: immer p"], tipp: "Die Grundform macht den Mitlaut hörbar: to-ben." },
    { f: "„er fliegt“ – g oder k? Wie prüfst du es?", r: "Verlängern: fliegen → g", x: ["Ableiten: von „Flagge“", "Merken: immer k"], tipp: "flie-gen – deutlich ein g." },
    { f: "„halb“ – b oder p am Ende? Wie prüfst du es?", r: "Verlängern: hal-be → b", x: ["Ableiten von „Hilfe“", "Merken: immer p"], tipp: "halb → halbe: Das b wird hörbar." },
    { f: "„Gebirge“ – wie erklärst du das g am Ende von „Berg“ darin?", r: "Verlängern: Berge – das g bleibt in der Wortfamilie", x: ["Ableiten von „Birke“", "Das g ist stumm"], tipp: "Ein Wortstamm behält seine Schreibung in der ganzen Familie." },
    { f: "„kälter“ – warum ä?", r: "Ableiten von „kalt“", x: ["Verlängern: die Kälter", "Weil l folgt"], tipp: "kalt → kälter: Das a bleibt als ä sichtbar." },
    { f: "„Stäbchen“ – warum b und ä?", r: "Von „Stab/Stäbe“: ableiten UND verlängern", x: ["Von „Step“", "Merkwort ohne Regel"], tipp: "Manchmal brauchst du beide Strategien zusammen." },
    { f: "„er gräbt“ – wie prüfst du ä und b?", r: "graben: a→ä ableiten, gra-ben verlängern", x: ["Von „Grippe“ ableiten", "Beides nur merken"], tipp: "Die Grundform „graben“ beantwortet beide Fragen." },
    { f: "Welches Wort kannst du NICHT durch Verlängern prüfen?", r: "und", x: ["Hund", "Wand"], tipp: "Kleine Wörter wie „und“ musst du dir merken – sie haben keine Mehrzahl." },
    { f: "„Läufer“ – warum äu?", r: "Ableiten von „laufen“", x: ["Verlängern: die Läufers", "äu vor f ist Regel"], tipp: "laufen mit au → Läufer mit äu." },
    { f: "„Feld“ – d oder t? Und wie schreibst du „Felder“?", r: "Fel-der zeigt das d – beide mit d", x: ["Feld mit t, Felder mit d", "Beide mit t"], tipp: "Die Verlängerung gilt für das kurze Wort mit." },
    { f: "„sägt, Säge, sägen“ – was zeigt dir die Wortfamilie?", r: "Der Stamm säg- wird überall gleich geschrieben", x: ["Jedes Wort wird anders geschrieben", "Nur Nomen haben einen Stamm"], tipp: "Ein Stamm, eine Schreibung – das ist der Trick der Wortfamilien." },
  ],
};

// ---------- 🌱 Wortfamilien & Wortstamm ----------
export const WORTFAM_DATEN = {
  easy: [
    { f: "Welches Wort gehört zur Familie von „fahren“?", r: "Mitfahrer", x: ["Farbe", "Ferien"], tipp: "Such den Stamm fahr- im Wort." },
    { f: "Wortstamm von „spielen“?", r: "spiel", x: ["spie", "len"], tipp: "Der Stamm steckt in Spieler, Spielfeld, verspielt …" },
    { f: "Welches Wort gehört NICHT zur Familie von „laufen“?", r: "Laub", x: ["Läufer", "weglaufen"], tipp: "Laub hat nichts mit laufen zu tun – nur ähnliche Buchstaben." },
    { f: "Wortstamm von „abgefahren“?", r: "fahr", x: ["abge", "ren"], tipp: "Vorsilbe ab-, ge- weg – übrig bleibt der Stamm." },
    { f: "Welche drei Wörter sind eine Wortfamilie?", r: "backen, Bäcker, Gebäck", x: ["backen, Backe, Bach", "Bäcker, Becher, Bank"], tipp: "Alle müssen den gleichen Stamm UND eine verwandte Bedeutung haben." },
    { f: "Wortstamm von „Schwimmbad“ (erster Teil)?", r: "schwimm", x: ["schwi", "bad"], tipp: "Schwimmer, schwimmen, Schwimmbad – immer schwimm-." },
    { f: "Welches Wort gehört zur Familie von „schreiben“?", r: "Abschrift", x: ["Schraube", "Schrank"], tipp: "schreiben – schrieb – Schrift: Der Stamm darf sich leicht verändern." },
    { f: "Wortstamm von „sie fährt“?", r: "fahr (mit ä geschrieben: fähr)", x: ["sie", "rt"], tipp: "fährt gehört zu fahren – der Stamm bekommt hier ein ä." },
    { f: "Welches Wort gehört NICHT zur Familie von „Spiel“?", r: "Spiegel", x: ["verspielt", "Spielplatz"], tipp: "Spiegel klingt ähnlich, hat aber eine ganz andere Bedeutung." },
    { f: "„wissen, er weiß, ihr wisst“ – was gehört zusammen?", r: "Alle drei – eine Wortfamilie mit Stamm wiss/weiß", x: ["Nur wissen und wisst", "Nur weiß und weiße Farbe"], tipp: "Der Stamm darf seine Form ändern: wiss ↔ weiß." },
    { f: "Wortstamm von „Rechnung“?", r: "rechn", x: ["ung", "rech"], tipp: "rechnen, Rechner, Rechnung – überall rechn-." },
    { f: "Wozu hilft dir eine Wortfamilie beim Schreiben?", r: "Der Stamm wird in allen Wörtern gleich geschrieben", x: ["Alle Wörter werden großgeschrieben", "Man darf den Stamm weglassen"], tipp: "Kennst du EIN Wort sicher, kannst du die ganze Familie schreiben." },
  ],
  hard: [
    { f: "„Ich weiß, dass …“ – warum mit ß?", r: "Stamm aus der Familie „wissen“: nach langem ei steht ß", x: ["Weil „weiss“ falsch klingt", "ß steht nach jedem w-Wort"], tipp: "er weiß (lang) → ß; ihr wisst (kurz) → ss." },
    { f: "„Ihr wisst genau …“ – warum mit ss?", r: "Kurzer i-Laut: Familie „wissen“ mit ss", x: ["Mit ß, weil es zu „weiß“ gehört", "Mit einem s, weil t folgt"], tipp: "Kurzer Selbstlaut → ss, langer → ß." },
    { f: "Kreise den Stamm ein: „sie fährt – Mitfahrer – abgefahren“", r: "fahr (einmal als fähr)", x: ["fährt", "mit/ab"], tipp: "Vor- und Nachsilben weg – was in ALLEN dreien steckt, ist der Stamm." },
    { f: "Welches Wort gehört zur Familie von „Zahl“?", r: "bezahlen", x: ["Zahn", "zähmen"], tipp: "zahlen, Zähler, bezahlen – der Stamm zahl/zähl." },
    { f: "Welche Familie passt zu „Fall“?", r: "fallen, gefallen, Unfall", x: ["Falle, Falte, falsch", "fallen, Faden, Feld"], tipp: "Bedeutung prüfen: Bei einem Unfall FÄLLT etwas vor." },
    { f: "„Gefahr – gefährlich – ungefährlich“: Was zeigt das ä?", r: "Der Stamm behält seine Schreibung – a wird zu ä", x: ["Das ä ist ein Tippfehler", "Jedes Wort hat hier einen anderen Stamm"], tipp: "fahr/fähr: Der Stamm bleibt in der ganzen Familie erkennbar." },
    { f: "Welches Wort ist der „falsche Freund“ in der Reihe „Nacht, Nächte, nächtlich, nackt“?", r: "nackt", x: ["Nächte", "nächtlich"], tipp: "Gleiche Buchstaben am Anfang reichen nicht – die Bedeutung muss passen." },
    { f: "„er schlägt – Schläger – Schlagzeug“: Stamm?", r: "schlag (mal mit ä)", x: ["schläg immer mit ä", "zeug"], tipp: "Beim Schlagzeug steckt der Stamm sogar zweimal im Alltag: schlagen!" },
    { f: "Warum schreibt man „Händchen“ mit ä?", r: "Es gehört zur Familie „Hand“ – a wird zu ä", x: ["Vor -chen steht immer ä", "Wegen des großen H"], tipp: "Verkleinerungen behalten den Stamm: Hand → Händchen." },
    { f: "Welche zwei Wörter haben den GLEICHEN Stamm?", r: "Verkäufer und kaufen", x: ["Käfer und kaufen", "Verkäufer und Kiefer"], tipp: "ver-KAUF-er: Vorsilbe und Endung weg, dann vergleichen." },
    { f: "„springen – sprang – gesprungen“: Was gilt für den Stamm?", r: "Er ändert den Selbstlaut, bleibt aber eine Familie", x: ["Das sind drei Familien", "Nur „springen“ hat einen Stamm"], tipp: "Starke Verben wechseln i/a/u – die Familie bleibt." },
    { f: "Mit welchem Familienwort prüfst du das h in „fahren“?", r: "Gar nicht nötig – das h steckt im Stamm fahr und bleibt überall", x: ["Mit „Fahrt“ fällt das h weg", "Mit „fuhr“ wird es zu einem g"], tipp: "Fahrer, Fahrt, Abfahrt: Das stille h fährt immer mit." },
  ],
};

// ---------- 🧩 Wörter zusammenbauen: zusammengesetzte Nomen ----------
export const ZUSNOMEN_DATEN = {
  easy: [
    { f: "Ein Regal für Bücher ist ein …?", r: "Bücherregal", x: ["Regalbuch", "Buchbrett"], tipp: "Das Grundwort (was es IST) steht hinten: ein Regal." },
    { f: "Eine Höhle, in der Räuber wohnen, ist eine …?", r: "Räuberhöhle", x: ["Höhlenräuber", "Raubhaus"], tipp: "Hinten steht, was es ist – vorne, wer darin wohnt." },
    { f: "Baue zusammen: der Fuß + der Ball = ?", r: "der Fußball", x: ["der Ballfuß", "das Fußballen"], tipp: "Das hintere Wort bestimmt auch den Artikel: DER Ball → DER Fußball." },
    { f: "Welcher Artikel passt: … Haustür?", r: "die (wie DIE Tür)", x: ["das (wie DAS Haus)", "der"], tipp: "Immer das Grundwort hinten fragen: die Tür." },
    { f: "Ein Platz zum Spielen ist ein …?", r: "Spielplatz", x: ["Platzspiel", "Spielhof"], tipp: "Was ist es? Ein Platz. Wofür? Zum Spielen." },
    { f: "Baue zusammen: regnen + der Schirm = ?", r: "der Regenschirm", x: ["der Schirmregen", "der Regnenschirm"], tipp: "Aus dem Verb wird „Regen“ – das Bestimmungswort passt sich an." },
    { f: "Was ist das Grundwort in „Apfelbaum“?", r: "Baum", x: ["Apfel", "beides gleich"], tipp: "Das Grundwort steht hinten und sagt, was es IST: ein Baum." },
    { f: "Was ist das Bestimmungswort in „Apfelbaum“?", r: "Apfel", x: ["Baum", "baum"], tipp: "Das vordere Wort bestimmt genauer: WAS für ein Baum?" },
    { f: "Baue zusammen: gießen + die Kanne = ?", r: "die Gießkanne", x: ["die Kannengießerin", "das Gießenkanne"], tipp: "Verb gießen + Nomen Kanne = Gießkanne – Artikel von „Kanne“." },
    { f: "Welches Wort ist ZUSAMMENGESETZT?", r: "Schulhof", x: ["Schule", "Hof"], tipp: "Zusammengesetzt = zwei Wörter in einem: Schul + Hof." },
    { f: "Baue zusammen: die Sonne + die Blume = ?", r: "die Sonnenblume", x: ["die Blumensonne", "die Sonneblume"], tipp: "Oft kommt ein Fugen-n dazu: Sonne-n-blume." },
    { f: "Ein Schrank für Kleider ist ein …?", r: "Kleiderschrank", x: ["Schrankkleid", "Kleidschrank"], tipp: "Mehrzahl als Bestimmungswort: Kleider + Schrank." },
  ],
  hard: [
    { f: "„das Schwimmbad“ – Bestimmungswort und seine Wortart?", r: "schwimmen – ein Verb", x: ["Schwimm – ein Nomen", "bad – ein Adjektiv"], tipp: "Frage: Was tut man dort? Schwimmen – das ist ein Verb." },
    { f: "„der Vogelkäfig“ – Bestimmungswort und Wortart?", r: "Vogel – ein Nomen", x: ["vogel – ein Verb", "Käfig – ein Adjektiv"], tipp: "Der Vogel ist ein Ding/Lebewesen → Nomen." },
    { f: "„der Buntspecht“ – Bestimmungswort und Wortart?", r: "bunt – ein Adjektiv", x: ["Bunt – ein Nomen", "Specht – ein Verb"], tipp: "Wie ist der Specht? Bunt – Wie-Wörter sind Adjektive." },
    { f: "„die Waschmaschine“ – Wortart des Bestimmungsworts?", r: "Verb (waschen)", x: ["Nomen (die Wäsche)", "Adjektiv (waschig)"], tipp: "Was TUT die Maschine? Sie wäscht." },
    { f: "„das Rotkehlchen“ – Wortart des Bestimmungsworts?", r: "Adjektiv (rot)", x: ["Nomen (das Rot)", "Verb (röten)"], tipp: "WIE ist die Kehle? Rot." },
    { f: "„die Haustür“ – Wortart des Bestimmungsworts?", r: "Nomen (das Haus)", x: ["Verb (hausen)", "Adjektiv (häuslich)"], tipp: "Das Haus ist ein Ding → Nomen." },
    { f: "Welches zusammengesetzte Nomen hat ein VERB vorne?", r: "Bohrmaschine", x: ["Türgriff", "Großstadt"], tipp: "bohren + Maschine – die anderen beginnen mit Nomen bzw. Adjektiv." },
    { f: "Welches zusammengesetzte Nomen hat ein ADJEKTIV vorne?", r: "Großstadt", x: ["Stadtplan", "Fahrplan"], tipp: "groß + Stadt – WIE ist die Stadt?" },
    { f: "Warum heißt es DIE Schlagzeugstunde, obwohl DAS Schlagzeug sagt?", r: "Das Grundwort „Stunde“ bestimmt den Artikel", x: ["Schlagzeug bestimmt den Artikel", "Bei langen Wörtern gilt immer „die“"], tipp: "Immer hinten schauen: die Stunde." },
    { f: "Baue das Nomen: ein Netz zum Fangen von Schmetterlingen", r: "das Schmetterlingsnetz", x: ["das Netzschmetterling", "der Schmetterlingnetz"], tipp: "Mit Fugen-s: Schmetterling-s-netz; Artikel von „Netz“." },
    { f: "Zerlege „Taschenlampenlicht“ richtig!", r: "Taschen + Lampen + Licht", x: ["Tasche + nlampenlicht", "Taschenlam + Penlicht"], tipp: "Drei Bausteine – das letzte Wort ist das Grundwort." },
    { f: "„das Lesebuch“ – Wortart des Bestimmungsworts?", r: "Verb (lesen)", x: ["Nomen (die Lese)", "Adjektiv (leserlich)"], tipp: "Was tut man damit? Lesen – das Bestimmungswort ist ein Verb." },
  ],
};

// ---------- 📈 Adjektive steigern ----------
export const STEIGERN_DATEN = {
  easy: [
    { f: "schnell – schneller – … ?", r: "am schnellsten", x: ["am schnellerten", "am meisten schnell"], tipp: "2. Vergleichsstufe: am + -sten." },
    { f: "klein – … – am kleinsten?", r: "kleiner", x: ["kleinerer", "mehr klein"], tipp: "1. Vergleichsstufe: einfach -er anhängen." },
    { f: "laut – lauter – … ?", r: "am lautesten", x: ["am lautsten", "am lauterst"], tipp: "Nach t kommt ein e dazwischen: lau-TE-sten." },
    { f: "Wie heißen die drei Stufen von „stark“?", r: "stark – stärker – am stärksten", x: ["stark – starker – am starksten", "stark – stärker – am meisten stark"], tipp: "a wird oft zu ä: stark → stärker." },
    { f: "alt – … – am ältesten?", r: "älter", x: ["alter", "mehr alt"], tipp: "a → ä und -er anhängen." },
    { f: "Wie heißt die Grundstufe zu „schöner“?", r: "schön", x: ["schönst", "am schönsten"], tipp: "Die Grundstufe ist das Adjektiv ohne Endung." },
    { f: "jung – jünger – … ?", r: "am jüngsten", x: ["am jungsten", "am jüngerten"], tipp: "u → ü in beiden Vergleichsstufen." },
    { f: "weit – weiter – … ?", r: "am weitesten", x: ["am weitsten", "am weiterten"], tipp: "Nach t: -esten (wei-TE-sten)." },
    { f: "Welche Reihe ist richtig gesteigert?", r: "mutig – mutiger – am mutigsten", x: ["mutig – mehr mutig – am meisten mutig", "mutig – mutiger – am mutigesten"], tipp: "Deutsch steigert mit Endungen, nicht mit „mehr“." },
    { f: "groß – größer – … ?", r: "am größten", x: ["am größesten", "am grössten"], tipp: "o → ö, und es bleibt beim ß." },
    { f: "leise – leiser – … ?", r: "am leisesten", x: ["am leisten", "am leiserten"], tipp: "lei-SE-sten – das e gehört zum Wort." },
    { f: "Wozu steigert man Adjektive?", r: "Um Dinge zu vergleichen", x: ["Um Sätze länger zu machen", "Um Nomen zu ersetzen"], tipp: "schnell – schneller – am schnellsten: Wer gewinnt das Rennen?" },
  ],
  hard: [
    { f: "Welche Grundstufe gehört zu „klüger“?", r: "klug", x: ["klüg", "kluge"], tipp: "u → ü beim Steigern: klug → klüger → am klügsten." },
    { f: "klug – klüger – … ?", r: "am klügsten", x: ["am klugsten", "am klügesten"], tipp: "Kurz und mit Umlaut: am klügsten." },
    { f: "gut – … – … ?", r: "besser – am besten", x: ["güter – am gütesten", "guter – am gutesten"], tipp: "„gut“ steigert völlig unregelmäßig – merken!" },
    { f: "viel – … – … ?", r: "mehr – am meisten", x: ["vieler – am vielsten", "mehrer – am mehrsten"], tipp: "Auch „viel“ ist unregelmäßig." },
    { f: "hoch – … – am höchsten?", r: "höher", x: ["hocher", "höcher"], tipp: "Das c verschwindet in der Mitte: hoch → höher." },
    { f: "nah – näher – … ?", r: "am nächsten", x: ["am nahsten", "am nähesten"], tipp: "Überraschung: Bei „nah“ kommt ein ch dazu." },
    { f: "gern – … – … ?", r: "lieber – am liebsten", x: ["gerner – am gernsten", "mehr gern – am meisten gern"], tipp: "„Ich spiele gern, lieber, am liebsten“ – unregelmäßig." },
    { f: "dunkel – … – am dunkelsten?", r: "dunkler", x: ["dunkeler", "dünkler"], tipp: "Das e in der Mitte fällt weg: dunk-ler." },
    { f: "teuer – … – am teuersten?", r: "teurer", x: ["teuerer", "töirer"], tipp: "Auch hier fällt ein e weg: teu-rer." },
    { f: "Welche Reihe ist KOMPLETT richtig?", r: "warm – wärmer – am wärmsten", x: ["warm – warmer – am wärmsten", "warm – wärmer – am warmsten"], tipp: "Der Umlaut gilt in BEIDEN Vergleichsstufen." },
    { f: "scharf – schärfer – … ?", r: "am schärfsten", x: ["am scharfsten", "am schärfesten"], tipp: "a → ä und kurzes -sten." },
    { f: "In der Tabelle steht nur „klüger“. Welche Spalte ist das?", r: "1. Vergleichsstufe", x: ["Grundstufe", "2. Vergleichsstufe"], tipp: "-er ohne „am“ = 1. Vergleichsstufe." },
  ],
};

// ---------- 🔧 Verbformen bilden: Grundform, Präsens, Präteritum ----------
export const VERBFORM_DATEN = {
  easy: [
    { f: "„Am Nachmittag ging er zu seinem Freund.“ – Grundform von „ging“?", r: "gehen", x: ["gingen", "gehte"], tipp: "Die Grundform endet auf -en und steht im Wörterbuch." },
    { f: "Grundform von „schwimmt“?", r: "schwimmen", x: ["schwimmte", "geschwommen"], tipp: "Frage: Was kann man tun? schwimmen." },
    { f: "Grundform von „aß“?", r: "essen", x: ["aßen", "isst"], tipp: "aß ist die Vergangenheit von essen." },
    { f: "Grundform von „lief“?", r: "laufen", x: ["liefen", "laufte"], tipp: "lief gehört zu laufen – der Selbstlaut wechselt." },
    { f: "„wir füttern“ – welche Zeitform ist das?", r: "Präsens (Gegenwart)", x: ["Präteritum (Vergangenheit)", "Grundform"], tipp: "Es passiert JETZT → Präsens." },
    { f: "„wir füttern“ im Präteritum?", r: "wir fütterten", x: ["wir gefüttert", "wir fütterton"], tipp: "Regelmäßige Verben: -te-Endung (füttern → fütterte)." },
    { f: "„es schwimmt“ im Präteritum?", r: "es schwamm", x: ["es schwimmte", "es geschwommen"], tipp: "Starkes Verb: i wird zu a (schwimmen → schwamm)." },
    { f: "„ich spiele“ im Präteritum?", r: "ich spielte", x: ["ich spielen", "ich gespielt"], tipp: "spielen ist regelmäßig: einfach -te." },
    { f: "Grundform von „sie fährt“?", r: "fahren", x: ["fährten", "gefahren"], tipp: "fährt → fahren; „gefahren“ wäre das Partizip." },
    { f: "„er liest“ – Grundform und Präteritum?", r: "lesen – er las", x: ["lesen – er leste", "liesen – er las"], tipp: "lesen ist stark: las, gelesen." },
    { f: "„du malst“ im Präteritum?", r: "du maltest", x: ["du malte", "du gemalt"], tipp: "malen + test für „du“: du mal-test." },
    { f: "Woran erkennst du die Grundform eines Verbs?", r: "Sie endet meist auf -en und nennt die Tätigkeit", x: ["Sie beginnt groß", "Sie steht immer am Satzende"], tipp: "rennen, lesen, bauen – so stehen Verben im Wörterbuch." },
  ],
  hard: [
    { f: "„Meine Schwester und ich füttern den Hund.“ – Grundform, Präsens (wir), Präteritum (wir)?", r: "füttern – wir füttern – wir fütterten", x: ["füttern – wir füttern – wir gefüttert", "futtern – wir füttern – wir fütterten"], tipp: "Regelmäßig: Präteritum mit -ten." },
    { f: "„Das Kind schwimmt schnell.“ – Grundform, Präsens (es), Präteritum (es)?", r: "schwimmen – es schwimmt – es schwamm", x: ["schwimmen – es schwimmt – es schwimmte", "schwammen – es schwimmt – es schwamm"], tipp: "Starkes Verb: schwimmen – schwamm." },
    { f: "„sie singen“ im Präteritum?", r: "sie sangen", x: ["sie singten", "sie gesungen"], tipp: "singen – sang – gesungen: i → a." },
    { f: "„er findet“ im Präteritum?", r: "er fand", x: ["er findete", "er gefunden"], tipp: "finden – fand – gefunden." },
    { f: "„wir bringen“ im Präteritum?", r: "wir brachten", x: ["wir bringten", "wir brangen"], tipp: "bringen – brachte: unregelmäßig mit ch!" },
    { f: "„ihr lauft“ im Präteritum?", r: "ihr lieft", x: ["ihr lauftet", "ihr liefte"], tipp: "laufen – lief; für „ihr“: lieft." },
    { f: "„denken“ – wie heißt das Präteritum (ich)?", r: "ich dachte", x: ["ich denkte", "ich gedacht"], tipp: "denken – dachte – gedacht: e → a mit ch." },
    { f: "Welche Reihe ist richtig?", r: "rufen – er ruft – er rief", x: ["rufen – er ruft – er rufte", "riefen – er ruft – er rief"], tipp: "rufen ist stark: rief." },
    { f: "„Der Hund bellte laut.“ – welche Zeitform und Grundform?", r: "Präteritum von bellen", x: ["Präsens von bellten", "Perfekt von bellen"], tipp: "-te-Endung ohne „haben/sein“ = Präteritum." },
    { f: "„wissen“ – Präsens (ich) und Präteritum (ich)?", r: "ich weiß – ich wusste", x: ["ich wisse – ich wusste", "ich weiß – ich wisste"], tipp: "wissen ist besonders: weiß, wusste, gewusst." },
    { f: "Welche Form ist das PRÄSENS von „nehmen“ (du)?", r: "du nimmst", x: ["du nehmst", "du nahmst"], tipp: "e → i bei du/er: nehmen → nimmst; nahmst wäre Präteritum." },
    { f: "„Wir aßen Spaghetti.“ – setze in das Präsens!", r: "Wir essen Spaghetti.", x: ["Wir aßen gerade Spaghetti.", "Wir haben Spaghetti gegessen."], tipp: "Präsens = Gegenwart: essen; „haben gegessen“ wäre Perfekt." },
  ],
};

// 🧭 Die sechs Kompass-Bereiche am Stück (für Übungs-Liste und Tests).
export const KOMPASS_DEUTSCH_BEREICHE = [
  { key: "lesen", emoji: "🔍", name: "Lese-Detektiv" },
  { key: "strategie", emoji: "🧰", name: "Ableiten & Verlängern" },
  { key: "wortfam", emoji: "🌱", name: "Wortfamilien & Stamm" },
  { key: "zusnomen", emoji: "🧩", name: "Wörter zusammenbauen" },
  { key: "steigern", emoji: "📈", name: "Adjektive steigern" },
  { key: "verbform", emoji: "🔧", name: "Verbformen bilden" },
];
export const KOMPASS_DEUTSCH_DATEN = {
  lesen: LESEN_DATEN,
  strategie: STRATEGIE_DATEN,
  wortfam: WORTFAM_DATEN,
  zusnomen: ZUSNOMEN_DATEN,
  steigern: STEIGERN_DATEN,
  verbform: VERBFORM_DATEN,
};
