import { useApp } from "../appContext.jsx";

/* 📄 Datenschutzerklärung – erreichbar VOR der Anmeldung (VaultGate)
   und im Elternbereich. Sachlich, ohne Fachchinesisch; Verantwortliche
   ist die MaxClaint GmbH – Anschrift und Kontakt-E-Mail werden vor der
   Freigabe an weitere Familien ergänzt (keine Privat-Namen im Code). */

const ABSCHNITTE = [
  ["🏠 Verantwortlicher", "Verantwortlich für diese App („Leos Welten“) ist die MaxClaint GmbH, vertreten durch Michele Mangieri. Fragen zum Datenschutz: hello@maxclaint.de. Anschrift: [vor der Freigabe an weitere Familien hier eintragen]."],
  ["🔐 Das Wichtigste zuerst: Zero-Knowledge", "Alle Lerninhalte (Profil, Lernstand, Pläne, Dokumente) werden auf eurem Gerät ver- und entschlüsselt. Auf unseren Server gelangen ausschließlich verschlüsselte Pakete – wir können sie technisch nicht lesen, denn den Schlüssel erzeugt euer Eltern-Passwort nur auf dem Gerät und er verlässt es nie."],
  ["👪 Konto-Daten", "Für das Familien-Konto speichern wir: die E-Mail-Adresse (als Anmeldename und Kontaktweg), einen Prüf-Hash des Anmelde-Beweises (nie das Passwort – auch nicht verschlüsselt) und technische Angaben (Erstellungszeit). Die Anmeldung je Gerät läuft über ein technisch notwendiges Sitzungs-Cookie (30 Tage, nur für diese App, kein Tracking)."],
  ["📦 Gespeicherte Inhalte", "Der Tresor (ein verschlüsseltes Datenpaket) und hochgeladene Dokumente (je ein verschlüsseltes Paket) liegen bei unserem Hosting-Dienstleister. Inhalte, Dateinamen und Kategorien stehen nur im verschlüsselten Teil."],
  ["🤖 KI-Hilfe (nur mit Einwilligung)", "Die KI-Funktionen sind standardmäßig AUS und werden je Zweck von den Eltern freigeschaltet. Ist eine Funktion an, geht NUR die konkrete Aufgabe bzw. das konkrete Foto an den KI-Dienst (Anthropic) – nie der Name, nie das Lernprofil, nie der Tresor. Ohne Freischaltung verlässt nichts die App."],
  ["🏗️ Auftragsverarbeiter", "Hosting und Speicher: Cloudflare, Inc. (Worker + KV-Speicher, Auftragsverarbeitungsvertrag). KI-Dienst (nur bei aktivierter KI-Funktion): Anthropic. Weitere Dienste, Werbung oder Tracking gibt es nicht."],
  ["⏳ Speicherdauer und Löschen", "Daten bleiben gespeichert, bis ihr sie löscht. Das Löschen des Familien-Kontos (Elternbereich → Konto & Daten) entfernt Konto, Tresor-Pakete und alle Dokumente endgültig und sofort vom Server. Lokale Daten auf euren Geräten löscht ihr dort selbst."],
  ["🧒 Kinder", "Konten legen ausschließlich Erziehungsberechtigte an und verwalten sie. Das Kind nutzt die App mit einer Lern-PIN auf einem von den Eltern eingerichteten Gerät."],
  ["⚖️ Eure Rechte", "Ihr habt das Recht auf Auskunft, Berichtigung, Löschung und Datenübertragbarkeit. Praktisch eingebaut: Der Backup-Export (Elternbereich) gibt euch jederzeit alle Daten als Datei; der Lösch-Knopf entfernt alles vom Server. Außerdem besteht ein Beschwerderecht bei einer Datenschutz-Aufsichtsbehörde."],
];

export default function Datenschutz({ zurueck }) {
  const { T } = useApp();
  return (
    <div data-test="datenschutz-seite" style={{ maxWidth: 640, margin: "0 auto", padding: "0 16px" }}>
      <h2 style={{ margin: "12px 0" }}>📄 Datenschutzerklärung</h2>
      {ABSCHNITTE.map(([titel, text]) => (
        <div key={titel} style={{ background: T.karte, borderRadius: T.radius, padding: T.abstand, marginBottom: 10 }}>
          <b>{titel}</b>
          <p style={{ margin: "4px 0 0", color: T.textLeise, fontSize: "var(--schrift-klein)" }}>{text}</p>
        </div>
      ))}
      <button data-test="datenschutz-zurueck" onClick={zurueck}
        style={{ width: "100%", background: T.weich, color: T.text, fontWeight: 700, marginBottom: 16 }}>
        ← Zurück
      </button>
    </div>
  );
}
