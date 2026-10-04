import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import App from './app/App';
import { PrintResume } from './app/components/PrintResume';
import '@fontsource-variable/inter/wght.css';
import './styles/site.css';

// `?print` renders the CV layout that public/resume.pdf is generated from,
// kept out of the normal user-facing flow.
const isPrint =
  typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('print');

const root = document.getElementById('root')!;

if (isPrint) {
  // The CV is a standalone document: drop the site's stylesheets and the
  // pre-rendered page, then render the print layout (it brings its own fonts).
  document.title = 'Muhammad Abdullah CV';
  document.querySelectorAll('link[rel="stylesheet"], style').forEach((node) => node.remove());
  document.documentElement.style.backgroundColor = '#fff';
  root.textContent = '';
  createRoot(root).render(
    <StrictMode>
      <PrintResume />
    </StrictMode>,
  );
} else if (root.hasChildNodes()) {
  // Production: the page was pre-rendered at build time (scripts/prerender.mjs).
  hydrateRoot(
    root,
    <StrictMode>
      <App />
    </StrictMode>,
  );
} else {
  // Dev server: no pre-rendered HTML.
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
