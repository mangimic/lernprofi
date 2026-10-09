import { useEffect, useState } from "react";
import { useApp } from "../appContext.jsx";
import { kompassTermine, kompassWochen, tageBis, PHASEN_NAMEN, KOMPASS_STANDARD, kompassUebernehmen } from "../calc/kompassPlan.js";
import { tagDatum } from "../calc/wochenplan.js";
import { MATHE_BEREICHE } from "../calc/aufgaben/mathe.js";
import { KOMPASS_DEUTSCH_BEREICHE } from "../calc/aufgaben/kompassDeutsch.js";

/* 🧭 KOMPASS-COUNTDOWN: Lernplan bis zu den Kompass-4-Tests – als
   Vorschlag und Inspiration. Jede Woche zeigt 2 Deutsch- und 2 Mathe-
   Felder als klickbare Chips (ein Tipp startet die Übung direkt).
   Beim ersten Öffnen trägt die Seite die beiden amtlichen Termine
   automatisch in den Wochenplan ein (🦁-Wächter + Morgen-Auffrischung
   greifen dann von selbst). */

const FELD_INFO = {
  gws: { emoji: "📖", name: "Grundwortschatz" },
  zeit: { emoji: "⏳", name: "Zeitformen" },
};
for (const b of KOMPASS_DEUTSCH_BEREICHE) FELD_INFO[b.key] = b;
for (const b of MATHE_BEREICHE) FELD_INFO[b.key] = b;

const MATHE_KEYS = new Set(MATHE_BEREICHE.map((b) => b.key));

export default function KompassPlan() {
  const { data, logChange, T, heute, navTo, uebenZielSetzen } = useApp();
  const termine = data.einstellungen.termine;
  const ziele = kompassTermine(termine, heute);
  const wochen = kompassWochen(heute, termine, data.lernstand.stufen);
  const montagHeute = wochen[0]?.montag;
  const [uebernommen, setUebernommen] = useState(null); // 📅 Ergebnis der Fahrplan-Übernahme

  // 📝 Einmalig: die amtlichen Termine automatisch in den Plan übernehmen.
  const fehlen = ziele.length > 0 && !ziele[0].eingetragen;
  useEffect(() => {
    if (!fehlen) return;
    let id = termine.reduce((m, t) => Math.max(m, t.id), 0);
    const neu = KOMPASS_STANDARD.filter((z) => z.tag >= heute)
      .map((z) => ({ id: ++id, tag: z.tag, art: "kompass", fach: z.fach }));
    logChange(
      { ...data, einstellungen: { ...data.einstellungen, termine: [...termine, ...neu].slice(0, 60) } },
      "wochenplan", "neu", "Kompass-Termine automatisch in den Plan übernommen",
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fehlen]);

  const datumHuebsch = (iso) => `${iso.slice(8)}.${iso.slice(5, 7)}.`;
  const uebung = (key) => (
    <button key={key} data-test={`kp-fokus-${key}`}
      onClick={() => { uebenZielSetzen(key); navTo("ueben"); }}
      style={{
        height: "auto", minHeight: 0, padding: "7px 10px", fontWeight: 700, fontSize: "var(--schrift-klein)",
        background: MATHE_KEYS.has(key) ? "color-mix(in srgb, var(--ok) 16%, var(--karte))" : T.weich,
        color: T.text, border: `1px solid ${T.rand}`,
      }}>
      {FELD_INFO[key]?.emoji} {FELD_INFO[key]?.name || key} · 10 Min
    </button>
  );

  return (
    <div data-test="kompass-seite">
      <div style={{ background: T.karte, borderRadius: T.radius, padding: T.abstand, marginBottom: T.abstand }}>
        <h2 style={{ margin: "0 0 4px" }}>🧭 Kompass-Countdown</h2>
        {ziele.length === 0 ? (
          <p style={{ margin: 0 }}>🌟 Gerade steht kein Kompass-Test an. Komm wieder, wenn es so weit ist!</p>
        ) : (
          <>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "6px 0 8px" }}>
              {ziele.map((z) => (
                <div key={z.tag} data-test="kp-ziel" style={{
                  flex: "1 1 200px", background: T.grund, borderRadius: T.radiusKlein, padding: "10px 12px",
                }}>
                  <b>{z.fach === "Deutsch" ? "📖" : "🔢"} {z.fach}</b> · {datumHuebsch(z.tag)}
                  <div style={{ fontSize: "var(--schrift-gross)", fontWeight: 800, color: T.primaer }}>
                    noch {tageBis(heute, z.tag)} Tage
                  </div>
                  <div style={{ fontSize: "var(--schrift-klein)", color: T.textLeise }}>✓ steht im Wochenplan</div>
                </div>
              ))}
            </div>
            <p style={{ margin: 0, color: T.textLeise, fontSize: "var(--schrift-klein)" }}>
              Dein Fahrplan als <b>Vorschlag</b> – kein Muss: jede Übung nur 10 Minuten, danach Pause.
              Ein Tipp auf einen Baustein startet die Übung sofort.
            </p>
            <button data-test="kp-in-plan"
              onClick={() => {
                const erg = kompassUebernehmen(data.lernstand.wochenplan, wochen, data.einstellungen.festeTermine);
                if (erg.eingeplant > 0) {
                  logChange({ ...data, lernstand: { ...data.lernstand, wochenplan: erg.doc } },
                    "wochenplan", "neu", `Kompass-Fahrplan übernommen (${erg.eingeplant} Übungen)`);
                }
                setUebernommen(erg);
              }}
              style={{ width: "100%", marginTop: 10, background: T.primaer, color: T.primaerText, fontWeight: 700 }}>
              📅 Fahrplan in meinen Wochenplan übernehmen
            </button>
            {uebernommen && (
              <p data-test="kp-in-plan-ergebnis" style={{ margin: "8px 0 0", fontWeight: 700, color: T.ok }}>
                {uebernommen.eingeplant > 0
                  ? `✅ ${uebernommen.eingeplant} Übungen eingeplant${uebernommen.ersetzt > 0 ? ` (dafür ${uebernommen.ersetzt} Freizeit-Fenster ersetzt)` : ""} – 📚 Hausaufgaben und 🥁 Schlagzeug stehen jeweils davor.`
                  : "✅ Alles schon im Plan – nichts doppelt eingeplant."}
                {uebernommen.uebersprungen > 0 ? ` ${uebernommen.uebersprungen} Übung(en) fanden keinen Platz.` : ""}
              </p>
            )}
          </>
        )}
      </div>

      {wochen.map((w) => (
        <div key={w.montag} data-test="kp-woche" style={{
          background: T.karte, borderRadius: T.radius, padding: T.abstand, marginBottom: 10,
          outline: w.montag === montagHeute ? `2px solid ${T.primaer}` : "none",
        }}>
          <b>
            KW {w.kw} · {datumHuebsch(w.montag)} – {datumHuebsch(tagDatum(w.montag, 6))}
            {w.montag === montagHeute ? " · diese Woche" : ""}
          </b>
          <p style={{ margin: "2px 0 8px", color: T.textLeise, fontSize: "var(--schrift-klein)" }}>
            {PHASEN_NAMEN[w.phase]}
          </p>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {w.deutsch.map(uebung)}
            {w.mathe.map(uebung)}
          </div>
          {w.hinweis && (
            <p data-test="kp-hinweis" style={{ margin: "8px 0 0", fontSize: "var(--schrift-klein)", fontWeight: 600 }}>
              {w.hinweis}
            </p>
          )}
        </div>
      ))}

      {ziele.length > 0 && (
        <div style={{ background: T.karte, borderRadius: T.radius, padding: T.abstand, marginBottom: T.abstand }}>
          <b>🦁 Leos Tipps für die Wochen davor</b>
          <ul style={{ margin: "6px 0 0", paddingLeft: 20, lineHeight: 1.6 }}>
            <li>Lieber <b>jeden Tag 10 Minuten</b> als einmal eine Stunde – kleine Häppchen bleiben hängen.</li>
            <li>Die 🧪 <b>Generalprobe auf Papier</b> machst du mit einem echten Übungsheft: 45 Minuten, Timer stellen, danach gemeinsam anschauen.</li>
            <li>Im Test gilt: Wenn du eine Aufgabe nicht weißt, <b>geh zur nächsten</b> – am Ende kommst du zurück.</li>
            <li>Am Abend vorher: Schulsachen packen, früh schlafen. Du hast geübt – mehr braucht es nicht. 💪</li>
          </ul>
        </div>
      )}

      <button data-test="kompass-zurueck" onClick={() => navTo("start")}
        style={{ background: "transparent", color: T.textLeise, fontSize: "var(--schrift-klein)" }}>
        ← Zurück zur Startseite
      </button>
    </div>
  );
}
