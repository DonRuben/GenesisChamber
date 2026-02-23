// ─────────────────────────────────────────────────────────
// GENESIS CHAMBER V4 — BACKEND STATUS HOOK
// Polls health check on mount + every 30s
// ─────────────────────────────────────────────────────────

import { useEffect, useRef } from 'react';
import { useAppStore } from '../stores/appStore';
import { healthCheck } from '../services/api';

export function useBackendStatus() {
  const setBackendOnline = useAppStore((s) => s.setBackendOnline);
  const intervalRef = useRef(null);

  useEffect(() => {
    const check = async () => {
      try {
        const data = await healthCheck();
        console.log('[GC] Backend health check: OK', data);
        setBackendOnline(true);
      } catch (err) {
        console.warn('[GC] Backend health check: FAILED', err.message);
        setBackendOnline(false);
      }
    };

    check();
    intervalRef.current = setInterval(check, 30000);

    return () => clearInterval(intervalRef.current);
  }, [setBackendOnline]);
}
