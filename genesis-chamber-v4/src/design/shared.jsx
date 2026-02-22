// ─────────────────────────────────────────────────────────
// GENESIS CHAMBER V4 — SHARED PRIMITIVES
// Reusable components used across all screens
// ─────────────────────────────────────────────────────────

import { T, font } from './tokens';

/** Mono uppercase tag/pill — used for status, labels, categories */
export function Tag({ label, color = T.cyan, children }) {
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
      {children || label}
    </span>
  );
}

/** Mono uppercase section label with optional icon */
export function MonoLabel({ children, icon, color = T.textMuted, style }) {
  return (
    <div style={{
      fontFamily: font.mono,
      fontSize: 10,
      fontWeight: 600,
      color,
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
export function ScoreRing({ score, size = 48, strokeWidth = 3, color = T.cyan }) {
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (score / 100) * circumference;

  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke={T.border} strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke={color} strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: `stroke-dashoffset 0.5s ${T.easing?.default || 'ease'}` }}
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
          fill: color,
        }}
      >
        {score}
      </text>
    </svg>
  );
}

/** Verdict badge for DA arena — colored by verdict type */
export function VerdictBadge({ verdict }) {
  const colors = {
    strong: T.da.verdict.strong,
    partial: T.da.verdict.partial,
    insufficient: T.da.verdict.insufficient,
    'no-defense': T.da.verdict.noDefense,
  };
  const color = colors[verdict] || T.textMuted;
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
export function Dots({ count = 5, active = 0, color = T.flame, size = 6 }) {
  return (
    <div style={{ display: 'flex', gap: 3 }}>
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            background: i < active ? color : T.surfaceRaised,
            transition: 'background 0.15s',
          }}
        />
      ))}
    </div>
  );
}

/** Status badge — running, complete, paused, etc. */
export function StatusBadge({ status }) {
  const config = {
    running: { color: T.cyan, label: 'Running' },
    complete: { color: T.green, label: 'Complete' },
    paused: { color: T.gold, label: 'Paused' },
    failed: { color: T.magenta, label: 'Failed' },
    pending: { color: T.textMuted, label: 'Pending' },
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
      <span style={{
        width: 6,
        height: 6,
        borderRadius: 3,
        background: color,
        ...(status === 'running' ? { animation: 'pulse 1.5s infinite' } : {}),
      }} />
      {label}
    </span>
  );
}
