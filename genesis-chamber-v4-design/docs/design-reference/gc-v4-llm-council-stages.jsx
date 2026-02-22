import { useState } from "react";

// ═══════════════════════════════════════════════════════════════
// GENESIS CHAMBER V4 — LLM COUNCIL STAGES
// Tobias van Schneider — flat surfaces, 2px accents, no shadows
// Stage 1 (Responses) + Stage 2 (Rankings) + Stage 3 (Synthesis)
// Loading States + Live Preview + Audit Panel
// ═══════════════════════════════════════════════════════════════

const s = { display: "inline-block", verticalAlign: "-0.125em" };
const IC = {
  brain: <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={s}><path d="M10 2C6 2 3 5.5 3 9c0 2.5 1.5 4.5 3.5 5.5L7 18h6l.5-3.5C15.5 13.5 17 11.5 17 9c0-3.5-3-7-7-7z"/><path d="M7.5 9h5M10 6.5v5"/></svg>,
  crown: <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={s}><path d="M3 15h14l-2-8-3 4-2-6-2 6-3-4z"/><path d="M3 15v2h14v-2"/></svg>,
  check: <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={s}><path d="M4 10l4 4 8-8"/></svg>,
  warn: <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={s}><path d="M10 2L1 18h18L10 2z"/><path d="M10 8v4"/><circle cx="10" cy="15" r="1" fill="currentColor"/></svg>,
  bolt: <svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor" stroke="none" style={s}><path d="M11 2L5 11h5l-1 7 6-9h-5l1-7z"/></svg>,
  clipboard: <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={s}><path d="M7 3h6"/><rect x="4" y="2" width="12" height="16" rx="1.5"/><path d="M7 7h6M7 10h6M7 13h4"/></svg>,
  chart: <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={s}><path d="M3 17h14"/><rect x="5" y="9" width="2" height="8" rx=".5" fill="currentColor"/><rect x="9" y="5" width="2" height="12" rx=".5" fill="currentColor"/><rect x="13" y="2" width="2" height="15" rx=".5" fill="currentColor"/></svg>,
};

const T = {
  bg: "#111113", surface: "#18181B", surfaceRaised: "#1F1F23", surfaceHover: "#26262B",
  flame: "#F27123", cyan: "#00D9FF", gold: "#D4A853", magenta: "#E5375E",
  green: "#34D399", purple: "#8B5CF6", amber: "#F59E0B", red: "#EF4444",
  text: "#E8E6E3", textSoft: "#A1A1AA", textMuted: "#63636E",
  border: "rgba(255,255,255,0.06)", borderHover: "rgba(255,255,255,0.12)",
};
const font = { display: "'OmniPresent', Inter, system-ui", body: "Inter, system-ui, sans-serif", mono: "'JetBrains Mono', monospace" };

const Tag = ({ label, color = T.cyan }) => (<span style={{ fontFamily: font.mono, fontSize: 10, fontWeight: 600, color, background: `${color}14`, borderRadius: 4, padding: "2px 8px", textTransform: "uppercase", letterSpacing: "0.12em" }}>{label}</span>);
const MonoLabel = ({ children, icon, color = T.textMuted }) => (<div style={{ fontFamily: font.mono, fontSize: 10, fontWeight: 600, color, textTransform: "uppercase", letterSpacing: "0.12em", display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>{icon && <span style={{ fontSize: 14 }}>{icon}</span>}{children}</div>);
const ScoreBar = ({ score, color, height = 4 }) => (<div style={{ width: "100%", height, background: T.surfaceRaised, borderRadius: 2 }}><div style={{ width: `${score}%`, height: "100%", borderRadius: 2, background: color }} /></div>);
const Card = ({ children, accent, style: sx }) => (<div style={{ background: T.surface, borderLeft: `2px solid ${accent || T.border}`, borderRadius: 8, overflow: "hidden", ...sx }}>{children}</div>);

// ── Stage config ──
const STAGE = {
  1: { color: T.green, label: "STAGE 1", name: "Individual Responses" },
  2: { color: T.amber, label: "STAGE 2", name: "Peer Rankings" },
  3: { color: T.cyan, label: "FINAL", name: "Council Synthesis" },
};

// ── Mock Data ──
const MODELS = [
  { id: "gpt4o", name: "GPT-4o", color: "#10A37F" },
  { id: "claude", name: "Claude Sonnet 4", color: "#D97706" },
  { id: "gemini", name: "Gemini 2.5 Pro", color: "#4285F4" },
  { id: "deepseek", name: "DeepSeek R1", color: "#06B6D4" },
];
const RANKINGS = [
  { model: "Claude Sonnet 4", avgRank: 1.33, pct: 100, color: "#D97706" },
  { model: "GPT-4o", avgRank: 1.67, pct: 82, color: "#10A37F" },
  { model: "Gemini 2.5 Pro", avgRank: 2.67, pct: 48, color: "#4285F4" },
  { model: "DeepSeek R1", avgRank: 3.33, pct: 28, color: "#06B6D4" },
];

// ═══════════════════════════════════════════════════════════════
// STAGE 1 — Individual Responses
// ═══════════════════════════════════════════════════════════════

function Stage1Panel() {
  const [activeModel, setActiveModel] = useState(0);
  const [compare, setCompare] = useState(false);
  const m = MODELS[activeModel];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div>
          <MonoLabel color={STAGE[1].color}>{STAGE[1].label} — {STAGE[1].name}</MonoLabel>
          <span style={{ fontSize: 12, color: T.textMuted }}>{MODELS.length} models responded</span>
        </div>
        <button onClick={() => setCompare(!compare)} style={{ padding: "6px 13px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 600, background: compare ? `${T.green}14` : T.surfaceRaised, color: compare ? T.green : T.textMuted }}>⇔ Compare</button>
      </div>

      {!compare ? (
        <>
          {/* Model tabs */}
          <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
            {MODELS.map((model, i) => (
              <button key={model.id} onClick={() => setActiveModel(i)} style={{
                display: "flex", alignItems: "center", gap: 8, padding: "8px 13px",
                background: activeModel === i ? `${model.color}14` : T.surfaceRaised,
                borderLeft: `2px solid ${activeModel === i ? model.color : "transparent"}`,
                borderTop: "none", borderRight: "none", borderBottom: "none",
                borderRadius: 6, cursor: "pointer",
              }}>
                <div style={{ width: 6, height: 6, borderRadius: 9999, background: model.color }} />
                <span style={{ fontFamily: font.mono, fontSize: 11, fontWeight: 600, color: activeModel === i ? model.color : T.textMuted }}>{model.name}</span>
              </button>
            ))}
          </div>

          {/* Response card */}
          <Card accent={m.color}>
            <div style={{ padding: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 13 }}>
                <div style={{ width: 28, height: 28, borderRadius: 9999, background: `${m.color}14`, border: `2px solid ${m.color}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontFamily: font.mono, fontSize: 10, fontWeight: 700, color: m.color }}>{m.name[0]}</span>
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{m.name}</div>
                  <span style={{ fontFamily: font.mono, fontSize: 10, color: T.textMuted }}>2,847 tokens · 3.2s</span>
                </div>
              </div>

              {/* Thinking block */}
              <details style={{ marginBottom: 13, background: `${T.purple}08`, borderRadius: 6, borderLeft: `2px solid ${T.purple}` }}>
                <summary style={{ padding: "8px 13px", cursor: "pointer", fontFamily: font.mono, fontSize: 11, color: T.purple }}>
                  {IC.brain} Thinking Process (1,240 tokens)
                </summary>
                <div style={{ padding: "8px 13px", fontFamily: font.mono, fontSize: 11, color: T.textMuted, lineHeight: 1.6 }}>
                  I need to consider the brand positioning carefully. The target demographic suggests premium positioning with emphasis on sound quality and lifestyle integration. Let me analyze competitive landscape...
                </div>
              </details>

              {/* Response body */}
              <div style={{ fontSize: 13, color: T.textSoft, lineHeight: 1.7 }}>
                <p style={{ margin: "0 0 10px" }}><strong style={{ color: T.text }}>SoundSphere Elite</strong> — A premium headphone brand positioned at the intersection of audiophile craftsmanship and modern lifestyle design.</p>
                <p style={{ margin: "0 0 10px" }}>The brand emphasizes spatial audio technology and personalized sound profiles, targeting discerning listeners who demand both technical excellence and aesthetic sophistication.</p>
                <p style={{ margin: 0, color: T.textMuted, fontStyle: "italic" }}>Tagline: "Sound isn't just heard — it's felt."</p>
              </div>
            </div>
          </Card>
        </>
      ) : (
        /* Compare mode */
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 13 }}>
          {MODELS.slice(0, 2).map(model => (
            <Card key={model.id} accent={model.color}>
              <div style={{ padding: 13 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <div style={{ width: 6, height: 6, borderRadius: 9999, background: model.color }} />
                  <span style={{ fontFamily: font.mono, fontSize: 11, fontWeight: 600, color: model.color }}>{model.name}</span>
                </div>
                <p style={{ fontSize: 12, color: T.textSoft, lineHeight: 1.6, margin: 0 }}>
                  {model.id === "claude" ? "SoundSphere Elite positions at the intersection of audiophile craftsmanship and modern lifestyle. Spatial audio + personalized profiles." : "AudioVault Pro — a secure ecosystem with proprietary lossless codec and biometric authentication for personal sound libraries."}
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// STAGE 2 — Peer Rankings
// ═══════════════════════════════════════════════════════════════

function Stage2Panel() {
  const [showRaw, setShowRaw] = useState(false);
  const podiumColors = [T.gold, T.textSoft, "#CD7F32", T.textMuted];

  return (
    <div>
      <MonoLabel color={STAGE[2].color}>{STAGE[2].label} — {STAGE[2].name}</MonoLabel>
      <span style={{ fontSize: 12, color: T.textMuted, display: "block", marginBottom: 16 }}>4 evaluators ranked all responses</span>

      {/* Leaderboard */}
      <Card accent={T.gold} style={{ marginBottom: 16 }}>
        <div style={{ padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 13 }}>
            <span style={{ fontSize: 14 }}>{IC.chart}</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: T.text }}>Aggregate Rankings</span>
            <Tag label="CONSENSUS" color={T.gold} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {RANKINGS.map((r, i) => (
              <div key={r.model} style={{ display: "flex", alignItems: "center", gap: 13 }}>
                <span style={{ fontFamily: font.mono, fontSize: 16, fontWeight: 700, color: podiumColors[i], width: 24, textAlign: "center" }}>
                  {i === 0 ? IC.crown : `#${i + 1}`}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: i === 0 ? T.text : T.textSoft }}>{r.model}</span>
                    <span style={{ fontFamily: font.mono, fontSize: 11, fontWeight: 700, color: podiumColors[i] }}>AVG {r.avgRank.toFixed(2)}</span>
                  </div>
                  <ScoreBar score={r.pct} color={r.color} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Raw evaluations toggle */}
      <button onClick={() => setShowRaw(!showRaw)} style={{ fontFamily: font.mono, fontSize: 10, color: T.textMuted, background: "none", border: "none", cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.12em" }}>
        {showRaw ? "▲ HIDE" : "▼ SHOW"} Raw Evaluations
      </button>
      {showRaw && (
        <Card accent={T.amber} style={{ marginTop: 10 }}>
          <div style={{ padding: 13 }}>
            {MODELS.map(m => (
              <div key={m.id} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                  <div style={{ width: 6, height: 6, borderRadius: 9999, background: m.color }} />
                  <span style={{ fontFamily: font.mono, fontSize: 11, fontWeight: 600, color: m.color }}>{m.name}</span>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  {[1, 2, 3, 4].map(r => (
                    <span key={r} style={{ fontFamily: font.mono, fontSize: 10, color: T.textMuted, background: T.surfaceRaised, borderRadius: 4, padding: "2px 6px" }}>#{r}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// STAGE 3 — Council Synthesis
// ═══════════════════════════════════════════════════════════════

function Stage3Panel() {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <MonoLabel color={STAGE[3].color}>{STAGE[3].label} — {STAGE[3].name}</MonoLabel>
        <Tag label="Claude Sonnet 4" color={T.cyan} />
      </div>

      {/* Verdict card */}
      <Card accent={T.cyan}>
        <div style={{ padding: "13px 16px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9999, background: `${T.cyan}14`, border: `2px solid ${T.cyan}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontFamily: font.mono, fontSize: 11, fontWeight: 700, color: T.cyan }}>C</span>
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>Claude Sonnet 4</div>
            <span style={{ fontFamily: font.mono, fontSize: 10, color: T.textMuted }}>CHAIRMAN SYNTHESIS</span>
          </div>
        </div>

        {/* Thinking */}
        <details style={{ margin: "13px 16px 0", background: `${T.purple}08`, borderRadius: 6, borderLeft: `2px solid ${T.purple}` }}>
          <summary style={{ padding: "8px 13px", cursor: "pointer", fontFamily: font.mono, fontSize: 11, color: T.purple }}>{IC.brain} Synthesis Reasoning</summary>
          <div style={{ padding: "8px 13px", fontFamily: font.mono, fontSize: 11, color: T.textMuted, lineHeight: 1.6 }}>
            Analyzing all concepts across originality, market fit, execution potential, and emotional resonance. SoundSphere shows strongest brand identity coherence...
          </div>
        </details>

        {/* Verdict body */}
        <div style={{ padding: 16 }}>
          <p style={{ fontSize: 14, color: T.text, lineHeight: 1.7, margin: "0 0 13px" }}>
            After evaluating all submitted concepts across multiple criteria, <strong>SoundSphere Elite</strong> emerges as the clear winner with exceptional brand coherence and market positioning.
          </p>

          {/* Key findings */}
          <MonoLabel icon={IC.check} color={T.green}>Key Findings</MonoLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
            {["Strongest emotional resonance across all evaluators", "Clearest product-market fit for premium segment", "Most cohesive visual identity concept", "Best tagline recall score"].map((finding, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: T.textSoft }}>
                <span style={{ color: T.green, fontSize: 12 }}>{IC.check}</span>
                {finding}
              </div>
            ))}
          </div>

          {/* Final ranking */}
          <MonoLabel icon={IC.chart} color={T.textMuted}>Final Ranking</MonoLabel>
          <div style={{ display: "flex", gap: 8 }}>
            {["SoundSphere", "AudioVault", "FreqWave", "DecibelX"].map((name, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 10px", background: T.surfaceRaised, borderRadius: 6, borderLeft: `2px solid ${i === 0 ? T.gold : T.textMuted}` }}>
                <span style={{ fontFamily: font.mono, fontSize: 10, fontWeight: 700, color: i === 0 ? T.gold : T.textMuted }}>#{i + 1}</span>
                <span style={{ fontSize: 11, color: i === 0 ? T.text : T.textSoft }}>{name}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// LOADING PANEL
// ═══════════════════════════════════════════════════════════════

function LoadingPanel() {
  const [phase, setPhase] = useState(1);
  const phases = [
    { n: 1, label: "Generating", desc: "Models producing responses" },
    { n: 2, label: "Evaluating", desc: "Peer ranking in progress" },
    { n: 3, label: "Synthesizing", desc: "Chairman creating verdict" },
  ];

  return (
    <div>
      <MonoLabel icon={IC.bolt} color={T.flame}>Loading States</MonoLabel>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {phases.map(p => (
          <button key={p.n} onClick={() => setPhase(p.n)} style={{ padding: "6px 13px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 600, background: phase === p.n ? `${T.flame}14` : T.surfaceRaised, color: phase === p.n ? T.flame : T.textMuted }}>{p.label}</button>
        ))}
      </div>

      {/* Skeleton cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
        {/* Stage indicator */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: 9999, background: STAGE[phase]?.color || T.green }} />
          <span style={{ fontFamily: font.mono, fontSize: 11, color: STAGE[phase]?.color || T.green }}>{phases[phase - 1].label}...</span>
          <span style={{ fontSize: 12, color: T.textMuted }}>{phases[phase - 1].desc}</span>
        </div>

        {/* Skeleton response */}
        {[1, 2, 3].map(i => (
          <Card key={i} accent={T.border}>
            <div style={{ padding: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 13 }}>
                <div style={{ width: 28, height: 28, borderRadius: 9999, background: T.surfaceRaised }} />
                <div>
                  <div style={{ width: 120, height: 12, background: T.surfaceRaised, borderRadius: 4, marginBottom: 4 }} />
                  <div style={{ width: 80, height: 8, background: T.surfaceRaised, borderRadius: 4 }} />
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{ width: "100%", height: 8, background: T.surfaceRaised, borderRadius: 4 }} />
                <div style={{ width: "85%", height: 8, background: T.surfaceRaised, borderRadius: 4 }} />
                <div style={{ width: "60%", height: 8, background: T.surfaceRaised, borderRadius: 4 }} />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// LIVE PREVIEW — Timeline of all 3 stages
// ═══════════════════════════════════════════════════════════════

function LivePreview() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {/* Timeline connector */}
      {[1, 2, 3].map(stageNum => (
        <div key={stageNum}>
          {/* Stage dot + label */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <div style={{ width: 10, height: 10, borderRadius: 9999, background: STAGE[stageNum].color, flexShrink: 0 }} />
            <span style={{ fontFamily: font.mono, fontSize: 10, fontWeight: 600, color: STAGE[stageNum].color, textTransform: "uppercase", letterSpacing: "0.12em" }}>{STAGE[stageNum].label}</span>
            <span style={{ fontSize: 12, color: T.textSoft }}>{STAGE[stageNum].name}</span>
            <Tag label="COMPLETE" color={T.green} />
          </div>

          {/* Stage summary card */}
          <Card accent={STAGE[stageNum].color} style={{ marginLeft: 5, marginBottom: stageNum < 3 ? 0 : 0 }}>
            <div style={{ padding: 13 }}>
              {stageNum === 1 && <span style={{ fontSize: 12, color: T.textSoft }}>4 models responded · Best: Claude Sonnet 4 (2,847 tokens)</span>}
              {stageNum === 2 && <span style={{ fontSize: 12, color: T.textSoft }}>Consensus: Claude Sonnet 4 #1 (avg rank 1.33) → GPT-4o #2</span>}
              {stageNum === 3 && <span style={{ fontSize: 12, color: T.textSoft }}>Winner: SoundSphere Elite · Chairman: Claude Sonnet 4</span>}
            </div>
          </Card>

          {/* Connector line */}
          {stageNum < 3 && (
            <div style={{ marginLeft: 5, width: 1, height: 21, background: T.border, marginTop: 0, marginBottom: 0 }} />
          )}
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// AUDIT PANEL
// ═══════════════════════════════════════════════════════════════

const AUDIT_ITEMS = [
  { id: "S1-01", sev: "P0", issue: "Scrollbar uses hardcoded rgba — invisible in light mode", fix: "Use token var(--border-subtle)" },
  { id: "S1-02", sev: "P1", issue: "Stage dot glow washes out on white background", fix: "Reduce alpha + add border fallback" },
  { id: "S2-01", sev: "P1", issue: "Leaderboard border barely visible in light", fix: "Bump alpha to 0.3 in light mode" },
  { id: "S3-01", sev: "P0", issue: "Verdict body uses color: #fff — invisible on light bg", fix: "Use var(--text-primary)" },
  { id: "S3-02", sev: "P2", issue: "Scale-in animation has no reduced-motion fallback", fix: "Add @media (prefers-reduced-motion)" },
];

function AuditPanel() {
  const sevColor = { P0: T.red, P1: T.amber, P2: T.textMuted };
  return (
    <div>
      <MonoLabel icon={IC.warn} color={T.red}>Light Mode Audit</MonoLabel>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {AUDIT_ITEMS.map(item => (
          <Card key={item.id} accent={sevColor[item.sev]}>
            <div style={{ padding: "10px 13px", display: "flex", alignItems: "flex-start", gap: 10 }}>
              <Tag label={item.sev} color={sevColor[item.sev]} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, color: T.text, marginBottom: 4 }}>
                  <span style={{ fontFamily: font.mono, fontSize: 10, color: T.textMuted }}>{item.id}</span> · {item.issue}
                </div>
                <div style={{ fontSize: 11, color: T.green }}>Fix: {item.fix}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// TAB SYSTEM + EXPORT
// ═══════════════════════════════════════════════════════════════

const TABS = [
  { key: "live", label: "Live Preview" },
  { key: "stage1", label: "Stage 1" },
  { key: "stage2", label: "Stage 2" },
  { key: "stage3", label: "Stage 3" },
  { key: "loading", label: "Loading" },
  { key: "audit", label: "Audit" },
];

export default function GCV4CouncilStages() {
  const [activeTab, setActiveTab] = useState("live");
  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.text, fontFamily: font.body, padding: "21px 21px" }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 21 }}>
          <div style={{ fontFamily: font.mono, fontSize: 10, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 8 }}>Genesis Chamber V4 — LLM Council Stages</div>
          <div style={{ height: 1, background: T.flame, opacity: 0.15 }} />
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 21, flexWrap: "wrap", padding: 4, background: T.surface, borderRadius: 8 }}>
          {TABS.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
              padding: "7px 13px", borderRadius: 6, border: "none", cursor: "pointer",
              fontSize: 11, fontWeight: 600, fontFamily: font.body,
              background: activeTab === tab.key ? T.surfaceRaised : "transparent",
              color: activeTab === tab.key ? T.text : T.textMuted,
            }}>{tab.label}</button>
          ))}
        </div>

        {/* Content */}
        <div style={{ padding: 21, background: T.surface, borderRadius: 8 }}>
          {activeTab === "live" && <LivePreview />}
          {activeTab === "stage1" && <Stage1Panel />}
          {activeTab === "stage2" && <Stage2Panel />}
          {activeTab === "stage3" && <Stage3Panel />}
          {activeTab === "loading" && <LoadingPanel />}
          {activeTab === "audit" && <AuditPanel />}
        </div>
      </div>
    </div>
  );
}
