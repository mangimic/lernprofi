/* ============================================================
   ⛏️ BLOCKWELT – originalgetreuer Port aus der Alt-App:
   Minecraft-artiges Bau-Spiel. Blöcke setzen (🧱) und abbauen (⛏️)
   auf einem Raster – neue Blöcke verdient man mit Wörter- und
   Mathe-Fragen (jede 3. Frage ist schwer und bringt einen seltenen
   Block wie 💎). Werkstatt: Extras aus Blöcken bauen (Crafting),
   Meilensteine schalten über verdiente Blöcke frei. TNT sprengt 3×3.
   Anti-Schummel: falsche Antwort sperrt ALLE Knöpfe, neuer Versuch
   erst nach Denk-Pause (3 s, nach 3 Fehlern in Folge 8 s).

   Die Welt wird DAUERHAFT gespeichert – über hooks.speichern(stand)
   landet sie im verschlüsselten Tresor (und damit im Geräte-Abgleich).
   Vanilla-Insel wie das See-Abenteuer; hooks: { stand, speichern, schnell }.
   ============================================================ */
import daten from "./blockwelt.json";
import { spielFrage, spielFrageText, spielOptionenHTML } from "./fragen.js";

const D = daten;

export function leererBlockweltStand() {
  return { welt: null, inv: null, verdient: 0, zaehler: 0, sicherung: null };
}

export function blockweltStart(host, hooks = {}) {
  const schnell = () => !!(hooks.schnell || (typeof window !== "undefined" && window.__SPIEL_SCHNELL__));
  const spielT = (ms) => (schnell() ? Math.max(15, ms / 12) : ms);
  const $ = (id) => host.querySelector("#" + id);

  // Dauerhafter Stand (aus dem Tresor) + Laufzeit-Zustand
  const st = Object.assign(leererBlockweltStand(), hooks.stand && typeof hooks.stand === "object" ? hooks.stand : {});
  let bw = { wahl: null, werkzeug: "bauen", fehlSerie: 0, frage: null };
  const save = () => hooks.speichern && hooks.speichern({
    welt: st.welt, inv: st.inv, verdient: st.verdient, zaehler: st.zaehler, sicherung: st.sicherung,
  });

  const bwBlock = (id) => D.bloecke.find((b) => b.id === id);
  const bwExtra = (id) => (D.extras || []).find((x) => x.id === id);
  const bwTeil = (id) => bwBlock(id) || bwExtra(id);

  function bwWelt() {
    const n = D.start.breite * D.start.hoehe;
    if (!Array.isArray(st.welt) || st.welt.length !== n) {
      st.welt = new Array(n).fill("");
      D.start.boden.forEach((bid, i) => {
        const r = D.start.hoehe - 1 - i;
        for (let c2 = 0; c2 < D.start.breite; c2++) st.welt[r * D.start.breite + c2] = bid;
      });
    }
    if (!st.inv || typeof st.inv !== "object") st.inv = Object.assign({}, D.start.inventar);
    return st;
  }

  /* App-eigener Bestätigungs-Dialog (window.confirm ist in manchen
     eingebetteten Ansichten stumm blockiert und nicht kindgerecht). */
  function appConfirm(text, onJa, jaText) {
    const alt = host.querySelector("#appConfirm"); if (alt) alt.remove();
    const o = document.createElement("div");
    o.className = "bw-confirm"; o.id = "appConfirm";
    o.innerHTML = `<div class="bw-confirm-karte">
      <p style="font-weight:700; margin-top:0;">${text}</p>
      <div style="display:flex; gap:8px;">
        <button id="acNein" style="flex:1;">Abbrechen</button>
        <button id="acJa" class="spiel-weiter" style="flex:1; margin-top:0;">${jaText || "Ja!"}</button>
      </div></div>`;
    host.appendChild(o);
    o.querySelector("#acNein").onclick = () => o.remove();
    o.querySelector("#acJa").onclick = () => { o.remove(); onJa(); };
  }

  function bwZelleHTML(i, bid) {
    const b = bid ? bwTeil(bid) : null;
    const stil = b ? `background:${b.farbe};` : "";
    return `<div class="bw-zelle${b ? " voll" : ""}" data-i="${i}" style="${stil}">${b && b.emoji ? b.emoji : ""}</div>`;
  }
  function bwZelleAktualisieren(i) {
    const el = host.querySelector(`.bw-zelle[data-i="${i}"]`); if (!el) return;
    const bid = bwWelt().welt[i], b = bid ? bwTeil(bid) : null;
    el.className = "bw-zelle" + (b ? " voll" : "");
    el.style.background = b ? b.farbe : "";
    el.textContent = b && b.emoji ? b.emoji : "";
  }
  function bwPaletteHTML() {
    const s = bwWelt();
    const teile = D.bloecke.concat(D.extras || [])
      .filter((b) => (s.inv[b.id] || 0) > 0 || b.id === (bw && bw.wahl))
      .map((b) => `<button type="button" class="bw-pal${bw && bw.wahl === b.id ? " on" : ""}" data-b="${b.id}" title="${b.name}">
        <span class="bw-farbe" style="background:${b.farbe};">${b.emoji || ""}</span>${s.inv[b.id] || 0}</button>`).join("");
    return teile || `<span class="spiel-leise">Inventar leer – verdiene Blöcke mit Fragen! 🎁</span>`;
  }
  function bwPaletteAktualisieren() {
    const el = $("bwPalette"); if (el) el.innerHTML = bwPaletteHTML();
    bwPaletteBinden();
  }
  function bwPaletteBinden() {
    host.querySelectorAll(".bw-pal").forEach((b) => b.onclick = () => {
      bw.wahl = b.dataset.b; bw.werkzeug = "bauen";
      bwWerkzeugAnzeigen(); bwPaletteAktualisieren();
    });
  }
  function bwWerkzeugAnzeigen() {
    const bau = $("bwBauen"), ab = $("bwAbbau");
    if (bau) bau.classList.toggle("on", bw.werkzeug === "bauen");
    if (ab) ab.classList.toggle("on", bw.werkzeug === "abbau");
  }
  function bwVerdientAnzeigen() {
    const el = $("bwVerdient"); if (el) el.textContent = "🎁 " + (st.verdient || 0) + " Blöcke verdient";
  }
  function bwSysMeldung(html) {
    const el = $("bwSysMeld"); if (el) el.innerHTML = html ? `<div class="spiel-feedback ok">${html}</div>` : "";
  }

  /* Sichern & Wiederherstellen: Welt + Inventar zusammen; verdiente
     Blöcke/Meilensteine sind Lernfortschritt und werden NIE zurückgesetzt. */
  function bwSichern() {
    const s = bwWelt();
    s.sicherung = {
      welt: s.welt.slice(), inv: Object.assign({}, s.inv),
      datum: new Date().toLocaleString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) + " Uhr",
    };
    save();
  }
  function bwSicherungLaden() {
    const s = bwWelt(); if (!s.sicherung || !Array.isArray(s.sicherung.welt)) return false;
    s.welt = s.sicherung.welt.slice();
    s.inv = Object.assign({}, s.sicherung.inv || {});
    save(); bw = { wahl: null, werkzeug: "bauen", fehlSerie: 0 };
    return true;
  }
  function bwNeuAnfangen() {
    st.welt = null; st.inv = null; // bwWelt() baut daraus wieder die Startwelt
    save(); bw = { wahl: null, werkzeug: "bauen", fehlSerie: 0 };
  }

  /* Werkstatt: Extras aus Blöcken bauen – Meilenstein "ab" schaltet frei. */
  const bwFrei = (x) => (st.verdient || 0) >= x.ab;
  function bwFehlt(x) {
    const s = bwWelt();
    return Object.entries(x.kosten).filter(([id, n]) => (s.inv[id] || 0) < n);
  }
  function bwKostenHTML(x) {
    const s = bwWelt();
    return Object.entries(x.kosten).map(([id, n]) => {
      const b = bwBlock(id), da = (s.inv[id] || 0) >= n;
      return `<span style="white-space:nowrap;${da ? "" : "opacity:.45;"}"><span class="bw-farbe" style="background:${b.farbe};">${b.emoji || ""}</span>${n}× ${b.name}</span>`;
    }).join(" + ");
  }
  function bwCraft(id) {
    const x = bwExtra(id); if (!x || !bwFrei(x) || bwFehlt(x).length) return false;
    const s = bwWelt();
    Object.entries(x.kosten).forEach(([bid, n]) => { s.inv[bid] -= n; });
    s.inv[x.id] = (s.inv[x.id] || 0) + 1;
    bw.wahl = x.id; bw.werkzeug = "bauen";
    save(); bwPaletteAktualisieren(); bwWerkzeugAnzeigen();
    return true;
  }
  function bwWerkstatt() {
    const box = $("bwQ"); if (!box) return;
    bwVerdientAnzeigen();
    bwWelt();
    const verdient = st.verdient || 0;
    const naechste = (D.extras || []).filter((x) => !bwFrei(x)).sort((a, b) => a.ab - b.ab)[0];
    const zeilen = (D.extras || []).map((x) => {
      const frei = bwFrei(x), fehlt = frei ? bwFehlt(x) : [];
      let aktion;
      if (!frei) aktion = `<span class="spiel-leise" style="white-space:nowrap;">🔒 ab ${x.ab} 🎁</span>`;
      else if (fehlt.length) aktion = `<span class="spiel-leise" style="white-space:nowrap;">Blöcke fehlen</span>`;
      else aktion = `<button class="spiel-weiter bw-craft" data-test="bw-craft" data-x="${x.id}" style="width:auto; margin:0; padding:0 10px;">Bauen!</button>`;
      return `<div class="bw-rezept${frei ? "" : " zu"}">
        <span class="bw-farbe" style="background:${x.farbe}; flex:none;">${x.emoji}</span>
        <div style="flex:1; min-width:0;">
          <b>${x.name}</b>${x.wirkung === "sprengt" ? " 💥" : ""} <span class="spiel-leise">– ${x.info || ""}</span><br>
          <span style="font-size:13px;">${bwKostenHTML(x)}</span>
        </div>${aktion}</div>`;
    }).join("");
    box.innerHTML = `
      <div class="spiel-hint" data-test="bw-werkstatt">🛠️ <b>Werkstatt</b> – baue aus deinen Blöcken neue Sachen!
        Du hast schon <b>${verdient}</b> 🎁 Blöcke verdient.${naechste ? `<br>Als Nächstes wird bei <b>${naechste.ab}</b> freigeschaltet: ${naechste.emoji} ${naechste.name}!` : "<br>🏆 Du hast ALLES freigeschaltet!"}</div>
      <div style="margin-top:8px;">${zeilen}</div>
      <button class="spiel-weiter" id="bwWerkstattZu" style="background:var(--weich); color:var(--text);">Schließen</button>`;
    box.querySelectorAll(".bw-craft").forEach((b) => b.onclick = () => {
      const x = bwExtra(b.dataset.x);
      if (bwCraft(b.dataset.x)) {
        bwWerkstatt();
        const h = box.querySelector(".spiel-hint");
        if (h) h.insertAdjacentHTML("afterend", `<div class="spiel-feedback ok" style="margin-top:8px;">🎉 ${x.emoji} ${x.name} gebaut – liegt im Inventar, tippe ein freies Feld zum Setzen!</div>`);
      }
    });
    box.querySelector("#bwWerkstattZu").onclick = () => { box.innerHTML = ""; };
  }

  // Frage stellen: richtig = Blöcke ins Inventar (jede 3. Frage schwer → seltener Block)
  function bwFrage() {
    const box = $("bwQ"); if (!box) return;
    const s = bwWelt();
    const schwer = (s.zaehler % 3) === 2;
    const q = spielFrage(schwer);
    bw.frage = q;
    box.innerHTML = `
      <div class="spiel-hint" data-test="bw-frage">${schwer ? "🔥 <b>Schwere Frage</b> – es winkt ein seltener Block!" : "🌱 Leichte Frage"}<br>
        ${spielFrageText(q)}</div>
      <div style="display:flex; gap:8px; margin-top:8px; flex-wrap:wrap;">${spielOptionenHTML(q.w, "bw-opt")}</div>
      <div id="bwfb"></div>`;
    box.querySelectorAll(".bw-opt").forEach((btn) => btn.onclick = () => {
      if (btn.disabled) return;
      const fb = box.querySelector("#bwfb");
      const d = document.createElement("div");
      d.dataset.test = "bw-feedback";
      if (btn.dataset.w === q.w.richtig) {
        box.querySelectorAll(".bw-opt").forEach((x) => x.disabled = true);
        bw.fehlSerie = 0;
        s.zaehler = (s.zaehler || 0) + 1;
        const normale = D.bloecke.filter((b) => !b.selten), seltene = D.bloecke.filter((b) => b.selten);
        const anzahl = schwer ? D.belohnung.schwer : D.belohnung.leicht;
        const erhalten = [];
        for (let k = 0; k < anzahl; k++) {
          const b = normale[Math.floor(Math.random() * normale.length)];
          s.inv[b.id] = (s.inv[b.id] || 0) + 1; erhalten.push(b);
        }
        if (schwer) {
          const b = seltene[Math.floor(Math.random() * seltene.length)];
          s.inv[b.id] = (s.inv[b.id] || 0) + 1; erhalten.push(b);
        }
        const vorher = s.verdient || 0;
        s.verdient = vorher + erhalten.length;
        const neu = (D.extras || []).filter((x) => x.ab > vorher && x.ab <= s.verdient);
        save();
        d.className = "spiel-feedback ok";
        d.innerHTML = `🎉 Richtig! Du bekommst: ${erhalten.map((b) => `<span class="bw-farbe" style="background:${b.farbe};">${b.emoji || ""}</span> ${b.name}`).join(" + ")}<br>💡 ${q.tipp}`
          + (neu.length ? `<br>🛠️ <b>Neu in der Werkstatt freigeschaltet:</b> ${neu.map((x) => x.emoji + " " + x.name).join(", ")}!` : "");
        const weiter = document.createElement("button");
        weiter.className = "spiel-weiter"; weiter.id = "bwWeiter"; weiter.dataset.test = "bw-weiter";
        weiter.textContent = "Weiterbauen 🧱";
        fb.innerHTML = ""; fb.appendChild(d); fb.appendChild(weiter);
        weiter.onclick = () => { box.innerHTML = ""; bwPaletteAktualisieren(); bwVerdientAnzeigen(); };
        bwPaletteAktualisieren(); bwVerdientAnzeigen();
      } else {
        // STRENG (kein Schummeln!): alle Antworten sperren, Denk-Pause,
        // bei 3 Fehlern in Folge eine längere Atempause.
        box.querySelectorAll(".bw-opt").forEach((x) => {
          x.disabled = true;
          if (x.dataset.w === q.w.richtig) x.classList.add("spiel-opt-ok");
        });
        bw.fehlSerie = (bw.fehlSerie || 0) + 1;
        d.className = "spiel-feedback tip";
        d.innerHTML = `Noch nicht – richtig wäre <b>„${q.w.richtig}“</b>. 💡 ${q.tipp}`
          + (bw.fehlSerie >= 3
            ? `<br>🧘 <b>Kurz durchatmen!</b> Blöcke gibt es nur fürs Können – lies die nächste Frage ganz in Ruhe.`
            : `<br>Gleich kommt eine <b>neue</b> Frage!`);
        fb.innerHTML = ""; fb.appendChild(d);
        const weiter = document.createElement("button");
        weiter.className = "spiel-weiter"; weiter.id = "bwWeiter"; weiter.dataset.test = "bw-weiter";
        weiter.disabled = true;
        let rest = bw.fehlSerie >= 3 ? 8 : 3;
        weiter.textContent = `🎁 Nächster Versuch (${rest})`;
        const tick = setInterval(() => {
          if (!weiter.isConnected) { clearInterval(tick); return; }
          rest--;
          if (rest <= 0) { clearInterval(tick); weiter.disabled = false; weiter.textContent = "🎁 Nächster Versuch"; }
          else weiter.textContent = `🎁 Nächster Versuch (${rest})`;
        }, spielT(1000));
        fb.appendChild(weiter);
        weiter.onclick = () => { if (!weiter.disabled) bwFrage(); };
      }
    });
  }

  function bwRender() {
    const s = bwWelt();
    if (!bw.wahl) { const erster = D.bloecke.find((b) => (s.inv[b.id] || 0) > 0); bw.wahl = erster ? erster.id : D.bloecke[0].id; }
    const zellen = s.welt.map((bid, i) => bwZelleHTML(i, bid)).join("");
    host.innerHTML = `
      <div data-test="blockwelt">
        <div style="display:flex; justify-content:space-between; align-items:baseline; gap:8px; flex-wrap:wrap;">
          <h2 style="margin:0;">⛏️ Blockwelt</h2>
          <span style="font-weight:800; white-space:nowrap;" id="bwVerdient" data-test="bw-verdient">🎁 ${s.verdient || 0} Blöcke verdient</span>
        </div>
        <p class="spiel-leise" style="margin:6px 0 8px;">Baue deine eigene Welt! Blöcke verdienst du mit Wörter- und Mathe-Fragen –
          deine Welt bleibt gespeichert. 🧱 setzen · ⛏️ abbauen (kommt zurück ins Inventar).</p>
        <div class="spiel-wrap">
          <div class="bw-grid" id="bwGrid" style="grid-template-columns:repeat(${D.start.breite},1fr);">${zellen}</div>
          <div class="spiel-side">
            <div style="display:flex; gap:8px; margin-bottom:8px;">
              <button class="bw-knopf" id="bwBauen" style="flex:1;">🧱 Bauen</button>
              <button class="bw-knopf" id="bwAbbau" style="flex:1;">⛏️ Abbauen</button>
              <button class="bw-knopf" id="bwWerkstattAuf" data-test="bw-werkstatt-auf" style="flex:1;">🛠️ Werkstatt</button>
            </div>
            <button class="spiel-weiter" id="bwVerdienen" data-test="bw-verdienen" style="margin:0 0 8px;">🎁 Blöcke verdienen</button>
            <div class="bw-palette" id="bwPalette">${bwPaletteHTML()}</div>
            <div id="bwQ" style="margin-top:8px;"></div>
          </div>
        </div>
        <div style="display:flex; gap:8px; margin-top:10px;">
          <button class="bw-knopf" id="bwSichern" style="flex:1;">💾 Welt sichern</button>
          <button class="bw-knopf" id="bwLaden" style="flex:1;"${s.sicherung ? "" : " disabled"}>↩️ Sicherung laden</button>
        </div>
        ${s.sicherung ? `<p class="spiel-leise" style="margin:6px 0 0;">💾 Sicherung vom ${s.sicherung.datum || "?"}</p>` : ""}
        <div id="bwSysMeld" style="margin-top:8px;"></div>
        <button id="bwReset" style="margin-top:8px; background:transparent; color:var(--text-leise); font-size:var(--schrift-klein); min-height:auto;">🗑️ Welt komplett neu beginnen</button>
      </div>`;
    bwWerkzeugAnzeigen(); bwPaletteBinden();
    $("bwBauen").onclick = () => { bw.werkzeug = "bauen"; bwWerkzeugAnzeigen(); };
    $("bwAbbau").onclick = () => { bw.werkzeug = "abbau"; bwWerkzeugAnzeigen(); };
    $("bwVerdienen").onclick = () => bwFrage();
    $("bwWerkstattAuf").onclick = () => bwWerkstatt();
    $("bwSichern").onclick = () => {
      bwSichern(); bwRender();
      bwSysMeldung("💾 Welt gesichert! Mit „↩️ Sicherung laden“ kommst du jederzeit hierher zurück.");
    };
    $("bwLaden").onclick = () => {
      if (!st.sicherung) return;
      appConfirm(`Deine jetzige Welt wird durch die Sicherung vom ${st.sicherung.datum || "?"} ersetzt. Weiter?`, () => {
        bwSicherungLaden(); bwRender();
        bwSysMeldung("↩️ Sicherung geladen – weiterbauen!");
      }, "Ja, laden!");
    };
    $("bwReset").onclick = () => {
      appConfirm("Wirklich die ganze Welt löschen und neu anfangen?<br><span class='spiel-leise'>Deine 🎁 verdienten Blöcke, die Werkstatt-Freischaltungen und deine 💾 Sicherung bleiben erhalten.</span>", () => {
        bwNeuAnfangen(); bwRender();
        bwSysMeldung("🗑️ Neue Welt! Dein Fortschritt in der Werkstatt ist noch da.");
      }, "Ja, neu anfangen!");
    };
    $("bwGrid").addEventListener("click", (e) => {
      const z = e.target.closest(".bw-zelle"); if (!z) return;
      const i = parseInt(z.dataset.i, 10);
      const sx = bwWelt();
      if (bw.werkzeug === "abbau") {
        const bid = sx.welt[i]; if (!bid) return;
        sx.welt[i] = ""; sx.inv[bid] = (sx.inv[bid] || 0) + 1;
        save(); bwZelleAktualisieren(i); bwPaletteAktualisieren();
      } else {
        if (sx.welt[i]) return;
        if (!bw.wahl || (sx.inv[bw.wahl] || 0) < 1) {
          const q = $("bwQ"); if (q && !q.innerHTML) q.innerHTML = `<div class="spiel-feedback tip">Dein Vorrat ist leer – tippe <b>🎁 Blöcke verdienen</b>!</div>`;
          return;
        }
        const teil = bwTeil(bw.wahl);
        if (teil && teil.wirkung === "sprengt") {
          // TNT: räumt 3×3 rund um das Feld frei (Blöcke sind weg, kein Zurück ins Inventar)
          sx.inv[bw.wahl]--;
          const br = D.start.breite, r0 = Math.floor(i / br), c0 = i % br;
          for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
            const r = r0 + dr, c2 = c0 + dc;
            if (r < 0 || c2 < 0 || r >= D.start.hoehe || c2 >= br) continue;
            const j = r * br + c2; sx.welt[j] = ""; bwZelleAktualisieren(j);
            const el = host.querySelector(`.bw-zelle[data-i="${j}"]`); if (el) { el.textContent = "💥"; setTimeout(() => bwZelleAktualisieren(j), 600); }
          }
          save(); bwPaletteAktualisieren();
          return;
        }
        sx.welt[i] = bw.wahl; sx.inv[bw.wahl]--;
        save(); bwZelleAktualisieren(i); bwPaletteAktualisieren();
      }
    });
  }

  bwRender();
  return { stop() { /* keine laufenden Timer außerhalb der Fragebox */ } };
}
