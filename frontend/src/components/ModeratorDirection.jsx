export default function ModeratorDirection({ direction }) {
  if (!direction) return null;

  return (
    <div className="direction-panel">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <span className="genesis-badge gold">Moderator Direction</span>
        <span style={{ fontSize: 13, color: 'var(--text-dim)' }}>by {direction.moderator_name}</span>
      </div>

      {direction.surviving_concepts?.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--green)', marginBottom: 8 }}>
            Surviving
          </div>
          {direction.surviving_concepts.map((c, i) => (
            <div key={i} style={{ padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
              <span className="direction-surviving" style={{ fontWeight: 600 }}>{c.name || c.id}</span>
              {c.reason && <span style={{ color: 'var(--text-dim)', fontSize: 13 }}> — {c.reason}</span>}
            </div>
          ))}
        </div>
      )}

      {direction.eliminated_concepts?.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--red)', marginBottom: 8 }}>
            Eliminated
          </div>
          {direction.eliminated_concepts.map((c, i) => (
            <div key={i} style={{ padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
              <span className="direction-eliminated">{c.name || c.id}</span>
              {c.reason && <span style={{ color: 'var(--text-dim)', fontSize: 13 }}> — {c.reason}</span>}
            </div>
          ))}
        </div>
      )}

      {direction.new_constraints?.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--teal)', marginBottom: 8 }}>
            New Constraints
          </div>
          <ul style={{ paddingLeft: 16 }}>
            {direction.new_constraints.map((c, i) => (
              <li key={i} style={{ fontSize: 14, marginBottom: 4 }}>{c}</li>
            ))}
          </ul>
        </div>
      )}

      {direction.direction_notes && (
        <div style={{ marginTop: 16, padding: 16, background: 'var(--surface-2)', borderRadius: 8 }}>
          <div style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--gold)', marginBottom: 8 }}>
            Direction
          </div>
          <p style={{ fontSize: 14, lineHeight: 1.7 }}>{direction.direction_notes}</p>
        </div>
      )}

      {direction.one_more_thing && direction.one_more_thing.toUpperCase() !== 'NONE' && (
        <div style={{ marginTop: 12, padding: 12, background: 'var(--teal-dim)', borderRadius: 8, border: '1px solid rgba(0,217,196,0.3)' }}>
          <strong style={{ color: 'var(--teal)' }}>One more thing:</strong> {direction.one_more_thing}
        </div>
      )}
    </div>
  );
}
