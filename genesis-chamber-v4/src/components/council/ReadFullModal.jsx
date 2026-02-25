// ─────────────────────────────────────────────────────────
// GENESIS CHAMBER V4 — READ FULL MODAL
// Full response/synthesis viewer with export buttons
// Pattern: SoulInfoModal (backdrop + panel + Esc close)
// ─────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from 'react';
import { font } from '../../design/tokens';
import { IC } from '../../design/icons';
import { useTokens } from '../../hooks/useTokens';
import Markdown from '../../design/Markdown';

// Shared filename sanitizer — exported for full report use
export function sanitizeFilename(...parts) {
  return parts
    .filter(Boolean)
    .join('-')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

export function questionSlug(text, wordCount = 5) {
  if (!text) return '';
  return text.split(/\s+/).slice(0, wordCount).join(' ');
}

const PRINT_CSS =
  `body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif;max-width:700px;margin:40px auto;padding:0 20px;line-height:1.6;color:#1a1a1a}` +
  `h1,h2,h3,h4{margin:1em 0 0.5em}` +
  `pre{background:#f5f5f5;padding:12px;border-radius:6px;overflow-x:auto;font-size:13px}` +
  `code{background:#f0f0f0;padding:2px 4px;border-radius:3px;font-size:13px}` +
  `pre code{background:none;padding:0}` +
  `table{border-collapse:collapse;width:100%;margin:1em 0}th,td{border:1px solid #ddd;padding:8px 12px;text-align:left}th{background:#f5f5f5}` +
  `blockquote{border-left:3px solid #ddd;margin:1em 0;padding:0.5em 1em;color:#555}` +
  `a{color:#0066cc}ul,ol{padding-left:1.5em}` +
  `hr{border:none;border-top:1px solid #ddd;margin:2em 0}` +
  `@media print{body{margin:20px}}`;

function downloadBlob(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function openPrintWindow(title, html) {
  const printWin = window.open('', '_blank');
  if (!printWin) return;
  printWin.document.write(
    `<!DOCTYPE html><html><head><title>${title}</title>` +
    `<style>${PRINT_CSS}</style></head><body>${html}</body></html>`
  );
  printWin.document.close();
  setTimeout(() => printWin.print(), 250);
}

// Re-export helpers for full report
export { PRINT_CSS, downloadBlob, openPrintWindow };

// Dark-mode colors for modal markdown (always visible on #1A1A1E bg)
const MODAL_COLORS = {
  text: '#FFFFFF',
  textSoft: '#E9E7E4',
  textMuted: '#A1A1AA',
  cyan: '#00D9FF',
  gold: '#D4A853',
  surfaceRaised: 'rgba(255,255,255,0.06)',
  border: 'rgba(255,255,255,0.08)',
};

export default function ReadFullModal({ title, subtitle, text, accentColor, annotations, images, filename, onClose }) {
  const t = useTokens();
  const contentRef = useRef(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const wordCount = text ? text.split(/\s+/).filter(Boolean).length : 0;
  const baseName = filename || sanitizeFilename(title || 'response');

  const handleCopy = () => {
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMD = () => {
    downloadBlob(text, `${baseName}.md`, 'text/markdown');
  };

  const handleDownloadPDF = () => {
    const html = contentRef.current?.innerHTML || `<pre>${text}</pre>`;
    openPrintWindow(title || 'Response', html);
  };

  const accent = accentColor || t.cyan;

  const btnStyle = {
    display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px',
    background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 5,
    cursor: 'pointer', fontSize: 10, fontFamily: font.mono,
    color: '#E9E7E4', textTransform: 'uppercase', letterSpacing: '0.06em',
    transition: 'color 0.15s',
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(10,10,12,0.7)',
        backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#1A1A1E',
          borderRadius: 16, maxWidth: 720, width: '95%',
          padding: 32, position: 'relative',
          borderLeft: `3px solid ${accent}`,
          maxHeight: '85vh', display: 'flex', flexDirection: 'column',
          animation: 'fadeSlideUp 0.25s ease-out',
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 16, right: 16,
            width: 32, height: 32, borderRadius: 16,
            background: 'rgba(255,255,255,0.06)', border: 'none',
            color: '#A1A1AA', fontSize: 16, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          {'\u2715'}
        </button>

        {/* Header */}
        <div style={{ marginBottom: 16, paddingRight: 40, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <div>
              {subtitle && (
                <span style={{
                  fontSize: 9, fontFamily: font.mono, color: '#A1A1AA',
                  display: 'inline-block', padding: '2px 6px', marginBottom: 4,
                  background: 'rgba(255,255,255,0.06)', borderRadius: 3,
                  textTransform: 'uppercase', letterSpacing: '0.08em',
                }}>
                  {subtitle}
                </span>
              )}
              <div style={{ fontSize: 18, fontWeight: 700, color: '#FFFFFF' }}>
                {title}
              </div>
            </div>
            <span style={{ fontSize: 10, fontFamily: font.mono, color: '#A1A1AA', whiteSpace: 'nowrap' }}>
              {wordCount.toLocaleString()} words
            </span>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 16, flexShrink: 0 }} />

        {/* Body — scrollable */}
        <div
          ref={contentRef}
          className="gc-scrollbar"
          style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}
        >
          <Markdown colors={MODAL_COLORS}>{text}</Markdown>
        </div>

        {/* Generated images */}
        {images && images.length > 0 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12, flexShrink: 0 }}>
            {images.map((img, i) => (
              <img
                key={i}
                src={typeof img === 'string' ? img : img.url || img.data}
                alt={`Generated ${i + 1}`}
                style={{
                  maxWidth: '100%', maxHeight: 400, borderRadius: 8,
                  objectFit: 'contain', border: '1px solid rgba(255,255,255,0.08)',
                }}
              />
            ))}
          </div>
        )}

        {/* Sources — deduplicated */}
        {(() => {
          const deduped = annotations
            ? [...new Map(annotations.map(a => [a.url, a])).values()]
                .map(a => ({ ...a, title: (a.title && a.title !== a.url) ? a.title : null }))
            : [];
          const shown = deduped.slice(0, 15);
          const extra = Math.max(0, deduped.length - 15);
          if (!shown.length) return null;
          return (
            <div style={{
              marginTop: 12, padding: '10px 14px', background: 'rgba(255,255,255,0.04)',
              borderRadius: 6, borderLeft: '2px solid #00D9FF', flexShrink: 0,
            }}>
              <span style={{
                fontSize: 9, fontFamily: font.mono, color: '#00D9FF',
                textTransform: 'uppercase', letterSpacing: '0.12em',
              }}>SOURCES</span>
              <ul style={{ margin: '6px 0 0', paddingLeft: 16, listStyle: 'disc' }}>
                {shown.map((a, i) => (
                  <li key={i} style={{ fontSize: 11, marginBottom: 3 }}>
                    <a
                      href={a.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#00D9FF', textDecoration: 'none' }}
                    >
                      {a.title || a.url}
                    </a>
                  </li>
                ))}
                {extra > 0 && (
                  <li style={{ fontSize: 11, color: '#A1A1AA', fontStyle: 'italic' }}>
                    and {extra} more sources
                  </li>
                )}
              </ul>
            </div>
          );
        })()}

        {/* Divider */}
        <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '16px 0 12px', flexShrink: 0 }} />

        {/* Footer — export buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, flexWrap: 'wrap' }}>
          <button onClick={handleCopy} style={{ ...btnStyle, color: copied ? '#34D399' : '#E9E7E4' }}>
            <span style={{ fontSize: 12 }}>{copied ? IC.check : IC.copy}</span>
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button onClick={handleDownloadMD} style={btnStyle}>
            <span style={{ fontSize: 12 }}>{IC.download}</span>
            MD
          </button>
          <button onClick={handleDownloadPDF} style={btnStyle}>
            <span style={{ fontSize: 12 }}>{IC.fileText}</span>
            PDF
          </button>
        </div>
      </div>
    </div>
  );
}
