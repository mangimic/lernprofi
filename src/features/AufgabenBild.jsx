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

const ARTEN = {
  strahl: Strahl, folge: Folge, mauer: Mauer, form: Form, buchstaben: Buchstaben,
  kaestchen: Kaestchen, wuerfelturm: Wuerfelturm, netz: Netz, uhr: Uhr,
  kugeln: Kugeln, rad: Rad, balken: Balken, striche: Striche, schilder: Schilder,
};
export const BILD_ARTEN = Object.keys(ARTEN);

export default function AufgabenBild({ b }) {
  const Teil = b && ARTEN[b.art];
  if (!Teil) return null;
  return (
    <div data-test="aufgaben-bild" data-art={b.art} style={{
      display: "flex", justifyContent: "center", overflowX: "auto",
      background: "var(--grund)", borderRadius: "var(--radius-klein)", padding: "12px 14px", margin: "10px 0",
    }}>
      <Teil b={b} />
    </div>
  );
}
