import { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { font } from '../../design/tokens';
import { useChamberStore } from '../../stores/chamberStore';
import { useAppStore } from '../../stores/appStore';
import { useIsMobile } from '../../hooks/useMediaQuery';
import { transformSimulationState } from '../../services/transformers';
import * as api from '../../services/api';
import DashSidebar from './DashSidebar';
import StageProgress from './StageProgress';
import GroupedTabBar from './GroupedTabBar';
import MobileTabBar from './MobileTabBar';
import Breadcrumb from './Breadcrumb';
import Overview from './Overview';
import ConceptGrid from './ConceptGrid';
import CritiqueCard from './CritiqueCard';
import { useTokens } from '../../hooks/useTokens';

export default function Dashboard() {
  const t = useTokens();
  const mobile = useIsMobile();
  const { id } = useParams();
  const backendOnline = useAppStore((s) => s.backendOnline);
  const setSimulation = useChamberStore((s) => s.setSimulation);
  const { activeTab, activeSubTab, dashSidebarOpen, simulation } = useChamberStore();
  const pollRef = useRef(null);

  useEffect(() => {
    if (!backendOnline || !id || id === 'mock-1') return;

    let cancelled = false;
    const fetchState = async () => {
      try {
        const data = await api.getSimulationState(id);
        if (cancelled) return;
        const transformed = transformSimulationState(data);
        if (transformed) setSimulation(transformed);
        // Poll if still running
        if (data.status === 'running' || data.status === 'starting') {
          pollRef.current = setTimeout(fetchState, 10000);
        }
      } catch {
        // Silently fail — mock data remains
      }
    };
    fetchState();

    return () => {
      cancelled = true;
      if (pollRef.current) clearTimeout(pollRef.current);
    };
  }, [backendOnline, id, setSimulation]);

  const renderContent = () => {
    if (activeTab === 'overview' && !activeSubTab) {
      return <Overview />;
    }
    if (activeTab === 'council') {
      if (activeSubTab === 'concepts') return <ConceptGrid />;
      if (activeSubTab === 'critiques') return <CritiqueList />;
      if (activeSubTab === 'direction') return <PlaceholderTab label="Direction" color={t.green} />;
      if (activeSubTab === 'transcript') return <PlaceholderTab label="Transcript" color={t.purple} />;
    }
    if (activeTab === 'media') {
      if (activeSubTab === 'generated') return <PlaceholderTab label="Generated" color={t.flame} />;
    }
    if (activeTab === 'export') {
      if (activeSubTab === 'output') return <PlaceholderTab label="Output" color={t.cyan} />;
    }
    return <PlaceholderTab label={activeSubTab || activeTab} color={t.textMuted} />;
  };

  return (
    <div style={{
      flex: 1, display: 'flex', height: '100%',
      animation: 'fadeSlideUp 0.3s ease-out',
    }}>
      {/* Sidebar — hidden on mobile */}
      {!mobile && dashSidebarOpen && <DashSidebar />}

      {/* Main Area */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        minWidth: 0, overflow: 'hidden',
      }}>
        {/* Stage Progress */}
        <div style={{ padding: '4px 16px', borderBottom: `1px solid ${t.border}` }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <StageProgress />
            <span style={{
              fontSize: 9, fontFamily: font.mono, color: t.textMuted,
              textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap',
              marginLeft: 12,
            }}>
              Round {simulation?.config?.rounds || 0} / {simulation?.config?.rounds || 0}
            </span>
          </div>
        </div>

        {/* Tab Bar */}
        {mobile ? <MobileTabBar /> : <GroupedTabBar />}

        {/* Content */}
        <div style={{ flex: 1, overflow: 'auto', padding: '0 16px 24px' }}>
          <Breadcrumb />
          <div key={activeTab + '-' + activeSubTab}>
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}

function CritiqueList() {
  const simulation = useChamberStore((s) => s.simulation);
  const critiques = simulation?.critiques || [];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, animation: 'fadeSlideUp 0.3s ease-out' }}>
      {critiques.map((cr) => <CritiqueCard key={cr.id} critique={cr} />)}
    </div>
  );
}

function PlaceholderTab({ label, color }) {
  const t = useTokens();
  return (
    <div style={{
      padding: 24, marginTop: 8, borderRadius: 8,
      background: t.surface, border: `1px solid ${t.border}`,
      borderLeft: `2px solid ${color}`, textAlign: 'center',
    }}>
      <div style={{
        fontSize: 9, fontFamily: font.mono, color: t.textMuted,
        textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8,
      }}>TAB CONTENT</div>
      <div style={{
        fontSize: 16, fontFamily: font.display, fontWeight: 700,
        color: t.text, letterSpacing: '-0.02em',
      }}>{label}</div>
    </div>
  );
}
