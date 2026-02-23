// ─────────────────────────────────────────────────────────
// GENESIS CHAMBER V4 — RESPONSE CARD
// Anonymous or revealed model response
// Accepts both mock format and backend API format
// ─────────────────────────────────────────────────────────

import { useState } from 'react';
import { font } from '../../design/tokens';
import { IC } from '../../design/icons';
import { Tag, ModelDot } from '../../design/shared';
import { useTokens } from '../../hooks/useTokens';
import { useModelLookup } from '../../hooks/useModels';

export default function ResponseCard({ response, index, revealed, isWinner, rank, score }) {
  const t = useTokens();
  const lookupModel = useModelLookup();
  const [showThinking, setShowThinking] = useState(false);

  // Accept both mock format {modelId, text, score} and backend format {model, response, reasoning}
  const modelId = response.model || response.modelId;
  const text = response.response || response.text;
  const displayScore = score ?? response.score ?? null;
  const reasoning = response.reasoning || response.reasoning_details;

  // Look up model info via hook
  const model = lookupModel(modelId);

  const scoreColor = displayScore != null
    ? (displayScore >= 85 ? t.green : displayScore >= 75 ? t.gold : t.textSoft)
    : t.textMuted;

  return (
    <div className="gc-enter" style={{
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
              {isWinner && <Tag color={t.gold}>{IC.trophy} BEST</Tag>}
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
          {displayScore != null && (
            <span style={{ fontSize: 16, fontFamily: font.mono, fontWeight: 700, color: scoreColor }}>
              {displayScore}
            </span>
          )}
        </div>
      </div>

      {/* Thinking/reasoning expandable */}
      {reasoning && (
        <button
          onClick={() => setShowThinking(!showThinking)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10,
            padding: '4px 8px', background: `${t.purple}12`, border: `1px solid ${t.purple}33`,
            borderRadius: 4, cursor: 'pointer', fontSize: 10, fontFamily: font.mono,
            color: t.purple, textTransform: 'uppercase', letterSpacing: '0.06em',
          }}
        >
          {IC.brain} {showThinking ? 'Hide' : 'Show'} Thinking
        </button>
      )}
      {showThinking && reasoning && (
        <div style={{
          fontSize: 11, color: t.textMuted, lineHeight: 1.6, marginBottom: 12,
          padding: '10px 14px', background: t.surfaceRaised, borderRadius: 6,
          fontFamily: font.mono, maxHeight: 200, overflow: 'auto',
          borderLeft: `2px solid ${t.purple}`,
        }}>
          {typeof reasoning === 'string' ? reasoning : JSON.stringify(reasoning, null, 2)}
        </div>
      )}

      {/* Response text */}
      <div style={{ fontSize: 13, color: t.textSoft, lineHeight: 1.7 }}>{text}</div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 14 }}>
        <button
          onClick={() => navigator.clipboard?.writeText(text)}
          style={{
            display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px',
            background: 'transparent', border: 'none', cursor: 'pointer',
            fontSize: 11, color: t.textMuted, fontFamily: font.mono,
          }}
        >
          <span style={{ fontSize: 12 }}>{IC.copy}</span> Copy
        </button>
      </div>
    </div>
  );
}
