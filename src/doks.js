/* ============================================================
   📂 Dokumenten-Ablage (Client-Seite).
   Dateien werden IM BROWSER mit dem Tresor-Schlüssel verschlüsselt
   und als { iv, chiffrat } zum Worker geschickt (KV "dok:<id>") –
   der Server sieht nie Klartext. Die Dateiliste (Name, Kategorie,
   Größe) lebt im Tresor-Dokument (data.doks) und synct wie alles.
   ============================================================ */

export const DOK_KATEGORIEN = [
  { key: "kompass-deutsch", name: "🧭 Kompass Deutsch" },
  { key: "kompass-mathe", name: "🧭 Kompass Mathe" },
  { key: "schule", name: "🏫 Schule" },
  { key: "sonstiges", name: "📎 Sonstiges" },
];
export const DOK_MAX_DATEI = 12 * 1024 * 1024; // 12 MB Klartext (Server: 18 MiB Chiffrat)

export function dokKategorieName(key) {
  const k = DOK_KATEGORIEN.find((x) => x.key === key);
  return k ? k.name : "📎 Sonstiges";
}

/** Neue, URL-taugliche Dokument-ID (zufällig, server-validiert). */
export function dokId() {
  const rand = Array.from(globalThis.crypto.getRandomValues(new Uint8Array(6)))
    .map((b) => (b % 36).toString(36)).join("");
  return `d${Date.now().toString(36)}${rand}`;
}

export function dokGroesseText(bytes) {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

const MIME = { pdf: "application/pdf", png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", gif: "image/gif", txt: "text/plain" };

export async function dokHochladen(id, paket) {
  const r = await fetch(`/api/doks/${id}`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(paket),
  });
  if (!r.ok) throw new Error((await r.json().catch(() => ({}))).fehler || `Upload fehlgeschlagen (${r.status}).`);
}

export async function dokHolen(id) {
  const r = await fetch(`/api/doks/${id}`);
  if (!r.ok) throw new Error(r.status === 404 ? "Dokument liegt nicht (mehr) auf dem Server." : `Laden fehlgeschlagen (${r.status}).`);
  return r.json();
}

export async function dokLoeschen(id) {
  const r = await fetch(`/api/doks/${id}`, { method: "DELETE" });
  if (!r.ok) throw new Error(`Löschen fehlgeschlagen (${r.status}).`);
}

/** Entschlüsselte Bytes im neuen Tab öffnen (PDF/Bild) – per Objekt-URL. */
export function dokAnzeigen(bytes, name) {
  const endung = (name.split(".").pop() || "").toLowerCase();
  const blob = new Blob([bytes], { type: MIME[endung] || "application/octet-stream" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.target = "_blank";
  a.rel = "noopener";
  if (!MIME[endung]) a.download = name; // Unbekanntes lieber herunterladen
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}
