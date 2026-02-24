// ─────────────────────────────────────────────────────────
// GENESIS CHAMBER V4 — SESSION STORAGE
// localStorage persistence for council sessions (stopgap)
// Max 20 sessions, auto-prune oldest
// ─────────────────────────────────────────────────────────

const STORAGE_KEY_PREFIX = 'council_session_';
const MAX_SESSIONS = 20;

export function saveSession(session) {
  const key = `${STORAGE_KEY_PREFIX}${Date.now()}`;
  const data = { ...session, timestamp: Date.now() };
  // Prune oldest if at max
  const existing = listSessions();
  while (existing.length >= MAX_SESSIONS) {
    const oldest = existing.pop();
    try { localStorage.removeItem(oldest.key); } catch (e) {}
  }
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn('[sessionStorage] Failed to save session:', e);
  }
  return key;
}

export function listSessions() {
  const sessions = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(STORAGE_KEY_PREFIX)) {
        const raw = localStorage.getItem(key);
        if (raw) {
          const data = JSON.parse(raw);
          sessions.push({
            key,
            question: data.question || '',
            models: data.models || [],
            timestamp: data.timestamp || 0,
          });
        }
      }
    }
  } catch (e) {
    console.warn('[sessionStorage] Failed to list sessions:', e);
  }
  return sessions.sort((a, b) => b.timestamp - a.timestamp);
}

export function loadSession(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.warn('[sessionStorage] Failed to load session:', e);
    return null;
  }
}

export function deleteSession(key) {
  try {
    localStorage.removeItem(key);
  } catch (e) {
    console.warn('[sessionStorage] Failed to delete session:', e);
  }
}
