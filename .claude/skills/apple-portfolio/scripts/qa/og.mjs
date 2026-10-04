import { chromium } from 'playwright';
import fs from 'node:fs';
// SITE_ROOT: the site repo (defaults to the git checkout this skill lives in).
const SITE_ROOT = process.env.SITE_ROOT || new URL('../../../../../', import.meta.url).pathname.replace(/\/$/, '');
const R = SITE_ROOT;
const photo = fs.readFileSync(`${R}/src/imports/muhammad-abdullah.jpg`).toString('base64');
const font = fs.readFileSync(`${R}/node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2`).toString('base64');
const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face { font-family: Inter; src: url(data:font/woff2;base64,${font}) format('woff2'); font-weight: 100 900; }
* { margin: 0; box-sizing: border-box; }
body { width: 1200px; height: 630px; font-family: Inter, sans-serif; background: #f5f5f7; color: #1d1d1f; -webkit-font-smoothing: antialiased; }
.card { position: absolute; inset: 40px; border-radius: 36px; background: #fff; display: flex; align-items: center; gap: 56px; padding: 0 72px; }
img { width: 208px; height: 208px; border-radius: 50%; object-fit: cover; flex: none; }
h1 { font-size: 62px; white-space: nowrap; font-weight: 600; letter-spacing: -0.02em; line-height: 1.05; }
.sub { margin-top: 14px; font-size: 32px; letter-spacing: -0.005em; }
.tag { margin-top: 22px; font-size: 24px; line-height: 1.35; color: #6e6e73; max-width: 640px; }
.url { position: absolute; left: 72px; bottom: 44px; font-size: 22px; color: #0066cc; font-weight: 500; }
.chips { position: absolute; right: 72px; bottom: 44px; font-size: 20px; color: #6e6e73; }
</style></head><body><div class="card">
<img src="data:image/jpeg;base64,${photo}" alt="">
<div><h1>Muhammad Abdullah</h1><p class="sub">Security Operations Analyst · Islamabad, PK</p>
<p class="tag">Security operations for North American enterprise clients, from alert triage and threat hunting to ransomware containment.</p></div>
<p class="url">mabddullah.vercel.app</p><p class="chips">Elastic SIEM · Microsoft 365 Defender · MITRE ATT&amp;CK</p>
</div></body></html>`;
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await p.setContent(html); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(200);
await p.screenshot({ path: 'og-new.png' });
await b.close();
console.log('ok', fs.statSync('og-new.png').size);
