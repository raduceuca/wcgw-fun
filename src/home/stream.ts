/**
 * The page arrives the way an agent writes: token streaming. One writer goes down the
 * page in reading order. It waits for you to reach a block, writes it a few words at a
 * time with a caret riding the end, and shows anything you've already scrolled past whole.
 * Layout is reserved up front, so nothing jumps while it writes.
 */
import { prefersReducedMotion, whenReached } from './reveal'

/** What the writer writes, in reading order. */
const BLOCKS = '.hero h1, .hero .lede, .act .gutter, .act .body > *, .closing > *, .foot > *'
/** Written in one piece: the collapsing word, links, the live clock, the falling line, the garbled name. */
const WHOLE = '.wrong, .link, [data-clock], [data-falls], [data-moji]'

/**
 * A `[data-draft]` element marks a mistake: the writer first types the draft text
 * there, notices, deletes it, then writes what's actually inside.
 */
interface Draft {
  draft: HTMLElement
}
type Piece = Element | Draft
const isDraft = (piece: Piece): piece is Draft => 'draft' in piece

const THINK_MS = 650
const CARET_LINGERS_MS = 1600
/** The writer runs out of tokens in a loop, and sits there for a moment. */
const STALL_MS = 1500

/** Words with their leading space, like model tokens; long words come in two pieces. */
export function tokenize(text: string): string[] {
  return (text.match(/\s*\S+/g) ?? []).flatMap(word => {
    const bare = word.trim()
    if (bare.length < 10) return [word]
    const cut = word.length - Math.ceil(bare.length / 2)
    return [word.slice(0, cut), word.slice(cut)]
  })
}

export const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, prefersReducedMotion() ? 0 : ms))
const visible = () =>
  document.hidden ? new Promise(resolve => document.addEventListener('visibilitychange', resolve, { once: true })) : Promise.resolve()
const reached = (el: Element) => new Promise<void>(resolve => whenReached(el, resolve, 0.9))

export function caret(): HTMLElement {
  const el = Object.assign(document.createElement('span'), { className: 'caret' })
  el.setAttribute('aria-hidden', 'true')
  return el
}

/** Wraps every token in `root` in a hidden span and returns them, and any drafts, in reading order. */
export function wrap(root: Element): Piece[] {
  const tokens: Piece[] = []
  const visit = (node: Node): void => {
    if (node instanceof Element) {
      if (node instanceof HTMLElement && node.dataset.draft) tokens.push({ draft: node })
      if (node.matches('.sr-only, br') || !node.getClientRects().length) return
      if (node.matches(WHOLE)) {
        node.classList.add('tok')
        tokens.push(node)
        return
      }
      return [...node.childNodes].forEach(visit)
    }
    if (!(node instanceof Text) || !node.data.trim()) return
    const spans = tokenize(node.data).map(text => Object.assign(document.createElement('span'), { className: 'tok', textContent: text }))
    node.replaceWith(...spans, node.data.match(/\s+$/)?.[0] ?? '')
    tokens.push(...spans)
  }
  visit(root)
  return tokens
}

type Pace = { most: number; ms: number; jitter: number }

/** Types the draft at the start of `at`, notices, and deletes it a character at a time. */
async function mistype(at: HTMLElement, cursor: HTMLElement, pace: Pace): Promise<void> {
  const typed = document.createTextNode('')
  at.prepend(typed)
  typed.after(cursor)
  for (const token of tokenize(at.dataset.draft ?? '')) {
    typed.data += token
    await wait(pace.ms + Math.random() * pace.jitter)
  }
  cursor.classList.remove('is-typing')
  await wait(700)
  cursor.classList.add('is-typing')
  while (typed.data) {
    typed.data = typed.data.slice(0, -1)
    await wait(26)
  }
  typed.remove()
  await wait(160)
}

/**
 * Shows `pieces` a few tokens at a time, moving `cursor` along. If `skip()` (you've
 * scrolled past), shows the rest at once and returns false: nobody watched it being written.
 */
async function write(pieces: Piece[], cursor: HTMLElement, pace: Pace, skip = () => false): Promise<boolean> {
  cursor.classList.add('is-typing')
  for (let next = 0; next < pieces.length;) {
    if (skip()) {
      pieces.slice(next).forEach(piece => isDraft(piece) || piece.classList.add('is-in'))
      cursor.classList.remove('is-typing')
      return false
    }
    const first = pieces[next]
    if (isDraft(first)) {
      await mistype(first.draft, cursor, pace)
      next += 1
      continue
    }
    const chunk: Element[] = []
    for (let size = 1 + Math.floor(Math.random() * pace.most); chunk.length < size && next < pieces.length; next++) {
      const piece = pieces[next]
      if (isDraft(piece)) break
      chunk.push(piece)
    }
    chunk.forEach(token => token.classList.add('is-in'))
    chunk[chunk.length - 1].after(cursor)
    await wait(pace.ms + Math.random() * pace.jitter)
  }
  cursor.classList.remove('is-typing')
  return true
}

const HERO_PACE = { most: 3, ms: 80, jitter: 140 }
const BODY_PACE = { most: 4, ms: 25, jitter: 55 }

const done = new Map<Element, Promise<void>>()

/** Resolves once the block containing `el` has been written (at once if nothing streams). */
export function written(el: Element): Promise<void> {
  for (const [block, promise] of done) if (block.contains(el)) return promise
  return Promise.resolve()
}

export function initStream(): void {
  const root = document.documentElement
  if (!root.classList.contains('streaming') || prefersReducedMotion()) {
    root.classList.remove('streaming')
    return
  }

  const blocks = [...document.querySelectorAll(BLOCKS)].map(el => {
    let finish = () => {}
    done.set(el, new Promise<void>(resolve => (finish = resolve)))
    el.classList.add('unwritten')
    return { el, tokens: wrap(el), finish }
  })
  root.classList.remove('streaming')

  const cursor = caret()
  void (async () => {
    await visible()
    for (const [i, { el, tokens, finish }] of blocks.entries()) {
      // Wait for the reader; the caret blinks for a moment, then goes away.
      const parked = setTimeout(() => cursor.remove(), CARET_LINGERS_MS)
      await reached(el)
      clearTimeout(parked)

      el.classList.remove('unwritten')
      const start = tokens[0]
      if (start) (isDraft(start) ? start.draft : start).before(cursor)
      if (i === 0) await wait(THINK_MS)
      const hero = el.closest('.hero')
      const watched = await write(tokens, cursor, hero ? HERO_PACE : BODY_PACE, () => el.getBoundingClientRect().bottom < 0)
      finish()
      if (watched) await wait(el.querySelector('[data-loop]') ? STALL_MS : hero ? 140 : 60)
    }
    setTimeout(() => cursor.remove(), CARET_LINGERS_MS)
  })()
}
