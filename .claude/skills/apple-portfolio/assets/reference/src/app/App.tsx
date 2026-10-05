import { useEffect, useState } from 'react';
import { ArrowDownToLine, ArrowUpRight, Mail } from 'lucide-react';
import { Github, Linkedin } from './components/brand-icons';
import { GlobalNav } from './components/GlobalNav';
import { Hero } from './components/Hero';
import { ExperienceTile } from './components/ExperienceTile';
import { DetailsModal } from './components/DetailsModal';
import { Footer } from './components/Footer';
import { BackToTop } from './components/BackToTop';
import { Projects } from './components/Projects';
import { CaseStudies } from './components/CaseStudies';
import { CommandPalette } from './components/CommandPalette';
import { Toaster } from './components/Toast';
import { SectionChips } from './components/SectionChips';
import { profile, contacts, experience, skills, certifications } from './components/resume-data';
import type { ResumeEntry } from './components/resume-data';
import { renderMetrics, renderWords, splitList } from './lib/metrics';
import { useThemeMode } from './lib/useThemeMode';
import { useScrollEffects, useSpotlight } from './lib/motion';
import { RESUME_FILENAME, RESUME_URL } from './lib/sections';

const contactIcons: Record<string, typeof Mail> = { email: Mail, linkedin: Linkedin, github: Github };

export default function App() {
  const { mode, toggle } = useThemeMode();
  const [openEntry, setOpenEntry] = useState<ResumeEntry | null>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);
  useSpotlight();
  useScrollEffects();

  // ⌘K (Mac) / Ctrl+K (others) opens the quick-actions palette from anywhere.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && !e.altKey && !e.shiftKey && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to main content
      </a>
      <GlobalNav mode={mode} onToggleTheme={toggle} onOpenPalette={() => setPaletteOpen(true)} />
      <SectionChips />

      <main id="main" tabIndex={-1}>
        <Hero />

        <section id="about" className="section" aria-labelledby="about-title">
          <div className="viewport-content">
            <h2 id="about-title" className="section-headline" data-settle="">
              About
            </h2>
            <p className="whoami">
              <span className="whoami-prompt" aria-hidden="true">
                $ whoami
              </span>
              <span className="whoami-out">muhammad abdullah · soc analyst · islamabad, pk</span>
              <span className="whoami-caret" aria-hidden="true" />
            </p>
            <div className="about-copy" data-words="">
              {profile.about.map((para) => (
                <p key={para.slice(0, 24)}>{renderWords(para)}</p>
              ))}
            </div>
          </div>
        </section>

        <section id="experience" className="section" aria-labelledby="experience-title">
          <div className="viewport-content">
            <h2 id="experience-title" className="section-headline" data-settle="">
              Experience
            </h2>
            <div className="tiles">
              {experience.map((e) => (
                <ExperienceTile key={e.id} entry={e} onLearnMore={setOpenEntry} />
              ))}
            </div>
          </div>
        </section>

        <CaseStudies onOpen={setOpenEntry} />

        <Projects onOpenWriteup={setOpenEntry} />

        <section id="skills" className="section" aria-labelledby="skills-title">
          <div className="viewport-content">
            <h2 id="skills-title" className="section-headline" data-settle="">
              Skills and tools
            </h2>
            <div className="card-grid">
              {skills.map((s) => (
                <article className="card" key={s.id} data-settle="" aria-labelledby={`${s.id}-title`}>
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
            <h2 id="certifications-title" className="section-headline" data-settle="">
              Certifications and training
            </h2>
            <ul className="card cert-list" data-settle="">
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

        <section id="contact" className="section" aria-labelledby="contact-title">
          <div className="viewport-content">
            <h2 id="contact-title" className="section-headline" data-settle="">
              Contact
            </h2>
            <ul className="contact-grid">
              {contacts.map((c) => {
                const Icon = contactIcons[c.id] ?? Mail;
                const external = !c.href?.startsWith('mailto:');
                return (
                  <li key={c.id} data-settle="">
                    <a
                      className="contact-card"
                      href={c.href}
                      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    >
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
      <BackToTop />
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} mode={mode} onToggleTheme={toggle} />
      <Toaster />
      <DetailsModal entry={openEntry} onClose={() => setOpenEntry(null)} />
    </>
  );
}
