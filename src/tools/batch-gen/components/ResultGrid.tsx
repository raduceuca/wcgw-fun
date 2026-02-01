import type { GenerationResult } from '../types'
import { ResultCard } from './ResultCard'

interface Props {
  readonly results: readonly GenerationResult[]
  readonly onRetry: (id: string) => void
}

export function ResultGrid({ results, onRetry }: Props) {
  if (results.length === 0) return null

  const done = results.filter(r => r.status === 'success' || r.status === 'error').length
  const total = results.length

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-neutral-300">Results</span>
        <span className="text-xs text-neutral-500">{done}/{total}</span>
      </div>

      {done < total && (
        <div className="w-full bg-neutral-800 rounded-full h-1 mb-4">
          <div
            className="bg-neutral-400 h-1 rounded-full transition-all duration-300"
            style={{ width: `${(done / total) * 100}%` }}
          />
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {results.map(r => (
          <ResultCard key={r.id} result={r} onRetry={onRetry} />
        ))}
      </div>
    </section>
  )
}
