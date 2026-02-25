// ─────────────────────────────────────────────────────────
// GENESIS CHAMBER V4 — GENESIS ROUND CARD + DIVIDER
// Round status cards for multi-round simulation view
// Keyframes: gprog, dotpulse
// ─────────────────────────────────────────────────────────

import { font } from '../../design/tokens';
import { useTokens } from '../../hooks/useTokens';

export function GenesisRoundCard({
  roundNum = 1,
  status = 'queued', // 'complete' | 'in_progress' | 'queued'
  meta = '',
  totalRounds = 1,
}) {
  const t = useTokens();

  const isComplete = status === 'complete';
  const isActive = status === 'in_progress';
  const isQueued = status === 'queued';

  // Badge colors
  const badgeBg = isComplete
    ? `${t.councilGold}1a`
    : isActive
      ? `${t.flame}1a`
      : t.surfaceRaised;
  const badgeColor = isComplete
    ? t.councilGold
    : isActive
      ? t.flame
      : t.textMuted;

  // Status indicator
  const statusColor = isComplete ? t.green : isActive ? t.councilGold : t.textMuted;
  const statusLabel = isComplete ? 'Complete' : isActive ? 'In Progress' : 'Queued';

  return (
    <div style={{
      borderRadius: 10,
      border: `1px solid ${t.border}`,
      background: t.surface,
      padding: '16px 20px',
      opacity: isQueued ? 0.4 : 1,
      transition: 'opacity 0.3s',
    }}>
      {/* Header row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* Round badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            padding: '4px 10px',
            borderRadius: 6,
            background: badgeBg,
            fontFamily: font.mono,
            fontSize: 10,
            fontWeight: 700,
            color: badgeColor,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}>
            Round {roundNum}
          </div>
          {meta && (
            <span style={{
              fontSize: 11,
              color: t.textSoft,
            }}>
              {meta}
            </span>
          )}
        </div>

        {/* Status indicator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}>
          <div style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: isComplete ? statusColor : 'transparent',
            border: isComplete ? 'none' : `1.5px solid ${statusColor}`,
            animation: isActive ? 'dotpulse 1.5s infinite' : 'none',
          }} />
          <span style={{
            fontFamily: font.mono,
            fontSize: 10,
            color: statusColor,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}>
            {statusLabel}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{
        height: 4,
        borderRadius: 2,
        background: t.surfaceRaised,
        marginTop: 12,
        overflow: 'hidden',
      }}>
        {isComplete && (
          <div style={{
            width: '100%',
            height: '100%',
            borderRadius: 2,
            background: t.green,
          }} />
        )}
        {isActive && (
          <div style={{
            height: '100%',
            borderRadius: 2,
            background: t.flame,
            animation: 'gprog 4s ease-in-out infinite alternate',
          }} />
        )}
      </div>
    </div>
  );
}

export function GenesisRoundDivider({ text = '' }) {
  const t = useTokens();

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      margin: '8px 0',
    }}>
      <div style={{ flex: 1, height: 1, background: t.border }} />
      <span style={{
        fontFamily: font.mono,
        fontSize: 8,
        color: t.textMuted,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
      }}>
        {text}
      </span>
      <div style={{ flex: 1, height: 1, background: t.border }} />
    </div>
  );
}
