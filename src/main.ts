declare global {
  interface Window {
    clarity?: (...args: unknown[]) => void
  }
}

document.getElementById('year')!.textContent = String(new Date().getFullYear())

const themes = ['light', 'dark', 'classified', 'broadcast', 'arcade', 'cartoon', 'brutalist', 'vaporwave']
const logo = document.querySelector('.logo')!
const root = document.documentElement

const saved = localStorage.getItem('theme')
if (saved && themes.includes(saved)) {
  root.dataset.theme = saved
} else {
  root.dataset.theme = 'light'
}

function cycleTheme(): void {
  const current = root.dataset.theme || 'light'
  const idx = themes.indexOf(current)
  const next = themes[(idx + 1) % themes.length]
  root.dataset.theme = next
  localStorage.setItem('theme', next)
  if (window.clarity) {
    window.clarity('event', 'theme_toggle')
    window.clarity('set', 'theme', next)
  }
}

logo.addEventListener('click', cycleTheme)
logo.addEventListener('keydown', (e) => {
  if (e instanceof KeyboardEvent && (e.key === 'Enter' || e.key === ' ')) {
    e.preventDefault()
    cycleTheme()
  }
})

document.querySelectorAll<HTMLAnchorElement>('a[href]').forEach(link => {
  link.addEventListener('click', () => {
    if (window.clarity) {
      const linkText = link.textContent?.trim() || link.href
      window.clarity('event', 'link_click')
      window.clarity('set', 'clicked_link', linkText)
    }
  })
})

type RGB = [number, number, number]

const colors: RGB[] = [
  [21, 128, 61],
  [124, 58, 237],
  [219, 39, 119],
  [194, 65, 12],
  [15, 118, 110],
  [3, 105, 161]
]

const lerp = (a: number, b: number, t: number): number => a + (b - a) * t
const lerpColor = (c1: RGB, c2: RGB, t: number): RGB => [
  Math.round(lerp(c1[0], c2[0], t)),
  Math.round(lerp(c1[1], c2[1], t)),
  Math.round(lerp(c1[2], c2[2], t))
]
const rgbToHex = ([r, g, b]: RGB): string =>
  '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')

const faviconSvg = (color: string): string => `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
  <circle cx="16" cy="16" r="14" stroke="${color}" stroke-width="2" fill="none"/>
  <path d="M6 20 A10 3.5 0 0 1 8 17.5" stroke="${color}" stroke-width="2" fill="none" stroke-linecap="round"/>
  <path d="M24 17.5 A10 3.5 0 0 1 26 20" stroke="${color}" stroke-width="2" fill="none" stroke-linecap="round"/>
  <path d="M6 20 A10 3.5 0 0 0 26 20" stroke="${color}" stroke-width="2" fill="none" stroke-linecap="round"/>
  <path d="M8 18 C8 18 8 9 16 9 C24 9 24 18 24 18" stroke="${color}" stroke-width="2" fill="none" stroke-linecap="round"/>
  <g stroke="${color}" stroke-width="2" stroke-linecap="round"><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/></g>
  <g stroke="${color}" stroke-width="2" stroke-linecap="round"><line x1="18" y1="12" x2="22" y2="16"/><line x1="22" y1="12" x2="18" y2="16"/></g>
</svg>`

const favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]')!
const cycleDuration = 12000
let lastUpdate = 0
const updateInterval = 50

function animateFavicon(timestamp: number): void {
  if (timestamp - lastUpdate >= updateInterval) {
    const progress = (timestamp % cycleDuration) / cycleDuration
    const totalSegments = colors.length
    const segmentProgress = progress * totalSegments
    const currentIndex = Math.floor(segmentProgress) % totalSegments
    const nextIndex = (currentIndex + 1) % totalSegments
    const t = segmentProgress - currentIndex

    const interpolatedColor = lerpColor(colors[currentIndex], colors[nextIndex], t)
    favicon.href = 'data:image/svg+xml,' + encodeURIComponent(faviconSvg(rgbToHex(interpolatedColor)))
    lastUpdate = timestamp
  }
  requestAnimationFrame(animateFavicon)
}
requestAnimationFrame(animateFavicon)
