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
import LiveFeed from './LiveFeed';
import ChamberAnimation from './ChamberAnimation';
import HelpTooltip from './HelpTooltip';
import { helpContent } from './helpContent';
import { SkeletonGrid } from './Skeleton';
import { IconDiamond, IconGrid, IconEye, IconCompass, IconScroll, IconPackage, IconSpark, IconError } from './Icons';
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

  // Live SSE event feed
  const [liveEvents, setLiveEvents] = useState([]);
  const liveEventsRef = useRef([]);

  // Track how many event_log + transcript entries we've already synthesized
  const lastEventLogLen = useRef(0);
  const lastTranscriptLen = useRef(0);

  useEffect(() => {
    if (currentSimId) {
      lastEventLogLen.current = 0;
      lastTranscriptLen.current = 0;
      loadSimState(currentSimId);
      setLiveEvents([]);
      liveEventsRef.current = [];
    } else {
      setSimState(null);
      setLiveEvents([]);
      liveEventsRef.current = [];
      lastEventLogLen.current = 0;
      lastTranscriptLen.current = 0;
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

      // Synthesize live events from new event_log + transcript entries
      const newLogEvents = (state.event_log || []).slice(lastEventLogLen.current);
      const newTranscript = (state.transcript_entries || []).slice(lastTranscriptLen.current);

      if (newLogEvents.length > 0 || newTranscript.length > 0) {
        const synthesized = [];

        for (const entry of newLogEvents) {
          if (entry.type === 'round_start') {
            synthesized.push({ type: 'stage_start', stage: 1, stage_name: 'creation', round: entry.round });
          } else if (entry.type === 'round_complete') {
            synthesized.push({ type: 'round_complete', round: entry.round, concepts_surviving: entry.concepts_active });
          } else if (entry.type === 'quality_gate') {
            synthesized.push({ type: 'stage_start', stage: 0, stage_name: 'quality gate', round: entry.round });
          }
        }

        for (const entry of newTranscript) {
          if (entry.stage_name === 'creation' && entry.concepts) {
            for (const c of entry.concepts) {
              synthesized.push({
                type: 'participant_response',
                persona_name: c.persona,
                persona_id: '',
                stage_name: 'creation',
                extra: [c.name],
              });
            }
          } else if (entry.stage_name === 'critique' && entry.critiques_count) {
            synthesized.push({
              type: 'stage_complete',
              stage_name: 'critique',
              round: entry.round,
            });
          } else if (entry.stage_name === 'synthesis' && entry.direction) {
            synthesized.push({
              type: 'stage_complete',
              stage_name: 'synthesis',
              round: entry.round,
            });
          }
        }

        if (synthesized.length > 0) {
          liveEventsRef.current = [...liveEventsRef.current, ...synthesized].slice(-100);
          setLiveEvents([...liveEventsRef.current]);
        }

        lastEventLogLen.current = (state.event_log || []).length;
        lastTranscriptLen.current = (state.transcript_entries || []).length;
      }

      if (!selectedRound && state.current_round > 0) {
        setSelectedRound(state.current_round);
      }
    } catch (e) {
      console.error('Failed to load simulation state:', e);
    }
  };

  // Receive live SSE events from the launcher's streaming connection
  const addLiveEvent = useCallback((event) => {
    liveEventsRef.current = [...liveEventsRef.current.slice(-99), event];
    setLiveEvents([...liveEventsRef.current]);
  }, []);

  const handleStart = useCallback((simId, sseEvents) => {
    // If SSE events were provided from the streaming launch, add them
    if (sseEvents && sseEvents.length > 0) {
      liveEventsRef.current = sseEvents;
      setLiveEvents([...sseEvents]);
    }
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
    return <SimulationLauncher onStart={handleStart} onLiveEvent={addLiveEvent} />;
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
  const errorMessage = simState.event_log?.find(e => e.type === 'error')?.message;

  // Build participant color map for LiveFeed
  const participantColors = {};
  if (simState.config?.participants) {
    for (const [pid, p] of Object.entries(simState.config.participants)) {
      participantColors[pid] = p.color || '#666';
    }
  }

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
            {/* Live Activity Panel — always visible when simulation is running */}
            {simState.status === 'running' && (
              <div className="dashboard-activity-panel">
                <ChamberAnimation
                  participants={simState.config?.participants || {}}
                  currentStage={simState.current_stage_name || 'creation'}
                  currentRound={simState.current_round || 1}
                  activeParticipants={
                    liveEvents
                      .filter(e => e.type === 'participant_thinking')
                      .map(e => e.persona_id)
                  }
                  recentEvents={liveEvents}
                  participantColors={participantColors}
                />
                <LiveFeed events={liveEvents} participantColors={participantColors} />
              </div>
            )}

            {simState.status === 'failed' && errorMessage && (
              <div className="dashboard-error-block">
                <IconError size={32} />
                <div className="dashboard-error-title">Simulation Failed</div>
                <div className="dashboard-error-message">{errorMessage}</div>
              </div>
            )}

            <h3 className="dashboard-section-title">
              Active Concepts <span className="dashboard-section-count">{activeConcepts.length}</span>
            </h3>

            {activeConcepts.length === 0 && simState.status !== 'running' && simState.status !== 'failed' ? (
              <div className="dashboard-empty">
                <IconSpark size={32} className="dashboard-empty-icon" />
                <div className="dashboard-empty-text">No active concepts</div>
                <div className="dashboard-empty-hint">Start a new simulation to begin</div>
              </div>
            ) : activeConcepts.length === 0 && simState.status === 'running' ? (
              <div className="dashboard-empty">
                <div className="gc-spinner" style={{ width: 28, height: 28 }} />
                <div className="dashboard-empty-text">Generating concepts...</div>
                <div className="dashboard-empty-hint">
                  Round {simState.current_round} — {simState.current_stage_name || 'working'}
                </div>
              </div>
            ) : (
              <div className="dashboard-concepts-grid">
                {activeConcepts.map(concept => (
                  <ConceptCard key={concept.id} concept={concept} showDetails />
                ))}
              </div>
            )}

            {eliminatedConcepts.length > 0 && (
              <>
                <h3 className="dashboard-section-title dashboard-section-eliminated">
                  Eliminated <span className="dashboard-section-count">{eliminatedConcepts.length}</span>
                </h3>
                <div className="dashboard-concepts-grid">
                  {eliminatedConcepts.map(concept => (
                    <ConceptCard key={concept.id} concept={concept} />
                  ))}
                </div>
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
