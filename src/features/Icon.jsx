/* ============================================================
   🪧 Eigene Zeichen statt Emojis (Designrichtung „Ruhige Bühne“).
   Strich-SVGs auf 24er-Raster, Farbe über currentColor – so folgen
   sie Text- und Knopffarbe. LeoMark: der geometrische Löwe in drei
   Stimmungen (ruhig · freut · denkt). Dekorative Zeichen tragen
   aria-hidden, benannte bekommen role="img" + aria-label.
   ============================================================ */

const PFADE = {
  home: <><path d="M3 11l9-7 9 7" /><path d="M5 10v10h14V10" /></>,
  pencil: <><path d="M4 20l4-1 11-11-3-3L5 16z" /><path d="M13 7l3 3" /></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="3" /><path d="M3 10h18M8 3v4M16 3v4" /></>,
  gamepad: <><rect x="2" y="7" width="20" height="11" rx="5" /><path d="M7 11v4M5 13h4M15 12h.01M18 14h.01" /></>,
  wrench: <><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2" /></>,
  sparkle: <><path d="M12 3l2.2 5.8L20 11l-5.8 2.2L12 19l-2.2-5.8L4 11l5.8-2.2z" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 8v4l2.5 2.5" /></>,
  check: <><circle cx="12" cy="12" r="9" /><path d="M8 12l3 3 5-6" /></>,
  checkSimple: <><path d="M4 12l5 5L20 6" /></>,
  coin: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="4.5" /></>,
  search: <><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></>,
  arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
  back: <><path d="M19 12H5M11 6l-6 6 6 6" /></>,
  lock: <><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 018 0v3" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" /></>,
  star: <><path d="M12 3l2.6 5.4 6 .8-4.3 4.2 1 5.9L12 16.5 6.7 19.3l1-5.9L3.4 9.2l6-.8z" /></>,
  compass: <><circle cx="12" cy="12" r="9" /><path d="M15 9l-2 6-4 2 2-6z" /></>,
  book: <><path d="M4 5a2 2 0 012-2h13v16H6a2 2 0 00-2 2z" /><path d="M4 19V5M8 7h7" /></>,
  numbers: <><path d="M4 9h16M4 15h16M10 3L8 21M16 3l-2 18" /></>,
  target: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.5" /></>,
  puzzle: <><path d="M9 4h6v3a2 2 0 002 2h3v6h-3a2 2 0 00-2 2v3H9v-3a2 2 0 00-2-2H4V9h3a2 2 0 002-2z" /></>,
  moon: <><path d="M20 14.5A8 8 0 019.5 4a8 8 0 1010.5 10.5z" /></>,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>,
  x: <><path d="M6 6l12 12M18 6L6 18" /></>,
  play: <><path d="M7 5l12 7-12 7z" /></>,
  flag: <><path d="M5 21V4h11l-1.5 4L16 12H5" /></>,
  heart: <><path d="M12 20s-7-4.4-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.6-7 10-7 10z" /></>,
};

export const ICON_NAMEN = Object.keys(PFADE);

/** Ein Zeichen aus dem Satz. `label` macht es benannt (role=img), sonst dekorativ. */
export function Icon({ name, size = 22, weite = 2.2, label, style }) {
  const pfad = PFADE[name] || PFADE.sparkle;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={weite} strokeLinecap="round" strokeLinejoin="round"
      role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : "true"}
      style={{ flex: "0 0 auto", ...style }}>
      {pfad}
    </svg>
  );
}

/** 🦁 Leo als geometrische Marke – immer dieselbe Form, nur Augen und Mund wechseln. */
export function LeoMark({ size = 40, stimmung = "ruhig", label = "Leo", style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" role="img" aria-label={label} style={{ flex: "0 0 auto", ...style }}>
      <circle cx="60" cy="60" r="56" fill="#E09B2D" />
      <circle cx="60" cy="63" r="38" fill="#F7D28A" />
      {stimmung === "freut" ? (
        <path d="M40 58c3-5 9-5 12 0M68 58c3-5 9-5 12 0" stroke="#1E2A3A" strokeWidth="4" fill="none" strokeLinecap="round" />
      ) : (
        <><circle cx="46" cy="58" r="5" fill="#1E2A3A" /><circle cx="74" cy="58" r="5" fill="#1E2A3A" />
          <circle cx="48" cy="56" r="1.6" fill="#FFFFFF" /><circle cx="76" cy="56" r="1.6" fill="#FFFFFF" /></>
      )}
      <path d="M60 70l-5-5h10z" fill="#1E2A3A" />
      {stimmung === "freut"
        ? <path d="M48 76c5 9 19 9 24 0" stroke="#1E2A3A" strokeWidth="4" fill="none" strokeLinecap="round" />
        : stimmung === "denkt"
          ? <><path d="M50 80h20" stroke="#1E2A3A" strokeWidth="4" strokeLinecap="round" />
            <path d="M34 42c4-8 12-10 18-6" stroke="#1E2A3A" strokeWidth="3.5" fill="none" strokeLinecap="round" /></>
          : <path d="M50 78c4 4 16 4 20 0" stroke="#1E2A3A" strokeWidth="4" fill="none" strokeLinecap="round" />}
    </svg>
  );
}
