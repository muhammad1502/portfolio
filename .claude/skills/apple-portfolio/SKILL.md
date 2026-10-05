---
name: apple-portfolio
description: Muhammad Abdullah's personal portfolio (mabddullah.vercel.app, repo muhammad1502/portfolio), covering his confirmed career facts, the content and honesty decisions he has made, his feedback history, the portfolio's own QA suite, the one-page CV PDF and the ship-to-Vercel routine. Use it for ANY change to this portfolio or his CV (experience, case studies, projects, write-ups, certifications, skills, wording, CV, share image, deploys) and for questions about what the site says. The design system, features and template it is built on live in the apple-web-design skill; use both together when changing how the portfolio looks or behaves.
---

# Muhammad Abdullah's portfolio

This skill records what is specific to **https://mabddullah.vercel.app**: the facts, the decisions, the history, and the routine for changing it safely. **How it looks and behaves** (tokens, light and dark themes, buttons, motion, accessibility, architecture, security headers, generic QA) is in the **apple-web-design** skill. Read that skill's references whenever a change touches design or features.

Muhammad is not a developer. Explain outcomes in plain words, do the work end to end (build, test, commit, PR, merge, verify live) and stop to ask only when a decision is genuinely his: facts about his career, or anything that would be published.

## The non-negotiables

1. **Never make anything up.** Every claim, number, date, title and credential must come from him or his own material. If a fact is missing, ask or leave it out. A hiring manager who catches one inflated claim stops trusting the rest. See `references/content.md`.
2. **Write like a person.** No em dashes, no AI filler. First person on the site, third person in the CV summary.
3. **Hiring-manager first.** Outcomes and real numbers, scannable, a one-page CV. No phone number, no education section, no named ransomware groups, no client names.
4. **Follow the apple-web-design rules:** uniform light and dark, one button system, motion that never hides content, WCAG 2.2 AA.
5. **Verify before claiming.** Build, run both QA suites, check the live site after deploy, and say exactly what was checked.

## Where things live

| What | Where |
|---|---|
| All content (profile, experience, case studies, projects, skills, certs, contacts) | `src/app/components/resume-data.ts` |
| Styles and theme tokens | `src/styles/site.css` |
| Page composition | `src/app/App.tsx` |
| Nav sections (nav, footer, chips and ⌘K read this) | `src/app/lib/sections.ts` |
| CV layout (`/?print`) | `src/app/components/PrintResume.tsx` → `public/resume.pdf` |
| Meta, OG, JSON-LD | `index.html` |
| AI-crawler profile | `public/llms.txt` |

## Workflow for any change

1. **Content:** edit `resume-data.ts` and check it against `references/content.md`. Mirror wording into `public/llms.txt`, `index.html` meta and JSON-LD, and the CV where affected; `grep -rn` the old wording across the repo, excluding `node_modules` and `dist`.
2. **Design or features:** follow apple-web-design (`design-system.md`, `motion.md`, `accessibility.md`). Portfolio component names differ from the template's; `references/site-specifics.md` maps them.
3. **Build:** `npm run build`. It must print `prerender: wrote … KB`.
4. **QA:** run the portfolio suite (`scripts/qa/qa.mjs`, 750 checks) and the general apple-web-design suite. Setup is in `references/qa-and-deploy.md`. Add checks for new features.
5. **Regenerate assets when their inputs change:** the CV PDF (must stay one page) when content changes; the OG image when name, title or tagline change (bump `og.png?v=N`).
6. **Ship:** commit, push, PR, wait for the Vercel preview, merge, verify production. He has given standing approval to merge ("just merge it, I trust you"). Content that needs his fact-check can go up as an unmerged PR first.
7. **Report back** in plain language.

## Reference files

- `references/content.md`: honesty rules, voice, the confirmed facts, every content decision so far, case study anonymisation, the write-up template, and how to get facts from his other chats.
- `references/site-specifics.md`: how the portfolio maps onto the design system, portfolio-only components, the CV and OG image, hosting facts.
- `references/qa-and-deploy.md`: the portfolio QA harness and the commit, PR, merge, verify routine.
- `references/history.md`: what he asked for and pushed back on, in order. Read it when unsure what he'd want.

## Bundled scripts

`scripts/qa/`: `qa.mjs` (the portfolio's own 750-check suite), `server.mjs`, `makepdf.mjs` (CV PDF), `pdftext.mjs` (CV text check), `og.mjs` (share image with his photo).
