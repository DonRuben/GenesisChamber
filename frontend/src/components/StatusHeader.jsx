import { IconPlay, IconPause } from './Icons';
import './StatusHeader.css';

const ROUND_MODES = {
  1: 'Diverge', 2: 'Converge', 3: 'Deepen',
  4: 'Gladiator', 5: 'Polish', 6: 'Spec',
};

export default function StatusHeader({ simState }) {
  if (!simState) return null;

  const activeConcepts = simState.concepts?.active?.length || 0;
  const eliminatedConcepts = simState.concepts?.eliminated?.length || 0;
  const totalRounds = simState.config?.rounds || 3;
  const stagesPerRound = simState.config?.stages_per_round || 3;
  const currentRound = simState.current_round || 0;
  const currentStage = simState.current_stage || 0;

  // Calculate overall progress
  const completedStages = Math.max(0, (currentRound - 1) * stagesPerRound + currentStage);
  const totalStages = totalRounds * stagesPerRound;
  const progress = totalStages > 0 ? Math.round((completedStages / totalStages) * 100) : 0;

  const statusClass = simState.status === 'running' ? 'running'
    : simState.status === 'completed' ? 'completed'
    : simState.status === 'paused_at_gate' ? 'paused'
    : 'failed';

  const statusLabel = simState.status === 'paused_at_gate' ? 'Quality Gate'
    : simState.status === 'running' ? 'Running'
    : simState.status === 'completed' ? 'Completed'
    : simState.status;

  const roundMode = ROUND_MODES[currentRound] || '';
  const participantCount = Object.keys(simState.config?.participants || {}).length;

  return (
    <header className="sh-header">
      <div className="sh-row">
        <div className="sh-info">
          <h2 className="sh-title">{simState.config?.name || 'Simulation'}</h2>
          <div className="sh-meta">
            <span className={`gc-status gc-status-${statusClass}`}>
              {statusClass === 'running' && <IconPlay size={10} />}
              {statusClass === 'paused' && <IconPause size={10} />}
              {statusLabel}
            </span>
            {simState.config?.type && (
              <span className="gc-badge gc-badge-flame">{simState.config.type.replace(/_/g, ' ')}</span>
            )}
          </div>
        </div>

        <div className="sh-stats">
          <div className="sh-stat">
            <span className="sh-stat-num">{activeConcepts}</span>
            <span className="sh-stat-label">Active</span>
          </div>
          <div className="sh-stat sh-stat-eliminated">
            <span className="sh-stat-num">{eliminatedConcepts}</span>
            <span className="sh-stat-label">Cut</span>
          </div>
          <div className="sh-stat">
            <span className="sh-stat-num">{participantCount}</span>
            <span className="sh-stat-label">Minds</span>
          </div>
        </div>
      </div>

      <div className="sh-progress-row">
        <div className="sh-progress">
          <div
            className={`sh-progress-fill sh-progress-${statusClass}`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        <span className="sh-progress-label">{progress}%</span>
      </div>

      <div className="sh-breadcrumb">
        Round {currentRound}/{totalRounds}
        {roundMode && <span className="sh-breadcrumb-mode"> — {roundMode}</span>}
        {simState.current_stage_name && (
          <span className="sh-breadcrumb-stage"> › {simState.current_stage_name}</span>
        )}
      </div>
    </header>
  );
}
