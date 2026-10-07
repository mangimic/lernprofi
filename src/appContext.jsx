import { createContext, useContext, useMemo, useRef, useState, useEffect } from "react";
import { migrateData } from "./calc/migrateData.js";

/* ============================================================
   App-Kontext: jede Ansicht holt sich ALLES über useApp().
   - data / update(nd): das eine Datendokument
   - logChange(nd, bereich, art, text): Änderung + Protokoll + Rückgängig
   - T: Design-Tokens als var()-Verweise (keine Hex-Werte in Komponenten)
   - heute: ISO-Datum "JJJJ-MM-TT" (einmal pro Sitzung bestimmt)
   - navTo / route: einfache Navigation
   - isMobile: schmaler Bildschirm (iPhone)
   In Etappe 2 wird der Speicher durch den Tresor (IndexedDB,
   verschlüsselt) ersetzt – die Schnittstelle bleibt gleich.
   ============================================================ */

export const T = {
  grund: "var(--grund)",
  karte: "var(--karte)",
  text: "var(--text)",
  textLeise: "var(--text-leise)",
  primaer: "var(--primaer)",
  primaerText: "var(--primaer-text)",
  weich: "var(--weich)",
  akzent: "var(--akzent)",
  ok: "var(--ok)",
  warn: "var(--warn)",
  rand: "var(--rand)",
  radius: "var(--radius)",
  radiusKlein: "var(--radius-klein)",
  abstand: "var(--abstand)",
};

const AppContext = createContext(null);

export function isoHeute(jetzt = new Date()) {
  const z = (n) => String(n).padStart(2, "0");
  return `${jetzt.getFullYear()}-${z(jetzt.getMonth() + 1)}-${z(jetzt.getDate())}`;
}

export function AppProvider({ children }) {
  const heute = useMemo(() => isoHeute(), []);
  const [data, setData] = useState(() => migrateData(null, heute));
  const [route, setRoute] = useState("start");
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(max-width: 640px)").matches,
  );
  const vorher = useRef(null); // letzter Stand für „Rückgängig"

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const auf = (e) => setIsMobile(e.matches);
    mq.addEventListener("change", auf);
    return () => mq.removeEventListener("change", auf);
  }, []);

  // Hell/Dunkel über data-theme am <html> (Design-Tokens reagieren darauf)
  useEffect(() => {
    document.documentElement.dataset.theme =
      data.einstellungen.thema === "dunkel" ? "dark" : "";
  }, [data.einstellungen.thema]);

  const update = (nd) => setData(migrateData(nd, heute));

  const logChange = (nd, bereich, art, text) => {
    vorher.current = data;
    const eintrag = { zeit: new Date().toISOString(), bereich, art, text };
    update({ ...nd, protokoll: [eintrag, ...(nd.protokoll || [])].slice(0, 200) });
  };

  const rueckgaengig = () => {
    if (vorher.current) { setData(vorher.current); vorher.current = null; return true; }
    return false;
  };

  const wert = { data, update, logChange, rueckgaengig, T, heute, route, navTo: setRoute, isMobile };
  return <AppContext.Provider value={wert}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp() nur innerhalb von <AppProvider> verwenden");
  return ctx;
}
