---
name: apple-portfolio
description: The complete playbook for Muhammad Abdullah's apple.com-style portfolio (mabddullah.vercel.app, repo muhammad1502/portfolio) and for building any site in the same style. Covers the design system and light/dark theming, motion, WCAG 2.2 AA accessibility, content and honesty rules, the CV PDF, security headers, pre-rendering, the QA suite and the ship-to-Vercel routine. Use it for ANY change to this portfolio (copy, experience, projects, case studies, write-ups, certifications, colours, buttons, animations, CV, share image, SEO, deploys), for questions about how the site works, and whenever the user wants another site, landing page or resume page that should look and behave like this one, even if they don't say "skill" or "apple".
---

# Apple-style portfolio playbook

This skill records everything decided while building **https://mabddullah.vercel.app**: the design system, theming, motion, accessibility, content rules, testing and deploy routine. The goal is that any future change, or a brand new site in the same style, comes out the same quality without the user having to repeat themselves.

The user is not a developer. Explain outcomes in plain words, do the work end to end (build, test, commit, PR, merge, verify live), and only stop to ask when a decision is genuinely theirs (facts about their career, anything that would be published).

## The non-negotiables

These came from repeated user feedback. Each has a reason; keep the reason in mind for cases not listed.

1. **Never make anything up.** Every claim, number, date, title and credential must come from the user or their own material. If a fact is missing, ask or leave it out. A hiring manager who catches one inflated claim stops trusting the rest. See `references/content.md` for the confirmed facts and the decisions already made.
2. **Write like a person, not an AI.** No em dashes (use commas, colons, full stops or "to" for ranges). No filler like "passionate", "leveraging", "seamless", "delve", "in today's fast-paced". Short, concrete, first person on the site, third person in the CV summary.
3. **Hiring-manager first.** Lead with outcomes and real numbers, keep it scannable, one-page CV, nothing that raises doubts (no phone number, no education section, no named ransomware groups, no client names).
4. **Uniform in light and dark.** Every component is defined through tokens on `:root` and `:root[data-theme='dark']`. Never hardcode a colour in a component. Check both themes for every visual change.
5. **WCAG 2.2 AA, for real.** Contrast at least 4.5:1 for text, visible focus, 44px targets, keyboard paths, screen reader names, reduced-motion support. axe must report zero violations.
6. **Motion decorates, it never hides.** Content is visible on first paint; nothing fades in or waits on scroll. The user explicitly called load-in fades "dumb". Motion is scroll-linked or interaction-driven and switches off under `prefers-reduced-motion` (except colour-only fades).
7. **Consistent buttons.** One size (44px tall, min-width 188px, pill), exactly one leading icon each, same hover glow everywhere. If a new label doesn't fit 188px, shorten the label rather than make one button wider.
8. **Verify before claiming.** Build, run the full QA suite, check the live site after deploy, and say exactly what was checked.

## Where things live (this repo)

| What | Where |
|---|---|
| All content (profile, experience, case studies, projects, skills, certs) | `src/app/components/resume-data.ts` |
| All styles and theme tokens | `src/styles/site.css` |
| Page composition | `src/app/App.tsx` |
| Nav sections (nav, footer, chips, ⌘K all read this) | `src/app/lib/sections.ts` |
| Motion hooks | `src/app/lib/motion.ts`, `useThemeMode.ts`, `useActiveSection.ts` |
| CV layout (`/?print`) | `src/app/components/PrintResume.tsx` → `public/resume.pdf` |
| Meta, OG, JSON-LD | `index.html` |
| Headers, CSP, caching | `vercel.json` |
| AI-crawler profile | `public/llms.txt` |
| Pre-paint theme script | `public/theme-init.js` |

A copy of the full working source is in `assets/reference/` so the system can be rebuilt in a new repo.

## Workflow for any change

1. **Content first.** Edit `resume-data.ts`. Check the change against `references/content.md` (facts, banned words, anonymisation). Mirror wording changes into `public/llms.txt`, `index.html` meta/JSON-LD and the CV if they're affected (`grep -rn` the old wording across the repo, excluding `node_modules` and `dist`).
2. **Design.** Use existing tokens and components; read `references/design-system.md` before adding UI. New sections: add to `sections.ts` and they appear in the nav, phone chips, footer and ⌘K automatically.
3. **Motion.** Read `references/motion.md` before adding or changing any animation.
4. **Accessibility.** Run through `references/accessibility.md` for anything interactive.
5. **Build:** `npm run build` (type-check, client build, SSR build, pre-render). It must print `prerender: wrote … KB`.
6. **QA:** run the suite in `scripts/qa/` (setup in `references/qa-and-deploy.md`). Add checks for new features. Everything must pass.
7. **Regenerate assets when their inputs change:** the CV PDF when content changes (must stay one page), the OG image when the name, title or tagline changes (bump `og.png?v=N` in `index.html`).
8. **Ship:** commit (plain message, no em dashes), push, PR, merge, wait for the Vercel status, then check the live HTML. Details in `references/qa-and-deploy.md`.
9. **Report back** in plain language: what changed, what was verified, anything that needs the user's decision.

## Reference files

Read the one that matches the task; each is self-contained.

- `references/content.md`: honesty rules, voice, the confirmed facts and every content decision made so far (title, certs, what's excluded), case study anonymisation, the write-up template, gathering facts from the user's other chats.
- `references/design-system.md`: tokens (exact light and dark values), type scale, layout, breakpoints, buttons, cards, nav, modal and sheet, the CV and the OG image.
- `references/motion.md`: every animation, how it's built, its reduced-motion behaviour and the bugs already hit.
- `references/accessibility.md`: the checklist and the traps found in testing.
- `references/architecture.md`: stack, pre-render and hydration, CSP and security headers, SEO and AI readability, performance results.
- `references/qa-and-deploy.md`: the QA harness (750 checks), Lighthouse, Playwright gotchas, and the commit, PR, merge, verify routine.
- `references/history.md`: what the user asked for and pushed back on, in order. Read it when unsure what they'd want.

## Building a new site in this style

Copy `assets/reference/` into the new repo, swap `resume-data.ts`, the photo, `index.html` meta, `public/` files and the domain references (search for `mabddullah`), then follow the workflow above. Keep the tokens, button system, motion and QA suite as they are; they're what make it feel finished.
