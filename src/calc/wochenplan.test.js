import { describe, it, expect } from "vitest";
import {
  BAUSTEINE, TERMIN_ARTEN, FESTE_TERMINE_STANDARD, festerTermin, blockNotiz, schulZeilen,
  istAusgefallen, ausfallSetzen, ausfallAufheben, blockVerschieben, wocheKopieren, blockUnfertig,
  blockDauer, blockDauerVon, spanFrei, auffrischungen,
  kalenderWoche, routineAusPlan, routineAnwenden, schulStunden, schulFaecher,
  wochenMontag, tagDatum, leererPlan, planFuerWoche,
  blockHinzu, blockWeg, blockFertig, tagGeschafft, heuteBelohnt, belohnungEintragen,
  wochenBilanz, termineDerWoche, planPruefung, bausteinInfo, blockTyp, bausteinListe, bausteinAnzeige,
} from "./wochenplan.js";

describe("wochenplan – Wochen-Rechnung", () => {
  it("wochenMontag und tagDatum über Monats-/Jahresgrenzen", () => {
    expect(wochenMontag("2026-10-08")).toBe("2026-10-05"); // Do → Mo
    expect(wochenMontag("2026-10-05")).toBe("2026-10-05"); // Mo bleibt Mo
    expect(wochenMontag("2026-10-04")).toBe("2026-09-28"); // So → Vorwochen-Mo
    expect(wochenMontag("2026-01-01")).toBe("2025-12-29");
    expect(tagDatum("2026-10-05", 0)).toBe("2026-10-05");
    expect(tagDatum("2026-10-05", 6)).toBe("2026-10-11");
  });

  it("planFuerWoche: alte Woche startet frisch; Alt-Blöcke ohne Slot bekommen freie Stunden", () => {
    const alt = { montag: "2026-09-28", bloecke: [{ id: 1, tag: 0, typ: "lernen" }] };
    expect(planFuerWoche(alt, "2026-10-05").bloecke).toEqual([]);
    expect(planFuerWoche(null, "2026-10-05")).toEqual(leererPlan("2026-10-05"));
    // Plan mit Slots bleibt identisch, Alt-Blöcke werden der Reihe nach einsortiert
    const mitSlots = { montag: "2026-09-28", bloecke: [{ id: 1, tag: 0, slot: 960, typ: "lernen" }] };
    expect(planFuerWoche(mitSlots, "2026-09-28")).toBe(mitSlots);
    const gemischt = { montag: "2026-09-28", bloecke: [
      { id: 1, tag: 0, slot: 0, typ: "lernen" },   // Index-Slot (v0.27) → 14:00
      { id: 2, tag: 0, slot: 15, typ: "konz" },    // Stunden-Slot → 15:00
      { id: 3, tag: 0, typ: "sport" },             // ohne Slot → erster freier Slot
      { id: 4, tag: 5, typ: "freunde" },           // Wochenende → ab 9:00
    ] };
    const norm = planFuerWoche(gemischt, "2026-09-28");
    expect(norm.bloecke.map((b) => b.slot)).toEqual([840, 900, 780, 540]);
  });

  it("blockHinzu/blockWeg: fortlaufende Ids, Unsinn wird ignoriert, mutiert nicht", () => {
    let p = leererPlan("2026-10-05");
    p = blockHinzu(p, 2, "lernen", 840);
    p = blockHinzu(p, 2, "sport", 870);
    expect(p.bloecke.map((b) => b.id)).toEqual([1, 2]);
    expect(blockHinzu(p, 7, "lernen", 840)).toBe(p);  // Tag außerhalb
    expect(blockHinzu(p, 0, "quatsch", 840)).toBe(p); // unbekannter Baustein
    expect(blockHinzu(p, 2, "sport", 840)).toBe(p);   // Slot schon belegt
    expect(blockHinzu(p, 2, "sport", 855)).toBe(p);   // keine krummen Zeiten
    expect(blockHinzu(p, 2, "sport", 540)).toBe(p);   // 9 Uhr gibt es nur am Wochenende
    expect(blockHinzu(p, 5, "sport", 540).bloecke.length).toBe(3); // Samstag ab 9 Uhr ok
    const ohne = blockWeg(p, 1);
    expect(ohne.bloecke.map((b) => b.typ)).toEqual(["sport"]);
    expect(p.bloecke.length).toBe(2); // Original unangetastet
    // Notiz: trimmen, auf 24 Zeichen kürzen, Original bleibt unberührt
    const mitNotiz = blockNotiz(p, 1, "  mit dem Nachbarsjungen vom Spielplatz  ");
    expect(mitNotiz.bloecke[0].notiz).toBe("mit dem Nachbarsjungen v");
    expect(blockNotiz(p, 1, "").bloecke[0].notiz).toBe("");
    expect(p.bloecke[0].notiz).toBeUndefined();
  });

  it("blockTyp: Baustein ändern – Fenster, Dauer, Notiz und Haken bleiben", () => {
    let p = leererPlan("2026-10-05");
    p = blockHinzu(p, 5, "schlagzeug", 540, 60);
    p = blockNotiz(p, 1, "kleines Konzert");
    p = blockFertig(p, 1);
    const neu = blockTyp(p, 1, "angeln");
    expect(neu.bloecke[0]).toMatchObject({ typ: "angeln", tag: 5, slot: 540, dauer: 60, notiz: "kleines Konzert", fertig: true });
    expect(blockTyp(p, 1, "quatsch")).toBe(p); // unbekannter Typ ändert nichts
    expect(p.bloecke[0].typ).toBe("schlagzeug"); // Original unangetastet
  });

  it("bausteinListe/bausteinAnzeige: Eltern können umbenennen und ausblenden", () => {
    const einst = { bausteine: { aus: ["pfadfinder"], namen: { angeln: "Fliegenfischen" }, eigene: [{ id: 1, name: "Lego-Zeit", emoji: "🧱" }] } };
    const liste = bausteinListe(einst);
    expect(liste.some((b) => b.typ === "pfadfinder")).toBe(false); // ausgeblendet
    expect(liste.some((b) => b.verborgen)).toBe(false);            // Legacy bleibt draußen
    expect(liste.find((b) => b.typ === "angeln").name).toBe("Fliegenfischen");
    expect(liste.find((b) => b.typ === "angeln").emoji).toBe("🎣"); // Verhalten/Emoji bleiben
    expect(bausteinAnzeige("angeln", einst).name).toBe("Fliegenfischen");
    expect(bausteinAnzeige("angeln", {}).name).toBe("Angeln"); // ohne Einstellung: Standard
    expect(bausteinAnzeige("mathe", einst).lern).toBe(true);
    // ohne Einstellungen: alle sichtbaren Standard-Kategorien
    expect(bausteinListe(undefined).length).toBe(BAUSTEINE.filter((b) => !b.verborgen).length);
  });

  it("Wächter: zu viele Lernboxen → voll; nur Lernen → einseitig; sonst ok", () => {
    let p = leererPlan("2026-10-05");
    p = blockHinzu(p, 0, "lernen", 840);
    p = blockHinzu(p, 0, "lernen", 870);
    p = blockHinzu(p, 0, "lernen", 900);
    // zeitLimit 20 → höchstens 2 Lernboxen pro Tag
    const voll = planPruefung(p, [], 20);
    expect(voll.maxLern).toBe(2);
    expect(voll.tage[0].status).toBe("voll");
    expect(voll.tage[0].hinweis).toContain("Schieb");
    expect(voll.ok).toBe(false);
    // 2 Lernboxen ohne HA/Schlagzeug davor → Reihenfolge-Hinweis, danach ok
    let p2 = leererPlan("2026-10-05");
    p2 = blockHinzu(p2, 1, "lernen", 900);
    p2 = blockHinzu(p2, 1, "schrift", 930);
    expect(planPruefung(p2, [], 20).tage[1].status).toBe("reihenfolge");
    p2 = blockHinzu(p2, 1, "hausaufgaben", 840);
    expect(planPruefung(p2, [], 20).tage[1].hinweis).toContain("Schlagzeug");
    p2 = blockHinzu(p2, 1, "schlagzeug", 870);
    // Ein Arzttermin zählt nicht als Ausgleich (frei bleibt gleich)
    expect(planPruefung(blockHinzu(p2, 1, "arzt", 1080), [], 20).tage[1].frei)
      .toBe(planPruefung(p2, [], 20).tage[1].frei);
    p2 = blockHinzu(p2, 1, "sport", 990);
    const ok = planPruefung(p2, [], 20);
    expect(ok.tage[1]).toMatchObject({ status: "ok", lern: 3, frei: 2, lernMin: 20 }); // HA zählt als Lernzeit, nicht als Box
    expect(ok.ok).toBe(true);
  });

  it("Wächter: vor Klassenarbeit wird Verteilen empfohlen, mit 2 Übungstagen ist Ruhe", () => {
    const termine = [{ id: 1, tag: "2026-10-09", art: "ka", fach: "Mathe" }]; // Freitag
    let p = leererPlan("2026-10-05");
    const leer = planPruefung(p, termine, 20);
    expect(leer.hinweise[0]).toContain("Klassenarbeit");
    expect(leer.hinweise[0]).toContain("2 Tagen");
    p = blockHinzu(p, 1, "lernen", 900); // Dienstag
    expect(planPruefung(p, termine, 20).hinweise[0]).toContain("zweiter Übungstag");
    p = blockHinzu(p, 3, "lernen", 840); // Donnerstag
    const gut = planPruefung(p, termine, 20);
    expect(gut.hinweise).toEqual([]);
  });

  it("Kalenderwoche, Vorplanung der Folgewoche und Wochen-Routine ohne Freunde-Zeit", () => {
    expect(kalenderWoche("2026-10-05")).toBe(41);
    expect(kalenderWoche("2025-12-29")).toBe(1); // ISO: gehört schon zu KW 1/2026
    // Vorplanung wird beim Wochenwechsel zur aktiven Woche
    const alt = {
      montag: "2026-09-28", bloecke: [{ id: 1, tag: 0, slot: 840, typ: "lernen", fertig: true }],
      belohnt: ["2026-09-28"],
      naechste: { montag: "2026-10-05", bloecke: [{ id: 1, tag: 2, slot: 900, typ: "lernen" }] },
    };
    const neu = planFuerWoche(alt, "2026-10-05");
    expect(neu.montag).toBe("2026-10-05");
    expect(neu.bloecke).toEqual([{ id: 1, tag: 2, slot: 900, typ: "lernen" }]);
    expect(neu.belohnt).toEqual([]);
    expect(neu.naechste).toBeNull();
    // Routine: Freunde-Zeit bleibt draußen, Übernehmen füllt nur freie Slots
    let p = leererPlan("2026-10-05");
    p = blockHinzu(p, 1, "lernen", 900);
    p = blockHinzu(p, 2, "freunde", 840);
    const routine = routineAusPlan(p);
    expect(routine).toEqual([{ tag: 1, slot: 900, typ: "lernen" }]);
    let ziel = blockHinzu(leererPlan("2026-10-12"), 1, "sport", 900); // Slot schon belegt
    ziel = routineAnwenden(ziel, routine);
    expect(ziel.bloecke.length).toBe(1); // nichts doppelt gelegt
    const frei = routineAnwenden(leererPlan("2026-10-12"), routine);
    expect(frei.bloecke).toEqual([{ id: 1, tag: 1, slot: 900, typ: "lernen" }]);
  });

  it("Stundenplan: 5 Schultage, saubere Zeiten, Fächerfolge ohne AGs und Dubletten", () => {
    for (let t = 0; t <= 4; t++) {
      expect(schulStunden(t).length).toBeGreaterThanOrEqual(5);
      for (const [von, bis] of schulStunden(t)) {
        expect(von).toBeGreaterThanOrEqual(470); // frühestens 7:50
        expect(bis).toBeGreaterThan(von);
        expect(bis).toBeLessThanOrEqual(780);    // spätestens 13:00
      }
    }
    expect(schulStunden(5)).toEqual([]);
    expect(schulFaecher(0)).toEqual(["Deutsch", "Französisch", "Mathe", "SU", "Italienisch"]); // Doppelstunde nur 1×
    expect(schulFaecher(3)).toEqual(["Mathe", "KoKo", "KuW"]);
    expect(schulFaecher(4)).toContain("Musik");
    expect(schulStunden(4).at(-1)).toEqual([735, 780, "BSS (Sport)"]); // Fr: Sport bis 13 Uhr
    expect(schulFaecher(1).join(" ")).not.toContain("Chor"); // AG ist freiwillig
    expect(schulFaecher(6)).toEqual([]);
    // Anzeige-Zeilen: exakt die Zeitfenster vom Blatt, Pausen einsortiert
    const mo = schulZeilen(0);
    expect(mo[0]).toMatchObject({ von: 470, bis: 515, fach: "Deutsch" }); // 7:50-8:35
    expect(mo[2]).toMatchObject({ von: 560, bis: 575, pause: true });     // 9:20-9:35 Pause
    expect(mo[5]).toMatchObject({ von: 670, bis: 685, pause: true });     // 11:10-11:25 Pause
    expect(mo.map((z) => z.von)).toEqual([...mo.map((z) => z.von)].sort((a, b) => a - b));
    expect(schulZeilen(6)).toEqual([]); // Wochenende: keine Zeilen, keine Pausen
  });

  it("Durchführung: abhaken, Tag geschafft, Belohnung nur 1× je Datum, Bilanz", () => {
    let p = leererPlan("2026-10-05");
    p = blockHinzu(p, 3, "lernen", 840);
    p = blockHinzu(p, 3, "schlagzeug", 870);
    expect(tagGeschafft(p, 3)).toBe(false);
    expect(tagGeschafft(p, 0)).toBe(false); // leerer Tag zählt nicht als geschafft
    p = blockFertig(p, 1);
    expect(p.bloecke[0].fertig).toBe(true);
    expect(tagGeschafft(p, 3)).toBe(false);
    p = blockFertig(p, 2);
    expect(tagGeschafft(p, 3)).toBe(true);
    // ↩︎ Haken rückgängig: fertig weg, gezaehlt-Merker bleibt (keine Doppel-Mission)
    const zurueckgenommen = blockUnfertig(p, 2);
    expect(zurueckgenommen.bloecke[1]).toMatchObject({ fertig: false, gezaehlt: true });
    expect(tagGeschafft(zurueckgenommen, 3)).toBe(false);
    expect(wochenBilanz(p)).toEqual({ gesamt: 2, fertig: 2, lernFertig: 1, alles: true });
    // Belohnung idempotent
    expect(heuteBelohnt(p, "2026-10-08")).toBe(false);
    p = belohnungEintragen(p, "2026-10-08");
    expect(heuteBelohnt(p, "2026-10-08")).toBe(true);
    expect(belohnungEintragen(p, "2026-10-08")).toBe(p);
  });

  it("feste Termine: gültige Slots, Wächter zählt Aktiv-Termine als Ausgleich", () => {
    for (const f of FESTE_TERMINE_STANDARD) {
      expect(f.tag).toBeGreaterThanOrEqual(0); expect(f.tag).toBeLessThanOrEqual(6);
      expect(f.beginn).toBeGreaterThanOrEqual(540); expect(f.beginn).toBeLessThanOrEqual(1110);
      expect(f.beginn % 30).toBe(0);
      expect(f.dauer).toBeGreaterThanOrEqual(30);
      expect(typeof f.aktiv).toBe("boolean");
    }
    expect(festerTermin(FESTE_TERMINE_STANDARD, 0, 1080)?.name).toBe("Bandprobe");
    expect(festerTermin(FESTE_TERMINE_STANDARD, 0, 990)?.name).toBe("Musikalische Spiele"); // 16:30 ist mit abgedeckt
    expect(festerTermin(FESTE_TERMINE_STANDARD, 1, 990)).toBeNull(); // Schlagzeug nur 30 Min
    // 🍽️ 13-14 Uhr ist an ALLEN 7 Tagen blockiert (Mittag & Spielzeit)
    for (let t = 0; t <= 6; t++) {
      expect(festerTermin(FESTE_TERMINE_STANDARD, t, 780)?.name).toBe("Mittag & Spielzeit");
      expect(festerTermin(FESTE_TERMINE_STANDARD, t, 810)?.name).toBe("Mittag & Spielzeit");
    }
    expect(festerTermin(FESTE_TERMINE_STANDARD, 4, 840)).toBeNull();
    // Lernzeit am Montag: ohne feste Termine „einseitig", MIT Bandprobe & Co. ok
    let p = leererPlan("2026-10-05");
    p = blockHinzu(p, 0, "hausaufgaben", 840);
    expect(planPruefung(p, [], 20).tage[0].status).toBe("einseitig");
    expect(planPruefung(p, [], 20, FESTE_TERMINE_STANDARD).tage[0].status).toBe("ok");
  });

  it("Verschieben, Woche kopieren und die Familienregel (erst HA & Schlagzeug, dann Üben)", () => {
    // Verschieben: nur in freie, gültige Fenster; mutiert nicht
    let p = leererPlan("2026-10-05");
    p = blockHinzu(p, 0, "lernen", 840);
    p = blockHinzu(p, 0, "sport", 870);
    const bewegt = blockVerschieben(p, 1, 2, 900);
    expect(bewegt.bloecke[0]).toMatchObject({ id: 1, tag: 2, slot: 900 });
    expect(blockVerschieben(p, 1, 0, 870)).toBe(p);  // Ziel belegt
    expect(blockVerschieben(p, 1, 0, 855)).toBe(p);  // kein gültiges Fenster
    expect(blockVerschieben(p, 9, 0, 900)).toBe(p);  // unbekannte Id
    expect(p.bloecke[0].tag).toBe(0);
    // Woche kopieren: ohne Haken, mit Notizen, nur in freie Fenster
    let quelle = blockHinzu(leererPlan("2026-10-05"), 2, "freunde", 870);
    quelle = blockNotiz(quelle, 1, "Emil");
    quelle = { ...quelle, bloecke: quelle.bloecke.map((b) => ({ ...b, fertig: true })) };
    quelle = blockHinzu(quelle, 1, "lernen", 900);
    let ziel = blockHinzu(leererPlan("2026-10-12"), 1, "sport", 900); // 900 belegt
    ziel = wocheKopieren(ziel, quelle);
    expect(ziel.bloecke.length).toBe(2); // freunde kam dazu, lernen nicht (belegt)
    const kopie = ziel.bloecke.find((b) => b.typ === "freunde");
    expect(kopie.notiz).toBe("Emil");
    expect(kopie.fertig).toBeUndefined(); // Haken wandern nicht mit
    // Familienregel: Üben ohne HA/Schlagzeug davor → gelber Reihenfolge-Hinweis
    let r = blockHinzu(leererPlan("2026-10-05"), 5, "lernen", 660);
    expect(planPruefung(r, [], 20, FESTE_TERMINE_STANDARD).tage[5].status).toBe("reihenfolge");
    r = blockHinzu(r, 5, "hausaufgaben", 570);
    expect(planPruefung(r, [], 20, FESTE_TERMINE_STANDARD).tage[5].hinweis).toContain("Schlagzeug");
    r = blockHinzu(r, 5, "schlagzeug", 600);
    expect(planPruefung(r, [], 20, FESTE_TERMINE_STANDARD).tage[5].status).toBe("ok");
    // Dienstag reicht die feste Schlagzeug-Stunde (16:00) als Schlagzeug vor dem Üben um 16:30
    let di = blockHinzu(leererPlan("2026-10-05"), 1, "hausaufgaben", 900);
    di = blockHinzu(di, 1, "lernen", 990);
    expect(planPruefung(di, [], 20, FESTE_TERMINE_STANDARD).tage[1].status).toBe("ok");
    // Hausaufgaben verdrängen das Üben NICHT: HA + 2 Boxen ist kein „voll"
    expect(planPruefung(r, [], 20, FESTE_TERMINE_STANDARD).tage[5].lernMin).toBe(10); // nur die Box zählt
    let voll = blockHinzu(r, 5, "lernen", 690);
    expect(planPruefung(voll, [], 20, FESTE_TERMINE_STANDARD).tage[5].status).toBe("ok"); // HA + 2 Boxen
  });

  it("Von-bis: lange Bausteine belegen mehrere Fenster, Dauer änderbar, Kopie behält sie", () => {
    // 10:00-12:30 am Sonntag (150 Minuten)
    let p = blockHinzu(leererPlan("2026-10-05"), 6, "eigen", 600, 150);
    expect(blockDauerVon(p.bloecke[0])).toBe(150);
    expect(spanFrei(p, 6, 630, 30)).toBe(false);          // Folgefenster belegt
    expect(blockHinzu(p, 6, "sport", 690)).toBe(p);       // mitten im Span: abgelehnt
    expect(blockHinzu(p, 6, "sport", 750).bloecke.length).toBe(2); // direkt danach: ok
    // Dauer ändern: kürzen gibt Fenster frei; Verlängern in Belegtes scheitert
    const kurz = blockDauer(p, 1, 60);
    expect(spanFrei(kurz, 6, 690, 30)).toBe(true);
    expect(blockDauer(blockHinzu(p, 6, "sport", 750), 1, 180)).toEqual(blockHinzu(p, 6, "sport", 750));
    // krumme/ungültige Dauern werden ignoriert
    expect(blockDauer(p, 1, 45)).toBe(p);
    // Verschieben nimmt die Dauer mit und braucht den ganzen Platz
    const bewegt = blockVerschieben(p, 1, 5, 540);
    expect(bewegt.bloecke[0]).toMatchObject({ tag: 5, slot: 540, dauer: 150 });
    expect(blockVerschieben(p, 1, 0, 1080)).toBe(p); // 18:00 + 150 Min ragt über 19 Uhr hinaus
    // Wochen-Kopie behält die Dauer
    expect(wocheKopieren(leererPlan("2026-10-12"), p).bloecke[0].dauer).toBe(150);
  });

  it("Ausfälle: Termin fällt nur diese Woche aus, Wächter rechnet ohne ihn", () => {
    let p = leererPlan("2026-10-05");
    expect(istAusgefallen(p, 1, 1020)).toBe(false);
    p = ausfallSetzen(p, 1, 1020); // Di Sport fällt aus
    expect(istAusgefallen(p, 1, 1020)).toBe(true);
    expect(ausfallSetzen(p, 1, 1020)).toBe(p); // idempotent
    // Der Wächter zählt den ausgefallenen Sport nicht mehr als Ausgleich
    p = blockHinzu(p, 1, "lernen", 900);
    p = blockHinzu(p, 1, "schrift", 930);
    expect(planPruefung(p, [], 20, FESTE_TERMINE_STANDARD).tage[1].frei).toBe(1); // nur Schlagzeug (Mittag zählt nicht)
    const zurueck = ausfallAufheben(p, 1, 1020);
    expect(istAusgefallen(zurueck, 1, 1020)).toBe(false);
    expect(planPruefung(zurueck, [], 20, FESTE_TERMINE_STANDARD).tage[1].frei).toBe(2); // + Sport
    // Fallen ALLE Aktiv-Termine des Tages aus, wird ein reiner Lerntag „einseitig"
    let nurLernen = ausfallSetzen(ausfallSetzen(leererPlan("2026-10-05"), 1, 960), 1, 1020);
    nurLernen = blockHinzu(nurLernen, 1, "hausaufgaben", 900);
    expect(planPruefung(nurLernen, [], 20, FESTE_TERMINE_STANDARD).tage[1].status).toBe("einseitig");
    // Zurückholen räumt Bausteine aus dem Termin-Fenster (mit Dauer)
    let belegt = ausfallSetzen(leererPlan("2026-10-05"), 1, 1020);
    belegt = blockHinzu(belegt, 1, "freunde", 1050); // ins freie Sport-Fenster gelegt
    belegt = blockHinzu(belegt, 1, "lernen", 900);   // außerhalb – bleibt
    const wiederDa = ausfallAufheben(belegt, 1, 1020, 60);
    expect(istAusgefallen(wiederDa, 1, 1020)).toBe(false);
    expect(wiederDa.bloecke.map((b) => b.typ)).toEqual(["lernen"]);
    // Vorplanung nimmt ihre Ausfälle mit in die neue Woche
    const alt = {
      montag: "2026-09-28", bloecke: [], belohnt: [],
      naechste: { montag: "2026-10-05", bloecke: [], ausfaelle: [{ tag: 3, beginn: 1020 }] },
    };
    expect(istAusgefallen(planFuerWoche(alt, "2026-10-05"), 3, 1020)).toBe(true);
  });

  it("Auffrischung: am Testtag gibt es die Morgen-Zeile mit Fach (oder Art)", () => {
    const termine = [
      { id: 1, tag: "2026-10-09", art: "ka", fach: "Mathe" },
      { id: 2, tag: "2026-10-09", art: "wdw", fach: "" },
      { id: 3, tag: "2026-10-12", art: "ka", fach: "Deutsch" }, // nächste Woche
    ];
    const fr = auffrischungen(termine, "2026-10-05", 4);
    expect(fr.length).toBe(2);
    expect(fr[0]).toMatchObject({ emoji: "📝", text: "Mathe kurz auffrischen (5 Min)" });
    expect(fr[1].text).toBe("Wörter der Woche kurz auffrischen (5 Min)"); // ohne Fach: Art-Name
    expect(auffrischungen(termine, "2026-10-05", 3)).toEqual([]);
  });

  it("termineDerWoche gruppiert nur Termine dieser Woche; Stammdaten vollständig", () => {
    const je = termineDerWoche([
      { id: 1, tag: "2026-10-05", art: "wdw" },
      { id: 2, tag: "2026-10-11", art: "kompass" },
      { id: 3, tag: "2026-10-12", art: "ka" }, // nächste Woche
    ], "2026-10-05");
    expect(je[0].length).toBe(1);
    expect(je[6].length).toBe(1);
    expect(je.flat().length).toBe(2);
    expect(Object.keys(TERMIN_ARTEN)).toEqual(["ka", "kompass", "wdw"]);
    expect(BAUSTEINE.filter((b) => b.lern).map((b) => b.typ)).toEqual(["mathe", "deutsch", "lernen", "schrift", "konz", "hausaufgaben"]);
    expect(BAUSTEINE.find((b) => b.typ === "lernen").verborgen).toBe(true); // Alt-Typ nur noch intern
    expect(BAUSTEINE.find((b) => b.typ === "angeln")).toMatchObject({ emoji: "🎣", lern: false });
    expect(BAUSTEINE.find((b) => b.typ === "schlagzeug").kurz).toBe(true); // 10-Minuten-Einheit
    expect(bausteinInfo("unbekannt").lern).toBe(false);
  });
});
