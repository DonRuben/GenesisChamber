import { useState } from "react";

// ─────────────────────────────────────────────────────────
// GENESIS CHAMBER V4 · DA COMMAND CENTER
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
  swords:     icon(<><path d="M4 20l7-7M20 20l-7-7"/><path d="M4 4l5 5M20 4l-5 5"/><circle cx="12" cy="12" r="2.5"/></>),
  flame:      icon(<path d="M12 3c0 3.6-4.8 6-4.8 10.8a6 6 0 0012 0c0-3-1.2-4.8-2.4-6 0 2.4-1.2 3.6-2.4 3.6s-2.4-2.4-2.4-6z"/>, true),
  brain:      icon(<><path d="M12 2a7 7 0 00-4.6 12.3A4.5 4.5 0 0012 22a4.5 4.5 0 004.6-7.7A7 7 0 0012 2z"/><path d="M12 2v20"/></>),
  target:     icon(<><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></>),
  scale:      icon(<><path d="M12 3v18"/><path d="M5 7l7-4 7 4"/><path d="M2 14l3-7 3 7a4.24 4.24 0 01-6 0zM16 14l3-7 3 7a4.24 4.24 0 01-6 0z"/></>),
  bolt:       icon(<path d="M13 3L6 13h6l-1 8 7-10h-6l1-8z"/>, true),
  shield:     icon(<path d="M12 3L4 6.5v6c0 5.25 3.5 10 8 11.5 4.5-1.5 8-6.25 8-11.5v-6L12 3z"/>),
  chat:       icon(<><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></>),
  check:      icon(<path d="M5 12l5 5 9-9"/>),
  settings:   icon(<><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></>),
  chevRight:  icon(<path d="M9 6l6 6-6 6"/>),
  info:       icon(<><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></>),
  rocket:     icon(<><path d="M12 2c-3 7-8 9-8 13a8 8 0 0016 0c0-4-5-6-8-13z"/><circle cx="12" cy="15" r="2"/></>),
};

// ── Tobias Design Tokens ──
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

// ── DA Style Presets ──
const DA_STYLES = [
  {
    id: "socratic",
    name: "Socratic",
    icon: "brain",
    description: "Probing questions that expose assumptions and logical gaps",
    color: T.cyan,
  },
  {
    id: "aggressive",
    name: "Aggressive",
    icon: "flame",
    description: "Direct confrontation, no mercy — finds breaking points fast",
    color: T.magenta,
  },
  {
    id: "balanced",
    name: "Balanced",
    icon: "scale",
    description: "Structured critique with constructive counter-proposals",
    color: T.gold,
  },
];

// ── Focus Areas ──
const FOCUS_AREAS = [
  { id: "feasibility", label: "Feasibility", icon: "target" },
  { id: "ethics", label: "Ethics", icon: "scale" },
  { id: "originality", label: "Originality", icon: "bolt" },
  { id: "market", label: "Market Fit", icon: "chat" },
  { id: "technical", label: "Technical", icon: "settings" },
];

// ── Quick Start Presets ──
const PRESETS = [
  {
    id: "light",
    name: "Light Sparring",
    description: "Gentle probing — great for early-stage ideas",
    intensity: 1,
    style: "socratic",
    frequency: 2,
    focusAreas: ["feasibility", "originality"],
  },
  {
    id: "full",
    name: "Full Interrogation",
    description: "Comprehensive stress-test across all dimensions",
    intensity: 2,
    style: "balanced",
    frequency: 4,
    focusAreas: ["feasibility", "ethics", "originality", "market", "technical"],
  },
  {
    id: "trial",
    name: "Devil's Trial",
    description: "Maximum adversarial pressure — only the strongest survive",
    intensity: 3,
    style: "aggressive",
    frequency: 5,
    focusAreas: ["feasibility", "market", "technical"],
  },
];

// ── Sub-components ──

function Toggle({ enabled, onToggle }) {
  return (
    <button
      onClick={onToggle}
      style={{
        width: 48, height: 24, borderRadius: 12,
        background: enabled ? T.flame : T.surfaceRaised,
        border: `1px solid ${enabled ? T.flame : T.border}`,
        cursor: "pointer", position: "relative",
        transition: "all 200ms ease",
        padding: 0, outline: "none",
      }}
    >
      <span style={{
        position: "absolute", top: 2, left: enabled ? 26 : 2,
        width: 18, height: 18, borderRadius: "50%",
        background: enabled ? "#fff" : T.textMuted,
        transition: "all 200ms ease",
      }} />
    </button>
  );
}

function StyleCard({ style, selected, onSelect }) {
  const IconComp = IC[style.icon];
  return (
    <button
      onClick={onSelect}
      style={{
        background: selected ? `rgba(${style.id === "socratic" ? "0,217,255" : style.id === "aggressive" ? "229,55,94" : "212,168,83"},0.06)` : T.surfaceRaised,
        border: `1px solid ${selected ? T.borderHover : T.border}`,
        borderLeft: `2px solid ${selected ? style.color : "transparent"}`,
        borderRadius: 8, padding: "16px 14px", cursor: "pointer",
        display: "flex", flexDirection: "column", gap: 8,
        textAlign: "left", outline: "none", flex: 1,
        transition: "all 160ms ease",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{
          width: 16, height: 16, borderRadius: "50%",
          border: `2px solid ${selected ? style.color : T.textMuted}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          {selected && <span style={{
            width: 8, height: 8, borderRadius: "50%", background: style.color,
          }} />}
        </span>
        <span style={{ fontSize: 18, color: selected ? style.color : T.textSoft }}>
          {IconComp}
        </span>
        <span style={{
          fontFamily: font.body, fontSize: 14, fontWeight: 600,
          color: selected ? T.text : T.textSoft,
        }}>
          {style.name}
        </span>
      </div>
      <span style={{
        fontFamily: font.body, fontSize: 12, color: T.textMuted,
        lineHeight: 1.45, paddingLeft: 24,
      }}>
        {style.description}
      </span>
    </button>
  );
}

function FrequencySlider({ value, onChange }) {
  const labels = ["Rare", "Low", "Medium", "High", "Every Round"];
  const pct = ((value - 1) / 4) * 100;
  return (
    <div>
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "baseline",
        marginBottom: 12,
      }}>
        <span style={{
          fontFamily: font.body, fontSize: 13, fontWeight: 500, color: T.textSoft,
        }}>
          Challenge Frequency
        </span>
        <span style={{
          fontFamily: font.mono, fontSize: 13, fontWeight: 600, color: T.cyan,
        }}>
          {value} — {labels[value - 1]}
        </span>
      </div>
      <div style={{ position: "relative", height: 24, cursor: "pointer" }}
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
          onChange(Math.round(x * 4) + 1);
        }}
      >
        <div style={{
          position: "absolute", top: 10, left: 0, right: 0, height: 4,
          background: T.surfaceRaised, borderRadius: 2,
        }} />
        <div style={{
          position: "absolute", top: 10, left: 0, width: `${pct}%`, height: 4,
          background: T.cyan, borderRadius: 2, transition: "width 120ms ease",
        }} />
        {[0, 1, 2, 3, 4].map(i => (
          <div key={i} style={{
            position: "absolute", top: 9, left: `${(i / 4) * 100}%`,
            width: 6, height: 6, borderRadius: "50%",
            background: i <= value - 1 ? T.cyan : T.surfaceHover,
            border: `1px solid ${i <= value - 1 ? T.cyan : T.border}`,
            transform: "translateX(-3px)",
            transition: "all 120ms ease",
          }} />
        ))}
        <div style={{
          position: "absolute", top: 4, left: `${pct}%`,
          width: 16, height: 16, borderRadius: "50%",
          background: T.cyan, transform: "translateX(-8px)",
          transition: "left 120ms ease",
        }} />
      </div>
      <div style={{
        display: "flex", justifyContent: "space-between", marginTop: 6,
      }}>
        {[1, 2, 3, 4, 5].map(n => (
          <span key={n} style={{
            fontFamily: font.mono, fontSize: 10, color: n === value ? T.cyan : T.textMuted,
            width: 20, textAlign: "center",
          }}>
            {n}
          </span>
        ))}
      </div>
    </div>
  );
}

function FocusChip({ area, selected, onToggle }) {
  const IconComp = IC[area.icon];
  return (
    <button
      onClick={onToggle}
      style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        padding: "6px 12px", borderRadius: 4,
        background: selected ? "rgba(0,217,255,0.08)" : "transparent",
        border: `1px solid ${selected ? T.cyan : T.border}`,
        color: selected ? T.cyan : T.textMuted,
        fontFamily: font.body, fontSize: 13, fontWeight: 500,
        cursor: "pointer", outline: "none",
        transition: "all 140ms ease",
      }}
    >
      <span style={{ fontSize: 14 }}>{IconComp}</span>
      {area.label}
      {selected && <span style={{ fontSize: 14, marginLeft: 2 }}>{IC.check}</span>}
    </button>
  );
}

function PresetCard({ preset, onSelect }) {
  return (
    <button
      onClick={onSelect}
      style={{
        background: T.surfaceRaised, border: `1px solid ${T.border}`,
        borderRadius: 8, padding: "14px 16px", cursor: "pointer",
        textAlign: "left", outline: "none", width: "100%",
        transition: "all 160ms ease",
        display: "flex", alignItems: "flex-start", gap: 14,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = T.borderHover;
        e.currentTarget.style.background = T.surfaceHover;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = T.border;
        e.currentTarget.style.background = T.surfaceRaised;
      }}
    >
      <div style={{
        display: "flex", gap: 2, fontSize: 16, flexShrink: 0, paddingTop: 2,
      }}>
        {[1, 2, 3].map(i => (
          <span key={i} style={{ color: i <= preset.intensity ? T.flame : T.textMuted, opacity: i <= preset.intensity ? 1 : 0.25 }}>
            {IC.flame}
          </span>
        ))}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: font.body, fontSize: 14, fontWeight: 600, color: T.text,
          marginBottom: 4,
        }}>
          {preset.name}
        </div>
        <div style={{
          fontFamily: font.body, fontSize: 12, color: T.textMuted, lineHeight: 1.45,
        }}>
          {preset.description}
        </div>
        <div style={{
          display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap",
        }}>
          <span style={{
            fontFamily: font.mono, fontSize: 10, color: T.textMuted,
            background: T.surface, padding: "2px 6px", borderRadius: 3,
          }}>
            {preset.style}
          </span>
          <span style={{
            fontFamily: font.mono, fontSize: 10, color: T.textMuted,
            background: T.surface, padding: "2px 6px", borderRadius: 3,
          }}>
            freq:{preset.frequency}
          </span>
          <span style={{
            fontFamily: font.mono, fontSize: 10, color: T.textMuted,
            background: T.surface, padding: "2px 6px", borderRadius: 3,
          }}>
            {preset.focusAreas.length} areas
          </span>
        </div>
      </div>
      <span style={{ color: T.textMuted, fontSize: 16, flexShrink: 0, paddingTop: 2 }}>
        {IC.chevRight}
      </span>
    </button>
  );
}

function SectionHeader({ label, icon, sub }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
      }}>
        {icon && <span style={{ fontSize: 16, color: T.textMuted }}>{icon}</span>}
        <span style={{
          fontFamily: font.body, fontSize: 13, fontWeight: 600,
          color: T.textSoft, textTransform: "uppercase", letterSpacing: "0.04em",
        }}>
          {label}
        </span>
      </div>
      {sub && (
        <p style={{
          fontFamily: font.body, fontSize: 12, color: T.textMuted,
          margin: "4px 0 0 0", lineHeight: 1.45,
        }}>
          {sub}
        </p>
      )}
    </div>
  );
}

function ConfigSummary({ style, frequency, focusAreas }) {
  const styleObj = DA_STYLES.find(s => s.id === style);
  return (
    <div style={{
      background: T.surface, border: `1px solid ${T.border}`,
      borderRadius: 8, padding: "12px 16px",
      display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap",
    }}>
      <div style={{
        fontFamily: font.mono, fontSize: 11, color: T.textMuted,
        display: "flex", alignItems: "center", gap: 6,
      }}>
        <span style={{ color: styleObj?.color || T.textSoft, fontSize: 14 }}>
          {IC[styleObj?.icon || "swords"]}
        </span>
        <span style={{ color: styleObj?.color || T.textSoft, fontWeight: 600 }}>
          {styleObj?.name || "—"}
        </span>
      </div>
      <span style={{ width: 1, height: 16, background: T.border }} />
      <div style={{ fontFamily: font.mono, fontSize: 11, color: T.textMuted }}>
        Freq: <span style={{ color: T.cyan, fontWeight: 600 }}>{frequency}/5</span>
      </div>
      <span style={{ width: 1, height: 16, background: T.border }} />
      <div style={{ fontFamily: font.mono, fontSize: 11, color: T.textMuted }}>
        Focus: <span style={{ color: T.text, fontWeight: 600 }}>{focusAreas.length}</span> areas
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════

export default function DACommandCenter() {
  const [enabled, setEnabled] = useState(false);
  const [daStyle, setDaStyle] = useState("socratic");
  const [frequency, setFrequency] = useState(3);
  const [focusAreas, setFocusAreas] = useState(["feasibility", "market"]);
  const [view, setView] = useState("config");

  const toggleFocus = (id) => {
    setFocusAreas(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const applyPreset = (preset) => {
    setDaStyle(preset.style);
    setFrequency(preset.frequency);
    setFocusAreas([...preset.focusAreas]);
    setView("config");
  };

  return (
    <div style={{
      background: T.bg, color: T.text, minHeight: "100vh",
      fontFamily: font.body,
      display: "flex", justifyContent: "center", alignItems: "flex-start",
      padding: "48px 24px",
    }}>
      <div style={{ width: "100%", maxWidth: 480 }}>

        {/* ── Header ── */}
        <div style={{
          fontFamily: font.display, fontSize: 22, fontWeight: 700,
          letterSpacing: "-0.02em", color: T.text,
          marginBottom: 6,
        }}>
          DA Command Center
        </div>
        <p style={{
          fontFamily: font.body, fontSize: 13, color: T.textMuted,
          margin: "0 0 32px 0", lineHeight: 1.45,
        }}>
          Configure Devil's Advocate behavior for this simulation.
        </p>

        {/* ── Master Toggle ── */}
        <div style={{
          background: T.surface, border: `1px solid ${T.border}`,
          borderRadius: 8, padding: "16px 20px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: enabled ? 28 : 0,
          transition: "margin 200ms ease",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 20, color: enabled ? T.flame : T.textMuted }}>
              {IC.swords}
            </span>
            <div>
              <div style={{
                fontFamily: font.body, fontSize: 15, fontWeight: 600,
                color: enabled ? T.text : T.textSoft,
              }}>
                Devil's Advocate
              </div>
              <div style={{
                fontFamily: font.body, fontSize: 12, color: T.textMuted, marginTop: 1,
              }}>
                Enable adversarial testing
              </div>
            </div>
          </div>
          <Toggle enabled={enabled} onToggle={() => setEnabled(!enabled)} />
        </div>

        {/* ── Expandable Config Panel ── */}
        {enabled && (
          <div style={{ animation: "fadeSlideUp 220ms ease both" }}>

            {/* Tab toggle: Config / Quick Start */}
            <div style={{
              display: "flex", gap: 0, marginBottom: 28,
              background: T.surfaceRaised, borderRadius: 6, padding: 3,
            }}>
              {[
                { id: "config", label: "Custom Config" },
                { id: "presets", label: "Quick Start" },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setView(tab.id)}
                  style={{
                    flex: 1, padding: "8px 0", borderRadius: 4,
                    background: view === tab.id ? T.surface : "transparent",
                    border: view === tab.id ? `1px solid ${T.border}` : "1px solid transparent",
                    color: view === tab.id ? T.text : T.textMuted,
                    fontFamily: font.body, fontSize: 13, fontWeight: 500,
                    cursor: "pointer", outline: "none",
                    transition: "all 160ms ease",
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {view === "config" ? (
              <>
                {/* ── DA Style Selector ── */}
                <div style={{ marginBottom: 32 }}>
                  <SectionHeader label="Attack Style" icon={IC.swords} sub="How the advocate approaches challenges" />
                  <div style={{ display: "flex", gap: 10 }}>
                    {DA_STYLES.map(s => (
                      <StyleCard
                        key={s.id}
                        style={s}
                        selected={daStyle === s.id}
                        onSelect={() => setDaStyle(s.id)}
                      />
                    ))}
                  </div>
                </div>

                {/* ── Frequency Slider ── */}
                <div style={{ marginBottom: 32 }}>
                  <SectionHeader label="Frequency" icon={IC.bolt} sub="How often the advocate interjects" />
                  <FrequencySlider value={frequency} onChange={setFrequency} />
                </div>

                {/* ── Focus Areas ── */}
                <div style={{ marginBottom: 32 }}>
                  <SectionHeader label="Focus Areas" icon={IC.target} sub="Dimensions the advocate prioritizes" />
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {FOCUS_AREAS.map(area => (
                      <FocusChip
                        key={area.id}
                        area={area}
                        selected={focusAreas.includes(area.id)}
                        onToggle={() => toggleFocus(area.id)}
                      />
                    ))}
                  </div>
                </div>

                {/* ── Config Summary ── */}
                <ConfigSummary style={daStyle} frequency={frequency} focusAreas={focusAreas} />
              </>
            ) : (
              <div>
                <SectionHeader label="Quick Start Presets" icon={IC.rocket} sub="Pre-configured DA profiles — select to apply" />
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {PRESETS.map(preset => (
                    <PresetCard
                      key={preset.id}
                      preset={preset}
                      onSelect={() => applyPreset(preset)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* ── Info Footer ── */}
            <div style={{
              display: "flex", alignItems: "flex-start", gap: 8,
              marginTop: 28, padding: "12px 14px",
              background: "rgba(0,217,255,0.04)", borderRadius: 6,
              border: "1px solid rgba(0,217,255,0.08)",
            }}>
              <span style={{ fontSize: 14, color: T.cyan, flexShrink: 0, paddingTop: 1 }}>
                {IC.info}
              </span>
              <p style={{
                fontFamily: font.body, fontSize: 12, color: T.textMuted,
                margin: 0, lineHeight: 1.5,
              }}>
                DA challenges appear as interjections during the simulation.
                You can adjust settings at any time from the DA Arena tab.
              </p>
            </div>
          </div>
        )}

        <style>{`
          @keyframes fadeSlideUp {
            from { opacity: 0; transform: translateY(8px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>

      </div>
    </div>
  );
}
