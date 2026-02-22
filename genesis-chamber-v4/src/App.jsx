// ─────────────────────────────────────────────────────────
// GENESIS CHAMBER V4 — APP ROOT
// BrowserRouter with route definitions
// ─────────────────────────────────────────────────────────

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppShell from './components/shell/AppShell';
import LLMCouncil from './components/council/LLMCouncil';
import { DAArena } from './components/arena';
import { Launcher, Dashboard, Gallery } from './components/chamber';
import { font } from './design/tokens';
import { useTokens } from './hooks/useTokens';

function NotFound() {
  const t = useTokens();
  return (
    <div style={{
      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', gap: 12,
    }}>
      <div style={{
        padding: '24px 32px', background: t.surface,
        border: `1px solid ${t.border}`, borderRadius: 8,
        borderLeft: `2px solid ${t.textMuted}`, textAlign: 'center',
      }}>
        <div style={{
          fontSize: 28, fontFamily: font.display, fontWeight: 700,
          color: t.text, letterSpacing: '-0.03em',
        }}>404</div>
        <div style={{
          fontSize: 10, fontFamily: font.mono, color: t.textMuted,
          marginTop: 8, letterSpacing: '0.04em', textTransform: 'uppercase',
        }}>Page not found</div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<Navigate to="/launch" replace />} />
          <Route path="council" element={<LLMCouncil />} />
          <Route path="launch" element={<Launcher />} />
          <Route path="sim/:id" element={<Dashboard />} />
          <Route path="sim/:id/da" element={<DAArena />} />
          <Route path="sim/:id/gallery" element={<Gallery />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
