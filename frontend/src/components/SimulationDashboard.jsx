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
import GeneratedGallery from './GeneratedGallery';
import DAArena from './DAArena';
import LiveFeed from './LiveFeed';
import ChamberAnimation from './ChamberAnimation';
import SimulationOverview from './SimulationOverview';
import HelpTooltip from './HelpTooltip';
import { helpContent } from './helpContent';
import { SkeletonGrid } from './Skeleton';
import { IconDiamond, IconGrid, IconEye, IconCompass, IconScroll, IconPackage, IconImage, IconSpark, IconError, IconScale, IconInfo } from './Icons';
import './SimulationDashboard.css';

const VIEW_TABS = [
  { key: 'overview', label: 'Overview', icon: <IconInfo size={14} /> },
  { key: 'concepts', label: 'Concepts', icon: <IconDiamond size={14} /> },
  { key: 'gallery', label: 'Gallery', icon: <IconGrid size={14} /> },
  { key: 'critiques', label: 'Critiques', icon: <IconEye size={14} /> },
  { key: 'direction', label: 'Direction', icon: <IconCompass size={14} /> },
  { key: 'transcript', label: 'Transcript', icon: <IconScroll size={14} /> },
];

/**
 * DAOverview — Devil's Advocate overview tab showing all DA interactions per round.
 * Extracts DA critiques and defense results from transcript entries.
 */
function DAOverview({ simState, simId }) {
  const [interactions, setInteractions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!simId || !simState) return;
    // Extract DA interactions from transcript entries
    const daInteractions = [];
    for (const entry of (simState.transcript_entries || [])) {
      if (entry.stage_name === 'critique' && entry.critiques) {
        for (const critique of entry.critiques) {
          if (critique.is_devils_advocate) {
            daInteractions.push({
              round: entry.round,
              type: 'attack',
              concept_name: critique.concept_name || `Concept ${critique.concept_id?.slice(0, 6) || '?'}`,
              score: critique.score,
              fatal_flaw: critique.fatal_flaw || '',
              weaknesses: critique.weaknesses || [],
              strengths: critique.strengths || [],
              one_change: critique.one_change || critique.demanded_change || '',
            });
          }
        }
      }
      if (entry.stage_name === 'da_defense' && entry.da_defense_results) {
        for (const defense of entry.da_defense_results) {
          daInteractions.push({
            round: entry.round,
            type: 'defense',
            concept_name: defense.concept_name || '',
            persona_name: defense.persona_name || '',
            defense_text: defense.defense_text || '',
            verdict: defense.verdict || '',
            verdict_details: defense.verdict_details || '',
            revised_score: defense.revised_score,
          });
        }
      }
    }
    setInteractions(daInteractions);
    setLoading(false);
  }, [simId, simState]);

  if (loading) return <div className="dashboard-view-animate" style={{ padding: '24px', color: 'var(--text-muted)' }}>Loading DA data...</div>;

  const attacks = interactions.filter(i => i.type === 'attack');
  const defenses = interactions.filter(i => i.type === 'defense');
  const accepted = defenses.filter(d => d.verdict?.toLowerCase().includes('accepted')).length;
  const insufficient = defenses.filter(d => d.verdict && !d.verdict.toLowerCase().includes('accepted')).length;
  const rounds = [...new Set(attacks.map(a => a.round))].sort();

  return (
    <div className="dashboard-view-animate" style={{ padding: '0' }}>
      {/* DA Summary Stats */}
      <div style={{
        display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px',
        padding: '12px', background: 'rgba(220, 38, 38, 0.04)', borderRadius: '8px',
        border: '1px solid rgba(220, 38, 38, 0.12)',
      }}>
        <div style={{ textAlign: 'center', flex: 1, minWidth: '80px' }}>
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#DC2626' }}>{attacks.length}</div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Attacks</div>
        </div>
        <div style={{ textAlign: 'center', flex: 1, minWidth: '80px' }}>
          <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--gc-cyan)' }}>{defenses.length}</div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Defenses</div>
        </div>
        <div style={{ textAlign: 'center', flex: 1, minWidth: '80px' }}>
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#22C55E' }}>{accepted}</div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Survived</div>
        </div>
        <div style={{ textAlign: 'center', flex: 1, minWidth: '80px' }}>
          <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--status-error)' }}>{insufficient}</div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Fell</div>
        </div>
      </div>

      {interactions.length === 0 ? (
        <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
          No DA interactions yet. The Devil's Advocate will attack during the Critique stage.
        </div>
      ) : (
        rounds.map(roundNum => {
          const roundAttacks = attacks.filter(a => a.round === roundNum);
          const roundDefenses = defenses.filter(d => d.round === roundNum);
          return (
            <div key={roundNum} style={{ marginBottom: '16px' }}>
              <div style={{
                fontSize: '11px', fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: '0.5px', color: 'var(--text-muted)',
                padding: '6px 0', borderBottom: '1px solid var(--border-subtle)', marginBottom: '8px',
              }}>
                Round {roundNum}
              </div>
              {roundAttacks.map((atk, i) => {
                const defense = roundDefenses.find(d => d.concept_name === atk.concept_name);
                return (
                  <div key={i} style={{
                    marginBottom: '8px', padding: '10px', borderRadius: '6px',
                    background: 'var(--surface-2)', border: '1px solid var(--border-subtle)',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)' }}>
                        {atk.concept_name}
                      </span>
                      <span style={{
                        fontSize: '11px', fontWeight: 600,
                        color: atk.score >= 7 ? '#22C55E' : atk.score >= 5 ? 'var(--gc-gold)' : '#DC2626',
                      }}>
                        DA Score: {atk.score}/10
                      </span>
                    </div>
                    {atk.fatal_flaw && (
                      <div style={{ fontSize: '12px', color: '#DC2626', marginBottom: '4px' }}>
                        <strong>Fatal Flaw:</strong> {atk.fatal_flaw}
                      </div>
                    )}
                    {atk.one_change && (
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                        <strong>Demanded Change:</strong> {atk.one_change}
                      </div>
                    )}
                    {defense && (
                      <div style={{
                        marginTop: '6px', paddingTop: '6px',
                        borderTop: '1px solid var(--border-subtle)',
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--gc-cyan)' }}>
                            Defense by {defense.persona_name}
                          </span>
                          <span style={{
                            fontSize: '10px', fontWeight: 600, padding: '1px 6px', borderRadius: '3px',
                            background: defense.verdict?.toLowerCase().includes('accepted')
                              ? 'rgba(34, 197, 94, 0.15)' : 'rgba(220, 38, 38, 0.15)',
                            color: defense.verdict?.toLowerCase().includes('accepted')
                              ? '#22C55E' : '#DC2626',
                          }}>
                            {defense.verdict || 'Pending'}
                          </span>
                        </div>
                        {defense.defense_text && (
                          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                            {defense.defense_text.length > 200 ? defense.defense_text.slice(0, 200) + '...' : defense.defense_text}
                          </div>
                        )}
                        {defense.revised_score != null && (
                          <div style={{ fontSize: '11px', marginTop: '3px', color: 'var(--text-muted)' }}>
                            Revised Score: <strong style={{
                              color: defense.revised_score >= 7 ? '#22C55E' : defense.revised_score >= 5 ? 'var(--gc-gold)' : '#DC2626',
                            }}>{defense.revised_score}/10</strong>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })
      )}
    </div>
  );
}

export default function SimulationDashboard({ simulations, currentSimId, onSelectSim, onRefreshList }) {
  const [simState, setSimState] = useState(null);
  const [activeView, setActiveView] = useState('concepts');
  const [selectedRound, setSelectedRound] = useState(null);
  const [directionRound, setDirectionRound] = useState('all');
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

  // Build tabs — add DA overview (when DA enabled), Generated + Output + DA Arena (when completed)
  const hasDA = !!simState.config?.devils_advocate;
  const baseTabs = hasDA
    ? [
        ...VIEW_TABS.slice(0, 5), // overview, concepts, gallery, critiques, direction
        { key: 'devils_advocate', label: "Devil's Advocate", icon: <IconScale size={14} /> },
        ...VIEW_TABS.slice(5),    // transcript
      ]
    : VIEW_TABS;
  const tabs = simState.status === 'completed'
    ? [
        ...baseTabs,
        ...(hasDA ? [{ key: 'da_arena', label: 'DA Arena', icon: <IconScale size={14} /> }] : []),
        { key: 'generated', label: 'Generated', icon: <IconImage size={14} /> },
        { key: 'output', label: 'Output', icon: <IconPackage size={14} /> },
      ]
    : baseTabs;

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
        {activeView === 'overview' && (
          <div className="dashboard-view-animate">
            <SimulationOverview simState={simState} simId={currentSimId} />
          </div>
        )}

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
            {/* Round filter for direction */}
            {simState.rounds?.length > 1 && (
              <div className="dashboard-direction-filters">
                <span className="dashboard-direction-filter-label">Round</span>
                {['all', ...(simState.rounds || []).map(r => r.round_num)].map(r => (
                  <button
                    key={r}
                    className={`gc-btn gc-btn-ghost dashboard-direction-filter-btn ${directionRound === String(r) ? 'dashboard-direction-filter-active' : ''}`}
                    onClick={() => setDirectionRound(String(r))}
                  >
                    {r === 'all' ? 'All' : `R${r}`}
                  </button>
                ))}
              </div>
            )}

            {simState.rounds?.filter(r => {
              if (directionRound !== 'all' && r.round_num !== parseInt(directionRound)) return false;
              return true;
            }).map(r => {
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

        {activeView === 'devils_advocate' && hasDA && (
          <DAOverview simState={simState} simId={currentSimId} />
        )}

        {activeView === 'transcript' && (
          <div className="dashboard-view-animate">
            <TranscriptViewer entries={simState.transcript_entries} eventLog={simState.event_log} />
          </div>
        )}

        {activeView === 'da_arena' && simState.status === 'completed' && hasDA && (
          <div className="dashboard-view-animate">
            <DAArena simId={currentSimId} />
          </div>
        )}

        {activeView === 'generated' && simState.status === 'completed' && (
          <div className="dashboard-view-animate">
            <GeneratedGallery simId={currentSimId} />
          </div>
        )}

        {activeView === 'output' && simState.status === 'completed' && (
          <div className="dashboard-view-animate">
            <OutputPanel simId={currentSimId} simState={simState} />
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
