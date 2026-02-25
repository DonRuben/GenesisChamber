# Phase 9 — Soul Configuration Overhaul + Loading UX
## Complete Implementation Spec (FINAL)

---

## OVERVIEW

9 features, ~12 files, 8 implementation groups (~4.5 hours across 2-3 sessions).

**Features:**
1. Thinking Mode Hierarchy (Global default → per-soul override)
2. Per-Soul Thinking Mode (individual Default/Off/Think/Deep per person)
3. Chairman + Leadership AI Capabilities (own thinking, web search)
4. Dual Roles for Jobs/Ive (leader + participant)
5. Any Persona as Moderator/Evaluator (swap freely)
6. Devil's Advocate Full Config (model, thinking, aggression, focus, strategy)
7. Soul Info Cards (ℹ️ → bio popup for all 18 souls)
8. Premium Loading State (shimmer, progress bar, staggered reveal)
9. Expanded Preset Templates (10 presets in 5 categories)

---

## FEATURE 1: Thinking Mode Hierarchy

### The Problem
Global Thinking Mode exists (Off/Thinking/Deep) but no clarity on how it interacts with per-soul overrides. If global = "Deep" but Paul Rand = "Off" individually — what happens?

### Hierarchy Model

```
GLOBAL THINKING MODE (AI Capabilities section)
  │  Sets DEFAULT for ALL participants
  │  Label: "Default for all — override per soul in Model Assignment"
  │  Shows: "X of Y using default" live counter
  │
  ├─ PER-SOUL OVERRIDE (Model Assignment rows)
  │    [Default ↓] [Off] [Think] [Deep]
  │    "Default" = inherits global (shown with ↓ arrow)
  │    Explicit choice = overrides (shown with • dot)
  │
  ├─ CHAIRMAN (Stage 3 synthesis — independent)
  │    Own thinking toggle, not affected by global
  │
  ├─ MODERATOR (runs moderation — independent)
  │    Own thinking toggle in Leadership section
  │
  ├─ EVALUATOR (runs evaluation — independent)
  │    Own thinking toggle in Leadership section
  │
  └─ DEVIL'S ADVOCATE (adversarial — independent)
      Own thinking toggle in DA config section
```

### Resolution Logic

```js
// When building API request, resolve each participant's effective thinking:
const resolveThinking = (participant, globalDefault) => {
  if (participant.thinkingMode === 'default') return globalDefault;
  return participant.thinkingMode;
};

// Example: global='think', Paul Rand='deep', Gary Halbert='off', rest='default'
// → 5 participants get 'think', Rand gets 'deep', Halbert gets 'off'
```

### UI — Global Toggle (SettingsPanel.jsx)

```
THINKING MODE                              5 of 7 using default
[OFF] [THINKING] [DEEP]
↳ Sets default for all participants. Override per soul below.
```

Counter states:
- All default: `"All 7 using default"`
- Some overridden: `"5 of 7 using default"`
- All overridden: `"0 of 7 — all overridden"`

### UI — Per-Soul Override (Model Assignment rows)

```
David Ogilvy    [Claude Sonnet 4.6 ▾]  [Default ↓] [Off] [Think] [Deep]
Paul Rand       [Gemini 3 Pro ▾]       [Default]   [Off] [Think] [Deep •]  ← overridden
Gary Halbert    [GPT-5.2 ▾]            [Default]   [Off •] [Think] [Deep]  ← overridden
```

Active states:
- Default (active): surface-2 bg, muted text, ↓ icon
- Off (active): surface-2 bg, grey text
- Think (active): cyan bg 12%, cyan text, border cyan
- Deep (active): purple bg 12%, purple text, border purple
- Override indicator: small • dot after label text

### Data Model — councilStore.js

```js
// State
defaultThinkingMode: 'off',  // 'off' | 'think' | 'deep'

participants: [
  { soulId: 'david-ogilvy', modelId: '...', thinkingMode: 'default' },
  { soulId: 'paul-rand', modelId: '...', thinkingMode: 'deep' },
],

chairman:  { modelId: '...', thinkingMode: 'off', webSearch: false },
moderator: { soulId: 'steve-jobs', modelId: '...', thinkingMode: 'off', webSearch: false, alsoParticipant: true },
evaluator: { soulId: 'jony-ive', modelId: '...', thinkingMode: 'off', webSearch: false, alsoParticipant: true },
devilsAdvocate: { enabled: true, modelId: '...', thinkingMode: 'off', webSearch: false, ... },

// Actions
setDefaultThinkingMode: (mode) => ...,
setParticipantThinking: (soulId, mode) => ...,  // mode includes 'default'
setChairmanConfig: (updates) => ...,
setModeratorConfig: (updates) => ...,
setEvaluatorConfig: (updates) => ...,
setDAConfig: (updates) => ...,
```

---

## FEATURE 2: Per-Soul Thinking Mode

### PersonaChip.jsx — Visible Badge

```
[PR] Paul Rand    Gemini 3 Pro  🧠Deep  ☑️
```

Badge variants:
- Off: no pill shown (clean)
- Think: cyan pill `🧠 Think`
- Deep: purple pill `🧠🧠 Deep`
- Default inheriting Think: cyan pill `↓ Think` (inheritance arrow)

Only shown when persona is selected.

### LauncherCustom.jsx Step 0 — 4-Button Toggle Per Row

Next to each model dropdown in Model Assignment:
```
[Default ↓] [Off] [Think] [Deep]
```

### Backend — council.py

```python
for p in participants:
    thinking = p.get('thinking_mode', 'off')
    params = { 'model': p['model'], 'messages': messages }
    if thinking == 'deep':
        params['thinking'] = {'type': 'enabled', 'budget_tokens': 10000}
    elif thinking == 'think':
        params['thinking'] = {'type': 'enabled', 'budget_tokens': 4000}
    # 'off' = no thinking parameter
```

---

## FEATURE 3: Chairman + Leadership AI Capabilities

### Problem
Chairman has model selector but NO thinking mode toggle. Same for moderator/evaluator.

### UI — Chairman (SettingsPanel.jsx)

```
CHAIRMAN MODEL
┌──────────────────────────────────────────┐
│ PREMIUM                              ˅   │
│ ● Claude Opus 4.6            CHAIRMAN    │
│   GPT-5.2                                │
│   GPT-5.1                                │
│ ● Gemini 3 Pro                           │
│ BALANCED                             ˅   │
│ EFFICIENT                            ˅   │
│ BUDGET                               ˅   │
└──────────────────────────────────────────┘

CHAIRMAN AI CAPABILITIES                ← NEW
Thinking: [Off] [Think] [Deep]
Web Search: [━━● ON]
↳ Chairman synthesizes all responses in Stage 3.
  Deep thinking produces more nuanced synthesis.
```

### UI — Moderator Card

```
┌────────────────────────────────────────────┐
│ [SJ] Steve Jobs                            │
│ MODERATOR                   [Change ▾]     │
│                                            │
│ Model: [anthropic/claude-opus-4.6 ▾]      │
│ Thinking: [Off] [Think] [Deep]             │
│ Web Search: [toggle]                       │
│                                            │
│ ℹ️  ✓ Also participating as team member    │
└────────────────────────────────────────────┘
```

### UI — Evaluator Card (same pattern, purple accent)

```
┌────────────────────────────────────────────┐
│ [JI] Jony Ive                              │
│ EVALUATOR                   [Change ▾]     │
│                                            │
│ Model: [anthropic/claude-sonnet-4.6 ▾]    │
│ Thinking: [Off] [Think] [Deep]             │
│ Web Search: [toggle]                       │
│                                            │
│ ℹ️  ✓ Also participating as team member    │
└────────────────────────────────────────────┘
```

---

## FEATURE 4: Dual Roles for Jobs/Ive

### Problem
Jobs = ONLY moderator. Ive = ONLY evaluator. Can't also participate as team members.

### mock.js — Add to team rosters

```js
// Business & Strategy group, add:
{ id: 'steve-jobs', name: 'Steve Jobs', title: 'VISIONARY PROVOCATEUR',
  subtitle: 'The intersection of technology & liberal arts',
  group: 'business', defaultModel: 'anthropic/claude-opus-4.6',
  canBeLeader: true, leaderRoles: ['moderator', 'evaluator'] }

// Design & Visual group, add:
{ id: 'jony-ive', name: 'Jony Ive', title: 'CRAFT PERFECTIONIST',
  subtitle: 'Design is how it works',
  group: 'design', defaultModel: 'anthropic/claude-sonnet-4.6',
  canBeLeader: true, leaderRoles: ['moderator', 'evaluator'] }
```

### PersonaChip.jsx — Dual Role Badge

When Jobs is selected as participant AND moderator:
```
[SJ] Steve Jobs  Claude Opus 4.6  🧠Think  MODERATOR + PARTICIPANT  ☑️
```
- Gold dual-role badge
- Left border = team color, top border = role color

### Backend
- Jobs appears in BOTH `moderator` config AND `participants` array
- council.py: Two separate OpenRouter calls for Jobs (team response + moderator response)
- Moderator prompt notes: "You are also participating as a team member"

---

## FEATURE 5: Any Persona as Moderator/Evaluator

### Problem
Moderator locked to Jobs. Evaluator locked to Ive. No swap.

### UI — SettingsPanel.jsx Leadership Section

Replace static cards with persona dropdowns:

```
MODERATOR
[Select persona ▾]  → All 17+ souls grouped by team
[Model ▾]  [Off] [Think] [Deep]  [Web Search toggle]

EVALUATOR
[Select persona ▾]  → Same grouped dropdown
[Model ▾]  [Off] [Think] [Deep]  [Web Search toggle]
```

- Selected as moderator → gold accent on their team chip
- Selected as evaluator → purple accent on their team chip
- Leaders always have explicit thinking mode (no "Default" option)

### councilStore.js

```js
setModerator: (soulId) => set(state => {
  const soul = PERSONAS.find(p => p.id === soulId);
  return { moderator: { ...state.moderator, soulId, modelId: soul?.defaultModel || state.moderator.modelId } };
}),
setEvaluator: (soulId) => set(state => {
  const soul = PERSONAS.find(p => p.id === soulId);
  return { evaluator: { ...state.evaluator, soulId, modelId: soul?.defaultModel || state.evaluator.modelId } };
}),
```

---

## FEATURE 6: Devil's Advocate Full Config

### Problem
DA section only has toggle + aggression. Missing: LLM model, thinking, web search, critique focus, attack strategy.

### V3 DA Character
- **Title**: "The Promoter of the Faith" (Est. 1587 by Pope Sixtus V)
- **Sanhedrin Principle**: If everyone agrees, something is wrong
- **Three-phase attack**: Find fatal flaw → escalate pressure → verdict (survive or eliminated)
- **Style**: Cold, surgical, relentless. Attacks the idea, not the person.

### UI — Full Config Panel

```
┌───────────────────────────────────────────────────┐
│ 😈 DEVIL'S ADVOCATE                  [ON ●━━] OFF│
│ Adversarial critique · Sanhedrin principle         │
│                                                   │
│ LLM MODEL                                         │
│ [x-ai/grok-4.1-fast ▾]                                │
│                                                   │
│ AI CAPABILITIES                                   │
│ Thinking: [Off] [Think] [Deep]                    │
│ Web Search: [━━● ON]                              │
│                                                   │
│ AGGRESSION LEVEL                                  │
│ [Analytical] [Aggressive ●] [Ruthless]            │
│                                                   │
│ CRITIQUE FOCUS                                    │
│ [☑ Market Viability] [☑ Originality]             │
│ [☑ Execution Risk]   [☐ Legal/Compliance]        │
│ [☐ Cultural]         [☑ Competitive Analysis]    │
│                                                   │
│ ATTACK STRATEGY                                   │
│ [Sanhedrin ●] [First Principles] [Customer Lens]  │
│ ↳ If unanimous agreement, force dissent            │
│                                                   │
│ MAX ELIMINATION %                                 │
│ [━━━━━━━━━━●━━━━━━] 60%                          │
│ Up to 60% of concepts can be eliminated per round │
│                                                   │
│ ℹ️ About Devil's Advocate                         │
└───────────────────────────────────────────────────┘
```

### Data Model

```js
devilsAdvocate: {
  enabled: true,
  modelId: 'x-ai/grok-4.1-fast',
  thinkingMode: 'off',
  webSearch: false,
  aggressionLevel: 'aggressive',    // analytical | aggressive | ruthless
  critiqueFocus: ['market_viability', 'originality', 'execution_risk', 'competitive'],
  attackStrategy: 'sanhedrin',       // sanhedrin | first_principles | customer_lens
  maxEliminationPct: 60,
}
```

### Backend Mapping
- `aggressionLevel` → DA system prompt tone:
  - analytical: "Provide measured, evidence-based critique..."
  - aggressive: "Challenge aggressively, expose weaknesses..."
  - ruthless: "Tear apart every assumption, show no mercy..."
- `critiqueFocus` → filters what DA evaluates
- `attackStrategy` → changes DA reasoning framework
- `maxEliminationPct` → constrains elimination recommendations

---

## FEATURE 7: Soul Info Cards

### Data — NEW FILE: `src/data/soulBios.js`

18 entries. Each:
```js
{
  title: 'The Father of Advertising',
  era: '1911–1999',
  biggestSuccess: '...',
  process: '...',
  knownFor: '...',
  style: '...',
  whyInChamber: '...',
}
```

**Marketing & Strategy (5):**
- `david-ogilvy` — "The Father of Advertising" (1911–1999). Rolls-Royce headline, research-obsessed, brand image inventor. Elegant, no-nonsense.
- `claude-hopkins` — "The Scientific Advertiser" (1866–1932). Pepsodent, coupon testing, reason-why copy. Direct, logical, benefit-driven.
- `leo-burnett` — "The Sultan of Symbols" (1891–1971). Marlboro Man, Jolly Green Giant. Warm, folksy, archetypal imagery.
- `mary-wells-lawrence` — "Queen of Madison Avenue" (1928–present). Braniff Airlines, Alka-Seltzer, I Love New York. Bold, glamorous, experiential.
- `gary-halbert` — "The Prince of Print" (1938–2007). Coat of Arms letter ($40M+), Boron Letters. Raw, urgent, street-smart.

**Design & Visual (6):**
- `paul-rand` — "The Modernist Master" (1914–1996). IBM, ABC, UPS, NeXT logos. Geometric, playful, reductive.
- `paula-scher` — "The Master of Big Type" (1948–present). Citibank, Public Theater, Windows 8 logo. Bold, typographic, energetic.
- `saul-bass` — "The Man Who Changed Cinema" (1920–1996). Vertigo/Psycho titles, AT&T globe. Bold, kinetic, reductive.
- `susan-kare` — "The Pixel Pioneer" (1954–present). Original Mac icons, Chicago typeface. Warm, precise, pixel-perfect.
- `rob-janoff` — "The Man Who Bit the Apple" (1950–present). Apple logo. Clean, memorable, one clever twist.
- `tobias-van-schneider` — "The Digital Provocateur" (1986–present). Spotify UX, Semplice. Bold, rule-breaking, digitally native.

**Business & Strategy (5):**
- `elon-musk` — "The First Principles Disruptor" (1971–present). Tesla, SpaceX, Five-Step Design Process. Direct contradiction.
- `jeff-bezos` — "The Customer-Obsessed Architect" (1964–present). Amazon, working backwards, flywheel thinking. Structural reframing.
- `warren-buffett` — "The Oracle of Omaha" (1930–present). Berkshire Hathaway, economic moat. Folksy but devastating.
- `richard-branson` — "The Maverick Disruptor" (1950–present). Virgin 400+ companies. Enthusiasm and storytelling.
- `dietrich-mateschitz` — "The Category Creator" (1944–2022). Red Bull, culture ownership. Philosophical, strategic silence.

**Leadership (2):**
- `steve-jobs` — "The Visionary Provocateur" (1955–2011). Apple, Pixar, reality distortion field. Uncompromising, visionary.
- `jony-ive` — "The Craft Perfectionist" (1967–present). iMac, iPhone, unibody aluminum. Minimal, tactile, obsessively refined.

**Devil's Advocate (1):**
- `devils-advocate` — "The Promoter of the Faith" (Est. 1587). Sanhedrin Principle. Cold, surgical, relentless.

### UI Component — NEW: `SoulInfoModal.jsx`

```
┌─────────────────────────────────────────────────┐
│  ℹ️  DAVID OGILVY                          [✕]  │
│  The Father of Advertising · 1911–1999           │
│─────────────────────────────────────────────────│
│                                                 │
│  BIGGEST SUCCESS                                │
│  Rolls-Royce 'At 60 miles an hour...'           │
│                                                 │
│  CREATIVE PROCESS                               │
│  Research-obsessed. Read everything...           │
│                                                 │
│  KNOWN FOR                                      │
│  Long-copy advertising that sold                │
│                                                 │
│  STYLE                                          │
│  Elegant, research-backed, no-nonsense          │
│                                                 │
│  WHY IN THE CHAMBER                             │
│  Bridges art and science in advertising         │
│                                                 │
│  ───────────────────────────────────────────    │
│  Currently: Claude Sonnet 4.6 · 🧠🧠 Deep      │
└─────────────────────────────────────────────────┘
```

**Design specs:**
- Backdrop: surface-0 70% opacity, blur(8px)
- Card: surface-1, borderRadius 16, max-width 520px, centered
- Title: team color left accent (3px)
- Section labels: 10px uppercase, textMuted
- Section content: 13px, textSecondary, 1.5 line-height
- Footer: surface-2 strip, current model + thinking
- Close: ✕ top-right + backdrop click + Esc

### Integration
- **PersonaChip.jsx** — ℹ️ button (hover-visible on team chips, always-visible on leaders)
- **LauncherCustom.jsx** — `const [infoSoulId, setInfoSoulId] = useState(null)` + render SoulInfoModal
- **SettingsPanel.jsx** — ℹ️ on leadership cards and DA

---

## FEATURE 8: Premium Loading State

### Problem
Current loading: generic gray skeleton bars. No animation, no personality, no progress. Looks dead.

### Solution: Hybrid approach with 5 components.

### 8A: Stage Progress Bar (above cards)

```
STAGE 1: GENERATION ━━━━━━━━━━━━━━━━━━━━━ 2 of 5
                    ████████████░░░░░░░░░░
Est. ~35s remaining
```

```jsx
const totalParticipants = participants.length;
const completedCount = responses.filter(r => r.status === 'complete').length;
const progress = completedCount / totalParticipants;

<div className="stage-progress">
  <div className="stage-label">
    <span>STAGE 1: GENERATION</span>
    <span className="count">{completedCount} of {totalParticipants}</span>
  </div>
  <div className="progress-track">
    <div className="progress-fill" style={{ width: `${progress * 100}%` }} />
  </div>
  <span className="eta">Est. ~{Math.ceil((totalParticipants - completedCount) * 18)}s</span>
</div>
```

Styling:
- Track: surface-2, 4px height, borderRadius full
- Fill: `linear-gradient(90deg, #00D9FF, #8B5CF6)` with subtle pulse
- Label: 11px uppercase, textMuted
- Count: cyan, fontWeight 700

### 8B: Premium Skeleton Cards

Each skeleton shows soul identity while loading:

```
┌─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┐
│ [PR ···] Paul Rand is crafting...               │
│ ▓ Gemini 3 Pro · 🧠 Deep                       │
│                                                 │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  ← shimmer │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░                    │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░                 │
│ ░░░░░░░░░░░░░░░░░░░                           │
└ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┘
```

Elements per card:
- **Team color left border** (3px) — flame/cyan/gold matching response cards
- **Pulsing avatar** — initials circle with team-color glow animation
- **Typing dots** — `···` animated next to avatar
- **Rotating status** — "is crafting..." / "is analyzing..." / "is debating..." (every 3s)
- **Model badge** — shows LLM + thinking mode
- **Shimmer bars** — 4 bars with animated gradient sweep
- **Dashed border** — distinguishes from completed solid-border cards

### 8C: Shimmer Animation CSS

```css
@keyframes shimmer {
  0% { background-position: -200px 0; }
  100% { background-position: 200px 0; }
}
.skeleton-bar {
  background: linear-gradient(90deg, var(--surface-2) 0%, var(--surface-3) 50%, var(--surface-2) 100%);
  background-size: 200px 100%;
  animation: shimmer 1.5s ease-in-out infinite;
  border-radius: 4px;
  height: 12px;
}
```

### 8D: Avatar Pulse + Typing Dots CSS

```css
@keyframes avatarPulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(var(--team-rgb), 0.4); }
  50% { box-shadow: 0 0 0 8px rgba(var(--team-rgb), 0); }
}
.skeleton-avatar { animation: avatarPulse 2s ease-in-out infinite; }

@keyframes typingDot {
  0%, 20% { opacity: 0; }
  40% { opacity: 1; }
  60%, 100% { opacity: 0; }
}
.dot:nth-child(1) { animation: typingDot 1.4s infinite 0s; }
.dot:nth-child(2) { animation: typingDot 1.4s infinite 0.2s; }
.dot:nth-child(3) { animation: typingDot 1.4s infinite 0.4s; }
```

### 8E: Staggered Card Entrance

Cards appear one by one, not all at once:

```jsx
{participants.map((p, i) => (
  <SkeletonResponseCard
    key={p.soulId}
    soul={p}
    style={{
      animationDelay: `${i * 150}ms`,
      animation: 'fadeSlideIn 0.4s ease-out forwards',
      opacity: 0,
    }}
  />
))}
```

```css
@keyframes fadeSlideIn {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
```

### 8F: Per-Card Completion Transition

When SSE delivers a response, that card transitions skeleton → content:

```css
@keyframes cardComplete {
  from {
    opacity: 0; transform: scale(0.97);
    border-color: rgba(0, 217, 255, 0.3);
    box-shadow: 0 0 20px rgba(0, 217, 255, 0.1);
  }
  to {
    opacity: 1; transform: scale(1);
    border-color: rgba(233, 231, 228, 0.06);
    box-shadow: none;
  }
}
```

- Cyan flash on border when card completes
- Scale 97% → 100% for subtle pop
- Solid border replaces dashed

### 8G: Status Text Rotation

```js
const STATUS_TEXTS = [
  'is crafting a concept...',
  'is exploring ideas...',
  'is analyzing the brief...',
  'is developing strategy...',
  'is building their vision...',
];
// Rotate every 3s with offset per card index
```

---

## FEATURE 9: Expanded Preset Templates

### 10 Presets in 5 Categories

```js
export const COUNCIL_PRESETS = [
  // ── SPEED ──
  { id: 'quick-test', name: 'Quick Test', category: 'speed',
    icon: '⚡', description: '3 fast models, rapid iteration',
    time: '~5 min', participants: 3,
    souls: ['david-ogilvy', 'paul-rand', 'jeff-bezos'],
    moderator: 'steve-jobs', evaluator: 'jony-ive',
    daEnabled: false },

  // ── BALANCED ──
  { id: 'genesis-classic', name: 'Genesis Classic', category: 'balanced',
    icon: '🏛️', description: 'The original 7-soul war room',
    time: '~25 min', participants: 7, recommended: true,
    souls: ['david-ogilvy', 'claude-hopkins', 'gary-halbert', 'paul-rand', 'saul-bass', 'elon-musk', 'jeff-bezos'],
    moderator: 'steve-jobs', evaluator: 'jony-ive',
    daEnabled: true, daAggression: 'aggressive' },

  // ── SPECIALIST ──
  { id: 'copywriting-lab', name: 'Copywriting Lab', category: 'specialist',
    icon: '✍️', description: '5 master copywriters battle for the best headline',
    time: '~12 min', participants: 5,
    souls: ['david-ogilvy', 'claude-hopkins', 'gary-halbert', 'mary-wells-lawrence', 'leo-burnett'],
    moderator: 'steve-jobs', evaluator: 'jony-ive',
    daEnabled: true, daAggression: 'analytical' },

  { id: 'design-showdown', name: 'Design Showdown', category: 'specialist',
    icon: '🎨', description: '6 design legends compete on visual identity',
    time: '~15 min', participants: 6,
    souls: ['paul-rand', 'paula-scher', 'saul-bass', 'susan-kare', 'rob-janoff', 'tobias-van-schneider'],
    moderator: 'jony-ive', evaluator: 'steve-jobs',
    daEnabled: true, daAggression: 'aggressive' },

  { id: 'boardroom', name: 'The Boardroom', category: 'specialist',
    icon: '📊', description: '5 business titans stress-test your strategy',
    time: '~15 min', participants: 5,
    souls: ['elon-musk', 'jeff-bezos', 'warren-buffett', 'richard-branson', 'dietrich-mateschitz'],
    moderator: 'steve-jobs', evaluator: 'warren-buffett',
    daEnabled: true, daAggression: 'ruthless' },

  // ── USE CASE ──
  { id: 'brand-launch', name: 'Brand Launch', category: 'use-case',
    icon: '🚀', description: 'Full team for launching a new brand from scratch',
    time: '~25 min', participants: 7,
    souls: ['david-ogilvy', 'paul-rand', 'mary-wells-lawrence', 'leo-burnett', 'saul-bass', 'jeff-bezos', 'dietrich-mateschitz'],
    moderator: 'steve-jobs', evaluator: 'jony-ive',
    daEnabled: true, daAggression: 'aggressive' },

  { id: 'rebrand', name: 'Rebrand Surgery', category: 'use-case',
    icon: '🔄', description: 'Refresh an existing brand without losing equity',
    time: '~20 min', participants: 6,
    souls: ['paul-rand', 'paula-scher', 'rob-janoff', 'david-ogilvy', 'warren-buffett', 'susan-kare'],
    moderator: 'jony-ive', evaluator: 'steve-jobs',
    daEnabled: true, daAggression: 'analytical' },

  { id: 'viral-campaign', name: 'Viral Campaign', category: 'use-case',
    icon: '🔥', description: 'Disruptors and provocateurs for maximum impact',
    time: '~20 min', participants: 6,
    souls: ['gary-halbert', 'tobias-van-schneider', 'elon-musk', 'richard-branson', 'dietrich-mateschitz', 'mary-wells-lawrence'],
    moderator: 'steve-jobs', evaluator: 'jony-ive',
    daEnabled: true, daAggression: 'ruthless' },

  { id: 'product-naming', name: 'Product Naming', category: 'use-case',
    icon: '💬', description: 'Specialists in memorable verbal identity',
    time: '~12 min', participants: 5,
    souls: ['david-ogilvy', 'leo-burnett', 'paul-rand', 'rob-janoff', 'richard-branson'],
    moderator: 'steve-jobs', evaluator: 'jony-ive',
    daEnabled: false },

  // ── MAXIMUM ──
  { id: 'full-assembly', name: 'Full Assembly', category: 'maximum',
    icon: '🏭', description: 'All 16 souls — maximum creative coverage',
    time: '~45 min', participants: 16,
    souls: 'all',
    moderator: 'steve-jobs', evaluator: 'jony-ive',
    daEnabled: true, daAggression: 'aggressive' },
];
```

### UI — LauncherQuick.jsx Grouped Display

```
⚡ SPEED
  Quick Test (3 souls, ~5 min)

⚖️ BALANCED
  Genesis Classic ★ RECOMMENDED (7 souls, ~25 min)

🎯 SPECIALIST
  Copywriting Lab | Design Showdown | The Boardroom

📋 USE CASE
  Brand Launch | Rebrand Surgery | Viral Campaign | Product Naming

🏭 MAXIMUM
  Full Assembly (16 souls, ~45 min)
```

Category headers are collapsible. Each preset card: icon, name, soul count, time, team color.

---

## FILES TO MODIFY — COMPLETE LIST

| # | File | Changes |
|---|------|---------|
| 1 | `src/data/soulBios.js` | **NEW** — 18 soul bios (all fields) |
| 2 | `src/components/SoulInfoModal.jsx` | **NEW** — Info card popup component |
| 3 | `src/data/mock.js` | thinkingMode:'default' on all personas, Jobs/Ive in team rosters, COUNCIL_PRESETS ×10 |
| 4 | `src/stores/councilStore.js` | defaultThinkingMode, per-participant 'default' option, chairman/moderator/evaluator objects (thinking+webSearch+alsoParticipant), expanded DA state, per-participant completion tracking for progress bar |
| 5 | `src/components/PersonaChip.jsx` | Thinking badge (with ↓ inheritance), ℹ️ button, dual-role badge |
| 6 | `src/components/LauncherCustom.jsx` | Per-soul 4-button thinking toggle, override counter, info modal state |
| 7 | `src/components/LauncherQuick.jsx` | Grouped preset categories (5 groups), auto-populate new fields |
| 8 | `src/components/SettingsPanel.jsx` | Chairman AI capabilities, moderator/evaluator persona swap dropdowns + model + thinking + web search, DA full config panel, global "X of Y default" counter |
| 9 | `src/components/skeletons.jsx` | **REWRITE** — SkeletonResponseCard: soul identity, shimmer, avatar pulse, typing dots, model badge, team color border, dashed border |
| 10 | `src/components/ConversationView.jsx` | Stage progress bar, staggered entrance, per-card skeleton→content transition, status text rotation |
| 11 | `backend/council.py` | Per-participant thinking_mode, chairman thinking in Stage 3, DA config (aggression/focus/strategy) into system prompts |
| 12 | `backend/openrouter.py` | thinking param → OpenRouter extended_thinking API mapping |

---

## 8 IMPLEMENTATION GROUPS

### GROUP 1: Data Foundation (~30 min)
**Files:** `soulBios.js` (new), `mock.js`
- Create soulBios.js with all 18 bios (full fields for each)
- Add `thinkingMode: 'default'` to all personas in mock.js
- Add Steve Jobs to Business & Strategy group
- Add Jony Ive to Design & Visual group
- Add `canBeLeader: true, leaderRoles: [...]` to Jobs/Ive
- Expand COUNCIL_PRESETS from current to 10 presets with category field

### GROUP 2: Thinking Hierarchy + Chairman (~45 min)
**Files:** `councilStore.js`, `SettingsPanel.jsx`, `LauncherCustom.jsx`
- Add `defaultThinkingMode` to store
- Add per-participant `thinkingMode` with 'default' option
- Add `chairman.thinkingMode` + `chairman.webSearch` to store
- Add `moderator.thinkingMode` + `moderator.webSearch` to store
- Add `evaluator.thinkingMode` + `evaluator.webSearch` to store
- SettingsPanel: Chairman AI Capabilities section (thinking toggle + web search toggle)
- SettingsPanel: "X of Y using default" counter on global thinking toggle
- LauncherCustom: Per-row 4-button thinking toggle [Default ↓][Off][Think][Deep]
- Wire resolution logic: 'default' inherits global, explicit overrides

### GROUP 3: Per-Soul UI + Info Cards (~45 min)
**Files:** `PersonaChip.jsx`, `SoulInfoModal.jsx` (new), `LauncherCustom.jsx`
- PersonaChip: Thinking badge with inheritance indicator (↓ vs •)
- PersonaChip: ℹ️ button (hover-visible on team, always-visible on leaders)
- PersonaChip: Dual-role badge for Jobs/Ive
- Create SoulInfoModal.jsx (backdrop + card + sections + footer + close)
- LauncherCustom: Modal state + render SoulInfoModal
- SettingsPanel: ℹ️ on leadership cards + DA section

### GROUP 4: Devil's Advocate Full Config (~30 min)
**Files:** `SettingsPanel.jsx`, `councilStore.js`
- DA model selector dropdown (full tiered list)
- DA thinking toggle (Off/Think/Deep)
- DA web search toggle
- DA aggression: Analytical/Aggressive/Ruthless buttons
- DA critique focus: 6 checkboxes (multi-select)
- DA attack strategy: Sanhedrin/First Principles/Customer Lens
- DA max elimination slider (0-100%)
- All wired to councilStore.devilsAdvocate

### GROUP 5: Leadership Swap + Dual Roles (~30 min)
**Files:** `SettingsPanel.jsx`, `councilStore.js`
- Moderator persona dropdown (all souls grouped by team)
- Evaluator persona dropdown (same)
- Each leader: model dropdown + thinking toggle + web search
- "Also participating as team member" checkbox + indicator
- Dual-role indicator when leader is in participant list
- Gold border for moderator, purple for evaluator on team chips

### GROUP 6: Loading State Overhaul (~45 min)
**Files:** `skeletons.jsx`, `ConversationView.jsx`, `councilStore.js`
- Stage progress bar: track + fill gradient + count + ETA
- SkeletonResponseCard rewrite: soul avatar (pulsing), name, typing dots, model badge, team color border, shimmer bars, dashed border
- Status text rotation (5 texts, 3s interval, offset per card)
- Staggered card entrance (150ms delay per card, fadeSlideIn)
- Per-card completion transition: skeleton → content with cyan flash + scale pop
- Per-participant completion tracking in store (for progress bar)
- All keyframe animations: shimmer, avatarPulse, typingDot, fadeSlideIn, cardComplete

### GROUP 7: Backend Integration (~30 min)
**Files:** `council.py`, `openrouter.py`
- Per-participant `thinking_mode` in OpenRouter calls
- Chairman `thinking_mode` in Stage 3 synthesis
- Moderator/Evaluator thinking_mode in their respective stages
- DA config mapping: aggressionLevel → system prompt tone
- DA critiqueFocus → evaluation scope filter
- DA attackStrategy → reasoning framework in prompt
- Triple-test: 3 different thinking modes → verify each gets correct params

### GROUP 8: Presets + Polish (~20 min)
**Files:** `LauncherQuick.jsx`, `mock.js`
- Grouped preset display (Speed/Balanced/Specialist/Use Case/Maximum)
- Collapsible category headers
- Preset selection auto-populates ALL new fields (thinking, DA config, leadership)
- Build verification: 0 errors, all imports resolve
- Final lint + type check

---

## VERIFICATION CHECKLIST

### Thinking Hierarchy
- [ ] Global thinking toggle shows "X of Y using default" counter
- [ ] Setting global to "Deep" → all "Default" participants show inherited "Deep"
- [ ] Overriding one soul to "Off" → counter decrements, soul shows • indicator
- [ ] Resetting override to "Default" → inherits global again, counter increments
- [ ] Chairman has independent thinking toggle (not affected by global)
- [ ] Moderator has independent thinking toggle
- [ ] Evaluator has independent thinking toggle
- [ ] DA has independent thinking toggle

### Per-Soul Config
- [ ] Each selected PersonaChip shows thinking badge (🧠 Think / 🧠🧠 Deep)
- [ ] Default-inherited badge shows ↓ arrow
- [ ] Overridden badge shows • dot
- [ ] Model assignment rows have 4-button toggle [Default ↓][Off][Think][Deep]

### Leadership
- [ ] Chairman section has Thinking toggle + Web Search toggle
- [ ] Moderator card shows persona dropdown, model, thinking, web search
- [ ] Evaluator card shows persona dropdown, model, thinking, web search
- [ ] Any soul can be selected as moderator (not locked to Jobs)
- [ ] Any soul can be selected as evaluator (not locked to Ive)

### Dual Roles
- [ ] Jobs appears in Business & Strategy team roster
- [ ] Ive appears in Design & Visual team roster
- [ ] Selecting Jobs as participant shows "MODERATOR + PARTICIPANT" badge
- [ ] Backend sends 2 API calls for dual-role soul (team + leader)

### Devil's Advocate
- [ ] DA section has: model selector, thinking, web search, aggression, focus, strategy, slider
- [ ] All 6 critique focus areas toggleable
- [ ] 3 attack strategies selectable
- [ ] Slider goes 0-100% for max elimination
- [ ] ℹ️ button opens DA bio (Sanhedrin principle, three-phase attack)

### Soul Info
- [ ] ℹ️ button on every persona opens SoulInfoModal with correct bio
- [ ] Modal shows: title, era, success, process, known for, style, why in chamber
- [ ] Modal footer shows current model + thinking assignment
- [ ] Close: ✕ button + backdrop click + Esc key
- [ ] Works for all 18 souls including DA

### Loading State
- [ ] Stage progress bar shows above cards during generation
- [ ] Progress fill advances as SSE responses arrive
- [ ] Skeleton cards show: soul avatar (pulsing), name, model badge, team color border
- [ ] Shimmer animation on placeholder bars
- [ ] Typing dots animate next to avatar
- [ ] Status text rotates every 3s
- [ ] Cards appear staggered (150ms delay each)
- [ ] Completed cards transition: cyan flash → solid border → scale pop
- [ ] Skeleton has dashed border, completed has solid border

### Presets
- [ ] 10 presets display in 5 grouped categories
- [ ] Selecting preset auto-populates: souls, moderator, evaluator, DA config
- [ ] "Genesis Classic" shows ★ RECOMMENDED badge
- [ ] "Full Assembly" selects all 16 souls

### Build
- [ ] `npm run build` → 0 errors
- [ ] All new imports resolve
- [ ] No console warnings about missing props or keys

---

## EXECUTION PLAN

**Session 1:** Groups 1 + 2 (Data foundation + Thinking hierarchy)
**Session 2:** Groups 3 + 4 + 5 (Per-soul UI + DA + Leadership)
**Session 3:** Groups 6 + 7 + 8 (Loading state + Backend + Polish)

Total: ~4.5 hours focused work.
