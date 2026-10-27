/* ============================================================
   🏁 MATCH-ENGINE – EINE Engine, viele Welten (Phase 4).
   Verallgemeinert den bewährten Ablauf von Tennis-/Fußball-Match:
   Intro mit Coach Leo → Frage-Runden (richtig = Punkt für dich,
   falsch = Punkt für den Gegner) → Pause zwischen den Abschnitten →
   bei Gleichstand EINE Entscheidungs-Frage → Ende mit Lob.
   Alles Welt-Spezifische steckt im SKIN:
   { key, testPrefix, titel, daten (gegner/fakten/mental/wissen),
     abschnitte, chancen, texte {…}, feldSVG(state), anim(state, correct) }
   Die mental-Karten nutzen FESTE ids: match, training, aktion1-3,
   fehler, fehlerserie, pause, fuehrung, rueckstand, nervositaet,
   entscheidung, lob.
   hooks: { name, runden, onFertig(erg), schnell }
   ============================================================ */
import { spielFrage, spielFrageText, spielOptionenHTML } from "./fragen.js";
import { mutDialog, mutDialogBind, mutMini, mutKompakt } from "./mutmacher.js";

export const MENTAL_IDS = ["match", "training", "aktion1", "aktion2", "aktion3",
  "fehler", "fehlerserie", "pause", "fuehrung", "rueckstand", "nervositaet", "entscheidung", "lob"];

export function matchStart(host, skin, hooks = {}) {
  const schnell = () => !!(hooks.schnell || (typeof window !== "undefined" && window.__SPIEL_SCHNELL__));
  const spielT = (ms) => (schnell() ? Math.max(15, ms / 12) : ms);
  const $ = (id) => host.querySelector("#" + id);
  const p = skin.testPrefix;
  const D = skin.daten;
  const TXT = skin.texte;
  const name = hooks.name || "Du";
  const runden = Math.max(0, hooks.runden || 0);

  const s = {
    name,
    gegner: D.gegner[runden % Math.max(1, D.gegner.length)],
    abschnitt: 1, chance: 0, mir: 0, ihm: 0,
    balls: 0, wins: 0, serie: 0, phase: "intro", frage: null,
    faktIdx: runden % Math.max(1, D.fakten.length), timer: null,
  };
  const stopp = () => { if (s.timer) { clearInterval(s.timer); s.timer = null; } };
  const mental = (id) => (D.mental || []).find((m) => m.id === id) || null;
  const mentalKompakt = (id) => mutKompakt(mental(id), s.balls);

  // Steigerung: Abschnitt 1 leichte Fragen, danach (und beim stärksten Gegner) schwere
  const frage = () => spielFrage(s.abschnitt >= 2 || s.gegner.staerke >= 3 || s.phase === "entscheidung");
  function fakt() {
    const F = D.fakten || []; if (!F.length) return "";
    const f = F[s.faktIdx % F.length]; s.faktIdx++;
    return `<div class="spiel-hint">🧐 <b>${skin.wissen} – ${f.begriff}:</b> ${f.text}</div>`;
  }
  // Bewegung des Läufers/Flitzers: richtig = DU rückst vor, falsch = der Gegner
  function bewegung(correct, cb) {
    stopp();
    const a = skin.anim(s, correct);
    const el = $(a.id); if (!el) { cb && cb(); return; }
    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let z = reduce ? 1 : 0;
    s.timer = setInterval(() => {
      if (!$(a.id)) { stopp(); return; }
      z = Math.min(1, z + 0.11);
      el.setAttribute("x", a.x0 + (a.x1 - a.x0) * z);
      el.setAttribute("y", a.y0 + (a.y1 - a.y0) * z - Math.sin(z * Math.PI) * (a.bogen || 0));
      if (z >= 1) { stopp(); cb && cb(); }
    }, spielT(35));
  }
  function fragBox() {
    const box = $(`${p}Q`); if (!box) return;
    const q = s.frage; if (!q) { box.innerHTML = ""; return; }
    const ent = s.phase === "entscheidung";
    const kopf = ent ? TXT.entscheidungKopf : TXT.aktionKopf(s.chance + 1, skin.chancen);
    const stufe = q.schwer ? "🔥 schwere Frage" : "🌱 leichte Frage";
    const mentalOben = ent ? mutMini(mental("entscheidung"), s.balls)
      : s.balls === 0 ? mentalKompakt("aktion1")
      : s.balls === 1 ? mentalKompakt("aktion2")
      : s.balls === 2 ? mentalKompakt("aktion3") : "";
    box.innerHTML = `
      ${mentalOben}
      <div class="spiel-hint">${kopf} gegen ${s.gegner.emoji} <b>${s.gegner.name}</b><br>
        <span class="spiel-leise" style="font-size:13px;">${stufe}</span> · ${spielFrageText(q)}</div>
      <div style="display:flex; gap:8px; margin-top:8px; flex-wrap:wrap;">${spielOptionenHTML(q.w, `${p}-opt`)}</div>
      <div id="${p}fb"></div>`;
    box.querySelectorAll(`.${p}-opt`).forEach((btn) => btn.onclick = () => {
      if (btn.disabled) return;
      const ent2 = s.phase === "entscheidung";
      const correct = btn.dataset.w === q.w.richtig;
      box.querySelectorAll(`.${p}-opt`).forEach((b3) => {
        b3.disabled = true;
        if (b3.dataset.w === q.w.richtig) b3.style.background = "#d9f0dd";
      });
      s.balls++;
      if (!ent2) s.chance++;
      if (correct) { s.mir++; s.wins++; s.serie = 0; }
      else { s.ihm++; s.serie++; }
      const fb = box.querySelector(`#${p}fb`);
      const d = document.createElement("div"); d.className = "spiel-feedback " + (correct ? "ok" : "tip");
      d.setAttribute("data-test", `${p}-feedback`);
      // Der Hinweis bleibt stehen – weiter geht es erst per Knopf.
      d.innerHTML = (correct ? TXT.okText(s) : TXT.fehlerText(q.w.richtig, s)) + `<br>💡 ${q.tipp}`;
      const weiter = document.createElement("button");
      weiter.className = "spiel-weiter"; weiter.style.width = "100%";
      weiter.setAttribute("data-test", `${p}-weiter`); weiter.disabled = true;
      weiter.textContent = (ent2 || s.chance >= skin.chancen) ? "Weiter ➡️" : TXT.naechste;
      fb.innerHTML = ""; fb.appendChild(d);
      if (!correct) {
        const m = document.createElement("div");
        m.innerHTML = s.serie >= 2 ? mutMini(mental("fehlerserie"), s.serie) : mentalKompakt("fehler");
        fb.appendChild(m);
      }
      fb.appendChild(weiter);
      bewegung(correct, () => {
        weiter.disabled = false;
        const st = $(`${p}Stand`); if (st) st.textContent = `${s.mir} : ${s.ihm}`;
      });
      weiter.onclick = () => { if (!weiter.disabled) next(); };
    });
  }
  function next() {
    if (s.phase === "entscheidung") { s.phase = "ende"; render(); return; }
    if (s.chance >= skin.chancen) {
      if (s.abschnitt < skin.abschnitte) { s.phase = "pause"; }
      else if (s.mir === s.ihm) { s.phase = "entscheidung"; s.frage = frage(); }
      else { s.phase = "ende"; }
    } else {
      s.frage = frage();
    }
    render();
  }
  function render() {
    stopp();
    const g = s.gegner;
    if (s.phase === "intro") {
      const mId = runden % 2 === 0 ? "match" : "training";
      host.innerHTML = `
        <div data-test="${p}">
          <h2 style="margin:0 0 6px;">${skin.titel}</h2>
          <p>Heute trittst du gegen <b>${g.emoji} ${g.name}</b> an! <span class="spiel-leise">${g.spruch}</span></p>
          <p class="spiel-leise" style="margin:6px 0 8px;">${TXT.intro}</p>
          ${mutDialog(mental(mId))}
          <button class="spiel-weiter" id="${p}Start" data-test="${p}-start" style="width:100%;" disabled>${TXT.startKnopf}</button>
        </div>`;
      const btn = $(`${p}Start`);
      mutDialogBind(host, () => { btn.disabled = false; });
      btn.onclick = () => {
        if (btn.disabled) return;
        s.phase = "ball"; s.frage = frage(); render();
      };
      return;
    }
    if (s.phase === "pause") {
      const mId = s.mir === s.ihm ? "nervositaet" : (s.mir > s.ihm ? "fuehrung" : "rueckstand");
      host.innerHTML = `
        <div data-test="${p}-pause">
          <h2 style="margin:0 0 6px;">${TXT.pausenTitel}</h2>
          <p><b>Zwischenstand: ${s.mir} : ${s.ihm}</b> – kurz durchatmen und auftanken.</p>
          ${fakt()}
          ${mentalKompakt("pause")}
          ${mutMini(mental(mId), s.mir + s.ihm)}
          <button class="spiel-weiter" id="${p}Weiter" data-test="${p}-weiter" style="width:100%;">${TXT.pausenWeiter(s.abschnitt + 1)}</button>
        </div>`;
      $(`${p}Weiter`).onclick = () => {
        s.abschnitt++; s.chance = 0;
        s.phase = "ball"; s.frage = frage(); render();
      };
      return;
    }
    if (s.phase === "ende") {
      const gewonnen = s.mir > s.ihm;
      host.innerHTML = `
        <div data-test="${p}-ende">
          <h2 style="margin:0 0 6px;">${gewonnen ? TXT.siegTitel : "💪 Stark gekämpft!"}</h2>
          <p><b>Endstand: ${s.mir} : ${s.ihm}</b> gegen ${g.emoji} ${g.name} ·
            Du hast <b>${s.wins} von ${s.balls}</b> Fragen richtig.</p>
          ${fakt()}
          ${mutMini(mental("lob"), runden)}
          <button class="spiel-weiter" id="${p}Fertig" data-test="${p}-fertig" style="width:100%;">Zur Auswertung 🌱</button>
        </div>`;
      $(`${p}Fertig`).onclick = () => {
        stopp();
        hooks.onFertig && hooks.onFertig({
          balls: s.balls, wins: s.wins, mir: s.mir, ihm: s.ihm,
          gewonnen, gegner: g.name,
        });
      };
      return;
    }
    // Phase "ball" / "entscheidung": Feld + Frage
    const abschnitt = s.phase === "entscheidung" ? TXT.entscheidungKurz : `${TXT.abschnittName} ${s.abschnitt}`;
    host.innerHTML = `
      <div data-test="${p}">
        <div style="display:flex; justify-content:space-between; align-items:baseline; gap:8px; flex-wrap:wrap;">
          <h2 style="margin:0;">${skin.titel}</h2>
          <span style="font-weight:800; white-space:nowrap;">${abschnitt} · Stand <span id="${p}Stand" data-test="${p}-stand">${s.mir} : ${s.ihm}</span></span>
        </div>
        <div class="tennis-wrap" style="margin-top:8px;">
          <div class="tennis-feld">${skin.feldSVG(s)}</div>
          <div id="${p}Q"></div>
        </div>
      </div>`;
    fragBox();
  }

  render();
  return { stop: stopp };
}
