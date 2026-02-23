import { font } from '../../design/tokens';
import { useTokens } from '../../hooks/useTokens';
import { IC } from '../../design/icons';
import { ModelDot } from '../../design/shared';

export default function MediaCard({ item, onClick }) {
  const t = useTokens();
  const isVideo = item.type === 'video';
  const isWinner = item.status === 'winner';
  const borderColor = isWinner ? t.gold : item.status === 'eliminated' ? t.magenta : t.cyan;

  return (
    <button onClick={onClick} style={{
      background: t.surface, border: 'none', borderRadius: 8,
      overflow: 'hidden', cursor: 'pointer', textAlign: 'left',
      borderLeft: `2px solid ${borderColor}`,
      transition: 'transform 0.15s',
    }}>
      {/* Media preview */}
      <div style={{
        aspectRatio: item.aspect || '4/5',
        background: t.surfaceRaised,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden',
      }} className={item.url ? undefined : 'gc-skeleton'}>
        {item.url ? (
          isVideo ? (
            <video src={item.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted />
          ) : (
            <img src={item.url} alt={item.concept} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
          )
        ) : (
          <span style={{ fontSize: 28, color: t.textMuted }}>
            {isVideo ? IC.play : IC.gallery}
          </span>
        )}

        {/* Type overlay */}
        <span style={{
          position: 'absolute', top: 6, left: 6,
          fontSize: 9, fontFamily: font.mono, fontWeight: 600,
          color: t.textMuted, padding: '2px 6px',
          background: `${t.bg}cc`, borderRadius: 3,
          textTransform: 'uppercase',
        }}>
          {isVideo ? `${item.duration || 'VID'}` : 'IMG'}
        </span>

        {/* Winner badge */}
        {isWinner && (
          <span style={{
            position: 'absolute', top: 6, right: 6,
            fontSize: 9, fontFamily: font.mono, fontWeight: 600,
            color: t.gold, padding: '2px 8px',
            background: `${t.bg}cc`, borderRadius: 3,
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            {IC.crown} WINNER
          </span>
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: '8px 10px' }}>
        <div style={{
          fontSize: 11, fontWeight: 600, color: t.text,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>{item.concept}</div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 4, marginTop: 4,
        }}>
          <ModelDot color={item.modelColor} size={6} />
          <span style={{
            fontSize: 9, fontFamily: font.mono, color: t.textMuted,
          }}>{item.creator} · {item.model}</span>
        </div>
      </div>
    </button>
  );
}
