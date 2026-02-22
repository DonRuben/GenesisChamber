// ─────────────────────────────────────────────────────────
// GENESIS CHAMBER V4 — RESPONSE CARD
// Anonymous or revealed model response
// Ref: gc-v4-llm-council.jsx:249-306
// ─────────────────────────────────────────────────────────

import { T, TLight, font } from '../../design/tokens';
import { IC } from '../../design/icons';
import { Tag, ModelDot } from '../../design/shared';
import { useAppStore } from '../../stores/appStore';
import { MODELS } from '../../data/mock';

function useTokens() {
  const theme = useAppStore((s) => s.theme);
  return theme === 'light' ? { ...T, ...TLight } : T;
}

export default function ResponseCard({ response, index, revealed, isWinner, rank }) {
  const t = useTokens();
  const model = MODELS.find((m) => m.id === response.modelId);
  const scoreColor = response.score >= 85 ? T.green : response.score >= 75 ? T.gold : t.textSoft;

  return (
    <div style={{
      background: t.surface, border: `1px solid ${t.border}`, borderRadius: 8,
      borderLeft: `2px solid ${revealed ? model.color : t.textMuted}`,
      padding: '20px 24px', transition: 'border-color 0.2s',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {revealed ? (
            <>
              <ModelDot color={model.color} />
              <span style={{ fontSize: 12, fontWeight: 600, color: t.text }}>{model.name}</span>
              {isWinner && <Tag color={T.gold}>{IC.trophy} BEST</Tag>}
            </>
          ) : (
            <>
              <div style={{
                width: 22, height: 22, borderRadius: 4, background: t.surfaceRaised,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, fontFamily: font.mono, fontWeight: 700, color: t.textMuted,
              }}>
                {String.fromCharCode(65 + index)}
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: t.textSoft }}>
                Model {String.fromCharCode(65 + index)}
              </span>
            </>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {revealed && rank != null && (
            <span style={{ fontSize: 11, fontFamily: font.mono, color: t.textMuted, letterSpacing: '0.04em' }}>
              #{rank}
            </span>
          )}
          <span style={{ fontSize: 16, fontFamily: font.mono, fontWeight: 700, color: scoreColor }}>
            {response.score}
          </span>
        </div>
      </div>

      {/* Response text */}
      <div style={{ fontSize: 13, color: t.textSoft, lineHeight: 1.7 }}>{response.text}</div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 14 }}>
        <button style={{
          display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px',
          background: 'transparent', border: 'none', cursor: 'pointer',
          fontSize: 11, color: t.textMuted, fontFamily: font.mono,
        }}>
          <span style={{ fontSize: 12 }}>{IC.copy}</span> Copy
        </button>
      </div>
    </div>
  );
}
