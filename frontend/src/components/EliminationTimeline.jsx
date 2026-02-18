import { IconCheck, IconError } from './Icons';
import './EliminationTimeline.css';

export default function EliminationTimeline({ rounds, concepts }) {
  if (!rounds || rounds.length === 0) return null;

  // Calculate per-round concept counts
  const allConcepts = [
    ...(concepts?.active || []),
    ...(concepts?.eliminated || []),
    ...(concepts?.merged || []),
  ];

  const roundData = rounds.map(r => {
    const created = allConcepts.filter(c => c.round_created === r.round_num).length;
    const eliminatedThisRound = allConcepts.filter(
      c => c.status === 'eliminated' && c.round_eliminated === r.round_num
    ).length;
    const survivingAfter = allConcepts.filter(
      c => c.status !== 'eliminated' || (c.round_eliminated && c.round_eliminated > r.round_num)
    ).length;

    return {
      num: r.round_num,
      mode: r.mode || '',
      created,
      eliminated: eliminatedThisRound,
      survived: Math.max(0, survivingAfter),
      total: created + (r.round_num > 1 ? 0 : 0), // concepts entering this round
    };
  });

  const maxConcepts = Math.max(...roundData.map(r => r.survived + r.eliminated), 1);

  return (
    <div className="et-container">
      <h4 className="et-title">Concept Lifecycle</h4>
      <div className="et-timeline">
        {roundData.map(round => {
          const survivedPct = (round.survived / maxConcepts) * 100;
          const eliminatedPct = (round.eliminated / maxConcepts) * 100;

          return (
            <div key={round.num} className="et-round">
              <div className="et-round-label">R{round.num}</div>
              <div className="et-bar-track">
                <div className="et-bar-survived" style={{ width: `${survivedPct}%` }}>
                  {round.survived > 0 && <span className="et-bar-num">{round.survived}</span>}
                </div>
                {round.eliminated > 0 && (
                  <div className="et-bar-eliminated" style={{ width: `${eliminatedPct}%` }}>
                    <span className="et-bar-num">-{round.eliminated}</span>
                  </div>
                )}
              </div>
              <div className="et-round-mode">{round.mode}</div>
            </div>
          );
        })}
      </div>
      <div className="et-legend">
        <span className="et-legend-item"><span className="et-legend-dot et-legend-survived" /> Surviving</span>
        <span className="et-legend-item"><span className="et-legend-dot et-legend-eliminated" /> Eliminated</span>
      </div>
    </div>
  );
}
