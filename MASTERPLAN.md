# GENESIS CHAMBER — MASTERPLAN

## What This Is

A focused build plan for transforming the existing `llm-council` fork into the Genesis Chamber simulation engine, guided entirely by the `genesis-chamber-builder/` specifications. No avatars, no marketplace, no self-improving agents — just a high-end, interactive multi-persona AI creative simulation with a polished frontend.

---

## What We Have (llm-council — Working)

A 3-stage LLM deliberation system:
- **Backend:** FastAPI (port 8001) with OpenRouter integration, parallel model queries, anonymized peer review, chairman synthesis, SSE streaming, JSON storage
- **Frontend:** React 19 + Vite (port 5173) with conversation sidebar, chat interface, tabbed stage views (Stage1/2/3), markdown rendering
- **Key files:** `council.py` (335 lines), `main.py` (199 lines), `openrouter.py` (79 lines), `storage.py` (172 lines), `config.py` (26 lines)

## What We're Building (Genesis Chamber)

A 5-stage, multi-round creative simulation engine where 5-13 AI participants — each loaded with deep consciousness profiles ("soul documents") — debate, critique, and refine concepts across multiple rounds with elimination mechanics, quality gates, and production output.

**What changes from llm-council:**

| Feature | llm-council | Genesis Chamber |
|---------|-------------|-----------------|
| Persona depth | None (raw model) | 40-60KB soul documents |
| Rounds | 1 (single pass) | 4-8 (iterative refinement) |
| Stages per round | 3 | 5 (adds refinement + presentation) |
| Output type | Text answer | Concepts, visuals, scripts, packages |
| Critique | Ranking only | Scoring + qualitative + persona voice |
| Chairman | Synthesis only | Direction + elimination + constraints |
| State | Stateless | Persistent across rounds, resumable |
| Chaining | No | Sim A output → Sim B input |
| Media | No | Image/video prompts (fal.ai), voice (ElevenLabs) |

---

## Architecture

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

---

## Five-Stage Round System

1. **CREATE** (green) — Each participant works independently with soul loaded. Generates 1-3 concepts (R1) or 1 refined concept (R2+). No access to others' work.
2. **CRITIQUE** (amber) — All concepts shuffled and labeled "Concept A, B, C..." anonymously. Each participant scores + critiques every concept including their own unknowingly.
3. **SYNTHESIZE** (red) — Moderator (Jobs) receives all concepts + critiques + scores. Eliminates weak concepts, sets direction. Evaluator (Ive) adds craft assessment.
4. **REFINE** (blue) — Surviving participants revise based on critique + moderator direction. Can evolve, merge, pivot, or defend.
5. **PRESENT** (purple) — Group presentation with evolution notes. Moderator gives 3-sentence reaction.

## Multi-Round Progression

| Round | Mode | Elimination | Expected Concepts |
|-------|------|-------------|-------------------|
| R1 | DIVERGE | 0% | 10-18 created |
| R2 | CONVERGE | 40% | 6-10 surviving |
| R3 | DEEPEN | 50% | 3-5 surviving |
| R4 | GLADIATOR | 67% | 1-2 surviving |
| R5 | POLISH | 0% | 1 winner refined |
| R6 | SPEC | 0% | Production spec |

Quality gates after configurable rounds pause for human approval.

## Model Strategy

Different LLMs per persona for cognitive diversity (all via OpenRouter):

| Role | Model | Why |
|------|-------|-----|
| Moderator (Jobs) | Claude Opus 4.6 **or** GPT-5.2 | Synthesis + judgment — needs highest reasoning tier |
| Evaluator (Ive) | Claude Opus 4.6 **or** GPT-5.2 | Craft precision — needs deep aesthetic reasoning |
| Analytical personas | Gemini 2.5 Pro | Research, long context |
| Creative personas | GPT-5.1 | Emotional depth |
| Bold/provocative | Grok 4 | Unfiltered |
| Direct/efficient | Llama 4 Maverick | No-nonsense |

### High-End Model Strategy for Moderator & Evaluator

**Steve Jobs (Moderator)** and **Jony Ive (Evaluator)** are the two most critical roles in the simulation. They judge, eliminate, direct, and assess craft quality. These roles demand the highest reasoning and synthesis capabilities available.

**Candidate models (must benchmark both):**

| Model | ID (OpenRouter) | Strengths | Considerations |
|-------|-----------------|-----------|----------------|
| Claude Opus 4.6 | `anthropic/claude-opus-4-6` | Deepest reasoning, best synthesis, nuanced judgment, large context | Highest cost per token |
| GPT-5.2 | `openai/gpt-5.2` | Strong creative reasoning, fast, excellent instruction following | May lack Claude's nuance in multi-turn synthesis |

**Evaluation plan:**
1. Run identical `quick_test` simulation twice — once with Claude Opus 4.6 for Jobs+Ive, once with GPT-5.2
2. Compare: quality of moderator direction, depth of evaluator craft assessment, elimination reasoning, "one more thing" insight quality
3. Assess cost/performance ratio — both are premium tier but pricing differs
4. Consider hybrid: Jobs on one model, Ive on the other for maximum cognitive diversity
5. Decision before full `genesis_chamber` runs

**Config supports easy switching** — just change `model` field in `DEFAULT_MODERATOR` and `DEFAULT_EVALUATOR` in `backend/config.py`.

---

## Build Phases

### Phase 1: Foundation (Backend Data Layer)

| Step | File | Action | Lines |
|------|------|--------|-------|
| 1.1 | `backend/models.py` | CREATE — Pydantic schemas for everything | ~200 |
| 1.2 | `backend/soul_engine.py` | CREATE — Load/parse/compile soul documents | ~180 |
| 1.3 | `backend/openrouter.py` | MODIFY — Add `query_with_soul()` + parallel variant | +40 |
| 1.4 | `backend/config.py` | MODIFY — Participant configs, presets, directories | ~120 |
| 1.5 | `souls/`, `briefs/`, `prompts/` | CREATE — Directories + test souls + example brief | — |

### Phase 2: Simulation Engine (Core Logic)

| Step | File | Action | Lines |
|------|------|--------|-------|
| 2.1 | `backend/simulation.py` | CREATE — OutputParser + GenesisRound (5 stages) + GenesisSimulation (multi-round) | ~500 |
| 2.2 | `backend/storage.py` | MODIFY — Add SimulationStore class | +80 |

### Phase 3: API Endpoints + Streaming

| Step | File | Action | Lines |
|------|------|--------|-------|
| 3.1 | `backend/main.py` | MODIFY — 8 new endpoints alongside existing ones, SSE streaming | +180 |

**New endpoints:**
- `GET /api/simulations` — list all simulations
- `POST /api/simulation/start` — start simulation
- `POST /api/simulation/start/stream` — start with SSE streaming
- `GET /api/simulation/{id}/status` — current progress
- `GET /api/simulation/{id}/round/{n}` — round results
- `POST /api/simulation/{id}/gate/{n}/approve` — approve quality gate
- `GET /api/simulation/{id}/transcript` — transcript entries
- `GET /api/souls` — list available soul documents

**Milestone: quick_test runs via API** (3 rounds, 3 stages, 2-3 participants, ~$5-10)

### Phase 4: Frontend — Interactive Dashboard

| Step | File | Action | Lines |
|------|------|--------|-------|
| 4.1 | `App.jsx` | MODIFY — Mode state (council/genesis), simulation state | +60 |
| 4.2 | `Sidebar.jsx` | MODIFY — Mode toggle, simulation list | +40 |
| 4.3 | `api.js` | MODIFY — 7 new API methods | +100 |
| 4.4a | `SimulationLauncher.jsx` | CREATE — Preset selector, participant picker, brief editor | ~200 |
| 4.4b | `SimulationDashboard.jsx` | CREATE — Main container, SSE streaming, routing | ~300 |
| 4.4c | `RoundProgress.jsx` | CREATE — Timeline with colored stage dots | ~120 |
| 4.4d | `ConceptCard.jsx` | CREATE — Concept display with persona color + scores | ~150 |
| 4.4e | `CritiquePanel.jsx` | CREATE — Tabbed critique view with de-anonymization | ~180 |
| 4.4f | `ModeratorDirection.jsx` | CREATE — Surviving/eliminated + direction | ~120 |
| 4.4g | `QualityGate.jsx` | CREATE — Approval modal | ~80 |
| 4.4h | `PresentationGallery.jsx` | CREATE — Stage 5 gallery view | ~130 |
| 4.4i | `TranscriptViewer.jsx` | CREATE — Filterable event viewer | ~150 |
| 4.5 | `genesis-theme.css` | CREATE — Dark theme, teal `#00D9C4` accent | ~100 |

**Milestone: full interactive simulation UI with real-time updates**

### Phase 5: Output Engine + Media

| Step | File | Action | Lines |
|------|------|--------|-------|
| 5.1 | `backend/output_engine.py` | CREATE — Transcript HTML, presentations, prompts | ~300 |
| 5.2 | `backend/image_generator.py` | CREATE — fal.ai integration | ~150 |

**Milestone: end-to-end from simulation to production output**

---

## Build Order (Dependency Graph)

```
models.py → soul_engine.py → openrouter.py mod → config.py → directories + seeds
    ↓
simulation.py → storage.py additions
    ↓
main.py endpoints
    ↓
  ★ BACKEND MILESTONE: quick_test via API
    ↓
App.jsx + Sidebar.jsx + api.js → SimulationLauncher → SimulationDashboard →
RoundProgress → ConceptCard + CritiquePanel + ModeratorDirection →
QualityGate + PresentationGallery + TranscriptViewer → genesis-theme.css
    ↓
  ★ FRONTEND MILESTONE: interactive UI
    ↓
output_engine.py → image_generator.py
    ↓
  ★ COMPLETE
```

---

## Quick-Test-First Strategy

The `quick_test` preset validates the pipeline fast before scaling:
- **3 rounds** (not 6-8)
- **3 stages** (CREATE, CRITIQUE, SYNTHESIZE — skip REFINE, PRESENT)
- **2-3 participants** (not 5-7)
- **No quality gates**
- **Cost:** $5-10
- **Time:** 15-30 minutes

Once quick_test works end-to-end, expand to full 5-stage, 6-round `message_lab` preset.

---

## Target Folder Structure

```
GenesisChamber/
├── backend/
│   ├── __init__.py
│   ├── config.py               ← MODIFIED (personas, rounds, presets)
│   ├── simulation.py           ← NEW (5-stage engine)
│   ├── council.py              ← PRESERVED (original llm-council)
│   ├── soul_engine.py          ← NEW (load & compile souls)
│   ├── output_engine.py        ← NEW (generate deliverables)
│   ├── image_generator.py      ← NEW (fal.ai integration)
│   ├── models.py               ← NEW (Pydantic schemas)
│   ├── main.py                 ← MODIFIED (new endpoints)
│   ├── openrouter.py           ← MODIFIED (soul prompt injection)
│   └── storage.py              ← MODIFIED (simulation state)
├── souls/                      ← NEW (soul documents)
├── briefs/                     ← NEW (project briefs)
├── context/                    ← NEW (brand context)
├── output/                     ← NEW (simulation output)
├── prompts/                    ← NEW (stage prompt templates)
├── frontend/                   ← MODIFIED (mode switch + new components)
│   └── src/
│       ├── components/
│       │   ├── SimulationLauncher.jsx   ← NEW
│       │   ├── SimulationDashboard.jsx  ← NEW
│       │   ├── RoundProgress.jsx        ← NEW
│       │   ├── ConceptCard.jsx          ← NEW
│       │   ├── CritiquePanel.jsx        ← NEW
│       │   ├── ModeratorDirection.jsx   ← NEW
│       │   ├── QualityGate.jsx          ← NEW
│       │   ├── PresentationGallery.jsx  ← NEW
│       │   ├── TranscriptViewer.jsx     ← NEW
│       │   └── ... (existing preserved)
│       ├── genesis-theme.css            ← NEW
│       └── ...
├── genesis-chamber-builder/    ← REFERENCE DOCS (unchanged)
├── MASTERPLAN.md               ← THIS FILE
├── CLAUDE.md                   ← Technical notes
└── start.sh                    ← Startup script
```

---

## Backward Compatibility

- `council.py` stays **untouched** — original Q&A council mode keeps working
- All existing conversation endpoints unchanged
- Frontend "Council" mode preserved alongside "Genesis Chamber" mode
- `start.sh` continues to work
- No breaking changes to existing functionality

## Simulation Presets

| Preset | Rounds | Stages | Participants | Cost | Time |
|--------|--------|--------|-------------|------|------|
| quick_test | 3 | 3 | 2-3 | $5-10 | 15-30 min |
| message_lab | 6 | 5 | 5 | $15-40 | 45-90 min |
| genesis_chamber | 8 | 5 | 6 | $25-60 | 60-120 min |
| assembly_line | 5 | 5 | 5 | $10-30 | 30-60 min |
| full_pipeline | 14-19 | 5 | 8-13 | $50-130 | 2-5 hours |

## Reference Documentation

All detailed specs in `genesis-chamber-builder/`:
- `docs/ARCHITECTURE.md` — System architecture
- `docs/SOUL-FORMAT.md` — Soul document spec
- `docs/SIMULATION-PROTOCOL.md` — Round rules, 5 stages, elimination
- `docs/PROMPT-ENGINEERING.md` — System prompts for all stages
- `docs/INTEGRATION-GUIDE.md` — fal.ai, ElevenLabs pipeline
- `architecture/llm-council-delta.md` — Exact file-by-file modifications
- `architecture/state-machine.md` — State schema + resume
- `config/council-config.example.json` — Full working config
- `prompts/output-format.md` — Structured output parsing
