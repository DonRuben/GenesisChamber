// ─────────────────────────────────────────────────────────
// GENESIS CHAMBER V4 — SETTINGS PANEL
// Slide-in panel: active models + anonymization toggle
// Ref: gc-v4-llm-council.jsx:369-456
// ─────────────────────────────────────────────────────────

import { T, TLight, font } from '../../design/tokens';
import { IC } from '../../design/icons';
import { ModelDot } from '../../design/shared';
import { useAppStore } from '../../stores/appStore';
import { useCouncilStore } from '../../stores/councilStore';
import { MODELS } from '../../data/mock';

function useTokens() {
  const theme = useAppStore((s) => s.theme);
  return theme === 'light' ? { ...T, ...TLight } : T;
}

export default function SettingsPanel() {
  const t = useTokens();
  const settingsOpen = useCouncilStore((s) => s.settingsOpen);
  const toggleSettings = useCouncilStore((s) => s.toggleSettings);
  const anonymized = useCouncilStore((s) => s.anonymized);
  const setAnonymized = useCouncilStore((s) => s.setAnonymized);
  const activeModels = useCouncilStore((s) => s.activeModels);
  const toggleModel = useCouncilStore((s) => s.toggleModel);

  if (!settingsOpen) return null;

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
        {/* Active Models */}
        <div style={{
          fontSize: 9, fontFamily: font.mono, color: t.textMuted,
          textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12,
        }}>ACTIVE MODELS</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 28 }}>
          {MODELS.map((m) => {
            const active = activeModels.includes(m.id);
            return (
              <button key={m.id} onClick={() => toggleModel(m.id)}
                style={{
                  padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10,
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
          <span style={{ fontSize: 14, color: anonymized ? T.cyan : t.textMuted }}>
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
            background: anonymized ? T.cyan : t.surfaceHover,
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
