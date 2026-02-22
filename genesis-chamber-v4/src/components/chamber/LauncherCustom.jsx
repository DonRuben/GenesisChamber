import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { font, motion } from '../../design/tokens';
import { IC } from '../../design/icons';
import { StepNav, Btn, MonoLabel, Toggle, Tag } from '../../design/shared';
import { useChamberStore } from '../../stores/chamberStore';
import { MOCK_TEAMS, MOCK_LEADERSHIP } from '../../data/mock';
import PersonaChip from './PersonaChip';
import LeaderCard from './LeaderCard';
import BriefInput from './BriefInput';
import { useTokens } from '../../hooks/useTokens';
import { useIsMobile } from '../../hooks/useMediaQuery';

export default function LauncherCustom() {
  const t = useTokens();
  const mobile = useIsMobile();
  const navigate = useNavigate();
  const {
    launchStep, nextStep, prevStep,
    selectedPersonas, togglePersona, selectAllTeam, deselectAllTeam,
    brief, setBrief, daEnabled, setDaEnabled, daAggression, setDaAggression,
    expandedTeam, setExpandedTeam, setLaunchMode,
  } = useChamberStore();

  const [daModel] = useState('grok-4');
  const count = selectedPersonas.size;

  const canProceed = () => {
    if (launchStep === 0) return count >= 3;
    if (launchStep === 1) return true;
    return brief.trim().length > 10;
  };

  const summary = [
    { label: 'Personas', value: count, color: count >= 3 ? t.green : t.magenta },
    { label: 'Rounds', value: count > 10 ? 8 : count > 6 ? 6 : 4 },
    { label: 'DA', value: daEnabled ? 'Enabled' : 'Off', color: daEnabled ? t.magenta : t.textMuted },
    { label: 'Est. Time', value: count > 10 ? '~90 min' : count > 6 ? '~45 min' : '~20 min' },
  ];

  const aggressionLevels = [
    { id: 'analytical', label: 'Analytical', color: t.cyan },
    { id: 'aggressive', label: 'Aggressive', color: t.flame },
    { id: 'ruthless', label: 'Ruthless', color: t.magenta },
  ];

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      maxWidth: 800, margin: '0 auto', width: '100%', padding: '24px 16px',
      animation: 'fadeSlideUp 0.3s ease-out',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 32,
      }}>
        <button
          onClick={() => launchStep === 0 ? setLaunchMode(null) : prevStep()}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 11, fontFamily: font.mono, color: t.textMuted,
          }}
        >
          <span style={{ fontSize: 14 }}>{IC.arrowLeft}</span> Back
        </button>
        <StepNav current={launchStep} total={3} labels={['Team', 'Leadership', 'Brief']} />
        <div style={{ width: 60 }} />
      </div>

      <div style={{ flex: 1, overflow: 'auto' }}>
        {/* Step 0: Team Selection */}
        {launchStep === 0 && (
          <div className="gc-enter-right" key={0} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <MonoLabel icon={IC.users} style={{ marginBottom: 0 }}>Select Personas</MonoLabel>
              <Tag color={count >= 3 ? t.green : t.magenta} label={`${count} / 16`} />
            </div>
            {MOCK_TEAMS.map((team) => {
              const isExpanded = expandedTeam === team.id || expandedTeam === null;
              const teamIds = team.personas.map((p) => p.id);
              const allSelected = teamIds.every((id) => selectedPersonas.has(id));
              return (
                <div key={team.id} style={{
                  border: `1px solid ${t.border}`, borderRadius: 8,
                  borderLeft: `2px solid ${team.color}`, overflow: 'hidden',
                }}>
                  <button
                    onClick={() => setExpandedTeam(team.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      width: '100%', padding: '12px 16px', cursor: 'pointer',
                      background: t.surface, border: 'none', textAlign: 'left',
                    }}
                  >
                    <span style={{ fontSize: 13, fontWeight: 600, color: t.text, flex: 1 }}>
                      {team.name}
                    </span>
                    <span style={{
                      fontSize: 9, fontFamily: font.mono, color: t.textMuted,
                    }}>
                      {teamIds.filter((id) => selectedPersonas.has(id)).length}/{team.personas.length}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        allSelected ? deselectAllTeam(teamIds) : selectAllTeam(teamIds);
                      }}
                      style={{
                        fontSize: 9, fontFamily: font.mono, color: team.color,
                        background: 'none', border: 'none', cursor: 'pointer',
                        padding: '2px 6px', textTransform: 'uppercase',
                      }}
                    >
                      {allSelected ? 'None' : 'All'}
                    </button>
                    <span style={{
                      fontSize: 14, color: t.textMuted,
                      transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)',
                      transition: `transform ${motion.duration.fast}`,
                    }}>{IC.chevDown}</span>
                  </button>
                  {isExpanded && (
                    <div style={{
                      display: 'grid', gridTemplateColumns: mobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(260px, 1fr))',
                      gap: 6, padding: '8px 12px 12px',
                    }}>
                      {team.personas.map((p) => (
                        <PersonaChip
                          key={p.id} persona={p} teamColor={team.color}
                          selected={selectedPersonas.has(p.id)}
                          onToggle={() => togglePersona(p.id)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Step 1: Leadership + DA */}
        {launchStep === 1 && (
          <div className="gc-enter-right" key={1} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <MonoLabel icon={IC.crown}>Leadership</MonoLabel>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10 }}>
              <LeaderCard role="Moderator" leader={MOCK_LEADERSHIP.moderator} />
              <LeaderCard role="Evaluator" leader={MOCK_LEADERSHIP.evaluator} />
            </div>

            <div style={{
              marginTop: 8, padding: 20, borderRadius: 8,
              background: t.surface, border: `1px solid ${t.border}`,
              borderLeft: `2px solid ${t.magenta}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                  <MonoLabel icon={IC.skull} color={t.magenta} style={{ marginBottom: 4 }}>
                    Devil&apos;s Advocate
                  </MonoLabel>
                  <p style={{ fontSize: 11, color: t.textSoft, margin: 0 }}>
                    Adversarial critique based on the Sanhedrin principle
                  </p>
                </div>
                <Toggle enabled={daEnabled} onChange={setDaEnabled} color={t.magenta} />
              </div>

              {daEnabled && (
                <div style={{
                  display: 'flex', flexDirection: 'column', gap: 12,
                  paddingTop: 12, borderTop: `1px solid ${t.border}`,
                  animation: 'fadeSlideUp 0.2s ease-out',
                }}>
                  <LeaderCard role="Devil's Advocate" leader={MOCK_LEADERSHIP.da} />
                  <div>
                    <MonoLabel style={{ marginBottom: 8 }}>Aggression Level</MonoLabel>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {aggressionLevels.map(({ id, label, color }) => (
                        <button
                          key={id}
                          onClick={() => setDaAggression(id)}
                          style={{
                            flex: 1, padding: '8px 12px', borderRadius: 6, cursor: 'pointer',
                            background: daAggression === id ? `${color}1a` : t.surfaceRaised,
                            border: `1px solid ${daAggression === id ? color : t.border}`,
                            fontSize: 11, fontFamily: font.mono, fontWeight: 600,
                            color: daAggression === id ? color : t.textMuted,
                            textTransform: 'uppercase', letterSpacing: '0.06em',
                          }}
                        >{label}</button>
                      ))}
                    </div>
                  </div>
                  <div style={{
                    fontSize: 9, fontFamily: font.mono, color: t.textMuted,
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                    Model: <span style={{ color: t.magenta }}>{daModel}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Brief */}
        {launchStep === 2 && (
          <div className="gc-enter-right" key={2}>
            <BriefInput brief={brief} onBriefChange={setBrief} summary={summary} />
          </div>
        )}
      </div>

      <div style={{
        display: 'flex', justifyContent: 'flex-end', gap: 8,
        paddingTop: 16, borderTop: `1px solid ${t.border}`, marginTop: 24,
        position: mobile ? 'sticky' : 'relative',
        bottom: mobile ? 0 : undefined,
        background: mobile ? t.bg : 'transparent',
        zIndex: mobile ? 10 : undefined,
      }}>
        {launchStep < 2 ? (
          <Btn color={t.cyan} disabled={!canProceed()} onClick={nextStep}>
            Continue <span style={{ fontSize: 14 }}>{IC.arrowRight}</span>
          </Btn>
        ) : (
          <Btn color={t.gold} large disabled={!canProceed()} onClick={() => navigate('/sim/mock-1')}>
            <span style={{ fontSize: 14 }}>{IC.rocket}</span> Launch Simulation
          </Btn>
        )}
      </div>
    </div>
  );
}
