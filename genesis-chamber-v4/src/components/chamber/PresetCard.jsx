import { T, font, motion } from '../../design/tokens';
import { IC } from '../../design/icons';

const iconMap = { bolt: IC.bolt, megaphone: IC.megaphone, temple: IC.temple, factory: IC.factory };

export default function PresetCard({ preset, selected, onClick }) {
  const { name, desc, icon, color, time, participants, rounds } = preset;
  const Icon = iconMap[icon] || IC.bolt;

  return (
    <button onClick={onClick} style={{
      background: selected ? `${color}0d` : T.surface,
      border: `1px solid ${selected ? color : T.border}`,
      borderBottom: selected ? `3px solid ${color}` : `1px solid ${T.border}`,
      borderRadius: 8, padding: '20px 16px', cursor: 'pointer',
      textAlign: 'left', transition: `all ${motion.duration.normal} ${motion.easing.default}`,
      display: 'flex', flexDirection: 'column', gap: 10,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 18, color }}>{Icon}</span>
        <span style={{
          fontSize: 15, fontFamily: font.display, fontWeight: 700,
          color: T.text, letterSpacing: '-0.02em',
        }}>{name}</span>
      </div>
      <p style={{
        fontSize: 11, color: T.textSoft, lineHeight: 1.5, margin: 0,
        fontFamily: font.body,
      }}>{desc}</p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 'auto' }}>
        {[`${participants} personas`, `${rounds} rounds`, time].map((tag) => (
          <span key={tag} style={{
            fontSize: 9, fontFamily: font.mono, color: T.textMuted,
            padding: '2px 8px', background: T.surfaceRaised, borderRadius: 4,
            textTransform: 'uppercase', letterSpacing: '0.08em',
          }}>{tag}</span>
        ))}
      </div>
    </button>
  );
}
