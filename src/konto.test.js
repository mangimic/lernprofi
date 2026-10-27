import { describe, it, expect, vi, afterEach } from "vitest";
import { authBeweis, emailNormal, EMAIL_GUELTIG, kontoStatus } from "./konto.js";

afterEach(() => vi.unstubAllGlobals());

describe("konto – Anmelde-Beweis (Zero-Knowledge)", () => {
  // Kleine Iterationszahl NUR im Test (Tempo) – die Ableitung selbst ist identisch.
  const ITER = 100;

  it("deterministisch: gleiche E-Mail + Passwort → gleicher Beweis; E-Mail wird normalisiert", async () => {
    const a = await authBeweis("Eltern@Example.com ", "geheimes-passwort", ITER);
    const b = await authBeweis("eltern@example.com", "geheimes-passwort", ITER);
    expect(a).toBe(b);
    expect(a.length).toBeGreaterThanOrEqual(20); // passt in die Server-Grenzen (20–200)
    expect(a.length).toBeLessThanOrEqual(200);
  });

  it("andere E-Mail ODER anderes Passwort → anderer Beweis (getrennte Salts wirken)", async () => {
    const basis = await authBeweis("a@b.de", "geheimes-passwort", ITER);
    expect(await authBeweis("x@y.de", "geheimes-passwort", ITER)).not.toBe(basis);
    expect(await authBeweis("a@b.de", "anderes-passwort", ITER)).not.toBe(basis);
  });

  it("emailNormal und EMAIL_GUELTIG: trimmen, Kleinschreibung, einfache Prüfung", () => {
    expect(emailNormal("  A@B.De ")).toBe("a@b.de");
    expect(EMAIL_GUELTIG.test("a@b.de")).toBe(true);
    expect(EMAIL_GUELTIG.test("keinemail")).toBe(false);
    expect(EMAIL_GUELTIG.test("a b@c.de")).toBe(false);
  });

  it("kontoStatus meldet offline ehrlich statt zu werfen", async () => {
    vi.stubGlobal("fetch", () => Promise.reject(new Error("offline")));
    expect(await kontoStatus()).toEqual({ angemeldet: false, grund: "offline" });
    vi.stubGlobal("fetch", () => Promise.resolve(new Response(JSON.stringify({ angemeldet: true, kontoId: "stamm", art: "stamm" }))));
    expect(await kontoStatus()).toMatchObject({ angemeldet: true, art: "stamm" });
  });
});
