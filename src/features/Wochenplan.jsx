import { useState } from "react";
import { DndContext, useDraggable, useDroppable, PointerSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import { useApp } from "../appContext.jsx";
import {
  WOCHENTAGE, BAUSTEINE, TERMIN_ARTEN, LERN_MINUTEN, tagesStunden, uhr, bausteinInfo,
  wochenMontag, tagDatum, planFuerWoche, leererPlan, blockHinzu, blockWeg, slotBelegt,
  termineDerWoche, planPruefung, wochenBilanz, festerTermin, SCHULE,
  kalenderWoche, routineAusPlan, routineAnwenden, schulZeilen, blockNotiz,
  istAusgefallen, ausfallSetzen, ausfallAufheben,
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
      {b.emoji} {b.name}{b.lern && b.box !== false ? ` · ${LERN_MINUTEN} Min` : ""}
    </button>
  );
}

/* Eine Stunde (14-19 Uhr) an einem Tag: leer = Ablagefläche (tippen
   oder hineinziehen), belegt = Baustein-Kärtchen mit ✖. */
function StundenSlot({ tagIdx, slot, block, fest, ausfall, wahlAktiv, aufTipp, aufWeg, aufEdit, aufFest, aufZurueck }) {
  const { T } = useApp();
  const { setNodeRef, isOver } = useDroppable({ id: `slot-${tagIdx}-${slot}`, disabled: !!fest });
  const info = block ? bausteinInfo(block.typ) : null;
  if (fest) {
    const fortsetzung = fest.beginn !== slot;
    return (
      <div data-test={`fest-${tagIdx}-${slot}`} onClick={() => aufFest(fest)} style={{
        cursor: "pointer",
        display: "flex", alignItems: "center", gap: 6, minHeight: 34, marginBottom: 3,
        borderRadius: 6, padding: "2px 6px", background: T.grund, color: T.text,
        border: `1.5px solid ${T.rand}`, borderTop: fortsetzung ? "none" : undefined,
        opacity: fortsetzung ? 0.8 : 1,
      }}>
        <span style={{ fontSize: "11px", fontWeight: 700, minWidth: 34, opacity: 0.7 }}>{uhr(slot)}</span>
        <span style={{ flex: 1, fontWeight: 700, fontSize: "var(--schrift-klein)" }}>
          {fortsetzung ? "↳" : <>{fest.emoji} {fest.name}</>}
          {!fortsetzung && fest.hinweis && <span style={{ fontWeight: 400, opacity: 0.75 }}> · {fest.hinweis}</span>}
        </span>
        {!fortsetzung && <span style={{ fontSize: 12, opacity: 0.6 }}>🔒</span>}
      </div>
    );
  }
  return (
    <div ref={setNodeRef} data-test={`slot-${tagIdx}-${slot}`}
      onClick={() => (block ? aufEdit(block) : aufTipp(tagIdx, slot))}
      style={{
        display: "flex", alignItems: "center", gap: 6, minHeight: 34, marginBottom: 3,
        borderRadius: 6, padding: "2px 6px",
        background: block ? (info.lern ? T.primaer : T.weich) : isOver || wahlAktiv ? T.weich : "transparent",
        color: block ? (info.lern ? T.primaerText : T.text) : T.textLeise,
        border: block ? "none" : `1.5px dashed ${isOver || wahlAktiv ? T.primaer : T.rand}`,
        cursor: "pointer",
        opacity: block?.fertig ? 0.65 : 1,
      }}>
      <span style={{ fontSize: "11px", fontWeight: 700, minWidth: 34, opacity: 0.8 }}>{uhr(slot)}</span>
      {block ? (
        <>
          <span data-test="plan-block" data-typ={block.typ} style={{
            flex: 1, fontWeight: 700, fontSize: "var(--schrift-klein)",
            textDecoration: block.fertig ? "line-through" : "none",
          }}>
            {block.fertig ? "✓ " : ""}{info.emoji} {info.name}
            {block.notiz && <span style={{ fontWeight: 400, opacity: 0.85 }}> · {block.notiz}</span>}
          </span>
          <button data-test="block-weg" onClick={(ev) => { ev.stopPropagation(); aufWeg(block.id); }}
            aria-label="Baustein entfernen"
            style={{ background: "transparent", color: "inherit", padding: 0, minHeight: 0, height: "auto", fontSize: 14 }}>
            ✖
          </button>
        </>
      ) : ausfall ? (
        <>
          <span style={{ flex: 1, fontSize: "11.5px" }}>
            frei · <s style={{ opacity: 0.8 }}>{ausfall.fest.emoji} {ausfall.fest.name} fällt aus</s>
          </span>
          {ausfall.istBeginn && (
            <button data-test="ausfall-zurueck" onClick={(ev) => { ev.stopPropagation(); aufZurueck(ausfall.fest); }}
              aria-label="Termin wieder einplanen" title="Doch nicht ausgefallen"
              style={{ background: "transparent", color: "inherit", padding: 0, minHeight: 0, height: "auto", fontSize: 14 }}>
              ↩️
            </button>
          )}
        </>
      ) : (
        <span style={{ fontSize: "11.5px" }}>frei</span>
      )}
    </div>
  );
}

function TagSpalte({ idx, heuteIdx, termine, bloecke, feste, ausfaelle, pruefung, wahlAktiv, schuleAuf, aufTipp, aufWeg, aufEdit, aufFest, aufZurueck }) {
  const { T } = useApp();
  const p = pruefung.tage[idx];
  const ampel = p.status === "voll" ? "🔴" : p.status === "einseitig" ? "🟡" : p.lern + p.frei > 0 ? "🟢" : "";
  const schule = SCHULE.tage.includes(idx);
  return (
    <div data-test={`tag-${idx}`} style={{
      flex: "1 1 160px", minWidth: 160, background: T.karte,
      borderRadius: T.radiusKlein, padding: 8,
      outline: idx === heuteIdx ? `2px solid ${T.primaer}` : "none",
    }}>
      <div style={{ fontWeight: 800 }}>
        {WOCHENTAGE[idx]}{idx === heuteIdx ? " · heute" : ""} <span data-test={`ampel-${idx}`}>{ampel}</span>
      </div>
      <div style={{ color: T.textLeise, fontSize: "11.5px", marginBottom: 4, minHeight: 15 }}>
        {schule ? `🏫 Schule ${SCHULE.jeTag?.[idx] || SCHULE.text}` : "🌞 schulfrei"}
      </div>
      {schule && schuleAuf && (
        <div data-test={`schule-${idx}`} style={{
          background: T.grund, borderRadius: 6, padding: "4px 6px", marginBottom: 4,
          fontSize: "11px", lineHeight: 1.5, color: T.textLeise,
        }}>
          {schulZeilen(idx).map((z, i) => (
            <div key={i} style={{ opacity: z.ag || z.pause ? 0.65 : 1, fontStyle: z.pause ? "italic" : "normal" }}>
              <b>{uhr(z.von)}–{uhr(z.bis)}</b> {z.fach}{z.ag ? " · freiwillig" : ""}
            </div>
          ))}
        </div>
      )}
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
      {tagesStunden(idx).map((s) => {
        const f = festerTermin(feste, idx, s);
        const weg = f && (ausfaelle || []).some((a) => a.tag === idx && a.beginn === f.beginn);
        return (
          <StundenSlot key={s} tagIdx={idx} slot={s} wahlAktiv={wahlAktiv}
            fest={weg ? null : f}
            ausfall={weg ? { fest: f, istBeginn: f.beginn === s } : null}
            block={bloecke.find((b) => b.slot === s)}
            aufTipp={aufTipp} aufWeg={aufWeg} aufEdit={aufEdit} aufFest={aufFest} aufZurueck={aufZurueck} />
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

  const [woche, setWoche] = useState("diese"); // Sonntags wird die NÄCHSTE Woche besprochen
  const [schuleAuf, setSchuleAuf] = useState(false); // 🏫 Vormittags-Stunden ein-/ausklappen
  const [editor, setEditor] = useState(null); // ✏️ Baustein-Notiz: { id, notiz }
  const [festDialog, setFestDialog] = useState(null); // ❌ Ausfall-Frage für einen festen Termin
  const montagAktiv = wochenMontag(heute);
  const aktiv = planFuerWoche(data.lernstand.wochenplan, montagAktiv);
  const naechsteW = woche === "naechste";
  const montag = naechsteW ? tagDatum(montagAktiv, 7) : montagAktiv;
  // Angezeigter Plan: aktive Woche ODER die Vorplanung der Folgewoche.
  const plan = naechsteW
    ? (aktiv.naechste?.montag === montag
      ? { montag, bloecke: aktiv.naechste.bloecke, belohnt: [], naechste: null, ausfaelle: aktiv.naechste.ausfaelle || [] }
      : leererPlan(montag))
    : aktiv;
  const heuteIdx = naechsteW ? -1 : WOCHENTAGE.findIndex((_, i) => tagDatum(montag, i) === heute);
  const feste = data.einstellungen.festeTermine;
  const routine = data.einstellungen.planRoutine;
  const termineJe = termineDerWoche(data.einstellungen.termine, montag);
  const pruefung = planPruefung(plan, data.einstellungen.termine, data.einstellungen.zeitLimit, feste);

  // Speichern: die aktive Woche direkt, die Folgewoche als „naechste“-Vorplanung.
  const speichern = (neuerPlan, text) => {
    const wochenplan = naechsteW
      ? { ...aktiv, naechste: { montag, bloecke: neuerPlan.bloecke, ausfaelle: neuerPlan.ausfaelle || [] } }
      : { ...neuerPlan, naechste: aktiv.naechste || null };
    logChange({ ...data, lernstand: { ...data.lernstand, wochenplan } }, "wochenplan", "geaendert", text);
  };
  const hinzu = (tagIdx, slot, typ) => {
    const neu = blockHinzu(plan, tagIdx, typ, slot);
    if (neu !== plan) {
      speichern(neu, `Baustein ${typ} am ${WOCHENTAGE[tagIdx]} um ${uhr(slot)} Uhr eingeplant`);
      // Freunde-Zeit lebt von der Verabredung: direkt fragen, mit wem.
      if (typ === "freunde") setEditor({ id: neu.bloecke[neu.bloecke.length - 1].id, notiz: "" });
    }
  };
  const slotGetippt = (tagIdx, slot) => {
    const f = festerTermin(feste, tagIdx, slot);
    if (f && !istAusgefallen(plan, tagIdx, f.beginn)) return; // feste Stunde ist tabu – außer sie fällt aus
    if (wahl && !slotBelegt(plan, tagIdx, slot)) { hinzu(tagIdx, slot, wahl); setWahl(null); }
  };
  const routineSpeichern = () => {
    logChange(
      { ...data, einstellungen: { ...data.einstellungen, planRoutine: routineAusPlan(plan) } },
      "wochenplan", "geaendert", "Wochen-Routine gespeichert (ohne Freunde-Zeit)",
    );
  };
  const routineHolen = () => {
    const neu = routineAnwenden(plan, routine);
    if (neu !== plan) speichern(neu, "Wochen-Routine in den Plan übernommen");
  };
  const ziehenEnde = ({ active, over }) => {
    if (!over) return;
    const typ = String(active.id).replace("baustein-", "");
    const [, tagIdx, slot] = String(over.id).split("-").map((x) => parseInt(x, 10) ?? x);
    if (Number.isInteger(tagIdx) && Number.isInteger(slot)) hinzu(tagIdx, slot, typ);
  };

  return (
    <div data-test="plan-seite">
      <div style={{ background: T.karte, borderRadius: T.radius, padding: T.abstand, marginBottom: T.abstand }}>
        <h2 style={{ margin: "0 0 4px" }}>
          🗓️ Mein Wochenplan{" "}
          <span data-test="plan-kw" style={{ fontSize: "var(--schrift-klein)", color: T.textLeise, fontWeight: 400 }}>
            KW {kalenderWoche(montag)} · {tagDatum(montag, 0).slice(8)}.{tagDatum(montag, 0).slice(5, 7)}. – {tagDatum(montag, 6).slice(8)}.{tagDatum(montag, 6).slice(5, 7)}.
          </span>
        </h2>
        <div style={{ display: "flex", gap: 6, margin: "6px 0 10px", flexWrap: "wrap" }}>
          <button data-test="woche-diese" onClick={() => { setWoche("diese"); setWahl(null); }}
            style={{ height: "auto", minHeight: 0, padding: "7px 12px", fontWeight: 700, background: !naechsteW ? T.primaer : T.weich, color: !naechsteW ? T.primaerText : T.text }}>
            Diese Woche
          </button>
          <button data-test="woche-naechste" onClick={() => { setWoche("naechste"); setWahl(null); }}
            style={{ height: "auto", minHeight: 0, padding: "7px 12px", fontWeight: 700, background: naechsteW ? T.primaer : T.weich, color: naechsteW ? T.primaerText : T.text }}>
            Nächste Woche planen
          </button>
          <button data-test="routine-uebernehmen" onClick={routineHolen} disabled={!routine.length}
            style={{ height: "auto", minHeight: 0, padding: "7px 12px", fontWeight: 700, background: T.weich, color: T.text, opacity: routine.length ? 1 : 0.5 }}>
            🔁 Routine übernehmen
          </button>
          <button data-test="routine-speichern" onClick={routineSpeichern} disabled={!plan.bloecke.some((b) => b.typ !== "freunde")}
            style={{ height: "auto", minHeight: 0, padding: "7px 12px", fontWeight: 700, background: T.weich, color: T.text }}>
            💾 Als Routine speichern
          </button>
          <button data-test="schule-zeigen" onClick={() => setSchuleAuf(!schuleAuf)}
            style={{ height: "auto", minHeight: 0, padding: "7px 12px", fontWeight: 700, background: schuleAuf ? T.primaer : T.weich, color: schuleAuf ? T.primaerText : T.text }}>
            🏫 Schulstunden
          </button>
        </div>
        <p style={{ margin: "0 0 10px", color: T.textLeise, fontSize: "var(--schrift-klein)" }}>
          DU bestimmst dein Pensum – wochentags ab <b>13 Uhr</b> (🎲 erst Spielzeit nach dem Essen),
          am Wochenende <b>ab 9 Uhr</b>. Tippe einen Baustein an und dann ein freies Fenster (je 30 Minuten),
          oder zieh ihn rüber. Eine Lernbox = {LERN_MINUTEN} Minuten, danach 5 Minuten Pause
          (Trampolin, essen, trinken – keine Bildschirme).
          {" "}🦁 Tipp: Sonntags besprecht ihr die nächste Woche – das Üben bleibt Routine,
          die Freunde-Zeit kommt je Verabredung neu dazu.
        </p>
        <DndContext sensors={sensoren} onDragEnd={ziehenEnde}>
          <div data-test="plan-palette" style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
            {BAUSTEINE.map((b) => (
              <PaletteBaustein key={b.typ} b={b} gewaehlt={wahl === b.typ} aufTipp={(typ) => setWahl(wahl === typ ? null : typ)} />
            ))}
          </div>
          {wahl && (
            <p data-test="plan-wahl-hinweis" style={{ margin: "0 0 8px", color: T.textLeise, fontSize: "var(--schrift-klein)" }}>
              👆 Und jetzt: Tipp auf eine freie Stunde, in der „{bausteinInfo(wahl).name}“ stattfinden soll!
            </p>
          )}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "stretch", background: T.grund, borderRadius: T.radiusKlein, padding: 8 }}>
            {WOCHENTAGE.map((_, i) => (
              <TagSpalte key={i} idx={i} heuteIdx={heuteIdx} wahlAktiv={!!wahl} feste={feste} schuleAuf={schuleAuf}
                aufEdit={(b) => setEditor({ id: b.id, notiz: b.notiz || "" })}
                ausfaelle={plan.ausfaelle}
                aufFest={(f) => setFestDialog(f)}
                aufZurueck={(f) => speichern(ausfallAufheben(plan, f.tag, f.beginn, f.dauer), `${f.name} ist doch wieder da`)}
                termine={termineJe[i]} bloecke={plan.bloecke.filter((b) => b.tag === i)}
                pruefung={pruefung} aufTipp={slotGetippt}
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
        {(() => {
          const b = wochenBilanz(plan);
          if (!b.fertig) return null;
          return (
            <p data-test="plan-bilanz" style={{ margin: "10px 0 0", fontWeight: 700 }}>
              ✅ Diese Woche schon <b>{b.fertig} von {b.gesamt}</b> Bausteinen geschafft
              {b.alles ? " – die GANZE Woche steht! 🎉🎉🎉" : ` (davon ${b.lernFertig} Lernboxen). Weiter so!`}
            </p>
          );
        })()}
      </div>
      {festDialog && (
        <div data-test="fest-dialog" onClick={() => setFestDialog(null)} style={{
          position: "fixed", inset: 0, zIndex: 900, background: "rgba(38, 50, 72, 0.94)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: 18,
        }}>
          <div onClick={(ev) => ev.stopPropagation()} style={{ maxWidth: 380, width: "100%", background: T.karte, borderRadius: T.radius, padding: T.abstand }}>
            <h3 style={{ margin: "0 0 2px" }}>{festDialog.emoji} {festDialog.name}</h3>
            <p style={{ margin: "0 0 10px", color: T.textLeise, fontSize: "var(--schrift-klein)" }}>
              {WOCHENTAGE[festDialog.tag]} · {uhr(festDialog.beginn)} Uhr · fester Termin
            </p>
            <p style={{ margin: "0 0 10px" }}>Fällt der Termin diese Woche aus? Das Fenster wird dann frei – nächste Woche ist er automatisch wieder da.</p>
            <button data-test="fest-ausfall"
              onClick={() => { speichern(ausfallSetzen(plan, festDialog.tag, festDialog.beginn), `${festDialog.name} fällt diese Woche aus`); setFestDialog(null); }}
              style={{ width: "100%", background: T.primaer, color: T.primaerText, fontWeight: 700 }}>
              ❌ Fällt diese Woche aus
            </button>
            <button data-test="fest-abbrechen" onClick={() => setFestDialog(null)}
              style={{ width: "100%", marginTop: 6, background: "transparent", color: T.textLeise }}>
              Abbrechen
            </button>
          </div>
        </div>
      )}

      {editor && (() => {
        const block = plan.bloecke.find((b) => b.id === editor.id);
        if (!block) return null;
        const info = bausteinInfo(block.typ);
        const zu = () => setEditor(null);
        return (
          <div data-test="block-editor" onClick={zu} style={{
            position: "fixed", inset: 0, zIndex: 900, background: "rgba(38, 50, 72, 0.94)",
            display: "flex", alignItems: "center", justifyContent: "center", padding: 18,
          }}>
            <div onClick={(ev) => ev.stopPropagation()} style={{ maxWidth: 380, width: "100%", background: T.karte, borderRadius: T.radius, padding: T.abstand }}>
              <h3 style={{ margin: "0 0 2px" }}>{info.emoji} {info.name}</h3>
              <p style={{ margin: "0 0 10px", color: T.textLeise, fontSize: "var(--schrift-klein)" }}>
                {WOCHENTAGE[block.tag]} · {uhr(block.slot)} Uhr
              </p>
              <input data-test="notiz-feld" type="text" maxLength={24} autoFocus
                value={editor.notiz} onChange={(e) => setEditor({ ...editor, notiz: e.target.value })}
                onKeyDown={(e) => { if (e.key === "Enter") { speichern(blockNotiz(plan, block.id, editor.notiz), "Baustein-Notiz geändert"); zu(); } }}
                placeholder={block.typ === "freunde" ? "Mit wem triffst du dich?" : "Notiz (z. B. was genau?)"}
                style={{ width: "100%", boxSizing: "border-box", minHeight: "var(--touch)", borderRadius: T.radiusKlein, border: `1px solid ${T.rand}`, padding: "0 12px", background: T.grund, color: T.text }} />
              <button data-test="notiz-ok"
                onClick={() => { speichern(blockNotiz(plan, block.id, editor.notiz), "Baustein-Notiz geändert"); zu(); }}
                style={{ width: "100%", marginTop: 10, background: T.primaer, color: T.primaerText, fontWeight: 700 }}>
                ✓ Speichern
              </button>
              <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                <button data-test="notiz-weg" onClick={() => { speichern(blockWeg(plan, block.id), "Baustein entfernt"); zu(); }}
                  style={{ flex: 1, background: T.weich, color: T.text, fontWeight: 700 }}>
                  🗑️ Baustein entfernen
                </button>
                <button data-test="notiz-abbrechen" onClick={zu}
                  style={{ flex: 1, background: "transparent", color: T.textLeise }}>
                  Abbrechen
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      <button data-test="plan-zurueck" onClick={() => navTo("start")}
        style={{ background: "transparent", color: T.textLeise, fontSize: "var(--schrift-klein)" }}>
        ← Zurück zur Startseite
      </button>
    </div>
  );
}
