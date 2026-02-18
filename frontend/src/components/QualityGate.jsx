import { useState } from 'react';
import HelpTooltip from './HelpTooltip';
import { helpContent } from './helpContent';
import './QualityGate.css';

export default function QualityGate({ gate, onApprove, onRedirect }) {
  const [notes, setNotes] = useState('');

  if (!gate || gate.status !== 'pending') return null;

  return (
    <div className="qg-overlay">
      <div className="qg-modal">
        <div className="qg-header">
          <h3 className="qg-title">
            Quality Gate
            <HelpTooltip text={helpContent.qualityGate.text} position="bottom" />
          </h3>
          <span className="qg-round">Round {gate.after_round}</span>
        </div>

        <p className="qg-description">
          The simulation has paused for your review. Review the concepts above,
          then approve to continue or redirect with notes.
        </p>

        {gate.summary && (
          <div className="qg-summary">
            <div className="qg-summary-label">Summary</div>
            <p className="qg-summary-text">{gate.summary}</p>
          </div>
        )}

        <div className="qg-notes-section">
          <label className="qg-label">Notes (optional)</label>
          <textarea
            className="gc-input qg-textarea"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any direction or feedback for the next round..."
            rows={3}
          />
        </div>

        <div className="qg-actions">
          <button
            className="gc-btn qg-btn-approve"
            onClick={() => onApprove?.(notes)}
          >
            Approve & Continue
          </button>
          <button
            className="gc-btn gc-btn-ghost qg-btn-redirect"
            onClick={() => onRedirect?.(notes)}
          >
            Redirect
          </button>
        </div>
      </div>
    </div>
  );
}
