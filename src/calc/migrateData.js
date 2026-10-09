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
import { FESTE_TERMINE_STANDARD, mittagErzwingen } from "./wochenplan.js";

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
      schrift: null,             // Schreib-Training: { reise: [{tag, satz, buchstabe, thumb, gross}] }
      aufsatz: { tag: "" },      // Aufsatz-Check: letzter belohnter Tag (1 Münze/Tag)
      wochenplan: null,          // 🗓️ selbst gesetztes Pensum: { montag, bloecke: [{id, tag, typ}] }
      karteikasten: { stand: {}, runden: 0 }, // 🗃️ Leitner-Kasten: Karte → { fach 1-3, zuletzt }
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
        modell: "sonnet",  // Leo-Modell: haiku (günstig) | sonnet (empfohlen) | opus (Premium)
      },
      uebungsThema: "alltag", // Übungs-Welt der Satz-Übungen (Kind wählt selbst)
      eigeneSaetze: [],    // von den Eltern freigegebene Schreib-Sätze (max 12)
      termine: [],         // 🗓️ Klassenarbeiten/Kompass-Tests/WDWs: { id, tag, art, fach }
      festeTermine: FESTE_TERMINE_STANDARD, // 🔒 wöchentlich feste Termine (Minuten-Slots)
      planRoutine: [],     // 🔁 Wochen-Routine: { tag, slot, typ } (ohne Freunde-Zeit)
      bausteine: { aus: [], namen: {}, eigene: [] }, // 🧩 Plan-Kategorien: ausgeblendet/umbenannt/eigene
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
  if (!istObjekt(d.lernstand.schrift)) d.lernstand.schrift = null;
  const aufsatz = istObjekt(d.lernstand.aufsatz) ? d.lernstand.aufsatz : {};
  d.lernstand.aufsatz = { tag: typeof aufsatz.tag === "string" ? aufsatz.tag : "" };
  // 🗓️ Wochenplan: Mehr-Wochen-Format { plaene: { [montag]: {…} } };
  // Alt-Formate (eine Woche + „naechste") werden verlustfrei angehoben.
  const wp = d.lernstand.wochenplan;
  const wochePruefen = (w) => ({
    bloecke: (Array.isArray(w.bloecke) ? w.bloecke : []).filter((b) => istObjekt(b)).slice(0, 60),
    belohnt: (Array.isArray(w.belohnt) ? w.belohnt : []).filter((t) => typeof t === "string").slice(-7),
    ausfaelle: (Array.isArray(w.ausfaelle) ? w.ausfaelle : []).filter((a) => istObjekt(a)).slice(0, 20),
  });
  if (istObjekt(wp) && istObjekt(wp.plaene)) {
    const plaene = {};
    for (const [k, w] of Object.entries(wp.plaene)) {
      if (/^\d{4}-\d{2}-\d{2}$/.test(k) && istObjekt(w)) plaene[k] = wochePruefen(w);
    }
    const schluessel = Object.keys(plaene).sort();
    for (const k of schluessel.slice(0, Math.max(0, schluessel.length - 60))) delete plaene[k];
    d.lernstand.wochenplan = { plaene };
  } else if (istObjekt(wp) && typeof wp.montag === "string" && Array.isArray(wp.bloecke)) {
    const plaene = { [wp.montag]: wochePruefen(wp) };
    if (istObjekt(wp.naechste) && typeof wp.naechste.montag === "string" && Array.isArray(wp.naechste.bloecke)) {
      plaene[wp.naechste.montag] = wochePruefen(wp.naechste);
    }
    d.lernstand.wochenplan = { plaene };
  } else {
    d.lernstand.wochenplan = null;
  }
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
  d.einstellungen.eigeneSaetze = (Array.isArray(d.einstellungen.eigeneSaetze) ? d.einstellungen.eigeneSaetze : [])
    .filter((s) => typeof s === "string" && s.trim().length >= 1 && s.length <= 80)
    .map((s) => s.trim()).slice(0, 12);
  d.einstellungen.festeTermine = Array.isArray(d.einstellungen.festeTermine)
    ? d.einstellungen.festeTermine
      .filter((f) => istObjekt(f) && Number.isInteger(f.tag) && f.tag >= 0 && f.tag <= 6
        && typeof f.name === "string" && (Number.isInteger(f.beginn) || Number.isInteger(f.slot)))
      .map((f) => {
        // Alt-Formate anheben: Index-Slot 0-4 (v0.27) bzw. volle Stunde → Minuten.
        let beginn = Number.isInteger(f.beginn) ? f.beginn
          : f.slot < 9 ? (f.slot + 14) * 60 : f.slot < 24 ? f.slot * 60 : f.slot;
        beginn = Math.min(1110, Math.max(420, beginn));
        return {
          tag: f.tag, beginn,
          dauer: Number.isInteger(f.dauer) && f.dauer >= 30 && f.dauer <= 240 ? f.dauer : 60,
          name: f.name.slice(0, 30),
          emoji: typeof f.emoji === "string" ? f.emoji.slice(0, 4) : "📌",
          hinweis: typeof f.hinweis === "string" ? f.hinweis.slice(0, 16) : "",
          aktiv: f.aktiv === true,
        };
      }).slice(0, 30)
    : FESTE_TERMINE_STANDARD;
  d.einstellungen.festeTermine = mittagErzwingen(d.einstellungen.festeTermine);
  d.einstellungen.planRoutine = (Array.isArray(d.einstellungen.planRoutine) ? d.einstellungen.planRoutine : [])
    .filter((r) => istObjekt(r) && Number.isInteger(r.tag) && r.tag >= 0 && r.tag <= 6
      && Number.isInteger(r.slot) && typeof r.typ === "string")
    .map((r) => ({ tag: r.tag, slot: r.slot, typ: r.typ.slice(0, 20) })).slice(0, 60);
  d.einstellungen.termine = (Array.isArray(d.einstellungen.termine) ? d.einstellungen.termine : [])
    .filter((t) => istObjekt(t) && /^\d{4}-\d{2}-\d{2}$/.test(t.tag) && ["ka", "kompass", "wdw"].includes(t.art))
    .map((t, i) => ({
      id: Number.isInteger(t.id) ? t.id : i + 1, tag: t.tag, art: t.art,
      fach: typeof t.fach === "string" ? t.fach.slice(0, 40) : "",
      ...(Number.isInteger(t.serie) ? { serie: t.serie } : {}),
    }))
    .slice(0, 60); // ein ganzes Schuljahr voller Termine
  const bst = istObjekt(d.einstellungen.bausteine) ? d.einstellungen.bausteine : {};
  const bstNamen = {};
  if (istObjekt(bst.namen)) {
    for (const [k, v] of Object.entries(bst.namen)) {
      if (typeof v === "string" && v.trim()) bstNamen[k.slice(0, 20)] = v.trim().slice(0, 18);
    }
  }
  d.einstellungen.bausteine = {
    aus: (Array.isArray(bst.aus) ? bst.aus : []).filter((x) => typeof x === "string").map((x) => x.slice(0, 20)).slice(0, 30),
    namen: bstNamen,
    eigene: (Array.isArray(bst.eigene) ? bst.eigene : [])
      .filter((k) => istObjekt(k) && typeof k.name === "string" && k.name.trim())
      .map((k, i) => ({
        id: Number.isInteger(k.id) ? k.id : i + 1,
        name: k.name.trim().slice(0, 18),
        emoji: typeof k.emoji === "string" && k.emoji.trim() ? k.emoji.trim().slice(0, 4) : "⭐",
      })).slice(0, 20),
  };
  const ki = istObjekt(d.einstellungen.ki) ? d.einstellungen.ki : {};
  d.einstellungen.ki = {
    erklaeren: ki.erklaeren === true, schrift: ki.schrift === true, aufsatz: ki.aufsatz === true,
    bericht: ki.bericht === true, saetze: ki.saetze === true,
    modell: ["haiku", "sonnet", "opus"].includes(ki.modell) ? ki.modell : "sonnet",
  };

  const kk = istObjekt(d.lernstand.karteikasten) ? d.lernstand.karteikasten : {};
  const kkStand = {};
  if (istObjekt(kk.stand)) {
    for (const [id, e] of Object.entries(kk.stand).slice(0, 500)) {
      if (istObjekt(e) && [1, 2, 3].includes(e.fach) && /^\d{4}-\d{2}-\d{2}$/.test(e.zuletzt)) {
        kkStand[id.slice(0, 8)] = { fach: e.fach, zuletzt: e.zuletzt };
      }
    }
  }
  d.lernstand.karteikasten = { stand: kkStand, runden: Number.isInteger(kk.runden) && kk.runden >= 0 ? kk.runden : 0 };

  if (!Array.isArray(d.protokoll)) d.protokoll = [];

  return d;
}

function istObjekt(x) {
  return !!x && typeof x === "object" && !Array.isArray(x);
}
