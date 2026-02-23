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

  // Config modal
  showConfigModal: false,
  toggleConfigModal: () => set((s) => ({ showConfigModal: !s.showConfigModal })),

  // Backend connection status
  backendOnline: null, // null=checking, true=connected, false=offline
  setBackendOnline: (status) => set({ backendOnline: status }),

  // Available models (fetched from backend)
  availableModels: null, // null = not loaded yet

  loadModels: async () => {
    try {
      const data = await api.getAvailableModels();
      // Backend returns { tiers: [{name, models: [...]}] } or flat array
      let flat;
      if (data?.tiers) {
        flat = data.tiers.flatMap((tier) =>
          (tier.models || []).map((m) => ({ ...m, tier: tier.id || tier.name?.toLowerCase() }))
        );
      } else if (Array.isArray(data)) {
        flat = data;
      } else {
        return; // unexpected shape
      }
      set({ availableModels: flat });
    } catch {
      // Offline fallback — leave null so hooks use hardcoded MODELS
    }
  },

  // Active conversation + search
  activeConversationId: null,
  searchFilter: '',
  setActiveConversationId: (id) => set({ activeConversationId: id }),
  setSearchFilter: (filter) => set({ searchFilter: filter }),

  starConversation: (id) => set((s) => ({
    conversations: s.conversations.map((c) =>
      c.id === id ? { ...c, starred: !c.starred } : c
    ),
  })),

  updateConversation: (id, updates) => set((s) => ({
    conversations: s.conversations.map((c) =>
      c.id === id ? { ...c, ...updates } : c
    ),
  })),

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
    conversations: [{
      ...conv,
      starred: conv.starred ?? false,
      createdAt: conv.createdAt || conv.created_at || new Date().toISOString(),
      updatedAt: conv.updatedAt || conv.updated_at || new Date().toISOString(),
    }, ...s.conversations],
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
