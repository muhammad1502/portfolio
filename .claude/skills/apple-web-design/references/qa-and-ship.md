# QA and shipping

## Test harness setup (each new container)

Playwright is preinstalled in Claude Code cloud containers (Chromium under `/opt/pw-browsers`; never run `playwright install`). Run the scripts from a scratch folder so their `node_modules` stays out of the site repo:

```bash
QA=<scratchpad>/qa
mkdir -p $QA && cp <skill>/scripts/{qa.mjs,server.mjs,brand-assets.mjs} $QA/
cd $QA && npm init -y >/dev/null && npm install --no-audit --no-fund axe-core
ln -sf $(npm root -g)/playwright node_modules/playwright   # redo after every npm install here
cd <site> && npm run build
cd $QA && SITE_ROOT=<site> PORT=4174 node server.mjs       # run in the background
BASE=http://localhost:4174/ node qa.mjs
```

`server.mjs` serves `dist/` with the exact `vercel.json` headers, real 404s and brotli, so tests and Lighthouse match production. Don't `pkill -f "node server.mjs"` in the same shell command that started it; it kills your own shell. Background servers stop after a time limit; restart when needed.

## What `qa.mjs` checks (content-agnostic)

1. 15 widths (320 to 1920) × light and dark: no horizontal overflow (side-scrolling containers excepted), buttons 44px tall and one width, one leading icon each, the right button colours per theme, uniform cards, no clipped text, **no em dashes**, targets ≥24px, theme follows the system, count-ups land on their values, nav mode switches at 833px, no console or network errors.
2. Every nav link lands just below the sticky nav and becomes current; the brand link returns to the top with a clean URL and focus on `main`.
3. Theme toggle: names its action, switches, stores the choice, survives reload, updates `theme-color`.
4. Every details button: opens a titled, labelled dialog with scroll lock; closes by Escape, close button and backdrop; focus returns.
5. Phone: menu opens with every link reachable and closes on Escape; section chips; bottom sheet with grab handle; carousel snaps with one dot per card.
6. ⌘K: opens with search focused; typing a section and Enter jumps there.
7. Links: in-page targets exist; new-tab links use `noopener` and say "opens in a new tab"; every link has a name.
8. Keyboard: skip link first, focus ring visible, every Tab stop visible and never under the sticky nav (WCAG 2.4.11).
9. Nothing faded or animating on load; reduced motion stops scaling and shows final numbers.
10. Text-spacing override (WCAG 1.4.12) loses nothing.
11. axe-core WCAG 2.2 AA + best practice, both themes, desktop and phone, page and open modal.
12. CSP bans inline script, no inline executable script, junk paths 404, content is pre-rendered, page renders styled with JavaScript off.

Add checks for anything custom you build, and keep the whole suite green before every push. A failing check is never "flaky" until you have reproduced and explained it. A tap test that misses because a card was still settling is fixed with `tapSettled` (scroll, wait, tap the centre), not by retrying.

## Other checks before shipping

- **Look at it:** full-page screenshots at 1440 light, 1440 dark and 390 light (`reducedMotion: 'reduce'`) and actually view them.
- **Lighthouse** (mobile and `--preset=desktop`): `CHROME_PATH=$(ls -d /opt/pw-browsers/chromium-*/chrome-linux/chrome | head -1) npx lighthouse http://localhost:4174/ --quiet --chrome-flags="--headless=new --no-sandbox" --output=json --output-path=lh.json`. Aim for 100 / 100 / 100 / 100 with CLS 0.
- **Brand assets** after any name or tagline change: `node brand-assets.mjs <site> --name … --tagline … --url …`, then bump `og.png?v=N`.
- **Playwright gotchas:** `locator.click()`/`tap()` on sticky or scroll-snapped elements scrolls the page first; tap by coordinates. Make selectors specific (`dialog.modal`, not `dialog`). Wait for `document.fonts.ready` before screenshots or PDFs.

## Shipping to Vercel

1. Commit with a plain sentence (no em dashes), push the working branch, open a PR.
2. Wait for the Vercel status on the head commit (`gh api repos/<owner>/<repo>/commits/<sha>/status`) to be `success` before merging; a failed preview means the production build would fail too.
3. Merge, then wait for the status on the merge commit and check production with `curl`: strip tags before grepping (`sed 's/<[^>]*>//g'`), because text that lights up word by word is split into spans.
4. Report what is live and what was verified.

Dependabot major-version PRs often fail the Vercel build. Reproduce on the Dependabot branch, apply the upgrade with the code fixes on your branch, run the full suite and Lighthouse, ship, then close the Dependabot PRs with a note pointing to yours.
