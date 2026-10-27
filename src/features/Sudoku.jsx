import { useMemo, useState } from "react";
import { useApp } from "../appContext.jsx";
import { aufgabenZaehlen } from "../calc/lerntage.js";
import { missionsOpts } from "../calc/tagesform.js";
import {
  SUDOKU_JE_STUFE, sudokuStufe, sudokuStand, sudokuNachSieg,
  sudokuErzeugen, konflikte,
} from "../calc/sudoku.js";

/* 🧩 Sudoku-Training: Logik lernen in Stufen – erst Mini-Sudoku mit
   den Zahlen 1–4, dann 6×6, am Ende 9×9 wie die Profis. Lern-Modus
   mit Leitplanken: Nur die richtige Zahl bleibt stehen; bei einem
   Fehlversuch LEUCHTEN die Felder, die der Zahl widersprechen – so
   lernt das Kind die Regel (Reihe, Spalte, Kästchen) nebenbei.
   Kostet keine Münze (Training) und zählt für die Mini-Missionen. */

const ZELLE = { 4: 60, 6: 48, 9: 36 };

export default function Sudoku() {
  const { data, logChange, T, heute, navTo } = useApp();
  const stand = sudokuStand(data.lernstand.sudoku);
  const meta = sudokuStufe(stand.stufe);
  const [nonce, setNonce] = useState(0);
  const raetsel = useMemo(
    () => sudokuErzeugen(stand.stufe, `${heute}:${stand.gesamt}:${nonce}`),
    [stand.stufe, stand.gesamt, nonce, heute],
  );
  const [gefuellt, setGefuellt] = useState({});   // "r-c" → richtig gesetzte Zahl
  const [gewaehlt, setGewaehlt] = useState(null); // { r, c } | null
  const [fehler, setFehler] = useState(0);
  const [hinweis, setHinweis] = useState("");
  const [leuchten, setLeuchten] = useState([]);   // Konflikt-Zellen fürs Lern-Highlight
  const [fertig, setFertig] = useState(null);     // { aufgestiegen, fehler } | null

  const g = raetsel.groesse;
  const wertVon = (r, c) => raetsel.gitter[r][c] || gefuellt[`${r}-${c}`] || 0;
  const offen = () => {
    let n = 0;
    for (let r = 0; r < g; r++) for (let c = 0; c < g; c++) if (!wertVon(r, c)) n++;
    return n;
  };

  const neuesRaetsel = () => {
    setGefuellt({}); setGewaehlt(null); setFehler(0);
    setHinweis(""); setLeuchten([]); setFertig(null);
    setNonce((n) => n + 1);
  };

  const zahlSetzen = (wert) => {
    if (!gewaehlt) { setHinweis("👉 Tippe zuerst ein leeres Feld an – dann die Zahl."); return; }
    const { r, c } = gewaehlt;
    setLeuchten([]);
    if (wert === raetsel.loesung[r][c]) {
      const neu = { ...gefuellt, [`${r}-${c}`]: wert };
      setGefuellt(neu); setGewaehlt(null); setHinweis("");
      if (Object.keys(neu).length >= raetsel.leer) sieg();
      return;
    }
    setFehler((f) => f + 1);
    const aktuell = Array.from({ length: g }, (_, i) => Array.from({ length: g }, (_, j) => wertVon(i, j)));
    const konf = konflikte(aktuell, meta, r, c, wert);
    if (konf.length) {
      setLeuchten(konf.map((k) => `${k.r}-${k.c}`));
      setHinweis(`Die ${wert} steht hier schon – schau auf die leuchtenden Felder! Jede Zahl darf in Reihe, Spalte und Kästchen nur EINmal stehen.`);
    } else {
      setHinweis(`Fast! Die ${wert} passt woanders hin – in dieses Feld gehört eine andere Zahl.`);
    }
  };

  const sieg = () => {
    const neu = sudokuNachSieg(stand);
    logChange({
      ...data,
      lernstand: {
        ...data.lernstand,
        sudoku: { stufe: neu.stufe, geloest: neu.geloest, gesamt: neu.gesamt },
        lerntage: aufgabenZaehlen(data.lernstand.lerntage, heute, 1, missionsOpts(data.einstellungen, data.lernstand.tagesform, heute)),
      },
    }, "konzentration", "neu", `Sudoku ${g}×${g} gelöst (${fehler} Fehlversuch${fehler === 1 ? "" : "e"})`);
    setFertig({ aufgestiegen: neu.aufgestiegen, fehler });
  };

  const karte = { background: T.karte, borderRadius: T.radius, padding: T.abstand, marginBottom: T.abstand };
  const zelle = ZELLE[g];
  const punkte = "🟢".repeat(stand.geloest) + "⚪".repeat(Math.max(0, SUDOKU_JE_STUFE - stand.geloest));

  if (fertig) {
    const naechste = sudokuStufe(sudokuStand(data.lernstand.sudoku).stufe);
    return (
      <div data-test="sudoku-fertig" style={karte}>
        <h2 style={{ marginTop: 0 }}>🎉 Sudoku gelöst!</h2>
        <p>
          {fertig.fehler === 0 ? "🏆 Fehlerfrei – ganz stark!" : `Du hast dich ${fertig.fehler}-mal korrigiert – genau so lernt man Sudoku.`}
        </p>
        {fertig.aufgestiegen ? (
          <p data-test="sudoku-aufstieg" style={{ fontWeight: 800 }}>
            ⬆️ Neue Stufe: {naechste.name} ({naechste.groesse}×{naechste.groesse}, Zahlen {naechste.zahlen})!
          </p>
        ) : (
          <p style={{ color: T.textLeise }}>Fortschritt zur nächsten Stufe: {punkte}</p>
        )}
        <button data-test="sudoku-nochmal" onClick={neuesRaetsel}
          style={{ width: "100%", background: T.primaer, color: T.primaerText, fontWeight: 700 }}>
          🧩 Nächstes Rätsel
        </button>
        <button onClick={() => navTo("start")}
          style={{ width: "100%", marginTop: 8, background: "transparent", color: T.textLeise, fontSize: "var(--schrift-klein)" }}>
          ← Zurück zur Startseite
        </button>
      </div>
    );
  }

  return (
    <div data-test="sudoku-seite">
      <div style={karte}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
          <h2 style={{ margin: 0 }}>🧩 Sudoku-Training</h2>
          <span data-test="sudoku-fehler" style={{ color: T.textLeise, fontSize: "var(--schrift-klein)", whiteSpace: "nowrap" }}>
            {punkte} · Fehlversuche: {fehler}
          </span>
        </div>
        <p data-test="sudoku-stufe" style={{ margin: "4px 0 6px", fontWeight: 700, fontSize: "var(--schrift-klein)" }}>
          Stufe {stand.stufe}: {meta.name} · Zahlen {meta.zahlen} · noch {offen()} Felder
        </p>
        <p style={{ margin: "0 0 10px", color: T.textLeise, fontSize: "var(--schrift-klein)" }}>
          Regel: Jede Zahl darf in jeder <b>Reihe</b>, jeder <b>Spalte</b> und jedem dick
          umrandeten <b>Kästchen</b> nur EINmal stehen.
          {stand.stufe === 1 && !Object.keys(gefuellt).length
            ? " 👉 Tipp für den Start: Such eine Reihe oder ein Kästchen, in dem nur noch EIN Feld frei ist!"
            : ""}
        </p>

        <div style={{ display: "inline-block", border: "3px solid var(--text)", borderRadius: 6, overflow: "hidden" }}>
          {raetsel.gitter.map((zeile, r) => (
            <div key={r} style={{ display: "flex" }}>
              {zeile.map((_, c) => {
                const vorgabe = raetsel.gitter[r][c] !== 0;
                const wert = wertVon(r, c);
                const aktiv = gewaehlt && gewaehlt.r === r && gewaehlt.c === c;
                const leuchtet = leuchten.includes(`${r}-${c}`);
                return (
                  <button key={c} data-test={`sudoku-zelle-${r}-${c}`}
                    onClick={() => { if (!vorgabe && !gefuellt[`${r}-${c}`]) { setGewaehlt({ r, c }); setHinweis(""); setLeuchten([]); } }}
                    style={{
                      width: zelle, height: zelle, minHeight: 0, padding: 0, borderRadius: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: Math.round(zelle * 0.48), fontWeight: vorgabe ? 800 : 700,
                      borderTop: "none", borderLeft: "none",
                      borderRight: (c + 1) % raetsel.boxB === 0 && c < g - 1 ? "3px solid var(--text)" : `1px solid ${T.rand}`,
                      borderBottom: (r + 1) % raetsel.boxH === 0 && r < g - 1 ? "3px solid var(--text)" : `1px solid ${T.rand}`,
                      background: leuchtet ? "var(--warn)" : aktiv ? T.primaer : vorgabe ? T.weich : T.grund,
                      color: leuchtet ? "#fff" : aktiv ? T.primaerText : vorgabe ? T.text : "var(--ok)",
                      cursor: vorgabe ? "default" : "pointer",
                    }}>
                    {wert || (aktiv ? "?" : "")}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
          {Array.from({ length: g }, (_, i) => i + 1).map((n) => (
            <button key={n} data-test={`sudoku-zahl-${n}`} onClick={() => zahlSetzen(n)}
              style={{ minWidth: 52, fontWeight: 800, fontSize: "var(--schrift)", background: T.weich, color: T.text }}>
              {n}
            </button>
          ))}
        </div>
        {hinweis && (
          <p data-test="sudoku-hinweis" style={{ margin: "10px 0 0", fontWeight: 700, fontSize: "var(--schrift-klein)" }}>
            💡 {hinweis}
          </p>
        )}
        <button data-test="sudoku-neu" onClick={neuesRaetsel}
          style={{ marginTop: 10, background: "transparent", color: T.textLeise, fontSize: "var(--schrift-klein)" }}>
          🔄 Anderes Rätsel
        </button>
      </div>
      <button data-test="sudoku-zurueck" onClick={() => navTo("start")}
        style={{ background: "transparent", color: T.textLeise, fontSize: "var(--schrift-klein)" }}>
        ← Zurück zur Startseite
      </button>
    </div>
  );
}
