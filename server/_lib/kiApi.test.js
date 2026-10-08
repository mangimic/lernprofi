import { describe, it, expect, vi, afterEach } from "vitest";
import {
  kiApi, kostenMikro, mikroZuCent, monatsKey, antwortZurechtstutzen, schriftZurechtstutzen,
  aufsatzZurechtstutzen, wortProblem, MAX_BLASEN, MAX_WOERTER,
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
      async delete(k) { m.delete(k); },
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
    expect(wortProblem("Der Krankenwagen kommt schnell.")).toBe(false); // ganzes Wort zählt, Teilwort nicht
    expect(wortProblem("Sei nicht so faul.")).toBe(true);
    const s = antwortZurechtstutzen('{"blasen":["Das liegt an deiner Störung."],"mach":"Üb halt mehr."}');
    expect(s.ersetzt).toBe(true);
    expect(s.blasen.join(" ")).not.toMatch(/Störung/);
  });

  it("schriftZurechtstutzen: 2 Sterne + Übe-Buchstabe + Mach; Fallback bei Müll", () => {
    const gut = schriftZurechtstutzen(
      'Hier: {"sterne":["Dein M sitzt sauber auf der Linie! ⭐","Schöne Lücken zwischen den Wörtern."],' +
      '"uebe":{"buchstabe":"e","blase":"Das e ist oft zu eng."},"mach":"Schreib das e RIESIG in die Luft!"}',
    );
    expect(gut.sterne.length).toBe(2);
    expect(gut.uebe).toEqual({ buchstabe: "e", blase: "Das e ist oft zu eng." });
    expect(gut.mach).toContain("RIESIG");
    expect(gut.ersetzt).toBe(false);
    // lange Sterne werden gestutzt, Buchstabe auf 2 Zeichen begrenzt
    const lang = Array.from({ length: 30 }, (_, i) => "wort" + i).join(" ");
    const gekuerzt = schriftZurechtstutzen(`{"sterne":["${lang}","ok"],"uebe":{"buchstabe":"Sch","blase":"x"},"mach":"y"}`);
    expect(gekuerzt.sterne[0].endsWith("…")).toBe(true);
    expect(gekuerzt.uebe.buchstabe).toBe("Sc");
    // kein JSON / Wort-Wächter → kompletter Ersatz
    expect(schriftZurechtstutzen("Blabla ohne JSON").ersetzt).toBe(true);
    const boese = schriftZurechtstutzen('{"sterne":["Du bist zu faul zum Schreiben.","x"],"uebe":{"buchstabe":"a","blase":"y"},"mach":"z"}');
    expect(boese.ersetzt).toBe(true);
    expect([...boese.sterne, boese.mach].join(" ")).not.toMatch(/faul/);
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
    expect(d.kostenCent).toBe(0.5);
    expect(d.verbrauchtCent).toBe(0.5);
    // Anfrage an Claude: richtiges Modell, Schlüssel-Header, Lösung mit Warnung
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toContain("api.anthropic.com");
    expect(init.headers["x-api-key"]).toBe("test-schluessel");
    const body = JSON.parse(init.body);
    expect(body.model).toBe("claude-sonnet-5-5"); // Standard-Modell
    expect(body.thinking).toEqual({ type: "between_tools" }); // Sonnet: so ist Vordenken aus
    expect(body.max_tokens).toBeGreaterThanOrEqual(400);
    expect(body.messages[0].content).toContain("NICHT verraten");
    // Status zeigt den Posten
    const s = await (await kiApi(anfrage("GET", "/api/ki/status"), env, JETZT)).json();
    expect(s.verbrauchtCent).toBe(0.5);
    expect(s.posten[0]).toMatchObject({ zweck: "erklaeren", modell: "sonnet", cent: 0.5 });
  });

  it("Modell-Wahl: haiku ohne Vordenken, opus mit effort low; Unsinn fällt auf den Standard", async () => {
    const env = mockEnv();
    const fetchMock = claudeMock({ input: 1000, output: 300 });
    vi.stubGlobal("fetch", fetchMock);
    await kiApi(anfrage("POST", "/api/ki/erklaeren", { frage: "x?", modell: "haiku" }), env, JETZT);
    let body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.model).toBe("claude-haiku-5-5");
    expect(body.thinking).toEqual({ type: "disabled" });
    await kiApi(anfrage("POST", "/api/ki/erklaeren", { frage: "x?", modell: "opus" }), env, JETZT);
    body = JSON.parse(fetchMock.mock.calls[1][1].body);
    expect(body.model).toBe("claude-opus-5-5");
    expect(body.thinking).toBeUndefined(); // Opus denkt immer – kein disabled senden!
    expect(body.output_config).toEqual({ effort: "low" });
    expect(body.max_tokens).toBeGreaterThanOrEqual(1000);
    const r = await kiApi(anfrage("POST", "/api/ki/erklaeren", { frage: "x?", modell: "quatsch" }), env, JETZT);
    expect(JSON.parse(fetchMock.mock.calls[2][1].body).model).toBe("claude-sonnet-5-5");
    expect(r.status).toBe(200);
    // Kosten je Modell korrekt: haiku 0,03 + opus 1 + sonnet 0,5
    const st = await (await kiApi(anfrage("GET", "/api/ki/status"), env, JETZT)).json();
    expect(st.verbrauchtCent).toBe(1.53);
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

  it("schrift: schickt Bild + Satz an Claude, bucht den Posten als schrift", async () => {
    const env = mockEnv();
    const fetchMock = claudeMock({
      text: '{"sterne":["Dein L steht kerzengerade! ⭐","Alle Wörter sitzen auf der Linie."],' +
        '"uebe":{"buchstabe":"e","blase":"Das e ist manchmal zu eng."},"mach":"Schreib das e RIESIG in die Luft!"}',
      input: 2000, output: 300,
    });
    vi.stubGlobal("fetch", fetchMock);
    const bild = "a".repeat(200);
    const r = await kiApi(anfrage("POST", "/api/ki/schrift", {
      bild, satz: "Der Hecht wehrt sich dreimal.", typ: "image/jpeg", modell: "haiku",
    }), env, JETZT);
    expect(r.status).toBe(200);
    const d = await r.json();
    expect(d.sterne.length).toBe(2);
    expect(d.uebe.buchstabe).toBe("e");
    expect(d.mach).toContain("Luft");
    // Anfrage an Claude: Bild-Block zuerst, dann der Soll-Satz als Text
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.model).toBe("claude-haiku-5-5");
    expect(body.messages[0].content[0]).toEqual({
      type: "image", source: { type: "base64", media_type: "image/jpeg", data: bild },
    });
    expect(body.messages[0].content[1].text).toContain("Der Hecht wehrt sich dreimal.");
    expect(body.system).toContain("HANDSCHRIFT");
    // Posten gebucht
    const s = await (await kiApi(anfrage("GET", "/api/ki/status"), env, JETZT)).json();
    expect(s.posten[0]).toMatchObject({ zweck: "schrift", modell: "haiku" });
  });

  it("schrift: PNG-Typ wird übernommen; ohne/zu großes Bild 400; Deckel 402 ohne Claude-Ruf", async () => {
    const env = mockEnv();
    const fetchMock = claudeMock();
    vi.stubGlobal("fetch", fetchMock);
    await kiApi(anfrage("POST", "/api/ki/schrift", { bild: "b".repeat(200), satz: "x", typ: "image/png" }), env, JETZT);
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).messages[0].content[0].source.media_type).toBe("image/png");
    expect((await kiApi(anfrage("POST", "/api/ki/schrift", { satz: "x" }), env, JETZT)).status).toBe(400);
    expect((await kiApi(anfrage("POST", "/api/ki/schrift", { bild: "kurz", satz: "x" }), env, JETZT)).status).toBe(400);
    expect((await kiApi(anfrage("POST", "/api/ki/schrift", { bild: "c".repeat(1_500_001), satz: "x" }), env, JETZT)).status).toBe(400);
    env._map.set("ki:monat:2026-10", JSON.stringify({ mikro: 500 * 10000, posten: [] }));
    const voll = await kiApi(anfrage("POST", "/api/ki/schrift", { bild: "d".repeat(200), satz: "x" }), env, JETZT);
    expect(voll.status).toBe(402);
    expect(fetchMock).toHaveBeenCalledTimes(1); // kein zweiter Ruf trotz 4 weiterer Anfragen
  });

  it("aufsatz: Kriterien je Textart, Posten „aufsatz“, Whitelist; Stutzer mit Tipp-Stelle", async () => {
    const env = mockEnv();
    const fetchMock = claudeMock({
      text: '{"sterne":["Deine Reihenfolge stimmt – Schritt für Schritt! ⭐","„Zuerst“ und „danach“ nutzt du super."],' +
        '"tipp":{"stelle":"dann kommt das Wasser","blase":"Hier fehlt, WIE VIEL Wasser – sag es genau."},' +
        '"mach":"Lies die Stelle LAUT und ruf die fehlende Menge dazu!"}',
    });
    vi.stubGlobal("fetch", fetchMock);
    const r = await kiApi(anfrage("POST", "/api/ki/aufsatz", {
      bild: "e".repeat(200), textart: "vorgang", modell: "haiku",
    }), env, JETZT);
    expect(r.status).toBe(200);
    const d = await r.json();
    expect(d.sterne.length).toBe(2);
    expect(d.tipp.stelle).toBe("dann kommt das Wasser");
    expect(d.mach).toContain("LAUT");
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.messages[0].content[0].type).toBe("image");
    expect(body.messages[0].content[1].text).toContain("Vorgangsbeschreibung");
    expect(body.system).toContain("AUFSATZ");
    expect(body.system).toContain("NIEMALS eine Fehlerliste");
    const s = await (await kiApi(anfrage("GET", "/api/ki/status"), env, JETZT)).json();
    expect(s.posten[0]).toMatchObject({ zweck: "aufsatz", modell: "haiku" });
    // unbekannte Textart und fehlendes Bild → 400
    expect((await kiApi(anfrage("POST", "/api/ki/aufsatz", { bild: "f".repeat(200), textart: "krimi" }), env, JETZT)).status).toBe(400);
    expect((await kiApi(anfrage("POST", "/api/ki/aufsatz", { textart: "vorgang" }), env, JETZT)).status).toBe(400);
    // Stutzer: ohne JSON oder mit Druck-Wörtern → freundlicher Ersatz
    expect(aufsatzZurechtstutzen("Geplauder").ersetzt).toBe(true);
    const boese = aufsatzZurechtstutzen('{"sterne":["Sei nicht so faul.","x"],"tipp":{"stelle":"a","blase":"b"},"mach":"c"}');
    expect(boese.ersetzt).toBe(true);
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

  it("Diagnose: 502 nennt die Ursache, Status merkt sie sich, Erfolg löscht sie wieder", async () => {
    const env = mockEnv();
    vi.stubGlobal("fetch", vi.fn(async () => new Response("invalid x-api-key", { status: 401 })));
    const r = await kiApi(anfrage("POST", "/api/ki/erklaeren", { frage: "x?" }), env, JETZT);
    expect(r.status).toBe(502);
    expect((await r.json()).detail).toContain("claude 401");
    const s = await (await kiApi(anfrage("GET", "/api/ki/status"), env, JETZT)).json();
    expect(s.letzterFehler).toMatchObject({ zweck: "erklaeren", zeit: JETZT.toISOString() });
    expect(s.letzterFehler.detail).toContain("invalid x-api-key");
    // nächster erfolgreicher Aufruf räumt den gemerkten Fehler weg
    vi.stubGlobal("fetch", claudeMock());
    await kiApi(anfrage("POST", "/api/ki/erklaeren", { frage: "x?" }), env, JETZT);
    const s2 = await (await kiApi(anfrage("GET", "/api/ki/status"), env, JETZT)).json();
    expect(s2.letzterFehler).toBeNull();
  });
});
