# LLM-Council → Genesis Chamber: Exact Modifications

## Overview

This document describes every modification needed to transform `karpathy/llm-council` into the Genesis Chamber. Written for Claude Code implementation.

## File-by-File Changes

### 1. `backend/config.py` — HEAVY MODIFICATION

**Original (26 lines):**
```python
COUNCIL_MODELS = ["openai/gpt-5.1", "google/gemini-3-pro", ...]
CHAIRMAN_MODEL = "google/gemini-3-pro"
```

**Genesis Chamber version:**
```python
# GENESIS CHAMBER CONFIG

# Simulation type
SIMULATION_TYPE = "message_lab"  # or "genesis_chamber" or "assembly_line"

# Participants with persona assignments
PARTICIPANTS = {
    "ogilvy": {
        "model": "anthropic/claude-sonnet-4.5",
        "soul_document": "souls/david-ogilvy.md",
        "role": "participant",
        "temperature": 0.7
    },
    "hopkins": {
        "model": "google/gemini-2.5-pro",
        "soul_document": "souls/claude-hopkins.md",
        "role": "participant",
        "temperature": 0.6
    },
    # ... more participants
}

MODERATOR = {
    "model": "anthropic/claude-opus-4.5",
    "soul_document": "souls/steve-jobs.md",
    "role": "moderator",
    "temperature": 0.5
}

EVALUATOR = {
    "model": "anthropic/claude-sonnet-4.5",
    "soul_document": "souls/jony-ive.md",
    "role": "evaluator",
    "temperature": 0.4
}

# Round configuration
ROUNDS = 6
STAGES_PER_ROUND = 5
CONCEPTS_ROUND_1 = 3  # per participant
CONCEPTS_ROUND_2_PLUS = 1

# Elimination schedule
ELIMINATION = {
    1: 0.0,     # Round 1: no elimination
    2: 0.4,     # Round 2: cut 40%
    3: 0.5,     # Round 3: cut to top 3
    4: 0.67,    # Round 4: cut to top 1-2
}

# Project brief
PROJECT_BRIEF_PATH = "briefs/current-brief.md"
BRAND_CONTEXT_PATH = "context/brand-context.md"

# Output
OUTPUT_DIR = "output/"
TRANSCRIPT_FORMAT = "html"  # or "md"
```

### 2. `backend/council.py` (335 lines) — HEAVY MODIFICATION

This is the core file. Changes needed:

**A. Add Soul Engine (new class):**
```python
class SoulEngine:
    def __init__(self, soul_dir="souls/"):
        self.souls = {}

    def load_soul(self, persona_id: str, soul_path: str) -> dict:
        """Load and parse a soul document into layers"""
        raw = Path(soul_path).read_text()
        return {
            "full": raw,
            "cognitive": self._extract_section(raw, "COGNITIVE LAYER"),
            "emotional": self._extract_section(raw, "EMOTIONAL LAYER"),
            "behavioral": self._extract_section(raw, "BEHAVIORAL LAYER"),
            "calibration": self._extract_section(raw, "PROJECT CALIBRATION"),
            "quotes": self._extract_quotes(raw),
            "instructions": self._extract_section(raw, "SIMULATION INSTRUCTIONS")
        }

    def compile_system_prompt(self, soul: dict, stage: int,
                               round_num: int, brief: str) -> str:
        """Compile soul + stage + round into a system prompt"""
        # For models with large context: use full soul
        # For smaller models: use compiled version (~3500 tokens)
        ...

    def _extract_section(self, text: str, header: str) -> str:
        """Extract a named section from markdown"""
        ...
```

**B. Extend CouncilSession from 3 stages to 5:**
```python
class GenesisRound:
    """One complete round of the Genesis Chamber"""

    async def run_round(self, round_num: int, context: RoundContext):
        # Stage 1: Independent creation
        concepts = await self._stage_creation(round_num, context)

        # Stage 2: Anonymized critique
        critiques = await self._stage_critique(concepts)

        # Stage 3: Moderator synthesis
        direction = await self._stage_synthesis(concepts, critiques, round_num)

        # Stage 4: Refinement
        refined = await self._stage_refinement(concepts, direction)

        # Stage 5: Presentation
        presentations = await self._stage_presentation(refined)

        return RoundResult(concepts, critiques, direction, refined, presentations)
```

**C. Add multi-round orchestration:**
```python
class GenesisSimulation:
    """Orchestrates multiple rounds"""

    async def run_simulation(self, config: SimConfig):
        results = []
        context = RoundContext(brief=config.brief, brand=config.brand)

        for round_num in range(1, config.rounds + 1):
            round_runner = GenesisRound(
                participants=self._get_active_participants(round_num),
                moderator=config.moderator,
                evaluator=config.evaluator,
                soul_engine=self.soul_engine
            )
            result = await round_runner.run_round(round_num, context)

            # Apply elimination
            context.update(result)
            context.eliminate(config.elimination.get(round_num, 0))

            results.append(result)

            # Quality gate check
            if round_num in config.quality_gates:
                await self._quality_gate_pause(round_num, results)

        return SimulationResult(results)
```

**D. Modify anonymization for concepts (not just responses):**
```python
def anonymize_concepts(self, concepts: list) -> list:
    """Replace persona names with Concept A, B, C..."""
    shuffled = random.sample(concepts, len(concepts))
    labels = "ABCDEFGHIJKLMNOP"
    return [
        {**c, "label": f"Concept {labels[i]}", "persona": "[ANONYMOUS]"}
        for i, c in enumerate(shuffled)
    ]
```

### 3. `backend/main.py` (199 lines) — MODERATE MODIFICATION

**Add new API endpoints:**
```python
# NEW ENDPOINTS
@app.post("/api/simulation/start")
async def start_simulation(config: SimulationConfig):
    """Start a new Genesis Chamber simulation"""

@app.get("/api/simulation/{sim_id}/status")
async def get_status(sim_id: str):
    """Get current round/stage progress"""

@app.get("/api/simulation/{sim_id}/round/{round_num}")
async def get_round(sim_id: str, round_num: int):
    """Get full round results"""

@app.post("/api/simulation/{sim_id}/gate/{gate_num}/approve")
async def approve_gate(sim_id: str, gate_num: int):
    """Approve a quality gate to continue"""

@app.get("/api/simulation/{sim_id}/transcript")
async def get_transcript(sim_id: str, format: str = "html"):
    """Get full simulation transcript"""

@app.get("/api/simulation/{sim_id}/presentations")
async def get_presentations(sim_id: str):
    """Get per-persona presentation data"""

@app.post("/api/simulation/{sim_id}/generate-images")
async def generate_images(sim_id: str):
    """Generate images from concept prompts"""
```

### 4. `backend/storage.py` (172 lines) — MODERATE MODIFICATION

**Extend storage for multi-round state:**
```python
class SimulationStore:
    """Persistent storage for simulation state"""

    def save_round(self, sim_id: str, round_num: int, result: RoundResult):
        """Save one round's complete results"""

    def load_simulation(self, sim_id: str) -> SimulationState:
        """Load full simulation state (for resuming)"""

    def save_quality_gate(self, sim_id: str, gate_num: int, decision: str):
        """Record quality gate decision"""
```

### 5. `backend/openrouter.py` (79 lines) — MINOR MODIFICATION

Add soul document injection into system prompts:
```python
async def query_with_soul(self, model: str, system_prompt: str,
                           soul_prompt: str, user_prompt: str) -> str:
    """Query with combined soul + system + user prompts"""
    messages = [
        {"role": "system", "content": soul_prompt + "\n\n" + system_prompt},
        {"role": "user", "content": user_prompt}
    ]
    return await self._query(model, messages)
```

### 6. NEW FILE: `backend/output_engine.py`

```python
class OutputEngine:
    """Generates deliverables from simulation results"""

    def generate_transcript_html(self, simulation: SimulationResult) -> str:
        """Full simulation transcript as interactive HTML"""

    def generate_persona_presentations(self, simulation: SimulationResult) -> list:
        """One HTML presentation per persona showing their concept evolution"""

    def generate_winner_deepdive(self, simulation: SimulationResult) -> str:
        """Deep dive on the winning concept"""

    def generate_image_prompts(self, simulation: SimulationResult) -> list:
        """Per-concept image generation prompts for fal.ai"""

    def generate_video_scripts(self, simulation: SimulationResult) -> list:
        """Scene-by-scene video scripts"""

    def generate_production_package(self, simulation: SimulationResult) -> str:
        """Interactive HTML production package"""
```

### 7. NEW FILE: `backend/image_generator.py`

```python
class ImageGenerator:
    """Connects to fal.ai for image generation"""

    async def generate_concept_image(self, prompt: str,
                                      model: str = "nano_banana") -> str:
        """Generate one image from a concept prompt"""

    async def generate_slide_images(self, slides: list) -> list:
        """Batch generate images for all slides"""

    async def generate_moodboard(self, concepts: list) -> list:
        """Generate moodboard images for a set of concepts"""
```

### 8. Frontend Changes

The React frontend needs significant UI changes:

**Original:** Simple chat interface
**Genesis Chamber:** Simulation dashboard with:
- Round progress indicator
- Per-persona concept cards
- Critique visualization (heatmap)
- Moderator direction display
- Quality gate approval buttons
- Presentation gallery
- Image generation status
- Transcript viewer

This is the biggest development effort. Consider building as a new React app that consumes the same FastAPI backend.

## New File Structure

```
genesis-chamber/                    (forked from llm-council)
├── backend/
│   ├── config.py                   ← HEAVILY MODIFIED
│   ├── council.py                  ← HEAVILY MODIFIED (renamed to simulation.py)
│   ├── main.py                     ← MODERATELY MODIFIED
│   ├── openrouter.py               ← MINOR MODIFICATION
│   ├── storage.py                  ← MODERATELY MODIFIED
│   ├── soul_engine.py              ← NEW
│   ├── output_engine.py            ← NEW
│   ├── image_generator.py          ← NEW
│   └── models.py                   ← NEW (Pydantic models)
├── souls/                          ← NEW DIRECTORY
│   ├── david-ogilvy.md
│   ├── claude-hopkins.md
│   ├── leo-burnett.md
│   ├── steve-jobs.md
│   ├── jony-ive.md
│   └── ...
├── briefs/                         ← NEW DIRECTORY
│   └── current-brief.md
├── context/                        ← NEW DIRECTORY
│   └── brand-context.md
├── output/                         ← NEW DIRECTORY
│   └── sim_001/
│       ├── transcript.html
│       ├── presentations/
│       ├── images/
│       └── scripts/
├── frontend/                       ← HEAVILY MODIFIED or REBUILT
│   └── src/
└── prompts/                        ← NEW DIRECTORY
    ├── stage1_creation.md
    ├── stage2_critique.md
    ├── stage3_synthesis.md
    ├── stage4_refinement.md
    └── stage5_presentation.md
```

## Implementation Order

1. **Day 1:** Soul Engine + config restructure
2. **Day 2:** Extend council.py → simulation.py (5 stages)
3. **Day 3:** Multi-round orchestration + state management
4. **Day 4:** Output engine (transcript + presentations)
5. **Day 5:** Image generator integration
6. **Day 6:** API endpoints + quality gates
7. **Day 7:** Frontend rebuild (basic)
8. **Day 8-10:** Frontend polish + testing
