/* The producer: everything that moves on /stories/the-producer.

   One loop (requestAnimationFrame) does three things:
   1. Writes --p (0 → 1 while an element passes through the viewport) and --e (0 → 1 while it enters)
      onto every [data-p] element that is near the screen. CSS turns those into motion.
   2. Turns the records: a slow idle spin, plus scroll speed, plus whatever the hand does (scratching).
   3. Runs the now-playing bar: current track, progress, elapsed reading time.
   Everything else listens for one moment (IntersectionObserver) or one gesture.
   With prefers-reduced-motion: no scroll-linked motion, no idle spin. Every interaction still works. */

import { Booth, BPM, bounce, CH, LINES, MINE, stemOf, track, voiceNow, voxBytes, type Channel, type Knob, type Look, type PadSound, type Stem } from './producer-music'

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))
// a pointer can be gone by the time we ask for it (a pen lifted, a synthetic event); the press still counts
const capture = (el: Element, ev: PointerEvent) => {
  try {
    el.setPointerCapture(ev.pointerId)
  } catch {}
}
const $$ = <T extends Element = HTMLElement>(s: string, el: ParentNode = document) => [...el.querySelectorAll<T>(s)] as T[]
const $ = <T extends Element = HTMLElement>(s: string, el: ParentNode = document) => el.querySelector<T>(s)

/* ------------------------------------------------------------------ produced by you: the reader's own credits */

const made = { takes: 0, faders: new Set<string>(), scratches: 0, lines: 0, hits: 0 }
const credit = $('[data-credit]')
function writeCredit() {
  if (!credit) return
  const parts = ([
    [made.takes, 'take', 'takes'],
    [made.faders.size, 'fader', 'faders'],
    [made.scratches, 'scratch', 'scratches'],
    [made.lines, 'line recorded', 'lines recorded'],
    [made.hits, 'pad or drum hit', 'pad and drum hits'],
  ] as const).filter(([n]) => n > 0)
  if (!parts.length) return void (credit.textContent = 'Nothing yet.')
  credit.replaceChildren(
    ...parts.flatMap(([n, one, many], i) => {
      const num = document.createElement('span')
      num.className = 'num'
      num.textContent = String(n)
      return [i ? ', ' : '', num, ` ${n === 1 ? one : many}`]
    }),
    '.',
  )
}
// one session, one take count: the mic (Fig. 2) and AGAIN (Fig. 3) number their takes from the same reel
let takesSoFar = 0
const nextTake = () => ++takesSoFar

function credited(kind: 'takes' | 'scratches' | 'lines' | 'hits') {
  made[kind] += 1
  writeCredit()
}
function creditFader(name = '') {
  if (made.faders.has(name)) return
  made.faders.add(name)
  writeCredit()
}

/* ------------------------------------------------------------------ sound (off until asked) */

// The page's own sounds (the AGAIN click, the thump), on while the track plays. The scratch and the
// crackle are the track's now: a scratched record moves the music, and the crackle sits on the fx stem.
let audio: AudioContext | null = null
let soundOn = false
let noise: AudioBuffer | null = null

function ensureAudio() {
  if (audio) return audio
  audio = new AudioContext()
  const len = audio.sampleRate * 2
  noise = audio.createBuffer(1, len, audio.sampleRate)
  const d = noise.getChannelData(0)
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1
  return audio
}

/** A short percussive sound: a click (the AGAIN button) or a thump (a record landing). */
function blip(kind: 'click' | 'thump') {
  if (!soundOn || !audio || !noise) return
  const t = audio.currentTime
  if (kind === 'thump') {
    const o = audio.createOscillator()
    const g = audio.createGain()
    o.frequency.setValueAtTime(140, t)
    o.frequency.exponentialRampToValueAtTime(48, t + 0.18)
    g.gain.setValueAtTime(0.5, t)
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.22)
    o.connect(g).connect(audio.destination)
    o.start(t)
    o.stop(t + 0.25)
    return
  }
  const s = audio.createBufferSource()
  s.buffer = noise
  const f = audio.createBiquadFilter()
  f.type = 'bandpass'
  f.frequency.value = 2600
  f.Q.value = 3
  const g = audio.createGain()
  g.gain.setValueAtTime(0.9, t)
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.06)
  s.connect(f).connect(g).connect(audio.destination)
  s.start(t, Math.random())
  s.stop(t + 0.08)
  blipLow(t)
}
function blipLow(t: number) {
  if (!audio) return
  const o = audio.createOscillator()
  const g = audio.createGain()
  o.type = 'triangle'
  o.frequency.setValueAtTime(180, t)
  o.frequency.exponentialRampToValueAtTime(90, t + 0.08)
  g.gain.setValueAtTime(0.35, t)
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.1)
  o.connect(g).connect(audio.destination)
  o.start(t)
  o.stop(t + 0.12)
}

/* ------------------------------------------------------------------ the track: one record, playing under the whole page */

// Started by a click on the bar's Play or a tap on a record (sound is off until then). While it plays,
// the page's own sounds are on too: the AGAIN click, the thump.
const playBtn = $<HTMLButtonElement>('[data-play]')
function startTrack() {
  void ensureAudio().resume() // made here, inside the click, or the browser keeps it silent
  void track.play()
}
const warmTrack = () => track.prefetch()
playBtn?.addEventListener('pointerenter', warmTrack)
playBtn?.addEventListener('focus', warmTrack)
playBtn?.addEventListener('click', () => (track.playing ? track.stop(0.8) : startTrack()))
track.watch((on) => {
  soundOn = on
  playBtn?.setAttribute('aria-pressed', String(on))
  if (playBtn) playBtn.textContent = on ? 'Stop' : 'Play'
})

// The arrangement follows the page. Up top the piano plays alone (the demo); each section brings
// stems in; at B2 the desk hands the reader every fader, and from there on the song is their mix.
// Scroll back up and the stems drop out again. Changes land on the next bar line.
// Side A builds; Side B mixes, breaks down and comes back. '' is the front, above A1.
const DEMO: Stem[] = ['keys', 'pad']
const ALL: Stem[] = ['keys', 'pad', 'vox', 'kick', 'snare', 'bass', 'gtr', 'fx']
const BUILD: Record<string, Stem[]> = {
  '': DEMO,
  A1: DEMO, // the demo: competent, on key, could be anyone's
  A2: [...DEMO, 'vox'], // the talent
  A3: [...DEMO, 'vox', 'kick', 'snare'], // someone on the other side of the glass
  A4: [...DEMO, 'vox', 'kick', 'snare', 'bass'], // in order
  B1: ALL, // the studio: the room comes in
  B2: ALL, // the mix: the reader's hands on every fader
  B3: ['keys', 'pad', 'vox', 'gtr', 'fx'], // the breakdown: the drums and bass drop out while I check my credits
  B4: ALL, // the drop: the band comes back for the one piece of advice
  End: ALL, // the outro: the song ends (track.finish) as YOU ARE THE PRODUCER lands
}
// How the band plays in each section: the birth of a record, the way electronic music was born.
// The intro runs on a click track and breathes before the drums arrive; B1 turns the studio French (the
// sequencer bass, the guitar chops, the strings, the phaser); B3 breaks down, phased and closed; B4 drops,
// the robot doubling her; the end is hers alone. The reader's own controls (faders, knobs) sit on top.
const LOOK: Record<string, Look> = {
  '': { pump: 0.4, phaser: 0, disco: false, robot: 0, click: true },
  A1: { pump: 0.4, phaser: 0, disco: false, robot: 0, click: true },
  A2: { pump: 0.5, phaser: 0, disco: false, robot: 0, click: true },
  A3: { pump: 0.7, phaser: 0, disco: false, robot: 0, click: false },
  A4: { pump: 0.75, phaser: 0, disco: false, robot: 0, click: false },
  B1: { pump: 0.8, phaser: 0.6, disco: true, robot: 0, click: false },
  B2: { pump: 0.8, phaser: 0.6, disco: true, robot: 0, click: false },
  B3: { pump: 0.5, phaser: 1, disco: true, robot: 0, click: false },
  B4: { pump: 1, phaser: 0.6, disco: true, robot: 0.35, click: false },
  End: { pump: 0.9, phaser: 0.6, disco: true, robot: 0, click: false },
}
// The filter arc: how open the page's filter is in each section. Side A opens step by step as you read
// (it glides toward the next section's value); B3 shuts it for the breakdown; B4 opens it on the drop.
const SWEEP: Record<string, number> = { '': 0.3, A1: 0.45, A2: 0.6, A3: 0.75, A4: 0.9, B1: 1, B2: 1, B3: 0.35, B4: 1, End: 1 }
let arranged = '-'
function arrangeFor(id: string) {
  if (id === arranged) return
  const drop = arranged === 'B3' && id === 'B4'
  arranged = id
  track.arrange(BUILD[id] ?? ALL, drop)
  track.look(LOOK[id] ?? LOOK.End)
  writeStems()
  writeMonitors()
}

// the bar's stem lights: which stems the reader can hear, and a tick on each hit
const stemLights = new Map($$('[data-stem]').map((el) => [el.dataset.stem as Stem, el]))
function writeStems() {
  stemLights.forEach((el, s) => el.classList.toggle('in', track.playing && track.heard(s)))
}
track.watch(writeStems)
document.addEventListener('producer:fader', writeStems)
const stemsRow = $('[data-stems]')
document.addEventListener('producer:hit', (ev) => {
  if (reduce) return
  const h = ev as CustomEvent<{ stems: Stem[]; step: number }>
  for (const s of h.detail.stems) {
    if (!track.heard(s)) continue
    stemLights.get(s)?.animate([{ transform: 'scaleY(0.35)' }, { transform: 'scaleY(1)' }], { duration: s === 'pad' ? 700 : 170, easing: 'ease-out' })
  }
  // the pump, seen: the whole row breathes on every beat with the same curve the band does
  if (h.detail.step % 4 === 0) stemsRow?.animate([{ transform: 'scaleY(0.8)' }, { transform: 'scaleY(1)' }], { duration: 420, easing: 'cubic-bezier(0.2, 0, 0.3, 1)' })
})

/* ------------------------------------------------------------------ scroll progress → CSS */

const tracked = $$('[data-p]')
const near = new Set<HTMLElement>()
const io = new IntersectionObserver(
  (es) => es.forEach((e) => (e.isIntersecting ? near.add(e.target as HTMLElement) : near.delete(e.target as HTMLElement))),
  { rootMargin: '25% 0px 25% 0px' },
)
if (reduce) {
  tracked.forEach((el) => {
    el.style.setProperty('--p', '0.5')
    el.style.setProperty('--e', '1')
  })
} else {
  tracked.forEach((el) => io.observe(el))
}

function writeProgress() {
  const vh = innerHeight
  for (const el of near) {
    const r = el.getBoundingClientRect()
    const p = clamp((vh - r.top) / (vh + r.height))
    const e = clamp((vh - r.top) / (vh * 0.62))
    el.style.setProperty('--p', p.toFixed(4))
    el.style.setProperty('--e', e.toFixed(4))
  }
}

/* ------------------------------------------------------------------ one-shot moments */

const once = new IntersectionObserver(
  (es) =>
    es.forEach((e) => {
      if (!e.isIntersecting) return
      const el = e.target as HTMLElement
      el.classList.add('is-in')
      el.dispatchEvent(new CustomEvent('in'))
      once.unobserve(el)
    }),
  { threshold: 0.45 },
)
$$('[data-in]').forEach((el) => once.observe(el))

/* ------------------------------------------------------------------ the records */

const records = $$<HTMLImageElement>('[data-record]')
let lastY = scrollY
let scrollVel = 0
let angle = 0
let spin = 0 // degrees per frame, from the hand
let held: { el: HTMLElement; last: number; moved: number } | null = null
// While the track plays, every record is its platter: the hand goes to the deck (producer-desk.ts),
// which plays the music at the hand's speed, and the deck's speed turns the records. null: not playing.
let deckRate: number | null = null
let pressing = false // the outro is pressing the reader's record
const scratch = (phase: 'grab' | 'turn' | 'release', deg?: number) =>
  document.dispatchEvent(new CustomEvent('producer:scratch', { detail: { phase, deg } }))

const angleAt = (el: HTMLElement, x: number, y: number) => {
  const r = el.getBoundingClientRect()
  return (Math.atan2(y - (r.top + r.height / 2), x - (r.left + r.width / 2)) * 180) / Math.PI
}
function grab(rec: HTMLElement, at: number) {
  held = { el: rec, last: at, moved: 0 }
  rec.classList.add('held')
  scratch('grab')
}
function turn(d: number) {
  if (!held) return
  held.moved += Math.abs(d)
  angle += d
  spin = d
  scratch('turn', d)
}
function drop() {
  if (!held) return
  if (held.moved > 30) {
    credited('scratches') // a tap is not a scratch
    handsOn()
  }
  else if (held.moved < 4 && !track.playing) startTrack() // a tap drops the needle
  held.el.classList.remove('held')
  held = null
  scratch('release')
}
records.forEach((rec) => {
  rec.addEventListener('pointerdown', (ev) => {
    grab(rec, angleAt(rec, ev.clientX, ev.clientY))
    capture(rec, ev)
  })
  rec.addEventListener('pointermove', (ev) => {
    if (!held || held.el !== rec) return
    const a = angleAt(rec, ev.clientX, ev.clientY)
    let d = a - held.last
    if (d > 180) d -= 360
    if (d < -180) d += 360
    held.last = a
    turn(d)
  })
  rec.addEventListener('pointerup', drop)
  rec.addEventListener('pointercancel', drop)
  // keyboard: Enter plays, arrows scratch (hold for more), Space holds the record still
  rec.addEventListener('keydown', (ev) => {
    if (ev.key === 'Enter') return track.playing || startTrack()
    const d = ({ ArrowRight: 12, ArrowUp: 12, ArrowLeft: -12, ArrowDown: -12, ' ': 0 } as Record<string, number>)[ev.key]
    if (d === undefined) return
    ev.preventDefault()
    if (!held) grab(rec, 0)
    if (d) turn(d)
  })
  rec.addEventListener('keyup', (ev) => ['ArrowRight', 'ArrowUp', 'ArrowLeft', 'ArrowDown', ' '].includes(ev.key) && drop())
  rec.addEventListener('blur', drop)
})

/* ------------------------------------------------------------------ now playing */

const bar = $('[data-bar]')
const hero = $('.hero')
const nowCode = $('[data-now-code]')
const nowTitle = $('[data-now-title]')
const nowTime = $('[data-now-time]')
const nowFill = $('[data-now-fill]')
const tracks = $$('[data-track]')
const main = $('main')
const words = (main?.textContent ?? '').trim().split(/\s+/).length
const total = Math.round((words / 230) * 60) // seconds, at 230 words a minute
const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`
if (nowTime) nowTime.title = `Reading time: ${words.toLocaleString('en-US')} words at 230 a minute`

if (bar && hero) {
  new IntersectionObserver(([e]) => bar.classList.toggle('on', !e.isIntersecting), { threshold: 0.05 }).observe(hero)
}
let current = ''
let playing = false // the track's transport
let sung = '' // the line she is singing, for the bar
let sungTimer = 0
// The filter arc (SWEEP): at the front the band plays through a closed low-pass, as if from the next room.
// Within a section it glides toward the next one's value when that is more open (the build), and holds
// when it is not (B2 stays open while you mix; B3 shuts on arrival).
function writeSweep() {
  const line = innerHeight * 0.3
  const i = tracks.findIndex((t) => t.dataset.track === arranged)
  const here = SWEEP[arranged] ?? 1
  const next = tracks[i + 1]
  if (!next || i < 0) {
    // the front: from the top of the page to A1
    const a1 = tracks[0]
    const k = a1 ? clamp(scrollY / Math.max(1, a1.getBoundingClientRect().top + scrollY - line)) : 1
    return track.sweep(i < 0 && arranged === '' ? SWEEP[''] + (SWEEP.A1 - SWEEP['']) * k : here)
  }
  const to = SWEEP[next.dataset.track ?? ''] ?? here
  if (to <= here || arranged === 'B3') return track.sweep(here) // B3 waits, shut, for the drop to open it
  const top = tracks[i].getBoundingClientRect().top
  const k = clamp((line - top) / Math.max(1, next.getBoundingClientRect().top - top))
  track.sweep(here + (to - here) * k)
}

function writeBar() {
  writeSweep()
  const doc = document.documentElement
  const prog = clamp(scrollY / (doc.scrollHeight - innerHeight))
  if (nowFill) nowFill.style.transform = `scaleX(${prog.toFixed(4)})`
  // stopped, the bar reads the page; playing, it reads the song
  if (nowTime && !playing) nowTime.textContent = `${fmt(prog * total)} / ${fmt(total)}`
  let pick: HTMLElement | null = null
  // the reading line sits a third of the way down: a short section (A2 beside the hanging mic) is still
  // the one being read until its text has gone up past it
  for (const t of tracks) if (t.getBoundingClientRect().top < innerHeight * 0.3) pick = t
  arrangeFor(pick?.dataset.track ?? '')
  const title = sung || pick?.dataset.title || ''
  const id = `${pick?.dataset.track ?? ''} ${title}`
  if (id !== current && pick) {
    current = id
    if (nowCode) nowCode.textContent = pick.dataset.track ?? ''
    if (nowTitle) {
      nowTitle.textContent = title
      // her line only if it fits whole; a cut-off lyric reads worse than the track's name
      const now = nowTitle.parentElement!
      if (now.scrollWidth > now.clientWidth) nowTitle.textContent = pick.dataset.title ?? ''
    }
    $$('.tracks a').forEach((a) => a.classList.toggle('playing', a.getAttribute('href') === `#${pick?.id}`))
  }
}

/* ------------------------------------------------------------------ A2: on wide screens the mic hangs from the top of the window */

// Same query as the CSS that pins it. Down while A2 comes in; up with the page once A2 has gone by.
const hanging = matchMedia('(prefers-reduced-motion: no-preference) and (min-width: 80rem)')
const micFig = $('.drop')
const a2 = $('#a2')
function writeMic() {
  if (!hanging.matches || !micFig || !a2) return
  const vh = innerHeight
  const r = a2.getBoundingClientRect()
  // drops once A2 is two thirds of the way up the screen, so it never hangs over Fig. 1
  micFig.style.setProperty('--drop', clamp((vh * 0.66 - r.top) / (vh * 0.3)).toFixed(4))
  micFig.style.setProperty('--lift', `${Math.min(0, r.bottom - vh * 0.4).toFixed(1)}px`)
}

/* ------------------------------------------------------------------ the loop */

let lastT = performance.now()
function frame(now: number) {
  const k = Math.min(4, (now - lastT) / (1000 / 60)) // frames at 60 a second
  lastT = now
  const y = scrollY
  scrollVel = scrollVel * 0.85 + (y - lastY) * 0.15
  lastY = y
  if (!reduce) writeProgress()
  if (!held) {
    spin *= 0.92
    // 33⅓ rpm is 3.33° a frame. Otherwise a slow idle turn, plus scroll speed. Neither with reduced motion.
    if (deckRate !== null) angle += reduce ? 0 : deckRate * 3.33 * k
    else if (pressing) angle += reduce ? 0 : 9 * k // the press: faster than it plays
    else angle += (reduce ? 0 : 0.12 + scrollVel * 0.35) + spin
  }
  const turn = `${angle.toFixed(2)}deg`
  records.forEach((r) => (r.style.rotate = turn))
  writeBar()
  writeMic()
  writeReels(k)
  requestAnimationFrame(frame)
}
requestAnimationFrame(frame)

/* ------------------------------------------------------------------ her voice, raw: Fig. 1 plays it, Fig. 2 records it */

// A click is its own consent to sound, as Play is on the desk. The Sound toggle stays for the effects.
// The a cappella downloads when a hand or focus heads for either figure, not before.
let booth: Booth | null = null
// on the track's own clock once there is one, so a tape started with the band playing lands on a bar
function getBooth() {
  const c = track.ctx ?? ensureAudio()
  void c.resume()
  if (booth?.ctx !== c) {
    booth?.stop()
    booth = new Booth(c)
  }
  return booth
}
const warm = () => void voxBytes().catch(() => {})

/* ------------------------------------------------------------------ A1: the demo plays off its cassette */

// Anything waiting for the beat or the bar (a singer swap, a take, AGAIN) blinks on quarter notes until it
// lands, so nobody wonders whether it worked. Reduced motion: a steady half, no blink.
function pending(el: Element | null | undefined, ms: number) {
  if (!el || ms < 60) return
  if (reduce) return void el.animate([{ opacity: 0.55 }, { opacity: 0.55 }], { duration: ms })
  el.animate([{ opacity: 1 }, { opacity: 0.45 }, { opacity: 1 }], { duration: 60000 / BPM, iterations: Math.max(1, Math.round(ms / (60000 / BPM))) })
}

// One cassette per lab, every one the same song with its own singer (VOICES in producer-music.ts), in an
// endless row: three copies of the six (the markup), and when the row settles in a copy either side it
// jumps a whole set, unseen. The cassette in front sings the record. Tap a side one to bring it in front;
// tap the one in front to play its demo. Swipe, drag or use the arrow keys to turn the row.
const tapesRow = $('[data-tapes]')
const slides = $$('[data-tape]')
const N = slides.length / 3
const demoCap = $('[data-demo-cap]')
let front = N // the slide in front: an index into all three copies
let tapeOn = false
let reelAngle = 0
const labOf = (i: number) => ((i % N) + N) % N
const slideReels = () => $$('[data-reel]', slides[front] ?? document)
function setTape(on: boolean) {
  tapeOn = on
  const b = $<HTMLButtonElement>('[data-demo-play]', slides[front] ?? document)
  const lab = slides[front]?.dataset.lab ?? ''
  b?.setAttribute('aria-pressed', String(on))
  b?.setAttribute('aria-label', `${on ? 'Stop' : 'Play'} the ${lab} demo`)
  if (demoCap) demoCap.textContent = on ? `Playing the ${lab} demo.` : 'Tap it to play.'
}
// where the row scrolls to put slide i in front
const leftFor = (i: number) => (slides[i]?.offsetLeft ?? 0) - ((tapesRow?.clientWidth ?? 0) - (slides[i]?.offsetWidth ?? 0)) / 2
const centreOf = (s: HTMLElement) => s.offsetLeft + s.offsetWidth / 2
function nearest() {
  if (!tapesRow) return front
  const mid = tapesRow.scrollLeft + tapesRow.clientWidth / 2
  let best = front
  slides.forEach((s, i) => {
    if (Math.abs(centreOf(s) - mid) < Math.abs(centreOf(slides[best]) - mid)) best = i
  })
  return best
}
// the one in front sings: from her next line (the mic, the pads' lines and your record use her too)
function choose(i: number) {
  if (!slides[i]) return
  const changed = labOf(i) !== labOf(front)
  front = i
  if (!changed) return
  if (tapeOn) booth?.stop() // the other tape stops
  void track.setVoice(slides[i].dataset.tape ?? '').then((ms) => pending($('.tape-in', slides[i]), ms))
}
// one whole set over, so the row never ends: the same cassette in the middle copy, no movement
function recentre() {
  if (!tapesRow) return
  const i = front < N ? front + N : front >= 2 * N ? front - N : front
  if (i === front) return
  tapesRow.classList.add('jumping')
  tapesRow.scrollLeft += leftFor(i) - leftFor(front)
  front = i
  tapesRow.classList.remove('jumping')
}
const goTo = (i: number, smooth = !reduce) => {
  if (!tapesRow || !slides[i]) return
  choose(i)
  tapesRow.scrollTo({ left: leftFor(i), behavior: smooth ? 'smooth' : 'auto' })
}
// the one in front is bigger and full; the others shrink and fade with their distance from it
function writeNear() {
  if (!tapesRow) return
  const mid = tapesRow.scrollLeft + tapesRow.clientWidth / 2
  for (const s of slides) s.style.setProperty('--near', Math.max(0, 1 - Math.abs(centreOf(s) - mid) / s.offsetWidth).toFixed(3))
}
let settle = 0
let nearFrame = 0
tapesRow?.addEventListener('scroll', () => {
  cancelAnimationFrame(nearFrame)
  nearFrame = requestAnimationFrame(writeNear)
  clearTimeout(settle)
  settle = window.setTimeout(() => {
    choose(nearest())
    recentre()
    writeNear()
  }, 110)
}, { passive: true })
if (tapesRow) {
  // start in the middle copy, the first cassette in front
  const place = () => {
    tapesRow.scrollLeft = leftFor(front)
    writeNear()
  }
  place()
  addEventListener('load', place, { once: true })
  addEventListener('resize', place)
}
// a mouse drags the row like a hand would; a drag is not a click
let drag: { x: number; left: number; moved: boolean } | null = null
tapesRow?.addEventListener('pointerdown', (ev) => {
  if (ev.pointerType !== 'mouse') return
  drag = { x: ev.clientX, left: tapesRow.scrollLeft, moved: false }
})
addEventListener('pointermove', (ev) => {
  if (!drag || !tapesRow) return
  const dx = ev.clientX - drag.x
  if (Math.abs(dx) > 6) {
    drag.moved = true
    tapesRow.classList.add('dragging')
  }
  if (drag.moved) tapesRow.scrollLeft = drag.left - dx
})
addEventListener('pointerup', () => {
  if (!drag || !tapesRow) return
  const moved = drag.moved
  drag = null
  tapesRow.classList.remove('dragging')
  if (!moved) return
  goTo(nearest())
  addEventListener('click', (e) => e.stopPropagation(), { capture: true, once: true }) // swallow the click the drag ends in
})
// arrow keys turn the row while a cassette has focus, and the focus goes with it
tapesRow?.addEventListener('keydown', (ev) => {
  const d = ({ ArrowRight: 1, ArrowLeft: -1 } as Record<string, number>)[ev.key]
  if (!d) return
  ev.preventDefault()
  recentre()
  goTo(front + d)
  $<HTMLButtonElement>('[data-demo-play]', slides[front])?.focus({ preventScroll: true })
})
slides.forEach((s, i) => {
  const b = $<HTMLButtonElement>('[data-demo-play]', s)
  b?.addEventListener('pointerenter', warm)
  // by Tab (only the middle copy is in the tab order): the focused cassette comes to the front
  b?.addEventListener('focus', () => {
    warm()
    if (i !== front) goTo(i, false)
  })
  b?.addEventListener('click', async () => {
    handsOn()
    if (i !== front) return goTo(i) // a side cassette comes to the front first; tap again to play it
    if (tapeOn) return booth?.stop()
    setTape(true)
    track.stepBack(true, 0.12) // the band all but stops while the demo plays: this is her, raw
    try {
      await getBooth().cassette(track.nextBarAt || undefined) // on the next bar; until it runs out, is stopped, or the mic takes over
    } catch {
      // no tape, no harm
    }
    setTape(false)
    if (!booth?.busy) track.stepBack(false)
  })
})
// the hubs: the full reel turns slower than the empty one
function writeReels(k: number) {
  if (!tapeOn || reduce) return
  reelAngle += 2.6 * k
  slideReels().forEach((r, i) => (r.style.rotate = `${(reelAngle * (i ? 1.25 : 0.85)).toFixed(1)}deg`))
}

/* ------------------------------------------------------------------ A2: the mic swings, and she records a line */

const mic = $('[data-mic]')
const micCap = $('[data-mic-cap]')
const micSays = micCap?.textContent ?? ''
const swing = () => {
  if (reduce || !mic) return
  mic.animate(
    [{ rotate: '5deg' }, { rotate: '-3.6deg' }, { rotate: '2.4deg' }, { rotate: '-1.4deg' }, { rotate: '0.6deg' }, { rotate: '0deg' }],
    { duration: 2600, easing: 'ease-out' },
  )
}
// hover swings it; only a deliberate touch records (and goes in the credits)
let takeId = 0
const touch = async () => {
  handsOn()
  swing()
  const id = ++takeId
  // with the band playing, she records into the song: the next line, on the next bar
  const live = track.take()
  if (live) {
    credited('lines')
    const n = nextTake()
    if (micCap) micCap.textContent = `Take ${n}. Rolling.`
    pending(mic, live.inMs)
    window.setTimeout(() => id === takeId && micCap && (micCap.textContent = `Take ${n}. “${live.text}”`), live.inMs)
    window.setTimeout(() => id === takeId && micCap && (micCap.textContent = micSays), live.inMs + live.forMs + 1500)
    return
  }
  try {
    track.stepBack(true) // the band steps back while she records
    const { text, sung } = await getBooth().take()
    if (id !== takeId) return
    credited('lines')
    if (micCap) micCap.textContent = `Take ${nextTake()}. “${text}”`
    await sung
    if (id === takeId && !booth?.busy) track.stepBack(false)
    setTimeout(() => id === takeId && micCap && (micCap.textContent = micSays), 1800)
  } catch {
    track.stepBack(false) // she is not in today
  }
}
mic?.closest('[data-in]')?.addEventListener('in', () => setTimeout(swing, 350))
mic?.addEventListener('pointerenter', () => (warm(), swing()))
mic?.addEventListener('focus', warm)
mic?.addEventListener('click', touch)
mic?.addEventListener('keydown', (ev) => {
  if (ev.key !== 'Enter' && ev.key !== ' ') return
  ev.preventDefault()
  touch()
})

/* ------------------------------------------------------------------ A3: the AGAIN button works */

const againBtn = $<HTMLButtonElement>('[data-again]')
const pad = $('[data-pad]')
const takeN = $('[data-take-n]')
const takeLine = $('[data-take-line]')
// take four is the one, as A3 says
const lines = ['Again.', 'Again, but like you mean it.', 'Again. Less polite.', 'That one.']
let take = 0 // presses since the last "That one."
function pressAgain() {
  if (!againBtn || againBtn.disabled) return
  handsOn()
  take += 1
  credited('takes')
  blip('click')
  void track.again() // with the band playing: the record spins back and they play the phrase again
  const line = lines[Math.min(take, lines.length) - 1]
  if (takeN) takeN.textContent = String(nextTake())
  if (takeLine) {
    takeLine.textContent = line
    takeLine.animate([{ opacity: 0, translate: '0 0.3em' }, { opacity: 1, translate: '0 0' }], { duration: 260, easing: 'ease-out' })
  }
  if (take >= lines.length) {
    againBtn.disabled = true
    againBtn.closest('figure')?.classList.add('kept')
    setTimeout(() => {
      take = 0
      againBtn.disabled = false
      againBtn.closest('figure')?.classList.remove('kept')
      if (takeLine) takeLine.textContent = 'Press it.'
    }, 3200)
  }
}

// The cap, frame by frame: down fast, held while you hold it, back up when you let go.
// With reduced motion it jumps straight down and straight back up.
const DOWN: [number, number][] = reduce ? [[3, 0]] : [[1, 0], [2, 30], [3, 60]]
const UP: [number, number][] = reduce ? [[0, 0]] : [[2, 0], [1, 45], [0, 90]]
let frameTimers: number[] = []
let isDown = false
const play = (seq: [number, number][]) => {
  frameTimers.forEach(clearTimeout)
  frameTimers = seq.map(([f, ms]) => window.setTimeout(() => pad && (pad.dataset.f = String(f)), ms))
}
const down = () => {
  if (isDown || !againBtn || againBtn.disabled) return
  isDown = true
  play(DOWN)
}
const up = () => {
  if (!isDown) return
  isDown = false
  play(UP)
}

// a pad fires when it is hit, not when it is let go
againBtn?.addEventListener('pointerdown', () => {
  if (againBtn.disabled) return
  down()
  pressAgain()
})
// letting go is heard on the window: take 6 disables the button (and takes its focus) while it is held
addEventListener('pointerup', up)
addEventListener('pointercancel', up)
addEventListener('keyup', (ev) => [' ', 'Enter', 'a', 'A'].includes(ev.key) && up())
againBtn?.addEventListener('pointerleave', up)
// keyboard and assistive tech arrive as a click with no pointer behind it
againBtn?.addEventListener('click', (ev) => ev.detail === 0 && pressAgain())
againBtn?.addEventListener('keydown', (ev) => (ev.key === ' ' || ev.key === 'Enter') && !ev.repeat && down())
addEventListener('keydown', (ev) => {
  if (ev.key.toLowerCase() !== 'a' || ev.metaKey || ev.ctrlKey || ev.altKey || ev.repeat) return
  if ((ev.target as HTMLElement).closest('input, textarea, [contenteditable]')) return
  const r = againBtn?.getBoundingClientRect()
  if (!r || r.top >= innerHeight || r.bottom <= 0 || againBtn?.disabled) return
  down()
  pressAgain()
})

/* ------------------------------------------------------------------ B1: the made-up coefficient counts itself up */

$$('[data-count]').forEach((el) => {
  const to = Number(el.dataset.count)
  const dec = (el.dataset.count ?? '').split('.')[1]?.length ?? 0
  const host = el.closest('[data-in]') ?? el
  const run = () => {
    if (reduce) return void (el.textContent = to.toFixed(dec))
    const t0 = performance.now()
    const step = (t: number) => {
      const k = clamp((t - t0) / 1400)
      el.textContent = (to * (1 - Math.pow(1 - k, 3))).toFixed(dec)
      if (k < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }
  el.textContent = (0).toFixed(dec)
  host.addEventListener('in', run)
  if (!host.hasAttribute('data-in')) once.observe(host)
})

/* ------------------------------------------------------------------ B2: the desk (src/scripts/producer-desk.ts) */

// Its faders count in the credits.
document.addEventListener('producer:fader', (ev) => creditFader((ev as CustomEvent<{ name: string }>).detail.name))
document.addEventListener('producer:play', (ev) => {
  playing = (ev as CustomEvent<{ playing: boolean }>).detail.playing
  if (!playing) sung = ''
  if (nowTime) nowTime.title = playing ? `Where the song is: bar of 32, then beat of 4, at ${BPM} BPM` : `Reading time: ${words.toLocaleString('en-US')} words at 230 a minute`
})
// playing, the bar's clock is the song's: bar and beat
document.addEventListener('producer:hit', (ev) => {
  const h = (ev as CustomEvent<{ step: number; bar: number }>).detail
  if (nowTime && playing && h.step % 4 === 0) nowTime.textContent = `bar ${(h.bar % 32) + 1} · ${Math.floor((h.step % 16) / 4) + 1}`
})
document.addEventListener('producer:deck', (ev) => {
  const r = (ev as CustomEvent<{ rate: number }>).detail.rate
  deckRate = playing || Math.abs(r) > 0.01 ? r : null // after Stop, the records run down with the deck
})
// what she starts singing goes in the bar (once she is in the song), for as long as the desk shows it
document.addEventListener('producer:hit', (ev) => {
  const line = (ev as CustomEvent<{ line?: string }>).detail.line
  if (!line || !track.isOpen('vox')) return
  sung = `“${line}”`
  clearTimeout(sungTimer)
  sungTimer = window.setTimeout(() => (sung = ''), 3600)
})

/* ------------------------------------------------------------------ the instruments: Fig. 4's congas, Fig. 6's pads and knobs */

// Everything goes through the track's own engine and its stems, so the desk mixes it too. With the
// band playing it lands on the beat; stopped, it plays at once (and wakes nothing else).
// a pad's light (its .lit layer, cut from the render): full while a hand or key holds it, then it fades
// (CSS); the song lights the pads more softly as it plays them
const glow = (k: HTMLElement | undefined, level = 0.55, ms = 420) => {
  if (k && !k.classList.contains('on')) $('.lit', k)?.animate([{ opacity: level }, { opacity: 0 }], { duration: ms, easing: 'ease-out' })
}
const screen = $('[data-screen]')
let screenTimer = 0
function show(text: string) {
  if (!screen) return
  screen.textContent = text
  clearTimeout(screenTimer)
  screenTimer = window.setTimeout(() => (screen.textContent = 'Remix'), 1800)
}
const keyFor = new Map($$('[data-key]').map((k) => [k.dataset.key as PadSound, k]))
async function hit(sound: PadSound) {
  credited('hits')
  if (sound === 'again') credited('takes')
  // hold a chord pad and hit a line: she sings it as the robot, on that chord (it cannot be out of key)
  const held = $('.key.on[data-key^="chord-"]')
  const chord = sound.startsWith('line-') && held ? Number(held.dataset.key!.slice(6)) : undefined
  if (chord !== undefined) show('Voder')
  await track.pad(sound, chord)
}
const press = (k: HTMLElement) => {
  handsOn()
  k.classList.add('on')
  show(k.dataset.short ?? '')
  void hit(k.dataset.key as PadSound)
}
const release = (k: HTMLElement) => k.classList.remove('on')
keyFor.forEach((k) => {
  // a pad fires when it is hit, not when it is let go
  k.addEventListener('pointerdown', (ev) => {
    press(k)
    capture(k, ev)
  })
  k.addEventListener('pointerup', () => release(k))
  k.addEventListener('pointercancel', () => release(k))
  // Enter or Space on a focused pad, or assistive tech: a click with no pointer behind it
  k.addEventListener('click', (ev) => {
    if (ev.detail !== 0) return
    press(k)
    window.setTimeout(() => release(k), 140)
  })
})

// Each pad has its key (printed on it): 1234 / QWER / ASDF / ZXCV, while Fig. 6 is on screen. Then the
// pads come first: their keys do not also reach the desk's S (stutter) or AGAIN's A.
const byLetter = new Map($$('[data-key]').map((k) => [k.dataset.letter ?? '', k]))
const padsFig = $('[data-pads]')
let padsOnScreen = false
if (padsFig) new IntersectionObserver(([e]) => (padsOnScreen = e.isIntersecting), { threshold: 0.2 }).observe(padsFig)
const typingIn = (t: EventTarget | null) => t instanceof HTMLElement && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))
addEventListener('keydown', (ev) => {
  if (!padsOnScreen || ev.metaKey || ev.ctrlKey || ev.altKey || typingIn(ev.target)) return
  const k = byLetter.get(ev.key.toLowerCase())
  if (!k) return
  ev.preventDefault()
  ev.stopImmediatePropagation()
  if (!ev.repeat) press(k)
}, { capture: true })
addEventListener('keyup', (ev) => {
  const k = byLetter.get(ev.key.toLowerCase())
  if (!k?.classList.contains('on')) return
  release(k)
  ev.stopImmediatePropagation()
}, { capture: true })
addEventListener('blur', () => byLetter.forEach(release))

// held Enter or Space on a pad, a conga or AGAIN is one hit, not one per key repeat
for (const el of $$('[data-key], [data-conga], [data-again]')) {
  el.addEventListener('keydown', (ev) => {
    if (ev.repeat && (ev.key === 'Enter' || ev.key === ' ')) ev.preventDefault()
  })
}

// the congas: struck, the shell gives a little
$$('[data-conga]').forEach((c) => {
  const go = () => {
    handsOn()
    if (!reduce) c.animate([{ transform: 'scaleY(0.97)' }, { transform: 'scaleY(1)' }], { duration: 180, easing: 'ease-out' })
    void hit(c.dataset.conga as PadSound)
  }
  c.addEventListener('pointerdown', go)
  c.addEventListener('click', (ev) => ev.detail === 0 && go())
})

// the knobs: drag up or down, arrow keys, double-click resets. setKnob is also how a sent mix arrives.
const setKnob: Partial<Record<Knob, (v: number, quiet?: boolean) => void>> = {}
$$('[data-knob]').forEach((kn) => {
  const name = kn.dataset.knob as Knob
  const set = (v: number, quiet = false) => {
    // the filter clicks to clean in the middle, so you can always find your way back
    const x = name === 'filter' && Math.abs(v - 0.5) < 0.03 ? 0.5 : clamp(v)
    kn.style.setProperty('--v', x.toFixed(3))
    kn.setAttribute('aria-valuenow', String(Math.round(x * 100)))
    track.knob(name, x)
    if (!quiet) {
      show(`${name} ${Math.round(x * 100)}`)
      handsOn()
    }
  }
  setKnob[name] = set
  const now = () => Number(kn.getAttribute('aria-valuenow')) / 100
  let drag: { y: number; v: number } | null = null
  kn.addEventListener('pointerdown', (ev) => {
    handsOn()
    drag = { y: ev.clientY, v: now() }
    capture(kn, ev)
    kn.focus({ preventScroll: true })
  })
  kn.addEventListener('pointermove', (ev) => drag && set(drag.v + (drag.y - ev.clientY) / 160))
  const up = () => (drag = null)
  kn.addEventListener('pointerup', up)
  kn.addEventListener('pointercancel', up)
  kn.addEventListener('dblclick', () => set(Number(kn.dataset.default) / 100))
  kn.addEventListener('keydown', (ev) => {
    const d = ({ ArrowUp: 0.05, ArrowRight: 0.05, ArrowDown: -0.05, ArrowLeft: -0.05, PageUp: 0.2, PageDown: -0.2 } as Record<string, number>)[ev.key]
    if (ev.key === 'Home') set(name === 'filter' ? 0.5 : 0) // the filter's home is clean
    else if (ev.key === 'End') set(1)
    else if (d) set(now() + d)
    else return
    ev.preventDefault()
  })
})

// The song plays the instruments too: the pads light with what is playing, the woofers pump with the kick.
const cones = $$('[data-cone]')
const seen = new Set<Element>()
const conesIo = new IntersectionObserver((es) => es.forEach((e) => (e.isIntersecting ? seen.add(e.target) : seen.delete(e.target))))
cones.forEach((c) => conesIo.observe(c))
const LINE_PAD: Record<string, PadSound> = Object.fromEntries((['line-0', 'line-1', 'line-4', 'line-6'] as const).map((p) => [LINES[Number(p.slice(5))].text, p]))
document.addEventListener('producer:hit', (ev) => {
  if (reduce) return
  const h = (ev as CustomEvent<{ stems: Stem[]; step: number; bar: number; line?: string }>).detail
  if (h.stems.includes('kick') && track.heard('kick')) {
    for (const c of cones) if (seen.has(c)) c.animate([{ transform: 'scale(1.06)' }, { transform: 'scale(1)' }], { duration: 150, easing: 'ease-out' })
    glow(keyFor.get('kick'), 0.5, 260)
  }
  if (h.stems.includes('snare') && track.heard('snare')) glow(keyFor.get('clap'), 0.5, 260)
  if (h.step % 16 === 0 && track.heard('keys')) glow(keyFor.get(`chord-${h.bar % 4}` as PadSound), 0.45, 900)
  if (h.line && track.heard('vox') && LINE_PAD[h.line]) glow(keyFor.get(LINE_PAD[h.line]), 0.6, 1400)
  // the light score: a dim light walks the pads one per sixteenth, so you can see where the beat is; at
  // B4 a row lights on every beat. A closed filter dims the room (you can see the filter).
  if (!padsOnScreen) return
  const f = Number($('[data-knob="filter"]')?.getAttribute('aria-valuenow') ?? 50) / 100
  const room = Math.max(0.25, f < 0.5 ? f * 2 : 1)
  const order = [...keyFor.values()]
  glow(order[h.step % 16], 0.16 * room, 160)
  if ((arranged === 'B4' || arranged === 'End') && h.step % 4 === 0) {
    const row = (h.step / 4) % 4
    order.slice(row * 4, row * 4 + 4).forEach((k) => glow(k, 0.3 * room, 380))
  }
})

// Hands off, it performs: while the reader only reads, the pads show what they can do at B4 (the robot
// sings a line on the bar's chord, the filter dips and comes back). The first touch on any instrument
// ends it for good, and the controls are theirs.
let hands = false
const handover = $('[data-handover]')
function handsOn() {
  if (hands) return
  hands = true
  if (handover) handover.textContent = 'You have the desk.'
}
document.addEventListener('producer:fader', handsOn) // a desk fader, by hand or key
document.addEventListener('producer:pan', handsOn) // or one of its knobs
let ride = 0
// It acts on the last beat of the bar before, so what it plays lands on the bar line.
document.addEventListener('producer:hit', (ev) => {
  const h = (ev as CustomEvent<{ step: number; bar: number }>).detail
  if (hands || !track.playing || !padsOnScreen || arranged !== 'B4' || h.step % 16 !== 12) return
  const b = (h.bar + 1) % 8 // the bar it plays into
  const chord = (h.bar + 1) % 4
  const flash = (sound: PadSound) => {
    if (reduce) return
    const k = keyFor.get(sound)
    k?.classList.add('on')
    window.setTimeout(() => k?.classList.remove('on'), 320)
  }
  if (b === 2) {
    // the robot sings her hook on the bar's chord, as if someone held a chord pad and hit the line
    flash(`chord-${chord}` as PadSound)
    flash('line-4')
    show('Voder')
    void track.pad('line-4', chord)
  }
  if (b === 5 && setKnob.filter && !reduce) {
    // the filter dips for two bars and comes back to where it was
    const set = setKnob.filter
    const from = Number($('[data-knob="filter"]')?.getAttribute('aria-valuenow') ?? 50) / 100
    const t0 = performance.now()
    const dur = (60000 / BPM) * 8
    cancelAnimationFrame(ride)
    const step = (t: number) => {
      if (hands || !track.playing) return set(from, true)
      const k = Math.min(1, (t - t0) / dur)
      set(Math.max(0, from - 0.32 * Math.sin(Math.PI * k)), true)
      if (k < 1) ride = requestAnimationFrame(step)
    }
    ride = requestAnimationFrame(step)
  }
})

// the monitors come up once the studio is open (B1 on), while the track plays
const monitors = $('[data-monitors]')
function writeMonitors() {
  monitors?.classList.toggle('on', track.playing && arranged >= 'B1')
}
track.watch(writeMonitors)

/* ------------------------------------------------------------------ the outro: the record ends */

// When the outro comes up, the song plays out its bar, the needle runs into the run-out groove for
// three turns, and the platter stops: the record is over as YOU ARE THE PRODUCER lands.
const outro = $('.outro')
if (outro) {
  new IntersectionObserver(([e]) => e.isIntersecting && track.finish(), { threshold: 0.5 }).observe(outro)
}

/* ------------------------------------------------------------------ the outro: press your record */

// The whole song, every stem in, at the reader's faders, rendered offline (no sound needed): a WAV,
// a sleeve with their credits on it, and a link that loads their mix for whoever opens it.
const pressGo = $<HTMLButtonElement>('[data-press-go]')
const pressOut = $('[data-press-out]')
const KNOB_ORDER: Knob[] = ['filter', 'space', 'echo', 'drive']
// the desk before it had 32 channels: links from then carry these eight, one per stem
const OLD_ORDER: Stem[] = ['kick', 'snare', 'bass', 'vox', 'keys', 'gtr', 'pad', 'fx']
// #mix=the 32 faders (the desk's order), the four knobs, then the 32 pans (50 is the middle), 0 to 100
// each; then the singer (the cassette), after a ;
const mixLink = (m: Record<Channel, number>, k: Record<Knob, number>, pan: Record<Channel, number>) =>
  `${location.origin}${location.pathname}#mix=${[...CH.map((c) => m[c]), ...KNOB_ORDER.map((n) => Math.round(k[n] * 100)), ...CH.map((c) => Math.round((pan[c] + 100) / 2))].join('-')};${voiceNow().id}`
const mb = (n: number) => `${(n / 1048576).toFixed(1)} MB`

async function sleeve(m: Record<Channel, number>) {
  const S = 1400
  const cv = document.createElement('canvas')
  cv.width = cv.height = S
  const g = cv.getContext('2d')!
  await Promise.all(['64px "EB Garamond"', 'italic 64px "EB Garamond"', '24px "Instrument Sans"'].map((f) => document.fonts.load(f)))
  g.fillStyle = '#2c4bd4'
  g.fillRect(0, 0, S, S)
  const rec = new Image()
  rec.src = (records.find((r) => r.classList.contains('record')) as HTMLImageElement | undefined)?.currentSrc || '/stories/the-producer/record-cut.webp'
  await rec.decode().catch(() => {})
  // the record, at the angle the reader left it
  g.save()
  g.translate(S / 2, S * 0.5)
  g.rotate((angle * Math.PI) / 180)
  if (rec.naturalWidth) g.drawImage(rec, -S * 0.28, -S * 0.28, S * 0.56, S * 0.56)
  g.restore()
  g.fillStyle = '#fafafa'
  g.textBaseline = 'alphabetic'
  g.font = '64px "EB Garamond"'
  g.fillText('The model is the talent.', 90, 150)
  g.fillStyle = 'rgba(250,250,250,0.72)'
  g.fillText('You are the producer.', 90, 228)
  g.font = '24px "Instrument Sans"'
  g.fillText('PRODUCED BY YOU', 90, S - 280)
  g.fillStyle = '#fafafa'
  g.font = 'italic 44px "EB Garamond"'
  // the credits wrap to two lines at most, under the label
  const said = (credit?.textContent ?? '').replace('Nothing yet.', 'Every fader as you left it.')
  const rows: string[] = []
  for (const w of said.split(' ')) {
    const last = rows[rows.length - 1]
    if (last && g.measureText(`${last} ${w}`).width <= S - 180) rows[rows.length - 1] = `${last} ${w}`
    else rows.push(w)
  }
  if (rows.length > 2) rows.splice(1, rows.length, rows.slice(1).join(' ').slice(0, 60).replace(/\s\S*$/, '…'))
  rows.forEach((row, i) => g.fillText(row, 90, S - 224 + i * 52))
  // their mix, drawn as the desk: one wide row of 32 slots, each cap where they left it
  const top = S - 138
  const low = S - 74
  CH.forEach((c, i) => {
    const x = 97 + (i * (S - 194)) / (CH.length - 1)
    g.fillStyle = 'rgba(250,250,250,0.24)'
    g.fillRect(x - 1, top, 2, low - top)
    g.fillStyle = '#fafafa'
    g.fillRect(x - 7, low - (m[c] / 100) * (low - top) - 4, 14, 8)
  })
  g.textAlign = 'right'
  g.font = '24px "Instrument Sans"'
  g.fillText(`WCGW · ${new Date().toLocaleDateString('en-GB').replaceAll('/', '.')}`, S - 90, 150)
  g.fillStyle = 'rgba(250,250,250,0.72)'
  g.fillText(`Sung by the ${voiceNow().lab} demo`, S - 90, 190)
  return new Promise<Blob>((done) => cv.toBlob((b) => done(b!), 'image/png'))
}

pressGo?.addEventListener('click', async () => {
  if (!pressOut || pressGo.getAttribute('aria-busy') === 'true') return
  const m = track.mix()
  const k = track.knobValues()
  const pan = track.panValues()
  pressGo.setAttribute('aria-busy', 'true')
  pressGo.textContent = 'Pressing…'
  pressGo.title = 'Bars of the song pressed so far, of 32. It renders in your browser, faster than it plays.'
  pressOut.textContent = 'Every stem in, at your faders. About a minute of music.'
  pressing = true
  try {
    const [wav, png] = await Promise.all([
      bounce(m, (bar, of) => (pressGo.textContent = `Pressing… bar ${bar} of ${of}`), k, pan),
      sleeve(m),
    ])
    const a = (href: string, name: string, text: string) => Object.assign(document.createElement('a'), { href, download: name, textContent: text, className: 'link' })
    const size = Object.assign(document.createElement('span'), {
      className: 'num fact',
      textContent: mb(wav.size),
      title: `The WAV’s size: 32 bars at ${BPM} BPM (about ${Math.round((32 * 4 * 60) / BPM)} seconds), 16-bit stereo at 44.1 kHz.`,
    })
    const copy = Object.assign(document.createElement('button'), { type: 'button', textContent: 'Copy the link to your mix' })
    copy.addEventListener('click', async () => {
      const url = mixLink(m, k, pan)
      try {
        await navigator.clipboard.writeText(url)
        copy.textContent = 'Link copied.'
      } catch {
        history.replaceState(null, '', url) // no clipboard: the address bar has it
        copy.textContent = 'It is in the address bar.'
      }
    })
    pressOut.replaceChildren(
      a(URL.createObjectURL(wav), 'the-producer-your-mix.wav', 'Your track'), ' ', size, ' · ',
      a(URL.createObjectURL(png), 'the-producer-your-sleeve.png', 'Your sleeve'), ' · ', copy,
    )
    pressGo.textContent = 'Press it again'
  } catch {
    pressOut.textContent = 'The press jammed. Try again.'
    pressGo.textContent = 'Press your record'
  }
  pressing = false
  pressGo.removeAttribute('title')
  pressGo.removeAttribute('aria-busy')
})

// a link to someone's mix: the track plays theirs (the desk shows it when it arrives). 32 faders, four
// knobs and 32 pans; or from before: 32 and the knobs, or eight (one a stem, set on all its channels)
const sent = /^#mix=(\d{1,3}(?:-\d{1,3})*)(?:;([a-z]+))?$/.exec(location.hash)
const sentVals = sent?.[1].split('-').map((v) => Math.min(100, Number(v))) ?? []
if (sent && [8, 12, 32, 36, 68].includes(sentVals.length)) {
  const old = sentVals.length <= 12
  // old fx was the room: it sets the hall; the channels the old desk did not have stay at my mix
  const was = (c: Channel) => (c === 'hall' ? sentVals[7] : stemOf(c) ? sentVals[OLD_ORDER.indexOf(stemOf(c)!)] : MINE[c])
  const vals = old ? CH.map(was).concat(sentVals.slice(8)) : sentVals
  const load = () => {
    const lab = slides.findIndex((s) => s.dataset.tape === sent[2])
    if (lab >= 0 && lab !== labOf(front)) goTo(N + lab, false) // their singer, in the middle copy
    const pans = vals.length === 68 ? Object.fromEntries(CH.map((c, i) => [c, vals[36 + i] * 2 - 100])) : undefined
    document.dispatchEvent(new CustomEvent('producer:load', { detail: { mix: Object.fromEntries(CH.map((c, i) => [c, vals[i]])), pans } }))
    if (vals.length >= 36) KNOB_ORDER.forEach((n, i) => setKnob[n]?.(vals[32 + i] / 100, true))
  }
  if (document.readyState === 'loading') addEventListener('DOMContentLoaded', load)
  else setTimeout(load)
}

/* ------------------------------------------------------------------ the eleven */

$$('[data-eleven]').forEach((el) => {
  // the pencil strikes it through, once
  const go = () => {
    if (el.classList.contains('loud')) return
    el.classList.add('loud')
    blip('thump')
  }
  el.addEventListener('pointerenter', go)
  el.addEventListener('focus', go)
})

// F12 is still the way to see the real thing.
console.log('%cAgain.', 'font: italic 32px Georgia, serif; color: #2c4bd4')
