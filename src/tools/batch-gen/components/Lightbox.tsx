import { useEffect, useCallback } from 'react'
import type { GenerationResult } from '../types'
import { downloadSingle } from '../lib/download'

interface Props {
  readonly results: readonly GenerationResult[]
  readonly currentIndex: number
  readonly onClose: () => void
  readonly onNavigate: (index: number) => void
}

export function Lightbox({ results, currentIndex, onClose, onNavigate }: Props) {
  const successResults = results
    .map((r, i) => ({ result: r, originalIndex: i }))
    .filter(({ result }) => result.status === 'success' && result.imageData)

  const currentPos = successResults.findIndex(({ originalIndex }) => originalIndex === currentIndex)
  const current = successResults[currentPos]

  const hasPrev = currentPos > 0
  const hasNext = currentPos < successResults.length - 1

  const goPrev = useCallback(() => {
    if (hasPrev) onNavigate(successResults[currentPos - 1].originalIndex)
  }, [hasPrev, currentPos, successResults, onNavigate])

  const goNext = useCallback(() => {
    if (hasNext) onNavigate(successResults[currentPos + 1].originalIndex)
  }, [hasNext, currentPos, successResults, onNavigate])

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') goPrev()
      if (e.key === 'ArrowRight') goNext()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose, goPrev, goNext])

  if (!current) return null

  const { result, originalIndex } = current
  const tagSummary = Object.values(result.prompt.tags).join(' / ') || result.prompt.text.slice(0, 60)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl max-h-[90vh] flex flex-col items-center"
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          className="absolute -top-10 right-0 text-neutral-400 hover:text-neutral-100 text-sm"
        >
          ESC
        </button>

        {/* Image */}
        <img
          src={`data:${result.mimeType};base64,${result.imageData}`}
          alt={tagSummary}
          className="max-h-[75vh] max-w-full object-contain rounded"
        />

        {/* Bottom bar */}
        <div className="mt-3 flex items-center gap-4 w-full justify-center">
          {/* Prev */}
          <button
            type="button"
            onClick={goPrev}
            disabled={!hasPrev}
            className="px-3 py-1.5 text-sm border border-neutral-700 rounded text-neutral-300 hover:border-neutral-500 disabled:opacity-20 disabled:cursor-not-allowed"
          >
            &larr;
          </button>

          {/* Info */}
          <div className="text-center min-w-0">
            <p className="text-xs text-neutral-400 truncate max-w-md" title={result.prompt.text}>
              {tagSummary}
            </p>
            <p className="text-xs text-neutral-600 mt-0.5">
              {currentPos + 1} / {successResults.length}
            </p>
          </div>

          {/* Next */}
          <button
            type="button"
            onClick={goNext}
            disabled={!hasNext}
            className="px-3 py-1.5 text-sm border border-neutral-700 rounded text-neutral-300 hover:border-neutral-500 disabled:opacity-20 disabled:cursor-not-allowed"
          >
            &rarr;
          </button>

          {/* Save */}
          <button
            type="button"
            onClick={() => downloadSingle(result, originalIndex)}
            className="px-3 py-1.5 text-xs border border-neutral-600 rounded text-neutral-300 hover:border-neutral-400 hover:text-neutral-100"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
