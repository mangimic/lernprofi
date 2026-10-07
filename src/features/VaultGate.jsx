import { useState } from "react";
import { useApp } from "../appContext.jsx";

/* Sperrbildschirm (VaultGate):
   - Noch kein Tresor → Einrichtung durch die Eltern (Passwort 2×, PIN 2×,
     klarer Hinweis: KEINE Passwort-Wiederherstellung, dafür Backup-Export).
   - Tresor vorhanden → Felix entsperrt selbständig mit der 4-stelligen
     Lern-PIN; „Eltern-Zugang" öffnet den Passwort-Weg (setzt auch die
     PIN-Sperre nach zu vielen Fehlversuchen zurück). */

function Karte({ children }) {
  const { T } = useApp();
  return (
    <div style={{ background: T.karte, borderRadius: T.radius, padding: T.abstand, marginBottom: T.abstand }}>
      {children}
    </div>
  );
}

function Feld({ test, ...rest }) {
  return (
    <input
      data-test={test}
      style={{
        width: "100%", minHeight: "var(--touch)", fontSize: "var(--schrift)",
        borderRadius: "var(--radius-klein)", border: "1px solid var(--rand)",
        padding: "0 12px", marginBottom: 10, background: "var(--grund)", color: "var(--text)",
        boxSizing: "border-box",
      }}
      {...rest}
    />
  );
}

export default function VaultGate() {
  const { T, tresor } = useApp();
  const [fehler, setFehler] = useState("");
  const [laeuft, setLaeuft] = useState(false);
  const [elternWeg, setElternWeg] = useState(false);
  const [pin, setPin] = useState("");
  const [passwort, setPasswort] = useState("");
  const [einr, setEinr] = useState({ pw1: "", pw2: "", pin1: "", pin2: "" });

  const los = async (arbeit) => {
    setFehler(""); setLaeuft(true);
    try { await arbeit(); }
    catch (e) { setFehler(e?.message || "Das hat nicht geklappt – bitte noch einmal."); }
    finally { setLaeuft(false); }
  };

  const anlegen = () => los(async () => {
    if (einr.pw1 !== einr.pw2) throw new Error("Die beiden Passwörter sind nicht gleich.");
    if (einr.pin1 !== einr.pin2) throw new Error("Die beiden PINs sind nicht gleich.");
    await tresor.anlegen(einr.pw1, einr.pin1);
  });

  const kopf = (
    <header style={{ textAlign: "center", margin: "18px 0" }}>
      <h1 style={{ fontSize: "var(--schrift-gross)", margin: 0 }}>✏️ Lernprofi</h1>
    </header>
  );

  if (tresor.status === "neu") {
    return (
      <div data-test="gate-einrichten" style={{ maxWidth: 480, margin: "0 auto", padding: "0 16px" }}>
        {kopf}
        <Karte>
          <h2 style={{ marginTop: 0 }}>🔐 Tresor einrichten (für Eltern)</h2>
          <p style={{ color: T.textLeise }}>
            Alle Lerndaten werden auf diesem Gerät <b>verschlüsselt</b> gespeichert.
            Ihr vergebt ein <b>Eltern-Passwort</b> (für Einstellungen und Backups)
            und eine <b>4-stellige Lern-PIN</b>, mit der das Kind selbständig startet.
          </p>
          <Feld test="einr-pw1" type="password" placeholder="Eltern-Passwort (mind. 8 Zeichen)"
            value={einr.pw1} onChange={(e) => setEinr({ ...einr, pw1: e.target.value })} />
          <Feld test="einr-pw2" type="password" placeholder="Eltern-Passwort wiederholen"
            value={einr.pw2} onChange={(e) => setEinr({ ...einr, pw2: e.target.value })} />
          <Feld test="einr-pin1" type="password" inputMode="numeric" maxLength={4} placeholder="Lern-PIN (4 Ziffern)"
            value={einr.pin1} onChange={(e) => setEinr({ ...einr, pin1: e.target.value.replace(/\D/g, "") })} />
          <Feld test="einr-pin2" type="password" inputMode="numeric" maxLength={4} placeholder="Lern-PIN wiederholen"
            value={einr.pin2} onChange={(e) => setEinr({ ...einr, pin2: e.target.value.replace(/\D/g, "") })} />
          <p style={{ color: T.warn, fontSize: "var(--schrift-klein)" }}>
            ⚠️ Wichtig: Es gibt <b>keine Passwort-Wiederherstellung</b>. Bewahrt das
            Passwort gut auf und macht regelmäßig den Backup-Export im Elternbereich.
          </p>
          {fehler && <p data-test="gate-fehler" style={{ color: T.warn }}>{fehler}</p>}
          <button data-test="einr-ok" disabled={laeuft} onClick={anlegen}
            style={{ width: "100%", background: T.primaer, color: T.primaerText, fontWeight: 700 }}>
            {laeuft ? "Einen Moment …" : "🔐 Tresor anlegen"}
          </button>
        </Karte>
      </div>
    );
  }

  return (
    <div data-test="gate-entsperren" style={{ maxWidth: 480, margin: "0 auto", padding: "0 16px" }}>
      {kopf}
      {!elternWeg ? (
        <Karte>
          <h2 style={{ marginTop: 0 }}>Hallo! Gib deine Lern-PIN ein 🔑</h2>
          <Feld test="pin-eingabe" type="password" inputMode="numeric" maxLength={4}
            placeholder="• • • •" value={pin} autoFocus
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
            onKeyDown={(e) => { if (e.key === "Enter" && pin.length === 4) los(() => tresor.entsperrenPin(pin)); }} />
          {fehler && <p data-test="gate-fehler" style={{ color: T.warn }}>{fehler}</p>}
          <button data-test="pin-ok" disabled={laeuft || pin.length !== 4}
            onClick={() => los(() => tresor.entsperrenPin(pin))}
            style={{ width: "100%", background: T.primaer, color: T.primaerText, fontWeight: 700 }}>
            {laeuft ? "Einen Moment …" : "🚀 Los geht's!"}
          </button>
          <button data-test="eltern-zugang" onClick={() => { setElternWeg(true); setFehler(""); }}
            style={{ width: "100%", background: "transparent", color: T.textLeise, marginTop: 8, fontSize: "var(--schrift-klein)" }}>
            🔧 Eltern-Zugang (mit Passwort)
          </button>
        </Karte>
      ) : (
        <Karte>
          <h2 style={{ marginTop: 0 }}>🔧 Eltern-Zugang</h2>
          <Feld test="pw-eingabe" type="password" placeholder="Eltern-Passwort" value={passwort} autoFocus
            onChange={(e) => setPasswort(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") los(() => tresor.entsperrenPasswort(passwort)); }} />
          {fehler && <p data-test="gate-fehler" style={{ color: T.warn }}>{fehler}</p>}
          <button data-test="pw-ok" disabled={laeuft}
            onClick={() => los(() => tresor.entsperrenPasswort(passwort))}
            style={{ width: "100%", background: T.primaer, color: T.primaerText, fontWeight: 700 }}>
            {laeuft ? "Einen Moment …" : "Entsperren"}
          </button>
          <button onClick={() => { setElternWeg(false); setFehler(""); }}
            style={{ width: "100%", background: "transparent", color: T.textLeise, marginTop: 8, fontSize: "var(--schrift-klein)" }}>
            ← Zurück zur Lern-PIN
          </button>
        </Karte>
      )}
    </div>
  );
}
