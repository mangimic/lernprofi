/* ============================================================
   📰 BERICHT SCHREIBEN (Klasse 4) – Daten und reine Logik.
   Grundlage ist der Schul-Leitfaden „W-Fragen zum Bericht“:
   Wann? · Wo? · Was? · Wer? · Warum? · Wie? · Welche Folgen?
   Jeder Fall bringt eine Zeugenaussage (geplaudert, mit Gefühlen,
   wörtlicher Rede und Unwichtigem), den ausgefüllten Leitfaden,
   einen Muster-Bericht (5 Sätze: Einleitung · Hauptteil · Schluss),
   drei Sätze, die NICHT in einen Bericht gehören, und vier Verben
   fürs Präteritum. Der erste Fall ist der aus der Schule; die
   anderen kommen aus den Welten, die Kinder mögen
   (Muster „Interesse schlägt Pflicht“).
   ============================================================ */

/** Die 7 W-Fragen in der Reihenfolge des Schul-Leitfadens. */
export const W_FRAGEN = [
  { key: "wann", frage: "Wann?", emoji: "🕕", teil: "einleitung", tipp: "Wann? fragt nach Tag und Uhrzeit." },
  { key: "wo", frage: "Wo?", emoji: "📍", teil: "einleitung", tipp: "Wo? fragt nach dem Ort." },
  { key: "was", frage: "Was?", emoji: "❗", teil: "einleitung", tipp: "Was? sagt in wenigen Wörtern, was passiert ist." },
  { key: "wer", frage: "Wer?", emoji: "🧑", teil: "einleitung", tipp: "Wer? nennt die Beteiligten." },
  { key: "warum", frage: "Warum?", emoji: "💡", teil: "hauptteil", tipp: "Warum? nennt den Grund." },
  { key: "wie", frage: "Wie?", emoji: "🎬", teil: "hauptteil", tipp: "Wie? beschreibt den Ablauf – Schritt für Schritt." },
  { key: "folgen", frage: "Welche Folgen?", emoji: "🚑", teil: "schluss", tipp: "Welche Folgen? sagt, was danach war: Verletzte, Schaden, Ergebnis." },
];

/** Der Bauplan: welche W-Fragen wohin gehören. */
export const AUFBAU = [
  { key: "einleitung", name: "Einleitung", farbe: "#4a7fd6", text: "Wann? Wo? Was? Wer? – das Wichtigste in einem Satz." },
  { key: "hauptteil", name: "Hauptteil", farbe: "#e0962e", text: "Warum? Wie? – der Reihe nach, wie es passiert ist." },
  { key: "schluss", name: "Schluss", farbe: "#3f9d54", text: "Welche Folgen? – Verletzte, Schaden, Ergebnis." },
];

/** Satzanfänge, die in Berichten gut klingen. */
export const BERICHT_ANFAENGE = ["Am …", "Gegen … Uhr", "Dabei", "Deshalb", "Daraufhin", "Kurz darauf", "Anschließend", "Schließlich"];

/** Warum ein Satz rausfliegt – oder drinbleibt. */
export const GRUENDE = {
  gefuehl: "Gefühle gehören in eine Erzählung. Ein Bericht bleibt sachlich.",
  meinung: "Das ist eine Meinung. Im Bericht stehen nur Tatsachen.",
  rede: "Wörtliche Rede gibt es im Bericht nicht.",
  unwichtig: "Das ist für den Vorfall unwichtig. Reporter lassen es weg.",
  rein: "Das ist eine Tatsache und beantwortet eine W-Frage.",
};

export const FAELLE = {
  parkhaus: { name: "Autounfall am Parkhaus", emoji: "🚗", titel: "Autounfall an der Ausfahrt des Parkhauses Ost",
    zeuge: "Also, das war vielleicht ein Schreck! Ich kam gerade vom Einkaufen, es war Dienstag, der 17. Februar, so gegen 18:00 Uhr. An der Ausfahrt vom Parkhaus Ost fuhr ein rotes Auto heraus. Die Sonne stand ganz tief und blendete den Fahrer. Deshalb sah er das blaue Auto nicht, das von links kam. Der Fahrer des blauen Autos konnte nicht mehr rechtzeitig bremsen – und rums, stießen die beiden zusammen! Ich rief: „Oh nein, hoffentlich ist niemand verletzt!“ Jemand alarmierte den Rettungswagen. Zum Glück war niemand verletzt. Aber der Schaden an den Autos beträgt bestimmt 3000 Euro. Ich finde ja, an der Ausfahrt sollte endlich ein Spiegel hängen.",
    w: {
      wann: "Dienstag, 17. Februar, gegen 18:00 Uhr",
      wo: "Ausfahrt Parkhaus Ost",
      was: "Autounfall",
      wer: "zwei Autofahrer (und ein Zeuge)",
      warum: "die Sonne blendete den Fahrer des roten Autos",
      wie: "er sah das blaue Auto von links nicht → der andere Fahrer konnte nicht rechtzeitig bremsen → Zusammenstoß",
      folgen: "Rettungswagen alarmiert · niemand verletzt · Sachschaden etwa 3000 €",
    },
    loesung: [
      "Am Dienstag, dem 17. Februar, ereignete sich gegen 18:00 Uhr an der Ausfahrt des Parkhauses Ost ein Autounfall mit zwei Autofahrern.",
      "Die tief stehende Sonne blendete den Fahrer des roten Autos.",
      "Deshalb sah er das blaue Auto nicht, das von links kam.",
      "Der Fahrer des blauen Autos konnte nicht mehr rechtzeitig bremsen, und die beiden Autos stießen zusammen.",
      "Ein Rettungswagen wurde alarmiert, verletzt wurde niemand, und der Sachschaden betrug etwa 3000 Euro.",
    ],
    raus: [
      { s: "Das war vielleicht ein Schreck!", grund: "gefuehl" },
      { s: "Ich rief: „Oh nein, hoffentlich ist niemand verletzt!“", grund: "rede" },
      { s: "Ich finde, an der Ausfahrt sollte endlich ein Spiegel hängen.", grund: "meinung" },
    ],
    verben: [
      { s: "Die Sonne ___ den Fahrer des roten Autos.", inf: "blenden", r: "blendete", x: ["blendet", "hat geblendet"] },
      { s: "Er ___ das blaue Auto nicht.", inf: "sehen", r: "sah", x: ["sieht", "sehte"] },
      { s: "Der Fahrer ___ nicht mehr bremsen.", inf: "können", r: "konnte", x: ["kann", "könnte"] },
      { s: "Die beiden Autos ___ zusammen.", inf: "zusammenstoßen", r: "stießen", x: ["stoßen", "stoßten"] },
    ] },
  fahrrad: { name: "Fahrradunfall vor der Schule", emoji: "🚲", titel: "Fahrradunfall am Zebrastreifen vor der Grundschule",
    zeuge: "Mir zittern jetzt noch die Knie! Heute Morgen, am Montag, dem 9. November, um 7:40 Uhr stand ich am Zebrastreifen vor der Grundschule. Ein Junge aus der vierten Klasse kam mit dem Fahrrad angefahren. Auf dem Radweg lag nasses Laub, darum rutschte sein Vorderrad weg. Er stürzte und prallte gegen eine Fußgängerin. Die Frau fiel hin. Ich dachte: „Hilfe, das sieht böse aus!“ Die Hausmeisterin brachte sofort ein Kühlpack. Der Junge schürfte sich das Knie auf, die Frau blieb unverletzt. Am Fahrrad verbog sich das Schutzblech. Übrigens hatte der Junge einen total coolen grünen Helm auf.",
    w: {
      wann: "Montag, 9. November, um 7:40 Uhr",
      wo: "Zebrastreifen vor der Grundschule",
      was: "Fahrradunfall",
      wer: "ein Viertklässler und eine Fußgängerin",
      warum: "auf dem Radweg lag nasses Laub",
      wie: "das Vorderrad rutschte weg → der Junge stürzte → er prallte gegen die Fußgängerin",
      folgen: "Knie aufgeschürft · Fußgängerin unverletzt · Schutzblech verbogen",
    },
    loesung: [
      "Am Montag, dem 9. November, ereignete sich um 7:40 Uhr am Zebrastreifen vor der Grundschule ein Fahrradunfall mit einem Viertklässler und einer Fußgängerin.",
      "Auf dem Radweg lag nasses Laub.",
      "Deshalb rutschte das Vorderrad des Jungen weg, und er stürzte.",
      "Dabei prallte er gegen eine Fußgängerin, die ebenfalls hinfiel.",
      "Der Junge schürfte sich das Knie auf, die Fußgängerin blieb unverletzt, und am Fahrrad verbog sich das Schutzblech.",
    ],
    raus: [
      { s: "Mir zittern jetzt noch die Knie!", grund: "gefuehl" },
      { s: "Ich dachte: „Hilfe, das sieht böse aus!“", grund: "rede" },
      { s: "Der Junge hatte einen total coolen grünen Helm auf.", grund: "unwichtig" },
    ],
    verben: [
      { s: "Auf dem Radweg ___ nasses Laub.", inf: "liegen", r: "lag", x: ["liegt", "liegte"] },
      { s: "Das Vorderrad ___ weg.", inf: "wegrutschen", r: "rutschte", x: ["rutscht", "ist gerutscht"] },
      { s: "Die Fußgängerin ___ hin.", inf: "hinfallen", r: "fiel", x: ["fällt", "fallte"] },
      { s: "Die Frau ___ unverletzt.", inf: "bleiben", r: "blieb", x: ["bleibt", "bleibte"] },
    ] },
  fussball: { name: "Hund stoppt Fußballspiel", emoji: "⚽", titel: "Hund unterbricht Fußballspiel der E-Junioren",
    zeuge: "Das glaubt mir keiner, ich musste so lachen! Am Samstag, dem 14. Juni, spielten unsere E-Junioren auf dem Sportplatz am Waldrand. Gegen 15:20 Uhr, mitten in der zweiten Halbzeit, rannte plötzlich ein brauner Hund auf den Rasen. Sein Besitzer hatte die Leine am Zaun nicht richtig festgebunden. Der Hund schnappte sich den Ball und lief damit quer über das Feld. Der Schiedsrichter pfiff ab und unterbrach das Spiel. Alle riefen: „Haltet den Hund!“ Erst nach zehn Minuten fing der Besitzer ihn ein. Der Ball hatte danach ein Loch. Das Spiel endete 2:2. Meiner Meinung nach war der Hund der beste Spieler auf dem Platz.",
    w: {
      wann: "Samstag, 14. Juni, gegen 15:20 Uhr",
      wo: "Sportplatz am Waldrand",
      was: "Fußballspiel unterbrochen",
      wer: "ein brauner Hund, sein Besitzer und die E-Junioren",
      warum: "die Leine war nicht richtig festgebunden",
      wie: "der Hund rannte auf den Rasen → er schnappte sich den Ball → der Schiedsrichter unterbrach das Spiel",
      folgen: "zehn Minuten Pause · Ball beschädigt · Spiel endete 2:2",
    },
    loesung: [
      "Am Samstag, dem 14. Juni, unterbrach gegen 15:20 Uhr ein Hund das Fußballspiel der E-Junioren auf dem Sportplatz am Waldrand.",
      "Der Besitzer hatte die Leine des Hundes nicht richtig am Zaun festgebunden.",
      "Deshalb rannte der Hund in der zweiten Halbzeit auf den Rasen und schnappte sich den Ball.",
      "Daraufhin unterbrach der Schiedsrichter das Spiel.",
      "Nach zehn Minuten fing der Besitzer den Hund ein, der Ball war beschädigt, und das Spiel endete 2:2.",
    ],
    raus: [
      { s: "Ich musste so lachen!", grund: "gefuehl" },
      { s: "Alle riefen: „Haltet den Hund!“", grund: "rede" },
      { s: "Meiner Meinung nach war der Hund der beste Spieler auf dem Platz.", grund: "meinung" },
    ],
    verben: [
      { s: "Ein brauner Hund ___ auf den Rasen.", inf: "rennen", r: "rannte", x: ["rennt", "rennte"] },
      { s: "Der Schiedsrichter ___ ab.", inf: "abpfeifen", r: "pfiff", x: ["pfeift", "pfeifte"] },
      { s: "Der Besitzer ___ den Hund ein.", inf: "einfangen", r: "fing", x: ["fängt", "fangte"] },
      { s: "Das Spiel ___ 2:2.", inf: "enden", r: "endete", x: ["endet", "hat geendet"] },
    ] },
  angeln: { name: "Rekordhecht am Waldsee", emoji: "🎣", titel: "Zehnjähriger fängt Rekordhecht am Waldsee",
    zeuge: "Ich war so aufgeregt, mein Herz klopfte wie wild! Am Sonntag, dem 5. Oktober, saßen wir schon früh am Steg des Waldsees. Um 6:30 Uhr biss bei einem zehnjährigen Jungen aus unserem Angelverein ein riesiger Fisch an. Er hatte einen besonders großen Köderfisch benutzt, deshalb biss so ein großer Hecht. Der Junge kurbelte fast zehn Minuten lang, dann hob sein Vater den Fisch mit dem Kescher aus dem Wasser. Ich schrie: „Wahnsinn, was für ein Brocken!“ Der Jugendwart maß den Hecht: 1,05 Meter! Das ist neuer Vereinsrekord. Sie machten ein Foto, und der Junge setzte den Fisch wieder in den See. Ich finde ja Hechte viel schöner als Karpfen.",
    w: {
      wann: "Sonntag, 5. Oktober, um 6:30 Uhr",
      wo: "Steg am Waldsee",
      was: "Rekordhecht gefangen",
      wer: "ein zehnjähriger Junge aus dem Angelverein und sein Vater",
      warum: "er benutzte einen besonders großen Köderfisch",
      wie: "der Hecht biss an → der Junge kurbelte zehn Minuten → der Vater hob den Fisch mit dem Kescher heraus",
      folgen: "Hecht 1,05 Meter lang · neuer Vereinsrekord · Fisch wieder im See",
    },
    loesung: [
      "Am Sonntag, dem 5. Oktober, fing ein zehnjähriger Junge aus dem Angelverein um 6:30 Uhr am Steg des Waldsees einen Rekordhecht.",
      "Der Junge benutzte einen besonders großen Köderfisch.",
      "Deshalb biss der große Hecht an, und der Junge kurbelte fast zehn Minuten lang.",
      "Anschließend hob sein Vater den Fisch mit dem Kescher aus dem Wasser.",
      "Der Hecht war 1,05 Meter lang, das bedeutete einen neuen Vereinsrekord, und der Junge setzte den Fisch wieder in den See.",
    ],
    raus: [
      { s: "Mein Herz klopfte wie wild!", grund: "gefuehl" },
      { s: "Ich schrie: „Wahnsinn, was für ein Brocken!“", grund: "rede" },
      { s: "Ich finde Hechte viel schöner als Karpfen.", grund: "meinung" },
    ],
    verben: [
      { s: "Ein großer Hecht ___ an.", inf: "anbeißen", r: "biss", x: ["beißt", "beißte"] },
      { s: "Der Vater ___ den Fisch aus dem Wasser.", inf: "heben", r: "hob", x: ["hebt", "hebte"] },
      { s: "Der Jugendwart ___ den Hecht.", inf: "messen", r: "maß", x: ["misst", "messte"] },
      { s: "Der Junge ___ einen Rekordhecht.", inf: "fangen", r: "fing", x: ["fängt", "hat gefangen"] },
    ] },
  tennis: { name: "Gewitter beim Tennisfinale", emoji: "🎾", titel: "Gewitter unterbricht Finale der Jugendmeisterschaft",
    zeuge: "Puh, hatte ich Angst vor dem Donner! Am Sonntag, dem 20. Juli, lief auf Platz 1 des Tennisclubs das Finale der Jugendmeisterschaft. Zwei Mädchen spielten gegeneinander. Gegen 16:00 Uhr zog ein Gewitter auf. Es regnete stark und blitzte. Der Platz wurde ganz rutschig. Der Turnierleiter rief: „Alle sofort ins Clubhaus!“ Er brach das Spiel beim Stand von 4:4 ab. Alle Zuschauer gingen ins Clubhaus. Verletzt wurde niemand. Das Finale wurde auf Montag um 17:00 Uhr verschoben. Der Kuchen im Clubhaus war übrigens super lecker.",
    w: {
      wann: "Sonntag, 20. Juli, gegen 16:00 Uhr",
      wo: "Platz 1 des Tennisclubs",
      was: "Tennisfinale abgebrochen",
      wer: "zwei Spielerinnen, der Turnierleiter und die Zuschauer",
      warum: "ein Gewitter zog auf",
      wie: "es regnete stark und blitzte → der Platz wurde rutschig → der Turnierleiter brach das Spiel bei 4:4 ab",
      folgen: "alle gingen ins Clubhaus · niemand verletzt · Finale auf Montag, 17:00 Uhr, verschoben",
    },
    loesung: [
      "Am Sonntag, dem 20. Juli, wurde gegen 16:00 Uhr auf Platz 1 des Tennisclubs das Finale der Jugendmeisterschaft abgebrochen.",
      "Während des Spiels der beiden Finalistinnen zog ein Gewitter auf.",
      "Es regnete stark und blitzte, und der Platz wurde rutschig.",
      "Daraufhin brach der Turnierleiter das Spiel beim Stand von 4:4 ab.",
      "Alle gingen ins Clubhaus, verletzt wurde niemand, und das Finale wurde auf Montag um 17:00 Uhr verschoben.",
    ],
    raus: [
      { s: "Puh, hatte ich Angst vor dem Donner!", grund: "gefuehl" },
      { s: "Der Turnierleiter rief: „Alle sofort ins Clubhaus!“", grund: "rede" },
      { s: "Der Kuchen im Clubhaus war super lecker.", grund: "unwichtig" },
    ],
    verben: [
      { s: "Ein Gewitter ___ auf.", inf: "aufziehen", r: "zog", x: ["zieht", "ziehte"] },
      { s: "Es ___ stark.", inf: "regnen", r: "regnete", x: ["regnet", "hat geregnet"] },
      { s: "Der Turnierleiter ___ das Spiel ab.", inf: "abbrechen", r: "brach", x: ["bricht", "brechte"] },
      { s: "Alle ___ ins Clubhaus.", inf: "gehen", r: "gingen", x: ["gehen", "gehten"] },
    ] },
  dinos: { name: "Dino-Zahn im Steinbruch", emoji: "🦖", titel: "Schülerin findet Dinosaurier-Zahn im Steinbruch",
    zeuge: "Das war der coolste Ausflug meines Lebens! Am Mittwoch, dem 6. Mai, besuchte unsere Klasse 4b den Steinbruch am Stadtrand. In der Nacht hatte es stark geregnet, deshalb war am Hang frisches Gestein abgerutscht. Gegen 10:15 Uhr klopfte ein Mädchen aus meiner Klasse dort mit dem Hammer eine Steinplatte auf. In der Platte steckte ein langer, spitzer Zahn! Unsere Lehrerin rief: „Nichts anfassen, das ist bestimmt etwas Besonderes!“ Der Museumsführer untersuchte den Fund. Der Zahn stammte von einem Raubsaurier und war etwa 150 Millionen Jahre alt. Er wurde dem Naturkundemuseum übergeben. Ich mag ja den T-Rex am allerliebsten.",
    w: {
      wann: "Mittwoch, 6. Mai, gegen 10:15 Uhr",
      wo: "Steinbruch am Stadtrand",
      was: "Dinosaurier-Zahn gefunden",
      wer: "eine Schülerin der Klasse 4b",
      warum: "nach starkem Regen war frisches Gestein abgerutscht",
      wie: "die Schülerin klopfte eine Steinplatte auf → darin steckte ein Zahn → der Museumsführer untersuchte den Fund",
      folgen: "Zahn eines Raubsauriers · etwa 150 Millionen Jahre alt · ans Naturkundemuseum übergeben",
    },
    loesung: [
      "Am Mittwoch, dem 6. Mai, fand eine Schülerin der Klasse 4b gegen 10:15 Uhr im Steinbruch am Stadtrand einen Dinosaurier-Zahn.",
      "In der Nacht zuvor hatte es stark geregnet, und am Hang war frisches Gestein abgerutscht.",
      "Die Schülerin klopfte dort mit dem Hammer eine Steinplatte auf und entdeckte darin einen langen, spitzen Zahn.",
      "Anschließend untersuchte der Museumsführer den Fund.",
      "Der Zahn stammte von einem Raubsaurier, war etwa 150 Millionen Jahre alt und wurde dem Naturkundemuseum übergeben.",
    ],
    raus: [
      { s: "Das war der coolste Ausflug meines Lebens!", grund: "gefuehl" },
      { s: "Die Lehrerin rief: „Nichts anfassen!“", grund: "rede" },
      { s: "Ich mag den T-Rex am allerliebsten.", grund: "meinung" },
    ],
    verben: [
      { s: "Eine Schülerin ___ einen Dinosaurier-Zahn.", inf: "finden", r: "fand", x: ["findet", "findete"] },
      { s: "Sie ___ eine Steinplatte auf.", inf: "aufklopfen", r: "klopfte", x: ["klopft", "hat geklopft"] },
      { s: "In der Platte ___ ein Zahn.", inf: "stecken", r: "steckte", x: ["steckt", "hat gesteckt"] },
      { s: "Der Zahn ___ von einem Raubsaurier.", inf: "stammen", r: "stammte", x: ["stammt", "hat gestammt"] },
    ] },
  weltraum: { name: "Rakete auf dem Turnhallendach", emoji: "🚀", titel: "Wasserrakete landet auf dem Dach der Turnhalle",
    zeuge: "Ich habe mich kaputtgelacht! Am Freitag, dem 12. September, startete die Raketen-AG auf dem Schulhof ihre Wasserrakete. Um 11:30 Uhr drückte ein Junge aus der 4a auf den Startknopf. Die Rakete flog fast 30 Meter hoch. Aber dann kam eine starke Windböe und trieb sie zur Seite. Sie landete mitten auf dem Dach der Turnhalle! Unser AG-Leiter sagte: „Na super, die sehen wir so schnell nicht wieder.“ Der Hausmeister holte eine lange Leiter und brachte die Rakete nach zwanzig Minuten zurück. Nur eine Flosse war abgebrochen. Raketen sind einfach das Beste, was es gibt.",
    w: {
      wann: "Freitag, 12. September, um 11:30 Uhr",
      wo: "Schulhof der Grundschule",
      was: "Wasserrakete verirrt sich",
      wer: "die Raketen-AG und der Hausmeister",
      warum: "eine starke Windböe trieb die Rakete zur Seite",
      wie: "ein Junge drückte den Startknopf → die Rakete flog 30 Meter hoch → sie landete auf dem Dach der Turnhalle",
      folgen: "Hausmeister holte sie mit der Leiter · nach zwanzig Minuten zurück · eine Flosse abgebrochen",
    },
    loesung: [
      "Am Freitag, dem 12. September, startete die Raketen-AG um 11:30 Uhr auf dem Schulhof eine Wasserrakete, die sich verirrte.",
      "Ein Junge aus der Klasse 4a drückte den Startknopf, und die Rakete flog fast 30 Meter hoch.",
      "Dann trieb eine starke Windböe die Rakete zur Seite.",
      "Deshalb landete sie auf dem Dach der Turnhalle.",
      "Der Hausmeister holte die Rakete nach zwanzig Minuten mit einer Leiter herunter, nur eine Flosse war abgebrochen.",
    ],
    raus: [
      { s: "Ich habe mich kaputtgelacht!", grund: "gefuehl" },
      { s: "Der AG-Leiter sagte: „Na super, die sehen wir so schnell nicht wieder.“", grund: "rede" },
      { s: "Raketen sind einfach das Beste, was es gibt.", grund: "meinung" },
    ],
    verben: [
      { s: "Die Rakete ___ fast 30 Meter hoch.", inf: "fliegen", r: "flog", x: ["fliegt", "fliegte"] },
      { s: "Eine Windböe ___ die Rakete zur Seite.", inf: "treiben", r: "trieb", x: ["treibt", "treibte"] },
      { s: "Die Rakete ___ auf dem Dach.", inf: "landen", r: "landete", x: ["landet", "ist gelandet"] },
      { s: "Der Hausmeister ___ eine Leiter.", inf: "holen", r: "holte", x: ["holt", "hat geholt"] },
    ] },
};

export const BT_KRIT_INHALT = [
  "Habe ich eine sachliche Überschrift gefunden?",
  "Beantwortet meine Einleitung Wann, Wo, Was und Wer?",
  "Habe ich im Hauptteil der Reihe nach erzählt, wie und warum es passiert ist?",
  "Stehen im Schluss die Folgen?",
];
export const BT_KRIT_SPRACHE = [
  "Habe ich in der Vergangenheit (Präteritum) geschrieben?",
  "Habe ich sachlich geschrieben – ohne Gefühle und ohne Meinung?",
  "Habe ich die wörtliche Rede weggelassen?",
  "Habe ich genaue Angaben gemacht (Tag, Uhrzeit, Ort, Zahlen)?",
];
export const BT_KRIT_FORM = [
  "Ich habe gut lesbar und ordentlich geschrieben.",
  "Ich habe die Satzanfänge und Nomen groß geschrieben.",
  "Ich habe die Sätze mit einem Punkt beendet.",
  "Ich habe meinen Text noch einmal durchgelesen.",
];

/** Die 4 Übungs-Spiele – jedes bringt einen Stempel im Reporter-Ausweis. */
export const BT_SPIELE = [
  { key: "wfragen", name: "W-Fragen", emoji: "🔎" },
  { key: "filter", name: "Reporter-Filter", emoji: "🗑️" },
  { key: "zeit", name: "Zeitmaschine", emoji: "⏳" },
  { key: "ordnen", name: "Ordnen", emoji: "🧩" },
];

/** 🔎 W-Fragen-Spiel: je W-Frage eine Karte (Notiz → welche Frage?). Ungemischt. */
export function wFragenKarten(fall) {
  return W_FRAGEN.map((w) => ({ key: w.key, text: fall.w[w.key] }));
}

/** 🗑️ Reporter-Filter: 3 Tatsachen aus dem Muster-Bericht + 3 Sätze, die rausfliegen. Ungemischt. */
export function filterKarten(fall) {
  return [
    ...[1, 2, 3].map((i) => ({ s: fall.loesung[i], rein: true, grund: "rein" })),
    ...fall.raus.map((r) => ({ s: r.s, rein: false, grund: r.grund })),
  ];
}

/** Teil des Berichts zu Satz i (von 5): Einleitung · Hauptteil · Schluss. */
export function teilVonSatz(i, total = 5) {
  return i === 0 ? "einleitung" : i === total - 1 ? "schluss" : "hauptteil";
}

/** Hinweis beim Ordnen: Was wird als Satz i gesucht? */
export function ordnenHinweis(i, total = 5) {
  const teil = teilVonSatz(i, total);
  if (teil === "einleitung") return "Gesucht ist die Einleitung: Wann, Wo, Was, Wer.";
  if (teil === "schluss") return "Gesucht ist der Schluss: Welche Folgen hatte es?";
  return "Gesucht ist der Hauptteil: Was passierte als Nächstes?";
}

/** 🪪 Reporter-Ausweis: Rang nach Anzahl der Stempel (0–4). */
export function reporterRang(stempel) {
  const n = BT_SPIELE.filter((s) => stempel && stempel[s.key] === true).length;
  const name = n >= 4 ? "Chefreporter" : n === 3 ? "Reporter" : n >= 1 ? "Nachwuchs-Reporter" : "Reporter-Neuling";
  return { n, von: BT_SPIELE.length, name };
}

/** Datenqualität (für Tests). */
export function berichtGesund() {
  const wKeys = W_FRAGEN.map((w) => w.key);
  return Object.values(FAELLE).every((f) =>
    f.name && f.emoji && f.titel && typeof f.zeuge === "string" && f.zeuge.length > 200
    && wKeys.every((k) => typeof f.w[k] === "string" && f.w[k])
    && new Set(wKeys.map((k) => f.w[k])).size === wKeys.length
    && f.loesung.length === 5 && f.loesung[0].startsWith("Am ")
    && f.loesung.every((s) => s.endsWith(".") && !/[„“!]/.test(s))
    && f.raus.length === 3 && f.raus.every((r) => r.s && GRUENDE[r.grund] && r.grund !== "rein")
    && f.verben.length === 4 && f.verben.every((v) =>
      v.s.includes("___") && v.inf && v.r && v.x.length === 2 && !v.x.includes(v.r)));
}
