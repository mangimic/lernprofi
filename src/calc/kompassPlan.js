/* 🧭 KOMPASS-COUNTDOWN: ein Wochen-Lernplan bis zu den Kompass-4-Tests –
   als Vorschlag und Inspiration, nicht als Pflicht. Reine Logik ohne DOM:
   „heute" kommt als Parameter, alles ist deterministisch testbar.
   Drei Phasen: Grundlagen-Rotation → gezielt üben (2 Wochen davor,
   mit Papier-Generalprobe) → Testwoche (nur kurz auffrischen). */
import { wochenMontag, tagDatum, kalenderWoche } from "./wochenplan.js";
import { ferienAm } from "./kalender.js";

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
