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

export function leererPlan(montag) {
  return { montag, bloecke: [] }; // bloecke: { id, tag: 0-6, typ }
}

/** Gültiger Plan für DIESE Woche – eine alte Woche startet frisch. */
export function planFuerWoche(plan, montag) {
  return plan && plan.montag === montag && Array.isArray(plan.bloecke) ? plan : leererPlan(montag);
}

export function naechsteId(bloecke) {
  return bloecke.reduce((m, b) => Math.max(m, b.id || 0), 0) + 1;
}

export function blockHinzu(plan, tag, typ) {
  if (tag < 0 || tag > 6 || !BAUSTEINE.some((b) => b.typ === typ)) return plan;
  const bloecke = [...plan.bloecke, { id: naechsteId(plan.bloecke), tag, typ }];
  return { ...plan, bloecke: bloecke.slice(0, 60) }; // harte Obergrenze
}

export function blockWeg(plan, id) {
  return { ...plan, bloecke: plan.bloecke.filter((b) => b.id !== id) };
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
export function planPruefung(plan, termine, zeitLimit) {
  const maxLern = Math.max(1, Math.min(3, Math.floor((zeitLimit > 0 ? zeitLimit : 30) / LERN_MINUTEN)));
  const je = termineDerWoche(termine, plan.montag);
  const tage = WOCHENTAGE.map((_, i) => {
    const am = plan.bloecke.filter((b) => b.tag === i);
    const lern = am.filter((b) => bausteinInfo(b.typ).lern).length;
    const frei = am.length - lern;
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
