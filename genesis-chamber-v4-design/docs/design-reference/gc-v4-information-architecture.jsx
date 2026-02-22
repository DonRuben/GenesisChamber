import { useState } from "react";

// ═══════════════════════════════════════════════════════════════════
// GENESIS CHAMBER V4 — INFORMATION ARCHITECTURE
// Tobias van Schneider — flat surfaces, 2px accents, no shadows
// Landing + Mode Selection + Recent Sims + Empty States + Sidebar
// ═══════════════════════════════════════════════════════════════════

const s = { display: "inline-block", verticalAlign: "-0.125em" };
const IC = {
  brain: <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={s}><path d="M10 2C6 2 3 5.5 3 9c0 2.5 1.5 4.5 3.5 5.5L7 18h6l.5-3.5C15.5 13.5 17 11.5 17 9c0-3.5-3-7-7-7z"/><path d="M7.5 9h5M10 6.5v5"/></svg>,
  bolt: <svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor" stroke="none" style={s}><path d="M11 2L5 11h5l-1 7 6-9h-5l1-7z"/></svg>,
  swords: <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={s}><path d="M3 17L10 10M17 17L10 10"/><path d="M3 3l4 4M17 3l-4 4"/><circle cx="10" cy="10" r="2"/></svg>,
  gallery: <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={s}><rect x="2" y="3" width="16" height="14" rx="1.5"/><circle cx="7" cy="8" r="1.5"/><path d="M2 14l4-4 3 3 4-5 5 6"/></svg>,
  rocket: <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={s}><path d="M10 18c0-3 1-6 3-8s4-5 4-8c0 0-3 1.5-5.5 4S8 11 8 11"/><circle cx="12" cy="7" r="1.5"/><path d="M5 15l-1 3 3-1"/></svg>,
  home: <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={s}><path d="M3 10.5L10 4l7 6.5"/><path d="M5 9v7a1 1 0 001 1h3v-4h2v4h3a1 1 0 001-1V9"/></svg>,
  chart: <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={s}><path d="M3 17h14"/><rect x="5" y="9" width="2" height="8" rx=".5" fill="currentColor"/><rect x="9" y="5" width="2" height="12" rx=".5" fill="currentColor"/><rect x="13" y="2" width="2" height="15" rx=".5" fill="currentColor"/></svg>,
  sliders: <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={s}><rect x="3" y="3" width="14" height="14" rx="2"/><circle cx="7" cy="10" r="2"/><circle cx="13" cy="8" r="2"/><path d="M7 3v5M7 12v5M13 3v3M13 10v7"/></svg>,
  exportArrow: <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={s}><path d="M4 13v3a1 1 0 001 1h10a1 1 0 001-1v-3"/><path d="M10 3v10"/><path d="M6 7l4-4 4 4"/></svg>,
};

const T = {
  bg: "#111113", surface: "#18181B", surfaceRaised: "#1F1F23", surfaceHover: "#26262B",
  flame: "#F27123", cyan: "#00D9FF", gold: "#D4A853", magenta: "#E5375E",
  green: "#34D399", purple: "#8B5CF6", amber: "#F59E0B", red: "#EF4444",
  text: "#E8E6E3", textSoft: "#A1A1AA", textMuted: "#63636E",
  border: "rgba(255,255,255,0.06)", borderHover: "rgba(255,255,255,0.12)",
};
const font = { display: "'OmniPresent', Inter, system-ui", body: "Inter, system-ui, sans-serif", mono: "'JetBrains Mono', monospace" };

const Tag = ({ label, color = T.cyan }) => (
  <span style={{ fontFamily: font.mono, fontSize: 10, fontWeight: 600, color, background: `${color}14`, borderRadius: 4, padding: "2px 8px", textTransform: "uppercase", letterSpacing: "0.12em" }}>{label}</span>
);
const MonoLabel = ({ children, icon, color = T.textMuted }) => (
  <div style={{ fontFamily: font.mono, fontSize: 10, fontWeight: 600, color, textTransform: "uppercase", letterSpacing: "0.12em", display: "flex", alignItems: "center", gap: 6, marginBottom: 13 }}>
    {icon && <span style={{ fontSize: 14 }}>{icon}</span>}{children}
  </div>
);

// ═══════════════════════════════════════════════════════════════════
// MODE CARD — Main product entry points
// ═══════════════════════════════════════════════════════════════════

const ModeCard = ({ title, subtitle, description, icon, accentColor, features, isPremium }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <button onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{
        background: T.surface, borderLeft: `2px solid ${hovered ? accentColor : T.border}`,
        borderTop: "none", borderRight: "none", borderBottom: "none",
        borderRadius: 8, padding: "28px 21px", textAlign: "center", cursor: "pointer",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 13,
        minHeight: 200, position: "relative", transition: "border-color 210ms ease",
      }}>
      {isPremium && (
        <div style={{ position: "absolute", top: 10, right: 10 }}>
          <Tag label="PRO" color={T.gold} />
        </div>
      )}
      <div style={{ fontSize: 36, lineHeight: 1, color: hovered ? accentColor : T.textSoft, transition: "color 210ms ease" }}>{icon}</div>
      <h2 style={{ fontFamily: font.display, fontSize: 20, fontWeight: 700, color: T.text, margin: 0 }}>{title}</h2>
      <p style={{ fontFamily: font.body, fontSize: 13, color: T.textSoft, margin: 0, lineHeight: 1.4 }}>{subtitle}</p>
      <p style={{ fontFamily: font.body, fontSize: 12, color: T.textMuted, margin: 0, lineHeight: 1.5, maxHeight: hovered ? 48 : 0, opacity: hovered ? 1 : 0, overflow: "hidden", transition: "all 210ms ease" }}>{description}</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center", marginTop: 4 }}>
        {features.map((f, i) => (
          <span key={i} style={{ fontFamily: font.mono, fontSize: 10, color: hovered ? accentColor : T.textMuted, background: hovered ? `${accentColor}14` : T.surfaceRaised, borderRadius: 4, padding: "2px 8px", textTransform: "uppercase", letterSpacing: "0.12em", transition: "all 210ms ease" }}>{f}</span>
        ))}
      </div>
      <div style={{ marginTop: "auto", paddingTop: 13, opacity: hovered ? 1 : 0, transform: hovered ? "translateY(0)" : "translateY(8px)", transition: "all 210ms ease", color: accentColor, fontSize: 12, fontWeight: 600 }}>
        Get Started →
      </div>
    </button>
  );
};

// ═══════════════════════════════════════════════════════════════════
// RECENT SIMULATION CARD
// ═══════════════════════════════════════════════════════════════════

const RecentSimCard = ({ sim }) => (
  <button style={{
    background: T.surface, borderLeft: `2px solid ${sim.mode === "council" ? T.cyan : T.flame}`,
    borderTop: "none", borderRight: "none", borderBottom: "none",
    borderRadius: 8, padding: "10px 13px", textAlign: "left", cursor: "pointer",
    display: "flex", alignItems: "center", gap: 13, width: "100%",
  }}>
    <div style={{ width: 32, height: 32, borderRadius: 8, background: `${sim.mode === "council" ? T.cyan : T.flame}14`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: sim.mode === "council" ? T.cyan : T.flame, flexShrink: 0 }}>
      {sim.mode === "council" ? IC.brain : IC.bolt}
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: T.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{sim.title}</div>
      <div style={{ fontFamily: font.mono, fontSize: 10, color: T.textMuted, marginTop: 2 }}>{sim.date} · {sim.models}</div>
    </div>
    <Tag label={sim.status} color={sim.status === "complete" ? T.green : T.amber} />
  </button>
);

// ═══════════════════════════════════════════════════════════════════
// EMPTY STATE
// ═══════════════════════════════════════════════════════════════════

const EmptyState = ({ icon, title, description, cta }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "55px 21px", textAlign: "center" }}>
    <div style={{ fontSize: 48, color: T.textMuted, marginBottom: 16, opacity: 0.5 }}>{icon}</div>
    <h3 style={{ fontFamily: font.display, fontSize: 18, fontWeight: 700, color: T.textSoft, margin: "0 0 8px 0" }}>{title}</h3>
    <p style={{ fontFamily: font.body, fontSize: 13, color: T.textMuted, margin: "0 0 21px 0", maxWidth: 340, lineHeight: 1.5 }}>{description}</p>
    {cta && (
      <button style={{ padding: "8px 21px", borderRadius: 6, border: "none", cursor: "pointer", background: T.flame, color: "#fff", fontSize: 12, fontWeight: 600 }}>{cta}</button>
    )}
  </div>
);

// ═══════════════════════════════════════════════════════════════════
// SIDEBAR V4 NAV
// ═══════════════════════════════════════════════════════════════════

const SIDEBAR_ITEMS = [
  { icon: IC.home, label: "Home", active: true },
  { icon: IC.brain, label: "Council" },
  { icon: IC.swords, label: "DA Arena" },
  { icon: IC.gallery, label: "Gallery" },
  { icon: IC.chart, label: "Dashboard" },
  { icon: IC.sliders, label: "Settings" },
  { icon: IC.exportArrow, label: "Export" },
];

const Sidebar = () => (
  <div style={{ width: 52, background: T.surface, borderRight: `1px solid ${T.border}`, display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 16, gap: 4 }}>
    {/* Logo mark */}
    <div style={{ width: 28, height: 28, borderRadius: 6, background: `${T.flame}14`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: T.flame, marginBottom: 16 }}>
      {IC.bolt}
    </div>
    {SIDEBAR_ITEMS.map((item, i) => (
      <div key={i} style={{
        width: 36, height: 36, borderRadius: 8,
        background: item.active ? `${T.flame}14` : "transparent",
        borderLeft: item.active ? `2px solid ${T.flame}` : "2px solid transparent",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 16, color: item.active ? T.flame : T.textMuted, cursor: "pointer",
      }}>
        {item.icon}
      </div>
    ))}
  </div>
);

// ═══════════════════════════════════════════════════════════════════
// LANDING SCREEN
// ═══════════════════════════════════════════════════════════════════

const RECENT_SIMS = [
  { title: "Premium Headphone Brand", mode: "council", date: "2h ago", models: "5 models", status: "complete" },
  { title: "Luxury Watch Campaign", mode: "council", date: "1d ago", models: "4 models", status: "complete" },
  { title: "Quick Brand Check — EV Charging", mode: "quick", date: "3d ago", models: "3 models", status: "complete" },
];

export default function InformationArchitectureWireframe() {
  const [screen, setScreen] = useState("landing"); // landing | empty-council | empty-gallery

  return (
    <div style={{ fontFamily: font.body, background: T.bg, color: T.text, minHeight: "100vh", display: "flex" }}>
      <Sidebar />

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Screen selector (wireframe only) */}
        <div style={{ padding: "8px 21px", borderBottom: `1px solid ${T.border}`, display: "flex", gap: 8 }}>
          {[["landing","Landing"],["empty-council","Empty Council"],["empty-gallery","Empty Gallery"]].map(([k,l]) => (
            <button key={k} onClick={() => setScreen(k)} style={{ fontFamily: font.mono, fontSize: 10, color: screen === k ? T.flame : T.textMuted, background: screen === k ? `${T.flame}14` : "transparent", border: "none", borderRadius: 4, padding: "4px 10px", cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.12em" }}>{l}</button>
          ))}
        </div>

        {/* LANDING */}
        {screen === "landing" && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "55px 34px" }}>
            {/* Hero */}
            <div style={{ textAlign: "center", marginBottom: 55 }}>
              <h1 style={{ fontFamily: font.display, fontSize: 44, fontWeight: 700, color: T.text, margin: 0, letterSpacing: "-0.02em" }}>Genesis Chamber</h1>
              <p style={{ fontFamily: font.body, fontSize: 15, color: T.textMuted, marginTop: 10 }}>Multi-LLM creative intelligence platform</p>
            </div>

            {/* Mode cards */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, maxWidth: 640, width: "100%", marginBottom: 34 }}>
              <ModeCard
                title="Council" subtitle="Full multi-LLM simulation"
                description="5 AI models compete, critique, and evolve concepts through multiple rounds"
                icon={IC.brain} accentColor={T.cyan}
                features={["Multi-Round", "DA Arena", "Media Gen"]}
              />
              <ModeCard
                title="Quick Mode" subtitle="Instant concept generation"
                description="Fast single-round ideation with 3 models, no competitive rounds"
                icon={IC.bolt} accentColor={T.flame}
                features={["Single Round", "3 Models", "Fast"]}
              />
            </div>

            {/* Recent sims */}
            {RECENT_SIMS.length > 0 && (
              <div style={{ maxWidth: 640, width: "100%" }}>
                <MonoLabel icon={IC.rocket} color={T.textMuted}>Recent Simulations</MonoLabel>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {RECENT_SIMS.map((sim, i) => <RecentSimCard key={i} sim={sim} />)}
                </div>
              </div>
            )}
          </div>
        )}

        {/* EMPTY STATES */}
        {screen === "empty-council" && (
          <EmptyState
            icon={IC.brain}
            title="No Simulations Yet"
            description="Start your first Council simulation to see multi-LLM creative concepts compete and evolve through competitive rounds."
            cta="Start Council Simulation"
          />
        )}
        {screen === "empty-gallery" && (
          <EmptyState
            icon={IC.gallery}
            title="Gallery Empty"
            description="Generated media will appear here after running a simulation with media generation enabled."
            cta="Run Simulation"
          />
        )}
      </div>
    </div>
  );
}
