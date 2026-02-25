// ─────────────────────────────────────────────────────────
// GENESIS CHAMBER V4 — LEADERBOARD SKELETON
// Animated loading state for Stage 2 leaderboard
// CSS classes: .lb-rank, .lb-name-skel, .lb-bar
// Keyframes: tcBorderSpin, shimr, flowbar, dotpulse
// ─────────────────────────────────────────────────────────

import { font } from '../../design/tokens';
import { useTokens } from '../../hooks/useTokens';

const ROW_COLORS = ['#E5375E', '#F27123', '#00D9FF', '#10A37F', '#5B6EF5'];

const BAR_WIDTHS = [
  ['60%', '45%', '55%'],
  ['55%', '50%', '48%'],
  ['50%', '42%', '52%'],
  ['45%', '55%', '40%'],
  ['40%', '48%', '44%'],
];

export default function LeaderboardSkeleton({ modelCount = 7 }) {
  const t = useTokens();

  return (
    <div style={{
      borderRadius: 12,
      border: `1px solid ${t.border}`,
      background: t.surface,
      overflow: 'hidden',
      marginBottom: 20,
    }}>
      {/* Header */}
      <div style={{
        padding: '14px 18px',
        borderBottom: `1px solid ${t.border}`,
      }}>
        <span style={{
          fontFamily: font.mono,
          fontSize: 9,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: t.textMuted,
        }}>
          COUNCIL LEADERBOARD — LOADING
        </span>
      </div>

      {/* 5 skeleton rows */}
      {[0, 1, 2, 3, 4].map((row) => {
        const mc = ROW_COLORS[row];
        const dl = `${row * 0.2}s`;

        return (
          <div
            key={row}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 18px',
              borderBottom: `1px solid ${t.border}`,
            }}
          >
            {/* Rank spinner */}
            <div
              className="lb-rank"
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                '--lb-mc': mc,
                '--lb-dl': dl,
              }}
            >
              <span style={{
                fontFamily: font.mono,
                fontSize: 10,
                color: t.textMuted,
                position: 'relative',
                zIndex: 1,
              }}>
                #{row + 1}
              </span>
            </div>

            {/* Name skeleton */}
            <div
              className="lb-name-skel"
              style={{
                width: 120,
                height: 10,
                borderRadius: 4,
                background: t.surfaceRaised,
                flexShrink: 0,
                '--lb-dl': dl,
              }}
            />

            {/* 3 score bars */}
            <div style={{ flex: 1, display: 'flex', gap: 8 }}>
              {BAR_WIDTHS[row].map((w, barIdx) => (
                <div
                  key={barIdx}
                  className="lb-bar"
                  style={{
                    flex: 1,
                    height: 8,
                    borderRadius: 4,
                    background: t.surfaceRaised,
                    '--lb-mc': mc,
                    '--lb-dl': `${row * 0.2 + barIdx * 0.1}s`,
                  }}
                >
                  <div style={{
                    width: w,
                    height: '100%',
                    borderRadius: 4,
                    background: `${mc}33`,
                    position: 'relative',
                  }} />
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Footer */}
      <div style={{
        padding: '12px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}>
        {/* Pulsing gold dot */}
        <div style={{
          width: 5,
          height: 5,
          borderRadius: 3,
          background: t.councilGold,
          animation: 'dotpulse 1.5s infinite',
        }} />
        <span style={{
          fontFamily: font.mono,
          fontSize: 10,
          color: t.textMuted,
        }}>
          Weighting {modelCount} models across accuracy, depth, originality, sources...
        </span>
      </div>
    </div>
  );
}
