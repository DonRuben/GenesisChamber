// ─────────────────────────────────────────────────────────
// GENESIS CHAMBER V4 — SYNTHESIS PANEL
// Collapsible council verdict with score rankings
// Store-driven with mock fallback
// ─────────────────────────────────────────────────────────

import { font } from '../../design/tokens';
import { IC } from '../../design/icons';
import { ModelDot } from '../../design/shared';
import { useCouncilStore } from '../../stores/councilStore';
import { useAppStore } from '../../stores/appStore';
import { MOCK_RESPONSES, MOCK_SYNTHESIS } from '../../data/mock';
import { SkeletonSynthesis } from '../../design/skeletons';
import { useTokens } from '../../hooks/useTokens';
import { useModelLookup } from '../../hooks/useModels';

export default function SynthesisPanel() {
  const t = useTokens();
  const lookupModel = useModelLookup();
  const showSynthesis = useCouncilStore((s) => s.showSynthesis);
  const toggleSynthesis = useCouncilStore((s) => s.toggleSynthesis);
  const backendOnline = useAppStore((s) => s.backendOnline);

  // Live data
  const stage3Result = useCouncilStore((s) => s.stage3Result);
  const stage2Results = useCouncilStore((s) => s.stage2Results);
  const loading = useCouncilStore((s) => s.loading);
  const currentStage = useCouncilStore((s) => s.currentStage);

  const synthesis = stage3Result?.response
    || (backendOnline === false ? MOCK_SYNTHESIS : null);

  // Build rankings from stage2 or mock
  const rankData = stage2Results?.aggregateRankings
    || (backendOnline === false
      ? [...MOCK_RESPONSES].sort((a, b) => b.score - a.score)
      : null);

  // Show skeleton during stage3 loading
  if (loading && currentStage === 'stage3') {
    return <SkeletonSynthesis />;
  }

  if (!showSynthesis) {
    return (
      <button onClick={toggleSynthesis}
        style={{
          width: '100%', padding: '14px 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          background: t.surface, border: `1px solid ${t.border}`, borderRadius: 8,
          borderLeft: `2px solid ${t.gold}`, cursor: 'pointer',
          transition: 'background 0.15s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = t.surfaceRaised; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = t.surface; }}
      >
        <span style={{ fontSize: 14, color: t.gold }}>{IC.star}</span>
        <span style={{ fontSize: 12, fontWeight: 600, color: t.text }}>Show Council Synthesis</span>
      </button>
    );
  }

  if (!synthesis) return null;

  return (
    <div className="gc-enter" style={{
      background: t.surface, border: `1px solid ${t.border}`, borderRadius: 8,
      borderLeft: `2px solid ${t.gold}`, padding: '24px 24px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <span style={{ fontSize: 14, color: t.gold }}>{IC.star}</span>
        <span style={{
          fontSize: 9, fontFamily: font.mono, fontWeight: 500, color: t.gold,
          textTransform: 'uppercase', letterSpacing: '0.12em',
        }}>COUNCIL SYNTHESIS</span>
      </div>

      <div style={{ fontSize: 13, color: t.textSoft, lineHeight: 1.7 }}>{synthesis}</div>

      {/* Thinking for synthesis */}
      {stage3Result?.reasoning && (
        <details style={{ marginTop: 12 }}>
          <summary style={{
            fontSize: 10, fontFamily: font.mono, color: t.purple,
            cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.06em',
          }}>
            Chairman Thinking
          </summary>
          <div style={{
            fontSize: 11, color: t.textMuted, lineHeight: 1.6, marginTop: 8,
            padding: '10px 14px', background: t.surfaceRaised, borderRadius: 6,
            fontFamily: font.mono, maxHeight: 200, overflow: 'auto',
            borderLeft: `2px solid ${t.purple}`,
          }}>
            {stage3Result.reasoning}
          </div>
        </details>
      )}

      {/* Score summary */}
      {rankData && (
        <div style={{ marginTop: 18, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {rankData.map((r, i) => {
            const modelId = r.model || r.model_name || r.modelId;
            const m = lookupModel(modelId);
            const score = r.pct ?? r.score ?? 0;
            const scoreColor = score >= 85 ? t.green : score >= 75 ? t.gold : t.textSoft;
            return (
              <div key={modelId || i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 11, fontFamily: font.mono, fontWeight: 700, color: t.textMuted }}>#{i + 1}</span>
                <ModelDot color={m.color} size={6} />
                <span style={{ fontSize: 11, fontFamily: font.mono, color: t.textSoft }}>{m.name?.split(' ')[0]}</span>
                <span style={{ fontSize: 12, fontFamily: font.mono, fontWeight: 700, color: scoreColor }}>{score}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
