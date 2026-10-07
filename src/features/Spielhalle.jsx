import { useEffect, useRef, useState } from "react";
import { useApp } from "../appContext.jsx";
import { spielStartbar, muenzeEinloesen } from "../calc/spiele.js";
import { aufgabenZaehlen } from "../calc/lerntage.js";
import { seeAbenteuerStart } from "../spiele/seeAbenteuer.js";
import { blockweltStart } from "../spiele/blockwelt.js";

/* 🎮 Spielhalle: Ein Spielbesuch kostet 1 Münze (verdient beim Üben).
   🎣 See-Abenteuer und ⛏️ Blockwelt sind originalgetreue Ports aus der
   Alt-App (Vanilla-Inseln mit React-Wrapper). Die Blockwelt wird
   dauerhaft im verschlüsselten Tresor gespeichert. */

export default function Spielhalle() {
  const { data, update, logChange, T, heute, navTo } = useApp();
  const [modus, setModus] = useState("halle"); // halle | see | blockwelt | fertig
  const [ergebnis, setErgebnis] = useState(null);
  const host = useRef(null);
  const engine = useRef(null);
  const dataRef = useRef(data);
  dataRef.current = data;
  const muenzen = data.lernstand.muenzen;

  const karte = { background: T.karte, borderRadius: T.radius, padding: T.abstand, marginBottom: T.abstand };
  const primaer = { width: "100%", background: T.primaer, color: T.primaerText, fontWeight: 700 };

  const starten = (id, name) => {
    if (!spielStartbar(muenzen)) return;
    logChange(
      { ...data, lernstand: { ...data.lernstand, muenzen: muenzeEinloesen(muenzen) } },
      "spiele", "neu", `${name} besucht (1 Münze eingelöst)`,
    );
    setErgebnis(null);
    setModus(id);
  };

  // Engine mounten, sobald der Spiel-Container steht
  useEffect(() => {
    if (!host.current) return;
    if (modus === "see") {
      engine.current = seeAbenteuerStart(host.current, {
        onFertig: (erg) => { setErgebnis(erg); setModus("fertig"); },
      });
    } else if (modus === "blockwelt") {
      engine.current = blockweltStart(host.current, {
        stand: dataRef.current.lernstand.blockwelt,
        speichern: (stand) => {
          const d = dataRef.current;
          update({ ...d, lernstand: { ...d.lernstand, blockwelt: stand } });
        },
      });
    } else { return; }
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

  if (modus === "see" || modus === "blockwelt") {
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
      <button data-test="spiel-see" onClick={() => starten("see", "See-Abenteuer")} disabled={!spielStartbar(muenzen)}
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
      <button data-test="spiel-blockwelt" onClick={() => starten("blockwelt", "Blockwelt")} disabled={!spielStartbar(muenzen)}
        style={{ ...karte, width: "100%", textAlign: "left", display: "block", border: `1px solid ${T.rand}`, opacity: spielStartbar(muenzen) ? 1 : 0.6 }}>
        <b>⛏️ Blockwelt</b>
        <span style={{ float: "right", color: T.textLeise, fontSize: "var(--schrift-klein)" }}>
          {spielStartbar(muenzen) ? "🪙 1 Münze einlösen" : "🔒 Übe für 1 Münze"}
          {data.lernstand.blockwelt?.verdient ? ` · 🎁 ${data.lernstand.blockwelt.verdient}` : ""}
        </span>
        <p style={{ margin: "6px 0 0", color: T.textLeise, fontSize: "var(--schrift-klein)" }}>
          Bau deine eigene Welt! Blöcke verdienst du mit Fragen, die Werkstatt
          schaltet Tiere, Möbel und 💥 TNT frei – deine Welt bleibt gespeichert.
        </p>
      </button>
      {!spielStartbar(muenzen) && (
        <button data-test="zum-ueben-aus-halle" onClick={() => navTo("ueben")} style={primaer}>
          ✏️ Erst eine Runde üben
        </button>
      )}
      <p style={{ color: T.textLeise, fontSize: "var(--schrift-klein)" }}>
        Weitere Spiele (Tennis, Fußball, Schach) ziehen nach und nach ein.
      </p>
    </div>
  );
}
