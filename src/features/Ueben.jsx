import { useState } from "react";
import { useApp } from "../appContext.jsx";
import { MATHE_DATEN, MATHE_BEREICHE } from "../calc/aufgaben/mathe.js";
import { SACH_DATEN, SACH_BEREICHE } from "../calc/aufgaben/sachkunde.js";
import { rngAusSeed } from "../calc/rng.js";
import { aktiveStufe, leererFortschritt, rundeAbschliessen, STUFEN_NAMEN, stufenMax } from "../calc/stufen.js";
import { paketWaehlen, antwortOptionen, antwortRichtig } from "../calc/aufgabenRunde.js";
import { muenzenNachRunde, aufgabenZaehlen, heutigerTag, lernspur } from "../calc/lerntage.js";

/* Üben (Vorschau der Etappe 3): Mathe und Sachkunde mit dem echten
   Regelwerk – Stufen, Pakete, Münzen, Missionen. Die Ansicht ist
   bewusst schlicht; der Feinschliff (Fokus-Modus, alle Deutsch-
   Lernfelder) folgt in Etappe 4. */

const FAECHER = [
  { id: "mathe", emoji: "🔢", name: "Mathe", bereiche: MATHE_BEREICHE, daten: MATHE_DATEN },
  { id: "sachkunde", emoji: "🌍", name: "Sachkunde", bereiche: SACH_BEREICHE, daten: SACH_DATEN },
];

export default function Ueben() {
  const { data, update, logChange, T, heute } = useApp();
  const [fachId, setFachId] = useState("mathe");
  const [runde, setRunde] = useState(null); // { key, name, emoji, stufe, paket, aufgaben, optionen, index, fehler, gewaehlt }
  const fach = FAECHER.find((f) => f.id === fachId);

  const karte = { background: T.karte, borderRadius: T.radius, padding: T.abstand, marginBottom: T.abstand };

  const starten = (b) => {
    const pool = fach.daten[b.key];
    const fortschritt = data.lernstand.stufen[b.key] || leererFortschritt();
    const stufe = aktiveStufe(fortschritt, data.profil.klasse, pool);
    const paket = paketWaehlen(pool, stufe, fortschritt.runden);
    const rng = rngAusSeed(`${heute}:${b.key}:${fortschritt.runden}`);
    setRunde({
      ...b, stufe, stufenMax: stufenMax(pool), paket: paket.paket, pakete: paket.pakete,
      aufgaben: paket.aufgaben,
      optionen: paket.aufgaben.map((a) => antwortOptionen(a, rng)),
      index: 0, fehler: 0, geloest: 0, gewaehlt: null, ergebnis: null,
    });
  };

  const antworten = (wahl) => {
    if (runde.gewaehlt !== null) return;
    const richtig = antwortRichtig(runde.aufgaben[runde.index], wahl);
    setRunde({ ...runde, gewaehlt: wahl, fehler: runde.fehler + (richtig ? 0 : 1), geloest: runde.geloest + (richtig ? 1 : 0) });
  };

  const weiter = () => {
    if (runde.index + 1 < runde.aufgaben.length) {
      setRunde({ ...runde, index: runde.index + 1, gewaehlt: null });
      return;
    }
    // Runde fertig: Stufen, Münze, Lerntag – ein Dokument-Update mit Protokoll
    const pool = fach.daten[runde.key];
    const erg = rundeAbschliessen(data.lernstand.stufen[runde.key], { fehler: runde.fehler, klasse: data.profil.klasse, pool });
    const neu = {
      ...data,
      lernstand: {
        ...data.lernstand,
        stufen: { ...data.lernstand.stufen, [runde.key]: erg.fortschritt },
        muenzen: muenzenNachRunde(data.lernstand.muenzen),
        lerntage: aufgabenZaehlen(data.lernstand.lerntage, heute, runde.geloest, { missionsZiel: data.einstellungen.missionsZiel }),
      },
    };
    logChange(neu, "ueben", "neu", `Runde ${runde.name} (Stufe ${runde.stufe}): ${runde.geloest} von ${runde.aufgaben.length} gelöst`);
    setRunde({ ...runde, ergebnis: erg });
  };

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
          <p style={{ color: T.textLeise, fontSize: "var(--schrift-klein)" }}>
            Heute: {tag.missionen} Mini-Mission{tag.missionen === 1 ? "" : "en"}
            {tag.zielErreicht ? " · 🎯 Tagesziel erreicht!" : ""}
            {lernspur(data.lernstand.lerntage, heute) > 1 ? ` · 🛤️ Lernspur: ${lernspur(data.lernstand.lerntage, heute)} Tage` : ""}
          </p>
          <button data-test="nochmal-knopf" onClick={() => starten(runde)}
            style={{ width: "100%", background: T.primaer, color: T.primaerText, fontWeight: 700, marginBottom: 8 }}>
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
    const beantwortet = runde.gewaehlt !== null;
    const richtig = beantwortet && antwortRichtig(a, runde.gewaehlt);
    return (
      <div data-test="frage-karte">
        <div style={karte}>
          <p style={{ margin: "0 0 2px", color: T.textLeise, fontSize: "var(--schrift-klein)" }}>
            {runde.emoji} {runde.name} · Aufgabe {runde.index + 1} von {runde.aufgaben.length}
            {runde.pakete > 1 ? ` · Paket ${runde.paket}/${runde.pakete}` : ""} ·
            🎯 Stufe {runde.stufe}/{runde.stufenMax} ({STUFEN_NAMEN[runde.stufe]})
          </p>
          {a.kontext && (
            <p style={{ background: T.grund, borderRadius: T.radiusKlein, padding: "10px 12px" }}>{a.kontext}</p>
          )}
          <p data-test="frage-text" style={{ fontSize: "var(--schrift-gross)", fontWeight: 700, margin: "10px 0" }}>{a.f}</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {runde.optionen[runde.index].map((o) => (
              <button key={o} data-test="antwort-opt" data-richtig={o === a.r ? "1" : undefined}
                disabled={beantwortet} onClick={() => antworten(o)}
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
            <p data-test="feedback" style={{ color: richtig ? T.ok : T.warn }}>
              {richtig ? "Richtig! 🌟 " : <>Fast! Richtig ist <b>{a.r}</b>. 💡 </>}{a.tipp}
            </p>
          )}
          <button data-test="weiter-knopf" disabled={!beantwortet} onClick={weiter}
            style={{ width: "100%", background: T.primaer, color: T.primaerText, fontWeight: 700, marginTop: 8 }}>
            {runde.index + 1 < runde.aufgaben.length ? "Weiter" : "Runde abschließen"}
          </button>
        </div>
        <button onClick={() => setRunde(null)} style={{ background: "transparent", color: T.textLeise, fontSize: "var(--schrift-klein)" }}>
          ← Abbrechen (zählt nicht)
        </button>
      </div>
    );
  }

  // --- Bereichs-Wahl ---
  return (
    <div data-test="ueben-bereiche">
      <div style={{ display: "flex", gap: 8, marginBottom: T.abstand }}>
        {FAECHER.map((f) => (
          <button key={f.id} data-test={`ueben-fach-${f.id}`} onClick={() => setFachId(f.id)}
            style={{
              flex: 1, fontWeight: 700,
              background: f.id === fachId ? T.primaer : T.weich,
              color: f.id === fachId ? T.primaerText : T.text,
            }}>
            {f.emoji} {f.name}
          </button>
        ))}
      </div>
      {fach.bereiche.map((b) => {
        const fortschritt = data.lernstand.stufen[b.key];
        const stufe = aktiveStufe(fortschritt, data.profil.klasse, fach.daten[b.key]);
        return (
          <button key={b.key} data-test={`bereich-${b.key}`} onClick={() => starten(b)}
            style={{ ...karte, width: "100%", textAlign: "left", display: "block", border: `1px solid ${T.rand}` }}>
            <b>{b.emoji} {b.name}</b>
            <span style={{ float: "right", color: T.textLeise, fontSize: "var(--schrift-klein)" }}>
              🎯 Stufe {stufe}{fortschritt?.krone ? " 👑" : ""}
            </span>
          </button>
        );
      })}
      <p style={{ color: T.textLeise, fontSize: "var(--schrift-klein)" }}>
        Vorschau: Deutsch, Spiele und der Feinschliff folgen in den nächsten Etappen.
      </p>
    </div>
  );
}
