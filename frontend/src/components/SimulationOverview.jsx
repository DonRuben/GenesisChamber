import { useState, useEffect } from 'react';
import { api } from '../api';
import CopyButton from './CopyButton';
import './SimulationOverview.css';

const STATUS_COLORS = {
  running: 'var(--gc-cyan)',
  completed: 'var(--status-success)',
  paused_at_gate: 'var(--gc-gold)',
  failed: 'var(--status-error)',
};

const STATUS_LABELS = {
  running: 'Running',
  completed: 'Completed',
  paused_at_gate: 'Paused at Gate',
  failed: 'Failed',
  initialized: 'Initialized',
};

export default function SimulationOverview({ simState, simId }) {
  const [images, setImages] = useState([]);

  useEffect(() => {
    if (simId && simState?.status === 'completed') {
      api.getImages(simId).then(r => setImages(r?.images || [])).catch(() => {});
    }
  }, [simId, simState?.status]);

  if (!simState?.config) return null;

  const config = simState.config;
  const activeConcepts = simState.concepts?.active || [];
  const eliminatedConcepts = simState.concepts?.eliminated || [];
  const winner = activeConcepts.find(c => c.status === 'winner');
  const runnerUp = activeConcepts.find(c => c.status === 'runner_up');
  const roundsCompleted = simState.rounds?.length || 0;

  // Prefer local file (persisted) over fal.ai URL (expires in ~24h)
  const getMediaUrl = (item) => {
    if (item.local_path && item.filename) {
      const type = item.local_path.includes('video') ? 'videos' : 'images';
      return `/api/simulation/${simId}/media/${type}/${item.filename}`;
    }
    return item.url;
  };

  return (
    <div className="so-container dashboard-view-animate">
      {/* Header */}
      <div className="so-header">
        <div className="so-title">{config.name || 'Unnamed Simulation'}</div>
        <div className="so-meta">
          <span
            className="so-status-dot"
            style={{ background: STATUS_COLORS[simState.status] || 'var(--text-muted)' }}
          />
          <span>{STATUS_LABELS[simState.status] || simState.status}</span>
          <span style={{ opacity: 0.4 }}>|</span>
          <span>{config.type || 'genesis_chamber'}</span>
          <span style={{ opacity: 0.4 }}>|</span>
          <span>{roundsCompleted}/{config.rounds || '?'} rounds</span>
          {simState.created_at && (
            <>
              <span style={{ opacity: 0.4 }}>|</span>
              <span>{new Date(simState.created_at).toLocaleDateString()}</span>
            </>
          )}
        </div>
      </div>

      {/* Brief */}
      {config.brief && (
        <div className="so-section">
          <div className="so-section-title">The Brief</div>
          <div className="so-brief-card gc-copyable">
            {config.brief}
            <CopyButton text={config.brief} />
          </div>
        </div>
      )}

      {/* Brand Context */}
      {config.brand_context && (
        <div className="so-section">
          <div className="so-section-title">Brand Context</div>
          <div className="so-brand-context gc-copyable">
            {config.brand_context.length > 500
              ? config.brand_context.substring(0, 500) + '...'
              : config.brand_context}
            <CopyButton text={config.brand_context} />
          </div>
        </div>
      )}

      {/* Participants */}
      <div className="so-section">
        <div className="so-section-title">Participants</div>
        <div className="so-participants">
          {/* Moderator */}
          {config.moderator && (
            <div className="so-participant" style={{ borderLeftColor: 'var(--gc-gold)' }}>
              <div className="so-participant-name" style={{ color: 'var(--gc-gold)' }}>
                {config.moderator.display_name}
              </div>
              <div className="so-participant-role">Moderator</div>
              <div className="so-participant-model">{config.moderator.model}</div>
            </div>
          )}

          {/* Evaluator */}
          {config.evaluator && (
            <div className="so-participant" style={{ borderLeftColor: 'var(--gc-cyan)' }}>
              <div className="so-participant-name" style={{ color: 'var(--gc-cyan)' }}>
                {config.evaluator.display_name}
              </div>
              <div className="so-participant-role">Evaluator</div>
              <div className="so-participant-model">{config.evaluator.model}</div>
            </div>
          )}

          {/* Devil's Advocate */}
          {config.devils_advocate && (
            <div className="so-participant" style={{ borderLeftColor: '#DC2626' }}>
              <div className="so-participant-name" style={{ color: '#DC2626' }}>
                {config.devils_advocate.display_name || 'Advocatus Diaboli'}
              </div>
              <div className="so-participant-role">Devil's Advocate</div>
              <div className="so-participant-model">{config.devils_advocate.model}</div>
            </div>
          )}

          {/* Creative participants */}
          {config.participants && Object.entries(config.participants).map(([pid, p]) => (
            <div
              key={pid}
              className="so-participant"
              style={{ borderLeftColor: p.color || 'var(--text-muted)' }}
            >
              <div className="so-participant-name" style={{ color: p.color || 'var(--text-primary)' }}>
                {p.display_name || pid}
              </div>
              <div className="so-participant-role">{p.role || 'Participant'}</div>
              <div className="so-participant-model">{p.model}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="so-section">
        <div className="so-section-title">Results</div>
        <div className="so-results">
          {winner && (
            <div className="so-winner-card">
              <div className="so-winner-label">Winner</div>
              <div className="so-winner-name">{winner.name}</div>
              <div className="so-winner-by">by {winner.persona_name}</div>
              {winner.tagline && (
                <div style={{ fontStyle: 'italic', fontSize: '0.85em', color: 'var(--text-secondary)', marginTop: 4 }}>
                  {winner.tagline}
                </div>
              )}
              {winner.idea && (
                <div className="so-winner-idea">{winner.idea}</div>
              )}
            </div>
          )}

          {runnerUp && (
            <div className="so-runner-card">
              <div style={{ fontSize: '0.7em', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--gc-cyan)', fontWeight: 600, marginBottom: 4 }}>
                Runner-up
              </div>
              <div style={{ fontWeight: 700 }}>{runnerUp.name}</div>
              <div style={{ fontSize: '0.8em', color: 'var(--text-muted)' }}>by {runnerUp.persona_name}</div>
            </div>
          )}

          <div className="so-stats">
            <div className="so-stat">
              <div className="so-stat-value">{roundsCompleted}</div>
              <div className="so-stat-label">Rounds</div>
            </div>
            <div className="so-stat">
              <div className="so-stat-value">{activeConcepts.length}</div>
              <div className="so-stat-label">Active</div>
            </div>
            <div className="so-stat">
              <div className="so-stat-value">{eliminatedConcepts.length}</div>
              <div className="so-stat-label">Eliminated</div>
            </div>
            <div className="so-stat">
              <div className="so-stat-value">{Object.keys(config.participants || {}).length}</div>
              <div className="so-stat-label">Participants</div>
            </div>
          </div>
        </div>
      </div>

      {/* Media Gallery Preview */}
      {images.length > 0 && (
        <div className="so-section">
          <div className="so-section-title">
            Media Gallery ({images.length} image{images.length !== 1 ? 's' : ''})
          </div>
          <div className="so-media-preview">
            {images.slice(0, 5).map((img, i) => (
              <img
                key={i}
                src={getMediaUrl(img)}
                alt={img.concept_name || `Image ${i + 1}`}
                className="so-media-thumb"
                loading="lazy"
              />
            ))}
            {images.length > 5 && (
              <div className="so-media-more">
                +{images.length - 5} more
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
