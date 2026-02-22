// ─────────────────────────────────────────────────────────
// GENESIS CHAMBER V4 — MOBILE TOP BAR
// 52px header visible only on mobile (<768px)
// Ref: gc-v4-app-shell.jsx:320-343
// ─────────────────────────────────────────────────────────

import { T, font } from '../../design/tokens';
import { IC } from '../../design/icons';
import { useAppStore } from '../../stores/appStore';

export default function TopBar({ onMenuOpen }) {
  const mode = useAppStore((s) => s.mode);

  return (
    <div
      className="gc-mobile-topbar"
      style={{
        height: 52,
        padding: '0 16px',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: `1px solid ${T.border}`,
        background: T.surface,
      }}
    >
      <button onClick={onMenuOpen}
        style={{
          width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'transparent', border: 'none', cursor: 'pointer',
          color: T.textSoft, fontSize: 18,
        }}
      >
        {IC.menu}
      </button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{
          fontFamily: font.display, fontSize: 14, fontWeight: 700,
          color: T.text, letterSpacing: '-0.03em',
        }}>
          <span style={{ color: T.flame }}>G</span>C
        </span>
        <span style={{
          fontSize: 9, fontFamily: font.mono, color: T.textMuted,
          textTransform: 'uppercase', letterSpacing: '0.08em',
        }}>
          {mode === 'council' ? 'Council' : 'Chamber'}
        </span>
      </div>
      <div style={{ width: 40 }} />
    </div>
  );
}
