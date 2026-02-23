// ─────────────────────────────────────────────────────────
// GENESIS CHAMBER V4 — SIDEBAR
// 3-state: hidden (0px) / collapsed (56px) / expanded (260px)
// Date-grouped conversations, starred pins, inline rename/delete
// ─────────────────────────────────────────────────────────

import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { font } from '../../design/tokens';
import { IC } from '../../design/icons';
import { useAppStore } from '../../stores/appStore';
import { useCouncilStore } from '../../stores/councilStore';
import { CONVERSATIONS } from '../../data/mock';
import { ConnectionDot } from '../../design/skeletons';
import { useTokens } from '../../hooks/useTokens';
import * as api from '../../services/api';

// ── Date Grouping Utilities ──
function getDateGroup(isoDate) {
  if (!isoDate) return 'Earlier';
  const d = new Date(isoDate);
  const now = new Date();
  const diffMs = now - d;
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays === 0 && d.getDate() === now.getDate()) return 'Today';
  if (diffDays <= 1 && d.getDate() === now.getDate() - 1) return 'Yesterday';
  if (diffDays <= 7) return 'This Week';
  return 'Earlier';
}

function formatRelativeTime(isoDate) {
  if (!isoDate) return '';
  const diffMs = Date.now() - new Date(isoDate);
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'Yesterday';
  return `${days}d ago`;
}

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
  const searchFilter = useAppStore((s) => s.searchFilter);
  const setSearchFilter = useAppStore((s) => s.setSearchFilter);
  return (
    <div style={{ padding: '4px 12px 8px' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
        background: t.bg, border: `1px solid ${t.border}`, borderRadius: 6,
      }}>
        <span style={{ fontSize: 14, color: t.textMuted }}>{IC.search}</span>
        <input
          value={searchFilter} onChange={(e) => setSearchFilter(e.target.value)}
          placeholder="Search conversations..."
          style={{
            flex: 1, background: 'transparent', border: 'none', outline: 'none',
            fontSize: 12, color: t.text, fontFamily: font.body,
          }}
        />
        {searchFilter && (
          <button onClick={() => setSearchFilter('')}
            style={{
              width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: t.textMuted, fontSize: 10, borderRadius: 9,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = t.surfaceHover; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            {IC.x}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Conversation Item (expanded) ──
function ConvItem({ c, isActive, onSelect, t, onMenuOpen, hoveredId, setHoveredId }) {
  const modeIcon = c.mode === 'council' ? IC.council : IC.genesis;
  const modeColor = c.mode === 'council' ? t.cyan : t.flame;
  const timeStr = formatRelativeTime(c.createdAt || c.updatedAt) || c.updated || '';
  const isHovered = hoveredId === c.id;

  return (
    <button
      onClick={() => onSelect(c.id)}
      onMouseEnter={() => setHoveredId(c.id)}
      onMouseLeave={() => setHoveredId(null)}
      style={{
        width: '100%', padding: '10px 12px 10px 16px', display: 'flex', alignItems: 'flex-start', gap: 10,
        background: isActive ? t.surfaceRaised : isHovered ? t.surfaceHover : 'transparent',
        border: 'none', cursor: 'pointer', textAlign: 'left',
        borderLeft: `2px solid ${isActive ? t.cyan : 'transparent'}`,
        transition: 'all 0.13s', position: 'relative',
      }}
    >
      <span style={{ fontSize: 13, color: modeColor, flexShrink: 0, marginTop: 1 }}>{modeIcon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 12, fontWeight: 500, color: isActive ? t.text : t.textSoft,
          lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>{c.title}</div>
        <div style={{ fontSize: 9, fontFamily: font.mono, color: t.textMuted, letterSpacing: '0.04em', marginTop: 2 }}>
          {timeStr}
        </div>
      </div>
      {isHovered && (
        <button
          onClick={(e) => { e.stopPropagation(); onMenuOpen(c.id); }}
          style={{
            width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: t.surfaceHover, border: 'none', cursor: 'pointer',
            color: t.textMuted, fontSize: 12, borderRadius: 4, flexShrink: 0, marginTop: 0,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = t.surface; e.currentTarget.style.color = t.text; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = t.surfaceHover; e.currentTarget.style.color = t.textMuted; }}
        >
          &#x22EF;
        </button>
      )}
    </button>
  );
}

// ── Rename Input ──
function RenameInput({ conv, t, onDone }) {
  const [value, setValue] = useState(conv.title);
  const inputRef = useRef(null);
  const backendOnline = useAppStore((s) => s.backendOnline);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const handleSave = async () => {
    const trimmed = value.trim();
    if (!trimmed || trimmed === conv.title) { onDone(); return; }
    useAppStore.getState().updateConversation(conv.id, { title: trimmed });
    if (backendOnline) {
      try { await api.renameConversation(conv.id, trimmed); } catch { /* silent */ }
    }
    onDone();
  };

  return (
    <div style={{ padding: '10px 12px 10px 16px', borderLeft: '2px solid transparent' }}>
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') onDone(); }}
        onBlur={handleSave}
        style={{
          width: '100%', padding: '4px 8px', fontSize: 12, fontWeight: 500,
          color: t.text, background: t.bg, border: `1px solid ${t.cyan}`,
          borderRadius: 4, outline: 'none', fontFamily: font.body,
        }}
      />
    </div>
  );
}

// ── Context Menu ──
function ContextMenu({ convId, t, onClose, onRename, onDelete }) {
  const menuRef = useRef(null);
  const conv = useAppStore((s) => s.conversations.find((c) => c.id === convId));
  const isStarred = conv?.starred;

  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  const items = [
    { label: 'Rename', action: onRename },
    { label: isStarred ? 'Unstar' : 'Star', action: () => { useAppStore.getState().starConversation(convId); onClose(); } },
    { label: 'Delete', action: onDelete, danger: true },
  ];

  return (
    <div ref={menuRef} style={{
      position: 'absolute', right: 12, top: 0, zIndex: 50,
      background: t.surfaceRaised, border: `1px solid ${t.border}`, borderRadius: 6,
      padding: '4px 0', minWidth: 120, boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
    }}>
      {items.map((item) => (
        <button key={item.label} onClick={item.action}
          style={{
            width: '100%', padding: '7px 14px', display: 'flex', alignItems: 'center',
            background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left',
            fontSize: 11, fontFamily: font.body, color: item.danger ? t.red : t.textSoft,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = t.surfaceHover; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

// ── Delete Confirmation ──
function DeleteConfirm({ convId, t, onCancel }) {
  const backendOnline = useAppStore((s) => s.backendOnline);

  const handleDelete = async () => {
    if (useAppStore.getState().activeConversationId === convId) {
      useAppStore.getState().setActiveConversationId(null);
    }
    useAppStore.getState().removeConversation(convId);
    if (backendOnline) {
      try { await api.deleteConversation(convId); } catch { /* silent */ }
    }
    onCancel();
  };

  return (
    <div style={{
      padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 10,
      borderLeft: `2px solid ${t.red}`, background: t.surfaceHover,
    }}>
      <span style={{ fontSize: 11, color: t.red, fontFamily: font.body }}>Delete?</span>
      <button onClick={handleDelete}
        style={{
          padding: '3px 10px', fontSize: 10, fontFamily: font.mono, fontWeight: 600,
          background: t.red, color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer',
          textTransform: 'uppercase', letterSpacing: '0.08em',
        }}>Yes</button>
      <button onClick={onCancel}
        style={{
          padding: '3px 10px', fontSize: 10, fontFamily: font.mono, fontWeight: 600,
          background: 'transparent', color: t.textMuted, border: `1px solid ${t.border}`,
          borderRadius: 4, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.08em',
        }}>No</button>
    </div>
  );
}

// ── Section Header ──
function SectionHeader({ label, t, icon }) {
  return (
    <div style={{
      padding: '10px 16px 4px', fontSize: 9, fontFamily: font.mono, fontWeight: 600,
      color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.12em',
      display: 'flex', alignItems: 'center', gap: 6,
    }}>
      {icon && <span style={{ fontSize: 10 }}>{icon}</span>}
      {label}
    </div>
  );
}

// ── Conversation List ──
function ConversationList({ activeId, onSelect, collapsed, t }) {
  const mode = useAppStore((s) => s.mode);
  const backendOnline = useAppStore((s) => s.backendOnline);
  const conversations = useAppStore((s) => s.conversations);
  const simulations = useAppStore((s) => s.simulations);
  const searchFilter = useAppStore((s) => s.searchFilter);

  const [menuOpenId, setMenuOpenId] = useState(null);
  const [renamingId, setRenamingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);

  // Use real data when online, fall back to mock
  const items = backendOnline
    ? (mode === 'council' ? conversations : simulations)
    : CONVERSATIONS.filter((c) => c.mode === mode);
  const allItems = Array.isArray(items) ? items : [];

  // Apply search filter
  const query = searchFilter.toLowerCase().trim();
  const filtered = query
    ? allItems.filter((c) => c.title?.toLowerCase().includes(query))
    : allItems;

  // Collapsed view
  if (collapsed) {
    return (
      <div style={{ flex: 1, padding: '8px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, overflowY: 'auto' }}>
        {filtered.map((c) => {
          const modeIcon = c.mode === 'council' ? IC.council : IC.genesis;
          const modeColor = c.mode === 'council' ? t.cyan : t.flame;
          return (
            <button key={c.id} onClick={() => onSelect(c.id)} title={c.title}
              style={{
                width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: activeId === c.id ? t.surfaceRaised : 'transparent',
                border: 'none', borderRadius: 4, cursor: 'pointer',
                borderLeft: `2px solid ${activeId === c.id ? t.cyan : 'transparent'}`,
                color: activeId === c.id ? modeColor : t.textMuted, fontSize: 14,
                position: 'relative',
              }}
            >
              {modeIcon}
              {c.starred && (
                <span style={{
                  position: 'absolute', top: 2, right: 2, fontSize: 6, color: t.gold,
                }}>&#9733;</span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  // Empty state — no conversations at all
  if (allItems.length === 0) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '40px 20px' }}>
        <span style={{ fontSize: 28, color: t.textMuted }}>{mode === 'council' ? IC.council : IC.genesis}</span>
        <div style={{ fontSize: 12, color: t.textMuted, textAlign: 'center', lineHeight: 1.5 }}>
          Start your first {mode === 'council' ? 'Council session' : 'Genesis simulation'}
        </div>
      </div>
    );
  }

  // Empty search results
  if (filtered.length === 0 && query) {
    return (
      <div style={{ flex: 1, padding: '4px 0' }}>
        <div style={{ padding: '4px 16px 8px' }}>
          <span style={{ fontSize: 9, fontFamily: font.mono, color: t.textMuted }}>0 results</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '30px 20px' }}>
          <span style={{ fontSize: 20, color: t.textMuted }}>{IC.search}</span>
          <div style={{ fontSize: 11, color: t.textMuted, textAlign: 'center' }}>No matches</div>
        </div>
      </div>
    );
  }

  // Separate starred from unstarred
  const starred = filtered.filter((c) => c.starred);
  const unstarred = filtered.filter((c) => !c.starred);

  // Group unstarred by date
  const groups = {};
  const groupOrder = ['Today', 'Yesterday', 'This Week', 'Earlier'];
  for (const c of unstarred) {
    const group = getDateGroup(c.createdAt || c.updatedAt);
    if (!groups[group]) groups[group] = [];
    groups[group].push(c);
  }

  const renderItem = (c) => {
    if (confirmDeleteId === c.id) {
      return <DeleteConfirm key={c.id} convId={c.id} t={t} onCancel={() => setConfirmDeleteId(null)} />;
    }
    if (renamingId === c.id) {
      return <RenameInput key={c.id} conv={c} t={t} onDone={() => setRenamingId(null)} />;
    }
    return (
      <div key={c.id} style={{ position: 'relative' }}>
        <ConvItem
          c={c} isActive={activeId === c.id} onSelect={onSelect} t={t}
          onMenuOpen={(id) => setMenuOpenId(menuOpenId === id ? null : id)}
          hoveredId={hoveredId} setHoveredId={setHoveredId}
        />
        {menuOpenId === c.id && (
          <ContextMenu
            convId={c.id} t={t}
            onClose={() => setMenuOpenId(null)}
            onRename={() => { setMenuOpenId(null); setRenamingId(c.id); }}
            onDelete={() => { setMenuOpenId(null); setConfirmDeleteId(c.id); }}
          />
        )}
      </div>
    );
  };

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '4px 0' }}>
      {/* Search results count */}
      {query && (
        <div style={{ padding: '4px 16px 8px' }}>
          <span style={{ fontSize: 9, fontFamily: font.mono, color: t.textMuted }}>
            {filtered.length} result{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* Starred section */}
      {starred.length > 0 && (
        <>
          <SectionHeader label="Starred" t={t} icon={IC.star} />
          {starred.map(renderItem)}
        </>
      )}

      {/* Date-grouped sections */}
      {groupOrder.map((groupName) => {
        const items = groups[groupName];
        if (!items || items.length === 0) return null;
        return (
          <div key={groupName}>
            <SectionHeader label={groupName} t={t} />
            {items.map(renderItem)}
          </div>
        );
      })}
    </div>
  );
}

// ── Footer Icon Button ──
function FooterBtn({ onClick, title, icon, t, rotating, color, hoverColor, active }) {
  const [hovered, setHovered] = useState(false);
  const iconColor = (active || hovered) ? (hoverColor || t.cyan) : (color || t.textMuted);
  return (
    <button
      onClick={onClick} title={title}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: hovered ? t.surfaceHover : 'transparent',
        border: 'none', cursor: 'pointer', color: iconColor, fontSize: 20,
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
  const showConfigModal = useAppStore((s) => s.showConfigModal);
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
        <FooterBtn onClick={toggleConfigModal} title="Settings" icon={IC.settings} t={t} color={t.textMuted} hoverColor={t.cyan} active={showConfigModal} />
        <FooterBtn onClick={handleThemeToggle} title={theme === 'dark' ? 'Light mode' : 'Dark mode'} icon={theme === 'dark' ? IC.sun : IC.moon} t={t} color={t.cyan} hoverColor={t.cyan} rotating={themeRotating} />
        <FooterBtn onClick={toggleSidebar} title="Expand sidebar" icon={IC.panelRight} t={t} color={t.textSoft} hoverColor={t.cyan} />
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
        <FooterBtn onClick={toggleConfigModal} title="Settings" icon={IC.settings} t={t} color={t.textMuted} hoverColor={t.cyan} active={showConfigModal} />
        <FooterBtn onClick={handleThemeToggle} title={theme === 'dark' ? 'Light mode' : 'Dark mode'} icon={theme === 'dark' ? IC.sun : IC.moon} t={t} color={t.cyan} hoverColor={t.cyan} rotating={themeRotating} />
        <FooterBtn onClick={toggleSidebar} title="Collapse sidebar" icon={IC.panelLeft} t={t} color={t.textSoft} hoverColor={t.cyan} />
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
    useAppStore.getState().setActiveConversationId(null);
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
