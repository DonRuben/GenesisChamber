import { T, font } from '../../design/tokens';
import { Tag } from '../../design/shared';

export default function CritiqueCard({ critique }) {
  return (
    <div style={{
      borderLeft: `2px solid ${T.gold}`, borderRadius: 8,
      background: T.surface, overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 16px', borderBottom: `1px solid ${T.border}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: T.text }}>
            {critique.conceptName}
          </span>
          <Tag color={T.textMuted} label={`Round ${critique.round}`} />
        </div>
        <span style={{
          fontSize: 9, fontFamily: font.mono, color: T.textMuted,
        }}>{critique.criticsCount} critics</span>
      </div>

      {/* Strengths / Weaknesses grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        gap: 0,
      }}>
        {/* Strengths */}
        <div style={{
          padding: 14, borderRight: `1px solid ${T.border}`,
          background: `${T.green}05`,
        }}>
          <div style={{
            fontSize: 9, fontFamily: font.mono, fontWeight: 600,
            color: T.green, textTransform: 'uppercase', letterSpacing: '0.12em',
            marginBottom: 8,
          }}>Strengths</div>
          <ul style={{
            margin: 0, paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 4,
          }}>
            {critique.strengths.map((s, i) => (
              <li key={i} style={{
                fontSize: 11, color: T.textSoft, lineHeight: 1.5,
                borderLeft: `2px solid ${T.green}33`, paddingLeft: 8, listStyle: 'none',
                marginLeft: -16,
              }}>{s}</li>
            ))}
          </ul>
        </div>

        {/* Weaknesses */}
        <div style={{
          padding: 14,
          background: `${T.magenta}05`,
        }}>
          <div style={{
            fontSize: 9, fontFamily: font.mono, fontWeight: 600,
            color: T.magenta, textTransform: 'uppercase', letterSpacing: '0.12em',
            marginBottom: 8,
          }}>Weaknesses</div>
          <ul style={{
            margin: 0, paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 4,
          }}>
            {critique.weaknesses.map((w, i) => (
              <li key={i} style={{
                fontSize: 11, color: T.textSoft, lineHeight: 1.5,
                borderLeft: `2px solid ${T.magenta}33`, paddingLeft: 8, listStyle: 'none',
                marginLeft: -16,
              }}>{w}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* One Change */}
      {critique.oneChange && (
        <div style={{
          padding: '12px 16px', background: `${T.gold}08`,
          borderTop: `1px solid ${T.border}`,
        }}>
          <span style={{
            fontSize: 9, fontFamily: font.mono, fontWeight: 600,
            color: T.gold, textTransform: 'uppercase', letterSpacing: '0.12em',
          }}>One Change to Elevate</span>
          <p style={{
            fontSize: 12, color: T.textSoft, fontStyle: 'italic',
            margin: '6px 0 0', lineHeight: 1.5,
          }}>{critique.oneChange}</p>
        </div>
      )}
    </div>
  );
}
