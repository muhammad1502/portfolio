import type { CSSProperties, ReactNode } from 'react';
import { profile, contacts, experience, projects, skills, certifications, type ResumeEntry } from './resume-data';

/**
 * The downloadable CV (public/resume.pdf), rendered at `/?print` and saved to
 * PDF with Chromium (see README). Reads the same resume-data.ts as the site.
 *
 * Deliberately a single-column, table-free layout with standard headings and
 * real text, so applicant tracking systems parse it in reading order.
 */

const INK = '#1d1d1f';
const MUTED = '#6e6e73';
const RULE = '#d2d2d7';
const LINK = '#0066cc';
const SANS = '"Inter Variable", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif';

// **metric** runs render bold, matching the site's emphasis.
const METRIC = /\*\*(.+?)\*\*/g;
function emphasize(text: string): ReactNode {
  if (!text.includes('**')) return text;
  const out: ReactNode[] = [];
  let last = 0;
  let i = 0;
  for (const m of text.matchAll(METRIC)) {
    const start = m.index ?? 0;
    if (start > last) out.push(text.slice(last, start));
    out.push(
      <strong key={i++} style={{ fontWeight: 600, color: INK }}>
        {m[1]}
      </strong>,
    );
    last = start + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

const heading: CSSProperties = {
  margin: '12px 0 5px',
  paddingBottom: 3,
  borderBottom: `1px solid ${RULE}`,
  fontSize: 10.5,
  fontWeight: 600,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  color: INK,
};
const body: CSSProperties = { fontSize: 9.5, lineHeight: 1.42, color: INK };
const link: CSSProperties = { color: LINK, textDecoration: 'none' };

function Entry({ e }: { e: ResumeEntry }) {
  return (
    <div style={{ breakInside: 'avoid', marginBottom: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, ...body }}>
        <div>
          <span style={{ fontWeight: 600 }}>{e.title}</span>
          {e.subtitle && <span>, {e.subtitle}</span>}
          {e.meta && <span style={{ color: MUTED }}> · {e.meta}</span>}
        </div>
        <div style={{ flex: 'none', color: MUTED }}>{e.period}</div>
      </div>
      {e.description && <div style={{ ...body, marginTop: 2 }}>{emphasize(e.description)}</div>}
      {e.sections && (
        <ul style={{ margin: '3px 0 0', paddingLeft: 14 }}>
          {e.sections.map((s) => (
            <li key={s.label} style={{ ...body, marginTop: 1.5 }}>
              <span style={{ fontWeight: 600 }}>{s.label}:</span> {emphasize(s.text)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function PrintResume() {
  const contactLine = [
    { text: contacts.find((c) => c.id === 'email')?.value, href: contacts.find((c) => c.id === 'email')?.href },
    { text: 'linkedin.com/in/mabddullah', href: profile.siteHref },
    { text: 'github.com/muhammad1502', href: contacts.find((c) => c.id === 'github')?.href },
    { text: profile.portfolio, href: profile.portfolioHref },
  ];

  return (
    <div style={{ background: '#fff', color: INK, fontFamily: SANS, WebkitFontSmoothing: 'antialiased' }}>
      <header>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 600, letterSpacing: '-0.01em' }}>{profile.name}</h1>
        <div style={{ fontSize: 11.5, color: MUTED, marginTop: 2 }}>
          {profile.title} · {profile.location}
        </div>
        <div style={{ ...body, marginTop: 5 }}>
          {contactLine.map((c, i) => (
            <span key={c.text}>
              {i > 0 && <span style={{ color: MUTED }}> | </span>}
              <a href={c.href} style={{ ...link, whiteSpace: 'nowrap' }}>
                {c.text}
              </a>
            </span>
          ))}
        </div>
      </header>

      <h2 style={heading}>Summary</h2>
      <p style={{ ...body, margin: 0 }}>{profile.cvSummary}</p>

      <h2 style={heading}>Work experience</h2>
      {experience.map((e) => (
        <Entry key={e.id} e={e} />
      ))}

      <h2 style={heading}>Projects</h2>
      {projects.map((p) => (
        <div key={p.id} style={{ ...body, marginBottom: 2 }}>
          <a href={p.href} style={{ ...link, fontWeight: 600 }}>
            {p.name}
          </a>
          <span style={{ color: MUTED }}> · {p.kind}</span>
          <span>: {p.cvLine}</span>
        </div>
      ))}

      <h2 style={heading}>Skills</h2>
      {skills.map((s) => (
        <div key={s.id} style={{ ...body, marginBottom: 2 }}>
          <span style={{ fontWeight: 600 }}>{s.label}:</span> {s.value}
        </div>
      ))}

      <h2 style={heading}>Certifications and training</h2>
      {certifications.map((c) => (
        <div key={c.id} style={{ ...body, marginBottom: 2 }}>
          <span style={{ fontWeight: 600 }}>{c.name}</span>
          {!c.name.includes(c.issuer) && <span>, {c.issuer}</span>}
          <span style={{ color: MUTED }}>
            {' '}
            · {c.kind}
            {c.note ? ` · ${c.note}` : ''}
          </span>
        </div>
      ))}

    </div>
  );
}
