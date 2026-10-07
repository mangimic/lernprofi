/* ============================================================
   Verschlüsselung im Browser (Zero-Knowledge-Tresor).
   - Schlüsselableitung: PBKDF2 (SHA-256, 310.000 Iterationen,
     zufälliges Salt) aus Passwort oder Lern-PIN
   - Daten: AES-256-GCM (zufällige 12-Byte-IV je Vorgang)
   - Base64 in Blöcken, damit auch große Puffer sicher wandeln
   Es gibt KEINE Passwort-Wiederherstellung – dafür den
   JSON-Backup-Export im Elternbereich.
   ============================================================ */
const TE = new TextEncoder();
const TD = new TextDecoder();

export const PBKDF2_ITERATIONEN = 310000;

export function zufallsBytes(n) {
  const b = new Uint8Array(n);
  globalThis.crypto.getRandomValues(b);
  return b;
}

/** Base64 in Blöcken – vermeidet Stack-Grenzen bei großen Puffern. */
export function toB64(bytes) {
  const BLOCK = 0x8000;
  let s = "";
  for (let i = 0; i < bytes.length; i += BLOCK) {
    s += String.fromCharCode(...bytes.subarray(i, i + BLOCK));
  }
  return btoa(s);
}

export function fromB64(s) {
  const roh = atob(s);
  const b = new Uint8Array(roh.length);
  for (let i = 0; i < roh.length; i++) b[i] = roh.charCodeAt(i);
  return b;
}

/** Leitet aus einem Geheimnis (Passwort/PIN) einen AES-Schlüssel ab. */
export async function schluesselAusGeheimnis(geheimnis, salt, iterationen = PBKDF2_ITERATIONEN) {
  const basis = await globalThis.crypto.subtle.importKey(
    "raw", TE.encode(String(geheimnis)), "PBKDF2", false, ["deriveKey"],
  );
  return globalThis.crypto.subtle.deriveKey(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations: iterationen },
    basis,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

/** Importiert rohe 32 Schlüssel-Bytes als (nicht exportierbaren) AES-Schlüssel. */
export async function schluesselAusBytes(rohBytes) {
  return globalThis.crypto.subtle.importKey(
    "raw", rohBytes, { name: "AES-GCM" }, false, ["encrypt", "decrypt"],
  );
}

/** Verschlüsselt einen String → { iv, chiffrat } (beides Base64). */
export async function verschluesseln(schluessel, klartext) {
  const iv = zufallsBytes(12);
  const chiffrat = await globalThis.crypto.subtle.encrypt(
    { name: "AES-GCM", iv }, schluessel, TE.encode(String(klartext)),
  );
  return { iv: toB64(iv), chiffrat: toB64(new Uint8Array(chiffrat)) };
}

/** Entschlüsselt { iv, chiffrat } → String. Wirft bei falschem Schlüssel. */
export async function entschluesseln(schluessel, paket) {
  const klar = await globalThis.crypto.subtle.decrypt(
    { name: "AES-GCM", iv: fromB64(paket.iv) }, schluessel, fromB64(paket.chiffrat),
  );
  return TD.decode(klar);
}
