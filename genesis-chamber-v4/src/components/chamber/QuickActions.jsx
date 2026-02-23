import { useNavigate, useParams } from 'react-router-dom';
import { useTokens } from '../../hooks/useTokens';
import { IC } from '../../design/icons';
import { Btn } from '../../design/shared';
import { useChamberStore } from '../../stores/chamberStore';
import { useAppStore } from '../../stores/appStore';
import * as api from '../../services/api';

export default function QuickActions() {
  const t = useTokens();
  const navigate = useNavigate();
  const { id } = useParams();
  const setActiveTab = useChamberStore((s) => s.setActiveTab);
  const backendOnline = useAppStore((s) => s.backendOnline);

  const handleExport = () => {
    if (backendOnline && id && id !== 'mock-1') {
      window.open(api.getExportUrl(id, 'json'), '_blank');
    } else {
      setActiveTab('export', 'output');
    }
  };

  const actions = [
    { label: 'Council Detail', icon: IC.layers, color: t.cyan, onClick: () => setActiveTab('council', 'concepts') },
    { label: 'Full Gallery', icon: IC.gallery, color: t.flame, onClick: () => navigate(`/sim/${id}/gallery`) },
    { label: 'DA Arena', icon: IC.skull, color: t.magenta, onClick: () => navigate(`/sim/${id}/da`) },
    { label: 'Export', icon: IC.exportArrow, color: t.gold, onClick: handleExport },
  ];

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
      gap: 10,
    }}>
      {actions.map(({ label, icon, color, onClick }) => (
        <Btn key={label} color={color} secondary onClick={onClick} style={{ justifyContent: 'center' }}>
          <span style={{ fontSize: 14 }}>{icon}</span> {label}
        </Btn>
      ))}
    </div>
  );
}
