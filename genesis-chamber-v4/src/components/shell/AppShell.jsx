// ─────────────────────────────────────────────────────────
// GENESIS CHAMBER V4 — APP SHELL
// Layout wrapper: Sidebar + TopBar + content outlet
// 3-state sidebar: hidden / collapsed / expanded
// Ref: gc-v4-app-shell.jsx
// ─────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { font, layout } from '../../design/tokens';
import { IC } from '../../design/icons';
import { useAppStore } from '../../stores/appStore';
import { useCouncilStore } from '../../stores/councilStore';
import { useIsMobile, useIsTablet } from '../../hooks/useMediaQuery';
import { useTokens } from '../../hooks/useTokens';
import { useBackendStatus } from '../../hooks/useBackendStatus';
import * as api from '../../services/api';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import ConfigModal from './ConfigModal';

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
  const backendOnline = useAppStore((s) => s.backendOnline);
  const loadSidebarData = useAppStore((s) => s.loadSidebarData);
  const loadModels = useAppStore((s) => s.loadModels);
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const navigate = useNavigate();

  const showConfigModal = useAppStore((s) => s.showConfigModal);
  const [mobileOpen, setMobileOpen] = useState(false);
  const activeConv = useAppStore((s) => s.activeConversationId);
  const setActiveConv = useAppStore((s) => s.setActiveConversationId);

  // Load a conversation from the backend into the appropriate store
  const handleLoadConversation = useCallback(async (id) => {
    const online = useAppStore.getState().backendOnline;
    if (!online) return; // Mock mode — no loading needed

    try {
      const data = await api.getConversation(id);
      if (data.mode === 'council' || !data.mode) {
        const cs = useCouncilStore.getState();
        cs.reset();
        cs.setConversationId(id);
        cs.setQuestion(data.question || data.title || '');
        if (data.stage1) cs.handleSSEEvent('stage1_complete', { data: data.stage1 });
        if (data.stage2) cs.handleSSEEvent('stage2_complete', { data: data.stage2.rankings, metadata: data.stage2 });
        if (data.stage3) cs.handleSSEEvent('stage3_complete', { data: data.stage3 });
        cs.setView('conversation');
        navigate('/council');
      } else if (data.mode === 'chamber') {
        navigate(`/sim/${id}`);
      }
    } catch (err) {
      console.error('[GC] Failed to load conversation:', err);
    }
  }, [navigate]);

  // Resolve tokens for current theme
  const t = useTokens();

  // Start backend health check polling
  useBackendStatus();

  // Load sidebar data + model roster when backend comes online
  useEffect(() => {
    if (backendOnline === true) {
      loadSidebarData();
      loadModels();
    }
  }, [backendOnline, loadSidebarData, loadModels]);

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
        onSelectConv={(id) => {
          setActiveConv(id);
          if (isMobileOverlay) setMobileOpen(false);
          handleLoadConversation(id);
        }}
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

      {/* Config Modal */}
      {showConfigModal && <ConfigModal />}
    </div>
  );
}
