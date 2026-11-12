/* ============================================================
   🧩 Module (v0.86) – REINE Fachlogik.
   Der Lern-App-Kern (Üben, Spiele, Training, Eltern) ist immer da.
   Drei Module kommen nur dazu, wenn das Dokument sie freigeschaltet
   hat (einstellungen.module): Plan (Wochenplan, Kompass-Fahrplan,
   Termine, Unterlagen), Leo-KI (Erklären, Bericht, Sätze, Aufsatz)
   und das Schreib-Training. Bestandsdokumente behalten alles
   (siehe migrateData), neue Familien starten im Kern.
   ============================================================ */
export const MODUL_NAMEN = { plan: "Plan", ki: "Leo", schrift: "Schreib-Training" };

/** Welche Route gehört zu welchem Modul? (alles andere ist Kern) */
const ROUTEN_MODUL = { plan: "plan", kompass: "plan", doks: "plan", schrift: "schrift", aufsatz: "ki" };

export function modulAn(data, name) {
  return data?.einstellungen?.module?.[name] === true;
}

/** Darf diese Route gezeigt werden? Gesperrte Routen fallen auf Start zurück. */
export function routeErlaubt(route, data) {
  const modul = ROUTEN_MODUL[route];
  return !modul || modulAn(data, modul);
}

/** Kurztext für den Elternbereich: was ist freigeschaltet? */
export function modulInfo(data) {
  const an = Object.keys(MODUL_NAMEN).filter((m) => modulAn(data, m)).map((m) => MODUL_NAMEN[m]);
  return an.length ? `Freigeschaltet: ${an.join(" · ")}` : "Lern-App-Kern (ohne Plan, Leo und Schreib-Training)";
}
