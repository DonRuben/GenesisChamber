"""Output Engine — generates deliverables from simulation state."""

import json
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, List

from .models import SimulationState
from .config import SIMULATION_OUTPUT_DIR, PERSONA_COLORS


class OutputEngine:
    """Generates transcript HTML, presentations, and prompt files from simulation state."""

    def __init__(self, output_dir: str = SIMULATION_OUTPUT_DIR):
        self.output_dir = Path(output_dir)

    def generate_all(self, state: SimulationState) -> Dict[str, str]:
        """Generate all output files and return paths."""
        sim_dir = self.output_dir / state.id
        sim_dir.mkdir(parents=True, exist_ok=True)

        paths = {}
        paths["transcript"] = str(self.generate_transcript_html(state, sim_dir))
        paths["image_prompts"] = str(self.generate_image_prompts(state, sim_dir))
        paths["summary"] = str(self.generate_summary(state, sim_dir))
        return paths

    def generate_transcript_html(self, state: SimulationState, sim_dir: Path) -> Path:
        """Generate interactive HTML transcript."""
        path = sim_dir / "transcript.html"

        # Build HTML
        entries_html = ""
        for entry in state.transcript_entries:
            stage_color = {
                "creation": "#10B981", "critique": "#F59E0B",
                "synthesis": "#00D9C4", "refinement": "#3B82F6",
                "presentation": "#8B5CF6",
            }.get(entry.get("stage_name", ""), "#666")

            entries_html += f"""
            <div class="entry" style="border-left-color: {stage_color}">
                <div class="entry-header">
                    <span class="stage" style="color: {stage_color}">
                        Round {entry.get('round', '?')} — {entry.get('stage_name', '?')}
                    </span>
                    <span class="time">{entry.get('timestamp', '')}</span>
                </div>"""

            if entry.get("concepts"):
                for c in entry["concepts"]:
                    entries_html += f'<div class="concept-entry"><strong>{c.get("persona", "?")}:</strong> {c.get("name", "")} — {c.get("idea", "")}</div>'

            if entry.get("critiques_count"):
                entries_html += f'<div class="detail">{entry["critiques_count"]} critiques submitted</div>'

            if entry.get("direction"):
                entries_html += f'<div class="detail">{entry["direction"]}</div>'

            entries_html += "</div>"

        # Concepts section
        concepts_html = ""
        for status_group in ["active", "eliminated", "merged"]:
            concepts = state.concepts.get(status_group, [])
            if not concepts:
                continue
            concepts_html += f'<h2>{status_group.title()} Concepts ({len(concepts)})</h2>'
            for c in concepts:
                color = PERSONA_COLORS.get(c.persona_id, "#666")
                concepts_html += f"""
                <div class="concept-card" style="border-left: 4px solid {color}">
                    <h3>{c.name} <span class="badge {c.status}">{c.status}</span></h3>
                    <div class="persona" style="color: {color}">{c.persona_name}</div>
                    <p class="tagline">{c.tagline}</p>
                    <p>{c.idea}</p>
                    {f'<div class="headline">{c.headline}</div>' if c.headline else ''}
                    {f'<p class="rationale">{c.rationale}</p>' if c.rationale else ''}
                </div>"""

        html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>{state.config.name} — Transcript</title>
<style>
:root {{ --void: #0A0E17; --surface: #111827; --teal: #00D9C4; --text: #E5E7EB; --text-dim: #9CA3AF; --border: rgba(255,255,255,0.08); }}
* {{ margin:0; padding:0; box-sizing:border-box; }}
body {{ background:var(--void); color:var(--text); font-family:'Inter',-apple-system,sans-serif; line-height:1.7; padding:40px 24px; max-width:900px; margin:0 auto; }}
h1 {{ font-size:32px; font-weight:800; margin-bottom:8px; }}
h1 span {{ color:var(--teal); }}
h2 {{ font-size:20px; color:var(--teal); margin:32px 0 16px; padding-bottom:8px; border-bottom:1px solid var(--border); }}
.meta {{ color:var(--text-dim); margin-bottom:32px; }}
.entry {{ padding:12px 16px; border-left:3px solid var(--border); margin-bottom:8px; background:var(--surface); border-radius:0 8px 8px 0; }}
.entry-header {{ display:flex; justify-content:space-between; margin-bottom:6px; }}
.stage {{ font-weight:600; text-transform:uppercase; font-size:12px; letter-spacing:0.5px; }}
.time {{ font-size:11px; color:var(--text-dim); font-family:monospace; }}
.detail {{ font-size:13px; color:var(--text-dim); }}
.concept-entry {{ font-size:13px; margin:4px 0; }}
.concept-card {{ background:var(--surface); border-radius:0 12px 12px 0; padding:16px 20px; margin-bottom:12px; }}
.concept-card h3 {{ font-size:16px; margin-bottom:4px; }}
.persona {{ font-size:12px; margin-bottom:8px; }}
.tagline {{ font-style:italic; color:var(--text-dim); margin-bottom:8px; }}
.headline {{ font-size:18px; font-weight:700; color:var(--teal); margin:8px 0; }}
.rationale {{ font-size:13px; color:var(--text-dim); }}
.badge {{ display:inline-block; padding:2px 8px; border-radius:12px; font-size:10px; font-weight:600; text-transform:uppercase; margin-left:8px; }}
.badge.active {{ background:rgba(16,185,129,0.15); color:#10B981; }}
.badge.winner {{ background:rgba(245,158,11,0.15); color:#F59E0B; }}
.badge.eliminated {{ background:rgba(239,68,68,0.15); color:#EF4444; }}
.badge.runner_up {{ background:rgba(59,130,246,0.15); color:#3B82F6; }}
</style>
</head>
<body>
<h1>Genesis <span>Chamber</span> Transcript</h1>
<div class="meta">{state.config.name} | {state.config.type} | {len(state.rounds)} rounds | Generated {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}</div>

<h2>Timeline</h2>
{entries_html}

{concepts_html}

</body>
</html>"""

        path.write_text(html, encoding="utf-8")
        return path

    def generate_image_prompts(self, state: SimulationState, sim_dir: Path) -> Path:
        """Extract all image prompts from concepts."""
        path = sim_dir / "image_prompts.json"

        prompts = []
        for group in ["active", "eliminated"]:
            for concept in state.concepts.get(group, []):
                if concept.image_prompt:
                    prompts.append({
                        "concept_name": concept.name,
                        "persona": concept.persona_name,
                        "status": concept.status,
                        "prompt": concept.image_prompt,
                    })

        path.write_text(json.dumps(prompts, indent=2), encoding="utf-8")
        return path

    def generate_summary(self, state: SimulationState, sim_dir: Path) -> Path:
        """Generate a JSON summary of the simulation."""
        path = sim_dir / "summary.json"

        active = state.concepts.get("active", [])
        winner = next((c for c in active if c.status == "winner"), None)

        summary = {
            "id": state.id,
            "name": state.config.name,
            "type": state.config.type,
            "status": state.status,
            "rounds_completed": len(state.rounds),
            "total_rounds": state.config.rounds,
            "participants": list(state.config.participants.keys()),
            "moderator": state.config.moderator.display_name,
            "concepts_active": len([c for c in active if c.status in ("active", "winner", "runner_up")]),
            "concepts_eliminated": len(state.concepts.get("eliminated", [])),
            "winner": {
                "name": winner.name,
                "persona": winner.persona_name,
                "headline": winner.headline,
                "idea": winner.idea,
            } if winner else None,
            "event_count": len(state.event_log),
            "created_at": state.created_at,
        }

        path.write_text(json.dumps(summary, indent=2), encoding="utf-8")
        return path
