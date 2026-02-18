import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import Stage1 from './Stage1';
import Stage2 from './Stage2';
import Stage3 from './Stage3';
import { IconSoul, IconSend } from './Icons';
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
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input);
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
        <form className="input-form" onSubmit={handleSubmit}>
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
        </form>
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

      {/* Input form — ALWAYS visible (fixed critical bug: was hidden after first message) */}
      <form className="input-form" onSubmit={handleSubmit}>
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
      </form>
    </div>
  );
}
