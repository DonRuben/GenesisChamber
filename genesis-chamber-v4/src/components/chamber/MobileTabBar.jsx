import { useNavigate, useParams } from 'react-router-dom';
import { font, motion } from '../../design/tokens';
import { useChamberStore } from '../../stores/chamberStore';
import { MOCK_TAB_GROUPS } from '../../data/mock';
import { useTokens } from '../../hooks/useTokens';

export default function MobileTabBar() {
  const t = useTokens();
  const navigate = useNavigate();
  const { id } = useParams();
  const { activeTab, activeSubTab, setActiveTab } = useChamberStore();

  const allTabs = MOCK_TAB_GROUPS.flatMap((g) =>
    g.tabs.map((t) => ({ ...t, groupKey: g.key }))
  );

  const handleTab = (tab) => {
    if (tab.key === 'gallery') { navigate(`/sim/${id}/gallery`); return; }
    if (tab.key === 'da-arena') { navigate(`/sim/${id}/da`); return; }
    setActiveTab(
      tab.groupKey === 'hero' ? tab.key : tab.groupKey,
      tab.groupKey === 'hero' ? null : tab.key
    );
  };

  const isActive = (tab) => {
    if (tab.groupKey === 'hero') return activeTab === tab.key && !activeSubTab;
    return activeTab === tab.groupKey && activeSubTab === tab.key;
  };

  return (
    <div style={{
      display: 'flex', overflowX: 'auto', gap: 0,
      borderBottom: `1px solid ${t.border}`,
      WebkitOverflowScrolling: 'touch',
      msOverflowStyle: 'none', scrollbarWidth: 'none',
      scrollSnapType: 'x mandatory',
    }}>
      {allTabs.map((tab) => {
        const active = isActive(tab);
        return (
          <button
            key={tab.key}
            onClick={() => handleTab(tab)}
            style={{
              padding: '10px 14px', cursor: 'pointer', whiteSpace: 'nowrap',
              background: 'none', border: 'none',
              borderBottom: `2px solid ${active ? t.cyan : 'transparent'}`,
              fontSize: 10, fontFamily: font.mono, fontWeight: active ? 600 : 400,
              color: active ? t.text : t.textMuted,
              textTransform: 'uppercase', letterSpacing: '0.06em',
              transition: `all ${motion.duration.fast}`,
              flexShrink: 0,
              scrollSnapAlign: 'start',
            }}
          >{tab.label}</button>
        );
      })}
    </div>
  );
}
