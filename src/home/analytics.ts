declare global {
  interface Window {
    clarity?: (...args: unknown[]) => void
  }
}

/** Microsoft Clarity custom event. Clarity is not loaded on localhost. */
export function track(event: string, key: string, value: string): void {
  if (!window.clarity) return
  window.clarity('event', event)
  window.clarity('set', key, value)
}
