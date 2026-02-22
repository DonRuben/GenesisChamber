import { useNavigate, useParams } from 'react-router-dom';
import { font } from '../../design/tokens';
import { useTokens } from '../../hooks/useTokens';
import { IC } from '../../design/icons';

export default function MediaPreview({ media }) {
  const t = useTokens();
  const navigate = useNavigate();
  const { id } = useParams();
  const items = (media || []).slice(0, 3);

  return (
    <div>
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10,
      }}>
        {items.map((m) => (
          <div key={m.id} style={{
            aspectRatio: '4/5', borderRadius: 8,
            background: t.surfaceRaised, border: `1px solid ${t.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative', overflow: 'hidden',
          }}>
            <span style={{ fontSize: 24, color: t.textMuted }}>
              {m.type === 'video' ? IC.play : IC.gallery}
            </span>
            <span style={{
              position: 'absolute', bottom: 8, left: 8,
              fontSize: 9, fontFamily: font.mono, color: t.textMuted,
              padding: '2px 6px', background: `${t.bg}cc`, borderRadius: 3,
              textTransform: 'uppercase',
            }}>
              {m.type === 'video' ? `${IC.play} ${m.duration || ''}` : 'IMG'}
            </span>
            {m.status === 'winner' && (
              <span style={{
                position: 'absolute', top: 6, right: 6,
                fontSize: 9, fontFamily: font.mono, fontWeight: 600,
                color: t.gold, padding: '2px 6px',
                background: `${t.bg}cc`, borderRadius: 3,
              }}>{IC.crown}</span>
            )}
          </div>
        ))}
      </div>
      <button
        onClick={() => navigate(`/sim/${id}/gallery`)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          margin: '10px 0 0', padding: 0,
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: 11, fontFamily: font.mono, color: t.cyan,
          fontWeight: 600, letterSpacing: '0.04em',
        }}
      >
        View All {IC.arrowRight}
      </button>
    </div>
  );
}
