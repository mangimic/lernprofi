/* 🖼️ AUFGABEN-BILDER: kleine, deterministische Grafiken zu einzelnen
   Übungsaufgaben (Felix lernt visuell). Eine Aufgabe trägt dafür ein
   `bild`-Feld, z. B. { art: "strahl", von: 330, bis: 360, … }.
   Wichtig: Die Bilder UNTERSTÜTZEN das Denken, sie verraten keine
   Lösung (Nachbarzehner stehen z. B. als „?" am Strahl).
   Farben über CSS-Variablen → hell und dunkel lesbar; Ampel- und
   Schilderfarben sind bewusst echte Verkehrsfarben. */

const LINIE = "var(--text)";
const LEISE = "var(--text-leise)";
const PRIMAER = "var(--primaer)";
const WARN = "var(--warn)";
const FLAECHE = "color-mix(in srgb, var(--primaer) 14%, var(--karte))";
const ZELLE = "color-mix(in srgb, var(--primaer) 28%, var(--karte))";
const KUGEL_FARBEN = { r: "#d9534f", b: "#4a7fd4", g: "#f0c437", w: "var(--karte)" };

function Strahl({ b }) {
  const W = 360, pad = 30, y = 42;
  const ticks = [];
  for (let t = b.von; t <= b.bis; t += b.schritt) ticks.push(t);
  const x = (t) => pad + ((t - b.von) / (b.bis - b.von)) * (W - 2 * pad);
  return (
    <svg width="100%" viewBox={`0 0 ${W} 66`} style={{ maxWidth: W }} role="img" aria-label="Zahlenstrahl">
      <line x1={pad - 14} y1={y} x2={W - pad + 14} y2={y} stroke={LINIE} strokeWidth="2" />
      {ticks.map((t) => {
        const frage = (b.frage || []).includes(t);
        return (
          <g key={t}>
            <line x1={x(t)} y1={y - 7} x2={x(t)} y2={y + 7} stroke={LINIE} strokeWidth="2" />
            <text x={x(t)} y={y + 21} textAnchor="middle" fontSize={frage ? 15 : 12}
              fontWeight={frage ? 800 : 400} fill={frage ? WARN : LEISE}>
              {frage ? "?" : t}
            </text>
          </g>
        );
      })}
      {(b.marken || []).map((m) => (
        <g key={m}>
          <polygon points={`${x(m) - 6},${y - 18} ${x(m) + 6},${y - 18} ${x(m)},${y - 9}`} fill={PRIMAER} />
          <text x={x(m)} y={y - 23} textAnchor="middle" fontSize="13" fontWeight="800" fill={PRIMAER}>{m}</text>
        </g>
      ))}
    </svg>
  );
}

function Folge({ b }) {
  const kasten = (inhalt, i, offen) => (
    <span key={i} style={{
      minWidth: 44, padding: "6px 8px", textAlign: "center", fontWeight: 800, borderRadius: 8,
      background: offen ? PRIMAER : FLAECHE, color: offen ? "var(--primaer-text)" : "var(--text)",
      border: offen ? "none" : "1.5px solid var(--rand)",
    }}>{inhalt}</span>
  );
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", justifyContent: "center" }}>
      {b.zahlen.map((z, i) => [i > 0 && <span key={`p${i}`} style={{ color: LEISE }}>→</span>, kasten(z, i, false)])}
      {b.weiter && <><span style={{ color: LEISE }}>→</span>{kasten("?", "ende", true)}</>}
    </div>
  );
}

function Mauer({ b }) {
  const n = b.reihe.length;
  const reihen = [];
  for (let groesse = 1; groesse < n; groesse++) reihen.push(Array(groesse).fill("?"));
  reihen.push(b.reihe);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }} role="img" aria-label="Zahlenmauer">
      {reihen.map((r, i) => (
        <div key={i} style={{ display: "flex", gap: 3 }}>
          {r.map((wert, j) => (
            <span key={j} style={{
              width: 54, padding: "7px 0", textAlign: "center", fontWeight: 800, borderRadius: 6,
              background: wert === "?" ? "color-mix(in srgb, var(--warn) 18%, var(--karte))" : FLAECHE,
              border: "1.5px solid var(--rand)", color: wert === "?" ? WARN : "var(--text)",
            }}>{wert}</span>
          ))}
        </div>
      ))}
    </div>
  );
}

function Form({ b }) {
  const stil = { fill: FLAECHE, stroke: LINIE, strokeWidth: 2.5 };
  return (
    <svg width="110" height="86" viewBox="0 0 110 86" role="img" aria-label={`Figur: ${b.form}`}>
      {b.form === "quadrat" && <rect x="24" y="12" width="62" height="62" {...stil} />}
      {b.form === "rechteck" && <rect x="10" y="18" width="90" height="52" {...stil} />}
      {b.form === "kreis" && <circle cx="55" cy="43" r="33" {...stil} />}
      {b.form === "dreieck" && <polygon points="55,10 93,74 17,74" {...stil} />}
    </svg>
  );
}

function Buchstaben({ b }) {
  return (
    <div style={{ display: "flex", gap: 10 }}>
      {b.zeichen.map((z) => (
        <span key={z} style={{
          width: 54, height: 54, display: "grid", placeItems: "center", fontSize: 32, fontWeight: 800,
          borderRadius: 8, background: FLAECHE, border: "1.5px solid var(--rand)",
        }}>{z}</span>
      ))}
    </div>
  );
}

function Kaestchen({ b }) {
  const Z = 20;
  return (
    <div style={{ display: "flex", gap: 22, alignItems: "flex-end" }}>
      {b.figuren.map((fig, i) => (
        <div key={i} style={{ textAlign: "center" }}>
          <svg width={fig[0].length * Z + 2} height={fig.length * Z + 2} role="img" aria-label={`Figur ${"AB"[i] || i + 1}`}>
            {fig.map((zeile, y) => zeile.map((voll, x) => voll ? (
              <rect key={`${x}-${y}`} x={x * Z + 1} y={y * Z + 1} width={Z} height={Z}
                fill={ZELLE} stroke={LINIE} strokeWidth="1.3" />
            ) : null))}
          </svg>
          <div style={{ fontSize: "var(--schrift-klein)", fontWeight: 800, color: LEISE }}>Figur {"AB"[i] || i + 1}</div>
        </div>
      ))}
    </div>
  );
}

function Wuerfelturm({ b }) {
  const Z = 26, maxB = Math.max(...b.reihen);
  const H = b.reihen.length * Z;
  return (
    <svg width={maxB * Z + 2} height={H + 2} role="img" aria-label="Würfelgebäude von vorne">
      {b.reihen.map((anzahl, i) => {
        const y = H - (i + 1) * Z + 1;
        const start = ((maxB - anzahl) / 2) * Z + 1;
        return Array.from({ length: anzahl }, (_, j) => (
          <rect key={`${i}-${j}`} x={start + j * Z} y={y} width={Z} height={Z}
            fill="#eac089" stroke="#9a6a33" strokeWidth="1.6" />
        ));
      })}
    </svg>
  );
}

function Netz({ b }) {
  const Z = 24;
  const zellen = b.form === "reihe"
    ? [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [5, 0]]
    : [[1, 0], [0, 1], [1, 1], [2, 1], [1, 2], [1, 3]]; // Kreuz-Netz
  const maxX = Math.max(...zellen.map(([x]) => x)) + 1;
  const maxY = Math.max(...zellen.map(([, y]) => y)) + 1;
  return (
    <svg width={maxX * Z + 2} height={maxY * Z + 2} role="img" aria-label="Würfelnetz">
      {zellen.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x * Z + 1} y={y * Z + 1} width={Z} height={Z}
          fill={FLAECHE} stroke={LINIE} strokeWidth="1.6" />
      ))}
    </svg>
  );
}

function Uhr({ b }) {
  const [h, min] = b.zeit.split(":").map((x) => parseInt(x, 10));
  const wink = (grad) => ((grad - 90) * Math.PI) / 180;
  const zeiger = (grad, laenge, breite) => (
    <line x1="48" y1="48" x2={48 + laenge * Math.cos(wink(grad))} y2={48 + laenge * Math.sin(wink(grad))}
      stroke={LINIE} strokeWidth={breite} strokeLinecap="round" />
  );
  return (
    <svg width="96" height="96" viewBox="0 0 96 96" role="img" aria-label={`Uhr: ${b.zeit} Uhr`}>
      <circle cx="48" cy="48" r="44" fill="var(--karte)" stroke={LINIE} strokeWidth="2.5" />
      {Array.from({ length: 12 }, (_, i) => {
        const a = wink(i * 30);
        return <line key={i} x1={48 + 38 * Math.cos(a)} y1={48 + 38 * Math.sin(a)}
          x2={48 + 43 * Math.cos(a)} y2={48 + 43 * Math.sin(a)} stroke={LEISE} strokeWidth={i % 3 === 0 ? 3 : 1.5} />;
      })}
      {zeiger(((h % 12) + min / 60) * 30, 22, 4.5)}
      {zeiger(min * 6, 33, 3)}
      <circle cx="48" cy="48" r="3.5" fill={LINIE} />
    </svg>
  );
}

function Kugeln({ b }) {
  return (
    <div style={{ display: "flex", gap: 20 }}>
      {b.saecke.map((sack, i) => {
        const baelle = Object.entries(KUGEL_FARBEN).flatMap(([farbe]) => Array(sack[farbe] || 0).fill(farbe));
        const spalten = Math.min(3, baelle.length);
        const zeilen = Math.ceil(baelle.length / spalten);
        const W = spalten * 24 + 18, H = zeilen * 24 + 18;
        return (
          <div key={i} style={{ textAlign: "center" }}>
            <svg width={W} height={H} role="img" aria-label={`Sack ${b.saecke.length > 1 ? "AB"[i] : ""} mit ${baelle.length} Kugeln`}>
              <rect x="1" y="1" width={W - 2} height={H - 2} rx="12"
                fill="color-mix(in srgb, var(--text) 7%, var(--karte))" stroke="var(--rand)" strokeWidth="1.5" />
              {baelle.map((farbe, k) => (
                <circle key={k} cx={9 + 12 + (k % spalten) * 24} cy={9 + 12 + Math.floor(k / spalten) * 24} r="10"
                  fill={KUGEL_FARBEN[farbe]} stroke={farbe === "w" ? LINIE : "rgba(0,0,0,0.25)"} strokeWidth="1.5" />
              ))}
            </svg>
            {b.saecke.length > 1 && <div style={{ fontSize: "var(--schrift-klein)", fontWeight: 800, color: LEISE }}>Sack {"AB"[i]}</div>}
          </div>
        );
      })}
    </div>
  );
}

function Rad({ b }) {
  const segmente = Object.entries(b.felder).flatMap(([farbe, n]) => Array(n).fill(farbe));
  const n = segmente.length, r = 38;
  const punkt = (i) => {
    const a = ((i * 360) / n - 90) * (Math.PI / 180);
    return [48 + r * Math.cos(a), 48 + r * Math.sin(a)];
  };
  return (
    <svg width="96" height="100" viewBox="0 0 96 100" role="img" aria-label="Glücksrad">
      {segmente.map((farbe, i) => {
        const [x1, y1] = punkt(i), [x2, y2] = punkt(i + 1);
        return <path key={i} d={`M 48 48 L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`}
          fill={KUGEL_FARBEN[farbe]} stroke="var(--karte)" strokeWidth="2" />;
      })}
      <circle cx="48" cy="48" r="5" fill="var(--karte)" stroke={LINIE} strokeWidth="2" />
      <polygon points="48,2 43,12 53,12" fill={LINIE} />
    </svg>
  );
}

function Balken({ b }) {
  const max = Math.max(...b.werte.map(([, w]) => w));
  return (
    <div style={{ display: "grid", gap: 5, width: "100%", maxWidth: 320 }} role="img" aria-label="Balken-Vergleich">
      {b.werte.map(([name, wert, label]) => (
        <div key={name} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 52, fontSize: "var(--schrift-klein)", fontWeight: 800 }}>{name}</span>
          <span style={{ height: 15, width: `${(wert / max) * 60}%`, background: PRIMAER, borderRadius: 7 }} />
          <span style={{ fontSize: "var(--schrift-klein)", color: LEISE, whiteSpace: "nowrap" }}>{label}</span>
        </div>
      ))}
    </div>
  );
}

function Striche({ b }) {
  const buendel = Math.floor(b.n / 5), rest = b.n % 5;
  const gruppe = (x, voll) => (
    <g key={x}>
      {Array.from({ length: voll ? 4 : rest }, (_, i) => (
        <line key={i} x1={x + i * 8} y1="8" x2={x + i * 8} y2="34" stroke={LINIE} strokeWidth="2.5" strokeLinecap="round" />
      ))}
      {voll && <line x1={x - 4} y1="30" x2={x + 28} y2="10" stroke={LINIE} strokeWidth="2.5" strokeLinecap="round" />}
    </g>
  );
  return (
    <svg width={buendel * 44 + rest * 8 + 10} height="42" role="img" aria-label={`Strichliste: ${b.n}`}>
      {Array.from({ length: buendel }, (_, i) => gruppe(6 + i * 44, true))}
      {rest > 0 && gruppe(6 + buendel * 44, false)}
    </svg>
  );
}

/* 🚸 Verkehrsschilder (vereinfacht, aber mit echten Farben und Formen). */
function Schild({ art }) {
  return (
    <svg width="74" height="74" viewBox="0 0 74 74" role="img" aria-label={`Verkehrszeichen: ${art}`}>
      {art === "vorfahrt-achten" && (<>
        <polygon points="37,68 4,10 70,10" fill="#d9534f" />
        <polygon points="37,55 15,16 59,16" fill="#fff" />
      </>)}
      {art === "stopp" && (<>
        <polygon points="23,4 51,4 70,23 70,51 51,70 23,70 4,51 4,23" fill="#c0392b" stroke="#fff" strokeWidth="3" />
        <text x="37" y="44" textAnchor="middle" fontSize="19" fontWeight="800" fill="#fff">STOP</text>
      </>)}
      {art === "vorfahrtsstrasse" && (<>
        <rect x="12" y="12" width="50" height="50" rx="6" transform="rotate(45 37 37)" fill="#fff" stroke="#b5b5b5" strokeWidth="2" />
        <rect x="22" y="22" width="30" height="30" rx="3" transform="rotate(45 37 37)" fill="#f0c437" />
      </>)}
      {art === "ampel-rot" && (<>
        <rect x="23" y="4" width="28" height="66" rx="7" fill="#333a45" />
        <circle cx="37" cy="18" r="8" fill="#e74c3c" />
        <circle cx="37" cy="37" r="8" fill="#5a5f66" />
        <circle cx="37" cy="56" r="8" fill="#5a5f66" />
      </>)}
      {art === "zebrastreifen" && (<>
        <rect x="4" y="4" width="66" height="66" rx="8" fill="#2e6bd4" />
        <polygon points="37,12 66,62 8,62" fill="#fff" />
        {[0, 1, 2].map((i) => (
          <rect key={i} x={16 + i * 16} y="48" width="10" height="12" fill="#1c3a63" transform={`skewX(-18) translate(${10 - i * 1},0)`} />
        ))}
      </>)}
    </svg>
  );
}
function Schilder({ b }) {
  return (
    <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center" }}>
      {b.schilder.map((art) => <Schild key={art} art={art} />)}
    </div>
  );
}

/* ⚡ Einfacher Stromkreis: Batterie → Kabel → Schalter → Lampe. */
function Stromkreis({ b }) {
  const an = b.an !== false;
  return (
    <svg width="190" height="110" viewBox="0 0 190 110" role="img" aria-label={`Stromkreis, Lampe ${an ? "leuchtet" : "aus"}`}>
      <rect x="14" y="14" width="162" height="82" rx="10" fill="none" stroke={LINIE} strokeWidth="2.5" />
      {/* Batterie links */}
      <rect x="4" y="38" width="20" height="34" rx="3" fill={FLAECHE} stroke={LINIE} strokeWidth="2" />
      <rect x="9" y="32" width="10" height="6" fill={LINIE} />
      <text x="14" y="60" textAnchor="middle" fontSize="11" fontWeight="800" fill={LINIE}>+</text>
      {/* Schalter unten */}
      <circle cx="78" cy="96" r="3.5" fill={LINIE} />
      <circle cx="112" cy="96" r="3.5" fill={LINIE} />
      {an
        ? <line x1="78" y1="96" x2="112" y2="96" stroke={LINIE} strokeWidth="3" />
        : <line x1="78" y1="96" x2="106" y2="78" stroke={LINIE} strokeWidth="3" />}
      {!an && <rect x="80" y="92" width="30" height="8" fill="var(--grund)" />}
      {/* Lampe rechts */}
      <circle cx="176" cy="55" r="15" fill={an ? "#ffd34d" : "var(--karte)"} stroke={LINIE} strokeWidth="2.5" />
      <line x1="166" y1="45" x2="186" y2="65" stroke={LINIE} strokeWidth="2" />
      <line x1="186" y1="45" x2="166" y2="65" stroke={LINIE} strokeWidth="2" />
      {an && [0, 45, 90, 135, 180, 225, 270, 315].map((g) => {
        const a = (g * Math.PI) / 180;
        return <line key={g} x1={176 + 19 * Math.cos(a)} y1={55 + 19 * Math.sin(a)}
          x2={176 + 25 * Math.cos(a)} y2={55 + 25 * Math.sin(a)} stroke="#e8a21a" strokeWidth="2.5" strokeLinecap="round" />;
      })}
    </svg>
  );
}

/* 🧭 Kompassrose mit den vier Himmelsrichtungen. */
function Kompassrose({ b }) {
  const pos = { N: [55, 16], O: [96, 57], S: [55, 98], W: [14, 57] };
  return (
    <svg width="110" height="112" viewBox="0 0 110 112" role="img" aria-label="Kompassrose">
      <circle cx="55" cy="57" r="32" fill="var(--karte)" stroke={LINIE} strokeWidth="2.5" />
      <polygon points="55,33 60,57 55,81 50,57" fill="#d9534f" transform="rotate(0 55 57)" />
      <polygon points="55,33 60,57 55,57 50,57" fill="#9aa7b8" transform="rotate(180 55 57)" />
      {Object.entries(pos).map(([r, [x, y]]) => (
        <text key={r} x={x} y={y + 5} textAnchor="middle" fontSize="16" fontWeight="800"
          fill={b.markiert === r ? WARN : LINIE}>{r}</text>
      ))}
    </svg>
  );
}

/* 🌅 Sonnenlauf: Osten auf → Süden mittags → Westen unter. */
function Sonne({ b }) {
  const sonnen = { osten: [30, 62, "O"], sueden: [95, 24, "S"], westen: [160, 62, "W"] };
  return (
    <svg width="190" height="92" viewBox="0 0 190 92" role="img" aria-label="Sonnenlauf von Osten nach Westen">
      <line x1="8" y1="78" x2="182" y2="78" stroke={LINIE} strokeWidth="2.5" />
      <path d="M 30 70 Q 95 2 160 70" fill="none" stroke={LEISE} strokeWidth="2" strokeDasharray="5 5" />
      {Object.entries(sonnen).map(([wo, [x, y, label]]) => {
        const aktiv = b.wo === wo;
        return (
          <g key={wo}>
            <circle cx={x} cy={y} r={aktiv ? 11 : 7} fill={aktiv ? "#ffd34d" : "var(--karte)"} stroke={aktiv ? "#e8a21a" : LEISE} strokeWidth="2" />
            <text x={x} y={y - (aktiv ? 16 : 12)} textAnchor="middle" fontSize="13" fontWeight="800"
              fill={aktiv ? WARN : LEISE}>{label}</text>
          </g>
        );
      })}
    </svg>
  );
}

/* 🗺️ Stark vereinfachte Deutschland-Silhouette mit Merk-Punkt. */
const D_UMRISS = "30,8 44,3 54,9 63,5 70,12 67,22 74,31 69,42 78,53 73,66 80,80 71,93 76,107 61,117 47,111 35,119 25,107 29,95 21,85 27,71 19,59 25,46 17,35 25,23 23,12";
const D_PUNKTE = { n: [47, 17], no: [61, 31], o: [66, 58], so: [62, 100], s: [51, 110], sw: [37, 101], w: [27, 56], mitte: [48, 62] };
function DKarte({ b }) {
  const [x, y] = D_PUNKTE[b.punkt] || D_PUNKTE.mitte;
  return (
    <svg width="120" height="128" viewBox="0 0 100 128" role="img" aria-label={`Deutschlandkarte: ${b.name || b.punkt}`}>
      <polygon points={D_UMRISS} fill={FLAECHE} stroke={LINIE} strokeWidth="2" strokeLinejoin="round" />
      <circle cx={x} cy={y} r="6" fill={WARN} stroke="var(--karte)" strokeWidth="2" />
      {b.name && (
        <text x={x} y={y - 10} textAnchor="middle" fontSize="11" fontWeight="800" fill={LINIE}
          stroke="var(--karte)" strokeWidth="3" paintOrder="stroke">{b.name}</text>
      )}
    </svg>
  );
}

/* 🎲 Würfel als Kantenmodell (leicht gedreht): 3 Flächen, 9 Kanten und
   7 Ecken sichtbar – der Rest gestrichelt bzw. als offener Punkt.
   Ohne `zeigt` bleibt der Würfel neutral (verrät keine Zahl); mit
   `zeigt` (flaechen|kanten|ecken|alles) kommt die passende Zählhilfe
   dazu – gedacht für das Merk-Bild NACH der Antwort. */
function Wuerfel({ b }) {
  const A = [20, 40], B = [80, 40], C = [80, 100], D = [20, 100];
  const E = [50, 16], F = [110, 16], G = [110, 76], H = [50, 76];
  const p = (pts) => pts.map((q) => q.join(",")).join(" ");
  const z = b.zeigt;
  const sichtbar = [[A, B], [B, C], [C, D], [D, A], [A, E], [B, F], [C, G], [E, F], [F, G]];
  const verdeckt = [[E, H], [H, G], [D, H]];
  const kante = ([x1, y1], [x2, y2], hinten, key) => (
    <line key={key} x1={x1} y1={y1} x2={x2} y2={y2}
      stroke={z === "kanten" ? (hinten ? WARN : PRIMAER) : hinten ? LEISE : LINIE}
      strokeWidth={z === "kanten" ? 3.5 : 2.5} strokeDasharray={hinten ? "5 4" : undefined} strokeLinecap="round" />
  );
  const ZAEHL = {
    flaechen: "3 sichtbare + 3 versteckte = 6 Flächen",
    kanten: "9 durchgezogene + 3 gestrichelte = 12 Kanten",
    ecken: "7 Punkte + 1 versteckte Ecke = 8 Ecken",
    alles: "6 Flächen · 12 Kanten · 8 Ecken",
  };
  return (
    <div style={{ textAlign: "center" }}>
      <svg width="126" height="106" viewBox="6 8 118 100" role="img" aria-label="Würfel-Kantenmodell">
        <polygon points={p([A, E, F, B])} fill={z === "flaechen" ? ZELLE : FLAECHE} />
        <polygon points={p([B, F, G, C])} fill={z === "flaechen" ? "color-mix(in srgb, var(--warn) 24%, var(--karte))" : FLAECHE} />
        <polygon points={p([A, B, C, D])} fill={z === "flaechen" ? FLAECHE : "var(--karte)"} />
        {verdeckt.map((k, i) => kante(k[0], k[1], true, `v${i}`))}
        {sichtbar.map((k, i) => kante(k[0], k[1], false, `s${i}`))}
        {z === "flaechen" && [[50, 75, "1"], [65, 31, "2"], [96, 62, "3"]].map(([x, y, t]) => (
          <text key={t} x={x} y={y} textAnchor="middle" fontSize="15" fontWeight="800" fill={PRIMAER}>{t}</text>
        ))}
        {(z === "ecken" || z === "alles") && (<>
          {[A, B, C, D, E, F, G].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="5" fill={PRIMAER} stroke="var(--karte)" strokeWidth="1.5" />
          ))}
          <circle cx={H[0]} cy={H[1]} r="5" fill="var(--karte)" stroke={WARN} strokeWidth="2" strokeDasharray="3 2" />
        </>)}
      </svg>
      {z && ZAEHL[z] && (
        <div style={{ fontSize: "var(--schrift-klein)", fontWeight: 800 }}>{ZAEHL[z]}</div>
      )}
    </div>
  );
}

/* 🎲 Spielwürfel mit Augen: {augen:4} eine Seite groß, {reihe:true}
   alle sechs Seiten 1–6 nebeneinander – man SIEHT, dass es mehr als
   die 6 nicht gibt, ohne dass ein Wort die Lösung verrät. */
const AUGEN = {
  1: [[1, 1]],
  2: [[2, 0], [0, 2]],
  3: [[2, 0], [1, 1], [0, 2]],
  4: [[0, 0], [2, 0], [0, 2], [2, 2]],
  5: [[0, 0], [2, 0], [1, 1], [0, 2], [2, 2]],
  6: [[0, 0], [2, 0], [0, 1], [2, 1], [0, 2], [2, 2]],
};
function WuerfelSeite({ n, gr }) {
  return (
    <svg width={gr} height={gr} viewBox={`0 0 ${gr} ${gr}`} role="img" aria-label={`Würfelseite mit ${n} Augen`}>
      <rect x="1.5" y="1.5" width={gr - 3} height={gr - 3} rx={gr / 6}
        fill="var(--karte)" stroke={LINIE} strokeWidth="2" />
      {(AUGEN[n] || AUGEN[6]).map(([sx, sy], i) => (
        <circle key={i} cx={gr / 2 + (sx - 1) * gr * 0.26} cy={gr / 2 + (sy - 1) * gr * 0.26}
          r={gr / 10} fill={LINIE} />
      ))}
    </svg>
  );
}
function Spielwuerfel({ b }) {
  if (b.reihe) {
    return (
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}
        role="img" aria-label="Alle sechs Würfelseiten: 1 bis 6">
        {[1, 2, 3, 4, 5, 6].map((n) => <WuerfelSeite key={n} n={n} gr={44} />)}
      </div>
    );
  }
  return <WuerfelSeite n={b.augen || 6} gr={84} />;
}

/* 📏 Längen-Anker: Alltagsdinge als Größen-Vergleich (Tür 2 m,
   Finger 1 cm, Bleistiftspitze 1 mm, Lineal 30 cm, Fußballplatz 100 m).
   Der orangefarbene Doppelpfeil zeigt immer, WELCHE Länge gemeint ist.
   Ohne `zahlen` steht nur der Name dabei (Schätzen ohne Spoiler),
   mit `zahlen` auch das Maß – fürs Merk-Bild nach der Antwort. */
export const LAENGEN_DINGE = {
  tuer: { name: "Tür", mass: "2 m" },
  finger: { name: "Finger", mass: "1 cm" },
  stift: { name: "Bleistiftspitze", mass: "1 mm" },
  lineal: { name: "Lineal", mass: "30 cm" },
  platz: { name: "Fußballplatz", mass: "100 m" },
};
function MessPfeil({ x1, y1, x2, y2 }) {
  const dx = Math.sign(x2 - x1) * 6, dy = Math.sign(y2 - y1) * 6;
  const spitze = (x, y, ax, ay) => `${x},${y} ${x + ax - dy * 0.6},${y + ay - dx * 0.6} ${x + ax + dy * 0.6},${y + ay + dx * 0.6}`;
  return (
    <g fill={WARN} stroke={WARN}>
      <line x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth="2" />
      <polygon points={spitze(x1, y1, dx, dy)} />
      <polygon points={spitze(x2, y2, -dx, -dy)} />
    </g>
  );
}
function LaengenDing({ was }) {
  return (
    <svg width="100" height="92" viewBox="0 0 100 92" role="img" aria-label={LAENGEN_DINGE[was].name}>
      {was === "tuer" && (<>
        <rect x="30" y="8" width="36" height="76" fill={FLAECHE} stroke={LINIE} strokeWidth="2" />
        <rect x="36" y="14" width="24" height="30" fill="none" stroke={LEISE} strokeWidth="1.5" />
        <circle cx="61" cy="52" r="2.5" fill={LINIE} />
        <circle cx="14" cy="60" r="5" fill="none" stroke={LINIE} strokeWidth="2" />
        <line x1="14" y1="65" x2="14" y2="76" stroke={LINIE} strokeWidth="2" />
        <line x1="7" y1="70" x2="21" y2="70" stroke={LINIE} strokeWidth="2" />
        <line x1="14" y1="76" x2="9" y2="84" stroke={LINIE} strokeWidth="2" />
        <line x1="14" y1="76" x2="19" y2="84" stroke={LINIE} strokeWidth="2" />
        <MessPfeil x1={78} y1={8} x2={78} y2={84} />
      </>)}
      {was === "finger" && (<>
        <rect x="30" y="52" width="40" height="32" rx="10" fill={FLAECHE} stroke={LINIE} strokeWidth="2" />
        <rect x="38" y="16" width="13" height="42" rx="6.5" fill={FLAECHE} stroke={LINIE} strokeWidth="2" />
        <MessPfeil x1={38} y1={9} x2={51} y2={9} />
      </>)}
      {was === "stift" && (<>
        <rect x="6" y="38" width="52" height="16" fill="#f0c437" stroke={LINIE} strokeWidth="2" />
        <polygon points="58,38 82,46 58,54" fill="#eac089" stroke={LINIE} strokeWidth="2" strokeLinejoin="round" />
        <polygon points="76,44 82,46 76,48" fill={LINIE} />
        <MessPfeil x1={72} y1={62} x2={86} y2={62} />
      </>)}
      {was === "lineal" && (<>
        <rect x="4" y="34" width="92" height="24" fill={FLAECHE} stroke={LINIE} strokeWidth="2" />
        {Array.from({ length: 11 }, (_, i) => (
          <line key={i} x1={8 + i * 8.4} y1="34" x2={8 + i * 8.4} y2={i % 5 === 0 ? 46 : 41} stroke={LINIE} strokeWidth="1.5" />
        ))}
        <MessPfeil x1={4} y1={70} x2={96} y2={70} />
      </>)}
      {was === "platz" && (<>
        <rect x="4" y="16" width="92" height="52" fill="color-mix(in srgb, #3f9d46 35%, var(--karte))" stroke={LINIE} strokeWidth="2" />
        <line x1="50" y1="16" x2="50" y2="68" stroke={LINIE} strokeWidth="1.5" />
        <circle cx="50" cy="42" r="9" fill="none" stroke={LINIE} strokeWidth="1.5" />
        <rect x="4" y="30" width="10" height="24" fill="none" stroke={LINIE} strokeWidth="1.5" />
        <rect x="86" y="30" width="10" height="24" fill="none" stroke={LINIE} strokeWidth="1.5" />
        <MessPfeil x1={4} y1={80} x2={96} y2={80} />
      </>)}
    </svg>
  );
}
function Laengen({ b }) {
  return (
    <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center" }}>
      {b.dinge.map((was) => (
        <div key={was} style={{ textAlign: "center" }}>
          <LaengenDing was={was} />
          <div style={{ fontSize: "var(--schrift-klein)", fontWeight: 800, color: b.zahlen ? "var(--text)" : LEISE }}>
            {LAENGEN_DINGE[was].name}{b.zahlen ? ` · ${LAENGEN_DINGE[was].mass}` : ""}
          </div>
        </div>
      ))}
    </div>
  );
}

const ARTEN = {
  strahl: Strahl, folge: Folge, mauer: Mauer, form: Form, buchstaben: Buchstaben,
  kaestchen: Kaestchen, wuerfelturm: Wuerfelturm, netz: Netz, uhr: Uhr,
  kugeln: Kugeln, rad: Rad, balken: Balken, striche: Striche, schilder: Schilder,
  stromkreis: Stromkreis, kompassrose: Kompassrose, sonne: Sonne, dkarte: DKarte,
  wuerfel: Wuerfel, spielwuerfel: Spielwuerfel, laengen: Laengen,
};
export const BILD_ARTEN = Object.keys(ARTEN);

export default function AufgabenBild({ b, merk }) {
  const Teil = b && ARTEN[b.art];
  if (!Teil) return null;
  return (
    <div data-test="aufgaben-bild" data-art={b.art} data-merk={merk ? "1" : undefined} style={{
      background: "var(--grund)", borderRadius: "var(--radius-klein)", padding: "12px 14px", margin: "10px 0",
    }}>
      {merk && (
        <p style={{ margin: "0 0 6px", textAlign: "center", fontSize: "var(--schrift-klein)", fontWeight: 800, color: LEISE }}>
          🧠 Merk-Bild – schau es dir kurz an!
        </p>
      )}
      <div style={{ display: "flex", justifyContent: "center", overflowX: "auto" }}>
        <Teil b={b} />
      </div>
    </div>
  );
}
