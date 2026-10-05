// Renders favicon.png (64), apple-touch-icon.png (180) and og.png (1200x630)
// into <site>/public in the apple-web-design style.
//
// Usage: node brand-assets.mjs <site-root> --name "Fieldnote" --tagline "…" \
//          [--url example.com] [--letter F] [--photo path/to/square.jpg]
// Needs Playwright (preinstalled in Claude Code cloud containers) and the
// site's node_modules (for the Inter font file).
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const [root, ...rest] = process.argv.slice(2);
const arg = (k, d) => { const i = rest.indexOf('--' + k); return i >= 0 ? rest[i + 1] : d; };
if (!root) { console.error('usage: node brand-assets.mjs <site-root> --name … --tagline …'); process.exit(1); }
const name = arg('name', 'Site');
const tagline = arg('tagline', '');
const url = arg('url', '');
const letter = arg('letter', name[0].toUpperCase());
const photo = arg('photo');
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const fontFile = path.join(root, 'node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2');
const font = fs.existsSync(fontFile) ? fs.readFileSync(fontFile).toString('base64') : null;
const face = font ? `@font-face { font-family: Inter; src: url(data:font/woff2;base64,${font}) format('woff2'); font-weight: 100 900; }` : '';
const img = photo ? `data:image/${path.extname(photo).slice(1).replace('jpg', 'jpeg')};base64,${fs.readFileSync(photo).toString('base64')}` : null;

const icon = (size) => `<!doctype html><html><head><style>${face}
* { margin: 0 } body { width: ${size}px; height: ${size}px; display: grid; place-items: center; background: transparent; }
div { width: ${size}px; height: ${size}px; border-radius: ${Math.round(size * 0.225)}px; background: #1d1d1f; color: #f5f5f7; display: grid; place-items: center;
  font: 600 ${Math.round(size * 0.58)}px/1 Inter, -apple-system, sans-serif; letter-spacing: -0.02em; }
</style></head><body><div>${esc(letter)}</div></body></html>`;

const og = `<!doctype html><html><head><meta charset="utf-8"><style>${face}
* { margin: 0; box-sizing: border-box; }
body { width: 1200px; height: 630px; font-family: Inter, -apple-system, sans-serif; background: #f5f5f7; color: #1d1d1f; -webkit-font-smoothing: antialiased; }
.card { position: absolute; inset: 40px; border-radius: 36px; background: #fff; display: flex; align-items: center; gap: 56px; padding: 0 72px; }
.mark { width: 208px; height: 208px; border-radius: ${img ? '50%' : '47px'}; flex: none; object-fit: cover; background: #1d1d1f; color: #f5f5f7; display: grid; place-items: center; font-size: 120px; font-weight: 600; }
h1 { font-size: 62px; font-weight: 600; letter-spacing: -0.02em; line-height: 1.05; }
.tag { margin-top: 18px; font-size: 30px; line-height: 1.3; color: #6e6e73; max-width: 680px; }
.url { position: absolute; left: 72px; bottom: 44px; font-size: 22px; color: #0066cc; font-weight: 500; }
</style></head><body><div class="card">
${img ? `<img class="mark" src="${img}" alt="">` : `<div class="mark">${esc(letter)}</div>`}
<div><h1>${esc(name)}</h1>${tagline ? `<p class="tag">${esc(tagline)}</p>` : ''}</div>
${url ? `<p class="url">${esc(url)}</p>` : ''}
</div></body></html>`;

const b = await chromium.launch();
const shot = async (html, w, h, file, transparent = false) => {
  const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  await p.setContent(html); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(150);
  await p.screenshot({ path: path.join(root, 'public', file), omitBackground: transparent });
  await p.close();
};
await shot(icon(64), 64, 64, 'favicon.png', true);
await shot(icon(180), 180, 180, 'apple-touch-icon.png');
await shot(og, 1200, 630, 'og.png');
await b.close();
console.log('wrote public/favicon.png, public/apple-touch-icon.png, public/og.png');
