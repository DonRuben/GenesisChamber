"""Configuration for the LLM Council and Genesis Chamber."""

import os
from dotenv import load_dotenv

load_dotenv()

# === ORIGINAL LLM-COUNCIL CONFIG (preserved) ===

# OpenRouter API key
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

# Council members - list of OpenRouter model identifiers
COUNCIL_MODELS = [
    "openai/gpt-5.1",
    "google/gemini-3-pro-preview",
    "anthropic/claude-sonnet-4.5",
    "x-ai/grok-4",
]

# Chairman model - synthesizes final response
CHAIRMAN_MODEL = "google/gemini-3-pro-preview"

# OpenRouter API endpoint
OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"

# Data directory for conversation storage
DATA_DIR = "data/conversations"


# === GENESIS CHAMBER CONFIG (new) ===

GENESIS_ENABLED = True

# Directory paths
SOULS_DIR = "souls/"
BRIEFS_DIR = "briefs/"
CONTEXT_DIR = "context/"
SIMULATION_OUTPUT_DIR = "output/"

# External API keys (for future media integration)
FAL_KEY = os.getenv("FAL_KEY", "")
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY", "")

# Simulation presets (from genesis-chamber-builder/config/simulation-presets.json)
QUICK_TEST_PRESET = {
    "name": "Quick Test",
    "type": "quick_test",
    "rounds": 3,
    "stages_per_round": 3,  # CREATE, CRITIQUE, SYNTHESIZE only
    "concepts_round_1": 2,
    "concepts_round_2_plus": 1,
    "elimination_schedule": {"1": 0.0, "2": 0.4, "3": 0.5},
    "quality_gates": [],
}

MESSAGE_LAB_PRESET = {
    "name": "Message Lab",
    "type": "message_lab",
    "rounds": 6,
    "stages_per_round": 5,
    "concepts_round_1": 3,
    "concepts_round_2_plus": 1,
    "elimination_schedule": {"1": 0.0, "2": 0.4, "3": 0.5, "4": 0.67, "5": 0.0, "6": 0.0},
    "quality_gates": [3, 6],
}

GENESIS_CHAMBER_PRESET = {
    "name": "Genesis Chamber",
    "type": "genesis_chamber",
    "rounds": 8,
    "stages_per_round": 5,
    "concepts_round_1": 3,
    "concepts_round_2_plus": 1,
    "elimination_schedule": {"1": 0.0, "2": 0.4, "3": 0.5, "4": 0.67, "5": 0.0, "6": 0.0, "7": 0.0, "8": 0.0},
    "quality_gates": [4, 8],
}

ASSEMBLY_LINE_PRESET = {
    "name": "Assembly Line",
    "type": "assembly_line",
    "rounds": 5,
    "stages_per_round": 5,
    "concepts_round_1": 2,
    "concepts_round_2_plus": 1,
    "elimination_schedule": {"1": 0.0, "2": 0.4, "3": 0.5, "4": 0.0, "5": 0.0},
    "quality_gates": [3, 5],
}

SIMULATION_PRESETS = {
    "quick_test": QUICK_TEST_PRESET,
    "message_lab": MESSAGE_LAB_PRESET,
    "genesis_chamber": GENESIS_CHAMBER_PRESET,
    "assembly_line": ASSEMBLY_LINE_PRESET,
}

# Round mode names
ROUND_MODES = {
    1: "diverge",
    2: "converge",
    3: "deepen",
    4: "gladiator",
    5: "polish",
    6: "spec",
    7: "polish",
    8: "spec",
}

# Persona colors (from GENESIS-CHAMBER-BLUEPRINT.html)
PERSONA_COLORS = {
    "david-ogilvy": "#F59E0B",
    "claude-hopkins": "#3B82F6",
    "leo-burnett": "#10B981",
    "mary-wells-lawrence": "#EC4899",
    "gary-halbert": "#EF4444",
    "steve-jobs": "#6B7280",
    "jony-ive": "#9CA3AF",
}

# Default participant configurations
DEFAULT_PARTICIPANTS = {
    "david-ogilvy": {
        "name": "David Ogilvy",
        "model": "google/gemini-2.5-pro",
        "soul_document": "souls/david-ogilvy.md",
        "role": "participant",
        "temperature": 0.7,
        "max_tokens": 4000,
        "color": "#F59E0B",
    },
    "claude-hopkins": {
        "name": "Claude Hopkins",
        "model": "anthropic/claude-sonnet-4-5-20250929",
        "soul_document": "souls/claude-hopkins.md",
        "role": "participant",
        "temperature": 0.6,
        "max_tokens": 4000,
        "color": "#3B82F6",
    },
    "leo-burnett": {
        "name": "Leo Burnett",
        "model": "openai/gpt-5.1",
        "soul_document": "souls/leo-burnett.md",
        "role": "participant",
        "temperature": 0.8,
        "max_tokens": 4000,
        "color": "#10B981",
    },
    "mary-wells-lawrence": {
        "name": "Mary Wells Lawrence",
        "model": "meta-llama/llama-4-maverick",
        "soul_document": "souls/mary-wells-lawrence.md",
        "role": "participant",
        "temperature": 0.75,
        "max_tokens": 4000,
        "color": "#EC4899",
    },
    "gary-halbert": {
        "name": "Gary Halbert",
        "model": "x-ai/grok-4",
        "soul_document": "souls/gary-halbert.md",
        "role": "participant",
        "temperature": 0.85,
        "max_tokens": 4000,
        "color": "#EF4444",
    },
}

# High-end models for moderator + evaluator (most critical roles)
# These two roles judge, eliminate, and assess craft — they need the strongest reasoning.
# Benchmark both Claude Opus 4.6 and GPT-5.2, then pick the best for each role.
# To switch: just change the "model" field below.
#   Option A: "anthropic/claude-opus-4-6"   — deepest reasoning, best synthesis
#   Option B: "openai/gpt-5.2"             — strong creative reasoning, fast
#   Option C: Hybrid (Jobs on one, Ive on the other for max cognitive diversity)

DEFAULT_MODERATOR = {
    "name": "Steve Jobs",
    "model": "anthropic/claude-opus-4-6",
    "soul_document": "souls/steve-jobs.md",
    "role": "moderator",
    "temperature": 0.6,
    "max_tokens": 4000,
    "color": "#6B7280",
}

DEFAULT_EVALUATOR = {
    "name": "Jony Ive",
    "model": "anthropic/claude-opus-4-6",
    "soul_document": "souls/jony-ive.md",
    "role": "evaluator",
    "temperature": 0.5,
    "max_tokens": 4000,
    "color": "#9CA3AF",
}
