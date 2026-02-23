// ─────────────────────────────────────────────────────────
// GENESIS CHAMBER V4 — LLM COUNCIL
// Main orchestrator: landing → conversation
// Wired to backend SSE streaming with mock fallback
// ─────────────────────────────────────────────────────────

import { useCallback } from 'react';
import { useCouncilStore } from '../../stores/councilStore';
import { useAppStore } from '../../stores/appStore';
import * as api from '../../services/api';
import LandingState from './LandingState';
import ConversationView from './ConversationView';
import SettingsPanel from './SettingsPanel';

export default function LLMCouncil() {
  const view = useCouncilStore((s) => s.view);
  const setPreset = useCouncilStore((s) => s.setPreset);

  const handleSubmit = useCallback(async (q) => {
    const store = useCouncilStore.getState();
    const backendOnline = useAppStore.getState().backendOnline;

    store.clearResults();
    store.setQuestion(q);
    store.setView('conversation');

    // Wait for health check to resolve if still pending
    console.log('[GC] Council submit — backendOnline:', backendOnline);
    if (backendOnline === null) {
      const status = await new Promise((resolve) => {
        const unsub = useAppStore.subscribe((state) => {
          if (state.backendOnline !== null) {
            unsub();
            resolve(state.backendOnline);
          }
        });
        setTimeout(() => { unsub(); resolve(false); }, 6000);
      });
      if (!status) return;
    } else if (backendOnline === false) {
      return;
    }
    console.log('[GC] Council — proceeding with backend');

    // Create conversation if needed
    let convId = store.conversationId;
    if (!convId) {
      try {
        const conv = await api.createConversation();
        convId = conv.id;
        store.setConversationId(convId);
        useAppStore.getState().addConversation(conv);
      } catch (err) {
        store.setError('Failed to create conversation: ' + err.message);
        return;
      }
    }

    // Add user message to history
    store.addUserMessage(q);
    store.setLoading(true);

    // Create abort controller for this stream
    const ctrl = store.createAbortController();

    try {
      await api.sendMessageStream(convId, q, store.handleSSEEvent, {
        models: store.activeModels,
        chairmanModel: store.chairmanModel,
        thinkingMode: store.thinkingMode,
        enableWebSearch: store.enableWebSearch,
        modelThinkingModes: store.modelThinkingModes,
        signal: ctrl.signal,
      });
    } catch (err) {
      if (err.name === 'AbortError') return;
      store.setError(err.message);
    }
  }, []);

  const handlePreset = (p) => {
    setPreset(p);
    handleSubmit(p.placeholder);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      {view === 'landing' && (
        <LandingState onPreset={handlePreset} onSubmit={handleSubmit} />
      )}
      {view === 'conversation' && <ConversationView onSubmit={handleSubmit} />}
      <SettingsPanel />
    </div>
  );
}
