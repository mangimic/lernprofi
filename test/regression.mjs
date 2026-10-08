/* ============================================================
   Statische Regression – je Version ein Block, neueste zuerst.
   Prüft den Quelltext per Regex (keine Laufzeit). Alte Prüfungen
   werden bei Änderungen per Alternative (a|b) erweitert, nie
   gelöscht. Lauf: node test/regression.mjs → FAIL 0 Pflicht.
   ============================================================ */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const wurzel = join(dirname(fileURLToPath(import.meta.url)), "..");
const quelle = (p) => readFileSync(join(wurzel, p), "utf8");

let pass = 0;
let fail = 0;
function test(name, ok) {
  if (ok) {
    pass++;
    console.log(`  ✅ ${name}`);
  } else {
    fail++;
    console.log(`  ❌ ${name}`);
  }
}

// APP_VERSION einmal lesen; Versions-Checks prüfen „mindestens x.y.z",
// damit alte Blöcke bei jedem Bump gültig bleiben (erweitern, nie löschen).
const appVersion = (quelle("src/App.jsx").match(/APP_VERSION = "(\d+)\.(\d+)\.(\d+)"/) || [0, 0, 0, 0]).slice(1).map(Number);
function versionMindestens(v) {
  const ziel = v.split(".").map(Number);
  for (let i = 0; i < 3; i++) {
    if (appVersion[i] > ziel[i]) return true;
    if (appVersion[i] < ziel[i]) return false;
  }
  return true;
}
const releaseNoteVorhanden = (id) => JSON.parse(quelle("src/releaseNotes.json")).some((r) => r.id === id);

// ---------- v0.22: Übungs-Welt, Lehrer-Moment, Wozu-Anker ----------
console.log("== v0.22: Übungs-Welt, Lehrer-Moment, Wozu-Anker ==");
test("v0.22: APP_VERSION mindestens 0.22.0", versionMindestens("0.22.0"));
test("v0.22: rn-025 vorhanden", releaseNoteVorhanden("rn-025"));
test("v0.22: alle 7 Satz-Pools nehmen die Übungs-Welt an (Kind wählt selbst)", (() => {
  const s2 = quelle("src/calc/aufgaben/saetze.js") + quelle("src/calc/aufgaben/deutschKonverter.js");
  return ["subjektPool(thema)", "praedikatPool(thema)", "gkPool(thema)", "redePool(thema)",
    "zeitPool(thema)", "wortartenPool(thema)", "faellePool(thema)"].every((f) => s2.includes(`function ${f}`))
    && quelle("src/features/Ueben.jsx").includes("deutschDaten(thema)")
    && quelle("src/features/Ueben.jsx").includes('data-test={`thema-')
    && quelle("src/calc/migrateData.js").includes("uebungsThema");
})());
test("v0.22: Lehrer-Moment einmal pro Runde nach richtiger Antwort (aktives Erklären)", (() => {
  const u = quelle("src/features/Ueben.jsx");
  return u.includes("lehrer-moment") && u.includes("lehrer-fertig")
    && u.includes("lehrerDran") && u.includes("Math.min(4, r.aufgaben.length - 1)") && u.includes("lehrerWar")
    && u.includes("sitzt doppelt");
})());
test("v0.22: Wozu-Anker für alle Lernfelder + Zeitstrahl bei den Zeitformen", (() => {
  return quelle("src/calc/wozu.js").includes("export const WOZU")
    && quelle("src/features/Ueben.jsx").includes("wozu-anker")
    && quelle("src/features/Ueben.jsx").includes("zeit-strahl")
    && quelle("src/features/Ueben.jsx").includes("GESTERN");
})());

// ---------- v0.21: KI-Start (Erklärer + Fundament) ----------
console.log("== v0.21: KI-Start (Erklärer + Fundament) ==");
test("v0.21: APP_VERSION mindestens 0.21.0", versionMindestens("0.21.0"));
test("v0.21: rn-024 vorhanden", releaseNoteVorhanden("rn-024"));
test("v0.21: Schlüssel nur im Worker, Deckel hart im Server (402), Kosten echt gezählt", (() => {
  const k = quelle("server/_lib/kiApi.js");
  return k.includes("env.ANTHROPIC_API_KEY") && k.includes("402") && k.includes("kostenMikro")
    && k.includes("ki:monat:") && k.includes("KI_DECKEL_MAX_CENT")
    && !quelle("src/ki.js").includes("api.anthropic.com");
})());
test("v0.21: Kurzformat erzwungen (max 2 Blasen à 12 Wörter) + Wort-Wächter + Lösung geheim", (() => {
  const k = quelle("server/_lib/kiApi.js");
  return k.includes("MAX_BLASEN = 2") && k.includes("MAX_WOERTER = 12")
    && k.includes("wortProblem") && k.includes("NICHT verraten")
    && k.includes("Mach-Aufgabe");
})());
test("v0.21: Eltern-Freigabe je Zweck (Standard aus) + Deckel-Karte", (() => {
  return quelle("src/calc/migrateData.js").includes("erklaeren: ki.erklaeren === true")
    && quelle("src/features/Eltern.jsx").includes('test="eltern-ki"')
    && quelle("src/features/Eltern.jsx").includes("kiDeckelSetzen")
    && quelle("src/features/Eltern.jsx").includes("ki-verbrauch");
})());
test("v0.21: Erklärer nur bei Freigabe + falscher Antwort, getaktete Blasen, Mach-Aufgabe", (() => {
  const u = quelle("src/features/Ueben.jsx");
  return u.includes("data.einstellungen.ki.erklaeren") && u.includes("ki-erklaer-knopf")
    && u.includes("ki-blase") && u.includes("ki-mach") && u.includes("offen: k.offen + 1");
})());
test("v0.21: KI-Route vor der Tresor-Route (vaultApi beantwortet sonst alles mit 404)", (() => {
  const i = quelle("server/index.js");
  return i.indexOf("kiApi(") < i.indexOf("vaultApi(") && quelle("docs/DEPLOY-CLOUDFLARE.md").includes("wrangler secret put ANTHROPIC_API_KEY");
})());

// ---------- v0.20: Einstufungstest & Trainingsplan ----------
console.log("== v0.20: Einstufungstest & Trainingsplan ==");
test("v0.20: APP_VERSION mindestens 0.20.0", versionMindestens("0.20.0"));
test("v0.20: rn-023 vorhanden", releaseNoteVorhanden("rn-023"));
test("v0.20: adaptive Logik rein (2 leichte, bei Erfolg 2 schwere; Stufe 1/2/3)", (() => {
  const q = quelle("src/calc/einstufung.js");
  return q.includes("PRO_STUFE = 2") && q.includes("einstufungStufe")
    && q.includes("einstufungAnwenden") && q.includes("einstufungEmpfehlung")
    && q.includes("slice(0, 3)") && !/Date\.now\(|Math\.random/.test(q);
})());
test("v0.20: 6 Kern-Felder aus Deutsch und Mathe", (() => {
  const q = quelle("src/calc/einstufung.js");
  return ["gws", "dd", "zeit", "faelle", "mrechnen", "mzahlen"].every((k) => q.includes(`key: "${k}"`));
})());
test("v0.20: Test ist keine Übung (keine Münzen/Missionen) und stellt Stufen exakt ein", (() => {
  const e = quelle("src/features/Einstufung.jsx");
  return !e.includes("muenzenNachRunde") && !e.includes("aufgabenZaehlen")
    && e.includes("einstufungAnwenden") && e.includes('data-test="einstufung-uebernehmen"')
    && e.includes("Verwerfen");
})());
test("v0.20: Trainingsplan auf der Startseite mit Direkt-Knopf + 🎯-Abzeichen im Üben", (() => {
  return quelle("src/features/Start.jsx").includes('data-test="trainingsplan"')
    && quelle("src/features/Start.jsx").includes("uebenZielSetzen(key)")
    && quelle("src/features/Ueben.jsx").includes("empfehlung?.includes(b.key)")
    && quelle("src/appContext.jsx").includes("uebenZiel");
})());

// ---------- v0.19: Zahlenblöcke & Lesbarkeit ----------
console.log("== v0.19: Zahlenblöcke & Lesbarkeit ==");
test("v0.19: APP_VERSION mindestens 0.19.0", versionMindestens("0.19.0"));
test("v0.19: rn-022 vorhanden", releaseNoteVorhanden("rn-022"));
test("v0.19: Stellenwert-Aufgaben tragen Blöcke-Daten (inkl. Null-Stellen und Tausender)", (() => {
  const m = quelle("src/calc/aufgaben/mathe.js");
  return m.includes("bloecke:{h:2,z:4,e:6}") && m.includes("bloecke:{h:3,z:0,e:4}")
    && m.includes("bloecke:{t:1,h:2,z:4,e:0}") && m.includes("bloecke:{h:5,z:13,e:2}");
})());
test("v0.19: Zahlenblöcke-Grafik (Tausenderwürfel, Hunderterplatte, Zehnerstange, Einerwürfel)", (() => {
  const u = quelle("src/features/Ueben.jsx");
  return ["zbTausender", "zbHunderter", "zbZehner", "zbEiner"].every((f) => u.includes(`function ${f}`))
    && u.includes('data-test="zahlen-bloecke"') && u.includes("a.bloecke && <ZahlenBloecke");
})());
test("v0.19: kein Umbruch mitten im Wort (Spiel-Optionen nowrap, kein overflow-wrap anywhere)", (() => {
  const css = quelle("src/styles/tokens.css");
  return css.includes(".spiel-opt") && /\.spiel-opt \{[^}]*white-space: nowrap/.test(css)
    && !css.includes("overflow-wrap: anywhere")
    && quelle("src/features/Ueben.jsx").includes('whiteSpace: "nowrap"');
})());
test("v0.19: Spiele filtern Blöcke-Aufgaben aus (Grafik gibt es nur im Üben)", (() => {
  return quelle("src/spiele/fragen.js").includes("!a.bloecke");
})());

// ---------- v0.18: Tagesform & Fokus-Paket ----------
console.log("== v0.18: Tagesform & Fokus-Paket ==");
test("v0.18: APP_VERSION mindestens 0.18.0", versionMindestens("0.18.0"));
test("v0.18: rn-021 vorhanden", releaseNoteVorhanden("rn-021"));
test("v0.18: Tagesform-Logik rein (rot 3 / normal 4 / grün 5, Ziel nie unter 2)", (() => {
  const q = quelle("src/calc/tagesform.js");
  return q.includes('modus === "rot" ? 3 : modus === "gruen" ? 5 : 4')
    && q.includes("Math.max(2, ziel - 1)") && q.includes("FOKUS_SERIE_ABSTAND = 90000")
    && !/Date\.now\(|Math\.random/.test(q);
})());
test("v0.18: Tagesform-Frage als Overlay, nur für das Kind, mit Original-Wortlaut", (() => {
  const a = quelle("src/App.jsx");
  return a.includes("Wie fühlt sich Lernen heute an?") && a.includes("tf-rot")
    && a.includes("Einfach loslegen") && a.includes("!tresor.elternModus && lernRoute");
})());
test("v0.18: Bewegungspause (9 Original-Ideen, Später-Knopf = 2 Minuten Aufschub)", (() => {
  return quelle("src/calc/tagesform.js").includes("Mach 10 Hampelmänner!")
    && quelle("src/App.jsx").includes("Bewegungspause!")
    && quelle("src/appContext.jsx").includes("* 60 - 120");
})());
test("v0.18: rote Tage stoppen Stufen und verkürzen Missionen in ALLEN Zähl-Stellen", (() => {
  const u = quelle("src/features/Ueben.jsx");
  return u.includes("stufenStopp: rot") && u.includes("missionsOpts(")
    && quelle("src/features/Spielhalle.jsx").includes("missionsOpts(")
    && quelle("src/features/Konzentration.jsx").includes("missionsOpts(")
    && quelle("src/features/Vorgang.jsx").includes("missionsOpts(");
})());
test("v0.18: Fokus-Serie mit Rekord im Tresor, Anzeige in Auswertung und Elternbereich", (() => {
  return quelle("src/appContext.jsx").includes("fokusSerieWeiter")
    && quelle("src/features/Ueben.jsx").includes("fokus-serie")
    && quelle("src/features/Eltern.jsx").includes("fokus-rekord")
    && quelle("src/calc/migrateData.js").includes("fokusRekord");
})());
test("v0.18: Alt-Übernahme bringt Tagesform, Fokus-Rekord und Pausen mit", (() => {
  const i = quelle("src/calc/importAltdaten.js");
  return i.includes("alt.tagesform") && i.includes("alt.fokusRekord") && i.includes("alt.pausenIntervall");
})());

// ---------- v0.17: Eltern-Werkzeuge ----------
console.log("== v0.17: Eltern-Werkzeuge ==");
test("v0.17: APP_VERSION mindestens 0.17.0", versionMindestens("0.17.0"));
test("v0.17: rn-020 vorhanden", releaseNoteVorhanden("rn-020"));
test("v0.17: Zeitlimit-Logik rein (Stufen wie im Original, 0 = aus)", (() => {
  const q = quelle("src/calc/elternWerkzeuge.js");
  return q.includes("ZEIT_STUFEN = [0, 10, 15, 20, 30, 45, 60]")
    && q.includes("zeitAbgelaufen") && q.includes("zeitUebrigMin")
    && !/Date\.now\(|Math\.random/.test(q);
})());
test("v0.17: Stopp-Bildschirm wie im Original, Eltern-Modus bleibt frei", (() => {
  const a = quelle("src/App.jsx");
  return a.includes('data-test="zeit-sperre"') && a.includes("Deine Lernzeit für heute ist geschafft")
    && a.includes("!tresor.elternModus && zeitAbgelaufen");
})());
test("v0.17: Spiele-Schalter + Münz-Freischaltung + Geschenk im Elternbereich", (() => {
  const e = quelle("src/features/Eltern.jsx");
  return e.includes("SPIELE_SCHALTER") && e.includes("muenzen-aktiv")
    && e.includes("muenz-geschenk") && e.includes("zeit-frei")
    && quelle("src/features/Spielhalle.jsx").includes("spielAktiv(data.einstellungen")
    && quelle("src/features/Spielhalle.jsx").includes("muenzenAktiv");
})());
test("v0.17: 20 Gesprächsimpulse in 4 Bereichen mit Frage des Tages", (() => {
  const q = quelle("src/calc/elternWerkzeuge.js");
  return ["Grenzen", "Stehauf-Kraft", "Denkweise", "Probleme lösen"].every((t) => q.includes(t))
    && q.includes("gespraechDesTages")
    && quelle("src/features/Eltern.jsx").includes("gespraech-tages");
})());
test("v0.17: Zeitzähler nur bei sichtbarer App, Test-Zeitraffer vorhanden", (() => {
  const a = quelle("src/appContext.jsx");
  return a.includes("visibilityState") && a.includes("__ZEIT_SCHNELL__")
    && a.includes("zeitHeute");
})());

// ---------- v0.16: Vorgangsbeschreibung ----------
console.log("== v0.16: Vorgangsbeschreibung ==");
test("v0.16: APP_VERSION mindestens 0.16.0", versionMindestens("0.16.0"));
test("v0.16: rn-019 vorhanden", releaseNoteVorhanden("rn-019"));
test("v0.16: alle 7 Original-Abläufe in reiner calc-Logik", (() => {
  const q = quelle("src/calc/aufgaben/vorgang.js");
  return ["waffel", "toast", "flieger", "fahrrad", "angeln", "tennis", "fussball"].every((k) => q.includes(k + ":{"))
    && q.includes("Waffeleisen") && q.includes("anfangRichtig") && q.includes("vgStrip");
})());
test("v0.16: drei Übungs-Spiele + Arbeitsblatt + Lösungs-Hürde + Selbst-Check", (() => {
  const v = quelle("src/features/Vorgang.jsx");
  return v.includes("vg-tab-${") && v.includes("vg-utab-${")
    && ["ordnen", "anfang", "zutaten", "grundlagen"].every((t) => v.includes(`"${t}"`))
    && v.includes('data-test="vg-drucken"') && v.includes("tries >= 3 && geschrieben >= 3")
    && v.includes("KRIT_INHALT") && v.includes("mit der Hand");
})());
test("v0.16: Spiele belohnen (Münze + Missionen), Stand im Tresor", (() => {
  const v = quelle("src/features/Vorgang.jsx");
  return v.includes("muenzenNachRunde") && v.includes("aufgabenZaehlen")
    && quelle("src/calc/migrateData.js").includes("vorgang: null")
    && quelle("src/calc/importAltdaten.js").includes("alt.vorgang");
})());
test("v0.16: Druck blendet nur das Arbeitsblatt ein", (() => {
  const css = quelle("src/styles/tokens.css");
  return css.includes("body[data-druck] .vg-druck") && css.includes("@media print");
})());

// ---------- v0.15: Satzglieder umstellen ----------
console.log("== v0.15: Satzglieder umstellen ==");
test("v0.15: APP_VERSION mindestens 0.15.0", versionMindestens("0.15.0"));
test("v0.15: rn-018 vorhanden", releaseNoteVorhanden("rn-018"));
test("v0.15: alle 9 Original-Aufgaben (5 Umstellen + 4 Zeit/Ort) in reiner calc-Logik", (() => {
  const q = quelle("src/calc/aufgaben/satzglieder.js");
  return q.includes("SG_UM_AUFGABEN") && q.includes("umstellenPruefen")
    && q.includes('"Nico", "hat", "ein Aquarium", "im Zimmer"')
    && q.includes('"morgens", "füttert", "Opa", "auf dem Bauernhof", "die Hühner"')
    && q.includes("ort: null");
})());
test("v0.15: Regel geprüft (anders als Ausgangssatz + Prädikat an 2. Stelle)", (() => {
  const q = quelle("src/calc/aufgaben/satzglieder.js");
  return q.includes("gleich") && q.includes("folge[1] === aufgabe.verb")
    && q.includes("charAt(0).toUpperCase()");
})());
test("v0.15: Übungstyp umstellen im Üben-Bereich (Bausteine, Neu bauen, Keine da)", (() => {
  const u = quelle("src/features/Ueben.jsx");
  return u.includes('typ: "umstellen"') && u.includes('data-test="um-chip"')
    && u.includes('data-test="um-reset"') && u.includes('data-test="zo-keine"')
    && u.includes("ANDERE Reihenfolge") && u.includes("KEINE Ortsbestimmung");
})());
test("v0.15: Zeit/Ort in Schulfarben (Zeit orange, Ort grün)", (() => {
  const u = quelle("src/features/Ueben.jsx");
  return u.includes("#c77800") && u.includes("#1e6b34")
    && u.includes("#ffd9a0") && u.includes("#c9edcc");
})());

// ---------- v0.14: Schach ----------
console.log("== v0.14: Schach ==");
test("v0.14: APP_VERSION mindestens 0.14.0", versionMindestens("0.14.0"));
test("v0.14: rn-017 vorhanden", releaseNoteVorhanden("rn-017"));
test("v0.14: echte Regeln (Rochade, en passant, Umwandlung, Matt/Patt, Negamax-KI)", (() => {
  const l = quelle("src/spiele/schachLogik.js");
  return l.includes("roch: \"k\"") && l.includes("ep: true") && l.includes("umw:")
    && l.includes("schImSchach") && l.includes("Negamax") && l.includes("-1000 - t");
})());
test("v0.14: drei Bereiche (Schule, Aufgaben, Spielen) mit Tipp und Zug-Zurück", (() => {
  const u = quelle("src/spiele/schach.js");
  return u.includes('data-test="sch-tab-') && ["schule", "aufgaben", "spielen"].every((t) => u.includes(`"${t}"`))
    && u.includes("sch-tipp") && u.includes("sch-undo") && u.includes("spiel.verlauf.pop()")
    && u.includes("Der Computer denkt");
})());
test("v0.14: Brett mit Feldnummerierung a-h und 1-8 (wie im Original)", (() => {
  const u = quelle("src/spiele/schach.js");
  return u.includes("sch-kor") && u.includes("sch-kof")
    && quelle("src/styles/tokens.css").includes(".sch-brett");
})());
test("v0.14: Schach-Daten kopiert und in der Spielhalle angebunden (Münz-Gate, Missionen)", (() => {
  const d = JSON.parse(quelle("src/spiele/schach.json"));
  const s2 = quelle("src/features/Spielhalle.jsx");
  return d.lektionen.length === 6 && d.aufgaben.length === 10
    && s2.includes("schachStart") && s2.includes('data-test="spiel-schach"');
})());

// ---------- v0.13: Tennis- und Fußball-Match ----------
console.log("== v0.13: Tennis- und Fußball-Match ==");
test("v0.13: APP_VERSION mindestens 0.13.0", versionMindestens("0.13.0"));
test("v0.13: rn-016 vorhanden", releaseNoteVorhanden("rn-016"));
test("v0.13: Tennis originalgetreu (15-30-40, Entscheidungsball, 2 Gewinnspiele, Ballflug)", (() => {
  const t = quelle("src/spiele/tennisMatch.js");
  return t.includes('["0", "15", "30", "40"]') && t.includes("t.mir === 3 && t.ihm === 3")
    && t.includes("spieleMir >= 2 || t.spieleIhm >= 2") && t.includes("Math.sin(z * Math.PI) * 34")
    && t.includes("prefers-reduced-motion");
})());
test("v0.13: Fußball originalgetreu (2 Halbzeiten à 5 Chancen, Elfmeter bei Gleichstand)", (() => {
  const f = quelle("src/spiele/fussballMatch.js");
  return f.includes("FB_CHANCEN = 5") && f.includes('f.phase = "halbzeit"')
    && f.includes('f.phase = "elfmeter"') && f.includes("f.mir === f.ihm");
})());
test("v0.13: Mutmacher-Rollenspiel (sag-Blase muss angetippt werden, Rotation, kein TTS)", (() => {
  const m = quelle("src/spiele/mutmacher.js");
  return m.includes("sag es laut und tippe") && m.includes("sagBinden")
    && m.includes("[m.mut, m.punkt, m.mission]")
    && !m.includes("speechSynthesis") && !m.includes("speak(");
})());
test("v0.13: Spiel-Daten vollständig kopiert (Gegner, Fakten, Mental-Karten)", (() => {
  const t = JSON.parse(quelle("src/spiele/tennis.json"));
  const f = JSON.parse(quelle("src/spiele/fussball.json"));
  return t.gegner.length === 3 && t.mental.length === 12 && t.fakten.length === 8
    && f.gegner.length === 3 && f.mental.length === 13 && f.fakten.length === 10
    && f.mental.some((m) => m.id === "torwart") && f.mental.some((m) => m.id === "elfmeter");
})());
test("v0.13: Spielhalle bindet beide Matches an (Münz-Gate, Match-Zähler, Missionen)", (() => {
  const s2 = quelle("src/features/Spielhalle.jsx");
  return s2.includes("tennisMatchStart") && s2.includes("fussballMatchStart")
    && s2.includes('data-test="spiel-tennis"') && s2.includes('data-test="spiel-fussball"')
    && s2.includes("runden: alt.runden + 1") && s2.includes("aufgabenZaehlen(data.lernstand.lerntage, heute, ergebnis.wins");
})());
test("v0.13: Alt-Übernahme bringt die Match-Zähler mit", (() => {
  const i = quelle("src/calc/importAltdaten.js");
  return i.includes('"tennis", "fussball", "schach"');
})());

// ---------- v0.12: Konzentrations-Training & Mut-Satz ----------
console.log("== v0.12: Konzentrations-Training & Mut-Satz ==");
test("v0.12: APP_VERSION mindestens 0.12.0", versionMindestens("0.12.0"));
test("v0.12: rn-015 vorhanden", releaseNoteVorhanden("rn-015"));
test("v0.12: alle drei Trainings originalgetreu (Kette 7, ABC 4 Stufen, Blitz 80 Tiere)", (() => {
  const k = quelle("src/spiele/konzentration.js");
  return k.includes("export const KETTE_ZIEL = 7")
    && ["v2", "v3", "r2", "r3"].every((id) => k.includes(`id: "${id}"`))
    && k.includes("export const BLITZ_TIERE") && k.includes("BLITZ_SEK = 60, BLITZ_RUNDEN = 5")
    && k.includes("erweitertAm") && k.includes("konzKetteGeschafft") && k.includes("blitzAuswahl");
})());
test("v0.12: Training zählt für Mini-Missionen und speichert im Tresor", (() => {
  const w = quelle("src/features/Konzentration.jsx");
  return w.includes("aufgabenZaehlen") && w.includes("lernstand.konzentration")
    && w.includes("konzentrationStart(host.current")
    && quelle("src/calc/migrateData.js").includes("konzentration");
})());
test("v0.12: Mut-Satz des Tages auf der Startseite (einer pro Tag, Original-Sätze)", (() => {
  const s2 = quelle("src/features/Start.jsx");
  return s2.includes("STARK_SAETZE") && s2.includes("mutSatz") && s2.includes("mut-satz-wahl")
    && s2.includes("Er gehört heute dir")
    && quelle("src/calc/migrateData.js").includes("mutSatz");
})());
test("v0.12: Einstieg über die Startseite, Route ohne 6. Nav-Tab", (() => {
  return quelle("src/features/Start.jsx").includes('data-test="zum-konz"')
    && quelle("src/App.jsx").includes('route === "konz"')
    && !quelle("src/App.jsx").includes('id: "konz"');
})());
test("v0.12: Alt-Übernahme bringt Konzentration und Mut-Satz mit", (() => {
  const i = quelle("src/calc/importAltdaten.js");
  return i.includes("Konzentrations-Training") && i.includes("Mut-Satz");
})());
test("v0.12: kein Vorlesen im Training (Entscheid: kein TTS)", (() => {
  const k = quelle("src/spiele/konzentration.js");
  return !k.includes("speechSynthesis") && !k.includes("speak(");
})());

// ---------- v0.11: Blockwelt ----------
console.log("== v0.11: Blockwelt ==");
test("v0.11: APP_VERSION mindestens 0.11.0", versionMindestens("0.11.0"));
test("v0.11: rn-014 vorhanden", releaseNoteVorhanden("rn-014"));
test("v0.11: Original-Mechaniken portiert (Werkstatt, TNT 3x3, Sicherung, Denk-Pause 3/8s)", (() => {
  const b = quelle("src/spiele/blockwelt.js");
  return ["bwWerkstatt", "bwCraft", "bwSichern", "bwSicherungLaden", "bwNeuAnfangen"].every((f) => b.includes(`function ${f}`))
    && b.includes("sprengt") && b.includes("fehlSerie >= 3 ? 8 : 3") && b.includes("Nächster Versuch (");
})());
test("v0.11: Blockwelt-Stand liegt im Tresor-Dokument (migrateData + Spielhalle-Hook)", (() => {
  return quelle("src/calc/migrateData.js").includes("blockwelt")
    && quelle("src/features/Spielhalle.jsx").includes("lernstand.blockwelt")
    && quelle("src/features/Spielhalle.jsx").includes("blockweltStart(host.current");
})());
test("v0.11: gemeinsames Fragen-Modul für die Spiele", (() => {
  const f = quelle("src/spiele/fragen.js");
  return f.includes("export function spielFrage") && f.includes("export function drittesFalsch")
    && quelle("src/spiele/seeAbenteuer.js").includes("from \"./fragen.js\"")
    && quelle("src/spiele/blockwelt.js").includes("from \"./fragen.js\"");
})());
test("v0.11: Alt-Übernahme bringt die Blockwelt mit", quelle("src/calc/importAltdaten.js").includes("Blockwelt"));

// ---------- v0.10: Geräte-Abgleich ----------
console.log("== v0.10: Geräte-Abgleich ==");
test("v0.10: APP_VERSION mindestens 0.10.0", versionMindestens("0.10.0"));
test("v0.10: rn-013 vorhanden", releaseNoteVorhanden("rn-013"));
test("v0.10: Worker-API prüft Access, speichert nur Chiffrat-Blobs, 409 bei Konflikt", (() => {
  const a = quelle("server/_lib/vaultApi.js");
  return a.includes("Cf-Access-Authenticated-User-Email") && a.includes("baseRev !== s.rev")
    && a.includes("409") && a.includes("tresor.meta") && !a.includes("entschluesseln");
})());
test("v0.10: Worker bedient /api/* und sonst die Assets", (() => {
  const w = quelle("server/index.js");
  return w.includes("vaultApi(request, env)") && w.includes("env.ASSETS.fetch(request)")
    && quelle("wrangler.jsonc").includes('"main": "server/index.js"');
})());
test("v0.10: Client-Sync meldet Konflikte (nichts wird still überschrieben)", (() => {
  const c = quelle("src/sync.js");
  return c.includes("409") && c.includes("konflikt") && c.includes("hochladen") && c.includes("herunterladen");
})());
test("v0.10: Eltern-Karte Geräte-Abgleich mit Rückfragen", (() => {
  const e = quelle("src/features/Eltern.jsx");
  return ["eltern-sync", "sync-hoch", "sync-runter", "sync-konflikt", "sync-frage"].every((t) => e.includes(`"${t}"`));
})());
test("v0.10: Deploy-Doku vorhanden (KV, Access, neues Gerät, Flugmodus-Test)", (() => {
  const d = quelle("docs/DEPLOY-CLOUDFLARE.md");
  return d.includes("KV") && d.includes("Access") && d.includes("Neues Gerät") && d.includes("Flugmodus");
})());

// ---------- v0.9: See-Abenteuer originalgetreu ----------
console.log("== v0.9: See-Abenteuer originalgetreu ==");
test("v0.9: APP_VERSION mindestens 0.9.0", versionMindestens("0.9.0"));
test("v0.9: rn-012 vorhanden", releaseNoteVorhanden("rn-012"));
test("v0.9: Original-Mechaniken portiert (Wegfindung um den See, Angelwurf, Heranziehen, Denk-Pause)", (() => {
  const s = quelle("src/spiele/seeAbenteuer.js") + quelle("src/spiele/fragen.js");
  return ["spielWegpunkte", "spielWerfen", "spielZiehen", "drittesFalsch"].every((f) => s.includes(`function ${f}`))
    && s.includes("Nächster Versuch (") && s.includes("steigerung");
})());
test("v0.9: Spiel-Daten aus der Alt-App (Welt mit Besatz, 8 Fischarten, See-Foto)", (() => {
  const w = JSON.parse(quelle("src/spiele/welten.json")).welten[0];
  const f = JSON.parse(quelle("src/spiele/fische.json")).fische;
  return w.besatz.length === 8 && w.spots.length === 5 && f.length === 8
    && f.some((x) => x.fragen === 3) && quelle("src/spiele/seeAbenteuer.js").includes("/spiel/see.jpg");
})());
test("v0.9: Spielhalle bettet die Engine ein (kein Quiz-Ersatz mehr)", (() => {
  const h = quelle("src/features/Spielhalle.jsx");
  return h.includes("seeAbenteuerStart(host.current") && !h.includes("blitzFragen");
})());


// ---------- v0.8: Spielhalle + See-Abenteuer ----------
console.log("== v0.8: Spielhalle + See-Abenteuer ==");
test("v0.8: APP_VERSION mindestens 0.8.0", versionMindestens("0.8.0"));
test("v0.8: rn-011 vorhanden", releaseNoteVorhanden("rn-011"));
test("v0.8: Spiel-Logik rein (Münz-Regel, Blitz-Fragen, Serien-Fische)", (() => {
  const s = quelle("src/calc/spiele.js");
  return ["spielStartbar", "muenzeEinloesen", "blitzFragen", "wurfWerten"].every((f) => s.includes(`export function ${f}`))
    && !/document\.|window\.|fetch\(|Math\.random|Date\.now\(/.test(s);
})());
test("v0.8: Spielhalle gated über Münzen und löst genau 1 Münze ein", (() => {
  const h = quelle("src/features/Spielhalle.jsx") + quelle("src/spiele/seeAbenteuer.js") + quelle("src/spiele/fragen.js");
  return h.includes("spielStartbar(muenzen)") && h.includes("muenzeEinloesen(muenzen)")
    && ["spielhalle", "spiel-see", "spiel-opt", "see-ergebnis"].every((t) => h.includes(`"${t}"`));
})());

// ---------- v0.7: Elternbereich + Alt-App-Übernahme ----------
console.log("== v0.7: Elternbereich + Alt-App-Übernahme ==");
test("v0.7: APP_VERSION mindestens 0.7.0", versionMindestens("0.7.0"));
test("v0.7: rn-010 vorhanden", releaseNoteVorhanden("rn-010"));
test("v0.7: Übernahme-Konverter mit Bericht und Alt-Erkennung", (() => {
  const i = quelle("src/calc/importAltdaten.js");
  return i.includes("export function importAltdaten") && i.includes("export function istAltExport")
    && i.includes("bericht") && i.includes("verworfen") && i.includes("gws:");
})());
test("v0.7: Stufen-Vorgabe im Datenmodell und in den Übungen", (() => {
  return quelle("src/calc/migrateData.js").includes("stufenVorgabe")
    && quelle("src/calc/stufen.js").includes("export function stufenVorgabe")
    && quelle("src/features/Ueben.jsx").includes("stufenVorgabe(data.einstellungen");
})());
test("v0.7: Eltern-Tab nur im Eltern-Modus, mit Stufen/Ziel/Übersicht/Daten", (() => {
  const a = quelle("src/App.jsx"), e = quelle("src/features/Eltern.jsx");
  return a.includes("tresor.elternModus ? [{ id: \"eltern\"")
    && ["eltern-stufen", "eltern-ziel", "eltern-uebersicht", "eltern-daten", "import-bericht"].every((t) => e.includes(`"${t}"`));
})());
test("v0.7: Import versteht Alt-Export (istAltExport-Weiche im Kontext)", quelle("src/appContext.jsx").includes("istAltExport(roh)"));


// ---------- v0.6: Deutsch komplett (Zeit, Wortarten, Fälle, Rede, GWS) ----------
console.log("== v0.6: Deutsch komplett ==");
test("v0.6: APP_VERSION mindestens 0.6.0", versionMindestens("0.6.0"));
test("v0.6: rn-009 vorhanden", releaseNoteVorhanden("rn-009"));
test("v0.6: Konverter-Modul mit allen 5 Pools", (() => {
  const d = quelle("src/calc/aufgaben/deutschKonverter.js");
  return ["zeitPool", "wortartenPool", "faellePool", "redePool", "gwsPool"].every((f) => d.includes(`export function ${f}`));
})());
test("v0.6: Üben listet 11 Deutsch-Bereiche (inkl. rede/zeit/wa/faelle/gws)", (() => {
  const u = quelle("src/features/Ueben.jsx");
  return ["\"subj\"", "\"praed\"", "\"rede\"", "\"zeit\"", "\"wa\"", "\"faelle\"", "\"gk\"", "\"gws\""].every((k) => u.includes(k));
})());
test("v0.6: Konverter bleiben rein (kein DOM, keine Uhr, kein Zufall)", (() => {
  const d = quelle("src/calc/aufgaben/deutschKonverter.js");
  return !/document\.|window\.|fetch\(|Math\.random|Date\.now\(/.test(d);
})());

// ---------- v0.5: Wörter antippen ----------
console.log("== v0.5: Wörter antippen ==");
test("v0.5: APP_VERSION mindestens 0.5.0", versionMindestens("0.5.0"));
test("v0.5: rn-007 vorhanden", releaseNoteVorhanden("rn-007"));
test("v0.5: Satz-Pools mit Normalisierern (subjekt/praedikat/gk)", (() => {
  const s = quelle("src/calc/aufgaben/saetze.js");
  return ["subjektPool", "praedikatPool", "gkPool"].every((f) => s.includes(`export function ${f}`))
    && s.includes("SUBJ_K4") && s.includes("PRAED_K4");
})());
test("v0.5: reine Prüf-Logik auswahlPruefen + Pool-Gesundheit", (() => {
  const w = quelle("src/calc/wortTippen.js");
  return w.includes("export function auswahlPruefen") && w.includes("tippenPoolGesund")
    && !/document\.|window\.|fetch\(|Math\.random/.test(w);
})());
test("v0.5: Üben kennt den Tippen-Typ (wort-chip, pruefen-knopf)", (() => {
  const u = quelle("src/features/Ueben.jsx");
  return u.includes("\"tippen\"") && u.includes("\"wort-chip\"") && u.includes("\"pruefen-knopf\"")
    && u.includes("auswahlPruefen");
})());


// ---------- v0.4: Deutsch + Stark mit Leo ----------
console.log("== v0.4: Deutsch + Stark mit Leo ==");
test("v0.4: APP_VERSION mindestens 0.4.0", versionMindestens("0.4.0"));
test("v0.4: rn-006 vorhanden", releaseNoteVorhanden("rn-006"));
test("v0.4: Deutsch-Pools mit Konvertern (gesch, ddPool, doppelPool)", (() => {
  const d = quelle("src/calc/aufgaben/deutsch.js");
  return d.includes("export const GESCH_DATEN") && d.includes("export function ddPool")
    && d.includes("export function doppelPool") && d.includes("DEUTSCH_BEREICHE");
})());
test("v0.4: Stark-Pool mit Mut-Sätzen", (() => {
  const s = quelle("src/calc/aufgaben/stark.js");
  return s.includes("export const STARK_DATEN") && s.includes("export const STARK_SAETZE");
})());
test("v0.4: Üben kennt alle 4 Fächer (Deutsch · Mathe · Sachkunde · Stark)", (() => {
  const u = quelle("src/features/Ueben.jsx");
  return ["\"deutsch\"", "\"mathe\"", "\"sachkunde\"", "\"stark\""].every((f) => u.includes(f))
    && u.includes("DEUTSCH_BEREICHE") && u.includes("STARK_BEREICHE");
})());
test("v0.4: kein Beschämungs-Vokabular in den Deutsch/Stark-Pools", (() => {
  const t = quelle("src/calc/aufgaben/deutsch.js") + quelle("src/calc/aufgaben/stark.js");
  return !/unmotiviert|Versager|dumm/i.test(t);
})());


// ---------- v0.3.1: Cache-Regeln + version.json ----------
console.log("== v0.3.1: Cache-Regeln + version.json ==");
test("v0.3.1: APP_VERSION mindestens 0.3.1", versionMindestens("0.3.1"));
test("v0.3.1: rn-005 vorhanden", releaseNoteVorhanden("rn-005"));
test("v0.3.1: index.html no-cache, assets immutable, version.json no-store", (() => {
  const h = quelle("public/_headers");
  return /\/index\.html\n  Cache-Control: no-cache/.test(h)
    && /\/assets\/\*\n  Cache-Control: public, max-age=31536000, immutable/.test(h)
    && /\/version\.json\n  Cache-Control: no-store/.test(h);
})());
test("v0.3.1: Build schreibt dist/version.json mit Version, Datum und Git-Hash", (() => {
  const v = quelle("vite.config.js");
  return v.includes("dist/version.json") && v.includes("appVersion()") && v.includes("rev-parse");
})());

// ---------- v0.3: Fachlogik Mathe + Sachkunde ----------
console.log("== v0.3: Fachlogik Mathe + Sachkunde ==");
test("v0.3: APP_VERSION mindestens 0.3.0", versionMindestens("0.3.0"));
test("v0.3: rn-004 vorhanden (bei v0.3.0 an Index 0)", releaseNoteVorhanden("rn-004"));
test("v0.3: Pools als reine Daten-Module vorhanden", (() => {
  const m = quelle("src/calc/aufgaben/mathe.js"), s = quelle("src/calc/aufgaben/sachkunde.js");
  return m.includes("export const MATHE_DATEN") && m.includes("MATHE_BEREICHE")
    && s.includes("export const SACH_DATEN") && s.includes("SACH_BEREICHE");
})());
test("v0.3: calc-Module bleiben rein (kein DOM, keine eingebaute Uhr, kein fetch, kein ungeseedeter Zufall)", (() => {
  const dateien = ["src/calc/rng.js", "src/calc/stufen.js", "src/calc/aufgabenRunde.js", "src/calc/lerntage.js", "src/calc/migrateData.js"];
  return dateien.every((d) => {
    const c = quelle(d);
    const mathRandomErlaubt = d.endsWith("rng.js"); // einzige Stelle wäre verboten – rng nutzt mulberry32
    return !/document\.|window\.|fetch\(/.test(c)
      && !/Date\.now\(/.test(c)
      && (mathRandomErlaubt || !/Math\.random/.test(c));
  });
})());
test("v0.3: Stufen-Regeln im Code (fehlerfrei schaltet frei, Klasse 4 startet höher, Krone)", (() => {
  const c = quelle("src/calc/stufen.js");
  return c.includes("fehler === 0") && c.includes("klasse === 4") && c.includes("krone");
})());
test("v0.3: Runde = 1 Münze, Missionen und Lernspur mit 3-Tage-Brücke", (() => {
  const c = quelle("src/calc/lerntage.js");
  return c.includes("muenzenNachRunde") && c.includes("MISSIONS_LAENGE") && c.includes("<= 3");
})());
test("v0.3: Üben-Ansicht nutzt calc-Module (keine eigene Fachlogik-Kopie)", (() => {
  const c = quelle("src/features/Ueben.jsx");
  return c.includes("from \"../calc/stufen.js\"") && c.includes("from \"../calc/aufgabenRunde.js\"")
    && c.includes("from \"../calc/lerntage.js\"") && c.includes("rngAusSeed");
})());
test("v0.3: data-test-Attribute der Üben-Ansicht", (() => {
  const c = quelle("src/features/Ueben.jsx");
  return ["ueben-bereiche", "frage-karte", "frage-text", "antwort-opt", "weiter-knopf", "runde-ergebnis", "nochmal-knopf"]
    .every((t) => c.includes(`"${t}"`));
})());


// ---------- v0.2.1: _headers-Format ----------
console.log("== v0.2.1: _headers-Format ==");
test("v0.2.1: APP_VERSION mindestens 0.2.1", versionMindestens("0.2.1"));
test("v0.2.1: rn-003 vorhanden", releaseNoteVorhanden("rn-003"));
test("v0.2.1: _headers im Cloudflare-Format (keine Kommentar-Blöcke, jede eingerückte Zeile ist Name: Wert)", (() => {
  const zeilen = quelle("public/_headers").split("\n");
  if (zeilen.some((z) => z.includes("*/") || z.trim().startsWith("#"))) return false;
  if (zeilen[0].trim() !== "/*") return false; // erste Regel: alle Pfade
  return zeilen.every((z) => {
    const t = z.trim();
    if (t === "") return true;
    if (!z.startsWith(" ")) return t.startsWith("/"); // URL-Muster
    return /^[A-Za-z-]+: .+/.test(t); // Header-Paar
  });
})());

// ---------- v0.2: Tresor ----------
console.log("== v0.2: Tresor ==");
test("v0.2: APP_VERSION mindestens 0.2.0", versionMindestens("0.2.0"));
test("v0.2: rn-002 vorhanden (bei v0.2.0 an Index 0)", releaseNoteVorhanden("rn-002"));
test("v0.2: PBKDF2 mit SHA-256 und ≥ 250.000 Iterationen", (() => {
  const c = quelle("src/crypto.js");
  const n = parseInt(c.match(/PBKDF2_ITERATIONEN = (\d+)/)?.[1] || "0", 10);
  return n >= 250000 && c.includes('"SHA-256"') && c.includes("PBKDF2");
})());
test("v0.2: AES-256-GCM mit zufälliger IV", (() => {
  const c = quelle("src/crypto.js");
  return c.includes("AES-GCM") && c.includes("length: 256") && c.includes("zufallsBytes(12)");
})());
test("v0.2: Tresor speichert nur Chiffrat (datenSpeichern verschlüsselt immer)", (() => {
  const v = quelle("src/vault.js");
  return /datenSpeichern[\s\S]{0,200}verschluesseln\(/.test(v) && !/set\(DATEN_SCHLUESSEL, dokument/.test(v);
})());
test("v0.2: PIN-Sperre nach Fehlversuchen + Eltern setzen zurück", (() => {
  const v = quelle("src/vault.js");
  return v.includes("MAX_PIN_VERSUCHE") && v.includes("pinVersuche = 0");
})());
test("v0.2: Einrichtung verlangt Passwort ≥ 8 Zeichen und 4-stellige PIN", (() => {
  const v = quelle("src/vault.js");
  return v.includes("length < 8") && v.includes("\\d{4}");
})());
test("v0.2: Sperrbildschirm nennt „keine Passwort-Wiederherstellung“", quelle("src/features/VaultGate.jsx").includes("keine Passwort-Wiederherstellung"));
test("v0.2: data-test-Attribute am Gate und Elternbereich", (() => {
  const a = quelle("src/features/VaultGate.jsx") + quelle("src/features/Eltern.jsx");
  return ["gate-einrichten", "gate-entsperren", "pin-eingabe", "pin-ok", "eltern-zugang",
    "pw-eingabe", "pw-ok", "einr-ok", "eltern-karte", "export-knopf", "sperren-knopf"]
    .every((t) => a.includes(`"${t}"`));
})());
test("v0.2: keine Daten in localStorage (nur Tresor/IndexedDB)", (() => {
  const a = quelle("src/appContext.jsx") + quelle("src/features/Start.jsx") + quelle("src/features/Eltern.jsx");
  return !a.includes("localStorage");
})());

// ---------- v0.1: Gerüst ----------
console.log("== v0.1: Gerüst ==");
test("v0.1: APP_VERSION in App.jsx gepflegt", /export const APP_VERSION = "\d+\.\d+\.\d+"/.test(quelle("src/App.jsx")));
test("v0.1: Release-Notes beginnen mit rn-001-Struktur (id, version, datum, titel, entries)", (() => {
  const rn = JSON.parse(quelle("src/releaseNotes.json"));
  return Array.isArray(rn) && rn.length >= 1 && ["id", "version", "datum", "titel", "entries"].every((k) => k in rn[0]);
})());
test("v0.1: Release-Note-Typen sind gültig", (() => {
  const erlaubt = ["neu", "verbessert", "fix", "hinweis", "technik", "geaendert"];
  const rn = JSON.parse(quelle("src/releaseNotes.json"));
  return rn.every((r) => r.entries.every((e) => erlaubt.includes(e.type)));
})());
test("v0.1: CSP ohne Fremdquellen (nur 'self', kein http://, kein CDN)", (() => {
  const html = quelle("index.html");
  const csp = html.match(/Content-Security-Policy[^>]*content="([^"]+)"/)?.[1] || "";
  return csp.includes("default-src 'self'") && !/https?:\/\//.test(csp);
})());
test("v0.1: keine Fremd-CDNs im App-Code", !/cdn\.jsdelivr|cdnjs\.cloudflare|unpkg\.com|googleapis/.test(quelle("src/App.jsx") + quelle("src/main.jsx") + quelle("index.html")));
test("v0.1: Design-Tokens mit Hell/Dunkel über data-theme", (() => {
  const t = quelle("src/styles/tokens.css");
  return t.includes(":root") && t.includes('[data-theme="dark"]') && t.includes("--touch: 44px");
})());
test("v0.1: migrateData mit SCHEMA_VERSION exportiert", /export const SCHEMA_VERSION = \d+/.test(quelle("src/calc/migrateData.js")));
test("v0.1: calc bleibt rein (kein DOM, kein Date.now, kein fetch in src/calc)", (() => {
  const c = quelle("src/calc/migrateData.js");
  return !/document\.|window\.|Date\.now\(|fetch\(/.test(c);
})());
test("v0.1: _headers mit nosniff, HSTS und no-store für version.json", (() => {
  const h = quelle("public/_headers");
  return h.includes("nosniff") && h.includes("Strict-Transport-Security") && h.includes("no-store");
})());
test("v0.1: keine echten Kind-Daten im Code (nur „Kind“/„Profil“)", !/Felix|Geburtstag|Schule am/i.test(
  quelle("src/App.jsx") + quelle("src/features/Start.jsx") + quelle("src/calc/migrateData.js") + quelle("src/calc/migrateData.test.js") + quelle("src/releaseNotes.json")));
test("v0.1: data-test-Attribute an geprüften Elementen", (() => {
  const a = quelle("src/App.jsx") + quelle("src/features/Start.jsx");
  return a.includes('data-test="app-shell"') && a.includes('data-test="version"')
    && a.includes('data-test="rn-liste"') && a.includes('data-test="start-seite"')
    && ["nav-start", "nav-neu", "thema-schalter"].every((t) => a.includes(`"${t}"`));
})());

console.log(`\n================ ERGEBNIS: PASS ${pass} / FAIL ${fail} ================`);
process.exit(fail ? 1 : 0);
