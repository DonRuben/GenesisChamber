import { useState } from 'react';
import ConceptCard from './ConceptCard';

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

  return (
    <div>
      {/* Filter bar */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <span className="genesis-label" style={{ marginBottom: 0 }}>Round:</span>
        {['all', ...uniqueRounds].map(r => (
          <button
            key={r}
            className={`genesis-btn ${filterRound === String(r) ? 'genesis-btn-primary' : 'genesis-btn-secondary'}`}
            style={{ padding: '4px 10px', fontSize: 11 }}
            onClick={() => setFilterRound(String(r))}
          >
            {r === 'all' ? 'All' : `R${r}`}
          </button>
        ))}

        <span className="genesis-label" style={{ marginBottom: 0, marginLeft: 16 }}>Status:</span>
        {['all', 'active', 'winner', 'runner_up', 'eliminated'].map(s => (
          <button
            key={s}
            className={`genesis-btn ${filterStatus === s ? 'genesis-btn-primary' : 'genesis-btn-secondary'}`}
            style={{ padding: '4px 10px', fontSize: 11, textTransform: 'capitalize' }}
            onClick={() => setFilterStatus(s)}
          >
            {s === 'all' ? 'All' : s.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Count */}
      <div style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 16 }}>
        Showing {filtered.length} of {allConcepts.length} concepts
      </div>

      {/* Grid */}
      <div className="presentation-grid">
        {filtered.map(concept => (
          <ConceptCard key={concept.id} concept={concept} showDetails />
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-dim)' }}>
          No concepts match filters
        </div>
      )}
    </div>
  );
}
