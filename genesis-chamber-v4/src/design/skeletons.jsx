// ─────────────────────────────────────────────────────────
// GENESIS CHAMBER V4 — SKELETON / LOADING COMPONENTS
// Shimmer placeholders + stage indicator + connection badge
// ─────────────────────────────────────────────────────────

import { font } from './tokens';
import { useTokens } from '../hooks/useTokens';

// ── Skeleton Response Card ──
export function SkeletonResponseCard() {
  const t = useTokens();
  return (
    <div style={{
      background: t.surface, border: `1px solid ${t.border}`, borderRadius: 8,
      borderLeft: `2px solid ${t.textMuted}`, padding: '20px 24px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <div className="gc-skeleton" style={{ width: 22, height: 22, borderRadius: 4 }} />
        <div className="gc-skeleton" style={{ width: 100, height: 12, borderRadius: 4 }} />
        <div style={{ flex: 1 }} />
        <div className="gc-skeleton" style={{ width: 32, height: 16, borderRadius: 4 }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div className="gc-skeleton" style={{ width: '100%', height: 12, borderRadius: 4 }} />
        <div className="gc-skeleton" style={{ width: '95%', height: 12, borderRadius: 4 }} />
        <div className="gc-skeleton" style={{ width: '88%', height: 12, borderRadius: 4 }} />
        <div className="gc-skeleton" style={{ width: '70%', height: 12, borderRadius: 4 }} />
      </div>
    </div>
  );
}

// ── Skeleton Synthesis ──
export function SkeletonSynthesis() {
  const t = useTokens();
  return (
    <div style={{
      background: t.surface, border: `1px solid ${t.border}`, borderRadius: 8,
      borderLeft: `2px solid ${t.gold}`, padding: '24px 24px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <div className="gc-skeleton" style={{ width: 14, height: 14, borderRadius: 3 }} />
        <div className="gc-skeleton" style={{ width: 120, height: 10, borderRadius: 4 }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div className="gc-skeleton" style={{ width: '100%', height: 12, borderRadius: 4 }} />
        <div className="gc-skeleton" style={{ width: '92%', height: 12, borderRadius: 4 }} />
        <div className="gc-skeleton" style={{ width: '85%', height: 12, borderRadius: 4 }} />
      </div>
    </div>
  );
}

// ── Stage Indicator ──
const STAGE_LABELS = ['RESPONSES', 'RANKINGS', 'SYNTHESIS'];
const STAGE_KEYS = ['stage1', 'stage2', 'stage3'];

export function StageIndicator({ currentStage }) {
  const t = useTokens();
  const activeIdx = STAGE_KEYS.indexOf(currentStage);

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6, padding: '12px 0',
    }}>
      {STAGE_LABELS.map((label, i) => {
        const isActive = i === activeIdx;
        const isDone = i < activeIdx;
        const color = isActive ? t.cyan : isDone ? t.green : t.textMuted;

        return (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {i > 0 && (
              <div style={{
                width: 20, height: 1,
                background: isDone ? t.green : t.border,
              }} />
            )}
            <div style={{
              width: 8, height: 8, borderRadius: 4,
              background: color,
              animation: isActive ? 'pulse 1.5s infinite' : 'none',
            }} />
            <span style={{
              fontSize: 9, fontFamily: font.mono, fontWeight: 600,
              color, textTransform: 'uppercase', letterSpacing: '0.08em',
            }}>
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ── Connection Dot ──
export function ConnectionDot({ online, collapsed }) {
  const t = useTokens();
  const color = online === true ? t.green : online === false ? t.textMuted : t.gold;
  const label = online === true ? 'LIVE' : online === false ? 'OFFLINE' : 'CONNECTING';

  if (collapsed) {
    return (
      <div title={label} style={{
        width: 8, height: 8, borderRadius: 4,
        background: color,
        animation: online === true ? 'none' : 'pulse 2s infinite',
      }} />
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{
        width: 6, height: 6, borderRadius: 3,
        background: color,
        animation: online === true ? 'none' : 'pulse 2s infinite',
      }} />
      <span style={{
        fontSize: 8, fontFamily: font.mono, fontWeight: 600,
        color, textTransform: 'uppercase', letterSpacing: '0.1em',
      }}>
        {label}
      </span>
    </div>
  );
}

// ── Error Card ──
export function ErrorCard({ message, onRetry }) {
  const t = useTokens();
  return (
    <div style={{
      background: t.surface, border: `1px solid ${t.border}`, borderRadius: 8,
      borderLeft: `2px solid ${t.magenta}`, padding: '20px 24px',
      display: 'flex', flexDirection: 'column', gap: 12,
    }}>
      <div style={{
        fontSize: 9, fontFamily: font.mono, fontWeight: 600,
        color: t.magenta, textTransform: 'uppercase', letterSpacing: '0.1em',
      }}>
        ERROR
      </div>
      <div style={{ fontSize: 13, color: t.textSoft, lineHeight: 1.5 }}>
        {message}
      </div>
      {onRetry && (
        <button onClick={onRetry} style={{
          alignSelf: 'flex-start', padding: '8px 16px',
          background: `${t.magenta}1a`, border: `1px solid ${t.magenta}33`,
          borderRadius: 6, cursor: 'pointer',
          fontSize: 11, fontFamily: font.mono, fontWeight: 600,
          color: t.magenta, textTransform: 'uppercase', letterSpacing: '0.06em',
        }}>
          Retry
        </button>
      )}
    </div>
  );
}
