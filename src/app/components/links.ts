/** Label for an entry's outbound link, derived from where it points. */
export function linkLabel(href: string): string {
  try {
    return new URL(href).hostname.replace(/^www\./, '') === 'github.com' ? 'View on GitHub' : 'Visit website';
  } catch {
    return 'Visit website';
  }
}
