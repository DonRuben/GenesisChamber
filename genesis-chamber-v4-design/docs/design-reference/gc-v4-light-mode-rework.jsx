import { useState } from "react";

// ═══════════════════════════════════════════════════════════════
// GENESIS CHAMBER V4 — Light Mode Rework
// Tobias van Schneider — flat surfaces, 2px accents, no shadows
// Live dark/light toggle · Token map · Component fixes · Audit
// ═══════════════════════════════════════════════════════════════

const s = { display: "inline-block", verticalAlign: "-0.125em" };
const IC = {
  sun: <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={s}><circle cx="10" cy="10" r="4"/><path d="M10 2v2M10 16v2M18 10h-2M4 10H2M15.5 4.5l-1.4 1.4M5.9 14.1l-1.4 1.4M15.5 15.5l-1.4-1.4M5.9 5.9L4.5 4.5"/></svg>,
  moon: <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={s}><path d="M15 10A7 7 0 118 3a5 5 0 007 7z"/></svg>,
  palette: <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={s}><circle cx="10" cy="10" r="8"/><circle cx="7" cy="7" r="1.2" fill="currentColor"/><circle cx="13" cy="7" r="1.2" fill="currentColor"/><circle cx="6" cy="11" r="1.2" fill="currentColor"/></svg>,
  check: <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={s}><path d="M4 10l4 4 8-8"/></svg>,
  warn: <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={s}><path d="M10 2L1 18h18L10 2z"/><path d="M10 8v4"/><circle cx="10" cy="15" r="1" fill="currentColor"/></svg>,
};
const font = { display: "'OmniPresent', Inter, system-ui", body: "Inter, system-ui, sans-serif", mono: "'JetBrains Mono', monospace" };

// ── Token Systems ──
const DARK = {
  bg: "#111113", surface: "#18181B", surfaceRaised: "#1F1F23", surfaceHover: "#26262B",
  border: "rgba(255,255,255,0.06)", borderHover: "rgba(255,255,255,0.12)", borderStrong: "rgba(255,255,255,0.18)",
  text: "#E8E6E3", textSoft: "#A1A1AA", textMuted: "#63636E",
  flame: "#F27123", cyan: "#00D9FF", gold: "#D4A853", magenta: "#E5375E",
  green: "#34D399", purple: "#8B5CF6", amber: "#F59E0B", red: "#EF4444",
};
const LIGHT = {
  bg: "#F2F2F7", surface: "#FFFFFF", surfaceRaised: "#E8E8ED", surfaceHover: "#D1D1D6",
  border: "rgba(0,0,0,0.05)", borderHover: "rgba(0,0,0,0.10)", borderStrong: "rgba(0,0,0,0.18)",
  text: "#1C1C1E", textSoft: "#3A3A3C", textMuted: "#636366",
  flame: "#D4601A", cyan: "#0099BB", gold: "#CC9200", magenta: "#C42E4E",
  green: "#0A7A52", purple: "#6D3FC0", amber: "#B87400", red: "#C42E2E",
};

const Tag = ({ label, color }) => (<span style={{ fontFamily: font.mono, fontSize: 10, fontWeight: 600, color, background: `${color}14`, borderRadius: 4, padding: "2px 8px", textTransform: "uppercase", letterSpacing: "0.12em" }}>{label}</span>);
const MonoLabel = ({ children, icon, color }) => (<div style={{ fontFamily: font.mono, fontSize: 10, fontWeight: 600, color, textTransform: "uppercase", letterSpacing: "0.12em", display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>{icon && <span style={{ fontSize: 14 }}>{icon}</span>}{children}</div>);

function getTheme(isDark) {
  const t = isDark ? DARK : LIGHT;
  return {
    t,
    card: { background: t.surface, borderLeft: `2px solid ${t.border}`, borderRadius: 8, padding: 16, marginBottom: 13 },
    swatch: (c) => ({ width: 32, height: 32, borderRadius: 6, background: c, borderLeft: `2px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}` }),
    sevColor: { P0: t.red, P1: t.amber, P2: t.cyan, P3: t.textMuted },
  };
}

// ── Token map data ──
const TOKEN_MAP = [
  { name: "--surface-0", role: "Page background", key: "bg" },
  { name: "--surface-1", role: "Card / raised", key: "surface" },
  { name: "--surface-2", role: "Inputs / recessed", key: "surfaceRaised" },
  { name: "--surface-3", role: "Hover / active", key: "surfaceHover" },
  { name: "--border-subtle", role: "Dividers", key: "border" },
  { name: "--border-default", role: "Input borders", key: "borderHover" },
  { name: "--text-primary", role: "Headings, body", key: "text" },
  { name: "--text-secondary", role: "Descriptions", key: "textSoft" },
  { name: "--text-muted", role: "Labels, captions", key: "textMuted" },
];

// ── Accent tuning data ──
const ACCENT_MAP = [
  { name: "Cyan", darkVal: "#00D9FF", lightVal: "#0099BB", darkBg: "rgba(0,217,255,0.12)", lightBg: "rgba(0,153,187,0.08)" },
  { name: "Flame", darkVal: "#F27123", lightVal: "#D4601A", darkBg: "rgba(242,113,35,0.12)", lightBg: "rgba(212,96,26,0.08)" },
  { name: "Gold", darkVal: "#D4A853", lightVal: "#CC9200", darkBg: "rgba(212,168,83,0.12)", lightBg: "rgba(204,146,0,0.08)" },
  { name: "Magenta", darkVal: "#E5375E", lightVal: "#C42E4E", darkBg: "rgba(229,55,94,0.12)", lightBg: "rgba(196,46,78,0.08)" },
  { name: "Green", darkVal: "#34D399", lightVal: "#0A7A52", darkBg: "rgba(52,211,153,0.12)", lightBg: "rgba(10,122,82,0.08)" },
  { name: "Purple", darkVal: "#8B5CF6", lightVal: "#6D3FC0", darkBg: "rgba(139,92,246,0.12)", lightBg: "rgba(109,63,192,0.08)" },
];

// ── Component fix data ──
const COMPONENT_FIXES = [
  { component: "Stage1 (LLM Council)", file: "Stage1.css", count: 11, category: "borders",
    detail: "11 rgba(255,255,255,*) border rules invisible on white. Override all to rgba(0,0,0,*) in [data-theme=light].",
    css: `[data-theme="light"] .stage1-card { border-color: rgba(0,0,0,0.06); }
[data-theme="light"] .stage1-tab { border-left-color: rgba(0,0,0,0.08); }` },
  { component: "SimulationLauncher", file: "SimulationLauncher.css", count: 4, category: "overlays",
    detail: "Overlay rgba(0,0,0,0.6) too heavy on light. Reduce to 0.35. Background blur stays.",
    css: `[data-theme="light"] .launcher-overlay { background: rgba(0,0,0,0.35); }` },
  { component: "Gallery", file: "GeneratedGallery.css", count: 6, category: "text + borders",
    detail: "Lightbox close button and prompt text use white-alpha — invisible on white.",
    css: `[data-theme="light"] .lightbox-close { color: #1C1C1E; border-color: rgba(0,0,0,0.12); }
[data-theme="light"] .prompt-text { color: #3A3A3C; }` },
  { component: "DA Arena", file: "DAArena.css", count: 5, category: "accents",
    detail: "Red accents too vivid on white. Darken 15% and reduce background alpha.",
    css: `[data-theme="light"] .da-threat { color: #C42E2E; }
[data-theme="light"] .da-card { border-left-color: rgba(196,46,46,0.25); }` },
  { component: "Dashboard", file: "Dashboard.css", count: 3, category: "surfaces",
    detail: "Tab indicators and progress bars use white-alpha backgrounds.",
    css: `[data-theme="light"] .tab-indicator { background: rgba(0,0,0,0.06); }
[data-theme="light"] .progress-fill { opacity: 0.85; }` },
];

// ── Bug audit data ──
const BUGS = [
  { id: "B1", sev: "P0", file: "Stage1.css:11+", issue: "rgba(255,255,255,0.03) borders invisible on white", fix: "[data-theme=light] → rgba(0,0,0,0.04)" },
  { id: "B2", sev: "P0", file: "Stage1.css:89-349", issue: "8× white-alpha borders = invisible separators", fix: "Batch: all rgba(255,255,255,*) → rgba(0,0,0,*)" },
  { id: "B3", sev: "P0", file: "Launcher.css:323", issue: "Overlay rgba(0,0,0,0.6) too heavy", fix: "Override to rgba(0,0,0,0.35)" },
  { id: "B4", sev: "P1", file: "Gallery.css:259-326", issue: "Lightbox close + prompt text invisible on white", fix: "Invert to dark text" },
  { id: "B5", sev: "P1", file: "Stage2.css:144", issue: "White-alpha elevation on light surface", fix: "Override to rgba(0,0,0,0.06)" },
  { id: "B6", sev: "P1", file: "SoulInfo.css:8,25", issue: "Modal overlay too heavy in light", fix: "Reduce to rgba(0,0,0,0.3)" },
  { id: "B7", sev: "P2", file: "design-tokens.css", issue: "No system pref auto-detection", fix: "@media (prefers-color-scheme: light)" },
  { id: "B8", sev: "P2", file: "Global", issue: "Scrollbar hardcoded dark — jarring in light", fix: "Add scrollbar-color override" },
];

// ── Implementation steps ──
const IMPL_STEPS = [
  { n: 1, time: "8 min", label: "Add CSS variables to :root", desc: "Map all DARK tokens to CSS custom properties" },
  { n: 2, time: "5 min", label: "Add [data-theme=light] overrides", desc: "Override all surface/border/text variables for light" },
  { n: 3, time: "12 min", label: "Component CSS fixes", desc: "Add 25 [data-theme=light] rules across 7 files" },
  { n: 4, time: "5 min", label: "Accent color adaptation", desc: "Darken accents 15-20% in light mode" },
  { n: 5, time: "3 min", label: "Theme toggle JS", desc: "data-theme attribute + localStorage persistence" },
  { n: 6, time: "3 min", label: "System preference detection", desc: "@media (prefers-color-scheme) for initial theme" },
  { n: 7, time: "5 min", label: "Scrollbar + selection styles", desc: "Theme-aware scrollbar-color and ::selection" },
];

// ═══════════════════════════════════════════════════════════════
// TAB PANELS
// ═══════════════════════════════════════════════════════════════

function OverviewTab({ isDark, theme }) {
  const { t, card } = theme;
  const stats = [
    { n: 32, label: "Hardcoded rgba()", color: t.red },
    { n: 7, label: "Files affected", color: t.amber },
    { n: 25, label: "New override rules", color: t.cyan },
  ];
  const improvements = [
    { label: "Surface Contrast", old: "ΔL=2 (too close)", now: "ΔL=4 (clear hierarchy)" },
    { label: "Text Contrast", old: "#48484A (4.8:1)", now: "#3A3A3C (7.2:1 — WCAG AAA)" },
    { label: "Accent Colors", old: "Same as dark — too vivid", now: "Darkened 15-20% for print-like calm" },
    { label: "Component CSS", old: "0 overrides — all broken", now: "25 targeted [data-theme=light] rules" },
    { label: "System Pref", old: "No auto-detection", now: "@media (prefers-color-scheme) auto" },
  ];
  return (
    <div>
      <div style={card}>
        <MonoLabel icon={IC.sun} color={t.cyan}>What Changed in V4</MonoLabel>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 16 }}>
          {stats.map(s => (
            <div key={s.label} style={{ textAlign: "center", padding: 13, background: t.surfaceRaised, borderRadius: 6, borderLeft: `2px solid ${s.color}` }}>
              <div style={{ fontFamily: font.mono, fontSize: 24, fontWeight: 800, color: s.color }}>{s.n}</div>
              <div style={{ fontSize: 11, color: t.textMuted, marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
        {improvements.map((imp, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "120px 1fr 20px 1fr", gap: 10, padding: "6px 0", fontSize: 12, alignItems: "center" }}>
            <span style={{ fontWeight: 700, color: t.cyan }}>{imp.label}</span>
            <span style={{ color: t.textMuted }}>{imp.old}</span>
            <span style={{ color: t.textMuted, textAlign: "center" }}>→</span>
            <span style={{ color: t.text, fontWeight: 500 }}>{imp.now}</span>
          </div>
        ))}
      </div>

      {/* Live preview */}
      <div style={card}>
        <MonoLabel icon={IC.palette} color={t.flame}>Live Component Preview</MonoLabel>
        <div style={{ display: "flex", gap: 8, marginBottom: 13 }}>
          {["Launch Simulation", "View Results", "Export"].map(label => (
            <button key={label} style={{ padding: "6px 13px", borderRadius: 6, border: "none", fontSize: 11, fontWeight: 600, background: t.surfaceRaised, color: t.text, cursor: "pointer" }}>{label}</button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 6, marginBottom: 13 }}>
          {[{ l: "Running", c: t.cyan }, { l: "Winner", c: t.gold }, { l: "DA Active", c: t.magenta }].map(b => (
            <Tag key={b.l} label={b.l} color={b.c} />
          ))}
        </div>
        <div style={{ ...card, borderLeftColor: t.cyan }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: t.text, marginBottom: 6 }}>Concept: "Aurora Borealis"</div>
          <div style={{ fontSize: 12, color: t.textSoft, lineHeight: 1.6, marginBottom: 8 }}>A premium wellness brand drawing from Nordic light phenomena. Visual identity uses transitioning teals and luminous greens...</div>
          <div style={{ display: "flex", gap: 6 }}>
            <Tag label="SCORE: 8.7" color={t.cyan} />
            <Tag label="SURVIVING" color={t.green} />
          </div>
        </div>
      </div>
    </div>
  );
}

function TokenMapTab({ isDark, theme }) {
  const { t, card, swatch } = theme;
  return (
    <div style={card}>
      <MonoLabel color={t.cyan}>Surface + Text Token Map</MonoLabel>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {TOKEN_MAP.map(tok => (
          <div key={tok.name} style={{ display: "grid", gridTemplateColumns: "160px 130px 40px 40px", gap: 10, alignItems: "center", padding: "6px 0", borderBottom: `1px solid ${t.border}` }}>
            <div>
              <div style={{ fontFamily: font.mono, fontSize: 11, fontWeight: 600, color: t.text }}>{tok.name}</div>
              <div style={{ fontSize: 10, color: t.textMuted }}>{tok.role}</div>
            </div>
            <div style={{ fontFamily: font.mono, fontSize: 10, color: t.textMuted }}>{isDark ? DARK[tok.key] : LIGHT[tok.key]}</div>
            <div style={swatch(DARK[tok.key])} title="Dark" />
            <div style={swatch(LIGHT[tok.key])} title="Light" />
          </div>
        ))}
      </div>
    </div>
  );
}

function AccentTuningTab({ isDark, theme }) {
  const { t, card } = theme;
  return (
    <div style={card}>
      <MonoLabel icon={IC.palette} color={t.flame}>Accent Color Adaptation</MonoLabel>
      <div style={{ fontSize: 12, color: t.textSoft, marginBottom: 16, lineHeight: 1.6 }}>
        Pure saturated accents designed for dark backgrounds look garish on white. V4 darkens hue 15-20% and reduces alpha for a sophisticated, print-like feel.
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
        {ACCENT_MAP.map(a => (
          <div key={a.name} style={{ padding: 13, background: t.surfaceRaised, borderRadius: 6, borderLeft: `2px solid ${isDark ? a.darkVal : a.lightVal}` }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: t.text, marginBottom: 8 }}>{a.name}</div>
            <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
              <div style={{ width: 24, height: 24, borderRadius: 4, background: a.darkVal }} title="Dark" />
              <div style={{ width: 24, height: 24, borderRadius: 4, background: a.lightVal }} title="Light" />
            </div>
            <div style={{ fontFamily: font.mono, fontSize: 9, color: t.textMuted }}>{isDark ? a.darkVal : a.lightVal}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ComponentFixesTab({ isDark, theme }) {
  const { t, card } = theme;
  const [expanded, setExpanded] = useState(null);
  return (
    <div style={card}>
      <MonoLabel color={t.cyan}>Component-Level Override Map</MonoLabel>
      <div style={{ fontSize: 12, color: t.textSoft, marginBottom: 13, lineHeight: 1.6 }}>
        Each fix adds <code style={{ fontFamily: font.mono, fontSize: 10, color: t.cyan }}>[data-theme="light"]</code> scoped rules. No dark mode changes.
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {COMPONENT_FIXES.map((fix, i) => (
          <div key={i}>
            <div onClick={() => setExpanded(expanded === i ? null : i)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 13px", background: t.surfaceRaised, borderRadius: 6, borderLeft: `2px solid ${t.cyan}`, cursor: "pointer" }}>
              <div>
                <span style={{ fontSize: 13, fontWeight: 700, color: t.text }}>{fix.component}</span>
                <span style={{ fontSize: 11, color: t.textMuted, marginLeft: 8 }}>{fix.file}</span>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <Tag label={`${fix.count} fixes`} color={t.cyan} />
                <Tag label={fix.category} color={t.textMuted} />
              </div>
            </div>
            {expanded === i && (
              <div style={{ padding: "10px 13px", marginTop: 4 }}>
                <div style={{ fontSize: 12, color: t.textSoft, marginBottom: 8, lineHeight: 1.6 }}>{fix.detail}</div>
                <pre style={{ padding: 13, background: t.surfaceRaised, borderRadius: 6, borderLeft: `2px solid ${t.purple}`, fontFamily: font.mono, fontSize: 11, color: t.textSoft, lineHeight: 1.5, overflow: "auto", whiteSpace: "pre-wrap" }}>{fix.css}</pre>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function BugAuditTab({ isDark, theme }) {
  const { t, card, sevColor } = theme;
  const counts = { P0: 0, P1: 0, P2: 0 };
  BUGS.forEach(b => counts[b.sev]++);
  return (
    <div style={card}>
      <MonoLabel icon={IC.warn} color={t.red}>Light Mode Bug Audit — {BUGS.length} Issues</MonoLabel>
      <div style={{ display: "flex", gap: 6, marginBottom: 13 }}>
        {Object.entries(counts).map(([sev, count]) => (
          <Tag key={sev} label={`${sev}: ${count}`} color={sevColor[sev]} />
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {BUGS.map(bug => (
          <div key={bug.id} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "8px 10px", background: t.surfaceRaised, borderRadius: 6, borderLeft: `2px solid ${sevColor[bug.sev]}` }}>
            <Tag label={bug.sev} color={sevColor[bug.sev]} />
            <div style={{ flex: 1, fontSize: 12 }}>
              <span style={{ fontFamily: font.mono, fontSize: 10, color: t.textMuted }}>{bug.id} · {bug.file}</span>
              <div style={{ color: t.text, marginTop: 2 }}>{bug.issue}</div>
              <div style={{ color: t.green, marginTop: 2 }}>Fix: {bug.fix}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ImplementationTab({ isDark, theme }) {
  const { t, card } = theme;
  const total = IMPL_STEPS.reduce((sum, s) => sum + parseInt(s.time), 0);
  return (
    <div style={card}>
      <MonoLabel icon={IC.check} color={t.green}>Implementation Plan — ~{total} min total</MonoLabel>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {IMPL_STEPS.map(step => (
          <div key={step.n} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
            <div style={{ width: 24, height: 24, borderRadius: 9999, background: t.surfaceRaised, borderLeft: `2px solid ${t.green}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: font.mono, fontSize: 11, fontWeight: 700, color: t.green, flexShrink: 0 }}>{step.n}</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: t.text }}>{step.label} <span style={{ fontFamily: font.mono, fontSize: 10, color: t.textMuted }}>~{step.time}</span></div>
              <div style={{ fontSize: 12, color: t.textSoft, marginTop: 2 }}>{step.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN EXPORT
// ═══════════════════════════════════════════════════════════════

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "tokens", label: "Token Map" },
  { id: "accents", label: "Accents" },
  { id: "components", label: "Component Fixes" },
  { id: "audit", label: "Bug Audit" },
  { id: "implementation", label: "Implementation" },
];

export default function GCV4LightModeRework() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isDark, setIsDark] = useState(true);
  const theme = getTheme(isDark);
  const { t } = theme;
  const Tab = { overview: OverviewTab, tokens: TokenMapTab, accents: AccentTuningTab, components: ComponentFixesTab, audit: BugAuditTab, implementation: ImplementationTab }[activeTab];

  return (
    <div style={{ minHeight: "100vh", background: t.bg, color: t.text, fontFamily: font.body, padding: "21px 21px", transition: "background 0.3s, color 0.3s" }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 21 }}>
          <div>
            <div style={{ fontFamily: font.mono, fontSize: 10, color: t.textMuted, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 4 }}>Genesis Chamber V4 — Light Mode Rework</div>
            <div style={{ height: 1, background: t.flame, opacity: 0.15 }} />
          </div>
          <button onClick={() => setIsDark(!isDark)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 13px", borderRadius: 6, border: "none", cursor: "pointer", background: t.surfaceRaised, color: t.text, fontFamily: font.mono, fontSize: 11, fontWeight: 600 }}>
            {isDark ? IC.moon : IC.sun}
            {isDark ? "Dark" : "Light"}
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 21, flexWrap: "wrap", padding: 4, background: t.surface, borderRadius: 8 }}>
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              padding: "7px 13px", borderRadius: 6, border: "none", cursor: "pointer",
              fontSize: 11, fontWeight: 600, fontFamily: font.body,
              background: activeTab === tab.id ? t.surfaceRaised : "transparent",
              color: activeTab === tab.id ? t.text : t.textMuted,
            }}>{tab.label}</button>
          ))}
        </div>

        {/* Content */}
        <Tab isDark={isDark} theme={theme} />
      </div>
    </div>
  );
}
