import { IconCheck, IconError } from './Icons';
import './ModeratorDirection.css';

export default function ModeratorDirection({ direction }) {
  if (!direction) return null;

  return (
    <div className="md-panel">
      <div className="md-header">
        <span className="gc-badge gc-badge-gold">Moderator Direction</span>
        <span className="md-moderator">by {direction.moderator_name}</span>
      </div>

      {direction.surviving_concepts?.length > 0 && (
        <div className="md-section">
          <div className="md-section-label md-label-surviving">Surviving</div>
          {direction.surviving_concepts.map((c, i) => (
            <div key={i} className="md-concept-row">
              <span className="md-concept-check"><IconCheck size={14} /></span>
              <span className="md-concept-name">{c.name || c.id}</span>
              {c.reason && <span className="md-concept-reason"> — {c.reason}</span>}
            </div>
          ))}
        </div>
      )}

      {direction.eliminated_concepts?.length > 0 && (
        <div className="md-section">
          <div className="md-section-label md-label-eliminated">Eliminated</div>
          {direction.eliminated_concepts.map((c, i) => (
            <div key={i} className="md-concept-row">
              <span className="md-concept-x"><IconError size={14} /></span>
              <span className="md-concept-name md-concept-struck">{c.name || c.id}</span>
              {c.reason && <span className="md-concept-reason"> — {c.reason}</span>}
            </div>
          ))}
        </div>
      )}

      {direction.new_constraints?.length > 0 && (
        <div className="md-section">
          <div className="md-section-label md-label-constraints">New Constraints</div>
          <ul className="md-constraints-list">
            {direction.new_constraints.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </div>
      )}

      {direction.direction_notes && (
        <div className="md-direction-box">
          <div className="md-section-label md-label-direction">Direction</div>
          <p className="md-direction-text">{direction.direction_notes}</p>
        </div>
      )}

      {direction.one_more_thing && direction.one_more_thing.toUpperCase() !== 'NONE' && (
        <div className="md-omt-box">
          <strong className="md-omt-label">One more thing:</strong> {direction.one_more_thing}
        </div>
      )}
    </div>
  );
}
