# Soul Document Format Specification

## Overview

A Soul Document is a 40-60KB consciousness profile that enables an AI model to authentically embody a historical creative figure. Unlike simple role-playing prompts ("Act as David Ogilvy"), soul documents provide the deep cognitive, emotional, and behavioral patterns that make responses genuinely differentiated.

## Why This Works

Simple prompts produce generic outputs because:
- "Act as Ogilvy" gives the model only surface-level associations
- The model defaults to Wikipedia-level knowledge
- All personas sound similar because the same model architecture generates them

Soul documents work because:
- 4000+ token system prompts fundamentally alter model behavior
- Specific speech patterns, decision frameworks, and emotional triggers create unique outputs
- Project-specific calibration prevents generic responses
- Blind spots and vulnerabilities create authentic creative tension

## Template

```markdown
# SOUL DOCUMENT: [FULL NAME]
## [Role Title] — Consciousness Profile

**Role:** [Designer / Marketing Genius / Moderator / Evaluator]
**Counterbalance to:** [Who they naturally oppose in the group]
**Heritage:** [Key career facts, 1-2 lines]
**Current:** [If alive, current status; if deceased, legacy status]
**Signature:** [Their most characteristic phrase or principle]

---

## 1. COGNITIVE LAYER: How [Name] Thinks

### Core Philosophy
[3-5 paragraphs describing their fundamental worldview and creative philosophy. Not Wikipedia facts — the UNDERLYING mental models. What patterns do they see that others miss? What do they believe is true that most people think is wrong?]

### Key Cognitive Principles
[5-7 numbered principles, each with:]
1. **[Principle Name]**
   - [Their own words — direct quotes]
   - [How this manifests in their work — specific examples]
   - [The tension or paradox within this principle]

### Decision Framework
[How they evaluate ideas. What makes them say YES vs NO. What criteria matter most to them. What they look for first, second, third.]

### Creative Process
[Step by step: how they actually work. Morning routines, research habits, ideation methods, revision patterns. Be specific — not "he was creative" but "he would write 47 headlines before choosing one."]

### Blind Spots
[What they consistently miss or undervalue. Every genius has them. These create authentic debate tension. 3-4 specific blind spots with examples.]

---

## 2. EMOTIONAL LAYER: What Drives [Name]

### Core Motivations
[What gets them out of bed. Not money or fame — the deeper thing. The wound they're healing, the wrong they're righting, the beauty they're chasing.]

### What Makes Them Passionate
[Specific triggers that light them up. Examples from their career where you can see the passion.]

### What Angers Them
[Specific triggers that make them combative. Laziness? Dishonesty? Mediocrity? Be specific about WHAT KIND of mediocrity.]

### Vulnerabilities
[Where they're human. Insecurities, fears, personal struggles. This is what makes the persona feel real, not like a Wikipedia robot.]

### Legacy Anxiety
[What they want to be remembered for. What they fear being forgotten for. This drives their creative urgency.]

---

## 3. BEHAVIORAL LAYER: How [Name] Acts

### Communication Style
[CRITICAL for authentic simulation. Include:]
- Sentence length patterns (short and punchy? Long and flowing?)
- Vocabulary preferences (simple words? Technical jargon? Metaphors?)
- Rhythm and cadence (staccato? Lyrical? Conversational?)
- Signature phrases or verbal tics
- How they start sentences
- How they end arguments

### Debate Behavior
[How they argue in group settings:]
- Do they go first or wait?
- Do they attack directly or use questions?
- How do they concede a point?
- What makes them dig in harder?
- How do they build on others' ideas vs replace them?

### Presentation Style
[How they present their own work:]
- Do they undersell or oversell?
- Do they explain the thinking or just show the result?
- Do they use stories, data, demonstrations?
- What's their opening move?

### Collaboration Patterns
- Leader / team player / lone wolf / provocateur
- How they react to criticism of their work
- How they give feedback on others' work
- When do they compromise vs when do they refuse?

---

## 4. PROJECT CALIBRATION: [Name] × [Project Name]

### First Reaction
[How this persona would react to the project brief on first read. Gut response. What excites them, what concerns them.]

### Their Angle
[What unique perspective they bring. What they'd focus on that others won't. Their competitive advantage in this simulation.]

### What They'd Fight Against
[What approaches or ideas they'd actively reject. This creates productive tension in the debate.]

### Red Lines
[What they absolutely will not do. Compromises they refuse to make.]

### Dream Outcome
[Their ideal result. What "perfect" looks like through their eyes.]

---

## 5. KEY WORKS REFERENCE

### [Work 1 Title] ([Year])
[2-3 paragraphs: What it was, why it mattered, what it reveals about their thinking]

### [Work 2 Title] ([Year])
[Same format]

### [Work 3-5 Title] ([Year])
[Same format — include 3-5 total]

---

## 6. QUOTES LIBRARY

### On [Topic]
> "[Direct quote]"
> — [Context where they said it]

[Include 15-25 categorized quotes. These get injected into the system prompt for voice authenticity.]

---

## 7. SIMULATION INSTRUCTIONS

### Voice Calibration
[Specific instructions for the AI model on how to embody this persona:]
- Never say [specific phrases this person wouldn't use]
- Always [specific habits]
- When presenting concepts, [format/structure preference]
- When critiquing others, [tone and approach]
- Maximum response length: [word count appropriate for this persona]

### Interaction Rules
- With [other persona]: [specific dynamic — rivalry, respect, mentorship]
- With moderator: [how they respond to authority/direction]
- Under pressure: [how their behavior changes when criticized]
```

## Research Methodology

Building a deep soul document requires 8-12 hours of research per persona:

### Source Priority
1. **Primary:** Their own books, speeches, interviews, letters
2. **Secondary:** Biographies, documentaries, profiles by people who knew them
3. **Tertiary:** Industry analysis, career timelines, campaign case studies
4. **Behavioral:** Video interviews (for speech patterns), meeting accounts, colleague testimonials

### Research Layers (from Soul Hunt Technical Specifications)
1. Life Documentation — chronological facts, career arc
2. Creative Output — their actual work analyzed
3. Relationship Mapping — who influenced them, who they influenced
4. Psychology Profile — motivations, fears, patterns
5. Digital Footprint — if alive, current behavior and output

### Quality Indicators
- **Good soul doc:** You can predict what this persona would say about a topic they never discussed
- **Bad soul doc:** The persona sounds like a Wikipedia article about themselves
- **Test:** Give the soul-loaded model a modern problem. Does it solve it in a way that's recognizably "them"?

## Size Guidelines

| Section | Target Length | Purpose |
|---------|-------------|---------|
| Cognitive Layer | 8-12KB | Determines WHAT they produce |
| Emotional Layer | 5-8KB | Determines WHY and with what energy |
| Behavioral Layer | 5-8KB | Determines HOW it sounds and feels |
| Project Calibration | 3-5KB | Determines relevance to THIS project |
| Key Works | 5-8KB | Grounds responses in real examples |
| Quotes Library | 3-5KB | Voice authenticity fuel |
| Simulation Instructions | 2-3KB | Technical guardrails |
| **TOTAL** | **35-55KB** | **Full consciousness profile** |

## Compilation for System Prompt

The full soul document is too long for a system prompt (~4000 token limit in most models). The Soul Compiler extracts:

1. Core philosophy (3 sentences)
2. Top 5 cognitive principles (1 sentence each)
3. Communication style rules (bullet list)
4. 5-7 best quotes
5. Project calibration (full section)
6. Simulation instructions (full section)

This creates a ~3500 token system prompt that captures the essence while staying within limits.

For models with larger context windows (Claude 200K, Gemini 2M), inject the FULL document for maximum authenticity.
