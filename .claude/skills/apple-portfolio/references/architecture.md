# Architecture

## Stack

- Vite 6 + React 18 + TypeScript, one plain stylesheet (`src/styles/site.css`), no CSS framework, no animation library, no router, no backend.
- Icons: `lucide-react`. Font: `@fontsource-variable/inter` (self-hosted).
- Hosting: Vercel, Git-connected. Every push to `main` deploys production; PRs get preview deployments. Node 20+ (`engines` in package.json).
- `vite.config.ts` is a function config; `manualChunks` vendor splitting applies to the client build only (it breaks the SSR build).

## Build: pre-render plus hydration

`npm run build` = `tsc -b && vite build && vite build --ssr src/entry-server.tsx --outDir dist-ssr && node scripts/prerender.mjs`.

- `src/entry-server.tsx` renders `<App>` with `renderToString`.
- `scripts/prerender.mjs` replaces `<div id="root"></div>` in `dist/index.html` with that HTML, adds a `<link rel="preload">` for the Latin Inter woff2, and deletes `dist-ssr`. It prints `prerender: wrote N KB`.
- `src/main.tsx` calls `hydrateRoot` when `#root` has content, else `createRoot` (the `/?print` route renders `PrintResume` client-side).
- Hydration safety: the first client render must equal the server render. Anything browser-specific (theme, reduced motion, OS for ⌘/Ctrl, count-up start value) is read in `useIsomorphicLayoutEffect` after mount, before paint.
- Benefits: content is in the HTML for link previews, search engines and AI crawlers; faster first paint; CLS 0.

## Security

`vercel.json` headers on every path:
- `Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self'; form-action 'none'; frame-ancestors 'none'; base-uri 'none'; object-src 'none'`. No inline scripts, which is why the pre-paint theme script is `public/theme-init.js`. JSON-LD (`type="application/ld+json"`) is data, not script, so it's allowed.
- `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` (camera, mic, geolocation, payment, usb, sensors, topics all off), `Cross-Origin-Opener-Policy: same-origin`. Vercel adds HSTS and the HTTPS redirect.
- `/assets/*`: `Cache-Control: public, max-age=31536000, immutable` (hashed filenames).
- No rewrites: unknown paths get a real 404 with `public/404.html` (self-contained, themed).
- `public/.well-known/security.txt` (RFC 9116), expires 2027-09-28: renew before then. `SECURITY.md` points GitHub's Security tab to the same contact. `.github/dependabot.yml` opens weekly grouped npm update PRs.
- Profile photo is EXIF-stripped. No phone number anywhere. No third-party requests at all (no analytics, fonts, CDNs).
- Things only the user can do in GitHub/Vercel settings: branch protection, secret scanning, private email setting, deleting old branches. Never ask for or accept tokens in chat; if one is pasted, tell them to revoke it.

## SEO and AI readability

- `index.html`: title "Muhammad Abdullah | Security Operations Analyst", description, canonical, theme-color, Open Graph + Twitter card (`og.png?v=N`, 1200×630, alt text), JSON-LD `Person` (name, jobTitle, worksFor Ninpo, address Islamabad, sameAs LinkedIn/GitHub, knowsAbout skills, image).
- `public/robots.txt` allows search and AI crawlers (GPTBot, ClaudeBot, PerplexityBot, Google-Extended) and points to `sitemap.xml`.
- `public/llms.txt`: a plain-text profile that mirrors the site. Keep it in sync with `resume-data.ts`.
- Absolute URLs use `https://mabddullah.vercel.app`. A custom domain later means updating `index.html`, `sitemap.xml`, `robots.txt`, `llms.txt`, `security.txt` and the CV header.
- LinkedIn and others cache share cards; after changing the OG image, bump `?v=` and use LinkedIn Post Inspector to re-scrape.

## Performance

Last local Lighthouse run (brotli, like Vercel): mobile 99 / 100 / 100 / 100, desktop 100 / 100 / 100 / 100, CLS 0 on both. Keep it there: no new third-party scripts, images sized and lazy where below the fold, fonts preloaded, nothing render-blocking added.
