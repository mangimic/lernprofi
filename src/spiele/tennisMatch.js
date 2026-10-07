/* ============================================================
   🎾 TENNIS-MATCH – originalgetreuer Port aus der Alt-App:
   Wörter (Grundwortschatz) und Mathe als Ballwechsel.
   Richtige Antwort = Punkt für das Kind, falsche = Punkt für den
   Gegner. Ein Spiel geht bis 4 Punkte (15–30–40–Spiel, bei 40:40
   entscheidet der nächste Ball), das Match gewinnt, wer 2 Spiele
   holt. Coach Leo (tennis.json) begleitet das Match: vor dem
   Start, nach Fehlern, bei Führung/Rückstand, beim
   Entscheidungsball und mit einem Lob am Ende.
   hooks: { name, runden, onFertig(erg), schnell }
   ============================================================ */
import TENNIS from "./tennis.json";
import { spielFrage, spielFrageText, spielOptionenHTML } from "./fragen.js";
import { mutDialog, mutDialogBind, mutMini, mutKompakt } from "./mutmacher.js";

export function tennisMatchStart(host, hooks = {}) {
  const schnell = () => !!(hooks.schnell || (typeof window !== "undefined" && window.__SPIEL_SCHNELL__));
  const spielT = (ms) => (schnell() ? Math.max(15, ms / 12) : ms);
  const $ = (id) => host.querySelector("#" + id);
  const name = hooks.name || "Du";
  const runden = Math.max(0, hooks.runden || 0);

  const t = {
    gegner: TENNIS.gegner[runden % Math.max(1, TENNIS.gegner.length)],
    spielNr: 1, mir: 0, ihm: 0, spieleMir: 0, spieleIhm: 0,
    balls: 0, wins: 0, serie: 0, phase: "intro", frage: null,
    letzterSieg: false, faktIdx: runden % Math.max(1, TENNIS.fakten.length), timer: null,
  };
  const stopp = () => { if (t.timer) { clearInterval(t.timer); t.timer = null; } };
  const mental = (id) => (TENNIS.mental || []).find((m) => m.id === id) || null;
  const mentalKompakt = (id) => mutKompakt(mental(id), t.balls);

  // Steigerung: Spiel 1 leichte Wörter, ab Spiel 2 (und beim stärksten Gegner) schwere
  const frage = () => spielFrage(t.spielNr >= 2 || t.gegner.staerke >= 3);
  function fakt() {
    const F = TENNIS.fakten || []; if (!F.length) return "";
    const f = F[t.faktIdx % F.length]; t.faktIdx++;
    return `<div class="spiel-hint">🧐 <b>Tennis-Wissen – ${f.begriff}:</b> ${f.text}</div>`;
  }
  function stand() {
    const P = ["0", "15", "30", "40"];
    return P[Math.min(3, t.mir)] + " : " + P[Math.min(3, t.ihm)];
  }
  function feldSVG() {
    const g = t.gegner;
    return `<svg id="tennisFeld" viewBox="0 0 340 180" xmlns="http://www.w3.org/2000/svg">
      <rect width="340" height="180" rx="14" fill="#b85f3e"/>
      <rect x="28" y="22" width="284" height="136" fill="#d98559" stroke="#fff" stroke-width="3"/>
      <line x1="98" y1="22" x2="98" y2="158" stroke="#fff" stroke-width="2"/>
      <line x1="242" y1="22" x2="242" y2="158" stroke="#fff" stroke-width="2"/>
      <line x1="98" y1="90" x2="242" y2="90" stroke="#fff" stroke-width="2"/>
      <line x1="170" y1="14" x2="170" y2="166" stroke="#2f2f2f" stroke-width="3"/>
      <line x1="170" y1="14" x2="170" y2="166" stroke="#fff" stroke-width="1" stroke-dasharray="3 3"/>
      <text id="tennisIch" x="56" y="96" font-size="26" text-anchor="middle">🧒</text>
      <text x="56" y="122" font-size="11" text-anchor="middle" fill="#fff" font-weight="700">${name}</text>
      <text id="tennisGegner" x="284" y="96" font-size="26" text-anchor="middle">${g.emoji}</text>
      <text x="284" y="122" font-size="11" text-anchor="middle" fill="#fff" font-weight="700">${g.name}</text>
      <text id="tennisBall" x="76" y="86" font-size="13" text-anchor="middle">🎾</text>
    </svg>`;
  }
  // Ballflug: gewonnen → vorbei am Gegner, verloren → ins Netz
  function schlag(gewonnen, cb) {
    stopp();
    const ball = $("tennisBall"); if (!ball) { cb && cb(); return; }
    const x0 = 76, y0 = 86;
    const x1 = gewonnen ? 300 : 168, y1 = gewonnen ? (52 + (t.balls % 3) * 30) : 96;
    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let z = reduce ? 1 : 0;
    t.timer = setInterval(() => {
      if (!$("tennisBall")) { stopp(); return; }
      z = Math.min(1, z + 0.11);
      ball.setAttribute("x", x0 + (x1 - x0) * z);
      ball.setAttribute("y", y0 + (y1 - y0) * z - Math.sin(z * Math.PI) * 34);
      if (z >= 1) {
        stopp();
        if (!gewonnen) ball.setAttribute("y", y1 + 16);
        cb && cb();
      }
    }, spielT(35));
  }
  function fragBox() {
    const box = $("tennisQ"); if (!box) return;
    const q = t.frage; if (!q) { box.innerHTML = ""; return; }
    const aufschlag = t.balls % 2 === 0;
    const kopf = aufschlag ? "🎯 Dein <b>Aufschlag</b>" : "🧲 Dein <b>Return</b>";
    const stufe = q.schwer ? "🔥 schwere Frage" : "🌱 leichte Frage";
    const entscheidung = (t.mir === 3 && t.ihm === 3);
    const mentalOben = entscheidung ? mutMini(mental("tiebreak"), t.balls)
      : t.balls === 0 ? mentalKompakt("aufschlag")
      : t.balls === 1 ? mentalKompakt("return") : "";
    box.innerHTML = `
      ${entscheidung ? `<div class="spiel-feedback tip">⚡ <b>40:40 – Entscheidungsball!</b> Der nächste Punkt holt das Spiel.</div>` : ""}
      ${mentalOben}
      <div class="spiel-hint">${kopf} gegen ${t.gegner.emoji} <b>${t.gegner.name}</b><br>
        <span class="spiel-leise" style="font-size:13px;">${stufe}</span> · ${spielFrageText(q)}</div>
      <div style="display:flex; gap:8px; margin-top:8px; flex-wrap:wrap;">${spielOptionenHTML(q.w, "tennis-opt")}</div>
      <div id="tennisfb"></div>`;
    box.querySelectorAll(".tennis-opt").forEach((btn) => btn.onclick = () => {
      if (t.phase !== "ball" || btn.disabled) return;
      const correct = btn.dataset.w === q.w.richtig;
      box.querySelectorAll(".tennis-opt").forEach((b3) => {
        b3.disabled = true;
        if (b3.dataset.w === q.w.richtig) b3.style.background = "#d9f0dd";
      });
      t.balls++;
      if (correct) { t.mir++; t.wins++; t.serie = 0; }
      else { t.ihm++; t.serie++; }
      const fb = box.querySelector("#tennisfb");
      const d = document.createElement("div"); d.className = "spiel-feedback " + (correct ? "ok" : "tip");
      d.setAttribute("data-test", "tennis-feedback");
      // Der Hinweis bleibt stehen – weiter geht es erst per Knopf.
      d.innerHTML = correct
        ? `🎾 <b>Punkt für dich!</b> Jetzt steht es ${stand()}.<br>💡 ${q.tipp}`
        : `Ins Netz – richtig wäre <b>„${q.w.richtig}“</b>! Jetzt steht es ${stand()}.<br>💡 ${q.tipp}`;
      const weiter = document.createElement("button");
      weiter.className = "spiel-weiter"; weiter.style.width = "100%";
      weiter.setAttribute("data-test", "tennis-weiter"); weiter.disabled = true;
      weiter.textContent = (t.mir >= 4 || t.ihm >= 4) ? "Weiter ➡️" : "Nächster Ball 🎾";
      fb.innerHTML = ""; fb.appendChild(d);
      if (!correct) {
        const m = document.createElement("div");
        m.innerHTML = t.serie >= 2 ? mutMini(mental("fehlerserie"), t.serie) : mentalKompakt("fehler");
        fb.appendChild(m);
      }
      fb.appendChild(weiter);
      schlag(correct, () => { weiter.disabled = false; const s = $("tennisStand"); if (s) s.textContent = stand(); });
      weiter.onclick = () => { if (!weiter.disabled) next(); };
    });
  }
  function next() {
    if (t.mir >= 4 || t.ihm >= 4) {
      const ich = t.mir > t.ihm;
      t.letzterSieg = ich;
      if (ich) t.spieleMir++; else t.spieleIhm++;
      if (t.spieleMir >= 2 || t.spieleIhm >= 2) t.phase = "ende";
      else t.phase = "spielende";
    } else {
      t.frage = frage();
    }
    render();
  }
  function render() {
    stopp();
    const g = t.gegner;
    if (t.phase === "intro") {
      const mId = runden % 2 === 0 ? "match" : "training";
      host.innerHTML = `
        <div data-test="tennis">
          <h2 style="margin:0 0 6px;">🎾 Tennis-Match</h2>
          <p>Heute spielst du gegen <b>${g.emoji} ${g.name}</b>! <span class="spiel-leise">${g.spruch}</span></p>
          <p class="spiel-leise" style="margin:6px 0 8px;">Richtige Antwort (Wörter &amp; Mathe) = Punkt für dich, falsche = Punkt für ${g.name}.
            Ein <b>Spiel</b> geht bis 4 Punkte (15 – 30 – 40 – Spiel). Wer zuerst <b>2 Spiele</b> hat, gewinnt das Match.</p>
          ${mutDialog(mental(mId))}
          <button class="spiel-weiter" id="tennisStart" data-test="tennis-start" style="width:100%;" disabled>🎾 Los geht's!</button>
        </div>`;
      const btn = $("tennisStart");
      mutDialogBind(host, () => { btn.disabled = false; });
      btn.onclick = () => {
        if (btn.disabled) return;
        t.phase = "ball"; t.frage = frage(); render();
      };
      return;
    }
    if (t.phase === "spielende") {
      const ich = t.letzterSieg;
      const mId = t.spieleMir === t.spieleIhm ? "nervositaet" : (t.spieleMir > t.spieleIhm ? "fuehrung" : "rueckstand");
      host.innerHTML = `
        <div data-test="tennis-spielende">
          <h2 style="margin:0 0 6px;">${ich ? "🎉 Spiel für dich!" : "😮 Spiel für " + g.name + "!"}</h2>
          <p><b>Spiele ${t.spieleMir} : ${t.spieleIhm}</b> – jetzt ist Seitenwechsel.</p>
          ${fakt()}
          ${mentalKompakt("seitenwechsel")}
          ${mutMini(mental(mId), t.spieleMir + t.spieleIhm)}
          <button class="spiel-weiter" id="tennisWeiter" data-test="tennis-weiter" style="width:100%;">Weiter – Spiel ${t.spielNr + 1} 🎾</button>
        </div>`;
      $("tennisWeiter").onclick = () => {
        t.spielNr++; t.mir = 0; t.ihm = 0;
        t.phase = "ball"; t.frage = frage(); render();
      };
      return;
    }
    if (t.phase === "ende") {
      const gewonnen = t.spieleMir > t.spieleIhm;
      host.innerHTML = `
        <div data-test="tennis-ende">
          <h2 style="margin:0 0 6px;">${gewonnen ? "🏆 Match gewonnen!" : "💪 Starkes Match!"}</h2>
          <p><b>Endstand: ${t.spieleMir} : ${t.spieleIhm}</b> gegen ${g.emoji} ${g.name} ·
            Du hast <b>${t.wins} von ${t.balls}</b> Bällen gewonnen.</p>
          ${fakt()}
          ${mutMini(mental("lob"), runden)}
          <button class="spiel-weiter" id="tennisFertig" data-test="tennis-fertig" style="width:100%;">Zur Auswertung 🌱</button>
        </div>`;
      $("tennisFertig").onclick = () => {
        stopp();
        hooks.onFertig && hooks.onFertig({
          balls: t.balls, wins: t.wins,
          spieleMir: t.spieleMir, spieleIhm: t.spieleIhm,
          gewonnen, gegner: g.name,
        });
      };
      return;
    }
    // Phase "ball": Platz + Frage
    host.innerHTML = `
      <div data-test="tennis">
        <div style="display:flex; justify-content:space-between; align-items:baseline; gap:8px; flex-wrap:wrap;">
          <h2 style="margin:0;">🎾 Tennis-Match</h2>
          <span style="font-weight:800; white-space:nowrap;">Spiel ${t.spielNr} · Spiele ${t.spieleMir}:${t.spieleIhm} · <span id="tennisStand" data-test="tennis-stand">${stand()}</span></span>
        </div>
        <div class="tennis-wrap" style="margin-top:8px;">
          <div class="tennis-feld">${feldSVG()}</div>
          <div id="tennisQ"></div>
        </div>
      </div>`;
    fragBox();
  }

  render();
  return { stop: stopp };
}
