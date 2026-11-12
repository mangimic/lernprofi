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
import { DEUTSCH_LISTE } from "./uebenGruppen.js";
import { MATHE_BEREICHE } from "./aufgaben/mathe.js";
import { SACH_BEREICHE } from "./aufgaben/sachkunde.js";
import { modulAn } from "./module.js";

/** Anzeigename eines Lernfelds (Deutsch, Mathe, Sachkunde, Stark). */
export function feldTitel(key) {
  if (key === "stark") return "Stark mit Leo";
  const b = [...DEUTSCH_LISTE, ...MATHE_BEREICHE, ...SACH_BEREICHE].find((x) => x.key === key);
  return b ? b.name : key;
}

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
  const gemessen = data.lernstand.einstufung?.empfehlung?.[0];
  const geschaetzt = schwerpunktFelder(data.profil.schwerpunkte)[0];
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
