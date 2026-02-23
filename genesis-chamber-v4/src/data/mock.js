// ─────────────────────────────────────────────────────────
// GENESIS CHAMBER V4 — MOCK DATA
// Development data for all modes
// ─────────────────────────────────────────────────────────

import { T } from '../design/tokens';

// ── Sidebar Conversations ──
export const CONVERSATIONS = [
  { id: 'c1', title: 'Brand strategy for AquaLux premium water launch', mode: 'genesis', updated: '2 min ago', status: 'complete' },
  { id: 'c2', title: 'Compare React vs Svelte for dashboard rebuild', mode: 'council', updated: '1 hr ago', status: 'complete' },
  { id: 'c3', title: 'AI ethics framework for healthcare deployment', mode: 'council', updated: '3 hr ago', status: 'complete' },
  { id: 'c4', title: 'Genesis simulation: Luxury EV brand positioning', mode: 'genesis', updated: 'Yesterday', status: 'complete' },
  { id: 'c5', title: 'Evaluate NEXORA tokenization pitch angles', mode: 'council', updated: 'Yesterday', status: 'complete' },
  { id: 'c6', title: 'Monetec solar investor deck messaging', mode: 'genesis', updated: '2 days ago', status: 'complete' },
];

// ── Landing — Recent Simulations ──
export const RECENT_SIMS = [
  { title: 'Premium Headphone Brand', mode: 'council', date: '2h ago', models: '5 models', status: 'complete' },
  { title: 'Luxury Watch Campaign', mode: 'council', date: '1d ago', models: '4 models', status: 'complete' },
  { title: 'Quick Brand Check — EV Charging', mode: 'genesis', date: '3d ago', models: '3 models', status: 'complete' },
];

// ── LLM Council Models ──
export const MODELS = [
  { id: 'openai/gpt-5.2', name: 'GPT-5.2', color: '#34D399', letter: 'G' },
  { id: 'google/gemini-3.1-pro-preview', name: 'Gemini 3.1 Pro', color: '#00D9FF', letter: 'Gm' },
  { id: 'anthropic/claude-sonnet-4.6', name: 'Claude Sonnet 4.6', color: '#F27123', letter: 'C' },
  { id: 'x-ai/grok-4.1-fast', name: 'Grok 4.1', color: '#E5375E', letter: 'Gk' },
];

// ── Model lookup map ──
export const MODEL_MAP = Object.fromEntries(MODELS.map(m => [m.id, m]));

// ── LLM Council Presets ──
export const PRESETS = [
  { key: 'compare', label: 'Compare', desc: 'Trade-offs between two approaches', color: T.cyan, placeholder: 'Compare X vs Y for...' },
  { key: 'analyze', label: 'Analyze', desc: 'Deep analysis of a strategy or concept', color: T.flame, placeholder: 'Analyze the implications of...' },
  { key: 'brainstorm', label: 'Brainstorm', desc: 'Generate creative ideas for a challenge', color: T.gold, placeholder: 'Generate ideas for...' },
  { key: 'evaluate', label: 'Evaluate', desc: 'Assess strengths and weaknesses', color: T.green, placeholder: 'Evaluate the effectiveness of...' },
  { key: 'debate', label: 'Debate', desc: 'Models argue opposing perspectives', color: T.magenta, placeholder: 'Debate whether...' },
];

// ── LLM Council Mock Responses ──
export const MOCK_RESPONSES = [
  { modelId: 'anthropic/claude-sonnet-4.6', text: "The key differentiator lies in the execution model. React's virtual DOM reconciliation is well-understood and battle-tested, but Svelte's compile-time approach eliminates the runtime overhead entirely. For a dashboard with frequent state updates, Svelte's surgical DOM updates yield measurably better frame rates. However, React's ecosystem depth — particularly for complex data visualization with D3 integration — remains unmatched. My recommendation: Svelte for greenfield dashboards under 50 components; React for enterprise-scale with heavy charting requirements.", score: 88 },
  { modelId: 'openai/gpt-5.2', text: "From a developer experience standpoint, Svelte reduces boilerplate by approximately 40% compared to React for equivalent functionality. The reactive declarations ($:) replace useState/useEffect patterns with more intuitive syntax. But the trade-off is significant: React's job market is 10× larger, component libraries like shadcn/ui have no Svelte equivalent at the same quality tier, and React Server Components offer a server-first paradigm Svelte hasn't matched. For your dashboard rebuild: if the team knows React, stay with React. The productivity gains from Svelte don't offset the migration cost and ecosystem gap.", score: 82 },
  { modelId: 'google/gemini-3.1-pro-preview', text: "The performance benchmarks tell a clear story: Svelte outperforms React by 2-3× in initial render and 1.5× in updates for typical dashboard patterns. But benchmarks aren't production. In real-world dashboards, the bottleneck is rarely the framework — it's data fetching, chart rendering, and WebSocket management. Both frameworks handle these comparably. The deciding factor should be team velocity: which framework lets your specific team ship quality code faster? That's an organizational question, not a technical one.", score: 85 },
  { modelId: 'x-ai/grok-4.1-fast', text: "Consider the long-term architecture. React 19 with Server Components and the new compiler eliminates most performance criticism — automatic memoization, streaming SSR, and reduced bundle sizes make the framework gap negligible. Svelte 5 with runes also converges toward a similar reactivity model. The frameworks are converging. Your decision should weight: (1) existing codebase investment, (2) team expertise distribution, (3) dependency on third-party component ecosystems. For most production dashboards, React remains the pragmatic choice despite Svelte's elegance.", score: 79 },
];

export const MOCK_SYNTHESIS = "The council reaches consensus on a nuanced position: **Svelte offers superior developer experience and raw performance**, while **React provides ecosystem depth and hiring advantages**. The pragmatic recommendation depends on context — greenfield projects with small teams favor Svelte; enterprise environments with existing React investment should stay the course. Key insight from the debate: framework performance gaps are narrowing rapidly, making ecosystem and team factors the decisive criteria.";

// ── Stage Config ──
export const STAGE_CONFIG = {
  1: { color: T.green, label: 'STAGE 1', name: 'Individual Responses' },
  2: { color: T.gold, label: 'STAGE 2', name: 'Peer Rankings' },
  3: { color: T.cyan, label: 'FINAL', name: 'Council Synthesis' },
};

// ── Rankings ──
export const MOCK_RANKINGS = [
  { model: 'Claude Sonnet 4.6', avgRank: 1.33, pct: 100, color: '#F27123' },
  { model: 'Gemini 3.1 Pro', avgRank: 1.67, pct: 82, color: '#00D9FF' },
  { model: 'GPT-5.2', avgRank: 2.67, pct: 48, color: '#34D399' },
  { model: 'Grok 4.1', avgRank: 3.33, pct: 28, color: '#E5375E' },
];

// ── DA Arena — Mock Interactions ──
export const MOCK_DA_INTERACTIONS = [
  {
    id: 1, round: 1,
    concept: { name: 'Phoenix Rising', persona: 'Maya Chen', model: 'Claude Sonnet', modelColor: T.flame },
    attack: {
      da_score: 8, severity: 4, persona: 'skeptic',
      fatal_flaw: 'Over-reliance on mythological symbolism limits audience connection to a niche demographic. The phoenix metaphor is culturally exclusive.',
      weaknesses: ['Too abstract for mass market', 'Mythological gatekeeping', 'No concrete value proposition'],
      one_change: 'Ground the phoenix metaphor in universal human experience of renewal, not Greek mythology.',
    },
    defense: {
      text: 'The phoenix transcends cultures — it appears in Chinese, Egyptian, Greek, and Hindu traditions. It\'s not niche, it\'s universally understood as rebirth. Our execution uses the emotional core, not the academic reference.',
      submitted: true,
    },
    verdict: { status: 'accepted_partial', label: 'Defense Accepted — Partially', details: 'Cultural breadth acknowledged, but execution still leans abstract. Needs concrete touchpoints.', revised_score: 7 },
    rating: 'effective', reviewed: true,
  },
  {
    id: 2, round: 1,
    concept: { name: 'Urban Pulse', persona: 'Marcus Rivera', model: 'GPT-4o', modelColor: T.green },
    attack: {
      da_score: 6, severity: 3, persona: 'contrarian',
      fatal_flaw: 'The heartbeat-city mashup is a design cliché used by hundreds of startups. Zero differentiation.',
      weaknesses: ['Extremely common visual trope', 'Forgettable in portfolio context', 'No emotional depth beyond \'city = alive\''],
      one_change: 'Find the arrhythmia — what makes THIS city\'s pulse irregular, broken, or beautiful?',
    },
    defense: { text: null, submitted: false },
    verdict: { status: 'no_defense', label: 'No Defense Submitted', details: null, revised_score: 5 },
    rating: null, reviewed: false,
  },
  {
    id: 3, round: 2,
    concept: { name: 'Phoenix Rising', persona: 'Maya Chen', model: 'Claude Sonnet', modelColor: T.flame },
    attack: {
      da_score: 9, severity: 5, persona: 'realist',
      fatal_flaw: 'V2 evolution is incrementally better but still hasn\'t solved the tangibility problem. The audience can\'t FEEL digital ashes.',
      weaknesses: ['Sensory gap: fire on screen is not fire felt', 'Animation dependency for concept integrity', 'Loses meaning in static applications'],
      one_change: 'Make it work in a single still frame. If the concept needs motion to make sense, it\'s not strong enough.',
    },
    defense: {
      text: 'A still frame of a phoenix mid-rise is already one of the most powerful images in visual history. The Criterion Collection built a logo on it. We don\'t need motion — we need composition.',
      submitted: true,
    },
    verdict: { status: 'accepted_strong', label: 'Defense Accepted — Strong', details: 'Excellent reframe. The single-frame challenge was met convincingly.', revised_score: 8 },
    rating: 'brilliant', reviewed: true,
  },
  {
    id: 4, round: 2,
    concept: { name: 'Zen Garden', persona: 'Dr. Sarah Kim', model: 'DeepSeek R1', modelColor: T.purple },
    attack: {
      da_score: 4, severity: 2, persona: 'purist',
      fatal_flaw: 'Zen branding is the pumpkin spice of design — predictably inoffensive and terminally boring.',
      weaknesses: ['Zen = safe = forgettable', 'Contradicts urgency-driven tech market', 'Passive aesthetic repels action-oriented buyers'],
      one_change: 'Inject danger. Real zen practice involves discomfort. Show the rake dragging through stone, not the finished pattern.',
    },
    defense: {
      text: 'The contradiction IS the brand. Technology that promises calm in chaos is the ultimate premium positioning. Apple proved this. We\'re not selling zen — we\'re selling the tension between chaos and order.',
      submitted: true,
    },
    verdict: { status: 'accepted_partial', label: 'Defense Accepted — Partially', details: 'The chaos/order tension is valid but needs visual proof. Current execution is too peaceful.', revised_score: 5 },
    rating: null, reviewed: false,
  },
  {
    id: 5, round: 3,
    concept: { name: 'Neon Dreams', persona: 'Alex Thompson', model: 'Gemini Flash', modelColor: '#3B82F6' },
    attack: {
      da_score: 3, severity: 5, persona: 'contrarian',
      fatal_flaw: 'This is an AI image prompt, not a brand concept. \'Neon\' + \'Dreams\' + \'Retro\' = the most generated aesthetic in AI history. Zero creative authorship.',
      weaknesses: ['Indistinguishable from AI slop', 'No brand strategy underneath', 'Aesthetic without substance', 'Will date in 6 months'],
      one_change: 'Delete it. Start over. This isn\'t worth evolving.',
    },
    defense: {
      text: 'The retro-future aesthetic resonates with Gen Z nostalgia for eras they never lived. The market data supports this trend. And the execution quality exceeds typical AI output by incorporating hand-drawn elements in the typography.',
      submitted: true,
    },
    verdict: { status: 'insufficient', label: 'Defense Insufficient', details: 'Trend data doesn\'t justify creative mediocrity. The hand-drawn claim needs visual evidence.', revised_score: 3 },
    rating: 'unfair', reviewed: true,
  },
];

// ── DA Command Center Config ──
export const DA_STYLES = [
  { id: 'socratic', name: 'Socratic', icon: 'brain', description: 'Probing questions that expose assumptions and logical gaps', color: T.cyan },
  { id: 'aggressive', name: 'Aggressive', icon: 'flame', description: 'Direct confrontation, no mercy — finds breaking points fast', color: T.magenta },
  { id: 'balanced', name: 'Balanced', icon: 'scale', description: 'Structured critique with constructive counter-proposals', color: T.gold },
];

export const DA_FOCUS_AREAS = [
  { id: 'feasibility', label: 'Feasibility', icon: 'target' },
  { id: 'ethics', label: 'Ethics', icon: 'scale' },
  { id: 'originality', label: 'Originality', icon: 'bolt' },
  { id: 'market', label: 'Market Fit', icon: 'chat' },
  { id: 'technical', label: 'Technical', icon: 'settings' },
];

export const DA_PRESETS = [
  { id: 'light', name: 'Light Sparring', description: 'Gentle probing — great for early-stage ideas', intensity: 1, style: 'socratic', frequency: 2, focusAreas: ['feasibility', 'originality'] },
  { id: 'full', name: 'Full Interrogation', description: 'Comprehensive stress-test across all dimensions', intensity: 2, style: 'balanced', frequency: 4, focusAreas: ['feasibility', 'ethics', 'originality', 'market', 'technical'] },
  { id: 'trial', name: 'Devil\'s Trial', description: 'Maximum adversarial pressure — only the strongest survive', intensity: 3, style: 'aggressive', frequency: 5, focusAreas: ['feasibility', 'market', 'technical'] },
];

// ── DA Arena — Rating Config ──
export const DA_RATINGS = [
  { key: 'brilliant', label: 'Brilliant', color: T.gold, desc: 'DA pushed concept to greatness' },
  { key: 'effective', label: 'Effective', color: T.green, desc: 'Useful challenge, good outcome' },
  { key: 'weak', label: 'Weak', color: T.textMuted, desc: 'Challenge lacked depth' },
  { key: 'unfair', label: 'Unfair', color: T.magenta, desc: 'Attack was unreasonable' },
];

// ── DA Persona Labels ──
export const DA_PERSONAS = {
  skeptic: { name: 'The Skeptic', color: T.persona.skeptic },
  contrarian: { name: 'The Contrarian', color: T.persona.contrarian },
  realist: { name: 'The Realist', color: T.persona.realist },
  purist: { name: 'The Purist', color: T.persona.purist },
};

// ─────────────────────────────────────────────────────────
// CHAMBER DATA — Launcher, Dashboard, Gallery
// ─────────────────────────────────────────────────────────

// ── Simulation Presets ──
export const MOCK_PRESETS = [
  { id: 'quick_test', name: 'Quick Test', desc: 'Fast 3-round creative sprint — ideal for early exploration', icon: 'bolt', color: T.cyan, time: '~15 min', participants: 5, rounds: 3 },
  { id: 'message_lab', name: 'Message Lab', desc: '6-round messaging deep-dive with quality gates', icon: 'megaphone', color: T.flame, time: '~45 min', participants: 8, rounds: 6 },
  { id: 'genesis_chamber', name: 'Genesis Chamber', desc: 'Full 8-round simulation — maximum creative depth', icon: 'temple', color: T.gold, time: '~90 min', participants: 16, rounds: 8 },
  { id: 'assembly_line', name: 'Assembly Line', desc: '5-round production-focused pipeline with tight eliminations', icon: 'factory', color: T.green, time: '~30 min', participants: 10, rounds: 5 },
];

// ── Teams & Personas ──
export const MOCK_TEAMS = [
  {
    id: 'marketing', name: 'Marketing & Strategy', color: T.flame,
    personas: [
      { id: 'david-ogilvy', name: 'David Ogilvy', title: 'Father of Advertising', era: '1960s', model: 'google/gemini-3.1-pro-preview' },
      { id: 'claude-hopkins', name: 'Claude Hopkins', title: 'Scientific Advertising', era: '1920s', model: 'anthropic/claude-sonnet-4.6' },
      { id: 'leo-burnett', name: 'Leo Burnett', title: 'Heartland Storyteller', era: '1950s', model: 'openai/gpt-5.1' },
      { id: 'mary-wells', name: 'Mary Wells Lawrence', title: 'Creative Revolution', era: '1960s', model: 'meta-llama/llama-4-maverick' },
      { id: 'gary-halbert', name: 'Gary Halbert', title: 'Prince of Print', era: '1980s', model: 'x-ai/grok-4.1-fast' },
    ],
  },
  {
    id: 'design', name: 'Design & Visual', color: T.purple,
    personas: [
      { id: 'paul-rand', name: 'Paul Rand', title: 'Corporate Identity Pioneer', era: '1960s', model: 'google/gemini-3.1-pro-preview' },
      { id: 'paula-scher', name: 'Paula Scher', title: 'Typographic Powerhouse', era: '1990s', model: 'openai/gpt-5.1' },
      { id: 'saul-bass', name: 'Saul Bass', title: 'Title Sequence Master', era: '1960s', model: 'anthropic/claude-sonnet-4.6' },
      { id: 'susan-kare', name: 'Susan Kare', title: 'Pixel Art Pioneer', era: '1980s', model: 'meta-llama/llama-4-maverick' },
      { id: 'rob-janoff', name: 'Rob Janoff', title: 'Apple Logo Creator', era: '1977', model: 'x-ai/grok-4.1-fast' },
      { id: 'tobias-vs', name: 'Tobias van Schneider', title: 'Dark UI Visionary', era: '2010s', model: 'google/gemini-3.1-pro-preview' },
    ],
  },
  {
    id: 'business', name: 'Business & Strategy', color: T.cyan,
    personas: [
      { id: 'elon-musk', name: 'Elon Musk', title: 'First Principles Thinker', era: '2000s', model: 'x-ai/grok-4.1-fast' },
      { id: 'jeff-bezos', name: 'Jeff Bezos', title: 'Customer Obsessed', era: '2000s', model: 'anthropic/claude-sonnet-4.6' },
      { id: 'warren-buffett', name: 'Warren Buffett', title: 'Value Investor', era: '1970s', model: 'google/gemini-3.1-pro-preview' },
      { id: 'richard-branson', name: 'Richard Branson', title: 'Brand Maverick', era: '1980s', model: 'meta-llama/llama-4-maverick' },
      { id: 'dietrich-mateschitz', name: 'Dietrich Mateschitz', title: 'Category Creator', era: '1987', model: 'deepseek/deepseek-v3.2' },
    ],
  },
];

// ── Leadership ──
export const MOCK_LEADERSHIP = {
  moderator: { id: 'steve-jobs', name: 'Steve Jobs', title: 'Moderator', model: 'anthropic/claude-opus-4-6', color: '#6B7280' },
  evaluator: { id: 'jony-ive', name: 'Jony Ive', title: 'Evaluator', model: 'anthropic/claude-sonnet-4.6', color: '#9CA3AF' },
  da: { id: 'devils-advocate', name: 'Advocatus Diaboli', title: "Devil's Advocate", model: 'x-ai/grok-4.1-fast', color: T.magenta },
};

// ── Simulation Stages ──
export const MOCK_STAGES = [
  { name: 'Create', color: T.green, icon: 'plus', status: 'complete' },
  { name: 'Critique', color: T.gold, icon: 'evaluate', status: 'complete' },
  { name: 'DA Defense', color: T.magenta, icon: 'shield', status: 'complete' },
  { name: 'Synthesize', color: '#EF4444', icon: 'brain', status: 'complete' },
  { name: 'Refine', color: T.cyan, icon: 'refresh', status: 'complete' },
  { name: 'Present', color: T.purple, icon: 'star', status: 'complete' },
];

// ── Full Mock Simulation ──
export const MOCK_SIMULATION = {
  id: 'mock-1',
  name: 'AquaLux Premium Water Launch',
  status: 'complete',
  brief: 'Create a luxury mineral water brand that competes with Voss and Fiji in the premium hydration market. Target: affluent millennials and Gen-Z health-conscious consumers. Must include brand name, visual identity direction, and hero campaign concept. Key differentiator: sourced from volcanic springs in Iceland with proprietary mineral enrichment.',
  config: {
    preset: 'genesis_chamber',
    rounds: 4,
    stages: 5,
    devils_advocate: true,
    da_aggression: 'aggressive',
  },
  concepts: [
    {
      id: 'c1', name: 'Volcanic Essence', persona: 'David Ogilvy', personaId: 'david-ogilvy',
      model: 'google/gemini-3.1-pro-preview', modelColor: '#00D9FF', status: 'winner', score: 92,
      headline: 'Born in Fire. Purified by Ice.', tagline: 'The water that remembers.',
      idea: 'A luxury water brand that tells the geological story of each bottle — 1,000-year volcanic filtration visualized through minimalist packaging with lava-flow typography.',
      visual_direction: 'Black matte bottle, gold cap, volcanic cross-section on label. Photography: macro shots of volcanic glass with water droplets.',
      image_prompt: 'Ultra-premium black matte water bottle, gold metallic cap, minimalist volcanic cross-section label design, studio photography, dark background, water droplets on surface, luxury product photography',
      strengths: ['Compelling origin story', 'Strong visual identity', 'Premium positioning'],
      round: 4, eliminated: false,
    },
    {
      id: 'c2', name: 'Glacier Protocol', persona: 'Paula Scher', personaId: 'paula-scher',
      model: 'openai/gpt-5.1', modelColor: '#34D399', status: 'surviving', score: 85,
      headline: 'Engineered by Nature. Perfected by Obsession.', tagline: 'Precision hydration.',
      idea: 'A tech-forward water brand targeting biohackers and performance enthusiasts, with QR-coded mineral analysis on every bottle.',
      visual_direction: 'Crystal clear bottle, sans-serif typography, data-visualization label showing mineral composition.',
      image_prompt: 'Crystal clear premium water bottle with data visualization label, mineral composition infographic, clean modern design, white studio background',
      strengths: ['Strong tech angle', 'Unique QR concept', 'Clear differentiation'],
      round: 4, eliminated: false,
    },
    {
      id: 'c3', name: 'Still Life', persona: 'Saul Bass', personaId: 'saul-bass',
      model: 'anthropic/claude-sonnet-4.6', modelColor: '#F27123', status: 'surviving', score: 78,
      headline: 'Be Still.', tagline: 'Water. Nothing more.',
      idea: 'Anti-marketing approach: radical minimalism. No claims. No story. Just the purest water in the purest bottle. The absence of branding IS the brand.',
      visual_direction: 'Completely clear bottle, no label, embossed logo only. Campaign: white space with single water droplet.',
      image_prompt: 'Ultra minimal clear glass water bottle with no label, subtle embossed logo, single water droplet, vast white space, zen luxury minimalism',
      strengths: ['Bold positioning', 'Memorable simplicity', 'Anti-marketing freshness'],
      round: 3, eliminated: false,
    },
    {
      id: 'c4', name: 'Nordic Myth', persona: 'Leo Burnett', personaId: 'leo-burnett',
      model: 'openai/gpt-5.1', modelColor: '#34D399', status: 'eliminated', score: 62,
      headline: 'Drink the Legend.', tagline: 'From the wells of Yggdrasil.',
      idea: 'Norse mythology-infused brand with Viking heritage storytelling. Limited editions tied to seasonal Norse festivals.',
      visual_direction: 'Frosted blue glass, runic typography, Viking-inspired geometric patterns.',
      image_prompt: 'Frosted blue glass water bottle with runic typography and Viking geometric patterns, moody atmospheric lighting',
      strengths: ['Rich storytelling', 'Cultural depth'],
      weaknesses: ['Niche appeal', 'Culturally exclusionary', 'Mythological fatigue in market'],
      eliminatedRound: 2, round: 2, eliminated: true,
    },
    {
      id: 'c5', name: 'H2Luxe', persona: 'Elon Musk', personaId: 'elon-musk',
      model: 'x-ai/grok-4.1-fast', modelColor: '#E5375E', status: 'eliminated', score: 45,
      headline: 'Water, Reimagined.', tagline: 'The Tesla of hydration.',
      idea: 'Subscription-based smart water with IoT-connected bottle tracking hydration. Gamified wellness.',
      visual_direction: 'LED-integrated bottle, app interface mockups, futuristic metallic finish.',
      image_prompt: 'Futuristic smart water bottle with subtle LED elements, metallic finish, dark tech aesthetic',
      strengths: ['Innovative tech integration'],
      weaknesses: ['Over-engineered', 'Lost the luxury angle', 'Subscription fatigue'],
      eliminatedRound: 1, round: 1, eliminated: true,
    },
  ],
  critiques: [
    {
      id: 'cr1', conceptName: 'Volcanic Essence', round: 3, criticsCount: 4,
      strengths: ['Origin story is emotionally resonant', 'Packaging concept is production-ready', 'Price point naturally justified by volcanic narrative'],
      weaknesses: ['Volcanic imagery may conflict with "pure water" perception', 'Lava-flow typography risks illegibility'],
      oneChange: 'Soften volcanic visual to suggest geological patience rather than eruption — think basalt columns, not lava.',
    },
    {
      id: 'cr2', conceptName: 'Glacier Protocol', round: 3, criticsCount: 4,
      strengths: ['QR mineral analysis is genuinely innovative', 'Tech-forward position is underserved in premium water', 'Appeals to data-driven affluent consumers'],
      weaknesses: ['May feel cold/clinical for emotional purchase', 'QR feature requires app — friction point'],
      oneChange: 'Add a sensory element — texture, weight, or sound — to bridge the gap between data and feeling.',
    },
    {
      id: 'cr3', conceptName: 'Still Life', round: 2, criticsCount: 4,
      strengths: ['Radically bold positioning', 'Unforgettable shelf presence', 'Anti-marketing is timely'],
      weaknesses: ['No-label concept faces regulatory issues in most markets', 'Zero brand recall for repeat purchase', 'Requires massive awareness spend to work'],
      oneChange: 'Find one micro-element of branding that whispers rather than shouts — a subtle emboss, a cap texture, something tactile.',
    },
  ],
  participants: [
    { id: 'david-ogilvy', name: 'David Ogilvy', model: 'google/gemini-3.1-pro-preview', modelColor: '#00D9FF', concept: 'Volcanic Essence', score: 92, status: 'winner' },
    { id: 'paula-scher', name: 'Paula Scher', model: 'openai/gpt-5.1', modelColor: '#34D399', concept: 'Glacier Protocol', score: 85, status: 'surviving' },
    { id: 'saul-bass', name: 'Saul Bass', model: 'anthropic/claude-sonnet-4.6', modelColor: '#F27123', concept: 'Still Life', score: 78, status: 'surviving' },
    { id: 'leo-burnett', name: 'Leo Burnett', model: 'openai/gpt-5.1', modelColor: '#34D399', concept: 'Nordic Myth', score: 62, status: 'eliminated' },
    { id: 'elon-musk', name: 'Elon Musk', model: 'x-ai/grok-4.1-fast', modelColor: '#E5375E', concept: 'H2Luxe', score: 45, status: 'eliminated' },
  ],
  media: [
    { id: 'm1', type: 'image', concept: 'Volcanic Essence', creator: 'David Ogilvy', model: 'Recraft V4', modelColor: '#00D9FF', prompt: 'Ultra-premium black matte water bottle, gold metallic cap, minimalist volcanic cross-section label design', status: 'winner', score: 92, aspect: '4/5' },
    { id: 'm2', type: 'image', concept: 'Volcanic Essence', creator: 'David Ogilvy', model: 'Flux 2 Pro', modelColor: '#00D9FF', prompt: 'Luxury water brand hero shot, volcanic landscape, premium product photography', status: 'winner', score: 92, aspect: '1/1' },
    { id: 'm3', type: 'image', concept: 'Glacier Protocol', creator: 'Paula Scher', model: 'Seedream 4.5', modelColor: '#34D399', prompt: 'Crystal clear premium water bottle with data visualization label', status: 'surviving', score: 85, aspect: '4/5' },
    { id: 'm4', type: 'image', concept: 'Glacier Protocol', creator: 'Paula Scher', model: 'Ideogram V3', modelColor: '#34D399', prompt: 'Tech-forward water brand typography and QR code label design', status: 'surviving', score: 85, aspect: '1/1' },
    { id: 'm5', type: 'image', concept: 'Still Life', creator: 'Saul Bass', model: 'Recraft V4', modelColor: '#F27123', prompt: 'Ultra minimal clear glass water bottle, no label, single water droplet, white space', status: 'surviving', score: 78, aspect: '3/4' },
    { id: 'm6', type: 'video', concept: 'Volcanic Essence', creator: 'David Ogilvy', model: 'Kling 3.0', modelColor: '#00D9FF', prompt: 'Slow reveal of premium water bottle emerging from volcanic rock, cinematic lighting', status: 'winner', score: 92, aspect: '16/9', duration: '5s' },
    { id: 'm7', type: 'video', concept: 'Glacier Protocol', creator: 'Paula Scher', model: 'Veo 3.1', modelColor: '#34D399', prompt: 'Data particles flowing around crystal water bottle, sci-fi product reveal', status: 'surviving', score: 85, aspect: '16/9', duration: '4s' },
    { id: 'm8', type: 'image', concept: 'Nordic Myth', creator: 'Leo Burnett', model: 'Flux 2 Pro', modelColor: '#34D399', prompt: 'Frosted blue glass bottle with runic typography, moody atmospheric lighting', status: 'eliminated', score: 62, aspect: '4/5' },
    { id: 'm9', type: 'image', concept: 'H2Luxe', creator: 'Elon Musk', model: 'Nano Banana', modelColor: '#E5375E', prompt: 'Futuristic smart water bottle with LED elements, metallic finish', status: 'eliminated', score: 45, aspect: '1/1' },
  ],
  stats: { rounds: 4, totalConcepts: 5, daAttacks: 8, imagesGenerated: 7, videosGenerated: 2 },
  winner: 'c1',
};

// ── Dashboard Tab Groups ──
export const MOCK_TAB_GROUPS = [
  { key: 'hero', label: 'Overview', tabs: [{ key: 'overview', label: 'Overview' }] },
  {
    key: 'council', label: 'Council',
    tabs: [
      { key: 'concepts', label: 'Concepts' },
      { key: 'critiques', label: 'Critiques' },
      { key: 'direction', label: 'Direction' },
      { key: 'transcript', label: 'Transcript' },
    ],
  },
  {
    key: 'media', label: 'Media',
    tabs: [
      { key: 'gallery', label: 'Gallery' },
      { key: 'generated', label: 'Generated' },
    ],
  },
  { key: 'da', label: 'DA Arena', tabs: [{ key: 'da-arena', label: 'DA Arena' }] },
  { key: 'export', label: 'Export', tabs: [{ key: 'output', label: 'Output' }] },
];
