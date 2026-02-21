"""Configuration for the LLM Council and Genesis Chamber."""

import os
from dotenv import load_dotenv

load_dotenv()

# === ORIGINAL LLM-COUNCIL CONFIG (preserved) ===

# OpenRouter API key
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

# Council members - list of OpenRouter model identifiers
COUNCIL_MODELS = [
    "openai/gpt-5.2",
    "google/gemini-3-pro",
    "anthropic/claude-sonnet-4.6",
    "x-ai/grok-4",
]

# Chairman model - synthesizes final response
CHAIRMAN_MODEL = "google/gemini-3-pro"

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
UPLOADS_DIR = "output/uploads/"

# Database (Vercel Postgres / Neon — optional, falls back to file-based storage)
DATABASE_URL = os.getenv("DATABASE_URL", "")

# External API keys (for future media integration)
FAL_KEY = os.getenv("FAL_KEY", "")
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY", "")

# === TEAM / DIVISION STRUCTURE ===

TEAMS = {
    "leadership": {
        "name": "Leadership",
        "description": "Moderator and evaluator — direct, challenge, and assess",
        "color": "#6B7280",
    },
    "marketing": {
        "name": "Marketing & Strategy",
        "description": "Advertising legends — persuasion, positioning, brand strategy",
        "color": "#F59E0B",
    },
    "design": {
        "name": "Design & Visual",
        "description": "Design pioneers — visual identity, typography, interface",
        "color": "#8B5CF6",
    },
    "business": {
        "name": "Business & Strategy",
        "description": "Business titans — growth, value, disruption, category creation",
        "color": "#FF9900",
    },
    "custom": {
        "name": "Custom",
        "description": "User-uploaded soul documents",
        "color": "#666666",
    },
}

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

# Persona colors (from GENESIS-CHAMBER-BLUEPRINT.html + design team additions)
PERSONA_COLORS = {
    # Marketing & Strategy
    "david-ogilvy": "#F59E0B",
    "claude-hopkins": "#3B82F6",
    "leo-burnett": "#10B981",
    "mary-wells-lawrence": "#EC4899",
    "gary-halbert": "#EF4444",
    # Design & Visual
    "paul-rand": "#8B5CF6",
    "paula-scher": "#F97316",
    "saul-bass": "#DC2626",
    "susan-kare": "#06B6D4",
    "rob-janoff": "#A3E635",
    "tobias-van-schneider": "#D946EF",
    # Business & Strategy
    "elon-musk": "#1DA1F2",
    "jeff-bezos": "#FF9900",
    "warren-buffett": "#374151",
    "richard-branson": "#E11D48",
    "dietrich-mateschitz": "#1E40AF",
    # Leadership
    "steve-jobs": "#6B7280",
    "jony-ive": "#9CA3AF",
    # Devil's Advocate
    "devils-advocate": "#DC2626",
}

# Team membership — maps persona ID to primary team + optional cross-team roles
PERSONA_TEAMS = {
    # Marketing & Strategy
    "david-ogilvy": {"team": "marketing"},
    "claude-hopkins": {"team": "marketing"},
    "leo-burnett": {"team": "marketing"},
    "mary-wells-lawrence": {"team": "marketing"},
    "gary-halbert": {"team": "marketing"},
    # Design & Visual
    "paul-rand": {"team": "design"},
    "paula-scher": {"team": "design"},
    "saul-bass": {"team": "design"},
    "susan-kare": {"team": "design"},
    "rob-janoff": {"team": "design"},
    "tobias-van-schneider": {"team": "design"},
    # Business & Strategy
    "elon-musk": {"team": "business"},
    "jeff-bezos": {"team": "business"},
    "warren-buffett": {"team": "business"},
    "richard-branson": {"team": "business"},
    "dietrich-mateschitz": {"team": "business"},
    # Leadership (cross-functional)
    "steve-jobs": {"team": "leadership", "cross_teams": ["marketing"]},
    "jony-ive": {"team": "leadership", "cross_teams": ["design", "marketing"]},
    # Devil's Advocate (cross-functional)
    "devils-advocate": {"team": "leadership", "cross_teams": ["marketing", "design"]},
}

# Default participant configurations
DEFAULT_PARTICIPANTS = {
    # --- Marketing & Strategy Team ---
    "david-ogilvy": {
        "name": "David Ogilvy",
        "model": "google/gemini-3-pro",
        "soul_document": "souls/david-ogilvy.md",
        "role": "participant",
        "team": "marketing",
        "temperature": 0.7,
        "max_tokens": 4000,
        "color": "#F59E0B",
    },
    "claude-hopkins": {
        "name": "Claude Hopkins",
        "model": "anthropic/claude-sonnet-4.6",
        "soul_document": "souls/claude-hopkins.md",
        "role": "participant",
        "team": "marketing",
        "temperature": 0.6,
        "max_tokens": 4000,
        "color": "#3B82F6",
    },
    "leo-burnett": {
        "name": "Leo Burnett",
        "model": "openai/gpt-5.1",
        "soul_document": "souls/leo-burnett.md",
        "role": "participant",
        "team": "marketing",
        "temperature": 0.8,
        "max_tokens": 4000,
        "color": "#10B981",
    },
    "mary-wells-lawrence": {
        "name": "Mary Wells Lawrence",
        "model": "meta-llama/llama-4-maverick",
        "soul_document": "souls/mary-wells-lawrence.md",
        "role": "participant",
        "team": "marketing",
        "temperature": 0.75,
        "max_tokens": 4000,
        "color": "#EC4899",
    },
    "gary-halbert": {
        "name": "Gary Halbert",
        "model": "x-ai/grok-4",
        "soul_document": "souls/gary-halbert.md",
        "role": "participant",
        "team": "marketing",
        "temperature": 0.85,
        "max_tokens": 4000,
        "color": "#EF4444",
    },
    # --- Design & Visual Team ---
    "paul-rand": {
        "name": "Paul Rand",
        "model": "google/gemini-3-pro",
        "soul_document": "souls/paul-rand.md",
        "role": "participant",
        "team": "design",
        "temperature": 0.65,
        "max_tokens": 4000,
        "color": "#8B5CF6",
    },
    "paula-scher": {
        "name": "Paula Scher",
        "model": "openai/gpt-5.1",
        "soul_document": "souls/paula-scher.md",
        "role": "participant",
        "team": "design",
        "temperature": 0.8,
        "max_tokens": 4000,
        "color": "#F97316",
    },
    "saul-bass": {
        "name": "Saul Bass",
        "model": "anthropic/claude-sonnet-4.6",
        "soul_document": "souls/saul-bass.md",
        "role": "participant",
        "team": "design",
        "temperature": 0.7,
        "max_tokens": 4000,
        "color": "#DC2626",
    },
    "susan-kare": {
        "name": "Susan Kare",
        "model": "meta-llama/llama-4-maverick",
        "soul_document": "souls/susan-kare.md",
        "role": "participant",
        "team": "design",
        "temperature": 0.7,
        "max_tokens": 4000,
        "color": "#06B6D4",
    },
    "rob-janoff": {
        "name": "Rob Janoff",
        "model": "x-ai/grok-4",
        "soul_document": "souls/rob-janoff.md",
        "role": "participant",
        "team": "design",
        "temperature": 0.7,
        "max_tokens": 4000,
        "color": "#A3E635",
    },
    "tobias-van-schneider": {
        "name": "Tobias van Schneider",
        "model": "google/gemini-3-pro",
        "soul_document": "souls/tobias-van-schneider.md",
        "role": "participant",
        "team": "design",
        "temperature": 0.75,
        "max_tokens": 4000,
        "color": "#D946EF",
    },
    # --- Business & Strategy Team ---
    "elon-musk": {
        "name": "Elon Musk",
        "model": "x-ai/grok-4",
        "soul_document": "souls/elon-musk.md",
        "role": "participant",
        "team": "business",
        "temperature": 0.85,
        "max_tokens": 4000,
        "color": "#1DA1F2",
    },
    "jeff-bezos": {
        "name": "Jeff Bezos",
        "model": "anthropic/claude-sonnet-4.6",
        "soul_document": "souls/jeff-bezos.md",
        "role": "participant",
        "team": "business",
        "temperature": 0.7,
        "max_tokens": 4000,
        "color": "#FF9900",
    },
    "warren-buffett": {
        "name": "Warren Buffett",
        "model": "google/gemini-3-pro",
        "soul_document": "souls/warren-buffett.md",
        "role": "participant",
        "team": "business",
        "temperature": 0.65,
        "max_tokens": 4000,
        "color": "#374151",
    },
    "richard-branson": {
        "name": "Richard Branson",
        "model": "meta-llama/llama-4-maverick",
        "soul_document": "souls/richard-branson.md",
        "role": "participant",
        "team": "business",
        "temperature": 0.8,
        "max_tokens": 4000,
        "color": "#E11D48",
    },
    "dietrich-mateschitz": {
        "name": "Dietrich Mateschitz",
        "model": "deepseek/deepseek-v3.2",
        "soul_document": "souls/dietrich-mateschitz.md",
        "role": "participant",
        "team": "business",
        "temperature": 0.7,
        "max_tokens": 4000,
        "color": "#1E40AF",
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
    "team": "leadership",
    "cross_teams": ["marketing"],
    "dual_role": True,  # Can also participate as creative contributor
    "temperature": 0.6,
    "max_tokens": 4000,
    "color": "#6B7280",
}

DEFAULT_EVALUATOR = {
    "name": "Jony Ive",
    "model": "anthropic/claude-sonnet-4.6",
    "soul_document": "souls/jony-ive.md",
    "role": "evaluator",
    "team": "leadership",
    "cross_teams": ["design", "marketing"],
    "dual_role": True,  # Can also participate as creative contributor
    "temperature": 0.5,
    "max_tokens": 4000,
    "color": "#9CA3AF",
}

# Devil's Advocate — the Advocatus Diaboli (Promotor Fidei)
# Formally established by Pope Sixtus V in 1587 for the Catholic canonization process.
# Appointed to argue AGAINST, poke holes, and ensure only the strongest ideas survive.
# Embodies the Sanhedrin principle: unanimous agreement = suspect process.
# OPTIONAL — activated per simulation via the devils_advocate toggle.
DEFAULT_DEVILS_ADVOCATE = {
    "name": "Advocatus Diaboli",
    "model": "x-ai/grok-4",
    "soul_document": "souls/devils-advocate.md",
    "role": "devils_advocate",
    "team": "leadership",
    "cross_teams": ["marketing", "design"],
    "temperature": 0.75,
    "max_tokens": 4000,
    "color": "#DC2626",
}
