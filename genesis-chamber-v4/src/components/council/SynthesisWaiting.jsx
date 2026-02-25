// ─────────────────────────────────────────────────────────
// GENESIS CHAMBER V4 — SYNTHESIS WAITING
// Animated card shown during Stage 3 chairman synthesis
// CSS classes: .synth-card (shimmer), .synth-ring (conic ring)
// Keyframes: synthShim, tcBorderSpin, dotpulse
// ─────────────────────────────────────────────────────────

import { useState, useEffect } from 'react';
import { font } from '../../design/tokens';
import { useTokens } from '../../hooks/useTokens';

const STATUS_MESSAGES = [
  'Analyzing perspectives...',
  'Cross-referencing sources...',
  'Building synthesis...',
  'Evaluating consensus and dissent...',
  'Finalizing verdict...',
];

export default function SynthesisWaiting({
  completedModels = [],
  totalModels = 0,
  chairmanModel = '',
  chairmanColor = '',
}) {
  const t = useTokens();
  const [msgIdx, setMsgIdx] = useState(0);
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setOpacity(0);
      setTimeout(() => {
        setMsgIdx((prev) => (prev + 1) % STATUS_MESSAGES.length);
        setOpacity(1);
      }, 300);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const ringColor = chairmanColor || t.flame;

  return (
    <div
      className="synth-card"
      style={{
        borderRadius: 12,
        border: `1px solid ${t.border}`,
        background: t.surface,
        padding: 28,
        textAlign: 'center',
        maxWidth: 540,
        margin: '0 auto',
      }}
    >
      {/* Chairman ring */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
        <div
          className="synth-ring"
          style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            '--tc-mc': ringColor,
          }}
        >
          {/* Inner avatar */}
          <div style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            background: `${t.flame}1a`,
            border: `1px solid ${t.flame}33`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            zIndex: 1,
          }}>
            <span style={{
              fontFamily: font.mono,
              fontSize: 14,
              fontWeight: 700,
              color: t.flame,
            }}>
              C
            </span>
          </div>
        </div>
      </div>

      {/* Title */}
      <div style={{
        fontFamily: font.display,
        fontSize: 15,
        color: t.text,
        marginBottom: 4,
      }}>
        Synthesizing Council Verdict
      </div>

      {/* Subtitle */}
      <div style={{
        fontSize: 11,
        color: t.textMuted,
        marginBottom: 16,
      }}>
        Chairman analyzing {totalModels} perspectives
      </div>

      {/* Model completion dots */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: 6,
        marginBottom: 10,
        flexWrap: 'wrap',
      }}>
        {completedModels.map((m, i) => (
          <div
            key={i}
            style={{
              width: 10,
              height: 10,
              borderRadius: 5,
              background: m.color || t.textMuted,
              border: `1px solid ${m.color || t.textMuted}`,
            }}
          />
        ))}
      </div>

      {/* Counter */}
      <div style={{
        fontFamily: font.mono,
        fontSize: 10,
        color: t.textMuted,
        marginBottom: 14,
      }}>
        {completedModels.length} of {totalModels} models analyzed
      </div>

      {/* Rotating status messages */}
      <div style={{
        fontSize: 11,
        fontStyle: 'italic',
        color: t.textSoft,
        opacity,
        transition: 'opacity 0.3s',
        minHeight: 18,
      }}>
        {STATUS_MESSAGES[msgIdx]}
      </div>
    </div>
  );
}
