/* ============================================================
   ♟️ SCHACH-LOGIK – originalgetreuer Port aus der Alt-App:
   echtes Schach mit allen Regeln (Rochade, en passant, Umwandlung,
   Matt & Patt) und einer kindgerecht schwachen KI (2 Halbzüge
   Negamax + Zufall unter gleich guten Zügen). Reine Spielregeln –
   kein DOM; nur die KI würfelt unter gleichwertigen Zügen.
   Brett: 64 Felder, Index 0 = a8 (oben links), 63 = h1.
   ============================================================ */
export const SCH_START = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -";
export const SCH_SYM = { K: "♔", Q: "♕", R: "♖", B: "♗", N: "♘", P: "♙", k: "♚", q: "♛", r: "♜", b: "♝", n: "♞", p: "♟" };
const SCH_FIGWERT = { P: 1, N: 3, B: 3.2, R: 5, Q: 9, K: 0 };

export function schFeldIdx(name) { return (8 - parseInt(name[1], 10)) * 8 + (name.charCodeAt(0) - 97); }
export function schFeldName(i) { return String.fromCharCode(97 + (i % 8)) + (8 - Math.floor(i / 8)); }
export function schWeissFig(f) { return !!f && f === f.toUpperCase(); }

export function schFen(fen) {
  const t = String(fen).trim().split(/\s+/); const b = new Array(64).fill("");
  let i = 0;
  for (const ch of t[0]) { if (ch === "/") continue; if (/\d/.test(ch)) i += parseInt(ch, 10); else b[i++] = ch; }
  return { b, weiss: t[1] !== "b", roch: (t[2] || "-"), ep: (t[3] && t[3] !== "-") ? schFeldIdx(t[3]) : -1 };
}

// Greift die Seite `weiss` das Feld `ziel` an?
export function schAngreift(st, ziel, weiss) {
  const b = st.b, R = Math.floor(ziel / 8), C = ziel % 8;
  const feld = (r, c) => (r >= 0 && r < 8 && c >= 0 && c < 8) ? b[r * 8 + c] : null;
  const passt = (f, art) => !!f && schWeissFig(f) === weiss && f.toUpperCase() === art;
  const dr = weiss ? 1 : -1; // weiße Bauern greifen von der Reihe darunter an
  for (const dc of [-1, 1]) if (passt(feld(R + dr, C + dc), "P")) return true;
  for (const d of [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]])
    if (passt(feld(R + d[0], C + d[1]), "N")) return true;
  for (let a2 = -1; a2 <= 1; a2++) for (let c2 = -1; c2 <= 1; c2++) {
    if (!a2 && !c2) continue;
    if (passt(feld(R + a2, C + c2), "K")) return true;
  }
  const strahl = (dirs, arten) => {
    for (const d of dirs) {
      let r = R + d[0], c = C + d[1];
      while (r >= 0 && r < 8 && c >= 0 && c < 8) {
        const f = b[r * 8 + c];
        if (f) { if (schWeissFig(f) === weiss && arten.indexOf(f.toUpperCase()) >= 0) return true; break; }
        r += d[0]; c += d[1];
      }
    }
    return false;
  };
  if (strahl([[0, 1], [0, -1], [1, 0], [-1, 0]], ["R", "Q"])) return true;
  if (strahl([[1, 1], [1, -1], [-1, 1], [-1, -1]], ["B", "Q"])) return true;
  return false;
}

export function schImSchach(st, weiss) { return schAngreift(st, st.b.indexOf(weiss ? "K" : "k"), !weiss); }

function schPseudo(st) {
  const z = [], b = st.b, w = st.weiss;
  const push = (von, nach, extra) => { const o = extra || {}; o.von = von; o.nach = nach; z.push(o); };
  for (let i = 0; i < 64; i++) {
    const f = b[i]; if (!f || schWeissFig(f) !== w) continue;
    const R = Math.floor(i / 8), C = i % 8, art = f.toUpperCase();
    if (art === "P") {
      const dr = w ? -1 : 1, start = w ? 6 : 1, letzte = w ? 0 : 7;
      if (R + dr >= 0 && R + dr < 8) {
        const vor = (R + dr) * 8 + C;
        if (!b[vor]) {
          push(i, vor, { umw: (R + dr) === letzte });
          if (R === start && !b[(R + 2 * dr) * 8 + C]) push(i, (R + 2 * dr) * 8 + C, { dopp: true });
        }
        for (const dc of [-1, 1]) {
          const c2 = C + dc; if (c2 < 0 || c2 > 7) continue;
          const j = (R + dr) * 8 + c2;
          if (b[j] && schWeissFig(b[j]) !== w) push(i, j, { umw: (R + dr) === letzte });
          else if (j === st.ep) push(i, j, { ep: true });
        }
      }
    } else if (art === "N" || art === "K") {
      const spruenge = art === "N"
        ? [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]]
        : [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
      for (const d of spruenge) {
        const r = R + d[0], c = C + d[1];
        if (r < 0 || r > 7 || c < 0 || c > 7) continue;
        const j = r * 8 + c;
        if (!b[j] || schWeissFig(b[j]) !== w) push(i, j);
      }
      if (art === "K") {
        const reihe = w ? 7 : 0;
        if (i === reihe * 8 + 4 && !schImSchach(st, w)) {
          if (st.roch.indexOf(w ? "K" : "k") >= 0 && !b[reihe * 8 + 5] && !b[reihe * 8 + 6]
            && b[reihe * 8 + 7] === (w ? "R" : "r")
            && !schAngreift(st, reihe * 8 + 5, !w) && !schAngreift(st, reihe * 8 + 6, !w))
            push(i, reihe * 8 + 6, { roch: "k" });
          if (st.roch.indexOf(w ? "Q" : "q") >= 0 && !b[reihe * 8 + 3] && !b[reihe * 8 + 2] && !b[reihe * 8 + 1]
            && b[reihe * 8 + 0] === (w ? "R" : "r")
            && !schAngreift(st, reihe * 8 + 3, !w) && !schAngreift(st, reihe * 8 + 2, !w))
            push(i, reihe * 8 + 2, { roch: "q" });
        }
      }
    } else {
      const dirs = art === "R" ? [[0, 1], [0, -1], [1, 0], [-1, 0]]
        : art === "B" ? [[1, 1], [1, -1], [-1, 1], [-1, -1]]
        : [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]];
      for (const d of dirs) {
        let r = R + d[0], c = C + d[1];
        while (r >= 0 && r < 8 && c >= 0 && c < 8) {
          const j = r * 8 + c;
          if (!b[j]) push(i, j);
          else { if (schWeissFig(b[j]) !== w) push(i, j); break; }
          r += d[0]; c += d[1];
        }
      }
    }
  }
  return z;
}

export function schZug(st, z) {
  const b = st.b.slice(), f = b[z.von], w = st.weiss;
  let roch = st.roch, ep = -1;
  b[z.nach] = z.umw ? (w ? "Q" : "q") : f;
  b[z.von] = "";
  if (z.ep) b[z.nach + (w ? 8 : -8)] = "";
  if (z.dopp) ep = z.nach + (w ? 8 : -8);
  if (z.roch === "k") { const r = w ? 7 : 0; b[r * 8 + 5] = b[r * 8 + 7]; b[r * 8 + 7] = ""; }
  if (z.roch === "q") { const r = w ? 7 : 0; b[r * 8 + 3] = b[r * 8 + 0]; b[r * 8 + 0] = ""; }
  if (f === "K") roch = roch.replace("K", "").replace("Q", "");
  if (f === "k") roch = roch.replace("k", "").replace("q", "");
  [[63, "K"], [56, "Q"], [7, "k"], [0, "q"]].forEach((x) => { if (z.von === x[0] || z.nach === x[0]) roch = roch.replace(x[1], ""); });
  return { b, weiss: !w, roch: roch || "-", ep };
}

export function schZuege(st) {
  return schPseudo(st).filter((z) => !schImSchach(schZug(st, z), st.weiss));
}

export function schWert(st) {
  let sum = 0;
  for (let i = 0; i < 64; i++) {
    const f = st.b[i]; if (!f) continue;
    const v = SCH_FIGWERT[f.toUpperCase()] + ((i === 27 || i === 28 || i === 35 || i === 36) ? 0.25 : 0);
    sum += schWeissFig(f) ? v : -v;
  }
  return sum;
}

// Kleine KI: 2 Halbzüge Negamax + Zufall unter gleich guten Zügen
export function schKI(st) {
  const nega = (s, t) => {
    const zg = schZuege(s);
    if (!zg.length) return schImSchach(s, s.weiss) ? -1000 - t : 0;
    if (t <= 0) return schWert(s) * (s.weiss ? 1 : -1);
    let best = -Infinity;
    for (const z of zg) { const v = -nega(schZug(s, z), t - 1); if (v > best) best = v; }
    return best;
  };
  const zg = schZuege(st); if (!zg.length) return null;
  let best = -Infinity, kand = [];
  for (const z of zg) {
    const v = -nega(schZug(st, z), 1);
    if (v > best + 0.01) { best = v; kand = [z]; }
    else if (Math.abs(v - best) <= 0.01) kand.push(z);
  }
  return kand[Math.floor(Math.random() * kand.length)];
}
