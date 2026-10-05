import { Globe } from 'lucide-react';
import { Github } from './brand-icons';

function isGitHub(href: string): boolean {
  try {
    return new URL(href).hostname.replace(/^www\./, '') === 'github.com';
  } catch {
    return false;
  }
}

/** Label for an outbound link, derived from where it points unless given. */
export function linkLabel(href: string, label?: string): string {
  return label ?? (isGitHub(href) ? 'View on GitHub' : 'Visit website');
}

/** Leading icon that matches the link: the GitHub mark or a globe. */
export function linkIcon(href: string) {
  return isGitHub(href) ? Github : Globe;
}
