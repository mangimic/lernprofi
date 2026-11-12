import { useApp } from "../appContext.jsx";
import { Icon, LeoMark } from "./Icon.jsx";

/* 🎯 Hub „Training" (v0.85): sammelt alle Trainings, die kein eigener
   Navigationspunkt sind, als Kacheln auf EINEM Bildschirm – vorher
   standen sie als acht Knöpfe auf der Startseite. Die data-test-Ids
   der Einstiege (zum-konz, zum-sudoku, …) bleiben erhalten. */
export default function Training() {
  const { data, T, navTo, isMobile } = useApp();
  const einstufung = data.lernstand.einstufung;
  const kacheln = [
    { test: "zum-konz", route: "konz", icon: "target", titel: "Konzentration", text: "Zahlenkette, ABC und Blitzlesen – kurze Runden für den Fokus." },
    { test: "zum-sudoku", route: "sudoku", icon: "puzzle", titel: "Sudoku", text: "Logik lernen Stufe für Stufe, von 4×4 bis 9×9." },
    { test: "zum-schrift", route: "schrift", icon: "pencil", titel: "Schreib-Training", text: "Ein Satz am Tag mit der Hand, Leo schaut auf die Schrift." },
    { test: "zum-aufsatz", route: "aufsatz", icon: "book", titel: "Aufsatz-Check", text: "Foto vom Text, Leo markiert genau eine Stelle." },
    { test: "zum-kasten", route: "kasten", icon: "flag", titel: "Karteikasten", text: "Fünf Karten ziehen – Gewusstes wandert ein Fach weiter." },
    ...(data.doks.length > 0 ? [{ test: "zum-doks", route: "doks", icon: "lock", titel: `Unterlagen (${data.doks.length})`, text: "Eure verschlüsselte Ablage mit Heften und Blättern." }] : []),
  ];
  const kachel = { textAlign: "left", display: "flex", flexDirection: "column", gap: 8, minHeight: 150, padding: 18, borderRadius: 26, background: T.karte, color: T.text, boxShadow: "var(--schatten)" };
  return (
    <div data-test="training-seite">
      <div style={{ marginBottom: T.abstand }}>
        <div style={{ fontSize: "var(--schrift-klein)", fontWeight: 700, color: T.textLeise }}>Training</div>
        <h2 style={{ margin: "2px 0 0", fontSize: "var(--schrift-titel)", lineHeight: 1.1 }}>Dein Trainingsplatz</h2>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2, minmax(0, 1fr))", gap: 14, marginBottom: T.abstand }}>
        {kacheln.map((k) => (
          <button key={k.test} data-test={k.test} onClick={() => navTo(k.route)} style={kachel}>
            <Icon name={k.icon} size={28} weite={2} style={{ color: "var(--see)" }} />
            <div style={{ flex: 1 }} />
            <div style={{ fontSize: "var(--schrift-gross)", fontWeight: 900, lineHeight: 1.1 }}>{k.titel}</div>
            <div style={{ color: T.textLeise, fontSize: "var(--schrift-klein)", fontWeight: 700, lineHeight: 1.35 }}>{k.text}</div>
          </button>
        ))}
      </div>
      <button data-test="training-einstufung" onClick={() => navTo("einstufung")}
        style={{ width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", borderRadius: 22, background: "var(--tinte)", color: "var(--tinte-text)", minHeight: 72 }}>
        <LeoMark size={40} />
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: "block", fontSize: "var(--schrift)", fontWeight: 900 }}>{einstufung ? "Kennenlern-Runde wiederholen" : "Leo lernt dich kennen"}</span>
          <span style={{ display: "block", fontSize: "var(--schrift-klein)", fontWeight: 700, color: "var(--tinte-leise)" }}>
            {einstufung ? `Zuletzt am ${einstufung.tag} – misst, wo du heute stehst.` : "Ein paar Aufgaben aus Deutsch und Mathe – danach stellt sich die App auf dich ein."}
          </span>
        </span>
        <Icon name="arrow" size={22} weite={2.6} style={{ color: "var(--primaer)" }} />
      </button>
    </div>
  );
}
