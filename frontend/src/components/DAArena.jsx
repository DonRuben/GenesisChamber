import { useState, useEffect, useCallback } from 'react';
import { api } from '../api';
import './DAArena.css';

const RATINGS = [
  { key: 'brilliant', label: 'Brilliant', icon: '\u2728' },
  { key: 'effective', label: 'Effective', icon: '\u2705' },
  { key: 'weak', label: 'Weak', icon: '\uD83D\uDCA4' },
  { key: 'unfair', label: 'Unfair', icon: '\u26A1' },
];

export default function DAArena({ simId, onClose }) {
  const [interactions, setInteractions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [mode, setMode] = useState('focus'); // 'focus' or 'overview'
  const [loading, setLoading] = useState(true);
  const [trainingReport, setTrainingReport] = useState(null);
  const [suggestions, setSuggestions] = useState('');
  const [showReport, setShowReport] = useState(false);

  // Load interactions on mount
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        // Try loading existing interactions first
        let data = await api.getDAInteractions(simId);
        if (!data.interactions || data.interactions.length === 0) {
          // Extract fresh from simulation
          data = await api.extractDAInteractions(simId);
        }
        setInteractions(data.interactions || []);
      } catch (err) {
        console.error('Failed to load DA interactions:', err);
      }
      setLoading(false);
    }
    load();
  }, [simId]);

  // Keyboard shortcuts
  useEffect(() => {
    if (mode !== 'focus') return;

    function handleKey(e) {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        setFlipped(f => !f);
      } else if (e.key === 'ArrowLeft') {
        goBack();
      } else if (e.key === 'ArrowRight') {
        goForward();
      } else if (e.key === '1') {
        handleRate('brilliant');
      } else if (e.key === '2') {
        handleRate('effective');
      } else if (e.key === '3') {
        handleRate('weak');
      } else if (e.key === '4') {
        handleRate('unfair');
      }
    }

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  });

  const current = interactions[currentIndex] || null;
  const reviewed = interactions.filter(i => i.reviewed).length;
  const total = interactions.length;
  const progress = total > 0 ? (reviewed / total) * 100 : 0;

  const goBack = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(i => i - 1);
      setFlipped(false);
    }
  }, [currentIndex]);

  const goForward = useCallback(() => {
    if (currentIndex < interactions.length - 1) {
      setCurrentIndex(i => i + 1);
      setFlipped(false);
    }
  }, [currentIndex, interactions.length]);

  const handleRate = useCallback(async (rating) => {
    if (!current) return;
    try {
      await api.rateDAInteraction(simId, current.id, rating);
      setInteractions(prev => prev.map((item, idx) =>
        idx === currentIndex
          ? { ...item, rating, reviewed: true, reviewed_at: new Date().toISOString() }
          : item
      ));
      // Auto-advance to next unreviewed
      const nextUnreviewed = interactions.findIndex((item, idx) =>
        idx > currentIndex && !item.reviewed
      );
      if (nextUnreviewed !== -1) {
        setTimeout(() => {
          setCurrentIndex(nextUnreviewed);
          setFlipped(false);
        }, 300);
      }
    } catch (err) {
      console.error('Failed to rate interaction:', err);
    }
  }, [current, currentIndex, interactions, simId]);

  const loadTrainingReport = async () => {
    try {
      const [report, sugg] = await Promise.all([
        api.getDATraining(simId),
        api.getDASuggestions(simId),
      ]);
      setTrainingReport(report);
      setSuggestions(sugg.suggestions || '');
      setShowReport(true);
    } catch (err) {
      console.error('Failed to load training report:', err);
    }
  };

  const scoreClass = (score) => {
    if (score >= 7) return 'high';
    if (score >= 5) return 'mid';
    return 'low';
  };

  if (loading) {
    return (
      <div className="da-arena">
        <div className="da-empty">Loading DA interactions...</div>
      </div>
    );
  }

  if (total === 0) {
    return (
      <div className="da-arena">
        <div className="da-empty">
          No Devil's Advocate interactions found. Was the DA enabled for this simulation?
        </div>
        {onClose && (
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <button className="gc-btn gc-btn-ghost" onClick={onClose}>Close</button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="da-arena">
      {/* Header */}
      <div className="da-header">
        <h2>DA <span>Arena</span></h2>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div className="da-mode-toggle">
            <button
              className={`da-mode-btn ${mode === 'focus' ? 'active' : ''}`}
              onClick={() => setMode('focus')}
            >
              Focus
            </button>
            <button
              className={`da-mode-btn ${mode === 'overview' ? 'active' : ''}`}
              onClick={() => setMode('overview')}
            >
              Overview
            </button>
          </div>
          {onClose && (
            <button className="gc-btn gc-btn-ghost" onClick={onClose} style={{ padding: '6px 12px' }}>
              Close
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="da-progress">
        <div className="da-progress-bar">
          <div className="da-progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <div className="da-progress-label">
          <span>{reviewed} of {total} reviewed</span>
          <span>{Math.round(progress)}%</span>
        </div>
      </div>

      {/* Focus Mode */}
      {mode === 'focus' && current && (
        <div className="da-focus">
          {/* Navigation */}
          <div className="da-focus-nav">
            <button className="da-nav-btn" onClick={goBack} disabled={currentIndex === 0}>
              &#8592;
            </button>
            <span className="da-focus-counter">{currentIndex + 1} / {total}</span>
            <button className="da-nav-btn" onClick={goForward} disabled={currentIndex >= total - 1}>
              &#8594;
            </button>
          </div>

          {/* Flashcard */}
          <div className="da-flashcard-container" onClick={() => setFlipped(f => !f)}>
            <div className={`da-flashcard ${flipped ? 'flipped' : ''}`}>
              {/* Front: DA Attack */}
              <div className="da-flashcard-front">
                <div className="da-card-header">
                  <span className="da-round-badge">R{current.round_num}</span>
                  <span className="da-card-persona">{current.concept_persona}</span>
                  <span className={`da-card-score ${scoreClass(current.da_score)}`}>
                    {current.da_score}/10
                  </span>
                </div>
                <div className="da-card-body">
                  <div className="da-section-title">Fatal Flaw</div>
                  <div className="da-fatal-flaw">
                    {current.da_fatal_flaw || 'No fatal flaw identified'}
                  </div>

                  {current.da_weaknesses && current.da_weaknesses.length > 0 && (
                    <>
                      <div className="da-section-title">Weaknesses</div>
                      <ul className="da-weakness-list">
                        {current.da_weaknesses.map((w, i) => <li key={i}>{w}</li>)}
                      </ul>
                    </>
                  )}

                  {current.da_one_change && (
                    <>
                      <div className="da-section-title">Demanded Change</div>
                      <div className="da-demand">{current.da_one_change}</div>
                    </>
                  )}

                  <div className="da-flip-hint">
                    {current.defense_text ? 'Tap to see defense' : 'Tap to flip'}
                  </div>
                </div>
              </div>

              {/* Back: Defense + Verdict */}
              <div className="da-flashcard-back">
                <div className="da-card-header">
                  <span className="da-round-badge" style={{ background: 'rgba(0,217,255,0.12)', color: 'var(--gc-cyan)' }}>
                    R{current.round_num}
                  </span>
                  <span className="da-card-persona">{current.concept_persona}</span>
                  <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-data)', fontSize: 11, color: 'var(--gc-cyan)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                    Defense
                  </span>
                </div>
                <div className="da-card-body">
                  {current.defense_text ? (
                    <>
                      <div className="da-section-title defense">Creative's Defense</div>
                      <div className="da-defense-text">{current.defense_text}</div>
                    </>
                  ) : current.creative_response ? (
                    <>
                      <div className="da-section-title defense">Creative's Response (from evolution)</div>
                      <div className="da-defense-text">{current.creative_response}</div>
                    </>
                  ) : (
                    <div style={{ color: 'var(--text-muted)', padding: '16px 0', textAlign: 'center', fontFamily: 'var(--font-data)' }}>
                      No defense recorded
                    </div>
                  )}

                  {current.da_verdict && (
                    <div className={`da-verdict-box ${current.da_verdict.toLowerCase().includes('accepted') ? 'accepted' : 'insufficient'}`}>
                      <strong>DA Verdict:</strong> {current.da_verdict}
                      {current.da_verdict_details && (
                        <div style={{ marginTop: 4, fontSize: 12, opacity: 0.8 }}>{current.da_verdict_details}</div>
                      )}
                      {current.da_revised_score != null && (
                        <div style={{ marginTop: 4, fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                          Revised: {current.da_revised_score}/10
                        </div>
                      )}
                    </div>
                  )}

                  <div className="da-flip-hint">Tap to see attack</div>
                </div>
              </div>
            </div>
          </div>

          {/* Rating Buttons */}
          <div className="da-rating-row">
            {RATINGS.map(r => (
              <button
                key={r.key}
                className={`da-rating-btn ${r.key} ${current.rating === r.key ? 'selected' : ''}`}
                onClick={(e) => { e.stopPropagation(); handleRate(r.key); }}
              >
                <span className="da-rating-icon">{r.icon}</span>
                {r.label}
              </button>
            ))}
          </div>

          {/* Keyboard shortcuts */}
          <div className="da-shortcuts">
            <kbd>Space</kbd> flip &nbsp;
            <kbd>&larr;</kbd><kbd>&rarr;</kbd> navigate &nbsp;
            <kbd>1</kbd><kbd>2</kbd><kbd>3</kbd><kbd>4</kbd> rate
          </div>
        </div>
      )}

      {/* Overview Mode */}
      {mode === 'overview' && (
        <div className="da-overview">
          {interactions.map((item, idx) => (
            <div
              key={item.id}
              className={`da-overview-card ${item.reviewed ? 'rated' : ''}`}
              onClick={() => { setCurrentIndex(idx); setMode('focus'); setFlipped(false); }}
            >
              <div className="da-overview-top">
                <span className="da-round-badge">R{item.round_num}</span>
                <span className="da-overview-concept">{item.concept_name}</span>
                <span className={`da-card-score ${scoreClass(item.da_score)}`}>
                  {item.da_score}/10
                </span>
              </div>
              <div className="da-overview-flaw">
                {item.da_fatal_flaw || 'No fatal flaw'}
              </div>
              {item.rating && (
                <div className={`da-overview-rating ${item.rating}`}>
                  {item.rating}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Training Report Button & Panel */}
      {reviewed >= 3 && (
        <div style={{ textAlign: 'center', marginTop: 'var(--space-lg)' }}>
          {!showReport ? (
            <button className="gc-btn" onClick={loadTrainingReport}>
              Generate Training Report ({reviewed} reviewed)
            </button>
          ) : trainingReport && (
            <div className="da-training-report">
              <h3>Training Report</h3>
              <div className="da-stats-row">
                <div className="da-stat">
                  <div className="da-stat-value">{Math.round(trainingReport.effectiveness_score * 100)}%</div>
                  <div className="da-stat-label">Effectiveness</div>
                </div>
                <div className="da-stat">
                  <div className="da-stat-value">{Math.round(trainingReport.response_rate * 100)}%</div>
                  <div className="da-stat-label">Response Rate</div>
                </div>
                <div className="da-stat">
                  <div className="da-stat-value">{trainingReport.reviewed_interactions}/{trainingReport.total_interactions}</div>
                  <div className="da-stat-label">Reviewed</div>
                </div>
              </div>

              {suggestions && (
                <>
                  <h3 style={{ marginTop: 'var(--space-md)' }}>Soul Refinement Suggestions</h3>
                  <div className="da-suggestions">{suggestions}</div>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
