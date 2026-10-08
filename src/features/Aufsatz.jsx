import { useState } from "react";
import { useApp } from "../appContext.jsx";
import { muenzenNachRunde, aufgabenZaehlen } from "../calc/lerntage.js";
import { missionsOpts } from "../calc/tagesform.js";
import { kiAufsatz } from "../ki.js";
import { bildVerkleinern } from "../foto.js";

/* ✍️ Aufsatz-Check (KI-Etappe 7d): Felix' Aufsatz entsteht ANALOG auf
   Papier – hier wird er nur fotografiert. Leo liest den Text und gibt
   ADHS-gerechtes Feedback: 2 ⭐-Stärken, dann genau EINE markierte
   Stelle (zeigen statt Fehlerliste!) und eine Mach-Aufgabe mit Stimme.
   Nie Rechtschreib-Korrekturen am Stück, nie Noten. */

export const TEXTARTEN = [
  { key: "vorgang", name: "🧪 Vorgangsbeschreibung", hinweis: "Reihenfolge · Zuerst/Dann/Danach · Präsens" },
  { key: "erlebnis", name: "🌟 Erlebniserzählung", hinweis: "Einleitung · Höhepunkt · Schluss" },
  { key: "bild", name: "🖼️ Bildergeschichte", hinweis: "Bilder der Reihe nach · Namen · Schluss-Satz" },
];

export default function Aufsatz() {
  const { data, logChange, T, heute, navTo } = useApp();
  const [art, setArt] = useState("vorgang");
  const [ki, setKi] = useState(null); // null | {laden} | {fehler} | {sterne, tipp, mach, offen}
  const karte = { background: T.karte, borderRadius: T.radius, padding: T.abstand, marginBottom: T.abstand };

  const freigabe = data.einstellungen.ki.aufsatz;
  const schonHeute = data.lernstand.aufsatz.tag === heute;
  const gewaehlt = TEXTARTEN.find((t) => t.key === art);

  const fotoPruefen = async (datei) => {
    if (!datei) return;
    setKi({ laden: true });
    let bild;
    try {
      bild = await bildVerkleinern(datei, 1280, 0.8); // Text braucht mehr Auflösung als ein Satz
    } catch {
      setKi({ fehler: "foto" });
      return;
    }
    const erg = await kiAufsatz({
      bild: bild.base64, textart: art, typ: "image/jpeg", modell: data.einstellungen.ki.modell,
    });
    setKi(erg.ok ? { sterne: erg.sterne, tipp: erg.tipp, mach: erg.mach, offen: 1 } : { fehler: erg.grund });
  };

  const fertig = () => {
    const neu = {
      ...data,
      lernstand: {
        ...data.lernstand,
        // Belohnung nur beim ersten Aufsatz-Check des Tages.
        ...(schonHeute ? {} : {
          aufsatz: { tag: heute },
          muenzen: data.einstellungen.muenzenAktiv ? muenzenNachRunde(data.lernstand.muenzen) : data.lernstand.muenzen,
          lerntage: aufgabenZaehlen(data.lernstand.lerntage, heute, 1, missionsOpts(data.einstellungen, data.lernstand.tagesform, heute)),
        }),
      },
    };
    logChange(neu, "aufsatz", "neu", `Aufsatz-Check (${art}) abgeschlossen`);
    setKi(null);
  };

  return (
    <div data-test="aufsatz-seite">
      <div style={karte}>
        <h2 style={{ margin: "0 0 4px" }}>✍️ Aufsatz-Check</h2>
        <p style={{ margin: "0 0 10px", color: T.textLeise, fontSize: "var(--schrift-klein)" }}>
          Dein Aufsatz entsteht auf Papier – Leo liest ihn vom Foto und zeigt dir
          2 Stärken und EINE Stelle, die noch besser geht. Keine Fehlerliste, versprochen.
        </p>
        <div style={{ display: "grid", gap: 6, marginBottom: 10 }}>
          {TEXTARTEN.map((t) => (
            <button key={t.key} data-test={`aufsatz-art-${t.key}`} onClick={() => { setArt(t.key); setKi(null); }}
              style={{
                textAlign: "left", fontWeight: 700, padding: "8px 14px", height: "auto",
                background: art === t.key ? T.primaer : T.weich,
                color: art === t.key ? T.primaerText : T.text,
              }}>
              {t.name}
              <span style={{ display: "block", fontWeight: 400, fontSize: "var(--schrift-klein)", opacity: 0.85 }}>{t.hinweis}</span>
            </button>
          ))}
        </div>

        {!freigabe ? (
          <p data-test="aufsatz-freigabe-hinweis" style={{ margin: 0, color: T.textLeise, fontSize: "var(--schrift-klein)" }}>
            📸 Schreib deinen Aufsatz ruhig fertig! Leos Aufsatz-Check (Foto prüfen)
            können deine Eltern im Elternbereich freischalten.
          </p>
        ) : ki?.laden ? (
          <p data-test="aufsatz-laden" style={{ margin: 0, color: T.textLeise }}>🦁 Leo liest deinen Aufsatz …</p>
        ) : ki?.fehler ? (
          <>
            <p data-test="aufsatz-fehler" style={{ margin: "0 0 8px", color: T.textLeise, fontSize: "var(--schrift-klein)" }}>
              {ki.fehler === "deckel" ? "🦁 Leos Budget ist für diesen Monat aufgebraucht – dein Aufsatz zählt trotzdem!"
                : ki.fehler === "foto" ? "🦁 Das Foto konnte ich nicht öffnen – probier es nochmal."
                : "🦁 Leo ist gerade nicht erreichbar – probier es später nochmal."}
            </p>
            <button data-test="aufsatz-nochmal" onClick={() => setKi(null)}
              style={{ width: "100%", background: T.weich, color: T.text, fontWeight: 700 }}>
              🔁 Nochmal versuchen
            </button>
          </>
        ) : ki ? (
          <div className="mut-dialog" data-test="aufsatz-ergebnis">
            <div className="mut-kopf">🦁 <b>Coach Leo</b> hat deinen Aufsatz gelesen ({gewaehlt.name})</div>
            {ki.sterne.slice(0, ki.offen).map((s, i) => (
              <div key={i} className="bubble coach" data-test="aufsatz-stern">⭐ {s}</div>
            ))}
            {ki.offen < ki.sterne.length ? (
              <button data-test="aufsatz-weiter" className="bw-knopf mut-weiter"
                onClick={() => setKi({ ...ki, offen: ki.offen + 1 })}>
                💬 Weiter
              </button>
            ) : (
              <>
                {ki.tipp.blase && (
                  <div className="bubble coach" data-test="aufsatz-tipp">
                    🌱 {ki.tipp.stelle ? (
                      <>Schau auf diese Stelle:{" "}
                        <mark style={{ background: "var(--warn-weich, #ffe9b3)", borderRadius: 4, padding: "0 4px" }}>
                          „{ki.tipp.stelle}“
                        </mark>{" – "}
                      </>
                    ) : null}
                    {ki.tipp.blase}
                  </div>
                )}
                <div className="bubble kind" data-test="aufsatz-mach">👆 <b>Mach-Aufgabe:</b> {ki.mach}</div>
                <button data-test="aufsatz-fertig" onClick={fertig}
                  style={{ width: "100%", marginTop: 8, background: T.primaer, color: T.primaerText, fontWeight: 700 }}>
                  ✓ Hab ich gemacht{schonHeute ? "" : " (🪙 +1)"}
                </button>
              </>
            )}
          </div>
        ) : (
          <>
            {schonHeute && (
              <p data-test="aufsatz-heute-fertig" style={{ margin: "0 0 8px", color: T.ok, fontWeight: 700 }}>
                🎉 Heute schon einen Aufsatz geprüft! Noch einer geht – Münze gab es schon.
              </p>
            )}
            <label data-test="aufsatz-foto-label" style={{
              display: "block", textAlign: "center", background: T.primaer, color: T.primaerText,
              fontWeight: 700, borderRadius: T.radiusKlein, padding: "14px 12px", cursor: "pointer",
            }}>
              📸 Foto von meinem Aufsatz machen
              <input data-test="aufsatz-foto" type="file" accept="image/*" capture="environment"
                style={{ display: "none" }}
                onChange={(e) => { fotoPruefen(e.target.files?.[0]); e.target.value = ""; }} />
            </label>
            <p style={{ margin: "8px 0 0", color: T.textLeise, fontSize: "var(--schrift-klein)" }}>
              💡 Eine Seite pro Foto, Blatt gerade, gutes Licht.
            </p>
          </>
        )}
      </div>

      <button data-test="aufsatz-zurueck" onClick={() => navTo("start")}
        style={{ background: "transparent", color: T.textLeise, fontSize: "var(--schrift-klein)" }}>
        ← Zurück zur Startseite
      </button>
    </div>
  );
}
