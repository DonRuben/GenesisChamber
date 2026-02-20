import { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '../api';
import { IconLightning, IconMessage, IconCrystalBall, IconFactory, IconSparkle, IconCheck, IconUpload, IconInfo } from './Icons';
import HelpTooltip from './HelpTooltip';
import { helpContent } from './helpContent';
import ModelSelector from './ModelSelector';
import ConfigSummary from './ConfigSummary';
import StepIndicator from './StepIndicator';
import SoulInfoCard from './SoulInfoCard';
import { getDisplayName } from '../utils/modelDisplayNames';
import './SimulationLauncher.css';

const BRIEF_TEMPLATE = `# Project Brief

## Client / Brand
[Company or brand name — who is this for?]

## Challenge
[What problem needs solving? What's the creative challenge?]

## Target Audience
[Who are we trying to reach? Demographics, psychographics, behaviors]

## Key Requirements
[What must the output include or achieve?]

## Constraints
[Budget, timeline, brand guidelines, things to avoid]

## What Success Looks Like
[How will you know this worked? Measurable outcomes if possible]

## Tone & Feel
[Premium? Playful? Authoritative? Warm? What's the vibe?]

## Reference / Inspiration
[Brands, campaigns, or styles you admire — or want to avoid]`;

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
  // Marketing & Strategy
  'david-ogilvy': 'google/gemini-2.5-pro',
  'claude-hopkins': 'anthropic/claude-sonnet-4.6',
  'leo-burnett': 'openai/gpt-5.1',
  'mary-wells-lawrence': 'meta-llama/llama-4-maverick',
  'gary-halbert': 'x-ai/grok-4',
  // Design & Visual
  'paul-rand': 'google/gemini-2.5-pro',
  'paula-scher': 'openai/gpt-5.1',
  'saul-bass': 'anthropic/claude-sonnet-4.6',
  'susan-kare': 'meta-llama/llama-4-maverick',
  'rob-janoff': 'x-ai/grok-4',
  'tobias-van-schneider': 'google/gemini-2.5-pro',
  // Leadership
  moderator: 'anthropic/claude-opus-4-6',
  evaluator: 'anthropic/claude-opus-4-6',
  // Devil's Advocate
  'devils-advocate': 'anthropic/claude-sonnet-4.6',
};

// Team display order and metadata
const TEAM_ORDER = ['marketing', 'design', 'leadership'];
const TEAM_LABELS = {
  marketing: 'Marketing & Strategy',
  design: 'Design & Visual',
  leadership: 'Leadership',
  custom: 'Custom',
};
const TEAM_COLORS = {
  marketing: '#F59E0B',
  design: '#8B5CF6',
  leadership: '#6B7280',
  custom: '#666666',
};

// Upload color palette for new souls
const UPLOAD_COLORS = [
  '#F59E0B', '#3B82F6', '#10B981', '#EC4899', '#EF4444',
  '#8B5CF6', '#F97316', '#DC2626', '#06B6D4', '#A3E635', '#D946EF',
];

export default function SimulationLauncher({ onStart, onLiveEvent }) {
  const [souls, setSouls] = useState([]);
  const [presets, setPresets] = useState({});
  const [availableModels, setAvailableModels] = useState(null);
  const [selectedPreset, setSelectedPreset] = useState('quick_test');
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [modelAssignments, setModelAssignments] = useState({ ...DEFAULT_MODELS });
  const [brief, setBrief] = useState('');
  const [isStarting, setIsStarting] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState(null);
  const fileInputRef = useRef(null);
  // Dual-role: leadership personas added as active participants
  const [dualRoleActive, setDualRoleActive] = useState({ 'jony-ive': false });
  // Devil's Advocate (Advocatus Diaboli) — optional adversarial critic
  const [devilsAdvocateActive, setDevilsAdvocateActive] = useState(false);
  // AI capabilities
  const [thinkingMode, setThinkingMode] = useState('off'); // 'off', 'thinking', 'deep'
  const [thinkingOverrides, setThinkingOverrides] = useState({}); // per-participant overrides
  const [enableWebSearch, setEnableWebSearch] = useState(false);
  // Soul info card
  const [infoSoul, setInfoSoul] = useState(null);
  // Reference file uploads
  const [referenceFiles, setReferenceFiles] = useState([]);
  const [uploadError, setUploadError] = useState(null);
  const refFileInputRef = useRef(null);
  // Soul upload
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadTeam, setUploadTeam] = useState('custom');
  const [uploadColor, setUploadColor] = useState('#666666');
  const [isUploading, setIsUploading] = useState(false);
  const soulFileInputRef = useRef(null);

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
      // Default: first 2 marketing + first 1 design for a mixed team
      const marketing = soulsData.filter(s => s.team === 'marketing');
      const design = soulsData.filter(s => s.team === 'design');
      const defaults = [
        ...marketing.slice(0, 2).map(s => s.id),
        ...design.slice(0, 1).map(s => s.id),
      ];
      setSelectedParticipants(defaults.length > 0
        ? defaults
        : soulsData.filter(s => s.id !== 'steve-jobs' && s.id !== 'jony-ive').slice(0, 3).map(s => s.id)
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

  // Group souls by team (excluding leadership — Jobs and Ive are handled separately)
  const soulsByTeam = (() => {
    const groups = {};
    const participantSouls = souls.filter(s => s.id !== 'steve-jobs' && s.id !== 'jony-ive');
    for (const soul of participantSouls) {
      const team = soul.team || 'custom';
      if (!groups[team]) groups[team] = [];
      groups[team].push(soul);
    }
    return groups;
  })();

  // Get ordered team keys (known teams first, then any custom/unknown)
  const orderedTeams = [
    ...TEAM_ORDER.filter(t => soulsByTeam[t]?.length > 0),
    ...Object.keys(soulsByTeam).filter(t => !TEAM_ORDER.includes(t) && soulsByTeam[t]?.length > 0),
  ];

  const toggleTeam = (teamKey) => {
    const teamSoulIds = (soulsByTeam[teamKey] || []).map(s => s.id);
    const allSelected = teamSoulIds.every(id => selectedParticipants.includes(id));
    if (allSelected) {
      setSelectedParticipants(prev => prev.filter(id => !teamSoulIds.includes(id)));
    } else {
      setSelectedParticipants(prev => [...new Set([...prev, ...teamSoulIds])]);
    }
  };

  const toggleDualRole = (personaId) => {
    setDualRoleActive(prev => ({ ...prev, [personaId]: !prev[personaId] }));
  };

  const handleSoulUpload = async (file) => {
    if (!file || !file.name.endsWith('.md')) {
      alert('Only .md soul documents are supported');
      return;
    }
    setIsUploading(true);
    try {
      const result = await api.uploadSoul(file, uploadTeam, uploadColor);
      // Refresh souls list
      const soulsData = await api.listSouls();
      setSouls(soulsData);
      // Auto-select the new soul
      setSelectedParticipants(prev => [...prev, result.id]);
      setShowUploadModal(false);
      setUploadTeam('custom');
      setUploadColor('#666666');
    } catch (e) {
      console.error('Failed to upload soul:', e);
      alert('Failed to upload soul document. Is the backend running?');
    } finally {
      setIsUploading(false);
    }
  };

  const updateModel = useCallback((id, modelId) => {
    setModelAssignments(prev => ({ ...prev, [id]: modelId }));
  }, []);

  const handleThinkingModeChange = useCallback((newMode) => {
    setThinkingMode(newMode);
    setThinkingOverrides({}); // Reset per-participant overrides when global changes
  }, []);

  const handleThinkingOverride = useCallback((pid, mode) => {
    setThinkingOverrides(prev => {
      const next = { ...prev };
      if (mode === thinkingMode) {
        delete next[pid]; // Same as global = no override needed
      } else {
        next[pid] = mode;
      }
      return next;
    });
  }, [thinkingMode]);

  const getEffectiveThinking = useCallback((pid) => {
    return thinkingOverrides[pid] || thinkingMode;
  }, [thinkingOverrides, thinkingMode]);

  const hasThinkingOverrides = Object.keys(thinkingOverrides).length > 0;

  const scrollToSection = useCallback((key) => {
    sectionRefs[key]?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setActiveStep(key);
  }, []);

  // File upload for brief
  const handleFileRead = useCallback((file) => {
    if (!file) return;
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['md', 'txt', 'text', 'markdown'].includes(ext)) {
      alert('Supported formats: .md, .txt, .markdown');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      if (brief.length > 0 && !window.confirm(`Replace current brief with "${file.name}"?`)) return;
      setBrief(content);
      setUploadedFileName(file.name);
    };
    reader.readAsText(file);
  }, [brief]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileRead(file);
  }, [handleFileRead]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
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
            model: modelAssignments[pid] || DEFAULT_MODELS[pid] || 'anthropic/claude-sonnet-4.6',
            soul_document: soul.file,
            role: 'participant',
            temperature: 0.7,
            max_tokens: 4000,
            thinking_mode: getEffectiveThinking(pid),
            enable_web_search: enableWebSearch,
            color: soul.color,
          };
        }
      }

      // If Jony Ive dual-role is active, add him as a participant too
      if (dualRoleActive['jony-ive']) {
        const iveSoul = souls.find(s => s.id === 'jony-ive');
        if (iveSoul) {
          participants['jony-ive'] = {
            display_name: iveSoul.name,
            model: modelAssignments['jony-ive'] || modelAssignments.evaluator || 'anthropic/claude-opus-4-6',
            soul_document: iveSoul.file,
            role: 'participant',
            temperature: 0.5,
            max_tokens: 4000,
            thinking_mode: getEffectiveThinking('jony-ive'),
            enable_web_search: enableWebSearch,
            color: iveSoul.color || '#9CA3AF',
          };
        }
      }

      const moderator = souls.find(s => s.id === 'steve-jobs');
      const evaluator = souls.find(s => s.id === 'jony-ive');
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
          thinking_mode: getEffectiveThinking('moderator'),
          enable_web_search: enableWebSearch,
          color: moderator?.color || '#6B7280',
        },
        evaluator: {
          display_name: evaluator?.name || 'Jony Ive',
          model: modelAssignments.evaluator || 'anthropic/claude-opus-4-6',
          soul_document: evaluator?.file || 'souls/jony-ive.md',
          role: 'evaluator',
          temperature: 0.5,
          max_tokens: 4000,
          thinking_mode: getEffectiveThinking('evaluator'),
          enable_web_search: enableWebSearch,
          color: evaluator?.color || '#9CA3AF',
        },
        elimination_schedule: preset.elimination_schedule || {},
        quality_gates: preset.quality_gates || [],
        brief: brief || 'Create a compelling brand concept for a modern AI platform.',
        brand_context: referenceFiles.length > 0
          ? referenceFiles.map(rf => {
              const header = `=== REFERENCE: ${rf.filename || 'Uploaded file'} (${rf.type || 'unknown'}) ===`;
              const text = rf.extracted_text || '[No text could be extracted from this file]';
              return `${header}\n${text}`;
            }).join('\n\n')
          : '',
        // Devil's Advocate (Advocatus Diaboli) — optional adversarial critic
        ...(devilsAdvocateActive ? {
          devils_advocate: {
            display_name: 'Advocatus Diaboli',
            model: modelAssignments['devils-advocate'] || 'anthropic/claude-sonnet-4.6',
            soul_document: 'souls/devils-advocate.md',
            role: 'devils_advocate',
            temperature: 0.75,
            max_tokens: 4000,
            thinking_mode: getEffectiveThinking('devils-advocate'),
            enable_web_search: enableWebSearch,
            color: '#DC2626',
          },
        } : {}),
      };

      // Try SSE streaming first for live events, fall back to non-streaming
      let simId = null;
      let hasNavigated = false;
      const collectedEvents = [];
      try {
        await api.startSimulationStream(config, (type, event) => {
          if (type === 'simulation_started' && event.sim_id) {
            simId = event.sim_id;
          }
          // Forward live events to dashboard
          collectedEvents.push(event);
          if (onLiveEvent) onLiveEvent(event);
          // Navigate after first substantive event (not immediately on sim_started)
          if (simId && !hasNavigated && (type === 'stage_start' || type === 'simulation_complete' || type === 'error')) {
            hasNavigated = true;
            if (onStart) onStart(simId, collectedEvents);
          }
        });
        // Stream ended — navigate if we haven't yet
        if (simId && !hasNavigated) {
          hasNavigated = true;
          if (onStart) onStart(simId, collectedEvents);
        }
      } catch (streamErr) {
        console.warn('SSE streaming failed, falling back to non-streaming:', streamErr);
        if (!simId) {
          const result = await api.startSimulation(config);
          simId = result.sim_id;
          if (onStart) onStart(simId, collectedEvents);
        }
      }
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

        {/* Participants — grouped by team */}
        <section className="launcher-section" ref={sectionRefs.participants}>
          <div className="launcher-section-header">
            <label className="gc-label">
              Participants ({selectedParticipants.length} selected)
              <HelpTooltip text={helpContent.launcher.participants} position="right" />
            </label>
            <button
              className="soul-upload-btn"
              type="button"
              onClick={() => setShowUploadModal(true)}
            >
              <IconUpload size={12} />
              Upload Soul
            </button>
          </div>

          {orderedTeams.map(teamKey => {
            const teamSouls = soulsByTeam[teamKey] || [];
            const teamLabel = TEAM_LABELS[teamKey] || teamKey;
            const teamColor = TEAM_COLORS[teamKey] || '#666666';
            const allSelected = teamSouls.every(s => selectedParticipants.includes(s.id));
            const someSelected = teamSouls.some(s => selectedParticipants.includes(s.id));
            const selectedCount = teamSouls.filter(s => selectedParticipants.includes(s.id)).length;

            return (
              <div key={teamKey} className="team-group">
                <div className="team-header">
                  <div className="team-label" style={{ '--team-color': teamColor }}>
                    <span className="team-dot" style={{ background: teamColor }} />
                    <span className="team-name">{teamLabel}</span>
                    <span className="team-count">{selectedCount}/{teamSouls.length}</span>
                  </div>
                  <button
                    className={`team-select-all ${allSelected ? 'active' : ''}`}
                    onClick={() => toggleTeam(teamKey)}
                    type="button"
                  >
                    {allSelected ? 'Deselect All' : someSelected ? 'Select All' : 'Select All'}
                  </button>
                </div>
                <div className="participant-grid">
                  {teamSouls.map(soul => {
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
                            {getDisplayName(modelAssignments[soul.id] || 'anthropic/claude-sonnet-4.6')}
                          </span>
                        </div>
                        <button
                          className="participant-info-btn"
                          onClick={(e) => { e.stopPropagation(); setInfoSoul(soul); }}
                          type="button"
                          aria-label={`Info about ${soul.name}`}
                        >
                          <IconInfo size={14} />
                        </button>
                        {isSelected && <span className="participant-check"><IconCheck size={14} /></span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Leadership — Moderator + Evaluator with dual-role toggle */}
          <div className="moderator-section">
            <div className="moderator-header">
              <div className="moderator-avatar">
                <span className="moderator-initial">S</span>
              </div>
              <div className="moderator-info">
                <span className="moderator-name">Steve Jobs</span>
                <span className="moderator-role">Moderator</span>
              </div>
              <button
                className="participant-info-btn"
                onClick={() => {
                  const jobsSoul = souls.find(s => s.id === 'steve-jobs');
                  if (jobsSoul) setInfoSoul(jobsSoul);
                }}
                type="button"
                aria-label="Info about Steve Jobs"
              >
                <IconInfo size={14} />
              </button>
              {availableModels && (
                <ModelSelector
                  value={modelAssignments.moderator || 'anthropic/claude-opus-4-6'}
                  onChange={(modelId) => updateModel('moderator', modelId)}
                  models={availableModels}
                  compact
                />
              )}
              {thinkingMode !== 'off' && (
                <select
                  className="thinking-per-participant thinking-leadership"
                  value={getEffectiveThinking('moderator')}
                  onChange={(e) => handleThinkingOverride('moderator', e.target.value)}
                >
                  <option value="off">Thinking: Off</option>
                  <option value="thinking">Thinking</option>
                  <option value="deep">Deep Thinking</option>
                </select>
              )}
            </div>

            <div className="evaluator-header" style={{ marginTop: '12px' }}>
              <div className="moderator-avatar" style={{ borderColor: '#9CA3AF' }}>
                <span className="moderator-initial" style={{ color: '#9CA3AF' }}>J</span>
              </div>
              <div className="moderator-info">
                <span className="moderator-name">Jony Ive</span>
                <span className="moderator-role">
                  Evaluator
                  {dualRoleActive['jony-ive'] && <span className="dual-role-badge">+ Participant</span>}
                </span>
              </div>
              <button
                className="participant-info-btn"
                onClick={() => {
                  const iveSoul = souls.find(s => s.id === 'jony-ive');
                  if (iveSoul) setInfoSoul(iveSoul);
                }}
                type="button"
                aria-label="Info about Jony Ive"
              >
                <IconInfo size={14} />
              </button>
              <button
                className={`dual-role-toggle ${dualRoleActive['jony-ive'] ? 'active' : ''}`}
                onClick={() => toggleDualRole('jony-ive')}
                type="button"
                title="Enable dual role: Ive also participates as a creative contributor"
              >
                {dualRoleActive['jony-ive'] ? 'Dual Role' : 'Evaluate Only'}
              </button>
              {availableModels && (
                <ModelSelector
                  value={modelAssignments.evaluator || modelAssignments['jony-ive'] || 'anthropic/claude-opus-4-6'}
                  onChange={(modelId) => updateModel('evaluator', modelId)}
                  models={availableModels}
                  compact
                />
              )}
              {thinkingMode !== 'off' && (
                <select
                  className="thinking-per-participant thinking-leadership"
                  value={getEffectiveThinking('evaluator')}
                  onChange={(e) => handleThinkingOverride('evaluator', e.target.value)}
                >
                  <option value="off">Thinking: Off</option>
                  <option value="thinking">Thinking</option>
                  <option value="deep">Deep Thinking</option>
                </select>
              )}
            </div>

            {/* Devil's Advocate (Advocatus Diaboli) — optional adversarial critic */}
            <div className="devils-advocate-header" style={{ marginTop: '12px' }}>
              <div className="moderator-avatar" style={{ borderColor: '#DC2626' }}>
                <span className="moderator-initial" style={{ color: '#DC2626' }}>
                  {'\u2694'}
                </span>
              </div>
              <div className="moderator-info">
                <span className="moderator-name">Advocatus Diaboli</span>
                <span className="moderator-role">
                  Devil's Advocate
                  {devilsAdvocateActive && <span className="dual-role-badge" style={{ background: '#DC2626' }}>Active</span>}
                </span>
              </div>
              <button
                className="participant-info-btn"
                onClick={() => setInfoSoul({ id: 'devils-advocate', name: 'Advocatus Diaboli', color: '#DC2626' })}
                type="button"
                aria-label="Info about Advocatus Diaboli"
              >
                <IconInfo size={14} />
              </button>
              <button
                className={`dual-role-toggle ${devilsAdvocateActive ? 'active' : ''}`}
                onClick={() => setDevilsAdvocateActive(prev => !prev)}
                type="button"
                title="Enable the Advocatus Diaboli — an adversarial critic who challenges consensus, exposes hidden assumptions, and applies the Sanhedrin principle (if all agree, something is being missed)"
                style={devilsAdvocateActive ? { background: '#DC2626', borderColor: '#DC2626' } : {}}
              >
                {devilsAdvocateActive ? 'Enabled' : 'Disabled'}
              </button>
              {devilsAdvocateActive && availableModels && (
                <ModelSelector
                  value={modelAssignments['devils-advocate'] || 'anthropic/claude-sonnet-4.6'}
                  onChange={(modelId) => updateModel('devils-advocate', modelId)}
                  models={availableModels}
                  compact
                />
              )}
              {devilsAdvocateActive && thinkingMode !== 'off' && (
                <select
                  className="thinking-per-participant thinking-leadership"
                  value={getEffectiveThinking('devils-advocate')}
                  onChange={(e) => handleThinkingOverride('devils-advocate', e.target.value)}
                >
                  <option value="off">Thinking: Off</option>
                  <option value="thinking">Thinking</option>
                  <option value="deep">Deep Thinking</option>
                </select>
              )}
            </div>
          </div>

          {/* AI Capabilities — Thinking + Web Search */}
          <div className="ai-capabilities-section" style={{ marginTop: '16px' }}>
            <div className="ai-cap-header">
              <span className="section-label" style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)' }}>AI Capabilities</span>
            </div>
            <div className="ai-cap-toggles">
              <div className="ai-cap-toggle">
                <div className="ai-cap-info">
                  <span className="ai-cap-name">Thinking Mode</span>
                  <select
                    className="ai-cap-select"
                    value={thinkingMode}
                    onChange={(e) => handleThinkingModeChange(e.target.value)}
                  >
                    <option value="off">Off</option>
                    <option value="thinking">Thinking</option>
                    <option value="deep">Deep Thinking</option>
                  </select>
                  <span className="ai-cap-desc">
                    {thinkingMode !== 'off'
                      ? 'Baseline for all. Fine-tune per participant in Model Assignment.'
                      : 'Reasoning for Claude, GPT-5, Gemini, Grok'}
                  </span>
                  {hasThinkingOverrides && (
                    <span className="ai-cap-desc ai-cap-override-count">
                      {Object.keys(thinkingOverrides).length} override{Object.keys(thinkingOverrides).length !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>
              <label className="ai-cap-toggle">
                <input
                  type="checkbox"
                  checked={enableWebSearch}
                  onChange={(e) => setEnableWebSearch(e.target.checked)}
                />
                <div className="ai-cap-info">
                  <span className="ai-cap-name">Web Search</span>
                  <span className="ai-cap-desc">Live internet + X.com access for all participants</span>
                </div>
              </label>
            </div>
          </div>

          {/* Soul Upload Modal */}
          {showUploadModal && (
            <div className="upload-modal-overlay" onClick={() => setShowUploadModal(false)}>
              <div className="upload-modal" onClick={e => e.stopPropagation()}>
                <h3 className="upload-modal-title">Upload Soul Document</h3>
                <p className="upload-modal-desc">
                  Upload a .md soul document to add a new persona to the chamber.
                  The system will extract the name and register it automatically.
                </p>

                <div className="upload-field">
                  <label className="upload-field-label">Team</label>
                  <select
                    className="upload-select"
                    value={uploadTeam}
                    onChange={e => setUploadTeam(e.target.value)}
                  >
                    <option value="marketing">Marketing & Strategy</option>
                    <option value="design">Design & Visual</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>

                <div className="upload-field">
                  <label className="upload-field-label">Color</label>
                  <div className="upload-color-grid">
                    {UPLOAD_COLORS.map(c => (
                      <button
                        key={c}
                        className={`upload-color-swatch ${uploadColor === c ? 'selected' : ''}`}
                        style={{ background: c }}
                        onClick={() => setUploadColor(c)}
                        type="button"
                      />
                    ))}
                  </div>
                </div>

                <div className="upload-actions">
                  <button
                    className="gc-btn gc-btn-secondary"
                    onClick={() => setShowUploadModal(false)}
                    type="button"
                  >
                    Cancel
                  </button>
                  <button
                    className="gc-btn gc-btn-primary"
                    onClick={() => soulFileInputRef.current?.click()}
                    disabled={isUploading}
                    type="button"
                  >
                    {isUploading ? 'Uploading...' : 'Choose File & Upload'}
                  </button>
                  <input
                    ref={soulFileInputRef}
                    type="file"
                    accept=".md"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      if (e.target.files[0]) handleSoulUpload(e.target.files[0]);
                      e.target.value = '';
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Project Files — unified upload: briefs, references, images, PDF, ZIP */}
        <section className="launcher-section">
          <label className="gc-label">
            Project Files
            <HelpTooltip text="Upload any project material: brief documents (.md, .txt), reference websites (.html), images (.png, .jpg, .svg), PDFs, or ZIP archives. Text files (.md, .txt) will also auto-fill the brief above. All extracted text is sent as context to the AI participants." position="right" />
          </label>
          <div className="ref-upload-area">
            <button
              className="brief-upload-btn"
              type="button"
              onClick={() => refFileInputRef.current?.click()}
            >
              <IconUpload size={12} />
              Upload Project File
            </button>
            <input
              ref={refFileInputRef}
              type="file"
              accept=".html,.htm,.zip,.png,.jpg,.jpeg,.gif,.svg,.webp,.pdf,.txt,.md,.css,.js,.json"
              style={{ display: 'none' }}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setUploadError(null);
                const ext = file.name.split('.').pop().toLowerCase();
                // Auto-fill brief textarea for text brief documents
                if (['md', 'txt', 'text', 'markdown'].includes(ext)) {
                  const reader = new FileReader();
                  reader.onload = (ev) => {
                    const content = ev.target.result;
                    if (!brief || brief.length === 0 || window.confirm(`Fill the brief with "${file.name}"? Your current brief text will be replaced.`)) {
                      setBrief(content);
                      setUploadedFileName(file.name);
                    }
                  };
                  reader.readAsText(file);
                }
                // Also upload to server for reference context extraction
                try {
                  const result = await api.uploadReference(file);
                  setReferenceFiles(prev => [...prev, result]);
                } catch (err) {
                  console.error('Failed to upload project file:', err);
                  setUploadError(err.message || 'Upload failed. Try a different file.');
                }
                e.target.value = '';
              }}
            />
            {uploadError && (
              <div className="ref-upload-error">
                {uploadError}
                <button
                  className="ref-upload-error-dismiss"
                  type="button"
                  onClick={() => setUploadError(null)}
                >&times;</button>
              </div>
            )}
            {referenceFiles.length > 0 && (
              <div className="ref-file-list">
                {referenceFiles.map(rf => {
                  const text = rf.extracted_text || '';
                  const charCount = text.length;
                  const isPlaceholder = text.startsWith('[') && text.includes('provided');
                  const quality = rf.extraction_quality || (charCount > 100 && !isPlaceholder ? 'full' : charCount > 0 && !isPlaceholder ? 'partial' : 'none');
                  const qualityColor = quality === 'full' ? '#10B981' : quality === 'partial' ? '#F59E0B' : '#EF4444';
                  const qualityLabel = quality === 'full' ? 'Extracted' : quality === 'partial' ? 'Partial' : 'No text';
                  return (
                    <div key={rf.id} className="ref-file-card">
                      <div className="ref-file-card-row">
                        {rf.type === 'image' && rf.files?.[0] && (
                          <img
                            src={api.getUploadUrl(rf.id, rf.files[0])}
                            alt={rf.filename}
                            className="ref-file-thumbnail"
                          />
                        )}
                        <span className="ref-file-dot" style={{ background: qualityColor }} title={qualityLabel} />
                        <span className="ref-file-name">{rf.filename || rf.type}</span>
                        <span className="ref-file-meta">
                          {charCount > 0 ? `${(charCount / 1000).toFixed(1)}k chars` : 'no text'}
                          {rf.was_truncated && ' (truncated)'}
                        </span>
                        <button
                          className="ref-file-remove"
                          type="button"
                          onClick={() => setReferenceFiles(prev => prev.filter(f => f.id !== rf.id))}
                        >
                          &times;
                        </button>
                      </div>
                      {quality !== 'full' && (
                        <div className="ref-file-warning">
                          {quality === 'none'
                            ? 'No text could be extracted. The LLM will not have access to this file\'s content.'
                            : 'Only partial text was extracted. Some content may be missing.'}
                        </div>
                      )}
                      {charCount > 0 && !isPlaceholder && (
                        <details className="ref-file-preview">
                          <summary className="ref-file-preview-toggle">Preview extracted text</summary>
                          <pre className="ref-file-preview-text">{text.slice(0, 800)}{text.length > 800 ? '...' : ''}</pre>
                        </details>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            {referenceFiles.some(rf => rf.files?.includes('index.html')) && (
              <div className="ref-preview">
                <iframe
                  src={api.getUploadUrl(referenceFiles.find(rf => rf.files?.includes('index.html')).id, 'index.html')}
                  title="Reference preview"
                  sandbox="allow-scripts allow-same-origin"
                  className="ref-iframe"
                />
              </div>
            )}
          </div>
        </section>

        {/* Model Configuration (shown when models are available and participants selected) */}
        {availableModels && selectedParticipants.length > 0 && (
          <section className="launcher-section">
            <label className="gc-label">
              Model Assignment
              <HelpTooltip text="Assign different AI models to each persona for cognitive diversity. Premium models cost more but provide deeper reasoning." position="right" />
            </label>
            <div className="model-assign-grid">
              {selectedParticipants.map(pid => {
                const soul = souls.find(s => s.id === pid);
                if (!soul) return null;
                return (
                  <div key={pid} className="model-assign-card">
                    <div className="model-assign-header">
                      <div
                        className="participant-avatar"
                        style={{ borderColor: soul.color, background: soul.color }}
                      >
                        <span className="participant-initial" style={{ color: 'var(--surface-0)' }}>
                          {(soul.name || '?')[0]}
                        </span>
                      </div>
                      <span className="model-assign-name">{soul.name}</span>
                      {thinkingOverrides[pid] && (
                        <span className="thinking-override-badge">
                          {thinkingOverrides[pid] === 'deep' ? 'Deep' : thinkingOverrides[pid] === 'thinking' ? 'Think' : 'Off'}
                        </span>
                      )}
                    </div>
                    <ModelSelector
                      value={modelAssignments[pid] || DEFAULT_MODELS[pid] || 'anthropic/claude-sonnet-4.6'}
                      onChange={(modelId) => updateModel(pid, modelId)}
                      models={availableModels}
                      compact
                    />
                    {thinkingMode !== 'off' && (
                      <select
                        className="thinking-per-participant"
                        value={getEffectiveThinking(pid)}
                        onChange={(e) => handleThinkingOverride(pid, e.target.value)}
                      >
                        <option value="off">Thinking: Off</option>
                        <option value="thinking">Thinking</option>
                        <option value="deep">Deep Thinking</option>
                      </select>
                    )}
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
          <div
            className={`brief-editor${isDragging ? ' dragging' : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <div className="brief-toolbar">
              <button
                className="brief-template-btn"
                type="button"
                onClick={() => {
                  if (!brief || brief.length === 0) {
                    setBrief(BRIEF_TEMPLATE);
                  } else if (window.confirm('Replace current brief with template? Your text will be lost.')) {
                    setBrief(BRIEF_TEMPLATE);
                  }
                }}
              >
                Load Template
              </button>
              {brief.length > 0 && (
                <button
                  className="brief-clear-btn"
                  type="button"
                  onClick={() => {
                    if (window.confirm('Clear the entire brief?')) {
                      setBrief('');
                      setUploadedFileName(null);
                    }
                  }}
                >
                  Clear
                </button>
              )}
              <span className="brief-char-count">
                {uploadedFileName && <span className="brief-file-badge">{uploadedFileName}</span>}
                {brief.length > 0 ? `${brief.length} chars` : 'Optional'}
              </span>
            </div>
            {isDragging && (
              <div className="brief-drop-overlay">
                <IconUpload size={32} />
                <span>Drop your brief file here</span>
                <span className="brief-drop-hint">.md, .txt supported</span>
              </div>
            )}
            <textarea
              className="gc-textarea launcher-brief"
              value={brief}
              onChange={(e) => { setBrief(e.target.value); setUploadedFileName(null); }}
              placeholder={`Describe your creative challenge here...\n\nTip: Click "Load Template" for a structured briefing guide, or upload project files below (briefs, references, PDFs, images, ZIPs).\n\nYou can also drag and drop a .md/.txt file here to fill the brief.\n\nOr just write freely — the council will work with whatever you give them.`}
              rows={10}
            />
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
          devilsAdvocateActive={devilsAdvocateActive}
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

      {/* Soul Info Card Modal */}
      {infoSoul && (
        <SoulInfoCard soul={infoSoul} onClose={() => setInfoSoul(null)} />
      )}
    </div>
  );
}
