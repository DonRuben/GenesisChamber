import { useRef, useEffect } from 'react';
import './LiveFeed.css';

const STAGE_VERBS = {
  creation: 'crafting concepts',
  critique: 'reviewing anonymously',
  synthesis: 'synthesizing direction',
  refinement: 'refining concepts',
  presentation: 'presenting work',
};

function formatEvent(event) {
  if (event.type === 'stage_start') {
    const stageName = event.stage_name || 'working';
    return { text: `Stage ${event.stage}: ${stageName.charAt(0).toUpperCase() + stageName.slice(1)} begins`, isStage: true };
  }
  if (event.type === 'participant_thinking') {
    const verb = STAGE_VERBS[event.stage_name] || 'thinking';
    return { text: `${event.persona_name} is ${verb}...`, personaId: event.persona_id };
  }
  if (event.type === 'participant_response') {
    const extra = event.extra;
    if (extra && Array.isArray(extra) && extra.length > 0) {
      return { text: `${event.persona_name} submitted: "${extra[0]}"`, personaId: event.persona_id };
    }
    return { text: `${event.persona_name} completed`, personaId: event.persona_id };
  }
  if (event.type === 'round_complete') {
    return { text: `Round ${event.round} complete — ${event.concepts_surviving} concepts survive`, isRound: true };
  }
  if (event.type?.startsWith('stage_') && event.type.endsWith('_complete')) {
    return { text: `${(event.stage_name || 'Stage').charAt(0).toUpperCase() + (event.stage_name || '').slice(1)} complete`, isStage: true };
  }
  return null;
}

export default function LiveFeed({ events = [], participantColors = {} }) {
  const feedRef = useRef(null);

  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [events.length]);

  const formattedEvents = events.map((e, i) => ({ ...e, _idx: i, _fmt: formatEvent(e) })).filter(e => e._fmt);

  if (formattedEvents.length === 0) {
    return (
      <div className="lf-container">
        <div className="lf-empty">Waiting for activity...</div>
      </div>
    );
  }

  return (
    <div className="lf-container" ref={feedRef}>
      <div className="lf-header">Live Activity</div>
      <div className="lf-events">
        {formattedEvents.map(e => {
          const fmt = e._fmt;
          const dotColor = fmt.personaId ? (participantColors[fmt.personaId] || 'var(--text-muted)') : 'var(--gc-cyan)';
          return (
            <div
              key={e._idx}
              className={`lf-event ${fmt.isStage ? 'lf-event-stage' : ''} ${fmt.isRound ? 'lf-event-round' : ''}`}
            >
              <span className="lf-dot" style={{ background: dotColor }} />
              <span className="lf-text">{fmt.text}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
