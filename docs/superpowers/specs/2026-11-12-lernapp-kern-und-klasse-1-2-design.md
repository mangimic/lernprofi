# Lern-App-Kern für neue Familien + Klasse 1 und 2 – Spezifikation (v0.86 ff.)

Stand: 12.11.2026 · Status: Entwurf zur Freigabe (Prüfer-Durchgang eingearbeitet).

## Warum

Neue Familien sollen erst einmal die reine Lern-App bekommen. Drei Dinge
stehen dem heute entgegen:

1. **Datenleck.** `src/calc/wochenplan.js` enthält die festen
   Nachmittags-Termine des Kindes (`FESTE_TERMINE_STANDARD`) und den
   Vormittags-Stundenplan seiner Klasse (`SCHULSTUNDEN`, `SCHULE`). Jedes neue
   Dokument startet mit diesen Terminen (`leeresDokument`), und das Bundle
   ist öffentlich lesbar. Eure eigenen Termine liegen bereits in eurem
   verschlüsselten Dokument (`einstellungen.festeTermine`).
2. **Unfertige Module.** Plan (Wochenplan, Kompass-Fahrplan, Termine), die
   Leo-KI (Erklären, Bericht, Sätze, Aufsatz-Check, Schrift-Blick) und das
   Schreib-Training sind für eure Familie gebaut, für fremde noch nicht reif.
   Der Server sperrt Leo für fremde Konten bereits (403), die Oberfläche
   zeigt die Knöpfe trotzdem.
3. **Nur Klasse 3 und 4.** `profil.klasse` kennt nur 3/4; alle Aufgaben
   sind darauf zugeschnitten (dass/das, Satzglieder, Zahlen bis 10 000).
   Angeboten werden soll Grundschulniveau für Erst- und Zweitklässler.

## Ziele

- Kein personenbezogenes Datum des Kindes im Code oder im Bundle.
- Neue Familien sehen: Start (Tagesbühne), Üben, Spiele, Training
  (Konzentration, Sudoku, Karteikasten, Kennenlern-Runde), Eltern.
- Eure Familie sieht weiterhin alles (Plan, Leo, Schreib-Training,
  Aufsatz-Check, Unterlagen).
- Klasse 1 und 2 sind wählbar und haben eigene Lerninhalte auf dem Niveau des
  Bildungsplans Baden-Württemberg (Deutsch, Mathe). Kinder, die noch nicht
  lesen, bekommen Frage und Antworten vorgelesen.

## Nicht-Ziele

- Keine Eltern-Oberfläche zum Freischalten der Module für fremde Familien
  (kommt mit der nächsten Iteration, wenn Plan/KI reif sind).
- Kein Umbau der 3/4-Inhalte, keine neuen Spiel-Engines.
- Keine Sachkunde für Klasse 1/2 (Bildungsplan: Sachunterricht ohne
  verbindliche Prüfinhalte in 1/2; „Stark mit Leo“ bleibt für alle).
- Keine Umbenennung „Tresor“ (eigene Anfrage).

## Anti-Ziele

- Daten des Kindes in einen anderen Winkel des Codes verschieben.
- Klasse 1/2 nur als Auswahl ohne passende Inhalte („leere Klasse“).
- Instruktionstexte, die ein Erstklässler lesen müsste, ohne Vorlesen.

## Rahmen

- Repo-Regeln: jede Etappe = eigene Version + Release-Note an Index 0,
  Regressionsblock, alte Checks per Alternative erweitern; keine echten
  Namen (auch nicht in Kommentaren – heute noch an 9 Stellen), keine
  Fremd-CDNs, CSP `default-src 'self'`.
- Datenmodell `migrateData.js` ist die einzige Stelle für Defaults und
  Migration; Zero-Knowledge bleibt.
- Vorlesen nur über `window.speechSynthesis` (Gerät, offline). Kein Audio
  im Bundle, kein Dienst.
- Gates vor jedem Merge grün (oxlint-Baseline 19, Vitest, Regression,
  Build, Playwright-Smoke 3 Viewports).

## Bauwege (entschieden: Weg 1)

| Weg | Idee | Warum (nicht) |
|---|---|---|
| **1. Eigene Lernwelt je Klassenstufe** | Neue Aufgaben-Dateien `klasse1*.js`/`klasse2*.js`, eigene Bereichs-Listen pro Klasse, Üben/Spiele/Kennenlern-Runde/Suche ziehen aus der Liste der gewählten Klasse; Vorlesen-Knopf | Echtes Niveau pro Klasse, 3/4 unberührt. **Gewählt.** |
| 2. Bestehende Bereiche nach unten verlängern (Stufe 0) | Jeder Bereich bekommt leichtere Aufgaben | dass/das, Satzglieder, 4 Fälle haben in 1/2 kein Gegenstück – die Bereichs-Menge selbst muss anders sein |
| 3. Fremde Sammlungen importieren | OER-Aufgabenpakete einbinden | Lizenz, Qualität, Datensparsamkeit unklar; Stil passt nicht zu Leo |

## Entwurf

### A. Leak-Fix (Etappe 1, v0.86.0 – zuerst, eigener PR)

- `FESTE_TERMINE_STANDARD` → `[]`. `SCHULSTUNDEN`/`SCHULE`-Konstanten entfallen;
  stattdessen `einstellungen.schule = { tage: [0..4], von: 470, bis: 780, stunden: { 0: [[von,bis,fach,freiwillig?]…] } }`,
  Default: Mo–Fr, 7:50–13:00, `stunden: {}`. Der Wochenplan zeigt den
  Vormittag nur, wenn Stunden eingetragen sind, sonst „Schule“.
- Eltern-Bereich (nur bei Modul Plan an): kleiner Editor „Schulzeiten &
  Stundenplan“ – je Tag 6 Textfelder (Fach), Zeiten fest nach Raster
  470/515/560/580/625/670/690/735/780 wie heute. Eure Werte tragt ihr
  einmal von Hand ein; die Tabelle gebe ich dir im Chat.
- Migration: vorhandene Dokumente behalten `festeTermine` (schon als Array
  gespeichert); `schule` wird mit dem Default ergänzt. Kein Rückgriff auf
  Konstanten mehr (Zeile ~205 in `migrateData.js`).
- „Mittag & Spielzeit 13–14 Uhr“ (`mittagErzwingen`) wird zur Einstellung
  `einstellungen.schule.mittag` (bool): bestehende Dokumente `true`, neue
  `false`. Die Familienregel bleibt bei euch, fremde Familien bekommen
  keinen Pflichtblock.
- Kommentare mit dem Vornamen (11 Stellen in `src`, 1 in `e2e`, 5 in
  `docs`) → „das Kind“. Regressions-Check v0.1 („keine echten Kind-Daten“)
  prüft statt einer Einschlussliste von 5 Dateien alle Dateien unter
  `src`, `server`, `e2e`, `test` und `docs` per Verzeichnis-Scan.
- Smoke-Test „Wochenplan: Termin, Bausteine …“ und Kompass-Countdown legen
  ihre Termine selbst an statt auf Defaults zu bauen.

### B. Modul-Schalter (Etappe 1, gleicher PR)

- `einstellungen.module = { plan: bool, ki: bool, schrift: bool }`.
  Default in `leeresDokument`: alle `false`. Migration: ein Dokument, das
  `einstellungen` schon hat, aber noch kein `module` → alle `true`;
  gleichzeitig `schemaVersion` 1 → 2, damit künftige Dokumente eindeutig
  erkennbar sind. Begründung: Heute gibt es im Speicher genau ein Konto
  (eures, per KV geprüft am 12.11.), und „Lernstand aus Datei übernehmen“
  importiert nur Alt-Dateien eurer eigenen Alt-App – beide dürfen den
  Vollausbau. Damit ist eure Familie auf allen Geräten frei (das Dokument
  synchronisiert), jede neue Familie startet im Kern. Bewusst nicht an die
  Konto-Art `stamm` gebunden: die wäre offline nicht da.
- Wirkung:
  - `plan: false` → kein Nav-Tab „Plan“, Route `plan`/`kompass` fällt auf
    Start zurück; Start ohne Heute-Plan-Karte, Kompass-Countdown und
    Einplan-Chips; `jetztDran()` bekommt `module` und liefert nie `art:
    "plan"`; Eltern ohne Abschnitte Termine/feste Termine/Schulzeiten.
  - `ki: false` → Eltern ohne KI-Abschnitt (Freigaben, Modell, Deckel,
    Bericht, Sätze-Werkstatt); Üben ohne KI-Erklärer-Karte; Training ohne
    Kachel „Aufsatz-Check“.
  - `schrift: false` → Training ohne Kachel „Schreib-Training“, Route
    `schrift` fällt zurück. (Schrift hängt an KI; ein eigener Schalter,
    damit es später getrennt freigegeben werden kann.)
  - Suche: Treffer aus abgeschalteten Modulen entfallen.
- Kein UI zum Umschalten. Ein Stamm-Gerät kann die Module in den Eltern-
  Einstellungen zur Kontrolle sehen (Zeile „Module: Plan · Leo · Schrift“),
  ohne Schalter.
- Smoke: Tests, die Plan/KI/Schrift nutzen, bauen ihr Dokument über eine
  Hilfe `vollausbau(page)` (setzt `module` im Tresor), der Rest testet den
  Kern. Ein neuer Test prüft, dass eine frisch eingerichtete Familie
  weder Plan-Tab noch KI-Karte noch Schrift-Kachel sieht.

### C. Klasse 1 und 2 – Datenmodell und Auswahl (Etappe 2, v0.87.0)

- `profil.klasse ∈ {1,2,3,4}`; Erst-Start und Eltern bieten vier Knöpfe.
- `src/calc/klassen.js`: `bereicheFuerKlasse(klasse)` → `{ deutsch, mathe, sachkunde?, stark }`
  mit Listen und Daten; 1/2 bekommen ihre eigenen Listen (unten), 3/4 die
  heutigen. `Ueben.faecherBauen`, `Einstufung`, `spiele/fragen.js`,
  `suche.js`, `jetztDran.feldTitel` und `leoWahl` ziehen daraus.
- Stufen: Pools weiterhin `{ easy, hard }`. Für Klasse 1 und 2 heißt
  `easy` = Stoff des 1. Halbjahrs, `hard` = Stoff des 2. Halbjahrs (z. B.
  Plus ohne / mit Zehnerübergang). Beide Klassen starten auf Stufe 1
  (`stufenStart` bleibt nur für Klasse 4 bei 2) – die zweite Hälfte wird
  wie heute durch eine fehlerfreie Runde freigeschaltet, die Kennenlern-
  Runde kann sie direkt setzen.
- Eltern-Fragebogen „Wo hakt es?“ (`SCHWERPUNKTE` in `onboarding.js`) wird
  klassenabhängig: Klasse 1 → Lesen (k1lesen), Laute (k1anlaut), Zahlen
  (k1zahlen), Rechnen (k1plus), Stark; Klasse 2 → Lesen (k2lesen),
  Schreiben (k2nomen, k2verlaengern), Rechnen (k2plus), Einmaleins
  (k2einmaleins), Stark; 3/4 wie heute. `jetztDran`/`istEmpfohlen` ziehen
  daraus. Ein Klassenwechsel im Eltern-Bereich (neu: vier Knöpfe) setzt
  `einstufung` und `schwerpunkte` zurück, Münzen und Spielstände bleiben.
- Training für Klasse 1/2: Kachel „Karteikasten“ entfällt (Karten sind
  Kompass-4-Stoff); Konzentration behält Zahlenkette und ABC, „Blitzlesen“
  zieht aus dem Wort-Pool der Klasse (K1: k1lesen, K2: k2nomen +
  k2verlaengern).
- Kennenlern-Runde: `EINSTUFUNG_FELDER` wird klassenabhängig (je 6 Felder,
  siehe Listen, Spalte „K“).
- Spiele: `spielMatheFrage`/`spielFrage` ziehen aus den Klassen-Pools
  (Klasse 1: Plus/Minus bis 20 und Wörter erlesen; Klasse 2: bis 100,
  Einmaleins und Lernwörter). Spiele, deren Fragen nicht passen, bleiben
  trotzdem spielbar – die Frage-Quelle ist das einzige, was wechselt.
- Welten/Themen bleiben; Themen-Umschreibungen (`deutschDaten(thema)`)
  gelten nur für 3/4-Pools.

### D. Inhalte Klasse 1 (Etappe 2) – Bildungsplan BW, Klasse 1

Aufgabenformat wie heute (`{ f, r, x[], tipp, bild? }`), je Bereich ≥ 24
easy / ≥ 20 hard. Zahlen-Aufgaben erzeugt ein Generator einmal beim Laden
deterministisch (`rngAusSeed`/`mischen` aus `src/calc/rng.js`, fester Seed
je Bereich), damit Pakete und Tests stabil bleiben; Wörter kommen aus
gepflegten Listen. Bild-Aufgaben nutzen
`AufgabenBild.jsx` (neu: Zwanzigerfeld, Münzen, Formen; vorhanden: Uhr,
Blöcke).

| Fach | key | Bereich | Inhalt | K |
|---|---|---|---|---|
| Mathe | k1zahlen | Zahlen bis 20 | zählen, Zwanzigerfeld lesen, Vorgänger/Nachfolger, größer/kleiner | ✓ |
| Mathe | k1zerlegen | Zahlen zerlegen | Zerlegungen bis 10, verliebte Zahlen (Ergänzen zur 10) | ✓ |
| Mathe | k1plus | Plus bis 20 | ohne, dann mit Zehnerübergang; Verdoppeln | ✓ |
| Mathe | k1minus | Minus bis 20 | ohne, dann mit Zehnerübergang; Halbieren | |
| Mathe | k1geld | Geld bis 20 € | Münzen zählen, passend bezahlen | |
| Mathe | k1formen | Formen & Muster | Kreis/Dreieck/Viereck erkennen, Muster fortsetzen | |
| Mathe | k1uhr | Uhr: volle Stunden | Ziffernblatt lesen (vorhandenes `UhrBild`), Tageszeiten | |
| Deutsch | k1anlaut | Anlaute | Mit welchem Laut beginnt …? (Bild = Emoji + vorgelesenes Wort) | ✓ |
| Deutsch | k1laute | Laute hören | Inlaut/Endlaut, hörst du ein „a“? | |
| Deutsch | k1silben | Silben | Wie viele Silben? Silben zusammensetzen | ✓ |
| Deutsch | k1reime | Reime | Was reimt sich auf …? | |
| Deutsch | k1lesen | Wörter erlesen | Bild → richtiges Wort aus drei | ✓ |
| Deutsch | k1saetze | Erste Sätze | Welcher Satz passt zum Bild? Satzanfang groß, Punkt am Ende | |

### E. Inhalte Klasse 2 (Etappe 3, v0.88.0) – Bildungsplan BW, Klasse 2

| Fach | key | Bereich | Inhalt | K |
|---|---|---|---|---|
| Mathe | k2zahlen | Zahlen bis 100 | Zehner/Einer, Zahlenstrahl, ordnen, Nachbarzehner | ✓ |
| Mathe | k2plus | Plus bis 100 | ZE+E, ZE+Z, mit Übergang | ✓ |
| Mathe | k2minus | Minus bis 100 | ZE−E, ZE−Z, mit Übergang | |
| Mathe | k2einmaleins | Einmaleins | Kernaufgaben (1·, 2·, 5·, 10·), dann alle Reihen, Tauschaufgaben | ✓ |
| Mathe | k2teilen | Teilen | Umkehraufgaben zum Einmaleins, Aufteilen/Verteilen | |
| Mathe | k2geld | Geld bis 100 € | Beträge, Wechselgeld | |
| Mathe | k2uhr | Uhr: halb & viertel | halb, viertel nach/vor, 5-Minuten-Schritte (vorhandenes `UhrBild`) | |
| Mathe | k2laengen | Längen | cm und m schätzen, messen, umrechnen | |
| Mathe | k2sach | Sachaufgaben | kurze Rechengeschichten im Hunderterraum | |
| Mathe | k2spiegeln | Spiegeln & Körper | Symmetrie erkennen, Würfel/Kugel/Quader | |
| Deutsch | k2lesen | Lesen & Verstehen | 3–4 Sätze Text, eine Frage dazu | ✓ |
| Deutsch | k2nomen | Nomen & Artikel | der/die/das, Großschreibung | ✓ |
| Deutsch | k2mehrzahl | Einzahl & Mehrzahl | Pluralformen, Umlaute | |
| Deutsch | k2verben | Verben | Tun-Wörter erkennen, Grundform | ✓ |
| Deutsch | k2adjektive | Adjektive | Wie-Wörter erkennen, Gegensätze | |
| Deutsch | k2satzzeichen | Satzzeichen | Punkt, Fragezeichen, Ausrufezeichen | |
| Deutsch | k2silben | Silbentrennung | Wo wird getrennt? | |
| Deutsch | k2verlaengern | Verlängern | d/t, g/k, b/p am Wortende | |
| Deutsch | k2abc | ABC | Wörter ordnen, Anfangsbuchstaben | |
| Deutsch | k2zusnomen | Zusammengesetzte Nomen | Haus + Tür = ? | |

K = Feld der Kennenlern-Runde dieser Klasse (je 3 Deutsch + 3 Mathe).

### F. Vorlesen (Etappe 2)

- `src/calc/vorlesen.js`: `vorlesbar()` (speechSynthesis vorhanden),
  `vorlesen(text, { lang: "de-DE", rate: 0.9 })`, `stopp()`.
- Üben: bei Klasse 1 und 2 ein Lautsprecher-Knopf (`Icon` „speaker“, neu im
  Zeichensatz) neben der Frage und je ein kleiner an jeder Antwort;
  Klasse 1 liest die Frage automatisch beim Erscheinen vor (Eltern-
  Einstellung `einstellungen.vorlesen: "auto" | "knopf" | "aus"`, Default
  für Klasse 1 „auto“, Klasse 2 „knopf“, 3/4 „aus“).
- Datentexte für 1/2 sind kurz (Frage ≤ 60 Zeichen), Aufgaben können ein
  Feld `sprich` tragen, wenn der Vorlesetext vom Anzeigetext abweicht
  („Mit welchem Laut beginnt Affe?“ statt Emoji).
- Spiele (Vanilla-JS, `seeAbenteuer.js`, `blockwelt.js`, `matchEngine.js`)
  bekommen die Klasse und die Vorlesen-Einstellung übergeben und rufen
  dasselbe Modul: Lautsprecher-Knopf neben der Frage, bei „auto“ wird die
  Frage beim Erscheinen vorgelesen. Damit gilt das Anti-Ziel auch dort.
- Ohne Sprachausgabe (seltene Browser): Knopf ausgeblendet, kein Fehler.

### G. Tests

- Vitest: `klassen.test.js` (jede Klasse liefert Listen, alle Keys
  eindeutig, jedes Feld der Kennenlern-Runde hat einen Pool),
  `poolGesund` über alle neuen Pools (richtige Antwort nie in `x`, 2
  Falschantworten, Texte ≤ 60/16 Zeichen für Spiele), Generator-Tests mit
  Seed, `jetztDran` ohne Plan-Modul, `migrateData` (Module-Defaults, alte
  Dokumente auf `true`, `schule`-Default, keine Termine mehr).
- Smoke: Erst-Start mit Klasse 1 → Üben zeigt nur K1-Bereiche und den
  Lautsprecher; Klasse 2 → Einmaleins-Runde spielbar; neue Familie ohne
  Plan/KI/Schrift; Stamm-Dokument (`vollausbau`) mit allem.
- Regression: Blöcke v0.86.0, v0.87.0, v0.88.0; v0.1-Check gegen den
  Vornamen ohne Ausnahmen.

## Entscheidungen bei der Umsetzung (Etappe 1, v0.86.0)

- **Unterlagen (Dokumenten-Ablage) zählen zum Modul `plan`** (Familien-
  Organisation): Route `doks`, Kachel und Eltern-Karte erscheinen nur dort.
- **Alt-App-Import behält Module, Schulzeiten und feste Termine des
  aktuellen Tresors** – er bringt nur den Lernstand. Ein Neubau-Backup von
  vor v0.86 gilt als Bestand (Vollausbau).
- **Stundenplan-Editor als Text** statt 30 Einzelfelder: je Zeile ein Tag
  (`Mo: Fach, Fach, …`), „-“ lässt eine Stunde frei, „(AG)“ = freiwillig.
- **Start im Kern:** statt „Blöcke heute“ zeigt die erste Kennzahl die
  Mini-Missionen des Tages (`stat-missionen`).
- **Tests:** Der Vollausbau wird über ein fiktives Start-Dokument getestet
  (`window.__ERSTDOK__`, nur bei der Erstbefüllung eines neuen Tresors
  gelesen). Feste Termine und Stundenplan der Tests liegen in
  `src/calc/testFixtures.js` (nicht im Bundle).
- **Release-Notes und alte Regressions-Checks** nannten echte Termine,
  Fächer und Namen Dritter; die Texte sind neutralisiert, die Checks prüfen
  den neuen Stand (hier ging Datenschutz vor „nie löschen“).
- **Blitzlesen** nutzt eine eigene Tier-Wortliste – für Klasse 1/2 bleibt
  es unverändert (der Prüfer hatte hier eine falsche Quelle vermutet).
- **Bleibt bewusst:** Plan-Bausteine und Welten (Schlagzeug, Angeln,
  Pfadfinder, Tennis …) sind allgemeine Hobby-Kategorien ohne Personenbezug;
  die „Familienregel“ im Plan-Wächter ist Logik des Moduls Plan.
- **Git-Historie:** Ältere Commits enthalten die Termine weiterhin; ein
  Umschreiben der Historie bräuchte einen Force-Push (Repo-Regel: nie).

## Entscheidungen bei der Umsetzung (Etappe 2, v0.87.0)

- **Lese-Aufgaben bleiben bei den Antworten stumm** (`k1lesen`,
  `k1saetze`): Die Frage wird vorgelesen, die Antworten nicht – sonst wäre
  die Aufgabe gelöst (`antwortenVorlesbar`).
- **Wählbare Klassen:** Bis Klasse 2 Inhalte hat, bieten Erst-Start und
  Elternbereich 1, 3 und 4 an (`KLASSEN_WAEHLBAR`).
- **Wortlisten** leben in der jeweiligen Inhalts-Datei (`K1_WOERTER` in
  `klasse1Deutsch.js`) statt in einer gemeinsamen `woerter12.js`.
- **Jede Inhalts-Datei hat ihre eigene Testdatei**, die Lösungen
  nachrechnet (Terme, Geldsummen, Uhrzeiten, Silben, Anlaute, Reime).
- **Rechen- und Vergleichszeichen** werden fürs Vorlesen ausgeschrieben
  („4 < 9“ → „4 ist kleiner als 9“); Uhrzeiten bleiben unberührt.
- **Dichte Zahlenstrahlen** (0–20 in Einerschritten) beschriften nur
  Fünfer und die Nachbarn der Lücke.
- **Kennenlern-Runde** zeigt jetzt Bilder und Zahlenblöcke der Aufgaben
  (vorher nur Text) – nötig für Anlaute und Zwanzigerfeld.

## Was dem Bauenden überlassen bleibt

- Wortlisten (mit Silben, Artikel, Mehrzahl, Emoji-Bild) – gepflegt in
  `src/calc/aufgaben/woerter12.js`; Auswahl aus dem Grundwortschatz der
  Klassen 1/2 (Tiere, Familie, Schule, Essen, Körper, Natur).
- Exakte Generator-Parameter (Mischung mit/ohne Zehnerübergang je Stufe).
- Zeichen „speaker“ im eigenen Zeichensatz.
- Reihenfolge der Bereiche in den Gruppen für 1/2 (Deutsch bekommt
  Gruppen „Hören & Laute“, „Lesen“, „Wörter“, „Sätze“; Mathe bleibt flach).

## Etappen und Versionen

| Etappe | Version | Inhalt | PR |
|---|---|---|---|
| 1 | 0.86.0 | Leak-Fix + Modul-Schalter + Kommentare ohne Namen | eigener PR, sofort |
| 2 | 0.87.0 | Klassen-Modell, Klasse 1 (13 Bereiche), Vorlesen, Kennenlern-Runde K1, Spiele-Fragen K1 | eigener PR |
| 3 | 0.88.0 | Klasse 2 (20 Bereiche), Kennenlern-Runde K2, Spiele-Fragen K2 | eigener PR |
