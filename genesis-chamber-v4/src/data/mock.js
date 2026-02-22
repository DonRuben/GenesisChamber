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
