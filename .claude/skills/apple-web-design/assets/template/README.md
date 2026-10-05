# apple-web-design starter

A static, pre-rendered site in the style of apple.com: matched light and dark
themes, one button system, a translucent sticky nav, phone section chips, a
⌘K command palette, details modals that become bottom sheets on phones,
card carousels, count-up stats and scroll-linked motion that never hides
content. WCAG 2.2 AA, strict CSP, no third-party requests.

## Make it yours

1. Edit `src/site-data.ts`. Every word on the page comes from it; the sample
   content ("Fieldnote") is placeholder.
2. Replace `example.com` and the sample text in `index.html` and `public/`
   (`llms.txt`, `robots.txt`, `sitemap.xml`, `.well-known/security.txt`) and
   the contact in `SECURITY.md`.
3. Regenerate `public/favicon.png`, `apple-touch-icon.png` and `og.png`
   (the skill's `scripts/brand-assets.mjs` does all three).

## Develop and build

```bash
npm install
npm run dev     # http://localhost:5173
npm run build   # type-check, client + SSR build, pre-render into dist/index.html
```

Requires Node 20.19+ or 22.12+. Deploys on Vercel as is (`vercel.json` sets
the build, security headers and caching).
