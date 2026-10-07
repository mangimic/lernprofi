/* ============================================================
   Statische Regression – je Version ein Block, neueste zuerst.
   Prüft den Quelltext per Regex (keine Laufzeit). Alte Prüfungen
   werden bei Änderungen per Alternative (a|b) erweitert, nie
   gelöscht. Lauf: node test/regression.mjs → FAIL 0 Pflicht.
   ============================================================ */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const wurzel = join(dirname(fileURLToPath(import.meta.url)), "..");
const quelle = (p) => readFileSync(join(wurzel, p), "utf8");

let pass = 0;
let fail = 0;
function test(name, ok) {
  if (ok) {
    pass++;
    console.log(`  ✅ ${name}`);
  } else {
    fail++;
    console.log(`  ❌ ${name}`);
  }
}

// ---------- v0.1: Gerüst ----------
console.log("== v0.1: Gerüst ==");
test("v0.1: APP_VERSION in App.jsx gepflegt", /export const APP_VERSION = "\d+\.\d+\.\d+"/.test(quelle("src/App.jsx")));
test("v0.1: Release-Notes beginnen mit rn-001-Struktur (id, version, datum, titel, entries)", (() => {
  const rn = JSON.parse(quelle("src/releaseNotes.json"));
  return Array.isArray(rn) && rn.length >= 1 && ["id", "version", "datum", "titel", "entries"].every((k) => k in rn[0]);
})());
test("v0.1: Release-Note-Typen sind gültig", (() => {
  const erlaubt = ["neu", "verbessert", "fix", "hinweis", "technik", "geaendert"];
  const rn = JSON.parse(quelle("src/releaseNotes.json"));
  return rn.every((r) => r.entries.every((e) => erlaubt.includes(e.type)));
})());
test("v0.1: CSP ohne Fremdquellen (nur 'self', kein http://, kein CDN)", (() => {
  const html = quelle("index.html");
  const csp = html.match(/Content-Security-Policy[^>]*content="([^"]+)"/)?.[1] || "";
  return csp.includes("default-src 'self'") && !/https?:\/\//.test(csp);
})());
test("v0.1: keine Fremd-CDNs im App-Code", !/cdn\.jsdelivr|cdnjs\.cloudflare|unpkg\.com|googleapis/.test(quelle("src/App.jsx") + quelle("src/main.jsx") + quelle("index.html")));
test("v0.1: Design-Tokens mit Hell/Dunkel über data-theme", (() => {
  const t = quelle("src/styles/tokens.css");
  return t.includes(":root") && t.includes('[data-theme="dark"]') && t.includes("--touch: 44px");
})());
test("v0.1: migrateData mit SCHEMA_VERSION exportiert", /export const SCHEMA_VERSION = \d+/.test(quelle("src/calc/migrateData.js")));
test("v0.1: calc bleibt rein (kein DOM, kein Date.now, kein fetch in src/calc)", (() => {
  const c = quelle("src/calc/migrateData.js");
  return !/document\.|window\.|Date\.now\(|fetch\(/.test(c);
})());
test("v0.1: _headers mit nosniff, HSTS und no-store für version.json", (() => {
  const h = quelle("public/_headers");
  return h.includes("nosniff") && h.includes("Strict-Transport-Security") && h.includes("no-store");
})());
test("v0.1: keine echten Kind-Daten im Code (nur „Kind“/„Profil“)", !/Felix|Geburtstag|Schule am/i.test(
  quelle("src/App.jsx") + quelle("src/features/Start.jsx") + quelle("src/calc/migrateData.js") + quelle("src/calc/migrateData.test.js") + quelle("src/releaseNotes.json")));
test("v0.1: data-test-Attribute an geprüften Elementen", (() => {
  const a = quelle("src/App.jsx") + quelle("src/features/Start.jsx");
  return a.includes('data-test="app-shell"') && a.includes('data-test="version"')
    && a.includes('data-test="rn-liste"') && a.includes('data-test="start-seite"')
    && ["nav-start", "nav-neu", "thema-schalter"].every((t) => a.includes(`"${t}"`));
})());

console.log(`\n================ ERGEBNIS: PASS ${pass} / FAIL ${fail} ================`);
process.exit(fail ? 1 : 0);
