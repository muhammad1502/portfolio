import { useEffect } from 'react';

export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

const SPOTLIGHT_TARGETS = '.card, .contact-card';

/**
 * Card light effects, one delegated listener each for the whole page.
 * - Mouse/trackpad: while the pointer is over a card, its position goes into
 *   --mx / --my and site.css paints a soft glow there (the spotlight).
 * - Touch/pen: a tap sets the same position and adds .is-tapped for one short
 *   ripple of that glow, so phones get feedback from exactly where you tapped.
 */
export function useSpotlight() {
  useEffect(() => {
    const setPoint = (card: HTMLElement, x: number, y: number, tilt = false) => {
      const r = card.getBoundingClientRect();
      // Cards can be mid-"settle" (scaled), so convert to unscaled card coordinates.
      const sx = card.offsetWidth / Math.max(r.width, 1);
      const sy = card.offsetHeight / Math.max(r.height, 1);
      card.style.setProperty('--mx', `${(x - r.left) * sx}px`);
      card.style.setProperty('--my', `${(y - r.top) * sy}px`);
      if (!tilt) return;
      // Tilt toward the cursor. Max angle shrinks with card size, so a wide
      // Experience card barely moves while a small contact card tilts ~2deg.
      const max = Math.min(2, 600 / Math.max(r.width, 1));
      const px = (x - r.left) / r.width - 0.5;
      const py = (y - r.top) / r.height - 0.5;
      card.style.setProperty('--ry', `${(px * 2 * max).toFixed(2)}deg`);
      card.style.setProperty('--rx', `${(-py * 2 * max).toFixed(2)}deg`);
    };
    const cardOf = (e: Event) => (e.target as Element | null)?.closest?.<HTMLElement>(SPOTLIGHT_TARGETS) ?? null;

    let frame = 0;
    let last: PointerEvent | null = null;
    const paint = () => {
      frame = 0;
      const card = last && cardOf(last);
      if (last && card) setPoint(card, last.clientX, last.clientY, !prefersReducedMotion());
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      last = e;
      if (!frame) frame = requestAnimationFrame(paint);
    };
    const onDown = (e: PointerEvent) => {
      if (e.pointerType === 'mouse' || prefersReducedMotion()) return;
      const card = cardOf(e);
      if (!card) return;
      setPoint(card, e.clientX, e.clientY);
      card.classList.remove('is-tapped');
      void card.offsetWidth; // restart the ripple on quick repeat taps
      card.classList.add('is-tapped');
    };
    const onEnd = (e: AnimationEvent) => {
      if (e.animationName === 'tap-glow') (e.target as Element).classList.remove('is-tapped');
    };

    const hoverPointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (hoverPointer) document.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerdown', onDown, { passive: true });
    document.addEventListener('animationend', onEnd);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('animationend', onEnd);
    };
  }, []);
}

/** A light haptic tick on phones that support it (Android). iOS Safari has no
 *  Vibration API, so this quietly does nothing there. */
export function haptic(ms = 8) {
  try {
    if (window.matchMedia('(pointer: coarse)').matches) navigator.vibrate?.(ms);
  } catch {
    /* unsupported */
  }
}

/** Scroll to the top without leaving "#top" (or any hash) in the address, and
 *  move focus to <main> so keyboard users continue from the top. */
export function scrollToTop() {
  window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  if (window.location.hash) {
    window.history.replaceState(null, '', window.location.pathname + window.location.search);
  }
  document.getElementById('main')?.focus({ preventScroll: true });
}

const SETTLE_TARGETS = '[data-settle]';

/**
 * Scroll-linked effects, driven by scroll position (not time), so nothing is
 * ever hidden or waiting:
 * - [data-settle] elements (cards, headlines) get --settle 0..1 as they rise
 *   from the bottom of the viewport; site.css turns that into a small glide
 *   up and scale from 96%. Off under reduced motion.
 * - The hero gets --recede 0..1 as you scroll past it (it shrinks back and
 *   dims a little). Off under reduced motion.
 * - About words ([data-word]) light up from secondary to primary text as they
 *   pass the reading line. Colour only, so it also runs under reduced motion.
 */
export function useScrollEffects() {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('scroll-fx');
    let frame = 0;

    const update = () => {
      frame = 0;
      const vh = window.innerHeight;
      const reduce = prefersReducedMotion();

      document.querySelectorAll<HTMLElement>(SETTLE_TARGETS).forEach((el) => {
        if (reduce) {
          el.style.removeProperty('--settle');
          return;
        }
        const top = el.getBoundingClientRect().top;
        const p = Math.min(1, Math.max(0, (vh - top) / (vh * 0.3)));
        el.style.setProperty('--settle', p.toFixed(3));
      });

      const hero = document.querySelector<HTMLElement>('[data-recede]');
      if (hero) {
        if (reduce) hero.style.removeProperty('--recede');
        else {
          const r = hero.getBoundingClientRect();
          const p = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height)));
          hero.style.setProperty('--recede', p.toFixed(3));
        }
      }

      // Reading line at 62% of the viewport height: words above it are lit.
      const line = vh * 0.62;
      document.querySelectorAll<HTMLElement>('[data-words]').forEach((block) => {
        const words = block.querySelectorAll<HTMLElement>('[data-word]');
        const br = block.getBoundingClientRect();
        if (br.bottom < line) {
          words.forEach((w) => w.classList.add('is-lit'));
          return;
        }
        if (br.top > line) {
          words.forEach((w) => w.classList.remove('is-lit'));
          return;
        }
        words.forEach((w) => w.classList.toggle('is-lit', w.getBoundingClientRect().top < line));
      });
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    // Enable the word colour fade only after the first frame, so the page
    // starts in its correct lit/unlit state instead of animating into it.
    const ready = requestAnimationFrame(() => root.classList.add('scroll-fx-ready'));
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(ready);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      root.classList.remove('scroll-fx', 'scroll-fx-ready');
    };
  }, []);
}
