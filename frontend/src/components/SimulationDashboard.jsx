import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../api';
import SimulationLauncher from './SimulationLauncher';
import RoundProgress from './RoundProgress';
import ConceptCard from './ConceptCard';
import CritiquePanel from './CritiquePanel';
import ModeratorDirection from './ModeratorDirection';
import QualityGate from './QualityGate';
import TranscriptViewer from './TranscriptViewer';
import PresentationGallery from './PresentationGallery';
import StatusHeader from './StatusHeader';
import OutputPanel from './OutputPanel';
import HelpTooltip from './HelpTooltip';
import { helpContent } from './helpContent';
import { SkeletonGrid } from './Skeleton';
import { IconDiamond, IconGrid, IconEye, IconCompass, IconScroll, IconPackage, IconSpark } from './Icons';
import './SimulationDashboard.css';

const VIEW_TABS = [
  { key: 'concepts', label: 'Concepts', icon: <IconDiamond size={14} /> },
  { key: 'gallery', label: 'Gallery', icon: <IconGrid size={14} /> },
  { key: 'critiques', label: 'Critiques', icon: <IconEye size={14} /> },
  { key: 'direction', label: 'Direction', icon: <IconCompass size={14} /> },
  { key: 'transcript', label: 'Transcript', icon: <IconScroll size={14} /> },
];

export default function SimulationDashboard({ simulations, currentSimId, onSelectSim, onRefreshList }) {
  const [simState, setSimState] = useState(null);
  const [activeView, setActiveView] = useState('concepts');
  const [selectedRound, setSelectedRound] = useState(null);
  const tabsRef = useRef(null);
  const [tabsOverflow, setTabsOverflow] = useState(false);

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

  // Detect tab overflow for fade indicator
  useEffect(() => {
    const el = tabsRef.current;
    if (!el) return;
    const check = () => setTabsOverflow(el.scrollWidth > el.clientWidth);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, [simState]);

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
          <SkeletonGrid count={3} />
        </div>
      </div>
    );
  }

  const activeConcepts = simState.concepts?.active || [];
  const eliminatedConcepts = simState.concepts?.eliminated || [];
  const allConcepts = [...activeConcepts, ...eliminatedConcepts];
  const roundData = simState.rounds?.find(r => r.round_num === selectedRound);
  const pendingGate = simState.quality_gates?.find(g => g.status === 'pending');

  // Build tabs — add Output tab only for completed sims
  const tabs = simState.status === 'completed'
    ? [...VIEW_TABS, { key: 'output', label: 'Output', icon: <IconPackage size={14} /> }]
    : VIEW_TABS;

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

  return (
    <div className="dashboard">
      {/* Enhanced Status Header */}
      <StatusHeader simState={simState} />

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
      <nav className={`dashboard-tabs ${tabsOverflow ? 'dashboard-tabs-overflow' : ''}`} ref={tabsRef}>
        {tabs.map(tab => (
          <button
            key={tab.key}
            className={`dashboard-tab ${activeView === tab.key ? 'active' : ''}`}
            onClick={() => setActiveView(tab.key)}
          >
            <span className="dashboard-tab-icon">{tab.icon}</span>
            {tab.label}
            {helpContent.dashboard[tab.key] && (
              <HelpTooltip text={helpContent.dashboard[tab.key]} position="bottom" />
            )}
          </button>
        ))}
      </nav>

      {/* Content */}
      <div className="dashboard-content">
        {activeView === 'concepts' && (
          <div className="dashboard-concepts dashboard-view-animate">
            <h3 className="dashboard-section-title">
              Active Concepts <span className="dashboard-section-count">{activeConcepts.length}</span>
            </h3>
            {activeConcepts.length === 0 ? (
              <div className="dashboard-empty">
                <IconSpark size={32} className="dashboard-empty-icon" />
                <div className="dashboard-empty-text">
                  {simState.status === 'running' ? 'Concepts are being generated...' : 'No active concepts'}
                </div>
                <div className="dashboard-empty-hint">
                  {simState.status === 'running' ? 'Each participant is crafting their vision' : 'Start a new simulation to begin'}
                </div>
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
          <div className="dashboard-view-animate">
            <PresentationGallery concepts={simState.concepts} rounds={simState.rounds} />
          </div>
        )}

        {activeView === 'critiques' && (
          <div className="dashboard-view-animate">
            <CritiquePanel critiques={extractCritiques()} concepts={allConcepts} />
          </div>
        )}

        {activeView === 'direction' && (
          <div className="dashboard-direction dashboard-view-animate">
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
          <div className="dashboard-view-animate">
            <TranscriptViewer entries={simState.transcript_entries} eventLog={simState.event_log} />
          </div>
        )}

        {activeView === 'output' && simState.status === 'completed' && (
          <div className="dashboard-view-animate">
            <OutputPanel simId={currentSimId} />
          </div>
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
