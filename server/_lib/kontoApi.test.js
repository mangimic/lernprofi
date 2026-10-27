import { describe, it, expect } from "vitest";
import {
  kontoApi, kontoVonAnfrage, sitzungAusstellen, sitzungPruefen,
  neuerEinladungsCode, neueKontoId, STAMM_KONTO, SITZUNG_COOKIE,
} from "./kontoApi.js";
import { vaultApi } from "./vaultApi.js";

// Mini-Mocks wie in vaultApi.test: KV als Map, echte Request-Objekte.
function mockEnv({ mitKv = true, geheim = "test-session-geheimnis" } = {}) {
  const m = new Map();
  return {
    SESSION_GEHEIM: geheim || undefined,
    TRESOR: mitKv ? {
      _map: m,
      async get(k, art) { const v = m.get(k); return art === "json" && v ? JSON.parse(v) : v ?? null; },
      async put(k, v) { m.set(k, v); },
      async delete(k) { m.delete(k); },
    } : undefined,
  };
}
const anfrage = (methode, pfad, body, headers = {}) =>
  new Request("https://lernprofi.example" + pfad, {
    method: methode,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
const mitAccess = { "Cf-Access-Authenticated-User-Email": "test@example.com" };
const BEWEIS = "dGVzdC1hdXRoLWJld2Vpcy0zMi1ieXRlcy1sYW5nIQ=="; // fiktiver Auth-Beweis
const cookieVon = (r) => (r.headers.get("set-cookie") || "").split(";")[0];

async function einladung(env) {
  const r = await kontoApi(anfrage("POST", "/api/konto/einladung", null, mitAccess), env);
  return (await r.json()).code;
}

describe("kontoApi – Sitzungen", () => {
  it("Token-Rundreise: ausstellen → prüfen; Manipulation und Ablauf fliegen raus", async () => {
    const jetzt = new Date("2026-10-27T10:00:00Z");
    const token = await sitzungAusstellen("geheim", "abcd1234", jetzt);
    expect(await sitzungPruefen("geheim", token, jetzt)).toBe("abcd1234");
    // abgelaufen (31 Tage später)
    expect(await sitzungPruefen("geheim", token, new Date("2026-11-27T11:00:00Z"))).toBe(null);
    // manipuliert: fremde kontoId mit alter Signatur
    expect(await sitzungPruefen("geheim", token.replace("abcd1234", "ffff0000"), jetzt)).toBe(null);
    // falsches Secret
    expect(await sitzungPruefen("anders", token, jetzt)).toBe(null);
    expect(await sitzungPruefen("geheim", "quatsch", jetzt)).toBe(null);
  });

  it("kontoVonAnfrage: Sitzung → Konto, Access-Header → Stamm, sonst null", async () => {
    const env = mockEnv();
    const token = await sitzungAusstellen(env.SESSION_GEHEIM, "abcd1234");
    expect(await kontoVonAnfrage(anfrage("GET", "/api/meta", null, { cookie: `${SITZUNG_COOKIE}=${token}` }), env))
      .toMatchObject({ kontoId: "abcd1234", art: "sitzung" });
    expect(await kontoVonAnfrage(anfrage("GET", "/api/meta", null, mitAccess), env))
      .toMatchObject({ kontoId: STAMM_KONTO, art: "stamm" });
    expect(await kontoVonAnfrage(anfrage("GET", "/api/meta"), env)).toBe(null);
  });
});

describe("kontoApi – Registrieren und Login", () => {
  it("Einladungs-Code: nur das Stamm-Konto erzeugt ihn, Format stimmt", async () => {
    const env = mockEnv();
    expect((await kontoApi(anfrage("POST", "/api/konto/einladung"), env)).status).toBe(403);
    const code = await einladung(env);
    expect(code).toMatch(/^[a-z2-9]{5}-[a-z2-9]{5}$/);
    expect(neuerEinladungsCode()).toMatch(/^[a-z2-9]{5}-[a-z2-9]{5}$/);
    expect(neueKontoId()).toMatch(/^[a-f0-9]{16}$/);
  });

  it("Registrieren: verbraucht den Code, legt Konto + E-Mail-Index an, setzt Sitzung", async () => {
    const env = mockEnv();
    const code = await einladung(env);
    const r = await kontoApi(anfrage("POST", "/api/konto/registrieren",
      { einladung: code, email: "Eltern@Example.com ", authBeweis: BEWEIS }), env);
    expect(r.status).toBe(201);
    const { kontoId } = await r.json();
    expect(kontoId).toMatch(/^[a-f0-9]{16}$/);
    expect(r.headers.get("set-cookie")).toContain(`${SITZUNG_COOKIE}=`);
    expect(r.headers.get("set-cookie")).toContain("HttpOnly");
    // E-Mail normalisiert, Server kennt NUR den Hash des Beweises
    const satz = JSON.parse(env.TRESOR._map.get(`konto:${kontoId}`));
    expect(satz.email).toBe("eltern@example.com");
    expect(satz.authHash).toMatch(/^[a-f0-9]{64}$/);
    expect(JSON.stringify(satz)).not.toContain(BEWEIS);
    expect(env.TRESOR._map.get("email:eltern@example.com")).toBe(kontoId);
    // Code ist verbraucht – zweite Registrierung damit scheitert
    const nochmal = await kontoApi(anfrage("POST", "/api/konto/registrieren",
      { einladung: code, email: "zwei@example.com", authBeweis: BEWEIS }), env);
    expect(nochmal.status).toBe(403);
  });

  it("Registrieren validiert: Code-Format, E-Mail, Beweis-Länge, doppelte E-Mail", async () => {
    const env = mockEnv();
    const code = await einladung(env);
    const post = (body) => kontoApi(anfrage("POST", "/api/konto/registrieren", body), env);
    expect((await post({ einladung: "BÖSE", email: "a@b.de", authBeweis: BEWEIS })).status).toBe(400);
    expect((await post({ einladung: code, email: "keinemail", authBeweis: BEWEIS })).status).toBe(400);
    expect((await post({ einladung: code, email: "a@b.de", authBeweis: "kurz" })).status).toBe(400);
    expect((await post({ einladung: "aaaaa-aaaaa", email: "a@b.de", authBeweis: BEWEIS })).status).toBe(403);
    expect((await post({ einladung: code, email: "a@b.de", authBeweis: BEWEIS })).status).toBe(201);
    const doppelt = await kontoApi(anfrage("POST", "/api/konto/registrieren",
      { einladung: await einladung(env), email: "A@b.de", authBeweis: BEWEIS }), env);
    expect(doppelt.status).toBe(409);
  });

  it("Login: richtiger Beweis → Sitzung; falscher → 401; nach 10 Fehlversuchen → 429", async () => {
    const env = mockEnv();
    await kontoApi(anfrage("POST", "/api/konto/registrieren",
      { einladung: await einladung(env), email: "a@b.de", authBeweis: BEWEIS }), env);
    const login = (beweis) => kontoApi(anfrage("POST", "/api/konto/login", { email: "a@b.de", authBeweis: beweis }), env);
    const ok = await login(BEWEIS);
    expect(ok.status).toBe(200);
    const cookie = cookieVon(ok);
    // Die Sitzung trägt durch die anderen APIs (wer bin ich?)
    const wer = await kontoApi(anfrage("GET", "/api/konto", null, { cookie }), env);
    expect(await wer.json()).toMatchObject({ angemeldet: true, art: "sitzung", email: "a@b.de" });
    // unbekannte E-Mail und falscher Beweis sehen gleich aus (401)
    expect((await kontoApi(anfrage("POST", "/api/konto/login",
      { email: "x@y.de", authBeweis: BEWEIS }), env)).status).toBe(401);
    const falsch = "ZmFsc2NoZXItYmV3ZWlzLWZhbHNjaGVyLWJld2VpcyE=";
    for (let i = 0; i < 10; i++) expect((await login(falsch)).status).toBe(401);
    expect((await login(falsch)).status).toBe(429);
    expect((await login(BEWEIS)).status).toBe(429); // Drossel gilt auch für richtige
  });

  it("Stamm-Verknüpfung: nur über Access, ohne Code, genau einmal", async () => {
    const env = mockEnv();
    const body = { stamm: true, email: "familie@example.com", authBeweis: BEWEIS };
    // ohne Access-Brücke verboten
    expect((await kontoApi(anfrage("POST", "/api/konto/registrieren", body), env)).status).toBe(403);
    const r = await kontoApi(anfrage("POST", "/api/konto/registrieren", body, mitAccess), env);
    expect(r.status).toBe(201);
    expect((await r.json()).kontoId).toBe(STAMM_KONTO);
    expect(env.TRESOR._map.get("email:familie@example.com")).toBe(STAMM_KONTO);
    // der Access-Weg zeigt jetzt die verknüpfte E-Mail
    const wer = await kontoApi(anfrage("GET", "/api/konto", null, mitAccess), env);
    expect(await wer.json()).toMatchObject({ angemeldet: true, kontoId: STAMM_KONTO, email: "familie@example.com" });
    // nur einmal verknüpfbar
    const nochmal = await kontoApi(anfrage("POST", "/api/konto/registrieren",
      { ...body, email: "zweite@example.com" }, mitAccess), env);
    expect(nochmal.status).toBe(409);
    // und danach geht der normale Login mit demselben Beweis
    const login = await kontoApi(anfrage("POST", "/api/konto/login",
      { email: "familie@example.com", authBeweis: BEWEIS }), env);
    expect(login.status).toBe(200);
    expect((await login.json()).kontoId).toBe(STAMM_KONTO);
  });

  it("Abmelden löscht das Cookie; ohne SESSION_GEHEIM → 503; GET /api/konto ehrlich", async () => {
    const env = mockEnv();
    const ab = await kontoApi(anfrage("POST", "/api/konto/abmelden"), env);
    expect(ab.status).toBe(200);
    expect(ab.headers.get("set-cookie")).toContain("Max-Age=0");
    const ohne = mockEnv({ geheim: null });
    expect((await kontoApi(anfrage("POST", "/api/konto/login", { email: "a@b.de", authBeweis: BEWEIS }), ohne)).status).toBe(503);
    expect(await (await kontoApi(anfrage("GET", "/api/konto"), env)).json()).toEqual({ angemeldet: false });
    expect((await kontoApi(anfrage("GET", "/api/anderes"), env))).toBe(null);
  });
});

describe("kontoApi + vaultApi – Konten sind strikt getrennt", () => {
  const BLOBS_A = { "tresor.meta": { v: 1 }, "tresor.daten": { iv: "aa", chiffrat: "AA" } };
  const BLOBS_B = { "tresor.meta": { v: 1 }, "tresor.daten": { iv: "bb", chiffrat: "BB" } };

  async function kontoMitSitzung(env, email) {
    const r = await kontoApi(anfrage("POST", "/api/konto/registrieren",
      { einladung: await einladung(env), email, authBeweis: BEWEIS }), env);
    return { kontoId: (await r.json()).kontoId, cookie: cookieVon(r) };
  }

  it("zwei Konten: jeder PUT/GET bleibt im eigenen Tresor, Doks ebenso", async () => {
    const env = mockEnv();
    const a = await kontoMitSitzung(env, "a@b.de");
    const b = await kontoMitSitzung(env, "b@c.de");
    expect((await vaultApi(anfrage("PUT", "/api/vault", { baseRev: 0, blobs: BLOBS_A }, { cookie: a.cookie }), env)).status).toBe(200);
    expect((await vaultApi(anfrage("PUT", "/api/vault", { baseRev: 0, blobs: BLOBS_B }, { cookie: b.cookie }), env)).status).toBe(200);
    const standA = await (await vaultApi(anfrage("GET", "/api/vault", null, { cookie: a.cookie }), env)).json();
    const standB = await (await vaultApi(anfrage("GET", "/api/vault", null, { cookie: b.cookie }), env)).json();
    expect(standA.blobs).toEqual(BLOBS_A);
    expect(standB.blobs).toEqual(BLOBS_B);
    expect(env.TRESOR._map.has(`tresor:${a.kontoId}`)).toBe(true);
    expect(env.TRESOR._map.has(`tresor:${b.kontoId}`)).toBe(true);
    // Doks: A legt ab, B sieht nichts davon
    const paket = { iv: "aWY=", chiffrat: "Y2hpZmZyYXQ=" };
    expect((await vaultApi(anfrage("PUT", "/api/doks/dabc123", paket, { cookie: a.cookie }), env)).status).toBe(200);
    expect((await vaultApi(anfrage("GET", "/api/doks/dabc123", null, { cookie: a.cookie }), env)).status).toBe(200);
    expect((await vaultApi(anfrage("GET", "/api/doks/dabc123", null, { cookie: b.cookie }), env)).status).toBe(404);
  });

  it("Stamm-Brücke: Access-Header arbeitet auf tresor:stamm, Alt-Lage wandert mit", async () => {
    const env = mockEnv();
    // Alt-Lage wie vor v0.70: tresor:v1 + dok ohne Konto-Präfix
    env.TRESOR._map.set("tresor:v1", JSON.stringify({ rev: 7, blobs: BLOBS_A, aktualisiert: "2026-10-01T00:00:00Z" }));
    env.TRESOR._map.set("dok:dalt9999", JSON.stringify({ iv: "aWY=", chiffrat: "YWx0" }));
    const stand = await (await vaultApi(anfrage("GET", "/api/vault", null, mitAccess), env)).json();
    expect(stand.rev).toBe(7);
    expect(stand.blobs).toEqual(BLOBS_A);
    expect(env.TRESOR._map.has(`tresor:${STAMM_KONTO}`)).toBe(true); // migriert
    // PUT schreibt NUR noch aufs neue Layout
    expect((await vaultApi(anfrage("PUT", "/api/vault", { baseRev: 7, blobs: BLOBS_B }, mitAccess), env)).status).toBe(200);
    expect(JSON.parse(env.TRESOR._map.get(`tresor:${STAMM_KONTO}`)).rev).toBe(8);
    expect(JSON.parse(env.TRESOR._map.get("tresor:v1")).rev).toBe(7); // Alt bleibt als Sicherung liegen
    // Alt-Dok: beim ersten GET umgehängt, Alt-Schlüssel geräumt
    expect((await vaultApi(anfrage("GET", "/api/doks/dalt9999", null, mitAccess), env)).status).toBe(200);
    expect(env.TRESOR._map.has(`dok:${STAMM_KONTO}:dalt9999`)).toBe(true);
    expect(env.TRESOR._map.has("dok:dalt9999")).toBe(false);
    expect((await vaultApi(anfrage("GET", "/api/doks/dalt9999", null, mitAccess), env)).status).toBe(200);
  });
});
