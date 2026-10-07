import { useApp } from "../appContext.jsx";
import { heutigerTag, lernspur } from "../calc/lerntage.js";
import { STARK_SAETZE } from "../calc/aufgaben/stark.js";

/* Startseite: Begrüßung, Tages-Stand (Münzen, Missionen, Lernspur),
   Einstieg ins Üben, Konzentrations-Training, Mut-Satz des Tages,
   Hell/Dunkel. Der Elternbereich hat (nach Passwort-Entsperrung)
   seinen eigenen Tab. */
export default function Start() {
  const { data, logChange, T, tresor, navTo, heute } = useApp();
  const dunkel = data.einstellungen.thema === "dunkel";
  const tag = heutigerTag(data.lernstand.lerntage, heute);
  const spur = lernspur(data.lernstand.lerntage, heute);
  const mut = data.lernstand.mutSatz;
  const mutHeute = mut.tag === heute;

  const mutWaehlen = (idx) => {
    logChange(
      { ...data, lernstand: { ...data.lernstand, mutSatz: { tag: heute, idx } } },
      "stark", "neu", "Mut-Satz des Tages gewählt",
    );
  };

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
          ✏️ Jetzt üben (Deutsch · Mathe · Sachkunde · Stark)
        </button>
        <button data-test="zum-konz" onClick={() => navTo("konz")}
          style={{ width: "100%", marginTop: 8, background: T.weich, color: T.text, fontWeight: 700 }}>
          🧠 Konzentrations-Training (Zahlen · ABC · Blitzlesen)
        </button>
      </div>
      <div style={{ background: T.karte, borderRadius: T.radius, padding: T.abstand, marginBottom: T.abstand }}>
        <b>🦁 Mut-Satz des Tages</b>
        {mutHeute ? (
          <>
            <p data-test="mut-satz-heute" style={{ margin: "8px 0 4px", fontWeight: 800, fontSize: "var(--schrift-gross)" }}>
              „{STARK_SAETZE[mut.idx]}“
            </p>
            <p style={{ margin: 0, color: T.textLeise, fontSize: "var(--schrift-klein)" }}>
              🦁 Starker Satz! Er gehört heute dir. Morgen darfst du einen neuen wählen.
            </p>
          </>
        ) : (
          <>
            <p style={{ margin: "4px 0 10px", color: T.textLeise, fontSize: "var(--schrift-klein)" }}>
              Such dir einen Satz aus, der dich heute stark macht – sprich ihn einmal laut!
            </p>
            <div style={{ display: "grid", gap: 6 }}>
              {STARK_SAETZE.map((satz, i) => (
                <button key={i} data-test="mut-satz-wahl" onClick={() => mutWaehlen(i)}
                  style={{ textAlign: "left", background: T.weich, color: T.text }}>
                  {satz}
                </button>
              ))}
            </div>
          </>
        )}
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
      {tresor.elternModus && (
        <button data-test="zum-eltern" onClick={() => navTo("eltern")}
          style={{ width: "100%", marginTop: T.abstand, background: T.weich, color: T.text, fontWeight: 700 }}>
          🔧 Zum Elternbereich
        </button>
      )}
    </div>
  );
}
