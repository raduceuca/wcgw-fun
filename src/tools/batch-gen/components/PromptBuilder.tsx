import { useMemo } from 'react'
import { extractTags } from '../lib/merge-tags'

interface Props {
  readonly template: string
  readonly onTemplateChange: (template: string) => void
  readonly tagValues: Record<string, string>
  readonly onTagValuesChange: (tagValues: Record<string, string>) => void
}

export function PromptBuilder({ template, onTemplateChange, tagValues, onTagValuesChange }: Props) {
  const tagNames = useMemo(() => extractTags(template), [template])

  const counts = tagNames.map(name => {
    const raw = tagValues[name] ?? ''
    return raw.split('\n').filter(line => line.trim().length > 0).length
  })

  const totalCombinations = counts.length > 0
    ? counts.reduce((a, b) => a * Math.max(b, 1), 1)
    : template.trim().length > 0 ? 1 : 0

  function handleTagInput(name: string, value: string) {
    onTagValuesChange({ ...tagValues, [name]: value })
  }

  return (
    <section>
      <label className="block text-sm font-semibold mb-2 text-neutral-300">
        Prompt Template
      </label>
      <textarea
        value={template}
        onChange={e => onTemplateChange(e.target.value)}
        placeholder='Redesign this in the style of {{designer}}'
        rows={3}
        className="w-full bg-neutral-900 border border-neutral-700 rounded px-3 py-2 text-sm font-mono text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-500 resize-y"
      />

      {tagNames.length > 0 && (
        <div className="mt-4 space-y-3">
          {tagNames.map((name, i) => (
            <div key={name}>
              <label className="block text-xs font-medium mb-1 text-neutral-400">
                {`{{${name}}}`}
                <span className="ml-2 text-neutral-600">
                  {counts[i]} value{counts[i] !== 1 ? 's' : ''}
                </span>
              </label>
              <textarea
                value={tagValues[name] ?? ''}
                onChange={e => handleTagInput(name, e.target.value)}
                placeholder="One value per line"
                rows={3}
                className="w-full bg-neutral-900 border border-neutral-700 rounded px-3 py-2 text-sm font-mono text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-500 resize-y"
              />
            </div>
          ))}

          <p className="text-xs text-neutral-500">
            {counts.length > 1
              ? `${counts.join(' \u00d7 ')} = ${totalCombinations} prompts`
              : `${totalCombinations} prompt${totalCombinations !== 1 ? 's' : ''}`
            }
          </p>
        </div>
      )}
    </section>
  )
}
