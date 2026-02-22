// ─────────────────────────────────────────────────────────
// DA ARENA — Defense Panel (Right Side)
// Creative's defense + verdict + rating buttons
// ─────────────────────────────────────────────────────────

import { font } from '../../design/tokens';
import { useTokens } from '../../hooks/useTokens';
import { IC } from '../../design/icons';
import { MonoLabel, VerdictBadge } from '../../design/shared';
import { DA_RATINGS } from '../../data/mock';

function RatingButtons({ current, onRate }) {
  const t = useTokens();
  return (
    <div>
      <MonoLabel style={{ marginBottom: 10 }}>RATE THIS CHALLENGE</MonoLabel>
      <div style={{ display: 'flex', gap: 6 }}>
        {DA_RATINGS.map((r) => (
          <button
            key={r.key}
            onClick={() => onRate(r.key)}
            title={r.desc}
            className={current === r.key ? 'gc-rating-pulse' : undefined}
            style={{
              flex: 1, padding: '10px 8px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              background: current === r.key ? `${r.color}1a` : 'transparent',
              border: `1px solid ${current === r.key ? r.color : t.border}`,
              borderRadius: 6,
              borderLeft: `2px solid ${current === r.key ? r.color : 'transparent'}`,
              cursor: 'pointer', transition: 'all 0.13s',
            }}
          >
            <span style={{
              fontSize: 11, fontWeight: 600,
              color: current === r.key ? r.color : t.textSoft,
            }}>
              {r.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

// Map verdict status to VerdictBadge key
function verdictKey(status) {
  if (status === 'accepted_strong') return 'strong';
  if (status === 'accepted_partial') return 'partial';
  if (status === 'insufficient') return 'insufficient';
  return 'no-defense';
}

export default function DefensePanel({ defense, concept, verdict, currentRating, onRate }) {
  const t = useTokens();
  return (
    <div style={{
      flex: 1, background: t.surface,
      border: `1px solid ${t.border}`, borderRadius: 8,
      borderLeft: `2px solid ${defense.submitted ? t.da.defense : t.textMuted}`,
      padding: 24, display: 'flex', flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 16, color: t.da.defense }}>{IC.shield}</span>
          <MonoLabel color={t.da.defense} style={{ marginBottom: 0 }}>DEFENSE</MonoLabel>
        </div>
        <VerdictBadge verdict={verdictKey(verdict.status)} />
      </div>

      {/* Defense Text */}
      {defense.submitted ? (
        <p style={{
          fontSize: 14, color: t.text, lineHeight: 1.7, margin: '0 0 20px',
        }}>
          {defense.text}
        </p>
      ) : (
        <div style={{
          padding: '28px 20px', background: t.surfaceRaised,
          borderRadius: 6, textAlign: 'center', marginBottom: 20,
        }}>
          <span style={{ fontSize: 13, color: t.textMuted, fontStyle: 'italic' }}>
            No defense submitted for this challenge.
          </span>
        </div>
      )}

      {/* Verdict Notes */}
      {verdict.details && (
        <div style={{ marginBottom: 20 }}>
          <MonoLabel style={{ marginBottom: 6 }}>VERDICT NOTES</MonoLabel>
          <p style={{ fontSize: 13, color: t.textSoft, lineHeight: 1.6, margin: 0 }}>
            {verdict.details}
          </p>
        </div>
      )}

      {/* Rating */}
      <div style={{ marginBottom: 20 }}>
        <RatingButtons current={currentRating} onRate={onRate} />
      </div>

      {/* Footer */}
      <div style={{
        marginTop: 'auto', paddingTop: 16,
        borderTop: `1px solid ${t.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 6, height: 6, borderRadius: 3, background: concept.modelColor }} />
          <span style={{ fontSize: 11, fontFamily: font.mono, color: t.textMuted }}>
            {concept.model} · {concept.persona}
          </span>
        </div>
        <span style={{
          fontSize: 18, fontFamily: font.mono, fontWeight: 700,
          color: verdict.revised_score >= 7 ? t.green : verdict.revised_score >= 4 ? t.gold : t.magenta,
        }}>
          {verdict.revised_score}<span style={{ fontSize: 11, color: t.textMuted }}>/10</span>
        </span>
      </div>
    </div>
  );
}
