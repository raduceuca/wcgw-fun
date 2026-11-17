/**
 * Act two: the professional no as a small whack-a-mole of yesses.
 * Ported from reference-index-v4 into a typed module. Uses the portrait + SVG
 * mallet (face-sheet webps are not in-repo).
 */
import { prefersReducedMotion } from './reveal'

const BAD = [
  'Add AI to the settings page',
  'Make the logo pop',
  'Dark mode for the invoice',
  'A chatbot for the chatbot',
  'Can it feel more premium',
  'Pivot to agents',
  'Gamify the cancel button',
  'Ship it on Friday',
  'A waitlist for the waitlist',
  'One more onboarding step',
  'Confetti on every click',
  'Make the button bigger',
  'Rewrite it in a new framework',
  'An AI summary of the summary',
  'Let the agent pick the font',
  'Ten more dashboards',
  'Make it go viral',
  'Add a sparkle icon',
  'Just one more modal',
  'Vibe code the payroll',
]
const GOOD = ['Delete the onboarding', 'Ship the boring fix first', 'Ask a user', 'Make it faster']
const GOOD_AT = [4, 10, 15, 21]

const lc = (t: string) => t.charAt(0).toLowerCase() + t.slice(1)
const rnd = (a: number, b: number) => a + Math.random() * (b - a)
function shuffle<T>(a: T[]): T[] {
  const out = a.slice()
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

type Token = {
  el: HTMLButtonElement
  hole: HTMLElement
  text: string
  good: boolean
  state: 'up' | 'aimed' | 'gone' | 'kept'
  job?: { t: number; fn: () => void; dead?: boolean }
}

export function initMole(): void {
  const nope = document.getElementById('nope')
  if (!nope) return

  const field = nope.querySelector<HTMLElement>('.field')
  const holes = [...nope.querySelectorAll<HTMLElement>('.hole')]
  const radu = nope.querySelector<HTMLElement>('.radu')
  const mallet = nope.querySelector<HTMLElement>('.mallet')
  const binned = document.getElementById('binned')
  const kept = document.getElementById('kept')
  const tally = document.getElementById('tally')
  const again = document.getElementById('again') as HTMLButtonElement | null
  const soundBtn = document.getElementById('sound') as HTMLButtonElement | null
  const tpl = document.getElementById('mascot') as HTMLTemplateElement | null
  if (!field || !radu || !mallet || !binned || !kept || !tally || !tpl) return

  if ('IntersectionObserver' in window) {
    const nio = new IntersectionObserver(
      (es) => {
        if (es[0]?.isIntersecting) {
          nope.classList.add('near')
          nio.disconnect()
        }
      },
      { rootMargin: '700px 0px' },
    )
    nio.observe(nope)
  } else {
    nope.classList.add('near')
  }

  const still = matchMedia('(prefers-reduced-motion: reduce)')
  if (still.matches || !('IntersectionObserver' in window) || !Element.prototype.animate) {
    return
  }

  let now = 0
  let last = 0
  let running = false
  let visible = false
  let raf = 0
  let jobs: { t: number; fn: () => void; dead?: boolean }[] = []

  const at = (delay: number, fn: () => void) => {
    const j = { t: now + delay, fn }
    jobs.push(j)
    return j
  }
  const cancel = (j?: { dead?: boolean }) => {
    if (j) j.dead = true
  }
  const frame = (ts: number) => {
    raf = 0
    if (!running) return
    if (last) now += Math.min(ts - last, 100)
    last = ts
    const due = jobs.filter((j) => !j.dead && j.t <= now)
    jobs = jobs.filter((j) => !j.dead && j.t > now)
    due.forEach((j) => j.fn())
    raf = requestAnimationFrame(frame)
  }
  const resume = () => {
    if (running || state !== 'play') return
    running = true
    last = 0
    raf = requestAnimationFrame(frame)
  }
  const pause = () => {
    running = false
    if (raf) cancelAnimationFrame(raf)
    raf = 0
  }

  const moods = [...nope.querySelectorAll<HTMLElement>('[data-mood]')]
  let holdJob: { dead?: boolean } | null = null
  let held: string | null = null
  const sideFaces = ['side-eye', 'skeptical', 'meh']
  let sideI = 0
  let side = 'side-eye'

  const show = (f: string) => {
    moods.forEach((m) => m.classList.toggle('on', m.dataset.mood === f))
    radu.dataset.mood = f
  }
  const mood = () => {
    if (held) return
    const live = tokens.filter((t) => t.state === 'up')
    if (live.some((t) => t.good)) show('thinking')
    else if (live.length) show(side)
    else show('deadpan')
  }
  const hold = (f: string, ms: number) => {
    cancel(holdJob ?? undefined)
    held = f
    show(f)
    holdJob = at(ms, () => {
      held = null
      mood()
    })
  }

  let ctx: AudioContext | null = null
  let sound = false
  const thump = (hi: boolean) => {
    if (!sound) return
    try {
      ctx = ctx || new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
      const o = ctx.createOscillator()
      const g = ctx.createGain()
      const t = ctx.currentTime
      o.type = 'sine'
      o.frequency.setValueAtTime(hi ? 660 : 150, t)
      o.frequency.exponentialRampToValueAtTime(hi ? 880 : 55, t + (hi ? 0.12 : 0.16))
      g.gain.setValueAtTime(0.0001, t)
      g.gain.exponentialRampToValueAtTime(hi ? 0.05 : 0.16, t + 0.008)
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22)
      o.connect(g).connect(ctx.destination)
      o.start(t)
      o.stop(t + 0.25)
    } catch {
      /* ignore */
    }
  }
  soundBtn?.addEventListener('click', () => {
    sound = !sound
    soundBtn.setAttribute('aria-pressed', String(sound))
    soundBtn.textContent = sound ? 'Sound on' : 'Sound off'
    thump(true)
  })

  const box = (el: HTMLElement) => {
    const a = el.getBoundingClientRect()
    const f = field.getBoundingClientRect()
    return { x: a.left - f.left, y: a.top - f.top, w: a.width, h: a.height }
  }
  const mh = () => mallet.offsetHeight
  const tf = (gx: number, gy: number, deg: number) => {
    const h = mh()
    const w = mallet.offsetWidth
    return `translate(${(gx - w * 0.5).toFixed(1)}px,${(gy - h * 0.57).toFixed(1)}px) rotate(${deg}deg)`
  }
  const rest = () => {
    const r = box(radu)
    return tf(r.x - r.w * 0.02, r.y + r.h * 0.74, -14)
  }
  const park = () => {
    mallet.style.transform = rest()
  }

  let busy = false
  const queue: [Token, () => void][] = []
  const strike = (t: Token, cb: () => void) => {
    if (busy) {
      queue.push([t, cb])
      return
    }
    busy = true
    const mascot = t.el.querySelector('.mascot') as HTMLElement | null
    if (!mascot) {
      busy = false
      cb()
      return
    }
    const m = box(mascot)
    const r = mh() * 0.445
    const a = (-80 * Math.PI) / 180
    const tx = m.x + m.w * 0.5
    const ty = m.y + m.h * 0.2
    const gx = tx - r * Math.sin(a)
    const gy = ty + r * Math.cos(a)
    const anim = mallet.animate(
      [
        { transform: rest(), opacity: 0, easing: 'cubic-bezier(.3,.7,.3,1)' },
        { opacity: 1, offset: 0.18 },
        { transform: tf(gx + 6, gy - 10, -8), offset: 0.5, easing: 'cubic-bezier(.6,0,.9,.5)' },
        { transform: tf(gx, gy, -80), offset: 0.66 },
        { transform: tf(gx, gy, -71), offset: 0.74 },
        { transform: tf(gx, gy, -77), opacity: 1, offset: 0.82 },
        { transform: rest(), opacity: 0 },
      ],
      { duration: 820 },
    )
    window.setTimeout(() => cb(), 820 * 0.66)
    anim.onfinish = () => {
      busy = false
      while (queue.length) {
        const n = queue.shift()
        if (!n) break
        if (n[0].state === 'up' || n[0].state === 'aimed') {
          strike(n[0], n[1])
          return
        }
      }
    }
  }

  let tokens: Token[] = []
  let order: { text: string; good: boolean }[] = []
  let idx = 0
  let squashed = 0
  let keptN = 0
  let binList: string[] = []
  let keepList: string[] = []
  let state: 'idle' | 'play' | 'end' = 'idle'

  const freeHole = () => {
    const free = holes.filter((h) => !h.firstChild)
    return free.length ? free[Math.floor(Math.random() * free.length)] : null
  }

  const list = (a: string[], strikeHtml: boolean) =>
    a.map((x, i) => {
      const c = i === a.length - 1 ? ' class="fresh"' : ''
      return strikeHtml ? `<s${c}>${lc(x)}</s>` : `<span${c}>${lc(x)}</span>`
    })

  const render = (which?: 'bin' | 'keep') => {
    if (which !== 'keep') {
      binned.innerHTML = 'Binned: ' + (binList.length ? list(binList, true).join(', ') + '.' : 'nothing yet.')
    }
    if (which !== 'bin') {
      const k = list(keepList, false)
      if (k.length > 1) k[k.length - 1] = 'and ' + k[k.length - 1]
      kept.innerHTML = 'Kept: ' + (k.length ? (k.length === 2 ? k.join(' ') : k.join(', ')) + '.' : 'nothing yet.')
    }
    tally.innerHTML = `<span class="num">${squashed}</span> squashed, <span class="num">${keptN}</span> kept`
  }

  const leave = (t: Token, how: 'keep' | 'squash') => {
    const wasFocused = document.activeElement === t.el
    t.el
      .animate(
        how === 'keep'
          ? [
              { transform: 'translateY(0)', opacity: 1 },
              { transform: 'translateY(-60%)', opacity: 0 },
            ]
          : [{ transform: 'translateY(0)' }, { transform: 'translateY(0)', offset: 0.55 }, { transform: 'translateY(120%)' }],
        { duration: how === 'keep' ? 700 : 900, easing: 'cubic-bezier(.5,0,.6,1)', fill: 'forwards' },
      ).onfinish = () => {
      t.el.remove()
      tokens = tokens.filter((x) => x !== t)
      if (wasFocused || document.activeElement === document.body) {
        const next = tokens.find((x) => x.state === 'up')
        if (wasFocused) (next ? next.el : field).focus({ preventScroll: true })
      }
      mood()
      check()
    }
  }

  const squash = (t: Token) => {
    if (t.state === 'gone' || t.state === 'kept') return
    t.state = 'gone'
    cancel(t.job)
    t.el.classList.add('squashed')
    t.el.setAttribute('aria-label', `${t.text}, squashed.`)
    thump(false)
    field.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(1.5px)' }, { transform: 'translateY(0)' }], { duration: 140 })
    squashed++
    binList.push(t.text)
    render('bin')
    hold('grin', 700)
    leave(t, 'squash')
  }

  const keep = (t: Token, byReader: boolean) => {
    if (t.state !== 'up') return
    t.state = 'kept'
    cancel(t.job)
    t.el.classList.add('kept')
    thump(true)
    keptN++
    keepList.push(t.text)
    render('keep')
    hold(byReader ? 'grin' : 'thinking', byReader ? 900 : 700)
    leave(t, 'keep')
  }

  const reader = (t: Token) => {
    if (t.state !== 'up' || state !== 'play') return
    cancel(t.job)
    if (t.good) keep(t, true)
    else {
      t.state = 'aimed'
      strike(t, () => squash(t))
    }
  }

  const spawn = () => {
    if (idx >= order.length) return
    const hole = freeHole()
    if (!hole) {
      at(400, spawn)
      return
    }
    const it = order[idx++]
    const b = document.createElement('button')
    b.type = 'button'
    b.className = 'yes'
    b.appendChild(tpl.content.firstElementChild!.cloneNode(true))
    const s = document.createElement('span')
    s.className = 't'
    s.textContent = it.text
    b.appendChild(s)
    b.setAttribute('aria-label', `Idea: ${it.text}. Press to ${it.good ? 'keep.' : 'squash.'}`)
    hole.appendChild(b)
    const room = hole.clientWidth - b.offsetWidth - 4
    b.style.left = `${Math.max(0, Math.round(Math.random() * room))}px`
    const t: Token = { el: b, hole, text: it.text, good: it.good, state: 'up' }
    tokens.push(t)
    b.animate([{ transform: 'translateY(115%)' }, { transform: 'translateY(0)' }], {
      duration: 380,
      easing: 'cubic-bezier(.2,.9,.3,1.25)',
      fill: 'forwards',
    })
    b.addEventListener('click', (e) => {
      e.preventDefault()
      reader(t)
    })
    if (field.contains(document.activeElement) && !document.activeElement?.classList.contains('yes')) {
      b.focus({ preventScroll: true })
    }
    if (it.good) {
      hold('surprised', 900)
      t.job = at(rnd(2600, 3100), () => keep(t, false))
    } else {
      if (!held) {
        side = sideFaces[sideI++ % 3]
        mood()
      }
      t.job = at(rnd(1700, 2500), () => {
        if (t.state === 'up') {
          t.state = 'aimed'
          strike(t, () => squash(t))
        }
      })
    }
    if (idx < order.length) at(Math.max(780, 1250 - idx * 18) + rnd(-120, 160), spawn)
  }

  const check = () => {
    if (state !== 'play' || idx < order.length || tokens.length) return
    state = 'end'
    at(300, () => hold('big-laugh', 1500))
    at(1700, () => {
      nope.classList.add('done')
      tally.innerHTML = `That was one week. <span class="num">${squashed}</span> squashed, <span class="num">${keptN}</span> kept.`
      if (again) again.hidden = false
      pause()
    })
  }

  const start = () => {
    order = shuffle(BAD).map((t) => ({ text: t, good: false }))
    GOOD.forEach((g, i) => {
      order.splice(GOOD_AT[i], 0, { text: g, good: true })
    })
    idx = 0
    squashed = 0
    keptN = 0
    binList = []
    keepList = []
    tokens = []
    jobs = []
    queue.length = 0
    busy = false
    held = null
    holes.forEach((h) => {
      h.textContent = ''
    })
    render()
    nope.classList.remove('done')
    if (again) again.hidden = true
    show('deadpan')
    park()
    state = 'play'
    now = 0
    at(700, spawn)
    if (visible && !document.hidden) resume()
  }

  again?.addEventListener('click', () => {
    start()
    field.focus({ preventScroll: true })
  })

  nope.classList.add('play')
  binned.textContent = 'Binned: nothing yet.'
  kept.textContent = 'Kept: nothing yet.'
  let begun = false
  new IntersectionObserver(
    (es) => {
      visible = (es[0]?.intersectionRatio ?? 0) >= 0.55
      if (visible && !begun) {
        begun = true
        start()
      } else if (visible) resume()
      else pause()
    },
    { threshold: [0, 0.55, 1] },
  ).observe(field)

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) pause()
    else if (visible) resume()
  })
  addEventListener('resize', () => {
    if (!busy) park()
  })
  still.addEventListener?.('change', (e) => {
    if (e.matches) {
      pause()
      nope.classList.remove('play')
    }
  })

  if (prefersReducedMotion()) {
    pause()
    nope.classList.remove('play')
  }
}
