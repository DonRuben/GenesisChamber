import { useState } from 'react';
import { font, motion } from '../../design/tokens';
import { IC } from '../../design/icons';
import { useChamberStore } from '../../stores/chamberStore';
import { useTokens } from '../../hooks/useTokens';
import { useIsMobile } from '../../hooks/useMediaQuery';

export default function LauncherEntry() {
  const t = useTokens();
  const mobile = useIsMobile();
  const setLaunchMode = useChamberStore((s) => s.setLaunchMode);
  const [hoveredCard, setHoveredCard] = useState(null);

  const pathways = [
    {
      mode: 'quick', label: 'Quick Start', desc: 'Pick a preset, write your brief, launch.',
      steps: '2 steps', color: t.cyan, icon: IC.bolt,
    },
    {
      mode: 'custom', label: 'Custom Setup', desc: 'Hand-pick personas, configure DA, fine-tune everything.',
      steps: '3 steps', color: t.flame, icon: IC.sliders,
    },
  ];

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 32,
      padding: mobile ? 16 : 24, animation: 'fadeSlideUp 0.3s ease-out',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          fontSize: 9, fontFamily: font.mono, color: t.textMuted,
          textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8,
        }}>GENESIS CHAMBER</div>
        <h1 style={{
          fontSize: 28, fontFamily: font.display, fontWeight: 700,
          color: t.text, letterSpacing: '-0.03em', margin: 0,
        }}>Launch Simulation</h1>
        <p style={{
          fontSize: 13, color: t.textSoft, marginTop: 8, maxWidth: 420,
          lineHeight: 1.5,
        }}>Choose how to configure your creative council</p>
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: mobile ? '1fr' : 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: 16, maxWidth: 560, width: '100%',
      }}>
        {pathways.map(({ mode, label, desc, steps, color, icon }) => (
          <button
            key={mode}
            onClick={() => setLaunchMode(mode)}
            onMouseEnter={() => setHoveredCard(mode)}
            onMouseLeave={() => setHoveredCard(null)}
            style={{
              background: t.surface, border: `1px solid ${t.border}`,
              borderRadius: 10, padding: 24, cursor: 'pointer',
              textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 12,
              transition: `all ${motion.duration.normal} ${motion.easing.default}`,
              borderBottom: `3px solid ${color}`,
              transform: hoveredCard === mode ? 'translateY(-2px)' : 'translateY(0)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 20, color }}>{icon}</span>
              <span style={{
                fontSize: 16, fontFamily: font.display, fontWeight: 700,
                color: t.text, letterSpacing: '-0.02em',
              }}>{label}</span>
            </div>
            <p style={{
              fontSize: 12, color: t.textSoft, margin: 0, lineHeight: 1.5,
            }}>{desc}</p>
            <span style={{
              fontSize: 9, fontFamily: font.mono, color, marginTop: 'auto',
              textTransform: 'uppercase', letterSpacing: '0.12em',
            }}>{steps}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
