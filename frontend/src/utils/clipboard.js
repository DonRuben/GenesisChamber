/**
 * Clipboard utilities — markdown formatters and copy-to-clipboard.
 */

/**
 * Format a concept as markdown.
 */
export function conceptToMarkdown(concept) {
  const lines = [];
  lines.push(`# ${concept.name || 'Untitled'}`);
  lines.push(`**By:** ${concept.persona_name || 'Unknown'}`);
  if (concept.status) lines.push(`**Status:** ${concept.status}`);
  if (concept.round_created) lines.push(`**Round:** ${concept.round_created}`);
  lines.push('');

  if (concept.tagline) {
    lines.push(`*${concept.tagline}*`);
    lines.push('');
  }

  if (concept.idea) {
    lines.push('## Idea');
    lines.push(concept.idea);
    lines.push('');
  }

  if (concept.headline) {
    lines.push('## Headline');
    lines.push(`**${concept.headline}**`);
    if (concept.subhead) lines.push(concept.subhead);
    lines.push('');
  }

  if (concept.body_copy) {
    lines.push('## Body Copy');
    lines.push(concept.body_copy);
    lines.push('');
  }

  if (concept.visual_direction) {
    lines.push('## Visual Direction');
    lines.push(concept.visual_direction);
    lines.push('');
  }

  if (concept.color_mood) {
    lines.push('## Color & Mood');
    lines.push(concept.color_mood);
    lines.push('');
  }

  if (concept.rationale) {
    lines.push('## Rationale');
    lines.push(concept.rationale);
    lines.push('');
  }

  if (concept.image_prompt) {
    lines.push('## Image Prompt');
    lines.push('```');
    lines.push(concept.image_prompt);
    lines.push('```');
    lines.push('');
  }

  if (concept.video_prompt) {
    lines.push('## Video Prompt');
    lines.push('```');
    lines.push(concept.video_prompt);
    lines.push('```');
    lines.push('');
  }

  if (concept.evolution_notes) {
    lines.push('## Evolution');
    lines.push(concept.evolution_notes);
    lines.push('');
  }

  if (concept.scores && Object.keys(concept.scores).length > 0) {
    lines.push('## Scores');
    for (const [round, score] of Object.entries(concept.scores).sort(([a], [b]) => Number(a) - Number(b))) {
      lines.push(`- Round ${round}: ${Number(score).toFixed(1)}/10`);
    }
    lines.push('');
  }

  return lines.join('\n');
}


/**
 * Format a critique as markdown.
 */
export function critiqueToMarkdown(critique) {
  const lines = [];
  lines.push(`### Critique by ${critique.critic_name || 'Anonymous'}`);
  lines.push(`**Concept:** ${critique.concept_label}`);
  lines.push(`**Score:** ${critique.score}/10`);
  lines.push('');

  if (critique.strengths?.length > 0) {
    lines.push('**Strengths:**');
    critique.strengths.forEach(s => lines.push(`- ${s}`));
    lines.push('');
  }

  if (critique.weaknesses?.length > 0) {
    lines.push('**Weaknesses:**');
    critique.weaknesses.forEach(w => lines.push(`- ${w}`));
    lines.push('');
  }

  if (critique.fatal_flaw) {
    lines.push(`**Fatal Flaw:** ${critique.fatal_flaw}`);
    lines.push('');
  }

  if (critique.one_change) {
    lines.push(`**One Change:** ${critique.one_change}`);
    lines.push('');
  }

  if (critique.would_champion) {
    lines.push(`**Would Champion:** ${critique.would_champion}`);
    lines.push('');
  }

  return lines.join('\n');
}


/**
 * Format a moderator direction as markdown.
 */
export function directionToMarkdown(direction) {
  const lines = [];
  lines.push(`# Moderator Direction — Round ${direction.round_num}`);
  lines.push(`**Moderator:** ${direction.moderator_name || 'Unknown'}`);
  lines.push('');

  if (direction.surviving_concepts?.length > 0) {
    lines.push('## Surviving Concepts');
    direction.surviving_concepts.forEach(c => {
      lines.push(`- **${c.name || c.id}**: ${c.reason || ''}`);
    });
    lines.push('');
  }

  if (direction.eliminated_concepts?.length > 0) {
    lines.push('## Eliminated Concepts');
    direction.eliminated_concepts.forEach(c => {
      lines.push(`- **${c.name || c.id}**: ${c.reason || ''}`);
    });
    lines.push('');
  }

  if (direction.merge_suggestions?.length > 0) {
    lines.push('## Merge Suggestions');
    direction.merge_suggestions.forEach(m => {
      lines.push(`- ${m.source || ''} -> ${m.target || ''}: ${m.reason || ''}`);
    });
    lines.push('');
  }

  if (direction.new_constraints?.length > 0) {
    lines.push('## New Constraints');
    direction.new_constraints.forEach(c => lines.push(`- ${c}`));
    lines.push('');
  }

  if (direction.direction_notes) {
    lines.push('## Direction Notes');
    lines.push(direction.direction_notes);
    lines.push('');
  }

  if (direction.one_more_thing) {
    lines.push('## One More Thing');
    lines.push(direction.one_more_thing);
    lines.push('');
  }

  return lines.join('\n');
}


/**
 * Copy text to clipboard with fallback for older browsers.
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for non-HTTPS or older browsers
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    return true;
  }
}
