import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Lernprofi-Build: statische PWA, Ausgabe nach dist/ (Cloudflare Pages).
// Der test-Block gilt für Vitest (nur calc-Unit-Tests; e2e/ gehört Playwright).
export default defineConfig({
  plugins: [react()],
  test: {
    include: ["src/**/*.test.js"],
  },
});
