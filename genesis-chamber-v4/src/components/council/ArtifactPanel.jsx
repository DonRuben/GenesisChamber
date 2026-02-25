// ─────────────────────────────────────────────────────────
// GENESIS CHAMBER V4 — ARTIFACT PANEL
// Claude.ai-style slide-out panel for full response viewing
// Includes: SourceBottomBar (B) + SourcePreviewSidebar (C)
// CSS classes: .artifact-backdrop (index.css)
// Keyframes: artifactSlideIn, artifactFadeIn (gc-motion.css)
// ─────────────────────────────────────────────────────────

import { useState, useEffect, useCallback, useRef } from 'react';
import { font } from '../../design/tokens';
import { IC } from '../../design/icons';
import { useTokens } from '../../hooks/useTokens';
import Markdown from '../../design/Markdown';
import CollapsibleSources from './CollapsibleSources';
import { downloadBlob } from './ReadFullModal';
import { exportToPDF } from '../../utils/exportPDF';
import { CanvasIcon } from './CouncilIcons';

function isHTMLContent(text) {
  if (!text || typeof text !== 'string') return false;
  const t = text.trim();
  return t.startsWith('<') && (t.includes('<div') || t.includes('<style') || t.includes('<table'));
}

function getDomain(url) {
  try { return new URL(url).hostname.replace('www.', ''); }
  catch { return url; }
}

// ── Source Bottom Bar (Component B) ──
function SourceBottomBar({ sources, onSourceClick, t }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);
  if (!sources || sources.length === 0) return null;

  return (
    <div style={{
      height: 42, display: 'flex', alignItems: 'center', gap: 8,
      padding: '0 20px', flexShrink: 0,
      background: t.bg, borderTop: `1px solid ${t.border}`,
      overflowX: 'auto',
    }}>
      <span style={{
        fontSize: 8, fontFamily: font.mono, fontWeight: 600,
        color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.12em',
        flexShrink: 0,
      }}>
        SOURCES ({sources.length})
      </span>
      {sources.map((src, i) => {
        const domain = src.domain || getDomain(src.url);
        const isHovered = hoveredIdx === i;
        return (
          <button
            key={i}
            onClick={() => onSourceClick(i)}
            onMouseEnter={() => setHoveredIdx(i)}
            onMouseLeave={() => setHoveredIdx(null)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '4px 10px', borderRadius: 5, flexShrink: 0,
              border: `1px solid ${t.border}`,
              background: isHovered ? `${t.councilGold}1f` : 'transparent',
              cursor: 'pointer', transition: 'all 0.15s',
            }}
          >
            <img
              src={`https://www.google.com/s2/favicons?domain=${domain}&sz=16`}
              alt="" width={12} height={12}
              style={{ borderRadius: 2, background: t.surfaceRaised }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <span style={{
              fontSize: 10, fontFamily: font.mono, color: t.textSoft,
              maxWidth: 120, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {domain}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ── Source Preview Sidebar (Component C) ──
function SourcePreviewSidebar({ sources, activeIndex, onClose, onNavigate, t }) {
  const isOpen = activeIndex !== null;
  const src = isOpen ? sources[activeIndex] : null;

  return (
    <div style={{
      width: isOpen ? 280 : 0, flexShrink: 0,
      transition: 'width 0.25s ease-out', overflow: 'hidden',
      borderLeft: isOpen ? `1px solid ${t.borderHover}` : 'none',
      background: t.bg,
    }}>
      {src && (
        <div style={{ width: 280, height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 16px', borderBottom: `1px solid ${t.border}`,
          }}>
            <span style={{
              fontSize: 9, fontFamily: font.mono, fontWeight: 600,
              color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.12em',
            }}>
              Source Preview
            </span>
            <button
              onClick={onClose}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: t.textMuted, fontSize: 14,
              }}
            >
              {IC.close}
            </button>
          </div>

          {/* Content */}
          <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
            <div style={{
              fontFamily: font.display, fontSize: 15, fontWeight: 600,
              color: t.text, lineHeight: 1.4, marginBottom: 8,
            }}>
              {src.title || 'Untitled Source'}
            </div>
            <a
              href={src.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'block', fontFamily: font.mono, fontSize: 10,
                color: t.cyan, textDecoration: 'none', marginBottom: 12,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}
            >
              {src.url}
            </a>
            {src.excerpt && (
              <div style={{
                padding: 12, borderRadius: 6,
                background: t.surfaceRaised, border: `1px solid ${t.border}`,
                fontSize: 11, color: t.textMuted, lineHeight: 1.6,
              }}>
                {src.excerpt}
              </div>
            )}
            <a
              href={src.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                marginTop: 12, padding: '6px 12px', borderRadius: 5,
                border: `1px solid ${t.councilGold}33`,
                background: `${t.councilGold}0d`,
                color: t.councilGold, fontSize: 10, fontFamily: font.mono,
                fontWeight: 600, textDecoration: 'none',
                textTransform: 'uppercase', letterSpacing: '0.06em',
              }}
            >
              <span style={{ fontSize: 12 }}>{IC.exportArrow}</span>
              Open Source
            </a>
          </div>

          {/* Footer nav */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '10px 16px', borderTop: `1px solid ${t.border}`,
          }}>
            <button
              onClick={() => onNavigate(activeIndex - 1)}
              disabled={activeIndex <= 0}
              style={{
                background: 'none', border: 'none', cursor: activeIndex > 0 ? 'pointer' : 'default',
                color: activeIndex > 0 ? t.textSoft : t.textMuted,
                fontSize: 10, fontFamily: font.mono,
              }}
            >
              {IC.arrowLeft} Prev
            </button>
            <span style={{ fontSize: 9, fontFamily: font.mono, color: t.textMuted }}>
              {activeIndex + 1}/{sources.length}
            </span>
            <button
              onClick={() => onNavigate(activeIndex + 1)}
              disabled={activeIndex >= sources.length - 1}
              style={{
                background: 'none', border: 'none',
                cursor: activeIndex < sources.length - 1 ? 'pointer' : 'default',
                color: activeIndex < sources.length - 1 ? t.textSoft : t.textMuted,
                fontSize: 10, fontFamily: font.mono,
              }}
            >
              Next {IC.arrowRight}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── ArtifactPanel (Component A) ──
export default function ArtifactPanel({
  isOpen,
  onClose,
  modelName = '',
  modelColor = '',
  content = '',
  sources = [],
  images = [],
}) {
  const t = useTokens();
  const [mode, setMode] = useState('preview'); // 'preview' | 'code'
  const [copied, setCopied] = useState(false);
  const [showDownload, setShowDownload] = useState(false);
  const [activeSourceIdx, setActiveSourceIdx] = useState(null);
  const contentRef = useRef(null);

  // ESC key handler
  const handleEsc = useCallback((e) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleEsc]);

  // Reset state on open
  useEffect(() => {
    if (isOpen) {
      setMode('preview');
      setCopied(false);
      setShowDownload(false);
      setActiveSourceIdx(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* noop */ }
  };

  const handleDownloadMD = () => {
    const slug = modelName.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40);
    downloadBlob(content, `${slug}-response.md`, 'text/markdown');
    setShowDownload(false);
  };

  const handleDownloadPDF = async () => {
    setShowDownload(false);
    if (contentRef.current) {
      await exportToPDF(contentRef.current, {
        filename: modelName,
        title: modelName,
        modelName,
      });
    }
  };

  const theme = typeof document !== 'undefined'
    ? document.documentElement.getAttribute('data-theme') || 'dark'
    : 'dark';

  const htmlContent = isHTMLContent(content);

  // Custom markdown colors for artifact panel
  const mdColors = {
    text: t.text,
    textSoft: t.textSoft,
    gold: t.councilGold,
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="artifact-backdrop"
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          animation: 'artifactFadeIn 0.2s ease-out',
        }}
      />

      {/* Panel */}
      <div style={{
        position: 'fixed', top: 0, right: 0,
        width: '55vw', minWidth: 400, maxWidth: 900,
        height: '100vh', zIndex: 1001,
        background: t.surface,
        borderLeft: `1px solid ${t.borderHover}`,
        boxShadow: t.shadow.lg,
        animation: 'artifactSlideIn 0.35s cubic-bezier(0.22, 1, 0.36, 1)',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '12px 20px', borderBottom: `1px solid ${t.border}`,
          flexShrink: 0,
        }}>
          {/* Toggle: Preview / Code */}
          <div style={{
            display: 'flex', borderRadius: 6, overflow: 'hidden',
            border: `1px solid ${t.border}`,
          }}>
            {['preview', 'code'].map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                style={{
                  padding: '5px 14px', border: 'none', cursor: 'pointer',
                  fontSize: 10, fontFamily: font.mono, fontWeight: 600,
                  textTransform: 'uppercase', letterSpacing: '0.06em',
                  background: mode === m ? t.surfaceHover : t.surfaceRaised,
                  color: mode === m ? t.text : t.textMuted,
                  transition: 'all 0.15s',
                }}
              >
                {m}
              </button>
            ))}
          </div>

          {/* Model info */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6, flex: 1,
          }}>
            {modelColor && (
              <div style={{
                width: 8, height: 8, borderRadius: '50%', background: modelColor,
              }} />
            )}
            <span style={{
              fontSize: 11, fontFamily: font.mono, color: t.textSoft,
            }}>
              {modelName}
            </span>
          </div>

          {/* Copy */}
          <button
            onClick={handleCopy}
            style={{
              display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px',
              background: 'transparent', border: 'none', cursor: 'pointer',
              fontSize: 11, fontFamily: font.mono,
              color: copied ? t.green : t.councilGold,
            }}
          >
            <span style={{ fontSize: 12 }}>{copied ? IC.check : IC.copy}</span>
            {copied ? 'Copied' : 'Copy'}
          </button>

          {/* Download dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowDownload(!showDownload)}
              style={{
                display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px',
                background: 'transparent', border: 'none', cursor: 'pointer',
                fontSize: 11, fontFamily: font.mono, color: t.textSoft,
              }}
            >
              <span style={{ fontSize: 12 }}>{IC.exportArrow}</span>
              Export
            </button>
            {showDownload && (
              <div style={{
                position: 'absolute', top: '100%', right: 0, marginTop: 4,
                background: t.surfaceRaised, border: `1px solid ${t.border}`,
                borderRadius: 6, overflow: 'hidden', zIndex: 10,
                boxShadow: t.shadow.md,
              }}>
                <button
                  onClick={handleDownloadMD}
                  style={{
                    display: 'block', width: '100%', padding: '8px 16px',
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    fontSize: 11, fontFamily: font.mono, color: t.text,
                    textAlign: 'left',
                  }}
                >
                  Download MD
                </button>
                <button
                  onClick={handleDownloadPDF}
                  style={{
                    display: 'block', width: '100%', padding: '8px 16px',
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    fontSize: 11, fontFamily: font.mono, color: t.text,
                    textAlign: 'left', borderTop: `1px solid ${t.border}`,
                  }}
                >
                  Download PDF
                </button>
              </div>
            )}
          </div>

          {/* Close */}
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: t.textMuted, fontSize: 18, padding: '4px 8px',
            }}
          >
            {IC.close}
          </button>
        </div>

        {/* Body — main content + source sidebar */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Content area */}
          <div ref={contentRef} style={{
            flex: 1, overflow: 'auto', padding: '24px 32px',
          }}>
            {mode === 'preview' ? (
              <>
                {/* Rendered markdown or HTML */}
                {htmlContent ? (
                  <iframe
                    srcDoc={`<!DOCTYPE html><html data-theme="${theme}"><head><style>
                      body { font-family: Inter, system-ui, sans-serif; font-size: 13px;
                        color: ${t.text}; background: ${t.surface}; padding: 16px; margin: 0; }
                      a { color: ${t.cyan}; }
                      table { border-collapse: collapse; width: 100%; }
                      th, td { border: 1px solid ${t.border}; padding: 8px 12px; text-align: left; }
                      th { background: ${t.surfaceRaised}; }
                    </style></head><body>${content}</body></html>`}
                    sandbox=""
                    style={{
                      width: '100%', border: 'none', borderRadius: 8,
                      minHeight: 400, background: t.surface,
                    }}
                    title="Response content"
                  />
                ) : (
                  <div style={{ lineHeight: 1.85, fontSize: 13, fontFamily: font.body }}>
                    <Markdown colors={mdColors}>{content}</Markdown>
                  </div>
                )}

                {/* Images */}
                {images && images.length > 0 && images.map((img, i) => (
                  <div key={i} style={{ margin: '24px 0' }}>
                    <img
                      src={typeof img === 'string' ? img : img.url}
                      alt={img.alt || `Generated image ${i + 1}`}
                      style={{
                        maxWidth: '100%', borderRadius: 12,
                        border: `1px solid ${t.border}`,
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div style={{
                      display: 'none', alignItems: 'center', justifyContent: 'center',
                      gap: 8, padding: 24, borderRadius: 12,
                      background: t.surfaceRaised, color: t.textMuted,
                    }}>
                      <CanvasIcon size={24} />
                      <span style={{ fontSize: 11, fontFamily: font.mono }}>Image failed to load</span>
                    </div>
                    {img.alt && img.alt !== 'Generated image' && (
                      <p style={{
                        fontSize: 11, color: t.textMuted, textAlign: 'center', marginTop: 8,
                      }}>
                        {img.alt}
                      </p>
                    )}
                  </div>
                ))}

                {/* Sources in preview */}
                {sources && sources.length > 0 && (
                  <CollapsibleSources
                    sources={sources}
                    defaultExpanded={false}
                    columns={2}
                  />
                )}
              </>
            ) : (
              /* Code mode */
              <pre style={{
                fontFamily: font.mono, fontSize: 11, color: t.textSoft,
                lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                margin: 0,
              }}>
                {content.split('\n').map((line, i) => (
                  <div key={i} style={{ display: 'flex' }}>
                    <span style={{
                      width: 40, flexShrink: 0, textAlign: 'right',
                      paddingRight: 12, marginRight: 12,
                      color: t.textMuted,
                      borderRight: `1px solid ${t.border}`,
                      userSelect: 'none',
                    }}>
                      {i + 1}
                    </span>
                    <span>{line || ' '}</span>
                  </div>
                ))}
              </pre>
            )}
          </div>

          {/* Source Preview Sidebar */}
          <SourcePreviewSidebar
            sources={sources}
            activeIndex={activeSourceIdx}
            onClose={() => setActiveSourceIdx(null)}
            onNavigate={(idx) => {
              if (idx >= 0 && idx < sources.length) setActiveSourceIdx(idx);
            }}
            t={t}
          />
        </div>

        {/* Source Bottom Bar */}
        <SourceBottomBar
          sources={sources}
          onSourceClick={(idx) => setActiveSourceIdx(activeSourceIdx === idx ? null : idx)}
          t={t}
        />
      </div>
    </>
  );
}
