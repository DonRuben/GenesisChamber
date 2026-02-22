import { useState } from "react";

// ─────────────────────────────────────────────────────────
// GENESIS CHAMBER V4 · LAUNCHER
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
  dove:       icon(<><path d="M6 19c2.4-4.8 6-4.8 8.4-2.4"/><path d="M9.6 12c-3.6-1.2-6 1.2-6 4.8"/><path d="M9.6 12c0-3.6 2.4-6 6-6s4.8 2.4 4.8 6c0 2.4-2.4 3.6-4.8 2.4"/></>),
  star:       icon(<path d="M12 3l3 6 6.6 1-4.8 4.7 1.1 6.3L12 17.5 6.1 21l1.1-6.3L2.4 10 9 9z"/>, true),
  spark:      icon(<path d="M12 3l1.8 6.6L20 12l-6.2 3L12 21l-1.8-6L4 12l6.2-3z"/>, true),
  check:      icon(<path d="M5 12l5 5 9-9"/>),
  xClose:     icon(<><path d="M6 6l12 12"/><path d="M18 6L6 18"/></>),
  skull:      icon(<><circle cx="12" cy="10" r="6"/><circle cx="9.5" cy="9" r="2" fill="currentColor"/><circle cx="14.5" cy="9" r="2" fill="currentColor"/><path d="M9.5 13.5h5M10.5 21v-6M13.5 21v-6M8 19h8"/></>),
  advocate:   icon(<><path d="M5 10c0-4.8 3.5-7.2 7-7.2s7 2.4 7 7.2"/><path d="M3.5 7.5l3.5 2.5M20.5 7.5l-3.5 2.5"/><circle cx="9" cy="12" r="1.2" fill="currentColor"/><circle cx="15" cy="12" r="1.2" fill="currentColor"/><path d="M8.5 17c1.8 1.8 5.2 1.8 7 0"/></>),
  globe:      icon(<><circle cx="12" cy="12" r="9.5"/><path d="M2.5 12h19"/><path d="M12 2.5c3 3 4.8 6 4.8 9.5s-1.8 6.5-4.8 9.5"/><path d="M12 2.5c-3 3-4.8 6-4.8 9.5s1.8 6.5 4.8 9.5"/></>),
  clipboard:  icon(<><path d="M8.5 4h7"/><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8.5 9h7M8.5 12.5h7M8.5 16h5"/></>),
  chat:       icon(<path d="M5 5h14a1.5 1.5 0 011.5 1.5v8a1.5 1.5 0 01-1.5 1.5H9.5L5 19.5V16a1.5 1.5 0 01-1.5-1.5v-8A1.5 1.5 0 015 5z"/>),
  scale:      icon(<><path d="M12 3v17"/><path d="M4 7.5l8-2.5 8 2.5"/><path d="M4 7.5c-1.2 3.6 0 6 2.4 6h2.4c2.4 0 3.6-2.4 2.4-6"/><path d="M20 7.5c1.2 3.6 0 6-2.4 6h-2.4c-2.4 0-3.6-2.4-2.4-6"/><path d="M8.5 20h7"/></>),
  rocket:     icon(<><path d="M12 21c0-3.6 1.2-7.2 3.6-9.6s4.8-6 4.8-9.6c0 0-3.6 1.8-6.6 4.8S10 13.2 10 13.2"/><circle cx="14.5" cy="8.5" r="2"/><path d="M6 18l-1.2 3.6L8.4 20.4"/></>),
  megaphone:  icon(<path d="M19 4v16l-6-3.6H6a1.5 1.5 0 01-1.5-1.5V9A1.5 1.5 0 016 7.5h7L19 4z"/>),
  palette:    icon(<><circle cx="12" cy="12" r="9.5"/><circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/><circle cx="15.5" cy="8.5" r="1.5" fill="currentColor"/><circle cx="7" cy="13.5" r="1.5" fill="currentColor"/><circle cx="14.5" cy="16" r="1.5" fill="currentColor"/></>),
  chart:      icon(<><path d="M4 20h17"/><rect x="6.5" y="11" width="2.5" height="9" rx="0.5" fill="currentColor"/><rect x="10.75" y="6" width="2.5" height="14" rx="0.5" fill="currentColor"/><rect x="15" y="3" width="2.5" height="17" rx="0.5" fill="currentColor"/></>),
  temple:     icon(<><path d="M4 20h16"/><path d="M4 9l8-6 8 6"/><path d="M6.5 9v11M10 9v11M14 9v11M17.5 9v11"/><path d="M4 9h16"/></>),
  factory:    icon(<><path d="M4 20V11l4.8-4.8v4.8l4.8-4.8v4.8L18.4 6.2V20H4z"/><rect x="6.5" y="14.5" width="2.5" height="3.5" fill="currentColor"/><rect x="11" y="14.5" width="2.5" height="3.5" fill="currentColor"/></>),
  sun:        icon(<><circle cx="12" cy="12" r="5"/><path d="M12 3v2.5M12 18.5V21M21 12h-2.5M5.5 12H3M18.4 5.6l-1.8 1.8M7.4 16.6l-1.8 1.8M18.4 18.4l-1.8-1.8M7.4 7.4L5.6 5.6"/></>),
  moon:       icon(<path d="M18 12A8.5 8.5 0 119.5 4a6 6 0 008.5 8z"/>),
  warn:       icon(<><path d="M12 3L2 21h20L12 3z"/><path d="M12 10v5"/><circle cx="12" cy="18" r="1" fill="currentColor"/></>),
  download:   icon(<><path d="M5 16v3a1 1 0 001 1h12a1 1 0 001-1v-3"/><path d="M12 4v12"/><path d="M7 12l5 5 5-5"/></>),
  sliders:    icon(<><rect x="4" y="4" width="16" height="16" rx="2.5"/><circle cx="8.5" cy="12" r="2.5"/><circle cx="15.5" cy="10" r="2.5"/><path d="M8.5 4v7M8.5 14.5v5.5M15.5 4v3.5M15.5 12.5v7.5"/></>),
  chevDown:   icon(<path d="M6 9l6 6 6-6"/>),
  arrowLeft:  icon(<><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></>),
  arrowRight: icon(<><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></>),
  upload:     icon(<><path d="M5 16v3a1 1 0 001 1h12a1 1 0 001-1v-3"/><path d="M12 16V4"/><path d="M7 9l5-5 5 5"/></>),
};

// ── Tobias Design Tokens — Monochromatic Dark + Contextual Accent ──
const T = {
  bg:             "#111113",
  surface:        "#18181B",
  surfaceRaised:  "#1F1F23",
  surfaceHover:   "#26262B",
  flame:          "#F27123",
  cyan:           "#00D9FF",
  gold:           "#D4A853",
  magenta:        "#E5375E",
  green:          "#34D399",
  purple:         "#8B5CF6",
  text:           "#E8E6E3",
  textSoft:       "#A1A1AA",
  textMuted:      "#63636E",
  border:         "rgba(255,255,255,0.06)",
  borderHover:    "rgba(255,255,255,0.12)",
};

// ── Typography ──
const font = {
  display: "'OmniPresent', 'Inter', system-ui, -apple-system, sans-serif",
  body:    "'Inter', system-ui, -apple-system, sans-serif",
  mono:    "'JetBrains Mono', 'SF Mono', Menlo, monospace",
};

// ── Persona Data ──
const teams = {
  marketing: {
    name: "Marketing & Strategy", icon: IC.megaphone, color: T.flame,
    members: [
      { id: "ogilvy", name: "David Ogilvy", title: "Father of Advertising", era: "1911–1999", model: "Claude Sonnet", avatar: IC.crown },
      { id: "hopkins", name: "Claude Hopkins", title: "Scientific Advertiser", era: "1866–1932", model: "GPT-4o" },
      { id: "burnett", name: "Leo Burnett", title: "Sultan of Symbols", era: "1891–1971", model: "DeepSeek V3" },
      { id: "wells", name: "Mary Wells Lawrence", title: "Queen of Madison Ave", era: "1928–present", model: "Gemini Flash", avatar: IC.crown },
      { id: "halbert", name: "Gary Halbert", title: "Prince of Print", era: "1938–2007", model: "Mistral Large" },
    ],
  },
  design: {
    name: "Design & Visual", icon: IC.palette, color: T.cyan,
    members: [
      { id: "rand", name: "Paul Rand", title: "Modernist Master", era: "1914–1996", model: "Claude Sonnet" },
      { id: "scher", name: "Paula Scher", title: "Master of Big Type", era: "1948–present", model: "GPT-4o Mini", avatar: IC.spark },
      { id: "bass", name: "Saul Bass", title: "Changed Cinema", era: "1920–1996", model: "DeepSeek V3" },
      { id: "kare", name: "Susan Kare", title: "Pixel Pioneer", era: "1954–present", model: "Gemini Flash" },
      { id: "janoff", name: "Rob Janoff", title: "Bit the Apple", era: "1950–present", model: "MiniMax" },
      { id: "tobias", name: "Tobias v. Schneider", title: "Digital Provocateur", era: "1986–present", model: "Kimi K2", avatar: IC.bolt },
    ],
  },
  business: {
    name: "Business & Strategy", icon: IC.chart, color: T.gold,
    members: [
      { id: "musk", name: "Elon Musk", title: "First Principles", era: "1971–present", model: "DeepSeek R1", avatar: IC.rocket },
      { id: "bezos", name: "Jeff Bezos", title: "Customer Obsessed", era: "1964–present", model: "Claude Sonnet" },
      { id: "buffett", name: "Warren Buffett", title: "Oracle of Omaha", era: "1930–present", model: "GPT-4o" },
      { id: "branson", name: "Richard Branson", title: "Maverick Disruptor", era: "1950–present", model: "Gemini Flash" },
      { id: "mateschitz", name: "Dietrich Mateschitz", title: "Category Creator", era: "1944–2022", model: "Mistral Large" },
    ],
  },
};

const leadership = {
  moderator: { id: "jobs", name: "Steve Jobs", title: "Visionary Provocateur", avatar: IC.spark, model: "Claude Opus" },
  evaluator: { id: "ive", name: "Jony Ive", title: "Craft Perfectionist", avatar: IC.star, model: "GPT-4o" },
  da: { id: "da", name: "Devil's Advocate", title: "Promoter of the Faith", avatar: IC.advocate, model: "DeepSeek R1" },
};

const presets = [
  { id: "quick", name: "Quick Test", desc: "3 participants, fast models", icon: IC.bolt, color: T.green, time: "~5 min", participants: 3, rounds: 3 },
  { id: "message", name: "Message Lab", desc: "5 copywriters, messaging focus", icon: IC.chat, color: T.cyan, time: "~12 min", participants: 5, rounds: 5 },
  { id: "genesis", name: "Genesis Chamber", desc: "Full 7-persona war room", icon: IC.temple, color: T.flame, time: "~25 min", participants: 7, rounds: 8, recommended: true },
  { id: "assembly", name: "Assembly Line", desc: "16 personas, maximum coverage", icon: IC.factory, color: T.gold, time: "~45 min", participants: 16, rounds: 8 },
];

// ─────────────────────────────────────────────────────────
// Sub-components — Tobias: Flat, typographic, generous space
// ─────────────────────────────────────────────────────────

function Tag({ children, color = T.cyan }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "3px 10px", borderRadius: 4,
      fontSize: 9, fontFamily: font.mono, fontWeight: 500,
      textTransform: "uppercase", letterSpacing: "0.12em",
      color, background: `${color}1a`,
    }}>{children}</span>
  );
}

function StepNav({ current, total = 3, labels }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
      {labels.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", flex: i < total - 1 ? 1 : "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontFamily: font.mono, fontWeight: 600,
                background: active ? T.text : done ? `${T.text}22` : "transparent",
                color: active ? T.bg : done ? T.text : T.textMuted,
                border: `1px solid ${active ? T.text : done ? `${T.text}33` : T.border}`,
                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
              }}>{done ? <span style={{ fontSize: 13 }}>{IC.check}</span> : i + 1}</div>
              <span style={{
                fontSize: 11, fontFamily: font.mono, fontWeight: 500,
                letterSpacing: "0.04em",
                color: active ? T.text : done ? T.textSoft : T.textMuted,
                whiteSpace: "nowrap",
              }}>{label}</span>
            </div>
            {i < total - 1 && (
              <div style={{
                flex: 1, height: 1, margin: "0 16px",
                background: done ? `${T.text}22` : T.border,
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function PresetCard({ preset, selected, onClick }) {
  const active = selected === preset.id;
  return (
    <div onClick={onClick} style={{
      background: active ? T.surfaceRaised : T.surface,
      border: `1px solid ${active ? T.borderHover : T.border}`,
      borderRadius: 10, padding: "24px 22px", cursor: "pointer",
      position: "relative", flex: "1 1 0", minWidth: 170,
      transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    }}>
      {preset.recommended && (
        <div style={{ position: "absolute", top: 14, right: 14 }}>
          <Tag color={T.flame}>REC</Tag>
        </div>
      )}
      <div style={{ fontSize: 26, marginBottom: 16, color: active ? preset.color : T.textSoft, transition: "color 0.2s" }}>
        {preset.icon}
      </div>
      <div style={{
        fontSize: 15, fontFamily: font.display, fontWeight: 600,
        letterSpacing: "-0.02em",
        color: active ? T.text : T.textSoft, marginBottom: 6,
        transition: "color 0.2s",
      }}>{preset.name}</div>
      <div style={{
        fontSize: 13, color: T.textMuted, lineHeight: 1.5, marginBottom: 18,
      }}>{preset.desc}</div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        <Tag color={T.textMuted}>{preset.participants} personas</Tag>
        <Tag color={T.textMuted}>{preset.rounds} rnds</Tag>
        <Tag color={T.textMuted}>{preset.time}</Tag>
      </div>
      {active && (
        <div style={{
          position: "absolute", bottom: 0, left: 20, right: 20, height: 2,
          background: preset.color, borderRadius: "2px 2px 0 0",
        }} />
      )}
    </div>
  );
}

function PersonaChip({ persona, selected, onToggle, teamColor }) {
  return (
    <div onClick={onToggle} style={{
      display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
      background: selected ? T.surfaceRaised : T.surface,
      border: `1px solid ${selected ? T.borderHover : T.border}`,
      borderRadius: 8, cursor: "pointer",
      transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
      opacity: selected ? 1 : 0.65,
      minWidth: 230, flex: "1 1 230px", maxWidth: 340,
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: "50%",
        background: selected ? `${teamColor}15` : T.surfaceRaised,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 18, color: selected ? teamColor : T.textMuted,
        border: `1.5px solid ${selected ? teamColor : "transparent"}`,
        transition: "all 0.2s", flexShrink: 0,
      }}>{persona.avatar || persona.name[0]}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: T.text, lineHeight: 1.2 }}>{persona.name}</div>
        <div style={{ fontSize: 10, color: selected ? teamColor : T.textMuted, fontWeight: 500, marginTop: 2 }}>{persona.title}</div>
        <div style={{ fontSize: 9, fontFamily: font.mono, color: T.textMuted, marginTop: 3, letterSpacing: "0.04em" }}>
          {persona.era} · {persona.model}
        </div>
      </div>
      <div style={{
        width: 22, height: 22, borderRadius: 5, flexShrink: 0,
        background: selected ? teamColor : "transparent",
        border: `1.5px solid ${selected ? teamColor : T.borderHover}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.15s",
      }}>{selected && <span style={{ color: "#fff", fontSize: 12 }}>{IC.check}</span>}</div>
    </div>
  );
}

function LeaderCard({ role, person, color }) {
  return (
    <div style={{
      background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10,
      padding: "20px 18px", flex: "1 1 200px",
    }}>
      <Tag color={color}>{role}</Tag>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 14 }}>
        <div style={{
          width: 40, height: 40, borderRadius: "50%", background: `${color}12`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 18, color,
        }}>{person.avatar || person.name[0]}</div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{person.name}</div>
          <div style={{ fontSize: 10, fontFamily: font.mono, color: T.textMuted, letterSpacing: "0.04em", marginTop: 2 }}>{person.model}</div>
        </div>
      </div>
    </div>
  );
}

function Btn({ children, onClick, color = T.flame, secondary, disabled, large }) {
  return (
    <button onClick={disabled ? undefined : onClick} style={{
      padding: large ? "16px 40px" : "12px 26px",
      borderRadius: large ? 8 : 6,
      fontSize: large ? 15 : 13,
      fontFamily: font.body, fontWeight: 600,
      letterSpacing: "-0.01em",
      background: secondary ? "transparent" : disabled ? T.surfaceRaised : color,
      color: secondary ? T.textSoft : disabled ? T.textMuted : "#fff",
      border: secondary ? `1px solid ${T.border}` : "none",
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.45 : 1,
      transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
      display: "inline-flex", alignItems: "center", gap: 8,
    }}>{children}</button>
  );
}

// ─────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────

export default function LauncherRedesign() {
  const [mode, setMode] = useState(null);
  const [step, setStep] = useState(0);
  const [selectedPreset, setSelectedPreset] = useState("genesis");
  const [selectedPersonas, setSelectedPersonas] = useState(new Set(["ogilvy", "rand", "bass", "wells", "musk", "bezos", "halbert"]));
  const [brief, setBrief] = useState("");
  const [daEnabled, setDaEnabled] = useState(true);
  const [expandedTeam, setExpandedTeam] = useState("marketing");

  const togglePersona = (id) => {
    const next = new Set(selectedPersonas);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelectedPersonas(next);
  };

  const totalSelected = selectedPersonas.size;

  const Page = ({ children }) => (
    <div style={{
      background: T.bg, minHeight: "100vh", fontFamily: font.body,
      color: T.text, WebkitFontSmoothing: "antialiased",
    }}>
      <style>{`@font-face { font-family: 'OmniPresent'; src: url('https://cdn.jsdelivr.net/gh/DonRuben/Hosting-Assets-Externally@main/Fonts/Font-%20OmniPresent%20Main/OmniPresent.woff') format('woff'); font-display: swap; }`}</style>
      {children}
    </div>
  );

  // ─── ENTRY SCREEN ───
  if (mode === null) {
    return (
      <Page>
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          minHeight: "100vh", padding: "40px 34px",
        }}>
          <div style={{ textAlign: "center", maxWidth: 560, marginBottom: 64 }}>
            <div style={{
              fontSize: 10, fontFamily: font.mono, fontWeight: 500, color: T.flame,
              textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 20,
            }}>Genesis Chamber</div>
            <h1 style={{
              fontSize: 42, fontFamily: font.display, fontWeight: 700,
              color: T.text, margin: "0 0 18px",
              letterSpacing: "-0.035em", lineHeight: 1.05,
            }}>Launch a Creative<br/>Simulation</h1>
            <p style={{
              fontSize: 15, color: T.textSoft, lineHeight: 1.7, margin: 0,
              maxWidth: 420, marginLeft: "auto", marginRight: "auto",
            }}>
              Assemble legendary minds to compete, critique, and create breakthrough concepts for your brand.
            </p>
          </div>

          <div style={{ display: "flex", gap: 16, maxWidth: 540, width: "100%" }}>
            <div onClick={() => { setMode("quick"); setStep(0); }} style={{
              flex: 1, background: T.surface, border: `1px solid ${T.border}`,
              borderRadius: 12, padding: "36px 28px", cursor: "pointer", textAlign: "center",
              transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            }}>
              <div style={{
                width: 52, height: 52, borderRadius: 12, background: `${T.green}10`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 26, color: T.green, margin: "0 auto 20px",
              }}>{IC.bolt}</div>
              <div style={{ fontSize: 17, fontFamily: font.display, fontWeight: 600, letterSpacing: "-0.02em", color: T.text, marginBottom: 8 }}>
                Quick Start
              </div>
              <p style={{ fontSize: 13, color: T.textMuted, margin: "0 0 20px", lineHeight: 1.6 }}>
                Pick a preset, enter your brief, launch in 60 seconds
              </p>
              <Tag color={T.green}>2 STEPS</Tag>
            </div>

            <div onClick={() => { setMode("custom"); setStep(0); }} style={{
              flex: 1, background: T.surface, border: `1px solid ${T.border}`,
              borderRadius: 12, padding: "36px 28px", cursor: "pointer", textAlign: "center",
              transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            }}>
              <div style={{
                width: 52, height: 52, borderRadius: 12, background: `${T.cyan}10`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 26, color: T.cyan, margin: "0 auto 20px",
              }}>{IC.sliders}</div>
              <div style={{ fontSize: 17, fontFamily: font.display, fontWeight: 600, letterSpacing: "-0.02em", color: T.text, marginBottom: 8 }}>
                Custom Setup
              </div>
              <p style={{ fontSize: 13, color: T.textMuted, margin: "0 0 20px", lineHeight: 1.6 }}>
                Hand-pick personas, configure DA, fine-tune every detail
              </p>
              <Tag color={T.cyan}>3 STEPS</Tag>
            </div>
          </div>

          <button onClick={() => setMode(null)} style={{
            marginTop: 40, fontSize: 12, fontFamily: font.mono, color: T.textMuted,
            background: "none", border: "none", cursor: "pointer",
            letterSpacing: "0.04em",
          }}>Continue a previous simulation →</button>
        </div>
      </Page>
    );
  }

  // ─── QUICK START FLOW ───
  if (mode === "quick") {
    return (
      <Page>
        <div style={{
          borderBottom: `1px solid ${T.border}`, padding: "14px 34px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <button onClick={() => { setMode(null); setStep(0); }} style={{
              background: "transparent", border: `1px solid ${T.border}`, borderRadius: 5,
              padding: "5px 10px", cursor: "pointer", color: T.textSoft, fontSize: 13,
              fontFamily: font.body, display: "flex", alignItems: "center", gap: 4,
            }}>{IC.arrowLeft}<span style={{ fontSize: 12 }}>Back</span></button>
            <span style={{ fontSize: 13, fontFamily: font.display, fontWeight: 600, color: T.text, letterSpacing: "-0.02em" }}>Quick Start</span>
            <Tag color={T.green}>FAST</Tag>
          </div>
          <StepNav current={step} total={2} labels={["Preset", "Brief"]} />
        </div>

        <div style={{ maxWidth: 780, margin: "0 auto", padding: "40px 34px" }}>
          {step === 0 && (
            <>
              <h2 style={{ fontSize: 26, fontFamily: font.display, fontWeight: 600, color: T.text, margin: "0 0 8px", letterSpacing: "-0.03em" }}>
                Pick Your Battle Format
              </h2>
              <p style={{ fontSize: 14, color: T.textMuted, margin: "0 0 28px", lineHeight: 1.6 }}>
                Each preset includes pre-selected personas, models, and round structure.
              </p>

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                {presets.map(p => (
                  <PresetCard key={p.id} preset={p} selected={selectedPreset} onClick={() => setSelectedPreset(p.id)} />
                ))}
              </div>

              {selectedPreset && (
                <div style={{
                  marginTop: 24, background: T.surface, borderRadius: 10, padding: 24,
                  border: `1px solid ${T.border}`,
                }}>
                  <div style={{
                    fontSize: 9, fontFamily: font.mono, fontWeight: 500, color: T.textMuted,
                    textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 12,
                  }}>INCLUDED TEAM</div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20 }}>
                    {selectedPreset === "quick" && <><Tag color={T.flame}>Ogilvy</Tag><Tag color={T.cyan}>Rand</Tag><Tag color={T.gold}>Bezos</Tag></>}
                    {selectedPreset === "genesis" && <><Tag color={T.flame}>Ogilvy</Tag><Tag color={T.flame}>Hopkins</Tag><Tag color={T.flame}>Halbert</Tag><Tag color={T.cyan}>Rand</Tag><Tag color={T.cyan}>Bass</Tag><Tag color={T.gold}>Musk</Tag><Tag color={T.gold}>Bezos</Tag></>}
                    {selectedPreset === "message" && <><Tag color={T.flame}>Ogilvy</Tag><Tag color={T.flame}>Hopkins</Tag><Tag color={T.flame}>Burnett</Tag><Tag color={T.flame}>Wells</Tag><Tag color={T.flame}>Halbert</Tag></>}
                    {selectedPreset === "assembly" && <Tag color={T.textMuted}>All 16 personas</Tag>}
                  </div>
                  <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                    <LeaderCard role="MODERATOR" person={leadership.moderator} color={T.gold} />
                    <LeaderCard role="EVALUATOR" person={leadership.evaluator} color={T.purple} />
                    <LeaderCard role="DEVIL'S ADVOCATE" person={leadership.da} color={T.magenta} />
                  </div>
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 28 }}>
                <Btn onClick={() => setStep(1)}>Continue to Brief {IC.arrowRight}</Btn>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <h2 style={{ fontSize: 26, fontFamily: font.display, fontWeight: 600, color: T.text, margin: "0 0 8px", letterSpacing: "-0.03em" }}>
                What Should They Fight About?
              </h2>
              <p style={{ fontSize: 14, color: T.textMuted, margin: "0 0 28px", lineHeight: 1.6 }}>
                Describe your brand, product, or creative challenge. More context yields sharper concepts.
              </p>

              <textarea
                value={brief} onChange={e => setBrief(e.target.value)}
                placeholder="Example: We're launching a premium sparkling water brand called 'AquaLux' targeting health-conscious millennials. The positioning should feel like luxury, not health food. We want a campaign concept that works across social, OOH, and video. Budget: $2M."
                style={{
                  width: "100%", minHeight: 180, background: T.surface,
                  border: `1px solid ${T.border}`, borderRadius: 8,
                  padding: "18px 20px", color: T.text, fontSize: 14,
                  fontFamily: font.body, lineHeight: 1.7, resize: "vertical", outline: "none",
                }}
              />

              <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                <Btn secondary>{IC.upload} Upload Brief</Btn>
                <Btn secondary>{IC.clipboard} Load Template</Btn>
              </div>

              <div style={{
                marginTop: 40, background: T.surface, borderRadius: 10, padding: 28,
                border: `1px solid ${T.border}`,
              }}>
                <div style={{
                  fontSize: 9, fontFamily: font.mono, fontWeight: 500, color: T.textMuted,
                  textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 18,
                }}>LAUNCH SUMMARY</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
                  {[
                    { label: "Format", value: presets.find(p => p.id === selectedPreset)?.name },
                    { label: "Participants", value: `${presets.find(p => p.id === selectedPreset)?.participants} personas` },
                    { label: "Est. Duration", value: presets.find(p => p.id === selectedPreset)?.time },
                  ].map(item => (
                    <div key={item.label}>
                      <div style={{ fontSize: 10, fontFamily: font.mono, color: T.textMuted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>{item.label}</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 28 }}>
                <Btn onClick={() => setStep(0)} secondary>{IC.arrowLeft} Back</Btn>
                <Btn onClick={() => {}} color={T.flame} large>{IC.rocket} Launch Simulation</Btn>
              </div>
            </>
          )}
        </div>
      </Page>
    );
  }

  // ─── CUSTOM FLOW ───
  return (
    <Page>
      <div style={{
        borderBottom: `1px solid ${T.border}`, padding: "14px 34px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <button onClick={() => { if (step === 0) setMode(null); else setStep(s => s - 1); }} style={{
            background: "transparent", border: `1px solid ${T.border}`, borderRadius: 5,
            padding: "5px 10px", cursor: "pointer", color: T.textSoft, fontSize: 13,
            fontFamily: font.body, display: "flex", alignItems: "center", gap: 4,
          }}>{IC.arrowLeft}<span style={{ fontSize: 12 }}>Back</span></button>
          <span style={{ fontSize: 13, fontFamily: font.display, fontWeight: 600, color: T.text, letterSpacing: "-0.02em" }}>Custom Setup</span>
          <Tag color={T.cyan}>FULL CONTROL</Tag>
        </div>
        <StepNav current={step} total={3} labels={["Team", "Leadership", "Brief"]} />
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "40px 34px" }}>
        {step === 0 && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 28 }}>
              <div>
                <h2 style={{ fontSize: 26, fontFamily: font.display, fontWeight: 600, color: T.text, margin: "0 0 6px", letterSpacing: "-0.03em" }}>
                  Assemble Your Team
                </h2>
                <p style={{ fontSize: 14, color: T.textMuted, margin: 0, lineHeight: 1.6 }}>
                  Select 3–16 personas across disciplines. Each brings unique expertise.
                </p>
              </div>
              <div style={{
                padding: "8px 18px", background: T.surface, borderRadius: 6,
                border: `1px solid ${T.border}`, display: "flex", alignItems: "baseline", gap: 6,
              }}>
                <span style={{ fontSize: 22, fontFamily: font.display, fontWeight: 700, color: totalSelected >= 3 ? T.cyan : T.magenta }}>
                  {totalSelected}
                </span>
                <span style={{ fontSize: 11, fontFamily: font.mono, color: T.textMuted, letterSpacing: "0.04em" }}>selected</span>
              </div>
            </div>

            {Object.entries(teams).map(([key, team]) => {
              const isExpanded = expandedTeam === key;
              const teamSelected = team.members.filter(m => selectedPersonas.has(m.id)).length;
              return (
                <div key={key} style={{ marginBottom: 10 }}>
                  <div onClick={() => setExpandedTeam(isExpanded ? null : key)} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "14px 18px", background: T.surface,
                    borderRadius: isExpanded ? "8px 8px 0 0" : 8,
                    border: `1px solid ${T.border}`, cursor: "pointer",
                    borderBottom: isExpanded ? `1px solid ${T.border}` : undefined,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontSize: 18, color: team.color }}>{team.icon}</span>
                      <span style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{team.name}</span>
                      <Tag color={team.color}>{teamSelected}/{team.members.length}</Tag>
                    </div>
                    <span style={{
                      fontSize: 16, color: T.textMuted,
                      transition: "transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                      transform: isExpanded ? "rotate(180deg)" : "none", display: "flex",
                    }}>{IC.chevDown}</span>
                  </div>
                  {isExpanded && (
                    <div style={{
                      display: "flex", flexWrap: "wrap", gap: 8, padding: 14,
                      background: `${T.surface}ee`, borderRadius: "0 0 8px 8px",
                      border: `1px solid ${T.border}`, borderTop: "none",
                    }}>
                      {team.members.map(m => (
                        <PersonaChip key={m.id} persona={m}
                          selected={selectedPersonas.has(m.id)}
                          onToggle={() => togglePersona(m.id)}
                          teamColor={team.color}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 28 }}>
              <Btn onClick={() => setStep(1)} disabled={totalSelected < 3}>
                Continue to Leadership {IC.arrowRight}
              </Btn>
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <h2 style={{ fontSize: 26, fontFamily: font.display, fontWeight: 600, color: T.text, margin: "0 0 8px", letterSpacing: "-0.03em" }}>
              Configure Leadership
            </h2>
            <p style={{ fontSize: 14, color: T.textMuted, margin: "0 0 28px", lineHeight: 1.6 }}>
              Set the moderator, evaluator, and Devil's Advocate for this simulation.
            </p>

            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 24 }}>
              <LeaderCard role="MODERATOR" person={leadership.moderator} color={T.gold} />
              <LeaderCard role="EVALUATOR" person={leadership.evaluator} color={T.purple} />
            </div>

            <div style={{
              background: T.surface, borderRadius: 10, padding: 24,
              border: `1px solid ${daEnabled ? `${T.magenta}22` : T.border}`,
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <span style={{ fontSize: 26, color: daEnabled ? T.magenta : T.textMuted }}>{IC.advocate}</span>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: T.text }}>Devil's Advocate</div>
                    <div style={{ fontSize: 13, color: T.textMuted, lineHeight: 1.5 }}>
                      Adversarial testing — weak ideas die fast, strong ideas emerge battle-hardened
                    </div>
                  </div>
                </div>
                <div onClick={() => setDaEnabled(!daEnabled)} style={{
                  width: 44, height: 24, borderRadius: 12, cursor: "pointer",
                  background: daEnabled ? T.magenta : T.surfaceRaised,
                  padding: 2, transition: "background 0.2s", position: "relative",
                  border: `1px solid ${daEnabled ? T.magenta : T.border}`,
                }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: "50%", background: "#fff",
                    transition: "transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                    transform: daEnabled ? "translateX(20px)" : "translateX(0)",
                  }} />
                </div>
              </div>
              {daEnabled && (
                <div style={{ marginTop: 18, display: "flex", gap: 16 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: 9, fontFamily: font.mono, color: T.textMuted, marginBottom: 8,
                      textTransform: "uppercase", letterSpacing: "0.12em",
                    }}>Aggression Level</div>
                    <div style={{ display: "flex", gap: 6 }}>
                      {["Mild", "Standard", "Ruthless"].map((level, i) => (
                        <button key={level} style={{
                          padding: "6px 14px", borderRadius: 5, fontSize: 11, fontWeight: 500,
                          fontFamily: font.mono, background: i === 1 ? `${T.magenta}15` : "transparent",
                          color: i === 1 ? T.magenta : T.textMuted,
                          border: `1px solid ${i === 1 ? `${T.magenta}33` : T.border}`,
                          cursor: "pointer", letterSpacing: "0.04em",
                        }}>{level}</button>
                      ))}
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: 9, fontFamily: font.mono, color: T.textMuted, marginBottom: 8,
                      textTransform: "uppercase", letterSpacing: "0.12em",
                    }}>Model</div>
                    <div style={{
                      padding: "6px 14px", borderRadius: 5, fontSize: 12, fontFamily: font.mono,
                      background: T.surfaceRaised, color: T.textSoft,
                      border: `1px solid ${T.border}`, letterSpacing: "0.04em",
                    }}>DeepSeek R1</div>
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 28 }}>
              <Btn onClick={() => setStep(0)} secondary>{IC.arrowLeft} Back</Btn>
              <Btn onClick={() => setStep(2)}>Continue to Brief {IC.arrowRight}</Btn>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h2 style={{ fontSize: 26, fontFamily: font.display, fontWeight: 600, color: T.text, margin: "0 0 8px", letterSpacing: "-0.03em" }}>
              Set the Challenge
            </h2>
            <p style={{ fontSize: 14, color: T.textMuted, margin: "0 0 28px", lineHeight: 1.6 }}>
              Your brief is the battlefield. The better the context, the sharper the concepts.
            </p>

            <textarea
              value={brief} onChange={e => setBrief(e.target.value)}
              placeholder="Describe your brand, product, target audience, and what kind of creative concept you need..."
              style={{
                width: "100%", minHeight: 170, background: T.surface,
                border: `1px solid ${T.border}`, borderRadius: 8,
                padding: "18px 20px", color: T.text, fontSize: 14,
                fontFamily: font.body, lineHeight: 1.7, resize: "vertical", outline: "none",
              }}
            />
            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
              <Btn secondary>{IC.upload} Upload Brief</Btn>
              <Btn secondary>{IC.clipboard} Load Template</Btn>
            </div>

            <div style={{
              marginTop: 40, background: T.surface, borderRadius: 10, padding: 32,
              border: `1px solid ${T.border}`, position: "relative", overflow: "hidden",
            }}>
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0, height: 2,
                background: T.flame,
              }} />

              <div style={{
                fontSize: 9, fontFamily: font.mono, fontWeight: 500, color: T.textMuted,
                textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 20, marginTop: 4,
              }}>LAUNCH SUMMARY</div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 24 }}>
                <div>
                  <div style={{ fontSize: 10, fontFamily: font.mono, color: T.textMuted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>Participants</div>
                  <div style={{ fontSize: 22, fontFamily: font.display, fontWeight: 700, color: T.cyan }}>{totalSelected}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, fontFamily: font.mono, color: T.textMuted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>Moderator</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{leadership.moderator.name}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, fontFamily: font.mono, color: T.textMuted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>Devil's Advocate</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: daEnabled ? T.magenta : T.textMuted }}>
                    {daEnabled ? "Enabled" : "Disabled"}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 10, fontFamily: font.mono, color: T.textMuted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>Est. Duration</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>~{Math.ceil(totalSelected * 3.5)} min</div>
                </div>
              </div>

              <div style={{ marginTop: 20, display: "flex", gap: 6, flexWrap: "wrap" }}>
                {[...selectedPersonas].slice(0, 10).map(id => {
                  const all = Object.values(teams).flatMap(t => t.members);
                  const p = all.find(m => m.id === id);
                  if (!p) return null;
                  return <Tag key={id} color={T.textSoft}>{p.name}</Tag>;
                })}
                {totalSelected > 10 && <Tag color={T.textMuted}>+{totalSelected - 10} more</Tag>}
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 32 }}>
              <Btn onClick={() => setStep(1)} secondary>{IC.arrowLeft} Back</Btn>
              <Btn onClick={() => {}} color={T.flame} large>{IC.rocket} Launch Simulation</Btn>
            </div>
          </>
        )}
      </div>
    </Page>
  );
}
