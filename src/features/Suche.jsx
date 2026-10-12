import { useEffect, useMemo, useRef, useState } from "react";
import { useApp } from "../appContext.jsx";
import { sucheIndex, suchen } from "../calc/suche.js";

/* 🔍 SUCHE: ein Feld, sofortige Treffer, ein Tipp springt hin.
   Übungen starten direkt im richtigen Lernfeld (Deep-Link wie beim
   Kompass), alles andere öffnet seine Seite. Enter nimmt den ersten
   Treffer, Escape schließt. */

export default function Suche({ zu }) {
  const { data, T, tresor, navTo, uebenZielSetzen } = useApp();
  const [frage, setFrage] = useState("");
  const feld = useRef(null);
  const index = useMemo(() => sucheIndex(data, tresor.elternModus), [data, tresor.elternModus]);
  const treffer = suchen(index, frage);

  useEffect(() => { feld.current?.focus(); }, []);
  useEffect(() => {
    const taste = (e) => { if (e.key === "Escape") zu(); };
    window.addEventListener("keydown", taste);
    return () => window.removeEventListener("keydown", taste);
  }, [zu]);

  const springen = (t) => {
    zu();
    if (t.ziel.feld) { uebenZielSetzen(t.ziel.feld); navTo("ueben"); return; }
    navTo(t.ziel.route);
  };

  return (
    <div data-test="suche-dialog" onClick={zu} style={{
      position: "fixed", inset: 0, zIndex: 950, background: "rgba(38, 50, 72, 0.94)",
      display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "10vh 18px 18px",
    }}>
      <div onClick={(ev) => ev.stopPropagation()}
        style={{ maxWidth: 480, width: "100%", background: T.karte, borderRadius: T.radius, padding: T.abstand }}>
        <form onSubmit={(e) => { e.preventDefault(); if (treffer.length) springen(treffer[0]); }}>
          <input data-test="suche-eingabe" ref={feld} type="search" placeholder="🔍 Suchen … (Übung, Karte, Termin, Seite)"
            value={frage} onChange={(e) => setFrage(e.target.value)} autoComplete="off"
            style={{ width: "100%", boxSizing: "border-box", minHeight: "var(--touch)", fontSize: "var(--schrift)",
              borderRadius: T.radiusKlein, border: `2px solid ${T.primaer}`, padding: "0 14px",
              background: T.grund, color: T.text, fontWeight: 700 }} />
        </form>
        <div style={{ marginTop: 10, display: "grid", gap: 6, maxHeight: "55vh", overflowY: "auto" }}>
          {treffer.map((t, i) => (
            <button key={`${t.titel}-${i}`} data-test="suche-treffer" onClick={() => springen(t)}
              style={{ display: "flex", alignItems: "center", gap: 10, textAlign: "left",
                height: "auto", minHeight: "var(--touch)", padding: "8px 12px",
                background: T.grund, color: T.text, borderRadius: T.radiusKlein }}>
              <span style={{ fontSize: 20 }}>{t.emoji}</span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <b style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.titel}</b>
                <span style={{ fontSize: "var(--schrift-klein)", color: T.textLeise }}>{t.detail}</span>
              </span>
              <span aria-hidden="true" style={{ color: T.textLeise }}>→</span>
            </button>
          ))}
          {frage.trim() && !treffer.length && (
            <p data-test="suche-leer" style={{ margin: 0, color: T.textLeise, fontWeight: 700 }}>
              Nichts gefunden – probier ein anderes Wort (z. B. „Würfel", „Uhr", „Kompass").
            </p>
          )}
        </div>
        <button onClick={zu} style={{ width: "100%", marginTop: 10, background: "transparent", color: T.textLeise }}>
          Schließen (Esc)
        </button>
      </div>
    </div>
  );
}
