import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { font } from '../../design/tokens';
import { IC } from '../../design/icons';
import { StepNav, Btn, MonoLabel } from '../../design/shared';
import { useChamberStore } from '../../stores/chamberStore';
import { useAppStore } from '../../stores/appStore';
import { MOCK_PRESETS } from '../../data/mock';
import * as api from '../../services/api';
import PresetCard from './PresetCard';
import BriefInput from './BriefInput';
import { useTokens } from '../../hooks/useTokens';

export default function LauncherQuick() {
  const t = useTokens();
  const navigate = useNavigate();
  const [launching, setLaunching] = useState(false);
  const backendOnline = useAppStore((s) => s.backendOnline);
  const {
    launchStep, nextStep, prevStep,
    selectedPreset, setSelectedPreset, brief, setBrief,
    setLaunchMode, handleSimSSEEvent, resetLive,
  } = useChamberStore();

  const preset = MOCK_PRESETS.find((p) => p.id === selectedPreset);

  const summary = preset ? [
    { label: 'Preset', value: preset.name, color: preset.color },
    { label: 'Personas', value: preset.participants },
    { label: 'Rounds', value: preset.rounds },
    { label: 'Est. Time', value: preset.time },
  ] : null;

  const canProceed = launchStep === 0 ? !!selectedPreset : brief.trim().length > 10;

  const handleLaunch = async () => {
    if (!backendOnline) {
      navigate('/sim/mock-1');
      return;
    }
    setLaunching(true);
    resetLive();
    try {
      const config = {
        preset_type: selectedPreset,
        creative_brief: brief,
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
        <StepNav current={launchStep} total={2} labels={['Preset', 'Brief']} />
        <div style={{ width: 60 }} />
      </div>

      <div style={{ flex: 1 }}>
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

        {launchStep === 1 && (
          <div className="gc-enter-right" key={1}>
            <BriefInput brief={brief} onBriefChange={setBrief} summary={summary} />
          </div>
        )}
      </div>

      <div style={{
        display: 'flex', justifyContent: 'flex-end', gap: 8,
        paddingTop: 16, borderTop: `1px solid ${t.border}`, marginTop: 24,
      }}>
        {launchStep < 1 ? (
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
