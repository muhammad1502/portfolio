import { useEffect, useRef, useState } from 'react';
import { BookOpen, Github } from 'lucide-react';
import { projects } from './resume-data';
import type { ResumeEntry } from './resume-data';
import { haptic, prefersReducedMotion } from '../lib/motion';

/**
 * Projects. Desktop: the usual card grid. Phones (site.css): a swipeable,
 * snapping carousel that peeks the next card, with page dots below. The
 * active dot stretches into a pill; tapping a dot jumps to that card.
 */
export function Projects({ onOpenWriteup }: { onOpenWriteup: (entry: ResumeEntry) => void }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  // Active card = the one whose centre is closest to the track's centre.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const mid = track.scrollLeft + track.clientWidth / 2;
      const cards = Array.from(track.children) as HTMLElement[];
      let best = 0;
      cards.forEach((c, i) => {
        const d = Math.abs(c.offsetLeft + c.offsetWidth / 2 - mid);
        if (d < Math.abs(cards[best].offsetLeft + cards[best].offsetWidth / 2 - mid)) best = i;
      });
      setActive(best);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    track.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      track.removeEventListener('scroll', onScroll);
    };
  }, []);

  const goTo = (i: number) => {
    const track = trackRef.current;
    const card = track?.children[i] as HTMLElement | undefined;
    if (!track || !card) return;
    haptic();
    track.scrollTo({
      left: card.offsetLeft - (track.clientWidth - card.offsetWidth) / 2,
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    });
  };

  return (
    <section id="projects" className="section" aria-labelledby="projects-title">
      <div className="viewport-content">
        <h2 id="projects-title" className="section-headline" data-settle="">
          Projects
        </h2>
        <div className="card-grid projects-track" ref={trackRef}>
          {projects.map((p) => (
            <article
              className="card project-card"
              key={p.id}
              data-settle=""
              aria-labelledby={`${p.id}-title`}
            >
              <p className="tile-eyebrow">{p.kind}</p>
              <h3 id={`${p.id}-title`} className="card-title">
                {p.name}
              </h3>
              <p className="tile-description">{p.description}</p>
              <ul className="skill-list">
                {p.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
              <p className="project-tech">{p.tech}</p>
              <div className="button-group">
                {p.writeup && (
                  <button
                    type="button"
                    className="button"
                    aria-haspopup="dialog"
                    onClick={() => onOpenWriteup(p.writeup!)}
                  >
                    <BookOpen size={17} strokeWidth={2} aria-hidden="true" />
                    Read write-up
                    <span className="visually-hidden">: {p.name}</span>
                  </button>
                )}
                <a
                  className="button button-secondary"
                  href={p.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github size={17} strokeWidth={2} aria-hidden="true" />
                  View on GitHub
                  {/* The name starts with the visible text (WCAG 2.5.3); context follows. */}
                  <span className="visually-hidden">: {p.name}, opens in a new tab</span>
                </a>
              </div>
            </article>
          ))}
        </div>
        <div className="carousel-dots" role="group" aria-label="Choose a project">
          {projects.map((p, i) => (
            <button
              key={p.id}
              type="button"
              className={`carousel-dot${i === active ? ' is-active' : ''}`}
              aria-label={`Show ${p.name} (${i + 1} of ${projects.length})`}
              aria-current={i === active ? 'true' : undefined}
              onClick={() => goTo(i)}
            >
              <span aria-hidden="true" />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
