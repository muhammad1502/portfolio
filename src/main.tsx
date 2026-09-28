import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './app/App';
import { PrintResume } from './app/components/PrintResume';
import '@fontsource-variable/inter/wght.css';
import './styles/fonts.css';
import siteCss from './styles/site.css?inline';

// `?print` renders the CV layout that public/resume.pdf is generated from,
// kept out of the normal user-facing flow.
const isPrint =
  typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('print');

if (isPrint) document.title = 'Muhammad Abdullah CV';

// The site stylesheet (global resets + Apple-style tokens) is injected only for
// the live site, so it can never restyle the standalone print document.
if (!isPrint) {
  const style = document.createElement('style');
  style.textContent = siteCss;
  document.head.append(style);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>{isPrint ? <PrintResume /> : <App />}</StrictMode>,
);
