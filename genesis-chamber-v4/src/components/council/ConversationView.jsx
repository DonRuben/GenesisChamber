// ─────────────────────────────────────────────────────────
// GENESIS CHAMBER V4 — CONVERSATION VIEW
// Question + responses + synthesis + follow-up
// Ref: gc-v4-llm-council.jsx:190-363
// ─────────────────────────────────────────────────────────

import { T, TLight, font } from '../../design/tokens';
import { IC } from '../../design/icons';
import { Tag, ModelDot } from '../../design/shared';
import { useAppStore } from '../../stores/appStore';
import { useCouncilStore } from '../../stores/councilStore';
import { MODELS, PRESETS, MOCK_RESPONSES } from '../../data/mock';
import ResponseCard from './ResponseCard';
import SynthesisPanel from './SynthesisPanel';
import ChatInput from './ChatInput';

function useTokens() {
  const theme = useAppStore((s) => s.theme);
  return theme === 'light' ? { ...T, ...TLight } : T;
}

export default function ConversationView() {
  const t = useTokens();
  const question = useCouncilStore((s) => s.question);
  const preset = useCouncilStore((s) => s.preset);
  const revealed = useCouncilStore((s) => s.revealed);
  const toggleReveal = useCouncilStore((s) => s.toggleReveal);
  const followUp = useCouncilStore((s) => s.followUp);
  const setFollowUp = useCouncilStore((s) => s.setFollowUp);

  const ranked = [...MOCK_RESPONSES].sort((a, b) => b.score - a.score);
  const winner = ranked[0];
  const displayResponses = revealed ? ranked : MOCK_RESPONSES;
  const presetData = preset ? PRESETS.find((p) => p.key === preset) : null;

  return (
    <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
      <div style={{ maxWidth: 760, margin: '0 auto', width: '100%', padding: '32px 24px' }}>

        {/* Question header */}
        <div style={{ marginBottom: 32 }}>
          {presetData && (
            <div style={{ marginBottom: 10 }}>
              <Tag color={presetData.color}>{preset}</Tag>
            </div>
          )}
          <div style={{
            fontSize: 16, fontWeight: 600, color: t.text, lineHeight: 1.6,
            padding: '16px 20px', background: t.surface, borderRadius: 8,
            borderLeft: `2px solid ${T.cyan}`,
          }}>
            {question}
          </div>
        </div>

        {/* Model participation bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <span style={{
            fontSize: 9, fontFamily: font.mono, color: t.textMuted,
            textTransform: 'uppercase', letterSpacing: '0.12em',
          }}>
            {MODELS.length} MODELS RESPONDING
          </span>
          <div style={{ display: 'flex', gap: 6 }}>
            {MODELS.map((m) => <ModelDot key={m.id} color={m.color} size={8} />)}
          </div>
          <div style={{ flex: 1 }} />
          <button onClick={toggleReveal}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px',
              background: 'transparent', border: `1px solid ${t.border}`, borderRadius: 5,
              cursor: 'pointer', fontSize: 11, fontFamily: font.mono, color: t.textSoft,
              letterSpacing: '0.04em',
            }}>
            <span style={{ fontSize: 13 }}>{revealed ? IC.eye : IC.eyeOff}</span>
            {revealed ? 'Models visible' : 'Reveal models'}
          </button>
        </div>

        {/* Response cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
          {displayResponses.map((resp, i) => {
            const isWinner = revealed && resp.modelId === winner.modelId;
            const rank = revealed ? ranked.findIndex((r) => r.modelId === resp.modelId) + 1 : null;
            return (
              <ResponseCard
                key={resp.modelId}
                response={resp}
                index={i}
                revealed={revealed}
                isWinner={isWinner}
                rank={rank}
              />
            );
          })}
        </div>

        {/* Synthesis */}
        <div style={{ marginBottom: 32 }}>
          <SynthesisPanel />
        </div>

        {/* Follow-up input */}
        <div style={{ position: 'sticky', bottom: 0, paddingBottom: 24, display: 'flex', justifyContent: 'center' }}>
          <ChatInput
            value={followUp}
            onChange={setFollowUp}
            onSubmit={() => { /* follow-up handler */ }}
            placeholder="Ask a follow-up question..."
          />
        </div>
      </div>
    </div>
  );
}
