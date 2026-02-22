import { useMediaQuery } from './useMediaQuery';

/** Returns true when the user prefers reduced motion. */
export function useReducedMotion() {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}
