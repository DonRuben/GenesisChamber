// ─────────────────────────────────────────────────────────
// GENESIS CHAMBER V4 — COUNCIL LANDING STATE
// Icon + title + presets + chat input
// Ref: gc-v4-llm-council.jsx:88-135
// ─────────────────────────────────────────────────────────

import { useState, useRef, useEffect } from 'react';
import { font } from '../../design/tokens';
import { IC } from '../../design/icons';
import { useCouncilStore } from '../../stores/councilStore';
import { useAppStore } from '../../stores/appStore';
import { listSessions, deleteSession } from '../../utils/sessionStorage';
import PresetBar from './PresetBar';
import ChatInput from './ChatInput';
import { useTokens } from '../../hooks/useTokens';

export default function LandingState({ onPreset, onSubmit }) {
  const t = useTokens();
  const [q, setQ] = useState('');
  const [showRecent, setShowRecent] = useState(false);
  const [sessions, setSessions] = useState([]);
  const preset = useCouncilStore((s) => s.preset);
  const setPreset = useCouncilStore((s) => s.setPreset);
  const loadSavedSession = useCouncilStore((s) => s.loadSavedSession);
  const backendOnline = useAppStore((s) => s.backendOnline);
  const inputRef = useRef(null);

  useEffect(() => {
    setSessions(listSessions());
  }, [showRecent]);

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

      {/* Recent Sessions */}
      <div style={{ width: '100%', maxWidth: 560, marginTop: 16 }}>
        <button
          onClick={() => setShowRecent(!showRecent)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'transparent', border: 'none', cursor: 'pointer',
            fontSize: 10, fontFamily: font.mono, color: t.textMuted,
            textTransform: 'uppercase', letterSpacing: '0.08em',
            padding: '4px 0',
          }}
        >
          <span style={{ fontSize: 12 }}>{IC.history || IC.clock}</span>
          Recent Sessions ({sessions.length})
          <span style={{ fontSize: 10 }}>{showRecent ? IC.chevUp : IC.chevDown}</span>
        </button>

        {showRecent && sessions.length > 0 && (
          <div style={{
            marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4,
            maxHeight: 240, overflowY: 'auto',
            animation: 'fadeSlideUp 0.15s ease-out',
          }}>
            {sessions.map((s) => {
              const date = new Date(s.timestamp);
              const dateStr = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
              const timeStr = date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
              const truncQ = s.question.length > 50 ? s.question.slice(0, 50) + '...' : s.question;
              return (
                <div key={s.key} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '8px 12px', borderRadius: 6,
                  background: t.surface, border: `1px solid ${t.border}`,
                  cursor: 'pointer', transition: 'background 0.1s',
                }}
                  onClick={() => loadSavedSession(s.key)}
                  onMouseEnter={(e) => { e.currentTarget.style.background = t.surfaceRaised; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = t.surface; }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 12, color: t.text, whiteSpace: 'nowrap',
                      overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>{truncQ}</div>
                    <div style={{ fontSize: 9, fontFamily: font.mono, color: t.textMuted, marginTop: 2 }}>
                      {dateStr} {timeStr} · {s.models.length} models
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSession(s.key);
                      setSessions(listSessions());
                    }}
                    style={{
                      background: 'transparent', border: 'none', cursor: 'pointer',
                      color: t.textMuted, fontSize: 12, padding: 4,
                      flexShrink: 0, opacity: 0.5,
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.5'; }}
                  >
                    {IC.x}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {showRecent && sessions.length === 0 && (
          <div style={{
            marginTop: 8, padding: '12px 16px', borderRadius: 6,
            background: t.surface, border: `1px solid ${t.border}`,
            fontSize: 11, color: t.textMuted, textAlign: 'center',
          }}>
            No saved sessions yet
          </div>
        )}
      </div>
    </div>
  );
}
