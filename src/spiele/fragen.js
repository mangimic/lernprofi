/* Gemeinsame Blitz-Fragen der Spiele (aus der Alt-App übernommen):
   ~50 % kompakte Mathe-Aufgaben, sonst Grundwortschatz-Schreibweisen
   mit erzeugter DRITTER Falsch-Variante (typische Fehlermuster der
   Grundschule, Ratechance 33 %). Genutzt von See-Abenteuer & Blockwelt. */
import { MATHE_DATEN } from "../calc/aufgaben/mathe.js";
import { gwsPool } from "../calc/aufgaben/deutschKonverter.js";

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
  if (Math.random() < 0.5) { const m = spielMatheFrage(schwer); if (m) return m; }
  const pool = schwer ? WORT_POOL.schwer : WORT_POOL.leicht;
  const t = pool[Math.floor(Math.random() * pool.length)];
  return { w: t.w, tipp: t.tipp, schwer: !!schwer };
}

export function spielFrageText(q) {
  return q.mathe ? ("🔢 <b>" + q.frage + "</b>") : "Welches Wort ist <b>richtig</b> geschrieben?";
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
