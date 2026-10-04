# Design system

Modelled on apple.com. Values (type scale, colours, nav metrics, button geometry, breakpoints) were taken from apple.com's own stylesheets so the rhythm matches. The full stylesheet is `src/styles/site.css` (copy in `assets/reference/src/styles/site.css`).

## Contents
1. Principles
2. Tokens (light and dark)
3. Typography
4. Layout and breakpoints
5. Components
6. Theming mechanics
7. CV (print) and OG image

## 1. Principles

- Lots of whitespace, one column of content at 980px max, big confident headlines, quiet grey cards on white (or near-black cards on black).
- Every colour comes from a token. Light and dark must look like the same design, just inverted. The user specifically asked for a "uniform design" across themes.
- Every component exists in one size. Don't create variants unless there's a real need.

## 2. Tokens

| Token | Light | Dark | Use |
|---|---|---|---|
| `--bg` | #ffffff | #000000 | page |
| `--bg-alt` | #f5f5f7 | #161617 | cards, tiles |
| `--text` | #1d1d1f | #f5f5f7 | primary text |
| `--text-2` | #6e6e73 | #a1a1a6 | secondary text |
| `--text-3` | #86868b | #86868b | tertiary (large text only) |
| `--link` | #0066cc | #2997ff | links |
| `--divider` | #d2d2d7 | #424245 | rules |
| `--fill-quiet` | #e8e8ed | #333336 | quiet fills |
| `--accent-note` | #b64400 | #ff8a3d | small notes ("In progress") |
| `--btn-bg` | #0071e3 | #f5f5f7 | filled button |
| `--btn-bg-hover` | #0068d6 | #ffffff | hover (#0068d6 because #0077ed failed AA) |
| `--btn-bg-active` | #005bb8 | #e8e8ed | pressed |
| `--btn-text` | #ffffff | #1d1d1f | button text |
| `--btn-glow` | rgba(0,113,227,.28) | rgba(245,245,247,.28) | hover/focus ring |
| `--btn-outline` | #0066cc | #f5f5f7 | secondary button |
| `--focus`, `--accent` | #0071e3 | #2997ff | focus outline, accents |
| `--progress` | #0071e3 | #f5f5f7 | back-to-top ring (follows the button colour) |
| `--nav-bg` | rgba(250,250,252,.8) | rgba(22,22,23,.8) | translucent nav |
| `--nav-bg-solid` | #fafafc | #161617 | theme-color meta, menu |
| `--nav-link` | rgba(0,0,0,.8) | rgba(255,255,255,.8) | nav links |
| `--spotlight` | rgba(0,113,227,.08) | rgba(41,151,255,.12) | card glow |
| `--panel-bg` | #ffffff | #1d1d1f | palette, sheets |
| `--overlay` | rgba(0,0,0,.48) | rgba(0,0,0,.64) | modal backdrop |
| `--card-shadow` | rgba(0,0,0,.08) | rgba(0,0,0,.5) | card hover lift |

In dark mode the filled button inverts to a light pill with dark text. White text on the brighter dark-mode blue fails AA, and the user wanted buttons "different colored for light and dark themes".

Other tokens: `--ease: cubic-bezier(.28,.11,.32,1)`, `--ease-nav: cubic-bezier(.4,0,.6,1)`, `--ease-fade: cubic-bezier(.25,.1,.25,1)`, `--theme-fade: .8s`, `--nav-height: 44px`, `--content-width: 980px`, `--gutter: 22px` (6.25vw at small widths, Apple's phone gutter), `--radius-card: 18px`.

`prefers-contrast: more` promotes `--text-2` to `--text`. `forced-colors` gives fill-only surfaces real borders.

## 3. Typography

- Fonts: the system stack (SF Pro) on Apple devices; self-hosted **Inter Variable** (`@fontsource-variable/inter`) elsewhere, with an `Inter Fallback` @font-face (Arial with Inter's metric overrides: ascent 90.49%, descent 22.56%, size-adjust 107.06%) so nothing shifts when Inter loads. The pre-render step preloads the Latin Inter woff2.
- Display font for headlines (`--font-display`), text font for body (`--font-text`).

| Element | Large | Medium | Small (≤734) |
|---|---|---|---|
| Hero headline (name) | 56px / 600 | 48px | 32px |
| Hero subhead (title) | 28px | 24px | 19px |
| Hero tagline | 19px | 19px | 17px |
| Section headline | 48px / 600 | 40px | 32px |
| Section intro | 21px | 21px | 17px |
| About copy | 28px, `--text-2` → lit `--text` | 24px | 19px |
| Card title | 28px / 600 | 28px | 24px |
| Body / tile description | 17px | 17px | 17px |
| Stat value | 40px / 600 | | |
| Stat label, tech line | 14px | | |
| Nav links | 12px | | |
| Modal headline | 40px | 40px | 32px |

Headlines use `text-wrap: balance`; paragraphs `text-wrap: pretty`. Letter-spacing follows Apple's per-size values (see site.css).

## 4. Layout and breakpoints

- Breakpoints: small ≤734px, medium 735–1068px, large ≥1069px. The nav collapses into a full-screen menu at ≤833px.
- `.viewport-content`: max 980px plus gutters, centred.
- Sections: 96px vertical padding (64px on phones). Hero: 72px top, 80px bottom.
- `.card-grid`: 2 columns, 20px gap; 1 column on phones. An odd last card spans the full row, so prefer even counts (4 case studies, not 3 or 5).
- No horizontal scroll at any width from 320px to 1920px (the QA suite checks 15 widths in both themes).
- Scroll offset for anchors: `scroll-padding-top` on `html` only (doubled on phones to clear the section chips). Never add `scroll-margin` as well; together they gave an 88px double offset.

## 5. Components

**Global nav.** 44px, sticky, translucent `--nav-bg` with `saturate(180%) blur(20px)`. The blur sits on `::before`, not the nav itself, because `backdrop-filter` on the nav creates a containing block that clipped the fixed mobile menu. Name on the left (scrolls to top, no `#top` in the URL), section links, then actions: ⌘K hint, theme toggle (sun/moon morph), CV download. Current section gets full-strength text plus a gliding 2px underline. ≤833px: hamburger opens a full-screen menu with a dot on the current section.

**Phone section chips.** Sticky horizontal chip bar under the nav on phones. Its edge is an inset shadow, not a border (a border ate a pixel and misaligned the row).

**Hero.** 144px round photo (EXIF-stripped, 384px source; falls back to "MA" initials), name, title · location, one-line tagline, two equal-width buttons (Download CV, Contact).

**About.** `$ whoami` terminal line (`muhammad abdullah · soc analyst · islamabad, pk`, with a blinking caret, no blink under reduced motion), then paragraphs that light up word by word as you read.

**Experience tiles.** Eyebrow period, title, company link, meta (location · remote), description, up to 4 stats (count-up numbers), "Learn more" opens the details modal with labelled sections.

**Case studies / Projects.** `.card.project-card`: eyebrow kind, title, summary, (points list for projects), tech/tools line in `--text-2` 14px, buttons pinned to the card's bottom so a row lines up. Projects become a swipeable snap carousel with page dots on phones; case studies stack.

**Buttons.** `.button`: pill (980px radius), 44px tall, `min-width: 188px`, 0 21px padding, 17px text, exactly one leading lucide icon at 17px / stroke 2. `.button-secondary` is an outline that fills in on hover. `.button-group` is an inline grid of equal-width columns. Hover: brighten plus `0 0 0 4px var(--btn-glow), 0 6px 18px var(--btn-glow)` plus 1px lift. Active: scale .98. The icon pops (scale 1.18) on hover. Icons in use: ArrowDownToLine (CV), Mail (contact), BookOpen (write-ups), Github, ArrowUpRight / ExternalLink (sites), Linkedin. Button text must start with the visible label (WCAG 2.5.3); extra context goes in a `.visually-hidden` span after it (": Project name, opens in a new tab").

**Details modal.** Native `<dialog>`, max 816px wide, 18px radius, 72px/76px padding, 36px round close button, headline 40px, sections divided by hairlines. On phones (≤734px) it's a bottom sheet with a grab handle and swipe-to-dismiss (110px drag or a 0.6px/ms flick). Page scroll is locked while open; focus returns to the opener on close.

**Certifications.** One card with rows: name, "issuer · kind", optional `--accent-note` note on the right.

**Contact.** Cards for Email, LinkedIn, GitHub with icon, label and value + arrow; then a Download CV button.

**Back to top.** Appears after scrolling; round button with an SVG ring showing reading progress in `--progress`. On desktop and phone.

**Command palette (⌘K / Ctrl+K).** Jump to any section, download the CV, copy email (toast confirms), open LinkedIn/GitHub, switch theme. Listbox with arrow keys and `aria-activedescendant`.

**Toast.** Small pill at the bottom in an `aria-live` region.

**Footer.** Directory columns (same sections) and a legal line, 12px.

## 6. Theming mechanics

- `<html data-theme="light|dark">` drives the tokens. `public/theme-init.js` (loaded as a file, not inline, so CSP can ban inline scripts) sets it and the background before first paint from `localStorage['theme-mode']` or `prefers-color-scheme`, and updates `meta[name=theme-color]` (#fafafc / #161617).
- `useThemeMode` follows the OS until the user toggles; the choice is stored and wins after that. First render is always 'light' to match the pre-rendered HTML, then a layout effect reads the real value before paint (no flash, no hydration mismatch).
- Switching crossfades (see motion.md).

## 7. CV (print) and OG image

**CV.** `/?print` renders `PrintResume.tsx` from the same data, so site and CV never disagree. One column, standard headings (Summary, Work Experience, Projects, Skills, Certifications and Training) so applicant tracking systems parse it in order. Letter size, has its own `PRINT_CSS` with embedded Inter and `@page` rules. It must stay **one page**. Generate with `scripts/qa/makepdf.mjs` (Playwright `page.pdf` plus pdf-lib metadata: title "Muhammad Abdullah CV", author, subject "Security Operations Analyst CV", keywords) and copy to `public/resume.pdf`. Download filename: `Muhammad-Abdullah-CV.pdf`. Check the text with `pdftext.mjs` (no em dashes, no phone, no education).

**OG image.** 1200×630, `scripts/qa/og.mjs`: #f5f5f7 background, white 36px-radius card, 208px round photo, name 62px/600, "Title · Islamabad, PK" 32px, tagline 24px `#6e6e73`, URL bottom-left in #0066cc, tool chips bottom-right. After regenerating, bump `og.png?v=N` in all three places in `index.html` so LinkedIn and others re-fetch.
