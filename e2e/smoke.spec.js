import { test, expect } from "@playwright/test";

/* Kernabläufe der Etappe 2: Tresor anlegen, mit Lern-PIN und mit
   Eltern-Passwort entsperren, PIN-Fehler, Elternbereich, Sperren –
   dazu die Etappe-1-Abläufe (Navigation, Release-Notes, Hell/Dunkel,
   kein horizontales Scrollen, keine Seitenfehler).
   Zugangsdaten sind fiktive Testwerte. */

const PW = "test-eltern-passwort";
const PIN = "1234";

async function tresorAnlegen(page) {
  await page.goto("/");
  await expect(page.getByTestId("gate-einrichten")).toBeVisible();
  await page.getByTestId("einr-pw1").fill(PW);
  await page.getByTestId("einr-pw2").fill(PW);
  await page.getByTestId("einr-pin1").fill(PIN);
  await page.getByTestId("einr-pin2").fill(PIN);
  await page.getByTestId("einr-ok").click();
  await expect(page.getByTestId("start-seite")).toBeVisible({ timeout: 20000 });
}

test("Tresor anlegen, Kind entsperrt nach Neustart selbständig per PIN", async ({ page }) => {
  const fehler = [];
  page.on("pageerror", (e) => fehler.push(String(e)));

  await tresorAnlegen(page);
  // Nach der Einrichtung sind die Eltern angemeldet (eigener Eltern-Tab)
  await expect(page.getByTestId("nav-eltern")).toBeVisible();
  await expect(page.getByTestId("version")).toContainText(/Version \d+\.\d+\.\d+/);

  // Einstellung ändern (Dunkel) – muss den Neustart überleben
  await page.getByTestId("thema-schalter").click();
  await expect
    .poll(async () => page.evaluate(() => document.documentElement.dataset.theme))
    .toBe("dark");

  // Neustart: Gate erscheint, falsche PIN meldet sich freundlich
  await page.reload();
  await expect(page.getByTestId("gate-entsperren")).toBeVisible();
  await page.getByTestId("pin-eingabe").fill("9999");
  await page.getByTestId("pin-ok").click();
  await expect(page.getByTestId("gate-fehler")).toBeVisible();

  // Richtige PIN: Kind-Modus (kein Elternbereich), Einstellung ist zurück
  await page.getByTestId("pin-eingabe").fill(PIN);
  await page.getByTestId("pin-ok").click();
  await expect(page.getByTestId("start-seite")).toBeVisible({ timeout: 20000 });
  await expect(page.getByTestId("nav-eltern")).toHaveCount(0);
  await expect
    .poll(async () => page.evaluate(() => document.documentElement.dataset.theme))
    .toBe("dark");

  const quer = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(quer, "kein horizontales Scrollen").toBeFalsy();
  expect(fehler).toEqual([]);
});

test("Eltern-Zugang mit Passwort: Eltern-Tab, Import aus der Alt-App, Sperren", async ({ page }) => {
  await tresorAnlegen(page);
  await page.reload();
  await expect(page.getByTestId("gate-entsperren")).toBeVisible();
  await page.getByTestId("eltern-zugang").click();
  await page.getByTestId("pw-eingabe").fill(PW);
  await page.getByTestId("pw-ok").click();
  await expect(page.getByTestId("start-seite")).toBeVisible({ timeout: 20000 });

  // Eltern-Tab öffnen, Tagesziel umstellen
  await page.getByTestId("nav-eltern").click();
  await expect(page.getByTestId("eltern-karte")).toBeVisible();
  await page.getByTestId("ziel-3").click();

  // Alt-App-Export einspielen → Bericht + übernommene Werte
  const dateiWahl = page.waitForEvent("filechooser");
  await page.getByTestId("import-knopf").click();
  (await dateiWahl).setFiles("e2e/fixtures/alt-export.json");
  await expect(page.getByTestId("import-bericht")).toBeVisible();
  await expect(page.getByTestId("import-bericht")).toContainText("Münzen");
  await expect(page.getByTestId("import-bericht")).toContainText("stimmPaket");
  await page.getByTestId("nav-start").click();
  await expect(page.getByTestId("tages-stand")).toContainText("7 Münzen");

  // Sperren → Gate; Kind-Entsperrung sieht KEINEN Eltern-Tab, Daten sind da
  await page.getByTestId("nav-eltern").click();
  await page.getByTestId("sperren-knopf").click();
  await expect(page.getByTestId("gate-entsperren")).toBeVisible();
  await page.getByTestId("pin-eingabe").fill(PIN);
  await page.getByTestId("pin-ok").click();
  await expect(page.getByTestId("start-seite")).toBeVisible({ timeout: 20000 });
  await expect(page.getByTestId("nav-eltern")).toHaveCount(0);
  await expect(page.getByTestId("tages-stand")).toContainText("7 Münzen");
});

test("Release-Notes öffnen und zurück", async ({ page }) => {
  await tresorAnlegen(page);
  await page.getByTestId("nav-neu").click();
  await expect(page.getByTestId("rn-liste")).toBeVisible();
  await expect(page.getByTestId("rn-liste")).toContainText("Üben ist da");
  await page.getByTestId("nav-start").click();
  await expect(page.getByTestId("start-seite")).toBeVisible();
});

test("Übungsrunde Mathe: 10 Aufgaben, Münze, Stufe 3 freigeschaltet", async ({ page }) => {
  await tresorAnlegen(page);
  await page.getByTestId("zum-ueben").click();
  await expect(page.getByTestId("ueben-bereiche")).toBeVisible();
  await page.getByTestId("ueben-fach-mathe").click();
  await page.getByTestId("bereich-mrechnen").click();
  await expect(page.getByTestId("frage-karte")).toBeVisible();

  // 10 Aufgaben richtig beantworten (fehlerfreie Runde)
  for (let i = 0; i < 10; i++) {
    await page.locator('[data-test="antwort-opt"][data-richtig="1"]').click();
    await expect(page.getByTestId("feedback")).toContainText("Richtig");
    await page.getByTestId("weiter-knopf").click();
  }
  await expect(page.getByTestId("runde-ergebnis")).toBeVisible();
  await expect(page.getByTestId("runde-ergebnis")).toContainText("10 von 10");
  // Klasse 4 ist Standard und startet auf Stufe 2 → fehlerfrei schaltet Stufe 3 frei
  await expect(page.getByTestId("runde-ergebnis")).toContainText("Stufe 3 ist freigeschaltet");

  // Start zeigt den neuen Stand (1 Münze, 2 Missionen)
  await page.getByTestId("nav-start").click();
  await expect(page.getByTestId("tages-stand")).toContainText("1 Münze");
  await expect(page.getByTestId("tages-stand")).toContainText("2 Mini-Missionen");
});

test("Sachkunde-Runde zählt falsch beantwortete Aufgaben nicht als gelöst", async ({ page }) => {
  await tresorAnlegen(page);
  await page.getByTestId("zum-ueben").click();
  await page.getByTestId("ueben-fach-sachkunde").click();
  await page.getByTestId("bereich-srad").click();
  await expect(page.getByTestId("frage-karte")).toBeVisible();
  // Erste Aufgabe absichtlich falsch, Rest richtig
  await page.locator('[data-test="antwort-opt"]:not([data-richtig])').first().click();
  await expect(page.getByTestId("feedback")).toContainText("Richtig ist");
  await page.getByTestId("weiter-knopf").click();
  for (let i = 0; i < 9; i++) {
    await page.locator('[data-test="antwort-opt"][data-richtig="1"]').click();
    await page.getByTestId("weiter-knopf").click();
  }
  await expect(page.getByTestId("runde-ergebnis")).toContainText("9 von 10");
  // mit Fehler: keine neue Stufe, aber die Münze für die Runde gibt es
  await expect(page.getByTestId("runde-ergebnis")).not.toContainText("freigeschaltet");
  await expect(page.getByTestId("runde-ergebnis")).toContainText("+1 Münze");
});

test("Deutsch: dass/das-Frage hat genau 2 Antworten, Stark mit Leo ist da", async ({ page }) => {
  await tresorAnlegen(page);
  await page.getByTestId("zum-ueben").click();
  // Deutsch ist der Standard-Tab
  await expect(page.getByTestId("bereich-gesch")).toBeVisible();
  await page.getByTestId("bereich-dd").click();
  await expect(page.getByTestId("frage-karte")).toBeVisible();
  await expect(page.getByTestId("frage-text")).toContainText("___");
  await expect(page.locator('[data-test="antwort-opt"]')).toHaveCount(2);
  await page.locator('[data-test="antwort-opt"][data-richtig="1"]').click();
  await expect(page.getByTestId("feedback")).toContainText("Richtig");
  // Stark-Tab
  await page.getByTestId("abbrechen").click();
  await page.getByTestId("ueben-fach-stark").click();
  await page.getByTestId("bereich-stark").click();
  await expect(page.getByTestId("frage-karte")).toBeVisible();
});

test("Wörter antippen: Subjekt finden, Lösung wird markiert", async ({ page }) => {
  await tresorAnlegen(page);
  await page.getByTestId("zum-ueben").click();
  await page.getByTestId("bereich-subj").click();
  await expect(page.getByTestId("frage-karte")).toBeVisible();
  await expect(page.getByTestId("frage-text")).toContainText(/Wer oder was/);

  // Richtig: alle Ziel-Wörter antippen → Prüfen → Richtig
  const ziele = page.locator('[data-test="wort-chip"][data-ziel="1"]');
  const n = await ziele.count();
  expect(n).toBeGreaterThanOrEqual(1);
  for (let i = 0; i < n; i++) await ziele.nth(i).click();
  await page.getByTestId("pruefen-knopf").click();
  await expect(page.getByTestId("feedback")).toContainText("Richtig");
  await page.getByTestId("weiter-knopf").click();

  // Falsch: nur ein Nicht-Ziel-Wort antippen → Lösung mit Tipp
  await page.locator('[data-test="wort-chip"]:not([data-ziel])').first().click();
  await page.getByTestId("pruefen-knopf").click();
  await expect(page.getByTestId("feedback")).toContainText("Die Lösung ist");
});

test("Neue Deutsch-Bereiche: Zeitformen (3 Optionen) und Grundwortschatz mit Regel", async ({ page }) => {
  await tresorAnlegen(page);
  await page.getByTestId("zum-ueben").click();
  await page.getByTestId("bereich-zeit").click();
  await expect(page.getByTestId("frage-text")).toContainText("Zeitform");
  await expect(page.locator('[data-test="antwort-opt"]')).toHaveCount(3);
  await page.getByTestId("abbrechen").click();
  await page.getByTestId("bereich-gws").click();
  await expect(page.getByTestId("frage-karte")).toContainText("Regel:");
  await page.locator('[data-test="antwort-opt"][data-richtig="1"]').click();
  await expect(page.getByTestId("feedback")).toContainText("Richtig");
});

test("Spielhalle: ohne Münze gesperrt, mit Münze kostet der Besuch genau eine", async ({ page }) => {
  await tresorAnlegen(page);
  // Ohne Münze: Spiel gesperrt
  await page.getByTestId("nav-spiele").click();
  await expect(page.getByTestId("spielhalle-muenzen")).toHaveText("0");
  await expect(page.getByTestId("spiel-see")).toBeDisabled();

  // Eine Übungsrunde → 1 Münze (schnellste: dass/das mit 10 Fragen)
  await page.getByTestId("nav-ueben").click();
  await page.getByTestId("bereich-dd").click();
  for (let i = 0; i < 10; i++) {
    await page.locator('[data-test="antwort-opt"][data-richtig="1"]').click();
    await page.getByTestId("weiter-knopf").click();
  }
  await expect(page.getByTestId("runde-ergebnis")).toBeVisible();

  // Spielbesuch: Münze wird eingelöst, Spiel läuft, Ergebnis mit Punkten
  await page.getByTestId("nav-spiele").click();
  await expect(page.getByTestId("spielhalle-muenzen")).toHaveText("1");
  await page.getByTestId("spiel-see").click();
  await expect(page.getByTestId("see-spiel")).toBeVisible();
  for (let i = 0; i < 10; i++) {
    await page.locator('[data-test="spiel-opt"][data-richtig="1"]').click();
    await expect(page.getByTestId("spiel-feedback")).toContainText("gefangen");
    await page.getByTestId("spiel-weiter").click();
  }
  await expect(page.getByTestId("see-ergebnis")).toBeVisible();
  await expect(page.getByTestId("see-ergebnis")).toContainText("Neuer Rekord");
  await page.getByTestId("spiel-nochmal").click();
  await expect(page.getByTestId("spielhalle-muenzen")).toHaveText("0");
  await expect(page.getByTestId("spiel-see")).toBeDisabled();
});
