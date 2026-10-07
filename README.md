# Lernprofi (Neubau)

Lern-App für ein Kind (Klasse 4, Baden-Württemberg) – Neubau auf dem
Familien-Tech-Stack (wie mangieriERP). Die bisherige Single-File-App läuft
parallel weiter, bis die Umstellung abgeschlossen ist (Etappenplan in
`docs/ZIELARCHITEKTUR.md`).

## Stack

React 19 · Vite · oxlint · Vitest · Playwright (Chromium) ·
Cloudflare Pages + Functions + KV + Access (ab Etappe 6) ·
Zero-Knowledge-Tresor (AES-256-GCM, ab Etappe 2) · PWA, deutsch, hell/dunkel.

## Struktur

```
src/calc/      reine Fachlogik (kein DOM, kein Date.now, kein Zufall ohne Seed) + Tests
src/features/  Ansichten (holen alles über useApp())
src/styles/    Design-Tokens (tokens.css)
src/App.jsx    Shell: Navigation, Routen, APP_VERSION – keine Fachlogik
test/          regression.mjs (statische Prüfungen je Version)
e2e/           Playwright-Smoke (iPhone 390×844, iPad 820×1180 und 1180×820)
public/        _headers, manifest.json, icon.svg
docs/          Bestandsaufnahme + Zielarchitektur (Phase 0)
```

## Qualitätsgates (vor jedem Commit, alle grün)

```
npm run lint          # oxlint, Baseline 0 Warnungen
npm run test          # Vitest (calc-Module, fiktive Daten)
npm run regression    # node test/regression.mjs → FAIL 0
npm run build         # vite build
npm run smoke         # Playwright gegen vite preview (vorher bauen!)
npm run gates         # alles in der richtigen Reihenfolge
```

## Regeln

- Entwicklung auf `develop`, Commits auf Deutsch, nie force-pushen.
- Keine Secrets im Repo; Testdaten immer fiktiv; keine echten Namen
  oder Schuldaten des Kindes im Code („Kind“/„Profil“).
- Jede Anfrage = eigene Version: `APP_VERSION` in `src/App.jsx` + Eintrag
  an Index 0 von `src/releaseNotes.json`.
- Datensparsamkeit: kein Tracking, keine Analytics, keine Fremd-CDNs.

## Deploy (ab Etappe 6)

Cloudflare Pages mit Git-Integration: Build `npm run build`, Output `dist`,
eigenes Pages-Projekt, KV-Namespace und Access-Policy – Anleitung folgt in
`docs/DEPLOY-CLOUDFLARE.md`.
