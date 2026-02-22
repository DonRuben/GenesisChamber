import { font, motion } from '../../design/tokens';
import { useTokens } from '../../hooks/useTokens';
import { IC } from '../../design/icons';
import { ScoreRing, TierBadge, Tag } from '../../design/shared';

export default function ConceptCard({ concept, rank, isExpanded, onToggle }) {
  const t = useTokens();
  const isWinner = concept.status === 'winner';
  const isEliminated = concept.status === 'eliminated';
  const borderColor = isWinner ? t.gold : isEliminated ? t.magenta : t.cyan;
  const scoreColor = concept.score >= 85 ? t.green : concept.score >= 65 ? t.gold : t.magenta;
  const initials = (concept.persona || '').split(' ').map((w) => w[0]).join('').slice(0, 2);
  const avatarSize = isWinner ? 44 : 32;
  const headlineSize = isWinner ? 22 : 16;
  const ringSize = isWinner ? 52 : 40;

  return (
    <div
      onClick={!isWinner ? onToggle : undefined}
      style={{
        borderLeft: `2px solid ${borderColor}`, borderRadius: 8,
        background: t.surface, overflow: 'hidden',
        opacity: isEliminated ? 0.5 : 1,
        cursor: isWinner ? 'default' : 'pointer',
        transition: `all ${motion.duration.normal} ${motion.easing.default}`,
        gridColumn: isWinner ? '1 / -1' : undefined,
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: isWinner ? '20px 20px 16px' : '14px 16px',
      }}>
        {/* Avatar */}
        <div style={{
          width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2,
          flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: avatarSize * 0.3, fontFamily: font.mono, fontWeight: 700,
          color: concept.modelColor || t.textMuted,
          background: `${concept.modelColor || t.textMuted}1a`,
          border: `1.5px solid ${concept.modelColor || t.textMuted}44`,
        }}>{initials}</div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {isWinner && <span style={{ fontSize: 14, color: t.gold }}>{IC.crown}</span>}
            <span style={{
              fontSize: headlineSize, fontFamily: isWinner ? font.display : font.body,
              fontWeight: 700, color: isWinner ? t.gold : t.text,
              letterSpacing: isWinner ? '-0.02em' : 0,
            }}>{concept.name}</span>
            {!isWinner && <TierBadge score={concept.score} />}
          </div>
          <div style={{
            fontSize: 11, color: t.textSoft, marginTop: 2,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {concept.persona} · <span style={{
              fontFamily: font.mono, fontSize: 9, color: t.textMuted,
            }}>{concept.model}</span>
          </div>
          {isEliminated && (
            <Tag color={t.magenta}>
              {IC.x} Elim R{concept.eliminatedRound || concept.round}
            </Tag>
          )}
        </div>

        {/* Score */}
        <ScoreRing score={concept.score} size={ringSize} strokeWidth={3} color={scoreColor} />
      </div>

      {/* Score bar */}
      <div style={{ height: 3, background: t.surfaceRaised, margin: '0 16px' }}>
        <div style={{
          height: '100%', borderRadius: 2,
          width: `${concept.score}%`,
          background: scoreColor,
          transition: `width ${motion.duration.smooth} ${motion.easing.default}`,
        }} />
      </div>

      {/* Expandable content */}
      {(isWinner || isExpanded) && (
        <div style={{
          padding: '16px 20px',
          maxHeight: isWinner ? 'none' : isExpanded ? 500 : 0,
          opacity: isWinner ? 1 : isExpanded ? 1 : 0,
          overflow: 'hidden',
          transition: `max-height ${motion.duration.smooth} ${motion.easing.default}, opacity ${motion.duration.smooth}`,
        }}>
          {concept.headline && (
            <div style={{
              fontSize: 14, fontWeight: 600, color: t.text,
              marginBottom: 4, fontStyle: 'italic',
            }}>"{concept.headline}"</div>
          )}
          {concept.tagline && (
            <div style={{
              fontSize: 11, color: t.textSoft, marginBottom: 10,
            }}>{concept.tagline}</div>
          )}
          {concept.idea && (
            <p style={{
              fontSize: 12, color: t.textSoft, lineHeight: 1.6, margin: '0 0 12px',
            }}>{concept.idea}</p>
          )}
          {concept.strengths && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {concept.strengths.map((s, i) => (
                <Tag key={i} color={t.green}>{s}</Tag>
              ))}
            </div>
          )}
          {concept.weaknesses && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
              {concept.weaknesses.map((w, i) => (
                <Tag key={i} color={t.magenta}>{w}</Tag>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Expand hint for non-winner */}
      {!isWinner && !isExpanded && !isEliminated && (
        <div style={{
          padding: '6px 16px 10px', textAlign: 'center',
          fontSize: 9, fontFamily: font.mono, color: t.textMuted,
          letterSpacing: '0.06em', textTransform: 'uppercase',
        }}>DETAILS</div>
      )}
    </div>
  );
}
