/**
 * API client for the LLM Council backend.
 */

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8001').replace(/\/+$/, '');

// Log the API URL so users can verify in devtools
console.log('[Genesis Chamber] API URL:', API_BASE);

export const api = {
  /**
   * Health check — ping the backend. Returns true if reachable.
   */
  async healthCheck() {
    const response = await fetch(`${API_BASE}/`, { signal: AbortSignal.timeout(10000) });
    if (!response.ok) throw new Error(`Backend returned ${response.status}`);
    return response.json();
  },

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
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop();

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const event = JSON.parse(line.slice(6));
            onEvent(event.type, event);
          } catch (e) {
            // Ignore parse errors for partial chunks
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

  async uploadSoul(file, team = 'custom', color = '#666666') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('team', team);
    formData.append('color', color);
    const response = await fetch(`${API_BASE}/api/souls/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) throw new Error('Failed to upload soul');
    return response.json();
  },

  async getTeams() {
    const response = await fetch(`${API_BASE}/api/config/teams`);
    if (!response.ok) throw new Error('Failed to get teams');
    return response.json();
  },

  async listPresets() {
    const response = await fetch(`${API_BASE}/api/simulation/presets`);
    if (!response.ok) throw new Error('Failed to list presets');
    return response.json();
  },

  async getAvailableModels() {
    const response = await fetch(`${API_BASE}/api/config/models`);
    if (!response.ok) throw new Error('Failed to get available models');
    return response.json();
  },

  async getDefaultParticipants() {
    const response = await fetch(`${API_BASE}/api/config/participants`);
    if (!response.ok) throw new Error('Failed to get default participants');
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
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop(); // Keep incomplete last line in buffer

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const event = JSON.parse(line.slice(6));
            onEvent(event.type, event);
          } catch (e) {
            // Ignore parse errors for partial chunks
          }
        }
      }
    }
    // Process any remaining buffered data
    if (buffer.startsWith('data: ')) {
      try {
        const event = JSON.parse(buffer.slice(6));
        onEvent(event.type, event);
      } catch (e) {
        // Ignore
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

  async uploadReference(file) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch(`${API_BASE}/api/upload/reference`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      throw new Error(errBody.detail || 'Failed to upload reference file');
    }
    return response.json();
  },

  getUploadUrl(uploadId, path = '') {
    return `${API_BASE}/api/uploads/${uploadId}/${path}`;
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
