// Single source for in-page navigation, used by the global nav and the footer.
export const sections = [
  { id: 'about', label: 'About' },
  { id: 'experience', label: 'Experience' },
  { id: 'projects', label: 'Projects' },
  { id: 'skills', label: 'Skills' },
  { id: 'certifications', label: 'Certifications' },
  { id: 'contact', label: 'Contact' },
] as const;

export const RESUME_URL = '/resume.pdf';
export const RESUME_FILENAME = 'Muhammad-Abdullah-CV.pdf';
