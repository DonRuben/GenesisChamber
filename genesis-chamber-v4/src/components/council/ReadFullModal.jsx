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

export default function ReadFullModal({ title, subtitle, text, accentColor, annotations, onClose }) {
  const t = useTokens();
  const contentRef = useRef(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const wordCount = text ? text.split(/\s+/).filter(Boolean).length : 0;

  const handleCopy = () => {
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMD = () => {
    const blob = new Blob([text], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(title || 'response').replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadPDF = () => {
    const html = contentRef.current?.innerHTML || `<pre>${text}</pre>`;
    const printWin = window.open('', '_blank');
    if (!printWin) return;
    printWin.document.write(
      `<!DOCTYPE html><html><head><title>${title || 'Response'}</title><style>` +
      `body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif;max-width:700px;margin:40px auto;padding:0 20px;line-height:1.6;color:#1a1a1a}` +
      `h1,h2,h3,h4{margin:1em 0 0.5em}` +
      `pre{background:#f5f5f5;padding:12px;border-radius:6px;overflow-x:auto;font-size:13px}` +
      `code{background:#f0f0f0;padding:2px 4px;border-radius:3px;font-size:13px}` +
      `pre code{background:none;padding:0}` +
      `table{border-collapse:collapse;width:100%;margin:1em 0}th,td{border:1px solid #ddd;padding:8px 12px;text-align:left}th{background:#f5f5f5}` +
      `blockquote{border-left:3px solid #ddd;margin:1em 0;padding:0.5em 1em;color:#555}` +
      `a{color:#0066cc}ul,ol{padding-left:1.5em}` +
      `@media print{body{margin:20px}}` +
      `</style></head><body>${html}</body></html>`
    );
    printWin.document.close();
    setTimeout(() => printWin.print(), 250);
  };

  const accent = accentColor || t.cyan;

  const btnStyle = {
    display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px',
    background: 'transparent', border: `1px solid ${t.border}`, borderRadius: 5,
    cursor: 'pointer', fontSize: 10, fontFamily: font.mono,
    color: t.textSoft, textTransform: 'uppercase', letterSpacing: '0.06em',
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
            background: t.surfaceRaised, border: 'none',
            color: t.textMuted, fontSize: 16, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          {'\u2715'}
        </button>

        {/* Header */}
        <div style={{ marginBottom: 16, paddingRight: 40, flexShrink: 0 }}>
          {subtitle && (
            <span style={{ fontSize: 9, fontFamily: font.mono, color: t.textMuted, display: 'block', marginBottom: 2 }}>
              {subtitle}
            </span>
          )}
          <div style={{ fontSize: 16, fontWeight: 600, color: t.text }}>
            {title}
          </div>
          <span style={{ fontSize: 10, fontFamily: font.mono, color: t.textMuted, marginTop: 4, display: 'block' }}>
            {wordCount.toLocaleString()} words
          </span>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: t.surfaceRaised, marginBottom: 16, flexShrink: 0 }} />

        {/* Body — scrollable */}
        <div
          ref={contentRef}
          className="gc-scrollbar"
          style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}
        >
          <Markdown>{text}</Markdown>
        </div>

        {/* Sources */}
        {annotations && annotations.length > 0 && (
          <div style={{
            marginTop: 12, padding: '10px 14px', background: t.surfaceRaised,
            borderRadius: 6, borderLeft: `2px solid ${t.cyan}`, flexShrink: 0,
          }}>
            <span style={{
              fontSize: 9, fontFamily: font.mono, color: t.cyan,
              textTransform: 'uppercase', letterSpacing: '0.12em',
            }}>SOURCES</span>
            <ul style={{ margin: '6px 0 0', paddingLeft: 16, listStyle: 'disc' }}>
              {annotations.map((a, i) => (
                <li key={i} style={{ fontSize: 11, marginBottom: 3 }}>
                  <a
                    href={a.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: t.cyan, textDecoration: 'none' }}
                  >
                    {a.title || a.url}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Divider */}
        <div style={{ height: 1, background: t.surfaceRaised, margin: '16px 0 12px', flexShrink: 0 }} />

        {/* Footer — export buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, flexWrap: 'wrap' }}>
          <button onClick={handleCopy} style={{ ...btnStyle, color: copied ? t.green : t.textSoft }}>
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
