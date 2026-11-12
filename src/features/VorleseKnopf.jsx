import { Icon } from "./Icon.jsx";
import { vorlesbar, vorlesen } from "../vorlesen.js";

/* 🔊 Lautsprecher-Knopf: liest den Text über die Sprachausgabe des Geräts
   vor. Ohne Sprachausgabe rendert er nichts – nie ein toter Knopf. */
export default function VorleseKnopf({ text, test = "vorlesen", klein = false, label = "Vorlesen" }) {
  if (!vorlesbar() || !text) return null;
  const gr = klein ? 40 : 48;
  return (
    <button data-test={test} aria-label={label} title={label}
      onClick={(e) => { e.stopPropagation(); vorlesen(text); }}
      style={{
        flex: "0 0 auto", width: gr, minWidth: gr, height: gr, minHeight: gr, padding: 0, borderRadius: "50%",
        background: "var(--weich)", color: "var(--see)", display: "inline-flex", alignItems: "center", justifyContent: "center",
      }}>
      <Icon name="speaker" size={klein ? 20 : 24} />
    </button>
  );
}
