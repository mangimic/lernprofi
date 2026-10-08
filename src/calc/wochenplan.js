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
  { typ: "mathe", name: "Mathe üben", emoji: "🔢", lern: true },
  { typ: "deutsch", name: "Deutsch üben", emoji: "📖", lern: true },
  // Alt-Typ aus früheren Plänen/Routinen – bleibt gültig, taucht aber
  // nicht mehr in der Palette auf (verborgen).
  { typ: "lernen", name: "Üben", emoji: "✏️", lern: true, verborgen: true },
  { typ: "schrift", name: "Schreiben", emoji: "🖐️", lern: true },
  { typ: "konz", name: "Konzentration", emoji: "🧠", lern: true },
  // Hausaufgaben: Pflicht-Lernzeit (zählt beim Wächter mit), aber keine 10-Minuten-Box.
  { typ: "hausaufgaben", name: "Hausaufgaben", emoji: "📚", lern: true, box: false },
  { typ: "schlagzeug", name: "Schlagzeug", emoji: "🥁", lern: false, kurz: true }, // 10-Minuten-Übe-Einheit
  { typ: "sport", name: "Sport", emoji: "⚽", lern: false },
  { typ: "angeln", name: "Angeln", emoji: "🎣", lern: false },
  { typ: "pfadfinder", name: "Pfadfinder", emoji: "🏕️", lern: false },
  { typ: "freunde", name: "Freunde", emoji: "🧑‍🤝‍🧑", lern: false },
  // Arzttermin: Pflicht, weder Lernen noch Ausgleich – der Wächter zählt ihn nicht als „etwas Schönes".
  { typ: "arzt", name: "Arzttermin", emoji: "🩺", lern: false, ausgleich: false },
  { typ: "frei", name: "Draußen & frei", emoji: "🌳", lern: false },
  // Freitext-Baustein („Oma besuchen", „Schwimmbad" …): kommt über den
  // Fenster-Dialog, der Text lebt in der Notiz. Zählt neutral.
  { typ: "eigen", name: "Eigenes", emoji: "⭐", lern: false, ausgleich: false, verborgen: true },
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
/* Ein „Slot" ist seit v0.28 eine halbe Stunde, gespeichert als Minuten
   seit Mitternacht (840 = 14:00). Halbe Stunden passen zum 10/5-Takt –
   auch 10 Minuten Schlagzeug-Üben haben so ein ehrliches Fenster.
   Schultage: 14-19 Uhr · Wochenende: ganzer Tag ab 9 Uhr. */
export const SLOT_MIN = 30;
export const WERKTAG_START = 13 * 60; // 13 Uhr: erst Spielzeit (nach dem Mittagessen)
export const WOCHENEND_START = 9 * 60;
export const TAG_ENDE = 19 * 60;
/** Die planbaren Slot-Startminuten eines Wochentags (0=Mo … 6=So). */
export function tagesStunden(tag) {
  const start = tag === 5 || tag === 6 ? WOCHENEND_START : WERKTAG_START;
  const liste = [];
  for (let m = start; m < TAG_ENDE; m += SLOT_MIN) liste.push(m);
  return liste;
}
export const uhr = (m) => `${Math.floor(m / 60)}:${String(m % 60).padStart(2, "0")}`;
export const slotLabel = (m) => `${uhr(m)} Uhr`;

/* 🔒 Feste Termine der Familie (Stand Okt 2026, von den Eltern gepflegt;
   liegen als Daten in den Einstellungen – hier nur der Startwert).
   aktiv=true heißt: zählt beim Wächter als Ausgleich zum Lernen. */
/** 🍽️ 13-14 Uhr ist IMMER blockiert: Mittagessen und freie Spielzeit –
    an allen 7 Tagen. mittagErzwingen stellt das auch für gespeicherte
    Termin-Listen sicher (alte „Spielzeit"-Einträge werden ersetzt). */
export function mittagErzwingen(feste) {
  const ohne = (feste || []).filter((f) => !(f.beginn === 780 && (f.name === "Spielzeit" || f.name === "Mittag & Spielzeit")));
  // aktiv:false – Mittag und Spielzeit sind Grundversorgung, kein geplanter
  // Ausgleich: Die 🟡-Ampel („plan was Schönes dazu") soll weiter greifen.
  const mittag = [0, 1, 2, 3, 4, 5, 6].map((tag) => ({
    tag, beginn: 780, dauer: 60, name: "Mittag & Spielzeit", emoji: "🍽️", hinweis: "", aktiv: false,
  }));
  return [...mittag, ...ohne].slice(0, 30);
}

export const FESTE_TERMINE_STANDARD = mittagErzwingen([
  { tag: 0, beginn: 960, dauer: 60, name: "Musikalische Spiele", emoji: "🎵", hinweis: "freiwillig", aktiv: true },
  { tag: 0, beginn: 1080, dauer: 60, name: "Bandprobe", emoji: "🎸", hinweis: "", aktiv: true },
  { tag: 1, beginn: 840, dauer: 60, name: "Italienisch (Schule)", emoji: "🏫", hinweis: "bis 14:50", aktiv: false },
  { tag: 1, beginn: 960, dauer: 30, name: "Schlagzeug-Stunde", emoji: "🥁", hinweis: "", aktiv: true },
  { tag: 1, beginn: 1020, dauer: 60, name: "Sport", emoji: "⚽", hinweis: "", aktiv: true },
  { tag: 2, beginn: 900, dauer: 60, name: "Lernbetreuung", emoji: "🤝", hinweis: "", aktiv: false },
  { tag: 3, beginn: 1020, dauer: 60, name: "Tennis", emoji: "🎾", hinweis: "", aktiv: true },
  { tag: 3, beginn: 1110, dauer: 90, name: "Pfadfinder", emoji: "🏕️", hinweis: "bis 20:00", aktiv: true },
]);
/** 🏫 Schulzeiten (Anzeige im Tageskopf; Vormittags-Stundenplan folgt). */
export const SCHULE = { tage: [0, 1, 2, 3, 4], text: "7:50–13:00", jeTag: {} }; // Fr: Sport bis 13 Uhr

/* 🏫 Stundenplan Klasse 4a (Schuljahr 2026/27, ab 14.09.2026) – reine
   Anzeige, der Vormittag ist nicht planbar. Einträge: [von, bis, Fach,
   freiwillig?] in Minuten. AGs (Bläserklasse/Chor) sind freiwillig.
   Ohne Lehrkräfte-Namen (Datensparsamkeit). */
export const SCHULSTUNDEN = {
  0: [[470, 515, "Deutsch"], [515, 560, "Deutsch"], [580, 625, "Französisch"], [625, 670, "Mathe"], [690, 735, "SU"], [735, 780, "Italienisch"]],
  1: [[470, 515, "Mathe"], [515, 560, "Deutsch · Leseband"], [580, 625, "D1 / It2"], [625, 670, "D2 / It1"], [690, 735, "SU"], [735, 780, "Chor (AG)", true]],
  2: [[470, 515, "Deutsch"], [515, 560, "Französisch"], [580, 625, "Mathe"], [625, 670, "Mathe"], [690, 735, "Deutsch · Leseband"], [735, 780, "BSS (Sport)"]],
  3: [[470, 515, "Mathe"], [515, 560, "Mathe"], [580, 625, "KoKo"], [625, 670, "KoKo"], [690, 735, "KuW"], [735, 780, "KuW"]],
  4: [[470, 515, "SU"], [515, 560, "D1 / It2"], [580, 625, "D2 / It1"], [625, 670, "Musik"], [690, 735, "BSS (Sport)"], [735, 780, "BSS (Sport)"]],
};
export function schulStunden(tag) {
  return SCHULSTUNDEN[tag] || [];
}
/** Schul-Pausen laut Stundenplan (werden mit angezeigt). */
export const SCHUL_PAUSEN = [[560, 575], [670, 685]]; // 9:20-9:35 · 11:10-11:25

/** Anzeige-Zeilen eines Schultags: Stunden + Pausen, nach Uhrzeit sortiert. */
export function schulZeilen(tag) {
  const zeilen = schulStunden(tag).map(([von, bis, fach, ag]) => ({ von, bis, fach, ag: !!ag, pause: false }));
  if (!zeilen.length) return [];
  for (const [von, bis] of SCHUL_PAUSEN) zeilen.push({ von, bis, fach: "Pause", ag: false, pause: true });
  return zeilen.sort((a, b) => a.von - b.von);
}

/** Fächerfolge des Tages fürs Kind (ohne freiwillige AGs, ohne Dubletten). */
export function schulFaecher(tag) {
  const liste = [];
  for (const [, , fach, ag] of schulStunden(tag)) {
    if (!ag && !liste.includes(fach)) liste.push(fach);
  }
  return liste;
}

/** Der feste Termin, der die Slot-Minute abdeckt (Termine haben eine Dauer). */
export function festerTermin(feste, tag, slotMin) {
  return (feste || []).find((f) => f.tag === tag && slotMin >= f.beginn && slotMin < f.beginn + f.dauer) || null;
}

export function slotBelegt(plan, tag, slot) {
  return plan.bloecke.some((b) => b.tag === tag && b.slot === slot);
}

/** ISO-Kalenderwoche des Montags (fürs Sonntags-Gespräch: „KW 42 planen"). */
export function kalenderWoche(montag) {
  const [j, m, t] = String(montag).split("-").map((x) => parseInt(x, 10));
  if (!Number.isFinite(j)) return 0;
  const donnerstag = new Date(Date.UTC(j, (m || 1) - 1, (t || 1) + 3));
  const jahresanfang = new Date(Date.UTC(donnerstag.getUTCFullYear(), 0, 1));
  return Math.ceil(((donnerstag - jahresanfang) / 86400000 + 1) / 7);
}

export function leererPlan(montag) {
  // bloecke: { id, tag, slot: Minuten, typ, fertig?, notiz? } · naechste: Vorplanung
  // ausfaelle: feste Termine, die NUR DIESE WOCHE ausfallen ({ tag, beginn })
  return { montag, bloecke: [], belohnt: [], naechste: null, ausfaelle: [] };
}

/* ❌ Ausfälle: Wenn Sport oder Tennis mal ausfällt, wird der feste
   Termin für genau diese Woche freigegeben – nächste Woche ist er
   automatisch wieder da. */
export function istAusgefallen(plan, tag, beginn) {
  return (plan.ausfaelle || []).some((a) => a.tag === tag && a.beginn === beginn);
}
export function ausfallSetzen(plan, tag, beginn) {
  if (istAusgefallen(plan, tag, beginn)) return plan;
  return { ...plan, ausfaelle: [...(plan.ausfaelle || []), { tag, beginn }].slice(0, 20) };
}
export function ausfallAufheben(plan, tag, beginn, dauer = 0) {
  return {
    ...plan,
    ausfaelle: (plan.ausfaelle || []).filter((a) => !(a.tag === tag && a.beginn === beginn)),
    // Ist der Termin wieder da, räumen seine Fenster die dort geparkten Bausteine frei.
    bloecke: plan.bloecke.filter((b) => !(b.tag === tag && b.slot >= beginn && b.slot < beginn + dauer)),
  };
}

/** Gültiger Plan für DIESE Woche – eine alte Woche startet frisch.
    Verlustfreie Anhebung alter Slot-Formate: Index 0-4 (v0.27) und
    volle Stunden 9-23 werden zu Minuten; Blöcke ohne gültigen Slot
    bekommen den ersten freien Slot ihres Tages. */
export function planFuerWoche(plan, montag) {
  if (plan && plan.montag !== montag && plan.naechste?.montag === montag && Array.isArray(plan.naechste.bloecke)) {
    // Wochenwechsel: die sonntags besprochene Vorplanung wird zur aktiven Woche.
    return planFuerWoche({
      montag, bloecke: plan.naechste.bloecke, belohnt: [], naechste: null,
      ausfaelle: Array.isArray(plan.naechste.ausfaelle) ? plan.naechste.ausfaelle : [],
    }, montag);
  }
  if (!(plan && plan.montag === montag && Array.isArray(plan.bloecke))) return leererPlan(montag);
  const gueltig = (b) => Number.isInteger(b.slot) && tagesStunden(b.tag).includes(b.slot);
  if (plan.bloecke.every(gueltig)) return plan;
  const bloecke = [];
  for (const b of plan.bloecke) {
    let s = Number.isInteger(b.slot) ? b.slot : null;
    if (s !== null && s < 9) s = (s + 14) * 60;       // Index-Slot (v0.27)
    else if (s !== null && s < 24) s = s * 60;        // Stunden-Slot (Zwischenstand)
    const slots = tagesStunden(b.tag);
    if (s === null || !slots.includes(s) || bloecke.some((x) => x.tag === b.tag && x.slot === s)) {
      s = slots.find((m) => !bloecke.some((x) => x.tag === b.tag && x.slot === m)) ?? slots[0];
    }
    bloecke.push({ ...b, slot: s });
  }
  return { ...plan, bloecke };
}

export function naechsteId(bloecke) {
  return bloecke.reduce((m, b) => Math.max(m, b.id || 0), 0) + 1;
}

export function blockHinzu(plan, tag, typ, slot) {
  if (tag < 0 || tag > 6 || !BAUSTEINE.some((b) => b.typ === typ)) return plan;
  if (!tagesStunden(tag).includes(slot)) return plan; // nur planbare Stunden
  if (slotBelegt(plan, tag, slot)) return plan; // ein Baustein je Stunde
  const bloecke = [...plan.bloecke, { id: naechsteId(plan.bloecke), tag, slot, typ }];
  return { ...plan, bloecke: bloecke.slice(0, 60) }; // harte Obergrenze
}

export function blockWeg(plan, id) {
  return { ...plan, bloecke: plan.bloecke.filter((b) => b.id !== id) };
}

/* 🔁 Wochen-Routine: Das Üben soll fester Rhythmus werden – die
   Freunde-Zeit wird dagegen jede Woche neu verabredet (sonntags
   besprochen) und wandert deshalb NICHT in die Routine. */
export function routineAusPlan(plan) {
  return plan.bloecke
    .filter((b) => b.typ !== "freunde")
    .map(({ tag, slot, typ }) => ({ tag, slot, typ }));
}

/** Routine in einen (Wochen-)Plan legen – nur in freie Slots. */
export function routineAnwenden(plan, routine) {
  let p = plan;
  for (const r of routine || []) p = blockHinzu(p, r.tag, r.typ, r.slot);
  return p;
}

/** Baustein in ein anderes freies Fenster schieben (gleicher oder anderer Tag). */
export function blockVerschieben(plan, id, tag, slot) {
  const block = plan.bloecke.find((b) => b.id === id);
  if (!block || !tagesStunden(tag).includes(slot)) return plan;
  if (plan.bloecke.some((b) => b.id !== id && b.tag === tag && b.slot === slot)) return plan;
  return { ...plan, bloecke: plan.bloecke.map((b) => (b.id === id ? { ...b, tag, slot } : b)) };
}

/** 📋 Ganze Woche als Vorlage übernehmen: Bausteine (ohne Haken, mit
    Notizen) in die freien Fenster des Ziel-Plans legen. */
export function wocheKopieren(ziel, quelle) {
  let p = ziel;
  for (const b of quelle.bloecke) {
    const vorher = p.bloecke.length;
    p = blockHinzu(p, b.tag, b.typ, b.slot);
    if (p.bloecke.length > vorher && b.notiz) p = blockNotiz(p, p.bloecke[p.bloecke.length - 1].id, b.notiz);
  }
  return p;
}

/** Notiz an einem Baustein (z. B. der Name des Freundes, das Übe-Thema). */
export function blockNotiz(plan, id, notiz) {
  const t = String(notiz || "").trim().slice(0, 24);
  return { ...plan, bloecke: plan.bloecke.map((b) => (b.id === id ? { ...b, notiz: t } : b)) };
}

/** Haken dran: Baustein ist geschafft (bleibt im Plan, wird durchgestrichen). */
export function blockFertig(plan, id) {
  return { ...plan, bloecke: plan.bloecke.map((b) => (b.id === id ? { ...b, fertig: true, gezaehlt: true } : b)) };
}

/** Haken wieder weg (Verklickt? Doch nicht fertig?). Der gezaehlt-Merker
    bleibt: Die Mission/Münze wurde schon vergeben und kommt beim erneuten
    Abhaken nicht doppelt. */
export function blockUnfertig(plan, id) {
  return { ...plan, bloecke: plan.bloecke.map((b) => (b.id === id ? { ...b, fertig: false } : b)) };
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
    // Gegen das Tages-Limit zählen nur echte 10-Minuten-Boxen –
    // Hausaufgaben sind Pflicht und dürfen das Üben nicht verdrängen.
    const boxen = am.filter((b) => { const inf = bausteinInfo(b.typ); return inf.lern && inf.box !== false; }).length;
    // Feste Aktiv-Termine zählen als Ausgleich – außer sie fallen diese Woche aus.
    // Pflicht-Bausteine ohne Ausgleichswert (Arzttermin) zählen ebenfalls nicht.
    const frei = am.filter((b) => { const i = bausteinInfo(b.typ); return !i.lern && i.ausgleich !== false; }).length
      + (feste || []).filter((f) => f.tag === i && f.aktiv && !istAusgefallen(plan, i, f.beginn)).length;
    // 🥁📚 Familienregel: VOR dem Üben kommen Hausaufgaben und Schlagzeug.
    const uebenSlots = am.filter((b) => ["mathe", "deutsch", "lernen", "schrift", "konz"].includes(b.typ)).map((b) => b.slot);
    const ersterUeben = uebenSlots.length ? Math.min(...uebenSlots) : null;
    let reihenfolge = "";
    if (ersterUeben !== null) {
      const hausVorher = am.some((b) => b.typ === "hausaufgaben" && b.slot < ersterUeben);
      const schlagzeugVorher = am.some((b) => b.typ === "schlagzeug" && b.slot < ersterUeben)
        || (feste || []).some((f) => f.tag === i && f.name.includes("Schlagzeug")
          && f.beginn < ersterUeben && !istAusgefallen(plan, i, f.beginn));
      if (!hausVorher && !schlagzeugVorher) reihenfolge = "Erst 📚 Hausaufgaben und 🥁 Schlagzeug, dann Üben – schieb sie vor die Lernboxen!";
      else if (!hausVorher) reihenfolge = "Erst 📚 Hausaufgaben, dann Üben – schieb sie vor die Lernboxen!";
      else if (!schlagzeugVorher) reihenfolge = "Erst 🥁 Schlagzeug, dann Üben – schieb es vor die Lernboxen!";
    }
    let status = "ok";
    let hinweis = "";
    if (boxen > maxLern) {
      status = "voll";
      hinweis = `Puh, ${boxen} Lernboxen – mehr als ${maxLern} schafft kein Kopf gut. Schieb eine auf einen anderen Tag!`;
    } else if (reihenfolge) {
      status = "reihenfolge";
      hinweis = reihenfolge;
    } else if (lern > 0 && frei === 0) {
      status = "einseitig";
      hinweis = "Nur Lernen geplant – pack noch etwas Schönes dazu (Sport, Freunde, draußen)!";
    }
    return { lern, frei, lernMin: boxen * LERN_MINUTEN, status, hinweis };
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
