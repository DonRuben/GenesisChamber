import { font } from '../../design/tokens';
import { useTokens } from '../../hooks/useTokens';
import { IC } from '../../design/icons';
import { ScoreRing, Tag } from '../../design/shared';

export default function WinnerSpotlight({ concept }) {
  const t = useTokens();
  if (!concept) return null;
  return (
    <div className="gc-winner-reveal" style={{
      borderLeft: `2px solid ${t.gold}`, borderRadius: 8,
      background: t.surface, padding: 24,
      display: 'flex', gap: 20, alignItems: 'flex-start',
      flexWrap: 'wrap',
    }}>
      <div style={{ flex: 1, minWidth: 200 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10,
        }}>
          <span style={{ fontSize: 16, color: t.gold }}>{IC.crown}</span>
          <span style={{
            fontSize: 9, fontFamily: font.mono, fontWeight: 600,
            color: t.gold, textTransform: 'uppercase', letterSpacing: '0.12em',
          }}>WINNING CONCEPT</span>
        </div>
        <h2 style={{
          fontSize: 28, fontFamily: font.display, fontWeight: 700,
          color: t.gold, letterSpacing: '-0.03em', margin: '0 0 6px',
        }}>{concept.headline}</h2>
        <p style={{
          fontSize: 13, fontStyle: 'italic', color: t.textSoft,
          margin: '0 0 12px',
        }}>{concept.tagline}</p>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12,
        }}>
          <span style={{ color: t.flame, fontWeight: 600, fontSize: 12 }}>
            {concept.persona}
          </span>
          <span style={{
            fontSize: 9, fontFamily: font.mono, color: t.textMuted,
          }}>{concept.model}</span>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <Tag color={t.gold} label="WINNER" />
          <Tag color={t.green} label="HIGHEST SCORE" />
          {concept.strengths?.map((s, i) => (
            <Tag key={i} color={t.cyan}>{s}</Tag>
          ))}
        </div>
      </div>
      <ScoreRing score={concept.score} size={80} strokeWidth={4} color={t.gold} />
    </div>
  );
}
