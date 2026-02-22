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
  { id: 'claude', name: 'Claude Sonnet', color: T.flame, letter: 'C' },
  { id: 'gpt4o', name: 'GPT-4o', color: T.green, letter: 'G' },
  { id: 'gemini', name: 'Gemini 2.0 Flash', color: '#3B82F6', letter: 'Gm' },
  { id: 'deepseek', name: 'DeepSeek R1', color: T.purple, letter: 'D' },
];

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
  { modelId: 'claude', text: "The key differentiator lies in the execution model. React's virtual DOM reconciliation is well-understood and battle-tested, but Svelte's compile-time approach eliminates the runtime overhead entirely. For a dashboard with frequent state updates, Svelte's surgical DOM updates yield measurably better frame rates. However, React's ecosystem depth — particularly for complex data visualization with D3 integration — remains unmatched. My recommendation: Svelte for greenfield dashboards under 50 components; React for enterprise-scale with heavy charting requirements.", score: 88 },
  { modelId: 'gpt4o', text: "From a developer experience standpoint, Svelte reduces boilerplate by approximately 40% compared to React for equivalent functionality. The reactive declarations ($:) replace useState/useEffect patterns with more intuitive syntax. But the trade-off is significant: React's job market is 10× larger, component libraries like shadcn/ui have no Svelte equivalent at the same quality tier, and React Server Components offer a server-first paradigm Svelte hasn't matched. For your dashboard rebuild: if the team knows React, stay with React. The productivity gains from Svelte don't offset the migration cost and ecosystem gap.", score: 82 },
  { modelId: 'gemini', text: "The performance benchmarks tell a clear story: Svelte outperforms React by 2-3× in initial render and 1.5× in updates for typical dashboard patterns. But benchmarks aren't production. In real-world dashboards, the bottleneck is rarely the framework — it's data fetching, chart rendering, and WebSocket management. Both frameworks handle these comparably. The deciding factor should be team velocity: which framework lets your specific team ship quality code faster? That's an organizational question, not a technical one.", score: 85 },
  { modelId: 'deepseek', text: "Consider the long-term architecture. React 19 with Server Components and the new compiler eliminates most performance criticism — automatic memoization, streaming SSR, and reduced bundle sizes make the framework gap negligible. Svelte 5 with runes also converges toward a similar reactivity model. The frameworks are converging. Your decision should weight: (1) existing codebase investment, (2) team expertise distribution, (3) dependency on third-party component ecosystems. For most production dashboards, React remains the pragmatic choice despite Svelte's elegance.", score: 79 },
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
  { model: 'Claude Sonnet', avgRank: 1.33, pct: 100, color: T.flame },
  { model: 'Gemini 2.0 Flash', avgRank: 1.67, pct: 82, color: '#3B82F6' },
  { model: 'GPT-4o', avgRank: 2.67, pct: 48, color: T.green },
  { model: 'DeepSeek R1', avgRank: 3.33, pct: 28, color: T.purple },
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
