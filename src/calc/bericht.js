/* ============================================================
   📊 WOCHENBERICHT – reine Logik: sammelt die anonymen Lerndaten
   der letzten 7 Tage für Leos Eltern-Bericht.
   Datensparsamkeit ist Pflicht: KEIN Name, KEIN Freitext des
   Kindes – nur Zähler, Stufen und Tagesformen.
   ============================================================ */

/** ISO-Datum minus n Tage (deterministisch, nur aus Parametern). */
export function isoMinusTage(heute, n) {
  const [j, m, t] = String(heute).split("-").map((x) => parseInt(x, 10));
  if (!Number.isFinite(j)) return String(heute);
  return new Date(Date.UTC(j, (m || 1) - 1, (t || 1) - n)).toISOString().slice(0, 10);
}

/** Kompakte, anonyme Zusammenfassung für den Wochenbericht. */
export function berichtDaten(data, heute) {
  const grenze = isoMinusTage(heute, 6);
  const tage = (data.lernstand.lerntage || [])
    .filter((t) => t.tag >= grenze && t.tag <= heute)
    .map((t) => ({
      tag: t.tag, aufgaben: t.aufgaben || 0, missionen: t.missionen || 0,
      ziel: !!t.zielErreicht, form: t.form || "",
    }));
  const stufen = Object.entries(data.lernstand.stufen || {})
    .map(([feld, s]) => ({ feld, stufe: s?.freigeschaltet || 1, runden: s?.runden || 0, krone: !!s?.krone }))
    .filter((s) => s.runden > 0 || s.stufe > 1 || s.krone);
  return {
    klasse: data.profil.klasse,
    tage,
    stufen,
    fokusRekord: data.lernstand.fokusRekord || 0,
    geschrieben: (data.lernstand.schrift?.reise || []).filter((e) => e.tag >= grenze).length,
    empfehlung: data.lernstand.einstufung?.empfehlung || [],
  };
}
