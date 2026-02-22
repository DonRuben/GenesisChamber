import { useState, useRef } from "react";

// ═══════════════════════════════════════════════════════════════
// GENESIS CHAMBER V4 — Motion System
// Tobias van Schneider — flat surfaces, 2px accents, no shadows
// Fibonacci-based timing · CSS transitions · Reduced-motion safe
// ═══════════════════════════════════════════════════════════════

const s = { display: "inline-block", verticalAlign: "-0.125em" };
const IC = {
  bolt: <svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor" stroke="none" style={s}><path d="M11 2L5 11h5l-1 7 6-9h-5l1-7z"/></svg>,
  play: <svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor" style={s}><path d="M7 4v16l13-8z"/></svg>,
  chart: <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={s}><path d="M3 17h14"/><rect x="5" y="9" width="2" height="8" rx=".5" fill="currentColor"/><rect x="9" y="5" width="2" height="12" rx=".5" fill="currentColor"/><rect x="13" y="2" width="2" height="15" rx=".5" fill="currentColor"/></svg>,
  check: <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={s}><path d="M4 10l4 4 8-8"/></svg>,
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
const Card = ({ children, accent, style: sx }) => (<div style={{ background: T.surface, borderLeft: `2px solid ${accent || T.border}`, borderRadius: 8, overflow: "hidden", ...sx }}>{children}</div>);

// ─── Fibonacci Duration Scale ───
const DURATIONS = {
  instant: 80,   // Micro-interactions (badge appear, tooltip)
  fast: 130,     // Hover states, button feedback
  normal: 210,   // Tab switches, panel transitions
  slow: 340,     // Page transitions, modal open
  dramatic: 550, // DA flashcard flip, winner reveal
  epic: 890,     // Simulation launch sequence
};

// ─── Easing Functions ───
const EASINGS = {
  default: "cubic-bezier(0.4, 0, 0.2, 1)",      // Material standard
  decelerate: "cubic-bezier(0, 0, 0.2, 1)",       // Enter screen
  accelerate: "cubic-bezier(0.4, 0, 1, 1)",       // Leave screen
  spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",    // Playful bounce
  sharp: "cubic-bezier(0.4, 0, 0.6, 1)",          // Precise, no overshoot
  dramatic: "cubic-bezier(0.16, 1, 0.3, 1)",      // DA arena, high contrast
};

// ─── Motion Catalog (Tobias-compliant: no box-shadow, no glow) ───
const MOTIONS = [
  {
    category: "Page Transitions",
    color: T.cyan,
    items: [
      { name: "fadeSlideUp", desc: "Content enters from below with fade. Tab content, panel reveals.",
        duration: "normal (210ms)", easing: "decelerate",
        css: `@keyframes fadeSlideUp {
  from { opacity: 0; transform: translateY(13px); }
  to { opacity: 1; transform: translateY(0); }
}
.gc-enter { animation: fadeSlideUp 210ms cubic-bezier(0, 0, 0.2, 1) forwards; }` },
      { name: "fadeSlideRight", desc: "Horizontal enter for step transitions. Launcher wizard.",
        duration: "normal (210ms)", easing: "decelerate",
        css: `@keyframes fadeSlideRight {
  from { opacity: 0; transform: translateX(-21px); }
  to { opacity: 1; transform: translateX(0); }
}` },
      { name: "scaleIn", desc: "Modal/overlay entrance with scale + fade. Lightbox, dialogs.",
        duration: "slow (340ms)", easing: "spring",
        css: `@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.92); }
  to { opacity: 1; transform: scale(1); }
}` },
    ],
  },
  {
    category: "Micro-Interactions",
    color: T.green,
    items: [
      { name: "buttonPress", desc: "Subtle scale-down on click for tactile feedback.",
        duration: "instant (80ms)", easing: "sharp",
        css: `.gc-btn:active { transform: scale(0.97); transition: transform 80ms cubic-bezier(0.4, 0, 0.6, 1); }` },
      { name: "hoverLift", desc: "Card rises 2px with border color shift on hover. No shadow.",
        duration: "fast (130ms)", easing: "default",
        css: `.gc-card:hover {
  transform: translateY(-2px);
  border-color: rgba(255,255,255,0.12);
  transition: all 130ms cubic-bezier(0.4, 0, 0.2, 1);
}` },
      { name: "badgePop", desc: "Badge appears with pop scale. Status change, winner reveal.",
        duration: "fast (130ms)", easing: "spring",
        css: `@keyframes badgePop {
  0% { opacity: 0; transform: scale(0.5); }
  70% { transform: scale(1.08); }
  100% { opacity: 1; transform: scale(1); }
}` },
      { name: "accentPulse", desc: "2px borderLeft opacity pulse for active/winning elements.",
        duration: "2000ms (loop)", easing: "default",
        css: `@keyframes accentPulse {
  0%, 100% { border-left-color: var(--accent); }
  50% { border-left-color: transparent; }
}
.gc-pulse { animation: accentPulse 2s ease infinite; }` },
    ],
  },
  {
    category: "DA Arena",
    color: T.red,
    items: [
      { name: "flashcardFlip", desc: "3D card flip between attack and defense sides.",
        duration: "dramatic (550ms)", easing: "dramatic",
        css: `.da-flashcard {
  transition: transform 550ms cubic-bezier(0.16, 1, 0.3, 1);
  transform-style: preserve-3d;
}
.da-flashcard.flipped { transform: rotateY(180deg); }
.da-flashcard-front, .da-flashcard-back { backface-visibility: hidden; }
.da-flashcard-back { transform: rotateY(180deg); }` },
      { name: "ratingPulse", desc: "Border color pulse + scale burst on rating selection.",
        duration: "normal (210ms)", easing: "spring",
        css: `@keyframes ratingPulse {
  0% { transform: scale(1); border-left-width: 2px; }
  40% { transform: scale(1.06); border-left-width: 3px; }
  100% { transform: scale(1); border-left-width: 2px; }
}` },
      { name: "threatFill", desc: "Animated ring fill for threat score visualization.",
        duration: "slow (340ms)", easing: "decelerate",
        css: `.da-threat-ring circle {
  transition: stroke-dashoffset 340ms cubic-bezier(0, 0, 0.2, 1);
}` },
    ],
  },
  {
    category: "Simulation Flow",
    color: T.flame,
    items: [
      { name: "launchSequence", desc: "Multi-stage: button scale → expand → borderLeft cascade → redirect.",
        duration: "epic (890ms)", easing: "dramatic",
        css: `@keyframes launchPulse {
  0% { transform: scale(1); border-left-color: var(--flame); }
  50% { transform: scale(1.02); border-left-color: var(--gold); }
  100% { transform: scale(1); border-left-color: var(--flame); }
}` },
      { name: "stageTransition", desc: "Round progress bar fills segment with color cascade.",
        duration: "slow (340ms)", easing: "default",
        css: `.gc-stage-segment {
  transition: background-color 340ms cubic-bezier(0.4, 0, 0.2, 1),
              transform 210ms cubic-bezier(0.4, 0, 0.2, 1);
}
.gc-stage-segment.active { transform: scale(1.05); }` },
      { name: "winnerReveal", desc: "Gold borderLeft expands, card scales to hero, opacity cascade.",
        duration: "dramatic (550ms)", easing: "spring",
        css: `@keyframes winnerReveal {
  0% { opacity: 0; transform: scale(0.95); border-left-width: 2px; }
  60% { opacity: 1; transform: scale(1.01); border-left-width: 4px; }
  100% { transform: scale(1); border-left-width: 2px; }
}` },
    ],
  },
  {
    category: "Utility",
    color: T.purple,
    items: [
      { name: "staggerChildren", desc: "Sequential delay for list/grid items appearing.",
        duration: "normal per item, 50ms stagger", easing: "decelerate",
        css: `.gc-stagger > * {
  opacity: 0; animation: fadeSlideUp 210ms cubic-bezier(0, 0, 0.2, 1) forwards;
}
.gc-stagger > *:nth-child(1) { animation-delay: 0ms; }
.gc-stagger > *:nth-child(2) { animation-delay: 50ms; }
.gc-stagger > *:nth-child(3) { animation-delay: 100ms; }` },
      { name: "skeletonShimmer", desc: "Loading placeholder shimmer effect.",
        duration: "1500ms (loop)", easing: "default",
        css: `@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
.gc-skeleton {
  background: linear-gradient(90deg, var(--surface) 25%, var(--surfaceRaised) 50%, var(--surface) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s ease infinite;
}` },
      { name: "reducedMotion", desc: "Global override — all animations become instant transitions.",
        duration: "0ms", easing: "none",
        css: `@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}` },
    ],
  },
];

// ─── Demo Preview ───
function DemoPreview({ name, playing }) {
  const base = { width: 60, height: 40, background: T.surfaceRaised, borderRadius: 6, borderLeft: `2px solid ${T.flame}`, transition: "all 340ms" };
  if (!playing) return <div style={base} />;
  const anims = {
    fadeSlideUp: { ...base, animation: "fadeSlideUp 500ms ease-out infinite" },
    fadeSlideRight: { ...base, animation: "fadeSlideRight 500ms ease-out infinite" },
    scaleIn: { ...base, animation: "scaleIn 500ms ease-out infinite" },
    buttonPress: { ...base, transform: "scale(0.93)" },
    hoverLift: { ...base, transform: "translateY(-3px)", borderColor: T.cyan },
    badgePop: { ...base, animation: "badgePop 500ms ease-out infinite" },
    accentPulse: { ...base, animation: "accentPulse 1.5s ease infinite" },
    flashcardFlip: { ...base, transform: "rotateY(180deg)", transition: "transform 550ms" },
    ratingPulse: { ...base, animation: "ratingPulse 400ms ease-out infinite" },
    threatFill: { ...base, background: `linear-gradient(90deg, ${T.red}44 0%, transparent 60%)` },
    launchSequence: { ...base, animation: "launchPulse 890ms ease infinite" },
    stageTransition: { ...base, transform: "scale(1.05)", background: T.flame },
    winnerReveal: { ...base, animation: "winnerReveal 550ms ease-out infinite", borderColor: T.gold },
    staggerChildren: { ...base, animation: "fadeSlideUp 300ms ease-out forwards", opacity: 0 },
    skeletonShimmer: { ...base, width: 100, background: `linear-gradient(90deg, ${T.surfaceRaised} 25%, ${T.surfaceHover} 50%, ${T.surfaceRaised} 75%)`, backgroundSize: "200% 100%", animation: "shimmer 1.5s ease infinite" },
    reducedMotion: { ...base, opacity: 0.5 },
  };
  return <div style={anims[name] || base} />;
}

// ─── useMotion hook ───
export function useMotion(ref, animation) {
  const motionMap = {
    fadeSlideUp: { keyframes: [{ opacity: 0, transform: "translateY(13px)" }, { opacity: 1, transform: "translateY(0)" }], options: { duration: DURATIONS.normal, easing: EASINGS.decelerate, fill: "forwards" } },
    scaleIn: { keyframes: [{ opacity: 0, transform: "scale(0.92)" }, { opacity: 1, transform: "scale(1)" }], options: { duration: DURATIONS.slow, easing: EASINGS.spring, fill: "forwards" } },
    badgePop: { keyframes: [{ opacity: 0, transform: "scale(0.5)" }, { transform: "scale(1.08)" }, { opacity: 1, transform: "scale(1)" }], options: { duration: DURATIONS.fast, easing: EASINGS.spring, fill: "forwards" } },
  };
  return () => {
    if (!ref.current || !motionMap[animation]) return;
    const m = motionMap[animation];
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      ref.current.style.opacity = "1";
      ref.current.style.transform = "none";
      return;
    }
    ref.current.animate(m.keyframes, m.options);
  };
}

// ═══════════════════════════════════════════════════════════════
// MAIN EXPORT
// ═══════════════════════════════════════════════════════════════

export default function MotionSystem() {
  const [activeCategory, setActiveCategory] = useState(0);
  const [playing, setPlaying] = useState(null);

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.text, fontFamily: font.body, padding: "21px 21px" }}>
      <style>{`
        @keyframes fadeSlideUp { from { opacity: 0; transform: translateY(13px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeSlideRight { from { opacity: 0; transform: translateX(-21px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.92); } to { opacity: 1; transform: scale(1); } }
        @keyframes badgePop { 0% { opacity: 0; transform: scale(0.5); } 70% { transform: scale(1.08); } 100% { opacity: 1; transform: scale(1); } }
        @keyframes accentPulse { 0%, 100% { border-left-color: ${T.flame}; } 50% { border-left-color: transparent; } }
        @keyframes ratingPulse { 0% { transform: scale(1); } 40% { transform: scale(1.06); } 100% { transform: scale(1); } }
        @keyframes launchPulse { 0% { transform: scale(1); } 50% { transform: scale(1.02); } 100% { transform: scale(1); } }
        @keyframes winnerReveal { 0% { opacity: 0; transform: scale(0.95); } 60% { opacity: 1; transform: scale(1.01); } 100% { transform: scale(1); } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
      `}</style>

      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 21 }}>
          <div style={{ fontFamily: font.mono, fontSize: 10, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 8 }}>Genesis Chamber V4 — Motion System</div>
          <div style={{ height: 1, background: T.flame, opacity: 0.15 }} />
        </div>

        {/* Duration scale */}
        <Card accent={T.flame} style={{ marginBottom: 21 }}>
          <div style={{ padding: 16 }}>
            <MonoLabel icon={IC.chart} color={T.flame}>Fibonacci Duration Scale</MonoLabel>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8 }}>
              {Object.entries(DURATIONS).map(([name, ms]) => (
                <div key={name} style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: font.mono, fontSize: 18, fontWeight: 700, color: T.text }}>{ms}</div>
                  <div style={{ fontFamily: font.mono, fontSize: 9, color: T.textMuted, textTransform: "uppercase" }}>{name}</div>
                  <div style={{ height: 3, background: T.surfaceRaised, borderRadius: 2, marginTop: 6 }}>
                    <div style={{ width: `${Math.min(100, (ms / 890) * 100)}%`, height: "100%", borderRadius: 2, background: T.flame }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Easing functions */}
        <Card accent={T.purple} style={{ marginBottom: 21 }}>
          <div style={{ padding: 16 }}>
            <MonoLabel icon={IC.bolt} color={T.purple}>Easing Functions</MonoLabel>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {Object.entries(EASINGS).map(([name, val]) => (
                <div key={name} style={{ padding: "6px 10px", background: T.surfaceRaised, borderRadius: 6, borderLeft: `2px solid ${T.purple}` }}>
                  <div style={{ fontFamily: font.mono, fontSize: 11, fontWeight: 600, color: T.text }}>{name}</div>
                  <div style={{ fontFamily: font.mono, fontSize: 9, color: T.textMuted, marginTop: 2 }}>{val}</div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Category tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 16, flexWrap: "wrap", padding: 4, background: T.surface, borderRadius: 8 }}>
          {MOTIONS.map((cat, i) => (
            <button key={i} onClick={() => setActiveCategory(i)} style={{
              padding: "7px 13px", borderRadius: 6, border: "none", cursor: "pointer",
              fontSize: 11, fontWeight: 600, fontFamily: font.body,
              background: activeCategory === i ? T.surfaceRaised : "transparent",
              color: activeCategory === i ? cat.color : T.textMuted,
            }}>{cat.category} ({cat.items.length})</button>
          ))}
        </div>

        {/* Motion items */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {MOTIONS[activeCategory].items.map((motion) => (
            <Card key={motion.name} accent={MOTIONS[activeCategory].color}>
              <div style={{ padding: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 13 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <span style={{ fontFamily: font.mono, fontSize: 13, fontWeight: 700, color: T.text }}>{motion.name}</span>
                      <Tag label={motion.duration} color={MOTIONS[activeCategory].color} />
                    </div>
                    <div style={{ fontSize: 12, color: T.textSoft, marginBottom: 10 }}>{motion.desc}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <Tag label={`easing: ${motion.easing}`} color={T.textMuted} />
                    </div>
                  </div>

                  {/* Demo + play button */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                    <DemoPreview name={motion.name} playing={playing === motion.name} />
                    <button onClick={() => setPlaying(playing === motion.name ? null : motion.name)} style={{
                      padding: "4px 10px", borderRadius: 4, border: "none", cursor: "pointer",
                      fontSize: 10, fontFamily: font.mono, fontWeight: 600,
                      background: playing === motion.name ? `${T.green}14` : T.surfaceRaised,
                      color: playing === motion.name ? T.green : T.textMuted,
                    }}>{playing === motion.name ? "⏹ Stop" : "▶ Play"}</button>
                  </div>
                </div>

                {/* CSS code block */}
                <details style={{ marginTop: 10 }}>
                  <summary style={{ fontFamily: font.mono, fontSize: 10, color: T.textMuted, cursor: "pointer" }}>CSS Implementation</summary>
                  <pre style={{ marginTop: 6, padding: 13, background: T.surfaceRaised, borderRadius: 6, borderLeft: `2px solid ${MOTIONS[activeCategory].color}`, overflow: "auto", fontFamily: font.mono, fontSize: 11, color: T.textSoft, lineHeight: 1.5 }}>
                    {motion.css}
                  </pre>
                </details>
              </div>
            </Card>
          ))}
        </div>

        {/* Reduced motion notice */}
        <Card accent={T.amber} style={{ marginTop: 21 }}>
          <div style={{ padding: 13, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 14, color: T.amber }}>{IC.check}</span>
            <span style={{ fontSize: 12, color: T.textSoft }}>All animations respect <code style={{ fontFamily: font.mono, fontSize: 11, color: T.amber }}>prefers-reduced-motion: reduce</code> — durations collapse to 0.01ms</span>
          </div>
        </Card>
      </div>
    </div>
  );
}
