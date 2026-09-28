import { useState } from 'react';
import { ArrowDownToLine } from 'lucide-react';
import { profile } from './resume-data';
import { RESUME_FILENAME, RESUME_URL } from '../lib/sections';
import profilePhoto from '../../imports/muhammad-abdullah.jpg';

// Initials: the fallback if the photo fails to load.
const initials = profile.name
  .split(' ')
  .map((part) => part[0])
  .join('')
  .slice(0, 2)
  .toUpperCase();

export function Hero() {
  const [photoFailed, setPhotoFailed] = useState(false);

  return (
    <section id="top" className="hero" aria-labelledby="hero-headline">
      <div className="viewport-content hero-animate">
        {photoFailed ? (
          <div className="hero-photo hero-initials" aria-hidden="true">
            {initials}
          </div>
        ) : (
          <img
            className="hero-photo"
            src={profilePhoto}
            alt={`Photo of ${profile.name}`}
            width={144}
            height={144}
            decoding="async"
            fetchPriority="high"
            onError={() => setPhotoFailed(true)}
          />
        )}
        <h1 id="hero-headline" className="hero-headline">
          {profile.name}
        </h1>
        <p className="hero-subhead">
          {profile.title} in {profile.location}
        </p>
        <p className="hero-tagline">{profile.tagline}</p>
        <div className="button-group">
          <a className="button" href={RESUME_URL} download={RESUME_FILENAME}>
            <ArrowDownToLine size={17} strokeWidth={2} aria-hidden="true" />
            Download CV
          </a>
          <a className="button button-secondary" href="#contact">
            Contact
          </a>
        </div>
      </div>
    </section>
  );
}
