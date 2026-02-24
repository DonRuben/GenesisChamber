import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { font } from '../../design/tokens';
import { IC } from '../../design/icons';
import { StepNav, Btn, MonoLabel, Tag, Toggle } from '../../design/shared';
import { useChamberStore } from '../../stores/chamberStore';
import { useAppStore } from '../../stores/appStore';
import { MOCK_PRESETS, MOCK_TEAMS, COUNCIL_PRESETS } from '../../data/mock';
import * as api from '../../services/api';
import PresetCard from './PresetCard';
import PersonaChip from './PersonaChip';
import BriefInput from './BriefInput';
import { useTokens } from '../../hooks/useTokens';
import { useModels } from '../../hooks/useModels';

const selectStyle = (t) => ({
  padding: '4px 8px', borderRadius: 4,
  background: t.surfaceRaised, border: `1px solid ${t.border}`,
  fontSize: 11, fontFamily: font.mono, color: t.text,
  cursor: 'pointer', outline: 'none',
});

export default function LauncherQuick() {
  const t = useTokens();
  const navigate = useNavigate();
  const { models } = useModels();
  const [launching, setLaunching] = useState(false);
  const [collapsedCategories, setCollapsedCategories] = useState({});
  const backendOnline = useAppStore((s) => s.backendOnline);
  const {
    launchStep, nextStep, prevStep,
    selectedPreset, setSelectedPreset,
    selectedPersonas, togglePersona,
    modelAssignments, setModelAssignment,
    brief, setBrief,
    setLaunchMode, handleSimSSEEvent, resetLive,
    thinkingMode, setThinkingMode,
    enableWebSearch, setEnableWebSearch,
  } = useChamberStore();

  const preset = MOCK_PRESETS.find((p) => p.id === selectedPreset);
  const councilPreset = COUNCIL_PRESETS.find((p) => p.id === selectedPreset);

  // Auto-populate personas when preset is selected
  useEffect(() => {
    if (preset?.personas) {
      useChamberStore.setState({ selectedPersonas: new Set(preset.personas) });
    } else if (councilPreset) {
      const allPersonaIds = MOCK_TEAMS.flatMap((team) => team.personas.map((p) => p.id));
      const souls = councilPreset.souls === 'all'
        ? new Set(allPersonaIds)
        : new Set(councilPreset.souls);
      useChamberStore.setState({ selectedPersonas: souls });
      // DA config from preset
      if (councilPreset.daEnabled !== undefined) {
        useChamberStore.setState({ daEnabled: councilPreset.daEnabled });
      }
      if (councilPreset.daAggression) {
        useChamberStore.setState({ daAggression: councilPreset.daAggression });
      }
    }
  }, [selectedPreset]); // eslint-disable-line react-hooks/exhaustive-deps

  const count = selectedPersonas.size;

  const activePreset = preset || councilPreset;
  const summary = activePreset ? [
    { label: 'Preset', value: activePreset.name, color: activePreset.color || t.cyan },
    { label: 'Personas', value: count, color: count >= 3 ? t.green : t.magenta },
    ...(activePreset.rounds ? [{ label: 'Rounds', value: activePreset.rounds }] : []),
    { label: 'Est. Time', value: activePreset.time },
  ] : null;

  const canProceed = launchStep === 0
    ? !!selectedPreset
    : launchStep === 1
      ? count >= 3
      : brief.trim().length > 10;

  const handleLaunch = async () => {
    if (!backendOnline) {
      navigate('/sim/mock-1');
      return;
    }
    setLaunching(true);
    resetLive();
    try {
      const { getEffectiveThinking, enableWebSearch: webSearch } = useChamberStore.getState();
      const allPersonas = MOCK_TEAMS.flatMap((team) => team.personas);
      const participants = allPersonas
        .filter((p) => selectedPersonas.has(p.id))
        .map((p) => ({
          id: p.id,
          name: p.name,
          model: modelAssignments[p.id] || p.model,
          thinking_mode: getEffectiveThinking(p.id),
        }));

      const config = {
        preset_type: selectedPreset,
        creative_brief: brief,
        participants,
        enable_web_search: webSearch,
      };
      await api.startSimulationStream(config, (type, data) => {
        handleSimSSEEvent(type, data);
        if (type === 'simulation_started' && data.sim_id) {
          useAppStore.getState().addSimulation({ id: data.sim_id, name: brief.slice(0, 50) || 'Quick Simulation', status: 'running' });
          navigate(`/sim/${data.sim_id}`);
        }
      });
    } catch (err) {
      setLaunching(false);
      useChamberStore.setState({ liveError: err.message, liveStatus: 'failed' });
    }
  };

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      maxWidth: 720, margin: '0 auto', width: '100%', padding: '24px 16px',
      animation: 'fadeSlideUp 0.3s ease-out',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 32,
      }}>
        <button
          onClick={() => launchStep === 0 ? setLaunchMode(null) : prevStep()}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 11, fontFamily: font.mono, color: t.textMuted,
          }}
        >
          <span style={{ fontSize: 14 }}>{IC.arrowLeft}</span> Back
        </button>
        <StepNav current={launchStep} total={3} labels={['Preset', 'Team', 'Brief']} />
        <div style={{ width: 60 }} />
      </div>

      <div style={{ flex: 1, overflow: 'auto' }}>
        {/* Step 0: Preset Selection — Grouped by Category */}
        {launchStep === 0 && (
          <div className="gc-enter-right" key={0}>
            <MonoLabel icon={IC.temple} color={t.cyan}>Choose a Preset</MonoLabel>

            {/* Council Presets — grouped by category */}
            {[
              { id: 'speed', label: 'SPEED', icon: IC.bolt, color: t.cyan },
              { id: 'balanced', label: 'BALANCED', icon: IC.scale, color: t.gold },
              { id: 'specialist', label: 'SPECIALIST', icon: IC.target, color: '#F27123' },
              { id: 'use-case', label: 'USE CASE', icon: IC.brain, color: '#8B5CF6' },
              { id: 'maximum', label: 'MAXIMUM', icon: IC.flame, color: '#EF4444' },
            ].map(({ id: catId, label, icon, color }) => {
              const presets = COUNCIL_PRESETS.filter((p) => p.category === catId);
              if (presets.length === 0) return null;
              const collapsed = collapsedCategories[catId];
              return (
                <div key={catId} style={{ marginTop: 12 }}>
                  <button
                    onClick={() => setCollapsedCategories((prev) => ({ ...prev, [catId]: !prev[catId] }))}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6, width: '100%',
                      background: 'transparent', border: 'none', cursor: 'pointer',
                      padding: '8px 0',
                    }}
                  >
                    <span style={{ fontSize: 12, color }}>{icon}</span>
                    <span style={{
                      fontSize: 10, fontFamily: font.mono, fontWeight: 600,
                      color, textTransform: 'uppercase', letterSpacing: '0.12em',
                    }}>{label}</span>
                    <span style={{
                      fontSize: 9, fontFamily: font.mono, color: t.textMuted, marginLeft: 4,
                    }}>({presets.length})</span>
                    <div style={{ flex: 1 }} />
                    <span style={{ fontSize: 10, color: t.textMuted }}>
                      {collapsed ? IC.chevDown : IC.chevUp}
                    </span>
                  </button>
                  {!collapsed && (
                    <div style={{
                      display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                      gap: 8,
                    }}>
                      {presets.map((p) => {
                        const isSel = selectedPreset === p.id;
                        return (
                          <button
                            key={p.id}
                            onClick={() => setSelectedPreset(p.id)}
                            style={{
                              padding: '14px 16px', borderRadius: 8, cursor: 'pointer',
                              background: isSel ? `${color}0d` : t.surface,
                              border: `1px solid ${isSel ? color : t.border}`,
                              borderLeft: `3px solid ${isSel ? color : 'transparent'}`,
                              textAlign: 'left', transition: 'all 0.15s',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                              <span style={{ fontSize: 16 }}>{p.icon}</span>
                              <span style={{ fontSize: 13, fontWeight: 600, color: t.text }}>{p.name}</span>
                              {p.recommended && (
                                <span style={{
                                  fontSize: 8, fontFamily: font.mono, fontWeight: 700,
                                  color: '#F27123', background: 'rgba(242,113,35,0.1)',
                                  padding: '2px 6px', borderRadius: 3,
                                  textTransform: 'uppercase', letterSpacing: '0.06em',
                                }}>{'\u2605'} RECOMMENDED</span>
                              )}
                            </div>
                            <div style={{
                              fontSize: 11, color: t.textMuted, lineHeight: 1.4, marginBottom: 8,
                            }}>{p.description}</div>
                            <div style={{ display: 'flex', gap: 8 }}>
                              <span style={{
                                fontSize: 9, fontFamily: font.mono, color: t.textSoft,
                                padding: '2px 6px', background: t.surfaceRaised, borderRadius: 3,
                              }}>{p.participants} souls</span>
                              <span style={{
                                fontSize: 9, fontFamily: font.mono, color: t.textSoft,
                                padding: '2px 6px', background: t.surfaceRaised, borderRadius: 3,
                              }}>{p.time}</span>
                              {p.daEnabled && (
                                <span style={{
                                  fontSize: 9, fontFamily: font.mono, color: '#EF4444',
                                  padding: '2px 6px', background: 'rgba(239,68,68,0.08)', borderRadius: 3,
                                }}>DA</span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Legacy Presets */}
            <div style={{ marginTop: 24 }}>
              <div style={{
                fontSize: 10, fontFamily: font.mono, fontWeight: 600,
                color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.12em',
                marginBottom: 8,
              }}>SIMULATION PRESETS</div>
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: 12,
              }}>
                {MOCK_PRESETS.map((p) => (
                  <PresetCard
                    key={p.id} preset={p}
                    selected={selectedPreset === p.id}
                    onClick={() => setSelectedPreset(p.id)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Team Review */}
        {launchStep === 1 && (
          <div className="gc-enter-right" key={1} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <MonoLabel icon={IC.users} style={{ marginBottom: 0 }}>Review Team</MonoLabel>
              <Tag color={count >= 3 ? t.green : t.magenta} label={`${count} selected`} />
            </div>
            {MOCK_TEAMS.map((team) => {
              const teamPersonas = team.personas.filter((p) => selectedPersonas.has(p.id));
              if (teamPersonas.length === 0) return null;
              const selectedInTeam = teamPersonas.filter((p) => selectedPersonas.has(p.id));
              return (
                <div key={team.id} style={{
                  border: `1px solid ${t.border}`, borderRadius: 8,
                  borderLeft: `2px solid ${team.color}`, overflow: 'hidden',
                }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '12px 16px', background: t.surface,
                  }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: t.text, flex: 1 }}>
                      {team.name}
                    </span>
                    <span style={{
                      fontSize: 9, fontFamily: font.mono, color: t.textMuted,
                    }}>
                      {selectedInTeam.length}/{teamPersonas.length}
                    </span>
                  </div>
                  <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                    gap: 6, padding: '8px 12px 12px',
                  }}>
                    {teamPersonas.map((p) => (
                      <PersonaChip
                        key={p.id} persona={p} teamColor={team.color}
                        selected={selectedPersonas.has(p.id)}
                        onToggle={() => togglePersona(p.id)}
                      />
                    ))}
                  </div>
                  {/* Model assignment for selected personas */}
                  {selectedInTeam.length > 0 && (
                    <div style={{
                      padding: '8px 12px 12px',
                      borderTop: `1px solid ${t.border}`,
                    }}>
                      <MonoLabel style={{ marginBottom: 8 }}>MODEL ASSIGNMENT</MonoLabel>
                      {selectedInTeam.map((p) => {
                        const assignedModel = modelAssignments[p.id] || p.model;
                        return (
                          <div key={p.id} style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            padding: '6px 0',
                          }}>
                            <span style={{
                              flex: 1, fontSize: 11, color: t.text,
                              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                            }}>{p.name}</span>
                            <select
                              value={assignedModel}
                              onChange={(e) => setModelAssignment(p.id, e.target.value)}
                              style={selectStyle(t)}
                            >
                              {models.map((m) => (
                                <option key={m.id} value={m.id}>{m.name}</option>
                              ))}
                            </select>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {/* AI Capabilities */}
            <div style={{
              border: `1px solid ${t.border}`, borderRadius: 8,
              borderLeft: `2px solid ${t.cyan}`, padding: '16px',
            }}>
              <MonoLabel icon={IC.brain} color={t.cyan} style={{ marginBottom: 12 }}>AI Capabilities</MonoLabel>

              {/* Thinking Mode */}
              <div style={{
                fontSize: 9, fontFamily: font.mono, color: t.textMuted,
                textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8,
              }}>THINKING MODE</div>
              <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
                {[
                  { id: 'off', label: 'Off', color: t.textMuted },
                  { id: 'thinking', label: 'Thinking', color: t.cyan },
                  { id: 'deep', label: 'Deep', color: t.gold },
                ].map(({ id, label, color }) => (
                  <button
                    key={id}
                    onClick={() => setThinkingMode(id)}
                    style={{
                      flex: 1, padding: '8px 12px', borderRadius: 6, cursor: 'pointer',
                      background: thinkingMode === id ? `${color}1a` : t.surfaceRaised,
                      border: `1px solid ${thinkingMode === id ? color : t.border}`,
                      fontSize: 11, fontFamily: font.mono, fontWeight: 600,
                      color: thinkingMode === id ? color : t.textMuted,
                      textTransform: 'uppercase', letterSpacing: '0.06em',
                    }}
                  >{label}</button>
                ))}
              </div>

              {/* Web Search */}
              <div style={{
                fontSize: 9, fontFamily: font.mono, color: t.textMuted,
                textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8,
              }}>WEB SEARCH</div>
              <button onClick={() => setEnableWebSearch(!enableWebSearch)}
                style={{
                  width: '100%', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10,
                  background: t.surfaceRaised, border: `1px solid ${t.border}`, borderRadius: 6,
                  cursor: 'pointer',
                }}>
                <span style={{ fontSize: 14, color: enableWebSearch ? t.cyan : t.textMuted }}>
                  {IC.search}
                </span>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: t.text }}>Web Search</div>
                  <div style={{ fontSize: 10, color: t.textMuted, marginTop: 2 }}>
                    {enableWebSearch ? 'Personas can search the web' : 'No internet access'}
                  </div>
                </div>
                <Toggle enabled={enableWebSearch} onChange={setEnableWebSearch} color={t.cyan} />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Brief */}
        {launchStep === 2 && (
          <div className="gc-enter-right" key={2}>
            <BriefInput brief={brief} onBriefChange={setBrief} summary={summary} />
          </div>
        )}
      </div>

      <div style={{
        display: 'flex', justifyContent: 'flex-end', gap: 8,
        paddingTop: 16, borderTop: `1px solid ${t.border}`, marginTop: 24,
      }}>
        {launchStep < 2 ? (
          <Btn color={t.cyan} disabled={!canProceed} onClick={nextStep}>
            Continue <span style={{ fontSize: 14 }}>{IC.arrowRight}</span>
          </Btn>
        ) : (
          <Btn color={t.gold} large disabled={!canProceed || launching} onClick={handleLaunch}>
            <span style={{ fontSize: 14 }}>{IC.rocket}</span> {launching ? 'Launching...' : 'Launch Simulation'}
          </Btn>
        )}
      </div>
    </div>
  );
}
