// ─────────────────────────────────────────────────────────
// GENESIS CHAMBER V4 — SETTINGS PANEL
// Slide-in panel: active models + per-model thinking +
// web search + chairman model + anonymization toggle
// Models grouped by tier with dynamic roster
// 5-level thinking: off/low/medium/high/max + adaptive
// ─────────────────────────────────────────────────────────

import { useState, useRef } from 'react';
import { font } from '../../design/tokens';
import { IC } from '../../design/icons';
import { ModelDot, Toggle } from '../../design/shared';
import { useCouncilStore } from '../../stores/councilStore';
import { useTokens } from '../../hooks/useTokens';
import { useModels } from '../../hooks/useModels';
import { MODEL_TIERS } from '../../data/mock';

// ── InfoTooltip ──
function InfoTooltip({ text, t }) {
  const [show, setShow] = useState(false);
  const ref = useRef(null);
  return (
    <span
      ref={ref}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      style={{ position: 'relative', cursor: 'help', fontSize: 11, color: t.textMuted, lineHeight: 1 }}
    >
      {IC.info}
      {show && (
        <span style={{
          position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)',
          marginBottom: 6, padding: '6px 10px', borderRadius: 6,
          background: t.surfaceRaised, border: `1px solid ${t.border}`,
          fontSize: 10, color: t.text, zIndex: 300,
          lineHeight: 1.4, maxWidth: 240, whiteSpace: 'normal',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        }}>{text}</span>
      )}
    </span>
  );
}

// ── Thinking options per model type ──
function getModelThinkingType(modelId) {
  const id = modelId.toLowerCase();
  if (id.includes('claude-opus-4-6') || id.includes('claude-opus-4.6') ||
      id.includes('claude-sonnet-4-6') || id.includes('claude-sonnet-4.6')) return 'full';
  if (id.includes('o3-pro')) return 'fixed';
  if (id.includes('sonar')) return 'fixed';
  return 'standard';
}

export default function SettingsPanel() {
  const t = useTokens();
  const { models } = useModels();
  const settingsOpen = useCouncilStore((s) => s.settingsOpen);
  const toggleSettings = useCouncilStore((s) => s.toggleSettings);
  const anonymized = useCouncilStore((s) => s.anonymized);
  const setAnonymized = useCouncilStore((s) => s.setAnonymized);
  const activeModels = useCouncilStore((s) => s.activeModels);
  const toggleModel = useCouncilStore((s) => s.toggleModel);
  const thinkingMode = useCouncilStore((s) => s.thinkingMode);
  const setThinkingMode = useCouncilStore((s) => s.setThinkingMode);
  const modelThinkingModes = useCouncilStore((s) => s.modelThinkingModes);
  const setModelThinkingMode = useCouncilStore((s) => s.setModelThinkingMode);
  const enableWebSearch = useCouncilStore((s) => s.enableWebSearch);
  const setEnableWebSearch = useCouncilStore((s) => s.setEnableWebSearch);
  const chairmanModel = useCouncilStore((s) => s.chairmanModel);
  const setChairmanModel = useCouncilStore((s) => s.setChairmanModel);
  const chairman = useCouncilStore((s) => s.chairman);
  const setChairmanConfig = useCouncilStore((s) => s.setChairmanConfig);
  const adaptiveMode = useCouncilStore((s) => s.adaptiveMode);
  const setAdaptiveMode = useCouncilStore((s) => s.setAdaptiveMode);

  // Collapsible tiers
  const [expandedChairTier, setExpandedChairTier] = useState('premium');
  const [expandedModelTiers, setExpandedModelTiers] = useState({ premium: true, balanced: true });

  // Override counter: how many active models have per-model thinking overrides
  const overrideCount = activeModels.filter((id) => modelThinkingModes[id] !== undefined).length;
  const defaultCount = activeModels.length - overrideCount;

  if (!settingsOpen) return null;

  const thinkingModes = [
    { id: 'off', label: 'Off', color: t.textMuted },
    { id: 'low', label: 'Low', color: '#6B7280' },
    { id: 'medium', label: 'Med', color: t.cyan },
    { id: 'high', label: 'High', color: t.gold },
    { id: 'max', label: 'Max', color: '#EF4444' },
  ];

  const thinkingTooltips = {
    off: 'No extended reasoning — fastest, cheapest',
    low: 'Light reasoning — good for simple queries',
    medium: 'Balanced reasoning — recommended default',
    high: 'Deep reasoning — complex analysis, 3x tokens',
    max: 'Maximum reasoning — Claude 4.6 adaptive, 3x tokens',
  };

  // Group models by tier
  const tierOrder = ['premium', 'balanced', 'efficient', 'budget', 'specialist'];
  const grouped = tierOrder.map((tierId) => ({
    tier: MODEL_TIERS.find((mt) => mt.id === tierId) || { id: tierId, name: tierId, color: '#6B7280' },
    models: models.filter((m) => m.tier === tierId),
  })).filter((g) => g.models.length > 0);

  const thinkingSelectStyle = {
    padding: '2px 4px', fontSize: 9, fontFamily: font.mono,
    background: t.surfaceRaised, border: `1px solid ${t.border}`,
    borderRadius: 3, color: t.text, cursor: 'pointer', outline: 'none',
  };

  // Check if any active model is Claude 4.6
  const hasClaude46Active = activeModels.some((id) => getModelThinkingType(id) === 'full');

  // Check if chairman is Claude 4.6
  const chairmanIsClaude46 = getModelThinkingType(chairmanModel) === 'full';

  // Render per-model thinking control
  const renderModelThinking = (m) => {
    const type = getModelThinkingType(m.id);
    if (type === 'fixed') {
      const label = m.id.includes('o3-pro') ? 'MAX' : 'SEARCH';
      const hint = m.id.includes('o3-pro') ? 'Always uses maximum reasoning' : 'Search model — no thinking mode';
      return (
        <span style={{
          fontSize: 8, fontFamily: font.mono, fontWeight: 700,
          color: m.id.includes('o3-pro') ? '#EF4444' : '#6366F1',
          background: m.id.includes('o3-pro') ? 'rgba(239,68,68,0.12)' : 'rgba(99,102,241,0.12)',
          padding: '1px 4px', borderRadius: 3, letterSpacing: '0.06em',
        }} title={hint}>{label}</span>
      );
    }
    return (
      <select
        value={modelThinkingModes[m.id] || thinkingMode}
        onChange={(e) => { e.stopPropagation(); setModelThinkingMode(m.id, e.target.value); }}
        onClick={(e) => e.stopPropagation()}
        style={thinkingSelectStyle}
      >
        <option value="off">Off</option>
        <option value="low">Low</option>
        <option value="medium">Med</option>
        <option value="high">High</option>
        {type === 'full' && <option value="max">Max</option>}
      </select>
    );
  };

  return (
    <div style={{
      position: 'fixed', top: 0, right: 0, bottom: 0, width: 320,
      background: t.surface, borderLeft: `1px solid ${t.border}`,
      zIndex: 200, display: 'flex', flexDirection: 'column',
      animation: 'slideInRight 0.2s ease-out',
    }}>
      {/* Header */}
      <div style={{
        padding: '20px 20px', borderBottom: `1px solid ${t.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{
          fontSize: 9, fontFamily: font.mono, fontWeight: 500,
          color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.12em',
        }}>COUNCIL SETTINGS</span>
        <button onClick={toggleSettings} style={{
          width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'transparent', border: 'none', cursor: 'pointer',
          color: t.textMuted, fontSize: 14,
        }}>{IC.x}</button>
      </div>

      {/* Content */}
      <div style={{ padding: 20, flex: 1, overflowY: 'auto' }}>
        {/* Active Models — grouped by tier */}
        <div style={{
          fontSize: 9, fontFamily: font.mono, color: t.textMuted,
          textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12,
        }}>ACTIVE MODELS</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 28 }}>
          {grouped.map(({ tier, models: tierModels }) => {
            const isExpanded = !!expandedModelTiers[tier.id];
            const activeInTier = tierModels.filter((m) => activeModels.includes(m.id)).length;
            return (
              <div key={tier.id}>
                <button
                  onClick={() => setExpandedModelTiers((prev) => ({ ...prev, [tier.id]: !prev[tier.id] }))}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    padding: '8px 0 4px',
                  }}
                >
                  <span style={{
                    fontSize: 9, fontFamily: font.mono, color: tier.color,
                    textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600,
                    display: 'flex', alignItems: 'center', gap: 5,
                  }}>
                    {tier.name}
                    {tier.warning && (
                      <span style={{
                        fontSize: 8, fontFamily: font.mono, fontWeight: 700,
                        color: '#EF4444', background: 'rgba(239,68,68,0.12)',
                        padding: '1px 4px', borderRadius: 3,
                      }}>{'\u26A0\uFE0F'}</span>
                    )}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{
                      fontSize: 9, fontFamily: font.mono,
                      color: activeInTier > 0 ? tier.color : t.textMuted,
                    }}>{activeInTier}/{tierModels.length}</span>
                    <span style={{ fontSize: 10, color: t.textMuted }}>
                      {isExpanded ? IC.chevUp : IC.chevDown}
                    </span>
                  </div>
                </button>
                {isExpanded && tierModels.map((m) => {
                  const active = activeModels.includes(m.id);
                  return (
                    <div key={m.id} style={{ marginBottom: 4 }}>
                      <button onClick={() => toggleModel(m.id)}
                        style={{
                          width: '100%', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10,
                          background: active ? t.surfaceRaised : 'transparent',
                          border: `1px solid ${active ? t.borderHover : t.border}`,
                          borderLeft: `2px solid ${active ? m.color : 'transparent'}`,
                          borderRadius: 6, cursor: 'pointer', transition: 'all 0.13s',
                        }}>
                        <ModelDot color={m.color} />
                        <span style={{
                          fontSize: 12, fontWeight: 500,
                          color: active ? t.text : t.textMuted,
                          flex: 1, textAlign: 'left',
                          display: 'flex', alignItems: 'center', gap: 5,
                        }}>
                          {m.name}
                          {m.capabilities?.includes('image') && (
                            <span style={{
                              fontSize: 8, fontFamily: font.mono, fontWeight: 700,
                              color: '#4ADE80', background: 'rgba(74,222,128,0.12)',
                              padding: '1px 4px', borderRadius: 3, letterSpacing: '0.06em',
                            }}>IMG</span>
                          )}
                          {m.capabilities?.includes('search') && (
                            <span style={{
                              fontSize: 8, fontFamily: font.mono, fontWeight: 700,
                              color: '#6366F1', background: 'rgba(99,102,241,0.12)',
                              padding: '1px 4px', borderRadius: 3, letterSpacing: '0.06em',
                            }}>SEARCH</span>
                          )}
                          {m.warning && (
                            <span style={{
                              fontSize: 8, fontFamily: font.mono, fontWeight: 600,
                              color: '#EF4444',
                            }}>{m.warning}</span>
                          )}
                        </span>
                        {/* Per-model thinking control */}
                        {active && renderModelThinking(m)}
                        {/* Price display */}
                        {m.inputPrice != null && (
                          <span style={{
                            fontSize: 8, fontFamily: font.mono, color: t.textMuted,
                            whiteSpace: 'nowrap',
                          }}>${m.inputPrice}</span>
                        )}
                        <div style={{
                          width: 16, height: 16, borderRadius: 3,
                          border: `1.5px solid ${active ? m.color : t.textMuted}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: active ? `${m.color}1a` : 'transparent',
                        }}>
                          {active && (
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={m.color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M5 12l5 5 9-9" />
                            </svg>
                          )}
                        </div>
                      </button>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Thinking Mode (global default) */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 12,
        }}>
          <span style={{
            fontSize: 9, fontFamily: font.mono, color: t.textMuted,
            textTransform: 'uppercase', letterSpacing: '0.12em',
          }}>THINKING MODE</span>
          <span style={{
            fontSize: 9, fontFamily: font.mono,
            color: overrideCount === 0 ? t.textMuted : overrideCount === activeModels.length ? t.gold : t.cyan,
          }}>
            {overrideCount === 0
              ? `All ${activeModels.length} using default`
              : overrideCount === activeModels.length
                ? `0 of ${activeModels.length} — all overridden`
                : `${defaultCount} of ${activeModels.length} using default`}
          </span>
        </div>

        <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
          {thinkingModes.map(({ id, label, color }) => (
            <div key={id} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
              <button
                onClick={() => setThinkingMode(id)}
                style={{
                  width: '100%', padding: '8px 6px', borderRadius: 6, cursor: 'pointer',
                  background: thinkingMode === id ? `${color}1a` : t.surfaceRaised,
                  border: `1px solid ${thinkingMode === id ? color : t.border}`,
                  fontSize: 10, fontFamily: font.mono, fontWeight: 600,
                  color: thinkingMode === id ? color : t.textMuted,
                  textTransform: 'uppercase', letterSpacing: '0.06em',
                }}
              >{label}</button>
              <InfoTooltip text={thinkingTooltips[id]} t={t} />
            </div>
          ))}
        </div>

        {/* Adaptive Mode checkbox — only when Claude 4.6 is active */}
        {hasClaude46Active && (
          <label style={{
            display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
            padding: '8px 0', marginBottom: 4,
          }}>
            <input
              type="checkbox"
              checked={adaptiveMode}
              onChange={(e) => setAdaptiveMode(e.target.checked)}
              style={{ accentColor: t.cyan, width: 14, height: 14 }}
            />
            <span style={{ fontSize: 11, color: t.text, fontWeight: 500 }}>Adaptive Thinking</span>
            <InfoTooltip text="Claude 4.6 decides its own reasoning depth per query — no budget cap" t={t} />
          </label>
        )}

        <div style={{
          fontSize: 10, color: t.textMuted, marginBottom: 28, lineHeight: 1.4,
        }}>
          Sets default for all models. Override per model in the list above.
        </div>

        {/* Internet Search */}
        <div style={{
          fontSize: 9, fontFamily: font.mono, color: t.textMuted,
          textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12,
        }}>INTERNET SEARCH</div>

        <button onClick={() => setEnableWebSearch(!enableWebSearch)}
          style={{
            width: '100%', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10,
            background: t.surfaceRaised, border: `1px solid ${t.border}`, borderRadius: 6,
            cursor: 'pointer', marginBottom: 28,
          }}>
          <span style={{ fontSize: 14, color: enableWebSearch ? t.cyan : t.textMuted }}>
            {IC.search}
          </span>
          <div style={{ flex: 1, textAlign: 'left' }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: t.text }}>Web Search</div>
            <div style={{ fontSize: 11, color: t.textMuted, marginTop: 2 }}>
              {enableWebSearch ? 'Models can search the web' : 'No internet access'}
            </div>
          </div>
          <Toggle enabled={enableWebSearch} onChange={setEnableWebSearch} color={t.cyan} />
        </button>

        {/* Chairman Model — collapsible tiers */}
        <div style={{
          fontSize: 9, fontFamily: font.mono, color: t.textMuted,
          textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12,
        }}>CHAIRMAN MODEL</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 28 }}>
          {grouped.map(({ tier, models: tierModels }) => (
            <div key={`chair-${tier.id}`}>
              <button
                onClick={() => setExpandedChairTier((prev) => prev === tier.id ? null : tier.id)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  padding: '8px 0 4px',
                }}
              >
                <span style={{
                  fontSize: 9, fontFamily: font.mono, color: tier.color,
                  textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600,
                }}>{tier.name}</span>
                <span style={{ fontSize: 10, color: t.textMuted }}>
                  {expandedChairTier === tier.id ? IC.chevUp : IC.chevDown}
                </span>
              </button>
              {expandedChairTier === tier.id && tierModels.map((m) => (
                <button key={m.id} onClick={() => setChairmanModel(m.id)}
                  style={{
                    width: '100%', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10,
                    background: chairmanModel === m.id ? t.surfaceRaised : 'transparent',
                    border: `1px solid ${chairmanModel === m.id ? t.borderHover : t.border}`,
                    borderLeft: `2px solid ${chairmanModel === m.id ? t.gold : 'transparent'}`,
                    borderRadius: 6, cursor: 'pointer', transition: 'all 0.13s',
                    marginBottom: 4,
                  }}>
                  <ModelDot color={m.color} size={6} />
                  <span style={{
                    fontSize: 11, fontWeight: 500,
                    color: chairmanModel === m.id ? t.text : t.textMuted,
                    flex: 1, textAlign: 'left',
                    display: 'flex', alignItems: 'center', gap: 5,
                  }}>
                    {m.name}
                    {m.capabilities?.includes('image') && (
                      <span style={{
                        fontSize: 8, fontFamily: font.mono, fontWeight: 700,
                        color: '#4ADE80', background: 'rgba(74,222,128,0.12)',
                        padding: '1px 4px', borderRadius: 3, letterSpacing: '0.06em',
                      }}>IMG</span>
                    )}
                    {m.capabilities?.includes('search') && (
                      <span style={{
                        fontSize: 8, fontFamily: font.mono, fontWeight: 700,
                        color: '#6366F1', background: 'rgba(99,102,241,0.12)',
                        padding: '1px 4px', borderRadius: 3, letterSpacing: '0.06em',
                      }}>SEARCH</span>
                    )}
                  </span>
                  {chairmanModel === m.id && (
                    <span style={{
                      fontSize: 8, fontFamily: font.mono, fontWeight: 600,
                      color: t.gold, textTransform: 'uppercase', letterSpacing: '0.08em',
                    }}>CHAIRMAN</span>
                  )}
                </button>
              ))}
            </div>
          ))}
        </div>

        {/* Chairman AI Capabilities */}
        <div style={{
          fontSize: 9, fontFamily: font.mono, color: t.textMuted,
          textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12,
        }}>CHAIRMAN AI CAPABILITIES</div>

        <div style={{
          padding: 16, background: t.surfaceRaised, border: `1px solid ${t.border}`,
          borderLeft: `2px solid ${t.gold}`, borderRadius: 6, marginBottom: 28,
        }}>
          <div style={{ marginBottom: 14 }}>
            <div style={{
              fontSize: 9, fontFamily: font.mono, color: t.textMuted,
              textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8,
            }}>Thinking</div>
            <div style={{ display: 'flex', gap: 4 }}>
              {thinkingModes.map(({ id, label, color }) => (
                <div key={id} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                  <button
                    onClick={() => setChairmanConfig({ thinkingMode: id })}
                    style={{
                      width: '100%', padding: '6px 4px', borderRadius: 5, cursor: 'pointer',
                      background: chairman.thinkingMode === id ? `${color}1a` : 'transparent',
                      border: `1px solid ${chairman.thinkingMode === id ? color : t.border}`,
                      fontSize: 9, fontFamily: font.mono, fontWeight: 600,
                      color: chairman.thinkingMode === id ? color : t.textMuted,
                      textTransform: 'uppercase', letterSpacing: '0.06em',
                    }}
                  >{label}</button>
                </div>
              ))}
            </div>
          </div>

          {/* Chairman Adaptive checkbox — only when chairman is Claude 4.6 */}
          {chairmanIsClaude46 && (
            <label style={{
              display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
              padding: '4px 0', marginBottom: 10,
            }}>
              <input
                type="checkbox"
                checked={chairman.adaptiveMode || false}
                onChange={(e) => setChairmanConfig({ adaptiveMode: e.target.checked })}
                style={{ accentColor: t.gold, width: 14, height: 14 }}
              />
              <span style={{ fontSize: 11, color: t.text, fontWeight: 500 }}>Adaptive Thinking</span>
              <InfoTooltip text="Chairman decides its own reasoning depth — recommended for synthesis" t={t} />
            </label>
          )}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 500, color: t.text }}>Web Search</div>
              <div style={{ fontSize: 10, color: t.textMuted, marginTop: 1 }}>
                {chairman.webSearch ? 'Chairman can search the web' : 'No internet access'}
              </div>
            </div>
            <Toggle enabled={chairman.webSearch} onChange={(v) => setChairmanConfig({ webSearch: v })} color={t.gold} />
          </div>

          <div style={{
            fontSize: 10, color: t.textMuted, marginTop: 12, lineHeight: 1.4,
          }}>
            Chairman synthesizes all responses in Stage 3. Higher thinking produces more nuanced synthesis.
          </div>
        </div>

        {/* Anonymization toggle */}
        <div style={{
          fontSize: 9, fontFamily: font.mono, color: t.textMuted,
          textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12,
        }}>DISPLAY</div>

        <button onClick={() => setAnonymized(!anonymized)}
          style={{
            width: '100%', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10,
            background: t.surfaceRaised, border: `1px solid ${t.border}`, borderRadius: 6,
            cursor: 'pointer',
          }}>
          <span style={{ fontSize: 14, color: anonymized ? t.cyan : t.textMuted }}>
            {anonymized ? IC.eyeOff : IC.eye}
          </span>
          <div style={{ flex: 1, textAlign: 'left' }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: t.text }}>Anonymized Responses</div>
            <div style={{ fontSize: 11, color: t.textMuted, marginTop: 2 }}>
              {anonymized ? 'Model names hidden until reveal' : 'Model names visible immediately'}
            </div>
          </div>
          <div style={{
            width: 36, height: 20, borderRadius: 10, padding: 2,
            background: anonymized ? t.cyan : t.surfaceHover,
            transition: 'background 0.15s',
          }}>
            <div style={{
              width: 16, height: 16, borderRadius: 8, background: '#fff',
              transform: anonymized ? 'translateX(16px)' : 'translateX(0)',
              transition: 'transform 0.15s',
            }} />
          </div>
        </button>
      </div>
    </div>
  );
}
