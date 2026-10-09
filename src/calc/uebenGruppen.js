/* 🗂️ Übungs-Gruppen: Statt 15 Deutsch-Bereichen auf einen Schlag sieht
   das Kind erst 5 große Gruppen (plus „Leo wählt für dich") – weniger
   Auswahl auf einmal, klarer erster Schritt. Eine Gruppe mit nur einem
   Feld startet direkt, ohne Zwischenschritt. */

export const DEUTSCH_GRUPPEN = [
  { key: "lesen", emoji: "🔍", name: "Lesen & Verstehen", felder: ["lesen"] },
  { key: "schreiben", emoji: "✍️", name: "Richtig schreiben", felder: ["gk", "gws", "dd", "doppel", "strategie", "wortfam"] },
  { key: "woerter", emoji: "🏷️", name: "Wörter & Wortarten", felder: ["wa", "zeit", "verbform", "steigern", "zusnomen", "faelle"] },
  { key: "saetze", emoji: "🧲", name: "Sätze & Satzglieder", felder: ["subj", "praed", "satzglied", "rede"] },
  { key: "texte", emoji: "📚", name: "Texte schreiben", felder: ["gesch", "vorgang"] },
];

/** Zu welcher Gruppe gehört ein Lernfeld? (null = Fach ohne Gruppen) */
export function gruppeVonFeld(key) {
  return DEUTSCH_GRUPPEN.find((g) => g.felder.includes(key)) || null;
}

/** 🦁 „Leo wählt für dich": das Feld mit den wenigsten gespielten Runden
    (Gleichstand: Listen-Reihenfolge). Module ohne Stufen-Runden bleiben
    außen vor – so rotiert Leo fair durch alle Übungs-Bereiche. */
export function leoWahl(bereiche, stufen) {
  let beste = null;
  for (const b of bereiche) {
    if (b.typ === "modul") continue;
    const runden = (stufen && stufen[b.key] ? stufen[b.key].runden : 0) || 0;
    if (!beste || runden < beste.runden) beste = { bereich: b, runden };
  }
  return beste ? beste.bereich : null;
}
