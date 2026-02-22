// ─────────────────────────────────────────────────────────
// GENESIS CHAMBER V4 — LLM COUNCIL
// Main orchestrator: landing → conversation
// Ref: gc-v4-llm-council.jsx:461-494
// ─────────────────────────────────────────────────────────

import { useCouncilStore } from '../../stores/councilStore';
import LandingState from './LandingState';
import ConversationView from './ConversationView';
import SettingsPanel from './SettingsPanel';

export default function LLMCouncil() {
  const view = useCouncilStore((s) => s.view);
  const setView = useCouncilStore((s) => s.setView);
  const setQuestion = useCouncilStore((s) => s.setQuestion);
  const setPreset = useCouncilStore((s) => s.setPreset);

  const handlePreset = (p) => {
    setPreset(p.key);
    setQuestion(p.placeholder);
    setView('conversation');
  };

  const handleSubmit = (q) => {
    setQuestion(q);
    setPreset(null);
    setView('conversation');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      {view === 'landing' && (
        <LandingState onPreset={handlePreset} onSubmit={handleSubmit} />
      )}
      {view === 'conversation' && <ConversationView />}
      <SettingsPanel />
    </div>
  );
}
