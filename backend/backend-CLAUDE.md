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

### LLM Council Engine (`council.py`)
3-stage peer-review pipeline for the Council mode:
- **Stage 1 — Collect Responses**: `stage1_collect_responses()` — queries all active models in parallel via `query_models_parallel_individual()`. Each model gets its own reasoning config based on thinking mode + model type. Returns `[{model, response, reasoning?, annotations?, images?}]`.
- **Stage 2 — Peer Rankings**: `stage2_collect_rankings()` — anonymizes Stage 1 responses (Response A, B, C...), asks each model to evaluate and rank. Parses `FINAL RANKING:` section. Returns rankings + label-to-model mapping.
- **Stage 3 — Chairman Synthesis**: `stage3_synthesize_final()` — chairman model receives all responses + rankings, synthesizes final answer. Chairman has its OWN thinking/adaptive/webSearch config (separate from participant config).

### Image Generator (`image_generator.py`)
fal.ai integration. Supports multiple models (Flux, Recraft, Ideogram, SDXL). Generates visuals for winning concepts. Requires `FAL_KEY`.

### Video Generator (`video_generator.py`)
fal.ai integration. Supports Kling, Minimax Hailuo, Luma Ray. Generates video from winning concepts or reference images. Requires `FAL_KEY`.

## Model Roster (21 models, 5 tiers)

### Default Council Models (7: 6 Premium + Grok)
```python
COUNCIL_MODELS = [
    "anthropic/claude-opus-4.6",
    "google/gemini-3.1-pro-preview",
    "perplexity/sonar-pro-search",
    "google/gemini-3-pro-image-preview",
    "openai/gpt-5-image",
    "openai/gpt-5.2",
    "x-ai/grok-4.1-fast",
]
```

### All Tiers
| Tier | Models |
|------|--------|
| **Premium** (6) | Claude Opus 4.6, Gemini 3.1 Pro, Sonar Pro Search, Nano Banana Pro, GPT-5 Image, GPT-5.2 |
| **Balanced** (3) | Gemini 3 Pro (`google/gemini-3-pro-preview`), Claude Sonnet 4.6, GPT-5.3 Codex (`openai/gpt-5.3-codex`) |
| **Efficient** (7) | Claude Haiku 4.5, Gemini 3 Flash (`google/gemini-3-flash-preview`), GPT-5.2 Chat (`openai/gpt-5.2-chat`), MiniMax M2.5 (`minimax/minimax-m2.5`), Kimi K2.5 (`moonshotai/kimi-k2.5`), Kimi K2 Thinking (`moonshotai/kimi-k2-thinking`), Grok 4.1 Fast (`x-ai/grok-4.1-fast`) |
| **Budget** (4) | DeepSeek V3.2, Gemini 2.5 Flash Lite (`google/gemini-2.5-flash-lite`), GPT-4.1 Nano (`openai/gpt-4.1-nano`), Llama 4 Maverick (`meta-llama/llama-4-maverick`) |
| **Specialist** (1) | O3-Pro (`openai/o3-pro`) — always max reasoning, 30x cost |

### Persona → Model Mapping (`config.py:DEFAULT_PARTICIPANTS`)
- Gemini 3.1 Pro: Ogilvy, Rand, Tobias, Buffett
- Claude Sonnet 4.6: Hopkins, Bass, Bezos, Ive
- GPT-5.2: Burnett, Scher
- Gemini 3 Pro: Mary Wells, Susan Kare, Branson
- Grok 4.1 Fast: Halbert, Janoff, Musk, DA
- DeepSeek V3.2: Mateschitz
- Claude Opus 4.6: Jobs (moderator)

## Reasoning System — `openrouter.py`

### `get_reasoning_config(model, thinking_mode, adaptive=False)`

5-level thinking with model-specific behavior:

| Level | Config Output | Token Scaling |
|-------|--------------|--------------|
| `'off'` | `{}` | 1x |
| `'low'` | `{"effort": "low"}` | 2x |
| `'medium'` | `{"effort": "medium"}` | 2x |
| `'high'` | `{"effort": "high"}` | 3x |
| `'max'` | `{"exclude": False}` (Claude 4.6) / `{"effort": "high"}` (others) | 3x |

**Special model behavior:**
- **Sonar models** (`sonar` in ID): always `{}` — search models, no reasoning
- **O3-Pro** (`o3-pro` in ID): always `{"effort": "high"}` — ignores thinking_mode
- **Claude 4.6 + adaptive**: `{"exclude": False}` — no budget cap, model decides depth
- **Claude 4.6 + effort**: `{"effort": level}` when not adaptive
- **All others + max**: maps to `{"effort": "high"}`

### Token Scaling (`query_with_soul()`)
- `high`/`max` + reasoning → `max_tokens * 3` (cap 32k)
- `medium`/`low` + reasoning → `max_tokens * 2` (cap 16k)
- No reasoning → base `max_tokens`

### Image-Capable Models
```python
IMAGE_CAPABLE_MODELS = {'openai/gpt-5-image', 'google/gemini-3-pro-image-preview'}
```
These get `payload["modalities"] = ["text", "image"]`. Response content can be array with `image_url` parts.

## API Endpoints

### Council / Simulation
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/conversations/{id}/message/stream` | SSE streaming council query |
| POST | `/api/conversations` | Create new conversation |
| GET | `/api/conversations` | List conversations |
| GET | `/api/conversations/{id}` | Get conversation |
| DELETE | `/api/conversations/{id}` | Delete conversation |
| POST | `/api/simulation/start/stream` | Start Genesis Chamber simulation |
| GET | `/api/simulations` | List past simulations |
| GET | `/api/simulation/{id}/state` | Get simulation state |

### Council Stream Request (`SendMessageRequest`)
```python
{
    "content": str,
    "models": [str],                    # active model IDs
    "thinking_mode": str,               # "off"|"low"|"medium"|"high"|"max"
    "model_thinking_modes": {str: str}, # per-model overrides
    "adaptive_mode": bool,              # Claude 4.6 adaptive for participants
    "enable_web_search": bool,
    "chairman": {
        "model": str,
        "thinking_mode": str,           # chairman's own thinking level
        "adaptive_mode": bool,          # chairman's own adaptive flag
        "web_search": bool              # chairman's own web search
    }
}
```

### Media Generation
Image and video generation endpoints are routed through `image_generator.py` and `video_generator.py`. Both use fal.ai's async API with webhook or polling patterns.

## SSE Event Schema
```
stage1_start      → {}
stage1_complete   → { data: [{model, response, reasoning?, annotations?, images?}] }
stage2_start      → {}
stage2_complete   → { data: [...], metadata: {label_to_model, aggregate_rankings} }
stage3_start      → {}
stage3_complete   → { data: {model, response, reasoning?} }
title_complete    → { data: {title} }
complete          → {}
error             → { message }
```

For Genesis Chamber simulations, the event schema uses:
```
response_start    → { soul_id, stage, model }
response_chunk    → { soul_id, chunk, accumulated }
response_complete → { soul_id, full_response, tokens_used }
stage_complete    → { stage, summary, next_stage }
simulation_done   → { results, winner, media_urls }
error             → { message, code }
```

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
- `COUNCIL_MODELS`: 5 premium model defaults for LLM Council mode
- `DEFAULT_PARTICIPANTS`: 19 soul definitions (id, name, team, role, model, temperature, max_tokens, color)
- `DEFAULT_MODERATOR`: Steve Jobs on Claude Opus 4.6
- `DEFAULT_EVALUATOR`: Jony Ive on Claude Sonnet 4.6
- `DEFAULT_DEVILS_ADVOCATE`: Advocatus Diaboli on Grok 4.1 Fast
- `PERSONA_COLORS`: 19 color mappings for UI
- `PERSONA_TEAMS`: team membership + cross-team roles
- OpenRouter API settings (base URL, API key)
- fal.ai API settings (`FAL_KEY`)
- Simulation presets (Quick Test, Message Lab, Genesis Chamber, Assembly Line)

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
- Never build reasoning dicts manually — always use `get_reasoning_config()` from `openrouter.py`.
- Grok 4.1 Fast reasoning is binary: `{"enabled": true/false}`, not effort-based. Any non-off thinking mode maps to `{"enabled": true}`.
- Chairman Stage 3 uses `request.chairman.thinking_mode` / `request.chairman.adaptive_mode` / `request.chairman.web_search`, NOT the global participant settings.
- `strip_base64_images()` before passing Stage 1 responses into Stage 2/3 prompts to avoid token overflow.
- `_is_claude46(model)` helper in `council.py` determines which models get the adaptive flag.
- `IMAGE_CAPABLE_MODELS` — only `openai/gpt-5-image` and `google/gemini-3-pro-image-preview`. Do NOT add models that don't support `modalities: ["text", "image"]`.
- `gemini-2.5-flash-image-preview` was REMOVED from IMAGE_CAPABLE_MODELS.
- `grok-4` replaced with `grok-4.1-fast` everywhere — binary reasoning, $0.20/$0.50, Efficient tier.
- `llama-4-maverick` replaced with `gemini-3-pro-preview` — no Meta models in current roster.
- `gpt-5.1` replaced with `gpt-5.2` — no GPT-5.1 in current roster.
- Old thinking modes `'thinking'`/`'deep'` may still appear in saved sessions — frontend migrates on load, backend should treat unknown values gracefully.
- Database migrations: Currently using SQLAlchemy auto-create. No Alembic migration history yet.

## Environment
```
PORT=8001
OPENROUTER_API_KEY=sk-or-...
FAL_KEY=...
DATABASE_URL=postgresql://...@neon.tech/...
ALLOWED_ORIGINS=https://genesis-chamber-v4.vercel.app,http://localhost:5173
```
