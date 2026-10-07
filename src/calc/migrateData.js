/* ============================================================
   Datenmodell und Migration – REINE Fachlogik.
   Kein DOM, keine eingebaute Uhr, kein Zufall: „heute" kommt als
   Parameter (ISO-Datum "JJJJ-MM-TT") herein.
   Der gesamte App-Zustand ist EIN Dokument mit Schemaversion.
   migrateData hebt alte Stände verlustfrei an (idempotent):
   bekannte Felder werden geprüft/ergänzt, unbekannte bleiben
   unangetastet erhalten.
   ============================================================ */
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
    },
    einstellungen: {
      thema: "hell",   // "hell" | "dunkel"
      missionsZiel: 4,
      stufenVorgabe: { global: 0, felder: {} }, // 0 = automatisch, 1-3 = fest (Eltern)
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

  if (!Array.isArray(d.protokoll)) d.protokoll = [];

  return d;
}

function istObjekt(x) {
  return !!x && typeof x === "object" && !Array.isArray(x);
}
