/* ============================================================
   🧠 KONZENTRATIONS-TRAINING – originalgetreuer Port aus der
   Alt-App (nach „15 konzentrationsfördernde Lernspiele"):
   1) ZAHLENKETTE: wachsende Zahlenreihe merken; jeden Tag, an dem
      sie fehlerfrei aufgesagt wird, kommt EINE Zahl dazu – bei 7
      Zahlen Feier, Rekord, Neustart.
   2) ALPHABET-SPRÜNGE: nur jeden 2./3. Buchstaben antippen,
      vorwärts und rückwärts – mit Bestwert je Stufe.
   3) BLITZLESEN „Tiere": 1 Minute laut lesen, letztes Wort antippen;
      5 Runden wie auf dem Schul-Übungsblatt, mit Rekord.
   Jede geschaffte Runde zählt über hooks.aufgabeGeloest() für die
   Mini-Missionen. Stand über hooks.stand/speichern im Tresor.
   hooks: { stand, speichern, aufgabeGeloest, heute, schnell }
   ============================================================ */

export const KETTE_ZIEL = 7;
const ABC = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
export const ABC_STUFEN = [
  { id: "v2", name: "Jeder 2. – vorwärts", schritt: 2, rueck: false },
  { id: "v3", name: "Jeder 3. – vorwärts", schritt: 3, rueck: false },
  { id: "r2", name: "Jeder 2. – rückwärts", schritt: 2, rueck: true },
  { id: "r3", name: "Jeder 3. – rückwärts", schritt: 3, rueck: true },
];
export function abcFolge(st) {
  const basis = st.rueck ? ABC.slice().reverse() : ABC;
  return basis.filter((_, i) => i % st.schritt === 0);
}
export const BLITZ_TIERE = ["Biene", "Hummel", "Schmetterling", "Marienkäfer", "Libelle", "Ameise", "Grille", "Heuschrecke", "Käfer", "Raupe",
  "Spinne", "Mücke", "Fliege", "Wespe", "Falter", "Nachtfalter", "Maikäfer", "Glühwürmchen", "Schnecke", "Regenwurm",
  "Frosch", "Kröte", "Nacktschnecke", "Molch", "Salamander", "Eidechse", "Ringelnatter", "Schildkröte", "Igel", "Eichhörnchen",
  "Hase", "Kaninchen", "Reh", "Hirsch", "Fuchs", "Dachs", "Wildschwein", "Maus", "Feldmaus", "Hamster",
  "Biber", "Otter", "Ente", "Gans", "Schwan", "Storch", "Schwalbe", "Spatz", "Amsel", "Drossel",
  "Meise", "Rotkehlchen", "Star", "Specht", "Kuckuck", "Krähe", "Taube", "Möwe", "Reiher", "Bussard",
  "Falke", "Eule", "Huhn", "Henne", "Truthahn", "Pfau", "Wachtel", "Schaf", "Ziege", "Kuh",
  "Pferd", "Fohlen", "Lamm", "Hund", "Katze", "Marder", "Waschbär", "Fledermaus", "Bachstelze", "Esel"];
const BLITZ_SEK = 60, BLITZ_RUNDEN = 5;

export function leererKonzStand() {
  return {
    kette: { zahlen: [], erweitertAm: "", rekord: 0 },
    abcBest: {},
    blitz: { runden: [], best: 0 },
  };
}

export function konzentrationStart(host, hooks = {}) {
  const schnell = () => !!(hooks.schnell || (typeof window !== "undefined" && window.__SPIEL_SCHNELL__));
  const spielT = (ms) => (schnell() ? Math.max(15, ms / 12) : ms);
  const heute = hooks.heute || "";
  const $ = (id) => host.querySelector("#" + id);

  const st = Object.assign(leererKonzStand(), hooks.stand && typeof hooks.stand === "object" ? hooks.stand : {});
  st.kette = Object.assign(leererKonzStand().kette, st.kette || {});
  st.blitz = Object.assign(leererKonzStand().blitz, st.blitz || {});
  if (!st.abcBest || typeof st.abcBest !== "object") st.abcBest = {};
  const save = () => hooks.speichern && hooks.speichern({ kette: st.kette, abcBest: st.abcBest, blitz: st.blitz });
  const geloest = () => hooks.aufgabeGeloest && hooks.aufgabeGeloest();

  let tab = "info";
  let timer = null;
  const stopp = () => { if (timer) { clearInterval(timer); timer = null; } };

  function render() {
    stopp();
    host.innerHTML = `
      <div data-test="konz">
        <div style="display:flex; gap:6px; margin-bottom:10px; flex-wrap:wrap;">
          ${[["info", "🧠 Info"], ["zahlen", "🔢 Zahlen"], ["abc", "🔤 ABC"], ["blitz", "⚡ Blitz"]].map(([id, l]) =>
            `<button class="bw-knopf${tab === id ? " on" : ""}" data-tab="${id}" data-test="konz-tab-${id}" style="flex:1;">${l}</button>`).join("")}
        </div>
        <div id="konzHost"></div>
      </div>`;
    host.querySelectorAll("[data-tab]").forEach((b) => b.onclick = () => { tab = b.dataset.tab; render(); });
    const c = $("konzHost");
    if (tab === "zahlen") konzZahlen(c);
    else if (tab === "abc") konzAbc(c);
    else if (tab === "blitz") konzBlitz(c);
    else konzInfo(c);
  }

  function konzInfo(c) {
    c.innerHTML = `
      <p>Drei kleine Spiele, die deinen <b>Merk-Muskel</b> und deine
        <b>Aufmerksamkeit</b> trainieren – jeden Tag ein paar Minuten reichen!</p>
      <div class="spiel-hint">🔢 <b>Zahlenkette:</b> Merke dir eine Zahlenreihe.
        Jeden Tag, an dem du sie fehlerfrei aufsagst, kommt eine Zahl dazu –
        bis du ${KETTE_ZIEL} Zahlen im Kopf hast!<br><br>
        🔤 <b>Alphabet-Sprünge:</b> Tippe nur jeden 2. oder 3. Buchstaben –
        vorwärts ist es leicht, rückwärts wird es richtig knifflig!<br><br>
        ⚡ <b>Blitzlesen:</b> Lies in 1 Minute so viele Tier-Wörter wie möglich
        laut vor – wie auf deinem Übungsblatt. Runde für Runde wirst du schneller!</div>
      <p class="spiel-leise">💡 Diese Spiele stärken genau das, was dir beim Lernen hilft:
        <b>dranbleiben, merken, genau hinschauen</b>.</p>`;
  }

  /* ---------- 🔢 Zahlenkette ---------- */
  const ketteZufall = () => 1 + Math.floor(Math.random() * 49);
  const ketteNeu = () => [ketteZufall(), ketteZufall()];
  let ketteEingabe = [], ketteTipp = "", ketteMerkIdx = 0;

  function konzZahlen(c) {
    stopp();
    const K = st.kette;
    if (!K.zahlen.length) { K.zahlen = ketteNeu(); save(); }
    const heuteErweitert = K.erweitertAm === heute;
    c.innerHTML = `
      <h2 style="margin-top:0;">🔢 Zahlenkette</h2>
      <p class="spiel-leise">Merke dir die Kette – jeden Tag kommt eine Zahl dazu!</p>
      <p style="font-weight:800;" data-test="kette-stand">🔗 Kette: ${K.zahlen.length} von ${KETTE_ZIEL} Zahlen${K.rekord ? ` · 🏆 Rekord: ${K.rekord}` : ``}</p>
      <div class="spiel-hint" id="ketteInfo">${heuteErweitert
        ? "Heute ist deine Kette schon gewachsen! Du kannst trotzdem üben, sie fehlerfrei aufzusagen – morgen kommt die nächste Zahl dazu."
        : "Sage die Kette fehlerfrei auf – dann wächst sie heute um eine Zahl!"}</div>
      <div id="ketteHost" style="text-align:center;"></div>`;
    const hostK = c.querySelector("#ketteHost");
    hostK.innerHTML = `<button class="spiel-weiter" id="ketteStart" data-test="kette-start">🧠 Zahlen ansehen &amp; merken</button>`;
    hostK.querySelector("#ketteStart").onclick = () => konzMerkphase(hostK);
  }
  function konzMerkphase(hostK) {
    const K = st.kette; ketteMerkIdx = 0;
    const zeig = () => {
      if (ketteMerkIdx >= K.zahlen.length) {
        stopp();
        return konzEingabe(hostK);
      }
      hostK.innerHTML = `
        <p class="spiel-leise" style="margin:6px 0 0;">Zahl ${ketteMerkIdx + 1} von ${K.zahlen.length} – gut merken!</p>
        <div data-test="kette-zahl" style="font-size:64px; font-weight:800; margin:10px 0; color:var(--primaer);">${K.zahlen[ketteMerkIdx]}</div>`;
      ketteMerkIdx++;
    };
    zeig();
    timer = setInterval(zeig, spielT(2200));
  }
  function konzEingabe(hostK) {
    ketteEingabe = []; ketteTipp = "";
    const K = st.kette;
    const render2 = () => {
      hostK.innerHTML = `
        <p style="margin:8px 0 2px;">Tippe die Zahlen <b>in der richtigen Reihenfolge</b>:</p>
        <div style="font-size:22px; font-weight:800; min-height:30px;">${K.zahlen.map((_, i) =>
          i < ketteEingabe.length ? ketteEingabe[i] : "·").join("  –  ")}</div>
        <div style="font-size:30px; font-weight:800; min-height:40px; color:var(--primaer);" id="ketteTippAnzeige">${ketteTipp || "&nbsp;"}</div>
        <div style="display:grid; grid-template-columns:repeat(5,1fr); gap:6px; max-width:300px; margin:0 auto;">
          ${[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((z) => `<button class="bw-knopf kette-z" data-test="kette-z-${z}" data-z="${z}" style="font-size:20px; padding:10px 0;">${z}</button>`).join("")}
        </div>
        <div style="display:flex; gap:8px; max-width:300px; margin:8px auto 0;">
          <button class="bw-knopf" id="ketteLoesch" style="flex:1;">⌫</button>
          <button class="spiel-weiter" id="ketteOk" data-test="kette-ok" style="flex:2; margin:0;">✓ Zahl fertig</button>
        </div>
        <div id="kettefb"></div>`;
      hostK.querySelectorAll(".kette-z").forEach((b) => b.onclick = () => {
        if (ketteTipp.length < 2) { ketteTipp += b.dataset.z; hostK.querySelector("#ketteTippAnzeige").textContent = ketteTipp; }
      });
      hostK.querySelector("#ketteLoesch").onclick = () => { ketteTipp = ""; hostK.querySelector("#ketteTippAnzeige").innerHTML = "&nbsp;"; };
      hostK.querySelector("#ketteOk").onclick = () => {
        if (!ketteTipp) return;
        const erwartet = K.zahlen[ketteEingabe.length];
        if (parseInt(ketteTipp, 10) === erwartet) {
          ketteEingabe.push(erwartet); ketteTipp = "";
          if (ketteEingabe.length >= K.zahlen.length) return konzKetteGeschafft(hostK);
          render2();
        } else {
          konzKetteFehler(hostK);
        }
      };
    };
    render2();
  }
  function konzKetteGeschafft(hostK) {
    const K = st.kette;
    geloest(); // zählt für Mini-Missionen
    const heuteErweitert = K.erweitertAm === heute;
    if (K.zahlen.length >= KETTE_ZIEL) {
      K.rekord = Math.max(K.rekord || 0, K.zahlen.length);
      const alte = K.zahlen.length;
      K.zahlen = ketteNeu(); K.erweitertAm = ""; save();
      hostK.innerHTML = `<div class="spiel-feedback ok" data-test="kette-fertig" style="text-align:left;">🏆 <b>WAHNSINN!</b> Du hast dir alle ${alte} Zahlen gemerkt –
        die ganze Kette ist geschafft! Dein Merk-Muskel wird immer stärker. 💪<br>
        Eine neue Kette mit 2 Zahlen wartet schon auf dich.</div>
        <button class="spiel-weiter" id="ketteWeiter">Neue Kette starten 🔗</button>`;
    } else if (!heuteErweitert) {
      const neue = ketteZufall();
      K.zahlen.push(neue); K.erweitertAm = heute; save();
      hostK.innerHTML = `<div class="spiel-feedback ok" data-test="kette-gewachsen" style="text-align:left;">🌟 <b>Fehlerfrei!</b> Deine Kette wächst:
        Die neue Zahl ist <b style="font-size:26px;">${neue}</b> – merk sie dir für morgen!<br>
        🔗 Deine Kette hat jetzt <b>${K.zahlen.length} von ${KETTE_ZIEL}</b> Zahlen.</div>
        <button class="spiel-weiter" id="ketteWeiter">Gleich nochmal üben 🧠</button>`;
    } else {
      hostK.innerHTML = `<div class="spiel-feedback ok" style="text-align:left;">🌟 <b>Fehlerfrei aufgesagt!</b> Stark geübt –
        morgen wächst deine Kette um die nächste Zahl.</div>
        <button class="spiel-weiter" id="ketteWeiter">Nochmal üben 🧠</button>`;
    }
    hostK.querySelector("#ketteWeiter").onclick = () => konzZahlen($("konzHost"));
  }
  function konzKetteFehler(hostK) {
    hostK.innerHTML = `<div class="spiel-feedback tip" data-test="kette-fehler" style="text-align:left;">Fast! An Position ${ketteEingabe.length + 1} kam eine andere Zahl.<br>
      💙 Kein Problem – Merken braucht Übung. Schau dir die Kette gleich nochmal an!</div>
      <button class="spiel-weiter" id="ketteNochmal">🧠 Nochmal ansehen &amp; merken</button>`;
    hostK.querySelector("#ketteNochmal").onclick = () => konzMerkphase(hostK);
  }

  /* ---------- 🔤 Alphabet-Sprünge ---------- */
  let abcStufe = 0, abcPos = 0, abcFehler = 0;
  function konzAbc(c) {
    const stufe = ABC_STUFEN[abcStufe], folge = abcFolge(stufe);
    abcPos = 0; abcFehler = 0;
    const best = st.abcBest[stufe.id];
    c.innerHTML = `
      <h2 style="margin-top:0;">🔤 Alphabet-Sprünge</h2>
      <p class="spiel-leise">Tippe ${stufe.rueck ? "<b>rückwärts ab Z</b>" : "<b>ab A</b>"} nur <b>jeden ${stufe.schritt}. Buchstaben</b> an!</p>
      <div style="display:flex; gap:6px; flex-wrap:wrap; margin-bottom:8px;">${ABC_STUFEN.map((s, i) =>
        `<button class="bw-knopf${i === abcStufe ? " on" : ""}" data-st="${i}">${s.name}${st.abcBest[s.id] === 0 ? " ⭐" : ""}</button>`).join("")}</div>
      <div class="spiel-hint" id="abcInfo" data-test="abc-info">Los geht's: Der erste Buchstabe ist <b>${folge[0]}</b>.
        ${best !== undefined ? `Dein bester Lauf: <b>${best === 0 ? "fehlerfrei ⭐" : best + " Fehler"}</b>.` : ""}</div>
      <div style="display:grid; grid-template-columns:repeat(6,1fr); gap:5px; margin-top:8px;" id="abcGrid">
        ${ABC.map((b) => `<button class="bw-knopf abc-taste" data-test="abc-taste" data-b="${b}" style="padding:9px 0; font-size:16px;">${b}</button>`).join("")}
      </div>
      <div id="abcfb"></div>`;
    c.querySelectorAll("[data-st]").forEach((b) => b.onclick = () => { abcStufe = +b.dataset.st; konzAbc(c); });
    c.querySelectorAll(".abc-taste").forEach((b) => b.onclick = () => {
      if (b.disabled) return;
      if (b.dataset.b === folge[abcPos]) {
        b.disabled = true; b.style.background = "var(--akzent)"; b.style.color = "#5b4a1a";
        abcPos++;
        if (abcPos >= folge.length) {
          geloest();
          const alt = st.abcBest[stufe.id];
          if (alt === undefined || abcFehler < alt) st.abcBest[stufe.id] = abcFehler;
          save();
          const fb = c.querySelector("#abcfb");
          fb.innerHTML = `<div class="spiel-feedback ok" data-test="abc-fertig">🎉 <b>Geschafft – alle ${folge.length} Buchstaben!</b>
            ${abcFehler === 0 ? "Und das ganz ohne Fehler – ⭐ stark!" : `Mit ${abcFehler} kleinen Stolperern – beim nächsten Mal klappt's noch glatter!`}</div>
            <button class="spiel-weiter" id="abcNochmal">🔁 Nochmal</button>`;
          fb.querySelector("#abcNochmal").onclick = () => konzAbc(c);
        } else {
          c.querySelector("#abcInfo").innerHTML = `Super! Weiter – welcher Buchstabe kommt als Nächstes?`;
        }
      } else {
        abcFehler++;
        b.style.background = "var(--warn)";
        setTimeout(() => { if (b.isConnected) { b.style.background = ""; } }, spielT(600));
        c.querySelector("#abcInfo").innerHTML = `💡 Denk dran: nur <b>jeder ${stufe.schritt}.</b> Buchstabe${stufe.rueck ? " – und zwar rückwärts" : ""}! Zuletzt richtig: <b>${abcPos > 0 ? folge[abcPos - 1] : "–"}</b>`;
      }
    });
  }

  /* ---------- ⚡ Blitzlesen ---------- */
  let blitzRest = 0;
  function konzBlitz(c) {
    stopp();
    const B = st.blitz;
    const voll = B.runden.length >= BLITZ_RUNDEN;
    const rundenHTML = B.runden.length
      ? `<div class="spiel-hint" style="font-size:14.5px;">${B.runden.map((r, i) => `Runde ${i + 1}: <b>${r}</b>`).join(" · ")}
         ${B.best ? `<br>🏆 Dein Rekord: <b>${B.best} Wörter</b> in 1 Minute` : ``}</div>`
      : "";
    c.innerHTML = `
      <h2 style="margin-top:0;">⚡ Blitzlesen: Tiere</h2>
      <p class="spiel-leise">Lies in <b>1 Minute</b> so viele Tier-Wörter wie möglich <b>laut</b> vor!</p>
      ${rundenHTML}
      ${voll
        ? `<div class="spiel-feedback ok">🎉 <b>Dein Blatt ist voll – ${BLITZ_RUNDEN} Runden geschafft!</b>
            Von ${B.runden[0]} auf ${B.best} Wörter – dein Lese-Blitz wird immer schneller!</div>
           <button class="spiel-weiter" id="blitzReset">🆕 Neues Blatt beginnen</button>`
        : `<div class="spiel-hint">📖 So geht's: Drücke auf Start, lies die Wörter der Reihe nach <b>laut</b> vor –
            so schnell und genau du kannst. Nach 1 Minute kommt Stopp: Tippe dann das <b>letzte Wort</b> an, das du geschafft hast.</div>
           <button class="spiel-weiter" id="blitzStart" data-test="blitz-start">⏱️ Runde ${B.runden.length + 1} starten!</button>`}
      <div id="blitzHost"></div>`;
    const s2 = c.querySelector("#blitzStart");
    if (s2) s2.onclick = () => blitzRunde(c);
    const rs = c.querySelector("#blitzReset");
    if (rs) rs.onclick = () => { st.blitz.runden = []; save(); konzBlitz(c); };
  }
  function blitzWand(nurLesen) {
    return `<div style="display:grid; grid-template-columns:1fr 1fr; gap:4px; margin-top:8px;">
      ${BLITZ_TIERE.map((w, i) => `<${nurLesen ? "div" : "button"} class="${nurLesen ? "" : "bw-knopf "}blitz-wort" data-test="blitz-wort" data-i="${i}"
        style="font-size:16px; padding:5px 8px; text-align:left; ${nurLesen ? "background:var(--weich); border-radius:8px;" : ""}">
        <span class="spiel-leise" style="font-size:11px;">${i + 1}</span> ${w}</${nurLesen ? "div" : "button"}>`).join("")}
    </div>`;
  }
  function blitzRunde(c) {
    blitzRest = BLITZ_SEK;
    const hostB = c.querySelector("#blitzHost");
    c.querySelector("#blitzStart").style.display = "none";
    hostB.innerHTML = `
      <div style="position:sticky; top:0; z-index:5; background:var(--karte); padding:6px 0;">
        <div style="display:flex; align-items:center; gap:10px;">
          <b style="font-size:22px; min-width:52px;" id="blitzUhr" data-test="blitz-uhr">${BLITZ_SEK}s</b>
          <div style="flex:1; height:10px; background:var(--weich); border-radius:5px; overflow:hidden;">
            <div id="blitzBalken" style="height:100%; width:100%; background:var(--akzent); transition:width 1s linear;"></div>
          </div>
        </div>
        <p class="spiel-leise" style="margin:2px 0 0;">Lies laut – die Uhr läuft! 🗣️</p>
      </div>
      ${blitzWand(true)}`;
    window.scrollTo(0, 0);
    timer = setInterval(() => {
      blitzRest--;
      const u = $("blitzUhr"), b = $("blitzBalken");
      if (!u) { stopp(); return; } // Seite verlassen
      u.textContent = blitzRest + "s";
      if (b) b.style.width = (blitzRest / BLITZ_SEK * 100) + "%";
      if (blitzRest <= 0) {
        stopp();
        blitzAuswahl(c);
      }
    }, spielT(1000));
  }
  function blitzAuswahl(c) {
    const hostB = c.querySelector("#blitzHost");
    hostB.innerHTML = `
      <div class="spiel-feedback tip" data-test="blitz-stopp" style="text-align:left;">⏰ <b>Stopp!</b> Tippe das <b>letzte Wort</b> an, das du geschafft hast.</div>
      ${blitzWand(false)}`;
    window.scrollTo(0, 0);
    hostB.querySelectorAll("button.blitz-wort").forEach((b) => b.onclick = () => {
      const anzahl = +b.dataset.i + 1;
      const B = st.blitz;
      const vorher = B.runden.length ? B.runden[B.runden.length - 1] : null;
      B.runden = B.runden.concat([anzahl]).slice(0, BLITZ_RUNDEN);
      const neuerRekord = anzahl > (B.best || 0);
      if (neuerRekord) B.best = anzahl;
      save();
      geloest(); // zählt für Mini-Missionen
      hostB.innerHTML = `<div class="spiel-feedback ok" data-test="blitz-ergebnis" style="text-align:left;">
        🗣️ <b>${anzahl} ${anzahl === 1 ? "Wort" : "Wörter"} in 1 Minute!</b>
        ${neuerRekord && B.runden.length > 1 ? " 🏆 Neuer Rekord!" : ""}
        ${vorher !== null && anzahl > vorher ? `<br>🚀 Das sind <b>${anzahl - vorher} mehr</b> als in der Runde davor – Blitzlesen wirkt!`
          : vorher !== null && anzahl < vorher ? "<br>💙 Jede Runde zählt – beim nächsten Mal flutscht es wieder besser!" : ""}
      </div>
      <button class="spiel-weiter" id="blitzWeiter">Weiter</button>`;
      hostB.querySelector("#blitzWeiter").onclick = () => konzBlitz(c);
      window.scrollTo(0, 0);
    });
  }

  render();
  return { stop: stopp };
}
