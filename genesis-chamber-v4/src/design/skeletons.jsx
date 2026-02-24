// ─────────────────────────────────────────────────────────
// GENESIS CHAMBER V4 — SKELETON / LOADING COMPONENTS
// Premium identity-rich loading cards + stage indicator +
// connection badge + progress bar
// ─────────────────────────────────────────────────────────

import { useState, useEffect } from 'react';
import { font } from './tokens';
import { useTokens } from '../hooks/useTokens';
import { useModelLookup } from '../hooks/useModels';

const STATUS_TEXTS = [
  'is crafting a concept...',
  'is exploring ideas...',
  'is analyzing the brief...',
  'is developing strategy...',
  'is building their vision...',
];

const TEAM_COLORS = {
  marketing: '#F27123',
  design: '#00D9FF',
  business: '#FFB800',
};

// RGB values for CSS variable avatar pulse
const TEAM_RGB = {
  marketing: '242,113,35',
  design: '0,217,255',
  business: '255,184,0',
};

// ── Skeleton Response Card (Premium) ──
export function SkeletonResponseCard({ soul, cardIndex = 0 }) {
  const t = useTokens();
  const lookupModel = useModelLookup();
  const [statusIdx, setStatusIdx] = useState(cardIndex % STATUS_TEXTS.length);

  useEffect(() => {
    const interval = setInterval(() => {
      setStatusIdx((prev) => (prev + 1) % STATUS_TEXTS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const teamColor = soul?.group ? TEAM_COLORS[soul.group] || t.textMuted : t.textMuted;
  const teamRgb = soul?.group ? TEAM_RGB[soul.group] || '107,114,128' : '107,114,128';
  const initials = soul?.name
    ? soul.name.split(' ').map((w) => w[0]).join('').slice(0, 2)
    : '??';
  const modelInfo = soul?.modelId ? lookupModel(soul.modelId) : null;
  const thinkingLabel = soul?.thinkingMode === 'deep'
    ? '\uD83E\uDDE0\uD83E\uDDE0 Deep'
    : soul?.thinkingMode === 'thinking'
      ? '\uD83E\uDDE0 Think'
      : null;

  return (
    <div style={{
      background: t.surface,
      border: `1px dashed rgba(233,231,228,0.08)`,
      borderLeft: `3px solid ${teamColor}`,
      borderRadius: 8, padding: '20px 24px',
      opacity: 0,
      animation: `fadeSlideIn 0.4s ease-out forwards`,
      animationDelay: `${cardIndex * 150}ms`,
    }}>
      {/* Header: Avatar + Name + Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        {/* Pulsing avatar */}
        <div style={{
          width: 32, height: 32, borderRadius: 16, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontFamily: font.mono, fontWeight: 700,
          color: teamColor, background: `${teamColor}1a`,
          border: `1.5px solid ${teamColor}44`,
          '--avatar-rgb': teamRgb,
          animation: 'avatarPulse 2s ease-in-out infinite',
        }}>
          {initials}
        </div>

        {/* Typing dots */}
        <div style={{ display: 'flex', gap: 2, marginLeft: -4 }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{
              width: 3, height: 3, borderRadius: 2,
              background: teamColor,
              animation: 'typingDot 1.4s infinite',
              animationDelay: `${i * 0.2}s`,
            }} />
          ))}
        </div>

        {/* Name + status */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: t.text }}>
            {soul?.name || 'Loading'}
          </span>
          <span style={{ fontSize: 12, color: t.textMuted, marginLeft: 4 }}>
            {STATUS_TEXTS[statusIdx]}
          </span>
        </div>
      </div>

      {/* Model badge row */}
      {modelInfo && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          marginBottom: 14,
        }}>
          <span style={{
            fontSize: 10, fontFamily: font.mono, color: modelInfo.color || t.textMuted,
          }}>
            {modelInfo.name}
          </span>
          {thinkingLabel && (
            <span style={{
              fontSize: 10, fontFamily: font.mono, color: soul.thinkingMode === 'deep' ? '#8B5CF6' : '#00D9FF',
            }}>
              {'\u00B7'} {thinkingLabel}
            </span>
          )}
        </div>
      )}

      {/* Shimmer bars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {['100%', '85%', '92%', '60%'].map((w, i) => (
          <div key={i} className="gc-skeleton" style={{
            width: w, height: 12, borderRadius: 4,
          }} />
        ))}
      </div>
    </div>
  );
}

// ── Stage Progress Bar ──
export function StageProgressBar({ completedCount, totalParticipants, stageName }) {
  const t = useTokens();
  const pct = totalParticipants > 0 ? (completedCount / totalParticipants) * 100 : 0;
  const remaining = Math.max(0, totalParticipants - completedCount);

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', marginBottom: 6,
      }}>
        <span style={{
          fontSize: 11, fontFamily: font.mono, fontWeight: 600,
          textTransform: 'uppercase', letterSpacing: '0.08em',
          color: t.textMuted,
        }}>
          {stageName || 'Stage 1: Generation'}
        </span>
        <span style={{
          fontSize: 11, fontFamily: font.mono, fontWeight: 700, color: '#00D9FF',
        }}>
          {completedCount} of {totalParticipants}
        </span>
      </div>
      <div style={{
        height: 4, borderRadius: 9999,
        background: 'rgba(255,255,255,0.06)',
      }}>
        <div style={{
          height: '100%', borderRadius: 9999,
          background: 'linear-gradient(90deg, #00D9FF, #8B5CF6)',
          width: `${pct}%`,
          transition: 'width 0.5s ease-out',
        }} />
      </div>
      {remaining > 0 && (
        <span style={{
          fontSize: 10, fontFamily: font.mono, color: t.textMuted,
          marginTop: 4, display: 'block',
        }}>
          Est. ~{Math.ceil(remaining * 18)}s remaining
        </span>
      )}
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
        animation: 'pulse 2s infinite',
      }} />
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{
        width: 6, height: 6, borderRadius: 3,
        background: color,
        animation: 'pulse 2s infinite',
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
