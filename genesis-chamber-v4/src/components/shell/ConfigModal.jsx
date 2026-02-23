// ─────────────────────────────────────────────────────────
// GENESIS CHAMBER V4 — CONFIG MODAL
// Settings overlay: connection, theme, version
// ─────────────────────────────────────────────────────────

import { font, radius } from '../../design/tokens';
import { IC } from '../../design/icons';
import { MonoLabel, Btn } from '../../design/shared';
import { useAppStore } from '../../stores/appStore';
import { useTokens } from '../../hooks/useTokens';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001';

export default function ConfigModal() {
  const t = useTokens();
  const toggleConfigModal = useAppStore((s) => s.toggleConfigModal);
  const backendOnline = useAppStore((s) => s.backendOnline);
  const theme = useAppStore((s) => s.theme);
  const toggleTheme = useAppStore((s) => s.toggleTheme);

  const statusColor = backendOnline === true ? t.green : backendOnline === false ? t.textMuted : t.gold;
  const statusLabel = backendOnline === true ? 'LIVE' : backendOnline === false ? 'OFFLINE' : 'CONNECTING';

  return (
    <div
      onClick={toggleConfigModal}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
        zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <div
        className="gc-scale-in"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 420,
          background: t.surface, border: `1px solid ${t.border}`,
          borderRadius: radius.xl, padding: 24,
          position: 'relative',
        }}
      >
        {/* Close button */}
        <button
          onClick={toggleConfigModal}
          style={{
            position: 'absolute', top: 16, right: 16,
            width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: t.textMuted, fontSize: 16, borderRadius: 6,
          }}
        >
          {IC.x}
        </button>

        {/* Title */}
        <div style={{
          fontFamily: font.display, fontSize: 18, fontWeight: 700,
          color: t.text, marginBottom: 24, letterSpacing: '-0.02em',
        }}>
          Settings
        </div>

        {/* Connection */}
        <div style={{ marginBottom: 20 }}>
          <MonoLabel color={t.cyan}>Connection</MonoLabel>
          <div style={{
            padding: '14px 16px', borderRadius: 8,
            background: t.surfaceRaised, border: `1px solid ${t.border}`,
            display: 'flex', flexDirection: 'column', gap: 10,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 8, height: 8, borderRadius: 4,
                background: statusColor,
                animation: backendOnline === true ? 'pulse 2s infinite' : backendOnline === null ? 'pulse 2s infinite' : 'none',
              }} />
              <span style={{
                fontSize: 11, fontFamily: font.mono, fontWeight: 600,
                color: statusColor, textTransform: 'uppercase', letterSpacing: '0.1em',
              }}>
                {statusLabel}
              </span>
            </div>
            <div style={{
              fontSize: 11, fontFamily: font.mono, color: t.textMuted,
              letterSpacing: '0.02em',
            }}>
              {API_URL}
            </div>
          </div>
        </div>

        {/* Theme */}
        <div style={{ marginBottom: 20 }}>
          <MonoLabel color={t.gold}>Theme</MonoLabel>
          <div style={{
            padding: '14px 16px', borderRadius: 8,
            background: t.surfaceRaised, border: `1px solid ${t.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 18, color: t.textSoft }}>
                {theme === 'dark' ? IC.moon : IC.sun}
              </span>
              <span style={{
                fontSize: 12, fontWeight: 500, color: t.text,
                textTransform: 'capitalize',
              }}>
                {theme} Mode
              </span>
            </div>
            <Btn secondary onClick={toggleTheme} style={{ padding: '6px 14px' }}>
              Switch to {theme === 'dark' ? 'Light' : 'Dark'}
            </Btn>
          </div>
        </div>

        {/* Version */}
        <div>
          <MonoLabel color={t.textMuted}>Version</MonoLabel>
          <div style={{
            padding: '14px 16px', borderRadius: 8,
            background: t.surfaceRaised, border: `1px solid ${t.border}`,
            display: 'flex', flexDirection: 'column', gap: 6,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 11, color: t.textMuted, fontFamily: font.mono }}>Frontend</span>
              <span style={{ fontSize: 11, color: t.text, fontFamily: font.mono }}>V4 Phase 8</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 11, color: t.textMuted, fontFamily: font.mono }}>Backend</span>
              <span style={{ fontSize: 11, color: t.text, fontFamily: font.mono }}>
                {backendOnline === true ? 'V3 FastAPI' : '—'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
