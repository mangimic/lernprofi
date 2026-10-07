# Deploy & Betrieb auf Cloudflare

Stand: Etappe 6. Das Projekt läuft als **Cloudflare Worker** mit statischen
Assets (`wrangler.jsonc`): Build `npm run build` → `dist/`, Deploy
`npx wrangler deploy` – automatisch bei jedem Push auf `develop`
(Workers Builds, im Dashboard unter Settings → Builds verbunden).

## Live-Version prüfen

`https://<deine-url>/version.json` – niemals gecacht, zeigt Version,
Datum und Git-Stand des laufenden Deployments.

## ☁️ Geräte-Abgleich aktivieren (einmalig)

Der Sync speichert NUR Chiffrate (Zero-Knowledge): die beiden
Tresor-Blobs (`tresor.meta`, `tresor.daten`) plus Revisionsnummer.

1. Dashboard → **Storage & Databases → KV** → Namespace **`lernprofi-tresor`** anlegen.
2. Die Namespace-**ID** kopieren und in `wrangler.jsonc` eintragen
   (auskommentierte `kv_namespaces`-Zeile aktivieren), committen/pushen.
3. Fertig: Der Elternbereich zeigt unter „☁️ Geräte-Abgleich“ den
   Server-Stand; Hochladen/Herunterladen je Gerät per Knopf.
   Konflikte (anderes Gerät hat zwischenzeitlich gesichert) werden
   gemeldet – nichts wird still überschrieben (HTTP 409).

**Neues Gerät anschließen:** Auf dem eingerichteten Gerät einmal
„⬆️ sichern“. Auf dem neuen Gerät die App öffnen, die Tresor-Einrichtung
mit beliebigen Werten durchlaufen (sie wird gleich ersetzt), mit dem
Eltern-Passwort anmelden und „⬇️ Server-Stand holen“. Damit kommen die
Tresor-Hüllen UND die Daten des Familien-Tresors auf das Gerät – ab dann
gelten überall dieselbe Lern-PIN und dasselbe Eltern-Passwort.

## 🔐 Cloudflare Access (Zero Trust) vor die Domain

1. Dashboard → **Zero Trust → Access → Applications → Add application → Self-hosted**.
2. Domain: die Worker-URL (bzw. eigene Domain), Name „Lernprofi“.
3. Policy „Familie“: *Allow* → Include → **Emails** → die Eltern-E-Mail(s).
   Session-Dauer großzügig wählen (z. B. 1 Monat), damit Felix nicht
   ständig durch den Access-Login muss.
4. Die API prüft zusätzlich den Header `Cf-Access-Authenticated-User-Email` –
   ohne Access-Session antwortet `/api/*` mit 401.
5. Wichtig für offline: Die **installierte PWA startet aus dem Cache**
   auch ohne Netz; nur der Abgleich braucht eine gültige Access-Session.
   Nach Aktivierung einmal den Flugmodus-Test machen.

## Lokal entwickeln

`npm run dev` (nur App, API antwortet nicht) oder
`npx wrangler dev` mit `DEV_OHNE_ACCESS=1` (App + API ohne Access-Prüfung –
NIE in Produktion setzen).

## Qualitätsgates

`npm run gates` = oxlint · Vitest (inkl. server/_lib) · statische
Regression · Build · Playwright-Smoke (iPhone + iPad hoch/quer).
