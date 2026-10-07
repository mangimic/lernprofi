/* Cloudflare Worker: statische App aus dist/ (ASSETS-Binding) +
   Tresor-Sync-API unter /api/* (server/_lib/vaultApi.js, getestet). */
import { vaultApi } from "./_lib/vaultApi.js";

export default {
  async fetch(request, env) {
    const api = await vaultApi(request, env);
    if (api) return api;
    return env.ASSETS.fetch(request);
  },
};
