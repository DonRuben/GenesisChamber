import { useNavigate, useParams } from 'react-router-dom';
import { T, font } from '../../design/tokens';
import { IC } from '../../design/icons';
import { Btn } from '../../design/shared';
import { useChamberStore } from '../../stores/chamberStore';

export default function QuickActions() {
  const navigate = useNavigate();
  const { id } = useParams();
  const setActiveTab = useChamberStore((s) => s.setActiveTab);

  const actions = [
    { label: 'Council Detail', icon: IC.layers, color: T.cyan, onClick: () => setActiveTab('council', 'concepts') },
    { label: 'Full Gallery', icon: IC.gallery, color: T.flame, onClick: () => navigate(`/sim/${id}/gallery`) },
    { label: 'DA Arena', icon: IC.skull, color: T.magenta, onClick: () => navigate(`/sim/${id}/da`) },
    { label: 'Export', icon: IC.exportArrow, color: T.gold, onClick: () => setActiveTab('export', 'output') },
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
