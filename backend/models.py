"""Pydantic models for the Genesis Chamber simulation engine."""

from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any, Literal
from datetime import datetime


# --- Configuration Models ---

class ParticipantConfig(BaseModel):
    """Configuration for a single simulation participant."""
    display_name: str
    model: str  # OpenRouter model identifier
    soul_document: str  # Path to soul markdown file
    role: Literal["participant", "moderator", "evaluator", "devils_advocate"] = "participant"
    temperature: float = 0.7
    max_tokens: int = 2000
    thinking_mode: Literal["off", "thinking", "deep"] = "off"
    enable_web_search: bool = False
    speciality: str = ""
    color: str = "#666666"


class SimulationConfig(BaseModel):
    """Full configuration for a Genesis Chamber simulation."""
    name: str
    type: Literal["message_lab", "genesis_chamber", "assembly_line", "quick_test"] = "quick_test"
    rounds: int = 6
    stages_per_round: int = 5  # 3 for quick_test, 5 for full
    concepts_round_1: int = 3  # concepts per participant in round 1
    concepts_round_2_plus: int = 1  # concepts per participant in round 2+
    participants: Dict[str, ParticipantConfig]
    moderator: ParticipantConfig
    evaluator: Optional[ParticipantConfig] = None
    elimination_schedule: Dict[str, float] = {}  # "round_num" -> elimination_pct (JSON keys are strings)
    quality_gates: List[int] = []  # round numbers that pause for approval
    brief: str  # The project brief text
    brand_context: str = ""
    devils_advocate: Optional[ParticipantConfig] = None  # Advocatus Diaboli — optional adversarial critic
    da_aggression_level: Literal["analytical", "aggressive", "ruthless"] = "aggressive"
    da_attack_focus: List[str] = []  # empty = attack everything; options: brand_consistency, market_viability, creative_originality, technical_feasibility, audience_fit, budget_realism


# --- Concept Lifecycle Models ---

class ConceptVersion(BaseModel):
    """Snapshot of a concept at a specific round/stage before refinement."""
    round_num: int
    stage: str = ""  # "creation", "refinement"
    name: str = ""
    headline: str = ""
    tagline: str = ""
    idea: str = ""
    visual_direction: str = ""
    evolution_notes: str = ""
    score: Optional[float] = None
    timestamp: str = ""


class Concept(BaseModel):
    """A single creative concept produced by a participant."""
    id: str
    persona_id: str
    persona_name: str
    round_created: int
    name: str = "Untitled"
    tagline: str = ""
    idea: str = ""
    headline: str = ""
    subhead: str = ""
    body_copy: str = ""
    visual_direction: str = ""
    color_mood: str = ""
    typography_feel: str = ""
    rationale: str = ""
    image_prompt: str = ""
    video_prompt: str = ""
    evolution_notes: str = ""
    status: Literal["active", "eliminated", "merged", "winner", "runner_up"] = "active"
    scores: Dict[int, float] = {}  # round_num -> avg score
    raw_text: str = ""  # Full LLM output for fallback
    versions: List[ConceptVersion] = []  # Version history (snapshots before each refinement)
    previous_version_id: Optional[str] = None  # Links to prior version's concept ID


class Critique(BaseModel):
    """A critique of an anonymized concept by a participant."""
    critic_id: str
    critic_name: str
    concept_label: str  # "Concept A", "Concept B", etc.
    concept_id: str = ""  # Resolved after de-anonymization
    score: int = 5  # 1-10
    strengths: List[str] = []
    weaknesses: List[str] = []
    fatal_flaw: str = ""
    one_change: str = ""
    would_champion: str = ""
    raw_text: str = ""


class ModeratorDirection(BaseModel):
    """Moderator's synthesis and direction for the next round."""
    moderator_name: str
    round_num: int
    surviving_concepts: List[Dict[str, str]] = []  # [{id, name, reason}]
    eliminated_concepts: List[Dict[str, str]] = []  # [{id, name, reason}]
    merge_suggestions: List[Dict[str, str]] = []
    new_constraints: List[str] = []
    direction_notes: str = ""
    one_more_thing: str = ""
    raw_text: str = ""


class EvaluatorAssessment(BaseModel):
    """Evaluator's craft quality assessment."""
    evaluator_name: str
    round_num: int
    per_concept: List[Dict[str, Any]] = []  # [{concept_id, intentionality, consideration, ...}]
    overall: str = ""
    raw_text: str = ""


class DADefenseResult(BaseModel):
    """Result of a creative's defense against a Devil's Advocate challenge."""
    concept_id: str
    concept_name: str
    persona_id: str
    persona_name: str
    defense_text: str = ""
    da_challenge: Dict[str, Any] = {}  # The original DA critique data
    verdict: str = ""  # "defense accepted" or "defense insufficient"
    verdict_details: str = ""
    revised_score: Optional[int] = None


# --- Round & Stage Models ---

class StageResult(BaseModel):
    """Result of a single stage within a round."""
    stage_num: int
    stage_name: str  # "creation", "critique", "synthesis", "refinement", "presentation"
    status: Literal["pending", "running", "complete", "failed"] = "pending"
    outputs: Any = None  # Varies by stage type
    started_at: Optional[str] = None
    completed_at: Optional[str] = None


class RoundResult(BaseModel):
    """Result of a complete round."""
    round_num: int
    mode: str = ""  # "diverge", "converge", "deepen", "gladiator", "polish", "spec"
    status: Literal["pending", "running", "complete"] = "pending"
    stages: Dict[int, StageResult] = {}
    concepts_created: int = 0
    concepts_surviving: int = 0
    concepts_eliminated: int = 0


# --- DA Training Models ---

class DAInteraction(BaseModel):
    """A single DA interaction for review in DA Arena."""
    id: str
    simulation_id: str
    round_num: int
    concept_name: str
    concept_id: str = ""
    concept_persona: str
    # DA's attack
    da_score: int = 5
    da_fatal_flaw: str = ""
    da_weaknesses: List[str] = []
    da_strengths_conceded: List[str] = []
    da_one_change: str = ""
    # Defense (from DA Defense stage)
    defense_text: str = ""
    da_verdict: str = ""
    da_verdict_details: str = ""
    da_revised_score: Optional[int] = None
    # Creative response (from evolution notes)
    creative_response: str = ""
    response_addressed_flaw: bool = False
    # Human rating
    rating: Optional[str] = None  # "brilliant", "effective", "weak", "unfair"
    user_notes: str = ""
    reviewed: bool = False
    reviewed_at: Optional[str] = None


# --- Simulation State ---

class SimulationState(BaseModel):
    """Full simulation state — persisted after every stage for resume capability."""
    id: str
    config: SimulationConfig
    status: Literal["initialized", "running", "paused_at_gate", "completed", "failed"] = "initialized"
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    current_round: int = 0
    current_stage: int = 0
    current_stage_name: str = ""
    rounds: List[RoundResult] = []
    concepts: Dict[str, List[Concept]] = Field(
        default_factory=lambda: {"active": [], "eliminated": [], "merged": []}
    )
    quality_gates: List[Dict[str, Any]] = []
    transcript_entries: List[Dict[str, Any]] = []
    event_log: List[Dict[str, Any]] = []
    da_interactions: List[Dict[str, Any]] = []  # DA Arena interaction data
    da_ratings: Dict[str, Dict[str, Any]] = {}  # interaction_id -> rating data
    archived: bool = False


class QualityGate(BaseModel):
    """A quality gate checkpoint."""
    after_round: int
    status: Literal["pending", "approved", "redirected"] = "pending"
    notes: str = ""
    decided_at: Optional[str] = None


# --- API Request/Response Models ---

class StartSimulationRequest(BaseModel):
    """Request to start a new simulation."""
    config: SimulationConfig


class GateApprovalRequest(BaseModel):
    """Request to approve or redirect a quality gate."""
    decision: Literal["approved", "redirected"]
    notes: str = ""
