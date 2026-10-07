/* ============================================================
   Etappe 5: Datenübernahme aus der Alt-App (Single-File-Lernprofi).
   Nimmt den Export des Eltern-Knopfs „Lernstand sichern"
   ({ app:"lernprofi", version, exportiert, daten: store }) oder den
   rohen store und bildet ihn VERLUSTARM auf das neue Schema ab.
   Rein und getestet; jede Entscheidung landet im Bericht.

   Übernommen: Name, Münzen, Stufen-Fortschritt je Lernfeld
   (unlocked/runs/crown → freigeschaltet/runden/krone, Grundwortschatz-
   Gruppen werden zu EINEM gws-Feld zusammengefasst), Lerntage,
   Rekorde (Zahlenkette, Blitzlesen), Missionsziel.
   Bewusst verworfen (laut Architektur-Entscheid): Stimmen/Vorlesen,
   Sommer-Reise, Fit-für-4-Programm, Themen-Wahl, Zeitlimit (kommt
   später mit dem neuen Elternbereich), Lese-Check-Modus.
   ============================================================ */
import { migrateData } from "./migrateData.js";

const STUFEN_KEYS = [
  "subj", "praed", "satzglied", "rede", "zeit", "gk", "dd", "wa", "faelle", "doppel",
  "mrechnen", "mzahlen", "mgeo", "mgroessen", "mdaten",
  "sstrom", "srad", "skarte", "sgemeinde", "skoerper", "szeit",
  "gesch", "stark", "kompass",
  "tennis", "fussball", "schach", // Spiele: gespielte Matches (Gegner-Rotation)
];

function fortschritt(alt) {
  return {
    freigeschaltet: Math.max(1, Math.min(3, parseInt(alt?.unlocked, 10) || 1)),
    runden: Math.max(0, parseInt(alt?.runs, 10) || 0),
    krone: !!alt?.crown,
  };
}

export function importAltdaten(roh, heute) {
  const bericht = [];
  const hinzu = (feld, status, detail) => bericht.push({ feld, status, detail });

  const quelle = roh && typeof roh === "object" ? roh : {};
  const alt = quelle.app === "lernprofi" && quelle.daten ? quelle.daten : quelle;
  if (quelle.version) hinzu("Export", "übernommen", `Alt-App-Version ${quelle.version}`);

  const dokument = migrateData(null, heute);

  // Profil
  if (typeof alt.name === "string" && alt.name) {
    dokument.profil.name = alt.name;
    hinzu("Name", "übernommen", alt.name ? "Vorname übernommen" : "");
  }
  dokument.profil.klasse = 4;
  hinzu("Klassenstufe", "übernommen", "Neu-App startet in Klasse 4 (Alt-Stufe „Vorbereitung auf 4“ ist dort die Aufwärm-Stufe)");

  // Münzen
  if (Number.isFinite(alt.muenzen)) {
    dokument.lernstand.muenzen = Math.max(0, Math.floor(alt.muenzen));
    hinzu("Münzen", "übernommen", `${dokument.lernstand.muenzen} 🪙`);
  }

  // Stufen-Fortschritt je Lernfeld
  const progress = alt.progress && typeof alt.progress === "object" ? alt.progress : {};
  let felder = 0;
  for (const key of STUFEN_KEYS) {
    if (progress[key]) { dokument.lernstand.stufen[key] = fortschritt(progress[key]); felder++; }
  }
  // Grundwortschatz: Gruppen (gws:dopp, …) zu EINEM Feld zusammenfassen
  const gwsGruppen = Object.keys(progress).filter((k) => k.startsWith("gws:"));
  if (gwsGruppen.length) {
    const teile = gwsGruppen.map((k) => fortschritt(progress[k]));
    dokument.lernstand.stufen.gws = {
      freigeschaltet: Math.max(...teile.map((t) => t.freigeschaltet)),
      runden: teile.reduce((s, t) => s + t.runden, 0),
      krone: teile.every((t) => t.krone),
    };
    felder++;
    hinzu("Grundwortschatz", "übernommen", `${gwsGruppen.length} Regelgruppen zu einem Lernfeld zusammengefasst (beste Stufe zählt)`);
  }
  hinzu("Stufen-Fortschritt", "übernommen", `${felder} Lernfelder`);

  // Lerntage (Alt: {t, m, mi, bo, z})
  if (Array.isArray(alt.lerntage) && alt.lerntage.length) {
    dokument.lernstand.lerntage = alt.lerntage
      .filter((e) => e && typeof e.t === "string")
      .slice(-60)
      .map((e) => ({
        tag: e.t,
        aufgaben: Math.max(0, parseInt(e.mi, 10) || 0) * 4,
        missionen: Math.max(0, parseInt(e.mi, 10) || 0),
        zielErreicht: !!e.z,
      }));
    hinzu("Lerntage", "übernommen", `${dokument.lernstand.lerntage.length} Tage (Lernspur bleibt erhalten)`);
  }

  // Rekorde
  if (alt.blockwelt && typeof alt.blockwelt === "object") {
    dokument.lernstand.blockwelt = {
      welt: Array.isArray(alt.blockwelt.welt) ? alt.blockwelt.welt : null,
      inv: alt.blockwelt.inv && typeof alt.blockwelt.inv === "object" ? alt.blockwelt.inv : null,
      verdient: Math.max(0, parseInt(alt.blockwelt.verdient, 10) || 0),
      zaehler: Math.max(0, parseInt(alt.blockwelt.zaehler, 10) || 0),
      sicherung: alt.blockwelt.sicherung || null,
    };
    hinzu("Blockwelt", "übernommen", `Welt, Inventar und ${dokument.lernstand.blockwelt.verdient} 🎁 verdiente Blöcke`);
  }
  if (alt.kette && Number.isFinite(alt.kette.rekord) && alt.kette.rekord > 0) {
    dokument.lernstand.rekorde.zahlenkette = alt.kette.rekord;
    hinzu("Zahlenketten-Rekord", "übernommen", String(alt.kette.rekord));
  }
  if (alt.blitz && Number.isFinite(alt.blitz.best) && alt.blitz.best > 0) {
    dokument.lernstand.rekorde.blitzlesen = alt.blitz.best;
    hinzu("Blitzlesen-Rekord", "übernommen", `${alt.blitz.best} Wörter`);
  }

  // Konzentrations-Training: Kette, ABC-Bestwerte und Blitz-Runden 1:1
  const konzObjekt = (x) => (x && typeof x === "object" && !Array.isArray(x) ? x : null);
  if (konzObjekt(alt.kette) || konzObjekt(alt.abcBest) || konzObjekt(alt.blitz)) {
    const kette = konzObjekt(alt.kette) || {};
    const blitz = konzObjekt(alt.blitz) || {};
    dokument.lernstand.konzentration = {
      kette: {
        zahlen: Array.isArray(kette.zahlen) ? kette.zahlen.filter((z) => Number.isFinite(z)) : [],
        erweitertAm: typeof kette.erweitertAm === "string" ? kette.erweitertAm : "",
        rekord: Math.max(0, parseInt(kette.rekord, 10) || 0),
      },
      abcBest: konzObjekt(alt.abcBest) || {},
      blitz: {
        runden: Array.isArray(blitz.runden) ? blitz.runden.filter((r) => Number.isFinite(r)).slice(0, 5) : [],
        best: Math.max(0, parseInt(blitz.best, 10) || 0),
      },
    };
    hinzu("Konzentrations-Training", "übernommen", "Zahlenkette, ABC-Bestwerte und Blitzlese-Runden");
  }

  // Vorgangsbeschreibung: gewählter Ablauf (z. B. Waffelrezept)
  if (alt.vorgang && typeof alt.vorgang === "object" && typeof alt.vorgang.rezept === "string") {
    dokument.lernstand.vorgang = { rezept: alt.vorgang.rezept };
    hinzu("Vorgangsbeschreibung", "übernommen", "Gewählter Ablauf bleibt eingestellt");
  }

  // Mut-Satz des Tages
  if (alt.mutSatz && typeof alt.mutSatz === "object" && typeof alt.mutSatz.tag === "string") {
    dokument.lernstand.mutSatz = {
      tag: alt.mutSatz.tag,
      idx: Math.max(0, parseInt(alt.mutSatz.idx, 10) || 0),
    };
    hinzu("Mut-Satz", "übernommen", "Der heutige Mut-Satz bleibt deiner");
  }

  // Einstellungen
  if (Number.isInteger(alt.missionsZiel) && alt.missionsZiel >= 1) {
    dokument.einstellungen.missionsZiel = Math.min(6, alt.missionsZiel);
    hinzu("Tagesziel", "übernommen", `${dokument.einstellungen.missionsZiel} Mini-Missionen`);
  }

  // Bewusst verworfen (Architektur-Entscheidungen)
  const verworfen = [
    ["stimmPaket", "Vorlesen kommt laut Entscheidung nicht mit"],
    ["ferien", "Sommer-Reise ist abgeschlossen"],
    ["fit4", "Fit-für-4-Programm ist abgeschlossen"],
    ["thema", "Themen-Wahl gibt es im Neubau (noch) nicht"],
    ["leseKontrolle", "Lese-Check gibt es im Neubau (noch) nicht"],
    ["zeitLimit", "Zeitlimit folgt mit dem neuen Elternbereich"],
  ];
  for (const [feld, grund] of verworfen) {
    if (feld in alt) hinzu(feld, "verworfen", grund);
  }

  return { dokument: migrateData(dokument, heute), bericht };
}

/** Erkennt, ob ein JSON ein Alt-App-Export ist (statt Neubau-Backup). */
export function istAltExport(roh) {
  const d = roh && typeof roh === "object" ? (roh.daten || roh) : {};
  return !!(d && typeof d === "object" && ("progress" in d || "level" in d) && !("schemaVersion" in d));
}
