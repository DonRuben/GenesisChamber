// ─────────────────────────────────────────────────────────
// GENESIS CHAMBER V4 — SYNTHESIS PANEL
// Collapsible council verdict with score rankings
// Ref: gc-v4-llm-council.jsx:310-352
// ─────────────────────────────────────────────────────────

import { T, TLight, font } from '../../design/tokens';
import { IC } from '../../design/icons';
import { ModelDot } from '../../design/shared';
import { useAppStore } from '../../stores/appStore';
import { useCouncilStore } from '../../stores/councilStore';
import { MODELS, MOCK_RESPONSES, MOCK_SYNTHESIS } from '../../data/mock';

function useTokens() {
  const theme = useAppStore((s) => s.theme);
  return theme === 'light' ? { ...T, ...TLight } : T;
}

export default function SynthesisPanel() {
  const t = useTokens();
  const showSynthesis = useCouncilStore((s) => s.showSynthesis);
  const toggleSynthesis = useCouncilStore((s) => s.toggleSynthesis);
  const ranked = [...MOCK_RESPONSES].sort((a, b) => b.score - a.score);

  if (!showSynthesis) {
    return (
      <button onClick={toggleSynthesis}
        style={{
          width: '100%', padding: '14px 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          background: t.surface, border: `1px solid ${t.border}`, borderRadius: 8,
          borderLeft: `2px solid ${T.gold}`, cursor: 'pointer',
          transition: 'background 0.15s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = t.surfaceRaised; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = t.surface; }}
      >
        <span style={{ fontSize: 14, color: T.gold }}>{IC.star}</span>
        <span style={{ fontSize: 12, fontWeight: 600, color: t.text }}>Show Council Synthesis</span>
      </button>
    );
  }

  return (
    <div style={{
      background: t.surface, border: `1px solid ${t.border}`, borderRadius: 8,
      borderLeft: `2px solid ${T.gold}`, padding: '24px 24px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <span style={{ fontSize: 14, color: T.gold }}>{IC.star}</span>
        <span style={{
          fontSize: 9, fontFamily: font.mono, fontWeight: 500, color: T.gold,
          textTransform: 'uppercase', letterSpacing: '0.12em',
        }}>COUNCIL SYNTHESIS</span>
      </div>

      <div style={{ fontSize: 13, color: t.textSoft, lineHeight: 1.7 }}>{MOCK_SYNTHESIS}</div>

      {/* Score summary */}
      <div style={{ marginTop: 18, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {ranked.map((r, i) => {
          const m = MODELS.find((mod) => mod.id === r.modelId);
          const scoreColor = r.score >= 85 ? T.green : r.score >= 75 ? T.gold : t.textSoft;
          return (
            <div key={r.modelId} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 11, fontFamily: font.mono, fontWeight: 700, color: t.textMuted }}>#{i + 1}</span>
              <ModelDot color={m.color} size={6} />
              <span style={{ fontSize: 11, fontFamily: font.mono, color: t.textSoft }}>{m.name.split(' ')[0]}</span>
              <span style={{ fontSize: 12, fontFamily: font.mono, fontWeight: 700, color: scoreColor }}>{r.score}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
