# Muhammad Abdullah: portfolio

Personal portfolio for **Muhammad Abdullah**, Cybersecurity Analyst. It's a
single-page, static site designed in the style of apple.com, with light/dark
themes and subtle scroll animations. Live at
**https://muhammad-abdullah-resume.vercel.app**.

---

## Stack

| Layer    | Choice                                                            |
| -------- | ---------------------------------------------------------------- |
| Build    | [Vite](https://vitejs.dev) 5                                      |
| UI       | React 18 + TypeScript                                             |
| Styling  | One plain stylesheet, `src/styles/site.css` (CSS custom properties) |
| Motion   | CSS transitions + IntersectionObserver (no animation library)     |
| Icons    | [`lucide-react`](https://lucide.dev)                             |
| Font     | SF Pro via the system stack on Apple devices; self-hosted Inter elsewhere (`@fontsource-variable/inter`) |
| Hosting  | Vercel (Git-connected, auto-deploy on push to `main`)            |

There is no router and no backend: it's a static SPA. All content is data-driven
from a single TypeScript file.

---

## Project layout

```
.
├── index.html                # Head: meta, OG/Twitter, JSON-LD, favicon, FOUC script
├── public/                   # Served at site root, copied verbatim into dist/
│   ├── favicon.png
│   ├── apple-touch-icon.png
│   ├── og.png                # 1200×630 social share card
│   ├── robots.txt            # Allows search + AI crawlers; points to sitemap
│   ├── sitemap.xml
│   └── llms.txt              # Plain-text profile for LLM crawlers (AI readability)
├── src/
│   ├── main.tsx              # Entry; injects site.css (live site only) and mounts <App>
│   ├── app/
│   │   ├── App.tsx           # Page composition: hero, about, experience, skills, certs, education, contact
│   │   ├── lib/
│   │   │   ├── sections.ts       # In-page nav items + resume PDF path (nav + footer)
│   │   │   ├── metrics.tsx       # **metric** emphasis renderer, skills list splitter
│   │   │   ├── useThemeMode.ts   # Light/dark: follows OS until toggled, then stored
│   │   │   └── motion.ts         # prefers-reduced-motion helper
│   │   └── components/
│   │       ├── resume-data.ts      # ⭐ ALL content + types (edit here)
│   │       ├── GlobalNav.tsx       # Sticky translucent nav; full-screen menu ≤833px
│   │       ├── Hero.tsx            # Photo, name, title, Download CV / Contact
│   │       ├── ExperienceTile.tsx  # Full-width Apple-style tile per role
│   │       ├── CountUp.tsx         # Animated stat numbers
│   │       ├── DetailsModal.tsx    # "Learn more" overlay (native <dialog>)
│   │       ├── Footer.tsx          # Directory columns + legal line
│   │       └── PrintResume.tsx     # Optional print layout at /?print (data-driven)
│   ├── styles/
│   │   ├── site.css                # All site styles + light/dark tokens
│   │   ├── fonts.css               # @font-face for Google Sans Flex (print layout)
│   │   └── *.woff2                 # The font files
│   └── imports/
│       └── muhammad-abdullah.jpg   # Profile photo (EXIF-stripped, 384px)
├── vercel.json               # Framework, build, cache + security headers
├── vite.config.ts            # Plugins + manual vendor chunk splitting
└── tsconfig.json
```

---

## Editing content

**All resume content lives in
[`src/app/components/resume-data.ts`](src/app/components/resume-data.ts)**:
profile, contacts, experience, skills, certifications, education. The React app
imports and renders it; the components are generic and never hardcode copy.

Edit `resume-data.ts` directly. The types (`ResumeEntry`, `Role`, `SkillGroup`,
`Certification`, etc.) are defined at the top of the file and enforce the
structure of each entry: TypeScript will flag a malformed entry at build time
(`npm run build`).

Each experience/education entry supports optional `bullets` (string list),
`sections` (labeled paragraphs), `roles` (sub-positions), `href` (adds a
"View on GitHub" / "Visit website" button) and `stats` (big animated numbers on
the tile). Entries with `sections`, `bullets` or `roles` get a **Learn more**
button that opens the full detail in a modal. Text wrapped in
`**double asterisks**` in any body string (including `profile.about`) renders
emphasized.

> `stats` should only restate figures that already appear in that entry's copy.

---

## Develop

```bash
npm install
npm run dev        # http://localhost:5173
```

## Build

```bash
npm run build      # tsc -b && vite build  ->  dist/
npm run preview    # serve the production build locally
```

Requires **Node 20+** (pinned via `engines` in `package.json`).

---

## Design & theming

- Modelled on apple.com: values (type scale, colours, 44px blurred nav, pill
  buttons, breakpoints 734 / 833 / 1068px) are taken from apple.com's own
  stylesheets and documented at the top of [`site.css`](src/styles/site.css).
- Every CTA uses one button size (44px tall); buttons in a pair are equal width.
- Light/dark tokens live on `:root` / `:root[data-theme='dark']` in `site.css`.
  The choice is stored in `localStorage` (`theme-mode`) and otherwise follows the
  OS `prefers-color-scheme`.
- An inline script in `index.html` sets `data-theme` and the background **before
  React mounts**, so dark-mode users never see a light flash (FOUC).
- All content renders immediately (no fade-in or scroll-reveal). Motion is
  limited to count-up numbers and interaction feedback (hover, menu and modal
  transitions), all disabled under `prefers-reduced-motion`.

---

## Assets & images

- The profile photo (`src/imports/muhammad-abdullah.jpg`) is **EXIF-stripped**
  (GPS/device metadata removed) and resized to 384px: it displays at 144px in a
  circular avatar. To swap it, replace that file (keep it small; Vite hashes and
  emits it into `dist/assets/`). If the image is ever missing, the avatar falls
  back to the `MA` initials monogram (see [`Hero.tsx`](src/app/components/Hero.tsx)).
- Favicon, apple-touch-icon, and the OG image live in `public/` (NOT `dist/`,
  `dist/` is wiped and rebuilt on every Vercel deploy).
- `public/resume.pdf` is the downloadable CV. It is generated from the `/?print`
  layout ([`PrintResume.tsx`](src/app/components/PrintResume.tsx)), which reads the
  same `resume-data.ts` as the site, so the two never disagree. The layout is a
  single column with standard headings so applicant tracking systems parse it
  in order. To regenerate after editing content: `npm run build && npm run preview`,
  open `http://localhost:4173/?print` in Chrome, Print, Save as PDF (paper size
  Letter, margins Default, headers and footers off), and replace `public/resume.pdf`.

---

## Deploy (Vercel)

Connected to this GitHub repo. **Every push to `main` triggers a production build.**
All config is in [`vercel.json`](vercel.json):

- Framework `vite`, build `npm run build`, output `dist`
- SPA rewrite that excludes `/assets/`
- `Cache-Control: immutable` (1 year) on hashed `/assets/*`
- Security headers: CSP, `X-Frame-Options: DENY`, `X-Content-Type-Options`,
  `Referrer-Policy`, `Permissions-Policy`

> **Domain note:** absolute URLs (OG image, canonical, JSON-LD, sitemap, robots,
> llms.txt) point to the live domain `https://muhammad-abdullah-resume.vercel.app`.
> If a custom domain is added later, update those references across `index.html`
> and `public/` (`sitemap.xml`, `robots.txt`, `llms.txt`).

---

## SEO & AI readability

- **Meta**: title, description, Open Graph + Twitter cards, canonical, theme-color.
- **JSON-LD `Person` schema** in `index.html`: gives search engines and AI
  crawlers structured facts (name, role, employer, education, skills, socials).
- **`robots.txt`** explicitly allows search and AI crawlers (GPTBot, ClaudeBot,
  PerplexityBot, Google-Extended) and points to the sitemap.
- **`llms.txt`**: a plain-text profile summary for LLM crawlers, so AI answers
  about "Muhammad Abdullah" stay accurate.

To preview share cards: [opengraph.xyz](https://www.opengraph.xyz) or
[metatags.io](https://metatags.io). Platforms cache OG data hard: use their
debuggers (LinkedIn Post Inspector, Facebook Sharing Debugger) to force a re-scrape.
