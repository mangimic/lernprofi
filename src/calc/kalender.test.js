import { describe, it, expect } from "vitest";
import {
  FERIEN_BW, FEIERTAGE_BW, SCHULJAHR, ferienAm, feiertagAm, schulfreiAm,
  monatsGitter, monatsName, monatSchritt,
} from "./kalender.js";
import {
  tagesStunden, planFuerWoche, planSchreiben, blockHinzu, blockNotiz, leererPlan,
  planPruefung, FESTE_TERMINE_STANDARD, terminSerie, blockSerie, blockSerieEntfernen,
} from "./wochenplan.js";

describe("kalender – Schuljahr 2026/27 (BW)", () => {
  it("Ferien und Feiertage: Ränder stimmen, Lücken sind Schule", () => {
    expect(SCHULJAHR.name).toBe("2026/27");
    expect(FERIEN_BW.length).toBe(5);
    expect(ferienAm("2026-10-26")?.name).toBe("Herbstferien");
    expect(ferienAm("2026-10-31")?.name).toBe("Herbstferien");
    expect(ferienAm("2026-10-25")).toBeNull();
    expect(ferienAm("2026-12-23")?.name).toBe("Weihnachtsferien");
    expect(ferienAm("2027-01-09")?.name).toBe("Weihnachtsferien");
    expect(ferienAm("2027-01-11")).toBeNull();
    expect(ferienAm("2027-07-29")?.name).toBe("Sommerferien");
    expect(feiertagAm("2027-05-06")).toBe("Christi Himmelfahrt");
    expect(feiertagAm("2027-05-17")).toBe("Pfingstmontag");
    expect(schulfreiAm("2027-05-06")?.art).toBe("feiertag");
    expect(schulfreiAm("2026-10-27")?.art).toBe("ferien");
    expect(schulfreiAm("2026-10-12")).toBeNull();
    for (const d of Object.keys(FEIERTAGE_BW)) expect(d).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("Ferientage sind ganztags planbar, Schultage erst ab 13 Uhr", () => {
    expect(tagesStunden(1, "2026-10-27")[0]).toBe(540); // Di in den Herbstferien: ab 9 Uhr
    expect(tagesStunden(1, "2026-10-13")[0]).toBe(780); // normaler Di: ab 13 Uhr
    expect(tagesStunden(3, "2027-05-06")[0]).toBe(540); // Himmelfahrt (Do): ganztags
    expect(tagesStunden(5, "2026-10-17")[0]).toBe(540); // Samstag sowieso
    // Familienregel ruht in den Ferien (keine Hausaufgaben)
    const ferienwoche = blockHinzu(leererPlan("2026-10-26"), 1, "mathe", 600);
    expect(planPruefung(ferienwoche, [], 20, FESTE_TERMINE_STANDARD).tage[1].status).not.toBe("reihenfolge");
  });

  it("Monatsgitter: Mo-basiert, deckt den Monat, Navigation über Jahresgrenze", () => {
    const okt = monatsGitter(2026, 10);
    expect(okt[0].tage[0]).toBe("2026-09-28"); // Montag der ersten Oktober-Woche
    expect(okt.at(-1).tage).toContain("2026-10-31");
    for (const w of okt) expect(w.tage.length).toBe(7);
    expect(monatsName(2026, 10)).toBe("Oktober 2026");
    expect(monatSchritt(2026, 12, 1)).toEqual({ jahr: 2027, monat: 1 });
    expect(monatSchritt(2027, 1, -1)).toEqual({ jahr: 2026, monat: 12 });
  });

  it("Serientermin: wöchentlich, Ferien übersprungen, gemeinsame Serie, Limit 60", () => {
    const s = terminSerie([{ id: 3, tag: "2026-10-05", art: "ka", fach: "x" }], "2026-10-16", "wdw", "Wörter", "2026-11-13");
    const neue = s.filter((t) => t.serie);
    expect(neue.map((t) => t.tag)).toEqual(["2026-10-16", "2026-10-23", "2026-11-06", "2026-11-13"]); // 30.10. = Herbstferien
    expect(new Set(neue.map((t) => t.serie)).size).toBe(1);
    expect(neue.every((t) => t.id > 3)).toBe(true);
    // ganzes Schuljahr bleibt unter dem Limit
    const jahr = terminSerie([], "2026-10-16", "wdw", "", "2027-09-12");
    expect(jahr.length).toBeLessThanOrEqual(60);
    expect(jahr.some((t) => t.tag >= "2027-07-29" && t.tag <= "2027-09-11")).toBe(false); // Sommerferien frei
  });

  it("Baustein-Serie: Folgewochen mit Notiz/Marker, belegte Wochen und HA-Ferien übersprungen", () => {
    let plan = blockNotiz(blockHinzu(leererPlan("2026-10-05"), 5, "schlagzeug", 600), 1, "Wirbel");
    let doc = planSchreiben(null, blockHinzu(planFuerWoche(planSchreiben(null, plan), "2026-10-19"), 5, "sport", 600)); // 19.10. belegt
    doc = planSchreiben(doc, plan);
    doc = blockSerie(doc, plan, 1, "2026-11-02");
    expect(planFuerWoche(doc, "2026-10-12").bloecke[0]).toMatchObject({ typ: "schlagzeug", notiz: "Wirbel", serie: "2026-10-05#1" });
    expect(planFuerWoche(doc, "2026-10-19").bloecke.map((b) => b.typ)).toEqual(["sport"]); // belegt → übersprungen
    expect(planFuerWoche(doc, "2026-10-26").bloecke.length).toBe(1); // Ferien: Schlagzeug läuft weiter
    // ab 19.10. entfernen: frühere Wochen bleiben
    const ohne = blockSerieEntfernen(doc, "2026-10-19", "2026-10-05#1");
    expect(planFuerWoche(ohne, "2026-10-26").bloecke.length).toBe(0);
    expect(planFuerWoche(ohne, "2026-10-12").bloecke.length).toBe(1);
    // Hausaufgaben-Serie lässt Ferientage aus
    const ha = blockHinzu(leererPlan("2026-10-05"), 0, "hausaufgaben", 840);
    const dha = blockSerie(planSchreiben(null, ha), ha, 1, "2026-11-02");
    expect(planFuerWoche(dha, "2026-10-26").bloecke.length).toBe(0); // Mo 26.10. = Herbstferien
    expect(planFuerWoche(dha, "2026-11-02").bloecke.length).toBe(1);
  });

  it("Mehr-Wochen-Dokument: jede Woche eigener Plan, Alt-Format wird gehoben", () => {
    let doc = planSchreiben(null, blockHinzu(leererPlan("2026-10-05"), 0, "mathe", 840));
    doc = planSchreiben(doc, blockHinzu(leererPlan("2026-11-02"), 2, "frei", 540, 120)); // Woche weit voraus
    expect(Object.keys(doc.plaene).sort()).toEqual(["2026-10-05", "2026-11-02"]);
    expect(planFuerWoche(doc, "2026-10-05").bloecke[0].typ).toBe("mathe");
    expect(planFuerWoche(doc, "2026-10-12").bloecke).toEqual([]); // dazwischen: leer
    // Alt-Format (eine Woche + naechste) wird beim Schreiben mitgenommen
    const alt = { montag: "2026-10-05", bloecke: [{ id: 1, tag: 0, slot: 840, typ: "sport" }], belohnt: [], ausfaelle: [], naechste: { montag: "2026-10-12", bloecke: [{ id: 1, tag: 1, slot: 900, typ: "frei" }] } };
    const neu = planSchreiben(alt, blockHinzu(leererPlan("2026-10-19"), 3, "frei", 840));
    expect(Object.keys(neu.plaene).length).toBe(3);
    expect(planFuerWoche(neu, "2026-10-12").bloecke[0].typ).toBe("frei");
  });
});
