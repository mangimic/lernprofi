import { useEffect, useState } from "react";
import { Icon, LeoMark } from "./features/Icon.jsx";
import { useApp } from "./appContext.jsx";
import { zeitAbgelaufen } from "./calc/elternWerkzeuge.js";
import { tagesformNoetig, tagesformEintragen, missionsLaengeHeute } from "./calc/tagesform.js";
import { modulAn, routeErlaubt } from "./calc/module.js";
import releaseNotes from "./releaseNotes.json";
import Start from "./features/Start.jsx";
import Training from "./features/Training.jsx";
import Ueben from "./features/Ueben.jsx";
import Spielhalle from "./features/Spielhalle.jsx";
import Konzentration from "./features/Konzentration.jsx";
import Sudoku from "./features/Sudoku.jsx";
import Einstufung from "./features/Einstufung.jsx";
import KompassPlan from "./features/KompassPlan.jsx";
import Karteikarten from "./features/Karteikarten.jsx";
import KartenKasten from "./features/KartenKasten.jsx";
import Doks from "./features/Doks.jsx";
import Suche from "./features/Suche.jsx";
import Schrift from "./features/Schrift.jsx";
import Aufsatz from "./features/Aufsatz.jsx";
import Wochenplan from "./features/Wochenplan.jsx";
import Eltern from "./features/Eltern.jsx";
import Datenschutz from "./features/Datenschutz.jsx";
import VaultGate from "./features/VaultGate.jsx";

/* App-Shell: Navigation, Routen, Version – KEINE Fachlogik. */
export const APP_VERSION = "0.86.0";

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

// 📱 Tablet (iPad, beide Lagen): Die Navigation ist eine Spalte am linken
// Rand, damit sie mit dem Daumen am Rand erreichbar ist. Nur das Handy
// (bis 640 px) behält die Leiste unten.
const SEITLICH_QUERY = "(min-width: 641px)";
const seitlichJetzt = () => typeof window !== "undefined" && !!window.matchMedia && window.matchMedia(SEITLICH_QUERY).matches;

export default function App() {
  const { T, route, navTo, isMobile, tresor, data, heute, logChange, fokus } = useApp();
  // 📱 Beim Runterscrollen verschwindet die untere Leiste (mehr Platz),
  // beim Hochscrollen oder oben ist sie sofort wieder da.
  const [navWeg, setNavWeg] = useState(false);
  const [sucheOffen, setSucheOffen] = useState(false); // 🔍 Such-Overlay
  const [seitlich, setSeitlich] = useState(seitlichJetzt);
  useEffect(() => {
    if (!window.matchMedia) return undefined;
    const mq = window.matchMedia(SEITLICH_QUERY);
    const auf = () => setSeitlich(mq.matches);
    mq.addEventListener("change", auf);
    return () => mq.removeEventListener("change", auf);
  }, []);
  useEffect(() => {
    // capture:true fängt auch Scrollen in inneren Containern; scrollingElement
    // deckt Browser ab, bei denen window.scrollY nicht mitläuft.
    const leseY = () => window.scrollY || (document.scrollingElement || document.documentElement).scrollTop || 0;
    let letztesY = leseY();
    let timer = null;
    const beimScrollen = () => {
      const y = leseY();
      if (y > letztesY + 4 && y > 80) {
        setNavWeg(true); // beim Runterscrollen Platz machen …
        clearTimeout(timer);
        timer = setTimeout(() => setNavWeg(false), 600); // … und nach kurzem Stillstand zurück
      } else if (y < letztesY - 4 || y <= 80) {
        clearTimeout(timer);
        setNavWeg(false); // hochscrollen oder oben: sofort da
      }
      letztesY = y;
    };
    window.addEventListener("scroll", beimScrollen, { passive: true, capture: true });
    return () => { clearTimeout(timer); window.removeEventListener("scroll", beimScrollen, { capture: true }); };
  }, []);
  if (tresor.status === "laden") return null; // kurzer Moment beim Start
  if (tresor.status !== "offen") return <VaultGate />;

  const overlayStil = {
    position: "fixed", inset: 0, zIndex: 900, background: "rgba(38, 50, 72, 0.94)",
    display: "flex", alignItems: "center", justifyContent: "center", padding: 18,
  };
  const karteStil = { maxWidth: 420, width: "100%", textAlign: "center", background: T.karte, borderRadius: T.radius, padding: T.abstand };

  // 🚦 Tagesform: freiwillige Frage vor der ersten Lerneinheit des Tages.
  const lernRoute = ["ueben", "spiele", "konz", "schrift", "aufsatz", "kasten"].includes(route);
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
  // Navigation mit eigenen Zeichen (kein Emoji) – Designrichtung „Ruhige Bühne"
  const tabs = [
    { id: "start", label: "Start", icon: "home", test: "nav-start" },
    { id: "ueben", label: "Üben", icon: "pencil", test: "nav-ueben" },
    // 🧩 Plan gehört nicht zum Lern-App-Kern – nur mit freigeschaltetem Modul (v0.86)
    ...(modulAn(data, "plan") ? [{ id: "plan", label: "Plan", icon: "calendar", test: "nav-plan" }] : []),
    { id: "spiele", label: "Spiele", icon: "gamepad", test: "nav-spiele" },
    { id: "training", label: "Training", icon: "target", test: "nav-training" },
    ...(tresor.elternModus ? [{ id: "eltern", label: "Eltern", icon: "wrench", test: "nav-eltern" }] : []),
  ];
  // Kopf-Symbole: Hell/Dunkel und „Neu?" wohnen neben der Suche (v0.85)
  const dunkel = data.einstellungen.thema === "dunkel";
  const themaWechseln = () => logChange(
    { ...data, einstellungen: { ...data.einstellungen, thema: dunkel ? "hell" : "dunkel" } },
    "einstellungen", "geaendert", `Darstellung auf ${dunkel ? "Hell" : "Dunkel"} gestellt`,
  );
  const kopfKnopf = { height: "auto", minHeight: "var(--touch)", width: "var(--touch)", padding: 0, borderRadius: 14, background: T.weich, color: T.text, display: "inline-flex", alignItems: "center", justifyContent: "center" };
  return (
    <div
      data-test="app-shell"
      style={{
        // Der Wochenplan braucht Platz für 7 Tages-Spalten (iPad quer).
        maxWidth: route === "plan" ? "min(1360px, 100%)" : "var(--breite-max)",
        margin: "0 auto",
        padding: seitlich ? "16px 20px 40px" : isMobile ? "10px 12px 80px" : "16px 20px 90px",
        paddingLeft: seitlich ? 124 : undefined,
      }}
    >
      <header style={{ textAlign: "center", marginBottom: T.abstand, position: "relative" }}>
        <h1 style={{ fontSize: "var(--schrift-gross)", margin: "6px 0 0", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
          <LeoMark size={34} /> Leos Welten
        </h1>
        <div data-test="version" style={{ color: T.textLeise, fontSize: "var(--schrift-klein)" }}>
          Version {APP_VERSION}
        </div>
        <div style={{ position: "absolute", right: 0, top: 2, display: "flex", gap: 6 }}>
          <button data-test="thema-schalter" onClick={themaWechseln} aria-label={dunkel ? "Hell einschalten" : "Dunkel einschalten"} style={kopfKnopf}>
            <Icon name={dunkel ? "sun" : "moon"} size={22} />
          </button>
          <button data-test="nav-neu" onClick={() => navTo("neu")} aria-label="Was ist neu?"
            style={{ ...kopfKnopf, background: route === "neu" ? "var(--primaer)" : T.weich, color: route === "neu" ? "var(--primaer-text)" : T.text }}>
            <Icon name="sparkle" size={22} />
          </button>
          <button data-test="suche-knopf" onClick={() => setSucheOffen(true)} aria-label="Suchen" style={kopfKnopf}>
            <Icon name="search" size={22} />
          </button>
        </div>
      </header>
      {sucheOffen && <Suche zu={() => setSucheOffen(false)} />}

      <main>
        {!routeErlaubt(route, data) ? <Start /> : route === "neu" ? <WasIstNeu /> : route === "ueben" ? <Ueben /> :
         route === "spiele" ? <Spielhalle /> :
         route === "training" ? <Training /> :
         route === "konz" ? <Konzentration /> :
         route === "sudoku" ? <Sudoku /> :
         route === "schrift" ? <Schrift /> :
         route === "aufsatz" ? <Aufsatz /> :
         route === "plan" ? <Wochenplan /> :
         route === "kompass" ? <KompassPlan /> :
         route === "karten" ? <Karteikarten /> :
         route === "kasten" ? <KartenKasten /> :
         route === "doks" ? <Doks /> :
         route === "einstufung" ? <Einstufung /> :
         route === "datenschutz" ? <Datenschutz zurueck={() => navTo("eltern")} /> :
         route === "eltern" && tresor.elternModus ? <Eltern /> : <Start />}
      </main>

      <nav
        data-test="nav-leiste"
        style={seitlich ? {
          position: "fixed",
          top: 0,
          bottom: 0,
          left: 0,
          width: 100,
          zIndex: 800,
          overflowY: "auto",
          transform: navWeg ? "translateX(-110%)" : "none",
          transition: "transform 0.25s ease",
          display: "flex",
          flexDirection: "column",
          gap: 8,
          padding: "16px 10px",
          background: "var(--tinte)",
        } : {
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          transform: navWeg ? "translateY(110%)" : "none",
          transition: "transform 0.25s ease",
          display: "flex",
          gap: 8,
          justifyContent: "center",
          padding: "8px 10px calc(8px + env(safe-area-inset-bottom))",
          background: "var(--tinte)",
        }}
      >
        {tabs.map((t) => (
          <button
            key={t.id}
            data-test={t.test}
            onClick={() => navTo(t.id)}
            aria-current={route === t.id ? "page" : undefined}
            style={{
              ...(seitlich ? { flex: "0 0 auto", width: "100%", minHeight: 66 } : { flex: "1 1 0", minWidth: 0, minHeight: 58, maxWidth: 120 }),
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3,
              padding: "6px 4px", borderRadius: 18, whiteSpace: "nowrap", lineHeight: 1.1,
              fontSize: 12, fontWeight: 800,
              background: route === t.id ? "var(--primaer)" : "transparent",
              color: route === t.id ? "var(--primaer-text)" : "var(--tinte-leise)",
            }}
          >
            <Icon name={t.icon} size={24} />
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
