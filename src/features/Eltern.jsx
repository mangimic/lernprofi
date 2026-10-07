import { useRef, useState } from "react";
import { useApp } from "../appContext.jsx";
import { heutigerTag, lernspur } from "../calc/lerntage.js";

/* Elternbereich (eigener Tab, nur nach Entsperren mit dem Eltern-Passwort):
   Profil · Tagesziel · Stufen-Steuerung · neutrale Lern-Übersicht ·
   Backup/Import (inkl. Alt-App-Übernahme mit Bericht) · PIN · Sperren. */

const STUFEN_FELDER = [
  { key: "subj", name: "🔎 Subjekte" }, { key: "praed", name: "🧲 Prädikate" },
  { key: "rede", name: "💬 Wörtliche Rede" }, { key: "zeit", name: "⏳ Zeitformen" },
  { key: "wa", name: "🏷️ Wortarten" }, { key: "faelle", name: "🎯 Die 4 Fälle" },
  { key: "gk", name: "🔠 Groß & Klein" }, { key: "gws", name: "📖 Grundwortschatz" },
  { key: "gesch", name: "📚 Geschichten-Werkstatt" }, { key: "dd", name: "🔤 das oder dass?" },
  { key: "doppel", name: "🔡 Doppelte Mitlaute" },
  { key: "mrechnen", name: "🧮 Rechnen" }, { key: "mzahlen", name: "🔢 Zahlen-Profi" },
  { key: "mgeo", name: "📐 Formen & Flächen" }, { key: "mgroessen", name: "⏰ Größen" },
  { key: "mdaten", name: "🎲 Daten & Zufall" },
  { key: "sstrom", name: "⚡ Strom & Energie" }, { key: "srad", name: "🚲 Radfahrprüfung" },
  { key: "skarte", name: "🗺️ Karten & BW" }, { key: "sgemeinde", name: "🏛️ Gemeinde" },
  { key: "skoerper", name: "🫀 Körper" }, { key: "szeit", name: "🕰️ Zeit & Geschichte" },
  { key: "stark", name: "💪 Stark mit Leo" },
];

function Karte({ children, test }) {
  const { T } = useApp();
  return (
    <div data-test={test} style={{ background: T.karte, borderRadius: T.radius, padding: T.abstand, marginBottom: T.abstand }}>
      {children}
    </div>
  );
}

function Seg({ werte, aktiv, auf, test }) {
  const { T } = useApp();
  return (
    <div style={{ display: "flex", gap: 6 }}>
      {werte.map((w) => (
        <button key={w.v} data-test={test ? `${test}-${w.v}` : undefined} onClick={() => auf(w.v)}
          style={{
            flex: 1, fontWeight: 700, minHeight: 40,
            background: aktiv === w.v ? T.primaer : T.weich,
            color: aktiv === w.v ? T.primaerText : T.text,
          }}>
          {w.label}
        </button>
      ))}
    </div>
  );
}

export default function Eltern() {
  const { data, logChange, T, tresor, heute } = useApp();
  const datei = useRef(null);
  const [meldung, setMeldung] = useState("");
  const [bericht, setBericht] = useState(null);
  const [pinNeu, setPinNeu] = useState({ pw: "", pin: "" });

  const feld = {
    width: "100%", minHeight: "var(--touch)", fontSize: "var(--schrift)",
    borderRadius: "var(--radius-klein)", border: "1px solid var(--rand)",
    padding: "0 12px", marginBottom: 8, background: "var(--grund)", color: "var(--text)",
    boxSizing: "border-box",
  };

  const einstellung = (aenderung, text) =>
    logChange({ ...data, einstellungen: { ...data.einstellungen, ...aenderung } }, "einstellungen", "geaendert", text);

  const vorgabe = data.einstellungen.stufenVorgabe;
  const feldVorgabe = (key, v) => {
    const felder = { ...vorgabe.felder };
    if (v === 0) delete felder[key]; else felder[key] = v;
    einstellung({ stufenVorgabe: { ...vorgabe, felder } }, `Stufe für ${key} ${v === 0 ? "wieder automatisch" : "fest auf " + v}`);
  };

  const exportieren = () => {
    try {
      const blob = new Blob([tresor.exportJson()], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `lernprofi-backup-${heute}.json`;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
      setMeldung("💾 Backup gespeichert (Download-Ordner).");
    } catch { setMeldung("Export hat nicht geklappt – bitte noch einmal."); }
  };

  const importieren = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const leser = new FileReader();
    leser.onload = () => {
      try {
        const b = tresor.importJson(String(leser.result));
        setBericht(b);
        setMeldung("✅ Lernstand übernommen – Bericht siehe unten.");
      } catch { setMeldung("Die Datei konnte nicht gelesen werden."); setBericht(null); }
    };
    leser.readAsText(f);
    e.target.value = "";
  };

  const pinAendern = async () => {
    try {
      await tresor.pinAendern(pinNeu.pw, pinNeu.pin);
      setPinNeu({ pw: "", pin: "" });
      setMeldung("✅ Neue Lern-PIN gespeichert.");
    } catch (fehler) { setMeldung(fehler?.message || "Das hat nicht geklappt."); }
  };

  const tage = (data.lernstand.lerntage || []).slice(-14).reverse();
  const spur = lernspur(data.lernstand.lerntage, heute);
  const tagHeute = heutigerTag(data.lernstand.lerntage, heute);

  return (
    <div data-test="eltern-karte">
      <h2>🔧 Elternbereich</h2>

      <Karte test="eltern-profil">
        <b>👤 Profil</b>
        <p style={{ margin: "4px 0 8px", color: T.textLeise, fontSize: "var(--schrift-klein)" }}>
          Der Name bleibt verschlüsselt auf dem Gerät.
        </p>
        <input data-test="profil-name" style={feld} placeholder="Vorname (freiwillig)" value={data.profil.name}
          onChange={(e) => logChange({ ...data, profil: { ...data.profil, name: e.target.value } }, "profil", "geaendert", "Name angepasst")} />
      </Karte>

      <Karte test="eltern-ziel">
        <b>🎯 Tagesziel</b>
        <p style={{ margin: "4px 0 8px", color: T.textLeise, fontSize: "var(--schrift-klein)" }}>
          So viele Mini-Missionen (je 4 Aufgaben) füllen die Lernspur.
        </p>
        <Seg test="ziel" werte={[2, 3, 4, 5, 6].map((v) => ({ v, label: String(v) }))}
          aktiv={data.einstellungen.missionsZiel}
          auf={(v) => einstellung({ missionsZiel: v }, `Tagesziel auf ${v} Missionen`)} />
      </Karte>

      <Karte test="eltern-stufen">
        <b>🎚️ Stufen steuern</b>
        <p style={{ margin: "4px 0 8px", color: T.textLeise, fontSize: "var(--schrift-klein)" }}>
          <b>Auto</b> = Stufen werden durchs Üben freigeschaltet · <b>1–3</b> = fest.
          Die Vorgabe je Lernfeld schlägt die globale.
        </p>
        <Seg test="stufe-global" werte={[{ v: 0, label: "Auto" }, { v: 1, label: "1" }, { v: 2, label: "2" }, { v: 3, label: "3" }]}
          aktiv={vorgabe.global}
          auf={(v) => einstellung({ stufenVorgabe: { ...vorgabe, global: v } }, `Globale Stufe: ${v === 0 ? "automatisch" : v}`)} />
        <details style={{ marginTop: 8 }}>
          <summary style={{ cursor: "pointer", color: T.textLeise }}>Je Lernfeld einstellen</summary>
          {STUFEN_FELDER.map((f) => (
            <div key={f.key} style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
              <span style={{ flex: 1, fontSize: "var(--schrift-klein)" }}>{f.name}</span>
              <div style={{ flex: 1 }}>
                <Seg werte={[{ v: 0, label: "Auto" }, { v: 1, label: "1" }, { v: 2, label: "2" }, { v: 3, label: "3" }]}
                  aktiv={vorgabe.felder[f.key] || 0} auf={(v) => feldVorgabe(f.key, v)} />
              </div>
            </div>
          ))}
        </details>
      </Karte>

      <Karte test="eltern-uebersicht">
        <b>📈 Lern-Übersicht</b>
        <p style={{ margin: "4px 0 8px", color: T.textLeise, fontSize: "var(--schrift-klein)" }}>
          Nur Zahlen, keine Bewertung. Heute: {tagHeute.missionen} Mission{tagHeute.missionen === 1 ? "" : "en"}
          {tagHeute.zielErreicht ? " · 🎯 Ziel erreicht" : ""}{spur > 0 ? ` · 🛤️ Lernspur ${spur} Tag${spur === 1 ? "" : "e"}` : ""}
          {" · 🪙 "}{data.lernstand.muenzen} Münzen
        </p>
        {tage.length ? (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--schrift-klein)" }}>
            <thead><tr style={{ textAlign: "left", color: T.textLeise }}><th>Tag</th><th style={{ textAlign: "center" }}>Aufgaben</th><th style={{ textAlign: "center" }}>Missionen</th><th style={{ textAlign: "center" }}>Ziel</th></tr></thead>
            <tbody>
              {tage.map((t) => (
                <tr key={t.tag}><td>{t.tag}</td><td style={{ textAlign: "center" }}>{t.aufgaben}</td><td style={{ textAlign: "center" }}>{t.missionen}</td><td style={{ textAlign: "center" }}>{t.zielErreicht ? "🎯" : "–"}</td></tr>
              ))}
            </tbody>
          </table>
        ) : <p style={{ color: T.textLeise }}>Noch keine Lerntage – die Übersicht füllt sich beim Üben.</p>}
      </Karte>

      <Karte test="eltern-daten">
        <b>💾 Daten</b>
        <p style={{ margin: "4px 0 10px", color: T.textLeise, fontSize: "var(--schrift-klein)" }}>
          Backup regelmäßig sichern – es gibt keine Passwort-Wiederherstellung.
          Der Import versteht auch den „Lernstand sichern“-Export der bisherigen App.
        </p>
        <button data-test="export-knopf" onClick={exportieren}
          style={{ width: "100%", background: T.weich, color: T.text, fontWeight: 700, marginBottom: 8 }}>
          💾 Backup als Datei sichern
        </button>
        <button data-test="import-knopf" onClick={() => datei.current?.click()}
          style={{ width: "100%", background: T.weich, color: T.text, fontWeight: 700, marginBottom: 8 }}>
          📥 Lernstand aus Datei übernehmen (auch Alt-App)
        </button>
        <input ref={datei} type="file" accept="application/json,.json" hidden onChange={importieren} />
        {bericht && (
          <div data-test="import-bericht" style={{ background: T.grund, borderRadius: T.radiusKlein, padding: 10, fontSize: "var(--schrift-klein)" }}>
            <b>Übernahme-Bericht:</b>
            <ul style={{ margin: "6px 0 0", paddingLeft: 18 }}>
              {bericht.map((b, i) => (
                <li key={i}>{b.status === "übernommen" ? "✅" : "🗑️"} <b>{b.feld}</b>{b.detail ? ` – ${b.detail}` : ""}</li>
              ))}
            </ul>
          </div>
        )}
        <details style={{ margin: "8px 0" }}>
          <summary style={{ cursor: "pointer", color: T.textLeise }}>🔑 Lern-PIN ändern</summary>
          <div style={{ marginTop: 8 }}>
            <input data-test="pin-neu-pw" type="password" placeholder="Eltern-Passwort" style={feld}
              value={pinNeu.pw} onChange={(e) => setPinNeu({ ...pinNeu, pw: e.target.value })} />
            <input data-test="pin-neu-pin" type="password" inputMode="numeric" maxLength={4}
              placeholder="Neue Lern-PIN (4 Ziffern)" style={feld}
              value={pinNeu.pin} onChange={(e) => setPinNeu({ ...pinNeu, pin: e.target.value.replace(/\D/g, "") })} />
            <button data-test="pin-neu-ok" onClick={pinAendern}
              style={{ width: "100%", background: T.weich, color: T.text, fontWeight: 700 }}>
              Speichern
            </button>
          </div>
        </details>
        {meldung && <p data-test="eltern-meldung" style={{ color: T.ok, fontSize: "var(--schrift-klein)" }}>{meldung}</p>}
        <button data-test="sperren-knopf" onClick={tresor.sperren}
          style={{ width: "100%", background: "transparent", color: T.textLeise, fontSize: "var(--schrift-klein)" }}>
          🔒 Tresor sperren
        </button>
      </Karte>
    </div>
  );
}
