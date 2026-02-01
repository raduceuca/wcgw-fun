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

export function buildFilename(result: GenerationResult): string {
  const tagValues = Object.values(result.prompt.tags)
  const stem = tagValues.length > 0
    ? slugify(tagValues.join('-'))
    : slugify(result.prompt.text.slice(0, 60))
  const ext = extensionForMime(result.mimeType ?? 'image/png')
  return `${stem}.${ext}`
}

export async function downloadAllAsZip(
  results: readonly GenerationResult[]
): Promise<void> {
  const successful = results.filter(r => r.status === 'success' && r.imageData)
  if (successful.length === 0) return

  const zip = new JSZip()
  const usedNames = new Set<string>()

  for (const result of successful) {
    let name = buildFilename(result)
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
