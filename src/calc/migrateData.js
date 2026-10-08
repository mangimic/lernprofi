/* ============================================================
   Datenmodell und Migration – REINE Fachlogik.
   Kein DOM, keine eingebaute Uhr, kein Zufall: „heute" kommt als
   Parameter (ISO-Datum "JJJJ-MM-TT") herein.
   Der gesamte App-Zustand ist EIN Dokument mit Schemaversion.
   migrateData hebt alte Stände verlustfrei an (idempotent):
   bekannte Felder werden geprüft/ergänzt, unbekannte bleiben
   unangetastet erhalten.
   ============================================================ */
import { STARK_SAETZE } from "./aufgaben/stark.js";

export const SCHEMA_VERSION = 1;

/** Leeres, gültiges Dokument (Startzustand eines neuen Profils). */
export function leeresDokument(heute) {
  return {
    schemaVersion: SCHEMA_VERSION,
    erstellt: heute,
    profil: { name: "", klasse: 4 },
    lernstand: {
      stufen: {},      // je Lernfeld: { freigeschaltet, runden, krone }
      muenzen: 0,
      lerntage: [],    // { tag, missionen, zielErreicht }
      rekorde: {},
      blockwelt: null,     // dauerhafte Spiel-Welt (Raster, Inventar, Meilensteine)
      konzentration: null, // Zahlenkette, ABC-Bestwerte, Blitzlese-Runden
      mutSatz: { tag: "", idx: 0 }, // Mut-Satz des Tages (Stark mit Leo)
      vorgang: null,       // Vorgangsbeschreibung: gewählter Ablauf + Selbst-Check
      zeit: { tag: "", sek: 0 }, // heute verbrauchte Lernzeit (Time-Boxing)
      tagesform: { tag: "", modus: "" }, // NUR heutige Tagesform – keine Fähigkeitseinstufung
      fokusRekord: 0,            // längste Fokus-Serie (Aufgaben am Stück)
      einstufung: null,          // letzter Einstufungstest: { tag, ergebnisse, empfehlung }
    },
    einstellungen: {
      thema: "hell",   // "hell" | "dunkel"
      missionsZiel: 4,
      stufenVorgabe: { global: 0, felder: {} }, // 0 = automatisch, 1-3 = fest (Eltern)
      zeitLimit: 20,       // Lernzeit pro Tag in Minuten (0 = aus); Empfehlung 20
      spieleAktiv: {},     // je Spiel: false = in der Spielhalle ausgeblendet
      muenzenAktiv: true,  // Münz-Freischaltung (erst üben, dann spielen)
      tagesformAktiv: true, // Tagesform-Frage vor der ersten Lerneinheit des Tages
      pausenAktiv: true,   // Bewegungspausen nach längerer Fokuszeit
      pausenIntervall: 10, // Minuten Fokuszeit bis zur Bewegungspause (5/10/15)
      ki: {                // KI-Funktionen: je Zweck eine Eltern-Freigabe (Standard: aus)
        erklaeren: false, schrift: false, aufsatz: false, bericht: false, saetze: false,
      },
      uebungsThema: "alltag", // Übungs-Welt der Satz-Übungen (Kind wählt selbst)
    },
    protokoll: [],     // Änderungsprotokoll: { zeit, bereich, art, text }
  };
}

/**
 * Hebt ein beliebiges (auch leeres/fremdes) Dokument auf das aktuelle
 * Schema. Idempotent: migrateData(migrateData(x)) === migrateData(x).
 * Verlustfrei: unbekannte Schlüssel bleiben erhalten.
 */
export function migrateData(alt, heute) {
  const quelle = alt && typeof alt === "object" && !Array.isArray(alt) ? alt : {};
  const basis = leeresDokument(heute);
  const d = { ...quelle };

  d.schemaVersion = SCHEMA_VERSION;
  if (typeof d.erstellt !== "string") d.erstellt = basis.erstellt;

  d.profil = { ...basis.profil, ...(istObjekt(quelle.profil) ? quelle.profil : {}) };
  if (typeof d.profil.name !== "string") d.profil.name = "";
  if (![3, 4].includes(d.profil.klasse)) d.profil.klasse = 4;

  d.lernstand = { ...basis.lernstand, ...(istObjekt(quelle.lernstand) ? quelle.lernstand : {}) };
  if (!istObjekt(d.lernstand.stufen)) d.lernstand.stufen = {};
  if (!Number.isFinite(d.lernstand.muenzen) || d.lernstand.muenzen < 0) d.lernstand.muenzen = 0;
  if (!Array.isArray(d.lernstand.lerntage)) d.lernstand.lerntage = [];
  if (!istObjekt(d.lernstand.rekorde)) d.lernstand.rekorde = {};
  if (!istObjekt(d.lernstand.blockwelt)) d.lernstand.blockwelt = null;
  if (!istObjekt(d.lernstand.konzentration)) d.lernstand.konzentration = null;
  if (!istObjekt(d.lernstand.vorgang)) d.lernstand.vorgang = null;
  const zeit = istObjekt(d.lernstand.zeit) ? d.lernstand.zeit : {};
  d.lernstand.zeit = {
    tag: typeof zeit.tag === "string" ? zeit.tag : "",
    sek: Number.isFinite(zeit.sek) && zeit.sek >= 0 ? Math.floor(zeit.sek) : 0,
  };
  const form = istObjekt(d.lernstand.tagesform) ? d.lernstand.tagesform : {};
  d.lernstand.tagesform = {
    tag: typeof form.tag === "string" ? form.tag : "",
    modus: ["gruen", "gelb", "rot", ""].includes(form.modus) ? form.modus : "",
  };
  if (!Number.isInteger(d.lernstand.fokusRekord) || d.lernstand.fokusRekord < 0 || d.lernstand.fokusRekord > 999) {
    d.lernstand.fokusRekord = 0;
  }
  if (!istObjekt(d.lernstand.einstufung)) d.lernstand.einstufung = null;
  const mut = istObjekt(d.lernstand.mutSatz) ? d.lernstand.mutSatz : {};
  d.lernstand.mutSatz = {
    tag: typeof mut.tag === "string" ? mut.tag : "",
    idx: Number.isInteger(mut.idx) && mut.idx >= 0 && mut.idx < STARK_SAETZE.length ? mut.idx : 0,
  };

  d.einstellungen = { ...basis.einstellungen, ...(istObjekt(quelle.einstellungen) ? quelle.einstellungen : {}) };
  if (!["hell", "dunkel"].includes(d.einstellungen.thema)) d.einstellungen.thema = "hell";
  if (!Number.isInteger(d.einstellungen.missionsZiel) || d.einstellungen.missionsZiel < 1) {
    d.einstellungen.missionsZiel = 4;
  }
  const vorgabe = istObjekt(d.einstellungen.stufenVorgabe) ? d.einstellungen.stufenVorgabe : {};
  d.einstellungen.stufenVorgabe = {
    global: [0, 1, 2, 3].includes(vorgabe.global) ? vorgabe.global : 0,
    felder: istObjekt(vorgabe.felder) ? vorgabe.felder : {},
  };
  if (!Number.isInteger(d.einstellungen.zeitLimit) || d.einstellungen.zeitLimit < 0 || d.einstellungen.zeitLimit > 180) {
    d.einstellungen.zeitLimit = 20;
  }
  if (!istObjekt(d.einstellungen.spieleAktiv)) d.einstellungen.spieleAktiv = {};
  if (typeof d.einstellungen.muenzenAktiv !== "boolean") d.einstellungen.muenzenAktiv = true;
  if (typeof d.einstellungen.tagesformAktiv !== "boolean") d.einstellungen.tagesformAktiv = true;
  if (typeof d.einstellungen.pausenAktiv !== "boolean") d.einstellungen.pausenAktiv = true;
  if (![5, 10, 15].includes(d.einstellungen.pausenIntervall)) d.einstellungen.pausenIntervall = 10;
  if (!["alltag", "angeln", "tennis", "fussball"].includes(d.einstellungen.uebungsThema)) {
    d.einstellungen.uebungsThema = "alltag";
  }
  const ki = istObjekt(d.einstellungen.ki) ? d.einstellungen.ki : {};
  d.einstellungen.ki = {
    erklaeren: ki.erklaeren === true, schrift: ki.schrift === true, aufsatz: ki.aufsatz === true,
    bericht: ki.bericht === true, saetze: ki.saetze === true,
  };

  if (!Array.isArray(d.protokoll)) d.protokoll = [];

  return d;
}

function istObjekt(x) {
  return !!x && typeof x === "object" && !Array.isArray(x);
}
