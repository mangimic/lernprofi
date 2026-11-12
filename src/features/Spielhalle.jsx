import { useEffect, useRef, useState } from "react";
import { Icon } from "./Icon.jsx";
import { useApp } from "../appContext.jsx";
import { spielStartbar, muenzeEinloesen } from "../calc/spiele.js";
import { spielAktiv } from "../calc/elternWerkzeuge.js";
import { aufgabenZaehlen } from "../calc/lerntage.js";
import { missionsOpts } from "../calc/tagesform.js";
import { seeAbenteuerStart } from "../spiele/seeAbenteuer.js";
import { blockweltStart } from "../spiele/blockwelt.js";
import { matchStart } from "../spiele/matchEngine.js";
import { MATCH_SKINS } from "../spiele/rennen.js";
import { TENNIS_SKIN, FUSSBALL_SKIN } from "../spiele/ballsport.js";
import { WETTFISCHEN_SKIN } from "../spiele/wettfischenSkin.js";
import { schachStart } from "../spiele/schach.js";
import { spielKlasseSetzen } from "../spiele/fragen.js";
import { vorleseModus } from "../calc/klassen.js";

// 🏁 ALLE Match-Spiele laufen auf EINER Engine (seit v0.80 auch
// Tennis und Fußball – originalgetreu als Skins portiert).
const ALLE_SKINS = { ...MATCH_SKINS, tennis: TENNIS_SKIN, fussball: FUSSBALL_SKIN, fischen: WETTFISCHEN_SKIN };

/* 🎮 Spielhalle: Ein Spielbesuch kostet 1 Münze (verdient beim Üben).
   See-Abenteuer, Blockwelt, Tennis- und Fußball-Match sind
   originalgetreue Ports aus der Alt-App (Vanilla-Inseln mit
   React-Wrapper). Die Blockwelt wird dauerhaft im verschlüsselten
   Tresor gespeichert; Tennis und Fußball zählen ihre Matches dort. */

export default function Spielhalle() {
  const { data, update, logChange, T, heute, navTo } = useApp();
  const [modus, setModus] = useState("halle"); // halle | see | blockwelt | tennis | fussball | fertig
  const [ergebnis, setErgebnis] = useState(null);
  const host = useRef(null);
  const engine = useRef(null);
  const dataRef = useRef(data);
  dataRef.current = data;
  const muenzen = data.lernstand.muenzen;

  const karte = { background: T.karte, borderRadius: T.radius, padding: T.abstand, marginBottom: T.abstand };
  const primaer = { width: "100%", background: T.primaer, color: T.primaerText, fontWeight: 700 };

  // Eltern-Schalter: Münz-Freischaltung aus = Spiele immer startbar
  const muenzenAn = data.einstellungen.muenzenAktiv;
  const startbar = !muenzenAn || spielStartbar(muenzen);
  const sichtbar = (id) => spielAktiv(data.einstellungen, id);

  // 🎒 Die Spiel-Fragen folgen der Klasse; Klasse 1/2 bekommt sie vorgelesen (v0.87)
  spielKlasseSetzen(data.profil.klasse, vorleseModus(data.einstellungen, data.profil.klasse));

  const starten = (id, name) => {
    if (!startbar) return;
    logChange(
      muenzenAn
        ? { ...data, lernstand: { ...data.lernstand, muenzen: muenzeEinloesen(muenzen) } }
        : data,
      "spiele", "neu", muenzenAn ? `${name} besucht (1 Münze eingelöst)` : `${name} besucht`,
    );
    setErgebnis(null);
    setModus(id);
  };

  const matchRunden = (key) => data.lernstand.stufen[key]?.runden || 0;

  // Engine mounten, sobald der Spiel-Container steht
  useEffect(() => {
    if (!host.current) return;
    if (modus === "see") {
      engine.current = seeAbenteuerStart(host.current, {
        onFertig: (erg) => { setErgebnis({ typ: "see", ...erg }); setModus("fertig"); },
      });
    } else if (modus === "blockwelt") {
      engine.current = blockweltStart(host.current, {
        stand: dataRef.current.lernstand.blockwelt,
        speichern: (stand) => {
          const d = dataRef.current;
          update({ ...d, lernstand: { ...d.lernstand, blockwelt: stand } });
        },
      });
    } else if (ALLE_SKINS[modus]) {
      engine.current = matchStart(host.current, ALLE_SKINS[modus], {
        name: dataRef.current.profil.name || "Du",
        runden: dataRef.current.lernstand.stufen[modus]?.runden || 0,
        onFertig: (erg) => { setErgebnis({ typ: modus, ...erg }); setModus("fertig"); },
      });
    } else if (modus === "schach") {
      engine.current = schachStart(host.current, {
        aufgabeGeloest: () => {
          const d = dataRef.current;
          update({
            ...d,
            lernstand: {
              ...d.lernstand,
              lerntage: aufgabenZaehlen(d.lernstand.lerntage, heute, 1, missionsOpts(d.einstellungen, d.lernstand.tagesform, heute)),
            },
          });
        },
      });
    } else { return; }
    return () => engine.current?.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modus]);

  // Ergebnis ins Dokument schreiben (eigener Effekt, nach dem Render)
  useEffect(() => {
    if (modus !== "fertig" || !ergebnis) return;
    if (ergebnis.typ === "see") {
      const rekord = Math.max(data.lernstand.rekorde.seeAbenteuer || 0, ergebnis.geloest);
      logChange(
        {
          ...data,
          lernstand: {
            ...data.lernstand,
            rekorde: { ...data.lernstand.rekorde, seeAbenteuer: rekord },
            lerntage: aufgabenZaehlen(data.lernstand.lerntage, heute, ergebnis.geloest, missionsOpts(data.einstellungen, data.lernstand.tagesform, heute)),
          },
        },
        "spiele", "neu", `See-Abenteuer: alle ${ergebnis.fische} Fische, ${ergebnis.geloest} Fragen richtig`,
      );
    } else {
      // Match-Spiele: Match zählen (Gegner-Rotation) + gewonnene Fragen als Aufgaben
      const key = ergebnis.typ;
      const label = { tennis: "Tennis-Match", fussball: "Fußball-Match", dino: "Dino-Rennen", rakete: "Raketen-Rennen", fischen: "Angel-Wettfischen" }[key] || key;
      const alt = data.lernstand.stufen[key] || { freigeschaltet: 1, runden: 0, krone: false };
      logChange(
        {
          ...data,
          lernstand: {
            ...data.lernstand,
            stufen: { ...data.lernstand.stufen, [key]: { ...alt, runden: alt.runden + 1 } },
            lerntage: aufgabenZaehlen(data.lernstand.lerntage, heute, ergebnis.wins, missionsOpts(data.einstellungen, data.lernstand.tagesform, heute)),
          },
        },
        "spiele", "neu",
        `${label} gegen ${ergebnis.gegner} ${ergebnis.gewonnen ? "gewonnen" : "gespielt"} (${ergebnis.wins} von ${ergebnis.balls} Bällen)`,
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modus]);

  if (modus === "see" || modus === "blockwelt" || modus === "schach" || ALLE_SKINS[modus]) {
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
    if (ergebnis.typ === "see") {
      return (
        <div data-test="see-ergebnis">
          <div style={karte}>
            <h2 style={{ marginTop: 0 }}>Korb voll – alle {ergebnis.fische} Fische!</h2>
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
    const info = {
      tennis: { name: "Tennis", einheit: "Bällen", verb: "gewonnen" },
      fussball: { name: "Fußball", einheit: "Bällen", verb: "verwandelt" },
      dino: { name: "Dino-Rennen", einheit: "Fragen", verb: "geschafft" },
      rakete: { name: "Raketen-Rennen", einheit: "Fragen", verb: "geschafft" },
      fischen: { name: "Angel-Wettfischen", einheit: "Fischen", verb: "gefangen" },
    }[ergebnis.typ] || { name: ergebnis.typ, einheit: "Fragen", verb: "geschafft" };
    return (
      <div data-test="match-ergebnis">
        <div style={karte}>
          <h2 style={{ marginTop: 0 }}>
            {ergebnis.gewonnen ? "Match gewonnen!" : "Starkes Match!"}
          </h2>
          <p>
            {info.name} gegen <b>{ergebnis.gegner}</b>:
            du hast <b>{ergebnis.wins} von {ergebnis.balls}</b> {info.einheit} {info.verb} –
            jeder davon zählt für deine Mini-Missionen.
          </p>
          <p style={{ color: T.textLeise, fontSize: "var(--schrift-klein)" }}>
            Beim nächsten Match wartet {ergebnis.gewonnen ? "ein neuer Gegner" : "die Revanche"} auf dich.
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 12, marginBottom: T.abstand, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: "var(--schrift-klein)", fontWeight: 700, color: T.textLeise }}>Spielhalle</div>
          <h2 style={{ margin: "2px 0 0", fontSize: "var(--schrift-titel)", lineHeight: 1.1 }}>Deine Welten</h2>
        </div>
        <div data-test="spielhalle-stand" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 16px", borderRadius: 999, background: T.karte, boxShadow: "var(--schatten)", fontWeight: 900 }}>
          <Icon name="coin" size={22} style={{ color: "var(--primaer)" }} />
          {muenzenAn
            ? <><b data-test="spielhalle-muenzen">{muenzen}</b> {muenzen === 1 ? "Münze" : "Münzen"}</>
            : <>Freie Fahrt</>}
        </div>
      </div>
      <p style={{ margin: "0 0 14px", color: T.textLeise, fontSize: "var(--schrift-klein)", fontWeight: 700 }}>
        {muenzenAn
          ? "Eine Münze pro Spiel – Münzen verdienst du beim Üben (1 Runde = 1 Münze). Deine Lieblings-Welten stehen vorn."
          : "Die Münz-Freischaltung ist gerade ausgeschaltet – viel Spaß!"}
      </p>
      {(() => {
        // 🎨 Spiele-Katalog mit Welten-Zuordnung: Spiele aus den
        // Lieblings-Welten des Kindes stehen vorn (mit ⭐ markiert).
        const matches = (id, wort = "Match") => (matchRunden(id)
          ? ` · ${matchRunden(id)} ${wort}${matchRunden(id) === 1 || wort === "Rennen" ? "" : "es"}` : "");
        const KATALOG = [
          { id: "see", welt: "angeln", name: "See-Abenteuer",
            text: "Lauf um den See, wirf die Angel aus und fang alle Fische – vom flinken Barsch bis zum Hecht, der sich dreimal wehrt!",
            extra: () => "" },
          { id: "blockwelt", welt: "gaming", name: "Blockwelt",
            text: "Bau deine eigene Welt! Blöcke verdienst du mit Fragen, die Werkstatt schaltet Tiere, Möbel und 💥 TNT frei – deine Welt bleibt gespeichert.",
            extra: () => (data.lernstand.blockwelt?.verdient ? ` · 🎁 ${data.lernstand.blockwelt.verdient}` : "") },
          { id: "tennis", welt: "tennis", name: "Tennis-Match",
            text: "Richtige Antwort = Punkt (15–30–40–Spiel), 2 Spiele gewinnen das Match – mit Coach Leo als Mutmacher an deiner Seite!",
            extra: () => matches("tennis") },
          { id: "fussball", welt: "fussball", name: "Fußball-Match",
            text: "2 Halbzeiten mit je 5 Torchancen: richtig = TOOOR, falsch = Konter – bei Gleichstand entscheidet ein Elfmeter!",
            extra: () => matches("fussball") },
          { id: "fischen", welt: "angeln", name: "Angel-Wettfischen",
            text: "Wettfischen am See: richtig = der Fisch landet in DEINEM Eimer, falsch = er entwischt zum Gegner. Bei Gleichstand entscheidet der große Hecht!",
            extra: () => matches("fischen", "Wettfischen") },
          { id: "dino", welt: "dinos", name: "Dino-Rennen",
            text: "Renn durchs Urzeit-Tal: richtig = Riesensprung für deinen Dino, falsch = der Gegner sprintet. 2 Runden – bei Gleichstand gibt's ein Foto-Finish!",
            extra: () => matches("dino", "Rennen") },
          { id: "rakete", welt: "weltraum", name: "Raketen-Rennen",
            text: "Wettflug zum Mond: richtig = voller Schub, falsch = der Gegner zieht davon. 2 Etappen mit Boxenstopp an der Raumstation!",
            extra: () => matches("rakete", "Rennen") },
          { id: "schach", welt: null, name: "Schach",
            text: "Schach-Schule mit deinen Eröffnungen, Taktik-Aufgaben zum Antippen und echtes Schach gegen den Computer – mit Tipp und Zug-Zurück.",
            extra: () => "" },
        ];
        const interessen = data.profil.interessen || [];
        const lieblings = (sp) => !!sp.welt && interessen.includes(sp.welt);
        const sortiert = [...KATALOG].sort((a, b) => (lieblings(b) ? 1 : 0) - (lieblings(a) ? 1 : 0));
        // 🎨 Farbklima je Welt (Designrichtung „Ruhige Bühne"): Gold trägt Tinte-Text, der Rest Weiß.
        const FARBE = { angeln: "var(--see)", dinos: "var(--ok)", weltraum: "var(--tinte)", fussball: "var(--primaer)", tennis: "#2F8A69", gaming: "#4B5D73" };
        const ZEICHEN = { see: "compass", fischen: "flag", blockwelt: "puzzle", tennis: "target", fussball: "target", dino: "play", rakete: "sparkle", schach: "puzzle" };
        return (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14, marginBottom: T.abstand }}>
            {sortiert.filter((sp) => sichtbar(sp.id)).map((sp) => {
              const farbe = sp.welt ? FARBE[sp.welt] : null;
              const hell = farbe === "var(--primaer)";
              const textFarbe = !farbe ? T.text : hell ? "var(--primaer-text)" : "#fff";
              const leise = !farbe ? T.textLeise : hell ? "rgba(30,42,58,0.75)" : "rgba(255,255,255,0.82)";
              return (
                <button key={sp.id} data-test={`spiel-${sp.id}`} onClick={() => starten(sp.id, sp.name)} disabled={!startbar}
                  style={{
                    textAlign: "left", display: "flex", flexDirection: "column", gap: 8, minHeight: 170, padding: 18,
                    borderRadius: 26, background: farbe || T.karte, color: textFarbe,
                    boxShadow: farbe ? "none" : "var(--schatten)", opacity: startbar ? 1 : 0.6,
                  }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                    <Icon name={ZEICHEN[sp.id] || "sparkle"} size={28} weite={2} />
                    {lieblings(sp) && (
                      <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.08em", textTransform: "uppercase", padding: "4px 10px", borderRadius: 999, background: hell ? "rgba(30,42,58,0.14)" : "rgba(255,255,255,0.22)" }}>
                        Deine Welt
                      </span>
                    )}
                  </div>
                  <div style={{ flex: 1 }} />
                  <div style={{ fontSize: "var(--schrift-gross)", fontWeight: 900, lineHeight: 1.1 }}>{sp.name}</div>
                  <div style={{ color: leise, fontSize: "var(--schrift-klein)", fontWeight: 700, lineHeight: 1.35 }}>{sp.text}</div>
                  <div style={{ color: leise, fontSize: 12, fontWeight: 800 }}>
                    {!muenzenAn ? "Frei" : startbar ? "1 Münze einlösen" : "Übe für 1 Münze"}
                    {sp.extra()}
                  </div>
                </button>
              );
            })}
          </div>
        );
      })()}
      {!startbar && (
        <button data-test="zum-ueben-aus-halle" onClick={() => navTo("ueben")} style={primaer}>
          Erst eine Runde üben
        </button>
      )}
    </div>
  );
}
