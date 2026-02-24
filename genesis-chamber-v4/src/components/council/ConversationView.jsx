// ─────────────────────────────────────────────────────────
// GENESIS CHAMBER V4 — CONVERSATION VIEW
// Question + tabbed responses + leaderboard + compare +
// synthesis + follow-up
// Reads from councilStore for live API data, falls back to mock
// ─────────────────────────────────────────────────────────

import { useEffect, useState } from 'react';
import { font } from '../../design/tokens';
import { IC } from '../../design/icons';
import { Tag, ModelDot } from '../../design/shared';
import { useCouncilStore } from '../../stores/councilStore';
import { useAppStore } from '../../stores/appStore';
import { PRESETS, MOCK_RESPONSES } from '../../data/mock';
import { SkeletonResponseCard, StageIndicator, StageProgressBar, ErrorCard } from '../../design/skeletons';
import { MOCK_TEAMS } from '../../data/mock';
import ResponseCard from './ResponseCard';
import SynthesisPanel from './SynthesisPanel';
import ChatInput from './ChatInput';
import { useTokens } from '../../hooks/useTokens';
import { useModels } from '../../hooks/useModels';
import { useModelLookup } from '../../hooks/useModels';
import { useIsMobile } from '../../hooks/useMediaQuery';
import Markdown from '../../design/Markdown';

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
      position: 'sticky', top: 0, zIndex: 10,
      background: t.bg,
      paddingTop: 8, paddingBottom: 8, marginBottom: 8,
      borderBottom: `1px solid ${t.border}`,
    }}>
      <div style={{
        display: 'flex', gap: 6, overflowX: 'auto',
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
    </div>
  );
}

// ─── Leaderboard Panel ──────────────────────────────────
function LeaderboardPanel({ stage2Results, t }) {
  const lookupModel = useModelLookup();
  const [showRawEvals, setShowRawEvals] = useState(false);
  const [rawEvalTab, setRawEvalTab] = useState(0);

  const aggregateRankings = stage2Results?.aggregateRankings;
  const rankings = stage2Results?.rankings;
  const labelToModel = stage2Results?.labelToModel || {};

  // Mock fallback: sort MOCK_RESPONSES by score
  const rankData = aggregateRankings
    || [...MOCK_RESPONSES].sort((a, b) => b.score - a.score).map((r, i) => ({
      model: r.model || r.modelId,
      average_rank: i + 1,
      rankings_count: MOCK_RESPONSES.length,
      pct: r.score,
    }));

  const totalEntries = rankData.length;

  const getMedalColor = (idx) => {
    if (idx === 0) return t.gold;
    if (idx === 1) return t.textSoft;
    if (idx === 2) return '#CD7F32';
    return t.textMuted;
  };

  // De-anonymize text by replacing Response A/B/C labels with model names
  const deAnonymize = (text) => {
    if (!text || !labelToModel) return text;
    let result = text;
    Object.entries(labelToModel).forEach(([label, modelId]) => {
      const m = lookupModel(modelId);
      result = result.replace(new RegExp(label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), `**${m.name}**`);
    });
    return result;
  };

  return (
    <div className="gc-enter" style={{
      background: t.surface, border: `1px solid ${t.border}`, borderRadius: 8,
      borderLeft: `2px solid ${t.gold}`, padding: '20px 24px',
    }}>
      {/* Aggregate Leaderboard */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <span style={{ fontSize: 14, color: t.gold }}>{IC.trophy}</span>
        <span style={{
          fontSize: 9, fontFamily: font.mono, fontWeight: 500, color: t.gold,
          textTransform: 'uppercase', letterSpacing: '0.12em',
        }}>AGGREGATE LEADERBOARD</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {rankData.map((r, i) => {
          const modelId = r.model || r.model_name || r.modelId;
          const m = lookupModel(modelId);
          const barWidth = ((totalEntries - i) / totalEntries) * 100;
          const medalColor = getMedalColor(i);

          return (
            <div key={modelId || i} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0',
            }}>
              {/* Rank medal */}
              <span style={{
                fontSize: 13, fontFamily: font.mono, fontWeight: 700, color: medalColor,
                minWidth: 24, textAlign: 'center',
              }}>
                #{i + 1}
              </span>
              {/* Model dot + name */}
              <ModelDot color={m.color} size={8} />
              <span style={{
                fontSize: 12, fontWeight: 500, color: t.text, minWidth: 100,
              }}>
                {m.name}
              </span>
              {/* Score bar */}
              <div style={{ flex: 1, height: 6, background: t.surfaceRaised, borderRadius: 3, overflow: 'hidden' }}>
                <div style={{
                  width: `${barWidth}%`, height: '100%', borderRadius: 3,
                  background: medalColor, transition: 'width 0.3s',
                }} />
              </div>
              {/* Average rank */}
              <span style={{ fontSize: 11, fontFamily: font.mono, color: t.textMuted, minWidth: 36, textAlign: 'right' }}>
                {r.average_rank != null ? r.average_rank.toFixed(1) : (i + 1)}
              </span>
              {/* Vote count */}
              {r.rankings_count != null && (
                <span style={{ fontSize: 9, fontFamily: font.mono, color: t.textMuted }}>
                  ({r.rankings_count})
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Raw Evaluations (collapsible) */}
      {rankings && rankings.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <button
            onClick={() => setShowRawEvals(!showRawEvals)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'transparent', border: `1px solid ${t.border}`, borderRadius: 6,
              padding: '8px 14px', cursor: 'pointer',
              fontSize: 10, fontFamily: font.mono, fontWeight: 600,
              color: t.textSoft, textTransform: 'uppercase', letterSpacing: '0.06em',
            }}
          >
            Raw Evaluations
            <span style={{ fontSize: 12 }}>{showRawEvals ? IC.chevUp : IC.chevDown}</span>
          </button>

          {showRawEvals && (
            <div style={{ marginTop: 12 }}>
              {/* Evaluator tabs */}
              <div style={{ display: 'flex', gap: 4, marginBottom: 12, flexWrap: 'wrap' }}>
                {rankings.map((r, i) => {
                  const evalModel = lookupModel(r.model);
                  const isActive = rawEvalTab === i;
                  return (
                    <button
                      key={r.model || i}
                      onClick={() => setRawEvalTab(i)}
                      style={{
                        padding: '4px 10px', borderRadius: 4, cursor: 'pointer',
                        background: isActive ? `${evalModel.color}1a` : 'transparent',
                        border: `1px solid ${isActive ? evalModel.color : t.border}`,
                        fontSize: 10, fontFamily: font.mono, fontWeight: 600,
                        color: isActive ? evalModel.color : t.textMuted,
                        display: 'flex', alignItems: 'center', gap: 4,
                      }}
                    >
                      <ModelDot color={evalModel.color} size={5} />
                      {evalModel.name}
                    </button>
                  );
                })}
              </div>

              {/* Selected evaluator's ranking */}
              {rankings[rawEvalTab] && (
                <div style={{
                  padding: '14px 16px', background: t.surfaceRaised, borderRadius: 6,
                  borderLeft: `2px solid ${lookupModel(rankings[rawEvalTab].model).color}`,
                }}>
                  {/* Parsed ranking chips */}
                  {rankings[rawEvalTab].parsed_ranking && (
                    <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
                      {rankings[rawEvalTab].parsed_ranking.map((label, idx) => {
                        const resolvedModel = labelToModel[label] ? lookupModel(labelToModel[label]) : null;
                        return (
                          <div key={idx} style={{
                            display: 'flex', alignItems: 'center', gap: 4,
                            padding: '3px 8px', borderRadius: 4,
                            background: idx === 0 ? `${t.gold}1a` : t.surface,
                            border: `1px solid ${idx === 0 ? t.gold : t.border}`,
                          }}>
                            <span style={{
                              fontSize: 10, fontFamily: font.mono, fontWeight: 700,
                              color: idx === 0 ? t.gold : t.textMuted,
                            }}>
                              {idx + 1}
                            </span>
                            {resolvedModel && <ModelDot color={resolvedModel.color} size={5} />}
                            <span style={{ fontSize: 10, fontFamily: font.mono, color: t.text }}>
                              {resolvedModel ? resolvedModel.name : label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {/* De-anonymized ranking text */}
                  <Markdown>{deAnonymize(rankings[rawEvalTab].ranking)}</Markdown>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main ConversationView ──────────────────────────────
export default function ConversationView({ onSubmit }) {
  const t = useTokens();
  const { models } = useModels();
  const lookupModel = useModelLookup();
  const isMobile = useIsMobile();
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

  // Compare mode
  const compareMode = useCouncilStore((s) => s.compareMode);
  const setCompareMode = useCouncilStore((s) => s.setCompareMode);
  const compareLeft = useCouncilStore((s) => s.compareLeft);
  const compareRight = useCouncilStore((s) => s.compareRight);
  const setCompareLeft = useCouncilStore((s) => s.setCompareLeft);
  const setCompareRight = useCouncilStore((s) => s.setCompareRight);

  // Live API state
  const stage1Results = useCouncilStore((s) => s.stage1Results);
  const stage2Results = useCouncilStore((s) => s.stage2Results);
  const stage3Result = useCouncilStore((s) => s.stage3Result);
  const loading = useCouncilStore((s) => s.loading);
  const currentStage = useCouncilStore((s) => s.currentStage);
  const error = useCouncilStore((s) => s.error);
  const activeModels = useCouncilStore((s) => s.activeModels);
  const modelThinkingModes = useCouncilStore((s) => s.modelThinkingModes);
  const thinkingMode = useCouncilStore((s) => s.thinkingMode);

  // Build soul info for skeleton cards from active models
  const skeletonSouls = activeModels.map((modelId) => {
    const modelInfo = lookupModel(modelId);
    // Find a team for this model
    let group = null;
    for (const team of MOCK_TEAMS) {
      if (team.personas.some((p) => p.model === modelId)) {
        group = team.id;
        break;
      }
    }
    const effectiveThinking = modelThinkingModes[modelId] || thinkingMode;
    return {
      id: modelId,
      name: modelInfo.name,
      group,
      modelId,
      thinkingMode: effectiveThinking,
    };
  });

  // Track completed responses for progress bar
  const completedCount = responses ? responses.length : 0;
  const totalParticipants = activeModels.length;

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

  // Leaderboard available?
  const hasLeaderboard = stage2Results || (backendOnline === false);

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
    if (hasLeaderboard) {
      tabs.push({ id: 'leaderboard', label: 'Leaderboard', icon: IC.trophy, color: t.gold });
    }
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
        if (current === 'synthesis') setSelectedTab('leaderboard');
        else if (current === 'leaderboard') setSelectedTab('all');
        else if (current === 'all') setSelectedTab(responseCount - 1);
        else if (typeof current === 'number' && current > 0) setSelectedTab(current - 1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (typeof current === 'number' && current < responseCount - 1) setSelectedTab(current + 1);
        else if (typeof current === 'number' && current === responseCount - 1) setSelectedTab('all');
        else if (current === 'all') setSelectedTab('leaderboard');
        else if (current === 'leaderboard') setSelectedTab('synthesis');
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

  // Render a single response card (with completion transition from skeleton)
  const renderResponseCard = (resp, i) => {
    const modelId = resp.model || resp.modelId;
    const isWinner = revealed && winner && (winner.model || winner.modelId) === modelId;
    const rank = revealed && ranked
      ? ranked.findIndex((r) => (r.model || r.modelId) === modelId) + 1
      : null;
    return (
      <div key={modelId || i} style={{
        animation: loading ? 'cardComplete 0.5s ease-out' : undefined,
      }}>
        <ResponseCard
          response={resp}
          index={i}
          revealed={revealed}
          isWinner={isWinner}
          rank={rank}
          score={resp._score}
        />
      </div>
    );
  };

  // Compare mode selector style
  const selectStyle = {
    padding: '6px 10px', borderRadius: 4,
    background: t.surfaceRaised, border: `1px solid ${t.border}`,
    fontSize: 11, fontFamily: font.mono, color: t.text,
    cursor: 'pointer', outline: 'none', width: '100%',
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

        {/* Stage progress bar during generation */}
        {loading && (currentStage === 'stage1' || !currentStage) && (
          <StageProgressBar
            completedCount={completedCount}
            totalParticipants={totalParticipants}
            stageName="Stage 1: Generation"
          />
        )}

        {/* Model participation bar + reveal toggle + compare toggle */}
        {!loading && responses && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
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
            {/* Compare toggle */}
            <button
              onClick={() => setCompareMode(!compareMode)}
              disabled={modelCount < 2}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px',
                background: compareMode ? `${t.cyan}1a` : 'transparent',
                border: `1px solid ${compareMode ? t.cyan : t.border}`, borderRadius: 5,
                cursor: modelCount < 2 ? 'not-allowed' : 'pointer',
                fontSize: 11, fontFamily: font.mono,
                color: compareMode ? t.cyan : t.textSoft,
                letterSpacing: '0.04em', opacity: modelCount < 2 ? 0.4 : 1,
              }}
            >
              <span style={{ fontSize: 13 }}>{IC.columns}</span>
              {compareMode ? 'Exit Compare' : 'Compare'}
            </button>
            {/* Reveal toggle */}
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
            {skeletonSouls.map((soul, i) => (
              <SkeletonResponseCard key={soul.id} soul={soul} cardIndex={i} />
            ))}
          </div>
        )}

        {/* Error card */}
        {error && (
          <div style={{ marginBottom: 32 }}>
            <ErrorCard message={error} onRetry={() => onSubmit?.(question)} />
          </div>
        )}

        {/* Tab bar (hidden in compare mode) */}
        {finalResponses && tabs.length > 0 && !compareMode && (
          <ResponseTabBar tabs={tabs} selectedTab={selectedTab} onSelect={setSelectedTab} t={t} />
        )}

        {/* Compare mode view */}
        {finalResponses && compareMode && (
          <div style={{ marginBottom: 32 }}>
            <div style={{
              display: 'flex', gap: 12,
              flexDirection: isMobile ? 'column' : 'row',
            }}>
              {/* Left */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <select
                  value={compareLeft}
                  onChange={(e) => setCompareLeft(Number(e.target.value))}
                  style={selectStyle}
                >
                  {finalResponses.map((r, i) => {
                    const mid = r.model || r.modelId;
                    const m = lookupModel(mid);
                    return (
                      <option key={mid || i} value={i}>
                        {revealed ? m.name : `Model ${String.fromCharCode(65 + i)}`}
                      </option>
                    );
                  })}
                </select>
                {finalResponses[compareLeft] && renderResponseCard(finalResponses[compareLeft], compareLeft)}
              </div>
              {/* Divider */}
              {!isMobile && (
                <div style={{ width: 1, background: t.border, alignSelf: 'stretch' }} />
              )}
              {/* Right */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <select
                  value={compareRight}
                  onChange={(e) => setCompareRight(Number(e.target.value))}
                  style={selectStyle}
                >
                  {finalResponses.map((r, i) => {
                    const mid = r.model || r.modelId;
                    const m = lookupModel(mid);
                    return (
                      <option key={mid || i} value={i}>
                        {revealed ? m.name : `Model ${String.fromCharCode(65 + i)}`}
                      </option>
                    );
                  })}
                </select>
                {finalResponses[compareRight] && renderResponseCard(finalResponses[compareRight], compareRight)}
              </div>
            </div>
          </div>
        )}

        {/* Response content — tabbed (hidden in compare mode) */}
        {finalResponses && !compareMode && (
          <div style={{ marginBottom: 32 }}>
            {selectedTab === 'synthesis' ? (
              <SynthesisPanel />
            ) : selectedTab === 'leaderboard' ? (
              <LeaderboardPanel stage2Results={stage2Results} t={t} />
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
