import { useState, useEffect } from 'react';
import { api } from '../api';

const PRESET_INFO = {
  quick_test: { label: 'Quick Test', desc: '3 rounds, 3 stages', cost: '$5-10', time: '15-30 min' },
  message_lab: { label: 'Message Lab', desc: '6 rounds, 5 stages', cost: '$15-40', time: '1-2 hrs' },
  genesis_chamber: { label: 'Genesis Chamber', desc: '8 rounds, 5 stages', cost: '$25-60', time: '2-4 hrs' },
  assembly_line: { label: 'Assembly Line', desc: '5 rounds, 5 stages', cost: '$10-30', time: '1-2 hrs' },
};

export default function SimulationLauncher({ onStart }) {
  const [souls, setSouls] = useState([]);
  const [presets, setPresets] = useState({});
  const [selectedPreset, setSelectedPreset] = useState('quick_test');
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [brief, setBrief] = useState('');
  const [isStarting, setIsStarting] = useState(false);

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
      // Select first 3 participants by default
      setSelectedParticipants(soulsData.filter(s => s.id !== 'steve-jobs').slice(0, 3).map(s => s.id));
    } catch (e) {
      console.error('Failed to load launcher data:', e);
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

  return (
    <div className="launcher">
      <h1>Genesis <span>Chamber</span></h1>
      <p className="subtitle">Multi-AI Creative Simulation Engine</p>

      <div style={{ marginBottom: 24 }}>
        <label className="genesis-label">Simulation Preset</label>
        <div className="preset-grid">
          {Object.entries(PRESET_INFO).map(([key, info]) => (
            <div
              key={key}
              className={`preset-card ${selectedPreset === key ? 'selected' : ''}`}
              onClick={() => setSelectedPreset(key)}
            >
              <div className="preset-name">{info.label}</div>
              <div className="preset-info">{info.desc}</div>
              <div className="preset-info">{info.cost} | {info.time}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <label className="genesis-label">Participants ({selectedParticipants.length} selected)</label>
        <div className="participant-grid">
          {souls.filter(s => s.id !== 'steve-jobs').map(soul => (
            <div
              key={soul.id}
              className={`participant-chip ${selectedParticipants.includes(soul.id) ? 'selected' : ''}`}
              onClick={() => toggleParticipant(soul.id)}
            >
              <div className="color-dot" style={{ background: soul.color }} />
              <span className="participant-name">{soul.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <label className="genesis-label">Project Brief</label>
        <textarea
          className="genesis-textarea"
          value={brief}
          onChange={(e) => setBrief(e.target.value)}
          placeholder="Describe the creative challenge. What do you want the council to create?"
          rows={6}
        />
      </div>

      <button
        className="genesis-btn genesis-btn-primary"
        onClick={handleStart}
        disabled={isStarting || selectedParticipants.length === 0}
        style={{ width: '100%', padding: '14px', fontSize: '16px' }}
      >
        {isStarting ? 'Starting Simulation...' : `Launch ${PRESET_INFO[selectedPreset]?.label || 'Simulation'}`}
      </button>
    </div>
  );
}
