import { T, font } from '../../design/tokens';

export default function LeaderCard({ role, leader }) {
  const { name, model, color } = leader;
  const initials = name.split(' ').map((w) => w[0]).join('').slice(0, 2);
  const roleColor = role === 'Moderator' ? T.gold : role === 'Evaluator' ? T.cyan : T.magenta;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '12px 16px', borderRadius: 8,
      background: T.surface, border: `1px solid ${T.border}`,
      borderLeft: `2px solid ${roleColor}`,
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 20, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 13, fontFamily: font.mono, fontWeight: 700,
        color: color || roleColor, background: `${color || roleColor}1a`,
        border: `1.5px solid ${color || roleColor}44`,
      }}>{initials}</div>
      <div style={{ flex: 1 }}>
        <div style={{
          fontSize: 9, fontFamily: font.mono, fontWeight: 600,
          color: roleColor, textTransform: 'uppercase', letterSpacing: '0.12em',
          marginBottom: 2,
        }}>{role}</div>
        <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{name}</div>
      </div>
      <span style={{
        fontSize: 9, fontFamily: font.mono, color: T.textMuted,
        padding: '2px 8px', background: T.surfaceRaised, borderRadius: 3,
      }}>{model}</span>
    </div>
  );
}
