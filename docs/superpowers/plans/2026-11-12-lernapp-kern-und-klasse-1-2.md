# Lern-App-Kern + Klasse 1 und 2 – Umsetzungsplan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Neue Familien bekommen die reine Lern-App ohne personenbezogene Daten im Code; Plan, Leo-KI und Schreib-Training bleiben der Bestandsfamilie; Klasse 1 und 2 bekommen eigene Lerninhalte mit Vorlesen.

**Architecture:** Ein Modul-Schalter im Dokument (`einstellungen.module`) steuert, welche Bereiche die Shell zeigt; Bestandsdokumente migrieren auf „alles an“, neue starten im Kern. Stundenplan und feste Termine werden reine Dokument-Daten. Ein Klassen-Modul (`src/calc/klassen.js`) liefert je Klassenstufe Fächer, Bereiche, Pools, Kennenlern-Felder und Spiel-Fragen; Üben, Einstufung, Spiele, Suche und Eltern ziehen nur noch daraus.

**Tech Stack:** React 19, Vite 8, Vitest, oxlint (Baseline 19 Warnungen), Playwright-Smoke (3 Viewports), statische Regression `test/regression.mjs`.

**Spec:** `docs/superpowers/specs/2026-11-12-lernapp-kern-und-klasse-1-2-design.md`

## Global Constraints

- Jede Etappe = eigene Version (`APP_VERSION` in `src/App.jsx`) + Release-Note an Index 0 von `src/releaseNotes.json` (rn-113, rn-114, rn-115) + Regressionsblock; alte Regressions-Checks nur per Alternative erweitern, nie löschen.
- Kein echter Name, keine echten Termine/Schuldaten des Kindes in `src`, `server`, `e2e`, `test`, `docs` (auch nicht in Kommentaren). Testdaten immer fiktiv.
- Keine Fremd-CDNs, kein Audio im Bundle; Vorlesen nur über `window.speechSynthesis`.
- Alle bestehenden `data-test`-Ids bleiben; neue sind unten benannt.
- `migrateData` bleibt idempotent und verlustfrei; `calc`-Module ohne DOM/Uhr/ungeseedeten Zufall.
- Vor jedem Merge: `npm run gates` grün. Commits auf Deutsch, Branch `claude/serene-allen-ns5gn7`, PR auf `develop`, kein Force-Push.
- Aufgabenformat der Pools: `{ f, r, x: [2 Falschantworten], tipp, sprich?, bild?, term? }`, Pool `{ easy, hard }`, je Bereich ≥ 24 easy / ≥ 20 hard; `easy` = 1. Halbjahr, `hard` = 2. Halbjahr.

## Review Focus

1. **Bestandsfamilie verliert nichts:** Ein Dokument von vor v0.86 (mit `festeTermine`, ohne `module`/`schule`) zeigt nach der Migration Plan, Leo, Schrift und dieselben festen Termine inkl. Mittag. → Test in Task 1.
2. **Alt-Backup ohne `festeTermine`** (sehr alter Stand) bekommt keine fremden Termine, sondern eine leere Liste. → Test in Task 1.
3. **Klassenwechsel mit vorhandener Einstufung:** Wechsel 4 → 1 darf keine Empfehlung auf nicht existierende Felder zeigen (`jetztDran`, Start-Trainingsplan, „empfohlen“). → Tests in Task 6 und 8.
4. **Gerät ohne Sprachausgabe** (kein `speechSynthesis`): Üben, Einstufung und Spiele laufen ohne Knopf und ohne Fehler. → Test in Task 7.
5. **Direktsprung in ein abgeschaltetes Modul** (Deep-Link über Suche, alter `route`-Zustand, Plan-Block-Typ „schrift“ im Kern): landet auf Start bzw. zeigt keinen toten Knopf. → Tests in Task 3.

---

## Etappe 1 – v0.86.0: Leak-Fix + Modul-Schalter

### Task 1: Datenmodell (`migrateData`, `wochenplan`)

**Files:** Modify `src/calc/migrateData.js`, `src/calc/wochenplan.js`; Create `src/calc/testFixtures.js` (nur von Tests importiert, fiktive Termine); Test `src/calc/migrateData.test.js`, `src/calc/wochenplan.test.js`, `src/calc/koennerPlan.test.js`, `src/calc/kompassPlan.test.js`, `src/calc/kalender.test.js`.

**Interfaces (Produces):**
- `SCHEMA_VERSION = 2`.
- `einstellungen.module: { plan: boolean, ki: boolean, schrift: boolean }` – neu: alle `false`; Quelle hat `einstellungen` aber kein `module`-Objekt: alle `true`; sonst gespeicherte Booleans.
- `einstellungen.schule: { tage: number[], von: number, bis: number, stunden: { [tag 0-4]: [von, bis, fach, freiwillig?][] }, mittag: boolean }` – Default `{ tage: [0,1,2,3,4], von: 470, bis: 780, stunden: {}, mittag: false }`; Bestand (wie oben erkannt): `mittag: true`.
- `einstellungen.festeTermine`: Default `[]`; `mittagErzwingen` nur bei `schule.mittag === true`.
- `wochenplan.js`: `FESTE_TERMINE_STANDARD = []`; `SCHULE`/`SCHULSTUNDEN` entfallen; `SCHUL_RASTER = [[470,515],[515,560],[580,625],[625,670],[690,735],[735,780]]`; `schulStunden(schule, tag)`, `schulZeilen(schule, tag)`, `schulFaecher(schule, tag)`, `schuleText(schule) → "7:50–13:00"`, `stundenplanAusText(text) → stunden` (je Zeile `Mo: Fach, Fach, …`; `(AG)` am Fach = freiwillig; leere Fächer `-` überspringen den Slot), `stundenplanAlsText(stunden) → string`.
- `testFixtures.js`: `TEST_FESTE` (gleiche Slots wie bisher, fiktive Namen: Mo 16:00 „Töpfern“ 60 freiwillig, Mo 18:00 „Orchester“ 60, Di 14:00 „Englisch-AG“ 60 inaktiv „bis 14:50“, Di 16:00 „Flöten-Stunde“ 30, Di 17:00 „Turnen“ 60, Mi 15:00 „Lernzeit“ 60 inaktiv, Do 17:00 „Schwimmen“ 60, Do 18:30 „Jugendfeuerwehr“ 90 „bis 20:00“, über `mittagErzwingen`), `TEST_SCHULE` (fiktiver Stundenplan Mo–Fr, 6 Stunden, eine AG).

- [ ] Tests zuerst (rot): `leeresDokument` → `module` alle false, `festeTermine` `[]`, `schule.mittag` false, `schemaVersion` 2; Bestandsdokument `{ einstellungen: { festeTermine: [ein Termin] } }` → `module` alle true, `mittag` true, 7 Mittag-Einträge + Termin; Dokument ohne `einstellungen` → Kern; `{ einstellungen: {} }` (uralt, ohne `festeTermine`) → `festeTermine` nur Mittag (weil Bestand), kein fremder Termin; Idempotenz; `stundenplanAusText("Mo: Deutsch, Mathe, -, Musik (AG)")` → Slots 0, 1, 3 mit `freiwillig` an Slot 3, Rundreise über `stundenplanAlsText`; `schulFaecher(TEST_SCHULE, 0)` ohne AG und Dubletten; `schulZeilen` mit Pausen nur bei eingetragenen Stunden.
- [ ] Implementieren, bestehende Tests auf `TEST_FESTE`/`TEST_SCHULE` umstellen (Assertions mit den neuen fiktiven Namen).
- [ ] `npx vitest run src/calc` grün. Commit.

### Task 2: Wochenplan-/Start-Anzeige und Eltern-Editor „Schulzeiten & Stundenplan“

**Files:** Modify `src/features/Wochenplan.jsx` (TagSpalte bekommt `schule`), `src/features/Start.jsx` (`schulFaecher(data.einstellungen.schule, heuteIdx)`), `src/features/Eltern.jsx` (Tab „Plan & Termine“: Karte `eltern-schule`).

**Interfaces:** Karte `data-test="eltern-schule"`: Textarea `schule-text` (5 Zeilen Mo–Fr, vorbefüllt mit `stundenplanAlsText`), Knopf `schule-speichern`, Schalter `mittag-1`/`mittag-0` („Mittag & Spielzeit 13–14 Uhr blocken“). Wochenplan: Kopfzeile `Schule ${schuleText(schule)}`; `schule-zeigen` nur, wenn irgendein Tag Stunden hat.

- [ ] Umsetzen; Smoke-Test „Wochenplan: Termin, Bausteine …“ trägt den fiktiven Stundenplan über den Editor ein bzw. nutzt den Test-Seed (Task 4).

### Task 3: Modul-Schalter in der Oberfläche

**Files:** Create `src/calc/module.js`; Modify `src/App.jsx`, `src/features/Start.jsx`, `src/features/Training.jsx`, `src/features/Ueben.jsx`, `src/features/Eltern.jsx`, `src/calc/suche.js`, `src/calc/jetztDran.js`, `src/appContext.jsx`; Test `src/calc/module.test.js`, `src/calc/jetztDran.test.js`, `src/calc/suche.test.js`.

**Interfaces (Produces):**
- `module.js`: `modulAn(data, name: "plan"|"ki"|"schrift") → boolean`; `routeErlaubt(route, data) → boolean` (`plan`,`kompass`,`doks` → plan; `schrift` → schrift; `aufsatz` → ki; sonst true); `MODUL_NAMEN = { plan: "Plan", ki: "Leo", schrift: "Schreib-Training" }`.
- `jetztDran(data, heute)`: bei `!modulAn(data,"plan")` nie `art: "plan"`, `gesamt/geschafft` = 0.
- `sucheIndex`: Seiten/Termine/Unterlagen abgeschalteter Module fehlen.
- App: Tab „Plan“ nur bei plan; `routeErlaubt` falsch → `<Start />`. Start: ohne plan keine `kompass-karte`, `tipps-zeile`, `heute-plan`; erste Kennzahl dann `stat-missionen` („Mini-Missionen“, `tag.missionen` von `missionsZiel`). Training: `zum-schrift` nur schrift, `zum-aufsatz` nur ki, `zum-doks` nur plan. Üben: KI-Erklärer nur bei ki; „Am Original“-Hinweis nur bei plan. Eltern: Tabs `plan` und `leo` nur bei Modul; `eltern-bericht`, `eltern-saetze` nur ki; `eltern-doks` nur plan; KI-Freigabe „Schrift-Blick“ nur schrift; Zeile `module-info` in „Konto & Daten“ (`Freigeschaltet: Plan · Leo · Schreib-Training` bzw. „Lern-App-Kern“).
- appContext: Alt-App-Import behält `einstellungen.module` und `einstellungen.schule` des aktuellen Tresors. Test-Seed: bei Erstbefüllung wird `window.__ERSTDOK__` (nur Tests) als Quelle durch `migrateData` geschickt.

- [ ] Tests zuerst: `routeErlaubt` für alle fünf gesperrten Routen und eine freie; `jetztDran` mit offenem Plan-Block und Modul aus → `art` ≠ "plan"; `sucheIndex` ohne „Mein Wochenplan“/Termine im Kern, mit im Vollausbau.
- [ ] Implementieren. `npx vitest run` grün. Commit.

### Task 4: Smoke, Namen raus, Regression, Version

**Files:** Modify `e2e/smoke.spec.js`, `test/regression.mjs`, `src/App.jsx`, `src/releaseNotes.json`, alle Dateien mit dem Vornamen (11 in `src`, 1 in `e2e`, Doku), `docs/FREIGABE-CHECKLISTE.md`, Spec (Abweichungen: Alt-Import behält Module; Unterlagen zählen zum Modul plan; Blitzlesen hat eigene Tier-Wortliste).

- [ ] `test.beforeEach`: für Tests, deren Titel nicht mit „Kern:“ beginnt, `page.addInitScript` mit `window.__ERSTDOK__ = { einstellungen: { module: alle true, festeTermine: TEST_FESTE-Kopie, schule: fiktiver Plan + mittag true } }`. Assertions mit alten Namen auf die fiktiven ändern.
- [ ] Neuer Test „Kern: neue Familie sieht weder Plan noch Leo noch Schreib-Training“: kein `nav-plan`, Training ohne `zum-schrift`/`zum-aufsatz`, Eltern ohne `eb-tab-plan`/`eb-tab-leo`, `module-info` enthält „Lern-App-Kern“, `stat-missionen` sichtbar, Suche nach „Wochenplan“ ohne Treffer.
- [ ] Neuer Test „Stundenplan: Eltern tragen ihn als Text ein, der Wochenplan zeigt ihn“.
- [ ] Regression: Block v0.86.0; v0.1-Check als Verzeichnis-Scan über `src`, `server`, `e2e`, `test`, `docs` (Muster aus Teilstrings gebaut); alte Checks (Zeilen ~1068, 1109, 1142, 1182, 1191) per Alternative.
- [ ] `APP_VERSION` 0.86.0, rn-113. `npm run gates` grün. Commit, Push, PR, Merge.

## Etappe 2 – v0.87.0: Klassen-Modell, Klasse 1, Vorlesen

### Task 5: Inhalte Klasse 1 (Vertrag für Inhalts-Dateien)

**Files:** Create `src/calc/aufgaben/woerter12.js`, `src/calc/aufgaben/klasse1Mathe.js`, `src/calc/aufgaben/klasse1Deutsch.js`; Test `src/calc/klasse12.test.js`.

**Interfaces (Produces):**
- `woerter12.js`: `WOERTER = [{ w: "Fisch", artikel: "der", mehrzahl: "Fische", silben: ["Fisch"], bild: "🐟", klasse: 1|2 }]` (≥ 90 Nomen), `VERBEN`, `ADJEKTIVE`, `REIME` (Gruppen).
- `klasse1Mathe.js`: `K1_MATHE_DATEN` (Keys `k1zahlen, k1zerlegen, k1plus, k1minus, k1geld, k1formen, k1uhr`), `K1_MATHE_BEREICHE`.
- `klasse1Deutsch.js`: `K1_DEUTSCH_DATEN` (Keys `k1anlaut, k1laute, k1silben, k1reime, k1lesen, k1saetze`), `K1_DEUTSCH_BEREICHE`, `K1_DEUTSCH_GRUPPEN`.
- Rechenaufgaben tragen `term: { a, op: "+"|"-"|"·"|":", b }`; der Test rechnet `r` nach. `sprich` für alles mit Symbolen oder Bild-Emoji. Bild-Arten: vorhanden `uhr`, `strahl`, Feld `bloecke`; neu `zwanzig { rot, blau }`, `muenzen { werte: Cent[] }`, `formen { folge: string[] }`, `emoji { zeichen, anzahl? }`.

- [ ] Test zuerst: je Pool `poolGesund`, Mindestgrößen, genau 2 Falschantworten, keine doppelten Fragen, `term` nachgerechnet, Frage ≤ 70 Zeichen, deterministisch (zweimaliger Import-Vergleich über erneute Erzeugung).
- [ ] Inhalte erzeugen (Generatoren mit `rngAusSeed`). Commit.

### Task 6: Klassen-Modul und Verdrahtung

**Files:** Create `src/calc/klassen.js`; Modify `src/calc/migrateData.js` (`klasse ∈ {1,2,3,4}`, `einstellungen.vorlesen ∈ {"", "auto", "knopf", "aus"}`), `src/calc/onboarding.js`, `src/calc/einstufung.js`, `src/calc/jetztDran.js`, `src/calc/suche.js`, `src/calc/stufen.js` (unverändert: nur Klasse 4 startet auf 2), `src/features/Ueben.jsx`, `src/features/Einstufung.jsx`, `src/features/ErstStart.jsx`, `src/features/Eltern.jsx`, `src/features/Training.jsx`, `src/features/Start.jsx`, `src/spiele/fragen.js`, `src/features/Spielhalle.jsx`, `src/features/AufgabenBild.jsx`; Test `src/calc/klassen.test.js`, `src/calc/onboarding.test.js`, `src/calc/jetztDran.test.js`.

**Interfaces (Produces):**
- `klassen.js`: `KLASSEN = [1,2,3,4]`; `faecherFuerKlasse(klasse, thema) → [{ id, name, bereiche, daten, gruppen }]`; `bereicheFuerKlasse(klasse) → [{ key, name, emoji, fach }]`; `feldTitel(key)` (über alle Klassen); `einstufungFelder(klasse)`, `einstufungPools(klasse)`; `spielQuellen(klasse) → { mathe: {leicht, schwer}, wort: {leicht, schwer} } | null` (null = 3/4-Verhalten); `vorleseModus(einstellungen, klasse) → "auto"|"knopf"|"aus"` (Standard K1 auto, K2 knopf, 3/4 aus); `klasseWechseln(data, klasse) → data` (setzt `einstufung: null`, `schwerpunkte: []`).
- `onboarding.js`: `schwerpunkteFuerKlasse(klasse)`, `schwerpunktFelder(schwerpunkte, klasse = 4)`, `istEmpfohlen(feld, einstufung, schwerpunkte, klasse = 4)`; `SCHWERPUNKT_KEYS` = Vereinigung (`rechtschreiben, lesen, mathe, mut, laute, zahlen, einmaleins`).
- `einstufung.js`: `einstufungPlan(pools, rng, felder = EINSTUFUNG_FELDER)`; `stufenDeutung` ohne „Klasse-4“ im Text („sicher – auf Klassen-Niveau ✅“).
- `fragen.js`: `spielKlasseSetzen(klasse, vorleseModus)`; `spielFrage` zieht für 1/2 aus `spielQuellen`.
- UI-Ids: `fb-klasse-1..4`, Eltern `klasse-1..4` (Karte `eltern-profil`), `vorlesen-auto|knopf|aus` (Karte `eltern-lernen`). Training: `zum-kasten` nur Klasse ≥ 3.

- [ ] Tests zuerst: jede Klasse liefert Fächer mit Pools für jeden Bereich; Keys über alle Klassen eindeutig; jedes Kennenlern-Feld hat einen Pool mit easy ≥ 2; `schwerpunktFelder` je Klasse nur existierende Keys; `klasseWechseln` räumt auf; `jetztDran` nach Wechsel 4 → 1 mit alter Empfehlung zeigt kein 3/4-Feld (Empfehlung wird nur genutzt, wenn der Key zur Klasse gehört).
- [ ] Implementieren, `npx vitest run` grün. Commit.

### Task 7: Vorlesen

**Files:** Create `src/vorlesen.js`, `src/features/VorleseKnopf.jsx`; Modify `src/features/Icon.jsx` (`speaker`), `src/features/Ueben.jsx`, `src/features/Einstufung.jsx`, `src/spiele/fragen.js`; Test `src/vorlesen.test.js`.

**Interfaces (Produces):** `vorlesbar() → boolean`; `vorlesen(text) → boolean` (bricht Laufendes ab, `lang "de-DE"`, `rate 0.9`); `vorleseStopp()`; `sprechText(aufgabe) → string` (`sprich` vor `f`, Emojis entfernt). `<VorleseKnopf text test klein />` rendert nichts ohne Sprachausgabe. Ids: `vorlesen-frage`, `vorlesen-antwort` (je Antwort), `spiel-vorlesen`.

- [ ] Test zuerst: `sprechText` (sprich schlägt f, Emojis raus), `vorlesen` ohne `speechSynthesis` → false ohne Fehler, mit Attrappe → `speak` mit Text und `de-DE`.
- [ ] Implementieren: Auto-Vorlesen der Frage bei Modus „auto“ je Aufgabenwechsel; Spiele über delegierten Klick auf `[data-sprich]`. Commit.

### Task 8: Smoke, Regression, Version (Etappe 2)

- [ ] Smoke: „Kern: Erst-Start mit Klasse 1 – nur Klasse-1-Bereiche, Frage wird vorgelesen“ (Sprachausgabe per Init-Script als Attrappe, die gesprochene Texte sammelt); „Kern: Klassenwechsel im Elternbereich räumt Empfehlungen auf“; „Kern: Kennenlern-Runde Klasse 1 läuft durch“; „Kern: Spiel stellt in Klasse 1 Fragen bis 20“.
- [ ] Regression v0.87.0, `APP_VERSION` 0.87.0, rn-114, Gates, PR, Merge.

## Etappe 3 – v0.88.0: Klasse 2

### Task 9: Inhalte Klasse 2

**Files:** Create `src/calc/aufgaben/klasse2Mathe.js` (`K2_MATHE_DATEN`, Keys `k2zahlen, k2plus, k2minus, k2einmaleins, k2teilen, k2geld, k2uhr, k2laengen, k2sach, k2spiegeln`; `K2_MATHE_BEREICHE`), `src/calc/aufgaben/klasse2Deutsch.js` (`K2_DEUTSCH_DATEN`, Keys `k2lesen, k2nomen, k2mehrzahl, k2verben, k2adjektive, k2satzzeichen, k2silben, k2verlaengern, k2abc, k2zusnomen`; `K2_DEUTSCH_BEREICHE`, `K2_DEUTSCH_GRUPPEN`); Test in `src/calc/klasse12.test.js` erweitert (gleicher Vertrag wie Task 5; `k2lesen` trägt `kontext` mit 3–4 Sätzen).

### Task 10: Klasse 2 verdrahten, Smoke, Regression, Version

- [ ] `klassen.js` um Klasse 2 ergänzen (Fächer, Kennenlern-Felder `k2lesen, k2nomen, k2verben, k2zahlen, k2plus, k2einmaleins`, Spiel-Quellen, Schwerpunkte).
- [ ] Smoke: „Kern: Klasse 2 – Einmaleins-Runde spielbar, Lautsprecher als Knopf“; Regression v0.88.0; `APP_VERSION` 0.88.0, rn-115; Gates, PR, Merge.
