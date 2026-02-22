import { font } from '../../design/tokens';
import { useTokens } from '../../hooks/useTokens';
import { IC } from '../../design/icons';
import { MonoLabel, Btn, Tag } from '../../design/shared';
import { useChamberStore } from '../../stores/chamberStore';
import GalleryGrid from './GalleryGrid';
import GalleryConceptView from './GalleryConceptView';
import GalleryCompareView from './GalleryCompareView';
import Lightbox from './Lightbox';

const viewIcons = { grid: IC.grid, concept: IC.layers, compare: IC.columns };

export default function Gallery() {
  const t = useTokens();
  const {
    simulation, galleryView, galleryFilter, gallerySearch,
    setGalleryView, setGalleryFilter, setGallerySearch,
    setLightboxItem, getFilteredMedia,
  } = useChamberStore();

  const media = getFilteredMedia();
  const allMedia = simulation?.media || [];
  const imageCount = allMedia.filter((m) => m.type === 'image').length;
  const videoCount = allMedia.filter((m) => m.type === 'video').length;

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'images', label: 'Images' },
    { key: 'videos', label: 'Videos' },
  ];

  const views = [
    { key: 'grid', label: 'Grid' },
    { key: 'concept', label: 'Concept' },
    { key: 'compare', label: 'Compare' },
  ];

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      padding: '16px 20px', overflow: 'auto',
      animation: 'fadeSlideUp 0.3s ease-out',
    }}>
      {/* Top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
        marginBottom: 20, paddingBottom: 12, borderBottom: `1px solid ${t.border}`,
      }}>
        <MonoLabel icon={IC.gallery} style={{ marginBottom: 0, flex: '0 0 auto' }}>Gallery</MonoLabel>

        {/* Counts */}
        <Tag color={t.cyan} label={`${imageCount} images`} />
        <Tag color={t.flame} label={`${videoCount} videos`} />

        <div style={{ flex: 1 }} />

        {/* Search */}
        <input
          value={gallerySearch}
          onChange={(e) => setGallerySearch(e.target.value)}
          placeholder="Search..."
          style={{
            width: 160, padding: '6px 10px', borderRadius: 6,
            background: t.surfaceRaised, border: `1px solid ${t.border}`,
            color: t.text, fontSize: 11, fontFamily: font.mono,
            outline: 'none',
          }}
        />

        {/* Filter buttons */}
        <div style={{ display: 'flex', gap: 2 }}>
          {filters.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setGalleryFilter(key)}
              style={{
                padding: '5px 10px', borderRadius: 4, cursor: 'pointer',
                background: galleryFilter === key ? `${t.cyan}1a` : 'transparent',
                border: galleryFilter === key ? `1px solid ${t.cyan}33` : `1px solid ${t.border}`,
                fontSize: 9, fontFamily: font.mono, fontWeight: 600,
                color: galleryFilter === key ? t.cyan : t.textMuted,
                textTransform: 'uppercase', letterSpacing: '0.06em',
              }}
            >{label}</button>
          ))}
        </div>

        {/* View toggle */}
        <div style={{ display: 'flex', gap: 2 }}>
          {views.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setGalleryView(key)}
              style={{
                padding: '5px 8px', borderRadius: 4, cursor: 'pointer',
                background: galleryView === key ? `${t.flame}1a` : 'transparent',
                border: galleryView === key ? `1px solid ${t.flame}33` : `1px solid ${t.border}`,
                fontSize: 13, color: galleryView === key ? t.flame : t.textMuted,
                display: 'flex', alignItems: 'center',
              }}
              title={label}
            >{viewIcons[key]}</button>
          ))}
        </div>

        {/* Download */}
        <Btn color={t.gold} secondary>
          {IC.download} ZIP
        </Btn>
      </div>

      {/* Content */}
      {galleryView === 'grid' && (
        <GalleryGrid media={media} onItemClick={setLightboxItem} />
      )}
      {galleryView === 'concept' && (
        <GalleryConceptView media={media} onItemClick={setLightboxItem} />
      )}
      {galleryView === 'compare' && (
        <GalleryCompareView media={media} />
      )}

      {/* Lightbox */}
      <Lightbox />
    </div>
  );
}
