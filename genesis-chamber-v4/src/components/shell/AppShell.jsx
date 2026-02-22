// ─────────────────────────────────────────────────────────
// GENESIS CHAMBER V4 — APP SHELL
// Layout wrapper: Sidebar + TopBar + content outlet
// 3-state sidebar: hidden / collapsed / expanded
// Ref: gc-v4-app-shell.jsx
// ─────────────────────────────────────────────────────────

import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { T, TLight, font, layout } from '../../design/tokens';
import { IC } from '../../design/icons';
import { useAppStore } from '../../stores/appStore';
import { useIsMobile, useIsTablet } from '../../hooks/useMediaQuery';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

// ── Mobile Overlay ──
function MobileOverlay({ open, onClose, children }) {
  if (!open) return null;
  return (
    <>
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
        zIndex: 998, transition: 'opacity 0.2s',
      }} />
      <div style={{
        position: 'fixed', top: 0, left: 0, bottom: 0, width: 280,
        zIndex: 999, display: 'flex', flexDirection: 'column',
        animation: 'slideInLeft 0.2s ease-out',
      }}>
        {children}
      </div>
    </>
  );
}

export default function AppShell() {
  const theme = useAppStore((s) => s.theme);
  const sidebarState = useAppStore((s) => s.sidebarState);
  const setSidebar = useAppStore((s) => s.setSidebar);
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeConv, setActiveConv] = useState(null);

  // Resolve tokens for current theme
  const t = theme === 'light' ? { ...T, ...TLight } : T;

  // Sync sidebar state with viewport
  useEffect(() => {
    if (isMobile) setSidebar('hidden');
    else if (isTablet) setSidebar('collapsed');
    // Don't force expanded on desktop — let user choice persist
  }, [isMobile, isTablet, setSidebar]);

  // Apply theme to <html>
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const sidebarWidth = sidebarState === 'expanded'
    ? layout.sidebar.expanded
    : sidebarState === 'collapsed'
      ? layout.sidebar.collapsed
      : layout.sidebar.hidden;

  const sidebarContent = (isMobileOverlay = false) => (
    <div style={{
      width: isMobileOverlay ? 280 : '100%',
      height: '100%',
      background: t.surface,
      borderRight: `1px solid ${t.border}`,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {isMobileOverlay && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '12px 12px 0' }}>
          <button onClick={() => setMobileOpen(false)}
            style={{
              width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: t.textMuted, fontSize: 16,
            }}
          >
            {IC.x}
          </button>
        </div>
      )}
      <Sidebar
        activeConv={activeConv}
        onSelectConv={(id) => { setActiveConv(id); if (isMobileOverlay) setMobileOpen(false); }}
      />
    </div>
  );

  return (
    <div style={{
      background: t.bg, minHeight: '100vh',
      fontFamily: font.body, color: t.text,
      WebkitFontSmoothing: 'antialiased',
    }}>
      {/* Desktop Sidebar */}
      <div className="gc-desktop-sidebar" style={{
        position: 'fixed', top: 0, left: 0, bottom: 0,
        width: sidebarWidth,
        display: 'flex', flexDirection: 'column',
        transition: 'width 0.2s cubic-bezier(0.16,1,0.3,1)',
        zIndex: 100, overflow: 'hidden',
      }}>
        {sidebarContent(false)}
      </div>

      {/* Mobile Overlay Sidebar */}
      <MobileOverlay open={mobileOpen} onClose={() => setMobileOpen(false)}>
        {sidebarContent(true)}
      </MobileOverlay>

      {/* Main Content */}
      <div
        className="gc-main-content"
        style={{
          marginLeft: isMobile ? 0 : sidebarWidth,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          transition: 'margin-left 0.2s cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        <TopBar onMenuOpen={() => setMobileOpen(true)} />
        <Outlet />
      </div>
    </div>
  );
}
