import { track } from '../home/analytics'
import { initClock } from '../home/clock'
import { initFavicon } from '../home/favicon'
import { initMishaps } from '../home/mishaps'
import { initReveal } from '../home/reveal'
import { initStream } from '../home/stream'
import { initTheme } from '../home/theme'

const year = document.getElementById('year')
if (year) year.textContent = String(new Date().getFullYear())

initTheme()
initStream()
initMishaps()
initClock()
initReveal()
initFavicon()

for (const link of document.querySelectorAll<HTMLAnchorElement>('a[href]')) {
  link.addEventListener('click', () =>
    track('link_click', 'clicked_link', link.textContent?.trim() || link.href),
  )
}
