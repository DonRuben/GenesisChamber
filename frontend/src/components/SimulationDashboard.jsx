import { useState, useEffect, useCallback } from 'react';
import { api } from '../api';
import SimulationLauncher from './SimulationLauncher';
import RoundProgress from './RoundProgress';
import ConceptCard from './ConceptCard';
import CritiquePanel from './CritiquePanel';
import ModeratorDirection from './ModeratorDirection';
import QualityGate from './QualityGate';
import TranscriptViewer from './TranscriptViewer';
import PresentationGallery from './PresentationGallery';
import './SimulationDashboard.css';

const VIEW_TABS = [
  { key: 'concepts', label: 'Concepts', icon: '\u25C6' },
  { key: 'gallery', label: 'Gallery', icon: '\u25A6' },
  { key: 'critiques', label: 'Critiques', icon: '\u{1F441}' },
  { key: 'direction', label: 'Direction', icon: '\u{1F9ED}' },
  { key: 'transcript', label: 'Transcript', icon: '\u{1F4DC}' },
];

export default function SimulationDashboard({ simulations, currentSimId, onSelectSim, onRefreshList }) {
  const [simState, setSimState] = useState(null);
  const [activeView, setActiveView] = useState('concepts');
  const [selectedRound, setSelectedRound] = useState(null);
  const [videoStatus, setVideoStatus] = useState(null);

  useEffect(() => {
    if (currentSimId) {
      loadSimState(currentSimId);
    } else {
      setSimState(null);
    }
  }, [currentSimId]);

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

  if (!currentSimId) {
    return <SimulationLauncher onStart={handleStart} />;
  }

  if (!simState) {
    return (
      <div className="dashboard">
        <div className="dashboard-loading">
          <div className="gc-spinner" />
          <span>Loading simulation...</span>
        </div>
      </div>
    );
  }

  const activeConcepts = simState.concepts?.active || [];
  const eliminatedConcepts = simState.concepts?.eliminated || [];
  const allConcepts = [...activeConcepts, ...eliminatedConcepts];
  const roundData = simState.rounds?.find(r => r.round_num === selectedRound);
  const pendingGate = simState.quality_gates?.find(g => g.status === 'pending');

  // Extract critiques from round data
  const extractCritiques = () => {
    if (!roundData?.stages) return [];
    const critiqueStage = roundData.stages[2];
    if (critiqueStage?.outputs) {
      return Array.isArray(critiqueStage.outputs) ? critiqueStage.outputs : [];
    }
    return simState.transcript_entries
      ?.filter(e => e.round === selectedRound && e.stage_name === 'critique')
      ?.flatMap(e => e.critiques || []) || [];
  };

  const statusClass = simState.status === 'running' ? 'running'
    : simState.status === 'completed' ? 'completed'
    : simState.status === 'paused_at_gate' ? 'paused'
    : 'failed';

  return (
    <div className="dashboard">
      {/* Command Center Header */}
      <header className="dashboard-header">
        <div className="dashboard-header-left">
          <h2 className="dashboard-title">{simState.config?.name || 'Simulation'}</h2>
          <div className="dashboard-meta">
            <span className={`gc-status gc-status-${statusClass}`}>
              {simState.status === 'paused_at_gate' ? 'Quality Gate' : simState.status}
            </span>
            <span className="dashboard-breadcrumb">
              Round {simState.current_round}/{simState.config?.rounds}
              {simState.current_stage_name && (
                <> &rsaquo; {simState.current_stage_name}</>
              )}
            </span>
          </div>
        </div>
        <div className="dashboard-header-right">
          <span className="dashboard-concept-count">
            {activeConcepts.length} active / {eliminatedConcepts.length} eliminated
          </span>
          {simState.status === 'completed' && (
            <div className="dashboard-actions">
              <button
                className="gc-btn gc-btn-secondary"
                onClick={() => window.open(
                  `${import.meta.env.VITE_API_URL || 'http://localhost:8001'}/api/simulation/${currentSimId}/presentation`,
                  '_blank'
                )}
              >
                Presentation
              </button>
              <button
                className="gc-btn gc-btn-secondary"
                disabled={videoStatus === 'generating'}
                onClick={async () => {
                  setVideoStatus('generating');
                  try {
                    await api.generateVideos(currentSimId, 'standard');
                    const poll = setInterval(async () => {
                      const result = await api.getVideos(currentSimId);
                      if (result.status === 'complete') {
                        setVideoStatus('complete');
                        clearInterval(poll);
                      }
                    }, 10000);
                  } catch (e) {
                    console.error('Video generation failed:', e);
                    setVideoStatus(null);
                  }
                }}
              >
                {videoStatus === 'generating' ? 'Generating...' : videoStatus === 'complete' ? 'Videos Ready' : 'Videos'}
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Round Timeline */}
      <RoundProgress
        rounds={simState.rounds}
        currentRound={simState.current_round}
        currentStage={simState.current_stage}
        totalRounds={simState.config?.rounds || 3}
        stagesPerRound={simState.config?.stages_per_round || 3}
        selectedRound={selectedRound}
        onSelectRound={setSelectedRound}
      />

      {/* View Tabs */}
      <nav className="dashboard-tabs">
        {VIEW_TABS.map(tab => (
          <button
            key={tab.key}
            className={`dashboard-tab ${activeView === tab.key ? 'active' : ''}`}
            onClick={() => setActiveView(tab.key)}
          >
            <span className="dashboard-tab-icon">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Content */}
      <div className="dashboard-content">
        {activeView === 'concepts' && (
          <div className="dashboard-concepts">
            <h3 className="dashboard-section-title">
              Active Concepts <span className="dashboard-section-count">{activeConcepts.length}</span>
            </h3>
            {activeConcepts.length === 0 ? (
              <div className="dashboard-empty">
                {simState.status === 'running' ? 'Waiting for concepts...' : 'No active concepts'}
              </div>
            ) : (
              activeConcepts.map(concept => (
                <ConceptCard key={concept.id} concept={concept} showDetails />
              ))
            )}

            {eliminatedConcepts.length > 0 && (
              <>
                <h3 className="dashboard-section-title dashboard-section-eliminated">
                  Eliminated <span className="dashboard-section-count">{eliminatedConcepts.length}</span>
                </h3>
                {eliminatedConcepts.map(concept => (
                  <ConceptCard key={concept.id} concept={concept} />
                ))}
              </>
            )}
          </div>
        )}

        {activeView === 'gallery' && (
          <PresentationGallery concepts={simState.concepts} rounds={simState.rounds} />
        )}

        {activeView === 'critiques' && (
          <CritiquePanel critiques={extractCritiques()} concepts={allConcepts} />
        )}

        {activeView === 'direction' && (
          <div className="dashboard-direction">
            {simState.rounds?.map(r => {
              const synthStage = r.stages?.[3];
              if (!synthStage?.outputs) return null;
              return (
                <div key={r.round_num} className="dashboard-direction-round">
                  <div className="dashboard-direction-label">
                    Round {r.round_num} — {r.mode}
                  </div>
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

      {/* Quality Gate */}
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
