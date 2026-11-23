/* The producer: everything that moves on /stories/the-producer.

   One loop (requestAnimationFrame) does three things:
   1. Writes --p (0 → 1 while an element passes through the viewport) and --e (0 → 1 while it enters)
      onto every [data-p] element that is near the screen. CSS turns those into motion.
   2. Turns the records: a slow idle spin, plus scroll speed, plus whatever the hand does (scratching).
   3. Runs the now-playing bar: current track, progress, elapsed reading time.
   Everything else listens for one moment (IntersectionObserver) or one gesture.
   With prefers-reduced-motion: no scroll-linked motion, no idle spin. Every interaction still works. */

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
const fine = matchMedia('(pointer: fine)').matches
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const $$ = <T extends Element = HTMLElement>(s: string, el: ParentNode = document) => [...el.querySelectorAll<T>(s)] as T[]
const $ = <T extends Element = HTMLElement>(s: string, el: ParentNode = document) => el.querySelector<T>(s)

/* ------------------------------------------------------------------ produced by you: the reader's own credits */

const made = { takes: 0, faders: new Set<string>(), scratches: 0, swings: 0 }
const credit = $('[data-credit]')
function writeCredit() {
  if (!credit) return
  const parts = ([
    [made.takes, 'take', 'takes'],
    [made.faders.size, 'fader', 'faders'],
    [made.scratches, 'scratch', 'scratches'],
    [made.swings, 'mic swing', 'mic swings'],
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
function credited(kind: 'takes' | 'scratches' | 'swings') {
  made[kind] += 1
  writeCredit()
}
function creditFader(name = '') {
  if (made.faders.has(name)) return
  made.faders.add(name)
  writeCredit()
}

/* ------------------------------------------------------------------ sound (off until asked) */

let audio: AudioContext | null = null
let soundOn = false
let noise: AudioBuffer | null = null
let scratchGain: GainNode | null = null
let crackleGain: GainNode | null = null

function ensureAudio() {
  if (audio) return audio
  audio = new AudioContext()
  const len = audio.sampleRate * 2
  noise = audio.createBuffer(1, len, audio.sampleRate)
  const d = noise.getChannelData(0)
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1

  // the scratch: band-passed noise whose level follows the record's speed under the hand
  const src = audio.createBufferSource()
  src.buffer = noise
  src.loop = true
  const bp = audio.createBiquadFilter()
  bp.type = 'bandpass'
  bp.frequency.value = 1400
  bp.Q.value = 0.8
  scratchGain = audio.createGain()
  scratchGain.gain.value = 0
  src.connect(bp).connect(scratchGain).connect(audio.destination)
  src.start()

  // vinyl crackle: sparse clicks, very quiet
  const crackle = audio.createBuffer(1, audio.sampleRate * 3, audio.sampleRate)
  const c = crackle.getChannelData(0)
  for (let i = 0; i < c.length; i++) c[i] = Math.random() < 0.0009 ? (Math.random() * 2 - 1) * 0.9 : (Math.random() * 2 - 1) * 0.012
  const cs = audio.createBufferSource()
  cs.buffer = crackle
  cs.loop = true
  const hp = audio.createBiquadFilter()
  hp.type = 'highpass'
  hp.frequency.value = 900
  crackleGain = audio.createGain()
  crackleGain.gain.value = 0
  cs.connect(hp).connect(crackleGain).connect(audio.destination)
  cs.start()
  return audio
}

/** A short percussive sound: a click (the AGAIN button), a tick (a fader), a thump (a record landing). */
function blip(kind: 'click' | 'tick' | 'thump') {
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
  f.frequency.value = kind === 'click' ? 2600 : 5200
  f.Q.value = kind === 'click' ? 3 : 8
  const g = audio.createGain()
  const level = kind === 'click' ? 0.9 : 0.25
  g.gain.setValueAtTime(level, t)
  g.gain.exponentialRampToValueAtTime(0.001, t + (kind === 'click' ? 0.06 : 0.025))
  s.connect(f).connect(g).connect(audio.destination)
  s.start(t, Math.random())
  s.stop(t + 0.08)
  if (kind === 'click') blipLow(t)
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

const soundBtn = $<HTMLButtonElement>('[data-sound]')
soundBtn?.addEventListener('click', async () => {
  soundOn = !soundOn
  if (soundOn) await ensureAudio().resume()
  soundBtn.setAttribute('aria-pressed', String(soundOn))
  soundBtn.textContent = soundOn ? 'Sound on' : 'Sound off'
  if (soundOn) blip('thump')
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

const angleAt = (el: HTMLElement, x: number, y: number) => {
  const r = el.getBoundingClientRect()
  return (Math.atan2(y - (r.top + r.height / 2), x - (r.left + r.width / 2)) * 180) / Math.PI
}
records.forEach((rec) => {
  rec.addEventListener('pointerdown', (ev) => {
    held = { el: rec, last: angleAt(rec, ev.clientX, ev.clientY), moved: 0 }
    rec.setPointerCapture(ev.pointerId)
    rec.classList.add('held')
    if (soundOn && crackleGain && audio) crackleGain.gain.setTargetAtTime(0.25, audio.currentTime, 0.1)
  })
  rec.addEventListener('pointermove', (ev) => {
    if (!held || held.el !== rec) return
    const a = angleAt(rec, ev.clientX, ev.clientY)
    let d = a - held.last
    if (d > 180) d -= 360
    if (d < -180) d += 360
    held.last = a
    held.moved += Math.abs(d)
    angle += d
    spin = d
  })
  const drop = () => {
    if (held && held.moved > 30) credited('scratches') // a tap is not a scratch
    held = null
    rec.classList.remove('held')
  }
  rec.addEventListener('pointerup', drop)
  rec.addEventListener('pointercancel', drop)
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
function writeBar() {
  const doc = document.documentElement
  const prog = clamp(scrollY / (doc.scrollHeight - innerHeight))
  if (nowFill) nowFill.style.transform = `scaleX(${prog.toFixed(4)})`
  if (nowTime) nowTime.textContent = `${fmt(prog * total)} / ${fmt(total)}`
  let pick: HTMLElement | null = null
  for (const t of tracks) if (t.getBoundingClientRect().top < innerHeight * 0.45) pick = t
  const id = pick?.dataset.track ?? ''
  if (id !== current && pick) {
    current = id
    if (nowCode) nowCode.textContent = pick.dataset.track ?? ''
    if (nowTitle) nowTitle.textContent = pick.dataset.title ?? ''
    $$('.tracks a').forEach((a) => a.classList.toggle('playing', a.getAttribute('href') === `#${pick?.id}`))
  }
}

/* ------------------------------------------------------------------ the loop */

function frame() {
  const y = scrollY
  scrollVel = scrollVel * 0.85 + (y - lastY) * 0.15
  lastY = y
  if (!reduce) writeProgress()
  if (!held) {
    spin *= 0.92
    angle += (reduce ? 0 : 0.12) + scrollVel * 0.35 + spin
  }
  const turn = `${angle.toFixed(2)}deg`
  records.forEach((r) => (r.style.rotate = turn))
  if (soundOn && scratchGain && audio) {
    const v = Math.min(1, Math.abs(held ? spin : 0) / 14)
    scratchGain.gain.setTargetAtTime(v * 0.5, audio.currentTime, 0.03)
    if (!held && crackleGain) crackleGain.gain.setTargetAtTime(0.06, audio.currentTime, 0.3)
  }
  writeBar()
  requestAnimationFrame(frame)
}
requestAnimationFrame(frame)

/* ------------------------------------------------------------------ tilt: every print answers the hand */

if (fine && !reduce) {
  $$('[data-tilt]').forEach((el) => {
    const img = $('img', el) ?? el
    el.addEventListener('pointermove', (ev) => {
      const r = el.getBoundingClientRect()
      const x = (ev.clientX - r.left) / r.width - 0.5
      const y = (ev.clientY - r.top) / r.height - 0.5
      img.style.setProperty('--tx', `${(-y * 7).toFixed(2)}deg`)
      img.style.setProperty('--ty', `${(x * 9).toFixed(2)}deg`)
    })
    el.addEventListener('pointerleave', () => {
      img.style.setProperty('--tx', '0deg')
      img.style.setProperty('--ty', '0deg')
    })
  })
}

/* ------------------------------------------------------------------ A2: the mic swings when it lands, and when touched */

const mic = $('[data-mic]')
const swing = () => {
  if (reduce || !mic) return
  mic.animate(
    [{ rotate: '5deg' }, { rotate: '-3.6deg' }, { rotate: '2.4deg' }, { rotate: '-1.4deg' }, { rotate: '0.6deg' }, { rotate: '0deg' }],
    { duration: 2600, easing: 'ease-out' },
  )
}
let lastTouch = 0
const touch = () => {
  // hover and tap can both fire for one touch; count it once
  const now = performance.now()
  if (now - lastTouch > 1200) credited('swings')
  lastTouch = now
  swing()
}
mic?.closest('[data-in]')?.addEventListener('in', () => setTimeout(swing, 350))
mic?.addEventListener('pointerenter', touch)
mic?.addEventListener('click', touch)
mic?.addEventListener('keydown', (ev) => {
  if (ev.key !== 'Enter' && ev.key !== ' ') return
  ev.preventDefault()
  touch()
})

/* ------------------------------------------------------------------ A3: the AGAIN button works */

const againBtn = $<HTMLButtonElement>('[data-again]')
const againImg = $('[data-again-img]')
const takeN = $('[data-take-n]')
const takeLine = $('[data-take-line]')
const lines = ['Again.', 'Again, but like you mean it.', 'Again. Slower.', 'Again. Less polite.', 'Again. From the top.', 'That one.']
let take = 0
function pressAgain() {
  if (!againBtn || againBtn.disabled) return
  take += 1
  credited('takes')
  blip('click')
  againImg?.animate(
    [{ scale: '1', translate: '0 0' }, { scale: '0.975', translate: '0 0.4%' }, { scale: '1', translate: '0 0' }],
    { duration: 220, easing: 'cubic-bezier(.3,.7,.4,1)' },
  )
  const line = lines[Math.min(take, lines.length) - 1]
  if (takeN) takeN.textContent = String(take)
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
      if (takeN) takeN.textContent = '0'
      if (takeLine) takeLine.textContent = 'Press it.'
    }, 3200)
  }
}
againBtn?.addEventListener('click', pressAgain)
addEventListener('keydown', (ev) => {
  if (ev.key.toLowerCase() !== 'a' || ev.metaKey || ev.ctrlKey || ev.altKey) return
  if ((ev.target as HTMLElement).closest('input, textarea, [contenteditable]')) return
  const r = againBtn?.getBoundingClientRect()
  if (r && r.top < innerHeight && r.bottom > 0) pressAgain()
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

/* ------------------------------------------------------------------ B2: your turn at the desk */

const desk = $('[data-desk]')
if (desk) {
  const note = $('[data-desk-note]', desk)
  const faders = $$('[data-fader]', desk)
  const set = (f: HTMLElement, v: number) => {
    const val = Math.round(clamp(v, 0, 100))
    f.style.setProperty('--v', String(val / 100))
    f.setAttribute('aria-valuenow', String(val))
    f.setAttribute('aria-valuetext', `${f.dataset.name} at ${val}`)
  }
  let noteTimer = 0
  const tooLoud = (f: HTMLElement) => {
    f.classList.remove('shake')
    void f.offsetWidth
    f.classList.add('shake')
    const allUp = faders.every((x) => Number(x.getAttribute('aria-valuenow')) >= 90)
    if (note) {
      note.textContent = allUp ? 'Everything is loud. So nothing is.' : 'Louder was never the point.'
      note.classList.add('on')
      clearTimeout(noteTimer)
      noteTimer = window.setTimeout(() => note.classList.remove('on'), 2400)
    }
    setTimeout(() => recall(f), 650)
  }
  const recall = (f: HTMLElement, delay = 0) => {
    const from = Number(f.getAttribute('aria-valuenow'))
    const to = Number(f.dataset.mix)
    if (reduce) return set(f, to)
    const t0 = performance.now() + delay
    const step = (t: number) => {
      const k = clamp((t - t0) / 900)
      const ease = 1 - Math.pow(1 - k, 4)
      set(f, from + (to - from) * ease)
      if (k < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }
  faders.forEach((f) => {
    set(f, 0)
    const slot = $('.slot', f) ?? f
    let dragging = false
    let lastTick = 0
    const fromPointer = (y: number) => {
      const r = slot.getBoundingClientRect()
      return (1 - (y - r.top) / r.height) * 100
    }
    const move = (v: number) => {
      set(f, v)
      creditFader(f.dataset.name)
      const now = performance.now()
      if (now - lastTick > 45) {
        blip('tick')
        lastTick = now
      }
    }
    f.addEventListener('pointerdown', (ev) => {
      dragging = true
      f.setPointerCapture(ev.pointerId)
      move(fromPointer(ev.clientY))
    })
    f.addEventListener('pointermove', (ev) => dragging && move(fromPointer(ev.clientY)))
    const up = () => {
      if (!dragging) return
      dragging = false
      if (Number(f.getAttribute('aria-valuenow')) >= 96) tooLoud(f)
    }
    f.addEventListener('pointerup', up)
    f.addEventListener('pointercancel', up)
    f.addEventListener('keydown', (ev) => {
      const v = Number(f.getAttribute('aria-valuenow'))
      const d = { ArrowUp: 5, ArrowRight: 5, ArrowDown: -5, ArrowLeft: -5, PageUp: 20, PageDown: -20 }[ev.key]
      if (ev.key === 'Home') move(0)
      else if (ev.key === 'End') move(100)
      else if (d) move(v + d)
      else return
      ev.preventDefault()
      if (Number(f.getAttribute('aria-valuenow')) >= 96) tooLoud(f)
    })
  })
  // motorised recall: the desk loads the mix when it comes into view
  desk.addEventListener('in', () => faders.forEach((f, i) => recall(f, i * 90)))
}

/* ------------------------------------------------------------------ B3: the before/after line sweeps once */

$$<HTMLElement>('[data-cmp]').forEach((cmp) => {
  const range = $<HTMLInputElement>('input', cmp)
  if (!range) return
  const set = () => cmp.style.setProperty('--x', `${range.value}%`)
  range.addEventListener('input', set)
  set()
  if (reduce) return
  const host = cmp.closest('[data-in]')
  host?.addEventListener('in', () => {
    const keys = [50, 14, 86, 50]
    const t0 = performance.now()
    const dur = 2400
    const step = (t: number) => {
      const k = clamp((t - t0) / dur)
      const seg = Math.min(keys.length - 2, Math.floor(k * (keys.length - 1)))
      const local = k * (keys.length - 1) - seg
      const e = local < 0.5 ? 2 * local * local : 1 - Math.pow(-2 * local + 2, 2) / 2
      range.value = String(keys[seg] + (keys[seg + 1] - keys[seg]) * e)
      set()
      if (k < 1) requestAnimationFrame(step)
    }
    setTimeout(() => requestAnimationFrame(step), 300)
  })
})

/* ------------------------------------------------------------------ the eleven */

$$('[data-eleven]').forEach((el) => {
  const go = () => {
    el.classList.remove('loud')
    void el.offsetWidth
    el.classList.add('loud')
    blip('thump')
  }
  el.addEventListener('pointerenter', go)
  el.addEventListener('focus', go)
})

// F12 is still the way to see the real thing.
console.log('%cAgain.', 'font: italic 32px Georgia, serif; color: #2c4bd4')
