# Genesis Chamber V4 — Backend

## Architecture
Python FastAPI on port 8001 (Render). 18 files total. OpenRouter for LLM, fal.ai for media, Neon PostgreSQL for persistence, SSE for real-time streaming.

## Engines

### Soul Engine (`soul_engine.py`)
Loads soul personality profiles from `souls/` directory (19 .md files). Compiles biography data + personality traits into system prompts for each persona. Uses `src/data/soulBios.js` on frontend for display.

### Simulation Engine (`simulation.py`)
3-stage council orchestration:
- **Stage 1 — Ideation**: All selected souls generate independent responses to the brief.
- **Stage 2 — Refinement**: Moderator (Steve Jobs) reviews outputs, guides cross-pollination.
- **Stage 3 — Evaluation**: Evaluator (Jony Ive) scores/ranks. Devil's Advocate challenges.
Each stage streams via SSE. `output_engine.py` compiles the final deliverable.

### Image Generator (`image_generator.py`)
fal.ai integration. Supports multiple models (Flux, Recraft, Ideogram, SDXL). Generates visuals for winning concepts. Requires `FAL_KEY`.

### Video Generator (`video_generator.py`)
fal.ai integration. Supports Kling, Minimax Hailuo, Luma Ray. Generates video from winning concepts or reference images. Requires `FAL_KEY`.

## API Endpoints

### Council / Simulation
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/simulate` | Start council simulation |
| GET | `/api/stream` | SSE stream for real-time updates |
| GET | `/api/status` | Check simulation status |
| GET | `/api/simulations` | List past simulations |
| GET | `/api/simulations/{id}` | Get simulation details |

### Media Generation
Image and video generation endpoints are routed through `image_generator.py` and `video_generator.py`. Both use fal.ai's async API with webhook or polling patterns.

## SSE Event Schema
```
response_start    → { soul_id, stage, model }
response_chunk    → { soul_id, chunk, accumulated }
response_complete → { soul_id, full_response, tokens_used }
stage_complete    → { stage, summary, next_stage }
simulation_done   → { results, winner, media_urls }
error             → { message, code }
```

## OpenRouter Config (`openrouter_client.py`)
Streaming client with model-per-soul support. Config in `config.py`:
- Model assignment per persona (different LLMs for different thinking styles)
- Streaming via SSE relay
- Thinking mode support: `off` (no param), `think` (budget_tokens: 4000), `deep` (budget_tokens: 10000)
- CRITICAL: Never send `thinking` param when mode is `off`. Never send `budget_tokens: 0`.

## Database (`database.py` + `models.py` + `storage.py`)
Neon PostgreSQL via async SQLAlchemy.

### Models (`models.py`)
- `Simulation` — id, brief, status, config, created_at, completed_at
- `Participant` — id, simulation_id, soul_id, model, role
- `Message` — id, simulation_id, participant_id, stage, content, tokens

### Storage (`storage.py`)
CRUD operations: create_simulation, get_simulation, update_simulation, list_simulations.
`simulation_store.py` holds in-memory state for active simulations (not persisted until complete).

## Configuration (`config.py`)
Central config file containing:
- `DEFAULT_PARTICIPANTS`: 19 soul definitions (id, name, team, role, model)
- `PERSONA_COLORS`: 19 color mappings for UI (Marketing=#F27123, Design=#00D9FF, Business=#FFB800)
- OpenRouter API settings (base URL, default models, timeout)
- fal.ai API settings (endpoints, default models)

## Middleware & Utilities
- `middleware.py` — Request/response logging, timing
- `validators.py` — Input validation for simulation config
- `exceptions.py` — Custom HTTP exceptions with structured error responses
- `utils.py` — Shared helpers
- `sse.py` — SSE event formatting and streaming

## Gotchas
- CORS middleware MUST be added BEFORE route definitions. Order in `main.py` matters.
- Port 8001, not 8000. Set via `os.getenv('PORT', '8001')`.
- `FAL_KEY` is separate from `OPENROUTER_API_KEY`. Both required for full functionality.
- Simulation store is in-memory — if backend restarts mid-simulation, active sims are lost. Completed ones persist in PostgreSQL.
- OpenRouter thinking param: include ONLY for think/deep. Omit entirely for off. `budget_tokens: 0` causes API errors.
- Database migrations: Currently using SQLAlchemy auto-create. No Alembic migration history yet.

## Environment
```
PORT=8001
OPENROUTER_API_KEY=sk-or-...
FAL_KEY=...
DATABASE_URL=postgresql://...@neon.tech/...
ALLOWED_ORIGINS=https://genesis-chamber-v4.vercel.app,http://localhost:5173
```
