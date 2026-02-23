// ─────────────────────────────────────────────────────────
// GENESIS CHAMBER V4 — MARKDOWN RENDERER
// Reusable token-styled markdown for council responses
// ─────────────────────────────────────────────────────────

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { font, fontSize, spacing, radius } from './tokens';
import { useTokens } from '../hooks/useTokens';

export default function Markdown({ children }) {
  const t = useTokens();

  if (!children) return null;

  const components = {
    p: ({ children: c }) => (
      <p style={{ margin: `${spacing.sm}px 0`, fontSize: fontSize.base, color: t.textSoft, lineHeight: 1.7 }}>{c}</p>
    ),
    h1: ({ children: c }) => (
      <h1 style={{ fontFamily: font.display, fontSize: fontSize.xl, fontWeight: 700, color: t.text, margin: `${spacing.lg}px 0 ${spacing.sm}px`, letterSpacing: '-0.02em' }}>{c}</h1>
    ),
    h2: ({ children: c }) => (
      <h2 style={{ fontFamily: font.display, fontSize: fontSize.lg, fontWeight: 700, color: t.text, margin: `${spacing.lg}px 0 ${spacing.sm}px`, letterSpacing: '-0.02em' }}>{c}</h2>
    ),
    h3: ({ children: c }) => (
      <h3 style={{ fontFamily: font.display, fontSize: fontSize.md, fontWeight: 600, color: t.text, margin: `${spacing.md}px 0 ${spacing.xs}px` }}>{c}</h3>
    ),
    h4: ({ children: c }) => (
      <h4 style={{ fontFamily: font.display, fontSize: fontSize.base, fontWeight: 600, color: t.text, margin: `${spacing.md}px 0 ${spacing.xs}px` }}>{c}</h4>
    ),
    strong: ({ children: c }) => (
      <strong style={{ fontWeight: 600, color: t.text }}>{c}</strong>
    ),
    em: ({ children: c }) => (
      <em style={{ color: t.textSoft }}>{c}</em>
    ),
    code: ({ children: c, className }) => {
      const isBlock = className?.startsWith('language-');
      if (isBlock) {
        return (
          <code style={{
            fontFamily: font.mono, fontSize: fontSize.sm,
          }}>{c}</code>
        );
      }
      return (
        <code style={{
          fontFamily: font.mono, fontSize: fontSize.sm,
          background: t.surfaceRaised, padding: '2px 5px',
          borderRadius: radius.sm, color: t.cyan,
        }}>{c}</code>
      );
    },
    pre: ({ children: c }) => (
      <pre style={{
        fontFamily: font.mono, fontSize: fontSize.sm, lineHeight: 1.5,
        background: t.surfaceRaised, padding: spacing.md,
        borderRadius: radius.md, overflow: 'auto',
        border: `1px solid ${t.border}`, margin: `${spacing.sm}px 0`,
      }}>{c}</pre>
    ),
    table: ({ children: c }) => (
      <div style={{ overflowX: 'auto', margin: `${spacing.sm}px 0` }}>
        <table style={{
          width: '100%', borderCollapse: 'collapse',
          fontSize: fontSize.sm, fontFamily: font.body,
        }}>{c}</table>
      </div>
    ),
    thead: ({ children: c }) => (
      <thead style={{ borderBottom: `2px solid ${t.border}` }}>{c}</thead>
    ),
    th: ({ children: c }) => (
      <th style={{
        textAlign: 'left', padding: `${spacing.xs}px ${spacing.sm}px`,
        fontFamily: font.mono, fontSize: fontSize.xs, fontWeight: 600,
        color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em',
      }}>{c}</th>
    ),
    td: ({ children: c }) => (
      <td style={{
        padding: `${spacing.xs}px ${spacing.sm}px`,
        borderBottom: `1px solid ${t.border}`, color: t.textSoft,
      }}>{c}</td>
    ),
    ul: ({ children: c }) => (
      <ul style={{ margin: `${spacing.xs}px 0`, paddingLeft: spacing.xl, color: t.textSoft }}>{c}</ul>
    ),
    ol: ({ children: c }) => (
      <ol style={{ margin: `${spacing.xs}px 0`, paddingLeft: spacing.xl, color: t.textSoft }}>{c}</ol>
    ),
    li: ({ children: c }) => (
      <li style={{ marginBottom: 3, lineHeight: 1.6 }}>{c}</li>
    ),
    a: ({ children: c, href }) => (
      <a href={href} target="_blank" rel="noopener noreferrer" style={{
        color: t.cyan, textDecoration: 'none',
        borderBottom: `1px solid ${t.cyan}40`,
      }}>{c}</a>
    ),
    blockquote: ({ children: c }) => (
      <blockquote style={{
        margin: `${spacing.sm}px 0`, padding: `${spacing.xs}px ${spacing.md}px`,
        borderLeft: `3px solid ${t.gold}`, color: t.textSoft,
        background: `${t.gold}08`, borderRadius: `0 ${radius.sm}px ${radius.sm}px 0`,
      }}>{c}</blockquote>
    ),
    hr: () => (
      <hr style={{ border: 'none', borderTop: `1px solid ${t.border}`, margin: `${spacing.md}px 0` }} />
    ),
  };

  return (
    <div style={{ fontSize: fontSize.base, color: t.textSoft, lineHeight: 1.7 }}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  );
}
