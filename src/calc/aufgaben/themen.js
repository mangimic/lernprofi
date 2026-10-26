/* 🎨 Übungs-Welten: das Kind wählt, aus welcher Welt die Übungs-Sätze
   kommen (Muster „Interesse schlägt Pflicht“). Die Satz-Pools sind
   durchgängig nach diesen Welten aufgebaut – jede neue Welt braucht
   Datensätze in ALLEN Themen-Maps (saetze.js, deutsch2.js, schrift.js). */
export const THEMEN_WELTEN = [
  { key: "alltag", emoji: "🌳", name: "Alltag" },
  { key: "angeln", emoji: "🎣", name: "Angeln" },
  { key: "tennis", emoji: "🎾", name: "Tennis" },
  { key: "fussball", emoji: "⚽", name: "Fußball" },
  { key: "dinos", emoji: "🦖", name: "Dinos" },
  { key: "weltraum", emoji: "🚀", name: "Weltraum" },
  { key: "gaming", emoji: "🎮", name: "Blockwelt" },
];
export const THEMEN_KEYS = THEMEN_WELTEN.map((t) => t.key);

/** Filtert eine Themen-Map auf EINE Welt; ohne (gültiges) Thema bleiben alle. */
export function nurThema(themenMap, thema) {
  return thema && themenMap[thema] ? { [thema]: themenMap[thema] } : themenMap;
}
