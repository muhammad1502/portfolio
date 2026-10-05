import { useEffect, useId, useRef, useState } from 'react';
import { X } from 'lucide-react';
import type { Details } from '../../site-data';
import { renderMetrics } from '../lib/metrics';
import { haptic, prefersReducedMotion } from '../lib/motion';
import { OutboundButton } from './OutboundButton';

interface DetailsModalProps {
  entry: Details | null;
  onClose: () => void;
}

const CLOSE_MS = 250; // matches .modal.is-closing in site.css
const PHONE_QUERY = '(max-width: 734px)';
const DISMISS_PX = 110; // drag distance that closes the sheet
const DISMISS_VELOCITY = 0.6; // px per ms: a quick flick closes it too

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

  const resetDrag = () => {
    const dialog = ref.current;
    if (!dialog) return;
    dialog.style.transform = '';
    dialog.style.transition = '';
  };

  const requestClose = () => {
    const dialog = ref.current;
    if (!dialog || closing) return;
    if (prefersReducedMotion()) {
      dialog.close();
      resetDrag();
      return;
    }
    setClosing(true);
    window.setTimeout(() => {
      setClosing(false);
      dialog.close();
      resetDrag();
    }, CLOSE_MS);
  };

  // Phones: drag the sheet down to dismiss it, like an iOS sheet. A drag only
  // starts when the content is scrolled to the top (or on the grab handle), so
  // normal scrolling inside the sheet is untouched. Short drags snap back.
  const requestCloseRef = useRef(requestClose);
  requestCloseRef.current = requestClose;
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog || !entry || !window.matchMedia(PHONE_QUERY).matches) return;
    let y0 = 0;
    let t0 = 0;
    let dy = 0;
    let armed = false;
    let dragging = false;

    const onStart = (e: TouchEvent) => {
      const scroller = dialog.querySelector('.modal-scroll');
      const onHandle = !!(e.target as Element).closest('.sheet-grabber');
      armed = onHandle || (scroller?.scrollTop ?? 0) <= 0;
      dragging = false;
      dy = 0;
      y0 = e.touches[0].clientY;
      t0 = performance.now();
    };
    const onMove = (e: TouchEvent) => {
      if (!armed) return;
      dy = e.touches[0].clientY - y0;
      if (!dragging && dy <= 0) {
        armed = false; // moving up: let the content scroll
        return;
      }
      dragging = true;
      e.preventDefault();
      dialog.style.transition = 'none';
      dialog.style.transform = `translateY(${Math.max(0, dy)}px)`;
    };
    const onEnd = () => {
      if (!dragging) return;
      dragging = false;
      const velocity = dy / Math.max(1, performance.now() - t0);
      if (dy > DISMISS_PX || velocity > DISMISS_VELOCITY) {
        haptic();
        requestCloseRef.current();
      } else {
        dialog.style.transition = 'transform 0.35s cubic-bezier(0.28, 0.11, 0.32, 1)';
        dialog.style.transform = '';
      }
    };
    dialog.addEventListener('touchstart', onStart, { passive: true });
    dialog.addEventListener('touchmove', onMove, { passive: false });
    dialog.addEventListener('touchend', onEnd);
    dialog.addEventListener('touchcancel', onEnd);
    return () => {
      dialog.removeEventListener('touchstart', onStart);
      dialog.removeEventListener('touchmove', onMove);
      dialog.removeEventListener('touchend', onEnd);
      dialog.removeEventListener('touchcancel', onEnd);
    };
  }, [entry]);

  const uid = useId();
  const headingId = entry ? `${uid}-modal-title` : undefined;

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
          <div className="sheet-grabber" aria-hidden="true" />
          <button type="button" className="modal-close" onClick={requestClose} aria-label="Close">
            <X size={18} strokeWidth={2.25} aria-hidden="true" />
          </button>
          {/* Focusable so keyboard users can scroll it even when it holds no links. */}
          <div className="modal-scroll" tabIndex={0} role="region" aria-labelledby={headingId}>
            {entry.eyebrow && <p className="tile-eyebrow">{entry.eyebrow}</p>}
            <h2 id={headingId} className="modal-headline">
              {entry.title}
            </h2>
            {entry.subtitle && <p className="modal-subhead">{entry.subtitle}</p>}
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

            {entry.link && (
              <div className="button-group">
                <OutboundButton href={entry.link.href} label={entry.link.label} context={entry.title} />
              </div>
            )}
          </div>
        </>
      )}
    </dialog>
  );
}
