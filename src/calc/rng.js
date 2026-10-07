/* Seedbarer Zufall – Zufall kommt in calc-Modulen IMMER als Parameter.
   mulberry32: klein, schnell, reproduzierbar (für Tests und faire Mischung). */
export function rngAusSeed(seed) {
  let h = typeof seed === "number"
    ? seed >>> 0
    : [...String(seed)].reduce((a, z) => (Math.imul(a, 31) + z.charCodeAt(0)) >>> 0, 7);
  return function () {
    h |= 0; h = (h + 0x6d2b79f5) | 0;
    let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Fisher-Yates-Mischung als Kopie (verändert die Eingabe nicht). */
export function mischen(liste, rng) {
  const k = liste.slice();
  for (let i = k.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [k[i], k[j]] = [k[j], k[i]];
  }
  return k;
}
