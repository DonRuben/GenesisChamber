// ─────────────────────────────────────────────────────────
// GENESIS CHAMBER V4 — COUNCIL STORE
// LLM Council state: view, question, reveal, synthesis,
// API state, SSE event handling, model config
// ─────────────────────────────────────────────────────────

import { create } from 'zustand';
import { useAppStore } from './appStore';
import { MOCK_TEAMS } from '../data/mock';
import { saveSession, loadSession as loadSessionFromStorage } from '../utils/sessionStorage';

export const useCouncilStore = create((set, get) => ({
  // ── UI State ──
  view: 'landing',
  question: '',
  preset: null,
  revealed: true,
  showSynthesis: true,
  settingsOpen: false,
  anonymized: false,
  followUp: '',
  selectedResponseTab: 0,       // 0-based index | 'all' | 'leaderboard' | 'synthesis'

  // ── Compare Mode ──
  compareMode: false,
  compareLeft: 0,
  compareRight: 1,

  // ── Model Config (full OpenRouter IDs) ──
  activeModels: [
    'openai/gpt-5.2',
    'google/gemini-3.1-pro-preview',
    'anthropic/claude-sonnet-4.6',
    'x-ai/grok-4.1',
  ],
  chairmanModel: 'google/gemini-3.1-pro-preview',
  thinkingMode: 'off',        // 'off' | 'thinking' | 'deep'
  modelThinkingModes: {},      // per-model overrides
  enableWebSearch: false,

  // ── Phase 9: Thinking Hierarchy + Leadership ──
  defaultThinkingMode: 'off',   // 'off' | 'thinking' | 'deep' — global default

  chairman: {
    thinkingMode: 'off',
    webSearch: false,
  },

  // ── API State ──
  conversationId: null,
  loading: false,
  currentStage: null,          // 'stage1' | 'stage2' | 'stage3'
  stage1Results: null,         // [{model, response, reasoning?}]
  stage2Results: null,         // {rankings, labelToModel, aggregateRankings}
  stage3Result: null,          // {response, reasoning?}
  error: null,
  conversationTitle: null,
  messages: [],                // conversation history
  _abortController: null,

  // ── UI Actions ──
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
  setSelectedResponseTab: (tab) => set({ selectedResponseTab: tab }),
  setCompareMode: (on) => set({ compareMode: on }),
  setCompareLeft: (idx) => set({ compareLeft: idx }),
  setCompareRight: (idx) => set({ compareRight: idx }),

  // ── Model Config Actions ──
  setChairmanModel: (model) => set({ chairmanModel: model }),
  setThinkingMode: (mode) => set({ thinkingMode: mode }),
  setModelThinkingMode: (modelId, mode) => set((s) => ({
    modelThinkingModes: { ...s.modelThinkingModes, [modelId]: mode },
  })),
  setEnableWebSearch: (enabled) => set({ enableWebSearch: enabled }),

  // ── Phase 9: Thinking Hierarchy Actions ──
  setDefaultThinkingMode: (mode) => set({ defaultThinkingMode: mode, thinkingMode: mode }),
  setParticipantThinking: (modelId, mode) => set((s) => {
    const next = { ...s.modelThinkingModes };
    if (mode === 'default') delete next[modelId];
    else next[modelId] = mode;
    return { modelThinkingModes: next };
  }),
  setChairmanConfig: (updates) => set((s) => ({
    chairman: { ...s.chairman, ...updates },
  })),

  // ── API State Actions ──
  setConversationId: (id) => set({ conversationId: id }),
  setLoading: (loading) => set({ loading }),
  setCurrentStage: (stage) => set({ currentStage: stage }),
  setError: (error) => set({ error, loading: false }),

  // ── Clear results for new query ──
  clearResults: () => set({
    stage1Results: null,
    stage2Results: null,
    stage3Result: null,
    error: null,
    currentStage: null,
    showSynthesis: true,
    revealed: true,
    selectedResponseTab: 0,
    compareMode: false,
    compareLeft: 0,
    compareRight: 1,
  }),

  // ── Cancel active stream ──
  cancelStream: () => {
    const ctrl = get()._abortController;
    if (ctrl) ctrl.abort();
    set({ _abortController: null, loading: false, currentStage: null });
  },

  // ── Create abort controller for new stream ──
  createAbortController: () => {
    const ctrl = new AbortController();
    set({ _abortController: ctrl });
    return ctrl;
  },

  // ── SSE Event Handler ──
  handleSSEEvent: (type, data) => {
    switch (type) {
      case 'stage1_start':
        set({ currentStage: 'stage1' });
        break;
      case 'stage1_complete':
        if (import.meta.env.DEV && data.data) {
          console.debug('[SSE] stage1_complete payload keys:', data.data.map?.((r) => Object.keys(r)));
        }
        set({ stage1Results: data.data, currentStage: 'stage2' });
        break;
      case 'stage2_start':
        set({ currentStage: 'stage2' });
        break;
      case 'stage2_complete':
        set({
          stage2Results: {
            rankings: data.data,
            labelToModel: data.metadata?.label_to_model || {},
            aggregateRankings: data.metadata?.aggregate_rankings || data.data,
          },
          currentStage: 'stage3',
        });
        break;
      case 'stage3_start':
        set({ currentStage: 'stage3' });
        break;
      case 'stage3_complete': {
        if (import.meta.env.DEV) {
          console.debug('[SSE] stage3_complete payload keys:', Object.keys(data.data || {}));
        }
        const result = Array.isArray(data.data) ? data.data[0] : data.data;
        if (result?.error || result?.response?.startsWith('Error:')) {
          set({ error: result.response || 'Synthesis failed', stage3Result: null });
        } else {
          set({ stage3Result: result });
        }
        break;
      }
      case 'title_complete': {
        const title = data.data?.title || data.title;
        set({ conversationTitle: title });
        const convId = get().conversationId;
        if (title && convId) {
          useAppStore.getState().updateConversation(convId, { title });
        }
        break;
      }
      case 'complete': {
        const s = get();
        const assistantMsg = {
          role: 'assistant',
          stage1: s.stage1Results,
          stage2: s.stage2Results,
          stage3: s.stage3Result,
        };
        set({
          loading: false,
          currentStage: null,
          _abortController: null,
          messages: [...s.messages, assistantMsg],
        });
        // Auto-save session to localStorage
        if (s.stage1Results || s.stage3Result) {
          try {
            saveSession({
              question: s.question,
              models: s.activeModels,
              responses: s.stage1Results,
              rankings: s.stage2Results,
              synthesis: s.stage3Result,
              config: {
                thinkingMode: s.thinkingMode,
                enableWebSearch: s.enableWebSearch,
                chairmanModel: s.chairmanModel,
              },
            });
          } catch (e) { /* silent */ }
        }
        break;
      }
      case 'error':
        set({
          error: data.message || data.error || 'An error occurred',
          loading: false,
          currentStage: null,
          _abortController: null,
        });
        break;
      default:
        break;
    }
  },

  // ── Add user message to history ──
  addUserMessage: (content) => set((s) => ({
    messages: [...s.messages, { role: 'user', content }],
  })),

  // ── Load saved session from localStorage ──
  loadSavedSession: (key) => {
    const data = loadSessionFromStorage(key);
    if (!data) return;
    set({
      view: 'conversation',
      question: data.question || '',
      activeModels: data.models || get().activeModels,
      stage1Results: data.responses || null,
      stage2Results: data.rankings || null,
      stage3Result: data.synthesis || null,
      loading: false,
      currentStage: null,
      error: null,
      revealed: true,
      showSynthesis: true,
      selectedResponseTab: 0,
      thinkingMode: data.config?.thinkingMode || 'off',
      enableWebSearch: data.config?.enableWebSearch || false,
      chairmanModel: data.config?.chairmanModel || get().chairmanModel,
    });
  },

  // ── Full reset ──
  reset: () => set({
    view: 'landing', question: '', preset: null,
    revealed: true, showSynthesis: true, followUp: '', selectedResponseTab: 0,
    compareMode: false, compareLeft: 0, compareRight: 1,
    conversationId: null, loading: false, currentStage: null,
    stage1Results: null, stage2Results: null, stage3Result: null,
    error: null, conversationTitle: null, messages: [],
    _abortController: null,
  }),
}));
