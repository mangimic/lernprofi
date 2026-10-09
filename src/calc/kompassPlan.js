/* 🧭 KOMPASS-COUNTDOWN: ein Wochen-Lernplan bis zu den Kompass-4-Tests –
   als Vorschlag und Inspiration, nicht als Pflicht. Reine Logik ohne DOM:
   „heute" kommt als Parameter, alles ist deterministisch testbar.
   Drei Phasen: Grundlagen-Rotation → gezielt üben (2 Wochen davor,
   mit Papier-Generalprobe) → Testwoche (nur kurz auffrischen). */
import {
  wochenMontag, tagDatum, kalenderWoche, planFuerWoche, planSchreiben,
  blockHinzu, blockNotiz, blockTyp, blockDauer, blockDauerVon,
  tagesStunden, festerTermin, istAusgefallen, slotBelegt,
} from "./wochenplan.js";
import { schulfreiAm, ferienAm } from "./kalender.js";

/** Haupttermine Kompass 4 im Schuljahr 2026/27 (amtlich). */
export const KOMPASS_STANDARD = [
  { fach: "Deutsch", tag: "2026-11-18" },
  { fach: "Mathe", tag: "2026-11-19" },
];

/** Rotations-Reihenfolge der Übungs-Felder (Kompass-relevant). */
export const KOMPASS_DEUTSCH_FELDER = ["lesen", "strategie", "wortfam", "zusnomen", "steigern", "verbform", "gws", "zeit"];
export const KOMPASS_MATHE_FELDER = ["mrechnen", "mzahlen", "mgeo", "mgroessen", "mdaten"];

/** Volle Tage von heute bis zum Ziel (0 = heute). */
export function tageBis(heute, ziel) {
  const utc = (iso) => { const [j, m, t] = iso.split("-").map(Number); return Date.UTC(j, m - 1, t); };
  return Math.round((utc(ziel) - utc(heute)) / 86400000);
}

/** Die anstehenden Kompass-Termine: eingetragene (art "kompass") haben
    Vorrang, sonst die amtlichen Haupttermine als Vorschlag. */
export function kompassTermine(termine, heute) {
  const eigene = (termine || [])
    .filter((t) => t.art === "kompass" && t.tag >= heute)
    .sort((a, b) => a.tag.localeCompare(b.tag)).slice(0, 2)
    .map((t) => ({ fach: t.fach || "Kompass", tag: t.tag, eingetragen: true }));
  if (eigene.length) return eigene;
  return KOMPASS_STANDARD.filter((t) => t.tag >= heute).map((t) => ({ ...t, eingetragen: false }));
}

function wenigsteRunden(keys, stufen, n) {
  return [...keys]
    .sort((a, b) => (((stufen || {})[a] || {}).runden || 0) - (((stufen || {})[b] || {}).runden || 0))
    .slice(0, n);
}

const dreh = (liste, ab, n) => Array.from({ length: n }, (_, i) => liste[(ab + i) % liste.length]);

/** Wochenplan bis zur Testwoche: je Woche Phase, Fokus-Felder und Hinweis. */
export function kompassWochen(heute, termine, stufen) {
  const ziele = kompassTermine(termine, heute);
  if (!ziele.length) return [];
  const testMontag = wochenMontag(ziele[ziele.length - 1].tag);
  const wochen = [];
  for (let m = wochenMontag(heute), i = 0; m <= testMontag && i < 12; m = tagDatum(m, 7), i++) {
    const abstand = Math.round(tageBis(m, testMontag) / 7);
    const phase = abstand === 0 ? "test" : abstand <= 2 ? "gezielt" : "grundlagen";
    const ferien = ferienAm(tagDatum(m, 2));
    let deutsch, mathe, hinweis;
    if (phase === "test") {
      deutsch = ["lesen"];
      mathe = ["mrechnen"];
      hinweis = "Nur noch kurz auffrischen und früh schlafen – du kannst das! Die Morgen-Auffrischung erscheint am Testtag von selbst.";
    } else if (phase === "gezielt") {
      deutsch = wenigsteRunden(KOMPASS_DEUTSCH_FELDER, stufen, 2);
      mathe = wenigsteRunden(KOMPASS_MATHE_FELDER, stufen, 2);
      hinweis = "🧪 Generalprobe am Wochenende: ein Übungsheft auf Papier, echte 45 Minuten am Stück.";
    } else {
      deutsch = dreh(KOMPASS_DEUTSCH_FELDER, i * 2, 2);
      mathe = dreh(KOMPASS_MATHE_FELDER, i * 2, 2);
      hinweis = ferien ? `${ferien.emoji} ${ferien.name} – üb entspannt, wann es dir passt.` : null;
    }
    wochen.push({ montag: m, kw: kalenderWoche(m), phase, deutsch, mathe, hinweis, ferien: !!ferien });
  }
  return wochen;
}

export const PHASEN_NAMEN = {
  grundlagen: "🧱 Grundlagen – einmal durch alle Bereiche",
  gezielt: "🎯 Gezielt üben – da, wo es noch hakt",
  test: "🌟 Testwoche – locker bleiben",
};

/** Anzeigenamen der Fokus-Felder (≤24 Zeichen – passt in die Baustein-Notiz). */
export const KOMPASS_FELD_NAMEN = {
  lesen: "Lese-Detektiv", strategie: "Ableiten & Verlängern", wortfam: "Wortfamilien & Stamm",
  zusnomen: "Wörter zusammenbauen", steigern: "Adjektive steigern", verbform: "Verbformen bilden",
  gws: "Grundwortschatz", zeit: "Zeitformen",
  mrechnen: "Rechnen", mzahlen: "Zahlen-Profi", mgeo: "Formen & Flächen",
  mgroessen: "Größen & Sachaufgaben", mdaten: "Daten & Zufall",
};

// ─── 📅 Fahrplan → Wochenplan übernehmen ───
// Regeln (Familien-Vereinbarung):
// 1. Erst müssen 📚 Hausaufgaben und 🥁 Schlagzeug am Tag stehen (Block oder
//    fester Schlagzeug-Termin) – erst DANACH kommt ein Kompass-Thema dahinter.
//    (Hausaufgaben entfallen an schulfreien Tagen – Ferien/Feiertag.)
// 2. Kompass hat Vorrang: Ist kein Fenster mehr frei, ersetzt das Thema einen
//    Freizeit-Baustein (nie feste Termine, nie Pflicht-/Lern-Blöcke, nie Erledigtes).
// 3. Läuft doppelt sicher: Was schon drinsteht, wird nicht noch einmal eingeplant.

const UEBEN_TAGE = [0, 1, 3, 4]; // Mo, Di, Do, Fr – Mi hat die Lernbetreuung
const ERSETZBAR = new Set(["sport", "angeln", "pfadfinder", "freunde", "frei", "eigen"]);

function slotFrei(plan, feste, tag, slot) {
  if (slotBelegt(plan, tag, slot)) return false;
  const f = festerTermin(feste, tag, slot);
  return !f || istAusgefallen(plan, tag, f.beginn);
}

function ersterFreierSlot(plan, feste, tag, datum, abMin = 0) {
  for (const slot of tagesStunden(tag, datum)) {
    if (slot >= abMin && slotFrei(plan, feste, tag, slot)) return slot;
  }
  return null;
}

/** Stellt einen Pflicht-Baustein am Tag sicher; gibt { plan, ende } zurück (ende=null wenn unmöglich). */
function pflichtSichern(plan, feste, tag, datum, typ) {
  const block = plan.bloecke.find((b) => b.tag === tag && b.typ === typ);
  if (block) return { plan, ende: block.slot + blockDauerVon(block) };
  if (typ === "schlagzeug") {
    // Ein fester Schlagzeug-Termin zählt wie ein Baustein (gleiche Regel wie der 🦁-Wächter).
    for (const slot of tagesStunden(tag, datum)) {
      const f = festerTermin(feste, tag, slot);
      if (f && f.beginn === slot && f.name.includes("Schlagzeug") && !istAusgefallen(plan, tag, f.beginn)) {
        return { plan, ende: f.beginn + (f.dauer || 30) };
      }
    }
  }
  const slot = ersterFreierSlot(plan, feste, tag, datum);
  if (slot === null) return { plan, ende: null };
  return { plan: blockHinzu(plan, tag, typ, slot), ende: slot + 30 };
}

/** Übernimmt den ganzen Fahrplan in den Mehr-Wochen-Plan.
    Ergebnis: { doc, eingeplant, ersetzt, uebersprungen }. */
export function kompassUebernehmen(doc, wochen, feste) {
  let eingeplant = 0, ersetzt = 0, uebersprungen = 0;
  for (const w of wochen) {
    let plan = planFuerWoche(doc, w.montag);
    const fokus = [
      ...w.deutsch.map((k) => ({ typ: "deutsch", notiz: KOMPASS_FELD_NAMEN[k] || k })),
      ...w.mathe.map((k) => ({ typ: "mathe", notiz: KOMPASS_FELD_NAMEN[k] || k })),
    ];
    fokus.forEach((f, i) => {
      if (plan.bloecke.some((b) => b.typ === f.typ && b.notiz === f.notiz)) return; // schon drin
      // Tage der Reihe nach probieren, beginnend beim Stamm-Tag
      for (let v = 0; v < UEBEN_TAGE.length; v++) {
        const tag = UEBEN_TAGE[(i + v) % UEBEN_TAGE.length];
        const datum = tagDatum(w.montag, tag);
        // 1. Pflicht zuerst: Hausaufgaben (außer schulfrei) und Schlagzeug
        let p = plan, abMin = 0;
        if (!schulfreiAm(datum)) {
          const ha = pflichtSichern(p, feste, tag, datum, "hausaufgaben");
          if (ha.ende === null) continue;
          p = ha.plan; abMin = Math.max(abMin, ha.ende);
        }
        const sz = pflichtSichern(p, feste, tag, datum, "schlagzeug");
        if (sz.ende === null) continue;
        p = sz.plan; abMin = Math.max(abMin, sz.ende);
        // 2. Kompass-Thema HINTER die Pflicht legen – freies Fenster zuerst …
        const slot = ersterFreierSlot(p, feste, tag, datum, abMin);
        if (slot !== null) {
          plan = blockNotiz(blockHinzu(p, tag, f.typ, slot), p.bloecke.length
            ? Math.max(...p.bloecke.map((b) => b.id)) + 1 : 1, f.notiz);
          eingeplant++;
          return;
        }
        // … sonst hat Kompass Vorrang: einen Freizeit-Baustein ersetzen
        const opfer = p.bloecke
          .filter((b) => b.tag === tag && b.slot >= abMin && !b.fertig && ERSETZBAR.has(b.typ))
          .sort((a, b) => a.slot - b.slot)[0];
        if (opfer) {
          plan = blockNotiz(blockDauer(blockTyp(p, opfer.id, f.typ), opfer.id, 30), opfer.id, f.notiz);
          eingeplant++; ersetzt++;
          return;
        }
      }
      uebersprungen++;
    });
    doc = planSchreiben(doc, plan);
  }
  return { doc, eingeplant, ersetzt, uebersprungen };
}
