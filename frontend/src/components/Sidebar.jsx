import { IconPlus, IconMessage, IconSpark, IconCrystalBall, IconCollapse, IconExpand, IconImage, IconVideo, IconPresentation } from './Icons';
import './Sidebar.css';

const STATUS_COLORS = {
  running: 'var(--gc-cyan)',
  completed: 'var(--status-success)',
  paused_at_gate: 'var(--gc-gold)',
  failed: 'var(--status-error)',
};

const STATUS_LABELS = {
  running: 'Running',
  completed: 'Complete',
  paused_at_gate: 'Gate',
  failed: 'Failed',
};

export default function Sidebar({
  mode,
  onModeChange,
  conversations,
  currentConversationId,
  onSelectConversation,
  onNewConversation,
  simulations,
  currentSimId,
  onSelectSimulation,
  onNewSimulation,
  isOpen,
  collapsed,
  onToggleCollapse,
}) {
  return (
    <aside className={`sidebar ${isOpen ? '' : 'sidebar-hidden'} ${collapsed ? 'collapsed' : ''}`}>
      {/* Brand */}
      <div className="sidebar-brand">
        <h1 className="sidebar-title">Genesis<span>Chamber</span></h1>
        <p className="sidebar-subtitle">Multi-AI Creative Engine</p>
      </div>

      {/* Mode Toggle */}
      <div className="mode-toggle">
        <button
          className={`mode-toggle-btn ${mode === 'council' ? 'active' : ''}`}
          onClick={() => onModeChange('council')}
          title="LLM Council — Ask questions and get multi-model responses"
        >
          <IconMessage size={14} />
          <span className="mode-toggle-label">LLM Council</span>
        </button>
        <button
          className={`mode-toggle-btn ${mode === 'genesis' ? 'active' : ''}`}
          onClick={() => onModeChange('genesis')}
          title="Genesis Chamber — Multi-round creative simulation"
        >
          <IconCrystalBall size={14} />
          <span className="mode-toggle-label">Genesis Chamber</span>
        </button>
      </div>

      {/* Action Button */}
      <div className="sidebar-action">
        {mode === 'council' ? (
          <button className="sidebar-new-btn" onClick={onNewConversation}>
            <IconPlus size={14} /> <span className="sidebar-new-label">New Conversation</span>
          </button>
        ) : (
          <button className="sidebar-new-btn" onClick={onNewSimulation}>
            <IconPlus size={14} /> <span className="sidebar-new-label">New Simulation</span>
          </button>
        )}
      </div>

      {/* List */}
      <div className="sidebar-list">
        {mode === 'council' ? (
          conversations.length === 0 ? (
            <div className="sidebar-empty">
              <IconMessage size={20} className="sidebar-empty-icon" />
              <span>No conversations yet</span>
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                className={`sidebar-item ${conv.id === currentConversationId ? 'active' : ''}`}
                onClick={() => onSelectConversation(conv.id)}
              >
                <div className="sidebar-item-title">{conv.title || 'New Conversation'}</div>
                <div className="sidebar-item-meta">{conv.message_count} messages</div>
              </div>
            ))
          )
        ) : (
          (!simulations || simulations.length === 0) ? (
            <div className="sidebar-empty">
              <IconSpark size={20} className="sidebar-empty-icon" />
              <span>No simulations yet</span>
            </div>
          ) : (
            simulations.map((sim) => (
              <div
                key={sim.id}
                className={`sidebar-item ${sim.id === currentSimId ? 'active' : ''}`}
                onClick={() => onSelectSimulation(sim.id)}
              >
                <div className="sidebar-item-title">{sim.name || 'Unnamed'}</div>
                <div className="sidebar-item-meta">
                  <span
                    className="sidebar-status-dot"
                    style={{ background: STATUS_COLORS[sim.status] || 'var(--text-muted)' }}
                  />
                  <span className="sidebar-status-label">
                    {STATUS_LABELS[sim.status] || sim.status}
                  </span>
                  <span className="sidebar-item-sep" />
                  <span>R{sim.current_round}/{sim.total_rounds}</span>
                </div>
              </div>
            ))
          )
        )}
      </div>

      {/* Library — completed simulations with outputs */}
      {mode === 'genesis' && simulations && simulations.filter(s => s.status === 'completed').length > 0 && (
        <div className="sidebar-library">
          <div className="sidebar-library-header">
            <span className="sidebar-library-label">Library</span>
            <span className="sidebar-library-count">
              {simulations.filter(s => s.status === 'completed').length}
            </span>
          </div>
          <div className="sidebar-library-list">
            {simulations.filter(s => s.status === 'completed').map((sim) => (
              <div
                key={`lib-${sim.id}`}
                className={`sidebar-library-item ${sim.id === currentSimId ? 'active' : ''}`}
                onClick={() => onSelectSimulation(sim.id)}
              >
                <div className="sidebar-library-name">{sim.name || 'Unnamed'}</div>
                <div className="sidebar-library-badges">
                  {sim.has_images && <IconImage size={12} className="sidebar-library-badge" />}
                  {sim.has_videos && <IconVideo size={12} className="sidebar-library-badge" />}
                  {sim.has_presentation && <IconPresentation size={12} className="sidebar-library-badge" />}
                  <span className="sidebar-library-rounds">R{sim.total_rounds}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer with collapse toggle */}
      <div className="sidebar-footer">
        <span className="sidebar-footer-text">OmniPresent Group</span>
        {onToggleCollapse && (
          <button
            className="sidebar-collapse-btn"
            onClick={onToggleCollapse}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <IconExpand size={16} /> : <IconCollapse size={16} />}
          </button>
        )}
      </div>
    </aside>
  );
}
