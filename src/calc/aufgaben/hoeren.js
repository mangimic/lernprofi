/* ============================================================
   🔊 HÖR-DETEKTIV – gezieltes Rechtschreib-Training nach echten
   Fehlermustern aus Felix' Kompass-Archiv-Blatt (Aufgabe 9/2024):
   „Atickel" (r überhört), „fohrne" (f/v + Dehnungs-h zu viel),
   „tran" (d/t am Anfang), „setsen" (tz nach kurzem Vokal).
   Vier Muster, vier Strategien:
   1. d/t & g/k am Wortanfang/-ende → LAUT sprechen / verlängern
   2. f oder v → die V-Familie als Merkwörter
   3. r nach Vokal → Silben schwingen (Ar-ti-kel), Roboter-Sprache
   4. kurzer Vokal → tz/ck · langer Vokal → z/k (und mal Dehnungs-h)
   easy = ein Muster pro Wort · hard = Kombis und Stolperfallen.
   ============================================================ */

export const HOEREN_DATEN = {
  hoeren: {
    easy: [
      {f:"Welches Wort ist richtig geschrieben?", r:"vorne", x:["forne","fohrne"], tipp:"V-Familie merken: vorne, vor, von, viel, Vogel, Vater – und „vorne“ hat kein h."},
      {f:"Welches Wort ist richtig geschrieben?", r:"dran", x:["tran","drann"], tipp:"Verlängere: dran = daran. Hörst du das weiche d von „da“?"},
      {f:"Welches Wort ist richtig geschrieben?", r:"Artikel", x:["Atikel","Artickel"], tipp:"Schwing die Silben: Ar-ti-kel. In „Ar“ steckt ein r – sprich es wie ein Roboter!"},
      {f:"Welches Wort ist richtig geschrieben?", r:"setzen", x:["setsen","sezen"], tipp:"Das e ist KURZ → danach kommt tz: set-zen."},
      {f:"Welches Wort ist richtig geschrieben?", r:"Gefahr", x:["Gefar","Gevahr"], tipp:"Ge-fahr: langes a mit Dehnungs-h – und f, denn es gehört nicht zur V-Familie."},
      {f:"Welches Wort ist richtig geschrieben?", r:"Richtung", x:["Rictung","Richtunk"], tipp:"Verlängere: Richtun-gen – am Ende wird das g hörbar."},
      {f:"Welches Wort ist richtig geschrieben?", r:"Erfolg", x:["Erfolk","Ervolg"], tipp:"Verlängere: Erfol-ge – das g kommt zum Vorschein."},
      {f:"Welches Wort ist richtig geschrieben?", r:"Vogel", x:["Fogel","Vohgel"], tipp:"V-Familie: Vogel, Vater, viel, von, vor – das o ist lang, braucht aber KEIN h."},
      {f:"Welches Wort ist richtig geschrieben?", r:"warten", x:["waten","wahten"], tipp:"Schwing: war-ten. Sprich das r deutlich mit, dann schreibst du es auch."},
      {f:"Welches Wort ist richtig geschrieben?", r:"Garten", x:["Gaten","Gahten"], tipp:"Gar-ten – wie „Gar-age“: das r gehört in die erste Silbe."},
      {f:"Welches Wort ist richtig geschrieben?", r:"trinken", x:["drinken","trincken"], tipp:"Sprich hart am Anfang: TR wie bei „Treppe“. Und nach dem n kommt nur k."},
      {f:"Welches Wort ist richtig geschrieben?", r:"von", x:["fon","vonn"], tipp:"V-Familie: von, vor, viel – kurzes Wort, einfaches n."},
    ],
    hard: [
      {f:"Welches Wort ist richtig geschrieben?", r:"dransetzen", x:["transetsen","dransezen"], tipp:"Zwei Bausteine: dran (= daran) + setzen (kurzes e → tz)."},
      {f:"Welches Wort ist richtig geschrieben?", r:"Katze", x:["Katse","Kaze"], tipp:"Das a ist KURZ → tz. Sprich: Kat-ze."},
      {f:"Welches Wort ist richtig geschrieben?", r:"Paket", x:["Packet","Pakeet"], tipp:"Das a ist LANG → nur k. ck kommt NUR nach kurzem Vokal."},
      {f:"Welches Wort ist richtig geschrieben?", r:"Musik", x:["Musick","Mussik"], tipp:"Mu-siiik – das i ist lang → k ohne c."},
      {f:"Welches Wort ist richtig geschrieben?", r:"backen", x:["baken","bakken"], tipp:"Das a ist KURZ → ck: ba-cken."},
      {f:"Welches Wort ist richtig geschrieben?", r:"fahren", x:["faren","farhen"], tipp:"Langes a → Dehnungs-h direkt nach dem Vokal: fah-ren."},
      {f:"Welches Wort ist richtig geschrieben?", r:"vorbei", x:["forbei","vohrbei"], tipp:"vor + bei: „vor“ schreibt sich immer mit V und ohne h."},
      {f:"Welches Wort ist richtig geschrieben?", r:"Wörter", x:["Wöter","Wörther"], tipp:"Wör-ter: das r sitzt in der ersten Silbe, ein th gibt es hier nicht."},
      {f:"Welches Wort ist richtig geschrieben?", r:"endlich", x:["entlich","endlisch"], tipp:"Verlängere: en-den → mit d. Und am Ende -lich wie bei „freundlich“."},
      {f:"Welches Wort ist richtig geschrieben?", r:"Hand", x:["Hant","Handt"], tipp:"Verlängere: Hän-de – jetzt hörst du das d."},
      {f:"Welches Wort ist richtig geschrieben?", r:"sitzen", x:["sitsen","siezen"], tipp:"Kurzes i → tz: sit-zen."},
      {f:"Welches Wort ist richtig geschrieben?", r:"Zucker", x:["Zuker","Zukker"], tipp:"Kurzes u → ck: Zu-cker."},
    ],
  },
};

export const HOEREN_BEREICH = { key: "hoeren", emoji: "🔊", name: "Hör-Detektiv" };
