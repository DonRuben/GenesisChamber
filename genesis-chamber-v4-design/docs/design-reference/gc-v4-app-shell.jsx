import { useState, useRef, useEffect } from "react";

// ─────────────────────────────────────────────────────────
// GENESIS CHAMBER V4 · APP SHELL
// The top-level container: Sidebar + Mode Switcher + Content
// Design: Tobias van Schneider — Editorial, flat, typographic
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
  council:    icon(<><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></>),
  genesis:    icon(<><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></>),
  plus:       icon(<><path d="M12 5v14"/><path d="M5 12h14"/></>),
  chat:       icon(<><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></>),
  settings:   icon(<><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></>),
  sun:        icon(<><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></>),
  moon:       icon(<path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>),
  panelLeft:  icon(<><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/></>),
  panelRight: icon(<><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M15 3v18"/></>),
  trash:      icon(<><path d="M3 6h18"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6"/><path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"/></>),
  search:     icon(<><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></>),
  clock:      icon(<><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></>),
  chevDown:   icon(<path d="M6 9l6 6 6-6"/>),
  menu:       icon(<><path d="M3 12h18"/><path d="M3 6h18"/><path d="M3 18h18"/></>),
  x:          icon(<><path d="M18 6L6 18"/><path d="M6 6l12 12"/></>),
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

// ── Mock Conversations ──
const CONVERSATIONS = [
  { id: "c1", title: "Brand strategy for AquaLux premium water launch", mode: "genesis", updated: "2 min ago", status: "complete" },
  { id: "c2", title: "Compare React vs Svelte for dashboard rebuild", mode: "council", updated: "1 hr ago", status: "complete" },
  { id: "c3", title: "AI ethics framework for healthcare deployment", mode: "council", updated: "3 hr ago", status: "complete" },
  { id: "c4", title: "Genesis simulation: Luxury EV brand positioning", mode: "genesis", updated: "Yesterday", status: "complete" },
  { id: "c5", title: "Evaluate NEXORA tokenization pitch angles", mode: "council", updated: "Yesterday", status: "complete" },
  { id: "c6", title: "Monetec solar investor deck messaging", mode: "genesis", updated: "2 days ago", status: "complete" },
];

// ─────────────────────────────────────────────────────────
// Sidebar Components
// ─────────────────────────────────────────────────────────

function Logo({ collapsed }) {
  if (collapsed) {
    return (
      <div style={{ padding: "20px 0", display: "flex", justifyContent: "center" }}>
        <span style={{ fontFamily: font.display, fontSize: 20, fontWeight: 700, color: T.flame, letterSpacing: "-0.03em" }}>G</span>
      </div>
    );
  }
  return (
    <div style={{ padding: "24px 20px 6px" }}>
      <div style={{ fontFamily: font.display, fontSize: 16, fontWeight: 700, letterSpacing: "-0.03em", color: T.text }}>
        <span style={{ color: T.flame }}>Genesis</span>Chamber
      </div>
      <div style={{ fontSize: 8, fontFamily: font.mono, fontWeight: 500, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.14em", marginTop: 3 }}>
        Multi-AI Creative Engine
      </div>
    </div>
  );
}

function ModeTabs({ mode, onMode, collapsed }) {
  const modes = [
    { key: "council", label: "LLM Council", icon: IC.council, color: T.cyan },
    { key: "genesis", label: "Genesis Chamber", icon: IC.genesis, color: T.flame },
  ];

  if (collapsed) {
    return (
      <div style={{ padding: "8px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
        {modes.map(m => (
          <button key={m.key} onClick={() => onMode(m.key)}
            title={m.label}
            style={{
              width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center",
              background: "transparent", border: "none", cursor: "pointer",
              borderLeft: `2px solid ${mode === m.key ? m.color : "transparent"}`,
              color: mode === m.key ? m.color : T.textMuted,
              fontSize: 18, transition: "all 0.15s",
            }}>
            {m.icon}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div style={{ padding: "12px 12px 0", display: "flex", gap: 2, background: T.bg, borderRadius: 6, margin: "0 12px" }}>
      {modes.map(m => (
        <button key={m.key} onClick={() => onMode(m.key)}
          style={{
            flex: 1, padding: "10px 12px", display: "flex", alignItems: "center", gap: 8,
            background: mode === m.key ? T.surface : "transparent",
            border: "none", borderRadius: 5, cursor: "pointer",
            borderLeft: `2px solid ${mode === m.key ? m.color : "transparent"}`,
            transition: "all 0.15s",
          }}>
          <span style={{ fontSize: 15, color: mode === m.key ? m.color : T.textMuted }}>{m.icon}</span>
          <span style={{
            fontSize: 11, fontFamily: font.mono, fontWeight: 500, letterSpacing: "0.02em",
            color: mode === m.key ? T.text : T.textMuted,
          }}>{m.label}</span>
        </button>
      ))}
    </div>
  );
}

function NewConversationBtn({ collapsed, onClick }) {
  if (collapsed) {
    return (
      <div style={{ padding: "12px 0", display: "flex", justifyContent: "center" }}>
        <button onClick={onClick} title="New Conversation"
          style={{
            width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center",
            background: "transparent", border: `1px solid ${T.border}`, borderRadius: 6,
            borderLeft: `2px solid ${T.flame}`, cursor: "pointer", color: T.flame, fontSize: 16,
            transition: "border-color 0.15s",
          }}>
          {IC.plus}
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: "16px 12px 8px" }}>
      <button onClick={onClick}
        style={{
          width: "100%", padding: "11px 16px", display: "flex", alignItems: "center", gap: 10,
          background: "transparent", border: `1px solid ${T.border}`, borderRadius: 6,
          borderLeft: `2px solid ${T.flame}`, cursor: "pointer",
          transition: "border-color 0.15s, background 0.15s",
        }}
        onMouseEnter={e => { e.currentTarget.style.background = T.surfaceRaised; e.currentTarget.style.borderColor = T.borderHover; }}
        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = T.border; }}
      >
        <span style={{ fontSize: 15, color: T.flame }}>{IC.plus}</span>
        <span style={{ fontSize: 12, fontWeight: 600, color: T.text, letterSpacing: "0.01em" }}>New Conversation</span>
      </button>
    </div>
  );
}

function SearchBar({ collapsed }) {
  const [q, setQ] = useState("");
  if (collapsed) return null;

  return (
    <div style={{ padding: "4px 12px 8px" }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 8, padding: "8px 12px",
        background: T.bg, border: `1px solid ${T.border}`, borderRadius: 6,
      }}>
        <span style={{ fontSize: 14, color: T.textMuted }}>{IC.search}</span>
        <input value={q} onChange={e => setQ(e.target.value)}
          placeholder="Search conversations..."
          style={{
            flex: 1, background: "transparent", border: "none", outline: "none",
            fontSize: 12, color: T.text, fontFamily: font.body,
          }}/>
      </div>
    </div>
  );
}

function ConversationList({ conversations, activeId, onSelect, mode, collapsed }) {
  const filtered = conversations.filter(c => c.mode === mode);

  if (collapsed) {
    return (
      <div style={{ flex: 1, padding: "8px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, overflowY: "auto" }}>
        {filtered.map(c => (
          <button key={c.id} onClick={() => onSelect(c.id)} title={c.title}
            style={{
              width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center",
              background: activeId === c.id ? T.surfaceRaised : "transparent",
              border: "none", borderRadius: 4, cursor: "pointer",
              borderLeft: `2px solid ${activeId === c.id ? T.cyan : "transparent"}`,
              color: activeId === c.id ? T.text : T.textMuted, fontSize: 14,
            }}>
            {IC.chat}
          </button>
        ))}
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, padding: "40px 20px" }}>
        <span style={{ fontSize: 28, color: T.textMuted }}>{IC.chat}</span>
        <span style={{ fontSize: 12, color: T.textMuted, textAlign: "center", lineHeight: 1.5 }}>No conversations yet</span>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "4px 0" }}>
      {filtered.map(c => (
        <button key={c.id} onClick={() => onSelect(c.id)}
          style={{
            width: "100%", padding: "12px 20px", display: "flex", flexDirection: "column", gap: 4,
            background: activeId === c.id ? T.surfaceRaised : "transparent",
            border: "none", cursor: "pointer", textAlign: "left",
            borderLeft: `2px solid ${activeId === c.id ? T.cyan : "transparent"}`,
            transition: "all 0.13s",
          }}
          onMouseEnter={e => { if (activeId !== c.id) e.currentTarget.style.background = T.surfaceHover; }}
          onMouseLeave={e => { if (activeId !== c.id) e.currentTarget.style.background = "transparent"; }}
        >
          <div style={{
            fontSize: 12, fontWeight: 500, color: activeId === c.id ? T.text : T.textSoft,
            lineHeight: 1.4, overflow: "hidden", textOverflow: "ellipsis",
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
          }}>{c.title}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 10, fontFamily: font.mono, color: T.textMuted, letterSpacing: "0.04em" }}>{c.updated}</span>
          </div>
        </button>
      ))}
    </div>
  );
}

function SidebarFooter({ collapsed, theme, onTheme, onCollapse }) {
  if (collapsed) {
    return (
      <div style={{
        borderTop: `1px solid ${T.border}`, padding: "12px 0",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
      }}>
        <button onClick={onTheme} title={theme === "dark" ? "Light mode" : "Dark mode"}
          style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: "none", cursor: "pointer", color: T.textMuted, fontSize: 14 }}>
          {theme === "dark" ? IC.sun : IC.moon}
        </button>
        <button onClick={onCollapse} title="Expand sidebar"
          style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: "none", cursor: "pointer", color: T.textMuted, fontSize: 14 }}>
          {IC.panelRight}
        </button>
      </div>
    );
  }

  return (
    <div style={{
      borderTop: `1px solid ${T.border}`, padding: "12px 16px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
    }}>
      <span style={{ fontSize: 8, fontFamily: font.mono, fontWeight: 500, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.14em" }}>
        OmniPresent Group
      </span>
      <div style={{ display: "flex", gap: 4 }}>
        <button onClick={() => {}} title="Settings"
          style={{ width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: "none", cursor: "pointer", color: T.textMuted, fontSize: 14, borderRadius: 4 }}>
          {IC.settings}
        </button>
        <button onClick={onTheme} title={theme === "dark" ? "Light mode" : "Dark mode"}
          style={{ width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: "none", cursor: "pointer", color: T.textMuted, fontSize: 14, borderRadius: 4 }}>
          {theme === "dark" ? IC.sun : IC.moon}
        </button>
        <button onClick={onCollapse} title="Collapse sidebar"
          style={{ width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: "none", cursor: "pointer", color: T.textMuted, fontSize: 14, borderRadius: 4 }}>
          {IC.panelLeft}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Mobile Sidebar Overlay
// ─────────────────────────────────────────────────────────
function MobileOverlay({ open, onClose, children }) {
  if (!open) return null;
  return (
    <>
      <div onClick={onClose} style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
        zIndex: 998, transition: "opacity 0.2s",
      }}/>
      <div style={{
        position: "fixed", top: 0, left: 0, bottom: 0, width: 280,
        background: T.surface, zIndex: 999,
        borderRight: `1px solid ${T.border}`,
        display: "flex", flexDirection: "column",
        animation: "slideInLeft 0.2s ease-out",
      }}>
        {children}
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────
// Mobile Top Bar
// ─────────────────────────────────────────────────────────
function MobileTopBar({ mode, onMenuOpen }) {
  return (
    <div style={{
      display: "none", height: 52, padding: "0 16px",
      alignItems: "center", justifyContent: "space-between",
      borderBottom: `1px solid ${T.border}`, background: T.surface,
    }}
    className="gc-mobile-topbar">
      <button onClick={onMenuOpen}
        style={{ width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: "none", cursor: "pointer", color: T.textSoft, fontSize: 18 }}>
        {IC.menu}
      </button>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontFamily: font.display, fontSize: 14, fontWeight: 700, color: T.text, letterSpacing: "-0.03em" }}>
          <span style={{ color: T.flame }}>G</span>C
        </span>
        <span style={{ fontSize: 9, fontFamily: font.mono, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.08em" }}>
          {mode === "council" ? "Council" : "Chamber"}
        </span>
      </div>
      <div style={{ width: 40 }}/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Content Placeholder — shows which mode/screen is active
// ─────────────────────────────────────────────────────────
function ContentPlaceholder({ mode, activeConversation }) {
  // This is where the actual LLM Council or Genesis Chamber content renders
  // In production: <Outlet /> from react-router, or conditional rendering
  return (
    <div style={{
      flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
      flexDirection: "column", gap: 12,
    }}>
      <div style={{
        padding: "24px 32px", background: T.surface, border: `1px solid ${T.border}`,
        borderRadius: 8, borderLeft: `2px solid ${mode === "council" ? T.cyan : T.flame}`,
        textAlign: "center",
      }}>
        <div style={{ fontSize: 9, fontFamily: font.mono, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 8 }}>
          ACTIVE MODE
        </div>
        <div style={{ fontSize: 18, fontFamily: font.display, fontWeight: 700, color: T.text, letterSpacing: "-0.03em", marginBottom: 4 }}>
          {mode === "council" ? "LLM Council" : "Genesis Chamber"}
        </div>
        {activeConversation && (
          <div style={{ fontSize: 12, color: T.textSoft, marginTop: 8, maxWidth: 300, lineHeight: 1.5 }}>
            {CONVERSATIONS.find(c => c.id === activeConversation)?.title}
          </div>
        )}
        <div style={{ fontSize: 10, fontFamily: font.mono, color: T.textMuted, marginTop: 12, letterSpacing: "0.04em" }}>
          Content renders here via {"<Outlet />"} or conditional
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Main App Shell
// ─────────────────────────────────────────────────────────
export default function AppShell() {
  const [mode, setMode] = useState("council");
  const [collapsed, setCollapsed] = useState(false);
  const [activeConv, setActiveConv] = useState(null);
  const [theme, setTheme] = useState("dark");
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleTheme = () => setTheme(t => t === "dark" ? "light" : "dark");
  const toggleCollapse = () => setCollapsed(c => !c);
  const newConversation = () => { setActiveConv(null); /* trigger landing state */ };

  const sidebarWidth = collapsed ? 56 : 260;

  const sidebarContent = (mobile = false) => (
    <>
      {mobile && (
        <div style={{ display: "flex", justifyContent: "flex-end", padding: "12px 12px 0" }}>
          <button onClick={() => setMobileOpen(false)}
            style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: "none", cursor: "pointer", color: T.textMuted, fontSize: 16 }}>
            {IC.x}
          </button>
        </div>
      )}
      <Logo collapsed={!mobile && collapsed}/>
      <ModeTabs mode={mode} onMode={m => { setMode(m); setActiveConv(null); if (mobile) setMobileOpen(false); }} collapsed={!mobile && collapsed}/>
      <NewConversationBtn collapsed={!mobile && collapsed} onClick={newConversation}/>
      {!collapsed && !mobile && <SearchBar/>}
      <ConversationList
        conversations={CONVERSATIONS}
        activeId={activeConv}
        onSelect={id => { setActiveConv(id); if (mobile) setMobileOpen(false); }}
        mode={mode}
        collapsed={!mobile && collapsed}
      />
      <SidebarFooter collapsed={!mobile && collapsed} theme={theme} onTheme={toggleTheme} onCollapse={toggleCollapse}/>
    </>
  );

  return (
    <div style={{ background: T.bg, minHeight: "100vh", fontFamily: font.body, color: T.text, WebkitFontSmoothing: "antialiased" }}>
      <style>{`
        @font-face { font-family: 'OmniPresent'; src: url('https://cdn.jsdelivr.net/gh/DonRuben/Hosting-Assets-Externally@main/Fonts/Font-%20OmniPresent%20Main/OmniPresent.woff') format('woff'); font-display: swap; }
        @keyframes slideInLeft { from { transform: translateX(-100%); } to { transform: translateX(0); } }
        @media (max-width: 768px) {
          .gc-desktop-sidebar { display: none !important; }
          .gc-mobile-topbar { display: flex !important; }
        }
      `}</style>

      {/* Desktop Sidebar */}
      <div className="gc-desktop-sidebar" style={{
        position: "fixed", top: 0, left: 0, bottom: 0,
        width: sidebarWidth, background: T.surface,
        borderRight: `1px solid ${T.border}`,
        display: "flex", flexDirection: "column",
        transition: "width 0.2s cubic-bezier(0.16,1,0.3,1)",
        zIndex: 100, overflow: "hidden",
      }}>
        {sidebarContent(false)}
      </div>

      {/* Mobile Overlay Sidebar */}
      <MobileOverlay open={mobileOpen} onClose={() => setMobileOpen(false)}>
        {sidebarContent(true)}
      </MobileOverlay>

      {/* Main Content */}
      <div style={{
        marginLeft: sidebarWidth,
        minHeight: "100vh",
        display: "flex", flexDirection: "column",
        transition: "margin-left 0.2s cubic-bezier(0.16,1,0.3,1)",
      }}
      className="gc-main-content">
        <MobileTopBar mode={mode} onMenuOpen={() => setMobileOpen(true)}/>
        <ContentPlaceholder mode={mode} activeConversation={activeConv}/>
      </div>
    </div>
  );
}
