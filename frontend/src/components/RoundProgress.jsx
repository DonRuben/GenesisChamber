import './RoundProgress.css';

const ROUND_MODES = {
  1: 'Diverge', 2: 'Converge', 3: 'Deepen',
  4: 'Gladiator', 5: 'Polish', 6: 'Spec',
  7: 'Polish', 8: 'Spec',
};

const STAGE_COLORS = [
  'var(--stage-create)',
  'var(--stage-critique)',
  'var(--stage-synthesize)',
  'var(--stage-refine)',
  'var(--stage-present)',
];

export default function RoundProgress({
  rounds, currentRound, currentStage, totalRounds, stagesPerRound,
  selectedRound, onSelectRound,
}) {
  const roundNumbers = Array.from({ length: totalRounds }, (_, i) => i + 1);

  return (
    <div className="round-timeline">
      <div className="round-timeline-track">
        {roundNumbers.map((num, idx) => {
          const roundData = rounds?.find(r => r.round_num === num);
          const isComplete = roundData?.stages && Object.keys(roundData.stages).length >= stagesPerRound;
          const isCurrent = num === currentRound;
          const isSelected = num === selectedRound;
          const isPast = num < currentRound;

          return (
            <div key={num} className="round-timeline-item">
              {idx > 0 && (
                <div className={`round-connector ${isPast || isCurrent ? 'filled' : ''}`} />
              )}

              <button
                className={`round-node ${isComplete ? 'complete' : ''} ${isCurrent ? 'current' : ''} ${isSelected ? 'selected' : ''}`}
                onClick={() => onSelectRound(num)}
              >
                <span className="round-node-num">R{num}</span>
              </button>

              <span className="round-node-mode">
                {roundData?.mode || ROUND_MODES[num] || ''}
              </span>

              <div className="round-stages">
                {Array.from({ length: stagesPerRound }, (_, s) => {
                  const stageNum = s + 1;
                  const stageData = roundData?.stages?.[stageNum];
                  const isStageComplete = stageData?.status === 'complete';
                  const isStageRunning = isCurrent && stageNum === currentStage;
                  const isStageFailed = stageData?.status === 'failed';

                  return (
                    <div
                      key={s}
                      className={`round-stage-bar ${isStageComplete ? 'complete' : ''} ${isStageRunning ? 'running' : ''} ${isStageFailed ? 'failed' : ''}`}
                      style={{ '--stage-color': STAGE_COLORS[s] || 'var(--text-muted)' }}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
