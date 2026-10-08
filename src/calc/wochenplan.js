/* ============================================================
   🗓️ MEIN WOCHENPLAN – reine Logik (Etappe 9).
   Felix setzt sich sein Pensum SELBST: Bausteine (Lernen, Schlagzeug,
   Sport, Pfadfinder, Freunde …) wandern per Antippen oder Ziehen in
   die Wochentage. Lern-Bausteine sind feste 10-Minuten-Boxen
   (Timeboxing 10/5 wie zu Hause bewährt).
   Der ADHS-Wächter läuft im Hintergrund: Er VERBIETET nichts, sondern
   zeigt eine freundliche Ampel – gegen das typische Sich-Überladen
   beim Planen und fürs Verteilen vor Klassenarbeiten (verteiltes
   Üben schlägt Pauken am Vorabend).
   ============================================================ */

export const WOCHENTAGE = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

/** Bausteine der Palette. lern=true → zählt als 10-Minuten-Lernbox. */
export const BAUSTEINE = [
  { typ: "lernen", name: "Üben", emoji: "✏️", lern: true },
  { typ: "schrift", name: "Schreiben", emoji: "🖐️", lern: true },
  { typ: "konz", name: "Konzentration", emoji: "🧠", lern: true },
  // Hausaufgaben: Pflicht-Lernzeit (zählt beim Wächter mit), aber keine 10-Minuten-Box.
  { typ: "hausaufgaben", name: "Hausaufgaben", emoji: "📚", lern: true, box: false },
  { typ: "schlagzeug", name: "Schlagzeug", emoji: "🥁", lern: false },
  { typ: "sport", name: "Sport", emoji: "⚽", lern: false },
  { typ: "pfadfinder", name: "Pfadfinder", emoji: "🏕️", lern: false },
  { typ: "freunde", name: "Freunde", emoji: "🧑‍🤝‍🧑", lern: false },
  { typ: "frei", name: "Draußen & frei", emoji: "🌳", lern: false },
];
export const LERN_MINUTEN = 10; // eine Lernbox (danach 5 Minuten Pause)

export const TERMIN_ARTEN = {
  ka: { name: "Klassenarbeit", emoji: "📝" },
  kompass: { name: "Kompass-Test", emoji: "🧭" },
  wdw: { name: "Wörter der Woche", emoji: "🔤" },
};

export function bausteinInfo(typ) {
  return BAUSTEINE.find((b) => b.typ === typ) || { typ, name: typ, emoji: "⬜", lern: false };
}

/** Der Montag der Woche, in der `heute` liegt (ISO-Datum). */
export function wochenMontag(heute) {
  const [j, m, t] = String(heute).split("-").map((x) => parseInt(x, 10));
  if (!Number.isFinite(j)) return String(heute);
  const d = new Date(Date.UTC(j, (m || 1) - 1, t || 1));
  const wt = (d.getUTCDay() + 6) % 7; // Mo=0 … So=6
  d.setUTCDate(d.getUTCDate() - wt);
  return d.toISOString().slice(0, 10);
}

/** ISO-Datum des Wochentags idx (0=Mo … 6=So) ab diesem Montag. */
export function tagDatum(montag, idx) {
  const [j, m, t] = String(montag).split("-").map((x) => parseInt(x, 10));
  if (!Number.isFinite(j)) return String(montag);
  return new Date(Date.UTC(j, (m || 1) - 1, (t || 1) + idx)).toISOString().slice(0, 10);
}

/* ⏰ Zeitfenster: Felix' Nachmittag von 14 bis 19 Uhr, je Tag fünf
   Stunden-Slots. Der Vormittag (Schul-Stundenplan) kommt später als
   eigener Abschnitt dazu – die Slot-Struktur ist darauf vorbereitet. */
export const SLOT_STUNDEN = [14, 15, 16, 17, 18];
export const slotLabel = (s) => `${SLOT_STUNDEN[s]}–${SLOT_STUNDEN[s] + 1} Uhr`;

/* 🔒 Feste Termine der Familie (Stand Okt 2026, von den Eltern gepflegt;
   liegen als Daten in den Einstellungen – hier nur der Startwert).
   aktiv=true heißt: zählt beim Wächter als Ausgleich zum Lernen. */
export const FESTE_TERMINE_STANDARD = [
  { tag: 0, slot: 2, name: "Musikalische Spiele", emoji: "🎵", hinweis: "freiwillig", aktiv: true },
  { tag: 0, slot: 4, name: "Bandprobe", emoji: "🎸", hinweis: "", aktiv: true },
  { tag: 1, slot: 0, name: "Italienisch (Schule)", emoji: "🏫", hinweis: "", aktiv: false },
  { tag: 1, slot: 2, name: "Schlagzeug-Stunde", emoji: "🥁", hinweis: "bis 16:30", aktiv: true },
  { tag: 1, slot: 3, name: "Sport", emoji: "⚽", hinweis: "", aktiv: true },
  { tag: 2, slot: 1, name: "Lernbetreuung", emoji: "🤝", hinweis: "", aktiv: false },
  { tag: 3, slot: 3, name: "Tennis", emoji: "🎾", hinweis: "", aktiv: true },
  { tag: 3, slot: 4, name: "Pfadfinder", emoji: "🏕️", hinweis: "bis 20:00", aktiv: true },
];
/** 🏫 Schulzeiten (Anzeige im Tageskopf; Vormittags-Stundenplan folgt). */
export const SCHULE = { tage: [0, 1, 2, 3, 4], text: "7:45–13:00" };

export function festerTermin(feste, tag, slot) {
  return (feste || []).find((f) => f.tag === tag && f.slot === slot) || null;
}

export function slotBelegt(plan, tag, slot) {
  return plan.bloecke.some((b) => b.tag === tag && b.slot === slot);
}

export function leererPlan(montag) {
  return { montag, bloecke: [], belohnt: [] }; // bloecke: { id, tag: 0-6, slot: 0-4, typ, fertig? }
}

/** Gültiger Plan für DIESE Woche – eine alte Woche startet frisch.
    Blöcke aus der Zeit VOR den Zeitfenstern bekommen der Reihe nach
    freie Stunden zugewiesen (verlustfreie Anhebung). */
export function planFuerWoche(plan, montag) {
  if (!(plan && plan.montag === montag && Array.isArray(plan.bloecke))) return leererPlan(montag);
  if (plan.bloecke.every((b) => Number.isInteger(b.slot))) return plan;
  const bloecke = [];
  for (const b of plan.bloecke) {
    if (Number.isInteger(b.slot)) { bloecke.push(b); continue; }
    const frei = SLOT_STUNDEN.findIndex((_, s) => !bloecke.some((x) => x.tag === b.tag && x.slot === s));
    bloecke.push({ ...b, slot: frei === -1 ? 0 : frei });
  }
  return { ...plan, bloecke };
}

export function naechsteId(bloecke) {
  return bloecke.reduce((m, b) => Math.max(m, b.id || 0), 0) + 1;
}

export function blockHinzu(plan, tag, typ, slot) {
  if (tag < 0 || tag > 6 || !BAUSTEINE.some((b) => b.typ === typ)) return plan;
  if (!Number.isInteger(slot) || slot < 0 || slot >= SLOT_STUNDEN.length) return plan;
  if (slotBelegt(plan, tag, slot)) return plan; // ein Baustein je Stunde
  const bloecke = [...plan.bloecke, { id: naechsteId(plan.bloecke), tag, slot, typ }];
  return { ...plan, bloecke: bloecke.slice(0, 60) }; // harte Obergrenze
}

export function blockWeg(plan, id) {
  return { ...plan, bloecke: plan.bloecke.filter((b) => b.id !== id) };
}

/** Haken dran: Baustein ist geschafft (bleibt im Plan, wird durchgestrichen). */
export function blockFertig(plan, id) {
  return { ...plan, bloecke: plan.bloecke.map((b) => (b.id === id ? { ...b, fertig: true } : b)) };
}

/** Alle Bausteine eines Tages geschafft (und es gibt welche)? */
export function tagGeschafft(plan, tagIdx) {
  const am = plan.bloecke.filter((b) => b.tag === tagIdx);
  return am.length > 0 && am.every((b) => b.fertig);
}

/** Tages-Belohnung (1 Münze) nur einmal je Datum. */
export function heuteBelohnt(plan, heute) {
  return Array.isArray(plan.belohnt) && plan.belohnt.includes(heute);
}
export function belohnungEintragen(plan, heute) {
  const liste = Array.isArray(plan.belohnt) ? plan.belohnt : [];
  return heuteBelohnt(plan, heute) ? plan : { ...plan, belohnt: [...liste, heute].slice(-7) };
}

/** Wochen-Bilanz für den Rückblick: geschafft vs. geplant. */
export function wochenBilanz(plan) {
  const gesamt = plan.bloecke.length;
  const fertig = plan.bloecke.filter((b) => b.fertig).length;
  const lernFertig = plan.bloecke.filter((b) => b.fertig && bausteinInfo(b.typ).lern).length;
  return { gesamt, fertig, lernFertig, alles: gesamt > 0 && fertig === gesamt };
}

/** Termine dieser Woche, je Wochentag-Index gruppiert. */
export function termineDerWoche(termine, montag) {
  const je = Array.from({ length: 7 }, () => []);
  for (const t of termine || []) {
    for (let i = 0; i < 7; i++) {
      if (t.tag === tagDatum(montag, i)) je[i].push(t);
    }
  }
  return je;
}

/* 🦁 ADHS-Wächter: prüft den Plan und gibt je Tag eine Ampel plus
   höchstens EINEN freundlichen Hinweis (nie eine Fehlerliste). */
export function planPruefung(plan, termine, zeitLimit, feste = []) {
  const maxLern = Math.max(1, Math.min(3, Math.floor((zeitLimit > 0 ? zeitLimit : 30) / LERN_MINUTEN)));
  const je = termineDerWoche(termine, plan.montag);
  const tage = WOCHENTAGE.map((_, i) => {
    const am = plan.bloecke.filter((b) => b.tag === i);
    const lern = am.filter((b) => bausteinInfo(b.typ).lern).length;
    // Feste Aktiv-Termine (Bandprobe, Sport, Tennis, Pfadfinder …) zählen als Ausgleich.
    const frei = am.length - lern + (feste || []).filter((f) => f.tag === i && f.aktiv).length;
    let status = "ok";
    let hinweis = "";
    if (lern > maxLern) {
      status = "voll";
      hinweis = `Puh, ${lern} Lernboxen – mehr als ${maxLern} schafft kein Kopf gut. Schieb eine auf einen anderen Tag!`;
    } else if (lern > 0 && frei === 0) {
      status = "einseitig";
      hinweis = "Nur Lernen geplant – pack noch etwas Schönes dazu (Sport, Freunde, draußen)!";
    }
    return { lern, frei, lernMin: lern * LERN_MINUTEN, status, hinweis };
  });

  // Vor einem Termin lieber VERTEILEN als am Vorabend pauken.
  const hinweise = [];
  for (let i = 0; i < 7; i++) {
    for (const t of je[i]) {
      const art = TERMIN_ARTEN[t.art] || { name: "Termin", emoji: "📅" };
      const lernTageVorher = tage.filter((tg, j) => j < i && tg.lern > 0).length;
      if (i >= 2 && lernTageVorher === 0) {
        hinweise.push(`${art.emoji} ${art.name}${t.fach ? ` (${t.fach})` : ""} am ${WOCHENTAGE[i]} – plane an 2 Tagen davor je eine Lernbox. Verteilt übt es sich leichter!`);
      } else if (i >= 2 && lernTageVorher === 1) {
        hinweise.push(`${art.emoji} Vor ${art.name}${t.fach ? ` (${t.fach})` : ""} am ${WOCHENTAGE[i]}: noch ein zweiter Übungstag wäre stark – verteilt bleibt mehr hängen.`);
      }
    }
  }
  const voll = tage.some((t) => t.status === "voll");
  return { tage, hinweise, maxLern, ok: !voll && hinweise.length === 0 };
}
