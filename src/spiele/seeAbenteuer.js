/* ============================================================
   🎣 SEE-ABENTEUER – originalgetreuer Port aus der Alt-App:
   Angelplätze antippen (oder Steuerkreuz) – die Figur läuft von
   selbst um den See (das Wasser blockiert den Weg), wirft die
   Angel aus (Schwimmer-Animation), dann kommt die Frage.
   Große Fische brauchen 2–3 richtige Antworten und werden Stück
   für Stück herangezogen. Falsche Antwort: Lösung bleibt stehen,
   Denk-Pause (3-Sekunden-Countdown) statt Durchklicken.
   Fragen: ~50 % Mathe (kompakt), sonst Grundwortschatz-Schreibweisen
   mit erzeugter dritter Falsch-Variante (Ratechance 33 %).

   Vanilla-JS-Insel (bewusst KEIN calc-Modul: Spiel-Zufall und
   Animations-Timer gehören hierher). Einbettung über
   seeAbenteuerStart(host, hooks) → { stop() }.
   ============================================================ */
import welten from "./welten.json";
import fische from "./fische.json";
import { spielFischBild } from "./fischBilder.js";
import { spielFrage, spielFrageText, spielOptionenHTML } from "./fragen.js";

const WELT = welten.welten[0];
const SPIEL_W = WELT.feld.breite, SPIEL_H = WELT.feld.hoehe;
const SPIEL_SEE = WELT.wasser;
const SPIEL_SPOTS = WELT.spots;
const WELT_FOTO = "/spiel/see.jpg"; // aus data/spiel/bilder der Alt-App
const fisch = (id) => fische.fische.find((f) => f.id === id);

function vgShuffle(liste) {
  const k = liste.slice();
  for (let i = k.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [k[i], k[j]] = [k[j], k[i]];
  }
  return k;
}

export function seeAbenteuerStart(host, hooks = {}) {
  const schnell = () => !!(hooks.schnell || (typeof window !== "undefined" && window.__SPIEL_SCHNELL__));
  const spielT = (ms) => (schnell() ? Math.max(15, ms / 12) : ms);
  const $ = (id) => host.querySelector("#" + id);

  let spiel = null;
  let beendet = false;

  function spielInit() {
    const fids = vgShuffle(WELT.besatz.slice()).slice(0, SPIEL_SPOTS.length);
    spiel = {
      x: WELT.start.x, y: WELT.start.y, fids, done: fids.map(() => false),
      aktiv: -1, stage: 0, frage: null, busy: false, timer: null,
      geloest: 0, fehler: 0,
      gesamt: fids.reduce((a, id) => a + fisch(id).fragen, 0),
    };
  }
  function spielStop() { if (spiel && spiel.timer) { clearInterval(spiel.timer); spiel.timer = null; } }
  function spielImSee(x, y) {
    const dx = (x - SPIEL_SEE.cx) / (SPIEL_SEE.rx + 10), dy = (y - SPIEL_SEE.cy) / (SPIEL_SEE.ry + 10);
    return dx * dx + dy * dy < 1;
  }
  function spielBobXY(i) {
    const sp = SPIEL_SPOTS[i], S = SPIEL_SEE;
    return { x: sp.x + (S.cx - sp.x) * 0.42, y: sp.y + (S.cy - sp.y) * 0.42 };
  }
  function spielPos() {
    const f = $("spielFigur"); if (f) { f.setAttribute("x", spiel.x); f.setAttribute("y", spiel.y + 7); }
    const l = $("spielLine"); if (l && l.style.display !== "none") { l.setAttribute("x1", spiel.x); l.setAttribute("y1", spiel.y); }
  }
  function spielMove(dx, dy) {
    if (!spiel || spiel.busy || spiel.aktiv >= 0) return;
    const nx = Math.max(16, Math.min(SPIEL_W - 16, spiel.x + dx));
    const ny = Math.max(18, Math.min(SPIEL_H - 14, spiel.y + dy));
    if (!spielImSee(nx, ny)) { spiel.x = nx; spiel.y = ny; }
    else if (!spielImSee(nx, spiel.y)) { spiel.x = nx; }
    else if (!spielImSee(spiel.x, ny)) { spiel.y = ny; }
    spielPos();
    SPIEL_SPOTS.forEach((sp, i) => {
      if (spiel.done[i] || spiel.aktiv >= 0 || spiel.busy) return;
      if (Math.hypot(spiel.x - sp.x, spiel.y - sp.y) < 24) spielWerfen(i);
    });
  }
  // Wegpunkte: schneidet die Gerade den See, geht es außen herum
  function spielWegpunkte(sx, sy, tx, ty) {
    const S = SPIEL_SEE, RX = S.rx + 22, RY = S.ry + 22;
    const schneidet = (ax, ay, bx, by) => {
      for (let t = 0; t <= 1; t += 0.04) { if (spielImSee(ax + (bx - ax) * t, ay + (by - ay) * t)) return true; }
      return false;
    };
    if (!schneidet(sx, sy, tx, ty)) return [[tx, ty]];
    const a1 = Math.atan2((sy - S.cy) / RY, (sx - S.cx) / RX), a2 = Math.atan2((ty - S.cy) / RY, (tx - S.cx) / RX);
    let d = a2 - a1; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI;
    const bogen = (dd) => {
      const steps = Math.max(2, Math.ceil(Math.abs(dd) / 0.22));
      const pts = [];
      for (let k = 0; k <= steps; k++) {
        const a = a1 + dd * k / steps;
        pts.push([Math.max(16, Math.min(SPIEL_W - 16, S.cx + Math.cos(a) * RX)),
          Math.max(18, Math.min(SPIEL_H - 14, S.cy + Math.sin(a) * RY))]);
      }
      return pts;
    };
    let pts = bogen(d);
    if (pts.some((p) => spielImSee(p[0], p[1]))) {
      const alt = bogen(d > 0 ? d - 2 * Math.PI : d + 2 * Math.PI);
      if (!alt.some((p) => spielImSee(p[0], p[1]))) pts = alt;
    }
    pts.push([tx, ty]);
    return pts;
  }
  // Automatisch zum angetippten Angelplatz laufen
  function spielGehe(i) {
    if (!spiel || spiel.busy || spiel.aktiv >= 0 || spiel.done[i]) return;
    const sp = SPIEL_SPOTS[i];
    const pts = spielWegpunkte(spiel.x, spiel.y, sp.x + (sp.x < SPIEL_SEE.cx ? -19 : 19), sp.y);
    spiel.busy = true; spielStop();
    let pi = 0;
    spiel.timer = setInterval(() => {
      if (!spiel || !$("spielFigur")) { spielStop(); return; }
      const step = schnell() ? 70 : 7;
      const [tx, ty] = pts[pi];
      const dx = tx - spiel.x, dy = ty - spiel.y, d = Math.hypot(dx, dy);
      if (d <= step) {
        spiel.x = tx; spiel.y = ty; pi++;
        if (pi >= pts.length) { spielStop(); spiel.busy = false; spielPos(); spielWerfen(i); return; }
      } else { spiel.x += dx / d * step; spiel.y += dy / d * step; }
      spielPos();
    }, spielT(40));
  }
  // Angel auswerfen: Schwimmer fliegt in einem Bogen in den See
  function spielWerfen(i) {
    spiel.busy = true; spielStop();
    const sp = { x: spiel.x, y: spiel.y }, b = spielBobXY(i);
    const line = $("spielLine"), bob = $("spielBobber");
    if (!line || !bob) { spiel.busy = false; return; }
    line.style.display = "block"; bob.style.display = "block"; bob.textContent = "🪝";
    line.setAttribute("x1", sp.x); line.setAttribute("y1", sp.y);
    line.setAttribute("x2", sp.x); line.setAttribute("y2", sp.y);
    const reduce = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let t = reduce ? 1 : 0;
    spiel.timer = setInterval(() => {
      if (!spiel || !$("spielBobber")) { spielStop(); return; }
      t = Math.min(1, t + 0.09);
      const px = sp.x + (b.x - sp.x) * t, py = sp.y + (b.y - sp.y) * t - Math.sin(t * Math.PI) * 24;
      bob.setAttribute("x", px); bob.setAttribute("y", py);
      line.setAttribute("x2", px); line.setAttribute("y2", py);
      if (t >= 1) {
        spielStop();
        bob.textContent = "💦";
        setTimeout(() => {
          if (!spiel) return;
          const bb = $("spielBobber"); if (bb) bb.textContent = "🔴";
          spiel.busy = false; spiel.aktiv = i; spiel.stage = 0;
          spiel.frage = spielFrage(fisch(spiel.fids[i]).steigerung[0] === "schwer");
          spielKorb(); spielFragBox();
        }, spielT(380));
      }
    }, spielT(45));
  }
  // Fisch heranziehen: ein Stück (weitere Frage) oder ganz (gefangen)
  function spielZiehen(i, fertig, cb) {
    spiel.busy = true; spielStop();
    const bob = $("spielBobber"), line = $("spielLine");
    if (!bob) { spiel.busy = false; cb && cb(); return; }
    const f = fisch(spiel.fids[i]);
    bob.textContent = "🐟"; bob.setAttribute("font-size", f.symbolGroesse || 16);
    const x0 = parseFloat(bob.getAttribute("x")), y0 = parseFloat(bob.getAttribute("y"));
    const frac = fertig ? 0.94 : 0.38;
    const tx = x0 + (spiel.x - x0) * frac, ty = y0 + (spiel.y - y0) * frac;
    let t = 0;
    spiel.timer = setInterval(() => {
      if (!spiel || !$("spielBobber")) { spielStop(); return; }
      t = Math.min(1, t + 0.1);
      const px = x0 + (tx - x0) * t, py = y0 + (ty - y0) * t - Math.sin(t * Math.PI) * 6;
      bob.setAttribute("x", px); bob.setAttribute("y", py);
      if (line) { line.setAttribute("x2", px); line.setAttribute("y2", py); }
      if (t >= 1) {
        spielStop();
        if (fertig) { spiel.done[i] = true; spiel.aktiv = -1; spiel.frage = null; }
        spiel.busy = false;
        cb && cb();
      }
    }, spielT(45));
  }
  function spielKorb() {
    const b = $("spielKorb");
    if (b) b.textContent = "🧺 " + spiel.done.filter(Boolean).length + " / " + SPIEL_SPOTS.length;
  }
  function spielFragBox() {
    const box = $("spielQ"); if (!box) return;
    const i = spiel.aktiv, q = spiel.frage;
    if (i < 0 || !q) { box.innerHTML = ""; return; }
    const f = fisch(spiel.fids[i]);
    const kopf = spiel.stage === 0
      ? `🎣 <b>${f.anrede}</b> beißt an! ${f.hinweis || ""}`
      : `💪 Der <b>${f.name}</b> wehrt sich – Frage ${spiel.stage + 1} von ${f.fragen}!`;
    const stufe = q.schwer ? "🔥 schwere Frage" : "🌱 leichte Frage";
    const bild = spielFischBild(f.zeichnung, 120) || "";
    box.innerHTML = `
      <div style="text-align:center;">${bild}</div>
      <div class="spiel-hint" data-test="spiel-frage">${kopf}<br><span class="spiel-leise">${stufe}</span> · ${spielFrageText(q)}</div>
      <div style="display:flex; gap:8px; margin-top:8px; flex-wrap:wrap;">${spielOptionenHTML(q.w)}</div>
      <div id="spielfb"></div>`;
    box.querySelectorAll(".spiel-opt").forEach((btn) => btn.onclick = () => {
      if (spiel.busy || spiel.aktiv !== i) return;
      const correct = btn.dataset.w === q.w.richtig;
      box.querySelectorAll(".spiel-opt").forEach((b3) => {
        b3.disabled = true;
        if (b3.dataset.w === q.w.richtig) b3.classList.add("spiel-opt-ok");
      });
      const fb = box.querySelector("#spielfb");
      const d = document.createElement("div");
      d.className = "spiel-feedback " + (correct ? "ok" : "tip");
      d.dataset.test = "spiel-feedback";
      const weiter = document.createElement("button");
      weiter.className = "spiel-weiter"; weiter.id = "spielWeiter";
      weiter.dataset.test = "spiel-weiter"; weiter.disabled = true;
      if (correct) {
        spiel.geloest++;
        const fertig = spiel.stage + 1 >= f.fragen;
        if (fertig) {
          d.innerHTML = `🐟 <b>Gefangen – ${f.name}!</b> „${q.w.richtig}“ war richtig.<br>💡 ${q.tipp}<br>🧐 Wusstest du? ${f.info}`;
          weiter.textContent = "Weiter angeln 🎉";
          fb.innerHTML = ""; fb.appendChild(d); fb.appendChild(weiter);
          spielZiehen(i, true, () => { spielKorb(); weiter.disabled = false; });
          weiter.onclick = () => { if (!weiter.disabled) spielRender(); };
        } else {
          spiel.stage++;
          d.innerHTML = `Richtig! Du ziehst ihn näher heran … 💪<br>💡 ${q.tipp}`;
          weiter.textContent = `Weiter – Frage ${spiel.stage + 1} von ${f.fragen}`;
          fb.innerHTML = ""; fb.appendChild(d); fb.appendChild(weiter);
          spielZiehen(i, false, () => { weiter.disabled = false; });
          weiter.onclick = () => {
            if (weiter.disabled) return;
            spiel.frage = spielFrage(f.steigerung[spiel.stage] === "schwer"); spielFragBox();
          };
        }
      } else {
        spiel.fehler++;
        d.innerHTML = `Oh – richtig wäre <b>„${q.w.richtig}“</b> gewesen!<br>💡 ${q.tipp}<br>Der ${f.name} ist noch dran – gleich kommt eine <b>neue</b> Frage.`;
        // Kurze Denk-Pause statt Durchklicken – geraten wird hier nicht!
        let rest = 3;
        weiter.textContent = `🎣 Nächster Versuch (${rest})`;
        const tick = setInterval(() => {
          if (!weiter.isConnected) { clearInterval(tick); return; }
          rest--;
          if (rest <= 0) { clearInterval(tick); weiter.disabled = false; weiter.textContent = "🎣 Nächster Versuch"; }
          else weiter.textContent = `🎣 Nächster Versuch (${rest})`;
        }, spielT(1000));
        fb.innerHTML = ""; fb.appendChild(d); fb.appendChild(weiter);
        weiter.onclick = () => { if (!weiter.disabled) { spiel.frage = spielFrage(q.schwer); spielFragBox(); } };
      }
    });
  }
  function spielSVG() {
    const S = SPIEL_SEE;
    const spots = SPIEL_SPOTS.map((sp, i) => {
      const done = spiel.done[i];
      const em = done ? "🐟" : "🎣";
      return `<g data-spot="${i}" data-test="spiel-spot" style="cursor:${done ? "default" : "pointer"};">
        <circle cx="${sp.x}" cy="${sp.y}" r="17" fill="${done ? "#d9f0dd" : "#fff3c9"}" stroke="${done ? "#3f9d54" : "#e0b23e"}" stroke-width="2.5"/>
        <text x="${sp.x}" y="${sp.y + 6}" font-size="15" text-anchor="middle">${em}</text>
      </g>`;
    }).join("");
    const aktivLine = spiel.aktiv >= 0 ? (() => {
      const b = spielBobXY(spiel.aktiv);
      return `<line id="spielLine" x1="${spiel.x}" y1="${spiel.y}" x2="${b.x}" y2="${b.y}" stroke="#5b4a3a" stroke-width="1.6"/>
        <text id="spielBobber" x="${b.x}" y="${b.y}" font-size="12" text-anchor="middle">🔴</text>`;
    })()
      : `<line id="spielLine" style="display:none;" x1="0" y1="0" x2="0" y2="0" stroke="#5b4a3a" stroke-width="1.6"/>
         <text id="spielBobber" style="display:none;" x="0" y="0" font-size="12" text-anchor="middle">🔴</text>`;
    const grund = `<clipPath id="spielClip"><rect width="${SPIEL_W}" height="${SPIEL_H}" rx="14"/></clipPath>
       <g clip-path="url(#spielClip)">
         <image href="${WELT_FOTO}" x="0" y="0" width="${SPIEL_W}" height="${SPIEL_H}" preserveAspectRatio="xMidYMid slice"/>
         <ellipse cx="${S.cx}" cy="${S.cy}" rx="${S.rx}" ry="${S.ry}" fill="rgba(110,175,235,0.14)" stroke="rgba(255,255,255,0.75)" stroke-width="1.6" stroke-dasharray="6 5"/>
       </g>`;
    return `<svg id="spielFeld" viewBox="0 0 ${SPIEL_W} ${SPIEL_H}" xmlns="http://www.w3.org/2000/svg">
      ${grund}
      ${(WELT.deko || []).map((d2) => `<text x="${d2.x}" y="${d2.y}" font-size="${d2.groesse || 14}">${d2.emoji}</text>`).join("")}
      ${spots}
      ${aktivLine}
      <text id="spielFigur" x="${spiel.x}" y="${spiel.y + 7}" font-size="21" text-anchor="middle">🧒</text>
    </svg>`;
  }
  function spielRender() {
    if (beendet) return;
    if (!spiel) spielInit();
    const gefangen = spiel.done.filter(Boolean).length;
    if (gefangen >= SPIEL_SPOTS.length) {
      beendet = true;
      spielStop();
      hooks.onFertig && hooks.onFertig({ geloest: spiel.geloest, fehler: spiel.fehler, gesamt: spiel.gesamt, fische: SPIEL_SPOTS.length });
      return;
    }
    host.innerHTML = `
      <div data-test="see-spiel">
        <div style="display:flex; justify-content:space-between; align-items:baseline; gap:8px;">
          <h2 style="margin:0;">🎣 See-Abenteuer</h2>
          <span style="font-weight:800; white-space:nowrap;" id="spielKorb" data-test="spiel-korb">🧺 ${gefangen} / ${SPIEL_SPOTS.length}</span>
        </div>
        <p class="spiel-leise" style="margin:6px 0 8px;">Tippe einen <b>Angelplatz 🎣</b> an – deine Figur läuft von selbst hin und wirft die Angel aus. Große Fische brauchen mehrere richtige Antworten!</p>
        <div class="spiel-wrap">
          <div class="spiel-feld">${spielSVG()}</div>
          <div class="spiel-side">
            <div id="spielQ"></div>
            <div id="spielPad">
              <span></span><button data-d="up">⬆️</button><span></span>
              <button data-d="left">⬅️</button><span></span><button data-d="right">➡️</button>
              <span></span><button data-d="down">⬇️</button><span></span>
            </div>
          </div>
        </div>
      </div>`;
    host.querySelectorAll("[data-spot]").forEach((g) => {
      g.addEventListener("click", () => spielGehe(parseInt(g.dataset.spot, 10)));
    });
    const DIR = { up: [0, -14], down: [0, 14], left: [-14, 0], right: [14, 0] };
    host.querySelectorAll("#spielPad button").forEach((b) => {
      let timer = null;
      const step = () => spielMove(...DIR[b.dataset.d]);
      const stop = () => { if (timer) { clearInterval(timer); timer = null; } };
      b.addEventListener("pointerdown", (e) => { e.preventDefault(); step(); timer = setInterval(step, 140); });
      ["pointerup", "pointerleave", "pointercancel"].forEach((ev) => b.addEventListener(ev, stop));
    });
    spielFragBox();
  }

  spielInit();
  spielRender();
  return {
    stop() { beendet = true; spielStop(); },
  };
}
