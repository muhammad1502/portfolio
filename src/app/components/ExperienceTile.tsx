import { ArrowUpRight } from 'lucide-react';
import type { ResumeEntry } from './resume-data';
import { renderMetrics } from '../lib/metrics';
import { CountUp } from './CountUp';
import { linkLabel } from './links';

interface ExperienceTileProps {
  entry: ResumeEntry;
  onLearnMore: (entry: ResumeEntry) => void;
}

/**
 * One role, as a card matching the rest of the site: period, title,
 * company, location, headline numbers and a matched pair of buttons.
 * "Learn more" opens the entry's full detail in the modal.
 */
export function ExperienceTile({ entry, onLearnMore }: ExperienceTileProps) {
  const hasDetails = Boolean(entry.sections?.length || entry.bullets?.length || entry.roles?.length);
  const headingId = `${entry.id}-title`;

  return (
    <article className="card tile" aria-labelledby={headingId}>
      <div>
        <p className="tile-eyebrow">{entry.period}</p>
        <h3 id={headingId} className="card-title">
          {entry.title}
        </h3>
        {entry.subtitle && <p className="tile-subhead">{entry.subtitle}</p>}
        {entry.meta && <p className="tile-meta">{entry.meta}</p>}
        {entry.description && <p className="tile-description">{renderMetrics(entry.description)}</p>}

        {entry.stats && (
          <dl className="stats">
            {entry.stats.map((s) => (
              <div className="stat" key={s.label}>
                <dt className="stat-label">{s.label}</dt>
                <dd>
                  <CountUp value={s.value} />
                </dd>
              </div>
            ))}
          </dl>
        )}

        {(hasDetails || entry.href) && (
          <div className="button-group">
            {hasDetails && (
              <button
                type="button"
                className="button"
                onClick={() => onLearnMore(entry)}
                aria-haspopup="dialog"
                aria-label={`Learn more about ${entry.title}${entry.subtitle ? `, ${entry.subtitle}` : ''}`}
              >
                Learn more
              </button>
            )}
            {entry.href && (
              <a
                className="button button-secondary"
                href={entry.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${linkLabel(entry.href)}: ${entry.subtitle ?? entry.title} (opens in a new tab)`}
              >
                {linkLabel(entry.href)}
                <ArrowUpRight size={17} strokeWidth={2} aria-hidden="true" />
              </a>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
