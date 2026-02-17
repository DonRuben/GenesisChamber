# GENESIS CHAMBER — Standalone Multi-AI Simulation Engine

## What This Is

A framework for building an interactive multi-persona AI debate/creation tool based on [karpathy/llm-council](https://github.com/karpathy/llm-council). The Genesis Chamber extends the 3-stage council mechanism into a full creative simulation engine with deep persona consciousness, iterative refinement, and production-ready output generation.

## Architecture Overview

```
┌─────────────────────────────────────────────────┐
│                 GENESIS CHAMBER                  │
├─────────────────────────────────────────────────┤
│                                                  │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐    │
│  │  SOUL    │   │ COUNCIL  │   │ OUTPUT   │    │
│  │  ENGINE  │──▶│  ENGINE  │──▶│ ENGINE   │    │
│  └──────────┘   └──────────┘   └──────────┘    │
│       │              │              │            │
│  Load persona   Run debate    Generate           │
│  profiles +     + critique    presentations,     │
│  calibrate to   + synthesis   images, scripts    │
│  brief                                           │
│                                                  │
├─────────────────────────────────────────────────┤
│  INPUTS:          │  OUTPUTS:                    │
│  • Soul Documents │  • Simulation Transcript     │
│  • Project Brief  │  • Per-Persona Presentations │
│  • Brand Context  │  • Winner Deep Dive          │
│  • Round Config   │  • Image Prompts             │
│                   │  • Video Scripts              │
│                   │  • Production Package         │
└─────────────────────────────────────────────────┘
```

## Folder Structure

```
genesis-chamber-builder/
├── README.md                    ← You are here
├── docs/
│   ├── ARCHITECTURE.md          ← Full technical architecture
│   ├── SOUL-FORMAT.md           ← How to write soul documents
│   ├── SIMULATION-PROTOCOL.md   ← Round-by-round simulation rules
│   ├── PROMPT-ENGINEERING.md    ← System prompt templates
│   └── INTEGRATION-GUIDE.md     ← How to connect image/video/voice APIs
├── souls/
│   ├── examples/                ← Excerpted soul doc examples
│   │   ├── soul-template.md     ← Blank template
│   │   └── soul-example-ogilvy-excerpt.md
│   └── README.md                ← Soul document creation guide
├── config/
│   ├── council-config.example.json
│   ├── simulation-presets.json
│   └── model-roster.json
├── prompts/
│   ├── stage1-independent.md    ← Stage 1 system prompts
│   ├── stage2-critique.md       ← Stage 2 blind critique prompts
│   ├── stage3-synthesis.md      ← Stage 3 chairman prompts
│   ├── calibration.md           ← Project-specific calibration prompt
│   └── output-format.md         ← Structured output templates
└── architecture/
    ├── flow-diagram.md          ← Mermaid diagrams
    ├── state-machine.md         ← Round state management
    └── llm-council-delta.md     ← What to change in the fork
```

## Quick Start

1. Fork `karpathy/llm-council`
2. Read `docs/ARCHITECTURE.md` for the full picture
3. Read `architecture/llm-council-delta.md` for exact modifications
4. Create soul documents using `souls/examples/soul-template.md`
5. Configure simulation in `config/`
6. Run simulation

## Key Concept: Soul Documents

Unlike llm-council which uses raw model outputs, the Genesis Chamber gives each AI participant a deep consciousness profile (40-60KB per persona) covering:

- **Cognitive Layer** — How they think, decide, evaluate
- **Emotional Layer** — What drives them, what angers them, their vulnerabilities
- **Behavioral Layer** — How they speak, their habits, their rituals
- **Project Calibration** — How this specific persona would approach the current brief

This creates dramatically different and authentic responses compared to simple role-playing prompts.

## Key Concept: Two-Stage Simulation

The Genesis Chamber supports chained simulations where the output of one feeds into the next:

```
SIM A (Strategy)          SIM B (Execution)
┌──────────────┐         ┌──────────────┐
│ Marketing    │────────▶│ Designers    │
│ Geniuses     │ Output  │ + Creative   │
│ + Moderator  │ Brief   │ Directors    │
└──────────────┘         └──────────────┘
│ Defines MESSAGE        │ Defines VISUAL
│ Defines STORY          │ Defines SYSTEM
│ Defines AUDIENCE       │ Defines ASSETS
```

## License

Built on top of [karpathy/llm-council](https://github.com/karpathy/llm-council). Internal use.
