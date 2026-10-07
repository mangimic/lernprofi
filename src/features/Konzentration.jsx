import { useEffect, useRef } from "react";
import { useApp } from "../appContext.jsx";
import { aufgabenZaehlen } from "../calc/lerntage.js";
import { konzentrationStart } from "../spiele/konzentration.js";

/* 🧠 Konzentrations-Training: originalgetreuer Port aus der Alt-App
   (Zahlenkette, Alphabet-Sprünge, Blitzlesen) als Vanilla-Insel.
   Kostet KEINE Münze – es ist Training, kein Spielhallen-Besuch.
   Jede geschaffte Runde zählt für die Mini-Missionen; der Stand
   (Kette, Bestwerte, Blitz-Runden) liegt im verschlüsselten Tresor. */

export default function Konzentration() {
  const { data, update, T, heute, navTo } = useApp();
  const host = useRef(null);
  const engine = useRef(null);
  const dataRef = useRef(data);
  dataRef.current = data;

  // Die Engine ruft speichern() und aufgabeGeloest() auch direkt
  // nacheinander auf – dataRef wird deshalb SOFORT mitgezogen, damit
  // der zweite Aufruf nicht den ersten überschreibt (React rendert
  // erst nach dem Tick neu).
  const anwenden = (patch) => {
    const d = dataRef.current;
    const nd = { ...d, lernstand: { ...d.lernstand, ...patch(d) } };
    dataRef.current = nd;
    update(nd);
  };

  useEffect(() => {
    if (!host.current) return;
    engine.current = konzentrationStart(host.current, {
      stand: dataRef.current.lernstand.konzentration,
      heute,
      speichern: (stand) => anwenden(() => ({ konzentration: stand })),
      aufgabeGeloest: () => anwenden((d) => ({
        lerntage: aufgabenZaehlen(d.lernstand.lerntage, heute, 1, { missionsZiel: d.einstellungen.missionsZiel }),
      })),
    });
    return () => engine.current?.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ background: T.karte, borderRadius: T.radius, padding: T.abstand }}>
      <div ref={host} />
      <button data-test="konz-zurueck" onClick={() => { engine.current?.stop(); navTo("start"); }}
        style={{ background: "transparent", color: T.textLeise, fontSize: "var(--schrift-klein)" }}>
        ← Zurück zur Startseite
      </button>
    </div>
  );
}
