// Bakes the rendered page into dist/index.html so content is in the HTML
// before any JavaScript runs (faster first paint, better link previews and
// search indexing). The client then hydrates it (src/main.tsx).
//
// Runs after `vite build` (client) and `vite build --ssr` (dist-ssr/).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ssrDir = path.join(root, 'dist-ssr');
const htmlFile = path.join(root, 'dist', 'index.html');

const { render } = await import(pathToFileURL(path.join(ssrDir, 'entry-server.js')).href);
let appHtml = render();

// React 19 emits resource hints (e.g. the hero photo's image preload) at the
// start of the rendered markup. They belong in <head>, so move them there.
const hints = [];
appHtml = appHtml.replace(/^(?:<link [^>]*\/>)+/, (m) => {
  hints.push(...m.match(/<link [^>]*\/>/g));
  return '';
});

const MARKER = '<div id="root"></div>';
let html = fs.readFileSync(htmlFile, 'utf8');
if (!html.includes(MARKER)) throw new Error(`prerender: ${MARKER} not found in dist/index.html`);
html = html.replace(MARKER, `<div id="root">${appHtml}</div>`);

// Preload the Latin Inter file so text settles in its final font sooner.
const inter = fs.readdirSync(path.join(root, 'dist', 'assets')).find((f) => /^inter-latin-wght-normal-.*\.woff2$/.test(f));
if (inter) {
  html = html.replace(
    '</title>',
    `</title>\n    <link rel="preload" href="/assets/${inter}" as="font" type="font/woff2" crossorigin />`,
  );
}
if (hints.length) html = html.replace('</head>', `  ${hints.join('\n    ')}\n  </head>`);
fs.writeFileSync(htmlFile, html);
fs.rmSync(ssrDir, { recursive: true, force: true });

console.log(`prerender: wrote ${(appHtml.length / 1024).toFixed(1)} KB of HTML into dist/index.html`);
