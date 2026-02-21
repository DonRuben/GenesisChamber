# CLAUDE.md - Technical Notes for Genesis Chamber

This file contains technical details, architectural decisions, and important implementation notes for future development sessions. **Last updated: 2026-02-21. V3.8 Pre-Test Fixes — Upload + Light Mode + Typography.**

## Project Overview

Genesis Chamber is a multi-persona AI creative simulation engine, evolved from Karpathy's `llm-council`. The system orchestrates 5-18 AI participants — each loaded with deep consciousness profiles ("soul documents") — through iterative debate rounds to produce creative concepts, critique them anonymously, and refine them to production quality.

**The full masterplan is in `MASTERPLAN.md`.** This file covers technical implementation details.

### What We Inherited (llm-council)
A working 3-stage deliberation system: parallel LLM querying via OpenRouter, anonymized peer review, chairman synthesis, streaming SSE, React frontend.

### What We've Built (Genesis Chamber)
A 5-stage (+ optional DA Defense), multi-round simulation engine with:
- 19 soul-loaded personas across 3 teams + flexible leadership
- Concept evolution with elimination mechanics, quality gates, and version chaining
- Devil's Advocate (Advocatus Diaboli) with Sanhedrin principle + DA Defense stage + DA Arena
- Real-time SSE streaming with per-participant events
- Thinking mode (off/thinking/deep) with per-participant overrides
- Web search integration via OpenRouter plugins
- Reference file uploads (images, HTML, PDF, documents, ZIP) with text extraction
- Image generation (fal.ai — Recraft V4, Flux 2, Seedream 4.5, Ideogram V3)
- Video generation (fal.ai — Kling 3.0, Veo 3.1, MiniMax Hailuo, Luma Ray 2)
- Markdown export + reveal.js presentations
- Vercel Postgres/Neon database with file-based fallback
- OmniPresent brand design system with custom font + Fibonacci spacing
- **V3 Production Pipeline:**
  - Persistent media archive — local download of fal.ai images/videos, backend serving, Local/Expires badges
  - Prompt Engineering Bible — model-specific prompt optimization for 16+ fal.ai models
  - Simulation Overview — case-study tab with brief, participants, results, media preview
  - Copy-to-clipboard on text blocks (prompts, headlines, taglines, brief)
  - Simulation starring with localStorage persistence
  - Scope-based image generation (active/all/winner) with compare view
  - Cinematic 4-act reveal.js presentations (Sora font, embedded media, score evolution)
- **V3.5 Model Strategy + DA Dashboard:**
  - 20 models across 4 tiers (Premium, Balanced, Efficient, Budget) — 11 new models added
  - Role-based model assignment — Opus only for Moderator, Sonnet for Evaluator, Grok for DA
  - New providers: DeepSeek, Mistral, Moonshot, MiniMax, NVIDIA, Alibaba
  - DA Command Center — launcher config panel (aggression level, attack focus, training status)
  - DA Overview dashboard tab — per-round attack/defense/verdict display with summary stats
  - Enriched DA soul bio ("The Promoter of the Faith")
  - ~50% cost savings per simulation via optimized model assignments
- **V3.8 Pre-Test Fixes:**
  - Upload expansion: .docx (python-docx), .xlsx (openpyxl), .csv text extraction
  - Debug endpoint: `/api/debug/preview-context` — verify brand_context reaches LLM prompt
  - Context token counter in launcher (color-coded: green <50K, yellow <100K, red >100K)
  - .docx drag-and-drop brief auto-fill via server-side extraction
  - Light/dark mode toggle — `[data-theme="light"]` CSS variable overrides, localStorage persistence
  - Typography readability fixes — minimum font sizes, contrast bumps, letter-spacing

## Architecture: Three Engines

```
SOUL ENGINE -> COUNCIL ENGINE -> OUTPUT ENGINE
(load souls)   (run simulation)   (generate deliverables)
```

### Soul Engine (`backend/soul_engine.py`)
- Loads markdown soul documents (400-1400 lines, 7 layers)
- Compiles to system prompts — full injection for 200K+ models, compressed ~3500 tokens for smaller models
- Layers: Cognitive, Emotional, Behavioral, Calibration, Key Works, Quotes, Instructions
- Special compilation for moderator (`compile_moderator_prompt`), Devil's Advocate (`compile_devils_advocate_prompt`)
- Soul docs live in `souls/` directory (19 souls, ~17K total lines)

### Council Engine (`backend/simulation.py`)
- 5 stages per round: Create -> Critique -> (DA Defense) -> Synthesize -> Refine -> Present
- Optional DA Defense stage (Stage 2.5): Creatives defend concepts against DA challenges, DA issues individual verdicts
- Multi-round with configurable elimination schedule (e.g., R1: 0%, R2: 40%, R3: 50%, R4: 67%)
- Concept version chaining: Each refinement snapshots the old concept and links via `previous_version_id`
- Quality gates pause for human approval
- Full state persistence and resume via `SimulationStore` (database + file hybrid)
- SSE streaming with callbacks: `on_stage_start`, `on_stage_complete`, `on_round_complete`, `on_gate_reached`, `on_participant_event`
- Devil's Advocate injects adversarial critiques during Stage 2
- 3-tier fuzzy elimination matching (exact name -> normalized -> fuzzy ratio) for robust concept tracking

### Output Engine (`backend/output_engine.py`)
- Markdown export: full summary, winner package, per-round, per-persona, DA-specific report
- Concept version history rendering in markdown exports
- DA Defense results (defense text, verdict, revised score) in round + DA reports
- reveal.js presentations with Genesis Chamber dark theme
- Image prompt extraction for fal.ai generation
- Video prompt extraction for fal.ai generation
- V3: `generate_image_prompts()` scope parameter — `"winner"`, `"active"` (default), `"all"` (including eliminated)
- V3: `generate_reveal_presentation()` — 4-act storytelling (Challenge → Battle → Reveal → Production)
- V3: `GENESIS_REVEAL_THEME` cinematic overhaul — Sora/Inter/JetBrains Mono, design-tokens.css alignment
- V3: 11 new slide methods (`_slide_opening`, `_slide_brief`, `_slide_roster`, `_slide_round_intro`, `_slide_round_concepts`, `_slide_round_direction`, `_slide_winner_reveal`, `_slide_runner_up`, `_slide_evolution`, `_slide_media_gallery`, `_slide_production_spec`) + updated `_slide_credits`
- V3: Legacy slide methods preserved (`_slide_title`, `_slide_round`, `_slide_winner`, `_slide_image_gallery`)

## Soul Document Roster (19 Personas)

### Marketing & Strategy Team (5 souls)
| Persona | Model | Lines | Color |
|---------|-------|-------|-------|
| David Ogilvy | `google/gemini-3-pro` | 1377 | #F59E0B |
| Claude Hopkins | `anthropic/claude-sonnet-4.6` | 1338 | #3B82F6 |
| Leo Burnett | `openai/gpt-5.1` | 1277 | #10B981 |
| Mary Wells Lawrence | `meta-llama/llama-4-maverick` | 1158 | #EC4899 |
| Gary Halbert | `x-ai/grok-4` | 1002 | #EF4444 |

### Design & Visual Team (6 souls)
| Persona | Model | Lines | Color |
|---------|-------|-------|-------|
| Paul Rand | `google/gemini-3-pro` | 918 | #8B5CF6 |
| Paula Scher | `openai/gpt-5.1` | 827 | #F97316 |
| Saul Bass | `anthropic/claude-sonnet-4.6` | 996 | #DC2626 |
| Susan Kare | `meta-llama/llama-4-maverick` | 811 | #06B6D4 |
| Rob Janoff | `x-ai/grok-4` | 1210 | #A3E635 |
| Tobias van Schneider | `google/gemini-3-pro` | 1308 | #D946EF |

### Business & Strategy Team (5 souls)
| Persona | Model | Lines | Color |
|---------|-------|-------|-------|
| Elon Musk | `x-ai/grok-4` | 690 | #1DA1F2 |
| Jeff Bezos | `anthropic/claude-sonnet-4.6` | 442 | #FF9900 |
| Warren Buffett | `google/gemini-3-pro` | 477 | #374151 |
| Richard Branson | `meta-llama/llama-4-maverick` | 402 | #E11D48 |
| Dietrich Mateschitz | `deepseek/deepseek-v3.2` | 399 | #1E40AF |

### Leadership (flexible assignment)
| Persona | Default Role | Model | Lines | Color |
|---------|-------------|-------|-------|-------|
| Steve Jobs | Moderator | `anthropic/claude-opus-4-6` | 1029 | #6B7280 |
| Jony Ive | Evaluator | `anthropic/claude-sonnet-4.6` | 735 | #9CA3AF |

### Special Roles
| Persona | Role | Model | Lines | Color |
|---------|------|-------|-------|-------|
| Advocatus Diaboli | Devil's Advocate (optional) | `x-ai/grok-4` | 542 | #DC2626 |

## Backend Structure (`backend/`)

### Core Files

**`config.py`** — Central configuration
- `COUNCIL_MODELS`: `gpt-5.2`, `gemini-3-pro`, `claude-sonnet-4.6`, `grok-4`
- `CHAIRMAN_MODEL`: `google/gemini-3-pro`
- `TEAMS`: 5 divisions (marketing, design, business, leadership, custom)
- `PERSONA_TEAMS` / `PERSONA_COLORS`: Full mapping for all 19 personas
- `DEFAULT_PARTICIPANTS`: 16 participant configs with model/soul/temperature/color (V3.5: role-based cost/quality assignments across 7 providers)
- `DEFAULT_MODERATOR`: Steve Jobs on Claude Opus 4.6 (ONLY Opus usage — elimination decisions need deep reasoning)
- `DEFAULT_EVALUATOR`: Jony Ive on Claude Sonnet 4.6 (V3.5: downgraded from Opus — structured scoring)
- `DEFAULT_DEVILS_ADVOCATE`: Advocatus Diaboli on Grok 4 (V3.5: naturally adversarial, replaces Claude Sonnet)
- `SIMULATION_PRESETS`: 4 presets (quick_test, message_lab, genesis_chamber, assembly_line)
- `ROUND_MODES`: diverge -> converge -> deepen -> gladiator -> polish -> spec
- Environment variables: `OPENROUTER_API_KEY`, `DATABASE_URL`, `FAL_KEY`, `ELEVENLABS_API_KEY`
- Backend runs on **port 8001** (or `$PORT`)

**`main.py`** — FastAPI application
- CORS: `allow_origins=["*"]` (any deployment can reach backend)
- Database startup/shutdown lifecycle hooks
- Original llm-council endpoints preserved (conversations, streaming messages)
- Simulation management: start, stream, status, state, rounds, gates, transcript
- Soul management API: list, read content, update content, download, upload
- Config API: models, participants, teams
- Reference file uploads: images, HTML, text, documents (.docx, .xlsx, .csv), PDF, ZIP with text extraction
- V3.8: `_OFFICE_EXTS = {"docx", "doc", "xlsx"}`, `_extract_text_from_docx()`, `_extract_text_from_xlsx()`, `_extract_text_from_csv()`
- V3.8: `POST /api/debug/preview-context` — preview LLM prompt without calling any API
- Markdown export: summary, winner, per-round, per-persona
- Media generation: images, videos, combined gallery, ZIP download
- DA Arena API: 5 endpoints for interaction extraction, rating, training, and suggestions
- `DARatingRequest`: Pydantic model for DA interaction ratings (JSON body, not query params)
- Upload serving with database fallback for cross-deploy survival
- `clean_soul_name()`: Canonical lookup + regex cleanup for soul document headings
- V3: `GET /api/simulation/{sim_id}/media/{media_type}/{filename}` — serve locally persisted media (path traversal prevention)
- V3: `POST /api/simulation/{sim_id}/persist-media` — migration endpoint: download + persist fal.ai URLs not yet saved locally
- V3: `GET /api/prompt-bible/strategies` — all model prompt strategies for UI display
- V3: `POST /api/prompt-bible/optimize` — preview prompt optimization for a concept
- V3: `GenerateImagesRequest.scope`: `"winner"` | `"active"` | `"all"` — controls which concepts get images generated
- V3.5: `GET /api/config/models` — 4 tiers (Premium, Balanced, Efficient, Budget) with 20 models across 7 providers
- V3.5: `GET /api/config/participants` — now includes `da_training_summary` (total_rated, training_level, last_trained)

**`simulation.py`** — Core 5-stage engine (+ optional DA Defense)
- `OutputParser`: 3-tier structured output parsing (strict delimiters -> loose extraction -> raw fallback)
- `GenesisRound`: Runs one complete round (configurable 3 or 5 stages + DA Defense)
- `GenesisSimulation`: Orchestrates N rounds with elimination, quality gates, state persistence
- Callbacks for SSE streaming: stage start/complete, round complete, gate reached, participant thinking/response
- Devil's Advocate integration during critique stage (Stage 2)
- `_stage_da_defense()`: Two-phase adversarial dialog — Phase 1: creatives defend in parallel, Phase 2: DA issues individual verdicts per concept (avoids position bias)
- `_stage_refinement()` with concept version chaining: snapshots old concept as `ConceptVersion`, links via `previous_version_id`, copies accumulated scores
- `_stage_synthesis()` accepts optional `da_defense_results` to include defense/verdict context in moderator summary
- `_add_transcript()` stores comprehensive per-stage data — V1 fix stopped ~60% data loss by adding: full critique arrays (strengths/weaknesses lists, fatal_flaw, is_devils_advocate flag), dual-tier synthesis (flat keys for backward compat + nested `synthesis` dict for TranscriptViewer), refined concept arrays (evolution_notes), presentation arrays (concept_name, persona, content), and DA defense arrays (challenge, defense_text, verdict, revised_score)
- 3-tier fuzzy elimination matching (exact -> normalized -> fuzzy ratio with 70% threshold)
- 5-minute timeout per stage with graceful degradation

**`models.py`** — Pydantic schemas
- `ParticipantConfig`: model, soul_document, role, temperature, thinking_mode, enable_web_search, color
- `SimulationConfig`: name, type, rounds, stages_per_round, participants, moderator, evaluator, devils_advocate, da_aggression_level (V3.5), da_attack_focus (V3.5), elimination_schedule, quality_gates, brief, brand_context
- `ConceptVersion`: Snapshot of concept at specific round/stage (name, headline, tagline, idea, visual_direction, evolution_notes, score, timestamp)
- `Concept`: Full creative concept with 14 fields + scores + status lifecycle + `versions: List[ConceptVersion]` + `previous_version_id: Optional[str]`
- `Critique`: Anonymized peer review with score, strengths, weaknesses, fatal_flaw
- `DADefenseResult`: Creative's defense against DA challenge — concept_id, persona_id, defense_text, da_challenge, verdict, verdict_details, revised_score
- `DAInteraction`: Full DA interaction for Arena review — DA attack (critique text, fatal flaw, weaknesses, score, demanded change), creative defense, DA verdict, human rating, round/concept metadata (~30 fields)
- `ModeratorDirection`: surviving/eliminated concepts, merge suggestions, constraints, direction_notes, one_more_thing
- `EvaluatorAssessment`: Per-concept craft quality assessment
- `StageResult`, `RoundResult`, `QualityGate`
- `SimulationState`: + `da_interactions: List[Dict]` + `da_ratings: Dict[str, Dict]` for DA Arena persistence

**`soul_engine.py`** — Soul document loading and prompt compilation
- `load_soul()`: Parse markdown into 7 layers (cognitive, emotional, behavioral, calibration, key_works, quotes, instructions)
- `compile_system_prompt()`: Full injection or compressed compilation based on model context
- `compile_moderator_prompt()`: Special Stage 3 synthesis prompt with round-specific instructions
- `compile_devils_advocate_prompt()`: Adversarial mandate with Sanhedrin principle
- `STAGE_TASKS`: Structured output templates for all 5 stages with `===TAG_START===` / `===TAG_END===` delimiters
- `ROUND_INSTRUCTIONS` / `MODERATOR_ROUND_INSTRUCTIONS`: Per-round behavioral guidance

**`openrouter.py`** — OpenRouter API client
- `query_model()`: Single async model query with reasoning + plugins support
- `query_models_parallel()`: Parallel queries with shared reasoning config
- `query_models_parallel_individual()`: Parallel queries with per-model reasoning configs
- `query_with_soul()`: Soul-injected query with system prompt, temperature, thinking mode scaling
- `query_with_soul_parallel()`: Parallel soul-injected queries (used by simulation engine)
- `get_reasoning_config()`: Model-specific reasoning configuration:
  - Claude 4.6: adaptive thinking (no budget, most powerful)
  - Claude 4.5: effort-based high
  - GPT-5.2: effort-based high
  - Gemini 3 Pro: effort-based high
  - Grok 4: effort-based high + native X.com search
  - Others: effort medium/high based on tier

**`simulation_store.py`** — Hybrid state persistence
- Database-first with file-based fallback
- `save_state()` / `save_state_async()`: Write to both DB and file
- `load_state()`: Try DB, fall back to file
- `list_simulations_async()`: Combined DB + file listing
- State saved as JSON in `output/{sim_id}/state.json`

**`storage.py`** — llm-council conversation storage (preserved)
- JSON conversations in `data/conversations/`
- Conversation CRUD, archiving, title generation

**`council.py`** — Original 3-stage llm-council logic (preserved, backward compatible)
- `stage1_collect_responses()`, `stage2_collect_rankings()`, `stage3_synthesize_final()`
- Supports thinking mode, web search, per-model overrides

**`database.py`** — Vercel Postgres/Neon via asyncpg
- `DatabasePool`: Singleton connection pool (min 1, max 5, SSL required)
- `UploadDB`: CRUD for uploaded reference files (survives redeploys)
- `SimulationDB`: Simulation state persistence in Postgres
- `ensure_schema()`: Auto-creates tables on startup
- Graceful fallback when `DATABASE_URL` is not set

**`output_engine.py`** — Deliverable generation
- `generate_markdown_summary()`: Full simulation summary
- `generate_markdown_winner()`: Winner concept package
- `generate_markdown_round()`: Per-round export + DA Defense section (defense text, verdict, revised score)
- `generate_markdown_persona()`: Per-persona export
- `generate_markdown_devils_advocate()`: Full DA report with critiques, defense results, verdicts, evolution notes fallback
- `generate_production_package()`: Production-ready winner package with full specs
- `_concept_to_md()`: Concept rendering with version history chain + previous_version_id lineage
- `generate_reveal_presentation()`: V3 4-act storytelling structure (Challenge → Battle → Reveal → Production) with Sora/Inter/JetBrains Mono fonts, CSS variables matching design-tokens.css, embedded media gallery, score evolution bars, winner card with gold gradient
- `generate_image_prompts()`: Extract IMAGE_PROMPT fields for fal.ai. V3: `scope` parameter (`"winner"` | `"active"` | `"all"`) + enriched prompt entries (color_mood, headline, tagline, idea, persona_id)
- V3 slide methods: `_slide_opening`, `_slide_brief`, `_slide_roster`, `_slide_round_intro`, `_slide_round_concepts`, `_slide_round_direction`, `_slide_winner_reveal`, `_slide_runner_up`, `_slide_evolution`, `_slide_media_gallery`, `_slide_production_spec`, `_slide_credits`
- Legacy preserved: `_slide_title`, `_slide_round`, `_slide_winner`, `_slide_image_gallery`

**`image_generator.py`** — fal.ai image integration
- Models: Recraft V4 (raster + vector/SVG), Flux 2 Pro/Max, Seedream 4.5, Ideogram V3, Nano Banana Pro
- REST calls via fal.ai queue API with polling
- Batch generation with per-concept model auto-selection
- V3: `from .prompt_bible import optimize_prompt` — optimizes prompts before generation
- V3: Stores both `result["original_prompt"]` and `result["optimized_prompt"]`
- V3: Downloads generated images to `output/{sim_id}/media/images/` (60s timeout via httpx)
- V3: Sets `local_path`, `filename`, `file_size`, `generated_at`, `concept_status`, `visual_direction` on each result

**`video_generator.py`** — fal.ai video integration
- Image-to-Video: Kling 3.0 Pro, Kling O3 Pro, MiniMax Hailuo 2.3, Luma Ray 2
- Text-to-Video: Kling O3 Pro, Google Veo 3.1
- Quality tiers: hero, standard, draft
- V3: `from .prompt_bible import optimize_prompt` — optimizes prompts before generation
- V3: Stores both `original_prompt` and `optimized_prompt`
- V3: Downloads videos to `output/{sim_id}/media/videos/` (180s timeout via httpx)
- V3: Sets `local_path`, `filename`, `file_size`, `generated_at` on each result

**`migrate.py`** — Database migration utilities

**`da_training.py`** — DA Arena training and analysis
- `extract_da_interactions(state)`: Pull DA critiques from transcript, cross-reference DA Defense results, check evolution notes for creative response
- `save_interactions_to_state(state, interactions)`: Store interactions to `state.da_interactions`
- `load_interactions_from_state(state)`: Load `DAInteraction` objects from state
- `save_rating(state, interaction_id, rating, notes)`: Update rating in `da_interactions` + `da_ratings`
- `generate_training_report(state)`: Aggregate patterns (brilliant/effective/weak/unfair), effectiveness score, response rate, verdict stats
- `generate_refinement_suggestions(state)`: Human-readable markdown suggestions for manual soul editing (no auto-rewrite)

**`prompt_bible.py`** — V3 model-specific prompt optimization for fal.ai generation
- `MODEL_STRATEGIES`: 16+ fal.ai model entries (flux_2_pro, flux_2_max, seedream_4_5, ideogram_v3, recraft_v4, nano_banana_pro, veo_3_1_t2v, veo_3_1_extend, kling_3_i2v, kling_o3_i2v, kling_o3_t2v, minimax_i2v, minimax_fast_i2v, minimax_t2v, luma_i2v, luma_t2v)
- Each strategy: `name`, `category` (image/video), `strengths`, `prompt_rules`, `style_map`, `camera_map` (Flux only), `quality_suffix`
- Strategy inheritance via `inherits` key — model variants inherit parent config (e.g., flux_2_max inherits flux_2_pro)
- `PromptOptimizer` class: transforms creative advertising prompts into model-optimal prompts
  - `optimize(concept, model_key)` — main entry, routes to builder based on model category + prompt_rules
  - `_build_image_prompt()` — 6-part structure: Subject + Visual + Style + Camera + Color + Quality (Flux, Seedream, Recraft, Nano Banana)
  - `_build_typography_prompt()` — Ideogram V3: headline in quotes (critical for text rendering), font/layout focus
  - `_build_video_prompt()` — Kling, MiniMax, Luma: camera movement first, then action + style
  - `_build_json_prompt()` — Veo 3.1: structured JSON with scene/camera/lighting/audio/style/color_grade (300%+ better consistency per Google docs)
  - `_clean_advertising_language()` — strips abstract phrases ("suggesting trust", "evoking possibility") that confuse image models
  - `_detect_best_style()`, `_suggest_camera()`, `_extract_camera_movement()`, `_detect_ambient_audio()`
- Module-level convenience: `optimize_prompt()`, `get_strategy()`, `get_all_strategies()`
- Research sources: Flux 2 (docs.bfl.ml), Veo 3.1 (Google Cloud), Seedream 4.5 (fal.ai), Ideogram V3, Recraft V4

## API Endpoints

### llm-council Mode (preserved)
- `GET /api/conversations` — List conversations
- `POST /api/conversations` — Create conversation
- `GET /api/conversations/{id}` — Get conversation
- `POST /api/conversations/{id}/message` — Send message (3-stage council)
- `POST /api/conversations/{id}/message/stream` — SSE streaming council
- `DELETE`, `PATCH .../rename`, `PATCH .../archive` — Management

### Soul Management
- `GET /api/souls` — List all souls with team metadata
- `GET /api/souls/{id}/content` — Get raw markdown content
- `PUT /api/souls/{id}/content` — Update soul content
- `GET /api/souls/{id}/download` — Download as .md file
- `POST /api/souls/upload` — Upload new soul (file + team + color)

### Simulation
- `POST /api/simulation/start` — Start simulation (background)
- `POST /api/simulation/start/stream` — Start with SSE streaming
- `POST /api/simulation/quick-start` — Quick-start with defaults
- `GET /api/simulations` — List all simulations
- `GET /api/simulation/{id}/status` — Current status
- `GET /api/simulation/{id}/state` — Full state
- `GET /api/simulation/{id}/round/{n}` — Round results
- `POST /api/simulation/{id}/gate/{n}/approve` — Approve quality gate
- `GET /api/simulation/{id}/transcript` — Full transcript + event log
- `DELETE`, `PATCH .../rename`, `PATCH .../archive` — Management

### Export
- `GET /api/simulation/{id}/export/summary` — Markdown summary
- `GET /api/simulation/{id}/export/winner` — Winner package
- `GET /api/simulation/{id}/export/round/{n}` — Round markdown
- `GET /api/simulation/{id}/export/persona/{pid}` — Persona markdown
- `GET /api/simulation/{id}/export/devils-advocate` — DA-specific report
- `GET /api/simulation/{id}/export/production` — Production-ready winner package
- `GET /api/simulation/{id}/presentation` — reveal.js HTML

### Media
- `POST /api/simulation/{id}/generate-images` — Generate via fal.ai (V3: accepts `scope` in body)
- `GET /api/simulation/{id}/images` — Get generated images
- `POST /api/simulation/{id}/generate-videos` — Generate via fal.ai
- `GET /api/simulation/{id}/video-tiers` — Quality tiers
- `GET /api/simulation/{id}/videos` — Get generated videos
- `GET /api/simulation/{id}/generated` — All generated content
- `GET /api/simulation/{id}/download/all` — ZIP download
- `GET /api/simulation/{id}/media/{type}/{filename}` — V3: Serve locally persisted media (images/videos)
- `POST /api/simulation/{id}/persist-media` — V3: Download + persist any fal.ai URLs not yet saved locally

### Prompt Bible (V3)
- `GET /api/prompt-bible/strategies` — All model prompt strategies (16+ models)
- `POST /api/prompt-bible/optimize` — Preview prompt optimization for a concept (body: `{concept, model_key}`)

### Config
- `GET /api/simulation/presets` — List presets
- `GET /api/config/models` — Available models by tier
- `GET /api/config/participants` — Default configs
- `GET /api/config/teams` — Team definitions

### DA Arena
- `POST /api/simulation/{id}/da/extract` — Extract DA interactions from completed simulation
- `GET /api/simulation/{id}/da/interactions` — Get all DA interactions for review
- `POST /api/simulation/{id}/da/rate` — Rate interaction (JSON body: `{interaction_id, rating, notes}`)
- `GET /api/simulation/{id}/da/training` — Get aggregated training report
- `GET /api/simulation/{id}/da/suggestions` — Get soul refinement suggestions (manual review only)

### Reference Uploads
- `POST /api/upload/reference` — Upload file (image, HTML, text, documents, PDF, ZIP)
- `POST /api/debug/preview-context` — Debug: preview LLM prompt with brief + brand_context (no API calls)
- `GET /api/uploads/{id}/{path}` — Serve uploaded files

## Frontend Structure (`frontend/src/`)

### Design System (`design-tokens.css`)
- **OmniPresent Brand**: Custom `@font-face` (OmniPresent TTF from CDN)
- **Color Foundation**: `--op-void` (#1B1D22), `--op-flame` (#F27123), `--op-light` (#E9E7E4)
- **Genesis Extensions**: `--gc-cyan` (#00D9FF), `--gc-magenta` (#FF006E), `--gc-gold` (#FFB800)
- **Stage Colors**: create (green), critique (amber), da-defense (#DC2626 red), synthesize (red), refine (blue), present (purple)
- **Typography**: OmniPresent (display), Inter (body/data), Playfair Display (serif accent), JetBrains Mono (code)
- **Spacing**: Fibonacci scale (8, 13, 21, 34, 55, 89px)
- **Surfaces**: 4-tier dark surface system (#1B1D22 -> #33363E)
- **Utility Classes**: `.gc-btn`, `.gc-badge`, `.gc-status`, `.gc-card`, `.gc-input`, `.gc-spinner`
- V3: `.gc-btn-copy` (absolute-positioned copy button, appears on hover) + `.gc-copyable` (parent class that triggers copy button visibility)
- V3.8: `[data-theme="light"]` block overrides surface, text, border, shadow variables for light mode. Brand accents (cyan, gold, magenta, stage/status colors) stay unchanged. Scrollbar overrides included
- V3.8: Readability fixes section — `.gc-badge` min size, `max()` font-sizes on small text classes

### Core Files
- `App.jsx` — Main orchestration, manages conversations + simulations
- `api.js` — API client with all endpoint methods + SSE streaming + DA Arena methods (extract, interactions, rate, training, suggestions) + export URL helpers (DA report, production package)
- `main.jsx` — React entry point
- `design-tokens.css` — OmniPresent brand design system
- `index.css` — Global styles + markdown content styling
- `App.css` — App layout styles

### Utilities (`utils/`)
- `clipboard.js` — Clipboard copy helper
- `modelDisplayNames.js` — Maps OpenRouter model IDs to display labels

### Data (`data/`)
- `soulBios.js` — Biographical data for all 20 personas (19 souls + Advocatus Diaboli). Each entry keyed by soul ID (e.g., `david-ogilvy`, `elon-musk`, `devils-advocate`) with fields: `title`, `era`, `biggestSuccess`, `process`, `knownFor`, `style`, `whyInChamber`. Used by `SoulInfoCard.jsx` for info modals. Custom uploads that aren't in this file get auto-generated fallback bios

### Components — llm-council (preserved)
- `ChatInterface.jsx` — Chat mode UI
- `Stage1.jsx` — Tab view of model responses
- `Stage2.jsx` — Anonymized critique display with de-anonymization
- `Stage3.jsx` — Chairman synthesis (green-tinted)
- `Sidebar.jsx` — Conversation/simulation list with rename/archive/delete. V3: simulation starring via `localStorage('gc-starred-sims')`, starred sort to top, optional filter. V3.8: Light/dark mode toggle in footer (sun/moon icon), persists via `localStorage('gc-theme')`, default dark

### Components — Genesis Chamber

**Launcher & Config:**
- `SimulationLauncher.jsx` — Full 3-step config wizard (type/participants/brief). Jobs/Ive appear in functional team sections via `cross_teams` (Jobs in Marketing, Ive in Design+Marketing) with "Moderator"/"Evaluator" badges. Dual-role toggle lets leadership also participate as creative contributors. V3.8: .docx brief auto-fill via server extraction, context token counter (green/yellow/red), expanded file accept (.docx, .xlsx, .csv)
- `StepIndicator.jsx` — 3-step progress indicator
- `ConfigSummary.jsx` — Right sidebar with preset, participant count, costs
- `ModelSelector.jsx` — Dropdown for OpenRouter models (grouped by tier)
- `SoulInfoCard.jsx` — Modal showing soul document preview + metadata. Loads bios from `soulBios.js`; for custom/uploaded souls without a hardcoded bio, generates fallback: title from team name (e.g., "Marketing Team Member"), era "Custom", and `whyInChamber` from soul excerpt
- `HelpTooltip.jsx` + `helpContent.js` — Contextual help popovers

**Dashboard & Live:**
- `SimulationDashboard.jsx` — Live simulation monitoring + conditional DA Arena tab (shown when DA enabled + simulation completed). V3: Overview tab added as first position in VIEW_TABS
- `StatusHeader.jsx` — Status bar with round/stage info
- `LiveFeed.jsx` — Real-time SSE event feed (+ `da_defense` stage verb/label)
- `ChamberAnimation.jsx` — Animated visual during processing
- `RoundProgress.jsx` — Visual round/stage progress
- `Skeleton.jsx` — Loading skeleton placeholders

**Concepts & Critique:**
- `ConceptCard.jsx` — Concept display with evolution tracking. V3: CopyButton on headline, tagline, idea, image_prompt
- `CritiquePanel.jsx` — Anonymized critique scores + feedback
- `ModeratorDirection.jsx` — Decisions, eliminations, merge suggestions
- `QualityGate.jsx` — Human approval checkpoints
- `EliminationTimeline.jsx` — Visual elimination across rounds

**Output & Export:**
- `PresentationGallery.jsx` — Browse concepts across rounds
- `TranscriptViewer.jsx` — Interactive full transcript with V1 enrichment: bulleted critique strengths/weaknesses lists, DA badge on devil's advocate critiques, score color-coding (high/mid/low), synthesis badges showing surviving (green) and eliminated (red) concepts with reasons, moderator direction_notes, DA Defense cards (challenge + defense text + verdict with accepted/insufficient styling + revised score), evolution labels on refined concepts, and presentation cards with concept name + persona. All stage types fully rendered
- `TranscriptViewer.css` — Transcript styles including ~90 lines of DA defense card styles + critique cards + synthesis badges + evolution labels + presentation items
- `GeneratedGallery.jsx` — Image + video gallery with download. V3: `getMediaUrl()` prefers local files over fal.ai URLs, Local/Expires badges, "Creative Prompt" + "Optimized for {model}" display with CopyButton, Gallery/Compare view toggle, compare grid (side-by-side with 1:1 images, concept name, persona, status badges)
- `OutputPanel.jsx` — Export buttons (markdown, presentation, media). V3: `imageScope` state (`"active"` | `"all"` | `"winner"`), scope selector dropdown, CopyButton on prompt text

**DA Arena:**
- `DAArena.jsx` — Post-simulation DA interaction review with two modes:
  - **Focus Mode**: 3D flashcard with CSS `rotateY` flip — DA attack (front) / defense + verdict (back)
  - **Overview Mode**: Scrollable grid of compact interaction cards with click-to-focus
  - 4 rating buttons: Brilliant / Effective / Weak / Unfair (keyboard shortcuts: 1-4, Space to flip, arrows to navigate)
  - Progress bar with gradient fill, go-back/forward navigation, auto-advance after rating
  - Training report panel with effectiveness stats + soul refinement suggestions (manual only)
- `DAArena.css` — ~450 lines using design-tokens.css variables exclusively (3D perspective, backface-visibility, color-specific glow effects)

**Shared:**
- `Icons.jsx` — SVG icon components. V3: Added `IconStar`. V3.8: Added `IconSun`, `IconMoon` for theme toggle
- `CopyButton.jsx` — V3: Reusable copy-to-clipboard component (`navigator.clipboard.writeText`). Shows IconCopy, switches to IconCheck for 2s after copy. CSS class `.gc-btn-copy` (absolute positioned, appears on parent `.gc-copyable` hover)

**V3 — Overview & Archive:**
- `SimulationOverview.jsx` + `SimulationOverview.css` — Case study overview tab (first in dashboard). Sections: header (name, type, date, status), brief card with CopyButton, brand context, participants grid (moderator/evaluator/DA + creatives with color-coded borders), results (winner/runner-up/stats), media gallery preview (first 5 images with `getMediaUrl()` local preference)

**V3.5 — DA Command Center:**
- `SimulationLauncher.jsx` — DA section expanded to full config panel when enabled: soul profile card, model selector, aggression level selector (analytical/aggressive/ruthless), training status display (interactions rated, level, last date), attack focus checkboxes (6 areas)
- `SimulationDashboard.jsx` — `DAOverview` inline component: "Devil's Advocate" tab between Direction and Transcript. Shows DA attacks, defenses, verdicts per round per concept. Summary stats (total attacks, defenses, survived, fell). Conditional on `hasDA`
- `soulBios.js` — Enriched devils-advocate bio: "The Promoter of the Faith", three-phase attack process, Sanhedrin Principle

## Key Design Decisions

### Five-Stage Round System (+ Optional DA Defense)
1. **CREATE** — Independent concept generation (soul-loaded, parallel queries)
2. **CRITIQUE** — Anonymized peer review (concepts as A, B, C) + Devil's Advocate
3. **DA DEFENSE** *(optional, Stage 2.5)* — Creatives defend concepts against DA challenges, DA issues individual verdicts
4. **SYNTHESIZE** — Moderator direction + evaluator craft assessment (includes DA defense context when available)
5. **REFINE** — Directed revision based on feedback (with concept version chaining)
6. **PRESENT** — Group presentation with moderator reaction

### Multi-Model Cognitive Diversity (V3.5: 4 Tiers, 20 Models, 7 Providers)
Different LLMs assigned for different cognitive profiles via OpenRouter:
- **Tier 1 Premium**: `anthropic/claude-opus-4-6` ($15/M), `openai/gpt-5.2` ($15/M), `openai/gpt-5.1` ($5/M), `google/gemini-3-pro` ($7/M, 2M context)
- **Tier 2 Balanced**: `anthropic/claude-sonnet-4.6` ($3/M, 1M context), `x-ai/grok-4` ($3/M), `x-ai/grok-4.1` ($3/M), `mistralai/mistral-large` ($2/M)
- **Tier 3 Efficient**: `meta-llama/llama-4-maverick` ($0.50/M), `anthropic/claude-haiku-4.5` ($0.25/M), `deepseek/deepseek-v3.2` ($0.28/M), `deepseek/deepseek-r1` ($0.55/M), `google/gemini-3-flash` ($0.10/M, 1M), `qwen/qwen-3-235b` ($0.30/M)
- **Tier 4 Budget** (V3.5): `moonshot/kimi-k2.5` ($0.10/M), `minimax/minimax-m2.5` ($0.15/M), `nvidia/llama-3.3-nemotron` (free)

### Role-Based Model Strategy (V3.5)
- **Moderator** (Steve Jobs): Claude Opus 4.6 — ONLY Opus usage. Elimination decisions need deep reasoning
- **Evaluator** (Jony Ive): Claude Sonnet 4.6 — structured scoring, downgraded from Opus ($10/M savings)
- **Devil's Advocate**: Grok 4 — naturally adversarial. Claude models pull punches in adversarial mode
- **Participants**: Mix of Gemini 3 Pro (4), Sonnet 4.6 (3), GPT-5.1 (2), Grok 4 (3), Llama 4 (3), DeepSeek V3.2 (1)
- Cost: ~$5-10/simulation (old: $15-25) — ~50% savings

### Web Search Cost/Behavior (V3.5)
- OpenRouter charges ~$0.005/query. With 19 participants x 5 stages x 8 rounds = ~760 potential searches = ~$3.80/simulation
- Model decides whether to search (self-regulating). Enable for real-brand briefs, disable for abstract creative
- Grok 4 has native X.com search integration

### Flexible Leadership System
- **Any soul can be moderator or evaluator** — selected via dropdown in SimulationLauncher
- Defaults: Steve Jobs (moderator) on Claude Opus 4.6, Jony Ive (evaluator) on Claude Sonnet 4.6
- **Dual-role toggle**: Leadership personas can simultaneously participate as creative contributors
- Cross-team membership: Jobs `cross_teams: ["marketing"]`, Ive `cross_teams: ["design", "marketing"]`

### Devil's Advocate (Advocatus Diaboli)
- Optional per-simulation toggle (542-line soul document)
- Default model: Grok 4 (V3.5) — naturally provocative, better adversarial voice than Claude
- Based on the Catholic canonization process (Pope Sixtus V, 1587)
- Scores concepts 1-2 points lower — the standard is real-world survival
- Identifies hidden assumptions and specific failure scenarios for every concept
- **Sanhedrin Principle**: If all critics agree, that agreement itself is suspicious
- V3.5: Configurable aggression level (analytical/aggressive/ruthless) and attack focus areas
- Every criticism must include what would fix the problem
- Ends critiques with: "This concept earns canonization if it can answer: [specific challenge]"

### DA Defense Stage (Stage 2.5)
- Runs after Stage 2 (Critique), before Stage 3 (Synthesis), only when DA is enabled and DA critiques exist
- **Phase 1 — Creative Defense**: Each creative with a DA-challenged concept defends in parallel. Prompt includes DA's fatal flaw, weaknesses, and demanded change. Creative must: (1) argue if fatal flaw is actually fatal, (2) accept or counter each weakness, (3) accept or refuse the demanded change
- **Phase 2 — DA Verdict**: DA issues individual verdict per concept (not combined, to avoid position bias). Parses `VERDICT:` (accepted/insufficient), `DETAILS:`, `REVISED_SCORE:` (1-10)
- Sub-stage numbering: `stage_name="da_defense"`, `stage_num=2` — avoids breaking `RoundProgress.jsx` array indexing
- Results passed to `_stage_synthesis()` so moderator sees full defense/verdict context
- Full defense cycle recorded in transcript via `_add_transcript()` handler

### DA Command Center (V3.5)
- **Launcher Config Panel**: When DA enabled, expands to show: soul profile, model selector (default Grok 4), aggression level (analytical/aggressive/ruthless), training status (rated count, level, last date), attack focus (6 checkboxes)
- **Dashboard Overview Tab**: "Devil's Advocate" tab between Direction and Transcript. Extracts DA critiques + defense results from transcript. Per-round cards: attack (fatal flaw, demanded change, score) + defense (text, verdict, revised score). Summary stats bar: attacks, defenses, survived, fell
- **Config Fields**: `SimulationConfig.da_aggression_level` (Literal), `SimulationConfig.da_attack_focus` (List[str])
- **Training Stats Endpoint**: `GET /api/config/participants` includes `da_training_summary` — aggregates rated DA interactions across all simulations

### DA Arena (Post-Simulation Review)
- **Backend** (`da_training.py`): Extract DA interactions from transcript, rate them, generate training reports + soul refinement suggestions
- **Frontend** (`DAArena.jsx`): Two-mode flashcard review system
  - **Focus Mode**: NotebookLM-inspired 3D flashcard — DA attack on front, defense + verdict on back. CSS `rotateY` flip with `perspective(1000px)` and `backface-visibility: hidden`
  - **Overview Mode**: Scrollable grid of compact cards with click-to-focus
  - 4 ratings: Brilliant (green), Effective (blue), Weak (amber), Unfair (red) with keyboard shortcuts (1-4)
  - Progress bar with gradient fill, auto-advance to next unreviewed after rating
  - Training report panel with effectiveness stats, pattern analysis, and soul refinement suggestions
- **Storage**: Embedded in `SimulationState` (`da_interactions`, `da_ratings`) — persists via existing DB+file hybrid, no new storage layer
- **No auto-rewrite**: Soul refinement suggestions are manual only — human reviews suggestions and edits soul documents by hand

### Concept Versioning (Chain Approach)
- Each refinement creates a NEW `Concept` object (new UUID via `OutputParser`)
- Old concept snapshotted as `ConceptVersion` (round, stage, name, headline, tagline, idea, visual_direction, evolution_notes, score, timestamp)
- New concept gets: `previous_version_id` pointing to old concept, `versions` list with snapshot appended, accumulated `scores` dict copied
- Full evolution chain preserved: R1 original -> R2 refined -> R3 deepened -> etc.
- Version history rendered in markdown exports via `_concept_to_md()`

### Thinking Mode System
Three tiers controllable globally + per-participant overrides:
- **Off**: Standard inference, no extended reasoning
- **Thinking**: Standard extended reasoning (effort: high for supported models)
- **Deep**: Maximum reasoning with higher token budgets (up to 32K reasoning tokens)
- Claude 4.6 uses adaptive thinking (no budget needed, most powerful)
- Token scaling: thinking 2x base tokens, deep 3x

### Anonymized Critique (Sacred Principle)
Inherited from llm-council. Concepts labeled "Concept A, B, C" — nobody knows whose is whose. Prevents ego-protection. Creates honest feedback. NEVER break this anonymization.

### Structured Output Parsing (3-Tier)
1. **Strict**: `===CONCEPT_START===` / `===CONCEPT_END===` delimiters
2. **Loose**: Look for `NAME:` / `IDEA:` field patterns
3. **Raw fallback**: Store entire response as single concept with `raw_text`

### State Persistence + Resume
- Full simulation state saved after every stage
- Hybrid persistence: Vercel Postgres (primary) + JSON files (fallback)
- State file: `output/{sim_id}/state.json`
- Supports resume from any point via `GenesisSimulation.resume(sim_id)`

### Simulation Presets
| Preset | Rounds | Stages | Concepts R1 | Quality Gates |
|--------|--------|--------|-------------|---------------|
| Quick Test | 3 | 3 | 2 | none |
| Message Lab | 6 | 5 | 3 | rounds 3, 6 |
| Genesis Chamber | 8 | 5 | 3 | rounds 4, 8 |
| Assembly Line | 5 | 5 | 2 | rounds 3, 5 |

### Backward Compatibility
Original llm-council endpoints and components stay fully functional. Genesis Chamber is additive, not destructive.

### Persistent Media Archive (V3)
- fal.ai URLs expire ~24h; images/videos now downloaded immediately after generation
- Storage: `output/{sim_id}/media/images/*.png`, `output/{sim_id}/media/videos/*.mp4`
- Backend serves via `FileResponse` at `/api/simulation/{id}/media/{type}/{filename}` with path traversal prevention
- Migration endpoint `POST /persist-media` for pre-V3 simulations: iterates `generated_images.json` / `generated_videos.json`, downloads items missing `local_path`, re-saves JSON
- Frontend `getMediaUrl(item)` prefers local path, falls back to fal.ai URL
- Local/Expires badge on each media item indicates persistence status

### Prompt Engineering Bible (V3)
- Creative personas write advertising-quality descriptions ("evoking trust", "symbolizing innovation"); image models need concrete visuals
- `PromptOptimizer` transforms prompts per model's documented strengths and prompt format
- Research-based strategies sourced from official documentation (Flux 2 docs.bfl.ml, Veo 3.1 Google Cloud, Seedream 4.5 fal.ai, Ideogram V3, Recraft V4)
- Model-specific builders: image (6-part: Subject + Visual + Style + Camera + Color + Quality), typography (headline in quotes for Ideogram), video (camera movement first for Kling/MiniMax/Luma), JSON (Veo 3.1 — 300%+ better consistency per Google docs)
- `_clean_advertising_language()` strips abstract phrases that confuse image models (suggesting, evoking, symbolizing, representing, metaphor for)
- Strategy inheritance: model variants inherit parent strategies via `inherits` key, override specific fields
- Both original and optimized prompts stored in generation results + displayed in gallery with CopyButton

### Scope-Based Image Generation (V3)
- Three scopes: `"winner"` (winner only), `"active"` (finalists, default), `"all"` (active + eliminated + merged)
- `generate_image_prompts()` filters concepts by scope before extracting IMAGE_PROMPT fields
- OutputPanel exposes scope selector dropdown next to model selector
- `GenerateImagesRequest.scope` passed through API to `OutputEngine`

### Compare View (V3)
- Gallery/Compare toggle appears when >1 image exists
- Compare mode: dense grid with 1:1 aspect ratio images, concept name, persona, status badges (winner/eliminated/active)
- Designed for side-by-side evaluation of different creative directions across concepts

### Cinematic Presentation (V3)
- 4-act storytelling structure: Challenge → Battle → Reveal → Production
- **ACT 1 (Challenge)**: Dramatic title, brief card with brand context, full roster
- **ACT 2 (Battle)**: Per-round intro + concepts + direction (vertical slide stacks)
- **ACT 3 (Reveal)**: Winner reveal with gold treatment, runner-up, score evolution bars
- **ACT 4 (Production)**: Embedded generated images in media gallery, production spec grid, credits
- Sora display font (Google Fonts) for headings, Inter for body, JetBrains Mono for data
- CSS variables aligned with frontend `design-tokens.css` (`--gc-void`, `--gc-cyan`, `--gc-gold`, etc.)
- Score evolution bars with high (green gradient) / mid (gold) / low (red) color coding
- Winner card: gold gradient background, 2px gold border, radial glow, Sora font headline with cyan text-shadow
- Legacy slide methods preserved: `_slide_title`, `_slide_round`, `_slide_winner`, `_slide_image_gallery` (used by other callers or as fallback)

## Important Implementation Details

### Relative Imports
All backend modules use relative imports (e.g., `from .config import ...`). Run as `python -m backend.main` from project root.

### Port Configuration
- Backend: 8001 (or `$PORT` environment variable)
- Frontend: 5173 (Vite default)

### CORS
Backend allows all origins (`allow_origins=["*"]`) so the frontend can reach it from any deployment.

### Soul Document Location
Soul documents (.md files) live in `souls/` at project root. 19 documents, ~17K total lines. Soul template in `genesis-chamber-builder/souls/examples/soul-template.md`.

### Soul Name Cleaning
`clean_soul_name()` in `main.py` handles messy soul document headings:
1. Canonical lookup from `DEFAULT_PARTICIPANTS` config (known personas)
2. Regex cleanup: strips "SOUL DOCUMENT:", "DEFINITIVE SOUL DOCUMENT", etc.
3. Title-case conversion for ALL CAPS names (with "Van" -> "van" fix)

### Reference File Upload Pipeline
1. Accept file (image, HTML, text, documents, PDF, ZIP — up to 50MB)
2. Extract text for LLM context: HTML stripping, PDF extraction (pdfplumber -> pypdf -> regex), image dimensions, .docx paragraphs+tables (python-docx), .xlsx sheets (openpyxl, 200-row cap), .csv rows (200-row cap)
3. Save to filesystem (`output/uploads/{id}/`)
4. Persist to database (non-blocking) for cross-deploy survival
5. Return extraction quality indicator (full/partial/none)
6. Frontend sends `extracted_text` as `brand_context` in simulation config
7. V3.8: Context token counter in launcher shows estimated tokens (color-coded green/yellow/red)

### Prompt Templates
- Stage prompt templates defined in `soul_engine.py` (`STAGE_TASKS` dict)
- Round behavioral guidance in `ROUND_INSTRUCTIONS` and `MODERATOR_ROUND_INSTRUCTIONS`
- Full engineering docs in `genesis-chamber-builder/docs/PROMPT-ENGINEERING.md`

### Configuration Files
- `genesis-chamber-builder/config/council-config.example.json` — Full working config example
- `genesis-chamber-builder/config/simulation-presets.json` — 5 presets with cost estimates
- `genesis-chamber-builder/config/model-roster.json` — Model tiers + persona mapping

### Markdown Rendering
All ReactMarkdown components must be wrapped in `<div className="markdown-content">`.

## Common Gotchas

1. **Module Import Errors**: Always run `python -m backend.main` from project root
2. **CORS Issues**: Backend uses `allow_origins=["*"]` — should work from any frontend origin
3. **Soul Doc Size**: Full docs (1000+ lines) injected for 200K+ context models; compressed for smaller models
4. **Structured Output Parsing**: If models don't follow `===TAG===` format, 3-tier fallback handles it
5. **Long Simulations**: State saved after every stage — network failures and redeploys are handled
6. **Elimination Bookkeeping**: Track eliminated concepts + which elements were merged into survivors
7. **Database Optional**: Everything works without `DATABASE_URL` (file-based fallback), but uploads don't survive redeploys
8. **fal.ai URLs Expire**: Generated image/video URLs are temporary (~24h). V3 persistent media archive downloads files locally immediately after generation. Migration endpoint available for pre-V3 simulations. ZIP download still works as fallback
9. **Thinking Mode Token Scaling**: Deep mode uses 3x base tokens — watch costs with premium models
10. **Soul Name Mismatch**: If a soul heading doesn't match the canonical name, `clean_soul_name()` fixes it. Add new personas to `_CANONICAL_NAMES` in `main.py`
11. **DA Defense Stage Numbering**: Uses `stage_name="da_defense"` with `stage_num=2` — NOT a separate stage number. This prevents breaking `RoundProgress.jsx` which indexes stages by `stageNum - 1`
12. **DA Verdict Position Bias**: Individual verdict calls per concept, not combined. Combined calls showed position bias favoring last-listed concept
13. **Concept Version Chaining**: `_stage_refinement()` creates new `Concept` objects with new UUIDs. Versions are COPIED (not referenced) — each concept carries its full history. `previous_version_id` links the chain
14. **DA Arena Tab Visibility**: Only appears when `simState.config.devils_advocate` is truthy AND `simState.status === 'completed'`
15. **DA Training Suggestions**: Manual only — no `auto_refine_soul()` function. Human must review suggestions and edit soul documents manually
16. **SoulInfoCard Custom Fallback**: Custom/uploaded souls without entries in `soulBios.js` get auto-generated bios (title from team name, era "Custom", whyInChamber from soul excerpt). Missing bio fields simply don't render
17. **TranscriptViewer Dual-Tier Synthesis**: `_add_transcript()` stores synthesis data both as flat keys (backward compat) and nested `synthesis` dict. TranscriptViewer reads `entry.synthesis?.direction_notes` — if only flat keys exist, badges won't render
18. **Prompt Bible Logging**: `[PromptBible]` console logs during generation show original→optimized transformations. Useful for debugging model-specific prompt issues
19. **Media Persistence**: Local files in `output/{sim_id}/media/`. Migration endpoint `POST /persist-media` handles pre-V3 data. `generated_images.json` / `generated_videos.json` store both `url` (fal.ai, temporary) and `local_path` (persisted). If local file exists, gallery uses it; otherwise falls back to fal.ai URL
20. **Presentation Font Loading**: Sora font loaded via Google Fonts CDN — requires internet for first render. Falls back to Inter → system-ui → sans-serif
21. **Scope "all" Includes Eliminated**: Eliminated concepts may have incomplete data (missing visual_direction, partial scores). `generate_image_prompts()` includes merged concepts too
22. **CopyButton Parent Class**: CopyButton only appears on hover when its parent has class `.gc-copyable` (CSS: `position: relative` + child `.gc-btn-copy` transitions from `opacity: 0` to `opacity: 1`)
23. **Compare View Threshold**: Gallery/Compare toggle only renders when `images.length > 1`. Compare view uses 1:1 aspect ratio while gallery uses 280px-wide cards with 240px-tall images
24. **Light/Dark Mode**: Toggle in Sidebar footer stores preference in `localStorage('gc-theme')`. Default is dark. `[data-theme="light"]` on `<html>` triggers CSS variable overrides. All components inherit via existing CSS variables — no per-component changes needed. Brand accent colors identical in both modes
25. **Office Upload Dependencies**: `python-docx` for .docx, `openpyxl` for .xlsx. Both imported lazily inside extraction functions. `.doc` (legacy Word) returns a guidance message to re-save as .docx
26. **Context Token Counter**: Estimates tokens as `chars / 4`. Color thresholds: green (<50K tokens), yellow (50-100K), red (>100K). Displayed only when reference files are uploaded

## Reference Documentation

All detailed specs are in `genesis-chamber-builder/`:
- `docs/ARCHITECTURE.md` — Full system architecture
- `docs/SOUL-FORMAT.md` — Soul document specification + template
- `docs/SIMULATION-PROTOCOL.md` — Round rules, 5 stages, elimination
- `docs/PROMPT-ENGINEERING.md` — System prompts for all 5 stages
- `docs/INTEGRATION-GUIDE.md` — fal.ai, ElevenLabs, production pipeline
- `architecture/llm-council-delta.md` — Exact file-by-file modifications
- `architecture/flow-diagram.md` — Mermaid diagrams
- `architecture/state-machine.md` — State schema + resume capability
- `config/council-config.example.json` — Full working config
- `config/model-roster.json` — Model tiers + persona mapping
- `prompts/output-format.md` — Structured output + parsing code

## Data Flow Summary

### llm-council Mode (preserved)
```
User Query -> Stage 1 (parallel) -> Stage 2 (anonymized ranking) -> Stage 3 (synthesis) -> Response
```

### Genesis Chamber Mode
```
Brief + Souls + Reference Files
    |
SimulationLauncher (configure: preset, participants, models, thinking, brief)
    |
POST /api/simulation/start/stream -> SSE events
    |
Round 1: DIVERGE (5 stages + DA Defense) -> 10-18 concepts (versioned)
    |
Round 2: CONVERGE (5 stages + DA Defense, eliminate 40%) -> 6-10 concepts
    |
Round 3: DEEPEN (5 stages + DA Defense, eliminate 50%) -> 3-5 concepts
    | [QUALITY GATE -- human approval]
Round 4: GLADIATOR (5 stages + DA Defense, eliminate 67%) -> 1-2 concepts
    |
Round 5: POLISH (full team on winner)
    |
Round 6: SPEC (production specification)
    | [QUALITY GATE -- human approval]
Output Engine -> Markdown, Presentations, Images (fal.ai), Videos (fal.ai), ZIP Package
    |
DA Arena (if DA enabled) -> Extract interactions -> Review flashcards -> Rate -> Training report -> Soul suggestions
```

### Per-Round Stage Flow (with DA Defense)
```
Stage 1: CREATE (parallel, soul-loaded)
    |
Stage 2: CRITIQUE (anonymized peer review + DA attack)
    |
Stage 2.5: DA DEFENSE (if DA enabled + DA critiques exist)
    |-- Phase 1: Creatives defend in parallel
    |-- Phase 2: DA issues individual verdicts
    |
Stage 3: SYNTHESIZE (moderator + evaluator, with DA defense context)
    |
Stage 4: REFINE (version chaining: snapshot -> new concept -> link previous_version_id)
    |
Stage 5: PRESENT (group presentation)
```
