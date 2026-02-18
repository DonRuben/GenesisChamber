import { useState } from 'react';
import './CritiquePanel.css';

function scoreColor(score) {
  if (score >= 7) return 'var(--status-success)';
  if (score >= 5) return 'var(--gc-gold)';
  return 'var(--status-error)';
}

export default function CritiquePanel({ critiques, concepts }) {
  const [showAnonymous, setShowAnonymous] = useState(true);

  const conceptCritiques = {};
  for (const critique of (critiques || [])) {
    const key = critique.concept_id || critique.concept_label;
    if (!conceptCritiques[key]) conceptCritiques[key] = [];
    conceptCritiques[key].push(critique);
  }

  const hasData = Object.keys(conceptCritiques).length > 0;

  return (
    <div className="cp-container">
      <div className="cp-header">
        <h3 className="cp-title">Critiques</h3>
        {hasData && (
          <button className="gc-btn gc-btn-ghost cp-toggle" onClick={() => setShowAnonymous(!showAnonymous)}>
            {showAnonymous ? 'Reveal Names' : 'Re-anonymize'}
          </button>
        )}
      </div>

      {!hasData ? (
        <div className="cp-empty">
          No critiques available for this round yet.
        </div>
      ) : (
        Object.entries(conceptCritiques).map(([conceptKey, crits]) => {
          const concept = concepts?.find(c => c.id === conceptKey);
          const avgScore = crits.reduce((sum, c) => sum + (c.score || 0), 0) / crits.length;
          const scorePercent = (avgScore / 10) * 100;

          return (
            <div key={conceptKey} className="cp-panel">
              <div className="cp-panel-header">
                <div>
                  <div className="cp-concept-name">
                    {showAnonymous ? `Concept ${conceptKey}` : (concept?.name || conceptKey)}
                  </div>
                  {!showAnonymous && concept && (
                    <div className="cp-concept-creator">by {concept.persona_name}</div>
                  )}
                </div>
                <div className="cp-avg-score" style={{ color: scoreColor(avgScore) }}>
                  {avgScore.toFixed(1)}
                </div>
              </div>

              <div className="cp-score-bar">
                <div
                  className="cp-score-fill"
                  style={{ width: `${scorePercent}%`, background: scoreColor(avgScore) }}
                />
              </div>

              {crits.map((crit, i) => (
                <div key={i} className="cp-critique">
                  <div className="cp-critique-header">
                    <span className="cp-critic-name">
                      {showAnonymous ? `Critic ${i + 1}` : crit.critic_name}
                    </span>
                    <span className="cp-critic-score" style={{ color: scoreColor(crit.score) }}>
                      {crit.score}/10
                    </span>
                  </div>

                  {crit.strengths?.length > 0 && (
                    <ul className="cp-list cp-strengths">
                      {crit.strengths.map((s, j) => <li key={j}>{s}</li>)}
                    </ul>
                  )}

                  {crit.weaknesses?.length > 0 && (
                    <ul className="cp-list cp-weaknesses">
                      {crit.weaknesses.map((w, j) => <li key={j}>{w}</li>)}
                    </ul>
                  )}

                  {crit.fatal_flaw && crit.fatal_flaw.toUpperCase() !== 'NONE' && (
                    <div className="cp-fatal">Fatal flaw: {crit.fatal_flaw}</div>
                  )}
                </div>
              ))}
            </div>
          );
        })
      )}
    </div>
  );
}
