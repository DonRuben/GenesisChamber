import { useState } from 'react';
import HelpTooltip from './HelpTooltip';
import { IconEye } from './Icons';
import './CritiquePanel.css';

function scoreColor(score) {
  if (score >= 7) return 'var(--status-success)';
  if (score >= 5) return 'var(--gc-gold)';
  return 'var(--status-error)';
}

function isDA(name) {
  if (!name) return false;
  const lower = name.toLowerCase();
  return lower.includes('devil') || lower.includes('advocate') || lower.includes('advocatus');
}

export default function CritiquePanel({ critiques, concepts }) {
  const [showAnonymous, setShowAnonymous] = useState(true);
  const [filterCritic, setFilterCritic] = useState('all');

  // Extract unique critic names for filter chips
  const uniqueCritics = [...new Set((critiques || []).map(c => c.critic_name).filter(Boolean))].sort();

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
        <h3 className="cp-title">
          Critiques
          <HelpTooltip text="All concepts are anonymized as A, B, C during critique. Scores are 1-10. Toggle 'Reveal Names' to see identities." position="right" />
        </h3>
        {hasData && (
          <button className="gc-btn gc-btn-ghost cp-toggle" onClick={() => setShowAnonymous(!showAnonymous)}>
            {showAnonymous ? 'Reveal Names' : 'Re-anonymize'}
          </button>
        )}
      </div>

      {/* Critic filter — only visible when names are revealed */}
      {hasData && !showAnonymous && uniqueCritics.length > 1 && (
        <div className="cp-filters">
          <span className="cp-filter-label">Critic</span>
          <button
            className={`gc-btn gc-btn-ghost cp-filter-btn ${filterCritic === 'all' ? 'cp-filter-active' : ''}`}
            onClick={() => setFilterCritic('all')}
          >
            All
          </button>
          {uniqueCritics.map(name => (
            <button
              key={name}
              className={`gc-btn gc-btn-ghost cp-filter-btn ${filterCritic === name ? 'cp-filter-active' : ''} ${isDA(name) ? 'cp-filter-da' : ''}`}
              onClick={() => setFilterCritic(name)}
            >
              {name}
            </button>
          ))}
        </div>
      )}

      {!hasData ? (
        <div className="cp-empty">
          <IconEye size={28} className="cp-empty-icon" />
          <div>No critiques available for this round yet.</div>
          <div className="cp-empty-hint">Critiques appear after Stage 2 of each round.</div>
        </div>
      ) : (
        Object.entries(conceptCritiques).map(([conceptKey, crits]) => {
          const concept = concepts?.find(c => c.id === conceptKey);

          // Apply critic filter
          const filteredCrits = filterCritic === 'all' || showAnonymous
            ? crits
            : crits.filter(c => c.critic_name === filterCritic);

          if (filteredCrits.length === 0) return null;

          const avgScore = filteredCrits.reduce((sum, c) => sum + (c.score || 0), 0) / filteredCrits.length;
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
                <div className="cp-score-group">
                  <div className="cp-avg-score" style={{ color: scoreColor(avgScore) }}>
                    {avgScore.toFixed(1)}
                  </div>
                  <div className="cp-score-sublabel">avg score</div>
                </div>
              </div>

              <div className="cp-score-bar">
                <div
                  className="cp-score-fill"
                  style={{ width: `${scorePercent}%`, background: scoreColor(avgScore) }}
                />
              </div>

              {filteredCrits.map((crit, i) => (
                <div key={i} className={`cp-critique ${!showAnonymous && isDA(crit.critic_name) ? 'cp-critique-da' : ''}`}>
                  <div className="cp-critique-header">
                    <span className="cp-critic-name">
                      {showAnonymous ? `Critic ${i + 1}` : crit.critic_name}
                      {!showAnonymous && isDA(crit.critic_name) && (
                        <span className="cp-da-badge">DA</span>
                      )}
                    </span>
                    <span className="cp-critic-score" style={{ color: scoreColor(crit.score) }}>
                      {crit.score}/10
                    </span>
                  </div>

                  {crit.strengths?.length > 0 && (
                    <div className="cp-list-section">
                      <div className="cp-list-label cp-label-strengths">Strengths</div>
                      <ul className="cp-list cp-strengths">
                        {crit.strengths.map((s, j) => <li key={j}>{s}</li>)}
                      </ul>
                    </div>
                  )}

                  {crit.weaknesses?.length > 0 && (
                    <div className="cp-list-section">
                      <div className="cp-list-label cp-label-weaknesses">Weaknesses</div>
                      <ul className="cp-list cp-weaknesses">
                        {crit.weaknesses.map((w, j) => <li key={j}>{w}</li>)}
                      </ul>
                    </div>
                  )}

                  {crit.fatal_flaw && crit.fatal_flaw.toUpperCase() !== 'NONE' && (
                    <div className="cp-fatal">
                      <span className="cp-fatal-label">Fatal Flaw:</span> {crit.fatal_flaw}
                    </div>
                  )}

                  {crit.one_change && (
                    <div className="cp-one-change">
                      <span className="cp-one-change-label">One Change:</span> {crit.one_change}
                    </div>
                  )}

                  {crit.would_champion && (
                    <div className={`cp-champion ${crit.would_champion.toLowerCase().startsWith('yes') ? 'cp-champion-yes' : 'cp-champion-no'}`}>
                      <span className="cp-champion-label">Would Champion:</span> {crit.would_champion}
                    </div>
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
