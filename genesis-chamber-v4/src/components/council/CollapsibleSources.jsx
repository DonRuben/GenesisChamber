// ─────────────────────────────────────────────────────────
// GENESIS CHAMBER V4 — COLLAPSIBLE SOURCES
// Reusable source/citation display with expand/collapse
// Used by: ArtifactPanel, OutputCard, SynthesisPanel
// ─────────────────────────────────────────────────────────

import { useState } from 'react';
import { font } from '../../design/tokens';
import { IC } from '../../design/icons';
import { useTokens } from '../../hooks/useTokens';
import { PrismIcon } from './CouncilIcons';

function getDomain(url) {
  try { return new URL(url).hostname.replace('www.', ''); }
  catch { return url; }
}

export default function CollapsibleSources({
  sources = [],
  defaultExpanded = false,
  columns = 2,
  maxHeight = 200,
  accentColor = null,
}) {
  const t = useTokens();
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const color = accentColor || t.councilGold;

  if (!sources || sources.length === 0) return null;

  return (
    <div style={{ marginTop: 12 }}>
      {/* Trigger row */}
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6, width: '100%',
          background: 'transparent', border: 'none', cursor: 'pointer',
          padding: '6px 0',
        }}
      >
        <span style={{ color, lineHeight: 1, display: 'flex' }}>
          <PrismIcon size={12} />
        </span>
        <span style={{
          fontSize: 9, fontFamily: font.mono, fontWeight: 600,
          color, textTransform: 'uppercase', letterSpacing: '0.12em',
        }}>
          Sources
        </span>
        <span style={{
          fontSize: 8, fontFamily: font.mono, fontWeight: 700,
          color: t.bg, background: color,
          padding: '1px 5px', borderRadius: 3, minWidth: 16, textAlign: 'center',
        }}>
          {sources.length}
        </span>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 10, color: t.textMuted }}>
          {expanded ? IC.chevUp : IC.chevDown}
        </span>
      </button>

      {/* Expandable content */}
      {expanded && (
        <div style={{
          maxHeight, overflowY: 'auto',
          display: 'grid',
          gridTemplateColumns: columns === 2 ? '1fr 1fr' : '1fr',
          gap: 6, padding: '8px 0',
        }}>
          {sources.map((src, i) => {
            const domain = src.domain || getDomain(src.url);
            const isHovered = hoveredIdx === i;
            return (
              <a
                key={i}
                href={src.url}
                target="_blank"
                rel="noopener noreferrer"
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '6px 10px', borderRadius: 6,
                  border: `1px solid ${isHovered ? `${color}33` : t.border}`,
                  background: isHovered ? `${color}1f` : 'transparent',
                  textDecoration: 'none',
                  transition: 'all 0.15s',
                }}
              >
                <span style={{
                  fontSize: 8, fontFamily: font.mono, color: t.textMuted,
                  minWidth: 14, textAlign: 'right',
                }}>
                  {i + 1}
                </span>
                <img
                  src={`https://www.google.com/s2/favicons?domain=${domain}&sz=16`}
                  alt=""
                  width={14} height={14}
                  style={{
                    borderRadius: 2, flexShrink: 0,
                    background: t.surfaceRaised,
                  }}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{
                    fontSize: 11, color: t.text,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {src.title && src.title !== src.url ? src.title : domain}
                  </div>
                  <div style={{
                    fontSize: 9, fontFamily: font.mono, color: t.textMuted,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {domain}
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
