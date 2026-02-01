import type { TagDefinition, ResolvedPrompt } from '../types'

const TAG_PATTERN = /\{\{(.+?)\}\}/g

export function extractTags(template: string): string[] {
  const tags = new Set<string>()
  let match: RegExpExecArray | null
  while ((match = TAG_PATTERN.exec(template)) !== null) {
    tags.add(match[1])
  }
  TAG_PATTERN.lastIndex = 0
  return [...tags]
}

export function cartesianProduct(lists: readonly (readonly string[])[]): string[][] {
  if (lists.length === 0) return [[]]

  return lists.reduce<string[][]>(
    (acc, list) => acc.flatMap(combo => list.map(item => [...combo, item])),
    [[]]
  )
}

export function resolvePrompts(
  template: string,
  tags: readonly TagDefinition[]
): ResolvedPrompt[] {
  if (tags.length === 0) {
    return [{ text: template, tags: {} }]
  }

  const valueLists = tags.map(t => t.values)
  const combinations = cartesianProduct(valueLists)

  return combinations.map(combo => {
    let text = template
    const tagMap: Record<string, string> = {}

    tags.forEach((tag, i) => {
      text = text.replaceAll(`{{${tag.name}}}`, combo[i])
      tagMap[tag.name] = combo[i]
    })

    return { text, tags: tagMap }
  })
}
