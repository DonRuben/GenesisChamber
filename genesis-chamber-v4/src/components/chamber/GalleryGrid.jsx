import { T } from '../../design/tokens';
import MediaCard from './MediaCard';

export default function GalleryGrid({ media, onItemClick }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
      gap: 13,
      animation: 'fadeSlideUp 0.3s ease-out',
    }}>
      {media.map((item) => (
        <MediaCard key={item.id} item={item} onClick={() => onItemClick(item)} />
      ))}
      {media.length === 0 && (
        <div style={{
          gridColumn: '1 / -1', textAlign: 'center', padding: 48,
          color: T.textMuted, fontSize: 13,
        }}>No media matching filters</div>
      )}
    </div>
  );
}
