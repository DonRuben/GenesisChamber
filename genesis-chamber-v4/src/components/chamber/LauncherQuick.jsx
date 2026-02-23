import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { font } from '../../design/tokens';
import { IC } from '../../design/icons';
import { StepNav, Btn, MonoLabel, Tag } from '../../design/shared';
import { useChamberStore } from '../../stores/chamberStore';
import { useAppStore } from '../../stores/appStore';
import { MOCK_PRESETS, MOCK_TEAMS } from '../../data/mock';
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
  const backendOnline = useAppStore((s) => s.backendOnline);
  const {
    launchStep, nextStep, prevStep,
    selectedPreset, setSelectedPreset,
    selectedPersonas, togglePersona,
    modelAssignments, setModelAssignment,
    brief, setBrief,
    setLaunchMode, handleSimSSEEvent, resetLive,
  } = useChamberStore();

  const preset = MOCK_PRESETS.find((p) => p.id === selectedPreset);

  // Auto-populate personas when preset is selected
  useEffect(() => {
    if (preset?.personas) {
      useChamberStore.setState({ selectedPersonas: new Set(preset.personas) });
    }
  }, [selectedPreset]); // eslint-disable-line react-hooks/exhaustive-deps

  const count = selectedPersonas.size;

  const summary = preset ? [
    { label: 'Preset', value: preset.name, color: preset.color },
    { label: 'Personas', value: count, color: count >= 3 ? t.green : t.magenta },
    { label: 'Rounds', value: preset.rounds },
    { label: 'Est. Time', value: preset.time },
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
      const allPersonas = MOCK_TEAMS.flatMap((team) => team.personas);
      const participants = allPersonas
        .filter((p) => selectedPersonas.has(p.id))
        .map((p) => ({
          id: p.id,
          name: p.name,
          model: modelAssignments[p.id] || p.model,
        }));

      const config = {
        preset_type: selectedPreset,
        creative_brief: brief,
        participants,
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
        {/* Step 0: Preset Selection */}
        {launchStep === 0 && (
          <div className="gc-enter-right" key={0}>
            <MonoLabel icon={IC.temple} color={t.cyan}>Choose a Preset</MonoLabel>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 12, marginTop: 4,
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
        )}

        {/* Step 1: Team Review */}
        {launchStep === 1 && (
          <div className="gc-enter-right" key={1} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <MonoLabel icon={IC.users} style={{ marginBottom: 0 }}>Review Team</MonoLabel>
              <Tag color={count >= 3 ? t.green : t.magenta} label={`${count} selected`} />
            </div>
            {MOCK_TEAMS.map((team) => {
              const teamPersonas = team.personas.filter((p) =>
                preset?.personas?.includes(p.id) || selectedPersonas.has(p.id)
              );
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
