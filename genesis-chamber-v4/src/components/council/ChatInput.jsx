// ─────────────────────────────────────────────────────────
// GENESIS CHAMBER V4 — CHAT INPUT
// Auto-resizing textarea with settings + send buttons
// Ref: gc-v4-llm-council.jsx:140-185
// ─────────────────────────────────────────────────────────

import { useRef, useEffect } from 'react';
import { T, TLight, font } from '../../design/tokens';
import { IC } from '../../design/icons';
import { useAppStore } from '../../stores/appStore';
import { useCouncilStore } from '../../stores/councilStore';

function useTokens() {
  const theme = useAppStore((s) => s.theme);
  return theme === 'light' ? { ...T, ...TLight } : T;
}

export default function ChatInput({ value, onChange, onSubmit, placeholder, disabled }) {
  const t = useTokens();
  const toggleSettings = useCouncilStore((s) => s.toggleSettings);
  const ref = useRef(null);

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = 'auto';
      ref.current.style.height = Math.min(ref.current.scrollHeight, 160) + 'px';
    }
  }, [value]);

  const hasText = value?.trim();

  return (
    <div style={{
      width: '100%', maxWidth: 560, position: 'relative',
      background: t.surface, border: `1px solid ${t.border}`, borderRadius: 10,
      display: 'flex', alignItems: 'flex-end',
      transition: 'border-color 0.15s',
    }}>
      <button onClick={toggleSettings} title="Settings" style={{
        width: 40, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'transparent', border: 'none', cursor: 'pointer',
        color: t.textMuted, fontSize: 16, flexShrink: 0,
      }}>{IC.settings}</button>

      <textarea
        ref={ref} value={value} onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKey} placeholder={placeholder} disabled={disabled} rows={1}
        style={{
          flex: 1, padding: '13px 0', resize: 'none', overflow: 'hidden',
          background: 'transparent', border: 'none', outline: 'none',
          fontSize: 13, color: t.text, fontFamily: font.body, lineHeight: 1.5,
          minHeight: 44,
        }}
      />

      <button onClick={onSubmit} disabled={!hasText} title="Send" style={{
        width: 40, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'transparent', border: 'none',
        cursor: hasText ? 'pointer' : 'default',
        color: hasText ? T.flame : t.textMuted,
        fontSize: 16, flexShrink: 0, transition: 'color 0.15s',
      }}>{IC.send}</button>
    </div>
  );
}
