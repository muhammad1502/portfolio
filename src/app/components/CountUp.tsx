import { useEffect, useRef, useState } from 'react';
import { prefersReducedMotion } from '../lib/useReveal';

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
  const [current, setCurrent] = useState<number | null>(() =>
    target === null || typeof IntersectionObserver === 'undefined' || prefersReducedMotion() ? target : 0,
  );

  useEffect(() => {
    if (target === null || current === target) return;
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
    // Run once per mount; `current` is intentionally not a dependency.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  return (
    <span ref={ref} className="stat-value">
      <span className="visually-hidden">{value}</span>
      <span className="stat-value-ghost" aria-hidden="true">
        {value}
      </span>
      <span aria-hidden="true">{target === null ? value : `${current}${suffix}`}</span>
    </span>
  );
}
