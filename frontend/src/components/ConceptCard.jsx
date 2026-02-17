export default function ConceptCard({ concept, showDetails = false }) {
  const latestScore = concept.scores
    ? Object.values(concept.scores).pop()
    : null;

  const statusColors = {
    active: 'var(--green)',
    eliminated: 'var(--red)',
    merged: 'var(--purple)',
    winner: 'var(--gold)',
    runner_up: 'var(--blue)',
  };

  return (
    <div className="concept-card">
      <div className="persona-indicator" style={{ background: concept.color || '#666' }} />

      <div className="concept-header" style={{ paddingLeft: 12 }}>
        <div>
          <div className="concept-name">{concept.name || 'Untitled'}</div>
          <div className="concept-persona">{concept.persona_name}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {latestScore != null && (
            <div className="concept-score">{latestScore.toFixed(1)}</div>
          )}
          <span
            className="genesis-badge"
            style={{ background: `${statusColors[concept.status]}22`, color: statusColors[concept.status] }}
          >
            {concept.status}
          </span>
        </div>
      </div>

      <div style={{ paddingLeft: 12 }}>
        {concept.tagline && <div className="concept-tagline">{concept.tagline}</div>}
        {concept.idea && <div className="concept-idea">{concept.idea}</div>}

        {showDetails && (
          <>
            {concept.headline && (
              <div style={{ marginBottom: 8 }}>
                <strong style={{ color: 'var(--teal)', fontSize: 13 }}>HEADLINE:</strong>{' '}
                {concept.headline}
              </div>
            )}
            {concept.subhead && (
              <div style={{ marginBottom: 8 }}>
                <strong style={{ color: 'var(--teal)', fontSize: 13 }}>SUBHEAD:</strong>{' '}
                {concept.subhead}
              </div>
            )}
            {concept.visual_direction && (
              <div style={{ marginBottom: 8 }}>
                <strong style={{ color: 'var(--teal)', fontSize: 13 }}>VISUAL:</strong>{' '}
                {concept.visual_direction}
              </div>
            )}
            {concept.rationale && (
              <div style={{ marginBottom: 8 }}>
                <strong style={{ color: 'var(--teal)', fontSize: 13 }}>RATIONALE:</strong>{' '}
                {concept.rationale}
              </div>
            )}
            {concept.evolution_notes && (
              <div style={{ fontSize: 13, color: 'var(--text-dim)', marginTop: 8 }}>
                <em>Evolution: {concept.evolution_notes}</em>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
