import { useState, useEffect } from 'react';

export const MOBILE = 640;
export const TABLET = 1024;
export const WIDE = 1440;

export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    const mql = window.matchMedia(query);
    const handler = (e) => setMatches(e.matches);
    mql.addEventListener('change', handler);
    setMatches(mql.matches);
    return () => mql.removeEventListener('change', handler);
  }, [query]);

  return matches;
}

export function useIsMobile() {
  return useMediaQuery(`(max-width: ${MOBILE - 1}px)`);
}

export function useIsTablet() {
  return useMediaQuery(`(min-width: ${MOBILE}px) and (max-width: ${TABLET - 1}px)`);
}

export function useIsDesktop() {
  return useMediaQuery(`(min-width: ${TABLET}px)`);
}
