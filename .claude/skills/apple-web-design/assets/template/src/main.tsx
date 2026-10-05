import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import App from './app/App';
import '@fontsource-variable/inter/wght.css';
import './styles/site.css';

const root = document.getElementById('root')!;

if (root.hasChildNodes()) {
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
