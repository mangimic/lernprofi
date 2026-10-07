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
