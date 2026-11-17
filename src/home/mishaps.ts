/**
 * Things on the page go wrong. Each mishap breaks once its block has been written and
 * you're looking; a click patches it up (it rewinds, like an undo), the patch holds for
 * a moment, and then it breaks again: held together with chewing gum.
 */
import { bounce, fall, FRAME_MS, roll, topple, tumble, wobble } from './physics'
import { prefersReducedMotion, whenReached } from './reveal'
import { caret, wait, wrap, written } from './stream'

const PATCH_HOLDS_MS = 1300
const REWIND_SPEED = 3
const RAD = Math.PI / 180

interface Mishap {
  target: Element
  /** Calls `go` when it should first break. */
  start(go: () => void): void
  breakIt(): Promise<unknown>
  patch(): Promise<unknown>
}

const clamp01 = (n: number) => Math.min(Math.max(n, 0), 1)
const after = (ms: number) => (go: () => void) => { setTimeout(go, prefersReducedMotion() ? 0 : ms) }
/** Once the block holding `el` is written, and you're looking at it. */
const whenWritten = (el: Element, ms: number) => (go: () => void) =>
  void written(el).then(() => whenReached(el, () => after(ms)(go), 0.8))

function arm({ target, start, breakIt, patch }: Mishap): void {
  let state: 'whole' | 'breaking' | 'broken' | 'patching' = 'whole'

  const go = (): void => {
    if (document.hidden) return void document.addEventListener('visibilitychange', go, { once: true })
    state = 'breaking'
    void breakIt().then(() => {
      state = 'broken'
      target.classList.add('is-broken')
    })
  }

  target.addEventListener('click', () => {
    if (state !== 'broken') return
    state = 'patching'
    target.classList.remove('is-broken')
    void patch().then(() => {
      state = 'whole'
      setTimeout(go, PATCH_HOLDS_MS)
    })
  })

  start(go)
}

type Frame = (ms: number) => string | Keyframe

/** One linear keyframe animation per element, sampled from `frame(ms)` at 60fps. */
function film(el: Element, duration: number, frame: Frame): Animation {
  const keyframes = Array.from({ length: Math.ceil(duration / FRAME_MS) + 1 }, (_, i) => {
    const value = frame(Math.min(i * FRAME_MS, duration))
    return typeof value === 'string' ? { transform: value } : value
  })
  return el.animate(keyframes, { duration, fill: 'both', easing: 'linear' })
}

/** Breaking plays the films; patching rewinds them. */
function physical(shoot: () => Animation[]): Pick<Mishap, 'breakIt' | 'patch'> {
  let films: Animation[] = []
  const run = (rate: number) => Promise.all(films.map(film => {
    film.playbackRate = rate
    if (prefersReducedMotion()) film.finish()
    else film.play()
    return film.finished
  }))
  return {
    breakIt: () => {
      if (!films.length) films = shoot()
      return run(1)
    },
    patch: () => run(-REWIND_SPEED),
  }
}

/** Hero: "wrong?" collapses. The r falls back onto the w, the o rolls and pushes the n into the g, the g tips the ? flat. */
function wrong(word: HTMLElement): Mishap {
  const letter = (name: string) => word.querySelector(`.ch-${name}`)!
  const STRAIN_MS = 320
  const r = topple({ to: -13, height: 0.42, lean: 3 })
  const rLands = STRAIN_MS + r.contact
  const knock = wobble(-2.5)
  const o = roll(0.08, 420)
  const n = topple({ to: 11, height: 0.42, lean: 10 })
  const nStarts = rLands + 90
  const g = topple({ to: 8, height: 0.45, lean: 10 })
  const gStarts = nStarts + n.contact
  const q = topple({ to: 90, height: 0.68, lean: 7 })
  const qStarts = gStarts + g.contact
  const slump = topple({ to: 7, height: 0.45, lean: 6 })
  const slumpStarts = qStarts + q.timeTo(45)
  const end = Math.max(rLands + knock.end, qStarts + q.end, slumpStarts + slump.end)

  // The gum stretching: a shiver that grows until the r lets go.
  const strain = (ms: number) => (ms > 0 && ms < STRAIN_MS ? 1.2 * Math.sin(ms / 22) * (ms / STRAIN_MS) : 0)

  return {
    target: word,
    // A beat after the headline has been written.
    start: go => void written(word).then(() => after(1000)(go)),
    ...physical(() => [
      film(letter('w'), end, ms => `rotate(${knock.at(ms - rLands)}deg)`),
      film(letter('r'), end, ms => `rotate(${strain(ms) + r.at(ms - STRAIN_MS)}deg)`),
      film(letter('o'), end, ms => {
        const x = o.at(ms - rLands)
        return `translateX(${x}em) rotate(${x / 0.22 / RAD}deg)`
      }),
      film(letter('n'), end, ms => `translateX(${o.at(ms - rLands)}em) rotate(${n.at(ms - nStarts)}deg)`),
      film(letter('g'), end, ms => `rotate(${g.at(ms - gStarts) + slump.at(ms - slumpStarts)}deg)`),
      // On a slick floor the base slides back as it topples, so the ? lands at the g's feet.
      film(letter('q'), end, ms => {
        const angle = q.at(ms - qStarts)
        return `translateX(${-0.2 * Math.sin(angle * RAD)}em) rotate(${angle}deg)`
      }),
    ]),
  }
}

/**
 * Act one: the writer gets stuck in a loop and runs out of tokens mid-word.
 * The first loop is written by the stream itself; a patch deletes it, then it loops again.
 */
function loop(paragraph: HTMLElement): Mishap {
  const span = paragraph.querySelector('[data-loop]')!
  let tokens = [...span.querySelectorAll<HTMLElement>('.tok')]
  if (!tokens.length) {
    tokens = wrap(span).filter((piece): piece is HTMLElement => piece instanceof HTMLElement)
    tokens.forEach(token => token.classList.add('is-in'))
  }
  const cursor = caret()

  return {
    target: paragraph,
    start: go => void written(paragraph).then(go),
    breakIt: async () => {
      if (!tokens.some(token => token.hidden)) return
      tokens[0].before(cursor)
      cursor.classList.add('is-typing')
      await wait(400)
      for (const token of tokens) {
        token.hidden = false
        token.after(cursor)
        await wait(40 + Math.random() * 90)
      }
      cursor.classList.remove('is-typing')
      await wait(1200)
      cursor.remove()
    },
    patch: async () => {
      for (const token of [...tokens].reverse()) {
        token.hidden = true
        await wait(22)
      }
    },
  }
}

/** Act three: the "Taste Files" row (not built yet, not load-bearing) comes loose at one end, then slips again. */
function looseRow(row: HTMLElement): Mishap {
  const first = topple({ to: 2.5, height: 2.5, lean: 40 })
  const slipStarts = first.end + 700
  const second = topple({ to: 3, height: 2.5, lean: 30 })
  const end = slipStarts + second.end
  return {
    target: row,
    start: whenWritten(row, 700),
    ...physical(() => [film(row, end, ms => `rotate(${first.at(ms) + second.at(ms - slipStarts)}deg)`)]),
  }
}

/**
 * Vital signs: "Optimist with backups." tips off its row and lands on the paragraph
 * below, where it stays. The backups never come.
 */
function fallsOff(line: HTMLElement): Mishap {
  const SHIVER_MS = 350
  const TILT_DEG = 14
  const REST_DEG = 2
  const DRIFT_EM = 0.35
  const tilt = topple({ to: TILT_DEG, height: 1.1, lean: 25 })
  const fallStarts = SHIVER_MS + tilt.end + 200
  const shiver = (ms: number) => (ms > 0 && ms < SHIVER_MS ? 0.7 * Math.sin(ms / 18) * (ms / SHIVER_MS) : 0)

  return {
    target: line,
    start: whenWritten(line, 900),
    ...physical(() => {
      // Measured before it moves: the drop onto the top of the paragraph's first line.
      const below = line.closest('dl')?.nextElementSibling
      const em = parseFloat(getComputedStyle(line).fontSize)
      const drop = below ? (below.getBoundingClientRect().top - line.getBoundingClientRect().bottom) / em + 0.25 : 2
      const land = bounce(drop, 0.3)
      const hits = fallStarts + fall(drop).end
      const thud = wobble(0.1, 9, 9)
      const end = Math.max(fallStarts + land.end, hits + thud.end)

      const films = [film(line, end, ms => {
        const y = drop - land.at(ms - fallStarts)
        const landed = clamp01(y / drop)
        const angle = shiver(ms) + tilt.at(ms - SHIVER_MS) * (1 - landed) + REST_DEG * landed
        return `translate(${DRIFT_EM * landed}em, ${y}em) rotate(${angle}deg)`
      })]
      // The paragraph takes the hit.
      if (below) films.push(film(below, end, ms => `translateY(${thud.at(ms - hits)}em)`))
      return films
    }),
  }
}

/** Act four: the name comes out mis-encoded. A click fixes it; the fix doesn't hold. */
function mojibake(name: HTMLElement): Mishap {
  const BROKEN = name.textContent ?? ''
  const FIXED = name.dataset.moji ?? ''
  return {
    target: name,
    start: go => void written(name).then(go),
    breakIt: async () => {
      if (name.textContent === BROKEN) return
      for (let i = 0; i < 5; i++) {
        name.textContent = i % 2 ? FIXED : BROKEN
        await wait(70)
      }
      name.textContent = BROKEN
    },
    patch: async () => {
      while (name.textContent!.length > FIXED.length - 1) {
        name.textContent = name.textContent!.slice(0, -1)
        await wait(45)
      }
      name.textContent = FIXED
    },
  }
}

/** Switch away and the tab says what everyone fears. */
function tabTitle(): void {
  const title = document.title
  document.addEventListener('visibilitychange', () => {
    document.title = document.hidden ? 'Something went wrong · WCGW' : title
  })
}

/** Last divider: the × eye comes loose and tumbles away. */
function looseEye(eye: SVGElement): Mishap {
  const tumbling = tumble({ spin: 1400, size: 0.6, restitution: 0.75 })
  return {
    target: eye,
    start: go => whenReached(eye, () => after(600)(go), 0.75),
    ...physical(() => {
      const size = eye.getBoundingClientRect().width
      const { x, y, angle, end } = tumbling
      return [film(eye, end, ms => `translate(${x.at(ms) * size}px, ${-y.at(ms) * size}px) rotate(${angle.at(ms)}deg)`)]
    }),
  }
}

export function initMishaps(): void {
  const find = <T extends Element>(selector: string) => document.querySelector<T>(selector)
  const word = find<HTMLElement>('[data-wrong]')
  const paragraph = find('[data-loop]')?.closest('p')
  const row = find<HTMLElement>('[data-loose-row]')
  const line = find<HTMLElement>('[data-falls]')
  const name = find<HTMLElement>('[data-moji]')
  const eye = find<SVGElement>('[data-loose]')

  if (word) arm(wrong(word))
  if (paragraph) arm(loop(paragraph))
  if (row) arm(looseRow(row))
  if (line) arm(fallsOff(line))
  if (name) arm(mojibake(name))
  if (eye) arm(looseEye(eye))
  tabTitle()
}
