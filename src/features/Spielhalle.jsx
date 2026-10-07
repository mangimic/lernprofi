import { useEffect, useRef, useState } from "react";
import { useApp } from "../appContext.jsx";
import { spielStartbar, muenzeEinloesen } from "../calc/spiele.js";
import { aufgabenZaehlen } from "../calc/lerntage.js";
import { seeAbenteuerStart } from "../spiele/seeAbenteuer.js";

/* 🎮 Spielhalle: Ein Spielbesuch kostet 1 Münze (verdient beim Üben).
   🎣 See-Abenteuer ist der originalgetreue Port aus der Alt-App:
   Figur läuft um den See, Angel-Animation, echte Fischarten mit
   mehreren Fragen, Denk-Pause nach Fehlern. */

export default function Spielhalle() {
  const { data, logChange, T, heute, navTo } = useApp();
  const [modus, setModus] = useState("halle"); // halle | spiel | fertig
  const [ergebnis, setErgebnis] = useState(null);
  const host = useRef(null);
  const engine = useRef(null);
  const muenzen = data.lernstand.muenzen;

  const karte = { background: T.karte, borderRadius: T.radius, padding: T.abstand, marginBottom: T.abstand };
  const primaer = { width: "100%", background: T.primaer, color: T.primaerText, fontWeight: 700 };

  const starten = () => {
    if (!spielStartbar(muenzen)) return;
    logChange(
      { ...data, lernstand: { ...data.lernstand, muenzen: muenzeEinloesen(muenzen) } },
      "spiele", "neu", "See-Abenteuer besucht (1 Münze eingelöst)",
    );
    setErgebnis(null);
    setModus("spiel");
  };

  // Engine mounten, sobald der Spiel-Container steht
  useEffect(() => {
    if (modus !== "spiel" || !host.current) return;
    engine.current = seeAbenteuerStart(host.current, {
      onFertig: (erg) => {
        setErgebnis(erg);
        setModus("fertig");
      },
    });
    return () => engine.current?.stop();
  }, [modus]);

  // Ergebnis ins Dokument schreiben (eigener Effekt, nach dem Render)
  useEffect(() => {
    if (modus !== "fertig" || !ergebnis) return;
    const rekord = Math.max(data.lernstand.rekorde.seeAbenteuer || 0, ergebnis.geloest);
    logChange(
      {
        ...data,
        lernstand: {
          ...data.lernstand,
          rekorde: { ...data.lernstand.rekorde, seeAbenteuer: rekord },
          lerntage: aufgabenZaehlen(data.lernstand.lerntage, heute, ergebnis.geloest, { missionsZiel: data.einstellungen.missionsZiel }),
        },
      },
      "spiele", "neu", `See-Abenteuer: alle ${ergebnis.fische} Fische, ${ergebnis.geloest} Fragen richtig`,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modus]);

  if (modus === "spiel") {
    return (
      <div style={karte}>
        <div ref={host} />
        <button data-test="spiel-abbrechen" onClick={() => { engine.current?.stop(); setModus("halle"); }}
          style={{ background: "transparent", color: T.textLeise, fontSize: "var(--schrift-klein)" }}>
          ← Spiel verlassen
        </button>
      </div>
    );
  }

  if (modus === "fertig" && ergebnis) {
    return (
      <div data-test="see-ergebnis">
        <div style={karte}>
          <h2 style={{ marginTop: 0 }}>🧺 Korb voll – alle {ergebnis.fische} Fische!</h2>
          <p>
            <b>{ergebnis.geloest} von {ergebnis.gesamt}</b> Fragen beim ersten Versuch richtig
            {ergebnis.fehler === 0 ? " – fehlerfrei, stark! 🏆" : ` · ${ergebnis.fehler} Fisch${ergebnis.fehler === 1 ? "" : "e"} erst beim zweiten Anlauf`}
          </p>
          <p style={{ color: T.textLeise, fontSize: "var(--schrift-klein)" }}>
            Rekord: {Math.max(data.lernstand.rekorde.seeAbenteuer || 0, ergebnis.geloest)} richtige Fragen in einem Angel-Tag
          </p>
          <button data-test="spiel-nochmal" onClick={() => setModus("halle")} style={primaer}>
            ← Zurück zur Spielhalle
          </button>
        </div>
      </div>
    );
  }

  return (
    <div data-test="spielhalle">
      <div style={karte}>
        <h2 style={{ marginTop: 0 }}>🎮 Spielhalle</h2>
        <p style={{ color: T.textLeise }}>
          Ein Spielbesuch kostet <b>1 🪙 Münze</b> – Münzen verdienst du beim Üben
          (1 Runde = 1 Münze). Du hast gerade <b data-test="spielhalle-muenzen">{muenzen}</b> {muenzen === 1 ? "Münze" : "Münzen"}.
        </p>
      </div>
      <button data-test="spiel-see" onClick={starten} disabled={!spielStartbar(muenzen)}
        style={{ ...karte, width: "100%", textAlign: "left", display: "block", border: `1px solid ${T.rand}`, opacity: spielStartbar(muenzen) ? 1 : 0.6 }}>
        <b>🎣 See-Abenteuer</b>
        <span style={{ float: "right", color: T.textLeise, fontSize: "var(--schrift-klein)" }}>
          {spielStartbar(muenzen) ? "🪙 1 Münze einlösen" : "🔒 Übe für 1 Münze"}
        </span>
        <p style={{ margin: "6px 0 0", color: T.textLeise, fontSize: "var(--schrift-klein)" }}>
          Lauf um den See, wirf die Angel aus und fang alle Fische – vom flinken
          Barsch bis zum Hecht, der sich dreimal wehrt!
        </p>
      </button>
      {!spielStartbar(muenzen) && (
        <button data-test="zum-ueben-aus-halle" onClick={() => navTo("ueben")} style={primaer}>
          ✏️ Erst eine Runde üben
        </button>
      )}
      <p style={{ color: T.textLeise, fontSize: "var(--schrift-klein)" }}>
        Weitere Spiele (Blockwelt, Tennis, Fußball, Schach) ziehen nach und nach ein.
      </p>
    </div>
  );
}
