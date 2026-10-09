import { useEffect, useMemo, useState } from "react";
import { useApp } from "../appContext.jsx";
import { MATHE_DATEN, MATHE_BEREICHE } from "../calc/aufgaben/mathe.js";
import { SACH_DATEN, SACH_BEREICHE } from "../calc/aufgaben/sachkunde.js";
import { GESCH_DATEN, ddPool, doppelPool, DEUTSCH_BEREICHE } from "../calc/aufgaben/deutsch.js";
import { subjektPool, praedikatPool, gkPool } from "../calc/aufgaben/saetze.js";
import { umstellenPool, umSatzText, umstellenPruefen } from "../calc/aufgaben/satzglieder.js";
import { KOMPASS_DEUTSCH_DATEN, KOMPASS_DEUTSCH_BEREICHE } from "../calc/aufgaben/kompassDeutsch.js";
import { zeitPool, wortartenPool, faellePool, redePool, gwsPool } from "../calc/aufgaben/deutschKonverter.js";
import { STARK_DATEN, STARK_BEREICHE } from "../calc/aufgaben/stark.js";
import { rngAusSeed } from "../calc/rng.js";
import { aktiveStufe, leererFortschritt, rundeAbschliessen, STUFEN_NAMEN, stufenMax, stufenVorgabe } from "../calc/stufen.js";
import { paketWaehlen, antwortOptionen, antwortRichtig } from "../calc/aufgabenRunde.js";
import { auswahlPruefen } from "../calc/wortTippen.js";
import { muenzenNachRunde, aufgabenZaehlen, heutigerTag, lernspur } from "../calc/lerntage.js";
import { missionsOpts, tagesModus } from "../calc/tagesform.js";
import Vorgang from "./Vorgang.jsx";
import { kiErklaeren } from "../ki.js";
import { THEMEN_WELTEN } from "../calc/aufgaben/themen.js";
import { wozuSatz } from "../calc/wozu.js";

/* Üben: drei Übungstypen über denselben Runden-/Stufen-/Münz-Mechanismus:
   - "mc":        Frage mit 2-3 Antwort-Knöpfen (Mathe, Sachkunde, Deutsch-MC, Stark)
   - "tippen":    Wörter im Satz antippen (Subjekte, Prädikate, Groß & Klein)
   - "umstellen": Satzglied-Bausteine neu zusammenbauen + Zeit/Ort erkennen
   Feinschliff (Fokus-Modus) folgt später. */

// 🎨 Die Satz-Übungen folgen der gewählten Übungs-Welt (Alltag/Angeln/
// Tennis/Fußball) – Regel- und Wissens-Pools bleiben themenfrei.
function deutschDaten(thema) {
  return {
    subj: subjektPool(thema), praed: praedikatPool(thema), gk: gkPool(thema), rede: redePool(thema),
    zeit: zeitPool(thema), wa: wortartenPool(thema), faelle: faellePool(thema), gws: gwsPool(),
    gesch: GESCH_DATEN, dd: ddPool(), doppel: doppelPool(), satzglied: umstellenPool(),
    ...KOMPASS_DEUTSCH_DATEN, // 🧭 Kompass-Training (themenfrei)
  };
}
const DEUTSCH_LISTE = [
  { key: "subj", emoji: "🔎", name: "Subjekte", typ: "tippen" },
  { key: "praed", emoji: "🧲", name: "Prädikate", typ: "tippen" },
  { key: "satzglied", emoji: "🔀", name: "Satzglieder umstellen", typ: "umstellen" },
  { key: "rede", emoji: "💬", name: "Wörtliche Rede", typ: "tippen" },
  { key: "zeit", emoji: "⏳", name: "Zeitformen" },
  { key: "wa", emoji: "🏷️", name: "Wortarten" },
  { key: "faelle", emoji: "🎯", name: "Die 4 Fälle" },
  { key: "gk", emoji: "🔠", name: "Groß & Klein", typ: "tippen" },
  { key: "gws", emoji: "📖", name: "Grundwortschatz" },
  ...DEUTSCH_BEREICHE,
  ...KOMPASS_DEUTSCH_BEREICHE, // 🧭 die Aufgabenformate aus dem Kompass-4-Test
  { key: "vorgang", emoji: "📝", name: "Vorgangsbeschreibung", typ: "modul" },
];

/* 🟫 Zahlenblöcke (Dienes-Material wie in der Schule): Tausenderwürfel,
   Hunderterplatte, Zehnerstange, Einerwürfel – als Grafik statt nur
   Text. Große Blöcke zuerst, bei vielen Blöcken wird umgebrochen. */
const ZB = { fuellung: "#eac089", rand: "#9a6a33", linie: "rgba(122, 80, 35, 0.45)" };
function zbEiner(key) {
  return (
    <svg key={key} width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <rect x="1" y="1" width="14" height="14" rx="2" fill={ZB.fuellung} stroke={ZB.rand} strokeWidth="1.5" />
    </svg>
  );
}
function zbZehner(key) {
  return (
    <svg key={key} width="16" height="76" viewBox="0 0 16 76" aria-hidden="true">
      <rect x="1" y="1" width="14" height="74" rx="2" fill={ZB.fuellung} stroke={ZB.rand} strokeWidth="1.5" />
      {Array.from({ length: 9 }, (_, i) => (
        <line key={i} x1="1" y1={8.4 + i * 7.3} x2="15" y2={8.4 + i * 7.3} stroke={ZB.linie} strokeWidth="1" />
      ))}
    </svg>
  );
}
function zbHunderter(key) {
  return (
    <svg key={key} width="76" height="76" viewBox="0 0 76 76" aria-hidden="true">
      <rect x="1" y="1" width="74" height="74" rx="2" fill={ZB.fuellung} stroke={ZB.rand} strokeWidth="1.5" />
      {Array.from({ length: 9 }, (_, i) => (
        <g key={i}>
          <line x1="1" y1={8.4 + i * 7.3} x2="75" y2={8.4 + i * 7.3} stroke={ZB.linie} strokeWidth="1" />
          <line x1={8.4 + i * 7.3} y1="1" x2={8.4 + i * 7.3} y2="75" stroke={ZB.linie} strokeWidth="1" />
        </g>
      ))}
    </svg>
  );
}
function zbTausender(key) {
  // Würfel mit einfacher 3D-Andeutung (Deckel + Seite dunkler)
  return (
    <svg key={key} width="92" height="92" viewBox="0 0 92 92" aria-hidden="true">
      <polygon points="1,17 17,1 91,1 75,17" fill="#dba968" stroke={ZB.rand} strokeWidth="1.5" />
      <polygon points="75,17 91,1 91,75 75,91" fill="#c08f4e" stroke={ZB.rand} strokeWidth="1.5" />
      <rect x="1" y="17" width="74" height="74" rx="2" fill={ZB.fuellung} stroke={ZB.rand} strokeWidth="1.5" />
      {Array.from({ length: 9 }, (_, i) => (
        <g key={i}>
          <line x1="1" y1={24.4 + i * 7.3} x2="75" y2={24.4 + i * 7.3} stroke={ZB.linie} strokeWidth="1" />
          <line x1={8.4 + i * 7.3} y1="17" x2={8.4 + i * 7.3} y2="91" stroke={ZB.linie} strokeWidth="1" />
        </g>
      ))}
    </svg>
  );
}
function ZahlenBloecke({ b }) {
  const gruppen = [
    { n: b.t || 0, mal: zbTausender, name: "Tausender" },
    { n: b.h || 0, mal: zbHunderter, name: "Hunderter" },
    { n: b.z || 0, mal: zbZehner, name: "Zehner" },
    { n: b.e || 0, mal: zbEiner, name: "Einer" },
  ].filter((g) => g.n > 0);
  const label = gruppen.map((g) => `${g.n} ${g.name}`).join(", ");
  return (
    <div data-test="zahlen-bloecke" role="img" aria-label={`Zahlenblöcke: ${label}`}
      style={{
        display: "flex", flexWrap: "wrap", alignItems: "flex-end", gap: 6,
        background: "var(--grund)", borderRadius: "var(--radius-klein)", padding: "12px 14px", margin: "10px 0",
      }}>
      {gruppen.flatMap((g) => Array.from({ length: g.n }, (_, i) => g.mal(`${g.name}-${i}`)))}
    </div>
  );
}

/* ⏳ Zeitstrahl: visueller Anker für die Zeitformen (gestern–jetzt–morgen). */
function ZeitStrahl() {
  return (
    <div data-test="zeit-strahl" aria-hidden="true"
      style={{ background: "var(--grund)", borderRadius: "var(--radius-klein)", padding: "8px 10px", margin: "8px 0" }}>
      <svg viewBox="0 0 320 54" style={{ width: "100%", maxWidth: 420, display: "block", margin: "0 auto" }}>
        <line x1="12" y1="26" x2="308" y2="26" stroke="var(--rand)" strokeWidth="3" strokeLinecap="round" />
        <polygon points="308,26 298,21 298,31" fill="var(--rand)" />
        {[
          { x: 55, label: "GESTERN", unten: "war", farbe: "#b07a3c" },
          { x: 160, label: "JETZT", unten: "ist", farbe: "var(--primaer)" },
          { x: 265, label: "MORGEN", unten: "wird", farbe: "#3f9d54" },
        ].map((p2) => (
          <g key={p2.label}>
            <circle cx={p2.x} cy="26" r="7" fill={p2.farbe} />
            <text x={p2.x} y="12" textAnchor="middle" fontSize="11" fontWeight="800" fill="var(--text)" fontFamily="system-ui">{p2.label}</text>
            <text x={p2.x} y="48" textAnchor="middle" fontSize="11" fill="var(--text-leise)" fontFamily="system-ui">{p2.unten}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

function faecherBauen(thema) {
  return [
    { id: "deutsch", emoji: "📗", name: "Deutsch", bereiche: DEUTSCH_LISTE, daten: deutschDaten(thema) },
    { id: "mathe", emoji: "🔢", name: "Mathe", bereiche: MATHE_BEREICHE, daten: MATHE_DATEN },
    { id: "sachkunde", emoji: "🌍", name: "Sachkunde", bereiche: SACH_BEREICHE, daten: SACH_DATEN },
    { id: "stark", emoji: "💪", name: "Stark", bereiche: STARK_BEREICHE, daten: { stark: STARK_DATEN } },
  ];
}

export default function Ueben() {
  const { data, logChange, T, heute, fokus, uebenZiel, uebenZielSetzen } = useApp();
  const [fachId, setFachId] = useState("deutsch");
  const [runde, setRunde] = useState(null);
  const thema = data.einstellungen.uebungsThema;
  const faecher = useMemo(() => faecherBauen(thema), [thema]);
  const fach = faecher.find((f) => f.id === fachId);

  const karte = { background: T.karte, borderRadius: T.radius, padding: T.abstand, marginBottom: T.abstand };
  const primaerKnopf = { width: "100%", background: T.primaer, color: T.primaerText, fontWeight: 700 };

  const starten = (b, f = fach) => {
    if (b.typ === "modul") { setRunde({ typ: "modul", key: b.key }); return; }
    const pool = f.daten[b.key];
    const fortschritt = data.lernstand.stufen[b.key] || leererFortschritt();
    const stufe = aktiveStufe(fortschritt, data.profil.klasse, pool, stufenVorgabe(data.einstellungen, b.key));
    const paket = paketWaehlen(pool, stufe, fortschritt.runden);
    const rng = rngAusSeed(`${heute}:${b.key}:${fortschritt.runden}`);
    setRunde({
      ...b, typ: b.typ || "mc", stufe, stufenMax: stufenMax(pool), paket: paket.paket, pakete: paket.pakete,
      aufgaben: paket.aufgaben,
      optionen: (b.typ || "mc") === "mc" ? paket.aufgaben.map((a) => antwortOptionen(a, rng)) : null,
      index: 0, fehler: 0, geloest: 0,
      gewaehlt: null,   // mc: gewählte Antwort
      auswahl: [],      // tippen: gewählte Wort-Indizes
      geprueft: null,   // tippen: Ergebnis von auswahlPruefen
      folge: [],        // umstellen: gebaute Reihenfolge
      zoPhase: "zeit",  // umstellen (Zeit/Ort): erst Wann?, dann Wo?
      fertig: false,    // umstellen: Aufgabe gelöst
      fehlversuch: false,
      meldung: null,    // umstellen: { ok, text }
      ki: null,         // 🦁 Erklärer: null | {laden} | {blasen, mach, offen} | {fehler}
      lehrer: null,     // 🧑‍🏫 Lehrer-Moment: null | {offen} | {fertig}
      lehrerWar: false, // einmal pro Runde
      ergebnis: null,
    });
  };

  // 🎯 Trainingsplan-Deep-Link: Startseite wählt ein Lernfeld vor
  useEffect(() => {
    if (!uebenZiel || runde) return;
    for (const f of faecher) {
      const b = f.bereiche.find((x) => x.key === uebenZiel);
      if (b) { setFachId(f.id); starten(b, f); break; }
    }
    uebenZielSetzen(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uebenZiel]);

  // 🧑‍🏫 Lehrer-Moment: fällig ab der 5. Aufgabe – in kurzen Runden
  // (kleine Themen-Pools) spätestens bei der letzten.
  const lehrerDran = (r, richtig) =>
    richtig && !r.lehrerWar && r.index >= Math.min(4, r.aufgaben.length - 1);

  const beantwortet = runde
    ? (runde.typ === "mc" ? runde.gewaehlt !== null
      : runde.typ === "umstellen" ? runde.fertig
      : runde.geprueft !== null)
    : false;

  const antwortenMc = (wahl) => {
    if (runde.gewaehlt !== null) return;
    const richtig = antwortRichtig(runde.aufgaben[runde.index], wahl);
    if (richtig) fokus.zaehlen();
    const lehrerJetzt = lehrerDran(runde, richtig);
    setRunde({
      ...runde, gewaehlt: wahl, fehler: runde.fehler + (richtig ? 0 : 1), geloest: runde.geloest + (richtig ? 1 : 0),
      lehrer: lehrerJetzt ? { offen: true } : runde.lehrer, lehrerWar: runde.lehrerWar || lehrerJetzt,
    });
  };

  const wortToggle = (i) => {
    if (runde.geprueft) return;
    const aus = runde.auswahl.includes(i) ? runde.auswahl.filter((x) => x !== i) : [...runde.auswahl, i];
    setRunde({ ...runde, auswahl: aus });
  };

  const tippenPruefen = () => {
    const erg = auswahlPruefen(runde.aufgaben[runde.index], runde.auswahl);
    if (erg.richtig) fokus.zaehlen();
    const lehrerJetzt = lehrerDran(runde, erg.richtig);
    setRunde({
      ...runde, geprueft: erg, fehler: runde.fehler + (erg.richtig ? 0 : 1), geloest: runde.geloest + (erg.richtig ? 1 : 0),
      lehrer: lehrerJetzt ? { offen: true } : runde.lehrer, lehrerWar: runde.lehrerWar || lehrerJetzt,
    });
  };

  // --- Umstellen: Satz neu bauen (Prädikat an 2. Stelle) ---
  const umChip = (i) => {
    if (runde.fertig || runde.folge.includes(i)) return;
    const a = runde.aufgaben[runde.index];
    const folge = [...runde.folge, i];
    if (folge.length < a.teile.length) { setRunde({ ...runde, folge, meldung: null }); return; }
    const erg = umstellenPruefen(a, folge);
    if (erg.richtig) {
      fokus.zaehlen();
      const lehrerJetzt = lehrerDran(runde, true);
      setRunde({
        ...runde, folge, fertig: true, geloest: runde.geloest + (runde.fehlversuch ? 0 : 1),
        meldung: { ok: true, text: "Super umgestellt! 🌟 Das Prädikat steht an 2. Stelle – der Satz stimmt." },
        lehrer: lehrerJetzt ? { offen: true } : runde.lehrer, lehrerWar: runde.lehrerWar || lehrerJetzt,
      });
    } else {
      setRunde({
        ...runde, folge: [], fehlversuch: true, fehler: runde.fehler + 1,
        meldung: {
          ok: false,
          text: erg.grund === "gleich"
            ? "Das ist noch der Ausgangssatz – stelle die Satzglieder in eine ANDERE Reihenfolge!"
            : `Fast! Das Prädikat (die Verb-Karte „${a.teile[a.verb]}“) muss an 2. Stelle stehen.`,
        },
      });
    }
  };

  // --- Umstellen (Zeit/Ort): erst die Zeit-, dann die Ortsbestimmung ---
  const zoChip = (i) => {
    if (runde.fertig) return;
    const a = runde.aufgaben[runde.index];
    if (runde.zoPhase === "zeit") {
      if (i === a.zeit) {
        setRunde({ ...runde, zoPhase: "ort", meldung: { ok: true, text: "Genau, das ist die Zeitbestimmung! 🕐" } });
      } else {
        setRunde({ ...runde, fehlversuch: true, fehler: runde.fehler + 1, meldung: { ok: false, text: "Das ist keine Zeitbestimmung. Frage dich: WANN passiert es?" } });
      }
    } else if (a.ort !== null && i === a.ort) {
      fokus.zaehlen();
      setRunde({
        ...runde, fertig: true, geloest: runde.geloest + (runde.fehlversuch ? 0 : 1),
        meldung: { ok: true, text: "Richtig, das ist die Ortsbestimmung! 📍🌟" },
      });
    } else {
      setRunde({
        ...runde, fehlversuch: true, fehler: runde.fehler + 1,
        meldung: {
          ok: false,
          text: a.ort === null
            ? "Schau genau: Sagt dieses Satzglied wirklich, WO etwas passiert?"
            : "Das ist kein Ort. Frage dich: WO passiert es?",
        },
      });
    }
  };

  const zoKeine = () => {
    if (runde.fertig || runde.zoPhase !== "ort") return;
    const a = runde.aufgaben[runde.index];
    if (a.ort === null) {
      fokus.zaehlen();
      setRunde({
        ...runde, fertig: true, geloest: runde.geloest + (runde.fehlversuch ? 0 : 1),
        meldung: { ok: true, text: "Stark! Dieser Satz hat wirklich KEINE Ortsbestimmung. 🌟" },
      });
    } else {
      setRunde({ ...runde, fehlversuch: true, fehler: runde.fehler + 1, meldung: { ok: false, text: "Doch, eine Ortsbestimmung versteckt sich im Satz. WO passiert es?" } });
    }
  };

  // 🦁 „Erklär es mir anders“ (KI, Eltern-Freigabe nötig): holt höchstens
  // 2 kurze Blasen + eine Mach-Aufgabe – selbst getaktet, Lösung bleibt geheim.
  const erklaerungHolen = async () => {
    const idx = runde.index;
    const a = runde.aufgaben[idx];
    setRunde((r) => ({ ...r, ki: { laden: true } }));
    const istMc = runde.typ === "mc";
    const erg = await kiErklaeren({
      fach: fach.name, bereich: runde.name,
      frage: istMc ? a.f : (a.frage || "Satzglieder umstellen"),
      optionen: istMc ? [a.r, ...a.x] : undefined,
      loesung: istMc ? a.r : (a.loesung || ""),
      tipp: a.tipp || "", kontext: a.kontext || "",
      modell: data.einstellungen.ki.modell,
    });
    setRunde((r) => {
      if (r.index !== idx || !r.ki) return r;
      return { ...r, ki: erg.ok ? { blasen: erg.blasen, mach: erg.mach, offen: 1 } : { fehler: erg.grund } };
    });
  };

  const weiter = () => {
    if (runde.index + 1 < runde.aufgaben.length) {
      setRunde({
        ...runde, index: runde.index + 1, gewaehlt: null, auswahl: [], geprueft: null,
        folge: [], zoPhase: "zeit", fertig: false, fehlversuch: false, meldung: null, ki: null, lehrer: null,
      });
      return;
    }
    const pool = fach.daten[runde.key];
    const rot = tagesModus(data.lernstand.tagesform, heute) === "rot";
    const erg = rundeAbschliessen(data.lernstand.stufen[runde.key], { fehler: runde.fehler, klasse: data.profil.klasse, pool, stufenStopp: rot });
    const neu = {
      ...data,
      lernstand: {
        ...data.lernstand,
        stufen: { ...data.lernstand.stufen, [runde.key]: erg.fortschritt },
        muenzen: muenzenNachRunde(data.lernstand.muenzen),
        lerntage: aufgabenZaehlen(data.lernstand.lerntage, heute, runde.geloest, missionsOpts(data.einstellungen, data.lernstand.tagesform, heute)),
      },
    };
    logChange(neu, "ueben", "neu", `Runde ${runde.name} (Stufe ${runde.stufe}): ${runde.geloest} von ${runde.aufgaben.length} gelöst`);
    setRunde({ ...runde, ergebnis: erg });
  };

  // --- Modul (Vorgangsbeschreibung): eigene Ansicht statt Runde ---
  if (runde?.typ === "modul") {
    return <Vorgang zurueck={() => setRunde(null)} />;
  }

  // --- Ergebnis-Karte ---
  if (runde?.ergebnis) {
    const tag = heutigerTag(data.lernstand.lerntage, heute);
    return (
      <div data-test="runde-ergebnis">
        <div style={karte}>
          <h2 style={{ marginTop: 0 }}>🎉 Runde geschafft!</h2>
          <p><b>{runde.geloest} von {runde.aufgaben.length}</b> richtig · 🪙 +1 Münze (jetzt {data.lernstand.muenzen})</p>
          {runde.ergebnis.stufeNeu && <p style={{ color: T.ok }}>⭐ Stark – Stufe {runde.stufe + 1} ist freigeschaltet!</p>}
          {runde.ergebnis.krone && <p style={{ color: T.ok }}>👑 Krone! Du hast die höchste Stufe fehlerfrei gemeistert.</p>}
          {fokus.serie() >= 3 && (
            <p data-test="fokus-serie" style={{ color: T.ok }}>
              🔥 Fokus-Serie: <b>{fokus.serie()} Aufgaben am Stück</b>
              {fokus.serie() >= data.lernstand.fokusRekord ? " – dein Rekord!" : ` · Rekord: ${data.lernstand.fokusRekord}`}
            </p>
          )}
          <p style={{ color: T.textLeise, fontSize: "var(--schrift-klein)" }}>
            Heute: {tag.missionen} Mini-Mission{tag.missionen === 1 ? "" : "en"}
            {tag.zielErreicht ? " · 🎯 Tagesziel erreicht!" : ""}
            {lernspur(data.lernstand.lerntage, heute) > 1 ? ` · 🛤️ Lernspur: ${lernspur(data.lernstand.lerntage, heute)} Tage` : ""}
          </p>
          <button data-test="nochmal-knopf" onClick={() => starten(runde)} style={{ ...primaerKnopf, marginBottom: 8 }}>
            🔁 Noch eine Runde
          </button>
          <button data-test="zu-bereichen" onClick={() => setRunde(null)}
            style={{ width: "100%", background: T.weich, color: T.text, fontWeight: 700 }}>
            ← Andere Übung wählen
          </button>
        </div>
      </div>
    );
  }

  // --- Aufgaben-Karte ---
  if (runde) {
    const a = runde.aufgaben[runde.index];
    return (
      <div data-test="frage-karte">
        <div style={karte}>
          <p style={{ margin: "0 0 2px", color: T.textLeise, fontSize: "var(--schrift-klein)" }}>
            {runde.emoji} {runde.name} · Aufgabe {runde.index + 1} von {runde.aufgaben.length}
            {runde.pakete > 1 ? ` · Paket ${runde.paket}/${runde.pakete}` : ""} ·
            🎯 Stufe {runde.stufe}/{runde.stufenMax} ({STUFEN_NAMEN[runde.stufe]})
          </p>
          {runde.index === 0 && wozuSatz(runde.key) && (
            <p data-test="wozu-anker" style={{ margin: "2px 0 0", color: T.textLeise, fontSize: "var(--schrift-klein)" }}>
              🧭 <b>Wozu?</b> {wozuSatz(runde.key)}
            </p>
          )}
          {runde.key === "zeit" && <ZeitStrahl />}

          {runde.typ === "mc" ? (
            <>
              {a.kontext && (
                <p data-test="frage-kontext" style={{ background: T.grund, borderRadius: T.radiusKlein, padding: "10px 12px" }}>{a.kontext}</p>
              )}
              <p data-test="frage-text" style={{ fontSize: "var(--schrift-gross)", fontWeight: 700, margin: "10px 0" }}>{a.f}</p>
              {a.bloecke && <ZahlenBloecke b={a.bloecke} />}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {runde.optionen[runde.index].map((o) => (
                  <button key={o} data-test="antwort-opt" data-richtig={o === a.r ? "1" : undefined}
                    disabled={beantwortet} onClick={() => antwortenMc(o)}
                    style={{
                      background: beantwortet && o === a.r ? "var(--ok)" : T.weich,
                      color: beantwortet && o === a.r ? "#fff" : T.text,
                      fontWeight: 700, textAlign: "left", padding: "0 14px",
                      opacity: beantwortet && o !== a.r && o !== runde.gewaehlt ? 0.6 : 1,
                    }}>
                    {o}
                  </button>
                ))}
              </div>
              {beantwortet && (
                <p data-test="feedback" style={{ color: antwortRichtig(a, runde.gewaehlt) ? T.ok : T.warn }}>
                  {antwortRichtig(a, runde.gewaehlt) ? "Richtig! 🌟 " : <>Fast! Richtig ist <b>{a.r}</b>. 💡 </>}{a.tipp}
                </p>
              )}
            </>
          ) : runde.typ === "umstellen" ? (
            <>
              {a.art === "um" ? (
                <>
                  <p data-test="frage-text" style={{ margin: "10px 0 4px" }}>
                    Ausgangssatz: <b style={{ fontSize: "var(--schrift-gross)" }}>{umSatzText(a.teile, a.teile.map((_, i) => i))}</b>
                  </p>
                  <p style={{ margin: "0 0 10px", color: T.textLeise, fontSize: "var(--schrift-klein)" }}>
                    💡 Baue ihn <b>NEU</b> – das Prädikat (Verb) bleibt an <b>2. Stelle</b>.
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {a.teile.map((t2, i) => (
                      <button key={i} data-test="um-chip" data-i={i}
                        disabled={runde.fertig || runde.folge.includes(i)} onClick={() => umChip(i)}
                        style={{
                          background: runde.folge.includes(i) ? T.primaer : T.weich,
                          color: runde.folge.includes(i) ? T.primaerText : T.text,
                          fontWeight: 700, padding: "0 12px", whiteSpace: "nowrap",
                        }}>
                        {t2}
                      </button>
                    ))}
                  </div>
                  <p data-test="um-bau" style={{ background: T.grund, borderRadius: T.radiusKlein, padding: "10px 12px", minHeight: 24, fontWeight: 700 }}>
                    {runde.folge.length
                      ? (runde.fertig ? umSatzText(a.teile, runde.folge) : runde.folge.map((i) => a.teile[i]).join(" ") + " …")
                      : " "}
                  </p>
                  {!runde.fertig && runde.folge.length > 0 && (
                    <button data-test="um-reset" onClick={() => setRunde({ ...runde, folge: [], meldung: null })}
                      style={{ background: "transparent", color: T.textLeise, fontSize: "var(--schrift-klein)" }}>
                      🔄 Neu bauen
                    </button>
                  )}
                </>
              ) : (
                <>
                  <p data-test="frage-text" style={{ fontSize: "var(--schrift)", fontWeight: 700, margin: "10px 0" }}>
                    {runde.zoPhase === "zeit"
                      ? <>Tippe die <span style={{ color: "#c77800" }}>Zeitbestimmung</span> an! <span style={{ color: T.textLeise, fontWeight: 400 }}>(Wann?)</span></>
                      : <>Und jetzt: Tippe die <span style={{ color: "#1e6b34" }}>Ortsbestimmung</span> an! <span style={{ color: T.textLeise, fontWeight: 400 }}>(Wo?)</span></>}
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {a.teile.map((t2, i) => {
                      const zeitOk = runde.zoPhase === "ort" && i === a.zeit;
                      const ortOk = runde.fertig && a.ort !== null && i === a.ort;
                      return (
                        <button key={i} data-test="zo-chip" data-i={i} disabled={runde.fertig} onClick={() => zoChip(i)}
                          style={{
                            background: ortOk ? "#c9edcc" : zeitOk ? "#ffd9a0" : T.weich,
                            color: zeitOk || ortOk ? "#333" : T.text,
                            fontWeight: 700, padding: "0 12px", whiteSpace: "nowrap",
                          }}>
                          {t2}
                        </button>
                      );
                    })}
                  </div>
                  {runde.zoPhase === "ort" && !runde.fertig && (
                    <button data-test="zo-keine" onClick={zoKeine}
                      style={{ marginTop: 10, background: T.weich, color: T.text, fontWeight: 700 }}>
                      🚫 Keine da!
                    </button>
                  )}
                </>
              )}
              {runde.meldung && (
                <p data-test="feedback" style={{ color: runde.meldung.ok ? T.ok : T.warn }}>{runde.meldung.text}</p>
              )}
            </>
          ) : (
            <>
              <p data-test="frage-text" style={{ fontSize: "var(--schrift)", fontWeight: 700, margin: "10px 0" }}>{a.frage}</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {a.woerter.map((w, i) => {
                  const gewaehlt = runde.auswahl.includes(i);
                  const istZiel = a.ziel.includes(i);
                  let hintergrund = gewaehlt ? T.primaer : T.weich;
                  let farbe = gewaehlt ? T.primaerText : T.text;
                  if (runde.geprueft) {
                    if (istZiel) { hintergrund = "var(--ok)"; farbe = "#fff"; }
                    else if (gewaehlt) { hintergrund = "var(--warn)"; farbe = "#fff"; }
                  }
                  return (
                    <button key={i} data-test="wort-chip" data-ziel={istZiel ? "1" : undefined}
                      disabled={!!runde.geprueft} onClick={() => wortToggle(i)}
                      style={{ background: hintergrund, color: farbe, fontWeight: 700, padding: "0 12px", fontSize: "var(--schrift-gross)", whiteSpace: "nowrap" }}>
                      {w}
                    </button>
                  );
                })}
              </div>
              {!runde.geprueft ? (
                <button data-test="pruefen-knopf" disabled={runde.auswahl.length === 0} onClick={tippenPruefen}
                  style={{ ...primaerKnopf, marginTop: 12, background: T.weich, color: T.text }}>
                  ✓ Prüfen
                </button>
              ) : (
                <p data-test="feedback" style={{ color: runde.geprueft.richtig ? T.ok : T.warn }}>
                  {runde.geprueft.richtig
                    ? "Richtig! 🌟 "
                    : <>Fast! Die Lösung ist <b>{a.loesung}</b> (grün markiert). 💡 </>}{a.tipp}
                </p>
              )}
            </>
          )}

          {runde.lehrer && (
            <div className="mut-dialog" data-test="lehrer-moment">
              <div className="mut-kopf">🧑‍🏫 <b>Lehrer-Moment</b> – jetzt bist DU dran!</div>
              <div className="bubble coach">
                {runde.lehrer.fertig
                  ? "🌟 Stark erklärt! Was du erklären kannst, sitzt doppelt."
                  : "Richtig! Jetzt sag mir LAUT, WARUM das stimmt – ich höre zu! 👂"}
              </div>
              {!runde.lehrer.fertig && (
                <button data-test="lehrer-fertig" className="bw-knopf mut-weiter"
                  onClick={() => setRunde({ ...runde, lehrer: { fertig: true } })}>
                  ✅ Hab ich erklärt
                </button>
              )}
            </div>
          )}

          {(() => {
            const falsch =
              runde.typ === "mc" ? (runde.gewaehlt !== null && !antwortRichtig(a, runde.gewaehlt))
              : runde.typ === "tippen" ? (runde.geprueft && !runde.geprueft.richtig)
              : (runde.meldung && !runde.meldung.ok && !runde.fertig);
            if (!data.einstellungen.ki.erklaeren || !falsch) return null;
            const k = runde.ki;
            if (!k) {
              return (
                <button data-test="ki-erklaer-knopf" onClick={erklaerungHolen}
                  style={{ width: "100%", marginTop: 8, background: T.weich, color: T.text, fontWeight: 700 }}>
                  🦁 Erklär es mir anders
                </button>
              );
            }
            if (k.laden) return <p data-test="ki-laden" style={{ color: T.textLeise }}>🦁 Leo überlegt …</p>;
            if (k.fehler) {
              return (
                <p data-test="ki-fehler" style={{ color: T.textLeise, fontSize: "var(--schrift-klein)" }}>
                  {k.fehler === "deckel" ? "🦁 Leos Erklär-Budget ist für diesen Monat aufgebraucht – der Tipp oben hilft dir weiter!"
                    : "🦁 Leo ist gerade nicht erreichbar – der Tipp oben hilft dir weiter!"}
                </p>
              );
            }
            return (
              <div className="mut-dialog" data-test="ki-erklaerung">
                <div className="mut-kopf">🦁 <b>Coach Leo</b> erklärt es anders</div>
                {k.blasen.slice(0, k.offen).map((b, i) => (
                  <div key={i} className="bubble coach" data-test="ki-blase">{b}</div>
                ))}
                {k.offen < k.blasen.length ? (
                  <button data-test="ki-weiter" className="bw-knopf mut-weiter"
                    onClick={() => setRunde({ ...runde, ki: { ...k, offen: k.offen + 1 } })}>
                    💬 Weiter
                  </button>
                ) : (
                  <div className="bubble kind" data-test="ki-mach">👆 <b>Mach-Aufgabe:</b> {k.mach}</div>
                )}
              </div>
            );
          })()}

          <button data-test="weiter-knopf" disabled={!beantwortet} onClick={weiter}
            style={{ ...primaerKnopf, marginTop: 8 }}>
            {runde.index + 1 < runde.aufgaben.length ? "Weiter" : "Runde abschließen"}
          </button>
        </div>
        <button data-test="abbrechen" onClick={() => setRunde(null)}
          style={{ background: "transparent", color: T.textLeise, fontSize: "var(--schrift-klein)" }}>
          ← Abbrechen (zählt nicht)
        </button>
      </div>
    );
  }

  // --- Bereichs-Wahl ---
  return (
    <div data-test="ueben-bereiche">
      <div style={{ display: "flex", gap: 8, marginBottom: T.abstand }}>
        {faecher.map((f) => (
          <button key={f.id} data-test={`ueben-fach-${f.id}`} onClick={() => setFachId(f.id)}
            style={{
              flex: 1, fontWeight: 700, padding: "0 4px",
              background: f.id === fachId ? T.primaer : T.weich,
              color: f.id === fachId ? T.primaerText : T.text,
            }}>
            {f.emoji} {f.name}
          </button>
        ))}
      </div>
      {fachId === "deutsch" && (
        <div style={{ ...karte, paddingTop: 12, paddingBottom: 12 }}>
          <p style={{ margin: "0 0 8px", fontSize: "var(--schrift-klein)" }}>
            <b>🎨 Deine Übungs-Welt</b> <span style={{ color: T.textLeise }}>– für die Satz-Übungen (Subjekte bis Die 4 Fälle)</span>
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {THEMEN_WELTEN.map((w) => (
              <button key={w.key} data-test={`thema-${w.key}`}
                onClick={() => logChange({ ...data, einstellungen: { ...data.einstellungen, uebungsThema: w.key } },
                  "einstellungen", "geaendert", `Übungs-Welt: ${w.name}`)}
                style={{
                  flex: "1 1 auto", fontWeight: 700, padding: "0 12px", whiteSpace: "nowrap",
                  background: thema === w.key ? T.primaer : T.weich,
                  color: thema === w.key ? T.primaerText : T.text,
                }}>
                {w.emoji} {w.name}
              </button>
            ))}
          </div>
        </div>
      )}
      {fach.bereiche.map((b) => {
        const fortschritt = data.lernstand.stufen[b.key];
        const stufe = b.typ === "modul" ? null
          : aktiveStufe(fortschritt, data.profil.klasse, fach.daten[b.key], stufenVorgabe(data.einstellungen, b.key));
        return (
          <button key={b.key} data-test={`bereich-${b.key}`} onClick={() => starten(b)}
            style={{ ...karte, width: "100%", textAlign: "left", display: "block", border: `1px solid ${T.rand}` }}>
            <b>{b.emoji} {b.name}</b>
            <span style={{ float: "right", color: T.textLeise, fontSize: "var(--schrift-klein)" }}>
              {data.lernstand.einstufung?.empfehlung?.includes(b.key) ? "🎯 empfohlen · " : ""}
              {stufe === null ? "✏️ Üben + Schreiben" : <>🎯 Stufe {stufe}{fortschritt?.krone ? " 👑" : ""}</>}
            </span>
          </button>
        );
      })}
      <p style={{ color: T.textLeise, fontSize: "var(--schrift-klein)" }}>
        Tipp: Eine fehlerfreie Runde schaltet die nächste Stufe frei – und jede
        Runde bringt eine 🪙 Münze für die Spielhalle.
      </p>
    </div>
  );
}
