const HISTORY_KEY = 'wcgw-batch-gen-history'
const MAX_ENTRIES = 50

export interface HistoryEntry {
  readonly id: string
  readonly template: string
  readonly tagValues: Readonly<Record<string, string>>
  readonly timestamp: number
}

function readEntries(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    if (!raw) return []
    return JSON.parse(raw) as HistoryEntry[]
  } catch {
    return []
  }
}

function writeEntries(entries: readonly HistoryEntry[]): void {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(entries))
}

export function getHistory(): HistoryEntry[] {
  return readEntries()
}

export function pushHistory(template: string, tagValues: Record<string, string>): HistoryEntry {
  const entries = readEntries()

  const entry: HistoryEntry = {
    id: `h-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    template,
    tagValues,
    timestamp: Date.now(),
  }

  const deduped = entries.filter(
    e => !(e.template === template && JSON.stringify(e.tagValues) === JSON.stringify(tagValues))
  )

  const updated = [entry, ...deduped].slice(0, MAX_ENTRIES)
  writeEntries(updated)
  return entry
}

export function removeHistoryEntry(id: string): void {
  const entries = readEntries().filter(e => e.id !== id)
  writeEntries(entries)
}

export function clearHistory(): void {
  localStorage.removeItem(HISTORY_KEY)
}
