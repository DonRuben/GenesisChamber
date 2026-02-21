"""Output Engine — generates deliverables from simulation state."""

import html
import json
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, List

from .models import SimulationState
from .config import SIMULATION_OUTPUT_DIR, PERSONA_COLORS


# Genesis Chamber reveal.js theme — aligned with frontend/src/design-tokens.css
GENESIS_REVEAL_THEME = """
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Playfair+Display:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
.reveal { font-family: 'Inter', system-ui, sans-serif; color: #E9E7E4; }
.reveal .slides section { background: #1B1D22; padding: 40px 60px; text-align: left; }
.reveal h1 { color: #00D9FF; font-weight: 800; font-size: 2.2em; margin-bottom: 16px; }
.reveal h2 { color: #00D9FF; font-weight: 700; font-size: 1.6em; margin-bottom: 12px; }
.reveal h3 { color: #FFB800; font-weight: 600; font-size: 1.2em; margin-bottom: 8px; }
.reveal p { color: #E9E7E4; line-height: 1.7; font-size: 0.85em; }
.reveal .dim { color: #7A7880; font-size: 0.75em; }
.reveal .cyan { color: #00D9FF; }
.reveal .gold { color: #FFB800; }
.reveal .flame { color: #F27123; }
.gc-card { background: #22252B; border-radius: 12px; padding: 24px; margin: 12px 0; border: 1px solid rgba(233,231,228,0.06); }
.gc-card-left { border-left: 4px solid #00D9FF; }
.gc-roster { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; margin-top: 21px; }
.gc-persona { background: #22252B; border-radius: 12px; padding: 16px; border-left: 4px solid #69676C; }
.gc-persona .name { font-weight: 700; font-size: 1em; margin-bottom: 4px; }
.gc-persona .role { font-size: 0.7em; color: #7A7880; text-transform: uppercase; letter-spacing: 0.5px; }
.gc-persona .model { font-size: 0.65em; color: #69676C; font-family: 'JetBrains Mono', 'Fira Code', monospace; }
.gc-concepts { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; margin-top: 16px; }
.gc-concept { background: #22252B; border-radius: 12px; padding: 21px; border-left: 4px solid #69676C; }
.gc-concept .cname { font-weight: 700; font-size: 1em; margin-bottom: 4px; }
.gc-concept .tagline { font-style: italic; color: #7A7880; font-size: 0.8em; margin-bottom: 8px; }
.gc-concept .idea { font-size: 0.8em; line-height: 1.6; }
.gc-badge { display: inline-block; padding: 3px 10px; border-radius: 9999px; font-size: 0.6em; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-left: 8px; }
.gc-badge-winner { background: rgba(255,184,0,0.12); color: #FFB800; }
.gc-badge-eliminated { background: rgba(239,68,68,0.12); color: #EF4444; }
.gc-badge-active { background: rgba(16,185,129,0.12); color: #10B981; }
.gc-badge-runner { background: rgba(59,130,246,0.12); color: #3B82F6; }
.gc-badge-da { background: rgba(220,38,38,0.12); color: #DC2626; }
.gc-direction { background: #22252B; border-left: 4px solid #FFB800; border-radius: 0 12px 12px 0; padding: 21px 24px; margin: 16px 0; }
.gc-surviving { color: #10B981; }
.gc-eliminated { color: #EF4444; text-decoration: line-through; }
.gc-winner-card { background: linear-gradient(135deg, #22252B 0%, #2A2D34 100%); border: 2px solid #FFB800; border-radius: 16px; padding: 34px; margin: 21px 0; box-shadow: 0 0 20px rgba(255,184,0,0.15); }
.gc-winner-card .headline { font-size: 1.4em; font-weight: 800; color: #00D9FF; margin: 12px 0; }
.gc-gallery { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; margin-top: 16px; }
.gc-gallery-item { background: #22252B; border-radius: 12px; padding: 16px; font-size: 0.8em; }
.gc-gallery-item .prompt { color: #7A7880; font-family: 'JetBrains Mono', 'Fira Code', monospace; font-size: 0.85em; line-height: 1.5; }
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
                "synthesis": "#EF4444", "refinement": "#3B82F6",
                "presentation": "#8B5CF6",
            }.get(entry.get("stage_name", ""), "#69676C")

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

            if entry.get("critiques"):
                for crit in entry["critiques"]:
                    da_class = ' style="border-left:3px solid #DC2626;padding-left:8px;margin:4px 0;"' if crit.get("is_devils_advocate") else ""
                    da_badge = '<span style="background:rgba(220,38,38,0.15);color:#DC2626;padding:1px 6px;border-radius:10px;font-size:10px;margin-left:6px;">DA</span>' if crit.get("is_devils_advocate") else ""
                    score = crit.get("score", 0)
                    score_color = "#10B981" if score >= 7 else "#F59E0B" if score >= 5 else "#EF4444"
                    entries_html += f'<div class="detail"{da_class}>'
                    entries_html += f'<strong>{html.escape(crit.get("critic_name", "?"))}</strong>{da_badge} '
                    entries_html += f'on {html.escape(crit.get("concept_label", "?"))} — '
                    entries_html += f'<span style="color:{score_color}">{crit.get("score", "?")}/10</span>'
                    if crit.get("fatal_flaw") and str(crit["fatal_flaw"]).upper() != "NONE":
                        entries_html += f'<br><em>Fatal: {html.escape(str(crit["fatal_flaw"]))}</em>'
                    entries_html += '</div>'
            elif entry.get("critiques_count"):
                # Backward compat for old simulations
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
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
:root {{ --void: #1B1D22; --surface: #22252B; --surface-2: #2A2D34; --cyan: #00D9FF; --gold: #FFB800; --flame: #F27123; --text: #E9E7E4; --text-sec: #CBCDCE; --text-dim: #7A7880; --border: rgba(233,231,228,0.06); --border-med: rgba(233,231,228,0.10); }}
* {{ margin:0; padding:0; box-sizing:border-box; }}
body {{ background:var(--void); color:var(--text); font-family:'Inter',system-ui,sans-serif; line-height:1.7; padding:40px 24px; max-width:900px; margin:0 auto; }}
h1 {{ font-size:32px; font-weight:800; margin-bottom:8px; }}
h1 span {{ color:var(--cyan); }}
h2 {{ font-size:20px; color:var(--cyan); margin:34px 0 16px; padding-bottom:8px; border-bottom:1px solid var(--border-med); }}
.meta {{ color:var(--text-dim); margin-bottom:34px; }}
.entry {{ padding:13px 16px; border-left:3px solid var(--border-med); margin-bottom:8px; background:var(--surface); border-radius:0 6px 6px 0; }}
.entry-header {{ display:flex; justify-content:space-between; margin-bottom:6px; }}
.stage {{ font-weight:600; text-transform:uppercase; font-size:12px; letter-spacing:0.5px; }}
.time {{ font-size:11px; color:var(--text-dim); font-family:'JetBrains Mono','Fira Code',monospace; }}
.detail {{ font-size:13px; color:var(--text-sec); margin:4px 0; }}
.concept-entry {{ font-size:13px; margin:4px 0; }}
.concept-card {{ background:var(--surface); border-radius:0 12px 12px 0; padding:16px 21px; margin-bottom:13px; }}
.concept-card h3 {{ font-size:16px; margin-bottom:4px; }}
.persona {{ font-size:12px; margin-bottom:8px; }}
.tagline {{ font-style:italic; color:var(--text-dim); margin-bottom:8px; }}
.headline {{ font-size:18px; font-weight:700; color:var(--cyan); margin:8px 0; }}
.rationale {{ font-size:13px; color:var(--text-dim); }}
.badge {{ display:inline-block; padding:2px 8px; border-radius:9999px; font-size:10px; font-weight:600; text-transform:uppercase; margin-left:8px; }}
.badge.active {{ background:rgba(16,185,129,0.12); color:#10B981; }}
.badge.winner {{ background:rgba(255,184,0,0.12); color:#FFB800; }}
.badge.eliminated {{ background:rgba(239,68,68,0.12); color:#EF4444; }}
.badge.runner_up {{ background:rgba(59,130,246,0.12); color:#3B82F6; }}
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
                    entry = {
                        "concept_name": concept.name,
                        "persona": concept.persona_name,
                        "status": concept.status,
                        "prompt": concept.image_prompt,
                        "visual_direction": getattr(concept, "visual_direction", ""),
                    }
                    if concept.video_prompt:
                        entry["video_prompt"] = concept.video_prompt
                    prompts.append(entry)

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
<h2 style="margin-top:16px;font-size:1.3em;color:#E9E7E4;font-weight:400;">{self._esc(state.config.name)}</h2>
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
            ev_color = PERSONA_COLORS.get("jony-ive", "#CBCDCE")
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
{f'<p style="margin-top:12px;color:#00D9FF;font-weight:600;">"One more thing..." {self._esc(str(one_more))}</p>' if one_more and one_more != "NONE" else ''}
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

        color = PERSONA_COLORS.get(winner.persona_id, "#00D9FF")
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
{f'<p style="margin-top:12px;font-size:0.85em;color:#7A7880;">{self._esc(winner.rationale)}</p>' if winner.rationale else ''}
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

    # === MARKDOWN EXPORT GENERATORS ===

    def _concept_to_md(self, c) -> str:
        """Convert a single concept to markdown."""
        lines = [f"## {c.name}"]
        lines.append(f"**By:** {c.persona_name}  ")
        lines.append(f"**Status:** {c.status}  ")
        if c.round_created:
            lines.append(f"**Round:** {c.round_created}")
        lines.append("")
        if c.tagline:
            lines.extend([f"*{c.tagline}*", ""])
        if c.idea:
            lines.extend(["### Idea", c.idea, ""])
        if c.headline:
            lines.append(f"### Headline")
            lines.append(f"**{c.headline}**")
            if c.subhead:
                lines.append(c.subhead)
            lines.append("")
        if c.body_copy:
            lines.extend(["### Body Copy", c.body_copy, ""])
        if c.visual_direction:
            lines.extend(["### Visual Direction", c.visual_direction, ""])
        if c.color_mood:
            lines.extend(["### Color & Mood", c.color_mood, ""])
        if c.rationale:
            lines.extend(["### Rationale", c.rationale, ""])
        if c.image_prompt:
            lines.extend(["### Image Prompt", "```", c.image_prompt, "```", ""])
        if c.video_prompt:
            lines.extend(["### Video Prompt", "```", c.video_prompt, "```", ""])
        if c.evolution_notes:
            lines.extend(["### Evolution", c.evolution_notes, ""])
        if hasattr(c, 'versions') and c.versions:
            lines.append("### Version History")
            for v in sorted(c.versions, key=lambda x: x.round_num):
                lines.append(f"**Round {v.round_num}** ({v.stage})")
                if v.headline:
                    lines.append(f"- Headline: {v.headline}")
                if v.name and v.name != c.name:
                    lines.append(f"- Name: {v.name}")
                if v.evolution_notes:
                    lines.append(f"- Changes: {v.evolution_notes}")
                if v.score is not None:
                    lines.append(f"- Score: {v.score}/10")
                lines.append("")
        if hasattr(c, 'previous_version_id') and c.previous_version_id:
            lines.append(f"*Evolved from concept `{c.previous_version_id}`*")
            lines.append("")
        if c.scores:
            lines.append("### Scores")
            for rnd, score in sorted(c.scores.items(), key=lambda x: int(x[0])):
                lines.append(f"- Round {rnd}: {score}/10")
            lines.append("")
        return "\n".join(lines)

    def generate_markdown_summary(self, state: SimulationState) -> str:
        """Generate a full simulation summary as markdown."""
        lines = [f"# {state.config.name}", ""]
        lines.append(f"**Type:** {state.config.type}  ")
        lines.append(f"**Status:** {state.status}  ")
        lines.append(f"**Rounds:** {len(state.rounds)}/{state.config.rounds}  ")
        lines.append(f"**Created:** {state.created_at}  ")
        lines.append("")

        # Brief
        if state.config.brief:
            lines.extend(["## Brief", state.config.brief, ""])

        # Participants
        lines.append("## Participants")
        lines.append(f"**Moderator:** {state.config.moderator.display_name} ({state.config.moderator.model})  ")
        if state.config.evaluator:
            lines.append(f"**Evaluator:** {state.config.evaluator.display_name} ({state.config.evaluator.model})  ")
        if state.config.devils_advocate:
            lines.append(f"**Devil's Advocate:** {state.config.devils_advocate.display_name} ({state.config.devils_advocate.model})  ")
        lines.append("")
        for pid, p in state.config.participants.items():
            lines.append(f"- **{p.display_name}** — {p.role} ({p.model})")
        lines.append("")

        # Round summaries
        for rnd in state.rounds:
            lines.append(f"## Round {rnd.round_num} — {rnd.mode.upper()}")
            lines.append(f"**Status:** {rnd.status} | Created: {rnd.concepts_created} | Surviving: {rnd.concepts_surviving} | Eliminated: {rnd.concepts_eliminated}")
            lines.append("")

        # All concepts
        active = state.concepts.get("active", [])
        eliminated = state.concepts.get("eliminated", [])

        if active:
            lines.append("## Active Concepts")
            for c in active:
                lines.append(self._concept_to_md(c))
                lines.append("---")
                lines.append("")

        if eliminated:
            lines.append("## Eliminated Concepts")
            for c in eliminated:
                lines.append(self._concept_to_md(c))
                lines.append("---")
                lines.append("")

        return "\n".join(lines)

    def generate_markdown_winner(self, state: SimulationState) -> str:
        """Generate markdown for the winner concept complete package."""
        active = state.concepts.get("active", [])
        winner = next((c for c in active if c.status == "winner"), None)
        if not winner:
            winner = active[0] if active else None
        if not winner:
            return "# No Winner\n\nSimulation has no concepts yet.\n"

        lines = [f"# Winner: {winner.name}", ""]
        lines.append(self._concept_to_md(winner))
        lines.append("")

        # Include critiques received by this concept
        critiques_for_winner = []
        for entry in state.transcript_entries:
            crits = entry.get("critiques", [])
            for crit in crits:
                if crit.get("concept_id") == winner.id:
                    critiques_for_winner.append(crit)

        if critiques_for_winner:
            lines.append("## Critiques Received")
            for crit in critiques_for_winner:
                lines.append(f"### By {crit.get('critic_name', 'Anonymous')} — Score: {crit.get('score', '?')}/10")
                if crit.get("strengths"):
                    lines.append("**Strengths:**")
                    for s in crit["strengths"]:
                        lines.append(f"- {s}")
                if crit.get("weaknesses"):
                    lines.append("**Weaknesses:**")
                    for w in crit["weaknesses"]:
                        lines.append(f"- {w}")
                if crit.get("fatal_flaw"):
                    lines.append(f"**Fatal Flaw:** {crit['fatal_flaw']}")
                if crit.get("one_change"):
                    lines.append(f"**One Change:** {crit['one_change']}")
                lines.append("")

        # Runner-up
        runner = next((c for c in active if c.status == "runner_up"), None)
        if runner:
            lines.extend(["---", "", "## Runner-Up", ""])
            lines.append(self._concept_to_md(runner))

        return "\n".join(lines)

    def generate_markdown_round(self, state: SimulationState, round_num: int) -> str:
        """Generate comprehensive markdown for one round — all stages, all data."""
        lines = [f"# Round {round_num}", ""]

        # Round metadata
        rnd = next((r for r in state.rounds if r.round_num == round_num), None)
        if rnd:
            mode_label = rnd.mode.upper() if rnd.mode else "UNKNOWN"
            lines.append(f"**Mode:** {mode_label}  ")
            lines.append(f"**Status:** {rnd.status}  ")
            lines.append(f"**Concepts This Round:** {rnd.concepts_created}  ")
            lines.append(f"**Surviving:** {rnd.concepts_surviving}  ")
            lines.append(f"**Eliminated:** {rnd.concepts_eliminated}  ")
            lines.append("")

        all_concepts = state.concepts.get("active", []) + state.concepts.get("eliminated", []) + state.concepts.get("merged", [])

        # --- STAGE 1: CONCEPTS ---
        # Show concepts that were created OR refined in this round
        round_concepts = [c for c in all_concepts if c.round_created == round_num]

        # Also find concepts refined this round (from transcript)
        refined_this_round = []
        for entry in state.transcript_entries:
            if entry.get("round") == round_num and entry.get("refined_concepts"):
                refined_this_round = entry["refined_concepts"]

        if round_concepts:
            lines.append("## Concepts")
            for c in round_concepts:
                lines.append(self._concept_to_md(c))
                lines.append("")
                lines.append("---")
                lines.append("")

        if refined_this_round and not round_concepts:
            lines.append("## Refined Concepts")
            for rc in refined_this_round:
                lines.append(f"### {rc.get('name', 'Untitled')}")
                lines.append(f"**By:** {rc.get('persona', '?')}  ")
                if rc.get("headline"):
                    lines.append(f"**Headline:** {rc['headline']}  ")
                if rc.get("evolution"):
                    lines.append(f"**Changes:** {rc['evolution']}")
                lines.append("")
                lines.append("---")
                lines.append("")

        # --- STAGE 2: CRITIQUES ---
        round_crits = []
        for entry in state.transcript_entries:
            if entry.get("round") == round_num and entry.get("critiques"):
                round_crits.extend(entry["critiques"])

        if round_crits:
            # Separate peer critiques from Devil's Advocate
            peer = [c for c in round_crits if not c.get("is_devils_advocate")]
            da = [c for c in round_crits if c.get("is_devils_advocate")]

            if peer:
                lines.append(f"## Peer Critiques")
                lines.append("")
                for crit in peer:
                    label = crit.get("concept_label", "?")
                    lines.append(f"### {crit.get('critic_name', 'Anonymous')} \u2192 {label} \u2014 {crit.get('score', '?')}/10")
                    if crit.get("strengths"):
                        lines.append("**Strengths:**")
                        for s in crit["strengths"]:
                            lines.append(f"- {s}")
                    if crit.get("weaknesses"):
                        lines.append("**Weaknesses:**")
                        for w in crit["weaknesses"]:
                            lines.append(f"- {w}")
                    if crit.get("fatal_flaw") and str(crit["fatal_flaw"]).upper() != "NONE":
                        lines.append(f"**Fatal Flaw:** {crit['fatal_flaw']}")
                    if crit.get("one_change"):
                        lines.append(f"**One Change:** {crit['one_change']}")
                    if crit.get("would_champion"):
                        lines.append(f"**Would Champion:** {crit['would_champion']}")
                    lines.append("")

            if da:
                lines.append(f"## Devil's Advocate")
                lines.append("")
                for crit in da:
                    label = crit.get("concept_label", "?")
                    lines.append(f"### Advocatus Diaboli \u2192 {label} \u2014 {crit.get('score', '?')}/10")
                    if crit.get("fatal_flaw") and str(crit["fatal_flaw"]).upper() != "NONE":
                        lines.append(f"**Fatal Flaw:** {crit['fatal_flaw']}")
                    if crit.get("weaknesses"):
                        lines.append("**Weaknesses:**")
                        for w in crit["weaknesses"]:
                            lines.append(f"- {w}")
                    if crit.get("strengths"):
                        lines.append("**Concessions:**")
                        for s in crit["strengths"]:
                            lines.append(f"- {s}")
                    if crit.get("one_change"):
                        lines.append(f"**Demanded Change:** {crit['one_change']}")
                    lines.append("")

        # --- DA DEFENSE ---
        for entry in state.transcript_entries:
            if entry.get("round") == round_num and entry.get("da_defenses"):
                lines.append("## DA Defense Round")
                lines.append("")
                for d in entry["da_defenses"]:
                    lines.append(f"### {d.get('persona_name', '?')} defends '{d.get('concept_name', '?')}'")
                    challenge = d.get("da_challenge", {})
                    if challenge.get("fatal_flaw"):
                        lines.append(f"**DA's Fatal Flaw:** {challenge['fatal_flaw']}")
                    if challenge.get("one_change"):
                        lines.append(f"**DA's Demand:** {challenge['one_change']}")
                    if d.get("defense_text"):
                        lines.append(f"**Defense:** {d['defense_text']}")
                    if d.get("verdict"):
                        verdict_icon = "+" if "accepted" in d["verdict"].lower() else "-"
                        lines.append(f"**DA Verdict:** [{verdict_icon}] {d['verdict']}")
                    if d.get("verdict_details"):
                        lines.append(f"**Details:** {d['verdict_details']}")
                    if d.get("revised_score") is not None:
                        lines.append(f"**Revised Score:** {d['revised_score']}/10")
                    lines.append("")
                    lines.append("---")
                    lines.append("")

        # --- STAGE 3: MODERATOR DIRECTION ---
        for entry in state.transcript_entries:
            if entry.get("round") == round_num and entry.get("direction"):
                lines.append("## Moderator Direction")
                lines.append(entry["direction"])
                lines.append("")

                if entry.get("evaluator_notes"):
                    lines.append("## Evaluator Assessment")
                    lines.append(entry["evaluator_notes"])
                    lines.append("")

                if entry.get("one_more_thing"):
                    lines.append(f"**\"One More Thing...\"** {entry['one_more_thing']}")
                    lines.append("")

                surviving = entry.get("surviving_concepts", [])
                eliminated = entry.get("eliminated_concepts", [])
                if surviving or eliminated:
                    lines.append("### Decisions")
                    for s in surviving:
                        reason = f" \u2014 {s['reason']}" if s.get("reason") else ""
                        lines.append(f"- **{s.get('name', '?')}** survives{reason}")
                    for e in eliminated:
                        reason = f" \u2014 {e['reason']}" if e.get("reason") else ""
                        lines.append(f"- ~~{e.get('name', '?')}~~ eliminated{reason}")
                    lines.append("")

        # --- ERRORS ---
        for entry in state.transcript_entries:
            if entry.get("round") == round_num and entry.get("stage_name") == "participant_error":
                lines.append(f"> \u26a0\ufe0f {entry.get('error', 'Unknown failure')}")
                lines.append("")

        return "\n".join(lines)

    def generate_markdown_devils_advocate(self, state: SimulationState) -> str:
        """Generate a dedicated Devil's Advocate report."""
        lines = [
            "# Advocatus Diaboli \u2014 Challenge Report",
            f"**Simulation:** {state.config.name}",
            f"**Rounds:** {len(state.rounds)}",
            "",
        ]

        all_concepts = state.concepts.get("active", []) + state.concepts.get("eliminated", [])
        has_da_content = False

        for round_num in range(1, len(state.rounds) + 1):
            da_crits = []
            for entry in state.transcript_entries:
                if entry.get("round") == round_num and entry.get("critiques"):
                    da_crits.extend([c for c in entry["critiques"] if c.get("is_devils_advocate")])

            if not da_crits:
                continue

            has_da_content = True
            rnd = next((r for r in state.rounds if r.round_num == round_num), None)
            mode = rnd.mode.upper() if rnd else "?"
            lines.append(f"## Round {round_num} \u2014 {mode}")
            lines.append("")

            for crit in da_crits:
                concept = next((c for c in all_concepts if c.id == crit.get("concept_id")), None)
                cname = concept.name if concept else crit.get("concept_label", "?")
                pname = concept.persona_name if concept else "?"

                lines.append(f"### \u2192 {cname} (by {pname}) \u2014 {crit.get('score', '?')}/10")

                if crit.get("fatal_flaw") and str(crit["fatal_flaw"]).upper() != "NONE":
                    lines.append(f"**Fatal Flaw:** {crit['fatal_flaw']}")
                if crit.get("weaknesses"):
                    for w in crit["weaknesses"]:
                        lines.append(f"- {w}")
                if crit.get("one_change"):
                    lines.append(f"**Demanded:** {crit['one_change']}")

                # Check for DA Defense results (attack/defense/verdict dialog)
                da_defense_found = False
                for entry in state.transcript_entries:
                    if entry.get("round") == round_num and entry.get("da_defenses"):
                        for d in entry["da_defenses"]:
                            if d.get("concept_id") == crit.get("concept_id"):
                                da_defense_found = True
                                lines.append("")
                                lines.append(f"**Defense by {d.get('persona_name', '?')}:**")
                                lines.append(f"> {d.get('defense_text', '')[:500]}")
                                lines.append("")
                                if d.get("verdict"):
                                    lines.append(f"**DA Verdict:** {d['verdict']}")
                                if d.get("verdict_details"):
                                    lines.append(f"**Details:** {d['verdict_details']}")
                                if d.get("revised_score") is not None:
                                    lines.append(f"**Revised Score:** {d['revised_score']}/10")

                # Fallback: check evolution notes if no DA Defense stage ran
                if not da_defense_found and concept and concept.evolution_notes:
                    evo = concept.evolution_notes.lower()
                    if any(kw in evo for kw in ["devil", "advocate", "advocat", "diaboli"]):
                        lines.append("")
                        lines.append(f"**Creative Response:** {concept.evolution_notes[:400]}")

                lines.append("")
                lines.append("---")
                lines.append("")

        if not has_da_content:
            lines.append("*No Devil's Advocate critiques found. Was the DA enabled for this simulation?*")

        return "\n".join(lines)

    def generate_production_package(self, state: SimulationState) -> str:
        """Generate production-ready winner package with full history."""
        active = state.concepts.get("active", [])
        winner = next((c for c in active if c.status == "winner"), None)
        if not winner and active:
            winner = active[0]
        if not winner:
            return "# No winner determined"

        runner = next((c for c in active if c.status == "runner_up"), None)

        lines = [
            f"# {winner.name}",
            f"*{winner.tagline}*" if winner.tagline else "",
            "",
            f"**By:** {winner.persona_name}  ",
            f"**Simulation:** {state.config.name} | {len(state.rounds)} rounds | {len(state.config.participants)} participants",
            "",
            "---",
            "",
        ]

        # Full concept data
        lines.append(self._concept_to_md(winner))
        lines.append("")

        # Score history
        if winner.scores:
            lines.append("## Score Progression")
            for rnd, score in sorted(winner.scores.items(), key=lambda x: int(x[0])):
                filled = round(score)
                bar = "\u2588" * filled + "\u2591" * (10 - filled)
                lines.append(f"Round {rnd}: `{bar}` {score}/10")
            lines.append("")

        # All critiques this concept received
        winner_crits = []
        for entry in state.transcript_entries:
            if entry.get("critiques"):
                for c in entry["critiques"]:
                    if c.get("concept_id") == winner.id:
                        c["_round"] = entry.get("round", 0)
                        winner_crits.append(c)

        if winner_crits:
            lines.append("## Critique History")
            for crit in sorted(winner_crits, key=lambda x: x.get("_round", 0)):
                da_tag = " *(Devil's Advocate)*" if crit.get("is_devils_advocate") else ""
                lines.append(f"### R{crit.get('_round', '?')} \u2014 {crit.get('critic_name', '?')}{da_tag} \u2014 {crit.get('score', '?')}/10")
                if crit.get("strengths"):
                    lines.append("**Strengths:** " + "; ".join(crit["strengths"][:3]))
                if crit.get("weaknesses"):
                    lines.append("**Weaknesses:** " + "; ".join(crit["weaknesses"][:3]))
                if crit.get("fatal_flaw") and str(crit["fatal_flaw"]).upper() != "NONE":
                    lines.append(f"**Fatal Flaw:** {crit['fatal_flaw']}")
                if crit.get("one_change"):
                    lines.append(f"**One Change:** {crit['one_change']}")
                lines.append("")

        # Runner up
        if runner:
            lines.extend(["---", "", "## Runner-Up", ""])
            lines.append(self._concept_to_md(runner))
            lines.append("")

        # Eliminated
        eliminated = state.concepts.get("eliminated", [])
        if eliminated:
            lines.extend(["---", "", "## Eliminated Concepts", ""])
            for c in eliminated:
                lines.append(f"- **{c.name}** by {c.persona_name} \u2014 *{c.tagline or ''}*")
            lines.append("")

        return "\n".join(lines)

    def generate_markdown_persona(self, state: SimulationState, persona_id: str) -> str:
        """Generate markdown for one persona's contributions across all rounds."""
        # Find persona name
        persona_name = persona_id
        if persona_id in state.config.participants:
            persona_name = state.config.participants[persona_id].display_name
        elif state.config.moderator and persona_id in state.config.moderator.display_name.lower().replace(" ", "-"):
            persona_name = state.config.moderator.display_name

        lines = [f"# {persona_name}", ""]

        # All concepts by this persona
        all_concepts = state.concepts.get("active", []) + state.concepts.get("eliminated", []) + state.concepts.get("merged", [])
        persona_concepts = [c for c in all_concepts if c.persona_id == persona_id]

        if persona_concepts:
            lines.append(f"## Concepts ({len(persona_concepts)})")
            for c in sorted(persona_concepts, key=lambda x: x.round_created):
                lines.append(self._concept_to_md(c))
                lines.append("---")
                lines.append("")
        else:
            lines.append("*No concepts found for this persona.*")
            lines.append("")

        return "\n".join(lines)

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
