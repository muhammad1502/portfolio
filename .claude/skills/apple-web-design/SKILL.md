---
name: apple-web-design
description: An apple.com-style design system and feature set for building or restyling any website or web app (landing pages, product pages, portfolios, company sites, docs or event pages). Includes the colour tokens with matched light and dark themes, Apple's type scale and breakpoints, one consistent button system, a translucent sticky nav, phone section chips, a ⌘K command palette, details modals that become swipeable bottom sheets on phones, card carousels, count-up stats, scroll-linked motion that never hides content, WCAG 2.2 AA accessibility, pre-rendering, strict security headers, Vercel deploys, a ready-to-run React starter template and a content-agnostic Playwright and axe QA suite. Use it whenever someone wants a site that looks or feels like Apple's, or is "clean, premium, minimal, polished or professional with light and dark mode", or wants to reuse this design system or template, even if they don't mention Apple or skills.
---

# Apple-style web design

A complete, tested design system plus a starter site. The look: apple.com's rhythm (big headlines, quiet grey cards, a 980px column, pill buttons) with matched light and dark themes, and motion that adds delight without ever hiding content. Everything here was built, tested at 15 widths in both themes, and shipped on a real site (Lighthouse 100, axe clean).

## The rules that make it work

Each one exists because breaking it was noticed and disliked. Keep the reason in mind for cases not listed.

1. **Tokens, never hardcoded colours.** Every colour is a CSS custom property defined for light (`:root`) and dark (`:root[data-theme='dark']`). Light and dark must be the same design with colours swapped; check both for every change.
2. **One button.** Pill, 44px tall, 188px minimum width, exactly one leading icon, the same hover glow and lift everywhere. Filled is Apple blue in light and a light pill with dark text in dark. Pairs are equal width. If a label doesn't fit, shorten the label.
3. **Motion decorates, it never hides.** Everything is visible on first paint. Effects follow scroll position or interaction, never a timer on load, and switch off under `prefers-reduced-motion` (colour-only fades excepted).
4. **WCAG 2.2 AA for real.** Contrast, visible focus never hidden by the sticky nav, 24px+ targets, keyboard paths, names that start with the visible label, "opens in a new tab" on new-tab links. axe reports zero violations.
5. **Fast and safe by default.** Pre-rendered HTML, self-hosted fonts with metric-matched fallbacks, no third-party requests, a strict CSP with no inline scripts, real 404s.
6. **UX psychology from growth.design.** One primary action per area (Hick's Law), detail on request (Progressive Disclosure), short grouped sections (Chunking), big close targets (Fitts's Law), the strongest content first and a clear next step last. See `references/ux-principles.md`.
7. **New features only if they fit.** Fun but professional, on phones and desktop alike. Add an effect or feature only when it matches the rest of the aesthetic and serves a principle; otherwise leave it out.
8. **True, human copy.** No invented facts, no em dashes, no AI-sounding filler. See `references/writing.md`.
9. **Research, then verify.** Look things up and cross-check them before stating them (versions, standards, product settings). Build, run the QA suite, look at screenshots and check the live site before saying anything is done.

## Starting a new site

1. Copy `assets/template/` into the new repo (it is a complete Vite 8 + React 19 + TypeScript 7 project, with no `node_modules`).
2. Replace the sample content in `src/site-data.ts`. It describes a fictional app, "Fieldnote", and drives the whole page: `site`, `navAction`, `hero` and an ordered list of `sections`. Section types:
   - `text`: big paragraphs that light up as you read, with an optional terminal line
   - `tiles`: wide cards with count-up stats, "Learn more" details and an outbound link
   - `cards`: grid cards with points and a footnote; `carousel: true` on phones, `columns: 3` on large screens
   - `list`: one card of name / meta / note rows
   - `contact`: icon cards plus a call to action

   Each section appears in the nav, the phone chips, the footer and ⌘K automatically.
3. Replace `example.com` and the Fieldnote text in `index.html`, `public/llms.txt`, `public/robots.txt`, `public/sitemap.xml` and `public/.well-known/security.txt`. Pick the right JSON-LD type.
4. Generate the icons and share image: `node scripts/brand-assets.mjs <site> --name "…" --tagline "…" --url …` (add `--photo` for a person).
5. `npm install && npm run build`, then run the QA suite (`references/qa-and-ship.md`) and fix everything it reports.
6. Deploy on Vercel (Git-connected, framework Vite; `vercel.json` already sets the build, headers and caching).

## Restyling an existing site

Bring the system in layers instead of copying the template wholesale:
1. The tokens, fonts and base rules from the top of `assets/template/src/styles/site.css`, plus `public/theme-init.js` and the theme hook for light and dark.
2. Buttons, cards, nav and footer CSS, then the components the site needs.
3. Motion (`src/app/lib/motion.ts` and the motion section of site.css), then accessibility fixes, then the QA suite pointed at the site's URL. It is content-agnostic, but it expects the class names used here (`.button`, `.card`, `.globalnav…`); adjust selectors if the site differs.

For non-React stacks the CSS, tokens and `theme-init.js` work as is; port the small hooks (theme, scroll effects, spotlight, scrollspy) to the framework's equivalent.

## Reference files

Read the one that matches the task.

- `references/design-system.md`: every token with light and dark values, the type scale per breakpoint, layout rules, each component's anatomy, theming mechanics, brand assets.
- `references/motion.md`: every animation, how it's built, its reduced-motion behaviour, and bugs already hit.
- `references/accessibility.md`: the WCAG 2.2 AA checklist and traps found in testing.
- `references/architecture.md`: stack, pre-render and hydration, dependency upgrades, CSP and headers, SEO and AI readability, performance.
- `references/ux-principles.md`: the growth.design principles behind the layout and interactions, and which to avoid.
- `references/writing.md`: honesty and voice rules for the copy.
- `references/qa-and-ship.md`: setting up and running the QA suite, Lighthouse, Playwright gotchas, the Vercel shipping routine.

## Bundled files

- `assets/template/`: the starter site.
- `scripts/qa.mjs`: content-agnostic Playwright and axe suite (481 checks on the template).
- `scripts/server.mjs`: local server that mirrors Vercel's headers, 404s and compression.
- `scripts/brand-assets.mjs`: favicon, touch icon and 1200×630 share image.
