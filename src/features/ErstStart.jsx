import { useState } from "react";
import { useApp } from "../appContext.jsx";
import { THEMEN_WELTEN } from "../calc/aufgaben/themen.js";
import { schwerpunkteFuerKlasse, ZEIT_WAHL, erstStartLage } from "../calc/onboarding.js";
import { KLASSEN_WAEHLBAR } from "../calc/klassen.js";
import { Icon, LeoMark } from "./Icon.jsx";

/* 🚀 Geführter Erst-Start (v0.82): Eine Karte ganz oben auf der Startseite
   führt eine NEUE Familie in drei Schritten durch die Einrichtung –
   1 Eltern-Fragen → Übergabe ans Kind → 2 Welten-Wahl → 3 Kennenlern-
   Runde (überspringbar) → „Alles eingerichtet". Welcher Schritt dran
   ist, rechnet erstStartLage() aus Profil, Lernstand und Modus (pur).
   Die beiden Fragen-Karten (Eltern-Fragen, Welten-Wahl) sind hier als
   eigene Bausteine gebaut; die Startseite nutzt sie zusätzlich als
   Rückfall-Karten, falls ein Schritt außerhalb des Erst-Starts offen
   bleibt (z. B. Eltern-Fragen bei Bestandsdaten). */

/** 👋 Willkommens-Fragen (Eltern): Klasse, tägliche Lernzeit, Schwerpunkte. */
export function FragebogenKarte() {
  const { data, logChange, T, heute } = useApp();
  const [fb, setFb] = useState({ klasse: 4, zeit: 20, schwerpunkte: [] });
  const fbSchwerpunkt = (key) => {
    setFb((f) => ({ ...f, schwerpunkte: f.schwerpunkte.includes(key) ? f.schwerpunkte.filter((k) => k !== key) : [...f.schwerpunkte, key] }));
  };
  const fbSpeichern = (uebernehmen) => {
    logChange({
      ...data,
      profil: {
        ...data.profil, onboardingEltern: heute,
        ...(uebernehmen ? { klasse: fb.klasse, schwerpunkte: fb.schwerpunkte } : {}),
      },
      einstellungen: uebernehmen ? { ...data.einstellungen, zeitLimit: fb.zeit } : data.einstellungen,
    }, "profil", "geaendert", uebernehmen ? "Willkommens-Fragen beantwortet" : "Willkommens-Fragen übersprungen");
  };
  return (
    <div data-test="fragebogen-karte">
      <b>Willkommen! Drei kurze Fragen (für Eltern)</b>
      <p style={{ margin: "4px 0 10px", color: T.textLeise, fontSize: "var(--schrift-klein)" }}>
        Damit die App von Anfang an passt – alles später im Elternbereich änderbar.
      </p>
      <p style={{ margin: "0 0 6px", fontWeight: 700, fontSize: "var(--schrift-klein)" }}>1. Welche Klasse?</p>
      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        {/* 🎒 Klassenwechsel leert die Schwerpunkte – jede Klasse hat eigene (v0.87) */}
        {KLASSEN_WAEHLBAR.map((k) => (
          <button key={k} data-test={`fb-klasse-${k}`} onClick={() => setFb({ ...fb, klasse: k, schwerpunkte: [] })}
            style={{ flex: 1, fontWeight: 700, background: fb.klasse === k ? T.primaer : T.weich, color: fb.klasse === k ? T.primaerText : T.text }}>
            Klasse {k}
          </button>
        ))}
      </div>
      <p style={{ margin: "0 0 6px", fontWeight: 700, fontSize: "var(--schrift-klein)" }}>2. Tägliche Lernzeit (kurz und regelmäßig schlägt lang und selten)</p>
      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        {ZEIT_WAHL.map((min) => (
          <button key={min} data-test={`fb-zeit-${min}`} onClick={() => setFb({ ...fb, zeit: min })}
            style={{ flex: 1, fontWeight: 700, padding: "0 4px", background: fb.zeit === min ? T.primaer : T.weich, color: fb.zeit === min ? T.primaerText : T.text }}>
            {min} Min
          </button>
        ))}
      </div>
      <p style={{ margin: "0 0 6px", fontWeight: 700, fontSize: "var(--schrift-klein)" }}>3. Wo hakt es gerade? (mehrere möglich – empfiehlt passende Übungen)</p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
        {schwerpunkteFuerKlasse(fb.klasse).map((s) => (
          <button key={s.key} data-test={`fb-schwerpunkt-${s.key}`} onClick={() => fbSchwerpunkt(s.key)}
            style={{
              flex: "1 1 auto", fontWeight: 700, padding: "0 12px", whiteSpace: "nowrap",
              background: fb.schwerpunkte.includes(s.key) ? T.primaer : T.weich,
              color: fb.schwerpunkte.includes(s.key) ? T.primaerText : T.text,
            }}>
            {s.emoji} {s.name}
          </button>
        ))}
      </div>
      <button data-test="fb-ok" onClick={() => fbSpeichern(true)}
        style={{ width: "100%", background: T.primaer, color: T.primaerText, fontWeight: 700 }}>
        Passt – übernehmen
      </button>
      <button data-test="fb-spaeter" onClick={() => fbSpeichern(false)}
        style={{ width: "100%", marginTop: 6, background: "transparent", color: T.textLeise, fontSize: "var(--schrift-klein)" }}>
        Überspringen (Standard-Einstellungen behalten)
      </button>
    </div>
  );
}

/** 🎨 Welten-Wahl (Kind): bis zu 3 Lieblings-Welten, die erste wird Übungs-Welt. */
export function InteressenKarte() {
  const { data, logChange, T, heute } = useApp();
  const [wahl, setWahl] = useState([]);
  const toggle = (key) => {
    setWahl((w) => (w.includes(key) ? w.filter((k) => k !== key) : w.length >= 3 ? w : [...w, key]));
  };
  const speichern = (gewaehlt) => {
    const namen = THEMEN_WELTEN.filter((w) => gewaehlt.includes(w.key)).map((w) => w.name);
    logChange({
      ...data,
      profil: { ...data.profil, interessen: gewaehlt, interessenGefragt: heute },
      einstellungen: { ...data.einstellungen, uebungsThema: gewaehlt[0] || data.einstellungen.uebungsThema },
    }, "profil", "geaendert", gewaehlt.length ? `Lieblings-Welten gewählt: ${namen.join(", ")}` : "Welten-Frage übersprungen");
  };
  return (
    <div data-test="interessen-karte">
      <b>Was magst du am liebsten?</b>
      <p style={{ margin: "4px 0 10px", color: T.textLeise, fontSize: "var(--schrift-klein)" }}>
        Wähle bis zu 3 Welten – deine Übungs-Sätze kommen dann aus deinen Lieblings-Welten.
        Du kannst das später jederzeit beim Üben ändern.
      </p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
        {THEMEN_WELTEN.map((w) => (
          <button key={w.key} data-test={`interesse-${w.key}`} onClick={() => toggle(w.key)}
            style={{
              flex: "1 1 auto", fontWeight: 700, padding: "0 12px", whiteSpace: "nowrap",
              background: wahl.includes(w.key) ? T.primaer : T.weich,
              color: wahl.includes(w.key) ? T.primaerText : T.text,
            }}>
            {w.emoji} {w.name}
          </button>
        ))}
      </div>
      <button data-test="interessen-ok" disabled={!wahl.length} onClick={() => speichern(wahl)}
        style={{ width: "100%", background: T.primaer, color: T.primaerText, fontWeight: 700, opacity: wahl.length ? 1 : 0.5 }}>
        Das sind meine Welten{wahl.length ? ` (${wahl.length})` : ""}
      </button>
      <button data-test="interessen-spaeter" onClick={() => speichern([])}
        style={{ width: "100%", marginTop: 6, background: "transparent", color: T.textLeise, fontSize: "var(--schrift-klein)" }}>
        Später auswählen
      </button>
    </div>
  );
}

const SCHRITTE = [
  { nr: 1, icon: "user", name: "Eltern-Fragen" },
  { nr: 2, icon: "star", name: "Deine Welten" },
  { nr: 3, icon: "heart", name: "Kennenlern-Runde" },
];

export default function ErstStart() {
  const { data, logChange, T, tresor, navTo } = useApp();
  // Übergabe: Eltern können das Gerät weiterreichen (Kind-Modus) ODER im
  // Eltern-Modus dabeibleiben – dann zeigt Schritt 2 direkt die Welten-Wahl.
  const [bleibtDabei, setBleibtDabei] = useState(false);
  const lageRoh = erstStartLage(data.profil, data.lernstand, tresor.elternModus);
  const lage = lageRoh && lageRoh.schritt === "uebergabe" && bleibtDabei ? { ...lageRoh, schritt: "welten" } : lageRoh;
  if (!lage) return null;

  const abschliessen = (grund) => {
    logChange({ ...data, profil: { ...data.profil, erstStart: "fertig" } }, "profil", "geaendert", grund);
  };
  const erledigtNr = { 1: lage.erledigt.eltern, 2: lage.erledigt.welten, 3: lage.erledigt.kennenlernen };
  const dunkel = lage.schritt === "uebergabe" || lage.schritt === "fertig"; // Übergabe und Abschluss als dunkle Bühne
  const punkt = (s) => {
    const fertig = erledigtNr[s.nr];
    const aktiv = s.nr === lage.nummer;
    return (
      <span key={s.nr} data-test={`erststart-punkt-${s.nr}`} style={{
        display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 999,
        fontSize: "var(--schrift-klein)", fontWeight: aktiv ? 800 : 600,
        background: fertig ? "var(--ok)" : aktiv ? "var(--primaer)" : dunkel ? "rgba(255,255,255,0.12)" : T.weich,
        color: fertig ? "#fff" : aktiv ? "var(--primaer-text)" : dunkel ? "var(--tinte-leise)" : T.textLeise,
      }}>
        <Icon name={fertig ? "checkSimple" : s.icon} size={14} weite={3} /> {s.name}
      </span>
    );
  };

  return (
    <div data-test="erststart-karte" style={{
      background: dunkel ? "var(--tinte)" : T.karte, color: dunkel ? "var(--tinte-text)" : T.text,
      borderRadius: 28, padding: dunkel ? 28 : T.abstand, marginBottom: T.abstand,
      boxShadow: dunkel ? "none" : "var(--schatten)",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
        <b style={{ display: "inline-flex", alignItems: "center", gap: 8 }}><Icon name="flag" size={18} weite={2.6} /> Erst-Start</b>
        <span data-test="erststart-schritt" style={{ color: dunkel ? "var(--tinte-leise)" : T.textLeise, fontSize: "var(--schrift-klein)", whiteSpace: "nowrap", fontWeight: 700 }}>
          Schritt {lage.nummer} von 3
        </span>
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", margin: "6px 0 12px" }}>{SCHRITTE.map(punkt)}</div>

      {lage.elternWartet && (
        <p data-test="erststart-eltern-wartet" style={{ margin: "0 0 10px", color: T.textLeise, fontSize: "var(--schrift-klein)" }}>
          Schritt 1 ist für Mama oder Papa (mit dem Eltern-Passwort) – du kannst schon mit deinen Welten loslegen!
        </p>
      )}

      {lage.schritt === "eltern" && <FragebogenKarte />}

      {lage.schritt === "uebergabe" && (
        <div data-test="erststart-uebergabe" style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 10, padding: "8px 0" }}>
          <LeoMark size={120} stimmung="freut" label="Leo freut sich" />
          <h3 style={{ margin: "8px 0 0", fontSize: "var(--schrift-titel)", lineHeight: 1.1 }}>Danke! Jetzt ist dein Kind dran.</h3>
          <p style={{ margin: 0, maxWidth: 520, color: "var(--tinte-leise)", fontSize: "var(--schrift)", lineHeight: 1.45 }}>
            Die nächsten zwei Schritte macht das Kind selbst: Lieblings-Welten wählen und Leo in
            einer Kennenlern-Runde zeigen, was es schon kann. Mit der Übergabe endet der
            Eltern-Modus – der Elternbereich öffnet sich später wieder mit dem Eltern-Passwort.
          </p>
          <button data-test="erststart-uebergabe-kind" onClick={() => tresor.kindModus()}
            style={{ width: "100%", maxWidth: 520, marginTop: 8, minHeight: 58, background: "var(--primaer)", color: "var(--primaer-text)", fontSize: 20, fontWeight: 900, borderRadius: 20, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
            <Icon name="user" size={24} weite={2.6} /> Jetzt übernimmt mein Kind
          </button>
          <button data-test="erststart-uebergabe-weiter" onClick={() => setBleibtDabei(true)}
            style={{ background: "transparent", color: "var(--tinte-leise)", fontSize: "var(--schrift-klein)" }}>
            Weiter – ich bleibe dabei (Eltern-Modus bleibt an)
          </button>
          <p style={{ margin: "6px 0 0", display: "inline-flex", alignItems: "center", gap: 8, color: "var(--tinte-leise)", fontSize: "var(--schrift-klein)" }}>
            <Icon name="lock" size={16} /> Alles bleibt verschlüsselt auf eurem Gerät.
          </p>
        </div>
      )}

      {lage.schritt === "welten" && <InteressenKarte />}

      {lage.schritt === "kennenlernen" && (
        <div data-test="erststart-kennenlernen-karte">
          <b style={{ display: "inline-flex", alignItems: "center", gap: 8 }}><LeoMark size={26} /> Leo lernt dich kennen</b>
          <p style={{ margin: "4px 0 10px", color: T.textLeise, fontSize: "var(--schrift-klein)" }}>
            Zeig Leo in einer Kennenlern-Runde, was du schon kannst: ein paar Aufgaben aus
            Deutsch und Mathe. Danach stellt sich die App genau auf dich ein.
          </p>
          <button data-test="erststart-kennenlernen" onClick={() => navTo("einstufung")}
            style={{ width: "100%", background: T.primaer, color: T.primaerText, fontWeight: 700 }}>
            Kennenlern-Runde starten
          </button>
          <button data-test="erststart-spaeter" onClick={() => abschliessen("Erst-Start abgeschlossen (Kennenlern-Runde später)")}
            style={{ width: "100%", marginTop: 6, background: "transparent", color: T.textLeise, fontSize: "var(--schrift-klein)" }}>
            Später – die Einladung bleibt auf der Startseite
          </button>
        </div>
      )}

      {lage.schritt === "fertig" && (
        <div data-test="erststart-fertig" style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 10, padding: "8px 0" }}>
          <LeoMark size={120} stimmung="freut" label="Leo freut sich" />
          <h3 style={{ margin: "8px 0 0", fontSize: "var(--schrift-titel)", lineHeight: 1.1 }}>Alles eingerichtet!</h3>
          <p style={{ margin: 0, maxWidth: 520, color: "var(--tinte-leise)", fontSize: "var(--schrift)", lineHeight: 1.45 }}>
            Leo kennt dich jetzt, deine Welten sind gewählt und dein Trainingsplan steht auf der
            Startseite. Viel Spaß!
          </p>
          <button data-test="erststart-los" onClick={() => abschliessen("Erst-Start abgeschlossen")}
            style={{ width: "100%", maxWidth: 520, marginTop: 8, minHeight: 58, background: "var(--primaer)", color: "var(--primaer-text)", fontSize: 20, fontWeight: 900, borderRadius: 20, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
            Los geht's <Icon name="arrow" size={22} weite={2.6} />
          </button>
        </div>
      )}
    </div>
  );
}
