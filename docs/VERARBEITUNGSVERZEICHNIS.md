# Verzeichnis von Verarbeitungstätigkeiten (Art. 30 DSGVO) – Leos Welten (ehemals Lernprofi)

Internes Dokument des Betreibers. Stand: v0.79.3 – Verantwortliche
vollständig benannt (auch in der Datenschutzerklärung,
src/features/Datenschutz.jsx).

## 1. Verantwortlicher

MaxClaint GmbH, Am Schmelzofen 34, 79183 Waldkirch · vertreten durch Michele Mangieri · hello@maxclaint.de

## 2. Verarbeitungstätigkeiten

### 2.1 Familien-Konten (Anmeldung)

| Punkt | Inhalt |
|---|---|
| Zweck | Anmeldung der Eltern, Zuordnung des verschlüsselten Tresors je Familie |
| Betroffene | Erziehungsberechtigte |
| Datenkategorien | E-Mail-Adresse; SHA-256-Hash des Anmelde-Beweises (nie das Passwort); Hash des Wiederherstellungs-Beweises; Erstellungszeit |
| Rechtsgrundlage | Art. 6 Abs. 1 b DSGVO (Nutzungsverhältnis), Einwilligungs-Bestätigung bei Registrierung |
| Speicherort | Cloudflare KV (`konto:*`, `email:*`) |
| Löschung | Sofort und vollständig über „Konto löschen" (Elternbereich) – `/api/konto/loeschen` |
| Empfänger | Cloudflare, Inc. (Auftragsverarbeiter, DPA im Dashboard akzeptieren) |

### 2.2 Tresor-Sync und Dokumente (Zero-Knowledge)

| Punkt | Inhalt |
|---|---|
| Zweck | Geräte-Abgleich und Ablage von Unterlagen |
| Betroffene | Kind und Eltern (Inhalte), für den Server NICHT lesbar |
| Datenkategorien | AES-256-GCM-Chiffrate (Tresor-Meta, Datenpaket, Dokumente) + Revisionsnummer/Zeitstempel. Schlüssel entstehen ausschließlich auf den Geräten (PBKDF2 aus Eltern-Passwort/PIN/Code) |
| Speicherort | Cloudflare KV (`tresor:<kontoId>`, `dok:<kontoId>:<id>`) |
| Löschung | Mit dem Konto; einzelne Dokumente jederzeit in der App |
| Besonderheit | Zero-Knowledge: Eine Datenpanne beim Speicher beträfe nur Chiffrate ohne Schlüssel |

### 2.3 KI-Funktionen (nur nach Eltern-Opt-in, je Zweck)

| Punkt | Inhalt |
|---|---|
| Zweck | Erklär-Hilfen, Schrift-/Aufsatz-Rückmeldung, Wochenbericht |
| Datenkategorien | NUR die konkrete Aufgabe bzw. das konkrete Foto – nie Name, Profil oder Tresor |
| Rechtsgrundlage | Einwilligung (Schalter je Zweck im Elternbereich, Standard AUS) |
| Empfänger | Anthropic (API); derzeit nur für das Stamm-Konto freigeschaltet |
| Nebenspeicher | Kostenzähler je Monat in KV (keine Inhalte) |

### 2.4 Sitzungen und Schutzmaßnahmen

| Punkt | Inhalt |
|---|---|
| Sitzungs-Cookie | HMAC-signiert, HttpOnly, Secure, SameSite=Strict, 30 Tage – technisch notwendig, kein Tracking |
| Login-Drossel | Zähler je E-Mail (TTL 1 h) gegen Durchprobieren |
| Kein Tracking | Keine Analyse-Dienste, keine Werbung, keine Fremd-CDNs (CSP erzwingt 'self') |

## 3. Technische und organisatorische Maßnahmen (Auszug)

- Clientseitige AES-256-GCM-Verschlüsselung, PBKDF2 310 000 Iterationen
- Server speichert nur Hashes der Anmelde-Beweise (Bitwarden-Muster)
- Transport ausschließlich TLS (Cloudflare)
- Regressions- und Smoke-Tests prüfen bei jedem Release, dass weder
  Passwort noch Klartext das Gerät verlassen

## 4. Offene Pflichten vor Freigabe an weitere Familien

- [ ] Verantwortlichen hier und in der Datenschutzerklärung eintragen
- [ ] Cloudflare-DPA im Dashboard akzeptieren
- [ ] Bei KI-Freischaltung für fremde Konten: Anthropic-DPA prüfen
