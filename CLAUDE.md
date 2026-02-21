# CLAUDE.md - Technical Notes for Genesis Chamber

This file contains technical details, architectural decisions, and important implementation notes for future development sessions. **Last updated: 2026-02-21.**

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
- Reference file uploads (images, HTML, PDF, ZIP) with text extraction
- Image generation (fal.ai — Recraft V4, Flux 2, Seedream 4.5, Ideogram V3)
- Video generation (fal.ai — Kling 3.0, Veo 3.1, MiniMax Hailuo, Luma Ray 2)
- Markdown export + reveal.js presentations
- Vercel Postgres/Neon database with file-based fallback
- OmniPresent brand design system with custom font + Fibonacci spacing

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

## Soul Document Roster (19 Personas)

### Marketing & Strategy Team (5 souls)
| Persona | Model | Lines | Color |
|---------|-------|-------|-------|
| David Ogilvy | `google/gemini-3-pro` | 1377 | #F59E0B |
| Claude Hopkins | `anthropic/claude-sonnet-4.6` | 1338 | #3B82F6 |
| Leo Burnett | `openai/gpt-5.2` | 1277 | #10B981 |
| Mary Wells Lawrence | `meta-llama/llama-4-maverick` | 1158 | #EC4899 |
| Gary Halbert | `x-ai/grok-4` | 1002 | #EF4444 |

### Design & Visual Team (6 souls)
| Persona | Model | Lines | Color |
|---------|-------|-------|-------|
| Paul Rand | `google/gemini-3-pro` | 918 | #8B5CF6 |
| Paula Scher | `openai/gpt-5.2` | 827 | #F97316 |
| Saul Bass | `anthropic/claude-sonnet-4.6` | 996 | #DC2626 |
| Susan Kare | `meta-llama/llama-4-maverick` | 811 | #06B6D4 |
| Rob Janoff | `x-ai/grok-4` | 1210 | #A3E635 |
| Tobias van Schneider | `google/gemini-3-pro` | 1308 | #D946EF |

### Business & Strategy Team (5 souls)
| Persona | Model | Lines | Color |
|---------|-------|-------|-------|
| Elon Musk | `x-ai/grok-4` | 690 | #1DA1F2 |
| Jeff Bezos | `google/gemini-3-pro` | 442 | #FF9900 |
| Warren Buffett | `anthropic/claude-sonnet-4.6` | 477 | #374151 |
| Richard Branson | `openai/gpt-5.2` | 402 | #E11D48 |
| Dietrich Mateschitz | `meta-llama/llama-4-maverick` | 399 | #1E40AF |

### Leadership (flexible assignment)
| Persona | Default Role | Model | Lines | Color |
|---------|-------------|-------|-------|-------|
| Steve Jobs | Moderator | `anthropic/claude-opus-4-6` | 1029 | #6B7280 |
| Jony Ive | Evaluator | `anthropic/claude-opus-4-6` | 735 | #9CA3AF |

### Special Roles
| Persona | Role | Model | Lines | Color |
|---------|------|-------|-------|-------|
| Advocatus Diaboli | Devil's Advocate (optional) | `anthropic/claude-sonnet-4.6` | 542 | #DC2626 |

## Backend Structure (`backend/`)

### Core Files

**`config.py`** — Central configuration
- `COUNCIL_MODELS`: `gpt-5.2`, `gemini-3-pro`, `claude-sonnet-4.6`, `grok-4`
- `CHAIRMAN_MODEL`: `google/gemini-3-pro`
- `TEAMS`: 5 divisions (marketing, design, business, leadership, custom)
- `PERSONA_TEAMS` / `PERSONA_COLORS`: Full mapping for all 19 personas
- `DEFAULT_PARTICIPANTS`: 16 participant configs with model/soul/temperature/color
- `DEFAULT_MODERATOR` / `DEFAULT_EVALUATOR`: Steve Jobs / Jony Ive on Claude Opus 4.6
- `DEFAULT_DEVILS_ADVOCATE`: Advocatus Diaboli on Claude Sonnet 4.6
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
- Reference file uploads: images, HTML, text, PDF, ZIP with text extraction
- Markdown export: summary, winner, per-round, per-persona
- Media generation: images, videos, combined gallery, ZIP download
- DA Arena API: 5 endpoints for interaction extraction, rating, training, and suggestions
- `DARatingRequest`: Pydantic model for DA interaction ratings (JSON body, not query params)
- Upload serving with database fallback for cross-deploy survival
- `clean_soul_name()`: Canonical lookup + regex cleanup for soul document headings

**`simulation.py`** — Core 5-stage engine (+ optional DA Defense)
- `OutputParser`: 3-tier structured output parsing (strict delimiters -> loose extraction -> raw fallback)
- `GenesisRound`: Runs one complete round (configurable 3 or 5 stages + DA Defense)
- `GenesisSimulation`: Orchestrates N rounds with elimination, quality gates, state persistence
- Callbacks for SSE streaming: stage start/complete, round complete, gate reached, participant thinking/response
- Devil's Advocate integration during critique stage (Stage 2)
- `_stage_da_defense()`: Two-phase adversarial dialog — Phase 1: creatives defend in parallel, Phase 2: DA issues individual verdicts per concept (avoids position bias)
- `_stage_refinement()` with concept version chaining: snapshots old concept as `ConceptVersion`, links via `previous_version_id`, copies accumulated scores
- `_stage_synthesis()` accepts optional `da_defense_results` to include defense/verdict context in moderator summary
- `_add_transcript()` handles `da_defense` entries with full challenge/defense/verdict data
- 3-tier fuzzy elimination matching (exact -> normalized -> fuzzy ratio with 70% threshold)
- 5-minute timeout per stage with graceful degradation

**`models.py`** — Pydantic schemas
- `ParticipantConfig`: model, soul_document, role, temperature, thinking_mode, enable_web_search, color
- `SimulationConfig`: name, type, rounds, stages_per_round, participants, moderator, evaluator, devils_advocate, elimination_schedule, quality_gates, brief, brand_context
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
- `_concept_to_md()`: Concept rendering with version history chain + previous_version_id lineage
- `generate_reveal_presentation()`: reveal.js HTML with dark Genesis Chamber theme
- `generate_image_prompts()`: Extract IMAGE_PROMPT fields for fal.ai

**`image_generator.py`** — fal.ai image integration
- Models: Recraft V4 (raster + vector/SVG), Flux 2 Pro/Max, Seedream 4.5, Ideogram V3, Nano Banana Pro
- REST calls via fal.ai queue API with polling
- Batch generation with per-concept model auto-selection

**`video_generator.py`** — fal.ai video integration
- Image-to-Video: Kling 3.0 Pro, Kling O3 Pro, MiniMax Hailuo 2.3, Luma Ray 2
- Text-to-Video: Kling O3 Pro, Google Veo 3.1
- Quality tiers: hero, standard, draft

**`migrate.py`** — Database migration utilities

**`da_training.py`** — DA Arena training and analysis
- `extract_da_interactions(state)`: Pull DA critiques from transcript, cross-reference DA Defense results, check evolution notes for creative response
- `save_interactions_to_state(state, interactions)`: Store interactions to `state.da_interactions`
- `load_interactions_from_state(state)`: Load `DAInteraction` objects from state
- `save_rating(state, interaction_id, rating, notes)`: Update rating in `da_interactions` + `da_ratings`
- `generate_training_report(state)`: Aggregate patterns (brilliant/effective/weak/unfair), effectiveness score, response rate, verdict stats
- `generate_refinement_suggestions(state)`: Human-readable markdown suggestions for manual soul editing (no auto-rewrite)

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
- `GET /api/simulation/{id}/presentation` — reveal.js HTML

### Media
- `POST /api/simulation/{id}/generate-images` — Generate via fal.ai
- `GET /api/simulation/{id}/images` — Get generated images
- `POST /api/simulation/{id}/generate-videos` — Generate via fal.ai
- `GET /api/simulation/{id}/video-tiers` — Quality tiers
- `GET /api/simulation/{id}/videos` — Get generated videos
- `GET /api/simulation/{id}/generated` — All generated content
- `GET /api/simulation/{id}/download/all` — ZIP download

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
- `POST /api/upload/reference` — Upload file (image, HTML, text, PDF, ZIP)
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

### Core Files
- `App.jsx` — Main orchestration, manages conversations + simulations
- `api.js` — API client with all endpoint methods + SSE streaming + DA Arena methods (extract, interactions, rate, training, suggestions)
- `main.jsx` — React entry point
- `design-tokens.css` — OmniPresent brand design system
- `index.css` — Global styles + markdown content styling
- `App.css` — App layout styles

### Utilities (`utils/`)
- `clipboard.js` — Clipboard copy helper
- `modelDisplayNames.js` — Maps OpenRouter model IDs to display labels

### Components — llm-council (preserved)
- `ChatInterface.jsx` — Chat mode UI
- `Stage1.jsx` — Tab view of model responses
- `Stage2.jsx` — Anonymized critique display with de-anonymization
- `Stage3.jsx` — Chairman synthesis (green-tinted)
- `Sidebar.jsx` — Conversation/simulation list with rename/archive/delete

### Components — Genesis Chamber

**Launcher & Config:**
- `SimulationLauncher.jsx` — Full 3-step config wizard (type/participants/brief)
- `StepIndicator.jsx` — 3-step progress indicator
- `ConfigSummary.jsx` — Right sidebar with preset, participant count, costs
- `ModelSelector.jsx` — Dropdown for OpenRouter models (grouped by tier)
- `SoulInfoCard.jsx` — Modal showing soul document preview + metadata
- `HelpTooltip.jsx` + `helpContent.js` — Contextual help popovers

**Dashboard & Live:**
- `SimulationDashboard.jsx` — Live simulation monitoring + conditional DA Arena tab (shown when DA enabled + simulation completed)
- `StatusHeader.jsx` — Status bar with round/stage info
- `LiveFeed.jsx` — Real-time SSE event feed (+ `da_defense` stage verb/label)
- `ChamberAnimation.jsx` — Animated visual during processing
- `RoundProgress.jsx` — Visual round/stage progress
- `Skeleton.jsx` — Loading skeleton placeholders

**Concepts & Critique:**
- `ConceptCard.jsx` — Concept display with evolution tracking
- `CritiquePanel.jsx` — Anonymized critique scores + feedback
- `ModeratorDirection.jsx` — Decisions, eliminations, merge suggestions
- `QualityGate.jsx` — Human approval checkpoints
- `EliminationTimeline.jsx` — Visual elimination across rounds

**Output & Export:**
- `PresentationGallery.jsx` — Browse concepts across rounds
- `TranscriptViewer.jsx` — Interactive full transcript + DA Defense filter/color/label + defense cards with challenge, defense text, verdict (accepted/insufficient styling)
- `TranscriptViewer.css` — Transcript styles including ~90 lines of DA defense card styles
- `GeneratedGallery.jsx` — Image + video gallery with download
- `OutputPanel.jsx` — Export buttons (markdown, presentation, media)

**DA Arena:**
- `DAArena.jsx` — Post-simulation DA interaction review with two modes:
  - **Focus Mode**: 3D flashcard with CSS `rotateY` flip — DA attack (front) / defense + verdict (back)
  - **Overview Mode**: Scrollable grid of compact interaction cards with click-to-focus
  - 4 rating buttons: Brilliant / Effective / Weak / Unfair (keyboard shortcuts: 1-4, Space to flip, arrows to navigate)
  - Progress bar with gradient fill, go-back/forward navigation, auto-advance after rating
  - Training report panel with effectiveness stats + soul refinement suggestions (manual only)
- `DAArena.css` — ~450 lines using design-tokens.css variables exclusively (3D perspective, backface-visibility, color-specific glow effects)

**Shared:**
- `Icons.jsx` — SVG icon components

## Key Design Decisions

### Five-Stage Round System (+ Optional DA Defense)
1. **CREATE** — Independent concept generation (soul-loaded, parallel queries)
2. **CRITIQUE** — Anonymized peer review (concepts as A, B, C) + Devil's Advocate
3. **DA DEFENSE** *(optional, Stage 2.5)* — Creatives defend concepts against DA challenges, DA issues individual verdicts
4. **SYNTHESIZE** — Moderator direction + evaluator craft assessment (includes DA defense context when available)
5. **REFINE** — Directed revision based on feedback (with concept version chaining)
6. **PRESENT** — Group presentation with moderator reaction

### Multi-Model Cognitive Diversity
Different LLMs assigned for different cognitive profiles via OpenRouter:
- **Tier 1 Premium**: `anthropic/claude-opus-4-6` ($15/M), `openai/gpt-5.2` ($15/M), `google/gemini-3-pro` ($7/M, 2M context)
- **Tier 2 Balanced**: `anthropic/claude-sonnet-4.6` ($3/M), `x-ai/grok-4` ($3/M)
- **Tier 3 Efficient**: `meta-llama/llama-4-maverick` ($0.50/M), `anthropic/claude-haiku-4.5` ($0.25/M)

### Flexible Leadership System
- **Any soul can be moderator or evaluator** — selected via dropdown in SimulationLauncher
- Defaults: Steve Jobs (moderator), Jony Ive (evaluator) on Claude Opus 4.6
- **Dual-role toggle**: Leadership personas can simultaneously participate as creative contributors
- Cross-team membership: Jobs `cross_teams: ["marketing"]`, Ive `cross_teams: ["design", "marketing"]`

### Devil's Advocate (Advocatus Diaboli)
- Optional per-simulation toggle (542-line soul document)
- Based on the Catholic canonization process (Pope Sixtus V, 1587)
- Scores concepts 1-2 points lower — the standard is real-world survival
- Identifies hidden assumptions and specific failure scenarios for every concept
- **Sanhedrin Principle**: If all critics agree, that agreement itself is suspicious
- Every criticism must include what would fix the problem
- Ends critiques with: "This concept earns canonization if it can answer: [specific challenge]"

### DA Defense Stage (Stage 2.5)
- Runs after Stage 2 (Critique), before Stage 3 (Synthesis), only when DA is enabled and DA critiques exist
- **Phase 1 — Creative Defense**: Each creative with a DA-challenged concept defends in parallel. Prompt includes DA's fatal flaw, weaknesses, and demanded change. Creative must: (1) argue if fatal flaw is actually fatal, (2) accept or counter each weakness, (3) accept or refuse the demanded change
- **Phase 2 — DA Verdict**: DA issues individual verdict per concept (not combined, to avoid position bias). Parses `VERDICT:` (accepted/insufficient), `DETAILS:`, `REVISED_SCORE:` (1-10)
- Sub-stage numbering: `stage_name="da_defense"`, `stage_num=2` — avoids breaking `RoundProgress.jsx` array indexing
- Results passed to `_stage_synthesis()` so moderator sees full defense/verdict context
- Full defense cycle recorded in transcript via `_add_transcript()` handler

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
1. Accept file (image, HTML, text, PDF, ZIP — up to 50MB)
2. Extract text for LLM context: HTML stripping, PDF extraction (pdfplumber -> pypdf -> regex), image dimensions
3. Save to filesystem (`output/uploads/{id}/`)
4. Persist to database (non-blocking) for cross-deploy survival
5. Return extraction quality indicator (full/partial/none)
6. Frontend sends `extracted_text` as `brand_context` in simulation config

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
8. **fal.ai URLs Expire**: Generated image/video URLs are temporary (~24h). ZIP download is best-effort
9. **Thinking Mode Token Scaling**: Deep mode uses 3x base tokens — watch costs with premium models
10. **Soul Name Mismatch**: If a soul heading doesn't match the canonical name, `clean_soul_name()` fixes it. Add new personas to `_CANONICAL_NAMES` in `main.py`
11. **DA Defense Stage Numbering**: Uses `stage_name="da_defense"` with `stage_num=2` — NOT a separate stage number. This prevents breaking `RoundProgress.jsx` which indexes stages by `stageNum - 1`
12. **DA Verdict Position Bias**: Individual verdict calls per concept, not combined. Combined calls showed position bias favoring last-listed concept
13. **Concept Version Chaining**: `_stage_refinement()` creates new `Concept` objects with new UUIDs. Versions are COPIED (not referenced) — each concept carries its full history. `previous_version_id` links the chain
14. **DA Arena Tab Visibility**: Only appears when `simState.config.devils_advocate` is truthy AND `simState.status === 'completed'`
15. **DA Training Suggestions**: Manual only — no `auto_refine_soul()` function. Human must review suggestions and edit soul documents manually

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
