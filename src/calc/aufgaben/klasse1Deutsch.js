/* ============================================================
   🔤 DEUTSCH KLASSE 1 (Bildungsplan BW: Laute, Silben, erstes Lesen)
   Die Kinder können noch kaum lesen – darum trägt JEDE Aufgabe ein
   `sprich` (Vorlesetext). Antworten sind einzelne Buchstaben, kurze
   lautgetreue Wörter oder sehr kurze Sätze.
   Format wie alle Pools: MC mit 2 Distraktoren, Tipp = der Weg.
   easy = 1. Halbjahr (klare Laute, kurze Wörter),
   hard = 2. Halbjahr (Sch/St/Sp/Ei/Au/Eu/Pf/Z, lange Wörter, Sätze).
   Alles hängt an EINER Wortliste (`K1_WOERTER`): Silbenzahl, Anlaut
   und Bild kommen von dort – der Test rechnet sie eigenständig nach.
   Distraktoren sind typische Verwechslungen (b/d, m/n, ähnliche
   Wortbilder, Reim statt Anlaut), nie Unsinn.
   ============================================================ */
import { rngAusSeed, mischen } from "../rng.js";

// Kurzschreiber Wortliste: Silben mit Bindestrich notiert („Ba-na-ne“).
const n = (wort, artikel, silben, bild) => ({ w: wort, artikel, silben: silben.split("-"), bild });

/** Bild-Wörter der Klasse 1: nur Nomen mit eindeutigem, gut erkennbarem Emoji. */
export const K1_WOERTER = [
  n("Affe", "der", "Af-fe", "🐒"), n("Ameise", "die", "A-mei-se", "🐜"), n("Ampel", "die", "Am-pel", "🚦"),
  n("Ananas", "die", "A-na-nas", "🍍"), n("Apfel", "der", "Ap-fel", "🍎"), n("Auge", "das", "Au-ge", "👁️"),
  n("Auto", "das", "Au-to", "🚗"),
  n("Ball", "der", "Ball", "⚽"), n("Banane", "die", "Ba-na-ne", "🍌"), n("Baum", "der", "Baum", "🌳"),
  n("Bär", "der", "Bär", "🐻"), n("Besen", "der", "Be-sen", "🧹"), n("Bett", "das", "Bett", "🛏️"),
  n("Biene", "die", "Bie-ne", "🐝"), n("Birne", "die", "Bir-ne", "🍐"), n("Blume", "die", "Blu-me", "🌼"),
  n("Brezel", "die", "Bre-zel", "🥨"), n("Brille", "die", "Bril-le", "👓"), n("Brot", "das", "Brot", "🍞"),
  n("Buch", "das", "Buch", "📕"), n("Bus", "der", "Bus", "🚌"),
  n("Delfin", "der", "Del-fin", "🐬"), n("Dino", "der", "Di-no", "🦕"), n("Dose", "die", "Do-se", "🥫"),
  n("Drache", "der", "Dra-che", "🐉"),
  n("Ei", "das", "Ei", "🥚"), n("Eimer", "der", "Ei-mer", "🪣"), n("Eis", "das", "Eis", "🍦"),
  n("Elefant", "der", "E-le-fant", "🐘"), n("Engel", "der", "En-gel", "👼"), n("Ente", "die", "En-te", "🦆"),
  n("Erdbeere", "die", "Erd-bee-re", "🍓"), n("Eule", "die", "Eu-le", "🦉"),
  n("Fahrrad", "das", "Fahr-rad", "🚲"), n("Feder", "die", "Fe-der", "🪶"), n("Feuer", "das", "Feu-er", "🔥"),
  n("Fisch", "der", "Fisch", "🐟"), n("Flugzeug", "das", "Flug-zeug", "✈️"), n("Frosch", "der", "Frosch", "🐸"),
  n("Fuchs", "der", "Fuchs", "🦊"), n("Fuß", "der", "Fuß", "🦶"),
  n("Geschenk", "das", "Ge-schenk", "🎁"), n("Giraffe", "die", "Gi-raf-fe", "🦒"), n("Gitarre", "die", "Gi-tar-re", "🎸"),
  n("Glocke", "die", "Glo-cke", "🔔"), n("Gurke", "die", "Gur-ke", "🥒"),
  n("Hammer", "der", "Ham-mer", "🔨"), n("Hand", "die", "Hand", "✋"), n("Hase", "der", "Ha-se", "🐰"),
  n("Haus", "das", "Haus", "🏠"), n("Herz", "das", "Herz", "❤️"), n("Hose", "die", "Ho-se", "👖"),
  n("Hund", "der", "Hund", "🐶"), n("Hut", "der", "Hut", "🎩"),
  n("Igel", "der", "I-gel", "🦔"), n("Insel", "die", "In-sel", "🏝️"),
  n("Jacke", "die", "Ja-cke", "🧥"),
  n("Kaktus", "der", "Kak-tus", "🌵"), n("Kamel", "das", "Ka-mel", "🐪"), n("Kartoffel", "die", "Kar-tof-fel", "🥔"),
  n("Käse", "der", "Kä-se", "🧀"), n("Katze", "die", "Kat-ze", "🐱"), n("Kerze", "die", "Ker-ze", "🕯️"),
  n("Kirsche", "die", "Kir-sche", "🍒"), n("Kiwi", "die", "Ki-wi", "🥝"), n("Kleid", "das", "Kleid", "👗"),
  n("Koffer", "der", "Kof-fer", "🧳"), n("Krankenwagen", "der", "Kran-ken-wa-gen", "🚑"),
  n("Krokodil", "das", "Kro-ko-dil", "🐊"), n("Krone", "die", "Kro-ne", "👑"), n("Kuh", "die", "Kuh", "🐄"),
  n("Lama", "das", "La-ma", "🦙"), n("Leiter", "die", "Lei-ter", "🪜"), n("Löffel", "der", "Löf-fel", "🥄"),
  n("Löwe", "der", "Lö-we", "🦁"), n("Lupe", "die", "Lu-pe", "🔍"),
  n("Mais", "der", "Mais", "🌽"), n("Maus", "die", "Maus", "🐭"), n("Melone", "die", "Me-lo-ne", "🍉"),
  n("Messer", "das", "Mes-ser", "🔪"), n("Milch", "die", "Milch", "🥛"), n("Mond", "der", "Mond", "🌙"),
  n("Mund", "der", "Mund", "👄"),
  n("Nase", "die", "Na-se", "👃"), n("Nashorn", "das", "Nas-horn", "🦏"),
  n("Ohr", "das", "Ohr", "👂"), n("Oma", "die", "O-ma", "👵"), n("Opa", "der", "O-pa", "👴"),
  n("Palme", "die", "Pal-me", "🌴"), n("Panda", "der", "Pan-da", "🐼"), n("Papagei", "der", "Pa-pa-gei", "🦜"),
  n("Pfau", "der", "Pfau", "🦚"), n("Pferd", "das", "Pferd", "🐴"), n("Pfirsich", "der", "Pfir-sich", "🍑"),
  n("Pilz", "der", "Pilz", "🍄"), n("Pinguin", "der", "Pin-gu-in", "🐧"), n("Pinsel", "der", "Pin-sel", "🖌️"),
  n("Pizza", "die", "Piz-za", "🍕"),
  n("Quadrat", "das", "Qua-drat", "🟦"),
  n("Rakete", "die", "Ra-ke-te", "🚀"), n("Raupe", "die", "Rau-pe", "🐛"), n("Regenbogen", "der", "Re-gen-bo-gen", "🌈"),
  n("Ring", "der", "Ring", "💍"), n("Roboter", "der", "Ro-bo-ter", "🤖"), n("Rose", "die", "Ro-se", "🌹"),
  n("Salat", "der", "Sa-lat", "🥗"), n("Schaf", "das", "Schaf", "🐑"), n("Schere", "die", "Sche-re", "✂️"),
  n("Schiff", "das", "Schiff", "🚢"), n("Schildkröte", "die", "Schild-krö-te", "🐢"), n("Schlange", "die", "Schlan-ge", "🐍"),
  n("Schlüssel", "der", "Schlüs-sel", "🔑"), n("Schmetterling", "der", "Schmet-ter-ling", "🦋"),
  n("Schnecke", "die", "Schne-cke", "🐌"), n("Schokolade", "die", "Scho-ko-la-de", "🍫"), n("Schuh", "der", "Schuh", "👟"),
  n("Schwein", "das", "Schwein", "🐷"), n("Sofa", "das", "So-fa", "🛋️"), n("Sonne", "die", "Son-ne", "☀️"),
  n("Sonnenblume", "die", "Son-nen-blu-me", "🌻"), n("Spinne", "die", "Spin-ne", "🕷️"), n("Stern", "der", "Stern", "⭐"),
  n("Stift", "der", "Stift", "✏️"), n("Stuhl", "der", "Stuhl", "🪑"),
  n("Tasche", "die", "Ta-sche", "👜"), n("Telefon", "das", "Te-le-fon", "☎️"), n("Tiger", "der", "Ti-ger", "🐯"),
  n("Tomate", "die", "To-ma-te", "🍅"), n("Torte", "die", "Tor-te", "🎂"), n("Trommel", "die", "Trom-mel", "🥁"),
  n("Trompete", "die", "Trom-pe-te", "🎺"), n("Tulpe", "die", "Tul-pe", "🌷"), n("Tür", "die", "Tür", "🚪"),
  n("Uhr", "die", "Uhr", "🕒"),
  n("Vogel", "der", "Vo-gel", "🐦"), n("Vulkan", "der", "Vul-kan", "🌋"),
  n("Wal", "der", "Wal", "🐳"), n("Wolf", "der", "Wolf", "🐺"), n("Wolke", "die", "Wol-ke", "☁️"),
  n("Würfel", "der", "Wür-fel", "🎲"), n("Wurm", "der", "Wurm", "🪱"),
  n("Zahn", "der", "Zahn", "🦷"), n("Zebra", "das", "Ze-bra", "🦓"), n("Zelt", "das", "Zelt", "⛺"),
  n("Ziege", "die", "Zie-ge", "🐐"), n("Zitrone", "die", "Zi-tro-ne", "🍋"), n("Zug", "der", "Zug", "🚆"),
  n("Zwiebel", "die", "Zwie-bel", "🧅"),
];

/** Reimfamilien: alle Wörter einer Familie enden gleich (ab dem betonten Selbstlaut).
    Bewusst nur gleich GESCHRIEBENE Reime – so sieht und hört das Kind dasselbe. */
export const K1_REIMFAMILIEN = [
  { endung: "aus", woerter: ["Haus", "Maus", "Laus", "raus"] },
  { endung: "und", woerter: ["Hund", "Mund", "rund", "gesund"] },
  { endung: "and", woerter: ["Hand", "Sand", "Wand", "Land", "Band"] },
  { endung: "ose", woerter: ["Hose", "Rose", "Dose"] },
  { endung: "ase", woerter: ["Nase", "Hase", "Vase"] },
  { endung: "isch", woerter: ["Fisch", "Tisch", "frisch"] },
  { endung: "opf", woerter: ["Kopf", "Topf", "Zopf", "Knopf"] },
  { endung: "aum", woerter: ["Baum", "Traum", "Raum", "Schaum"] },
  { endung: "ein", woerter: ["Bein", "Stein", "Schwein", "klein", "fein"] },
  { endung: "uh", woerter: ["Kuh", "Schuh"] },
  { endung: "all", woerter: ["Ball", "Stall", "Fall", "Knall"] },
  { endung: "ett", woerter: ["Bett", "Brett", "nett"] },
  { endung: "ahn", woerter: ["Zahn", "Hahn", "Bahn", "Kahn"] },
  { endung: "ing", woerter: ["Ring", "Ding"] },
  { endung: "anne", woerter: ["Kanne", "Tanne", "Wanne", "Pfanne"] },
  { endung: "onne", woerter: ["Sonne", "Tonne"] },
  { endung: "atze", woerter: ["Katze", "Tatze", "Matratze"] },
  { endung: "ern", woerter: ["Stern", "Kern", "gern", "fern"] },
  { endung: "urm", woerter: ["Wurm", "Turm", "Sturm"] },
  { endung: "ut", woerter: ["Hut", "Mut", "gut", "Wut"] },
  { endung: "uch", woerter: ["Buch", "Tuch"] },
  { endung: "ecke", woerter: ["Schnecke", "Hecke", "Decke", "Ecke"] },
  { endung: "ocke", woerter: ["Glocke", "Socke", "Locke", "Flocke"] },
  { endung: "ange", woerter: ["Schlange", "Zange", "Stange", "Wange"] },
  { endung: "ei", woerter: ["Ei", "zwei", "drei", "Brei", "frei"] },
  { endung: "eis", woerter: ["Eis", "Reis", "Kreis", "Preis"] },
  { endung: "ee", woerter: ["See", "Tee", "Schnee", "Fee"] },
  { endung: "al", woerter: ["Wal", "Tal", "Schal"] },
  { endung: "acht", woerter: ["Nacht", "acht", "lacht", "gelacht"] },
  { endung: "icht", woerter: ["Licht", "Gesicht", "Gedicht"] },
  { endung: "arten", woerter: ["Garten", "Karten", "warten", "starten"] },
  { endung: "erg", woerter: ["Berg", "Zwerg"] },
  { endung: "iese", woerter: ["Wiese", "Riese", "diese"] },
  { endung: "iege", woerter: ["Ziege", "Fliege", "Wiege", "Liege"] },
  { endung: "eise", woerter: ["Reise", "Meise", "leise"] },
  { endung: "iene", woerter: ["Biene", "Schiene"] },
  { endung: "ach", woerter: ["Dach", "Bach", "wach", "Fach"] },
];

const VOKALE = "aeiouäöü";
const MEHRLAUT_ANFANG = ["Sch", "St", "Sp", "Pf", "Qu", "Ei", "Au", "Eu"];
const ORTE = ["am Anfang", "in der Mitte", "am Ende"];

/** Anlaut wie in der Anlauttabelle: „Sch“, „St“, „Ei“ … zählen als EIN Anfang. */
export function k1Anlaut(wort) {
  return MEHRLAUT_ANFANG.find((m) => wort.startsWith(m)) || wort[0];
}

/** Baut alle Pools frisch auf – ohne Zufall von außen, also immer gleich. */
export function k1DeutschErzeugen() {
  const LISTE = new Map(K1_WOERTER.map((e) => [e.w, e]));
  const eintrag = (wort) => {
    const e = LISTE.get(wort);
    if (!e) throw new Error(`K1_WOERTER kennt „${wort}“ nicht`);
    return e;
  };
  const bildVon = (wort, anzahl = 1) => ({ art: "emoji", zeichen: eintrag(wort).bild, anzahl });
  const silbenVon = (wort) => eintrag(wort).silben;
  const familieVon = (wort) => K1_REIMFAMILIEN.find((fam) => fam.woerter.includes(wort));
  const gross = (s) => s[0].toUpperCase() + s.slice(1);
  // „Mmmaus“: den ersten Laut zum Hinhören in die Länge ziehen.
  const dehnen = (wort) => `${wort[0]}${wort[0].toLowerCase().repeat(2)}${wort.slice(1)}`;
  // „F-i-sch“: ein Wort in seine Laute zerlegen (Sch, ch, Ei, Au, St … bleiben zusammen).
  const lautieren = (wort) => wort.match(/^st|^sp|sch|ch|ck|ei|ie|au|eu|äu|pf|qu|ll|ff|tt|ss|mm|nn|[aeiouäöü]h|./gi).join("-");

  /* ---------- 1) Anlaute ---------- */
  // Kurzschreiber: `hilfe` ohne Leerzeichen = Merkwort mit gleichem Anlaut,
  // mit Leerzeichen = fertiger Tipp-Satz, ohne `hilfe` = gedehnter Anfang.
  const an = (wort, x, hilfe) => {
    const r = k1Anlaut(wort);
    const tipp = !hilfe ? `Zieh den Anfang ganz lang: ${dehnen(wort)} – vorne hörst du ein ${r}.`
      : hilfe.includes(" ") ? hilfe
        : `Sprich beide Wörter langsam: ${wort} fängt an wie ${hilfe} – mit ${r}.`;
    return { f: "Mit welchem Laut fängt das Wort an?", r, x, tipp, sprich: `Mit welchem Laut fängt ${wort} an?`, bild: bildVon(wort), wort };
  };
  // St/Sp: Man hört „Scht“/„Schp“ – gefragt ist darum die Schreibung des Anfangs.
  const anSt = (wort, x) => {
    const r = k1Anlaut(wort);
    return {
      f: "Mit welchen Buchstaben fängt das Wort an?", r, x,
      tipp: `Du hörst vorne „Sch${r[1].toLowerCase()}“, aber am Wortanfang schreiben wir immer ${r}.`,
      sprich: `Mit welchen Buchstaben schreibst du den Anfang von ${wort}?`, bild: bildVon(wort), wort,
    };
  };
  const sch = (merk) => `Vorne zischt es wie bei ${merk}: Sch sind drei Buchstaben, aber nur ein Laut.`;
  const zett = (merk) => `Das Z klingt wie t und s ganz schnell hintereinander – wie bei ${merk}.`;
  const doppel = (laut, merk) => `${laut} ist ein Doppellaut: Zwei Buchstaben klingen zusammen, wie bei ${merk}.`;
  const pf = (merk) => `Sprich deutlich wie bei ${merk}: erst das P und gleich danach das f – zusammen Pf.`;
  const zwei = (laut, danach) => `Hör ganz genau auf den allerersten Laut: Vorne steht ${laut}, erst danach kommt das ${danach}.`;

  const k1anlaut = {
    easy: [
      an("Maus", ["N", "S"]), an("Mond", ["N", "O"]),
      an("Affe", ["E", "F"]), an("Ampel", ["O", "M"]), an("Ananas", ["O", "N"]),
      an("Lama", ["R", "M"]), an("Lupe", ["R", "P"]),
      an("Oma", ["A", "M"]), an("Opa", ["U", "P"]),
      an("Sonne", ["Z", "N"]), an("Sofa", ["Z", "F"]), an("Salat", ["Z", "L"]),
      an("Fisch", ["W", "Sch"]), an("Feder", ["W", "D"]),
      an("Rose", ["L", "S"]), an("Rakete", ["L", "K"]), an("Roboter", ["L", "B"]),
      an("Tiger", ["D", "G"], "Tomate"), an("Tomate", ["D", "M"], "Tiger"),
      an("Nase", ["M", "S"]),
      an("Igel", ["E", "L"]), an("Insel", ["E", "N"]),
      an("Ente", ["I", "N"]), an("Elefant", ["I", "L"]),
      an("Uhr", ["O", "R"]),
      an("Hase", ["A", "S"], "Hund"), an("Hut", ["U", "T"], "Hase"),
      an("Banane", ["P", "D"], "Ball"), an("Dino", ["B", "T"], "Dose"),
      an("Kiwi", ["G", "W"], "Katze"), an("Wal", ["F", "L"]), an("Palme", ["B", "L"], "Pizza"),
    ],
    hard: [
      an("Schaf", ["S", "Ch"], sch("Schuh")), an("Schere", ["S", "Ch"], sch("Schaf")),
      an("Schiff", ["S", "Ch"], sch("Schere")), an("Schuh", ["S", "Ch"], sch("Schiff")),
      an("Schlange", ["S", "L"], sch("Schnecke")), an("Schnecke", ["Ch", "N"], sch("Schlange")),
      an("Schwein", ["S", "W"], sch("Schaf")),
      anSt("Stern", ["Scht", "Sp"]), anSt("Stuhl", ["Scht", "Sch"]), anSt("Stift", ["Sp", "Sch"]),
      anSt("Spinne", ["Schp", "St"]),
      an("Eis", ["Ie", "Eu"], doppel("Ei", "Eimer")), an("Eimer", ["Ie", "Au"], doppel("Ei", "Eis")),
      an("Auto", ["Ei", "Eu"], doppel("Au", "Auge")), an("Auge", ["Ei", "O"], doppel("Au", "Auto")),
      an("Eule", ["Ei", "Au"], doppel("Eu", "Feuer")),
      an("Quadrat", ["K", "W"], "Qu klingt wie k und w zusammen – und nach dem Q kommt immer ein u."),
      an("Pferd", ["F", "P"], pf("Pfau")), an("Pfau", ["F", "P"], pf("Pferd")), an("Pfirsich", ["F", "P"], pf("Pferd")),
      an("Zebra", ["S", "T"], zett("Zahn")), an("Zahn", ["S", "Sch"], zett("Zebra")),
      an("Zug", ["S", "T"], zett("Zelt")), an("Zitrone", ["S", "Sch"], zett("Zug")),
      an("Zelt", ["S", "D"], zett("Zahn")), an("Zwiebel", ["S", "W"], zett("Zebra")),
      an("Brot", ["P", "R"], zwei("B", "r")), an("Drache", ["T", "R"], zwei("D", "r")),
      an("Glocke", ["K", "L"], zwei("G", "l")), an("Krone", ["G", "R"], zwei("K", "r")),
      an("Blume", ["P", "L"], zwei("B", "l")), an("Trommel", ["D", "R"], zwei("T", "r")),
    ],
  };

  /* ---------- 2) Laute hören ---------- */
  // „Wo hörst du das O in Rose?“ – der Laut kommt im Wort genau EINMAL vor.
  const wo = (wort, laut) => {
    const klein = wort.toLowerCase(), l = laut.toLowerCase();
    const i = klein.indexOf(l);
    if (i < 0 || klein.indexOf(l, i + 1) >= 0) throw new Error(`„${laut}“ muss in „${wort}“ genau einmal stehen`);
    const ort = i === 0 ? 0 : i + l.length === klein.length ? 2 : 1;
    const tipp = [
      `Sprich ${wort} ganz langsam: Das ${laut} kommt gleich als Erstes.`,
      `Sprich ${wort} ganz langsam: Das ${laut} steckt mittendrin, nicht vorne und nicht hinten.`,
      `Sprich ${wort} ganz langsam: Das ${laut} hörst du erst ganz zum Schluss.`,
    ][ort];
    const f = laut.length > 1 ? `Wo hörst du den Laut ${laut} in ${wort}?` : `Wo hörst du das ${laut} in ${wort}?`;
    return { f, r: ORTE[ort], x: ORTE.filter((_, k) => k !== ort), tipp, sprich: f, bild: bildVon(wort), wort, laut };
  };
  // „In welchem Wort hörst du ein O?“ – nur EIN Wort enthält den Laut.
  const hat = (laut, r, x) => {
    const f = `In welchem Wort hörst du ein ${laut}?`;
    return { f, r, x, tipp: `Sprich alle drei Wörter langsam und horche: Nur in ${r} steckt ein ${laut}.`, sprich: f, laut };
  };
  // „Welches Wort fängt genauso an wie Maus?“ – Reim und Bedeutung locken auf die falsche Fährte.
  const wie = (wort, r, x) => {
    const f = `Welches Wort fängt genauso an wie ${wort}?`;
    return {
      f, r, x, tipp: `Sprich nur den Anfang: ${wort} und ${r} beginnen beide mit ${k1Anlaut(wort)}.`,
      sprich: f, bild: bildVon(wort), wort, gleicherAnlaut: true,
    };
  };
  // „Mit welchem Laut hört Bus auf?“ – nur Wörter, deren Ende man klar hört.
  const aus = (wort, r, x, tipp) => {
    const f = `Mit welchem Laut hört ${wort} auf?`;
    return {
      f, r, x, tipp: tipp || `Sprich ${wort} langsam und halte den letzten Laut fest: Am Ende hörst du ${r}.`,
      sprich: f, bild: bildVon(wort), wort, endlaut: true,
    };
  };
  // „Welchen Laut hörst du in der Mitte von Hut?“ – Wörter mit genau einem Selbstlaut.
  const mitte = (wort, x) => {
    const klein = wort.toLowerCase();
    const i = [...klein].findIndex((z) => VOKALE.includes(z));
    const r = klein[i].toUpperCase();
    const f = `Welchen Laut hörst du in der Mitte von ${wort}?`;
    return {
      f, r, x,
      tipp: `Sprich ${wort} in Zeitlupe: Zwischen ${wort.slice(0, i)} und ${gross(wort.slice(i + 1))} hörst du das ${r}.`,
      sprich: f, bild: bildVon(wort), wort, inlaut: true,
    };
  };
  // Lange und kurze Selbstlaute – nur eindeutige Wörter.
  const lang = (vokal, r, x) => {
    const f = `In welchem Wort klingt das ${vokal} lang?`;
    const i = r.toLowerCase().indexOf(vokal.toLowerCase());
    const gedehnt = r.slice(0, i + 1) + vokal.toLowerCase().repeat(2) + r.slice(i + 1);
    return { f, r, x, tipp: `Zieh das ${vokal} beim Sprechen lang: Bei ${gedehnt} klappt das, bei den anderen nicht.`, sprich: f, vokal, laenge: "lang" };
  };
  const kurz = (vokal, r, x) => {
    const f = `In welchem Wort klingt das ${vokal} kurz?`;
    return { f, r, x, tipp: `Sprich die Wörter und horche auf das ${vokal}: Bei ${r} ist es ganz kurz und schnell vorbei.`, sprich: f, vokal, laenge: "kurz" };
  };

  const k1laute = {
    easy: [
      wo("Oma", "O"), wo("Affe", "A"), wo("Igel", "I"), wo("Maus", "M"),
      wo("Rose", "O"), wo("Hut", "U"), wo("Lama", "M"), wo("Fisch", "I"),
      wo("Sofa", "A"), wo("Dino", "O"), wo("Bus", "S"), wo("Baum", "M"),
      hat("A", "Hase", ["Hose", "Rose"]), hat("O", "Mond", ["Mund", "Hund"]),
      hat("U", "Hund", ["Hand", "Wand"]), hat("I", "Fisch", ["Frosch", "Tasche"]),
      hat("E", "Bett", ["Boot", "Blatt"]), hat("M", "Lama", ["Lupe", "Nase"]),
      hat("R", "Rose", ["Hose", "Dose"]), hat("L", "Lupe", ["Hupe", "Raupe"]),
      hat("N", "Nase", ["Hase", "Vase"]),
      wie("Maus", "Mond", ["Haus", "Nase"]), wie("Affe", "Ampel", ["Banane", "Ente"]),
      wie("Sonne", "Sofa", ["Tonne", "Mond"]), wie("Rose", "Rakete", ["Hose", "Tulpe"]),
      wie("Tiger", "Tomate", ["Löwe", "Dino"]), wie("Lama", "Lupe", ["Mama", "Kamel"]),
      wie("Hase", "Hut", ["Nase", "Igel"]), wie("Fisch", "Feder", ["Tisch", "Wal"]),
      wie("Oma", "Opa", ["Mama", "Uhr"]), wie("Banane", "Ball", ["Ananas", "Palme"]),
    ],
    hard: [
      aus("Bus", "S", ["B", "U"]), aus("Hut", "T", ["H", "D"]), aus("Wal", "L", ["W", "N"]),
      aus("Baum", "M", ["B", "N"]), aus("Zahn", "N", ["Z", "M"]), aus("Schaf", "F", ["Sch", "W"]),
      aus("Fisch", "Sch", ["F", "S"]), aus("Buch", "Ch", ["B", "Sch"]), aus("Sofa", "A", ["S", "O"]),
      aus("Pilz", "Z", ["P", "S"]), aus("Papagei", "Ei", ["P", "I"]),
      aus("Kuh", "U", ["H", "K"], "Das h am Ende hörst du nicht – es macht nur das U schön lang."),
      mitte("Hut", ["O", "T"]), mitte("Wal", ["O", "L"]), mitte("Bus", ["O", "S"]),
      mitte("Fisch", ["E", "Sch"]), mitte("Schaf", ["O", "F"]), mitte("Buch", ["O", "Ch"]),
      lang("A", "Hase", ["Affe", "Ball"]), lang("O", "Rose", ["Sonne", "Wolke"]),
      lang("U", "Hut", ["Hund", "Mund"]), lang("I", "Igel", ["Insel", "Fisch"]),
      kurz("A", "Katze", ["Nase", "Hase"]), kurz("O", "Frosch", ["Brot", "Hose"]),
      kurz("U", "Mund", ["Hut", "Schuh"]), kurz("I", "Fisch", ["Igel", "Tiger"]),
      wo("Tasche", "Sch"), wo("Frosch", "Sch"), wo("Maus", "Au"), wo("Pfau", "Au"),
      wo("Eimer", "Ei"), wo("Leiter", "Ei"), wo("Papagei", "Ei"), wo("Eule", "Eu"),
    ],
  };

  /* ---------- 3) Silben ---------- */
  const NACHBARN = { 1: ["2", "3"], 2: ["1", "3"], 3: ["2", "4"], 4: ["3", "2"] };
  // „Wie viele Silben hat Banane?“
  const zahl = (wort) => {
    const s = silbenVon(wort);
    const f = `Wie viele Silben hat ${wort}?`;
    const klatscher = s.length === 1 ? "nur ein Klatscher" : `das sind ${s.length} Klatscher`;
    return {
      f, r: String(s.length), x: NACHBARN[s.length],
      tipp: `Klatsche oder schwinge das Wort: ${s.join("-")} – ${klatscher}.`,
      sprich: f, bild: bildVon(wort), wort, silbenzahl: true,
    };
  };
  // „Welche Silbe fehlt? Ba-na-__“
  const fehlt = (wort, stelle, x) => {
    const s = silbenVon(wort);
    const luecke = s.map((silbe, i) => (i === stelle ? "__" : silbe)).join("-");
    const ort = stelle === 0 ? "am Anfang" : stelle === s.length - 1 ? "am Ende" : "in der Mitte";
    return {
      f: `Welche Silbe fehlt? ${luecke}`, r: s[stelle], x,
      tipp: `Sprich das Wort in Silben und klatsche dazu: ${s.join("-")}.`,
      sprich: `Das Wort heißt ${wort}. Welche Silbe fehlt ${ort}?`, bild: bildVon(wort), wort, luecke: stelle,
    };
  };
  // „To + ma + te = ?“ – Silben zusammenziehen und das Wort erlesen (ohne Bild).
  const bau = (wort, x) => {
    const s = silbenVon(wort);
    return {
      f: `${s.join(" + ")} = ?`, r: wort, x,
      tipp: `Lies die Silben der Reihe nach und zieh sie zusammen: ${s.join("-")}.`,
      sprich: `${s.join(", ")}. Welches Wort wird daraus?`, wort, bauen: true,
    };
  };
  // „Welches Wort hat 3 Silben?“ – Wortlänge und Silbenzahl sind nicht dasselbe.
  const welches = (anzahl, r, x) => {
    const einheit = anzahl === 1 ? "Silbe" : "Silben";
    const f = `Welches Wort hat ${anzahl} ${einheit}?`;
    return {
      f, r, x, tipp: `Klatsche alle drei Wörter: Nur ${silbenVon(r).join("-")} hat ${anzahl} ${einheit}.`,
      sprich: f, anzahl,
    };
  };

  const k1silben = {
    easy: [
      zahl("Hund"), zahl("Maus"), zahl("Fisch"), zahl("Ball"),
      zahl("Hase"), zahl("Oma"), zahl("Sofa"), zahl("Tiger"), zahl("Sonne"), zahl("Apfel"),
      zahl("Banane"), zahl("Tomate"), zahl("Ananas"), zahl("Rakete"), zahl("Elefant"),
      fehlt("Banane", 2, ["na", "me"]), fehlt("Tomate", 2, ["ma", "de"]),
      fehlt("Hase", 1, ["sa", "ne"]), fehlt("Rose", 1, ["so", "ze"]),
      fehlt("Sofa", 1, ["wa", "fo"]), fehlt("Oma", 1, ["na", "mo"]),
      fehlt("Lama", 0, ["Lo", "Na"]), fehlt("Tiger", 0, ["Di", "Te"]),
      fehlt("Dino", 1, ["mo", "nu"]), fehlt("Lupe", 1, ["be", "pa"]),
      fehlt("Nase", 0, ["Ma", "Ne"]), fehlt("Kiwi", 1, ["fi", "we"]),
      fehlt("Melone", 2, ["me", "no"]), fehlt("Rakete", 0, ["La", "Re"]),
    ],
    hard: [
      zahl("Schokolade"), zahl("Regenbogen"), zahl("Sonnenblume"), zahl("Krankenwagen"),
      zahl("Krokodil"), zahl("Schmetterling"), zahl("Papagei"), zahl("Erdbeere"),
      zahl("Zitrone"), zahl("Giraffe"),
      bau("Tomate", ["Tapete", "Tablette"]), bau("Banane", ["Ananas", "Badewanne"]),
      bau("Melone", ["Zitrone", "Melodie"]), bau("Rakete", ["Pakete", "Rosine"]),
      bau("Papagei", ["Papier", "Polizei"]), bau("Elefant", ["Telefon", "Element"]),
      bau("Schokolade", ["Schublade", "Marmelade"]), bau("Regenbogen", ["Regenschirm", "Regenwurm"]),
      bau("Giraffe", ["Gitarre", "Karaffe"]),
      fehlt("Schokolade", 2, ["le", "ko"]), fehlt("Krokodil", 1, ["go", "ka"]),
      fehlt("Elefant", 1, ["la", "fe"]), fehlt("Regenbogen", 2, ["do", "ba"]),
      fehlt("Papagei", 1, ["ba", "po"]), fehlt("Zitrone", 1, ["dro", "tra"]),
      fehlt("Trompete", 1, ["be", "pa"]),
      welches(1, "Schwein", ["Oma", "Igel"]), welches(2, "Auto", ["Frosch", "Tomate"]),
      welches(3, "Ananas", ["Schlange", "Brot"]), welches(4, "Schokolade", ["Schmetterling", "Schlüssel"]),
    ],
  };

  /* ---------- 4) Reime ---------- */
  const reimPaar = (a, b) => {
    const fam = familieVon(a);
    if (!fam || !fam.woerter.includes(b)) throw new Error(`„${a}“ und „${b}“ stehen in keiner gemeinsamen Reimfamilie`);
    return fam;
  };
  // „Was reimt sich auf Haus?“ – Falsch-Antworten: gleicher Anfang oder passende Bedeutung.
  const reim = (auf, r, x) => {
    const fam = reimPaar(auf, r);
    const f = `Was reimt sich auf ${auf}?`;
    return {
      f, r, x, tipp: `Sprich beide Wörter laut: ${auf} und ${r} klingen am Ende gleich – „${fam.endung}“.`,
      sprich: f, ...(LISTE.has(auf) ? { bild: bildVon(auf) } : {}), reim: { auf },
    };
  };
  // Reimpaar im kurzen Satz: Alle drei Wörter passen in den Satz, nur eines reimt sich.
  const vers = (anfang, auf, r, x) => {
    reimPaar(auf, r);
    return {
      f: `Was reimt sich? ${anfang} __.`, r, x,
      tipp: `Hör auf das Ende der Wörter: ${auf} und ${r} klingen hinten gleich, das reimt sich.`,
      sprich: `${anfang} … Welches Wort reimt sich auf ${auf}?`, reim: { auf },
    };
  };
  // „Welches Wort reimt sich nicht?“ – zwei reimen sich, eines sieht nur ähnlich aus.
  const nicht = (woerter, r) => {
    const [a, b] = woerter.filter((wort) => wort !== r);
    reimPaar(a, b);
    return {
      f: `${woerter.join(", ")}: Welches Wort reimt sich nicht?`, r, x: [a, b],
      tipp: `Sprich alle drei laut: ${a} und ${b} reimen sich, ${r} klingt am Ende anders.`,
      sprich: `${woerter.join(", ")}. Welches Wort reimt sich nicht?`, reim: { nicht: true },
    };
  };

  const k1reime = {
    easy: [
      reim("Haus", "Maus", ["Hand", "Hut"]), reim("Hund", "Mund", ["Hand", "Katze"]),
      reim("Hose", "Rose", ["Hase", "Jacke"]), reim("Nase", "Hase", ["Nest", "Ohr"]),
      reim("Fisch", "Tisch", ["Frosch", "Wal"]), reim("Baum", "Traum", ["Ball", "Blatt"]),
      reim("Hand", "Sand", ["Hund", "Fuß"]), reim("Kopf", "Topf", ["Kuh", "Hut"]),
      reim("Ball", "Stall", ["Bus", "Tor"]), reim("Bein", "Stein", ["Baum", "Fuß"]),
      reim("Kuh", "Schuh", ["Kopf", "Milch"]), reim("Zahn", "Hahn", ["Zug", "Mund"]),
      reim("Sonne", "Tonne", ["Sofa", "Mond"]), reim("Katze", "Tatze", ["Kerze", "Hund"]),
      reim("Kanne", "Tanne", ["Katze", "Tasse"]), reim("Stern", "Kern", ["Stuhl", "Mond"]),
      reim("Wurm", "Turm", ["Wolf", "Vogel"]), reim("Hut", "Mut", ["Hund", "Kopf"]),
      reim("Buch", "Tuch", ["Bus", "Heft"]), reim("Ei", "zwei", ["Eis", "Huhn"]),
      reim("Eis", "Reis", ["Ei", "Schnee"]), reim("Bett", "Brett", ["Ball", "Kissen"]),
      reim("Ring", "Ding", ["Rose", "Finger"]), reim("Dose", "Hose", ["Dino", "Topf"]),
      reim("Maus", "Laus", ["Mond", "Käse"]), reim("Mund", "rund", ["Mond", "Nase"]),
      reim("Schnecke", "Hecke", ["Schlange", "Haus"]), reim("Glocke", "Socke", ["Glas", "Kirche"]),
      reim("Wal", "Tal", ["Wald", "Meer"]), reim("See", "Tee", ["Sonne", "Boot"]),
    ],
    hard: [
      vers("Die Maus wohnt im", "Maus", "Haus", ["Loch", "Nest"]),
      vers("Der Hund hat einen", "Hund", "Mund", ["Ball", "Knochen"]),
      vers("Im Garten muss ich", "Garten", "warten", ["spielen", "graben"]),
      vers("Der Fisch liegt auf dem", "Fisch", "Tisch", ["Teller", "Boden"]),
      vers("Die Katze hebt die", "Katze", "Tatze", ["Pfote", "Nase"]),
      vers("Die Schnecke sitzt in der", "Schnecke", "Hecke", ["Wiese", "Sonne"]),
      vers("Der Zwerg wohnt auf dem", "Zwerg", "Berg", ["Baum", "Hügel"]),
      vers("Den kleinen Stern hab ich", "Stern", "gern", ["lieb", "gesehen"]),
      vers("Mitten in der Nacht hat Mia", "Nacht", "gelacht", ["geweint", "geschlafen"]),
      vers("Der Riese liegt auf der", "Riese", "Wiese", ["Bank", "Straße"]),
      vers("Die Ziege liegt in der", "Ziege", "Wiege", ["Sonne", "Hütte"]),
      vers("Das Schwein ist noch ganz", "Schwein", "klein", ["jung", "dick"]),
      vers("Die Kuh braucht einen", "Kuh", "Schuh", ["Hut", "Stall"]),
      vers("Wir machen eine Reise, ganz", "Reise", "leise", ["weit", "lange"]),
      nicht(["Hose", "Rose", "Hase"], "Hase"), nicht(["Hund", "Hand", "Mund"], "Hand"),
      nicht(["Mond", "Maus", "Haus"], "Mond"), nicht(["Frosch", "Fisch", "Tisch"], "Frosch"),
      nicht(["Kanne", "Tanne", "Tonne"], "Tonne"), nicht(["Stein", "Stern", "Bein"], "Stern"),
      nicht(["Topf", "Kopf", "Korb"], "Korb"), nicht(["Vase", "Nase", "Nest"], "Nest"),
      nicht(["Wind", "Wand", "Sand"], "Wind"), nicht(["Bach", "Buch", "Dach"], "Buch"),
      nicht(["Zunge", "Zange", "Schlange"], "Zunge"), nicht(["Schuh", "Kuh", "Kuss"], "Kuss"),
      nicht(["Licht", "Gesicht", "Geschenk"], "Geschenk"), nicht(["Birne", "Biene", "Schiene"], "Birne"),
    ],
  };

  /* ---------- 5) Wörter erlesen ---------- */
  // Bild + drei ähnlich aussehende Wörter. `sprich` nennt das Wort NICHT.
  const lies = (wort, x) => {
    const s = silbenVon(wort);
    const tipp = s.length > 1
      ? `Lies langsam Silbe für Silbe und vergleiche jeden Buchstaben: ${s.join("-")}.`
      : `Lies Laut für Laut und zieh die Laute zusammen: ${lautieren(wort)}.`;
    return { f: "Welches Wort passt zum Bild?", r: wort, x, tipp, sprich: "Welches Wort passt zum Bild?", bild: bildVon(wort) };
  };

  const k1lesen = {
    easy: [
      lies("Oma", ["Opa", "Mama"]), lies("Opa", ["Oma", "Papa"]), lies("Hut", ["Hof", "Mut"]),
      lies("Sofa", ["Mofa", "Soda"]), lies("Rose", ["Dose", "Riese"]), lies("Dose", ["Rose", "Dame"]),
      lies("Hose", ["Hase", "Rose"]), lies("Hase", ["Hose", "Nase"]), lies("Nase", ["Hase", "Name"]),
      lies("Lama", ["Mama", "Lampe"]), lies("Lupe", ["Hupe", "Lama"]), lies("Dino", ["Kino", "Dose"]),
      lies("Kiwi", ["Kino", "Kilo"]), lies("Tiger", ["Tisch", "Finger"]), lies("Tomate", ["Tapete", "Tonne"]),
      lies("Banane", ["Ananas", "Badewanne"]), lies("Ananas", ["Banane", "Ameise"]),
      lies("Mond", ["Mund", "Mode"]), lies("Mund", ["Mond", "Hund"]), lies("Hund", ["Hand", "Mund"]),
      lies("Hand", ["Hund", "Sand"]), lies("Ball", ["Bild", "Fall"]), lies("Bus", ["Bad", "Busch"]),
      lies("Wal", ["Wald", "Tal"]), lies("Igel", ["Insel", "Engel"]), lies("Ente", ["Ende", "Elfe"]),
      lies("Salat", ["Salami", "Spinat"]), lies("Ampel", ["Apfel", "Amsel"]),
    ],
    hard: [
      lies("Fisch", ["Tisch", "Frosch"]), lies("Frosch", ["Fisch", "Frost"]), lies("Schaf", ["Schal", "Schiff"]),
      lies("Schiff", ["Schaf", "Schilf"]), lies("Schuh", ["Schule", "Kuh"]), lies("Schere", ["Schale", "Scheune"]),
      lies("Schwein", ["Schwan", "Schein"]), lies("Schlange", ["Stange", "Schlinge"]),
      lies("Schnecke", ["Schnabel", "Hecke"]), lies("Buch", ["Bach", "Tuch"]), lies("Eis", ["Reis", "Ei"]),
      lies("Eule", ["Beule", "Eile"]), lies("Leiter", ["Lieder", "Leute"]), lies("Biene", ["Beine", "Birne"]),
      lies("Stern", ["Stirn", "Start"]), lies("Stuhl", ["Stahl", "Stiel"]), lies("Spinne", ["Stimme", "Spinat"]),
      lies("Baum", ["Raum", "Bauch"]), lies("Maus", ["Haus", "Mais"]), lies("Haus", ["Maus", "Hals"]),
      lies("Auto", ["Auge", "Foto"]), lies("Zwiebel", ["Zweifel", "Stiefel"]), lies("Kirsche", ["Kirche", "Kissen"]),
      lies("Kerze", ["Katze", "Kette"]), lies("Katze", ["Kerze", "Tatze"]), lies("Schlüssel", ["Schüssel", "Schlitten"]),
      lies("Zahn", ["Zaun", "Zahl"]), lies("Löwe", ["Möwe", "Löffel"]), lies("Glocke", ["Flocke", "Glucke"]),
      lies("Giraffe", ["Gitarre", "Karaffe"]), lies("Gitarre", ["Giraffe", "Gitter"]), lies("Feuer", ["Feier", "Fenster"]),
      lies("Regenbogen", ["Regenschirm", "Regenwurm"]), lies("Schokolade", ["Schublade", "Marmelade"]),
      lies("Erdbeere", ["Himbeere", "Erdnuss"]), lies("Telefon", ["Elefant", "Teleskop"]),
    ],
  };

  /* ---------- 6) Erste Sätze ---------- */
  const SATZ_TIPP = {
    wort: (wort) => `Lies in jedem Satz zuerst das Namenwort: Zum Bild passt nur der Satz mit ${wort}.`,
    farbe: () => "Lies jeden Satz bis zum letzten Wort: Namenwort und Farbe müssen beide zum Bild passen.",
    zahl: () => "Zähle zuerst die Bilder und suche dann das passende Zahlwort im Satz.",
  };
  // Bild + drei kurze Sätze: nur EIN Satz passt zum Bild.
  const satz = (wort, r, x, art = "wort", anzahl = 1) => ({
    f: "Welcher Satz passt zum Bild?", r, x, tipp: SATZ_TIPP[art](wort),
    sprich: "Welcher Satz passt zum Bild?", bild: bildVon(wort, anzahl), satz: "bild",
  });
  // „Welcher Satz ist richtig geschrieben?“ – je zwei der drei Fehlerarten:
  // Satzanfang klein, Satzzeichen fehlt, Namenwort klein.
  const FEHLER = {
    anfang: (s) => s[0].toLowerCase() + s.slice(1),
    punkt: (s) => s.slice(0, -1),
    nomen: (s, wort) => s.replace(wort, wort[0].toLowerCase() + wort.slice(1)),
  };
  const RICHTIG_TIPP = {
    "anfang+nomen": (wort) => `Achte auf die großen Buchstaben: am Satzanfang und beim Namenwort ${wort}.`,
    "anfang+punkt": () => "Achte auf zwei Dinge: Der Satzanfang ist groß und am Ende steht ein Punkt.",
    "nomen+punkt": (wort) => `Schau auf das Namenwort ${wort} und auf das Satzende: groß schreiben und Punkt setzen.`,
  };
  const richtig = (wort, r, fehler) => {
    if (!r.includes(wort)) throw new Error(`„${wort}“ fehlt im Satz „${r}“`);
    return {
      f: "Welcher Satz ist richtig geschrieben?", r, x: fehler.map((art) => FEHLER[art](r, wort)),
      tipp: RICHTIG_TIPP[fehler.slice().sort().join("+")](wort),
      sprich: "Welcher Satz ist richtig geschrieben?", bild: bildVon(wort), satz: "schreibung", fehler,
    };
  };

  const k1saetze = {
    easy: [
      satz("Hund", "Der Hund bellt.", ["Die Hand winkt.", "Der Mund lacht."]),
      satz("Oma", "Das ist Oma.", ["Das ist Opa.", "Das ist Mama."]),
      satz("Opa", "Opa ist da.", ["Oma ist da.", "Papa ist da."]),
      satz("Hut", "Das ist ein Hut.", ["Das ist ein Hund.", "Das ist ein Huhn."]),
      satz("Hase", "Das ist ein Hase.", ["Das ist eine Nase.", "Das ist eine Hose."]),
      satz("Nase", "Da ist eine Nase.", ["Da ist ein Hase.", "Da ist eine Vase."]),
      satz("Dino", "Da ist ein Dino.", ["Da ist ein Kino.", "Da ist eine Dose."]),
      satz("Sofa", "Da ist ein Sofa.", ["Da ist ein Mofa.", "Da ist eine Oma."]),
      satz("Lama", "Das ist ein Lama.", ["Das ist eine Mama.", "Das ist eine Lupe."]),
      satz("Ball", "Tom hat einen Ball.", ["Tom hat einen Bus.", "Tom hat einen Bart."]),
      satz("Bus", "Da ist der Bus.", ["Da ist der Ball.", "Da ist das Bad."]),
      satz("Mond", "Das ist der Mond.", ["Das ist der Mund.", "Das ist der Hund."]),
      satz("Hand", "Das ist eine Hand.", ["Das ist ein Hund.", "Das ist eine Wand."]),
      satz("Ananas", "Mia mag Ananas.", ["Mia mag Bananen.", "Mia mag Tomaten."]),
      satz("Pizza", "Ali mag Pizza.", ["Ali mag Pilze.", "Ali mag Salat."]),
      satz("Salat", "Lena mag Salat.", ["Lena mag Salami.", "Lena mag Tomaten."]),
      satz("Tiger", "Da ist ein Tiger.", ["Da ist ein Tisch.", "Da ist eine Tafel."]),
      satz("Löwe", "Da ist ein Löwe.", ["Da ist eine Möwe.", "Da ist ein Löffel."]),
      satz("Wal", "Das ist ein Wal.", ["Das ist ein Wald.", "Das ist eine Wand."]),
      satz("Igel", "Emma malt einen Igel.", ["Emma malt eine Insel.", "Emma malt einen Engel."]),
      satz("Ente", "Ben malt eine Ente.", ["Ben malt eine Tante.", "Ben malt eine Elfe."]),
      satz("Lupe", "Noah hat eine Lupe.", ["Noah hat eine Hupe.", "Noah hat ein Lama."]),
      satz("Rakete", "Ida malt eine Rakete.", ["Ida malt eine Tapete.", "Ida malt ein Paket."]),
      satz("Banane", "Die Banane ist gelb.", ["Die Banane ist blau.", "Die Banane ist rot."], "farbe"),
      satz("Rose", "Die Rose ist rot.", ["Die Rose ist blau.", "Die Dose ist rot."], "farbe"),
      satz("Tomate", "Die Tomate ist rot.", ["Die Tomate ist lila.", "Die Tapete ist rot."], "farbe"),
      satz("Auto", "Das Auto ist rot.", ["Das Auto ist gelb.", "Das Auge ist rot."], "farbe"),
      satz("Mund", "Der Mund ist rot.", ["Der Mond ist rot.", "Der Mund ist blau."], "farbe"),
      satz("Rose", "Da sind zwei Rosen.", ["Da ist eine Rose.", "Da sind drei Rosen."], "zahl", 2),
      satz("Dino", "Da sind drei Dinos.", ["Da sind zwei Dinos.", "Da ist ein Dino."], "zahl", 3),
      satz("Banane", "Ich sehe zwei Bananen.", ["Ich sehe drei Bananen.", "Ich sehe eine Banane."], "zahl", 2),
    ],
    hard: [
      satz("Sonne", "Die Sonne scheint.", ["Der Mond scheint.", "Der Stern leuchtet."]),
      satz("Katze", "Die Katze miaut.", ["Die Kerze brennt.", "Die Tatze ist weich."]),
      satz("Kerze", "Die Kerze brennt.", ["Die Katze rennt.", "Die Kirsche schmeckt."]),
      satz("Schlange", "Die Schlange zischt.", ["Die Stange ist lang.", "Die Schnecke kriecht."]),
      satz("Schnecke", "Die Schnecke kriecht.", ["Die Schlange zischt.", "Der Schnee ist weiß."]),
      satz("Biene", "Die Biene fliegt.", ["Die Birne schmeckt.", "Die Beine laufen."]),
      satz("Schaf", "Das Schaf frisst Gras.", ["Das Schiff fährt los.", "Der Schal ist weich."]),
      satz("Schiff", "Das Schiff schwimmt.", ["Das Schaf schläft.", "Der Schuh drückt."]),
      satz("Eule", "Die Eule ruft laut.", ["Die Beule tut weh.", "Die Ente schwimmt."]),
      satz("Stern", "Der Stern leuchtet.", ["Die Stirn ist heiß.", "Der Stein ist schwer."]),
      satz("Baum", "Der Baum ist grün.", ["Der Baum ist blau.", "Der Raum ist grün."], "farbe"),
      satz("Schwein", "Das Schwein ist rosa.", ["Das Schwein ist grün.", "Der Schwan ist weiß."], "farbe"),
      satz("Frosch", "Der Frosch ist grün.", ["Der Frosch ist rot.", "Der Fisch ist grün."], "farbe"),
      satz("Kirsche", "Die Kirschen sind rot.", ["Die Kirchen sind rot.", "Die Kirschen sind blau."], "farbe"),
      satz("Apfel", "Da sind drei Äpfel.", ["Da sind zwei Äpfel.", "Da ist ein Apfel."], "zahl", 3),
      satz("Fisch", "Ich sehe vier Fische.", ["Ich sehe drei Fische.", "Ich sehe vier Tische."], "zahl", 4),
      richtig("Hund", "Der Hund bellt.", ["anfang", "nomen"]),
      richtig("Katze", "Die Katze schläft.", ["punkt", "anfang"]),
      richtig("Maus", "Die Maus ist klein.", ["nomen", "punkt"]),
      richtig("Ball", "Tom hat einen Ball.", ["nomen", "punkt"]),
      richtig("Sonne", "Die Sonne lacht.", ["anfang", "nomen"]),
      richtig("Fisch", "Der Fisch schwimmt.", ["punkt", "nomen"]),
      richtig("Buch", "Mia liest ein Buch.", ["nomen", "anfang"]),
      richtig("Baum", "Der Baum ist hoch.", ["punkt", "anfang"]),
      richtig("Apfel", "Ich esse einen Apfel.", ["nomen", "anfang"]),
      richtig("Vogel", "Der Vogel singt.", ["punkt", "nomen"]),
      richtig("Auto", "Das Auto ist schnell.", ["anfang", "punkt"]),
      richtig("Eis", "Wir essen ein Eis.", ["nomen", "punkt"]),
      richtig("Pferd", "Das Pferd läuft schnell.", ["anfang", "nomen"]),
      richtig("Schuh", "Wo ist mein Schuh?", ["anfang", "nomen"]),
    ],
  };

  // Jede Stufe einmal fest gemischt (Seed = Bereich + Stufe): So landen in
  // jedem 10er-Paket verschiedene Aufgabenarten – und es bleibt immer gleich.
  const pools = { k1anlaut, k1laute, k1silben, k1reime, k1lesen, k1saetze };
  return Object.fromEntries(Object.entries(pools).map(([key, pool]) => [key, {
    easy: mischen(pool.easy, rngAusSeed(`${key}-easy`)),
    hard: mischen(pool.hard, rngAusSeed(`${key}-hard`)),
  }]));
}

export const K1_DEUTSCH_DATEN = k1DeutschErzeugen();

export const K1_DEUTSCH_BEREICHE = [
  { key: "k1anlaut", emoji: "🔤", name: "Anlaute" },
  { key: "k1laute", emoji: "👂", name: "Laute hören" },
  { key: "k1silben", emoji: "👏", name: "Silben" },
  { key: "k1reime", emoji: "🎵", name: "Reime" },
  { key: "k1lesen", emoji: "📖", name: "Wörter erlesen" },
  { key: "k1saetze", emoji: "💬", name: "Erste Sätze" },
];

export const K1_DEUTSCH_GRUPPEN = [
  { key: "k1hoeren", emoji: "👂", name: "Hören & Laute", felder: ["k1anlaut", "k1laute", "k1reime"] },
  { key: "k1silbenwelt", emoji: "👏", name: "Silben", felder: ["k1silben"] },
  { key: "k1leseweg", emoji: "📖", name: "Lesen", felder: ["k1lesen", "k1saetze"] },
];
