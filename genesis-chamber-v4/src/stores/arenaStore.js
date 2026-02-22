import { create } from 'zustand';
import { MOCK_DA_INTERACTIONS } from '../data/mock';

export const useArenaStore = create((set, get) => ({
  // Data
  interactions: MOCK_DA_INTERACTIONS,
  ratings: {},
  trainingReport: null,
  suggestions: null,

  // Navigation
  selectedIndex: 0,
  roundFilter: null,

  // UI
  view: 'courtroom', // 'courtroom' | 'report'

  // Computed
  getFiltered: () => {
    const { interactions, roundFilter } = get();
    return roundFilter
      ? interactions.filter(i => i.round === roundFilter)
      : interactions;
  },

  getCurrent: () => {
    const { selectedIndex } = get();
    const filtered = get().getFiltered();
    return filtered[selectedIndex] || null;
  },

  // Actions
  setInteractions: (interactions) => set({ interactions }),

  setRating: (id, rating) => set((s) => ({
    ratings: { ...s.ratings, [id]: rating },
  })),

  navigate: (delta) => set((s) => {
    const filtered = s.roundFilter
      ? s.interactions.filter(i => i.round === s.roundFilter)
      : s.interactions;
    const next = s.selectedIndex + delta;
    if (next < 0 || next >= filtered.length) return {};
    return { selectedIndex: next };
  }),

  setRoundFilter: (round) => set({ roundFilter: round, selectedIndex: 0 }),

  setView: (view) => set({ view }),

  setTrainingReport: (trainingReport) => set({ trainingReport }),
  setSuggestions: (suggestions) => set({ suggestions }),

  reset: () => set({
    interactions: MOCK_DA_INTERACTIONS,
    ratings: {},
    selectedIndex: 0,
    roundFilter: null,
    view: 'courtroom',
    trainingReport: null,
    suggestions: null,
  }),
}));
