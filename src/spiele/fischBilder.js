/* Naturgetreue Fisch-Illustrationen (aus der Alt-App übernommen):
   Körperform + Färbung der echten Arten als Inline-SVG. */
export function spielFischBild(art, w){
  w=w||130;
  if(art==="Rotfeder") return `
  <svg viewBox="0 0 200 90" style="width:${w}px;height:auto;" xmlns="http://www.w3.org/2000/svg" aria-label="Rotfeder">
    <defs><linearGradient id="rfK" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#8d9ba8"/><stop offset="0.45" stop-color="#c9d4da"/><stop offset="1" stop-color="#f2f5f6"/>
    </linearGradient></defs>
    <path d="M28 46 Q60 14 105 16 Q150 20 170 44 Q150 66 105 70 Q60 74 28 46 Z" fill="url(#rfK)" stroke="#6e7d8a" stroke-width="2"/>
    <path d="M170 44 L196 24 L190 44 L196 64 Z" fill="#d94f3d" stroke="#a83527" stroke-width="1.5"/>
    <path d="M92 17 Q104 2 122 8 L112 19 Z" fill="#d94f3d" stroke="#a83527" stroke-width="1.5"/>
    <path d="M96 68 Q104 84 120 82 L110 66 Z" fill="#d94f3d" stroke="#a83527" stroke-width="1.5"/>
    <path d="M66 62 Q70 76 84 76 L78 60 Z" fill="#e06552" stroke="#a83527" stroke-width="1.2"/>
    <path d="M60 40 Q74 46 62 56 Q54 48 60 40 Z" fill="#b8c6cf" stroke="#6e7d8a" stroke-width="1.2"/>
    <circle cx="47" cy="40" r="6" fill="#fff"/><circle cx="47" cy="40" r="3.2" fill="#1c2833"/>
    <circle cx="48.2" cy="38.8" r="1.1" fill="#fff"/>
    <path d="M30 46 Q34 50 40 51" stroke="#6e7d8a" stroke-width="1.6" fill="none"/>
  </svg>`;
  if(art==="Bachforelle") return `
  <svg viewBox="0 0 220 90" style="width:${w}px;height:auto;" xmlns="http://www.w3.org/2000/svg" aria-label="Bachforelle">
    <defs><linearGradient id="bfK" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#6b5a34"/><stop offset="0.5" stop-color="#c8a95e"/><stop offset="1" stop-color="#f4ecce"/>
    </linearGradient></defs>
    <path d="M16 46 Q50 20 110 20 Q170 22 194 44 Q170 64 110 66 Q50 68 16 46 Z" fill="url(#bfK)" stroke="#4d3f22" stroke-width="2"/>
    <path d="M194 44 L218 26 L212 44 L218 62 Z" fill="#a5854a" stroke="#4d3f22" stroke-width="1.5"/>
    <path d="M96 21 Q108 6 126 12 L116 22 Z" fill="#a5854a" stroke="#4d3f22" stroke-width="1.5"/>
    <ellipse cx="156" cy="26" rx="6" ry="4" fill="#a5854a" stroke="#4d3f22" stroke-width="1.2"/>
    <path d="M100 64 Q108 80 124 78 L114 62 Z" fill="#a5854a" stroke="#4d3f22" stroke-width="1.2"/>
    <path d="M52 42 Q66 48 54 58 Q46 50 52 42 Z" fill="#d9c084" stroke="#4d3f22" stroke-width="1.2"/>
    ${[72,96,120,144].map((x,i)=>`<circle cx="${x}" cy="${32+(i%2)*14}" r="4.6" fill="#f6efe0" opacity="0.9"/><circle cx="${x}" cy="${32+(i%2)*14}" r="2.6" fill="#d43c2a"/>`).join("")}
    <circle cx="38" cy="38" r="6" fill="#fff"/><circle cx="38" cy="38" r="3.2" fill="#1c2833"/>
    <circle cx="39.2" cy="36.8" r="1.1" fill="#fff"/>
    <path d="M16 46 Q24 52 34 53" stroke="#4d3f22" stroke-width="1.6" fill="none"/>
  </svg>`;
  if(art==="Barsch") return `
  <svg viewBox="0 0 200 100" style="width:${w}px;height:auto;" xmlns="http://www.w3.org/2000/svg" aria-label="Flussbarsch">
    <defs><linearGradient id="baK" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#3f5f3c"/><stop offset="0.5" stop-color="#9dbd7e"/><stop offset="1" stop-color="#f0f3da"/>
    </linearGradient></defs>
    <path d="M24 54 Q52 22 100 22 Q146 26 168 52 Q146 76 100 78 Q52 80 24 54 Z" fill="url(#baK)" stroke="#2e4a2c" stroke-width="2"/>
    ${[64,84,104,124,142].map(x=>`<path d="M${x} 28 Q${x+3} 50 ${x} 70" stroke="#2e4a2c" stroke-width="6" fill="none" opacity="0.4"/>`).join("")}
    <path d="M168 52 L192 34 L186 52 L192 70 Z" fill="#e0743f" stroke="#a34a20" stroke-width="1.5"/>
    <path d="M70 24 L76 4 L84 22 L92 5 L100 22 L108 6 L114 23 Z" fill="#7a9a62" stroke="#2e4a2c" stroke-width="1.5"/>
    <path d="M90 76 Q98 92 114 90 L104 74 Z" fill="#e0743f" stroke="#a34a20" stroke-width="1.5"/>
    <path d="M58 50 Q72 56 60 66 Q52 58 58 50 Z" fill="#e0743f" stroke="#a34a20" stroke-width="1.2"/>
    <circle cx="44" cy="46" r="6" fill="#fff"/><circle cx="44" cy="46" r="3.2" fill="#1c2833"/>
    <circle cx="45.2" cy="44.8" r="1.1" fill="#fff"/>
    <path d="M26 54 Q32 59 40 60" stroke="#2e4a2c" stroke-width="1.6" fill="none"/>
  </svg>`;
  if(art==="Schleie") return `
  <svg viewBox="0 0 210 95" style="width:${w}px;height:auto;" xmlns="http://www.w3.org/2000/svg" aria-label="Schleie">
    <defs><linearGradient id="slK" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#3d4a2a"/><stop offset="0.5" stop-color="#7d8a4e"/><stop offset="1" stop-color="#d9d9a8"/>
    </linearGradient></defs>
    <path d="M20 50 Q52 20 105 20 Q158 24 182 48 Q158 72 105 74 Q52 76 20 50 Z" fill="url(#slK)" stroke="#2c3620" stroke-width="2"/>
    <path d="M182 48 Q200 36 198 48 Q200 62 182 50 Z" fill="#6b7842" stroke="#2c3620" stroke-width="1.5"/>
    <path d="M98 21 Q110 8 128 13 Q122 22 112 23 Z" fill="#6b7842" stroke="#2c3620" stroke-width="1.5"/>
    <path d="M100 72 Q108 86 124 84 L114 70 Z" fill="#6b7842" stroke="#2c3620" stroke-width="1.5"/>
    <path d="M56 48 Q72 54 58 64 Q48 56 56 48 Z" fill="#8f9c5e" stroke="#2c3620" stroke-width="1.2"/>
    <path d="M40 26 Q100 14 168 34" stroke="#e8e8c0" stroke-width="2" fill="none" opacity="0.5"/>
    <circle cx="42" cy="42" r="5.5" fill="#f2b23e"/><circle cx="42" cy="42" r="2.9" fill="#1c2833"/>
    <circle cx="43.1" cy="40.9" r="1" fill="#fff"/>
    <path d="M20 50 Q27 55 36 56" stroke="#2c3620" stroke-width="1.6" fill="none"/>
  </svg>`;
  if(art==="Karpfen") return `
  <svg viewBox="0 0 210 110" style="width:${w}px;height:auto;" xmlns="http://www.w3.org/2000/svg" aria-label="Karpfen">
    <defs><linearGradient id="kaK" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#6d5426"/><stop offset="0.5" stop-color="#c99e4e"/><stop offset="1" stop-color="#f2e4bd"/>
    </linearGradient></defs>
    <path d="M22 58 Q48 20 102 18 Q152 20 174 56 Q152 92 102 94 Q48 92 22 58 Z" fill="url(#kaK)" stroke="#4a3a18" stroke-width="2"/>
    ${[62,84,106,128].map((x,i)=>[36,56,76].map(y=>`<path d="M${x+(i%2)*11} ${y} q7 6 0 12" stroke="#8a6d33" stroke-width="1.6" fill="none" opacity="0.7"/>`).join("")).join("")}
    <path d="M174 56 L198 36 L192 56 L198 76 Z" fill="#a5854a" stroke="#4a3a18" stroke-width="1.5"/>
    <path d="M84 20 L92 2 L104 16 L116 4 L124 20 Z" fill="#a5854a" stroke="#4a3a18" stroke-width="1.5"/>
    <path d="M96 92 Q104 106 120 104 L110 90 Z" fill="#a5854a" stroke="#4a3a18" stroke-width="1.5"/>
    <path d="M54 56 Q70 62 56 74 Q46 64 54 56 Z" fill="#d9bc72" stroke="#4a3a18" stroke-width="1.2"/>
    <path d="M28 64 q-5 8 -1 12 M36 68 q-4 7 -1 11" stroke="#4a3a18" stroke-width="1.6" fill="none"/>
    <circle cx="44" cy="46" r="6" fill="#fff"/><circle cx="44" cy="46" r="3.2" fill="#1c2833"/>
    <circle cx="45.2" cy="44.8" r="1.1" fill="#fff"/>
    <path d="M22 58 Q28 63 36 64" stroke="#4a3a18" stroke-width="1.8" fill="none"/>
  </svg>`;
  if(art==="Aal") return `
  <svg viewBox="0 0 260 80" style="width:${Math.round(w*1.2)}px;height:auto;" xmlns="http://www.w3.org/2000/svg" aria-label="Aal">
    <defs><linearGradient id="aaK" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#44503a"/><stop offset="0.55" stop-color="#8a9668"/><stop offset="1" stop-color="#e9e6b8"/>
    </linearGradient></defs>
    <path d="M10 40 Q30 26 58 32 Q92 40 122 30 Q156 20 188 32 Q222 44 248 34 Q252 40 248 46 Q222 58 188 46 Q156 36 122 46 Q92 56 58 46 Q30 52 10 40 Z" fill="url(#aaK)" stroke="#303a28" stroke-width="2"/>
    <path d="M58 30 Q92 38 122 28 Q156 18 188 30 Q220 42 246 33" stroke="#303a28" stroke-width="3" fill="none" opacity="0.35"/>
    <path d="M246 34 Q258 40 246 46 Z" fill="#6b7850" stroke="#303a28" stroke-width="1.5"/>
    <path d="M44 34 Q56 40 46 48 Q38 42 44 34 Z" fill="#a8b184" stroke="#303a28" stroke-width="1.2"/>
    <circle cx="24" cy="38" r="4.6" fill="#fff"/><circle cx="24" cy="38" r="2.6" fill="#1c2833"/>
    <circle cx="25" cy="37" r="0.9" fill="#fff"/>
    <path d="M10 40 Q15 44 22 45" stroke="#303a28" stroke-width="1.5" fill="none"/>
  </svg>`;
  if(art==="Zander") return `
  <svg viewBox="0 0 230 90" style="width:${w}px;height:auto;" xmlns="http://www.w3.org/2000/svg" aria-label="Zander">
    <defs><linearGradient id="zaK" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#7a8060"/><stop offset="0.5" stop-color="#c8c39a"/><stop offset="1" stop-color="#efe9cf"/>
    </linearGradient></defs>
    <path d="M18 46 Q55 20 115 20 Q175 22 200 44 Q175 64 115 66 Q55 68 18 46 Z" fill="url(#zaK)" stroke="#5d6247" stroke-width="2"/>
    ${[70,92,114,136,158].map(x=>`<path d="M${x} 24 Q${x+4} 42 ${x} 60" stroke="#6b6f52" stroke-width="5" fill="none" opacity="0.35"/>`).join("")}
    <path d="M200 44 L226 26 L220 44 L226 62 Z" fill="#8a8f6c" stroke="#5d6247" stroke-width="1.5"/>
    <path d="M78 22 L84 4 L92 20 L100 5 L108 20 L116 6 L122 21 Z" fill="#9aa07c" stroke="#5d6247" stroke-width="1.5"/>
    <path d="M132 21 Q146 8 162 14 L152 23 Z" fill="#9aa07c" stroke="#5d6247" stroke-width="1.5"/>
    <path d="M104 64 Q112 80 128 78 L118 62 Z" fill="#9aa07c" stroke="#5d6247" stroke-width="1.5"/>
    <path d="M52 42 Q66 48 54 58 Q46 50 52 42 Z" fill="#b6b28a" stroke="#5d6247" stroke-width="1.2"/>
    <circle cx="38" cy="38" r="6.5" fill="#e8f0f2"/><circle cx="38" cy="38" r="3.4" fill="#1c2833"/>
    <circle cx="39.4" cy="36.6" r="1.1" fill="#fff"/>
    <path d="M18 46 Q26 52 36 53" stroke="#5d6247" stroke-width="1.6" fill="none"/>
  </svg>`;
  return `
  <svg viewBox="0 0 260 80" style="width:${Math.round(w*1.25)}px;height:auto;" xmlns="http://www.w3.org/2000/svg" aria-label="Hecht">
    <defs><linearGradient id="heK" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#3f5a33"/><stop offset="0.5" stop-color="#7d9b58"/><stop offset="1" stop-color="#e6ecc8"/>
    </linearGradient></defs>
    <path d="M6 42 Q20 30 44 30 L60 26 Q140 18 200 26 Q228 30 234 40 Q228 52 200 56 Q140 64 60 56 L44 52 Q20 52 6 42 Z" fill="url(#heK)" stroke="#2f4426" stroke-width="2"/>
    ${[70,90,110,130,150,170].map((x,i)=>`<ellipse cx="${x}" cy="${34+(i%2)*12}" rx="5" ry="2.6" fill="#dfe8b8" opacity="0.85"/>`).join("")}
    <path d="M234 40 L258 22 L252 40 L258 58 Z" fill="#5c7a42" stroke="#2f4426" stroke-width="1.5"/>
    <path d="M196 26 Q206 12 222 16 L214 27 Z" fill="#5c7a42" stroke="#2f4426" stroke-width="1.5"/>
    <path d="M196 55 Q206 70 222 66 L214 54 Z" fill="#5c7a42" stroke="#2f4426" stroke-width="1.5"/>
    <path d="M96 56 Q104 70 118 68 L110 54 Z" fill="#6b8a4e" stroke="#2f4426" stroke-width="1.2"/>
    <path d="M6 42 L30 38 M6 42 L30 46" stroke="#2f4426" stroke-width="2" fill="none"/>
    <circle cx="42" cy="34" r="5.5" fill="#f3e9c8"/><circle cx="42" cy="34" r="3" fill="#1c2833"/>
    <circle cx="43.2" cy="32.8" r="1" fill="#fff"/>
  </svg>`;
}
