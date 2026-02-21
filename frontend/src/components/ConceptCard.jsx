import { useState } from 'react';
import { IconCopy, IconCheck } from './Icons';
import { conceptToMarkdown, copyToClipboard } from '../utils/clipboard';
import CopyButton from './CopyButton';
import './ConceptCard.css';

const STATUS_MAP = {
  active: { label: 'Active', cls: 'gc-badge-green' },
  eliminated: { label: 'Eliminated', cls: 'gc-badge-red' },
  merged: { label: 'Merged', cls: 'gc-badge-purple' },
  winner: { label: 'Winner', cls: 'gc-badge-gold' },
  runner_up: { label: 'Runner-up', cls: 'gc-badge-blue' },
};

function scoreColor(score) {
  if (score >= 7) return 'var(--status-success)';
  if (score >= 5) return 'var(--gc-gold)';
  return 'var(--status-error)';
}

function ScoreHistory({ scores }) {
  const entries = Object.entries(scores || {}).sort(([a], [b]) => Number(a) - Number(b));
  if (entries.length === 0) return null;

  return (
    <div className="cc-score-history">
      {entries.map(([round, score]) => (
        <div key={round} className="cc-score-pip">
          <span className="cc-score-pip-label">R{round}</span>
          <span className="cc-score-pip-bar">
            <span
              className="cc-score-pip-fill"
              style={{
                width: `${(score / 10) * 100}%`,
                background: scoreColor(score),
              }}
            />
          </span>
          <span className="cc-score-pip-val" style={{ color: scoreColor(score) }}>
            {score.toFixed(1)}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function ConceptCard({ concept, showDetails = false }) {
  const [expanded, setExpanded] = useState(showDetails);
  const [copied, setCopied] = useState(false);
  const latestScore = concept.scores ? Object.values(concept.scores).pop() : null;
  const status = STATUS_MAP[concept.status] || STATUS_MAP.active;
  const isWinner = concept.status === 'winner';
  const isEliminated = concept.status === 'eliminated';

  const handleCopy = async (e) => {
    e.stopPropagation();
    await copyToClipboard(conceptToMarkdown(concept));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`cc-card ${isWinner ? 'cc-card-winner' : ''} ${isEliminated ? 'cc-card-eliminated' : ''}`}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="cc-indicator" style={{ background: concept.color || 'var(--text-muted)' }} />

      <div className="cc-body">
        {/* Header row */}
        <div className="cc-header">
          <div className="cc-header-left">
            <div
              className="cc-avatar"
              style={{ borderColor: concept.color || 'var(--text-muted)', color: concept.color || 'var(--text-muted)' }}
            >
              {(concept.persona_name || '?')[0]}
            </div>
            <div>
              <div className="cc-name">{concept.name || 'Untitled'}</div>
              <div className="cc-persona">
                by {concept.persona_name}
                {concept.round_created && <span className="cc-round-tag"> · R{concept.round_created}</span>}
              </div>
            </div>
          </div>
          <div className="cc-header-right">
            <button className="cc-copy-btn" onClick={handleCopy} title="Copy as Markdown">
              {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
            </button>
            {latestScore != null && (
              <div className="cc-score" style={{ color: scoreColor(latestScore) }}>
                {latestScore.toFixed(1)}
              </div>
            )}
            <span className={`gc-badge ${status.cls}`}>{status.label}</span>
          </div>
        </div>

        {/* Tagline */}
        {concept.tagline && <div className="cc-tagline">{concept.tagline}</div>}

        {/* Core idea */}
        {concept.idea && <div className="cc-idea">{concept.idea}</div>}

        {/* Headline + Subhead (always shown for first impression) */}
        {concept.headline && (
          <div className="cc-headline-block">
            <div className="cc-headline">{concept.headline}</div>
            {concept.subhead && <div className="cc-subhead">{concept.subhead}</div>}
          </div>
        )}

        {/* Expanded details */}
        {expanded && (
          <div className="cc-details">
            {concept.body_copy && (
              <div className="cc-section">
                <div className="cc-section-label">Body Copy</div>
                <div className="cc-body-copy">{concept.body_copy}</div>
              </div>
            )}

            {concept.visual_direction && (
              <div className="cc-section">
                <div className="cc-section-label">Visual Direction</div>
                <div className="cc-visual-text">{concept.visual_direction}</div>
              </div>
            )}

            {concept.color_mood && (
              <div className="cc-section cc-section-inline">
                <div className="cc-section-label">Color & Mood</div>
                <div className="cc-color-mood">{concept.color_mood}</div>
              </div>
            )}

            {concept.rationale && (
              <div className="cc-section">
                <div className="cc-section-label">Rationale</div>
                <div className="cc-rationale">{concept.rationale}</div>
              </div>
            )}

            {concept.image_prompt && (
              <div className="cc-section">
                <div className="cc-section-label">Image Prompt</div>
                <div className="cc-prompt-text gc-copyable">
                  {concept.image_prompt}
                  <CopyButton text={concept.image_prompt} />
                </div>
              </div>
            )}

            {concept.video_prompt && (
              <div className="cc-section">
                <div className="cc-section-label">Video Prompt</div>
                <div className="cc-prompt-text gc-copyable">
                  {concept.video_prompt}
                  <CopyButton text={concept.video_prompt} />
                </div>
              </div>
            )}

            {concept.evolution_notes && (
              <div className="cc-evolution">
                <span className="cc-evolution-label">Evolution:</span> {concept.evolution_notes}
              </div>
            )}

            <ScoreHistory scores={concept.scores} />
          </div>
        )}

        {/* Expand hint */}
        <div className="cc-expand-hint">
          {expanded ? 'Click to collapse' : 'Click to expand'}
        </div>
      </div>
    </div>
  );
}
