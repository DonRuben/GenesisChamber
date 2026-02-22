import { font } from '../../design/tokens';
import { useChamberStore } from '../../stores/chamberStore';
import { useTokens } from '../../hooks/useTokens';

export default function Breadcrumb() {
  const t = useTokens();
  const { activeTab, activeSubTab } = useChamberStore();

  const capitalize = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
  const parts = [capitalize(activeTab)];
  if (activeSubTab) parts.push(capitalize(activeSubTab));

  return (
    <div style={{
      fontSize: 10, fontFamily: font.mono, color: t.textMuted,
      padding: '8px 0', letterSpacing: '0.04em',
    }}>
      {parts.join(' > ')}
    </div>
  );
}
