import { useState, useRef, useEffect } from "react";

// ─────────────────────────────────────────────────────────
// GENESIS CHAMBER V4 · LLM COUNCIL
// Landing + Chat + Model Responses + Rankings + Synthesis
// Design: Tobias van Schneider — Editorial, flat, typographic
// Fonts: OmniPresent (display) + Inter (body) + JetBrains Mono (data)
// ─────────────────────────────────────────────────────────

// ── Icon System ──
const s24 = { display: "inline-block", verticalAlign: "-0.125em" };
const icon = (paths, filled) => (
  <svg width="1em" height="1em" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"}
    stroke={filled ? "none" : "currentColor"} strokeWidth="1.5"
    strokeLinecap="round" strokeLinejoin="round" style={s24}>{paths}</svg>
);
const IC = {
  council:    icon(<><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></>),
  compare:    icon(<><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></>),
  analyze:    icon(<><path d="M21 21H3V3"/><path d="M21 7l-6 6-4-4-6 6"/></>),
  brainstorm: icon(<><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></>),
  evaluate:   icon(<><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4z"/></>),
  debate:     icon(<><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/><path d="M8 9h8"/><path d="M8 13h4"/></>),
  send:       icon(<><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4z"/></>),
  settings:   icon(<><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></>),
  eye:        icon(<><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>),
  eyeOff:     icon(<><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19M1 1l22 22"/><path d="M14.12 14.12a3 3 0 11-4.24-4.24"/></>),
  trophy:     icon(<><path d="M6 9H4a2 2 0 01-2-2V4h4M18 9h2a2 2 0 002-2V4h-4"/><path d="M6 2h12v7a6 6 0 01-12 0V2z"/><path d="M12 15v4M8 22h8M10 19h4"/></>),
  star:       icon(<path d="M12 3l3 6 6.6 1-4.8 4.7 1.1 6.3L12 17.5 6.1 21l1.1-6.3L2.4 10 9 9z"/>, true),
  copy:       icon(<><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></>),
  refresh:    icon(<><path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></>),
  chevDown:   icon(<path d="M6 9l6 6 6-6"/>),
};

// ── Tokens ──
const T = {
  bg: "#111113", surface: "#18181B", surfaceRaised: "#1F1F23", surfaceHover: "#26262B",
  flame: "#F27123", cyan: "#00D9FF", gold: "#D4A853", magenta: "#E5375E",
  green: "#34D399", purple: "#8B5CF6",
  text: "#E8E6E3", textSoft: "#A1A1AA", textMuted: "#63636E",
  border: "rgba(255,255,255,0.06)", borderHover: "rgba(255,255,255,0.12)",
};
const font = {
  display: "'OmniPresent', 'Inter', system-ui, -apple-system, sans-serif",
  body: "'Inter', system-ui, -apple-system, sans-serif",
  mono: "'JetBrains Mono', 'SF Mono', Menlo, monospace",
};

// ── Models ──
const MODELS = [
  { id: "claude", name: "Claude Sonnet", color: T.flame, letter: "C" },
  { id: "gpt4o", name: "GPT-4o", color: T.green, letter: "G" },
  { id: "gemini", name: "Gemini 2.0 Flash", color: "#3B82F6", letter: "Gm" },
  { id: "deepseek", name: "DeepSeek R1", color: T.purple, letter: "D" },
];

// ── Presets ──
const PRESETS = [
  { key: "compare", label: "Compare", desc: "Trade-offs between two approaches", icon: IC.compare, color: T.cyan, placeholder: "Compare X vs Y for..." },
  { key: "analyze", label: "Analyze", desc: "Deep analysis of a strategy or concept", icon: IC.analyze, color: T.flame, placeholder: "Analyze the implications of..." },
  { key: "brainstorm", label: "Brainstorm", desc: "Generate creative ideas for a challenge", icon: IC.brainstorm, color: T.gold, placeholder: "Generate ideas for..." },
  { key: "evaluate", label: "Evaluate", desc: "Assess strengths and weaknesses", icon: IC.evaluate, color: T.green, placeholder: "Evaluate the effectiveness of..." },
  { key: "debate", label: "Debate", desc: "Models argue opposing perspectives", icon: IC.debate, color: T.magenta, placeholder: "Debate whether..." },
];

// ── Mock Responses ──
const MOCK_RESPONSES = [
  { modelId: "claude", text: "The key differentiator lies in the execution model. React's virtual DOM reconciliation is well-understood and battle-tested, but Svelte's compile-time approach eliminates the runtime overhead entirely. For a dashboard with frequent state updates, Svelte's surgical DOM updates yield measurably better frame rates. However, React's ecosystem depth — particularly for complex data visualization with D3 integration — remains unmatched. My recommendation: Svelte for greenfield dashboards under 50 components; React for enterprise-scale with heavy charting requirements.", score: 88 },
  { modelId: "gpt4o", text: "From a developer experience standpoint, Svelte reduces boilerplate by approximately 40% compared to React for equivalent functionality. The reactive declarations ($:) replace useState/useEffect patterns with more intuitive syntax. But the trade-off is significant: React's job market is 10× larger, component libraries like shadcn/ui have no Svelte equivalent at the same quality tier, and React Server Components offer a server-first paradigm Svelte hasn't matched. For your dashboard rebuild: if the team knows React, stay with React. The productivity gains from Svelte don't offset the migration cost and ecosystem gap.", score: 82 },
  { modelId: "gemini", text: "The performance benchmarks tell a clear story: Svelte outperforms React by 2-3× in initial render and 1.5× in updates for typical dashboard patterns. But benchmarks aren't production. In real-world dashboards, the bottleneck is rarely the framework — it's data fetching, chart rendering, and WebSocket management. Both frameworks handle these comparably. The deciding factor should be team velocity: which framework lets your specific team ship quality code faster? That's an organizational question, not a technical one.", score: 85 },
  { modelId: "deepseek", text: "Consider the long-term architecture. React 19 with Server Components and the new compiler eliminates most performance criticism — automatic memoization, streaming SSR, and reduced bundle sizes make the framework gap negligible. Svelte 5 with runes also converges toward a similar reactivity model. The frameworks are converging. Your decision should weight: (1) existing codebase investment, (2) team expertise distribution, (3) dependency on third-party component ecosystems. For most production dashboards, React remains the pragmatic choice despite Svelte's elegance.", score: 79 },
];

const MOCK_SYNTHESIS = "The council reaches consensus on a nuanced position: **Svelte offers superior developer experience and raw performance**, while **React provides ecosystem depth and hiring advantages**. The pragmatic recommendation depends on context — greenfield projects with small teams favor Svelte; enterprise environments with existing React investment should stay the course. Key insight from the debate: framework performance gaps are narrowing rapidly, making ecosystem and team factors the decisive criteria.";

// ── Shared Components ──
function Tag({ children, color = T.cyan }) {
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 4, fontSize: 9, fontFamily: font.mono, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.12em", color, background: `${color}1a` }}>{children}</span>;
}

function ModelDot({ model, size = 8 }) {
  return <div style={{ width: size, height: size, borderRadius: size / 2, background: model.color, flexShrink: 0 }}/>;
}

// ─────────────────────────────────────────────────────────
// Landing State
// ─────────────────────────────────────────────────────────
function LandingState({ onPreset, onSubmit }) {
  const [q, setQ] = useState("");
  const inputRef = useRef(null);

  const submit = () => {
    if (q.trim()) { onSubmit(q.trim()); setQ(""); }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, padding: "60px 24px", maxWidth: 720, margin: "0 auto", width: "100%" }}>

      {/* Icon + Title */}
      <div style={{ fontSize: 40, color: T.cyan, marginBottom: 16 }}>{IC.council}</div>
      <h1 style={{ fontFamily: font.display, fontSize: 28, fontWeight: 700, color: T.text, letterSpacing: "-0.03em", margin: "0 0 8px", textAlign: "center" }}>
        LLM Council
      </h1>
      <p style={{ fontSize: 14, color: T.textSoft, textAlign: "center", lineHeight: 1.6, margin: "0 0 40px", maxWidth: 480 }}>
        Ask a question and receive responses from multiple AI models,
        anonymized rankings, and a synthesized answer.
      </p>

      {/* Preset Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, width: "100%", maxWidth: 560, marginBottom: 40 }}>
        {PRESETS.map(p => (
          <button key={p.key} onClick={() => onPreset(p)}
            style={{
              padding: "18px 20px", textAlign: "left", cursor: "pointer",
              background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8,
              borderLeft: `2px solid ${p.color}`,
              transition: "background 0.15s, border-color 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = T.surfaceRaised; e.currentTarget.style.borderColor = T.borderHover; }}
            onMouseLeave={e => { e.currentTarget.style.background = T.surface; e.currentTarget.style.borderColor = T.border; }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 14, color: p.color }}>{p.icon}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{p.label}</span>
            </div>
            <div style={{ fontSize: 12, color: T.textMuted, lineHeight: 1.5 }}>{p.desc}</div>
          </button>
        ))}
      </div>

      {/* Chat Input */}
      <ChatInput value={q} onChange={setQ} onSubmit={submit} ref={inputRef} placeholder="Ask your question... (Shift+Enter for new line, Enter to send)"/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Chat Input
// ─────────────────────────────────────────────────────────
const ChatInput = ({ value, onChange, onSubmit, placeholder, disabled }) => {
  const ref = useRef(null);
  const handleKey = e => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSubmit(); }
  };

  // Auto-resize
  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = "auto";
      ref.current.style.height = Math.min(ref.current.scrollHeight, 160) + "px";
    }
  }, [value]);

  return (
    <div style={{
      width: "100%", maxWidth: 560, position: "relative",
      background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10,
      display: "flex", alignItems: "flex-end",
      transition: "border-color 0.15s",
    }}>
      <button title="Settings" style={{
        width: 40, height: 44, display: "flex", alignItems: "center", justifyContent: "center",
        background: "transparent", border: "none", cursor: "pointer", color: T.textMuted, fontSize: 16,
        flexShrink: 0,
      }}>{IC.settings}</button>

      <textarea ref={ref} value={value} onChange={e => onChange(e.target.value)}
        onKeyDown={handleKey} placeholder={placeholder} disabled={disabled} rows={1}
        style={{
          flex: 1, padding: "13px 0", resize: "none", overflow: "hidden",
          background: "transparent", border: "none", outline: "none",
          fontSize: 13, color: T.text, fontFamily: font.body, lineHeight: 1.5,
          minHeight: 44,
        }}/>

      <button onClick={onSubmit} disabled={!value?.trim()} title="Send"
        style={{
          width: 40, height: 44, display: "flex", alignItems: "center", justifyContent: "center",
          background: "transparent", border: "none", cursor: value?.trim() ? "pointer" : "default",
          color: value?.trim() ? T.flame : T.textMuted, fontSize: 16, flexShrink: 0,
          transition: "color 0.15s",
        }}>{IC.send}</button>
    </div>
  );
};

// ─────────────────────────────────────────────────────────
// Conversation State
// ─────────────────────────────────────────────────────────
function ConversationView({ question, preset }) {
  const [revealed, setRevealed] = useState(false);
  const [showSynthesis, setShowSynthesis] = useState(false);
  const [followUp, setFollowUp] = useState("");

  // Sort by score for ranking
  const ranked = [...MOCK_RESPONSES].sort((a, b) => b.score - a.score);
  const winner = ranked[0];

  return (
    <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
      <div style={{ maxWidth: 760, margin: "0 auto", width: "100%", padding: "32px 24px" }}>

        {/* Question Header */}
        <div style={{ marginBottom: 32 }}>
          {preset && (
            <div style={{ marginBottom: 10 }}>
              <Tag color={PRESETS.find(p => p.key === preset)?.color || T.cyan}>
                {preset}
              </Tag>
            </div>
          )}
          <div style={{
            fontSize: 16, fontWeight: 600, color: T.text, lineHeight: 1.6,
            padding: "16px 20px", background: T.surface, borderRadius: 8,
            borderLeft: `2px solid ${T.cyan}`,
          }}>
            {question}
          </div>
        </div>

        {/* Model Participation */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <span style={{ fontSize: 9, fontFamily: font.mono, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.12em" }}>
            {MODELS.length} MODELS RESPONDING
          </span>
          <div style={{ display: "flex", gap: 6 }}>
            {MODELS.map(m => <ModelDot key={m.id} model={m} size={8}/>)}
          </div>
          <div style={{ flex: 1 }}/>
          <button onClick={() => setRevealed(r => !r)}
            style={{
              display: "flex", alignItems: "center", gap: 6, padding: "6px 12px",
              background: "transparent", border: `1px solid ${T.border}`, borderRadius: 5,
              cursor: "pointer", fontSize: 11, fontFamily: font.mono, color: T.textSoft,
              letterSpacing: "0.04em",
            }}>
            <span style={{ fontSize: 13 }}>{revealed ? IC.eye : IC.eyeOff}</span>
            {revealed ? "Models visible" : "Reveal models"}
          </button>
        </div>

        {/* Responses */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
          {(revealed ? ranked : MOCK_RESPONSES).map((resp, i) => {
            const model = MODELS.find(m => m.id === resp.modelId);
            const isWinner = revealed && resp.modelId === winner.modelId;
            const rank = revealed ? ranked.findIndex(r => r.modelId === resp.modelId) + 1 : null;

            return (
              <div key={resp.modelId} style={{
                background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8,
                borderLeft: `2px solid ${revealed ? model.color : T.textMuted}`,
                padding: "20px 24px",
                transition: "border-color 0.2s",
              }}>
                {/* Header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {revealed ? (
                      <>
                        <ModelDot model={model}/>
                        <span style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{model.name}</span>
                        {isWinner && <Tag color={T.gold}>{IC.trophy} BEST</Tag>}
                      </>
                    ) : (
                      <>
                        <div style={{
                          width: 22, height: 22, borderRadius: 4, background: T.surfaceRaised,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 10, fontFamily: font.mono, fontWeight: 700, color: T.textMuted,
                        }}>
                          {String.fromCharCode(65 + i)}
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 600, color: T.textSoft }}>Model {String.fromCharCode(65 + i)}</span>
                      </>
                    )}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {revealed && rank && (
                      <span style={{ fontSize: 11, fontFamily: font.mono, color: T.textMuted, letterSpacing: "0.04em" }}>
                        #{rank}
                      </span>
                    )}
                    <span style={{
                      fontSize: 16, fontFamily: font.mono, fontWeight: 700,
                      color: resp.score >= 85 ? T.green : resp.score >= 75 ? T.gold : T.textSoft,
                    }}>{resp.score}</span>
                  </div>
                </div>

                {/* Response text */}
                <div style={{ fontSize: 13, color: T.textSoft, lineHeight: 1.7 }}>{resp.text}</div>

                {/* Footer actions */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 14 }}>
                  <button style={{
                    display: "flex", alignItems: "center", gap: 4, padding: "4px 8px",
                    background: "transparent", border: "none", cursor: "pointer",
                    fontSize: 11, color: T.textMuted, fontFamily: font.mono,
                  }}>
                    <span style={{ fontSize: 12 }}>{IC.copy}</span> Copy
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Synthesis Section */}
        <div style={{ marginBottom: 32 }}>
          {!showSynthesis ? (
            <button onClick={() => setShowSynthesis(true)}
              style={{
                width: "100%", padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8,
                borderLeft: `2px solid ${T.gold}`, cursor: "pointer",
                transition: "background 0.15s",
              }}
              onMouseEnter={e => e.currentTarget.style.background = T.surfaceRaised}
              onMouseLeave={e => e.currentTarget.style.background = T.surface}
            >
              <span style={{ fontSize: 14, color: T.gold }}>{IC.star}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: T.text }}>Show Council Synthesis</span>
            </button>
          ) : (
            <div style={{
              background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8,
              borderLeft: `2px solid ${T.gold}`, padding: "24px 24px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <span style={{ fontSize: 14, color: T.gold }}>{IC.star}</span>
                <span style={{ fontSize: 9, fontFamily: font.mono, fontWeight: 500, color: T.gold, textTransform: "uppercase", letterSpacing: "0.12em" }}>COUNCIL SYNTHESIS</span>
              </div>
              <div style={{ fontSize: 13, color: T.textSoft, lineHeight: 1.7 }}>{MOCK_SYNTHESIS}</div>

              {/* Score Summary */}
              <div style={{ marginTop: 18, display: "flex", gap: 16 }}>
                {ranked.map((r, i) => {
                  const m = MODELS.find(mod => mod.id === r.modelId);
                  return (
                    <div key={r.modelId} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 11, fontFamily: font.mono, fontWeight: 700, color: T.textMuted }}>#{i + 1}</span>
                      <ModelDot model={m} size={6}/>
                      <span style={{ fontSize: 11, fontFamily: font.mono, color: T.textSoft }}>{m.name.split(" ")[0]}</span>
                      <span style={{ fontSize: 12, fontFamily: font.mono, fontWeight: 700, color: r.score >= 85 ? T.green : r.score >= 75 ? T.gold : T.textSoft }}>{r.score}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Follow-up Input */}
        <div style={{ position: "sticky", bottom: 0, paddingBottom: 24 }}>
          <ChatInput value={followUp} onChange={setFollowUp}
            onSubmit={() => { /* handle follow-up */ }}
            placeholder="Ask a follow-up question..."
          />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Settings Panel (slide-in)
// ─────────────────────────────────────────────────────────
function SettingsPanel({ open, onClose }) {
  const [anonymized, setAnonymized] = useState(true);
  const [activeModels, setActiveModels] = useState(MODELS.map(m => m.id));

  if (!open) return null;

  const toggleModel = id => {
    setActiveModels(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  return (
    <div style={{
      position: "fixed", top: 0, right: 0, bottom: 0, width: 320,
      background: T.surface, borderLeft: `1px solid ${T.border}`,
      zIndex: 200, display: "flex", flexDirection: "column",
      animation: "slideInRight 0.2s ease-out",
    }}>
      <style>{`@keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>

      {/* Header */}
      <div style={{ padding: "20px 20px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 9, fontFamily: font.mono, fontWeight: 500, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.12em" }}>COUNCIL SETTINGS</span>
        <button onClick={onClose} style={{ width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: "none", cursor: "pointer", color: T.textMuted, fontSize: 14 }}>
          <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={s24}><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg>
        </button>
      </div>

      {/* Models */}
      <div style={{ padding: "20px", flex: 1, overflowY: "auto" }}>
        <div style={{ fontSize: 9, fontFamily: font.mono, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 12 }}>ACTIVE MODELS</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 28 }}>
          {MODELS.map(m => (
            <button key={m.id} onClick={() => toggleModel(m.id)}
              style={{
                padding: "12px 14px", display: "flex", alignItems: "center", gap: 10,
                background: activeModels.includes(m.id) ? T.surfaceRaised : "transparent",
                border: `1px solid ${activeModels.includes(m.id) ? T.borderHover : T.border}`,
                borderLeft: `2px solid ${activeModels.includes(m.id) ? m.color : "transparent"}`,
                borderRadius: 6, cursor: "pointer", transition: "all 0.13s",
              }}>
              <ModelDot model={m}/>
              <span style={{ fontSize: 12, fontWeight: 500, color: activeModels.includes(m.id) ? T.text : T.textMuted, flex: 1, textAlign: "left" }}>{m.name}</span>
              <div style={{
                width: 16, height: 16, borderRadius: 3, border: `1.5px solid ${activeModels.includes(m.id) ? m.color : T.textMuted}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: activeModels.includes(m.id) ? `${m.color}1a` : "transparent",
              }}>
                {activeModels.includes(m.id) && (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={m.color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5 9-9"/></svg>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Anonymization toggle */}
        <div style={{ fontSize: 9, fontFamily: font.mono, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 12 }}>DISPLAY</div>
        <button onClick={() => setAnonymized(a => !a)}
          style={{
            width: "100%", padding: "12px 14px", display: "flex", alignItems: "center", gap: 10,
            background: T.surfaceRaised, border: `1px solid ${T.border}`, borderRadius: 6,
            cursor: "pointer",
          }}>
          <span style={{ fontSize: 14, color: anonymized ? T.cyan : T.textMuted }}>
            {anonymized ? IC.eyeOff : IC.eye}
          </span>
          <div style={{ flex: 1, textAlign: "left" }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: T.text }}>Anonymized Responses</div>
            <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>
              {anonymized ? "Model names hidden until reveal" : "Model names visible immediately"}
            </div>
          </div>
          <div style={{
            width: 36, height: 20, borderRadius: 10, padding: 2,
            background: anonymized ? T.cyan : T.surfaceHover,
            transition: "background 0.15s", cursor: "pointer",
          }}>
            <div style={{
              width: 16, height: 16, borderRadius: 8, background: "#fff",
              transform: anonymized ? "translateX(16px)" : "translateX(0)",
              transition: "transform 0.15s",
            }}/>
          </div>
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────
export default function LLMCouncil() {
  const [view, setView] = useState("landing"); // "landing" | "conversation"
  const [question, setQuestion] = useState("");
  const [preset, setPreset] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const handlePreset = p => {
    setPreset(p.key);
    setQuestion(p.placeholder);
    setView("conversation");
  };

  const handleSubmit = q => {
    setQuestion(q);
    setPreset(null);
    setView("conversation");
  };

  return (
    <div style={{ background: T.bg, minHeight: "100vh", fontFamily: font.body, color: T.text, WebkitFontSmoothing: "antialiased", display: "flex", flexDirection: "column" }}>
      <style>{`@font-face { font-family: 'OmniPresent'; src: url('https://cdn.jsdelivr.net/gh/DonRuben/Hosting-Assets-Externally@main/Fonts/Font-%20OmniPresent%20Main/OmniPresent.woff') format('woff'); font-display: swap; }`}</style>

      {view === "landing" && (
        <LandingState onPreset={handlePreset} onSubmit={handleSubmit}/>
      )}

      {view === "conversation" && (
        <ConversationView question={question} preset={preset}/>
      )}

      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)}/>
    </div>
  );
}
