import { useApp } from "../appContext.jsx";
import ElternKarte from "./Eltern.jsx";
import { heutigerTag, lernspur } from "../calc/lerntage.js";

/* Startseite: Begrüßung, Tages-Stand (Münzen, Missionen, Lernspur),
   Einstieg ins Üben, Hell/Dunkel – und nach Eltern-Entsperrung der
   Elternbereich. */
export default function Start() {
  const { data, logChange, T, tresor, navTo, heute } = useApp();
  const dunkel = data.einstellungen.thema === "dunkel";
  const tag = heutigerTag(data.lernstand.lerntage, heute);
  const spur = lernspur(data.lernstand.lerntage, heute);

  const themaWechseln = () => {
    const neu = {
      ...data,
      einstellungen: { ...data.einstellungen, thema: dunkel ? "hell" : "dunkel" },
    };
    logChange(neu, "einstellungen", "geaendert", `Darstellung auf ${dunkel ? "Hell" : "Dunkel"} gestellt`);
  };

  return (
    <div data-test="start-seite">
      <div style={{ background: T.karte, borderRadius: T.radius, padding: T.abstand, marginBottom: T.abstand }}>
        <h2 style={{ margin: "0 0 6px" }}>Hallo! 👋</h2>
        <p data-test="tages-stand" style={{ margin: "0 0 10px", color: T.textLeise }}>
          🪙 {data.lernstand.muenzen} Münze{data.lernstand.muenzen === 1 ? "" : "n"} ·
          heute {tag.missionen} Mini-Mission{tag.missionen === 1 ? "" : "en"}
          {tag.zielErreicht ? " · 🎯 Tagesziel geschafft!" : ""}
          {spur > 1 ? ` · 🛤️ ${spur} Tage Lernspur` : ""}
        </p>
        <button data-test="zum-ueben" onClick={() => navTo("ueben")}
          style={{ width: "100%", background: T.primaer, color: T.primaerText, fontWeight: 700 }}>
          ✏️ Jetzt üben (Mathe & Sachkunde)
        </button>
      </div>
      <div style={{ background: T.karte, borderRadius: T.radius, padding: T.abstand }}>
        <b>Darstellung</b>
        <p style={{ margin: "4px 0 10px", color: T.textLeise, fontSize: "var(--schrift-klein)" }}>
          Hell oder Dunkel – wie du magst.
        </p>
        <button
          data-test="thema-schalter"
          onClick={themaWechseln}
          style={{ width: "100%", background: T.weich, color: T.text, fontWeight: 700 }}
        >
          {dunkel ? "☀️ Hell einschalten" : "🌙 Dunkel einschalten"}
        </button>
      </div>
      {tresor.elternModus && <ElternKarte />}
    </div>
  );
}
