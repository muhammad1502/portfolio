# Motion

The brief: fun but professional, and playful on phones as well as desktop. The hard rule: **content must never be hidden waiting for an animation.** A scroll-reveal fade was tried and removed because the page "didn't load everything instantly"; visitors read a hidden-then-revealed page as slow.

## Rules

- Animate only `transform` / individual `translate` and `scale`, `opacity`, colours and backgrounds. No layout properties.
- Motion is driven by **scroll position** or **interaction**, never by a timer on load.
- Everything moving is off under `prefers-reduced-motion: reduce` (the global block in site.css sets durations to 0.01ms and removes hover transforms). **Exception:** colour-only fades (theme crossfade, text-section word lighting) stay on, because a fade has no movement and people with reduced motion on still expect to see the theme change smoothly.
- Desktop-only effects check `(hover: hover) and (pointer: fine)`; touch effects check `pointerType` or `(hover: none)`.
- One delegated listener per effect for the whole page, throttled with `requestAnimationFrame`.
- Everything must survive pre-rendering and hydration: start in the final state, change only after mount.

## Inventory

| Effect | Where | How | Reduced motion |
|---|---|---|---|
| Theme crossfade | toggle, ⌘K | `document.startViewTransition` (0.8s, `--ease-fade`), fallback `.theme-fading` class that transitions every colour for 800ms | Stays (colour only) |
| Sun → moon icon | theme toggle | SVG with core, rays and mask-cut groups keyed off `html[data-theme]`: rays rotate 90° and fade, core scales 1.7, the cut circle slides in to make a crescent | Icon still swaps, no spin/scale |
| Settle | `[data-settle]` (cards, headlines) | `--settle` 0..1 over the bottom 30% of the viewport; `translate: 0 (1-s)*32px; scale: .96 + s*.04` | Off (full size, in place) |
| Hero recede | `.hero-content` (`data-recede`) | `--recede` 0..1 as you scroll past: drifts 48px, scales to .92, dims to .45 opacity | Off |
| Text section word lighting | `[data-words]` paragraphs split into `[data-word]` spans | Words above a reading line at 62% of viewport height get `.is-lit` (`--text-2` → `--text`). Transition is enabled only after the first frame (`.scroll-fx-ready`) so the page starts in the right state | Stays (colour only) |
| Nav current-section underline | nav | 2px bar positioned under the active link (`useActiveSection` scrollspy), transitions transform/width .45s | Jumps |
| Count-up stats | tile stats | `CountUp`: renders the final value (pre-render), resets to 0 in a layout effect before paint, counts up over 1.4s (easeOutCubic) when 60% visible. Ghost copy reserves width; visually-hidden copy is what screen readers get. Hover replays it on desktop | Shows final value |
| Card spotlight + tilt | `.card`, `.contact-card` | Pointer position into `--mx/--my`, radial glow in `--spotlight`; tilt up to 2° (less on wide cards: `min(2, 600/width)`), 3px lift and shadow | Glow stays, no tilt/lift |
| Tap ripple | touch on cards | `.is-tapped` runs `tap-glow`: animates the registered `@property --glow` from 40px to 560px | Off |
| Press-in | touch | `:active` scale .985 | Off |
| Button hover | all buttons | glow ring + 1px lift + icon pop (scale 1.18) | No lift/pop |
| Hero photo hover | desktop | scale 1.04 with a ring in `--accent` | Off |
| Modal / bottom sheet | details | fades up 24px from 98% scale on desktop; slide-up sheet on phones with swipe-to-dismiss (drag 110px or flick .6px/ms) | Instant |
| Cards carousel | phones (`carousel: true`) | CSS scroll-snap track; active dot stretches into a pill; dots scroll to a card | Instant scroll |
| Back to top | after 80% of a viewport | progress ring (stroke-dashoffset), fades in; `inert` while hidden | No movement |
| Command palette | ⌘K / Ctrl+K | `palette-in` keyframe | Instant |
| Toast | copy email etc. | slide/fade in, auto hide | Instant |
| Haptics | Android | `navigator.vibrate(8)` on coarse pointers: carousel dots, sheet dismiss, phone menu toggle and links, back to top. iOS has no Vibration API, silently skipped | n/a |
| Terminal caret | text sections | blinking block caret | Static (blink is a flicker risk) |
| Download icon nudge | nav download action | `nudge-down` 3px | Off |

## Bugs already hit (don't repeat)

- **Tilt/settle conflict:** use the individual `translate` / `scale` properties for scroll effects so they stack with `transform` used by hover tilt.
- **Ripple position on scaled cards:** cards may be mid-settle (scaled). Convert pointer coordinates to unscaled card space: multiply by `offsetWidth / rect.width`.
- **Words animating on load:** enable the colour transition one frame after mount, or the page visibly fades into its initial state.
- **Theme fade "didn't fade" on a laptop:** that machine had reduced motion on and the fade had been disabled there. A crossfade has no movement, so it now always runs.
- **Ring colour in dark mode:** the progress ring follows `--progress` (the button colour), not the blue accent, so it matches the light pill in dark mode.
- **Progress bar under the nav** looked like a double underline next to the current-section indicator. Removed; reading progress lives in the back-to-top ring.
- **Hydration:** any value that differs between server and client (theme, count-up start, `navigator.platform` for ⌘ vs Ctrl, `fetchPriority`) must render the server value first and change in `useIsomorphicLayoutEffect`.
- **`backdrop-filter` on the nav** made it a containing block and clipped the fixed mobile menu. The blur moved to `::before`.
