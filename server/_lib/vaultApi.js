/* ============================================================
   Tresor-Sync-API (läuft im Cloudflare Worker, Etappe 6).
   Zero-Knowledge: Der Server speichert AUSSCHLIESSLICH die
   Chiffrate des Geräte-Tresors (tresor.meta + tresor.daten) und
   eine monotone Revisionsnummer – nie Klartext, nie Schlüssel.

   Endpunkte:
     GET /api/meta   → { rev, aktualisiert }            (ohne Blobs)
     GET /api/vault  → { rev, blobs }
     PUT /api/vault  { baseRev, blobs } → { rev }
                       bei fremder baseRev: 409 { rev } – der Client
                       fragt nach, nichts wird still überschrieben.

   Zugang: Cloudflare Access sitzt vor der Domain; zusätzlich prüft
   die API den Header Cf-Access-Authenticated-User-Email.
   DEV_OHNE_ACCESS=1 nur für lokales `wrangler dev`, nie produktiv.
   ============================================================ */
const KV_SCHLUESSEL = "tresor:v1";
const BLOB_SCHLUESSEL = ["tresor.meta", "tresor.daten"];
const MAX_BYTES = 2 * 1024 * 1024; // 2 MiB Chiffrat reichen weit

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}

export function zugriffErlaubt(request, env) {
  if (env && env.DEV_OHNE_ACCESS === "1") return true;
  return !!request.headers.get("Cf-Access-Authenticated-User-Email");
}

function blobsGueltig(blobs) {
  if (!blobs || typeof blobs !== "object" || Array.isArray(blobs)) return false;
  const schluessel = Object.keys(blobs);
  if (!schluessel.length || !schluessel.every((k) => BLOB_SCHLUESSEL.includes(k))) return false;
  return JSON.stringify(blobs).length <= MAX_BYTES;
}

/** Behandelt /api/*-Anfragen. Gibt null zurück, wenn die Route fremd ist. */
export async function vaultApi(request, env) {
  const url = new URL(request.url);
  if (!url.pathname.startsWith("/api/")) return null;
  if (!zugriffErlaubt(request, env)) return json(401, { fehler: "Kein Zugang (Cloudflare Access fehlt)." });
  if (!env || !env.TRESOR) return json(503, { fehler: "Sync ist noch nicht eingerichtet (KV-Namespace fehlt)." });

  const stand = async () => (await env.TRESOR.get(KV_SCHLUESSEL, "json")) || { rev: 0, blobs: null, aktualisiert: null };

  if (url.pathname === "/api/meta" && request.method === "GET") {
    const s = await stand();
    return json(200, { rev: s.rev, aktualisiert: s.aktualisiert });
  }
  if (url.pathname === "/api/vault" && request.method === "GET") {
    const s = await stand();
    return json(200, { rev: s.rev, blobs: s.blobs, aktualisiert: s.aktualisiert });
  }
  if (url.pathname === "/api/vault" && request.method === "PUT") {
    let eingabe;
    try { eingabe = await request.json(); } catch { return json(400, { fehler: "Kein gültiges JSON." }); }
    if (!Number.isInteger(eingabe?.baseRev) || !blobsGueltig(eingabe?.blobs)) {
      return json(400, { fehler: "Erwartet { baseRev, blobs } mit Tresor-Chiffraten." });
    }
    const s = await stand();
    if (eingabe.baseRev !== s.rev) {
      return json(409, { rev: s.rev, aktualisiert: s.aktualisiert });
    }
    const neu = { rev: s.rev + 1, blobs: eingabe.blobs, aktualisiert: new Date().toISOString() };
    await env.TRESOR.put(KV_SCHLUESSEL, JSON.stringify(neu));
    return json(200, { rev: neu.rev });
  }
  return json(404, { fehler: "Unbekannte API-Route." });
}
