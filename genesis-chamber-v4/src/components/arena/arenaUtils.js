// ─────────────────────────────────────────────────────────
// DA ARENA — Shared Utilities
// ─────────────────────────────────────────────────────────

export function verdictKey(status) {
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
