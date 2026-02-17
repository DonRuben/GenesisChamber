const ROUND_MODES = {
  1: 'diverge', 2: 'converge', 3: 'deepen', 4: 'gladiator',
  5: 'polish', 6: 'spec', 7: 'polish', 8: 'spec',
};

const STAGE_NAMES = ['creation', 'critique', 'synthesis', 'refinement', 'presentation'];

export default function RoundProgress({ rounds, currentRound, currentStage, totalRounds, stagesPerRound, onSelectRound }) {
  const roundNums = Array.from({ length: totalRounds }, (_, i) => i + 1);

  return (
    <div className="round-progress">
      {roundNums.map(num => {
        const roundData = rounds?.find(r => r.round_num === num);
        const isActive = num === currentRound;
        const isComplete = roundData?.status === 'complete';

        return (
          <div
            key={num}
            className={`round-step ${isActive ? 'active' : ''}`}
            onClick={() => onSelectRound?.(num)}
          >
            <div className="round-num">R{num}</div>
            <div className="round-mode">{ROUND_MODES[num] || 'round'}</div>
            <div className="stage-dots">
              {Array.from({ length: stagesPerRound }, (_, si) => {
                const stageNum = si + 1;
                const stageData = roundData?.stages?.[stageNum];
                let status = 'pending';
                if (stageData?.status === 'complete') status = 'complete';
                else if (isActive && stageNum === currentStage) status = 'running';
                else if (stageData?.status === 'failed') status = 'failed';
                else if (isComplete) status = 'complete';

                return <div key={si} className={`stage-dot ${status}`} title={STAGE_NAMES[si] || `Stage ${stageNum}`} />;
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
