import { describe, it, expect } from "vitest";
import { vaultApi, zugriffErlaubt } from "./vaultApi.js";

// Mini-Mocks: KV als Map, Requests als echte Request-Objekte (Node 22).
function mockEnv({ mitKv = true, dev = false, stammEmails } = {}) {
  const m = new Map();
  return {
    DEV_OHNE_ACCESS: dev ? "1" : undefined,
    STAMM_EMAILS: stammEmails,
    _map: m,
    TRESOR: mitKv ? {
      async get(k, art) { const v = m.get(k); return art === "json" && v ? JSON.parse(v) : v ?? null; },
      async put(k, v) { m.set(k, v); },
      async delete(k) { m.delete(k); },
    } : undefined,
  };
}
const anfrage = (methode, pfad, body, mitAccess = true) =>
  new Request("https://lernprofi.example" + pfad, {
    method: methode,
    headers: mitAccess ? { "Cf-Access-Authenticated-User-Email": "test@example.com" } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
const BLOBS = { "tresor.meta": { v: 1, elternWrap: { iv: "aa", chiffrat: "bb" } }, "tresor.daten": { iv: "cc", chiffrat: "dd" } };

describe("vaultApi", () => {
  it("fremde Routen gehen an die Assets (null), /api ohne Access → 401", async () => {
    const env = mockEnv();
    expect(await vaultApi(anfrage("GET", "/index.html"), env)).toBeNull();
    const r = await vaultApi(anfrage("GET", "/api/meta", null, false), env);
    expect(r.status).toBe(401);
    expect(zugriffErlaubt(anfrage("GET", "/api/meta", null, false), mockEnv({ dev: true }))).toBe(true);
  });

  it("ohne KV-Namespace: 503 mit klarer Meldung", async () => {
    const r = await vaultApi(anfrage("GET", "/api/meta"), mockEnv({ mitKv: false }));
    expect(r.status).toBe(503);
  });

  it("leerer Stand → rev 0; PUT speichert und zählt hoch; GET liefert Blobs", async () => {
    const env = mockEnv();
    expect(await (await vaultApi(anfrage("GET", "/api/meta"), env)).json()).toMatchObject({ rev: 0 });
    const put = await vaultApi(anfrage("PUT", "/api/vault", { baseRev: 0, blobs: BLOBS }), env);
    expect(put.status).toBe(200);
    expect(await put.json()).toEqual({ rev: 1 });
    const get = await vaultApi(anfrage("GET", "/api/vault"), env);
    const stand = await get.json();
    expect(stand.rev).toBe(1);
    expect(stand.blobs).toEqual(BLOBS);
    expect(stand.aktualisiert).toBeTruthy();
  });

  it("409 bei fremder baseRev – nichts wird still überschrieben", async () => {
    const env = mockEnv();
    await vaultApi(anfrage("PUT", "/api/vault", { baseRev: 0, blobs: BLOBS }), env);
    const konflikt = await vaultApi(anfrage("PUT", "/api/vault", { baseRev: 0, blobs: BLOBS }), env);
    expect(konflikt.status).toBe(409);
    expect((await konflikt.json()).rev).toBe(1);
    const ok = await vaultApi(anfrage("PUT", "/api/vault", { baseRev: 1, blobs: BLOBS }), env);
    expect(ok.status).toBe(200);
  });

  it("validiert Eingaben: kaputtes JSON, fremde Blob-Schlüssel, fehlende baseRev → 400", async () => {
    const env = mockEnv();
    const kaputt = await vaultApi(new Request("https://x/api/vault", {
      method: "PUT", headers: { "Cf-Access-Authenticated-User-Email": "t@e.de" }, body: "{kaputt",
    }), env);
    expect(kaputt.status).toBe(400);
    expect((await vaultApi(anfrage("PUT", "/api/vault", { baseRev: 0, blobs: { boese: 1 } }), env)).status).toBe(400);
    expect((await vaultApi(anfrage("PUT", "/api/vault", { blobs: BLOBS }), env)).status).toBe(400);
    expect((await vaultApi(anfrage("GET", "/api/quatsch"), env)).status).toBe(404);
  });

  it("📂 Doks: PUT legt Chiffrat ab, GET liefert es, DELETE räumt auf – nur saubere IDs", async () => {
    const env = mockEnv();
    const paket = { iv: "aWY=", chiffrat: "Y2hpZmZyYXQ=" };
    expect((await vaultApi(anfrage("PUT", "/api/doks/dabc123", paket), env)).status).toBe(200);
    const get = await vaultApi(anfrage("GET", "/api/doks/dabc123"), env);
    expect(get.status).toBe(200);
    expect(await get.json()).toEqual(paket);
    expect((await vaultApi(anfrage("DELETE", "/api/doks/dabc123"), env)).status).toBe(200);
    expect((await vaultApi(anfrage("GET", "/api/doks/dabc123"), env)).status).toBe(404);
    // Validierung: böse IDs und kaputte Pakete kommen nicht durch
    expect((await vaultApi(anfrage("PUT", "/api/doks/..%2Ftresor", paket), env)).status).toBe(400);
    expect((await vaultApi(anfrage("PUT", "/api/doks/AB", paket), env)).status).toBe(400);
    expect((await vaultApi(anfrage("PUT", "/api/doks/dabc123", { iv: 1 }), env)).status).toBe(400);
    expect((await vaultApi(anfrage("GET", "/api/doks/dabc123", null, false), env)).status).toBe(401);
  });

  it("🔒 Access-Brücke endet mit der Verknüpfung: konto:stamm da → 401, Tresor und Doks bleiben unberührt", async () => {
    const env = mockEnv();
    const paket = { iv: "aWY=", chiffrat: "Y2hpZmZyYXQ=" };
    // unverknüpft trägt die Brücke (Bestand vor der Verknüpfung)
    expect((await vaultApi(anfrage("PUT", "/api/vault", { baseRev: 0, blobs: BLOBS }), env)).status).toBe(200);
    expect((await vaultApi(anfrage("PUT", "/api/doks/dabc123", paket), env)).status).toBe(200);
    const vorher = new Map(env._map);
    // Stamm-Konto verknüpft → derselbe Header ist kein Zugang mehr
    env._map.set("konto:stamm", JSON.stringify({ kontoId: "stamm", email: "familie@example.com" }));
    const andere = { "tresor.meta": { v: 1 }, "tresor.daten": { iv: "xx", chiffrat: "FREMD" } };
    for (const r of [
      anfrage("GET", "/api/meta"), anfrage("GET", "/api/vault"),
      anfrage("PUT", "/api/vault", { baseRev: 1, blobs: andere }),
      anfrage("GET", "/api/doks/dabc123"), anfrage("PUT", "/api/doks/dabc123", { iv: "eA==", chiffrat: "RlJFTUQ=" }),
      anfrage("DELETE", "/api/doks/dabc123"),
    ]) {
      expect((await vaultApi(r, env)).status, `${r.method} ${new URL(r.url).pathname}`).toBe(401);
    }
    expect(env._map.get("tresor:stamm")).toBe(vorher.get("tresor:stamm"));
    expect(env._map.get("dok:stamm:dabc123")).toBe(vorher.get("dok:stamm:dabc123"));
  });

  it("🔒 STAMM_EMAILS: fremde Access-E-Mail → 401, gelistete → Brücke (bis zur Verknüpfung)", async () => {
    const env = mockEnv({ stammEmails: "eltern@example.com" });
    const als = (email) => new Request("https://lernprofi.example/api/meta", {
      headers: { "Cf-Access-Authenticated-User-Email": email },
    });
    expect((await vaultApi(anfrage("GET", "/api/meta"), env)).status).toBe(401); // test@example.com steht nicht drin
    expect((await vaultApi(als("Eltern@Example.com"), env)).status).toBe(200);
    env._map.set("konto:stamm", JSON.stringify({ kontoId: "stamm", email: "eltern@example.com" }));
    expect((await vaultApi(als("eltern@example.com"), env)).status).toBe(401);
  });

  it("DEV_OHNE_ACCESS=1 (nur wrangler dev): API arbeitet ohne Header weiter – auch nach der Verknüpfung", async () => {
    const env = mockEnv({ dev: true });
    expect((await vaultApi(anfrage("PUT", "/api/vault", { baseRev: 0, blobs: BLOBS }, false), env)).status).toBe(200);
    env._map.set("konto:stamm", JSON.stringify({ kontoId: "stamm", email: "familie@example.com" }));
    const stand = await (await vaultApi(anfrage("GET", "/api/vault", null, false), env)).json();
    expect(stand).toMatchObject({ rev: 1, blobs: BLOBS });
  });
});
