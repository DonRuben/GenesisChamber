// ─────────────────────────────────────────────────────────
// DA ARENA — Verdict Bar (Full Width Bottom)
// Dynamic color by verdict status, score change display
// ─────────────────────────────────────────────────────────

import { T, font } from '../../design/tokens';
import { IC } from '../../design/icons';
import { ScoreChange } from '../../design/shared';

function verdictColor(status) {
  if (status === 'accepted_strong') return T.da.verdict.strong;
  if (status === 'accepted_partial') return T.da.verdict.partial;
  if (status === 'insufficient') return T.da.verdict.insufficient;
  return T.da.verdict.noDefense;
}

export default function VerdictBar({ attack, verdict }) {
  const c = verdictColor(verdict.status);

  return (
    <div style={{
      background: T.surface,
      border: `1px solid ${T.border}`, borderRadius: 8,
      borderLeft: `2px solid ${c}`,
      padding: '16px 24px',
      display: 'flex', alignItems: 'center', gap: 20,
    }}>
      <span style={{ fontSize: 14, color: T.gold }}>{IC.award}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 2 }}>
          {verdict.label}
        </div>
        {verdict.details && (
          <div style={{ fontSize: 12, color: T.textSoft, lineHeight: 1.5 }}>
            {verdict.details}
          </div>
        )}
      </div>
      <ScoreChange from={attack.da_score} to={verdict.revised_score} />
    </div>
  );
}
