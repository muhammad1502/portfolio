import { navAction, site, sections as data } from '../../site-data';
import { sections } from '../lib/sections';

const contacts = data.flatMap((s) => (s.type === 'contact' ? s.items : []));

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
          {contacts.length > 0 && (
            <div>
              <h2 className="footer-heading">Connect</h2>
              <ul>
                {contacts.map((c) => (
                  <li key={c.id}>
                    {c.href.startsWith('mailto:') || c.href.startsWith('tel:') ? (
                      <a href={c.href}>{c.label}</a>
                    ) : (
                      <a href={c.href} target="_blank" rel="noopener noreferrer">
                        {c.label}
                        <span className="visually-hidden">, opens in a new tab</span>
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {navAction && (
            <div>
              <h2 className="footer-heading">More</h2>
              <ul>
                <li>
                  <a href={navAction.href} {...(navAction.download ? { download: navAction.download } : {})}>
                    {navAction.label}
                  </a>
                </li>
              </ul>
            </div>
          )}
        </nav>
        <div className="footer-legal">
          <p>
            Copyright © {new Date().getFullYear()} {site.owner}.
          </p>
          <p>{site.location}</p>
        </div>
      </div>
    </footer>
  );
}
