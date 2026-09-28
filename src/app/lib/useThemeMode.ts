import { useCallback, useEffect, useState } from 'react';

export type ThemeMode = 'light' | 'dark';

// Must match the pre-paint script in index.html.
export const THEME_KEY = 'theme-mode';

function readStored(): ThemeMode | null {
  try {
    const v = window.localStorage.getItem(THEME_KEY);
    return v === 'light' || v === 'dark' ? v : null;
  } catch {
    return null;
  }
}

function systemMode(): ThemeMode {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Light/dark mode. Follows the OS until the visitor picks one with the toggle;
 * the pick is stored and wins from then on. The resolved mode is mirrored onto
 * <html data-theme>, which the stylesheet's tokens key off.
 */
export function useThemeMode() {
  const [mode, setMode] = useState<ThemeMode>(() => readStored() ?? systemMode());
  const [overridden, setOverridden] = useState(() => readStored() !== null);

  useEffect(() => {
    document.documentElement.dataset.theme = mode;
    const meta = document.querySelector('meta[name="theme-color"]:not([media])');
    meta?.setAttribute('content', mode === 'dark' ? '#161617' : '#fafafc');
  }, [mode]);

  useEffect(() => {
    if (overridden) return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e: MediaQueryListEvent) => setMode(e.matches ? 'dark' : 'light');
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [overridden]);

  const toggle = useCallback(() => {
    setOverridden(true);
    setMode((m) => {
      const next = m === 'light' ? 'dark' : 'light';
      try {
        window.localStorage.setItem(THEME_KEY, next);
      } catch {
        /* storage blocked, the choice still applies for this visit */
      }
      return next;
    });
  }, []);

  return { mode, toggle };
}
