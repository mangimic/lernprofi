/* ============================================================
   Tresor: verwaltet den Master-Schlüssel und die verschlüsselten
   Daten. Abgelegt wird AUSSCHLIESSLICH Chiffrat + technische Meta
   (Salts, Iterationszahl, umhüllte Schlüssel, PIN-Fehlversuche).

   Kindgerechter Zugang (Variante b):
   - Die Eltern legen den Tresor mit dem ELTERN-PASSWORT an und
     vergeben Felix' 4-stellige LERN-PIN.
   - Beide Geheimnisse hüllen denselben zufälligen Master-Schlüssel
     ein (PBKDF2 → AES-GCM-Wrap). Entsperren geht mit PIN ODER Passwort.
   - Nach MAX_PIN_VERSUCHE Fehlversuchen ist der PIN-Weg gesperrt,
     bis die Eltern einmal mit dem Passwort entsperren.
   Es gibt KEINE Wiederherstellung des Passworts – nur den
   JSON-Backup-Export.

   Alle Funktionen nehmen einen Speicher (get/set/del, async) –
   im Browser die IndexedDB-Hülle, in Tests ein In-Memory-Speicher.
   ============================================================ */
import {
  PBKDF2_ITERATIONEN, zufallsBytes, toB64, fromB64,
  schluesselAusGeheimnis, schluesselAusBytes, verschluesseln, entschluesseln,
} from "./crypto.js";

export const META_SCHLUESSEL = "tresor.meta";
export const DATEN_SCHLUESSEL = "tresor.daten";
export const MAX_PIN_VERSUCHE = 5;
const VERIFIER_TEXT = "lernprofi-tresor-ok";

export async function tresorVorhanden(speicher) {
  return !!(await speicher.get(META_SCHLUESSEL));
}

/** Legt einen neuen Tresor an. Überschreibt einen vorhandenen NICHT. */
export async function tresorAnlegen({ elternPasswort, kindPin }, speicher) {
  if (await tresorVorhanden(speicher)) throw new Error("Es gibt schon einen Tresor.");
  if (!elternPasswort || String(elternPasswort).length < 8) {
    throw new Error("Das Eltern-Passwort braucht mindestens 8 Zeichen.");
  }
  if (!/^\d{4}$/.test(String(kindPin))) throw new Error("Die Lern-PIN besteht aus genau 4 Ziffern.");

  const masterRoh = zufallsBytes(32);
  const masterB64 = toB64(masterRoh);
  const elternSalt = zufallsBytes(16);
  const pinSalt = zufallsBytes(16);
  const elternKey = await schluesselAusGeheimnis(elternPasswort, elternSalt);
  const pinKey = await schluesselAusGeheimnis(kindPin, pinSalt);
  const master = await schluesselAusBytes(masterRoh);

  const meta = {
    v: 1,
    iterationen: PBKDF2_ITERATIONEN,
    elternSalt: toB64(elternSalt),
    elternWrap: await verschluesseln(elternKey, masterB64),
    pinSalt: toB64(pinSalt),
    pinWrap: await verschluesseln(pinKey, masterB64),
    verifier: await verschluesseln(master, VERIFIER_TEXT),
    pinVersuche: 0,
  };
  await speicher.set(META_SCHLUESSEL, meta);
  return master;
}

async function masterAusWrap(geheimnis, saltB64, wrap, iterationen) {
  const key = await schluesselAusGeheimnis(geheimnis, fromB64(saltB64), iterationen);
  const masterB64 = await entschluesseln(key, wrap); // wirft bei falschem Geheimnis
  return schluesselAusBytes(fromB64(masterB64));
}

/** Eltern-Weg: entsperrt mit dem Passwort und setzt die PIN-Fehlversuche zurück. */
export async function entsperrenMitPasswort(passwort, speicher) {
  const meta = await speicher.get(META_SCHLUESSEL);
  if (!meta) throw new Error("Kein Tresor vorhanden.");
  const master = await masterAusWrap(passwort, meta.elternSalt, meta.elternWrap, meta.iterationen);
  await entschluesseln(master, meta.verifier);
  if (meta.pinVersuche > 0) { meta.pinVersuche = 0; await speicher.set(META_SCHLUESSEL, meta); }
  return master;
}

/** Kind-Weg: entsperrt mit der Lern-PIN; zählt Fehlversuche, sperrt nach MAX. */
export async function entsperrenMitPin(pin, speicher) {
  const meta = await speicher.get(META_SCHLUESSEL);
  if (!meta) throw new Error("Kein Tresor vorhanden.");
  if (meta.pinVersuche >= MAX_PIN_VERSUCHE) {
    const fehler = new Error("PIN-Weg gesperrt – bitte Mama oder Papa holen.");
    fehler.gesperrt = true;
    throw fehler;
  }
  try {
    const master = await masterAusWrap(pin, meta.pinSalt, meta.pinWrap, meta.iterationen);
    await entschluesseln(master, meta.verifier);
    if (meta.pinVersuche > 0) { meta.pinVersuche = 0; await speicher.set(META_SCHLUESSEL, meta); }
    return master;
  } catch {
    meta.pinVersuche = (meta.pinVersuche || 0) + 1;
    await speicher.set(META_SCHLUESSEL, meta);
    const fehler = new Error("Die PIN stimmt nicht.");
    fehler.versucheUebrig = Math.max(0, MAX_PIN_VERSUCHE - meta.pinVersuche);
    fehler.gesperrt = meta.pinVersuche >= MAX_PIN_VERSUCHE;
    throw fehler;
  }
}

/** Ändert die Lern-PIN (braucht das Eltern-Passwort). */
export async function pinAendern(elternPasswort, neuePin, speicher) {
  if (!/^\d{4}$/.test(String(neuePin))) throw new Error("Die Lern-PIN besteht aus genau 4 Ziffern.");
  const meta = await speicher.get(META_SCHLUESSEL);
  if (!meta) throw new Error("Kein Tresor vorhanden.");
  const elternKey = await schluesselAusGeheimnis(elternPasswort, fromB64(meta.elternSalt), meta.iterationen);
  const masterB64 = await entschluesseln(elternKey, meta.elternWrap);
  const pinSalt = zufallsBytes(16);
  const pinKey = await schluesselAusGeheimnis(neuePin, pinSalt);
  meta.pinSalt = toB64(pinSalt);
  meta.pinWrap = await verschluesseln(pinKey, masterB64);
  meta.pinVersuche = 0;
  await speicher.set(META_SCHLUESSEL, meta);
}

/** Speichert das Datendokument verschlüsselt. */
export async function datenSpeichern(master, dokument, speicher) {
  const paket = await verschluesseln(master, JSON.stringify(dokument));
  await speicher.set(DATEN_SCHLUESSEL, paket);
}

/** Lädt und entschlüsselt das Datendokument (null, wenn noch keins da ist). */
export async function datenLaden(master, speicher) {
  const paket = await speicher.get(DATEN_SCHLUESSEL);
  if (!paket) return null;
  return JSON.parse(await entschluesseln(master, paket));
}

/** Löscht Tresor samt Daten (nur für Eltern-Aktionen gedacht). */
export async function tresorLoeschen(speicher) {
  await speicher.del(DATEN_SCHLUESSEL);
  await speicher.del(META_SCHLUESSEL);
}
