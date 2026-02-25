// ─────────────────────────────────────────────────────────
// GENESIS CHAMBER V4 — THINKING CARD
// Animated card shown while a model is reasoning
// Conic gradient border, orbiting avatar ring, neural waves
// CSS classes: .think-card, .think-orbit, .think-wave (index.css)
// Keyframes: tcBorderSpin, tcWaveDash (gc-motion.css)
// ─────────────────────────────────────────────────────────

import { useState, useEffect, useRef } from 'react';
import { font } from '../../design/tokens';
import { useTokens } from '../../hooks/useTokens';

const QUOTES = [
  'Examining from first principles...',
  'Weighing the evidence...',
  'Considering all angles...',
  'Synthesizing a perspective...',
  'Evaluating the landscape...',
  'Building the argument...',
  'Stress-testing the idea...',
  'Finding the signal...',
];

function getWaveSpeeds(modelId, thinkingMode) {
  if (modelId?.includes('grok') || thinkingMode === 'binary')
    return ['1.3s', '1.7s', '2.1s'];
  if (modelId?.includes('claude') && (thinkingMode === 'high' || thinkingMode === 'max'))
    return ['2.5s', '3.2s', '3.8s'];
  return ['2s', '2.6s', '3.2s'];
}

function getProviderFromId(modelId) {
  if (!modelId) return '';
  const parts = modelId.split('/');
  return parts[0] || '';
}

function formatTimer(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}:${String(s).padStart(2, '0')}` : `${s}s`;
}

export default function ThinkingCard({
  modelName,
  modelColor,
  modelLetter = '??',
  modelId,
  tier = '',
  thinkingMode = 'medium',
  elapsed = 0,
  soulName,
}) {
  const t = useTokens();
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [quoteFade, setQuoteFade] = useState(true);
  const intervalRef = useRef(null);

  // Rotate quotes every 4s
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setQuoteFade(false);
      setTimeout(() => {
        setQuoteIdx((prev) => (prev + 1) % QUOTES.length);
        setQuoteFade(true);
      }, 400);
    }, 4000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const mc = modelColor || t.cyan;
  const speeds = getWaveSpeeds(modelId, thinkingMode);
  const provider = getProviderFromId(modelId);
  const modeLabel = thinkingMode === 'binary' ? 'Binary' :
    thinkingMode === 'max' ? 'Max' :
    thinkingMode.charAt(0).toUpperCase() + thinkingMode.slice(1);

  return (
    <div
      className="think-card"
      style={{
        '--tc-mc': mc,
        padding: 20,
        background: t.surface,
      }}
    >
      {/* Inner container — covers conic gradient except at edges */}
      <div style={{
        background: t.surface,
        borderRadius: 11,
        padding: 20,
        position: 'relative',
        zIndex: 1,
      }}>
        {/* Header: Avatar + Info */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 16 }}>
          {/* Avatar with orbit */}
          <div style={{ position: 'relative', width: 48, height: 48, flexShrink: 0 }}>
            <div className="think-orbit" />
            <div style={{
              width: 48, height: 48, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: `${mc}1a`,
              border: `1px solid ${mc}33`,
              color: mc,
              fontSize: 14, fontFamily: font.mono, fontWeight: 700,
              position: 'relative', zIndex: 1,
            }}>
              {modelLetter}
            </div>
          </div>

          {/* Name + Provider line */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4,
            }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: t.text }}>
                {soulName || modelName}
              </span>
              {/* Badge */}
              <span style={{
                display: 'inline-flex', alignItems: 'center',
                padding: '2px 8px', borderRadius: 5,
                fontSize: 9, fontFamily: font.mono, fontWeight: 600,
                background: `${mc}1a`, color: mc,
                textTransform: 'uppercase', letterSpacing: '0.06em',
              }}>
                {modeLabel}
              </span>
            </div>
            <div style={{
              fontSize: 10, color: t.textMuted, fontFamily: font.mono,
            }}>
              {[provider, tier, soulName ? modelName : null].filter(Boolean).join(' · ')}
            </div>
          </div>
        </div>

        {/* Neural waves */}
        <svg className="think-wave" width="100%" height={32} style={{ display: 'block', marginBottom: 12 }}>
          <line x1="0" y1="16" x2="400" y2="16" stroke={mc} strokeWidth="1.5" opacity=".5" style={{ animationDuration: speeds[0] }} />
          <line x1="0" y1="10" x2="400" y2="10" stroke={mc} strokeWidth="1" opacity=".25" style={{ animationDuration: speeds[1] }} />
          <line x1="0" y1="22" x2="400" y2="22" stroke={mc} strokeWidth="1" opacity=".15" style={{ animationDuration: speeds[2] }} />
        </svg>

        {/* Quote */}
        <div style={{
          fontSize: 12, color: t.textMuted, fontStyle: 'italic',
          opacity: quoteFade ? 1 : 0,
          transition: 'opacity 0.4s',
          minHeight: 18,
        }}>
          {QUOTES[quoteIdx]}
        </div>

        {/* Timer — absolutely positioned bottom-right */}
        <div style={{
          position: 'absolute', bottom: 20, right: 20,
          fontFamily: font.mono, fontSize: 10, color: t.textMuted,
          zIndex: 2,
        }}>
          {formatTimer(elapsed)}
        </div>
      </div>
    </div>
  );
}
