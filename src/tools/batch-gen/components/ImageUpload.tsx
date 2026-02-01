import { useState, useCallback } from 'react'

interface ImageData {
  readonly base64: string
  readonly mimeType: string
  readonly name: string
}

interface Props {
  readonly value: ImageData | null
  readonly onChange: (image: ImageData | null) => void
}

export function ImageUpload({ value, onChange }: Props) {
  const [dragOver, setDragOver] = useState(false)

  const handleFile = useCallback((file: File) => {
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      const [header, base64] = dataUrl.split(',')
      const mimeType = header.match(/:(.*?);/)?.[1] ?? 'image/png'
      onChange({ base64, mimeType, name: file.name })
    }
    reader.readAsDataURL(file)
  }, [onChange])

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file?.type.startsWith('image/')) handleFile(file)
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  if (value) {
    return (
      <section>
        <label className="block text-sm font-semibold mb-2 text-neutral-300">
          Source Image
        </label>
        <div className="flex items-center gap-4 p-3 bg-neutral-900 border border-neutral-700 rounded">
          <img
            src={`data:${value.mimeType};base64,${value.base64}`}
            alt="Uploaded"
            className="w-16 h-16 object-cover rounded"
          />
          <span className="text-sm text-neutral-400 flex-1 truncate">{value.name}</span>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-xs text-neutral-500 hover:text-neutral-300"
          >
            Remove
          </button>
        </div>
      </section>
    )
  }

  return (
    <section>
      <label className="block text-sm font-semibold mb-2 text-neutral-300">
        Source Image
      </label>
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded p-8 text-center cursor-pointer transition-colors ${
          dragOver
            ? 'border-neutral-400 bg-neutral-800'
            : 'border-neutral-700 hover:border-neutral-500'
        }`}
      >
        <input
          type="file"
          accept="image/*"
          onChange={handleInputChange}
          className="hidden"
          id="image-upload"
        />
        <label htmlFor="image-upload" className="cursor-pointer">
          <p className="text-sm text-neutral-400">
            Drop an image here or <span className="text-neutral-200 underline">browse</span>
          </p>
        </label>
      </div>
    </section>
  )
}
