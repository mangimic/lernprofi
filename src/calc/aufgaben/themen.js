/* 🎨 Übungs-Welten: Felix wählt, aus welcher Welt die Übungs-Sätze
   kommen (Muster „Interesse schlägt Pflicht“). Die Satz-Pools der
   Alt-App sind durchgängig nach diesen vier Welten aufgebaut. */
export const THEMEN_WELTEN = [
  { key: "alltag", emoji: "🌳", name: "Alltag" },
  { key: "angeln", emoji: "🎣", name: "Angeln" },
  { key: "tennis", emoji: "🎾", name: "Tennis" },
  { key: "fussball", emoji: "⚽", name: "Fußball" },
];
export const THEMEN_KEYS = THEMEN_WELTEN.map((t) => t.key);

/** Filtert eine Themen-Map auf EINE Welt; ohne (gültiges) Thema bleiben alle. */
export function nurThema(themenMap, thema) {
  return thema && themenMap[thema] ? { [thema]: themenMap[thema] } : themenMap;
}
