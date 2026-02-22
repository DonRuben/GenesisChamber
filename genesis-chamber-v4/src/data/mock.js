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
