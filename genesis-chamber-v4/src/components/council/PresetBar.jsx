// ─────────────────────────────────────────────────────────
// GENESIS CHAMBER V4 — PRESET BAR
// 5 Council presets in 2-column grid
// Ref: gc-v4-llm-council.jsx:110-129
// ─────────────────────────────────────────────────────────

import { T, TLight } from '../../design/tokens';
import { IC } from '../../design/icons';
import { useAppStore } from '../../stores/appStore';
import { PRESETS } from '../../data/mock';

function useTokens() {
  const theme = useAppStore((s) => s.theme);
  return theme === 'light' ? { ...T, ...TLight } : T;
}

const PRESET_ICONS = {
  compare: IC.compare,
  analyze: IC.analyze,
  brainstorm: IC.brainstorm,
  evaluate: IC.evaluate,
  debate: IC.debate,
};

export default function PresetBar({ onPreset }) {
  const t = useTokens();

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10,
      width: '100%', maxWidth: 560, marginBottom: 40,
    }}>
      {PRESETS.map((p) => (
        <button key={p.key} onClick={() => onPreset(p)}
          style={{
            padding: '18px 20px', textAlign: 'left', cursor: 'pointer',
            background: t.surface, border: `1px solid ${t.border}`, borderRadius: 8,
            borderLeft: `2px solid ${p.color}`,
            transition: 'background 0.15s, border-color 0.15s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = t.surfaceRaised; e.currentTarget.style.borderColor = t.borderHover; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = t.surface; e.currentTarget.style.borderColor = t.border; }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 14, color: p.color }}>{PRESET_ICONS[p.key]}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: t.text }}>{p.label}</span>
          </div>
          <div style={{ fontSize: 12, color: t.textMuted, lineHeight: 1.5 }}>{p.desc}</div>
        </button>
      ))}
    </div>
  );
}
