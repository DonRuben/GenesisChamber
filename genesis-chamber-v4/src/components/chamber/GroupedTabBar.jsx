import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { T, font, motion } from '../../design/tokens';
import { IC } from '../../design/icons';
import { StatusBadge } from '../../design/shared';
import { useKeyboard } from '../../hooks/useKeyboard';
import { useChamberStore } from '../../stores/chamberStore';
import { MOCK_TAB_GROUPS } from '../../data/mock';

export default function GroupedTabBar() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { simulation, activeTab, activeSubTab, setActiveTab } = useChamberStore();
  const [openDropdown, setOpenDropdown] = useState(null);
  const barRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (barRef.current && !barRef.current.contains(e.target)) setOpenDropdown(null);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleTabClick = (groupKey, tabKey) => {
    setOpenDropdown(null);
    if (tabKey === 'gallery') { navigate(`/sim/${id}/gallery`); return; }
    if (tabKey === 'da-arena') { navigate(`/sim/${id}/da`); return; }
    setActiveTab(groupKey === 'hero' ? tabKey : groupKey, groupKey === 'hero' ? null : tabKey);
  };

  const isGroupActive = (group) => {
    if (group.key === 'hero') return activeTab === 'overview' && !activeSubTab;
    return activeTab === group.key;
  };

  // Cmd+1-5 shortcuts
  useKeyboard({
    'mod+1': () => handleTabClick('hero', 'overview'),
    'mod+2': () => {
      const first = MOCK_TAB_GROUPS[1]?.tabs[0];
      if (first) handleTabClick(MOCK_TAB_GROUPS[1].key, first.key);
    },
    'mod+3': () => {
      const first = MOCK_TAB_GROUPS[2]?.tabs[0];
      if (first) handleTabClick(MOCK_TAB_GROUPS[2].key, first.key);
    },
    'mod+4': () => {
      const first = MOCK_TAB_GROUPS[3]?.tabs[0];
      if (first) handleTabClick(MOCK_TAB_GROUPS[3].key, first.key);
    },
    'mod+5': () => {
      const first = MOCK_TAB_GROUPS[4]?.tabs[0];
      if (first) handleTabClick(MOCK_TAB_GROUPS[4].key, first.key);
    },
  });

  return (
    <div ref={barRef} style={{
      display: 'flex', alignItems: 'center', gap: 2,
      padding: '0 16px', borderBottom: `1px solid ${T.border}`,
      position: 'relative',
    }}>
      {MOCK_TAB_GROUPS.map((group, gi) => {
        const active = isGroupActive(group);
        const hasDropdown = group.tabs.length > 1;

        return (
          <div key={group.key} style={{ position: 'relative' }}>
            <button
              onClick={() => {
                if (hasDropdown) {
                  setOpenDropdown(openDropdown === group.key ? null : group.key);
                } else {
                  handleTabClick(group.key, group.tabs[0].key);
                }
              }}
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                padding: '10px 12px', cursor: 'pointer',
                background: 'none', border: 'none',
                borderBottom: `2px solid ${active ? T.cyan : 'transparent'}`,
                fontSize: 11, fontFamily: font.mono, fontWeight: 600,
                color: active ? T.text : T.textMuted,
                textTransform: 'uppercase', letterSpacing: '0.06em',
                transition: `all ${motion.duration.fast}`,
              }}
            >
              {group.label}
              {hasDropdown && (
                <span style={{
                  fontSize: 10, color: T.textMuted,
                  transform: openDropdown === group.key ? 'rotate(180deg)' : 'rotate(0)',
                  transition: `transform ${motion.duration.fast}`,
                }}>{IC.chevDown}</span>
              )}
            </button>

            {/* Dropdown */}
            {hasDropdown && openDropdown === group.key && (
              <div style={{
                position: 'absolute', top: '100%', left: 0, zIndex: 50,
                minWidth: 160, marginTop: 2, padding: 4,
                background: T.surfaceRaised, border: `1px solid ${T.border}`,
                borderRadius: 6, animation: 'fadeSlideUp 0.15s ease-out',
              }}>
                {group.tabs.map((tab) => {
                  const tabActive = activeTab === group.key && activeSubTab === tab.key;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => handleTabClick(group.key, tab.key)}
                      style={{
                        display: 'block', width: '100%', padding: '8px 12px',
                        cursor: 'pointer', textAlign: 'left', borderRadius: 4,
                        background: tabActive ? `${T.cyan}0d` : 'transparent',
                        border: 'none',
                        fontSize: 11, color: tabActive ? T.text : T.textSoft,
                        fontWeight: tabActive ? 600 : 400,
                        transition: `background ${motion.duration.fast}`,
                      }}
                    >{tab.label}</button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      <div style={{ flex: 1 }} />
      <StatusBadge status={simulation?.status || 'pending'} />
    </div>
  );
}
