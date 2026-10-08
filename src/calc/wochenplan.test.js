import { describe, it, expect } from "vitest";
import {
  BAUSTEINE, TERMIN_ARTEN, wochenMontag, tagDatum, leererPlan, planFuerWoche,
  blockHinzu, blockWeg, termineDerWoche, planPruefung, bausteinInfo,
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

  it("planFuerWoche: alte Woche startet frisch, aktuelle bleibt", () => {
    const alt = { montag: "2026-09-28", bloecke: [{ id: 1, tag: 0, typ: "lernen" }] };
    expect(planFuerWoche(alt, "2026-10-05").bloecke).toEqual([]);
    expect(planFuerWoche(alt, "2026-09-28")).toBe(alt);
    expect(planFuerWoche(null, "2026-10-05")).toEqual(leererPlan("2026-10-05"));
  });

  it("blockHinzu/blockWeg: fortlaufende Ids, Unsinn wird ignoriert, mutiert nicht", () => {
    let p = leererPlan("2026-10-05");
    p = blockHinzu(p, 2, "lernen");
    p = blockHinzu(p, 2, "sport");
    expect(p.bloecke.map((b) => b.id)).toEqual([1, 2]);
    expect(blockHinzu(p, 7, "lernen")).toBe(p);     // Tag außerhalb
    expect(blockHinzu(p, 0, "quatsch")).toBe(p);    // unbekannter Baustein
    const ohne = blockWeg(p, 1);
    expect(ohne.bloecke.map((b) => b.typ)).toEqual(["sport"]);
    expect(p.bloecke.length).toBe(2); // Original unangetastet
  });

  it("Wächter: zu viele Lernboxen → voll; nur Lernen → einseitig; sonst ok", () => {
    let p = leererPlan("2026-10-05");
    p = blockHinzu(p, 0, "lernen");
    p = blockHinzu(p, 0, "lernen");
    p = blockHinzu(p, 0, "lernen");
    // zeitLimit 20 → höchstens 2 Lernboxen pro Tag
    const voll = planPruefung(p, [], 20);
    expect(voll.maxLern).toBe(2);
    expect(voll.tage[0].status).toBe("voll");
    expect(voll.tage[0].hinweis).toContain("Schieb");
    expect(voll.ok).toBe(false);
    // 2 Lernboxen ohne Ausgleich → einseitig, mit Sport → ok
    let p2 = leererPlan("2026-10-05");
    p2 = blockHinzu(p2, 1, "lernen");
    p2 = blockHinzu(p2, 1, "schrift");
    expect(planPruefung(p2, [], 20).tage[1].status).toBe("einseitig");
    p2 = blockHinzu(p2, 1, "sport");
    const ok = planPruefung(p2, [], 20);
    expect(ok.tage[1]).toMatchObject({ status: "ok", lern: 2, frei: 1, lernMin: 20 });
    expect(ok.ok).toBe(true);
  });

  it("Wächter: vor Klassenarbeit wird Verteilen empfohlen, mit 2 Übungstagen ist Ruhe", () => {
    const termine = [{ id: 1, tag: "2026-10-09", art: "ka", fach: "Mathe" }]; // Freitag
    let p = leererPlan("2026-10-05");
    const leer = planPruefung(p, termine, 20);
    expect(leer.hinweise[0]).toContain("Klassenarbeit");
    expect(leer.hinweise[0]).toContain("2 Tagen");
    p = blockHinzu(p, 1, "lernen"); // Dienstag
    expect(planPruefung(p, termine, 20).hinweise[0]).toContain("zweiter Übungstag");
    p = blockHinzu(p, 3, "lernen"); // Donnerstag
    const gut = planPruefung(p, termine, 20);
    expect(gut.hinweise).toEqual([]);
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
    expect(BAUSTEINE.filter((b) => b.lern).map((b) => b.typ)).toEqual(["lernen", "schrift", "konz"]);
    expect(bausteinInfo("unbekannt").lern).toBe(false);
  });
});
