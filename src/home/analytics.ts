declare global {
  interface Window {
    clarity?: (...args: unknown[]) => void
  }
}

/** Microsoft Clarity custom event. Clarity loads in production builds only. */
export function track(event: string, key: string, value: string): void {
  if (!window.clarity) return
  window.clarity('event', event)
  window.clarity('set', key, value)
}
