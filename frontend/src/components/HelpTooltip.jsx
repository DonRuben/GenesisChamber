import { useState, useRef, useEffect } from 'react';
import { IconHelp } from './Icons';
import './HelpTooltip.css';

export default function HelpTooltip({ title, text, position = 'bottom', size = 16 }) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);
  const panelRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Adjust position if panel would clip viewport
  useEffect(() => {
    if (!isOpen || !panelRef.current) return;
    const rect = panelRef.current.getBoundingClientRect();
    if (rect.right > window.innerWidth) {
      panelRef.current.style.left = 'auto';
      panelRef.current.style.right = '0';
      panelRef.current.style.transform = 'none';
    }
    if (rect.left < 0) {
      panelRef.current.style.left = '0';
      panelRef.current.style.transform = 'none';
    }
  }, [isOpen]);

  return (
    <div className="help-tooltip-wrapper" ref={wrapperRef}>
      <button
        className="help-tooltip-trigger"
        onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
        aria-label={`Help: ${title || 'Information'}`}
        type="button"
      >
        <IconHelp size={size} />
      </button>
      {isOpen && (
        <div className={`help-tooltip-panel help-tooltip-${position}`} ref={panelRef}>
          {title && <div className="help-tooltip-title">{title}</div>}
          <div className="help-tooltip-text">{text}</div>
        </div>
      )}
    </div>
  );
}
