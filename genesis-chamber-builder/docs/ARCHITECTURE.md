# Genesis Chamber — Full Technical Architecture

## 1. System Overview

The Genesis Chamber is a multi-persona AI simulation engine that orchestrates creative debates between AI participants, each loaded with deep consciousness profiles ("Soul Documents"). It extends Karpathy's llm-council from a simple Q&A council into a full iterative creative workshop.

## 2. Core Engines

### 2.1 Soul Engine

Responsible for loading, parsing, and injecting soul documents into model system prompts.

```
Soul Engine
├── Soul Loader       → Reads .md files, parses layers
├── Soul Compiler     → Converts to system prompt (~4000 tokens)
├── Brief Calibrator  → Adds project-specific context
└── Voice Validator   → Ensures output matches persona speech patterns
```

**Soul Document Structure** (see `SOUL-FORMAT.md` for full spec):

```
COGNITIVE LAYER (How they think)
├── Core Philosophy (3-5 principles)
├── Decision Framework (how they evaluate)
├── Creative Process (how they generate)
└── Blind Spots (what they miss)

EMOTIONAL LAYER (What drives them)
├── Core Motivations (what they fight for)
├── Triggers (what excites vs angers them)
├── Vulnerabilities (where they're human)
└── Legacy Anxiety (what they want to leave behind)

BEHAVIORAL LAYER (How they act)
├── Communication Style (word choice, sentence structure, rhythm)
├── Debate Behavior (how they argue, concede, attack)
├── Collaboration Patterns (leader vs team player vs lone wolf)
└── Signature Moves (catchphrases, recurring metaphors, habits)

PROJECT CALIBRATION (How they'd approach THIS brief)
├── First Reaction (gut response to the project)
├── What They'd Focus On (their angle)
├── What They'd Fight Against (what they'd reject)
└── Dream Outcome (their ideal result)
```

### 2.2 Council Engine

The core debate mechanism. Extended from llm-council's 3-stage architecture.

```
ORIGINAL LLM-COUNCIL:
Stage 1: Independent Response → Stage 2: Blind Ranking → Stage 3: Chairman Synthesis

GENESIS CHAMBER EXTENSION:
Stage 1: Independent Concept Creation (with soul-loaded prompts)
Stage 2: Blind Peer Critique (anonymized as Concept A/B/C/D/E/F)
Stage 3: Moderator Synthesis + Direction Setting
Stage 4: Refinement Round (participants revise based on critique)
Stage 5: Final Presentation (each participant presents refined concept)
... repeat for N rounds with evolution
```

**Multi-Round Architecture:**

```
Round 1: DIVERGE — Maximum creative breadth
  ├── Stage 1: Each persona generates 1-3 concepts independently
  ├── Stage 2: Anonymous peer critique (every persona rates every concept)
  ├── Stage 3: Moderator identifies top 3 directions + explains WHY
  └── Stage 4: Each persona can adopt/merge/evolve concepts

Round 2: CONVERGE — Narrow to strongest directions
  ├── Stage 1: Each persona presents revised concept (informed by Round 1 critique)
  ├── Stage 2: Anonymous critique with RANKING (not just feedback)
  ├── Stage 3: Moderator eliminates bottom 50%, sets constraints
  └── Stage 4: Surviving concepts get deeper development

Round 3: DEEPEN — Production-ready refinement
  ├── Stage 1: Remaining concepts get full treatment (name, tagline, visual system, copy)
  ├── Stage 2: Detailed critique on execution quality
  ├── Stage 3: Moderator selects winner + runner-up
  └── Stage 4: Winner gets full specification

Round 4+: POLISH — (optional) Final refinement of winner
  ├── Stage 1: Full team works on the winning direction
  ├── Stage 2: Critique focuses on production readiness
  └── Stage 3: Final locked specification
```

### 2.3 Output Engine

Transforms simulation results into deliverables.

```
Output Engine
├── Transcript Generator   → Full simulation transcript (HTML/MD)
├── Presentation Builder   → Per-persona concept presentations (HTML)
├── Prompt Generator       → Image generation prompts per concept
├── Video Script Writer    → Scene-by-scene video breakdowns
├── Moodboard Compiler     → Visual direction collections
└── Production Packager    → Bundles everything for handoff
```

## 3. Data Flow

```
INPUT                    PROCESSING                    OUTPUT
┌──────────┐            ┌──────────────┐              ┌──────────────┐
│ Soul Docs│──┐    ┌───▶│ Round 1      │──┐      ┌───▶│ Transcript   │
│ (N files)│  │    │    │ (5 stages)   │  │      │    │ (full HTML)  │
└──────────┘  │    │    └──────────────┘  │      │    └──────────────┘
              ▼    │    ┌──────────────┐  │      │    ┌──────────────┐
┌──────────┐ SOUL  │    │ Round 2      │  │      ├───▶│ Presentations│
│ Brief    │─ENGINE─┤    │ (5 stages)   │  │MERGE │    │ (per person) │
│ (1 file) │  │    │    └──────────────┘  │      │    └──────────────┘
└──────────┘  │    │    ┌──────────────┐  │      │    ┌──────────────┐
              │    │    │ Round 3      │──┘      ├───▶│ Image Prompts│
┌──────────┐  │    │    │ (5 stages)   │         │    │ (per slide)  │
│ Brand    │──┘    │    └──────────────┘         │    └──────────────┘
│ Context  │       │    ┌──────────────┐         │    ┌──────────────┐
└──────────┘       └───▶│ Round N...   │─────────┴───▶│ Video Scripts │
                        └──────────────┘              └──────────────┘
```

## 4. Model Configuration

### Option A: Multi-Model (via OpenRouter)
Each persona uses a DIFFERENT underlying model for maximum cognitive diversity:

```json
{
  "participants": {
    "ogilvy": { "model": "anthropic/claude-sonnet-4.6", "temperature": 0.7 },
    "hopkins": { "model": "google/gemini-2.5-pro", "temperature": 0.6 },
    "burnett": { "model": "openai/gpt-5.1", "temperature": 0.8 },
    "wells": { "model": "x-ai/grok-4", "temperature": 0.7 },
    "halbert": { "model": "meta/llama-4-maverick", "temperature": 0.9 }
  },
  "moderator": {
    "jobs": { "model": "anthropic/claude-opus-4.5", "temperature": 0.5 }
  }
}
```

This creates genuine cognitive diversity — different models literally think differently.

### Option B: Single-Model (Claude native simulation)
One model plays all roles using soul documents for differentiation. Faster, cheaper, no API keys needed. Works surprisingly well with deep enough soul documents.

### Recommendation
Start with Option B for prototyping. Move to Option A for production — the cognitive diversity is real and measurable.

## 5. API Integrations

### Image Generation
```
Concept → Prompt Generator → Nano Banana Pro (fal.ai)
                           → Recraft V3 (fal.ai)
                           → Flux 2 Pro (fal.ai)
                           → Ideogram V3 (fal.ai)
```

### Video Generation
```
Image + Script → Kling 3.0 (fal.ai) → 5-10s clips
               → Veo 3.1 (fal.ai) → 8s clips
               → Wan 2.6 (fal.ai) → 8s clips
```

### Voice & Music
```
Script → ElevenLabs V3 TTS → Voice-over
Music Prompt → ElevenLabs Music → Background track
```

## 6. State Management

Each simulation maintains state across rounds:

```json
{
  "simulation_id": "sim_001",
  "type": "message_lab",
  "round": 2,
  "stage": 3,
  "participants": [...],
  "concepts": {
    "active": [...],
    "eliminated": [...],
    "merged": [...]
  },
  "moderator_directions": [...],
  "quality_gates": {
    "gate_1": { "status": "passed", "notes": "..." },
    "gate_2": { "status": "pending" }
  },
  "outputs": {
    "transcript": "...",
    "presentations": [...],
    "prompts": [...]
  }
}
```

## 7. Differences from llm-council

| Feature | llm-council | Genesis Chamber |
|---------|-------------|-----------------|
| Persona depth | None (raw model) | 40-60KB soul documents |
| Rounds | 1 (single pass) | 4-8 (iterative) |
| Stages per round | 3 | 5 (adds refinement + presentation) |
| Output | Text answer | Concepts, presentations, prompts, scripts |
| Critique | Ranking only | Ranking + qualitative feedback + persona voice |
| Chairman | Synthesis only | Direction setting + elimination + constraint definition |
| State | Stateless | Persistent across rounds |
| Chaining | No | Sim A output → Sim B input |
| Image generation | No | Integrated prompt generation |
| Multi-sim | No | Yes (strategy → execution pipeline) |

## 8. Implementation Priority

### Phase 1: Core Fork (Week 1)
- Fork llm-council
- Add soul document loader
- Extend 3-stage to 5-stage
- Add multi-round support
- Add state persistence (JSON)

### Phase 2: Output Engine (Week 2)
- Transcript generator (HTML)
- Per-persona presentation builder
- Prompt generator for image models

### Phase 3: Integrations (Week 3)
- fal.ai image generation (Nano Banana, Recraft, Flux)
- ElevenLabs voice-over
- Video prompt generation

### Phase 4: UI (Week 4)
- Interactive simulation viewer
- Real-time round monitoring
- Quality gate approval interface
- Production package builder
