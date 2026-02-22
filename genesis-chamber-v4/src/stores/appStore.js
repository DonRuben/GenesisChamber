// ─────────────────────────────────────────────────────────
// GENESIS CHAMBER V4 — APP STORE
// Global state: mode, theme, sidebar
// ─────────────────────────────────────────────────────────

import { create } from 'zustand';

const getStoredTheme = () => {
  try {
    return localStorage.getItem('gc-v4-theme') || 'dark';
  } catch {
    return 'dark';
  }
};

export const useAppStore = create((set) => ({
  // Mode: 'council' or 'genesis'
  mode: 'council',
  setMode: (mode) => set({ mode }),

  // Theme: 'dark' or 'light'
  theme: getStoredTheme(),
  toggleTheme: () => set((s) => {
    const next = s.theme === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem('gc-v4-theme', next); } catch {}
    document.documentElement.setAttribute('data-theme', next);
    return { theme: next };
  }),

  // Sidebar: 'hidden' | 'collapsed' | 'expanded'
  sidebarState: 'expanded',
  setSidebar: (sidebarState) => set({ sidebarState }),
  toggleSidebar: () => set((s) => ({
    sidebarState: s.sidebarState === 'expanded' ? 'collapsed' : 'expanded',
  })),
}));
