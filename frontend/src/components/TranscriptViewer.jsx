import { useState } from 'react';

const STAGE_COLORS = {
  creation: 'var(--green)',
  critique: 'var(--gold)',
  synthesis: 'var(--teal)',
  refinement: 'var(--blue)',
  presentation: 'var(--purple)',
};

export default function TranscriptViewer({ entries, eventLog }) {
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all'
    ? (entries || [])
    : (entries || []).filter(e => e.stage_name === filter);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <span className="genesis-label" style={{ marginBottom: 0 }}>Filter:</span>
        {['all', 'creation', 'critique', 'synthesis', 'refinement', 'presentation'].map(f => (
          <button
            key={f}
            className={`genesis-btn ${filter === f ? 'genesis-btn-primary' : 'genesis-btn-secondary'}`}
            style={{ padding: '4px 10px', fontSize: 11, textTransform: 'uppercase' }}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{ color: 'var(--text-dim)', textAlign: 'center', padding: 24 }}>
          No transcript entries yet
        </div>
      ) : (
        filtered.map((entry, i) => (
          <div
            key={i}
            className="transcript-entry"
            style={{ borderLeftColor: STAGE_COLORS[entry.stage_name] || 'var(--border)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <div>
                <span className="entry-label" style={{ color: STAGE_COLORS[entry.stage_name] }}>
                  Round {entry.round} — {entry.stage_name}
                </span>
              </div>
              <span className="timestamp">
                {entry.timestamp ? new Date(entry.timestamp).toLocaleTimeString() : ''}
              </span>
            </div>

            {entry.concepts && (
              <div style={{ fontSize: 13 }}>
                {entry.concepts.map((c, j) => (
                  <div key={j} style={{ marginBottom: 4 }}>
                    <strong>{c.persona}:</strong> {c.name} — {c.idea}
                  </div>
                ))}
              </div>
            )}

            {entry.critiques_count != null && (
              <div style={{ fontSize: 13, color: 'var(--text-dim)' }}>
                {entry.critiques_count} critiques submitted
              </div>
            )}

            {entry.direction && (
              <div style={{ fontSize: 13 }}>{entry.direction}</div>
            )}
          </div>
        ))
      )}

      {eventLog?.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <h4 style={{ color: 'var(--text-dim)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>
            Event Log
          </h4>
          {eventLog.map((event, i) => (
            <div key={i} style={{ fontSize: 12, color: 'var(--text-dim)', padding: '4px 0', fontFamily: "'JetBrains Mono', monospace" }}>
              <span style={{ color: 'var(--teal)' }}>{event.type}</span>
              {' '}
              {event.timestamp ? new Date(event.timestamp).toLocaleTimeString() : ''}
              {event.round ? ` R${event.round}` : ''}
              {event.message ? ` — ${event.message}` : ''}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
