/* ============================================================
   📚 DEUTSCH KLASSE 2 (Bildungsplan Baden-Württemberg):
   Lesen & Verstehen, erste Grammatik (Nomen, Verben, Adjektive,
   Einzahl/Mehrzahl, zusammengesetzte Nomen), Rechtschreibstrategien
   (Silben schwingen, Verlängern, ABC/Wörterbuch) und Satzzeichen.
   Format wie alle Pools: MC mit 2 Falschantworten, Tipp = Lernweg.
   easy = 1. Schulhalbjahr, hard = 2. Schulhalbjahr.

   Die Aufgaben werden EINMAL beim Laden aus den Wortlisten gebaut
   (K2_WOERTER, K2_VERBEN, K2_ADJEKTIVE) – Artikel, Mehrzahl und
   Silben stehen also nur an EINER Stelle. Jede gebaute Aufgabe trägt
   `typ` (und meist `wort`), damit der Test sie gegen die Listen
   nachprüfen kann. Zufall gibt es nur im ABC-Bereich, über
   rngAusSeed("k2abc") – zweimal erzeugen liefert dasselbe.
   ============================================================ */
import { rngAusSeed, mischen } from "../rng.js";

/* ---------- Wortlisten ---------- */

// Kurzschreiber Nomen: Wort, Artikel, Mehrzahl, Silben ("Blu-me"; ohne Angabe einsilbig).
const n = (w, artikel, mehrzahl, silben) => ({ w, artikel, mehrzahl, silben: (silben || w).split("-") });

/** Nomen der Klasse 2: Artikel, Mehrzahl und Silben (Worttrennung nach Duden;
    „I-gel“ zeigt die Sprechsilben – ein einzelner Selbstlaut wird nie abgetrennt). */
export const K2_WOERTER = [
  // Tiere
  n("Hund", "der", "Hunde"), n("Katze", "die", "Katzen", "Kat-ze"), n("Maus", "die", "Mäuse"),
  n("Vogel", "der", "Vögel", "Vo-gel"), n("Pferd", "das", "Pferde"), n("Kuh", "die", "Kühe"),
  n("Schwein", "das", "Schweine"), n("Hase", "der", "Hasen", "Ha-se"), n("Igel", "der", "Igel", "I-gel"),
  n("Fisch", "der", "Fische"), n("Ente", "die", "Enten", "En-te"), n("Biene", "die", "Bienen", "Bie-ne"),
  n("Frosch", "der", "Frösche"), n("Schaf", "das", "Schafe"), n("Huhn", "das", "Hühner"),
  n("Fuchs", "der", "Füchse"), n("Wolf", "der", "Wölfe"), n("Affe", "der", "Affen", "Af-fe"),
  n("Löwe", "der", "Löwen", "Lö-we"), n("Tiger", "der", "Tiger", "Ti-ger"), n("Käfer", "der", "Käfer", "Kä-fer"),
  n("Schnecke", "die", "Schnecken", "Schne-cke"), n("Spinne", "die", "Spinnen", "Spin-ne"),
  n("Eule", "die", "Eulen", "Eu-le"), n("Raupe", "die", "Raupen", "Rau-pe"), n("Wurm", "der", "Würmer"),
  n("Giraffe", "die", "Giraffen", "Gi-raf-fe"), n("Krokodil", "das", "Krokodile", "Kro-ko-dil"),
  n("Papagei", "der", "Papageien", "Pa-pa-gei"), n("Schmetterling", "der", "Schmetterlinge", "Schmet-ter-ling"),
  // Natur
  n("Baum", "der", "Bäume"), n("Blume", "die", "Blumen", "Blu-me"), n("Wald", "der", "Wälder"),
  n("Wiese", "die", "Wiesen", "Wie-se"), n("Berg", "der", "Berge"), n("Sonne", "die", "Sonnen", "Son-ne"),
  n("Mond", "der", "Monde"), n("Stern", "der", "Sterne"), n("Wolke", "die", "Wolken", "Wol-ke"),
  n("Himmel", "der", "Himmel", "Him-mel"), n("Blatt", "das", "Blätter"), n("Apfel", "der", "Äpfel", "Ap-fel"),
  n("Birne", "die", "Birnen", "Bir-ne"), n("Nuss", "die", "Nüsse"), n("Garten", "der", "Gärten", "Gar-ten"),
  n("Stein", "der", "Steine"), n("Fluss", "der", "Flüsse"), n("Rose", "die", "Rosen", "Ro-se"),
  n("Tanne", "die", "Tannen", "Tan-ne"), n("Tulpe", "die", "Tulpen", "Tul-pe"), n("Gras", "das", "Gräser"),
  n("Ast", "der", "Äste"), n("Zweig", "der", "Zweige"), n("Pilz", "der", "Pilze"),
  n("Pfütze", "die", "Pfützen", "Pfüt-ze"), n("Sommer", "der", "Sommer", "Som-mer"),
  // Haus und Schule
  n("Haus", "das", "Häuser"), n("Tür", "die", "Türen"), n("Fenster", "das", "Fenster", "Fens-ter"),
  n("Tisch", "der", "Tische"), n("Stuhl", "der", "Stühle"), n("Bett", "das", "Betten"),
  n("Lampe", "die", "Lampen", "Lam-pe"), n("Schrank", "der", "Schränke"), n("Bank", "die", "Bänke"),
  n("Teller", "der", "Teller", "Tel-ler"), n("Tasse", "die", "Tassen", "Tas-se"), n("Löffel", "der", "Löffel", "Löf-fel"),
  n("Gabel", "die", "Gabeln", "Ga-bel"), n("Messer", "das", "Messer", "Mes-ser"), n("Topf", "der", "Töpfe"),
  n("Sieb", "das", "Siebe"), n("Glas", "das", "Gläser"), n("Flasche", "die", "Flaschen", "Fla-sche"),
  n("Kerze", "die", "Kerzen", "Ker-ze"), n("Uhr", "die", "Uhren"), n("Korb", "der", "Körbe"),
  n("Schlüssel", "der", "Schlüssel", "Schlüs-sel"), n("Kissen", "das", "Kissen", "Kis-sen"),
  n("Decke", "die", "Decken", "De-cke"), n("Zimmer", "das", "Zimmer", "Zim-mer"), n("Küche", "die", "Küchen", "Kü-che"),
  n("Dach", "das", "Dächer"), n("Zaun", "der", "Zäune"), n("Hammer", "der", "Hämmer", "Ham-mer"),
  n("Koffer", "der", "Koffer", "Kof-fer"), n("Buch", "das", "Bücher"), n("Heft", "das", "Hefte"),
  n("Stift", "der", "Stifte"), n("Tafel", "die", "Tafeln", "Ta-fel"), n("Tasche", "die", "Taschen", "Ta-sche"),
  n("Schule", "die", "Schulen", "Schu-le"), n("Brief", "der", "Briefe"), n("Bild", "das", "Bilder"),
  n("Ball", "der", "Bälle"), n("Puppe", "die", "Puppen", "Pup-pe"), n("Spiel", "das", "Spiele"),
  n("Geschenk", "das", "Geschenke", "Ge-schenk"), n("Stab", "der", "Stäbe"), n("Zelt", "das", "Zelte"),
  // Unterwegs
  n("Auto", "das", "Autos", "Au-to"), n("Zug", "der", "Züge"), n("Schiff", "das", "Schiffe"),
  n("Boot", "das", "Boote"), n("Rad", "das", "Räder"), n("Fahrrad", "das", "Fahrräder", "Fahr-rad"),
  n("Bus", "der", "Busse"), n("Straße", "die", "Straßen", "Stra-ße"), n("Brücke", "die", "Brücken", "Brü-cke"),
  n("Weg", "der", "Wege"), n("Stadt", "die", "Städte"), n("Dorf", "das", "Dörfer"), n("Burg", "die", "Burgen"),
  // Menschen, Körper, Kleidung
  n("Kind", "das", "Kinder"), n("Mutter", "die", "Mütter", "Mut-ter"), n("Vater", "der", "Väter", "Va-ter"),
  n("Bruder", "der", "Brüder", "Bru-der"), n("Schwester", "die", "Schwestern", "Schwes-ter"),
  n("Freund", "der", "Freunde"), n("König", "der", "Könige", "Kö-nig"), n("Zwerg", "der", "Zwerge"),
  n("Dieb", "der", "Diebe"), n("Hand", "die", "Hände"), n("Fuß", "der", "Füße"), n("Kopf", "der", "Köpfe"),
  n("Nase", "die", "Nasen", "Na-se"), n("Auge", "das", "Augen", "Au-ge"), n("Ohr", "das", "Ohren"),
  n("Mund", "der", "Münder"), n("Zahn", "der", "Zähne"), n("Arm", "der", "Arme"), n("Bein", "das", "Beine"),
  n("Finger", "der", "Finger", "Fin-ger"), n("Hose", "die", "Hosen", "Ho-se"), n("Jacke", "die", "Jacken", "Ja-cke"),
  n("Schuh", "der", "Schuhe"), n("Mütze", "die", "Mützen", "Müt-ze"), n("Hut", "der", "Hüte"),
  n("Kleid", "das", "Kleider"), n("Hemd", "das", "Hemden"), n("Rock", "der", "Röcke"), n("Socke", "die", "Socken", "So-cke"),
  // Essen
  n("Brot", "das", "Brote"), n("Kuchen", "der", "Kuchen", "Ku-chen"), n("Ei", "das", "Eier"),
  n("Banane", "die", "Bananen", "Ba-na-ne"), n("Tomate", "die", "Tomaten", "To-ma-te"),
  n("Kartoffel", "die", "Kartoffeln", "Kar-tof-fel"), n("Suppe", "die", "Suppen", "Sup-pe"),
  n("Wurst", "die", "Würste"), n("Salat", "der", "Salate", "Sa-lat"), n("Erdbeere", "die", "Erdbeeren", "Erd-bee-re"),
  n("Kirsche", "die", "Kirschen", "Kir-sche"),
  // Zeit und Sprache
  n("Tag", "der", "Tage"), n("Nacht", "die", "Nächte"), n("Woche", "die", "Wochen", "Wo-che"),
  n("Jahr", "das", "Jahre"), n("Lied", "das", "Lieder"), n("Wort", "das", "Wörter"), n("Satz", "der", "Sätze"),
  n("Name", "der", "Namen", "Na-me"),
];

// Kurzschreiber Verb: Grundform, ich-, du-, er/sie/es-Form (wir/sie = Grundform).
const v = (grund, ich, du, er) => ({ grund, ich, du, er });

/** Verben der Klasse 2 mit ihren Personalformen im Präsens. */
export const K2_VERBEN = [
  v("bellen", "belle", "bellst", "bellt"), v("spielen", "spiele", "spielst", "spielt"),
  v("malen", "male", "malst", "malt"), v("lachen", "lache", "lachst", "lacht"),
  v("singen", "singe", "singst", "singt"), v("rennen", "renne", "rennst", "rennt"),
  v("springen", "springe", "springst", "springt"), v("schwimmen", "schwimme", "schwimmst", "schwimmt"),
  v("trinken", "trinke", "trinkst", "trinkt"), v("kochen", "koche", "kochst", "kocht"),
  v("schreiben", "schreibe", "schreibst", "schreibt"), v("lernen", "lerne", "lernst", "lernt"),
  v("hüpfen", "hüpfe", "hüpfst", "hüpft"), v("fliegen", "fliege", "fliegst", "fliegt"),
  v("suchen", "suche", "suchst", "sucht"), v("holen", "hole", "holst", "holt"),
  v("kaufen", "kaufe", "kaufst", "kauft"), v("rufen", "rufe", "rufst", "ruft"),
  v("hören", "höre", "hörst", "hört"), v("fragen", "frage", "fragst", "fragt"),
  v("zeigen", "zeige", "zeigst", "zeigt"), v("legen", "lege", "legst", "legt"),
  v("sagen", "sage", "sagst", "sagt"), v("bauen", "baue", "baust", "baut"),
  v("winken", "winke", "winkst", "winkt"), v("denken", "denke", "denkst", "denkt"),
  v("kleben", "klebe", "klebst", "klebt"), v("bleiben", "bleibe", "bleibst", "bleibt"),
  v("hupen", "hupe", "hupst", "hupt"), v("gehen", "gehe", "gehst", "geht"),
  v("kommen", "komme", "kommst", "kommt"), v("weinen", "weine", "weinst", "weint"),
  v("klettern", "klettere", "kletterst", "klettert"), v("summen", "summe", "summst", "summt"),
  v("scheinen", "scheine", "scheinst", "scheint"), v("tanzen", "tanze", "tanzt", "tanzt"),
  v("putzen", "putze", "putzt", "putzt"), v("rechnen", "rechne", "rechnest", "rechnet"),
  v("baden", "bade", "badest", "badet"), v("wachsen", "wachse", "wächst", "wächst"),
  // Verben mit Selbstlaut-Wechsel (2. Halbjahr)
  v("laufen", "laufe", "läufst", "läuft"), v("schlafen", "schlafe", "schläfst", "schläft"),
  v("fahren", "fahre", "fährst", "fährt"), v("tragen", "trage", "trägst", "trägt"),
  v("fallen", "falle", "fällst", "fällt"), v("fangen", "fange", "fängst", "fängt"),
  v("lesen", "lese", "liest", "liest"), v("essen", "esse", "isst", "isst"),
  v("sehen", "sehe", "siehst", "sieht"), v("geben", "gebe", "gibst", "gibt"),
  v("helfen", "helfe", "hilfst", "hilft"), v("nehmen", "nehme", "nimmst", "nimmt"),
  v("werfen", "werfe", "wirfst", "wirft"), v("sprechen", "spreche", "sprichst", "spricht"),
];

// Kurzschreiber Adjektiv-Paar: beide Richtungen eintragen.
const paar = (a, b) => [{ w: a, gegenteil: b }, { w: b, gegenteil: a }];

/** Adjektive der Klasse 2; `gegenteil` nur, wo es ein klares Gegenteil gibt. */
export const K2_ADJEKTIVE = [
  ...paar("groß", "klein"), ...paar("warm", "kalt"), ...paar("laut", "leise"), ...paar("schnell", "langsam"),
  ...paar("hell", "dunkel"), ...paar("dick", "dünn"), ...paar("lang", "kurz"), ...paar("nass", "trocken"),
  ...paar("voll", "leer"), ...paar("leicht", "schwer"), ...paar("froh", "traurig"), ...paar("jung", "alt"),
  ...paar("hart", "weich"), ...paar("sauber", "schmutzig"), ...paar("stark", "schwach"), ...paar("gesund", "krank"),
  ...paar("süß", "sauer"), ...paar("früh", "spät"), ...paar("fleißig", "faul"), ...paar("mutig", "ängstlich"),
  ...paar("wach", "müde"), ...paar("teuer", "billig"), ...paar("richtig", "falsch"),
  { w: "heiß", gegenteil: "kalt" }, { w: "neu", gegenteil: "alt" },
  { w: "rot" }, { w: "blau" }, { w: "gelb" }, { w: "grün" }, { w: "weiß" }, { w: "bunt" }, { w: "rund" },
  { w: "schön" }, { w: "lustig" }, { w: "lieb" }, { w: "wild" }, { w: "klug" }, { w: "spitz" },
];

/* ---------- Helfer ---------- */

const NOMEN = new Map(K2_WOERTER.map((e) => [e.w, e]));
const VERBEN = new Map(K2_VERBEN.map((e) => [e.grund, e]));
const ADJEKTIVE = new Map(K2_ADJEKTIVE.map((e) => [e.w, e]));

// Nachschlagen mit Sicherung: Ein Tippfehler in einer Aufgabe fällt sofort beim Laden auf.
const holen = (karte, was) => (wort) => {
  const e = karte.get(wort);
  if (!e) throw new Error(`klasse2Deutsch: ${was} „${wort}“ fehlt in der Wortliste`);
  return e;
};
const nom = holen(NOMEN, "Nomen");
const verb = holen(VERBEN, "Verb");
const adj = holen(ADJEKTIVE, "Adjektiv");

const gross = (s) => s[0].toUpperCase() + s.slice(1);
const ein = (e) => (e.artikel === "die" ? "eine" : "ein");
const andereArtikel = (artikel) => ["der", "die", "das"].filter((a) => a !== artikel);

/** Verzahnt mehrere Aufgaben-Listen gleichmäßig, damit jedes 10er-Paket
    alle Aufgaben-Arten enthält (fest, ohne Zufall). */
function verzahnen(...listen) {
  return listen
    .flatMap((liste) => liste.map((a, i) => ({ a, platz: (i + 0.5) / liste.length })))
    .sort((x, y) => x.platz - y.platz)
    .map((e) => e.a);
}

// Lückensatz fürs Vorlesen: „Der Hund __.“ → „Der Hund, Lücke.“
const lueckeSprechen = (satz) => satz.replace(/ __ /, ", Lücke, ").replace(/ __([.!?])/, ", Lücke$1");

/* ============================================================
   1) Lesen & Verstehen
   ============================================================ */
const les = (kontext, f, r, x, tipp) => ({ kontext, f, r, x, tipp });

const LESEN_EASY = [
  les("Mia hat einen Hund. Der Hund ist braun. Er spielt gern mit dem Ball.",
    "Welche Farbe hat der Hund?", "braun", ["schwarz", "weiß"],
    "Lies den zweiten Satz noch einmal – dort steht die Farbe."),
  les("Ben geht in die Schule. Im Ranzen hat er ein Heft und zwei Stifte. Heute malt er eine Sonne.",
    "Was malt Ben heute?", "eine Sonne", ["einen Baum", "ein Haus"],
    "Suche das Wort „malt“ im Text – direkt danach steht die Antwort."),
  les("Es regnet. Lena zieht ihre Stiefel an. Sie springt in jede Pfütze. Das Wasser spritzt hoch.",
    "Was zieht Lena an?", "ihre Stiefel", ["ihre Mütze", "ihre Jacke"],
    "Im zweiten Satz steht, was Lena anzieht."),
  les("Tom und Ali sind auf dem Spielplatz. Tom schaukelt. Ali rutscht die lange Rutsche hinunter.",
    "Wer schaukelt?", "Tom", ["Ali", "Mia"],
    "Suche das Wort „schaukelt“ – der Name steht direkt davor."),
  les("Emma backt mit Oma einen Kuchen. Sie brauchen Mehl, Eier und Zucker. Der Kuchen kommt in den Ofen.",
    "Mit wem backt Emma?", "mit Oma", ["mit Opa", "mit Mama"],
    "Die Antwort steht gleich im ersten Satz."),
  les("Im Herbst fallen die Blätter. Sie sind gelb, rot und braun. Noah sammelt Kastanien im Park.",
    "Was sammelt Noah?", "Kastanien", ["Blätter", "Nüsse"],
    "Lies den letzten Satz genau: Dort steht, was Noah sammelt."),
  les("Die Katze liegt auf dem Sofa. Sie schläft tief und fest. Neben ihr liegt ein rotes Kissen.",
    "Wo liegt die Katze?", "auf dem Sofa", ["im Bett", "auf dem Stuhl"],
    "Bei einer Wo-Frage suchst du den Ort – er steht im ersten Satz."),
  les("Ida fährt mit dem Rad zur Schule. Sie trägt einen blauen Helm. Vor der Schule schließt sie das Rad ab.",
    "Welche Farbe hat der Helm?", "blau", ["rot", "grün"],
    "Suche das Wort „Helm“ – die Farbe steht direkt davor."),
  les("Im Winter schneit es. Ali baut einen Schneemann. Der Schneemann bekommt eine Möhre als Nase.",
    "Was bekommt der Schneemann als Nase?", "eine Möhre", ["einen Stein", "einen Knopf"],
    "Im letzten Satz steht, was die Nase ist."),
  les("Im Teich schwimmen drei Enten. Eine Ente taucht nach Futter. Am Ufer sitzt ein grüner Frosch.",
    "Wie viele Enten schwimmen im Teich?", "drei", ["zwei", "vier"],
    "Das Zahlwort steht im ersten Satz vor „Enten“."),
  les("Lena hat heute Geburtstag. Sie wird acht Jahre alt. Von Papa bekommt sie ein Buch über Pferde.",
    "Wie alt wird Lena?", "acht Jahre", ["sieben Jahre", "neun Jahre"],
    "Lies den zweiten Satz: Dort steht das Alter."),
  les("In der Pause spielen die Kinder Fangen. Ben ist der Fänger. Er rennt schnell über den Hof.",
    "Was spielen die Kinder in der Pause?", "Fangen", ["Fußball", "Verstecken"],
    "Der erste Satz verrät dir das Spiel."),
  les("Die Sonne scheint. Mia und Tom gehen in den Park. Mia nimmt ihren Ball mit. Tom hat ein Seil dabei.",
    "Wohin gehen Mia und Tom?", "in den Park", ["in den Wald", "in die Schule"],
    "Bei einer Wohin-Frage suchst du das Ziel – es steht im zweiten Satz."),
  les("Opa arbeitet im Garten. Er gießt die Tomaten. Emma pflückt rote Erdbeeren in einen Korb.",
    "Was gießt Opa?", "die Tomaten", ["die Erdbeeren", "die Blumen"],
    "Suche das Wort „gießt“ – danach steht, was Opa gießt."),
  les("Der Igel wohnt unter einem Laubhaufen. In der Nacht sucht er Futter. Er frisst gern Käfer und Würmer.",
    "Wann sucht der Igel Futter?", "in der Nacht", ["am Morgen", "am Mittag"],
    "Bei einer Wann-Frage suchst du die Zeit – sie steht im zweiten Satz."),
  les("Noah hat ein neues Heft. Auf dem Heft ist ein Löwe. Er schreibt seinen Namen auf die erste Seite.",
    "Welches Tier ist auf dem Heft?", "ein Löwe", ["ein Tiger", "ein Hund"],
    "Im zweiten Satz steht das Tier."),
  les("Im Frühling blühen die Blumen. Die Vögel bauen ein Nest. Ida sieht eine Biene auf einer Tulpe.",
    "Was bauen die Vögel?", "ein Nest", ["ein Haus", "eine Höhle"],
    "Suche das Wort „bauen“ – direkt danach steht die Antwort."),
  les("Heute ist es windig. Ali lässt seinen Drachen steigen. Der Drachen ist rot und hat einen langen Schwanz.",
    "Was lässt Ali steigen?", "seinen Drachen", ["einen Ballon", "ein Flugzeug"],
    "Lies den zweiten Satz noch einmal ganz genau."),
  les("Mama kocht Nudeln mit Soße. Tom deckt den Tisch. Er stellt vier Teller hin.",
    "Wie viele Teller stellt Tom hin?", "vier", ["drei", "fünf"],
    "Das Zahlwort steht im letzten Satz vor „Teller“."),
  les("Auf der Wiese steht eine Kuh. Sie frisst Gras. Ihr Kalb trinkt Milch bei der Mutter.",
    "Was frisst die Kuh?", "Gras", ["Heu", "Milch"],
    "Achtung: Die Milch trinkt das Kalb – was die Kuh frisst, steht im zweiten Satz."),
  les("Lena und Ida turnen in der Halle. Lena klettert an der Sprossenwand. Ida springt über den Kasten.",
    "Wer springt über den Kasten?", "Ida", ["Lena", "Emma"],
    "Suche das Wort „Kasten“ und lies den ganzen Satz dazu."),
  les("Ben hat einen Wackelzahn. Beim Essen fällt der Zahn heraus. Ben legt ihn in eine Dose.",
    "Wohin legt Ben den Zahn?", "in eine Dose", ["unter das Bett", "in die Tasche"],
    "Der letzte Satz sagt dir, wohin der Zahn kommt."),
  les("Im Sommer ist es heiß. Emma isst ein Eis mit Erdbeere. Noah trinkt kalten Saft.",
    "Was trinkt Noah?", "kalten Saft", ["warmen Tee", "kalte Milch"],
    "Suche den Namen Noah – im selben Satz steht, was er trinkt."),
  les("Mia geht mit Papa in den Zoo. Zuerst sehen sie die Affen. Die Affen klettern und fressen Bananen.",
    "Was fressen die Affen?", "Bananen", ["Äpfel", "Nüsse"],
    "Im letzten Satz steht, was die Affen fressen."),
  les("Am Abend liest Papa eine Geschichte vor. Ali kuschelt sich in die Decke. Dann macht Papa das Licht aus.",
    "Wer liest die Geschichte vor?", "Papa", ["Mama", "Ali"],
    "Suche das Wort „liest“ – direkt daneben steht, wer es tut."),
  les("Das Eichhörnchen hat einen buschigen Schwanz. Es klettert flink den Baum hinauf. Im Herbst versteckt es Nüsse.",
    "Was versteckt das Eichhörnchen?", "Nüsse", ["Blätter", "Äpfel"],
    "Lies den letzten Satz: Dort steht, was es versteckt."),
];

const LESEN_HARD = [
  les("Tom schaut aus dem Fenster. Der Himmel ist grau und die Straße ist nass. Tom holt seinen Schirm.",
    "Wie ist das Wetter draußen?", "Es regnet.", ["Es schneit.", "Es ist sonnig."],
    "Die nasse Straße und der Schirm verraten es dir: Es regnet."),
  les("Mia gähnt. Ihre Augen fallen fast zu. Sie putzt die Zähne und geht ins Bett.",
    "Warum geht Mia ins Bett?", "Sie ist müde.", ["Sie ist krank.", "Sie hat Hunger."],
    "Wer gähnt und fast die Augen zumacht, ist müde."),
  les("Ben zieht Mütze, Schal und Handschuhe an. Draußen liegt Schnee. Er holt seinen Schlitten aus dem Keller.",
    "Welche Jahreszeit ist es bei Ben?", "Winter", ["Sommer", "Herbst"],
    "Schnee, Schlitten und Handschuhe gehören zum Winter."),
  les("Zuerst wäscht Lena die Äpfel. Dann schneidet Mama sie klein. Zum Schluss kommen die Äpfel in den Kuchen.",
    "Was passiert zuerst?", "Äpfel waschen", ["Äpfel schneiden", "Kuchen backen"],
    "Achte auf das Wort „Zuerst“ am Anfang des Textes."),
  les("Der Hund steht an der Tür. Er wedelt mit dem Schwanz und bellt. Ali holt die Leine.",
    "Was möchte der Hund?", "nach draußen", ["schlafen", "baden"],
    "Tür und Leine gehören zum Spaziergang – der Hund will hinaus."),
  les("Emma hat ihr Pausenbrot vergessen. Ida gibt ihr die Hälfte von ihrem Brot. Emma lacht und sagt Danke.",
    "Wie fühlt sich Emma am Ende?", "froh", ["wütend", "traurig"],
    "Emma lacht und bedankt sich – so zeigt man Freude."),
  les("Noah sät Kresse in einen Topf. Jeden Tag gießt er sie. Nach einer Woche ist die Kresse grün und hoch.",
    "Was braucht die Kresse zum Wachsen?", "Wasser", ["Schnee", "Milch"],
    "Noah gießt jeden Tag – beim Gießen bekommt die Kresse Wasser."),
  les("Die Blätter sind bunt. Ida sammelt Kastanien. Der Wind pustet ihr die Mütze vom Kopf.",
    "In welcher Jahreszeit spielt der Text?", "im Herbst", ["im Sommer", "im Frühling"],
    "Bunte Blätter, Kastanien und viel Wind gibt es im Herbst."),
  les("Tom schießt den Ball. Es klirrt laut. Im Fenster vom Nachbarn ist jetzt ein Loch.",
    "Was hat der Ball getroffen?", "das Fenster", ["das Tor", "den Baum"],
    "Es klirrt und im Fenster ist ein Loch – dorthin flog der Ball."),
  les("Lena hält sich den Bauch. Sie hat fünf Stück Kuchen gegessen. Jetzt mag sie nichts mehr.",
    "Warum tut Lena der Bauch weh?", "zu viel Kuchen", ["zu wenig Schlaf", "zu viel Sport"],
    "Fünf Stück Kuchen sind sehr viel – davon drückt der Bauch."),
  les("Ali packt Badehose, Handtuch und Sonnencreme ein. Mama holt die Taucherbrille. Dann fahren sie los.",
    "Wohin fahren Ali und Mama wohl?", "ins Freibad", ["in die Schule", "zum Arzt"],
    "Badehose, Handtuch und Taucherbrille braucht man im Freibad."),
  les("Es klingelt. Alle Kinder packen die Hefte ein. Sie nehmen ihr Pausenbrot und laufen auf den Hof.",
    "Was beginnt jetzt?", "die Pause", ["die Ferien", "der Unterricht"],
    "Pausenbrot und Hof zeigen dir: Jetzt ist Pause."),
  les("Die Amsel fliegt hin und her. Im Schnabel trägt sie kleine Zweige. Hoch oben im Baum legt sie die Zweige ab.",
    "Was baut die Amsel?", "ein Nest", ["eine Höhle", "einen Zaun"],
    "Vögel sammeln Zweige, um daraus ein Nest zu bauen."),
  les("Emma steht am Start. Sie rennt, so schnell sie kann. Am Ziel jubeln alle und Emma bekommt eine Medaille.",
    "Warum bekommt Emma eine Medaille?", "Sie war schnell.", ["Sie war krank.", "Sie kam zu spät."],
    "Alle jubeln am Ziel – Emma ist ein tolles Rennen gelaufen."),
  les("Morgens liegt Tau auf der Wiese. Ben läuft barfuß zum Apfelbaum. Seine Füße werden ganz nass.",
    "Warum werden Bens Füße nass?", "vom Tau im Gras", ["vom Regen", "vom Baden"],
    "Tau sind kleine Wassertropfen auf der Wiese – und Ben läuft barfuß."),
  les("Ida hat eine Schultüte im Arm. Sie trägt einen neuen Ranzen. Heute lernt sie ihre Lehrerin kennen.",
    "Was für ein Tag ist heute für Ida?", "die Einschulung", ["der Geburtstag", "die Ferien"],
    "Eine Schultüte bekommen Kinder an ihrem ersten Schultag."),
  les("Erst zieht Mia die Socken an. Dann schlüpft sie in die Schuhe. Zuletzt bindet sie eine Schleife.",
    "Was macht Mia als Zweites?", "Schuhe anziehen", ["Socken anziehen", "Schleife binden"],
    "Achte auf die Reihenfolge-Wörter: erst – dann – zuletzt."),
  les("Der Eisbär hat ein dickes Fell. Unter der Haut hat er viel Fett. So friert er auch im Eis nicht.",
    "Was hält den Eisbären warm?", "Fell und Fett", ["Mütze und Schal", "Sonne und Sand"],
    "Das Wort „So“ im letzten Satz zeigt zurück auf Fell und Fett."),
  les("Lena stellt ein Glas Wasser nach draußen. In der Nacht ist es sehr kalt. Am Morgen ist das Wasser hart.",
    "Was ist aus dem Wasser geworden?", "Eis", ["Dampf", "Schnee"],
    "Wenn Wasser sehr kalt wird, friert es und wird hart."),
  les("Tom und Lena spielen ein Würfelspiel. Tom würfelt eine Sechs und kommt ins Ziel. Lena ist noch am Start.",
    "Wer gewinnt das Spiel?", "Tom", ["Lena", "keiner"],
    "Wer zuerst im Ziel ist, gewinnt – lies den zweiten Satz."),
  les("Die Katze sitzt still vor dem Mauseloch. Sie schaut nur auf das Loch. Ihr Schwanz zuckt.",
    "Worauf wartet die Katze?", "auf die Maus", ["auf den Hund", "auf den Regen"],
    "In einem Mauseloch wohnt eine Maus – darauf lauert die Katze."),
  les("Papa stellt acht Kerzen auf den Kuchen. Die Gäste singen ein Lied. Ali pustet alle Kerzen aus.",
    "Was feiert Ali?", "Geburtstag", ["Fasching", "Einschulung"],
    "Kerzen auf dem Kuchen und ein Lied gehören zum Geburtstag."),
];

/* ============================================================
   2) Nomen & Artikel
   ============================================================ */
const artikelFrage = (w, i) => {
  const e = nom(w);
  const tipp = e.artikel === "die" && w.endsWith("e")
    ? `Viele Nomen mit -e am Ende haben den Artikel „die“: die ${w}.`
    : i % 2 === 0
      ? `Sprich alle drei Artikel vor dem Wort – nur einer klingt richtig: ${e.artikel} ${w}.`
      : `Mach die Probe im Satz – so klingt es richtig: „${gross(e.artikel)} ${w} ist da.“`;
  return { f: `Welcher Artikel passt zu ${w}?`, r: e.artikel, x: andereArtikel(e.artikel), tipp, typ: "artikel", wort: w };
};

// Drei Wörter, eines ist das Nomen (Reihenfolge wie angegeben, r = das Nomen).
const nomenAusDrei = (woerter, r) => {
  const e = nom(r);
  return {
    f: `Welches Wort ist ein Nomen? ${woerter[0]}, ${woerter[1]}, ${woerter[2]}`,
    r, x: woerter.filter((w) => w !== r),
    tipp: `Vor ein Nomen (Namenwort) passt ein Artikel: ${e.artikel} ${r}.`, typ: "nomenwahl", wort: r,
  };
};

const nomenImSatz = (satz, r, x) => ({
  f: `Welches Wort ist das Nomen? ${satz}`, r, x,
  tipp: `Frag „Wer oder was?“ und mach die Artikelprobe: ${nom(r).artikel} ${r}.`, typ: "nomensatz", wort: r,
});

// Großschreibung: drei kleingeschriebene Wörter, die Antworten zeigen sie großgeschrieben.
const grossAusDrei = (woerter, r) => ({
  f: `Welches Wort schreibst du groß? ${woerter[0]}, ${woerter[1]}, ${woerter[2]}`,
  r, x: woerter.map(gross).filter((w) => w !== r),
  tipp: `Nomen schreibst du groß – mach die Artikelprobe: ${nom(r).artikel} ${r}.`, typ: "gross", wort: r,
});

const grossImSatz = (satz, r, x) => ({
  f: `Welches Wort muss groß sein? ${satz}`, r, x,
  tipp: `Suche das Nomen mit der Artikelprobe: ${nom(r).artikel} ${r} – Nomen schreibst du groß.`, typ: "grosssatz", wort: r,
});

const nomenZaehlen = (satz, nomen, x) => ({
  f: `Wie viele Nomen hat der Satz? ${satz}`, r: String(nomen.length), x,
  tipp: `Nomen haben einen Artikel und sind großgeschrieben: ${nomen.join(", ")}.`, typ: "nomenzahl", nomen,
});

const einEine = (w) => {
  const e = nom(w);
  const r = ein(e);
  return {
    f: `Was passt zu ${w}, ein oder eine?`, r, x: [r === "ein" ? "eine" : "ein", "einen"],
    tipp: `Aus „die“ wird „eine“, aus „der“ und „das“ wird „ein“: ${e.artikel} ${w} – ${r} ${w}.`, typ: "einartikel", wort: w,
  };
};

const NOMEN_EASY = verzahnen(
  ["Hund", "Katze", "Haus", "Blume", "Ball", "Buch", "Maus", "Baum", "Auto", "Sonne", "Tisch", "Kind", "Schule", "Pferd"]
    .map(artikelFrage),
  [
    nomenAusDrei(["laufen", "Stuhl", "schnell"], "Stuhl"),
    nomenAusDrei(["Wolke", "schön", "malen"], "Wolke"),
    nomenAusDrei(["klein", "singen", "Stern"], "Stern"),
    nomenAusDrei(["Fisch", "rund", "essen"], "Fisch"),
    nomenAusDrei(["lesen", "lustig", "Brief"], "Brief"),
    nomenAusDrei(["kalt", "Nase", "rennen"], "Nase"),
    nomenAusDrei(["Apfel", "süß", "kaufen"], "Apfel"),
  ],
  [
    nomenImSatz("Der Frosch quakt laut.", "Frosch", ["quakt", "laut"]),
    nomenImSatz("Die Ente schwimmt schnell.", "Ente", ["schwimmt", "schnell"]),
    nomenImSatz("Das Schiff fährt langsam.", "Schiff", ["fährt", "langsam"]),
    nomenImSatz("Die Kerze brennt hell.", "Kerze", ["brennt", "hell"]),
    nomenImSatz("Der Stein ist schwer.", "Stein", ["ist", "schwer"]),
    nomenImSatz("Das Schaf frisst gern.", "Schaf", ["frisst", "gern"]),
    nomenImSatz("Der Vogel singt schön.", "Vogel", ["singt", "schön"]),
  ],
);

const NOMEN_HARD = verzahnen(
  ["Fenster", "Löffel", "Gabel", "Messer", "Schlüssel"].map(artikelFrage),
  [
    grossAusDrei(["laufen", "blume", "schön"], "Blume"),
    grossAusDrei(["wolke", "weich", "fliegen"], "Wolke"),
    grossAusDrei(["springen", "frosch", "grün"], "Frosch"),
    grossAusDrei(["hell", "lachen", "stern"], "Stern"),
    grossAusDrei(["garten", "gehen", "groß"], "Garten"),
    grossAusDrei(["backen", "braun", "brot"], "Brot"),
  ],
  [
    grossImSatz("Wir spielen im garten.", "Garten", ["Spielen", "Im"]),
    grossImSatz("Mia füttert die katze.", "Katze", ["Füttert", "Die"]),
    grossImSatz("Ben liest ein dickes buch.", "Buch", ["Liest", "Dickes"]),
    grossImSatz("Am himmel leuchtet der Mond.", "Himmel", ["Leuchtet", "Der"]),
    grossImSatz("Die kleine maus piept leise.", "Maus", ["Kleine", "Leise"]),
    grossImSatz("Tom holt den ball.", "Ball", ["Holt", "Den"]),
  ],
  [
    nomenZaehlen("Der Hund holt den Ball.", ["Hund", "Ball"], ["1", "3"]),
    nomenZaehlen("Die Katze schläft.", ["Katze"], ["2", "3"]),
    nomenZaehlen("Das Kind malt ein Haus und einen Baum.", ["Kind", "Haus", "Baum"], ["2", "4"]),
    nomenZaehlen("Die Maus frisst das Brot.", ["Maus", "Brot"], ["1", "3"]),
    nomenZaehlen("Im Wald wohnen Fuchs und Hase.", ["Wald", "Fuchs", "Hase"], ["2", "4"]),
    nomenZaehlen("Der Vogel sitzt auf dem Dach.", ["Vogel", "Dach"], ["1", "3"]),
  ],
  ["Blume", "Haus", "Katze", "Buch", "Tür", "Pferd"].map(einEine),
);

/* ============================================================
   3) Einzahl & Mehrzahl
   ============================================================ */
// Mehrzahl bilden: zwei typische Fehlformen als Falschantworten.
const mehrzahlFrage = (w, falsch, tipp) => {
  const e = nom(w);
  return {
    f: `Wie heißt die Mehrzahl von „${e.artikel} ${w}“?`, r: `die ${e.mehrzahl}`, x: falsch.map((x) => `die ${x}`),
    tipp: tipp || `Probiere es mit „viele“: ${ein(e)} ${w} – viele ${e.mehrzahl}.`, typ: "mehrzahl", wort: w,
  };
};

const UMLAUT = [["au", "äu"], ["a", "ä"], ["o", "ö"], ["u", "ü"]];
const mehrzahlUmlaut = (w, falsch) => {
  const e = nom(w);
  const [von, zu] = UMLAUT.find(([, u]) => e.mehrzahl.toLowerCase().includes(u) && !w.toLowerCase().includes(u));
  return mehrzahlFrage(w, falsch, `In der Mehrzahl wird hier aus ${von} ein ${zu}: ${ein(e)} ${w} – viele ${e.mehrzahl}.`);
};

const mehrzahlGleich = (w, falsch) => mehrzahlFrage(w, falsch,
  `Manche Nomen bleiben gleich, nur der Artikel ändert sich: ${nom(w).artikel} ${w} – die ${nom(w).mehrzahl}.`);

// Einzahl nennen (1. Halbjahr): die Form ist leicht, der Artikel ist die Hürde.
const einzahlArtikel = (w) => {
  const e = nom(w);
  return {
    f: `Wie heißt die Einzahl von „die ${e.mehrzahl}“?`, r: `${e.artikel} ${w}`,
    x: andereArtikel(e.artikel).map((a) => `${a} ${w}`),
    tipp: `Einzahl heißt: nur eins – und der Artikel wechselt: ${ein(e)} ${w}, ${e.artikel} ${w}.`, typ: "einzahl", wort: w,
  };
};

// Einzahl nennen (2. Halbjahr): der Umlaut muss zurück.
const einzahlForm = (w, falsch) => {
  const e = nom(w);
  return {
    f: `Wie heißt die Einzahl von „die ${e.mehrzahl}“?`, r: `${e.artikel} ${w}`, x: falsch,
    tipp: `Probiere es mit „${ein(e)}“ davor: ${ein(e)} ${w} – also ${e.artikel} ${w}.`, typ: "einzahl", wort: w,
  };
};

// Aus drei Wörtern die Mehrzahl-Form finden (einzahl = Wort, dessen Mehrzahl gezeigt wird).
const mehrzahlAusDrei = (woerter, einzahl) => {
  const e = nom(einzahl);
  return {
    f: `Welches Wort steht in der Mehrzahl? ${woerter[0]}, ${woerter[1]}, ${woerter[2]}`,
    r: e.mehrzahl, x: woerter.filter((w) => w !== e.mehrzahl),
    tipp: `Mehrzahl heißt: viele. Probiere „viele“ davor: viele ${e.mehrzahl}.`, typ: "mzwahl", wort: einzahl,
  };
};

const einzahlAusDrei = (woerter, r) => {
  const e = nom(r);
  return {
    f: `Welches Wort steht in der Einzahl? ${woerter[0]}, ${woerter[1]}, ${woerter[2]}`,
    r, x: woerter.filter((w) => w !== r),
    tipp: `Probiere „${ein(e)}“ davor: ${ein(e)} ${r} passt – bei den anderen passt nur „viele“.`, typ: "ezwahl", wort: r,
  };
};

const MEHRZAHL_EASY = verzahnen(
  [
    mehrzahlFrage("Hund", ["Hunden", "Hunds"]),
    mehrzahlFrage("Blume", ["Blume", "Blumes"]),
    mehrzahlFrage("Kind", ["Kinde", "Kinds"]),
    mehrzahlFrage("Auto", ["Auto", "Autoen"]),
    mehrzahlFrage("Tisch", ["Tischen", "Tischer"]),
    mehrzahlFrage("Katze", ["Katze", "Katzes"]),
    mehrzahlFrage("Bild", ["Bilde", "Bilden"]),
    mehrzahlFrage("Schuh", ["Schuhen", "Schuhs"]),
    mehrzahlFrage("Ei", ["Eie", "Eien"]),
    mehrzahlFrage("Stern", ["Sternen", "Sterns"]),
    mehrzahlFrage("Tür", ["Türs", "Türer"]),
    mehrzahlFrage("Brief", ["Briefen", "Briefs"]),
    mehrzahlFrage("Nase", ["Nase", "Nases"]),
    mehrzahlFrage("Pferd", ["Pferden", "Pferds"]),
  ],
  ["Schwein", "Lampe", "Berg", "Heft", "Ente", "Stein"].map(einzahlArtikel),
  [
    mehrzahlAusDrei(["Baum", "Blumen", "Haus"], "Blume"),
    mehrzahlAusDrei(["Hunde", "Katze", "Maus"], "Hund"),
    mehrzahlAusDrei(["Kind", "Ball", "Autos"], "Auto"),
    mehrzahlAusDrei(["Tür", "Fische", "Buch"], "Fisch"),
    mehrzahlAusDrei(["Stifte", "Heft", "Tafel"], "Stift"),
    mehrzahlAusDrei(["Schuh", "Hose", "Kleider"], "Kleid"),
    mehrzahlAusDrei(["Ente", "Schafe", "Kuh"], "Schaf"),
  ],
);

const MEHRZAHL_HARD = verzahnen(
  [
    mehrzahlUmlaut("Baum", ["Baume", "Bäumen"]),
    mehrzahlUmlaut("Haus", ["Hause", "Häuse"]),
    mehrzahlUmlaut("Maus", ["Mause", "Mäusen"]),
    mehrzahlUmlaut("Apfel", ["Apfels", "Apfeln"]),
    mehrzahlUmlaut("Buch", ["Buchs", "Büche"]),
    mehrzahlUmlaut("Stuhl", ["Stuhle", "Stühlen"]),
    mehrzahlUmlaut("Hand", ["Hande", "Handen"]),
    mehrzahlUmlaut("Vogel", ["Vogels", "Vogeln"]),
    mehrzahlUmlaut("Ball", ["Balle", "Balls"]),
    mehrzahlUmlaut("Wald", ["Walde", "Wälde"]),
    mehrzahlUmlaut("Zahn", ["Zahne", "Zahnen"]),
    mehrzahlUmlaut("Blatt", ["Blatte", "Blätte"]),
  ],
  [
    mehrzahlGleich("Fenster", ["Fensters", "Fenstern"]),
    mehrzahlGleich("Löffel", ["Löffels", "Löffeln"]),
    mehrzahlGleich("Teller", ["Tellers", "Tellern"]),
    mehrzahlGleich("Käfer", ["Käfers", "Käfern"]),
  ],
  [
    einzahlForm("Fuß", ["der Füß", "der Fuße"]),
    einzahlForm("Kuh", ["die Küh", "die Kuhe"]),
    einzahlForm("Nuss", ["die Nüss", "die Nusse"]),
    einzahlForm("Topf", ["der Töpf", "der Topfe"]),
    einzahlForm("Dach", ["das Däch", "das Dacher"]),
    einzahlForm("Zaun", ["der Zäun", "der Zaune"]),
    einzahlForm("Wurm", ["der Würm", "der Wurmer"]),
  ],
  [
    einzahlAusDrei(["Äpfel", "Garten", "Vögel"], "Garten"),
    einzahlAusDrei(["Mütter", "Väter", "Bruder"], "Bruder"),
    einzahlAusDrei(["Kopf", "Füße", "Hände"], "Kopf"),
    einzahlAusDrei(["Blätter", "Ast", "Zweige"], "Ast"),
    einzahlAusDrei(["Zähne", "Ohren", "Mund"], "Mund"),
  ],
);

/* ============================================================
   4) Verben
   ============================================================ */
const verbAusDrei = (woerter, r) => ({
  f: `Welches Wort ist ein Verb? ${woerter[0]}, ${woerter[1]}, ${woerter[2]}`,
  r, x: woerter.filter((w) => w !== r),
  tipp: `Verben (Tunwörter) sagen, was jemand tut – probiere „ich“ davor: ich ${verb(r).ich}.`, typ: "verbwahl", wort: r,
});

// Person der Lücke: ich, du, er (eine Person/ein Tier/ein Ding), wir, sie (viele).
const FORM_TIPP = {
  ich: "Zu „ich“ gehört die Endung -e:",
  du: "Zu „du“ gehört die Endung -st:",
  er: "Zu „er“, „sie“ oder „es“ gehört die Endung -t:",
  wir: "Zu „wir“ gehört die Endung -en:",
  sie: "Sind es viele, endet das Verb auf -en:",
};
const form = (e, person) => (person === "wir" || person === "sie" ? e.grund : e[person]);

// Passende Verbform in die Lücke (regelmäßige Verben): Falschantworten = andere Personalformen.
const verbForm = (satz, grund, person) => {
  const e = verb(grund);
  const r = form(e, person);
  const x = [e.grund, e.er, e.du, e.ich].filter((w, i, alle) => w !== r && alle.indexOf(w) === i).slice(0, 2);
  return {
    f: `Was passt in die Lücke? ${satz}`, sprich: `Welches Wort passt in die Lücke? ${lueckeSprechen(satz)}`,
    r, x, tipp: `${FORM_TIPP[person]} ${satz.replace("__", r)}`, typ: "verbform", wort: grund, person,
  };
};

// Verbform mit Selbstlaut-Wechsel: Falschantworten = Form ohne Wechsel und Grundform.
const verbWechsel = (satz, grund, person, ohneWechsel) => {
  const e = verb(grund);
  return {
    f: `Was passt in die Lücke? ${satz}`, sprich: `Welches Wort passt in die Lücke? ${lueckeSprechen(satz)}`,
    r: form(e, person), x: [ohneWechsel, e.grund],
    tipp: `Hier ändert sich bei „du“ und „er“ der Selbstlaut: ${e.grund} – du ${e.du}, er ${e.er}.`,
    typ: "verbform", wort: grund, person,
  };
};

const verbImSatz = (satz, r, x, wer) => ({
  f: `Welches Wort ist das Verb? ${satz}`, r, x,
  tipp: `Frag „Was ${wer}?“ – die Antwort ist das Verb: ${r}.`, typ: "verbsatz",
});

const grundform = (formText, grund, falsch) => ({
  f: `Wie heißt die Grundform von „${formText}“?`, r: grund, x: falsch,
  tipp: `Die Grundform endet auf -en – probiere „wir“ davor: wir ${verb(grund).grund}.`, typ: "grundform", wort: grund, formText,
});

const VERBEN_EASY = verzahnen(
  [
    verbAusDrei(["Ball", "spielen", "rund"], "spielen"),
    verbAusDrei(["rennen", "Hund", "schnell"], "rennen"),
    verbAusDrei(["Blume", "bunt", "malen"], "malen"),
    verbAusDrei(["lesen", "Buch", "dick"], "lesen"),
    verbAusDrei(["laut", "singen", "Lied"], "singen"),
    verbAusDrei(["Wasser", "nass", "schwimmen"], "schwimmen"),
    verbAusDrei(["kochen", "Suppe", "heiß"], "kochen"),
    verbAusDrei(["hoch", "Baum", "klettern"], "klettern"),
  ],
  [
    verbForm("Der Hund __.", "bellen", "er"),
    verbForm("Emma __ ein Bild.", "malen", "er"),
    verbForm("Die Kinder __ im Garten.", "spielen", "sie"),
    verbForm("Ich __ ein Lied.", "singen", "ich"),
    verbForm("Du __ sehr schnell.", "rennen", "du"),
    verbForm("Der Vogel __ hoch.", "fliegen", "er"),
    verbForm("Wir __ zusammen.", "lernen", "wir"),
    verbForm("Tom __ einen Brief.", "schreiben", "er"),
    verbForm("Die Enten __ im Teich.", "schwimmen", "sie"),
    verbForm("Ich __ ein Glas Wasser.", "trinken", "ich"),
    verbForm("Du __ einen Turm.", "bauen", "du"),
    verbForm("Oma __ eine Suppe.", "kochen", "er"),
  ],
  [
    verbImSatz("Ben baut einen Turm.", "baut", ["Ben", "Turm"], "tut Ben"),
    verbImSatz("Der Hund holt den Ball.", "holt", ["Hund", "Ball"], "tut der Hund"),
    verbImSatz("Die Katze trinkt Milch.", "trinkt", ["Katze", "Milch"], "tut die Katze"),
    verbImSatz("Lena ruft ihren Bruder.", "ruft", ["Lena", "Bruder"], "tut Lena"),
    verbImSatz("Der Frosch hüpft ins Wasser.", "hüpft", ["Frosch", "Wasser"], "tut der Frosch"),
    verbImSatz("Ali kauft ein Brot.", "kauft", ["Ali", "Brot"], "tut Ali"),
    verbImSatz("Die Sonne scheint hell.", "scheint", ["Sonne", "hell"], "tut die Sonne"),
  ],
);

const VERBEN_HARD = verzahnen(
  [
    grundform("er läuft", "laufen", ["läufen", "läufst"]),
    grundform("sie liest", "lesen", ["liesen", "lest"]),
    grundform("er isst", "essen", ["issen", "esst"]),
    grundform("sie fährt", "fahren", ["fähren", "fährst"]),
    grundform("er schläft", "schlafen", ["schläfen", "schläfst"]),
    grundform("du siehst", "sehen", ["siehen", "seht"]),
    grundform("sie gibt", "geben", ["giben", "gebt"]),
    grundform("er hilft", "helfen", ["hilfen", "helft"]),
    grundform("du nimmst", "nehmen", ["nimmen", "nehmt"]),
    grundform("sie trägt", "tragen", ["trägen", "tragt"]),
    grundform("er spricht", "sprechen", ["sprichen", "sprecht"]),
  ],
  [
    verbWechsel("Tom __ schnell nach Hause.", "laufen", "er", "lauft"),
    verbWechsel("Du __ ein Buch.", "lesen", "du", "lest"),
    verbWechsel("Emma __ einen Apfel.", "essen", "er", "esst"),
    verbWechsel("Der Bus __ zur Schule.", "fahren", "er", "fahrt"),
    verbWechsel("Das Baby __ schon.", "schlafen", "er", "schlaft"),
    verbWechsel("Du __ mir beim Tragen.", "helfen", "du", "helfst"),
    verbWechsel("Ali __ den Ball.", "fangen", "er", "fangt"),
    verbWechsel("Noah __ den Ball weit.", "werfen", "er", "werft"),
    verbWechsel("Ida __ einen Vogel.", "sehen", "er", "seht"),
  ],
  [
    verbImSatz("Am Morgen putzt Ida ihre Zähne.", "putzt", ["Morgen", "Zähne"], "tut Ida"),
    verbImSatz("Heute schwimmen wir im See.", "schwimmen", ["Heute", "See"], "tun wir"),
    verbImSatz("Im Garten wachsen bunte Blumen.", "wachsen", ["Garten", "bunte"], "tun die Blumen"),
    verbImSatz("Nach der Schule besucht Tom seine Oma.", "besucht", ["Schule", "Oma"], "tut Tom"),
    verbImSatz("Leise summt die Biene.", "summt", ["Leise", "Biene"], "tut die Biene"),
  ],
);

/* ============================================================
   5) Adjektive
   ============================================================ */
const adjAusDrei = (woerter, r, beispiel) => ({
  f: `Welches Wort ist ein Adjektiv? ${woerter[0]}, ${woerter[1]}, ${woerter[2]}`,
  r: adj(r).w, x: woerter.filter((w) => w !== r),
  tipp: `Adjektive (Wiewörter) sagen, wie etwas ist: ${beispiel}`, typ: "adjwahl", wort: r,
});

const gegenteil = (w, falsch) => {
  const e = adj(w);
  return {
    f: `Was ist das Gegenteil von ${w}?`, r: e.gegenteil, x: falsch,
    tipp: `Das Gegenteil ist genau andersherum: nicht ${w}, sondern ${e.gegenteil}.`, typ: "gegenteil", wort: w,
  };
};

const adjImSatz = (satz, r, x, frage) => ({
  f: `Welches Wort ist das Adjektiv? ${satz}`, r, x,
  tipp: `Frag „${frage}“ – die Antwort ist das Adjektiv: ${r}.`, typ: "adjsatz",
});

const adjPasst = (nomenText, r, falsch, tipp) => ({
  f: `Welches Adjektiv passt zu ${nomenText}?`, r: adj(r).w, x: falsch, tipp, typ: "adjpasst", wort: r,
});

const ADJEKTIVE_EASY = verzahnen(
  [
    adjAusDrei(["Hund", "klein", "rennen"], "klein", "Der Hund ist klein."),
    adjAusDrei(["schnell", "Auto", "fahren"], "schnell", "Das Auto ist schnell."),
    adjAusDrei(["lachen", "Kind", "lustig"], "lustig", "Das Kind ist lustig."),
    adjAusDrei(["Blume", "riechen", "schön"], "schön", "Die Blume ist schön."),
    adjAusDrei(["kalt", "Schnee", "fallen"], "kalt", "Der Schnee ist kalt."),
    adjAusDrei(["Sonne", "hell", "scheinen"], "hell", "Die Sonne ist hell."),
    adjAusDrei(["trinken", "süß", "Saft"], "süß", "Der Saft ist süß."),
    adjAusDrei(["Maus", "piepen", "leise"], "leise", "Die Maus ist leise."),
  ],
  [
    gegenteil("groß", ["dick", "riesig"]),
    gegenteil("kalt", ["nass", "eisig"]),
    gegenteil("laut", ["schnell", "lustig"]),
    gegenteil("schnell", ["leise", "flink"]),
    gegenteil("hell", ["bunt", "klar"]),
    gegenteil("lang", ["dünn", "weit"]),
    gegenteil("jung", ["klein", "neu"]),
    gegenteil("nass", ["kalt", "sauber"]),
    gegenteil("voll", ["schwer", "satt"]),
    gegenteil("dick", ["klein", "rund"]),
    gegenteil("leicht", ["weich", "klein"]),
    gegenteil("froh", ["lustig", "müde"]),
  ],
  [
    adjImSatz("Der kleine Hund schläft.", "kleine", ["Hund", "schläft"], "Wie ist der Hund?"),
    adjImSatz("Die Suppe ist heiß.", "heiß", ["Suppe", "ist"], "Wie ist die Suppe?"),
    adjImSatz("Mia hat einen roten Ball.", "roten", ["Mia", "Ball"], "Wie ist der Ball?"),
    adjImSatz("Das Wasser ist kalt.", "kalt", ["Wasser", "ist"], "Wie ist das Wasser?"),
    adjImSatz("Der Weg ist lang.", "lang", ["Weg", "ist"], "Wie ist der Weg?"),
    adjImSatz("Tom trägt eine schwere Tasche.", "schwere", ["trägt", "Tasche"], "Wie ist die Tasche?"),
    adjImSatz("Die Blume ist schön.", "schön", ["Blume", "ist"], "Wie ist die Blume?"),
  ],
);

const ADJEKTIVE_HARD = verzahnen(
  [
    adjPasst("Zitrone", "sauer", ["süß", "salzig"], "Stell dir vor, du beißt in eine Zitrone – sie schmeckt sauer."),
    adjPasst("Schnee", "kalt", ["heiß", "warm"], "Schnee fällt im Winter – fass ihn in Gedanken an: Er ist kalt."),
    adjPasst("Feuer", "heiß", ["kalt", "nass"], "Am Feuer wärmst du dir die Hände, denn es ist heiß."),
    adjPasst("Feder", "leicht", ["schwer", "hart"], "Eine Feder schwebt langsam zu Boden – sie ist leicht."),
    adjPasst("Stein", "hart", ["weich", "saftig"], "Klopfe in Gedanken auf einen Stein: Er gibt nicht nach, er ist hart."),
    adjPasst("Schnecke", "langsam", ["schnell", "laut"], "Eine Schnecke braucht lange für ein kleines Stück – sie ist langsam."),
    adjPasst("Nacht", "dunkel", ["hell", "bunt"], "In der Nacht scheint keine Sonne – darum ist es dunkel."),
    adjPasst("Honig", "süß", ["sauer", "salzig"], "Honig machen die Bienen aus Blüten – er schmeckt süß."),
    adjPasst("Kissen", "weich", ["hart", "spitz"], "Auf einem Kissen liegt dein Kopf bequem, weil es weich ist."),
    adjPasst("Riese", "groß", ["klein", "winzig"], "Ein Riese im Märchen ragt über alle Häuser – er ist groß."),
  ],
  [
    gegenteil("mutig", ["stark", "frech"]),
    gegenteil("fleißig", ["müde", "langsam"]),
    gegenteil("sauber", ["nass", "alt"]),
    gegenteil("gesund", ["müde", "schwach"]),
    gegenteil("hart", ["leicht", "dünn"]),
    gegenteil("früh", ["schnell", "bald"]),
    gegenteil("stark", ["klein", "dünn"]),
    gegenteil("wach", ["faul", "leise"]),
    gegenteil("teuer", ["klein", "wenig"]),
  ],
  [
    adjImSatz("Im Garten blühen bunte Blumen.", "bunte", ["Garten", "blühen"], "Wie sind die Blumen?"),
    adjImSatz("Heute trägt Lena ihre neue Jacke.", "neue", ["Heute", "trägt"], "Wie ist die Jacke?"),
    adjImSatz("Der Igel hat spitze Stacheln.", "spitze", ["Igel", "Stacheln"], "Wie sind die Stacheln?"),
    adjImSatz("Am Abend ist Noah sehr müde.", "müde", ["Abend", "sehr"], "Wie ist Noah?"),
    adjImSatz("Ein lauter Knall weckt die Katze.", "lauter", ["Knall", "weckt"], "Wie ist der Knall?"),
    adjImSatz("Ali isst gern süße Erdbeeren.", "süße", ["gern", "Erdbeeren"], "Wie sind die Erdbeeren?"),
    adjImSatz("Auf dem Berg liegt weißer Schnee.", "weißer", ["Berg", "liegt"], "Wie ist der Schnee?"),
  ],
);

/* ============================================================
   6) Satzzeichen
   ============================================================ */
const ZEICHEN = ["Punkt", "Fragezeichen", "Ausrufezeichen"];
const ZEICHEN_VON = { Punkt: ".", Fragezeichen: "?", Ausrufezeichen: "!" };
const SATZART_VON = { ".": "Aussagesatz", "?": "Fragesatz", "!": "Ausrufesatz" };

// Satz ohne Schlusszeichen – welches Satzzeichen fehlt?
const zeichen = (satz, r, tipp) => ({
  f: `Was fehlt am Ende? ${satz} __`, sprich: `Welches Satzzeichen fehlt am Ende? ${satz}`,
  r, x: ZEICHEN.filter((z) => z !== r), tipp, typ: "zeichen", satz,
});
const punkt = (satz) => zeichen(satz, "Punkt", "Hier wird etwas erzählt – nach einem Aussagesatz steht ein Punkt.");
const frage = (satz) => zeichen(satz, "Fragezeichen",
  `Der Satz beginnt mit dem Fragewort „${satz.split(" ")[0]}“ – nach einer Frage steht ein Fragezeichen.`);
const frageVerb = (satz) => zeichen(satz, "Fragezeichen",
  "Das Verb steht ganz vorn und jemand soll antworten – das ist eine Frage.");
const ausruf = (satz) => zeichen(satz, "Ausrufezeichen",
  "Das ruft jemand laut oder dringend – dahinter steht ein Ausrufezeichen.");

const satzart = (satz) => {
  const ende = satz.slice(-1);
  const r = SATZART_VON[ende];
  const name = ZEICHEN.find((z) => ZEICHEN_VON[z] === ende);
  return {
    f: `Welche Satzart ist das? ${satz}`, r, x: Object.values(SATZART_VON).filter((s) => s !== r),
    tipp: `Schau auf das Satzzeichen am Ende: Ein ${name} gehört zum ${r}.`, typ: "satzart", satz,
  };
};

const satzanfang = (satz, x) => {
  const r = gross(satz.split(" ")[0]);
  return {
    f: `Welches Wort schreibst du groß? ${satz}`, r, x,
    tipp: `Am Satzanfang schreibst du immer groß – der Satz beginnt mit „${r}“.`, typ: "satzanfang", satz,
  };
};

const satzgrenze = (text, nach, x) => ({
  f: `Wo endet der erste Satz? ${text}`, r: `nach ${nach}`, x,
  tipp: `Lies leise mit: Nach „${nach}“ machst du eine Pause – dort endet der Satz.`, typ: "satzgrenze", text, nach,
});

const zeichenWissen = (art, r) => ({
  f: `Welches Zeichen steht nach einem ${art}?`, r, x: ZEICHEN.filter((z) => z !== r),
  tipp: "Merke dir die Paare: Aussagesatz – Punkt, Fragesatz – Fragezeichen, Ausrufesatz – Ausrufezeichen.",
  typ: "zeichenwissen", satzart: art,
});

const SATZZEICHEN_EASY = verzahnen(
  [
    punkt("Der Hund schläft im Korb"), punkt("Ich gehe in die zweite Klasse"), punkt("Mia malt ein buntes Bild"),
    punkt("Heute scheint die Sonne"), punkt("Wir essen um zwölf Uhr"), punkt("Die Katze trinkt Milch"),
    punkt("Im Herbst fallen die Blätter"), punkt("Tom hat einen kleinen Bruder"), punkt("Der Bus hält vor der Schule"),
  ],
  [
    frage("Wie heißt du"), frage("Wo wohnst du"), frage("Wer hat den Ball"), frage("Wann beginnt die Schule"),
    frage("Was isst du gern"), frage("Warum weint das Baby"), frage("Wie alt bist du"),
    frage("Wohin läuft die Katze"), frage("Welche Farbe hat dein Rad"),
  ],
  [
    ausruf("Hilfe, es brennt"), ausruf("Pass auf"), ausruf("Komm schnell her"), ausruf("Aua, das tut weh"),
    ausruf("Halt, bleib stehen"), ausruf("Hurra, wir haben gewonnen"), ausruf("Oh, wie schön"),
    ausruf("Achtung, eine Stufe"),
  ],
);

const SATZZEICHEN_HARD = verzahnen(
  [
    satzart("Wo wohnst du?"), satzart("Die Katze schläft."), satzart("Hurra, es schneit!"),
    satzart("Kommst du mit ins Freibad?"), satzart("Morgen gehen wir in den Zoo."),
    satzart("Oh, ist das schön!"), satzart("Ben liest ein Buch."),
  ],
  [
    frageVerb("Kommst du mit"), ausruf("Komm sofort her"), frageVerb("Hast du Hunger"),
    punkt("Ich komme heute mit"), frageVerb("Spielst du mit mir"), ausruf("Lauf schnell weg"),
    frageVerb("Ist das dein Hund"), punkt("Wir können dir helfen"), frageVerb("Kannst du mir helfen"),
  ],
  [
    satzanfang("heute scheint die Sonne.", ["Scheint", "Die"]),
    satzanfang("wir spielen im Hof.", ["Spielen", "Im"]),
    satzanfang("morgen kommt Oma zu uns.", ["Kommt", "Uns"]),
    satzanfang("wo ist mein Heft?", ["Ist", "Mein"]),
    satzanfang("am Abend lese ich.", ["Lese", "Ich"]),
  ],
  [
    satzgrenze("Mia malt ein Bild Ben schaut zu", "Bild", ["nach malt", "nach Ben"]),
    satzgrenze("Der Hund bellt die Katze rennt weg", "bellt", ["nach Hund", "nach Katze"]),
    satzgrenze("Es regnet wir bleiben im Haus", "regnet", ["nach wir", "nach bleiben"]),
    satzgrenze("Tom ruft laut Ali hört ihn nicht", "laut", ["nach ruft", "nach Ali"]),
  ],
  [
    zeichenWissen("Fragesatz", "Fragezeichen"), zeichenWissen("Aussagesatz", "Punkt"),
    zeichenWissen("Ausrufesatz", "Ausrufezeichen"),
  ],
);

/* ============================================================
   7) Silbentrennung
   ============================================================ */
// Wörter ohne Mehrzahl (stehen darum nicht in K2_WOERTER), Trennung nach Duden.
const SILBEN_ZUSATZ = { Wasser: "Was-ser", Zucker: "Zu-cker" };
const getrennt = (w) => SILBEN_ZUSATZ[w] || nom(w).silben.join("-");

const TRENN_TIPP = {
  einfach: (t) => `Sprich in Silben und klatsche dazu: ${t}.`,
  zwei: (t) => `Stehen zwei Mitlaute zwischen den Selbstlauten, trennst du dazwischen: ${t}.`,
  doppelt: (t) => `Doppelte Mitlaute trennst du in der Mitte: ${t}.`,
  ck: (t) => `ck bleibt immer zusammen und rutscht in die nächste Silbe: ${t}.`,
  tz: (t) => `tz trennst du zwischen t und z: ${t}.`,
  sch: (t) => `sch und ch gehören zusammen und werden nie getrennt: ${t}.`,
  drei: (t) => `Klatsche langsam – jede Silbe braucht einen Selbstlaut: ${t}.`,
};
const trennen = (regel) => (w, falsch) => {
  const r = getrennt(w);
  return { f: `Wie trennst du ${w}?`, r, x: falsch, tipp: TRENN_TIPP[regel](r), typ: "trennen", wort: w, regel };
};
const trEinfach = trennen("einfach");
const trZwei = trennen("zwei");
const trDoppelt = trennen("doppelt");
const trCk = trennen("ck");
const trTz = trennen("tz");
const trSch = trennen("sch");
const trDrei = trennen("drei");

const silbenZaehlen = (w) => {
  const s = nom(w).silben;
  const zahl = s.length;
  return {
    f: `Wie viele Silben hat ${w}?`, r: String(zahl), x: zahl === 1 ? ["2", "3"] : zahl === 2 ? ["1", "3"] : ["2", "4"],
    tipp: zahl === 1
      ? `Klatsche das Wort: ${w} – du klatschst nur einmal, also 1 Silbe.`
      : `Klatsche das Wort: ${s.join("-")} – du klatschst ${zahl}-mal.`,
    typ: "silbenzahl", wort: w,
  };
};

const SILBEN_EASY = verzahnen(
  [
    trEinfach("Blume", ["Bl-ume", "Blum-e"]), trEinfach("Hose", ["H-ose", "Hos-e"]),
    trEinfach("Nase", ["N-ase", "Nas-e"]), trEinfach("Rose", ["R-ose", "Ros-e"]),
    trEinfach("Hase", ["H-ase", "Has-e"]), trEinfach("Tafel", ["T-afel", "Taf-el"]),
    trEinfach("Gabel", ["G-abel", "Gab-el"]), trEinfach("Vogel", ["V-ogel", "Vog-el"]),
    trEinfach("Tiger", ["T-iger", "Tig-er"]), trEinfach("Schule", ["Sch-ule", "Schul-e"]),
    trEinfach("Wiese", ["Wi-ese", "Wies-e"]), trEinfach("Biene", ["Bi-ene", "Bien-e"]),
    trEinfach("Raupe", ["Ra-upe", "Raup-e"]),
    trZwei("Lampe", ["La-mpe", "Lamp-e"]), trZwei("Wolke", ["Wo-lke", "Wolk-e"]),
    trZwei("Birne", ["Bi-rne", "Birn-e"]), trZwei("Garten", ["Ga-rten", "Gart-en"]),
    trZwei("Tulpe", ["Tu-lpe", "Tulp-e"]), trZwei("Kerze", ["Ke-rze", "Kerz-e"]),
  ],
  ["Banane", "Hund", "Fenster", "Tomate", "Haus", "Krokodil", "Blume", "Papagei", "Ball", "Kartoffel"].map(silbenZaehlen),
);

const SILBEN_HARD = verzahnen(
  [
    trDoppelt("Wasser", ["Wa-sser", "Wass-er"]), trDoppelt("Sonne", ["So-nne", "Sonn-e"]),
    trDoppelt("Puppe", ["Pu-ppe", "Pupp-e"]), trDoppelt("Teller", ["Te-ller", "Tell-er"]),
    trDoppelt("Löffel", ["Lö-ffel", "Löff-el"]), trDoppelt("Zimmer", ["Zi-mmer", "Zimm-er"]),
    trDoppelt("Mutter", ["Mu-tter", "Mutt-er"]), trDoppelt("Suppe", ["Su-ppe", "Supp-e"]),
    trDoppelt("Himmel", ["Hi-mmel", "Himm-el"]), trDoppelt("Sommer", ["So-mmer", "Somm-er"]),
    trDoppelt("Kissen", ["Ki-ssen", "Kiss-en"]), trDoppelt("Spinne", ["Spi-nne", "Spinn-e"]),
  ],
  [
    trCk("Zucker", ["Zuc-ker", "Zuck-er"]), trCk("Jacke", ["Jac-ke", "Jack-e"]),
    trCk("Decke", ["Dec-ke", "Deck-e"]), trCk("Brücke", ["Brüc-ke", "Brück-e"]),
    trCk("Schnecke", ["Schnec-ke", "Schneck-e"]),
  ],
  [
    trTz("Katze", ["Ka-tze", "Katz-e"]), trTz("Mütze", ["Mü-tze", "Mütz-e"]), trTz("Pfütze", ["Pfü-tze", "Pfütz-e"]),
  ],
  [
    trSch("Tasche", ["Tas-che", "Tasch-e"]), trSch("Küche", ["Küc-he", "Küch-e"]), trSch("Kirsche", ["Kirs-che", "Kirsch-e"]),
  ],
  [
    trDrei("Kartoffel", ["Kar-to-ffel", "Kart-of-fel"]), trDrei("Giraffe", ["Gir-af-fe", "Gi-ra-ffe"]),
    trDrei("Banane", ["Ban-an-e", "Ba-nan-e"]),
  ],
);

/* ============================================================
   8) Verlängern (d/t, g/k, b/p am Wortende hörbar machen)
   ============================================================ */
const PARTNER = { d: ["t", "tt"], t: ["d", "tt"], g: ["k", "ck"], k: ["g", "ck"], b: ["p", "pp"], p: ["b", "pp"] };
const PAAR_TEXT = { d: "d oder t", t: "d oder t", g: "g oder k", k: "g oder k", b: "b oder p", p: "b oder p" };

// Nomen: letzter Buchstabe fehlt, die Mehrzahl macht ihn hörbar.
const verlNomen = (w) => {
  const e = nom(w);
  const r = w.slice(-1);
  return {
    f: `${w.slice(0, -1)}_ – ${PAAR_TEXT[r]}?`, sprich: `${w}. Schreibst du am Ende ${PAAR_TEXT[r]}?`,
    r, x: PARTNER[r], tipp: `Verlängere das Wort: viele ${e.mehrzahl} – jetzt hörst du das ${r}.`,
    typ: "verlaengern", wortart: "nomen", wort: w, lang: e.mehrzahl,
  };
};

// Adjektiv: letzter Buchstabe fehlt, die Steigerung macht ihn hörbar.
const verlAdjektiv = (w, lang) => {
  const r = w.slice(-1);
  return {
    f: `${w.slice(0, -1)}_ – ${PAAR_TEXT[r]}?`, sprich: `${w}. Schreibst du am Ende ${PAAR_TEXT[r]}?`,
    r, x: PARTNER[r], tipp: `Verlängere das Adjektiv: ${w} – ${lang}. Jetzt hörst du das ${r}.`,
    typ: "verlaengern", wortart: "adjektiv", wort: w, lang,
  };
};

// Verb: Buchstabe vor dem -t fehlt, die Grundform macht ihn hörbar.
const verlVerb = (pronomen, grund) => {
  const e = verb(grund);
  const r = e.er.slice(-2, -1);
  return {
    f: `${pronomen} ${e.er.slice(0, -2)}_t – ${PAAR_TEXT[r]}?`,
    sprich: `${pronomen} ${e.er}. Schreibst du vor dem t ${PAAR_TEXT[r]}?`,
    r, x: PARTNER[r], tipp: `Bilde die Grundform: ${grund} – jetzt hörst du das ${r}.`,
    typ: "verlaengern", wortart: "verb", wort: e.er, lang: grund,
  };
};

const VERLAENGERN_EASY = verzahnen(
  ["Hund", "Brot", "Kind", "Wald", "Zelt", "Hand", "Pferd", "Hut", "Bild", "Lied", "Boot", "Mond", "Kleid", "Heft", "Freund"]
    .map(verlNomen),
  ["Berg", "Bank", "Tag", "Weg", "Schrank", "Zug", "Zwerg", "Geschenk"].map(verlNomen),
  ["Korb", "Dieb", "Stab", "Sieb"].map(verlNomen),
);

const VERLAENGERN_HARD = verzahnen(
  [
    verlAdjektiv("wild", "wilder"), verlAdjektiv("bunt", "bunter"), verlAdjektiv("rund", "runder"),
    verlAdjektiv("kalt", "kälter"), verlAdjektiv("gesund", "gesünder"), verlAdjektiv("laut", "lauter"),
    verlAdjektiv("gelb", "gelber"), verlAdjektiv("lieb", "lieber"), verlAdjektiv("klug", "klüger"),
    verlAdjektiv("stark", "stärker"), verlAdjektiv("lang", "länger"), verlAdjektiv("krank", "kränker"),
  ],
  [
    verlVerb("er", "legen"), verlVerb("sie", "trinken"), verlVerb("er", "fragen"), verlVerb("sie", "schreiben"),
    verlVerb("er", "denken"), verlVerb("sie", "zeigen"), verlVerb("es", "kleben"), verlVerb("er", "fliegen"),
    verlVerb("sie", "winken"), verlVerb("er", "bleiben"), verlVerb("sie", "sagen"), verlVerb("er", "hupen"),
  ],
);

/* ============================================================
   9) ABC (Generator – läuft einmal beim Laden, fest über rngAusSeed)
   ============================================================ */
const ABC = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
// Wörterbuch-Wörter: kurz, die ersten zwei Buchstaben ohne Umlaut (eindeutig sortierbar).
const ABC_WOERTER = K2_WOERTER.map((e) => e.w).filter((w) => w.length <= 7 && /^[A-Z][a-z]/.test(w));
const kopf = (w) => w.slice(0, 2).toLowerCase();

/** Erzeugt den ABC-Pool. Zweimal aufrufen liefert dasselbe (fester Seed). */
export function k2AbcErzeugen() {
  const rng = rngAusSeed("k2abc");
  const zahlen = (von, bis) => Array.from({ length: bis - von + 1 }, (_, i) => von + i);
  const b = (i) => ABC[i];

  // Buchstaben-Nachbarn (i = Stelle im ABC, 0 = A)
  const nach = mischen(zahlen(0, 24), rng).slice(0, 9).map((i) => ({
    f: `Welcher Buchstabe kommt nach ${b(i)}?`, r: b(i + 1), x: [b(i > 0 ? i - 1 : i + 3), b(i + 2 <= 25 ? i + 2 : i - 2)],
    tipp: `Sag das ABC leise auf und halte bei ${b(i)} an – der nächste Buchstabe ist ${b(i + 1)}.`, typ: "abcnach", buchstabe: b(i),
  }));
  const vor = mischen(zahlen(1, 25), rng).slice(0, 7).map((i) => ({
    f: `Welcher Buchstabe kommt vor ${b(i)}?`, r: b(i - 1), x: [b(i < 25 ? i + 1 : i - 3), b(i - 2 >= 0 ? i - 2 : i + 2)],
    tipp: `Sag das ABC leise auf: Direkt vor ${b(i)} kommt ${b(i - 1)}.`, typ: "abcvor", buchstabe: b(i),
  }));
  const zwischen = mischen(zahlen(1, 24), rng).slice(0, 5).map((i) => ({
    f: `Welcher Buchstabe steht zwischen ${b(i - 1)} und ${b(i + 1)}?`, r: b(i),
    x: [b(i - 2 >= 0 ? i - 2 : i + 3), b(i + 2 <= 25 ? i + 2 : i - 3)],
    tipp: `Sag das ABC ab ${b(i - 1)} auf: ${b(i - 1)}, ${b(i)}, ${b(i + 1)}.`, typ: "abczwischen", von: b(i - 1), bis: b(i + 1),
  }));

  // Jede Dreier-Auswahl kommt im ganzen Bereich nur einmal vor.
  const benutzt = new Set();
  const neu = (woerter) => {
    const schluessel = woerter.slice().sort().join("|");
    if (benutzt.has(schluessel)) return false;
    benutzt.add(schluessel);
    return true;
  };
  // Wörter, die sich im Merkmal (1. Buchstabe bzw. die ersten zwei) unterscheiden.
  const verschiedene = (liste, merkmal, anzahl) => {
    const wahl = [];
    for (const w of mischen(liste, rng)) {
      if (!wahl.some((schon) => merkmal(schon) === merkmal(w))) wahl.push(w);
      if (wahl.length === anzahl) return wahl;
    }
    return null;
  };
  const nachKopf = (x, y) => (kopf(x) < kopf(y) ? -1 : 1);

  // Wörterbuch leicht: drei verschiedene Anfangsbuchstaben (jede Lösung beginnt anders,
  // damit nicht immer „das Wort mit A“ gewinnt)
  const zuerstLeicht = [];
  for (let versuch = 0; zuerstLeicht.length < 8 && versuch < 400; versuch++) {
    const wahl = verschiedene(ABC_WOERTER, (w) => w[0], 3);
    if (!wahl) continue;
    const [erstes, zweites, drittes] = wahl.slice().sort(nachKopf);
    if (zuerstLeicht.some((a) => a.r[0] === erstes[0]) || !neu(wahl)) continue;
    zuerstLeicht.push({
      f: `Was steht im Wörterbuch zuerst? ${wahl[0]}, ${wahl[1]}, ${wahl[2]}`, r: erstes, x: wahl.filter((w) => w !== erstes),
      tipp: `Schau auf den ersten Buchstaben: ${erstes[0]} kommt im ABC vor ${zweites[0]} und ${drittes[0]}.`, typ: "abczuerst",
    });
  }

  // Wörterbuch schwer: gleicher Anfangsbuchstabe, der zweite Buchstabe entscheidet
  const gruppenAb = (anzahl) => [...new Set(ABC_WOERTER.map((w) => w[0]))]
    .map((anfang) => ABC_WOERTER.filter((w) => w[0] === anfang))
    .filter((gruppe) => new Set(gruppe.map(kopf)).size >= anzahl);
  const gruppen = gruppenAb(3);
  const dreiGleicherAnfang = () => {
    const gruppe = gruppen[Math.floor(rng() * gruppen.length)];
    const wahl = verschiedene(gruppe, kopf, 3);
    return wahl && neu(wahl) ? wahl : null;
  };
  const zuerstSchwer = [];
  for (let versuch = 0; zuerstSchwer.length < 11 && versuch < 400; versuch++) {
    const wahl = dreiGleicherAnfang();
    if (!wahl) continue;
    const [erstes, zweites, drittes] = wahl.slice().sort(nachKopf);
    zuerstSchwer.push({
      f: `Was steht im Wörterbuch zuerst? ${wahl[0]}, ${wahl[1]}, ${wahl[2]}`, r: erstes, x: wahl.filter((w) => w !== erstes),
      tipp: `Alle fangen mit ${erstes[0]} an – der zweite Buchstabe entscheidet: ${erstes[1]} kommt vor ${zweites[1]} und ${drittes[1]}.`,
      typ: "abczuerst",
    });
  }
  const zuletztSchwer = [];
  for (let versuch = 0; zuletztSchwer.length < 6 && versuch < 400; versuch++) {
    const wahl = dreiGleicherAnfang();
    if (!wahl) continue;
    const [erstes, zweites, drittes] = wahl.slice().sort(nachKopf);
    zuletztSchwer.push({
      f: `Was steht im Wörterbuch zuletzt? ${wahl[0]}, ${wahl[1]}, ${wahl[2]}`, r: drittes, x: wahl.filter((w) => w !== drittes),
      tipp: `Alle fangen mit ${drittes[0]} an – schau auf den zweiten Buchstaben: ${drittes[1]} kommt nach ${erstes[1]} und ${zweites[1]}.`,
      typ: "abczuletzt",
    });
  }
  // Einordnen: vier Wörter mit gleichem Anfang; eine Falschantwort beginnt gleich
  // (liegt aber außerhalb), die andere beginnt mit einem anderen Buchstaben.
  const gruppenVier = gruppenAb(4);
  const dazwischen = [];
  for (let versuch = 0; dazwischen.length < 5 && versuch < 400; versuch++) {
    const gruppe = gruppenVier[Math.floor(rng() * gruppenVier.length)];
    const wahl = verschiedene(gruppe, kopf, 4);
    if (!wahl) continue;
    const sortiert = wahl.slice().sort(nachKopf);
    const vorn = dazwischen.length % 2 === 0;
    const [von, mitte, bis] = vorn ? sortiert.slice(0, 3) : sortiert.slice(1);
    const aussen = vorn ? sortiert[3] : sortiert[0];
    const fremd = mischen(ABC_WOERTER.filter((w) => w[0] !== mitte[0]), rng)[0];
    if (!neu([von, mitte, bis])) continue;
    dazwischen.push({
      f: `Welches Wort passt zwischen ${von} und ${bis}?`, r: mitte, x: [aussen, fremd],
      tipp: `Erst muss der Anfang ${mitte[0]} passen, dann der zweite Buchstabe: ${mitte[1]} liegt zwischen ${von[1]} und ${bis[1]}.`,
      typ: "abcdazwischen", von, bis,
    });
  }

  return {
    easy: verzahnen(nach, vor, zwischen, zuerstLeicht),
    hard: verzahnen(zuerstSchwer, zuletztSchwer, dazwischen),
  };
}

/* ============================================================
   10) Zusammengesetzte Nomen
   ============================================================ */
// a + b ohne Fugenbuchstaben: Falschantworten = vertauscht + anderes Wort mit gleichem Anfang.
const zusBilden = (a, bWort, anderes) => {
  const r = a + bWort.toLowerCase();
  return {
    f: `${a} + ${bWort} = ?`, sprich: `Welches Wort entsteht aus ${a} und ${bWort}?`,
    r, x: [bWort + a.toLowerCase(), anderes],
    tipp: `Setze beide Wörter zusammen – nur der erste Buchstabe bleibt groß: ${r}.`, typ: "zusbilden", a, b: bWort,
  };
};

// a + b MIT Veränderung an der Nahtstelle (2. Halbjahr).
const zusFuge = (a, bWort, r, ohneFuge, vertauscht, tipp) => ({
  f: `${a} + ${bWort} = ?`, sprich: `Welches Wort entsteht aus ${a} und ${bWort}?`,
  r, x: [ohneFuge, vertauscht], tipp, typ: "zusfuge", a, b: bWort,
});
const fugeDazu = (a, bWort, r, ohneFuge, vertauscht) => zusFuge(a, bWort, r, ohneFuge, vertauscht,
  `Sprich das Wort laut – an der Nahtstelle kommt etwas dazu: ${r}.`);

const zusTeile = (wort, a, bWort, falsch) => ({
  f: `Welche zwei Wörter stecken in ${wort}?`, r: `${a} und ${bWort}`, x: falsch,
  tipp: `Lies langsam und höre auf die zwei Teile: ${a} – ${bWort}.`, typ: "zusteile", wort, a, b: bWort,
});

const zusArtikel = (a, bWort) => {
  const e = nom(bWort);
  const wort = a + bWort.toLowerCase();
  return {
    f: `${a} und ${bWort} werden ${wort}. Welcher Artikel passt?`, r: e.artikel, x: andereArtikel(e.artikel),
    tipp: `Das letzte Wort bestimmt den Artikel: ${e.artikel} ${bWort} – ${e.artikel} ${wort}.`, typ: "zusartikel", a, b: bWort, wort,
  };
};

const zusBedeutung = (wort, grundwort, falsch) => {
  const e = nom(grundwort);
  return {
    f: `Was ist ${ein(e)} ${wort}?`, r: `${ein(e)} ${grundwort}`, x: falsch,
    tipp: `Das letzte Wort sagt, was es ist: ${gross(ein(e))} ${wort} ist ${ein(e)} ${grundwort}.`, typ: "zusbedeutung", wort, b: grundwort,
  };
};

const ZUSNOMEN_EASY = verzahnen(
  [
    zusBilden("Haus", "Tür", "Hausdach"), zusBilden("Apfel", "Baum", "Apfelsaft"),
    zusBilden("Fuß", "Ball", "Fußweg"), zusBilden("Hand", "Schuh", "Handtuch"),
    zusBilden("Regen", "Schirm", "Regenwurm"), zusBilden("Schnee", "Mann", "Schneeball"),
    zusBilden("Garten", "Zaun", "Gartentür"), zusBilden("Vogel", "Nest", "Vogelhaus"),
    zusBilden("Brief", "Kasten", "Brieftasche"), zusBilden("Zahn", "Bürste", "Zahnarzt"),
    zusBilden("Spiel", "Platz", "Spielzeug"), zusBilden("Butter", "Brot", "Buttermilch"),
    zusBilden("Baum", "Haus", "Baumstamm"), zusBilden("Tisch", "Bein", "Tischtuch"),
  ],
  [
    zusTeile("Handtuch", "Hand", "Tuch", ["Hand und Tasche", "Hund und Tuch"]),
    zusTeile("Schneeball", "Schnee", "Ball", ["Schnee und Mann", "Schuh und Ball"]),
    zusTeile("Regenwurm", "Regen", "Wurm", ["Regen und Wurst", "Reh und Wurm"]),
    zusTeile("Vogelhaus", "Vogel", "Haus", ["Vogel und Maus", "Vater und Haus"]),
    zusTeile("Gartentür", "Garten", "Tür", ["Garten und Tor", "Gabel und Tür"]),
    zusTeile("Eisbär", "Eis", "Bär", ["Ei und Bär", "Eis und Beere"]),
    zusTeile("Goldfisch", "Gold", "Fisch", ["Geld und Fisch", "Gold und Tisch"]),
    zusTeile("Sandburg", "Sand", "Burg", ["Sand und Berg", "Hand und Burg"]),
    zusTeile("Kuhstall", "Kuh", "Stall", ["Kuh und Ball", "Kuchen und Stall"]),
    zusTeile("Bettdecke", "Bett", "Decke", ["Bett und Dach", "Brett und Decke"]),
    zusTeile("Nachthemd", "Nacht", "Hemd", ["Nacht und Held", "Nuss und Hemd"]),
    zusTeile("Obstsalat", "Obst", "Salat", ["Obst und Saft", "Ost und Salat"]),
    zusTeile("Waldweg", "Wald", "Weg", ["Wand und Weg", "Wald und Wiese"]),
    zusTeile("Stuhlbein", "Stuhl", "Bein", ["Stuhl und Stein", "Schuh und Bein"]),
  ],
);

const ZUSNOMEN_HARD = verzahnen(
  [
    zusArtikel("Haus", "Tür"), zusArtikel("Hand", "Schuh"), zusArtikel("Tisch", "Lampe"),
    zusArtikel("Baum", "Haus"), zusArtikel("Garten", "Tür"), zusArtikel("Nacht", "Hemd"),
    zusArtikel("Stuhl", "Bein"), zusArtikel("Tür", "Schlüssel"), zusArtikel("Kopf", "Kissen"),
    zusArtikel("Bett", "Decke"),
  ],
  [
    fugeDazu("Sonne", "Blume", "Sonnenblume", "Sonneblume", "Blumensonne"),
    fugeDazu("Hund", "Hütte", "Hundehütte", "Hundhütte", "Hüttenhund"),
    fugeDazu("Blume", "Topf", "Blumentopf", "Blumetopf", "Topfblume"),
    fugeDazu("Kind", "Zimmer", "Kinderzimmer", "Kindzimmer", "Zimmerkind"),
    fugeDazu("Tasche", "Lampe", "Taschenlampe", "Taschelampe", "Lampentasche"),
    fugeDazu("Bild", "Buch", "Bilderbuch", "Bildbuch", "Buchbild"),
    zusFuge("Schule", "Tasche", "Schultasche", "Schuletasche", "Taschenschule",
      "Sprich das Wort laut – hier fällt das e von Schule weg: Schultasche."),
    fugeDazu("Katze", "Futter", "Katzenfutter", "Katzefutter", "Futterkatze"),
    fugeDazu("Suppe", "Teller", "Suppenteller", "Suppeteller", "Tellersuppe"),
    fugeDazu("Straße", "Bahn", "Straßenbahn", "Straßebahn", "Bahnstraße"),
  ],
  [
    zusBedeutung("Apfelbaum", "Baum", ["ein Apfel", "ein Garten"]),
    zusBedeutung("Haustür", "Tür", ["ein Haus", "ein Fenster"]),
    zusBedeutung("Fußball", "Ball", ["ein Fuß", "ein Schuh"]),
    zusBedeutung("Tischlampe", "Lampe", ["ein Tisch", "ein Stuhl"]),
    zusBedeutung("Bilderbuch", "Buch", ["ein Bild", "ein Heft"]),
    zusBedeutung("Gartenzaun", "Zaun", ["ein Garten", "ein Baum"]),
  ],
);

/* ============================================================
   Pools, Bereiche, Gruppen
   ============================================================ */
export const K2_DEUTSCH_DATEN = {
  k2lesen: { easy: LESEN_EASY, hard: LESEN_HARD },
  k2nomen: { easy: NOMEN_EASY, hard: NOMEN_HARD },
  k2mehrzahl: { easy: MEHRZAHL_EASY, hard: MEHRZAHL_HARD },
  k2verben: { easy: VERBEN_EASY, hard: VERBEN_HARD },
  k2adjektive: { easy: ADJEKTIVE_EASY, hard: ADJEKTIVE_HARD },
  k2satzzeichen: { easy: SATZZEICHEN_EASY, hard: SATZZEICHEN_HARD },
  k2silben: { easy: SILBEN_EASY, hard: SILBEN_HARD },
  k2verlaengern: { easy: VERLAENGERN_EASY, hard: VERLAENGERN_HARD },
  k2abc: k2AbcErzeugen(),
  k2zusnomen: { easy: ZUSNOMEN_EASY, hard: ZUSNOMEN_HARD },
};

// Reihenfolge = Lernweg
export const K2_DEUTSCH_BEREICHE = [
  { key: "k2lesen", emoji: "📖", name: "Lesen & Verstehen" },
  { key: "k2nomen", emoji: "🏷️", name: "Nomen & Artikel" },
  { key: "k2mehrzahl", emoji: "👥", name: "Einzahl & Mehrzahl" },
  { key: "k2verben", emoji: "🏃", name: "Verben" },
  { key: "k2adjektive", emoji: "🎨", name: "Adjektive" },
  { key: "k2satzzeichen", emoji: "❓", name: "Satzzeichen" },
  { key: "k2silben", emoji: "👏", name: "Silbentrennung" },
  { key: "k2verlaengern", emoji: "🔎", name: "Verlängern" },
  { key: "k2abc", emoji: "🔤", name: "ABC" },
  { key: "k2zusnomen", emoji: "🧩", name: "Zusammengesetzte Nomen" },
];

export const K2_DEUTSCH_GRUPPEN = [
  { key: "lesen", emoji: "📖", name: "Lesen", felder: ["k2lesen"] },
  { key: "woerter", emoji: "🏷️", name: "Wörter", felder: ["k2nomen", "k2mehrzahl", "k2verben", "k2adjektive", "k2zusnomen"] },
  { key: "schreiben", emoji: "✍️", name: "Richtig schreiben", felder: ["k2verlaengern", "k2silben", "k2abc"] },
  { key: "saetze", emoji: "❓", name: "Sätze", felder: ["k2satzzeichen"] },
];
