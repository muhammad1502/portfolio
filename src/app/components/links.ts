import { Github, Globe } from 'lucide-react';

function isGitHub(href: string): boolean {
  try {
    return new URL(href).hostname.replace(/^www\./, '') === 'github.com';
  } catch {
    return false;
  }
}

/** Label for an entry's outbound link, derived from where it points. */
export function linkLabel(href: string): string {
  return isGitHub(href) ? 'View on GitHub' : 'Visit website';
}

/** Leading icon that matches linkLabel: the GitHub mark or a globe. */
export function linkIcon(href: string) {
  return isGitHub(href) ? Github : Globe;
}
