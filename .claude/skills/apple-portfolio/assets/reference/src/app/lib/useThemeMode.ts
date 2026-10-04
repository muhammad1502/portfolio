import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';

export type ThemeMode = 'light' | 'dark';

// Must match the pre-paint script in index.html.
export const THEME_KEY = 'theme-mode';

// Matches the fallback .theme-fading transition in site.css.
const FADE_MS = 800;

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
  // The page is pre-rendered, so the first render must match the server
  // ('light'). The real mode (already applied to <html> by theme-init.js) is
  // read before the first paint, so there's no flash and no hydration mismatch.
  const [mode, setMode] = useState<ThemeMode>('light');
  const [overridden, setOverridden] = useState(false);

  useIsomorphicLayoutEffect(() => {
    const attr = document.documentElement.dataset.theme;
    setMode(attr === 'dark' || attr === 'light' ? attr : (readStored() ?? systemMode()));
    setOverridden(readStored() !== null);
  }, []);

  const modeRef = useRef(mode);
  modeRef.current = mode;

  useEffect(() => {
    if (overridden) return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e: MediaQueryListEvent) => {
      const next: ThemeMode = e.matches ? 'dark' : 'light';
      setMode(next);
      applyToDocument(next);
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [overridden]);

  /**
   * Switch theme with a crossfade. Browsers with the View Transitions API fade
   * a snapshot of the old page into the new one; others get a short colour
   * transition on every element instead. A fade has no movement, so it stays
   * on under prefers-reduced-motion (site.css drops the icon's spin/scale).
   */
  const toggle = useCallback(() => {
    const next: ThemeMode = modeRef.current === 'light' ? 'dark' : 'light';
    setOverridden(true);
    try {
      window.localStorage.setItem(THEME_KEY, next);
    } catch {
      /* storage blocked, the choice still applies for this visit */
    }

    const commit = () => {
      flushSync(() => setMode(next));
      applyToDocument(next); // the transition snapshots the DOM right after this
    };

    const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown };
    if (doc.startViewTransition) {
      doc.startViewTransition(commit);
      return;
    }
    const root = document.documentElement;
    root.classList.add('theme-fading');
    commit();
    window.setTimeout(() => root.classList.remove('theme-fading'), FADE_MS);
  }, []);

  return { mode, toggle };
}

// useLayoutEffect in the browser, useEffect during server rendering (where it
// never runs), which avoids React's server-side useLayoutEffect warning.
export const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

function applyToDocument(mode: ThemeMode) {
  document.documentElement.dataset.theme = mode;
  const meta = document.querySelector('meta[name="theme-color"]:not([media])');
  meta?.setAttribute('content', mode === 'dark' ? '#161617' : '#fafafc');
}
