// ─────────────────────────────────────────────────────────
// GENESIS CHAMBER V4 — LANDING SCREEN
// Hero + Mode Cards + Recent Simulations
// Ref: gc-v4-information-architecture.jsx
// ─────────────────────────────────────────────────────────

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { T, TLight, font } from '../design/tokens';
import { IC } from '../design/icons';
import { Tag, MonoLabel } from '../design/shared';
import { useAppStore } from '../stores/appStore';
import { RECENT_SIMS } from '../data/mock';

// ── Resolve tokens for theme ──
function useTokens() {
  const theme = useAppStore((s) => s.theme);
  return theme === 'light' ? { ...T, ...TLight } : T;
}

// ── Mode Card ──
function ModeCard({ title, subtitle, description, icon, accentColor, features, t }) {
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();

  const handleClick = () => {
    if (accentColor === T.cyan) navigate('/council');
    else navigate('/launch');
  };

  return (
    <button
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: t.surface,
        borderLeft: `2px solid ${hovered ? accentColor : t.border}`,
        borderTop: 'none', borderRight: 'none', borderBottom: 'none',
        borderRadius: 8, padding: '28px 21px', textAlign: 'center', cursor: 'pointer',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 13,
        minHeight: 200, position: 'relative', transition: 'border-color 210ms ease',
      }}
    >
      <div style={{
        fontSize: 36, lineHeight: 1,
        color: hovered ? accentColor : t.textSoft,
        transition: 'color 210ms ease',
      }}>{icon}</div>
      <h2 style={{
        fontFamily: font.display, fontSize: 20, fontWeight: 700,
        color: t.text, margin: 0,
      }}>{title}</h2>
      <p style={{
        fontFamily: font.body, fontSize: 13, color: t.textSoft,
        margin: 0, lineHeight: 1.4,
      }}>{subtitle}</p>
      <p style={{
        fontFamily: font.body, fontSize: 12, color: t.textMuted,
        margin: 0, lineHeight: 1.5,
        maxHeight: hovered ? 48 : 0, opacity: hovered ? 1 : 0,
        overflow: 'hidden', transition: 'all 210ms ease',
      }}>{description}</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', marginTop: 4 }}>
        {features.map((f, i) => (
          <span key={i} style={{
            fontFamily: font.mono, fontSize: 10,
            color: hovered ? accentColor : t.textMuted,
            background: hovered ? `${accentColor}14` : t.surfaceRaised,
            borderRadius: 4, padding: '2px 8px',
            textTransform: 'uppercase', letterSpacing: '0.12em',
            transition: 'all 210ms ease',
          }}>{f}</span>
        ))}
      </div>
      <div style={{
        marginTop: 'auto', paddingTop: 13,
        opacity: hovered ? 1 : 0,
        transform: hovered ? 'translateY(0)' : 'translateY(8px)',
        transition: 'all 210ms ease',
        color: accentColor, fontSize: 12, fontWeight: 600,
      }}>
        Get Started &rarr;
      </div>
    </button>
  );
}

// ── Recent Simulation Card ──
function RecentSimCard({ sim, t }) {
  return (
    <button style={{
      background: t.surface,
      borderLeft: `2px solid ${sim.mode === 'council' ? T.cyan : T.flame}`,
      borderTop: 'none', borderRight: 'none', borderBottom: 'none',
      borderRadius: 8, padding: '10px 13px', textAlign: 'left', cursor: 'pointer',
      display: 'flex', alignItems: 'center', gap: 13, width: '100%',
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: 8,
        background: `${sim.mode === 'council' ? T.cyan : T.flame}14`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 16, color: sim.mode === 'council' ? T.cyan : T.flame, flexShrink: 0,
      }}>
        {sim.mode === 'council' ? IC.brain : IC.bolt}
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
      <Tag label={sim.status} color={sim.status === 'complete' ? T.green : T.gold} />
    </button>
  );
}

// ── Main Landing Component ──
export default function Landing() {
  const t = useTokens();

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '55px 34px',
      animation: 'fadeSlideUp 0.3s ease-out',
    }}>
      {/* Hero */}
      <div style={{ textAlign: 'center', marginBottom: 55 }}>
        <h1 style={{
          fontFamily: font.display, fontSize: 44, fontWeight: 700,
          color: t.text, margin: 0, letterSpacing: '-0.02em',
        }}>Genesis Chamber</h1>
        <p style={{
          fontFamily: font.body, fontSize: 15, color: t.textMuted, marginTop: 10,
        }}>Multi-LLM creative intelligence platform</p>
      </div>

      {/* Mode Cards */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16,
        maxWidth: 640, width: '100%', marginBottom: 34,
      }}>
        <ModeCard
          t={t}
          title="Council"
          subtitle="Full multi-LLM simulation"
          description="5 AI models compete, critique, and evolve concepts through multiple rounds"
          icon={IC.brain}
          accentColor={T.cyan}
          features={['Multi-Round', 'DA Arena', 'Media Gen']}
        />
        <ModeCard
          t={t}
          title="Quick Mode"
          subtitle="Instant concept generation"
          description="Fast single-round ideation with 3 models, no competitive rounds"
          icon={IC.bolt}
          accentColor={T.flame}
          features={['Single Round', '3 Models', 'Fast']}
        />
      </div>

      {/* Recent Simulations */}
      {RECENT_SIMS.length > 0 && (
        <div style={{ maxWidth: 640, width: '100%' }}>
          <MonoLabel icon={IC.rocket} color={t.textMuted}>
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
