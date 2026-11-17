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

const faviconSvg = (color: string) => `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
  <circle cx="16" cy="16" r="14" stroke="${color}" stroke-width="2" fill="none"/>
  <path d="M6 20 A10 3.5 0 0 1 8 17.5" stroke="${color}" stroke-width="2" fill="none" stroke-linecap="round"/>
  <path d="M24 17.5 A10 3.5 0 0 1 26 20" stroke="${color}" stroke-width="2" fill="none" stroke-linecap="round"/>
  <path d="M6 20 A10 3.5 0 0 0 26 20" stroke="${color}" stroke-width="2" fill="none" stroke-linecap="round"/>
  <path d="M8 18 C8 18 8 9 16 9 C24 9 24 18 24 18" stroke="${color}" stroke-width="2" fill="none" stroke-linecap="round"/>
  <g stroke="${color}" stroke-width="2" stroke-linecap="round"><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/></g>
  <g stroke="${color}" stroke-width="2" stroke-linecap="round"><line x1="18" y1="12" x2="22" y2="16"/><line x1="22" y1="12" x2="18" y2="16"/></g>
</svg>`

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
