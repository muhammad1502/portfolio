import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, X } from 'lucide-react';
import type { ResumeEntry } from './resume-data';
import { renderMetrics } from '../lib/metrics';
import { prefersReducedMotion } from '../lib/motion';
import { linkLabel } from './links';

interface DetailsModalProps {
  entry: ResumeEntry | null;
  onClose: () => void;
}

const CLOSE_MS = 250; // matches .modal.is-closing in site.css

/**
 * Apple-style overlay built on the native <dialog>: focus is trapped and
 * Escape closes it for free. Also closes on backdrop click and the round
 * close button; page scroll is locked while it's open.
 */
export function DetailsModal({ entry, onClose }: DetailsModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog || !entry) return;
    if (!dialog.open) dialog.showModal();
    const root = document.documentElement;
    const prev = root.style.overflow;
    root.style.overflow = 'hidden';
    return () => {
      root.style.overflow = prev;
    };
  }, [entry]);

  const requestClose = () => {
    const dialog = ref.current;
    if (!dialog || closing) return;
    if (prefersReducedMotion()) {
      dialog.close();
      return;
    }
    setClosing(true);
    window.setTimeout(() => {
      setClosing(false);
      dialog.close();
    }, CLOSE_MS);
  };

  const headingId = entry ? `${entry.id}-modal-title` : undefined;

  return (
    <dialog
      ref={ref}
      className={`modal${closing ? ' is-closing' : ''}`}
      aria-labelledby={headingId}
      // Native close (Escape, or dialog.close()) -> tell the parent.
      onClose={onClose}
      onCancel={(e) => {
        e.preventDefault();
        requestClose();
      }}
      // A click whose target is the <dialog> itself landed on the backdrop.
      onClick={(e) => {
        if (e.target === e.currentTarget) requestClose();
      }}
    >
      {entry && (
        <>
          <button type="button" className="modal-close" onClick={requestClose} aria-label="Close">
            <X size={18} strokeWidth={2.25} aria-hidden="true" />
          </button>
          {/* Focusable so keyboard users can scroll it even when it holds no links. */}
          <div className="modal-scroll" tabIndex={0} role="region" aria-labelledby={headingId}>
            <p className="tile-eyebrow">{entry.period}</p>
            <h2 id={headingId} className="modal-headline">
              {entry.title}
            </h2>
            <p className="modal-subhead">{[entry.subtitle, entry.meta].filter(Boolean).join(' · ')}</p>
            {entry.description && <p className="modal-description">{renderMetrics(entry.description)}</p>}

            {entry.sections && (
              <div className="modal-sections">
                {entry.sections.map((s) => (
                  <section className="modal-section" key={s.label}>
                    <h3 className="modal-section-title">{s.label}</h3>
                    <p className="modal-section-text">{renderMetrics(s.text)}</p>
                  </section>
                ))}
              </div>
            )}

            {entry.bullets && (
              <ul className="modal-sections">
                {entry.bullets.map((b) => (
                  <li className="modal-section modal-section-text" key={b}>
                    {renderMetrics(b)}
                  </li>
                ))}
              </ul>
            )}

            {entry.roles && (
              <div className="modal-sections">
                {entry.roles.map((r) => (
                  <section className="modal-section" key={r.label}>
                    <h3 className="modal-section-title">{r.label}</h3>
                    <p className="modal-section-text">{r.text}</p>
                    {r.description && <p className="modal-section-text">{renderMetrics(r.description)}</p>}
                  </section>
                ))}
              </div>
            )}

            {entry.href && (
              <div className="button-group">
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
              </div>
            )}
          </div>
        </>
      )}
    </dialog>
  );
}
