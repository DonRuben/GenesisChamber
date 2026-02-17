"""Soul Engine — loads, parses, and compiles soul documents into system prompts."""

import re
from pathlib import Path
from typing import Dict, List, Optional


# Stage prompt templates (from genesis-chamber-builder/docs/PROMPT-ENGINEERING.md)
ROUND_INSTRUCTIONS = {
    1: 'Go wide. Be bold. I want your most ambitious, original thinking. Don\'t play it safe. Give me something that would make your competitors nervous.',
    2: 'You\'ve seen the critique. Evolve. You can merge, abandon, or double down. Show me you listened but didn\'t lose your vision.',
    3: 'This needs to be real now. Full execution. Every detail matters. I need to be able to build this tomorrow.',
    4: 'Defend your work. Why THIS one? Make me believe.',
    5: 'Polish. Refine. Every word, every pixel, every detail. This is the final version.',
    6: 'Production specification. Every deliverable, every asset, every detail needed to build this.',
}

STAGE_TASKS = {
    1: """Create {num_concepts} distinct concept(s) for this brief. Each concept must include:

FORMAT YOUR RESPONSE AS:

===CONCEPT_START===
NAME: [concept name]
TAGLINE: [one line tagline]
IDEA: [core idea, 2-3 sentences]
HEADLINE: [primary headline]
SUBHEAD: [supporting line]
BODY_COPY: [3-5 lines of supporting text]
VISUAL_DIRECTION: [visual direction description, 50-100 words]
COLOR_MOOD: [primary colors and emotional tone]
RATIONALE: [why this works, in your voice, 2-3 sentences]
IMAGE_PROMPT: [detailed prompt for image generation, 1 paragraph]
VIDEO_PROMPT: [video scene description, 1 paragraph]
EVOLUTION_NOTES: [what changed from last round, if applicable]
===CONCEPT_END===""",

    2: """You will review {num_concepts} anonymized concepts (labeled Concept A through {last_label}).
For EACH concept, provide your critique in this format:

===CRITIQUE_START===
CONCEPT: [Concept letter]
SCORE: [1-10]
STRENGTHS:
- [strength 1]
- [strength 2]
- [strength 3]
WEAKNESSES:
- [weakness 1]
- [weakness 2]
FATAL_FLAW: [the one thing that could kill this concept, or NONE]
ONE_CHANGE: [if you could change one thing]
WOULD_YOU_CHAMPION_THIS: [yes/no and why]
===CRITIQUE_END===

IMPORTANT:
- You do NOT know whose concept is whose
- One of these may be YOUR concept — critique it as honestly as the others
- Judge by YOUR standards
- Do not be diplomatic. Be honest. The brief deserves honesty.
- Use your voice. Critique the way you would critique.""",

    3: """You have {num_concepts} concepts from {num_participants} participants.
You have anonymous critiques from every participant.
You have aggregate scores.

ANALYZE:
1. Which concepts have genuine originality? (Not just "different" — truly NEW)
2. Which concepts would actually WORK for the target audience?
3. Where is there hidden consensus? (Multiple critics praised the same element)
4. Where is there productive disagreement? (Split opinions often mean something interesting)
5. CONSENSUS CHECK: If all critics agree on something, challenge it. Unanimous praise often hides groupthink — probe what everyone might be missing. If every critic hates the same concept, ask whether they're rejecting what's merely uncomfortable vs. what's truly bad. The best ideas often split the room.

OUTPUT your direction in this format:

===DIRECTION_START===
SURVIVING:
- [concept name]: [why it survives]
ELIMINATED:
- [concept name]: [why it dies]
MERGE_OPPORTUNITIES:
- Take [element] from [eliminated concept] → add to [surviving concept]
NEW_CONSTRAINTS:
- [constraint 1]
- [constraint 2]
DIRECTION: [paragraph setting the direction for next round]
ONE_MORE_THING: [surprise requirement, or NONE]
===DIRECTION_END===""",

    4: """MODERATOR FEEDBACK FROM STAGE 3:
{moderator_direction}

YOUR CONCEPT'S CRITIQUE SCORES:
{critique_data}

Revise your concept based on the feedback. You may:
- EVOLVE: Keep your concept but address weaknesses
- MERGE: Incorporate elements from other concepts
- PIVOT: Abandon your concept and champion a surviving one
- DEFEND: Keep unchanged IF you can refute the criticism

Show your work. Explain what you changed and why.

Format your response as:
===CONCEPT_START===
NAME: [concept name]
TAGLINE: [one line tagline]
IDEA: [core idea, 2-3 sentences]
HEADLINE: [primary headline]
SUBHEAD: [supporting line]
BODY_COPY: [3-5 lines of supporting text]
VISUAL_DIRECTION: [visual direction description, 50-100 words]
RATIONALE: [why this works, in your voice]
IMAGE_PROMPT: [detailed prompt for image generation]
VIDEO_PROMPT: [video scene description]
EVOLUTION_NOTES: [what changed from last round and why]
===CONCEPT_END===""",

    5: """Present your refined concept to the group. This is your pitch.

Format your response as:
===PRESENTATION_START===
CONCEPT: [concept name]
ONE_SENTENCE: [the entire concept in one sentence]
EVOLUTION: [what changed from last round and why, 2-3 sentences]
HEADLINE: [final headline]
SUBHEAD: [final subhead]
HERO_COPY: [4-6 lines]
VISUAL: [detailed visual description]
USE_CASE_1: [how this works in scenario 1]
USE_CASE_2: [how this works in scenario 2]
WHY_THIS_WINS: [closing argument in your voice]
===PRESENTATION_END==="""
}

MODERATOR_ROUND_INSTRUCTIONS = {
    1: 'Keep the top 60%. Kill the bottom 40%. Be generous — it\'s early. But flag anything that feels derivative or safe.',
    2: 'Narrow to top 3-4. Start getting aggressive. If it doesn\'t make you feel something, it doesn\'t survive.',
    3: 'Top 3 only. These should be genuinely different approaches, not variations on a theme.',
    4: 'Pick the winner. Pick a runner-up. Explain why the winner is THE one. Be definitive. Don\'t hedge.',
    5: 'The whole team works on the winner now. Your job is to push for "one more level." Insanely great, not just great.',
    6: 'Final specification. Every deliverable locked. Production-ready.',
}


class SoulEngine:
    """Loads, parses, and compiles soul documents into system prompts."""

    def __init__(self, soul_dir: str = "souls/"):
        self.soul_dir = Path(soul_dir)
        self.loaded_souls: Dict[str, dict] = {}

    def load_soul(self, persona_id: str, soul_path: str) -> dict:
        """Load and parse a soul document into its 7 layers."""
        path = Path(soul_path)
        if not path.is_absolute():
            path = self.soul_dir / path.name if not str(soul_path).startswith("souls/") else Path(soul_path)

        if not path.exists():
            print(f"Warning: Soul document not found at {path}, using empty soul")
            soul = {"full": "", "cognitive": "", "emotional": "", "behavioral": "",
                    "calibration": "", "key_works": "", "quotes": [], "instructions": ""}
            self.loaded_souls[persona_id] = soul
            return soul

        raw = path.read_text(encoding="utf-8")
        soul = {
            "full": raw,
            "cognitive": self._extract_section(raw, "COGNITIVE LAYER"),
            "emotional": self._extract_section(raw, "EMOTIONAL LAYER"),
            "behavioral": self._extract_section(raw, "BEHAVIORAL LAYER"),
            "calibration": self._extract_section(raw, "PROJECT CALIBRATION"),
            "key_works": self._extract_section(raw, "KEY WORKS"),
            "quotes": self._extract_quotes(raw),
            "instructions": self._extract_section(raw, "SIMULATION INSTRUCTIONS"),
        }
        self.loaded_souls[persona_id] = soul
        return soul

    def compile_system_prompt(
        self,
        persona_id: str,
        persona_name: str,
        stage: int,
        round_num: int,
        brief: str,
        context: str = "",
        full_injection: bool = True
    ) -> str:
        """Build the system prompt from soul layers + stage template + round instructions."""
        soul = self.loaded_souls.get(persona_id, {})

        if full_injection and soul.get("full"):
            return self._build_full_prompt(soul, persona_name, stage, round_num, brief, context)
        else:
            return self._build_compiled_prompt(soul, persona_name, stage, round_num, brief, context)

    def compile_moderator_prompt(
        self,
        persona_id: str,
        persona_name: str,
        round_num: int,
        brief: str,
        context: str = ""
    ) -> str:
        """Build the moderator's system prompt for Stage 3."""
        soul = self.loaded_souls.get(persona_id, {})
        soul_text = soul.get("full", "")

        round_instruction = MODERATOR_ROUND_INSTRUCTIONS.get(round_num, MODERATOR_ROUND_INSTRUCTIONS[4])

        prompt = f"""You are {persona_name}.

{soul_text}

PROJECT BRIEF:
{brief}

{f'BRAND CONTEXT: {context}' if context else ''}

YOUR JOB IN THIS ROUND:
{round_instruction}

{STAGE_TASKS[3]}"""
        return prompt

    def _build_full_prompt(self, soul, persona_name, stage, round_num, brief, context):
        """Full soul injection for large-context models (200K+)."""
        round_instruction = ROUND_INSTRUCTIONS.get(round_num, ROUND_INSTRUCTIONS[4])
        task = STAGE_TASKS.get(stage, "")

        prompt = f"""You are {persona_name}.

{soul['full']}

PROJECT BRIEF:
{brief}

{f'BRAND CONTEXT: {context}' if context else ''}

ROUND {round_num} INSTRUCTION:
{round_instruction}

TASK:
{task}

Stay completely in character. Think as {persona_name} would think.
Do not reference being an AI. Do not break character.
Your output should sound like {persona_name} wrote it — use their vocabulary, their sentence structure, their rhythm."""
        return prompt

    def _build_compiled_prompt(self, soul, persona_name, stage, round_num, brief, context):
        """Compressed ~3500 token prompt for smaller models."""
        round_instruction = ROUND_INSTRUCTIONS.get(round_num, ROUND_INSTRUCTIONS[4])
        task = STAGE_TASKS.get(stage, "")

        # Extract essentials
        quotes_block = ""
        if soul.get("quotes"):
            selected = soul["quotes"][:7]
            joined = "\n".join(f'> "{q}"' for q in selected)
            quotes_block = f"QUOTES THAT DEFINE YOU:\n{joined}"

        context_block = f"BRAND CONTEXT: {context}" if context else ""

        calibration = soul.get("calibration", "")[:1000] if soul.get("calibration") else ""
        calibration_block = f"YOUR ANGLE ON THIS PROJECT:\n{calibration}" if calibration else ""

        prompt = f"""You are {persona_name}.

IDENTITY:
{soul.get('cognitive', '')[:2000]}

VOICE:
{soul.get('behavioral', '')[:1500]}

{quotes_block}

PROJECT BRIEF:
{brief}

{context_block}

{calibration_block}

ROUND {round_num} INSTRUCTION:
{round_instruction}

TASK:
{task}

Stay completely in character. Think as {persona_name} would think.
Do not reference being an AI. Do not break character."""
        return prompt

    def _extract_section(self, text: str, header: str) -> str:
        """Extract a named section from markdown (between ## headers).

        Handles formats:
        - "## 1. COGNITIVE LAYER: How Ogilvy Thinks (Expanded)"
        - "## SECTION 1: COGNITIVE LAYER — THE ARCHITECTURE..."
        - "## SECTION 1: COGNITIVE LAYER"
        """
        # Format 1: "## 1. HEADER: subtitle"
        pattern = rf'##\s+\d+\.?\s*{re.escape(header)}[^\n]*\n(.*?)(?=\n##\s|\Z)'
        match = re.search(pattern, text, re.DOTALL | re.IGNORECASE)
        if match:
            return match.group(1).strip()

        # Format 2: "## SECTION N: HEADER — subtitle"
        pattern = rf'##\s+SECTION\s+\d+[:\s]+{re.escape(header)}[^\n]*\n(.*?)(?=\n##\s|\Z)'
        match = re.search(pattern, text, re.DOTALL | re.IGNORECASE)
        if match:
            return match.group(1).strip()

        # Fallback: any heading containing the header text
        pattern = rf'#+\s*.*?{re.escape(header)}.*?\n(.*?)(?=\n##\s|\Z)'
        match = re.search(pattern, text, re.DOTALL | re.IGNORECASE)
        return match.group(1).strip() if match else ""

    def _extract_quotes(self, text: str) -> List[str]:
        """Extract quotes from the quotes section."""
        quotes_section = self._extract_section(text, "QUOTES LIBRARY")
        if not quotes_section:
            quotes_section = self._extract_section(text, "QUOTES")
        if not quotes_section:
            quotes_section = text

        # Try multiple quote formats in priority order:
        # 1. Blockquoted: > "quote" or > **"quote"**
        quotes = re.findall(r'>\s*\*{0,2}"([^"]+)"\*{0,2}', quotes_section)
        if not quotes:
            # 2. Bold quoted: **"quote"**
            quotes = re.findall(r'\*{2}"([^"]+)"\*{2}', quotes_section)
        if not quotes:
            # 3. Standalone quoted lines (min 20 chars)
            quotes = re.findall(r'^"([^"]{20,})"', quotes_section, re.MULTILINE)
        if not quotes:
            # 4. Curly quotes
            quotes = re.findall(r'["\u201c]([^"\u201d]{20,})["\u201d]', quotes_section)
        return quotes
