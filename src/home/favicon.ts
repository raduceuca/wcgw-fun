import { LOGO_BODY, LOGO_EYE_X } from './logo'

type RGB = [number, number, number]

const COLORS: RGB[] = [
  [21, 128, 61],
  [124, 58, 237],
  [219, 39, 119],
  [194, 65, 12],
  [15, 118, 110],
  [3, 105, 161],
]
const CYCLE_MS = 12000
const FRAME_MS = 50

const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const toHex = ([r, g, b]: RGB) => '#' + [r, g, b].map(x => Math.round(x).toString(16).padStart(2, '0')).join('')

/** The logo on a square canvas, as in the design system's `favicon.svg`. */
const faviconSvg = (color: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 -51.5 228 228" fill="none" color="${color}">${LOGO_BODY}<path d="${LOGO_EYE_X}" fill="currentColor"/></svg>`

/** The favicon slowly cycles through colors. */
export function initFavicon(): void {
  const favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]')
  if (!favicon) return

  let last = 0
  const frame = (now: number) => {
    if (now - last >= FRAME_MS) {
      const position = ((now % CYCLE_MS) / CYCLE_MS) * COLORS.length
      const from = COLORS[Math.floor(position) % COLORS.length]
      const to = COLORS[(Math.floor(position) + 1) % COLORS.length]
      const t = position - Math.floor(position)
      const color = toHex([lerp(from[0], to[0], t), lerp(from[1], to[1], t), lerp(from[2], to[2], t)])
      favicon.href = 'data:image/svg+xml,' + encodeURIComponent(faviconSvg(color))
      last = now
    }
    requestAnimationFrame(frame)
  }
  requestAnimationFrame(frame)
}
