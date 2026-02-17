import { useState } from 'react';

export default function QualityGate({ gate, onApprove, onRedirect }) {
  const [notes, setNotes] = useState('');

  if (!gate || gate.status !== 'pending') return null;

  return (
    <div className="quality-gate-overlay">
      <div className="quality-gate-modal">
        <h3>Quality Gate — Round {gate.after_round}</h3>
        <p style={{ color: 'var(--text-dim)', marginBottom: 16 }}>
          The simulation has paused for your review. Review the concepts above, then approve to continue
          or redirect with notes.
        </p>

        <div style={{ marginBottom: 16 }}>
          <label className="genesis-label">Notes (optional)</label>
          <textarea
            className="genesis-textarea"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any direction or feedback for the next round..."
            rows={3}
          />
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button
            className="genesis-btn genesis-btn-primary"
            style={{ flex: 1 }}
            onClick={() => onApprove?.(notes)}
          >
            Approve & Continue
          </button>
          <button
            className="genesis-btn genesis-btn-secondary"
            style={{ flex: 1 }}
            onClick={() => onRedirect?.(notes)}
          >
            Redirect
          </button>
        </div>
      </div>
    </div>
  );
}
