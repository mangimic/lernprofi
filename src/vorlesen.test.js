import { describe, it, expect, afterEach } from "vitest";
import { vorlesbar, vorlesen, vorleseStopp, sprechText, sprechSauber } from "./vorlesen.js";

afterEach(() => { delete globalThis.window; });

describe("Vorlesen – Sprachausgabe des Geräts, nie Pflicht", () => {
  it("sprechText: `sprich` schlägt die Frage, Emojis und Platzhalter werden sprechbar", () => {
    expect(sprechText({ f: "7 + 5 = ?", sprich: "Wie viel ist 7 plus 5?" })).toBe("Wie viel ist 7 plus 5?");
    expect(sprechText({ f: "Was reimt sich auf Haus?" })).toBe("Was reimt sich auf Haus?");
    expect(sprechText({ frage: "Tippe das Subjekt an!" })).toBe("Tippe das Subjekt an!");
    expect(sprechSauber("🐟 Welches Wort passt?")).toBe("Welches Wort passt?");
    expect(sprechSauber("Der Hund __ laut.")).toBe("Der Hund Lücke laut.");
    expect(sprechText(null)).toBe("");
    // Rechen- und Vergleichszeichen werden ausgeschrieben (Antworten wie „4 < 9“)
    expect(sprechSauber("4 < 9")).toBe("4 ist kleiner als 9");
    expect(sprechSauber("12 > 7")).toBe("12 ist größer als 7");
    expect(sprechSauber("7 + 5 = ?")).toBe("7 plus 5 ist gleich ?");
    expect(sprechSauber("13 − 5")).toBe("13 minus 5");
    expect(sprechSauber("3 · 4")).toBe("3 mal 4");
    expect(sprechSauber("12 : 3")).toBe("12 geteilt durch 3");
    expect(sprechSauber("7:30 Uhr")).toBe("7:30 Uhr"); // Uhrzeiten bleiben Uhrzeiten
    expect(sprechSauber("Ba-na-ne")).toBe("Ba-na-ne"); // Silben-Striche bleiben
  });

  it("ohne Sprachausgabe: nichts passiert, kein Fehler", () => {
    expect(vorlesbar()).toBe(false);
    expect(vorlesen("Hallo")).toBe(false);
    expect(() => vorleseStopp()).not.toThrow();
    globalThis.window = {}; // Browser ohne speechSynthesis
    expect(vorlesbar()).toBe(false);
    expect(vorlesen("Hallo")).toBe(false);
  });

  it("mit Sprachausgabe: bricht Laufendes ab und spricht deutsch, etwas langsamer", () => {
    const gesprochen = [];
    let abbrueche = 0;
    globalThis.window = {
      SpeechSynthesisUtterance: function (text) { this.text = text; },
      speechSynthesis: { cancel: () => { abbrueche++; }, speak: (u) => gesprochen.push(u) },
    };
    expect(vorlesbar()).toBe(true);
    expect(vorlesen("🐶 Der Hund bellt.")).toBe(true);
    expect(gesprochen[0]).toMatchObject({ text: "Der Hund bellt.", lang: "de-DE", rate: 0.9 });
    expect(abbrueche).toBe(1);
    expect(vorlesen("   ")).toBe(false); // nichts zu sagen
    // wirft der Browser (z. B. ohne Nutzer-Geste), bleibt die App ruhig
    globalThis.window.speechSynthesis.speak = () => { throw new Error("blockiert"); };
    expect(vorlesen("Hallo")).toBe(false);
  });
});
