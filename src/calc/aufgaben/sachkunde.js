/* Aufgaben-Pools Sachkunde (aus der Alt-App v1.86, Bildungsplan BW Kl. 3/4).
   Reine Daten: je Bereich { easy, hard }, Aufgabe = { f, r, x:[2], tipp, kontext? } */
export const SACH_DATEN={
  sstrom:{
    easy:[
      {f:"Wann leuchtet die Lampe im Stromkreis?", r:"Wenn der Stromkreis geschlossen ist", x:["Wenn der Stromkreis unterbrochen ist","Wenn die Batterie fehlt"], tipp:"Der Strom braucht einen geschlossenen Kreis – wie eine Rennbahn ohne Lücke."},
      {f:"Was ist eine Stromquelle?", r:"Batterie", x:["Kabel","Glühlampe"], tipp:"Die Batterie liefert den Strom – Kabel und Lampe brauchen ihn nur."},
      {f:"Was macht ein Schalter?", r:"Er öffnet und schließt den Stromkreis", x:["Er macht den Strom stärker","Er lädt die Batterie auf"], tipp:"Schalter aus = Kreis unterbrochen = Lampe aus."},
      {f:"Welcher Stoff leitet Strom?", r:"Metall", x:["Holz","Plastik"], tipp:"Metalle wie Kupfer und Eisen sind Leiter – deshalb sind Kabel innen aus Metall."},
      {f:"Welcher Stoff leitet KEINEN Strom?", r:"Gummi", x:["Kupferdraht","Alufolie"], tipp:"Gummi und Plastik sind Nichtleiter – darum sind Kabel außen damit ummantelt."},
      {f:"Was darfst du NIEMALS in eine Steckdose stecken?", r:"Gegenstände wie Stifte oder Nägel", x:["Einen passenden Stecker","Ein Nachtlicht"], tipp:"In der Steckdose ist starker Strom – der ist lebensgefährlich. Nur echte Stecker gehören hinein!"},
      {f:"Warum ist ein Föhn in der Badewanne so gefährlich?", r:"Wasser leitet Strom", x:["Der Föhn wird nass und kaputt","Es wird zu laut"], tipp:"Strom und Wasser sind ein gefährliches Paar – elektrische Geräte weg vom Wasser!"},
      {f:"Wie kannst du zu Hause Strom sparen?", r:"Licht ausschalten, wenn du das Zimmer verlässt", x:["Alle Lampen immer anlassen","Den Kühlschrank offen stehen lassen"], tipp:"Was nicht läuft, verbraucht nichts – Ausschalten ist Sparen."},
      {f:"Welche Energiequelle nutzt eine Solaranlage?", r:"Die Sonne", x:["Den Regen","Die Erde"], tipp:"Solar kommt von „Sol“ = Sonne."},
      {f:"Was braucht ein Windrad, um Strom zu erzeugen?", r:"Wind", x:["Benzin","Batterien"], tipp:"Der Wind dreht die Flügel – die Drehung wird zu Strom."}
    ],
    hard:[
      {kontext:"Zwei Lampen hängen HINTEREINANDER im Stromkreis (Reihenschaltung). Eine Lampe geht kaputt.", f:"Was passiert mit der anderen Lampe?", r:"Sie geht auch aus", x:["Sie leuchtet weiter","Sie leuchtet doppelt hell"], tipp:"In der Reihe unterbricht die kaputte Lampe den ganzen Kreis – wie eine Brücke, die fehlt."},
      {kontext:"Zwei Lampen hängen NEBENEINANDER im Stromkreis (Parallelschaltung). Eine Lampe geht kaputt.", f:"Was passiert mit der anderen Lampe?", r:"Sie leuchtet weiter", x:["Sie geht auch aus","Sie blinkt"], tipp:"Parallel hat jede Lampe ihren eigenen Weg – so ist es auch bei dir zu Hause."},
      {f:"Mit einem Prüf-Stromkreis (Batterie, Lampe, zwei Kabelenden) testest du eine Schere aus Metall. Was passiert?", r:"Die Lampe leuchtet – Metall leitet", x:["Nichts – Scheren leiten nie","Die Batterie wird leer"], tipp:"Hältst du die Kabelenden an einen Leiter, schließt er den Kreis."},
      {f:"Welche Energiequellen nennt man ERNEUERBAR?", r:"Sonne, Wind und Wasser", x:["Kohle und Erdgas","Benzin und Diesel"], tipp:"Erneuerbar heißt: Sie gehen nicht aus – die Sonne scheint immer wieder."},
      {f:"Warum sollen wir sparsam mit Kohle und Erdgas umgehen?", r:"Sie gehen irgendwann zur Neige und belasten die Umwelt", x:["Sie sind zu billig","Sie machen zu hellen Strom"], tipp:"Was Millionen Jahre zum Entstehen brauchte, ist schnell verbraucht."},
      {f:"Der Fernseher ist „aus“, aber das rote Lämpchen leuchtet noch (Standby). Was stimmt?", r:"Er verbraucht weiter ein bisschen Strom", x:["Er verbraucht gar nichts mehr","Er lädt sich dabei auf"], tipp:"Standby heißt Bereitschaft – richtig sparen heißt: ganz ausschalten."},
      {f:"Woraus besteht ein einfacher Stromkreis mindestens?", r:"Stromquelle, Kabel und Lampe (Verbraucher)", x:["Nur aus Kabeln","Steckdose und Schalter"], tipp:"Quelle → Kabel hin → Verbraucher → Kabel zurück. Der Kreis muss sich schließen."},
      {kontext:"Leo fragt: „Warum passiert Vögeln auf der Stromleitung nichts?“", f:"Was ist die Antwort?", r:"Der Strom fließt nicht durch den Vogel – sein Körper schließt keinen Kreis", x:["Vögel sind aus Gummi","Auf Leitungen ist nie Strom"], tipp:"Der Vogel sitzt nur auf EINEM Draht – erst eine Verbindung zu Erde oder zweitem Draht wäre gefährlich."},
      {f:"Ein Gerät hat ein beschädigtes Kabel – blanker Draht ist zu sehen. Was ist richtig?", r:"Nicht benutzen und einem Erwachsenen Bescheid sagen", x:["Mit Klebeband selbst reparieren","Einfach vorsichtig weiterbenutzen"], tipp:"Blanke Drähte sind gefährlich – das prüfen und reparieren Erwachsene bzw. Fachleute."},
      {f:"Welcher Weg beschreibt, wie Strom zu uns nach Hause kommt?", r:"Kraftwerk → Leitungen → Steckdose", x:["Steckdose → Kraftwerk → Lampe","Batterie → Steckdose → Kraftwerk"], tipp:"Im Kraftwerk wird Strom erzeugt, Leitungen bringen ihn ins Haus."}
    ]
  },
  srad:{
    easy:[
      {f:"Was gehört auf den Kopf – bei jeder Fahrradfahrt?", r:"Der Fahrradhelm", x:["Eine Mütze reicht","Nichts, bei kurzen Wegen"], tipp:"Der Helm schützt dein Gehirn – auch auf dem kürzesten Weg."},
      {f:"Wie viele Bremsen braucht ein verkehrssicheres Fahrrad?", r:"2 voneinander unabhängige Bremsen", x:["1 Bremse reicht","Bremsen sind freiwillig"], tipp:"Vorder- und Rücktritt-/Hinterradbremse – falls eine ausfällt."},
      {f:"Welches Licht gehört vorne ans Fahrrad?", r:"Ein weißes Licht", x:["Ein rotes Licht","Gar kein Licht"], tipp:"Vorne weiß, hinten rot – wie beim Auto."},
      {f:"Was zeigst du mit ausgestrecktem Arm an?", r:"Dass du abbiegen möchtest", x:["Dass du schneller wirst","Dass du müde bist"], tipp:"Das Handzeichen sagt allen: Ich biege gleich ab!"},
      {f:"Die Ampel zeigt Rot. Was machst du?", r:"Anhalten und warten", x:["Schnell noch rüberfahren","Klingeln und durchfahren"], tipp:"Rot heißt Stopp – immer, auch ohne Autos in Sicht."},
      {f:"Auf welcher Seite der Straße fährst du mit dem Rad?", r:"Rechts", x:["Links","In der Mitte"], tipp:"In Deutschland gilt: rechts fahren."},
      {f:"Du willst am Zebrastreifen die Straße überqueren. Was ist richtig?", r:"Absteigen und das Rad schieben", x:["Schnell rüberfahren","Auf dem Rad warten"], tipp:"Auf dem Zebrastreifen bist du als Fußgänger geschützt – also schieben."},
      {f:"Wozu ist die Klingel am Fahrrad da?", r:"Um andere rechtzeitig zu warnen", x:["Um Musik zu machen","Um schneller zu fahren"], tipp:"Ein kurzes Klingeln sagt: Achtung, ich komme!"},
      {f:"Was machen Reflektoren (Katzenaugen) am Fahrrad?", r:"Sie leuchten im Scheinwerferlicht auf – man sieht dich", x:["Sie machen das Rad leichter","Sie bremsen das Rad"], tipp:"Reflektoren werfen Licht zurück – wichtig im Dunkeln!"},
      {f:"Vor dem Losfahren vom Straßenrand: Was kommt zuerst?", r:"Der Blick über die Schulter", x:["Einfach losfahren","Laut klingeln"], tipp:"Der Schulterblick zeigt dir, ob von hinten etwas kommt."}
    ],
    hard:[
      {f:"An einer Kreuzung ohne Schilder und Ampel gilt …", r:"rechts vor links", x:["links vor rechts","Wer schneller ist, fährt zuerst"], tipp:"Wer von RECHTS kommt, darf zuerst fahren."},
      {f:"Welches Schild bedeutet „Vorfahrt gewähren“?", r:"Das auf der Spitze stehende Dreieck", x:["Das achteckige rote Schild","Das gelbe Quadrat auf der Spitze"], tipp:"Das umgedrehte Dreieck sagt: Die anderen dürfen zuerst. Das Achteck ist STOPP, das gelbe Quadrat heißt: DU hast Vorfahrt."},
      {f:"Was musst du am Stopp-Schild tun – auch wenn nichts kommt?", r:"Ganz anhalten, schauen, dann fahren", x:["Nur langsamer werden","Klingeln und durchfahren"], tipp:"STOPP heißt wirklich stehen bleiben – Füße auf den Boden."},
      {f:"Linksabbiegen mit dem Rad: Was ist die richtige Reihenfolge?", r:"Schulterblick → Handzeichen → einordnen → Gegenverkehr durchlassen → abbiegen", x:["Handzeichen → Augen zu → schnell rüber","Einordnen → Schulterblick erst beim Abbiegen"], tipp:"Erst schauen, dann zeigen, dann einordnen – die Prüfungs-Reihenfolge!"},
      {kontext:"Ein Lastwagen steht an der Kreuzung und will rechts abbiegen. Du stehst mit dem Rad rechts daneben.", f:"Warum ist das gefährlich?", r:"Du bist im toten Winkel – die Fahrerin oder der Fahrer sieht dich nicht", x:["Lastwagen fahren immer zu schnell","Es ist verboten, neben Lastwagen zu stehen"], tipp:"Bleib hinter dem Lastwagen und such Blickkontakt – wer den Spiegel nicht sieht, wird nicht gesehen."},
      {f:"Bis zu welchem Alter MÜSSEN Kinder mit dem Rad auf dem Gehweg fahren?", r:"Bis zum 8. Geburtstag", x:["Bis zum 12. Geburtstag","Gar nicht – Kinder fahren auf der Straße"], tipp:"Bis 8 Pflicht, bis 10 erlaubt – danach gehört das Rad auf Straße oder Radweg."},
      {f:"Warum ist der Bremsweg bei Regen länger?", r:"Die nasse Fahrbahn ist rutschig – die Reifen greifen schlechter", x:["Die Bremsen werden bei Regen stärker","Der Bremsweg ist immer gleich"], tipp:"Bei Nässe: früher bremsen, langsamer fahren."},
      {f:"Was gehört ALLES zum verkehrssicheren Fahrrad?", r:"2 Bremsen, Klingel, Licht vorn und hinten, Reflektoren", x:["Nur eine Klingel und Schwung","Hauptsache cooler Lenker"], tipp:"Die Polizei prüft genau das bei der Radfahrprüfung in Klasse 4!"},
      {kontext:"Du fährst auf dem Radweg. Ein Auto will aus einer Einfahrt über den Radweg fahren.", f:"Was ist am sichersten?", r:"Blickkontakt suchen, bremsbereit sein – auch mit Vorfahrt", x:["Einfach weiterfahren, du hast ja Vorfahrt","Die Augen zumachen und durch"], tipp:"Vorfahrt haben nützt nur, wenn dich alle gesehen haben. Sicher schlägt schnell."},
      {f:"Wo wird die praktische Radfahrprüfung in Klasse 4 meistens geübt?", r:"In der Jugendverkehrsschule mit der Polizei", x:["Auf der Autobahn","Nur am Computer"], tipp:"Auf dem Übungsplatz übst du echte Situationen – Abbiegen, Vorfahrt, Schulterblick."}
    ]
  },
  skarte:{
    easy:[
      {f:"Wie heißen die vier Himmelsrichtungen im Uhrzeigersinn?", r:"Norden, Osten, Süden, Westen", x:["Norden, Westen, Süden, Osten","Oben, unten, links, rechts"], tipp:"Merkspruch: „Nie Ohne Seife Waschen“ – N, O, S, W."},
      {f:"Wohin zeigt die Kompassnadel?", r:"Nach Norden", x:["Nach Süden","Zur Sonne"], tipp:"Die magnetische Nadel richtet sich nach Norden aus."},
      {f:"Wo geht die Sonne auf?", r:"Im Osten", x:["Im Westen","Im Norden"], tipp:"Im Osten geht die Sonne auf, im Süden nimmt sie ihren Lauf, im Westen wird sie untergehen …"},
      {f:"Welche Himmelsrichtung ist auf Karten meistens oben?", r:"Norden", x:["Süden","Westen"], tipp:"Karten sind fast immer „genordet“."},
      {f:"Was bedeutet eine blaue Fläche auf der Karte?", r:"Wasser (See oder Fluss)", x:["Wald","Straße"], tipp:"Blau = Wasser, Grün = Wald/Wiese, Grau/Rot = Häuser und Straßen."},
      {f:"Wie heißt die Landeshauptstadt von Baden-Württemberg?", r:"Stuttgart", x:["München","Karlsruhe"], tipp:"Stuttgart ist die größte Stadt im Land – dort sitzt die Landesregierung."},
      {f:"Was erklärt dir die Legende (Zeichenerklärung) einer Karte?", r:"Was die Farben und Zeichen bedeuten", x:["Eine alte Sage","Wie das Wetter wird"], tipp:"Ohne Legende weißt du nicht, was die Symbole heißen."},
      {f:"In welchem Bundesland liegt deine Schule?", r:"Baden-Württemberg", x:["Bayern","Berlin"], tipp:"Du wohnst in Baden-Württemberg – im Südwesten Deutschlands."},
      {f:"Wie heißt die Hauptstadt von Deutschland?", r:"Berlin", x:["Hamburg","Stuttgart"], tipp:"Berlin – dort arbeiten Bundestag und Bundesregierung."},
      {f:"Was ist der Schwarzwald?", r:"Ein großes Waldgebirge in Baden-Württemberg", x:["Ein Fluss","Eine Stadt"], tipp:"Berühmt für Tannen, Kuckucksuhren und Kirschtorte!"}
    ],
    hard:[
      {f:"Wo liegt Baden-Württemberg in Deutschland?", r:"Im Südwesten", x:["Im Norden","Im Osten"], tipp:"Ganz unten links auf der Deutschlandkarte."},
      {f:"Welcher Fluss bildet die Grenze zwischen Baden-Württemberg und Frankreich?", r:"Der Rhein", x:["Der Neckar","Die Donau"], tipp:"Der Rhein fließt im Westen des Landes – drüben liegt Frankreich."},
      {f:"Welcher Fluss fließt durch Stuttgart und Heidelberg?", r:"Der Neckar", x:["Der Rhein","Die Elbe"], tipp:"Der Neckar schlängelt sich mitten durch Baden-Württemberg."},
      {f:"Wie heißt der große See im Süden von Baden-Württemberg?", r:"Der Bodensee", x:["Der Chiemsee","Der Titisee"], tipp:"Am Bodensee treffen sich Deutschland, Österreich und die Schweiz."},
      {f:"Wie heißt der höchste Berg Baden-Württembergs?", r:"Der Feldberg", x:["Die Zugspitze","Der Brocken"], tipp:"Der Feldberg im Schwarzwald – fast 1500 m hoch. Die Zugspitze ist zwar höher, steht aber in Bayern!"},
      {f:"Welche NACHBARLÄNDER grenzen an Baden-Württemberg?", r:"Frankreich, die Schweiz und Österreich", x:["Italien und Spanien","Polen und Dänemark"], tipp:"Frankreich im Westen, die Schweiz im Süden, Österreich am Bodensee."},
      {f:"Wie viele Bundesländer hat Deutschland?", r:"16", x:["10","25"], tipp:"16 Länder – Baden-Württemberg ist eines davon."},
      {f:"Auf der Karte steht der Maßstab 1 : 100 000. Was bedeutet das?", r:"1 cm auf der Karte ist in echt 100 000 cm (1 km)", x:["Die Karte ist 100 000 cm groß","Man braucht 100 000 Karten"], tipp:"Der Maßstab verrät, wie stark die Karte verkleinert."},
      {f:"Die Sonne steht mittags im Süden. Dein Schatten zeigt dann nach …", r:"Norden", x:["Süden","Osten"], tipp:"Der Schatten fällt immer auf die sonnenabgewandte Seite."},
      {f:"Welche Donau-Aussage stimmt?", r:"Die Donau entspringt in Baden-Württemberg und fließt nach Osten", x:["Die Donau fließt in die Nordsee","Die Donau ist ein See"], tipp:"Bei Donaueschingen im Schwarzwald beginnt die Donau ihre lange Reise Richtung Schwarzes Meer."}
    ]
  },
  sgemeinde:{
    easy:[
      {f:"Wer leitet eine Gemeinde oder Stadt?", r:"Die Bürgermeisterin oder der Bürgermeister", x:["Die Polizei","Die älteste Person im Ort"], tipp:"Gewählt von den Menschen der Gemeinde – Chef- bzw. Chefin im Rathaus."},
      {f:"Was bedeutet Demokratie?", r:"Das Volk entscheidet mit", x:["Einer bestimmt alles allein","Niemand darf etwas entscheiden"], tipp:"Demos = Volk, kratein = herrschen. Alle dürfen mitbestimmen."},
      {f:"Wie läuft eine faire Wahl ab?", r:"Geheim – jede Person hat eine Stimme", x:["Laut rufen, wer am lautesten ist, gewinnt","Nur Erwachsene mit viel Geld wählen"], tipp:"Geheim und gleich: Niemand sieht, was du wählst, und jede Stimme zählt gleich viel."},
      {f:"Was gehört zu den Aufgaben deiner Gemeinde?", r:"Spielplätze, Schulen und Müllabfuhr", x:["Gesetze für ganz Deutschland machen","Das Wetter bestimmen"], tipp:"Die Gemeinde kümmert sich um alles direkt vor deiner Haustür."},
      {f:"Wer vertritt die Klasse und bringt ihre Wünsche vor?", r:"Die Klassensprecherin oder der Klassensprecher", x:["Immer die Lehrkraft allein","Niemand"], tipp:"Gewählt von der Klasse – ein Mini-Beispiel für Demokratie!"},
      {f:"Bei einer Abstimmung entscheidet …", r:"die Mehrheit", x:["die lauteste Gruppe","der Zufall"], tipp:"Mehr als die Hälfte der Stimmen gewinnt – die Minderheit wird trotzdem angehört."},
      {f:"Was ist ein Kinderrecht?", r:"Das Recht, zur Schule zu gehen und zu lernen", x:["Das Recht, alles zu bekommen","Das Recht, andere zu ärgern"], tipp:"Kinderrechte gelten für ALLE Kinder: lernen, spielen, geschützt sein, Meinung sagen."},
      {f:"Was will Werbung erreichen?", r:"Dass du etwas kaufst", x:["Dass du schlauer wirst","Dass du sparst"], tipp:"Werbung zeigt alles besonders schön – denk nach: Brauche ich das wirklich?"},
      {f:"Wo arbeiten Bürgermeister/in und Verwaltung?", r:"Im Rathaus", x:["Im Museum","Im Schwimmbad"], tipp:"Das Rathaus ist das „Wohnzimmer“ der Gemeinde-Verwaltung."},
      {f:"Zwei Kinder wollen verschiedene Spiele spielen. Was ist ein Kompromiss?", r:"Erst das eine, dann das andere Spiel", x:["Keiner spielt etwas","Der Stärkere entscheidet"], tipp:"Beim Kompromiss bekommt jeder einen Teil – keiner verliert ganz."}
    ],
    hard:[
      {f:"Wer entscheidet in der Gemeinde über neue Spielplätze oder Radwege mit?", r:"Der gewählte Gemeinderat", x:["Die Feuerwehr","Der Sportverein"], tipp:"Die Bürger wählen den Gemeinderat – er berät und stimmt über die Pläne der Gemeinde ab."},
      {f:"Was darf die Gemeinde NICHT?", r:"Gesetze für ganz Deutschland beschließen", x:["Ein neues Feuerwehrauto kaufen","Einen Spielplatz bauen"], tipp:"Gesetze für alle macht der Bundestag in Berlin – die Gemeinde regelt das Örtliche."},
      {f:"Warum ist es wichtig, dass Wahlen GEHEIM sind?", r:"Damit niemand unter Druck gesetzt werden kann", x:["Damit es spannender ist","Damit man das Ergebnis verstecken kann"], tipp:"Nur wer unbeobachtet wählt, wählt wirklich frei."},
      {f:"Die Mehrheit hat entschieden – ein Kind ist dagegen. Was gilt in einer Demokratie?", r:"Die Entscheidung gilt, aber die andere Meinung darf weiter gesagt werden", x:["Das Kind muss ab jetzt schweigen","Die Abstimmung wird so oft wiederholt, bis alle gleich stimmen"], tipp:"Mehrheit entscheidet, Minderheit wird geachtet – beides gehört zur Demokratie."},
      {f:"Woher bekommt die Gemeinde Geld für Schulen und Spielplätze?", r:"Aus Steuern und Abgaben", x:["Vom Sparschwein des Bürgermeisters","Aus einem Geldautomaten im Rathaus"], tipp:"Alle zahlen Steuern – davon wird bezahlt, was allen nützt."},
      {kontext:"In der Werbung sieht der Burger riesig und perfekt aus. Im Laden ist er viel kleiner.", f:"Was lernst du daraus?", r:"Werbung zeigt Produkte schöner, als sie oft sind", x:["Werbung lügt nie","Im Laden gab es nur einen Fehler"], tipp:"Werbe-Bilder werden extra aufgehübscht. Ein Konsum-Profi vergleicht und überlegt vor dem Kauf."},
      {f:"Du willst dir etwas Teures kaufen. Was macht ein Konsum-Profi ZUERST?", r:"Überlegen: Brauche ich das? Und Preise vergleichen", x:["Sofort kaufen, bevor es weg ist","Kaufen, weil es alle haben"], tipp:"Erst denken, dann zahlen – so bleibt vom Taschengeld mehr übrig."},
      {f:"Welche Rechte gehören zu den Kinderrechten?", r:"Schutz, Bildung, Spiel und eigene Meinung", x:["Immer Recht haben","Jeden Tag Geschenke bekommen"], tipp:"Die Kinderrechte gelten weltweit für jedes Kind – seit der UN-Kinderrechtskonvention."},
      {f:"Der Klassenrat tagt: Wer darf dort seine Meinung sagen?", r:"Alle Kinder der Klasse", x:["Nur die Klassensprecher","Nur wer gute Noten hat"], tipp:"Im Klassenrat zählt jede Stimme – Zuhören und Ausreden-Lassen gehören dazu."},
      {f:"Warum gibt es Regeln und Gesetze?", r:"Damit das Zusammenleben fair und sicher ist", x:["Um Menschen zu ärgern","Damit Erwachsene mehr dürfen"], tipp:"Regeln schützen alle – wie Spielregeln: Ohne sie gäbe es Streit."}
    ]
  },
  skoerper:{
    easy:[
      {f:"Welches Organ pumpt das Blut durch deinen Körper?", r:"Das Herz", x:["Die Lunge","Der Magen"], tipp:"Dein Herz schlägt Tag und Nacht – etwa 90-mal pro Minute bei Kindern."},
      {f:"Womit atmest du?", r:"Mit der Lunge", x:["Mit dem Herzen","Mit dem Magen"], tipp:"Die Lunge holt den Sauerstoff aus der Luft."},
      {f:"Was gibt deinem Körper Halt und Form?", r:"Das Skelett aus Knochen", x:["Die Haare","Die Haut allein"], tipp:"Ohne Knochen wärst du weich wie ein Pudding."},
      {f:"Was brauchst du, um dich zu bewegen?", r:"Muskeln", x:["Nur Knochen","Nur Luft"], tipp:"Muskeln ziehen an den Knochen – so entsteht jede Bewegung."},
      {f:"Wie oft solltest du deine Zähne putzen?", r:"Mindestens zweimal am Tag", x:["Einmal in der Woche","Nur nach Süßigkeiten"], tipp:"Morgens und abends – je zwei bis drei Minuten."},
      {f:"Was ist das beste Getränk für zwischendurch?", r:"Wasser", x:["Limonade","Energydrink"], tipp:"Wasser löscht den Durst ohne Zucker."},
      {f:"Was gehört in ein gesundes Pausenbrot?", r:"Vollkornbrot, Gemüse und Obst", x:["Nur Schokoriegel","Chips und Limo"], tipp:"Buntes Essen macht satt und gibt Kraft zum Denken."},
      {f:"Welche 5 Sinne hat der Mensch?", r:"Sehen, Hören, Riechen, Schmecken, Tasten", x:["Sehen, Hören, Rennen, Springen, Schlafen","Nur Sehen und Hören"], tipp:"Augen, Ohren, Nase, Zunge, Haut – deine 5 Super-Sensoren."},
      {f:"Warum ist Bewegung gesund?", r:"Sie stärkt Muskeln, Knochen und das Herz", x:["Sie macht nur müde","Sie ist nur etwas für Profis"], tipp:"Toben, Radfahren, Klettern – dein Körper liebt Bewegung!"},
      {f:"Was steuert deinen ganzen Körper?", r:"Das Gehirn", x:["Der Bauch","Die Füße"], tipp:"Das Gehirn ist die Kommandozentrale – auch fürs Lernen!"}
    ],
    hard:[
      {f:"Wie groß ist dein Herz ungefähr?", r:"So groß wie deine Faust", x:["So groß wie ein Fußball","So klein wie eine Erbse"], tipp:"Balle die Faust – so groß ist dein Herzmuskel."},
      {f:"Was transportiert das Blut durch den Körper?", r:"Sauerstoff und Nährstoffe", x:["Nur Wasser","Gedanken"], tipp:"Das Blut ist der Liefer-Service deines Körpers."},
      {f:"Welchen Weg nimmt das Essen durch deinen Körper?", r:"Mund → Speiseröhre → Magen → Darm", x:["Mund → Lunge → Herz","Mund → Magen → Speiseröhre"], tipp:"Im Magen wird das Essen zerkleinert, im Darm holt sich der Körper die Nährstoffe."},
      {f:"Warum ist Schlaf so wichtig für dich?", r:"Der Körper erholt sich und das Gehirn speichert Gelerntes", x:["Schlafen ist Zeitverschwendung","Nur der Bauch braucht Schlaf"], tipp:"Kinder brauchen etwa 10 Stunden – im Schlaf sortiert dein Gehirn den Tag."},
      {f:"Was passiert in der Pubertät?", r:"Der Körper verändert sich vom Kind zum Erwachsenen – das ist normal", x:["Man wird krank","Nichts – der Körper bleibt immer gleich"], tipp:"Jeder kommt in die Pubertät, jeder in seinem Tempo – alles daran ist normal."},
      {f:"Warum ist zu viel Zucker (z. B. in Limo) ungesund?", r:"Er schadet den Zähnen und macht nicht lange satt", x:["Zucker macht die Haare grün","Zucker ist immer verboten"], tipp:"Ab und zu naschen ist okay – Wasser und echtes Essen sind die Basis."},
      {f:"Wie schützt du deine Ohren?", r:"Laute Musik leiser drehen und Lärm meiden", x:["Möglichst oft laute Kopfhörer","Gar nicht – Ohren reparieren sich immer"], tipp:"Einmal kaputte Haarzellen im Ohr wachsen nicht nach – leiser ist schlauer."},
      {f:"Wozu hat der Körper eine Haut?", r:"Sie schützt vor Sonne, Keimen und Verletzungen – und kann tasten", x:["Sie ist nur zur Dekoration","Sie hält nur die Knochen zusammen"], tipp:"Die Haut ist dein größtes Organ – eincremen nicht vergessen!"},
      {f:"Wie viele Knochen hat ein erwachsener Mensch ungefähr?", r:"Etwa 206", x:["Etwa 20","Über 1000"], tipp:"Babys haben sogar mehr – manche Knochen wachsen später zusammen."},
      {f:"Was passiert beim Einatmen?", r:"Die Lunge füllt sich mit Luft und nimmt Sauerstoff auf", x:["Die Lunge wird kleiner und leerer","Die Luft geht in den Magen"], tipp:"Einatmen: Brustkorb weitet sich, Luft strömt ein – der Sauerstoff geht ins Blut."}
    ]
  },
  szeit:{
    easy:[
      {f:"Was zeigt eine Zeitleiste?", r:"Ereignisse in der richtigen Reihenfolge – von früher bis heute", x:["Nur das Wetter","Die Uhrzeit von heute"], tipp:"Links das Älteste, rechts das Neueste – so behältst du den Überblick."},
      {f:"Wie lebten die Menschen in der Steinzeit?", r:"Sie jagten Tiere und sammelten Beeren und Früchte", x:["Sie bestellten Essen im Internet","Sie fuhren mit Autos zur Arbeit"], tipp:"Jäger und Sammler – ihre Werkzeuge machten sie aus Stein, Holz und Knochen."},
      {f:"Was war für die Steinzeitmenschen eine riesige Entdeckung?", r:"Das Feuer", x:["Der Fernseher","Das Fahrrad"], tipp:"Feuer gab Wärme, Licht, Schutz – und gebratenes Essen!"},
      {f:"Wer kann dir aus der Zeit vor 50 Jahren erzählen?", r:"Oma und Opa als Zeitzeugen", x:["Ein Baby","Niemand – das weiß keiner mehr"], tipp:"Zeitzeugen haben die Zeit selbst erlebt – frag sie nach ihrer Schulzeit!"},
      {f:"Wo kannst du echte Dinge aus der Vergangenheit ansehen?", r:"Im Museum", x:["Im Schwimmbad","Im Supermarkt"], tipp:"Museen sammeln und zeigen Zeitzeugnisse – von Steinzeit-Äxten bis Ritterrüstungen."},
      {f:"Wie schrieben sich die Menschen Nachrichten, bevor es Handys gab?", r:"Mit Briefen", x:["Gar nicht","Per Videoanruf"], tipp:"Ein Brief war tagelang unterwegs – heute ist eine Nachricht in einer Sekunde da."},
      {f:"Was ist ein Zeitzeugnis?", r:"Etwas Altes, das von früher erzählt – z. B. ein Foto oder Gebäude", x:["Eine Erfindung der Zukunft","Ein neues Spielzeug"], tipp:"Alte Fotos, Briefe, Münzen, Burgen – sie alle erzählen Geschichte(n)."},
      {f:"Was kommt auf der Zeitleiste ZUERST?", r:"Die Steinzeit", x:["Die Ritterzeit","Heute"], tipp:"Steinzeit → Römer → Ritter → heute."},
      {f:"Womit haben Kinder früher in der Schule geschrieben?", r:"Mit Griffel auf einer Schiefertafel", x:["Mit dem Tablet","Mit Sprühdosen"], tipp:"Die kleine Tafel wurde immer wieder abgewischt – Hefte waren teuer."},
      {f:"Wie machten die Menschen früher abends Licht – ohne Strom?", r:"Mit Kerzen und Öllampen", x:["Mit Taschenlampen","Mit Neonröhren"], tipp:"Elektrisches Licht gibt es erst seit gut 140 Jahren."}
    ],
    hard:[
      {f:"Wie viele Jahre sind ein Jahrhundert?", r:"100 Jahre", x:["10 Jahre","1000 Jahre"], tipp:"Jahrzehnt = 10, Jahrhundert = 100, Jahrtausend = 1000 Jahre."},
      {f:"Welche Reihenfolge stimmt?", r:"Steinzeit → Römerzeit → Mittelalter → heute", x:["Mittelalter → Steinzeit → Römerzeit → heute","Römerzeit → Steinzeit → heute → Mittelalter"], tipp:"Von den Höhlen über die Legionäre zu den Rittern – und dann zu uns."},
      {f:"Vor ungefähr wie vielen Jahren waren die Römer in unserer Gegend?", r:"Vor etwa 2000 Jahren", x:["Vor 50 Jahren","Vor 2 Millionen Jahren"], tipp:"Die Römer bauten damals Straßen, Bäder und Kastelle – auch in Baden-Württemberg."},
      {f:"Was war der Limes?", r:"Die befestigte Grenze des Römischen Reichs – sie verlief auch durch Baden-Württemberg", x:["Ein römisches Gericht","Ein Fluss in Italien"], tipp:"Mit Wachtürmen und Palisaden – Reste kann man heute noch besichtigen!"},
      {f:"Was haben uns die Römer mitgebracht?", r:"Straßen, steinerne Bäder und neue Obstsorten", x:["Handys und Autos","Nichts – sie waren nie hier"], tipp:"Viele Städte am Rhein und Neckar haben römische Wurzeln."},
      {f:"Wo lebten Ritter im Mittelalter?", r:"Auf Burgen", x:["In Hochhäusern","In U-Booten"], tipp:"Dicke Mauern, Türme, Zugbrücke – viele Burgen in BW kannst du besuchen."},
      {f:"Was machen Archäologinnen und Archäologen?", r:"Sie graben alte Dinge aus und erforschen sie", x:["Sie bauen neue Häuser","Sie sagen das Wetter vorher"], tipp:"Aus Scherben, Knochen und Mauerresten lesen sie wie aus einem Geschichtsbuch."},
      {f:"Woran erkennst du, dass eine Erzählung über früher stimmt?", r:"An Quellen: Funde, Bilder, Berichte aus der Zeit", x:["Daran, dass sie spannend klingt","Stimmt immer, wenn Erwachsene sie erzählen"], tipp:"Historiker prüfen Quellen – je mehr zusammenpassen, desto sicherer das Wissen."},
      {kontext:"Oma erzählt: „Bei uns gab es EINEN Fernseher im Dorf – schwarz-weiß!“", f:"Was zeigt dir das?", r:"Der Alltag verändert sich mit der Zeit stark", x:["Oma erinnert sich bestimmt falsch","Fernseher gab es schon immer überall"], tipp:"Technik, Schule, Spielzeug – vieles war früher ganz anders. Zeitzeugen machen das lebendig."},
      {f:"Wie lange dauerte die Steinzeit im Vergleich zu unserer Zeit mit Handys?", r:"Viel, viel länger – viele hunderttausend Jahre", x:["Nur ein paar Jahre","Genau gleich lang"], tipp:"Auf einer Zeitleiste wäre die Steinzeit ein langes Band – die Handy-Zeit nur ein winziger Punkt."}
    ]
  }
};
export const SACH_BEREICHE = [
  { key: "sstrom", emoji: "⚡", name: "Strom & Energie" },
  { key: "srad", emoji: "🚲", name: "Radfahrprüfung" },
  { key: "skarte", emoji: "🗺️", name: "Karten & Baden-Württemberg" },
  { key: "sgemeinde", emoji: "🏛️", name: "Gemeinde & Demokratie" },
  { key: "skoerper", emoji: "🫀", name: "Körper & Gesundheit" },
  { key: "szeit", emoji: "🕰️", name: "Zeit & Geschichte" },
];
