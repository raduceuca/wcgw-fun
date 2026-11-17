export const prefersReducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches

interface Waiting {
  el: Element
  at: number
  callback: () => void
}

const waiting: Waiting[] = []
let scheduled = false

function check(): void {
  scheduled = false
  for (const item of [...waiting]) {
    if (item.el.getBoundingClientRect().top > innerHeight * item.at) continue
    waiting.splice(waiting.indexOf(item), 1)
    item.callback()
  }
  if (!waiting.length) removeEventListener('scroll', onScroll)
}

function onScroll(): void {
  if (scheduled) return
  scheduled = true
  requestAnimationFrame(check)
}

/**
 * Runs `callback` once the element's top has scrolled above `at` (a fraction of
 * the viewport height). Also fires for elements jumped past via anchors or fast scrolls.
 */
export function whenReached(el: Element, callback: () => void, at = 0.85): void {
  waiting.push({ el, at, callback })
  if (waiting.length === 1) addEventListener('scroll', onScroll, { passive: true })
  onScroll()
}

/** The + × dividers blink as you pass. */
export function initReveal(): void {
  if (prefersReducedMotion()) return
  for (const el of document.querySelectorAll('.eyes')) {
    whenReached(el, () => el.classList.add('is-in'), 0.75)
  }
}
