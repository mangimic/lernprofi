/* ============================================================
   🦁 MUTMACHER (Coach Leo) – originalgetreu aus der Alt-App:
   Rollenspiel mit Comic-Sprechblasen statt Textwand, selbst
   getaktet (jede Blase per Tipp), das Kind spricht seinen
   Mut-Satz laut als eigene Rolle. Dosierung per Rotation:
   kompakte Momente zeigen abwechselnd Mut-Satz/Ritual/Mission.
   Vorlesen ist im Neubau bewusst weggelassen (Entscheid: kein TTS).
   Genutzt von Tennis- und Fußball-Match.
   ============================================================ */

/* Voller Dialog (4 Blasen; mit alle=true alle offen, ohne Weiter-Knopf) */
export function mutDialog(m, opts) {
  if (!m) return "";
  opts = opts || {};
  const blasen = [
    { w: "coach", t: m.trainieren },
    { w: "coach", t: m.mission },
    { w: "kind", t: "„" + m.mut + "“", sag: !opts.alle },
    { w: "coach", t: m.punkt },
  ];
  if (opts.alle) blasen.push({ w: "coach", t: m.schluss });
  const bs = blasen.map((b, i) =>
    `<div class="bubble ${b.w}${b.sag ? " sag" : ""}${(!opts.alle && i > 0) ? " zu" : ""}" data-bi="${i}">${b.w === "kind" ? "🧒 " : ""}${b.sag ? "👉 <b>Deine Rolle – sag es laut und tippe:</b><br>" : ""}${b.t}</div>`).join("");
  return `<div class="mut-dialog" data-mental="${m.id}" data-test="mut-dialog">
    <div class="mut-kopf">🦁 <b>Coach Leo</b> · Mutmacher — ${m.emoji} ${m.titel}</div>
    ${bs}
    ${opts.alle ? "" : `<button type="button" class="bw-knopf mut-weiter" data-test="mut-weiter">💬 Weiter</button>`}
  </div>`;
}

/* Blasen nacheinander aufdecken; die „sag“-Blase muss selbst
   angetippt werden (das Kind spricht den Mut-Satz laut). */
export function mutDialogBind(root, onFertig) {
  const d = root && root.querySelector(".mut-dialog");
  if (!d) { if (onFertig) onFertig(); return; }
  const blasen = [...d.querySelectorAll(".bubble")];
  const weiter = d.querySelector(".mut-weiter");
  if (!weiter) { if (onFertig) onFertig(); return; }
  let i = 0;
  const sagBinden = (b) => {
    weiter.style.display = "none";
    b.onclick = () => {
      b.onclick = null; b.classList.remove("sag"); b.classList.add("gesagt");
      blasen.forEach((x) => x.classList.remove("zu"));
      if (onFertig) onFertig();
    };
  };
  weiter.onclick = () => {
    i++;
    const b = blasen[i];
    if (!b) { weiter.style.display = "none"; if (onFertig) onFertig(); return; }
    b.classList.remove("zu");
    if (b.classList.contains("sag")) sagBinden(b);
    else if (i >= blasen.length - 1) { weiter.style.display = "none"; if (onFertig) onFertig(); }
  };
}

/* Kurzer Pausen-Dialog (2 Blasen, Botschaft rotiert) */
export function mutMini(m, rot) {
  if (!m) return "";
  const co = [m.trainieren, m.schluss][Math.abs(rot || 0) % 2];
  return `<div class="mut-dialog" data-mental="${m.id}">
    <div class="mut-kopf">🦁 <b>Coach Leo</b> · Mutmacher — ${m.emoji} ${m.titel}</div>
    <div class="bubble coach">${co}</div>
    <div class="bubble kind">🧒 „${m.mut}“</div>
  </div>`;
}

/* Eine einzige Blase (im Spiel; Inhalt rotiert: Mut-Satz/Ritual/Mission) */
export function mutKompakt(m, rot) {
  if (!m) return "";
  const v = [m.mut, m.punkt, m.mission];
  return `<div class="mut-dialog klein">
    <div class="mut-kopf">🦁 Mutmacher</div>
    <div class="bubble coach">${v[Math.abs(rot || 0) % v.length]}</div>
  </div>`;
}
