import { useState } from "react";
import { DndContext, useDraggable, useDroppable, PointerSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import { useApp } from "../appContext.jsx";
import {
  WOCHENTAGE, BAUSTEINE, TERMIN_ARTEN, LERN_MINUTEN, bausteinInfo,
  wochenMontag, tagDatum, planFuerWoche, blockHinzu, blockWeg,
  termineDerWoche, planPruefung,
} from "../calc/wochenplan.js";

/* 🗓️ MEIN WOCHENPLAN (Etappe 9): Felix setzt sein Pensum selbst.
   Bedienung doppelt (ADHS-gerecht, iPad-tauglich):
   1. ANTIPPEN: Baustein tippen → Tag tippen (große Flächen, kein
      Feinmotorik-Frust) – das ist auch der Weg der Smoke-Tests.
   2. ZIEHEN: dieselben Bausteine lassen sich per dnd-kit in die
      Tage ziehen – der Bonus, der Spaß macht.
   Der 🦁-Wächter verbietet nichts: Er zeigt je Tag eine Ampel und
   höchstens einen freundlichen Hinweis (nie eine Fehlerliste). */

function PaletteBaustein({ b, gewaehlt, aufTipp }) {
  const { T } = useApp();
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: `baustein-${b.typ}` });
  return (
    <button ref={setNodeRef} {...listeners} {...attributes}
      data-test={`baustein-${b.typ}`} onClick={() => aufTipp(b.typ)}
      style={{
        touchAction: "none", height: "auto", minHeight: "var(--touch)", padding: "6px 10px",
        background: gewaehlt ? T.primaer : T.weich, color: gewaehlt ? T.primaerText : T.text,
        fontWeight: 700, opacity: isDragging ? 0.4 : 1,
        transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : undefined,
        zIndex: isDragging ? 50 : undefined, position: "relative",
      }}>
      {b.emoji} {b.name}{b.lern ? ` · ${LERN_MINUTEN} Min` : ""}
    </button>
  );
}

function TagSpalte({ idx, heuteIdx, termine, bloecke, pruefung, aufTipp, aufWeg }) {
  const { T } = useApp();
  const { setNodeRef, isOver } = useDroppable({ id: `tag-${idx}` });
  const p = pruefung.tage[idx];
  const ampel = p.status === "voll" ? "🔴" : p.status === "einseitig" ? "🟡" : p.lern + p.frei > 0 ? "🟢" : "";
  return (
    <div ref={setNodeRef} data-test={`tag-${idx}`} onClick={() => aufTipp(idx)}
      style={{
        flex: "1 1 120px", minWidth: 120, background: isOver ? T.weich : T.karte,
        borderRadius: T.radiusKlein, padding: 8, outline: idx === heuteIdx ? `2px solid ${T.primaer}` : "none",
        cursor: "pointer",
      }}>
      <div style={{ fontWeight: 800, marginBottom: 4 }}>
        {WOCHENTAGE[idx]}{idx === heuteIdx ? " · heute" : ""} <span data-test={`ampel-${idx}`}>{ampel}</span>
      </div>
      {termine.map((t) => {
        const art = TERMIN_ARTEN[t.art];
        return (
          <div key={t.id} data-test="termin-chip" style={{
            background: "var(--warn-weich, #ffe9b3)", color: "#5b4300", borderRadius: 6,
            padding: "3px 6px", fontSize: "12.5px", fontWeight: 700, marginBottom: 4,
          }}>
            {art.emoji} {art.name}{t.fach ? ` ${t.fach}` : ""}
          </div>
        );
      })}
      {bloecke.map((b) => {
        const info = bausteinInfo(b.typ);
        return (
          <div key={b.id} data-test="plan-block" data-typ={b.typ} style={{
            background: info.lern ? T.primaer : T.weich, color: info.lern ? T.primaerText : T.text,
            borderRadius: 6, padding: "4px 6px", marginBottom: 4, fontSize: "var(--schrift-klein)",
            fontWeight: 700, display: "flex", alignItems: "center", gap: 4,
          }}>
            <span style={{ flex: 1 }}>{info.emoji} {info.name}</span>
            <button data-test="block-weg" onClick={(ev) => { ev.stopPropagation(); aufWeg(b.id); }}
              aria-label="Baustein entfernen"
              style={{ background: "transparent", color: "inherit", padding: 0, minHeight: 0, height: "auto", fontSize: 14 }}>
              ✖
            </button>
          </div>
        );
      })}
      {p.lern > 0 && (
        <div style={{ color: T.textLeise, fontSize: "12.5px" }}>⏱️ {p.lernMin} Min Lernen (10+5-Takt)</div>
      )}
      {p.hinweis && (
        <div data-test={`tag-hinweis-${idx}`} style={{ color: "#8a5a00", fontSize: "12.5px", marginTop: 4 }}>
          🦁 {p.hinweis}
        </div>
      )}
    </div>
  );
}

export default function Wochenplan() {
  const { data, logChange, T, heute, navTo } = useApp();
  const [wahl, setWahl] = useState(null); // angetippter Baustein (Tap-to-Place)
  const sensoren = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 8 } }),
  );

  const montag = wochenMontag(heute);
  const plan = planFuerWoche(data.lernstand.wochenplan, montag);
  const heuteIdx = WOCHENTAGE.findIndex((_, i) => tagDatum(montag, i) === heute);
  const termineJe = termineDerWoche(data.einstellungen.termine, montag);
  const pruefung = planPruefung(plan, data.einstellungen.termine, data.einstellungen.zeitLimit);

  const speichern = (neuerPlan, text) => {
    logChange({ ...data, lernstand: { ...data.lernstand, wochenplan: neuerPlan } }, "wochenplan", "geaendert", text);
  };
  const hinzu = (tagIdx, typ) => {
    const neu = blockHinzu(plan, tagIdx, typ);
    if (neu !== plan) speichern(neu, `Baustein ${typ} am ${WOCHENTAGE[tagIdx]} eingeplant`);
  };
  const tagGetippt = (idx) => {
    if (wahl) { hinzu(idx, wahl); setWahl(null); }
  };
  const ziehenEnde = ({ active, over }) => {
    if (!over) return;
    const typ = String(active.id).replace("baustein-", "");
    const tagIdx = parseInt(String(over.id).replace("tag-", ""), 10);
    if (Number.isInteger(tagIdx)) hinzu(tagIdx, typ);
  };

  return (
    <div data-test="plan-seite">
      <div style={{ background: T.karte, borderRadius: T.radius, padding: T.abstand, marginBottom: T.abstand }}>
        <h2 style={{ margin: "0 0 4px" }}>🗓️ Mein Wochenplan</h2>
        <p style={{ margin: "0 0 10px", color: T.textLeise, fontSize: "var(--schrift-klein)" }}>
          DU bestimmst dein Pensum! Tippe einen Baustein an und dann den Tag –
          oder zieh ihn einfach rüber. Eine Lernbox = {LERN_MINUTEN} Minuten, danach 5 Minuten
          Pause (Trampolin, essen, trinken – keine Bildschirme).
        </p>
        <DndContext sensors={sensoren} onDragEnd={ziehenEnde}>
          <div data-test="plan-palette" style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
            {BAUSTEINE.map((b) => (
              <PaletteBaustein key={b.typ} b={b} gewaehlt={wahl === b.typ} aufTipp={(typ) => setWahl(wahl === typ ? null : typ)} />
            ))}
          </div>
          {wahl && (
            <p data-test="plan-wahl-hinweis" style={{ margin: "0 0 8px", color: T.textLeise, fontSize: "var(--schrift-klein)" }}>
              👆 Und jetzt: Tipp auf den Tag, an dem „{bausteinInfo(wahl).name}“ stattfinden soll!
            </p>
          )}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "stretch", background: T.grund, borderRadius: T.radiusKlein, padding: 8 }}>
            {WOCHENTAGE.map((_, i) => (
              <TagSpalte key={i} idx={i} heuteIdx={heuteIdx}
                termine={termineJe[i]} bloecke={plan.bloecke.filter((b) => b.tag === i)}
                pruefung={pruefung} aufTipp={tagGetippt}
                aufWeg={(id) => speichern(blockWeg(plan, id), "Baustein entfernt")} />
            ))}
          </div>
        </DndContext>
        {pruefung.hinweise.length > 0 && (
          <div data-test="plan-hinweise" style={{ marginTop: 10, background: "var(--warn-weich, #ffe9b3)", color: "#5b4300", borderRadius: T.radiusKlein, padding: "8px 12px" }}>
            {pruefung.hinweise.map((h, i) => (
              <p key={i} style={{ margin: i ? "6px 0 0" : 0, fontSize: "var(--schrift-klein)", fontWeight: 600 }}>🦁 {h}</p>
            ))}
          </div>
        )}
        {pruefung.ok && plan.bloecke.length > 0 && (
          <p data-test="plan-ok" style={{ margin: "10px 0 0", color: T.ok, fontWeight: 700 }}>
            🦁 Starker Plan – gut verteilt und mit Zeit für dich! 💪
          </p>
        )}
      </div>
      <button data-test="plan-zurueck" onClick={() => navTo("start")}
        style={{ background: "transparent", color: T.textLeise, fontSize: "var(--schrift-klein)" }}>
        ← Zurück zur Startseite
      </button>
    </div>
  );
}
