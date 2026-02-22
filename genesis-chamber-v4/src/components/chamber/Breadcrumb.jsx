import { T, font } from '../../design/tokens';
import { useChamberStore } from '../../stores/chamberStore';

export default function Breadcrumb() {
  const { activeTab, activeSubTab } = useChamberStore();

  const capitalize = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
  const parts = [capitalize(activeTab)];
  if (activeSubTab) parts.push(capitalize(activeSubTab));

  return (
    <div style={{
      fontSize: 10, fontFamily: font.mono, color: T.textMuted,
      padding: '8px 0', letterSpacing: '0.04em',
    }}>
      {parts.join(' > ')}
    </div>
  );
}
