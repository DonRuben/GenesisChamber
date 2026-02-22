import { useState } from "react";

// ═══════════════════════════════════════════════════════════════════
// GENESIS CHAMBER V4 — CONCEPT CARDS VISUAL HIERARCHY
// Tobias van Schneider — flat surfaces, 2px accents, no shadows
// Winner hero, surviving standard, eliminated dimmed
// ═══════════════════════════════════════════════════════════════════

// ── GC V4 Icon System — Inline SVG, stroke-based, theme-adaptive ──
const s = { display: "inline-block", verticalAlign: "-0.125em" };
const IC = {
  crown: <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={s}><path d="M3 15h14l-2-8-3 4-2-6-2 6-3-4z"/><path d="M3 15v2h14v-2"/></svg>,
  brain: <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={s}><path d="M10 2C6 2 3 5.5 3 9c0 2.5 1.5 4.5 3.5 5.5L7 18h6l.5-3.5C15.5 13.5 17 11.5 17 9c0-3.5-3-7-7-7z"/><path d="M7.5 9h5M10 6.5v5"/></svg>,
  gallery: <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={s}><rect x="2" y="3" width="16" height="14" rx="1.5"/><circle cx="7" cy="8" r="1.5"/><path d="M2 14l4-4 3 3 4-5 5 6"/></svg>,
  clipboard: <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={s}><path d="M7 3h6"/><rect x="4" y="2" width="12" height="16" rx="1.5"/><path d="M7 7h6M7 10h6M7 13h4"/></svg>,
  skull: <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={s}><circle cx="10" cy="8" r="5"/><circle cx="8" cy="7.5" r="1.5" fill="currentColor"/><circle cx="12" cy="7.5" r="1.5" fill="currentColor"/><path d="M8 11h4M9 18V13M11 18V13M7 16h6"/></svg>,
  bolt: <svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor" stroke="none" style={s}><path d="M11 2L5 11h5l-1 7 6-9h-5l1-7z"/></svg>,
  check: <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={s}><path d="M4 10l4 4 8-8"/></svg>,
  xClose: <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={s}><path d="M5 5l10 10M15 5L5 15"/></svg>,
  star: <svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor" stroke="none" style={s}><path d="M10 2l2.5 5 5.5.8-4 3.9.9 5.3L10 14.5 5.1 17l.9-5.3-4-3.9L7.5 7z"/></svg>,
  chart: <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={s}><path d="M3 17h14"/><rect x="5" y="9" width="2" height="8" rx=".5" fill="currentColor"/><rect x="9" y="5" width="2" height="12" rx=".5" fill="currentColor"/><rect x="13" y="2" width="2" height="15" rx=".5" fill="currentColor"/></svg>,
};

// ── Design Tokens (Tobias system) ──
const T = {
  bg:            "#111113",
  surface:       "#18181B",
  surfaceRaised: "#1F1F23",
  surfaceHover:  "#26262B",
  flame:         "#F27123",
  cyan:          "#00D9FF",
  gold:          "#D4A853",
  magenta:       "#E5375E",
  green:         "#34D399",
  purple:        "#8B5CF6",
  amber:         "#F59E0B",
  red:           "#EF4444",
  text:          "#E8E6E3",
  textSoft:      "#A1A1AA",
  textMuted:     "#63636E",
  border:        "rgba(255,255,255,0.06)",
  borderHover:   "rgba(255,255,255,0.12)",
};

const font = {
  display: "'OmniPresent', Inter, system-ui",
  body: "Inter, system-ui, sans-serif",
  mono: "'JetBrains Mono', monospace",
};

const MODEL_COLORS = {
  Claude: "#D97706", "GPT-4o": "#10A37F", Gemini: "#4285F4",
  DeepSeek: "#06B6D4", Grok: "#1D9BF0", Llama: "#7C3AED",
};

// ── Tier badge component ──
const TierBadge = ({ tier }) => {
  const config = {
    S: { color: T.gold, label: "S" },
    A: { color: T.cyan, label: "A" },
    B: { color: T.green, label: "B" },
    C: { color: T.textMuted, label: "C" },
  };
  const c = config[tier] || config.C;
  return (
    <span style={{
      fontFamily: font.mono, fontSize: 10, fontWeight: 700,
      color: c.color, background: `${c.color}14`,
      borderRadius: 4, padding: "2px 6px",
      textTransform: "uppercase", letterSpacing: "0.12em",
    }}>
      {c.label}-TIER
    </span>
  );
};

// ── Mono label (section headers) ──
const MonoLabel = ({ children, icon, color = T.textMuted }) => (
  <div style={{
    fontFamily: font.mono, fontSize: 10, fontWeight: 600,
    color, textTransform: "uppercase", letterSpacing: "0.12em",
    display: "flex", alignItems: "center", gap: 6, marginBottom: 13,
  }}>
    {icon && <span style={{ fontSize: 14 }}>{icon}</span>}
    {children}
  </div>
);

// ── Tag component ──
const Tag = ({ label, color = T.cyan }) => (
  <span style={{
    fontFamily: font.mono, fontSize: 10, fontWeight: 600,
    color, background: `${color}14`,
    borderRadius: 4, padding: "2px 8px",
    textTransform: "uppercase", letterSpacing: "0.12em",
  }}>
    {label}
  </span>
);

// ── Score bar (flat, no gradient) ──
const ScoreBar = ({ score, color, height = 4 }) => (
  <div style={{
    width: "100%", height, background: T.surfaceRaised, borderRadius: 2,
  }}>
    <div style={{
      width: `${score}%`, height: "100%", borderRadius: 2,
      background: color,
      transition: "width 600ms cubic-bezier(0.25,0.1,0.25,1)",
    }} />
  </div>
);

// ── Score ring (SVG, no CSS conic-gradient) ──
const ScoreRing = ({ score, color, size = 48 }) => {
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - score / 100);
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r}
        fill="none" stroke={T.surfaceRaised} strokeWidth={3} />
      <circle cx={size/2} cy={size/2} r={r}
        fill="none" stroke={color} strokeWidth={3}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round" />
      <text x={size/2} y={size/2}
        textAnchor="middle" dominantBaseline="central"
        fill={color} fontSize={size * 0.28} fontWeight={700}
        fontFamily={font.mono}
        style={{ transform: "rotate(90deg)", transformOrigin: "center" }}>
        {score}
      </text>
    </svg>
  );
};

// ═══════════════════════════════════════════════════════════════════
// CONCEPT CARD — Three Visual Tiers (Tobias style)
// ═══════════════════════════════════════════════════════════════════
//
// TIER: WINNER — full-width, gold 2px left border, score ring, expanded
// TIER: SURVIVING — standard card, cyan/green accent, collapsed default
// TIER: ELIMINATED — dimmed 50% opacity, red accent, collapsed, hover 75%

const ConceptCard = ({ concept, tier, rank, isExpanded, onToggle }) => {
  const [hovered, setHovered] = useState(false);
  const modelColor = MODEL_COLORS[concept.persona] || T.cyan;
  const isWinner = tier === "winner";
  const isEliminated = tier === "eliminated";

  const scoreColor = concept.score >= 85 ? T.green
    : concept.score >= 65 ? T.amber : T.red;

  const accentColor = isWinner ? T.gold : isEliminated ? T.red : T.cyan;

  const tierLabel = concept.score >= 90 ? "S"
    : concept.score >= 80 ? "A"
    : concept.score >= 65 ? "B" : "C";

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={!isWinner ? onToggle : undefined}
      style={{
        gridColumn: isWinner ? "1 / -1" : "auto",
        background: T.surface,
        borderLeft: `2px solid ${accentColor}`,
        borderRadius: 8,
        padding: isWinner ? 21 : 16,
        cursor: isWinner ? "default" : "pointer",
        position: "relative",

        // Eliminated dimming — opacity only (no grayscale filter)
        opacity: isEliminated ? (hovered ? 0.75 : 0.5) : 1,
        transition: "opacity 210ms ease",
      }}
    >
      {/* ── Header Row ── */}
      <div style={{
        display: "flex", alignItems: "center", gap: 13,
        marginBottom: isWinner ? 16 : 10,
      }}>
        {/* Persona Avatar */}
        <div style={{
          width: isWinner ? 44 : 32,
          height: isWinner ? 44 : 32,
          borderRadius: 9999,
          background: `${modelColor}14`,
          border: `2px solid ${modelColor}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          <span style={{
            fontFamily: font.mono,
            fontSize: isWinner ? 16 : 12,
            fontWeight: 700, color: modelColor,
          }}>
            {concept.persona?.[0] || "?"}
          </span>
        </div>

        {/* Title + Meta */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{
            fontFamily: font.display,
            fontSize: isWinner ? 22 : 16,
            fontWeight: isWinner ? 700 : 600,
            color: T.text,
            margin: 0, lineHeight: 1.2,
            letterSpacing: "-0.01em",
            overflow: "hidden", textOverflow: "ellipsis",
            whiteSpace: isWinner ? "normal" : "nowrap",
          }}>
            {concept.name}
          </h3>

          <div style={{
            display: "flex", alignItems: "center", gap: 8, marginTop: 4,
          }}>
            <span style={{
              fontFamily: font.body, fontSize: 12, color: T.textMuted,
            }}>
              by {concept.persona}
            </span>
            <Tag label={concept.model} color={modelColor} />
          </div>
        </div>

        {/* Right side: Score ring (winner) or badge (others) */}
        <div style={{
          display: "flex", alignItems: "center", gap: 8, flexShrink: 0,
        }}>
          {isWinner ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <TierBadge tier={tierLabel} />
              <ScoreRing score={concept.score} color={T.gold} size={52} />
            </div>
          ) : isEliminated ? (
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <Tag label={`Elim R${concept.eliminatedRound}`} color={T.red} />
              <span style={{
                fontFamily: font.mono, fontSize: 14, fontWeight: 700,
                color: T.textMuted,
              }}>
                {concept.score}
              </span>
            </div>
          ) : (
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <TierBadge tier={tierLabel} />
              <div style={{
                width: 30, height: 30, borderRadius: 9999,
                background: `${T.cyan}08`,
                border: `1px solid ${T.border}`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <span style={{
                  fontFamily: font.mono, fontSize: 12, fontWeight: 700,
                  color: T.cyan,
                }}>
                  #{rank}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Score Bar ── */}
      <div style={{ marginBottom: (isExpanded || isWinner) ? 13 : 0 }}>
        <div style={{
          display: "flex", justifyContent: "space-between",
          alignItems: "center", marginBottom: 4,
        }}>
          <span style={{
            fontFamily: font.mono, fontSize: 10, color: T.textMuted,
            textTransform: "uppercase", letterSpacing: "0.12em",
          }}>
            SCORE
          </span>
          {!isWinner && (
            <span style={{
              fontFamily: font.mono, fontSize: 12, fontWeight: 700,
              color: isEliminated ? T.textMuted : scoreColor,
            }}>
              {concept.score}/100
            </span>
          )}
        </div>
        <ScoreBar
          score={concept.score}
          color={isWinner ? T.gold : isEliminated ? T.textMuted : scoreColor}
        />
      </div>

      {/* ── Expanded Content ── */}
      <div style={{
        maxHeight: (isExpanded || isWinner) ? 400 : 0,
        opacity: (isExpanded || isWinner) ? 1 : 0,
        overflow: "hidden",
        transition: "all 340ms cubic-bezier(0.25,0.1,0.25,1)",
      }}>
        {/* Tagline */}
        {concept.tagline && (
          <p style={{
            fontFamily: font.body,
            fontSize: isWinner ? 15 : 13,
            fontStyle: "italic",
            color: T.textSoft,
            margin: "0 0 8px 0",
            lineHeight: 1.5,
          }}>
            "{concept.tagline}"
          </p>
        )}

        {/* Brief */}
        {concept.brief && (
          <p style={{
            fontFamily: font.body, fontSize: 13,
            color: T.textMuted, lineHeight: 1.6,
            margin: 0,
            display: "-webkit-box",
            WebkitLineClamp: isWinner ? 4 : 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}>
            {concept.brief}
          </p>
        )}

        {/* Winner: strength chips */}
        {isWinner && concept.strengths && (
          <div style={{
            display: "flex", flexWrap: "wrap", gap: 6, marginTop: 13,
          }}>
            {concept.strengths.map((str, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 4,
                background: `${T.green}08`,
                borderRadius: 4, padding: "3px 8px",
              }}>
                <span style={{ fontSize: 12, color: T.green }}>{IC.check}</span>
                <span style={{
                  fontFamily: font.mono, fontSize: 10, color: T.green,
                  textTransform: "uppercase", letterSpacing: "0.08em",
                }}>
                  {str}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Winner: media preview thumbnails */}
        {isWinner && concept.images?.length > 0 && (
          <div style={{
            display: "flex", gap: 8, marginTop: 13, overflowX: "auto",
          }}>
            {concept.images.slice(0, 4).map((_, i) => (
              <div key={i} style={{
                width: 72, height: 72, borderRadius: 8,
                background: T.surfaceRaised,
                border: `1px solid ${T.border}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 20, color: T.textMuted, flexShrink: 0,
              }}>
                {IC.gallery}
              </div>
            ))}
            {concept.images.length > 4 && (
              <div style={{
                width: 72, height: 72, borderRadius: 8,
                background: T.surfaceRaised,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: font.mono, fontSize: 12, color: T.textMuted,
                flexShrink: 0,
              }}>
                +{concept.images.length - 4}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Expand indicator (non-winner) ── */}
      {!isWinner && (
        <div style={{
          textAlign: "center", marginTop: 6,
          fontFamily: font.mono, fontSize: 9, color: T.textMuted,
          textTransform: "uppercase", letterSpacing: "0.12em",
          opacity: hovered ? 0.8 : 0.4,
          transition: "opacity 130ms ease",
        }}>
          {isExpanded ? "▲ COLLAPSE" : "▼ DETAILS"}
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// CONCEPT GRID LAYOUT
// ═══════════════════════════════════════════════════════════════════
// 2-column grid, winner spans full width
// Eliminated: collapsible section behind 1px flame divider

const ConceptGrid = ({ concepts }) => {
  const [expandedId, setExpandedId] = useState(null);
  const [showEliminated, setShowEliminated] = useState(false);

  const winner = concepts.find(c => c.isWinner);
  const surviving = concepts
    .filter(c => !c.isWinner && !c.isEliminated)
    .sort((a, b) => b.score - a.score);
  const eliminated = concepts
    .filter(c => c.isEliminated)
    .sort((a, b) => b.score - a.score);

  return (
    <div style={{ padding: "21px 0" }}>
      {/* Header */}
      <MonoLabel icon={IC.brain} color={T.flame}>
        Concept Rankings
      </MonoLabel>

      {/* Active grid */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr", gap: 13,
      }}>
        {winner && (
          <ConceptCard
            concept={winner} tier="winner" rank={1} isExpanded={true}
          />
        )}
        {surviving.map((concept, i) => (
          <ConceptCard
            key={concept.id} concept={concept} tier="surviving"
            rank={i + 2}
            isExpanded={expandedId === concept.id}
            onToggle={() => setExpandedId(
              expandedId === concept.id ? null : concept.id
            )}
          />
        ))}
      </div>

      {/* Eliminated section */}
      {eliminated.length > 0 && (
        <div style={{ marginTop: 21 }}>
          {/* 1px flame divider with toggle */}
          <button
            onClick={() => setShowEliminated(!showEliminated)}
            style={{
              display: "flex", alignItems: "center", gap: 13,
              width: "100%", background: "none", border: "none",
              cursor: "pointer", padding: "8px 0",
            }}
          >
            <div style={{
              flex: 1, height: 1, background: T.flame, opacity: 0.2,
            }} />
            <span style={{
              fontFamily: font.mono, fontSize: 10, color: T.textMuted,
              textTransform: "uppercase", letterSpacing: "0.12em",
              display: "flex", alignItems: "center", gap: 6,
            }}>
              <span style={{ fontSize: 12, color: T.red }}>{IC.skull}</span>
              Eliminated ({eliminated.length})
              <span style={{ fontSize: 8 }}>
                {showEliminated ? "▲" : "▼"}
              </span>
            </span>
            <div style={{
              flex: 1, height: 1, background: T.flame, opacity: 0.2,
            }} />
          </button>

          {/* Eliminated grid */}
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr", gap: 13,
            maxHeight: showEliminated ? 2000 : 0,
            opacity: showEliminated ? 1 : 0,
            overflow: "hidden",
            transition: "all 340ms cubic-bezier(0.25,0.1,0.25,1)",
            marginTop: showEliminated ? 8 : 0,
          }}>
            {eliminated.map((concept, i) => (
              <ConceptCard
                key={concept.id} concept={concept} tier="eliminated"
                rank={surviving.length + i + 2}
                isExpanded={expandedId === concept.id}
                onToggle={() => setExpandedId(
                  expandedId === concept.id ? null : concept.id
                )}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════════

const MOCK_CONCEPTS = [
  {
    id: 1, name: "SoundSphere Elite", persona: "Claude", model: "Claude Sonnet 4",
    score: 94, isWinner: true, isEliminated: false,
    tagline: "Sound isn't just heard — it's felt.",
    brief: "A premium headphone brand at the intersection of audiophile craftsmanship and modern lifestyle design. Emphasizes spatial audio technology and personalized sound profiles, targeting discerning listeners who demand both technical excellence and aesthetic sophistication.",
    strengths: ["Brand Clarity", "Emotional Hook", "Market Fit", "Visual Identity"],
    images: [1, 2, 3, 4, 5, 6],
  },
  {
    id: 2, name: "AudioVault Pro", persona: "GPT-4o", model: "GPT-4o",
    score: 87, isWinner: false, isEliminated: false,
    tagline: "Your music. Your vault.",
    brief: "Secure premium headphone ecosystem with proprietary lossless codec and biometric authentication for personal sound libraries.",
  },
  {
    id: 3, name: "FreqWave", persona: "Gemini", model: "Gemini 2.5 Pro",
    score: 78, isWinner: false, isEliminated: false,
    tagline: "Ride every frequency.",
    brief: "Youth-oriented brand with customizable sound profiles and modular design components for the next generation of listeners.",
  },
  {
    id: 4, name: "DecibelX", persona: "DeepSeek", model: "DeepSeek V3",
    score: 62, isWinner: false, isEliminated: true, eliminatedRound: 3,
    tagline: "Maximum clarity. Zero compromise.",
    brief: "Technical-focused brand targeting professional audio engineers and studio producers.",
  },
  {
    id: 5, name: "BassNova", persona: "Grok", model: "Grok 4.1",
    score: 45, isWinner: false, isEliminated: true, eliminatedRound: 2,
    tagline: "Bass that moves you.",
    brief: "Bass-heavy lifestyle brand for hip-hop and EDM enthusiasts with emphasis on club culture.",
  },
];

// ═══════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════

export default function ConceptCardsWireframe() {
  return (
    <div style={{
      fontFamily: font.body,
      background: T.bg,
      color: T.text,
      minHeight: "100vh",
      padding: 21,
    }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        {/* Page header */}
        <div style={{
          fontFamily: font.mono, fontSize: 10, color: T.textMuted,
          textTransform: "uppercase", letterSpacing: "0.12em",
          marginBottom: 8,
        }}>
          Genesis Chamber V4 — Concept Cards
        </div>
        <div style={{
          height: 1, background: T.flame, opacity: 0.15, marginBottom: 21,
        }} />

        <ConceptGrid concepts={MOCK_CONCEPTS} />
      </div>
    </div>
  );
}
