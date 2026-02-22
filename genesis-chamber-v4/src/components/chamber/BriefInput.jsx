import { font } from '../../design/tokens';
import { IC } from '../../design/icons';
import { MonoLabel } from '../../design/shared';
import { useTokens } from '../../hooks/useTokens';

export default function BriefInput({ brief, onBriefChange, summary }) {
  const t = useTokens();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <MonoLabel icon={IC.fileText}>Creative Brief</MonoLabel>
      <textarea
        value={brief}
        onChange={(e) => onBriefChange(e.target.value)}
        placeholder="Describe your creative challenge, target audience, brand positioning, key differentiators, and any constraints. Be specific — the quality of outputs depends on the depth of your brief."
        style={{
          width: '100%', minHeight: 170, padding: 16, borderRadius: 8,
          background: t.surfaceRaised, border: `1px solid ${t.border}`,
          color: t.text, fontSize: 13, fontFamily: font.body, lineHeight: 1.6,
          resize: 'vertical', outline: 'none',
        }}
      />
      <div style={{ display: 'flex', gap: 8 }}>
        <button style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '6px 12px', borderRadius: 6, cursor: 'pointer',
          background: t.surface, border: `1px solid ${t.border}`,
          fontSize: 10, fontFamily: font.mono, fontWeight: 600,
          color: t.textSoft, textTransform: 'uppercase', letterSpacing: '0.06em',
        }}>
          <span style={{ fontSize: 14 }}>{IC.upload}</span> Upload
        </button>
        <button style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '6px 12px', borderRadius: 6, cursor: 'pointer',
          background: t.surface, border: `1px solid ${t.border}`,
          fontSize: 10, fontFamily: font.mono, fontWeight: 600,
          color: t.textSoft, textTransform: 'uppercase', letterSpacing: '0.06em',
        }}>
          <span style={{ fontSize: 14 }}>{IC.clipboard}</span> Template
        </button>
      </div>
      {summary && (
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: 8, padding: 12, borderRadius: 8,
          background: t.surface, border: `1px solid ${t.border}`,
        }}>
          {summary.map(({ label, value, color }) => (
            <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span style={{
                fontSize: 9, fontFamily: font.mono, color: t.textMuted,
                textTransform: 'uppercase', letterSpacing: '0.08em',
              }}>{label}</span>
              <span style={{
                fontSize: 13, fontFamily: font.mono, fontWeight: 700,
                color: color || t.text,
              }}>{value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
