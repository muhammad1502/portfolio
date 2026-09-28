import { useEffect } from 'react';

export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

const SPOTLIGHT_TARGETS = '.card, .contact-card';

/**
 * Cursor spotlight: while the pointer is over a card, write its position into
 * --mx / --my on that card; site.css paints a soft glow there. One delegated
 * listener for the whole page, and only on devices with a real hover pointer.
 */
export function useSpotlight() {
  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    let frame = 0;
    let last: PointerEvent | null = null;
    const paint = () => {
      frame = 0;
      const e = last;
      const card = (e?.target as Element | null)?.closest?.<HTMLElement>(SPOTLIGHT_TARGETS);
      if (!e || !card) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - r.left}px`);
      card.style.setProperty('--my', `${e.clientY - r.top}px`);
    };
    const onMove = (e: PointerEvent) => {
      last = e;
      if (!frame) frame = requestAnimationFrame(paint);
    };
    document.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener('pointermove', onMove);
    };
  }, []);
}
