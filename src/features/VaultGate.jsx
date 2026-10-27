import { useState } from "react";
import { useApp } from "../appContext.jsx";
import { kontoRegistrieren, kontoAnmelden, kontoAnmeldenMitCode, kontoPasswortSetzen, kontoStatus, emailNormal, EMAIL_GUELTIG } from "../konto.js";
import { passwortNeuSetzen } from "../vault.js";
import { herunterladen } from "../sync.js";
import { idbStorage } from "../idbShim.js";
import Datenschutz from "./Datenschutz.jsx";

/* Sperrbildschirm (VaultGate):
   - Noch kein Tresor → Einrichtung durch die Eltern (Passwort 2×, PIN 2×,
     klarer Hinweis: KEINE Passwort-Wiederherstellung, dafür Backup-Export).
     Optional (ab v0.71): mit Einladungs-Code + E-Mail wird dabei gleich
     ein Familien-Konto angelegt – fürs Sichern auf mehreren Geräten.
   - „Ich habe schon ein Konto": neues Gerät meldet sich an, holt den
     verschlüsselten Tresor vom Server und entsperrt mit demselben
     Eltern-Passwort (Zero-Knowledge – der Server kennt es nie).
   - Tresor vorhanden → das Kind entsperrt selbständig mit der 4-stelligen
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
  const [einr, setEinr] = useState({ pw1: "", pw2: "", pin1: "", pin2: "", code: "", email: "" });
  const [weg, setWeg] = useState("einrichten"); // einrichten | anmelden | rettung (neues Gerät)
  const [anm, setAnm] = useState({ email: "", passwort: "" });
  const [pwVergessen, setPwVergessen] = useState(false); // 🧯 lokaler Rettungs-Weg
  const [rett, setRett] = useState({ email: "", code: "", pw1: "", pw2: "" });
  const [einverstanden, setEinverstanden] = useState(false); // 📄 Einwilligung (nur Konto-Weg)
  const [zeigeDatenschutz, setZeigeDatenschutz] = useState(false);

  const los = async (arbeit) => {
    setFehler(""); setLaeuft(true);
    try { await arbeit(); }
    catch (e) { setFehler(e?.message || "Das hat nicht geklappt – bitte noch einmal."); }
    finally { setLaeuft(false); }
  };

  const anlegen = () => los(async () => {
    if (einr.pw1 !== einr.pw2) throw new Error("Die beiden Passwörter sind nicht gleich.");
    if (einr.pin1 !== einr.pin2) throw new Error("Die beiden PINs sind nicht gleich.");
    // 👪 Optional: Einladungs-Code + E-Mail → erst das Familien-Konto
    // auf dem Server anlegen, dann den Tresor. Ohne beides bleibt die
    // Einrichtung rein lokal (wie bisher).
    if (einr.code.trim() || einr.email.trim()) {
      if (!einr.code.trim() || !EMAIL_GUELTIG.test(emailNormal(einr.email))) {
        throw new Error("Fürs Familien-Konto bitte Einladungs-Code UND E-Mail angeben – oder beide Felder leer lassen.");
      }
      if (String(einr.pw1).length < 8) throw new Error("Das Eltern-Passwort braucht mindestens 8 Zeichen.");
      if (!einverstanden) throw new Error("Fürs Familien-Konto bitte die Bestätigung ankreuzen (erziehungsberechtigt + Datenschutzerklärung gelesen).");
      let erg;
      try {
        erg = await kontoRegistrieren({ einladung: einr.code, email: einr.email, passwort: einr.pw1 });
      } catch {
        throw new Error("Der Server ist gerade nicht erreichbar – später im Elternbereich verknüpfen oder Felder leer lassen.");
      }
      if (!erg.ok) throw new Error(erg.fehler || "Das Konto konnte nicht angelegt werden.");
    }
    await tresor.anlegen(einr.pw1, einr.pin1);
  });

  // 👪 Neues Gerät: anmelden → verschlüsselten Tresor holen → mit dem
  // Eltern-Passwort entsperren (derselbe Schlüsselweg wie immer).
  const anmelden = () => los(async () => {
    if (!EMAIL_GUELTIG.test(emailNormal(anm.email)) || !anm.passwort) {
      throw new Error("Bitte E-Mail und Eltern-Passwort eingeben.");
    }
    let erg;
    try {
      erg = await kontoAnmelden(anm.email, anm.passwort);
    } catch {
      throw new Error("Der Server ist gerade nicht erreichbar – bitte später noch einmal.");
    }
    if (!erg.ok) throw new Error(erg.fehler || "Anmeldung fehlgeschlagen.");
    const holen = await herunterladen(idbStorage);
    if (!holen.ok) {
      throw new Error(holen.grund === "server-leer"
        ? "Auf dem Server liegt noch kein Tresor zu diesem Konto – bitte zuerst auf dem Erst-Gerät sichern."
        : "Der Tresor konnte nicht geholt werden – bitte später noch einmal.");
    }
    await tresor.entsperrenPasswort(anm.passwort);
  });

  // 🧯 Neues Passwort prüfen (für beide Rettungs-Wege gleich)
  const rettPwPruefen = () => {
    if (rett.pw1 !== rett.pw2) throw new Error("Die beiden neuen Passwörter sind nicht gleich.");
    if (String(rett.pw1).length < 8) throw new Error("Das neue Eltern-Passwort braucht mindestens 8 Zeichen.");
  };

  // 🧯 Lokaler Rettungs-Weg: Tresor liegt auf DIESEM Gerät, Passwort ist weg.
  // Der Code öffnet den dritten Umschlag und setzt ein neues Passwort;
  // wenn das Konto erreichbar ist, wird der Server-Beweis mit aktualisiert.
  const lokalRetten = () => los(async () => {
    rettPwPruefen();
    await passwortNeuSetzen(rett.code, rett.pw1, idbStorage); // wirft bei falschem Code
    try {
      const s = await kontoStatus();
      if (s.angemeldet && s.email) await kontoPasswortSetzen({ email: s.email, code: rett.code, neuesPasswort: rett.pw1 });
    } catch { /* ohne Netz: lokal fertig, Server-Beweis folgt über den Elternbereich */ }
    await tresor.entsperrenPasswort(rett.pw1);
  });

  // 🧯 Rettung auf NEUEM Gerät: Code-Login → Chiffrat holen → neues
  // Passwort setzen (lokal + am Konto) → entsperren.
  const neuGeraetRetten = () => los(async () => {
    if (!EMAIL_GUELTIG.test(emailNormal(rett.email))) throw new Error("Bitte die Konto-E-Mail eingeben.");
    rettPwPruefen();
    let erg;
    try { erg = await kontoAnmeldenMitCode(rett.email, rett.code); }
    catch { throw new Error("Der Server ist gerade nicht erreichbar – bitte später noch einmal."); }
    if (!erg.ok) throw new Error(erg.fehler || "Der Code passt nicht zu diesem Konto.");
    const holen = await herunterladen(idbStorage);
    if (!holen.ok) throw new Error("Der Tresor konnte nicht geholt werden – bitte später noch einmal.");
    await passwortNeuSetzen(rett.code, rett.pw1, idbStorage);
    try { await kontoPasswortSetzen({ email: rett.email, code: rett.code, neuesPasswort: rett.pw1 }); } catch { /* best effort */ }
    await tresor.entsperrenPasswort(rett.pw1);
  });

  const kopf = (
    <header style={{ textAlign: "center", margin: "18px 0" }}>
      <h1 style={{ fontSize: "var(--schrift-gross)", margin: 0 }}>✏️ Lernprofi</h1>
    </header>
  );

  const datenschutzLink = (
    <button data-test="datenschutz-link" onClick={() => setZeigeDatenschutz(true)}
      style={{ width: "100%", background: "transparent", color: T.textLeise, marginTop: 4, fontSize: "var(--schrift-klein)" }}>
      📄 Datenschutzerklärung
    </button>
  );

  // 📄 Datenschutz ist VOR jeder Anmeldung lesbar (DSGVO)
  if (zeigeDatenschutz) {
    return <div style={{ paddingTop: 10 }}><Datenschutz zurueck={() => setZeigeDatenschutz(false)} /></div>;
  }

  if (tresor.status === "neu" && weg === "rettung") {
    return (
      <div data-test="gate-rettung" style={{ maxWidth: 480, margin: "0 auto", padding: "0 16px" }}>
        {kopf}
        <Karte>
          <h2 style={{ marginTop: 0 }}>🧯 Passwort vergessen</h2>
          <p style={{ color: T.textLeise }}>
            Mit eurem <b>Wiederherstellungs-Code</b> (der ausgedruckte Zettel)
            meldet sich dieses Gerät an, holt den verschlüsselten Tresor und
            ihr vergebt ein <b>neues</b> Eltern-Passwort.
          </p>
          <Feld test="rett-email" type="email" placeholder="E-Mail des Familien-Kontos" value={rett.email}
            onChange={(e) => setRett({ ...rett, email: e.target.value })} />
          <Feld test="rett-code" placeholder="Wiederherstellungs-Code (xxxxx-xxxxx-…)" autoComplete="off" value={rett.code}
            onChange={(e) => setRett({ ...rett, code: e.target.value })} />
          <Feld test="rett-pw1" type="password" placeholder="Neues Eltern-Passwort (mind. 8 Zeichen)" value={rett.pw1}
            onChange={(e) => setRett({ ...rett, pw1: e.target.value })} />
          <Feld test="rett-pw2" type="password" placeholder="Neues Eltern-Passwort wiederholen" value={rett.pw2}
            onChange={(e) => setRett({ ...rett, pw2: e.target.value })} />
          {fehler && <p data-test="gate-fehler" style={{ color: T.warn }}>{fehler}</p>}
          <button data-test="rett-ok" disabled={laeuft} onClick={neuGeraetRetten}
            style={{ width: "100%", background: T.primaer, color: T.primaerText, fontWeight: 700 }}>
            {laeuft ? "Einen Moment …" : "🧯 Tresor retten und neues Passwort setzen"}
          </button>
          <button onClick={() => { setWeg("anmelden"); setFehler(""); }}
            style={{ width: "100%", background: "transparent", color: T.textLeise, marginTop: 8, fontSize: "var(--schrift-klein)" }}>
            ← Zurück zur Anmeldung
          </button>
        </Karte>
      </div>
    );
  }

  if (tresor.status === "neu" && weg === "anmelden") {
    return (
      <div data-test="gate-anmelden" style={{ maxWidth: 480, margin: "0 auto", padding: "0 16px" }}>
        {kopf}
        <Karte>
          <h2 style={{ marginTop: 0 }}>👪 Mit Familien-Konto anmelden</h2>
          <p style={{ color: T.textLeise }}>
            Für Familien, die schon ein Konto haben: Dieses Gerät holt den
            <b> verschlüsselten</b> Tresor vom Server und entsperrt ihn mit
            eurem Eltern-Passwort – der Server kann ihn nie lesen.
          </p>
          <Feld test="anm-email" type="email" placeholder="E-Mail" value={anm.email}
            onChange={(e) => setAnm({ ...anm, email: e.target.value })} />
          <Feld test="anm-passwort" type="password" placeholder="Eltern-Passwort" value={anm.passwort}
            onChange={(e) => setAnm({ ...anm, passwort: e.target.value })}
            onKeyDown={(e) => { if (e.key === "Enter") anmelden(); }} />
          {fehler && <p data-test="gate-fehler" style={{ color: T.warn }}>{fehler}</p>}
          <button data-test="anm-ok" disabled={laeuft} onClick={anmelden}
            style={{ width: "100%", background: T.primaer, color: T.primaerText, fontWeight: 700 }}>
            {laeuft ? "Einen Moment …" : "🔑 Anmelden und Tresor holen"}
          </button>
          <button data-test="anm-pw-vergessen" onClick={() => { setWeg("rettung"); setFehler(""); }}
            style={{ width: "100%", background: "transparent", color: T.textLeise, marginTop: 8, fontSize: "var(--schrift-klein)" }}>
            🧯 Passwort vergessen? Mit Wiederherstellungs-Code
          </button>
          <button data-test="anm-zurueck" onClick={() => { setWeg("einrichten"); setFehler(""); }}
            style={{ width: "100%", background: "transparent", color: T.textLeise, marginTop: 4, fontSize: "var(--schrift-klein)" }}>
            ← Zurück zur Einrichtung
          </button>
          {datenschutzLink}
        </Karte>
      </div>
    );
  }

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
          <p style={{ color: T.textLeise, fontSize: "var(--schrift-klein)", margin: "4px 0 8px" }}>
            👪 <b>Mit Einladungs-Code?</b> Dann entsteht dabei euer Familien-Konto
            (Sicherung auf mehreren Geräten). Ohne Code bleibt alles auf diesem Gerät.
          </p>
          <Feld test="einr-code" placeholder="Einladungs-Code (optional, xxxxx-xxxxx)" autoComplete="off"
            value={einr.code} onChange={(e) => setEinr({ ...einr, code: e.target.value })} />
          <Feld test="einr-email" type="email" placeholder="E-Mail (nur mit Einladungs-Code)"
            value={einr.email} onChange={(e) => setEinr({ ...einr, email: e.target.value })} />
          {(einr.code.trim() !== "" || einr.email.trim() !== "") && (
            <label style={{
              display: "flex", gap: 8, alignItems: "flex-start", cursor: "pointer",
              fontSize: "var(--schrift-klein)", color: T.textLeise, margin: "0 0 8px",
            }}>
              <input data-test="einr-einwilligung" type="checkbox" checked={einverstanden}
                onChange={(e) => setEinverstanden(e.target.checked)}
                style={{ width: 20, height: 20, marginTop: 2, flexShrink: 0 }} />
              <span>
                Ich bin erziehungsberechtigt und lege dieses Konto für mein Kind an.
                Die <b>Datenschutzerklärung</b> (Link unten) habe ich gelesen.
              </span>
            </label>
          )}
          <p style={{ color: T.warn, fontSize: "var(--schrift-klein)" }}>
            ⚠️ Wichtig: Es gibt <b>keine Passwort-Wiederherstellung</b>. Bewahrt das
            Passwort gut auf und macht regelmäßig den Backup-Export im Elternbereich.
          </p>
          {fehler && <p data-test="gate-fehler" style={{ color: T.warn }}>{fehler}</p>}
          <button data-test="einr-ok" disabled={laeuft} onClick={anlegen}
            style={{ width: "100%", background: T.primaer, color: T.primaerText, fontWeight: 700 }}>
            {laeuft ? "Einen Moment …" : "🔐 Tresor anlegen"}
          </button>
          <button data-test="zum-anmelden" onClick={() => { setWeg("anmelden"); setFehler(""); }}
            style={{ width: "100%", background: "transparent", color: T.textLeise, marginTop: 8, fontSize: "var(--schrift-klein)" }}>
            👪 Wir haben schon ein Familien-Konto → Anmelden
          </button>
          {datenschutzLink}
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
      ) : !pwVergessen ? (
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
          <button data-test="pw-vergessen" onClick={() => { setPwVergessen(true); setFehler(""); }}
            style={{ width: "100%", background: "transparent", color: T.textLeise, marginTop: 8, fontSize: "var(--schrift-klein)" }}>
            🧯 Passwort vergessen? Mit Wiederherstellungs-Code
          </button>
          <button onClick={() => { setElternWeg(false); setFehler(""); }}
            style={{ width: "100%", background: "transparent", color: T.textLeise, marginTop: 4, fontSize: "var(--schrift-klein)" }}>
            ← Zurück zur Lern-PIN
          </button>
        </Karte>
      ) : (
        <Karte>
          <h2 style={{ marginTop: 0 }}>🧯 Passwort vergessen</h2>
          <p style={{ color: T.textLeise, fontSize: "var(--schrift-klein)" }}>
            Euer <b>Wiederherstellungs-Code</b> (der ausgedruckte Zettel) öffnet den
            Tresor auf diesem Gerät – und ihr vergebt ein <b>neues</b> Eltern-Passwort.
            Die Lern-PIN bleibt, wie sie ist.
          </p>
          <Feld test="rett-code" placeholder="Wiederherstellungs-Code (xxxxx-xxxxx-…)" autoComplete="off" value={rett.code} autoFocus
            onChange={(e) => setRett({ ...rett, code: e.target.value })} />
          <Feld test="rett-pw1" type="password" placeholder="Neues Eltern-Passwort (mind. 8 Zeichen)" value={rett.pw1}
            onChange={(e) => setRett({ ...rett, pw1: e.target.value })} />
          <Feld test="rett-pw2" type="password" placeholder="Neues Eltern-Passwort wiederholen" value={rett.pw2}
            onChange={(e) => setRett({ ...rett, pw2: e.target.value })} />
          {fehler && <p data-test="gate-fehler" style={{ color: T.warn }}>{fehler}</p>}
          <button data-test="rett-ok" disabled={laeuft} onClick={lokalRetten}
            style={{ width: "100%", background: T.primaer, color: T.primaerText, fontWeight: 700 }}>
            {laeuft ? "Einen Moment …" : "🧯 Neues Passwort setzen und entsperren"}
          </button>
          <button onClick={() => { setPwVergessen(false); setFehler(""); }}
            style={{ width: "100%", background: "transparent", color: T.textLeise, marginTop: 8, fontSize: "var(--schrift-klein)" }}>
            ← Zurück zum Eltern-Zugang
          </button>
        </Karte>
      )}
    </div>
  );
}
