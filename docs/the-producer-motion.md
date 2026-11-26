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
| Hero | Tap the record (or Enter) to start the track; drag it to scratch (or focus it: arrows scratch, Space holds it). Title rises in three beats; pencil underlines "producer." |
| Bar | Now playing, track, progress line, reading time, Play/Stop for the page's track (see `docs/the-producer-music.md`). Shows her line instead of the title when it fits whole. |
| A1 | "the same." arrives as three offset takes that slide into one. Fig. 1 is six cassettes in a row, one per lab (ChatGPT, Claude, Gemini, Grok, Pi, Le Chat), each a refine of one render with its own blue (`tapes/<id>.webp`, cut by `tapes.py`). They run in an endless row the whole window wide (three copies; the row jumps a set, unseen, near either end), the one in front bigger, the others shrinking and fading with distance. Swipe, drag or arrow keys turn it; tap a side tape to bring it in front. The one in front sings the record (`track.setVoice`); tap it to play its demo off tape, its hubs turning. |
| A2 | Wide screens (80rem+, motion on): the mic hangs from the top of the window in the right margin, drops in as A2 arrives, stays while A2 is on screen, then goes up with the page (`writeMic`, `--drop`/`--lift`). Narrow or reduced motion: it comes down out of the top edge of its own frame, never over the text. Swings when it lands and when hovered; waves come off the grille. Touch it (or Enter/Space) and she records the next line: a two-click count-in, then the line, dry and close (`Booth.take()`); the caption shows "Take 3. “Unlock your potential”" while she sings. One voice at a time: a take cuts the tape, the tape cuts a take. |
| A3 | AGAIN is a real button (and the A key). It fires on the hit, like a pad: the cap goes down in three frames (`again-press-1..3.webp`, cut from the same render by `press.py` in the visuals folder), stays down while held, comes back up on release. Each press is a take, with a producer note; take 4 is "That one." (A3 says take four was the one). The mic and AGAIN number their takes from one count |
| A4 | Objections arrive in order. |
| Side B | "Side A" flips over into "Side B" (rotateX, scroll-linked). |
| B1 | Studio opens up. FIITMC counts up to 4.7; the ® stamps in. Fig. 4: tap the congas (layers cut from the render by `studio.py`); its woofers pump with the kick. On wide screens two monitors (`monitor.webp`, one more render) rise into the outer margins and pump too, from B1 on, while the track plays. |
| B2 | Fig. 5 is the desk (`<ProducerDesk />`): 32 faders on one wide board built from the render (the window wide; on small screens it keeps its size and you slide along it), a pan knob above each, Play, hold S to stutter, "My mix", her lyric. Where the build-up ends and the reader takes over the mix. It motor-recalls my mix on arrival; a fader at the top shakes and slides back. Faders count in "Produced by you". Fits one screen. Fig. 6 under it: the pad controller (`fig-6-pads.webp`, one more render, cut by `pads.py`), cropped to the device and edge to edge on phones. 16 pads, 4 knobs (caps cut out so they turn), a screen that names the last thing touched. See the music doc. |
| B3 | The argument only: my one credit, the logo brief, "18 takes, 6 kept. Same model on every take. I just kept saying again." and a link to the making-of page. The behind-the-scenes material (my notes, the four mic takes, the before/after slider, the 18 renders, the instruments, how the track was made) lives on `/stories/the-producer/making-of`, static, so the story is not crowded. |
| Sincere line | Lights up word by word. |
| B4 | Pencil rings "before" and "after". The band comes back here (B3 was the breakdown). Fig. 6, the pad controller, is "that piece of the studio. One piece.": see the music doc. |
| Everywhere | The track (`docs/the-producer-music.md`) builds section by section, piano alone at the top. While it plays, every record is the platter: the hand scratches the actual music, the records turn at the deck's speed (33⅓ rpm; not with reduced motion), Stop brakes. |
| Outro | The record scales in and turns; YOU ARE THE PRODUCER drops in letter by letter. The track plays out into the run-out groove and stops. "Press your record": their mix as a WAV, a sleeve PNG and a link to their mix. |
| PS | Hover or focus "eleven": the pencil strikes it through, once, with a thump. |
| Liner notes | "Produced by you" counts the reader's takes (AGAIN presses), faders moved (distinct, of 8), scratches (a drag of more than 30°) and lines recorded (mic clicks or Enter/Space; hover swings it but does not count), live. "Nothing yet." until then. |
| Console | `Again.` |

Sound (Web Audio, nothing downloaded): scratch follows the hand, AGAIN click, a thump,
quiet crackle. Only while the track plays.

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
4. **VU meter in the bar.** A needle that follows scroll velocity. Pins at the red line if you fling the page.
   ("Louder was never the point" applies to scrolling too.)
5. **Side B with a needle drop.** On entering Side B, a tonearm swings in from the right edge and sets
   down on the outro record.
6. **Fader recall on resize.** Re-run the motorised recall when the desk re-enters the viewport.
7. **Share your mix.** Encode the desk's eight values in the URL hash so a reader can send their mix.

## Files

- `src/pages/stories/the-producer.astro`: markup, copy, CSS (motion CSS sits with each section).
- `src/pages/stories/the-producer/making-of.astro`: how it was made. Keep behind-the-scenes material here, not in the story.
- `src/stories/the-producer.ts`: the session's data (renders, notes, mic takes), used by both pages.
- `src/styles/producer-sleeve.css`: the sleeve both pages share (tokens, grain, type basics).
- `src/scripts/the-producer.ts`: the loop, records, bar, sound, AGAIN, desk, counters, slider sweep.
- `public/stories/the-producer/`: cut-outs (`fig-*`, `mic-take-*`, `again-*`, `record-cut`), `takes/` (all 18 renders in order), `og.png`.
- The renders' sources and the scripts that cut them: `~/development/Claude outputs/producer-visuals/`.
