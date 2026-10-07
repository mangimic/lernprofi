import { useState } from "react";
import { useApp } from "../appContext.jsx";
import {
  REZEPTE, SATZANFAENGE, KRIT_INHALT, KRIT_SPRACHE, KRIT_FORM,
  vgStrip, zutatenListe, anfangOptionen, anfangRichtig,
} from "../calc/aufgaben/vorgang.js";
import { muenzenNachRunde, aufgabenZaehlen } from "../calc/lerntage.js";

/* 📝 Vorgangsbeschreibung – originalgetreu aus der Alt-App:
   Ablauf wählen (7 Themen), Grundlagen lesen, drei Übungs-Spiele
   (🧩 Ordnen, 🚦 Satzanfänge, 🧺 Zutaten-Check), druckbares
   Arbeitsblatt (Schreiben passiert MIT DER HAND auf Papier),
   Muster-Lösung hinter der Fleiß-Hürde (3 Versuche + 3 Schritte)
   und der Selbst-Check nach den Schul-Kriterien.
   Jedes abgeschlossene Spiel bringt 1 Münze + Mini-Missions-Punkte. */

function mischen(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

export default function Vorgang({ zurueck }) {
  const { data, update, logChange, T, heute } = useApp();
  const vg = data.lernstand.vorgang || {};
  const rezeptKey = REZEPTE[vg.rezept] ? vg.rezept : "waffel";
  const r = REZEPTE[rezeptKey];
  const profi = data.profil.klasse === 4;

  const [tab, setTab] = useState("ablauf");
  const [utab, setUtab] = useState("grundlagen");
  const [beispielIdx, setBeispielIdx] = useState(-1);
  const [ordnen, setOrdnen] = useState(null);
  const [anfang, setAnfang] = useState(null);
  const [zutaten, setZutaten] = useState(null);
  const [tries, setTries] = useState(0);
  const [written, setWritten] = useState([false, false, false, false, false]);
  const [loesungOffen, setLoesungOffen] = useState(false);

  const karte = { background: T.karte, borderRadius: T.radius, padding: T.abstand, marginBottom: T.abstand };
  const primaer = { width: "100%", background: T.primaer, color: T.primaerText, fontWeight: 700 };
  const weich = { background: T.weich, color: T.text, fontWeight: 700 };

  const vgSpeichern = (patch) =>
    update({ ...data, lernstand: { ...data.lernstand, vorgang: { rezept: rezeptKey, ...(data.lernstand.vorgang || {}), ...patch } } });

  // Spiel abgeschlossen: 1 Münze + gelöste Aufgaben in die Mini-Missionen
  const belohnen = (geloest, text) => {
    logChange(
      {
        ...data,
        lernstand: {
          ...data.lernstand,
          muenzen: muenzenNachRunde(data.lernstand.muenzen),
          lerntage: aufgabenZaehlen(data.lernstand.lerntage, heute, geloest, { missionsZiel: data.einstellungen.missionsZiel }),
        },
      },
      "ueben", "neu", text,
    );
  };

  const rezeptWaehlen = (key) => {
    vgSpeichern({ rezept: key });
    setOrdnen(null); setAnfang(null); setZutaten(null);
    setTries(0); setWritten([false, false, false, false, false]); setLoesungOffen(false);
    setBeispielIdx(-1);
  };

  /* ---------- Schritte-Pfad (Kreise füllen sich) ---------- */
  const PfadSVG = ({ total, done, current }) => {
    const w = 200, y = 22, r0 = 11, gap = (w - 40) / Math.max(1, total - 1);
    return (
      <div style={{ textAlign: "center", margin: "2px 0 4px" }}>
        <svg viewBox="0 0 200 44" style={{ width: "min(300px, 92%)" }} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <line x1="20" y1={y} x2={w - 20} y2={y} stroke="#cfe0f5" strokeWidth="4" strokeLinecap="round" />
          {done > 0 && <line x1="20" y1={y} x2={20 + gap * Math.min(done, total - 1)} y2={y} stroke="#3f9d54" strokeWidth="4" strokeLinecap="round" />}
          {Array.from({ length: total }, (_, i) => {
            const x = 20 + gap * i, istFertig = i < done, istJetzt = current !== undefined && i === current;
            return (
              <g key={i}>
                <circle cx={x} cy={y} r={istJetzt ? r0 + 2 : r0} fill={istFertig ? "#3f9d54" : istJetzt ? "#ffd94d" : "#eaf2ff"}
                  stroke={istFertig ? "#2c7a3f" : istJetzt ? "#e0b23e" : "#4a7fd6"} strokeWidth="2.4" />
                <text x={x} y={y + 4.5} fontSize="12" fontWeight="bold" textAnchor="middle"
                  fill={istFertig ? "#fff" : "#2b4a80"} fontFamily="system-ui,sans-serif">{istFertig ? "✓" : i + 1}</text>
              </g>
            );
          })}
        </svg>
      </div>
    );
  };

  /* ---------- 📋 Ablauf wählen ---------- */
  const Ablauf = () => (
    <>
      <div style={karte}>
        <h2 style={{ marginTop: 0 }}>📋 Ablauf wählen</h2>
        <p style={{ color: T.textLeise }}>Wähle, worüber du eine Vorgangsbeschreibung schreibst.</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {Object.entries(REZEPTE).map(([key, rz]) => (
            <button key={key} data-test="vg-rezept" data-key={key} onClick={() => rezeptWaehlen(key)}
              style={{
                ...weich, textAlign: "left", padding: "10px 12px",
                border: `2px solid ${key === rezeptKey ? "var(--primaer)" : "transparent"}`,
              }}>
              {rz.emoji} {rz.name}
            </button>
          ))}
        </div>
      </div>
      <div style={karte}>
        <h2 style={{ marginTop: 0 }}>So geht's</h2>
        <p style={{ margin: "4px 0" }}><b>1.</b> Grundlagen üben – am Bildschirm (kurz).</p>
        <p style={{ margin: "4px 0" }}><b>2.</b> Auf Papier schreiben – Arbeitsblatt drucken.</p>
        <p style={{ margin: "4px 0 10px" }}><b>3.</b> Selbst-Check – wie in der Schule einschätzen.</p>
        <button data-test="vg-los" onClick={() => setTab("ueben")} style={primaer}>Los: Grundlagen üben</button>
      </div>
    </>
  );

  /* ---------- 📖 Grundlagen ---------- */
  const Grundlagen = () => (
    <>
      <div style={karte}>
        <h3 style={{ marginTop: 0 }}>1) Verschiedene Satzanfänge</h3>
        <p style={{ margin: "4px 0 8px" }}>Beginne nicht jeden Satz gleich:</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {SATZANFAENGE.map((a2) => (
            <span key={a2} style={{ background: T.weich, borderRadius: 999, padding: "4px 12px", fontWeight: 700 }}>{a2}</span>
          ))}
        </div>
      </div>
      <div style={karte}>
        <h3 style={{ marginTop: 0 }}>2) Denke an diese Fragen</h3>
        <p style={{ background: T.grund, borderRadius: T.radiusKlein, padding: "10px 12px", margin: 0 }}>
          🟦 <b>Was</b> nehme ich?<br />🟩 <b>Wohin</b> kommt es?<br />🟨 <b>Was</b> mache ich damit?<br />🟧 <b>Womit</b> mache ich es?
        </p>
      </div>
      <div style={karte}>
        <h3 style={{ marginTop: 0 }}>3) So wird aus Stichworten ein Satz</h3>
        <p style={{ background: T.grund, borderRadius: T.radiusKlein, padding: "10px 12px" }}>📝 {r.stich}</p>
        {beispielIdx >= 0 && (
          <p data-test="vg-beispiel" style={{ background: T.grund, borderRadius: T.radiusKlein, padding: "10px 12px" }}>
            ✅ {r.beispiele[beispielIdx % r.beispiele.length]}
          </p>
        )}
        <button data-test="vg-beispiel-knopf" onClick={() => setBeispielIdx(beispielIdx + 1)} style={weich}>
          {beispielIdx < 0 ? "Beispielsatz zeigen" : "Zeig mir ein weiteres Beispiel"}
        </button>
      </div>
      {profi && (
        <div style={karte}>
          <h3 style={{ marginTop: 0 }}>⭐ Profi-Ziele (Klasse 4)</h3>
          <p style={{ background: T.grund, borderRadius: T.radiusKlein, padding: "10px 12px", margin: 0, lineHeight: 1.6 }}>
            📏 Schreibe <b>mindestens 5 Schritte</b> – genau und in der richtigen <b>Reihenfolge</b>.<br />
            🧰 Nenne <b>genaue Mengen und Hilfsmittel</b> (z. B. „zwei Esslöffel“, „eine scharfe Schere“).<br />
            🔤 Benutze <b>Fachbegriffe</b> und schreibe sachlich in der <b>man-Form</b> (z. B. „Man nimmt …“).<br />
            🔗 Verbinde Sätze mit <b>Bindewörtern</b>: <i>zuerst, danach, sobald, damit, zum Schluss</i>.<br />
            ✅ <b>Lies am Ende alles noch einmal</b> und prüfe die Reihenfolge.
          </p>
        </div>
      )}
      <div style={karte}>
        <p style={{ background: T.grund, borderRadius: T.radiusKlein, padding: "10px 12px" }}>
          💡 Merke: <b>Ein Schritt = ein ganzer Satz.</b> Schreibe in der <b>{profi ? "man-Form" : "Ich-Form"}</b> und setze am Ende einen <b>Punkt</b>.
        </p>
        <button onClick={() => setTab("blatt")} style={primaer}>Weiter: Arbeitsblatt</button>
      </div>
    </>
  );

  /* ---------- 🧩 Ordnen ---------- */
  const ordnenStart = () => setOrdnen({ order: mischen(r.loesung.map((_, i) => i)), next: 0, ersteOk: 0, fehlversuch: false, meldung: null, fertig: false });
  const Ordnen = () => {
    const o = ordnen;
    if (!o) { ordnenStart(); return null; }
    const total = r.loesung.length;
    const klick = (stepIdx) => {
      if (o.fertig || stepIdx < o.next) return;
      if (stepIdx === o.next) {
        const ersteOk = o.ersteOk + (o.fehlversuch ? 0 : 1);
        const fertig = o.next + 1 >= total;
        setOrdnen({ ...o, next: o.next + 1, ersteOk, fehlversuch: false, meldung: null, fertig });
        if (fertig) belohnen(ersteOk, `Vorgangsbeschreibung (${r.name}): Schritte geordnet, ${ersteOk} von ${total} direkt richtig`);
      } else {
        setOrdnen({ ...o, fehlversuch: true, meldung: `Fast! Überlege: Was muss vorher passieren? Gesucht ist Schritt ${o.next + 1}.` });
      }
    };
    return (
      <div style={karte}>
        <h3 style={{ marginTop: 0 }}>🧩 Schritte ordnen</h3>
        <p style={{ color: T.textLeise }}>{r.emoji} {r.name} · Tippe die Schritte in der <b>richtigen Reihenfolge</b> an.</p>
        <PfadSVG total={total} done={o.next} />
        {!o.fertig && <p style={{ background: T.grund, borderRadius: T.radiusKlein, padding: "8px 12px" }}>Welcher Schritt kommt als <b>{o.next + 1}.</b>?</p>}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {o.order.map((stepIdx) => (
            <button key={stepIdx} data-test="ord-schritt" data-i={stepIdx} disabled={stepIdx < o.next || o.fertig}
              onClick={() => klick(stepIdx)}
              style={{
                ...weich, textAlign: "left", lineHeight: 1.4, fontWeight: 600, padding: "10px 12px",
                fontSize: "var(--schrift-klein)",
                background: stepIdx < o.next ? "color-mix(in srgb, var(--ok) 14%, var(--karte))" : T.weich,
                opacity: stepIdx < o.next ? 0.75 : 1, minHeight: "var(--touch)", height: "auto",
              }}>
              {stepIdx < o.next ? <><b>{stepIdx + 1}.</b> {r.loesung[stepIdx]}</> : <>… {vgStrip(r.loesung[stepIdx])}</>}
            </button>
          ))}
        </div>
        {o.meldung && <p data-test="vg-feedback" style={{ color: T.warn }}>{o.meldung}</p>}
        {o.fertig && (
          <>
            <p data-test="ord-ergebnis" style={{ color: T.ok, fontWeight: 700 }}>
              🎉 Alle {total} Schritte geordnet – {o.ersteOk} von {total} direkt richtig! 🪙 +1 Münze
            </p>
            <button data-test="ord-nochmal" onClick={ordnenStart} style={primaer}>🔁 Nochmal (neu gemischt)</button>
          </>
        )}
      </div>
    );
  };

  /* ---------- 🚦 Satzanfänge ---------- */
  const anfangStart = () => setAnfang({ i: 0, opts: mischen(anfangOptionen(0)), gewaehlt: null, ersteOk: 0, fertig: false });
  const Anfang = () => {
    const s = anfang;
    if (!s) { anfangStart(); return null; }
    const total = r.loesung.length;
    const kindErkl = s.i === 0 ? "Der erste Schritt beginnt mit „Zuerst“."
      : s.i === total - 1 ? "Der letzte Schritt beginnt mit „Zum Schluss“."
      : "In der Mitte passen Wörter wie „Danach“, „Anschließend“ oder „Nun“.";
    const waehlen = (w) => {
      if (s.gewaehlt || s.fertig) return;
      const ok = anfangRichtig(w, s.i, total);
      setAnfang({ ...s, gewaehlt: { w, ok }, ersteOk: s.ersteOk + (ok ? 1 : 0) });
    };
    const naechster = () => {
      if (!s.gewaehlt) return;
      if (s.i + 1 >= total) {
        setAnfang({ ...s, fertig: true });
        belohnen(s.ersteOk, `Vorgangsbeschreibung (${r.name}): Satzanfänge geübt, ${s.ersteOk} von ${total} richtig`);
      } else {
        setAnfang({ ...s, i: s.i + 1, opts: mischen(anfangOptionen(s.i + 1)), gewaehlt: null });
      }
    };
    if (s.fertig) {
      return (
        <div style={karte}>
          <h3 style={{ marginTop: 0 }}>🚦 Satzanfänge</h3>
          <p data-test="anf-ergebnis" style={{ color: T.ok, fontWeight: 700 }}>
            🎉 Alle {total} Sätze geschafft – {s.ersteOk} von {total} richtig! 🪙 +1 Münze
          </p>
          <button data-test="anf-nochmal" onClick={anfangStart} style={primaer}>🔁 Nochmal</button>
        </div>
      );
    }
    return (
      <div style={karte}>
        <h3 style={{ marginTop: 0 }}>🚦 Satzanfänge</h3>
        <p style={{ color: T.textLeise }}>{r.emoji} {r.name} · Satz {s.i + 1} von {total}</p>
        <PfadSVG total={total} done={s.i} current={s.i} />
        <p style={{ background: T.grund, borderRadius: T.radiusKlein, padding: "10px 12px", fontWeight: 600 }}>
          <b>___</b> {vgStrip(r.loesung[s.i])}
        </p>
        <p>Welcher <b>Satzanfang</b> passt zu Schritt <b>{s.i + 1}</b>?</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {s.opts.map((w) => (
            <button key={w} data-test="anf-opt" data-richtig={anfangRichtig(w, s.i, total) ? "1" : undefined}
              disabled={!!s.gewaehlt} onClick={() => waehlen(w)}
              style={{
                ...weich,
                background: s.gewaehlt && anfangRichtig(w, s.i, total) ? "var(--ok)" : T.weich,
                color: s.gewaehlt && anfangRichtig(w, s.i, total) ? "#fff" : T.text,
              }}>
              {w}
            </button>
          ))}
        </div>
        {s.gewaehlt && (
          <p data-test="vg-feedback" style={{ color: s.gewaehlt.ok ? T.ok : T.warn }}>
            {s.gewaehlt.ok ? "Richtig! 🌟 " : "Fast! "}{kindErkl}
          </p>
        )}
        <button data-test="anf-weiter" disabled={!s.gewaehlt} onClick={naechster} style={{ ...primaer, marginTop: 8 }}>
          {s.i + 1 >= total ? "Fertig" : "Weiter"}
        </button>
      </div>
    );
  };

  /* ---------- 🧺 Zutaten-Check ---------- */
  const zutatenStart = () => {
    const echte = zutatenListe(r).slice(0, 6);
    const fremd = [];
    Object.keys(REZEPTE).forEach((k) => {
      if (k === rezeptKey) return;
      zutatenListe(REZEPTE[k]).forEach((z) => { if (!echte.includes(z) && !fremd.includes(z)) fremd.push(z); });
    });
    const abl = mischen(fremd).slice(0, Math.min(3, fremd.length));
    setZutaten({
      karten: mischen(echte.map((z) => ({ z, echt: true })).concat(abl.map((z) => ({ z, echt: false })))),
      sel: [], geprueft: false,
    });
  };
  const Zutaten = () => {
    const s = zutaten;
    if (!s) { zutatenStart(); return null; }
    const nEcht = s.karten.filter((k) => k.echt).length;
    const gefunden = s.sel.filter((i) => s.karten[i].echt).length;
    const toggle = (i) => {
      if (s.geprueft) return;
      setZutaten({ ...s, sel: s.sel.includes(i) ? s.sel.filter((x) => x !== i) : [...s.sel, i] });
    };
    const pruefen = () => {
      if (s.geprueft || !s.sel.length) return;
      const richtige = s.karten.filter((k, i) => (k.echt && s.sel.includes(i)) || (!k.echt && !s.sel.includes(i))).length;
      setZutaten({ ...s, geprueft: true });
      belohnen(richtige, `Vorgangsbeschreibung (${r.name}): Zutaten-Check, ${richtige} von ${s.karten.length} Karten richtig`);
    };
    const alle = s.geprueft && s.karten.every((k, i) => (k.echt && s.sel.includes(i)) || (!k.echt && !s.sel.includes(i)));
    return (
      <div style={karte}>
        <h3 style={{ marginTop: 0 }}>🧺 Zutaten-Check</h3>
        <p style={{ color: T.textLeise }}>{r.emoji} {r.name} · Packe ein, was du <b>wirklich brauchst</b> – aber nur das!</p>
        <div style={{ textAlign: "center", fontSize: 34, margin: "2px 0" }}>🧺</div>
        <PfadSVG total={nEcht} done={gefunden} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 8 }}>
          {s.karten.map((k, i) => {
            const drin = s.sel.includes(i);
            let hintergrund = drin ? "color-mix(in srgb, var(--primaer) 16%, var(--karte))" : T.weich;
            let text = drin ? "🧺 " + k.z : k.z;
            if (s.geprueft) {
              if (k.echt && drin) { hintergrund = "color-mix(in srgb, var(--ok) 18%, var(--karte))"; text = "✅ " + k.z; }
              else if (k.echt) { hintergrund = "color-mix(in srgb, var(--warn) 18%, var(--karte))"; text = "😮 " + k.z + " (fehlt!)"; }
              else if (drin) { hintergrund = "color-mix(in srgb, var(--warn) 25%, var(--karte))"; text = "❌ " + k.z; }
            }
            return (
              <button key={i} data-test="zut-karte" data-echt={k.echt ? "1" : undefined} disabled={s.geprueft} onClick={() => toggle(i)}
                style={{ ...weich, background: hintergrund, fontSize: "var(--schrift-klein)", lineHeight: 1.3, minHeight: 52, height: "auto", padding: "6px 10px" }}>
                {text}
              </button>
            );
          })}
        </div>
        {s.geprueft ? (
          <>
            <p data-test="zut-ergebnis" style={{ color: alle ? T.ok : T.warn, fontWeight: 700 }}>
              {alle ? "Perfekt eingepackt! 🌟 Alles Nötige ist im Korb – und nichts Falsches. 🪙 +1 Münze"
                : "Schau dir die Karten an: ✅ richtig eingepackt · 😮 vergessen · ❌ gehört nicht dazu. 🪙 +1 Münze"}
            </p>
            <button data-test="zut-nochmal" onClick={zutatenStart} style={primaer}>🔁 Nochmal (neu gemischt)</button>
          </>
        ) : (
          <button data-test="zut-pruefen" disabled={!s.sel.length} onClick={pruefen} style={{ ...primaer, marginTop: 10 }}>Prüfen</button>
        )}
      </div>
    );
  };

  /* ---------- 🖨️ Arbeitsblatt ---------- */
  const drucken = () => {
    document.body.setAttribute("data-druck", "1");
    const fertig = () => { document.body.removeAttribute("data-druck"); window.removeEventListener("afterprint", fertig); };
    window.addEventListener("afterprint", fertig);
    window.print();
  };
  const Blatt = () => {
    const checkBase = ["Überschrift gefunden", "alle Zutaten/Hilfsmittel genannt", "jeden Schritt beschrieben", "verschiedene Satzanfänge benutzt"];
    const checkK3 = ["in der Ich-Form geschrieben", "Punkte am Satzende gesetzt"];
    const checkK4 = ["in der man-Form geschrieben", "Fachbegriffe benutzt", "mit Bindewörtern verbunden (zuerst, danach, zum Schluss)", "alles noch einmal geprüft"];
    return (
      <>
        <div style={karte} className="kein-druck">
          <h3 style={{ marginTop: 0 }}>🖨️ Arbeitsblatt</h3>
          <p>Drucke das Blatt aus und schreibe die Vorgangsbeschreibung <b>mit der Hand</b>.</p>
          <button data-test="vg-drucken" onClick={drucken} style={primaer}>Arbeitsblatt drucken</button>
          <p style={{ color: T.textLeise, fontSize: "var(--schrift-klein)", marginBottom: 0 }}>
            Tipp: Im Druckfenster kannst du auch „Als PDF speichern“ wählen.
          </p>
        </div>
        <div style={karte} className="vg-druck" data-test="vg-blatt">
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 24 }}>✏️</span>
            <h3 style={{ margin: 0 }}>Vorgangsbeschreibung: {r.name}</h3>
          </div>
          <p style={{ color: T.textLeise }}>Name: ____________________________&nbsp;&nbsp;&nbsp;Datum: ____________ · 📘 Klasse {data.profil.klasse}</p>
          <p style={{ background: T.grund, borderRadius: T.radiusKlein, padding: "10px 12px", lineHeight: 1.55 }}>
            {profi
              ? <><b>Deine Aufgabe (Klasse 4):</b> Schreibe eine genaue Vorgangsbeschreibung zum Thema „{r.name}“. Schreibe zu jedem Schritt einen ganzen Satz in der <b>man-Form</b> („Man nimmt …“). Nenne <b>genaue Mengen und Hilfsmittel</b>, benutze <b>Fachbegriffe</b> und verbinde die Schritte mit <b>Bindewörtern</b> (zuerst, danach, sobald, zum Schluss). Halte die <b>richtige Reihenfolge</b> ein.</>
              : <><b>Deine Aufgabe:</b> Schreibe eine Vorgangsbeschreibung zum Thema „{r.name}“. Schreibe zu jedem Schritt einen ganzen Satz in der Ich-Form. Benutze verschiedene Satzanfänge und setze am Ende jedes Satzes einen Punkt.</>}
          </p>
          <p><b>Schreibe hier deine Überschrift:</b></p>
          <div className="vg-zeile" />
          <p><b>Schreibe hier, was du brauchst (Zutaten &amp; Hilfsmittel):</b></p>
          <div className="vg-zeile" /><div className="vg-zeile" />
          <p style={{ fontSize: "var(--schrift-klein)", background: T.grund, borderRadius: T.radiusKlein, padding: "8px 12px" }}>
            <b>Satzanfänge zur Auswahl:</b> {SATZANFAENGE.join(" · ")}<br />
            <b>Denke an:</b> Was? · Wohin? · Was mache ich? · Womit?
          </p>
          {r.schritte.map((s, i) => (
            <div key={i} style={{ marginTop: 10 }}>
              <p style={{ margin: "0 0 2px", fontWeight: 700 }}>{s.lead}: Schreibe den {i + 1}. Schritt in einem ganzen Satz auf die Zeilen.</p>
              <p style={{ margin: "0 0 6px", color: T.textLeise, fontSize: "var(--schrift-klein)", fontStyle: "italic" }}>Diese Stichworte helfen dir: {s.cue}</p>
              <div className="vg-zeile" /><div className="vg-zeile" /><div className="vg-zeile" />
            </div>
          ))}
          <p style={{ marginTop: 12 }}><b>Meine Checkliste:</b></p>
          {checkBase.concat(profi ? checkK4 : checkK3).map((t2) => (
            <p key={t2} style={{ margin: "4px 0" }}><span className="vg-kasten" /> {t2}</p>
          ))}
        </div>
      </>
    );
  };

  /* ---------- 🔑 Lösung (mit Fleiß-Hürde) ---------- */
  const Loesung = () => {
    const geschrieben = written.filter(Boolean).length;
    const frei = tries >= 3 && geschrieben >= 3;
    const fehlt = [];
    if (tries < 3) fehlt.push(`noch ${3 - tries}× „Ich habe es versucht“`);
    if (geschrieben < 3) fehlt.push(`mindestens ${Math.max(0, 3 - geschrieben)} Schritt(e) mehr abhaken`);
    return (
      <>
        <div style={karte}>
          <h3 style={{ marginTop: 0 }}>🔑 Lösung</h3>
          <p>Die Lösung zeigt dir, wie ein guter Text aussehen kann. Aber <b>erst selbst versuchen!</b> 💪</p>
          <p style={{ color: T.textLeise }}><b>1)</b> Hast du es selbst versucht? Tippe nach jedem Versuch:</p>
          <button data-test="vg-versuch" onClick={() => setTries(Math.min(3, tries + 1))} style={weich}>Ich habe es versucht</button>
          <span style={{ marginLeft: 10 }}>Versuche: <b data-test="vg-versuche">{tries} / 3</b></span>
          <p style={{ color: T.textLeise, marginTop: 10 }}><b>2)</b> Welche Schritte hast du schon auf dein Blatt geschrieben?</p>
          {written.map((w, i) => (
            <label key={i} style={{ display: "block", margin: "4px 0", cursor: "pointer" }}>
              <input type="checkbox" data-test="vg-geschrieben" checked={w}
                onChange={(e) => setWritten(written.map((x, j) => (j === i ? e.target.checked : x)))} /> Schritt {i + 1} geschrieben
            </label>
          ))}
          <p data-test="vg-huerde" style={{ background: T.grund, borderRadius: T.radiusKlein, padding: "8px 12px" }}>
            {frei ? "Super, du hast fleißig geübt! Jetzt darfst du die Lösung ansehen. 🌟" : `Fast! Du brauchst noch: ${fehlt.join(" und ")}.`}
          </p>
          <button data-test="vg-loesung-zeigen" disabled={!frei} onClick={() => setLoesungOffen(true)} style={primaer}>
            {frei ? "Lösung anzeigen" : "🔒 Lösung anzeigen"}
          </button>
        </div>
        {loesungOffen && (
          <div style={karte} data-test="vg-loesung">
            <h3 style={{ marginTop: 0 }}>So kann ein guter Text aussehen</h3>
            <h4 style={{ margin: "4px 0" }}>✏️ {r.titel}</h4>
            <p><b>Das brauche ich:</b> {r.zutaten}</p>
            <ol style={{ paddingLeft: 20, lineHeight: 1.6 }}>
              {r.loesung.map((s, i) => <li key={i} style={{ marginBottom: 6 }}>{s}</li>)}
            </ol>
            <button data-test="vg-loesung-zu" onClick={() => { setLoesungOffen(false); setTries(0); setWritten([false, false, false, false, false]); }}
              style={{ ...weich, width: "100%" }}>
              Neu versuchen
            </button>
          </div>
        )}
      </>
    );
  };

  /* ---------- 🌸 Selbst-Check (Kriterien wie in der Schule) ---------- */
  const SelbstCheck = () => {
    const leer = { inhalt: KRIT_INHALT.map(() => false), sprache: KRIT_SPRACHE.map(() => false), form: KRIT_FORM.map(() => false) };
    const selbst = vg.selbst && typeof vg.selbst === "object" ? { ...leer, ...vg.selbst } : leer;
    const toggle = (gruppe, i) => {
      const neu = { ...selbst, [gruppe]: selbst[gruppe].map((x, j) => (j === i ? !x : x)) };
      vgSpeichern({ selbst: neu });
    };
    const Gruppe = ({ titel, emoji, liste, gruppe }) => (
      <div style={karte}>
        <h3 style={{ marginTop: 0 }}>{emoji} {titel}</h3>
        {liste.map((t2, i) => (
          <label key={i} style={{ display: "block", margin: "6px 0", cursor: "pointer" }}>
            <input type="checkbox" data-test={`selbst-${gruppe}`} checked={!!selbst[gruppe][i]} onChange={() => toggle(gruppe, i)} /> {t2}
          </label>
        ))}
      </div>
    );
    const gesamt = [...selbst.inhalt, ...selbst.sprache, ...selbst.form].filter(Boolean).length;
    return (
      <>
        <div style={karte}>
          <h3 style={{ marginTop: 0 }}>🌸 Selbst-Check</h3>
          <p style={{ color: T.textLeise }}>
            Lies deinen Text auf dem Blatt und hake ehrlich ab – wie in der Schule.
            <b data-test="selbst-stand"> {gesamt} von {KRIT_INHALT.length + KRIT_SPRACHE.length + KRIT_FORM.length}</b> geschafft.
          </p>
        </div>
        <Gruppe titel="Inhalt" emoji="📚" liste={KRIT_INHALT} gruppe="inhalt" />
        <Gruppe titel="Sprache" emoji="🗣️" liste={KRIT_SPRACHE} gruppe="sprache" />
        <Gruppe titel="Form" emoji="🖊️" liste={KRIT_FORM} gruppe="form" />
      </>
    );
  };

  /* ---------- Gerüst ---------- */
  const UTABS = [["grundlagen", "📖 Grundlagen"], ["ordnen", "🧩 Ordnen"], ["anfang", "🚦 Satzanfänge"], ["zutaten", "🧺 Zutaten"]];
  const TABS = [["ablauf", "📋 Ablauf"], ["ueben", "✏️ Üben"], ["blatt", "🖨️ Blatt"], ["loesung", "🔑 Lösung"], ["selbst", "🌸 Selbst-Check"]];
  return (
    <div data-test="vorgang">
      <div style={{ ...karte, paddingBottom: 8 }} className="kein-druck">
        <h2 style={{ margin: "0 0 8px" }}>📝 Vorgangsbeschreibung: {r.emoji} {r.name}</h2>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {TABS.map(([id, label]) => (
            <button key={id} data-test={`vg-tab-${id}`} onClick={() => setTab(id)}
              style={{
                flex: "1 0 auto", fontWeight: 700, padding: "0 10px", fontSize: "var(--schrift-klein)",
                background: tab === id ? T.primaer : T.weich, color: tab === id ? T.primaerText : T.text,
              }}>
              {label}
            </button>
          ))}
        </div>
        {tab === "ueben" && (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
            {UTABS.map(([id, label]) => (
              <button key={id} data-test={`vg-utab-${id}`} onClick={() => { setUtab(id); setOrdnen(null); setAnfang(null); setZutaten(null); }}
                style={{
                  flex: "1 0 auto", fontWeight: 700, padding: "0 10px", fontSize: "var(--schrift-klein)",
                  background: utab === id ? "color-mix(in srgb, var(--primaer) 22%, var(--weich))" : T.grund, color: T.text,
                }}>
                {label}
              </button>
            ))}
          </div>
        )}
      </div>
      {/* Die Spiele werden als Funktionen gerendert, damit ihre
          „Erst-Start bei leerem Zustand“-Logik im selben Komponenten-
          Render läuft (kein Setzen von Eltern-State aus Kind-Render). */}
      {tab === "ablauf" ? Ablauf()
        : tab === "ueben" ? (utab === "ordnen" ? Ordnen() : utab === "anfang" ? Anfang() : utab === "zutaten" ? Zutaten() : Grundlagen())
        : tab === "blatt" ? Blatt()
        : tab === "loesung" ? Loesung()
        : SelbstCheck()}
      <button data-test="vg-zurueck" onClick={zurueck} className="kein-druck"
        style={{ background: "transparent", color: T.textLeise, fontSize: "var(--schrift-klein)" }}>
        ← Zurück zur Übungs-Wahl
      </button>
    </div>
  );
}
