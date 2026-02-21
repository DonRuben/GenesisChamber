import { useState, useRef, useEffect } from 'react';
import { IconPlus, IconMessage, IconSpark, IconCrystalBall, IconCollapse, IconExpand, IconImage, IconVideo, IconPresentation, IconMore, IconPencil, IconArchive, IconTrash, IconStar, IconSun, IconMoon } from './Icons';
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
  onRenameConversation,
  onDeleteConversation,
  onArchiveConversation,
  simulations,
  currentSimId,
  onSelectSimulation,
  onNewSimulation,
  onRenameSimulation,
  onDeleteSimulation,
  onArchiveSimulation,
  showArchived,
  onToggleArchived,
  isOpen,
  collapsed,
  onToggleCollapse,
}) {
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editingValue, setEditingValue] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const menuRef = useRef(null);
  const editRef = useRef(null);

  // V3: Simulation starring
  const [starredSims, setStarredSims] = useState(() => {
    try { return JSON.parse(localStorage.getItem('gc-starred-sims') || '[]'); }
    catch { return []; }
  });
  const [showStarredOnly, setShowStarredOnly] = useState(false);

  // V3.8: Light/Dark mode toggle
  const [theme, setTheme] = useState(() => localStorage.getItem('gc-theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('gc-theme', theme);
  }, [theme]);

  const toggleStar = (e, simId) => {
    e.stopPropagation();
    const updated = starredSims.includes(simId)
      ? starredSims.filter(id => id !== simId)
      : [...starredSims, simId];
    setStarredSims(updated);
    localStorage.setItem('gc-starred-sims', JSON.stringify(updated));
  };

  // Close menu when clicking outside
  useEffect(() => {
    if (!menuOpenId) return;
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpenId(null);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpenId]);

  // Focus edit input when entering edit mode
  useEffect(() => {
    if (editingId && editRef.current) {
      editRef.current.focus();
      editRef.current.select();
    }
  }, [editingId]);

  const startRename = (id, currentName) => {
    setMenuOpenId(null);
    setConfirmDeleteId(null);
    setEditingId(id);
    setEditingValue(currentName || '');
  };

  const confirmRename = (id) => {
    if (editingValue.trim()) {
      if (mode === 'council') {
        onRenameConversation?.(id, editingValue.trim());
      } else {
        onRenameSimulation?.(id, editingValue.trim());
      }
    }
    setEditingId(null);
    setEditingValue('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingValue('');
  };

  const handleEditKeyDown = (e, id) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      confirmRename(id);
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  };

  const startDelete = (id) => {
    setMenuOpenId(null);
    setConfirmDeleteId(id);
  };

  const confirmDelete = (id) => {
    if (mode === 'council') {
      onDeleteConversation?.(id);
    } else {
      onDeleteSimulation?.(id);
    }
    setConfirmDeleteId(null);
  };

  const handleArchive = (id, currentlyArchived) => {
    setMenuOpenId(null);
    if (mode === 'council') {
      onArchiveConversation?.(id, !currentlyArchived);
    } else {
      onArchiveSimulation?.(id, !currentlyArchived);
    }
  };

  const toggleMenu = (e, id) => {
    e.stopPropagation();
    setMenuOpenId(menuOpenId === id ? null : id);
    setConfirmDeleteId(null);
  };

  // Filter archived items
  const filteredConversations = conversations.filter(c => showArchived || !c.archived);
  const filteredSimulations = (simulations || [])
    .filter(s => showArchived || !s.archived)
    .filter(s => !showStarredOnly || starredSims.includes(s.id))
    .sort((a, b) => {
      const aStarred = starredSims.includes(a.id) ? 1 : 0;
      const bStarred = starredSims.includes(b.id) ? 1 : 0;
      return bStarred - aStarred;
    });
  const hasArchivedConversations = conversations.some(c => c.archived);
  const hasArchivedSimulations = (simulations || []).some(s => s.archived);

  const renderItemMenu = (id, name, isArchived) => (
    <div className="sidebar-item-menu" ref={menuOpenId === id ? menuRef : null}>
      <button onClick={(e) => { e.stopPropagation(); startRename(id, name); }}>
        <IconPencil size={12} /> Rename
      </button>
      <button onClick={(e) => { e.stopPropagation(); handleArchive(id, isArchived); }}>
        <IconArchive size={12} /> {isArchived ? 'Unarchive' : 'Archive'}
      </button>
      <button className="danger" onClick={(e) => { e.stopPropagation(); startDelete(id); }}>
        <IconTrash size={12} /> Delete
      </button>
    </div>
  );

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

      {/* Archive Toggle */}
      {((mode === 'council' && hasArchivedConversations) || (mode === 'genesis' && hasArchivedSimulations)) && (
        <div className="sidebar-archive-toggle">
          <label>
            <input type="checkbox" checked={showArchived} onChange={onToggleArchived} />
            <span>Show archived</span>
          </label>
        </div>
      )}

      {/* Star Filter */}
      {mode === 'genesis' && starredSims.length > 0 && (
        <div className="sidebar-archive-toggle">
          <label>
            <input type="checkbox" checked={showStarredOnly} onChange={() => setShowStarredOnly(!showStarredOnly)} />
            <span style={{ color: showStarredOnly ? 'var(--gc-gold)' : undefined }}>
              <IconStar size={10} /> Starred only
            </span>
          </label>
        </div>
      )}

      {/* List */}
      <div className="sidebar-list">
        {mode === 'council' ? (
          filteredConversations.length === 0 ? (
            <div className="sidebar-empty">
              <IconMessage size={20} className="sidebar-empty-icon" />
              <span>No conversations yet</span>
            </div>
          ) : (
            filteredConversations.map((conv) => (
              <div
                key={conv.id}
                className={`sidebar-item ${conv.id === currentConversationId ? 'active' : ''} ${conv.archived ? 'archived' : ''}`}
                onClick={() => { if (editingId !== conv.id && confirmDeleteId !== conv.id) onSelectConversation(conv.id); }}
              >
                {editingId === conv.id ? (
                  <input
                    ref={editRef}
                    className="sidebar-item-edit"
                    value={editingValue}
                    onChange={(e) => setEditingValue(e.target.value)}
                    onKeyDown={(e) => handleEditKeyDown(e, conv.id)}
                    onBlur={() => confirmRename(conv.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : confirmDeleteId === conv.id ? (
                  <div className="sidebar-item-confirm" onClick={(e) => e.stopPropagation()}>
                    <span>Delete this?</span>
                    <button className="confirm-yes" onClick={() => confirmDelete(conv.id)}>Yes</button>
                    <button className="confirm-no" onClick={() => setConfirmDeleteId(null)}>Cancel</button>
                  </div>
                ) : (
                  <>
                    <div className="sidebar-item-title">{conv.title || 'New Conversation'}</div>
                    <div className="sidebar-item-meta">{conv.message_count} messages</div>
                    <button className="sidebar-item-more" onClick={(e) => toggleMenu(e, conv.id)}>
                      <IconMore size={14} />
                    </button>
                    {menuOpenId === conv.id && renderItemMenu(conv.id, conv.title || 'New Conversation', conv.archived)}
                  </>
                )}
              </div>
            ))
          )
        ) : (
          filteredSimulations.length === 0 ? (
            <div className="sidebar-empty">
              <IconSpark size={20} className="sidebar-empty-icon" />
              <span>No simulations yet</span>
            </div>
          ) : (
            filteredSimulations.map((sim) => (
              <div
                key={sim.id}
                className={`sidebar-item ${sim.id === currentSimId ? 'active' : ''} ${sim.archived ? 'archived' : ''}`}
                onClick={() => { if (editingId !== sim.id && confirmDeleteId !== sim.id) onSelectSimulation(sim.id); }}
              >
                {editingId === sim.id ? (
                  <input
                    ref={editRef}
                    className="sidebar-item-edit"
                    value={editingValue}
                    onChange={(e) => setEditingValue(e.target.value)}
                    onKeyDown={(e) => handleEditKeyDown(e, sim.id)}
                    onBlur={() => confirmRename(sim.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : confirmDeleteId === sim.id ? (
                  <div className="sidebar-item-confirm" onClick={(e) => e.stopPropagation()}>
                    <span>Delete this?</span>
                    <button className="confirm-yes" onClick={() => confirmDelete(sim.id)}>Yes</button>
                    <button className="confirm-no" onClick={() => setConfirmDeleteId(null)}>Cancel</button>
                  </div>
                ) : (
                  <>
                    <button
                      className="sidebar-star-btn"
                      onClick={(e) => toggleStar(e, sim.id)}
                      title={starredSims.includes(sim.id) ? 'Unstar' : 'Star'}
                      style={{ color: starredSims.includes(sim.id) ? 'var(--gc-gold)' : 'var(--text-muted)' }}
                    >
                      <IconStar size={12} />
                    </button>
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
                    <button className="sidebar-item-more" onClick={(e) => toggleMenu(e, sim.id)}>
                      <IconMore size={14} />
                    </button>
                    {menuOpenId === sim.id && renderItemMenu(sim.id, sim.name || 'Unnamed', sim.archived)}
                  </>
                )}
              </div>
            ))
          )
        )}
      </div>

      {/* Library — completed simulations with outputs */}
      {mode === 'genesis' && simulations && simulations.filter(s => s.status === 'completed' && !s.archived).length > 0 && (
        <div className="sidebar-library">
          <div className="sidebar-library-header">
            <span className="sidebar-library-label">Library</span>
            <span className="sidebar-library-count">
              {simulations.filter(s => s.status === 'completed' && !s.archived).length}
            </span>
          </div>
          <div className="sidebar-library-list">
            {simulations.filter(s => s.status === 'completed' && !s.archived).map((sim) => (
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

      {/* Footer with theme toggle + collapse */}
      <div className="sidebar-footer">
        <span className="sidebar-footer-text">OmniPresent Group</span>
        <div className="sidebar-footer-actions">
          <button
            className="theme-toggle-btn"
            onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <IconSun size={14} /> : <IconMoon size={14} />}
          </button>
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
      </div>
    </aside>
  );
}
