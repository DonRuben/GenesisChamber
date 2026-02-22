// ─────────────────────────────────────────────────────────
// DA ARENA — Training Report
// Aggregated stats, concept resilience, all interactions
// ─────────────────────────────────────────────────────────

import { T, font } from '../../design/tokens';
import { IC } from '../../design/icons';
import { Tag, MonoLabel, ScoreRing, VerdictBadge, Dots, ScoreBar } from '../../design/shared';
import { DA_RATINGS } from '../../data/mock';

function verdictKey(status) {
  if (status === 'accepted_strong') return 'strong';
  if (status === 'accepted_partial') return 'partial';
  if (status === 'insufficient') return 'insufficient';
  return 'no-defense';
}

export function computeStats(interactions, ratings) {
  const total = interactions.length;
  const defended = interactions.filter(i => i.defense.submitted).length;
  const avgSev = total > 0 ? interactions.reduce((s, i) => s + i.attack.severity, 0) / total : 0;
  const strong = interactions.filter(i => i.verdict.status === 'accepted_strong').length;
  const partial = interactions.filter(i => i.verdict.status === 'accepted_partial').length;
  const insuf = interactions.filter(i => i.verdict.status === 'insufficient' || i.verdict.status === 'no_defense').length;

  const concepts = [...new Set(interactions.map(i => i.concept.name))];
  const conceptScores = concepts.map(name => {
    const ci = interactions.filter(i => i.concept.name === name);
    const avg = ci.reduce((s, i) => s + i.verdict.revised_score, 0) / ci.length;
    return {
      name, avg: Math.round(avg * 10) / 10, count: ci.length,
      model: ci[0].concept.model, modelColor: ci[0].concept.modelColor,
    };
  }).sort((a, b) => b.avg - a.avg);

  const rounds = [...new Set(interactions.map(i => i.round))].sort();
  const threat = total > 0
    ? Math.round(100 - (interactions.reduce((s, i) => s + i.verdict.revised_score, 0) / total) * 10)
    : 0;
  const rated = Object.keys(ratings).length + interactions.filter(i => i.rating && !ratings[i.id]).length;

  return { total, defended, avgSev, strong, partial, insuf, conceptScores, rounds, threat, rated, unrated: total - rated };
}

export default function TrainingReport({ stats, interactions, ratings }) {
  return (
    <div style={{ padding: '36px 28px', maxWidth: 900, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 28, marginBottom: 36 }}>
        <ScoreRing score={stats.threat} color={T.magenta} size={88} strokeWidth={5} />
        <div style={{ flex: 1 }}>
          <h2 style={{
            fontSize: 24, fontFamily: font.display, fontWeight: 700,
            color: T.text, margin: '0 0 6px', letterSpacing: '-0.03em',
          }}>
            Training Report
          </h2>
          <p style={{ fontSize: 13, color: T.textMuted, margin: '0 0 14px', lineHeight: 1.6 }}>
            {stats.total} challenges across {stats.rounds.length} round{stats.rounds.length !== 1 ? 's' : ''}.
            {' '}{stats.defended} of {stats.total} defended.
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Tag color={T.green}>{stats.strong} STRONG</Tag>
            <Tag color={T.gold}>{stats.partial} PARTIAL</Tag>
            <Tag color={T.magenta}>{stats.insuf} INSUFFICIENT</Tag>
            <Tag color={T.textMuted}>{stats.unrated} UNRATED</Tag>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <MonoLabel style={{ marginBottom: 12 }}>KEY METRICS</MonoLabel>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 32 }}>
        {[
          { l: 'Avg Severity', v: stats.avgSev.toFixed(1), sub: '/5', c: T.magenta },
          { l: 'Threat Score', v: stats.threat, sub: '%', c: T.magenta },
          { l: 'Defense Rate', v: stats.total > 0 ? Math.round(stats.defended / stats.total * 100) : 0, sub: '%', c: T.green },
          { l: 'Review Rate', v: stats.total > 0 ? Math.round(stats.rated / stats.total * 100) : 0, sub: '%', c: T.cyan },
        ].map(m => (
          <div key={m.l} style={{
            background: T.surface, border: `1px solid ${T.border}`,
            borderRadius: 8, borderLeft: `2px solid ${m.c}`, padding: '18px 16px',
          }}>
            <MonoLabel style={{ marginBottom: 8 }}>{m.l}</MonoLabel>
            <div style={{ fontSize: 24, fontFamily: font.mono, fontWeight: 700, color: m.c }}>
              {m.v}<span style={{ fontSize: 12, color: T.textMuted }}>{m.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Concept Resilience */}
      <MonoLabel style={{ marginBottom: 12 }}>CONCEPT RESILIENCE</MonoLabel>
      <div style={{ display: 'flex', gap: 10, marginBottom: 32, flexWrap: 'wrap' }}>
        {stats.conceptScores.map((c, i) => (
          <div key={c.name} style={{
            flex: '1 1 200px', background: T.surface,
            border: `1px solid ${T.border}`, borderRadius: 8,
            borderLeft: `2px solid ${c.modelColor}`, padding: '18px 16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              {i === 0 && <span style={{ fontSize: 12, color: T.gold }}>{IC.award}</span>}
              <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{c.name}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
              <div style={{ width: 6, height: 6, borderRadius: 3, background: c.modelColor }} />
              <span style={{ fontSize: 10, fontFamily: font.mono, color: T.textMuted }}>{c.model}</span>
            </div>
            <div style={{ marginBottom: 6 }}>
              <ScoreBar score={c.avg * 10} color={c.modelColor} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 20, fontFamily: font.mono, fontWeight: 700, color: c.modelColor }}>
                {c.avg}
              </span>
              <span style={{ fontSize: 10, fontFamily: font.mono, color: T.textMuted, alignSelf: 'flex-end' }}>
                {c.count} challenge{c.count !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* All Interactions */}
      <MonoLabel style={{ marginBottom: 12 }}>ALL INTERACTIONS</MonoLabel>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {interactions.map(inter => {
          const r = ratings[inter.id] ?? inter.rating;
          const rC = DA_RATINGS.find(rt => rt.key === r);
          return (
            <div key={inter.id} style={{
              background: T.surface, border: `1px solid ${T.border}`,
              borderRadius: 8,
              borderLeft: `2px solid ${inter.attack.severity >= 4 ? T.magenta : T.textMuted}`,
              padding: '18px 20px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Tag color={T.magenta}>R{inter.round}</Tag>
                  <span style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{inter.concept.name}</span>
                </div>
                <Dots count={5} active={inter.attack.severity} color={inter.attack.severity >= 4 ? T.magenta : T.textMuted} />
              </div>
              <div style={{
                fontSize: 12, color: T.textSoft, lineHeight: 1.5, marginBottom: 10,
                overflow: 'hidden', textOverflow: 'ellipsis',
                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
              }}>
                {inter.attack.fatal_flaw}
              </div>
              <div style={{ height: 1, background: T.border, margin: '10px 0' }} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 6, height: 6, borderRadius: 3, background: inter.concept.modelColor }} />
                  <span style={{ fontSize: 11, fontFamily: font.mono, color: T.textMuted }}>{inter.concept.model}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <VerdictBadge verdict={verdictKey(inter.verdict.status)} />
                  <span style={{
                    fontSize: 14, fontFamily: font.mono, fontWeight: 700,
                    color: inter.verdict.revised_score >= 7 ? T.green : inter.verdict.revised_score >= 4 ? T.gold : T.magenta,
                  }}>
                    {inter.verdict.revised_score}
                  </span>
                  {rC && (
                    <span style={{ fontSize: 10, color: rC.color }}>● {rC.label}</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
