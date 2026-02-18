import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { getDisplayName } from '../utils/modelDisplayNames';
import './Stage2.css';

function deAnonymizeText(text, labelToModel) {
  if (!labelToModel) return text;

  let result = text;
  Object.entries(labelToModel).forEach(([label, model]) => {
    const name = getDisplayName(model);
    result = result.replace(new RegExp(label, 'g'), `**${name}**`);
  });
  return result;
}

function getRankMeta(index) {
  if (index === 0) return { className: 'rank-gold',   label: '#1' };
  if (index === 1) return { className: 'rank-silver', label: '#2' };
  if (index === 2) return { className: 'rank-bronze', label: '#3' };
  return { className: 'rank-default', label: `#${index + 1}` };
}

export default function Stage2({ rankings, labelToModel, aggregateRankings }) {
  const [activeTab, setActiveTab] = useState(0);
  const [rawExpanded, setRawExpanded] = useState(false);

  if (!rankings || rankings.length === 0) return null;

  const totalEntries = aggregateRankings ? aggregateRankings.length : 0;

  return (
    <div className="stage stage2">
      {/* ── Stage Header ── */}
      <div className="s2-header">
        <div className="s2-header__indicator">
          <span className="s2-header__dot" />
          <span className="s2-header__label">STAGE 2</span>
        </div>
        <h3 className="s2-header__title">Peer Rankings</h3>
        <p className="s2-header__subtitle">{rankings.length} evaluator{rankings.length !== 1 ? 's' : ''}</p>
      </div>

      {/* ── Aggregate Leaderboard (hero section) ── */}
      {aggregateRankings && aggregateRankings.length > 0 && (
        <div className="s2-leaderboard">
          <div className="s2-leaderboard__header">
            <h4 className="s2-leaderboard__title">Aggregate Rankings</h4>
            <span className="s2-leaderboard__badge">Street Cred</span>
          </div>
          <p className="s2-leaderboard__desc">
            Combined results across all peer evaluations. Lower average rank is better.
          </p>

          <div className="s2-leaderboard__list">
            {aggregateRankings.map((agg, index) => {
              const meta = getRankMeta(index);
              // Score bar: invert so rank 1 (best) gets widest bar
              const barPercent = totalEntries > 1
                ? ((totalEntries - index) / totalEntries) * 100
                : 100;

              return (
                <div key={index} className={`s2-leaderboard__entry ${meta.className}`}>
                  <span className="s2-leaderboard__position">{meta.label}</span>

                  <div className="s2-leaderboard__info">
                    <span className="s2-leaderboard__model">
                      {getDisplayName(agg.model)}
                    </span>

                    <div className="s2-leaderboard__bar-track">
                      <div
                        className="s2-leaderboard__bar-fill"
                        style={{ width: `${barPercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="s2-leaderboard__stats">
                    <span className="s2-leaderboard__score">
                      {agg.average_rank.toFixed(2)}
                    </span>
                    <span className="s2-leaderboard__votes">
                      {agg.rankings_count} vote{agg.rankings_count !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Raw Evaluations (collapsible) ── */}
      <div className="s2-raw">
        <button
          className={`s2-raw__toggle ${rawExpanded ? 's2-raw__toggle--open' : ''}`}
          onClick={() => setRawExpanded(prev => !prev)}
        >
          <svg className="s2-raw__chevron" viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
          <span>{rawExpanded ? 'Hide Raw Evaluations' : 'Show Raw Evaluations'}</span>
        </button>

        {rawExpanded && (
          <div className="s2-raw__content">
            <p className="s2-raw__desc">
              Each model evaluated all responses anonymized as Response&nbsp;A, B, C, etc.
              Model names are shown in <strong>bold</strong> for readability; the original evaluation used anonymous labels.
            </p>

            {/* Tabs */}
            <div className="s2-raw__tabs">
              {rankings.map((rank, index) => (
                <button
                  key={index}
                  className={`s2-raw__tab ${activeTab === index ? 's2-raw__tab--active' : ''}`}
                  onClick={() => setActiveTab(index)}
                >
                  {getDisplayName(rank.model)}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="s2-raw__panel">
              <div className="s2-raw__model-id">
                {rankings[activeTab].model}
              </div>

              <div className="s2-raw__markdown markdown-content">
                <ReactMarkdown>
                  {deAnonymizeText(rankings[activeTab].ranking, labelToModel)}
                </ReactMarkdown>
              </div>

              {/* Parsed ranking as numbered chips */}
              {rankings[activeTab].parsed_ranking &&
               rankings[activeTab].parsed_ranking.length > 0 && (
                <div className="s2-raw__parsed">
                  <span className="s2-raw__parsed-label">Extracted Ranking:</span>
                  <div className="s2-raw__chips">
                    {rankings[activeTab].parsed_ranking.map((label, i) => (
                      <span key={i} className="s2-raw__chip">
                        <span className="s2-raw__chip-num">{i + 1}</span>
                        <span className="s2-raw__chip-name">
                          {labelToModel && labelToModel[label]
                            ? getDisplayName(labelToModel[label])
                            : label}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
