# The producer: motion brief

For Claude Code (in T3 Code or anywhere) picking up `/stories/the-producer`. Read this, then
`src/pages/stories/the-producer.astro` and `src/scripts/the-producer.ts`. Short link: `/the-producer`.

## The idea, so every new effect serves it

The page is a record sleeve. The model is the talent, the reader is the producer. Every interaction
should let the reader *produce*: press, drag, push, pick. Not watch a show. If an effect only moves
things around, cut it. If it hands the reader a control and makes a point with it, keep it.

## Look (do not drift)

- Background `#2C4BD4` (the AGAIN blue), paper grain over everything (`.sleeve::after`, animated in steps).
- Type: EB Garamond for words, Instrument Sans for numbers and labels (`.num`, `.side`, `.kicker`).
- Paper white `#FAFAFA` for ink, `rgb(250 250 250 / .72)` for soft, `/ .24` for hairlines.
- The pencil is paper white on this page. Marks come from `home.css`: `--mark-line-1`, `--mark-strike`, `--mark-strike-2`.
- Pictures are cut off their paper (transparent webp with their own soft shadow) and lie straight on the blue.
  Blue plastic on the blue background is intentional. Do not add frames, cards or plates.
- No glows. No coloured shadows. No gradients except the fader caps. No emoji. No em dashes in copy.

## How motion works now

One `requestAnimationFrame` loop in `the-producer.ts`:

1. **Scroll progress.** Every `[data-p]` element near the screen gets two CSS variables:
   `--p` (0 → 1 while it passes through the viewport) and `--e` (0 → 1 while it enters, done at 62% of the viewport).
   CSS does the rest with `calc()`. Add motion by adding `data-p` and writing CSS against `var(--e, 1)`.
   Default to `1` so nothing is stuck half-way without JS.
2. **Records.** All `[data-record]` images share one angle: idle spin + scroll velocity + the hand (pointer scratch).
3. **Now playing bar.** `[data-track]` sections drive the current track; progress and reading time
   (words ÷ 230 a minute, shown on hover) come from scroll.

One-shot moments: add `data-in`; the element gets `.is-in` and an `in` event when 45% visible.

## What is live

| Where | What the reader can do / sees |
| --- | --- |
| Hero | Drag the record to scratch it. Title rises in three beats; pencil underlines "producer." |
| Bar | Now playing, track, progress line, reading time, Sound on/off (off by default). |
| A1 | "the same." arrives as three offset takes that slide into one. Cassette slides in like a tape into a deck. |
| A2 | Mic comes down on its rod, swings when it lands and when touched; waves come off the grille. |
| A3 | AGAIN is a real button (and the A key). Each press is a take, with a producer note; take 6 is "That one." |
| A4 | Objections arrive in order. |
| Side B | "Side A" flips over into "Side B" (rotateX, scroll-linked). |
| B1 | Studio opens up. FIITMC counts up to 4.7; the ® stamps in. |
| B2 | A playable desk under Fig. 5. It motor-recalls the mix on entry. Push a fader to the top: it shakes, "Louder was never the point.", and slides back. All up: "Everything is loud. So nothing is." Keyboard works (arrows, Page Up/Down, Home/End). |
| B3 | Notes light up line by line as you read. The four mic takes develop like prints. Before/after slider sweeps once. 18 renders arrive in order; the 12 demos get struck and fade. |
| Sincere line | Lights up word by word. |
| B4 | Pencil rings "before" and "after". |
| Outro | The record scales in and turns; YOU ARE THE PRODUCER drops in letter by letter. |
| PS | Hover "eleven": it goes loud, then gets struck through. |
| Console | `Again.` |

Sound (Web Audio, nothing downloaded): scratch follows the hand, AGAIN click, fader ticks, a thump,
quiet crackle. Only after the reader turns it on.

## Rules for anything new

- `prefers-reduced-motion: reduce`: no scroll-linked motion, no idle spin, no auto sweeps.
  Every control still works. Wrap motion CSS in `@media (prefers-reduced-motion: no-preference)`.
- Transform and opacity only in scroll-linked CSS. Use `filter` sparingly (the four takes use blur).
- Every control works by keyboard and has a label. Decorative layers are `aria-hidden`.
- No new dependencies unless they pay for themselves (GSAP is allowed if it replaces code, not adds features).
- No horizontal scroll at any width. `.sleeve` has `overflow-x: clip`; keep it.
- Numbers keep their source on hover (`.fact` with a `title`) and in the liner notes.
- Test: `npm run build`, then walk the page at 390 and 1440 wide, with and without reduced motion.

## Ideas not built yet (pick, don't pile on)

1. **Talkback.** Hold the AGAIN button: the page "talks back" (a line of the rant played by a speech
   synth, or a short ducked tone) while the background dims like a control room.
2. **Cue the tape.** Scroll speed over Fig. 1 spins two reel overlays placed on the cassette window
   (needs reel cut-outs from `public/stories/the-producer/fig-1-demo.webp`).
3. **Record the reader.** Count the reader's own takes across the page (AGAIN presses, fader moves,
   scratches) and print them in the liner notes as "Produced by you: 7 takes, 3 faders, 1 scratch".
4. **VU meter in the bar.** A needle that follows scroll velocity. Pins at the red line if you fling the page.
   ("Louder was never the point" applies to scrolling too.)
5. **Side B with a needle drop.** On entering Side B, a tonearm swings in from the right edge and sets
   down on the outro record.
6. **Fader recall on resize.** Re-run the motorised recall when the desk re-enters the viewport.
7. **Share your mix.** Encode the desk's eight values in the URL hash so a reader can send their mix.

## Files

- `src/pages/stories/the-producer.astro`: markup, copy, CSS (motion CSS sits with each section).
- `src/scripts/the-producer.ts`: the loop, records, bar, sound, AGAIN, desk, counters, slider sweep.
- `public/stories/the-producer/`: cut-outs (`fig-*`, `mic-take-*`, `again-*`, `record-cut`), `takes/` (all 18 renders in order), `og.png`.
- The renders' sources and the scripts that cut them: `~/development/Claude outputs/producer-visuals/`.
