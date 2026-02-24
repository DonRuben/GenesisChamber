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
        useAppStore.getState().setActiveConversationId(convId);
        useAppStore.getState().updateConversation(convId, {
          title: q.slice(0, 60) + (q.length > 60 ? '...' : ''),
          mode: 'council',
          question: q,
          preset: store.preset,
          models: store.activeModels,
        });
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
        chairman: {
          model: store.chairmanModel,
          thinking_mode: store.chairman.thinkingMode,
          web_search: store.chairman.webSearch,
        },
        moderator: {
          soul_id: store.moderator.soulId,
          model: store.moderator.modelId,
          thinking_mode: store.moderator.thinkingMode,
          web_search: store.moderator.webSearch,
          also_participant: store.moderator.alsoParticipant,
        },
        evaluator: {
          soul_id: store.evaluator.soulId,
          model: store.evaluator.modelId,
          thinking_mode: store.evaluator.thinkingMode,
          web_search: store.evaluator.webSearch,
          also_participant: store.evaluator.alsoParticipant,
        },
        devilsAdvocate: {
          enabled: store.devilsAdvocate.enabled,
          model: store.devilsAdvocate.modelId,
          thinking_mode: store.devilsAdvocate.thinkingMode,
          web_search: store.devilsAdvocate.webSearch,
          aggression: store.devilsAdvocate.aggressionLevel,
          critique_focus: store.devilsAdvocate.critiqueFocus,
          attack_strategy: store.devilsAdvocate.attackStrategy,
          max_elimination_pct: store.devilsAdvocate.maxEliminationPct,
        },
        signal: ctrl.signal,
      });
    } catch (err) {
      if (err.name === 'AbortError') return;
      store.setError(err.message);
    }
  }, []);

  const handlePreset = (p) => {
    setPreset(p);
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
