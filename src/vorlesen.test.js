import { describe, it, expect, afterEach } from "vitest";
import {
  vorlesbar, vorlesen, vorleseStopp, sprechText, sprechSauber,
  saetzeTeilen, vorlesenWeiter, vorlesenVonVorn, vorlesePause, vorleseLaeuft, vorleseStelle, vorleseAbo,
} from "./vorlesen.js";

afterEach(() => { vorleseStopp(); delete globalThis.window; });

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

describe("Vorlesen mit Start/Stopp – die Stelle wird gemerkt", () => {
  const LANG = "Also, das war vielleicht ein Schreck! Ich kam gerade vom Einkaufen, es war Dienstag, der 17. Februar, so gegen 18:00 Uhr. "
    + "An der Ausfahrt fuhr ein rotes Auto heraus. Ich dachte: „Hilfe, das sieht böse aus!“ Zum Glück wurde niemand verletzt.";

  function attrappe() {
    const gesprochen = [];
    globalThis.window = {
      SpeechSynthesisUtterance: function (text) { this.text = text; },
      speechSynthesis: { cancel: () => {}, speak: (u) => gesprochen.push(u) },
    };
    return { gesprochen, satzFertig: () => gesprochen[gesprochen.length - 1].onend() };
  }

  it("saetzeTeilen: kurze Texte bleiben ganz, lange werden Sätze – Datum und Uhrzeit bleiben heil", () => {
    expect(saetzeTeilen("Wie viel ist 7 plus 5? Rechne!")).toEqual(["Wie viel ist 7 plus 5? Rechne!"]);
    expect(saetzeTeilen("")).toEqual([]);
    const teile = saetzeTeilen(LANG);
    expect(teile).toEqual([
      "Also, das war vielleicht ein Schreck!",
      "Ich kam gerade vom Einkaufen, es war Dienstag, der 17. Februar, so gegen 18:00 Uhr.",
      "An der Ausfahrt fuhr ein rotes Auto heraus.",
      "Ich dachte: „Hilfe, das sieht böse aus!“",
      "Zum Glück wurde niemand verletzt.",
    ]);
    expect(teile.join(" ")).toBe(sprechSauber(LANG)); // nichts geht verloren
  });

  it("Stopp merkt den Satz, Start liest dort weiter, am Ende beginnt es wieder vorn", () => {
    const { gesprochen, satzFertig } = attrappe();
    const teile = saetzeTeilen(LANG);
    let meldungen = 0;
    const ab = vorleseAbo(() => { meldungen++; });
    expect(vorlesenWeiter(LANG)).toBe(true);
    expect(vorleseLaeuft(LANG)).toBe(true);
    expect(gesprochen.map((u) => u.text)).toEqual([teile[0]]);
    satzFertig(); satzFertig(); // Satz 1 und 2 gehört, Satz 3 läuft
    expect(gesprochen[2].text).toBe(teile[2]);
    vorlesePause();
    expect(vorleseLaeuft(LANG)).toBe(false);
    expect(vorleseStelle(LANG)).toBe(2);
    gesprochen[2].onend(); // spätes Ende-Ereignis des abgebrochenen Satzes: darf nichts auslösen
    expect(gesprochen).toHaveLength(3);
    expect(vorlesenWeiter(LANG)).toBe(true); // ▶️ weiter bei Satz 3
    expect(gesprochen[3].text).toBe(teile[2]);
    satzFertig(); satzFertig(); satzFertig(); // bis zum Schluss
    expect(vorleseLaeuft(LANG)).toBe(false);
    expect(vorleseStelle(LANG)).toBe(0);
    expect(meldungen).toBeGreaterThanOrEqual(4);
    ab();
  });

  it("„Von vorn“ vergisst die Stelle; ein anderer Text unterbricht und merkt die alte Stelle", () => {
    const { gesprochen, satzFertig } = attrappe();
    const teile = saetzeTeilen(LANG);
    vorlesenWeiter(LANG); satzFertig();
    vorlesenWeiter("Ein anderer kurzer Text."); // Knopf an anderer Stelle gedrückt
    expect(vorleseLaeuft("Ein anderer kurzer Text.")).toBe(true);
    expect(vorleseStelle(LANG)).toBe(1);
    vorlesenVonVorn(LANG);
    expect(vorleseStelle(LANG)).toBe(0);
    expect(gesprochen[gesprochen.length - 1].text).toBe(teile[0]);
    satzFertig();
    vorleseStopp(); // Abbruch ohne Merken (Fragenwechsel)
    expect(vorleseStelle(LANG)).toBe(0);
    vorlesenWeiter(LANG); satzFertig(); satzFertig();
    vorlesen(LANG); // automatisches Vorlesen beginnt immer vorn
    expect(gesprochen[gesprochen.length - 1].text).toBe(teile[0]);
  });
});
