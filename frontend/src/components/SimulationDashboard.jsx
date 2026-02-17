import { useState, useEffect, useCallback } from 'react';
import { api } from '../api';
import SimulationLauncher from './SimulationLauncher';
import RoundProgress from './RoundProgress';
import ConceptCard from './ConceptCard';
import CritiquePanel from './CritiquePanel';
import ModeratorDirection from './ModeratorDirection';
import QualityGate from './QualityGate';
import TranscriptViewer from './TranscriptViewer';

export default function SimulationDashboard({ simulations, currentSimId, onSelectSim, onRefreshList }) {
  const [simState, setSimState] = useState(null);
  const [activeView, setActiveView] = useState('concepts'); // concepts | critiques | direction | transcript
  const [selectedRound, setSelectedRound] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load simulation state when selected
  useEffect(() => {
    if (currentSimId) {
      loadSimState(currentSimId);
    } else {
      setSimState(null);
    }
  }, [currentSimId]);

  // Poll for updates if simulation is running
  useEffect(() => {
    if (!simState || simState.status === 'completed' || simState.status === 'failed') return;

    const interval = setInterval(() => {
      if (currentSimId) loadSimState(currentSimId);
    }, 5000);

    return () => clearInterval(interval);
  }, [simState?.status, currentSimId]);

  const loadSimState = async (simId) => {
    try {
      const state = await api.getSimulationState(simId);
      setSimState(state);
      if (!selectedRound && state.current_round > 0) {
        setSelectedRound(state.current_round);
      }
    } catch (e) {
      console.error('Failed to load simulation state:', e);
    }
  };

  const handleStart = useCallback((simId) => {
    onSelectSim(simId);
    onRefreshList?.();
  }, [onSelectSim, onRefreshList]);

  const handleGateApprove = async (notes) => {
    if (!currentSimId || !simState) return;
    const pendingGate = simState.quality_gates?.find(g => g.status === 'pending');
    if (pendingGate) {
      await api.approveGate(currentSimId, pendingGate.after_round, 'approved', notes);
      loadSimState(currentSimId);
    }
  };

  const handleGateRedirect = async (notes) => {
    if (!currentSimId || !simState) return;
    const pendingGate = simState.quality_gates?.find(g => g.status === 'pending');
    if (pendingGate) {
      await api.approveGate(currentSimId, pendingGate.after_round, 'redirected', notes);
      loadSimState(currentSimId);
    }
  };

  // Show launcher if no simulation selected
  if (!currentSimId) {
    return <SimulationLauncher onStart={handleStart} />;
  }

  if (!simState) {
    return (
      <div className="genesis-dashboard">
        <div className="genesis-empty">
          <h3>Loading simulation...</h3>
        </div>
      </div>
    );
  }

  // Get data for selected round
  const roundData = simState.rounds?.find(r => r.round_num === selectedRound);
  const activeConcepts = simState.concepts?.active || [];
  const eliminatedConcepts = simState.concepts?.eliminated || [];
  const allConcepts = [...activeConcepts, ...eliminatedConcepts];

  // Get critiques and direction from transcript
  const roundEntries = simState.transcript_entries?.filter(e => e.round === selectedRound) || [];
  const pendingGate = simState.quality_gates?.find(g => g.status === 'pending');

  return (
    <div className="genesis-dashboard">
      {/* Header */}
      <div className="genesis-dashboard-header">
        <div>
          <h2>{simState.config?.name || 'Simulation'}</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
            <span className={`status-badge ${simState.status === 'running' ? 'running' : simState.status === 'completed' ? 'completed' : simState.status === 'paused_at_gate' ? 'paused' : 'failed'}`}>
              {simState.status}
            </span>
            <span style={{ fontSize: 13, color: 'var(--text-dim)' }}>
              Round {simState.current_round}/{simState.config?.rounds} | Stage {simState.current_stage_name || '—'}
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <span style={{ fontSize: 13, color: 'var(--text-dim)' }}>
            {activeConcepts.length} active / {eliminatedConcepts.length} eliminated
          </span>
        </div>
      </div>

      {/* Round Progress */}
      <RoundProgress
        rounds={simState.rounds}
        currentRound={simState.current_round}
        currentStage={simState.current_stage}
        totalRounds={simState.config?.rounds || 3}
        stagesPerRound={simState.config?.stages_per_round || 3}
        onSelectRound={setSelectedRound}
      />

      {/* View tabs */}
      <div style={{ display: 'flex', gap: 4, padding: '8px 24px', borderBottom: '1px solid var(--border)' }}>
        {[
          { key: 'concepts', label: 'Concepts' },
          { key: 'critiques', label: 'Critiques' },
          { key: 'direction', label: 'Direction' },
          { key: 'transcript', label: 'Transcript' },
        ].map(tab => (
          <button
            key={tab.key}
            className={`genesis-btn ${activeView === tab.key ? 'genesis-btn-primary' : 'genesis-btn-secondary'}`}
            style={{ padding: '6px 16px', fontSize: 12 }}
            onClick={() => setActiveView(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="genesis-dashboard-content">
        {activeView === 'concepts' && (
          <div>
            <h3 style={{ color: 'var(--gold)', fontSize: 17, fontWeight: 600, marginBottom: 16 }}>
              Active Concepts ({activeConcepts.length})
            </h3>
            {activeConcepts.length === 0 ? (
              <div style={{ color: 'var(--text-dim)', textAlign: 'center', padding: 24 }}>
                {simState.status === 'running' ? 'Waiting for concepts...' : 'No active concepts'}
              </div>
            ) : (
              activeConcepts.map(concept => (
                <ConceptCard key={concept.id} concept={concept} showDetails />
              ))
            )}

            {eliminatedConcepts.length > 0 && (
              <>
                <h3 style={{ color: 'var(--red)', fontSize: 17, fontWeight: 600, marginTop: 24, marginBottom: 16 }}>
                  Eliminated ({eliminatedConcepts.length})
                </h3>
                {eliminatedConcepts.map(concept => (
                  <ConceptCard key={concept.id} concept={concept} />
                ))}
              </>
            )}
          </div>
        )}

        {activeView === 'critiques' && (
          <CritiquePanel critiques={[]} concepts={allConcepts} />
        )}

        {activeView === 'direction' && (
          <div>
            {simState.rounds?.map(r => {
              const synthStage = r.stages?.[3];
              if (!synthStage?.outputs) return null;
              return (
                <div key={r.round_num} style={{ marginBottom: 24 }}>
                  <h4 style={{ color: 'var(--text-dim)', fontSize: 12, textTransform: 'uppercase', marginBottom: 8 }}>
                    Round {r.round_num} — {r.mode}
                  </h4>
                  <ModeratorDirection direction={synthStage.outputs} />
                </div>
              );
            })}
          </div>
        )}

        {activeView === 'transcript' && (
          <TranscriptViewer entries={simState.transcript_entries} eventLog={simState.event_log} />
        )}
      </div>

      {/* Quality Gate Modal */}
      {pendingGate && (
        <QualityGate
          gate={pendingGate}
          onApprove={handleGateApprove}
          onRedirect={handleGateRedirect}
        />
      )}
    </div>
  );
}
