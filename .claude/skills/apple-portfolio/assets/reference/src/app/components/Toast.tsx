import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';

const SHOW_MS = 2400;

type Listener = (message: string) => void;
const listeners = new Set<Listener>();

/** Show a short confirmation ("Email address copied"). */
export function toast(message: string) {
  listeners.forEach((l) => l(message));
}

/**
 * Small pill at the bottom of the screen for confirmations. It lives in a
 * polite live region, so screen readers announce the message too.
 */
export function Toaster() {
  const [message, setMessage] = useState('');
  const [shown, setShown] = useState(false);

  useEffect(() => {
    let timer = 0;
    const onToast: Listener = (m) => {
      setMessage(m);
      setShown(true);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setShown(false), SHOW_MS);
    };
    listeners.add(onToast);
    return () => {
      listeners.delete(onToast);
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <div className="toast-region" role="status" aria-live="polite">
      <div className={`toast${shown ? ' is-shown' : ''}`} aria-hidden={!shown}>
        <Check size={16} strokeWidth={2.25} aria-hidden="true" />
        <span>{message}</span>
      </div>
    </div>
  );
}
