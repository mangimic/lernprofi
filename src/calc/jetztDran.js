/* ============================================================
   🎯 „Jetzt dran" – REINE Fachlogik für die Tagesbühne (v0.84).
   Die Startseite zeigt genau EINE Handlung: den ersten offenen
   Plan-Block von heute → sonst das empfohlene Lernfeld (gemessene
   Einstufung vor geschätzten Schwerpunkten) → sonst „Eine Runde üben".
   Dazu die Tages-Kennzahlen (Blöcke heute, Lernzeit frei, Münzen).
   Kein DOM, keine Uhr: `heute` kommt als ISO-Datum herein.
   ============================================================ */
import { wochenMontag, planFuerWoche, tagDatum, WOCHENTAGE, bausteinAnzeige, slotLabel } from "./wochenplan.js";
import { feldVonNotiz } from "./kompassPlan.js";
import { schwerpunktFelder } from "./onboarding.js";
import { zeitUebrigMin } from "./elternWerkzeuge.js";
import { feldTitel, feldInKlasse } from "./klassen.js";
import { modulAn } from "./module.js";

export { feldTitel }; // Anzeigename eines Lernfelds – lebt seit v0.87 in klassen.js

export function jetztDran(data, heute) {
  const montag = wochenMontag(heute);
  const plan = planFuerWoche(data.lernstand.wochenplan, montag);
  const idx = WOCHENTAGE.findIndex((_, i) => tagDatum(montag, i) === heute);
  // 🧩 Ohne das Modul „Plan" (Lern-App-Kern) gibt es keine Plan-Blöcke auf der Bühne.
  const heutePlan = modulAn(data, "plan")
    ? plan.bloecke.filter((b) => b.tag === idx).sort((a, b) => (a.slot ?? 9999) - (b.slot ?? 9999))
    : [];
  const geschafft = heutePlan.filter((b) => b.fertig).length;
  const kennzahlen = {
    geschafft, gesamt: heutePlan.length,
    zeitFrei: zeitUebrigMin(data.lernstand.zeit, data.einstellungen.zeitLimit, heute),
    muenzen: data.lernstand.muenzen || 0,
  };

  const offen = heutePlan.find((b) => !b.fertig);
  if (offen) {
    const info = bausteinAnzeige(offen.typ, data.einstellungen);
    const feld = offen.typ !== "eigen" ? feldVonNotiz(offen.notiz) : null;
    return {
      art: "plan", blockId: offen.id, feld,
      titel: offen.notiz || info.name,
      untertitel: `${Number.isInteger(offen.slot) ? `${slotLabel(offen.slot)} · ` : ""}${info.name}`,
      knopf: feld ? "Los geht's" : "Zum Plan",
      ...kennzahlen,
    };
  }
  // 🎒 Nur Felder der aktuellen Klasse empfehlen (nach einem Klassenwechsel
  // zeigt eine alte Empfehlung sonst auf Felder, die es dort nicht gibt).
  const klasse = data.profil.klasse;
  const gemessen = (data.lernstand.einstufung?.empfehlung || []).find((k) => feldInKlasse(k, klasse));
  const geschaetzt = schwerpunktFelder(data.profil.schwerpunkte, klasse).find((k) => feldInKlasse(k, klasse));
  const feld = gemessen || geschaetzt || null;
  if (feld) {
    return {
      art: "feld", feld, blockId: null,
      titel: feldTitel(feld),
      untertitel: gemessen ? "Aus deiner Kennenlern-Runde" : "Schwerpunkt deiner Eltern",
      knopf: "Los geht's",
      ...kennzahlen,
    };
  }
  return {
    art: "ueben", feld: null, blockId: null,
    titel: "Eine Runde üben",
    untertitel: "Such dir ein Lernfeld aus",
    knopf: "Zum Üben",
    ...kennzahlen,
  };
}
