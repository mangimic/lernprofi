/* Deutsch-Pools (aus der Alt-App v1.86). Geschichten-Werkstatt ist bereits
   MC-förmig; dass/das und doppelte Mitlaute werden über reine Konverter in
   MC-Aufgaben übersetzt (alle Themen zusammengelegt). */
export const GESCH_DATEN={
  easy:[
    {kontext:"„Es geschah in einer stürmischen Herbstnacht. Anna und ihre Eltern schliefen schon fest.“",
     f:"Zu welchem Teil der Geschichte gehört dieser Abschnitt?", r:"Einleitung (E)", x:["Hauptteil (H)","Schluss (S)"],
     tipp:"Die Einleitung verrät: Wer? Wo? Wann? – hier beginnt alles."},
    {kontext:"„Plötzlich klirrte es laut. ‚Ein Einbrecher!‘, flüsterte Anna und verkroch sich ängstlich unter der Bettdecke.“",
     f:"Zu welchem Teil gehört dieser Abschnitt?", r:"Hauptteil (H)", x:["Einleitung (E)","Schluss (S)"],
     tipp:"Im Hauptteil passiert das Spannendste – oft beginnt er mit „Plötzlich“!"},
    {kontext:"„‚Zum Glück war es nur Kätzchen Minka‘, lachte Mutti. Beruhigt schlief Anna wieder ein.“",
     f:"Zu welchem Teil gehört dieser Abschnitt?", r:"Schluss (S)", x:["Hauptteil (H)","Einleitung (E)"],
     tipp:"Der Schluss löst alles auf – die Aufregung ist vorbei."},
    {f:"In welcher Reihenfolge ist eine Geschichte aufgebaut?",
     r:"Einleitung → Hauptteil → Schluss", x:["Hauptteil → Einleitung → Schluss","Schluss → Hauptteil → Einleitung"],
     tipp:"Erst vorstellen, dann Spannung, dann Auflösung."},
    {f:"Was gehört in die Einleitung einer Geschichte?",
     r:"Wer? Wo? Wann?", x:["Das spannendste Ereignis","Die Auflösung am Ende"],
     tipp:"Die Einleitung stellt alles vor, was man zum Mitfiebern braucht."},
    {f:"Welche Überschrift passt zur Minka-Geschichte und macht neugierig?",
     r:"Der geheimnisvolle Krach in der Nacht", x:["Anna schläft in ihrem Bett","Es war nur die Katze"],
     tipp:"Eine gute Überschrift macht neugierig – und verrät das Ende NICHT!"},
    {f:"Eine spannende Überschrift …",
     r:"macht neugierig und verrät das Ende nicht", x:["erzählt schon die ganze Geschichte","ist so lang wie möglich"],
     tipp:"Wer die Auflösung schon kennt, liest nicht mehr weiter."},
    {f:"Mit welchem Wort beginnt im Hauptteil oft der spannendste Moment?",
     r:"Plötzlich …", x:["Zum Glück …","Am Ende …"],
     tipp:"„Plötzlich“ ist das Spannungs-Signal vieler Geschichten."},
    {kontext:"„Alles Gute zum Geburtstag!“",
     f:"Welcher Begleitsatz passt zu diesem Gesprächssatz?", r:"Emma gratuliert:", x:["Mutti fragt:","Emma antwortet:"],
     tipp:"Gratulieren heißt: Glück wünschen."},
    {kontext:"„Wer hat den Tisch gedeckt?“",
     f:"Welcher Begleitsatz passt?", r:"Mutti fragt:", x:["Emma gratuliert:","Mutti freut sich:"],
     tipp:"Das Fragezeichen verrät es: Hier wird gefragt!"},
    {kontext:"„Ich bin extra früh aufgestanden.“",
     f:"Welcher Begleitsatz passt?", r:"Emma antwortet:", x:["Mutti fragt:","Emma gratuliert:"],
     tipp:"Auf eine Frage folgt eine Antwort."},
    {kontext:"„Das ist eine tolle Überraschung!“",
     f:"Welcher Begleitsatz passt?", r:"Mutti freut sich:", x:["Emma antwortet:","Mutti fragt:"],
     tipp:"Das Ausrufezeichen zeigt die Freude!"}
  ],
  hard:[
    {kontext:"„Ich ging leise in die Küche. Dann deckte ich den Frühstückstisch. Vati schenkte Mutti schöne Blumen.“",
     f:"Welche Überschrift passt zur Zeitform dieses Textes?",
     r:"Gestern hatte Mutti Geburtstag", x:["Heute hat Mutti Geburtstag","Morgen hat Mutti Geburtstag"],
     tipp:"ging, deckte, schenkte – die Verben stehen im Präteritum (Vergangenheit)."},
    {f:"An welchen Wörtern erkennst du die Zeitform eines Textes?",
     r:"An den Verben", x:["An den Nomen","An den Adjektiven"],
     tipp:"ging/gehe, deckte/decke – das Verb zeigt die Zeit an."},
    {f:"„Ich ging leise in die Küche.“ – Wie heißt der Satz bei der Überschrift „Heute hat Mutti Geburtstag“?",
     r:"Ich gehe leise in die Küche.", x:["Ich ging leise in die Küche.","Ich bin leise in die Küche gegangen."],
     tipp:"Heute = Präsens (Gegenwart): gehe, decke, schenkt …"},
    {f:"„Dann deckte ich den Frühstückstisch.“ – im Präsens?",
     r:"Dann decke ich den Frühstückstisch.", x:["Dann deckte ich den Frühstückstisch.","Dann habe ich den Tisch gedeckt."],
     tipp:"deckte (gestern) → decke (heute)."},
    {f:"„Vati schenkte Mutti schöne Blumen.“ – im Präsens?",
     r:"Vati schenkt Mutti schöne Blumen.", x:["Vati schenkte Mutti schöne Blumen.","Vati wird Mutti Blumen schenken."],
     tipp:"schenkte → schenkt: nur ein Buchstabe weniger!"},
    {f:"„Mutti freute sich sehr.“ – im Präsens?",
     r:"Mutti freut sich sehr.", x:["Mutti freute sich sehr.","Mutti hat sich sehr gefreut."],
     tipp:"freute → freut."},
    {kontext:"„Es geschah in einer stürmischen Herbstnacht.“",
     f:"In welcher Zeitform steht dieser Satz?", r:"Präteritum (Vergangenheit)", x:["Präsens (Gegenwart)","Futur (Zukunft)"],
     tipp:"geschah = Vergangenheitsform von „geschehen“."},
    {f:"Wie bleibt eine Geschichte gut lesbar?",
     r:"Sie bleibt in EINER Zeitform", x:["Sie wechselt oft die Zeitform","Sie hat gar keine Verben"],
     tipp:"Wer mitten im Text die Zeit wechselt, bringt die Leser durcheinander."},
    {f:"Wie wird die wörtliche Rede richtig aufgeschrieben?",
     r:"Mutti fragt: „Wer hat den Tisch gedeckt?“", x:["Mutti fragt „Wer hat den Tisch gedeckt“","Mutti fragt: Wer hat den Tisch gedeckt."],
     tipp:"Nach dem Begleitsatz: Doppelpunkt – dann Anführungszeichen unten … oben."},
    {kontext:"„‚Zum Glück war es nur Kätzchen Minka‘, lachte Mutti.“",
     f:"Welcher Teil ist der Begleitsatz?", r:"lachte Mutti", x:["Zum Glück war es","nur Kätzchen Minka"],
     tipp:"Der Begleitsatz sagt, WER spricht und WIE."},
    {f:"Der Begleitsatz steht NACH der wörtlichen Rede. Was steht zwischen beiden?",
     r:"Ein Komma", x:["Ein Doppelpunkt","Gar nichts"],
     tipp:"„…“, sagte Mutti. – erst Anführungszeichen zu, dann Komma."},
    {f:"Welcher Schluss rundet die Minka-Geschichte am besten ab?",
     r:"Beruhigt schlief Anna wieder ein.", x:["Und dann war die Geschichte aus.","Plötzlich klirrte es schon wieder!"],
     tipp:"Ein guter Schluss bringt Ruhe hinein – kein neues Abenteuer."}
  ]
};
export const DD_THEMEN = {
  alltag:{ name:"Alltag", emoji:"🌳", saetze:[
    {satz:"___ Fahrrad steht im Garten.", loesung:"das"},
    {satz:"Ich glaube, ___ es heute regnet.", loesung:"dass"},
    {satz:"Mama sagt, ___ ich aufräumen soll.", loesung:"dass"},
    {satz:"Ich mag ___ kleine Mädchen.", loesung:"das"},
    {satz:"Weißt du, ___ Schildkröten Reptilien sind?", loesung:"dass"},
    {satz:"___ Kind spielt im Garten.", loesung:"das"}
  ]},
  angeln:{ name:"Angeln", emoji:"🎣", saetze:[
    {satz:"___ Boot ist blau.", loesung:"das"},
    {satz:"Ich hoffe, ___ ein Hecht beißt.", loesung:"dass"},
    {satz:"Der Angler sagt, ___ er einen Zander fängt.", loesung:"dass"},
    {satz:"___ Wasser ist tief.", loesung:"das"},
    {satz:"Opa weiß, ___ Rotfedern klein sind.", loesung:"dass"},
    {satz:"___ Angelzeug liegt bereit.", loesung:"das"}
  ]},
  tennis:{ name:"Tennis", emoji:"🎾", saetze:[
    {satz:"___ Netz ist hoch.", loesung:"das"},
    {satz:"Ich hoffe, ___ ich gewinne.", loesung:"dass"},
    {satz:"Der Trainer sagt, ___ ich üben soll.", loesung:"dass"},
    {satz:"___ Match beginnt gleich.", loesung:"das"},
    {satz:"Ich weiß, ___ Tennis Spaß macht.", loesung:"dass"},
    {satz:"___ schnelle Spiel gefällt mir.", loesung:"das"}
  ]},
  fussball:{ name:"Fußball", emoji:"⚽", saetze:[
    {satz:"___ Tor ist leer.", loesung:"das"},
    {satz:"Ich hoffe, ___ wir gewinnen.", loesung:"dass"},
    {satz:"Der Trainer sagt, ___ wir kämpfen sollen.", loesung:"dass"},
    {satz:"___ Spiel beginnt gleich.", loesung:"das"},
    {satz:"Ich glaube, ___ der Stürmer trifft.", loesung:"dass"},
    {satz:"___ runde Tor steht dort.", loesung:"das"}
  ]}
};
export const DOPPEL_THEMEN = {
  alltag:{ name:"Alltag", emoji:"🌳", woerter:[
    {richtig:"Sonne", falsch:"Sone"},
    {richtig:"Ball", falsch:"Bal"},
    {richtig:"Wasser", falsch:"Waser"},
    {richtig:"Mutter", falsch:"Muter"},
    {richtig:"Kette", falsch:"Kete"},
    {richtig:"Roller", falsch:"Roler"},
    {richtig:"Sommer", falsch:"Somer"},
    {richtig:"kommen", falsch:"komen"}
  ]},
  angeln:{ name:"Angeln", emoji:"🎣", woerter:[
    {richtig:"Rolle", falsch:"Role"},
    {richtig:"Flosse", falsch:"Flose"},
    {richtig:"Kutter", falsch:"Kuter"},
    {richtig:"Wetter", falsch:"Weter"},
    {richtig:"nass", falsch:"nas"},
    {richtig:"paddeln", falsch:"padeln"},
    {richtig:"Wasser", falsch:"Waser"},
    {richtig:"Sonne", falsch:"Sone"}
  ]},
  tennis:{ name:"Tennis", emoji:"🎾", woerter:[
    {richtig:"Ball", falsch:"Bal"},
    {richtig:"schnell", falsch:"schnel"},
    {richtig:"Treffer", falsch:"Trefer"},
    {richtig:"rennen", falsch:"renen"},
    {richtig:"Gewinner", falsch:"Gewiner"},
    {richtig:"Matte", falsch:"Mate"},
    {richtig:"Sonne", falsch:"Sone"},
    {richtig:"Wetter", falsch:"Weter"}
  ]},
  fussball:{ name:"Fußball", emoji:"⚽", woerter:[
    {richtig:"Ball", falsch:"Bal"},
    {richtig:"Treffer", falsch:"Trefer"},
    {richtig:"rennen", falsch:"renen"},
    {richtig:"schnell", falsch:"schnel"},
    {richtig:"Mannschaft", falsch:"Manschaft"},
    {richtig:"Pfiff", falsch:"Pfif"},
    {richtig:"Gewinner", falsch:"Gewiner"},
    {richtig:"Wetter", falsch:"Weter"}
  ]}
};

/** dass/das → MC: 2 Antworten, Tipp mit der „dieses/welches"-Probe. */
export function ddPool() {
  const easy = Object.values(DD_THEMEN).flatMap((t) =>
    t.saetze.map((a) => ({
      f: a.satz,
      r: a.loesung,
      x: [a.loesung === "das" ? "dass" : "das"],
      tipp: a.loesung === "das"
        ? "Probe: Passt „dieses“ oder „welches“? Dann das mit EINEM s."
        : "„dieses/welches“ passt hier nicht – also die Verbindung dass mit Doppel-s.",
    })),
  );
  return { easy, hard: [] };
}

/** Doppelte Mitlaute → MC: richtige gegen falsche Schreibweise. */
export function doppelPool() {
  const easy = Object.values(DOPPEL_THEMEN).flatMap((t) =>
    t.woerter.map((w) => ({
      f: "Welche Schreibweise ist richtig?",
      r: w.richtig,
      x: [w.falsch],
      tipp: "Sprich das Wort langsam: Nach einem KURZEN Selbstlaut folgt oft ein doppelter Mitlaut.",
    })),
  );
  return { easy, hard: [] };
}

export const DEUTSCH_BEREICHE = [
  { key: "gesch", emoji: "📚", name: "Geschichten-Werkstatt" },
  { key: "dd", emoji: "🔤", name: "das oder dass?" },
  { key: "doppel", emoji: "🔡", name: "Doppelte Mitlaute" },
];
