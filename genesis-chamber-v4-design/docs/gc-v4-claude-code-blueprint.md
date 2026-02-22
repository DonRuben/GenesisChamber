# Genesis Chamber V4.1 — Claude Code Implementation Blueprint

> **Version:** 4.1.0 · **Design System:** Tobias van Schneider — Editorial Flat
> **Date:** 2026-02-21 · **Wireframes:** 13 JSX artifacts (9,295 lines)
> **Stack:** React 18 + CSS Modules + Vite · No Tailwind · No component libraries

---

## §1 — Project Context

### 1.1 Architecture

```
genesis-chamber/
├── src/
│   ├── tokens/
│   │   ├── colors.js          # T dark tokens + light overrides
│   │   ├── typography.js      # font stacks + scale
│   │   ├── spacing.js         # 4px grid system
│   │   └── motion.js          # durations + easings + keyframes
│   ├── icons/
│   │   └── IC.jsx             # 35 SVG icon components, 24×24, 1.5px stroke
│   ├── primitives/
│   │   ├── Btn.jsx            # Button system (primary/ghost/outline)
│   │   ├── Badge.jsx          # Inline label
│   │   ├── MonoLabel.jsx      # JetBrains Mono uppercase label
│   │   ├── Card.jsx           # Surface container
│   │   ├── ScoreBar.jsx       # Horizontal progress
│   │   ├── ScoreRing.jsx      # SVG circular score
│   │   └── StatusBadge.jsx    # Dot + label
│   ├── layout/
│   │   ├── Sidebar.jsx        # 260px / 56px collapse / mobile overlay
│   │   ├── TopBar.jsx         # 56px fixed header
│   │   └── Shell.jsx          # Sidebar + TopBar + <Outlet>
│   ├── screens/
│   │   ├── Landing.jsx        # Mode selection + recent sims
│   │   ├── Launcher.jsx       # 4-step simulation wizard
│   │   ├── Dashboard.jsx      # Tab shell (Overview/Stages/DA/Gallery)
│   │   ├── Overview.jsx       # Winner + concepts + transcript
│   │   ├── Stage1Create.jsx   # Ideation round
│   │   ├── Stage2Critique.jsx # Evaluation round
│   │   ├── Stage3Synthesize.jsx # Final synthesis
│   │   ├── DAArena.jsx        # Devil's Advocate courtroom
│   │   ├── DACommandCenter.jsx # DA config panel (in Launcher)
│   │   ├── Gallery.jsx        # Generated media grid
│   │   └── ConceptCard.jsx    # Reusable concept display
│   ├── styles/
│   │   ├── gc-reset.css       # Minimal reset
│   │   ├── gc-tokens.css      # CSS custom properties (dark + light)
│   │   ├── gc-motion.css      # @keyframes + utility classes
│   │   ├── gc-light-overrides.css  # [data-theme="light"] rules
│   │   └── gc-responsive.css  # Breakpoint overrides
│   └── main.jsx
├── public/
│   └── fonts/
│       ├── OmniPresent-Regular.woff2
│       ├── OmniPresent-Bold.woff2
│       ├── Inter-Variable.woff2
│       └── JetBrainsMono-Variable.woff2
└── vite.config.js
```

### 1.2 API Contract (Mock → Real)

All screens consume a shared simulation state object:

```typescript
interface Simulation {
  id: string;
  soul: { name: string; background: string; photo?: string };
  config: {
    mode: "full" | "blitz";
    models: Model[];
    stages: ("create" | "critique" | "synthesize")[];
    da: { enabled: boolean; style: string; frequency: number };
  };
  status: "idle" | "running" | "complete";
  currentStage: number;
  currentRound: number;
  concepts: Concept[];
  stages: StageResult[];
  da: DAInteraction[];
  gallery: MediaItem[];
  winner?: Concept;
  transcript: TranscriptEntry[];
}

interface Concept {
  id: string;
  name: string;
  tagline: string;
  scores: { innovation: number; feasibility: number; soul: number; overall: number };
  model: string;
  tier: "S" | "A" | "B" | "C";
  rank: number;
  media?: MediaItem[];
}

interface Model {
  id: string;
  name: string;        // "GPT-4o", "Claude 3.5", "Gemini 2.0", "DeepSeek R1"
  color: string;       // From MODEL_COLORS map
  avatar: string;      // Emoji or icon key
  role: string;        // "strategist", "creative", "analyst", "challenger"
}
```

---

## §2 — Design Token System

### 2.0 Design Philosophy — Tobias van Schneider

**Core principles:**
- **Extreme negative space:** Minimum 28-40px between sections, 16px minimum between elements
- **Monochromatic foundation:** UI is grayscale; color is editorial punctuation only
- **Flat surfaces:** No gradients, no glows, no shadows in dark mode
- **Typography hierarchy does the work:** Size, weight, and letterSpacing replace decoration
- **Accent = information:** Color signals function (stage, status, model), never decoration

**PROHIBITED in dark mode:**
- `box-shadow` (exception: light mode only)
- `linear-gradient`, `radial-gradient`
- `text-shadow`
- `glow` / neon effects
- Borders thicker than 2px
- Border-radius > 12px (exception: 9999px for avatars)

**ALLOWED accent patterns:**
- 2px `border-left` in accent color on cards
- Accent-colored text for labels/values
- Accent background at ≤ 8% opacity (`rgba(accent, 0.08)`)
- 1px horizontal rule in flame for section breaks
- Filled icon in accent color (single focal point per card)

### 2.1 SVG Icon System

**Specification:**
- ViewBox: `0 0 24 24`
- Stroke: `1.5px`, `currentColor`
- Stroke caps: `round`
- Stroke join: `round`
- Fill: `none` (default) or `currentColor` (filled variants)
- Render size: `1em` (inherits font-size)
- Vertical align: `-0.125em`

**Complete icon inventory (35 icons):**

| Key | Usage | Fill |
|-----|-------|------|
| brain | Soul/AI identity | stroke |
| bolt | Lightning/power, quick actions | filled |
| crown | Winner, top rank | stroke |
| swords | DA Arena, combat | stroke |
| gallery | Generated media | stroke |
| exportArrow | Export/share | stroke |
| home | Landing/dashboard | stroke |
| search | Search input | stroke |
| shield | DA defense | stroke |
| flame | Genesis fire, primary accent | filled |
| dove | Soul spirit, peace | stroke |
| star | Rating, favorite | filled |
| spark | Innovation, ideation | filled |
| check | Complete, success | stroke |
| xClose | Close, dismiss | stroke |
| skull | DA attack, threat | stroke |
| advocate | DA persona | stroke |
| globe | World, universal | stroke |
| clipboard | Notes, transcript | stroke |
| chat | Discussion, transcript | stroke |
| scale | Balance, fairness | stroke |
| rocket | Launch, start | stroke |
| megaphone | Announcement | stroke |
| palette | Creative, media | stroke |
| chart | Analytics, scores | stroke |
| temple | Structure, architecture | stroke |
| factory | Production, pipeline | stroke |
| sun | Light mode | stroke |
| moon | Dark mode | stroke |
| warn | Warning, alert | stroke |
| download | Download action | stroke |
| sliders | Settings, config | stroke |
| chevDown | Expand, dropdown | stroke |
| arrowLeft | Back navigation | stroke |
| arrowRight | Forward, next | stroke |
| upload | Upload action | stroke |

**Implementation pattern:**
```jsx
const s24 = { display: "inline-block", verticalAlign: "-0.125em" };
const icon = (paths, filled) => (
  <svg width="1em" height="1em" viewBox="0 0 24 24"
    fill={filled ? "currentColor" : "none"}
    stroke={filled ? "none" : "currentColor"}
    strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
    style={s24}>{paths}</svg>
);
```

### 2.2 Color Tokens — Dark Mode (default)

```javascript
const T = {
  // ── Surfaces ──
  bg:             "#111113",     // Page background
  surface:        "#18181B",     // Card background
  surfaceRaised:  "#1F1F23",     // Elevated cards, modals
  surfaceHover:   "#26262B",     // Hover state

  // ── Accents ──
  flame:          "#F27123",     // Primary brand accent
  cyan:           "#00D9FF",     // DA, tech, info
  gold:           "#D4A853",     // Winner, premium
  magenta:        "#E5375E",     // DA attack, danger
  green:          "#34D399",     // Success, Stage 1 (Create)
  purple:         "#8B5CF6",     // Innovation, special

  // ── Text ──
  text:           "#E8E6E3",     // Primary text
  textSoft:       "#A1A1AA",     // Secondary text
  textMuted:      "#63636E",     // Tertiary text, placeholders

  // ── Borders ──
  border:         "rgba(255,255,255,0.06)",   // Default separator
  borderHover:    "rgba(255,255,255,0.12)",   // Hover state
  borderStrong:   "rgba(255,255,255,0.18)",   // Emphasized border

  // ── Semantic ──
  success:        "#34D399",
  warning:        "#F59E0B",
  error:          "#EF4444",

  // ── Stage Colors ──
  stageCreate:    "#34D399",     // Stage 1 — green
  stageCritique:  "#F59E0B",     // Stage 2 — amber
  stageSynthesize:"#EF4444",     // Stage 3 — red

  // ── DA Colors ──
  daRed:          "#E5375E",     // Attack
  daCyan:         "#00D9FF",     // Defense

  // ── Team Colors ──
  teamDesign:     "#00D9FF",
  teamMarketing:  "#F27123",
  teamBusiness:   "#D4A853",
};
```

**Model color map:**
```javascript
const MODEL_COLORS = {
  "gpt-4o":       "#10B981",   // emerald
  "claude-3.5":   "#F27123",   // flame
  "gemini-2.0":   "#3B82F6",   // blue
  "deepseek-r1":  "#8B5CF6",   // purple
  "llama-3.3":    "#EF4444",   // red
};
```

### 2.3 Color Tokens — Light Mode

```javascript
const LIGHT = {
  bg:             "#F2F2F7",
  surface:        "#FFFFFF",
  surfaceRaised:  "#E8E8ED",
  surfaceHover:   "#D1D1D6",
  text:           "#1C1C1E",
  textSoft:       "#3A3A3C",
  textMuted:      "#636366",
  border:         "rgba(0,0,0,0.05)",
  borderHover:    "rgba(0,0,0,0.10)",
  borderStrong:   "rgba(0,0,0,0.18)",
  shadowSm:       "0 1px 2px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)",
  shadowMd:       "0 2px 6px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)",
  shadowLg:       "0 4px 12px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.04)",
};
```

**Light mode accent adjustments:**
```javascript
const ACCENT_LIGHT = {
  cyan:    { bg: "rgba(0,180,220,0.10)", border: "rgba(0,160,200,0.25)" },
  flame:   { bg: "rgba(220,90,20,0.08)", border: "rgba(200,80,15,0.20)" },
  gold:    { bg: "rgba(200,150,0,0.08)", border: "rgba(180,130,0,0.20)" },
  magenta: { bg: "rgba(220,0,90,0.08)", border: "rgba(200,0,80,0.20)" },
};
```

**Key light-mode rule:** In light mode, shadows REPLACE the flat-border approach.
Cards get `shadowSm` or `shadowMd` instead of border emphasis.

### 2.4 Typography

**Font stack priority:**
1. **OmniPresent** — Display face (headers, hero text, ≥16px ONLY)
2. **Inter** — Body text (max weight 600, never 700+)
3. **JetBrains Mono** — Data labels, scores, monospace values

```css
@font-face {
  font-family: 'OmniPresent';
  src: url('/fonts/OmniPresent-Regular.woff2') format('woff2');
  font-weight: 400;
  font-display: swap;
}
@font-face {
  font-family: 'OmniPresent';
  src: url('/fonts/OmniPresent-Bold.woff2') format('woff2');
  font-weight: 700;
  font-display: swap;
}
```

**Type scale:**

| Role | Font | Size | Weight | Tracking | Usage |
|------|------|------|--------|----------|-------|
| Hero | OmniPresent | 32-40px | 700 | -0.02em | Landing title, modal headers |
| H1 | OmniPresent | 24-28px | 700 | -0.01em | Screen titles |
| H2 | OmniPresent | 18-20px | 600 | 0 | Section headers |
| H3 | Inter | 15-16px | 600 | 0 | Card titles |
| Body | Inter | 14px | 400 | 0 | Default text |
| Small | Inter | 13px | 400 | 0 | Secondary info |
| Caption | Inter | 11-12px | 500 | 0.02em | Timestamps, metadata |
| Mono-Label | JetBrains Mono | 10-11px | 700 | 0.12em | UPPERCASE tags, scores |
| Mono-Value | JetBrains Mono | 14-18px | 600 | 0 | Score numbers, stats |

**Typography rules:**
- OmniPresent NEVER below 16px (falls back to Inter at small sizes)
- JetBrains Mono labels ALWAYS uppercase with 0.12em letter-spacing
- Inter body text NEVER exceeds weight 600
- Line height: 1.5 for body, 1.2 for display, 1.0 for mono-labels
- Max paragraph width: 65ch

### 2.5 Spacing System

**Base unit:** 4px grid

| Token | Value | Usage |
|-------|-------|-------|
| `--sp-1` | 4px | Icon-to-text gap |
| `--sp-2` | 8px | Tight element gap |
| `--sp-3` | 12px | Default inner padding |
| `--sp-4` | 16px | Card padding, min element gap |
| `--sp-5` | 20px | Section inner padding |
| `--sp-6` | 24px | Card padding (large) |
| `--sp-7` | 28px | Min section gap |
| `--sp-8` | 32px | Standard section gap |
| `--sp-10` | 40px | Max section gap |
| `--sp-12` | 48px | Page margin |

**Spacing rules:**
- Minimum 28-40px between major sections
- Minimum 16px between sibling elements
- Minimum 16px card inner padding
- Cards in grids: 16px gap (mobile), 20px gap (desktop)

### 2.6 Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 4px | Tags, badges, small chips |
| `--radius-md` | 8px | Cards, buttons, inputs |
| `--radius-lg` | 12px | Modals, panels |
| `--radius-full` | 9999px | Avatars, pills |

**Rule:** Rectangular aesthetic by default. Only avatars use full rounding.

### 2.7 Component Primitives

**Btn (Button)**
```jsx
// Variants: primary (flame bg), ghost (transparent), outline (border only)
// Sizes: sm (28px), md (36px), lg (44px)
// All use font.body at weight 500
// Active state: scale(0.97) 80ms
// Border-radius: 8px
<Btn variant="primary" size="md" icon={IC.rocket}>Launch</Btn>
```

Styles:
```
primary:  bg: T.flame, color: #fff, no border
ghost:    bg: transparent, color: T.textSoft, hover: bg T.surfaceHover
outline:  bg: transparent, border: 1px solid T.border, color: T.text, hover: border T.borderHover
```

**Badge**
```jsx
// Inline label with accent bg at 8% opacity + accent text
// height: 22px, padding: 0 8px, radius: 4px
// font: JetBrains Mono 10px 700 uppercase 0.12em tracking
<Badge color={T.cyan}>ACTIVE</Badge>
```

**MonoLabel**
```jsx
// Pure text label, no background
// font: JetBrains Mono 10px 700 uppercase 0.12em tracking
// color: T.textMuted (default) or accent
<MonoLabel>ROUND 3 OF 5</MonoLabel>
```

**Card**
```jsx
// Dark: bg T.surface, border 1px T.border, radius 8px, padding 16-24px
// Optional: 2px border-left in accent color
// Light: bg #fff, shadow shadowSm, same padding
<Card accent={T.green} padding={24}>...</Card>
```

**ScoreBar**
```jsx
// Horizontal progress bar
// Track: 4px height, bg T.surfaceRaised, radius 2px
// Fill: accent color, animated width transition 340ms
<ScoreBar value={78} max={100} color={T.green} />
```

**ScoreRing**
```jsx
// SVG circular score indicator
// Size: 48-80px
// Track: stroke T.surfaceRaised, 4px width
// Fill: stroke accent, animated dashoffset
// Center: score number in JetBrains Mono 18px 600
<ScoreRing score={85} color={T.gold} size={64} />
```

**StatusBadge**
```jsx
// Dot (6px circle) + label
// Colors: green=active, amber=running, red=error, muted=idle
<StatusBadge status="running" label="Stage 2" />
```

---

## §3 — Motion System

### 3.0 Motion Philosophy

All animation is **purpose-driven** — every motion communicates a state change.
No decorative animation. Respect `prefers-reduced-motion`.

### 3.1 Duration Scale (Fibonacci-based)

| Token | Value | Usage |
|-------|-------|-------|
| `instant` | 80ms | Micro-interactions (badge, tooltip) |
| `fast` | 130ms | Hover states, button feedback |
| `normal` | 210ms | Tab switch, panel reveal |
| `slow` | 340ms | Page transition, modal open |
| `dramatic` | 550ms | DA verdict reveal, winner reveal |
| `epic` | 890ms | Launch sequence |

### 3.2 Easing Functions

| Name | Value | Context |
|------|-------|---------|
| `default` | `cubic-bezier(0.4, 0, 0.2, 1)` | Standard Material |
| `decelerate` | `cubic-bezier(0, 0, 0.2, 1)` | Enter screen |
| `accelerate` | `cubic-bezier(0.4, 0, 1, 1)` | Leave screen |
| `spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Playful bounce |
| `sharp` | `cubic-bezier(0.4, 0, 0.6, 1)` | Precise, no overshoot |
| `dramatic` | `cubic-bezier(0.16, 1, 0.3, 1)` | DA arena, high impact |

### 3.3 Keyframe Catalog (17 animations)

**Page Transitions:**
1. `fadeSlideUp` — Content enters from 13px below. Duration: 210ms decelerate. Usage: tab switch, panel reveal.
2. `fadeSlideRight` — Horizontal enter from -21px. Duration: 210ms decelerate. Usage: launcher step nav.
3. `scaleIn` — Modal entrance from scale(0.92). Duration: 340ms spring. Usage: lightbox, dialogs.

**Micro-Interactions:**
4. `buttonPress` — `scale(0.97)` on `:active`. Duration: 80ms sharp.
5. `hoverLift` — `translateY(-2px)`. Duration: 130ms default. Usage: gallery cards, concept cards.
6. `badgePop` — Scale 0.5→1.1→1.0 with fade. Duration: 130ms spring.
7. `glowPulse` — Ambient box-shadow pulse (2s loop). Usage: winner, live indicator.

**DA Arena:**
8. `panelSlideIn` — Prosecution/defense panels slide in from edges. Duration: 400ms smooth.
9. `ratingPulse` — Scale 1→1.08→1 on selection. Duration: 210ms spring.
10. `threatFill` — SVG stroke-dashoffset animation. Duration: 340ms decelerate.

**Simulation Flow:**
11. `launchSequence` — Button pulse→expand→redirect. Duration: 890ms dramatic.
12. `stageTransition` — Progress segment color fill + scale(1.05). Duration: 340ms default.
13. `winnerReveal` — Scale 0.95→1.02→1.0 with gold glow expansion. Duration: 550ms spring.

**Utility:**
14. `staggerChildren` — Sequential 50ms delay per list item. Each child: fadeSlideUp 210ms.
15. `skeletonShimmer` — Background-position sweep (1.5s loop).
16. `reducedMotion` — All animations → `animation: none !important; transition-duration: 0.01ms !important;`
17. `counterSpin` — Continuous rotate for loading indicator (1s linear loop).

### 3.4 Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## §4 — Wireframe Reference Map

| # | File | Lines | Primary Component | Screen |
|---|------|-------|-------------------|--------|
| 1 | gc-v4-launcher-redesign.jsx | 787 | SimulationLauncher | `/launch` |
| 2 | gc-v4-dashboard-redesign.jsx | 522 | DashboardRedesign | `/sim/:id` |
| 3 | gc-v4-llm-council-stages.jsx | 1,088 | Stage1/2/3 | `/sim/:id/stage/:n` |
| 4 | gc-v4-da-arena-redesign.jsx | 619 | DAArenaCourtroom, ProsecutionPanel, DefensePanel | `/sim/:id/da` |
| 5 | gc-v4-gallery-redesign.jsx | 744 | GeneratedGallery | `/sim/:id/gallery` |
| 6 | gc-v4-information-architecture.jsx | 740 | LandingScreen, Sidebar | `/` |
| 7 | gc-v4-dashboard-tab-restructure.jsx | 685 | Dashboard tabs | `/sim/:id` (tabs) |
| 8 | gc-v4-concept-cards-hierarchy.jsx | 587 | ConceptCard, Overview | `/sim/:id/overview` |
| 9 | gc-v4-overview-polish.jsx | 626 | SimulationOverview | `/sim/:id/overview` |
| 10 | gc-v4-da-command-center.jsx | 597 | DACommandCenter | `/launch` (panel) |
| 11 | gc-v4-light-mode-rework.jsx | 992 | gc-light-overrides.css | Global |
| 12 | gc-v4-motion-system.jsx | 560 | gc-motion.css | Global |
| 13 | gc-v4-mobile-responsive.jsx | 611 | gc-responsive.css | Global |
| 14 | gc-v4-llm-council.jsx | 494 | LLMCouncil, ComparisonGrid | `/sim/:id/council` |
| 15 | gc-v4-app-shell.jsx | 462 | Shell, Sidebar, TopBar, ModeSwitch | Layout wrapper |

---

## §5 — Screen: Landing (Information Architecture)

**Route:** `/`
**Wireframe:** `gc-v4-information-architecture.jsx` (740 lines)
**Components:** `LandingScreen`, `ModeCard`, `RecentSimCard`, `Sidebar`

### Layout
- Full viewport with Sidebar (260px desktop / 56px tablet / hidden mobile)
- Content area centered, max-width 800px
- Hero section → Mode cards → Recent simulations

### Hero Section
- Title: "Genesis Chamber" in OmniPresent 36px 700, color T.text
- Subtitle: Body text in Inter 15px 400, color T.textSoft
- 1px flame horizontal rule below (width 48px)

### Mode Cards (2-column grid)
- **Full Simulation:** IC.brain icon in T.flame, title in OmniPresent 18px
- **Blitz Mode:** IC.bolt icon in T.cyan, title in OmniPresent 18px
- Card: bg T.surface, border 1px T.border, radius 8px, padding 24px
- Hover: bg T.surfaceHover, border T.borderHover, 130ms transition
- Description: Inter 14px T.textSoft
- CTA: ghost button, 13px mono label

### Recent Simulations
- Section header: "RECENT SIMULATIONS" in MonoLabel style
- 3-column grid (desktop), 2-col (tablet), 1-col (mobile)
- Each card: soul name, status badge, concept count, last updated
- Truncate soul name at 24 chars with ellipsis

### Sidebar
- Logo: IC.flame in 24px, "GC" text in OmniPresent 16px 700
- Nav items: icon (20px) + label (Inter 14px 500)
- Active item: 2px left border in T.flame, bg rgba(242,113,35,0.08)
- Footer: theme toggle (IC.sun / IC.moon), collapse button
- Collapsed state: 56px wide, icons only, tooltip on hover

---

## §5.5 — Screen: App Shell (Layout Wrapper)

**Route:** All routes (persistent wrapper)
**Wireframe:** `gc-v4-app-shell.jsx` (462 lines)
**Components:** `Shell`, `Sidebar`, `TopBar`, `ModeSwitch`, `ConversationList`

### Layout
- Full viewport: `100vw × 100vh`, overflow hidden on body
- 3 regions: Sidebar (left) + TopBar (top) + Content (remaining)
- Sidebar: 3 states — hidden (0px), collapsed (56px icons only), expanded (260px full nav)
- TopBar: 48px height, borderBottom 1px T.border
- Content: flex-grow, overflow-y auto, receives routed screen

### Sidebar
- Header: Genesis Chamber branding, OmniPresent font, collapse toggle
- Mode tabs: "Create" (T.flame) and "Explore" (T.cyan) — borderLeft accent on active
- Conversation list: scrollable, each item shows title + model dot + timestamp
- New conversation button: ghost style, top of list
- Footer: settings gear, theme toggle (sun/moon), user avatar placeholder
- Collapsed: icons only, tooltips on hover, 56px width
- Transition: sidebar width animates with `cubic-bezier(0.16, 1, 0.3, 1)` 300ms

### TopBar
- Left: breadcrumb path (e.g., "Create → Simulation → Phoenix Rising")
- Center: empty (reserved for search in future)
- Right: notification bell, theme toggle (if not in sidebar), user menu
- All text: MonoLabel style, 9px uppercase

### ModeSwitch
- Two-option toggle: "Create" / "Explore"
- Active: T.surfaceRaised bg, borderLeft 2px accent color, T.text color
- Inactive: transparent bg, T.textMuted color
- Transition: 130ms all

### Responsive
- Desktop (≥1024px): expanded sidebar default
- Tablet (768–1023px): collapsed sidebar default
- Mobile (<768px): hidden sidebar, hamburger in TopBar, drawer overlay on open

### Data Shape
```javascript
const shellState = {
  sidebarMode: "expanded" | "collapsed" | "hidden",
  activeMode: "create" | "explore",
  conversations: [{ id, title, model, modelColor, updatedAt }],
  currentRoute: "/sim/:id/dashboard",
};
```

---

## §6 — Screen: Simulation Launcher

**Route:** `/launch`
**Wireframe:** `gc-v4-launcher-redesign.jsx` (787 lines)
**Components:** `SimulationLauncher`

### Layout
- 4-step wizard with horizontal step indicator
- Step indicator: numbered circles (28px), connected by 1px line in T.border
- Active step: flame border, current number in T.flame
- Completed step: check icon, green fill

### Step 1: Soul Configuration
- Soul name input: bg T.surfaceRaised, border T.border, radius 8px, height 44px
- Background textarea: same styling, min-height 120px
- Photo upload: 80×80 circle placeholder, dashed border
- "Quick Souls" presets: ghost buttons with IC.dove / IC.crown icons

### Step 2: Model Selection
- Model cards in 2-column grid
- Each card: model name (Inter 15px 600), role badge, color indicator (2px left border)
- Selected state: border T.flame, bg rgba(242,113,35,0.06)
- Toggle: custom checkbox with model avatar

### Step 3: Stage Configuration
- 3 stage cards (Create → Critique → Synthesize)
- Each with stage color left border, round count selector
- Round selector: -/+ buttons flanking number (JetBrains Mono 16px)
- Stage descriptions in Inter 13px T.textMuted

### Step 4: DA Command Center
See §15 for full DA Command Center spec.

### Launch Button
- Fixed bottom bar, bg T.surface, border-top 1px T.border
- Button: bg T.flame, color #fff, height 48px, radius 8px, full width (max 320px center)
- Text: "Launch Simulation" in Inter 15px 600
- Icon: IC.rocket left-aligned
- Animation: launchSequence (890ms) on click

---

## §7 — Screen: Dashboard Shell

**Route:** `/sim/:id`
**Wireframes:** `gc-v4-dashboard-redesign.jsx` (522 lines), `gc-v4-dashboard-tab-restructure.jsx` (685 lines)
**Components:** `DashboardRedesign`, tab system

### Layout
- Top bar: soul name + status badge + stage progress
- Tab bar: 4 tabs (Overview, Stages, DA Arena, Gallery)
- Tab content area: fills remaining viewport

### Top Bar
- Soul name: OmniPresent 20px 700
- Status: StatusBadge component (running/complete)
- Stage progress: 3 segments, each colored by stage color, current has subtle pulse
- Height: 56px, bg T.surface, border-bottom 1px T.border

### Tab Bar
- Flush left, no gap from top bar
- Tab buttons: Inter 14px 500, color T.textMuted
- Active tab: color T.text, 2px bottom border in T.flame
- Hover: color T.textSoft, bg T.surfaceHover
- Transition: 130ms default
- Tab switch animation: fadeSlideUp 210ms on content area

### Tab Content
- Padding: 24px (desktop), 16px (mobile)
- Max-width: none (fills available space)
- Content fades in with fadeSlideUp on tab change

---

## §8 — Screen: Overview Tab

**Route:** `/sim/:id` (default tab)
**Wireframes:** `gc-v4-concept-cards-hierarchy.jsx` (587 lines), `gc-v4-overview-polish.jsx` (626 lines)
**Components:** `SimulationOverviewV4`, `ConceptCard`, winner display

### Winner Section
- Full-width card, bg T.surface, 2px left border in T.gold
- Winner badge: IC.crown in T.gold + "WINNER" MonoLabel
- Concept name: OmniPresent 24px 700
- Tagline: Inter 15px 400 T.textSoft
- Overall score: ScoreRing 64px in T.gold
- Subscores: 4 horizontal ScoreBars (innovation, feasibility, soul alignment, overall)
- Model attribution: colored dot + model name in Inter 13px
- Animation: winnerReveal on first load

### Concept Grid
- 2-column grid (desktop), 1-column (mobile)
- ConceptCard component (see §14)
- Sorted by rank: S → A → B → C tier
- Tier badge: MonoLabel with tier color bg at 8%
- Expandable: click to reveal full details + media

### Transcript Preview
- Section header: "SIMULATION TRANSCRIPT" MonoLabel
- Last 5 entries, each showing model avatar + message preview
- "View Full Transcript" ghost button
- Transcript entries: model color left border, Inter 13px, timestamps in mono 11px

---

## §9 — Screen: LLM Council Stages

**Route:** `/sim/:id/stage/:n`
**Wireframe:** `gc-v4-llm-council-stages.jsx` (1,088 lines)
**Components:** `Stage1Create`, `Stage2Critique`, `Stage3Synthesize`

### Shared Stage Layout
- Stage header: stage name + number + color indicator
- Round navigator: "ROUND 1 OF 5" in MonoLabel + prev/next arrows
- Content area: model panels or concept grid
- Stage color system: Create=#34D399, Critique=#F59E0B, Synthesize=#EF4444

### Stage 1: Create (Green)
- Model panels side-by-side (4-column on desktop, stack on mobile)
- Each panel: model avatar + name header, colored top border (2px)
- Generated concepts listed as mini-cards within each panel
- Concept: name (Inter 14px 600), tagline (Inter 13px T.textSoft)
- Live indicator: pulsing green dot when model is generating

### Stage 2: Critique (Amber)
- Evaluation grid: concepts × models matrix
- Each cell: score value (JetBrains Mono 16px) + color-coded background
- Score colors: red (0-39), amber (40-69), green (70-100) at 8% opacity
- Rankings panel on right: sorted list with rank numbers
- Model commentary: expandable text blocks per model per concept

### Stage 3: Synthesize (Red)
- Final rankings with animated reveal
- Tier grouping: S/A/B/C with tier headers
- Synthesis narrative: scrollable text block per concept
- Winner announcement at top with gold treatment
- "Export Results" button in bottom bar

### Stage Data Shape
```javascript
const STAGE = {
  1: { name: "Create", subtitle: "Ideation", color: T.stageCreate, icon: IC.spark },
  2: { name: "Critique", subtitle: "Evaluation", color: T.stageCritique, icon: IC.scale },
  3: { name: "Synthesize", subtitle: "Final Synthesis", color: T.stageSynthesize, icon: IC.flame },
};
```

---

## §9.5 — Screen: LLM Council (Multi-Model Comparison)

**Route:** `/sim/:id/council`
**Wireframe:** `gc-v4-llm-council.jsx` (494 lines)
**Components:** `LLMCouncil`, `ModelResponse`, `AnonymousCard`, `RevealButton`, `ComparisonGrid`, `PresetBar`, `SynthesisPanel`

### Layout
- Full content area within Shell
- Header: "LLM COUNCIL" MonoLabel + preset selector bar
- Main: 2-column grid of response cards (anonymous phase) or attributed cards (revealed phase)
- Footer: synthesis panel (collapsed by default, expands to show merged output)

### Preset Bar
- Horizontal row of preset buttons: Compare, Analyze, Brainstorm, Evaluate, Debate
- Each: borderLeft 2px accent when active, MonoLabel text
- Preset colors: Compare (T.cyan), Analyze (T.green), Brainstorm (T.gold), Evaluate (T.purple), Debate (T.magenta)
- Custom prompt input: text field that appears when "Custom" is selected

### Anonymous Phase
- Response cards: T.surface bg, 1px T.border, borderLeft 2px T.textMuted
- Card header: "MODEL A", "MODEL B", etc. — no model name visible
- Card body: response text, Inter 13px, T.textSoft, lineHeight 1.7
- Vote buttons: thumbs up per card, borderLeft accent on voted
- Reveal button: centered below grid, "Reveal Models" ghost button

### Revealed Phase
- Cards update: borderLeft changes to model's accent color
- Card header: shows actual model name + colored dot
- Vote badges remain visible
- Side-by-side comparison: cards maintain grid position
- Transition: borderLeft color fades in 300ms

### Synthesis Panel
- Collapsed: single line "View Synthesis" with chevDown icon
- Expanded: merged output combining best elements from all responses
- Header: "SYNTHESIS" MonoLabel in T.gold
- Body: synthesized text with inline attribution tags (colored model dots)
- borderLeft: 2px T.gold

### Rankings
- After reveal: ranking bar appears showing models sorted by votes
- Each: horizontal bar chart, model color, vote count
- Winner: T.gold star icon prefix

### Data Shape
```javascript
const councilState = {
  preset: "compare" | "analyze" | "brainstorm" | "evaluate" | "debate" | "custom",
  customPrompt: "",
  responses: [
    { id, modelId, modelName, modelColor, text, anonymousLabel: "Model A" },
  ],
  revealed: false,
  votes: { "model-a": 3, "model-b": 1 },
  synthesis: { text: "...", sources: ["model-a", "model-c"] },
};
```

---

## §10 — Screen: DA Arena

**Route:** `/sim/:id/da`
**Wireframe:** `gc-v4-da-arena-redesign.jsx` (619 lines)
**Components:** `DAArenaCourtroom`, `ProsecutionPanel`, `DefensePanel`, `VerdictBar`, `ListItem`, `TrainingReport`, `RatingButtons`, `AggressionMeter`, `RoundTimeline`

### Layout — Courtroom Split Panel
- Two views: "Courtroom" (default) and "Report" (tab toggle in header)
- Courtroom: center content (60%) + right sidebar (320px)
- Center: RoundTimeline → nav arrows → split panel → verdict bar
- No card flipping — prosecution and defense are simultaneously visible

### Header
- Left: IC.swords in T.magenta + "DEVIL'S ADVOCATE ARENA" MonoLabel + challenge count Tag
- Right: view toggle buttons (Courtroom / Report), borderLeft accent on active

### Round Timeline
- Horizontal row of round buttons
- Active: T.surfaceRaised bg, borderLeft 2px T.magenta
- Click toggles filter; click active round to clear filter

### Prosecution Panel (Left)
- bg T.surface, borderLeft 2px T.magenta
- Header: IC.skull + "PROSECUTION" MonoLabel in T.magenta + DA score (right)
- Fatal Flaw: Inter 14px 500, T.text, prominent
- Weaknesses: always visible (not collapsed), bullet list with T.magenta dots
- One Change: T.gold italic text, quoted
- Footer: persona dot + name, severity Dots

### Defense Panel (Right)
- bg T.surface, borderLeft 2px T.cyan (or T.textMuted if no defense)
- Header: IC.shield + "DEFENSE" MonoLabel in T.cyan + VerdictBadge
- Defense text: Inter 14px, T.text (or "No defense submitted" placeholder)
- Verdict notes: MonoLabel header + T.textSoft body
- Rating buttons: inline within defense panel (not separate section)
- Footer: model dot + model name + persona, revised score

### Verdict Bar (Full Width Bottom)
- Spans full width below both panels
- bg T.surface, borderLeft 2px in verdict color (green/gold/magenta)
- IC.award icon, verdict label (bold), verdict details, score change (from→to)

### Right Sidebar
- Threat ScoreRing (56px) + stats summary
- AggressionMeter (5-level bar)
- 2-col stat grid: Defense Rate, Top Concept
- Scrollable challenge list: ListItem components, borderLeft 2px T.magenta on active

### Training Report Tab
- Replaces courtroom when "Report" tab is active
- Full-width, max 900px centered
- Threat ScoreRing (88px) + summary tags
- 4-col key metrics grid (borderLeft accent)
- Concept resilience cards with progress bars
- 2-col all interactions grid with verdict badges

### Mock Data Shape
```javascript
const INTERACTION = {
  id: 1, round: 1,
  concept: { name: "Phoenix Rising", persona: "Maya Chen", model: "Claude Sonnet", modelColor: "#F27123" },
  attack: {
    da_score: 8, severity: 4, persona: "skeptic",
    fatal_flaw: "Over-reliance on mythological symbolism...",
    weaknesses: ["Too abstract", "Mythological gatekeeping", "No value prop"],
    one_change: "Ground the phoenix metaphor in universal human experience.",
  },
  defense: { text: "The phoenix transcends cultures...", submitted: true },
  verdict: { status: "accepted_partial", label: "Defense Accepted — Partially", details: "...", revised_score: 7 },
  rating: "effective",
};
```

---

## §11 — Screen: Gallery

**Route:** `/sim/:id/gallery`
**Wireframe:** `gc-v4-gallery-redesign.jsx` (744 lines)
**Components:** `GeneratedGallery`, `PlaceholderImg`, `MediaCard`, `Lightbox`

### Layout
- Filter bar at top: concept filter (dropdown) + media type filter (chips)
- Masonry grid: 3 columns (desktop), 2 (tablet), 1 (mobile)
- Lightbox overlay for full-size viewing

### Filter Bar
- Concept dropdown: select input, bg T.surfaceRaised, border T.border
- Media type chips: "All", "Images", "Video", "Audio", "Text"
  - Chip: ghost button style, active gets flame bg at 8% + flame text
- Results count: "24 items" in MonoLabel right-aligned

### Media Cards
- Aspect ratio: preserve original (images) or 16:9 (video/audio)
- Card: bg T.surface, border 1px T.border, radius 8px, overflow hidden
- Image: fills card top, object-fit cover
- Info bar below image: concept name (Inter 13px 600) + model dot + type icon
- Hover: hoverLift animation, overlay gradient from bottom with download icon
- Placeholder: generative colored rectangle with concept initial letter

### Lightbox
- Full-screen overlay: bg rgba(0,0,0,0.85)
- Centered media, max 90vw × 85vh
- Close button: top-right, IC.xClose, 44×44 touch target
- Prev/next arrows: sides, 44×44, appear on hover
- Info panel below: concept name, model, prompt used, download button
- Animation: scaleIn 340ms on open, fade out 210ms on close

### Media Data Shape
```javascript
const MOCK_MEDIA = [
  {
    id: "m1",
    conceptId: "c1",
    type: "image",        // image | video | audio | text
    url: "...",
    prompt: "...",
    model: "DALL-E 3",
    dimensions: { w: 1024, h: 1024 },
    createdAt: "2025-...",
  },
];
```

---

## §12 — Screen: Concept Card (Reusable Component)

**Wireframe:** `gc-v4-concept-cards-hierarchy.jsx` (587 lines), `gc-v4-dashboard-tab-restructure.jsx` (685 lines)
**Component:** `ConceptCardV4`

### Props
```typescript
interface ConceptCardProps {
  concept: Concept;
  tier: "S" | "A" | "B" | "C";
  rank: number;
  isExpanded: boolean;
  onToggle: () => void;
}
```

### Collapsed State
- Card: bg T.surface, border 1px T.border, radius 8px, padding 16px
- Left section: rank number (JetBrains Mono 24px 700, T.textMuted) + tier badge
- Center: concept name (Inter 15px 600) + tagline (Inter 13px T.textSoft, 1 line truncated)
- Right: overall score (JetBrains Mono 18px 600) + model color dot
- Tier badge colors: S=#D4A853(gold), A=#34D399(green), B=#3B82F6(blue), C=#63636E(muted)
- Height: ~72px collapsed

### Expanded State
- Expands below collapsed row with fadeSlideUp
- 4 score bars: innovation, feasibility, soul alignment, overall
- Each bar: label (Inter 13px T.textMuted) + ScoreBar + value (JetBrains Mono 13px)
- Model attribution: avatar dot + name + role
- Media preview: 3 thumbnail squares (64×64) if media exists
- "View in Gallery" ghost button

### Winner Variant
- 2px left border in T.gold instead of T.border
- IC.crown badge next to rank
- Subtle gold bg at 4% opacity
- WinnerReveal animation on first render

---

## §13 — DA Command Center (Launcher Sub-panel)

**Wireframe:** `gc-v4-da-command-center.jsx` (626 lines)
**Component:** `DACommandCenter`, `QuickStartPanel`

### Master Toggle
- Switch: 48×24, T.surfaceRaised track, T.flame thumb when enabled
- Label: "Devil's Advocate" in Inter 15px 600 + IC.swords
- Subtitle: "Enable adversarial testing" in Inter 13px T.textMuted

### Configuration (visible when enabled)
- **DA Style Selector:** 3 radio cards (Socratic, Aggressive, Balanced)
  - Each: icon + name + description, radio indicator
  - Selected: 2px border in T.cyan, bg rgba(0,217,255,0.06)
- **Frequency Slider:** range input, 1-5 scale
  - Label: "Challenge Frequency" + value in JetBrains Mono
  - Track: 4px, T.surfaceRaised, filled portion in T.cyan
  - Thumb: 16×16 circle, T.cyan
- **Focus Areas:** multi-select chips
  - Options: "Feasibility", "Ethics", "Originality", "Market Fit", "Technical"
  - Chip: ghost button style, selected gets cyan bg at 8%

### Quick Start Panel
- Pre-configured DA presets: "Light Sparring", "Full Interrogation", "Devil's Trial"
- Each preset: card with intensity indicator (1-3 flames), brief description
- Select populates all config fields

---

## §14 — Light Mode System

**Wireframe:** `gc-v4-light-mode-rework.jsx` (992 lines)
**Output:** `gc-light-overrides.css`

### Implementation Strategy
- CSS custom properties on `:root` (dark default)
- `[data-theme="light"]` override block
- JavaScript toggle: `document.documentElement.dataset.theme = "light"`

### Token Override Table

| Property | Dark | Light |
|----------|------|-------|
| `--bg` | #111113 | #F2F2F7 |
| `--surface` | #18181B | #FFFFFF |
| `--surface-raised` | #1F1F23 | #E8E8ED |
| `--surface-hover` | #26262B | #D1D1D6 |
| `--text` | #E8E6E3 | #1C1C1E |
| `--text-soft` | #A1A1AA | #3A3A3C |
| `--text-muted` | #63636E | #636366 |
| `--border` | rgba(255,255,255,0.06) | rgba(0,0,0,0.05) |
| `--border-hover` | rgba(255,255,255,0.12) | rgba(0,0,0,0.10) |

### Light Mode Differences
- **Cards get shadows** (shadowSm/shadowMd) instead of subtle borders
- **Accent colors slightly desaturated** (see ACCENT_LIGHT in §2.3)
- **Overlay backdrops lighter:** rgba(0,0,0,0.35) instead of 0.6
- **Scrollbar:** thumb rgba(0,0,0,0.15), hover rgba(0,0,0,0.25)

### Bug Audit (9 issues from wireframe)

| ID | Severity | File | Issue | Fix |
|----|----------|------|-------|-----|
| B1 | P0 | Stage1.css | `rgba(255,255,255,0.03)` borders invisible on white | Override → `rgba(0,0,0,0.04)` |
| B2 | P0 | Stage1.css | 8× white-alpha borders invisible | Batch override all `rgba(255,255,255,*)` → `rgba(0,0,0,*)` |
| B3 | P0 | SimulationLauncher.css | Overlay `rgba(0,0,0,0.6)` too heavy | Override to `rgba(0,0,0,0.35)` |
| B4 | P1 | GeneratedGallery.css | White-alpha lightbox close btn invisible | Invert to dark text |
| B5 | P1 | Stage2.css | White-alpha shadow on light surface | Override to `rgba(0,0,0,0.06)` |
| B6 | P1 | SoulInfoCard.css | Modal overlay too heavy | Reduce to `rgba(0,0,0,0.3)` |
| B7 | P1 | QualityGate.css | Parent overlay needs light fix | Override backdrop |
| B8 | P2 | Stage1.css | Scrollbar thumb invisible | Override to `rgba(0,0,0,0.15)` |
| B9 | P2 | TranscriptViewer.css | Active filter white-alpha bg | Override to `rgba(0,0,0,0.06)` |

---

## §15 — Responsive System

**Wireframe:** `gc-v4-mobile-responsive.jsx` (611 lines)
**Output:** `gc-responsive.css`

### Breakpoints

| Name | Range | Target |
|------|-------|--------|
| Mobile | < 640px | Phones |
| Tablet | 640-1023px | Tablets, small laptops |
| Desktop | ≥ 1024px | Full desktop |

### Screen-by-Screen Responsive Rules

**Sidebar:**
- `< 640px`: Hidden. Hamburger (44×44) → full-screen overlay. z-index: 200.
- `640-1023px`: Collapsed 56px icon rail. Hover expands 260px overlay.
- `≥ 1024px`: Fixed 260px expanded. Collapse toggle in footer.

**Landing / Mode Selection:**
- `< 640px`: Cards stack 1-col. Hero 32px. Padding 21px. Recent sims 1-col.
- `640-1023px`: Cards 2-col (max-width 600px). Recent sims 2-col.
- `≥ 1024px`: Full spec: 2-col cards 800px max, 3-col recent sims.

**Simulation Launcher:**
- `< 640px`: Single column. Step indicator → minimal dots. Fixed bottom CTA 64px.
- `640-1023px`: Two-column (config + preview). Step bar horizontal.
- `≥ 1024px`: Full 3-col (steps + config + live preview).

**Dashboard (Tab Shell):**
- `< 640px`: Tabs → scrollable horizontal strip. Full-width content. Top bar compact (40px).
- `640-1023px`: Standard tabs. Side panel collapses to bottom sheet.
- `≥ 1024px`: Full layout with optional side panel.

**LLM Council Stages:**
- `< 640px`: Model panels stack vertically. Round nav becomes swipe carousel.
- `640-1023px`: 2-column model grid.
- `≥ 1024px`: 4-column model grid.

**DA Arena:**
- `< 640px`: Prosecution and Defense panels stack vertically. Verdict bar full width. Sidebar becomes bottom sheet.
- `640-1023px`: Split panel maintained, sidebar collapsed to 240px.
- `≥ 1024px`: Full split panel + 320px sidebar.

**Gallery:**
- `< 640px`: 1-column. Filter chips → horizontal scroll. Lightbox → full screen.
- `640-1023px`: 2-column masonry.
- `≥ 1024px`: 3-column masonry.

**Concept Cards:**
- `< 640px`: Full-width single column. Score bars at 100% width. Expand goes full-card.
- `640-1023px`: 1-column with wider row layout.
- `≥ 1024px`: 2-column grid.

### Global Touch Targets
- Minimum touch target: 44×44px on mobile
- Minimum tap gap: 8px between interactive elements
- Scroll areas: `-webkit-overflow-scrolling: touch`

### CSS Pattern
```css
/* Mobile-first base styles */
.gc-grid { display: grid; grid-template-columns: 1fr; gap: 16px; }

@media (min-width: 640px) {
  .gc-grid { grid-template-columns: repeat(2, 1fr); gap: 20px; }
}

@media (min-width: 1024px) {
  .gc-grid { grid-template-columns: repeat(3, 1fr); }
}
```

---

## §16 — Implementation File Map

### Phase 1: Foundation (Week 1)

| File | What | From Wireframe |
|------|------|----------------|
| `src/tokens/colors.js` | T + LIGHT + MODEL_COLORS | §2.2, §2.3 |
| `src/tokens/typography.js` | font stacks + scale | §2.4 |
| `src/tokens/spacing.js` | spacing scale | §2.5 |
| `src/tokens/motion.js` | DURATIONS + EASINGS | §3.1, §3.2 |
| `src/icons/IC.jsx` | 35 SVG icons | §2.1 |
| `src/styles/gc-reset.css` | Minimal reset | — |
| `src/styles/gc-tokens.css` | CSS custom properties | §2.2-2.6 |
| `src/styles/gc-motion.css` | 17 keyframes + utilities | §3.3, WF#12 |
| `public/fonts/` | OmniPresent + Inter + JetBrains | §2.4 |

### Phase 2: Primitives (Week 1-2)

| File | What | From Wireframe |
|------|------|----------------|
| `src/primitives/Btn.jsx` | Button (primary/ghost/outline) | §2.7 |
| `src/primitives/Badge.jsx` | Inline label | §2.7 |
| `src/primitives/MonoLabel.jsx` | Mono uppercase label | §2.7 |
| `src/primitives/Card.jsx` | Surface container | §2.7 |
| `src/primitives/ScoreBar.jsx` | Horizontal progress | §2.7 |
| `src/primitives/ScoreRing.jsx` | SVG circular score | §2.7 |
| `src/primitives/StatusBadge.jsx` | Dot + label status | §2.7 |

### Phase 3: Layout (Week 2)

| File | What | From Wireframe |
|------|------|----------------|
| `src/layout/Shell.jsx` | App Shell — sidebar + topbar + content outlet | §5.5, WF#6 |
| `src/layout/Sidebar.jsx` | Nav sidebar (3 states: hidden/collapsed/expanded) | §5.5, WF#6 |
| `src/layout/TopBar.jsx` | 48px header with breadcrumbs | §5.5, WF#2, WF#7 |
| `src/layout/ModeSwitch.jsx` | Create/Explore toggle | §5.5 |

### Phase 4: Screens (Weeks 2-4)

| File | What | From Wireframe |
|------|------|----------------|
| `src/screens/Landing.jsx` | Mode select + recent | WF#6 |
| `src/screens/Launcher.jsx` | 4-step wizard | WF#1 |
| `src/screens/Dashboard.jsx` | Tab shell | WF#2, WF#7 |
| `src/screens/Overview.jsx` | Winner + concepts + transcript | WF#8, WF#9 |
| `src/screens/Stage1Create.jsx` | Ideation round | WF#3 |
| `src/screens/Stage2Critique.jsx` | Evaluation round | WF#3 |
| `src/screens/Stage3Synthesize.jsx` | Final synthesis | WF#3 |
| `src/screens/DAArena.jsx` | Courtroom split panel + verdict bar | §10, WF#4 |
| `src/screens/DACommandCenter.jsx` | DA config panel | §13, WF#10 |
| `src/screens/LLMCouncil.jsx` | Multi-model comparison + anonymous reveal | §9.5, WF#14 |
| `src/screens/Gallery.jsx` | Media grid + lightbox | §11, WF#5 |
| `src/screens/ConceptCard.jsx` | Reusable concept display | WF#8 |

### Phase 5: Polish (Weeks 4-5)

| File | What | From Wireframe |
|------|------|----------------|
| `src/styles/gc-light-overrides.css` | Light mode theme | WF#11 |
| `src/styles/gc-responsive.css` | Breakpoint overrides | WF#13 |
| Accessibility audit | ARIA, focus management, contrast | §17 |
| Performance audit | Bundle size, lazy loading | — |

---

## §17 — 5-Week Implementation Plan

### Week 1: Foundation + Primitives
- [ ] Set up Vite + React project scaffold
- [ ] Install fonts (OmniPresent, Inter, JetBrains Mono)
- [ ] Create token files (colors, typography, spacing, motion)
- [ ] Build IC.jsx (35 icons) from wireframe icon blocks
- [ ] Build all 7 primitive components
- [ ] Create gc-tokens.css with CSS custom properties
- [ ] Create gc-motion.css with 17 keyframes
- [ ] Create gc-reset.css

### Week 2: Layout + Landing + Launcher
- [ ] Build Shell, Sidebar, TopBar
- [ ] Implement sidebar 3-state responsive (hidden/collapsed/expanded)
- [ ] Build Landing screen (mode cards + recent sims)
- [ ] Build Launcher 4-step wizard
- [ ] Build DACommandCenter panel (step 4 of launcher)
- [ ] Wire up mock data for all launcher options

### Week 3: Dashboard + Core Screens
- [ ] Build Dashboard tab shell
- [ ] Build Overview tab (winner + concept grid + transcript)
- [ ] Build ConceptCard with expand/collapse
- [ ] Build Stage1Create, Stage2Critique, Stage3Synthesize
- [ ] Build LLM Council comparison view (anonymous → reveal flow)
- [ ] Implement round navigation within stages
- [ ] Wire mock simulation data

### Week 4: DA Arena + Gallery + Integration
- [ ] Build DAArena courtroom layout (ProsecutionPanel + DefensePanel)
- [ ] Build VerdictBar (full-width bottom)
- [ ] Build rating system within defense panel
- [ ] Build TrainingReport tab
- [ ] Build Gallery with masonry grid
- [ ] Build Lightbox overlay
- [ ] Implement filter system (concept + media type)
- [ ] Connect all screens via React Router

### Week 5: Polish + Themes + Responsive
- [ ] Implement light mode (gc-light-overrides.css)
- [ ] Fix all 9 light-mode bugs from audit
- [ ] Implement responsive breakpoints (gc-responsive.css)
- [ ] Test all screens at 3 breakpoints
- [ ] Accessibility: ARIA labels, focus management, keyboard navigation
- [ ] Performance: lazy load gallery images, code-split routes
- [ ] Final visual QA against wireframes

---

## §18 — Accessibility Requirements

### WCAG 2.1 AA Targets
- **Color contrast:** Minimum 4.5:1 for body text, 3:1 for large text (≥18px)
- **Focus indicators:** 2px solid T.flame outline, 2px offset, on all interactive elements
- **Keyboard navigation:** Tab order follows visual flow, Escape closes modals/overlays
- **Screen readers:** All icons have `aria-hidden="true"`, text alternatives via adjacent labels
- **Reduced motion:** Complete suppression via `prefers-reduced-motion: reduce`
- **Touch targets:** Minimum 44×44px on mobile

### Component ARIA
- Tabs: `role="tablist"`, `role="tab"`, `aria-selected`, `aria-controls`
- DA Arena panels: `role="region"`, `aria-label` for prosecution/defense sections
- Modal/Lightbox: `role="dialog"`, `aria-modal="true"`, focus trap, return focus on close
- Score components: `role="meter"`, `aria-valuemin`, `aria-valuemax`, `aria-valuenow`
- Status badges: `role="status"`, `aria-live="polite"` for dynamic updates

---

## §19 — Testing Checklist

### Visual QA (per screen)
- [ ] Matches wireframe layout at desktop width
- [ ] All text uses correct font family/size/weight
- [ ] No boxShadow in dark mode
- [ ] Accent colors match token values
- [ ] Icons render at 24×24 with 1.5px stroke
- [ ] Spacing matches 4px grid

### Functional QA
- [ ] Tab navigation works with keyboard
- [ ] DA Arena courtroom panels render simultaneously, verdict bar updates on navigation
- [ ] Lightbox opens/closes correctly
- [ ] Filter system updates gallery grid
- [ ] Step wizard advances/retreats correctly
- [ ] Theme toggle switches all tokens

### Responsive QA
- [ ] All screens tested at 375px (iPhone SE)
- [ ] All screens tested at 768px (iPad)
- [ ] All screens tested at 1440px (desktop)
- [ ] Sidebar state correct at each breakpoint
- [ ] Touch targets ≥ 44px on mobile
- [ ] No horizontal scroll at any breakpoint

---

## §20 — Known Issues & Remaining Work

### Minor Token Inconsistencies (from audit)
1. `gc-v4-dashboard-redesign.jsx` — 1 remaining `boxShadow` in hover state → remove
2. `gc-v4-gallery-redesign.jsx` — 1 remaining `boxShadow` in lightbox → remove
3. `gc-v4-light-mode-rework.jsx` — `boxShadow` intentionally allowed (light mode only)
4. 7 of 13 wireframes missing `font` block → add during implementation
5. 2 files not yet using OmniPresent → update headers to use display font

### Not Yet Wireframed
- Settings screen (theme, account, API keys)
- Onboarding / first-run experience
- Error states (API failure, rate limit, model timeout)
- Empty states (no simulations, no gallery items)
- Loading skeletons (shimmer patterns defined in motion system)
- Real-time WebSocket updates during simulation

---

*End of Blueprint — Genesis Chamber V4.1*
*Total specification: 13 wireframes → 20 sections → single source of truth*
