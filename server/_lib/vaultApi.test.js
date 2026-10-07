import { describe, it, expect } from "vitest";
import { vaultApi, zugriffErlaubt } from "./vaultApi.js";

// Mini-Mocks: KV als Map, Requests als echte Request-Objekte (Node 22).
function mockEnv({ mitKv = true, dev = false } = {}) {
  const m = new Map();
  return {
    DEV_OHNE_ACCESS: dev ? "1" : undefined,
    TRESOR: mitKv ? {
      async get(k, art) { const v = m.get(k); return art === "json" && v ? JSON.parse(v) : v ?? null; },
      async put(k, v) { m.set(k, v); },
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
});
