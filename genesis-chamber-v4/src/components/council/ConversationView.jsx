// ─────────────────────────────────────────────────────────
// GENESIS CHAMBER V4 — CONVERSATION VIEW
// Question + tabbed responses + synthesis + follow-up
// Reads from councilStore for live API data, falls back to mock
// ─────────────────────────────────────────────────────────

import { useEffect } from 'react';
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
import { useModelLookup } from '../../hooks/useModels';

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

function ResponseTabBar({ tabs, selectedTab, onSelect, t }) {
  return (
    <div style={{
      display: 'flex', gap: 6, marginBottom: 16, overflowX: 'auto',
      paddingBottom: 4, flexWrap: 'wrap',
    }}>
      {tabs.map((tab) => {
        const isActive = selectedTab === tab.id;
        const accent = tab.color || t.cyan;
        return (
          <button
            key={tab.id}
            onClick={() => onSelect(tab.id)}
            style={{
              padding: '6px 14px', borderRadius: 6, cursor: 'pointer',
              background: isActive ? `${accent}1a` : 'transparent',
              border: `1px solid ${isActive ? accent : t.border}`,
              fontSize: 10, fontFamily: font.mono, fontWeight: 600,
              color: isActive ? accent : t.textMuted,
              textTransform: 'uppercase', letterSpacing: '0.06em',
              display: 'flex', alignItems: 'center', gap: 6,
              transition: 'all 0.13s', whiteSpace: 'nowrap',
            }}
          >
            {tab.dot && <ModelDot color={tab.dot} size={6} />}
            {tab.icon && <span style={{ fontSize: 12 }}>{tab.icon}</span>}
            {tab.label}
            {tab.pulse && (
              <div style={{
                width: 6, height: 6, borderRadius: 3,
                background: accent, animation: 'pulse 1.5s infinite',
              }} />
            )}
          </button>
        );
      })}
    </div>
  );
}

export default function ConversationView({ onSubmit }) {
  const t = useTokens();
  const { models } = useModels();
  const lookupModel = useModelLookup();
  const question = useCouncilStore((s) => s.question);
  const preset = useCouncilStore((s) => s.preset);
  const revealed = useCouncilStore((s) => s.revealed);
  const toggleReveal = useCouncilStore((s) => s.toggleReveal);
  const followUp = useCouncilStore((s) => s.followUp);
  const setFollowUp = useCouncilStore((s) => s.setFollowUp);
  const messages = useCouncilStore((s) => s.messages);
  const backendOnline = useAppStore((s) => s.backendOnline);
  const selectedTab = useCouncilStore((s) => s.selectedResponseTab);
  const setSelectedTab = useCouncilStore((s) => s.setSelectedResponseTab);

  // Live API state
  const stage1Results = useCouncilStore((s) => s.stage1Results);
  const stage2Results = useCouncilStore((s) => s.stage2Results);
  const stage3Result = useCouncilStore((s) => s.stage3Result);
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

  // Active model dots
  const activeModelInfo = models.filter((m) => activeModels.includes(m.id));

  // Synthesis available?
  const hasSynthesis = stage3Result || (backendOnline === false);

  // Build tab items
  const tabs = [];
  if (finalResponses) {
    finalResponses.forEach((resp, i) => {
      const modelId = resp.model || resp.modelId;
      const model = lookupModel(modelId);
      tabs.push({
        id: i,
        label: revealed ? model.name : `Model ${String.fromCharCode(65 + i)}`,
        dot: revealed ? model.color : undefined,
        color: revealed ? model.color : t.textMuted,
      });
    });
    tabs.push({ id: 'all', label: 'All', icon: IC.columns, color: t.textSoft });
    if (hasSynthesis || (loading && currentStage === 'stage3')) {
      tabs.push({
        id: 'synthesis',
        label: 'Synthesis',
        icon: IC.star,
        color: t.gold,
        pulse: loading && currentStage === 'stage3',
      });
    }
  }

  // Keyboard navigation (left/right arrows to switch tabs)
  const responseCount = finalResponses?.length ?? 0;
  useEffect(() => {
    if (!responseCount) return;
    const onKeyDown = (e) => {
      const current = useCouncilStore.getState().selectedResponseTab;
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (current === 'synthesis') setSelectedTab('all');
        else if (current === 'all') setSelectedTab(responseCount - 1);
        else if (typeof current === 'number' && current > 0) setSelectedTab(current - 1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (typeof current === 'number' && current < responseCount - 1) setSelectedTab(current + 1);
        else if (typeof current === 'number' && current === responseCount - 1) setSelectedTab('all');
        else if (current === 'all') setSelectedTab('synthesis');
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [responseCount, setSelectedTab]);

  const handleFollowUp = () => {
    if (!followUp.trim() || !onSubmit) return;
    onSubmit(followUp.trim());
    setFollowUp('');
  };

  // Previous turns: everything except the last pair (current turn)
  const prevMessages = messages.length > 0 ? messages.slice(0, -1) : [];

  // Render a single response card
  const renderResponseCard = (resp, i) => {
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
  };

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

        {/* Model participation bar + reveal toggle */}
        {!loading && responses && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
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

        {/* Tab bar */}
        {finalResponses && tabs.length > 0 && (
          <ResponseTabBar tabs={tabs} selectedTab={selectedTab} onSelect={setSelectedTab} t={t} />
        )}

        {/* Response content — tabbed */}
        {finalResponses && (
          <div style={{ marginBottom: 32 }}>
            {selectedTab === 'synthesis' ? (
              <SynthesisPanel />
            ) : selectedTab === 'all' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {finalResponses.map((resp, i) => renderResponseCard(resp, i))}
              </div>
            ) : typeof selectedTab === 'number' && finalResponses[selectedTab] ? (
              renderResponseCard(finalResponses[selectedTab], selectedTab)
            ) : (
              renderResponseCard(finalResponses[0], 0)
            )}
          </div>
        )}

        {/* Synthesis below responses (when not in synthesis tab) */}
        {finalResponses && selectedTab !== 'synthesis' && (responses || !loading) && (
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
