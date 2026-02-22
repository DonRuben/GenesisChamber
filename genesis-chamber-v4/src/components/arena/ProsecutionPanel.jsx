// ─────────────────────────────────────────────────────────
// DA ARENA — Prosecution Panel (Left Side)
// DA's attack: score, fatal flaw, weaknesses, one-change fix
// ─────────────────────────────────────────────────────────

import { T, font } from '../../design/tokens';
import { IC } from '../../design/icons';
import { MonoLabel, Dots } from '../../design/shared';
import { DA_PERSONAS } from '../../data/mock';

export default function ProsecutionPanel({ attack }) {
  const persona = DA_PERSONAS[attack.persona] || DA_PERSONAS.skeptic;

  return (
    <div style={{
      flex: 1, background: T.surface,
      border: `1px solid ${T.border}`, borderRadius: 8,
      borderLeft: `2px solid ${T.da.prosecution}`,
      padding: 24, display: 'flex', flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 16, color: T.da.prosecution }}>{IC.skull}</span>
          <MonoLabel color={T.da.prosecution} style={{ marginBottom: 0 }}>PROSECUTION</MonoLabel>
        </div>
        <span style={{
          fontSize: 22, fontFamily: font.mono, fontWeight: 700,
          color: attack.da_score >= 7 ? T.magenta : attack.da_score >= 4 ? T.gold : T.green,
        }}>
          {attack.da_score}<span style={{ fontSize: 11, color: T.textMuted }}>/10</span>
        </span>
      </div>

      {/* Fatal Flaw */}
      <MonoLabel color={T.da.prosecution} style={{ marginBottom: 6 }}>FATAL FLAW</MonoLabel>
      <p style={{
        fontSize: 14, color: T.text, lineHeight: 1.7,
        margin: '0 0 20px', fontWeight: 500,
      }}>
        {attack.fatal_flaw}
      </p>

      {/* Weaknesses */}
      <MonoLabel style={{ marginBottom: 8 }}>IDENTIFIED WEAKNESSES</MonoLabel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20 }}>
        {attack.weaknesses.map((w, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'flex-start', gap: 8,
            fontSize: 13, color: T.textSoft, lineHeight: 1.5,
          }}>
            <span style={{ color: T.da.prosecution, flexShrink: 0, marginTop: 4, fontSize: 6 }}>●</span>
            {w}
          </div>
        ))}
      </div>

      {/* One Change */}
      <MonoLabel color={T.gold} style={{ marginBottom: 6 }}>ONE CHANGE TO FIX IT</MonoLabel>
      <p style={{
        fontSize: 13, color: T.gold, lineHeight: 1.6,
        margin: '0 0 20px', fontStyle: 'italic',
      }}>
        "{attack.one_change}"
      </p>

      {/* Footer */}
      <div style={{
        marginTop: 'auto', paddingTop: 16,
        borderTop: `1px solid ${T.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 6, height: 6, borderRadius: 3, background: persona.color }} />
          <span style={{ fontSize: 11, fontFamily: font.mono, color: T.textMuted }}>
            {persona.name}
          </span>
        </div>
        <Dots count={5} active={attack.severity} color={attack.severity >= 4 ? T.magenta : attack.severity >= 3 ? T.gold : T.textMuted} />
      </div>
    </div>
  );
}
