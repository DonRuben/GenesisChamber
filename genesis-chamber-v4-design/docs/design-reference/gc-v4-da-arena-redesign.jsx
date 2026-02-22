import { useState } from "react";

// ─────────────────────────────────────────────────────────
// GENESIS CHAMBER V4 · DA ARENA — Courtroom Layout
// Prosecution (left) vs Defense (right) + Verdict Bar (bottom)
// Design: Tobias van Schneider — Editorial, flat, typographic
// ─────────────────────────────────────────────────────────

const s24 = { display: "inline-block", verticalAlign: "-0.125em" };
const icon = (paths, filled) => (
  <svg width="1em" height="1em" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"}
    stroke={filled ? "none" : "currentColor"} strokeWidth="1.5"
    strokeLinecap="round" strokeLinejoin="round" style={s24}>{paths}</svg>
);
const IC = {
  swords:     icon(<><path d="M4 20l7-7M20 20l-7-7"/><path d="M4 4l5 5M20 4l-5 5"/><circle cx="12" cy="12" r="2.5"/></>),
  skull:      icon(<><circle cx="12" cy="10" r="6"/><path d="M10 21v-5M14 21v-5M8 19h8"/></>),
  shield:     icon(<path d="M12 3L4 6.5v6c0 5.25 3.5 10 8 11.5 4.5-1.5 8-6.25 8-11.5v-6L12 3z"/>),
  star:       icon(<path d="M12 3l3 6 6.6 1-4.8 4.7 1.1 6.3L12 17.5 6.1 21l1.1-6.3L2.4 10 9 9z"/>, true),
  arrowLeft:  icon(<><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></>),
  arrowRight: icon(<><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></>),
  chevDown:   icon(<path d="M6 9l6 6 6-6"/>),
  chevUp:     icon(<path d="M18 15l-6-6-6 6"/>),
  chart:      icon(<><path d="M4 20h17"/><rect x="6.5" y="11" width="2.5" height="9" rx="0.5" fill="currentColor"/><rect x="10.75" y="6" width="2.5" height="14" rx="0.5" fill="currentColor"/><rect x="15" y="3" width="2.5" height="17" rx="0.5" fill="currentColor"/></>),
  award:      icon(<><circle cx="12" cy="8" r="7"/><path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12"/></>),
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

// ── DA Personas ──
const PERSONAS = {
  skeptic: { name: "The Skeptic", color: T.cyan },
  contrarian: { name: "The Contrarian", color: T.magenta },
  realist: { name: "The Realist", color: T.gold },
  purist: { name: "The Purist", color: T.purple },
};

// ── Rating Config ──
const RATINGS = [
  { key: "brilliant", label: "Brilliant", color: T.gold, desc: "DA pushed concept to greatness" },
  { key: "effective", label: "Effective", color: T.green, desc: "Useful challenge, good outcome" },
  { key: "weak", label: "Weak", color: T.textMuted, desc: "Challenge lacked depth" },
  { key: "unfair", label: "Unfair", color: T.magenta, desc: "Attack was unreasonable" },
];

// ── Full Structured Critique Data ──
const INTERACTIONS = [
  {
    id: 1, round: 1,
    concept: { name: "Phoenix Rising", persona: "Maya Chen", model: "Claude Sonnet", modelColor: T.flame },
    attack: {
      da_score: 8, severity: 4, persona: "skeptic",
      fatal_flaw: "Over-reliance on mythological symbolism limits audience connection to a niche demographic. The phoenix metaphor is culturally exclusive.",
      weaknesses: ["Too abstract for mass market", "Mythological gatekeeping", "No concrete value proposition"],
      one_change: "Ground the phoenix metaphor in universal human experience of renewal, not Greek mythology.",
    },
    defense: {
      text: "The phoenix transcends cultures — it appears in Chinese, Egyptian, Greek, and Hindu traditions. It's not niche, it's universally understood as rebirth. Our execution uses the emotional core, not the academic reference.",
      submitted: true,
    },
    verdict: { status: "accepted_partial", label: "Defense Accepted — Partially", details: "Cultural breadth acknowledged, but execution still leans abstract. Needs concrete touchpoints.", revised_score: 7 },
    rating: "effective", reviewed: true,
  },
  {
    id: 2, round: 1,
    concept: { name: "Urban Pulse", persona: "Marcus Rivera", model: "GPT-4o", modelColor: T.green },
    attack: {
      da_score: 6, severity: 3, persona: "contrarian",
      fatal_flaw: "The heartbeat-city mashup is a design cliché used by hundreds of startups. Zero differentiation.",
      weaknesses: ["Extremely common visual trope", "Forgettable in portfolio context", "No emotional depth beyond 'city = alive'"],
      one_change: "Find the arrhythmia — what makes THIS city's pulse irregular, broken, or beautiful?",
    },
    defense: { text: null, submitted: false },
    verdict: { status: "no_defense", label: "No Defense Submitted", details: null, revised_score: 5 },
    rating: null, reviewed: false,
  },
  {
    id: 3, round: 2,
    concept: { name: "Phoenix Rising", persona: "Maya Chen", model: "Claude Sonnet", modelColor: T.flame },
    attack: {
      da_score: 9, severity: 5, persona: "realist",
      fatal_flaw: "V2 evolution is incrementally better but still hasn't solved the tangibility problem. The audience can't FEEL digital ashes.",
      weaknesses: ["Sensory gap: fire on screen is not fire felt", "Animation dependency for concept integrity", "Loses meaning in static applications"],
      one_change: "Make it work in a single still frame. If the concept needs motion to make sense, it's not strong enough.",
    },
    defense: {
      text: "A still frame of a phoenix mid-rise is already one of the most powerful images in visual history. The Criterion Collection built a logo on it. We don't need motion — we need composition.",
      submitted: true,
    },
    verdict: { status: "accepted_strong", label: "Defense Accepted — Strong", details: "Excellent reframe. The single-frame challenge was met convincingly.", revised_score: 8 },
    rating: "brilliant", reviewed: true,
  },
  {
    id: 4, round: 2,
    concept: { name: "Zen Garden", persona: "Dr. Sarah Kim", model: "DeepSeek R1", modelColor: T.purple },
    attack: {
      da_score: 4, severity: 2, persona: "purist",
      fatal_flaw: "Zen branding is the pumpkin spice of design — predictably inoffensive and terminally boring.",
      weaknesses: ["Zen = safe = forgettable", "Contradicts urgency-driven tech market", "Passive aesthetic repels action-oriented buyers"],
      one_change: "Inject danger. Real zen practice involves discomfort. Show the rake dragging through stone, not the finished pattern.",
    },
    defense: {
      text: "The contradiction IS the brand. Technology that promises calm in chaos is the ultimate premium positioning. Apple proved this. We're not selling zen — we're selling the tension between chaos and order.",
      submitted: true,
    },
    verdict: { status: "accepted_partial", label: "Defense Accepted — Partially", details: "The chaos/order tension is valid but needs visual proof. Current execution is too peaceful.", revised_score: 5 },
    rating: null, reviewed: false,
  },
  {
    id: 5, round: 3,
    concept: { name: "Neon Dreams", persona: "Alex Thompson", model: "Gemini Flash", modelColor: "#3B82F6" },
    attack: {
      da_score: 3, severity: 5, persona: "contrarian",
      fatal_flaw: "This is an AI image prompt, not a brand concept. 'Neon' + 'Dreams' + 'Retro' = the most generated aesthetic in AI history. Zero creative authorship.",
      weaknesses: ["Indistinguishable from AI slop", "No brand strategy underneath", "Aesthetic without substance", "Will date in 6 months"],
      one_change: "Delete it. Start over. This isn't worth evolving.",
    },
    defense: {
      text: "The retro-future aesthetic resonates with Gen Z nostalgia for eras they never lived. The market data supports this trend. And the execution quality exceeds typical AI output by incorporating hand-drawn elements in the typography.",
      submitted: true,
    },
    verdict: { status: "insufficient", label: "Defense Insufficient", details: "Trend data doesn't justify creative mediocrity. The hand-drawn claim needs visual evidence.", revised_score: 3 },
    rating: "unfair", reviewed: true,
  },
];

// ── Stats ──
function computeStats(inters, userRatings) {
  const total = inters.length;
  const defended = inters.filter(i => i.defense.submitted).length;
  const avgSev = inters.reduce((s, i) => s + i.attack.severity, 0) / total;
  const strong = inters.filter(i => i.verdict.status === "accepted_strong").length;
  const partial = inters.filter(i => i.verdict.status === "accepted_partial").length;
  const insuf = inters.filter(i => i.verdict.status === "insufficient" || i.verdict.status === "no_defense").length;
  const concepts = [...new Set(inters.map(i => i.concept.name))];
  const conceptScores = concepts.map(name => {
    const ci = inters.filter(i => i.concept.name === name);
    const avg = ci.reduce((s, i) => s + i.verdict.revised_score, 0) / ci.length;
    return { name, avg: Math.round(avg * 10) / 10, count: ci.length, model: ci[0].concept.model, modelColor: ci[0].concept.modelColor };
  }).sort((a, b) => b.avg - a.avg);
  const rounds = [...new Set(inters.map(i => i.round))].sort();
  const threat = Math.round(100 - (inters.reduce((s, i) => s + i.verdict.revised_score, 0) / total) * 10);
  const rated = Object.keys(userRatings).length + inters.filter(i => i.rating && !userRatings[i.id]).length;
  return { total, defended, avgSev, strong, partial, insuf, conceptScores, rounds, threat, rated, unrated: total - rated };
}

// ── Shared ──
function Tag({ children, color = T.cyan }) {
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 4, fontSize: 9, fontFamily: font.mono, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.12em", color, background: `${color}1a` }}>{children}</span>;
}

function Dots({ n, max = 5 }) {
  return (
    <div style={{ display: "flex", gap: 3 }}>
      {Array.from({ length: max }, (_, i) => (
        <div key={i} style={{ width: 6, height: 6, borderRadius: 3, background: i < n ? (n >= 4 ? T.magenta : n >= 3 ? T.gold : T.textMuted) : T.surfaceRaised }}/>
      ))}
    </div>
  );
}

function ScoreRing({ score, color, size = 64, sw = 4 }) {
  const r = (size - sw) / 2, circ = 2 * Math.PI * r, offset = circ * (1 - score / 100);
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={T.surfaceRaised} strokeWidth={sw}/>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={sw} strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.55s cubic-bezier(0.16,1,0.3,1)" }}/>
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: Math.round(size * 0.28), fontFamily: font.mono, fontWeight: 700, color }}>{score}</div>
    </div>
  );
}

function VerdictBadge({ status }) {
  const m = { accepted_strong: { l: "Strong Defense", c: T.green }, accepted_partial: { l: "Partial Accept", c: T.gold }, insufficient: { l: "Insufficient", c: T.magenta }, no_defense: { l: "No Defense", c: T.textMuted } };
  const v = m[status] || m.no_defense;
  return <Tag color={v.c}>{v.l}</Tag>;
}

function MonoLabel({ children, color = T.textMuted, style: sx }) {
  return <div style={{ fontSize: 9, fontFamily: font.mono, fontWeight: 500, color, textTransform: "uppercase", letterSpacing: "0.12em", ...sx }}>{children}</div>;
}

function ScoreChange({ from, to }) {
  const c = to > from ? T.green : to < from ? T.magenta : T.textMuted;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span style={{ fontSize: 16, fontFamily: font.mono, fontWeight: 700, color: from >= 7 ? T.magenta : T.gold }}>{from}</span>
      <span style={{ fontSize: 10, color: T.textMuted }}>→</span>
      <span style={{ fontSize: 16, fontFamily: font.mono, fontWeight: 700, color: to >= 7 ? T.green : to >= 4 ? T.gold : T.magenta }}>{to}</span>
    </div>
  );
}

function AggressionMeter({ severity }) {
  const levels = ["Gentle", "Moderate", "Sharp", "Fierce", "Lethal"];
  const lv = Math.min(Math.max(Math.round(severity) - 1, 0), 4);
  const colors = [T.green, T.cyan, T.gold, T.flame, T.magenta];
  return (
    <div>
      <MonoLabel style={{ marginBottom: 8 }}>AGGRESSION</MonoLabel>
      <div style={{ display: "flex", gap: 3, marginBottom: 6 }}>
        {levels.map((_, i) => <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= lv ? colors[lv] : T.surfaceRaised, transition: "background 0.2s" }}/>)}
      </div>
      <span style={{ fontSize: 11, fontFamily: font.mono, color: colors[lv], fontWeight: 600 }}>{levels[lv]}</span>
    </div>
  );
}

function RoundTimeline({ rounds, activeRound, onSelect, interactions }) {
  return (
    <div style={{ display: "flex", gap: 2, marginBottom: 24 }}>
      {rounds.map(r => {
        const ct = interactions.filter(i => i.round === r).length;
        const active = activeRound === r;
        return (
          <button key={r} onClick={() => onSelect(active ? null : r)} style={{
            flex: 1, padding: "10px 14px", display: "flex", flexDirection: "column", gap: 4,
            background: active || !activeRound ? T.surface : "transparent",
            border: `1px solid ${active ? T.borderHover : T.border}`, borderRadius: 6,
            borderLeft: `2px solid ${active ? T.magenta : "transparent"}`,
            cursor: "pointer", transition: "all 0.13s",
          }}>
            <MonoLabel color={active ? T.magenta : T.textMuted}>Round {r}</MonoLabel>
            <span style={{ fontSize: 11, fontFamily: font.mono, color: T.textSoft }}>{ct} challenge{ct !== 1 ? "s" : ""}</span>
          </button>
        );
      })}
    </div>
  );
}

function RatingButtons({ current, onRate }) {
  return (
    <div>
      <MonoLabel style={{ marginBottom: 10 }}>RATE THIS CHALLENGE</MonoLabel>
      <div style={{ display: "flex", gap: 6 }}>
        {RATINGS.map(r => (
          <button key={r.key} onClick={() => onRate(r.key)} title={r.desc} style={{
            flex: 1, padding: "10px 8px", display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
            background: current === r.key ? `${r.color}1a` : "transparent",
            border: `1px solid ${current === r.key ? r.color : T.border}`, borderRadius: 6,
            borderLeft: `2px solid ${current === r.key ? r.color : "transparent"}`,
            cursor: "pointer", transition: "all 0.13s",
          }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: current === r.key ? r.color : T.textSoft }}>{r.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// COURTROOM: Prosecution Panel (Left Side)
// ─────────────────────────────────────────────────────────
function ProsecutionPanel({ attack }) {
  const persona = PERSONAS[attack.persona] || PERSONAS.skeptic;
  return (
    <div style={{
      flex: 1, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8,
      borderLeft: `2px solid ${T.magenta}`, padding: 24, display: "flex", flexDirection: "column",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 16, color: T.magenta }}>{IC.skull}</span>
          <MonoLabel color={T.magenta}>PROSECUTION</MonoLabel>
        </div>
        <span style={{ fontSize: 22, fontFamily: font.mono, fontWeight: 700, color: attack.da_score >= 7 ? T.magenta : attack.da_score >= 4 ? T.gold : T.green }}>
          {attack.da_score}<span style={{ fontSize: 11, color: T.textMuted }}>/10</span>
        </span>
      </div>

      <MonoLabel color={T.magenta} style={{ marginBottom: 6 }}>FATAL FLAW</MonoLabel>
      <p style={{ fontSize: 14, color: T.text, lineHeight: 1.7, margin: "0 0 20px", fontWeight: 500 }}>{attack.fatal_flaw}</p>

      <MonoLabel style={{ marginBottom: 8 }}>IDENTIFIED WEAKNESSES</MonoLabel>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 20 }}>
        {attack.weaknesses.map((w, i) => (
          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13, color: T.textSoft, lineHeight: 1.5 }}>
            <span style={{ color: T.magenta, flexShrink: 0, marginTop: 4, fontSize: 6 }}>●</span>{w}
          </div>
        ))}
      </div>

      <MonoLabel color={T.gold} style={{ marginBottom: 6 }}>ONE CHANGE TO FIX IT</MonoLabel>
      <p style={{ fontSize: 13, color: T.gold, lineHeight: 1.6, margin: "0 0 20px", fontStyle: "italic" }}>"{attack.one_change}"</p>

      <div style={{ marginTop: "auto", paddingTop: 16, borderTop: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 6, height: 6, borderRadius: 3, background: persona.color }}/>
          <span style={{ fontSize: 11, fontFamily: font.mono, color: T.textMuted }}>{persona.name}</span>
        </div>
        <Dots n={attack.severity}/>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// COURTROOM: Defense Panel (Right Side)
// ─────────────────────────────────────────────────────────
function DefensePanel({ defense, concept, verdict, currentRating, onRate }) {
  return (
    <div style={{
      flex: 1, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8,
      borderLeft: `2px solid ${defense.submitted ? T.cyan : T.textMuted}`, padding: 24,
      display: "flex", flexDirection: "column",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 16, color: T.cyan }}>{IC.shield}</span>
          <MonoLabel color={T.cyan}>DEFENSE</MonoLabel>
        </div>
        <VerdictBadge status={verdict.status}/>
      </div>

      {defense.submitted ? (
        <p style={{ fontSize: 14, color: T.text, lineHeight: 1.7, margin: "0 0 20px" }}>{defense.text}</p>
      ) : (
        <div style={{ padding: "28px 20px", background: T.surfaceRaised, borderRadius: 6, textAlign: "center", marginBottom: 20 }}>
          <span style={{ fontSize: 13, color: T.textMuted, fontStyle: "italic" }}>No defense submitted for this challenge.</span>
        </div>
      )}

      {verdict.details && (
        <div style={{ marginBottom: 20 }}>
          <MonoLabel style={{ marginBottom: 6 }}>VERDICT NOTES</MonoLabel>
          <p style={{ fontSize: 13, color: T.textSoft, lineHeight: 1.6, margin: 0 }}>{verdict.details}</p>
        </div>
      )}

      <div style={{ marginBottom: 20 }}>
        <RatingButtons current={currentRating} onRate={onRate}/>
      </div>

      <div style={{ marginTop: "auto", paddingTop: 16, borderTop: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 6, height: 6, borderRadius: 3, background: concept.modelColor }}/>
          <span style={{ fontSize: 11, fontFamily: font.mono, color: T.textMuted }}>{concept.model} · {concept.persona}</span>
        </div>
        <span style={{ fontSize: 18, fontFamily: font.mono, fontWeight: 700, color: verdict.revised_score >= 7 ? T.green : verdict.revised_score >= 4 ? T.gold : T.magenta }}>
          {verdict.revised_score}<span style={{ fontSize: 11, color: T.textMuted }}>/10</span>
        </span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// COURTROOM: Verdict Bar (Full Width Bottom)
// ─────────────────────────────────────────────────────────
function VerdictBar({ attack, verdict }) {
  const c = verdict.status === "accepted_strong" ? T.green : verdict.status === "accepted_partial" ? T.gold : T.magenta;
  return (
    <div style={{
      background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8,
      borderLeft: `2px solid ${c}`, padding: "16px 24px",
      display: "flex", alignItems: "center", gap: 20,
    }}>
      <span style={{ fontSize: 14, color: T.gold }}>{IC.award}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 2 }}>{verdict.label}</div>
        {verdict.details && <div style={{ fontSize: 12, color: T.textSoft, lineHeight: 1.5 }}>{verdict.details}</div>}
      </div>
      <ScoreChange from={attack.da_score} to={verdict.revised_score}/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Sidebar: Challenge List Item
// ─────────────────────────────────────────────────────────
function ListItem({ inter, active, onClick }) {
  const { attack: a, concept: c, verdict: v } = inter;
  return (
    <div onClick={onClick} style={{
      padding: "14px 16px", cursor: "pointer",
      background: active ? T.surfaceRaised : "transparent",
      borderLeft: `2px solid ${active ? T.magenta : "transparent"}`,
      transition: "all 0.13s",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: T.text, lineHeight: 1.4, flex: 1, marginRight: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</div>
        <Dots n={a.severity}/>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 6, height: 6, borderRadius: 3, background: c.modelColor, flexShrink: 0 }}/>
        <span style={{ fontSize: 11, fontFamily: font.mono, color: T.textMuted }}>{c.model}</span>
        <span style={{ fontSize: 11, color: T.textMuted }}>·</span>
        <span style={{ fontSize: 9, fontFamily: font.mono, color: T.textMuted, letterSpacing: "0.08em" }}>R{inter.round}</span>
        <span style={{ flex: 1 }}/>
        <span style={{ fontSize: 12, fontFamily: font.mono, fontWeight: 600, color: v.revised_score >= 7 ? T.green : v.revised_score >= 4 ? T.gold : T.magenta }}>{a.da_score}→{v.revised_score}</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Training Report (preserved from original)
// ─────────────────────────────────────────────────────────
function TrainingReport({ stats, interactions, ratings }) {
  return (
    <div style={{ padding: "36px 28px", maxWidth: 900, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 28, marginBottom: 36 }}>
        <ScoreRing score={stats.threat} color={T.magenta} size={88} sw={5}/>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: 24, fontFamily: font.display, fontWeight: 700, color: T.text, margin: "0 0 6px", letterSpacing: "-0.03em" }}>Training Report</h2>
          <p style={{ fontSize: 13, color: T.textMuted, margin: "0 0 14px", lineHeight: 1.6 }}>{stats.total} challenges across {stats.rounds.length} rounds. {stats.defended} of {stats.total} defended.</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Tag color={T.green}>{stats.strong} STRONG</Tag>
            <Tag color={T.gold}>{stats.partial} PARTIAL</Tag>
            <Tag color={T.magenta}>{stats.insuf} INSUFFICIENT</Tag>
            <Tag color={T.textMuted}>{stats.unrated} UNRATED</Tag>
          </div>
        </div>
      </div>

      <MonoLabel style={{ marginBottom: 12 }}>KEY METRICS</MonoLabel>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 32 }}>
        {[
          { l: "Avg Severity", v: stats.avgSev.toFixed(1), sub: "/5", c: T.magenta },
          { l: "Threat Score", v: stats.threat, sub: "%", c: T.magenta },
          { l: "Defense Rate", v: Math.round(stats.defended / stats.total * 100), sub: "%", c: T.green },
          { l: "Review Rate", v: Math.round(stats.rated / stats.total * 100), sub: "%", c: T.cyan },
        ].map(m => (
          <div key={m.l} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, borderLeft: `2px solid ${m.c}`, padding: "18px 16px" }}>
            <MonoLabel style={{ marginBottom: 8 }}>{m.l}</MonoLabel>
            <div style={{ fontSize: 24, fontFamily: font.mono, fontWeight: 700, color: m.c }}>{m.v}<span style={{ fontSize: 12, color: T.textMuted }}>{m.sub}</span></div>
          </div>
        ))}
      </div>

      <MonoLabel style={{ marginBottom: 12 }}>CONCEPT RESILIENCE</MonoLabel>
      <div style={{ display: "flex", gap: 10, marginBottom: 32, flexWrap: "wrap" }}>
        {stats.conceptScores.map((c, i) => (
          <div key={c.name} style={{ flex: "1 1 200px", background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, borderLeft: `2px solid ${c.modelColor}`, padding: "18px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
              {i === 0 && <span style={{ fontSize: 12, color: T.gold }}>{IC.award}</span>}
              <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{c.name}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
              <div style={{ width: 6, height: 6, borderRadius: 3, background: c.modelColor }}/>
              <span style={{ fontSize: 10, fontFamily: font.mono, color: T.textMuted }}>{c.model}</span>
            </div>
            <div style={{ marginBottom: 6 }}>
              <div style={{ height: 4, borderRadius: 2, background: T.surfaceRaised, overflow: "hidden" }}>
                <div style={{ height: "100%", borderRadius: 2, background: c.modelColor, width: `${c.avg * 10}%`, transition: "width 0.4s" }}/>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 20, fontFamily: font.mono, fontWeight: 700, color: c.modelColor }}>{c.avg}</span>
              <span style={{ fontSize: 10, fontFamily: font.mono, color: T.textMuted, alignSelf: "flex-end" }}>{c.count} challenge{c.count !== 1 ? "s" : ""}</span>
            </div>
          </div>
        ))}
      </div>

      <MonoLabel style={{ marginBottom: 12 }}>ALL INTERACTIONS</MonoLabel>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {interactions.map(inter => {
          const r = ratings[inter.id] ?? inter.rating;
          const rC = RATINGS.find(rt => rt.key === r);
          return (
            <div key={inter.id} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, borderLeft: `2px solid ${inter.attack.severity >= 4 ? T.magenta : T.textMuted}`, padding: "18px 20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Tag color={T.magenta}>R{inter.round}</Tag>
                  <span style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{inter.concept.name}</span>
                </div>
                <Dots n={inter.attack.severity}/>
              </div>
              <div style={{ fontSize: 12, color: T.textSoft, lineHeight: 1.5, marginBottom: 10, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{inter.attack.fatal_flaw}</div>
              <div style={{ height: 1, background: T.border, margin: "10px 0" }}/>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 6, height: 6, borderRadius: 3, background: inter.concept.modelColor }}/>
                  <span style={{ fontSize: 11, fontFamily: font.mono, color: T.textMuted }}>{inter.concept.model}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <VerdictBadge status={inter.verdict.status}/>
                  <span style={{ fontSize: 14, fontFamily: font.mono, fontWeight: 700, color: inter.verdict.revised_score >= 7 ? T.green : inter.verdict.revised_score >= 4 ? T.gold : T.magenta }}>{inter.verdict.revised_score}</span>
                  {rC && <span style={{ fontSize: 10, color: rC.color }}>● {rC.label}</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// MAIN EXPORT: DA Arena — Courtroom Layout
// Split panel: Prosecution (left) | Defense (right)
// Verdict Bar (bottom full-width)
// No card flipping — simultaneous visibility
// ─────────────────────────────────────────────────────────
export default function DAArenaCourtroom() {
  const [idx, setIdx] = useState(0);
  const [ratings, setRatings] = useState({});
  const [view, setView] = useState("courtroom");
  const [roundFilter, setRoundFilter] = useState(null);

  const filtered = roundFilter ? INTERACTIONS.filter(i => i.round === roundFilter) : INTERACTIONS;
  const cur = filtered[idx] || INTERACTIONS[0];
  const total = filtered.length;
  const stats = computeStats(INTERACTIONS, ratings);
  const currentRating = ratings[cur.id] ?? cur.rating;
  const rate = key => setRatings(p => ({ ...p, [cur.id]: key }));
  const go = d => { if ((d > 0 && idx < total - 1) || (d < 0 && idx > 0)) setIdx(i => i + d); };

  return (
    <div style={{ background: T.bg, minHeight: "100vh", fontFamily: font.body, color: T.text, WebkitFontSmoothing: "antialiased" }}>
      <style>{`@font-face { font-family: 'OmniPresent'; src: url('https://cdn.jsdelivr.net/gh/DonRuben/Hosting-Assets-Externally@main/Fonts/Font-%20OmniPresent%20Main/OmniPresent.woff') format('woff'); font-display: swap; }`}</style>

      {/* Header */}
      <div style={{ borderBottom: `1px solid ${T.border}`, padding: "14px 28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ fontSize: 20, color: T.magenta }}>{IC.swords}</span>
          <MonoLabel color={T.textMuted}>Devil's Advocate Arena</MonoLabel>
          <Tag color={T.magenta}>{INTERACTIONS.length} CHALLENGES</Tag>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {[{ k: "courtroom", l: "Courtroom" }, { k: "report", l: "Report" }].map(v => (
            <button key={v.k} onClick={() => { setView(v.k); setIdx(0); }} style={{
              padding: "7px 16px", borderRadius: 5, fontSize: 11, fontFamily: font.mono, fontWeight: 500,
              letterSpacing: "0.04em", textTransform: "uppercase", cursor: "pointer",
              background: view === v.k ? T.surfaceRaised : "transparent",
              color: view === v.k ? T.text : T.textMuted,
              border: `1px solid ${view === v.k ? T.borderHover : T.border}`,
              borderLeft: `2px solid ${view === v.k ? T.magenta : "transparent"}`,
              transition: "all 0.13s",
            }}>{v.l}</button>
          ))}
        </div>
      </div>

      {/* COURTROOM VIEW */}
      {view === "courtroom" && (
        <div style={{ display: "flex", minHeight: "calc(100vh - 53px)" }}>
          {/* Center: Courtroom */}
          <div style={{ flex: "1 1 60%", padding: "28px 32px", display: "flex", flexDirection: "column", overflowY: "auto" }}>
            <RoundTimeline rounds={stats.rounds} activeRound={roundFilter} onSelect={r => { setRoundFilter(r); setIdx(0); }} interactions={INTERACTIONS}/>

            {/* Nav */}
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
              <button onClick={() => go(-1)} disabled={idx === 0} style={{ background: "transparent", border: `1px solid ${T.border}`, borderRadius: 5, padding: "5px 10px", cursor: idx === 0 ? "not-allowed" : "pointer", color: idx === 0 ? T.textMuted : T.textSoft, fontSize: 15, display: "flex", alignItems: "center", opacity: idx === 0 ? 0.4 : 1 }}>{IC.arrowLeft}</button>
              <div style={{ flex: 1, textAlign: "center" }}>
                <MonoLabel style={{ marginBottom: 2 }}>CHALLENGE {idx + 1} OF {total}</MonoLabel>
                <div style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{cur.concept.name}<span style={{ color: T.textMuted, fontWeight: 400 }}> · {cur.concept.persona}</span></div>
              </div>
              <button onClick={() => go(1)} disabled={idx === total - 1} style={{ background: "transparent", border: `1px solid ${T.border}`, borderRadius: 5, padding: "5px 10px", cursor: idx === total - 1 ? "not-allowed" : "pointer", color: idx === total - 1 ? T.textMuted : T.textSoft, fontSize: 15, display: "flex", alignItems: "center", opacity: idx === total - 1 ? 0.4 : 1 }}>{IC.arrowRight}</button>
            </div>

            {/* Split: Prosecution | Defense */}
            <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
              <ProsecutionPanel attack={cur.attack}/>
              <DefensePanel defense={cur.defense} concept={cur.concept} verdict={cur.verdict} currentRating={currentRating} onRate={rate}/>
            </div>

            {/* Verdict Bar — full width bottom */}
            <VerdictBar attack={cur.attack} verdict={cur.verdict}/>
          </div>

          {/* Right Sidebar */}
          <div style={{ flex: "0 0 320px", borderLeft: `1px solid ${T.border}`, display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "24px 20px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", gap: 18 }}>
              <ScoreRing score={stats.threat} color={T.magenta} size={56}/>
              <div>
                <MonoLabel style={{ marginBottom: 4 }}>THREAT SCORE</MonoLabel>
                <div style={{ fontSize: 13, color: T.textSoft }}>{stats.strong} strong · {stats.partial} partial · {stats.insuf} insuf</div>
              </div>
            </div>
            <div style={{ padding: "16px 20px", borderBottom: `1px solid ${T.border}` }}>
              <AggressionMeter severity={stats.avgSev}/>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderBottom: `1px solid ${T.border}` }}>
              {[
                { l: "Defense Rate", v: `${Math.round(stats.defended / stats.total * 100)}%`, c: T.green },
                { l: "Top Concept", v: stats.conceptScores[0]?.name || "—", c: T.gold },
              ].map((s, i) => (
                <div key={s.l} style={{ padding: "14px 20px", borderRight: i === 0 ? `1px solid ${T.border}` : "none" }}>
                  <MonoLabel style={{ marginBottom: 4 }}>{s.l}</MonoLabel>
                  <div style={{ fontSize: 13, fontWeight: 600, color: s.c }}>{s.v}</div>
                </div>
              ))}
            </div>
            <div style={{ flex: 1, overflowY: "auto" }}>
              <div style={{ padding: "14px 20px 8px" }}><MonoLabel>ALL CHALLENGES</MonoLabel></div>
              {filtered.map((inter, i) => (
                <ListItem key={inter.id} inter={inter} active={i === idx} onClick={() => setIdx(i)}/>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* REPORT MODE */}
      {view === "report" && (
        <TrainingReport stats={stats} interactions={INTERACTIONS} ratings={ratings}/>
      )}
    </div>
  );
}
