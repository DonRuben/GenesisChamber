"""Devil's Advocate Training System — extracts, stores, and learns from DA interactions."""

from datetime import datetime
from typing import Dict, List, Optional
from uuid import uuid4

from .models import DAInteraction, SimulationState


def extract_da_interactions(state: SimulationState) -> List[DAInteraction]:
    """Extract all DA interactions from a completed simulation.

    Pulls data from:
    1. Critique transcript entries (DA's attack)
    2. DA Defense transcript entries (defense + verdict)
    3. Concept evolution notes (creative response in subsequent rounds)
    """
    interactions = []
    all_concepts = state.concepts.get("active", []) + state.concepts.get("eliminated", [])

    # Index DA defense results by concept_id for fast lookup
    defense_by_concept: Dict[int, Dict[str, list]] = {}  # round_num -> {concept_id -> defense_data}
    for entry in state.transcript_entries:
        if entry.get("da_defenses"):
            rnum = entry.get("round", 0)
            if rnum not in defense_by_concept:
                defense_by_concept[rnum] = {}
            for d in entry["da_defenses"]:
                defense_by_concept[rnum][d.get("concept_id", "")] = d

    for entry in state.transcript_entries:
        if not entry.get("critiques"):
            continue

        round_num = entry.get("round", 0)
        da_crits = [c for c in entry["critiques"] if c.get("is_devils_advocate")]

        for crit in da_crits:
            concept_id = crit.get("concept_id", "")
            concept = next((c for c in all_concepts if c.id == concept_id), None)

            # Find DA Defense data for this concept in this round
            defense_data = defense_by_concept.get(round_num, {}).get(concept_id, {})

            # Find creative's response in evolution notes
            creative_response = ""
            response_addressed = False
            if concept and concept.evolution_notes:
                evo = concept.evolution_notes
                da_keywords = ["devil", "advocate", "advocat", "diaboli", "DA's", "adversar",
                               "defense", "defend", "verdict"]
                if any(kw.lower() in evo.lower() for kw in da_keywords):
                    creative_response = evo
                    response_addressed = True

            interaction = DAInteraction(
                id=str(uuid4())[:8],
                simulation_id=state.id,
                round_num=round_num,
                concept_name=concept.name if concept else crit.get("concept_label", "?"),
                concept_id=concept_id,
                concept_persona=concept.persona_name if concept else "Unknown",
                da_score=crit.get("score", 5),
                da_fatal_flaw=crit.get("fatal_flaw", ""),
                da_weaknesses=crit.get("weaknesses", []),
                da_strengths_conceded=crit.get("strengths", []),
                da_one_change=crit.get("one_change", ""),
                # DA Defense data
                defense_text=defense_data.get("defense_text", ""),
                da_verdict=defense_data.get("verdict", ""),
                da_verdict_details=defense_data.get("verdict_details", ""),
                da_revised_score=defense_data.get("revised_score"),
                # Creative response
                creative_response=creative_response,
                response_addressed_flaw=response_addressed,
            )
            interactions.append(interaction)

    return interactions


def save_interactions_to_state(state: SimulationState,
                                interactions: List[DAInteraction]) -> None:
    """Save DA interactions into the simulation state."""
    state.da_interactions = [i.dict() for i in interactions]


def load_interactions_from_state(state: SimulationState) -> List[DAInteraction]:
    """Load DA interactions from simulation state."""
    return [DAInteraction(**d) for d in state.da_interactions]


def save_rating(state: SimulationState, interaction_id: str,
                rating: str, notes: str = "") -> bool:
    """Save user rating for a DA interaction. Returns True if found."""
    # Update in da_interactions list
    for item in state.da_interactions:
        if item.get("id") == interaction_id:
            item["rating"] = rating
            item["user_notes"] = notes
            item["reviewed"] = True
            item["reviewed_at"] = datetime.utcnow().isoformat()
            # Also store in da_ratings dict for quick lookup
            state.da_ratings[interaction_id] = {
                "rating": rating,
                "notes": notes,
                "reviewed_at": datetime.utcnow().isoformat(),
            }
            return True
    return False


def generate_training_report(state: SimulationState) -> Dict:
    """Generate aggregated training data from reviewed interactions."""
    interactions = load_interactions_from_state(state)
    reviewed = [i for i in interactions if i.reviewed]

    report = {
        "simulation_id": state.id,
        "total_interactions": len(interactions),
        "reviewed_interactions": len(reviewed),
        "effectiveness_score": 0.0,
        "response_rate": 0.0,
        "brilliant_patterns": [],
        "effective_patterns": [],
        "weak_patterns": [],
        "unfair_patterns": [],
        "score_distribution": {},
        "verdict_stats": {"accepted": 0, "insufficient": 0, "none": 0},
    }

    if not reviewed:
        return report

    # Categorize by rating
    for i in reviewed:
        summary = f"R{i.round_num} on '{i.concept_name}' ({i.concept_persona})"
        if i.da_fatal_flaw:
            summary += f" — Fatal: {i.da_fatal_flaw[:80]}"
        if i.da_one_change:
            summary += f" — Demanded: {i.da_one_change[:80]}"
        if i.da_verdict:
            summary += f" — Verdict: {i.da_verdict}"

        if i.rating == "brilliant":
            report["brilliant_patterns"].append(summary)
        elif i.rating == "effective":
            report["effective_patterns"].append(summary)
        elif i.rating == "weak":
            report["weak_patterns"].append(summary)
        elif i.rating == "unfair":
            report["unfair_patterns"].append(summary)

    # Stats
    addressed = sum(1 for i in reviewed if i.response_addressed_flaw)
    report["response_rate"] = addressed / len(reviewed)

    effective = sum(1 for i in reviewed if i.rating in ("effective", "brilliant"))
    report["effectiveness_score"] = effective / len(reviewed)

    # Score distribution
    for i in interactions:
        score = str(i.da_score)
        report["score_distribution"][score] = report["score_distribution"].get(score, 0) + 1

    # Verdict stats
    for i in interactions:
        if not i.da_verdict:
            report["verdict_stats"]["none"] += 1
        elif "accepted" in i.da_verdict.lower():
            report["verdict_stats"]["accepted"] += 1
        else:
            report["verdict_stats"]["insufficient"] += 1

    return report


def generate_refinement_suggestions(state: SimulationState) -> str:
    """Generate human-readable suggestions for manually refining the DA soul document."""
    report = generate_training_report(state)

    if report["reviewed_interactions"] < 3:
        return "Need at least 3 reviewed interactions to generate suggestions."

    lines = [
        f"# DA Soul Refinement Suggestions",
        f"Based on {report['reviewed_interactions']} reviewed interactions "
        f"(effectiveness: {report['effectiveness_score']:.0%})",
        "",
    ]

    if report["brilliant_patterns"]:
        lines.append("## Do MORE of this (Brilliant moments):")
        for p in report["brilliant_patterns"]:
            lines.append(f"- {p}")
        lines.append("")

    if report["effective_patterns"]:
        lines.append("## Keep doing this (Effective challenges):")
        for p in report["effective_patterns"]:
            lines.append(f"- {p}")
        lines.append("")

    if report["weak_patterns"]:
        lines.append("## Improve these (Weak challenges):")
        for p in report["weak_patterns"]:
            lines.append(f"- {p}")
        lines.append("")
        lines.append("**Suggestion:** Add more specific methodology for identifying flaws "
                      "in these areas. The DA should cite concrete evidence.")
        lines.append("")

    if report["unfair_patterns"]:
        lines.append("## Add guardrails here (Unfair/off-target):")
        for p in report["unfair_patterns"]:
            lines.append(f"- {p}")
        lines.append("")
        lines.append("**Suggestion:** Add calibration instructions to prevent the DA from "
                      "being destructive rather than constructive in these scenarios.")
        lines.append("")

    # Verdict analysis
    vs = report["verdict_stats"]
    if vs["accepted"] + vs["insufficient"] > 0:
        total_verdicts = vs["accepted"] + vs["insufficient"]
        accept_rate = vs["accepted"] / total_verdicts
        lines.append(f"## DA Defense Verdict Analysis")
        lines.append(f"- Defenses accepted: {vs['accepted']}/{total_verdicts} ({accept_rate:.0%})")
        lines.append(f"- Defenses insufficient: {vs['insufficient']}/{total_verdicts}")
        if accept_rate > 0.8:
            lines.append("**Note:** High acceptance rate suggests the DA's challenges are "
                          "being successfully countered. Consider making challenges more specific.")
        elif accept_rate < 0.3:
            lines.append("**Note:** Low acceptance rate suggests the DA is finding real flaws. "
                          "This is good adversarial performance.")
        lines.append("")

    return "\n".join(lines)
