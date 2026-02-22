# CLAUDE.md — Genesis Chamber V4

Technical reference for the Genesis Chamber V4 frontend. **Last updated: 2026-02-22. V4 Phase 7 — Full rewrite for V4 SPA.**

## Project Overview

Genesis Chamber is a multi-persona AI creative simulation engine. V4 is a **pure frontend React SPA** — no backend, no API calls, no database. All data is mock. The app demonstrates the full UX across three modes:

1. **LLM Council** — Multi-model deliberation (3-stage: respond, rank, synthesize)
2. **Genesis Chamber** — Full creative simulation (launcher, dashboard, gallery)
3. **DA Arena** — Devil's Advocate post-simulation review (courtroom flashcard UI)

**Current status:** V4 frontend complete (Phases 1-7). 68 source files, dark/light themes, motion system, responsive layout, Vercel deployment config.

**Directory:** `genesis-chamber-v4/` (NOT `frontend/` — that's V3)

## Tech Stack

| Layer | Tool | Version |
|-------|------|---------|
| Framework | React | 19.2.0 |
| Build | Vite | 7.3.1 |
| State | Zustand | 5.0.11 |
| Routing | React Router | 7.13.0 |
| Styling | Inline styles via `useTokens()` | — |
| CSS | Only `gc-motion.css`, `fonts.css`, `index.css` | — |
| Icons | Inline SVG (`icons.jsx`) | — |
| Linting | ESLint | 9.39.1 |

No CSS-in-JS libraries, no Tailwind, no component libraries. All styling is inline style objects using design tokens.

## Folder Structure

```
genesis-chamber-v4/src/
├── App.jsx                    # BrowserRouter + route definitions
├── main.jsx                   # React entry point
├── index.css                  # Global resets + markdown styles
│
├── components/                # 49 components in 5 groups
│   ├── Landing.jsx            # Landing page (1 file)
│   ├── shell/                 # App chrome (3 files)
│   ├── council/               # LLM Council mode (8 files)
│   ├── arena/                 # DA Arena mode (7 files)
│   └── chamber/               # Genesis Chamber mode (30 files)
│
├── data/                      # Mock data (1 file)
│   └── mock.js
│
├── design/                    # Design system (5 files)
│   ├── tokens.js              # T, TLight, font, fontSize, spacing, radius, motion, layout, MODEL_COLORS
│   ├── shared.jsx             # 15 reusable primitives
│   ├── icons.jsx              # IC object with 40+ SVG icons
│   ├── gc-motion.css          # Keyframes + utility classes
│   └── fonts.css              # @font-face declarations
│
├── hooks/                     # Custom hooks (6 files)
│   ├── useTokens.js           # Theme-aware token resolver
│   ├── useMediaQuery.js       # Responsive breakpoints
│   ├── useKeyboard.js         # Keyboard shortcut registration
│   ├── useSwipe.js            # Touch gesture detection
│   ├── useReducedMotion.js    # Accessibility motion preference
│   └── index.js               # Barrel export
│
└── stores/                    # Zustand stores (4 files)
    ├── appStore.js            # Mode, theme, sidebar
    ├── councilStore.js        # Council question, presets, models
    ├── chamberStore.js        # Launcher, dashboard, gallery state
    └── arenaStore.js          # DA interactions, ratings, navigation
```

**Total: 68 source files** (49 components + 5 design + 6 hooks + 4 stores + 1 data + 3 root)

## Route Map

All routes render inside `<AppShell />` (sidebar + topbar wrapper).

| Path | Component | Description |
|------|-----------|-------------|
| `/` | `Landing` | Home — mode cards, recent sims, feature grid |
| `/council` | `LLMCouncil` | Multi-model deliberation interface |
| `/launch` | `Launcher` | Simulation configuration wizard |
| `/sim/:id` | `Dashboard` | Live simulation monitoring + results |
| `/sim/:id/da` | `DAArena` | DA interaction review (courtroom UI) |
| `/sim/:id/gallery` | `Gallery` | Generated media browser |
| `*` | `NotFound` | 404 page |

SPA rewrites configured in root `vercel.json` — all paths serve `index.html`.

## Component Inventory

### Shell (3 files) — `components/shell/`
| Component | Description |
|-----------|-------------|
| `AppShell` | Layout wrapper — sidebar + topbar + `<Outlet />` |
| `Sidebar` | Left nav — mode switch, conversation list, theme toggle |
| `TopBar` | Top bar — hamburger menu, search, breadcrumb |

### Landing (1 file) — `components/Landing.jsx`
Home page with mode selection cards (Council / Genesis), recent simulations list, feature grid with icon cards.

### Council (8 files) — `components/council/`
| Component | Description |
|-----------|-------------|
| `LLMCouncil` | Main orchestration — routes between landing/conversation states |
| `LandingState` | Initial state — preset bar + chat input |
| `PresetBar` | Horizontal preset selector (compare/analyze/brainstorm/evaluate/debate) |
| `ChatInput` | Text input with model selector and send button |
| `ConversationView` | 3-stage display — responses, rankings, synthesis |
| `ResponseCard` | Individual model response with score ring and anonymization |
| `SynthesisPanel` | Chairman synthesis display with ranking bars |
| `SettingsPanel` | Model toggles + anonymization + thinking mode config |

### Arena (7 files) — `components/arena/`
| Component | Description |
|-----------|-------------|
| `DAArena` | Main arena — courtroom mode (flashcard) + report mode |
| `DACommandCenter` | DA configuration panel — style, aggression, focus areas |
| `ProsecutionPanel` | DA attack display — fatal flaw, weaknesses, demanded change |
| `DefensePanel` | Creative defense display — defense text, strategy |
| `VerdictBar` | Verdict visualization — accepted/partial/insufficient/no-defense |
| `TrainingReport` | Training analytics — effectiveness stats + suggestions |
| `index.js` | Barrel export: `{ DAArena, DACommandCenter }` |

### Chamber (30 files) — `components/chamber/`

**Launcher (6):**
| Component | Description |
|-----------|-------------|
| `Launcher` | Main launcher orchestrator — routes entry/quick/custom |
| `LauncherEntry` | Mode selection — quick start vs custom config |
| `LauncherQuick` | Quick-start — preset select + brief + launch |
| `LauncherCustom` | Full config — participants, DA, presets, brief |
| `PresetCard` | Preset card with icon, description, stats |
| `BriefInput` | Creative brief textarea with token counter |

**Dashboard (6):**
| Component | Description |
|-----------|-------------|
| `Dashboard` | Main dashboard — tabs + sidebar + content routing |
| `DashSidebar` | Left sidebar — participant list + quick stats |
| `Overview` | Case study overview — brief, participants, winner, stats |
| `GroupedTabBar` | Desktop tab navigation with grouped sections |
| `MobileTabBar` | Mobile bottom tab bar |
| `Breadcrumb` | Navigation breadcrumb with simulation name |

**Concepts (7):**
| Component | Description |
|-----------|-------------|
| `ConceptCard` | Concept display — headline, tagline, scores, evolution |
| `ConceptGrid` | Grid layout for concept cards |
| `CritiqueCard` | Peer critique — strengths, weaknesses, one change |
| `WinnerSpotlight` | Winner highlight with gold accent + score ring |
| `LeaderCard` | Leadership persona (moderator/evaluator/DA) |
| `PersonaChip` | Small persona identifier — avatar + name + model dot |
| `ParticipantList` | Full roster with scores and status |

**Gallery (7):**
| Component | Description |
|-----------|-------------|
| `Gallery` | Main gallery — view switcher + filter + search |
| `GalleryGrid` | Masonry-style grid of media cards |
| `GalleryConceptView` | Media grouped by concept |
| `GalleryCompareView` | Side-by-side comparison (two items) |
| `MediaCard` | Individual media item — image/video thumbnail + metadata |
| `MediaPreview` | Inline media preview expansion |
| `Lightbox` | Full-screen media viewer overlay |

**Utility (4):**
| Component | Description |
|-----------|-------------|
| `StageProgress` | Round/stage progress tracker with stage dots |
| `QuickStats` | Statistics row — rounds, concepts, DA attacks, media |
| `QuickActions` | Action buttons — export, gallery, DA arena |
| `index.js` | Barrel export: `{ Launcher, Dashboard, Gallery }` |

## Store Structure

### `appStore` — Global State
```
mode:         'council' | 'genesis'
theme:        'dark' | 'light'
sidebarState: 'hidden' | 'collapsed' | 'expanded'
```
**Actions:** `setMode(m)`, `toggleTheme()`, `setSidebar(s)`, `toggleSidebar()`
**Persistence:** `theme` saved to `localStorage('gc-v4-theme')`, falls back to system preference.

### `councilStore` — LLM Council
```
view:          'landing' | 'conversation'
question:      string
preset:        object | null
revealed:      boolean
showSynthesis: boolean
settingsOpen:  boolean
anonymized:    boolean
activeModels:  string[]          # e.g. ['claude', 'gpt4o', 'gemini', 'deepseek']
followUp:      string
```
**Actions:** `setView`, `setQuestion`, `setPreset`, `toggleReveal`, `toggleSynthesis`, `toggleSettings`, `setAnonymized`, `toggleModel(id)`, `setFollowUp`, `reset()`

### `chamberStore` — Genesis Chamber
```
# Launcher
launchMode:       null | 'quick' | 'custom'
launchStep:       number (0-based)
selectedPreset:   object | null
selectedPersonas: Set<string>
brief:            string
daEnabled:        boolean
daAggression:     'balanced' | 'analytical' | 'aggressive' | 'ruthless'
expandedTeam:     string | null

# Dashboard
simulation:       object (MOCK_SIMULATION)
activeTab:        string
activeSubTab:     string
dashSidebarOpen:  boolean

# Concepts
expandedConceptId: string | null
showEliminated:    boolean

# Gallery
galleryView:      'grid' | 'concept' | 'compare'
galleryFilter:    'all' | 'images' | 'videos'
gallerySearch:    string
lightboxItem:     object | null
compareLeft:      object | null
compareRight:     object | null
compareSide:      'left' | 'right' | null
```
**Key actions:** `setLaunchMode`, `nextStep`, `prevStep`, `togglePersona(id)` (max 16), `selectAllTeam`, `deselectAllTeam`, `resetLauncher`, `setActiveTab(tab, subTab)`, `setGalleryView`, `setLightboxItem`, `setCompareLeft/Right`, `clearCompare`
**Computed:** `getFilteredMedia()` — filters by type + search query

### `arenaStore` — DA Arena
```
interactions:    array (MOCK_DA_INTERACTIONS)
ratings:         { [id]: rating }
trainingReport:  object | null
suggestions:     string | null
selectedIndex:   number
roundFilter:     number | null
```
**Actions:** `setInteractions`, `setRating(id, rating)`, `navigate(delta)` (bounds-checked), `setRoundFilter`, `setView`, `setTrainingReport`, `setSuggestions`, `reset()`
**Computed:** `getFiltered()` — interactions filtered by roundFilter. `getCurrent()` — current flashcard.

## Design Token System

All styling flows through `tokens.js`. Components access tokens via `useTokens()` hook.

### Color Tokens (`T` dark / `TLight` light)
```
bg, surface, surfaceRaised, surfaceHover      # 4-tier surface system
flame, cyan, gold, magenta, green, purple,     # Brand accents
amber, red, blue
text, textSoft, textMuted                      # 3-tier text hierarchy
border, borderHover, borderStrong              # 3-tier borders (rgba)

da.prosecution, da.defense                     # DA Arena accent pair
da.verdict.{strong, partial, insufficient,     # Verdict color scale
            noDefense}
persona.{skeptic, contrarian, realist, purist} # DA persona colors
council.{compare, analyze, brainstorm,         # Council preset colors
         evaluate, debate}
stage.{create, critique, synthesize}           # Stage indicator colors
```

Light theme (`TLight`) overrides surfaces, text, borders, and darkens accents 15-20% for white backgrounds. Brand structure stays identical.

### Typography (`font`)
```
display: OmniPresent -> Inter -> system-ui      # Headings, hero text
body:    Inter -> system-ui                      # Body, data
mono:    JetBrains Mono -> SF Mono -> Menlo      # Labels, scores, tags
```

### Font Sizes (`fontSize`) — px as numbers
```
xs: 9, sm: 11, base: 13, md: 15, lg: 18, xl: 24, xxl: 36
```

### Spacing (`spacing`) — px as numbers
```
xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 36, xxxl: 48
```

### Border Radius (`radius`)
```
sm: 4, md: 6, lg: 8, xl: 12, full: 9999
```

### Motion (`motion`) — Fibonacci timing
```
duration: instant 80ms, fast 130ms, normal 210ms, smooth 340ms, dramatic 550ms, epic 890ms
easing:   default (expo-out), decelerate, accelerate, spring, bounce, sharp, dramatic
```

### Layout (`layout`)
```
sidebar: { hidden: 0, collapsed: 56, expanded: 260 }
topBar:  { height: 48 }
```

### Model Colors (`MODEL_COLORS`)
```
claude: #F27123, gpt4o: #34D399, gemini: #00D9FF,
llama: #8B5CF6, mistral: #D4A853, grok: #E5375E
```

## Shared Primitives — `design/shared.jsx`

15 reusable components, all theme-aware via `useTokens()`:

| Component | Props | Description |
|-----------|-------|-------------|
| `Tag` | `label, color, children` | Mono uppercase pill (status, category labels) |
| `MonoLabel` | `children, icon, color, style` | Section label with optional icon |
| `ModelDot` | `color, size=8` | Colored dot for model identification |
| `ScoreRing` | `score, size=48, strokeWidth=3, color` | SVG circular progress indicator |
| `VerdictBadge` | `verdict` | DA verdict tag (strong/partial/insufficient/no-defense) |
| `Dots` | `count=5, active=0, color, size=6` | Dot severity meter |
| `ScoreBar` | `score, color, height=4` | Horizontal progress bar |
| `Card` | `children, accent, style` | Bordered container with left accent |
| `ScoreChange` | `from, to` | Score delta display (from -> to with color coding) |
| `AggressionMeter` | `severity` | 5-segment meter with level labels (Gentle to Lethal) |
| `TierBadge` | `tier, score` | S/A/B/C grade badge |
| `Btn` | `children, color, secondary, disabled, large, onClick, style` | Button with press animation, 44px mobile touch target |
| `StepNav` | `current, total, labels` | Numbered step indicator with connecting lines |
| `Toggle` | `enabled, onChange, color` | Switch toggle |
| `StatusBadge` | `status` | Running/complete/paused/failed with pulse animation |

## Icon System — `design/icons.jsx`

The `IC` object contains 40+ inline SVG icons. All 24x24, 1.5px stroke, `currentColor`. No icon library dependencies.

**Naming convention:** camelCase keys — `IC.council`, `IC.genesis`, `IC.shield`, `IC.flame`, etc.

**Categories:**
- **Shell & Nav:** `council`, `genesis`, `plus`, `chat`, `settings`, `sun`, `moon`, `panelLeft`, `panelRight`, `search`, `menu`, `x`, `chevDown`, `clock`, `trash`
- **Council Presets:** `compare`, `analyze`, `brainstorm`, `evaluate`, `debate`, `send`
- **Visibility:** `eye`, `eyeOff`
- **Awards:** `trophy`, `star` (filled), `crown`
- **Landing:** `brain`, `bolt` (filled), `swords`, `gallery`, `rocket`, `home`, `chart`, `sliders`, `exportArrow`
- **Actions:** `copy`, `check`, `refresh`, `alert`
- **DA Arena:** `shield`, `flame` (filled), `spark`, `skull`, `award`, `arrowLeft`, `arrowRight`, `chevUp`, `target`, `scale`, `info`
- **Chamber:** `temple`, `factory`, `megaphone`, `clipboard`, `download`, `upload`, `palette`, `play` (filled), `grid`, `columns`, `users`, `briefcase`, `layers`, `fileText`

**Usage:** `<span style={{ fontSize: 18, color: t.cyan }}>{IC.shield}</span>`

Icons inherit `fontSize` and `color` from parent via `1em` width/height and `currentColor`.

## Motion System — `design/gc-motion.css`

### Keyframes (10)
| Name | Effect |
|------|--------|
| `fadeSlideUp` | Fade in + slide up 13px |
| `fadeSlideRight` | Fade in + slide right 13px |
| `scaleIn` | Fade in + scale from 0.95 |
| `badgePop` | Scale 0.5 -> 1.08 -> 1.0 (overshoot) |
| `accentPulse` | Border opacity pulse (2s loop) |
| `ratingPulse` | Scale 1 -> 1.06 -> 1 |
| `launchPulse` | Scale + border-color pulse (890ms loop) |
| `winnerReveal` | Scale + border-width animate in |
| `shimmer` | Background gradient slide (skeleton loading) |
| `pulse` | Opacity 1 -> 0.4 -> 1 |

### Utility Classes (9)
| Class | Animation | Duration |
|-------|-----------|----------|
| `.gc-enter` | fadeSlideUp | 210ms decelerate |
| `.gc-enter-right` | fadeSlideRight | 210ms decelerate |
| `.gc-scale-in` | scaleIn | 340ms spring |
| `.gc-badge-pop` | badgePop | 130ms spring |
| `.gc-skeleton` | shimmer | 1.5s linear infinite |
| `.gc-pulse` | accentPulse | 2s infinite |
| `.gc-winner-reveal` | winnerReveal | 550ms spring |
| `.gc-launch-pulse` | launchPulse | 890ms infinite |
| `.gc-rating-pulse` | ratingPulse | 210ms spring |

### Stagger
`.gc-stagger` — Children get incremental 50ms delays (up to 8 items). Uses `fadeSlideUp`.

### Reduced Motion
`@media (prefers-reduced-motion: reduce)` kills all animations/transitions to 0.01ms.

Light theme override: `.gc-skeleton` swaps to dark-on-light gradient.

## Responsive System

### Breakpoints
| Name | Width | Hook |
|------|-------|------|
| Mobile | < 640px | `useIsMobile()` |
| Tablet | 640-1023px | `useIsTablet()` |
| Desktop | >= 1024px | `useIsDesktop()` |
| Wide | >= 1440px | via `useMediaQuery('(min-width: 1440px)')` |

Constants exported: `MOBILE = 640`, `TABLET = 1024`, `WIDE = 1440`

### Touch Targets
`Btn` enforces 44px `minHeight` on mobile via `useIsMobile()`.

### Sidebar State Sync
- Mobile: sidebar hidden by default, slides in as overlay
- Tablet: sidebar collapsed (56px icons only)
- Desktop: sidebar expanded (260px full nav)

### Swipe Gestures
`useSwipe(ref, { onSwipeLeft, onSwipeRight, onSwipeDown, threshold })` — touch gesture detection. Only activates on mobile. Uses passive event listeners. 50px default threshold.

## Theme System

- **Dark** (default): `T` tokens — `#111113` bg, light text
- **Light**: `TLight` overrides — `#F2F2F7` bg, dark text, darkened accents
- **Toggle**: Sidebar footer (sun/moon icon), calls `appStore.toggleTheme()`
- **Persistence**: `localStorage('gc-v4-theme')`, falls back to `prefers-color-scheme` system preference
- **Resolution**: `useTokens()` reads `appStore.theme`, returns `{ ...T, ...TLight }` for light or `T` for dark
- **HTML attribute**: `[data-theme="light"]` set on `<html>` for CSS overrides (skeleton gradient)

## Mock Data — `data/mock.js`

All exports with their shapes:

| Export | Type | Description |
|--------|------|-------------|
| `CONVERSATIONS` | array | Sidebar items — id, title, mode, updated, status |
| `RECENT_SIMS` | array | Landing recent — title, mode, date, models, status |
| `MODELS` | array | Council models — id, name, color, letter |
| `PRESETS` | array | Council presets — key, label, desc, color, placeholder |
| `MOCK_RESPONSES` | array | Model responses — modelId, text, score |
| `MOCK_SYNTHESIS` | string | Chairman synthesis markdown |
| `STAGE_CONFIG` | object | Stage labels/colors keyed by stage number |
| `MOCK_RANKINGS` | array | Model rankings — model, avgRank, pct, color |
| `MOCK_DA_INTERACTIONS` | array | 5 DA interactions — attack, defense, verdict, rating |
| `DA_STYLES` | array | DA styles — socratic, aggressive, balanced |
| `DA_FOCUS_AREAS` | array | Focus areas — feasibility, ethics, originality, market, technical |
| `DA_PRESETS` | array | DA presets — light/full/trial with intensity + focus |
| `DA_RATINGS` | array | Rating config — brilliant, effective, weak, unfair |
| `DA_PERSONAS` | object | Persona labels — skeptic, contrarian, realist, purist |
| `MOCK_PRESETS` | array | Simulation presets — quick_test, message_lab, genesis_chamber, assembly_line |
| `MOCK_TEAMS` | array | 3 teams with persona arrays (17 personas total) |
| `MOCK_LEADERSHIP` | object | Moderator (Jobs), evaluator (Ive), DA |
| `MOCK_STAGES` | array | 6 stages — create, critique, DA defense, synthesize, refine, present |
| `MOCK_SIMULATION` | object | Full simulation state — config, concepts, critiques, participants, media, stats |
| `MOCK_TAB_GROUPS` | array | Dashboard tab structure — hero, council, media, DA, export |

## Soul Document Roster (19 Personas)

These define the conceptual participants in mock data. Each persona has a soul document (~400-1400 lines) in `souls/` at project root.

### Marketing & Strategy Team (5)
| Persona | Model | Color |
|---------|-------|-------|
| David Ogilvy | gemini-3-pro | #F59E0B |
| Claude Hopkins | claude-sonnet | #3B82F6 |
| Leo Burnett | gpt-5.1 | #10B981 |
| Mary Wells Lawrence | llama-4 | #EC4899 |
| Gary Halbert | grok-4 | #EF4444 |

### Design & Visual Team (6)
| Persona | Model | Color |
|---------|-------|-------|
| Paul Rand | gemini-3-pro | #8B5CF6 |
| Paula Scher | gpt-5.1 | #F97316 |
| Saul Bass | claude-sonnet | #DC2626 |
| Susan Kare | llama-4 | #06B6D4 |
| Rob Janoff | grok-4 | #A3E635 |
| Tobias van Schneider | gemini-3-pro | #D946EF |

### Business & Strategy Team (5)
| Persona | Model | Color |
|---------|-------|-------|
| Elon Musk | grok-4 | #1DA1F2 |
| Jeff Bezos | claude-sonnet | #FF9900 |
| Warren Buffett | gemini-3-pro | #374151 |
| Richard Branson | llama-4 | #E11D48 |
| Dietrich Mateschitz | deepseek | #1E40AF |

### Leadership (flexible assignment)
| Persona | Default Role | Model | Color |
|---------|-------------|-------|-------|
| Steve Jobs | Moderator | claude-opus | #6B7280 |
| Jony Ive | Evaluator | claude-sonnet | #9CA3AF |

### Special Roles
| Persona | Role | Model | Color |
|---------|------|-------|-------|
| Advocatus Diaboli | Devil's Advocate | grok-4 | #DC2626 |

## Key Design Decisions

### Inline Styles Over CSS
All component styling uses inline style objects fed by `useTokens()`. This ensures:
- Theme switching is instant (no class toggling, no CSS variable recalculation)
- No CSS specificity conflicts
- Tokens are the single source of truth
- Only 3 CSS files exist: `gc-motion.css` (animations can't be inline), `fonts.css` (@font-face), `index.css` (resets)

### Five-Stage Round System (+ Optional DA Defense)
1. **CREATE** — Independent concept generation (parallel, soul-loaded)
2. **CRITIQUE** — Anonymized peer review + Devil's Advocate
3. **DA DEFENSE** *(optional)* — Creatives defend concepts, DA issues verdicts
4. **SYNTHESIZE** — Moderator direction + evaluator assessment
5. **REFINE** — Directed revision with concept version chaining
6. **PRESENT** — Group presentation

### Anonymized Critique (Sacred Principle)
Concepts labeled "Concept A, B, C" during critique — nobody knows whose is whose. Prevents ego-protection. Creates honest feedback. NEVER break this anonymization in the UI.

### Concept Versioning
Each refinement creates a new concept with a `previous_version_id` linking to the old one. Old concept snapshotted as a `ConceptVersion`. Full evolution chain preserved.

### DA Arena Courtroom UX
- **Prosecution Panel** (left, magenta): DA's attack — fatal flaw, weaknesses, demanded change
- **Defense Panel** (right, cyan): Creative's defense text
- **Verdict Bar** (bottom): Accepted/partial/insufficient/no-defense with color scale
- Navigation: arrows or keyboard (left/right arrows), ratings via 1-4 keys, Space to flip
- Two modes: courtroom (single flashcard focus) and report (scrollable grid)

### Multi-Model Cognitive Diversity
Different mock LLMs represent different cognitive profiles. Model assignments map to `MODEL_COLORS` for visual identification throughout the UI.

### Zustand Over Context
Zustand chosen for zero-boilerplate state management. Four flat stores instead of nested context providers. No reducers, no action types — just `set()` calls.

## Data Flow Diagrams

### App Navigation
```
Landing -> /council (LLM Council)
        -> /launch  (Launcher) -> /sim/:id (Dashboard) -> /sim/:id/gallery (Gallery)
                                                       -> /sim/:id/da     (DA Arena)
```

### Council Flow
```
LandingState (preset + question)
  -> ConversationView
    -> Stage 1: ResponseCards (parallel model responses, anonymized)
    -> Stage 2: Rankings (peer ranking bars)
    -> Stage 3: SynthesisPanel (chairman synthesis)
```

### Chamber Flow
```
Launcher
  -> LauncherEntry (quick vs custom)
    -> LauncherQuick (preset + brief + launch)
    -> LauncherCustom (participants + DA config + brief)
  -> Dashboard
    -> Overview (case study summary)
    -> ConceptGrid -> ConceptCard (with WinnerSpotlight)
    -> CritiqueCard (anonymized peer reviews)
    -> StageProgress (round/stage tracker)
  -> Gallery
    -> GalleryGrid / GalleryConceptView / GalleryCompareView
    -> MediaCard -> Lightbox (full-screen viewer)
```

### Arena Flow
```
DAArena
  -> Courtroom Mode
    -> ProsecutionPanel (DA attack)
    -> DefensePanel (creative defense)
    -> VerdictBar (verdict + revised score)
    -> Rating buttons (brilliant/effective/weak/unfair)
  -> Report Mode
    -> TrainingReport (stats + suggestions)
```

## Design Rules

1. **Token-first styling.** Every color, spacing, and font value comes from `tokens.js` via `useTokens()`. Never hardcode hex values in components.
2. **Inline styles only.** No CSS classes except animation utilities from `gc-motion.css`. No Tailwind, no CSS modules.
3. **Mono uppercase for labels.** All section headers, tags, and metadata use `font.mono`, `textTransform: 'uppercase'`, `letterSpacing: '0.12em'`, `fontSize: 9-10`.
4. **Left border accent.** Cards use `borderLeft: 2px solid {accent}` for color coding, not full borders or backgrounds.
5. **OmniPresent for display.** Headings use `font.display` (OmniPresent), body uses `font.body` (Inter), data uses `font.mono` (JetBrains Mono).
6. **Fibonacci motion.** All animation durations follow the Fibonacci sequence: 80, 130, 210, 340, 550, 890ms. No arbitrary timing values.
7. **44px mobile touch targets.** `Btn` enforces 44px minimum height on mobile. All interactive elements should be easily tappable.
8. **Color hierarchy.** Primary accent: `cyan`. Danger/DA: `magenta`. Winner/premium: `gold`. Success: `green`. Warning: `amber`. Brand: `flame` (OmniPresent orange).
9. **Dark-first design.** Dark theme is default. Light theme is an override layer (`TLight`), not a separate token set.
10. **No component libraries.** Every UI primitive is in `shared.jsx`. No Material UI, no Radix, no shadcn.
11. **Icons via IC object.** All icons are inline SVGs in `icons.jsx`. No icon fonts, no external icon packs.
12. **Barrel exports for groups.** Each component group (`arena/`, `chamber/`) has an `index.js` that exports only the top-level entry components.
13. **Mock data is king.** All UI state comes from `data/mock.js`. Components should never generate fake data inline — add it to mock.js instead.
14. **Reduced motion respect.** `gc-motion.css` includes `prefers-reduced-motion: reduce` media query. Use `useReducedMotion()` hook for JS-driven animations.

## Build & Deployment

### Scripts
```bash
cd genesis-chamber-v4
npm install          # Install dependencies
npm run dev          # Vite dev server (port 5173)
npm run build        # Production build -> dist/
npm run preview      # Preview production build
npm run lint         # ESLint
```

### Vite Config
Minimal — React plugin only. No custom aliases, no proxy, no env variables.

### Vercel Deployment (`vercel.json` at repo root)
```json
{
  "buildCommand": "cd genesis-chamber-v4 && npm install && npm run build",
  "outputDirectory": "genesis-chamber-v4/dist",
  "installCommand": "echo 'install handled in buildCommand'",
  "framework": null,
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```
- `framework: null` — avoids Vercel auto-detection conflicts in monorepo
- `installCommand` as no-op — install handled inside buildCommand after cd
- `rewrites` — critical for BrowserRouter (without SPA rewrite, direct access to `/council`, `/sim/:id/da`, etc. returns 404)

### Font Loading
OmniPresent loaded via `@font-face` in `fonts.css` from CDN. Falls back to Inter then system-ui. Inter and JetBrains Mono loaded via Google Fonts link in `index.html`.

## V4 Gotchas

1. **This is V4, not V3.** The working directory is `genesis-chamber-v4/`, NOT `frontend/`. The `frontend/` directory is the V3 app (Python backend + React frontend). V4 is pure frontend, no backend.

2. **No API calls.** V4 has zero fetch/axios calls. All data comes from `data/mock.js`. Don't add API endpoints or backend references.

3. **Inline styles, not CSS.** If you need to style something, use `useTokens()` and inline style objects. Only use CSS classes for animations (`gc-enter`, `gc-pulse`, etc.).

4. **`useTokens()` is required.** Every component that uses colors must call `const t = useTokens()` and use `t.cyan`, `t.surface`, etc. Never import `T` directly in components — `useTokens()` handles theme resolution.

5. **Font sizes are numbers.** `fontSize` exports are bare numbers (not strings). Use them directly in inline styles: `fontSize: fontSize.sm` gives `fontSize: 11`. Don't append "px".

6. **Motion durations are strings.** Unlike fontSize, `motion.duration` values are strings with units: `'210ms'`. They're designed for CSS `animation-duration` or `transition` properties.

7. **Sidebar state vs breakpoint.** `appStore.sidebarState` ('hidden'/'collapsed'/'expanded') is independent of breakpoints. Components should use `layout.sidebar[sidebarState]` for width calculations, not hardcoded pixel values.

8. **`IC` icons inherit sizing.** Icons use `width="1em"` and `height="1em"`, so they scale with `fontSize` of parent. Set icon size via parent's `fontSize`, not icon props.

9. **DA Arena tab visibility.** In the real app, DA Arena only appears when `config.devils_advocate` is true AND simulation is complete. In V4 mock, it's always visible.

10. **Persona toggle max.** `chamberStore.togglePersona()` caps at 16 personas. The Set won't grow past 16 — additional toggles silently fail.

11. **`getFilteredMedia()` is a method, not state.** Call it as `useChamberStore.getState().getFilteredMedia()`, not as a reactive selector. Same for `arenaStore.getFiltered()` and `getCurrent()`.

12. **Theme detection order.** On first visit: check `localStorage('gc-v4-theme')` then check `prefers-color-scheme` then default to `'dark'`. Subsequent visits use stored preference.

13. **No backend port.** V3 ran backend on port 8001 and frontend on 5173. V4 only has the Vite dev server on 5173. There is no backend to start.
