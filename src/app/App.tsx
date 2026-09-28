import { useState } from 'react';
import { ArrowDownToLine, ArrowUpRight, Github, Linkedin, Mail } from 'lucide-react';
import { GlobalNav } from './components/GlobalNav';
import { Hero } from './components/Hero';
import { ExperienceTile } from './components/ExperienceTile';
import { DetailsModal } from './components/DetailsModal';
import { Footer } from './components/Footer';
import { profile, contacts, experience, skills, certifications, education } from './components/resume-data';
import type { ResumeEntry } from './components/resume-data';
import { renderMetrics, splitList } from './lib/metrics';
import { useThemeMode } from './lib/useThemeMode';
import { RESUME_FILENAME, RESUME_URL } from './lib/sections';

const contactIcons: Record<string, typeof Mail> = { email: Mail, linkedin: Linkedin, github: Github };

export default function App() {
  const { mode, toggle } = useThemeMode();
  const [openEntry, setOpenEntry] = useState<ResumeEntry | null>(null);

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to main content
      </a>
      <GlobalNav mode={mode} onToggleTheme={toggle} />

      <main id="main" tabIndex={-1}>
        <Hero />

        <section id="about" className="section" aria-labelledby="about-title">
          <div className="viewport-content">
            <h2 id="about-title" className="section-headline">
              About
            </h2>
            <div className="about-copy">
              {profile.about.map((para) => (
                <p key={para.slice(0, 24)}>{renderMetrics(para)}</p>
              ))}
            </div>
          </div>
        </section>

        <section id="experience" className="section" aria-labelledby="experience-title">
          <div className="viewport-content">
            <h2 id="experience-title" className="section-headline">
              Experience
            </h2>
            <div className="tiles">
              {experience.map((e) => (
                <ExperienceTile key={e.id} entry={e} onLearnMore={setOpenEntry} />
              ))}
            </div>
          </div>
        </section>

        <section id="skills" className="section" aria-labelledby="skills-title">
          <div className="viewport-content">
            <h2 id="skills-title" className="section-headline">
              Skills and tools
            </h2>
            <div className="card-grid">
              {skills.map((s) => (
                <article className="card" key={s.id} aria-labelledby={`${s.id}-title`}>
                  <h3 id={`${s.id}-title`} className="card-title">
                    {s.label}
                  </h3>
                  <ul className="skill-list">
                    {splitList(s.value).map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="certifications" className="section" aria-labelledby="certifications-title">
          <div className="viewport-content">
            <h2 id="certifications-title" className="section-headline">
              Certifications and training
            </h2>
            <ul className="card cert-list">
              {certifications.map((c) => (
                <li className="cert-row" key={c.id}>
                  <div>
                    <p className="cert-name">{c.name}</p>
                    <p className="cert-meta">
                      {c.issuer} · {c.kind}
                    </p>
                  </div>
                  {c.note && <p className="cert-note">{c.note}</p>}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="education" className="section" aria-labelledby="education-title">
          <div className="viewport-content">
            <h2 id="education-title" className="section-headline">
              Education
            </h2>
            {education.map((e) => (
              <article className="card edu-card" key={e.id} aria-labelledby={`${e.id}-title`}>
                <p className="tile-eyebrow">{e.period}</p>
                <h3 id={`${e.id}-title`} className="card-title">
                  {e.title}
                </h3>
                {e.subtitle && <p className="edu-subtitle">{e.subtitle}</p>}
                {e.meta && <p className="edu-meta">{e.meta}</p>}
                {e.description && <p className="edu-meta">{renderMetrics(e.description)}</p>}
              </article>
            ))}
          </div>
        </section>

        <section id="contact" className="section" aria-labelledby="contact-title">
          <div className="viewport-content">
            <h2 id="contact-title" className="section-headline">
              Contact
            </h2>
            <ul className="contact-grid">
              {contacts.map((c) => {
                const Icon = contactIcons[c.id] ?? Mail;
                const external = !c.href?.startsWith('mailto:');
                return (
                  <li key={c.id}>
                    <a
                      className="contact-card"
                      href={c.href}
                      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                      aria-label={`${c.label}: ${c.value}${external ? ' (opens in a new tab)' : ''}`}
                    >
                      <Icon className="contact-card-icon" size={28} strokeWidth={1.5} aria-hidden="true" />
                      <span className="contact-card-label">{c.label}</span>
                      <span className="contact-card-value">
                        {c.value}
                        <ArrowUpRight size={17} strokeWidth={2} aria-hidden="true" />
                      </span>
                    </a>
                  </li>
                );
              })}
            </ul>
            <div className="contact-cta">
              <a className="button" href={RESUME_URL} download={RESUME_FILENAME}>
                <ArrowDownToLine size={17} strokeWidth={2} aria-hidden="true" />
                Download CV
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <DetailsModal entry={openEntry} onClose={() => setOpenEntry(null)} />
    </>
  );
}
