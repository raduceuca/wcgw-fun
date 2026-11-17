import { track } from './analytics'

const THEMES = ['paper', 'night'] as const
type Theme = (typeof THEMES)[number]

const NAMES: Record<Theme, string> = { paper: 'Paper', night: 'Night' }
const BG: Record<Theme, string> = { paper: '#fafafa', night: '#161513' }

function systemTheme(): Theme {
  return matchMedia('(prefers-color-scheme: dark)').matches ? 'night' : 'paper'
}

function read(): Theme {
  const raw = document.documentElement.dataset.theme
  return raw === 'paper' || raw === 'night' ? raw : systemTheme()
}

export function nextTheme(current: string): Theme {
  const i = THEMES.indexOf(current as Theme)
  return THEMES[i === -1 ? 0 : (i + 1) % THEMES.length]
}

export function initTheme(): void {
  const logo = document.querySelector<HTMLButtonElement>('.logo')
  if (!logo) return

  const root = document.documentElement
  const meta = document.querySelectorAll('meta[name="theme-color"]')
  const note = document.querySelector<HTMLElement>('.theme-note')
  let timer = 0

  const apply = (theme: Theme, say = false) => {
    root.dataset.theme = theme
    try {
      localStorage.setItem('wcgw-theme', theme)
    } catch {
      /* private mode */
    }
    meta.forEach((el) => el.setAttribute('content', BG[theme]))
    logo.setAttribute('aria-label', `Switch to ${theme === 'paper' ? 'night' : 'paper'} mode`)
    track('theme_toggle', 'theme', theme)
    if (say && note) {
      note.textContent = NAMES[theme]
      note.classList.add('show')
      window.clearTimeout(timer)
      timer = window.setTimeout(() => note.classList.remove('show'), 2400)
    }
  }

  apply(read())
  logo.addEventListener('click', () => apply(nextTheme(read()), true))
}
