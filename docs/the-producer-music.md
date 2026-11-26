# The producer: the track

The page has one track, and it is the article's leitmotif. It starts at the top as a piano alone (the
demo) and builds up section by section as the reader scrolls, until B2 "The mix", where the desk
(Fig. 5) hands the reader every fader. From there to the end, the song is their mix. The desk is
not an annex: it is the article's point, made playable. This file is the seam between the people
and agents working on it. Read `docs/the-producer-motion.md` first; its look rules still hold.

## The arrangement follows the page (decided 23 November 2026)

| Section | Comes in | Why |
| --- | --- | --- |
| Top, A1 The demo | keys, pad (the grand) | Competent, on key, could be anyone's. |
| A2 The talent | vox | The singer. |
| A3 The producer | kick, snare | Someone on the other side of the glass. |
| A4 In order | bass | |
| B1 The studio | gtr, fx (the room, crackle) | |
| B2 The mix | everything; the desk's faders are the reader's | |
| B3 My credits | the drums and bass drop out | The breakdown, while I check my credits. |
| B4 Pro Tip | everything again | The drop. Fig. 6, the pad controller, is here: the one piece of the studio. |
| End (the outro) | everything, then the ending | |

- `BUILD` in `the-producer.ts` holds it, one stem set per section (Side A builds; Side B breaks down and comes back); `track.arrange(stems)` applies it. Changes land on the
  next bar line and settle within about a beat. Scroll back up and stems drop out again.
- The arrangement gate sits after each fader, so it never moves a fader.
- Until the reader touches the desk, the faders are my mix (the desk's `data-mix`). The desk's
  motor recall on arrival is visual only: the track was already playing those levels.
- Started by a tap on any record (or Enter on a focused one) or the bar's Play; the desk's Play is
  the same transport. Sound is off until then. While the track plays, the page's own sounds
  (AGAIN click, thump) are on too. Stop brakes. The first note does not wait for the downloads:
  the grand and the singer join the moment they arrive.
- The section being read is the last one whose top is above a third of the screen (the bar and
  the arrangement both use it).
- The bar's eight stem lights show what the reader can hear, in the order they come in, and tick
  on each hit.
- The ending: when the outro is half on screen, the song plays to the next four-bar line, she sings
  her last line (“Let me know if you need anything else”) over Am9, then the needle runs into the
  run-out groove (a click a turn, crackle) for three turns and the platter stops (`track.finish()`).

## Everything the reader plays is in the song

| Where | With the track playing | Stopped |
| --- | --- | --- |
| Fig. 1 cassette | Her a cappella off tape, starting on the next bar; the band drops to almost nothing | Her a cappella off tape |
| Fig. 2 mic | She sings the next line on the next bar, in the band (`track.take()`) | A count-in, then the line, dry |
| Fig. 3 AGAIN (and the Fig. 6 pad) | Playing: the record is pulled back about a second (a wheel-up, about 6 times backwards), then the band takes the phrase from its top and she sings her last line again, even where the song has her resting. Stopped: she sings her last line again on her own (`track.again()`, `Engine.sung`) | A click |
| Fig. 4 congas | A hand drum on the next sixteenth, through the drums stem | At once |
| Fig. 6 pads | 16 pads: four of her lines (on the beat), kick, clap, hat, conga, the four chords, riser, impact, again, tape stop. On the next sixteenth, through their stems, so the desk mixes them. Each has a key, printed small on it: 1234 / QWER / ASDF / ZXCV, live while Fig. 6 is on screen (then the pads come first: S plays a pad, not the stutter) | At once |
| Fig. 6 knobs | filter (DJ low/high-pass), space (reverb), echo, drive, on the master | Kept for when it plays |
| Records | Scratch the music (below) | Turn |

The pads are dark translucent plastic, lit from inside: each has a layer cut from the render by `pads.py` (the face brightening, the light spilling onto the body), full while held, fading after. While the song plays, the pads light softly with it (kick, clap, the bar's chord, her lines) and the
woofers in Fig. 4 and on the monitors pump with the kick. Not with reduced motion.

## Your record

At the outro, "Press your record" renders the whole song (32 bars, about 66 s) offline at the
reader's faders (`bounce()`), with a sleeve PNG drawn in the page (the record at the angle they
left it, their credits, their mix as one row of 32) and a link (`#mix=70-64-...`: the 32
faders in `CHANNELS` order, the four knobs, then the 32 pans with 50 in the middle, 0 to 100 each;
links without the pans, and links from the eight-fader desk, still load: each old stem's value on all
its channels, the old fx on the hall) that loads their mix for whoever opens it. The bounce includes the knobs. `render()` schedules a bar at a time just ahead
of the render; scheduling the whole song up front made it quadratic (8 bars 5 s, 32 bars minutes).

## Decided (Radu, 23 November 2026)

- Style: disco in the Random Access Memories mould, 116 BPM (Get Lucky's tempo), A minor. 32-bar song:
  intro, verse, piano, hook, stutter fill. The a cappellas were generated at 122 BPM and stretched to 116
  with Rubber Band, pitch kept (`voices/retime.py` in the visuals folder, originals in `voices/bpm122/`);
  the line timings scale by the same ratio (`RETIME` in producer-music.ts).
- The desk has 32 channels (`CHANNELS` in `producer-music.ts`: name, stem, trim, sends, my mix), eight
  to a row below, in the eight stems the page arranges:

  | Channels | |
  |---|---|
  | 1 to 8 | kick, snare (hand-muted), clap, hat, open hat, tambourine, congas, click |
  | 9 to 16 | bass (flatwound), Moog (Giorgio's sequencer), sub, Rhodes, clav, organ, piano (the grand's melody), lead |
  | 17 to 24 | vox, double (ADT, 28 ms), voder, guitar L (chicken scratch), guitar R (single notes), mute (the scratch between), strings, rips (rips, falls, spiccato stabs) |
  | 25 to 32 | brass (trumpets and trombone), wash (the grand in a long room), riser, impact, crackle, hall (reverb return), echo (delay return), phaser (its return) |

  The returns and the click are in no stem: always in. The desk is one board, 32 strips wide, built from Fig. 5's own
  (`desk/board.py` in the visuals folder: its strips, its tape run the whole length, a row added under it for
  the knobs). It runs the window wide; under 86rem it keeps its size and slides sideways in its own row.
- Every channel has a knob above its fader, as on a console's channel strip: pan, after the fader
  (`Engine.setPan`, a StereoPanner per channel). My pans are `MY_PAN` (guitars left and right, the clav
  and the congas right, the tambourine and the Rhodes left); the middle clicks in; double-click or Home
  centres. The knob is Fig. 6's blue knob. The bounce and the link carry the pans.
- The band is samples, all freely licensed, in one file (`band.mp3`, 49 hits and notes, about 410 KB;
  built by `band/band.py` from `band/fetch.py`'s downloads, pitches measured, not trusted from file names):
  Virtuosity Drums (Versilian Studios, Karoryfer) and VCSL claps; Swagbass and Black And Green Guitars
  (Karoryfer); VSCO 2 Community Edition strings and horns, all CC0; the Rhodes is jRhodes3d by Jeff
  Learman, CC BY 4.0 (credited in the liner notes, as the licence asks). Every part plays on a synth
  until `band.mp3` arrives, so the first note never waits. The Moog, clav, organ and lead are synths (no
  free clavinet samples exist). The balance was set by rendering each channel alone and measuring it.
- The parts are written fresh in the disco idiom on our chords, nothing quoted: the octave bass with a
  walk into each chord (`BASSLINE`), Rhodes comps on the offbeats (`COMP`), the clav on the sixteenths
  (`CLAV`), sixteenth hats with the open hat on every "and", the tambourine, congas from B1.
- One sustained bed at a time: once the strings are in, the wash steps back to 40%. The strings are voiced
  low, inside the range the section was sampled in (62 to 79), and quiet. The pad stem sits about 5 dB under her voice in the hook, 10 dB in the verse (measured).
- The pad is a sampled grand piano in a long room (Salamander Grand Piano by Alexander Holm, CC BY 3.0).
  Vox is the singer.
- Three files are downloaded, all in `public/stories/the-producer/desk/`, none on page load:
  - `band.mp3`, the band, at the same moments as the grand.
  - `piano.mp3`, the grand. When the reader starts the track, heads for the bar's Play, or the
    desk comes into view (`Player.prefetch()`).
  - `vox.mp3`, a generated a cappella (ElevenLabs Music), cut into lines by `desk/vox.py` in the
    visuals folder. At the same moments, or when a hand or focus heads for Fig. 1 or Fig. 2,
    which play her raw (below). `voxBytes()` downloads it once for the whole page.
- Her voice raw, over the band: Fig. 1's cassette plays the whole a cappella off tape, and the mic
  in Fig. 2 records one line per touch (`Booth` in `producer-music.ts`). A click there is its own
  consent to sound. While she sings raw, the band steps back (`track.stepBack`).
- The one instance is `track` in `producer-music.ts`. The desk, the bar and the records all play it.
- Still to come, built on this engine (not a second one): a seed for small per-reading variation.

## The Giorgio arc: how the band plays, section by section (decided 23 November 2026)

The track tells the birth of a record the way electronic music was born: a click track and a closed
filter, a sequencer, the band turning French. `LOOK` and `SWEEP` in `the-producer.ts`, `Engine.look()`
and `Engine.sweep()` in `producer-music.ts`. The reader's controls (faders, the filter knob) sit on top.

| Section | Filter (0 shut, 1 open) | Pump | What changes |
| --- | --- | --- | --- |
| Front, A1 | 0.3 to 0.45 | 0.4 | Piano through a closed, resonant low-pass, as if from the next room; a click track on every beat. |
| A2, A3, A4 | 0.6, 0.75, 0.9 (opening as you read) | 0.5 to 0.75 | Her voice, then the drums (the click stops), then the bass. |
| B1, B2 | 1 | 0.8 | The studio turns French: the sequencer bass (root and octave on every sixteenth), disco guitar chops with a wah, strings (a bed, a rip into every eighth bar, a fall at sixteen), the phaser. |
| B3 | 0.35 | 0.5 | The breakdown: no drums or bass, the filter shut, the phaser deep. |
| B4 | build, then 1 | 1 | The drop: a bar of riser, clap roll and the filter shutting, then everything on the one. The voder doubles her (0.35). Only B3 to B4 is a drop; scroll back out before it lands and it is taken back. |
| End | 1 | 0.9 | Her last line is hers alone (no robot), then the run-out groove. |

- **The pump** (`Engine.pump`): one sidechain curve on every beat, four depths: loop (keys, grand,
  guitar, strings) 0.85, bass 0.6, voice 0.35, the room 0.7. The kick is never ducked and never filtered.
  It runs even before the drums arrive, so the intro already breathes. The bar's stem lights breathe with it.
- **The page's filter** (`scene`) is two low-passes on everything but the kick; it is resonant about a
  third open, so the sweep sings. It closes slowly and opens quickly. B3 holds it shut; the build owns it
  until the drop, and a sweep sent meanwhile is applied after.
- **The voder** (`robotLine`, `look.robot`): her voice shapes a saw chord band by band (10 bands on
  phones, 14 elsewhere), the consonants passed through so the words stay words. On Fig. 6, hold a chord
  pad and hit a line pad: she sings that line as the robot on that chord, so it cannot be out of key.
  Fully robot, it sits within 5% of her dry level (measured). It is built the first time it is needed
  (B4, a chord pad, or the bounce), so the top of the page never pays for it.
- **The filter macro** (Fig. 6's filter knob): down is a resonant low-pass that also pumps harder and
  phases as it closes; up is a high-pass; the middle clicks back to clean (Home goes there too).
- **Singer swaps** happen on the next beat, mid-line: the new singer carries on from the same place in the
  same line, with a short tape wow.
- **Hands off, it performs** at B4: the robot sings her hook on the bar's chord, the filter dips and comes
  back. It plays on the last beat of the bar before, so it lands on the bar line; with reduced motion it
  plays but nothing lights or turns. The first instrument action ends it for the session ("You have the
  desk."): a fader, a knob, a pad, a conga, AGAIN, the mic, a cassette, or a real scratch. Scrolling, Tab
  and Play do not count.
- **The light score**: a dim light walks the 16 pads one per sixteenth, a row lights on every beat at B4,
  a closed filter dims them. Anything waiting for the beat (a singer swap, a take) blinks on quarter notes
  until it lands. Reduced motion: no walking lights, a steady half for pending.
- **Cheap when silent**: a stem whose gate is shut is not scheduled at all (the kick still drives the
  pump). The woofers and the desk only animate while on screen.
- The bounce is the whole band (`FULL`): disco on, pump 0.8, phaser 0.6, the voder at 0.3, at the
  reader's faders and knobs. Every riff is written fresh on our chords; nothing is quoted.

## The singers (Fig. 1's cassettes)

Six voices, one per cassette, all singing the same eight sentences (`VOICES` in `producer-music.ts`):
ChatGPT is the first a cappella (`desk/vox.mp3`); Claude, Gemini, Grok, Pi and Le Chat are ElevenLabs
Music takes generated through Amplifiers on 23 November 2026 (`public/stories/the-producer/voices/`).
`voices/voices.py` in the visuals folder pitches each into A minor (Rubber Band, formants kept), cuts
it into its eight lines and transcribes every line again to check the cut. None is a lab's own voice.

- The cassette in front is the singer: `track.setVoice(id)`. With the track playing she takes over
  from her next line. The cassette, the mic, the pads' lines and the bounce all use her.
- A voice's file downloads only when its cassette is chosen (`voxBytes(voice)`).
- The share link carries her: `#mix=<32 faders>-<4 knobs>-<32 pans>;<voice id>`. The sleeve says who sang.

## Files and owners

| File | Owns |
| --- | --- |
| `src/scripts/producer-music.ts` | The one engine. `Engine` (synthesis, singer, room, stutter; takes any BaseAudioContext), `Player` (live), `render()` (offline). |
| `src/scripts/producer-deck.worklet.js` | The deck: the mix plays off a 4 s loop of tape so the records can scratch it. Plain JS: it runs in the audio thread, loaded by URL as its own same-origin file. |
| `src/scripts/producer-desk.ts` | The desk UI: faders, transport, stutter, lyric. |
| `src/components/ProducerDesk.astro` | The desk's markup and CSS. |
| `src/scripts/the-producer.ts` | The page: records, bar, credits. Listens to the desk's events. |
| `src/pages/stories/the-producer.astro` | Copy, markup, page CSS. |

`producer-music.ts` and `producer-desk.ts` were written outside T3. Edit them, but do not rewrite them.

## Signal path

```
voices -> stem bus (fader) -> arrangement gate -> sidechain duck (melodic part: stutter) / room sends
  -> mix -> deck -> DJ filter (low, high) -> drive -> highpass -> glue -> limiter -> out
```

The deck sits between the mix and the master, like a turntable into a DJ mixer: a scratch moves the
finished mix (room and all), and the filter and limiter act on whatever the deck plays.

The stutter (hold S, or the desk's button) is stutter house, on the melodic part only: keys, grand,
guitar, pad and strings open on every sixteenth and dip after half of it, to about half at first and a
quarter after a bar held. Soft edges, so it pulses rather than clicks. Their room sends are not chopped,
so the hall keeps ringing behind the chops. The drums, the bass and her voice carry on untouched.

## Scratching (vinyl mode, with slip)

- The records are the platter, at 33⅓ rpm: one turn is 1.8 s of music (`TURN`).
- A hand on a record stops it: silence. Moving it moves the read head, so pitch and tempo follow
  the hand, and pulling back plays backwards. You can pull back up to 4 s; you cannot push into
  music that has not been played yet.
- Letting go slips back to where the beat is now (Slip mode in DJ software): the band never drifts,
  and the faders and stutter stay instant.
- Stop brakes: the platter runs down over 0.8 s.
- Keyboard: focus a record, arrows scratch (hold for more), Space holds it still.
- No AudioWorklet: the music plays straight through and the records only turn.

## Events (on `document`)

| Event | Detail | From |
| --- | --- | --- |
| `producer:fader` | `{ name, value, mix }` (name: a channel; mix: all 32) | desk |
| `producer:pan` | `{ name, value }`, -100 left to 100 right | desk |
| `producer:play` | `{ playing }` | desk |
| `producer:hit` | `{ stems, bar, step, line }`, `line` is what she starts singing | desk |
| `producer:deck` | `{ rate }`, about 45 a second: 1 playing, 0 held, below 0 backwards | desk |
| `producer:scratch` | `{ phase: 'grab' \| 'turn' \| 'release', deg }` | page |
| `producer:load` | `{ mix: { kick: 40, ... }, pans? }`, moves the faders and turns the knobs | page |

## Rules

- Nothing blocks the text. Everything works with zero interaction and with reduced motion.
- Any number shown gets its method on hover, like the other numbers.
- Animate transform and opacity only. Keyboard access for anything clickable.
- No new dependencies.
