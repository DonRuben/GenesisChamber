import './Sidebar.css';

const STATUS_COLORS = {
  running: 'var(--teal, #00D9C4)',
  completed: 'var(--green, #10B981)',
  paused_at_gate: 'var(--gold, #F59E0B)',
  failed: 'var(--red, #EF4444)',
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
}) {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h1>{mode === 'genesis' ? 'Genesis Chamber' : 'LLM Council'}</h1>
        {mode === 'genesis' && <div className="subtitle">Multi-AI Simulation</div>}
      </div>

      {/* Mode Toggle */}
      <div className="mode-toggle">
        <button
          className={mode === 'council' ? 'active' : ''}
          onClick={() => onModeChange('council')}
        >
          Council
        </button>
        <button
          className={mode === 'genesis' ? 'active' : ''}
          onClick={() => onModeChange('genesis')}
        >
          Genesis
        </button>
      </div>

      {mode === 'council' ? (
        <>
          <div style={{ padding: '8px 12px' }}>
            <button className="new-conversation-btn" onClick={onNewConversation}>
              + New Conversation
            </button>
          </div>
          <div className="conversation-list">
            {conversations.length === 0 ? (
              <div className="no-conversations">No conversations yet</div>
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv.id}
                  className={`conversation-item ${conv.id === currentConversationId ? 'active' : ''}`}
                  onClick={() => onSelectConversation(conv.id)}
                >
                  <div className="conversation-title">{conv.title || 'New Conversation'}</div>
                  <div className="conversation-meta">{conv.message_count} messages</div>
                </div>
              ))
            )}
          </div>
        </>
      ) : (
        <>
          <div style={{ padding: '8px 12px' }}>
            <button className="new-conversation-btn" onClick={onNewSimulation}>
              + New Simulation
            </button>
          </div>
          <div className="conversation-list">
            {(!simulations || simulations.length === 0) ? (
              <div className="no-conversations">No simulations yet</div>
            ) : (
              simulations.map((sim) => (
                <div
                  key={sim.id}
                  className={`simulation-item conversation-item ${sim.id === currentSimId ? 'active' : ''}`}
                  onClick={() => onSelectSimulation(sim.id)}
                >
                  <div className="conversation-title">{sim.name || 'Unnamed'}</div>
                  <div className="simulation-meta conversation-meta">
                    <span style={{
                      display: 'inline-block',
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: STATUS_COLORS[sim.status] || '#666',
                      marginRight: 4,
                    }} />
                    {sim.status} | R{sim.current_round}/{sim.total_rounds}
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
