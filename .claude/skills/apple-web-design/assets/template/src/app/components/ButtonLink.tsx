import type { Cta } from '../../site-data';
import { icons } from '../lib/icons';

/** A link styled as the site's one button: pill, 44px, one leading icon. */
export function ButtonLink({ cta, secondary = false }: { cta: Cta; secondary?: boolean }) {
  const Icon = icons[cta.icon];
  const external = /^https?:\/\//.test(cta.href);
  return (
    <a
      className={`button${secondary ? ' button-secondary' : ''}`}
      href={cta.href}
      {...(cta.download ? { download: cta.download } : {})}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      <Icon size={17} strokeWidth={2} aria-hidden="true" />
      {cta.label}
      {external && <span className="visually-hidden">, opens in a new tab</span>}
    </a>
  );
}
