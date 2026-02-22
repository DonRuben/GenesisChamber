import { useAppStore } from '../stores/appStore';
import { T, TLight } from '../design/tokens';

/** Single source of truth for themed tokens. */
export function useTokens() {
  const theme = useAppStore((s) => s.theme);
  return theme === 'light' ? { ...T, ...TLight } : T;
}
