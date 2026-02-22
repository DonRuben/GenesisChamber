import { T, font, motion } from '../../design/tokens';
import { IC } from '../../design/icons';
import { MOCK_STAGES } from '../../data/mock';

const stageIcons = {
  plus: IC.plus, evaluate: IC.evaluate, shield: IC.shield,
  brain: IC.brain, refresh: IC.refresh, star: IC.star,
};

export default function StageProgress({ stages = MOCK_STAGES }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 0,
      padding: '8px 0', overflow: 'auto',
    }}>
      {stages.map((stage, i) => {
        const icon = stageIcons[stage.icon];
        const isComplete = stage.status === 'complete';
        const isActive = stage.status === 'active';
        const color = isComplete || isActive ? stage.color : T.textMuted;

        return (
          <div key={stage.name} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '4px 10px', borderRadius: 6,
              background: isActive ? `${color}1a` : isComplete ? `${color}0d` : 'transparent',
              border: isActive ? `1px solid ${color}44` : '1px solid transparent',
              transition: `all ${motion.duration.normal}`,
            }}>
              <span style={{ fontSize: 12, color }}>
                {isComplete ? IC.check : icon}
              </span>
              <span style={{
                fontSize: 9, fontFamily: font.mono, fontWeight: 600,
                color, textTransform: 'uppercase', letterSpacing: '0.06em',
                whiteSpace: 'nowrap',
              }}>{stage.name}</span>
              {isActive && (
                <span style={{
                  width: 6, height: 6, borderRadius: 3, background: color,
                  animation: 'pulse 1.5s infinite',
                }} />
              )}
            </div>
            {i < stages.length - 1 && (
              <div style={{
                width: 16, height: 1,
                background: isComplete ? `${stage.color}66` : T.border,
                transition: `background ${motion.duration.normal}`,
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}
