import { useState, useEffect } from 'react'

const STORAGE_KEY = 'wcgw-batch-gen-api-key'

interface Props {
  readonly value: string
  readonly onChange: (key: string) => void
}

export function ApiKeyInput({ value, onChange }: Props) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) onChange(saved)
  }, [])

  function handleChange(next: string) {
    onChange(next)
    localStorage.setItem(STORAGE_KEY, next)
  }

  return (
    <section>
      <label className="block text-sm font-semibold mb-2 text-neutral-300">
        Gemini API Key
      </label>
      <div className="flex gap-2">
        <input
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={e => handleChange(e.target.value)}
          placeholder="AIza..."
          className="flex-1 bg-neutral-900 border border-neutral-700 rounded px-3 py-2 text-sm font-mono text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-500"
        />
        <button
          type="button"
          onClick={() => setVisible(v => !v)}
          className="px-3 py-2 text-xs border border-neutral-700 rounded text-neutral-400 hover:text-neutral-200 hover:border-neutral-500"
        >
          {visible ? 'Hide' : 'Show'}
        </button>
      </div>
    </section>
  )
}
