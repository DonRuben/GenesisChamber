import { T, font } from '../../design/tokens';

export default function QuickStats({ stats }) {
  if (!stats) return null;

  const items = [
    { label: 'Rounds', value: stats.rounds, color: T.cyan },
    { label: 'Concepts', value: stats.totalConcepts, color: T.flame },
    { label: 'DA Attacks', value: stats.daAttacks, color: T.magenta },
    { label: 'Images', value: stats.imagesGenerated, color: T.gold },
  ];

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
      gap: 10,
    }}>
      {items.map(({ label, value, color }) => (
        <div key={label} style={{
          padding: '14px 16px', borderRadius: 8,
          background: T.surface, borderLeft: `2px solid ${color}`,
        }}>
          <div style={{
            fontSize: 28, fontFamily: font.mono, fontWeight: 700,
            color: T.text, lineHeight: 1,
          }}>{value}</div>
          <div style={{
            fontSize: 9, fontFamily: font.mono, color: T.textMuted,
            textTransform: 'uppercase', letterSpacing: '0.12em', marginTop: 4,
          }}>{label}</div>
        </div>
      ))}
    </div>
  );
}
