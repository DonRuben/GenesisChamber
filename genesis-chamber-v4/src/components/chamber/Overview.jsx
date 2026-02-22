import { font } from '../../design/tokens';
import { IC } from '../../design/icons';
import { MonoLabel } from '../../design/shared';
import { useChamberStore } from '../../stores/chamberStore';
import WinnerSpotlight from './WinnerSpotlight';
import QuickStats from './QuickStats';
import ParticipantList from './ParticipantList';
import MediaPreview from './MediaPreview';
import QuickActions from './QuickActions';
import { useTokens } from '../../hooks/useTokens';
import { useIsMobile } from '../../hooks/useMediaQuery';

export default function Overview() {
  const t = useTokens();
  const mobile = useIsMobile();
  const simulation = useChamberStore((s) => s.simulation);
  if (!simulation) return null;

  const winner = simulation.concepts?.find((c) => c.id === simulation.winner);

  return (
    <div className="gc-stagger" style={{
      maxWidth: 880, margin: '0 auto', width: '100%',
      display: 'flex', flexDirection: 'column', gap: 24,
      padding: mobile ? '0 8px' : undefined,
    }}>
      {/* Winner Spotlight */}
      <WinnerSpotlight concept={winner} />

      {/* Brief */}
      <div style={{
        borderLeft: `2px solid ${t.cyan}`, borderRadius: 8,
        background: t.surface, padding: 20,
      }}>
        <MonoLabel icon={IC.fileText} color={t.cyan}>Brief</MonoLabel>
        <p style={{
          fontSize: 13, color: t.textSoft, lineHeight: 1.65, margin: 0,
        }}>{simulation.brief}</p>
        {simulation.config && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
            {Object.entries(simulation.config).map(([k, v]) => (
              <span key={k} style={{
                fontSize: 9, fontFamily: font.mono, color: t.textMuted,
                padding: '2px 8px', background: t.surfaceRaised, borderRadius: 4,
                textTransform: 'uppercase', letterSpacing: '0.06em',
              }}>{k}: {String(v)}</span>
            ))}
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <QuickStats stats={simulation.stats} />

      {/* Divider */}
      <div style={{ height: 1, background: `${t.flame}4d` }} />

      {/* Participants */}
      <div>
        <MonoLabel icon={IC.users}>Participants</MonoLabel>
        <ParticipantList participants={simulation.participants} />
      </div>

      {/* Media Preview */}
      <div>
        <MonoLabel icon={IC.gallery}>Media</MonoLabel>
        <MediaPreview media={simulation.media} />
      </div>

      {/* Quick Actions */}
      <div>
        <MonoLabel icon={IC.bolt}>Quick Actions</MonoLabel>
        <QuickActions />
      </div>
    </div>
  );
}
