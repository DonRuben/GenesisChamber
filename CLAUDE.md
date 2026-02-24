# Genesis Chamber V4

## Why
Multi-persona AI creative council. 19 legendary personas across Marketing, Design, and Business — each powered by different LLMs via OpenRouter — compete, collaborate, and get stress-tested by a Devil's Advocate to produce breakthrough creative concepts. 3-stage council flow: Ideation → Refinement → Evaluation. Includes fal.ai media generation (images + video) for winning concepts.

## What
Full-stack app: React 19 + Vite frontend, Python FastAPI backend, Neon PostgreSQL database.
Frontend on Vercel, backend on Render. SSE streaming for real-time council responses.
For backend-specific context (API endpoints, engines, DB schema): see `backend/CLAUDE.md`.

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
│   ├── routes.py                 # All API endpoints
│   ├── simulation.py             # 3-stage council orchestration
│   ├── soul_engine.py            # Soul personality + biography system
│   ├── output_engine.py          # Final output formatting
│   ├── image_generator.py        # fal.ai image generation
│   ├── video_generator.py        # fal.ai video generation
│   ├── openrouter_client.py      # OpenRouter API wrapper + streaming
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
3-stage council: Ideation (all souls generate) → Refinement (Moderator guides) → Evaluation (Evaluator scores + DA challenges). See `backend/CLAUDE.md` for engine details.

### Current phase
Phase 9 spec exists in `docs/phase9-final-spec.md` but is NOT YET INTEGRATED. Features planned: per-soul thinking modes, Chairman AI, Devil's Advocate config, premium loading states, 10 council presets. Read the spec before starting any Phase 9 work.

## Rules

- Font sizes are numbers, not strings: `fontSize: 11` not `fontSize: '11px'`.
- `useTokens()` required in every component using colors. Never import `T` directly.
- `IC` icons inherit `fontSize` from parent — set size via parent element, not icon props.
- Team colors: Marketing=#F27123 (flame), Design=#00D9FF (cyan), Business=#FFB800 (gold).
- PersonaChip ℹ️ button: use `stopPropagation()` to prevent chip selection toggle.
- Max 16 personas per council session. Toggle silently fails beyond 16.
- Mono uppercase for labels: `fontFamily: font.mono`, `textTransform: 'uppercase'`, `letterSpacing: '0.12em'`.
- Left border accent on cards: `borderLeft: '2px solid ${color}'`, not full borders or backgrounds.

## Gotchas

- Backend CORS middleware MUST be added BEFORE route definitions in `main.py`. Order matters.
- OpenRouter thinking: `{ type: 'enabled', budget_tokens: N }` — include ONLY for 'think'/'deep' mode. Omit entirely for 'off'. Including it with budget 0 causes errors.
- Sidebar conversation save: debounce updates to avoid excessive DB calls.
- Motion durations are strings with units (`'210ms'`), unlike fontSize which are bare numbers.
- `getFilteredMedia()` is a method, not reactive state — call via `getState()`.
- fal.ai requires `FAL_KEY` env var. Image and video generation are separate endpoints with different models.
- Port is 8001 (NOT 8000). Configured via `os.getenv('PORT', '8001')` in main.py.

## Environment
```
VITE_API_URL=https://genesis-chamber-api.onrender.com
OPENROUTER_API_KEY=sk-or-...
FAL_KEY=...
DATABASE_URL=postgresql://...@neon.tech/...
ALLOWED_ORIGINS=https://genesis-chamber-v4.vercel.app,http://localhost:5173
PORT=8001
```
