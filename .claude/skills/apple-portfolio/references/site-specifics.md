# Site specifics

The general design system, motion, accessibility, architecture and QA rules live in the **apple-web-design** skill. This file holds only what is specific to the portfolio. When they disagree, the portfolio's facts and decisions (here and in `content.md`) win.

## How the portfolio maps onto the design system

The portfolio predates the generic template, so its components are named for their content:

| Portfolio | Design-system equivalent |
|---|---|
| `resume-data.ts` (`profile`, `experience`, `caseStudies`, `projects`, `skills`, `certifications`, `contacts`) | `site-data.ts` sections |
| `ExperienceTile.tsx` | tiles (`type: 'tiles'`) |
| `CaseStudies.tsx`, `Projects.tsx` (`.project-card`, `.projects-track`) | cards (`.item-card`, `.carousel-track`) |
| certifications card (`.cert-list`) | list card (`.list-card`) |
| About `whoami` line (`.whoami`) | terminal line (`.terminal-line`) |
| nav CV download | `navAction` |
| `PrintResume.tsx` at `/?print` | (portfolio only) |

The section order is About, Experience, Case studies, Projects, Skills, Certifications, Contact. The section list is in `src/app/lib/sections.ts`.

## Components as they are on the portfolio

**Hero.** 144px round photo (EXIF-stripped, 384px source; falls back to "MA" initials), name, title · location, one-line tagline, two equal-width buttons (Download CV, Contact).

**About.** `$ whoami` terminal line (`muhammad abdullah · soc analyst · islamabad, pk`, with a blinking caret, no blink under reduced motion), then paragraphs that light up word by word as you read.

**Experience tiles.** Eyebrow period, title, company link, meta (location · remote), description, up to 4 stats (count-up numbers), "Learn more" opens the details modal with labelled sections.

**Case studies / Projects.** `.card.project-card`: eyebrow kind, title, summary, (points list for projects), tech/tools line in `--text-2` 14px, buttons pinned to the card's bottom so a row lines up. Projects become a swipeable snap carousel with page dots on phones; case studies stack.

**Certifications.** One card with rows: name, "issuer · kind", optional `--accent-note` note on the right.

**Contact.** Cards for Email, LinkedIn, GitHub with icon, label and value + arrow; then a Download CV button.

**Command palette (⌘K / Ctrl+K).** Jump to any section, download the CV, copy email (toast confirms), open LinkedIn/GitHub, switch theme. Listbox with arrow keys and `aria-activedescendant`.

## CV and share image

**CV.** `/?print` renders `PrintResume.tsx` from the same data, so site and CV never disagree. One column, standard headings (Summary, Work Experience, Projects, Skills, Certifications and Training) so applicant tracking systems parse it in order. Letter size, has its own `PRINT_CSS` with embedded Inter and `@page` rules. It must stay **one page**. Generate with `scripts/qa/makepdf.mjs` (Playwright `page.pdf` plus pdf-lib metadata: title "Muhammad Abdullah CV", author, subject "Security Operations Analyst CV", keywords) and copy to `public/resume.pdf`. Download filename: `Muhammad-Abdullah-CV.pdf`. Check the text with `pdftext.mjs` (no em dashes, no phone, no education).

**OG image.** 1200×630, `scripts/qa/og.mjs`: #f5f5f7 background, white 36px-radius card, 208px round photo, name 62px/600, "Title · Islamabad, PK" 32px, tagline 24px `#6e6e73`, URL bottom-left in #0066cc, tool chips bottom-right. After regenerating, bump `og.png?v=N` in all three places in `index.html` so LinkedIn and others re-fetch.

## Hosting facts

- Live at https://mabddullah.vercel.app (the old muhammad-abdullah-resume.vercel.app 308-redirects there). Repo `muhammad1502/portfolio`. The Vercel project may still carry the old name, which only shows in the dashboard and preview URLs.
- `index.html`: title "Muhammad Abdullah | Security Operations Analyst", and JSON-LD `Person` with name, jobTitle, worksFor Ninpo, address Islamabad, sameAs LinkedIn/GitHub, knowsAbout and image. Absolute URLs use mabddullah.vercel.app; a custom domain later means updating `index.html`, `sitemap.xml`, `robots.txt`, `llms.txt`, `security.txt` and the CV header.
- `public/.well-known/security.txt` expires 2027-09-28: renew it before then. The contact is his email.
- The profile photo (`src/imports/muhammad-abdullah.jpg`, 384px) is EXIF-stripped.
- Last Lighthouse run (after the React 19 / Vite 8 upgrade): mobile 100 / 100 / 100 / 100, desktop 100, CLS 0.
- October 2026 upgrades: lucide-react 0.454 → 1.49, react 18.3 → 19.3, @vitejs/plugin-react 4.7 → 6.1, typescript 5.9 → 7.0, vite 6.4 → 8.3 (PR #27; Dependabot #19 and #20 closed).
