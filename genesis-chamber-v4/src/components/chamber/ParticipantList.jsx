import { font } from '../../design/tokens';
import { useTokens } from '../../hooks/useTokens';
import { StatusBadge } from '../../design/shared';
import { useIsMobile } from '../../hooks/useMediaQuery';

export default function ParticipantList({ participants }) {
  const t = useTokens();
  const mobile = useIsMobile();
  if (!participants?.length) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {participants.map((p) => {
        const isWinner = p.status === 'winner';
        const isEliminated = p.status === 'eliminated';
        return (
          <div key={p.id} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 14px', borderRadius: 6,
            background: isWinner ? `${t.gold}0d` : t.surface,
            opacity: isEliminated ? 0.55 : 1,
            transition: 'opacity 0.2s',
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: 14, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10, fontFamily: font.mono, fontWeight: 700,
              color: p.modelColor || t.textMuted,
              background: `${p.modelColor || t.textMuted}1a`,
              border: `1.5px solid ${p.modelColor || t.textMuted}44`,
            }}>
              {p.name.split(' ').map((w) => w[0]).join('').slice(0, 2)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 12, fontWeight: 600, color: t.text,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>{p.name}</div>
              <div style={{
                fontSize: 9, fontFamily: font.mono, color: t.textMuted,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>{p.concept}{mobile ? '' : ` · ${p.model}`}</div>
            </div>
            {!mobile && (
              <span style={{
                fontSize: 18, fontFamily: font.mono, fontWeight: 700,
                color: isWinner ? t.gold : isEliminated ? t.magenta : t.text,
              }}>{p.score}</span>
            )}
            <StatusBadge status={isWinner ? 'complete' : isEliminated ? 'failed' : 'running'} />
          </div>
        );
      })}
    </div>
  );
}
