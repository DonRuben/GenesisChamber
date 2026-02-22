import { useState } from "react";

// ═══════════════════════════════════════════════════════════════════
// GENESIS CHAMBER V4 — MOBILE / RESPONSIVE SYSTEM
// Breakpoints, touch targets, swipe gestures, responsive layouts
// Priority 12
// ═══════════════════════════════════════════════════════════════════


// ── GC V4 Icon System ─ Inline SVG, stroke-based, theme-adaptive ──
const IC = {
  brain: <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", verticalAlign: "-0.125em" }}><path d="M10 2C6 2 3 5.5 3 9c0 2.5 1.5 4.5 3.5 5.5L7 18h6l.5-3.5C15.5 13.5 17 11.5 17 9c0-3.5-3-7-7-7z"/><path d="M7.5 9h5M10 6.5v5"/></svg>,
  bolt: <svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor" stroke="none" style={{ display: "inline-block", verticalAlign: "-0.125em" }}><path d="M11 2L5 11h5l-1 7 6-9h-5l1-7z"/></svg>,
  crown: <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", verticalAlign: "-0.125em" }}><path d="M3 15h14l-2-8-3 4-2-6-2 6-3-4z"/><path d="M3 15v2h14v-2"/></svg>,
  swords: <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", verticalAlign: "-0.125em" }}><path d="M3 17L10 10M17 17L10 10"/><path d="M3 3l4 4M17 3l-4 4"/><circle cx="10" cy="10" r="2"/></svg>,
  gallery: <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", verticalAlign: "-0.125em" }}><rect x="2" y="3" width="16" height="14" rx="1.5"/><circle cx="7" cy="8" r="1.5"/><path d="M2 14l4-4 3 3 4-5 5 6"/></svg>,
  exportArrow: <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", verticalAlign: "-0.125em" }}><path d="M4 13v3a1 1 0 001 1h10a1 1 0 001-1v-3"/><path d="M10 3v10"/><path d="M6 7l4-4 4 4"/></svg>,
  home: <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", verticalAlign: "-0.125em" }}><path d="M3 10.5L10 4l7 6.5"/><path d="M5 9v7a1 1 0 001 1h3v-4h2v4h3a1 1 0 001-1V9"/></svg>,
  search: <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", verticalAlign: "-0.125em" }}><circle cx="8.5" cy="8.5" r="5"/><path d="M13 13l4 4"/></svg>,
  shield: <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", verticalAlign: "-0.125em" }}><path d="M10 2L3 5v5c0 4.5 3 8.5 7 10 4-1.5 7-5.5 7-10V5l-7-3z"/></svg>,
  flame: <svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor" stroke="none" style={{ display: "inline-block", verticalAlign: "-0.125em" }}><path d="M10 2c0 3-4 5-4 9a5 5 0 0010 0c0-2.5-1-4-2-5 0 2-1 3-2 3s-2-2-2-5z"/></svg>,
  dove: <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", verticalAlign: "-0.125em" }}><path d="M5 16c2-4 5-4 7-2"/><path d="M8 10c-3-1-5 1-5 4"/><path d="M8 10c0-3 2-5 5-5s4 2 4 5c0 2-2 3-4 2"/></svg>,
  star: <svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor" stroke="none" style={{ display: "inline-block", verticalAlign: "-0.125em" }}><path d="M10 2l2.5 5 5.5.8-4 3.9.9 5.3L10 14.5 5.1 17l.9-5.3-4-3.9L7.5 7z"/></svg>,
  spark: <svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor" stroke="none" style={{ display: "inline-block", verticalAlign: "-0.125em" }}><path d="M10 2l1.5 5.5L17 10l-5.5 2.5L10 18l-1.5-5.5L3 10l5.5-2.5z"/></svg>,
  check: <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", verticalAlign: "-0.125em" }}><path d="M4 10l4 4 8-8"/></svg>,
  xClose: <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", verticalAlign: "-0.125em" }}><path d="M5 5l10 10M15 5L5 15"/></svg>,
  skull: <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", verticalAlign: "-0.125em" }}><circle cx="10" cy="8" r="5"/><circle cx="8" cy="7.5" r="1.5" fill="currentColor"/><circle cx="12" cy="7.5" r="1.5" fill="currentColor"/><path d="M8 11h4M9 18V13M11 18V13M7 16h6"/></svg>,
  advocate: <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", verticalAlign: "-0.125em" }}><path d="M4 8c0-4 3-6 6-6s6 2 6 6"/><path d="M3 6l3 2M17 6l-3 2"/><circle cx="7.5" cy="10" r="1" fill="currentColor"/><circle cx="12.5" cy="10" r="1" fill="currentColor"/><path d="M7 14c1.5 1.5 4.5 1.5 6 0"/></svg>,
  globe: <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", verticalAlign: "-0.125em" }}><circle cx="10" cy="10" r="8"/><path d="M2 10h16"/><path d="M10 2c2.5 2.5 4 5 4 8s-1.5 5.5-4 8"/><path d="M10 2c-2.5 2.5-4 5-4 8s1.5 5.5 4 8"/></svg>,
  clipboard: <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", verticalAlign: "-0.125em" }}><path d="M7 3h6"/><rect x="4" y="2" width="12" height="16" rx="1.5"/><path d="M7 7h6M7 10h6M7 13h4"/></svg>,
  chat: <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", verticalAlign: "-0.125em" }}><path d="M4 4h12a1 1 0 011 1v7a1 1 0 01-1 1H8l-4 3v-3a1 1 0 01-1-1V5a1 1 0 011-1z"/></svg>,
  scale: <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", verticalAlign: "-0.125em" }}><path d="M10 2v14"/><path d="M3 6l7-2 7 2"/><path d="M3 6c-1 3 0 5 2 5h2c2 0 3-2 2-5"/><path d="M17 6c1 3 0 5-2 5h-2c-2 0-3-2-2-5"/><path d="M7 16h6"/></svg>,
  rocket: <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", verticalAlign: "-0.125em" }}><path d="M10 18c0-3 1-6 3-8s4-5 4-8c0 0-3 1.5-5.5 4S8 11 8 11"/><circle cx="12" cy="7" r="1.5"/><path d="M5 15l-1 3 3-1"/></svg>,
  megaphone: <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", verticalAlign: "-0.125em" }}><path d="M16 3v14l-5-3H5a1 1 0 01-1-1V7a1 1 0 011-1h6l5-3z"/></svg>,
  palette: <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ display: "inline-block", verticalAlign: "-0.125em" }}><circle cx="10" cy="10" r="8"/><circle cx="7" cy="7" r="1.2" fill="currentColor"/><circle cx="13" cy="7" r="1.2" fill="currentColor"/><circle cx="6" cy="11" r="1.2" fill="currentColor"/><circle cx="12" cy="13" r="1.2" fill="currentColor"/></svg>,
  chart: <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", verticalAlign: "-0.125em" }}><path d="M3 17h14"/><rect x="5" y="9" width="2" height="8" rx=".5" fill="currentColor"/><rect x="9" y="5" width="2" height="12" rx=".5" fill="currentColor"/><rect x="13" y="2" width="2" height="15" rx=".5" fill="currentColor"/></svg>,
  temple: <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", verticalAlign: "-0.125em" }}><path d="M3 17h14"/><path d="M3 7l7-5 7 5"/><path d="M5 7v10M8.3 7v10M11.7 7v10M15 7v10"/><path d="M3 7h14"/></svg>,
  factory: <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", verticalAlign: "-0.125em" }}><path d="M3 17V9l4-4v4l4-4v4l4-4v12H3z"/><rect x="5" y="12" width="2" height="3" fill="currentColor"/><rect x="9" y="12" width="2" height="3" fill="currentColor"/></svg>,
  sun: <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", verticalAlign: "-0.125em" }}><circle cx="10" cy="10" r="4"/><path d="M10 2v2M10 16v2M18 10h-2M4 10H2M15.5 4.5l-1.4 1.4M5.9 14.1l-1.4 1.4M15.5 15.5l-1.4-1.4M5.9 5.9L4.5 4.5"/></svg>,
  moon: <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", verticalAlign: "-0.125em" }}><path d="M15 10A7 7 0 118 3a5 5 0 007 7z"/></svg>,
  warn: <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", verticalAlign: "-0.125em" }}><path d="M10 2L1 18h18L10 2z"/><path d="M10 8v4"/><circle cx="10" cy="15" r="1" fill="currentColor"/></svg>,
  download: <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", verticalAlign: "-0.125em" }}><path d="M4 13v3a1 1 0 001 1h10a1 1 0 001-1v-3"/><path d="M10 3v10"/><path d="M6 10l4 4 4-4"/></svg>,
  sliders: <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", verticalAlign: "-0.125em" }}><rect x="3" y="3" width="14" height="14" rx="2"/><circle cx="7" cy="10" r="2"/><circle cx="13" cy="8" r="2"/><path d="M7 3v5M7 12v5M13 3v3M13 10v7"/></svg>,
};

const T = {
  bg:             "#111113",
  surface:        "#18181B",
  surfaceRaised:  "#1F1F23",
  surfaceHover:   "#26262B",
  flame:          "#F27123",
  cyan:           "#00D9FF",
  gold:           "#D4A853",
  magenta:        "#E5375E",
  green:          "#34D399",
  purple:         "#8B5CF6",
  amber:          "#F59E0B",
  red:            "#EF4444",
  blue:           "#3B82F6",
  text:           "#E8E6E3",
  textSoft:       "#A1A1AA",
  textMuted:      "#63636E",
  border:         "rgba(255,255,255,0.06)",
  borderHover:    "rgba(255,255,255,0.12)",
  borderStrong:   "rgba(255,255,255,0.18)",
  success:        "#34D399",
  warning:        "#F59E0B",
  error:          "#EF4444",
  daRed:          "#E5375E",
  daCyan:         "#00D9FF",
  stageCreate:    "#34D399",
  stageCritique:  "#F59E0B",
  stageSynthesize:"#EF4444",
  teamDesign:     "#00D9FF",
  teamMarketing:  "#F27123",
  teamBusiness:   "#D4A853",
};

// ─────────────────────────────────────────────────────────────
// BREAKPOINT SYSTEM
// ─────────────────────────────────────────────────────────────
// | Token    | Width       | Columns | Sidebar     | Padding |
// |----------|-------------|---------|-------------|---------|
// | mobile   | < 640px     | 1       | Hidden      | 8px     |
// | tablet   | 640–1023px  | 2       | 56px rail   | 13px    |
// | desktop  | 1024–1439px | 2-3     | 260px open  | 21px    |
// | wide     | ≥ 1440px    | 3       | 260px open  | 21px, max-w 1200 |
//
// CSS Custom Properties for JS access:
// --bp-mobile: 640px; --bp-tablet: 1024px; --bp-wide: 1440px;

// ─────────────────────────────────────────────────────────────
// TOUCH TARGET RULES (applies below 1024px)
// ─────────────────────────────────────────────────────────────
// - All interactive: min 44×44px touch area
// - Spacing between targets: ≥ 8px
// - Buttons: min-height 44px, padding ≥ 10px 16px
// - Tab items: height 44px
// - List items: min-height 48px
// - Close/dismiss: 44×44px hit area (icon can be 20px)
// - Swipe zones: full container width

// ─────────────────────────────────────────────────────────────
// PER-SCREEN RESPONSIVE SPECS
// ─────────────────────────────────────────────────────────────

const SCREEN_SPECS = [
  {
    screen: "Sidebar",
    file: "Sidebar.jsx / Sidebar.css",
    rules: [
      { bp: "< 640px", change: "Hidden. Hamburger (top-left 44×44) → full-screen overlay, close via × or swipe-left. z-index: 200." },
      { bp: "640–1023px", change: "Collapsed 56px icon rail. Hover/tap expands overlay to 260px. Tap-outside collapses." },
      { bp: "≥ 1024px", change: "Fixed 260px expanded. Collapse toggle in footer." },
    ],
    css: `.sidebar { display: none; }
@media (min-width: 640px) { .sidebar { display: flex; width: 56px; } }
@media (min-width: 1024px) { .sidebar { width: 260px; } }
.sidebar-overlay { position: fixed; inset: 0; z-index: 200; background: rgba(0,0,0,0.5); }`,
  },
  {
    screen: "Landing / Mode Selection",
    file: "LandingScreen.jsx (NEW)",
    rules: [
      { bp: "< 640px", change: "Mode cards stack vertically (1 column). Hero title → 32px. Reduce padding to 21px. Recent sims → single column." },
      { bp: "640–1023px", change: "Mode cards side-by-side (2 columns), max-width 600px. Recent sims → 2 columns." },
      { bp: "≥ 1024px", change: "Full spec: 2-col cards at 800px max, 3-col recent sims." },
    ],
    css: `.mode-grid { grid-template-columns: 1fr; gap: 13px; }
@media (min-width: 640px) { .mode-grid { grid-template-columns: 1fr 1fr; } }
.hero-title { font-size: 32px; }
@media (min-width: 1024px) { .hero-title { font-size: 48px; } }`,
  },
  {
    screen: "Launcher Wizard",
    file: "SimulationLauncher.jsx / .css",
    rules: [
      { bp: "< 640px", change: "Full-screen modal (no overlay margin). Steps become vertical accordion. Model cards → 1 column. Step dots → horizontal scroll. Launch button sticky at bottom." },
      { bp: "640–1023px", change: "Centered modal 560px width. Model cards → 2 columns. Step dots visible." },
      { bp: "≥ 1024px", change: "Full spec: centered modal, 2-col model grid, horizontal step indicator." },
    ],
    css: `.launcher-modal { width: 100vw; height: 100vh; border-radius: 0; }
@media (min-width: 640px) { .launcher-modal { width: 560px; height: auto; border-radius: 16px; } }
.model-grid { grid-template-columns: 1fr; }
@media (min-width: 640px) { .model-grid { grid-template-columns: 1fr 1fr; } }
.launch-btn-mobile { position: sticky; bottom: 0; padding: 13px; background: var(--surface-1); }`,
  },
  {
    screen: "Dashboard Tab Bar",
    file: "SimulationDashboard.jsx / .css",
    rules: [
      { bp: "< 640px", change: "Horizontal scroll strip. No dropdowns—flat tab list. Active tab: 2px bottom cyan bar. 44px height per tab. Swipe to scroll." },
      { bp: "640–1023px", change: "Grouped tabs with dropdowns. Smaller text (12px). Status badge hidden." },
      { bp: "≥ 1024px", change: "Full grouped tab bar with status badge." },
    ],
    css: `.tab-bar { overflow-x: auto; scrollbar-width: none; }
.tab-bar::-webkit-scrollbar { display: none; }
.tab-item { min-height: 44px; flex-shrink: 0; white-space: nowrap; }
@media (min-width: 640px) { .tab-bar { overflow: visible; } }`,
  },
  {
    screen: "LLM Council Stages 1-3",
    file: "Stage1.jsx, Stage2.jsx, Stage3.jsx",
    rules: [
      { bp: "< 640px", change: "Response cards → full width, no side padding. Model avatars → 28px. Font: 14px body. Collapse all responses by default, tap to expand one at a time. Stage dots → compact row." },
      { bp: "640–1023px", change: "Standard card layout. 2-column comparison available via horizontal scroll." },
      { bp: "≥ 1024px", change: "Full spec per Stage wireframes." },
    ],
    css: `.response-card { margin: 0 -8px; border-radius: 0; border-left: none; border-right: none; }
@media (min-width: 640px) { .response-card { margin: 0; border-radius: 12px; border: 1px solid var(--border-default); } }
.model-avatar { width: 28px; height: 28px; }
@media (min-width: 1024px) { .model-avatar { width: 36px; height: 36px; } }`,
  },
  {
    screen: "Concept Cards",
    file: "ConceptCard.jsx / .css",
    rules: [
      { bp: "< 640px", change: "Single column grid. Winner card full width (no span change needed). Eliminated section collapsed by default. Score bar full width. Tap to expand—only 1 expanded at a time." },
      { bp: "640–1023px", change: "2-column grid. Winner spans both. Touch-friendly expand targets." },
      { bp: "≥ 1024px", change: "Full spec: 2-col, hover effects, winner hero." },
    ],
    css: `.concept-grid { grid-template-columns: 1fr; gap: 8px; }
@media (min-width: 640px) { .concept-grid { grid-template-columns: 1fr 1fr; gap: 13px; } }
.concept-card { min-height: 48px; }`,
  },
  {
    screen: "Gallery + Lightbox",
    file: "GeneratedGallery.jsx / .css",
    rules: [
      { bp: "< 640px", change: "Masonry → 2 columns, 8px gap. Lightbox → full screen, no sidebar. Swipe left/right to navigate images. Close via × (top-right 44px) or swipe-down." },
      { bp: "640–1023px", change: "Masonry 3 columns. Lightbox → 90vw, sidebar collapsed to bottom drawer." },
      { bp: "≥ 1024px", change: "Full spec: masonry auto-fit, lightbox 70vw+280px sidebar." },
    ],
    css: `.gallery-grid { columns: 2; column-gap: 8px; }
@media (min-width: 640px) { .gallery-grid { columns: 3; } }
@media (min-width: 1024px) { .gallery-grid { columns: auto; column-width: 200px; } }
.lightbox-mobile { width: 100vw; height: 100vh; border-radius: 0; }
.lightbox-sidebar-mobile { position: fixed; bottom: 0; height: 40vh; border-radius: 16px 16px 0 0; }`,
  },
  {
    screen: "DA Arena",
    file: "DAArena.jsx / .css",
    rules: [
      { bp: "< 640px", change: "Flashcards → full width, swipe to flip (tap also works). Rating buttons → 2×2 grid (44px min height each). Score ring centered above card. Training report → accordion sections." },
      { bp: "640–1023px", change: "Flashcard centered 480px. Rating buttons horizontal row. Report in tabs." },
      { bp: "≥ 1024px", change: "Full spec per DA Arena wireframe." },
    ],
    css: `.flashcard { width: 100%; max-width: 100%; }
@media (min-width: 640px) { .flashcard { max-width: 480px; margin: 0 auto; } }
.rating-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
@media (min-width: 640px) { .rating-grid { grid-template-columns: repeat(4, 1fr); } }
.rating-btn { min-height: 44px; }`,
  },
  {
    screen: "Simulation Overview",
    file: "SimulationOverview.jsx / .css",
    rules: [
      { bp: "< 640px", change: "Winner spotlight: title → 24px, score ring → 48px. Metrics row → 2×2 grid. Participant list → compact (hide model version). Media preview → 2 columns. Quick actions → 2×2." },
      { bp: "640–1023px", change: "Metrics → 4 columns. Media preview → 3 columns." },
      { bp: "≥ 1024px", change: "Full spec per Overview wireframe." },
    ],
    css: `.metrics-grid { grid-template-columns: 1fr 1fr; }
@media (min-width: 640px) { .metrics-grid { grid-template-columns: repeat(4, 1fr); } }
.winner-title { font-size: 24px; }
@media (min-width: 1024px) { .winner-title { font-size: 32px; } }
.quick-actions { grid-template-columns: 1fr 1fr; }
@media (min-width: 1024px) { .quick-actions { grid-template-columns: repeat(4, 1fr); } }`,
  },
];

// ─────────────────────────────────────────────────────────────
// SWIPE GESTURE MAP
// ─────────────────────────────────────────────────────────────
// SPEC: Touch gestures enabled below 1024px via:
// - Native CSS scroll-snap for horizontal navigation
// - Touch event listeners for flip/dismiss gestures
//
// | Screen          | Gesture        | Action                    |
// |----------------|----------------|---------------------------|
// | Gallery        | Swipe L/R      | Navigate images           |
// | Gallery        | Swipe Down     | Dismiss lightbox          |
// | DA Arena       | Swipe L/R      | Flip flashcard            |
// | Sidebar        | Swipe Left     | Close sidebar overlay     |
// | Stage responses| Swipe L/R      | Scroll between responses  |
// | Tab bar        | Swipe L/R      | Scroll tabs               |
// | Landing        | Swipe Up       | Reveal recent sessions    |
//
// Implementation: useSwipe() custom hook
// ```javascript
// const useSwipe = (ref, { onSwipeLeft, onSwipeRight, onSwipeDown, threshold = 50 }) => {
//   // Touch start/move/end tracking
//   // deltaX/deltaY calculation
//   // Fire callback if delta > threshold
// };
// ```

// ─────────────────────────────────────────────────────────────
// GLOBAL RESPONSIVE CSS ADDITIONS
// ─────────────────────────────────────────────────────────────
// SPEC: Add to gc-responsive.css (NEW file, ~120 lines)

const GLOBAL_CSS = `
/* ── gc-responsive.css ── */
/* NEW file: import in main.jsx after gc-motion.css */

/* Custom properties for breakpoints */
:root {
  --bp-mobile: 640px;
  --bp-tablet: 1024px;
  --bp-wide: 1440px;
}

/* Global touch targets below tablet */
@media (max-width: 1023px) {
  button, a, [role="button"], [role="tab"], input, select, textarea {
    min-height: 44px;
  }
  
  /* Increase tap spacing */
  .button-group { gap: 8px; }
  
  /* Disable hover-dependent interactions */
  .hover-only { display: none; }
}

/* Container widths */
.gc-container {
  width: 100%;
  padding: 8px;
}
@media (min-width: 640px) { .gc-container { padding: 13px; } }
@media (min-width: 1024px) { .gc-container { padding: 21px; } }
@media (min-width: 1440px) { .gc-container { max-width: 1200px; margin: 0 auto; } }

/* Responsive typography */
.gc-hero-title { font-size: 28px; }
@media (min-width: 640px) { .gc-hero-title { font-size: 36px; } }
@media (min-width: 1024px) { .gc-hero-title { font-size: 48px; } }

.gc-section-title { font-size: 18px; }
@media (min-width: 1024px) { .gc-section-title { font-size: 22px; } }

/* Scroll snap for horizontal navigation */
.gc-snap-x {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}
.gc-snap-x::-webkit-scrollbar { display: none; }
.gc-snap-x > * { scroll-snap-align: start; flex-shrink: 0; }

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}

/* Safe area insets for notched devices */
.gc-safe-bottom { padding-bottom: env(safe-area-inset-bottom, 0); }
.gc-safe-top { padding-top: env(safe-area-inset-top, 0); }
`;

// ─────────────────────────────────────────────────────────────
// WIREFRAME COMPONENT — Spec Display
// ─────────────────────────────────────────────────────────────

const SpecCard = ({ spec }) => (
  <div style={{
    background: T.surface,
    border: `1px solid ${T.border}`,
    borderRadius: 12,
    padding: 16,
    marginBottom: 13,
  }}>
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 10,
    }}>
      <h3 style={{
        fontFamily: "OmniPresent, Inter, system-ui",
        fontSize: 16, fontWeight: 700, color: T.text, margin: 0,
      }}>
        {spec.screen}
      </h3>
      <span style={{
        fontFamily: "JetBrains Mono, monospace",
        fontSize: 10, color: T.textMuted,
        background: T.surfaceRaised, borderRadius: 4, padding: "2px 8px",
      }}>
        {spec.file}
      </span>
    </div>

    {/* Breakpoint rules */}
    {spec.rules.map((rule, i) => (
      <div key={i} style={{
        display: "flex", gap: 10, padding: "8px 0",
        borderTop: i > 0 ? `1px solid ${T.border}` : "none",
      }}>
        <span style={{
          fontFamily: "JetBrains Mono, monospace",
          fontSize: 10, color: T.cyan, flexShrink: 0, width: 100,
          paddingTop: 2,
        }}>
          {rule.bp}
        </span>
        <span style={{
          fontFamily: "Inter, system-ui",
          fontSize: 12, color: T.textSoft, lineHeight: 1.5,
        }}>
          {rule.change}
        </span>
      </div>
    ))}

    {/* CSS snippet */}
    {spec.css && (
      <div style={{
        marginTop: 10, padding: 10,
        background: T.surfaceRaised, borderRadius: 8,
        fontFamily: "JetBrains Mono, monospace",
        fontSize: 10, color: T.textMuted, lineHeight: 1.6,
        whiteSpace: "pre-wrap", overflowX: "auto",
      }}>
        {spec.css}
      </div>
    )}
  </div>
);

// ─────────────────────────────────────────────────────────────
// MOBILE PHONE PREVIEW
// ─────────────────────────────────────────────────────────────

const PhonePreview = ({ children, width = 375 }) => (
  <div style={{
    width: width + 24,
    margin: "0 auto",
    padding: 12,
    background: T.surfaceRaised,
    borderRadius: 32,
    border: `2px solid ${T.borderHover}`,
  }}>
    {/* Notch */}
    <div style={{
      width: 120, height: 24,
      background: T.surfaceRaised,
      borderRadius: "0 0 16px 16px",
      margin: "0 auto 8px",
    }} />
    {/* Screen */}
    <div style={{
      width, height: 667,
      background: T.bg,
      borderRadius: 20,
      overflow: "hidden",
      position: "relative",
    }}>
      {children}
    </div>
    {/* Home bar */}
    <div style={{
      width: 134, height: 5,
      background: T.textMuted,
      borderRadius: 3,
      margin: "8px auto 0",
      opacity: 0.3,
    }} />
  </div>
);

// ─────────────────────────────────────────────────────────────
// MOBILE LANDING PREVIEW
// ─────────────────────────────────────────────────────────────

const MobileLandingPreview = () => (
  <div style={{
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    height: "100%", padding: 21, textAlign: "center",
  }}>
    <h1 style={{
      fontFamily: "OmniPresent, Inter, system-ui",
      fontSize: 28, fontWeight: 700, color: T.text,
      letterSpacing: "-0.02em", margin: 0,
    }}>
      Genesis Chamber
    </h1>
    <p style={{
      fontFamily: "Inter, system-ui",
      fontSize: 13, color: T.textMuted, marginTop: 8,
    }}>
      Multi-LLM creative intelligence
    </p>

    {/* Stacked mode cards */}
    <div style={{ display: "flex", flexDirection: "column", gap: 13, width: "100%", marginTop: 34 }}>
      {[
        { icon: IC.brain, title: "LLM Council", sub: "Multi-model chat", color: T.cyan },
        { icon: IC.bolt, title: "Genesis Chamber", sub: "Creative simulations", color: T.flame },
      ].map((m, i) => (
        <div key={i} style={{
          background: T.surface,
          border: `1px solid ${T.border}`,
          borderRadius: 12,
          padding: "16px 13px",
          display: "flex", alignItems: "center", gap: 13,
          minHeight: 48,
        }}>
          <span style={{ fontSize: 28 }}>{m.icon}</span>
          <div style={{ textAlign: "left" }}>
            <div style={{
              fontFamily: "OmniPresent, Inter, system-ui",
              fontSize: 16, fontWeight: 700, color: T.text,
            }}>
              {m.title}
            </div>
            <div style={{
              fontFamily: "Inter, system-ui",
              fontSize: 12, color: T.textMuted,
            }}>
              {m.sub}
            </div>
          </div>
          <span style={{ marginLeft: "auto", color: m.color, fontSize: 18 }}>→</span>
        </div>
      ))}
    </div>

    {/* Bottom safe area hint */}
    <div style={{
      position: "absolute", bottom: 16, left: 0, right: 0,
      textAlign: "center",
    }}>
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        background: T.surfaceRaised,
        borderRadius: 16, padding: "6px 16px",
      }}>
        <div style={{
          width: 6, height: 6, borderRadius: "50%",
          background: T.cyan,
        }} />
        <span style={{
          fontFamily: "Inter, system-ui",
          fontSize: 11, color: T.textSoft,
        }}>
          Start with LLM Council
        </span>
      </div>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────
// DEMO
// ─────────────────────────────────────────────────────────────

export default function MobileResponsiveWireframe() {
  const [view, setView] = useState("specs");

  return (
    <div style={{
      fontFamily: "Inter, system-ui, sans-serif",
      background: T.bg,
      color: T.text,
      minHeight: "100vh",
    }}>
      {/* Nav */}
      <div style={{
        padding: "8px 21px",
        background: T.surface,
        borderBottom: `1px solid ${T.borderHover}`,
        display: "flex", gap: 8,
      }}>
        {["specs", "mobile-preview", "css-output"].map(v => (
          <button key={v} onClick={() => setView(v)} style={{
            background: view === v ? T.cyan + "20" : T.surfaceRaised,
            border: `1px solid ${view === v ? T.cyan + "40" : T.border}`,
            borderRadius: 6, padding: "4px 12px",
            color: view === v ? T.cyan : T.textSoft,
            fontFamily: "JetBrains Mono, monospace", fontSize: 11, cursor: "pointer",
          }}>
            {v}
          </button>
        ))}
      </div>

      <div style={{ padding: 21 }}>
        {view === "specs" && (
          <>
            <div style={{
              fontFamily: "JetBrains Mono, monospace",
              fontSize: 11, color: T.textMuted,
              marginBottom: 21, textTransform: "uppercase", letterSpacing: "0.08em",
            }}>
              V4 Responsive System — Per-Screen Breakpoint Specs
            </div>
            {SCREEN_SPECS.map((spec, i) => (
              <SpecCard key={i} spec={spec} />
            ))}
          </>
        )}

        {view === "mobile-preview" && (
          <div style={{ textAlign: "center" }}>
            <div style={{
              fontFamily: "JetBrains Mono, monospace",
              fontSize: 11, color: T.textMuted,
              marginBottom: 21, textTransform: "uppercase", letterSpacing: "0.08em",
            }}>
              375px Mobile — Landing Screen
            </div>
            <PhonePreview>
              <MobileLandingPreview />
            </PhonePreview>
          </div>
        )}

        {view === "css-output" && (
          <>
            <div style={{
              fontFamily: "JetBrains Mono, monospace",
              fontSize: 11, color: T.textMuted,
              marginBottom: 13, textTransform: "uppercase", letterSpacing: "0.08em",
            }}>
              gc-responsive.css — New File (~120 lines)
            </div>
            <div style={{
              padding: 16,
              background: T.surface,
              borderRadius: 12,
              border: `1px solid ${T.border}`,
              fontFamily: "JetBrains Mono, monospace",
              fontSize: 11, color: T.textMuted,
              lineHeight: 1.7, whiteSpace: "pre-wrap", overflowX: "auto",
            }}>
              {GLOBAL_CSS}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
