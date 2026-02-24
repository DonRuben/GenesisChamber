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
  daModel: null,
  daThinkingMode: 'off',
  daWebSearch: false,
  daCritiqueFocus: [],
  daAttackStrategy: 'sanhedrin',
  daMaxElimination: 60,
  moderatorModel: null,
  evaluatorModel: null,
  expandedTeam: null,
  modelAssignments: {},       // { personaId: modelId }
  thinkingMode: 'off',        // 'off' | 'thinking' | 'deep'
  thinkingOverrides: {},       // { personaId: mode }
  enableWebSearch: false,

  // ── Live Simulation State ──
  liveSimId: null,
  liveStatus: null,       // 'starting' | 'running' | 'complete' | 'failed'
  liveEvents: [],
  liveError: null,

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
  setDaModel: (m) => set({ daModel: m }),
  setDaThinkingMode: (m) => set({ daThinkingMode: m }),
  setDaWebSearch: (v) => set({ daWebSearch: v }),
  setDaCritiqueFocus: (f) => set({ daCritiqueFocus: f }),
  toggleDaCritiqueFocus: (id) => set((s) => {
    const next = s.daCritiqueFocus.includes(id)
      ? s.daCritiqueFocus.filter((x) => x !== id)
      : [...s.daCritiqueFocus, id];
    return { daCritiqueFocus: next };
  }),
  setDaAttackStrategy: (s) => set({ daAttackStrategy: s }),
  setDaMaxElimination: (v) => set({ daMaxElimination: v }),
  setModeratorModel: (m) => set({ moderatorModel: m }),
  setEvaluatorModel: (m) => set({ evaluatorModel: m }),
  setExpandedTeam: (team) => set((s) => ({
    expandedTeam: s.expandedTeam === team ? null : team,
  })),
  setModelAssignment: (personaId, modelId) => set((s) => ({
    modelAssignments: { ...s.modelAssignments, [personaId]: modelId },
  })),
  setThinkingMode: (mode) => set({ thinkingMode: mode }),
  setThinkingOverride: (personaId, mode) => set((s) => {
    const next = { ...s.thinkingOverrides };
    if (mode === 'default') delete next[personaId];
    else next[personaId] = mode;
    return { thinkingOverrides: next };
  }),
  getEffectiveThinking: (personaId) => {
    const s = get();
    return s.thinkingOverrides[personaId] || s.thinkingMode;
  },
  setEnableWebSearch: (enabled) => set({ enableWebSearch: enabled }),
  resetLauncher: () => set({
    launchMode: null, launchStep: 0, selectedPreset: null,
    selectedPersonas: new Set(), brief: '', daEnabled: false,
    daAggression: 'balanced', daModel: null, daThinkingMode: 'off',
    daWebSearch: false, daCritiqueFocus: [], daAttackStrategy: 'sanhedrin',
    daMaxElimination: 60, moderatorModel: null, evaluatorModel: null,
    expandedTeam: null,
    modelAssignments: {}, thinkingMode: 'off', thinkingOverrides: {},
    enableWebSearch: false,
  }),

  // ── Live Simulation Actions ──
  setSimulation: (simulation) => set({ simulation }),
  handleSimSSEEvent: (type, data) => {
    switch (type) {
      case 'simulation_started':
        set({ liveSimId: data.sim_id, liveStatus: 'running' });
        break;
      case 'simulation_complete':
        set({ liveStatus: 'complete' });
        break;
      case 'error':
        set({ liveError: data.message || 'Simulation error', liveStatus: 'failed' });
        break;
      default:
        set((s) => ({ liveEvents: [...s.liveEvents, { type, ...data }] }));
        break;
    }
  },
  resetLive: () => set({
    liveSimId: null, liveStatus: null, liveEvents: [], liveError: null,
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
