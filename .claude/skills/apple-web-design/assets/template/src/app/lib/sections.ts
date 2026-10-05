import { sections as data } from '../../site-data';

// Single source for in-page navigation: the nav, phone chips, footer and ⌘K
// all read this, so adding a section to site-data.ts adds it everywhere.
export const sections = data.map((s) => ({ id: s.id, label: s.label }));
