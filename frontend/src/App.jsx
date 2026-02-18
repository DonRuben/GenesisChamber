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

  // Load conversation details when selected
  useEffect(() => {
    if (currentConversationId) {
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

  const handleSendMessage = async (content) => {
    if (!currentConversationId) return;

    setIsLoading(true);
    try {
      const userMessage = { role: 'user', content };
      setCurrentConversation((prev) => ({
        ...prev,
        messages: [...prev.messages, userMessage],
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

      await api.sendMessageStream(currentConversationId, content, (eventType, event) => {
        switch (eventType) {
          case 'stage1_start':
            setCurrentConversation((prev) => {
              const messages = [...prev.messages];
              messages[messages.length - 1].loading.stage1 = true;
              return { ...prev, messages };
            });
            break;
          case 'stage1_complete':
            setCurrentConversation((prev) => {
              const messages = [...prev.messages];
              const lastMsg = messages[messages.length - 1];
              lastMsg.stage1 = event.data;
              lastMsg.loading.stage1 = false;
              return { ...prev, messages };
            });
            break;
          case 'stage2_start':
            setCurrentConversation((prev) => {
              const messages = [...prev.messages];
              messages[messages.length - 1].loading.stage2 = true;
              return { ...prev, messages };
            });
            break;
          case 'stage2_complete':
            setCurrentConversation((prev) => {
              const messages = [...prev.messages];
              const lastMsg = messages[messages.length - 1];
              lastMsg.stage2 = event.data;
              lastMsg.metadata = event.metadata;
              lastMsg.loading.stage2 = false;
              return { ...prev, messages };
            });
            break;
          case 'stage3_start':
            setCurrentConversation((prev) => {
              const messages = [...prev.messages];
              messages[messages.length - 1].loading.stage3 = true;
              return { ...prev, messages };
            });
            break;
          case 'stage3_complete':
            setCurrentConversation((prev) => {
              const messages = [...prev.messages];
              const lastMsg = messages[messages.length - 1];
              lastMsg.stage3 = event.data;
              lastMsg.loading.stage3 = false;
              return { ...prev, messages };
            });
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
      });
    } catch (error) {
      console.error('Failed to send message:', error);
      setCurrentConversation((prev) => ({
        ...prev,
        messages: prev.messages.slice(0, -2),
      }));
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
        simulations={simulations}
        currentSimId={currentSimId}
        onSelectSimulation={handleSelectSimulation}
        onNewSimulation={handleNewSimulation}
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
