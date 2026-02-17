import { useState } from 'react';

export default function CritiquePanel({ critiques, concepts }) {
  const [showAnonymous, setShowAnonymous] = useState(true);

  // Group critiques by concept
  const conceptCritiques = {};
  for (const critique of (critiques || [])) {
    const key = critique.concept_id || critique.concept_label;
    if (!conceptCritiques[key]) conceptCritiques[key] = [];
    conceptCritiques[key].push(critique);
  }

  return (
    <div>
      <div className="critique-header">
        <h3 style={{ color: 'var(--gold)', fontSize: 17, fontWeight: 600 }}>Critiques</h3>
        <button
          className="genesis-btn genesis-btn-secondary"
          style={{ fontSize: 12, padding: '4px 12px' }}
          onClick={() => setShowAnonymous(!showAnonymous)}
        >
          {showAnonymous ? 'De-anonymize' : 'Re-anonymize'}
        </button>
      </div>

      {Object.entries(conceptCritiques).map(([conceptKey, crits]) => {
        const concept = concepts?.find(c => c.id === conceptKey);
        const avgScore = crits.reduce((sum, c) => sum + c.score, 0) / crits.length;
        const scorePercent = (avgScore / 10) * 100;
        const scoreColor = avgScore >= 7 ? 'var(--green)' : avgScore >= 5 ? 'var(--gold)' : 'var(--red)';

        return (
          <div key={conceptKey} className="critique-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div>
                <div style={{ fontWeight: 700 }}>
                  {showAnonymous ? `Concept ${conceptKey}` : (concept?.name || conceptKey)}
                </div>
                {!showAnonymous && concept && (
                  <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>by {concept.persona_name}</div>
                )}
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, color: scoreColor }}>{avgScore.toFixed(1)}</div>
            </div>

            <div className="critique-score-bar">
              <div className="critique-score-fill" style={{ width: `${scorePercent}%`, background: scoreColor }} />
            </div>

            {crits.map((crit, i) => (
              <div key={i} style={{ borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-dim)' }}>
                    {showAnonymous ? `Critic ${i + 1}` : crit.critic_name}
                  </span>
                  <span style={{ fontWeight: 700, color: crit.score >= 7 ? 'var(--green)' : crit.score >= 5 ? 'var(--gold)' : 'var(--red)' }}>
                    {crit.score}/10
                  </span>
                </div>

                {crit.strengths?.length > 0 && (
                  <ul style={{ paddingLeft: 16, marginBottom: 6 }}>
                    {crit.strengths.map((s, j) => <li key={j} className="critique-strengths" style={{ fontSize: 13, color: 'var(--green)' }}>{s}</li>)}
                  </ul>
                )}

                {crit.weaknesses?.length > 0 && (
                  <ul style={{ paddingLeft: 16, marginBottom: 6 }}>
                    {crit.weaknesses.map((w, j) => <li key={j} className="critique-weaknesses" style={{ fontSize: 13, color: 'var(--red)' }}>{w}</li>)}
                  </ul>
                )}

                {crit.fatal_flaw && crit.fatal_flaw.toUpperCase() !== 'NONE' && (
                  <div style={{ fontSize: 13, color: 'var(--red)', marginTop: 4 }}>
                    Fatal flaw: {crit.fatal_flaw}
                  </div>
                )}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
