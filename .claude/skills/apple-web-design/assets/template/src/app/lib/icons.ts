import {
  ArrowDownToLine,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Copy,
  ExternalLink,
  Globe,
  Info,
  Mail,
  MapPin,
  Phone,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Github, Linkedin } from '../components/brand-icons';

/**
 * Every icon the data file can ask for, by name. One leading icon per button,
 * 17px, stroke 2 (see the design rules). Add more lucide icons here as needed;
 * lucide 1.x has no brand logos, so brand marks live in brand-icons.ts.
 */
export const icons = {
  download: ArrowDownToLine,
  'arrow-right': ArrowRight,
  'arrow-up-right': ArrowUpRight,
  book: BookOpen,
  copy: Copy,
  external: ExternalLink,
  globe: Globe,
  info: Info,
  mail: Mail,
  'map-pin': MapPin,
  phone: Phone,
  github: Github,
  linkedin: Linkedin,
} satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof icons;
