/* ============================================================
   🤖 KI-API (läuft im Cloudflare Worker, Etappe 7).
   Grundsätze:
   - Der Anthropic-API-Schlüssel liegt NUR hier (Worker-Secret
     ANTHROPIC_API_KEY) – nie in der App, nie im Repo.
   - Harter Kostendeckel: Jeder Aufruf wird mit den echten
     Token-Zahlen in Mikro-Dollar gezählt (KV, je Monat). Ist der
     Deckel erreicht, antwortet der Server 402 – die App kann das
     nicht umgehen. Obergrenze: env.KI_DECKEL_MAX_CENT (Standard 1000).
   - Kurzformat erzwungen: Die KI liefert JSON (Blasen + Mach-Aufgabe);
     der Server stutzt auf höchstens 2 Blasen à 12 Wörter zurecht und
     der Wort-Wächter filtert Diagnose- und Druck-Wörter.
   - Datensparsamkeit: Es kommt nur die konkrete Aufgabe an – nie der
     Name, nie das Lernprofil.

   Endpunkte:
     GET  /api/ki/status             → { verfuegbar, deckelCent, verbrauchtCent, monat, posten }
     POST /api/ki/deckel  { deckelCent }
     POST /api/ki/erklaeren { fach, bereich, frage, optionen, loesung, tipp, kontext? }
          → { blasen: [≤2], mach, kostenCent, verbrauchtCent, deckelCent }
   ============================================================ */
import { zugriffErlaubt } from "./vaultApi.js";

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
export const KI_MODELLE = {
  erklaeren: "claude-haiku-5-5",
};
// US-Dollar je Million Token (Ein-/Ausgabe); wir rechnen 1 $ ≈ 1 € und runden auf.
export const PREISE_USD_MTOK = {
  "claude-haiku-5-5": { ein: 0.10, aus: 0.50 },
  "claude-opus-5-5": { ein: 4.00, aus: 20.00 },
};
export const MAX_BLASEN = 2;
export const MAX_WOERTER = 12;

const VERBOTEN = ["adhs", "störung", "stoerung", "diagnose", "defizit", "unmotiviert", "versager", "dumm", "faul", "zappel", "krank"];

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}

/** Monats-Schlüssel für den Kostenzähler, z. B. "2026-10". */
export function monatsKey(jetzt = new Date()) {
  return `${jetzt.getUTCFullYear()}-${String(jetzt.getUTCMonth() + 1).padStart(2, "0")}`;
}

/** Kosten eines Aufrufs in Mikro-Dollar (ganzzahlig, aufgerundet). */
export function kostenMikro(modell, usage) {
  const p = PREISE_USD_MTOK[modell];
  if (!p || !usage) return 0;
  const ein = Math.max(0, usage.input_tokens || 0);
  const aus = Math.max(0, usage.output_tokens || 0);
  return Math.ceil(ein * p.ein + aus * p.aus);
}
export const mikroZuCent = (mikro) => Math.round(mikro / 100) / 100; // 1 Cent = 10.000 µ$

/** Wort-Wächter: dieselbe Sprachregel wie im Rest der App. */
export function wortProblem(text) {
  const t = String(text || "").toLowerCase();
  return VERBOTEN.some((w) => t.includes(w));
}

function woerterKuerzen(satz, max = MAX_WOERTER) {
  const woerter = String(satz || "").trim().split(/\s+/).filter(Boolean);
  if (woerter.length <= max + 2) return woerter.join(" "); // 2 Wörter Toleranz
  return woerter.slice(0, max).join(" ") + " …";
}

/** Zieht aus der Roh-Antwort das erzwungene Kurzformat (robust gegen Geplauder). */
export function antwortZurechtstutzen(rohText) {
  let geparst = null;
  const treffer = String(rohText || "").match(/\{[\s\S]*\}/);
  if (treffer) { try { geparst = JSON.parse(treffer[0]); } catch { geparst = null; } }
  const blasen = (Array.isArray(geparst?.blasen) ? geparst.blasen : [String(rohText || "").trim()])
    .map((b) => woerterKuerzen(b)).filter(Boolean).slice(0, MAX_BLASEN);
  const mach = woerterKuerzen(geparst?.mach || "Tipp auf Weiter und probier es nochmal!", 14);
  const alles = blasen.join(" ") + " " + mach;
  if (!blasen.length || wortProblem(alles)) {
    return {
      blasen: ["Puh, das erkläre ich dir gleich nochmal in Ruhe. 💙"],
      mach: "Atme einmal tief durch – dann nochmal in Ruhe lesen.",
      ersetzt: true,
    };
  }
  return { blasen, mach, ersetzt: false };
}

const LEO_SYSTEM = `Du bist Coach Leo 🦁 in einer Lern-App für ein Kind in Klasse 4 (Grundschule, Deutschland).
Das Kind hat eine Aufgabe zweimal nicht geschafft. Erkläre sie NEU und ANDERS als der mitgelieferte Tipp.
REGELN (alle verbindlich):
- Antworte NUR mit JSON: {"blasen":["…","…"],"mach":"…"} – nichts davor, nichts danach.
- Höchstens 2 Blasen, jede höchstens 12 Wörter. Einfache Wörter, du-Form.
- Nutze ein Bild aus der Kinderwelt: Fußball, Angeln, Tennis, Pausenhof oder Familie. Gern 1-2 Emojis.
- "mach" ist eine kleine Mach-Aufgabe mit Körper oder Stimme (laut sagen, mit dem Finger zeigen, in die Luft schreiben) – höchstens 14 Wörter.
- Verrate NIEMALS die Lösung und nenne sie nicht wörtlich.
- Immer freundlich und bestärkend. Niemals Diagnose-Wörter, niemals Druck, keine Noten.`;

async function claudeAnfragen(env, { modell, system, prompt, maxTokens }) {
  const antwort = await fetch(ANTHROPIC_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: modell,
      max_tokens: maxTokens,
      system,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!antwort.ok) {
    const text = await antwort.text().catch(() => "");
    throw new Error(`claude ${antwort.status}: ${text.slice(0, 200)}`);
  }
  const daten = await antwort.json();
  const textBlock = (daten.content || []).find((b) => b.type === "text");
  return { text: textBlock?.text || "", usage: daten.usage || {} };
}

/** Behandelt /api/ki/*-Anfragen. Gibt null zurück, wenn die Route fremd ist. */
export async function kiApi(request, env, jetzt = new Date()) {
  const url = new URL(request.url);
  if (!url.pathname.startsWith("/api/ki/")) return null;
  if (!zugriffErlaubt(request, env)) return json(401, { fehler: "Kein Zugang (Cloudflare Access fehlt)." });

  const kv = env?.TRESOR;
  const schluesselDa = !!env?.ANTHROPIC_API_KEY;
  const maxDeckel = Math.max(100, parseInt(env?.KI_DECKEL_MAX_CENT || "1000", 10) || 1000);
  const monat = monatsKey(jetzt);

  const deckelLesen = async () => {
    const v = kv ? parseInt((await kv.get("ki:deckel")) || "", 10) : NaN;
    return Number.isInteger(v) && v >= 100 ? Math.min(v, maxDeckel) : Math.min(500, maxDeckel);
  };
  const standLesen = async () =>
    (kv && (await kv.get(`ki:monat:${monat}`, "json"))) || { mikro: 0, posten: [] };

  if (url.pathname === "/api/ki/status" && request.method === "GET") {
    const deckelCent = await deckelLesen();
    const s = await standLesen();
    return json(200, {
      verfuegbar: schluesselDa && !!kv,
      grund: !kv ? "kein-kv" : !schluesselDa ? "kein-schluessel" : null,
      monat, deckelCent, maxDeckelCent: maxDeckel,
      verbrauchtCent: mikroZuCent(s.mikro),
      posten: (s.posten || []).slice(-10).reverse().map((p) => ({ ...p, cent: mikroZuCent(p.mikro) })),
    });
  }

  if (url.pathname === "/api/ki/deckel" && request.method === "POST") {
    if (!kv) return json(503, { fehler: "KV-Namespace fehlt (docs/DEPLOY-CLOUDFLARE.md)." });
    let eingabe;
    try { eingabe = await request.json(); } catch { return json(400, { fehler: "Kein gültiges JSON." }); }
    const cent = parseInt(eingabe?.deckelCent, 10);
    if (!Number.isInteger(cent) || cent < 100 || cent > maxDeckel) {
      return json(400, { fehler: `deckelCent muss zwischen 100 und ${maxDeckel} liegen.` });
    }
    await kv.put("ki:deckel", String(cent));
    return json(200, { deckelCent: cent });
  }

  if (url.pathname === "/api/ki/erklaeren" && request.method === "POST") {
    if (!kv) return json(503, { grund: "kein-kv", fehler: "KV-Namespace fehlt." });
    if (!schluesselDa) return json(503, { grund: "kein-schluessel", fehler: "ANTHROPIC_API_KEY fehlt (docs/DEPLOY-CLOUDFLARE.md)." });
    let eingabe;
    try { eingabe = await request.json(); } catch { return json(400, { fehler: "Kein gültiges JSON." }); }
    const frage = String(eingabe?.frage || "").slice(0, 400);
    if (!frage) return json(400, { fehler: "Erwartet { frage, … }." });

    const deckelCent = await deckelLesen();
    const stand = await standLesen();
    if (stand.mikro >= deckelCent * 10000) {
      return json(402, { grund: "deckel", deckelCent, verbrauchtCent: mikroZuCent(stand.mikro) });
    }

    const teile = [
      `Fach: ${String(eingabe?.fach || "").slice(0, 40)} · Bereich: ${String(eingabe?.bereich || "").slice(0, 60)}`,
      eingabe?.kontext ? `Kontext: ${String(eingabe.kontext).slice(0, 300)}` : "",
      `Aufgabe: ${frage}`,
      Array.isArray(eingabe?.optionen) && eingabe.optionen.length
        ? `Antwortmöglichkeiten: ${eingabe.optionen.slice(0, 4).map((o) => String(o).slice(0, 60)).join(" | ")}` : "",
      `Richtige Lösung (NICHT verraten!): ${String(eingabe?.loesung || "").slice(0, 80)}`,
      `Bisheriger Tipp (etwas ANDERES erklären): ${String(eingabe?.tipp || "").slice(0, 200)}`,
    ].filter(Boolean).join("\n");

    const modell = KI_MODELLE.erklaeren;
    let roh;
    try {
      roh = await claudeAnfragen(env, { modell, system: LEO_SYSTEM, prompt: teile, maxTokens: 300 });
    } catch {
      return json(502, { grund: "ki-fehler", fehler: "Die KI hat gerade nicht geantwortet – später nochmal." });
    }

    const mikro = kostenMikro(modell, roh.usage);
    const posten = [...(stand.posten || []), { zeit: jetzt.toISOString(), zweck: "erklaeren", mikro }].slice(-20);
    await kv.put(`ki:monat:${monat}`, JSON.stringify({ mikro: stand.mikro + mikro, posten }));

    const sauber = antwortZurechtstutzen(roh.text);
    return json(200, {
      blasen: sauber.blasen, mach: sauber.mach,
      kostenCent: mikroZuCent(mikro),
      verbrauchtCent: mikroZuCent(stand.mikro + mikro),
      deckelCent,
    });
  }

  return json(404, { fehler: "Unbekannte KI-Route." });
}
