// ─────────────────────────────────────────────────────────
// GENESIS CHAMBER V4 — COUNCIL LANDING STATE
// Icon + title + presets + chat input
// Ref: gc-v4-llm-council.jsx:88-135
// ─────────────────────────────────────────────────────────

import { useState } from 'react';
import { T, TLight, font } from '../../design/tokens';
import { IC } from '../../design/icons';
import { useAppStore } from '../../stores/appStore';
import PresetBar from './PresetBar';
import ChatInput from './ChatInput';

function useTokens() {
  const theme = useAppStore((s) => s.theme);
  return theme === 'light' ? { ...T, ...TLight } : T;
}

export default function LandingState({ onPreset, onSubmit }) {
  const t = useTokens();
  const [q, setQ] = useState('');

  const submit = () => {
    if (q.trim()) {
      onSubmit(q.trim());
      setQ('');
    }
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', flex: 1, padding: '60px 24px',
      maxWidth: 720, margin: '0 auto', width: '100%',
    }}>
      <div style={{ fontSize: 40, color: T.cyan, marginBottom: 16 }}>{IC.council}</div>
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

      <PresetBar onPreset={onPreset} />

      <ChatInput
        value={q} onChange={setQ} onSubmit={submit}
        placeholder="Ask your question... (Shift+Enter for new line, Enter to send)"
      />
    </div>
  );
}
