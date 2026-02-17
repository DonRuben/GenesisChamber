# CLAUDE.md - Technical Notes for Genesis Chamber

This file contains technical details, architectural decisions, and important implementation notes for future development sessions.

## Project Overview

Genesis Chamber is a multi-persona AI creative simulation engine, evolved from Karpathy's `llm-council`. The system orchestrates 5-13 AI participants — each loaded with deep consciousness profiles ("soul documents") — through iterative debate rounds to produce creative concepts, critique them anonymously, and refine them to production quality.

**The full masterplan is in `MASTERPLAN.md`.** This file covers technical implementation details.

### What We Inherited (llm-council)
A working 3-stage deliberation system: parallel LLM querying via OpenRouter, anonymized peer review, chairman synthesis, streaming SSE, React frontend.

### What We're Building (Genesis Chamber)
A 5-stage, multi-round simulation engine with soul-loaded personas, concept evolution, elimination mechanics, quality gates, output generation, and media integration.

## Architecture: Three Engines

```
SOUL ENGINE → COUNCIL ENGINE → OUTPUT ENGINE
(load souls)   (run simulation)   (generate deliverables)
```

### Soul Engine (`backend/soul_engine.py` — NEW)
- Loads markdown soul documents (40-60KB, 7 layers)
- Compiles to system prompts (~3500 tokens for small context, full doc for 200K+)
- Layers: Cognitive, Emotional, Behavioral, Calibration, Key Works, Quotes, Instructions
- Soul docs live in `souls/` directory

### Council Engine (`backend/simulation.py` — evolved from `council.py`)
- 5 stages per round: Create → Critique → Synthesize → Refine → Present
- Multi-round with elimination (R1: 0%, R2: 40%, R3: 50%, R4: 67%)
- Quality gates pause for human approval
- Full state persistence and resume

### Output Engine (`backend/output_engine.py` — NEW)
- Transcript HTML, per-persona presentations, image prompts, video scripts, production packages

## Backend Structure (`backend/`)

### Existing Files (from llm-council, preserved)

**`config.py`** — WILL BE HEAVILY MODIFIED
- Currently: `COUNCIL_MODELS` list + `CHAIRMAN_MODEL`
- Target: Participant configs with soul paths, model assignments, temperatures, round settings, elimination schedule
- Uses environment variable `OPENROUTER_API_KEY` from `.env`
- Backend runs on **port 8001** (NOT 8000)

**`council.py`** — PRESERVED (backward compatible)
- Original 3-stage llm-council logic stays functional
- `stage1_collect_responses()`, `stage2_collect_rankings()`, `stage3_synthesize_final()`
- Used for simple Q&A council mode

**`openrouter.py`** — MINOR MODIFICATION
- `query_model()`: Single async model query
- `query_models_parallel()`: Parallel queries using `asyncio.gather()`
- Will add: `query_with_soul()` for soul prompt injection into system messages
- Graceful degradation: returns None on failure

**`storage.py`** — MODERATE MODIFICATION
- Currently: JSON conversations in `data/conversations/`
- Will add: Multi-round simulation state, concept tracking, event log, resume capability
- Simulations stored in `output/{sim_id}/state.json`

**`main.py`** — MODERATE MODIFICATION
- FastAPI app with CORS for localhost:5173 and localhost:3000
- Existing endpoints preserved for llm-council mode
- New simulation endpoints:
  - `POST /api/simulation/start`
  - `GET /api/simulation/{id}/status`
  - `GET /api/simulation/{id}/round/{n}`
  - `POST /api/simulation/{id}/gate/{n}/approve`
  - `GET /api/simulation/{id}/transcript`
  - `POST /api/simulation/{id}/generate-images`

### New Files

**`simulation.py`** — Core 5-stage engine
- `GenesisRound`: Runs one complete round (5 stages)
- `GenesisSimulation`: Orchestrates N rounds with elimination + quality gates
- Structured output parsing via `===TAG_START===` / `===TAG_END===` delimiters

**`soul_engine.py`** — Soul document loading
- `SoulEngine.load_soul()`: Parse markdown into 7 layers
- `SoulEngine.compile_system_prompt()`: Compress for model context window
- `SoulEngine.calibrate()`: Add project-specific context

**`output_engine.py`** — Deliverable generation
- Transcript HTML, presentations, image prompts, video scripts, production packages

**`image_generator.py`** — fal.ai integration
- Nano Banana Pro, Recraft V3, Flux 2 Pro, Ideogram V3
- Model selection logic based on concept type

**`models.py`** — Pydantic schemas
- Concept, Critique, ModeratorDirection, RoundResult, SimulationState, QualityGate

## Frontend Structure (`frontend/src/`)

### Existing Components (preserved for llm-council mode)

**`App.jsx`** — Main orchestration, manages conversations + simulations
**`components/ChatInterface.jsx`** — Chat mode (llm-council)
**`components/Stage1.jsx`** — Tab view of model responses
**`components/Stage2.jsx`** — Anonymized critique display with de-anonymization
**`components/Stage3.jsx`** — Chairman synthesis (green-tinted)
**`components/Sidebar.jsx`** — Conversation/simulation list

### New Components (Genesis Chamber mode)

**`components/SimulationLauncher.jsx`** — Select type, participants, brief
**`components/RoundProgress.jsx`** — Visual round/stage progress indicator
**`components/ConceptCard.jsx`** — Individual concept display with evolution
**`components/CritiquePanel.jsx`** — Anonymized critique scores + feedback
**`components/ModeratorDirection.jsx`** — Moderator decisions, eliminations
**`components/QualityGate.jsx`** — Human approval checkpoints
**`components/PresentationGallery.jsx`** — Browse concepts across rounds
**`components/TranscriptViewer.jsx`** — Interactive full transcript

### Styling
- Light mode theme
- Primary color: #4a90e2 (blue)
- Genesis Chamber uses dark theme with teal (#00D9C4) accent per blueprint
- Global markdown styling in `index.css` with `.markdown-content` class

## Key Design Decisions

### Five-Stage Round System
1. **CREATE** — Independent concept generation (soul-loaded)
2. **CRITIQUE** — Anonymized peer review (concepts as A, B, C)
3. **SYNTHESIZE** — Moderator direction + evaluator craft assessment
4. **REFINE** — Directed revision based on feedback
5. **PRESENT** — Group presentation with moderator reaction

### Structured Output Parsing
Genesis Chamber uses `===TAG_START===` / `===TAG_END===` delimiters instead of llm-council's "FINAL RANKING:" format. More robust, supports multi-field structured output.

### Multi-Model Cognitive Diversity
Different LLMs for different personas:
- Moderator (Jobs): Claude Opus — synthesis + judgment
- Evaluator (Ive): Claude Sonnet — craft precision
- Analytical: Gemini Pro — research, long context
- Creative: GPT-5.1 — emotional depth
- Provocative: Grok 4 — unfiltered
- Direct: Llama Maverick — efficient

### Anonymized Critique (Sacred Principle)
Inherited from llm-council. Concepts labeled "Concept A, B, C" — nobody knows whose is whose. Prevents ego-protection. Creates honest feedback. NEVER break this anonymization.

### State Persistence + Resume
Full simulation state saved after every stage as JSON. Supports resume from any point. Critical for long simulations (2+ hours).

### Quality Gates
Configured rounds where simulation pauses for human approval. System proposes, human decides. No fully autonomous creative decisions.

### Backward Compatibility
Original llm-council endpoints and components stay functional. Genesis Chamber is additive, not destructive.

## Important Implementation Details

### Relative Imports
All backend modules use relative imports (e.g., `from .config import ...`). Run as `python -m backend.main` from project root.

### Port Configuration
- Backend: 8001 (NOT 8000)
- Frontend: 5173 (Vite default)

### Soul Document Location
Soul documents (.md files) live in `souls/` at project root. Soul template in `genesis-chamber-builder/souls/examples/soul-template.md`.

### Prompt Templates
Stage prompt templates in `genesis-chamber-builder/prompts/` and `genesis-chamber-builder/docs/PROMPT-ENGINEERING.md`.

### Configuration Files
- `genesis-chamber-builder/config/council-config.example.json` — Full working config example
- `genesis-chamber-builder/config/simulation-presets.json` — 5 presets with cost estimates
- `genesis-chamber-builder/config/model-roster.json` — Model tiers + persona mapping

### Markdown Rendering
All ReactMarkdown components must be wrapped in `<div className="markdown-content">`.

## Common Gotchas

1. **Module Import Errors**: Always run `python -m backend.main` from project root
2. **CORS Issues**: Frontend must match allowed origins in `main.py`
3. **Soul Doc Size**: Full docs may exceed system prompt limits — use Soul Compiler for small-context models
4. **Structured Output Parsing**: If models don't follow `===TAG===` format, implement fallback extraction
5. **Long Simulations**: Always save state after each stage — network failures happen
6. **Elimination Bookkeeping**: Track eliminated concepts + which elements were merged into survivors
7. **Missing Metadata**: In llm-council mode, metadata is ephemeral (not persisted)

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
- `prompts/output-format.md` — Structured output + parsing code

## Data Flow Summary

### llm-council Mode (preserved)
```
User Query → Stage 1 (parallel) → Stage 2 (anonymized ranking) → Stage 3 (synthesis) → Response
```

### Genesis Chamber Mode (new)
```
Brief + Souls
    ↓
Round 1: DIVERGE (5 stages) → 10-18 concepts
    ↓
Round 2: CONVERGE (5 stages, eliminate 40%) → 6-10 concepts
    ↓
Round 3: DEEPEN (5 stages, eliminate 50%) → 3-5 concepts
    ↓ [QUALITY GATE — human approval]
Round 4: GLADIATOR (5 stages, eliminate 67%) → 1-2 concepts
    ↓
Round 5: POLISH (full team on winner)
    ↓
Round 6: SPEC (production specification)
    ↓ [QUALITY GATE — human approval]
Output Engine → Transcript, Presentations, Images, Videos, Package
```
