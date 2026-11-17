# Taste brief — wcgw.fun home

## Framing

"Your team can ship anything now. Congratulations. What could go wrong?"
Lede: “Infinite output. An abdication of agency.” Cake CTA + mishaps. Act Two is quiet copy + binned/kept piles — no mole/squash game.
WCGW sells the informed no: design and product judgment, by the month.

## References

- Paper: "WCGW design directions" (artboards "01 Reference — Paper" and
  "02 Reference — Night"). Copy comes from the Paper (light) artboard.
  https://app.paper.design/file/01M6E5ZVKHBAYCRZD9CJZD8QHJ/p-1-0
- https://maxmarele.com/: one serif at one size, muted labels in a left
  column, hand-drawn hover underlines, playful details hidden in the prose.

## The idea

The page is a manuscript. WCGW is the editor holding a blue pencil
("to blue-pencil" means to cut). The printed text is ink; everything WCGW
*does* to it (cuts, underlines, ticks) is drawn by hand in the one
accent color, `--pencil`.

## The logo is Radu

The masthead is Radu's engraved portrait, not a mark: this is his primary site.
It is two alpha masks (`public/img/portrait*.webp`, made from the v8 avatar's
`offwhite-black` and `black-offwhite` renders) painted with `--ink`, so it takes
every palette's color: by day the lines are ink, by night the lit face is ink.
It is the theme button. Hover puts on shades (going dark, or bracing for the
light); the classified theme redacts the eyes.

## Things go wrong

AI-built things are held together with chewing gum, so the page breaks, a lot,
and starts early so readers begin hunting for it. Each is a different failure:

- Hero: the writer opens with "Great question! " and deletes it (sycophancy);
  "wrong?" then collapses letter by letter (structural).
- Act one: "golden age." is written, then corrected to "aftermath." (hype);
  the writer loops on a line, runs out of tokens mid-word, and stalls (generation).
- Act two: "a YES?" is corrected to "a NO?" (agents default to yes). No
  squash/mole stage — static binned and kept lists only.
- Act three: the "Taste Files" row (not built yet) comes loose and hangs crooked.
- Act four: "Optimist with backups." tips off its row and lands on the paragraph
  below, where it stays (the backups never come);
  the name renders mis-encoded as "CeucÄƒ" (encoding).
- Last divider: the logo's × eye comes loose and tumbles away.
- Tab title: switch away and it reads "Something went wrong".

Mistakes the writer makes while writing are `[data-draft]` spans (`src/home/stream.ts`).
The closing line never breaks: it is the promise. Every lasting mishap follows the
same rule: click to patch it (it rewinds, like undo), it holds for a moment, then
breaks again. Motion comes from `src/home/physics.ts` (gravity, impacts, bounces),
never from hand-tuned easing. A new mishap must be a different kind of failure
from the ones above.

## Rules

- One typeface: EB Garamond. Hierarchy comes from size, ink vs soft color, and
  space. Never a second family. (The hidden easter-egg themes are exempt.)
- One accent: `--pencil`. Only hand-drawn marks and focus rings use it.
- Interactions have to land a joke or help reading: the page streaming in like an
  agent's reply as you reach it (token streaming, `src/home/stream.ts`), mishaps,
  the live Bucharest clock, the + × dividers that blink.
  Respect `prefers-reduced-motion`. Do not bring back the Act Two mole/squash game.
- Light and dark come from the Paper and Night palettes. Tokens live at the
  top of `styles.css`.

## Hard no's

- Anything that feels like a SaaS template: no hero buttons, cards, gradients,
  badges, or icon grids.
- A second typeface.
