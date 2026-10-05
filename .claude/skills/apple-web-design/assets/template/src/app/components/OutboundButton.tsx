import { linkIcon, linkLabel } from './links';

/** Secondary button for an external link. The visible label starts the
 *  accessible name (WCAG 2.5.3); context follows in visually hidden text. */
export function OutboundButton({ href, label, context }: { href: string; label?: string; context: string }) {
  const Icon = linkIcon(href);
  const text = linkLabel(href, label);
  return (
    <a className="button button-secondary" href={href} target="_blank" rel="noopener noreferrer">
      <Icon size={17} strokeWidth={2} aria-hidden="true" />
      {text}
      <span className="visually-hidden">: {context}, opens in a new tab</span>
    </a>
  );
}
