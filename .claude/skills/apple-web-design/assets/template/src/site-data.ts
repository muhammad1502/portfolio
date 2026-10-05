/**
 * Every word on the page comes from this file. Components never hardcode copy.
 *
 * The sample content describes a fictional product ("Fieldnote") so the
 * template renders something realistic. Replace all of it with real content
 * from the owner of the site; never invent facts, numbers or quotes.
 *
 * Text fields support **double asterisks** to emphasise a key number or phrase.
 */
import type { IconName } from './app/lib/icons';

export interface Cta {
  label: string;
  href: string;
  icon: IconName;
  /** Filename to save as. Makes the link a download. */
  download?: string;
}

export interface Stat {
  /** A leading number counts up when scrolled into view: "40+", "3x", "99.9%". */
  value: string;
  label: string;
}

/** Long-form content shown in the details modal (bottom sheet on phones). */
export interface Details {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  description?: string;
  sections?: { label: string; text: string }[];
  bullets?: string[];
  link?: { href: string; label?: string };
}

export interface Tile {
  id: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  meta?: string;
  description?: string;
  stats?: Stat[];
  details?: Details;
  link?: { href: string; label?: string };
}

export interface Card {
  id: string;
  eyebrow?: string;
  title: string;
  summary: string;
  points?: string[];
  footnote?: string;
  details?: Details;
  link?: { href: string; label?: string };
}

export interface ListItem {
  id: string;
  name: string;
  meta?: string;
  note?: string;
}

export interface ContactLink {
  id: string;
  label: string;
  value: string;
  href: string;
  icon: IconName;
}

interface SectionBase {
  /** Anchor id and nav key. */
  id: string;
  /** Short label for the nav, phone chips, footer and ⌘K. */
  label: string;
  headline: string;
  intro?: string;
}

export type Section =
  | (SectionBase & { type: 'text'; paragraphs: string[]; terminal?: { prompt: string; output: string } })
  | (SectionBase & { type: 'tiles'; items: Tile[] })
  | (SectionBase & {
      type: 'cards';
      items: Card[];
      /** Swipeable carousel on phones. */
      carousel?: boolean;
      /** 2 (default) or 3 columns on large screens. Prefer item counts that fill every row. */
      columns?: 2 | 3;
    })
  | (SectionBase & { type: 'list'; items: ListItem[] })
  | (SectionBase & { type: 'contact'; items: ContactLink[]; cta?: Cta });

export const site = {
  name: 'Fieldnote',
  /** Shown in the footer legal line. */
  owner: 'Fieldnote Labs',
  location: 'Remote',
  url: 'https://example.com',
};

/** Optional icon button in the nav bar (download, sign up, open app…). */
export const navAction: Cta | null = {
  label: 'Download the one-page overview (PDF)',
  href: '/overview.pdf',
  icon: 'download',
  download: 'Fieldnote-overview.pdf',
};

export const hero = {
  /** Optional round image above the headline. Leave null for text only. */
  image: null as { src: string; alt: string } | null,
  headline: 'Fieldnote',
  subhead: 'Notes that organise themselves',
  tagline: 'Capture an idea in two taps, find it again in one. Works offline, syncs when you are back.',
  primary: { label: 'Get started', href: '#pricing', icon: 'arrow-right' } as Cta,
  secondary: { label: 'Contact us', href: '#contact', icon: 'mail' } as Cta,
};

export const sections: Section[] = [
  {
    type: 'text',
    id: 'about',
    label: 'About',
    headline: 'Why Fieldnote',
    terminal: { prompt: '$ fieldnote --about', output: 'offline first · encrypted sync' },
    paragraphs: [
      'Most note apps make you file things before you can write them down. Fieldnote does it the other way round: write first, and it suggests where the note belongs.',
      'Everything is stored on your device first, so it opens instantly and works on a plane. When you are online again, it syncs **end to end encrypted**.',
    ],
  },
  {
    type: 'tiles',
    id: 'features',
    label: 'Features',
    headline: 'Features',
    items: [
      {
        id: 'capture',
        eyebrow: 'Capture',
        title: 'Two taps to a new note',
        subtitle: 'From the home screen, the lock screen or a shortcut',
        description: 'Start typing, dictate or snap a photo. Fieldnote saves as you go.',
        stats: [
          { value: '2', label: 'taps from anywhere to a new note' },
          { value: '0', label: 'save buttons' },
        ],
        details: {
          eyebrow: 'Capture',
          title: 'Two taps to a new note',
          subtitle: 'Feature detail',
          description: 'Sample long-form content. The modal shows labelled sections like these.',
          sections: [
            { label: 'Shortcuts', text: 'Add a widget or a system shortcut and a blank note opens immediately.' },
            { label: 'Dictation', text: 'Speak and the text appears as you talk, with punctuation added for you.' },
            { label: 'Photos', text: 'Snap a whiteboard or a receipt and the text in it becomes searchable.' },
          ],
        },
      },
      {
        id: 'organise',
        eyebrow: 'Organise',
        title: 'Suggested folders',
        subtitle: 'Accept, change or ignore',
        description: 'Fieldnote reads the note on your device and suggests where it belongs. Nothing leaves your phone to do it.',
        stats: [{ value: '100%', label: 'on-device suggestions' }],
        link: { href: 'https://example.com/docs/organise', label: 'Read the docs' },
      },
    ],
  },
  {
    type: 'cards',
    id: 'pricing',
    label: 'Pricing',
    headline: 'Pricing',
    intro: 'Start free. Upgrade when you need sync across more devices.',
    carousel: true,
    columns: 3,
    items: [
      {
        id: 'free',
        eyebrow: 'Free',
        title: 'Personal',
        summary: 'Everything you need on one device.',
        points: ['Unlimited notes', 'Suggested folders', 'Offline search'],
        footnote: 'Free forever',
      },
      {
        id: 'plus',
        eyebrow: 'Plus',
        title: 'Everywhere',
        summary: 'Sync across all your devices, end to end encrypted.',
        points: ['Everything in Personal', 'Sync on up to 5 devices', 'Version history'],
        footnote: 'Sample price',
        details: {
          eyebrow: 'Plus',
          title: 'Everywhere',
          subtitle: 'Plan detail',
          sections: [
            { label: 'Sync', text: 'Changes appear on your other devices within seconds.' },
            { label: 'History', text: 'Every edit is kept, so you can go back to any earlier version.' },
          ],
        },
      },
      {
        id: 'team',
        eyebrow: 'Team',
        title: 'Shared spaces',
        summary: 'Shared folders with permissions for small teams.',
        points: ['Everything in Plus', 'Shared folders', 'Admin controls'],
        link: { href: 'https://example.com/teams', label: 'Visit website' },
      },
    ],
  },
  {
    type: 'list',
    id: 'platforms',
    label: 'Platforms',
    headline: 'Works on',
    items: [
      { id: 'ios', name: 'iPhone and iPad', meta: 'iOS 17 or later' },
      { id: 'android', name: 'Android', meta: 'Android 10 or later' },
      { id: 'web', name: 'Web', meta: 'Any modern browser', note: 'Beta' },
    ],
  },
  {
    type: 'contact',
    id: 'contact',
    label: 'Contact',
    headline: 'Contact',
    items: [
      { id: 'email', label: 'Email', value: 'hello@example.com', href: 'mailto:hello@example.com', icon: 'mail' },
      { id: 'github', label: 'GitHub', value: 'example/fieldnote', href: 'https://github.com/example', icon: 'github' },
      { id: 'linkedin', label: 'LinkedIn', value: 'company/example', href: 'https://www.linkedin.com/company/example', icon: 'linkedin' },
    ],
    cta: { label: 'Get started', href: '#pricing', icon: 'arrow-right' },
  },
];
