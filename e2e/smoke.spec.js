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
  // Nach der Einrichtung sind die Eltern angemeldet
  await expect(page.getByTestId("eltern-karte")).toBeVisible();
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
  await expect(page.getByTestId("eltern-karte")).toHaveCount(0);
  await expect
    .poll(async () => page.evaluate(() => document.documentElement.dataset.theme))
    .toBe("dark");

  const quer = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(quer, "kein horizontales Scrollen").toBeFalsy();
  expect(fehler).toEqual([]);
});

test("Eltern-Zugang mit Passwort: Elternbereich sichtbar, Sperren sperrt", async ({ page }) => {
  await tresorAnlegen(page);
  await page.reload();
  await expect(page.getByTestId("gate-entsperren")).toBeVisible();
  await page.getByTestId("eltern-zugang").click();
  await page.getByTestId("pw-eingabe").fill(PW);
  await page.getByTestId("pw-ok").click();
  await expect(page.getByTestId("start-seite")).toBeVisible({ timeout: 20000 });
  await expect(page.getByTestId("eltern-karte")).toBeVisible();
  await expect(page.getByTestId("export-knopf")).toBeVisible();
  await page.getByTestId("sperren-knopf").click();
  await expect(page.getByTestId("gate-entsperren")).toBeVisible();
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
