import { useEffect, useRef } from 'react';
import { sections } from '../lib/sections';
import { useActiveSection } from '../lib/useActiveSection';

/**
 * Phones only (site.css): a slim sticky strip of section chips under the
 * global nav, like the "local nav" on Apple's product pages. The current
 * section's chip is filled and kept in view as you scroll.
 */
export function SectionChips() {
  const active = useActiveSection();
  const trackRef = useRef<HTMLDivElement>(null);

  // Keep the active chip visible by scrolling the strip itself (never the page).
  useEffect(() => {
    const track = trackRef.current;
    const chip = active ? track?.querySelector<HTMLElement>(`a[href="#${active}"]`) : null;
    if (!track || !chip || track.offsetParent === null) return;
    const left = chip.offsetLeft - (track.clientWidth - chip.offsetWidth) / 2;
    track.scrollTo({ left, behavior: 'smooth' });
  }, [active]);

  return (
    <nav className="section-chips" aria-label="Sections">
      <div className="section-chips-track" ref={trackRef}>
        {sections.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className={`section-chip${active === s.id ? ' is-current' : ''}`}
            aria-current={active === s.id ? 'location' : undefined}
          >
            <span>{s.label}</span>
          </a>
        ))}
      </div>
    </nav>
  );
}
