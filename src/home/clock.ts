const format = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Europe/Bucharest',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
})

/** Local time in Bucharest, and how late it is. */
export function bucharest(date: Date): { time: string; mood: string } {
  const parts = Object.fromEntries(format.formatToParts(date).map(part => [part.type, part.value]))
  const hour = Number(parts.hour)
  const mood = hour >= 22 || hour < 5 ? 'Late.' : hour < 9 ? 'Early.' : hour < 18 ? 'Not late yet.' : 'Getting late.'
  return { time: `${parts.hour}:${parts.minute}`, mood }
}

/** Replaces "where it’s late." with the real time, every minute. */
export function initClock(): void {
  const el = document.querySelector<HTMLElement>('[data-clock]')
  if (!el) return

  const time = document.createElement('time')
  time.className = 'clock'
  const render = () => {
    const now = bucharest(new Date())
    time.textContent = now.time
    el.replaceChildren('where it’s ', time, `. ${now.mood}`)
  }
  render()
  setTimeout(() => {
    render()
    setInterval(render, 60_000)
  }, 60_000 - (Date.now() % 60_000))
}
