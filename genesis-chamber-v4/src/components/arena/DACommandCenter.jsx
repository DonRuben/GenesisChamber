// ─────────────────────────────────────────────────────────
// DA COMMAND CENTER
// Config panel for simulation launcher
// Toggle, attack style, frequency, focus areas, presets
// ─────────────────────────────────────────────────────────

import { useState } from 'react';
import { T, font } from '../../design/tokens';
import { IC } from '../../design/icons';
import { MonoLabel } from '../../design/shared';
import { DA_STYLES, DA_FOCUS_AREAS, DA_PRESETS } from '../../data/mock';

// ── Toggle Switch ──
function Toggle({ enabled, onToggle }) {
  return (
    <button onClick={onToggle} style={{
      width: 48, height: 24, borderRadius: 12,
      background: enabled ? T.flame : T.surfaceRaised,
      border: `1px solid ${enabled ? T.flame : T.border}`,
      cursor: 'pointer', position: 'relative',
      transition: 'all 200ms ease', padding: 0, outline: 'none',
    }}>
      <span style={{
        position: 'absolute', top: 2, left: enabled ? 26 : 2,
        width: 18, height: 18, borderRadius: '50%',
        background: enabled ? '#fff' : T.textMuted,
        transition: 'all 200ms ease',
      }} />
    </button>
  );
}

// ── Style Card ──
function StyleCard({ style, selected, onSelect }) {
  const IconComp = IC[style.icon];
  return (
    <button onClick={onSelect} style={{
      background: selected ? `${style.color}0f` : T.surfaceRaised,
      border: `1px solid ${selected ? T.borderHover : T.border}`,
      borderLeft: `2px solid ${selected ? style.color : 'transparent'}`,
      borderRadius: 8, padding: '16px 14px', cursor: 'pointer',
      display: 'flex', flexDirection: 'column', gap: 8,
      textAlign: 'left', outline: 'none', flex: 1,
      transition: 'all 0.13s',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{
          width: 16, height: 16, borderRadius: '50%',
          border: `2px solid ${selected ? style.color : T.textMuted}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          {selected && <span style={{ width: 8, height: 8, borderRadius: '50%', background: style.color }} />}
        </span>
        <span style={{ fontSize: 18, color: selected ? style.color : T.textSoft }}>{IconComp}</span>
        <span style={{
          fontFamily: font.body, fontSize: 14, fontWeight: 600,
          color: selected ? T.text : T.textSoft,
        }}>
          {style.name}
        </span>
      </div>
      <span style={{
        fontFamily: font.body, fontSize: 12, color: T.textMuted,
        lineHeight: 1.45, paddingLeft: 24,
      }}>
        {style.description}
      </span>
    </button>
  );
}

// ── Frequency Slider ──
function FrequencySlider({ value, onChange }) {
  const labels = ['Rare', 'Low', 'Medium', 'High', 'Every Round'];
  const pct = ((value - 1) / 4) * 100;
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
        <span style={{ fontFamily: font.body, fontSize: 13, fontWeight: 500, color: T.textSoft }}>
          Challenge Frequency
        </span>
        <span style={{ fontFamily: font.mono, fontSize: 13, fontWeight: 600, color: T.cyan }}>
          {value} — {labels[value - 1]}
        </span>
      </div>
      <div
        style={{ position: 'relative', height: 24, cursor: 'pointer' }}
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
          onChange(Math.round(x * 4) + 1);
        }}
      >
        {/* Track */}
        <div style={{
          position: 'absolute', top: 10, left: 0, right: 0, height: 4,
          background: T.surfaceRaised, borderRadius: 2,
        }} />
        {/* Fill */}
        <div style={{
          position: 'absolute', top: 10, left: 0, width: `${pct}%`, height: 4,
          background: T.cyan, borderRadius: 2, transition: 'width 120ms ease',
        }} />
        {/* Dots */}
        {[0, 1, 2, 3, 4].map(i => (
          <div key={i} style={{
            position: 'absolute', top: 9, left: `${(i / 4) * 100}%`,
            width: 6, height: 6, borderRadius: '50%',
            background: i <= value - 1 ? T.cyan : T.surfaceHover,
            border: `1px solid ${i <= value - 1 ? T.cyan : T.border}`,
            transform: 'translateX(-3px)', transition: 'all 120ms ease',
          }} />
        ))}
        {/* Thumb */}
        <div style={{
          position: 'absolute', top: 4, left: `${pct}%`,
          width: 16, height: 16, borderRadius: '50%',
          background: T.cyan, transform: 'translateX(-8px)',
          transition: 'left 120ms ease',
        }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
        {[1, 2, 3, 4, 5].map(n => (
          <span key={n} style={{
            fontFamily: font.mono, fontSize: 10,
            color: n === value ? T.cyan : T.textMuted,
            width: 20, textAlign: 'center',
          }}>
            {n}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Focus Chip ──
function FocusChip({ area, selected, onToggle }) {
  const IconComp = IC[area.icon];
  return (
    <button onClick={onToggle} style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '6px 12px', borderRadius: 4,
      background: selected ? 'rgba(0,217,255,0.08)' : 'transparent',
      border: `1px solid ${selected ? T.cyan : T.border}`,
      color: selected ? T.cyan : T.textMuted,
      fontFamily: font.body, fontSize: 13, fontWeight: 500,
      cursor: 'pointer', outline: 'none', transition: 'all 0.13s',
    }}>
      <span style={{ fontSize: 14 }}>{IconComp}</span>
      {area.label}
      {selected && <span style={{ fontSize: 14, marginLeft: 2 }}>{IC.check}</span>}
    </button>
  );
}

// ── Preset Card ──
function PresetCard({ preset, onSelect }) {
  return (
    <button onClick={onSelect} style={{
      background: T.surfaceRaised, border: `1px solid ${T.border}`,
      borderRadius: 8, padding: '14px 16px', cursor: 'pointer',
      textAlign: 'left', outline: 'none', width: '100%',
      transition: 'all 0.13s',
      display: 'flex', alignItems: 'flex-start', gap: 14,
    }}>
      <div style={{ display: 'flex', gap: 2, fontSize: 16, flexShrink: 0, paddingTop: 2 }}>
        {[1, 2, 3].map(i => (
          <span key={i} style={{
            color: i <= preset.intensity ? T.flame : T.textMuted,
            opacity: i <= preset.intensity ? 1 : 0.25,
          }}>
            {IC.flame}
          </span>
        ))}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: font.body, fontSize: 14, fontWeight: 600, color: T.text, marginBottom: 4 }}>
          {preset.name}
        </div>
        <div style={{ fontFamily: font.body, fontSize: 12, color: T.textMuted, lineHeight: 1.45 }}>
          {preset.description}
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
          <span style={{
            fontFamily: font.mono, fontSize: 10, color: T.textMuted,
            background: T.surface, padding: '2px 6px', borderRadius: 3,
          }}>
            {preset.style}
          </span>
          <span style={{
            fontFamily: font.mono, fontSize: 10, color: T.textMuted,
            background: T.surface, padding: '2px 6px', borderRadius: 3,
          }}>
            freq:{preset.frequency}
          </span>
          <span style={{
            fontFamily: font.mono, fontSize: 10, color: T.textMuted,
            background: T.surface, padding: '2px 6px', borderRadius: 3,
          }}>
            {preset.focusAreas.length} areas
          </span>
        </div>
      </div>
      <span style={{ color: T.textMuted, fontSize: 16, flexShrink: 0, paddingTop: 2 }}>
        {IC.chevDown}
      </span>
    </button>
  );
}

// ── Section Header ──
function SectionHeader({ label, icon, sub }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {icon && <span style={{ fontSize: 16, color: T.textMuted }}>{icon}</span>}
        <span style={{
          fontFamily: font.body, fontSize: 13, fontWeight: 600,
          color: T.textSoft, textTransform: 'uppercase', letterSpacing: '0.04em',
        }}>
          {label}
        </span>
      </div>
      {sub && (
        <p style={{ fontFamily: font.body, fontSize: 12, color: T.textMuted, margin: '4px 0 0', lineHeight: 1.45 }}>
          {sub}
        </p>
      )}
    </div>
  );
}

// ── Config Summary ──
function ConfigSummary({ style, frequency, focusAreas }) {
  const styleObj = DA_STYLES.find(s => s.id === style);
  return (
    <div style={{
      background: T.surface, border: `1px solid ${T.border}`,
      borderRadius: 8, padding: '12px 16px',
      display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
    }}>
      <div style={{
        fontFamily: font.mono, fontSize: 11, color: T.textMuted,
        display: 'flex', alignItems: 'center', gap: 6,
      }}>
        <span style={{ color: styleObj?.color || T.textSoft, fontSize: 14 }}>
          {IC[styleObj?.icon || 'swords']}
        </span>
        <span style={{ color: styleObj?.color || T.textSoft, fontWeight: 600 }}>
          {styleObj?.name || '—'}
        </span>
      </div>
      <span style={{ width: 1, height: 16, background: T.border }} />
      <div style={{ fontFamily: font.mono, fontSize: 11, color: T.textMuted }}>
        Freq: <span style={{ color: T.cyan, fontWeight: 600 }}>{frequency}/5</span>
      </div>
      <span style={{ width: 1, height: 16, background: T.border }} />
      <div style={{ fontFamily: font.mono, fontSize: 11, color: T.textMuted }}>
        Focus: <span style={{ color: T.text, fontWeight: 600 }}>{focusAreas.length}</span> areas
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════
export default function DACommandCenter() {
  const [enabled, setEnabled] = useState(false);
  const [daStyle, setDaStyle] = useState('socratic');
  const [frequency, setFrequency] = useState(3);
  const [focusAreas, setFocusAreas] = useState(['feasibility', 'market']);
  const [panelView, setPanelView] = useState('config');

  const toggleFocus = (id) => {
    setFocusAreas(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const applyPreset = (preset) => {
    setDaStyle(preset.style);
    setFrequency(preset.frequency);
    setFocusAreas([...preset.focusAreas]);
    setPanelView('config');
  };

  return (
    <div style={{ width: '100%', maxWidth: 480 }}>

      {/* Header */}
      <div style={{
        fontFamily: font.display, fontSize: 22, fontWeight: 700,
        letterSpacing: '-0.02em', color: T.text, marginBottom: 6,
      }}>
        DA Command Center
      </div>
      <p style={{
        fontFamily: font.body, fontSize: 13, color: T.textMuted,
        margin: '0 0 32px', lineHeight: 1.45,
      }}>
        Configure Devil's Advocate behavior for this simulation.
      </p>

      {/* Master Toggle */}
      <div style={{
        background: T.surface, border: `1px solid ${T.border}`,
        borderRadius: 8, padding: '16px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: enabled ? 28 : 0, transition: 'margin 200ms ease',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 20, color: enabled ? T.flame : T.textMuted }}>{IC.swords}</span>
          <div>
            <div style={{
              fontFamily: font.body, fontSize: 15, fontWeight: 600,
              color: enabled ? T.text : T.textSoft,
            }}>
              Devil's Advocate
            </div>
            <div style={{ fontFamily: font.body, fontSize: 12, color: T.textMuted, marginTop: 1 }}>
              Enable adversarial testing
            </div>
          </div>
        </div>
        <Toggle enabled={enabled} onToggle={() => setEnabled(!enabled)} />
      </div>

      {/* Expandable Config Panel */}
      {enabled && (
        <div style={{ animation: 'fadeSlideUp 0.22s ease both' }}>

          {/* Tab Toggle */}
          <div style={{
            display: 'flex', gap: 0, marginBottom: 28,
            background: T.surfaceRaised, borderRadius: 6, padding: 3,
          }}>
            {[
              { id: 'config', label: 'Custom Config' },
              { id: 'presets', label: 'Quick Start' },
            ].map(tab => (
              <button key={tab.id} onClick={() => setPanelView(tab.id)} style={{
                flex: 1, padding: '8px 0', borderRadius: 4,
                background: panelView === tab.id ? T.surface : 'transparent',
                border: panelView === tab.id ? `1px solid ${T.border}` : '1px solid transparent',
                color: panelView === tab.id ? T.text : T.textMuted,
                fontFamily: font.body, fontSize: 13, fontWeight: 500,
                cursor: 'pointer', outline: 'none', transition: 'all 0.13s',
              }}>
                {tab.label}
              </button>
            ))}
          </div>

          {panelView === 'config' ? (
            <>
              {/* DA Style Selector */}
              <div style={{ marginBottom: 32 }}>
                <SectionHeader label="Attack Style" icon={IC.swords} sub="How the advocate approaches challenges" />
                <div style={{ display: 'flex', gap: 10 }}>
                  {DA_STYLES.map(s => (
                    <StyleCard key={s.id} style={s} selected={daStyle === s.id} onSelect={() => setDaStyle(s.id)} />
                  ))}
                </div>
              </div>

              {/* Frequency */}
              <div style={{ marginBottom: 32 }}>
                <SectionHeader label="Frequency" icon={IC.bolt} sub="How often the advocate interjects" />
                <FrequencySlider value={frequency} onChange={setFrequency} />
              </div>

              {/* Focus Areas */}
              <div style={{ marginBottom: 32 }}>
                <SectionHeader label="Focus Areas" icon={IC.target} sub="Dimensions the advocate prioritizes" />
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {DA_FOCUS_AREAS.map(area => (
                    <FocusChip
                      key={area.id}
                      area={area}
                      selected={focusAreas.includes(area.id)}
                      onToggle={() => toggleFocus(area.id)}
                    />
                  ))}
                </div>
              </div>

              {/* Summary */}
              <ConfigSummary style={daStyle} frequency={frequency} focusAreas={focusAreas} />
            </>
          ) : (
            <div>
              <SectionHeader label="Quick Start Presets" icon={IC.rocket} sub="Pre-configured DA profiles — select to apply" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {DA_PRESETS.map(preset => (
                  <PresetCard key={preset.id} preset={preset} onSelect={() => applyPreset(preset)} />
                ))}
              </div>
            </div>
          )}

          {/* Info Footer */}
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: 8,
            marginTop: 28, padding: '12px 14px',
            background: 'rgba(0,217,255,0.04)', borderRadius: 6,
            border: '1px solid rgba(0,217,255,0.08)',
          }}>
            <span style={{ fontSize: 14, color: T.cyan, flexShrink: 0, paddingTop: 1 }}>
              {IC.info}
            </span>
            <p style={{
              fontFamily: font.body, fontSize: 12, color: T.textMuted,
              margin: 0, lineHeight: 1.5,
            }}>
              DA challenges appear as interjections during the simulation.
              You can review results in the DA Arena tab after completion.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
