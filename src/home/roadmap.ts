import { track } from './analytics'
import { prefersReducedMotion, whenReached } from './reveal'
import { written } from './stream'

export interface Idea {
  text: string
  verdict: 'no' | 'yes'
  cut: boolean
}

export function countsOf(ideas: Idea[]): string {
  const cut = ideas.filter(idea => idea.cut).length
  return `${cut} cut, ${ideas.length - cut} kept.`
}

/** What the editor says after each change to the roadmap. */
export function tally(ideas: Idea[], last?: Idea): string {
  const cut = ideas.filter(idea => idea.cut).length
  const kept = ideas.length - cut
  const counts = countsOf(ideas)

  if (cut === 0) return `${counts} Everything ships. What could go wrong?`
  if (kept === 0) return `${counts} Nothing ships. Also a choice.`
  if (ideas.every(idea => idea.cut === (idea.verdict === 'no'))) {
    return `${counts} Whatever survives is the work worth doing.`
  }
  if (!last) return counts
  if (last.verdict === 'no') return last.cut ? `${counts} Good call.` : `${counts} “${last.text}” is back. Brave.`
  return last.cut ? `${counts} Even “${last.text}”? Ruthless.` : `${counts} Fair, keep it.`
}

const read = (button: HTMLButtonElement): Idea => ({
  text: button.textContent?.trim() ?? '',
  verdict: button.dataset.verdict === 'yes' ? 'yes' : 'no',
  cut: button.getAttribute('aria-pressed') === 'true',
})

/** The zombie idea un-cuts itself this many times before it stays cut. */
const ZOMBIE_RETURNS = 2
const ZOMBIE_DELAY_MS = 2600
const PENCIL_MS = 2000

export function initRoadmap(): void {
  const roadmap = document.querySelector<HTMLElement>('[data-roadmap]')
  const output = roadmap?.querySelector<HTMLElement>('[data-tally]')
  if (!roadmap || !output) return
  const ideas = [...roadmap.querySelectorAll<HTMLButtonElement>('.idea')]
  const reduce = prefersReducedMotion()

  // A bad idea that keeps coming back after it's cut.
  const zombie = roadmap.querySelector<HTMLButtonElement>('[data-zombie]')
  let returns = 0
  const resurrect = () => {
    if (!zombie || !read(zombie).cut || returns >= ZOMBIE_RETURNS) return
    returns += 1
    zombie.setAttribute('aria-pressed', 'false')
    zombie.classList.add('is-back')
    output.textContent = `${countsOf(ideas.map(read))} “${read(zombie).text}” is back. Nobody asked.`
  }
  zombie?.addEventListener('animationend', () => zombie.classList.remove('is-back'))

  // Once the roadmap has been written and you're looking, the pencil cuts the bad ideas one by one.
  if (!reduce) {
    ideas.filter(idea => read(idea).cut).forEach((idea, i) => idea.style.setProperty('--i', String(i)))
    roadmap.classList.add('is-pending')
  }
  void written(roadmap).then(() => whenReached(roadmap, () => {
    roadmap.classList.remove('is-pending')
    setTimeout(() => ideas.forEach(idea => idea.style.removeProperty('--i')), PENCIL_MS)
    setTimeout(resurrect, (reduce ? 0 : PENCIL_MS) + ZOMBIE_DELAY_MS)
  }, 0.8))

  for (const button of ideas) {
    button.addEventListener('click', () => {
      button.setAttribute('aria-pressed', String(!read(button).cut))
      output.textContent = tally(ideas.map(read), read(button))
      if (button === zombie && read(button).cut) {
        if (returns < ZOMBIE_RETURNS) setTimeout(resurrect, ZOMBIE_DELAY_MS)
        else output.textContent = `${countsOf(ideas.map(read))} Gone. For now.`
      }
      track('roadmap_toggle', 'roadmap_idea', read(button).text)
    })
  }
}
