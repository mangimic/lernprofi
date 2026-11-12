/* ============================================================
   🔍 Suche – REINE Fachlogik, kein DOM.
   Bewusst OHNE Knowledge Graph: Der gesamte durchsuchbare Inhalt
   (Übungs-Bereiche, Karteikarten, Termine, Dokumente, Seiten) sind
   wenige hundert Einträge, die ohnehin im Speicher liegen – und die
   „Beziehungen" (Feld → Karte → Original-Heft → Termin) stecken
   bereits als geprüfte Zuordnungen in calc. Ein flacher Index mit
   deutscher Normalisierung (Umlaute, ß) findet alles in <1 ms und
   bleibt Zero-Knowledge: nichts verlässt das Gerät.
   ============================================================ */
import { bereicheFuerKlasse } from "./klassen.js";
import { aktiveKarten } from "./karteikarten.js";
import { TERMIN_ARTEN } from "./wochenplan.js";
import { routeErlaubt, modulAn } from "./module.js";

const SEITEN = [
  ["🧭", "Kompass-Countdown & Lernplan", "kompass"],
  ["🗓️", "Mein Wochenplan", "plan"],
  ["🗃️", "Karteikasten (digital üben)", "kasten"],
  ["🖐️", "Schreib-Training", "schrift"],
  ["✍️", "Aufsatz-Check", "aufsatz"],
  ["🧠", "Konzentrations-Training", "konz"],
  ["🧩", "Sudoku-Training", "sudoku"],
  ["🎮", "Spielhalle", "spiele"],
  ["📂", "Unsere Unterlagen", "doks"],
  ["🧪", "Einstufungstest", "einstufung"],
];
const SPIELE = ["Tennis-Match", "Fußball-Match", "Angel-Wettfischen", "Dino-Rennen", "Raketen-Rennen", "Schach", "Blockwelt"];

/** Baut den durchsuchbaren Index aus App-Daten und festen Inhalten. */
export function sucheIndex(data, elternModus) {
  const eintraege = [];
  const klasse = data.profil?.klasse ?? 4;
  // 🎒 Übungen der eigenen Klasse (v0.87)
  for (const b of bereicheFuerKlasse(klasse)) {
    eintraege.push({ emoji: b.emoji, titel: b.name, detail: `Übung · ${b.fachName}`, ziel: { route: "ueben", feld: b.key } });
  }
  // 🗃️ Die Karteikarten sind Kompass-4-Stoff – für Klasse 1/2 gibt es sie nicht.
  for (const k of (klasse >= 3 ? aktiveKarten(data.einstellungen) : [])) {
    eintraege.push({
      emoji: "🗃️", titel: k.vs.split("\n")[0].slice(0, 60),
      detail: `Karteikarte · ${k.fach === "mathe" ? "Mathe" : "Deutsch"}`, ziel: { route: "kasten" },
    });
  }
  for (const t of (modulAn(data, "plan") ? data.einstellungen.termine : [])) {
    const art = TERMIN_ARTEN[t.art] || { emoji: "📅", name: "Termin" };
    eintraege.push({
      emoji: art.emoji, titel: `${art.name}${t.fach ? ` ${t.fach}` : ""}`,
      detail: `Termin · ${t.tag.split("-").reverse().join(".")}`, ziel: { route: "plan" },
    });
  }
  for (const d of (modulAn(data, "plan") ? data.doks : [])) {
    eintraege.push({ emoji: "📂", titel: d.name, detail: "Unterlagen", ziel: { route: "doks" } });
  }
  for (const [emoji, titel, route] of SEITEN) {
    if (!routeErlaubt(route, data)) continue; // 🧩 Seiten abgeschalteter Module fehlen
    if (route === "kasten" && klasse < 3) continue;
    eintraege.push({ emoji, titel, detail: "Seite", ziel: { route } });
  }
  for (const name of SPIELE) {
    eintraege.push({ emoji: "🎮", titel: name, detail: "Spiel · Spielhalle", ziel: { route: "spiele" } });
  }
  if (elternModus) {
    eintraege.push({ emoji: "🔧", titel: "Elternbereich", detail: "Einstellungen", ziel: { route: "eltern" } });
    eintraege.push({ emoji: "🖨️", titel: "Karteikarten drucken", detail: "Eltern · Material", ziel: { route: "karten" } });
  }
  return eintraege;
}

/** Kindgerechte Normalisierung: klein, ohne Akzente, ß→ss („wurfel" findet „Würfel"). */
export function sucheNorm(s) {
  return String(s).toLowerCase().replace(/ß/g, "ss").normalize("NFD").replace(/[̀-ͯ]/g, "");
}

/** Alle Suchwörter müssen vorkommen; Titel-Treffer vor Detail-Treffern. */
export function suchen(index, frage, max = 10) {
  const woerter = sucheNorm(frage).split(/\s+/).filter(Boolean);
  if (!woerter.length) return [];
  const treffer = [];
  for (const e of index) {
    const titel = sucheNorm(e.titel);
    const alles = `${titel} ${sucheNorm(e.detail)}`;
    if (!woerter.every((w) => alles.includes(w))) continue;
    const rang = woerter.every((w) => titel.includes(w)) ? (titel.startsWith(woerter[0]) ? 0 : 1) : 2;
    treffer.push({ ...e, rang });
  }
  return treffer.sort((a, b) => a.rang - b.rang).slice(0, max);
}
