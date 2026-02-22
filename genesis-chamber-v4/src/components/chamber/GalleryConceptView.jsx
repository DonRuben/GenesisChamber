import { useState } from 'react';
import { font, motion } from '../../design/tokens';
import { useTokens } from '../../hooks/useTokens';
import { IC } from '../../design/icons';
import MediaCard from './MediaCard';

export default function GalleryConceptView({ media, onItemClick }) {
  const t = useTokens();
  const [collapsed, setCollapsed] = useState({});

  // Group by concept
  const groups = {};
  media.forEach((m) => {
    const key = m.concept || 'Unknown';
    if (!groups[key]) groups[key] = { items: [], status: m.status, score: m.score, creator: m.creator };
    groups[key].items.push(m);
  });

  const sorted = Object.entries(groups).sort((a, b) => {
    const order = { winner: 0, surviving: 1, eliminated: 2 };
    return (order[a[1].status] || 3) - (order[b[1].status] || 3);
  });

  const toggleCollapse = (key) => setCollapsed((p) => ({ ...p, [key]: !p[key] }));
  const rankMap = { winner: 1, surviving: 2, eliminated: 3 };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, animation: 'fadeSlideUp 0.3s ease-out' }}>
      {sorted.map(([concept, group], i) => {
        const isCollapsed = collapsed[concept];
        const isEliminated = group.status === 'eliminated';
        const borderColor = group.status === 'winner' ? t.gold : isEliminated ? t.magenta : t.cyan;

        return (
          <div key={concept} style={{
            borderLeft: `2px solid ${borderColor}`, borderRadius: 8,
            background: t.surface, overflow: 'hidden',
            opacity: isEliminated ? 0.6 : 1,
          }}>
            <button
              onClick={() => toggleCollapse(concept)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                width: '100%', padding: '12px 16px', cursor: 'pointer',
                background: 'none', border: 'none', textAlign: 'left',
              }}
            >
              <span style={{
                fontSize: 9, fontFamily: font.mono, fontWeight: 700,
                color: borderColor,
              }}>#{rankMap[group.status] || i + 1}</span>
              <span style={{
                fontSize: 13, fontWeight: 600, color: t.text, flex: 1,
                textDecoration: isEliminated ? 'line-through' : 'none',
              }}>{concept}</span>
              <span style={{
                fontSize: 9, fontFamily: font.mono, color: t.textMuted,
              }}>{group.creator}</span>
              <span style={{
                fontSize: 14, fontFamily: font.mono, fontWeight: 700,
                color: borderColor,
              }}>{group.score}</span>
              <span style={{
                fontSize: 9, fontFamily: font.mono, color: t.textMuted,
                padding: '2px 6px', background: t.surfaceRaised, borderRadius: 3,
              }}>{group.items.length} media</span>
              <span style={{
                fontSize: 14, color: t.textMuted,
                transform: isCollapsed ? 'rotate(0)' : 'rotate(180deg)',
                transition: `transform ${motion.duration.fast}`,
              }}>{IC.chevDown}</span>
            </button>
            {!isCollapsed && (
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                gap: 10, padding: '0 12px 12px',
              }}>
                {group.items.map((item) => (
                  <MediaCard key={item.id} item={item} onClick={() => onItemClick(item)} />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
