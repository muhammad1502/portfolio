import { useEffect, useRef, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { haptic, scrollToTop } from '../lib/motion';

const R = 21; // ring radius inside the 48px button
const CIRCUMFERENCE = 2 * Math.PI * R;

/**
 * A floating button (all screen sizes) that appears once you've
 * scrolled past the first screen. Its ring fills with reading progress; a
 * tap glides back to the top. Hidden, it's inert and out of the tab order.
 */
export function BackToTop() {
  const [shown, setShown] = useState(false);
  const ref = useRef<HTMLButtonElement>(null);
  const ringRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      ringRef.current?.setAttribute('stroke-dashoffset', String(CIRCUMFERENCE * (1 - ratio)));
      setShown(window.scrollY > window.innerHeight * 0.8);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  // Hidden: inert, so it's out of the tab order and the accessibility tree.
  useEffect(() => {
    ref.current?.toggleAttribute('inert', !shown);
  }, [shown]);

  return (
    <button
      ref={ref}
      type="button"
      className={`back-to-top${shown ? ' is-shown' : ''}`}
      aria-label="Back to top"
      aria-hidden={!shown}
      onClick={() => {
        haptic();
        scrollToTop();
      }}
    >
      <svg className="back-to-top-ring" width="48" height="48" viewBox="0 0 48 48" aria-hidden="true">
        <circle cx="24" cy="24" r={R} fill="none" stroke="var(--divider)" strokeWidth="2" />
        <circle
          ref={ringRef}
          cx="24"
          cy="24"
          r={R}
          fill="none"
          stroke="var(--progress)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE}
          transform="rotate(-90 24 24)"
        />
      </svg>
      <ArrowUp size={18} strokeWidth={2} aria-hidden="true" />
    </button>
  );
}
