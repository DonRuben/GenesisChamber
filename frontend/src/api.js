/**
 * API client for the LLM Council backend.
 */

const API_BASE = 'http://localhost:8001';

export const api = {
  /**
   * List all conversations.
   */
  async listConversations() {
    const response = await fetch(`${API_BASE}/api/conversations`);
    if (!response.ok) {
      throw new Error('Failed to list conversations');
    }
    return response.json();
  },

  /**
   * Create a new conversation.
   */
  async createConversation() {
    const response = await fetch(`${API_BASE}/api/conversations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });
    if (!response.ok) {
      throw new Error('Failed to create conversation');
    }
    return response.json();
  },

  /**
   * Get a specific conversation.
   */
  async getConversation(conversationId) {
    const response = await fetch(
      `${API_BASE}/api/conversations/${conversationId}`
    );
    if (!response.ok) {
      throw new Error('Failed to get conversation');
    }
    return response.json();
  },

  /**
   * Send a message in a conversation.
   */
  async sendMessage(conversationId, content) {
    const response = await fetch(
      `${API_BASE}/api/conversations/${conversationId}/message`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      }
    );
    if (!response.ok) {
      throw new Error('Failed to send message');
    }
    return response.json();
  },

  /**
   * Send a message and receive streaming updates.
   * @param {string} conversationId - The conversation ID
   * @param {string} content - The message content
   * @param {function} onEvent - Callback function for each event: (eventType, data) => void
   * @returns {Promise<void>}
   */
  async sendMessageStream(conversationId, content, onEvent) {
    const response = await fetch(
      `${API_BASE}/api/conversations/${conversationId}/message/stream`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to send message');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          try {
            const event = JSON.parse(data);
            onEvent(event.type, event);
          } catch (e) {
            console.error('Failed to parse SSE event:', e);
          }
        }
      }
    }
  },

  // === GENESIS CHAMBER API ===

  async listSouls() {
    const response = await fetch(`${API_BASE}/api/souls`);
    if (!response.ok) throw new Error('Failed to list souls');
    return response.json();
  },

  async listPresets() {
    const response = await fetch(`${API_BASE}/api/simulation/presets`);
    if (!response.ok) throw new Error('Failed to list presets');
    return response.json();
  },

  async listSimulations() {
    const response = await fetch(`${API_BASE}/api/simulations`);
    if (!response.ok) throw new Error('Failed to list simulations');
    return response.json();
  },

  async getSimulationStatus(simId) {
    const response = await fetch(`${API_BASE}/api/simulation/${simId}/status`);
    if (!response.ok) throw new Error('Failed to get simulation status');
    return response.json();
  },

  async getSimulationState(simId) {
    const response = await fetch(`${API_BASE}/api/simulation/${simId}/state`);
    if (!response.ok) throw new Error('Failed to get simulation state');
    return response.json();
  },

  async getRoundResults(simId, roundNum) {
    const response = await fetch(`${API_BASE}/api/simulation/${simId}/round/${roundNum}`);
    if (!response.ok) throw new Error('Failed to get round results');
    return response.json();
  },

  async getTranscript(simId) {
    const response = await fetch(`${API_BASE}/api/simulation/${simId}/transcript`);
    if (!response.ok) throw new Error('Failed to get transcript');
    return response.json();
  },

  async approveGate(simId, roundNum, decision, notes = '') {
    const response = await fetch(
      `${API_BASE}/api/simulation/${simId}/gate/${roundNum}/approve`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision, notes }),
      }
    );
    if (!response.ok) throw new Error('Failed to approve gate');
    return response.json();
  },

  async startSimulation(config) {
    const response = await fetch(`${API_BASE}/api/simulation/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ config }),
    });
    if (!response.ok) throw new Error('Failed to start simulation');
    return response.json();
  },

  async startSimulationStream(config, onEvent) {
    const response = await fetch(`${API_BASE}/api/simulation/start/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ config }),
    });
    if (!response.ok) throw new Error('Failed to start simulation stream');

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const event = JSON.parse(line.slice(6));
            onEvent(event.type, event);
          } catch (e) {
            console.error('Failed to parse SSE event:', e);
          }
        }
      }
    }
  },

  async getPresentation(simId) {
    const response = await fetch(`${API_BASE}/api/simulation/${simId}/presentation`);
    if (!response.ok) throw new Error('Failed to get presentation');
    return response.blob();
  },

  async generateImages(simId) {
    const response = await fetch(`${API_BASE}/api/simulation/${simId}/generate-images`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to generate images');
    return response.json();
  },

  async getImages(simId) {
    const response = await fetch(`${API_BASE}/api/simulation/${simId}/images`);
    if (!response.ok) throw new Error('Failed to get images');
    return response.json();
  },

  async getVideoTiers(simId) {
    const response = await fetch(`${API_BASE}/api/simulation/${simId}/video-tiers`);
    if (!response.ok) throw new Error('Failed to get video tiers');
    return response.json();
  },

  async generateVideos(simId, quality = 'standard') {
    const response = await fetch(`${API_BASE}/api/simulation/${simId}/generate-videos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quality }),
    });
    if (!response.ok) throw new Error('Failed to generate videos');
    return response.json();
  },

  async getVideos(simId) {
    const response = await fetch(`${API_BASE}/api/simulation/${simId}/videos`);
    if (!response.ok) throw new Error('Failed to get videos');
    return response.json();
  },

  async quickStart(preset = 'quick_test', brief = null, participants = null) {
    const params = new URLSearchParams({ preset });
    if (brief) params.set('brief', brief);
    const response = await fetch(`${API_BASE}/api/simulation/quick-start?${params}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(participants ? { participants } : {}),
    });
    if (!response.ok) throw new Error('Failed to quick-start simulation');
    return response.json();
  },
};
