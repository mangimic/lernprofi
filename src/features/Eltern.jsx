import { useRef, useState } from "react";
import { useApp } from "../appContext.jsx";

/* Eltern-Karte (nur sichtbar nach Entsperren mit dem Eltern-Passwort):
   Backup-Export, Import, Lern-PIN ändern, Tresor sperren.
   Der Export ist das einzige „Sicherheitsnetz" – es gibt keine
   Passwort-Wiederherstellung. */
export default function ElternKarte() {
  const { T, tresor } = useApp();
  const datei = useRef(null);
  const [meldung, setMeldung] = useState("");
  const [pinNeu, setPinNeu] = useState({ pw: "", pin: "" });

  const exportieren = () => {
    try {
      const blob = new Blob([tresor.exportJson()], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `lernprofi-backup-${new Date().toISOString().slice(0, 10)}.json`;
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
      try { tresor.importJson(String(leser.result)); setMeldung("✅ Lernstand aus Datei übernommen."); }
      catch { setMeldung("Die Datei konnte nicht gelesen werden."); }
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

  const feld = {
    width: "100%", minHeight: "var(--touch)", fontSize: "var(--schrift)",
    borderRadius: "var(--radius-klein)", border: "1px solid var(--rand)",
    padding: "0 12px", marginBottom: 8, background: "var(--grund)", color: "var(--text)",
    boxSizing: "border-box",
  };

  return (
    <div data-test="eltern-karte"
      style={{ background: T.karte, borderRadius: T.radius, padding: T.abstand, marginTop: T.abstand }}>
      <b>🔧 Elternbereich</b>
      <p style={{ margin: "4px 0 10px", color: T.textLeise, fontSize: "var(--schrift-klein)" }}>
        Backup regelmäßig sichern – es gibt keine Passwort-Wiederherstellung.
        Alle Daten bleiben verschlüsselt auf dem Gerät.
      </p>
      <button data-test="export-knopf" onClick={exportieren}
        style={{ width: "100%", background: T.weich, color: T.text, fontWeight: 700, marginBottom: 8 }}>
        💾 Backup als Datei sichern
      </button>
      <button data-test="import-knopf" onClick={() => datei.current?.click()}
        style={{ width: "100%", background: T.weich, color: T.text, fontWeight: 700, marginBottom: 8 }}>
        📥 Lernstand aus Datei übernehmen
      </button>
      <input ref={datei} type="file" accept="application/json,.json" hidden onChange={importieren} />
      <details style={{ margin: "6px 0 10px" }}>
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
    </div>
  );
}
