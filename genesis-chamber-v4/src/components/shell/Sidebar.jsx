// ─────────────────────────────────────────────────────────
// GENESIS CHAMBER V4 — SIDEBAR
// 3-state: hidden (0px) / collapsed (56px) / expanded (260px)
// Ref: gc-v4-app-shell.jsx
// ─────────────────────────────────────────────────────────

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { font } from '../../design/tokens';
import { IC } from '../../design/icons';
import { useAppStore } from '../../stores/appStore';
import { useCouncilStore } from '../../stores/councilStore';
import { CONVERSATIONS } from '../../data/mock';
import { ConnectionDot } from '../../design/skeletons';
import { useTokens } from '../../hooks/useTokens';
import * as api from '../../services/api';

// ── Logo ──
function Logo({ collapsed, t }) {
  if (collapsed) {
    return (
      <div style={{ padding: '20px 0', display: 'flex', justifyContent: 'center' }}>
        <span style={{
          fontFamily: font.display, fontSize: 20, fontWeight: 700,
          color: t.flame, letterSpacing: '-0.03em',
        }}>G</span>
      </div>
    );
  }
  return (
    <div style={{ padding: '24px 20px 6px' }}>
      <div style={{
        fontFamily: font.display, fontSize: 16, fontWeight: 700,
        letterSpacing: '-0.03em', color: t.text,
      }}>
        <span style={{ color: t.flame }}>Genesis</span>Chamber
      </div>
      <div style={{
        fontSize: 8, fontFamily: font.mono, fontWeight: 500,
        color: t.textMuted, textTransform: 'uppercase',
        letterSpacing: '0.14em', marginTop: 3,
      }}>
        Multi-AI Creative Engine
      </div>
    </div>
  );
}

// ── Mode Tabs ──
function ModeTabs({ collapsed, t }) {
  const mode = useAppStore((s) => s.mode);
  const setMode = useAppStore((s) => s.setMode);
  const navigate = useNavigate();

  const modes = [
    { key: 'council', label: 'LLM Council', icon: IC.council, color: t.cyan, path: '/council' },
    { key: 'genesis', label: 'Genesis Chamber', icon: IC.genesis, color: t.flame, path: '/launch' },
  ];

  const handleMode = (m) => {
    setMode(m.key);
    navigate(m.path);
  };

  if (collapsed) {
    return (
      <div style={{ padding: '8px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        {modes.map((m) => (
          <button key={m.key} onClick={() => handleMode(m)} title={m.label}
            style={{
              width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'transparent', border: 'none', cursor: 'pointer',
              borderLeft: `2px solid ${mode === m.key ? m.color : 'transparent'}`,
              color: mode === m.key ? m.color : t.textMuted,
              fontSize: 18, transition: 'all 0.15s',
            }}
          >
            {m.icon}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div style={{ padding: '12px 12px 0', display: 'flex', gap: 2, background: t.bg, borderRadius: 6, margin: '0 12px' }}>
      {modes.map((m) => (
        <button key={m.key} onClick={() => handleMode(m)}
          style={{
            flex: 1, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 8,
            background: mode === m.key ? t.surface : 'transparent',
            border: 'none', borderRadius: 5, cursor: 'pointer',
            borderLeft: `2px solid ${mode === m.key ? m.color : 'transparent'}`,
            transition: 'all 0.15s',
          }}
        >
          <span style={{ fontSize: 15, color: mode === m.key ? m.color : t.textMuted }}>{m.icon}</span>
          <span style={{
            fontSize: 11, fontFamily: font.mono, fontWeight: 500, letterSpacing: '0.02em',
            color: mode === m.key ? t.text : t.textMuted,
          }}>{m.label}</span>
        </button>
      ))}
    </div>
  );
}

// ── New Conversation Button ──
function NewConversationBtn({ collapsed, t, onNew }) {
  if (collapsed) {
    return (
      <div style={{ padding: '12px 0', display: 'flex', justifyContent: 'center' }}>
        <button title="New Conversation" onClick={onNew}
          style={{
            width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'transparent', border: `1px solid ${t.border}`, borderRadius: 6,
            borderLeft: `2px solid ${t.flame}`, cursor: 'pointer', color: t.flame, fontSize: 16,
            transition: 'border-color 0.15s',
          }}
        >
          {IC.plus}
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '16px 12px 8px' }}>
      <button
        onClick={onNew}
        style={{
          width: '100%', padding: '11px 16px', display: 'flex', alignItems: 'center', gap: 10,
          background: 'transparent', border: `1px solid ${t.border}`, borderRadius: 6,
          borderLeft: `2px solid ${t.flame}`, cursor: 'pointer',
          transition: 'border-color 0.15s, background 0.15s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = t.surfaceRaised; e.currentTarget.style.borderColor = t.borderHover; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = t.border; }}
      >
        <span style={{ fontSize: 15, color: t.flame }}>{IC.plus}</span>
        <span style={{ fontSize: 12, fontWeight: 600, color: t.text, letterSpacing: '0.01em' }}>New Conversation</span>
      </button>
    </div>
  );
}

// ── Search Bar ──
function SearchBar({ t }) {
  const [q, setQ] = useState('');
  return (
    <div style={{ padding: '4px 12px 8px' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
        background: t.bg, border: `1px solid ${t.border}`, borderRadius: 6,
      }}>
        <span style={{ fontSize: 14, color: t.textMuted }}>{IC.search}</span>
        <input
          value={q} onChange={(e) => setQ(e.target.value)}
          placeholder="Search conversations..."
          style={{
            flex: 1, background: 'transparent', border: 'none', outline: 'none',
            fontSize: 12, color: t.text, fontFamily: font.body,
          }}
        />
      </div>
    </div>
  );
}

// ── Conversation List ──
function ConversationList({ activeId, onSelect, collapsed, t }) {
  const mode = useAppStore((s) => s.mode);
  const backendOnline = useAppStore((s) => s.backendOnline);
  const conversations = useAppStore((s) => s.conversations);
  const simulations = useAppStore((s) => s.simulations);

  // Use real data when online, fall back to mock
  const items = backendOnline
    ? (mode === 'council' ? conversations : simulations)
    : CONVERSATIONS.filter((c) => c.mode === mode);
  const filtered = Array.isArray(items) ? items : [];

  if (collapsed) {
    return (
      <div style={{ flex: 1, padding: '8px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, overflowY: 'auto' }}>
        {filtered.map((c) => (
          <button key={c.id} onClick={() => onSelect(c.id)} title={c.title}
            style={{
              width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: activeId === c.id ? t.surfaceRaised : 'transparent',
              border: 'none', borderRadius: 4, cursor: 'pointer',
              borderLeft: `2px solid ${activeId === c.id ? t.cyan : 'transparent'}`,
              color: activeId === c.id ? t.text : t.textMuted, fontSize: 14,
            }}
          >
            {IC.chat}
          </button>
        ))}
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '40px 20px' }}>
        <span style={{ fontSize: 28, color: t.textMuted }}>{IC.chat}</span>
        <span style={{ fontSize: 12, color: t.textMuted, textAlign: 'center', lineHeight: 1.5 }}>No conversations yet</span>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '4px 0' }}>
      {filtered.map((c) => (
        <button key={c.id} onClick={() => onSelect(c.id)}
          style={{
            width: '100%', padding: '12px 20px', display: 'flex', flexDirection: 'column', gap: 4,
            background: activeId === c.id ? t.surfaceRaised : 'transparent',
            border: 'none', cursor: 'pointer', textAlign: 'left',
            borderLeft: `2px solid ${activeId === c.id ? t.cyan : 'transparent'}`,
            transition: 'all 0.13s',
          }}
          onMouseEnter={(e) => { if (activeId !== c.id) e.currentTarget.style.background = t.surfaceHover; }}
          onMouseLeave={(e) => { if (activeId !== c.id) e.currentTarget.style.background = 'transparent'; }}
        >
          <div style={{
            fontSize: 12, fontWeight: 500, color: activeId === c.id ? t.text : t.textSoft,
            lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis',
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          }}>{c.title}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 10, fontFamily: font.mono, color: t.textMuted, letterSpacing: '0.04em' }}>{c.updated}</span>
          </div>
        </button>
      ))}
    </div>
  );
}

// ── Footer Icon Button ──
function FooterBtn({ onClick, title, icon, t, rotating }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick} title={title}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: hovered ? t.surfaceHover : 'transparent',
        border: 'none', cursor: 'pointer', color: t.textMuted, fontSize: 20,
        borderRadius: 6,
        transform: hovered ? 'scale(1.05)' : rotating ? 'rotate(180deg)' : 'scale(1)',
        transition: 'all 150ms',
      }}
    >
      {icon}
    </button>
  );
}

// ── Footer ──
function SidebarFooter({ collapsed, t }) {
  const toggleTheme = useAppStore((s) => s.toggleTheme);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);
  const toggleConfigModal = useAppStore((s) => s.toggleConfigModal);
  const theme = useAppStore((s) => s.theme);
  const backendOnline = useAppStore((s) => s.backendOnline);
  const [themeRotating, setThemeRotating] = useState(false);

  const handleThemeToggle = () => {
    setThemeRotating(true);
    toggleTheme();
    setTimeout(() => setThemeRotating(false), 300);
  };

  if (collapsed) {
    return (
      <div style={{
        borderTop: `1px solid ${t.border}`, padding: '12px 0',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
        background: t.surfaceRaised,
      }}>
        <ConnectionDot online={backendOnline} collapsed />
        <FooterBtn onClick={toggleConfigModal} title="Settings" icon={IC.settings} t={t} />
        <FooterBtn onClick={handleThemeToggle} title={theme === 'dark' ? 'Light mode' : 'Dark mode'} icon={theme === 'dark' ? IC.sun : IC.moon} t={t} rotating={themeRotating} />
        <FooterBtn onClick={toggleSidebar} title="Expand sidebar" icon={IC.panelRight} t={t} />
      </div>
    );
  }

  return (
    <div style={{
      borderTop: `1px solid ${t.border}`, padding: '12px 16px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      background: t.surfaceRaised,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <ConnectionDot online={backendOnline} />
        <span style={{
          fontSize: 8, fontFamily: font.mono, fontWeight: 500, color: t.textMuted,
          textTransform: 'uppercase', letterSpacing: '0.14em',
        }}>
          OmniPresent Group
        </span>
      </div>
      <div style={{ display: 'flex', gap: 4 }}>
        <FooterBtn onClick={toggleConfigModal} title="Settings" icon={IC.settings} t={t} />
        <FooterBtn onClick={handleThemeToggle} title={theme === 'dark' ? 'Light mode' : 'Dark mode'} icon={theme === 'dark' ? IC.sun : IC.moon} t={t} rotating={themeRotating} />
        <FooterBtn onClick={toggleSidebar} title="Collapse sidebar" icon={IC.panelLeft} t={t} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Main Sidebar Component
// ─────────────────────────────────────────────────────────
export default function Sidebar({ activeConv, onSelectConv }) {
  const t = useTokens();
  const navigate = useNavigate();
  const sidebarState = useAppStore((s) => s.sidebarState);
  const mode = useAppStore((s) => s.mode);
  const backendOnline = useAppStore((s) => s.backendOnline);
  const collapsed = sidebarState === 'collapsed';

  const handleNew = async () => {
    if (mode === 'council' && backendOnline) {
      try {
        const conv = await api.createConversation();
        useAppStore.getState().addConversation(conv);
        useCouncilStore.getState().reset();
        useCouncilStore.getState().setConversationId(conv.id);
        navigate('/council');
      } catch {
        // Fallback — just navigate
        useCouncilStore.getState().reset();
        navigate('/council');
      }
    } else if (mode === 'genesis') {
      navigate('/launch');
    } else {
      useCouncilStore.getState().reset();
      navigate('/council');
    }
  };

  return (
    <>
      <Logo collapsed={collapsed} t={t} />
      <ModeTabs collapsed={collapsed} t={t} />
      <NewConversationBtn collapsed={collapsed} t={t} onNew={handleNew} />
      {!collapsed && <SearchBar t={t} />}
      <ConversationList activeId={activeConv} onSelect={onSelectConv} collapsed={collapsed} t={t} />
      <SidebarFooter collapsed={collapsed} t={t} />
    </>
  );
}
