/* ============================================================
   Konverter: Zeitformen, Wortarten, Fälle → MC-Format,
   wörtliche Rede → Tippen-Format, Grundwortschatz → MC.
   Rein und deterministisch (keine Zufälle – die Antwort-Mischung
   übernimmt später antwortOptionen mit Seed).
   ============================================================ */
import {
  ZEIT_THEMEN, WA_THEMEN, WA_K4, FAELLE_THEMEN, REDE_THEMEN, REDE_K4, GWS_KATEGORIEN,
} from "./deutsch2.js";

const flach = (themen) => Object.values(themen).flatMap((t) => (Array.isArray(t) ? t : t.saetze));
const satz = (woerter) => woerter.join(" ");

// --- Zeitformen: Satz lesen, Zeitform bestimmen (easy: Gegenwart/
//     Vergangenheit · hard: Perfekt/Futur, wie in der Alt-App) ---
export const ZEIT_NAMEN = {
  praesens: "Präsens (Gegenwart)",
  praeteritum: "Präteritum (Vergangenheit)",
  perfekt: "Perfekt",
  futur: "Futur (Zukunft)",
};
const ZEIT_FALSCH = {
  praesens: ["praeteritum", "futur"],
  praeteritum: ["praesens", "perfekt"],
  perfekt: ["praeteritum", "futur"],
  futur: ["praesens", "perfekt"],
};
const ZEIT_TIPP = {
  praesens: "Es passiert JETZT – die einfache Form ohne Hilfswort.",
  praeteritum: "Erzähl-Vergangenheit: spielte, ging, las – ein Wort, ohne Hilfswort.",
  perfekt: "Zwei Teile: haben/sein + ge-Form (hat … gespielt).",
  futur: "Zukunft mit „wird/werden“ + Grundform (wird … spielen).",
};
export function zeitPool() {
  const alle = flach(ZEIT_THEMEN).map((a) => ({
    f: `Welche Zeitform hat der Satz: „${a.satz}“?`,
    r: ZEIT_NAMEN[a.form],
    x: ZEIT_FALSCH[a.form].map((k) => ZEIT_NAMEN[k]),
    tipp: ZEIT_TIPP[a.form],
    form: a.form,
  }));
  return {
    easy: alle.filter((a) => a.form === "praesens" || a.form === "praeteritum"),
    hard: alle.filter((a) => a.form === "perfekt" || a.form === "futur"),
  };
}

// --- Wortarten: markiertes Wort bestimmen (Nomen/Verb/Adjektiv) ---
export const WA_NAMEN = { nomen: "Nomen (Namenwort)", verb: "Verb (Tu-Wort)", adjektiv: "Adjektiv (Wie-Wort)" };
const WA_TIPP = {
  nomen: "Die Artikel-Probe: Passt der/die/das davor? Nomen schreibt man groß.",
  verb: "Frag: Was TUT jemand? Verben kann man in andere Personen setzen (ich renne, du rennst).",
  adjektiv: "Frag: WIE ist etwas? Adjektive kann man steigern (schnell – schneller).",
};
function waNorm(a) {
  const wort = a.woerter[a.ziel].replace(/[.,!?]/g, "");
  return {
    kontext: satz(a.woerter),
    f: `Welche Wortart ist „${wort}“?`,
    r: WA_NAMEN[a.art],
    x: Object.keys(WA_NAMEN).filter((k) => k !== a.art).map((k) => WA_NAMEN[k]),
    tipp: WA_TIPP[a.art],
  };
}
export function wortartenPool() {
  return { easy: flach(WA_THEMEN).map(waNorm), hard: flach(WA_K4).map(waNorm) };
}

// --- Die 4 Fälle: markierte Wortgruppe bestimmen ---
export const FALL_NAMEN = { nom: "Nominativ (Wer?)", gen: "Genitiv (Wessen?)", dat: "Dativ (Wem?)", akk: "Akkusativ (Wen?)" };
const FALL_FALSCH = {
  nom: ["akk", "dat"], akk: ["nom", "dat"], dat: ["akk", "gen"], gen: ["dat", "akk"],
};
export function faellePool() {
  const easy = flach(FAELLE_THEMEN).map((a) => {
    const gruppe = a.ziel.map((i) => a.woerter[i].replace(/[.,!?]/g, "")).join(" ");
    return {
      kontext: satz(a.woerter),
      f: `In welchem Fall steht „${gruppe}“?`,
      r: FALL_NAMEN[a.fall],
      x: FALL_FALSCH[a.fall].map((k) => FALL_NAMEN[k]),
      tipp: `Stell die Frage: „${a.frage}“ – die Fragewörter Wer/Wessen/Wem/Wen verraten den Fall.`,
    };
  });
  return { easy, hard: [] };
}

// --- Wörtliche Rede: die gesprochenen Wörter antippen (Tippen-Format) ---
export function redePool() {
  const norm = (a) => ({
    woerter: a.woerter,
    ziel: a.rede,
    frage: "Tippe alle Wörter der WÖRTLICHEN REDE an (das, was gesprochen wird).",
    loesung: a.rede.map((i) => a.woerter[i]).join(" "),
    tipp: "Die wörtliche Rede beginnt nach dem Doppelpunkt – in Texten steht sie zwischen Anführungszeichen „…“.",
  });
  return { easy: flach(REDE_THEMEN).map(norm), hard: flach(REDE_K4).map(norm) };
}

// --- Grundwortschatz: 12 Regelgruppen, richtige Schreibweise wählen ---
export function gwsPool() {
  const norm = (k) => (w) => ({
    f: "Welche Schreibweise ist richtig?",
    r: w.richtig,
    x: [w.falsch],
    tipp: k.tipp.replace(/<[^>]+>/g, ""),
    kontext: `${k.emoji} Regel: ${k.regel.replace(/<[^>]+>/g, "")}`,
  });
  return {
    easy: GWS_KATEGORIEN.flatMap((k) => (k.leicht || []).map(norm(k))),
    hard: GWS_KATEGORIEN.flatMap((k) => (k.schwer || []).map(norm(k))),
  };
}
