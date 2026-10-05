# Writing for this design

The design looks authoritative, so the words have to be true and sound human.

## Honesty
- Only publish facts the site owner gave you or that come from their own material. If a number, date, quote or claim is missing, leave it out or ask. Never fill a gap with something plausible.
- Keep claims at the strength the source supports ("helped", "supported", "about").
- Count-up stats must restate a figure already in that card's text.
- Testimonials, logos and "trusted by" rows only with real, permitted sources.
- Sample content in the template (Fieldnote) is placeholder. Replace all of it before launch; the QA suite does not know which text is real.

## Voice
- No em dashes anywhere (copy, meta tags, alt text, commit messages). Use commas, colons or full stops; ranges use "to". The QA suite fails on any em dash.
- No AI-sounding filler: passionate, leverage, seamless, robust, delve, cutting-edge, synergy, "in today's fast-paced world", "unlock", "elevate".
- Short sentences and concrete nouns. Real product and tool names. Say what something does, not how amazing it is.
- Headline: what it is, in a few words. Subhead: who it is for or the main benefit. Tagline: one or two sentences, concrete.
- Bold (`**text**`) only for the one or two numbers or phrases a skimmer should catch.
- Button labels: verb first, two or three words, fitting 188px ("Get started", "Read the docs", "Download CV").
- Pick American or British spelling and stay consistent.

## Hierarchy
- One idea per section, headline first. If a section needs more than a short intro and cards, the detail belongs in the modal.
- Prefer even card counts in two-column grids, or set `columns: 3` for three.
