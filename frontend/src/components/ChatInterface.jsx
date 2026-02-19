import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import Stage1 from './Stage1';
import Stage2 from './Stage2';
import Stage3 from './Stage3';
import { IconSoul, IconSend, IconGear, IconCheck } from './Icons';
import { api } from '../api';
import { TIER_CONFIG } from '../utils/modelDisplayNames';
import './ChatInterface.css';

const QUICK_START_SUGGESTIONS = [
  { label: 'Compare', desc: 'Trade-offs between two approaches', prompt: 'Compare the trade-offs of ' },
  { label: 'Analyze', desc: 'Deep analysis of a strategy or concept', prompt: 'Analyze the strategy of ' },
  { label: 'Brainstorm', desc: 'Generate creative ideas for a challenge', prompt: 'Brainstorm ideas for ' },
  { label: 'Evaluate', desc: 'Assess strengths and weaknesses', prompt: 'Evaluate the strengths and weaknesses of ' },
];

export default function ChatInterface({
  conversation,
  onSendMessage,
  isLoading,
}) {
  const [input, setInput] = useState('');
  const [showModelConfig, setShowModelConfig] = useState(false);
  const [availableModels, setAvailableModels] = useState(null);
  const [councilModels, setCouncilModels] = useState(null); // null = use defaults
  const [chairmanModel, setChairmanModel] = useState(null); // null = use default
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Load available models
  useEffect(() => {
    api.getAvailableModels()
      .then(data => setAvailableModels(data))
      .catch(err => console.error('Failed to load models:', err));
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      const modelConfig = {};
      if (councilModels && councilModels.length > 0) modelConfig.models = councilModels;
      if (chairmanModel) modelConfig.chairmanModel = chairmanModel;
      onSendMessage(input, modelConfig);
      setInput('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleQuickStart = (prompt) => {
    setInput(prompt);
    inputRef.current?.focus();
  };

  const toggleModel = (modelId) => {
    setCouncilModels(prev => {
      if (!prev) {
        // First toggle — start with all available minus this one
        const allIds = availableModels?.models?.map(m => m.id) || [];
        return allIds.filter(id => id !== modelId);
      }
      if (prev.includes(modelId)) {
        const filtered = prev.filter(id => id !== modelId);
        return filtered.length === 0 ? null : filtered;
      }
      return [...prev, modelId];
    });
  };

  const isModelSelected = (modelId) => {
    if (!councilModels) return true; // All selected by default
    return councilModels.includes(modelId);
  };

  const resetModels = () => {
    setCouncilModels(null);
    setChairmanModel(null);
  };

  const selectedCount = councilModels ? councilModels.length : (availableModels?.models?.length || 0);

  // Group models by tier
  const modelsByTier = {};
  if (availableModels?.models) {
    for (const model of availableModels.models) {
      const tier = model.tier || 'other';
      if (!modelsByTier[tier]) modelsByTier[tier] = [];
      modelsByTier[tier].push(model);
    }
  }

  const renderModelConfig = () => {
    if (!showModelConfig || !availableModels?.models) return null;

    return (
      <div className="ci-model-config-panel">
        <div className="ci-model-config-header">
          <span className="ci-model-config-title">Council Members</span>
          <button className="gc-btn gc-btn-ghost ci-model-reset" onClick={resetModels}>
            Reset to defaults
          </button>
        </div>

        {Object.entries(modelsByTier).map(([tier, models]) => {
          const tierInfo = TIER_CONFIG[tier] || { label: tier, color: '#666' };
          return (
            <div key={tier} className="ci-model-tier">
              <div className="ci-model-tier-label" style={{ color: tierInfo.color }}>
                {tierInfo.label || tier}
              </div>
              {models.map(model => (
                <label key={model.id} className="ci-model-checkbox">
                  <input
                    type="checkbox"
                    checked={isModelSelected(model.id)}
                    onChange={() => toggleModel(model.id)}
                  />
                  <span className="ci-model-name">{model.name || model.id}</span>
                </label>
              ))}
            </div>
          );
        })}

        <div className="ci-model-chairman">
          <span className="ci-model-config-title">Chairman Model</span>
          <select
            className="gc-input ci-chairman-select"
            value={chairmanModel || ''}
            onChange={(e) => setChairmanModel(e.target.value || null)}
          >
            <option value="">Default</option>
            {availableModels.models.map(m => (
              <option key={m.id} value={m.id}>{m.name || m.id}</option>
            ))}
          </select>
        </div>
      </div>
    );
  };

  const renderInputForm = () => (
    <div className="ci-input-area">
      {renderModelConfig()}
      <form className="input-form" onSubmit={handleSubmit}>
        <div className="ci-input-row">
          <button
            type="button"
            className={`ci-model-config-toggle ${showModelConfig ? 'active' : ''}`}
            onClick={() => setShowModelConfig(!showModelConfig)}
            title="Configure council models"
          >
            <IconGear size={16} />
            {councilModels && <span className="ci-model-count">{selectedCount}</span>}
          </button>
          <textarea
            ref={inputRef}
            className="message-input"
            placeholder="Ask your question... (Shift+Enter for new line, Enter to send)"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            rows={2}
          />
          <button type="submit" className="send-button" disabled={!input.trim() || isLoading}>
            <IconSend size={18} />
          </button>
        </div>
      </form>
    </div>
  );

  if (!conversation) {
    return (
      <div className="chat-interface">
        <div className="messages-container">
          <div className="empty-state">
            <IconSoul size={48} className="empty-state-icon" />
            <h2>LLM Council</h2>
            <p>Ask a question and receive responses from multiple AI models, anonymized rankings, and a synthesized answer.</p>
            <div className="quick-start-grid">
              {QUICK_START_SUGGESTIONS.map(s => (
                <button key={s.label} className="quick-start-card" onClick={() => handleQuickStart(s.prompt)}>
                  <span className="quick-start-label">{s.label}</span>
                  <span className="quick-start-desc">{s.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
        {renderInputForm()}
      </div>
    );
  }

  return (
    <div className="chat-interface">
      <div className="messages-container">
        {conversation.messages.length === 0 ? (
          <div className="empty-state">
            <IconSoul size={48} className="empty-state-icon" />
            <h2>Start a conversation</h2>
            <p>Ask a question to consult the LLM Council</p>
            <div className="quick-start-grid">
              {QUICK_START_SUGGESTIONS.map(s => (
                <button key={s.label} className="quick-start-card" onClick={() => handleQuickStart(s.prompt)}>
                  <span className="quick-start-label">{s.label}</span>
                  <span className="quick-start-desc">{s.desc}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          conversation.messages.map((msg, index) => (
            <div key={index} className="message-group">
              {msg.role === 'user' ? (
                <div className="user-message">
                  <div className="message-label">You</div>
                  <div className="message-content">
                    <div className="markdown-content">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="assistant-message">
                  <div className="message-label">LLM Council</div>

                  {msg.loading?.stage1 && (
                    <div className="stage-loading">
                      <div className="spinner"></div>
                      <span>Running Stage 1: Collecting individual responses...</span>
                    </div>
                  )}
                  {msg.stage1 && <Stage1 responses={msg.stage1} />}

                  {msg.loading?.stage2 && (
                    <div className="stage-loading">
                      <div className="spinner"></div>
                      <span>Running Stage 2: Peer rankings...</span>
                    </div>
                  )}
                  {msg.stage2 && (
                    <Stage2
                      rankings={msg.stage2}
                      labelToModel={msg.metadata?.label_to_model}
                      aggregateRankings={msg.metadata?.aggregate_rankings}
                    />
                  )}

                  {msg.loading?.stage3 && (
                    <div className="stage-loading">
                      <div className="spinner"></div>
                      <span>Running Stage 3: Final synthesis...</span>
                    </div>
                  )}
                  {msg.stage3 && <Stage3 finalResponse={msg.stage3} responseCount={msg.stage1?.length} />}
                </div>
              )}
            </div>
          ))
        )}

        {isLoading && (
          <div className="loading-indicator">
            <div className="spinner"></div>
            <span>Consulting the council...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input form — ALWAYS visible */}
      {renderInputForm()}
    </div>
  );
}
