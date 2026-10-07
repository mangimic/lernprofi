import { defineConfig } from "@playwright/test";

/* Smoke-Tests gegen vite preview in den drei Pflicht-Viewports.
   Vor dem Lauf muss gebaut sein (npm run build) – der gates-Befehl
   erledigt das in der richtigen Reihenfolge. */
export default defineConfig({
  testDir: "e2e",
  timeout: 30000,
  use: {
    baseURL: "http://localhost:4173",
    testIdAttribute: "data-test",
    // Vorinstallierten Chromium nutzen (kein Browser-Download in der Umgebung)
    launchOptions: { executablePath: process.env.CHROMIUM_PATH || "/opt/pw-browsers/chromium" },
  },
  webServer: {
    command: "npm run preview -- --port 4173 --strictPort",
    port: 4173,
    reuseExistingServer: true,
  },
  projects: [
    { name: "iphone", use: { viewport: { width: 390, height: 844 } } },
    { name: "ipad-hoch", use: { viewport: { width: 820, height: 1180 } } },
    { name: "ipad-quer", use: { viewport: { width: 1180, height: 820 } } },
  ],
});
