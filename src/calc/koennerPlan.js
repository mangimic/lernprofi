/* ============================================================
   🏅 Mathekönner-Wochenende – REINE Fachlogik, „heute" als Parameter.
   Plant die drei Schwerpunkte einmalig aufs KOMMENDE Wochenende:
   Samstag 1×1 + Rechengeschichten, Sonntag Zahlen bis 10 000.
   Regeln wie beim Kompass: nur freie Fenster (feste Termine bleiben),
   zwischen zwei Blöcken am selben Tag liegt eine Pause, nichts wird
   doppelt eingeplant. Ist der Samstag schon vorbei, rutscht alles in
   die nächste Woche.
   ============================================================ */
import {
  wochenMontag, tagDatum, planFuerWoche, planSchreiben,
  blockHinzu, blockNotiz, slotBelegt, festerTermin, istAusgefallen, tagesStunden,
} from "./wochenplan.js";

/** Anzeigename je Mathekönner-Feld (≤24 Zeichen – passt in die Block-Notiz). */
export const KOENNER_FELD_NAMEN = {
  mk1x1: "1×1-Training",
  mkgesch: "Rechengeschichten",
  mkzr: "Zahlen bis 10 000",
};

// Samstag: 1×1 + Rechengeschichten · Sonntag: Zahlenraum
const WOCHENENDE = [
  { tag: 5, feld: "mk1x1" },
  { tag: 5, feld: "mkgesch" },
  { tag: 6, feld: "mkzr" },
];

function slotFrei(plan, feste, tag, slot) {
  if (slotBelegt(plan, tag, slot)) return false;
  const f = festerTermin(feste, tag, slot);
  return !f || istAusgefallen(plan, tag, f.beginn);
}

function ersterFreierSlot(plan, feste, tag, datum, abMin = 0) {
  for (const slot of tagesStunden(tag, datum)) {
    if (slot >= abMin && slotFrei(plan, feste, tag, slot)) return slot;
  }
  return null;
}

/** Plant das Mathekönner-Wochenende in den Plan. Ergebnis:
    { doc, montag, eingeplant, schonDa, keinPlatz }. */
export function koennerEinplanen(doc, heute, feste) {
  let montag = wochenMontag(heute);
  if (heute > tagDatum(montag, 5)) montag = tagDatum(montag, 7); // Samstag vorbei → nächste Woche
  let plan = planFuerWoche(doc, montag);
  let eingeplant = 0, schonDa = 0, keinPlatz = 0;
  const belegtAb = {}; // je Tag: frühester Slot für den NÄCHSTEN Block (mit Pause)
  for (const { tag, feld } of WOCHENENDE) {
    const notiz = KOENNER_FELD_NAMEN[feld];
    if (plan.bloecke.some((b) => b.typ === "mathe" && b.notiz === notiz)) { schonDa++; continue; }
    const datum = tagDatum(montag, tag);
    const slot = ersterFreierSlot(plan, feste, tag, datum, belegtAb[tag] || 0);
    if (slot === null) { keinPlatz++; continue; }
    plan = blockNotiz(blockHinzu(plan, tag, "mathe", slot), plan.bloecke.length
      ? Math.max(...plan.bloecke.map((b) => b.id)) + 1 : 1, notiz);
    belegtAb[tag] = slot + 60; // 30 Min Block + 30 Min Pause
    eingeplant++;
  }
  return { doc: planSchreiben(doc, plan), montag, eingeplant, schonDa, keinPlatz };
}
