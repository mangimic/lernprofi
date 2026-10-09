import { useState } from "react";
import { useApp } from "../appContext.jsx";
import { aktiveKarten } from "../calc/karteikarten.js";
import { faelligeKarten, karteWerten, kastenZaehler, RUNDEN_GROESSE } from "../calc/karteikasten.js";
import AufgabenBild from "./AufgabenBild.jsx";

/* 🗃️ DER DIGITALE KARTEIKASTEN (Leitner, 3 Fächer):
   Eine Runde = höchstens 5 fällige Karten, wackligste zuerst.
   Erst selbst antworten (gern LAUT), dann umdrehen, dann SELBST
   einschätzen: „Gewusst“ → ein Fach weiter, „Nochmal“ → Fach 1 und
   die Karte kommt am Ende der Runde noch einmal (ohne neue Wertung).
   Jede Wertung wird sofort gespeichert (Autosync), die Münze gibt es
   am Runden-Ende. */

const FACH_DEKO = { deutsch: { emoji: "📖", name: "Deutsch" }, mathe: { emoji: "🔢", name: "Mathe" } };
const KASTEN_INFO = [
  { fach: 1, emoji: "📥", name: "Fach 1 · jeden Tag", hinweis: "neu & noch wacklig" },
  { fach: 2, emoji: "📦", name: "Fach 2 · alle 3 Tage", hinweis: "fast sicher" },
  { fach: 3, emoji: "🏆", name: "Fach 3 · alle 7 Tage", hinweis: "sitzt! 🎉" },
];

export default function KartenKasten() {
  const { data, update, logChange, T, heute, navTo } = useApp();
  const stand = data.lernstand.karteikasten.stand;
  const alleKarten = aktiveKarten(data.einstellungen);
  const zaehler = kastenZaehler(alleKarten, stand);
  // Runde: { stapel: [{karte, wiederholung}], index, offen, gewusst, gesamt }
  const [runde, setRunde] = useState(null);

  const starten = () => {
    const karten = faelligeKarten(alleKarten, stand, heute);
    if (!karten.length) return;
    setRunde({ stapel: karten.map((karte) => ({ karte, wiederholung: false })), index: 0, offen: false, gewusst: 0, gesamt: karten.length });
  };

  const speichernStand = (neuStand) => {
    update({ ...data, lernstand: { ...data.lernstand, karteikasten: { ...data.lernstand.karteikasten, stand: neuStand } } });
  };

  const weiter = (r) => {
    if (r.index + 1 < r.stapel.length) { setRunde({ ...r, index: r.index + 1, offen: false }); return; }
    // 🎉 Runden-Ende: Münze + Protokoll in EINEM Eintrag
    const kasten = data.lernstand.karteikasten;
    logChange({
      ...data,
      lernstand: {
        ...data.lernstand,
        muenzen: data.lernstand.muenzen + 1,
        karteikasten: { ...kasten, runden: kasten.runden + 1 },
      },
    }, "karteikasten", "neu", `Karteikasten-Runde: ${r.gewusst} von ${r.gesamt} gewusst (+1 Münze)`);
    setRunde({ ...r, index: r.stapel.length, offen: false }); // Ergebnis-Ansicht
  };

  const werten = (gewusst) => {
    const eintrag = runde.stapel[runde.index];
    let r = runde;
    if (!eintrag.wiederholung) {
      speichernStand(karteWerten(stand, eintrag.karte.id, gewusst, heute));
      if (gewusst) r = { ...r, gewusst: r.gewusst + 1 };
      else r = { ...r, stapel: [...r.stapel, { karte: eintrag.karte, wiederholung: true }] };
    }
    weiter(r);
  };

  const karteCss = { maxWidth: 460, margin: "0 auto", background: T.karte, borderRadius: T.radius, padding: T.abstand, textAlign: "center" };

  // ── Ergebnis ──
  if (runde && runde.index >= runde.stapel.length) {
    return (
      <div data-test="kasten-seite">
        <div data-test="kasten-ergebnis" style={karteCss}>
          <h2 style={{ marginTop: 0 }}>🎉 Runde geschafft!</h2>
          <p><b>{runde.gewusst} von {runde.gesamt}</b> gewusst · 🪙 +1 Münze (jetzt {data.lernstand.muenzen})</p>
          <p style={{ color: T.textLeise, fontSize: "var(--schrift-klein)" }}>
            🏆 Im „sitzt!“-Fach liegen jetzt <b>{kastenZaehler(alleKarten, data.lernstand.karteikasten.stand)[3]}</b> Karten.
          </p>
          {faelligeKarten(alleKarten, data.lernstand.karteikasten.stand, heute).length > 0 && (
            <button data-test="kasten-nochmal" onClick={starten}
              style={{ width: "100%", marginBottom: 8, background: T.primaer, color: T.primaerText, fontWeight: 700 }}>
              🃏 Noch eine Runde
            </button>
          )}
          <button data-test="kasten-fertig" onClick={() => setRunde(null)}
            style={{ width: "100%", background: T.weich, color: T.text, fontWeight: 700 }}>
            ← Zum Kasten
          </button>
        </div>
      </div>
    );
  }

  // ── Karten-Runde ──
  if (runde) {
    const { karte, wiederholung } = runde.stapel[runde.index];
    const deko = FACH_DEKO[karte.fach];
    return (
      <div data-test="kasten-seite">
        <div data-test="kasten-karte" style={{ ...karteCss, border: `2px solid ${runde.offen ? T.ok : T.primaer}` }}>
          <span style={{ display: "inline-block", background: T.weich, borderRadius: 20, padding: "3px 12px", fontSize: "var(--schrift-klein)", fontWeight: 700, marginBottom: 10 }}>
            {deko.emoji} {deko.name} · Karte {runde.index + 1} von {runde.stapel.length}{wiederholung ? " · ⏮️ nochmal" : ""}
          </span>
          <p data-test="kasten-frage" style={{ fontSize: "var(--schrift-gross)", fontWeight: 800, margin: "6px 0 4px" }}>{karte.vs}</p>
          {karte.hinweis && <p style={{ margin: "0 0 10px", color: T.textLeise, fontSize: "var(--schrift-klein)" }}>{karte.hinweis}</p>}
          {!runde.offen ? (
            <>
              <p style={{ color: T.textLeise, fontSize: "var(--schrift-klein)" }}>
                {karte.typ === "schreiben" ? "✍️ Schreib das Wort auf ein Blatt – dann umdrehen!" : "Sag die Antwort LAUT – dann umdrehen!"}
              </p>
              <button data-test="karte-umdrehen" onClick={() => setRunde({ ...runde, offen: true })}
                style={{ width: "100%", background: T.primaer, color: T.primaerText, fontWeight: 700 }}>
                🔄 Umdrehen
              </button>
            </>
          ) : (
            <>
              <p data-test="kasten-antwort" style={{ fontSize: "var(--schrift-gross)", fontWeight: 800, color: T.ok, margin: "8px 0" }}>{karte.rs}</p>
              {karte.bild && <AufgabenBild b={karte.bild} />}
              <p style={{ background: T.grund, borderRadius: T.radiusKlein, padding: "8px 12px", fontSize: "var(--schrift-klein)", margin: "0 0 12px" }}>
                🧠 {karte.merk}
              </p>
              {wiederholung ? (
                <button data-test="karte-weiter" onClick={() => weiter(runde)}
                  style={{ width: "100%", background: T.primaer, color: T.primaerText, fontWeight: 700 }}>
                  ✔️ Weiter
                </button>
              ) : (
                <div style={{ display: "flex", gap: 10 }}>
                  <button data-test="karte-nochmal" onClick={() => werten(false)}
                    style={{ flex: 1, height: "auto", padding: "10px 6px", background: T.weich, color: T.text, fontWeight: 700 }}>
                    🤔 Nochmal<br /><small style={{ fontWeight: 400 }}>zurück in Fach 1</small>
                  </button>
                  <button data-test="karte-gewusst" onClick={() => werten(true)}
                    style={{ flex: 1, height: "auto", padding: "10px 6px", background: T.ok, color: "#fff", fontWeight: 700 }}>
                    🙂 Gewusst!<br /><small style={{ fontWeight: 400 }}>ein Fach weiter</small>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
        <p style={{ textAlign: "center" }}>
          <button data-test="kasten-abbrechen" onClick={() => setRunde(null)}
            style={{ background: "transparent", color: T.textLeise, fontSize: "var(--schrift-klein)" }}>
            ← Abbrechen (Gewertetes bleibt gespeichert)
          </button>
        </p>
      </div>
    );
  }

  // ── Kasten-Übersicht ──
  const faellig = faelligeKarten(alleKarten, stand, heute);
  return (
    <div data-test="kasten-seite">
      <div style={{ background: T.karte, borderRadius: T.radius, padding: T.abstand, marginBottom: T.abstand }}>
        <h2 style={{ margin: "0 0 4px" }}>🗃️ Leos Karteikasten</h2>
        <p style={{ margin: "0 0 10px", color: T.textLeise, fontSize: "var(--schrift-klein)" }}>
          „Gewusst“ → die Karte wandert ein Fach weiter. „Nochmal“ → zurück in Fach 1.
          So übst du automatisch genau das, was noch wackelt.
        </p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {KASTEN_INFO.map((k) => (
            <div key={k.fach} data-test={`kasten-fach-${k.fach}`} style={{ flex: "1 1 140px", background: T.grund, borderRadius: T.radiusKlein, padding: "10px 12px" }}>
              <b style={{ fontSize: "var(--schrift-klein)" }}>{k.emoji} {k.name}</b>
              <div style={{ fontSize: "var(--schrift-gross)", fontWeight: 800, color: T.primaer }}>{zaehler[k.fach]}</div>
              <div style={{ fontSize: "12px", color: T.textLeise }}>{k.hinweis}</div>
            </div>
          ))}
        </div>
        {faellig.length > 0 ? (
          <button data-test="kasten-start" onClick={starten}
            style={{ width: "100%", marginTop: 12, background: T.primaer, color: T.primaerText, fontWeight: 700 }}>
            🃏 {Math.min(faellig.length, RUNDEN_GROESSE)} Karten ziehen (ein paar Minuten)
          </button>
        ) : (
          <p data-test="kasten-leer" style={{ margin: "12px 0 0", fontWeight: 700, color: T.ok }}>
            🎉 Heute ist keine Karte fällig – alles im Rhythmus! Komm morgen wieder.
          </p>
        )}
        <p style={{ margin: "10px 0 0", color: T.textLeise, fontSize: "var(--schrift-klein)" }}>
          Bisher {data.lernstand.karteikasten.runden} Runden gespielt · Papier-Version: Eltern → 🗃️ Karteikarten drucken.
        </p>
      </div>
      <button data-test="kasten-zurueck" onClick={() => navTo("start")}
        style={{ background: "transparent", color: T.textLeise, fontSize: "var(--schrift-klein)" }}>
        ← Zurück zur Startseite
      </button>
    </div>
  );
}
