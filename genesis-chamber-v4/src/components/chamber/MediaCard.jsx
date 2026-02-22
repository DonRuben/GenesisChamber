import { T, font } from '../../design/tokens';
import { IC } from '../../design/icons';
import { ModelDot } from '../../design/shared';

export default function MediaCard({ item, onClick }) {
  const isVideo = item.type === 'video';
  const isWinner = item.status === 'winner';
  const borderColor = isWinner ? T.gold : item.status === 'eliminated' ? T.magenta : T.cyan;

  return (
    <button onClick={onClick} style={{
      background: T.surface, border: 'none', borderRadius: 8,
      overflow: 'hidden', cursor: 'pointer', textAlign: 'left',
      borderLeft: `2px solid ${borderColor}`,
      transition: 'transform 0.15s',
    }}>
      {/* Image placeholder */}
      <div style={{
        aspectRatio: item.aspect || '4/5',
        background: T.surfaceRaised,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative',
      }}>
        <span style={{ fontSize: 28, color: T.textMuted }}>
          {isVideo ? IC.play : IC.gallery}
        </span>

        {/* Type overlay */}
        <span style={{
          position: 'absolute', top: 6, left: 6,
          fontSize: 9, fontFamily: font.mono, fontWeight: 600,
          color: T.textMuted, padding: '2px 6px',
          background: `${T.bg}cc`, borderRadius: 3,
          textTransform: 'uppercase',
        }}>
          {isVideo ? `${item.duration || 'VID'}` : 'IMG'}
        </span>

        {/* Winner badge */}
        {isWinner && (
          <span style={{
            position: 'absolute', top: 6, right: 6,
            fontSize: 9, fontFamily: font.mono, fontWeight: 600,
            color: T.gold, padding: '2px 8px',
            background: `${T.bg}cc`, borderRadius: 3,
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            {IC.crown} WINNER
          </span>
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: '8px 10px' }}>
        <div style={{
          fontSize: 11, fontWeight: 600, color: T.text,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>{item.concept}</div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 4, marginTop: 4,
        }}>
          <ModelDot color={item.modelColor} size={6} />
          <span style={{
            fontSize: 9, fontFamily: font.mono, color: T.textMuted,
          }}>{item.creator} · {item.model}</span>
        </div>
      </div>
    </button>
  );
}
