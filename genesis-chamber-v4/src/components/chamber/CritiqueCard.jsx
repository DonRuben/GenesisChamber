import { font } from '../../design/tokens';
import { useTokens } from '../../hooks/useTokens';
import { Tag } from '../../design/shared';

export default function CritiqueCard({ critique }) {
  const t = useTokens();
  return (
    <div style={{
      borderLeft: `2px solid ${t.gold}`, borderRadius: 8,
      background: t.surface, overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 16px', borderBottom: `1px solid ${t.border}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: t.text }}>
            {critique.conceptName}
          </span>
          <Tag color={t.textMuted} label={`Round ${critique.round}`} />
        </div>
        <span style={{
          fontSize: 9, fontFamily: font.mono, color: t.textMuted,
        }}>{critique.criticsCount} critics</span>
      </div>

      {/* Strengths / Weaknesses grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        gap: 0,
      }}>
        {/* Strengths */}
        <div style={{
          padding: 14, borderRight: `1px solid ${t.border}`,
          background: `${t.green}05`,
        }}>
          <div style={{
            fontSize: 9, fontFamily: font.mono, fontWeight: 600,
            color: t.green, textTransform: 'uppercase', letterSpacing: '0.12em',
            marginBottom: 8,
          }}>Strengths</div>
          <ul style={{
            margin: 0, paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 4,
          }}>
            {critique.strengths.map((s, i) => (
              <li key={i} style={{
                fontSize: 11, color: t.textSoft, lineHeight: 1.5,
                borderLeft: `2px solid ${t.green}33`, paddingLeft: 8, listStyle: 'none',
                marginLeft: -16,
              }}>{s}</li>
            ))}
          </ul>
        </div>

        {/* Weaknesses */}
        <div style={{
          padding: 14,
          background: `${t.magenta}05`,
        }}>
          <div style={{
            fontSize: 9, fontFamily: font.mono, fontWeight: 600,
            color: t.magenta, textTransform: 'uppercase', letterSpacing: '0.12em',
            marginBottom: 8,
          }}>Weaknesses</div>
          <ul style={{
            margin: 0, paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 4,
          }}>
            {critique.weaknesses.map((w, i) => (
              <li key={i} style={{
                fontSize: 11, color: t.textSoft, lineHeight: 1.5,
                borderLeft: `2px solid ${t.magenta}33`, paddingLeft: 8, listStyle: 'none',
                marginLeft: -16,
              }}>{w}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* One Change */}
      {critique.oneChange && (
        <div style={{
          padding: '12px 16px', background: `${t.gold}08`,
          borderTop: `1px solid ${t.border}`,
        }}>
          <span style={{
            fontSize: 9, fontFamily: font.mono, fontWeight: 600,
            color: t.gold, textTransform: 'uppercase', letterSpacing: '0.12em',
          }}>One Change to Elevate</span>
          <p style={{
            fontSize: 12, color: t.textSoft, fontStyle: 'italic',
            margin: '6px 0 0', lineHeight: 1.5,
          }}>{critique.oneChange}</p>
        </div>
      )}
    </div>
  );
}
