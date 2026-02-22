// ─────────────────────────────────────────────────────────
// GENESIS CHAMBER V4 — MOBILE TOP BAR
// 52px header visible only on mobile (<768px)
// Ref: gc-v4-app-shell.jsx:320-343
// ─────────────────────────────────────────────────────────

import { font } from '../../design/tokens';
import { IC } from '../../design/icons';
import { useAppStore } from '../../stores/appStore';
import { useTokens } from '../../hooks/useTokens';

export default function TopBar({ onMenuOpen }) {
  const t = useTokens();
  const mode = useAppStore((s) => s.mode);

  return (
    <div
      className="gc-mobile-topbar"
      style={{
        height: 52,
        padding: '0 16px',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: `1px solid ${t.border}`,
        background: t.surface,
      }}
    >
      <button onClick={onMenuOpen}
        style={{
          width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'transparent', border: 'none', cursor: 'pointer',
          color: t.textSoft, fontSize: 18,
        }}
      >
        {IC.menu}
      </button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{
          fontFamily: font.display, fontSize: 14, fontWeight: 700,
          color: t.text, letterSpacing: '-0.03em',
        }}>
          <span style={{ color: t.flame }}>G</span>C
        </span>
        <span style={{
          fontSize: 9, fontFamily: font.mono, color: t.textMuted,
          textTransform: 'uppercase', letterSpacing: '0.08em',
        }}>
          {mode === 'council' ? 'Council' : 'Chamber'}
        </span>
      </div>
      <div style={{ width: 40 }} />
    </div>
  );
}
