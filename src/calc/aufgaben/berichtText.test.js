import { describe, it, expect } from "vitest";
import {
  FAELLE, W_FRAGEN, AUFBAU, GRUENDE, BT_SPIELE, BT_KRIT_INHALT, BT_KRIT_SPRACHE, BT_KRIT_FORM,
  wFragenKarten, filterKarten, teilVonSatz, ordnenHinweis, reporterRang, berichtGesund,
} from "./berichtText.js";

describe("📰 Bericht schreiben (Daten + Logik)", () => {
  it("7 Fälle gesund; der erste ist der Schul-Fall mit dem Leitfaden vom Blatt", () => {
    expect(Object.keys(FAELLE)).toEqual(["parkhaus", "fahrrad", "fussball", "angeln", "tennis", "dinos", "weltraum"]);
    expect(berichtGesund()).toBe(true);
    expect(FAELLE.parkhaus.w.wann).toBe("Dienstag, 17. Februar, gegen 18:00 Uhr");
    expect(FAELLE.parkhaus.w.wo).toBe("Ausfahrt Parkhaus Ost");
    expect(FAELLE.parkhaus.w.folgen).toContain("3000 €");
    expect(BT_KRIT_INHALT.length + BT_KRIT_SPRACHE.length + BT_KRIT_FORM.length).toBe(12);
  });

  it("7 W-Fragen in der Reihenfolge des Leitfadens, jede gehört zu einem Teil des Bauplans", () => {
    expect(W_FRAGEN.map((w) => w.frage)).toEqual(["Wann?", "Wo?", "Was?", "Wer?", "Warum?", "Wie?", "Welche Folgen?"]);
    const teile = AUFBAU.map((a) => a.key);
    expect(teile).toEqual(["einleitung", "hauptteil", "schluss"]);
    expect(W_FRAGEN.every((w) => teile.includes(w.teil) && w.tipp)).toBe(true);
    expect(W_FRAGEN.filter((w) => w.teil === "einleitung").map((w) => w.key)).toEqual(["wann", "wo", "was", "wer"]);
  });

  it("Muster-Berichte: sachlich, im Präteritum – die gesuchten Verbformen kommen aus dem Fall", () => {
    for (const [key, f] of Object.entries(FAELLE)) {
      const text = `${f.loesung.join(" ")} ${f.zeuge}`;
      for (const v of f.verben) expect(text, `${key}: ${v.r}`).toContain(v.r);
      // Tag und Uhrzeit aus dem Leitfaden stehen in der Einleitung
      const uhr = f.w.wann.match(/\d{1,2}:\d{2}/)[0];
      expect(f.loesung[0], key).toContain(uhr);
      // Was rausfliegt, steht nie im Muster-Bericht
      for (const r of f.raus) expect(f.loesung.includes(r.s)).toBe(false);
    }
  });

  it("Spiel-Karten: 7 W-Fragen-Karten, 6 Filter-Karten (3 rein, 3 raus mit Grund)", () => {
    const f = FAELLE.fussball;
    const wk = wFragenKarten(f);
    expect(wk.map((k) => k.key)).toEqual(W_FRAGEN.map((w) => w.key));
    expect(wk[1].text).toBe("Sportplatz am Waldrand");
    const fk = filterKarten(f);
    expect(fk.length).toBe(6);
    expect(fk.filter((k) => k.rein).length).toBe(3);
    expect(fk.every((k) => GRUENDE[k.grund])).toBe(true);
    expect(fk.filter((k) => !k.rein).every((k) => k.grund !== "rein")).toBe(true);
  });

  it("Bauplan-Logik und Reporter-Rang", () => {
    expect([0, 1, 2, 3, 4].map((i) => teilVonSatz(i))).toEqual(["einleitung", "hauptteil", "hauptteil", "hauptteil", "schluss"]);
    expect(ordnenHinweis(0)).toContain("Einleitung");
    expect(ordnenHinweis(2)).toContain("Hauptteil");
    expect(ordnenHinweis(4)).toContain("Schluss");
    expect(BT_SPIELE.map((s) => s.key)).toEqual(["wfragen", "filter", "zeit", "ordnen"]);
    expect(reporterRang(null)).toEqual({ n: 0, von: 4, name: "Reporter-Neuling" });
    expect(reporterRang({ wfragen: true }).name).toBe("Nachwuchs-Reporter");
    expect(reporterRang({ wfragen: true, filter: true, zeit: true }).name).toBe("Reporter");
    expect(reporterRang({ wfragen: true, filter: true, zeit: true, ordnen: true, fremd: true })).toEqual({ n: 4, von: 4, name: "Chefreporter" });
  });
});
