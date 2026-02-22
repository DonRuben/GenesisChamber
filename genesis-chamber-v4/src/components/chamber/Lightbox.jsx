import { T, font, motion } from '../../design/tokens';
import { IC } from '../../design/icons';
import { Tag, ModelDot, Btn } from '../../design/shared';
import { useKeyboard } from '../../hooks/useKeyboard';
import { useChamberStore } from '../../stores/chamberStore';

export default function Lightbox() {
  const { lightboxItem, setLightboxItem, simulation } = useChamberStore();
  const media = simulation?.media || [];

  if (!lightboxItem) return null;

  const currentIndex = media.findIndex((m) => m.id === lightboxItem.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < media.length - 1;

  const goPrev = () => hasPrev && setLightboxItem(media[currentIndex - 1]);
  const goNext = () => hasNext && setLightboxItem(media[currentIndex + 1]);
  const close = () => setLightboxItem(null);

  useKeyboard({
    'Escape': close,
    'ArrowLeft': goPrev,
    'ArrowRight': goNext,
  });

  const item = lightboxItem;
  const isVideo = item.type === 'video';
  const borderColor = item.status === 'winner' ? T.gold : item.status === 'eliminated' ? T.magenta : T.cyan;

  return (
    <div
      onClick={close}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: `${T.bg}f0`, backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'fadeSlideUp 0.2s ease-out',
      }}
    >
      {/* Close button */}
      <button onClick={close} style={{
        position: 'absolute', top: 16, left: 16, zIndex: 10,
        background: T.surfaceRaised, border: `1px solid ${T.border}`,
        borderRadius: 6, padding: 8, cursor: 'pointer',
        fontSize: 16, color: T.textMuted,
      }}>{IC.x}</button>

      {/* Nav arrows */}
      {hasPrev && (
        <button onClick={(e) => { e.stopPropagation(); goPrev(); }} style={{
          position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
          width: 40, height: 40, borderRadius: 20, cursor: 'pointer',
          background: T.surfaceRaised, border: `1px solid ${T.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, color: T.textSoft, zIndex: 10,
        }}>{IC.arrowLeft}</button>
      )}
      {hasNext && (
        <button onClick={(e) => { e.stopPropagation(); goNext(); }} style={{
          position: 'absolute', right: 300, top: '50%', transform: 'translateY(-50%)',
          width: 40, height: 40, borderRadius: 20, cursor: 'pointer',
          background: T.surfaceRaised, border: `1px solid ${T.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, color: T.textSoft, zIndex: 10,
        }}>{IC.arrowRight}</button>
      )}

      {/* Main content area */}
      <div onClick={(e) => e.stopPropagation()} style={{
        display: 'flex', maxWidth: '90vw', maxHeight: '90vh',
        width: '100%', height: '100%',
      }}>
        {/* Center — media preview */}
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 40,
        }}>
          <div style={{
            maxWidth: 600, maxHeight: '80vh', aspectRatio: item.aspect || '4/5',
            background: T.surfaceRaised, borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '100%',
          }}>
            <span style={{ fontSize: 48, color: T.textMuted }}>
              {isVideo ? IC.play : IC.gallery}
            </span>
          </div>
        </div>

        {/* Right panel — metadata */}
        <div style={{
          width: 280, background: T.surface, borderLeft: `1px solid ${T.border}`,
          padding: 20, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 16,
        }}>
          {/* Counter */}
          <span style={{
            fontSize: 10, fontFamily: font.mono, color: T.textMuted,
          }}>{currentIndex + 1} / {media.length}</span>

          {/* Concept info */}
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: T.text, marginBottom: 4 }}>
              {item.concept}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <ModelDot color={item.modelColor} size={6} />
              <span style={{ fontSize: 10, fontFamily: font.mono, color: T.textMuted }}>
                {item.creator}
              </span>
            </div>
          </div>

          {/* Tags */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <Tag color={borderColor} label={item.status?.toUpperCase()} />
            <Tag color={T.textMuted} label={isVideo ? 'VIDEO' : 'IMAGE'} />
          </div>

          {/* Model */}
          <div>
            <span style={{
              fontSize: 9, fontFamily: font.mono, color: T.textMuted,
              textTransform: 'uppercase', letterSpacing: '0.08em',
            }}>Model</span>
            <div style={{ fontSize: 12, color: T.textSoft, marginTop: 2 }}>{item.model}</div>
          </div>

          {/* Score */}
          <div>
            <span style={{
              fontSize: 9, fontFamily: font.mono, color: T.textMuted,
              textTransform: 'uppercase', letterSpacing: '0.08em',
            }}>Score</span>
            <div style={{
              fontSize: 24, fontFamily: font.mono, fontWeight: 700, color: borderColor, marginTop: 2,
            }}>{item.score}</div>
          </div>

          {/* Prompt */}
          <div>
            <span style={{
              fontSize: 9, fontFamily: font.mono, color: T.textMuted,
              textTransform: 'uppercase', letterSpacing: '0.08em',
            }}>Prompt</span>
            <p style={{
              fontSize: 11, fontFamily: font.mono, color: T.textSoft,
              margin: '4px 0 0', lineHeight: 1.6, maxHeight: 200,
              overflow: 'auto',
            }}>{item.prompt}</p>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
            <Btn color={T.cyan} secondary style={{ flex: 1, justifyContent: 'center' }}>
              {IC.download} Save
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );
}
