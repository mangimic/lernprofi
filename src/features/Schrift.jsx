import { useState } from "react";
import { useApp } from "../appContext.jsx";
import { schreibSatz, reiseEintragen, heuteGeschrieben, leererSchriftStand } from "../calc/schrift.js";
import { muenzenNachRunde, aufgabenZaehlen } from "../calc/lerntage.js";
import { missionsOpts } from "../calc/tagesform.js";
import { STARK_SAETZE } from "../calc/aufgaben/stark.js";
import { kiSchrift } from "../ki.js";
import { bildVerkleinern } from "../foto.js";

/* 🖐️ Schreib-Training: EIN kurzer Satz pro Tag, mit der Hand auf
   Papier geschrieben, abfotografiert – Coach Leo schaut NUR auf die
   Handschrift (2 Sterne + 1 Übe-Buchstabe + Mach-Aufgabe).
   Die analoge Aufgabe funktioniert auch OHNE KI-Freigabe; nur der
   Foto-Teil braucht die Eltern-Freigabe „Schrift-Blick".
   Die Schrift-Reise (kleine Vorschaubilder) zeigt den Fortschritt:
   Tag 1 neben heute – sehen statt lesen. */

export default function Schrift() {
  const { data, logChange, T, heute, navTo } = useApp();
  const [ki, setKi] = useState(null); // null | {laden} | {fehler} | {sterne, uebe, mach, offen, thumb, gross}
  const [anzeige, setAnzeige] = useState(null); // 👁️ Blatt aus der Reise groß ansehen
  const karte = { background: T.karte, borderRadius: T.radius, padding: T.abstand, marginBottom: T.abstand };

  // Satz des Tages: Hat Felix heute seinen Mut-Satz gewählt, ist DER die
  // Schreibaufgabe (doppelt wirksam) – sonst rotiert die Übungs-Welt.
  const mut = data.lernstand.mutSatz;
  const mutHeute = mut.tag === heute;
  const satz = mutHeute ? STARK_SAETZE[mut.idx] : schreibSatz(heute, data.einstellungen.uebungsThema);

  const stand = data.lernstand.schrift || leererSchriftStand();
  const schonHeute = heuteGeschrieben(stand, heute);
  const freigabe = data.einstellungen.ki.schrift;

  const fotoPruefen = async (datei) => {
    if (!datei) return;
    setKi({ laden: true });
    let pruef, mittel, klein;
    try {
      pruef = await bildVerkleinern(datei, 1024, 0.8);   // geht zu Leo
      mittel = await bildVerkleinern(datei, 640, 0.7);   // zum Wieder-Ansehen in der Reise
      klein = await bildVerkleinern(datei, 120, 0.6);    // Galerie-Kachel
    } catch {
      setKi({ fehler: "foto" });
      return;
    }
    const erg = await kiSchrift({
      bild: pruef.base64, satz, typ: "image/jpeg", modell: data.einstellungen.ki.modell,
    });
    setKi(erg.ok
      ? { sterne: erg.sterne, uebe: erg.uebe, mach: erg.mach, offen: 1, thumb: klein.dataUrl, gross: mittel.dataUrl }
      : { fehler: erg.grund });
  };

  const inReiseSpeichern = () => {
    const neu = {
      ...data,
      lernstand: {
        ...data.lernstand,
        schrift: reiseEintragen(stand, { tag: heute, satz, buchstabe: ki?.uebe?.buchstabe || "", thumb: ki?.thumb || "", gross: ki?.gross || "" }),
        // Belohnung nur beim ersten Blatt des Tages – sonst würde Knipsen Münzen farmen.
        ...(schonHeute ? {} : {
          muenzen: data.einstellungen.muenzenAktiv ? muenzenNachRunde(data.lernstand.muenzen) : data.lernstand.muenzen,
          lerntage: aufgabenZaehlen(data.lernstand.lerntage, heute, 1, missionsOpts(data.einstellungen, data.lernstand.tagesform, heute)),
        }),
      },
    };
    logChange(neu, "schrift", "neu", "Schreib-Training: Blatt in die Schrift-Reise gelegt");
    setKi(null);
  };

  const reise = stand.reise;
  const erster = reise[0];
  const letzter = reise[reise.length - 1];

  return (
    <div data-test="schrift-seite">
      <div style={karte}>
        <h2 style={{ margin: "0 0 4px" }}>🖐️ Schreib-Training</h2>
        <p style={{ margin: "0 0 10px", color: T.textLeise, fontSize: "var(--schrift-klein)" }}>
          Ein Satz am Tag – mit der Hand, auf Papier. Das macht deine Schrift stark.
        </p>
        <p data-test="schrift-satz" style={{
          margin: "0 0 10px", fontWeight: 800, fontSize: "var(--schrift-gross)",
          background: T.grund, borderRadius: T.radiusKlein, padding: "12px 14px",
        }}>
          ✍️ „{satz}“
        </p>
        {mutHeute && (
          <p data-test="schrift-mut" style={{ margin: "0 0 10px", color: T.textLeise, fontSize: "var(--schrift-klein)" }}>
            🦁 Das ist dein Mut-Satz von heute – schreiben macht ihn doppelt stark!
          </p>
        )}
        <ol style={{ margin: "0 0 12px", paddingLeft: 22, lineHeight: 1.7 }}>
          <li>📝 Schreib den Satz <b>schön</b> auf ein Blatt.</li>
          <li>📸 Mach ein Foto – Blatt gerade, gutes Licht.</li>
          <li>🦁 Leo schaut auf deine <b>Schrift</b> (nicht auf Fehler!).</li>
        </ol>

        {!freigabe ? (
          <p data-test="schrift-freigabe-hinweis" style={{ margin: 0, color: T.textLeise, fontSize: "var(--schrift-klein)" }}>
            📸 Schreib den Satz trotzdem – das zählt! Leos Schrift-Blick (Foto prüfen)
            können deine Eltern im Elternbereich freischalten.
          </p>
        ) : ki?.laden ? (
          <p data-test="schrift-laden" style={{ margin: 0, color: T.textLeise }}>🦁 Leo schaut sich dein Blatt an …</p>
        ) : ki?.fehler ? (
          <>
            <p data-test="schrift-fehler" style={{ margin: "0 0 8px", color: T.textLeise, fontSize: "var(--schrift-klein)" }}>
              {ki.fehler === "deckel" ? "🦁 Leos Budget ist für diesen Monat aufgebraucht – dein Blatt zählt trotzdem!"
                : ki.fehler === "foto" ? "🦁 Das Foto konnte ich nicht öffnen – probier es nochmal."
                : "🦁 Leo ist gerade nicht erreichbar – probier es später nochmal."}
            </p>
            <button data-test="schrift-nochmal" onClick={() => setKi(null)}
              style={{ width: "100%", background: T.weich, color: T.text, fontWeight: 700 }}>
              🔁 Nochmal versuchen
            </button>
          </>
        ) : ki ? (
          <div className="mut-dialog" data-test="schrift-ergebnis">
            <div className="mut-kopf">🦁 <b>Coach Leo</b> hat dein Blatt angeschaut</div>
            {ki.sterne.slice(0, ki.offen).map((s, i) => (
              <div key={i} className="bubble coach" data-test="schrift-stern">⭐ {s}</div>
            ))}
            {ki.offen < ki.sterne.length ? (
              <button data-test="schrift-weiter" className="bw-knopf mut-weiter"
                onClick={() => setKi({ ...ki, offen: ki.offen + 1 })}>
                💬 Weiter
              </button>
            ) : (
              <>
                {ki.uebe.blase && (
                  <div className="bubble coach" data-test="schrift-uebe">
                    🌱 {ki.uebe.buchstabe ? <><b>Übe-Buchstabe „{ki.uebe.buchstabe}“:</b>{" "}</> : null}{ki.uebe.blase}
                  </div>
                )}
                <div className="bubble kind" data-test="schrift-mach">👆 <b>Mach-Aufgabe:</b> {ki.mach}</div>
                <button data-test="schrift-speichern" onClick={inReiseSpeichern}
                  style={{ width: "100%", marginTop: 8, background: T.primaer, color: T.primaerText, fontWeight: 700 }}>
                  ✓ In meine Schrift-Reise legen{schonHeute ? "" : " (🪙 +1)"}
                </button>
              </>
            )}
          </div>
        ) : (
          <>
            {schonHeute && (
              <p data-test="schrift-heute-fertig" style={{ margin: "0 0 8px", color: T.ok, fontWeight: 700 }}>
                🎉 Heute schon geschrieben! Noch ein Foto geht – Münze gab es schon.
              </p>
            )}
            <label data-test="schrift-foto-label" style={{
              display: "block", textAlign: "center", background: T.primaer, color: T.primaerText,
              fontWeight: 700, borderRadius: T.radiusKlein, padding: "14px 12px", cursor: "pointer",
            }}>
              📸 Foto von meinem Blatt machen
              <input data-test="schrift-foto" type="file" accept="image/*" capture="environment"
                style={{ display: "none" }}
                onChange={(e) => { fotoPruefen(e.target.files?.[0]); e.target.value = ""; }} />
            </label>
          </>
        )}
      </div>

      {reise.length > 0 && (
        <div style={karte} data-test="schrift-reise">
          <b>🛤️ Deine Schrift-Reise</b> <span style={{ color: T.textLeise }}>({reise.length} {reise.length === 1 ? "Blatt" : "Blätter"})</span>
          {reise.length >= 2 && erster.thumb && letzter.thumb && (
            <div style={{ display: "flex", gap: 10, margin: "10px 0 4px", alignItems: "flex-end" }}>
              <div style={{ textAlign: "center" }}>
                <img src={erster.thumb} alt="" style={{ width: 110, borderRadius: T.radiusKlein, display: "block" }} />
                <span style={{ fontSize: "var(--schrift-klein)", color: T.textLeise }}>Anfang</span>
              </div>
              <div style={{ fontSize: 26 }}>➡️</div>
              <div style={{ textAlign: "center" }}>
                <img src={letzter.thumb} alt="" style={{ width: 110, borderRadius: T.radiusKlein, display: "block" }} />
                <span style={{ fontSize: "var(--schrift-klein)", color: T.textLeise }}>Heute</span>
              </div>
              <p style={{ margin: 0, fontSize: "var(--schrift-klein)", color: T.textLeise }}>
                Siehst du den Unterschied? Jedes Blatt macht dich besser! 💪
              </p>
            </div>
          )}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
            {[...reise].reverse().map((e) => (
              <button key={e.tag} data-test="reise-blatt" onClick={() => setAnzeige(e)}
                style={{ textAlign: "center", background: "transparent", padding: 0, minHeight: 0, height: "auto", display: "block" }}>
                {e.thumb
                  ? <img src={e.thumb} alt="" style={{ width: 72, borderRadius: T.radiusKlein, display: "block" }} />
                  : <div style={{ width: 72, height: 50, background: T.grund, borderRadius: T.radiusKlein, fontSize: 24, lineHeight: "50px" }}>📝</div>}
                <span style={{ fontSize: "var(--schrift-klein)", color: T.textLeise }}>
                  {e.tag.slice(8)}.{e.tag.slice(5, 7)}.{e.buchstabe ? ` · ${e.buchstabe}` : ""}
                </span>
              </button>
            ))}
          </div>
          <p style={{ margin: "8px 0 0", color: T.textLeise, fontSize: "var(--schrift-klein)" }}>
            👆 Tipp auf ein Blatt, um es groß anzusehen.
          </p>
        </div>
      )}

      {anzeige && (
        <div data-test="blatt-anzeige" onClick={() => setAnzeige(null)} style={{
          position: "fixed", inset: 0, zIndex: 900, background: "rgba(38, 50, 72, 0.94)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: 18,
        }}>
          <div onClick={(ev) => ev.stopPropagation()} style={{ maxWidth: 560, width: "100%", textAlign: "center", background: T.karte, borderRadius: T.radius, padding: T.abstand }}>
            <p style={{ margin: "0 0 8px", fontWeight: 700 }}>
              📝 {anzeige.tag.slice(8)}.{anzeige.tag.slice(5, 7)}.{anzeige.tag.slice(0, 4)}
              {anzeige.buchstabe ? ` · Übe-Buchstabe „${anzeige.buchstabe}“` : ""}
            </p>
            {(anzeige.gross || anzeige.thumb)
              ? <img src={anzeige.gross || anzeige.thumb} alt="" style={{ maxWidth: "100%", maxHeight: "60vh", borderRadius: T.radiusKlein }} />
              : <div style={{ fontSize: 56 }}>📝</div>}
            {anzeige.satz && (
              <p style={{ margin: "8px 0 0", color: T.textLeise, fontSize: "var(--schrift-klein)" }}>„{anzeige.satz}“</p>
            )}
            <button data-test="blatt-zu" onClick={() => setAnzeige(null)}
              style={{ width: "100%", marginTop: 10, background: T.primaer, color: T.primaerText, fontWeight: 700 }}>
              ✓ Zurück
            </button>
          </div>
        </div>
      )}

      <button data-test="schrift-zurueck" onClick={() => navTo("start")}
        style={{ background: "transparent", color: T.textLeise, fontSize: "var(--schrift-klein)" }}>
        ← Zurück zur Startseite
      </button>
    </div>
  );
}
