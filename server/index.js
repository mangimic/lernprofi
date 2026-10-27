/* Cloudflare Worker: statische App aus dist/ (ASSETS-Binding) +
   Konto-API unter /api/konto* (server/_lib/kontoApi.js) +
   Tresor-Sync-API unter /api/* (server/_lib/vaultApi.js) +
   KI-API unter /api/ki/* (server/_lib/kiApi.js) – alle getestet.
   Reihenfolge: ki und konto zuerst, weil vaultApi alle übrigen
   /api/*-Pfade mit 404 beantwortet. */
import { vaultApi } from "./_lib/vaultApi.js";
import { kontoApi } from "./_lib/kontoApi.js";
import { kiApi } from "./_lib/kiApi.js";

export default {
  async fetch(request, env) {
    const ki = await kiApi(request, env);
    if (ki) return ki;
    const konto = await kontoApi(request, env);
    if (konto) return konto;
    const api = await vaultApi(request, env);
    if (api) return api;
    return env.ASSETS.fetch(request);
  },
};
