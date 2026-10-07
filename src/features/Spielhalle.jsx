import { useState } from "react";
import { useApp } from "../appContext.jsx";
import { spielStartbar, muenzeEinloesen, blitzFragen, wurfWerten, SEE_WUERFE } from "../calc/spiele.js";

/* 🎮 Spielhalle: Ein Spielbesuch kostet 1 Münze (verdient beim Üben).
   Erstes Spiel: 🎣 See-Abenteuer – Frage richtig = Fisch gefangen,
   lange Serie = dicke Fische. Spiele geben keine Münzen. */

export default function Spielhalle() {
  const { data, logChange, T, heute, navTo } = useApp();
  const [spiel, setSpiel] = useState(null); // { fragen, index, stand, gewaehlt, fertig }
  const muenzen = data.lernstand.muenzen;

  const karte = { background: T.karte, borderRadius: T.radius, padding: T.abstand, marginBottom: T.abstand };
  const primaer = { width: "100%", background: T.primaer, color: T.primaerText, fontWeight: 700 };

  const starten = () => {
    if (!spielStartbar(muenzen)) return;
    const neu = { ...data, lernstand: { ...data.lernstand, muenzen: muenzeEinloesen(muenzen) } };
    logChange(neu, "spiele", "neu", "See-Abenteuer besucht (1 Münze eingelöst)");
    setSpiel({
      fragen: blitzFragen(SEE_WUERFE, `${heute}:see:${Date.now() % 7}`),
      index: 0, stand: { serie: 0, punkte: 0, fang: [] }, gewaehlt: null, fertig: false,
    });
  };

  const antworten = (wahl) => {
    if (spiel.gewaehlt !== null) return;
    const a = spiel.fragen[spiel.index];
    setSpiel({ ...spiel, gewaehlt: wahl, stand: wurfWerten(spiel.stand, wahl === a.r) });
  };

  const weiter = () => {
    if (spiel.index + 1 < spiel.fragen.length) {
      setSpiel({ ...spiel, index: spiel.index + 1, gewaehlt: null });
      return;
    }
    const rekord = Math.max(data.lernstand.rekorde.seeAbenteuer || 0, spiel.stand.punkte);
    logChange(
      { ...data, lernstand: { ...data.lernstand, rekorde: { ...data.lernstand.rekorde, seeAbenteuer: rekord } } },
      "spiele", "neu", `See-Abenteuer beendet: ${spiel.stand.punkte} Punkte`,
    );
    setSpiel({ ...spiel, fertig: true });
  };

  // --- Spiel läuft ---
  if (spiel && !spiel.fertig) {
    const a = spiel.fragen[spiel.index];
    const beantwortet = spiel.gewaehlt !== null;
    const letzter = spiel.stand.fang[spiel.stand.fang.length - 1];
    return (
      <div data-test="see-spiel">
        <div style={karte}>
          <p style={{ margin: "0 0 4px", color: T.textLeise, fontSize: "var(--schrift-klein)" }}>
            🎣 Wurf {spiel.index + 1} von {spiel.fragen.length} · ⭐ {spiel.stand.punkte} Punkte
            {spiel.stand.serie > 1 ? ` · 🔥 Serie: ${spiel.stand.serie}` : ""}
          </p>
          <p style={{ fontSize: "var(--schrift-gross)", letterSpacing: 2, margin: "4px 0" }}>
            🌊{spiel.stand.fang.map((f) => f.emoji).join("")}{"🌊"}
          </p>
          <p data-test="spiel-frage" style={{ fontWeight: 700, fontSize: "var(--schrift-gross)", margin: "10px 0" }}>{a.f}</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {a.optionen.map((o) => (
              <button key={o} data-test="spiel-opt" data-richtig={o === a.r ? "1" : undefined}
                disabled={beantwortet} onClick={() => antworten(o)}
                style={{
                  background: beantwortet && o === a.r ? "var(--ok)" : T.weich,
                  color: beantwortet && o === a.r ? "#fff" : T.text,
                  fontWeight: 700, textAlign: "left", padding: "0 14px",
                  opacity: beantwortet && o !== a.r && o !== spiel.gewaehlt ? 0.6 : 1,
                }}>
                {o}
              </button>
            ))}
          </div>
          {beantwortet && (
            <p data-test="spiel-feedback" style={{ color: letzter?.punkte ? T.ok : T.warn }}>
              {letzter?.punkte
                ? `${letzter.emoji} ${letzter.name} gefangen (+${letzter.punkte})! ${a.tipp ? "💡 " + a.tipp : ""}`
                : <>💨 Entwischt! Richtig wäre <b>{a.r}</b>. {a.tipp ? "💡 " + a.tipp : ""}</>}
            </p>
          )}
          <button data-test="spiel-weiter" disabled={!beantwortet} onClick={weiter} style={{ ...primaer, marginTop: 8 }}>
            {spiel.index + 1 < spiel.fragen.length ? "Nächster Wurf" : "An Land gehen"}
          </button>
        </div>
      </div>
    );
  }

  // --- Ergebnis ---
  if (spiel?.fertig) {
    const rekord = data.lernstand.rekorde.seeAbenteuer || 0;
    return (
      <div data-test="see-ergebnis">
        <div style={karte}>
          <h2 style={{ marginTop: 0 }}>🏖️ Angel-Tag vorbei!</h2>
          <p style={{ fontSize: "var(--schrift-gross)" }}>{spiel.stand.fang.map((f) => f.emoji).join(" ")}</p>
          <p><b>⭐ {spiel.stand.punkte} Punkte</b>{spiel.stand.punkte >= rekord ? " · 🏆 Neuer Rekord!" : ` · Rekord: ${rekord}`}</p>
          <button data-test="spiel-nochmal" onClick={() => { setSpiel(null); }} style={primaer}>
            ← Zurück zur Spielhalle
          </button>
        </div>
      </div>
    );
  }

  // --- Spielhalle ---
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
          Frage richtig = Fisch gefangen. Lange Serie = dicke Fische! 🐋
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
