// ─────────────────────────────────────────────────────────
// GENESIS CHAMBER V4 — ICON SYSTEM
// 24×24, 1.5px stroke, currentColor, inline SVG
// No icon libraries — pure inline SVG
// ─────────────────────────────────────────────────────────

const s24 = { display: 'inline-block', verticalAlign: '-0.125em' };

const icon = (paths, filled) => (
  <svg
    width="1em" height="1em" viewBox="0 0 24 24"
    fill={filled ? 'currentColor' : 'none'}
    stroke={filled ? 'none' : 'currentColor'}
    strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
    style={s24}
  >
    {paths}
  </svg>
);

export const IC = {
  // ── Shell & Navigation ──
  council: icon(
    <><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></>
  ),
  genesis: icon(
    <><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></>
  ),
  plus: icon(
    <><path d="M12 5v14"/><path d="M5 12h14"/></>
  ),
  chat: icon(
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
  ),
  settings: icon(
    <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></>
  ),
  sun: icon(
    <><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></>
  ),
  moon: icon(
    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
  ),
  panelLeft: icon(
    <><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/></>
  ),
  panelRight: icon(
    <><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M15 3v18"/></>
  ),
  search: icon(
    <><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></>
  ),
  menu: icon(
    <><path d="M3 12h18"/><path d="M3 6h18"/><path d="M3 18h18"/></>
  ),
  x: icon(
    <><path d="M18 6L6 18"/><path d="M6 6l12 12"/></>
  ),
  chevDown: icon(
    <path d="M6 9l6 6 6-6"/>
  ),
  clock: icon(
    <><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></>
  ),
  trash: icon(
    <><path d="M3 6h18"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6"/><path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"/></>
  ),

  // ── Council Presets ──
  compare: icon(
    <><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></>
  ),
  analyze: icon(
    <><path d="M21 21H3V3"/><path d="M21 7l-6 6-4-4-6 6"/></>
  ),
  brainstorm: icon(
    <><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></>
  ),
  evaluate: icon(
    <><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4z"/></>
  ),
  debate: icon(
    <><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/><path d="M8 9h8"/><path d="M8 13h4"/></>
  ),
  send: icon(
    <><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4z"/></>
  ),

  // ── Visibility ──
  eye: icon(
    <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
  ),
  eyeOff: icon(
    <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19M1 1l22 22"/><path d="M14.12 14.12a3 3 0 11-4.24-4.24"/></>
  ),

  // ── Awards & Scores ──
  trophy: icon(
    <><path d="M6 9H4a2 2 0 01-2-2V4h4M18 9h2a2 2 0 002-2V4h-4"/><path d="M6 2h12v7a6 6 0 01-12 0V2z"/><path d="M12 15v4M8 22h8M10 19h4"/></>
  ),
  star: icon(
    <path d="M12 3l3 6 6.6 1-4.8 4.7 1.1 6.3L12 17.5 6.1 21l1.1-6.3L2.4 10 9 9z"/>,
    true
  ),
  crown: icon(
    <><path d="M2 17l3-9 5 4 2-8 2 8 5-4 3 9"/><path d="M2 17h20v2a1 1 0 01-1 1H3a1 1 0 01-1-1v-2z"/></>
  ),

  // ── Landing & Info Architecture ──
  brain: icon(
    <><path d="M10 2C6 2 3 5.5 3 9c0 2.5 1.5 4.5 3.5 5.5L7 18h6l.5-3.5C15.5 13.5 17 11.5 17 9c0-3.5-3-7-7-7z"/><path d="M7.5 9h5M10 6.5v5"/></>
  ),
  bolt: icon(
    <path d="M11 2L5 11h5l-1 7 6-9h-5l1-7z"/>,
    true
  ),
  swords: icon(
    <><path d="M3 17L10 10M17 17L10 10"/><path d="M3 3l4 4M17 3l-4 4"/><circle cx="10" cy="10" r="2"/></>
  ),
  gallery: icon(
    <><rect x="2" y="3" width="16" height="14" rx="1.5"/><circle cx="7" cy="8" r="1.5"/><path d="M2 14l4-4 3 3 4-5 5 6"/></>
  ),
  rocket: icon(
    <><path d="M10 18c0-3 1-6 3-8s4-5 4-8c0 0-3 1.5-5.5 4S8 11 8 11"/><circle cx="12" cy="7" r="1.5"/><path d="M5 15l-1 3 3-1"/></>
  ),
  home: icon(
    <><path d="M3 10.5L10 4l7 6.5"/><path d="M5 9v7a1 1 0 001 1h3v-4h2v4h3a1 1 0 001-1V9"/></>
  ),
  chart: icon(
    <><path d="M3 17h14"/><rect x="5" y="9" width="2" height="8" rx=".5" fill="currentColor"/><rect x="9" y="5" width="2" height="12" rx=".5" fill="currentColor"/><rect x="13" y="2" width="2" height="15" rx=".5" fill="currentColor"/></>
  ),
  sliders: icon(
    <><rect x="3" y="3" width="14" height="14" rx="2"/><circle cx="7" cy="10" r="2"/><circle cx="13" cy="8" r="2"/><path d="M7 3v5M7 12v5M13 3v3M13 10v7"/></>
  ),
  exportArrow: icon(
    <><path d="M4 13v3a1 1 0 001 1h10a1 1 0 001-1v-3"/><path d="M10 3v10"/><path d="M6 7l4-4 4 4"/></>
  ),

  // ── Actions ──
  copy: icon(
    <><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></>
  ),
  check: icon(
    <path d="M5 12l5 5L20 7"/>
  ),
  refresh: icon(
    <><path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></>
  ),
  alert: icon(
    <><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><path d="M12 9v4"/><path d="M12 17h.01"/></>
  ),

  // ── DA Arena ──
  shield: icon(
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  ),
  flame: icon(
    <path d="M12 22c-4-2-8-6-8-11 0-3 2-5 4-6 1 2 3 3 4 3 1-3 2-6 4-8 2 3 4 7 4 11 0 5-4 9-8 11z"/>,
    true
  ),
  spark: icon(
    <><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></>
  ),
};
