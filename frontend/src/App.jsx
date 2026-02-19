import { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';
import SimulationDashboard from './components/SimulationDashboard';
import { IconClose, IconMenu } from './components/Icons';
import { api } from './api';
import './App.css';

function App() {
  // Mode: "council" (original llm-council) or "genesis" (Genesis Chamber)
  const [mode, setMode] = useState('genesis');

  // Backend connection status
  const [backendStatus, setBackendStatus] = useState('connecting');
  const [backendError, setBackendError] = useState(null);

  // Council mode state
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Genesis mode state
  const [simulations, setSimulations] = useState([]);
  const [currentSimId, setCurrentSimId] = useState(null);

  // Sidebar management
  const [showArchived, setShowArchived] = useState(false);

  // Responsive sidebar
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Keyboard shortcuts
  const handleKeyboardShortcuts = useCallback((e) => {
    const mod = e.metaKey || e.ctrlKey;
    if (!mod) return;

    if (e.key === 'n') {
      e.preventDefault();
      if (mode === 'council') handleNewConversation();
      else handleNewSimulation();
    } else if (e.key === '[') {
      e.preventDefault();
      setSidebarCollapsed(prev => !prev);
    } else if (e.key === 'k') {
      e.preventDefault();
      const input = document.querySelector('.message-input');
      if (input) input.focus();
    }
  }, [mode]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyboardShortcuts);
    return () => document.removeEventListener('keydown', handleKeyboardShortcuts);
  }, [handleKeyboardShortcuts]);

  // Health check with retry (Render free tier cold starts take 30-60s)
  useEffect(() => {
    let cancelled = false;
    const checkBackend = async () => {
      for (let attempt = 1; attempt <= 6; attempt++) {
        if (cancelled) return;
        try {
          await api.healthCheck();
          if (!cancelled) {
            setBackendStatus('connected');
            setBackendError(null);
          }
          return;
        } catch (err) {
          console.warn(`[Genesis Chamber] Backend attempt ${attempt}/6 failed:`, err.message);
          if (attempt < 6) {
            await new Promise(r => setTimeout(r, attempt * 5000));
          }
        }
      }
      if (!cancelled) {
        setBackendStatus('error');
        setBackendError('Could not reach the backend. Is Render deployed?');
      }
    };
    checkBackend();
    return () => { cancelled = true; };
  }, []);

  // Load data once backend is connected
  useEffect(() => {
    if (backendStatus !== 'connected') return;
    if (mode === 'council') {
      loadConversations();
    } else {
      loadSimulations();
    }
  }, [mode, backendStatus]);

  // Load conversation details when selected (but NOT during active message send —
  // the optimistic state with user + assistant skeleton must not be overwritten)
  useEffect(() => {
    if (currentConversationId && !isLoading) {
      loadConversation(currentConversationId);
    }
  }, [currentConversationId]);

  // === Council Mode Functions (preserved from original) ===

  const loadConversations = async () => {
    try {
      const convs = await api.listConversations();
      setConversations(convs);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
  };

  const loadConversation = async (id) => {
    try {
      const conv = await api.getConversation(id);
      setCurrentConversation(conv);
    } catch (error) {
      console.error('Failed to load conversation:', error);
    }
  };

  const handleNewConversation = async () => {
    try {
      const newConv = await api.createConversation();
      setConversations([
        { id: newConv.id, created_at: newConv.created_at, message_count: 0 },
        ...conversations,
      ]);
      setCurrentConversationId(newConv.id);
    } catch (error) {
      console.error('Failed to create conversation:', error);
    }
  };

  const handleSelectConversation = (id) => {
    setCurrentConversationId(id);
    if (isMobile) setSidebarOpen(false);
  };

  // === Conversation Management ===

  const handleRenameConversation = async (id, name) => {
    try {
      await api.renameConversation(id, name);
      setConversations(prev => prev.map(c => c.id === id ? { ...c, title: name } : c));
    } catch (error) {
      console.error('Failed to rename conversation:', error);
    }
  };

  const handleDeleteConversation = async (id) => {
    try {
      await api.deleteConversation(id);
      setConversations(prev => prev.filter(c => c.id !== id));
      if (currentConversationId === id) {
        setCurrentConversationId(null);
        setCurrentConversation(null);
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error);
    }
  };

  const handleArchiveConversation = async (id, archived = true) => {
    try {
      await api.archiveConversation(id, archived);
      setConversations(prev => prev.map(c => c.id === id ? { ...c, archived } : c));
    } catch (error) {
      console.error('Failed to archive conversation:', error);
    }
  };

  const handleSendMessage = async (content, modelConfig = {}) => {
    setIsLoading(true);
    try {
      // Auto-create a conversation if none exists yet
      let convId = currentConversationId;
      if (!convId) {
        const newConv = await api.createConversation();
        convId = newConv.id;
        setCurrentConversationId(convId);
        setCurrentConversation(newConv);
        setConversations((prev) => [
          { id: newConv.id, created_at: newConv.created_at, title: newConv.title || 'New Conversation', message_count: 0 },
          ...prev,
        ]);
      }

      const userMessage = { role: 'user', content };
      setCurrentConversation((prev) => ({
        ...prev,
        messages: [...(prev?.messages || []), userMessage],
      }));

      const assistantMessage = {
        role: 'assistant',
        stage1: null,
        stage2: null,
        stage3: null,
        metadata: null,
        loading: { stage1: false, stage2: false, stage3: false },
      };

      setCurrentConversation((prev) => ({
        ...prev,
        messages: [...prev.messages, assistantMessage],
      }));

      // Helper: safely update the last assistant message in conversation state
      const updateLastAssistant = (updater) => {
        setCurrentConversation((prev) => {
          if (!prev?.messages?.length) return prev;
          const messages = [...prev.messages];
          const lastMsg = messages[messages.length - 1];
          if (!lastMsg || lastMsg.role === 'user') return prev; // guard against race
          updater(lastMsg);
          return { ...prev, messages };
        });
      };

      await api.sendMessageStream(convId, content, (eventType, event) => {
        switch (eventType) {
          case 'stage1_start':
            updateLastAssistant((msg) => { if (msg.loading) msg.loading.stage1 = true; });
            break;
          case 'stage1_complete':
            updateLastAssistant((msg) => { msg.stage1 = event.data; if (msg.loading) msg.loading.stage1 = false; });
            break;
          case 'stage2_start':
            updateLastAssistant((msg) => { if (msg.loading) msg.loading.stage2 = true; });
            break;
          case 'stage2_complete':
            updateLastAssistant((msg) => { msg.stage2 = event.data; msg.metadata = event.metadata; if (msg.loading) msg.loading.stage2 = false; });
            break;
          case 'stage3_start':
            updateLastAssistant((msg) => { if (msg.loading) msg.loading.stage3 = true; });
            break;
          case 'stage3_complete':
            updateLastAssistant((msg) => { msg.stage3 = event.data; if (msg.loading) msg.loading.stage3 = false; });
            break;
          case 'title_complete':
            loadConversations();
            break;
          case 'complete':
            loadConversations();
            setIsLoading(false);
            break;
          case 'error':
            console.error('Stream error:', event.message);
            setIsLoading(false);
            break;
        }
      }, modelConfig);
    } catch (error) {
      console.error('Failed to send message:', error);
      setCurrentConversation((prev) => prev ? ({
        ...prev,
        messages: (prev.messages || []).slice(0, -2),
      }) : prev);
      setIsLoading(false);
    }
  };

  // === Genesis Mode Functions ===

  const loadSimulations = async () => {
    try {
      const sims = await api.listSimulations();
      setSimulations(sims);
    } catch (error) {
      console.error('Failed to load simulations:', error);
    }
  };

  const handleNewSimulation = () => {
    setCurrentSimId(null);
    if (isMobile) setSidebarOpen(false);
  };

  const handleSelectSimulation = (id) => {
    setCurrentSimId(id);
    if (isMobile) setSidebarOpen(false);
  };

  // === Simulation Management ===

  const handleRenameSimulation = async (id, name) => {
    try {
      await api.renameSimulation(id, name);
      setSimulations(prev => prev.map(s => s.id === id ? { ...s, name } : s));
    } catch (error) {
      console.error('Failed to rename simulation:', error);
    }
  };

  const handleDeleteSimulation = async (id) => {
    try {
      await api.deleteSimulation(id);
      setSimulations(prev => prev.filter(s => s.id !== id));
      if (currentSimId === id) {
        setCurrentSimId(null);
      }
    } catch (error) {
      console.error('Failed to delete simulation:', error);
    }
  };

  const handleArchiveSimulation = async (id, archived = true) => {
    try {
      await api.archiveSimulation(id, archived);
      setSimulations(prev => prev.map(s => s.id === id ? { ...s, archived } : s));
    } catch (error) {
      console.error('Failed to archive simulation:', error);
    }
  };

  // === Render ===

  return (
    <div className="app">
      {backendStatus === 'connecting' && (
        <div className="backend-banner backend-connecting">
          Connecting to backend... (Render free tier may take 30-60 seconds to wake up)
        </div>
      )}
      {backendStatus === 'error' && (
        <div className="backend-banner backend-error">
          {backendError || 'Backend unreachable'} — Check browser console for details.
          <button onClick={() => { setBackendStatus('connecting'); setBackendError(null); window.location.reload(); }}>
            Retry
          </button>
        </div>
      )}

      {isMobile && (
        <>
          <button
            className="mobile-menu-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle menu"
          >
            {sidebarOpen ? <IconClose size={18} /> : <IconMenu size={18} />}
          </button>
          <div
            className={`sidebar-overlay ${sidebarOpen ? 'visible' : ''}`}
            onClick={() => setSidebarOpen(false)}
          />
        </>
      )}

      <Sidebar
        mode={mode}
        onModeChange={setMode}
        conversations={conversations}
        currentConversationId={currentConversationId}
        onSelectConversation={handleSelectConversation}
        onNewConversation={handleNewConversation}
        onRenameConversation={handleRenameConversation}
        onDeleteConversation={handleDeleteConversation}
        onArchiveConversation={handleArchiveConversation}
        simulations={simulations}
        currentSimId={currentSimId}
        onSelectSimulation={handleSelectSimulation}
        onNewSimulation={handleNewSimulation}
        onRenameSimulation={handleRenameSimulation}
        onDeleteSimulation={handleDeleteSimulation}
        onArchiveSimulation={handleArchiveSimulation}
        showArchived={showArchived}
        onToggleArchived={() => setShowArchived(prev => !prev)}
        isOpen={!isMobile || sidebarOpen}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(prev => !prev)}
      />

      <main className="app-content">
        {mode === 'council' ? (
          <ChatInterface
            conversation={currentConversation}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
          />
        ) : (
          <SimulationDashboard
            simulations={simulations}
            currentSimId={currentSimId}
            onSelectSim={handleSelectSimulation}
            onRefreshList={loadSimulations}
          />
        )}
      </main>
    </div>
  );
}

export default App;
