import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import App from './app/App';

/** Build-time render of the page to HTML (see scripts/prerender.mjs). */
export function render(): string {
  return renderToString(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
