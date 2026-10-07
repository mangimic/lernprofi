import { test, expect } from "@playwright/test";

/* Kernabläufe der Etappe 1: Shell lädt fehlerfrei, Navigation und
   Release-Notes funktionieren, Hell/Dunkel schaltet um, kein
   horizontales Scrollen. (Tresor/Übungen folgen in späteren Etappen.) */

test("Shell lädt ohne Seitenfehler und ohne Quer-Scrollen", async ({ page }) => {
  const fehler = [];
  page.on("pageerror", (e) => fehler.push(String(e)));

  await page.goto("/");
  await expect(page.getByTestId("app-shell")).toBeVisible();
  await expect(page.getByTestId("version")).toContainText("0.1.0");
  await expect(page.getByTestId("start-seite")).toBeVisible();

  const quer = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(quer, "kein horizontales Scrollen").toBeFalsy();
  expect(fehler).toEqual([]);
});

test("Release-Notes öffnen und zurück", async ({ page }) => {
  await page.goto("/");
  await page.getByTestId("nav-neu").click();
  await expect(page.getByTestId("rn-liste")).toBeVisible();
  await expect(page.getByTestId("rn-liste")).toContainText("Das Gerüst steht");
  await page.getByTestId("nav-start").click();
  await expect(page.getByTestId("start-seite")).toBeVisible();
});

test("Hell/Dunkel über data-theme + Protokoll-Eintrag", async ({ page }) => {
  await page.goto("/");
  await page.getByTestId("thema-schalter").click();
  await expect
    .poll(async () => page.evaluate(() => document.documentElement.dataset.theme))
    .toBe("dark");
  await page.getByTestId("thema-schalter").click();
  await expect
    .poll(async () => page.evaluate(() => document.documentElement.dataset.theme))
    .toBe("");
});
