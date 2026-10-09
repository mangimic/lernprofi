import { useState } from "react";
import { useApp } from "../appContext.jsx";
import { KARTEIKARTEN, kartenSeiten } from "../calc/karteikarten.js";

/* 🗃️ KARTEIKARTEN DRUCKEN: 4 Karten je A4-Blatt (je ~A6). Je Vorderseiten-
   Blatt folgt das passende Rückseiten-Blatt mit je Zeile getauschten
   Spalten – beidseitig drucken („an der langen Kante spiegeln“), dann
   liegen Frage und Antwort exakt übereinander. An den gestrichelten
   Linien schneiden → fertig ist der Karteikasten (Leitner: 3 Fächer). */

const FACH_DEKO = { deutsch: { emoji: "📖", name: "Deutsch" }, mathe: { emoji: "🔢", name: "Mathe" } };

function Zelle({ karte, seite }) {
  if (!karte) return <div className="kk-zelle leer" />;
  const deko = FACH_DEKO[karte.fach];
  return (
    <div className={`kk-zelle ${karte.fach}`} data-test={seite === "vs" ? "karte-vs" : "karte-rs"}>
      <div className="kk-kopf">{deko.emoji} {deko.name}{karte.typ === "schreiben" ? " · ✍️ Schreib-Karte" : ""}</div>
      {seite === "vs" ? (
        <>
          <div className="kk-frage">{karte.vs}</div>
          {karte.hinweis && <div className="kk-hinweis">{karte.hinweis}</div>}
        </>
      ) : (
        <>
          <div className="kk-antwort">{karte.rs}</div>
          <div className="kk-merk">🧠 {karte.merk}</div>
        </>
      )}
      <div className="kk-fuss">Lernprofi · Kompass 4</div>
    </div>
  );
}

export default function Karteikarten() {
  const { T, navTo } = useApp();
  const [wahl, setWahl] = useState("alle");
  const karten = KARTEIKARTEN.filter((k) => wahl === "alle" || k.fach === wahl);
  const seiten = kartenSeiten(karten);

  return (
    <div data-test="karten-seite">
      <style>{`
        .kk-blatt { background: #fff; color: #1c2e4a; width: 100%; max-width: 760px; margin: 0 auto 14px;
          aspect-ratio: 210 / 297; display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr;
          border: 1px solid var(--rand); border-radius: 8px; overflow: hidden; }
        .kk-zelle { border: 1.5px dashed #9aa7b8; margin: -0.75px; padding: 4% 5%; display: flex;
          flex-direction: column; text-align: center; position: relative; }
        .kk-zelle.deutsch { border-top: 10px solid #2f6fde; }
        .kk-zelle.mathe { border-top: 10px solid #2e9e52; }
        .kk-kopf { font-size: 12px; font-weight: 700; color: #5d7390; margin-bottom: auto; }
        .kk-frage { font-size: 21px; font-weight: 800; margin: auto 0 4px; }
        .kk-hinweis { font-size: 13px; color: #5d7390; margin-bottom: auto; }
        .kk-antwort { font-size: 21px; font-weight: 800; color: #1f7a3f; margin: auto 0 8px; }
        .kk-merk { font-size: 12.5px; background: #eef4fb; border-radius: 8px; padding: 6px 8px; margin: 0 0 auto; }
        .kk-fuss { font-size: 9px; color: #9aa7b8; margin-top: 6px; }
        .kk-blattinfo { text-align: center; color: var(--text-leise); font-size: 12px; margin: 0 0 4px; }
        @media print {
          header, [data-test="nav-leiste"], .nur-schirm { display: none !important; }
          [data-test="app-shell"] { max-width: none !important; padding: 0 !important; }
          @page { size: A4 portrait; margin: 7mm; }
          .kk-blattinfo { display: none; }
          .kk-blatt { max-width: none; border: none; border-radius: 0; aspect-ratio: auto;
            height: 281mm; page-break-after: always; break-after: page; }
          .kk-frage, .kk-antwort { font-size: 24pt; }
          .kk-hinweis, .kk-merk { font-size: 11pt; }
          .kk-kopf { font-size: 10pt; }
        }
      `}</style>

      <div className="nur-schirm" style={{ background: T.karte, borderRadius: T.radius, padding: T.abstand, marginBottom: T.abstand }}>
        <h2 style={{ margin: "0 0 4px" }}>🗃️ Karteikarten zum Ausdrucken</h2>
        <p style={{ margin: "0 0 10px", color: T.textLeise, fontSize: "var(--schrift-klein)" }}>
          4 Karten pro A4-Blatt. <b>Beidseitig drucken</b> („an der langen Kante spiegeln/wenden“) –
          dann liegt jede Antwort genau hinter ihrer Frage. An den gestrichelten Linien schneiden.
          Karteikasten: 3 Fächer (jeden Tag · alle 3 Tage · vor dem Test), pro Runde 3–5 Karten,
          erst LAUT antworten, dann umdrehen.
        </p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {[["alle", "Alle Karten"], ["deutsch", "📖 nur Deutsch"], ["mathe", "🔢 nur Mathe"]].map(([k, label]) => (
            <button key={k} data-test={`karten-wahl-${k}`} onClick={() => setWahl(k)}
              style={{ flex: "1 1 120px", fontWeight: 700, background: wahl === k ? T.primaer : T.weich, color: wahl === k ? T.primaerText : T.text }}>
              {label}
            </button>
          ))}
          <button data-test="karten-drucken" onClick={() => window.print()}
            style={{ flex: "2 1 200px", fontWeight: 700, background: T.ok, color: "#fff" }}>
            🖨️ Jetzt drucken ({seiten.length * 2} Seiten · {karten.length} Karten)
          </button>
        </div>
      </div>

      {seiten.map((s, i) => (
        <div key={i}>
          <p className="kk-blattinfo">Blatt {i + 1} · Vorderseiten</p>
          <div className="kk-blatt" data-test="karten-blatt">
            {s.vorne.map((k, j) => <Zelle key={j} karte={k} seite="vs" />)}
          </div>
          <p className="kk-blattinfo">Blatt {i + 1} · Rückseiten (für den beidseitigen Druck gespiegelt)</p>
          <div className="kk-blatt" data-test="karten-blatt">
            {s.hinten.map((k, j) => <Zelle key={j} karte={k} seite="rs" />)}
          </div>
        </div>
      ))}

      <button className="nur-schirm" data-test="karten-zurueck" onClick={() => navTo("start")}
        style={{ background: "transparent", color: T.textLeise, fontSize: "var(--schrift-klein)" }}>
        ← Zurück zur Startseite
      </button>
    </div>
  );
}
