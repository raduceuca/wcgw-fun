import type { GenerationResult } from '../types'

interface Props {
  readonly result: GenerationResult
  readonly onRetry: (id: string) => void
}

export function ResultCard({ result, onRetry }: Props) {
  const tagSummary = Object.values(result.prompt.tags).join(' / ') || result.prompt.text.slice(0, 50)

  return (
    <div className="bg-neutral-900 border border-neutral-700 rounded overflow-hidden">
      <div className="aspect-square bg-neutral-800 flex items-center justify-center">
        {result.status === 'success' && result.imageData ? (
          <img
            src={`data:${result.mimeType};base64,${result.imageData}`}
            alt={tagSummary}
            className="w-full h-full object-cover"
          />
        ) : result.status === 'generating' ? (
          <div className="text-xs text-neutral-500 animate-pulse">Generating...</div>
        ) : result.status === 'error' ? (
          <div className="p-3 text-center">
            <p className="text-xs text-red-400 mb-2">{result.error}</p>
            <button
              type="button"
              onClick={() => onRetry(result.id)}
              className="text-xs px-2 py-1 border border-neutral-600 rounded text-neutral-300 hover:border-neutral-400"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="text-xs text-neutral-600">Pending</div>
        )}
      </div>
      <div className="px-3 py-2">
        <p className="text-xs text-neutral-400 truncate" title={result.prompt.text}>
          {tagSummary}
        </p>
      </div>
    </div>
  )
}
