/* ============================================================
   Kleine window.storage-Hülle über IndexedDB (Schlüssel/Wert).
   Der Tresor legt hier NUR Chiffrate und technische Metadaten ab.
   ============================================================ */
const DB_NAME = "lernprofi";
const STORE = "kv";

function oeffnen() {
  return new Promise((aufloesen, ablehnen) => {
    const anfrage = indexedDB.open(DB_NAME, 1);
    anfrage.onupgradeneeded = () => anfrage.result.createObjectStore(STORE);
    anfrage.onsuccess = () => aufloesen(anfrage.result);
    anfrage.onerror = () => ablehnen(anfrage.error);
  });
}

function vorgang(db, modus, arbeit) {
  return new Promise((aufloesen, ablehnen) => {
    const tx = db.transaction(STORE, modus);
    const laden = arbeit(tx.objectStore(STORE));
    tx.oncomplete = () => aufloesen(laden.result);
    tx.onerror = () => ablehnen(tx.error);
  });
}

export const idbStorage = {
  async get(schluessel) {
    const db = await oeffnen();
    try { return await vorgang(db, "readonly", (s) => s.get(schluessel)); } finally { db.close(); }
  },
  async set(schluessel, wert) {
    const db = await oeffnen();
    try { return await vorgang(db, "readwrite", (s) => s.put(wert, schluessel)); } finally { db.close(); }
  },
  async del(schluessel) {
    const db = await oeffnen();
    try { return await vorgang(db, "readwrite", (s) => s.delete(schluessel)); } finally { db.close(); }
  },
};

if (typeof window !== "undefined") window.storage = idbStorage;
