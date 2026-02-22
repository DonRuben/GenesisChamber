import { useState } from "react";

// ─────────────────────────────────────────────────────────
// GENESIS CHAMBER V4 · SIMULATION OVERVIEW
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
  crown:      icon(<><path d="M4 18h16l-2.4-9.6L14 12l-2-7-2 7-3.6-3.6z"/><path d="M4 18v2h16v-2"/></>),
  brain:      icon(<><path d="M12 3C7.5 3 4 7 4 11c0 3 1.8 5.5 4.2 6.6L8.5 21h7l.3-3.4C18.2 16.5 20 14 20 11c0-4-3.5-8-8-8z"/><path d="M9 11h6M12 8v6"/></>),
  swords:     icon(<><path d="M4 20l7-7M20 20l-7-7"/><path d="M4 4l5 5M20 4l-5 5"/><circle cx="12" cy="12" r="2.5"/></>),
  gallery:    icon(<><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="10" r="2"/><path d="M3 17l4.5-4.5 3.5 3.5 4.5-5.5L21 17"/></>),
  exportArrow:icon(<><path d="M5 16v3a1 1 0 001 1h12a1 1 0 001-1v-3"/><path d="M12 4v12"/><path d="M7 9l5-5 5 5"/></>),
  clipboard:  icon(<><path d="M8.5 4h7"/><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8.5 9h7M8.5 12.5h7M8.5 16h5"/></>),
  advocate:   icon(<><path d="M5 10c0-4.8 3.5-7.2 7-7.2s7 2.4 7 7.2"/><path d="M3.5 7.5l3.5 2.5M20.5 7.5l-3.5 2.5"/><circle cx="9" cy="12" r="1.2" fill="currentColor"/><circle cx="15" cy="12" r="1.2" fill="currentColor"/><path d="M8.5 17c1.8 1.8 5.2 1.8 7 0"/></>),
  flame:      icon(<path d="M12 3c0 3.6-4.8 6-4.8 10.8a6 6 0 0012 0c0-3-1.2-4.8-2.4-6 0 2.4-1.2 3.6-2.4 3.6s-2.4-2.4-2.4-6z"/>, true),
  spark:      icon(<path d="M12 3l1.8 6.6L20 12l-6.2 3L12 21l-1.8-6L4 12l6.2-3z"/>, true),
  check:      icon(<path d="M5 12l5 5 9-9"/>),
  xClose:     icon(<><path d="M6 6l12 12"/><path d="M18 6L6 18"/></>),
  search:     icon(<><circle cx="10" cy="10" r="6"/><path d="M15.5 15.5l5 5"/></>),
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

// ── Model Colors ──
const MODEL_COLORS = {
  "Claude": "#D97706", "GPT-4o": "#10A37F", "Gemini": "#4285F4",
  "DeepSeek": "#06B6D4", "Grok": "#1D9BF0", "Llama": "#7C3AED",
};

// ── Mock Data ──
const participants = [
  { name: "Claude", model: "Sonnet 4", concept: "SoundSphere Elite", score: 94, status: "winner" },
  { name: "GPT-4o", model: "Latest", concept: "AudioVault Pro", score: 87, status: "surviving" },
  { name: "Gemini", model: "2.0 Flash", concept: "FreqWave", score: 78, status: "surviving" },
  { name: "DeepSeek", model: "V3", concept: "DecibelX", score: 62, status: "eliminated", round: 2 },
  { name: "Grok", model: "4.1", concept: "BassNova", score: 45, status: "eliminated", round: 1 },
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

function ScoreRing({ value, color = T.gold, size = 64 }) {
  const r = (size - 8) / 2;
  const c = Math.PI * 2 * r;
  const offset = c - (c * value / 100);
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={T.surfaceRaised} strokeWidth="3" />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="3"
          strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round" />
      </svg>
      <div style={{
        position: "absolute", inset: 0, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
      }}>
        <span style={{ fontFamily: font.display, fontSize: size * 0.3, fontWeight: 700, color, lineHeight: 1 }}>
          {value}
        </span>
      </div>
    </div>
  );
}

function MonoLabel({ children }) {
  return (
    <div style={{
      fontFamily: font.mono, fontSize: 10, fontWeight: 500,
      color: T.textMuted, textTransform: "uppercase",
      letterSpacing: "0.12em", marginBottom: 10,
    }}>{children}</div>
  );
}

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════

function OverviewContent() {
  return (
    <div style={{
      maxWidth: 880, margin: "0 auto", padding: "24px 0",
      display: "flex", flexDirection: "column", gap: 20,
    }}>
      {/* ── 1. WINNER SPOTLIGHT ── */}
      <div style={{
        background: T.surface, borderRadius: 8,
        borderLeft: `2px solid ${T.gold}`,
        padding: "24px 28px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <span style={{ fontSize: 16, color: T.gold }}>{IC.crown}</span>
          <span style={{
            fontFamily: font.mono, fontSize: 10, fontWeight: 500,
            color: T.gold, textTransform: "uppercase", letterSpacing: "0.12em",
          }}>Winning Concept</span>
        </div>

        <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
          <div style={{ flex: 1 }}>
            <h2 style={{
              fontFamily: font.display, fontSize: 28, fontWeight: 700,
              color: T.text, margin: 0, letterSpacing: "-0.02em", lineHeight: 1.1,
            }}>SoundSphere Elite</h2>

            <p style={{
              fontFamily: font.body, fontSize: 16, fontStyle: "italic",
              color: T.textSoft, margin: "8px 0 0", lineHeight: 1.4,
            }}>"Sound isn't just heard — it's felt."</p>

            <div style={{
              display: "flex", alignItems: "center", gap: 12, marginTop: 14,
            }}>
              <span style={{ fontFamily: font.body, fontSize: 13, fontWeight: 600, color: T.text }}>
                Claude Sonnet 4
              </span>
              <span style={{ color: T.textMuted }}>·</span>
              <span style={{ fontFamily: font.mono, fontSize: 11, color: T.textMuted }}>
                Survived all 3 rounds
              </span>
            </div>

            <div style={{ display: "flex", gap: 6, marginTop: 14 }}>
              <Tag color={T.gold}>WINNER</Tag>
              <Tag color={T.green}>HIGHEST SCORE</Tag>
              <Tag color={T.cyan}>DA APPROVED</Tag>
            </div>
          </div>

          <ScoreRing value={94} color={T.gold} size={80} />
        </div>
      </div>

      {/* ── 2. SIMULATION BRIEF ── */}
      <div style={{
        background: T.surface, borderRadius: 8, padding: "18px 22px",
        borderLeft: `2px solid ${T.cyan}`,
      }}>
        <MonoLabel>Simulation Brief</MonoLabel>
        <p style={{
          fontFamily: font.body, fontSize: 13, color: T.textSoft,
          lineHeight: 1.6, margin: 0,
        }}>
          Create a premium headphone brand targeting audiophiles aged 25-45. The brand should
          communicate luxury, technological innovation, and personalized sound experiences.
          Include brand name, tagline, visual identity direction, and go-to-market strategy.
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12 }}>
          {[
            { label: "3 Rounds", color: T.cyan },
            { label: "5 Models", color: T.cyan },
            { label: "DA Enabled", color: T.magenta },
            { label: "Media Gen", color: T.flame },
            { label: "Web Search", color: T.green },
          ].map((chip, i) => (
            <Tag key={i} color={chip.color}>{chip.label}</Tag>
          ))}
        </div>
      </div>

      {/* ── 3. KEY METRICS ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
        {[
          { value: "3", label: "Rounds", color: T.cyan },
          { value: "5", label: "Concepts", color: T.green },
          { value: "12", label: "DA Attacks", color: T.magenta },
          { value: "23", label: "Images", color: T.flame },
        ].map((stat, i) => (
          <div key={i} style={{
            background: T.surface, borderRadius: 8, padding: "14px 16px",
            borderLeft: `2px solid ${stat.color}`,
          }}>
            <div style={{
              fontFamily: font.display, fontSize: 26, fontWeight: 700,
              color: stat.color, lineHeight: 1,
            }}>{stat.value}</div>
            <div style={{
              fontFamily: font.mono, fontSize: 9, fontWeight: 500,
              color: T.textMuted, marginTop: 4,
              textTransform: "uppercase", letterSpacing: "0.1em",
            }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* 1px flame divider */}
      <div style={{ height: 1, background: `${T.flame}30` }} />

      {/* ── 4. PARTICIPANTS ── */}
      <div style={{
        background: T.surface, borderRadius: 8, padding: "18px 22px",
      }}>
        <MonoLabel>Participants</MonoLabel>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {participants.map((p, i) => {
            const color = MODEL_COLORS[p.name] || T.cyan;
            const isWinner = p.status === "winner";
            const isEliminated = p.status === "eliminated";
            const accent = isWinner ? T.gold : isEliminated ? T.red : T.green;

            return (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "9px 14px", borderRadius: 6,
                borderLeft: `2px solid ${accent}`,
                background: isWinner ? `${T.gold}06` : "transparent",
                opacity: isEliminated ? 0.55 : 1,
              }}>
                {/* Avatar */}
                <div style={{
                  width: 28, height: 28, borderRadius: 9999,
                  background: `${color}15`, border: `1.5px solid ${color}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <span style={{
                    fontFamily: font.mono, fontSize: 11, fontWeight: 700, color,
                  }}>{p.name[0]}</span>
                </div>

                {/* Name + concept */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: font.body, fontSize: 13, fontWeight: 600, color: T.text }}>
                    {p.name} <span style={{
                      fontWeight: 400, color: T.textMuted, fontFamily: font.mono, fontSize: 10,
                    }}>{p.model}</span>
                  </div>
                  <div style={{
                    fontFamily: font.body, fontSize: 11, color: T.textMuted,
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>{p.concept}</div>
                </div>

                {/* Score */}
                <span style={{
                  fontFamily: font.mono, fontSize: 15, fontWeight: 700,
                  color: isWinner ? T.gold : isEliminated ? T.textMuted : T.textSoft,
                }}>{p.score}</span>

                {/* Status */}
                <Tag color={accent}>
                  {isWinner ? "Winner" : isEliminated ? `Elim R${p.round}` : "Active"}
                </Tag>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 5. MEDIA PREVIEW ── */}
      <div style={{
        background: T.surface, borderRadius: 8, padding: "18px 22px",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <MonoLabel>Generated Media</MonoLabel>
          <button style={{
            background: "none", border: "none", color: T.cyan,
            fontFamily: font.body, fontSize: 12, cursor: "pointer",
          }}>View All 23 →</button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} style={{
              aspectRatio: "4/5", background: T.surfaceRaised, borderRadius: 6,
              border: `1px solid ${T.border}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 24, color: T.textMuted, cursor: "pointer",
            }}>
              {IC.gallery}
            </div>
          ))}
        </div>
      </div>

      {/* ── 6. QUICK ACTIONS ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
        {[
          { icon: IC.brain,      label: "Council Detail" },
          { icon: IC.gallery,    label: "Full Gallery" },
          { icon: IC.advocate,   label: "DA Arena" },
          { icon: IC.exportArrow, label: "Export" },
        ].map((action, i) => (
          <button key={i} style={{
            background: T.surface, border: `1px solid ${T.border}`,
            borderRadius: 8, padding: "14px 8px", textAlign: "center",
            cursor: "pointer",
          }}>
            <div style={{ fontSize: 18, color: T.textSoft, marginBottom: 4 }}>{action.icon}</div>
            <div style={{ fontFamily: font.body, fontSize: 12, color: T.textSoft }}>
              {action.label}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Export ──
export default function SimulationOverviewWireframe() {
  return (
    <div style={{
      fontFamily: font.body, background: T.bg,
      color: T.text, minHeight: "100vh", padding: 20,
    }}>
      <div style={{
        fontFamily: font.mono, fontSize: 10, fontWeight: 500,
        color: T.textMuted, textTransform: "uppercase",
        letterSpacing: "0.12em", marginBottom: 12,
      }}>V4.1 Simulation Overview — Case Study Layout</div>
      <OverviewContent />
    </div>
  );
}
