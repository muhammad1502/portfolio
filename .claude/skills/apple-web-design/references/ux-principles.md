# UX principles (growth.design)

The owner of the original site pointed to [growth.design](https://growth.design/psychology) as a reference. It is a library of UX psychology principles, not an accessibility standard: accessibility comes from WCAG 2.2 AA (`accessibility.md`), and growth.design shapes layout and interaction. Names and one-line definitions below are quoted from its principles page (checked October 2026).

## Applied in this design system

These five were applied to the original site, and the template is built around them:

| Principle (growth.design) | Definition | How this design applies it |
|---|---|---|
| **Hick's Law** | "More options leads to harder decisions" | One clear primary (filled) button per area; at most one secondary next to it. Seven nav sections or fewer. |
| **Progressive Disclosure** | "Users are less overwhelmed if they're exposed to complex features later" | Cards stay short; full detail lives behind "Learn more" / "Read more" in the details modal or bottom sheet. |
| **Chunking** | "People remember grouped information better" | One idea per section, short cards, 2 to 4 stats per tile, labelled sections inside the modal. |
| **Fitts's Law** | "Large and close elements are easier to interact with" | 44px buttons, 24px minimum targets, back-to-top in the thumb corner, bottom sheets and swipe-to-dismiss on phones. |
| **Anchoring Bias** and **Peak-End Rule** | "Users rely heavily on the first piece of information they see"; "People judge an experience by its peak and how it ends" | The most important thing comes first (hero, then the strongest section) and the page ends on a clear next step (contact cards and a call to action). |

## Also built in

| Principle | How |
|---|---|
| **Cognitive Load** ("Total amount of mental effort that is required to complete a task") | 980px column, generous whitespace, one type scale, one button style. |
| **Occam's Razor** ("Simple solutions are often better than the more complex ones") | One size per component; no variants without a real need. |
| **Familiarity Bias** / **Mental Model** ("People prefer familiar experiences"; "Users have a preconceived opinion of how things work") | Apple's own patterns: translucent nav, section chips like product pages, ⌘K like Spotlight, iOS-style bottom sheet. |
| **Discoverability** ("The ease with which users can discover your features") | The ⌘K hint is visible in the nav; phone chips show every section at a glance. |
| **Default Bias** ("Users tend not to change an established behavior") | The theme follows the system until the visitor chooses; the choice is then remembered. |
| **Delighters** ("People remember more unexpected and playful pleasures") | Sun-to-moon morph, card tilt and glow, tap ripple, count-up replay on hover, haptic ticks, the terminal line. Always on top of content, never hiding it. |
| **Banner Blindness** / **Reactance** ("Users tune out the stuff they get repeatedly exposed to"; "Users are less likely to adopt a behavior when they feel forced") | No pop-ups, banners, autoplay or interstitials. |
| **Provide Exit Points** ("Invite users to leave your app at the right moment") | Clear contact and outbound links at the end of the page and in ⌘K. |

## Use with care

Persuasion principles (Social Proof, Scarcity, Decoy Effect, Nudge, Framing, Loss Aversion) only with true information: real testimonials with permission, real limits, real prices. Never invent urgency or proof. See `writing.md`.

When adding a new section or feature, name the principle it serves. If it serves none, or works against Hick's Law or Cognitive Load, leave it out.
