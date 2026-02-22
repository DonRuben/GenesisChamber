// ─────────────────────────────────────────────────────────
// GENESIS CHAMBER V4 — LANDING SCREEN
// Hero + New Simulation CTA + Recent Simulations
// ─────────────────────────────────────────────────────────

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { font, motion } from '../design/tokens';
import { IC } from '../design/icons';
import { Tag, MonoLabel, Btn } from '../design/shared';
import { RECENT_SIMS } from '../data/mock';
import { useTokens } from '../hooks/useTokens';
import { useIsMobile } from '../hooks/useMediaQuery';

// ── Recent Simulation Card ──
function RecentSimCard({ sim, t }) {
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(`/sim/${sim.title.toLowerCase().replace(/\s+/g, '-')}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: t.surface,
        borderLeft: `2px solid ${hovered ? t.flame : t.border}`,
        borderTop: 'none', borderRight: 'none', borderBottom: 'none',
        borderRadius: 8, padding: '10px 13px', textAlign: 'left', cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: 13, width: '100%',
        transition: `border-color ${motion.duration.normal} ease`,
      }}
    >
      <div style={{
        width: 32, height: 32, borderRadius: 8,
        background: `${t.flame}14`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 16, color: t.flame, flexShrink: 0,
      }}>
        {IC.genesis}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 13, fontWeight: 600, color: t.text,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>{sim.title}</div>
        <div style={{
          fontFamily: font.mono, fontSize: 10, color: t.textMuted, marginTop: 2,
        }}>{sim.date} · {sim.models}</div>
      </div>
      <Tag label={sim.status} color={sim.status === 'complete' ? t.green : t.gold} />
    </button>
  );
}

// ── Main Landing Component ──
export default function Landing() {
  const t = useTokens();
  const mobile = useIsMobile();
  const navigate = useNavigate();

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '55px 34px',
      animation: 'fadeSlideUp 0.3s ease-out',
    }}>
      {/* Hero */}
      <div style={{ textAlign: 'center', marginBottom: 34 }}>
        <div style={{ fontSize: 48, lineHeight: 1, marginBottom: 16, color: t.flame }}>
          {IC.genesis}
        </div>
        <h1 style={{
          fontFamily: font.display, fontSize: mobile ? 28 : 44, fontWeight: 700,
          color: t.text, margin: 0, letterSpacing: '-0.02em',
        }}>Genesis Chamber</h1>
        <p style={{
          fontFamily: font.body, fontSize: 15, color: t.textMuted, marginTop: 10,
          maxWidth: 420, lineHeight: 1.5,
        }}>Multi-persona AI creative simulation. 19 soul-loaded participants compete, critique, and refine concepts across multiple rounds.</p>
      </div>

      {/* New Simulation CTA */}
      <div style={{ marginBottom: 48 }}>
        <Btn color={t.flame} large onClick={() => navigate('/launch')}>
          {IC.plus} New Simulation
        </Btn>
      </div>

      {/* Recent Simulations */}
      {RECENT_SIMS.length > 0 && (
        <div style={{ maxWidth: 540, width: '100%' }}>
          <MonoLabel icon={IC.clock} color={t.textMuted}>
            Recent Simulations
          </MonoLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {RECENT_SIMS.map((sim, i) => (
              <RecentSimCard key={i} sim={sim} t={t} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
