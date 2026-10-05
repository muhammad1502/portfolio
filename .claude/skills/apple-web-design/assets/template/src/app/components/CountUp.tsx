import { useEffect, useRef, useState } from 'react';
import { prefersReducedMotion } from '../lib/motion';
import { useIsomorphicLayoutEffect } from '../lib/useThemeMode';

const DURATION_MS = 1400;

/**
 * Counts the leading number of `value` up from 0 when it scrolls into view
 * ("100+" -> 0…100 then "+", "18/18" -> 0…18 then "/18"). The final value is
 * always in the DOM as an invisible "ghost" that reserves the width (no layout
 * jitter) and a visually-hidden copy is what screen readers get.
 */
export function CountUp({ value }: { value: string }) {
  const match = /^(\d+)(.*)$/.exec(value);
  const target = match ? Number(match[1]) : null;
  const suffix = match ? match[2] : '';

  const ref = useRef<HTMLSpanElement>(null);
  // Starts at the final value (what the pre-rendered HTML shows), then resets
  // to 0 before the first paint when the count-up will actually run.
  const [current, setCurrent] = useState<number | null>(target);
  const [armed, setArmed] = useState(false);
  useIsomorphicLayoutEffect(() => {
    if (target !== null && typeof IntersectionObserver !== 'undefined' && !prefersReducedMotion()) {
      setCurrent(0);
      setArmed(true);
    }
  }, []);

  // Desktop delight: hovering a number replays its count-up.
  const rafRef = useRef(0);
  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);
  const animate = () => {
    if (target === null) return;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / DURATION_MS);
      setCurrent(Math.round((1 - Math.pow(1 - t, 3)) * target));
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(tick);
  };
  const replay = () => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches || prefersReducedMotion()) return;
    animate();
  };

  // Once armed (reset to 0), count up the first time it scrolls into view.
  useEffect(() => {
    if (target === null || !armed) return;
    const el = ref.current;
    if (!el) return;

    let raf = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / DURATION_MS);
          const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
          setCurrent(Math.round(eased * target));
          if (t < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.6 },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [target, armed]);

  return (
    <span ref={ref} className="stat-value" onMouseEnter={replay}>
      <span className="visually-hidden">{value}</span>
      <span className="stat-value-ghost" aria-hidden="true">
        {value}
      </span>
      <span aria-hidden="true">{target === null ? value : `${current}${suffix}`}</span>
    </span>
  );
}
