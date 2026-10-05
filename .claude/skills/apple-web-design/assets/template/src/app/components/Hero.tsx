import { useState } from 'react';
import { hero } from '../../site-data';
import { ButtonLink } from './ButtonLink';

// Initials: the fallback if the hero image fails to load.
const initials = hero.headline
  .split(' ')
  .map((part) => part[0])
  .join('')
  .slice(0, 2)
  .toUpperCase();

export function Hero() {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <section id="top" className="hero" aria-labelledby="hero-headline">
      <div className="viewport-content hero-content" data-recede="">
        {hero.image &&
          (imageFailed ? (
            <div className="hero-photo hero-initials" aria-hidden="true">
              {initials}
            </div>
          ) : (
            <img
              className="hero-photo"
              src={hero.image.src}
              alt={hero.image.alt}
              width={144}
              height={144}
              decoding="async"
              fetchPriority="high"
              onError={() => setImageFailed(true)}
            />
          ))}
        <h1 id="hero-headline" className="hero-headline">
          {hero.headline}
        </h1>
        <p className="hero-subhead">{hero.subhead}</p>
        <p className="hero-tagline">{hero.tagline}</p>
        <div className="button-group">
          <ButtonLink cta={hero.primary} />
          {hero.secondary && <ButtonLink cta={hero.secondary} secondary />}
        </div>
      </div>
    </section>
  );
}
