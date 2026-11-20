import { useEffect, useSyncExternalStore } from "react";
import { Icon } from "./Icon.jsx";
import {
  vorlesbar, vorleseAbo, vorleseStand, vorleseLaeuft, vorleseStelle,
  vorlesenWeiter, vorlesenVonVorn, vorlesePause,
} from "../vorlesen.js";

/* 🔊 Vorlese-Knopf mit Start und Stopp: Antippen startet, nochmal Antippen
   stoppt. Die App merkt sich den Satz, bei dem gestoppt wurde – der nächste
   Start liest dort weiter; „Von vorn" beginnt neu. Ohne Sprachausgabe
   rendert er nichts – nie ein toter Knopf. */
export default function VorleseKnopf({ text, test = "vorlesen", klein = false, label = "Vorlesen" }) {
  useSyncExternalStore(vorleseAbo, vorleseStand, vorleseStand);
  // Verschwindet der Knopf mitten im Vorlesen (Seitenwechsel): anhalten, Stelle merken
  useEffect(() => () => { if (vorleseLaeuft(text)) vorlesePause(); }, [text]);
  if (!vorlesbar() || !text) return null;
  const laeuft = vorleseLaeuft(text);
  const stelle = laeuft ? 0 : vorleseStelle(text);
  const zustand = laeuft ? "laeuft" : stelle > 0 ? "pause" : "start";
  const titel = laeuft ? "Vorlesen stoppen" : stelle > 0 ? "Weiter vorlesen" : label;
  const gr = klein ? 40 : 48;
  const rund = {
    flex: "0 0 auto", width: gr, minWidth: gr, height: gr, minHeight: gr, padding: 0, borderRadius: "50%",
    display: "inline-flex", alignItems: "center", justifyContent: "center",
  };
  return (
    <span style={{ flex: "0 0 auto", display: "inline-flex", alignItems: "center", gap: 6 }}>
      {zustand === "pause" && (
        <button data-test={`${test}-vonvorn`} aria-label="Von vorn vorlesen" title="Von vorn vorlesen"
          onClick={(e) => { e.stopPropagation(); vorlesenVonVorn(text); }}
          style={{ ...rund, background: "var(--weich)", color: "var(--see)" }}>
          <Icon name="restart" size={klein ? 20 : 24} />
        </button>
      )}
      <button data-test={test} data-zustand={zustand} aria-label={titel} title={titel} aria-pressed={laeuft}
        onClick={(e) => { e.stopPropagation(); if (laeuft) vorlesePause(); else vorlesenWeiter(text); }}
        style={{ ...rund, background: laeuft ? "var(--see)" : "var(--weich)", color: laeuft ? "var(--karte)" : "var(--see)" }}>
        <Icon name={laeuft ? "stop" : stelle > 0 ? "play" : "speaker"} size={klein ? 20 : 24} />
      </button>
    </span>
  );
}
