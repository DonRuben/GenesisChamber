import { useEffect } from 'react';

/**
 * Register keyboard shortcuts.
 * @param {Object} keyMap — { 'mod+k': handler, 'Escape': handler, '1': handler }
 * 'mod' maps to Ctrl on Windows/Linux, Cmd on Mac.
 */
export function useKeyboard(keyMap) {
  useEffect(() => {
    if (!keyMap || Object.keys(keyMap).length === 0) return;

    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;

    const handler = (e) => {
      for (const [combo, fn] of Object.entries(keyMap)) {
        const parts = combo.toLowerCase().split('+');
        const key = parts.pop();
        const needsMod = parts.includes('mod');
        const needsShift = parts.includes('shift');
        const needsAlt = parts.includes('alt');

        const modPressed = isMac ? e.metaKey : e.ctrlKey;

        if (needsMod && !modPressed) continue;
        if (needsShift && !e.shiftKey) continue;
        if (needsAlt && !e.altKey) continue;
        if (e.key.toLowerCase() !== key) continue;

        e.preventDefault();
        fn(e);
        return;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [keyMap]);
}
