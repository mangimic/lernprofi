import { useState } from "react";
import { useApp } from "../appContext.jsx";
import { MATHE_DATEN } from "../calc/aufgaben/mathe.js";
import { ddPool } from "../calc/aufgaben/deutsch.js";
import { zeitPool, faellePool, gwsPool } from "../calc/aufgaben/deutschKonverter.js";
import { rngAusSeed } from "../calc/rng.js";
import { antwortOptionen, antwortRichtig } from "../calc/aufgabenRunde.js";
import {
  EINSTUFUNG_FELDER, PRO_STUFE, einstufungPlan, einstufungStufe,
  einstufungAnwenden, einstufungEmpfehlung, stufenDeutung,
} from "../calc/einstufung.js";

/* 🧪 Einstufungstest: 6 Kern-Lernfelder, je Feld erst 2 leichte
   Aufgaben – sind beide richtig, kommen 2 schwere dazu (adaptiv).
   Das Ergebnis stellt die Start-Stufe JEDES getesteten Felds genau
   ein (auch nach unten) und erstellt den Trainingsplan für die
   Startseite. Der Test ist keine Übung: keine Münzen, keine
   Missionen – und kein Tipp vor der Antwort. */

const POOLS = {
  gws: gwsPool(), dd: ddPool(), zeit: zeitPool(), faelle: faellePool(),
  mrechnen: MATHE_DATEN.mrechnen, mzahlen: MATHE_DATEN.mzahlen,
};

export default function Einstufung() {
  const { data, logChange, T, heute, navTo } = useApp();
  const [lauf, setLauf] = useState(null); // null (Intro) | Test-Zustand | { fertig: true, ... }

  const karte = { background: T.karte, borderRadius: T.radius, padding: T.abstand, marginBottom: T.abstand };
  const primaer = { width: "100%", background: T.primaer, color: T.primaerText, fontWeight: 700 };
  const weich = { width: "100%", background: T.weich, color: T.text, fontWeight: 700 };

  const starten = () => {
    const rng = rngAusSeed(`einstufung:${heute}`);
    const plan = einstufungPlan(POOLS, rng);
    setLauf({
      plan, rng,
      feldIdx: 0, teil: "easy", i: 0,
      optionen: antwortOptionen(plan[0].easy[0], rng),
      gewaehlt: null, nr: 1,
      staende: plan.map(() => ({ easyOk: 0, hardOk: 0, hardGefragt: false, fehler: 0 })),
      fertig: false,
    });
  };

  const antworten = (wahl) => {
    if (lauf.gewaehlt !== null) return;
    const feld = lauf.plan[lauf.feldIdx];
    const a = feld[lauf.teil][lauf.i];
    const richtig = antwortRichtig(a, wahl);
    const staende = lauf.staende.map((s, idx) => {
      if (idx !== lauf.feldIdx) return s;
      return {
        ...s,
        easyOk: s.easyOk + (lauf.teil === "easy" && richtig ? 1 : 0),
        hardOk: s.hardOk + (lauf.teil === "hard" && richtig ? 1 : 0),
        fehler: s.fehler + (richtig ? 0 : 1),
      };
    });
    setLauf({ ...lauf, staende, gewaehlt: wahl });
  };

  const weiter = () => {
    const l = lauf;
    const feld = l.plan[l.feldIdx];
    const stand = l.staende[l.feldIdx];
    let { feldIdx, teil, i } = l;
    const staende = l.staende.slice();

    if (teil === "easy" && i + 1 < PRO_STUFE) {
      i++;
    } else if (teil === "easy" && stand.easyOk === PRO_STUFE && feld.hard.length) {
      teil = "hard"; i = 0;
      staende[feldIdx] = { ...stand, hardGefragt: true };
    } else if (teil === "hard" && i + 1 < feld.hard.length) {
      i++;
    } else {
      feldIdx++; teil = "easy"; i = 0;
    }

    if (feldIdx >= l.plan.length) {
      // Auswertung: Stufe je Feld
      const ergebnisse = {};
      l.plan.forEach((f, idx) => {
        const s = staende[idx];
        ergebnisse[f.key] = {
          ...s, max: f.max, name: f.name, emoji: f.emoji,
          stufe: einstufungStufe({ ...s, max: f.max }),
        };
      });
      setLauf({ fertig: true, ergebnisse, empfehlung: einstufungEmpfehlung(ergebnisse) });
      return;
    }
    const a = l.plan[feldIdx][teil][i];
    setLauf({
      ...l, staende, feldIdx, teil, i,
      optionen: antwortOptionen(a, l.rng), gewaehlt: null, nr: l.nr + 1,
    });
  };

  const uebernehmen = () => {
    const kompakt = {};
    for (const [key, e] of Object.entries(lauf.ergebnisse)) {
      kompakt[key] = { stufe: e.stufe, max: e.max, fehler: e.fehler };
    }
    logChange(
      {
        ...data,
        lernstand: {
          ...data.lernstand,
          stufen: einstufungAnwenden(data.lernstand.stufen, lauf.ergebnisse),
          einstufung: { tag: heute, ergebnisse: kompakt, empfehlung: lauf.empfehlung },
        },
      },
      "ueben", "neu", "Einstufungstest ausgewertet – Stufen und Trainingsplan eingestellt",
    );
    navTo("start");
  };

  // --- Intro ---
  if (!lauf) {
    return (
      <div data-test="einstufung">
        <div style={karte}>
          <h2 style={{ marginTop: 0 }}>🧪 Einstufungstest</h2>
          <p>
            Finde deinen Start! In <b>6 Bereichen</b> (Deutsch und Mathe) löst du erst
            <b> 2 leichte</b> Aufgaben – schaffst du beide, kommen <b>2 schwere</b> dazu.
          </p>
          <p style={{ color: T.textLeise }}>
            Danach stellt die App die Stufen genau auf dich ein und baut deinen
            🎯 Trainingsplan. Der Test dauert nur ein paar Minuten, es gibt keine Noten –
            und Fehler sind ausdrücklich erlaubt: Sie zeigen nur, wo wir üben.
          </p>
          <button data-test="einstufung-los" onClick={starten} style={primaer}>🧪 Los geht's!</button>
        </div>
        <button data-test="einstufung-abbruch" onClick={() => navTo("start")}
          style={{ background: "transparent", color: T.textLeise, fontSize: "var(--schrift-klein)" }}>
          ← Zurück zur Startseite
        </button>
      </div>
    );
  }

  // --- Ergebnis ---
  if (lauf.fertig) {
    return (
      <div data-test="einstufung-ergebnis">
        <div style={karte}>
          <h2 style={{ marginTop: 0 }}>🧪 Dein Ergebnis</h2>
          {Object.values(lauf.ergebnisse).map((e) => (
            <p key={e.name} data-test="einstufung-zeile" style={{ display: "flex", justifyContent: "space-between", gap: 8, margin: "6px 0" }}>
              <span>{e.emoji} {e.name}</span>
              <b>Stufe {e.stufe} – {stufenDeutung(e.stufe, e.max)}</b>
            </p>
          ))}
          <p style={{ color: T.textLeise, fontSize: "var(--schrift-klein)" }}>
            „Übernehmen“ stellt die Stufen dieser Bereiche genau darauf ein und legt deinen
            🎯 Trainingsplan auf die Startseite{lauf.empfehlung.length ? ` (zuerst: ${lauf.empfehlung.map((k) => lauf.ergebnisse[k].name).join(", ")})` : " – alles auf Profi-Stufe, stark!"}.
          </p>
          <button data-test="einstufung-uebernehmen" onClick={uebernehmen} style={{ ...primaer, marginBottom: 8 }}>
            ✅ Übernehmen & Trainingsplan erstellen
          </button>
          <button data-test="einstufung-verwerfen" onClick={() => navTo("start")} style={weich}>
            Verwerfen (nichts ändern)
          </button>
        </div>
      </div>
    );
  }

  // --- Aufgabe ---
  const feld = lauf.plan[lauf.feldIdx];
  const a = feld[lauf.teil][lauf.i];
  const beantwortet = lauf.gewaehlt !== null;
  return (
    <div data-test="einstufung-frage">
      <div style={karte}>
        <p style={{ margin: "0 0 2px", color: T.textLeise, fontSize: "var(--schrift-klein)" }}>
          🧪 Einstufung · Bereich {lauf.feldIdx + 1} von {lauf.plan.length}: {feld.emoji} {feld.name} ·
          {lauf.teil === "easy" ? " 🌱 leicht" : " 🔥 schwer"} · Aufgabe {lauf.nr}
        </p>
        {a.kontext && <p style={{ background: T.grund, borderRadius: T.radiusKlein, padding: "10px 12px" }}>{a.kontext}</p>}
        <p data-test="frage-text" style={{ fontSize: "var(--schrift-gross)", fontWeight: 700, margin: "10px 0" }}>{a.f}</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {lauf.optionen.map((o) => (
            <button key={o} data-test="antwort-opt" data-richtig={o === a.r ? "1" : undefined}
              disabled={beantwortet} onClick={() => antworten(o)}
              style={{
                background: beantwortet && o === a.r ? "var(--ok)" : T.weich,
                color: beantwortet && o === a.r ? "#fff" : T.text,
                fontWeight: 700, textAlign: "left", padding: "0 14px",
                opacity: beantwortet && o !== a.r && o !== lauf.gewaehlt ? 0.6 : 1,
              }}>
              {o}
            </button>
          ))}
        </div>
        {beantwortet && (
          <p data-test="feedback" style={{ color: antwortRichtig(a, lauf.gewaehlt) ? T.ok : T.warn }}>
            {antwortRichtig(a, lauf.gewaehlt) ? "Richtig! 🌟" : <>Diesmal nicht – richtig ist <b>{a.r}</b>. Weiter geht's!</>}
          </p>
        )}
        <button data-test="weiter-knopf" disabled={!beantwortet} onClick={weiter} style={{ ...primaer, marginTop: 8 }}>
          Weiter
        </button>
      </div>
      <button data-test="abbrechen" onClick={() => navTo("start")}
        style={{ background: "transparent", color: T.textLeise, fontSize: "var(--schrift-klein)" }}>
        ← Abbrechen (nichts wird geändert)
      </button>
    </div>
  );
}
