import { font } from '../../design/tokens';
import { useTokens } from '../../hooks/useTokens';
import { useIsMobile } from '../../hooks/useMediaQuery';

export default function QuickStats({ stats }) {
  const t = useTokens();
  const mobile = useIsMobile();
  if (!stats) return null;

  const items = [
    { label: 'Rounds', value: stats.rounds, color: t.cyan },
    { label: 'Concepts', value: stats.totalConcepts, color: t.flame },
    { label: 'DA Attacks', value: stats.daAttacks, color: t.magenta },
    { label: 'Images', value: stats.imagesGenerated, color: t.gold },
  ];

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: mobile ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(140px, 1fr))',
      gap: 10,
    }}>
      {items.map(({ label, value, color }) => (
        <div key={label} style={{
          padding: '14px 16px', borderRadius: 8,
          background: t.surface, borderLeft: `2px solid ${color}`,
        }}>
          <div style={{
            fontSize: 28, fontFamily: font.mono, fontWeight: 700,
            color: t.text, lineHeight: 1,
          }}>{value}</div>
          <div style={{
            fontSize: 9, fontFamily: font.mono, color: t.textMuted,
            textTransform: 'uppercase', letterSpacing: '0.12em', marginTop: 4,
          }}>{label}</div>
        </div>
      ))}
    </div>
  );
}
