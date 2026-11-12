/* Gemeinsame Blitz-Fragen der Spiele (aus der Alt-App übernommen):
   ~50 % kompakte Mathe-Aufgaben, sonst Grundwortschatz-Schreibweisen
   mit erzeugter DRITTER Falsch-Variante (typische Fehlermuster der
   Grundschule, Ratechance 33 %). Genutzt von See-Abenteuer & Blockwelt. */
import { MATHE_DATEN } from "../calc/aufgaben/mathe.js";
import { gwsPool } from "../calc/aufgaben/deutschKonverter.js";
import { spielQuellen } from "../calc/klassen.js";
import { vorlesen, vorlesbar, sprechSauber } from "../vorlesen.js";

/* 🎒 Klasse und Vorlese-Modus setzt die Spielhalle vor jedem Spiel (v0.87).
   Klasse 1/2 zieht ihre Fragen aus den eigenen Pools (calc/klassen.js);
   Klasse 3/4 behält die bewährten Blitz-Fragen. */
let aktiv = { klasse: 4, vorlesen: "aus", quellen: null };
export function spielKlasseSetzen(klasse, vorleseModus = "aus") {
  if (aktiv.klasse !== klasse) aktiv = { ...aktiv, klasse, quellen: spielQuellen(klasse) };
  aktiv.vorlesen = vorleseModus;
}
/** Vorlesetext einer Spiel-Frage (ohne Emojis und HTML). */
export function spielSprechText(q) {
  return sprechSauber(q.sprich || q.frage || "Welches Wort ist richtig geschrieben?");
}
// 🔊 Ein Lautsprecher-Knopf je Frage; EIN delegierter Klick-Hörer für alle Spiele.
if (typeof document !== "undefined") {
  document.addEventListener("click", (e) => {
    const knopf = e.target && e.target.closest ? e.target.closest("[data-sprich]") : null;
    if (!knopf) return;
    e.stopPropagation();
    vorlesen(knopf.getAttribute("data-sprich"));
  }, true);
}
const attr = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

const GWS = gwsPool();
const WORT_POOL = {
  leicht: GWS.easy.map((a) => ({ w: { richtig: a.r, falsch: a.x[0] }, tipp: a.tipp })),
  schwer: GWS.hard.map((a) => ({ w: { richtig: a.r, falsch: a.x[0] }, tipp: a.tipp })),
};

export function spielMatheFrage(schwer) {
  const kandidaten = ["mrechnen", "mzahlen"].flatMap((k) =>
    (schwer ? MATHE_DATEN[k].hard : MATHE_DATEN[k].easy))
    // Blöcke-Aufgaben brauchen die Grafik – die gibt es nur im Üben-Bereich
    .filter((a) => !a.bloecke && a.f.length <= 80 && [a.r].concat(a.x).every((o) => o.length <= 16));
  if (!kandidaten.length) return null;
  const a = kandidaten[Math.floor(Math.random() * kandidaten.length)];
  return { w: { richtig: a.r, falsch: a.x[0], dritte: a.x[1] }, tipp: a.tipp, schwer: !!schwer, mathe: true, frage: a.f };
}

export function spielFrage(schwer) {
  if (aktiv.quellen) {
    // Klasse 1/2: eine kurze Aufgabe aus den Pools der Klasse (leicht/schwer)
    const liste = schwer && aktiv.quellen.schwer.length ? aktiv.quellen.schwer : aktiv.quellen.leicht;
    const a = liste[Math.floor(Math.random() * liste.length)];
    const q = { w: { richtig: a.r, falsch: a.x[0], dritte: a.x[1] }, tipp: a.tipp, schwer: !!schwer, eigen: true, frage: a.f, sprich: a.sprich };
    if (aktiv.vorlesen === "auto") setTimeout(() => vorlesen(spielSprechText(q)), 300);
    return q;
  }
  if (Math.random() < 0.5) { const m = spielMatheFrage(schwer); if (m) return m; }
  const pool = schwer ? WORT_POOL.schwer : WORT_POOL.leicht;
  const t = pool[Math.floor(Math.random() * pool.length)];
  return { w: t.w, tipp: t.tipp, schwer: !!schwer };
}

export function spielFrageText(q) {
  const text = q.eigen ? ("<b>" + q.frage + "</b>")
    : q.mathe ? ("🔢 <b>" + q.frage + "</b>") : "Welches Wort ist <b>richtig</b> geschrieben?";
  if (aktiv.vorlesen === "aus" || !vorlesbar()) return text;
  return text + ` <button type="button" class="spiel-vorlesen" data-test="spiel-vorlesen" aria-label="Frage vorlesen" data-sprich="${attr(spielSprechText(q))}">`
    + '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 10v4h4l5 4V6l-5 4z"/><path d="M16.5 9a4 4 0 010 6M19 6.5a8 8 0 010 11"/></svg></button>';
}

/* Gegen das Raten: dritte falsche Schreibweise aus typischen
   Fehlermustern der Grundschule (Original-Logik der Alt-App). */
export function drittesFalsch(w) {
  const r = w.richtig, f = w.falsch, kand = [];
  const push = (v) => { if (v && v !== r && v !== f && !kand.includes(v)) kand.push(v); };
  if (r.includes("ie")) { push(r.replace("ie", "i")); push(r.replace("ie", "ieh")); }
  const dm = r.match(/(mm|nn|ll|tt|pp|ff|rr|dd|bb|gg)/); if (dm) push(r.replace(dm[1], dm[1][0]));
  push(r.replace(/([aeiouäöü])h(?=[lmnrt])/, "$1"));
  push(r.replace("ck", "k"));
  push(r.replace("tz", "z"));
  push(r.replace("ß", "ss"));
  push(r.replace("ss", "ß"));
  push(r.replace(/([^aeiouäöü])i([^aeiouäöü])/, "$1ie$2"));
  const art = r.match(/^((?:der|die|das) )([A-ZÄÖÜ])(.*)$/);
  if (art) push(art[1] + art[2].toLowerCase() + art[3]);
  else if (/^[A-ZÄÖÜ]/.test(r) && !/en$/.test(r)) push(r.charAt(0).toLowerCase() + r.slice(1));
  return kand.length ? kand[0] : null;
}

export function spielOptionen(w) {
  const opts = [w.richtig, w.falsch];
  const d = w.dritte || drittesFalsch(w); if (d) opts.push(d);
  for (let i = opts.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = opts[i]; opts[i] = opts[j]; opts[j] = t; }
  return opts;
}

export function spielOptionenHTML(w, klasse = "spiel-opt") {
  return spielOptionen(w).map((o) =>
    `<button class="spiel-opt ${klasse}" data-test="spiel-opt" data-w="${o}" ${o === w.richtig ? 'data-richtig="1"' : ""}>${o}</button>`).join("");
}
