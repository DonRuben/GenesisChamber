// ─────────────────────────────────────────────────────────
// GENESIS CHAMBER V4 — CHAMBER STORE
// Zustand state for Launcher, Dashboard, and Gallery
// ─────────────────────────────────────────────────────────

import { create } from 'zustand';
import { MOCK_SIMULATION } from '../data/mock';

export const useChamberStore = create((set, get) => ({
  // ── Launcher State ──
  launchMode: null,          // null | 'quick' | 'custom'
  launchStep: 0,
  selectedPreset: null,
  selectedPersonas: new Set(),
  brief: '',
  daEnabled: false,
  daAggression: 'balanced',
  expandedTeam: null,

  // ── Dashboard State ──
  simulation: MOCK_SIMULATION,
  activeTab: 'overview',
  activeSubTab: null,
  dashSidebarOpen: true,

  // ── Concept State ──
  expandedConceptId: null,
  showEliminated: false,

  // ── Gallery State ──
  galleryView: 'grid',       // 'grid' | 'concept' | 'compare'
  galleryFilter: 'all',      // 'all' | 'images' | 'videos'
  gallerySearch: '',
  lightboxItem: null,
  compareLeft: null,
  compareRight: null,
  compareSide: null,          // 'left' | 'right' | null

  // ── Launcher Actions ──
  setLaunchMode: (mode) => set({ launchMode: mode, launchStep: 0 }),
  setLaunchStep: (step) => set({ launchStep: step }),
  nextStep: () => set((s) => ({ launchStep: s.launchStep + 1 })),
  prevStep: () => set((s) => ({ launchStep: Math.max(0, s.launchStep - 1) })),
  setSelectedPreset: (preset) => set({ selectedPreset: preset }),
  togglePersona: (id) => set((s) => {
    const next = new Set(s.selectedPersonas);
    if (next.has(id)) next.delete(id);
    else if (next.size < 16) next.add(id);
    return { selectedPersonas: next };
  }),
  selectAllTeam: (personaIds) => set((s) => {
    const next = new Set(s.selectedPersonas);
    personaIds.forEach((id) => { if (next.size < 16) next.add(id); });
    return { selectedPersonas: next };
  }),
  deselectAllTeam: (personaIds) => set((s) => {
    const next = new Set(s.selectedPersonas);
    personaIds.forEach((id) => next.delete(id));
    return { selectedPersonas: next };
  }),
  setBrief: (brief) => set({ brief }),
  setDaEnabled: (enabled) => set({ daEnabled: enabled }),
  setDaAggression: (level) => set({ daAggression: level }),
  setExpandedTeam: (team) => set((s) => ({
    expandedTeam: s.expandedTeam === team ? null : team,
  })),
  resetLauncher: () => set({
    launchMode: null, launchStep: 0, selectedPreset: null,
    selectedPersonas: new Set(), brief: '', daEnabled: false,
    daAggression: 'balanced', expandedTeam: null,
  }),

  // ── Dashboard Actions ──
  setActiveTab: (tab, subTab = null) => set({ activeTab: tab, activeSubTab: subTab }),
  setDashSidebarOpen: (open) => set({ dashSidebarOpen: open }),

  // ── Concept Actions ──
  setExpandedConceptId: (id) => set((s) => ({
    expandedConceptId: s.expandedConceptId === id ? null : id,
  })),
  setShowEliminated: (show) => set({ showEliminated: show }),

  // ── Gallery Actions ──
  setGalleryView: (view) => set({ galleryView: view }),
  setGalleryFilter: (filter) => set({ galleryFilter: filter }),
  setGallerySearch: (search) => set({ gallerySearch: search }),
  setLightboxItem: (item) => set({ lightboxItem: item }),
  setCompareLeft: (item) => set({ compareLeft: item }),
  setCompareRight: (item) => set({ compareRight: item }),
  setCompareSide: (side) => set({ compareSide: side }),
  clearCompare: () => set({ compareLeft: null, compareRight: null, compareSide: null }),

  // ── Computed ──
  getFilteredMedia: () => {
    const { simulation, galleryFilter, gallerySearch } = get();
    if (!simulation?.media) return [];
    let media = simulation.media;
    if (galleryFilter !== 'all') {
      media = media.filter((m) => m.type === (galleryFilter === 'images' ? 'image' : 'video'));
    }
    if (gallerySearch) {
      const q = gallerySearch.toLowerCase();
      media = media.filter((m) =>
        m.concept?.toLowerCase().includes(q) ||
        m.creator?.toLowerCase().includes(q) ||
        m.prompt?.toLowerCase().includes(q)
      );
    }
    return media;
  },
}));
