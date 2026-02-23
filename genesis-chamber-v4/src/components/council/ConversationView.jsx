// ─────────────────────────────────────────────────────────
// GENESIS CHAMBER V4 — CONVERSATION VIEW
// Question + responses + synthesis + follow-up
// Reads from councilStore for live API data, falls back to mock
// ─────────────────────────────────────────────────────────

import { font } from '../../design/tokens';
import { IC } from '../../design/icons';
import { Tag, ModelDot } from '../../design/shared';
import { useCouncilStore } from '../../stores/councilStore';
import { useAppStore } from '../../stores/appStore';
import { PRESETS, MOCK_RESPONSES } from '../../data/mock';
import { SkeletonResponseCard, StageIndicator, ErrorCard } from '../../design/skeletons';
import ResponseCard from './ResponseCard';
import SynthesisPanel from './SynthesisPanel';
import ChatInput from './ChatInput';
import { useTokens } from '../../hooks/useTokens';
import { useModels } from '../../hooks/useModels';

function UserBubble({ text, color, muted }) {
  const t = useTokens();
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
      <div style={{
        maxWidth: '85%', padding: '12px 16px',
        fontSize: 13, lineHeight: 1.6, color: muted ? t.textMuted : t.text,
        background: `${color || t.cyan}12`,
        borderRadius: '12px 12px 4px 12px',
      }}>
        {text}
      </div>
    </div>
  );
}

function PreviousRoundSummary({ message }) {
  const t = useTokens();
  const count = message.stage1?.length || 0;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16,
      padding: '8px 14px', background: t.surfaceRaised, borderRadius: 6,
      borderLeft: `2px solid ${t.textMuted}`,
    }}>
      <span style={{
        fontSize: 9, fontFamily: font.mono, color: t.textMuted,
        textTransform: 'uppercase', letterSpacing: '0.12em',
      }}>
        PREVIOUS ROUND — {count} RESPONSES
      </span>
    </div>
  );
}

export default function ConversationView({ onSubmit }) {
  const t = useTokens();
  const { models } = useModels();
  const question = useCouncilStore((s) => s.question);
  const preset = useCouncilStore((s) => s.preset);
  const revealed = useCouncilStore((s) => s.revealed);
  const toggleReveal = useCouncilStore((s) => s.toggleReveal);
  const followUp = useCouncilStore((s) => s.followUp);
  const setFollowUp = useCouncilStore((s) => s.setFollowUp);
  const messages = useCouncilStore((s) => s.messages);
  const backendOnline = useAppStore((s) => s.backendOnline);

  // Live API state
  const stage1Results = useCouncilStore((s) => s.stage1Results);
  const stage2Results = useCouncilStore((s) => s.stage2Results);
  const loading = useCouncilStore((s) => s.loading);
  const currentStage = useCouncilStore((s) => s.currentStage);
  const error = useCouncilStore((s) => s.error);
  const activeModels = useCouncilStore((s) => s.activeModels);

  // Determine data source: live API or mock fallback
  const responses = stage1Results || (backendOnline === false ? MOCK_RESPONSES : null);
  const modelCount = responses ? responses.length : activeModels.length;

  // Build display responses with scores from stage2 if available
  const displayResponses = responses ? responses.map((resp) => {
    const modelId = resp.model || resp.modelId;
    let score = resp.score;
    if (stage2Results?.aggregateRankings) {
      const ranking = stage2Results.aggregateRankings.find(
        (r) => r.model === modelId || r.model_name === modelId
      );
      if (ranking) score = ranking.pct ?? ranking.score ?? score;
    }
    return { ...resp, _score: score };
  }) : null;

  const ranked = displayResponses
    ? [...displayResponses].sort((a, b) => (b._score ?? 0) - (a._score ?? 0))
    : null;
  const winner = ranked?.[0];
  const finalResponses = revealed && ranked ? ranked : displayResponses;

  const presetData = preset ? PRESETS.find((p) => p.key === preset) : null;

  // Active model dots — only show dots for active models
  const activeModelInfo = models.filter((m) => activeModels.includes(m.id));

  const handleFollowUp = () => {
    if (!followUp.trim() || !onSubmit) return;
    onSubmit(followUp.trim());
    setFollowUp('');
  };

  // Previous turns: everything except the last pair (current turn)
  const prevMessages = messages.length > 0 ? messages.slice(0, -1) : [];

  return (
    <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
      <div style={{ maxWidth: 760, margin: '0 auto', width: '100%', padding: '32px 24px' }}>

        {/* Previous conversation history */}
        {prevMessages.map((msg, i) => (
          msg.role === 'user'
            ? <UserBubble key={`prev-${i}`} text={msg.content} color={t.textMuted} muted />
            : <PreviousRoundSummary key={`prev-${i}`} message={msg} />
        ))}

        {/* Current question — user bubble style */}
        <div style={{ marginBottom: 24 }}>
          {presetData && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 6 }}>
              <Tag color={presetData.color}>{presetData.label}</Tag>
            </div>
          )}
          <UserBubble text={question} color={t.cyan} />
        </div>

        {/* Stage indicator when loading */}
        {loading && currentStage && (
          <StageIndicator currentStage={currentStage} />
        )}

        {/* Model participation bar */}
        {!loading && responses && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <span style={{
              fontSize: 9, fontFamily: font.mono, color: t.textMuted,
              textTransform: 'uppercase', letterSpacing: '0.12em',
            }}>
              {modelCount} MODELS RESPONDING
            </span>
            <div style={{ display: 'flex', gap: 6 }}>
              {activeModelInfo.map((m) => <ModelDot key={m.id} color={m.color} size={8} />)}
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
        )}

        {/* Skeleton cards during stage1 */}
        {loading && (currentStage === 'stage1' || !currentStage) && !responses && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
            {activeModels.map((_, i) => <SkeletonResponseCard key={i} />)}
          </div>
        )}

        {/* Error card */}
        {error && (
          <div style={{ marginBottom: 32 }}>
            <ErrorCard message={error} onRetry={() => onSubmit?.(question)} />
          </div>
        )}

        {/* Response cards */}
        {finalResponses && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
            {finalResponses.map((resp, i) => {
              const modelId = resp.model || resp.modelId;
              const isWinner = revealed && winner && (winner.model || winner.modelId) === modelId;
              const rank = revealed && ranked
                ? ranked.findIndex((r) => (r.model || r.modelId) === modelId) + 1
                : null;
              return (
                <ResponseCard
                  key={modelId || i}
                  response={resp}
                  index={i}
                  revealed={revealed}
                  isWinner={isWinner}
                  rank={rank}
                  score={resp._score}
                />
              );
            })}
          </div>
        )}

        {/* Synthesis */}
        {(responses || !loading) && (
          <div style={{ marginBottom: 32 }}>
            <SynthesisPanel />
          </div>
        )}

        {/* Follow-up input */}
        <div style={{ position: 'sticky', bottom: 0, paddingBottom: 24, display: 'flex', justifyContent: 'center' }}>
          <ChatInput
            value={followUp}
            onChange={setFollowUp}
            onSubmit={handleFollowUp}
            placeholder="Ask a follow-up question..."
            disabled={loading}
          />
        </div>
      </div>
    </div>
  );
}
