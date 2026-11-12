# Freigabe-Checkliste: erste fremde Familie onboarden (ab v0.74)

Reihenfolge einhalten – dann gibt es keinen Moment, in dem ein Gerät
ausgesperrt ist. Cloudflare Access bleibt bis Schritt 5 als zweiter Zaun an.

## Stand 12.11.2026 (per Cloudflare-API geprüft, nur lesend)

| Punkt | Befund |
|---|---|
| Worker-Bindings | `ASSETS`, `TRESOR` (KV), Variable `lernprofiapi` – **`SESSION_GEHEIM` fehlt** → Anmelden/Verknüpfen antwortet 503 |
| KV `lernprofi-tresor` | 2 Tresor-Hüllen, 3 Dokumente, 1 KI-Zähler, 2 unbenutzte Einladungs-Codes, **kein `konto:*`** → Stamm-Konto noch nicht verknüpft |
| Access-Anwendung | „lernprofi - Cloudflare Workers“ (Zero Trust → Access → Applications), Sitzung 24 h, Policy **Allow → Everyone** |
| Live-URL | `lernprofi.<subdomain>.workers.dev` leitet auf den Access-Login um; keine eigene Domain am Worker |

⚠️ Die Policy „Everyone“ heißt: Jede Person, die den Access-Login mit
irgendeiner E-Mail-Adresse besteht, bekommt den Header
`Cf-Access-Authenticated-User-Email` – und damit laut `kontoVonAnfrage()`
das **Stamm-Konto** (Einladungs-Codes erzeugen, Tresor-Hüllen lesen und
überschreiben; Inhalte bleiben Chiffrat). Zwei Auswege, einer reicht:
Policy auf eure E-Mail-Adressen einschränken, oder zügig Schritte 1, 3, 4
erledigen und Access abschalten (Schritt 5) – danach kommt der Header nie
mehr an und Stamm gibt es nur über die verknüpfte Sitzung.

Das Setzen von `SESSION_GEHEIM` aus der Entwicklungsumgebung heraus ist
bewusst gesperrt (Secret-Store-Schreibzugriff) – Schritt 1 bleibt ein
Handgriff im Dashboard.

## 1. Einmalige Server-Vorbereitung

- [ ] Sitzungs-Secret `SESSION_GEHEIM` anlegen – einer von zwei Wegen:
  - **Ohne Terminal (empfohlen, wie beim Secret „lernprofiapi"):**
    Cloudflare-Dashboard → Workers & Pages → Worker „lernprofi" →
    Settings → „Variables and Secrets" → Add → Type **Secret**,
    Name `SESSION_GEHEIM`, Value = langer Zufallswert (z. B. aus dem
    Passwort-Generator des Passwort-Managers, 50+ Zeichen) → Deploy/Save.
  - Mit Terminal im Repo: `npx wrangler secret put SESSION_GEHEIM`
    (Wert aus `openssl rand -base64 48`).
  Dank `keep_vars` überlebt das Secret alle Git-Deploys. Danach einmal
  prüfen: Elternbereich → Konto & Daten → Anmelden/Verknüpfen meldet
  nicht mehr „noch nicht eingerichtet".

## 2. Rechtliches (einmalig, Pflicht VOR der ersten fremden Familie)

- [x] Verantwortliche vollständig eingetragen (v0.79.3): MaxClaint GmbH,
  Am Schmelzofen 34, 79183 Waldkirch, vertreten durch Michele Mangieri,
  Kontakt hello@maxclaint.de – Datenschutzerklärung ist damit komplett.
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

- [ ] Im Cloudflare-Dashboard: Zero Trust → Access → Applications →
  „lernprofi - Cloudflare Workers“ → Delete. (Die zweite Anwendung
  „mangierierp - Cloudflare Pages“ gehört zur alten Pages-Seite und kann
  bleiben.) Erst NACH Schritt 3 und 4 – sonst gibt es kein Konto, das
  Einladungs-Codes erzeugen darf.
- [ ] Gegenprobe ohne Anmeldung (z. B. privates Fenster): die Worker-URL
  zeigt direkt die App, `/api/konto` antwortet `{"angemeldet":false}`.
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

## 7. Optional: eigene Domain (nimmt die größte Hürde für Eltern)

- [ ] Domain registrieren (z. B. über Cloudflare Registrar, ~10 €/Jahr) und
  am Worker als Custom Domain eintragen: Workers & Pages → „lernprofi“ →
  Settings → Domains & Routes → Add → Custom Domain.
- [ ] Danach erzeugt „Einladung kopieren“ automatisch Links mit der neuen
  Adresse (die App nutzt `location.origin`).
- [ ] Datenschutzerklärung/Impressum auf die neue Adresse prüfen.

## Rückweg (falls nötig)

Access wieder einschalten sperrt sofort alles hinter den alten Zaun;
Sitzungen und Konten funktionieren dahinter unverändert weiter.
