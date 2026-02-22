// ─────────────────────────────────────────────────────────
// GENESIS CHAMBER V4 — COUNCIL LANDING STATE
// Icon + title + presets + chat input
// Ref: gc-v4-llm-council.jsx:88-135
// ─────────────────────────────────────────────────────────

import { useState, useRef, useEffect } from 'react';
import { font } from '../../design/tokens';
import { IC } from '../../design/icons';
import { useCouncilStore } from '../../stores/councilStore';
import PresetBar from './PresetBar';
import ChatInput from './ChatInput';
import { useTokens } from '../../hooks/useTokens';

export default function LandingState({ onPreset, onSubmit }) {
  const t = useTokens();
  const [q, setQ] = useState('');
  const preset = useCouncilStore((s) => s.preset);
  const setPreset = useCouncilStore((s) => s.setPreset);
  const inputRef = useRef(null);

  // Focus the input when a preset is selected
  useEffect(() => {
    if (preset && inputRef.current) {
      inputRef.current.focus();
    }
  }, [preset]);

  const submit = () => {
    if (q.trim()) {
      onSubmit(q.trim());
      setQ('');
    }
  };

  const clearPreset = () => {
    setPreset(null);
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', flex: 1, padding: '60px 24px',
      maxWidth: 720, margin: '0 auto', width: '100%',
    }}>
      <div style={{ fontSize: 40, color: t.cyan, marginBottom: 16 }}>{IC.council}</div>
      <h1 style={{
        fontFamily: font.display, fontSize: 28, fontWeight: 700,
        color: t.text, letterSpacing: '-0.03em',
        margin: '0 0 8px', textAlign: 'center',
      }}>
        LLM Council
      </h1>
      <p style={{
        fontSize: 14, color: t.textSoft, textAlign: 'center',
        lineHeight: 1.6, margin: '0 0 40px', maxWidth: 480,
      }}>
        Ask a question and receive responses from multiple AI models,
        anonymized rankings, and a synthesized answer.
      </p>

      <PresetBar onPreset={onPreset} activePreset={preset} />

      {/* Preset context tag */}
      {preset && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          marginBottom: 12, width: '100%', maxWidth: 560,
          animation: 'fadeSlideUp 0.21s ease-out',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '5px 10px', borderRadius: 6,
            background: `${preset.color}18`,
            border: `1px solid ${preset.color}30`,
          }}>
            <span style={{
              fontSize: 10, fontFamily: font.mono, fontWeight: 600,
              color: preset.color, textTransform: 'uppercase',
              letterSpacing: '0.12em',
            }}>
              {preset.label}
            </span>
            <button onClick={clearPreset} style={{
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: preset.color, fontSize: 12, padding: 0,
              display: 'flex', alignItems: 'center',
              opacity: 0.7,
            }}>
              {IC.x}
            </button>
          </div>
        </div>
      )}

      <ChatInput
        ref={inputRef}
        value={q} onChange={setQ} onSubmit={submit}
        placeholder={preset ? preset.placeholder : 'Ask your question... (Shift+Enter for new line, Enter to send)'}
      />
    </div>
  );
}
