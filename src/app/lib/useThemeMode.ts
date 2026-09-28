import { useCallback, useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { prefersReducedMotion } from './motion';

export type ThemeMode = 'light' | 'dark';

// Must match the pre-paint script in index.html.
export const THEME_KEY = 'theme-mode';

// Matches the fallback .theme-fading transition in site.css.
const FADE_MS = 450;

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

  const modeRef = useRef(mode);
  modeRef.current = mode;

  useEffect(() => {
    applyToDocument(mode);
  }, [mode]);

  useEffect(() => {
    if (overridden) return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e: MediaQueryListEvent) => setMode(e.matches ? 'dark' : 'light');
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [overridden]);

  /**
   * Switch theme with a crossfade. Browsers with the View Transitions API fade
   * a snapshot of the old page into the new one; others get a short colour
   * transition on every element instead. Reduced motion: instant.
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

    if (prefersReducedMotion()) {
      commit();
      return;
    }
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

function applyToDocument(mode: ThemeMode) {
  document.documentElement.dataset.theme = mode;
  const meta = document.querySelector('meta[name="theme-color"]:not([media])');
  meta?.setAttribute('content', mode === 'dark' ? '#161617' : '#fafafc');
}
