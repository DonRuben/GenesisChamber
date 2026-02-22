// ─────────────────────────────────────────────────────────
// DA ARENA — Courtroom Layout (Main Orchestrator)
// Split panel: Prosecution (left) | Defense (right)
// Verdict Bar (bottom full-width)
// Right sidebar: threat score, aggression, challenge list
// No card flipping — simultaneous visibility
// ─────────────────────────────────────────────────────────

import { useEffect, useCallback } from 'react';
import { T, font } from '../../design/tokens';
import { IC } from '../../design/icons';
import { Tag, MonoLabel, ScoreRing, Dots, AggressionMeter } from '../../design/shared';
import { useArenaStore } from '../../stores/arenaStore';
import ProsecutionPanel from './ProsecutionPanel';
import DefensePanel from './DefensePanel';
import VerdictBar from './VerdictBar';
import TrainingReport, { computeStats } from './TrainingReport';

// ── Round Timeline ──
function RoundTimeline({ rounds, activeRound, onSelect, interactions }) {
  return (
    <div style={{ display: 'flex', gap: 2, marginBottom: 24 }}>
      {rounds.map(r => {
        const ct = interactions.filter(i => i.round === r).length;
        const active = activeRound === r;
        return (
          <button key={r} onClick={() => onSelect(active ? null : r)} style={{
            flex: 1, padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 4,
            background: active || !activeRound ? T.surface : 'transparent',
            border: `1px solid ${active ? T.borderHover : T.border}`, borderRadius: 6,
            borderLeft: `2px solid ${active ? T.magenta : 'transparent'}`,
            cursor: 'pointer', transition: 'all 0.13s',
          }}>
            <MonoLabel color={active ? T.magenta : T.textMuted} style={{ marginBottom: 0 }}>
              Round {r}
            </MonoLabel>
            <span style={{ fontSize: 11, fontFamily: font.mono, color: T.textSoft }}>
              {ct} challenge{ct !== 1 ? 's' : ''}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ── Sidebar Challenge List Item ──
function ListItem({ inter, active, onClick }) {
  const { attack: a, concept: c, verdict: v } = inter;
  return (
    <div onClick={onClick} style={{
      padding: '14px 16px', cursor: 'pointer',
      background: active ? T.surfaceRaised : 'transparent',
      borderLeft: `2px solid ${active ? T.magenta : 'transparent'}`,
      transition: 'all 0.13s',
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        marginBottom: 6,
      }}>
        <div style={{
          fontSize: 12, fontWeight: 600, color: T.text, lineHeight: 1.4,
          flex: 1, marginRight: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {c.name}
        </div>
        <Dots count={5} active={a.severity} color={a.severity >= 4 ? T.magenta : T.textMuted} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 6, height: 6, borderRadius: 3, background: c.modelColor, flexShrink: 0 }} />
        <span style={{ fontSize: 11, fontFamily: font.mono, color: T.textMuted }}>{c.model}</span>
        <span style={{ fontSize: 11, color: T.textMuted }}>·</span>
        <span style={{ fontSize: 9, fontFamily: font.mono, color: T.textMuted, letterSpacing: '0.08em' }}>
          R{inter.round}
        </span>
        <span style={{ flex: 1 }} />
        <span style={{
          fontSize: 12, fontFamily: font.mono, fontWeight: 600,
          color: v.revised_score >= 7 ? T.green : v.revised_score >= 4 ? T.gold : T.magenta,
        }}>
          {a.da_score}→{v.revised_score}
        </span>
      </div>
    </div>
  );
}

// ── Main Component ──
export default function DAArena() {
  const interactions = useArenaStore(s => s.interactions);
  const ratings = useArenaStore(s => s.ratings);
  const selectedIndex = useArenaStore(s => s.selectedIndex);
  const roundFilter = useArenaStore(s => s.roundFilter);
  const view = useArenaStore(s => s.view);
  const navigate = useArenaStore(s => s.navigate);
  const setRating = useArenaStore(s => s.setRating);
  const setRoundFilter = useArenaStore(s => s.setRoundFilter);
  const setView = useArenaStore(s => s.setView);

  const filtered = roundFilter
    ? interactions.filter(i => i.round === roundFilter)
    : interactions;
  const cur = filtered[selectedIndex] || interactions[0];
  const total = filtered.length;
  const stats = computeStats(interactions, ratings);
  const currentRating = cur ? (ratings[cur.id] ?? cur.rating) : null;

  const rate = useCallback((key) => {
    if (cur) setRating(cur.id, key);
  }, [cur, setRating]);

  // Keyboard navigation
  useEffect(() => {
    function handleKey(e) {
      if (view !== 'courtroom') return;
      if (e.key === 'ArrowLeft') { e.preventDefault(); navigate(-1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); navigate(1); }
      if (e.key === '1') rate('brilliant');
      if (e.key === '2') rate('effective');
      if (e.key === '3') rate('weak');
      if (e.key === '4') rate('unfair');
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [view, navigate, rate]);

  if (!cur) return null;

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      fontFamily: font.body, color: T.text, animation: 'fadeSlideUp 0.3s ease-out',
    }}>

      {/* Header */}
      <div style={{
        borderBottom: `1px solid ${T.border}`, padding: '14px 28px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontSize: 20, color: T.magenta }}>{IC.swords}</span>
          <MonoLabel color={T.textMuted} style={{ marginBottom: 0 }}>Devil's Advocate Arena</MonoLabel>
          <Tag color={T.magenta}>{interactions.length} CHALLENGES</Tag>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {[
            { k: 'courtroom', l: 'Courtroom' },
            { k: 'report', l: 'Report' },
          ].map(v => (
            <button key={v.k} onClick={() => setView(v.k)} style={{
              padding: '7px 16px', borderRadius: 5,
              fontSize: 11, fontFamily: font.mono, fontWeight: 500,
              letterSpacing: '0.04em', textTransform: 'uppercase', cursor: 'pointer',
              background: view === v.k ? T.surfaceRaised : 'transparent',
              color: view === v.k ? T.text : T.textMuted,
              border: `1px solid ${view === v.k ? T.borderHover : T.border}`,
              borderLeft: `2px solid ${view === v.k ? T.magenta : 'transparent'}`,
              transition: 'all 0.13s',
            }}>
              {v.l}
            </button>
          ))}
        </div>
      </div>

      {/* COURTROOM VIEW */}
      {view === 'courtroom' && (
        <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>

          {/* Center: Courtroom */}
          <div style={{
            flex: '1 1 60%', padding: '28px 32px',
            display: 'flex', flexDirection: 'column', overflowY: 'auto',
          }}>
            <RoundTimeline
              rounds={stats.rounds}
              activeRound={roundFilter}
              onSelect={setRoundFilter}
              interactions={interactions}
            />

            {/* Navigation */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
              <button
                onClick={() => navigate(-1)}
                disabled={selectedIndex === 0}
                style={{
                  background: 'transparent', border: `1px solid ${T.border}`,
                  borderRadius: 5, padding: '5px 10px',
                  cursor: selectedIndex === 0 ? 'not-allowed' : 'pointer',
                  color: selectedIndex === 0 ? T.textMuted : T.textSoft,
                  fontSize: 15, display: 'flex', alignItems: 'center',
                  opacity: selectedIndex === 0 ? 0.4 : 1,
                }}
              >
                {IC.arrowLeft}
              </button>
              <div style={{ flex: 1, textAlign: 'center' }}>
                <MonoLabel style={{ marginBottom: 2 }}>CHALLENGE {selectedIndex + 1} OF {total}</MonoLabel>
                <div style={{ fontSize: 14, fontWeight: 600, color: T.text }}>
                  {cur.concept.name}
                  <span style={{ color: T.textMuted, fontWeight: 400 }}> · {cur.concept.persona}</span>
                </div>
              </div>
              <button
                onClick={() => navigate(1)}
                disabled={selectedIndex === total - 1}
                style={{
                  background: 'transparent', border: `1px solid ${T.border}`,
                  borderRadius: 5, padding: '5px 10px',
                  cursor: selectedIndex === total - 1 ? 'not-allowed' : 'pointer',
                  color: selectedIndex === total - 1 ? T.textMuted : T.textSoft,
                  fontSize: 15, display: 'flex', alignItems: 'center',
                  opacity: selectedIndex === total - 1 ? 0.4 : 1,
                }}
              >
                {IC.arrowRight}
              </button>
            </div>

            {/* Split Panels: Prosecution | Defense */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
              <ProsecutionPanel attack={cur.attack} />
              <DefensePanel
                defense={cur.defense}
                concept={cur.concept}
                verdict={cur.verdict}
                currentRating={currentRating}
                onRate={rate}
              />
            </div>

            {/* Verdict Bar */}
            <VerdictBar attack={cur.attack} verdict={cur.verdict} />
          </div>

          {/* Right Sidebar */}
          <div style={{
            flex: '0 0 320px', borderLeft: `1px solid ${T.border}`,
            display: 'flex', flexDirection: 'column',
          }}>
            {/* Threat Score */}
            <div style={{
              padding: '24px 20px', borderBottom: `1px solid ${T.border}`,
              display: 'flex', alignItems: 'center', gap: 18,
            }}>
              <ScoreRing score={stats.threat} color={T.magenta} size={56} />
              <div>
                <MonoLabel style={{ marginBottom: 4 }}>THREAT SCORE</MonoLabel>
                <div style={{ fontSize: 13, color: T.textSoft }}>
                  {stats.strong} strong · {stats.partial} partial · {stats.insuf} insuf
                </div>
              </div>
            </div>

            {/* Aggression */}
            <div style={{ padding: '16px 20px', borderBottom: `1px solid ${T.border}` }}>
              <AggressionMeter severity={stats.avgSev} />
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: `1px solid ${T.border}` }}>
              {[
                { l: 'Defense Rate', v: stats.total > 0 ? `${Math.round(stats.defended / stats.total * 100)}%` : '—', c: T.green },
                { l: 'Top Concept', v: stats.conceptScores[0]?.name || '—', c: T.gold },
              ].map((s, i) => (
                <div key={s.l} style={{
                  padding: '14px 20px',
                  borderRight: i === 0 ? `1px solid ${T.border}` : 'none',
                }}>
                  <MonoLabel style={{ marginBottom: 4 }}>{s.l}</MonoLabel>
                  <div style={{ fontSize: 13, fontWeight: 600, color: s.c }}>{s.v}</div>
                </div>
              ))}
            </div>

            {/* Challenge List */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
              <div style={{ padding: '14px 20px 8px' }}>
                <MonoLabel>ALL CHALLENGES</MonoLabel>
              </div>
              {filtered.map((inter, i) => (
                <ListItem
                  key={inter.id}
                  inter={inter}
                  active={i === selectedIndex}
                  onClick={() => useArenaStore.setState({ selectedIndex: i })}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* REPORT VIEW */}
      {view === 'report' && (
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <TrainingReport stats={stats} interactions={interactions} ratings={ratings} />
        </div>
      )}
    </div>
  );
}
