import { Fragment, useState } from "react";
import { DndContext, useDraggable, useDroppable, PointerSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import { useApp } from "../appContext.jsx";
import {
  WOCHENTAGE, TERMIN_ARTEN, LERN_MINUTEN, tagesStunden, uhr, bausteinInfo,
  wochenMontag, tagDatum, planFuerWoche, blockHinzu, blockWeg, slotBelegt,
  termineDerWoche, planPruefung, wochenBilanz, festerTermin, SCHULE, auffrischungen,
  kalenderWoche, routineAusPlan, routineAnwenden, schulZeilen, blockNotiz,
  istAusgefallen, ausfallSetzen, ausfallAufheben, blockVerschieben, wocheKopieren,
  blockDauer, blockDauerVon, slotBelegt as slotBelegtCalc, planSchreiben, terminSerie,
  blockSerie, blockSerieEntfernen, blockTyp, bausteinListe, bausteinAnzeige,
} from "../calc/wochenplan.js";
import { schulfreiAm, ferienAm, monatsGitter, monatsName, monatSchritt, FERIEN_BW, SCHULJAHR } from "../calc/kalender.js";

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
      {b.emoji} {b.name}{(b.lern && b.box !== false) || b.kurz ? ` · ${LERN_MINUTEN} Min` : ""}
    </button>
  );
}

/* Eine Stunde (14-19 Uhr) an einem Tag: leer = Ablagefläche (tippen
   oder hineinziehen), belegt = Baustein-Kärtchen mit ✖. */
function StundenSlot({ tagIdx, slot, block, blockStart, fest, wahlAktiv, aufTipp, aufWeg, aufEdit, aufFest }) {
  const { T, data } = useApp();
  const { setNodeRef, isOver } = useDroppable({ id: `slot-${tagIdx}-${slot}`, disabled: !!fest });
  // Platzierte Bausteine sind selbst ziehbar (umplanen ohne Löschen).
  const zieh = useDraggable({ id: `block-${block?.id ?? `leer-${tagIdx}-${slot}`}`, disabled: !block || !blockStart });
  const info = block ? bausteinAnzeige(block.typ, data.einstellungen) : null;
  if (fest) {
    const fortsetzung = fest.beginn !== slot;
    return (
      <div data-test={`fest-${tagIdx}-${slot}`} onClick={() => aufFest(fest)} style={{
        cursor: "pointer",
        display: "flex", alignItems: "center", gap: 6, minHeight: 34, marginBottom: 3,
        borderRadius: 6, padding: "2px 6px", color: T.text,
        background: "color-mix(in srgb, var(--warn) 16%, var(--karte))",
        border: "1.5px solid color-mix(in srgb, var(--warn) 45%, var(--karte))",
        borderTop: fortsetzung ? "none" : undefined,
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
        background: block
          ? (info.lern ? T.primaer : T.weich)
          : isOver || wahlAktiv
            ? "color-mix(in srgb, var(--ok) 20%, var(--karte))"
            : "color-mix(in srgb, var(--ok) 7%, var(--karte))",
        color: block ? (info.lern ? T.primaerText : T.text) : "var(--ok)",
        border: block ? "none" : `1.5px dashed ${isOver || wahlAktiv ? "var(--ok)" : "color-mix(in srgb, var(--ok) 40%, var(--karte))"}`,
        cursor: "pointer",
        opacity: block?.fertig ? 0.65 : 1,
      }}>
      <span style={{ fontSize: "11px", fontWeight: 700, minWidth: 34, opacity: 0.8 }}>{uhr(slot)}</span>
      {block && !blockStart ? (
        <span data-test="plan-block-folge" style={{ flex: 1, fontWeight: 700, fontSize: "var(--schrift-klein)", opacity: 0.8 }}>↳</span>
      ) : block ? (
        <>
          <span data-test="plan-block" data-typ={block.typ}
            ref={zieh.setNodeRef} {...zieh.listeners} {...zieh.attributes}
            style={{
              flex: 1, fontWeight: 700, fontSize: "var(--schrift-klein)",
              textDecoration: block.fertig ? "line-through" : "none",
              touchAction: "none", position: "relative",
              opacity: zieh.isDragging ? 0.4 : 1, zIndex: zieh.isDragging ? 50 : undefined,
              transform: zieh.transform ? `translate(${zieh.transform.x}px, ${zieh.transform.y}px)` : undefined,
            }}>
            {block.fertig ? "✓ " : ""}{info.emoji} {block.typ === "eigen" ? (block.notiz || info.name) : info.name}
            {block.typ !== "eigen" && block.notiz && <span style={{ fontWeight: 400, opacity: 0.85 }}> · {block.notiz}</span>}
            {blockDauerVon(block) > 30 && <span style={{ fontWeight: 400, opacity: 0.85 }}> · bis {uhr(block.slot + blockDauerVon(block))}</span>}
          </span>
          <button data-test="block-weg" onClick={(ev) => { ev.stopPropagation(); aufWeg(block.id); }}
            aria-label="Baustein entfernen"
            style={{ background: "transparent", color: "inherit", padding: 0, minHeight: 0, height: "auto", fontSize: 14 }}>
            ✖
          </button>
        </>
      ) : (
        <span style={{ fontSize: "11.5px" }}>frei</span>
      )}
    </div>
  );
}

function TagSpalte({ idx, datum, heuteIdx, termine, bloecke, feste, ausfaelle, pruefung, wahlAktiv, schuleAuf, auffrischen, aufTipp, aufWeg, aufEdit, aufFest, aufTermin }) {
  const { T } = useApp();
  const p = pruefung.tage[idx];
  const ampel = p.status === "voll" ? "🔴" : p.status === "einseitig" || p.status === "reihenfolge" ? "🟡" : p.lern + p.frei > 0 ? "🟢" : "";
  const frei = schulfreiAm(datum);
  const schule = SCHULE.tage.includes(idx) && !frei;
  return (
    <div data-test={`tag-${idx}`} style={{
      flex: "1 1 160px", minWidth: 160, background: T.karte,
      borderRadius: T.radiusKlein, padding: 8,
      outline: idx === heuteIdx ? `2px solid ${T.primaer}` : "none",
    }}>
      <div style={{ fontWeight: 800 }}>
        {WOCHENTAGE[idx]} {datum.slice(8)}.{datum.slice(5, 7)}.{idx === heuteIdx ? " · heute" : ""} <span data-test={`ampel-${idx}`}>{ampel}</span>
      </div>
      <div style={{ color: T.textLeise, fontSize: "11.5px", marginBottom: 4, minHeight: 15 }}>
        {frei ? `${frei.emoji} ${frei.name}` : schule ? `🏫 Schule ${SCHULE.jeTag?.[idx] || SCHULE.text}` : "🌞 schulfrei"}
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
      {auffrischen.map((a) => (
        <div key={`auf-${a.id}`} data-test={`auffrischung-${idx}`} style={{
          background: "color-mix(in srgb, var(--akzent) 30%, var(--karte))",
          borderRadius: 6, padding: "3px 6px", fontSize: "12px", fontWeight: 700, marginBottom: 4,
        }}>
          🌅 {schule ? "Vor der Schule" : "Morgens"}: {a.emoji} {a.text}
        </div>
      ))}
      {termine.map((t) => {
        const art = TERMIN_ARTEN[t.art];
        return (
          <div key={t.id} data-test="termin-chip" onClick={() => aufTermin(t)} style={{
            background: "var(--warn-weich, #ffe9b3)", color: "#5b4300", borderRadius: 6,
            padding: "3px 6px", fontSize: "12.5px", fontWeight: 700, marginBottom: 4, cursor: "pointer",
          }}>
            {art.emoji} {art.name}{t.fach ? ` ${t.fach}` : ""}
          </div>
        );
      })}
      {tagesStunden(idx, datum).map((s) => {
        const f = festerTermin(feste, idx, s);
        const weg = f && (ausfaelle || []).some((a) => a.tag === idx && a.beginn === f.beginn);
        const block = bloecke.find((b) => s >= b.slot && s < b.slot + blockDauerVon(b));
        return (
          <StundenSlot key={s} tagIdx={idx} slot={s} wahlAktiv={wahlAktiv}
            fest={weg ? null : f}
            block={block} blockStart={!!block && block.slot === s}
            aufTipp={aufTipp} aufWeg={aufWeg} aufEdit={aufEdit} aufFest={aufFest} />
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

/* 🗓️ Monatsblatt: Schuljahres-Überblick wie im Online-Kalender –
   Ferien farbig, Feiertage markiert, Termine als Emoji, Bausteine als
   Zähler. Ein Tipp auf einen Tag springt in dessen Wochenplan. */
function MonatsBlatt({ monat, setMonat, termine, wochenplanDoc, heute, oeffneWoche }) {
  const { T } = useApp();
  const gitter = monatsGitter(monat.jahr, monat.monat);
  const imMonat = (d) => d.slice(5, 7) === String(monat.monat).padStart(2, "0");
  return (
    <div data-test="kalender-monat">
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <button data-test="monat-zurueck" aria-label="Monat zurück"
          onClick={() => setMonat(monatSchritt(monat.jahr, monat.monat, -1))}
          style={{ height: "auto", minHeight: 0, padding: "7px 12px", fontWeight: 700, background: T.weich, color: T.text }}>◀</button>
        <b data-test="monat-titel" style={{ flex: 1, textAlign: "center", fontSize: "var(--schrift-gross)" }}>
          {monatsName(monat.jahr, monat.monat)}
        </b>
        <button data-test="monat-vor" aria-label="Monat vor"
          onClick={() => setMonat(monatSchritt(monat.jahr, monat.monat, 1))}
          style={{ height: "auto", minHeight: 0, padding: "7px 12px", fontWeight: 700, background: T.weich, color: T.text }}>▶</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "34px repeat(7, 1fr)", gap: 4 }}>
        <span />
        {WOCHENTAGE.map((w) => (
          <b key={w} style={{ textAlign: "center", fontSize: "var(--schrift-klein)", color: T.textLeise }}>{w}</b>
        ))}
        {gitter.map((woche) => (
          <Fragment key={woche.montag}>
            <button onClick={() => oeffneWoche(woche.montag)} title="Diese Woche öffnen"
              style={{ height: "auto", minHeight: 0, padding: 0, background: "transparent", color: T.textLeise, fontSize: "11.5px", fontWeight: 700 }}>
              KW{kalenderWoche(woche.montag)}
            </button>
            {woche.tage.map((d) => {
              const frei = schulfreiAm(d);
              const tagTermine = termine.filter((t) => t.tag === d);
              const bloecke = planFuerWoche(wochenplanDoc, woche.montag).bloecke
                .filter((b) => tagDatum(woche.montag, b.tag) === d).length;
              return (
                <button key={d} data-test={`mt-${d}`} onClick={() => oeffneWoche(woche.montag)}
                  style={{
                    height: "auto", minHeight: 52, padding: "3px 4px", borderRadius: 8, textAlign: "left",
                    background: frei?.art === "ferien" ? "color-mix(in srgb, var(--akzent) 32%, var(--karte))"
                      : frei ? "color-mix(in srgb, var(--akzent) 16%, var(--karte))" : T.weich,
                    color: T.text, opacity: imMonat(d) ? 1 : 0.4,
                    outline: d === heute ? `2px solid ${T.primaer}` : "none",
                  }}>
                  <span style={{ fontWeight: 800, fontSize: "var(--schrift-klein)" }}>{parseInt(d.slice(8), 10)}</span>
                  <span style={{ display: "block", fontSize: "11px", lineHeight: 1.3 }}>
                    {frei ? `${frei.emoji}` : ""}
                    {tagTermine.map((t) => TERMIN_ARTEN[t.art]?.emoji || "📅").join("")}
                    {bloecke > 0 ? ` •${bloecke}` : ""}
                  </span>
                </button>
              );
            })}
          </Fragment>
        ))}
      </div>
      <p data-test="kalender-ferien" style={{ margin: "10px 0 0", color: T.textLeise, fontSize: "12.5px" }}>
        Schuljahr {SCHULJAHR.name} (BW): {FERIEN_BW.map((f) => `${f.emoji} ${f.name} ${f.von.slice(8)}.${f.von.slice(5, 7)}.–${f.bis.slice(8)}.${f.bis.slice(5, 7)}.`).join(" · ")}
        {" "}· 🎉 Ferien- und Feiertage sind ganztags planbar; bewegliche Ferientage trägt die Familie selbst ein.
      </p>
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

  // 🗓️ Frei durchs Schuljahr blättern: jede Woche hat ihren eigenen Plan.
  const [montagAnzeige, setMontagAnzeige] = useState(() => wochenMontag(heute));
  const [ansicht, setAnsicht] = useState("woche"); // "woche" | "monat"
  const [monat, setMonat] = useState(() => ({ jahr: parseInt(heute.slice(0, 4), 10), monat: parseInt(heute.slice(5, 7), 10) }));
  const [schuleAuf, setSchuleAuf] = useState(false); // 🏫 Vormittags-Stunden ein-/ausklappen
  const [editor, setEditor] = useState(null); // ✏️ Baustein-Notiz: { id, notiz }
  const [festDialog, setFestDialog] = useState(null); // ❌ Ausfall-Frage für einen festen Termin
  const [verschieben, setVerschieben] = useState(null); // 📍 Baustein-Id, die ein neues Fenster sucht
  const [kindTermin, setKindTermin] = useState(null); // 📝 Eingabe: { art, fach, tag, serie }
  const [fenster, setFenster] = useState(null); // 🪟 Direkt-Wahl fürs Fenster: { tag, slot, suche }
  const [terminDialog, setTerminDialog] = useState(null); // eingetragenen Termin ansehen/entfernen
  const [palette, setPalette] = useState(false); // 📝 Kategorien erst nach „Termin eintragen" zeigen
  const [katSuche, setKatSuche] = useState(""); // 🔍 Suche/Freitext in der Kategorien-Auswahl
  const montagAktiv = wochenMontag(heute);
  const montag = montagAnzeige;
  const plan = planFuerWoche(data.lernstand.wochenplan, montag);
  const heuteIdx = montag === montagAktiv ? WOCHENTAGE.findIndex((_, i) => tagDatum(montag, i) === heute) : -1;
  const feste = data.einstellungen.festeTermine;
  const routine = data.einstellungen.planRoutine;
  const termineJe = termineDerWoche(data.einstellungen.termine, montag);
  const pruefung = planPruefung(plan, data.einstellungen.termine, data.einstellungen.zeitLimit, feste);

  // Speichern: die angezeigte Woche landet im Mehr-Wochen-Dokument.
  const speichern = (neuerPlan, text) => {
    const wochenplan = planSchreiben(data.lernstand.wochenplan, neuerPlan);
    logChange({ ...data, lernstand: { ...data.lernstand, wochenplan } }, "wochenplan", "geaendert", text);
  };
  // `was` ist ein Baustein-Typ – oder { typ: "eigen", notiz } für Freitext/eigene Kategorien.
  const hinzu = (tagIdx, slot, was) => {
    const typ = typeof was === "string" ? was : was.typ;
    let neu = blockHinzu(plan, tagIdx, typ, slot);
    if (neu !== plan) {
      const id = neu.bloecke[neu.bloecke.length - 1].id;
      if (typeof was !== "string" && was.notiz) neu = blockNotiz(neu, id, was.notiz);
      speichern(neu, `Baustein ${typ} am ${WOCHENTAGE[tagIdx]} um ${uhr(slot)} Uhr eingeplant`);
      // Freunde-Zeit lebt von der Verabredung, Sport von der Sportart: direkt fragen.
      if (typ === "freunde" || typ === "sport") setEditor({ id, notiz: "" });
    }
  };
  const slotGetippt = (tagIdx, slot) => {
    const f = festerTermin(feste, tagIdx, slot);
    if (f && !istAusgefallen(plan, tagIdx, f.beginn)) return; // feste Stunde ist tabu – außer sie fällt aus
    if (verschieben) {
      const neu = blockVerschieben(plan, verschieben, tagIdx, slot);
      if (neu !== plan) { speichern(neu, "Baustein verschoben"); setVerschieben(null); }
      return;
    }
    if (wahl && !slotBelegt(plan, tagIdx, slot)) { hinzu(tagIdx, slot, wahl); setWahl(null); return; }
    if (!wahl && !slotBelegt(plan, tagIdx, slot)) setFenster({ tag: tagIdx, slot, suche: "" });
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
    const [, tagIdx, slot] = String(over.id).split("-").map((x) => parseInt(x, 10));
    if (!Number.isInteger(tagIdx) || !Number.isInteger(slot)) return;
    const aktivId = String(active.id);
    if (aktivId.startsWith("baustein-")) {
      hinzu(tagIdx, slot, aktivId.replace("baustein-", ""));
    } else if (aktivId.startsWith("block-")) {
      const id = parseInt(aktivId.replace("block-", ""), 10);
      const neu = blockVerschieben(plan, id, tagIdx, slot);
      if (neu !== plan) speichern(neu, "Baustein verschoben");
    }
  };

  return (
    <div data-test="plan-seite">
      <div style={{ background: T.karte, borderRadius: T.radius, padding: T.abstand, marginBottom: T.abstand }}>
        <h2 style={{ margin: "0 0 4px" }}>
          🗓️ Mein Wochenplan{" "}
          <span data-test="plan-kw" style={{ fontSize: "var(--schrift-klein)", color: T.textLeise, fontWeight: 400 }}>
            KW {kalenderWoche(montag)} · {tagDatum(montag, 0).slice(8)}.{tagDatum(montag, 0).slice(5, 7)}. – {tagDatum(montag, 6).slice(8)}.{tagDatum(montag, 6).slice(5, 7)}.{tagDatum(montag, 0).slice(0, 4) !== heute.slice(0, 4) ? `${tagDatum(montag, 0).slice(0, 4)}` : ""}
            {ferienAm(tagDatum(montag, 2)) ? ` · ${ferienAm(tagDatum(montag, 2)).emoji} ${ferienAm(tagDatum(montag, 2)).name}` : ""}
          </span>
        </h2>
        <div style={{ display: "flex", gap: 6, margin: "6px 0 10px", flexWrap: "wrap" }}>
          {ansicht === "woche" && (
            <button data-test="woche-zurueck" aria-label="Woche zurück"
              onClick={() => { setMontagAnzeige(tagDatum(montag, -7)); setWahl(null); }}
              style={{ height: "auto", minHeight: 0, padding: "7px 12px", fontWeight: 700, background: T.weich, color: T.text }}>
              ◀
            </button>
          )}
          <button data-test="woche-diese"
            onClick={() => {
              // „Heute" springt IMMER zurück: Woche UND Monatsblatt auf jetzt.
              setMontagAnzeige(montagAktiv);
              setMonat({ jahr: parseInt(heute.slice(0, 4), 10), monat: parseInt(heute.slice(5, 7), 10) });
              setWahl(null);
            }}
            style={{ height: "auto", minHeight: 0, padding: "7px 12px", fontWeight: 700, background: montag === montagAktiv ? T.primaer : T.weich, color: montag === montagAktiv ? T.primaerText : T.text }}>
            Heute
          </button>
          {ansicht === "woche" && (
            <button data-test="woche-naechste" aria-label="Woche vor"
              onClick={() => { setMontagAnzeige(tagDatum(montag, 7)); setWahl(null); }}
              style={{ height: "auto", minHeight: 0, padding: "7px 12px", fontWeight: 700, background: T.weich, color: T.text }}>
              ▶
            </button>
          )}
          <button data-test="ansicht-monat"
            onClick={() => {
              // Beim Öffnen zeigt das Monatsblatt den Monat der angezeigten Woche.
              if (ansicht !== "monat") setMonat({ jahr: parseInt(montag.slice(0, 4), 10), monat: parseInt(montag.slice(5, 7), 10) });
              setAnsicht(ansicht === "monat" ? "woche" : "monat");
              setWahl(null);
            }}
            style={{ height: "auto", minHeight: 0, padding: "7px 12px", fontWeight: 700, background: ansicht === "monat" ? T.primaer : T.weich, color: ansicht === "monat" ? T.primaerText : T.text }}>
            🗓️ {ansicht === "monat" ? "Zur Woche" : "Monat"}
          </button>
          <button data-test="routine-uebernehmen" onClick={routineHolen} disabled={!routine.length}
            style={{ height: "auto", minHeight: 0, padding: "7px 12px", fontWeight: 700, background: T.weich, color: T.text, opacity: routine.length ? 1 : 0.5 }}>
            🔁 Routine übernehmen
          </button>
          <button data-test="routine-speichern" onClick={routineSpeichern} disabled={!plan.bloecke.some((b) => b.typ !== "freunde")}
            style={{ height: "auto", minHeight: 0, padding: "7px 12px", fontWeight: 700, background: T.weich, color: T.text }}>
            💾 Als Routine speichern
          </button>
          {plan.bloecke.length > 0 && (
            <button data-test="plan-kopieren"
              onClick={() => {
                const zielMontag = tagDatum(montag, 7);
                const ziel = planFuerWoche(data.lernstand.wochenplan, zielMontag);
                const neu = wocheKopieren(ziel, plan);
                speichern(neu, "Woche als Vorlage in die Folgewoche kopiert");
                setMontagAnzeige(zielMontag);
              }}
              style={{ height: "auto", minHeight: 0, padding: "7px 12px", fontWeight: 700, background: T.weich, color: T.text }}>
              ➡️ Für nächste Woche übernehmen
            </button>
          )}
          <button data-test="kind-termin" onClick={() => { setPalette(true); setKatSuche(""); }}
            style={{ height: "auto", minHeight: 0, padding: "7px 12px", fontWeight: 700, background: palette ? T.primaer : T.weich, color: palette ? T.primaerText : T.text }}>
            📝 Termin eintragen
          </button>
          <button data-test="schule-zeigen" onClick={() => setSchuleAuf(!schuleAuf)}
            style={{ height: "auto", minHeight: 0, padding: "7px 12px", fontWeight: 700, background: schuleAuf ? T.primaer : T.weich, color: schuleAuf ? T.primaerText : T.text }}>
            🏫 Schulstunden
          </button>
        </div>
        {ansicht === "monat" ? (
          <MonatsBlatt monat={monat} setMonat={setMonat} termine={data.einstellungen.termine}
            wochenplanDoc={data.lernstand.wochenplan} heute={heute}
            oeffneWoche={(m) => { setMontagAnzeige(m); setAnsicht("woche"); }} />
        ) : (<>
        <p style={{ margin: "0 0 10px", color: T.textLeise, fontSize: "var(--schrift-klein)" }}>
          DU bestimmst dein Pensum – wochentags ab <b>13 Uhr</b> (🎲 erst Spielzeit nach dem Essen),
          am Wochenende <b>ab 9 Uhr</b>. Tippe ein freies Fenster direkt an (Auswahl mit Suche + eigener Text) – oder hol dir über „📝 Termin eintragen“ eine Kategorie
          und tippe dann ein Fenster (je 30 Minuten), oder zieh sie rüber. Eine Lernbox = {LERN_MINUTEN} Minuten, danach 5 Minuten Pause
          (Trampolin, essen, trinken – keine Bildschirme).
          {" "}🦁 Tipp: Sonntags besprecht ihr die nächste Woche – das Üben bleibt Routine,
          die Freunde-Zeit kommt je Verabredung neu dazu.
        </p>
        <DndContext sensors={sensoren} onDragEnd={ziehenEnde}>
          {palette && (() => {
            const suche = katSuche.trim().toLowerCase();
            const kats = bausteinListe(data.einstellungen).filter((b) => !suche || b.name.toLowerCase().includes(suche));
            const eigene = (data.einstellungen.bausteine?.eigene || []).filter((k) => !suche || k.name.toLowerCase().includes(suche));
            return (
              <div data-test="plan-palette" style={{ background: T.grund, borderRadius: T.radiusKlein, padding: 10, marginBottom: 10 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
                  <input data-test="kat-suche" type="text" maxLength={24} placeholder="Suchen oder frei eintragen …"
                    value={katSuche} onChange={(e) => setKatSuche(e.target.value)}
                    style={{ flex: 1, boxSizing: "border-box", minHeight: "var(--touch)", borderRadius: T.radiusKlein, border: `1px solid ${T.rand}`, padding: "0 12px", background: T.karte, color: T.text }} />
                  <button data-test="kat-zu" aria-label="Auswahl schließen" onClick={() => { setPalette(false); setKatSuche(""); }}
                    style={{ background: "transparent", color: T.textLeise, padding: "0 6px", minHeight: 0, height: "auto", fontSize: 18 }}>
                    ✖
                  </button>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {kats.map((b) => (
                    <PaletteBaustein key={b.typ} b={b} gewaehlt={wahl === b.typ}
                      aufTipp={(typ) => { setWahl(wahl === typ ? null : typ); setPalette(false); setKatSuche(""); }} />
                  ))}
                  {eigene.map((k) => (
                    <button key={k.id} data-test={`kat-eigen-${k.id}`}
                      onClick={() => { setWahl({ typ: "eigen", notiz: k.name }); setPalette(false); setKatSuche(""); }}
                      style={{ height: "auto", minHeight: "var(--touch)", padding: "6px 10px", background: T.weich, color: T.text, fontWeight: 700 }}>
                      {k.emoji} {k.name}
                    </button>
                  ))}
                  {katSuche.trim() && (
                    <button data-test="kat-frei"
                      onClick={() => { setWahl({ typ: "eigen", notiz: katSuche.trim() }); setPalette(false); setKatSuche(""); }}
                      style={{ height: "auto", minHeight: "var(--touch)", padding: "6px 10px", background: T.primaer, color: T.primaerText, fontWeight: 700 }}>
                      ⭐ „{katSuche.trim()}“ eintragen
                    </button>
                  )}
                </div>
                <button data-test="kat-termin"
                  onClick={() => { setPalette(false); setKatSuche(""); setKindTermin({ art: "ka", fach: "", tag: null, serie: "nein" }); }}
                  style={{ width: "100%", marginTop: 8, height: "auto", minHeight: "var(--touch)", background: T.weich, color: T.text, fontWeight: 700 }}>
                  📝 Klassenarbeit, Kompass-Test oder Wörter der Woche eintragen
                </button>
              </div>
            );
          })()}
          {verschieben && (
            <p data-test="verschieb-hinweis" style={{ margin: "0 0 8px", color: T.textLeise, fontSize: "var(--schrift-klein)" }}>
              📍 Tipp auf ein freies Fenster – dahin wandert der Baustein.{" "}
              <button data-test="verschieb-abbrechen" onClick={() => setVerschieben(null)}
                style={{ background: "transparent", color: T.textLeise, padding: 0, minHeight: 0, height: "auto", textDecoration: "underline" }}>
                Abbrechen
              </button>
            </p>
          )}
          {wahl && (
            <p data-test="plan-wahl-hinweis" style={{ margin: "0 0 8px", color: T.textLeise, fontSize: "var(--schrift-klein)" }}>
              👆 Und jetzt: Tipp auf eine freie Stunde, in der „{typeof wahl === "string" ? bausteinAnzeige(wahl, data.einstellungen).name : wahl.notiz}“ stattfinden soll!
            </p>
          )}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "stretch", background: T.grund, borderRadius: T.radiusKlein, padding: 8 }}>
            {WOCHENTAGE.map((_, i) => (
              <TagSpalte key={i} idx={i} datum={tagDatum(montag, i)} heuteIdx={heuteIdx} wahlAktiv={!!wahl} feste={feste} schuleAuf={schuleAuf}
                aufEdit={(b) => setEditor({ id: b.id, notiz: b.notiz || "" })}
                ausfaelle={plan.ausfaelle}
                aufFest={(f) => setFestDialog(f)}
                aufTermin={(t) => setTerminDialog(t)}
                auffrischen={auffrischungen(data.einstellungen.termine, montag, i)}
                aufZurueck={(f) => speichern(ausfallAufheben(plan, f.tag, f.beginn, f.dauer), `${f.name} ist doch wieder da`)}
                termine={termineJe[i]} bloecke={plan.bloecke.filter((b) => b.tag === i)}
                pruefung={pruefung} aufTipp={slotGetippt}
                aufWeg={(id) => speichern(blockWeg(plan, id), "Baustein entfernt")} />
            ))}
          </div>
        </DndContext>
        {(plan.ausfaelle || []).length > 0 && (
          <div data-test="ausfall-liste" style={{ marginTop: 10, background: "color-mix(in srgb, var(--warn) 10%, var(--karte))", borderRadius: T.radiusKlein, padding: "8px 12px" }}>
            <b style={{ fontSize: "var(--schrift-klein)" }}>Diese Woche fällt aus:</b>
            {plan.ausfaelle.map((a, i) => {
              const f = festerTermin(feste, a.tag, a.beginn);
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4, fontSize: "var(--schrift-klein)" }}>
                  <span style={{ flex: 1 }}>
                    <s>{f ? `${f.emoji} ${f.name}` : "Termin"}</s> · {WOCHENTAGE[a.tag]} {uhr(a.beginn)} Uhr
                  </span>
                  {f && (
                    <button data-test="ausfall-zurueck"
                      onClick={() => speichern(ausfallAufheben(plan, f.tag, f.beginn, f.dauer), `${f.name} ist doch wieder da`)}
                      style={{ background: "transparent", color: T.text, padding: 0, minHeight: 0, height: "auto" }}>
                      ↩️ doch wieder da
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
        <p data-test="plan-legende" style={{ margin: "8px 0 0", color: T.textLeise, fontSize: "12.5px" }}>
          <span style={{ background: "color-mix(in srgb, var(--ok) 7%, var(--karte))", border: "1.5px dashed color-mix(in srgb, var(--ok) 40%, var(--karte))", borderRadius: 4, padding: "1px 7px", color: "var(--ok)" }}>frei</span>
          {" "}· <span style={{ background: "color-mix(in srgb, var(--warn) 16%, var(--karte))", border: "1.5px solid color-mix(in srgb, var(--warn) 45%, var(--karte))", borderRadius: 4, padding: "1px 7px" }}>🔒 blockiert</span>
          {" "}· <span style={{ background: T.primaer, color: T.primaerText, borderRadius: 4, padding: "1px 7px" }}>Lernbox</span>
          {" "}· <span style={{ background: T.weich, borderRadius: 4, padding: "1px 7px" }}>Freizeit</span>
        </p>
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
        </>)}
      </div>
      {fenster && (() => {
        const suche = fenster.suche.trim().toLowerCase();
        const treffer = bausteinListe(data.einstellungen).filter((b) => !suche || b.name.toLowerCase().includes(suche));
        const eigeneKat = (data.einstellungen.bausteine?.eigene || []).filter((k) => !suche || k.name.toLowerCase().includes(suche));
        const zu = () => setFenster(null);
        // 🔄 Wechsel-Modus: ein bestehender Baustein wird in einen anderen Typ geändert
        // (Fenster, Dauer, Notiz und Haken bleiben erhalten).
        const wechseln = (typ) => {
          const neu = blockTyp(plan, fenster.wechselId, typ);
          speichern(neu, `Baustein in ${bausteinInfo(typ).name} geändert`);
          zu();
          if (typ === "freunde" || typ === "sport") {
            const b = neu.bloecke.find((x) => x.id === fenster.wechselId);
            setEditor({ id: fenster.wechselId, notiz: b?.notiz || "" });
          }
        };
        const eigenesEintragen = () => {
          const text = fenster.suche.trim();
          if (!text) return;
          if (fenster.wechselId != null) {
            speichern(blockNotiz(blockTyp(plan, fenster.wechselId, "eigen"), fenster.wechselId, text), `Baustein in „${text}“ geändert`);
            zu();
            return;
          }
          let neu = blockHinzu(plan, fenster.tag, "eigen", fenster.slot);
          if (neu !== plan) {
            neu = blockNotiz(neu, neu.bloecke[neu.bloecke.length - 1].id, text);
            speichern(neu, `„${text}“ eingeplant`);
          }
          zu();
        };
        return (
          <div data-test="fenster-dialog" onClick={zu} style={{
            position: "fixed", inset: 0, zIndex: 900, background: "rgba(38, 50, 72, 0.94)",
            display: "flex", alignItems: "center", justifyContent: "center", padding: 18,
          }}>
            <div onClick={(ev) => ev.stopPropagation()} style={{ maxWidth: 420, width: "100%", background: T.karte, borderRadius: T.radius, padding: T.abstand }}>
              <h3 style={{ margin: "0 0 2px" }}>
                {fenster.wechselId != null ? "🔄" : "🪟"} {WOCHENTAGE[fenster.tag]} · {uhr(fenster.slot)} Uhr{fenster.wechselId != null ? " – ändern in …" : ""}
              </h3>
              <p style={{ margin: "0 0 8px", color: T.textLeise, fontSize: "var(--schrift-klein)" }}>
                {fenster.wechselId != null
                  ? "Was soll hier stattdessen stehen? Zeit, Dauer und Notiz bleiben."
                  : "Was soll hier stattfinden? Suchen, antippen – oder einfach frei tippen."}
              </p>
              <input data-test="fenster-suche" type="text" maxLength={24} autoFocus
                value={fenster.suche} onChange={(e) => setFenster({ ...fenster, suche: e.target.value })}
                onKeyDown={(e) => { if (e.key === "Enter" && fenster.suche.trim()) eigenesEintragen(); }}
                placeholder="Suchen oder frei eintragen …"
                style={{ width: "100%", boxSizing: "border-box", minHeight: "var(--touch)", borderRadius: T.radiusKlein, border: `1px solid ${T.rand}`, padding: "0 12px", background: T.grund, color: T.text }} />
              <div style={{ display: "grid", gap: 6, marginTop: 8, maxHeight: "44vh", overflowY: "auto" }}>
                {treffer.map((b) => (
                  <button key={b.typ} data-test={`fenster-wahl-${b.typ}`}
                    onClick={() => { if (fenster.wechselId != null) { wechseln(b.typ); } else { hinzu(fenster.tag, fenster.slot, b.typ); zu(); } }}
                    style={{ textAlign: "left", height: "auto", minHeight: "var(--touch)", padding: "8px 12px", fontWeight: 700, background: T.weich, color: T.text }}>
                    {b.emoji} {b.name}{(b.lern && b.box !== false) || b.kurz ? ` · ${LERN_MINUTEN} Min` : ""}
                  </button>
                ))}
                {eigeneKat.map((k) => (
                  <button key={`eigen-${k.id}`} data-test={`fenster-eigen-${k.id}`}
                    onClick={() => {
                      if (fenster.wechselId != null) {
                        speichern(blockNotiz(blockTyp(plan, fenster.wechselId, "eigen"), fenster.wechselId, k.name), `Baustein in „${k.name}“ geändert`);
                      } else {
                        hinzu(fenster.tag, fenster.slot, { typ: "eigen", notiz: k.name });
                      }
                      zu();
                    }}
                    style={{ textAlign: "left", height: "auto", minHeight: "var(--touch)", padding: "8px 12px", fontWeight: 700, background: T.weich, color: T.text }}>
                    {k.emoji} {k.name}
                  </button>
                ))}
                {fenster.suche.trim() && (
                  <button data-test="fenster-frei" onClick={eigenesEintragen}
                    style={{ textAlign: "left", height: "auto", minHeight: "var(--touch)", padding: "8px 12px", fontWeight: 700, background: T.primaer, color: T.primaerText }}>
                    ⭐ „{fenster.suche.trim()}“ {fenster.wechselId != null ? "daraus machen" : "eintragen"}
                  </button>
                )}
              </div>
              <button onClick={zu} style={{ width: "100%", marginTop: 8, background: "transparent", color: T.textLeise }}>
                Abbrechen
              </button>
            </div>
          </div>
        );
      })()}

      {kindTermin && (
        <div data-test="kind-termin-dialog" onClick={() => setKindTermin(null)} style={{
          position: "fixed", inset: 0, zIndex: 900, background: "rgba(38, 50, 72, 0.94)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: 18,
        }}>
          <div onClick={(ev) => ev.stopPropagation()} style={{ maxWidth: 420, width: "100%", background: T.karte, borderRadius: T.radius, padding: T.abstand }}>
            <h3 style={{ margin: "0 0 8px" }}>{kindTermin.editId != null ? "✏️ Termin bearbeiten" : "📝 Termin eintragen"}</h3>
            <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
              {Object.entries(TERMIN_ARTEN).map(([k, art]) => (
                <button key={k} data-test={`kt-art-${k}`} onClick={() => setKindTermin({ ...kindTermin, art: k })}
                  style={{ flex: 1, height: "auto", minHeight: 0, padding: "8px 4px", fontWeight: 700, fontSize: "var(--schrift-klein)",
                    background: kindTermin.art === k ? T.primaer : T.weich, color: kindTermin.art === k ? T.primaerText : T.text }}>
                  {art.emoji} {art.name}
                </button>
              ))}
            </div>
            <p style={{ margin: "0 0 4px", fontSize: "var(--schrift-klein)", color: T.textLeise }}>An welchem Tag? (Woche vom {plan.montag.split("-").reverse().join(".")})</p>
            <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
              {WOCHENTAGE.map((w, i) => (
                <button key={i} data-test={`kt-tag-${i}`} onClick={() => setKindTermin({ ...kindTermin, tag: i })}
                  style={{ flex: 1, height: "auto", minHeight: 0, padding: "8px 2px", fontWeight: 700,
                    background: kindTermin.tag === i ? T.primaer : T.weich, color: kindTermin.tag === i ? T.primaerText : T.text }}>
                  {w}<span style={{ display: "block", fontSize: "11px", fontWeight: 400 }}>{tagDatum(plan.montag, i).slice(8)}.</span>
                </button>
              ))}
            </div>
            {kindTermin.editId == null ? (
              <>
                <p style={{ margin: "0 0 4px", fontSize: "var(--schrift-klein)", color: T.textLeise }}>🔁 Wiederholen?</p>
                <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
                  {[["nein", "einmalig"], ["4", "4 Wochen"], ["12", "12 Wochen"], ["schuljahr", "ganzes Schuljahr"]].map(([k, label]) => (
                    <button key={k} data-test={`kt-serie-${k}`} onClick={() => setKindTermin({ ...kindTermin, serie: k })}
                      style={{ flex: 1, height: "auto", minHeight: 0, padding: "8px 2px", fontWeight: 700, fontSize: "12.5px",
                        background: kindTermin.serie === k ? T.primaer : T.weich, color: kindTermin.serie === k ? T.primaerText : T.text }}>
                      {label}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <p style={{ margin: "0 0 8px", fontSize: "var(--schrift-klein)", color: T.textLeise }}>
                Die Änderung gilt nur für diesen einen Termin.
              </p>
            )}
            <input data-test="kt-fach" type="text" maxLength={40} placeholder="Fach oder Thema (z. B. Mathe)"
              value={kindTermin.fach} onChange={(e) => setKindTermin({ ...kindTermin, fach: e.target.value })}
              style={{ width: "100%", boxSizing: "border-box", minHeight: "var(--touch)", borderRadius: T.radiusKlein, border: `1px solid ${T.rand}`, padding: "0 12px", background: T.grund, color: T.text }} />
            <button data-test="kt-ok" disabled={kindTermin.tag === null}
              onClick={() => {
                const ersterTag = tagDatum(plan.montag, kindTermin.tag);
                let neu;
                if (kindTermin.editId != null) {
                  neu = data.einstellungen.termine.map((t) =>
                    t.id === kindTermin.editId ? { ...t, tag: ersterTag, art: kindTermin.art, fach: kindTermin.fach.trim() } : t);
                } else if (kindTermin.serie === "nein") {
                  const id = data.einstellungen.termine.reduce((m, t) => Math.max(m, t.id), 0) + 1;
                  neu = [...data.einstellungen.termine, { id, tag: ersterTag, art: kindTermin.art, fach: kindTermin.fach.trim() }].slice(0, 60);
                } else {
                  const bis = kindTermin.serie === "schuljahr" ? SCHULJAHR.bis : tagDatum(ersterTag, (parseInt(kindTermin.serie, 10) - 1) * 7);
                  neu = terminSerie(data.einstellungen.termine, ersterTag, kindTermin.art, kindTermin.fach.trim(), bis);
                }
                logChange({ ...data, einstellungen: { ...data.einstellungen, termine: neu } }, "wochenplan",
                  kindTermin.editId != null ? "geaendert" : "neu",
                  kindTermin.editId != null ? "Termin bearbeitet" : "Termin selbst eingetragen");
                setKindTermin(null);
              }}
              style={{ width: "100%", marginTop: 10, background: T.primaer, color: T.primaerText, fontWeight: 700, opacity: kindTermin.tag === null ? 0.5 : 1 }}>
              {kindTermin.editId != null ? "✓ Speichern" : "✓ Eintragen"}
            </button>
            <button onClick={() => setKindTermin(null)}
              style={{ width: "100%", marginTop: 6, background: "transparent", color: T.textLeise }}>
              Abbrechen
            </button>
          </div>
        </div>
      )}

      {terminDialog && (
        <div data-test="termin-dialog" onClick={() => setTerminDialog(null)} style={{
          position: "fixed", inset: 0, zIndex: 900, background: "rgba(38, 50, 72, 0.94)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: 18,
        }}>
          <div onClick={(ev) => ev.stopPropagation()} style={{ maxWidth: 380, width: "100%", background: T.karte, borderRadius: T.radius, padding: T.abstand }}>
            <h3 style={{ margin: "0 0 2px" }}>
              {TERMIN_ARTEN[terminDialog.art]?.emoji} {TERMIN_ARTEN[terminDialog.art]?.name}{terminDialog.fach ? ` · ${terminDialog.fach}` : ""}
            </h3>
            <p style={{ margin: "0 0 10px", color: T.textLeise, fontSize: "var(--schrift-klein)" }}>
              am {terminDialog.tag.split("-").reverse().join(".")}{Number.isInteger(terminDialog.serie) ? " · Teil einer 🔁 Serie" : ""}
            </p>
            <button data-test="termin-bearbeiten"
              onClick={() => {
                const idx = WOCHENTAGE.findIndex((_, i) => tagDatum(plan.montag, i) === terminDialog.tag);
                setKindTermin({ art: terminDialog.art, fach: terminDialog.fach || "", tag: idx >= 0 ? idx : null, serie: "nein", editId: terminDialog.id });
                setTerminDialog(null);
              }}
              style={{ width: "100%", marginBottom: 6, background: T.primaer, color: T.primaerText, fontWeight: 700 }}>
              ✏️ Bearbeiten
            </button>
            {Number.isInteger(terminDialog.serie) && (
              <button data-test="serie-entfernen"
                onClick={() => {
                  logChange({ ...data, einstellungen: { ...data.einstellungen, termine: data.einstellungen.termine.filter((x) => x.serie !== terminDialog.serie) } }, "wochenplan", "geaendert", "Ganze Termin-Serie entfernt");
                  setTerminDialog(null);
                }}
                style={{ width: "100%", marginBottom: 6, background: T.weich, color: T.text, fontWeight: 700 }}>
                🔁🗑️ Ganze Serie entfernen
              </button>
            )}
            <button data-test="termin-entfernen"
              onClick={() => {
                logChange({ ...data, einstellungen: { ...data.einstellungen, termine: data.einstellungen.termine.filter((x) => x.id !== terminDialog.id) } }, "wochenplan", "geaendert", "Termin entfernt");
                setTerminDialog(null);
              }}
              style={{ width: "100%", background: T.weich, color: T.text, fontWeight: 700 }}>
              🗑️ Termin entfernen
            </button>
            <button onClick={() => setTerminDialog(null)}
              style={{ width: "100%", marginTop: 6, background: "transparent", color: T.textLeise }}>
              Abbrechen
            </button>
          </div>
        </div>
      )}

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
        const info = bausteinAnzeige(block.typ, data.einstellungen);
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
                placeholder={block.typ === "freunde" ? "Mit wem triffst du dich?" : block.typ === "sport" ? "Welcher Sport? (z. B. Tennis, BJJ)" : "Notiz (z. B. was genau?)"}
                style={{ width: "100%", boxSizing: "border-box", minHeight: "var(--touch)", borderRadius: T.radiusKlein, border: `1px solid ${T.rand}`, padding: "0 12px", background: T.grund, color: T.text }} />
              <button data-test="notiz-ok"
                onClick={() => { speichern(blockNotiz(plan, block.id, editor.notiz), "Baustein-Notiz geändert"); zu(); }}
                style={{ width: "100%", marginTop: 10, background: T.primaer, color: T.primaerText, fontWeight: 700 }}>
                ✓ Speichern
              </button>
              {(() => {
                const enden = [];
                for (let d = 30; enden.length < 12; d += 30) {
                  const m = block.slot + d - 30;
                  if (!tagesStunden(block.tag).includes(m)) break;
                  if (d > 30) {
                    if (slotBelegtCalc(plan, block.tag, m, block.id)) break;
                    const f2 = festerTermin(feste, block.tag, m);
                    if (f2 && !istAusgefallen(plan, block.tag, f2.beginn)) break;
                  }
                  enden.push(block.slot + d);
                }
                if (enden.length < 2) return null;
                return (
                  <div style={{ marginTop: 10 }}>
                    <p style={{ margin: "0 0 4px", fontSize: "var(--schrift-klein)", color: T.textLeise }}>
                      ⏱️ Von {uhr(block.slot)} bis …
                    </p>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                      {enden.map((ende) => (
                        <button key={ende} data-test={`dauer-${ende}`}
                          onClick={() => speichern(blockDauer(plan, block.id, ende - block.slot), `Dauer bis ${uhr(ende)} Uhr gesetzt`)}
                          style={{
                            height: "auto", minHeight: 0, padding: "7px 9px", fontWeight: 700, fontSize: "var(--schrift-klein)",
                            background: block.slot + blockDauerVon(block) === ende ? T.primaer : T.weich,
                            color: block.slot + blockDauerVon(block) === ende ? T.primaerText : T.text,
                          }}>
                          {uhr(ende)}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })()}
              <div style={{ marginTop: 10 }}>
                <p style={{ margin: "0 0 4px", fontSize: "var(--schrift-klein)", color: T.textLeise }}>
                  🔁 Auch in den nächsten Wochen (gleiche Stelle)?
                </p>
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                  {[["4", "4 Wochen"], ["12", "12 Wochen"], ["schuljahr", "ganzes Schuljahr"]].map(([k, label]) => (
                    <button key={k} data-test={`block-serie-${k}`}
                      onClick={() => {
                        // erst die (evtl. geänderte) Notiz sichern, dann die Serie legen
                        const basis = blockNotiz(plan, block.id, editor.notiz);
                        const bis = k === "schuljahr" ? SCHULJAHR.bis : tagDatum(plan.montag, (parseInt(k, 10) - 1) * 7);
                        const doc = blockSerie(planSchreiben(data.lernstand.wochenplan, basis), basis, block.id, bis);
                        logChange({ ...data, lernstand: { ...data.lernstand, wochenplan: doc } }, "wochenplan", "neu", `Baustein-Serie (${label}) angelegt`);
                        zu();
                      }}
                      style={{ flex: "1 1 30%", height: "auto", minHeight: 0, padding: "7px 6px", fontWeight: 700, fontSize: "12.5px", background: T.weich, color: T.text }}>
                      {label}
                    </button>
                  ))}
                </div>
                {block.serie && (
                  <button data-test="block-serie-entfernen"
                    onClick={() => {
                      const doc = blockSerieEntfernen(data.lernstand.wochenplan, plan.montag, block.serie);
                      logChange({ ...data, lernstand: { ...data.lernstand, wochenplan: doc } }, "wochenplan", "geaendert", "Baustein-Serie ab dieser Woche entfernt");
                      zu();
                    }}
                    style={{ width: "100%", marginTop: 6, background: T.weich, color: T.text, fontWeight: 700 }}>
                    🔁🗑️ Serie ab dieser Woche entfernen
                  </button>
                )}
              </div>
              <button data-test="block-wechsel"
                onClick={() => { setFenster({ tag: block.tag, slot: block.slot, suche: "", wechselId: block.id }); zu(); }}
                style={{ width: "100%", marginTop: 6, background: T.weich, color: T.text, fontWeight: 700 }}>
                🔄 In etwas anderes ändern
              </button>
              <button data-test="block-verschieben"
                onClick={() => { setVerschieben(block.id); zu(); }}
                style={{ width: "100%", marginTop: 6, background: T.weich, color: T.text, fontWeight: 700 }}>
                📍 Verschieben (dann freies Fenster antippen)
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
