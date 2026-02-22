import { useState } from 'react';
import { font, motion } from '../../design/tokens';
import { IC } from '../../design/icons';
import { useTokens } from '../../hooks/useTokens';

const iconMap = { bolt: IC.bolt, megaphone: IC.megaphone, temple: IC.temple, factory: IC.factory };

export default function PresetCard({ preset, selected, onClick }) {
  const t = useTokens();
  const [hovered, setHovered] = useState(false);
  const { name, desc, icon, color, time, participants, rounds } = preset;
  const Icon = iconMap[icon] || IC.bolt;

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: selected ? `${color}0d` : t.surface,
        border: `1px solid ${selected ? color : t.border}`,
        borderBottom: selected ? `3px solid ${color}` : `1px solid ${t.border}`,
        borderRadius: 8, padding: '20px 16px', cursor: 'pointer',
        textAlign: 'left', transition: `all ${motion.duration.normal} ${motion.easing.default}`,
        display: 'flex', flexDirection: 'column', gap: 10,
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 18, color }}>{Icon}</span>
        <span style={{
          fontSize: 15, fontFamily: font.display, fontWeight: 700,
          color: t.text, letterSpacing: '-0.02em',
        }}>{name}</span>
      </div>
      <p style={{
        fontSize: 11, color: t.textSoft, lineHeight: 1.5, margin: 0,
        fontFamily: font.body,
      }}>{desc}</p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 'auto' }}>
        {[`${participants} personas`, `${rounds} rounds`, time].map((tag) => (
          <span key={tag} style={{
            fontSize: 9, fontFamily: font.mono, color: t.textMuted,
            padding: '2px 8px', background: t.surfaceRaised, borderRadius: 4,
            textTransform: 'uppercase', letterSpacing: '0.08em',
          }}>{tag}</span>
        ))}
      </div>
    </button>
  );
}
