import { useEffect, useRef } from 'react';
import { useIsDesktop } from './useMediaQuery';

/**
 * Touch swipe gesture detection.
 * @param {React.RefObject} ref — element to listen on
 * @param {{ onSwipeLeft?, onSwipeRight?, onSwipeDown?, threshold? }} opts
 */
export function useSwipe(ref, { onSwipeLeft, onSwipeRight, onSwipeDown, threshold = 50 } = {}) {
  const isDesktop = useIsDesktop();
  const start = useRef(null);

  useEffect(() => {
    if (isDesktop) return;
    const el = ref.current;
    if (!el) return;

    const onStart = (e) => {
      const touch = e.touches[0];
      start.current = { x: touch.clientX, y: touch.clientY };
    };

    const onEnd = (e) => {
      if (!start.current) return;
      const touch = e.changedTouches[0];
      const dx = touch.clientX - start.current.x;
      const dy = touch.clientY - start.current.y;
      start.current = null;

      // Determine dominant axis
      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > threshold && onSwipeRight) onSwipeRight();
        else if (dx < -threshold && onSwipeLeft) onSwipeLeft();
      } else {
        if (dy > threshold && onSwipeDown) onSwipeDown();
      }
    };

    el.addEventListener('touchstart', onStart, { passive: true });
    el.addEventListener('touchend', onEnd, { passive: true });
    return () => {
      el.removeEventListener('touchstart', onStart);
      el.removeEventListener('touchend', onEnd);
    };
  }, [ref, isDesktop, onSwipeLeft, onSwipeRight, onSwipeDown, threshold]);
}
