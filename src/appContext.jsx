import { createContext, useContext, useMemo, useRef, useState, useEffect } from "react";
import { migrateData } from "./calc/migrateData.js";
import { zeitHeute } from "./calc/elternWerkzeuge.js";
import { FOKUS_PAUSEN, fokusSerieWeiter } from "./calc/tagesform.js";
import { importAltdaten, istAltExport } from "./calc/importAltdaten.js";
import { idbStorage } from "./idbShim.js";
import { syncStatus, hochladen, herunterladen, DIRTY_SCHLUESSEL } from "./sync.js";
import {
  tresorVorhanden, tresorAnlegen, entsperrenMitPasswort, entsperrenMitPin,
  pinAendern, datenSpeichern, datenLaden, MAX_PIN_VERSUCHE,
} from "./vault.js";

/* ☁️ Auto-Sicherung: Jede Änderung wird kurz gesammelt (2,5 s Ruhe)
   und dann im Hintergrund verschlüsselt zum Server geschoben – ohne
   Knopf, ohne Nachfrage, near-realtime. Konflikte werden NIE still
   überschrieben, sondern im Elternbereich gemeldet. „sync.dirty" im
   Gerätespeicher merkt sich, ob lokal Ungesichertes liegt – nur dann
   verzichtet die Anmeldung aufs automatische Abholen des Server-Stands. */
const AUTOSYNC_RUHE_MS = 2500;
const AUTOSYNC_NEUVERSUCH_MS = 60000;

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
  const [route, setRouteRoh] = useState("start");
  // 🧭 Herkunft merken: Wer von einer Seite in eine andere springt (z. B.
  // Kompass → Übung), kommt mit navZurueck wieder dort an – nicht auf Start.
  const herkunftRef = useRef([]);
  const setRoute = (r) => {
    setRouteRoh((alt) => {
      if (r !== alt) herkunftRef.current = [...herkunftRef.current.slice(-9), alt];
      return r;
    });
  };
  const navZurueck = () => {
    const h = herkunftRef.current;
    const ziel = h.length ? h[h.length - 1] : "start";
    herkunftRef.current = h.slice(0, -1);
    setRouteRoh(ziel);
  };
  const [uebenZiel, setUebenZiel] = useState(null); // Lernfeld-Key: Üben startet direkt dort (Trainingsplan)
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

  // ☁️ Auto-Sicherung (Status für die Eltern-Karte; Kind sieht nichts davon)
  const [autoSync, setAutoSync] = useState({ stand: "aus" }); // aus | wartet | laedt | ok | konflikt | offline
  const syncTimer = useRef(null);
  const syncMoeglich = useRef(null); // null = ungeprüft, sonst true/false

  const autoHochladen = async () => {
    if (!master.current) return;
    if (syncMoeglich.current === null) {
      const s = await syncStatus();
      syncMoeglich.current = !!s.verfuegbar || s.grund === "offline"; // offline: später nochmal
      if (!syncMoeglich.current) { setAutoSync({ stand: "aus", grund: s.grund }); return; }
    }
    if (syncMoeglich.current === false) return;
    setAutoSync((a) => ({ ...a, stand: "laedt" }));
    const e = await hochladen(idbStorage);
    if (e.ok) {
      setAutoSync({ stand: "ok", rev: e.rev, zeit: new Date().toISOString() });
    } else if (e.grund === "konflikt") {
      setAutoSync({ stand: "konflikt", serverRev: e.serverRev });
    } else {
      // offline/Fehler: leise bleiben und in einer Minute erneut versuchen
      setAutoSync((a) => ({ ...a, stand: "offline" }));
      clearTimeout(syncTimer.current);
      syncTimer.current = setTimeout(autoHochladen, AUTOSYNC_NEUVERSUCH_MS);
    }
  };
  const autoSyncAnstossen = () => {
    idbStorage.set(DIRTY_SCHLUESSEL, true).catch(() => {});
    setAutoSync((a) => (a.stand === "konflikt" ? a : { ...a, stand: "wartet" }));
    clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(autoHochladen, AUTOSYNC_RUHE_MS);
  };
  useEffect(() => () => clearTimeout(syncTimer.current), []);

  const speichern = (dokument) => {
    if (!master.current) return;
    datenSpeichern(master.current, dokument, idbStorage)
      .then(autoSyncAnstossen)
      .catch(() => {
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
    let geladen = await datenLaden(schluessel, idbStorage);

    // ☁️ Auto-Abholen: Liegt auf dem Server ein NEUERER Stand (anderes
    // Gerät) und ist lokal nichts Ungesichertes offen, wird er beim
    // Anmelden automatisch übernommen. Bei lokalen offenen Änderungen
    // entscheiden die Eltern wie bisher (Konflikt-Karte).
    try {
      const dirty = await idbStorage.get(DIRTY_SCHLUESSEL);
      const lokalRev = (await idbStorage.get("sync.rev")) ?? 0;
      const s = await syncStatus();
      syncMoeglich.current = !!s.verfuegbar;
      if (s.verfuegbar && s.rev > lokalRev && !dirty) {
        const alteMeta = await idbStorage.get("tresor.meta");
        const alteDaten = await idbStorage.get("tresor.daten");
        const holen = await herunterladen(idbStorage);
        if (holen.ok) {
          try {
            geladen = await datenLaden(schluessel, idbStorage);
            setAutoSync({ stand: "ok", rev: holen.rev, zeit: new Date().toISOString(), geholt: true });
          } catch {
            // Server-Stand passt nicht zu diesem Schlüssel → lokalen Stand zurücklegen
            await idbStorage.set("tresor.meta", alteMeta);
            await idbStorage.set("tresor.daten", alteDaten);
            await idbStorage.set("sync.rev", lokalRev);
            geladen = await datenLaden(schluessel, idbStorage);
          }
        }
      }
    } catch { /* ohne Netz einfach lokal weiterarbeiten */ }

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

  const wert = {
    data, update, logChange, rueckgaengig, T, heute, route, navTo: setRoute, isMobile, tresor, fokus,
    uebenZiel, uebenZielSetzen: setUebenZiel, autoSync, navZurueck,
  };
  return <AppContext.Provider value={wert}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp() nur innerhalb von <AppProvider> verwenden");
  return ctx;
}
