# Accessibility (WCAG 2.2 AA)

Target: WCAG 2.2 AA everywhere, axe-core zero violations in both themes, and the growth.design-style UX basics (clear hierarchy, obvious affordances, no surprises).

## Checklist for anything new

- **Contrast:** text ≥4.5:1, large text and UI parts ≥3:1, in **both** themes, including hover and pressed states. Check new colours against `--bg` and `--bg-alt`. `--text-3` (#86868b) is for large text only.
- **Focus:** `:focus-visible` gives a 2px `--focus` outline at 2px offset; buttons add the glow ring. Never remove an outline without a replacement. Focus must not be hidden behind the sticky nav (WCAG 2.4.11), which `scroll-padding-top` handles.
- **Targets:** at least 24×24 (2.5.8); buttons are 44px tall, icon buttons 44×44.
- **Names:** every control has an accessible name. Icon-only buttons get `aria-label`; decorative icons `aria-hidden="true"`. A visible label must start the accessible name (2.5.3), so put context in a trailing `.visually-hidden` span (": GitLab Triage Accelerator, opens in a new tab").
- **New tabs:** external links say "opens in a new tab" (visually hidden) and use `rel="noopener noreferrer"`.
- **Dialogs:** native `<dialog>` with `showModal()` (free focus trap and Escape). `aria-labelledby` the headline. Return focus to the opener on close. Lock page scroll while open. Buttons that open one get `aria-haspopup="dialog"`.
- **Listbox (⌘K):** `role="combobox"` input with `aria-expanded`, `aria-controls`, `aria-activedescendant`; `role="listbox"` / `role="option"` with `aria-selected`.
- **Live updates:** toasts in a `role="status" aria-live="polite"` region.
- **Landmarks and headings:** skip link to `#main` (focusable `tabIndex={-1}`), one `h1` (the name), `h2` per section with `aria-labelledby`, `h3` per card. `nav aria-label="Global"`.
- **Current location:** nav links get `aria-current="location"`; carousel dots `aria-current="true"` with labels like "Show VT Extension (2 of 3)".
- **Hidden things are really hidden:** the back-to-top button and closed menus are `inert` / not focusable while invisible.
- **Animated numbers:** screen readers get the final value from a visually-hidden copy; the animating digits are `aria-hidden`.
- **Motion:** respect `prefers-reduced-motion` (see motion.md). No flashing; the caret blink is off under reduced motion.
- **Contrast preferences:** `prefers-contrast: more` and `forced-colors` are handled in site.css; keep new surfaces working there (fills need borders in forced colours).
- **Language and zoom:** `<html lang="en">`, nothing breaks at 200% zoom or 320px width, no horizontal scroll.
- **Print/PDF versions:** real text (not an image), logical reading order, document title and metadata set.

## Traps found in testing

- `#0077ed` (Apple's hover blue) under white text failed AA; hover is `#0068d6`.
- White text on the dark-mode blue failed; dark-mode buttons invert to a light pill with dark text.
- A chip bar border ate a pixel and misaligned the row; use an inset shadow for hairlines inside scroll containers.
- Locator clicks on sticky or scroll-snapped elements make Playwright scroll the page; tap by coordinates in tests.
