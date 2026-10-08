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

/** Der Anthropic-Schlüssel: Secret heißt bei uns "lernprofiapi"
    (so im Cloudflare-Dashboard angelegt); ANTHROPIC_API_KEY geht auch. */
export function apiSchluessel(env) {
  return env?.ANTHROPIC_API_KEY || env?.lernprofiapi || "";
}

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
/* Modell-Wahl (Eltern): jede Stufe braucht ihre eigene Denk-Konfiguration –
   Haiku darf das Vordenken abschalten, Sonnet nur über "between_tools",
   Opus denkt immer (dafür Stufe "low" und mehr Token-Luft). */
export const MODELL_KONFIG = {
  haiku: { id: "claude-haiku-5-5", koerper: { thinking: { type: "disabled" }, max_tokens: 500 } },
  sonnet: { id: "claude-sonnet-5-5", koerper: { thinking: { type: "between_tools" }, max_tokens: 500 } },
  opus: { id: "claude-opus-5-5", koerper: { output_config: { effort: "low" }, max_tokens: 1500 } },
};
export const MODELL_STANDARD = "sonnet";
export function modellWahl(wunsch) {
  return MODELL_KONFIG[wunsch] ? wunsch : MODELL_STANDARD;
}
// US-Dollar je Million Token (Ein-/Ausgabe); wir rechnen 1 $ ≈ 1 € und runden auf.
export const PREISE_USD_MTOK = {
  "claude-haiku-5-5": { ein: 0.10, aus: 0.50 },
  "claude-sonnet-5-5": { ein: 2.00, aus: 10.00 },
  "claude-opus-5-5": { ein: 4.00, aus: 20.00 },
};
export const MAX_BLASEN = 2;
export const MAX_WOERTER = 12;

// Diagnose-/Druck-Wörter: immer verboten als Teilwort; Alltagswörter wie
// dumm/faul/krank nur als GANZES Wort (sonst träfe es „Krankenwagen").
const VERBOTEN_MUSTER = /\b(dumm|faul|krank)\b|adhs|störung|stoerung|diagnose|defizit|unmotiviert|versager|zappel/i;

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
  return VERBOTEN_MUSTER.test(String(text || ""));
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
- Immer freundlich und bestärkend. Niemals Diagnose-Wörter, niemals Druck, keine Noten.
BEISPIEL (für eine Dativ-Aufgabe):
{"blasen":["⚽ Beim Training gibst du den Ball – aber WEM?","Die Frage „wem?“ ist dein Spürhund für diesen Fall."],"mach":"Frag LAUT: Wem gibt er den Ball? Zeig auf die Antwort!"}`;

const LEO_SCHRIFT = `Du bist Coach Leo 🦁. Ein Kind (Klasse 4, Deutschland) hat einen Satz MIT DER HAND
geschrieben und fotografiert. Bewerte NUR die HANDSCHRIFT – niemals Inhalt oder Rechtschreibung.
Schau auf: Sitzen die Wörter auf der Linie? Sind die Buchstaben gleichmäßig groß? Gibt es
Lücken zwischen den Wörtern? Welcher Buchstabe ist besonders gelungen, welcher braucht Übung?
REGELN (alle verbindlich):
- Antworte NUR mit JSON: {"sterne":["…","…"],"uebe":{"buchstabe":"e","blase":"…"},"mach":"…"}.
- "sterne": GENAU 2 konkrete Stärken, je höchstens 12 Wörter, mit dem Buchstaben/Merkmal benannt.
- "uebe": genau EIN Buchstabe (klein- oder Großbuchstabe aus dem Foto) + 1 kurzer Satz dazu.
- "mach" ist eine Körper-Übung für genau diesen Buchstaben (RIESIG in die Luft schreiben,
  mit dem Finger auf den Tisch, 3-mal nachspuren) – höchstens 14 Wörter.
- Du-Form, einfach, bestärkend, gern 1-2 Emojis. Niemals Diagnose-Wörter, niemals Druck.
- Ist auf dem Foto keine Handschrift zu erkennen, sage das freundlich in "sterne"[0] und
  bitte in "mach" um ein neues Foto bei gutem Licht.`;

/** Schrift-Antwort in die feste Form bringen (2 Sterne, 1 Übe-Buchstabe, Mach-Aufgabe). */
export function schriftZurechtstutzen(rohText) {
  let geparst = null;
  const treffer = String(rohText || "").match(/\{[\s\S]*\}/);
  if (treffer) { try { geparst = JSON.parse(treffer[0]); } catch { geparst = null; } }
  const kuerzen = (satz, max) => {
    const w = String(satz || "").trim().split(/\s+/).filter(Boolean);
    return w.length <= max + 2 ? w.join(" ") : w.slice(0, max).join(" ") + " …";
  };
  const sterne = (Array.isArray(geparst?.sterne) ? geparst.sterne : [])
    .map((x) => kuerzen(x, MAX_WOERTER)).filter(Boolean).slice(0, 2);
  const buchstabe = String(geparst?.uebe?.buchstabe || "").slice(0, 2);
  const uebeBlase = kuerzen(geparst?.uebe?.blase || "", MAX_WOERTER);
  const mach = kuerzen(geparst?.mach || "Schreib den Satz morgen gleich nochmal – du wirst besser!", 14);
  const alles = [...sterne, uebeBlase, mach].join(" ");
  if (!sterne.length || wortProblem(alles)) {
    return {
      sterne: ["Dein Blatt ist angekommen – stark, dass du geschrieben hast! ⭐"],
      uebe: { buchstabe: "", blase: "Das Foto war schwer zu lesen." },
      mach: "Mach es nochmal bei hellem Licht, Blatt gerade halten. 📸",
      ersetzt: true,
    };
  }
  return { sterne, uebe: { buchstabe, blase: uebeBlase }, mach, ersetzt: false };
}

async function claudeAnfragen(env, { konfig, system, prompt }) {
  // prompt: String ODER fertige Content-Block-Liste (z. B. Bild + Text)
  const antwort = await fetch(ANTHROPIC_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiSchluessel(env),
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: konfig.id,
      ...konfig.koerper,
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
  const schluesselDa = !!apiSchluessel(env);
  const maxDeckel = Math.max(100, parseInt(env?.KI_DECKEL_MAX_CENT || "1000", 10) || 1000);
  const monat = monatsKey(jetzt);

  const deckelLesen = async () => {
    const v = kv ? parseInt((await kv.get("ki:deckel")) || "", 10) : NaN;
    return Number.isInteger(v) && v >= 100 ? Math.min(v, maxDeckel) : Math.min(500, maxDeckel);
  };
  const standLesen = async () =>
    (kv && (await kv.get(`ki:monat:${monat}`, "json"))) || { mikro: 0, posten: [] };

  // Diagnose: Der letzte echte Claude-Fehler wird gemerkt (und beim nächsten
  // Erfolg gelöscht), damit Eltern die Ursache sehen statt nur „nicht erreichbar".
  const fehlerMerken = async (zweck, e) => {
    const detail = String(e?.message || e).slice(0, 300);
    if (kv) await kv.put("ki:fehler", JSON.stringify({ zeit: jetzt.toISOString(), zweck, detail }));
    return detail;
  };
  const fehlerLoeschen = async () => { if (kv?.delete) await kv.delete("ki:fehler"); };

  if (url.pathname === "/api/ki/status" && request.method === "GET") {
    const deckelCent = await deckelLesen();
    const s = await standLesen();
    return json(200, {
      verfuegbar: schluesselDa && !!kv,
      grund: !kv ? "kein-kv" : !schluesselDa ? "kein-schluessel" : null,
      monat, deckelCent, maxDeckelCent: maxDeckel,
      verbrauchtCent: mikroZuCent(s.mikro),
      posten: (s.posten || []).slice(-10).reverse().map((p) => ({ ...p, cent: mikroZuCent(p.mikro) })),
      letzterFehler: (kv && (await kv.get("ki:fehler", "json"))) || null,
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

    const wahl = modellWahl(eingabe?.modell);
    const konfig = MODELL_KONFIG[wahl];
    let roh;
    try {
      roh = await claudeAnfragen(env, { konfig, system: LEO_SYSTEM, prompt: teile });
    } catch (e) {
      const detail = await fehlerMerken("erklaeren", e);
      return json(502, { grund: "ki-fehler", fehler: "Die KI hat gerade nicht geantwortet – später nochmal.", detail });
    }
    await fehlerLoeschen();

    const mikro = kostenMikro(konfig.id, roh.usage);
    const posten = [...(stand.posten || []), { zeit: jetzt.toISOString(), zweck: "erklaeren", modell: wahl, mikro }].slice(-20);
    await kv.put(`ki:monat:${monat}`, JSON.stringify({ mikro: stand.mikro + mikro, posten }));

    const sauber = antwortZurechtstutzen(roh.text);
    return json(200, {
      blasen: sauber.blasen, mach: sauber.mach,
      kostenCent: mikroZuCent(mikro),
      verbrauchtCent: mikroZuCent(stand.mikro + mikro),
      deckelCent,
    });
  }

  if (url.pathname === "/api/ki/schrift" && request.method === "POST") {
    if (!kv) return json(503, { grund: "kein-kv", fehler: "KV-Namespace fehlt." });
    if (!schluesselDa) return json(503, { grund: "kein-schluessel", fehler: "API-Schlüssel fehlt (docs/DEPLOY-CLOUDFLARE.md)." });
    let eingabe;
    try { eingabe = await request.json(); } catch { return json(400, { fehler: "Kein gültiges JSON." }); }
    const bild = String(eingabe?.bild || "");
    const satz = String(eingabe?.satz || "").slice(0, 120);
    if (!bild || bild.length < 100) return json(400, { fehler: "Erwartet { bild (Base64-JPEG), satz }." });
    if (bild.length > 1_500_000) return json(400, { fehler: "Das Foto ist zu groß – die App verkleinert es normalerweise selbst." });

    const deckelCent = await deckelLesen();
    const stand = await standLesen();
    if (stand.mikro >= deckelCent * 10000) {
      return json(402, { grund: "deckel", deckelCent, verbrauchtCent: mikroZuCent(stand.mikro) });
    }

    const wahl = modellWahl(eingabe?.modell);
    const konfig = MODELL_KONFIG[wahl];
    let roh;
    try {
      roh = await claudeAnfragen(env, {
        konfig, system: LEO_SCHRIFT,
        prompt: [
          { type: "image", source: { type: "base64", media_type: eingabe?.typ === "image/png" ? "image/png" : "image/jpeg", data: bild } },
          { type: "text", text: `Der Satz, den das Kind abschreiben sollte: „${satz}“` },
        ],
      });
    } catch (e) {
      const detail = await fehlerMerken("schrift", e);
      return json(502, { grund: "ki-fehler", fehler: "Die KI hat gerade nicht geantwortet – später nochmal.", detail });
    }
    await fehlerLoeschen();

    const mikro = kostenMikro(konfig.id, roh.usage);
    const posten = [...(stand.posten || []), { zeit: jetzt.toISOString(), zweck: "schrift", modell: wahl, mikro }].slice(-20);
    await kv.put(`ki:monat:${monat}`, JSON.stringify({ mikro: stand.mikro + mikro, posten }));

    const sauber = schriftZurechtstutzen(roh.text);
    return json(200, {
      sterne: sauber.sterne, uebe: sauber.uebe, mach: sauber.mach,
      kostenCent: mikroZuCent(mikro),
      verbrauchtCent: mikroZuCent(stand.mikro + mikro),
      deckelCent,
    });
  }

  return json(404, { fehler: "Unbekannte KI-Route." });
}
