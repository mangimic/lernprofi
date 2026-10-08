import { describe, it, expect, vi, afterEach } from "vitest";
import {
  kiApi, kostenMikro, mikroZuCent, monatsKey, antwortZurechtstutzen, wortProblem,
  MAX_BLASEN, MAX_WOERTER,
} from "./kiApi.js";

// Mini-Mocks wie bei der vaultApi: KV als Map, echte Request-Objekte.
function mockEnv({ mitKv = true, mitSchluessel = true, maxDeckel } = {}) {
  const m = new Map();
  return {
    DEV_OHNE_ACCESS: undefined,
    ANTHROPIC_API_KEY: mitSchluessel ? "test-schluessel" : undefined,
    KI_DECKEL_MAX_CENT: maxDeckel,
    TRESOR: mitKv ? {
      async get(k, art) { const v = m.get(k); return art === "json" && v ? JSON.parse(v) : v ?? null; },
      async put(k, v) { m.set(k, v); },
    } : undefined,
    _map: m,
  };
}
const anfrage = (methode, pfad, body, mitAccess = true) =>
  new Request("https://lernprofi.example" + pfad, {
    method: methode,
    headers: mitAccess ? { "Cf-Access-Authenticated-User-Email": "test@example.com" } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
const JETZT = new Date("2026-10-08T10:00:00Z");

function claudeMock({ text, input = 1000, output = 200 } = {}) {
  return vi.fn(async () => new Response(JSON.stringify({
    content: [{ type: "text", text: text ?? '{"blasen":["⚽ Du gibst WEM? den Ball.","Frag dich: wem gehört es?"],"mach":"Frag LAUT: wem gibt er den Ball?"}' }],
    usage: { input_tokens: input, output_tokens: output },
  }), { status: 200 }));
}
afterEach(() => vi.unstubAllGlobals());

describe("kiApi – reine Helfer", () => {
  it("Kosten in Mikro-Dollar, aufgerundet; Umrechnung in Cent", () => {
    // Haiku: 1000 Eingabe + 300 Ausgabe = 100 + 150 = 250 µ$ = 0,03 ct (gerundet)
    expect(kostenMikro("claude-haiku-5-5", { input_tokens: 1000, output_tokens: 300 })).toBe(250);
    expect(kostenMikro("claude-opus-5-5", { input_tokens: 1500, output_tokens: 700 })).toBe(6000 + 14000);
    expect(mikroZuCent(20000)).toBe(2);
    expect(mikroZuCent(250)).toBe(0.03);
    expect(kostenMikro("unbekannt", { input_tokens: 9 })).toBe(0);
    expect(monatsKey(JETZT)).toBe("2026-10");
  });

  it("zurechtstutzen: JSON wird geparst, Blasen auf 2 × 12 Wörter gestutzt", () => {
    const lang = Array.from({ length: 30 }, (_, i) => "wort" + i).join(" ");
    const s = antwortZurechtstutzen(`Klar! Hier: {"blasen":["Eins zwei drei.","${lang}","dritte blase"],"mach":"Zeig mit dem Finger!"}`);
    expect(s.blasen.length).toBe(MAX_BLASEN);
    expect(s.blasen[1].split(/\s+/).length).toBeLessThanOrEqual(MAX_WOERTER + 1); // + „…“
    expect(s.blasen[1].endsWith("…")).toBe(true);
    expect(s.mach).toBe("Zeig mit dem Finger!");
    expect(s.ersetzt).toBe(false);
    // kaputtes JSON → Rohtext wird zur (gekürzten) Blase
    const roh = antwortZurechtstutzen("Denk an den Fußball im Training!");
    expect(roh.blasen).toEqual(["Denk an den Fußball im Training!"]);
  });

  it("Wort-Wächter ersetzt Antworten mit Diagnose-/Druck-Wörtern komplett", () => {
    expect(wortProblem("Du bist doch nicht dumm!")).toBe(true);
    expect(wortProblem("Frag dich: wem gehört der Ball?")).toBe(false);
    const s = antwortZurechtstutzen('{"blasen":["Das liegt an deiner Störung."],"mach":"Üb halt mehr."}');
    expect(s.ersetzt).toBe(true);
    expect(s.blasen.join(" ")).not.toMatch(/Störung/);
  });
});

describe("kiApi – Routen", () => {
  it("akzeptiert das Secret unter dem Namen lernprofiapi", async () => {
    const env = mockEnv({ mitSchluessel: false });
    env.lernprofiapi = "mein-schluessel";
    const s = await (await kiApi(anfrage("GET", "/api/ki/status"), env, JETZT)).json();
    expect(s.verfuegbar).toBe(true);
    vi.stubGlobal("fetch", claudeMock());
    await kiApi(anfrage("POST", "/api/ki/erklaeren", { frage: "x?" }), env, JETZT);
    const [, init] = fetch.mock.calls[0];
    expect(init.headers["x-api-key"]).toBe("mein-schluessel");
  });

  it("fremde Route → null; ohne Access → 401", async () => {
    expect(await kiApi(anfrage("GET", "/api/meta"), mockEnv(), JETZT)).toBeNull();
    const r = await kiApi(anfrage("GET", "/api/ki/status", null, false), mockEnv(), JETZT);
    expect(r.status).toBe(401);
  });

  it("status meldet fehlenden Schlüssel/KV ehrlich, sonst verfügbar mit Deckel", async () => {
    const ohne = await (await kiApi(anfrage("GET", "/api/ki/status"), mockEnv({ mitSchluessel: false }), JETZT)).json();
    expect(ohne.verfuegbar).toBe(false);
    expect(ohne.grund).toBe("kein-schluessel");
    const ohneKv = await (await kiApi(anfrage("GET", "/api/ki/status"), mockEnv({ mitKv: false }), JETZT)).json();
    expect(ohneKv.grund).toBe("kein-kv");
    const ok = await (await kiApi(anfrage("GET", "/api/ki/status"), mockEnv(), JETZT)).json();
    expect(ok).toMatchObject({ verfuegbar: true, grund: null, monat: "2026-10", deckelCent: 500, verbrauchtCent: 0 });
  });

  it("deckel: setzen, klemmen an der Obergrenze, Status liest ihn", async () => {
    const env = mockEnv();
    const r = await kiApi(anfrage("POST", "/api/ki/deckel", { deckelCent: 300 }), env, JETZT);
    expect(await r.json()).toEqual({ deckelCent: 300 });
    expect((await (await kiApi(anfrage("GET", "/api/ki/status"), env, JETZT)).json()).deckelCent).toBe(300);
    expect((await kiApi(anfrage("POST", "/api/ki/deckel", { deckelCent: 99 }), env, JETZT)).status).toBe(400);
    expect((await kiApi(anfrage("POST", "/api/ki/deckel", { deckelCent: 2000 }), env, JETZT)).status).toBe(400);
  });

  it("erklaeren: ruft Claude, bucht echte Kosten, liefert das Kurzformat", async () => {
    const env = mockEnv();
    const fetchMock = claudeMock({ input: 1000, output: 300 });
    vi.stubGlobal("fetch", fetchMock);
    const r = await kiApi(anfrage("POST", "/api/ki/erklaeren", {
      fach: "Deutsch", bereich: "Die 4 Fälle", frage: "In welchem Fall steht „dem Hund“?",
      optionen: ["Dativ", "Akkusativ"], loesung: "Dativ", tipp: "Frage: Wem?",
    }), env, JETZT);
    expect(r.status).toBe(200);
    const d = await r.json();
    expect(d.blasen.length).toBeLessThanOrEqual(2);
    expect(d.mach).toContain("LAUT");
    expect(d.kostenCent).toBe(0.03);
    expect(d.verbrauchtCent).toBe(0.03);
    // Anfrage an Claude: richtiges Modell, Schlüssel-Header, Lösung mit Warnung
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toContain("api.anthropic.com");
    expect(init.headers["x-api-key"]).toBe("test-schluessel");
    const body = JSON.parse(init.body);
    expect(body.model).toBe("claude-haiku-5-5");
    expect(body.messages[0].content).toContain("NICHT verraten");
    // Status zeigt den Posten
    const s = await (await kiApi(anfrage("GET", "/api/ki/status"), env, JETZT)).json();
    expect(s.verbrauchtCent).toBe(0.03);
    expect(s.posten[0]).toMatchObject({ zweck: "erklaeren", cent: 0.03 });
  });

  it("Deckel erreicht → 402, Claude wird gar nicht erst gerufen", async () => {
    const env = mockEnv();
    env._map.set("ki:monat:2026-10", JSON.stringify({ mikro: 500 * 10000, posten: [] }));
    const fetchMock = claudeMock();
    vi.stubGlobal("fetch", fetchMock);
    const r = await kiApi(anfrage("POST", "/api/ki/erklaeren", { frage: "Testfrage?" }), env, JETZT);
    expect(r.status).toBe(402);
    expect((await r.json()).grund).toBe("deckel");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("ohne Schlüssel 503; KI-Fehler → 502 und nichts gebucht", async () => {
    const ohne = await kiApi(anfrage("POST", "/api/ki/erklaeren", { frage: "x?" }), mockEnv({ mitSchluessel: false }), JETZT);
    expect(ohne.status).toBe(503);
    const env = mockEnv();
    vi.stubGlobal("fetch", vi.fn(async () => new Response("kaputt", { status: 500 })));
    const r = await kiApi(anfrage("POST", "/api/ki/erklaeren", { frage: "x?" }), env, JETZT);
    expect(r.status).toBe(502);
    const s = await (await kiApi(anfrage("GET", "/api/ki/status"), env, JETZT)).json();
    expect(s.verbrauchtCent).toBe(0);
  });
});
