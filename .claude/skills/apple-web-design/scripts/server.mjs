import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
// Usage: SITE_ROOT=<site repo> PORT=4174 node server.mjs
// Serves dist/ with vercel.json's headers, real 404s and brotli, like Vercel.
const SITE_ROOT = process.env.SITE_ROOT || process.cwd();
const PORT = Number(process.env.PORT || 4174);
const root = SITE_ROOT + '/dist';
const vercel = JSON.parse(fs.readFileSync(SITE_ROOT + '/vercel.json', 'utf8'));
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.pdf': 'application/pdf', '.txt': 'text/plain', '.xml': 'application/xml', '.svg': 'image/svg+xml' };
http.createServer((req, res) => {
  const url = new URL(req.url, 'http://x');
  let p = path.join(root, decodeURIComponent(url.pathname));
  if (!p.startsWith(root)) { res.writeHead(403); return res.end(); }
  let status = 200;
  if (fs.existsSync(p) && fs.statSync(p).isDirectory()) p = path.join(p, 'index.html');
  if (!fs.existsSync(p)) {
    // vercel.json has no rewrites: unknown paths get dist/404.html with a 404.
    status = 404;
    p = path.join(root, '404.html');
  }
  for (const h of vercel.headers) {
    const re = new RegExp('^' + h.source.replace('(.*)', '.*') + '$');
    if (re.test(url.pathname)) for (const { key, value } of h.headers) res.setHeader(key, value);
  }
  res.setHeader('Content-Type', types[path.extname(p)] || 'text/plain');
  res.statusCode = status;
  // Brotli like Vercel, for realistic performance numbers.
  if (/br/.test(req.headers['accept-encoding'] || '') && /text|javascript|json|xml|svg/.test(res.getHeader('Content-Type'))) {
    res.setHeader('Content-Encoding', 'br');
    fs.createReadStream(p).pipe(zlib.createBrotliCompress()).pipe(res);
  } else fs.createReadStream(p).pipe(res);
}).listen(PORT, () => console.log('listening ' + PORT));
