# Genesis Chamber V4 — Backend

## Overview
Python FastAPI backend serving both the LLM Council (3-stage) and Genesis Chamber (multi-round simulation). All LLM calls go through OpenRouter. Media generation via fal.ai.

## Key Files

| File | Purpose |
|------|---------|
| `main.py` | FastAPI app, CORS, all route handlers, Pydantic request models |
| `config.py` | 19 personas, team structure, default models, simulation presets |
| `council.py` | 3-stage council orchestration: stage1 (responses) → stage2 (rankings) → stage3 (synthesis) |
| `openrouter.py` | OpenRouter API client, reasoning config, image detection, parallel queries |
| `simulation.py` | Genesis Chamber multi-round simulation engine |
| `soul_engine.py` | Soul document loading + personality injection |
| `image_generator.py` | fal.ai image generation |
| `video_generator.py` | fal.ai video generation |
| `storage.py` | DB CRUD (conversations, messages, simulations) |
| `database.py` | Async SQLAlchemy + Neon PostgreSQL |
| `models.py` | SQLAlchemy ORM models + Pydantic request schemas |

## LLM Council — 3-Stage Pipeline

### Stage 1: Collect Responses
`stage1_collect_responses()` — queries all active models in parallel via `query_models_parallel_individual()`. Each model gets its own reasoning config based on thinking mode + model type. Returns `[{model, response, reasoning?, annotations?, images?}]`.

### Stage 2: Peer Rankings
`stage2_collect_rankings()` — anonymizes Stage 1 responses (Response A, B, C...), asks each model to evaluate and rank. Parses `FINAL RANKING:` section. Returns rankings + label-to-model mapping.

### Stage 3: Chairman Synthesis
`stage3_synthesize_final()` — chairman model receives all responses + rankings, synthesizes final answer. Chairman has its OWN thinking/adaptive/webSearch config (separate from participant config).

## Model Roster (17 models, 5 tiers)

### Default Council Models (Premium tier)
```python
COUNCIL_MODELS = [
    "anthropic/claude-opus-4-6",
    "google/gemini-3.1-pro-preview",
    "perplexity/sonar-pro-search",
    "google/gemini-3-pro-image-preview",
    "openai/gpt-5-image",
]
```

### All Tiers
- **Premium** (5): Claude Opus 4.6, Gemini 3.1 Pro, Sonar Pro Search, Nano Banana Pro, GPT-5 Image
- **Balanced** (5): GPT-5.2, Gemini 3 Pro (`google/gemini-3-pro-preview`), Grok 4.1, Claude Sonnet 4.6, GPT-5.3 Codex (`openai/gpt-5.3-codex`)
- **Efficient** (3): Claude Haiku 4.5, Gemini 3 Flash (`google/gemini-3-flash-preview`), GPT-5.2 Chat (`openai/gpt-5.2-chat`)
- **Budget** (3): DeepSeek V3.2, Gemini 2.5 Flash Lite (`google/gemini-2.5-flash-lite`), GPT-4.1 Nano (`openai/gpt-4.1-nano`)
- **Specialist** (1): O3-Pro (`openai/o3-pro`) — always max reasoning, 30x cost

### Persona → Model Mapping
Defined in `config.py:DEFAULT_PARTICIPANTS`. Key assignments:
- Gemini 3.1 Pro: Ogilvy, Rand, Tobias, Buffett
- Claude Sonnet 4.6: Hopkins, Bass, Bezos, Ive
- GPT-5.2: Burnett, Scher
- Gemini 3 Pro: Mary Wells, Susan Kare, Branson
- Grok 4.1: Halbert, Janoff, Musk, DA
- DeepSeek V3.2: Mateschitz
- Claude Opus 4.6: Jobs (moderator)

## Reasoning System — `openrouter.py`

### `get_reasoning_config(model, thinking_mode, adaptive=False)`

5-level thinking with model-specific behavior:

```
OFF    → {}                          (no reasoning)
LOW    → {"effort": "low"}           (light reasoning)
MEDIUM → {"effort": "medium"}        (balanced, default)
HIGH   → {"effort": "high"}          (deep analysis)
MAX    → {"exclude": False}          (Claude 4.6 only, others → high)
```

**Special cases:**
- **Sonar models** (`sonar` in ID): always `{}` — search models, no reasoning
- **O3-Pro** (`o3-pro` in ID): always `{"effort": "high"}` — ignores thinking_mode
- **Claude 4.6 + adaptive**: `{"exclude": False}` — no budget cap, model decides depth
- **Claude 4.6 + effort**: `{"effort": level}` when not adaptive
- **All others + max**: maps to `{"effort": "high"}`

### Token Scaling
In `query_with_soul()`:
- `high`/`max` + reasoning → `max_tokens * 3` (cap 32k)
- `medium`/`low` + reasoning → `max_tokens * 2` (cap 16k)
- No reasoning → base `max_tokens`

### Image-Capable Models
```python
IMAGE_CAPABLE_MODELS = {'openai/gpt-5-image', 'google/gemini-3-pro-image-preview'}
```
These get `payload["modalities"] = ["text", "image"]`. Response content can be array with `image_url` parts.

## API — Key Endpoints

### `POST /api/conversations/{id}/message/stream`
SSE streaming endpoint. Request body (`SendMessageRequest`):
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

SSE events: `stage1_start` → `stage1_complete` → `stage2_start` → `stage2_complete` → `stage3_start` → `stage3_complete` → `title_complete` → `complete`.

### `POST /api/simulation/start/stream`
Genesis Chamber simulation. Config includes participants, moderator, evaluator, DA settings.

## Rules

- Port is 8001: `os.getenv('PORT', '8001')`.
- CORS middleware MUST be added BEFORE routes in `main.py`.
- Never build reasoning dicts manually — always use `get_reasoning_config()`.
- Chairman Stage 3 uses `request.chairman.thinking_mode` / `request.chairman.adaptive_mode` / `request.chairman.web_search`, NOT the global participant settings.
- `strip_base64_images()` before passing Stage 1 responses into Stage 2/3 prompts to avoid token overflow.
- `_is_claude46(model)` helper used in `council.py` to determine which models get adaptive flag.
- Persona model IDs in `config.py` must match IDs in frontend `mock.js:MODELS` exactly.

## Gotchas

- `gemini-2.5-flash-image-preview` was REMOVED from `IMAGE_CAPABLE_MODELS` — do not re-add.
- `grok-4.1-fast` was replaced with `grok-4.1` everywhere — check config.py if adding Grok references.
- `llama-4-maverick` was replaced with `gemini-3-pro-preview` — no Meta models in current roster.
- `gpt-5.1` was replaced with `gpt-5.2` — no GPT-5.1 in current roster.
- Old thinking modes `'thinking'`/`'deep'` may still appear in saved sessions — frontend migrates on load, but backend should treat unknown values gracefully.
