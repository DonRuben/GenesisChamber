# Simulation Protocol — Round-by-Round Rules

## Overview

The Genesis Chamber runs iterative simulation rounds. Each round has 5 stages. The number of rounds depends on the simulation type and complexity of the brief.

## Simulation Types

### Type A: Strategy Simulation ("The Message Lab")
- **Purpose:** Define messaging, positioning, audience approach
- **Participants:** Marketing strategists + moderator
- **Rounds:** 5-7 (recommended: 6)
- **Output:** Message Blueprint (core message, proof points, emotional hooks, audience language)

### Type B: Creative Simulation ("The Genesis Chamber")
- **Purpose:** Visualize, brand, design the output of Type A
- **Participants:** Designers + creative directors + moderator + evaluator
- **Rounds:** 6-9 (recommended: 8)
- **Output:** Visual System (logo concepts, color systems, typography, imagery direction, component library)

### Type C: Production Simulation ("The Assembly Line")
- **Purpose:** Generate production-ready assets from Type B output
- **Participants:** Copywriters + art directors + video directors
- **Rounds:** 4-6 (recommended: 5)
- **Output:** Campaign assets (ads, videos, presentations, scripts)

### Chaining
Type A → Type B → Type C is the full pipeline. Each simulation's output becomes the next simulation's brief.

## Round Structure (5 Stages)

### Stage 1: CREATION (Independent)
```
Duration: Longest stage
Input: Brief + previous round context (if not Round 1)
Process: Each participant works independently
Output: 1-3 concepts per participant (Round 1) or 1 refined concept (Round 2+)
Rules:
  - NO access to other participants' work
  - Soul document fully loaded
  - Must address brief requirements
  - Must include: concept name, core idea, execution sketch, rationale
```

### Stage 2: CRITIQUE (Anonymized)
```
Duration: Medium
Input: All Stage 1 outputs, anonymized (Concept A, B, C...)
Process: Each participant critiques ALL concepts (including their own, unknowingly)
Output: Per-concept scores + qualitative feedback
Rules:
  - Concepts labeled "Concept A", "Concept B" etc. — NO names attached
  - Each participant must critique every concept
  - Critique format: Score (1-10) + Strengths + Weaknesses + Specific Suggestions
  - Participants don't know which concept is theirs
  - This prevents ego-protection and creates honest feedback
```

### Stage 3: SYNTHESIS (Moderator)
```
Duration: Medium
Input: All Stage 1 concepts + all Stage 2 critiques + aggregate scores
Process: Moderator (e.g., Steve Jobs) analyzes everything
Output: Direction document
Rules:
  - Moderator identifies consensus AND dissent
  - Moderator can: merge concepts, eliminate concepts, set new constraints
  - Moderator must explain WHY (this becomes the transcript gold)
  - Evaluator (e.g., Jony Ive) adds craft assessment
  - Round 1: Identify top 3-4 directions
  - Round 2: Narrow to 2-3
  - Round 3+: Narrow to 1-2, then polish winner
```

### Stage 4: REFINEMENT (Directed)
```
Duration: Short-Medium
Input: Moderator's Stage 3 directions
Process: Each participant revises their concept based on critique + direction
Output: Refined concept
Rules:
  - Participants CAN adopt elements from other concepts
  - Participants CAN merge their concept with another
  - Participants CAN abandon their concept and champion another
  - Participants MUST respond to the moderator's specific notes
  - Eliminated concepts: those participants join another concept as collaborator
```

### Stage 5: PRESENTATION (Group)
```
Duration: Short
Input: All Stage 4 refined concepts
Process: Each participant presents their refined work to the group
Output: Presentation + brief response from moderator
Rules:
  - Presentation must include: concept name, evolution from last round, key visual/verbal direction
  - Moderator gives immediate reaction (max 3 sentences)
  - This sets up the NEXT round's Stage 1
  - In final round: this IS the final output
```

## Round Progression Rules

### Round 1: MAXIMUM DIVERGENCE
- Goal: Generate the widest possible creative range
- Moderator instruction: "Don't narrow too early. Let everything breathe."
- Each participant creates 2-3 concepts minimum
- Expected output: 10-18 initial concepts (from 5-6 participants)
- NO elimination in this round

### Round 2: INFORMED CONVERGENCE
- Goal: React to critique, start finding the strongest directions
- Moderator instruction: "Pick the top 60%. Kill your darlings."
- Each participant presents 1 concept (can be evolved, merged, or new)
- Moderator eliminates bottom 40% of directions
- Expected output: 5-8 surviving concepts

### Round 3: DEEP DEVELOPMENT
- Goal: Take surviving concepts to near-production quality
- Moderator instruction: "This needs to be real. Details matter."
- Full treatment required: name, tagline, visual system, copy, use cases
- Moderator picks top 3
- Expected output: 3 fully developed concepts

### Round 4: THE GLADIATOR ROUND
- Goal: Final battle between top 3
- Moderator instruction: "Defend your work. Why THIS one?"
- Each concept gets a full presentation defense
- Moderator + Evaluator pick winner + runner-up
- Expected output: 1 winner, 1 runner-up

### Round 5: POLISH (Winner Only)
- Goal: Entire team refines the winner
- All participants collaborate on the winning direction
- Focus: execution details, edge cases, production specs
- Expected output: Production-ready specification

### Round 6: PRODUCTION SPEC (Optional)
- Goal: Generate all production deliverables
- Output: Image prompts, video scripts, copy variations, slide deck content
- This is where the Output Engine takes over

## Quality Gates

After each simulation, the user reviews and approves before the next simulation begins:

```
GATE 1: After Sim A Round 3 (Message shortlist)
  → User approves top 3 message directions before deeper work

GATE 2: After Sim A Final (Message Blueprint)
  → User approves the winning message before it goes to Sim B

GATE 3: After Sim B Round 4 (Design shortlist)
  → User approves top 3 visual directions before final selection

GATE 4: After Sim B Final (Visual System)
  → User approves everything before production begins
```

## Moderator Behavior Rules

### Steve Jobs (Lead Moderator)
- Pushes for "insanely great" — rejects "good enough"
- Uses silence strategically — long pauses before judgment
- Asks "Why?" repeatedly — forces participants to defend deeply
- Can call for "one more thing" — surprise additional requirements
- Kills ideas with: "That's shit. Here's why." (direct, no softening)
- Praises ideas with: very rare, very specific ("The typography on that is exactly right.")

### Jony Ive (Evaluator)
- Never proposes concepts — only evaluates craft quality
- Focuses on: intentionality, material truth, emotional resonance
- Questions: "But is it considered?" / "What does this communicate about care?"
- Speaks quietly, slowly, with precision
- Can veto on craft grounds: "This isn't finished. It needs more time."

## Output Formats

### Concept Output (per participant, per round)
```json
{
  "persona": "David Ogilvy",
  "round": 2,
  "concept_name": "The Proof Machine",
  "core_idea": "...",
  "headline": "...",
  "visual_direction": "...",
  "key_copy": "...",
  "rationale": "...",
  "evolution_notes": "Changed from Round 1 because..."
}
```

### Critique Output (per participant, per concept)
```json
{
  "critic": "Leo Burnett",
  "concept_id": "Concept_C",
  "score": 8,
  "strengths": ["...", "..."],
  "weaknesses": ["...", "..."],
  "suggestions": ["...", "..."]
}
```

### Moderator Direction (per round)
```json
{
  "moderator": "Steve Jobs",
  "round": 2,
  "surviving_concepts": ["concept_1", "concept_4", "concept_7"],
  "eliminated": ["concept_2", "concept_3", "concept_5", "concept_6"],
  "merge_suggestions": [{"from": "concept_2", "elements": "...", "into": "concept_4"}],
  "new_constraints": ["Must work in 5 seconds on mobile", "No jargon"],
  "direction_notes": "..."
}
```
