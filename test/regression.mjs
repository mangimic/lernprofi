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

// APP_VERSION einmal lesen; Versions-Checks prüfen „mindestens x.y.z",
// damit alte Blöcke bei jedem Bump gültig bleiben (erweitern, nie löschen).
const appVersion = (quelle("src/App.jsx").match(/APP_VERSION = "(\d+)\.(\d+)\.(\d+)"/) || [0, 0, 0, 0]).slice(1).map(Number);
function versionMindestens(v) {
  const ziel = v.split(".").map(Number);
  for (let i = 0; i < 3; i++) {
    if (appVersion[i] > ziel[i]) return true;
    if (appVersion[i] < ziel[i]) return false;
  }
  return true;
}
const releaseNoteVorhanden = (id) => JSON.parse(quelle("src/releaseNotes.json")).some((r) => r.id === id);

// ---------- v0.5: Wörter antippen ----------
console.log("== v0.5: Wörter antippen ==");
test("v0.5: APP_VERSION mindestens 0.5.0", versionMindestens("0.5.0"));
test("v0.5: rn-007 vorhanden", releaseNoteVorhanden("rn-007"));
test("v0.5: Satz-Pools mit Normalisierern (subjekt/praedikat/gk)", (() => {
  const s = quelle("src/calc/aufgaben/saetze.js");
  return ["subjektPool", "praedikatPool", "gkPool"].every((f) => s.includes(`export function ${f}`))
    && s.includes("SUBJ_K4") && s.includes("PRAED_K4");
})());
test("v0.5: reine Prüf-Logik auswahlPruefen + Pool-Gesundheit", (() => {
  const w = quelle("src/calc/wortTippen.js");
  return w.includes("export function auswahlPruefen") && w.includes("tippenPoolGesund")
    && !/document\.|window\.|fetch\(|Math\.random/.test(w);
})());
test("v0.5: Üben kennt den Tippen-Typ (wort-chip, pruefen-knopf)", (() => {
  const u = quelle("src/features/Ueben.jsx");
  return u.includes("\"tippen\"") && u.includes("\"wort-chip\"") && u.includes("\"pruefen-knopf\"")
    && u.includes("auswahlPruefen");
})());


// ---------- v0.4: Deutsch + Stark mit Leo ----------
console.log("== v0.4: Deutsch + Stark mit Leo ==");
test("v0.4: APP_VERSION mindestens 0.4.0", versionMindestens("0.4.0"));
test("v0.4: rn-006 vorhanden", releaseNoteVorhanden("rn-006"));
test("v0.4: Deutsch-Pools mit Konvertern (gesch, ddPool, doppelPool)", (() => {
  const d = quelle("src/calc/aufgaben/deutsch.js");
  return d.includes("export const GESCH_DATEN") && d.includes("export function ddPool")
    && d.includes("export function doppelPool") && d.includes("DEUTSCH_BEREICHE");
})());
test("v0.4: Stark-Pool mit Mut-Sätzen", (() => {
  const s = quelle("src/calc/aufgaben/stark.js");
  return s.includes("export const STARK_DATEN") && s.includes("export const STARK_SAETZE");
})());
test("v0.4: Üben kennt alle 4 Fächer (Deutsch · Mathe · Sachkunde · Stark)", (() => {
  const u = quelle("src/features/Ueben.jsx");
  return ["\"deutsch\"", "\"mathe\"", "\"sachkunde\"", "\"stark\""].every((f) => u.includes(f))
    && u.includes("DEUTSCH_BEREICHE") && u.includes("STARK_BEREICHE");
})());
test("v0.4: kein Beschämungs-Vokabular in den Deutsch/Stark-Pools", (() => {
  const t = quelle("src/calc/aufgaben/deutsch.js") + quelle("src/calc/aufgaben/stark.js");
  return !/unmotiviert|Versager|dumm/i.test(t);
})());


// ---------- v0.3.1: Cache-Regeln + version.json ----------
console.log("== v0.3.1: Cache-Regeln + version.json ==");
test("v0.3.1: APP_VERSION mindestens 0.3.1", versionMindestens("0.3.1"));
test("v0.3.1: rn-005 vorhanden", releaseNoteVorhanden("rn-005"));
test("v0.3.1: index.html no-cache, assets immutable, version.json no-store", (() => {
  const h = quelle("public/_headers");
  return /\/index\.html\n  Cache-Control: no-cache/.test(h)
    && /\/assets\/\*\n  Cache-Control: public, max-age=31536000, immutable/.test(h)
    && /\/version\.json\n  Cache-Control: no-store/.test(h);
})());
test("v0.3.1: Build schreibt dist/version.json mit Version, Datum und Git-Hash", (() => {
  const v = quelle("vite.config.js");
  return v.includes("dist/version.json") && v.includes("appVersion()") && v.includes("rev-parse");
})());

// ---------- v0.3: Fachlogik Mathe + Sachkunde ----------
console.log("== v0.3: Fachlogik Mathe + Sachkunde ==");
test("v0.3: APP_VERSION mindestens 0.3.0", versionMindestens("0.3.0"));
test("v0.3: rn-004 vorhanden (bei v0.3.0 an Index 0)", releaseNoteVorhanden("rn-004"));
test("v0.3: Pools als reine Daten-Module vorhanden", (() => {
  const m = quelle("src/calc/aufgaben/mathe.js"), s = quelle("src/calc/aufgaben/sachkunde.js");
  return m.includes("export const MATHE_DATEN") && m.includes("MATHE_BEREICHE")
    && s.includes("export const SACH_DATEN") && s.includes("SACH_BEREICHE");
})());
test("v0.3: calc-Module bleiben rein (kein DOM, keine eingebaute Uhr, kein fetch, kein ungeseedeter Zufall)", (() => {
  const dateien = ["src/calc/rng.js", "src/calc/stufen.js", "src/calc/aufgabenRunde.js", "src/calc/lerntage.js", "src/calc/migrateData.js"];
  return dateien.every((d) => {
    const c = quelle(d);
    const mathRandomErlaubt = d.endsWith("rng.js"); // einzige Stelle wäre verboten – rng nutzt mulberry32
    return !/document\.|window\.|fetch\(/.test(c)
      && !/Date\.now\(/.test(c)
      && (mathRandomErlaubt || !/Math\.random/.test(c));
  });
})());
test("v0.3: Stufen-Regeln im Code (fehlerfrei schaltet frei, Klasse 4 startet höher, Krone)", (() => {
  const c = quelle("src/calc/stufen.js");
  return c.includes("fehler === 0") && c.includes("klasse === 4") && c.includes("krone");
})());
test("v0.3: Runde = 1 Münze, Missionen und Lernspur mit 3-Tage-Brücke", (() => {
  const c = quelle("src/calc/lerntage.js");
  return c.includes("muenzenNachRunde") && c.includes("MISSIONS_LAENGE") && c.includes("<= 3");
})());
test("v0.3: Üben-Ansicht nutzt calc-Module (keine eigene Fachlogik-Kopie)", (() => {
  const c = quelle("src/features/Ueben.jsx");
  return c.includes("from \"../calc/stufen.js\"") && c.includes("from \"../calc/aufgabenRunde.js\"")
    && c.includes("from \"../calc/lerntage.js\"") && c.includes("rngAusSeed");
})());
test("v0.3: data-test-Attribute der Üben-Ansicht", (() => {
  const c = quelle("src/features/Ueben.jsx");
  return ["ueben-bereiche", "frage-karte", "frage-text", "antwort-opt", "weiter-knopf", "runde-ergebnis", "nochmal-knopf"]
    .every((t) => c.includes(`"${t}"`));
})());


// ---------- v0.2.1: _headers-Format ----------
console.log("== v0.2.1: _headers-Format ==");
test("v0.2.1: APP_VERSION mindestens 0.2.1", versionMindestens("0.2.1"));
test("v0.2.1: rn-003 vorhanden", releaseNoteVorhanden("rn-003"));
test("v0.2.1: _headers im Cloudflare-Format (keine Kommentar-Blöcke, jede eingerückte Zeile ist Name: Wert)", (() => {
  const zeilen = quelle("public/_headers").split("\n");
  if (zeilen.some((z) => z.includes("*/") || z.trim().startsWith("#"))) return false;
  if (zeilen[0].trim() !== "/*") return false; // erste Regel: alle Pfade
  return zeilen.every((z) => {
    const t = z.trim();
    if (t === "") return true;
    if (!z.startsWith(" ")) return t.startsWith("/"); // URL-Muster
    return /^[A-Za-z-]+: .+/.test(t); // Header-Paar
  });
})());

// ---------- v0.2: Tresor ----------
console.log("== v0.2: Tresor ==");
test("v0.2: APP_VERSION mindestens 0.2.0", versionMindestens("0.2.0"));
test("v0.2: rn-002 vorhanden (bei v0.2.0 an Index 0)", releaseNoteVorhanden("rn-002"));
test("v0.2: PBKDF2 mit SHA-256 und ≥ 250.000 Iterationen", (() => {
  const c = quelle("src/crypto.js");
  const n = parseInt(c.match(/PBKDF2_ITERATIONEN = (\d+)/)?.[1] || "0", 10);
  return n >= 250000 && c.includes('"SHA-256"') && c.includes("PBKDF2");
})());
test("v0.2: AES-256-GCM mit zufälliger IV", (() => {
  const c = quelle("src/crypto.js");
  return c.includes("AES-GCM") && c.includes("length: 256") && c.includes("zufallsBytes(12)");
})());
test("v0.2: Tresor speichert nur Chiffrat (datenSpeichern verschlüsselt immer)", (() => {
  const v = quelle("src/vault.js");
  return /datenSpeichern[\s\S]{0,200}verschluesseln\(/.test(v) && !/set\(DATEN_SCHLUESSEL, dokument/.test(v);
})());
test("v0.2: PIN-Sperre nach Fehlversuchen + Eltern setzen zurück", (() => {
  const v = quelle("src/vault.js");
  return v.includes("MAX_PIN_VERSUCHE") && v.includes("pinVersuche = 0");
})());
test("v0.2: Einrichtung verlangt Passwort ≥ 8 Zeichen und 4-stellige PIN", (() => {
  const v = quelle("src/vault.js");
  return v.includes("length < 8") && v.includes("\\d{4}");
})());
test("v0.2: Sperrbildschirm nennt „keine Passwort-Wiederherstellung“", quelle("src/features/VaultGate.jsx").includes("keine Passwort-Wiederherstellung"));
test("v0.2: data-test-Attribute am Gate und Elternbereich", (() => {
  const a = quelle("src/features/VaultGate.jsx") + quelle("src/features/Eltern.jsx");
  return ["gate-einrichten", "gate-entsperren", "pin-eingabe", "pin-ok", "eltern-zugang",
    "pw-eingabe", "pw-ok", "einr-ok", "eltern-karte", "export-knopf", "sperren-knopf"]
    .every((t) => a.includes(`"${t}"`));
})());
test("v0.2: keine Daten in localStorage (nur Tresor/IndexedDB)", (() => {
  const a = quelle("src/appContext.jsx") + quelle("src/features/Start.jsx") + quelle("src/features/Eltern.jsx");
  return !a.includes("localStorage");
})());

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
