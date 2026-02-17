"""End-to-end pipeline test for Genesis Chamber.

Tests: soul loading -> concept parsing -> critique parsing -> direction parsing
       -> state persistence -> output generation -> presentation generation

Does NOT make real API calls (uses mock data).
Run: python tests/test_pipeline.py
"""

import sys
import tempfile
from pathlib import Path

# Add project root to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from backend.soul_engine import SoulEngine
from backend.simulation import OutputParser
from backend.models import (
    SimulationState, SimulationConfig, ParticipantConfig,
    Concept, RoundResult, StageResult,
)
from backend.output_engine import OutputEngine
from backend.simulation_store import SimulationStore


def test_soul_loading():
    """Test that all 7 soul documents load and parse."""
    engine = SoulEngine(soul_dir="souls/")

    souls_to_test = [
        "david-ogilvy", "claude-hopkins", "leo-burnett",
        "gary-halbert", "mary-wells-lawrence", "steve-jobs", "jony-ive"
    ]

    for soul_id in souls_to_test:
        soul = engine.load_soul(soul_id, f"souls/{soul_id}.md")
        assert soul["full"], f"Soul {soul_id} has empty full text"
        assert soul["cognitive"], f"Soul {soul_id} missing cognitive layer"
        assert soul["emotional"], f"Soul {soul_id} missing emotional layer"
        assert soul["behavioral"], f"Soul {soul_id} missing behavioral layer"
        assert len(soul["quotes"]) > 0, f"Soul {soul_id} has no quotes"
        print(f"  OK: {soul_id} — {len(soul['full'])} chars, "
              f"cog={len(soul['cognitive'])}, quotes={len(soul['quotes'])}")

    print(f"  All {len(souls_to_test)} souls parsed successfully")


def test_output_parser():
    """Test structured output parsing with mock LLM output."""
    # Test concept parsing
    mock_concept_output = """
===CONCEPT_START===
NAME: The Lighthouse
TAGLINE: Intelligence that guides, not replaces
IDEA: Position Olivia as a lighthouse — a beacon that helps professionals navigate.
HEADLINE: The Smartest Light in the Room
SUBHEAD: AI that illuminates, not overwhelms
BODY_COPY: In a world drowning in data, you need a lighthouse.
VISUAL_DIRECTION: Minimalist lighthouse beam cutting through fog
COLOR_MOOD: Navy blue and warm gold
RATIONALE: Lighthouses are universal symbols of safety and guidance.
IMAGE_PROMPT: A minimalist lighthouse on a dark cliff, warm golden beam cutting through dense fog
===CONCEPT_END===
"""
    concepts = OutputParser.parse_concept(mock_concept_output, "david-ogilvy", "David Ogilvy", 1)
    assert len(concepts) == 1, f"Expected 1 concept, got {len(concepts)}"
    assert concepts[0].name == "The Lighthouse"
    assert concepts[0].headline == "The Smartest Light in the Room"
    assert concepts[0].image_prompt
    print("  OK: Concept parsing (structured)")

    # Test critique parsing
    mock_critique = """
===CRITIQUE_START===
CONCEPT: A
SCORE: 8
STRENGTHS:
- Universal metaphor
- Clear visual direction
WEAKNESSES:
- Slightly safe
FATAL_FLAW: NONE
ONE_CHANGE: Make it bolder
WOULD_YOU_CHAMPION_THIS: Yes
===CRITIQUE_END===
"""
    critiques = OutputParser.parse_critiques(mock_critique, "leo-burnett", "Leo Burnett")
    assert len(critiques) == 1, f"Expected 1 critique, got {len(critiques)}"
    assert critiques[0].score == 8
    assert len(critiques[0].strengths) > 0
    print("  OK: Critique parsing (structured)")

    # Test direction parsing
    mock_direction = """
===DIRECTION_START===
SURVIVING:
- The Lighthouse: Strong metaphor, universal appeal
ELIMINATED:
- The Mirror: Too abstract, lacks emotional hook
MERGE_OPPORTUNITIES:
- Take warmth from Mirror → add to Lighthouse
NEW_CONSTRAINTS:
- Must work as a 5-second animation
DIRECTION: Focus on the lighthouse metaphor but push it further.
ONE_MORE_THING: NONE
===DIRECTION_END===
"""
    direction = OutputParser.parse_direction(mock_direction, "Steve Jobs", 1)
    assert len(direction.surviving_concepts) == 1
    assert len(direction.eliminated_concepts) == 1
    print("  OK: Direction parsing (structured)")

    # Test fallback parsing (loose format)
    loose_concept = "NAME: Quick Test\nTAGLINE: Just a test\nIDEA: Testing the fallback parser\n"
    concepts2 = OutputParser.parse_concept(loose_concept, "test-persona", "Test", 1)
    assert len(concepts2) == 1
    assert concepts2[0].name == "Quick Test"
    print("  OK: Concept parsing (loose fallback)")


def test_state_persistence():
    """Test save and load of simulation state."""
    with tempfile.TemporaryDirectory() as tmpdir:
        store = SimulationStore(output_dir=tmpdir)

        config = SimulationConfig(
            name="Test Sim",
            type="quick_test",
            rounds=3,
            participants={
                "david-ogilvy": ParticipantConfig(
                    display_name="David Ogilvy",
                    model="test/model",
                    soul_document="souls/david-ogilvy.md",
                ),
            },
            moderator=ParticipantConfig(
                display_name="Steve Jobs",
                model="test/model",
                soul_document="souls/steve-jobs.md",
                role="moderator",
            ),
            brief="Test brief",
        )

        state = SimulationState(id="test-sim-001", config=config)
        state.status = "running"
        state.current_round = 1
        store.save_state(state)

        loaded = store.load_state("test-sim-001")
        assert loaded is not None
        assert loaded.config.name == "Test Sim"
        assert loaded.status == "running"
        print("  OK: State save/load round-trip")

        # Test list
        sims = store.list_simulations()
        assert len(sims) >= 1
        print("  OK: List simulations")


def test_output_generation():
    """Test HTML transcript, summary, and reveal.js presentation generation."""
    with tempfile.TemporaryDirectory() as tmpdir:
        config = SimulationConfig(
            name="Output Test Sim",
            type="quick_test",
            rounds=2,
            participants={
                "david-ogilvy": ParticipantConfig(
                    display_name="David Ogilvy",
                    model="test/model",
                    soul_document="souls/david-ogilvy.md",
                ),
            },
            moderator=ParticipantConfig(
                display_name="Steve Jobs",
                model="test/model",
                soul_document="souls/steve-jobs.md",
                role="moderator",
            ),
            brief="Test brief for output generation",
        )

        state = SimulationState(id="test-output-001", config=config, status="completed")
        state.concepts = {
            "active": [
                Concept(
                    id="c1", persona_id="david-ogilvy", persona_name="David Ogilvy",
                    round_created=1, name="The Lighthouse", tagline="Intelligence that guides",
                    idea="Position as a beacon of guidance",
                    headline="The Smartest Light in the Room",
                    image_prompt="Minimalist lighthouse, warm golden beam cutting through fog",
                    status="winner", scores={"1": 8.5, "2": 9.0},
                ),
            ],
            "eliminated": [
                Concept(
                    id="c2", persona_id="leo-burnett", persona_name="Leo Burnett",
                    round_created=1, name="The Mirror", tagline="See yourself clearly",
                    idea="Reflection metaphor for self-awareness AI",
                    status="eliminated", scores={"1": 5.0},
                ),
            ],
            "merged": [],
        }
        state.rounds = [
            RoundResult(
                round_num=1, mode="diverge",
                stages={
                    1: StageResult(stage_num=1, stage_name="creation", status="complete"),
                    2: StageResult(stage_num=2, stage_name="critique", status="complete"),
                    3: StageResult(
                        stage_num=3, stage_name="synthesis", status="complete",
                        outputs={
                            "surviving_concepts": ["The Lighthouse"],
                            "eliminated_concepts": ["The Mirror"],
                            "direction": "Focus on navigation metaphors",
                            "one_more_thing": "NONE",
                        },
                    ),
                },
            ),
        ]
        state.transcript_entries = [
            {
                "round": 1, "stage": 1, "stage_name": "creation",
                "timestamp": "2026-02-17T10:00:00",
                "concepts": [{"persona": "David Ogilvy", "name": "The Lighthouse", "idea": "Beacon concept"}],
            },
        ]

        engine = OutputEngine(output_dir=tmpdir)

        # Test transcript
        sim_dir = Path(tmpdir) / state.id
        sim_dir.mkdir(parents=True, exist_ok=True)
        transcript_path = engine.generate_transcript_html(state, sim_dir)
        assert transcript_path.exists()
        print(f"  OK: Transcript HTML ({transcript_path.stat().st_size} bytes)")

        # Test summary
        summary_path = engine.generate_summary(state, sim_dir)
        assert summary_path.exists()
        print(f"  OK: Summary JSON ({summary_path.stat().st_size} bytes)")

        # Test image prompts
        prompts_path = engine.generate_image_prompts(state, sim_dir)
        assert prompts_path.exists()
        import json
        with open(prompts_path) as f:
            prompts = json.load(f)
        assert len(prompts) == 1  # Only winner has image_prompt
        print(f"  OK: Image prompts ({len(prompts)} prompts)")

        # Test reveal.js presentation
        pres_path = engine.generate_reveal_presentation(state)
        assert pres_path.exists()
        content = pres_path.read_text()
        assert "reveal.js" in content
        assert "cdn.jsdelivr.net" in content
        assert "The Lighthouse" in content
        assert "Genesis" in content
        assert "David Ogilvy" in content
        print(f"  OK: Reveal.js presentation ({pres_path.stat().st_size} bytes)")


if __name__ == "__main__":
    print("=" * 50)
    print("Genesis Chamber Pipeline Test")
    print("=" * 50)

    print("\n1. Soul Loading")
    test_soul_loading()

    print("\n2. Output Parser")
    test_output_parser()

    print("\n3. State Persistence")
    test_state_persistence()

    print("\n4. Output Generation")
    test_output_generation()

    print("\n" + "=" * 50)
    print("ALL TESTS PASSED")
    print("=" * 50)
