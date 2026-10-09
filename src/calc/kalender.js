/* ============================================================
   🗓️ SCHULJAHRES-KALENDER – reine Logik.
   Schulferien und gesetzliche Feiertage Baden-Württemberg für das
   Schuljahr 2026/27 (Quelle: Kultusministerium BW über die gängigen
   Ferienportale, Stand Okt 2026). Bewegliche Ferientage legt jede
   Schule selbst fest – die trägt die Familie als Termin/Ausfall ein.
   An Ferien- und Feiertagen ist der ganze Tag planbar (ab 9 Uhr),
   wie am Wochenende.
   ============================================================ */

export const SCHULJAHR = { name: "2026/27", von: "2026-09-14", bis: "2027-09-12" };

export const FERIEN_BW = [
  { name: "Herbstferien", emoji: "🍂", von: "2026-10-26", bis: "2026-10-31" }, // 31.10. Reformationstag schulfrei
  { name: "Weihnachtsferien", emoji: "🎄", von: "2026-12-23", bis: "2027-01-09" },
  { name: "Osterferien", emoji: "🐣", von: "2027-03-25", bis: "2027-04-03" },
  { name: "Pfingstferien", emoji: "🌼", von: "2027-05-18", bis: "2027-05-29" },
  { name: "Sommerferien", emoji: "☀️", von: "2027-07-29", bis: "2027-09-11" },
];

export const FEIERTAGE_BW = {
  "2026-11-01": "Allerheiligen",
  "2027-01-06": "Heilige Drei Könige",
  "2027-03-26": "Karfreitag",
  "2027-03-29": "Ostermontag",
  "2027-05-01": "Tag der Arbeit",
  "2027-05-06": "Christi Himmelfahrt",
  "2027-05-17": "Pfingstmontag",
  "2027-05-27": "Fronleichnam",
};

/** Die Ferien, in denen das Datum liegt (oder null). */
export function ferienAm(datum) {
  return FERIEN_BW.find((f) => datum >= f.von && datum <= f.bis) || null;
}

/** Name des gesetzlichen Feiertags (oder null). */
export function feiertagAm(datum) {
  return FEIERTAGE_BW[datum] || null;
}

/** Schulfrei (Ferien ODER Feiertag) – Wochenenden zählen separat. */
export function schulfreiAm(datum) {
  const ferien = ferienAm(datum);
  if (ferien) return { art: "ferien", name: ferien.name, emoji: ferien.emoji };
  const feiertag = feiertagAm(datum);
  if (feiertag) return { art: "feiertag", name: feiertag, emoji: "🎉" };
  return null;
}

const MONATE = ["Januar", "Februar", "März", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Dezember"];

export function monatsName(jahr, monat) {
  return `${MONATE[monat - 1]} ${jahr}`;
}

const iso = (d) => d.toISOString().slice(0, 10);

/** Monats-Gitter (Mo-basiert): Wochen à 7 ISO-Daten, die den Monat abdecken. */
export function monatsGitter(jahr, monat) {
  const erster = new Date(Date.UTC(jahr, monat - 1, 1));
  const start = new Date(erster);
  start.setUTCDate(1 - ((erster.getUTCDay() + 6) % 7)); // Montag der ersten Woche
  const wochen = [];
  const d = new Date(start);
  while (d.getUTCFullYear() < jahr || (d.getUTCFullYear() === jahr && d.getUTCMonth() < monat)) {
    const tage = [];
    for (let i = 0; i < 7; i++) { tage.push(iso(d)); d.setUTCDate(d.getUTCDate() + 1); }
    wochen.push({ montag: tage[0], tage });
    if (wochen.length > 6) break;
  }
  return wochen;
}

/** Monat vor/zurück: { jahr, monat } ± 1. */
export function monatSchritt(jahr, monat, schritt) {
  const m = monat - 1 + schritt;
  return { jahr: jahr + Math.floor(m / 12), monat: ((m % 12) + 12) % 12 + 1 };
}
