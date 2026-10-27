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
const VERIFIER_TEXT = "lernprofi-tresor-ok"; // ⚠️ NIE ändern (auch nicht beim Rebranding) – sonst öffnen alte Tresore nicht mehr

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

/* 🧯 Wiederherstellungs-Code (v0.72): dritter Umschlag um denselben
   Master-Schlüssel. 25 Zufallszeichen ohne verwechselbare Buchstaben
   (kein i/l/o/0/1), angezeigt als 5er-Gruppen. Er löst das letzte
   Tresor-Risiko: Passwort vergessen ≠ Daten verloren. */
export const RETTUNG_ZEICHEN = "abcdefghjkmnpqrstuvwxyz23456789";
export const RETTUNG_LAENGE = 25;

/** Normalisiert Eingaben: Kleinschreibung, nur gültige Zeichen (Striche/Leerzeichen egal). */
export function rettungsCodeNormal(code) {
  return String(code || "").toLowerCase().split("").filter((z) => RETTUNG_ZEICHEN.includes(z)).join("");
}

/** Formatiert einen normalisierten Code in 5er-Gruppen (abcde-fghjk-…). */
export function rettungsCodeFormat(norm) {
  return (norm.match(/.{1,5}/g) || []).join("-");
}

export function rettungsCodeErzeugen() {
  const roh = zufallsBytes(RETTUNG_LAENGE);
  return rettungsCodeFormat([...roh].map((x) => RETTUNG_ZEICHEN[x % RETTUNG_ZEICHEN.length]).join(""));
}

/** Legt den Wiederherstellungs-Code an (braucht das Eltern-Passwort).
    Ein vorhandener Code wird ERSETZT (der alte wird damit ungültig). */
export async function rettungAnlegen(elternPasswort, speicher) {
  const meta = await speicher.get(META_SCHLUESSEL);
  if (!meta) throw new Error("Kein Tresor vorhanden.");
  const elternKey = await schluesselAusGeheimnis(elternPasswort, fromB64(meta.elternSalt), meta.iterationen);
  const masterB64 = await entschluesseln(elternKey, meta.elternWrap); // wirft bei falschem Passwort
  const code = rettungsCodeErzeugen();
  const rettungSalt = zufallsBytes(16);
  const rettungKey = await schluesselAusGeheimnis(rettungsCodeNormal(code), rettungSalt);
  meta.rettungSalt = toB64(rettungSalt);
  meta.rettungWrap = await verschluesseln(rettungKey, masterB64);
  await speicher.set(META_SCHLUESSEL, meta);
  return code;
}

/** Entsperrt mit dem Wiederherstellungs-Code (Striche/Großschreibung egal). */
export async function entsperrenMitRettungscode(code, speicher) {
  const meta = await speicher.get(META_SCHLUESSEL);
  if (!meta) throw new Error("Kein Tresor vorhanden.");
  if (!meta.rettungWrap) throw new Error("Für diesen Tresor wurde noch kein Wiederherstellungs-Code erzeugt.");
  const master = await masterAusWrap(rettungsCodeNormal(code), meta.rettungSalt, meta.rettungWrap, meta.iterationen);
  await entschluesseln(master, meta.verifier);
  return master;
}

/** „Passwort vergessen": setzt per Wiederherstellungs-Code ein NEUES
    Eltern-Passwort. Lern-PIN und Code selbst bleiben gültig. */
export async function passwortNeuSetzen(code, neuesPasswort, speicher) {
  if (!neuesPasswort || String(neuesPasswort).length < 8) {
    throw new Error("Das neue Eltern-Passwort braucht mindestens 8 Zeichen.");
  }
  const meta = await speicher.get(META_SCHLUESSEL);
  if (!meta) throw new Error("Kein Tresor vorhanden.");
  if (!meta.rettungWrap) throw new Error("Für diesen Tresor wurde noch kein Wiederherstellungs-Code erzeugt.");
  const rettungKey = await schluesselAusGeheimnis(rettungsCodeNormal(code), fromB64(meta.rettungSalt), meta.iterationen);
  let masterB64;
  try { masterB64 = await entschluesseln(rettungKey, meta.rettungWrap); }
  catch { throw new Error("Der Wiederherstellungs-Code stimmt nicht."); }
  const elternSalt = zufallsBytes(16);
  const elternKey = await schluesselAusGeheimnis(neuesPasswort, elternSalt);
  meta.elternSalt = toB64(elternSalt);
  meta.elternWrap = await verschluesseln(elternKey, masterB64);
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
