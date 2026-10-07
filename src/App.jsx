import { useApp } from "./appContext.jsx";
import releaseNotes from "./releaseNotes.json";
import Start from "./features/Start.jsx";
import Ueben from "./features/Ueben.jsx";
import VaultGate from "./features/VaultGate.jsx";

/* App-Shell: Navigation, Routen, Version – KEINE Fachlogik. */
export const APP_VERSION = "0.3.0";

const RN_TYP = {
  neu: "✨ Neu",
  verbessert: "💪 Verbessert",
  fix: "🔧 Behoben",
  hinweis: "💡 Hinweis",
  technik: "⚙️ Technik",
  geaendert: "🔁 Geändert",
};

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
  const { T, route, navTo, isMobile, tresor } = useApp();
  if (tresor.status === "laden") return null; // kurzer Moment beim Start
  if (tresor.status !== "offen") return <VaultGate />;
  const tabs = [
    { id: "start", label: "🏠 Start", test: "nav-start" },
    { id: "ueben", label: "✏️ Üben", test: "nav-ueben" },
    { id: "neu", label: "✨ Neu?", test: "nav-neu" },
  ];
  return (
    <div
      data-test="app-shell"
      style={{
        maxWidth: "var(--breite-max)",
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

      <main>{route === "neu" ? <WasIstNeu /> : route === "ueben" ? <Ueben /> : <Start />}</main>

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
    </div>
  );
}
