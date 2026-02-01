import type { GenerationResult } from '../types'
import { downloadSingle } from '../lib/download'

interface Props {
  readonly result: GenerationResult
  readonly index: number
  readonly onRetry: (id: string) => void
  readonly onView: (index: number) => void
}

export function ResultCard({ result, index, onRetry, onView }: Props) {
  const tagSummary = Object.values(result.prompt.tags).join(' / ') || result.prompt.text.slice(0, 50)
  const isSuccess = result.status === 'success' && result.imageData

  return (
    <div className="bg-neutral-900 border border-neutral-700 rounded overflow-hidden group">
      <div className="aspect-square bg-neutral-800 flex items-center justify-center relative">
        {isSuccess ? (
          <>
            <img
              src={`data:${result.mimeType};base64,${result.imageData}`}
              alt={tagSummary}
              className="w-full h-full object-cover cursor-pointer"
              onClick={() => onView(index)}
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors pointer-events-none" />
          </>
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
      <div className="px-3 py-2 flex items-center gap-2">
        <p className="text-xs text-neutral-400 truncate flex-1" title={result.prompt.text}>
          {tagSummary}
        </p>
        {isSuccess && (
          <button
            type="button"
            onClick={() => downloadSingle(result, index)}
            className="shrink-0 text-xs text-neutral-600 hover:text-neutral-300 transition-colors"
            title="Save image"
          >
            Save
          </button>
        )}
      </div>
    </div>
  )
}
