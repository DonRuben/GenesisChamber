import { useNavigate, useParams } from 'react-router-dom';
import { T, font, motion } from '../../design/tokens';
import { IC } from '../../design/icons';
import { StatusBadge } from '../../design/shared';
import { useChamberStore } from '../../stores/chamberStore';
import { MOCK_TAB_GROUPS } from '../../data/mock';

const navIcons = {
  overview: IC.home, concepts: IC.layers, critiques: IC.evaluate,
  direction: IC.brain, transcript: IC.fileText, gallery: IC.gallery,
  generated: IC.palette, 'da-arena': IC.skull, output: IC.exportArrow,
};

export default function DashSidebar() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { simulation, activeTab, activeSubTab, setActiveTab } = useChamberStore();

  const handleNav = (groupKey, tabKey) => {
    if (tabKey === 'gallery') {
      navigate(`/sim/${id}/gallery`);
      return;
    }
    if (tabKey === 'da-arena') {
      navigate(`/sim/${id}/da`);
      return;
    }
    setActiveTab(groupKey === 'hero' ? tabKey : groupKey, groupKey === 'hero' ? null : tabKey);
  };

  const isActive = (groupKey, tabKey) => {
    if (groupKey === 'hero') return activeTab === tabKey && !activeSubTab;
    return activeTab === groupKey && activeSubTab === tabKey;
  };

  const conceptCounts = {
    concepts: simulation?.concepts?.length || 0,
    critiques: simulation?.critiques?.length || 0,
    gallery: simulation?.media?.length || 0,
  };

  return (
    <div style={{
      width: 200, minWidth: 200, height: '100%',
      background: T.surface, borderRight: `1px solid ${T.border}`,
      display: 'flex', flexDirection: 'column', padding: '16px 0',
      overflow: 'auto',
    }}>
      {/* Sim Name + Status */}
      <div style={{ padding: '0 16px 16px', borderBottom: `1px solid ${T.border}` }}>
        <div style={{
          fontSize: 13, fontWeight: 600, color: T.text,
          marginBottom: 6, lineHeight: 1.3,
        }}>
          {simulation?.name || 'Simulation'}
        </div>
        <StatusBadge status={simulation?.status || 'pending'} />
      </div>

      {/* Nav Groups */}
      <div style={{ flex: 1, paddingTop: 8 }}>
        {MOCK_TAB_GROUPS.map((group) => (
          <div key={group.key} style={{ marginBottom: 4 }}>
            {group.tabs.length > 1 && (
              <div style={{
                fontSize: 9, fontFamily: font.mono, color: T.textMuted,
                textTransform: 'uppercase', letterSpacing: '0.12em',
                padding: '8px 16px 4px',
              }}>{group.label}</div>
            )}
            {group.tabs.map((tab) => {
              const active = isActive(group.key, tab.key);
              const icon = navIcons[tab.key];
              const count = conceptCounts[tab.key];
              return (
                <button
                  key={tab.key}
                  onClick={() => handleNav(group.key, tab.key)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    width: '100%', padding: '8px 16px', cursor: 'pointer',
                    background: active ? `${T.cyan}0d` : 'transparent',
                    borderLeft: active ? `2px solid ${T.cyan}` : '2px solid transparent',
                    border: 'none', borderLeftStyle: 'solid',
                    borderLeftWidth: 2, borderLeftColor: active ? T.cyan : 'transparent',
                    textAlign: 'left',
                    transition: `all ${motion.duration.fast}`,
                  }}
                >
                  {icon && <span style={{ fontSize: 14, color: active ? T.cyan : T.textMuted }}>{icon}</span>}
                  <span style={{
                    fontSize: 12, color: active ? T.text : T.textSoft,
                    fontWeight: active ? 600 : 400, flex: 1,
                  }}>{tab.label}</span>
                  {count > 0 && (
                    <span style={{
                      fontSize: 9, fontFamily: font.mono, color: T.textMuted,
                      padding: '1px 6px', background: T.surfaceRaised, borderRadius: 8,
                    }}>{count}</span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
