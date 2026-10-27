# Freigabe-Checkliste: erste fremde Familie onboarden (ab v0.74)

Reihenfolge einhalten – dann gibt es keinen Moment, in dem ein Gerät
ausgesperrt ist. Cloudflare Access bleibt bis Schritt 5 als zweiter Zaun an.

## 1. Einmalige Server-Vorbereitung

- [ ] Sitzungs-Secret anlegen (falls noch nicht geschehen):
  `npx wrangler secret put SESSION_GEHEIM` (langer Zufallswert,
  z. B. `openssl rand -base64 48`). Dank `keep_vars` überlebt es Deploys.

## 2. Rechtliches (einmalig, Pflicht VOR der ersten fremden Familie)

- [ ] Verantwortlichen eintragen: in `src/features/Datenschutz.jsx`
  (Abschnitt „Verantwortlicher") und in `docs/VERARBEITUNGSVERZEICHNIS.md`.
- [ ] Cloudflare-DPA im Dashboard akzeptieren (Auftragsverarbeitung).
- [ ] KI bleibt für fremde Konten gesperrt (Standard) – erst bei
  Freischaltung: Kostendeckel je Konto bauen + Anthropic-DPA prüfen.

## 3. Stamm-Konto verknüpfen (euer Bestand)

- [ ] Elternbereich → Konto & Daten → „Konto anlegen und verknüpfen"
  (E-Mail + euer Eltern-Passwort; es wird vorher lokal am Tresor geprüft).
- [ ] Wiederherstellungs-Code NEU erzeugen (damit er auch am Konto
  hinterlegt ist) und ausdrucken.

## 4. Jedes eurer Geräte anmelden

- [ ] Auf jedem Gerät mit lokalem Tresor: Elternbereich → Konto & Daten →
  „Anmelden" (E-Mail + Eltern-Passwort). Danach trägt die Sitzung das
  Gerät – unabhängig von Access.

## 5. Cloudflare Access abschalten

- [ ] Im Cloudflare-Dashboard (Zero Trust) die Access-Anwendung für die
  Worker-Domain entfernen/deaktivieren.
- [ ] Gegenprobe auf einem eurer Geräte: App lädt, Auto-Sicherung läuft
  (Elternbereich → Geräte-Abgleich „Verbunden"), Leo antwortet.
  Falls ein Gerät 401 meldet: dort einfach im Familien-Konto anmelden.

## 6. Familie einladen

- [ ] Elternbereich → Konto & Daten → „🎟️ Neuen Einladungs-Code erzeugen".
- [ ] Code persönlich weitergeben (gilt für genau eine Registrierung).
- [ ] Die Familie richtet sich selbst ein: App öffnen → Tresor einrichten →
  Einladungs-Code + E-Mail + Einwilligung → fertig. Weitere Geräte der
  Familie: „Wir haben schon ein Familien-Konto → Anmelden".
- [ ] Der Familie empfehlen: Wiederherstellungs-Code sofort erzeugen und
  ausdrucken (Elternbereich → Konto & Daten).

## Rückweg (falls nötig)

Access wieder einschalten sperrt sofort alles hinter den alten Zaun;
Sitzungen und Konten funktionieren dahinter unverändert weiter.
