import { useState, useCallback, useRef } from 'react'
import { ApiKeyInput } from './components/ApiKeyInput'
import { ImageUpload } from './components/ImageUpload'
import { PromptBuilder } from './components/PromptBuilder'
import { ResultGrid } from './components/ResultGrid'
import { Lightbox } from './components/Lightbox'
import { extractTags, resolvePrompts } from './lib/merge-tags'
import { generateImage } from './lib/gemini'
import { downloadAllAsZip } from './lib/download'
import type { TagDefinition, GenerationResult } from './types'

export function App() {
  const [apiKey, setApiKey] = useState('')
  const [image, setImage] = useState<{ base64: string; mimeType: string; name: string } | null>(null)
  const [template, setTemplate] = useState('')
  const [tagValues, setTagValues] = useState<Record<string, string>>({})
  const [results, setResults] = useState<GenerationResult[]>([])
  const [running, setRunning] = useState(false)
  const [concurrency, setConcurrency] = useState(3)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const abortRef = useRef(false)

  const canGenerate = apiKey.trim().length > 0
    && image !== null
    && template.trim().length > 0
    && !running

  const hasSuccessResults = results.some(r => r.status === 'success')

  function buildPrompts(): GenerationResult[] {
    const tagNames = extractTags(template)
    const tags: TagDefinition[] = tagNames.map(name => ({
      name,
      values: (tagValues[name] ?? '').split('\n').filter(l => l.trim().length > 0),
    }))

    const resolved = resolvePrompts(template, tags)
    return resolved.map((prompt, i) => ({
      id: `gen-${i}-${Date.now()}`,
      prompt,
      status: 'pending' as const,
    }))
  }

  const updateResult = useCallback((id: string, update: Partial<GenerationResult>) => {
    setResults(prev => prev.map(r =>
      r.id === id ? { ...r, ...update } : r
    ))
  }, [])

  async function runGeneration(items: GenerationResult[]) {
    setRunning(true)
    abortRef.current = false

    let cursor = 0

    async function next(): Promise<void> {
      while (cursor < items.length && !abortRef.current) {
        const idx = cursor++
        const item = items[idx]

        updateResult(item.id, { status: 'generating' })

        try {
          const result = await generateImage({
            apiKey,
            prompt: item.prompt.text,
            imageBase64: image!.base64,
            imageMimeType: image!.mimeType,
          })
          updateResult(item.id, {
            status: 'success',
            imageData: result.imageData,
            mimeType: result.mimeType,
          })
        } catch (err) {
          updateResult(item.id, {
            status: 'error',
            error: err instanceof Error ? err.message : String(err),
          })
        }
      }
    }

    const workers = Array.from(
      { length: Math.min(concurrency, items.length) },
      () => next()
    )
    await Promise.all(workers)
    setRunning(false)
  }

  function handleGenerate() {
    const items = buildPrompts()
    setResults(items)
    runGeneration(items)
  }

  function handleStop() {
    abortRef.current = true
  }

  function handleRetry(id: string) {
    const item = results.find(r => r.id === id)
    if (!item) return

    const retried: GenerationResult = { ...item, status: 'pending', error: undefined }
    setResults(prev => prev.map(r => r.id === id ? retried : r))
    runGeneration([retried])
  }

  function handleDownload() {
    downloadAllAsZip(results)
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-mono">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <header>
          <h1 className="text-lg font-bold text-neutral-100">Batch Gen</h1>
          <p className="text-xs text-neutral-500">Batch image generation via Gemini</p>
        </header>

        <ApiKeyInput value={apiKey} onChange={setApiKey} />
        <ImageUpload value={image} onChange={setImage} />
        <PromptBuilder
          template={template}
          onTemplateChange={setTemplate}
          tagValues={tagValues}
          onTagValuesChange={setTagValues}
        />

        <div className="flex items-center gap-3">
          {running ? (
            <button
              type="button"
              onClick={handleStop}
              className="px-4 py-2 text-sm font-medium bg-red-900 text-red-200 rounded hover:bg-red-800"
            >
              Stop
            </button>
          ) : (
            <button
              type="button"
              onClick={handleGenerate}
              disabled={!canGenerate}
              className="px-4 py-2 text-sm font-medium bg-neutral-100 text-neutral-900 rounded hover:bg-neutral-200 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Generate All
            </button>
          )}

          {hasSuccessResults && !running && (
            <button
              type="button"
              onClick={handleDownload}
              className="px-4 py-2 text-sm font-medium border border-neutral-600 rounded text-neutral-300 hover:border-neutral-400 hover:text-neutral-100"
            >
              Download All
            </button>
          )}

          <div className="ml-auto flex items-center gap-2">
            <label className="text-xs text-neutral-600">Concurrency</label>
            <input
              type="number"
              min={1}
              max={10}
              value={concurrency}
              onChange={e => setConcurrency(Number(e.target.value))}
              className="w-14 bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-xs text-neutral-300 text-center"
            />
          </div>
        </div>

        <ResultGrid results={results} onRetry={handleRetry} onView={setLightboxIndex} />

        {lightboxIndex !== null && (
          <Lightbox
            results={results}
            currentIndex={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
            onNavigate={setLightboxIndex}
          />
        )}
      </div>
    </div>
  )
}
