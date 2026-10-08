import { useEffect, useState } from "react";
import { useApp } from "./appContext.jsx";
import { zeitAbgelaufen } from "./calc/elternWerkzeuge.js";
import { tagesformNoetig, tagesformEintragen, missionsLaengeHeute } from "./calc/tagesform.js";
import releaseNotes from "./releaseNotes.json";
import Start from "./features/Start.jsx";
import Ueben from "./features/Ueben.jsx";
import Spielhalle from "./features/Spielhalle.jsx";
import Konzentration from "./features/Konzentration.jsx";
import Einstufung from "./features/Einstufung.jsx";
import Schrift from "./features/Schrift.jsx";
import Aufsatz from "./features/Aufsatz.jsx";
import Wochenplan from "./features/Wochenplan.jsx";
import Eltern from "./features/Eltern.jsx";
import VaultGate from "./features/VaultGate.jsx";

/* App-Shell: Navigation, Routen, Version – KEINE Fachlogik. */
export const APP_VERSION = "0.29.0";

const RN_TYP = {
  neu: "✨ Neu",
  verbessert: "💪 Verbessert",
  fix: "🔧 Behoben",
  hinweis: "💡 Hinweis",
  technik: "⚙️ Technik",
  geaendert: "🔁 Geändert",
};

/* ⏳ 5-Minuten-Pausen-Uhr (Timeboxing 10/5): läuft sichtbar rückwärts,
   zwingt aber nicht – „Fertig" geht jederzeit (Selbstbestimmung). */
function PauseUhr() {
  const { T } = useApp();
  const [rest, setRest] = useState(5 * 60);
  useEffect(() => {
    const takt = globalThis.__ZEIT_SCHNELL__ ? 15 : 1000; // Test-Zeitraffer
    const t = setInterval(() => setRest((r) => Math.max(0, r - 1)), takt);
    return () => clearInterval(t);
  }, []);
  const mm = String(Math.floor(rest / 60));
  const ss = String(rest % 60).padStart(2, "0");
  return (
    <p data-test="pause-countdown" style={{ margin: "4px 0 8px", fontWeight: 800, fontSize: 30 }}>
      {rest > 0 ? `⏳ ${mm}:${ss}` : <span style={{ color: T.ok }}>✅ Pause geschafft!</span>}
      <span style={{ display: "block", fontSize: "var(--schrift-klein)", fontWeight: 400, color: T.textLeise }}>
        5 Minuten Pause – ohne Bildschirm!
      </span>
    </p>
  );
}

function WasIstNeu() {
  const { T } = useApp();
  return (
    <div data-test="rn-liste">
      <h2>Was ist neu?</h2>
      {releaseNotes.map((rn) => (
        <div
          key={rn.id}
          style={{ background: T.karte, borderRadius: T.radius, padding: T.abstand, marginBottom: T.abstand }}
        >
          <b>
            v{rn.version} – {rn.titel}
          </b>
          <span style={{ color: T.textLeise }}> · {rn.datum}</span>
          <ul style={{ margin: "8px 0 0", paddingLeft: 20 }}>
            {rn.entries.map((e, i) => (
              <li key={i} style={{ marginBottom: 6 }}>
                <b>{RN_TYP[e.type] || e.type}:</b> {e.text}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export default function App() {
  const { T, route, navTo, isMobile, tresor, data, heute, logChange, fokus } = useApp();
  if (tresor.status === "laden") return null; // kurzer Moment beim Start
  if (tresor.status !== "offen") return <VaultGate />;

  const overlayStil = {
    position: "fixed", inset: 0, zIndex: 900, background: "rgba(38, 50, 72, 0.94)",
    display: "flex", alignItems: "center", justifyContent: "center", padding: 18,
  };
  const karteStil = { maxWidth: 420, width: "100%", textAlign: "center", background: T.karte, borderRadius: T.radius, padding: T.abstand };

  // 🚦 Tagesform: freiwillige Frage vor der ersten Lerneinheit des Tages.
  const lernRoute = ["ueben", "spiele", "konz", "schrift", "aufsatz"].includes(route);
  const tagesformWaehlen = (modus) => {
    logChange(
      {
        ...data,
        lernstand: {
          ...data.lernstand,
          tagesform: { tag: heute, modus },
          lerntage: modus ? tagesformEintragen(data.lernstand.lerntage, heute, modus) : data.lernstand.lerntage,
        },
      },
      "lernen", "neu", modus ? "Tagesform für heute gewählt" : "Tagesform-Frage übersprungen",
    );
  };
  const tagesformOffen = !tresor.elternModus && lernRoute
    && tagesformNoetig(data.einstellungen, data.lernstand.tagesform, heute);

  // ⏰ Time-Boxing: Ist die Lernzeit um, zeigt die App einen freundlichen
  // Stopp-Bildschirm (wie im Original). Der Eltern-Modus bleibt frei,
  // damit Eltern das Limit ändern oder den Tag freigeben können.
  if (!tresor.elternModus && zeitAbgelaufen(data.lernstand.zeit, data.einstellungen.zeitLimit, heute)) {
    return (
      <div data-test="zeit-sperre" style={{
        position: "fixed", inset: 0, zIndex: 900, background: "rgba(38, 50, 72, 0.94)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 18,
      }}>
        <div style={{ maxWidth: 420, width: "100%", textAlign: "center", background: T.karte, borderRadius: T.radius, padding: T.abstand }}>
          <div style={{ fontSize: 56 }}>⏰🌙</div>
          <h2 style={{ margin: "6px 0" }}>Deine Lernzeit für heute ist geschafft!</h2>
          <p>
            Super gemacht{data.profil.name ? `, ${data.profil.name}` : ""}! Du hast heute{" "}
            <b>{data.einstellungen.zeitLimit} Minuten</b> geübt. Dein Kopf darf sich jetzt
            ausruhen – morgen geht es weiter. 🎉
          </p>
          <button data-test="zeit-eltern" onClick={tresor.sperren}
            style={{ background: T.weich, color: T.text, fontWeight: 700 }}>
            🔧 Für Eltern: mit Passwort anmelden
          </button>
        </div>
      </div>
    );
  }
  const tabs = [
    { id: "start", label: "🏠 Start", test: "nav-start" },
    { id: "ueben", label: "✏️ Üben", test: "nav-ueben" },
    { id: "plan", label: "🗓️ Plan", test: "nav-plan" },
    { id: "spiele", label: "🎮 Spiele", test: "nav-spiele" },
    ...(tresor.elternModus ? [{ id: "eltern", label: "🔧 Eltern", test: "nav-eltern" }] : []),
    { id: "neu", label: "✨ Neu?", test: "nav-neu" },
  ];
  return (
    <div
      data-test="app-shell"
      style={{
        // Der Wochenplan braucht Platz für 7 Tages-Spalten (iPad quer).
        maxWidth: route === "plan" ? "min(1360px, 100%)" : "var(--breite-max)",
        margin: "0 auto",
        padding: isMobile ? "10px 12px 80px" : "16px 20px 90px",
      }}
    >
      <header style={{ textAlign: "center", marginBottom: T.abstand }}>
        <h1 style={{ fontSize: "var(--schrift-gross)", margin: "6px 0 0" }}>✏️ Lernprofi</h1>
        <div data-test="version" style={{ color: T.textLeise, fontSize: "var(--schrift-klein)" }}>
          Version {APP_VERSION}
        </div>
      </header>

      <main>
        {route === "neu" ? <WasIstNeu /> : route === "ueben" ? <Ueben /> :
         route === "spiele" ? <Spielhalle /> :
         route === "konz" ? <Konzentration /> :
         route === "schrift" ? <Schrift /> :
         route === "aufsatz" ? <Aufsatz /> :
         route === "plan" ? <Wochenplan /> :
         route === "einstufung" ? <Einstufung /> :
         route === "eltern" && tresor.elternModus ? <Eltern /> : <Start />}
      </main>

      <nav
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          gap: 8,
          justifyContent: "center",
          padding: "10px 12px",
          background: T.karte,
          borderTop: `1px solid ${T.rand}`,
        }}
      >
        {tabs.map((t) => (
          <button
            key={t.id}
            data-test={t.test}
            onClick={() => navTo(t.id)}
            style={{
              flex: "0 1 220px",
              background: route === t.id ? T.primaer : T.weich,
              color: route === t.id ? T.primaerText : T.text,
              fontWeight: 700,
            }}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {tagesformOffen && (
        <div data-test="tagesform" style={overlayStil}>
          <div style={{ ...karteStil, maxWidth: 360 }}>
            <div style={{ fontSize: 38 }}>🦁</div>
            <h2 style={{ margin: "6px 0" }}>Wie fühlt sich Lernen heute an?</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
              <button data-test="tf-gruen" onClick={() => tagesformWaehlen("gruen")}
                style={{ textAlign: "left", background: T.weich, color: T.text, fontWeight: 700 }}>
                💪 Ich bin fit
              </button>
              <button data-test="tf-gelb" onClick={() => tagesformWaehlen("gelb")}
                style={{ textAlign: "left", background: T.weich, color: T.text, fontWeight: 700 }}>
                🙂 Ganz normal
              </button>
              <button data-test="tf-rot" onClick={() => tagesformWaehlen("rot")}
                style={{ textAlign: "left", background: T.weich, color: T.text, fontWeight: 700 }}>
                🌧️ Heute ist es schwer
              </button>
            </div>
            <p style={{ color: T.textLeise, fontSize: "var(--schrift-klein)", margin: "10px 0 6px" }}>
              Deine Antwort gilt nur für heute: An schweren Tagen sind die Mini-Missionen
              kürzer ({missionsLaengeHeute("rot")} Aufgaben) und das Tagesziel kleiner.
            </p>
            <button data-test="tf-skip" onClick={() => tagesformWaehlen("")}
              style={{ background: "transparent", color: T.textLeise, fontSize: "var(--schrift-klein)" }}>
              Einfach loslegen
            </button>
          </div>
        </div>
      )}

      {fokus.pause && (
        <div data-test="fokus-pause" style={overlayStil}>
          <div style={{ ...karteStil, maxWidth: 340 }}>
            <div style={{ fontSize: 44 }}>🦁🤸</div>
            <h2 style={{ margin: "6px 0" }}>Bewegungspause!</h2>
            <p>
              Du bist schon <b>{data.einstellungen.pausenIntervall} Minuten</b> voll dabei – richtig
              stark{data.profil.name ? `, ${data.profil.name}` : ""}! Kurz auftanken, dann läuft der
              Kopf wieder rund:
            </p>
            <p data-test="fokus-idee" style={{ background: T.grund, borderRadius: T.radiusKlein, padding: "10px 12px", textAlign: "left" }}>
              🤸 {fokus.pause.idee}
            </p>
            <PauseUhr />
            <button data-test="fokus-weiter" onClick={fokus.pauseFertig}
              style={{ width: "100%", background: T.primaer, color: T.primaerText, fontWeight: 700 }}>
              Fertig – weiter lernen! 💪
            </button>
            <button data-test="fokus-spaeter" onClick={fokus.pauseSpaeter}
              style={{ marginTop: 6, background: "transparent", color: T.textLeise, fontSize: "var(--schrift-klein)" }}>
              Gleich – ich mache erst die Aufgabe fertig
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
