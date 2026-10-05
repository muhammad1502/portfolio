// General QA suite for sites built with the apple-web-design template.
// Content-agnostic: it reads the page and checks the design system's promises.
//
// Usage (from a folder with playwright + axe-core installed):
//   BASE=http://localhost:4174/ node qa.mjs
// Prints failures and "N/N passed"; full log in qa-results.txt.
import { chromium } from 'playwright';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const BASE = process.env.BASE || 'http://localhost:4174/';
const require = createRequire(import.meta.url);
const axeSrc = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const results = [];
const check = (cond, m) => results.push((cond ? 'ok   ' : 'FAIL ') + m);

const browser = await chromium.launch();
async function open(opts = {}) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true, ...opts });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => ['error', 'warning'].includes(m.type()) && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('requestfailed', (r) => errors.push('requestfailed ' + r.url()));
  page.on('response', (r) => r.status() >= 400 && errors.push(`HTTP ${r.status()} ${r.url()}`));
  await page.goto(BASE);
  await page.waitForTimeout(400);
  return { ctx, page, errors };
}
async function scrollAll(page) {
  const h = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y <= h; y += 300) {
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), y);
    await page.waitForTimeout(50);
  }
  await page.waitForTimeout(1600);
}
// Tap like a finger: scroll into view, let scroll-linked motion settle, tap the centre.
async function tapSettled(page, locator) {
  await locator.scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  const bb = await locator.boundingBox();
  await page.touchscreen.tap(bb.x + bb.width / 2, bb.y + bb.height / 2);
}
const sectionIds = async (page) => page.evaluate(() => [...document.querySelectorAll('.globalnav-list a[href^="#"]')].map((a) => a.getAttribute('href').slice(1)));

// ---------- 1. layout at every width, both themes ----------
for (const colorScheme of ['light', 'dark']) {
  for (const width of [320, 360, 390, 414, 600, 734, 735, 833, 834, 1024, 1068, 1069, 1280, 1440, 1920]) {
    const { ctx, page, errors } = await open({ viewport: { width, height: 800 }, colorScheme });
    await scrollAll(page);
    const r = await page.evaluate(() => {
      const out = {};
      out.overflowX = document.documentElement.scrollWidth - window.innerWidth;
      out.outside = [...document.querySelectorAll('body *')]
        .filter((el) => {
          const b = el.getBoundingClientRect();
          if (!b.width || getComputedStyle(el).position === 'fixed') return false;
          if (el.closest('.visually-hidden, dialog, .toast-region, .globalnav-flyout, .skip-link')) return false;
          // Content inside a side-scrolling container (carousel, chip strip) is allowed off-screen.
          for (let n = el.parentElement; n && n !== document.body; n = n.parentElement) {
            if (/(auto|scroll)/.test(getComputedStyle(n).overflowX)) return false;
          }
          return b.right > window.innerWidth + 0.5 || b.left < -0.5;
        })
        .map((el) => el.className || el.tagName)
        .slice(0, 5);
      const btns = [...document.querySelectorAll('main .button, footer .button')].filter((b) => b.offsetParent);
      out.heights = [...new Set(btns.map((b) => b.offsetHeight))];
      out.widths = [...new Set(btns.map((b) => b.offsetWidth))];
      out.iconRule = btns.every((b) => b.querySelectorAll('svg').length === 1 && b.firstElementChild?.tagName.toLowerCase() === 'svg');
      out.primaryLook = [...new Set(btns.filter((b) => !b.classList.contains('button-secondary')).map((b) => { const c = getComputedStyle(b); return c.backgroundColor + '|' + c.color; }))];
      out.secondaryLook = [...new Set(btns.filter((b) => b.classList.contains('button-secondary')).map((b) => { const c = getComputedStyle(b); return c.borderTopColor + '|' + c.color; }))];
      out.cardBgs = [...new Set([...document.querySelectorAll('.card, .contact-card')].map((el) => getComputedStyle(el).backgroundColor))];
      out.cardRadius = [...new Set([...document.querySelectorAll('.card, .contact-card')].map((el) => getComputedStyle(el).borderTopLeftRadius))];
      out.textOverflow = [...document.querySelectorAll('main *')].filter((el) => el.children.length === 0 && !el.closest('.visually-hidden') && el.scrollWidth > el.clientWidth + 1 && getComputedStyle(el).overflow !== 'visible').length;
      const allText = document.body.innerText + document.title + [...document.querySelectorAll('meta')].map((m) => m.content).join(' ') + [...document.querySelectorAll('[aria-label],[alt]')].map((e) => e.getAttribute('aria-label') || e.getAttribute('alt')).join(' ');
      out.emDash = (allText.match(/—/g) || []).length;
      out.smallTargets = [...document.querySelectorAll('a, button')]
        .filter((el) => el.offsetParent && !el.closest('.skip-link, .globalnav-flyout'))
        .map((el) => { const b = el.getBoundingClientRect(); return [el.textContent.trim().slice(0, 20) || el.getAttribute('aria-label'), Math.round(b.width), Math.round(b.height)]; })
        .filter(([, w, h]) => w < 24 || h < 24);
      out.navLinksVisible = getComputedStyle(document.querySelector('.globalnav-list')).display !== 'none';
      out.menuBtnVisible = getComputedStyle(document.querySelector('.globalnav-menu-toggle')).display !== 'none';
      const list = document.querySelector('.globalnav-list').getBoundingClientRect();
      const actions = document.querySelector('.globalnav-actions').getBoundingClientRect();
      const brand = document.querySelector('.globalnav-brand').getBoundingClientRect();
      out.navOverlap = out.navLinksVisible && (list.right > actions.left + 0.5 || brand.right > list.left + 0.5);
      out.navH = Math.round(document.querySelector('.globalnav').getBoundingClientRect().height);
      out.theme = document.documentElement.dataset.theme;
      out.stats = [...document.querySelectorAll('.stat-value')].map((s) => [s.querySelector('.visually-hidden')?.textContent, s.querySelector('span[aria-hidden="true"]:not(.stat-value-ghost)')?.textContent]);
      return out;
    });
    const tag = `${colorScheme} ${width}px`;
    check(r.overflowX <= 0 && r.outside.length === 0, `${tag}: no horizontal overflow ${r.overflowX} ${r.outside.join(',')}`);
    check(r.heights.length <= 1 && (r.heights[0] ?? 44) === 44, `${tag}: all buttons 44px tall ${JSON.stringify(r.heights)}`);
    check(r.widths.length <= 1, `${tag}: every button the same width ${JSON.stringify(r.widths)}`);
    check(r.iconRule, `${tag}: every button has exactly one leading icon`);
    const expectP = colorScheme === 'dark' ? 'rgb(245, 245, 247)|rgb(29, 29, 31)' : 'rgb(0, 113, 227)|rgb(255, 255, 255)';
    const expectS = colorScheme === 'dark' ? 'rgb(245, 245, 247)|rgb(245, 245, 247)' : 'rgb(0, 102, 204)|rgb(0, 102, 204)';
    check(r.primaryLook.every((x) => x === expectP) && r.secondaryLook.every((x) => x === expectS), `${tag}: theme-specific, uniform button colours ${JSON.stringify([r.primaryLook, r.secondaryLook])}`);
    check(r.cardBgs.length === 1 && r.cardRadius.length === 1, `${tag}: uniform cards ${r.cardBgs} ${r.cardRadius}`);
    check(r.textOverflow === 0, `${tag}: no clipped text (${r.textOverflow})`);
    check(r.emDash === 0, `${tag}: no em dashes in text, meta or labels (${r.emDash})`);
    check(r.smallTargets.length === 0, `${tag}: all targets >= 24x24 (WCAG 2.5.8) ${JSON.stringify(r.smallTargets)}`);
    check(r.theme === colorScheme, `${tag}: theme follows the system (${r.theme})`);
    check(r.stats.every(([want, shown]) => want === shown), `${tag}: count-ups land on their values ${JSON.stringify(r.stats)}`);
    check(r.navLinksVisible === width > 833 && r.menuBtnVisible === width <= 833, `${tag}: nav mode correct (links ${r.navLinksVisible}, menu ${r.menuBtnVisible})`);
    check(!r.navOverlap && r.navH === 44, `${tag}: nav 44px, no overlap (h=${r.navH})`);
    check(errors.length === 0, `${tag}: no console or network errors ${errors.join(' | ')}`);
    await ctx.close();
  }
}

// ---------- 2. nav anchors land just below the nav; scrollspy; brand link ----------
{
  const { ctx, page } = await open();
  for (const id of await sectionIds(page)) {
    await page.click(`.globalnav-list a[href="#${id}"]`);
    await page.waitForTimeout(1200);
    const r = await page.evaluate((id) => {
      const top = Math.round(document.getElementById(id).getBoundingClientRect().top);
      const atBottom = Math.ceil(window.scrollY + innerHeight) >= document.documentElement.scrollHeight - 1;
      return { top, atBottom, current: document.querySelector('.globalnav-link.is-current')?.getAttribute('href') };
    }, id);
    check((r.top >= 40 && r.top <= 48) || r.atBottom, `#${id} lands below the nav (top ${r.top})`);
    if (!r.atBottom) check(r.current === `#${id}`, `#${id} becomes the current nav link (${r.current})`);
  }
  await page.click('.globalnav-brand'); await page.waitForTimeout(1200);
  const b = await page.evaluate(() => ({ y: scrollY, hash: location.hash, focus: document.activeElement.id }));
  check(b.y === 0 && b.hash === '' && b.focus === 'main', 'brand link: back to top, clean address, focus on main ' + JSON.stringify(b));
  await ctx.close();
}

// ---------- 3. theme toggle, persistence, crossfade ----------
{
  const { ctx, page } = await open({ colorScheme: 'light' });
  const btn = page.locator('.globalnav-actions button[aria-label^="Switch to"]');
  check((await btn.getAttribute('aria-label')) === 'Switch to dark mode', 'theme button names its action');
  await btn.click(); await page.waitForTimeout(1000);
  const s = await page.evaluate(() => ({ theme: document.documentElement.dataset.theme, stored: localStorage.getItem('theme-mode'), bg: getComputedStyle(document.body).backgroundColor, meta: document.querySelector('meta[name="theme-color"]').content }));
  check(s.theme === 'dark' && s.stored === 'dark' && s.bg === 'rgb(0, 0, 0)' && s.meta === '#161617', 'toggle switches to dark and stores it ' + JSON.stringify(s));
  await page.reload(); await page.waitForTimeout(400);
  check((await page.evaluate(() => document.documentElement.dataset.theme)) === 'dark', 'dark choice survives a reload');
  await ctx.close();
}

// ---------- 4. every details button: opens, sections, three ways to close, focus return ----------
{
  const { ctx, page, errors } = await open();
  const n = await page.locator('main button[aria-haspopup="dialog"]').count();
  for (let i = 0; i < n; i++) {
    for (const how of ['escape', 'close', 'backdrop']) {
      const b = page.locator('main button[aria-haspopup="dialog"]').nth(i);
      await b.scrollIntoViewIfNeeded(); await page.waitForTimeout(300); await b.click(); await page.waitForTimeout(500);
      const m = await page.evaluate(() => { const d = document.querySelector('dialog.modal'); return { open: d.open, title: d.querySelector('.modal-headline')?.textContent, labelled: !!document.getElementById(d.getAttribute('aria-labelledby') || 'x'), lock: document.documentElement.style.overflow }; });
      if (how === 'escape') check(m.open && m.title && m.labelled && m.lock === 'hidden', `details ${i + 1} opens, titled, page scroll locked ` + JSON.stringify(m));
      if (how === 'escape') await page.keyboard.press('Escape');
      if (how === 'close') await page.click('.modal-close');
      if (how === 'backdrop') await page.mouse.click(5, 450);
      await page.waitForTimeout(500);
      const after = await page.evaluate(() => ({ open: document.querySelector('dialog.modal').open, focus: document.activeElement?.getAttribute('aria-haspopup') }));
      check(!after.open && after.focus === 'dialog', `details ${i + 1} closes by ${how}, focus returns ` + JSON.stringify(after));
    }
  }
  check(errors.length === 0, 'details: no errors ' + errors.join('|'));
  await ctx.close();
}

// ---------- 5. phone: menu, chips, bottom sheet, carousel ----------
{
  const { ctx, page, errors } = await open({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const tapAt = async (sel) => { const bb = await page.locator(sel).boundingBox(); await page.touchscreen.tap(bb.x + bb.width / 2, bb.y + bb.height / 2); };
  await tapAt('.globalnav-menu-toggle'); await page.waitForTimeout(500);
  const m = await page.evaluate(() => ({ exp: document.querySelector('.globalnav-menu-toggle').getAttribute('aria-expanded'), lock: document.documentElement.style.overflow, links: [...document.querySelectorAll('.globalnav-flyout-link')].filter((a) => { const b = a.getBoundingClientRect(); return document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2)?.closest('a') === a; }).length, total: document.querySelectorAll('.globalnav-flyout-link').length }));
  check(m.exp === 'true' && m.lock === 'hidden' && m.links === m.total && m.total > 0, 'phone menu opens with every link reachable ' + JSON.stringify(m));
  await page.keyboard.press('Escape'); await page.waitForTimeout(400);
  check((await page.evaluate(() => document.querySelector('.globalnav-menu-toggle').getAttribute('aria-expanded'))) === 'false', 'Escape closes the phone menu');
  const chips = await page.evaluate(() => ({ shown: getComputedStyle(document.querySelector('.section-chips')).display !== 'none', count: document.querySelectorAll('.section-chip').length }));
  check(chips.shown && chips.count > 0, 'phone section chips shown ' + JSON.stringify(chips));
  const details = page.locator('main button[aria-haspopup="dialog"]').first();
  if (await details.count()) {
    await tapSettled(page, details); await page.waitForTimeout(700);
    const sheet = await page.evaluate(() => ({ open: document.querySelector('dialog.modal').open, grabber: getComputedStyle(document.querySelector('.sheet-grabber')).display }));
    check(sheet.open && sheet.grabber === 'block', 'phone details open as a bottom sheet with a grab handle ' + JSON.stringify(sheet));
    await tapAt('.modal-close'); await page.waitForTimeout(600);
  }
  const track = page.locator('.carousel-track').first();
  if (await track.count()) {
    await track.scrollIntoViewIfNeeded(); await page.waitForTimeout(400);
    const c = await track.evaluate((t) => ({ scrolls: t.scrollWidth > t.clientWidth + 50, snap: getComputedStyle(t).scrollSnapType, dots: t.parentElement.querySelectorAll('.carousel-dot').length, cards: t.children.length }));
    check(c.scrolls && c.snap.startsWith('x') && c.dots === c.cards, 'cards become a snapping carousel with one dot per card ' + JSON.stringify(c));
  }
  check(errors.length === 0, 'phone: no errors ' + errors.join('|'));
  await ctx.close();
}

// ---------- 6. ⌘K palette ----------
{
  const { ctx, page } = await open();
  await page.keyboard.press('Control+k'); await page.waitForTimeout(300);
  const s = await page.evaluate(() => ({ open: document.querySelector('dialog.palette').open, focus: document.activeElement.className, opts: document.querySelectorAll('[role="option"]').length }));
  check(s.open && s.focus.includes('palette-input') && s.opts > 2, 'Ctrl+K opens the palette with the search focused ' + JSON.stringify(s));
  const ids = await sectionIds(page);
  await page.keyboard.type(ids.at(-1)); await page.waitForTimeout(150);
  await page.keyboard.press('Enter'); await page.waitForTimeout(1200);
  check((await page.evaluate(() => location.hash)) === `#${ids.at(-1)}`, 'typing a section name and Enter jumps there');
  await ctx.close();
}

// ---------- 7. links ----------
{
  const { ctx, page } = await open();
  const r = await page.evaluate(() => [...document.querySelectorAll('a[href]')].map((a) => ({ href: a.getAttribute('href'), target: a.target, rel: a.rel, name: (a.textContent + ' ' + (a.getAttribute('aria-label') || '')).trim() })));
  const ids = await page.evaluate(() => [...document.querySelectorAll('[id]')].map((e) => e.id));
  check(r.filter((l) => l.href.startsWith('#') && l.href.length > 1).every((l) => ids.includes(l.href.slice(1))), 'every in-page link has a target');
  check(r.filter((l) => l.target === '_blank').every((l) => /noopener/.test(l.rel) && /new tab/i.test(l.name)), 'new-tab links use noopener and say "opens in a new tab"');
  check(r.every((l) => l.name.length > 0), 'every link has an accessible name');
  await ctx.close();
}

// ---------- 8. keyboard: skip link, focus ring, focus never under the sticky nav ----------
{
  const { ctx, page } = await open();
  await page.keyboard.press('Tab'); await page.waitForTimeout(400);
  check((await page.evaluate(() => document.activeElement.textContent)) === 'Skip to main content', 'first Tab = skip link');
  await page.keyboard.press('Enter'); await page.waitForTimeout(500);
  check(await page.evaluate(() => document.activeElement.id === 'main'), 'skip link moves focus to main');
  await page.keyboard.press('Tab');
  check((await page.evaluate(() => getComputedStyle(document.activeElement).outlineStyle)) === 'solid', 'focused control shows a focus ring');
  await ctx.close();
}
for (const width of [1440, 390]) {
  const { ctx, page } = await open({ viewport: { width, height: 800 }, reducedMotion: 'reduce' });
  const total = await page.evaluate(() => [...document.querySelectorAll('a, button')].filter((e) => e.offsetParent || e.closest('.globalnav')).length);
  const hidden = [];
  let seen = 0;
  for (let i = 0; i < total + 5; i++) {
    await page.keyboard.press('Tab'); await page.waitForTimeout(30);
    const r = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body) return null;
      const b = el.getBoundingClientRect();
      const inNav = !!el.closest('.globalnav, .skip-link, .section-chips');
      return { t: (el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 30), visible: b.bottom > (inNav ? 0 : 44) && b.top < innerHeight };
    });
    if (!r) continue;
    seen++;
    if (!r.visible) hidden.push(r.t);
  }
  check(hidden.length === 0 && seen > 5, `${width}px: every Tab stop visible, never under the sticky nav (${seen} stops) ${hidden.join(', ')}`);
  await ctx.close();
}

// ---------- 9. motion never hides content; reduced motion ----------
for (const width of [1440, 390]) {
  const { ctx, page } = await open({ viewport: { width, height: 800 } });
  const r = await page.evaluate(() => {
    const els = [...document.querySelectorAll('main *, footer *')];
    const faded = els.filter((el) => !el.closest('.terminal-caret, .whoami-caret')).filter((el) => { let n = el; while (n && n !== document.body) { if (parseFloat(getComputedStyle(n).opacity) < 1) return true; n = n.parentElement; } return false; }).length;
    const running = document.getAnimations().filter((a) => a.animationName !== 'caret-blink').length;
    return { faded, running };
  });
  check(r.faded === 0 && r.running === 0, `${width}px: all content fully visible on load ${JSON.stringify(r)}`);
  await ctx.close();
}
{
  const { ctx, page } = await open({ reducedMotion: 'reduce' });
  await scrollAll(page);
  const r = await page.evaluate(() => ({
    settle: [...document.querySelectorAll('[data-settle]')].filter((el) => getComputedStyle(el).scale !== 'none' && getComputedStyle(el).scale !== '1').length,
    stats: [...document.querySelectorAll('.stat-value')].every((s) => s.querySelector('.visually-hidden')?.textContent === s.querySelector('span[aria-hidden="true"]:not(.stat-value-ghost)')?.textContent),
  }));
  check(r.settle === 0 && r.stats, 'reduced motion: nothing scales or moves, numbers show final values ' + JSON.stringify(r));
  await ctx.close();
}

// ---------- 10. text spacing (WCAG 1.4.12) ----------
for (const width of [1440, 390]) {
  const { ctx, page } = await open({ viewport: { width, height: 800 }, reducedMotion: 'reduce' });
  await page.addStyleTag({ content: '* { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; } p { margin-bottom: 2em !important; }' });
  await page.waitForTimeout(300);
  const r = await page.evaluate(() => ({ overflowX: document.documentElement.scrollWidth - innerWidth, btn: [...document.querySelectorAll('.button')].filter((b) => b.scrollWidth > b.clientWidth + 1).map((b) => b.textContent) }));
  check(r.overflowX <= 0 && r.btn.length === 0, `${width}px: text spacing override loses nothing ${JSON.stringify(r)}`);
  await ctx.close();
}

// ---------- 11. axe (WCAG 2.2 AA), both themes, desktop + phone, page and modal ----------
for (const colorScheme of ['light', 'dark']) for (const width of [1440, 390]) {
  const { ctx, page } = await open({ colorScheme, viewport: { width, height: 900 }, reducedMotion: 'reduce', bypassCSP: true /* test only: lets axe be injected */ });
  await page.addScriptTag({ content: axeSrc });
  const run = (sel) => page.evaluate(async (sel) => (await axe.run(sel ? document.querySelector(sel) : document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa', 'best-practice'] })).violations.map((x) => `${x.id}(${x.nodes.length}): ${x.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(', ')}`), sel);
  const v = await run(null);
  check(v.length === 0, `axe ${colorScheme} ${width}: ${v.join(' || ') || 'clean'}`);
  const d = page.locator('main button[aria-haspopup="dialog"]').first();
  if (await d.count()) {
    await d.scrollIntoViewIfNeeded(); await d.click(); await page.waitForTimeout(300);
    const vm = await run('dialog.modal');
    check(vm.length === 0, `axe modal ${colorScheme} ${width}: ${vm.join(' || ') || 'clean'}`);
  }
  await ctx.close();
}

// ---------- 12. security surface, 404, pre-rendered HTML ----------
{
  const get = async (u) => { const r = await fetch(BASE.replace(/\/$/, '') + u); return { status: r.status, csp: r.headers.get('content-security-policy'), body: await r.text() }; };
  const home = await get('/');
  check(/script-src 'self'/.test(home.csp || '') && !/script-src[^;]*unsafe-inline/.test(home.csp || ''), 'CSP forbids inline scripts');
  check(!/<script>(?!\s*$)/.test(home.body.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g, '')), 'index.html has no inline executable <script>');
  for (const u of ['/.env', '/.git/config', '/package.json', '/src/main.tsx', '/nope']) {
    const r = await get(u);
    check(r.status === 404, `${u} -> 404 (got ${r.status})`);
  }
  check(/<div id="root"><a class="skip-link"/.test(home.body) && /<h1[^>]*>/.test(home.body), 'page content is pre-rendered into the HTML');
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto(BASE); await page.waitForTimeout(300);
  const nojs = await page.evaluate(() => ({ h1: !!document.querySelector('h1')?.textContent, nav: getComputedStyle(document.querySelector('.globalnav')).position }));
  check(nojs.h1 && nojs.nav === 'sticky', 'with JavaScript off the page still renders, styled ' + JSON.stringify(nojs));
  await ctx.close();
}

await browser.close();
const fails = results.filter((r) => r.startsWith('FAIL'));
console.log(fails.join('\n'));
console.log(`\n${results.length - fails.length}/${results.length} passed`);
fs.writeFileSync('qa-results.txt', results.join('\n'));
process.exitCode = fails.length ? 1 : 0;
