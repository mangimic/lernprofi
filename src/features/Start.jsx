import { useApp } from "../appContext.jsx";

/* Startseite (Platzhalter der Etappe 1): begrüßt das Kind, zeigt den
   Stand des Dokuments und den Hell/Dunkel-Schalter – als Beweis, dass
   Kontext, Tokens und logChange zusammenspielen. Die echten Lernfelder
   ziehen in Etappe 3/4 ein. */
export default function Start() {
  const { data, logChange, T } = useApp();
  const dunkel = data.einstellungen.thema === "dunkel";

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
        <p style={{ margin: 0, color: T.textLeise }}>
          Hier entsteht die neue Lernprofi-App für die 4. Klasse. Deine Übungen,
          Münzen und Stufen ziehen Etappe für Etappe hier ein – bis dahin lernst
          du in der bisherigen App weiter.
        </p>
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
    </div>
  );
}
