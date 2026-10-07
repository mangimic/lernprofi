import { describe, it, expect } from "vitest";
import {
  tresorAnlegen, tresorVorhanden, entsperrenMitPasswort, entsperrenMitPin,
  pinAendern, datenSpeichern, datenLaden, tresorLoeschen,
  MAX_PIN_VERSUCHE, META_SCHLUESSEL,
} from "./vault.js";
import { toB64, fromB64, verschluesseln, entschluesseln, schluesselAusBytes, zufallsBytes } from "./crypto.js";

// In-Memory-Speicher für Tests (gleiche Schnittstelle wie die IndexedDB-Hülle)
function testSpeicher() {
  const m = new Map();
  return {
    async get(k) { return m.get(k); },
    async set(k, v) { m.set(k, v); },
    async del(k) { m.delete(k); },
    _roh: m,
  };
}

// Fiktive Zugangsdaten – niemals echte Daten in Tests.
const PASSWORT = "test-eltern-passwort";
const PIN = "1234";

describe("crypto", () => {
  it("Base64 in Blöcken übersteht große Puffer", () => {
    const gross = Uint8Array.from({ length: 300000 }, (_, i) => (i * 7) % 256);
    expect(fromB64(toB64(gross))).toEqual(gross);
  });

  it("verschlüsseln/entschlüsseln ist ein Kreis, falscher Schlüssel wirft", async () => {
    const a = await schluesselAusBytes(zufallsBytes(32));
    const b = await schluesselAusBytes(zufallsBytes(32));
    const paket = await verschluesseln(a, "geheimer Text äöü 🎒");
    expect(await entschluesseln(a, paket)).toBe("geheimer Text äöü 🎒");
    await expect(entschluesseln(b, paket)).rejects.toThrow();
  });
});

describe("vault", () => {
  it("anlegen + beide Entsperr-Wege + Daten-Kreis", async () => {
    const sp = testSpeicher();
    expect(await tresorVorhanden(sp)).toBe(false);
    const master = await tresorAnlegen({ elternPasswort: PASSWORT, kindPin: PIN }, sp);
    expect(await tresorVorhanden(sp)).toBe(true);

    await datenSpeichern(master, { profil: { name: "Kind" }, muenzen: 7 }, sp);
    const mitPin = await entsperrenMitPin(PIN, sp);
    expect(await datenLaden(mitPin, sp)).toEqual({ profil: { name: "Kind" }, muenzen: 7 });
    const mitPasswort = await entsperrenMitPasswort(PASSWORT, sp);
    expect((await datenLaden(mitPasswort, sp)).muenzen).toBe(7);
  });

  it("es liegt nur Chiffrat im Speicher, nie Klartext", async () => {
    const sp = testSpeicher();
    const master = await tresorAnlegen({ elternPasswort: PASSWORT, kindPin: PIN }, sp);
    await datenSpeichern(master, { name: "SehrGeheimerName", muenzen: 3 }, sp);
    const alles = JSON.stringify([...sp._roh.entries()]);
    expect(alles).not.toContain("SehrGeheimerName");
    expect(alles).not.toContain(PASSWORT);
  });

  it("falsches Passwort und falsche PIN werfen", async () => {
    const sp = testSpeicher();
    await tresorAnlegen({ elternPasswort: PASSWORT, kindPin: PIN }, sp);
    await expect(entsperrenMitPasswort("falsch-falsch", sp)).rejects.toThrow();
    await expect(entsperrenMitPin("0000", sp)).rejects.toThrow();
  });

  it("PIN sperrt nach zu vielen Fehlversuchen, Eltern-Passwort entsperrt wieder", async () => {
    const sp = testSpeicher();
    await tresorAnlegen({ elternPasswort: PASSWORT, kindPin: PIN }, sp);
    for (let i = 0; i < MAX_PIN_VERSUCHE; i++) {
      await expect(entsperrenMitPin("9999", sp)).rejects.toThrow();
    }
    // jetzt ist sogar die RICHTIGE PIN gesperrt
    await expect(entsperrenMitPin(PIN, sp)).rejects.toMatchObject({ gesperrt: true });
    // Eltern entsperren -> Zähler zurück -> PIN geht wieder
    await entsperrenMitPasswort(PASSWORT, sp);
    expect((await sp.get(META_SCHLUESSEL)).pinVersuche).toBe(0);
    await expect(entsperrenMitPin(PIN, sp)).resolves.toBeTruthy();
  });

  it("PIN ändern: alte PIN tot, neue PIN lebt", async () => {
    const sp = testSpeicher();
    await tresorAnlegen({ elternPasswort: PASSWORT, kindPin: PIN }, sp);
    await pinAendern(PASSWORT, "5678", sp);
    await expect(entsperrenMitPin(PIN, sp)).rejects.toThrow();
    await expect(entsperrenMitPin("5678", sp)).resolves.toBeTruthy();
  });

  it("Regeln bei der Anlage: Passwort ≥ 8 Zeichen, PIN genau 4 Ziffern, kein Überschreiben", async () => {
    const sp = testSpeicher();
    await expect(tresorAnlegen({ elternPasswort: "kurz", kindPin: PIN }, sp)).rejects.toThrow();
    await expect(tresorAnlegen({ elternPasswort: PASSWORT, kindPin: "12" }, sp)).rejects.toThrow();
    await tresorAnlegen({ elternPasswort: PASSWORT, kindPin: PIN }, sp);
    await expect(tresorAnlegen({ elternPasswort: PASSWORT, kindPin: PIN }, sp)).rejects.toThrow();
  });

  it("löschen räumt auf", async () => {
    const sp = testSpeicher();
    const master = await tresorAnlegen({ elternPasswort: PASSWORT, kindPin: PIN }, sp);
    await datenSpeichern(master, { a: 1 }, sp);
    await tresorLoeschen(sp);
    expect(await tresorVorhanden(sp)).toBe(false);
  });
});
