import { describe, it, expect } from "vitest";
import { UHR_DATEN, UHR_BEREICHE, uhrPlus, uhrDauer } from "./aufgaben/uhrzeit.js";
import { MATHE_DATEN, MATHE_BEREICHE } from "./aufgaben/mathe.js";
import { poolGesund } from "./aufgabenRunde.js";
import { WOZU } from "./wozu.js";

/* 🕐 Uhrzeit & Zeitspannen (Klasse 4): Die Antworten der Uhr-Aufgaben
   werden hier NACHGERECHNET – keine Lösung im Pool darf falsch sein. */
const alle = () => [...UHR_DATEN.muhr.easy, ...UHR_DATEN.muhr.hard];

describe("Uhrzeit-Pool", () => {
  it("ist als Mathe-Feld „muhr“ eingehängt, gesund und groß genug", () => {
    expect(UHR_BEREICHE).toEqual([{ key: "muhr", emoji: "🕐", name: "Uhrzeit & Zeitspannen" }]);
    expect(MATHE_BEREICHE.some((b) => b.key === "muhr")).toBe(true);
    expect(MATHE_DATEN.muhr).toBe(UHR_DATEN.muhr);
    expect(poolGesund(UHR_DATEN.muhr)).toBe(true);
    expect(UHR_DATEN.muhr.easy.length).toBeGreaterThanOrEqual(14);
    expect(UHR_DATEN.muhr.hard.length).toBeGreaterThanOrEqual(14);
    expect(typeof WOZU.muhr).toBe("string");
    expect(WOZU.muhr.length).toBeGreaterThan(10);
  });

  it("Hilfsrechner: uhrPlus und uhrDauer rechnen über die volle Stunde und über Mittag", () => {
    expect(uhrPlus("7:40", 35)).toBe("8:15");
    expect(uhrPlus("11:40", 50)).toBe("12:30");
    expect(uhrPlus("23:30", 45)).toBe("0:15");
    expect(uhrPlus("20:10", -95)).toBe("18:35");
    expect(uhrDauer("7:50", "9:20")).toBe(90);
    expect(uhrDauer("13:52", "14:21")).toBe(29);
  });

  it("jede Uhr-PLUS-Aufgabe nennt die nachgerechnete Ziel-Uhrzeit als richtige Antwort", () => {
    const plus = alle().filter((a) => a.bild?.art === "uhrplus");
    expect(plus.length).toBeGreaterThanOrEqual(6);
    for (const a of plus) {
      expect(a.r, a.f).toBe(`${uhrPlus(a.bild.von, a.bild.plus)} Uhr`);
      expect(a.merkbild?.zeigt, a.f).toBe(true); // Merk-Bild zeigt den Weg des Minutenzeigers
    }
  });

  it("jede Ablese-Aufgabe zeigt ein Ziffernblatt, dessen Zeit in der Antwort steckt", () => {
    const lesen = alle().filter((a) => a.bild?.art === "uhr");
    expect(lesen.length).toBeGreaterThanOrEqual(8);
    for (const a of lesen) {
      expect(a.bild.zeit, a.f).toMatch(/^\d{1,2}:\d{2}$/);
      const [h, m] = a.bild.zeit.split(":").map(Number);
      expect(h).toBeLessThan(13); // Ziffernblatt rechnet in 12 Stunden
      expect(m).toBeLessThan(60);
      // Antwort nennt die gezeigte Zeit – als 12- oder 24-Stunden-Schreibweise oder als Sprechweise mit Zeit in Klammern
      const digital = [`${h}:${String(m).padStart(2, "0")}`, `${h + 12}:${String(m).padStart(2, "0")}`];
      expect(digital.some((d) => a.r.includes(d)), `${a.f} → ${a.r}`).toBe(true);
    }
  });

  it("Dauer-Aufgaben rechnen mit echten Minuten, Inhalte bleiben kindgerecht", () => {
    for (const a of alle().filter((a) => a.dauer)) {
      const { von, bis } = a.dauer;
      const min = uhrDauer(von, bis);
      const text = min % 60 === 0 ? `${min / 60} Stunde${min > 60 ? "n" : ""}`
        : min >= 60 ? `${Math.floor(min / 60)} Stunde${min >= 120 ? "n" : ""} ${min % 60} Minuten` : `${min} Minuten`;
      expect(a.r, a.f).toBe(text);
    }
    expect(/ADHS|Störung|unmotiviert|Versager|dumm/i.test(JSON.stringify(UHR_DATEN))).toBe(false);
    // Süddeutsche Sprechweise ist dabei (Baden-Württemberg)
    expect(JSON.stringify(UHR_DATEN)).toMatch(/dreiviertel/);
  });
});
