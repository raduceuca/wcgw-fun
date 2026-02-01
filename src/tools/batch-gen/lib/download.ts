import JSZip from 'jszip'
import type { GenerationResult } from '../types'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80)
}

function extensionForMime(mime: string): string {
  if (mime.includes('png')) return 'png'
  if (mime.includes('webp')) return 'webp'
  if (mime.includes('jpeg') || mime.includes('jpg')) return 'jpg'
  return 'png'
}

export function buildFilename(result: GenerationResult, index: number): string {
  const tagValues = Object.values(result.prompt.tags)
  const label = tagValues.length > 0
    ? slugify(tagValues.join('-'))
    : slugify(result.prompt.text.slice(0, 60))
  const num = String(index + 1).padStart(3, '0')
  const ext = extensionForMime(result.mimeType ?? 'image/png')
  return `batch-${num}-${label}.${ext}`
}

export function downloadSingle(result: GenerationResult, index: number): void {
  if (!result.imageData) return
  const name = buildFilename(result, index)
  const binary = atob(result.imageData)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  const blob = new Blob([bytes], { type: result.mimeType ?? 'image/png' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  URL.revokeObjectURL(url)
}

export async function downloadAllAsZip(
  results: readonly GenerationResult[]
): Promise<void> {
  const successful = results.filter(r => r.status === 'success' && r.imageData)
  if (successful.length === 0) return

  const zip = new JSZip()
  const usedNames = new Set<string>()

  for (const [idx, result] of successful.entries()) {
    let name = buildFilename(result, idx)
    if (usedNames.has(name)) {
      const [stem, ext] = name.split(/\.(?=[^.]+$)/)
      let i = 2
      while (usedNames.has(`${stem}-${i}.${ext}`)) i++
      name = `${stem}-${i}.${ext}`
    }
    usedNames.add(name)

    const binary = atob(result.imageData!)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    zip.file(name, bytes)
  }

  const blob = await zip.generateAsync({ type: 'blob' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `batch-gen-${Date.now()}.zip`
  a.click()
  URL.revokeObjectURL(url)
}
