import { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '../api';
import { IconLightning, IconMessage, IconCrystalBall, IconFactory, IconSparkle, IconCheck } from './Icons';
import HelpTooltip from './HelpTooltip';
import { helpContent } from './helpContent';
import ModelSelector from './ModelSelector';
import ConfigSummary from './ConfigSummary';
import StepIndicator from './StepIndicator';
import './SimulationLauncher.css';

const PRESET_ICONS = {
  quick_test: <IconLightning size={24} />,
  message_lab: <IconMessage size={24} />,
  genesis_chamber: <IconCrystalBall size={24} />,
  assembly_line: <IconFactory size={24} />,
};

const PRESET_COLORS = {
  quick_test: 'var(--gc-cyan)',
  message_lab: 'var(--gc-gold)',
  genesis_chamber: 'var(--op-flame)',
  assembly_line: 'var(--stage-present)',
};

const PRESET_DESCRIPTIONS = {
  quick_test: 'Fast 3-round test run to validate ideas quickly with minimal cost.',
  message_lab: 'Full 6-round strategy simulation for messaging and positioning.',
  genesis_chamber: 'Comprehensive 8-round creative engine for breakthrough concepts.',
  assembly_line: 'Efficient 5-round production pipeline for rapid iteration.',
};

// Default model assignments per persona from the blueprint
const DEFAULT_MODELS = {
  'david-ogilvy': 'google/gemini-2.5-pro',
  'claude-hopkins': 'anthropic/claude-sonnet-4-5-20250929',
  'leo-burnett': 'openai/gpt-5.1',
  'mary-wells-lawrence': 'meta-llama/llama-4-maverick',
  'gary-halbert': 'x-ai/grok-4',
  moderator: 'anthropic/claude-opus-4-6',
};

export default function SimulationLauncher({ onStart }) {
  const [souls, setSouls] = useState([]);
  const [presets, setPresets] = useState({});
  const [availableModels, setAvailableModels] = useState(null);
  const [selectedPreset, setSelectedPreset] = useState('quick_test');
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [modelAssignments, setModelAssignments] = useState({ ...DEFAULT_MODELS });
  const [brief, setBrief] = useState('');
  const [isStarting, setIsStarting] = useState(false);
  const [loadError, setLoadError] = useState(null);

  // Step tracking
  const [activeStep, setActiveStep] = useState('type');
  const [completedSteps, setCompletedSteps] = useState([]);
  const sectionRefs = {
    type: useRef(null),
    participants: useRef(null),
    brief: useRef(null),
  };

  useEffect(() => {
    loadData();
  }, []);

  // Track completed steps
  useEffect(() => {
    const completed = [];
    if (selectedPreset) completed.push('type');
    if (selectedParticipants.length > 0) completed.push('participants');
    if (brief.length > 0) completed.push('brief');
    setCompletedSteps(completed);
  }, [selectedPreset, selectedParticipants, brief]);

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

      // Load models (non-blocking — fallback to defaults if endpoint doesn't exist)
      try {
        const [modelsData, participantsData] = await Promise.all([
          api.getAvailableModels(),
          api.getDefaultParticipants(),
        ]);
        setAvailableModels(modelsData);
        // Initialize model assignments from backend defaults
        if (participantsData?.participants) {
          const assignments = { ...DEFAULT_MODELS };
          for (const [id, config] of Object.entries(participantsData.participants)) {
            if (config.model) assignments[id] = config.model;
          }
          if (participantsData.moderator?.model) {
            assignments.moderator = participantsData.moderator.model;
          }
          setModelAssignments(assignments);
        }
      } catch {
        // Model endpoints not available — use defaults silently
      }
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

  const updateModel = useCallback((id, modelId) => {
    setModelAssignments(prev => ({ ...prev, [id]: modelId }));
  }, []);

  const scrollToSection = useCallback((key) => {
    sectionRefs[key]?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setActiveStep(key);
  }, []);

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
            model: modelAssignments[pid] || DEFAULT_MODELS[pid] || 'anthropic/claude-sonnet-4-5-20250929',
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
          model: modelAssignments.moderator || 'anthropic/claude-opus-4-6',
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
      {/* Hero — spans full width */}
      <div className="launcher-hero">
        <h1 className="launcher-heading">
          Genesis<span className="launcher-heading-accent">Chamber</span>
        </h1>
        <p className="launcher-tagline">
          Where legendary minds converge to create the extraordinary
        </p>
      </div>

      {/* Left Column: Configuration */}
      <div className="launcher-main">
        {/* Step Indicator */}
        <StepIndicator
          activeStep={activeStep}
          completedSteps={completedSteps}
          onStepClick={scrollToSection}
        />

        {loadError && (
          <div className="launcher-error">
            {loadError}
            <button className="gc-btn gc-btn-secondary" onClick={loadData}>Retry</button>
          </div>
        )}

        {/* Preset Selection */}
        <section className="launcher-section" ref={sectionRefs.type}>
          <label className="gc-label">
            Simulation Type <HelpTooltip text={helpContent.launcher.type} position="right" />
          </label>
          <div className="preset-grid">
            {Object.entries(presets).map(([key, preset]) => (
              <div
                key={key}
                className={`preset-card ${selectedPreset === key ? 'selected' : ''}`}
                onClick={() => setSelectedPreset(key)}
                style={{ '--preset-color': PRESET_COLORS[key] || 'var(--gc-cyan)' }}
              >
                <div className="preset-header">
                  <div className="preset-icon">{PRESET_ICONS[key] || <IconSparkle size={24} />}</div>
                  <div className="preset-name">{preset.name}</div>
                </div>
                <div className="preset-desc">
                  {PRESET_DESCRIPTIONS[key] || `${preset.rounds} rounds, ${preset.stages_per_round} stages`}
                </div>
                <div className="preset-meta">
                  <span className="preset-rounds">{preset.rounds} rounds &middot; {preset.stages_per_round} stages</span>
                  {preset.cost_estimate && (
                    <span className="preset-cost">{preset.cost_estimate}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Participants */}
        <section className="launcher-section" ref={sectionRefs.participants}>
          <label className="gc-label">
            Participants ({selectedParticipants.length} selected)
            <HelpTooltip text={helpContent.launcher.participants} position="right" />
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
                  <div className="participant-info">
                    <span className="participant-name">{soul.name}</span>
                    <span className="participant-model-label">
                      {(modelAssignments[soul.id] || 'claude-sonnet-4.5').split('/').pop()}
                    </span>
                  </div>
                  {isSelected && <span className="participant-check"><IconCheck size={14} /></span>}
                </div>
              );
            })}
          </div>

          {/* Moderator */}
          <div className="moderator-section">
            <div className="moderator-header">
              <div className="moderator-avatar">
                <span className="moderator-initial">S</span>
              </div>
              <div className="moderator-info">
                <span className="moderator-name">Steve Jobs</span>
                <span className="moderator-role">Moderator</span>
              </div>
              {availableModels && (
                <ModelSelector
                  value={modelAssignments.moderator || 'anthropic/claude-opus-4-6'}
                  onChange={(modelId) => updateModel('moderator', modelId)}
                  models={availableModels}
                  compact
                />
              )}
            </div>
          </div>
        </section>

        {/* Model Configuration (shown when models are available and participants selected) */}
        {availableModels && selectedParticipants.length > 0 && (
          <section className="launcher-section">
            <label className="gc-label">
              Model Assignment
              <HelpTooltip text="Assign different AI models to each persona for cognitive diversity. Premium models cost more but provide deeper reasoning." position="right" />
            </label>
            <div className="participant-grid">
              {selectedParticipants.map(pid => {
                const soul = souls.find(s => s.id === pid);
                if (!soul) return null;
                return (
                  <div key={pid} className="participant-card selected" style={{ cursor: 'default' }}>
                    <div
                      className="participant-avatar"
                      style={{ borderColor: soul.color, background: soul.color }}
                    >
                      <span className="participant-initial" style={{ color: 'var(--surface-0)' }}>
                        {(soul.name || '?')[0]}
                      </span>
                    </div>
                    <div className="participant-info">
                      <span className="participant-name">{soul.name}</span>
                    </div>
                    <ModelSelector
                      value={modelAssignments[pid] || DEFAULT_MODELS[pid] || 'anthropic/claude-sonnet-4-5-20250929'}
                      onChange={(modelId) => updateModel(pid, modelId)}
                      models={availableModels}
                      compact
                    />
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Brief */}
        <section className="launcher-section" ref={sectionRefs.brief}>
          <label className="gc-label">
            Project Brief <HelpTooltip text={helpContent.launcher.brief} position="right" />
          </label>
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
      </div>

      {/* Right Column: Summary + Launch */}
      <div className="launcher-sidebar">
        <ConfigSummary
          preset={currentPreset}
          participants={selectedParticipants}
          souls={souls}
          brief={brief}
          modelAssignments={modelAssignments}
        />
        <div className="launcher-sidebar-launch">
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
      </div>
    </div>
  );
}
