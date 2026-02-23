// ─────────────────────────────────────────────────────────
// GENESIS CHAMBER V4 — APP STORE
// Global state: mode, theme, sidebar
// ─────────────────────────────────────────────────────────

import { create } from 'zustand';
import * as api from '../services/api';

const getStoredTheme = () => {
  try {
    const stored = localStorage.getItem('gc-v4-theme');
    if (stored) return stored;
    // Respect system preference on first visit
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: light)').matches) {
      return 'light';
    }
    return 'dark';
  } catch {
    return 'dark';
  }
};

export const useAppStore = create((set, get) => ({
  // Mode: 'council' or 'genesis'
  mode: 'genesis',
  setMode: (mode) => set({ mode }),

  // Theme: 'dark' or 'light'
  theme: getStoredTheme(),
  toggleTheme: () => set((s) => {
    const next = s.theme === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem('gc-v4-theme', next); } catch { /* ignored */ }
    document.documentElement.setAttribute('data-theme', next);
    return { theme: next };
  }),

  // Sidebar: 'hidden' | 'collapsed' | 'expanded'
  sidebarState: 'expanded',
  setSidebar: (sidebarState) => set({ sidebarState }),
  toggleSidebar: () => set((s) => ({
    sidebarState: s.sidebarState === 'expanded' ? 'collapsed' : 'expanded',
  })),

  // Backend connection status
  backendOnline: null, // null=checking, true=connected, false=offline
  setBackendOnline: (status) => set({ backendOnline: status }),

  // Sidebar data (real conversations + simulations)
  conversations: [],
  simulations: [],
  sidebarLoading: false,

  loadSidebarData: async () => {
    if (get().sidebarLoading) return;
    set({ sidebarLoading: true });
    try {
      const [convs, sims] = await Promise.all([
        api.listConversations().catch(() => []),
        api.listSimulations().catch(() => []),
      ]);
      set({
        conversations: Array.isArray(convs) ? convs : convs?.conversations || [],
        simulations: Array.isArray(sims) ? sims : sims?.simulations || [],
        sidebarLoading: false,
      });
    } catch {
      set({ sidebarLoading: false });
    }
  },

  addConversation: (conv) => set((s) => ({
    conversations: [conv, ...s.conversations],
  })),

  removeConversation: (id) => set((s) => ({
    conversations: s.conversations.filter((c) => c.id !== id),
  })),

  addSimulation: (sim) => set((s) => ({
    simulations: [sim, ...s.simulations],
  })),

  removeSimulation: (id) => set((s) => ({
    simulations: s.simulations.filter((s) => s.id !== id),
  })),
}));
