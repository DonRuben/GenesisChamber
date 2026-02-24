import { useEffect } from 'react';
import { font } from '../../design/tokens';
import { useTokens } from '../../hooks/useTokens';
import { useModelLookup } from '../../hooks/useModels';
import { SOUL_BIOS } from '../../data/soulBios';
import { MOCK_TEAMS, MOCK_LEADERSHIP } from '../../data/mock';

// Team color lookup by soul ID
const SOUL_TEAM_COLORS = {};
const MARKETING_IDS = ['david-ogilvy', 'claude-hopkins', 'leo-burnett', 'mary-wells-lawrence', 'gary-halbert'];
const DESIGN_IDS = ['paul-rand', 'paula-scher', 'saul-bass', 'susan-kare', 'rob-janoff', 'tobias-van-schneider', 'jony-ive'];
const BUSINESS_IDS = ['elon-musk', 'jeff-bezos', 'warren-buffett', 'richard-branson', 'dietrich-mateschitz', 'steve-jobs'];
MARKETING_IDS.forEach((id) => { SOUL_TEAM_COLORS[id] = '#F27123'; });
DESIGN_IDS.forEach((id) => { SOUL_TEAM_COLORS[id] = '#00D9FF'; });
BUSINESS_IDS.forEach((id) => { SOUL_TEAM_COLORS[id] = '#FFB800'; });
SOUL_TEAM_COLORS['devils-advocate'] = '#EF4444';

// Find soul name and model from mock data
function findSoulInfo(soulId) {
  for (const team of MOCK_TEAMS) {
    const p = team.personas.find((pp) => pp.id === soulId);
    if (p) return { name: p.name, model: p.model };
  }
  if (soulId === 'steve-jobs') return { name: MOCK_LEADERSHIP.moderator.name, model: MOCK_LEADERSHIP.moderator.model };
  if (soulId === 'jony-ive') return { name: MOCK_LEADERSHIP.evaluator.name, model: MOCK_LEADERSHIP.evaluator.model };
  if (soulId === 'devils-advocate') return { name: MOCK_LEADERSHIP.da.name, model: MOCK_LEADERSHIP.da.model };
  return { name: soulId, model: '' };
}

export default function SoulInfoModal({ soulId, onClose }) {
  const t = useTokens();
  const lookupModel = useModelLookup();
  const bio = SOUL_BIOS[soulId];
  const teamColor = SOUL_TEAM_COLORS[soulId] || t.textMuted;
  const soul = findSoulInfo(soulId);
  const modelInfo = lookupModel(soul.model);

  // Close on Esc
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  if (!bio) return null;

  const sections = [
    { label: 'BIGGEST SUCCESS', content: bio.biggestSuccess },
    { label: 'CREATIVE PROCESS', content: bio.process },
    { label: 'KNOWN FOR', content: bio.knownFor },
    { label: 'STYLE', content: bio.style },
    { label: 'WHY IN THE CHAMBER', content: bio.whyInChamber },
  ];

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(10,10,12,0.7)',
        backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#1A1A1E',
          borderRadius: 16, maxWidth: 520, width: '100%',
          padding: 24, position: 'relative',
          borderLeft: `3px solid ${teamColor}`,
          maxHeight: '85vh', overflowY: 'auto',
          animation: 'fadeSlideUp 0.25s ease-out',
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 16, right: 16,
            width: 32, height: 32, borderRadius: 16,
            background: t.surfaceRaised, border: 'none',
            color: t.textMuted, fontSize: 16, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          {'\u2715'}
        </button>

        {/* Header */}
        <div style={{ marginBottom: 4 }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: t.text, paddingRight: 40 }}>
            {soul.name}
          </div>
          <div style={{ fontSize: 13, color: teamColor, marginTop: 4 }}>
            {bio.title} {'\u00B7'} {bio.era}
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: t.surfaceRaised, margin: '16px 0' }} />

        {/* Bio sections */}
        {sections.map(({ label, content }) => (
          <div key={label} style={{ marginBottom: 16 }}>
            <div style={{
              fontSize: 10, fontFamily: font.mono, fontWeight: 600,
              color: t.textMuted, textTransform: 'uppercase',
              letterSpacing: '0.08em', marginBottom: 6,
            }}>{label}</div>
            <div style={{
              fontSize: 13, color: t.textSoft, lineHeight: 1.5,
            }}>{content}</div>
          </div>
        ))}

        {/* Divider */}
        <div style={{ height: 1, background: t.surfaceRaised, margin: '16px 0 12px' }} />

        {/* Footer */}
        <div style={{
          background: t.surfaceRaised, borderRadius: 8,
          padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{
            fontSize: 11, color: t.textMuted,
          }}>Currently:</span>
          <span style={{
            fontSize: 11, fontFamily: font.mono, fontWeight: 600,
            color: modelInfo.color || t.text,
          }}>{modelInfo.name}</span>
        </div>
      </div>
    </div>
  );
}
