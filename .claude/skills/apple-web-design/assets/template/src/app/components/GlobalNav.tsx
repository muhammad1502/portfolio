import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, MouseEvent } from 'react';
import { ThemeIcon } from './ThemeIcon';
import { navAction, site } from '../../site-data';
import { sections } from '../lib/sections';
import { icons } from '../lib/icons';
import type { ThemeMode } from '../lib/useThemeMode';
import { haptic, scrollToTop } from '../lib/motion';
import { useActiveSection } from '../lib/useActiveSection';

interface GlobalNavProps {
  mode: ThemeMode;
  onToggleTheme: () => void;
  onOpenPalette: () => void;
}



const MOBILE_QUERY = '(max-width: 833px)';

/**
 * Sticky, translucent 44px bar in the style of apple.com's global nav. At
 * ≤833px the links collapse into a full-screen flyout behind a two-line menu
 * glyph that morphs into a close "X".
 */
export function GlobalNav({ mode, onToggleTheme, onOpenPalette }: GlobalNavProps) {
  const [open, setOpen] = useState(false);
  const active = useActiveSection();
  const [indicator, setIndicator] = useState<{ x: number; w: number } | null>(null);
  const flyoutRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const isDark = mode === 'dark';
  // The platform's own shortcut: ⌘K on Apple devices, Ctrl K elsewhere. Set
  // after mount so the pre-rendered HTML and the first client render match.
  const [isApple, setIsApple] = useState(false);
  useEffect(() => setIsApple(/Mac|iPhone|iPad/.test(navigator.userAgent)), []);


  // Position the underline under the active link (and keep it there on resize).
  useEffect(() => {
    const place = () => {
      const list = listRef.current;
      const link = active ? list?.querySelector<HTMLElement>(`a[href="#${active}"]`) : null;
      if (!list || !link || !link.offsetParent) {
        setIndicator(null);
        return;
      }
      const lr = list.getBoundingClientRect();
      const r = link.getBoundingClientRect();
      setIndicator({ x: r.left - lr.left + 8, w: r.width - 16 });
    };
    place();
    window.addEventListener('resize', place);
    return () => window.removeEventListener('resize', place);
  }, [active]);

  // Keep the closed flyout out of the tab order and accessibility tree.
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

  // Older shared links may still carry "#top"; drop it so the address stays clean.
  useEffect(() => {
    if (window.location.hash === '#top') {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }, []);

  // The name link scrolls to the top without adding "#top" to the address, so
  // a copied link is always the plain site URL. Focus moves to <main> so
  // keyboard users continue from the top of the page.
  const goToTop = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    close();
    scrollToTop();
  };

  return (
    <nav className={`globalnav${open ? ' is-open' : ''}`} aria-label="Global">
      <div className="globalnav-content">
        <a className="globalnav-brand" href="/" onClick={goToTop}>
          {site.name}
        </a>

        <ul className="globalnav-list" ref={listRef}>
          {sections.map((s) => (
            <li key={s.id}>
              <a
                className={`globalnav-link${active === s.id ? ' is-current' : ''}`}
                href={`#${s.id}`}
                aria-current={active === s.id ? 'location' : undefined}
              >
                {s.label}
              </a>
            </li>
          ))}
          <li
            className="globalnav-indicator"
            aria-hidden="true"
            style={
              indicator
                ? { opacity: 1, transform: `translateX(${indicator.x}px)`, width: indicator.w }
                : { opacity: 0 }
            }
          />
        </ul>

        <div className="globalnav-actions">
          <button
            type="button"
            className="globalnav-icon globalnav-kbd"
            onClick={onOpenPalette}
            aria-label="Quick actions"
            aria-keyshortcuts="Control+K Meta+K"
            title={`Quick actions (${isApple ? '⌘K' : 'Ctrl+K'})`}
          >
            <kbd>{isApple ? '⌘K' : 'Ctrl K'}</kbd>
          </button>
          <button
            type="button"
            className="globalnav-icon"
            onClick={() => {
              haptic();
              onToggleTheme();
            }}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDark ? 'Light mode' : 'Dark mode'}
          >
            <ThemeIcon mode={mode} />
          </button>
          {navAction &&
            (() => {
              const Icon = icons[navAction.icon];
              return (
                <a
                  className="globalnav-icon"
                  href={navAction.href}
                  {...(navAction.download ? { download: navAction.download } : {})}
                  aria-label={navAction.label}
                  title={navAction.label}
                >
                  <Icon size={17} strokeWidth={1.75} aria-hidden="true" />
                </a>
              );
            })()}
          <button
            type="button"
            className="globalnav-icon globalnav-menu-toggle"
            onClick={() => {
              haptic();
              setOpen((o) => !o);
            }}
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
                className={`globalnav-flyout-link${active === s.id ? ' is-current' : ''}`}
                href={`#${s.id}`}
                aria-current={active === s.id ? 'location' : undefined}
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
