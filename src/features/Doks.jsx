import { useRef, useState } from "react";
import { useApp } from "../appContext.jsx";
import {
  DOK_KATEGORIEN, DOK_MAX_DATEI, dokKategorieName, dokId, dokGroesseText,
  dokHochladen, dokHolen, dokLoeschen, dokAnzeigen,
} from "../doks.js";

/* 📂 UNTERLAGEN: verschlüsselte Dokumenten-Ablage für die Familie.
   Eltern laden hoch (PDF, Bilder) und löschen; das Kind sieht die
   Liste und öffnet alles mit einem Tipp. Dateien liegen NUR als
   Tresor-Chiffrat auf dem Server (Zero-Knowledge wie der Lernstand),
   die Liste selbst ist Teil des Tresors und synct automatisch. */

export default function Doks() {
  const { data, logChange, T, heute, tresor, navTo } = useApp();
  const datei = useRef(null);
  const [kategorie, setKategorie] = useState("kompass-deutsch");
  const [status, setStatus] = useState(null); // { art: "ok"|"fehler"|"laeuft", text }
  const [offenId, setOffenId] = useState(null);

  const hochladen = async () => {
    const f = datei.current?.files?.[0];
    if (!f) { setStatus({ art: "fehler", text: "Bitte zuerst eine Datei auswählen." }); return; }
    if (f.size > DOK_MAX_DATEI) { setStatus({ art: "fehler", text: "Zu groß – bitte höchstens 12 MB je Datei." }); return; }
    if (data.doks.length >= 60) { setStatus({ art: "fehler", text: "Die Ablage ist voll (60 Dokumente)." }); return; }
    setStatus({ art: "laeuft", text: "Wird verschlüsselt und hochgeladen …" });
    try {
      const bytes = new Uint8Array(await f.arrayBuffer());
      const paket = await tresor.dateiVerschluesseln(bytes);
      const id = dokId();
      await dokHochladen(id, paket);
      const eintrag = { id, name: f.name, kategorie, groesse: f.size, datum: heute };
      logChange({ ...data, doks: [eintrag, ...data.doks] }, "doks", "neu", `Dokument abgelegt: ${f.name}`);
      datei.current.value = "";
      setStatus({ art: "ok", text: `„${f.name}“ liegt verschlüsselt in der Ablage.` });
    } catch (e) {
      setStatus({ art: "fehler", text: `Das hat nicht geklappt: ${e.message}` });
    }
  };

  const oeffnen = async (d) => {
    setOffenId(d.id);
    setStatus(null);
    try {
      const paket = await dokHolen(d.id);
      const bytes = await tresor.dateiEntschluesseln(paket);
      dokAnzeigen(bytes, d.name);
    } catch (e) {
      setStatus({ art: "fehler", text: `Öffnen ging nicht: ${e.message}` });
    }
    setOffenId(null);
  };

  const loeschen = async (d) => {
    try {
      await dokLoeschen(d.id);
      logChange({ ...data, doks: data.doks.filter((x) => x.id !== d.id) }, "doks", "geloescht", `Dokument entfernt: ${d.name}`);
      setStatus({ art: "ok", text: `„${d.name}“ wurde gelöscht.` });
    } catch (e) {
      setStatus({ art: "fehler", text: `Löschen ging nicht: ${e.message}` });
    }
  };

  const karte = { background: T.karte, borderRadius: T.radius, padding: T.abstand, marginBottom: T.abstand };
  return (
    <div data-test="doks-seite">
      <div style={karte}>
        <h2 style={{ margin: "0 0 4px" }}>📂 Unsere Unterlagen</h2>
        <p style={{ margin: "0 0 10px", color: T.textLeise, fontSize: "var(--schrift-klein)" }}>
          Alles liegt verschlüsselt in eurem Tresor – nur ihr könnt es öffnen.
        </p>
        {data.doks.length === 0 && (
          <p data-test="doks-leer" style={{ color: T.textLeise }}>
            Noch keine Dokumente. {tresor.elternModus ? "Lade unten das erste hoch!" : "Mama oder Papa können welche hochladen."}
          </p>
        )}
        {data.doks.map((d) => (
          <div key={d.id} data-test="dok-zeile" style={{
            display: "flex", alignItems: "center", gap: 10, padding: "8px 10px",
            background: T.grund, borderRadius: T.radiusKlein, marginBottom: 6,
          }}>
            <span style={{ flex: 1, minWidth: 0 }}>
              <b style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.name}</b>
              <span style={{ fontSize: "var(--schrift-klein)", color: T.textLeise }}>
                {dokKategorieName(d.kategorie)} · {dokGroesseText(d.groesse)}{d.datum ? ` · ${d.datum}` : ""}
              </span>
            </span>
            <button data-test={`dok-oeffnen-${d.id}`} onClick={() => oeffnen(d)} disabled={offenId === d.id}
              style={{ background: T.primaer, color: T.primaerText, fontWeight: 700 }}>
              {offenId === d.id ? "…" : "📖 Öffnen"}
            </button>
            {tresor.elternModus && (
              <button data-test={`dok-weg-${d.id}`} onClick={() => loeschen(d)} aria-label={`${d.name} löschen`}
                style={{ background: T.weich, color: T.text }}>
                🗑️
              </button>
            )}
          </div>
        ))}
        {status && (
          <p data-test="doks-status" style={{
            margin: "10px 0 0", fontWeight: 700,
            color: status.art === "fehler" ? "var(--warn)" : status.art === "ok" ? T.ok : T.textLeise,
          }}>{status.text}</p>
        )}
      </div>

      {tresor.elternModus && (
        <div style={karte} data-test="doks-neu">
          <h3 style={{ margin: "0 0 8px" }}>➕ Dokument hochladen</h3>
          <div style={{ display: "grid", gap: 8 }}>
            <input data-test="dok-datei" ref={datei} type="file"
              accept=".pdf,.png,.jpg,.jpeg,.gif,.txt" style={{ fontSize: "var(--schrift-klein)" }} />
            <select data-test="dok-kategorie" value={kategorie} onChange={(e) => setKategorie(e.target.value)}
              style={{ padding: "10px 12px", borderRadius: T.radiusKlein, border: "1.5px solid var(--rand)", background: T.grund, color: T.text, fontWeight: 700 }}>
              {DOK_KATEGORIEN.map((k) => <option key={k.key} value={k.key}>{k.name}</option>)}
            </select>
            <button data-test="dok-hochladen" onClick={hochladen} disabled={status?.art === "laeuft"}
              style={{ background: T.primaer, color: T.primaerText, fontWeight: 700 }}>
              🔒 Verschlüsselt hochladen
            </button>
          </div>
          <p style={{ margin: "8px 0 0", color: T.textLeise, fontSize: "var(--schrift-klein)" }}>
            PDF oder Bild, bis 12 MB. Die Kompass-Hefte gehören in ihre 🧭-Kategorie –
            dann verlinken die Übungen sie automatisch.
          </p>
        </div>
      )}

      <button data-test="doks-zurueck" onClick={() => navTo("start")}
        style={{ background: "transparent", color: T.textLeise, fontSize: "var(--schrift-klein)" }}>
        ← Zurück zur Startseite
      </button>
    </div>
  );
}
