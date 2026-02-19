import { useState } from 'react';
import './TranscriptViewer.css';

const STAGE_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'creation', label: 'Create', color: 'var(--stage-create)' },
  { key: 'critique', label: 'Critique', color: 'var(--stage-critique)' },
  { key: 'synthesis', label: 'Synthesize', color: 'var(--stage-synthesize)' },
  { key: 'refinement', label: 'Refine', color: 'var(--stage-refine)' },
  { key: 'presentation', label: 'Present', color: 'var(--stage-present)' },
];

const STAGE_COLORS = {
  creation: 'var(--stage-create)',
  critique: 'var(--stage-critique)',
  synthesis: 'var(--stage-synthesize)',
  refinement: 'var(--stage-refine)',
  presentation: 'var(--stage-present)',
};

const STAGE_LABELS = {
  creation: 'Creation',
  critique: 'Critique',
  synthesis: 'Synthesis',
  refinement: 'Refinement',
  presentation: 'Presentation',
};

export default function TranscriptViewer({ entries, eventLog }) {
  const [filter, setFilter] = useState('all');
  const [filterRound, setFilterRound] = useState('all');
  const [filterPersona, setFilterPersona] = useState('all');
  const [search, setSearch] = useState('');
  const [showLog, setShowLog] = useState(false);

  const allEntries = entries || [];

  // Extract unique rounds and personas for filter chips
  const uniqueRounds = [...new Set(allEntries.map(e => e.round).filter(Boolean))].sort((a, b) => a - b);
  const uniquePersonas = [...new Set(
    allEntries.flatMap(e => (e.concepts || []).map(c => c.persona).filter(Boolean))
  )].sort();

  const filtered = allEntries.filter(e => {
    if (filter !== 'all' && e.stage_name !== filter) return false;
    if (filterRound !== 'all' && e.round !== parseInt(filterRound)) return false;
    if (filterPersona !== 'all') {
      const hasPersona = e.concepts?.some(c => c.persona === filterPersona);
      if (!hasPersona) return false;
    }
    if (search) {
      const q = search.toLowerCase();
      const text = JSON.stringify(e).toLowerCase();
      if (!text.includes(q)) return false;
    }
    return true;
  });

  return (
    <div className="tv-container">
      {/* Filter bar */}
      <div className="tv-controls">
        <div className="tv-filter-rows">
          {uniqueRounds.length > 1 && (
            <div className="tv-filter-row">
              <span className="tv-filter-label">Round</span>
              {['all', ...uniqueRounds].map(r => (
                <button
                  key={r}
                  className={`gc-btn gc-btn-ghost tv-filter-btn ${filterRound === String(r) ? 'tv-filter-active' : ''}`}
                  onClick={() => setFilterRound(String(r))}
                >
                  {r === 'all' ? 'All' : `R${r}`}
                </button>
              ))}
            </div>
          )}

          <div className="tv-filter-row">
            <span className="tv-filter-label">Stage</span>
            {STAGE_FILTERS.map(f => (
              <button
                key={f.key}
                className={`gc-btn gc-btn-ghost tv-filter-btn ${filter === f.key ? 'tv-filter-active' : ''}`}
                style={filter === f.key && f.color ? { borderColor: f.color, color: f.color } : undefined}
                onClick={() => setFilter(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>

          {uniquePersonas.length > 1 && (
            <div className="tv-filter-row">
              <span className="tv-filter-label">Persona</span>
              <button
                className={`gc-btn gc-btn-ghost tv-filter-btn ${filterPersona === 'all' ? 'tv-filter-active' : ''}`}
                onClick={() => setFilterPersona('all')}
              >
                All
              </button>
              {uniquePersonas.map(p => (
                <button
                  key={p}
                  className={`gc-btn gc-btn-ghost tv-filter-btn ${filterPersona === p ? 'tv-filter-active' : ''}`}
                  onClick={() => setFilterPersona(p)}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>

        <input
          type="text"
          className="gc-input tv-search"
          placeholder="Search transcript..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Timeline */}
      {filtered.length === 0 ? (
        <div className="tv-empty">No transcript entries yet</div>
      ) : (
        <div className="tv-timeline">
          {filtered.map((entry, i) => {
            const stageColor = STAGE_COLORS[entry.stage_name] || 'var(--border-default)';
            const stageLabel = STAGE_LABELS[entry.stage_name] || entry.stage_name;
            return (
              <div key={i} className="tv-entry" style={{ '--entry-color': stageColor }}>
                <div className="tv-entry-dot" />
                <div className="tv-entry-content">
                  <div className="tv-entry-header">
                    <span className="tv-entry-label">
                      Round {entry.round} — {stageLabel}
                    </span>
                    <span className="tv-entry-time">
                      {entry.timestamp ? new Date(entry.timestamp).toLocaleTimeString() : ''}
                    </span>
                  </div>

                  {entry.concepts && (
                    <div className="tv-entry-concepts">
                      {entry.concepts.map((c, j) => (
                        <div key={j} className="tv-concept-card">
                          <span className="tv-concept-persona">{c.persona}</span>
                          <span className="tv-concept-name">{c.name}</span>
                          {c.idea && <span className="tv-concept-idea">{c.idea}</span>}
                        </div>
                      ))}
                    </div>
                  )}

                  {entry.critiques_count != null && (
                    <div className="tv-entry-meta">
                      {entry.critiques_count} critiques submitted
                    </div>
                  )}

                  {entry.direction && (
                    <div className="tv-entry-direction">{entry.direction}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Event Log */}
      {eventLog?.length > 0 && (
        <div className="tv-event-log">
          <button
            className="gc-btn gc-btn-ghost tv-log-toggle"
            onClick={() => setShowLog(!showLog)}
          >
            {showLog ? 'Hide' : 'Show'} Event Log ({eventLog.length})
          </button>
          {showLog && (
            <div className="tv-log-entries">
              {eventLog.map((event, i) => (
                <div key={i} className="tv-log-entry">
                  <span className="tv-log-type">{event.type}</span>
                  <span className="tv-log-time">
                    {event.timestamp ? new Date(event.timestamp).toLocaleTimeString() : ''}
                  </span>
                  {event.round && <span className="tv-log-round">R{event.round}</span>}
                  {event.message && <span className="tv-log-msg"> — {event.message}</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
