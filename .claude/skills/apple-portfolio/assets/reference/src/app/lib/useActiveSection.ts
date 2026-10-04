import { useEffect, useState } from 'react';
import { sections } from './sections';

/**
 * Scrollspy: the section crossing the middle band of the viewport is
 * "current". Shared by the nav underline, the phone menu and the phone
 * section chips so they always agree.
 */
export function useActiveSection(): string | null {
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    const els = sections.map((s) => document.getElementById(s.id)).filter((el): el is HTMLElement => !!el);
    const visible = new Map<string, boolean>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => visible.set(e.target.id, e.isIntersecting));
        const current = sections.find((s) => visible.get(s.id));
        setActive(current ? current.id : null);
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
  return active;
}
