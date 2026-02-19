import { useEffect, useRef } from 'react';
import { SOUL_BIOS } from '../data/soulBios';
import { IconClose } from './Icons';
import './SoulInfoCard.css';

const SECTIONS = [
  { key: 'biggestSuccess', label: 'Biggest Success' },
  { key: 'knownFor', label: 'Known For' },
  { key: 'process', label: 'How They Work' },
  { key: 'style', label: 'Their Style' },
  { key: 'whyInChamber', label: 'Why In The Chamber' },
];

export default function SoulInfoCard({ soul, onClose }) {
  const panelRef = useRef(null);
  const bio = SOUL_BIOS[soul?.id];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        onClose();
      }
    };
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  if (!soul || !bio) return null;

  return (
    <div className="soul-info-overlay">
      <div className="soul-info-card" ref={panelRef}>
        <button className="soul-info-close" onClick={onClose} type="button" aria-label="Close">
          <IconClose size={18} />
        </button>

        {/* Header */}
        <div className="soul-info-header">
          <div
            className="soul-info-avatar"
            style={{ borderColor: soul.color, background: soul.color }}
          >
            <span className="soul-info-initial">{(soul.name || '?')[0]}</span>
          </div>
          <div className="soul-info-name-block">
            <div className="soul-info-name">{soul.name}</div>
            <div className="soul-info-title">{bio.title}</div>
            <div className="soul-info-era">{bio.era}</div>
          </div>
        </div>

        {/* Bio Sections */}
        <div className="soul-info-body">
          {SECTIONS.map(({ key, label }) => (
            bio[key] && (
              <div key={key} className="soul-info-section">
                <div className="soul-info-label">{label}</div>
                <div className="soul-info-text">{bio[key]}</div>
              </div>
            )
          ))}
        </div>
      </div>
    </div>
  );
}
