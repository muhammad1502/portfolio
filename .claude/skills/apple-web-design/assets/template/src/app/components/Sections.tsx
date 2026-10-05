import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, BookOpen, Info } from 'lucide-react';
import type { Card, Details, Section, Tile } from '../../site-data';
import { renderMetrics, renderWords } from '../lib/metrics';
import { haptic, prefersReducedMotion } from '../lib/motion';
import { icons } from '../lib/icons';
import { CountUp } from './CountUp';
import { ButtonLink } from './ButtonLink';
import { OutboundButton } from './OutboundButton';

type OpenDetails = (details: Details) => void;

/** Renders one section from site-data.ts by its type. */
export function SectionBlock({ section, onOpen }: { section: Section; onOpen: OpenDetails }) {
  const titleId = `${section.id}-title`;
  return (
    <section id={section.id} className="section" aria-labelledby={titleId}>
      <div className="viewport-content">
        <h2 id={titleId} className="section-headline" data-settle="">
          {section.headline}
        </h2>
        {section.intro && (
          <p className="section-intro" data-settle="">
            {section.intro}
          </p>
        )}
        {section.type === 'text' && <TextBody section={section} />}
        {section.type === 'tiles' && (
          <div className="tiles">
            {section.items.map((t) => (
              <TileCard key={t.id} tile={t} onOpen={onOpen} />
            ))}
          </div>
        )}
        {section.type === 'cards' && (
          <CardGrid items={section.items} carousel={!!section.carousel} columns={section.columns ?? 2} label={section.label} onOpen={onOpen} />
        )}
        {section.type === 'list' && (
          <ul className="card list-card" data-settle="">
            {section.items.map((item) => (
              <li className="list-row" key={item.id}>
                <div>
                  <p className="list-name">{item.name}</p>
                  {item.meta && <p className="list-meta">{item.meta}</p>}
                </div>
                {item.note && <p className="list-note">{item.note}</p>}
              </li>
            ))}
          </ul>
        )}
        {section.type === 'contact' && (
          <>
            <ul className="contact-grid">
              {section.items.map((c) => {
                const Icon = icons[c.icon];
                const external = !c.href.startsWith('mailto:') && !c.href.startsWith('tel:');
                return (
                  <li key={c.id} data-settle="">
                    <a className="contact-card" href={c.href} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                      <Icon className="contact-card-icon" size={28} strokeWidth={1.5} aria-hidden="true" />
                      <span className="contact-card-label">{c.label}</span>
                      <span className="contact-card-value">
                        {c.value}
                        <ArrowUpRight size={17} strokeWidth={2} aria-hidden="true" />
                      </span>
                      {external && <span className="visually-hidden">, opens in a new tab</span>}
                    </a>
                  </li>
                );
              })}
            </ul>
            {section.cta && (
              <div className="contact-cta">
                <ButtonLink cta={section.cta} />
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

/** Prose that lights up word by word as you read, with an optional terminal line. */
function TextBody({ section }: { section: Extract<Section, { type: 'text' }> }) {
  return (
    <>
      {section.terminal && (
        <p className="terminal-line">
          <span className="terminal-prompt" aria-hidden="true">
            {section.terminal.prompt}
          </span>
          <span className="terminal-out">{section.terminal.output}</span>
          <span className="terminal-caret" aria-hidden="true" />
        </p>
      )}
      <div className="about-copy" data-words="">
        {section.paragraphs.map((para) => (
          <p key={para.slice(0, 24)}>{renderWords(para)}</p>
        ))}
      </div>
    </>
  );
}

/** Wide card: eyebrow, title, subtitle, meta, description, count-up stats and
 *  a matched pair of buttons ("Learn more" opens the details modal). */
function TileCard({ tile, onOpen }: { tile: Tile; onOpen: OpenDetails }) {
  const headingId = `${tile.id}-title`;
  return (
    <article className="card tile" data-settle="" aria-labelledby={headingId}>
      <div>
        {tile.eyebrow && <p className="tile-eyebrow">{tile.eyebrow}</p>}
        <h3 id={headingId} className="card-title">
          {tile.title}
        </h3>
        {tile.subtitle && <p className="tile-subhead">{tile.subtitle}</p>}
        {tile.meta && <p className="tile-meta">{tile.meta}</p>}
        {tile.description && <p className="tile-description">{renderMetrics(tile.description)}</p>}

        {tile.stats && (
          <dl className="stats">
            {tile.stats.map((s) => (
              <div className="stat" key={s.label}>
                <dt className="stat-label">{s.label}</dt>
                <dd>
                  <CountUp value={s.value} />
                </dd>
              </div>
            ))}
          </dl>
        )}

        {(tile.details || tile.link) && (
          <div className="button-group">
            {tile.details && (
              <button type="button" className="button" aria-haspopup="dialog" onClick={() => onOpen(tile.details!)}>
                <Info size={17} strokeWidth={2} aria-hidden="true" />
                Learn more
                <span className="visually-hidden">: {tile.title}</span>
              </button>
            )}
            {tile.link && <OutboundButton href={tile.link.href} label={tile.link.label} context={tile.title} />}
          </div>
        )}
      </div>
    </article>
  );
}

/**
 * Card grid. Desktop: two columns. Phones, when `carousel` is set: a
 * swipeable, snapping carousel that peeks the next card, with page dots
 * below. The active dot stretches into a pill; tapping a dot jumps there.
 */
function CardGrid({
  items,
  carousel,
  columns,
  label,
  onOpen,
}: {
  items: Card[];
  carousel: boolean;
  columns: 2 | 3;
  label: string;
  onOpen: OpenDetails;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  // Active card = the one whose centre is closest to the track's centre.
  useEffect(() => {
    const track = trackRef.current;
    if (!track || !carousel) return;
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
  }, [carousel]);

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
    <>
      <div className={`card-grid${columns === 3 ? ' cols-3' : ''}${carousel ? ' carousel-track' : ''}`} ref={trackRef}>
        {items.map((c) => (
          <article className="card item-card" key={c.id} data-settle="" aria-labelledby={`${c.id}-title`}>
            {c.eyebrow && <p className="tile-eyebrow">{c.eyebrow}</p>}
            <h3 id={`${c.id}-title`} className="card-title">
              {c.title}
            </h3>
            <p className="tile-description">{renderMetrics(c.summary)}</p>
            {c.points && (
              <ul className="point-list">
                {c.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            )}
            {c.footnote && <p className="item-footnote">{c.footnote}</p>}
            {(c.details || c.link) && (
              <div className="button-group">
                {c.details && (
                  <button type="button" className="button" aria-haspopup="dialog" onClick={() => onOpen(c.details!)}>
                    <BookOpen size={17} strokeWidth={2} aria-hidden="true" />
                    Read more
                    <span className="visually-hidden">: {c.title}</span>
                  </button>
                )}
                {c.link && <OutboundButton href={c.link.href} label={c.link.label} context={c.title} />}
              </div>
            )}
          </article>
        ))}
      </div>
      {carousel && (
        <div className="carousel-dots" role="group" aria-label={`Choose: ${label}`}>
          {items.map((c, i) => (
            <button
              key={c.id}
              type="button"
              className={`carousel-dot${i === active ? ' is-active' : ''}`}
              aria-label={`Show ${c.title} (${i + 1} of ${items.length})`}
              aria-current={i === active ? 'true' : undefined}
              onClick={() => goTo(i)}
            >
              <span aria-hidden="true" />
            </button>
          ))}
        </div>
      )}
    </>
  );
}
