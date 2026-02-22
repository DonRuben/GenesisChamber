# Genesis Chamber V4 — Claude Code Init Prompt

> **Paste this entire file as your first message in Claude Code.**
> The full architecture blueprint is at `docs/gc-v4-claude-code-blueprint.md` — read it before writing any code.

---

## PROJECT

You are building **Genesis Chamber V4** — a multi-AI creative engine with two modes:

1. **LLM Council** — anonymous multi-model comparison with reveal, voting, and synthesis
2. **Genesis Chamber** — AI simulation launcher with concept ideation, critique, and DA Arena

Design system: **Tobias van Schneider editorial** — flat surfaces, extreme negative space, borderLeft accents, no shadows, no gradients, no glows.

## TECH STACK

```
React 18 + Vite
react-router-dom (routing)
zustand (state)
Inline styles only (no CSS modules, no Tailwind)
```

## SCAFFOLD

```bash
npm create vite@latest genesis-chamber-v4 -- --template react
cd genesis-chamber-v4
npm install react-router-dom zustand
```

## REFERENCE FILES

All design wireframes and documentation are in `docs/design-reference/`. These are the **source of truth** for every component's markup, data model, interaction pattern, and visual structure. Consult them before writing any implementation code.

```
docs/
├── gc-v4-claude-code-blueprint.md    ← ARCHITECTURE BIBLE (1333 lines) — read this FIRST
├── gc-v4-figma-tokens.json           ← Token values (colors, spacing, fonts, layout, motion)
├── gc-v4-design-system.pdf           ← Visual reference (component inventory, anatomy)
├── gc-v4-figma-build-kit.pdf         ← Screen-by-screen specs
└── design-reference/
    ├── gc-v4-app-shell.jsx              (462 lines) — Shell, Sidebar, TopBar, ModeSwitch
    ├── gc-v4-llm-council.jsx            (494 lines) — Anonymous comparison, reveal, synthesis
    ├── gc-v4-llm-council-stages.jsx     (455 lines) — Create/Critique/Synthesize stages
    ├── gc-v4-da-arena-redesign.jsx      (619 lines) — Courtroom: Prosecution + Defense + Verdict
    ├── gc-v4-da-command-center.jsx       (597 lines) — DA config panel (personas, aggression)
    ├── gc-v4-launcher-redesign.jsx       (787 lines) — 4-step simulation wizard
    ├── gc-v4-dashboard-redesign.jsx      (589 lines) — Simulation dashboard shell
    ├── gc-v4-dashboard-tab-restructure.jsx (396 lines) — Tab navigation system
    ├── gc-v4-overview-polish.jsx         (361 lines) — Simulation overview screen
    ├── gc-v4-concept-cards-hierarchy.jsx (580 lines) — Concept card component
    ├── gc-v4-gallery-redesign.jsx        (268 lines) — Media gallery + lightbox
    ├── gc-v4-information-architecture.jsx (229 lines) — Landing screen
    ├── gc-v4-motion-system.jsx           (366 lines) — 17 keyframe animations
    ├── gc-v4-light-mode-rework.jsx       (365 lines) — Light theme overrides
    └── gc-v4-mobile-responsive.jsx       (611 lines) — Breakpoint system
```

## FOLDER STRUCTURE (Target)

```
src/
├── design/
│   ├── tokens.js              # T object (dark), TLight (light), font, MODEL_COLORS
│   ├── icons.jsx              # IC object — 35 inline SVG icons, 24×24, 1.5px stroke
│   ├── shared.jsx             # Tag, Dots, ScoreRing, VerdictBadge, ModelDot, MonoLabel
│   └── fonts.css              # @font-face for OmniPresent
├── components/
│   ├── shell/
│   │   ├── AppShell.jsx       # Layout wrapper: Sidebar + TopBar + content outlet
│   │   ├── Sidebar.jsx        # 3-state: hidden (0px) / collapsed (56px) / expanded (260px)
│   │   └── TopBar.jsx         # 48px header with breadcrumbs
│   ├── council/
│   │   ├── LLMCouncil.jsx     # Anonymous comparison → reveal → voting → synthesis
│   │   ├── PresetBar.jsx      # Compare/Analyze/Brainstorm/Evaluate/Debate
│   │   └── SynthesisPanel.jsx # Collapsible merged output
│   ├── arena/
│   │   ├── DAArena.jsx        # Courtroom: ProsecutionPanel + DefensePanel + VerdictBar
│   │   ├── ProsecutionPanel.jsx
│   │   ├── DefensePanel.jsx
│   │   ├── VerdictBar.jsx
│   │   ├── TrainingReport.jsx
│   │   └── DACommandCenter.jsx
│   ├── chamber/
│   │   ├── Launcher.jsx       # 4-step wizard
│   │   ├── Dashboard.jsx      # Tab shell
│   │   ├── Overview.jsx
│   │   ├── Gallery.jsx
│   │   └── ConceptCard.jsx
│   └── stages/
│       ├── StageCreate.jsx
│       ├── StageCritique.jsx
│       └── StageSynthesize.jsx
├── stores/
│   ├── appStore.js
│   ├── councilStore.js
│   ├── chamberStore.js
│   └── arenaStore.js
├── hooks/
│   ├── useKeyboard.js
│   └── useMediaQuery.js
├── data/
│   └── mock.js
├── App.jsx
├── main.jsx
└── index.css
```

## DESIGN RULES — NON-NEGOTIABLE

| # | Rule |
|---|------|
| 1 | **No box-shadow** — ever. Use `border: 1px solid T.border` |
| 2 | **No gradients** — flat solid colors only |
| 3 | **No glows, no neon, no glassmorphism** — pure flat surfaces |
| 4 | **`borderLeft: 2px solid [accent]`** — the ONLY accent pattern for active/selected |
| 5 | **`borderRadius: 8px`** on cards, 4-6px on small elements, `9999px` on pills |
| 6 | **OmniPresent** — display headings only |
| 7 | **JetBrains Mono** — all scores, timestamps, metadata, labels |
| 8 | **Inter** — all body text |
| 9 | **MonoLabel** — `fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase"` |
| 10 | **Extreme negative space** — minimum 24px between sections |
| 11 | **Accent colors** — flame `#F27123`, cyan `#00D9FF`, gold `#D4A853`, magenta `#E5375E`, green `#34D399`, purple `#8B5CF6` |
| 12 | **Transitions** — `0.15s` hover, `cubic-bezier(0.16,1,0.3,1)` layout |
| 13 | **Icons** — 24×24, 1.5px stroke, `currentColor`, inline SVG (no libraries) |
| 14 | **Buttons** — ghost (1px border) or text-only + borderLeft. NEVER full-color bg |

## CRITICAL: DA ARENA = COURTROOM, NOT FLASHCARDS

Split-panel courtroom layout:
- **Left**: Prosecution (T.magenta borderLeft) — fatal flaw, weaknesses always visible, one-change fix
- **Right**: Defense (T.cyan borderLeft) — defense text, verdict notes, inline rating buttons
- **Bottom**: Verdict bar (dynamic color) — verdict label + score change (from → to)
- **Sidebar**: Threat ScoreRing, aggression meter, challenge list
- **NO card flipping, NO 3D transforms, NO perspective, NO rotateY**

## IMPLEMENTATION ORDER

**Phase 1 — Foundation (Day 1):** Extract tokens, icons, shared primitives, index.css
**Phase 2 — App Shell (Day 1-2):** AppShell + Sidebar + TopBar + routing
**Phase 3 — LLM Council (Day 2-3):** Anonymous cards → reveal → voting → synthesis
**Phase 4 — DA Arena (Day 3-4):** Courtroom panels + verdict bar + training report
**Phase 5 — Chamber (Day 4-5):** Launcher + Dashboard + Overview + Gallery
**Phase 6 — Polish (Day 5-6):** Light mode + responsive + motion

## STATE MANAGEMENT

Zustand. Pattern:

```javascript
import { create } from 'zustand';

export const useAppStore = create((set) => ({
  mode: 'council',
  theme: 'dark',
  sidebarState: 'expanded',
  setMode: (mode) => set({ mode }),
  toggleTheme: () => set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),
  setSidebar: (state) => set({ sidebarState: state }),
}));
```

## FONT

Download OmniPresent to `public/fonts/OmniPresent.woff`:
```
https://cdn.jsdelivr.net/gh/DonRuben/Hosting-Assets-Externally@main/Fonts/Font-%20OmniPresent%20Main/OmniPresent.woff
```

## START

Read `docs/gc-v4-claude-code-blueprint.md` first. Then Phase 1. Reference `docs/design-reference/*.jsx` for exact markup. Every pixel follows the 14 rules.
