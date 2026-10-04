import { profile, contacts } from './resume-data';
import { sections, RESUME_FILENAME, RESUME_URL } from '../lib/sections';

/** apple.com-style footer: small grey directory columns over a legal line. */
export function Footer() {
  return (
    <footer className="footer">
      <div className="viewport-content">
        <nav className="footer-directory" aria-label="Footer">
          <div>
            <h2 className="footer-heading">Sections</h2>
            <ul>
              {sections.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`}>{s.label}</a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="footer-heading">Connect</h2>
            <ul>
              {contacts.map((c) => (
                <li key={c.id}>
                  <a
                    href={c.href}
                    {...(c.href?.startsWith('mailto:') ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
                  >
                    {c.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="footer-heading">Resume</h2>
            <ul>
              <li>
                <a href={RESUME_URL} download={RESUME_FILENAME}>
                  Download CV (PDF)
                </a>
              </li>
            </ul>
          </div>
        </nav>
        <div className="footer-legal">
          <p>
            Copyright © {new Date().getFullYear()} {profile.name}.
          </p>
          <p>{profile.location}</p>
        </div>
      </div>
    </footer>
  );
}
