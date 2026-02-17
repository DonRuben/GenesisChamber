"""Output Engine — generates deliverables from simulation state."""

import html
import json
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, List

from .models import SimulationState
from .config import SIMULATION_OUTPUT_DIR, PERSONA_COLORS


# Genesis Chamber reveal.js theme (inline CSS)
GENESIS_REVEAL_THEME = """
.reveal { font-family: 'Inter', -apple-system, sans-serif; color: #E5E7EB; }
.reveal .slides section { background: #0A0E17; padding: 40px 60px; text-align: left; }
.reveal h1 { color: #00D9C4; font-weight: 800; font-size: 2.2em; margin-bottom: 16px; }
.reveal h2 { color: #00D9C4; font-weight: 700; font-size: 1.6em; margin-bottom: 12px; }
.reveal h3 { color: #F59E0B; font-weight: 600; font-size: 1.2em; margin-bottom: 8px; }
.reveal p { color: #E5E7EB; line-height: 1.7; font-size: 0.85em; }
.reveal .dim { color: #9CA3AF; font-size: 0.75em; }
.reveal .teal { color: #00D9C4; }
.reveal .gold { color: #F59E0B; }
.gc-card { background: #111827; border-radius: 12px; padding: 24px; margin: 12px 0; border: 1px solid rgba(255,255,255,0.08); }
.gc-card-left { border-left: 4px solid #00D9C4; }
.gc-roster { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; margin-top: 20px; }
.gc-persona { background: #111827; border-radius: 12px; padding: 16px; border-left: 4px solid #666; }
.gc-persona .name { font-weight: 700; font-size: 1em; margin-bottom: 4px; }
.gc-persona .role { font-size: 0.7em; color: #9CA3AF; text-transform: uppercase; letter-spacing: 0.5px; }
.gc-persona .model { font-size: 0.65em; color: #6B7280; font-family: 'JetBrains Mono', monospace; }
.gc-concepts { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; margin-top: 16px; }
.gc-concept { background: #111827; border-radius: 12px; padding: 20px; border-left: 4px solid #666; }
.gc-concept .cname { font-weight: 700; font-size: 1em; margin-bottom: 4px; }
.gc-concept .tagline { font-style: italic; color: #9CA3AF; font-size: 0.8em; margin-bottom: 8px; }
.gc-concept .idea { font-size: 0.8em; line-height: 1.6; }
.gc-badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 0.6em; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-left: 8px; }
.gc-badge-winner { background: rgba(245,158,11,0.15); color: #F59E0B; }
.gc-badge-eliminated { background: rgba(239,68,68,0.15); color: #EF4444; }
.gc-badge-active { background: rgba(16,185,129,0.15); color: #10B981; }
.gc-badge-runner { background: rgba(59,130,246,0.15); color: #3B82F6; }
.gc-direction { background: #111827; border-left: 4px solid #F59E0B; border-radius: 0 12px 12px 0; padding: 20px 24px; margin: 16px 0; }
.gc-surviving { color: #10B981; }
.gc-eliminated { color: #EF4444; text-decoration: line-through; }
.gc-winner-card { background: linear-gradient(135deg, #111827 0%, #1a2332 100%); border: 2px solid #F59E0B; border-radius: 16px; padding: 32px; margin: 20px 0; }
.gc-winner-card .headline { font-size: 1.4em; font-weight: 800; color: #00D9C4; margin: 12px 0; }
.gc-gallery { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; margin-top: 16px; }
.gc-gallery-item { background: #111827; border-radius: 12px; padding: 16px; font-size: 0.8em; }
.gc-gallery-item .prompt { color: #9CA3AF; font-family: 'JetBrains Mono', monospace; font-size: 0.85em; line-height: 1.5; }
"""

REVEAL_TEMPLATE = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{title} — Genesis Chamber Presentation</title>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@5.2.1/dist/reset.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@5.2.1/dist/reveal.css">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap">
<style>
{theme_css}
</style>
</head>
<body>
<div class="reveal">
<div class="slides">
{slides_html}
</div>
</div>
<script src="https://cdn.jsdelivr.net/npm/reveal.js@5.2.1/dist/reveal.js"></script>
<script>
Reveal.initialize({{
  hash: true,
  transition: 'fade',
  backgroundTransition: 'fade',
  width: 1920,
  height: 1080,
  margin: 0.04,
  center: false,
}});
</script>
</body>
</html>"""


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
        paths["presentation"] = str(self.generate_reveal_presentation(state))
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

    # === REVEAL.JS PRESENTATION GENERATOR ===

    @staticmethod
    def _esc(text: str) -> str:
        """HTML-escape text for safe embedding in presentation."""
        if not text:
            return ""
        return html.escape(str(text))

    def generate_reveal_presentation(self, state: SimulationState) -> Path:
        """Generate a reveal.js HTML presentation from simulation state."""
        sim_dir = self.output_dir / state.id
        sim_dir.mkdir(parents=True, exist_ok=True)
        path = sim_dir / "presentation.html"

        slides = []
        slides.append(self._slide_title(state))
        slides.append(self._slide_roster(state))

        for round_result in state.rounds:
            slides.append(self._slide_round(state, round_result))

        slides.append(self._slide_winner(state))
        slides.append(self._slide_image_gallery(state))
        slides.append(self._slide_credits(state))

        slides_html = "\n".join(slides)
        presentation_html = REVEAL_TEMPLATE.format(
            title=self._esc(state.config.name),
            theme_css=GENESIS_REVEAL_THEME,
            slides_html=slides_html,
        )

        path.write_text(presentation_html, encoding="utf-8")
        return path

    def _slide_title(self, state: SimulationState) -> str:
        """Title slide with simulation name and metadata."""
        participant_names = []
        for pid, p in state.config.participants.items():
            color = PERSONA_COLORS.get(pid, "#666")
            participant_names.append(
                f'<span style="color:{color}">{self._esc(p.display_name)}</span>'
            )
        roster_line = " &middot; ".join(participant_names)
        mod_name = self._esc(state.config.moderator.display_name)
        sim_type = self._esc(state.config.type)
        rounds = state.config.rounds
        ts = datetime.utcnow().strftime("%Y-%m-%d")

        return f"""<section>
<h1>Genesis <span class="teal">Chamber</span></h1>
<h2 style="margin-top:16px;font-size:1.3em;color:#E5E7EB;font-weight:400;">{self._esc(state.config.name)}</h2>
<p class="dim" style="margin-top:24px;">{sim_type} &middot; {rounds} rounds &middot; {ts}</p>
<p style="margin-top:16px;font-size:0.85em;">Moderated by <span class="gold">{mod_name}</span></p>
<p style="margin-top:8px;font-size:0.8em;">{roster_line}</p>
</section>"""

    def _slide_roster(self, state: SimulationState) -> str:
        """Participant roster slide."""
        cards = ""
        # Moderator first
        mod = state.config.moderator
        mod_color = PERSONA_COLORS.get("steve-jobs", "#6B7280")
        cards += f"""<div class="gc-persona" style="border-left-color:{mod_color}">
<div class="name" style="color:{mod_color}">{self._esc(mod.display_name)}</div>
<div class="role">Moderator</div>
<div class="model">{self._esc(mod.model)}</div>
</div>"""

        # Evaluator
        if state.config.evaluator:
            ev = state.config.evaluator
            ev_color = PERSONA_COLORS.get("jony-ive", "#9CA3AF")
            cards += f"""<div class="gc-persona" style="border-left-color:{ev_color}">
<div class="name" style="color:{ev_color}">{self._esc(ev.display_name)}</div>
<div class="role">Evaluator</div>
<div class="model">{self._esc(ev.model)}</div>
</div>"""

        # Participants
        for pid, p in state.config.participants.items():
            color = PERSONA_COLORS.get(pid, "#666")
            cards += f"""<div class="gc-persona" style="border-left-color:{color}">
<div class="name" style="color:{color}">{self._esc(p.display_name)}</div>
<div class="role">Participant</div>
<div class="model">{self._esc(p.model)}</div>
</div>"""

        return f"""<section>
<h2>Participant Roster</h2>
<div class="gc-roster">{cards}</div>
</section>"""

    def _slide_round(self, state: SimulationState, round_result) -> str:
        """Vertical slide stack for one round: overview, concepts, direction."""
        rnum = round_result.round_num
        mode = round_result.mode or "unknown"
        stage_count = len(round_result.stages)

        # Concepts sub-slide
        concept_cards = ""
        active = state.concepts.get("active", [])
        eliminated = state.concepts.get("eliminated", [])
        all_concepts = active + eliminated
        round_concepts = [c for c in all_concepts if c.round_created == rnum]

        for c in round_concepts:
            color = PERSONA_COLORS.get(c.persona_id, "#666")
            badge_class = f"gc-badge-{c.status}" if c.status in ("winner", "eliminated", "active") else "gc-badge-active"
            score_display = ""
            if c.scores:
                latest_score = list(c.scores.values())[-1] if isinstance(c.scores, dict) else ""
                if latest_score:
                    score_display = f'<span class="gc-badge gc-badge-active">{latest_score}/10</span>'

            concept_cards += f"""<div class="gc-concept" style="border-left-color:{color}">
<div class="cname">{self._esc(c.name)} <span class="gc-badge {badge_class}">{self._esc(c.status)}</span> {score_display}</div>
<div style="color:{color};font-size:0.7em;margin-bottom:4px;">{self._esc(c.persona_name)}</div>
<div class="tagline">{self._esc(c.tagline)}</div>
<div class="idea">{self._esc(c.idea)}</div>
</div>"""

        # Direction sub-slide (from synthesis stage)
        direction_html = ""
        for stage in round_result.stages.values():
            if stage.stage_name == "synthesis" and stage.outputs:
                outputs = stage.outputs
                if isinstance(outputs, dict):
                    surviving = outputs.get("surviving_concepts", [])
                    elim = outputs.get("eliminated_concepts", [])
                    direction_notes = outputs.get("direction", "") or outputs.get("direction_notes", "")
                    one_more = outputs.get("one_more_thing", "")

                    surv_html = "".join(
                        f'<div class="gc-surviving">&#10003; {self._esc(str(s))}</div>' for s in surviving
                    )
                    elim_html = "".join(
                        f'<div class="gc-eliminated">&#10007; {self._esc(str(e))}</div>' for e in elim
                    )
                    direction_html = f"""<section>
<h3>Round {rnum} — Moderator Direction</h3>
<div class="gc-direction">
{surv_html}
{elim_html}
{f'<p style="margin-top:12px;font-size:0.85em;">{self._esc(str(direction_notes))}</p>' if direction_notes else ''}
{f'<p style="margin-top:12px;color:#00D9C4;font-weight:600;">"One more thing..." {self._esc(str(one_more))}</p>' if one_more and one_more != "NONE" else ''}
</div>
</section>"""

        # Build vertical stack
        sections = f"""<section>
<h2>Round {rnum} <span class="dim" style="font-size:0.6em;">{self._esc(mode.upper())}</span></h2>
<p class="dim">{stage_count} stages completed &middot; {len(round_concepts)} concepts created</p>
</section>"""

        if concept_cards:
            sections += f"""<section>
<h3>Round {rnum} — Concepts</h3>
<div class="gc-concepts">{concept_cards}</div>
</section>"""

        if direction_html:
            sections += direction_html

        return f"<section>{sections}</section>"

    def _slide_winner(self, state: SimulationState) -> str:
        """Winner reveal slide."""
        active = state.concepts.get("active", [])
        winner = next((c for c in active if c.status == "winner"), None)
        runner = next((c for c in active if c.status == "runner_up"), None)

        if not winner:
            # No winner yet — show top active concept
            if active:
                winner = active[0]
            else:
                return '<section><h2>Results Pending</h2><p class="dim">Simulation not yet complete</p></section>'

        color = PERSONA_COLORS.get(winner.persona_id, "#00D9C4")
        headline = self._esc(winner.headline) if winner.headline else self._esc(winner.name)

        runner_html = ""
        if runner:
            r_color = PERSONA_COLORS.get(runner.persona_id, "#3B82F6")
            runner_html = f"""<div class="gc-card" style="border-left:4px solid {r_color};margin-top:24px;">
<h3>Runner-Up: {self._esc(runner.name)}</h3>
<p style="color:{r_color};font-size:0.8em;">{self._esc(runner.persona_name)}</p>
<p style="font-size:0.85em;">{self._esc(runner.idea)}</p>
</div>"""

        return f"""<section>
<h2>The Winner</h2>
<div class="gc-winner-card">
<div style="color:{color};font-size:0.8em;font-weight:600;">{self._esc(winner.persona_name)}</div>
<div class="headline">{headline}</div>
<p style="font-size:0.9em;margin-top:8px;">{self._esc(winner.tagline)}</p>
<p style="margin-top:16px;">{self._esc(winner.idea)}</p>
{f'<p style="margin-top:12px;font-size:0.85em;color:#9CA3AF;">{self._esc(winner.rationale)}</p>' if winner.rationale else ''}
</div>
{runner_html}
</section>"""

    def _slide_image_gallery(self, state: SimulationState) -> str:
        """Image prompt gallery slide."""
        prompts = []
        for group in ["active", "eliminated"]:
            for c in state.concepts.get(group, []):
                if c.image_prompt:
                    color = PERSONA_COLORS.get(c.persona_id, "#666")
                    prompts.append((c.name, c.persona_name, c.image_prompt, color))

        if not prompts:
            return ""

        items = ""
        for name, persona, prompt, color in prompts:
            items += f"""<div class="gc-gallery-item" style="border-left:3px solid {color}">
<div style="font-weight:600;margin-bottom:4px;">{self._esc(name)}</div>
<div style="color:{color};font-size:0.7em;margin-bottom:8px;">{self._esc(persona)}</div>
<div class="prompt">{self._esc(prompt)}</div>
</div>"""

        return f"""<section>
<h2>Visual Concepts</h2>
<p class="dim">Image generation prompts from simulation concepts</p>
<div class="gc-gallery">{items}</div>
</section>"""

    def _slide_credits(self, state: SimulationState) -> str:
        """Credits/footer slide."""
        rounds = len(state.rounds)
        total_concepts = len(state.concepts.get("active", [])) + len(state.concepts.get("eliminated", []))
        ts = datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC")

        return f"""<section>
<h1>Genesis <span class="teal">Chamber</span></h1>
<p style="margin-top:24px;font-size:0.9em;">{self._esc(state.config.name)}</p>
<p class="dim" style="margin-top:16px;">{rounds} rounds &middot; {total_concepts} concepts evaluated &middot; Generated {ts}</p>
<p class="dim" style="margin-top:32px;">Multi-persona AI creative simulation engine</p>
</section>"""
