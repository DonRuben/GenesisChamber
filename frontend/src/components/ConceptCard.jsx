import { useState } from 'react';
import './ConceptCard.css';

const STATUS_MAP = {
  active: { label: 'Active', cls: 'gc-badge-green' },
  eliminated: { label: 'Eliminated', cls: 'gc-badge-red' },
  merged: { label: 'Merged', cls: 'gc-badge-purple' },
  winner: { label: 'Winner', cls: 'gc-badge-gold' },
  runner_up: { label: 'Runner-up', cls: 'gc-badge-blue' },
};

function scoreColor(score) {
  if (score >= 7) return 'var(--status-success)';
  if (score >= 5) return 'var(--gc-gold)';
  return 'var(--status-error)';
}

export default function ConceptCard({ concept, showDetails = false }) {
  const [expanded, setExpanded] = useState(showDetails);
  const latestScore = concept.scores ? Object.values(concept.scores).pop() : null;
  const status = STATUS_MAP[concept.status] || STATUS_MAP.active;

  return (
    <div className="cc-card" onClick={() => setExpanded(!expanded)}>
      <div className="cc-indicator" style={{ background: concept.color || 'var(--text-muted)' }} />

      <div className="cc-body">
        <div className="cc-header">
          <div className="cc-header-left">
            <div
              className="cc-avatar"
              style={{ borderColor: concept.color || 'var(--text-muted)', color: concept.color || 'var(--text-muted)' }}
            >
              {(concept.persona_name || '?')[0]}
            </div>
            <div>
              <div className="cc-name">{concept.name || 'Untitled'}</div>
              <div className="cc-persona">{concept.persona_name}</div>
            </div>
          </div>
          <div className="cc-header-right">
            {latestScore != null && (
              <div className="cc-score" style={{ color: scoreColor(latestScore) }}>
                {latestScore.toFixed(1)}
              </div>
            )}
            <span className={`gc-badge ${status.cls}`}>{status.label}</span>
          </div>
        </div>

        {concept.tagline && <div className="cc-tagline">{concept.tagline}</div>}
        {concept.idea && <div className="cc-idea">{concept.idea}</div>}

        {expanded && (
          <div className="cc-details">
            {concept.headline && (
              <div className="cc-detail-row">
                <span className="cc-detail-label">Headline</span>
                <span className="cc-detail-text">{concept.headline}</span>
              </div>
            )}
            {concept.subhead && (
              <div className="cc-detail-row">
                <span className="cc-detail-label">Subhead</span>
                <span className="cc-detail-text">{concept.subhead}</span>
              </div>
            )}
            {concept.visual_direction && (
              <div className="cc-detail-row">
                <span className="cc-detail-label">Visual</span>
                <span className="cc-detail-text">{concept.visual_direction}</span>
              </div>
            )}
            {concept.rationale && (
              <div className="cc-detail-row">
                <span className="cc-detail-label">Rationale</span>
                <span className="cc-detail-text">{concept.rationale}</span>
              </div>
            )}
            {concept.evolution_notes && (
              <div className="cc-evolution">
                <em>Evolution: {concept.evolution_notes}</em>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
