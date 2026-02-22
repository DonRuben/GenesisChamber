// ─────────────────────────────────────────────────────────
// DA ARENA — Verdict Bar (Full Width Bottom)
// Dynamic color by verdict status, score change display
// ─────────────────────────────────────────────────────────

import { useTokens } from '../../hooks/useTokens';
import { IC } from '../../design/icons';
import { ScoreChange } from '../../design/shared';

export default function VerdictBar({ attack, verdict }) {
  const t = useTokens();

  function verdictColor(status) {
    if (status === 'accepted_strong') return t.da.verdict.strong;
    if (status === 'accepted_partial') return t.da.verdict.partial;
    if (status === 'insufficient') return t.da.verdict.insufficient;
    return t.da.verdict.noDefense;
  }

  const c = verdictColor(verdict.status);

  return (
    <div style={{
      background: t.surface,
      border: `1px solid ${t.border}`, borderRadius: 8,
      borderLeft: `2px solid ${c}`,
      padding: '16px 24px',
      display: 'flex', alignItems: 'center', gap: 20,
    }}>
      <span style={{ fontSize: 14, color: t.gold }}>{IC.award}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: t.text, marginBottom: 2 }}>
          {verdict.label}
        </div>
        {verdict.details && (
          <div style={{ fontSize: 12, color: t.textSoft, lineHeight: 1.5 }}>
            {verdict.details}
          </div>
        )}
      </div>
      <ScoreChange from={attack.da_score} to={verdict.revised_score} />
    </div>
  );
}
