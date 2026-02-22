import { useState } from "react";

// ─────────────────────────────────────────────────────────
// GENESIS CHAMBER V4 · DASHBOARD
// Design: Tobias van Schneider — Editorial, flat, typographic
// Icons: 24×24 Lucide-quality, 1.5px stroke, round caps
// Fonts: OmniPresent (display) + Inter (body) + JetBrains Mono (data)
// ─────────────────────────────────────────────────────────

// ── Icon System — 24×24, 1.5px stroke, currentColor ──
const s24 = { display: "inline-block", verticalAlign: "-0.125em" };
const icon = (paths, filled) => (
  <svg width="1em" height="1em" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"}
    stroke={filled ? "none" : "currentColor"} strokeWidth="1.5"
    strokeLinecap="round" strokeLinejoin="round" style={s24}>{paths}</svg>
);
const IC = {
  brain:      icon(<><path d="M12 3C7.5 3 4 7 4 11c0 3 1.8 5.5 4.2 6.6L8.5 21h7l.3-3.4C18.2 16.5 20 14 20 11c0-4-3.5-8-8-8z"/><path d="M9 11h6M12 8v6"/></>),
  bolt:       icon(<path d="M13 3L6 13h6l-1 8 7-10h-6l1-8z"/>, true),
  crown:      icon(<><path d="M4 18h16l-2.4-9.6L14 12l-2-7-2 7-3.6-3.6z"/><path d="M4 18v2h16v-2"/></>),
  swords:     icon(<><path d="M4 20l7-7M20 20l-7-7"/><path d="M4 4l5 5M20 4l-5 5"/><circle cx="12" cy="12" r="2.5"/></>),
  gallery:    icon(<><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="10" r="2"/><path d="M3 17l4.5-4.5 3.5 3.5 4.5-5.5L21 17"/></>),
  exportArrow:icon(<><path d="M5 16v3a1 1 0 001 1h12a1 1 0 001-1v-3"/><path d="M12 4v12"/><path d="M7 9l5-5 5 5"/></>),
  home:       icon(<><path d="M4 12.5L12 5l8 7.5"/><path d="M6 11v7a1 1 0 001 1h3.5v-4.5h3V19H17a1 1 0 001-1v-7"/></>),
  search:     icon(<><circle cx="10" cy="10" r="6"/><path d="M15.5 15.5l5 5"/></>),
  shield:     icon(<path d="M12 3L4 6.5v6c0 5.25 3.5 10 8 11.5 4.5-1.5 8-6.25 8-11.5v-6L12 3z"/>),
  flame:      icon(<path d="M12 3c0 3.6-4.8 6-4.8 10.8a6 6 0 0012 0c0-3-1.2-4.8-2.4-6 0 2.4-1.2 3.6-2.4 3.6s-2.4-2.4-2.4-6z"/>, true),
  star:       icon(<path d="M12 3l3 6 6.6 1-4.8 4.7 1.1 6.3L12 17.5 6.1 21l1.1-6.3L2.4 10 9 9z"/>, true),
  spark:      icon(<path d="M12 3l1.8 6.6L20 12l-6.2 3L12 21l-1.8-6L4 12l6.2-3z"/>, true),
  check:      icon(<path d="M5 12l5 5 9-9"/>),
  xClose:     icon(<><path d="M6 6l12 12"/><path d="M18 6L6 18"/></>),
  skull:      icon(<><circle cx="12" cy="10" r="6"/><circle cx="9.5" cy="9" r="2" fill="currentColor"/><circle cx="14.5" cy="9" r="2" fill="currentColor"/><path d="M9.5 13.5h5M10.5 21v-6M13.5 21v-6M8 19h8"/></>),
  advocate:   icon(<><path d="M5 10c0-4.8 3.5-7.2 7-7.2s7 2.4 7 7.2"/><path d="M3.5 7.5l3.5 2.5M20.5 7.5l-3.5 2.5"/><circle cx="9" cy="12" r="1.2" fill="currentColor"/><circle cx="15" cy="12" r="1.2" fill="currentColor"/><path d="M8.5 17c1.8 1.8 5.2 1.8 7 0"/></>),
  chart:      icon(<><path d="M4 20h17"/><rect x="6.5" y="11" width="2.5" height="9" rx="0.5" fill="currentColor"/><rect x="10.75" y="6" width="2.5" height="14" rx="0.5" fill="currentColor"/><rect x="15" y="3" width="2.5" height="17" rx="0.5" fill="currentColor"/></>),
  clipboard:  icon(<><path d="M8.5 4h7"/><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8.5 9h7M8.5 12.5h7M8.5 16h5"/></>),
  scale:      icon(<><path d="M12 3v17"/><path d="M4 7.5l8-2.5 8 2.5"/><path d="M4 7.5c-1.2 3.6 0 6 2.4 6h2.4c2.4 0 3.6-2.4 2.4-6"/><path d="M20 7.5c1.2 3.6 0 6-2.4 6h-2.4c-2.4 0-3.6-2.4-2.4-6"/><path d="M8.5 20h7"/></>),
  dove:       icon(<><path d="M6 19c2.4-4.8 6-4.8 8.4-2.4"/><path d="M9.6 12c-3.6-1.2-6 1.2-6 4.8"/><path d="M9.6 12c0-3.6 2.4-6 6-6s4.8 2.4 4.8 6c0 2.4-2.4 3.6-4.8 2.4"/></>),
  megaphone:  icon(<path d="M19 4v16l-6-3.6H6a1.5 1.5 0 01-1.5-1.5V9A1.5 1.5 0 016 7.5h7L19 4z"/>),
};

// ── Tokens ──
const T = {
  bg: "#111113", surface: "#18181B", surfaceRaised: "#1F1F23", surfaceHover: "#26262B",
  flame: "#F27123", cyan: "#00D9FF", gold: "#D4A853", magenta: "#E5375E",
  green: "#34D399", purple: "#8B5CF6", amber: "#F59E0B", red: "#EF4444",
  text: "#E8E6E3", textSoft: "#A1A1AA", textMuted: "#63636E",
  border: "rgba(255,255,255,0.06)", borderHover: "rgba(255,255,255,0.12)",
};
const font = {
  display: "'OmniPresent', 'Inter', system-ui, -apple-system, sans-serif",
  body: "'Inter', system-ui, -apple-system, sans-serif",
  mono: "'JetBrains Mono', 'SF Mono', Menlo, monospace",
};

// ── Stage Data ──
const stages = [
  { name: "Creation",  color: T.green, icon: IC.spark,    status: "complete" },
  { name: "Critique",  color: T.amber, icon: IC.bolt,     status: "complete" },
  { name: "DA Defense", color: T.red,  icon: IC.advocate,  status: "complete" },
  { name: "Synthesis", color: T.cyan,  icon: IC.scale,     status: "active" },
  { name: "Refinement", color: T.purple, icon: IC.dove,    status: "pending" },
  { name: "Final",     color: T.gold,  icon: IC.crown,     status: "pending" },
];

// ── Concept Data ──
const concepts = [
  { id: 1, name: "The Silence Speaks", persona: "David Ogilvy", model: "Claude Sonnet", score: 92, status: "winner", summary: "Luxury minimalism — let the product's absence in ads create desire. Empty spaces with one droplet. 'What you don't say defines luxury.'" },
  { id: 2, name: "Liquid Architecture", persona: "Paul Rand", model: "GPT-4o", score: 87, status: "surviving", summary: "Geometric abstraction of water in premium spaces. The bottle becomes a design object, architectural photography with water as the hero element." },
  { id: 3, name: "The Thirst Economy", persona: "Elon Musk", model: "Gemini Pro", score: 84, status: "surviving", summary: "First-principles positioning — why does premium water exist? Because status hydration is a $47B market. DTC with radical transparency on sourcing." },
  { id: 4, name: "Club AquaLux", persona: "Mary Wells Lawrence", model: "Claude Opus", score: 76, status: "eliminated", round: 4, summary: "Membership experience — exclusive tasting events, limited editions, celebrity partnerships." },
  { id: 5, name: "Street Hydration", persona: "Gary Halbert", model: "Grok 4.1", score: 61, status: "eliminated", round: 3, summary: "Direct response approach — free bottle with survey, build email list, hard-sell health benefits." },
];

// ── Critique Data ──
const critiques = [
  { conceptId: 1, critics: ["Claude Hopkins", "Leo Burnett"], round: 3,
    strengths: "Original positioning, strong emotional hook, premium aesthetic alignment, memorable tagline potential",
    weaknesses: "Needs stronger call-to-action for digital, may be too subtle for social formats, production cost concerns",
    elevate: "Add a tactile element — make the silence visual through ASMR-style closeup photography of water on premium surfaces." },
  { conceptId: 2, critics: ["Seth Godin", "Bill Bernbach"], round: 3,
    strengths: "Bold visual identity, strong brand architecture, photograph-first approach gives natural social content",
    weaknesses: "Risk of feeling cold/corporate, needs emotional warmth layer, production requires specialist photographers",
    elevate: "Pair each architectural shot with a human moment — a hand reaching for the bottle, condensation catching light." },
  { conceptId: 3, critics: ["David Ogilvy", "Ries & Trout"], round: 3,
    strengths: "Data-driven narrative differentiates from emotional competitors, DTC model is capital efficient, appeals to rational buyers",
    weaknesses: "Too analytical for luxury market, risks attracting deal-seekers over premium buyers, tone may alienate aspirational segment",
    elevate: "Reframe transparency as exclusivity — 'We show you everything because only the best can.' Make data feel like access." },
];

// ── Tab Config ──
const tabGroups = [
  { id: "overview", label: "Overview", icon: IC.home, isHero: true },
  { type: "divider" },
  { type: "label", text: "ANALYSIS" },
  { id: "concepts",   label: "Concepts",    icon: IC.brain,     count: 5 },
  { id: "critiques",  label: "Critiques",   icon: IC.bolt,      count: 12 },
  { id: "direction",  label: "Direction",   icon: IC.megaphone },
  { id: "da",         label: "DA Arena",    icon: IC.advocate },
  { id: "transcript", label: "Transcript",  icon: IC.clipboard },
  { type: "divider" },
  { type: "label", text: "MEDIA" },
  { id: "gallery",    label: "Gallery",     icon: IC.gallery,   count: 8 },
  { id: "present",    label: "Presentations", icon: IC.chart },
];

// ═══════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════

function Tag({ children, color = T.cyan }) {
  return (
    <span style={{
      fontFamily: font.mono, fontSize: 10, fontWeight: 500,
      textTransform: "uppercase", letterSpacing: "0.12em",
      color, background: `${color}14`, padding: "3px 8px", borderRadius: 4,
    }}>{children}</span>
  );
}

function ScoreBar({ value, color = T.cyan, height = 4 }) {
  return (
    <div style={{ height, borderRadius: 2, background: T.surfaceRaised, overflow: "hidden" }}>
      <div style={{
        height: "100%", borderRadius: 2, width: `${value}%`,
        background: color, transition: "width 0.6s ease",
      }} />
    </div>
  );
}

function ScoreRing({ value, color = T.gold, size = 96 }) {
  const r = (size - 8) / 2;
  const c = Math.PI * 2 * r;
  const offset = c - (c * value / 100);
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={T.surfaceRaised} strokeWidth="4" />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="4"
          strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.8s ease" }} />
      </svg>
      <div style={{
        position: "absolute", inset: 0, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
      }}>
        <span style={{ fontFamily: font.display, fontSize: size * 0.32, fontWeight: 700, color, lineHeight: 1 }}>
          {value}
        </span>
        <span style={{ fontFamily: font.mono, fontSize: 8, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.12em" }}>
          SCORE
        </span>
      </div>
    </div>
  );
}

// ── Stage Progress ──
function StageProgress({ stages: stgs }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
      {stgs.map((s, i) => {
        const isActive = s.status === "active";
        const isDone = s.status === "complete";
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 3 }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 5, padding: "5px 10px",
              borderRadius: 6,
              background: isActive ? `${s.color}10` : "transparent",
              border: `1px solid ${isActive ? `${s.color}30` : T.border}`,
            }}>
              <span style={{ fontSize: 12, color: isActive ? s.color : isDone ? T.textSoft : T.textMuted }}>
                {s.icon}
              </span>
              <span style={{
                fontFamily: font.mono, fontSize: 9, fontWeight: 500,
                textTransform: "uppercase", letterSpacing: "0.08em",
                color: isActive ? s.color : isDone ? T.textSoft : T.textMuted,
              }}>{s.name}</span>
              {isDone && <span style={{ fontSize: 10, color: T.green }}>{IC.check}</span>}
            </div>
            {i < stgs.length - 1 && (
              <div style={{
                width: 12, height: 1,
                background: isDone ? T.textMuted : T.border,
                opacity: isDone ? 0.3 : 1,
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Concept Card (Tobias) ──
function ConceptCard({ concept, rank }) {
  const isWinner = concept.status === "winner";
  const isEliminated = concept.status === "eliminated";
  const accent = isWinner ? T.gold : isEliminated ? T.red : T.cyan;

  return (
    <div style={{
      background: T.surface, borderRadius: 8,
      borderLeft: `2px solid ${accent}`,
      padding: "16px 20px",
      opacity: isEliminated ? 0.5 : 1,
      transition: "opacity 0.3s ease",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Rank indicator */}
          <div style={{
            width: 28, height: 28, borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            background: isWinner ? `${T.gold}15` : T.surfaceRaised,
            color: isWinner ? T.gold : T.textMuted,
            fontSize: isWinner ? 14 : 11, fontWeight: 700,
            fontFamily: isWinner ? font.body : font.mono,
          }}>
            {isWinner ? IC.crown : isEliminated ? IC.xClose : `#${rank}`}
          </div>
          <div>
            <div style={{
              fontFamily: isWinner ? font.display : font.body,
              fontSize: isWinner ? 17 : 14, fontWeight: 600,
              color: isWinner ? T.gold : isEliminated ? T.textMuted : T.text,
            }}>
              {concept.name}
            </div>
            <div style={{
              fontFamily: font.body, fontSize: 11, color: T.textSoft, marginTop: 2,
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <span>{concept.persona}</span>
              <span style={{ color: T.textMuted }}>·</span>
              <span style={{ fontFamily: font.mono, fontSize: 10, color: T.textMuted }}>{concept.model}</span>
              {isEliminated && (
                <Tag color={T.red}>ELIM R{concept.round}</Tag>
              )}
            </div>
          </div>
        </div>
        {/* Score */}
        <div style={{ textAlign: "right" }}>
          <div style={{
            fontFamily: font.display, fontSize: isWinner ? 26 : 20, fontWeight: 700,
            color: accent, lineHeight: 1,
          }}>{concept.score}</div>
          <div style={{
            fontFamily: font.mono, fontSize: 8, color: T.textMuted,
            textTransform: "uppercase", letterSpacing: "0.12em", marginTop: 2,
          }}>SCORE</div>
        </div>
      </div>

      {/* Score bar */}
      <div style={{ margin: "10px 0" }}>
        <ScoreBar value={concept.score} color={accent} />
      </div>

      <p style={{
        fontFamily: font.body, fontSize: 12, color: isEliminated ? T.textMuted : T.textSoft,
        lineHeight: 1.55, margin: 0,
        textDecoration: isEliminated ? "line-through" : "none",
        textDecorationColor: `${T.red}40`,
      }}>
        {concept.summary}
      </p>

      {isWinner && (
        <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
          <Tag color={T.gold}>WINNER</Tag>
          <Tag color={T.green}>HIGHEST SCORE</Tag>
          <Tag color={T.flame}>DA APPROVED</Tag>
        </div>
      )}
    </div>
  );
}

// ── Critique Card (Tobias) ──
function CritiqueCard({ critique, concept }) {
  return (
    <div style={{
      background: T.surface, borderRadius: 8,
      borderLeft: `2px solid ${T.amber}`,
      padding: "18px 20px", marginBottom: 10,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div>
          <div style={{ fontFamily: font.body, fontSize: 14, fontWeight: 600, color: T.text }}>
            {concept.name}
          </div>
          <div style={{ fontFamily: font.body, fontSize: 11, color: T.textSoft, marginTop: 2 }}>
            Critiqued by {critique.critics.join(", ")}
          </div>
        </div>
        <Tag color={T.amber}>ROUND {critique.round}</Tag>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {/* Strengths */}
        <div style={{
          background: `${T.green}08`, borderRadius: 6, padding: 12,
          borderLeft: `2px solid ${T.green}`,
        }}>
          <div style={{
            fontFamily: font.mono, fontSize: 9, fontWeight: 500, color: T.green,
            textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 6,
          }}>STRENGTHS</div>
          <div style={{ fontFamily: font.body, fontSize: 12, color: T.textSoft, lineHeight: 1.5 }}>
            {critique.strengths}
          </div>
        </div>
        {/* Weaknesses */}
        <div style={{
          background: `${T.red}08`, borderRadius: 6, padding: 12,
          borderLeft: `2px solid ${T.red}`,
        }}>
          <div style={{
            fontFamily: font.mono, fontSize: 9, fontWeight: 500, color: T.red,
            textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 6,
          }}>WEAKNESSES</div>
          <div style={{ fontFamily: font.body, fontSize: 12, color: T.textSoft, lineHeight: 1.5 }}>
            {critique.weaknesses}
          </div>
        </div>
      </div>

      {/* Elevation */}
      <div style={{
        marginTop: 10, background: `${T.amber}08`, borderRadius: 6, padding: 12,
        borderLeft: `2px solid ${T.amber}`,
      }}>
        <div style={{
          fontFamily: font.mono, fontSize: 9, fontWeight: 500, color: T.amber,
          textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 6,
        }}>ONE CHANGE TO ELEVATE</div>
        <div style={{ fontFamily: font.body, fontSize: 12, color: T.textSoft, lineHeight: 1.5, fontStyle: "italic" }}>
          "{critique.elevate}"
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════

export default function DashboardRedesign() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div style={{
      background: T.bg, minHeight: "100vh", fontFamily: font.body,
      display: "flex", color: T.text,
    }}>
      {/* ── LEFT SIDEBAR ── */}
      <div style={{
        width: 200, background: T.surface,
        borderRight: `1px solid ${T.border}`,
        padding: "16px 0", display: "flex", flexDirection: "column", flexShrink: 0,
      }}>
        {/* Header */}
        <div style={{ padding: "0 16px 14px", borderBottom: `1px solid ${T.border}`, marginBottom: 6 }}>
          <div style={{
            fontFamily: font.mono, fontSize: 10, fontWeight: 500,
            color: T.flame, textTransform: "uppercase", letterSpacing: "0.12em",
          }}>SIMULATION</div>
          <div style={{
            fontFamily: font.display, fontSize: 14, fontWeight: 600,
            color: T.text, marginTop: 4,
          }}>AquaLux Campaign</div>
          <div style={{ marginTop: 8 }}>
            <Tag color={T.green}>● RUNNING</Tag>
          </div>
        </div>

        {/* Nav Items */}
        {tabGroups.map((item, i) => {
          if (item.type === "divider") return (
            <div key={i} style={{ height: 1, background: T.border, margin: "6px 16px" }} />
          );
          if (item.type === "label") return (
            <div key={i} style={{
              fontFamily: font.mono, fontSize: 9, fontWeight: 500,
              color: T.textMuted, textTransform: "uppercase",
              letterSpacing: "0.12em", padding: "8px 16px 4px",
            }}>{item.text}</div>
          );
          const isActive = activeTab === item.id;
          return (
            <button key={item.id} onClick={() => setActiveTab(item.id)}
              style={{
                display: "flex", alignItems: "center", gap: 8, width: "100%",
                padding: "7px 16px",
                background: isActive ? `${T.cyan}0a` : "transparent",
                border: "none",
                borderLeft: `2px solid ${isActive ? T.cyan : "transparent"}`,
                cursor: "pointer", textAlign: "left",
              }}>
              <span style={{ fontSize: 14, width: 20, textAlign: "center",
                color: isActive ? T.cyan : T.textMuted }}>{item.icon}</span>
              <span style={{
                fontFamily: font.body, fontSize: 12, fontWeight: isActive ? 600 : 400,
                color: isActive ? T.cyan : T.textSoft, flex: 1,
              }}>{item.label}</span>
              {item.count && (
                <span style={{
                  fontFamily: font.mono, fontSize: 9, fontWeight: 500,
                  color: T.textMuted, background: T.surfaceRaised,
                  padding: "1px 5px", borderRadius: 4,
                }}>{item.count}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{ flex: 1, overflow: "auto" }}>
        {/* Status Bar */}
        <div style={{
          padding: "10px 32px", background: T.surface,
          borderBottom: `1px solid ${T.border}`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <StageProgress stages={stages} />
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontFamily: font.mono, fontSize: 10, color: T.textMuted,
              textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Round 4 / 8
            </span>
            <div style={{ width: 80 }}>
              <ScoreBar value={50} color={T.cyan} height={3} />
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div style={{ padding: 32 }}>

          {/* ═══ OVERVIEW TAB ═══ */}
          {activeTab === "overview" && (
            <>
              {/* Winner Hero */}
              <div style={{
                background: T.surface, borderRadius: 8,
                borderLeft: `2px solid ${T.gold}`,
                padding: "28px 32px", marginBottom: 28,
              }}>
                <div style={{ display: "flex", gap: 32 }}>
                  <div style={{ flex: 1 }}>
                    <Tag color={T.gold}>LEADING CONCEPT</Tag>
                    <h1 style={{
                      fontFamily: font.display, fontSize: 28, fontWeight: 700,
                      color: T.gold, letterSpacing: "-0.02em", lineHeight: 1.1,
                      margin: "12px 0 6px",
                    }}>
                      "The Silence Speaks"
                    </h1>
                    <div style={{ fontFamily: font.body, fontSize: 13, color: T.textSoft, marginBottom: 12 }}>
                      by <span style={{ color: T.flame, fontWeight: 600 }}>David Ogilvy</span>
                      <span style={{ color: T.textMuted }}> · </span>
                      <span style={{ fontFamily: font.mono, fontSize: 11, color: T.textMuted }}>Claude Sonnet</span>
                    </div>
                    <p style={{
                      fontFamily: font.body, fontSize: 14, color: T.textSoft,
                      lineHeight: 1.6, margin: "0 0 16px", maxWidth: 480,
                    }}>
                      Luxury minimalism — let the product's absence in ads create desire. Empty spaces with one droplet.
                      "What you don't say defines luxury."
                    </p>
                    <div style={{ display: "flex", gap: 6 }}>
                      <Tag color={T.gold}>SCORE: 92</Tag>
                      <Tag color={T.green}>SURVIVED 4 ROUNDS</Tag>
                      <Tag color={T.cyan}>DA APPROVED</Tag>
                    </div>
                  </div>
                  <ScoreRing value={92} color={T.gold} size={100} />
                </div>
              </div>

              {/* Quick Stats */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 28 }}>
                {[
                  { label: "Concepts Created", value: "5", color: T.cyan },
                  { label: "Still Surviving", value: "3", color: T.green },
                  { label: "Eliminated", value: "2", color: T.red },
                  { label: "DA Attacks", value: "4", color: T.magenta },
                ].map((stat, i) => (
                  <div key={i} style={{
                    background: T.surface, borderRadius: 8, padding: "14px 16px",
                    borderLeft: `2px solid ${stat.color}`,
                  }}>
                    <div style={{
                      fontFamily: font.mono, fontSize: 9, fontWeight: 500,
                      color: T.textMuted, textTransform: "uppercase",
                      letterSpacing: "0.12em", marginBottom: 6,
                    }}>{stat.label}</div>
                    <div style={{
                      fontFamily: font.display, fontSize: 26, fontWeight: 700, color: stat.color,
                    }}>{stat.value}</div>
                  </div>
                ))}
              </div>

              {/* 1px flame divider */}
              <div style={{ height: 1, background: `${T.flame}30`, margin: "0 0 20px" }} />

              {/* Concept Rankings */}
              <div style={{
                fontFamily: font.mono, fontSize: 10, fontWeight: 500,
                color: T.textMuted, textTransform: "uppercase",
                letterSpacing: "0.12em", marginBottom: 12,
              }}>CONCEPT RANKINGS</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {concepts.map((c, i) => (
                  <ConceptCard key={c.id} concept={c} rank={i + 1} />
                ))}
              </div>
            </>
          )}

          {/* ═══ CONCEPTS TAB ═══ */}
          {activeTab === "concepts" && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <span style={{
                  fontFamily: font.display, fontSize: 18, fontWeight: 600, color: T.text,
                }}>All Concepts</span>
                <div style={{ display: "flex", gap: 6 }}>
                  <Tag color={T.green}>3 SURVIVING</Tag>
                  <Tag color={T.red}>2 ELIMINATED</Tag>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {concepts.map((c, i) => (
                  <ConceptCard key={c.id} concept={c} rank={i + 1} />
                ))}
              </div>
            </>
          )}

          {/* ═══ CRITIQUES TAB ═══ */}
          {activeTab === "critiques" && (
            <>
              <div style={{
                fontFamily: font.display, fontSize: 18, fontWeight: 600,
                color: T.text, marginBottom: 16,
              }}>Critique Log</div>
              {critiques.map((cr, i) => {
                const concept = concepts.find(c => c.id === cr.conceptId);
                return concept ? <CritiqueCard key={i} critique={cr} concept={concept} /> : null;
              })}
            </>
          )}

          {/* ═══ PLACEHOLDER TABS ═══ */}
          {!["overview", "concepts", "critiques"].includes(activeTab) && (
            <div style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "center", minHeight: 360, gap: 12,
            }}>
              <span style={{ fontSize: 36, color: T.textMuted }}>
                {tabGroups.find(t => t.id === activeTab)?.icon || IC.home}
              </span>
              <div style={{
                fontFamily: font.display, fontSize: 17, fontWeight: 600, color: T.text,
              }}>
                {tabGroups.find(t => t.id === activeTab)?.label || activeTab}
              </div>
              <p style={{
                fontFamily: font.body, fontSize: 13, color: T.textMuted,
                textAlign: "center", maxWidth: 380, lineHeight: 1.5,
              }}>
                This tab uses the same Tobias design system — flat surfaces, 2px accent borders, editorial typography.
              </p>
              <Tag color={T.cyan}>V4.1 WIREFRAME</Tag>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
