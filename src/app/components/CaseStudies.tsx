import { BookOpen } from 'lucide-react';
import { caseStudies } from './resume-data';
import type { ResumeEntry } from './resume-data';

/** Anonymized investigations from SOC work. Each card opens its write-up in the details modal. */
export function CaseStudies({ onOpen }: { onOpen: (entry: ResumeEntry) => void }) {
  return (
    <section id="cases" className="section" aria-labelledby="cases-title">
      <div className="viewport-content">
        <h2 id="cases-title" className="section-headline" data-settle="">
          Case studies
        </h2>
        <p className="section-intro" data-settle="">
          Real investigations from my SOC work, with client details removed.
        </p>
        <div className="card-grid">
          {caseStudies.map((c) => (
            <article className="card project-card" key={c.id} data-settle="" aria-labelledby={`${c.id}-title`}>
              <p className="tile-eyebrow">{c.kind}</p>
              <h3 id={`${c.id}-title`} className="card-title">
                {c.title}
              </h3>
              <p className="tile-description">{c.summary}</p>
              <p className="project-tech">{c.tools}</p>
              <div className="button-group">
                <button type="button" className="button" aria-haspopup="dialog" onClick={() => onOpen(c.writeup)}>
                  <BookOpen size={17} strokeWidth={2} aria-hidden="true" />
                  Read write-up
                  <span className="visually-hidden">: {c.title}</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
