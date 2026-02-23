// ─────────────────────────────────────────────────────────
// GENESIS CHAMBER V4 — DATA TRANSFORMERS
// Backend SimulationState → V4 MOCK_SIMULATION shape
// ─────────────────────────────────────────────────────────

import { T } from '../design/tokens';

const PERSONA_COLORS = {
  'david-ogilvy': '#F59E0B', 'claude-hopkins': '#3B82F6', 'leo-burnett': '#10B981',
  'mary-wells-lawrence': '#EC4899', 'gary-halbert': '#EF4444',
  'paul-rand': '#8B5CF6', 'paula-scher': '#F97316', 'saul-bass': '#DC2626',
  'susan-kare': '#06B6D4', 'rob-janoff': '#A3E635', 'tobias-van-schneider': '#D946EF',
  'elon-musk': '#1DA1F2', 'jeff-bezos': '#FF9900', 'warren-buffett': '#374151',
  'richard-branson': '#E11D48', 'dietrich-mateschitz': '#1E40AF',
  'steve-jobs': '#6B7280', 'jony-ive': '#9CA3AF', 'devils-advocate': '#DC2626',
};

function getPersonaColor(personaId) {
  return PERSONA_COLORS[personaId] || '#6B7280';
}

export function transformSimulationState(backend) {
  if (!backend) return null;

  const config = backend.config || {};
  const concepts = [];

  // Transform active concepts
  if (backend.concepts?.active) {
    backend.concepts.active.forEach((c) => {
      concepts.push(transformConcept(c, false));
    });
  }

  // Transform eliminated concepts
  if (backend.concepts?.eliminated) {
    backend.concepts.eliminated.forEach((c) => {
      concepts.push(transformConcept(c, true));
    });
  }

  // Build participants from config
  const participants = (config.participants || []).map((p) => {
    const concept = concepts.find((c) => c.personaId === p.id);
    return {
      id: p.id,
      name: p.name,
      model: p.model,
      modelColor: getPersonaColor(p.id),
      concept: concept?.name || null,
      score: concept?.score || 0,
      status: concept?.status || 'active',
    };
  });

  // Transform critiques from transcript
  const critiques = (backend.critiques || []).map((cr, i) => ({
    id: cr.id || `cr${i}`,
    conceptName: cr.concept_name || cr.conceptName || '',
    round: cr.round || 0,
    criticsCount: cr.critics_count || cr.criticsCount || 0,
    strengths: cr.strengths || [],
    weaknesses: cr.weaknesses || [],
    oneChange: cr.one_change || cr.oneChange || '',
  }));

  // Transform media
  const media = (backend.media || backend.generated_content || []).map((m, i) => ({
    id: m.id || `m${i}`,
    type: m.type || 'image',
    concept: m.concept_name || m.concept || '',
    creator: m.creator || m.persona || '',
    model: m.gen_model || m.model || '',
    modelColor: getPersonaColor(m.persona_id) || '#6B7280',
    prompt: m.prompt || '',
    status: m.status || 'surviving',
    score: m.score || 0,
    aspect: m.aspect || '4/5',
    duration: m.duration || null,
    url: m.url || m.file_path || null,
  }));

  // Stats
  const stats = backend.stats || {
    rounds: config.rounds || 0,
    totalConcepts: concepts.length,
    daAttacks: backend.da_interactions?.length || 0,
    imagesGenerated: media.filter((m) => m.type === 'image').length,
    videosGenerated: media.filter((m) => m.type === 'video').length,
  };

  const winner = concepts.find((c) => c.status === 'winner');

  return {
    id: backend.sim_id || backend.id,
    name: backend.name || config.name || 'Untitled Simulation',
    status: backend.status || 'complete',
    brief: config.brief || config.creative_brief || '',
    config: {
      preset: config.preset_type || config.preset || '',
      rounds: config.rounds || 0,
      stages: config.stages_per_round || 5,
      devils_advocate: config.devils_advocate ?? false,
      da_aggression: config.da_aggression || 'balanced',
    },
    concepts,
    critiques,
    participants,
    media,
    stats,
    winner: winner?.id || null,
    evaluator_assessment: backend.evaluator_assessment || null,
  };
}

function transformConcept(c, eliminated) {
  const scores = c.scores || {};
  const latestScore = scores.final || scores.evaluator || scores.peer || scores.initial || 0;

  return {
    id: c.id || c.concept_id,
    name: c.name || c.concept_name || 'Untitled',
    persona: c.persona_name || c.persona || '',
    personaId: c.persona_id || '',
    model: c.model || '',
    modelColor: getPersonaColor(c.persona_id),
    status: eliminated ? 'eliminated' : (c.is_winner ? 'winner' : 'surviving'),
    score: latestScore,
    headline: c.headline || '',
    tagline: c.tagline || '',
    idea: c.idea || c.description || '',
    visual_direction: c.visual_direction || '',
    image_prompt: c.image_prompt || '',
    strengths: c.strengths || [],
    weaknesses: c.weaknesses || [],
    round: c.current_round || c.round || 0,
    eliminated,
    eliminatedRound: eliminated ? (c.eliminated_round || c.round) : null,
  };
}

export function transformDAInteraction(backend) {
  if (!backend) return null;

  return {
    id: backend.id || backend.interaction_id,
    round: backend.round || 0,
    concept: {
      name: backend.concept_name || '',
      persona: backend.persona_name || '',
      model: backend.model || '',
      modelColor: getPersonaColor(backend.persona_id),
    },
    attack: {
      da_score: backend.da_score || backend.attack?.da_score || 0,
      severity: backend.severity || backend.attack?.severity || 0,
      persona: backend.da_persona || backend.attack?.persona || 'skeptic',
      fatal_flaw: backend.fatal_flaw || backend.attack?.fatal_flaw || '',
      weaknesses: backend.weaknesses || backend.attack?.weaknesses || [],
      one_change: backend.one_change || backend.attack?.one_change || '',
    },
    defense: {
      text: backend.defense_text || backend.defense?.text || null,
      submitted: !!(backend.defense_text || backend.defense?.text),
    },
    verdict: {
      status: backend.verdict_status || backend.verdict?.status || 'no_defense',
      label: backend.verdict_label || backend.verdict?.label || '',
      details: backend.verdict_details || backend.verdict?.details || null,
      revised_score: backend.revised_score || backend.verdict?.revised_score || 0,
    },
    rating: backend.rating || null,
    reviewed: !!backend.rating,
  };
}
