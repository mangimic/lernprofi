import { useState } from "react";
import { useApp } from "../appContext.jsx";
import {
  FAELLE, W_FRAGEN, AUFBAU, BERICHT_ANFAENGE, GRUENDE, BT_SPIELE,
  BT_KRIT_INHALT, BT_KRIT_SPRACHE, BT_KRIT_FORM,
  wFragenKarten, filterKarten, teilVonSatz, ordnenHinweis, reporterRang,
} from "../calc/aufgaben/berichtText.js";
import { muenzenNachRunde, aufgabenZaehlen } from "../calc/lerntage.js";
import { missionsOpts } from "../calc/tagesform.js";
import VorleseKnopf from "./VorleseKnopf.jsx";

/* 📰 Bericht schreiben – aufgebaut wie die Vorgangsbeschreibung, aber
   als Reporter-Auftrag: Fall wählen (7 Fälle, der erste ist der aus der
   Schule), Merkkarte lesen, vier kurze Übungs-Spiele (W-Fragen,
   Reporter-Filter, Zeitmaschine, Ordnen), druckbares Arbeitsblatt mit
   dem Schul-Leitfaden (Schreiben passiert MIT DER HAND auf Papier),
   Muster-Bericht hinter der Fleiß-Hürde und Selbst-Check.
   Lernhilfen: Zeugenaussage zum Anhören, W-Fragen immer in derselben
   Reihenfolge und Farbe, sofortige Rückmeldung mit Grund, kleine
   Portionen (höchstens 7 Karten) und ein Reporter-Ausweis mit Stempeln.
   Jedes abgeschlossene Spiel bringt 1 Münze + Mini-Missions-Punkte. */

function mischen(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

const TEIL = Object.fromEntries(AUFBAU.map((a) => [a.key, a]));
const W_VON = Object.fromEntries(W_FRAGEN.map((w) => [w.key, w]));
const SCHREIB_TEILE = ["Leitfaden ausgefüllt", "Einleitung geschrieben", "Hauptteil geschrieben", "Schluss geschrieben"];

export default function BerichtText({ zurueck }) {
  const { data, update, logChange, T, heute } = useApp();
  const bt = data.lernstand.berichtText || {};
  const fallKey = FAELLE[bt.fall] ? bt.fall : "parkhaus";
  const f = FAELLE[fallKey];
  const stempel = bt.stempel && typeof bt.stempel === "object" ? bt.stempel : {};
  const rang = reporterRang(stempel);

  const [tab, setTab] = useState("fall");
  const [utab, setUtab] = useState("merkkarte");
  const [zeugeOffen, setZeugeOffen] = useState(false);
  const [quiz, setQuiz] = useState(null);     // W-Fragen · Filter · Zeitmaschine
  const [ordnen, setOrdnen] = useState(null);
  const [tries, setTries] = useState(0);
  const [written, setWritten] = useState(SCHREIB_TEILE.map(() => false));
  const [loesungOffen, setLoesungOffen] = useState(false);

  const karte = { background: T.karte, borderRadius: T.radius, padding: T.abstand, marginBottom: T.abstand };
  const primaer = { width: "100%", background: T.primaer, color: T.primaerText, fontWeight: 700 };
  const weich = { background: T.weich, color: T.text, fontWeight: 700 };
  const kasten = { background: T.grund, borderRadius: T.radiusKlein, padding: "10px 12px" };

  const btDoc = (patch) => ({ fall: fallKey, ...data.lernstand.berichtText, ...patch });
  const btSpeichern = (patch) => update({ ...data, lernstand: { ...data.lernstand, berichtText: btDoc(patch) } });

  // Spiel abgeschlossen: 1 Münze + Missions-Punkte + Stempel im Reporter-Ausweis
  const belohnen = (geloest, text, spiel) => {
    logChange(
      {
        ...data,
        lernstand: {
          ...data.lernstand,
          berichtText: btDoc({ stempel: { ...stempel, [spiel]: true } }),
          muenzen: muenzenNachRunde(data.lernstand.muenzen),
          lerntage: aufgabenZaehlen(data.lernstand.lerntage, heute, geloest, missionsOpts(data.einstellungen, data.lernstand.tagesform, heute)),
        },
      },
      "ueben", "neu", text,
    );
  };

  const spieleZuruecksetzen = () => { setQuiz(null); setOrdnen(null); };
  const fallWaehlen = (key) => {
    btSpeichern({ fall: key });
    spieleZuruecksetzen();
    setTries(0); setWritten(SCHREIB_TEILE.map(() => false)); setLoesungOffen(false); setZeugeOffen(false);
  };

  /* ---------- Bausteine ---------- */
  const Pfad = ({ total, done }) => (
    <div data-test="bt-pfad" aria-hidden="true" style={{ display: "flex", gap: 6, justifyContent: "center", margin: "4px 0 10px" }}>
      {Array.from({ length: total }, (_, i) => (
        <span key={i} style={{
          width: 22, height: 8, borderRadius: 999,
          background: i < done ? "var(--ok)" : i === done ? "var(--primaer)" : "var(--weich)",
        }} />
      ))}
    </div>
  );

  const WChip = ({ w }) => (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4, borderRadius: 999, padding: "4px 12px", fontWeight: 700,
      background: `color-mix(in srgb, ${TEIL[w.teil].farbe} 18%, var(--karte))`, border: `2px solid ${TEIL[w.teil].farbe}`,
    }}>
      <span aria-hidden="true">{w.emoji}</span> {w.frage}
    </span>
  );

  // Die Zeugenaussage: ausklappbar (keine Textwand) und zum Anhören
  const Zeuge = () => (
    <div style={karte}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <h3 style={{ margin: 0, flex: 1 }}>🎙️ Das erzählt ein Zeuge</h3>
        <VorleseKnopf text={f.zeuge} test="bt-zeuge-vorlesen" klein label="Zeugenaussage vorlesen" />
      </div>
      {zeugeOffen ? (
        <p data-test="bt-zeuge" style={{ ...kasten, lineHeight: 1.65, marginBottom: 0 }}>{f.zeuge}</p>
      ) : (
        <button data-test="bt-zeuge-zeigen" onClick={() => setZeugeOffen(true)} style={{ ...weich, marginTop: 8 }}>Zeugenaussage lesen</button>
      )}
    </div>
  );

  /* ---------- 🗂️ Fall wählen + Reporter-Ausweis ---------- */
  const Fall = () => (
    <>
      <div style={karte} data-test="bt-ausweis">
        <h2 style={{ marginTop: 0 }}>🪪 Dein Reporter-Ausweis</h2>
        <p style={{ margin: "4px 0 8px" }}>
          Rang: <b>{rang.name}</b> · <b data-test="bt-stempel-stand">{rang.n} von {rang.von}</b> Stempeln
        </p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {BT_SPIELE.map((s) => (
            <span key={s.key} data-test="bt-stempel" data-da={stempel[s.key] ? "1" : undefined}
              style={{
                borderRadius: 999, padding: "4px 12px", fontWeight: 700, fontSize: "var(--schrift-klein)",
                background: stempel[s.key] ? "color-mix(in srgb, var(--ok) 20%, var(--karte))" : T.grund,
                color: stempel[s.key] ? T.text : T.textLeise,
              }}>
              {stempel[s.key] ? "✅" : "⬜"} {s.name}
            </span>
          ))}
        </div>
      </div>
      <div style={karte}>
        <h2 style={{ marginTop: 0 }}>Wähle deinen Fall</h2>
        <p style={{ color: T.textLeise }}>Du bist Reporter. Über welchen Fall berichtest du?</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {Object.entries(FAELLE).map(([key, fl]) => (
            <button key={key} data-test="bt-fall" data-key={key} onClick={() => fallWaehlen(key)}
              style={{
                ...weich, textAlign: "left", padding: "10px 12px", minHeight: "var(--touch)", height: "auto", lineHeight: 1.3,
                border: `2px solid ${key === fallKey ? "var(--primaer)" : "transparent"}`,
              }}>
              {fl.emoji} {fl.name}
            </button>
          ))}
        </div>
      </div>
      <div style={karte}>
        <h2 style={{ marginTop: 0 }}>So geht's</h2>
        <p style={{ margin: "4px 0" }}><b>1.</b> Üben – vier kurze Spiele am Bildschirm.</p>
        <p style={{ margin: "4px 0" }}><b>2.</b> Auf Papier schreiben – Leitfaden und Bericht.</p>
        <p style={{ margin: "4px 0 10px" }}><b>3.</b> Selbst-Check – wie in der Schule einschätzen.</p>
        <button data-test="bt-los" onClick={() => setTab("ueben")} style={primaer}>Los: Merkkarte ansehen</button>
      </div>
    </>
  );

  /* ---------- 📖 Merkkarte ---------- */
  const Merkkarte = () => (
    <>
      <div style={karte}>
        <h3 style={{ marginTop: 0 }}>1) Die 7 W-Fragen</h3>
        <p style={{ margin: "4px 0 8px" }}>Ein Bericht beantwortet diese Fragen – wie auf deinem Leitfaden:</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {W_FRAGEN.map((w) => <WChip key={w.key} w={w} />)}
        </div>
      </div>
      <div style={karte}>
        <h3 style={{ marginTop: 0 }}>2) Der Bauplan</h3>
        {AUFBAU.map((a) => (
          <p key={a.key} style={{ ...kasten, margin: "6px 0", borderLeft: `6px solid ${a.farbe}` }}>
            <b>{a.name}:</b> {a.text}
          </p>
        ))}
      </div>
      <div style={karte}>
        <h3 style={{ marginTop: 0 }}>3) Die Reporter-Regeln</h3>
        <p style={{ ...kasten, margin: 0, lineHeight: 1.7 }}>
          ⏳ Schreibe in der <b>Vergangenheit</b> (Präteritum): <i>sah, fuhr, stieß</i>.<br />
          🧊 Bleibe <b>sachlich</b>: nur Tatsachen.<br />
          🗑️ Lass weg: <b>Gefühle</b>, <b>Meinungen</b>, <b>wörtliche Rede</b>, Unwichtiges.<br />
          🎯 Sei <b>genau</b>: Tag, Uhrzeit, Ort, Zahlen.
        </p>
      </div>
      <div style={karte}>
        <h3 style={{ marginTop: 0 }}>4) Aus Geplapper wird ein Bericht</h3>
        <p style={{ ...kasten, margin: "0 0 6px" }}>🗣️ {f.raus[0].s} <span style={{ color: T.textLeise }}>→ fliegt raus</span></p>
        <p style={{ ...kasten, margin: 0, borderLeft: `6px solid ${TEIL.einleitung.farbe}` }}>📰 {f.loesung[0]}</p>
        <p style={{ color: T.textLeise, fontSize: "var(--schrift-klein)", marginBottom: 0 }}>
          Der Zeuge plaudert. Der Reporter schreibt nur, was wirklich passiert ist.
        </p>
      </div>
      <div style={karte}>
        <button data-test="bt-zu-spielen" onClick={() => { spieleZuruecksetzen(); setUtab("wfragen"); }} style={primaer}>Weiter: W-Fragen üben</button>
      </div>
    </>
  );

  /* ---------- Quiz-Gerüst (W-Fragen, Filter, Zeitmaschine) ---------- */
  const QUIZ = {
    wfragen: {
      titel: "W-Fragen-Detektiv", protokoll: "W-Fragen zugeordnet",
      karten: () => mischen(wFragenKarten(f)),
      frage: (k) => (
        <>
          <p style={{ ...kasten, fontWeight: 700 }}>📝 {k.text}</p>
          <p>Welche <b>W-Frage</b> beantwortet diese Notiz?</p>
        </>
      ),
      optionen: () => W_FRAGEN.map((w) => ({ wert: w.key, label: `${w.emoji} ${w.frage}` })),
      richtig: (k, wert) => wert === k.key,
      erkl: (k) => W_VON[k.key].tipp,
      spalten: "1fr 1fr",
    },
    filter: {
      titel: "Reporter-Filter", protokoll: "Sätze gefiltert",
      karten: () => mischen(filterKarten(f)),
      frage: (k) => (
        <>
          <p style={{ ...kasten, fontWeight: 600, lineHeight: 1.5 }}>{k.s}</p>
          <p>Gehört dieser Satz in den <b>Bericht</b>?</p>
        </>
      ),
      optionen: () => [{ wert: "rein", label: "✅ Rein in den Bericht" }, { wert: "raus", label: "🗑️ Raus damit" }],
      richtig: (k, wert) => (wert === "rein") === k.rein,
      erkl: (k) => GRUENDE[k.grund],
      spalten: "1fr 1fr",
    },
    zeit: {
      titel: "Zeitmaschine", protokoll: "Verben ins Präteritum gesetzt",
      karten: () => mischen(f.verben).map((v) => ({ ...v, opts: mischen([v.r, ...v.x]) })),
      frage: (k) => (
        <>
          <p style={{ ...kasten, fontWeight: 700 }}>{k.s} <span style={{ color: T.textLeise, fontWeight: 600 }}>({k.inf})</span></p>
          <p>Welche Form steht im Bericht? Gesucht ist die <b>Vergangenheit</b> (Präteritum).</p>
        </>
      ),
      optionen: (k) => k.opts.map((o) => ({ wert: o, label: o })),
      richtig: (k, wert) => wert === k.r,
      erkl: (k) => `${k.inf} → ${k.r}. So klingt der Satz: ${k.s.replace("___", k.r)}`,
      spalten: "1fr",
    },
  };

  const quizStart = (id) => setQuiz({ id, karten: QUIZ[id].karten(), i: 0, gewaehlt: null, ersteOk: 0, fertig: false });
  const Quiz = (id) => {
    const q = QUIZ[id];
    const s = quiz && quiz.id === id ? quiz : null;
    if (!s) { quizStart(id); return null; }
    const total = s.karten.length;
    if (s.fertig) {
      return (
        <div style={karte}>
          <h3 style={{ marginTop: 0 }}>{q.titel}</h3>
          <p data-test="bt-quiz-ergebnis" style={{ color: T.ok, fontWeight: 700 }}>
            Geschafft – {s.ersteOk} von {total} richtig! 🪙 +1 Münze · Stempel im Ausweis
          </p>
          <button data-test="bt-quiz-nochmal" onClick={() => quizStart(id)} style={primaer}>Nochmal (neu gemischt)</button>
        </div>
      );
    }
    const k = s.karten[s.i];
    const waehlen = (wert) => {
      if (s.gewaehlt) return;
      const ok = q.richtig(k, wert);
      setQuiz({ ...s, gewaehlt: { wert, ok }, ersteOk: s.ersteOk + (ok ? 1 : 0) });
    };
    const naechste = () => {
      if (!s.gewaehlt) return;
      if (s.i + 1 >= total) {
        setQuiz({ ...s, fertig: true });
        belohnen(s.ersteOk, `Bericht (${f.name}): ${q.protokoll}, ${s.ersteOk} von ${total} richtig`, id);
      } else {
        setQuiz({ ...s, i: s.i + 1, gewaehlt: null });
      }
    };
    return (
      <div style={karte}>
        <h3 style={{ marginTop: 0 }}>{q.titel}</h3>
        <p style={{ color: T.textLeise }}>{f.emoji} {f.name} · Karte {s.i + 1} von {total}</p>
        <Pfad total={total} done={s.i} />
        {q.frage(k)}
        <div style={{ display: "grid", gridTemplateColumns: q.spalten, gap: 8 }}>
          {q.optionen(k).map((o) => {
            const istRichtig = q.richtig(k, o.wert);
            const zeigOk = s.gewaehlt && istRichtig;
            const zeigFalsch = s.gewaehlt && s.gewaehlt.wert === o.wert && !istRichtig;
            return (
              <button key={o.wert} data-test="bt-opt" data-richtig={istRichtig ? "1" : undefined}
                disabled={!!s.gewaehlt} onClick={() => waehlen(o.wert)}
                style={{
                  ...weich, minHeight: "var(--touch)", height: "auto", padding: "8px 10px", lineHeight: 1.3,
                  background: zeigOk ? "var(--ok)" : zeigFalsch ? "color-mix(in srgb, var(--warn) 25%, var(--karte))" : T.weich,
                  color: zeigOk ? "#fff" : T.text,
                }}>
                {o.label}
              </button>
            );
          })}
        </div>
        {s.gewaehlt && (
          <p data-test="bt-feedback" style={{ color: s.gewaehlt.ok ? T.ok : T.warn }}>
            {s.gewaehlt.ok ? "Richtig! " : "Fast! "}{q.erkl(k)}
          </p>
        )}
        <button data-test="bt-weiter" disabled={!s.gewaehlt} onClick={naechste} style={{ ...primaer, marginTop: 8 }}>
          {s.i + 1 >= total ? "Fertig" : "Weiter"}
        </button>
      </div>
    );
  };

  /* ---------- 🧩 Ordnen ---------- */
  const ordnenStart = () => setOrdnen({ order: mischen(f.loesung.map((_, i) => i)), next: 0, ersteOk: 0, fehlversuch: false, meldung: null, fertig: false });
  const Ordnen = () => {
    const o = ordnen;
    if (!o) { ordnenStart(); return null; }
    const total = f.loesung.length;
    const klick = (idx) => {
      if (o.fertig || idx < o.next) return;
      if (idx === o.next) {
        const ersteOk = o.ersteOk + (o.fehlversuch ? 0 : 1);
        const fertig = o.next + 1 >= total;
        setOrdnen({ ...o, next: o.next + 1, ersteOk, fehlversuch: false, meldung: null, fertig });
        if (fertig) belohnen(ersteOk, `Bericht (${f.name}): Sätze geordnet, ${ersteOk} von ${total} direkt richtig`, "ordnen");
      } else {
        setOrdnen({ ...o, fehlversuch: true, meldung: `Fast! ${ordnenHinweis(o.next, total)}` });
      }
    };
    return (
      <div style={karte}>
        <h3 style={{ marginTop: 0 }}>Bericht ordnen</h3>
        <p style={{ color: T.textLeise }}>{f.emoji} {f.name} · Tippe die Sätze in der <b>richtigen Reihenfolge</b> an.</p>
        <Pfad total={total} done={o.next} />
        {!o.fertig && (
          <p style={{ ...kasten, borderLeft: `6px solid ${TEIL[teilVonSatz(o.next, total)].farbe}` }}>
            Satz <b>{o.next + 1}</b>: {ordnenHinweis(o.next, total)}
          </p>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {o.order.map((idx) => {
            const gesetzt = idx < o.next;
            return (
              <button key={idx} data-test="bt-ord-satz" data-i={idx} disabled={gesetzt || o.fertig} onClick={() => klick(idx)}
                style={{
                  ...weich, textAlign: "left", lineHeight: 1.4, fontWeight: 600, padding: "10px 12px",
                  fontSize: "var(--schrift-klein)", minHeight: "var(--touch)", height: "auto",
                  background: gesetzt ? "color-mix(in srgb, var(--ok) 14%, var(--karte))" : T.weich,
                  borderLeft: gesetzt ? `6px solid ${TEIL[teilVonSatz(idx, total)].farbe}` : "6px solid transparent",
                  opacity: gesetzt ? 0.8 : 1,
                }}>
                {gesetzt ? <><b>{idx + 1}. {TEIL[teilVonSatz(idx, total)].name}:</b> {f.loesung[idx]}</> : f.loesung[idx]}
              </button>
            );
          })}
        </div>
        {o.meldung && <p data-test="bt-feedback" style={{ color: T.warn }}>{o.meldung}</p>}
        {o.fertig && (
          <>
            <p data-test="bt-ord-ergebnis" style={{ color: T.ok, fontWeight: 700 }}>
              Alle {total} Sätze geordnet – {o.ersteOk} von {total} direkt richtig! 🪙 +1 Münze · Stempel im Ausweis
            </p>
            <button data-test="bt-ord-nochmal" onClick={ordnenStart} style={primaer}>Nochmal (neu gemischt)</button>
          </>
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
  const zeilen = (n) => Array.from({ length: n }, (_, i) => <div key={i} className="vg-zeile" />);
  const Blatt = () => (
    <>
      <div style={karte} className="kein-druck">
        <h3 style={{ marginTop: 0 }}>Arbeitsblatt</h3>
        <p>Drucke das Blatt aus. Fülle zuerst den <b>Leitfaden</b> aus, dann schreibe den Bericht <b>mit der Hand</b>.</p>
        <button data-test="bt-drucken" onClick={drucken} style={primaer}>Arbeitsblatt drucken</button>
        <p style={{ color: T.textLeise, fontSize: "var(--schrift-klein)", marginBottom: 0 }}>
          Tipp: Im Druckfenster kannst du auch „Als PDF speichern“ wählen.
        </p>
      </div>
      <div style={karte} className="vg-druck" data-test="bt-blatt">
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 24 }}>📰</span>
          <h3 style={{ margin: 0 }}>Bericht: {f.name}</h3>
        </div>
        <p style={{ color: T.textLeise }}>Name: ____________________________&nbsp;&nbsp;&nbsp;Datum: ____________ · 📘 Klasse {data.profil.klasse}</p>
        <p style={{ ...kasten, lineHeight: 1.55 }}>
          <b>Deine Aufgabe:</b> Lies, was der Zeuge erzählt. Beantworte die <b>W-Fragen</b> im Leitfaden in Stichworten.
          Schreibe dann einen <b>sachlichen Bericht</b> in der <b>Vergangenheit</b> (Präteritum) – ohne Gefühle, ohne Meinung und ohne wörtliche Rede.
        </p>
        <p style={{ margin: "10px 0 4px" }}><b>Das erzählt der Zeuge:</b></p>
        <p style={{ ...kasten, lineHeight: 1.6, fontSize: "var(--schrift-klein)" }}>{f.zeuge}</p>
        <p style={{ margin: "12px 0 4px", textDecoration: "underline" }}><b>Leitfaden W-Fragen zum Bericht</b></p>
        {W_FRAGEN.map((w) => (
          <div key={w.key} style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
            <span style={{ flex: "0 0 108px", fontWeight: 700, fontSize: "var(--schrift-klein)" }}>{w.frage}</span>
            <div style={{ flex: 1 }}>{zeilen(w.key === "wie" || w.key === "folgen" ? 2 : 1)}</div>
          </div>
        ))}
        <p style={{ margin: "14px 0 4px", textDecoration: "underline" }}><b>Mein Bericht</b></p>
        <p style={{ fontSize: "var(--schrift-klein)", ...kasten }}>
          <b>Satzanfänge zur Auswahl:</b> {BERICHT_ANFAENGE.join(" · ")}<br />
          <b>Verben in der Vergangenheit:</b> {f.verben.map((v) => `${v.inf} → ${v.r}`).join(" · ")}
        </p>
        <div style={{ breakInside: "avoid" }}>
          <p style={{ margin: "8px 0 2px" }}><b>Überschrift:</b></p>
          {zeilen(1)}
        </div>
        {AUFBAU.map((a) => (
          <div key={a.key} style={{ marginTop: 10, breakInside: "avoid" }}>
            <p style={{ margin: "0 0 2px", fontWeight: 700 }}>{a.name}</p>
            <p style={{ margin: "0 0 6px", color: T.textLeise, fontSize: "var(--schrift-klein)", fontStyle: "italic" }}>{a.text}</p>
            {zeilen(a.key === "hauptteil" ? 7 : 3)}
          </div>
        ))}
        <p style={{ marginTop: 12 }}><b>Meine Checkliste:</b></p>
        {["Überschrift gefunden", "Wann, Wo, Was, Wer in der Einleitung", "Hauptteil der Reihe nach erzählt", "Folgen im Schluss genannt",
          "in der Vergangenheit (Präteritum) geschrieben", "sachlich – ohne Gefühle, Meinung und wörtliche Rede", "alles noch einmal geprüft"].map((t2) => (
          <p key={t2} style={{ margin: "4px 0" }}><span className="vg-kasten" /> {t2}</p>
        ))}
      </div>
    </>
  );

  /* ---------- 🔑 Lösung (mit Fleiß-Hürde) ---------- */
  const Loesung = () => {
    const geschrieben = written.filter(Boolean).length;
    const frei = tries >= 3 && geschrieben >= 3;
    const fehlt = [];
    if (tries < 3) fehlt.push(`noch ${3 - tries}× „Ich habe es versucht“`);
    if (geschrieben < 3) fehlt.push(`mindestens ${Math.max(0, 3 - geschrieben)} Teil(e) mehr abhaken`);
    return (
      <>
        <div style={karte}>
          <h3 style={{ marginTop: 0 }}>Lösung</h3>
          <p>Die Lösung zeigt dir, wie ein guter Bericht aussehen kann. Aber <b>erst selbst versuchen!</b> 💪</p>
          <p style={{ color: T.textLeise }}><b>1)</b> Hast du es selbst versucht? Tippe nach jedem Versuch:</p>
          <button data-test="bt-versuch" onClick={() => setTries(Math.min(3, tries + 1))} style={weich}>Ich habe es versucht</button>
          <span style={{ marginLeft: 10 }}>Versuche: <b data-test="bt-versuche">{tries} / 3</b></span>
          <p style={{ color: T.textLeise, marginTop: 10 }}><b>2)</b> Was hast du schon auf dein Blatt geschrieben?</p>
          {written.map((w, i) => (
            <label key={i} style={{ display: "block", margin: "4px 0", cursor: "pointer" }}>
              <input type="checkbox" data-test="bt-geschrieben" checked={w}
                onChange={(e) => setWritten(written.map((x, j) => (j === i ? e.target.checked : x)))} /> {SCHREIB_TEILE[i]}
            </label>
          ))}
          <p data-test="bt-huerde" style={kasten}>
            {frei ? "Super, du hast fleißig geübt! Jetzt darfst du die Lösung ansehen. 🌟" : `Fast! Du brauchst noch: ${fehlt.join(" und ")}.`}
          </p>
          <button data-test="bt-loesung-zeigen" disabled={!frei} onClick={() => setLoesungOffen(true)} style={primaer}>Lösung anzeigen</button>
        </div>
        {loesungOffen && (
          <div style={karte} data-test="bt-loesung">
            <h3 style={{ marginTop: 0 }}>So kann der Leitfaden aussehen</h3>
            {W_FRAGEN.map((w) => (
              <p key={w.key} style={{ margin: "4px 0", lineHeight: 1.45 }}><b>{w.frage}</b> {f.w[w.key]}</p>
            ))}
            <h3>So kann ein guter Bericht aussehen</h3>
            <h4 style={{ margin: "4px 0" }}>{f.titel}</h4>
            {f.loesung.map((s, i) => (
              <p key={i} style={{ ...kasten, margin: "6px 0", lineHeight: 1.55, borderLeft: `6px solid ${TEIL[teilVonSatz(i)].farbe}` }}>{s}</p>
            ))}
            <p style={{ color: T.textLeise, fontSize: "var(--schrift-klein)" }}>
              {AUFBAU.map((a) => `${a.name} = ${a.key === "einleitung" ? "blau" : a.key === "hauptteil" ? "orange" : "grün"}`).join(" · ")}
            </p>
            <button data-test="bt-loesung-zu" onClick={() => { setLoesungOffen(false); setTries(0); setWritten(SCHREIB_TEILE.map(() => false)); }}
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
    const leer = { inhalt: BT_KRIT_INHALT.map(() => false), sprache: BT_KRIT_SPRACHE.map(() => false), form: BT_KRIT_FORM.map(() => false) };
    const selbst = bt.selbst && typeof bt.selbst === "object" ? { ...leer, ...bt.selbst } : leer;
    const toggle = (gruppe, i) => btSpeichern({ selbst: { ...selbst, [gruppe]: selbst[gruppe].map((x, j) => (j === i ? !x : x)) } });
    const Gruppe = ({ titel, emoji, liste, gruppe }) => (
      <div style={karte}>
        <h3 style={{ marginTop: 0 }}>{emoji} {titel}</h3>
        {liste.map((t2, i) => (
          <label key={i} style={{ display: "block", margin: "6px 0", cursor: "pointer" }}>
            <input type="checkbox" data-test={`bt-selbst-${gruppe}`} checked={!!selbst[gruppe][i]} onChange={() => toggle(gruppe, i)} /> {t2}
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
            Lies deinen Bericht auf dem Blatt und hake ehrlich ab – wie in der Schule.
            <b data-test="bt-selbst-stand"> {gesamt} von {BT_KRIT_INHALT.length + BT_KRIT_SPRACHE.length + BT_KRIT_FORM.length}</b> geschafft.
          </p>
        </div>
        <Gruppe titel="Inhalt" emoji="📚" liste={BT_KRIT_INHALT} gruppe="inhalt" />
        <Gruppe titel="Sprache" emoji="🗣️" liste={BT_KRIT_SPRACHE} gruppe="sprache" />
        <Gruppe titel="Form" emoji="🖊️" liste={BT_KRIT_FORM} gruppe="form" />
      </>
    );
  };

  /* ---------- Gerüst ---------- */
  const UTABS = [["merkkarte", "Merkkarte"], ...BT_SPIELE.map((s) => [s.key, `${stempel[s.key] ? "✅ " : ""}${s.name}`])];
  const TABS = [["fall", "Fall"], ["ueben", "Üben"], ["blatt", "Blatt"], ["loesung", "Lösung"], ["selbst", "🌸 Selbst-Check"]];
  return (
    <div data-test="bericht">
      <div style={{ ...karte, paddingBottom: 8 }} className="kein-druck">
        <h2 style={{ margin: "0 0 8px" }}>📰 Bericht: {f.emoji} {f.name}</h2>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {TABS.map(([id, label]) => (
            <button key={id} data-test={`bt-tab-${id}`} onClick={() => setTab(id)}
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
              <button key={id} data-test={`bt-utab-${id}`} onClick={() => { setUtab(id); spieleZuruecksetzen(); }}
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
      {tab === "fall" ? Fall()
        : tab === "ueben" ? (
          <>
            {utab === "merkkarte" && Zeuge()}
            {utab === "merkkarte" ? Merkkarte() : utab === "ordnen" ? Ordnen() : Quiz(utab)}
            {/* Beim W-Fragen-Spiel steht die Aufgabe oben, die Aussage bleibt zum Nachlesen darunter */}
            {utab === "wfragen" && Zeuge()}
          </>
        )
        : tab === "blatt" ? Blatt()
        : tab === "loesung" ? Loesung()
        : SelbstCheck()}
      <button data-test="bt-zurueck" onClick={zurueck} className="kein-druck"
        style={{ background: "transparent", color: T.textLeise, fontSize: "var(--schrift-klein)" }}>
        ← Zurück zur Übungs-Wahl
      </button>
    </div>
  );
}
