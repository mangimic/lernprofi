/* ============================================================
   📝 VORGANGSBESCHREIBUNG – Daten und reine Logik, originalgetreu
   aus der Alt-App: 7 Abläufe (Rezepte) mit Zutaten, Stichworten,
   Beispielsätzen, Muster-Lösung (5 Schritte) und Schreib-Stichworten
   für das Arbeitsblatt; dazu die Satzanfänge und die Checklisten-
   Kriterien (Inhalt/Sprache/Form) für den Selbst-Check.
   ============================================================ */
export const SATZANFAENGE = ["Zuerst", "Anschließend", "Danach", "Nun", "Als Nächstes", "Zum Schluss"];
export const VG_MITTE = ["Anschließend", "Danach", "Nun", "Als Nächstes"];

export const REZEPTE = {
  waffel:{ name:"Waffelrezept", emoji:"🧇", titel:"Mein Waffelrezept",
    zutaten:"5 Eier, 250 g Zucker, 250 g weiche Butter, 500 g Mehl, 1 Päckchen Vanillezucker, 1 Päckchen Backpulver, 500 ml Milch, Puderzucker, Waffeleisen",
    stich:"Eier, Zucker, Butter – Schüssel – Mixer",
    beispiele:[
      "Zuerst gebe ich die Eier, den Zucker und die weiche Butter in eine Schüssel und verrühre alles mit dem Mixer.",
      "Danach füge ich die Milch hinzu und rühre alles zu einem glatten Teig.",
      "Zum Schluss lege ich die fertige Waffel auf einen Teller und bestreue sie mit Puderzucker."],
    loesung:[
      "Zuerst gebe ich 5 Eier, 250 g Zucker und 250 g weiche Butter in eine Schüssel und verrühre alles mit dem Mixer.",
      "Anschließend gebe ich 500 g Mehl, ein Päckchen Vanillezucker und ein Päckchen Backpulver dazu und vermische es.",
      "Danach füge ich 500 ml Milch hinzu und rühre alles zu einem glatten Teig.",
      "Nun gebe ich den Teig mit einem Löffel in das heiße Waffeleisen und backe die Waffeln.",
      "Zum Schluss lege ich die fertige Waffel auf einen Teller, bestreue sie mit Puderzucker und genieße sie."],
    schritte:[
      {lead:"Schritt 1", cue:"5 Eier + 250 g Zucker + 250 g weiche Butter → Schüssel → verrühren"},
      {lead:"Schritt 2", cue:"500 g Mehl + Vanillezucker + Backpulver → dazugeben → vermischen"},
      {lead:"Schritt 3", cue:"500 ml Milch → hinzufügen → zu glattem Teig verrühren"},
      {lead:"Schritt 4", cue:"Teig mit Löffel → ins Waffeleisen → backen"},
      {lead:"Schritt 5", cue:"Waffel → auf einen Teller → mit Puderzucker bestreuen"}
    ]},
  toast:{ name:"Toast machen", emoji:"🍞", titel:"So mache ich einen Toast",
    zutaten:"2 Scheiben Toastbrot, Butter, Toaster, Messer, Teller",
    stich:"Brot – Toaster – warten",
    beispiele:[
      "Zuerst nehme ich zwei Scheiben Toastbrot aus der Packung und stecke sie in den Toaster.",
      "Anschließend schalte ich den Toaster ein und warte, bis das Brot goldbraun ist.",
      "Zum Schluss bestreiche ich den fertigen Toast mit Butter."],
    loesung:[
      "Zuerst nehme ich zwei Scheiben Toastbrot aus der Packung.",
      "Anschließend stecke ich die Scheiben in den Toaster.",
      "Danach schalte ich den Toaster ein und warte, bis das Brot goldbraun ist.",
      "Nun nehme ich den fertigen Toast vorsichtig heraus.",
      "Zum Schluss bestreiche ich den Toast mit Butter und esse ihn."],
    schritte:[
      {lead:"Schritt 1", cue:"2 Scheiben Toastbrot → aus der Packung nehmen"},
      {lead:"Schritt 2", cue:"Scheiben → in den Toaster stecken"},
      {lead:"Schritt 3", cue:"Toaster → einschalten → warten"},
      {lead:"Schritt 4", cue:"fertigen Toast → herausnehmen"},
      {lead:"Schritt 5", cue:"Toast → mit Butter bestreichen → essen"}
    ]},
  flieger:{ name:"Papierflieger basteln", emoji:"✈️", titel:"So bastle ich einen Papierflieger",
    zutaten:"1 rechteckiges Blatt Papier",
    stich:"Papier – Mitte – falten",
    beispiele:[
      "Zuerst lege ich ein Blatt Papier vor mich auf den Tisch und falte es in der Mitte.",
      "Danach falte ich die beiden oberen Ecken zur Mittellinie.",
      "Zum Schluss werfe ich meinen fertigen Papierflieger."],
    loesung:[
      "Zuerst lege ich ein rechteckiges Blatt Papier vor mich auf den Tisch.",
      "Anschließend falte ich das Blatt in der Mitte und öffne es wieder.",
      "Danach falte ich die beiden oberen Ecken zur Mittellinie.",
      "Nun klappe ich das Papier zusammen und falte die Flügel nach unten.",
      "Zum Schluss nehme ich den fertigen Papierflieger und werfe ihn."],
    schritte:[
      {lead:"Schritt 1", cue:"Blatt Papier → auf den Tisch legen"},
      {lead:"Schritt 2", cue:"Blatt → in der Mitte falten → wieder öffnen"},
      {lead:"Schritt 3", cue:"obere Ecken → zur Mittellinie falten"},
      {lead:"Schritt 4", cue:"zusammenklappen → Flügel nach unten falten"},
      {lead:"Schritt 5", cue:"Flieger → nehmen → werfen"}
    ]},
  fahrrad:{ name:"Fahrrad putzen", emoji:"🚲", titel:"So putze ich mein Fahrrad",
    zutaten:"Eimer, warmes Wasser, Seife, Lappen, trockenes Tuch",
    stich:"Eimer – Wasser – Lappen",
    beispiele:[
      "Zuerst hole ich einen Eimer mit warmem Wasser und etwas Seife.",
      "Anschließend wische ich den Rahmen mit einem nassen Lappen sauber.",
      "Zum Schluss reibe ich das Fahrrad mit einem trockenen Tuch trocken."],
    loesung:[
      "Zuerst hole ich einen Eimer mit warmem Wasser und etwas Seife.",
      "Anschließend tauche ich einen Lappen in das Wasser und wringe ihn aus.",
      "Danach wische ich den Rahmen des Fahrrads mit dem Lappen sauber.",
      "Nun putze ich die Räder und die Kette vorsichtig.",
      "Zum Schluss reibe ich das Fahrrad mit einem trockenen Tuch trocken."],
    schritte:[
      {lead:"Schritt 1", cue:"Eimer → mit warmem Wasser + Seife → holen"},
      {lead:"Schritt 2", cue:"Lappen → ins Wasser tauchen → auswringen"},
      {lead:"Schritt 3", cue:"Rahmen → mit dem Lappen → sauber wischen"},
      {lead:"Schritt 4", cue:"Räder + Kette → vorsichtig putzen"},
      {lead:"Schritt 5", cue:"Fahrrad → mit trockenem Tuch → trocken reiben"}
    ]},
  angeln:{ name:"Mein Angeltag", emoji:"🎣", titel:"Mein Angeltag am See",
    zutaten:"Angelrute, Angelrolle mit Schnur, Haken, Pose, Köder (Wurm oder Made), Kescher, Eimer, Angelkoffer",
    stich:"Rute – Schnur – Haken",
    beispiele:[
      "Zuerst packe ich meine Angelrute, den Köder und den Kescher in die Tasche und gehe zum See.",
      "Danach befestige ich einen Wurm am Haken und werfe die Schnur ins Wasser.",
      "Zum Schluss keschere ich vorsichtig einen Hecht und schaue ihn mir genau an."],
    loesung:[
      "Zuerst packe ich meine Angelrute, den Köder und den Kescher in die Tasche und gehe zum See.",
      "Anschließend stecke ich die Rute zusammen, fädle die Schnur durch die Ringe und binde den Haken an.",
      "Danach befestige ich einen Wurm oder eine Made am Haken.",
      "Nun werfe ich die Schnur ins Wasser und beobachte ruhig die Pose.",
      "Zum Schluss keschere ich den Fisch vorsichtig und schaue mir den Hecht, Zander oder die Rotfeder genau an."],
    schritte:[
      {lead:"Schritt 1", cue:"Angelrute + Köder + Kescher → in die Tasche → zum See gehen"},
      {lead:"Schritt 2", cue:"Rute zusammenstecken → Schnur durch die Ringe → Haken anbinden"},
      {lead:"Schritt 3", cue:"Wurm oder Made → an den Haken → befestigen"},
      {lead:"Schritt 4", cue:"Schnur → ins Wasser werfen → Pose beobachten → warten"},
      {lead:"Schritt 5", cue:"Biss abwarten → Fisch (Hecht, Zander oder Rotfeder) keschern → vorsichtig ansehen"}
    ]},
  tennis:{ name:"Tennis-Aufschlag", emoji:"🎾", titel:"So mache ich einen Aufschlag",
    zutaten:"Tennisschläger, Tennisball, Tennisplatz, Turnschuhe, bequeme Kleidung",
    stich:"Ball – hochwerfen – schlagen",
    beispiele:[
      "Zuerst stelle ich mich hinter die Grundlinie und nehme meinen Schläger und einen Ball.",
      "Danach werfe ich den Ball mit der freien Hand gerade nach oben.",
      "Zum Schluss schlage ich den Ball über das Netz in das Feld."],
    loesung:[
      "Zuerst stelle ich mich hinter die Grundlinie und nehme meinen Schläger und einen Ball.",
      "Anschließend werfe ich den Ball mit der freien Hand gerade nach oben.",
      "Danach hole ich mit dem Schläger hinter dem Kopf aus.",
      "Nun treffe ich den Ball oben mit gestrecktem Arm.",
      "Zum Schluss schlage ich den Ball über das Netz in das gegnerische Feld."],
    schritte:[
      {lead:"Schritt 1", cue:"hinter die Grundlinie stellen → Schläger + Ball nehmen"},
      {lead:"Schritt 2", cue:"Ball → mit der freien Hand → gerade hochwerfen"},
      {lead:"Schritt 3", cue:"Schläger → hinter den Kopf → ausholen"},
      {lead:"Schritt 4", cue:"Ball oben → mit gestrecktem Arm → treffen"},
      {lead:"Schritt 5", cue:"Ball → über das Netz → ins Feld schlagen"}
    ]},
  fussball:{ name:"Elfmeter schießen", emoji:"⚽", titel:"So schieße ich einen Elfmeter",
    zutaten:"Fußball, Fußballschuhe, Tor, Elfmeterpunkt",
    stich:"Ball – Punkt – schießen",
    beispiele:[
      "Zuerst lege ich den Ball genau auf den Elfmeterpunkt.",
      "Danach gehe ich ein paar Schritte zurück und suche mir eine Ecke aus.",
      "Zum Schluss schieße ich den Ball fest in die Ecke."],
    loesung:[
      "Zuerst lege ich den Ball genau auf den Elfmeterpunkt.",
      "Anschließend gehe ich ein paar Schritte zurück.",
      "Danach suche ich mir eine Ecke im Tor aus.",
      "Nun laufe ich an und ziele mit dem Fuß.",
      "Zum Schluss schieße ich den Ball fest in die Ecke."],
    schritte:[
      {lead:"Schritt 1", cue:"Ball → auf den Elfmeterpunkt → legen"},
      {lead:"Schritt 2", cue:"ein paar Schritte → zurückgehen"},
      {lead:"Schritt 3", cue:"eine Ecke im Tor → aussuchen"},
      {lead:"Schritt 4", cue:"anlaufen → mit dem Fuß → zielen"},
      {lead:"Schritt 5", cue:"Ball → fest → in die Ecke schießen"}
    ]}
};

export const KRIT_INHALT = [
  "Habe ich eine passende Überschrift gefunden?",
  "Habe ich alle Zutaten und Hilfsmittel aufgelistet?",
  "Habe ich alle Schritte verständlich und genau aufgeschrieben?",
  "Habe ich die Schritte in der richtigen Reihenfolge beschrieben?"
];
export const KRIT_SPRACHE = [
  "Habe ich in der Gegenwart (Präsens) geschrieben?",
  "Habe ich vollständige Sätze geschrieben?",
  "Habe ich abwechslungsreiche Satzanfänge benutzt?",
  "Habe ich durchgängig die Ich-Form benutzt?"
];
export const KRIT_FORM = [
  "Ich habe gut lesbar und ordentlich geschrieben.",
  "Ich habe die Satzanfänge groß geschrieben.",
  "Ich habe die Sätze mit einem Punkt beendet.",
  "Ich habe meinen Text noch einmal durchgelesen."
];

/** Entfernt den Satzanfang am Satzbeginn („Zuerst gebe ich …" → „gebe ich …"). */
export function vgStrip(satz) {
  return satz.replace(/^Zum Schluss\s+/, "").replace(/^(Zuerst|Anschließend|Danach|Nun|Als Nächstes)\s+/, "");
}

/** Zutaten als Liste. */
export function zutatenListe(r) {
  return r.zutaten.split(",").map((z) => z.trim()).filter(Boolean);
}

/** Satzanfang-Frage: Antwortmöglichkeiten für Schritt i (ungemischt). */
export function anfangOptionen(i) {
  return ["Zuerst", VG_MITTE[i % VG_MITTE.length], VG_MITTE[(i + 2) % VG_MITTE.length], "Zum Schluss"]
    .filter((v, ix, a) => a.indexOf(v) === ix);
}

/** Passt der Satzanfang zu Schritt i (von total)? Start=Zuerst, Ende=Zum Schluss, Mitte=VG_MITTE. */
export function anfangRichtig(wort, i, total) {
  if (i === 0) return wort === "Zuerst";
  if (i === total - 1) return wort === "Zum Schluss";
  return VG_MITTE.includes(wort);
}

/** Datenqualität (für Tests). */
export function vorgangGesund() {
  return Object.values(REZEPTE).every((r) =>
    r.name && r.emoji && r.titel && r.zutaten && r.stich
    && r.beispiele.length >= 3 && r.loesung.length === 5 && r.schritte.length === 5
    && r.loesung[0].startsWith("Zuerst") && r.loesung[4].startsWith("Zum Schluss")
    && r.schritte.every((s) => s.lead && s.cue));
}
