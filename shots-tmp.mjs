import { chromium, selectors } from "@playwright/test";

const BASIS = "http://localhost:4173";
const AUS = process.argv[2] || "/tmp/shots";
selectors.setTestIdAttribute("data-test");

const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const page = await browser.newPage({ viewport: { width: 1180, height: 820 } });

await page.route("**/api/ki/status", (r) => r.fulfill({ json: {
  verfuegbar: true, grund: null, monat: "2026-10", deckelCent: 500, maxDeckelCent: 1000,
  verbrauchtCent: 12, posten: [],
} }));
await page.route("**/api/ki/schrift", (r) => r.fulfill({ json: {
  sterne: ["Dein L steht kerzengerade – richtig stark! ⭐", "Alle Wörter sitzen sauber auf der Linie."],
  uebe: { buchstabe: "e", blase: "Das e ist manchmal zu eng gequetscht." },
  mach: "Schreib das e RIESIG in die Luft – 3-mal!",
  kostenCent: 0.5, verbrauchtCent: 12.5, deckelCent: 500,
} }));

// Tresor anlegen
await page.goto(BASIS);
await page.getByTestId("einr-pw1").fill("Eltern123!");
await page.getByTestId("einr-pw2").fill("Eltern123!");
await page.getByTestId("einr-pin1").fill("1234");
await page.getByTestId("einr-pin2").fill("1234");
await page.getByTestId("einr-ok").click();
await page.getByTestId("start-seite").waitFor();
await page.screenshot({ path: `${AUS}/1-start-mit-schreibtraining.png`, fullPage: false });

// Ohne Freigabe
await page.getByTestId("zum-schrift").click();
await page.getByTestId("schrift-freigabe-hinweis").waitFor();
await page.screenshot({ path: `${AUS}/2-schrift-ohne-freigabe.png` });

// Freigeben
await page.getByTestId("nav-eltern").click();
await page.getByTestId("eltern-ki").scrollIntoViewIfNeeded();
await page.getByTestId("ki-schrift-1").click();
await page.waitForTimeout(300);
await page.screenshot({ path: `${AUS}/3-eltern-ki-freigaben.png` });

// Foto hochladen (Beispiel-"Blatt" per Canvas erzeugen)
await page.getByTestId("nav-start").click();
await page.getByTestId("zum-schrift").click();
const blattPng = await page.evaluate(() => {
  const c = document.createElement("canvas");
  c.width = 800; c.height = 400;
  const g = c.getContext("2d");
  g.fillStyle = "#fdfbf5"; g.fillRect(0, 0, 800, 400);
  g.strokeStyle = "#b9c6e2"; g.lineWidth = 2;
  for (let y = 120; y <= 320; y += 70) { g.beginPath(); g.moveTo(40, y); g.lineTo(760, y); g.stroke(); }
  g.fillStyle = "#2b3a5c"; g.font = "52px cursive";
  g.fillText("Der Ball springt", 60, 110);
  g.fillText("über den Zaun.", 60, 180);
  return c.toDataURL("image/png").split(",")[1];
});
await page.getByTestId("schrift-foto").setInputFiles({
  name: "blatt.png", mimeType: "image/png", buffer: Buffer.from(blattPng, "base64"),
});
await page.getByTestId("schrift-stern").first().waitFor();
await page.getByTestId("schrift-weiter").click();
await page.getByTestId("schrift-mach").waitFor();
await page.screenshot({ path: `${AUS}/4-leos-schrift-blick.png` });

// Speichern → Schrift-Reise
await page.getByTestId("schrift-speichern").click();
await page.getByTestId("schrift-reise").waitFor();
await page.screenshot({ path: `${AUS}/5-schrift-reise.png` });

await browser.close();
console.log("fertig");
