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

  // Geräte-Abgleich: ohne Worker-API zeigt die Karte einen klaren Status (kein Crash)
  await expect(page.getByTestId("eltern-sync")).toBeVisible();
  await expect(page.getByTestId("eltern-sync")).not.toContainText("Prüfe Verbindung", { timeout: 10000 });

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

test("Spielhalle: Münze einlösen und im echten See-Abenteuer einen Fisch fangen", async ({ page }) => {
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

  // Spielbesuch: Münze wird eingelöst, das ORIGINAL-Spiel startet
  await page.getByTestId("nav-spiele").click();
  await expect(page.getByTestId("spielhalle-muenzen")).toHaveText("1");
  await page.getByTestId("spiel-see").click();
  await expect(page.getByTestId("see-spiel")).toBeVisible();
  await expect(page.getByTestId("spiel-korb")).toContainText("0 / 5");
  await page.evaluate(() => { window.__SPIEL_SCHNELL__ = true; });

  // Angelplatz antippen → Figur läuft hin, wirft aus, Frage erscheint
  await page.locator('[data-test="spiel-spot"]').first().click();
  await expect(page.getByTestId("spiel-frage")).toBeVisible({ timeout: 15000 });

  // Fisch fangen (große Fische brauchen bis zu 3 richtige Antworten)
  for (let versuch = 0; versuch < 4; versuch++) {
    await page.locator('[data-test="spiel-opt"][data-richtig="1"]').click();
    const weiter = page.getByTestId("spiel-weiter");
    await expect(weiter).toBeEnabled({ timeout: 10000 });
    const text = await weiter.textContent();
    await weiter.click();
    if (text.includes("Weiter angeln")) break;
    await expect(page.getByTestId("spiel-frage")).toBeVisible({ timeout: 15000 });
  }
  await expect(page.getByTestId("spiel-korb")).toContainText("1 / 5");

  // Verlassen: Münze bleibt eingelöst, Spiel wieder gesperrt
  await page.getByTestId("spiel-abbrechen").click();
  await expect(page.getByTestId("spielhalle-muenzen")).toHaveText("0");
  await expect(page.getByTestId("spiel-see")).toBeDisabled();
});

test("Blockwelt: Block verdienen (streng bei Fehlern), setzen und abbauen", async ({ page }) => {
  await tresorAnlegen(page);
  // 1 Münze verdienen
  await page.getByTestId("zum-ueben").click();
  await page.getByTestId("bereich-dd").click();
  for (let i = 0; i < 10; i++) {
    await page.locator('[data-test="antwort-opt"][data-richtig="1"]').click();
    await page.getByTestId("weiter-knopf").click();
  }
  await expect(page.getByTestId("runde-ergebnis")).toBeVisible();
  await page.getByTestId("nav-spiele").click();
  await page.getByTestId("spiel-blockwelt").click();
  await expect(page.getByTestId("blockwelt")).toBeVisible();
  await page.evaluate(() => { window.__SPIEL_SCHNELL__ = true; });

  // Falsche Antwort: alle gesperrt + Countdown (Anti-Schummel wie im Original)
  await page.getByTestId("bw-verdienen").click();
  await expect(page.getByTestId("bw-frage")).toBeVisible();
  await page.locator('[data-test="spiel-opt"]:not([data-richtig])').first().click();
  await expect(page.getByTestId("bw-feedback")).toContainText("Noch nicht");
  await expect(page.locator('[data-test="spiel-opt"]').first()).toBeDisabled();
  const weiter = page.getByTestId("bw-weiter");
  await expect(weiter).toBeEnabled({ timeout: 10000 }); // Countdown läuft im Zeitraffer ab
  await weiter.click();

  // Richtige Antwort: Blöcke ins Inventar, Zähler steigt
  await page.locator('[data-test="spiel-opt"][data-richtig="1"]').click();
  await expect(page.getByTestId("bw-feedback")).toContainText("Du bekommst");
  await expect(page.getByTestId("bw-verdient")).toContainText("3 Blöcke verdient");
  await page.getByTestId("bw-weiter").click();

  // Block setzen (erste freie Zelle) und wieder abbauen
  const volleVorher = await page.locator(".bw-zelle.voll").count();
  await page.locator(".bw-zelle:not(.voll)").first().click();
  await expect(page.locator(".bw-zelle.voll")).toHaveCount(volleVorher + 1);
  await page.locator("#bwAbbau").click();
  await page.locator(".bw-zelle.voll").first().click();
  await expect(page.locator(".bw-zelle.voll")).toHaveCount(volleVorher);

  // Werkstatt öffnet mit Meilenstein-Hinweis
  await page.getByTestId("bw-werkstatt-auf").click();
  await expect(page.getByTestId("bw-werkstatt")).toContainText("Werkstatt");
});

test("Konzentration: Zahlenkette wächst nach fehlerfreiem Aufsagen, ABC zählt Stolperer", async ({ page }) => {
  await tresorAnlegen(page);
  await page.getByTestId("zum-konz").click();
  await expect(page.getByTestId("konz")).toBeVisible();

  // 🔢 Zahlenkette: Merkphase in Echtzeit (2 Zahlen), dann korrekt eintippen
  await page.getByTestId("konz-tab-zahlen").click();
  await expect(page.getByTestId("kette-stand")).toContainText("2 von 7");
  await page.getByTestId("kette-start").click();
  await expect(page.getByTestId("konz")).toContainText("Zahl 1 von 2");
  const z1 = (await page.getByTestId("kette-zahl").innerText()).trim();
  await expect(page.getByTestId("konz")).toContainText("Zahl 2 von 2", { timeout: 6000 });
  const z2 = (await page.getByTestId("kette-zahl").innerText()).trim();
  await expect(page.getByTestId("kette-ok")).toBeVisible({ timeout: 6000 });
  for (const zahl of [z1, z2]) {
    for (const ziffer of zahl) await page.getByTestId(`kette-z-${ziffer}`).click();
    await page.getByTestId("kette-ok").click();
  }
  // Fehlerfrei → Kette wächst heute um eine Zahl (3 von 7)
  await expect(page.getByTestId("kette-gewachsen")).toContainText("3 von 7");

  // 🔤 Alphabet-Sprünge (jeder 2. vorwärts): 1 falscher Tipp, dann alle 13 richtig
  await page.getByTestId("konz-tab-abc").click();
  await expect(page.getByTestId("abc-info")).toContainText("Der erste Buchstabe ist");
  const taste = (b) => page.locator(`[data-test="abc-taste"][data-b="${b}"]`);
  await taste("B").click(); // falsch – zählt als Stolperer
  await expect(page.getByTestId("abc-info")).toContainText("jeder 2.");
  for (const b of "ACEGIKMOQSUWY") await taste(b).click();
  await expect(page.getByTestId("abc-fertig")).toContainText("alle 13 Buchstaben");
  await expect(page.getByTestId("abc-fertig")).toContainText("1 kleinen Stolperern");
});

test("Konzentration: Blitzlesen-Runde im Zeitraffer + Mut-Satz des Tages bleibt", async ({ page }) => {
  await tresorAnlegen(page);

  // 🦁 Mut-Satz wählen: danach gehört er dem Tag (keine Auswahl mehr)
  await expect(page.getByTestId("mut-satz-wahl").first()).toBeVisible();
  await page.getByTestId("mut-satz-wahl").nth(2).click();
  await expect(page.getByTestId("mut-satz-heute")).toContainText("Fehler machen");
  await expect(page.getByTestId("mut-satz-wahl")).toHaveCount(0);

  // ⚡ Blitzlesen: 60 Sekunden laufen im Zeitraffer ab, letztes Wort antippen
  await page.getByTestId("zum-konz").click();
  await page.evaluate(() => { window.__SPIEL_SCHNELL__ = true; });
  await page.getByTestId("konz-tab-blitz").click();
  await page.getByTestId("blitz-start").click();
  await expect(page.getByTestId("blitz-uhr")).toBeVisible();
  await expect(page.getByTestId("blitz-stopp")).toBeVisible({ timeout: 20000 });
  await page.locator('button[data-test="blitz-wort"]').nth(24).click();
  await expect(page.getByTestId("blitz-ergebnis")).toContainText("25 Wörter in 1 Minute");
  await page.locator("#blitzWeiter").click();
  await expect(page.getByTestId("konz")).toContainText("Runde 1: 25");

  // Neustart: PIN entsperren – Mut-Satz und Blitz-Runde liegen im Tresor
  await page.reload();
  await page.getByTestId("pin-eingabe").fill(PIN);
  await page.getByTestId("pin-ok").click();
  await expect(page.getByTestId("mut-satz-heute")).toContainText("Fehler machen");
  await page.getByTestId("zum-konz").click();
  await page.getByTestId("tf-skip").click(); // Tagesform-Frage (erste Lerneinheit als Kind)
  await page.getByTestId("konz-tab-blitz").click();
  await expect(page.getByTestId("konz")).toContainText("Runde 1: 25");
  await page.getByTestId("konz-zurueck").click();
  await expect(page.getByTestId("start-seite")).toBeVisible();
});

async function muenzeVerdienen(page) {
  await page.getByTestId("nav-ueben").click();
  await page.getByTestId("bereich-dd").click();
  for (let i = 0; i < 10; i++) {
    await page.locator('[data-test="antwort-opt"][data-richtig="1"]').click();
    await page.getByTestId("weiter-knopf").click();
  }
  await expect(page.getByTestId("runde-ergebnis")).toBeVisible();
  await page.getByTestId("nav-spiele").click();
}

test("Tennis-Match: Mutmacher-Rollenspiel, 2 Gewinnspiele, Auswertung zählt", async ({ page }) => {
  await tresorAnlegen(page);
  await muenzeVerdienen(page);
  await page.evaluate(() => { window.__SPIEL_SCHNELL__ = true; });
  await page.getByTestId("spiel-tennis").click();

  // Coach Leo: erst alle Blasen aufdecken, Mut-Satz-Blase selbst antippen
  await expect(page.getByTestId("tennis-start")).toBeDisabled();
  await page.getByTestId("mut-weiter").click();
  await page.getByTestId("mut-weiter").click();
  await page.locator(".bubble.sag").click();
  await expect(page.getByTestId("tennis-start")).toBeEnabled();
  await page.getByTestId("tennis-start").click();

  const ballSpielen = async (erwartet) => {
    await page.locator('[data-test="spiel-opt"][data-richtig="1"]').click();
    await expect(page.getByTestId("tennis-feedback")).toContainText(erwartet);
    await page.getByTestId("tennis-weiter").click();
  };
  // Spiel 1: 4 Punkte in Folge (15–30–40–Spiel)
  await ballSpielen("15 : 0");
  await ballSpielen("30 : 0");
  await ballSpielen("40 : 0");
  await ballSpielen("Punkt für dich");
  await expect(page.getByTestId("tennis-spielende")).toContainText("Spiele 1 : 0");
  await page.getByTestId("tennis-weiter").click();
  // Spiel 2 (ab jetzt schwere Fragen) → Match gewonnen
  for (let i = 0; i < 4; i++) await ballSpielen("Punkt für dich");
  await expect(page.getByTestId("tennis-ende")).toContainText("Match gewonnen");
  await page.getByTestId("tennis-fertig").click();
  await expect(page.getByTestId("match-ergebnis")).toContainText("8 von 8");
});

test("Fußball-Match: Konter bei Fehler, Halbzeit, Match-Ende mit Auswertung", async ({ page }) => {
  await tresorAnlegen(page);
  await muenzeVerdienen(page);
  await page.evaluate(() => { window.__SPIEL_SCHNELL__ = true; });
  await page.getByTestId("spiel-fussball").click();
  await page.getByTestId("mut-weiter").click();
  await page.getByTestId("mut-weiter").click();
  await page.locator(".bubble.sag").click();
  await page.getByTestId("fb-start").click();

  // Torchance 1 absichtlich falsch → Konter-Tor + Mutmacher
  await page.locator('[data-test="spiel-opt"]:not([data-richtig])').first().click();
  await expect(page.getByTestId("fb-feedback")).toContainText("Gehalten");
  await expect(page.locator(".mut-dialog .bubble.coach").last()).toBeVisible();
  await page.getByTestId("fb-weiter").click();
  // Chancen 2–5: Tore
  for (let i = 0; i < 4; i++) {
    await page.locator('[data-test="spiel-opt"][data-richtig="1"]').click();
    await expect(page.getByTestId("fb-feedback")).toContainText("TOOOR");
    await page.getByTestId("fb-weiter").click();
  }
  await expect(page.getByTestId("fb-halbzeit")).toContainText("4 : 1");
  await page.getByTestId("fb-weiter").click();
  // 2. Halbzeit: 5 Tore → kein Gleichstand, direkt zum Ende
  for (let i = 0; i < 5; i++) {
    await page.locator('[data-test="spiel-opt"][data-richtig="1"]').click();
    await page.getByTestId("fb-weiter").click();
  }
  await expect(page.getByTestId("fb-ende")).toContainText("Match gewonnen");
  await page.getByTestId("fb-fertig").click();
  await expect(page.getByTestId("match-ergebnis")).toContainText("9 von 10");
});

test("Schach: Schule spielt Züge vor, Taktik-Aufgabe, echter Zug gegen den Computer", async ({ page }) => {
  await tresorAnlegen(page);
  await muenzeVerdienen(page);
  await page.evaluate(() => { window.__SPIEL_SCHNELL__ = true; });
  await page.getByTestId("spiel-schach").click();

  // 🎓 Schule: Lektion 1 (Spanische Eröffnung) Schritt für Schritt
  await expect(page.getByTestId("sch-lek-text")).toBeVisible();
  await page.getByTestId("sch-lek-weiter").click();
  await expect(page.getByTestId("sch-lek-text")).toContainText("e4");
  await page.getByTestId("sch-lek-weiter").click();

  // 🧩 Aufgaben: falsches Feld → Tipp, richtiges Feld (b5) → weiter zu 2/10
  await page.getByTestId("sch-tab-aufgaben").click();
  await expect(page.getByTestId("sch-auf-stand")).toContainText("1 / 10");
  await page.locator('[data-feld="0"]').click();
  await expect(page.getByTestId("sch-auf-tipp")).toBeVisible();
  await page.locator('[data-feld="25"]').click(); // b5
  await expect(page.getByTestId("sch-auf-ok")).toBeVisible();
  await page.getByTestId("sch-auf-weiter").click();
  await expect(page.getByTestId("sch-auf-stand")).toContainText("2 / 10");

  // 🤖 Spielen: e2–e4, der Computer antwortet (im Zeitraffer)
  await page.getByTestId("sch-tab-spielen").click();
  await expect(page.getByTestId("sch-status")).toContainText("Du bist dran");
  await page.locator('[data-feld="52"]').click(); // Bauer e2 wählen
  await expect(page.locator('[data-feld="36"].ziel')).toBeVisible(); // e4 als Ziel markiert
  await page.locator('[data-feld="36"]').click();
  await expect(page.getByTestId("sch-status")).toContainText("Du bist dran", { timeout: 10000 });
  await expect(page.getByTestId("sch-undo")).toBeEnabled();

  // 💡 Tipp markiert einen Zug, ↩️ Zug zurück stellt die Startstellung wieder her
  await page.getByTestId("sch-tipp").click();
  await expect(page.locator(".sch-feld.mark").first()).toBeVisible();
  await page.getByTestId("sch-undo").click();
  await expect(page.locator('[data-feld="52"]')).toHaveText(/♙/);
});

test("Satzglieder umstellen: Umstellprobe mit Regel-Feedback und Zeit/Ort-Erkennung", async ({ page }) => {
  await tresorAnlegen(page);
  await page.getByTestId("nav-ueben").click();
  await page.getByTestId("bereich-satzglied").click();

  const chip = (i) => page.locator(`[data-test="um-chip"][data-i="${i}"]`);
  // Aufgabe 1: erst der Ausgangssatz (Fehlversuch), dann richtig umgestellt
  for (const i of [0, 1, 2, 3]) await chip(i).click();
  await expect(page.getByTestId("feedback")).toContainText("ANDERE Reihenfolge");
  for (const i of [3, 1, 0, 2]) await chip(i).click();
  await expect(page.getByTestId("feedback")).toContainText("Super umgestellt");
  await expect(page.getByTestId("um-bau")).toContainText("Im Zimmer hat Nico ein Aquarium.");
  await page.getByTestId("weiter-knopf").click();
  // Aufgaben 2–5 (Verb immer an Index 1): [2,1,0,3] ist stets eine gültige Umstellung
  for (let n = 0; n < 4; n++) {
    for (const i of [2, 1, 0, 3]) await chip(i).click();
    await expect(page.getByTestId("feedback")).toContainText("Super umgestellt");
    await page.getByTestId("weiter-knopf").click();
  }
  // Aufgabe 6 (Zeit/Ort ohne Ortsbestimmung): Zeit antippen, dann „Keine da!“
  const zo = (i) => page.locator(`[data-test="zo-chip"][data-i="${i}"]`);
  await zo(0).click();
  await expect(page.getByTestId("feedback")).toContainText("Zeitbestimmung");
  await page.getByTestId("zo-keine").click();
  await expect(page.getByTestId("feedback")).toContainText("KEINE Ortsbestimmung");
  await page.getByTestId("weiter-knopf").click();
  // Aufgaben 7–9: Zeit = Baustein 0, Ort = Baustein 3
  for (let n = 0; n < 3; n++) {
    await zo(0).click();
    await zo(3).click();
    await expect(page.getByTestId("feedback")).toContainText("Ortsbestimmung! 📍");
    await page.getByTestId("weiter-knopf").click();
  }
  // 8 von 9 gelöst (Aufgabe 1 hatte einen Fehlversuch)
  await expect(page.getByTestId("runde-ergebnis")).toContainText("8 von 9");
});

test("Vorgangsbeschreibung: Ablauf wählen, drei Spiele, Arbeitsblatt, Lösungs-Hürde, Selbst-Check", async ({ page }) => {
  await tresorAnlegen(page);
  await page.getByTestId("nav-ueben").click();
  await page.getByTestId("bereich-vorgang").click();
  await expect(page.getByTestId("vorgang")).toBeVisible();

  // 📋 Ablauf: Toast wählen und loslegen
  await page.locator('[data-test="vg-rezept"][data-key="toast"]').click();
  await page.getByTestId("vg-los").click();
  await page.getByTestId("vg-beispiel-knopf").click();
  await expect(page.getByTestId("vg-beispiel")).toContainText("Toast");

  // 🧩 Ordnen: ein Fehlversuch, dann alle 5 der Reihe nach
  await page.getByTestId("vg-utab-ordnen").click();
  await page.locator('[data-test="ord-schritt"][data-i="2"]').click();
  await expect(page.getByTestId("vg-feedback")).toContainText("Was muss vorher passieren");
  for (const i of [0, 1, 2, 3, 4]) await page.locator(`[data-test="ord-schritt"][data-i="${i}"]`).click();
  await expect(page.getByTestId("ord-ergebnis")).toContainText("4 von 5");

  // 🚦 Satzanfänge: 5 Sätze richtig (Mitte hat mehrere passende Anfänge)
  await page.getByTestId("vg-utab-anfang").click();
  for (let i = 0; i < 5; i++) {
    await page.locator('[data-test="anf-opt"][data-richtig="1"]').first().click();
    await expect(page.getByTestId("vg-feedback")).toContainText("Richtig");
    await page.getByTestId("anf-weiter").click();
  }
  await expect(page.getByTestId("anf-ergebnis")).toContainText("5 von 5");

  // 🧺 Zutaten-Check: genau die echten Zutaten einpacken → perfekt
  await page.getByTestId("vg-utab-zutaten").click();
  const echte = page.locator('[data-test="zut-karte"][data-echt="1"]');
  const n = await echte.count();
  for (let i = 0; i < n; i++) await echte.nth(i).click();
  await page.getByTestId("zut-pruefen").click();
  await expect(page.getByTestId("zut-ergebnis")).toContainText("Perfekt eingepackt");

  // 🖨️ Arbeitsblatt (Klasse 4: man-Form-Aufgabe)
  await page.getByTestId("vg-tab-blatt").click();
  await expect(page.getByTestId("vg-blatt")).toContainText("Vorgangsbeschreibung: Toast machen");
  await expect(page.getByTestId("vg-blatt")).toContainText("man-Form");

  // 🔑 Lösung erst nach der Fleiß-Hürde (3 Versuche + 3 Schritte)
  await page.getByTestId("vg-tab-loesung").click();
  await expect(page.getByTestId("vg-loesung-zeigen")).toBeDisabled();
  for (let i = 0; i < 3; i++) await page.getByTestId("vg-versuch").click();
  for (let i = 0; i < 3; i++) await page.getByTestId("vg-geschrieben").nth(i).check();
  await expect(page.getByTestId("vg-loesung-zeigen")).toBeEnabled();
  await page.getByTestId("vg-loesung-zeigen").click();
  await expect(page.getByTestId("vg-loesung")).toContainText("Zuerst nehme ich zwei Scheiben Toastbrot");

  // 🌸 Selbst-Check zählt mit
  await page.getByTestId("vg-tab-selbst").click();
  await page.getByTestId("selbst-inhalt").first().check();
  await page.getByTestId("selbst-form").last().check();
  await expect(page.getByTestId("selbst-stand")).toContainText("2 von 12");
});

test("Eltern-Werkzeuge: Spiel ausblenden, Münzen aus, Zeitlimit sperrt freundlich", async ({ page }) => {
  await tresorAnlegen(page); // nach der Einrichtung sind die Eltern angemeldet
  await page.getByTestId("nav-eltern").click();

  // ♟️ Schach ausblenden, 🪙 Münz-Freischaltung aus, 💬 Gespräche sichtbar
  await page.getByTestId("spiel-an-schach-0").click();
  await page.getByTestId("muenzen-aktiv-0").click();
  await expect(page.getByTestId("gespraech-tages")).toContainText("Frage des Tages");
  await expect(page.getByTestId("gespraech-bereich")).toHaveCount(4);

  // Spielhalle: Schach ist weg, Tennis startet ohne Münze
  await page.getByTestId("nav-spiele").click();
  await expect(page.getByTestId("spiel-schach")).toHaveCount(0);
  await expect(page.getByTestId("spielhalle")).toContainText("Freie Fahrt");
  await page.getByTestId("spiel-tennis").click();
  await expect(page.getByTestId("tennis-start")).toBeVisible();
  await page.getByTestId("spiel-abbrechen").click();

  // 🎁 3 Münzen schenken, ⏰ Tageslimit auf 10 Minuten
  await page.getByTestId("nav-eltern").click();
  await page.getByTestId("muenz-geschenk").click();
  await expect(page.getByTestId("muenz-geschenk")).toContainText("jetzt 3");
  await page.getByTestId("zeit-limit-10").click();
  await expect(page.getByTestId("zeit-verbraucht")).toContainText("von 10 Min");
  await page.waitForTimeout(600); // der verschlüsselte Tresor-Schreibvorgang läuft asynchron

  // Als Kind (PIN) mit Zeitraffer: nach „10 Minuten“ kommt der Stopp-Bildschirm
  await page.reload();
  await page.evaluate(() => { window.__ZEIT_SCHNELL__ = true; });
  await page.getByTestId("pin-eingabe").fill(PIN);
  await page.getByTestId("pin-ok").click();
  await expect(page.getByTestId("start-seite")).toBeVisible();
  await expect(page.getByTestId("tages-stand")).toContainText("⏰ noch");
  await expect(page.getByTestId("zeit-sperre")).toBeVisible({ timeout: 15000 });
  await expect(page.getByTestId("zeit-sperre")).toContainText("Lernzeit für heute ist geschafft");

  // Eltern melden sich mit Passwort an (kein Sperr-Schirm) und geben den Tag frei
  await page.getByTestId("zeit-eltern").click();
  await expect(page.getByTestId("gate-entsperren")).toBeVisible();
  await page.evaluate(() => { window.__ZEIT_SCHNELL__ = false; });
  await page.getByTestId("eltern-zugang").click();
  await page.getByTestId("pw-eingabe").fill(PW);
  await page.getByTestId("pw-ok").click();
  await expect(page.getByTestId("start-seite")).toBeVisible({ timeout: 20000 });
  await expect(page.getByTestId("zeit-sperre")).toHaveCount(0);
  await page.getByTestId("nav-eltern").click();
  await page.getByTestId("zeit-frei").click();
  await expect(page.getByTestId("zeit-verbraucht")).toContainText("0 Min von 10 Min");
});

test("Tagesform & Fokus: roter Tag macht Missionen kürzer, Bewegungspause kommt", async ({ page }) => {
  await tresorAnlegen(page); // Eltern-Modus: keine Tagesform-Frage
  await page.getByTestId("nav-eltern").click();
  await expect(page.getByTestId("eltern-lernen")).toBeVisible();
  await page.getByTestId("pausen-intervall-5").click();
  await page.getByTestId("zeit-limit-0").click(); // Time-Boxing aus, damit nur die Pause triggert
  await page.waitForTimeout(600); // asynchroner Tresor-Schreibvorgang

  // Als Kind: erste Lerneinheit → Tagesform-Frage → 🌧️ „Heute ist es schwer“
  await page.reload();
  await page.getByTestId("pin-eingabe").fill(PIN);
  await page.getByTestId("pin-ok").click();
  await page.getByTestId("nav-ueben").click();
  await expect(page.getByTestId("tagesform")).toContainText("Wie fühlt sich Lernen heute an?");
  await page.getByTestId("tf-rot").click();
  await expect(page.getByTestId("tagesform")).toHaveCount(0);

  // 10 Aufgaben fehlerfrei: rot → Missionen à 3 (=3 Missionen, Ziel 3 erreicht),
  // aber KEINE neue Stufe – dafür die 🔥 Fokus-Serie als Rekord
  await page.getByTestId("bereich-dd").click();
  for (let i = 0; i < 10; i++) {
    await page.locator('[data-test="antwort-opt"][data-richtig="1"]').click();
    await page.getByTestId("weiter-knopf").click();
  }
  await expect(page.getByTestId("runde-ergebnis")).toContainText("3 Mini-Missionen");
  await expect(page.getByTestId("runde-ergebnis")).toContainText("Tagesziel erreicht");
  await expect(page.getByTestId("runde-ergebnis")).not.toContainText("freigeschaltet");
  await expect(page.getByTestId("fokus-serie")).toContainText("10 Aufgaben am Stück");
  await expect(page.getByTestId("fokus-serie")).toContainText("dein Rekord");
  await page.waitForTimeout(600);

  // 🤸 Bewegungspause im Zeitraffer: nach „5 Minuten“ Fokuszeit beim Üben
  await page.reload();
  await page.evaluate(() => { window.__ZEIT_SCHNELL__ = true; });
  await page.getByTestId("pin-eingabe").fill(PIN);
  await page.getByTestId("pin-ok").click();
  await page.getByTestId("nav-ueben").click(); // Tagesform ist heute schon beantwortet
  await expect(page.getByTestId("fokus-pause")).toBeVisible({ timeout: 15000 });
  await expect(page.getByTestId("fokus-idee")).toContainText("🤸");
  await expect(page.getByTestId("pause-countdown")).toContainText("Pause"); // ⏳ 5-Minuten-Uhr läuft
  await page.getByTestId("fokus-weiter").click();
  await expect(page.getByTestId("fokus-pause")).toHaveCount(0);
});

test("Zahlenblöcke: Stellenwert-Aufgaben zeigen das Dienes-Material als Grafik", async ({ page }) => {
  await tresorAnlegen(page);
  await page.getByTestId("nav-ueben").click();
  await page.getByTestId("ueben-fach-mathe").click();
  await page.getByTestId("bereich-mzahlen").click();
  // Klasse 4 startet auf Stufe 2 (schwere Liste): Aufgaben 3-5 sind Blöcke-Aufgaben
  const bloeckeSvgs = [null, null, 20, 7, 13, null, null, null, null, null]; // 632 / 1240 / 2056
  for (let i = 0; i < 10; i++) {
    if (bloeckeSvgs[i] !== null) {
      await expect(page.getByTestId("zahlen-bloecke")).toBeVisible();
      await expect(page.locator('[data-test="zahlen-bloecke"] svg')).toHaveCount(bloeckeSvgs[i]);
    } else {
      await expect(page.getByTestId("zahlen-bloecke")).toHaveCount(0);
    }
    await page.locator('[data-test="antwort-opt"][data-richtig="1"]').click();
    await page.getByTestId("weiter-knopf").click();
  }
  await expect(page.getByTestId("runde-ergebnis")).toBeVisible();
});

test("Einstufungstest: adaptiv testen, Stufen einstellen, Trainingsplan führt zur Übung", async ({ page }) => {
  await tresorAnlegen(page);
  await page.getByTestId("einstufung-start").click();
  await page.getByTestId("einstufung-los").click();

  const richtig = async () => {
    await page.locator('[data-test="antwort-opt"][data-richtig="1"]').click();
    await page.getByTestId("weiter-knopf").click();
  };
  const falsch = async () => {
    await page.locator('[data-test="antwort-opt"]:not([data-richtig])').first().click();
    await page.getByTestId("weiter-knopf").click();
  };

  // Bereich 1 (Grundwortschatz): 2 leichte richtig → 2 schwere erscheinen; davon 1 falsch → Stufe 2
  await expect(page.getByTestId("einstufung-frage")).toContainText("🌱 leicht");
  await richtig(); await richtig();
  await expect(page.getByTestId("einstufung-frage")).toContainText("🔥 schwer");
  await richtig(); await falsch();
  // Bereich 2 (das/dass): 1 Fehler bei den leichten → Stufe 1, keine schweren
  await expect(page.getByTestId("einstufung-frage")).toContainText("Bereich 2 von 6");
  await falsch(); await richtig();
  // Bereiche 3–6: alles richtig → höchste Stufe
  for (let i = 0; i < 30; i++) {
    if (await page.getByTestId("einstufung-ergebnis").count()) break;
    await richtig();
  }
  await expect(page.getByTestId("einstufung-zeile")).toHaveCount(6);
  await expect(page.getByTestId("einstufung-ergebnis")).toContainText("das oder dass?");
  await expect(page.getByTestId("einstufung-ergebnis")).toContainText("Stufe 1 – hier zuerst üben");
  await expect(page.getByTestId("einstufung-ergebnis")).toContainText("Stufe 3 – Profi");

  // Übernehmen: Trainingsplan auf der Startseite, schwächstes Feld zuerst (dd vor gws)
  await page.getByTestId("einstufung-uebernehmen").click();
  await expect(page.getByTestId("trainingsplan")).toBeVisible();
  await expect(page.getByTestId("plan-feld")).toHaveCount(2);
  await expect(page.getByTestId("plan-feld").first()).toHaveAttribute("data-key", "dd");

  // Direkt-Knopf startet sofort die richtige Übung (Stufe 1 nach Einstufung)
  await page.getByTestId("plan-feld").first().click();
  await expect(page.getByTestId("frage-karte")).toContainText("das oder dass?");
  await expect(page.getByTestId("frage-karte")).toContainText("Stufe 1");
  await page.getByTestId("abbrechen").click();
  // 🎯-Abzeichen in der Bereichs-Wahl, Mathe nach Einstufung auf Stufe 3
  await expect(page.getByTestId("bereich-dd")).toContainText("🎯 empfohlen");
  await page.getByTestId("ueben-fach-mathe").click();
  await expect(page.getByTestId("bereich-mzahlen")).toContainText("Stufe 3");
});

test("KI-Erklärer: Eltern geben frei, Leo erklärt in getakteten Blasen mit Mach-Aufgabe", async ({ page }) => {
  // Der echte Worker läuft im Preview nicht – /api/ki/* wird gemockt.
  await page.route("**/api/ki/status", (route) => route.fulfill({ json: {
    verfuegbar: true, grund: null, monat: "2026-10", deckelCent: 500, maxDeckelCent: 1000,
    verbrauchtCent: 87, posten: [{ zweck: "erklaeren", cent: 0.03 }],
  } }));
  await page.route("**/api/ki/deckel", (route) => route.fulfill({ json: { deckelCent: 300 } }));
  await page.route("**/api/ki/erklaeren", (route) => route.fulfill({ json: {
    blasen: ["⚽ Fußball: Du gibst WEM? den Ball.", "Immer bei „wem?“ → der 3. Fall."],
    mach: "Frag LAUT: Wem gibt er den Ball?",
    kostenCent: 0.03, verbrauchtCent: 87.03, deckelCent: 500,
  } }));

  await tresorAnlegen(page);
  await page.getByTestId("nav-eltern").click();
  await expect(page.getByTestId("eltern-ki")).toBeVisible();
  await expect(page.getByTestId("ki-verbrauch")).toContainText("0,87 € von 5,00 €");
  await page.getByTestId("ki-erklaeren-1").click(); // 🦁 freigeben
  await page.getByTestId("ki-modell-opus").click(); // Modell-Wahl vorhanden
  await page.getByTestId("ki-deckel-300").click();

  // 🧪 Verbindungstest: nutzt den Erklär-Endpunkt und meldet Erfolg im Klartext
  await page.getByTestId("ki-test").click();
  await expect(page.getByTestId("ki-test-ergebnis")).toContainText("Leo hat geantwortet");

  // Üben: falsche Antwort → Erklär-Knopf → Blase 1 → selbst weitertippen → Blase 2 + Mach-Aufgabe
  await page.getByTestId("nav-ueben").click();
  await page.getByTestId("bereich-dd").click();
  await page.locator('[data-test="antwort-opt"]:not([data-richtig])').first().click();
  await page.getByTestId("ki-erklaer-knopf").click();
  await expect(page.getByTestId("ki-blase")).toHaveCount(1);
  await expect(page.getByTestId("ki-blase").first()).toContainText("WEM");
  await page.getByTestId("ki-weiter").click();
  await expect(page.getByTestId("ki-blase")).toHaveCount(2);
  await expect(page.getByTestId("ki-mach")).toContainText("LAUT");

  // Richtige Antwort: kein Erklär-Knopf
  await page.getByTestId("weiter-knopf").click();
  await page.locator('[data-test="antwort-opt"][data-richtig="1"]').click();
  await expect(page.getByTestId("ki-erklaer-knopf")).toHaveCount(0);
});

test("Schreib-Training: Satz des Tages, Foto → Leos Schrift-Blick, Schrift-Reise + Münze", async ({ page }) => {
  await page.route("**/api/ki/status", (route) => route.fulfill({ json: {
    verfuegbar: true, grund: null, monat: "2026-10", deckelCent: 500, maxDeckelCent: 1000,
    verbrauchtCent: 0, posten: [],
  } }));
  await page.route("**/api/ki/schrift", (route) => route.fulfill({ json: {
    sterne: ["Dein L steht kerzengerade – stark! ⭐", "Alle Wörter sitzen auf der Linie."],
    uebe: { buchstabe: "e", blase: "Das e ist manchmal zu eng." },
    mach: "Schreib das e RIESIG in die Luft!",
    kostenCent: 0.5, verbrauchtCent: 0.5, deckelCent: 500,
  } }));

  await tresorAnlegen(page);
  // Ohne Freigabe: Aufgabe sichtbar, Foto-Teil nur als Hinweis
  await page.getByTestId("zum-schrift").click();
  await expect(page.getByTestId("schrift-satz")).toContainText("„");
  await expect(page.getByTestId("schrift-freigabe-hinweis")).toBeVisible();
  await expect(page.getByTestId("schrift-foto")).toHaveCount(0);

  // Eltern geben den Schrift-Blick frei
  await page.getByTestId("nav-eltern").click();
  await page.getByTestId("ki-schrift-1").click();
  await page.getByTestId("nav-start").click();
  await page.getByTestId("zum-schrift").click();

  // Foto hochladen (Mini-PNG) → Sterne selbst getaktet → Übe-Buchstabe + Mach-Aufgabe
  const PNG = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAFklEQVR4nGP8z8Dwn4EIwESMolGFlCsEAGcTAxEDrri8AAAAAElFTkSuQmCC",
    "base64",
  );
  await page.getByTestId("schrift-foto").setInputFiles({ name: "blatt.png", mimeType: "image/png", buffer: PNG });
  await expect(page.getByTestId("schrift-stern")).toHaveCount(1);
  await page.getByTestId("schrift-weiter").click();
  await expect(page.getByTestId("schrift-stern")).toHaveCount(2);
  await expect(page.getByTestId("schrift-uebe")).toContainText("„e“");
  await expect(page.getByTestId("schrift-mach")).toContainText("RIESIG");

  // In die Schrift-Reise legen → Galerie-Eintrag + Münze; zweites Foto heute ohne neue Münze
  await page.getByTestId("schrift-speichern").click();
  await expect(page.getByTestId("reise-blatt")).toHaveCount(1);
  await expect(page.getByTestId("schrift-heute-fertig")).toBeVisible();

  // 👁️ Blatt antippen → Groß-Ansicht mit Bild öffnet und schließt wieder
  await page.getByTestId("reise-blatt").click();
  await expect(page.getByTestId("blatt-anzeige")).toBeVisible();
  await expect(page.getByTestId("blatt-anzeige").locator("img")).toBeVisible();
  await page.getByTestId("blatt-zu").click();
  await expect(page.getByTestId("blatt-anzeige")).toHaveCount(0);

  await page.getByTestId("schrift-zurueck").click();
  await expect(page.getByTestId("tages-stand")).toContainText("🪙 1 Münze");
});

test("Aufsatz-Check: Textart wählen, Foto → 2 Sterne + markierte Stelle + Mach-Aufgabe + Münze", async ({ page }) => {
  await page.route("**/api/ki/status", (route) => route.fulfill({ json: {
    verfuegbar: true, grund: null, monat: "2026-10", deckelCent: 500, maxDeckelCent: 1000,
    verbrauchtCent: 0, posten: [],
  } }));
  await page.route("**/api/ki/aufsatz", (route) => route.fulfill({ json: {
    sterne: ["Deine Reihenfolge stimmt – Schritt für Schritt! ⭐", "„Zuerst“ und „danach“ nutzt du super."],
    tipp: { stelle: "dann kommt das Wasser", blase: "Hier fehlt, WIE VIEL Wasser – sag es genau." },
    mach: "Lies die Stelle LAUT und ruf die Menge dazu!",
    kostenCent: 0.5, verbrauchtCent: 0.5, deckelCent: 500,
  } }));

  await tresorAnlegen(page);
  // Ohne Freigabe nur der Hinweis
  await page.getByTestId("zum-aufsatz").click();
  await expect(page.getByTestId("aufsatz-freigabe-hinweis")).toBeVisible();
  await expect(page.getByTestId("aufsatz-foto")).toHaveCount(0);

  // Eltern geben frei
  await page.getByTestId("nav-eltern").click();
  await page.getByTestId("ki-aufsatz-1").click();
  await page.getByTestId("nav-start").click();
  await page.getByTestId("zum-aufsatz").click();

  // Textart wählen + Foto hochladen
  await page.getByTestId("aufsatz-art-vorgang").click();
  const PNG = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAFklEQVR4nGP8z8Dwn4EIwESMolGFlCsEAGcTAxEDrri8AAAAAElFTkSuQmCC",
    "base64",
  );
  await page.getByTestId("aufsatz-foto").setInputFiles({ name: "aufsatz.png", mimeType: "image/png", buffer: PNG });
  await expect(page.getByTestId("aufsatz-stern")).toHaveCount(1);
  await page.getByTestId("aufsatz-weiter").click();
  await expect(page.getByTestId("aufsatz-stern")).toHaveCount(2);
  await expect(page.getByTestId("aufsatz-tipp")).toContainText("dann kommt das Wasser");
  await expect(page.getByTestId("aufsatz-mach")).toContainText("LAUT");

  // Fertig → Münze, nur 1× am Tag
  await page.getByTestId("aufsatz-fertig").click();
  await expect(page.getByTestId("aufsatz-heute-fertig")).toBeVisible();
  await page.getByTestId("aufsatz-zurueck").click();
  await expect(page.getByTestId("tages-stand")).toContainText("🪙 1 Münze");
});

test("Wochenbericht + persönliche Übungssätze: Eltern geben frei, prüfen und spielen ein", async ({ page }) => {
  await page.route("**/api/ki/status", (route) => route.fulfill({ json: {
    verfuegbar: true, grund: null, monat: "2026-10", deckelCent: 500, maxDeckelCent: 1000,
    verbrauchtCent: 0, posten: [],
  } }));
  await page.route("**/api/ki/bericht", (route) => route.fulfill({ json: {
    gut: ["4 von 5 Tagen das Tagesziel geschafft!", "Die 4 Fälle sind auf Stufe 2 geklettert."],
    beobachtung: "An roten Tagen liefen kurze Missionen besser.",
    tipps: ["Nach 2 Missionen eine Bewegungspause einbauen."],
    kostenCent: 0.5, verbrauchtCent: 0.5, deckelCent: 500,
  } }));
  await page.route("**/api/ki/saetze", (route) => route.fulfill({ json: {
    saetze: ["Mein Schlagzeug wummert durch das Haus.", "Die Pfadfinder bauen ein hohes Zelt.", "Beim Angeln bleibe ich ganz ruhig."],
    kostenCent: 0.3, verbrauchtCent: 0.8, deckelCent: 500,
  } }));

  await tresorAnlegen(page);
  await page.getByTestId("nav-eltern").click();
  // Ohne Freigabe nur Hinweise
  await expect(page.getByTestId("bericht-hinweis")).toBeVisible();
  await expect(page.getByTestId("saetze-hinweis")).toBeVisible();
  await page.getByTestId("ki-bericht-1").click();
  await page.getByTestId("ki-saetze-1").click();

  // 📊 Wochenbericht erstellen
  await page.getByTestId("bericht-knopf").click();
  await expect(page.getByTestId("bericht-ansicht")).toContainText("Tagesziel geschafft");
  await expect(page.getByTestId("bericht-ansicht")).toContainText("Bewegungspause");

  // 🔤 Sätze holen, einen abwählen, einspielen
  await page.getByTestId("saetze-woerter").fill("Schlagzeug, Pfadfinder, Angeln");
  await page.getByTestId("saetze-holen").click();
  await expect(page.getByTestId("satz-vorschlag")).toHaveCount(3);
  await page.getByTestId("satz-vorschlag").nth(2).locator("input").uncheck();
  await page.getByTestId("saetze-einspielen").click();
  await expect(page.getByTestId("eigene-saetze")).toContainText("Aktiv im Schreib-Training (2)");

  // Das Schreib-Training nutzt jetzt einen eigenen Satz
  await page.getByTestId("nav-start").click();
  await page.getByTestId("zum-schrift").click();
  await expect(page.getByTestId("schrift-eigene")).toBeVisible();
  await expect(page.getByTestId("schrift-satz")).toContainText(/Schlagzeug|Pfadfinder/);

  // Entfernen bringt die Welt-Sätze zurück
  await page.getByTestId("nav-eltern").click();
  await page.getByTestId("saetze-leeren").click();
  await expect(page.getByTestId("eigene-saetze")).toHaveCount(0);
});

test("Wochenplan: Termin, Bausteine per Antippen, 🦁-Wächter-Ampel, Plan überlebt Neustart", async ({ page }) => {
  await tresorAnlegen(page);

  // Eltern tragen eine Klassenarbeit am Freitag dieser Woche ein
  const isoLokal = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const freitag = new Date();
  freitag.setDate(freitag.getDate() - ((freitag.getDay() + 6) % 7) + 4);
  await page.getByTestId("nav-eltern").click();
  await page.getByTestId("termin-tag").fill(isoLokal(freitag));
  await page.selectOption('[data-test="termin-art"]', "ka");
  await page.getByTestId("termin-fach").fill("Mathe");
  await page.getByTestId("termin-plus").click();
  await expect(page.getByTestId("termin-zeile")).toContainText("Klassenarbeit · Mathe");

  // Kind plant: Termin sichtbar, feste Termine (mit Dauer) im Raster, Wächter empfiehlt Verteilen
  await page.getByTestId("nav-start").click();
  await page.getByTestId("nav-plan").click();
  await expect(page.getByTestId("plan-kw")).toContainText("KW");
  await expect(page.getByTestId("termin-chip")).toContainText("Klassenarbeit Mathe");
  await expect(page.getByTestId("fest-0-780")).toContainText("Mittag & Spielzeit");
  await expect(page.getByTestId("fest-6-780")).toContainText("Mittag & Spielzeit"); // auch am Wochenende
  // Kategorien erscheinen erst nach „📝 Termin eintragen“ – vorher ist die Leiste aufgeräumt
  await expect(page.getByTestId("plan-palette")).toHaveCount(0);
  await page.getByTestId("kind-termin").click();
  await expect(page.getByTestId("baustein-arzt")).toContainText("Arzttermin");
  await expect(page.getByTestId("plan-legende")).toContainText("blockiert");
  await expect(page.getByTestId("fest-1-960")).toContainText("Schlagzeug-Stunde");
  await expect(page.getByTestId("fest-1-990")).toHaveCount(0); // Schlagzeug nur 30 Min
  await expect(page.getByTestId("fest-0-990")).toContainText("↳"); // Musikalische Spiele läuft 60 Min
  await expect(page.getByTestId("baustein-hausaufgaben")).toContainText("Hausaufgaben");
  await page.getByTestId("kat-zu").click(); // Auswahl wieder schließen
  await expect(page.getByTestId("fest-3-1110")).toContainText("Pfadfinder");
  await expect(page.getByTestId("tag-0")).toContainText("Schule 7:50");
  await expect(page.getByTestId("tag-4")).toContainText("7:50–13:00"); // Fr: Sport bis 13 Uhr
  // 🏫 Vormittag aufklappen: Stundenplan je Tag, AGs als freiwillig
  await page.getByTestId("schule-zeigen").click();
  await expect(page.getByTestId("schule-3")).toContainText("KoKo");
  await expect(page.getByTestId("schule-0")).toContainText("7:50–8:35"); // Zeitfenster wie auf dem Blatt
  await expect(page.getByTestId("schule-0")).toContainText("9:20–9:35 Pause");
  await expect(page.getByTestId("schule-0")).toContainText("Italienisch"); // Mo 12:15 (Änderung Okt 2026)
  await expect(page.getByTestId("schule-1")).toContainText("freiwillig"); // Chor-AG
  await page.getByTestId("schule-zeigen").click();
  await expect(page.getByTestId("schule-3")).toHaveCount(0);
  await expect(page.getByTestId("plan-hinweise")).toContainText("Klassenarbeit");
  await expect(page.getByTestId("auffrischung-4")).toContainText("Vor der Schule"); // 🌅 Morgen-Auffrischung am Testtag
  await expect(page.getByTestId("auffrischung-4")).toContainText("Mathe kurz auffrischen");

  // Antippen: Baustein → freies 30-Minuten-Fenster. Samstag ab 9 Uhr; 3 Lernboxen überladen (Limit 2 bei 20 Min)
  const bausteinZu = async (typ, tag, slot) => {
    await page.getByTestId("kind-termin").click(); // Kategorien-Auswahl öffnen
    await page.getByTestId(`baustein-${typ}`).click();
    await expect(page.getByTestId("plan-wahl-hinweis")).toBeVisible();
    await page.getByTestId(`slot-${tag}-${slot}`).click();
  };
  await bausteinZu("mathe", 5, 660);
  await bausteinZu("mathe", 5, 690);
  await expect(page.getByTestId("plan-block")).toHaveCount(2);
  await bausteinZu("mathe", 5, 720);
  await expect(page.getByTestId("ampel-5")).toHaveText("🔴");
  await expect(page.getByTestId("tag-hinweis-5")).toContainText("Schieb");

  // Eine Box weg → gelb; Familienregel: erst 📚 Hausaufgaben + 🥁 Schlagzeug, dann Üben → grün
  await page.getByTestId("block-weg").first().click();
  await expect(page.getByTestId("ampel-5")).toHaveText("🟡");
  await bausteinZu("sport", 5, 540);
  await expect(page.getByTestId("block-editor")).toContainText("Sport"); // fragt: welcher Sport?
  await page.getByTestId("notiz-feld").fill("BJJ");
  await page.getByTestId("notiz-ok").click();
  await expect(page.getByTestId("tag-5")).toContainText("Sport · BJJ");
  await page.getByTestId("kind-termin").click();
  await expect(page.getByTestId("baustein-angeln")).toContainText("Angeln"); // 🎣 neu in der Palette
  await expect(page.getByTestId("baustein-schlagzeug")).toContainText("10 Min"); // Schlagzeug = 10-Minuten-Einheit
  await page.getByTestId("kat-zu").click();
  await expect(page.getByTestId("ampel-5")).toHaveText("🟡"); // Sport reicht nicht – Reihenfolge fehlt
  await expect(page.getByTestId("tag-hinweis-5")).toContainText("Hausaufgaben");
  await bausteinZu("hausaufgaben", 5, 570);
  await bausteinZu("schlagzeug", 5, 600);
  await expect(page.getByTestId("ampel-5")).toHaveText("🟢");

  // Übungstage Di + Mi (freie Fenster neben den festen Terminen) → Wächter zufrieden
  await bausteinZu("mathe", 1, 900);
  await bausteinZu("deutsch", 2, 840);
  await expect(page.getByTestId("plan-hinweise")).toHaveCount(0);
  await expect(page.getByTestId("plan-ok")).toBeVisible();

  // 📝 Felix trägt selbst einen Termin ein (Wörter der Woche, Montag) – und entfernt ihn wieder
  await page.getByTestId("kind-termin").click();
  await page.getByTestId("kat-termin").click();
  await page.getByTestId("kt-art-wdw").click();
  await page.getByTestId("kt-tag-0").click();
  await page.getByTestId("kt-fach").fill("Herbstwörter");
  await page.getByTestId("kt-ok").click();
  await expect(page.getByTestId("tag-0")).toContainText("Wörter der Woche Herbstwörter");
  await page.getByTestId("tag-0").getByTestId("termin-chip").click();
  await expect(page.getByTestId("termin-dialog")).toContainText("Herbstwörter");
  await page.getByTestId("termin-entfernen").click();
  await expect(page.getByTestId("tag-0").getByTestId("termin-chip")).toHaveCount(0);

  // 🔁 Serientermin: 4 Wochen „Wörter der Woche" montags – gilt auch nächste Woche, Serie komplett löschbar
  await page.getByTestId("kind-termin").click();
  await page.getByTestId("kat-termin").click();
  await page.getByTestId("kt-art-wdw").click();
  await page.getByTestId("kt-tag-0").click();
  await page.getByTestId("kt-serie-4").click();
  await page.getByTestId("kt-ok").click();
  await expect(page.getByTestId("tag-0").getByTestId("termin-chip")).toHaveCount(1);
  await page.getByTestId("woche-naechste").click();
  await expect(page.getByTestId("tag-0").getByTestId("termin-chip")).toHaveCount(1); // Serie läuft weiter
  await page.getByTestId("tag-0").getByTestId("termin-chip").click();
  await expect(page.getByTestId("termin-dialog")).toContainText("Serie");
  await page.getByTestId("serie-entfernen").click();
  await expect(page.getByTestId("tag-0").getByTestId("termin-chip")).toHaveCount(0);
  await page.getByTestId("woche-diese").click();
  await expect(page.getByTestId("tag-0").getByTestId("termin-chip")).toHaveCount(0); // ganze Serie weg

  // ❌ Ausfall: fester Termin antippen → fällt diese Woche aus → Fenster wird frei → ↩️ holt ihn zurück
  await page.getByTestId("fest-1-1020").click();
  await expect(page.getByTestId("fest-dialog")).toContainText("Sport");
  await page.getByTestId("fest-ausfall").click();
  await expect(page.getByTestId("fest-1-1020")).toHaveCount(0);
  await expect(page.getByTestId("slot-1-1020")).toContainText("frei"); // Fenster ist einfach frei …
  await expect(page.getByTestId("ausfall-liste")).toContainText("Sport"); // … der Ausfall steht unterm Board
  // das freie Fenster lässt sich sofort neu verplanen
  await page.getByTestId("kind-termin").click();
  await page.getByTestId("baustein-freunde").click();
  await page.getByTestId("slot-1-1050").click();
  await page.getByTestId("notiz-feld").fill("Oma");
  await page.getByTestId("notiz-ok").click();
  await expect(page.getByTestId("slot-1-1050")).toContainText("Freunde · Oma");
  // 📍 Verschieben: Baustein antippen → freies Fenster antippen
  await page.getByTestId("slot-1-1050").click();
  await page.getByTestId("block-verschieben").click();
  await expect(page.getByTestId("verschieb-hinweis")).toBeVisible();
  await page.getByTestId("slot-1-1020").click();
  await expect(page.getByTestId("slot-1-1020")).toContainText("Freunde · Oma");
  // Zurückholen (aus der Liste) bringt den Sport zurück und räumt NUR sein Fenster
  await page.getByTestId("ausfall-zurueck").click();
  await expect(page.getByTestId("fest-1-1020")).toContainText("Sport");
  await expect(page.getByTestId("ausfall-liste")).toHaveCount(0);
  await expect(page.getByTestId("plan-block")).toHaveCount(7); // die 7 geplanten Bausteine bleiben

  // 🪟 Fenster direkt antippen: Freitext eintragen, korrigieren, per Suche Vordefiniertes wählen
  await page.getByTestId("slot-4-840").click();
  await expect(page.getByTestId("fenster-dialog")).toBeVisible();
  await page.getByTestId("fenster-suche").fill("Schwimmbad mit Papa");
  await page.getByTestId("fenster-frei").click();
  await expect(page.getByTestId("tag-4")).toContainText("Schwimmbad mit Papa");
  await page.getByTestId("slot-4-840").click(); // korrigieren über den Baustein-Editor
  await page.getByTestId("notiz-feld").fill("Schwimmbad");
  await page.getByTestId("notiz-ok").click();
  await expect(page.getByTestId("tag-4")).not.toContainText("mit Papa");
  await expect(page.getByTestId("tag-4")).toContainText("Schwimmbad");
  await page.getByTestId("slot-4-870").click();
  await page.getByTestId("fenster-suche").fill("deu"); // Suche filtert die Vorschläge
  await expect(page.getByTestId("fenster-wahl-mathe")).toHaveCount(0);
  await page.getByTestId("fenster-wahl-deutsch").click();
  await expect(page.getByTestId("tag-4")).toContainText("Deutsch üben");

  // 🔁 Routine: Üben wiederholt sich – Freunde-Zeit wird sonntags neu verabredet.
  // Beim Platzieren fragt die App direkt, MIT WEM – der Name steht dann am Baustein.
  await bausteinZu("freunde", 2, 870);
  await expect(page.getByTestId("block-editor")).toBeVisible();
  await page.getByTestId("notiz-feld").fill("Emil");
  await page.getByTestId("notiz-ok").click();
  await expect(page.getByTestId("tag-2")).toContainText("Freunde · Emil");
  // Baustein antippen → Notiz ändern; „entfernen" im Editor funktioniert auch
  await page.getByTestId("slot-2-870").click();
  await page.getByTestId("notiz-feld").fill("Emil + Ole");
  await page.getByTestId("notiz-ok").click();
  await expect(page.getByTestId("tag-2")).toContainText("Freunde · Emil + Ole");
  await page.getByTestId("routine-speichern").click();
  await page.getByTestId("woche-naechste").click();
  await expect(page.getByTestId("plan-block")).toHaveCount(0);
  await page.getByTestId("routine-uebernehmen").click();
  await expect(page.getByTestId("plan-block")).toHaveCount(9); // alles außer Freunde-Zeit
  await page.getByTestId("woche-diese").click();
  await expect(page.getByTestId("plan-block")).toHaveCount(10);

  // 📋 Als Vorlage: diese Woche in die nächste kopieren – füllt nur freie Fenster
  await page.getByTestId("plan-kopieren").click();
  await expect(page.getByTestId("plan-block")).toHaveCount(10); // 9 Routine + kopierte Freunde-Zeit
  await expect(page.getByTestId("tag-2")).toContainText("Emil + Ole"); // Notiz wandert mit
  await page.getByTestId("woche-diese").click();

  // Plan (beide Wochen) überlebt den Neustart
  await page.waitForTimeout(600);
  await page.reload();
  await page.getByTestId("pin-eingabe").fill(PIN);
  await page.getByTestId("pin-ok").click();
  await expect(page.getByTestId("start-seite")).toBeVisible({ timeout: 20000 });
  await page.getByTestId("nav-plan").click();
  await expect(page.getByTestId("plan-block")).toHaveCount(10);
  await page.getByTestId("woche-naechste").click();
  await expect(page.getByTestId("plan-block")).toHaveCount(10);
  await page.getByTestId("woche-diese").click();

  // 9d: Heute-Baustein einplanen, auf der Startseite abhaken → Tag geschafft + Münze
  const heuteIdx = (new Date().getDay() + 6) % 7;
  const slotFuerHeute = [840, 930, 960, 840, 900, 630, 540][heuteIdx]; // je Wochentag ein sicher freies Fenster
  await bausteinZu("schlagzeug", heuteIdx, slotFuerHeute);
  await page.getByTestId("plan-zurueck").click();
  await expect(page.getByTestId("heute-plan")).toBeVisible();
  await expect(page.getByTestId("heute-fest").first()).toBeVisible(); // Mittag & Spielzeit gibt es jeden Tag
  if (heuteIdx <= 4) await expect(page.getByTestId("heute-schule")).toContainText("Heute in der Schule");
  while (await page.getByTestId("heute-haken").count()) {
    await page.getByTestId("heute-haken").first().click();
  }
  await expect(page.getByTestId("heute-geschafft")).toContainText("Münze");
  await expect(page.getByTestId("tages-stand")).toContainText("🪙 1 Münze");
  // ↩︎ Abhaken rückgängig: Haken weg, „geschafft" verschwindet – erneutes Haken gibt KEINE zweite Münze/Mission
  await page.getByTestId("heute-unhaken").first().click();
  await expect(page.getByTestId("heute-geschafft")).toHaveCount(0);
  await page.getByTestId("heute-haken").first().click();
  await expect(page.getByTestId("heute-geschafft")).toBeVisible();
  await expect(page.getByTestId("tages-stand")).toContainText("🪙 1 Münze");
  await page.getByTestId("nav-plan").click();
  await expect(page.getByTestId("plan-bilanz")).toBeVisible();

  // ⏱️ Von-bis: lange Wochenend-Aktivität über mehrere Fenster (So 10:00 bis 12:30)
  await page.getByTestId("slot-6-600").click();
  await page.getByTestId("fenster-suche").fill("Bei Michi zu Besuch");
  await page.getByTestId("fenster-frei").click();
  await page.getByTestId("slot-6-600").click(); // Baustein-Editor öffnen
  await page.getByTestId("dauer-750").click();  // bis 12:30
  await page.getByTestId("notiz-abbrechen").click();
  await expect(page.getByTestId("slot-6-600")).toContainText("bis 12:30");
  await expect(page.getByTestId("slot-6-630")).toContainText("↳"); // Folgefenster belegt
  await expect(page.getByTestId("slot-6-720")).toContainText("↳");

  // 🗓️ Monatsblatt: Schuljahres-Überblick mit BW-Ferien; Tipp auf einen Ferientag
  // öffnet dessen Woche – dort ist der Tag ganztags planbar (ab 9 Uhr)
  await page.getByTestId("ansicht-monat").click();
  await expect(page.getByTestId("kalender-monat")).toBeVisible();
  await expect(page.getByTestId("monat-titel")).toContainText("2026");
  await expect(page.getByTestId("kalender-ferien")).toContainText("Sommerferien");
  // zum Oktober 2026 navigieren (robust, egal in welchem Monat der Test läuft)
  for (let i = 0; i < 14 && !(await page.getByTestId("mt-2026-10-27").count()); i++) {
    await page.getByTestId("monat-zurueck").click();
  }
  await page.getByTestId("mt-2026-10-27").click(); // Dienstag in den Herbstferien
  await expect(page.getByTestId("plan-kw")).toContainText("Herbstferien");
  await expect(page.getByTestId("tag-1")).toContainText("Herbstferien");
  await expect(page.getByTestId("slot-1-540")).toBeVisible(); // Ferien: ab 9 Uhr planbar
  await page.getByTestId("woche-diese").click(); // zurück zur aktuellen Woche
  await expect(page.getByTestId("slot-1-540")).toHaveCount(0); // Schultag: erst ab 13 Uhr

  // „Heute" wirkt auch im Monatsblatt: nach Blättern springt Titel + Woche zurück
  await page.getByTestId("ansicht-monat").click();
  await expect(page.getByTestId("woche-naechste")).toHaveCount(0); // Wochen-Pfeile nur in der Wochenansicht
  const titelJetzt = await page.getByTestId("monat-titel").innerText();
  await page.getByTestId("monat-vor").click();
  await page.getByTestId("monat-vor").click();
  await expect(page.getByTestId("monat-titel")).not.toHaveText(titelJetzt);
  await page.getByTestId("woche-diese").click();
  await expect(page.getByTestId("monat-titel")).toHaveText(titelJetzt);
  await page.getByTestId("ansicht-monat").click(); // zurück zur Wochenansicht
  await page.getByTestId("kind-termin").click();
  await expect(page.getByTestId("plan-palette")).toBeVisible();
  await page.getByTestId("kat-zu").click();

  // 🔁 Baustein-Serie: Schlagzeug So 14:00 in die nächsten 4 Wochen – und ab Folgewoche wieder raus
  await page.getByTestId("slot-6-840").click();
  await page.getByTestId("fenster-suche").fill("Schlagzeug");
  await page.getByTestId("fenster-wahl-schlagzeug").click();
  await page.getByTestId("slot-6-840").click(); // Editor öffnen
  await page.getByTestId("block-serie-4").click();
  await page.getByTestId("woche-naechste").click();
  await expect(page.getByTestId("slot-6-840")).toContainText("Schlagzeug"); // Serie liegt in der Folgewoche
  await page.getByTestId("slot-6-840").click();
  await page.getByTestId("block-serie-entfernen").click();
  await expect(page.getByTestId("slot-6-840")).not.toContainText("Schlagzeug");
  await page.getByTestId("woche-diese").click();
  await expect(page.getByTestId("slot-6-840")).toContainText("Schlagzeug"); // Ursprungs-Woche bleibt

  // ✏️ Vorhandene Einträge bearbeiten: Termin umziehen & umbenennen statt löschen + neu
  await page.getByTestId("tag-4").getByTestId("termin-chip").click();
  await page.getByTestId("termin-bearbeiten").click();
  await expect(page.getByTestId("kt-fach")).toHaveValue("Mathe"); // vorbefüllt
  await page.getByTestId("kt-tag-3").click();
  await page.getByTestId("kt-fach").fill("Deutsch");
  await page.getByTestId("kt-ok").click();
  await expect(page.getByTestId("tag-3")).toContainText("Klassenarbeit Deutsch");
  await expect(page.getByTestId("tag-4").getByTestId("termin-chip")).toHaveCount(0);

  // 🔄 Baustein ändern: aus dem Sonntags-Schlagzeug wird Angeln – Fenster und Zeit bleiben
  await page.getByTestId("slot-6-840").click();
  await page.getByTestId("block-wechsel").click();
  await expect(page.getByTestId("fenster-dialog")).toContainText("ändern in");
  await page.getByTestId("fenster-wahl-angeln").click();
  await expect(page.getByTestId("slot-6-840")).toContainText("Angeln");
  await expect(page.getByTestId("slot-6-840")).not.toContainText("Schlagzeug");

  // 🧩 Plan-Kategorien: Eltern benennen um, blenden aus und ergänzen eine eigene
  // (nach dem PIN-Neustart ist die App im Kind-Modus – erst als Eltern entsperren)
  await page.reload();
  await page.getByTestId("eltern-zugang").click();
  await page.getByTestId("pw-eingabe").fill(PW);
  await page.getByTestId("pw-ok").click();
  await expect(page.getByTestId("start-seite")).toBeVisible({ timeout: 20000 });
  await page.getByTestId("nav-eltern").click();
  await page.getByTestId("kat-bearbeiten").click();
  await page.getByTestId("kat-name-angeln").fill("Fliegenfischen");
  await page.getByTestId("kat-an-pfadfinder").click(); // ausblenden
  await page.getByTestId("kat-eigen-name").fill("Lego-Zeit");
  await page.getByTestId("kat-eigen-plus").click();
  await page.getByTestId("kat-speichern").click();
  await page.getByTestId("nav-plan").click();
  await page.getByTestId("kind-termin").click();
  await expect(page.getByTestId("baustein-angeln")).toContainText("Fliegenfischen"); // umbenannt
  await expect(page.getByTestId("baustein-pfadfinder")).toHaveCount(0); // ausgeblendet
  await expect(page.getByTestId("slot-6-840")).toContainText("Fliegenfischen"); // platzierte Bausteine folgen dem Namen
  await page.getByTestId("kat-eigen-1").click(); // eigene Kategorie wählen …
  await page.getByTestId("slot-6-900").click(); // … und platzieren
  await expect(page.getByTestId("slot-6-900")).toContainText("Lego-Zeit");

  // ⭐ Freitext direkt aus der Auswahl: suchen → eigener Eintrag
  await page.getByTestId("kind-termin").click();
  await page.getByTestId("kat-suche").fill("Oma besuchen");
  await page.getByTestId("kat-frei").click();
  await page.getByTestId("slot-6-960").click();
  await expect(page.getByTestId("slot-6-960")).toContainText("Oma besuchen");
});

test("Auto-Sicherung: Änderungen wandern near-realtime im Hintergrund zum Server", async ({ page }) => {
  let rev = 0;
  let puts = 0;
  await page.route("**/api/meta", (r) => r.fulfill({ json: { rev, aktualisiert: null } }));
  await page.route("**/api/vault", (r) => {
    if (r.request().method() === "PUT") {
      rev++; puts++;
      return r.fulfill({ json: { rev } });
    }
    return r.fulfill({ json: { rev, blobs: null } });
  });

  await tresorAnlegen(page);
  await page.getByTestId("thema-schalter").click(); // irgendeine Änderung …
  await page.getByTestId("nav-eltern").click();
  // … landet ohne Knopfdruck verschlüsselt auf dem Server
  await expect(page.getByTestId("autosync-status")).toContainText("Automatisch gesichert", { timeout: 10000 });
  expect(puts).toBeGreaterThanOrEqual(1);

  // Nächste Änderung → nächste Revision, wieder von selbst
  const putsVorher = puts;
  await page.getByTestId("nav-start").click();
  await page.getByTestId("thema-schalter").click();
  await page.getByTestId("nav-eltern").click();
  await expect(page.getByTestId("autosync-status")).toContainText("Automatisch gesichert", { timeout: 10000 });
  expect(puts).toBeGreaterThan(putsVorher);
});

test("Untere Leiste macht beim Scrollen Platz und kommt nach dem Stopp zurück", async ({ page }) => {
  await tresorAnlegen(page);
  await page.getByTestId("nav-neu").click(); // lange Seite (Release-Notes)
  await expect(page.getByTestId("nav-leiste")).toBeInViewport();
  await page.mouse.wheel(0, 1500);
  await expect(page.getByTestId("nav-leiste")).not.toBeInViewport(); // beim Scrollen weg …
  await expect(page.getByTestId("nav-leiste")).toBeInViewport({ timeout: 3000 }); // … nach dem Stopp zurück
  await page.mouse.wheel(0, -300);
  await expect(page.getByTestId("nav-leiste")).toBeInViewport(); // hochscrollen: sofort da
});

test("KI-Karte ohne Server: ehrliche Meldung statt Absturz, Schalter bleiben bedienbar", async ({ page }) => {
  await tresorAnlegen(page);
  await page.getByTestId("nav-eltern").click();
  await expect(page.getByTestId("eltern-ki")).toBeVisible();
  await expect(page.getByTestId("ki-meldung")).toBeVisible({ timeout: 10000 });
  await page.getByTestId("ki-erklaeren-1").click(); // Freigabe wirkt trotzdem (lokale Einstellung)
});

test("Übungs-Welt, Wozu-Anker, Zeitstrahl und Lehrer-Moment", async ({ page }) => {
  await tresorAnlegen(page);
  await page.getByTestId("nav-ueben").click();

  // 🎨 Welt „Angeln“ wählen → Groß/Klein-Sätze kommen vom See
  await page.getByTestId("thema-angeln").click();
  await page.getByTestId("bereich-gk").click();
  await expect(page.getByTestId("wozu-anker")).toContainText("Wozu?");
  await expect(page.getByTestId("frage-karte")).toContainText("angler");
  await page.getByTestId("abbrechen").click();

  // ⏳ Zeitformen zeigen den Zeitstrahl
  await page.getByTestId("bereich-zeit").click();
  await expect(page.getByTestId("zeit-strahl")).toBeVisible();
  await expect(page.getByTestId("frage-karte")).toContainText("Zeitform");
  await page.getByTestId("abbrechen").click();

  // 🧑‍🏫 Lehrer-Moment: kommt einmal, nach der fälligen richtigen Antwort
  await page.getByTestId("ueben-fach-mathe").click();
  await page.getByTestId("bereich-mrechnen").click();
  for (let i = 0; i < 4; i++) {
    await page.locator('[data-test="antwort-opt"][data-richtig="1"]').click();
    await expect(page.getByTestId("lehrer-moment")).toHaveCount(0);
    await page.getByTestId("weiter-knopf").click();
  }
  await page.locator('[data-test="antwort-opt"][data-richtig="1"]').click();
  await expect(page.getByTestId("lehrer-moment")).toContainText("WARUM");
  await page.getByTestId("lehrer-fertig").click();
  await expect(page.getByTestId("lehrer-moment")).toContainText("sitzt doppelt");
  await page.getByTestId("weiter-knopf").click();
  // nur einmal pro Runde
  await page.locator('[data-test="antwort-opt"][data-richtig="1"]').click();
  await expect(page.getByTestId("lehrer-moment")).toHaveCount(0);
});
