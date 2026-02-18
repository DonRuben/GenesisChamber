import { useState } from 'react';
import ConceptCard from './ConceptCard';
import './PresentationGallery.css';

export default function PresentationGallery({ concepts, rounds }) {
  const [filterRound, setFilterRound] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const allConcepts = [
    ...(concepts?.active || []),
    ...(concepts?.eliminated || []),
    ...(concepts?.merged || []),
  ];

  const filtered = allConcepts.filter(c => {
    if (filterRound !== 'all' && c.round_created !== parseInt(filterRound)) return false;
    if (filterStatus !== 'all' && c.status !== filterStatus) return false;
    return true;
  });

  const uniqueRounds = [...new Set(allConcepts.map(c => c.round_created))].sort((a, b) => a - b);

  const STATUS_FILTERS = [
    { key: 'all', label: 'All' },
    { key: 'active', label: 'Active' },
    { key: 'winner', label: 'Winner' },
    { key: 'runner_up', label: 'Runner-up' },
    { key: 'eliminated', label: 'Eliminated' },
  ];

  return (
    <div className="pg-container">
      {/* Filter bar */}
      <div className="pg-filters">
        <div className="pg-filter-group">
          <span className="pg-filter-label">Round</span>
          {['all', ...uniqueRounds].map(r => (
            <button
              key={r}
              className={`gc-btn gc-btn-ghost pg-filter-btn ${filterRound === String(r) ? 'pg-filter-active' : ''}`}
              onClick={() => setFilterRound(String(r))}
            >
              {r === 'all' ? 'All' : `R${r}`}
            </button>
          ))}
        </div>

        <div className="pg-filter-group">
          <span className="pg-filter-label">Status</span>
          {STATUS_FILTERS.map(s => (
            <button
              key={s.key}
              className={`gc-btn gc-btn-ghost pg-filter-btn ${filterStatus === s.key ? 'pg-filter-active' : ''}`}
              onClick={() => setFilterStatus(s.key)}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Count */}
      <div className="pg-count">
        Showing {filtered.length} of {allConcepts.length} concepts
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="pg-empty">No concepts match filters</div>
      ) : (
        <div className="pg-grid">
          {filtered.map(concept => (
            <ConceptCard key={concept.id} concept={concept} showDetails />
          ))}
        </div>
      )}
    </div>
  );
}
