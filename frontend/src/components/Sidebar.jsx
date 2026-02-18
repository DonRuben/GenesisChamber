import { IconPlus, IconMessage, IconSpark } from './Icons';
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
}) {
  return (
    <aside className={`sidebar ${isOpen ? '' : 'sidebar-hidden'}`}>
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
        >
          Council
        </button>
        <button
          className={`mode-toggle-btn ${mode === 'genesis' ? 'active' : ''}`}
          onClick={() => onModeChange('genesis')}
        >
          Genesis
        </button>
      </div>

      {/* Action Button */}
      <div className="sidebar-action">
        {mode === 'council' ? (
          <button className="sidebar-new-btn" onClick={onNewConversation}>
            <IconPlus size={14} /> New Conversation
          </button>
        ) : (
          <button className="sidebar-new-btn" onClick={onNewSimulation}>
            <IconPlus size={14} /> New Simulation
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

      {/* Footer */}
      <div className="sidebar-footer">
        <span className="sidebar-footer-text">OmniPresent Group</span>
      </div>
    </aside>
  );
}
