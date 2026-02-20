"""Genesis Chamber Simulation Engine — orchestrates multi-round creative simulations."""

import re
import uuid
import asyncio
import string
from datetime import datetime
from typing import Any, Callable, Dict, List, Optional, Tuple

from .models import (
    Concept, Critique, EvaluatorAssessment, ModeratorDirection,
    RoundResult, SimulationConfig, SimulationState, StageResult,
)
from .soul_engine import SoulEngine
from .openrouter import query_with_soul, query_with_soul_parallel, get_reasoning_config
from .config import ROUND_MODES, SIMULATION_OUTPUT_DIR


def _build_query_extras(pconfig) -> dict:
    """Build reasoning, plugins, and thinking_mode dict entries for a participant config."""
    extras = {}
    mode = getattr(pconfig, "thinking_mode", "off")
    if mode and mode != "off":
        extras["reasoning"] = get_reasoning_config(pconfig.model, mode)
        extras["thinking_mode"] = mode
    if pconfig.enable_web_search:
        extras["plugins"] = [{"id": "web", "max_results": 5}]
    return extras


# ---------------------------------------------------------------------------
# Output Parser — 3-tier structured output parsing
# ---------------------------------------------------------------------------

class OutputParser:
    """Parses structured output from LLM responses using ===TAG=== delimiters."""

    @staticmethod
    def _extract_block(text: str, start_tag: str, end_tag: str) -> List[str]:
        """Extract all blocks between start_tag and end_tag."""
        pattern = rf'{re.escape(start_tag)}\s*\n(.*?)\n\s*{re.escape(end_tag)}'
        return re.findall(pattern, text, re.DOTALL)

    @staticmethod
    def _extract_field(block: str, field: str) -> str:
        """Extract a field value from a block (KEY: value format)."""
        pattern = rf'^{re.escape(field)}:\s*(.+?)(?=\n[A-Z_]+:|\Z)'
        match = re.search(pattern, block, re.MULTILINE | re.DOTALL)
        return match.group(1).strip() if match else ""

    @staticmethod
    def _extract_list_field(block: str, field: str) -> List[str]:
        """Extract a list field (lines starting with -)."""
        pattern = rf'^{re.escape(field)}:\s*\n((?:\s*-\s*.+\n?)*)'
        match = re.search(pattern, block, re.MULTILINE)
        if not match:
            return []
        items = re.findall(r'^\s*-\s*(.+)', match.group(1), re.MULTILINE)
        return [item.strip() for item in items]

    @classmethod
    def parse_concept(cls, text: str, persona_id: str, persona_name: str,
                      round_num: int) -> List[Concept]:
        """Parse concept(s) from LLM output."""
        concepts = []

        # Tier 1: strict ===CONCEPT_START=== / ===CONCEPT_END=== delimiters
        blocks = cls._extract_block(text, "===CONCEPT_START===", "===CONCEPT_END===")

        if not blocks:
            # Tier 2: try loose extraction — look for NAME: / IDEA: pattern
            if "NAME:" in text and "IDEA:" in text:
                blocks = [text]

        for block in blocks:
            concept = Concept(
                id=f"concept-{uuid.uuid4().hex[:8]}",
                persona_id=persona_id,
                persona_name=persona_name,
                round_created=round_num,
                name=cls._extract_field(block, "NAME") or "Untitled",
                tagline=cls._extract_field(block, "TAGLINE"),
                idea=cls._extract_field(block, "IDEA"),
                headline=cls._extract_field(block, "HEADLINE"),
                subhead=cls._extract_field(block, "SUBHEAD"),
                body_copy=cls._extract_field(block, "BODY_COPY"),
                visual_direction=cls._extract_field(block, "VISUAL_DIRECTION"),
                color_mood=cls._extract_field(block, "COLOR_MOOD"),
                rationale=cls._extract_field(block, "RATIONALE"),
                image_prompt=cls._extract_field(block, "IMAGE_PROMPT"),
                video_prompt=cls._extract_field(block, "VIDEO_PROMPT"),
                evolution_notes=cls._extract_field(block, "EVOLUTION_NOTES"),
                raw_text=block,
            )
            concepts.append(concept)

        # Tier 3: raw fallback — store as a single concept with raw_text
        if not concepts:
            concepts.append(Concept(
                id=f"concept-{uuid.uuid4().hex[:8]}",
                persona_id=persona_id,
                persona_name=persona_name,
                round_created=round_num,
                name="Raw Concept",
                idea=text[:500],
                raw_text=text,
            ))

        return concepts

    @classmethod
    def parse_critiques(cls, text: str, critic_id: str,
                        critic_name: str) -> List[Critique]:
        """Parse critique(s) from LLM output."""
        critiques = []

        blocks = cls._extract_block(text, "===CRITIQUE_START===", "===CRITIQUE_END===")

        if not blocks:
            if "CONCEPT:" in text and "SCORE:" in text:
                # Try splitting by "CONCEPT:" to get multiple critiques
                parts = re.split(r'(?=^CONCEPT:)', text, flags=re.MULTILINE)
                blocks = [p for p in parts if p.strip()]

        for block in blocks:
            score_str = cls._extract_field(block, "SCORE")
            try:
                score = int(re.search(r'\d+', score_str).group()) if score_str else 5
                score = max(1, min(10, score))
            except (AttributeError, ValueError):
                score = 5

            critique = Critique(
                critic_id=critic_id,
                critic_name=critic_name,
                concept_label=cls._extract_field(block, "CONCEPT"),
                score=score,
                strengths=cls._extract_list_field(block, "STRENGTHS"),
                weaknesses=cls._extract_list_field(block, "WEAKNESSES"),
                fatal_flaw=cls._extract_field(block, "FATAL_FLAW"),
                one_change=cls._extract_field(block, "ONE_CHANGE"),
                would_champion=cls._extract_field(block, "WOULD_YOU_CHAMPION_THIS"),
                raw_text=block,
            )
            critiques.append(critique)

        if not critiques:
            critiques.append(Critique(
                critic_id=critic_id,
                critic_name=critic_name,
                concept_label="Unknown",
                raw_text=text,
            ))

        return critiques

    @classmethod
    def parse_direction(cls, text: str, moderator_name: str,
                        round_num: int) -> ModeratorDirection:
        """Parse moderator direction from LLM output."""
        blocks = cls._extract_block(text, "===DIRECTION_START===", "===DIRECTION_END===")
        block = blocks[0] if blocks else text

        surviving = cls._extract_list_field(block, "SURVIVING")
        eliminated = cls._extract_list_field(block, "ELIMINATED")
        merge_opps = cls._extract_list_field(block, "MERGE_OPPORTUNITIES")
        constraints = cls._extract_list_field(block, "NEW_CONSTRAINTS")

        # Parse surviving/eliminated into dicts
        def parse_items(items: List[str]) -> List[Dict[str, str]]:
            result = []
            for item in items:
                parts = item.split(":", 1)
                name = parts[0].strip()
                reason = parts[1].strip() if len(parts) > 1 else ""
                result.append({"name": name, "reason": reason})
            return result

        return ModeratorDirection(
            moderator_name=moderator_name,
            round_num=round_num,
            surviving_concepts=parse_items(surviving),
            eliminated_concepts=parse_items(eliminated),
            merge_suggestions=[{"suggestion": s} for s in merge_opps],
            new_constraints=constraints,
            direction_notes=cls._extract_field(block, "DIRECTION"),
            one_more_thing=cls._extract_field(block, "ONE_MORE_THING"),
            raw_text=block,
        )


# ---------------------------------------------------------------------------
# Genesis Round — runs one complete round (3 or 5 stages)
# ---------------------------------------------------------------------------

class GenesisRound:
    """Runs a single round of the Genesis Chamber simulation."""

    def __init__(self, config: SimulationConfig, soul_engine: SoulEngine,
                 round_num: int, active_concepts: List[Concept]):
        self.config = config
        self.soul_engine = soul_engine
        self.round_num = round_num
        self.active_concepts = active_concepts
        self.stage_results: Dict[int, StageResult] = {}

    async def run_round(
        self,
        stages_to_run: int = 5,
        on_stage_complete: Optional[Callable] = None,
        on_stage_start: Optional[Callable] = None,
        on_participant_event: Optional[Callable] = None,
    ) -> Tuple[RoundResult, List[Concept], Optional[ModeratorDirection]]:
        """Run all stages for this round.

        Returns:
            Tuple of (RoundResult, updated concepts list, moderator direction or None)
        """
        round_result = RoundResult(
            round_num=self.round_num,
            mode=ROUND_MODES.get(self.round_num, "unknown"),
            status="running",
        )

        new_concepts = []
        all_critiques = []
        direction = None

        # Helper to emit stage_start events
        async def _emit_stage_start(stage_num, stage_name, participants=None):
            if on_stage_start:
                try:
                    await _maybe_await(on_stage_start, stage_num, stage_name, participants or [])
                except Exception as e:
                    print(f"[SimWarn] stage_start callback error (stage {stage_num}): {e}")

        # Stage 1: Creation
        participant_ids = list(self.config.participants.keys())
        print(f"[Sim] R{self.round_num} Stage 1 — Creation starting with {len(participant_ids)} participants: {participant_ids}")
        await _emit_stage_start(1, "creation", participant_ids)
        stage1 = await self._stage_creation(on_participant_event=on_participant_event)
        self.stage_results[1] = stage1
        round_result.stages[1] = stage1
        if stage1.outputs:
            new_concepts = stage1.outputs
        print(f"[Sim] R{self.round_num} Stage 1 complete — {len(new_concepts)} concepts created")
        if on_stage_complete:
            await _maybe_await(on_stage_complete, 1, "creation", stage1)

        # Stage 2: Critique
        concepts_to_critique = new_concepts if new_concepts else self.active_concepts
        print(f"[Sim] R{self.round_num} Stage 2 — Critique starting, {len(concepts_to_critique)} concepts to critique")
        await _emit_stage_start(2, "critique", participant_ids)
        stage2 = await self._stage_critique(concepts_to_critique, on_participant_event=on_participant_event)
        self.stage_results[2] = stage2
        round_result.stages[2] = stage2
        if stage2.outputs:
            all_critiques = stage2.outputs
        if on_stage_complete:
            await _maybe_await(on_stage_complete, 2, "critique", stage2)

        # Stage 3: Synthesis (moderator direction)
        await _emit_stage_start(3, "synthesis", ["moderator", "evaluator"])
        stage3 = await self._stage_synthesis(concepts_to_critique, all_critiques)
        self.stage_results[3] = stage3
        round_result.stages[3] = stage3
        if stage3.outputs:
            direction = stage3.outputs
        if on_stage_complete:
            await _maybe_await(on_stage_complete, 3, "synthesis", stage3)

        # Stages 4 & 5 only in full mode
        if stages_to_run >= 4 and direction:
            await _emit_stage_start(4, "refinement", participant_ids)
            stage4 = await self._stage_refinement(concepts_to_critique, direction, all_critiques)
            self.stage_results[4] = stage4
            round_result.stages[4] = stage4
            if stage4.outputs:
                new_concepts = stage4.outputs
            if on_stage_complete:
                await _maybe_await(on_stage_complete, 4, "refinement", stage4)

        if stages_to_run >= 5:
            final_concepts = new_concepts if new_concepts else concepts_to_critique
            await _emit_stage_start(5, "presentation", participant_ids)
            stage5 = await self._stage_presentation(final_concepts)
            self.stage_results[5] = stage5
            round_result.stages[5] = stage5
            if on_stage_complete:
                await _maybe_await(on_stage_complete, 5, "presentation", stage5)

        # Apply scores from critiques to concepts
        final_concepts = new_concepts if new_concepts else concepts_to_critique
        self._apply_scores(final_concepts, all_critiques)

        round_result.concepts_created = len(final_concepts)
        round_result.concepts_surviving = len([c for c in final_concepts if c.status == "active"])
        round_result.status = "complete"

        return round_result, final_concepts, direction

    async def _stage_creation(self, on_participant_event: Optional[Callable] = None) -> StageResult:
        """Stage 1: Independent concept generation."""
        stage = StageResult(stage_num=1, stage_name="creation", status="running",
                            started_at=datetime.utcnow().isoformat())

        num_concepts = (self.config.concepts_round_1 if self.round_num == 1
                        else self.config.concepts_round_2_plus)

        # Build queries for all participants
        queries = []
        participant_ids = []
        for pid, pconfig in self.config.participants.items():
            system_prompt = self.soul_engine.compile_system_prompt(
                persona_id=pid,
                persona_name=pconfig.display_name,
                stage=1,
                round_num=self.round_num,
                brief=self.config.brief,
                context=self.config.brand_context,
            )

            # Format the task with concept count
            user_prompt = f"Create {num_concepts} concept(s) for this project brief."
            if self.round_num > 1 and self.active_concepts:
                user_prompt += "\n\nPrevious round concepts for reference:\n"
                for c in self.active_concepts:
                    user_prompt += f"- {c.name}: {c.idea[:200]}\n"

            query = {
                "model": pconfig.model,
                "system_prompt": system_prompt,
                "user_prompt": user_prompt,
                "temperature": pconfig.temperature,
                "max_tokens": pconfig.max_tokens,
                **_build_query_extras(pconfig),
            }
            queries.append(query)
            participant_ids.append(pid)

        # Emit "thinking" events for each participant
        if on_participant_event:
            for pid in participant_ids:
                pconfig = self.config.participants[pid]
                await _maybe_await(on_participant_event, "thinking", pid, pconfig.display_name, "creation")

        # Execute in parallel
        print(f"[Sim] Stage 1 — Sending {len(queries)} queries to OpenRouter...")
        for i, q in enumerate(queries):
            print(f"  [{i+1}] model={q['model']} max_tokens={q.get('max_tokens', 2000)} reasoning={'yes' if q.get('reasoning') else 'no'} web={'yes' if q.get('plugins') else 'no'}")
        try:
            responses = await asyncio.wait_for(query_with_soul_parallel(queries), timeout=300)
            print(f"[Sim] Stage 1 — Got {len(responses)} responses, {sum(1 for r in responses if r)} successful")
        except asyncio.TimeoutError:
            print(f"[SimError] Stage 1 Creation — OpenRouter timeout after 5 min")
            responses = [None] * len(queries)
        except Exception as e:
            print(f"[SimError] Stage 1 — query_with_soul_parallel failed: {e}")
            import traceback
            traceback.print_exc()
            responses = [None] * len(queries)

        # Parse responses into concepts
        all_concepts = []
        for pid, response in zip(participant_ids, responses):
            pconfig = self.config.participants[pid]
            if response and response.get("content"):
                concepts = OutputParser.parse_concept(
                    response["content"], pid, pconfig.display_name, self.round_num
                )
                all_concepts.extend(concepts)
                # Emit completion event per participant
                if on_participant_event:
                    concept_names = [c.name for c in concepts]
                    await _maybe_await(on_participant_event, "response", pid, pconfig.display_name, "creation", concept_names)
            else:
                print(f"Warning: No response from {pconfig.display_name} in Stage 1")

        stage.outputs = all_concepts
        stage.status = "complete"
        stage.completed_at = datetime.utcnow().isoformat()
        return stage

    async def _stage_critique(self, concepts: List[Concept], on_participant_event: Optional[Callable] = None) -> StageResult:
        """Stage 2: Anonymized peer review (+ Devil's Advocate if enabled)."""
        stage = StageResult(stage_num=2, stage_name="critique", status="running",
                            started_at=datetime.utcnow().isoformat())

        # Anonymize concepts: assign labels A, B, C, ...
        labels = list(string.ascii_uppercase[:len(concepts)])
        label_map = {}  # label -> concept_id
        anonymized_text = ""
        for label, concept in zip(labels, concepts):
            label_map[label] = concept.id
            anonymized_text += f"\n--- Concept {label} ---\n"
            anonymized_text += f"NAME: {concept.name}\n"
            anonymized_text += f"TAGLINE: {concept.tagline}\n"
            anonymized_text += f"IDEA: {concept.idea}\n"
            anonymized_text += f"HEADLINE: {concept.headline}\n"
            anonymized_text += f"SUBHEAD: {concept.subhead}\n"
            anonymized_text += f"BODY_COPY: {concept.body_copy}\n"
            anonymized_text += f"VISUAL_DIRECTION: {concept.visual_direction}\n"
            anonymized_text += f"RATIONALE: {concept.rationale}\n\n"

        last_label = labels[-1] if labels else "A"

        # Build queries for all participants
        queries = []
        participant_ids = []
        for pid, pconfig in self.config.participants.items():
            system_prompt = self.soul_engine.compile_system_prompt(
                persona_id=pid,
                persona_name=pconfig.display_name,
                stage=2,
                round_num=self.round_num,
                brief=self.config.brief,
                context=self.config.brand_context,
            )

            user_prompt = f"Here are {len(concepts)} anonymized concepts to critique:\n"
            user_prompt += anonymized_text
            user_prompt += f"\nCritique ALL concepts from Concept A through Concept {last_label}."

            query = {
                "model": pconfig.model,
                "system_prompt": system_prompt,
                "user_prompt": user_prompt,
                "temperature": max(0.3, pconfig.temperature - 0.2),
                "max_tokens": pconfig.max_tokens,
                **_build_query_extras(pconfig),
            }
            queries.append(query)
            participant_ids.append(pid)

        # Devil's Advocate: add adversarial critique query if enabled
        da = self.config.devils_advocate
        if da:
            da_system = self.soul_engine.compile_devils_advocate_prompt(
                persona_name=da.display_name,
                round_num=self.round_num,
                brief=self.config.brief,
                context=self.config.brand_context,
            )

            da_prompt = f"Here are {len(concepts)} anonymized concepts to critique as the Advocatus Diaboli:\n"
            da_prompt += anonymized_text
            da_prompt += f"\nApply the Devil's Advocate mandate to ALL concepts from Concept A through Concept {last_label}."
            da_prompt += "\nRemember: check for consensus patterns. If all other critics agree, invoke the Sanhedrin principle."

            query = {
                "model": da.model,
                "system_prompt": da_system,
                "user_prompt": da_prompt,
                "temperature": da.temperature,
                "max_tokens": da.max_tokens,
                **_build_query_extras(da),
            }
            queries.append(query)
            participant_ids.append("devils-advocate")

        # Emit "thinking" events for each participant
        if on_participant_event:
            for pid in participant_ids:
                if pid == "devils-advocate" and da:
                    await _maybe_await(on_participant_event, "thinking", pid, da.display_name, "critique")
                elif pid in self.config.participants:
                    pconfig = self.config.participants[pid]
                    await _maybe_await(on_participant_event, "thinking", pid, pconfig.display_name, "critique")

        # Execute in parallel (5 min timeout)
        try:
            responses = await asyncio.wait_for(query_with_soul_parallel(queries), timeout=300)
        except asyncio.TimeoutError:
            print(f"[SimError] Stage 2 Critique — OpenRouter timeout after 5 min")
            responses = [None] * len(queries)

        # Parse critiques
        all_critiques = []
        for pid, response in zip(participant_ids, responses):
            if pid == "devils-advocate" and da:
                display_name = da.display_name
            elif pid in self.config.participants:
                display_name = self.config.participants[pid].display_name
            else:
                continue

            if response and response.get("content"):
                critiques = OutputParser.parse_critiques(
                    response["content"], pid, display_name
                )
                # Resolve concept_ids from labels
                for critique in critiques:
                    label = critique.concept_label.replace("Concept ", "").strip().upper()
                    if label in label_map:
                        critique.concept_id = label_map[label]
                all_critiques.extend(critiques)
                # Emit completion event
                if on_participant_event:
                    await _maybe_await(on_participant_event, "response", pid, display_name, "critique")

        stage.outputs = all_critiques
        stage.status = "complete"
        stage.completed_at = datetime.utcnow().isoformat()
        return stage

    async def _stage_synthesis(self, concepts: List[Concept],
                                critiques: List[Critique]) -> StageResult:
        """Stage 3: Moderator direction + evaluator assessment."""
        stage = StageResult(stage_num=3, stage_name="synthesis", status="running",
                            started_at=datetime.utcnow().isoformat())

        # Build summary of concepts and critiques for the moderator
        summary = "CONCEPTS AND THEIR SCORES:\n\n"
        for concept in concepts:
            concept_critiques = [c for c in critiques if c.concept_id == concept.id]
            scores = [c.score for c in concept_critiques]
            avg_score = sum(scores) / len(scores) if scores else 0

            summary += f"**{concept.name}** (by {concept.persona_name})\n"
            summary += f"  Idea: {concept.idea}\n"
            summary += f"  Avg Score: {avg_score:.1f} ({len(scores)} reviews)\n"
            for crit in concept_critiques:
                summary += f"  - {crit.critic_name}: {crit.score}/10"
                if crit.strengths:
                    summary += f" | Strengths: {', '.join(crit.strengths[:2])}"
                if crit.fatal_flaw and crit.fatal_flaw.upper() != "NONE":
                    summary += f" | Fatal flaw: {crit.fatal_flaw}"
                summary += "\n"
            summary += "\n"

        # Moderator query
        mod = self.config.moderator
        mod_system = self.soul_engine.compile_moderator_prompt(
            persona_id="moderator",
            persona_name=mod.display_name,
            round_num=self.round_num,
            brief=self.config.brief,
            context=self.config.brand_context,
        )

        mod_extras = _build_query_extras(mod)
        try:
            mod_response = await asyncio.wait_for(query_with_soul(
                model=mod.model,
                system_prompt=mod_system,
                user_prompt=summary,
                temperature=mod.temperature,
                max_tokens=mod.max_tokens,
                reasoning=mod_extras.get("reasoning"),
                plugins=mod_extras.get("plugins"),
            ), timeout=300)
        except asyncio.TimeoutError:
            print(f"[SimError] Stage 3 Synthesis — Moderator query timeout after 5 min")
            mod_response = None

        direction = None
        if mod_response and mod_response.get("content"):
            direction = OutputParser.parse_direction(
                mod_response["content"], mod.display_name, self.round_num
            )

        stage.outputs = direction
        stage.status = "complete"
        stage.completed_at = datetime.utcnow().isoformat()
        return stage

    async def _stage_refinement(self, concepts: List[Concept],
                                 direction: ModeratorDirection,
                                 critiques: List[Critique]) -> StageResult:
        """Stage 4: Directed revision based on feedback."""
        stage = StageResult(stage_num=4, stage_name="refinement", status="running",
                            started_at=datetime.utcnow().isoformat())

        # Identify surviving participants
        surviving_names = {s.get("name", "").lower() for s in direction.surviving_concepts}

        queries = []
        participant_ids = []
        for pid, pconfig in self.config.participants.items():
            # Find this participant's concept(s)
            my_concepts = [c for c in concepts if c.persona_id == pid and c.status == "active"]
            if not my_concepts:
                continue

            # Get critiques for their concepts
            my_critiques = []
            for concept in my_concepts:
                concept_crits = [c for c in critiques if c.concept_id == concept.id]
                for crit in concept_crits:
                    my_critiques.append(f"  {crit.critic_name}: {crit.score}/10 — "
                                         f"Strengths: {', '.join(crit.strengths[:2])}; "
                                         f"Weaknesses: {', '.join(crit.weaknesses[:2])}")

            system_prompt = self.soul_engine.compile_system_prompt(
                persona_id=pid,
                persona_name=pconfig.display_name,
                stage=4,
                round_num=self.round_num,
                brief=self.config.brief,
                context=self.config.brand_context,
            )

            critique_text = "\n".join(my_critiques) if my_critiques else "No critiques received."
            direction_text = direction.direction_notes or direction.raw_text[:500]

            user_prompt = (
                f"MODERATOR DIRECTION:\n{direction_text}\n\n"
                f"YOUR CONCEPT'S CRITIQUES:\n{critique_text}\n\n"
                f"NEW CONSTRAINTS: {', '.join(direction.new_constraints) if direction.new_constraints else 'None'}\n\n"
                f"Revise your concept based on this feedback."
            )

            query = {
                "model": pconfig.model,
                "system_prompt": system_prompt,
                "user_prompt": user_prompt,
                "temperature": pconfig.temperature,
                "max_tokens": pconfig.max_tokens,
                **_build_query_extras(pconfig),
            }
            queries.append(query)
            participant_ids.append(pid)

        try:
            responses = await asyncio.wait_for(query_with_soul_parallel(queries), timeout=300)
        except asyncio.TimeoutError:
            print(f"[SimError] Stage 4 Refinement — OpenRouter timeout after 5 min")
            responses = [None] * len(queries)

        refined_concepts = []
        for pid, response in zip(participant_ids, responses):
            pconfig = self.config.participants[pid]
            if response and response.get("content"):
                concepts_parsed = OutputParser.parse_concept(
                    response["content"], pid, pconfig.display_name, self.round_num
                )
                refined_concepts.extend(concepts_parsed)

        stage.outputs = refined_concepts
        stage.status = "complete"
        stage.completed_at = datetime.utcnow().isoformat()
        return stage

    async def _stage_presentation(self, concepts: List[Concept]) -> StageResult:
        """Stage 5: Group presentation with moderator reaction."""
        stage = StageResult(stage_num=5, stage_name="presentation", status="running",
                            started_at=datetime.utcnow().isoformat())

        queries = []
        participant_ids = []
        for concept in concepts:
            if concept.status != "active":
                continue

            pid = concept.persona_id
            pconfig = self.config.participants.get(pid)
            if not pconfig:
                continue

            system_prompt = self.soul_engine.compile_system_prompt(
                persona_id=pid,
                persona_name=pconfig.display_name,
                stage=5,
                round_num=self.round_num,
                brief=self.config.brief,
                context=self.config.brand_context,
            )

            user_prompt = (
                f"Present your concept '{concept.name}' to the group.\n"
                f"Current state:\n"
                f"- Idea: {concept.idea}\n"
                f"- Headline: {concept.headline}\n"
                f"- Visual: {concept.visual_direction}\n"
            )

            query = {
                "model": pconfig.model,
                "system_prompt": system_prompt,
                "user_prompt": user_prompt,
                "temperature": pconfig.temperature,
                "max_tokens": pconfig.max_tokens,
                **_build_query_extras(pconfig),
            }
            queries.append(query)
            participant_ids.append(pid)

        try:
            responses = await asyncio.wait_for(query_with_soul_parallel(queries), timeout=300)
        except asyncio.TimeoutError:
            print(f"[SimError] Stage 5 Presentation — OpenRouter timeout after 5 min")
            responses = [None] * len(queries)

        presentations = []
        for pid, response in zip(participant_ids, responses):
            if response and response.get("content"):
                presentations.append({
                    "persona_id": pid,
                    "content": response["content"],
                })

        stage.outputs = presentations
        stage.status = "complete"
        stage.completed_at = datetime.utcnow().isoformat()
        return stage

    def _apply_scores(self, concepts: List[Concept], critiques: List[Critique]):
        """Apply average critique scores to concepts."""
        for concept in concepts:
            scores = [c.score for c in critiques if c.concept_id == concept.id]
            if scores:
                concept.scores[self.round_num] = sum(scores) / len(scores)


# ---------------------------------------------------------------------------
# Genesis Simulation — orchestrates multiple rounds
# ---------------------------------------------------------------------------

class GenesisSimulation:
    """Orchestrates a full Genesis Chamber simulation across multiple rounds."""

    def __init__(self, config: SimulationConfig):
        self.config = config
        self.sim_id = f"sim-{uuid.uuid4().hex[:12]}"
        self.soul_engine = SoulEngine()
        self.state = SimulationState(id=self.sim_id, config=config)

        # Load all souls
        for pid, pconfig in config.participants.items():
            self.soul_engine.load_soul(pid, pconfig.soul_document)

        # Load moderator soul
        self.soul_engine.load_soul("moderator", config.moderator.soul_document)

        # Load evaluator soul if configured
        if config.evaluator:
            self.soul_engine.load_soul("evaluator", config.evaluator.soul_document)

        # Load Devil's Advocate soul if enabled
        if config.devils_advocate:
            self.soul_engine.load_soul("devils-advocate", config.devils_advocate.soul_document)

    async def run(
        self,
        on_stage_complete: Optional[Callable] = None,
        on_round_complete: Optional[Callable] = None,
        on_gate_reached: Optional[Callable] = None,
        on_stage_start: Optional[Callable] = None,
        on_participant_event: Optional[Callable] = None,
    ) -> SimulationState:
        """Run the full simulation.

        Callbacks:
            on_stage_complete(round_num, stage_num, stage_name, result)
            on_round_complete(round_num, round_result)
            on_gate_reached(round_num, gate)
        """
        self.state.status = "running"
        active_concepts: List[Concept] = []
        print(f"[Sim] Starting simulation {self.sim_id} — {self.config.rounds} rounds, "
              f"{len(self.config.participants)} participants")

        for round_num in range(1, self.config.rounds + 1):
            self.state.current_round = round_num
            print(f"[Sim] === Round {round_num}/{self.config.rounds} starting ===")
            self._log_event("round_start", {"round": round_num,
                                             "mode": ROUND_MODES.get(round_num, "unknown")})

            # Run the round
            genesis_round = GenesisRound(
                config=self.config,
                soul_engine=self.soul_engine,
                round_num=round_num,
                active_concepts=active_concepts,
            )

            async def stage_cb(stage_num, stage_name, result):
                self.state.current_stage = stage_num
                self.state.current_stage_name = stage_name
                self._add_transcript(round_num, stage_num, stage_name, result)
                await self._save_state()
                if on_stage_complete:
                    await _maybe_await(on_stage_complete, round_num, stage_num, stage_name, result)

            async def stage_start_cb(stage_num, stage_name, participants):
                self.state.current_stage = stage_num
                self.state.current_stage_name = stage_name
                await self._save_state()
                if on_stage_start:
                    await _maybe_await(on_stage_start, round_num, stage_num, stage_name, participants)

            async def participant_cb(event_type, pid, display_name, stage_name, extra=None):
                if on_participant_event:
                    await _maybe_await(on_participant_event, round_num, event_type, pid, display_name, stage_name, extra)

            round_result, concepts, direction = await genesis_round.run_round(
                stages_to_run=self.config.stages_per_round,
                on_stage_complete=stage_cb,
                on_stage_start=stage_start_cb,
                on_participant_event=participant_cb,
            )

            # Update active concepts
            active_concepts = concepts
            self.state.concepts["active"] = [c for c in active_concepts if c.status == "active"]

            # Apply elimination between rounds
            elim_pct = self.config.elimination_schedule.get(str(round_num), 0.0)
            if elim_pct > 0 and direction:
                eliminated = self._apply_elimination(active_concepts, direction, elim_pct)
                self.state.concepts["eliminated"].extend(eliminated)

            # Store round result
            self.state.rounds.append(round_result)
            self._log_event("round_complete", {
                "round": round_num,
                "concepts_active": len([c for c in active_concepts if c.status == "active"]),
                "concepts_eliminated": round_result.concepts_eliminated,
            })

            if on_round_complete:
                await _maybe_await(on_round_complete, round_num, round_result)

            # Check quality gates
            if round_num in self.config.quality_gates:
                gate = {"after_round": round_num, "status": "pending",
                        "reached_at": datetime.utcnow().isoformat()}
                self.state.quality_gates.append(gate)
                self.state.status = "paused_at_gate"
                await self._save_state()
                self._log_event("quality_gate", {"round": round_num})
                if on_gate_reached:
                    await _maybe_await(on_gate_reached, round_num, gate)
                # In production, we'd return here and wait for approval
                # For now, auto-approve and continue
                gate["status"] = "approved"
                self.state.status = "running"

            await self._save_state()

        # Mark final concepts
        active = [c for c in active_concepts if c.status == "active"]
        if active:
            # Sort by latest score
            active.sort(key=lambda c: c.scores.get(self.config.rounds, 0), reverse=True)
            active[0].status = "winner"
            if len(active) > 1:
                active[1].status = "runner_up"

        self.state.concepts["active"] = active
        self.state.status = "completed"
        await self._save_state()
        self._log_event("simulation_complete", {"winner": active[0].name if active else "none"})

        return self.state

    def _apply_elimination(self, concepts: List[Concept],
                           direction: ModeratorDirection,
                           pct: float) -> List[Concept]:
        """Eliminate bottom N% of concepts based on scores and moderator direction."""
        active = [c for c in concepts if c.status == "active"]
        if not active:
            return []

        # Use moderator's elimination list first
        eliminated_names = {e.get("name", "").lower() for e in direction.eliminated_concepts}
        eliminated = []

        for concept in active:
            if concept.name.lower() in eliminated_names:
                concept.status = "eliminated"
                eliminated.append(concept)

        # If moderator didn't eliminate enough, eliminate by score
        target = max(1, int(len(active) * pct))
        if len(eliminated) < target:
            remaining = sorted(
                [c for c in active if c.status == "active"],
                key=lambda c: max(c.scores.values()) if c.scores else 0,
            )
            for concept in remaining[:target - len(eliminated)]:
                concept.status = "eliminated"
                eliminated.append(concept)

        return eliminated

    def _log_event(self, event_type: str, data: dict):
        """Add an event to the event log."""
        self.state.event_log.append({
            "type": event_type,
            "timestamp": datetime.utcnow().isoformat(),
            **data,
        })

    def _add_transcript(self, round_num: int, stage_num: int,
                        stage_name: str, result: StageResult):
        """Add a transcript entry."""
        entry = {
            "round": round_num,
            "stage": stage_num,
            "stage_name": stage_name,
            "timestamp": datetime.utcnow().isoformat(),
        }

        if stage_name == "creation" and result.outputs:
            entry["concepts"] = [
                {"persona": c.persona_name, "name": c.name, "idea": c.idea[:200]}
                for c in result.outputs
            ]
        elif stage_name == "critique" and result.outputs:
            entry["critiques_count"] = len(result.outputs)
        elif stage_name == "synthesis" and result.outputs:
            entry["direction"] = result.outputs.direction_notes[:300] if result.outputs else ""

        self.state.transcript_entries.append(entry)

    async def _save_state(self):
        """Save simulation state to disk and/or database."""
        from .simulation_store import SimulationStore
        store = SimulationStore()
        await store.save_state_async(self.state)

    @classmethod
    async def resume(cls, sim_id: str) -> "GenesisSimulation":
        """Resume a simulation from saved state."""
        from .simulation_store import SimulationStore
        store = SimulationStore()
        state = store.load_state(sim_id)
        if not state:
            raise ValueError(f"Simulation {sim_id} not found")

        sim = cls(state.config)
        sim.sim_id = state.id
        sim.state = state
        return sim


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

async def _maybe_await(fn, *args):
    """Call fn with args, awaiting if it's a coroutine. Re-raises on error."""
    try:
        result = fn(*args)
        if asyncio.iscoroutine(result):
            await result
    except Exception as e:
        print(f"[SimError] _maybe_await callback error ({fn.__name__ if hasattr(fn, '__name__') else fn}): {e}")
        raise
