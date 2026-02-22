// ─────────────────────────────────────────────────────────
// GENESIS CHAMBER V4 — COUNCIL STORE
// LLM Council state: view, question, reveal, synthesis
// ─────────────────────────────────────────────────────────

import { create } from 'zustand';

export const useCouncilStore = create((set) => ({
  view: 'landing',
  question: '',
  preset: null,
  revealed: false,
  showSynthesis: false,
  settingsOpen: false,
  anonymized: true,
  activeModels: ['claude', 'gpt4o', 'gemini', 'deepseek'],
  followUp: '',

  setView: (view) => set({ view }),
  setQuestion: (question) => set({ question }),
  setPreset: (preset) => set({ preset }),
  toggleReveal: () => set((s) => ({ revealed: !s.revealed })),
  toggleSynthesis: () => set((s) => ({ showSynthesis: !s.showSynthesis })),
  toggleSettings: () => set((s) => ({ settingsOpen: !s.settingsOpen })),
  setAnonymized: (anonymized) => set({ anonymized }),
  toggleModel: (id) => set((s) => ({
    activeModels: s.activeModels.includes(id)
      ? s.activeModels.filter((x) => x !== id)
      : [...s.activeModels, id],
  })),
  setFollowUp: (followUp) => set({ followUp }),
  reset: () => set({
    view: 'landing', question: '', preset: null,
    revealed: false, showSynthesis: false, followUp: '',
  }),
}));
