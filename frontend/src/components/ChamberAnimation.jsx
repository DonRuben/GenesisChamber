import { useMemo } from 'react';
import LiveFeed from './LiveFeed';
import './ChamberAnimation.css';

const STAGE_COLORS = {
  creation: 'var(--stage-create)',
  critique: 'var(--stage-critique)',
  synthesis: 'var(--stage-synthesize)',
  refinement: 'var(--stage-refine)',
  presentation: 'var(--stage-present)',
};

const STAGE_LABELS = {
  creation: 'Creating',
  critique: 'Critiquing',
  synthesis: 'Synthesizing',
  refinement: 'Refining',
  presentation: 'Presenting',
};

export default function ChamberAnimation({
  participants = {},
  currentStage = 'creation',
  currentRound = 1,
  activeParticipants = [],
  recentEvents = [],
  participantColors = {},
}) {
  const participantList = useMemo(() => {
    return Object.entries(participants).map(([pid, p]) => ({
      id: pid,
      name: p.display_name || pid,
      color: p.color || '#666',
      initial: (p.display_name || pid)[0],
    }));
  }, [participants]);

  const count = participantList.length;
  const radius = Math.max(100, Math.min(140, 60 + count * 12));
  const stageColor = STAGE_COLORS[currentStage] || 'var(--gc-cyan)';
  const stageLabel = STAGE_LABELS[currentStage] || currentStage;
  const activeSet = new Set(activeParticipants);

  return (
    <div className="ca-wrapper">
      <div className="ca-chamber">
        {/* SVG connection lines */}
        <svg className="ca-connections" viewBox="-200 -200 400 400">
          {participantList.map((p, i) => {
            const angle = (2 * Math.PI * i) / count - Math.PI / 2;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            return (
              <line
                key={p.id}
                className={`ca-line ${activeSet.has(p.id) ? 'ca-line-active' : ''}`}
                x1="0" y1="0" x2={x} y2={y}
                stroke={activeSet.has(p.id) ? p.color : 'var(--border-subtle)'}
                strokeWidth={activeSet.has(p.id) ? 2 : 1}
              />
            );
          })}
        </svg>

        {/* Central hub */}
        <div className="ca-hub" style={{ '--stage-color': stageColor }}>
          <div className="ca-hub-round">R{currentRound}</div>
          <div className="ca-hub-stage">{stageLabel}</div>
        </div>

        {/* Participant nodes */}
        {participantList.map((p, i) => {
          const angle = (360 / count) * i - 90;
          const isActive = activeSet.has(p.id);
          return (
            <div
              key={p.id}
              className={`ca-node ${isActive ? 'ca-node-active' : ''}`}
              style={{
                '--angle': `${angle}deg`,
                '--radius': `${radius}px`,
                '--node-color': p.color,
              }}
            >
              <div
                className="ca-node-avatar"
                style={{ borderColor: p.color, background: isActive ? p.color : 'transparent' }}
              >
                <span
                  className="ca-node-initial"
                  style={{ color: isActive ? 'var(--surface-0)' : p.color }}
                >
                  {p.initial}
                </span>
              </div>
              <div className="ca-node-name">{p.name.split(' ').pop()}</div>
            </div>
          );
        })}
      </div>

      {/* Live Feed below */}
      {recentEvents.length > 0 && (
        <div className="ca-feed">
          <LiveFeed events={recentEvents} participantColors={participantColors} />
        </div>
      )}
    </div>
  );
}
