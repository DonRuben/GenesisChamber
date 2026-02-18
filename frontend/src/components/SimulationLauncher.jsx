import { useState, useEffect } from 'react';
import { api } from '../api';
import './SimulationLauncher.css';

const PRESET_ICONS = {
  quick_test: '\u26A1',
  message_lab: '\u{1F4AC}',
  genesis_chamber: '\u{1F52E}',
  assembly_line: '\u{1F3ED}',
};

const PRESET_COLORS = {
  quick_test: 'var(--gc-cyan)',
  message_lab: 'var(--gc-gold)',
  genesis_chamber: 'var(--op-flame)',
  assembly_line: 'var(--stage-present)',
};

export default function SimulationLauncher({ onStart }) {
  const [souls, setSouls] = useState([]);
  const [presets, setPresets] = useState({});
  const [selectedPreset, setSelectedPreset] = useState('quick_test');
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [brief, setBrief] = useState('');
  const [isStarting, setIsStarting] = useState(false);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [soulsData, presetsData] = await Promise.all([
        api.listSouls(),
        api.listPresets(),
      ]);
      setSouls(soulsData);
      setPresets(presetsData);
      setSelectedParticipants(
        soulsData.filter(s => s.id !== 'steve-jobs').slice(0, 3).map(s => s.id)
      );
    } catch (e) {
      console.error('Failed to load launcher data:', e);
      setLoadError('Failed to load configuration. Is the backend running?');
    }
  };

  const toggleParticipant = (id) => {
    setSelectedParticipants(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleStart = async () => {
    if (selectedParticipants.length === 0) return;
    setIsStarting(true);
    try {
      const preset = presets[selectedPreset] || presets.quick_test;
      const participants = {};
      for (const pid of selectedParticipants) {
        const soul = souls.find(s => s.id === pid);
        if (soul) {
          participants[pid] = {
            display_name: soul.name,
            model: 'anthropic/claude-sonnet-4-5-20250929',
            soul_document: soul.file,
            role: 'participant',
            temperature: 0.7,
            max_tokens: 4000,
            color: soul.color,
          };
        }
      }

      const moderator = souls.find(s => s.id === 'steve-jobs');
      const config = {
        name: preset.name || 'Simulation',
        type: selectedPreset,
        rounds: preset.rounds || 3,
        stages_per_round: preset.stages_per_round || 3,
        concepts_round_1: preset.concepts_round_1 || 2,
        concepts_round_2_plus: preset.concepts_round_2_plus || 1,
        participants,
        moderator: {
          display_name: moderator?.name || 'Steve Jobs',
          model: 'anthropic/claude-sonnet-4-5-20250929',
          soul_document: moderator?.file || 'souls/steve-jobs.md',
          role: 'moderator',
          temperature: 0.6,
          max_tokens: 4000,
          color: moderator?.color || '#6B7280',
        },
        elimination_schedule: preset.elimination_schedule || {},
        quality_gates: preset.quality_gates || [],
        brief: brief || 'Create a compelling brand concept for a modern AI platform.',
      };

      const result = await api.startSimulation(config);
      if (onStart) onStart(result.sim_id);
    } catch (e) {
      console.error('Failed to start simulation:', e);
    } finally {
      setIsStarting(false);
    }
  };

  const currentPreset = presets[selectedPreset];

  return (
    <div className="launcher">
      {/* Hero */}
      <div className="launcher-hero">
        <h1 className="launcher-heading">
          Genesis<span className="launcher-heading-accent">Chamber</span>
        </h1>
        <p className="launcher-tagline">
          Where legendary minds converge to create the extraordinary
        </p>
      </div>

      {loadError && (
        <div className="launcher-error">
          {loadError}
          <button className="gc-btn gc-btn-secondary" onClick={loadData}>Retry</button>
        </div>
      )}

      {/* Preset Selection */}
      <section className="launcher-section">
        <label className="gc-label">Simulation Type</label>
        <div className="preset-grid">
          {Object.entries(presets).map(([key, preset]) => (
            <div
              key={key}
              className={`preset-card ${selectedPreset === key ? 'selected' : ''}`}
              onClick={() => setSelectedPreset(key)}
              style={{ '--preset-color': PRESET_COLORS[key] || 'var(--gc-cyan)' }}
            >
              <div className="preset-icon">{PRESET_ICONS[key] || '\u2728'}</div>
              <div className="preset-name">{preset.name}</div>
              <div className="preset-desc">
                {preset.rounds} rounds, {preset.stages_per_round} stages
              </div>
              {preset.cost_estimate && (
                <div className="preset-cost">{preset.cost_estimate}</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Participants */}
      <section className="launcher-section">
        <label className="gc-label">
          Participants ({selectedParticipants.length} selected)
        </label>
        <div className="participant-grid">
          {souls.filter(s => s.id !== 'steve-jobs').map(soul => {
            const isSelected = selectedParticipants.includes(soul.id);
            return (
              <div
                key={soul.id}
                className={`participant-card ${isSelected ? 'selected' : ''}`}
                onClick={() => toggleParticipant(soul.id)}
              >
                <div
                  className="participant-avatar"
                  style={{ borderColor: soul.color, background: isSelected ? soul.color : 'transparent' }}
                >
                  <span className="participant-initial" style={{ color: isSelected ? 'var(--surface-0)' : soul.color }}>
                    {(soul.name || '?')[0]}
                  </span>
                </div>
                <span className="participant-name">{soul.name}</span>
                {isSelected && <span className="participant-check">\u2713</span>}
              </div>
            );
          })}
        </div>
      </section>

      {/* Brief */}
      <section className="launcher-section">
        <label className="gc-label">Project Brief</label>
        <textarea
          className="gc-textarea launcher-brief"
          value={brief}
          onChange={(e) => setBrief(e.target.value)}
          placeholder="Describe the creative challenge. What do you want the council to create?"
          rows={5}
        />
        <div className="launcher-brief-count">
          {brief.length > 0 ? `${brief.length} characters` : 'Optional — a default brief will be used'}
        </div>
      </section>

      {/* Launch */}
      <button
        className="launcher-start-btn"
        onClick={handleStart}
        disabled={isStarting || selectedParticipants.length === 0}
      >
        {isStarting ? (
          <>
            <span className="gc-spinner" />
            Starting Simulation...
          </>
        ) : (
          `Launch ${currentPreset?.name || 'Simulation'}`
        )}
      </button>
    </div>
  );
}
