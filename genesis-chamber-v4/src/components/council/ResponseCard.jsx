// ─────────────────────────────────────────────────────────
// GENESIS CHAMBER V4 — RESPONSE CARD
// Anonymous or revealed model response
// Accepts both mock format and backend API format
// Scrollable body (350px) + "Read full" opens modal
// ─────────────────────────────────────────────────────────

import { useState } from 'react';
import { font } from '../../design/tokens';
import { IC } from '../../design/icons';
import { Tag, ModelDot } from '../../design/shared';
import { useTokens } from '../../hooks/useTokens';
import { useModelLookup } from '../../hooks/useModels';
import Markdown from '../../design/Markdown';
import ReadFullModal, { sanitizeFilename, questionSlug } from './ReadFullModal';
import { useCouncilStore } from '../../stores/councilStore';

export default function ResponseCard({ response, index, revealed, isWinner, rank, score }) {
  const t = useTokens();
  const lookupModel = useModelLookup();
  const question = useCouncilStore((s) => s.question);
  const [showThinking, setShowThinking] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Accept both mock format {modelId, text, score} and backend format {model, response, reasoning}
  const modelId = response.model || response.modelId;
  const text = response.response || response.text;
  const displayScore = score ?? response.score ?? null;
  const reasoning = response.reasoning || response.reasoning_details;

  // Look up model info via hook
  const model = lookupModel(modelId);

  const scoreColor = displayScore != null
    ? (displayScore >= 85 ? t.green : displayScore >= 75 ? t.gold : t.textSoft)
    : t.textMuted;

  const wordCount = text ? text.split(/\s+/).filter(Boolean).length : 0;
  const isLong = wordCount > 200;

  // Extract citation annotations — check multiple possible locations
  const rawAnnotations = response.annotations || response.citations || response.sources
    || response.web_search_results || [];
  const annotations = rawAnnotations.map((a) => {
    const citation = a.url_citation || a;
    return {
      url: citation.url || citation.href || citation.link || a.url || a.href,
      title: citation.title || citation.text || citation.display_name || a.title,
    };
  }).filter((a) => a.url);

  const handleCopy = () => {
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const modalTitle = revealed ? model.name : `Model ${String.fromCharCode(65 + index)}`;
  const modalSubtitle = revealed && modelId ? modelId.split('/')[0] : null;

  return (
    <>
      <div className="gc-enter" style={{
        background: t.surface, border: `1px solid ${t.border}`, borderRadius: 8,
        borderLeft: `2px solid ${revealed ? model.color : t.textMuted}`,
        padding: '20px 24px', transition: 'border-color 0.2s',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {revealed ? (
              <>
                <ModelDot color={model.color} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {modelId && (
                    <span style={{ fontSize: 9, fontFamily: font.mono, color: t.textMuted }}>
                      {modelId.split('/')[0]}
                    </span>
                  )}
                  <span style={{ fontSize: 12, fontWeight: 600, color: t.text }}>{model.name}</span>
                </div>
                {isWinner && <Tag color={t.gold}>{IC.trophy} BEST</Tag>}
              </>
            ) : (
              <>
                <div style={{
                  width: 22, height: 22, borderRadius: 4, background: t.surfaceRaised,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontFamily: font.mono, fontWeight: 700, color: t.textMuted,
                }}>
                  {String.fromCharCode(65 + index)}
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: t.textSoft }}>
                  Model {String.fromCharCode(65 + index)}
                </span>
              </>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 10, fontFamily: font.mono, color: t.textMuted }}>
              {wordCount.toLocaleString()} words
            </span>
            {revealed && rank != null && (
              <span style={{ fontSize: 11, fontFamily: font.mono, color: t.textMuted, letterSpacing: '0.04em' }}>
                #{rank}
              </span>
            )}
            {displayScore != null && (
              <span style={{ fontSize: 16, fontFamily: font.mono, fontWeight: 700, color: scoreColor }}>
                {displayScore}
              </span>
            )}
          </div>
        </div>

        {/* Thinking/reasoning expandable */}
        {reasoning && (
          <button
            onClick={() => setShowThinking(!showThinking)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10,
              padding: '4px 8px', background: `${t.purple}12`, border: `1px solid ${t.purple}33`,
              borderRadius: 4, cursor: 'pointer', fontSize: 10, fontFamily: font.mono,
              color: t.purple, textTransform: 'uppercase', letterSpacing: '0.06em',
            }}
          >
            {IC.brain} {showThinking ? 'Hide' : 'Show'} Thinking
          </button>
        )}
        {showThinking && reasoning && (
          <div style={{
            fontSize: 11, color: t.textMuted, lineHeight: 1.6, marginBottom: 12,
            padding: '10px 14px', background: t.surfaceRaised, borderRadius: 6,
            fontFamily: font.mono, maxHeight: 200, overflow: 'auto',
            borderLeft: `2px solid ${t.purple}`,
          }}>
            {typeof reasoning === 'string' ? reasoning : JSON.stringify(reasoning, null, 2)}
          </div>
        )}

        {/* Response text — scrollable with gradient fade */}
        <div style={{ position: 'relative' }}>
          <div
            className="gc-scrollbar"
            style={{
              maxHeight: 350, overflow: 'hidden',
            }}
          >
            <Markdown>{text}</Markdown>
          </div>
          {isLong && (
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0, height: 60,
              background: `linear-gradient(transparent, ${t.surface})`,
              pointerEvents: 'none',
            }} />
          )}
        </div>

        {/* Read full response — opens modal */}
        {isLong && (
          <button
            onClick={() => setShowModal(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              marginTop: 4, padding: '6px 12px',
              background: 'transparent', border: `1px solid ${t.border}`, borderRadius: 5,
              cursor: 'pointer', fontSize: 10, fontFamily: font.mono,
              color: t.textSoft, textTransform: 'uppercase', letterSpacing: '0.06em',
            }}
          >
            <span style={{ fontSize: 12 }}>{IC.exportArrow}</span>
            Read full response
          </button>
        )}

        {/* Citations / Sources */}
        {annotations.length > 0 && (
          <div style={{
            marginTop: 12, padding: '10px 14px', background: t.surfaceRaised,
            borderRadius: 6, borderLeft: `2px solid ${t.cyan}`,
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

        {/* Footer — copy + export */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
          <button
            onClick={handleCopy}
            style={{
              display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px',
              background: 'transparent', border: 'none', cursor: 'pointer',
              fontSize: 11, color: copied ? t.green : t.textMuted, fontFamily: font.mono,
              transition: 'color 0.15s',
            }}
          >
            <span style={{ fontSize: 12 }}>{copied ? IC.check : IC.copy}</span>
            {copied ? 'Copied' : 'Copy'}
          </button>
          {!isLong && (
            <button
              onClick={() => setShowModal(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px',
                background: 'transparent', border: 'none', cursor: 'pointer',
                fontSize: 11, color: t.textMuted, fontFamily: font.mono,
              }}
            >
              <span style={{ fontSize: 12 }}>{IC.exportArrow}</span>
              Export
            </button>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <ReadFullModal
          title={modalTitle}
          subtitle={modalSubtitle}
          text={text}
          accentColor={revealed ? model.color : t.textMuted}
          annotations={annotations}
          filename={sanitizeFilename('response', model.name, questionSlug(question))}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
