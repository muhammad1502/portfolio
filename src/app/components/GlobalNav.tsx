import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { ArrowDownToLine, Moon, Sun } from 'lucide-react';
import { profile } from './resume-data';
import { sections, RESUME_FILENAME, RESUME_URL } from '../lib/sections';
import type { ThemeMode } from '../lib/useThemeMode';

interface GlobalNavProps {
  mode: ThemeMode;
  onToggleTheme: () => void;
}

const MOBILE_QUERY = '(max-width: 833px)';

/**
 * Sticky, translucent 44px bar in the style of apple.com's global nav. At
 * ≤833px the links collapse into a full-screen flyout behind a two-line menu
 * glyph that morphs into a close "X".
 */
export function GlobalNav({ mode, onToggleTheme }: GlobalNavProps) {
  const [open, setOpen] = useState(false);
  const flyoutRef = useRef<HTMLDivElement>(null);
  const isDark = mode === 'dark';

  // Keep the closed flyout out of the tab order and accessibility tree. Set
  // directly because React 18 doesn't forward the `inert` attribute.
  useEffect(() => {
    flyoutRef.current?.toggleAttribute('inert', !open);
  }, [open]);

  // While the flyout is open: lock page scroll, close on Escape, and close if
  // the viewport grows past the mobile breakpoint.
  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const prev = root.style.overflow;
    root.style.overflow = 'hidden';

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    const mq = window.matchMedia(MOBILE_QUERY);
    const onResize = (e: MediaQueryListEvent) => {
      if (!e.matches) setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    mq.addEventListener('change', onResize);
    return () => {
      root.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
      mq.removeEventListener('change', onResize);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <nav className={`globalnav${open ? ' is-open' : ''}`} aria-label="Global">
      <div className="globalnav-content">
        <a className="globalnav-brand" href="#top" onClick={close}>
          {profile.name}
        </a>

        <ul className="globalnav-list">
          {sections.map((s) => (
            <li key={s.id}>
              <a className="globalnav-link" href={`#${s.id}`}>
                {s.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="globalnav-actions">
          <button
            type="button"
            className="globalnav-icon"
            onClick={onToggleTheme}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDark ? 'Light mode' : 'Dark mode'}
          >
            {isDark ? <Moon size={17} strokeWidth={1.75} /> : <Sun size={17} strokeWidth={1.75} />}
          </button>
          <a
            className="globalnav-icon"
            href={RESUME_URL}
            download={RESUME_FILENAME}
            aria-label="Download CV (PDF)"
            title="Download CV"
          >
            <ArrowDownToLine size={17} strokeWidth={1.75} />
          </a>
          <button
            type="button"
            className="globalnav-icon globalnav-menu-toggle"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="globalnav-flyout"
            aria-label={open ? 'Close menu' : 'Menu'}
          >
            <span className="menu-glyph" aria-hidden="true">
              <span />
              <span />
            </span>
          </button>
        </div>
      </div>

      <div id="globalnav-flyout" ref={flyoutRef} className="globalnav-flyout">
        <ul>
          {sections.map((s, i) => (
            <li key={s.id}>
              <a
                className="globalnav-flyout-link"
                href={`#${s.id}`}
                onClick={close}
                style={{ '--i': i } as CSSProperties}
              >
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
