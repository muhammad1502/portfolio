# QA and deploy

## QA harness setup (each new container)

The scripts live in this skill's `scripts/qa/`. They need Playwright (preinstalled globally in Claude Code cloud containers, with Chromium at `/opt/pw-browsers`; never run `playwright install`) plus a few npm packages. Run them from a scratch copy so `node_modules` stays out of the repo:

```bash
QA=<scratchpad>/qa
mkdir -p $QA && cp <repo>/.claude/skills/apple-portfolio/scripts/qa/* $QA/
cd $QA && npm install --no-audit --no-fund
ln -sf $(npm root -g)/playwright node_modules/playwright   # redo after every npm install here
export SITE_ROOT=<repo>                                     # the scripts need this when copied
cd <repo> && npm run build
cd $QA && node server.mjs   # run in the background (Bash run_in_background); serves dist on :4174
```

`server.mjs` serves `dist/` with the exact `vercel.json` headers, real 404s and brotli, so tests and Lighthouse match production.

Gotcha: never `pkill -f "node server.mjs"` in the same shell command that started it; it kills your own shell. Stop it with TaskStop or by PID. After a container restart the server is gone; start it again.

## Running

- `node qa.mjs`: the full suite (750 checks at last run). Prints only failures and `N/N passed`; details go to `qa-results.txt`. Everything must pass before pushing.
- `node makepdf.mjs cv.pdf`: builds the CV from `http://localhost:4174/?print`, sets PDF metadata, prints the page count (must be 1). Copy to `<repo>/public/resume.pdf`, then rebuild.
- `node pdftext.mjs cv.pdf`: extracts the PDF text to check wording (no em dashes, no phone, no education, nothing stale).
- `node og.mjs`: renders `og-new.png`; view it, then copy to `<repo>/public/og.png` and bump `og.png?v=N` in `index.html`.
- Lighthouse: `CHROME_PATH=/opt/pw-browsers/chromium-1194/chrome-linux/chrome npx lighthouse http://localhost:4174/ [--preset=desktop] --quiet --chrome-flags="--headless=new --no-sandbox" --output=json --output-path=lh.json` (check the chromium folder name with `ls /opt/pw-browsers`).

## What the suite covers

1. Layout at 15 widths (320 to 1920) × light and dark: no horizontal overflow, nothing outside the viewport, equal button widths, no console or network errors.
2. Nav anchors land exactly below the nav; name link returns to top with a clean URL.
3. Motion: scrollspy, spotlight, theme crossfade, button hover glow, tap ripple, bottom sheet, phone menu marker, back-to-top, projects carousel and dots, swipe-to-close, haptics, ⌘K palette, copy toast, tilt, stat replay, settle, hero recede, About word lighting, chips, `whoami`.
4. Write-ups and case studies: each opens with the right title and sections, no em dashes, focus returns to its button; no client identifiers anywhere on the page.
5. CV downloads from all four entry points (hero, nav, contact, footer) with the right filename and a real PDF.
6. Every "Learn more" modal, three ways to close, focus return.
7. Theme toggle and persistence across reloads.
8. Mobile menu.
9. Every link valid; externals use `noopener`.
10. Keyboard paths; nothing hidden right after load; focus never obscured (2.4.11); text spacing (1.4.12).
11. axe-core WCAG 2.2 AA in both themes, desktop and mobile.
12. Security surface (headers, no inline scripts) and pre-rendered content present before JS.
13. Print route renders standalone with its own font.

When you add a feature, add checks for it, and update hardcoded counts (nav sections, palette actions, menu links, carousel dots) that the change affects.

## Playwright gotchas

- `locator.click()` / `tap()` on sticky or scroll-snapped elements scrolls the page first and breaks scroll-position tests; tap by coordinates (`page.mouse` / `page.touchscreen` at the element's box) instead.
- `locator.tap()` on a card that is still settling (scroll-linked motion) can miss: it scrolls and taps in the same instant, the card moves between press and release, and the click lands on the parent. Use the suite's `tapSettled(page, locator)` helper (scroll into view, wait 400 ms, tap the centre). Real fingers never hit this: the card is at rest once the scroll stops.
- Make selectors explicit when similar elements multiply (`#projects .button:not(.button-secondary)`, `dialog.modal`), or new elements make them ambiguous.
- Use `reducedMotion: 'reduce'` contexts for screenshots, and a normal context for motion tests.
- Wait for `document.fonts.ready` before PDF or OG captures.

## Shipping routine

The user has said "just merge" and "I trust you": the standing approval is to commit, open a PR, merge and verify without asking each time. Content that needs his fact-check can still go up as an unmerged PR first, if he hasn't already OK'd it.

1. `git add -A && git commit -m "<plain sentence, no em dashes>"`, ending with the attribution trailer the session's system reminder gives (if any).
2. `git push -u origin <working branch>` (retry network failures with backoff 2s/4s/8s/16s).
3. Open a PR into `main` (GitHub MCP `create_pull_request`), short body: what changed, QA result.
4. Merge it (`merge_pull_request`, merge method "merge", `expectedHeadSha` = `git rev-parse HEAD`).
5. Bring the working branch up to date: `git fetch origin main && git merge --ff-only origin/main && git push`.
6. Wait for Vercel: poll `https://api.github.com/repos/muhammad1502/portfolio/commits/<merge sha>/status` until `success` (run the loop in the background).
7. Check production: `curl -s https://mabddullah.vercel.app/ | sed 's/<[^>]*>//g' | grep …` for the new text (strip tags: About text is split into per-word spans). Text that only appears inside a modal isn't in the pre-rendered HTML; check `llms.txt`, the CV (`cmp` the live `resume.pdf` with the local one) or the card titles instead.
8. Tell the user what's live and what was verified.

Browser tests against the live site don't work from the container (the proxy's TLS certificate); test locally and verify production with curl. Never disable TLS verification.

Repo facts: `muhammad1502/portfolio` (renamed from `muhammad-abdullah-resume`; GitHub redirects the old name, which must never be reused). Vercel kept deploying after the rename. The Vercel project may still be named after the old repo; that only affects dashboard and preview URLs.
