import { T, font } from '../../design/tokens';
import { StatusBadge } from '../../design/shared';

export default function ParticipantList({ participants }) {
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
            background: isWinner ? `${T.gold}0d` : T.surface,
            opacity: isEliminated ? 0.55 : 1,
            transition: 'opacity 0.2s',
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: 14, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10, fontFamily: font.mono, fontWeight: 700,
              color: p.modelColor || T.textMuted,
              background: `${p.modelColor || T.textMuted}1a`,
              border: `1.5px solid ${p.modelColor || T.textMuted}44`,
            }}>
              {p.name.split(' ').map((w) => w[0]).join('').slice(0, 2)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 12, fontWeight: 600, color: T.text,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>{p.name}</div>
              <div style={{
                fontSize: 9, fontFamily: font.mono, color: T.textMuted,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>{p.concept} · {p.model}</div>
            </div>
            <span style={{
              fontSize: 18, fontFamily: font.mono, fontWeight: 700,
              color: isWinner ? T.gold : isEliminated ? T.magenta : T.text,
            }}>{p.score}</span>
            <StatusBadge status={isWinner ? 'complete' : isEliminated ? 'failed' : 'running'} />
          </div>
        );
      })}
    </div>
  );
}
