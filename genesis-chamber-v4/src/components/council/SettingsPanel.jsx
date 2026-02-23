// ─────────────────────────────────────────────────────────
// GENESIS CHAMBER V4 — SETTINGS PANEL
// Slide-in panel: active models + thinking mode + web search
// + chairman model + anonymization toggle
// Models grouped by tier with dynamic roster
// ─────────────────────────────────────────────────────────

import { font } from '../../design/tokens';
import { IC } from '../../design/icons';
import { ModelDot, Toggle } from '../../design/shared';
import { useCouncilStore } from '../../stores/councilStore';
import { useTokens } from '../../hooks/useTokens';
import { useModels } from '../../hooks/useModels';
import { MODEL_TIERS } from '../../data/mock';

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
  const enableWebSearch = useCouncilStore((s) => s.enableWebSearch);
  const setEnableWebSearch = useCouncilStore((s) => s.setEnableWebSearch);
  const chairmanModel = useCouncilStore((s) => s.chairmanModel);
  const setChairmanModel = useCouncilStore((s) => s.setChairmanModel);

  if (!settingsOpen) return null;

  const thinkingModes = [
    { id: 'off', label: 'Off', color: t.textMuted },
    { id: 'thinking', label: 'Thinking', color: t.cyan },
    { id: 'deep', label: 'Deep', color: t.gold },
  ];

  // Group models by tier
  const tierOrder = ['premium', 'balanced', 'efficient', 'budget'];
  const grouped = tierOrder.map((tierId) => ({
    tier: MODEL_TIERS.find((t) => t.id === tierId) || { id: tierId, name: tierId, color: '#6B7280' },
    models: models.filter((m) => m.tier === tierId),
  })).filter((g) => g.models.length > 0);

  const activeModelSet = models.filter((m) => activeModels.includes(m.id));

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
          {grouped.map(({ tier, models: tierModels }) => (
            <div key={tier.id}>
              <div style={{
                fontSize: 9, fontFamily: font.mono, color: tier.color,
                textTransform: 'uppercase', letterSpacing: '0.12em',
                padding: '8px 0 4px', fontWeight: 600,
              }}>{tier.name}</div>
              {tierModels.map((m) => {
                const active = activeModels.includes(m.id);
                return (
                  <button key={m.id} onClick={() => toggleModel(m.id)}
                    style={{
                      width: '100%', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10,
                      background: active ? t.surfaceRaised : 'transparent',
                      border: `1px solid ${active ? t.borderHover : t.border}`,
                      borderLeft: `2px solid ${active ? m.color : 'transparent'}`,
                      borderRadius: 6, cursor: 'pointer', transition: 'all 0.13s',
                      marginBottom: 4,
                    }}>
                    <ModelDot color={m.color} />
                    <span style={{
                      fontSize: 12, fontWeight: 500,
                      color: active ? t.text : t.textMuted,
                      flex: 1, textAlign: 'left',
                    }}>{m.name}</span>
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
                );
              })}
            </div>
          ))}
        </div>

        {/* Thinking Mode */}
        <div style={{
          fontSize: 9, fontFamily: font.mono, color: t.textMuted,
          textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12,
        }}>THINKING MODE</div>

        <div style={{ display: 'flex', gap: 6, marginBottom: 28 }}>
          {thinkingModes.map(({ id, label, color }) => (
            <button
              key={id}
              onClick={() => setThinkingMode(id)}
              style={{
                flex: 1, padding: '8px 12px', borderRadius: 6, cursor: 'pointer',
                background: thinkingMode === id ? `${color}1a` : t.surfaceRaised,
                border: `1px solid ${thinkingMode === id ? color : t.border}`,
                fontSize: 11, fontFamily: font.mono, fontWeight: 600,
                color: thinkingMode === id ? color : t.textMuted,
                textTransform: 'uppercase', letterSpacing: '0.06em',
              }}
            >{label}</button>
          ))}
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

        {/* Chairman Model — only show active models */}
        <div style={{
          fontSize: 9, fontFamily: font.mono, color: t.textMuted,
          textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12,
        }}>CHAIRMAN MODEL</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 28 }}>
          {activeModelSet.map((m) => (
            <button key={m.id} onClick={() => setChairmanModel(m.id)}
              style={{
                padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10,
                background: chairmanModel === m.id ? t.surfaceRaised : 'transparent',
                border: `1px solid ${chairmanModel === m.id ? t.borderHover : t.border}`,
                borderLeft: `2px solid ${chairmanModel === m.id ? t.gold : 'transparent'}`,
                borderRadius: 6, cursor: 'pointer', transition: 'all 0.13s',
              }}>
              <ModelDot color={m.color} size={6} />
              <span style={{
                fontSize: 11, fontWeight: 500,
                color: chairmanModel === m.id ? t.text : t.textMuted,
                flex: 1, textAlign: 'left',
              }}>{m.name}</span>
              {chairmanModel === m.id && (
                <span style={{
                  fontSize: 8, fontFamily: font.mono, fontWeight: 600,
                  color: t.gold, textTransform: 'uppercase', letterSpacing: '0.08em',
                }}>CHAIRMAN</span>
              )}
            </button>
          ))}
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
