import { useState } from "react";
import { useApp } from "../appContext.jsx";
import { KARTEIKARTEN, kartenSeiten, aktiveKarten } from "../calc/karteikarten.js";
import { kartenFach } from "../calc/karteikasten.js";
import AufgabenBild from "./AufgabenBild.jsx";

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
      <div className="kk-kopf">
        {deko.emoji} {deko.name}{karte.typ === "schreiben" ? " · ✍️ Schreib-Karte" : ""}
        <span className={seite === "vs" ? "kk-art aufgabe" : "kk-art loesung"}>
          {seite === "vs" ? "❓ Aufgabe" : "✅ Lösung"}
        </span>
      </div>
      {seite === "vs" ? (
        <div className="kk-mitte">
          <div className="kk-frage">{karte.vs}</div>
          {karte.hinweis && <div className="kk-hinweis">{karte.hinweis}</div>}
        </div>
      ) : (
        <div className="kk-mitte">
          <div className="kk-antwort">{karte.rs}</div>
          {karte.bild && <div className="kk-bild"><AufgabenBild b={karte.bild} /></div>}
          <div className="kk-merk">🧠 <b>Merkhilfe:</b> {karte.merk}</div>
        </div>
      )}
      <div className="kk-fuss">Lernprofi · Kompass 4</div>
    </div>
  );
}

const FACH_CHIP = { 1: "📥 Fach 1", 2: "📦 Fach 2", 3: "🏆 Fach 3" };

export default function Karteikarten() {
  const { data, logChange, T, navTo, tresor } = useApp();
  const [wahl, setWahl] = useState("alle");
  const [verwalten, setVerwalten] = useState(false);
  const [neu, setNeu] = useState({ fach: "deutsch", vs: "", rs: "", merk: "" });
  const aktiv = aktiveKarten(data.einstellungen);
  const karten = aktiv.filter((k) => wahl === "alle" || k.fach === wahl);
  const seiten = kartenSeiten(karten);
  const aus = data.einstellungen.kartenAus;
  const eigene = data.einstellungen.eigeneKarten;
  const stand = data.lernstand.karteikasten.stand;
  // Alle verwaltbaren Karten: Standard + eigene (fuer die Liste, auch ausgeblendete)
  const verwaltbar = [
    ...KARTEIKARTEN,
    ...eigene.map((k) => ({ id: `e${k.id}`, fach: k.fach, vs: k.vs, rs: k.rs, eigen: true, roheId: k.id })),
  ];
  const einstellung = (aenderung, text) =>
    logChange({ ...data, einstellungen: { ...data.einstellungen, ...aenderung } }, "einstellungen", "geaendert", text);
  const anAus = (id) => {
    const neuAus = aus.includes(id) ? aus.filter((x) => x !== id) : [...aus, id].slice(0, 200);
    einstellung({ kartenAus: neuAus }, aus.includes(id) ? "Karteikarte wieder aktiviert" : "Karteikarte ausgeblendet");
  };

  return (
    <div data-test="karten-seite">
      <style>{`
        .kk-blatt { background: #fff; color: #1c2e4a; width: 100%; max-width: 760px; margin: 0 auto 14px;
          aspect-ratio: 210 / 297; display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); grid-template-rows: minmax(0, 1fr) minmax(0, 1fr);
          border: 1px solid var(--rand); border-radius: 8px; overflow: hidden; box-sizing: border-box;
          /* Die Karten-Grafiken (AufgabenBild) malen mit CSS-Variablen – auf dem
             weißen Blatt gelten IMMER die hellen Farben, auch im Dunkel-Modus. */
          --text: #1c3a63; --text-leise: #5d7390; --primaer: #2f6fde; --warn: #d9822b;
          --ok: #2e9e52; --karte: #ffffff; --grund: #eef4fb; --rand: #c9d8ec; --radius-klein: 8px; }
        .kk-zelle { border: 1.5px dashed #9aa7b8; margin: -0.75px; padding: 3% 5%; display: flex;
          flex-direction: column; text-align: center; position: relative; overflow: hidden; min-height: 0; box-sizing: border-box; }
        .kk-bild { width: 100%; }
        .kk-bild [data-test="aufgaben-bild"] { margin: 0; padding: 6px 8px; }
        .kk-bild svg { max-height: 30mm; }
        .kk-zelle.deutsch { border-top: 10px solid #2f6fde; }
        .kk-zelle.mathe { border-top: 10px solid #2e9e52; }
        .kk-kopf { font-size: 12px; font-weight: 700; color: #5d7390;
          display: flex; justify-content: space-between; align-items: center; gap: 6px; }
        /* 🎯 Der Inhalt sitzt MITTIG zwischen Kopf- und Fußzeile */
        .kk-mitte { flex: 1; min-height: 0; overflow: hidden; display: flex; flex-direction: column;
          justify-content: center; align-items: center; gap: 8px; width: 100%; }
        .kk-art { border-radius: 20px; padding: 2px 10px; font-weight: 800; }
        .kk-art.aufgabe { background: #dbe7f6; color: #1c3a63; }
        .kk-art.loesung { background: #d9f0e1; color: #1f7a3f; }
        .kk-frage { font-size: 21px; font-weight: 800; margin: 0; }
        .kk-hinweis { font-size: 13px; color: #5d7390; margin: 0; }
        .kk-antwort { font-size: 21px; font-weight: 800; color: #1f7a3f; margin: 0; }
        .kk-merk { font-size: 12.5px; background: #eef4fb; border-radius: 8px; padding: 6px 8px; margin: 0; }
        .kk-fuss { font-size: 9px; color: #9aa7b8; margin-top: 4px; }
        .kk-blattinfo { text-align: center; color: var(--text-leise); font-size: 12px; margin: 0 0 4px; }
        @media print {
          header, [data-test="nav-leiste"], .nur-schirm { display: none !important; }
          [data-test="app-shell"] { max-width: none !important; padding: 0 !important; }
          @page { size: A4 portrait; margin: 7mm; }
          .kk-blattinfo { display: none; }
          .kk-blatt { max-width: none; border: none; border-radius: 0; aspect-ratio: auto;
            height: 280mm; page-break-after: always; break-after: page; }
          .kk-zelle { page-break-inside: avoid; break-inside: avoid; }
          .kk-bild svg { max-height: 32mm; }
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
          {tresor.elternModus && (
            <button data-test="karten-verwalten" onClick={() => setVerwalten(!verwalten)}
              style={{ flex: "1 1 160px", fontWeight: 700, background: verwalten ? T.primaer : T.weich, color: verwalten ? T.primaerText : T.text }}>
              ⚙️ Karten verwalten
            </button>
          )}
        </div>
        {verwalten && tresor.elternModus && (
          <div data-test="karten-verwaltung" style={{ marginTop: 12 }}>
            <p data-test="karten-zaehler" style={{ margin: "0 0 8px", fontWeight: 700, fontSize: "var(--schrift-klein)" }}>
              {aktiv.length} aktiv · {aus.length} ausgeblendet · {eigene.length} eigene ·
              Kasten-Stand je Karte: 📥 täglich / 📦 alle 3 Tage / 🏆 sitzt
            </p>
            <div style={{ maxHeight: 340, overflowY: "auto", border: `1px solid ${T.rand}`, borderRadius: T.radiusKlein, padding: "6px 10px" }}>
              {verwaltbar.map((k) => (
                <div key={k.id} data-test="karten-zeile" style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0", opacity: aus.includes(k.id) ? 0.45 : 1 }}>
                  <input type="checkbox" data-test={`karten-an-${k.id}`} checked={!aus.includes(k.id)}
                    onChange={() => anAus(k.id)} style={{ width: 18, height: 18 }} />
                  <span>{FACH_DEKO[k.fach].emoji}</span>
                  <span style={{ flex: 1, fontSize: "var(--schrift-klein)" }}>
                    <b>{k.vs}</b> <span style={{ color: T.textLeise }}>→ {k.rs}</span>
                  </span>
                  <span style={{ fontSize: "12px", color: T.textLeise, whiteSpace: "nowrap" }}>{FACH_CHIP[kartenFach(stand, k.id)]}</span>
                  {k.eigen && (
                    <button data-test={`eigene-karte-weg-${k.roheId}`} aria-label="Eigene Karte entfernen"
                      onClick={() => einstellung({ eigeneKarten: eigene.filter((x) => x.id !== k.roheId) }, "Eigene Karteikarte entfernt")}
                      style={{ background: "transparent", color: T.textLeise, padding: 0, minHeight: 0, height: "auto" }}>
                      ✖
                    </button>
                  )}
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
              <select data-test="eigene-fach" value={neu.fach} onChange={(e) => setNeu({ ...neu, fach: e.target.value })}
                style={{ minHeight: "var(--touch)", borderRadius: T.radiusKlein, border: `1px solid ${T.rand}`, background: T.grund, color: T.text, padding: "0 8px" }}>
                <option value="deutsch">📖 Deutsch</option>
                <option value="mathe">🔢 Mathe</option>
              </select>
              <input data-test="eigene-vs" type="text" maxLength={80} placeholder="Vorderseite (Frage / Lernwort)"
                value={neu.vs} onChange={(e) => setNeu({ ...neu, vs: e.target.value })}
                style={{ flex: "2 1 200px", minHeight: "var(--touch)", borderRadius: T.radiusKlein, border: `1px solid ${T.rand}`, background: T.grund, color: T.text, padding: "0 10px" }} />
              <input data-test="eigene-rs" type="text" maxLength={45} placeholder="Rückseite (Lösung)"
                value={neu.rs} onChange={(e) => setNeu({ ...neu, rs: e.target.value })}
                style={{ flex: "1 1 140px", minHeight: "var(--touch)", borderRadius: T.radiusKlein, border: `1px solid ${T.rand}`, background: T.grund, color: T.text, padding: "0 10px" }} />
              <input data-test="eigene-merk" type="text" maxLength={120} placeholder="Merkhilfe (optional)"
                value={neu.merk} onChange={(e) => setNeu({ ...neu, merk: e.target.value })}
                style={{ flex: "2 1 200px", minHeight: "var(--touch)", borderRadius: T.radiusKlein, border: `1px solid ${T.rand}`, background: T.grund, color: T.text, padding: "0 10px" }} />
              <button data-test="eigene-plus" disabled={!neu.vs.trim() || !neu.rs.trim()}
                onClick={() => {
                  const id = eigene.reduce((m, k) => Math.max(m, k.id), 0) + 1;
                  einstellung({ eigeneKarten: [...eigene, { id, fach: neu.fach, vs: neu.vs.trim(), rs: neu.rs.trim(), merk: neu.merk.trim() }].slice(0, 40) }, "Eigene Karteikarte angelegt");
                  setNeu({ fach: neu.fach, vs: "", rs: "", merk: "" });
                }}
                style={{ flex: "0 0 auto", background: T.primaer, color: T.primaerText, fontWeight: 700, opacity: neu.vs.trim() && neu.rs.trim() ? 1 : 0.5 }}>
                + Karte
              </button>
            </div>
          </div>
        )}
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
