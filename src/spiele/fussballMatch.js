/* ============================================================
   ⚽ FUSSBALL-MATCH – originalgetreuer Port aus der Alt-App:
   wie das Tennis-Match, nur mit Toren. 2 Halbzeiten mit je 5
   Torchancen: richtige Antwort = Tor für das Kind, falsche =
   Konter-Tor für den Gegner. Steht es am Ende unentschieden,
   entscheidet EIN Elfmeter. Coach Leo (fussball.json) begleitet
   das Match – inklusive eigener Torwart-Karte.
   hooks: { name, runden, onFertig(erg), schnell }
   ============================================================ */
import FUSSBALL from "./fussball.json";
import { spielFrage, spielFrageText, spielOptionenHTML } from "./fragen.js";
import { mutDialog, mutDialogBind, mutMini, mutKompakt } from "./mutmacher.js";

export const FB_CHANCEN = 5; // Torchancen je Halbzeit

export function fussballMatchStart(host, hooks = {}) {
  const schnell = () => !!(hooks.schnell || (typeof window !== "undefined" && window.__SPIEL_SCHNELL__));
  const spielT = (ms) => (schnell() ? Math.max(15, ms / 12) : ms);
  const $ = (id) => host.querySelector("#" + id);
  const name = hooks.name || "Du";
  const runden = Math.max(0, hooks.runden || 0);

  const f = {
    gegner: FUSSBALL.gegner[runden % Math.max(1, FUSSBALL.gegner.length)],
    halbzeit: 1, chance: 0, mir: 0, ihm: 0,
    balls: 0, wins: 0, serie: 0, phase: "intro", frage: null,
    faktIdx: runden % Math.max(1, FUSSBALL.fakten.length), timer: null,
  };
  const stopp = () => { if (f.timer) { clearInterval(f.timer); f.timer = null; } };
  const mental = (id) => (FUSSBALL.mental || []).find((m) => m.id === id) || null;
  const mentalKompakt = (id) => mutKompakt(mental(id), f.balls);

  // Steigerung: Halbzeit 1 leichte Wörter, ab Halbzeit 2 (und beim stärksten Gegner) schwere
  const frage = () => spielFrage(f.halbzeit >= 2 || f.gegner.staerke >= 3 || f.phase === "elfmeter");
  function fakt() {
    const F = FUSSBALL.fakten || []; if (!F.length) return "";
    const fk = F[f.faktIdx % F.length]; f.faktIdx++;
    return `<div class="spiel-hint">🧐 <b>Fußball-Wissen – ${fk.begriff}:</b> ${fk.text}</div>`;
  }
  function feldSVG() {
    const g = f.gegner;
    return `<svg id="fbFeld" viewBox="0 0 340 180" xmlns="http://www.w3.org/2000/svg">
      <rect width="340" height="180" rx="14" fill="#3f9d54"/>
      <rect x="10" y="12" width="320" height="156" fill="none" stroke="#eaf7ea" stroke-width="2.5"/>
      ${[26, 58, 90, 122, 154, 186, 218, 250, 282].map((x, i) => `<rect x="${x}" y="14" width="16" height="152" fill="#ffffff" opacity="${i % 2 ? 0.05 : 0}"/>`).join("")}
      <circle cx="110" cy="90" r="30" fill="none" stroke="#eaf7ea" stroke-width="2"/>
      <rect x="264" y="42" width="66" height="96" fill="none" stroke="#eaf7ea" stroke-width="2"/>
      <line x1="306" y1="40" x2="306" y2="140" stroke="#fff" stroke-width="4"/>
      <line x1="306" y1="40" x2="330" y2="52" stroke="#fff" stroke-width="3"/>
      <line x1="306" y1="140" x2="330" y2="128" stroke="#fff" stroke-width="3"/>
      ${[52, 68, 84, 100, 116, 132].map((y) => `<line x1="306" y1="${y}" x2="330" y2="${y + 6}" stroke="#dfe8df" stroke-width="1" opacity="0.8"/>`).join("")}
      <text id="fbKeeper" x="296" y="98" font-size="24" text-anchor="middle">${g.emoji}</text>
      <text x="285" y="160" font-size="11" text-anchor="middle" fill="#fff" font-weight="700">${g.name}</text>
      <text id="fbIch" x="70" y="112" font-size="26" text-anchor="middle">🧒</text>
      <text x="70" y="134" font-size="11" text-anchor="middle" fill="#fff" font-weight="700">${name}</text>
      <text id="fbBall" x="86" y="118" font-size="13" text-anchor="middle">⚽</text>
    </svg>`;
  }
  // Schuss: Tor → Ball fliegt in die Ecke, sonst → der Keeper hält ihn fest
  function schuss(tor, cb) {
    stopp();
    const ball = $("fbBall"); if (!ball) { cb && cb(); return; }
    const x0 = 86, y0 = 118;
    const x1 = tor ? 314 : 294, y1 = tor ? (56 + (f.balls % 3) * 32) : 96;
    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let z = reduce ? 1 : 0;
    f.timer = setInterval(() => {
      if (!$("fbBall")) { stopp(); return; }
      z = Math.min(1, z + 0.11);
      ball.setAttribute("x", x0 + (x1 - x0) * z);
      ball.setAttribute("y", y0 + (y1 - y0) * z - Math.sin(z * Math.PI) * 30);
      if (z >= 1) { stopp(); cb && cb(); }
    }, spielT(35));
  }
  function fragBox() {
    const box = $("fbQ"); if (!box) return;
    const q = f.frage; if (!q) { box.innerHTML = ""; return; }
    const elf = f.phase === "elfmeter";
    const kopf = elf ? "⚡ <b>Elfmeterschießen!</b> Dieser Ball entscheidet das Match"
      : `🎯 <b>Torchance ${f.chance + 1} von ${FB_CHANCEN}</b>`;
    const stufe = q.schwer ? "🔥 schwere Frage" : "🌱 leichte Frage";
    const mentalOben = elf ? mutMini(mental("elfmeter"), f.balls)
      : f.balls === 0 ? mentalKompakt("torschuss")
      : f.balls === 1 ? mentalKompakt("abwehr")
      : f.balls === 2 ? mentalKompakt("torwart") : "";
    box.innerHTML = `
      ${mentalOben}
      <div class="spiel-hint">${kopf} gegen ${f.gegner.emoji} <b>${f.gegner.name}</b><br>
        <span class="spiel-leise" style="font-size:13px;">${stufe}</span> · ${spielFrageText(q)}</div>
      <div style="display:flex; gap:8px; margin-top:8px; flex-wrap:wrap;">${spielOptionenHTML(q.w, "fb-opt")}</div>
      <div id="fbfb"></div>`;
    box.querySelectorAll(".fb-opt").forEach((btn) => btn.onclick = () => {
      if (btn.disabled) return;
      const elf2 = f.phase === "elfmeter";
      const correct = btn.dataset.w === q.w.richtig;
      box.querySelectorAll(".fb-opt").forEach((b3) => {
        b3.disabled = true;
        if (b3.dataset.w === q.w.richtig) b3.style.background = "#d9f0dd";
      });
      f.balls++;
      if (!elf2) f.chance++;
      if (correct) { f.mir++; f.wins++; f.serie = 0; }
      else { f.ihm++; f.serie++; }
      const fb = box.querySelector("#fbfb");
      const d = document.createElement("div"); d.className = "spiel-feedback " + (correct ? "ok" : "tip");
      d.setAttribute("data-test", "fb-feedback");
      // Der Hinweis bleibt stehen – weiter geht es erst per Knopf.
      d.innerHTML = correct
        ? `⚽ <b>TOOOR!</b> Jetzt steht es ${f.mir} : ${f.ihm}.<br>💡 ${q.tipp}`
        : `${f.gegner.emoji} Gehalten – richtig wäre <b>„${q.w.richtig}“</b>! Konter: Jetzt steht es ${f.mir} : ${f.ihm}.<br>💡 ${q.tipp}`;
      const weiter = document.createElement("button");
      weiter.className = "spiel-weiter"; weiter.style.width = "100%";
      weiter.setAttribute("data-test", "fb-weiter"); weiter.disabled = true;
      weiter.textContent = (elf2 || f.chance >= FB_CHANCEN) ? "Weiter ➡️" : "Nächster Ball ⚽";
      fb.innerHTML = ""; fb.appendChild(d);
      if (!correct) {
        const m = document.createElement("div");
        m.innerHTML = f.serie >= 2 ? mutMini(mental("fehlerserie"), f.serie) : mentalKompakt("fehler");
        fb.appendChild(m);
      }
      fb.appendChild(weiter);
      schuss(correct, () => { weiter.disabled = false; const s = $("fbStand"); if (s) s.textContent = f.mir + " : " + f.ihm; });
      weiter.onclick = () => { if (!weiter.disabled) next(); };
    });
  }
  function next() {
    if (f.phase === "elfmeter") { f.phase = "ende"; render(); return; }
    if (f.chance >= FB_CHANCEN) {
      if (f.halbzeit === 1) { f.phase = "halbzeit"; }
      else if (f.mir === f.ihm) { f.phase = "elfmeter"; f.frage = frage(); }
      else { f.phase = "ende"; }
    } else {
      f.frage = frage();
    }
    render();
  }
  function render() {
    stopp();
    const g = f.gegner;
    if (f.phase === "intro") {
      const mId = runden % 2 === 0 ? "match" : "training";
      host.innerHTML = `
        <div data-test="fussball">
          <h2 style="margin:0 0 6px;">⚽ Fußball-Match</h2>
          <p>Heute spielst du gegen <b>${g.emoji} ${g.name}</b>! <span class="spiel-leise">${g.spruch}</span></p>
          <p class="spiel-leise" style="margin:6px 0 8px;">Richtige Antwort (Wörter &amp; Mathe) = <b>Tor für dich</b>, falsche = Konter-Tor für ${g.name}.
            Es gibt <b>2 Halbzeiten mit je ${FB_CHANCEN} Torchancen</b> – bei Gleichstand entscheidet ein Elfmeter!</p>
          ${mutDialog(mental(mId))}
          <button class="spiel-weiter" id="fbStart" data-test="fb-start" style="width:100%;" disabled>⚽ Anstoß!</button>
        </div>`;
      const btn = $("fbStart");
      mutDialogBind(host, () => { btn.disabled = false; });
      btn.onclick = () => {
        if (btn.disabled) return;
        f.phase = "ball"; f.frage = frage(); render();
      };
      return;
    }
    if (f.phase === "halbzeit") {
      const mId = f.mir === f.ihm ? "nervositaet" : (f.mir > f.ihm ? "fuehrung" : "rueckstand");
      host.innerHTML = `
        <div data-test="fb-halbzeit">
          <h2 style="margin:0 0 6px;">🔁 Halbzeit!</h2>
          <p><b>Spielstand: ${f.mir} : ${f.ihm}</b> – kurz durchatmen und auftanken.</p>
          ${fakt()}
          ${mentalKompakt("halbzeit")}
          ${mutMini(mental(mId), f.mir + f.ihm)}
          <button class="spiel-weiter" id="fbWeiter" data-test="fb-weiter" style="width:100%;">Weiter – 2. Halbzeit ⚽</button>
        </div>`;
      $("fbWeiter").onclick = () => {
        f.halbzeit = 2; f.chance = 0;
        f.phase = "ball"; f.frage = frage(); render();
      };
      return;
    }
    if (f.phase === "ende") {
      const gewonnen = f.mir > f.ihm;
      host.innerHTML = `
        <div data-test="fb-ende">
          <h2 style="margin:0 0 6px;">${gewonnen ? "🏆 Match gewonnen!" : "💪 Starkes Match!"}</h2>
          <p><b>Endstand: ${f.mir} : ${f.ihm}</b> gegen ${g.emoji} ${g.name} ·
            Du hast <b>${f.wins} von ${f.balls}</b> Bällen verwandelt.</p>
          ${fakt()}
          ${mutMini(mental("lob"), runden)}
          <button class="spiel-weiter" id="fbFertig" data-test="fb-fertig" style="width:100%;">Zur Auswertung 🌱</button>
        </div>`;
      $("fbFertig").onclick = () => {
        stopp();
        hooks.onFertig && hooks.onFertig({
          balls: f.balls, wins: f.wins, mir: f.mir, ihm: f.ihm,
          gewonnen, gegner: g.name,
        });
      };
      return;
    }
    // Phase "ball" / "elfmeter": Platz + Frage
    const hz = f.phase === "elfmeter" ? "⚡ Elfmeter" : `Halbzeit ${f.halbzeit}`;
    host.innerHTML = `
      <div data-test="fussball">
        <div style="display:flex; justify-content:space-between; align-items:baseline; gap:8px; flex-wrap:wrap;">
          <h2 style="margin:0;">⚽ Fußball-Match</h2>
          <span style="font-weight:800; white-space:nowrap;">${hz} · Tore <span id="fbStand" data-test="fb-stand">${f.mir} : ${f.ihm}</span></span>
        </div>
        <div class="tennis-wrap" style="margin-top:8px;">
          <div class="tennis-feld">${feldSVG()}</div>
          <div id="fbQ"></div>
        </div>
      </div>`;
    fragBox();
  }

  render();
  return { stop: stopp };
}
