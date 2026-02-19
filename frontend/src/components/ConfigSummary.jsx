import { getDisplayName } from '../utils/modelDisplayNames';
import './ConfigSummary.css';

export default function ConfigSummary({ preset, participants, souls, brief, modelAssignments, onModelChange, models, devilsAdvocateActive }) {
  const selectedSouls = souls.filter(s => participants.includes(s.id));

  return (
    <div className="config-summary">
      <h3 className="config-summary-heading">Launch Summary</h3>

      {/* Preset info */}
      <div className="config-summary-section">
        <div className="config-summary-label">Simulation Type</div>
        <div className="config-summary-value">{preset?.name || 'None selected'}</div>
        {preset && (
          <div className="config-summary-detail">
            {preset.rounds} rounds &middot; {preset.stages_per_round} stages per round
          </div>
        )}
      </div>

      {/* Participants */}
      <div className="config-summary-section">
        <div className="config-summary-label">
          Participants <span className="config-summary-count">{selectedSouls.length}</span>
        </div>
        {selectedSouls.length === 0 ? (
          <div className="config-summary-empty">Select at least one participant</div>
        ) : (
          <div className="config-summary-participants">
            {selectedSouls.map(soul => (
              <div key={soul.id} className="config-summary-participant">
                <span className="config-summary-avatar" style={{ borderColor: soul.color, color: soul.color }}>
                  {(soul.name || '?')[0]}
                </span>
                <div className="config-summary-participant-info">
                  <span className="config-summary-name">{soul.name}</span>
                  <span className="config-summary-model">
                    {getDisplayName(modelAssignments[soul.id] || 'anthropic/claude-sonnet-4.6')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Moderator */}
      <div className="config-summary-section">
        <div className="config-summary-label">Moderator</div>
        <div className="config-summary-participant">
          <span className="config-summary-avatar" style={{ borderColor: '#6B7280', color: '#6B7280' }}>S</span>
          <div className="config-summary-participant-info">
            <span className="config-summary-name">Steve Jobs</span>
            <span className="config-summary-model">
              {getDisplayName(modelAssignments['moderator'] || 'anthropic/claude-opus-4-6')}
            </span>
          </div>
        </div>
      </div>

      {/* Devil's Advocate */}
      {devilsAdvocateActive && (
        <div className="config-summary-section">
          <div className="config-summary-label">Devil's Advocate</div>
          <div className="config-summary-participant">
            <span className="config-summary-avatar" style={{ borderColor: '#DC2626', color: '#DC2626' }}>{'\u2694'}</span>
            <div className="config-summary-participant-info">
              <span className="config-summary-name">Advocatus Diaboli</span>
              <span className="config-summary-model">
                {getDisplayName(modelAssignments['devils-advocate'] || 'anthropic/claude-sonnet-4.6')}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Brief */}
      <div className="config-summary-section">
        <div className="config-summary-label">Brief</div>
        <div className="config-summary-brief">
          {brief ? (brief.length > 140 ? brief.slice(0, 140) + '...' : brief) : 'Default brief will be used'}
        </div>
      </div>

      {/* Cost estimate */}
      {preset?.cost_estimate && (
        <div className="config-summary-section">
          <div className="config-summary-label">Est. Cost</div>
          <div className="config-summary-cost">{preset.cost_estimate}</div>
        </div>
      )}
    </div>
  );
}
