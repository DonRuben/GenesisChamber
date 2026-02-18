export const helpContent = {
  stages: {
    create: {
      title: 'Stage 1: CREATE',
      text: 'Each participant works independently to generate their boldest ideas. They draw on their unique perspective and expertise, informed by their soul document. No collaboration yet — pure individual creativity. Each participant produces one or more concepts with a name, headline, subhead, visual direction, and rationale.'
    },
    critique: {
      title: 'Stage 2: CRITIQUE',
      text: 'All concepts are ANONYMIZED — labeled as Concept A, B, C. Nobody knows whose concept is whose. Each participant scores and critiques every concept on a 1-10 scale, identifying strengths, weaknesses, and fatal flaws. This sacred anonymization prevents ego-protection and creates brutally honest feedback.'
    },
    synthesize: {
      title: 'Stage 3: SYNTHESIZE',
      text: 'The moderator analyzes all concepts and critiques to provide strategic direction. They decide which concepts survive, which are eliminated, and which elements should be merged. New constraints may be introduced. This is where the field narrows and quality rises.'
    },
    refine: {
      title: 'Stage 4: REFINE',
      text: 'Based on moderator feedback, each surviving participant revises their concept. They incorporate critique insights, absorb elements from eliminated concepts, and apply new constraints — while staying true to their creative vision. Concepts evolve dramatically in this stage.'
    },
    present: {
      title: 'Stage 5: PRESENT',
      text: 'Each participant pitches their refined concept to the full group. The moderator provides final reactions, identifies the strongest work, and sets strategic direction for the next round. This stage crystallizes progress and builds momentum.'
    },
  },

  rounds: {
    diverge: {
      title: 'Round 1: DIVERGE',
      text: 'Maximum creative breadth. All participants generate multiple concepts independently. No elimination — the goal is to explore the widest possible creative space. Expect 10-18 concepts.'
    },
    converge: {
      title: 'Round 2: CONVERGE',
      text: 'The field narrows. After critique and synthesis, approximately 40% of concepts are eliminated. Surviving concepts absorb the strongest elements from eliminated ones. Quality rises sharply.'
    },
    deepen: {
      title: 'Round 3: DEEPEN',
      text: 'Deep refinement. Another 50% elimination. Remaining concepts are pushed to their highest potential. Every detail matters. The moderator applies increasingly demanding standards.'
    },
    gladiator: {
      title: 'Round 4: GLADIATOR',
      text: 'Final showdown. Approximately 67% of remaining concepts are eliminated, leaving only 1-2 survivors. This is the crucible where only the most exceptional work survives.'
    },
    polish: {
      title: 'Round 5: POLISH',
      text: 'The full team collaborates on the winning concept(s). No more competition — everyone contributes their expertise to make the winner extraordinary.'
    },
    spec: {
      title: 'Round 6: SPEC',
      text: 'Production specification. The winning concept is translated into detailed production documents — visual specs, copy decks, implementation guides, and deliverable packages.'
    },
  },

  presets: {
    quick_test: {
      title: 'Quick Test',
      text: 'A fast 3-round simulation for testing ideas. Lower cost, fewer participants, faster results. Great for prototyping concepts or validating creative directions before committing to a full run.'
    },
    message_lab: {
      title: 'Message Lab',
      text: 'Focused on messaging, copy, and communication strategy. Optimized for brand voice development, taglines, campaign headlines, and narrative frameworks. Participants bring linguistic and strategic expertise.'
    },
    genesis_chamber: {
      title: 'Genesis Chamber',
      text: 'The full creative simulation — 6 rounds with quality gates, multi-stage elimination, and deep multi-persona collaboration. For serious creative development where you want the most rigorous, high-quality output possible.'
    },
    assembly_line: {
      title: 'Assembly Line',
      text: 'Production-focused workflow with emphasis on specification and deliverables. Best when you already have a concept direction and need to develop it into production-ready assets and documentation.'
    },
  },

  dashboard: {
    concepts: 'View all active and eliminated concepts. Click any concept card to expand details including headline, visual direction, and rationale. Active concepts are currently competing; eliminated concepts show what was cut and why.',
    gallery: 'Browse all concepts in a filterable grid. Filter by round to see how concepts evolved, or by status to compare winners vs. eliminated ideas side by side.',
    critiques: 'Read the anonymized peer critiques. Concepts are labeled A, B, C to preserve objectivity. Toggle "Reveal Names" to see which critic said what. Scores are averaged per concept.',
    direction: 'See the moderator\'s strategic decisions for each round — which concepts survive, which are eliminated, and the reasoning behind each decision. "One more thing" notes contain key creative insights.',
    transcript: 'Full chronological record of the entire simulation. Filter by stage type or search for specific content. The event log shows system-level events like round starts and gate triggers.',
    output: 'Generate and download simulation deliverables. Create concept visualizations with AI image generation, produce video presentations, download the reveal.js presentation deck, or export the full transcript.'
  },

  qualityGate: {
    title: 'Quality Gate',
    text: 'The simulation pauses here for your review as the human decision-maker. Review the concepts, critiques, and moderator direction above. Approve to continue with the current trajectory, or Redirect with notes to steer the next round in a different direction. You are the human in the loop — the simulation proposes, you decide.'
  },

  elimination: {
    title: 'Elimination Schedule',
    text: 'After each round, weaker concepts are eliminated to raise quality. Round 1: 0% (pure divergence). Round 2: ~40% cut. Round 3: ~50% cut. Round 4 (Gladiator): ~67% cut, leaving only 1-2 survivors. Eliminated concepts\' best elements are absorbed by survivors.'
  },

  launcher: {
    type: 'Choose a simulation preset that matches your creative goal. Each preset configures the number of rounds, stages, elimination schedule, and quality gates differently.',
    participants: 'Select which AI personas participate. Each has a unique personality, expertise, and creative approach loaded from their soul document — a 40-60KB consciousness profile. Steve Jobs always serves as moderator.',
    brief: 'Describe the creative challenge. Be specific about goals, audience, constraints, and desired outcomes. The brief shapes every participant\'s creative output. If left empty, a default brief will be used.'
  },

  council: {
    title: 'LLM Council Mode',
    text: 'The original council mode — ask a question and receive responses from multiple AI models. Stage 1 collects individual responses, Stage 2 has models anonymously rank each other, Stage 3 synthesizes a final answer from the chairman model.'
  },
};
