# GENESIS CHAMBER — UNIFIED MASTERPLAN

## The Synthesis of Three Visions

This masterplan unifies three sources of truth into one actionable build plan:

1. **The Foundation** — Karpathy's `llm-council` (working code, 3-stage deliberation, FastAPI + React)
2. **The Blueprint** — `genesis-chamber-builder/` docs (5-stage simulation, soul documents, multi-round, output engine)
3. **The Ultimate Vision** — Genesis Chamber Consciousness Platform (avatars, voice, self-improving agents, marketplace)

---

## WHAT WE'RE BUILDING

A multi-persona AI creative simulation engine where 5-13 AI participants — each loaded with deep consciousness profiles ("souls") of legendary creative figures — debate, critique, and refine ideas across multiple rounds until a winning concept emerges.

**The Core Innovation:** Different LLM models (Claude, GPT, Gemini, Grok, Llama) each embody a different legendary creative mind via 40-60KB soul documents. The cognitive diversity of different models combined with deep persona loading produces outputs that are measurably superior to any single-model approach.

**What llm-council gives us (already working):**
- Parallel LLM querying via OpenRouter
- Anonymized peer review (prevents bias)
- Chairman synthesis
- Streaming SSE updates
- Conversation storage
- React UI with stage tabs

**What we add:**
| Feature | llm-council | Genesis Chamber |
|---------|-------------|-----------------|
| Persona depth | None (raw model) | 40-60KB soul documents |
| Rounds | 1 (single pass) | 4-8 (iterative refinement) |
| Stages per round | 3 | 5 (adds refinement + presentation) |
| Output type | Text answer | Concepts, visuals, scripts, production packages |
| Critique | Ranking only | Scoring + qualitative feedback + persona voice |
| Chairman | Synthesis only | Direction setting + elimination + constraints |
| State | Stateless | Persistent across rounds, resumable |
| Chaining | No | Sim A output → Sim B input |
| Media generation | No | Image prompts (fal.ai), video scripts, voice (ElevenLabs) |
| Avatars | No | Phase 3+ (HeyGen integration) |

---

## ARCHITECTURE

```
┌──────────────────────────────────────────────────────────┐
│                     GENESIS CHAMBER                       │
├────────────────┬─────────────────┬───────────────────────┤
│  SOUL ENGINE   │ COUNCIL ENGINE  │ OUTPUT ENGINE          │
│                │                 │                        │
│  Load & compile│ Run 5 stages    │ Transcript HTML        │
│  personas      │ per round       │ Per-persona reports    │
│  + brief       │ N rounds        │ Image/video prompts    │
│  + calibrate   │ + eliminate     │ Production packages    │
└────────────────┴─────────────────┴───────────────────────┘
       ↑                 ↑                    ↓
    Soul Docs        OpenRouter          Output Files
    + Brief          API calls           + fal.ai
    + Brand          (parallel)          + ElevenLabs
```

### Three Engines

**Soul Engine** (`backend/soul_engine.py` — NEW)
- Loads markdown soul documents (40-60KB each, 7 sections)
- Compiles into system prompts (~3500 tokens for small-context models, full doc for 200K+ models)
- Calibrates personas to the specific project brief
- Validates voice authenticity

**Council Engine** (`backend/simulation.py` — evolved from `council.py`)
- 5-stage round system: Create → Critique → Synthesize → Refine → Present
- Multi-round orchestration with elimination schedule
- Anonymized peer review (concepts labeled A, B, C — nobody knows whose is whose)
- Quality gates for human approval between rounds
- State persistence and resume capability

**Output Engine** (`backend/output_engine.py` — NEW)
- Transcript generator (interactive HTML)
- Per-persona presentation builder
- Image prompt generator (fal.ai ready)
- Video script writer
- Production package bundler

---

## THE FIVE-STAGE ROUND SYSTEM

Each round runs 5 stages (evolved from llm-council's 3):

### Stage 1: CREATE (Independent)
Each participant works alone with their soul document fully loaded. Generates 1-3 concepts (Round 1) or 1 refined concept (Round 2+). No access to others' work.

Output per concept: name, core idea, headline, visual direction, key copy, rationale, image prompt, video prompt.

### Stage 2: CRITIQUE (Anonymized)
All concepts shuffled and labeled "Concept A, B, C..." — nobody knows whose is whose. Each participant scores and critiques EVERY concept (including their own, unknowingly). This is the llm-council innovation that we preserve and extend with richer critique format (score + strengths + weaknesses + specific suggestions).

### Stage 3: SYNTHESIZE (Moderator)
The moderator (Steve Jobs persona on Claude Opus) receives all concepts + all critiques + aggregate scores. Identifies consensus, dissent, hidden gems. Eliminates weak concepts. Sets direction and constraints for next round. The evaluator (Jony Ive) adds craft assessment.

### Stage 4: REFINE (Directed)
Each participant revises based on critique + moderator direction. Can evolve, merge with another concept, pivot entirely, or defend unchanged. Eliminated participants join surviving concepts as collaborators.

### Stage 5: PRESENT (Group)
Each participant presents refined concept with evolution notes. Moderator gives immediate 3-sentence reaction. Sets up next round.

---

## MULTI-ROUND PROGRESSION

| Round | Mode | Goal | Elimination | Expected Concepts |
|-------|------|------|-------------|-------------------|
| R1 | DIVERGE | Maximum creative breadth | 0% | 10-18 created |
| R2 | CONVERGE | React to critique, find strongest | 40% | 6-10 surviving |
| R3 | DEEPEN | Near-production quality | 50% | 3-5 surviving |
| R4 | GLADIATOR | Final battle between top concepts | 67% | 1-2 surviving |
| R5 | POLISH | Full team refines winner | 0% | 1 winner |
| R6 | SPEC | Production specification | 0% | Final spec |

Quality gates after R3 and R6 pause for human approval.

---

## SIMULATION TYPES & CHAINING

### Type A: Message Lab (Strategy)
- 5 marketing strategists + moderator
- 6 rounds → Message Blueprint
- Cost: $15-40

### Type B: Genesis Chamber (Creative)
- 6 designers + moderator + evaluator
- 8 rounds → Visual System
- Cost: $25-60 + $5-20 images

### Type C: Assembly Line (Production)
- 5 copywriters/art directors
- 5 rounds → Campaign Assets
- Cost: $10-30 + $10-50 media

### Full Pipeline: A → B → C
- 14-19 rounds across 3 simulations
- 8-13 unique personas
- Cost: $50-130 total
- Output: From message strategy to finished production assets

---

## MODEL STRATEGY

Key insight: Using DIFFERENT underlying models per persona creates genuine cognitive diversity.

| Persona Type | Recommended Model | Why |
|-------------|-------------------|-----|
| Moderator (Jobs) | Claude Opus 4.5 | Best synthesis + judgment |
| Evaluator (Ive) | Claude Sonnet 4.5 | Precise craft assessment |
| Analytical personas | Gemini 2.5 Pro | Research-heavy, long context |
| Creative personas | GPT-5.1 | Strong emotional + narrative |
| Bold/provocative | Grok 4 | Unfiltered, unconventional |
| Direct/simple | Llama 4 Maverick | No-nonsense, efficient |

All routed through OpenRouter (already working in codebase).

---

## FILE-BY-FILE IMPLEMENTATION DELTA

### Modified Files (from existing llm-council)

| File | Change Level | What Changes |
|------|-------------|--------------|
| `backend/config.py` | **HEAVY** | Persona configs, soul paths, round settings, elimination schedule |
| `backend/council.py` | **HEAVY** | → `simulation.py`: 5 stages, multi-round, soul injection, state mgmt |
| `backend/main.py` | **MODERATE** | New endpoints: /simulation/start, /status, /gate/approve, /transcript |
| `backend/storage.py` | **MODERATE** | Multi-round state, concept tracking, event log |
| `backend/openrouter.py` | **MINOR** | Add soul prompt injection into system messages |

### New Backend Files

| File | Purpose |
|------|---------|
| `backend/soul_engine.py` | Load, parse, compile soul documents |
| `backend/simulation.py` | Core 5-stage engine (replaces council.py) |
| `backend/output_engine.py` | Transcript, presentations, prompts, scripts generators |
| `backend/image_generator.py` | fal.ai integration for concept images |
| `backend/models.py` | Pydantic models for concepts, critiques, directions |

### New Directories

```
souls/                  ← Soul documents (.md, 40-60KB each)
briefs/                 ← Project briefs
context/                ← Brand context files
output/                 ← Generated output per simulation
prompts/                ← Stage prompt templates (already in genesis-chamber-builder/)
```

### Frontend (Rebuilt)

The React frontend needs significant changes from the simple chat interface to a simulation dashboard:
- Simulation launcher (select type, participants, brief)
- Round progress indicator with stage visualization
- Per-persona concept cards with evolution tracking
- Critique visualization (scores, feedback)
- Moderator direction display
- Quality gate approval buttons
- Presentation gallery
- Image generation status
- Transcript viewer
- Production package builder

---

## TARGET FOLDER STRUCTURE

```
GenesisChamber/
├── backend/
│   ├── __init__.py
│   ├── config.py               ← HEAVILY MODIFIED (personas, rounds, gates)
│   ├── simulation.py           ← NEW (core 5-stage engine, was council.py)
│   ├── council.py              ← PRESERVED (original llm-council logic, still usable)
│   ├── soul_engine.py          ← NEW (load & compile souls)
│   ├── output_engine.py        ← NEW (generate deliverables)
│   ├── image_generator.py      ← NEW (fal.ai integration)
│   ├── models.py               ← NEW (Pydantic schemas)
│   ├── main.py                 ← MODIFIED (new simulation endpoints)
│   ├── openrouter.py           ← MINOR MOD (soul prompt injection)
│   └── storage.py              ← MODIFIED (multi-round state)
├── souls/                      ← Soul documents (.md)
│   ├── david-ogilvy.md
│   ├── claude-hopkins.md
│   ├── leo-burnett.md
│   ├── mary-wells-lawrence.md
│   ├── gary-halbert.md
│   ├── steve-jobs.md
│   ├── jony-ive.md
│   └── ...
├── briefs/                     ← Project briefs
│   └── example-brief.md
├── context/                    ← Brand context files
│   └── example-brand.md
├── output/                     ← Generated output per simulation
│   └── sim_001/
│       ├── transcript.html
│       ├── state.json
│       ├── presentations/
│       ├── images/
│       └── scripts/
├── prompts/                    ← Stage prompt templates
│   ├── stage1_creation.md
│   ├── stage2_critique.md
│   ├── stage3_synthesis.md
│   ├── stage4_refinement.md
│   └── stage5_presentation.md
├── frontend/                   ← React dashboard (rebuilt)
│   └── src/
│       ├── components/
│       │   ├── SimulationLauncher.jsx
│       │   ├── RoundProgress.jsx
│       │   ├── ConceptCard.jsx
│       │   ├── CritiquePanel.jsx
│       │   ├── ModeratorDirection.jsx
│       │   ├── QualityGate.jsx
│       │   ├── PresentationGallery.jsx
│       │   ├── TranscriptViewer.jsx
│       │   └── ... (existing components preserved)
│       ├── App.jsx
│       ├── api.js
│       └── ...
├── genesis-chamber-builder/    ← Documentation package (reference)
├── MASTERPLAN.md               ← This file
├── CLAUDE.md                   ← Updated technical notes
├── pyproject.toml              ← Updated dependencies
└── start.sh                    ← Updated startup script
```

---

## BUILD PHASES

### Phase 1: Core Engine (Week 1)
**Goal:** Get the 5-stage, multi-round simulation running in the terminal.

**Day 1-2: Soul Engine + Config**
- Create `backend/models.py` — Pydantic schemas for Concept, Critique, Direction, RoundResult, SimulationState
- Create `backend/soul_engine.py` — Load markdown souls, parse 7 layers, compile system prompts
- Restructure `backend/config.py` — Participants with soul paths, model assignments, round config, elimination schedule
- Create `souls/` directory with soul-template.md and one example soul (Steve Jobs as moderator)

**Day 3-4: Simulation Engine (5 Stages)**
- Create `backend/simulation.py` from `council.py` foundation:
  - `GenesisRound.stage_creation()` — Independent concept generation with soul-loaded prompts
  - `GenesisRound.stage_critique()` — Anonymized peer review with scoring (extends llm-council's Stage 2)
  - `GenesisRound.stage_synthesis()` — Moderator direction + evaluator assessment (extends Stage 3)
  - `GenesisRound.stage_refinement()` — NEW: Directed revision based on critique
  - `GenesisRound.stage_presentation()` — NEW: Group presentation with moderator reaction
- Structured output parsing using `===TAG_START===` / `===TAG_END===` delimiters

**Day 5: Multi-Round Orchestration + State**
- `GenesisSimulation.run_simulation()` — Orchestrate N rounds with elimination
- Update `backend/storage.py` — Persist full simulation state (rounds, concepts, scores, events)
- Resume capability — Load state and continue from any stage
- Quality gate pausing — Stop and wait for human approval at configured rounds

**Day 6: API Endpoints**
- Update `backend/main.py`:
  - `POST /api/simulation/start` — Launch new simulation
  - `GET /api/simulation/{id}/status` — Current round/stage progress
  - `GET /api/simulation/{id}/round/{n}` — Full round results
  - `POST /api/simulation/{id}/gate/{n}/approve` — Approve quality gate
  - `GET /api/simulation/{id}/transcript` — Full transcript
  - Streaming SSE for real-time stage updates (extend existing pattern)
- Keep existing llm-council endpoints working (backward compatible)

**Day 7: Integration Testing**
- Test with 3 participants (quick_test preset: 3 rounds, 3 stages)
- Validate soul loading, prompt injection, structured output parsing
- Test elimination, state persistence, resume

**Deliverable:** A working simulation that runs 5 stages × N rounds in the terminal/API, with state persistence.

---

### Phase 2: Output Engine + Frontend (Week 2)
**Goal:** Make results viewable, beautiful, and usable.

**Day 8-9: Output Engine**
- Create `backend/output_engine.py`:
  - `generate_transcript_html()` — Full simulation transcript as interactive HTML
  - `generate_persona_presentations()` — Per-persona concept evolution reports
  - `generate_winner_deepdive()` — Deep dive on winning concept with all specs
  - `generate_image_prompts()` — Extracted prompts ready for fal.ai
  - `generate_video_scripts()` — Scene-by-scene breakdowns
- Add transcript endpoint: `GET /api/simulation/{id}/transcript`
- Add presentations endpoint: `GET /api/simulation/{id}/presentations`

**Day 10-12: Frontend Rebuild**
- Keep existing llm-council UI components (Sidebar, ChatInterface) for backward compatibility
- Add new simulation-specific components:
  - `SimulationLauncher` — Select type, pick participants from soul library, upload brief
  - `RoundProgress` — Visual indicator showing current round/stage with color coding
  - `ConceptCard` — Display individual concepts with evolution history
  - `CritiquePanel` — Show anonymized critiques with scores
  - `ModeratorDirection` — Display moderator decisions, eliminations, constraints
  - `QualityGate` — Approval interface for human checkpoints
  - `PresentationGallery` — Browse all concepts across rounds
  - `TranscriptViewer` — Interactive full transcript
- Real-time updates via SSE (extend existing streaming pattern)

**Day 13-14: Soul Management UI**
- Soul library browser (list available souls with metadata)
- Soul document viewer (formatted display of all 7 layers)
- Brief editor (simple text editor for project briefs)

**Deliverable:** Full web UI for launching, monitoring, and reviewing simulations.

---

### Phase 3: Media Integrations (Week 3)
**Goal:** Connect to image/video/voice generation APIs.

**Day 15-16: Image Generation**
- Create `backend/image_generator.py`:
  - fal.ai integration (Nano Banana Pro, Recraft V3, Flux 2 Pro, Ideogram V3)
  - Model selection logic based on concept type
  - Batch generation from extracted prompts
- Add endpoint: `POST /api/simulation/{id}/generate-images`
- Frontend: Image gallery with generation status

**Day 17-18: Video & Voice**
- Video prompt generation (Kling 3.0, Veo 3.1 via fal.ai)
- ElevenLabs TTS integration for voiceover scripts
- ElevenLabs Music integration for background tracks
- Production pipeline: concept → image → video → voice → music

**Day 19-20: Simulation Chaining**
- Implement Sim A → Sim B pipeline
- Output of Message Lab (strategy) auto-formats as brief for Genesis Chamber (creative)
- Quality gate between simulations for human approval
- Chain configuration in council-config.json

**Day 21: Production Package**
- Bundle all outputs into interactive HTML package
- Include: transcript, presentations, images, video scripts, copy variations
- Export as self-contained folder

**Deliverable:** Full media pipeline from concept to production-ready assets.

---

### Phase 4: Avatar & Voice Layer (Week 4+)
**Goal:** Bring souls to life visually — from the original Genesis Chamber vision.

This phase bridges from the genesis-chamber-builder spec into the broader platform vision:

- HeyGen avatar integration for visual representations of soul personas
- ElevenLabs voice cloning for persona-specific speech
- Visual "roundtable" view where avatars discuss concepts
- Real-time lip-synced presentations of concepts
- Three.js or similar for 3D chamber environment

### Phase 5: Platform Evolution (Month 2+)
From the original Genesis Chamber vision — features that build on the working engine:

- **Soul Marketplace** — Community-created soul documents
- **Live Chambers** — Multi-user real-time chamber observation
- **Soul Fusion** — Merge multiple souls for hybrid genius profiles
- **Tool-Enabled Souls** — Historical figures using modern AI tools (DALL-E, Blender, etc.)
- **Self-Improving Agents** — Daily capability scanning and soul enhancement
- **Enterprise Features** — Custom chambers, private deployment, API access
- **Monetization** — Tiered pricing (Explorer $99/mo → Enterprise $9,999/mo)

---

## API KEYS NEEDED

| Service | Key | Used For | Phase |
|---------|-----|----------|-------|
| OpenRouter | `OPENROUTER_API_KEY` | All LLM queries | Phase 1 (already working) |
| fal.ai | `FAL_KEY` | Image + video generation | Phase 3 |
| ElevenLabs | `ELEVENLABS_API_KEY` | Voice + music generation | Phase 3 |
| HeyGen | `HEYGEN_API_KEY` | Avatar generation | Phase 4 |

---

## STATE MANAGEMENT

Full JSON state persisted after every stage. Supports resume from any point.

```json
{
  "simulation": {
    "id": "sim_001",
    "type": "message_lab",
    "status": "running",
    "current": { "round": 2, "stage": 3, "stage_name": "synthesis" },
    "config": { "rounds": 6, "participants": [...], "moderator": "jobs" },
    "rounds": [
      {
        "number": 1,
        "status": "complete",
        "concepts_created": 15,
        "concepts_surviving": 9,
        "stages": { "1": {...}, "2": {...}, "3": {...}, "4": {...}, "5": {...} }
      }
    ],
    "concepts": {
      "active": [{ "id": "concept_ogilvy_01", "name": "The Proof Machine", "scores": {...} }],
      "eliminated": [...],
      "merged": [...]
    },
    "quality_gates": [
      { "after_round": 3, "status": "pending" }
    ],
    "transcript": { "entries": [...] }
  }
}
```

---

## SOUL DOCUMENT STRUCTURE (7 Layers)

Each soul document is a 40-60KB markdown file:

| Layer | Size | Purpose |
|-------|------|---------|
| Cognitive | 8-12KB | How they think — philosophy, principles, decision framework, blind spots |
| Emotional | 5-8KB | What drives them — motivations, passions, angers, vulnerabilities |
| Behavioral | 5-8KB | How they act — speech patterns, debate style, presentation habits |
| Project Calibration | 3-5KB | How they'd approach THIS specific project |
| Key Works | 5-8KB | Reference works that reveal their creative DNA |
| Quotes Library | 3-5KB | 15-25 categorized direct quotes for voice authenticity |
| Simulation Instructions | 2-3KB | Technical guardrails for AI embodiment |

The Soul Compiler extracts essentials for models with small context windows (~3500 tokens), or injects the FULL document for Claude/Gemini (200K+ context).

---

## STRUCTURED OUTPUT PARSING

All LLM outputs use delimited blocks for reliable parsing:

```
===CONCEPT_START===
NAME: The Proof Machine
IDEA: ...
HEADLINE: ...
IMAGE_PROMPT: ...
===CONCEPT_END===
```

Parsing via regex: `===TAG_START===(.*?)===TAG_END===`

This replaces llm-council's "FINAL RANKING:" parsing with a more robust system.

---

## COST ESTIMATES

| Simulation | Rounds | Participants | OpenRouter Cost | Media Cost |
|-----------|--------|-------------|----------------|------------|
| Quick Test | 3 | 2-3 | $5-10 | — |
| Message Lab | 6 | 5 | $15-40 | — |
| Genesis Chamber | 8 | 6 | $25-60 | $5-20 |
| Assembly Line | 5 | 5 | $10-30 | $10-50 |
| Full Pipeline | 14-19 | 8-13 | $50-130 | $15-70 |

---

## WHAT TO BUILD FIRST

**Immediate next step:** Phase 1, Day 1-2.

1. Create `backend/models.py` with Pydantic schemas
2. Create `backend/soul_engine.py` with soul loading/compilation
3. Restructure `backend/config.py` for persona-based configuration
4. Create first soul document (Steve Jobs as moderator)
5. Create `backend/simulation.py` with 5-stage round logic

The existing llm-council code stays intact and functional — we build alongside it, not on top of it, until the new system is proven.

---

## KEY DESIGN DECISIONS

1. **Preserve llm-council backward compatibility** — Keep `council.py` working for simple Q&A councils. Add `simulation.py` as the new engine.

2. **Soul documents are markdown** — Human-readable, version-controllable, easy to create with AI research assistance.

3. **Multi-model cognitive diversity** — Different LLMs for different personas. This is the secret sauce.

4. **Anonymized critique is sacred** — The llm-council innovation of blind peer review must be preserved in all stages.

5. **State persistence enables resume** — Long simulations (2+ hours) must survive interruptions.

6. **Quality gates require human judgment** — The system proposes, humans approve. No fully autonomous creative decisions.

7. **Output engine is separate** — Simulation produces data, output engine transforms it into deliverables. Clean separation.

8. **Frontend is rebuilt, not patched** — The simulation UI is fundamentally different from a chat interface. New components, same tech stack (React + Vite).

---

*Genesis Chamber Masterplan v1.0 — Built on karpathy/llm-council, guided by genesis-chamber-builder specs, reaching toward the consciousness platform vision.*
