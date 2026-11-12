# Designrichtung „Ruhige Bühne“ – Spezifikation (v0.84)

Stand: 12.11.2026 · Entscheidung: Design-Switch, automatisiert in Etappen.
Mockups: claude.ai-Leinwand „Leos Welten – Design-Mockups“ (fünf iPad-Bildschirme).

## Ziel

Die Gestaltung soll das pädagogische Konzept sichtbar machen: ein Bildschirm,
eine Handlung; wenig Reize; eine eigene, wiedererkennbare Identität statt
Emojis und Systemschrift. Fachlogik (`src/calc/*`), Datenmodell und alle
`data-test`-Ids bleiben unverändert – der Umbau berührt nur Darstellung.

## Grundlagen

| Baustein | Entscheidung |
|---|---|
| Schrift | Nunito (700/800/900), selbst gehostet über `@fontsource/nunito` – CSP `font-src 'self'` bleibt, keine Fremd-CDNs |
| Farben | Papier `#F7F3EA` (Grund) · Tinte `#1E2A3A` (Text, Fokus, Navigation) · Leo-Gold `#E09B2D` (die EINE Handlung) · Moos `#3C9D7B` (geschafft) · See `#3E7CB1` (Links, Plan) · Mohn `#D6453D` (nur Stundenzeiger) |
| Dunkel | gleiche Rollen auf Tinte-Grund (`#121A26`), Karten `#1B2636`, Text `#EEF1F6` |
| Token-Schnittstelle | `src/styles/tokens.css` + `T` in `appContext.jsx` behalten ihre Namen; `--primaer` wird Gold mit Tinte-Text, `--weich` ein Papier-Ton. So wandert jede Ansicht automatisch mit |
| Radien/Schatten | Karte 22 px, Knopf 16 px, Schatten als 2-px-Unterkante (`--schatten`) |
| Zeichen | `src/features/Icon.jsx`: eigener Satz aus Strich-SVGs (home, pencil, calendar, gamepad, wrench, sparkle, clock, check, coin, search, arrow, lock, user, star) und `LeoMark` (geometrischer Löwe, drei Stimmungen). In der Shell und auf den umgebauten Bildschirmen ersetzen sie Emojis |

## Etappe 1 (v0.84.0): Fundament + Shell + Leitbildschirme

1. Tokens, Schrift, Grundstile (Knöpfe fett, Karten-Schatten).
2. App-Shell: Navigation als Tinte-Leiste mit Zeichen + Beschriftung (seitlich auf dem Tablet, unten auf dem Handy), Kopf mit Leo-Marke; Sperrbildschirm mit Leo-Marke.
3. Startseite als Tagesbühne: Karte „Jetzt dran“ (reine Logik `jetztDran()` in `src/calc/jetztDran.js`: erster offener Plan-Block heute → sonst empfohlenes Feld → sonst Üben), drei Kennzahlen (Blöcke heute, Lernzeit frei, Münzen); die bestehenden Karten bleiben darunter und werden leiser.
4. Übung: Fortschritt als Balkenreihe über der Frage, Kopfzeile ohne Emoji.
5. Spielhalle: Welten-Kacheln mit Farbe je Welt und Zeichen; Abzeichen „Deine Welt“ ohne Stern-Emoji.
6. Erst-Start: Schrittband als Pillen, Übergabe als dunkle Bühne.

Nicht in Etappe 1: Emojis in Inhalts-Strings (Aufgabenpools, Release-Notes,
Statuszeilen wie „🪙 1 Münze“), Illustrationen je Welt, Bewegung. Das folgt
als Etappe 2, damit die Smoke-Tests schrittweise mitwandern.

## Tests

- Alle `data-test`-Ids bleiben. Smoke-Assertions, die auf entfernte Emojis
  zeigen („⭐ Deine Welt“), werden auf den neuen Text angepasst.
- Regression: ältere Checks per Alternative erweitern, neuer Block v0.84.
- Vitest für `jetztDran()`.
- Gates komplett grün vor jedem Merge.

## Status (12.11.2026)

| Etappe | Inhalt | Stand |
|---|---|---|
| 1 (v0.84.0) | Tokens, Nunito, Zeichensatz, Shell, Tagesbühne, Übung, Spielhalle, Erst-Start | ✅ gemergt |
| 2 (v0.84.1) | Startseiten-Karten, Übungs-Auswahl mit Fach-Zeichen, Kopfzeilen aller Bildschirme | ✅ gemergt |
| 3 (v0.84.2) | Deko-Emoji-Präfixe in Eltern, Wochenplan, Sperrbildschirm, Kompass, Aufsatz, Schrift, Karteikasten, Spielhalle, Einstufung, Vorgang; Leo-Marke in Sprechblasen | ✅ |
| 4 (offen) | Emojis in DATEN: Plan-Bausteine (`BAUSTEINE.emoji`), Eltern-Gruppen, Gesprächsimpulse, Welten-Knöpfe (`THEMEN_WELTEN.emoji`), Aufgaben-Bereiche (`emoji`-Felder in calc) → Zeichen-Zuordnung je Schlüssel; Illustrationen je Welt; Bewegung mit Bedeutung; WCAG-Audit | ⏳ |

Bewusst behalten: fachliche Zeichen (Ampeln 🔴🟡🟢, Fortschrittspunkte 🟢⚪, ❓/✅ auf Druckkarten, Schachfiguren), Emojis in Aufgabentexten und Release-Notes.
