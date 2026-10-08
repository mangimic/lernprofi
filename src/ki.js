/* ============================================================
   🤖 KI-Client (Etappe 7): dünne Helfer um /api/ki/*.
   Der Worker hält den Schlüssel und den Kostendeckel – hier wird
   nur gefragt und freundlich mit Fehlern umgegangen.
   ============================================================ */

async function anfrage(pfad, options) {
  const antwort = await fetch(pfad, {
    headers: { "content-type": "application/json" },
    ...options,
  });
  let daten = null;
  try { daten = await antwort.json(); } catch { daten = null; }
  return { status: antwort.status, daten };
}

/** Status für die Eltern-Karte: Verfügbarkeit, Deckel, Verbrauch, Posten. */
export async function kiStatus() {
  try {
    const { status, daten } = await anfrage("/api/ki/status", { method: "GET" });
    if (status === 200 && daten) return daten;
    if (status === 401) return { verfuegbar: false, grund: "kein-zugang" };
    return { verfuegbar: false, grund: "nicht-eingerichtet" };
  } catch {
    return { verfuegbar: false, grund: "offline" };
  }
}

/** Monatsdeckel setzen (Eltern). */
export async function kiDeckelSetzen(deckelCent) {
  try {
    const { status, daten } = await anfrage("/api/ki/deckel", {
      method: "POST", body: JSON.stringify({ deckelCent }),
    });
    return status === 200 ? { ok: true, ...daten } : { ok: false };
  } catch { return { ok: false }; }
}

/** 🖐️ Schreib-Training: Foto (Base64 ohne Daten-Präfix) + Soll-Satz → Leos Schrift-Blick.
    daten: { bild, satz, typ ("image/jpeg"|"image/png"), modell } */
export async function kiSchrift(daten) {
  try {
    const { status, daten: d } = await anfrage("/api/ki/schrift", {
      method: "POST", body: JSON.stringify(daten),
    });
    if (status === 200 && d?.sterne?.length) return { ok: true, ...d };
    if (status === 402) return { ok: false, grund: "deckel" };
    return { ok: false, grund: d?.grund || "fehler" };
  } catch {
    return { ok: false, grund: "offline" };
  }
}

/** 🦁 „Erklär es mir anders“: holt 1-2 Blasen + Mach-Aufgabe.
    aufgabe.modell: "haiku" | "sonnet" | "opus" (Eltern-Wahl). */
export async function kiErklaeren(aufgabe) {
  try {
    const { status, daten } = await anfrage("/api/ki/erklaeren", {
      method: "POST", body: JSON.stringify(aufgabe),
    });
    if (status === 200 && daten?.blasen?.length) return { ok: true, ...daten };
    if (status === 402) return { ok: false, grund: "deckel" };
    return { ok: false, grund: daten?.grund || "fehler" };
  } catch {
    return { ok: false, grund: "offline" };
  }
}
