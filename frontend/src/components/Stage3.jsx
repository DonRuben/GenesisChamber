import { useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { getDisplayName } from '../utils/modelDisplayNames';
import './Stage3.css';

function countWords(text) {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export default function Stage3({ finalResponse, responseCount }) {
  const [copied, setCopied] = useState(false);

  const wordCount = useMemo(
    () => countWords(finalResponse?.response),
    [finalResponse?.response]
  );

  if (!finalResponse) return null;

  const chairmanName = getDisplayName(finalResponse.model);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(finalResponse.response);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard API may fail in insecure contexts */
    }
  };

  return (
    <div className="stage stage3">
      {/* ── Header ── */}
      <div className="s3-header">
        <div className="s3-header-left">
          <div className="s3-stage-indicator">
            <span className="s3-stage-dot" />
            <span className="s3-stage-label">FINAL VERDICT</span>
          </div>
          <h3 className="s3-title">Council Synthesis</h3>
        </div>
        <div className="s3-header-right">
          <div className="s3-chairman-badge">
            <span className="s3-chairman-icon">{'\u2696'}</span>
            <span className="s3-chairman-name">{chairmanName}</span>
          </div>
        </div>
      </div>

      {/* ── Verdict Card ── */}
      <div className="s3-verdict-card">
        <div className="s3-verdict-header">
          <div className="s3-verdict-avatar">
            <span className="s3-verdict-avatar-icon">{'\u2696'}</span>
          </div>
          <div className="s3-verdict-meta">
            <span className="s3-verdict-chairman">{chairmanName}</span>
            <span className="s3-verdict-role">Chairman Synthesis</span>
          </div>
        </div>

        {/* Thinking block */}
        {(finalResponse.reasoning || finalResponse.reasoning_details) && (
          <details className="thinking-block">
            <summary className="thinking-summary">
              <span className="thinking-icon">{'\uD83E\uDDE0'}</span>
              <span>Thinking Process</span>
            </summary>
            <div className="thinking-content">
              <ReactMarkdown>
                {typeof (finalResponse.reasoning || finalResponse.reasoning_details) === 'string'
                  ? (finalResponse.reasoning || finalResponse.reasoning_details)
                  : JSON.stringify(finalResponse.reasoning || finalResponse.reasoning_details, null, 2)}
              </ReactMarkdown>
            </div>
          </details>
        )}

        <div className="s3-verdict-body markdown-content">
          <ReactMarkdown>{finalResponse.response}</ReactMarkdown>
        </div>

        {/* Web citations */}
        {finalResponse.annotations && finalResponse.annotations.length > 0 && (() => {
          const urlAnnotations = finalResponse.annotations.filter(a => a.type === 'url_citation' || a.url);
          if (urlAnnotations.length === 0) return null;
          return (
            <div className="citation-block">
              <span className="citation-label">{'\uD83C\uDF10'} Sources</span>
              <ul className="citation-list">
                {urlAnnotations.map((a, i) => (
                  <li key={i}>
                    <a href={a.url || a.href} target="_blank" rel="noopener noreferrer">
                      {a.title || a.url || a.href}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          );
        })()}

        <div className="s3-verdict-word-count">
          {wordCount.toLocaleString()} words
        </div>
      </div>

      {/* ── Bottom Bar ── */}
      <div className="s3-footer">
        <span className="s3-footer-info">
          Synthesized from {responseCount || 'multiple'} model responses
        </span>
        <button
          className={`s3-copy-btn ${copied ? 'copied' : ''}`}
          onClick={handleCopy}
          title="Copy synthesis to clipboard"
        >
          {copied ? (
            <>
              <svg className="s3-copy-icon" width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M3 8.5L6.5 12L13 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Copied
            </>
          ) : (
            <>
              <svg className="s3-copy-icon" width="14" height="14" viewBox="0 0 16 16" fill="none">
                <rect x="5" y="5" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
                <path d="M3 11V3.5C3 2.67 3.67 2 4.5 2H11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
              Copy
            </>
          )}
        </button>
      </div>
    </div>
  );
}
