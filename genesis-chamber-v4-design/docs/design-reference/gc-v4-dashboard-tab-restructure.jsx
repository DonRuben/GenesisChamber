import { useState, useEffect, useCallback } from "react";

// ─────────────────────────────────────────────────────────
// GENESIS CHAMBER V4 · DASHBOARD TAB RESTRUCTURE
// 9 flat tabs → 5 grouped tabs with progressive disclosure
// Design: Tobias van Schneider — Editorial, flat, typographic
// ─────────────────────────────────────────────────────────

// ── Icon System — 24×24, 1.5px stroke, currentColor ──
const s24 = { display: "inline-block", verticalAlign: "-0.125em" };
const icon = (paths, filled) => (
  <svg width="1em" height="1em" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"}
    stroke={filled ? "none" : "currentColor"} strokeWidth="1.5"
    strokeLinecap="round" strokeLinejoin="round" style={s24}>{paths}</svg>
);
const IC = {
  overview: icon(<><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3" fill="currentColor"/></>),
  council:  icon(<><path d="M12 2C8 2 5 5.5 5 9c0 2.5 1.5 4.5 3.5 5.5L9 18h6l.5-3.5C17.5 13.5 19 11.5 19 9c0-3.5-3-7-7-7z"/><path d="M9.5 9h5M12 6.5v5"/></>),
  media:    icon(<><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="10" r="2"/><path d="M3 17l5-5 3 3 5-6 5 8"/></>),
  swords:   icon(<><path d="M4 20l7-7M20 20l-7-7"/><path d="M4 4l5 5M20 4l-5 5"/><circle cx="12" cy="12" r="2.5"/></>),
  export:   icon(<><path d="M4 14v4a2 2 0 002 2h12a2 2 0 002-2v-4"/><path d="M12 4v12"/><path d="M8 8l4-4 4 4"/></>),
  check:    icon(<path d="M5 12l5 5 9-9"/>),
  chevDown: icon(<path d="M6 9l6 6 6-6"/>),
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
  display: "'OmniPresent', 'Inter', system-ui, sans-serif",
  body: "'Inter', system-ui, sans-serif",
  mono: "'JetBrains Mono', 'SF Mono', Menlo, monospace",
};

// ── Tab Groups Definition ──
// V3.8: 9 flat tabs → V4: 5 grouped tabs
//   Overview   → Overview (hero, always first)
//   Council ▾  → Concepts | Critiques | Direction | Transcript
//   Media ▾    → Gallery | Generated
//   DA Arena   → DA Arena (conditional on enableDA)
//   Export ▾   → Output
const TAB_GROUPS = [
  { id: "overview", label: "Overview", icon: "overview", isSingle: true, component: "SimulationOverview" },
  {
    id: "council", label: "Council", icon: "council",
    children: [
      { id: "concepts", label: "Concepts", component: "ConceptCard" },
      { id: "critiques", label: "Critiques", component: "CritiquePanel" },
      { id: "direction", label: "Direction", component: "ModeratorDirection" },
      { id: "transcript", label: "Transcript", component: "TranscriptViewer" },
    ],
  },
  {
    id: "media", label: "Media", icon: "media",
    children: [
      { id: "gallery", label: "Gallery", component: "GeneratedGallery" },
      { id: "generated", label: "Generated", component: "PresentationGallery" },
    ],
  },
  { id: "da-arena", label: "DA Arena", icon: "swords", isSingle: true, component: "DAArena", conditionalOn: "enableDA" },
  {
    id: "export", label: "Export", icon: "export",
    children: [{ id: "output", label: "Output", component: "OutputPanel" }],
  },
];

// Keyboard shortcuts: Cmd+1..5
const KEY_MAP = {
  "1": { tab: "overview", sub: null },
  "2": { tab: "council", sub: "concepts" },
  "3": { tab: "media", sub: "gallery" },
  "4": { tab: "da-arena", sub: null },
  "5": { tab: "export", sub: "output" },
};

// ─── Desktop Tab Bar ───
const GroupedTabBar = ({ activeTab, activeSubTab, onTabChange, enableDA }) => {
  const [openDrop, setOpenDrop] = useState(null);

  const groups = TAB_GROUPS.filter(g => !(g.conditionalOn === "enableDA" && !enableDA));

  const handleGroup = (g) => {
    if (g.isSingle) { onTabChange(g.id, null); setOpenDrop(null); }
    else setOpenDrop(openDrop === g.id ? null : g.id);
  };

  const handleSub = (gId, cId) => { onTabChange(gId, cId); setOpenDrop(null); };

  // Close dropdown on outside click
  useEffect(() => {
    if (!openDrop) return;
    const close = () => setOpenDrop(null);
    const t = setTimeout(() => document.addEventListener("click", close), 0);
    return () => { clearTimeout(t); document.removeEventListener("click", close); };
  }, [openDrop]);

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 2, padding: 4,
      background: T.surface, borderRadius: 8, border: `1px solid ${T.border}`,
    }}>
      {groups.map(g => {
        const active = activeTab === g.id;
        const child = g.children?.find(c => c.id === activeSubTab);
        const label = active && child ? `${g.label}: ${child.label}` : g.label;

        return (
          <div key={g.id} style={{ position: "relative" }}>
            <button onClick={() => handleGroup(g)} style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "7px 14px", background: active ? T.surfaceRaised : "transparent",
              border: "none", borderLeft: active ? `2px solid ${T.cyan}` : "2px solid transparent",
              borderRadius: 6, cursor: "pointer",
              color: active ? T.text : T.textMuted,
              fontFamily: font.body, fontSize: 13, fontWeight: active ? 600 : 400,
              transition: "all 130ms ease", whiteSpace: "nowrap",
            }}>
              <span style={{ fontSize: 14, opacity: active ? 1 : 0.6 }}>{IC[g.icon]}</span>
              <span>{label}</span>
              {!g.isSingle && (
                <span style={{
                  fontSize: 10, opacity: 0.4,
                  transform: openDrop === g.id ? "rotate(180deg)" : "none",
                  transition: "transform 130ms ease",
                }}>▾</span>
              )}
            </button>

            {!g.isSingle && openDrop === g.id && (
              <div style={{
                position: "absolute", top: "calc(100% + 4px)", left: 0,
                background: T.surfaceRaised, border: `1px solid ${T.borderHover}`,
                borderRadius: 8, padding: 4, minWidth: 170, zIndex: 50,
                animation: "fadeIn 130ms ease",
              }}>
                {g.children.map(c => {
                  const isSub = activeSubTab === c.id;
                  return (
                    <button key={c.id} onClick={() => handleSub(g.id, c.id)} style={{
                      display: "flex", alignItems: "center", gap: 8,
                      padding: "8px 12px", width: "100%",
                      background: isSub ? `${T.cyan}0A` : "transparent",
                      border: "none", borderLeft: isSub ? `2px solid ${T.cyan}` : "2px solid transparent",
                      borderRadius: 4, cursor: "pointer",
                      color: isSub ? T.cyan : T.textSoft,
                      fontFamily: font.body, fontSize: 13, fontWeight: isSub ? 600 : 400,
                      textAlign: "left", transition: "all 130ms ease",
                    }}>
                      {c.label}
                      {isSub && <span style={{ marginLeft: "auto", fontSize: 14 }}>{IC.check}</span>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {/* Status badge — right aligned */}
      <div style={{
        marginLeft: "auto", display: "flex", alignItems: "center", gap: 6,
        padding: "4px 10px", borderLeft: `2px solid ${T.green}`,
        background: `${T.green}08`, borderRadius: 4,
      }}>
        <div style={{ width: 5, height: 5, borderRadius: "50%", background: T.green }} />
        <span style={{
          fontFamily: font.mono, fontSize: 10, color: T.green,
          textTransform: "uppercase", letterSpacing: "0.06em",
        }}>Completed</span>
      </div>
    </div>
  );
};

// ─── Mobile Tab Bar — flat horizontal scroll ───
const MobileTabBar = ({ activeTab, activeSubTab, onTabChange, enableDA }) => {
  const flat = [];
  TAB_GROUPS.forEach(g => {
    if (g.conditionalOn === "enableDA" && !enableDA) return;
    if (g.isSingle) flat.push({ id: g.id, label: g.label });
    else g.children.forEach(c => flat.push({ id: c.id, label: c.label, parent: g.id }));
  });

  return (
    <div style={{
      display: "flex", overflowX: "auto", gap: 2, padding: "4px 8px",
      background: T.surface, borderBottom: `1px solid ${T.border}`,
      scrollbarWidth: "none",
    }}>
      {flat.map(t => {
        const active = t.id === activeTab || t.id === activeSubTab;
        return (
          <button key={t.id} onClick={() => onTabChange(t.parent || t.id, t.parent ? t.id : null)} style={{
            flexShrink: 0, padding: "10px 14px", minHeight: 44,
            background: "none", border: "none",
            borderBottom: active ? `2px solid ${T.cyan}` : "2px solid transparent",
            cursor: "pointer", color: active ? T.text : T.textMuted,
            fontFamily: font.body, fontSize: 12, fontWeight: active ? 600 : 400,
            whiteSpace: "nowrap", transition: "all 130ms ease",
          }}>{t.label}</button>
        );
      })}
    </div>
  );
};

// ─── Breadcrumb ───
const Breadcrumb = ({ activeTab, activeSubTab }) => {
  if (!activeSubTab) return null;
  const g = TAB_GROUPS.find(x => x.id === activeTab);
  const c = g?.children?.find(x => x.id === activeSubTab);
  if (!g || !c) return null;

  return (
    <div style={{
      padding: "6px 16px", fontFamily: font.mono, fontSize: 11,
      color: T.textMuted, display: "flex", alignItems: "center", gap: 6,
    }}>
      <span style={{ fontSize: 14 }}>{IC[g.icon]}</span>
      <span>{g.label}</span>
      <span style={{ opacity: 0.3 }}>›</span>
      <span style={{ color: T.textSoft }}>{c.label}</span>
    </div>
  );
};

// ─── Tab Mapping Reference ───
const MAPPING = [
  ["Overview", "Overview", "(hero, unchanged)"],
  ["Concepts", "Council › Concepts", null],
  ["Gallery", "Media › Gallery", null],
  ["Critiques", "Council › Critiques", null],
  ["Direction", "Council › Direction", null],
  ["DA", "DA Arena", "(conditional)"],
  ["Transcript", "Council › Transcript", null],
  ["Generated", "Media › Generated", null],
  ["Output", "Export › Output", null],
];

// ─── Main Demo ───
export default function DashboardTabRestructure() {
  const [activeTab, setActiveTab] = useState("overview");
  const [activeSubTab, setActiveSubTab] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [enableDA, setEnableDA] = useState(true);

  const handleTab = useCallback((tab, sub) => {
    setActiveTab(tab);
    setActiveSubTab(sub || (TAB_GROUPS.find(g => g.id === tab)?.children?.[0]?.id ?? null));
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if (!e.metaKey && !e.ctrlKey) return;
      const m = KEY_MAP[e.key];
      if (m) { e.preventDefault(); handleTab(m.tab, m.sub); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleTab]);

  const currentComponent = (() => {
    if (activeTab === "overview" || activeTab === "da-arena") {
      return TAB_GROUPS.find(g => g.id === activeTab)?.component;
    }
    const g = TAB_GROUPS.find(x => x.id === activeTab);
    return g?.children?.find(c => c.id === activeSubTab)?.component || "—";
  })();

  return (
    <div style={{ fontFamily: font.body, background: T.bg, color: T.text, minHeight: "100vh" }}>
      {/* Controls */}
      <div style={{
        padding: "8px 20px", background: T.surface,
        borderBottom: `1px solid ${T.border}`,
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <span style={{ fontFamily: font.mono, fontSize: 11, color: T.textMuted }}>
          V4 Tab Restructure
        </span>
        {[
          { label: isMobile ? "Mobile 375px" : "Desktop", active: isMobile, toggle: () => setIsMobile(!isMobile), color: T.cyan },
          { label: `DA: ${enableDA ? "ON" : "OFF"}`, active: enableDA, toggle: () => setEnableDA(!enableDA), color: T.magenta },
        ].map(btn => (
          <button key={btn.label} onClick={btn.toggle} style={{
            background: btn.active ? `${btn.color}10` : T.surfaceRaised,
            border: `1px solid ${btn.active ? `${btn.color}30` : T.border}`,
            borderRadius: 4, padding: "3px 10px", cursor: "pointer",
            color: btn.active ? btn.color : T.textSoft,
            fontFamily: font.mono, fontSize: 10,
          }}>{btn.label}</button>
        ))}
      </div>

      {/* Dashboard area */}
      <div style={{
        maxWidth: isMobile ? 375 : "100%",
        margin: isMobile ? "20px auto" : 0,
        background: isMobile ? T.surface : "transparent",
        borderRadius: isMobile ? 10 : 0,
        border: isMobile ? `1px solid ${T.border}` : "none",
        overflow: "hidden",
      }}>
        {/* Title bar */}
        <div style={{ padding: "16px 20px 8px", borderBottom: `1px solid ${T.border}` }}>
          <h2 style={{
            fontFamily: font.display, fontSize: isMobile ? 18 : 22,
            fontWeight: 700, color: T.text, margin: 0,
          }}>Premium Headphones Brand Strategy</h2>
          <p style={{
            fontFamily: font.mono, fontSize: 11, color: T.textMuted, marginTop: 4,
          }}>5 models · 3 rounds · DA enabled · 23 images generated</p>
        </div>

        {/* Tab bar */}
        <div style={{ padding: isMobile ? 0 : "8px 20px 0" }}>
          {isMobile
            ? <MobileTabBar activeTab={activeTab} activeSubTab={activeSubTab} onTabChange={handleTab} enableDA={enableDA} />
            : <GroupedTabBar activeTab={activeTab} activeSubTab={activeSubTab} onTabChange={handleTab} enableDA={enableDA} />
          }
        </div>

        <Breadcrumb activeTab={activeTab} activeSubTab={activeSubTab} />

        {/* Content placeholder */}
        <div style={{ padding: "32px 20px", textAlign: "center" }}>
          <div style={{
            padding: 32, background: T.surface, borderRadius: 8,
            border: `1px solid ${T.border}`, borderLeft: `2px solid ${T.cyan}`,
          }}>
            <span style={{ fontFamily: font.mono, fontSize: 13, color: T.textMuted }}>
              Component: <strong style={{ color: T.cyan }}>{currentComponent}</strong>
            </span>
            <p style={{ fontFamily: font.body, fontSize: 14, color: T.textMuted, marginTop: 12 }}>
              Tab: {activeTab}{activeSubTab ? ` → ${activeSubTab}` : ""}
            </p>
          </div>
        </div>

        {/* V3.8 → V4 mapping reference */}
        <div style={{
          margin: "0 20px 20px", padding: 14, background: T.surfaceRaised,
          borderRadius: 8, borderLeft: `2px solid ${T.textMuted}`,
        }}>
          <div style={{
            fontFamily: font.mono, fontSize: 11, color: T.textSoft,
            marginBottom: 8, fontWeight: 600,
          }}>V3.8 → V4 Tab Mapping:</div>
          {MAPPING.map(([from, to, note]) => (
            <div key={from} style={{
              fontFamily: font.mono, fontSize: 11, color: T.textMuted, lineHeight: 1.8,
            }}>
              {from} → <span style={{ color: T.cyan }}>{to}</span>
              {note && <span style={{ color: T.textMuted, opacity: 0.5 }}> {note}</span>}
            </div>
          ))}
        </div>

        {/* Keyboard shortcuts reference */}
        <div style={{
          margin: "0 20px 20px", padding: 14, background: T.surfaceRaised,
          borderRadius: 8, display: "flex", flexWrap: "wrap", gap: 12,
        }}>
          {Object.entries(KEY_MAP).map(([key, { tab }]) => (
            <div key={key} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{
                fontFamily: font.mono, fontSize: 10, color: T.textMuted,
                padding: "2px 6px", background: T.surfaceHover, borderRadius: 3,
                border: `1px solid ${T.border}`,
              }}>⌘{key}</span>
              <span style={{ fontFamily: font.mono, fontSize: 10, color: T.textSoft }}>
                {TAB_GROUPS.find(g => g.id === tab)?.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        button:hover { opacity: 0.85; }
        div::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
