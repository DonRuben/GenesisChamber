import { T, font } from '../../design/tokens';
import { IC } from '../../design/icons';
import { ScoreRing, Tag } from '../../design/shared';

export default function WinnerSpotlight({ concept }) {
  if (!concept) return null;
  return (
    <div style={{
      borderLeft: `2px solid ${T.gold}`, borderRadius: 8,
      background: T.surface, padding: 24,
      display: 'flex', gap: 20, alignItems: 'flex-start',
      flexWrap: 'wrap',
    }}>
      <div style={{ flex: 1, minWidth: 200 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10,
        }}>
          <span style={{ fontSize: 16, color: T.gold }}>{IC.crown}</span>
          <span style={{
            fontSize: 9, fontFamily: font.mono, fontWeight: 600,
            color: T.gold, textTransform: 'uppercase', letterSpacing: '0.12em',
          }}>WINNING CONCEPT</span>
        </div>
        <h2 style={{
          fontSize: 28, fontFamily: font.display, fontWeight: 700,
          color: T.gold, letterSpacing: '-0.03em', margin: '0 0 6px',
        }}>{concept.headline}</h2>
        <p style={{
          fontSize: 13, fontStyle: 'italic', color: T.textSoft,
          margin: '0 0 12px',
        }}>{concept.tagline}</p>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12,
        }}>
          <span style={{ color: T.flame, fontWeight: 600, fontSize: 12 }}>
            {concept.persona}
          </span>
          <span style={{
            fontSize: 9, fontFamily: font.mono, color: T.textMuted,
          }}>{concept.model}</span>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <Tag color={T.gold} label="WINNER" />
          <Tag color={T.green} label="HIGHEST SCORE" />
          {concept.strengths?.map((s, i) => (
            <Tag key={i} color={T.cyan}>{s}</Tag>
          ))}
        </div>
      </div>
      <ScoreRing score={concept.score} size={80} strokeWidth={4} color={T.gold} />
    </div>
  );
}
