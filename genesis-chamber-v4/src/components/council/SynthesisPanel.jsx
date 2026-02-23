// ─────────────────────────────────────────────────────────
// GENESIS CHAMBER V4 — SYNTHESIS PANEL
// Council verdict with chairman badge, citations, copy
// Store-driven with mock fallback
// ─────────────────────────────────────────────────────────

import { useState } from 'react';
import { font, motion } from '../../design/tokens';
import { IC } from '../../design/icons';
import { ModelDot } from '../../design/shared';
import { useCouncilStore } from '../../stores/councilStore';
import { useAppStore } from '../../stores/appStore';
import { MOCK_RESPONSES, MOCK_SYNTHESIS } from '../../data/mock';
import { SkeletonSynthesis } from '../../design/skeletons';
import { useTokens } from '../../hooks/useTokens';
import { useModelLookup } from '../../hooks/useModels';
import Markdown from '../../design/Markdown';

export default function SynthesisPanel() {
  const t = useTokens();
  const lookupModel = useModelLookup();
  const showSynthesis = useCouncilStore((s) => s.showSynthesis);
  const toggleSynthesis = useCouncilStore((s) => s.toggleSynthesis);
  const backendOnline = useAppStore((s) => s.backendOnline);
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  // Live data
  const stage3Result = useCouncilStore((s) => s.stage3Result);
  const stage2Results = useCouncilStore((s) => s.stage2Results);
  const stage1Results = useCouncilStore((s) => s.stage1Results);
  const loading = useCouncilStore((s) => s.loading);
  const currentStage = useCouncilStore((s) => s.currentStage);

  const synthesis = stage3Result?.response
    || (backendOnline === false ? MOCK_SYNTHESIS : null);

  // Build rankings from stage2 or mock
  const rankData = stage2Results?.aggregateRankings
    || (backendOnline === false
      ? [...MOCK_RESPONSES].sort((a, b) => b.score - a.score)
      : null);

  // Chairman model info
  const chairmanModel = stage3Result?.model;
  const chairman = chairmanModel ? lookupModel(chairmanModel) : null;

  // Citation annotations from synthesis
  const annotations = (stage3Result?.annotations || []).filter(
    (a) => a.type === 'url_citation' || a.url
  );

  // Response count for footer
  const responseCount = stage1Results?.length || (backendOnline === false ? MOCK_RESPONSES.length : 0);

  const handleCopy = () => {
    if (!synthesis) return;
    navigator.clipboard?.writeText(synthesis);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Show skeleton during stage3 loading
  if (loading && currentStage === 'stage3') {
    return <SkeletonSynthesis />;
  }

  if (!showSynthesis) {
    return (
      <button onClick={toggleSynthesis}
        style={{
          width: '100%', padding: '14px 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          background: t.surface, border: `1px solid ${t.border}`, borderRadius: 8,
          borderLeft: `2px solid ${t.gold}`, cursor: 'pointer',
          transition: 'background 0.15s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = t.surfaceRaised; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = t.surface; }}
      >
        <span style={{ fontSize: 14, color: t.gold }}>{IC.star}</span>
        <span style={{ fontSize: 12, fontWeight: 600, color: t.text }}>Show Council Synthesis</span>
      </button>
    );
  }

  if (!synthesis) return null;

  const wordCount = synthesis.split(/\s+/).filter(Boolean).length;
  const SYNTH_WORD_LIMIT = 300;
  const isLong = wordCount > SYNTH_WORD_LIMIT;
  const truncatedSynthesis = isLong && !expanded
    ? synthesis.split(/\s+/).slice(0, SYNTH_WORD_LIMIT).join(' ') + '...'
    : synthesis;

  return (
    <div className="gc-enter" style={{
      background: t.surface, border: `1px solid ${t.border}`, borderRadius: 8,
      borderLeft: `2px solid ${t.gold}`, padding: '24px 24px',
    }}>
      {/* Header with chairman badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 14, color: t.gold }}>{IC.star}</span>
          <span style={{
            fontSize: 9, fontFamily: font.mono, fontWeight: 500, color: t.gold,
            textTransform: 'uppercase', letterSpacing: '0.12em',
          }}>COUNCIL SYNTHESIS</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 12, color: t.gold }}>{IC.scale}</span>
          {chairman && <ModelDot color={chairman.color} size={6} />}
          <span style={{ fontSize: 10, fontFamily: font.mono, color: t.gold }}>
            {chairman?.name || 'Chairman'}
          </span>
        </div>
      </div>

      {/* Synthesis text — contained with expand/collapse */}
      <div style={{ position: 'relative' }}>
        <div style={{
          maxHeight: isLong ? (expanded ? 5000 : 400) : undefined,
          overflow: isLong && !expanded ? 'hidden' : undefined,
          transition: isLong ? `max-height ${motion.duration.smooth} ${motion.easing.default}` : undefined,
        }}>
          <Markdown>{truncatedSynthesis}</Markdown>
        </div>
        {isLong && !expanded && (
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: 60,
            background: `linear-gradient(transparent, ${t.surface})`,
            pointerEvents: 'none',
          }} />
        )}
      </div>

      {/* Expand / Collapse control */}
      {isLong && (
        <button
          onClick={() => setExpanded(!expanded)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            marginTop: expanded ? 12 : 4, padding: '6px 12px',
            background: 'transparent', border: `1px solid ${t.border}`, borderRadius: 5,
            cursor: 'pointer', fontSize: 10, fontFamily: font.mono,
            color: t.textSoft, textTransform: 'uppercase', letterSpacing: '0.06em',
          }}
        >
          <span style={{ fontSize: 12 }}>{expanded ? IC.chevUp : IC.chevDown}</span>
          {expanded ? 'Collapse' : 'Read full synthesis'}
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
                  href={a.url || a.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: t.cyan, textDecoration: 'none' }}
                >
                  {a.title || a.url || a.href}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Thinking for synthesis */}
      {stage3Result?.reasoning && (
        <details style={{ marginTop: 12 }}>
          <summary style={{
            fontSize: 10, fontFamily: font.mono, color: t.purple,
            cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.06em',
          }}>
            Chairman Thinking
          </summary>
          <div style={{
            fontSize: 11, color: t.textMuted, lineHeight: 1.6, marginTop: 8,
            padding: '10px 14px', background: t.surfaceRaised, borderRadius: 6,
            fontFamily: font.mono, maxHeight: 200, overflow: 'auto',
            borderLeft: `2px solid ${t.purple}`,
          }}>
            {stage3Result.reasoning}
          </div>
        </details>
      )}

      {/* Score summary */}
      {rankData && (
        <div style={{ marginTop: 18, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {rankData.map((r, i) => {
            const rModelId = r.model || r.model_name || r.modelId;
            const m = lookupModel(rModelId);
            const rScore = r.pct ?? r.score ?? 0;
            const rScoreColor = rScore >= 85 ? t.green : rScore >= 75 ? t.gold : t.textSoft;
            return (
              <div key={rModelId || i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 11, fontFamily: font.mono, fontWeight: 700, color: t.textMuted }}>#{i + 1}</span>
                <ModelDot color={m.color} size={6} />
                <span style={{ fontSize: 11, fontFamily: font.mono, color: t.textSoft }}>{m.name?.split(' ')[0]}</span>
                <span style={{ fontSize: 12, fontFamily: font.mono, fontWeight: 700, color: rScoreColor }}>{rScore}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer: word count, copy, response count */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, marginTop: 16,
        paddingTop: 12, borderTop: `1px solid ${t.border}`,
      }}>
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
        <span style={{ fontSize: 10, fontFamily: font.mono, color: t.textMuted }}>
          {wordCount.toLocaleString()} words
        </span>
        <div style={{ flex: 1 }} />
        {responseCount > 0 && (
          <span style={{ fontSize: 10, fontFamily: font.mono, color: t.textMuted }}>
            Synthesized from {responseCount} model responses
          </span>
        )}
      </div>
    </div>
  );
}
