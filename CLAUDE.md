# Genesis Chamber V4

## Why
Multi-persona AI creative council. 19 legendary personas across Marketing, Design, and Business — each powered by different LLMs via OpenRouter — compete, collaborate, and get stress-tested by a Devil's Advocate to produce breakthrough creative concepts. 3-stage council flow: Ideation → Refinement → Evaluation. Includes fal.ai media generation (images + video) for winning concepts.

## What
Full-stack app: React 19 + Vite frontend, Python FastAPI backend, Neon PostgreSQL database.
Frontend on Vercel, backend on Render. SSE streaming for real-time council responses.
For backend-specific context (API endpoints, engines, DB schema): see `backend/backend-CLAUDE.md`.

```
genesis-chamber-v4/
├── src/                          # React 19 + Vite + Zustand
│   ├── components/               # UI components (ALL inline styles via useTokens())
│   ├── stores/                   # councilStore.js, appStore.js (Zustand)
│   ├── data/                     # mock.js (personas, presets), soulBios.js
│   ├── design/                   # tokens.js, shared.jsx, icons.jsx, gc-motion.css
│   └── hooks/                    # useTokens, useMediaQuery, useSwipe...
├── backend/                      # Python FastAPI + OpenRouter + fal.ai
│   ├── main.py                   # App entry (port 8001), CORS, routes
│   ├── config.py                 # 19 personas, colors, OpenRouter + fal.ai config
│   ├── council.py                # 3-stage council orchestration (stage1/stage2/stage3)
│   ├── openrouter.py             # OpenRouter API wrapper + reasoning config
│   ├── simulation.py             # Genesis Chamber multi-round simulation
│   ├── soul_engine.py            # Soul personality + biography system
│   ├── output_engine.py          # Final output formatting
│   ├── image_generator.py        # fal.ai image generation
│   ├── video_generator.py        # fal.ai video generation
│   ├── sse.py                    # Server-Sent Events implementation
│   ├── database.py               # Neon PostgreSQL (async SQLAlchemy)
│   ├── models.py                 # SQLAlchemy ORM models
│   ├── storage.py                # DB CRUD operations
│   ├── simulation_store.py       # In-memory simulation state
│   ├── middleware.py              # Request/response middleware
│   ├── validators.py             # Input validation
│   ├── exceptions.py             # Custom exception handlers
│   └── utils.py                  # Helpers
├── souls/                        # 19 soul personality .md files
├── docs/                         # Specs + design references
│   └── phase9-final-spec.md      # Phase 9 spec (NOT YET INTEGRATED)
└── CLAUDE.md                     # ← You are here
```

## Personas (19 total)
Marketing (5): david-ogilvy, claude-hopkins, leo-burnett, mary-wells-lawrence, gary-halbert
Design (6): paul-rand, paula-scher, saul-bass, susan-kare, rob-janoff, tobias-van-schneider
Business (5): elon-musk, jeff-bezos, warren-buffett, richard-branson, dietrich-mateschitz
Leadership: steve-jobs (Moderator), jony-ive (Evaluator)
Special: devils-advocate (Promoter of the Faith)

## LLM Council — Model Roster (21 models, 5 tiers)

| Tier | Models | Price Range |
|------|--------|------------|
| **Premium** (6) | Claude Opus 4.6, Gemini 3.1 Pro, Sonar Pro Search, Nano Banana Pro, GPT-5 Image, GPT-5.2 | $3–$75/M |
| **Balanced** (3) | Gemini 3 Pro, Claude Sonnet 4.6, GPT-5.3 Codex | $2.5–$15/M |
| **Efficient** (7) | Claude Haiku 4.5, Gemini 3 Flash, GPT-5.2 Chat, MiniMax M2.5, Kimi K2.5, Kimi K2 Thinking, Grok 4.1 Fast | $0.15–$4/M |
| **Budget** (4) | DeepSeek V3.2, Gemini 2.5 Flash Lite, GPT-4.1 Nano, Llama 4 Maverick | $0.075–$1.1/M |
| **Specialist** (1) | O3-Pro (always max reasoning, 30x expensive) | $60–$240/M |

Default active: 7 models (6 Premium + Grok 4.1 Fast). Defined in `mock.js:MODELS` and `mock.js:DEFAULT_COUNCIL_MODELS`.

### 5-Level Thinking System
| Level | Key | Behavior | Token Scaling |
|-------|-----|----------|--------------|
| Off | `'off'` | No reasoning | 1x |
| Low | `'low'` | Light reasoning | 2x |
| Medium | `'medium'` | Balanced (default) | 2x |
| High | `'high'` | Deep analysis | 3x |
| Max | `'max'` | Claude 4.6 adaptive / others get high | 3x |

**Special model behavior:**
- **Claude 4.6** (Opus/Sonnet): supports all 5 levels + Adaptive mode (`{"exclude": False}` = no budget cap)
- **O3-Pro**: always `{"effort": "high"}` regardless of setting — SettingsPanel shows fixed "MAX" badge
- **Sonar** (search models): no reasoning support — returns `{}` — SettingsPanel shows fixed "SEARCH" badge
- **All others**: effort-based (`low`/`medium`/`high`), `max` maps to `high`

**Adaptive mode:** When enabled + Claude 4.6, sends `{"exclude": False}` (model decides own reasoning depth). Separate toggles for participants and chairman. Stored as `adaptiveMode` (store) / `adaptive_mode` (API).

### Chairman Separation
Chairman (Stage 3 synthesis) has independent config: `chairman.thinkingMode`, `chairman.adaptiveMode`, `chairman.webSearch`. Defaults: `high` / `true` / `true`. Frontend sends as `chairman: { model, thinking_mode, adaptive_mode, web_search }`.

### Session Migration
Old saved sessions with `'thinking'` → `'medium'`, `'deep'` → `'high'`. Handled in `councilStore.js:loadSavedSession`.

## How

### Commands
```bash
npm run dev                              # Frontend dev server (port 5173)
npm run build                            # Production build — MUST pass with 0 errors
cd backend && uvicorn main:app --reload  # Backend dev server (port 8001)
```

### Verify changes
YOU MUST run `npm run build` after every group of changes. Zero errors required before committing.
Commit after each logical unit: `git add -A && git commit -m "Phase X Group Y: description"`

### Styling — IMPORTANT
- ALL styling is inline style objects via `useTokens()` hook. No Tailwind. No CSS modules. No CSS-in-JS libs.
- Only 3 CSS files exist: `gc-motion.css` (keyframes), `fonts.css` (@font-face), `index.css` (resets).
- Read `src/design/tokens.js` before touching any colors or spacing.
- Never hardcode hex values. Never use CSS classes for styling (only for animations from gc-motion.css).

### State management
Zustand stores. `councilStore.js` = council logic. `appStore.js` = app chrome. Components use hooks directly, no prop drilling.

### SSE streaming
Backend streams Server-Sent Events: `response_start` → `response_chunk` → `response_complete` → `stage_complete`.
Update store incrementally per-soul as events arrive — never batch/wait for all.

### Simulation pipeline
3-stage council: Ideation (all souls generate) → Refinement (Moderator guides) → Evaluation (Evaluator scores + DA challenges). See `backend/backend-CLAUDE.md` for engine details.

### Current phase
Phase 9 spec exists in `docs/phase9-final-spec.md` but is NOT YET INTEGRATED. Features planned: per-soul thinking modes, Chairman AI, Devil's Advocate config, premium loading states, 10 council presets. Read the spec before starting any Phase 9 work.

### UI Components — SettingsPanel
`SettingsPanel.jsx` is the council configuration slide-in panel. Key patterns:
- **InfoTooltip**: local hover component using `IC.info` icon + absolute-positioned tooltip. Used for thinking level descriptions and adaptive mode explanation.
- **Per-model thinking**: `getModelThinkingType(modelId)` returns `'full'` (Claude 4.6 — all 5 levels + adaptive), `'fixed'` (O3-Pro/Sonar — badge only, no dropdown), or `'standard'` (others — 4 levels, no max).
- **Tier collapsing**: Premium + Balanced expanded by default. Specialist tier shows warning badge.
- **Price display**: `$inputPrice` shown per model from `m.inputPrice` field.

## Rules

- Font sizes are numbers, not strings: `fontSize: 11` not `fontSize: '11px'`.
- `useTokens()` required in every component using colors. Never import `T` directly.
- `IC` icons inherit `fontSize` from parent — set size via parent element, not icon props.
- Team colors: Marketing=#F27123 (flame), Design=#00D9FF (cyan), Business=#FFB800 (gold).
- PersonaChip ℹ️ button: use `stopPropagation()` to prevent chip selection toggle.
- Max 16 personas per council session. Toggle silently fails beyond 16.
- Mono uppercase for labels: `fontFamily: font.mono`, `textTransform: 'uppercase'`, `letterSpacing: '0.12em'`.
- Left border accent on cards: `borderLeft: '2px solid ${color}'`, not full borders or backgrounds.
- Thinking mode values are `'off'`|`'low'`|`'medium'`|`'high'`|`'max'` — never use old `'thinking'`/`'deep'` values in new code.
- O3-Pro (`openai/o3-pro`) is Specialist tier — always warn about 30x cost. Never include in defaults.
- Sonar models have `capabilities: ['search']` — they don't support reasoning config.
- Model IDs use the exact OpenRouter format: `x-ai/grok-4.1-fast` (not `xai/`), `anthropic/claude-sonnet-4.6` (dot notation).

## Gotchas

- Backend CORS middleware MUST be added BEFORE route definitions in `main.py`. Order matters.
- OpenRouter reasoning: use `get_reasoning_config(model, thinking_mode, adaptive)` in `openrouter.py`. Never build reasoning dicts manually. For `'off'` it returns `{}`. For Claude 4.6 adaptive it returns `{"exclude": False}`. For everything else it returns `{"effort": level}`.
- Sidebar conversation save: debounce updates to avoid excessive DB calls.
- Motion durations are strings with units (`'210ms'`), unlike fontSize which are bare numbers.
- `getFilteredMedia()` is a method, not reactive state — call via `getState()`.
- fal.ai requires `FAL_KEY` env var. Image and video generation are separate endpoints with different models.
- Port is 8001 (NOT 8000). Configured via `os.getenv('PORT', '8001')` in main.py.
- Chairman Stage 3 uses its OWN thinking/adaptive/webSearch config from `request.chairman`, not the global `request.thinking_mode`. See `main.py` streaming endpoint.
- `IMAGE_CAPABLE_MODELS` in `openrouter.py` — only `openai/gpt-5-image` and `google/gemini-3-pro-image-preview`. Do NOT add models that don't return `modalities: ["text", "image"]`.
- **NEVER change model IDs autonomously.** If OpenRouter verification shows a model is unavailable, STOP and ask the user which model to use instead. Do not substitute a different model on your own.

## Environment
```
VITE_API_URL=https://genesis-chamber-api.onrender.com
OPENROUTER_API_KEY=sk-or-...
FAL_KEY=...
DATABASE_URL=postgresql://...@neon.tech/...
ALLOWED_ORIGINS=https://genesis-chamber-v4.vercel.app,http://localhost:5173
PORT=8001
```
