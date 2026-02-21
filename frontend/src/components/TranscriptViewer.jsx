import { useState } from 'react';
import './TranscriptViewer.css';

const STAGE_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'creation', label: 'Create', color: 'var(--stage-create)' },
  { key: 'critique', label: 'Critique', color: 'var(--stage-critique)' },
  { key: 'da_defense', label: 'DA Defense', color: 'var(--stage-da-defense)' },
  { key: 'synthesis', label: 'Synthesize', color: 'var(--stage-synthesize)' },
  { key: 'refinement', label: 'Refine', color: 'var(--stage-refine)' },
  { key: 'presentation', label: 'Present', color: 'var(--stage-present)' },
];

const STAGE_COLORS = {
  creation: 'var(--stage-create)',
  critique: 'var(--stage-critique)',
  da_defense: 'var(--stage-da-defense)',
  synthesis: 'var(--stage-synthesize)',
  refinement: 'var(--stage-refine)',
  presentation: 'var(--stage-present)',
};

const STAGE_LABELS = {
  creation: 'Creation',
  critique: 'Critique',
  da_defense: 'DA Defense',
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
    allEntries.flatMap(e => [
      ...(e.concepts || []).map(c => c.persona),
      ...(e.refined_concepts || []).map(c => c.persona),
      ...(e.presentations || []).map(p => p.persona),
      ...(e.critiques || []).map(c => c.critic_name),
    ].filter(Boolean))
  )].sort();

  const filtered = allEntries.filter(e => {
    if (filter !== 'all' && e.stage_name !== filter) return false;
    if (filterRound !== 'all' && e.round !== parseInt(filterRound)) return false;
    if (filterPersona !== 'all') {
      const hasPersona =
        e.concepts?.some(c => c.persona === filterPersona) ||
        e.refined_concepts?.some(c => c.persona === filterPersona) ||
        e.presentations?.some(p => p.persona === filterPersona) ||
        e.critiques?.some(c => c.critic_name === filterPersona);
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

                  {/* Full critiques (V1+) */}
                  {entry.critiques && entry.critiques.length > 0 ? (
                    <div className="tv-critiques">
                      {entry.critiques.map((crit, ci) => (
                        <div key={ci} className={`tv-critique-card ${crit.is_devils_advocate ? 'tv-critique-da' : ''}`}>
                          <div className="tv-critique-header">
                            <span className="tv-critic-name">{crit.critic_name}</span>
                            {crit.is_devils_advocate && <span className="gc-badge gc-badge-da">DA</span>}
                            <span className="tv-critique-concept">{crit.concept_label}</span>
                            {crit.score != null && (
                              <span className={`tv-critique-score ${crit.score >= 8 ? 'high' : crit.score >= 6 ? 'mid' : 'low'}`}>
                                {crit.score}/10
                              </span>
                            )}
                          </div>
                          {crit.strengths && crit.strengths.length > 0 && (
                            <div className="tv-critique-strengths">
                              <span className="tv-section-label tv-label-strengths">Strengths</span>
                              <ul>{crit.strengths.map((s, si) => <li key={si}>{s}</li>)}</ul>
                            </div>
                          )}
                          {crit.weaknesses && crit.weaknesses.length > 0 && (
                            <div className="tv-critique-weaknesses">
                              <span className="tv-section-label tv-label-weaknesses">Weaknesses</span>
                              <ul>{crit.weaknesses.map((w, wi) => <li key={wi}>{w}</li>)}</ul>
                            </div>
                          )}
                          {crit.fatal_flaw && crit.fatal_flaw.toUpperCase() !== 'NONE' && (
                            <div className="tv-critique-fatal">
                              <span className="tv-fatal-label">Fatal Flaw:</span> {crit.fatal_flaw}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : entry.critiques_count != null ? (
                    <div className="tv-entry-meta">{entry.critiques_count} critiques submitted</div>
                  ) : null}

                  {/* DA Defense results */}
                  {entry.da_defenses && entry.da_defenses.length > 0 && (
                    <div className="tv-da-defenses">
                      <div className="tv-section-label tv-label-da">DA Defense Round</div>
                      {entry.da_defenses.map((d, di) => (
                        <div key={di} className="tv-da-defense-card">
                          <div className="tv-da-defense-header">
                            <span className="tv-da-persona">{d.persona_name}</span>
                            <span className="tv-da-defending">defending</span>
                            <span className="tv-da-concept">{d.concept_name}</span>
                          </div>
                          {d.da_challenge?.fatal_flaw && (
                            <div className="tv-da-challenge">
                              <span className="tv-fatal-label">DA's Fatal Flaw:</span> {d.da_challenge.fatal_flaw}
                            </div>
                          )}
                          {d.defense_text && (
                            <div className="tv-da-defense-text">{d.defense_text}</div>
                          )}
                          {d.verdict && (
                            <div className={`tv-da-verdict ${d.verdict.toLowerCase().includes('accepted') ? 'tv-verdict-accepted' : 'tv-verdict-insufficient'}`}>
                              <strong>Verdict:</strong> {d.verdict}
                              {d.verdict_details && <span className="tv-verdict-details"> — {d.verdict_details}</span>}
                              {d.revised_score != null && (
                                <span className="tv-revised-score">Revised: {d.revised_score}/10</span>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Full synthesis (V1+) */}
                  {entry.synthesis ? (
                    <div className="tv-synthesis">
                      {entry.synthesis.direction_notes && (
                        <div className="tv-direction-full">{entry.synthesis.direction_notes}</div>
                      )}
                      {entry.synthesis.surviving_concepts?.length > 0 && (
                        <div className="tv-surviving">
                          <span className="tv-badge-label">Surviving:</span>
                          {entry.synthesis.surviving_concepts.map((s, si) => (
                            <span key={si} className="gc-badge gc-badge-active">
                              {typeof s === 'string' ? s : s.name}{s.reason ? ` — ${s.reason}` : ''}
                            </span>
                          ))}
                        </div>
                      )}
                      {entry.synthesis.eliminated_concepts?.length > 0 && (
                        <div className="tv-eliminated-list">
                          <span className="tv-badge-label">Eliminated:</span>
                          {entry.synthesis.eliminated_concepts.map((el, ei) => (
                            <span key={ei} className="gc-badge gc-badge-eliminated">
                              {typeof el === 'string' ? el : el.name}{el.reason ? ` — ${el.reason}` : ''}
                            </span>
                          ))}
                        </div>
                      )}
                      {entry.synthesis.one_more_thing && entry.synthesis.one_more_thing.toUpperCase() !== 'NONE' && (
                        <div className="tv-one-more">
                          <strong>One more thing:</strong> {entry.synthesis.one_more_thing}
                        </div>
                      )}
                    </div>
                  ) : entry.direction ? (
                    <div className="tv-entry-direction">{entry.direction}</div>
                  ) : null}

                  {/* Refined concepts */}
                  {entry.refined_concepts && (
                    <div className="tv-refined">
                      <div className="tv-section-label tv-label-refine">Refined Concepts</div>
                      {entry.refined_concepts.map((rc, ri) => (
                        <div key={ri} className="tv-refined-item">
                          <strong>{rc.name}</strong> <span className="tv-refined-persona">({rc.persona})</span>
                          {(rc.evolution_notes || rc.evolution) && (
                            <div className="tv-evolution">
                              <span className="tv-evolution-label">Evolution:</span> {rc.evolution_notes || rc.evolution}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Presentations */}
                  {entry.presentations && (
                    <div className="tv-presentations">
                      <div className="tv-section-label tv-label-present">Presentations</div>
                      {entry.presentations.map((p, pi) => (
                        <div key={pi} className="tv-presentation-item">
                          <strong>{p.concept_name}</strong> <span className="tv-presentation-persona">({p.persona})</span>
                          <div className="tv-presentation-content">{p.content}</div>
                        </div>
                      ))}
                    </div>
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
