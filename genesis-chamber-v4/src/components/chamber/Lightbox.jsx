import { useRef } from 'react';
import { font } from '../../design/tokens';
import { useTokens } from '../../hooks/useTokens';
import { IC } from '../../design/icons';
import { Tag, ModelDot, Btn } from '../../design/shared';
import { useKeyboard } from '../../hooks/useKeyboard';
import { useChamberStore } from '../../stores/chamberStore';
import { useIsMobile } from '../../hooks/useMediaQuery';
import { useSwipe } from '../../hooks/useSwipe';

export default function Lightbox() {
  const t = useTokens();
  const mobile = useIsMobile();
  const lightboxRef = useRef(null);
  const { lightboxItem, setLightboxItem, simulation } = useChamberStore();
  const media = simulation?.media || [];

  const currentIndex = lightboxItem ? media.findIndex((m) => m.id === lightboxItem.id) : -1;
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < media.length - 1;

  const close = () => setLightboxItem(null);
  const goPrev = () => hasPrev && setLightboxItem(media[currentIndex - 1]);
  const goNext = () => hasNext && setLightboxItem(media[currentIndex + 1]);

  useKeyboard({
    'Escape': close,
    'ArrowLeft': goPrev,
    'ArrowRight': goNext,
  });

  useSwipe(lightboxRef, { onSwipeLeft: goNext, onSwipeRight: goPrev, onSwipeDown: close });

  if (!lightboxItem) return null;

  const item = lightboxItem;
  const isVideo = item.type === 'video';
  const borderColor = item.status === 'winner' ? t.gold : item.status === 'eliminated' ? t.magenta : t.cyan;

  return (
    <div
      ref={lightboxRef}
      onClick={close}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: `${t.bg}f0`, backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      {/* Close button */}
      <button onClick={close} style={{
        position: 'absolute', top: 16, left: 16, zIndex: 10,
        background: t.surfaceRaised, border: `1px solid ${t.border}`,
        borderRadius: 6, padding: 8, cursor: 'pointer',
        fontSize: 16, color: t.textMuted,
        minHeight: mobile ? 44 : undefined, minWidth: mobile ? 44 : undefined,
      }}>{IC.x}</button>

      {/* Nav arrows */}
      {hasPrev && (
        <button onClick={(e) => { e.stopPropagation(); goPrev(); }} style={{
          position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
          width: 40, height: 40, borderRadius: 20, cursor: 'pointer',
          background: t.surfaceRaised, border: `1px solid ${t.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, color: t.textSoft, zIndex: 10,
          minHeight: mobile ? 44 : undefined, minWidth: mobile ? 44 : undefined,
        }}>{IC.arrowLeft}</button>
      )}
      {hasNext && (
        <button onClick={(e) => { e.stopPropagation(); goNext(); }} style={{
          position: 'absolute', right: mobile ? 16 : 300, top: '50%', transform: 'translateY(-50%)',
          width: 40, height: 40, borderRadius: 20, cursor: 'pointer',
          background: t.surfaceRaised, border: `1px solid ${t.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, color: t.textSoft, zIndex: 10,
          minHeight: mobile ? 44 : undefined, minWidth: mobile ? 44 : undefined,
        }}>{IC.arrowRight}</button>
      )}

      {/* Main content area */}
      <div onClick={(e) => e.stopPropagation()} className="gc-scale-in" style={{
        display: 'flex', maxWidth: '90vw', maxHeight: '90vh',
        width: '100%', height: '100%',
      }}>
        {/* Center — media preview */}
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 40,
        }}>
          {item.url ? (
            isVideo ? (
              <video
                src={item.url} controls autoPlay
                style={{ maxWidth: 600, maxHeight: '80vh', borderRadius: 8, width: '100%' }}
              />
            ) : (
              <img
                src={item.url} alt={item.concept}
                style={{ maxWidth: 600, maxHeight: '80vh', borderRadius: 8, width: '100%', objectFit: 'contain' }}
              />
            )
          ) : (
            <div style={{
              maxWidth: 600, maxHeight: '80vh', aspectRatio: item.aspect || '4/5',
              background: t.surfaceRaised, borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '100%',
            }}>
              <span style={{ fontSize: 48, color: t.textMuted }}>
                {isVideo ? IC.play : IC.gallery}
              </span>
            </div>
          )}
        </div>

        {/* Right panel — metadata */}
        {!mobile && <div style={{
          width: 280, background: t.surface, borderLeft: `1px solid ${t.border}`,
          padding: 20, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 16,
        }}>
          {/* Counter */}
          <span style={{
            fontSize: 10, fontFamily: font.mono, color: t.textMuted,
          }}>{currentIndex + 1} / {media.length}</span>

          {/* Concept info */}
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: t.text, marginBottom: 4 }}>
              {item.concept}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <ModelDot color={item.modelColor} size={6} />
              <span style={{ fontSize: 10, fontFamily: font.mono, color: t.textMuted }}>
                {item.creator}
              </span>
            </div>
          </div>

          {/* Tags */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <Tag color={borderColor} label={item.status?.toUpperCase()} />
            <Tag color={t.textMuted} label={isVideo ? 'VIDEO' : 'IMAGE'} />
          </div>

          {/* Model */}
          <div>
            <span style={{
              fontSize: 9, fontFamily: font.mono, color: t.textMuted,
              textTransform: 'uppercase', letterSpacing: '0.08em',
            }}>Model</span>
            <div style={{ fontSize: 12, color: t.textSoft, marginTop: 2 }}>{item.model}</div>
          </div>

          {/* Score */}
          <div>
            <span style={{
              fontSize: 9, fontFamily: font.mono, color: t.textMuted,
              textTransform: 'uppercase', letterSpacing: '0.08em',
            }}>Score</span>
            <div style={{
              fontSize: 24, fontFamily: font.mono, fontWeight: 700, color: borderColor, marginTop: 2,
            }}>{item.score}</div>
          </div>

          {/* Prompt */}
          <div>
            <span style={{
              fontSize: 9, fontFamily: font.mono, color: t.textMuted,
              textTransform: 'uppercase', letterSpacing: '0.08em',
            }}>Prompt</span>
            <p style={{
              fontSize: 11, fontFamily: font.mono, color: t.textSoft,
              margin: '4px 0 0', lineHeight: 1.6, maxHeight: 200,
              overflow: 'auto',
            }}>{item.prompt}</p>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
            <Btn color={t.cyan} secondary style={{ flex: 1, justifyContent: 'center' }}>
              {IC.download} Save
            </Btn>
          </div>
        </div>}
      </div>
    </div>
  );
}
