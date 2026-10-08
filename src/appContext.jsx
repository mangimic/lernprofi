import { createContext, useContext, useMemo, useRef, useState, useEffect } from "react";
import { migrateData } from "./calc/migrateData.js";
import { zeitHeute } from "./calc/elternWerkzeuge.js";
import { FOKUS_PAUSEN, fokusSerieWeiter } from "./calc/tagesform.js";
import { importAltdaten, istAltExport } from "./calc/importAltdaten.js";
import { idbStorage } from "./idbShim.js";
import {
  tresorVorhanden, tresorAnlegen, entsperrenMitPasswort, entsperrenMitPin,
  pinAendern, datenSpeichern, datenLaden, MAX_PIN_VERSUCHE,
} from "./vault.js";

/* ============================================================
   App-Kontext: jede Ansicht holt sich ALLES über useApp().
   - data / update(nd): das eine Datendokument
   - logChange(nd, bereich, art, text): Änderung + Protokoll + Rückgängig
   - T: Design-Tokens als var()-Verweise (keine Hex-Werte in Komponenten)
   - heute: ISO-Datum "JJJJ-MM-TT" (einmal pro Sitzung bestimmt)
   - navTo / route, isMobile
   - Tresor: tresorStatus ("laden" | "neu" | "gesperrt" | "offen"),
     elternModus, anlegen/entsperren/sperren, Export/Import, PIN ändern.
   Das Dokument liegt NUR verschlüsselt in IndexedDB (vault.js);
   der einfache unverschlüsselte Browser-Speicher wird bewusst
   nicht für Daten benutzt.
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
  const [tresorStatus, setTresorStatus] = useState("laden");
  const [elternModus, setElternModus] = useState(false);
  const master = useRef(null);
  const vorher = useRef(null); // letzter Stand für „Rückgängig"
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(max-width: 640px)").matches,
  );

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const auf = (e) => setIsMobile(e.matches);
    mq.addEventListener("change", auf);
    return () => mq.removeEventListener("change", auf);
  }, []);

  // Beim Start: Gibt es schon einen Tresor auf diesem Gerät?
  useEffect(() => {
    tresorVorhanden(idbStorage)
      .then((ja) => setTresorStatus(ja ? "gesperrt" : "neu"))
      .catch(() => setTresorStatus("neu"));
  }, []);

  // ⏰ Lernzeit (Time-Boxing) + 🤸 Fokuszeit bis zur Bewegungspause:
  // alle 5 s, nur bei offenem Tresor und sichtbarer App. Während einer
  // Bewegungspause zählt NICHTS (Pausenzeit ist keine Lernzeit).
  // __ZEIT_SCHNELL__ ist der Test-Zeitraffer.
  const LERN_ROUTEN = ["ueben", "spiele", "konz"];
  const [fokusPause, setFokusPause] = useState(null); // null | { idee }
  const fokusPauseRef = useRef(null);
  fokusPauseRef.current = fokusPause;
  const fokusSek = useRef(0);
  const fokusSerie = useRef({ serie: 0, letzte: 0 });
  const routeRef = useRef(route);
  routeRef.current = route;
  const zaehlRef = useRef(null);
  const zaehlDataRef = useRef(data);
  zaehlDataRef.current = data;
  useEffect(() => {
    if (tresorStatus !== "offen") return;
    const schnell = typeof window !== "undefined" && window.__ZEIT_SCHNELL__;
    const schritt = schnell ? 300 : 5;
    const takt = schnell ? 400 : 5000;
    zaehlRef.current = setInterval(() => {
      if (document.visibilityState === "hidden") return;
      if (fokusPauseRef.current) return; // Bewegungspause: nichts zählt
      const d = zaehlDataRef.current;
      if (d.einstellungen.zeitLimit > 0) {
        const z = zeitHeute(d.lernstand.zeit, heute);
        update({ ...d, lernstand: { ...d.lernstand, zeit: { tag: z.tag, sek: z.sek + schritt } } });
      }
      // Fokuszeit läuft nur beim Lernen (Üben, Spiele, Konzentration)
      if (LERN_ROUTEN.includes(routeRef.current) && d.einstellungen.pausenAktiv !== false) {
        fokusSek.current += schritt;
        if (fokusSek.current >= (d.einstellungen.pausenIntervall || 10) * 60) {
          setFokusPause({ idee: FOKUS_PAUSEN[Math.floor(Math.random() * FOKUS_PAUSEN.length)] });
        }
      }
    }, takt);
    return () => clearInterval(zaehlRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tresorStatus]);

  // 🔥 Fokus-Serie: jede gelöste Aufgabe zählt; < 90 s Abstand lässt
  // die Serie wachsen, der Rekord wandert in den Tresor.
  const fokusZaehlen = () => {
    const jetzt = Date.now();
    const serie = fokusSerieWeiter(fokusSerie.current.serie, fokusSerie.current.letzte, jetzt);
    fokusSerie.current = { serie, letzte: jetzt };
    const d = zaehlDataRef.current;
    if (serie > (d.lernstand.fokusRekord || 0)) {
      const nd = { ...d, lernstand: { ...d.lernstand, fokusRekord: serie } };
      zaehlDataRef.current = nd;
      update(nd);
    }
    return serie;
  };
  const fokus = {
    pause: fokusPause,
    zaehlen: fokusZaehlen,
    serie: () => fokusSerie.current.serie,
    pauseFertig: () => { fokusSek.current = 0; setFokusPause(null); },
    pauseSpaeter: () => {
      const d = zaehlDataRef.current;
      fokusSek.current = Math.max(0, (d.einstellungen.pausenIntervall || 10) * 60 - 120);
      setFokusPause(null);
    },
  };

  // Hell/Dunkel über data-theme am <html>
  useEffect(() => {
    document.documentElement.dataset.theme =
      data.einstellungen.thema === "dunkel" ? "dark" : "";
  }, [data.einstellungen.thema]);

  const speichern = (dokument) => {
    if (!master.current) return;
    datenSpeichern(master.current, dokument, idbStorage).catch(() => {
      /* Speichern schlug fehl – die Daten bleiben im Arbeitsspeicher;
         der nächste erfolgreiche Schreibvorgang holt alles nach. */
    });
  };

  const update = (nd) => {
    const sauber = migrateData(nd, heute);
    setData(sauber);
    speichern(sauber);
  };

  const logChange = (nd, bereich, art, text) => {
    vorher.current = data;
    const eintrag = { zeit: new Date().toISOString(), bereich, art, text };
    update({ ...nd, protokoll: [eintrag, ...(nd.protokoll || [])].slice(0, 200) });
  };

  const rueckgaengig = () => {
    if (vorher.current) { update(vorher.current); vorher.current = null; return true; }
    return false;
  };

  const nachEntsperren = async (schluessel, eltern) => {
    master.current = schluessel;
    const geladen = await datenLaden(schluessel, idbStorage);
    const sauber = migrateData(geladen, heute);
    setData(sauber);
    if (!geladen) speichern(sauber); // Erstbefüllung direkt ablegen
    setElternModus(eltern);
    setTresorStatus("offen");
  };

  const tresor = {
    status: tresorStatus,
    elternModus,
    maxPinVersuche: MAX_PIN_VERSUCHE,
    anlegen: async (elternPasswort, kindPin) => {
      const schluessel = await tresorAnlegen({ elternPasswort, kindPin }, idbStorage);
      await nachEntsperren(schluessel, true);
    },
    entsperrenPin: async (pin) => {
      const schluessel = await entsperrenMitPin(pin, idbStorage);
      await nachEntsperren(schluessel, false);
    },
    entsperrenPasswort: async (passwort) => {
      const schluessel = await entsperrenMitPasswort(passwort, idbStorage);
      await nachEntsperren(schluessel, true);
    },
    sperren: () => {
      master.current = null;
      vorher.current = null;
      setElternModus(false);
      setData(migrateData(null, heute));
      setTresorStatus("gesperrt");
      setRoute("start");
    },
    pinAendern: (elternPasswort, neuePin) => pinAendern(elternPasswort, neuePin, idbStorage),
    exportJson: () =>
      JSON.stringify({ app: "lernprofi", exportiert: new Date().toISOString(), daten: data }, null, 2),
    importJson: (text) => {
      const roh = JSON.parse(text);
      // Alt-App-Export? → über den geprüften Übernahme-Konverter, mit Bericht.
      if (istAltExport(roh)) {
        const { dokument, bericht } = importAltdaten(roh, heute);
        logChange(dokument, "daten", "geaendert", "Lernstand aus der Alt-App übernommen");
        return bericht;
      }
      const dokument = roh && typeof roh === "object" && "daten" in roh ? roh.daten : roh;
      logChange(migrateData(dokument, heute), "daten", "geaendert", "Lernstand aus Datei übernommen");
      return [{ feld: "Backup", status: "übernommen", detail: "Neubau-Backup eingespielt" }];
    },
  };

  const wert = { data, update, logChange, rueckgaengig, T, heute, route, navTo: setRoute, isMobile, tresor, fokus };
  return <AppContext.Provider value={wert}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp() nur innerhalb von <AppProvider> verwenden");
  return ctx;
}
