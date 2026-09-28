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
    const setPoint = (card: HTMLElement, x: number, y: number) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${x - r.left}px`);
      card.style.setProperty('--my', `${y - r.top}px`);
    };
    const cardOf = (e: Event) => (e.target as Element | null)?.closest?.<HTMLElement>(SPOTLIGHT_TARGETS) ?? null;

    let frame = 0;
    let last: PointerEvent | null = null;
    const paint = () => {
      frame = 0;
      const card = last && cardOf(last);
      if (last && card) setPoint(card, last.clientX, last.clientY);
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
