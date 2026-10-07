/* ============================================================
   ♟️ SCHACH – originalgetreuer Port aus der Alt-App, drei Bereiche:
   🎓 SCHULE: Lektionen Schritt für Schritt (Spanische Eröffnung,
      Italienisch, goldene Regeln, Rochade, Gabel/Fesselung,
      Schäfermatt-Abwehr) auf dem Brett vorgespielt.
   🧩 AUFGABEN: Taktik-Rätsel – das richtige Feld antippen,
      mit Tipp bei Fehlversuchen und Auswertung am Ende.
   🤖 SPIELEN: echtes Schach gegen den Computer (alle Regeln inkl.
      Rochade, en passant, Umwandlung, Matt/Patt; kindgerecht
      schwache KI, 💡 Tipp-Knopf und ↩️ Zug-Zurücknehmen).
   hooks: { aufgabeGeloest, schnell }
   ============================================================ */
import SCHACH from "./schach.json";
import { SCH_START, SCH_SYM, schFeldIdx, schFen, schImSchach, schZug, schZuege, schKI } from "./schachLogik.js";

export function schachStart(host, hooks = {}) {
  const schnell = () => !!(hooks.schnell || (typeof window !== "undefined" && window.__SPIEL_SCHNELL__));
  const spielT = (ms) => (schnell() ? Math.max(15, ms / 12) : ms);
  const $ = (id) => host.querySelector("#" + id);
  const geloest = () => hooks.aufgabeGeloest && hooks.aufgabeGeloest();

  let tab = "schule";
  let timer = null;
  const stopp = () => { if (timer) { clearTimeout(timer); timer = null; } };

  function brettHTML(st, opts) {
    opts = opts || {};
    let h = `<div class="sch-brett" id="${opts.id || "schBrett"}" data-test="sch-brett">`;
    for (let i = 0; i < 64; i++) {
      const R = Math.floor(i / 8), C = i % 8;
      let cls = (R + C) % 2 ? "dunkel" : "hell";
      if (opts.sel === i) cls += " sel";
      if (opts.ziele && opts.ziele.indexOf(i) >= 0) cls += " ziel";
      if (opts.mark && opts.mark.indexOf(i) >= 0) cls += " mark";
      if (opts.gruen && opts.gruen.indexOf(i) >= 0) cls += " gruen";
      const koR = C === 0 ? `<span class="sch-kor">${8 - R}</span>` : "";
      const koF = R === 7 ? `<span class="sch-kof">${String.fromCharCode(97 + C)}</span>` : "";
      h += `<div class="sch-feld ${cls}" data-feld="${i}" data-test="sch-feld">${koR}${koF}${st.b[i] ? SCH_SYM[st.b[i]] : ""}</div>`;
    }
    return h + "</div>";
  }

  function render() {
    stopp();
    host.innerHTML = `
      <div data-test="schach">
        <div style="display:flex; gap:6px; margin-bottom:10px; flex-wrap:wrap;">
          ${[["schule", "🎓 Schule"], ["aufgaben", "🧩 Aufgaben"], ["spielen", "🤖 Spielen"]].map(([id, l]) =>
            `<button class="bw-knopf${tab === id ? " on" : ""}" data-tab="${id}" data-test="sch-tab-${id}" style="flex:1;">${l}</button>`).join("")}
        </div>
        <div id="schHost"></div>
      </div>`;
    host.querySelectorAll("[data-tab]").forEach((b) => b.onclick = () => { tab = b.dataset.tab; render(); });
    const c = $("schHost");
    if (tab === "aufgaben") schAufgaben(c);
    else if (tab === "spielen") schSpielen(c);
    else schSchule(c);
  }

  /* ---- 🎓 Schule: Lektionen Schritt für Schritt ---- */
  let lekIdx = 0, lekStep = 0;
  function schSchule(c) {
    const L = SCHACH.lektionen;
    if (!L.length) { c.innerHTML = "<p>Keine Lektionen gefunden.</p>"; return; }
    if (lekIdx >= L.length) lekIdx = 0;
    const lek = L[lekIdx];
    let st = schFen(lek.fen || SCH_START);
    let letzter = [];
    for (let k = 0; k < lekStep && k < lek.schritte.length; k++) {
      const sch = lek.schritte[k];
      const von = schFeldIdx(sch.zug.slice(0, 2)), nach = schFeldIdx(sch.zug.slice(2, 4));
      const z = schZuege(st).find((x) => x.von === von && x.nach === nach);
      if (z) { st = schZug(st, z); letzter = [von, nach]; }
    }
    const chips = L.map((l, i) => `<button class="bw-knopf${i === lekIdx ? " on" : ""}" data-lek="${i}" data-test="sch-lektion">${l.emoji} ${l.titel}</button>`).join("");
    const fertig = lekStep >= lek.schritte.length;
    const text = lekStep === 0 ? lek.intro : lek.schritte[lekStep - 1].text;
    const marks = (lek.marks || []).map(schFeldIdx);
    c.innerHTML = `
      <h2 style="margin:0 0 6px;">🎓 Schach-Schule</h2>
      <div class="sch-chips">${chips}</div>
      <div class="sch-wrap" style="margin-top:8px;">
        ${brettHTML(st, { mark: letzter.concat(marks) })}
        <div class="sch-side">
          <div class="spiel-hint" data-test="sch-lek-text">${lek.emoji} <b>${lek.titel}</b><br>${text}</div>
          ${fertig
            ? `<div class="spiel-feedback ok" data-test="sch-lek-fertig">🏁 Lektion geschafft! Probiere die Aufgaben oder die nächste Lektion.</div>
               <button class="bw-knopf" id="schNochmal" style="width:100%; margin-top:8px;">🔄 Nochmal von vorn</button>`
            : `<button class="spiel-weiter" id="schWeiter" data-test="sch-lek-weiter" style="width:100%;">${lekStep === 0 ? "▶️ Los geht's" : "Weiter ▶️"} (${lekStep}/${lek.schritte.length})</button>`}
        </div>
      </div>`;
    c.querySelectorAll("[data-lek]").forEach((b) => b.onclick = () => { lekIdx = parseInt(b.dataset.lek, 10); lekStep = 0; schSchule(c); });
    const w2 = c.querySelector("#schWeiter"); if (w2) w2.onclick = () => { lekStep++; schSchule(c); };
    const n2 = c.querySelector("#schNochmal"); if (n2) n2.onclick = () => { lekStep = 0; schSchule(c); };
  }

  /* ---- 🧩 Aufgaben: Feld antippen, mit Auswertung ---- */
  let aufIdx = 0, aufErsteOk = 0, aufFehlversuch = false;
  function schAufgaben(c) {
    const A = SCHACH.aufgaben;
    if (aufIdx >= A.length) {
      c.innerHTML = `
        <h2 style="margin:0 0 6px;">🧩 Schach-Aufgaben</h2>
        <div class="spiel-feedback ok" data-test="sch-auf-ergebnis">🌱 <b>Alle ${A.length} Aufgaben geschafft!</b>
          ${aufErsteOk} davon gleich beim ersten Versuch${aufErsteOk === A.length ? " – fehlerfrei, stark! 🏆" : "."}</div>
        <button class="spiel-weiter" id="schAufNochmal" style="width:100%;">🔄 Nochmal von vorn</button>`;
      c.querySelector("#schAufNochmal").onclick = () => { aufIdx = 0; aufErsteOk = 0; schAufgaben(c); };
      return;
    }
    const a = A[aufIdx];
    const st = schFen(a.fen);
    aufFehlversuch = false;
    c.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:baseline; gap:8px;">
        <h2 style="margin:0;">🧩 Schach-Aufgaben</h2>
        <span style="font-weight:800;" data-test="sch-auf-stand">${aufIdx + 1} / ${A.length}</span>
      </div>
      <div class="sch-wrap" style="margin-top:8px;">
        ${brettHTML(st, {})}
        <div class="sch-side">
          <div class="spiel-hint" data-test="sch-auf-frage">${a.frage}</div>
          <div id="schAfb"></div>
        </div>
      </div>`;
    const zielIdx = schFeldIdx(a.ziel);
    const fb = c.querySelector("#schAfb");
    c.querySelectorAll(".sch-feld").forEach((el) => el.onclick = () => {
      const i = parseInt(el.dataset.feld, 10);
      if (i === zielIdx) {
        if (!aufFehlversuch) { aufErsteOk++; geloest(); }
        el.classList.add("gruen");
        const d = document.createElement("div"); d.className = "spiel-feedback ok";
        d.setAttribute("data-test", "sch-auf-ok");
        d.innerHTML = `🎉 <b>${a.erfolg}</b>`;
        const weiter = document.createElement("button");
        weiter.className = "spiel-weiter"; weiter.style.width = "100%";
        weiter.setAttribute("data-test", "sch-auf-weiter");
        weiter.textContent = aufIdx + 1 >= A.length ? "Zur Auswertung 🌱" : "Nächste Aufgabe ▶️";
        fb.innerHTML = ""; fb.appendChild(d); fb.appendChild(weiter);
        c.querySelectorAll(".sch-feld").forEach((x) => x.onclick = null);
        weiter.onclick = () => { aufIdx++; schAufgaben(c); };
      } else {
        aufFehlversuch = true;
        const d = document.createElement("div"); d.className = "spiel-feedback tip";
        d.setAttribute("data-test", "sch-auf-tipp");
        d.innerHTML = `Noch nicht – 💡 ${a.tipp}`;
        fb.innerHTML = ""; fb.appendChild(d);
      }
    });
  }

  /* ---- 🤖 Freies Spielen gegen den Computer ---- */
  let spiel = null;
  function spielInit() {
    spiel = { st: schFen(SCH_START), verlauf: [], sel: -1, letzter: [], ende: "", busy: false, tippZug: null };
  }
  function spielStatus() {
    const st = spiel.st;
    if (!schZuege(st).length) {
      if (schImSchach(st, st.weiss)) return st.weiss ? "matt-s" : "matt-w";
      return "patt";
    }
    return "";
  }
  function computerZug(c) {
    spiel.busy = true;
    timer = setTimeout(() => {
      timer = null;
      if (!spiel || !host.isConnected || tab !== "spielen") return;
      const z = schKI(spiel.st);
      if (z) {
        spiel.verlauf.push(spiel.st);
        spiel.st = schZug(spiel.st, z);
        spiel.letzter = [z.von, z.nach];
      }
      spiel.busy = false; spiel.ende = spielStatus();
      schSpielen(c);
    }, spielT(700));
  }
  function schSpielen(c) {
    if (!spiel) spielInit();
    const st = spiel.st;
    const ende = spiel.ende;
    const zuege = (ende || spiel.busy) ? [] : schZuege(st);
    const ziele = spiel.sel >= 0 ? zuege.filter((z) => z.von === spiel.sel).map((z) => z.nach) : [];
    const tippMark = spiel.tippZug ? [spiel.tippZug.von, spiel.tippZug.nach] : [];
    let status;
    if (ende === "matt-s") status = "🏆 <b>Schachmatt – du hast gewonnen!</b> Großartig gespielt!";
    else if (ende === "matt-w") status = "💪 <b>Schachmatt – der Computer gewinnt.</b> Nächstes Mal schnappst du ihn dir!";
    else if (ende === "patt") status = "🤝 <b>Patt – unentschieden!</b> Keiner kann mehr ziehen.";
    else if (spiel.busy) status = "🤖 Der Computer denkt …";
    else status = (schImSchach(st, true) ? "⚠️ <b>Schach!</b> " : "") + "Du bist dran (Weiß). Tippe eine Figur, dann das Zielfeld.";
    c.innerHTML = `
      <h2 style="margin:0 0 6px;">♟️ Schach spielen</h2>
      <div class="sch-wrap">
        ${brettHTML(st, { sel: spiel.sel, ziele, mark: spiel.letzter.concat(tippMark) })}
        <div class="sch-side">
          <div class="spiel-hint" id="schStatus" data-test="sch-status">${status}</div>
          <div style="display:flex; gap:8px; margin-top:8px; flex-wrap:wrap;">
            <button class="bw-knopf" id="schTipp" data-test="sch-tipp" style="flex:1;"${spiel.busy || ende ? " disabled" : ""}>💡 Tipp</button>
            <button class="bw-knopf" id="schUndo" data-test="sch-undo" style="flex:1;"${spiel.busy || !spiel.verlauf.length ? " disabled" : ""}>↩️ Zug zurück</button>
            <button class="bw-knopf" id="schNeu" data-test="sch-neu" style="flex:1;">🔄 Neu</button>
          </div>
          <p class="spiel-leise sch-erklaer" style="font-size:13px; margin-top:8px;">💡 Der Tipp zeigt dir einen starken Zug in Gelb. Nutze, was du in der Schule gelernt hast: Zentrum, Entwicklung, Rochade!</p>
        </div>
      </div>`;
    c.querySelectorAll(".sch-feld").forEach((el) => el.onclick = () => {
      if (spiel.busy || spiel.ende || !st.weiss) return;
      const i = parseInt(el.dataset.feld, 10);
      const zug = zuege.find((z) => z.von === spiel.sel && z.nach === i);
      if (zug) {
        spiel.verlauf.push(st);
        spiel.st = schZug(st, zug);
        spiel.sel = -1; spiel.letzter = [zug.von, zug.nach]; spiel.tippZug = null;
        spiel.ende = spielStatus();
        schSpielen(c);
        if (!spiel.ende) computerZug(c);
        return;
      }
      if (st.b[i] && st.b[i] === st.b[i].toUpperCase()) { spiel.sel = (spiel.sel === i ? -1 : i); }
      else spiel.sel = -1;
      schSpielen(c);
    });
    c.querySelector("#schTipp").onclick = () => {
      if (spiel.busy || spiel.ende) return;
      spiel.tippZug = schKI(st); spiel.sel = -1;
      schSpielen(c);
    };
    c.querySelector("#schUndo").onclick = () => {
      if (spiel.busy || !spiel.verlauf.length) return;
      do { spiel.st = spiel.verlauf.pop(); } while (spiel.verlauf.length && !spiel.st.weiss);
      spiel.sel = -1; spiel.letzter = []; spiel.tippZug = null; spiel.ende = spielStatus();
      schSpielen(c);
    };
    c.querySelector("#schNeu").onclick = () => { spielInit(); schSpielen(c); };
  }

  render();
  return { stop: stopp };
}
