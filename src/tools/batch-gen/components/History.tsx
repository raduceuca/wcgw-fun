import { useState } from 'react'
import { extractTags } from '../lib/merge-tags'
import type { HistoryEntry } from '../lib/storage'
import { removeHistoryEntry, clearHistory } from '../lib/storage'

interface Props {
  readonly entries: readonly HistoryEntry[]
  readonly onLoad: (template: string, tagValues: Record<string, string>) => void
  readonly onEntriesChange: () => void
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function templatePreview(template: string): string {
  return template.length > 60 ? template.slice(0, 60) + '...' : template
}

function tagSummary(entry: HistoryEntry): string {
  const tags = extractTags(entry.template)
  if (tags.length === 0) return ''
  const parts = tags.map(name => {
    const count = (entry.tagValues[name] ?? '')
      .split('\n')
      .filter(l => l.trim().length > 0).length
    return `${name}(${count})`
  })
  return parts.join(' × ')
}

export function History({ entries, onLoad, onEntriesChange }: Props) {
  const [expanded, setExpanded] = useState(false)

  if (entries.length === 0) return null

  return (
    <section>
      <button
        type="button"
        onClick={() => setExpanded(v => !v)}
        className="flex items-center gap-2 text-sm font-semibold text-neutral-300 hover:text-neutral-100"
      >
        <span className={`text-xs text-neutral-600 transition-transform ${expanded ? 'rotate-90' : ''}`}>
          &#9654;
        </span>
        History
        <span className="text-xs font-normal text-neutral-600">{entries.length}</span>
      </button>

      {expanded && (
        <div className="mt-2 space-y-1">
          {entries.map(entry => (
            <div
              key={entry.id}
              className="group flex items-center gap-2 px-3 py-2 bg-neutral-900 border border-neutral-800 rounded hover:border-neutral-700 cursor-pointer"
              onClick={() => onLoad(entry.template, { ...entry.tagValues })}
            >
              <div className="flex-1 min-w-0">
                <p className="text-xs text-neutral-300 truncate font-mono">
                  {templatePreview(entry.template)}
                </p>
                {tagSummary(entry) && (
                  <p className="text-xs text-neutral-600 mt-0.5">{tagSummary(entry)}</p>
                )}
              </div>
              <span className="shrink-0 text-xs text-neutral-600">{timeAgo(entry.timestamp)}</span>
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation()
                  removeHistoryEntry(entry.id)
                  onEntriesChange()
                }}
                className="shrink-0 text-xs text-neutral-700 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Remove"
              >
                ×
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={() => { clearHistory(); onEntriesChange() }}
            className="text-xs text-neutral-700 hover:text-red-400 mt-1"
          >
            Clear all history
          </button>
        </div>
      )}
    </section>
  )
}
