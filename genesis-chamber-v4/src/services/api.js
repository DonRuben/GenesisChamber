// ─────────────────────────────────────────────────────────
// GENESIS CHAMBER V4 — API SERVICE LAYER
// All backend communication via native fetch + SSE
// ─────────────────────────────────────────────────────────

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8001';

// ── SSE Stream Reader ──
async function readSSEStream(response, onEvent, signal) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      if (signal?.aborted) break;
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data: ')) continue;
        const jsonStr = trimmed.slice(6);
        if (jsonStr === '[DONE]') return;
        try {
          const event = JSON.parse(jsonStr);
          onEvent(event.type || event.event, event);
        } catch {
          // skip malformed JSON lines
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

// ── Fetch Helpers ──
async function get(path) {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`GET ${path}: ${res.status}`);
  return res.json();
}

async function post(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body != null ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`POST ${path}: ${res.status}`);
  return res.json();
}

async function del(path) {
  const res = await fetch(`${API_BASE}${path}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(`DELETE ${path}: ${res.status}`);
  return res.json();
}

async function patch(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`PATCH ${path}: ${res.status}`);
  return res.json();
}

// ─────────────────────────────────────────────────────────
// API Methods
// ─────────────────────────────────────────────────────────

// ── Health ──
export async function healthCheck() {
  const res = await fetch(`${API_BASE}/`, { signal: AbortSignal.timeout(5000) });
  if (!res.ok) throw new Error(`Health check failed: ${res.status}`);
  return res.json();
}

// ── Conversations ──
export async function listConversations() {
  return get('/api/conversations');
}

export async function createConversation() {
  return post('/api/conversations', {});
}

export async function getConversation(id) {
  return get(`/api/conversations/${id}`);
}

export async function deleteConversation(id) {
  return del(`/api/conversations/${id}`);
}

export async function renameConversation(id, name) {
  return patch(`/api/conversations/${id}/rename`, { name });
}

// ── Council Streaming ──
export async function sendMessageStream(convId, content, onEvent, options = {}) {
  const { models, chairmanModel, thinkingMode, enableWebSearch, modelThinkingModes, signal } = options;

  const body = { content };
  if (models) body.models = models;
  if (chairmanModel) body.chairman_model = chairmanModel;
  if (thinkingMode && thinkingMode !== 'off') body.thinking_mode = thinkingMode;
  if (enableWebSearch) body.enable_web_search = true;
  if (modelThinkingModes && Object.keys(modelThinkingModes).length > 0) {
    body.model_thinking_modes = modelThinkingModes;
  }

  const res = await fetch(`${API_BASE}/api/conversations/${convId}/message/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`Stream failed (${res.status}): ${errText}`);
  }

  await readSSEStream(res, onEvent, signal);
}

// ── Simulations ──
export async function listSimulations() {
  return get('/api/simulations');
}

export async function getSimulationState(simId) {
  return get(`/api/simulation/${simId}/state`);
}

export async function getSimulationStatus(simId) {
  return get(`/api/simulation/${simId}/status`);
}

export async function deleteSimulation(simId) {
  return del(`/api/simulation/${simId}`);
}

export async function startSimulationStream(config, onEvent) {
  const res = await fetch(`${API_BASE}/api/simulation/start/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`Simulation start failed (${res.status}): ${errText}`);
  }

  await readSSEStream(res, onEvent);
}

export async function quickStartSimulation(config) {
  return post('/api/simulation/quick-start', config);
}

// ── Config ──
export async function getDefaultParticipants() {
  return get('/api/config/participants');
}

export async function getAvailableModels() {
  return get('/api/config/models');
}

export async function listPresets() {
  return get('/api/simulation/presets');
}

export async function listSouls() {
  return get('/api/souls');
}

// ── DA Arena ──
export async function extractDAInteractions(simId) {
  return post(`/api/simulation/${simId}/da/extract`, {});
}

export async function getDAInteractions(simId) {
  return get(`/api/simulation/${simId}/da/interactions`);
}

export async function rateDAInteraction(simId, interactionId, rating) {
  return post(`/api/simulation/${simId}/da/rate`, {
    interaction_id: interactionId,
    rating,
  });
}

export async function getDATraining(simId) {
  return get(`/api/simulation/${simId}/da/training`);
}

export async function getDASuggestions(simId) {
  return get(`/api/simulation/${simId}/da/suggestions`);
}

// ── Media / Generated Content ──
export async function getGeneratedContent(simId) {
  return get(`/api/simulation/${simId}/generated`);
}

export async function generateImages(simId, opts = {}) {
  return post(`/api/simulation/${simId}/generate-images`, opts);
}

export async function generateVideos(simId, quality) {
  return post(`/api/simulation/${simId}/generate-videos`, { quality });
}

// ── Exports ──
export function getExportUrl(simId, type) {
  return `${API_BASE}/api/simulation/${simId}/export/${type}`;
}

export function getDownloadAllUrl(simId) {
  return `${API_BASE}/api/simulation/${simId}/download/all`;
}

// ── Uploads ──
export async function uploadReference(file) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE}/api/upload/reference`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
  return res.json();
}
