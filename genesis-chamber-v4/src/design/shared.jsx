// ─────────────────────────────────────────────────────────
// GENESIS CHAMBER V4 — SHARED PRIMITIVES
// Reusable components used across all screens
// All theme-aware via useTokens()
// ─────────────────────────────────────────────────────────

import { useState } from 'react';
import { font, motion } from './tokens';
import { useTokens } from '../hooks/useTokens';
import { useIsMobile } from '../hooks/useMediaQuery';

/** Mono uppercase tag/pill — used for status, labels, categories */
export function Tag({ label, color, children }) {
  const t = useTokens();
  const c = color || t.cyan;
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      padding: '3px 10px',
      borderRadius: 4,
      fontSize: 9,
      fontFamily: font.mono,
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.12em',
      color: c,
      background: `${c}1a`,
    }}>
      {children || label}
    </span>
  );
}

/** Mono uppercase section label with optional icon */
export function MonoLabel({ children, icon, color, style }) {
  const t = useTokens();
  return (
    <div style={{
      fontFamily: font.mono,
      fontSize: 10,
      fontWeight: 600,
      color: color || t.textMuted,
      textTransform: 'uppercase',
      letterSpacing: '0.12em',
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      marginBottom: 13,
      ...style,
    }}>
      {icon && <span style={{ fontSize: 14 }}>{icon}</span>}
      {children}
    </div>
  );
}

/** Colored dot for model identification */
export function ModelDot({ color, size = 8 }) {
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: size / 2,
      background: color,
      flexShrink: 0,
    }} />
  );
}

/** SVG score ring — circular progress indicator */
export function ScoreRing({ score, size = 48, strokeWidth = 3, color }) {
  const t = useTokens();
  const c = color || t.cyan;
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (score / 100) * circumference;

  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke={t.border} strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke={c} strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: `stroke-dashoffset 0.5s ${motion.easing.default}` }}
      />
      <text
        x={size / 2} y={size / 2}
        textAnchor="middle" dominantBaseline="central"
        style={{
          transform: 'rotate(90deg)',
          transformOrigin: 'center',
          fontSize: size * 0.3,
          fontFamily: font.mono,
          fontWeight: 700,
          fill: c,
        }}
      >
        {score}
      </text>
    </svg>
  );
}

/** Verdict badge for DA arena — colored by verdict type */
export function VerdictBadge({ verdict }) {
  const t = useTokens();
  const colors = {
    strong: t.da.verdict.strong,
    partial: t.da.verdict.partial,
    insufficient: t.da.verdict.insufficient,
    'no-defense': t.da.verdict.noDefense,
  };
  const color = colors[verdict] || t.textMuted;
  const label = verdict.replace('-', ' ');

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      padding: '3px 10px',
      borderRadius: 4,
      fontSize: 9,
      fontFamily: font.mono,
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.12em',
      color,
      background: `${color}1a`,
    }}>
      {label}
    </span>
  );
}

/** Dot severity indicator (e.g., aggression level) */
export function Dots({ count = 5, active = 0, color, size = 6 }) {
  const t = useTokens();
  const c = color || t.flame;
  return (
    <div style={{ display: 'flex', gap: 3 }}>
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            background: i < active ? c : t.surfaceRaised,
            transition: 'background 0.15s',
          }}
        />
      ))}
    </div>
  );
}

/** Horizontal score progress bar */
export function ScoreBar({ score, color, height = 4 }) {
  const t = useTokens();
  return (
    <div style={{ width: '100%', height, background: t.surfaceRaised, borderRadius: 2 }}>
      <div style={{ width: `${score}%`, height: '100%', borderRadius: 2, background: color }} />
    </div>
  );
}

/** Bordered card container */
export function Card({ children, accent, style: sx }) {
  const t = useTokens();
  return (
    <div style={{
      background: t.surface,
      borderLeft: `2px solid ${accent || t.border}`,
      borderRadius: 8,
      overflow: 'hidden',
      ...sx,
    }}>
      {children}
    </div>
  );
}

/** Score change indicator — from → to with color coding */
export function ScoreChange({ from, to }) {
  const t = useTokens();
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{
        fontSize: 16, fontFamily: font.mono, fontWeight: 700,
        color: from >= 7 ? t.magenta : t.gold,
      }}>{from}</span>
      <span style={{ fontSize: 10, color: t.textMuted }}>→</span>
      <span style={{
        fontSize: 16, fontFamily: font.mono, fontWeight: 700,
        color: to >= 7 ? t.green : to >= 4 ? t.gold : t.magenta,
      }}>{to}</span>
    </div>
  );
}

/** 5-segment aggression meter with level label */
export function AggressionMeter({ severity }) {
  const t = useTokens();
  const levels = ['Gentle', 'Moderate', 'Sharp', 'Fierce', 'Lethal'];
  const lv = Math.min(Math.max(Math.round(severity) - 1, 0), 4);
  const colors = [t.green, t.cyan, t.gold, t.flame, t.magenta];
  return (
    <div>
      <MonoLabel style={{ marginBottom: 8 }}>AGGRESSION</MonoLabel>
      <div style={{ display: 'flex', gap: 3, marginBottom: 6 }}>
        {levels.map((_, i) => (
          <div key={i} style={{
            flex: 1, height: 4, borderRadius: 2,
            background: i <= lv ? colors[lv] : t.surfaceRaised,
            transition: 'background 0.15s',
          }} />
        ))}
      </div>
      <span style={{
        fontSize: 11, fontFamily: font.mono, fontWeight: 600, color: colors[lv],
      }}>{levels[lv]}</span>
    </div>
  );
}

/** Tier badge — S/A/B/C grade */
export function TierBadge({ tier, score }) {
  const t = useTokens();
  const grade = tier || (score >= 90 ? 'S' : score >= 80 ? 'A' : score >= 65 ? 'B' : 'C');
  const colors = { S: t.gold, A: t.green, B: t.cyan, C: t.textMuted };
  const color = colors[grade] || t.textMuted;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: 24, height: 24, borderRadius: 4,
      fontSize: 11, fontFamily: font.mono, fontWeight: 700,
      color, background: `${color}1a`, border: `1px solid ${color}33`,
    }}>
      {grade}
    </span>
  );
}

/** Reusable button */
export function Btn({ children, color, secondary, disabled, large, onClick, style: sx }) {
  const t = useTokens();
  const mobile = useIsMobile();
  const [pressed, setPressed] = useState(false);
  const c = color || t.cyan;
  const bg = secondary ? 'transparent' : `${c}1a`;
  const border = secondary ? `1px solid ${c}44` : `1px solid ${c}33`;
  return (
    <button
      onClick={disabled ? undefined : onClick}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: large ? '10px 20px' : '7px 14px',
        borderRadius: 6, border, background: bg,
        fontSize: large ? 13 : 11, fontFamily: font.mono, fontWeight: 600,
        color: disabled ? t.textMuted : c,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'all 0.15s',
        textTransform: 'uppercase', letterSpacing: '0.06em',
        transform: pressed ? 'scale(0.97)' : 'scale(1)',
        minHeight: mobile ? 44 : undefined,
        ...sx,
      }}
    >
      {children}
    </button>
  );
}

/** Numbered step navigation */
export function StepNav({ current, total, labels = [] }) {
  const t = useTokens();
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
      {Array.from({ length: total }, (_, i) => {
        const done = i < current;
        const active = i === current;
        const color = active ? t.cyan : done ? t.green : t.textMuted;
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 14,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontFamily: font.mono, fontWeight: 700,
                color: active || done ? t.bg : color,
                background: active || done ? color : 'transparent',
                border: `1.5px solid ${color}`,
                transition: 'all 0.2s',
              }}>
                {done ? '\u2713' : i + 1}
              </div>
              {labels[i] && (
                <span style={{
                  fontSize: 9, fontFamily: font.mono, color,
                  textTransform: 'uppercase', letterSpacing: '0.08em',
                  whiteSpace: 'nowrap',
                }}>
                  {labels[i]}
                </span>
              )}
            </div>
            {i < total - 1 && (
              <div style={{
                width: 32, height: 1.5, margin: '0 4px',
                background: done ? t.green : t.border,
                transition: 'background 0.2s',
                alignSelf: labels[i] ? 'flex-start' : 'center',
                marginTop: labels[i] ? 14 : 0,
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/** Toggle switch */
export function Toggle({ enabled, onChange, color }) {
  const t = useTokens();
  const c = color || t.cyan;
  return (
    <button
      onClick={() => onChange(!enabled)}
      style={{
        width: 40, height: 22, borderRadius: 11, padding: 2,
        background: enabled ? c : t.surfaceRaised,
        border: `1px solid ${enabled ? c : t.border}`,
        cursor: 'pointer', position: 'relative',
        transition: 'all 0.2s',
      }}
    >
      <div style={{
        width: 16, height: 16, borderRadius: 8,
        background: enabled ? '#fff' : t.textMuted,
        transform: enabled ? 'translateX(18px)' : 'translateX(0)',
        transition: 'transform 0.2s',
      }} />
    </button>
  );
}

/** Status badge — running, complete, paused, etc. */
export function StatusBadge({ status }) {
  const t = useTokens();
  const config = {
    running: { color: t.cyan, label: 'Running' },
    complete: { color: t.green, label: 'Complete' },
    paused: { color: t.gold, label: 'Paused' },
    failed: { color: t.magenta, label: 'Failed' },
    pending: { color: t.textMuted, label: 'Pending' },
  };
  const { color, label } = config[status] || config.pending;

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      fontSize: 10,
      fontFamily: font.mono,
      fontWeight: 600,
      color,
      textTransform: 'uppercase',
      letterSpacing: '0.12em',
    }}>
      <span
        className={status === 'running' ? 'gc-pulse' : undefined}
        style={{
          width: 6,
          height: 6,
          borderRadius: 3,
          background: color,
        }}
      />
      {label}
    </span>
  );
}
