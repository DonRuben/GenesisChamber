import { T, font, motion } from '../../design/tokens';

export default function PersonaChip({ persona, teamColor, selected, onToggle }) {
  const { name, title, model } = persona;
  const initials = name.split(' ').map((w) => w[0]).join('').slice(0, 2);

  return (
    <button onClick={onToggle} style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '8px 12px', borderRadius: 8,
      background: selected ? `${teamColor}0d` : T.surface,
      border: `1px solid ${selected ? teamColor : T.border}`,
      cursor: 'pointer', width: '100%', textAlign: 'left',
      transition: `all ${motion.duration.fast} ${motion.easing.default}`,
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 18, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 12, fontFamily: font.mono, fontWeight: 700,
        color: teamColor, background: `${teamColor}1a`,
        border: `1.5px solid ${teamColor}44`,
      }}>
        {initials}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 12, fontWeight: 600, color: T.text,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>{name}</div>
        <div style={{
          fontSize: 9, fontFamily: font.mono, color: T.textMuted,
          textTransform: 'uppercase', letterSpacing: '0.06em',
        }}>{title}</div>
      </div>
      <span style={{
        fontSize: 9, fontFamily: font.mono, color: T.textMuted,
        padding: '2px 6px', background: T.surfaceRaised, borderRadius: 3,
        whiteSpace: 'nowrap',
      }}>{model}</span>
      <div style={{
        width: 18, height: 18, borderRadius: 4, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: selected ? teamColor : 'transparent',
        border: `1.5px solid ${selected ? teamColor : T.border}`,
        transition: 'all 0.15s',
      }}>
        {selected && <span style={{ fontSize: 11, color: '#fff', fontWeight: 700 }}>{'\u2713'}</span>}
      </div>
    </button>
  );
}
