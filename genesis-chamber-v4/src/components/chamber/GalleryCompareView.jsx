import { T, font } from '../../design/tokens';
import { IC } from '../../design/icons';
import { Btn, MonoLabel, ModelDot } from '../../design/shared';
import { useChamberStore } from '../../stores/chamberStore';

export default function GalleryCompareView({ media }) {
  const {
    compareLeft, compareRight, compareSide,
    setCompareLeft, setCompareRight, setCompareSide, clearCompare,
  } = useChamberStore();

  const handleCardClick = (item) => {
    if (compareSide === 'left') { setCompareLeft(item); setCompareSide(null); }
    else if (compareSide === 'right') { setCompareRight(item); setCompareSide(null); }
  };

  const renderPanel = (item, side) => {
    if (!item) {
      return (
        <button
          onClick={() => setCompareSide(side)}
          style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 8,
            minHeight: 300, borderRadius: 8, cursor: 'pointer',
            background: 'transparent', border: `2px dashed ${T.border}`,
          }}
        >
          <span style={{ fontSize: 28, color: T.textMuted }}>{IC.plus}</span>
          <span style={{
            fontSize: 11, fontFamily: font.mono, color: T.textMuted,
            textTransform: 'uppercase', letterSpacing: '0.08em',
          }}>Choose {side === 'left' ? 'Left' : 'Right'}</span>
        </button>
      );
    }

    return (
      <div style={{
        flex: 1, borderRadius: 8, overflow: 'hidden',
        background: T.surface, border: `1px solid ${T.border}`,
      }}>
        {/* Preview */}
        <div style={{
          aspectRatio: '1/1', background: T.surfaceRaised,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontSize: 32, color: T.textMuted }}>
            {item.type === 'video' ? IC.play : IC.gallery}
          </span>
        </div>
        {/* Metadata */}
        <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{item.concept}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <ModelDot color={item.modelColor} size={6} />
            <span style={{ fontSize: 10, fontFamily: font.mono, color: T.textMuted }}>{item.model}</span>
          </div>
          <p style={{
            fontSize: 10, fontFamily: font.mono, color: T.textMuted,
            margin: 0, lineHeight: 1.5, maxHeight: 60, overflow: 'auto',
          }}>{item.prompt}</p>
          <Btn color={T.magenta} secondary onClick={() => {
            if (side === 'left') setCompareLeft(null);
            else setCompareRight(null);
          }}>
            {IC.x} Clear
          </Btn>
        </div>
      </div>
    );
  };

  return (
    <div style={{ animation: 'fadeSlideUp 0.3s ease-out' }}>
      {/* Instruction banner */}
      {compareSide && (
        <div style={{
          padding: '8px 14px', marginBottom: 12, borderRadius: 6,
          background: `${T.cyan}0d`, border: `1px solid ${T.cyan}33`,
          fontSize: 11, fontFamily: font.mono, color: T.cyan,
          textAlign: 'center',
        }}>
          Click a card below to place it on the {compareSide} side
        </div>
      )}

      {/* Panels */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
        {renderPanel(compareLeft, 'left')}
        {renderPanel(compareRight, 'right')}
      </div>

      {(compareLeft || compareRight) && (
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <Btn color={T.textMuted} secondary onClick={clearCompare}>Clear Both</Btn>
        </div>
      )}

      {/* Selectable grid */}
      <MonoLabel>Available Media</MonoLabel>
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
        gap: 8,
      }}>
        {media.map((item) => {
          const selected = item.id === compareLeft?.id || item.id === compareRight?.id;
          return (
            <button
              key={item.id}
              onClick={() => handleCardClick(item)}
              disabled={!compareSide}
              style={{
                background: T.surfaceRaised, border: selected ? `2px solid ${T.cyan}` : `1px solid ${T.border}`,
                borderRadius: 6, padding: 0, cursor: compareSide ? 'pointer' : 'default',
                opacity: selected ? 0.5 : compareSide ? 1 : 0.7,
                textAlign: 'left', overflow: 'hidden',
              }}
            >
              <div style={{
                aspectRatio: '1/1', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontSize: 18, color: T.textMuted }}>
                  {item.type === 'video' ? IC.play : IC.gallery}
                </span>
              </div>
              <div style={{
                padding: '4px 6px', fontSize: 9, fontFamily: font.mono,
                color: T.textMuted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>{item.concept}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
