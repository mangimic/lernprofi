import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { writeFileSync, readFileSync } from "node:fs";
import { execSync } from "node:child_process";

// Liest die APP_VERSION aus der Shell – eine Quelle, kein Doppel.
function appVersion() {
  const m = readFileSync(new URL("./src/App.jsx", import.meta.url), "utf8")
    .match(/APP_VERSION = "([^"]+)"/);
  return m ? m[1] : "0.0.0";
}

// Schreibt dist/version.json (Version, Datum, Git-Hash) – wird mit
// Cache-Control: no-store ausgeliefert, damit man IMMER sehen kann,
// welche Version gerade live ist: <url>/version.json
function versionJson() {
  return {
    name: "lernprofi-version-json",
    apply: "build",
    closeBundle() {
      let hash = "";
      try { hash = execSync("git rev-parse --short HEAD").toString().trim(); } catch { /* ohne Git ok */ }
      writeFileSync(
        "dist/version.json",
        JSON.stringify({ version: appVersion(), datum: new Date().toISOString(), git: hash }, null, 2),
      );
    },
  };
}

// Lernprofi-Build: statische PWA, Ausgabe nach dist/ (Cloudflare).
// Der test-Block gilt für Vitest (nur calc-Unit-Tests; e2e/ gehört Playwright).
export default defineConfig({
  plugins: [react(), versionJson()],
  test: {
    include: ["src/**/*.test.js"],
  },
});
