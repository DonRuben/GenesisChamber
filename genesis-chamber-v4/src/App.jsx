// ─────────────────────────────────────────────────────────
// GENESIS CHAMBER V4 — APP ROOT
// BrowserRouter with route definitions
// ─────────────────────────────────────────────────────────

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppShell from './components/shell/AppShell';
import Landing from './components/Landing';
import { T, font } from './design/tokens';

// ── Placeholder for routes not yet built ──
function Placeholder({ label, color = T.cyan }) {
  return (
    <div style={{
      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', gap: 12,
      animation: 'fadeSlideUp 0.3s ease-out',
    }}>
      <div style={{
        padding: '24px 32px', background: T.surface,
        border: `1px solid ${T.border}`, borderRadius: 8,
        borderLeft: `2px solid ${color}`, textAlign: 'center',
      }}>
        <div style={{
          fontSize: 9, fontFamily: font.mono, color: T.textMuted,
          textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8,
        }}>
          COMING IN PHASE 3+
        </div>
        <div style={{
          fontSize: 18, fontFamily: font.display, fontWeight: 700,
          color: T.text, letterSpacing: '-0.03em',
        }}>
          {label}
        </div>
        <div style={{
          fontSize: 10, fontFamily: font.mono, color: T.textMuted,
          marginTop: 12, letterSpacing: '0.04em',
        }}>
          Content renders here
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<Landing />} />
          <Route path="council" element={<Placeholder label="LLM Council" color={T.cyan} />} />
          <Route path="launch" element={<Placeholder label="Simulation Launcher" color={T.flame} />} />
          <Route path="sim/:id" element={<Placeholder label="Dashboard" color={T.flame} />} />
          <Route path="sim/:id/da" element={<Placeholder label="DA Arena" color={T.magenta} />} />
          <Route path="sim/:id/gallery" element={<Placeholder label="Gallery" color={T.purple} />} />
          <Route path="*" element={<Placeholder label="404 — Not Found" color={T.textMuted} />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
