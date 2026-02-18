import { useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { getDisplayName, getProviderName } from '../utils/modelDisplayNames';
import './Stage1.css';

const TAB_COLORS = [
  'var(--stage-create)',
  'var(--gc-cyan)',
  'var(--gc-magenta)',
  'var(--gc-gold)',
  'var(--gc-purple)',
  'var(--stage-critique)',
  'var(--stage-refine)',
  'var(--stage-present)',
];

function getTabColor(index) {
  return TAB_COLORS[index % TAB_COLORS.length];
}

function countWords(text) {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export default function Stage1({ responses }) {
  const [activeTab, setActiveTab] = useState(0);
  const [compareMode, setCompareMode] = useState(false);
  const [compareLeft, setCompareLeft] = useState(0);
  const [compareRight, setCompareRight] = useState(1);

  const wordCounts = useMemo(() => {
    if (!responses) return [];
    return responses.map((r) => countWords(r.response));
  }, [responses]);

  if (!responses || responses.length === 0) {
    return null;
  }

  const canCompare = responses.length >= 2;

  const renderModelBadge = (resp, index) => {
    const color = getTabColor(index);
    return (
      <div className="s1-model-badge" style={{ '--badge-color': color }}>
        <span className="s1-model-badge-dot" />
        <span className="s1-model-badge-provider">{getProviderName(resp.model)}</span>
        <span className="s1-model-badge-name">{getDisplayName(resp.model)}</span>
      </div>
    );
  };

  const renderWordCount = (index) => (
    <span className="s1-word-count">{wordCounts[index].toLocaleString()} words</span>
  );

  const renderResponsePanel = (resp, index) => (
    <div className="s1-response-panel" key={index}>
      <div className="s1-response-header">
        {renderModelBadge(resp, index)}
        {renderWordCount(index)}
      </div>
      <div className="s1-response-body markdown-content">
        <ReactMarkdown>{resp.response}</ReactMarkdown>
      </div>
    </div>
  );

  return (
    <div className="stage stage1">
      {/* ── Header ── */}
      <div className="s1-header">
        <div className="s1-header-left">
          <div className="s1-stage-indicator">
            <span className="s1-stage-dot" />
            <span className="s1-stage-label">STAGE 1</span>
          </div>
          <h3 className="s1-title">Individual Responses</h3>
          <p className="s1-subtitle">{responses.length} models responded</p>
        </div>
        <div className="s1-header-right">
          {canCompare && (
            <button
              className={`s1-compare-toggle ${compareMode ? 'active' : ''}`}
              onClick={() => setCompareMode(!compareMode)}
              title="Compare two responses side by side"
            >
              <svg
                className="s1-compare-icon"
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
              >
                <rect x="1" y="2" width="5.5" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
                <rect x="9.5" y="2" width="5.5" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
              </svg>
              Compare
            </button>
          )}
        </div>
      </div>

      {/* ── Single View ── */}
      {!compareMode && (
        <>
          <div className="s1-tabs" role="tablist">
            {responses.map((resp, index) => {
              const color = getTabColor(index);
              const isActive = activeTab === index;
              return (
                <button
                  key={index}
                  role="tab"
                  aria-selected={isActive}
                  className={`s1-tab ${isActive ? 'active' : ''}`}
                  style={{ '--tab-color': color }}
                  onClick={() => setActiveTab(index)}
                >
                  <span className="s1-tab-indicator" />
                  <span className="s1-tab-content">
                    <span className="s1-tab-provider">{getProviderName(resp.model)}</span>
                    <span className="s1-tab-name">{getDisplayName(resp.model)}</span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="s1-content" role="tabpanel">
            {renderResponsePanel(responses[activeTab], activeTab)}
          </div>
        </>
      )}

      {/* ── Compare View ── */}
      {compareMode && (
        <div className="s1-compare-view">
          <div className="s1-compare-controls">
            <div className="s1-compare-select-group">
              <label className="s1-compare-label">Left</label>
              <select
                className="s1-compare-select"
                value={compareLeft}
                onChange={(e) => setCompareLeft(Number(e.target.value))}
              >
                {responses.map((resp, i) => (
                  <option key={i} value={i}>
                    {getDisplayName(resp.model)}
                  </option>
                ))}
              </select>
            </div>
            <span className="s1-compare-vs">vs</span>
            <div className="s1-compare-select-group">
              <label className="s1-compare-label">Right</label>
              <select
                className="s1-compare-select"
                value={compareRight}
                onChange={(e) => setCompareRight(Number(e.target.value))}
              >
                {responses.map((resp, i) => (
                  <option key={i} value={i}>
                    {getDisplayName(resp.model)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="s1-compare-grid">
            <div className="s1-compare-column">
              {renderResponsePanel(responses[compareLeft], compareLeft)}
            </div>
            <div className="s1-compare-divider" />
            <div className="s1-compare-column">
              {renderResponsePanel(responses[compareRight], compareRight)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
