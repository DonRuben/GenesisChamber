// ─────────────────────────────────────────────────────────
// GENESIS CHAMBER V4 — MODEL HOOKS
// Dynamic model resolution: backend → fallback to mock
// ─────────────────────────────────────────────────────────

import { useMemo } from 'react';
import { useAppStore } from '../stores/appStore';
import { MODELS, MODEL_MAP, MODEL_TIERS } from '../data/mock';

/**
 * Returns { models, modelMap, tiers } from backend availableModels
 * or hardcoded MODELS fallback when offline.
 */
export function useModels() {
  const availableModels = useAppStore((s) => s.availableModels);

  return useMemo(() => {
    const models = availableModels || MODELS;
    const modelMap = availableModels
      ? Object.fromEntries(models.map((m) => [m.id, m]))
      : MODEL_MAP;
    return { models, modelMap, tiers: MODEL_TIERS };
  }, [availableModels]);
}

/**
 * Returns a lookup function (modelId) => modelInfo with graceful fallback.
 */
export function useModelLookup() {
  const { modelMap } = useModels();

  return useMemo(() => {
    return (modelId) =>
      modelMap[modelId] || {
        name: modelId?.split('/').pop() || 'Unknown',
        color: '#6B7280',
        letter: '?',
      };
  }, [modelMap]);
}
