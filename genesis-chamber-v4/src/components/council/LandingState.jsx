// ─────────────────────────────────────────────────────────
// GENESIS CHAMBER V4 — COUNCIL LANDING STATE
// Icon + title + presets + chat input
// Ref: gc-v4-llm-council.jsx:88-135
// ─────────────────────────────────────────────────────────

import { useState, useRef } from 'react';
import { font } from '../../design/tokens';
import { IC } from '../../design/icons';
import { useCouncilStore } from '../../stores/councilStore';
import { useAppStore } from '../../stores/appStore';
import PresetBar from './PresetBar';
import ChatInput from './ChatInput';
import { useTokens } from '../../hooks/useTokens';

export default function LandingState({ onPreset, onSubmit }) {
  const t = useTokens();
  const [q, setQ] = useState('');
  const preset = useCouncilStore((s) => s.preset);
  const setPreset = useCouncilStore((s) => s.setPreset);
  const backendOnline = useAppStore((s) => s.backendOnline);
  const inputRef = useRef(null);

  // Wrap onPreset to populate input with placeholder text
  const handlePreset = (p) => {
    onPreset(p);
    setQ(p.placeholder);
    if (inputRef.current) inputRef.current.focus();
  };

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

      {/* Backend status banner */}
      {backendOnline !== true && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '8px 14px', borderRadius: 6, marginBottom: 16,
          width: '100%', maxWidth: 560,
          background: backendOnline === null ? `${t.gold}12` : `${t.textMuted}12`,
          border: `1px solid ${backendOnline === null ? `${t.gold}30` : `${t.textMuted}30`}`,
          animation: 'fadeSlideUp 0.21s ease-out',
        }}>
          <div style={{
            width: 7, height: 7, borderRadius: 4,
            background: backendOnline === null ? t.gold : t.textMuted,
            animation: backendOnline === null ? 'pulse 2s infinite' : 'none',
            flexShrink: 0,
          }} />
          <span style={{
            fontSize: 11, fontFamily: font.mono, fontWeight: 500,
            color: backendOnline === null ? t.gold : t.textMuted,
            letterSpacing: '0.04em',
          }}>
            {backendOnline === null ? 'Connecting to backend...' : 'Offline mode — using mock data'}
          </span>
        </div>
      )}

      <PresetBar onPreset={handlePreset} activePreset={preset} />

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
        placeholder={preset ? 'Edit your question, then press Enter...' : 'Ask your question... (Shift+Enter for new line, Enter to send)'}
      />
    </div>
  );
}
