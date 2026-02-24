import { useState } from 'react';
import { font, motion } from '../../design/tokens';
import { useTokens } from '../../hooks/useTokens';
import { useModelLookup } from '../../hooks/useModels';

export default function PersonaChip({
  persona, teamColor, selected, onToggle,
  thinkingMode, globalThinkingMode, isLeader, leaderRole, onShowInfo,
}) {
  const t = useTokens();
  const lookupModel = useModelLookup();
  const { name, title, model } = persona;
  const initials = name.split(' ').map((w) => w[0]).join('').slice(0, 2);
  const modelInfo = lookupModel(model);
  const [hovered, setHovered] = useState(false);

  // Resolve effective thinking for badge display
  const isDefault = !thinkingMode || thinkingMode === 'default';
  const effective = isDefault ? (globalThinkingMode || 'off') : thinkingMode;
  const showBadge = selected && effective !== 'off';
  const isInherited = isDefault && effective !== 'off';
  const isOverride = !isDefault && thinkingMode !== 'off';

  const badgeColor = effective === 'deep' ? '#8B5CF6' : '#00D9FF';
  const badgeBg = effective === 'deep' ? 'rgba(139,92,246,0.12)' : 'rgba(0,217,255,0.12)';
  const badgeLabel = effective === 'deep' ? 'DEEP' : 'THINK';

  // Dual-role badge
  const showDualRole = selected && isLeader && leaderRole;
  const dualColor = leaderRole === 'moderator' ? '#FFB800' : '#8B5CF6';
  const dualBg = leaderRole === 'moderator' ? 'rgba(255,184,0,0.12)' : 'rgba(139,92,246,0.12)';
  const dualLabel = leaderRole === 'moderator' ? 'MODERATOR + PARTICIPANT' : 'EVALUATOR + PARTICIPANT';

  return (
    <button
      onClick={onToggle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '8px 12px', borderRadius: 8, position: 'relative',
        background: selected ? `${teamColor}0d` : t.surface,
        border: `1px solid ${selected ? teamColor : t.border}`,
        cursor: 'pointer', width: '100%', textAlign: 'left',
        transition: `all ${motion.duration.fast} ${motion.easing.default}`,
      }}
    >
      {/* Avatar */}
      <div style={{
        width: 36, height: 36, borderRadius: 18, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 12, fontFamily: font.mono, fontWeight: 700,
        color: teamColor, background: `${teamColor}1a`,
        border: `1.5px solid ${teamColor}44`,
      }}>
        {initials}
      </div>

      {/* Name + title + dual role badge */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 12, fontWeight: 600, color: t.text,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>{name}</div>
        <div style={{
          fontSize: 9, fontFamily: font.mono, color: t.textMuted,
          textTransform: 'uppercase', letterSpacing: '0.06em',
        }}>{title}</div>
        {showDualRole && (
          <span style={{
            display: 'inline-block', marginTop: 3,
            fontSize: 8, fontFamily: font.mono, fontWeight: 600,
            color: dualColor, background: dualBg,
            padding: '1px 5px', borderRadius: 3,
            textTransform: 'uppercase', letterSpacing: '0.05em',
          }}>{dualLabel}</span>
        )}
      </div>

      {/* Model badge */}
      <span style={{
        fontSize: 9, fontFamily: font.mono, color: modelInfo.color || t.textMuted,
        padding: '2px 6px', background: t.surfaceRaised, borderRadius: 3,
        whiteSpace: 'nowrap',
      }}>{modelInfo.name}</span>

      {/* Thinking badge — clean pill */}
      {showBadge && (
        <span style={{
          fontSize: 9, fontFamily: font.mono, fontWeight: 700,
          color: badgeColor, background: badgeBg,
          padding: '2px 6px', borderRadius: 6,
          whiteSpace: 'nowrap', textTransform: 'uppercase',
          letterSpacing: '0.04em',
        }}>
          {isInherited ? '\u2193 ' : ''}{badgeLabel}{isOverride ? ' \u2022' : ''}
        </span>
      )}

      {/* Info button */}
      {onShowInfo && (
        <div
          onClick={(e) => { e.stopPropagation(); onShowInfo(persona.id); }}
          style={{
            width: 16, height: 16, borderRadius: 8, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: hovered || isLeader ? t.surfaceRaised : 'transparent',
            color: hovered || isLeader ? t.textSoft : 'transparent',
            fontSize: 10, cursor: 'pointer',
            transition: 'all 0.15s',
          }}
        >
          {'\u2139'}
        </div>
      )}

      {/* Checkbox */}
      <div style={{
        width: 18, height: 18, borderRadius: 4, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: selected ? teamColor : 'transparent',
        border: `1.5px solid ${selected ? teamColor : t.border}`,
        transition: 'all 0.15s',
      }}>
        {selected && <span style={{ fontSize: 11, color: '#fff', fontWeight: 700 }}>{'\u2713'}</span>}
      </div>
    </button>
  );
}
