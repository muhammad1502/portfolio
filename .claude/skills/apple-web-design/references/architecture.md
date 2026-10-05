# Architecture

## Stack

- Vite 8 (Rolldown) + React 19 + TypeScript 7, one plain stylesheet (`src/styles/site.css`), no CSS framework, no animation library, no router, no backend.
- Icons: `lucide-react` 1.x. Lucide 1.0 removed brand logos, so the GitHub and LinkedIn marks live in `src/app/components/brand-icons.ts` (the old lucide paths via `createLucideIcon`); import those two from there, everything else from `lucide-react`. Font: `@fontsource-variable/inter` (self-hosted).
- Hosting: Vercel, Git-connected. Every push to `main` deploys production; PRs get preview deployments. Node 20.19+ or 22.12+ (Vite 8's requirement, set in `engines`).
- `vite.config.ts` is a function config; `manualChunks` vendor splitting applies to the client build only (it breaks the SSR build). Vite 8 only accepts the function form of `manualChunks` (the object form fails the build).

## Build: pre-render plus hydration

`npm run build` = `tsc -b && vite build && vite build --ssr src/entry-server.tsx --outDir dist-ssr && node scripts/prerender.mjs`.

- `src/entry-server.tsx` renders `<App>` with `renderToString`.
- `scripts/prerender.mjs` replaces `<div id="root"></div>` in `dist/index.html` with that HTML, adds a `<link rel="preload">` for the Latin Inter woff2, moves any resource hints React 19 emits at the top of the markup (the hero photo's `<link rel="preload" as="image">`, from `fetchPriority="high"`) into `<head>`, and deletes `dist-ssr`. It prints `prerender: wrote N KB`.
- `src/main.tsx` calls `hydrateRoot` when `#root` has content (production), else `createRoot` (dev server). A client-only route such as `?print` can clear `#root` and `createRoot` its own component.
- Hydration safety: the first client render must equal the server render. Anything browser-specific (theme, reduced motion, OS for ⌘/Ctrl, count-up start value) is read in `useIsomorphicLayoutEffect` after mount, before paint.
- Benefits: content is in the HTML for link previews, search engines and AI crawlers; faster first paint; CLS 0.

## Dependency updates

Dependabot opens weekly grouped PRs (production and development groups). Their Vercel preview fails when a major version breaks the build. Don't merge them blind: reproduce the build on the Dependabot branch, apply the upgrade on the working branch with the code fixes, run the full QA suite and Lighthouse, ship it, then close the Dependabot PRs pointing to the PR that did it. Upgrades already absorbed by the template (October 2026): lucide-react 0.454 → 1.x (brand icons removed), react 18 → 19 (native `fetchPriority` and `inert`, image preload hints in SSR output), Vite 6 → 8 (function-form `manualChunks`, Node 20.19+ / 22.12+), TypeScript 5 → 7.

## Security

`vercel.json` headers on every path:
- `Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self'; form-action 'none'; frame-ancestors 'none'; base-uri 'none'; object-src 'none'`. No inline scripts, which is why the pre-paint theme script is `public/theme-init.js`. JSON-LD (`type="application/ld+json"`) is data, not script, so it's allowed.
- `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` (camera, mic, geolocation, payment, usb, sensors, topics all off), `Cross-Origin-Opener-Policy: same-origin`. Vercel adds HSTS and the HTTPS redirect.
- `/assets/*`: `Cache-Control: public, max-age=31536000, immutable` (hashed filenames).
- No rewrites: unknown paths get a real 404 with `public/404.html` (self-contained, themed).
- `public/.well-known/security.txt` (RFC 9116) with a Contact and an Expires date at most a year out: renew it before then. A `SECURITY.md` in the repo points GitHub's Security tab to the same contact, and `.github/dependabot.yml` (weekly, grouped production/development updates) keeps dependencies current.
- Strip EXIF from photos (GPS and device data). No third-party requests at all by default (no analytics, font CDNs or script CDNs); adding any needs a CSP change and a privacy note.
- Repo and hosting settings (branch protection, secret scanning, private commit email, deleting old branches) are the owner's to change. Never ask for or accept tokens in chat; if one is pasted, tell them to revoke it.

## SEO and AI readability

- `index.html`: title ("Name | what it is"), description, canonical, theme-color, Open Graph + Twitter card (`og.png?v=N`, 1200×630, alt text), and JSON-LD with the schema.org type that fits (Person, Organization, Product, SoftwareApplication…).
- `public/robots.txt` allows search and AI crawlers (GPTBot, ClaudeBot, PerplexityBot, Google-Extended) and points to `sitemap.xml`.
- `public/llms.txt`: a plain-text summary that mirrors the site for AI crawlers. Keep it in sync with `site-data.ts`.
- Absolute URLs (template default `https://example.com`) live in `index.html`, `sitemap.xml`, `robots.txt`, `llms.txt` and `security.txt`. Change all of them together when the domain changes.
- LinkedIn and others cache share cards; after changing the OG image, bump `?v=` and use LinkedIn Post Inspector to re-scrape.

## Performance

A real site built on this system (React 19, Vite 8, served with brotli like Vercel) scored Lighthouse mobile 100 / 100 / 100 / 100 (LCP 1.6 s, TBT 50 ms) and desktop 100 across the board, CLS 0 on both. The React chunk is about 219 KB raw (68 KB gzip) and is split out so it stays cached across deploys. Keep it there: no new third-party scripts, images sized and lazy where below the fold, fonts preloaded, nothing render-blocking added.
