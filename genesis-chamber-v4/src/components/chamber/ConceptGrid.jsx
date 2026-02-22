import { T, font } from '../../design/tokens';
import { IC } from '../../design/icons';
import { useChamberStore } from '../../stores/chamberStore';
import ConceptCard from './ConceptCard';

export default function ConceptGrid() {
  const { simulation, expandedConceptId, setExpandedConceptId, showEliminated, setShowEliminated } = useChamberStore();
  const concepts = simulation?.concepts || [];

  const winner = concepts.filter((c) => c.status === 'winner');
  const surviving = concepts.filter((c) => c.status === 'surviving');
  const eliminated = concepts.filter((c) => c.status === 'eliminated');

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 16,
      animation: 'fadeSlideUp 0.3s ease-out',
    }}>
      {/* Winner */}
      {winner.map((c) => (
        <ConceptCard key={c.id} concept={c} rank={1} isExpanded onToggle={() => {}} />
      ))}

      {/* Surviving — 2 col grid */}
      {surviving.length > 0 && (
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: 12,
        }}>
          {surviving.map((c, i) => (
            <ConceptCard
              key={c.id} concept={c} rank={i + 2}
              isExpanded={expandedConceptId === c.id}
              onToggle={() => setExpandedConceptId(c.id)}
            />
          ))}
        </div>
      )}

      {/* Eliminated divider */}
      {eliminated.length > 0 && (
        <>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0',
          }}>
            <div style={{ flex: 1, height: 1, background: `${T.flame}33` }} />
            <button
              onClick={() => setShowEliminated(!showEliminated)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 10, fontFamily: font.mono, color: T.textMuted,
                textTransform: 'uppercase', letterSpacing: '0.08em',
              }}
            >
              <span style={{ fontSize: 14, color: T.magenta }}>{IC.skull}</span>
              {showEliminated ? 'Hide' : 'Show'} Eliminated ({eliminated.length})
            </button>
            <div style={{ flex: 1, height: 1, background: `${T.flame}33` }} />
          </div>

          {showEliminated && (
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: 12, animation: 'fadeSlideUp 0.2s ease-out',
            }}>
              {eliminated.map((c, i) => (
                <ConceptCard
                  key={c.id} concept={c} rank={surviving.length + winner.length + i + 1}
                  isExpanded={expandedConceptId === c.id}
                  onToggle={() => setExpandedConceptId(c.id)}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
