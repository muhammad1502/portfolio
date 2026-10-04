import { chromium } from 'playwright';
import fs from 'node:fs';
const BASE = 'http://localhost:4174/';
const axeSrc = fs.readFileSync('node_modules/axe-core/axe.min.js', 'utf8');
const results = [];
const fail = (m) => { results.push('FAIL ' + m); };
const pass = (m) => { results.push('ok   ' + m); };
const check = (cond, m) => (cond ? pass(m) : fail(m));

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
  for (let y = 0; y <= h; y += 300) { await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), y); await page.waitForTimeout(60); }
  await page.waitForTimeout(1700);
}

// ---------- 1. layout at every width, both themes ----------
for (const colorScheme of ['light', 'dark']) {
  for (const width of [320, 360, 390, 414, 600, 734, 735, 833, 834, 1024, 1068, 1069, 1280, 1440, 1920]) {
    const { ctx, page, errors } = await open({ viewport: { width, height: 800 }, colorScheme });
    await scrollAll(page);
    const r = await page.evaluate(() => {
      const out = {};
      out.overflowX = document.documentElement.scrollWidth - window.innerWidth;
      // elements poking outside the viewport horizontally
      out.outside = [...document.querySelectorAll('body *')].filter((el) => {
        const b = el.getBoundingClientRect();
        if (!b.width || getComputedStyle(el).position === 'fixed') return false;
        if (el.closest('.visually-hidden, dialog, .toast-region, .globalnav-flyout, .skip-link, .projects-track, .section-chips-track')) return false;
        return b.right > window.innerWidth + 0.5 || b.left < -0.5;
      }).map((el) => el.className || el.tagName).slice(0, 5);
      const btns = [...document.querySelectorAll('main .button, footer .button')].filter((b) => b.offsetParent);
      out.heights = [...new Set(btns.map((b) => b.offsetHeight))];
      out.iconRule = [...document.querySelectorAll('.button')].filter((b) => b.offsetParent).every((b) => b.querySelectorAll('svg').length === 1 && b.firstElementChild?.tagName.toLowerCase() === 'svg');
      const vis = [...document.querySelectorAll('.button')].filter((b) => b.offsetParent);
      out.primaryLook = [...new Set(vis.filter((b) => !b.classList.contains('button-secondary')).map((b) => { const c = getComputedStyle(b); return c.backgroundColor + '|' + c.color; }))];
      out.secondaryLook = [...new Set(vis.filter((b) => b.classList.contains('button-secondary')).map((b) => { const c = getComputedStyle(b); return c.borderTopColor + '|' + c.color; }))];
      out.widths = [...new Set(btns.map((b) => b.offsetWidth))];
      out.cardStyles = [...new Set([...document.querySelectorAll('.card, .tile')].map((el) => { const c = getComputedStyle(el); return [c.backgroundColor, c.borderTopLeftRadius, c.textAlign].join('/'); }))];
      out.groups = [...document.querySelectorAll('main .button-group')].map((g) =>
        [...new Set([...g.querySelectorAll('.button')].map((b) => b.offsetWidth))]);
      // text overflowing its own box (clipped words)
      out.textOverflow = [...document.querySelectorAll('main *')].filter((el) => el.children.length === 0 && !el.closest('.visually-hidden') && el.scrollWidth > el.clientWidth + 1 && getComputedStyle(el).overflow !== 'visible').length;
      out.hidden = 0;
      out.theme = document.documentElement.dataset.theme;
      out.stats = [...document.querySelectorAll('.stat-value > span[aria-hidden="true"]:not(.stat-value-ghost)')].map((s) => s.textContent);
      out.statMisaligned = [...document.querySelectorAll('.stats')].some((row) => {
        const vals = [...row.querySelectorAll('.stat-value')].map((v) => v.getBoundingClientRect());
        const rows = {};
        vals.forEach((v) => { const k = Math.round(v.top / 40); (rows[k] ||= []).push(v.top); });
        return vals.some((v, i) => vals.some((u) => Math.abs(u.top - v.top) > 0.5 && Math.abs(u.top - v.top) < 40));
      });
      out.tileBgs = [...new Set([...document.querySelectorAll('.tile')].map((el) => getComputedStyle(el).backgroundColor))];
      out.cardBgs = [...new Set([...document.querySelectorAll('.card, .contact-card')].map((el) => getComputedStyle(el).backgroundColor))];
      const allText = document.body.innerText + document.title + [...document.querySelectorAll('meta')].map((m) => m.content).join(' ') + [...document.querySelectorAll('[aria-label],[alt]')].map((e) => e.getAttribute('aria-label') || e.getAttribute('alt')).join(' ');
      out.emDash = (allText.match(/\u2014/g) || []).length;
      out.smallTargets = [...document.querySelectorAll('a, button')].filter((el) => el.offsetParent && !el.closest('.skip-link, .globalnav-flyout')).map((el) => { const b = el.getBoundingClientRect(); return [el.textContent.trim().slice(0, 20) || el.getAttribute('aria-label'), Math.round(b.width), Math.round(b.height)]; }).filter(([, w, h]) => w < 24 || h < 24);
      out.navLinksVisible = getComputedStyle(document.querySelector('.globalnav-list')).display !== 'none';
      out.menuBtnVisible = getComputedStyle(document.querySelector('.globalnav-menu-toggle')).display !== 'none';
      // nav: every link fits (no overlap between list and actions)
      const list = document.querySelector('.globalnav-list').getBoundingClientRect();
      const actions = document.querySelector('.globalnav-actions').getBoundingClientRect();
      const brand = document.querySelector('.globalnav-brand').getBoundingClientRect();
      out.navOverlap = out.navLinksVisible && (list.right > actions.left + 0.5 || brand.right > list.left + 0.5);
      out.navH = Math.round(document.querySelector('.globalnav').getBoundingClientRect().height);
      return out;
    });
    const tag = `${colorScheme} ${width}px`;
    check(r.overflowX <= 0 && r.outside.length === 0, `${tag}: no horizontal overflow ${r.overflowX} ${r.outside.join(',')}`);
    check(r.heights.length === 1 && r.heights[0] === 44, `${tag}: all buttons 44px tall ${JSON.stringify(r.heights)}`);
    const expectP = colorScheme === 'dark' ? 'rgb(245, 245, 247)|rgb(29, 29, 31)' : 'rgb(0, 113, 227)|rgb(255, 255, 255)';
    const expectS = colorScheme === 'dark' ? 'rgb(245, 245, 247)|rgb(245, 245, 247)' : 'rgb(0, 102, 204)|rgb(0, 102, 204)';
    check(r.primaryLook.length === 1 && r.primaryLook[0] === expectP && r.secondaryLook.length === 1 && r.secondaryLook[0] === expectS, `${tag}: theme-specific, uniform button colours ${JSON.stringify([r.primaryLook, r.secondaryLook])}`);
    check(r.iconRule, `${tag}: every button has exactly one leading icon`);
    check(r.widths.length === 1, `${tag}: every button the same width ${JSON.stringify(r.widths)}`);
    check(r.cardStyles.length === 1, `${tag}: experience cards match other cards ${JSON.stringify(r.cardStyles)}`);
    check(r.groups.every((g) => g.length === 1), `${tag}: buttons in each pair equal width ${JSON.stringify(r.groups)}`);
    check(r.textOverflow === 0, `${tag}: no clipped text (${r.textOverflow})`);
        check(r.tileBgs.length === 1 && r.cardBgs.length === 1, `${tag}: uniform tiles/cards ${r.tileBgs} | ${r.cardBgs}`);
    check(r.tileBgs[0] !== 'rgb(0, 0, 0)' || colorScheme === 'dark', `${tag}: no black tiles in light mode`);
    check(r.emDash === 0, `${tag}: no em dashes in text/meta/labels (${r.emDash})`);
    check(r.smallTargets.length === 0, `${tag}: all targets >= 24x24 (WCAG 2.5.8) ${JSON.stringify(r.smallTargets)}`);
    check(!r.statMisaligned, `${tag}: stat numbers aligned per row`);
    check(r.theme === colorScheme, `${tag}: theme follows system (${r.theme})`);
    check(JSON.stringify(r.stats) === JSON.stringify(['100+', '95%+', '20%', '100%', '37', '9', '37', '18/18']), `${tag}: counters land on data values ${r.stats.join(' ')}`);
    check(r.navLinksVisible === width > 833 && r.menuBtnVisible === width <= 833, `${tag}: nav mode correct (links ${r.navLinksVisible}, menu ${r.menuBtnVisible})`);
    check(!r.navOverlap && r.navH === 44, `${tag}: nav 44px, no overlap (h=${r.navH})`);
    check(errors.length === 0, `${tag}: no console/network errors ${errors.join(' | ')}`);
    await ctx.close();
  }
}

// ---------- 2. nav links + anchors (desktop) ----------
{
  const { ctx, page, errors } = await open();
  for (const id of ['about', 'experience', 'cases', 'projects', 'skills', 'certifications', 'contact']) {
    await page.click(`.globalnav-list a[href="#${id}"]`);
    await page.waitForTimeout(1200);
    const top = await page.evaluate((id) => {
      const el = document.getElementById(id);
      const atBottom = Math.ceil(window.scrollY + innerHeight) >= document.documentElement.scrollHeight - 1;
      return { top: Math.round(el.getBoundingClientRect().top), atBottom, hash: location.hash };
    }, id);
    check((Math.abs(top.top - 44) <= 1 || top.atBottom) && top.hash === '#' + id, `nav "${id}" scrolls section under nav (top=${top.top}, hash=${top.hash})`);
  }
  await page.click('.globalnav-brand'); await page.waitForTimeout(1200);
  const brand = await page.evaluate(() => ({ y: scrollY, hash: location.hash, href: location.href, focus: document.activeElement?.id }));
  check(brand.y === 0 && brand.hash === '' && brand.href === 'http://localhost:4174/' && brand.focus === 'main', 'name link: back to top, clean address, focus on main ' + JSON.stringify(brand));
  {
    const fresh = await ctx.newPage();
    await fresh.goto(BASE + '#top'); await fresh.waitForTimeout(400);
    check((await fresh.evaluate(() => location.href)) === 'http://localhost:4174/', 'old #top links get a clean address on load');
    await fresh.close();
  }
  // footer section links
  for (const id of ['about', 'contact']) {
    await page.click(`.footer a[href="#${id}"]`); await page.waitForTimeout(1200);
    const t = await page.evaluate((id) => Math.round(document.getElementById(id).getBoundingClientRect().top), id);
    const atBottom = await page.evaluate(() => Math.ceil(scrollY + innerHeight) >= document.documentElement.scrollHeight - 1);
    check(Math.abs(t - 44) <= 1 || atBottom, `footer "${id}" link works (top=${t})`);
  }
  // hero Contact button
  await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
  await page.click('.hero a[href="#contact"]'); await page.waitForTimeout(1200);
  check(await page.evaluate(() => location.hash === '#contact'), 'hero Contact button goes to #contact');
  check(errors.length === 0, 'nav: no errors ' + errors.join('|'));
  await ctx.close();
}

// ---------- 2b. motion: progress bar, scrollspy, spotlight, theme reveal ----------
{
  const { ctx, page, errors } = await open();
  check(await page.evaluate(() => !document.querySelector('.globalnav-progress')), 'no separate progress bar under the nav (only the section underline)');
  for (const id of ['experience', 'skills', 'certifications']) {
    await page.click(`.globalnav-list a[href="#${id}"]`); await page.waitForTimeout(1300);
    const r = await page.evaluate((id) => {
      const link = document.querySelector(`.globalnav-list a[href="#${id}"]`);
      const ind = document.querySelector('.globalnav-indicator');
      const a = link.getBoundingClientRect(); const b = ind.getBoundingClientRect();
      return { current: link.getAttribute('aria-current'), others: document.querySelectorAll('.globalnav-list a[aria-current]').length, op: getComputedStyle(ind).opacity, under: Math.abs((a.left + a.width / 2) - (b.left + b.width / 2)) < 2 && b.width > 10 };
    }, id);
    check(r.current === 'location' && r.others === 1 && r.op === '1' && r.under, `scrollspy marks ${id} and underline sits under it ${JSON.stringify(r)}`);
  }
  // spotlight follows the cursor over a card
  const card = page.locator('#skills .card').first();
  await card.scrollIntoViewIfNeeded();
  const box = await card.boundingBox();
  await page.mouse.move(box.x + 60, box.y + 50); await page.waitForTimeout(500);
  const spot = await card.evaluate((el) => ({ mx: el.style.getPropertyValue('--mx'), my: el.style.getPropertyValue('--my'), glow: getComputedStyle(el, '::before').opacity }));
  check(Math.abs(parseFloat(spot.mx) - 60) < 1 && Math.abs(parseFloat(spot.my) - 50) < 1 && spot.glow === '1', 'card spotlight follows the cursor ' + JSON.stringify(spot));
  await page.mouse.move(2, 2);
  // theme toggle uses a view transition and spins the icon in
  await page.evaluate(() => { window.__vt = 0; const o = document.startViewTransition.bind(document); document.startViewTransition = (cb) => { window.__vt++; return o(cb); }; });
  await page.click(`.globalnav-actions button[aria-label^="Switch to"]`); await page.waitForTimeout(800);
  const vt = await page.evaluate(() => ({ vt: window.__vt, theme: document.documentElement.dataset.theme, icon: document.querySelector('.theme-icon').dataset.mode, rays: getComputedStyle(document.querySelector('.theme-icon-rays')).opacity }));
  check(vt.vt === 1 && vt.theme === 'dark' && vt.icon === 'dark' && vt.rays === '0', 'theme toggle: crossfade view transition, icon morphed to moon ' + JSON.stringify(vt));
  // fallback without View Transitions: colour fade class for the fade duration, icon still morphs
  await page.evaluate(() => { document.startViewTransition = undefined; });
  await page.click(`.globalnav-actions button[aria-label^="Switch to"]`); await page.waitForTimeout(60);
  const fb = await page.evaluate(() => ({ fading: document.documentElement.classList.contains('theme-fading'), theme: document.documentElement.dataset.theme, morphing: document.querySelector('.theme-icon-rays').getAnimations().length > 0 }));
  await page.waitForTimeout(1000);
  const fb2 = await page.evaluate(() => document.documentElement.classList.contains('theme-fading'));
  check(fb.fading && fb.theme === 'light' && fb.morphing && !fb2, 'fallback theme fade (no View Transitions) ' + JSON.stringify(fb));
  check(errors.length === 0, 'motion: no errors ' + errors.join('|'));
  await ctx.close();
}
{
  const { ctx, page } = await open({ reducedMotion: 'reduce' });
  await page.evaluate(() => { window.__vt = 0; const o = document.startViewTransition.bind(document); document.startViewTransition = (cb) => { window.__vt++; return o(cb); }; });
  const r = await page.evaluate(async () => {
    document.querySelector(`.globalnav-actions button[aria-label^="Switch to"]`).click();
    await new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(res)));
    return { vt: window.__vt, iconMoves: document.querySelector('.theme-icon-rays').getAnimations().some((a) => a.effect.getTiming().duration > 50) };
  });
  await page.waitForTimeout(1000);
  const theme = await page.evaluate(() => document.documentElement.dataset.theme);
  check(r.vt === 1 && !r.iconMoves && theme === 'dark', 'reduced motion: theme still crossfades, icon swaps without spin/scale ' + JSON.stringify(r));
  await ctx.close();
}

// ---------- 2d. button hover: same glow + lift on filled and outline buttons ----------
for (const colorScheme of ['light', 'dark']) {
  const { ctx, page } = await open({ colorScheme });
  const out = [];
  for (const sel of ['.hero .button:not(.button-secondary)', '.hero .button-secondary']) {
    const btn = page.locator(sel);
    const before = await btn.evaluate((b) => getComputedStyle(b).backgroundColor);
    await btn.hover(); await page.waitForTimeout(450);
    const s = await btn.evaluate((b) => { const c = getComputedStyle(b); return { bg: c.backgroundColor, shadow: c.boxShadow, tf: c.transform }; });
    out.push({ sel, changed: s.bg !== before, glow: s.shadow !== 'none', lifted: s.tf !== 'none' });
    await page.mouse.move(2, 2); await page.waitForTimeout(400);
  }
  check(out.every((o) => o.changed && o.glow && o.lifted), `${colorScheme}: hover glows, lifts and changes colour on filled and outline buttons ${JSON.stringify(out)}`);
  await ctx.close();
}

// ---------- 2c. phone motion: tap ripple, bottom sheet, current section in menu ----------
{
  const { ctx, page, errors } = await open({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
  const card = page.locator('#skills .card').first();
  await card.scrollIntoViewIfNeeded(); await page.waitForTimeout(250); // let it settle to full size
  const box = await card.boundingBox();
  await page.touchscreen.tap(box.x + 40, box.y + 30); await page.waitForTimeout(80);
  const tap = await card.evaluate((el) => ({ tapped: el.classList.contains('is-tapped'), mx: el.style.getPropertyValue('--mx'), anim: getComputedStyle(el, '::before').animationName }));
  await page.waitForTimeout(900);
  const after = await card.evaluate((el) => el.classList.contains('is-tapped'));
  check(tap.tapped && Math.abs(parseFloat(tap.mx) - 40) < 1 && tap.anim === 'tap-glow' && !after, 'tap sends a glow ripple from the tap point ' + JSON.stringify(tap));
  // current section is marked in the phone menu
  await page.evaluate(() => document.getElementById('skills').scrollIntoView({ behavior: 'instant' })); await page.waitForTimeout(500);
  // Tap by coordinates: Playwright's locator.tap() scrolls sticky elements, a real tap doesn't.
  const tapMenu = async () => { const bb = await page.locator('.globalnav-menu-toggle').boundingBox(); await page.touchscreen.tap(bb.x + bb.width / 2, bb.y + bb.height / 2); };
  await tapMenu(); await page.waitForTimeout(400);
  const cur = await page.evaluate(() => [...document.querySelectorAll('.globalnav-flyout-link[aria-current="location"]')].map((a) => a.getAttribute('href')));
  check(JSON.stringify(cur) === '["#skills"]', 'phone menu marks the current section ' + JSON.stringify(cur));
  await tapMenu(); await page.waitForTimeout(400);
  // details slide up as a bottom sheet
  await page.locator('.tile .button:not(.button-secondary)').first().tap(); await page.waitForTimeout(60);
  const sheet = await page.evaluate(() => getComputedStyle(document.querySelector('dialog.modal')).animationName);
  check(sheet === 'sheet-in', 'phone details open as a bottom sheet (' + sheet + ')');
  await page.waitForTimeout(600); await page.locator('.modal-close').tap(); await page.waitForTimeout(60);
  const out = await page.evaluate(() => getComputedStyle(document.querySelector('dialog.modal')).animationName);
  await page.waitForTimeout(500);
  check(out === 'sheet-out' && !(await page.evaluate(() => document.querySelector('dialog.modal').open)), 'bottom sheet slides away on close');
  check(errors.length === 0, 'phone motion: no errors ' + errors.join('|'));
  await ctx.close();
}

// ---------- 2e. phone extras: back-to-top, projects carousel, swipe-to-close sheet, haptics ----------
{
  const { ctx, page, errors } = await open({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
  await page.evaluate(() => { window.__vib = []; navigator.vibrate = (ms) => { window.__vib.push(ms); return true; }; });
  // back to top
  const btt = () => page.evaluate(() => { const b = document.querySelector('.back-to-top'); return { shown: b.classList.contains('is-shown'), inert: b.hasAttribute('inert'), off: +b.querySelectorAll('circle')[1].getAttribute('stroke-dashoffset') }; });
  const top0 = await btt();
  await page.evaluate(() => scrollTo({ top: document.documentElement.scrollHeight / 2, behavior: 'instant' })); await page.waitForTimeout(500);
  const mid = await btt();
  check(!top0.shown && top0.inert && mid.shown && !mid.inert && mid.off < top0.off, 'back-to-top hidden at top, appears after scrolling with ring filling ' + JSON.stringify([top0, mid]));
  const bb = await page.locator('.back-to-top').boundingBox();
  await page.touchscreen.tap(bb.x + 24, bb.y + 24); await page.waitForTimeout(1500);
  const after = await page.evaluate(() => ({ y: scrollY, url: location.href }));
  check(after.y === 0 && after.url === 'http://localhost:4174/' && !(await btt()).shown, 'back-to-top returns to the top with a clean address ' + JSON.stringify(after));
  // carousel
  await page.evaluate(() => document.getElementById('projects').scrollIntoView({ behavior: 'instant' })); await page.waitForTimeout(300);
  const car = await page.evaluate(() => { const t = document.querySelector('.projects-track'); return { scrolls: t.scrollWidth > t.clientWidth + 50, snap: getComputedStyle(t).scrollSnapType, dots: document.querySelectorAll('.carousel-dot').length, active: [...document.querySelectorAll('.carousel-dot')].findIndex((d) => d.classList.contains('is-active')) }; });
  check(car.scrolls && car.snap.startsWith('x') && car.dots === 3 && car.active === 0, 'projects are a snapping carousel with 3 dots ' + JSON.stringify(car));
  await page.locator('.carousel-dots').scrollIntoViewIfNeeded(); await page.waitForTimeout(200);
  const dot3 = await page.locator('.carousel-dot').nth(2).boundingBox();
  await page.touchscreen.tap(dot3.x + dot3.width / 2, dot3.y + dot3.height / 2); await page.waitForTimeout(900);
  const car2 = await page.evaluate(() => { const t = document.querySelector('.projects-track'); const c = t.children[2].getBoundingClientRect(); return { active: [...document.querySelectorAll('.carousel-dot')].findIndex((d) => d.classList.contains('is-active')), current: document.querySelector('.carousel-dot[aria-current="true"]')?.getAttribute('aria-label'), visible: c.left >= 0 && c.right <= innerWidth + 1 }; });
  check(car2.active === 2 && car2.visible && /3 of 3/.test(car2.current), 'tapping the third dot shows the third project ' + JSON.stringify(car2));
  await page.evaluate(() => { const t = document.querySelector('.projects-track'); t.scrollTo({ left: t.children[1].offsetLeft - 20, behavior: 'instant' }); }); await page.waitForTimeout(400);
  check((await page.evaluate(() => [...document.querySelectorAll('.carousel-dot')].findIndex((d) => d.classList.contains('is-active')))) === 1, 'swiping to the second project moves the active dot');
  // sheet: short drag snaps back, long drag closes
  const cdp = await ctx.newCDPSession(page);
  const drag = async (from, to) => {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 195, y: from }] });
    for (let y = from; y <= to; y += 20) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 195, y }] });
    await page.waitForTimeout(250); // slow release, so only the distance counts
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  };
  await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
  await page.locator('.tile .button:not(.button-secondary)').first().tap(); await page.waitForTimeout(700);
  check(await page.evaluate(() => getComputedStyle(document.querySelector('.sheet-grabber')).display === 'block'), 'phone sheet shows a grab handle');
  await drag(120, 180); await page.waitForTimeout(500);
  const snap = await page.evaluate(() => ({ open: document.querySelector('dialog.modal').open, tf: document.querySelector('dialog.modal').style.transform }));
  check(snap.open && snap.tf === '', 'short drag snaps the sheet back ' + JSON.stringify(snap));
  await drag(120, 400); await page.waitForTimeout(700);
  check(!(await page.evaluate(() => document.querySelector('dialog.modal').open)), 'dragging the sheet down closes it');
  // haptics on theme toggle (Android-style vibrate stub)
  const tb = await page.locator(`.globalnav-actions button[aria-label^="Switch to"]`).first().boundingBox();
  await page.touchscreen.tap(tb.x + tb.width / 2, tb.y + tb.height / 2); await page.waitForTimeout(300);
  check((await page.evaluate(() => window.__vib.length)) >= 2, 'haptic tick on back-to-top, sheet swipe and theme toggle');
  check(errors.length === 0, 'phone extras: no errors ' + errors.join('|'));
  await ctx.close();
}
{
  const { ctx, page } = await open();
  const d = await page.evaluate(() => ({ dots: getComputedStyle(document.querySelector('.carousel-dots')).display, grid: getComputedStyle(document.querySelector('.projects-track')).display }));
  check(d.dots === 'none' && d.grid === 'grid', 'desktop keeps the projects grid, no carousel dots ' + JSON.stringify(d));
  // back-to-top on desktop too
  const st = () => page.evaluate(() => { const b = document.querySelector('.back-to-top'); return { shown: b.classList.contains('is-shown'), inert: b.hasAttribute('inert'), op: getComputedStyle(b).opacity }; });
  const a0 = await st();
  await page.evaluate(() => scrollTo({ top: 3000, behavior: 'instant' })); await page.waitForTimeout(600);
  const a1 = await st();
  await page.click('.back-to-top'); await page.waitForTimeout(1500);
  const a2 = await page.evaluate(() => ({ y: scrollY, url: location.href, focus: document.activeElement?.id }));
  check(!a0.shown && a0.inert && a1.shown && !a1.inert && a1.op === '1' && a2.y === 0 && a2.url === 'http://localhost:4174/' && a2.focus === 'main', 'desktop back-to-top appears after scrolling and returns to the top ' + JSON.stringify([a0, a1, a2]));
  // it never covers footer text at the very bottom
  await page.evaluate(() => scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' })); await page.waitForTimeout(500);
  const cover = await page.evaluate(() => { const b = document.querySelector('.back-to-top').getBoundingClientRect(); return [...document.querySelectorAll('.footer a, .footer p, .footer h2')].filter((el) => { const r = el.getBoundingClientRect(); return !(r.right < b.left || r.left > b.right || r.bottom < b.top || r.top > b.bottom); }).map((el) => el.textContent); });
  check(cover.length === 0, 'back-to-top does not cover footer text ' + JSON.stringify(cover));
  await ctx.close();
}

// ---------- 2f. desktop extras: ⌘K palette, copy toast, tilt, stat replay ----------
{
  const { ctx, page, errors } = await open();
  await ctx.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: 'http://localhost:4174' });
  const state = () => page.evaluate(() => { const d = document.querySelector('dialog.palette'); return { open: d.open, focus: document.activeElement?.className, opts: d.querySelectorAll('[role=option]').length, active: document.querySelector('.palette-input').getAttribute('aria-activedescendant') }; });
  await page.keyboard.press('Control+k'); await page.waitForTimeout(300);
  const s1 = await state();
  check(s1.open && s1.focus === 'palette-input' && s1.opts === 12 && s1.active === 'cmd-go-about', 'Ctrl+K opens the palette with the search focused and 12 actions ' + JSON.stringify(s1));
  await page.keyboard.press('ArrowDown'); await page.keyboard.press('ArrowDown');
  check((await state()).active === 'cmd-go-cases', 'arrow keys move the highlighted option');
  await page.keyboard.type('cv'); await page.waitForTimeout(100);
  const s2 = await state();
  check(s2.opts === 1 && s2.active === 'cmd-download', 'typing filters results ' + JSON.stringify(s2));
  const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 5000 }), page.keyboard.press('Enter')]);
  check(dl.suggestedFilename() === 'Muhammad-Abdullah-CV.pdf' && !(await state()).open, 'Enter on "Download CV" downloads it and closes the palette');
  await page.keyboard.press('Control+k'); await page.waitForTimeout(250); await page.keyboard.type('email'); await page.keyboard.press('Enter'); await page.waitForTimeout(400);
  const clip = await page.evaluate(async () => ({ clip: await navigator.clipboard.readText(), toast: document.querySelector('.toast.is-shown')?.textContent, live: document.querySelector('.toast-region').getAttribute('aria-live') }));
  check(clip.clip === 'muhammaddabddullah@outlook.com' && clip.toast === 'Email address copied' && clip.live === 'polite', 'copy email puts it on the clipboard and shows an announced toast ' + JSON.stringify(clip));
  await page.keyboard.press('Control+k'); await page.waitForTimeout(250); await page.keyboard.type('skills'); await page.keyboard.press('Enter'); await page.waitForTimeout(1300);
  const nav = await page.evaluate(() => ({ hash: location.hash, top: Math.round(document.getElementById('skills').getBoundingClientRect().top) }));
  check(nav.hash === '#skills' && Math.abs(nav.top - 44) <= 1, 'palette "Skills" jumps to the section ' + JSON.stringify(nav));
  await page.keyboard.press('Control+k'); await page.waitForTimeout(250); await page.keyboard.type('zzzz'); await page.waitForTimeout(100);
  check(await page.evaluate(() => document.querySelector('.palette-empty')?.textContent === 'No matches'), 'no-match state shown');
  await page.keyboard.press('Escape'); await page.waitForTimeout(300);
  check(!(await state()).open, 'Escape closes the palette');
  // nav button opens it; focus returns to the button on close
    await page.click('.globalnav-kbd'); await page.waitForTimeout(300);
  check((await state()).open, 'key-hint button in the nav opens the palette');
  await page.keyboard.press('Escape'); await page.waitForTimeout(300);
  check(await page.evaluate(() => document.activeElement?.classList.contains('globalnav-kbd')), 'focus returns to the nav button after closing');
  // tilt follows the cursor on a contact card
  const cc = page.locator('.contact-card').first(); await cc.scrollIntoViewIfNeeded(); const cb = await cc.boundingBox();
  await page.mouse.move(cb.x + cb.width - 10, cb.y + 10); await page.waitForTimeout(400);
  const tilt = await cc.evaluate((el) => ({ rx: parseFloat(el.style.getPropertyValue('--rx')), ry: parseFloat(el.style.getPropertyValue('--ry')), tf: getComputedStyle(el).transform }));
  check(tilt.rx > 0 && tilt.ry > 0 && tilt.ry <= 2 && tilt.tf.startsWith('matrix3d'), 'contact card tilts toward the cursor (≤2°) ' + JSON.stringify(tilt));
  await page.mouse.move(2, 2);
  // hovering a stat replays its count-up
  const stat = page.locator('.stat-value').first(); await stat.scrollIntoViewIfNeeded(); await page.waitForTimeout(1800);
  await stat.hover(); await page.waitForTimeout(150);
  const mid = await stat.evaluate((el) => el.querySelector('span[aria-hidden="true"]:not(.stat-value-ghost)').textContent);
  await page.waitForTimeout(1600);
  const end = await stat.evaluate((el) => el.querySelector('span[aria-hidden="true"]:not(.stat-value-ghost)').textContent);
  check(mid !== '100+' && end === '100+', `hovering a stat replays its count-up (${mid} -> ${end})`);
  check(errors.length === 0, 'desktop extras: no errors ' + errors.join('|'));
  await ctx.close();
}
{
  const { ctx, page } = await open({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  check(await page.evaluate(() => getComputedStyle(document.querySelector('.globalnav-kbd')).display === 'none'), 'phones: no ⌘K button in the nav');
  await ctx.close();
}
for (const colorScheme of ['light', 'dark']) {
  const { ctx, page } = await open({ colorScheme, reducedMotion: 'reduce', bypassCSP: true });
  await page.addScriptTag({ content: axeSrc });
  await page.keyboard.press('Control+k'); await page.waitForTimeout(300);
  const v = await page.evaluate(async () => (await axe.run(document.querySelector('dialog.palette'), { runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] })).violations.map((x) => `${x.id}: ${x.nodes.map((n) => n.target.join(' ')).join(', ')}`));
  check(v.length === 0, `axe palette ${colorScheme}: ${v.join(' || ') || 'clean'}`);
  await ctx.close();
}

// ---------- 2g. scroll-linked effects: settle, hero recede, About word highlight ----------
{
  const { ctx, page, errors } = await open();
  const read = () => page.evaluate(() => {
    const card = document.querySelector('#skills .card');
    const cs = getComputedStyle(card);
    const words = document.querySelectorAll('.about-copy [data-word]');
    return { settle: parseFloat(card.style.getPropertyValue('--settle') || '1'), scale: cs.scale, cardTop: Math.round(card.getBoundingClientRect().top), lit: document.querySelectorAll('.about-copy [data-word].is-lit').length, words: words.length, recede: parseFloat(document.querySelector('.hero-content').style.getPropertyValue('--recede') || '0'), heroOpacity: getComputedStyle(document.querySelector('.hero-content')).opacity };
  });
  const r0 = await read();
  check(r0.recede === 0 && r0.heroOpacity === '1' && r0.lit < r0.words, 'at the top: hero at full size/opacity, About text not yet lit ' + JSON.stringify(r0));
  // skills card just peeking in at the bottom: still settling
  await page.evaluate(() => { const c = document.querySelector('#skills .card'); scrollTo({ top: c.getBoundingClientRect().top + scrollY - innerHeight + 40, behavior: 'instant' }); }); await page.waitForTimeout(200);
  const r1 = await read();
  await page.evaluate(() => { const c = document.querySelector('#skills .card'); scrollTo({ top: c.getBoundingClientRect().top + scrollY - 150, behavior: 'instant' }); }); await page.waitForTimeout(200);
  const r2 = await read();
  check(r1.settle < 0.3 && parseFloat(r1.scale) < 0.975 && r2.settle === 1 && parseFloat(r2.scale) === 1, `cards settle into place as they scroll in (${r1.settle}, scale ${r1.scale} -> ${r2.settle}, scale ${r2.scale})`);
  check(r2.recede === 1 && parseFloat(r2.heroOpacity) < 0.5, 'hero has receded once scrolled past ' + JSON.stringify({ recede: r2.recede, op: r2.heroOpacity }));
  check(r2.lit === r2.words, 'About words are all lit once read past');
  // mid-About: some words lit, some not
  await page.evaluate(() => { const a = document.querySelector('.about-copy'); scrollTo({ top: a.getBoundingClientRect().top + scrollY - innerHeight * 0.62 + a.offsetHeight / 2, behavior: 'instant' }); }); await page.waitForTimeout(200);
  const r3 = await read();
  const colors = await page.evaluate(() => { const lit = document.querySelector('.about-copy [data-word].is-lit'); const dim = document.querySelector('.about-copy [data-word]:not(.is-lit)'); return [getComputedStyle(lit).color, getComputedStyle(dim).color]; });
  check(r3.lit > 10 && r3.lit < r3.words - 10 && colors[0] !== colors[1], `About text lights up word by word (${r3.lit}/${r3.words} lit) ${colors}`);
  check(errors.length === 0, 'scroll effects: no errors ' + errors.join('|'));
  await ctx.close();
}
{
  const { ctx, page } = await open({ reducedMotion: 'reduce' });
  await page.evaluate(() => { const c = document.querySelector('#skills .card'); scrollTo({ top: c.getBoundingClientRect().top + scrollY - innerHeight + 40, behavior: 'instant' }); }); await page.waitForTimeout(200);
  const r = await page.evaluate(() => ({ scale: getComputedStyle(document.querySelector('#skills .card')).scale, lit: document.querySelectorAll('.about-copy [data-word].is-lit').length, words: document.querySelectorAll('.about-copy [data-word]').length }));
  check((r.scale === 'none' || parseFloat(r.scale) === 1) && r.lit === r.words, 'reduced motion: no settle/recede movement, About highlight still works ' + JSON.stringify(r));
  await ctx.close();
}

// ---------- 2h. phone section chips + whoami ----------
{
  const { ctx, page, errors } = await open({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const chips = () => page.evaluate(() => ({ shown: getComputedStyle(document.querySelector('.section-chips')).display, top: Math.round(document.querySelector('.section-chips').getBoundingClientRect().top), current: [...document.querySelectorAll('.section-chip[aria-current="location"]')].map((a) => a.getAttribute('href')) }));
  const c0 = await chips();
  await page.evaluate(() => document.getElementById('certifications').scrollIntoView({ behavior: 'instant' })); await page.waitForTimeout(700);
  const c1 = await chips();
  const vis = await page.evaluate(() => { const t = document.querySelector('.section-chips-track'); const a = t.querySelector('.is-current').getBoundingClientRect(); return a.left >= 0 && a.right <= innerWidth; });
  check(c0.shown === 'block' && c1.top === 44 && JSON.stringify(c1.current) === '["#certifications"]' && vis, 'phone chips stick under the nav and track the current section ' + JSON.stringify([c0, c1, vis]));
  const skills = await page.locator('.section-chip[href="#skills"]').boundingBox();
  await page.touchscreen.tap(skills.x + skills.width / 2, skills.y + skills.height / 2); await page.waitForTimeout(1300);
  const land = await page.evaluate(() => Math.round(document.getElementById('skills').getBoundingClientRect().top));
  check(Math.abs(land - 88) <= 1, 'tapping a chip lands the section just below both bars (' + land + ')');
  check(errors.length === 0, 'chips: no errors ' + errors.join('|'));
  await ctx.close();
}
{
  const { ctx, page } = await open();
  const w = await page.evaluate(() => ({ chips: getComputedStyle(document.querySelector('.section-chips')).display, text: document.querySelector('.whoami')?.textContent, blink: getComputedStyle(document.querySelector('.whoami-caret')).animationName }));
  check(w.chips === 'none' && /\$ whoami\s*muhammad abdullah · soc analyst · islamabad, pk/.test(w.text) && w.blink === 'caret-blink', 'desktop: no chips; whoami line with blinking caret ' + JSON.stringify(w));
  await ctx.close();
  const r = await open({ reducedMotion: 'reduce' });
  check((await r.page.evaluate(() => getComputedStyle(document.querySelector('.whoami-caret')).animationName)) === 'none', 'reduced motion: caret does not blink');
  await r.ctx.close();
}

// ---------- 2i. write-up ----------
{
  const { ctx, page, errors } = await open();
  const btn = page.locator('#projects .button:not(.button-secondary)');
  check((await btn.count()) === 1, 'one "Read write-up" button (GitLab Triage Accelerator)');
  await btn.scrollIntoViewIfNeeded(); await page.waitForTimeout(250); await btn.click(); await page.waitForTimeout(600);
  const m = await page.evaluate(() => { const d = document.querySelector('dialog.modal'); return { open: d.open, title: d.querySelector('.modal-headline')?.textContent, sections: [...d.querySelectorAll('.modal-section-title')].map((h) => h.textContent), link: d.querySelector('a.button')?.getAttribute('href'), emdash: (d.innerText.match(/\u2014/g) || []).length }; });
  check(m.open && m.title === 'Taking the repetitive clicks out of GitLab triage' && m.sections.length === 5 && m.link === 'https://github.com/muhammad1502/gitlab-automator' && m.emdash === 0, 'write-up opens with its 5 sections and repo link ' + JSON.stringify(m));
  await page.keyboard.press('Escape'); await page.waitForTimeout(400);
  check(await page.evaluate(() => document.activeElement?.textContent.startsWith('Read write-up')), 'focus returns to "Read write-up"');
  check(errors.length === 0, 'write-up: no errors ' + errors.join('|'));
  await ctx.close();
}

// ---------- 2j. case studies ----------
{
  const { ctx, page, errors } = await open();
  const btns = page.locator('#cases .button');
  const n = await btns.count();
  check(n === 4, 'four case study buttons ' + n);
  const body = await page.evaluate(() => document.body.innerText);
  const leaks = ['RBC', 'EC2AMAZ', 'Lawson', 'rioux', 'Dean and', 'PMI', 'PlugCPA', 'Texlon', 'AVI Media', 'Feed It Forward', 'CREAAMIK', 'Seona', 'Mahsa', 'Herman'].filter((w) => body.includes(w));
  check(leaks.length === 0, 'no client identifiers on the page ' + leaks.join(','));
  for (let i = 0; i < n; i++) {
    const b = btns.nth(i);
    const card = await b.evaluate((el) => el.closest('article').querySelector('.card-title').textContent);
    await b.scrollIntoViewIfNeeded(); await page.waitForTimeout(250); await b.click(); await page.waitForTimeout(600);
    const m = await page.evaluate(() => { const d = document.querySelector('dialog.modal'); return { open: d.open, title: d.querySelector('.modal-headline')?.textContent, sections: d.querySelectorAll('.modal-section-title').length, emdash: (d.innerText.match(/\u2014/g) || []).length }; });
    check(m.open && m.title === card && m.sections >= 3 && m.emdash === 0, `case study ${i + 1} opens with its sections ` + JSON.stringify(m));
    await page.keyboard.press('Escape'); await page.waitForTimeout(400);
    check(await page.evaluate(() => document.activeElement?.textContent.startsWith('Read write-up')), `focus returns to case study ${i + 1} button`);
  }
  check(errors.length === 0, 'case studies: no errors ' + errors.join('|'));
  await ctx.close();
}

// ---------- 3. downloads (all four entry points) ----------
{
  const { ctx, page } = await open();
  const selectors = ['.hero a[download]', '.globalnav-actions a[download]', '.contact-cta a[download]', '.footer a[download]'];
  for (const sel of selectors) {
    const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 5000 }), page.click(sel)]);
    const p = await dl.path();
    const head = fs.readFileSync(p).subarray(0, 5).toString();
    check(dl.suggestedFilename() === 'Muhammad-Abdullah-CV.pdf' && head === '%PDF-', `download via ${sel} -> ${dl.suggestedFilename()} (${head})`);
  }
  await ctx.close();
}

// ---------- 4. modal: every Learn more, three ways to close, focus return ----------
{
  const { ctx, page, errors } = await open();
  const n = await page.locator('.tile .button:not(.button-secondary)').count();
  check(n === 3, `3 "Learn more" buttons (entries with details): ${n}`);
  const titles = await page.locator('.tile .card-title').allTextContents();
  for (let i = 0; i < n; i++) {
    for (const how of ['x', 'esc', 'backdrop']) {
      const btn = page.locator('.tile .button:not(.button-secondary)').nth(i);
      await btn.scrollIntoViewIfNeeded();
      await btn.click();
      await page.waitForTimeout(500);
      const st = await page.evaluate(() => {
        const d = document.querySelector('dialog.modal');
        return { open: d.open, title: d.querySelector('.modal-headline')?.textContent, sections: d.querySelectorAll('.modal-section').length, lock: document.documentElement.style.overflow, focusIn: d.contains(document.activeElement) };
      });
      const tileTitle = await btn.evaluate((b) => b.closest('.tile').querySelector('.card-title').textContent);
      check(st.open && st.title === tileTitle && st.sections > 0 && st.lock === 'hidden' && st.focusIn, `modal ${i} opens with "${st.title}" (${st.sections} sections, scroll locked, focus inside)`);
      if (how === 'x') await page.click('.modal-close');
      if (how === 'esc') await page.keyboard.press('Escape');
      if (how === 'backdrop') await page.mouse.click(8, 450);
      await page.waitForTimeout(500);
      const after = await page.evaluate(() => ({ open: document.querySelector('dialog.modal').open, lock: document.documentElement.style.overflow, active: document.activeElement?.textContent }));
      check(!after.open && after.lock === '' && after.active === 'Learn more', `modal ${i} closes via ${how}, scroll unlocked, focus back on trigger`);
    }
  }
  // clicking inside modal content must NOT close it
  await page.locator('.tile .button:not(.button-secondary)').first().click(); await page.waitForTimeout(500);
  await page.click('.modal-headline'); await page.waitForTimeout(400);
  check(await page.evaluate(() => document.querySelector('dialog.modal').open), 'click inside modal content keeps it open');
  const link = await page.locator('dialog.modal a.button').getAttribute('href');
  check(link === 'https://ninpo.com', 'modal link points at entry href ' + link);
  await page.keyboard.press('Escape'); await page.waitForTimeout(400);
  check(errors.length === 0, 'modal: no errors ' + errors.join('|'));
  await ctx.close();
}

// ---------- 5. theme toggle + persistence ----------
{
  const { ctx, page } = await open({ colorScheme: 'light' });
  const bg = () => page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  check((await bg()) === 'rgb(255, 255, 255)', 'light bg white');
  await page.click('.globalnav-actions button[aria-label="Switch to dark mode"]');
  await page.waitForTimeout(1000); // let the crossfade and colour transition finish
  check((await page.evaluate(() => document.documentElement.dataset.theme)) === 'dark' && (await bg()) === 'rgb(0, 0, 0)', 'toggle -> dark');
  await page.reload(); await page.waitForTimeout(300);
  check((await page.evaluate(() => document.documentElement.dataset.theme)) === 'dark', 'dark persists after reload (overrides system light)');
  check((await page.getAttribute(`.globalnav-actions button[aria-label^="Switch to"]`, 'aria-label')) === 'Switch to light mode', 'toggle label updates');
  await page.click(`.globalnav-actions button[aria-label^="Switch to"]`); await page.waitForTimeout(300);
  check((await page.evaluate(() => localStorage.getItem('theme-mode'))) === 'light', 'toggle back -> light stored');
  await ctx.close();
}

// ---------- 6. mobile menu ----------
{
  const { ctx, page, errors } = await open({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const toggle = page.locator('.globalnav-menu-toggle');
  check((await toggle.getAttribute('aria-expanded')) === 'false', 'menu starts closed');
  check(await page.evaluate(() => document.getElementById('globalnav-flyout').hasAttribute('inert')), 'closed flyout is inert (not tabbable)');
  await toggle.click(); await page.waitForTimeout(500);
  const st = await page.evaluate(() => ({ exp: document.querySelector('.globalnav-menu-toggle').getAttribute('aria-expanded'), vis: getComputedStyle(document.querySelector('.globalnav-flyout')).visibility, lock: document.documentElement.style.overflow, links: [...document.querySelectorAll('.globalnav-flyout-link')].filter((a) => { const b = a.getBoundingClientRect(); return document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2)?.closest('a') === a; }).length }));
  check(st.exp === 'true' && st.vis === 'visible' && st.lock === 'hidden' && st.links === 7, `menu opens: ${JSON.stringify(st)}`);
  await page.click('.globalnav-flyout-link[href="#skills"]'); await page.waitForTimeout(1200);
  const after = await page.evaluate(() => ({ exp: document.querySelector('.globalnav-menu-toggle').getAttribute('aria-expanded'), top: Math.round(document.getElementById('skills').getBoundingClientRect().top), lock: document.documentElement.style.overflow }));
  check(after.exp === 'false' && Math.abs(after.top - 88) <= 1 && after.lock === '', `menu link navigates + closes, section lands below nav + chips ${JSON.stringify(after)}`);
  await toggle.click(); await page.waitForTimeout(300); await page.keyboard.press('Escape'); await page.waitForTimeout(300);
  check((await toggle.getAttribute('aria-expanded')) === 'false', 'Escape closes menu');
  await toggle.click(); await page.waitForTimeout(300);
  await page.setViewportSize({ width: 1200, height: 800 }); await page.waitForTimeout(300);
  check((await toggle.getAttribute('aria-expanded')) === 'false' && (await page.evaluate(() => document.documentElement.style.overflow)) === '', 'menu auto-closes when resized to desktop');
  // mobile modal fills screen and closes
  await page.setViewportSize({ width: 390, height: 844 }); await page.waitForTimeout(200);
  await page.locator('.tile .button:not(.button-secondary)').first().click(); await page.waitForTimeout(500);
  const box = await page.locator('dialog.modal').boundingBox();
  check(box.width === 390 && Math.round(box.height) === 844, `mobile modal is full screen ${box.width}x${box.height}`);
  await page.click('.modal-close'); await page.waitForTimeout(400);
  check(!(await page.evaluate(() => document.querySelector('dialog.modal').open)), 'mobile modal closes');
  // tap targets
  const small = await page.evaluate(() => [...document.querySelectorAll('a, button')].filter((el) => el.offsetParent && !el.closest('.footer, .skip-link')).map((el) => [el.className || el.textContent, el.offsetWidth, el.offsetHeight]).filter(([c, w, h]) => (/carousel-dot/.test(c) ? w < 32 : w < 44) || h < 44));
  check(small.length === 0, 'mobile tap targets ≥44px (carousel dots 32×44; footer text links excluded) ' + JSON.stringify(small));
  check(errors.length === 0, 'mobile: no errors ' + errors.join('|'));
  await ctx.close();
}

// ---------- 7. links: every href valid, externals open safely ----------
{
  const { ctx, page } = await open();
  const links = await page.evaluate(() => [...document.querySelectorAll('a')].map((a) => ({ href: a.getAttribute('href'), target: a.target, rel: a.rel, text: a.textContent.trim() || a.getAttribute('aria-label') })));
  const ids = await page.evaluate(() => [...document.querySelectorAll('[id]')].map((e) => e.id));
  for (const l of links) {
    if (l.href.startsWith('#')) check(ids.includes(l.href.slice(1)), `anchor ${l.href} target exists (${l.text})`);
    else if (l.href.startsWith('http')) check(l.target === '_blank' && l.rel.includes('noopener'), `external ${l.href} opens new tab safely`);
    else if (l.href.startsWith('mailto:')) check(l.href === 'mailto:muhammaddabddullah@outlook.com' && !l.target, `mailto ok (${l.text})`);
    else check(l.href === '/resume.pdf' || (l.href === '/' && l.text === 'Muhammad Abdullah'), `internal ${l.href}`);
  }
  // external link click actually opens a popup
  const [popup] = await Promise.all([page.waitForEvent('popup'), page.click('.tile a[href="https://ninpo.com"]')]);
  check(/ninpo\.com/.test(popup.url()) || popup.url().startsWith('chrome-error') /* sandbox has no route to ninpo.com; the tab still opened */, 'external CTA opens new tab: ' + popup.url());
  await popup.close();
  const dupIds = ids.filter((id, i) => ids.indexOf(id) !== i);
  check(dupIds.length === 0, 'no duplicate ids ' + dupIds);
  const heads = await page.evaluate(() => [...document.querySelectorAll('h1,h2,h3')].filter((h) => !h.closest('dialog')).map((h) => +h.tagName[1]));
  check(heads[0] === 1 && heads.filter((h) => h === 1).length === 1 && heads.every((h, i) => i === 0 || h - heads[i - 1] <= 1), 'heading hierarchy: single h1, no skipped levels ' + heads.join(''));
  await ctx.close();
}

// ---------- 8. keyboard ----------
{
  const { ctx, page } = await open();
  check(await page.evaluate(() => document.querySelector('.skip-link').getBoundingClientRect().bottom <= 0), 'skip link off-screen until focused');
  await page.keyboard.press('Tab');
  await page.waitForTimeout(400); // slide-in transition
  const skip = await page.evaluate(() => ({ t: document.activeElement.textContent, top: document.activeElement.getBoundingClientRect().top }));
  check(skip.t === 'Skip to main content' && skip.top >= 0, 'first Tab = visible skip link');
  await page.keyboard.press('Enter'); await page.waitForTimeout(600);
  check(await page.evaluate(() => document.activeElement.id === 'main'), 'skip link moves focus to main');
  // Learn more via keyboard
  await page.locator('.tile .button:not(.button-secondary)').first().focus();
  await page.keyboard.press('Enter'); await page.waitForTimeout(500);
  check(await page.evaluate(() => document.querySelector('dialog.modal').open), 'Learn more works with Enter');
  // focus trap: tab many times, stays inside
  for (let i = 0; i < 6; i++) await page.keyboard.press('Tab');
  check(await page.evaluate(() => document.querySelector('dialog.modal').contains(document.activeElement) || document.activeElement === document.body), 'focus stays in modal');
  await page.keyboard.press('Escape'); await page.waitForTimeout(400);
  const outline = await page.evaluate(() => getComputedStyle(document.activeElement).outlineStyle);
  check(outline === 'solid', 'focused button shows focus ring: ' + outline);
  await ctx.close();
}

// ---------- 9. instant content: nothing faded/hidden right after load ----------
for (const width of [1440, 390]) {
  const { ctx, page } = await open({ viewport: { width, height: 800 } });
  const r = await page.evaluate(() => {
    const els = [...document.querySelectorAll('main *, footer *')];
    const faded = els.filter((el) => el.classList.contains('whoami-caret') ? false : true).filter((el) => {
      let n = el;
      while (n && n !== document.body) { if (parseFloat(getComputedStyle(n).opacity) < 1) return true; n = n.parentElement; }
      return false;
    }).length;
    const transformed = els.filter((el) => { const tr = getComputedStyle(el).transform; return tr !== 'none' && !el.closest('dialog'); }).length;
    const running = document.getAnimations().filter((a) => a.animationName !== 'caret-blink').length;
    return { faded, transformed, running, reveal: document.querySelectorAll('[data-reveal]').length };
  });
  check(r.faded === 0 && r.transformed === 0 && r.running === 0 && r.reveal === 0, `${width}px: all content fully visible immediately on load ${JSON.stringify(r)}`);
  await ctx.close();
}
{
  const { ctx, page } = await open({ reducedMotion: 'reduce' });
  const stats = await page.evaluate(() => [...document.querySelectorAll('.stat-value > span[aria-hidden="true"]:not(.stat-value-ghost)')].map((s) => s.textContent).join(' '));
  check(stats === '100+ 95%+ 20% 100% 37 9 37 18/18', 'reduced motion: counters show final values immediately');
  await ctx.close();
}

// ---------- 9b. WCAG 2.4.11 focus not obscured: tab through every control ----------
for (const width of [1440, 390]) {
  const { ctx, page } = await open({ viewport: { width, height: 800 }, reducedMotion: 'reduce' });
  const total = await page.evaluate(() => [...document.querySelectorAll('a, button')].filter((e) => e.offsetParent || e.closest('.globalnav')).length);
  const hidden = [];
  let seen = 0;
  for (let i = 0; i < total + 5; i++) {
    await page.keyboard.press('Tab');
    await page.waitForTimeout(40);
    const r = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body) return null;
      const b = el.getBoundingClientRect();
      const inNav = !!el.closest('.globalnav, .skip-link');
      const visible = b.bottom > (inNav ? 0 : 44) && b.top < innerHeight;
      return { t: (el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 30), visible };
    });
    if (!r) continue;
    seen++;
    if (!r.visible) hidden.push(r.t);
  }
  check(hidden.length === 0 && seen > 10, `${width}px: every Tab stop visible, not under sticky nav (${seen} stops) ${hidden.join(', ')}`);
  await ctx.close();
}

// ---------- 9c. WCAG 1.4.12 text spacing ----------
for (const width of [1440, 390]) {
  const { ctx, page } = await open({ viewport: { width, height: 800 }, reducedMotion: 'reduce' });
  await page.addStyleTag({ content: '* { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; } p { margin-bottom: 2em !important; }' });
  await page.waitForTimeout(300);
  const r = await page.evaluate(() => ({
    overflowX: document.documentElement.scrollWidth - innerWidth,
    clipped: [...document.querySelectorAll('main *, footer *')].filter((el) => !el.closest('.visually-hidden') && el.children.length === 0 && el.textContent.trim() && (el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1) && getComputedStyle(el).overflow !== 'visible').length,
    btnOverflow: [...document.querySelectorAll('.button')].filter((b) => b.scrollWidth > b.clientWidth + 1).map((b) => b.textContent),
  }));
  check(r.overflowX <= 0 && r.clipped === 0, `${width}px: text spacing override causes no loss (overflowX ${r.overflowX}, clipped ${r.clipped}, buttons ${r.btnOverflow})`);
  await ctx.close();
}

// ---------- 10. axe accessibility, both themes, desktop + mobile ----------
for (const colorScheme of ['light', 'dark']) for (const width of [1440, 390]) {
  const { ctx, page } = await open({ colorScheme, viewport: { width, height: 900 }, reducedMotion: 'reduce', bypassCSP: true /* test-only: lets axe be injected */ });
  await page.addScriptTag({ content: axeSrc });
  const v = await page.evaluate(async () => (await axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa', 'best-practice'] })).violations.map((x) => `${x.id}(${x.nodes.length}): ${x.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(', ')}`));
  check(v.length === 0, `axe ${colorScheme} ${width}: ${v.join(' || ') || 'clean'}`);
  // also with modal open
  await page.locator('.tile .button:not(.button-secondary)').nth(2).click(); await page.waitForTimeout(300);
  const vm = await page.evaluate(async () => (await axe.run(document.querySelector('dialog.modal'), { runOnly: ['wcag2a', 'wcag2aa'] })).violations.map((x) => `${x.id}: ${x.nodes.map((n) => n.target.join(' ')).join(', ')}`));
  check(vm.length === 0, `axe modal ${colorScheme} ${width}: ${vm.join(' || ') || 'clean'}`);
  await ctx.close();
}

// ---------- 10b. security surface ----------
{
  const get = async (u) => { const r = await fetch(BASE.replace(/\/$/, '') + u); return { status: r.status, type: r.headers.get('content-type'), csp: r.headers.get('content-security-policy'), body: await r.text() }; };
  const home = await get('/');
  check(/script-src 'self';/.test(home.csp) && !/script-src[^;]*unsafe-inline/.test(home.csp), 'CSP forbids inline scripts');
  check(!/<script>(?!\s*$)/.test(home.body.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, '')), 'index.html has no inline executable <script>');
  for (const u of ['/.env', '/.git/config', '/package.json', '/src/main.tsx', '/nope']) {
    const r = await get(u);
    check(r.status === 404 && /Page not found/.test(r.body), `${u} -> 404 page (got ${r.status})`);
  }
  const sec = await get('/.well-known/security.txt');
  check(sec.status === 200 && /^Contact: mailto:/m.test(sec.body) && /^Expires: /m.test(sec.body), 'security.txt served with Contact + Expires');
  const { ctx, page, errors } = await open();
  await page.goto(BASE + 'nope'); await page.waitForTimeout(300);
  check(errors.filter((e) => !/404/.test(e)).length === 0 && (await page.title()).startsWith('Page not found'), '404 page renders with no CSP errors ' + errors.join('|'));
  await ctx.close();
}

// ---------- 10c. pre-rendered HTML: content is there before any JavaScript ----------
{
  const r = await fetch(BASE);
  const html = await r.text();
  const has = ['Muhammad Abdullah', 'Security Operations Analyst', 'GitLab Triage Accelerator', 'Certifications and training', 'muhammaddabddullah@outlook.com'].every((s) => html.includes(s));
  check(has && /<div id="root"><a class="skip-link"/.test(html), 'page content is in the HTML itself (pre-rendered)');
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto(BASE); await page.waitForTimeout(300);
  const nojs = await page.evaluate(() => ({ h1: document.querySelector('h1')?.textContent, tiles: document.querySelectorAll('.tile').length, styled: getComputedStyle(document.querySelector('.globalnav')).position }));
  check(nojs.h1 === 'Muhammad Abdullah' && nojs.tiles === 3 && nojs.styled === 'sticky', 'with JavaScript off the page still renders, styled ' + JSON.stringify(nojs));
  await ctx.close();
}
for (const colorScheme of ['light', 'dark']) {
  const { ctx, page, errors } = await open({ colorScheme });
  await page.waitForTimeout(600);
  const r = await page.evaluate(() => ({ theme: document.documentElement.dataset.theme, icon: document.querySelector('.theme-icon').dataset.mode, label: document.querySelector('.globalnav-actions button[aria-label^="Switch to"]').getAttribute('aria-label'), iconAnims: [...document.querySelectorAll('.theme-icon *')].flatMap((e) => e.getAnimations()).length }));
  const want = colorScheme === 'dark' ? ['dark', 'Switch to light mode'] : ['light', 'Switch to dark mode'];
  check(r.theme === want[0] && r.icon === want[0] && r.label === want[1] && r.iconAnims === 0 && errors.length === 0, `${colorScheme}: hydration matches the theme with no icon animation or errors ` + JSON.stringify(r) + errors.join('|'));
  await ctx.close();
}

// ---------- 11. print route unaffected ----------
{
  const { ctx, page, errors } = await open();
  await page.goto(BASE + '?print'); await page.waitForTimeout(500);
  const r = await page.evaluate(() => ({ nav: !!document.querySelector('.globalnav'), siteCss: document.querySelectorAll('link[rel=stylesheet]').length > 0 || [...document.querySelectorAll('style')].some((s) => s.textContent.includes('.globalnav')), text: document.body.innerText.slice(0, 40), font: getComputedStyle(document.querySelector('h1')).fontFamily, fontsOk: [...document.fonts].some((f) => f.family.includes('Inter') && f.status === 'loaded') }));
  check(!r.nav && !r.siteCss && /muhammad/i.test(r.text) && r.fontsOk, 'print route renders standalone, without site CSS, with its own Inter font ' + JSON.stringify(r));
  check(errors.length === 0, 'print: no errors ' + errors.join('|'));
  await ctx.close();
}

await browser.close();
const fails = results.filter((r) => r.startsWith('FAIL'));
console.log(results.filter((r) => !r.startsWith('ok')).join('\n'));
console.log(`\n${results.length - fails.length}/${results.length} passed`);
fs.writeFileSync('qa-results.txt', results.join('\n'));
