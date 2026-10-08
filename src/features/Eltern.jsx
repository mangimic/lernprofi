import { useEffect, useRef, useState } from "react";
import { useApp } from "../appContext.jsx";
import { heutigerTag, lernspur } from "../calc/lerntage.js";
import { ZEIT_STUFEN, SPIELE_SCHALTER, spielAktiv, zeitHeute, GESPRAECH_BEREICHE, gespraechDesTages } from "../calc/elternWerkzeuge.js";
import { PAUSEN_INTERVALLE, TAGESFORM_MODI } from "../calc/tagesform.js";
import { idbStorage } from "../idbShim.js";
import { syncStatus, hochladen, herunterladen, konfliktUeberschreiben } from "../sync.js";
import { kiStatus, kiDeckelSetzen } from "../ki.js";

/* Elternbereich (eigener Tab, nur nach Entsperren mit dem Eltern-Passwort):
   Profil · Tagesziel · Stufen-Steuerung · neutrale Lern-Übersicht ·
   Backup/Import (inkl. Alt-App-Übernahme mit Bericht) · PIN · Sperren. */

const STUFEN_FELDER = [
  { key: "subj", name: "🔎 Subjekte" }, { key: "praed", name: "🧲 Prädikate" },
  { key: "rede", name: "💬 Wörtliche Rede" }, { key: "zeit", name: "⏳ Zeitformen" },
  { key: "wa", name: "🏷️ Wortarten" }, { key: "faelle", name: "🎯 Die 4 Fälle" },
  { key: "gk", name: "🔠 Groß & Klein" }, { key: "gws", name: "📖 Grundwortschatz" },
  { key: "gesch", name: "📚 Geschichten-Werkstatt" }, { key: "dd", name: "🔤 das oder dass?" },
  { key: "doppel", name: "🔡 Doppelte Mitlaute" },
  { key: "mrechnen", name: "🧮 Rechnen" }, { key: "mzahlen", name: "🔢 Zahlen-Profi" },
  { key: "mgeo", name: "📐 Formen & Flächen" }, { key: "mgroessen", name: "⏰ Größen" },
  { key: "mdaten", name: "🎲 Daten & Zufall" },
  { key: "sstrom", name: "⚡ Strom & Energie" }, { key: "srad", name: "🚲 Radfahrprüfung" },
  { key: "skarte", name: "🗺️ Karten & BW" }, { key: "sgemeinde", name: "🏛️ Gemeinde" },
  { key: "skoerper", name: "🫀 Körper" }, { key: "szeit", name: "🕰️ Zeit & Geschichte" },
  { key: "stark", name: "💪 Stark mit Leo" },
];

function Karte({ children, test }) {
  const { T } = useApp();
  return (
    <div data-test={test} style={{ background: T.karte, borderRadius: T.radius, padding: T.abstand, marginBottom: T.abstand }}>
      {children}
    </div>
  );
}

function Seg({ werte, aktiv, auf, test }) {
  const { T } = useApp();
  return (
    <div style={{ display: "flex", gap: 6 }}>
      {werte.map((w) => (
        <button key={w.v} data-test={test ? `${test}-${w.v}` : undefined} onClick={() => auf(w.v)}
          style={{
            flex: 1, fontWeight: 700, minHeight: 40,
            background: aktiv === w.v ? T.primaer : T.weich,
            color: aktiv === w.v ? T.primaerText : T.text,
          }}>
          {w.label}
        </button>
      ))}
    </div>
  );
}

export default function Eltern() {
  const { data, logChange, T, tresor, heute } = useApp();
  const datei = useRef(null);
  const [meldung, setMeldung] = useState("");
  const [bericht, setBericht] = useState(null);
  const [pinNeu, setPinNeu] = useState({ pw: "", pin: "" });

  const feld = {
    width: "100%", minHeight: "var(--touch)", fontSize: "var(--schrift)",
    borderRadius: "var(--radius-klein)", border: "1px solid var(--rand)",
    padding: "0 12px", marginBottom: 8, background: "var(--grund)", color: "var(--text)",
    boxSizing: "border-box",
  };

  const einstellung = (aenderung, text) =>
    logChange({ ...data, einstellungen: { ...data.einstellungen, ...aenderung } }, "einstellungen", "geaendert", text);

  const vorgabe = data.einstellungen.stufenVorgabe;
  const feldVorgabe = (key, v) => {
    const felder = { ...vorgabe.felder };
    if (v === 0) delete felder[key]; else felder[key] = v;
    einstellung({ stufenVorgabe: { ...vorgabe, felder } }, `Stufe für ${key} ${v === 0 ? "wieder automatisch" : "fest auf " + v}`);
  };

  const exportieren = () => {
    try {
      const blob = new Blob([tresor.exportJson()], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `lernprofi-backup-${heute}.json`;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
      setMeldung("💾 Backup gespeichert (Download-Ordner).");
    } catch { setMeldung("Export hat nicht geklappt – bitte noch einmal."); }
  };

  const importieren = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const leser = new FileReader();
    leser.onload = () => {
      try {
        const b = tresor.importJson(String(leser.result));
        setBericht(b);
        setMeldung("✅ Lernstand übernommen – Bericht siehe unten.");
      } catch { setMeldung("Die Datei konnte nicht gelesen werden."); setBericht(null); }
    };
    leser.readAsText(f);
    e.target.value = "";
  };

  const pinAendern = async () => {
    try {
      await tresor.pinAendern(pinNeu.pw, pinNeu.pin);
      setPinNeu({ pw: "", pin: "" });
      setMeldung("✅ Neue Lern-PIN gespeichert.");
    } catch (fehler) { setMeldung(fehler?.message || "Das hat nicht geklappt."); }
  };

  const tage = (data.lernstand.lerntage || []).slice(-14).reverse();
  const spur = lernspur(data.lernstand.lerntage, heute);
  const tagHeute = heutigerTag(data.lernstand.lerntage, heute);

  // ☁️ Geräte-Abgleich
  const [sync, setSync] = useState(null);           // Status von /api/meta
  const [syncMeldung, setSyncMeldung] = useState("");
  const [frage, setFrage] = useState(null);         // "laden" | {typ:"konflikt", serverRev}
  useEffect(() => { syncStatus().then(setSync); }, []);

  // 🤖 KI-Status (Deckel, Verbrauch)
  const [ki, setKi] = useState(null);
  useEffect(() => { kiStatus().then(setKi); }, []);
  const syncAktion = async (arbeit, erfolgsText) => {
    setSyncMeldung("⏳ Einen Moment …"); setFrage(null);
    const erg = await arbeit();
    if (erg.ok) { setSyncMeldung(erfolgsText(erg)); setSync(await syncStatus()); return erg; }
    if (erg.grund === "konflikt") { setFrage({ typ: "konflikt", serverRev: erg.serverRev }); setSyncMeldung(""); }
    else if (erg.grund === "lokal-leer") setSyncMeldung("Auf diesem Gerät ist noch kein Tresor gespeichert.");
    else if (erg.grund === "server-leer") setSyncMeldung("Auf dem Server liegt noch kein Stand – erst einmal hochladen.");
    else setSyncMeldung("Das hat nicht geklappt – bitte später noch einmal.");
    return erg;
  };
  const ladenBestaetigt = async () => {
    const erg = await syncAktion(() => herunterladen(idbStorage), () => "✅ Server-Stand übernommen – die App startet neu …");
    if (erg.ok) setTimeout(() => window.location.reload(), 900);
  };

  return (
    <div data-test="eltern-karte">
      <h2>🔧 Elternbereich</h2>

      <Karte test="eltern-profil">
        <b>👤 Profil</b>
        <p style={{ margin: "4px 0 8px", color: T.textLeise, fontSize: "var(--schrift-klein)" }}>
          Der Name bleibt verschlüsselt auf dem Gerät.
        </p>
        <input data-test="profil-name" style={feld} placeholder="Vorname (freiwillig)" value={data.profil.name}
          onChange={(e) => logChange({ ...data, profil: { ...data.profil, name: e.target.value } }, "profil", "geaendert", "Name angepasst")} />
      </Karte>

      <Karte test="eltern-ziel">
        <b>🎯 Tagesziel</b>
        <p style={{ margin: "4px 0 8px", color: T.textLeise, fontSize: "var(--schrift-klein)" }}>
          So viele Mini-Missionen (je 4 Aufgaben) füllen die Lernspur.
        </p>
        <Seg test="ziel" werte={[2, 3, 4, 5, 6].map((v) => ({ v, label: String(v) }))}
          aktiv={data.einstellungen.missionsZiel}
          auf={(v) => einstellung({ missionsZiel: v }, `Tagesziel auf ${v} Missionen`)} />
      </Karte>

      <Karte test="eltern-stufen">
        <b>🎚️ Stufen steuern</b>
        <p style={{ margin: "4px 0 8px", color: T.textLeise, fontSize: "var(--schrift-klein)" }}>
          <b>Auto</b> = Stufen werden durchs Üben freigeschaltet · <b>1–3</b> = fest.
          Die Vorgabe je Lernfeld schlägt die globale.
        </p>
        <Seg test="stufe-global" werte={[{ v: 0, label: "Auto" }, { v: 1, label: "1" }, { v: 2, label: "2" }, { v: 3, label: "3" }]}
          aktiv={vorgabe.global}
          auf={(v) => einstellung({ stufenVorgabe: { ...vorgabe, global: v } }, `Globale Stufe: ${v === 0 ? "automatisch" : v}`)} />
        <details style={{ marginTop: 8 }}>
          <summary style={{ cursor: "pointer", color: T.textLeise }}>Je Lernfeld einstellen</summary>
          {STUFEN_FELDER.map((f) => (
            <div key={f.key} style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
              <span style={{ flex: 1, fontSize: "var(--schrift-klein)" }}>{f.name}</span>
              <div style={{ flex: 1 }}>
                <Seg werte={[{ v: 0, label: "Auto" }, { v: 1, label: "1" }, { v: 2, label: "2" }, { v: 3, label: "3" }]}
                  aktiv={vorgabe.felder[f.key] || 0} auf={(v) => feldVorgabe(f.key, v)} />
              </div>
            </div>
          ))}
        </details>
      </Karte>

      <Karte test="eltern-uebersicht">
        <b>📈 Lern-Übersicht</b>
        <p style={{ margin: "4px 0 8px", color: T.textLeise, fontSize: "var(--schrift-klein)" }}>
          Nur Zahlen, keine Bewertung. Heute: {tagHeute.missionen} Mission{tagHeute.missionen === 1 ? "" : "en"}
          {tagHeute.zielErreicht ? " · 🎯 Ziel erreicht" : ""}{spur > 0 ? ` · 🛤️ Lernspur ${spur} Tag${spur === 1 ? "" : "e"}` : ""}
          {" · 🪙 "}{data.lernstand.muenzen} Münzen
        </p>
        {tage.length ? (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--schrift-klein)" }}>
            <thead><tr style={{ textAlign: "left", color: T.textLeise }}><th>Tag</th><th>Tagesform</th><th style={{ textAlign: "center" }}>Aufgaben</th><th style={{ textAlign: "center" }}>Missionen</th><th style={{ textAlign: "center" }}>Ziel</th></tr></thead>
            <tbody>
              {tage.map((t) => (
                <tr key={t.tag}><td>{t.tag}</td><td>{TAGESFORM_MODI[t.form] || "–"}</td><td style={{ textAlign: "center" }}>{t.aufgaben}</td><td style={{ textAlign: "center" }}>{t.missionen}</td><td style={{ textAlign: "center" }}>{t.zielErreicht ? "🎯" : "–"}</td></tr>
              ))}
            </tbody>
          </table>
        ) : <p style={{ color: T.textLeise }}>Noch keine Lerntage – die Übersicht füllt sich beim Üben.</p>}
      </Karte>

      <Karte test="eltern-lernen">
        <b>🧭 Lernen</b>
        <p style={{ margin: "4px 0 8px", color: T.textLeise, fontSize: "var(--schrift-klein)" }}>
          <b>🚦 Tagesform-Frage:</b> Beim ersten Üben des Tages fragt Leo, wie sich Lernen heute
          anfühlt. An schweren Tagen werden die Mini-Missionen kürzer (3 statt 4 Aufgaben), das
          Tagesziel kleiner und die Stufen steigen nicht – die Antwort gilt nur für den einen Tag
          und ist keine Bewertung.
        </p>
        <Seg test="tagesform-aktiv" werte={[{ v: 1, label: "An" }, { v: 0, label: "Aus" }]}
          aktiv={data.einstellungen.tagesformAktiv ? 1 : 0}
          auf={(v) => einstellung({ tagesformAktiv: v === 1 }, `Tagesform-Frage ${v === 1 ? "an" : "aus"}`)} />
        <p style={{ margin: "14px 0 8px" }}><b>🤸 Bewegungspausen</b></p>
        <p style={{ margin: "0 0 8px", color: T.textLeise, fontSize: "var(--schrift-klein)" }}>
          Nach dieser Fokuszeit schlägt Leo eine kurze Bewegungspause vor – das beste Mittel gegen
          Aufmerksamkeits-Ermüdung. Die Pausenzeit zählt nicht als Lernzeit.
        </p>
        <Seg test="pausen-aktiv" werte={[{ v: 1, label: "An" }, { v: 0, label: "Aus" }]}
          aktiv={data.einstellungen.pausenAktiv ? 1 : 0}
          auf={(v) => einstellung({ pausenAktiv: v === 1 }, `Bewegungspausen ${v === 1 ? "an" : "aus"}`)} />
        {data.einstellungen.pausenAktiv && (
          <div style={{ marginTop: 8 }}>
            <Seg test="pausen-intervall" werte={PAUSEN_INTERVALLE.map((v) => ({ v, label: `${v} Min` }))}
              aktiv={data.einstellungen.pausenIntervall}
              auf={(v) => einstellung({ pausenIntervall: v }, `Bewegungspause alle ${v} Minuten`)} />
          </div>
        )}
        <p data-test="fokus-rekord" style={{ margin: "12px 0 0", color: T.textLeise, fontSize: "var(--schrift-klein)" }}>
          🔥 Fokus-Serien-Rekord: <b>{data.lernstand.fokusRekord}</b> gelöste Aufgaben am Stück
          (Abstand unter 90 Sekunden) – Dranbleiben zählt, nicht nur Richtigkeit.
        </p>
      </Karte>

      <Karte test="eltern-spiele">
        <b>🎮 Spiele & Lernzeit</b>
        <p style={{ margin: "4px 0 8px", color: T.textLeise, fontSize: "var(--schrift-klein)" }}>
          Deaktivierte Spiele verschwinden aus der Spielhalle – die Lernfelder bleiben immer verfügbar.
        </p>
        {SPIELE_SCHALTER.map((s) => (
          <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
            <span style={{ flex: 1, fontSize: "var(--schrift-klein)" }}>{s.name}</span>
            <div style={{ flex: 1 }}>
              <Seg test={`spiel-an-${s.id}`} werte={[{ v: 1, label: "An" }, { v: 0, label: "Aus" }]}
                aktiv={spielAktiv(data.einstellungen, s.id) ? 1 : 0}
                auf={(v) => einstellung(
                  { spieleAktiv: { ...data.einstellungen.spieleAktiv, [s.id]: v === 1 } },
                  `${s.name} ${v === 1 ? "eingeschaltet" : "ausgeblendet"}`,
                )} />
            </div>
          </div>
        ))}
        <p style={{ margin: "14px 0 8px" }}><b>🪙 Spiele freischalten (erst üben, dann spielen)</b></p>
        <p style={{ margin: "0 0 8px", color: T.textLeise, fontSize: "var(--schrift-klein)" }}>
          Ist die Freischaltung an, kostet jeder Spielbesuch <b>1 Münze</b> – verdient pro Übungsrunde.
        </p>
        <Seg test="muenzen-aktiv" werte={[{ v: 1, label: "An" }, { v: 0, label: "Aus" }]}
          aktiv={data.einstellungen.muenzenAktiv ? 1 : 0}
          auf={(v) => einstellung({ muenzenAktiv: v === 1 }, `Münz-Freischaltung ${v === 1 ? "an" : "aus"}`)} />
        <button data-test="muenz-geschenk" style={{ width: "100%", marginTop: 8, background: T.weich, color: T.text, fontWeight: 700 }}
          onClick={() => logChange(
            { ...data, lernstand: { ...data.lernstand, muenzen: data.lernstand.muenzen + 3 } },
            "spiele", "geaendert", "3 Münzen geschenkt",
          )}>
          🎁 3 Münzen schenken (jetzt {data.lernstand.muenzen})
        </button>
        <p style={{ margin: "14px 0 8px" }}><b>⏰ Lernzeit pro Tag (Time-Boxing)</b></p>
        <p style={{ margin: "0 0 8px", color: T.textLeise, fontSize: "var(--schrift-klein)" }}>
          Ist die Zeit um, zeigt die App einen freundlichen Stopp-Bildschirm. Gezählt wird nur,
          solange die App sichtbar ist. Empfohlen: <b>20 Minuten</b>.
        </p>
        <Seg test="zeit-limit" werte={ZEIT_STUFEN.map((v) => ({ v, label: v === 0 ? "Aus" : `${v}` }))}
          aktiv={data.einstellungen.zeitLimit}
          auf={(v) => einstellung({ zeitLimit: v }, `Tageslimit: ${v === 0 ? "aus" : v + " Minuten"}`)} />
        <p data-test="zeit-verbraucht" style={{ margin: "8px 0", color: T.textLeise, fontSize: "var(--schrift-klein)" }}>
          Heute verbraucht: <b>{Math.floor(zeitHeute(data.lernstand.zeit, heute).sek / 60)} Min</b>
          {data.einstellungen.zeitLimit > 0 ? ` von ${data.einstellungen.zeitLimit} Min` : ""}.
        </p>
        <button data-test="zeit-frei" style={{ width: "100%", background: T.weich, color: T.text, fontWeight: 700 }}
          onClick={() => logChange(
            { ...data, lernstand: { ...data.lernstand, zeit: { tag: heute, sek: 0 } } },
            "einstellungen", "geaendert", "Lernzeit für heute wieder freigegeben",
          )}>
          🔓 Heute wieder freigeben (Zähler auf 0)
        </button>
      </Karte>

      <Karte test="eltern-gespraech">
        <b>💬 Gesprächsimpulse</b>
        <p style={{ margin: "4px 0 8px", color: T.textLeise, fontSize: "var(--schrift-klein)" }}>
          Das sind keine Tests, sondern <b>Tür-Öffner</b> – Gespräche, die prägen, lange bevor es
          darauf ankommt. Sie passen gut zu dem, was Ihr Kind in „💪 Stark mit Leo“ übt.
        </p>
        <p data-test="gespraech-tages" style={{ background: T.grund, borderRadius: T.radiusKlein, padding: "10px 12px" }}>
          🌟 <b>Frage des Tages</b> ({gespraechDesTages(heute).bereich}):<br />„{gespraechDesTages(heute).frage}“
        </p>
        <p style={{ background: T.grund, borderRadius: T.radiusKlein, padding: "10px 12px", fontSize: "var(--schrift-klein)" }}>
          💡 <b>So klappt es am besten:</b> nebenbei fragen (Auto, Abendessen, Zähneputzen) statt im
          Verhör-Modus · selbst zuerst etwas Eigenes erzählen · Antworten stehen lassen, nicht sofort
          verbessern oder trösten · eine Frage pro Tag reicht völlig.
        </p>
        {GESPRAECH_BEREICHE.map((b) => (
          <details key={b.titel} data-test="gespraech-bereich" style={{ marginTop: 6 }}>
            <summary style={{ cursor: "pointer", fontWeight: 700 }}>{b.emoji} {b.titel}</summary>
            <ol style={{ margin: "6px 0 6px 18px", padding: 0 }}>
              {b.fragen.map((f, i) => <li key={i} style={{ marginBottom: 8 }}>{f}</li>)}
            </ol>
          </details>
        ))}
        <p style={{ marginTop: 8, color: T.textLeise, fontSize: "12.5px" }}>
          Alles bleibt im verschlüsselten Tresor – die App speichert keine Antworten. Die Fragen sind
          an eine Coaching-Fragensammlung angelehnt und für 8–10 Jahre übersetzt.
        </p>
      </Karte>

      <Karte test="eltern-ki">
        <b>🤖 KI-Funktionen</b>
        <p style={{ margin: "4px 0 8px", color: T.textLeise, fontSize: "var(--schrift-klein)" }}>
          Jede Funktion einzeln freigeben (Standard: aus). Der Kostendeckel wird vom Server hart
          durchgesetzt; der Schlüssel liegt nur dort. Antworten sind immer kurz: höchstens 2 Blasen,
          eine Mach-Aufgabe – kein Lesestoff.
        </p>
        {[
          { key: "erklaeren", name: "🦁 „Erklär es mir anders“ (nach Fehlversuchen)", da: true },
          { key: "schrift", name: "🖐️ Schreib-Training (Foto)", da: false },
          { key: "aufsatz", name: "✍️ Aufsatz-Feedback", da: false },
          { key: "bericht", name: "📊 Wochenbericht", da: false },
          { key: "saetze", name: "🔤 Persönliche Übungssätze", da: false },
        ].map((f) => (
          <div key={f.key} style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6, opacity: f.da ? 1 : 0.55 }}>
            <span style={{ flex: 1, fontSize: "var(--schrift-klein)" }}>{f.name}{f.da ? "" : " · kommt als Nächstes"}</span>
            <div style={{ flex: "0 0 128px" }}>
              {f.da ? (
                <Seg test={`ki-${f.key}`} werte={[{ v: 1, label: "An" }, { v: 0, label: "Aus" }]}
                  aktiv={data.einstellungen.ki[f.key] ? 1 : 0}
                  auf={(v) => einstellung({ ki: { ...data.einstellungen.ki, [f.key]: v === 1 } }, `KI „${f.key}“ ${v === 1 ? "freigegeben" : "ausgeschaltet"}`)} />
              ) : (
                <span style={{ fontSize: "var(--schrift-klein)", color: T.textLeise }}>bald</span>
              )}
            </div>
          </div>
        ))}
        <div style={{ marginTop: 12 }}>
          {ki === null ? (
            <p style={{ color: T.textLeise, fontSize: "var(--schrift-klein)" }}>Prüfe KI-Server …</p>
          ) : !ki.verfuegbar ? (
            <p data-test="ki-meldung" style={{ color: T.textLeise, fontSize: "var(--schrift-klein)" }}>
              {ki.grund === "kein-schluessel" ? "⚠️ Der Worker findet den API-Schlüssel nicht. Er muss als Secret (nicht Text!) unter dem Namen „lernprofiapi“ in den Worker-Settings → Variables and Secrets liegen – Anleitung: docs/DEPLOY-CLOUDFLARE.md."
                : ki.grund === "kein-kv" ? "⚠️ Der KV-Namespace fehlt noch (gleicher Schritt wie beim Geräte-Abgleich) – docs/DEPLOY-CLOUDFLARE.md."
                : ki.grund === "kein-zugang" ? "⚠️ Cloudflare Access hat die Anfrage nicht freigegeben – bitte neu anmelden."
                : "Gerade keine Verbindung zum Server – die Schalter wirken, sobald er erreichbar ist."}
            </p>
          ) : (
            <>
              <p style={{ margin: "0 0 4px", fontSize: "var(--schrift-klein)" }}><b>Monatsdeckel</b></p>
              <Seg test="ki-deckel" werte={[300, 500, 1000].filter((v) => v <= (ki.maxDeckelCent || 1000)).map((v) => ({ v, label: `${v / 100} €` }))}
                aktiv={ki.deckelCent}
                auf={async (v) => { const e = await kiDeckelSetzen(v); if (e.ok) setKi({ ...ki, deckelCent: e.deckelCent }); }} />
              <p data-test="ki-verbrauch" style={{ margin: "10px 0 4px", color: T.textLeise, fontSize: "var(--schrift-klein)" }}>
                {ki.monat}: <b>{(ki.verbrauchtCent / 100).toFixed(2).replace(".", ",")} €</b> von {(ki.deckelCent / 100).toFixed(2).replace(".", ",")} € verbraucht
                {ki.verbrauchtCent >= ki.deckelCent * 0.8 ? " · ⚠️ Deckel fast erreicht" : ""}
              </p>
              <div style={{ height: 10, background: T.weich, borderRadius: 5, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${Math.min(100, (ki.verbrauchtCent / ki.deckelCent) * 100)}%`, background: ki.verbrauchtCent >= ki.deckelCent * 0.8 ? "var(--warn)" : "var(--ok)" }} />
              </div>
              {ki.posten?.length > 0 && (
                <p style={{ margin: "8px 0 0", color: T.textLeise, fontSize: "12.5px" }}>
                  Zuletzt: {ki.posten.slice(0, 4).map((p2) => `${p2.zweck} (${String(p2.cent).replace(".", ",")} ct)`).join(" · ")}
                </p>
              )}
            </>
          )}
        </div>
      </Karte>

      <Karte test="eltern-sync">
        <b>☁️ Geräte-Abgleich</b>
        <p style={{ margin: "4px 0 10px", color: T.textLeise, fontSize: "var(--schrift-klein)" }}>
          {sync === null ? "Prüfe Verbindung …"
            : sync.verfuegbar ? <>Verbunden · Server-Stand Rev. {sync.rev}{sync.aktualisiert ? ` vom ${new Date(sync.aktualisiert).toLocaleString("de-DE")}` : " (noch leer)"}. Es wandern nur verschlüsselte Daten – der Server kann nichts lesen.</>
            : sync.grund === "nicht-eingerichtet" ? "Der Sync-Speicher (KV) ist noch nicht eingerichtet – Anleitung: docs/DEPLOY-CLOUDFLARE.md."
            : sync.grund === "kein-zugang" ? "Cloudflare Access hat diese Anfrage nicht freigegeben – bitte einmal neu anmelden."
            : "Gerade keine Verbindung zum Server (offline?)."}
        </p>
        {sync?.verfuegbar && !frage && (
          <>
            <button data-test="sync-hoch" style={{ width: "100%", background: T.weich, color: T.text, fontWeight: 700, marginBottom: 8 }}
              onClick={() => syncAktion(() => hochladen(idbStorage), (e) => `✅ Auf dem Server gesichert (Rev. ${e.rev}).`)}>
              ⬆️ Diesen Stand auf den Server sichern
            </button>
            <button data-test="sync-runter" style={{ width: "100%", background: T.weich, color: T.text, fontWeight: 700, marginBottom: 8 }}
              onClick={() => setFrage("laden")}>
              ⬇️ Server-Stand auf dieses Gerät holen
            </button>
          </>
        )}
        {frage === "laden" && (
          <div data-test="sync-frage" style={{ background: T.grund, borderRadius: T.radiusKlein, padding: 10, marginBottom: 8 }}>
            <p style={{ margin: "0 0 8px" }}>⚠️ Das <b>ersetzt</b> den Stand auf diesem Gerät durch den Server-Stand. Fortfahren?</p>
            <button data-test="sync-laden-ja" onClick={ladenBestaetigt} style={{ width: "100%", background: T.primaer, color: T.primaerText, fontWeight: 700, marginBottom: 6 }}>Ja, Server-Stand übernehmen</button>
            <button onClick={() => setFrage(null)} style={{ width: "100%", background: T.weich, color: T.text }}>Abbrechen</button>
          </div>
        )}
        {frage?.typ === "konflikt" && (
          <div data-test="sync-konflikt" style={{ background: T.grund, borderRadius: T.radiusKlein, padding: 10, marginBottom: 8 }}>
            <p style={{ margin: "0 0 8px" }}>⚠️ Auf dem Server liegt ein <b>neuerer Stand</b> (von einem anderen Gerät). Nichts wurde überschrieben. Was soll gelten?</p>
            <button onClick={ladenBestaetigt} style={{ width: "100%", background: T.primaer, color: T.primaerText, fontWeight: 700, marginBottom: 6 }}>⬇️ Server-Stand übernehmen (empfohlen)</button>
            <button onClick={() => syncAktion(() => konfliktUeberschreiben(idbStorage, frage.serverRev), (e) => `✅ Server überschrieben (Rev. ${e.rev}).`)}
              style={{ width: "100%", background: T.weich, color: T.text, marginBottom: 6 }}>⬆️ Trotzdem diesen Stand hochladen</button>
            <button onClick={() => setFrage(null)} style={{ width: "100%", background: T.weich, color: T.text }}>Abbrechen</button>
          </div>
        )}
        {syncMeldung && <p data-test="sync-meldung" style={{ color: T.ok, fontSize: "var(--schrift-klein)" }}>{syncMeldung}</p>}
      </Karte>

      <Karte test="eltern-daten">
        <b>💾 Daten</b>
        <p style={{ margin: "4px 0 10px", color: T.textLeise, fontSize: "var(--schrift-klein)" }}>
          Backup regelmäßig sichern – es gibt keine Passwort-Wiederherstellung.
          Der Import versteht auch den „Lernstand sichern“-Export der bisherigen App.
        </p>
        <button data-test="export-knopf" onClick={exportieren}
          style={{ width: "100%", background: T.weich, color: T.text, fontWeight: 700, marginBottom: 8 }}>
          💾 Backup als Datei sichern
        </button>
        <button data-test="import-knopf" onClick={() => datei.current?.click()}
          style={{ width: "100%", background: T.weich, color: T.text, fontWeight: 700, marginBottom: 8 }}>
          📥 Lernstand aus Datei übernehmen (auch Alt-App)
        </button>
        <input ref={datei} type="file" accept="application/json,.json" hidden onChange={importieren} />
        {bericht && (
          <div data-test="import-bericht" style={{ background: T.grund, borderRadius: T.radiusKlein, padding: 10, fontSize: "var(--schrift-klein)" }}>
            <b>Übernahme-Bericht:</b>
            <ul style={{ margin: "6px 0 0", paddingLeft: 18 }}>
              {bericht.map((b, i) => (
                <li key={i}>{b.status === "übernommen" ? "✅" : "🗑️"} <b>{b.feld}</b>{b.detail ? ` – ${b.detail}` : ""}</li>
              ))}
            </ul>
          </div>
        )}
        <details style={{ margin: "8px 0" }}>
          <summary style={{ cursor: "pointer", color: T.textLeise }}>🔑 Lern-PIN ändern</summary>
          <div style={{ marginTop: 8 }}>
            <input data-test="pin-neu-pw" type="password" placeholder="Eltern-Passwort" style={feld}
              value={pinNeu.pw} onChange={(e) => setPinNeu({ ...pinNeu, pw: e.target.value })} />
            <input data-test="pin-neu-pin" type="password" inputMode="numeric" maxLength={4}
              placeholder="Neue Lern-PIN (4 Ziffern)" style={feld}
              value={pinNeu.pin} onChange={(e) => setPinNeu({ ...pinNeu, pin: e.target.value.replace(/\D/g, "") })} />
            <button data-test="pin-neu-ok" onClick={pinAendern}
              style={{ width: "100%", background: T.weich, color: T.text, fontWeight: 700 }}>
              Speichern
            </button>
          </div>
        </details>
        {meldung && <p data-test="eltern-meldung" style={{ color: T.ok, fontSize: "var(--schrift-klein)" }}>{meldung}</p>}
        <button data-test="sperren-knopf" onClick={tresor.sperren}
          style={{ width: "100%", background: "transparent", color: T.textLeise, fontSize: "var(--schrift-klein)" }}>
          🔒 Tresor sperren
        </button>
      </Karte>
    </div>
  );
}
