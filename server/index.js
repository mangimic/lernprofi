/* Cloudflare Worker: statische App aus dist/ (ASSETS-Binding) +
   Tresor-Sync-API unter /api/* (server/_lib/vaultApi.js) +
   KI-API unter /api/ki/* (server/_lib/kiApi.js) – beide getestet.
   Die KI-Route kommt zuerst, weil vaultApi alle übrigen /api/*
   Pfade mit 404 beantwortet. */
import { vaultApi } from "./_lib/vaultApi.js";
import { kiApi } from "./_lib/kiApi.js";

export default {
  async fetch(request, env) {
    const ki = await kiApi(request, env);
    if (ki) return ki;
    const api = await vaultApi(request, env);
    if (api) return api;
    return env.ASSETS.fetch(request);
  },
};
