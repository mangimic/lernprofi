/* ============================================================
   🎒 Klassenstufen (v0.87) – REINE Fachlogik.
   Jede Klasse hat ihre eigene Lernwelt: Fächer, Bereiche, Aufgaben-
   Pools, Kennenlern-Felder und Spiel-Fragen. Üben, Einstufung,
   Spiele, Suche, Tagesbühne und Elternbereich fragen NUR hier.
   Klasse 3/4: die bisherigen Inhalte (Kompass-4-Niveau).
   Klasse 1/2: eigene Pools nach Bildungsplan BW; `easy` = Stoff des
   1. Halbjahrs, `hard` = 2. Halbjahr.
   ============================================================ */
import { DEUTSCH_LISTE, DEUTSCH_GRUPPEN } from "./uebenGruppen.js";
import { MATHE_DATEN, MATHE_BEREICHE } from "./aufgaben/mathe.js";
import { SACH_DATEN, SACH_BEREICHE } from "./aufgaben/sachkunde.js";
import { STARK_DATEN, STARK_BEREICHE } from "./aufgaben/stark.js";
import { GESCH_DATEN, ddPool, doppelPool } from "./aufgaben/deutsch.js";
import { subjektPool, praedikatPool, gkPool } from "./aufgaben/saetze.js";
import { umstellenPool } from "./aufgaben/satzglieder.js";
import { KOMPASS_DEUTSCH_DATEN } from "./aufgaben/kompassDeutsch.js";
import { HOEREN_DATEN } from "./aufgaben/hoeren.js";
import { zeitPool, wortartenPool, faellePool, redePool, gwsPool } from "./aufgaben/deutschKonverter.js";
import { EINSTUFUNG_FELDER } from "./einstufung.js";
import { K1_MATHE_DATEN, K1_MATHE_BEREICHE } from "./aufgaben/klasse1Mathe.js";
import { K1_DEUTSCH_DATEN, K1_DEUTSCH_BEREICHE, K1_DEUTSCH_GRUPPEN } from "./aufgaben/klasse1Deutsch.js";

/** Alle Klassenstufen des Datenmodells … */
export const KLASSEN = [1, 2, 3, 4];
/** … und die, für die es schon Inhalte gibt (Eltern können nur diese wählen). */
export const KLASSEN_WAEHLBAR = [1, 3, 4];

/** Hat diese Klasse eine eigene Lernwelt (statt der 3/4-Inhalte)? */
const eigeneWelt = (klasse) => klasse === 1;

/* 🎨 Klasse 3/4: Die Satz-Übungen folgen der gewählten Übungs-Welt
   (Alltag/Angeln/Tennis/…) – Regel- und Wissens-Pools bleiben themenfrei. */
export function deutschDaten(thema) {
  return {
    subj: subjektPool(thema), praed: praedikatPool(thema), gk: gkPool(thema), rede: redePool(thema),
    zeit: zeitPool(thema), wa: wortartenPool(thema), faelle: faellePool(thema), gws: gwsPool(),
    gesch: GESCH_DATEN, dd: ddPool(), doppel: doppelPool(), satzglied: umstellenPool(),
    ...KOMPASS_DEUTSCH_DATEN, // Kompass-Training (themenfrei)
    ...HOEREN_DATEN, // Hör-Detektiv (Rechtschreib-Fehlermuster)
  };
}

const STARK_FACH = { id: "stark", name: "Stark", bereiche: STARK_BEREICHE, daten: { stark: STARK_DATEN }, gruppen: null, welten: false };

/** Die Fächer einer Klasse: [{ id, name, bereiche, daten, gruppen, welten }].
    `gruppen` (oder null) bündelt viele Bereiche; `welten` = Übungs-Welt wählbar. */
export function faecherFuerKlasse(klasse, thema = "alltag") {
  if (klasse === 1) {
    return [
      { id: "deutsch", name: "Deutsch", bereiche: K1_DEUTSCH_BEREICHE, daten: K1_DEUTSCH_DATEN, gruppen: K1_DEUTSCH_GRUPPEN, welten: false },
      { id: "mathe", name: "Mathe", bereiche: K1_MATHE_BEREICHE, daten: K1_MATHE_DATEN, gruppen: null, welten: false },
      STARK_FACH,
    ];
  }
  return [
    { id: "deutsch", name: "Deutsch", bereiche: DEUTSCH_LISTE, daten: deutschDaten(thema), gruppen: DEUTSCH_GRUPPEN, welten: true },
    { id: "mathe", name: "Mathe", bereiche: MATHE_BEREICHE, daten: MATHE_DATEN, gruppen: null, welten: false },
    { id: "sachkunde", name: "Sachkunde", bereiche: SACH_BEREICHE, daten: SACH_DATEN, gruppen: null, welten: false },
    STARK_FACH,
  ];
}

const FACH_NAME = { deutsch: "Deutsch", mathe: "Mathe", sachkunde: "Sachkunde", stark: "Stark mit Leo" };

/** Flache Liste aller Bereiche einer Klasse: [{ key, name, emoji, typ?, fach, fachName }]. */
export function bereicheFuerKlasse(klasse) {
  return faecherFuerKlasse(klasse).flatMap((f) => f.bereiche.map((b) => ({ ...b, fach: f.id, fachName: FACH_NAME[f.id] })));
}

/** Gehört dieses Lernfeld zur Lernwelt der Klasse? */
export function feldInKlasse(key, klasse) {
  return bereicheFuerKlasse(klasse).some((b) => b.key === key);
}

/** Anzeigename eines Lernfelds – über ALLE Klassen (alte Empfehlungen bleiben lesbar). */
export function feldTitel(key) {
  if (key === "stark") return "Stark mit Leo";
  for (const klasse of [4, 1]) {
    const b = bereicheFuerKlasse(klasse).find((x) => x.key === key);
    if (b) return b.name;
  }
  return key;
}

/* 🧪 Kennenlern-Runde: je Klasse 6 Kern-Felder (3 Deutsch + 3 Mathe). */
const EINSTUFUNG_K1 = [
  { key: "k1anlaut", fach: "Deutsch" }, { key: "k1silben", fach: "Deutsch" }, { key: "k1lesen", fach: "Deutsch" },
  { key: "k1zahlen", fach: "Mathe" }, { key: "k1zerlegen", fach: "Mathe" }, { key: "k1plus", fach: "Mathe" },
];
export function einstufungFelder(klasse) {
  if (!eigeneWelt(klasse)) return EINSTUFUNG_FELDER;
  const alle = bereicheFuerKlasse(klasse);
  return EINSTUFUNG_K1.map((f) => {
    const b = alle.find((x) => x.key === f.key);
    return { key: f.key, emoji: b.emoji, name: b.name, fach: f.fach };
  });
}
/** Pools der Kennenlern-Felder dieser Klasse: { [key]: { easy, hard } }. */
export function einstufungPools(klasse) {
  if (!eigeneWelt(klasse)) {
    return {
      gws: gwsPool(), dd: ddPool(), zeit: zeitPool(), faelle: faellePool(),
      mrechnen: MATHE_DATEN.mrechnen, mzahlen: MATHE_DATEN.mzahlen,
    };
  }
  const faecher = faecherFuerKlasse(klasse);
  return Object.fromEntries(einstufungFelder(klasse).map((f) => [f.key, faecher.find((x) => x.daten[f.key]).daten[f.key]]));
}

/* 🎮 Spiele: kurze Fragen aus den Pools der Klasse (ohne Bild/Lesetext,
   kurze Antworten). null = Klasse 3/4 nutzt die bisherigen Spiel-Fragen. */
const SPIEL_FELDER = { 1: ["k1plus", "k1minus", "k1zerlegen", "k1reime", "k1silben"] };
const spielTauglich = (a) => !a.bild && !a.bloecke && !a.kontext && a.f.length <= 80
  && [a.r, ...a.x].every((o) => o.length <= 16);
export function spielQuellen(klasse) {
  const felder = SPIEL_FELDER[klasse];
  if (!felder) return null;
  const faecher = faecherFuerKlasse(klasse);
  const pools = felder.map((key) => faecher.find((f) => f.daten[key]).daten[key]);
  return {
    leicht: pools.flatMap((p) => p.easy).filter(spielTauglich),
    schwer: pools.flatMap((p) => p.hard).filter(spielTauglich),
  };
}

/* 🔊 Vorlesen: Eltern-Einstellung, sonst Standard je Klasse
   (Klasse 1 liest automatisch vor, Klasse 2 auf Knopfdruck, 3/4 gar nicht). */
export const VORLESE_MODI = ["auto", "knopf", "aus"];
export function vorleseModus(einstellungen, klasse) {
  const gewaehlt = einstellungen?.vorlesen;
  if (VORLESE_MODI.includes(gewaehlt)) return gewaehlt;
  return klasse === 1 ? "auto" : klasse === 2 ? "knopf" : "aus";
}

/** Lese-Aufgaben: Hier würde das Vorlesen der ANTWORTEN die Aufgabe lösen
    (das Kind soll das Wort selbst erlesen) – die Frage wird trotzdem vorgelesen. */
const SELBST_LESEN = ["k1lesen", "k1saetze"];
export function antwortenVorlesbar(feldKey) {
  return !SELBST_LESEN.includes(feldKey);
}

/** Klassenwechsel: Kennenlern-Ergebnis und Schwerpunkte gehören zur alten
    Klasse und werden zurückgesetzt; Münzen, Stufen und Spielstände bleiben. */
export function klasseWechseln(data, klasse) {
  if (!KLASSEN.includes(klasse) || klasse === data.profil.klasse) return data;
  return {
    ...data,
    profil: { ...data.profil, klasse, schwerpunkte: [] },
    lernstand: { ...data.lernstand, einstufung: null },
  };
}
