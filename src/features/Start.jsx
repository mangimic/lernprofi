import { useApp } from "../appContext.jsx";
import { heutigerTag, lernspur } from "../calc/lerntage.js";
import { zeitUebrigMin } from "../calc/elternWerkzeuge.js";
import { EINSTUFUNG_FELDER } from "../calc/einstufung.js";
import { STARK_SAETZE } from "../calc/aufgaben/stark.js";

/* Startseite: Begrüßung, Tages-Stand (Münzen, Missionen, Lernspur),
   Einstieg ins Üben, Konzentrations-Training, Mut-Satz des Tages,
   Hell/Dunkel. Der Elternbereich hat (nach Passwort-Entsperrung)
   seinen eigenen Tab. */
export default function Start() {
  const { data, logChange, T, tresor, navTo, heute, uebenZielSetzen } = useApp();
  const einstufung = data.lernstand.einstufung;
  const feldName = (key) => EINSTUFUNG_FELDER.find((f) => f.key === key) || { emoji: "✏️", name: key };
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
          {data.einstellungen.zeitLimit > 0 ? ` · ⏰ noch ${zeitUebrigMin(data.lernstand.zeit, data.einstellungen.zeitLimit, heute)} Min` : ""}
        </p>
        <button data-test="zum-ueben" onClick={() => navTo("ueben")}
          style={{ width: "100%", background: T.primaer, color: T.primaerText, fontWeight: 700 }}>
          ✏️ Jetzt üben (Deutsch · Mathe · Sachkunde · Stark)
        </button>
        <button data-test="zum-konz" onClick={() => navTo("konz")}
          style={{ width: "100%", marginTop: 8, background: T.weich, color: T.text, fontWeight: 700 }}>
          🧠 Konzentrations-Training (Zahlen · ABC · Blitzlesen)
        </button>
        <button data-test="zum-schrift" onClick={() => navTo("schrift")}
          style={{ width: "100%", marginTop: 8, background: T.weich, color: T.text, fontWeight: 700 }}>
          🖐️ Schreib-Training (1 Satz am Tag, mit der Hand)
        </button>
        <button data-test="zum-aufsatz" onClick={() => navTo("aufsatz")}
          style={{ width: "100%", marginTop: 8, background: T.weich, color: T.text, fontWeight: 700 }}>
          ✍️ Aufsatz-Check (Leo liest dein Foto)
        </button>
        <button data-test="zum-plan" onClick={() => navTo("plan")}
          style={{ width: "100%", marginTop: 8, background: T.weich, color: T.text, fontWeight: 700 }}>
          🗓️ Mein Wochenplan (DU bestimmst dein Pensum)
        </button>
      </div>
      {!einstufung ? (
        <div style={{ background: T.karte, borderRadius: T.radius, padding: T.abstand, marginBottom: T.abstand }}>
          <b>🧪 Einstufungstest</b>
          <p style={{ margin: "4px 0 10px", color: T.textLeise, fontSize: "var(--schrift-klein)" }}>
            Finde deinen Start: ein paar Aufgaben aus Deutsch und Mathe – danach stellt
            die App die Stufen genau auf dich ein und baut deinen Trainingsplan.
          </p>
          <button data-test="einstufung-start" onClick={() => navTo("einstufung")}
            style={{ width: "100%", background: T.weich, color: T.text, fontWeight: 700 }}>
            🧪 Einstufungstest machen
          </button>
        </div>
      ) : (
        <div data-test="trainingsplan" style={{ background: T.karte, borderRadius: T.radius, padding: T.abstand, marginBottom: T.abstand }}>
          <b>🎯 Dein Trainingsplan</b>
          <p style={{ margin: "4px 0 10px", color: T.textLeise, fontSize: "var(--schrift-klein)" }}>
            Aus deinem Einstufungstest vom {einstufung.tag} – übe am besten zuerst hier:
          </p>
          {einstufung.empfehlung.length ? einstufung.empfehlung.map((key) => (
            <button key={key} data-test="plan-feld" data-key={key}
              onClick={() => { uebenZielSetzen(key); navTo("ueben"); }}
              style={{ width: "100%", marginBottom: 8, background: T.weich, color: T.text, fontWeight: 700, textAlign: "left", padding: "0 14px" }}>
              {feldName(key).emoji} {feldName(key).name} üben
            </button>
          )) : (
            <p style={{ margin: 0 }}>🌟 Alles auf Profi-Stufe – stark! Übe frei, worauf du Lust hast.</p>
          )}
          <button data-test="einstufung-nochmal" onClick={() => navTo("einstufung")}
            style={{ background: "transparent", color: T.textLeise, fontSize: "var(--schrift-klein)" }}>
            🧪 Einstufungstest wiederholen
          </button>
        </div>
      )}
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
