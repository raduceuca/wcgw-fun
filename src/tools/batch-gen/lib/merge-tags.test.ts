import { describe, it, expect } from 'vitest'
import { extractTags, cartesianProduct, resolvePrompts } from './merge-tags'

describe('extractTags', () => {
  it('extracts single tag', () => {
    expect(extractTags('Hello {{name}}')).toEqual(['name'])
  })

  it('extracts multiple unique tags', () => {
    expect(extractTags('{{designer}} in {{style}}')).toEqual(['designer', 'style'])
  })

  it('deduplicates repeated tags', () => {
    expect(extractTags('{{a}} and {{a}}')).toEqual(['a'])
  })

  it('returns empty for no tags', () => {
    expect(extractTags('no tags here')).toEqual([])
  })

  it('handles tags with spaces in name', () => {
    expect(extractTags('{{first name}}')).toEqual(['first name'])
  })
})

describe('cartesianProduct', () => {
  it('returns single list as-is', () => {
    expect(cartesianProduct([['a', 'b']])).toEqual([['a'], ['b']])
  })

  it('computes product of two lists', () => {
    expect(cartesianProduct([['a', 'b'], ['1', '2']])).toEqual([
      ['a', '1'],
      ['a', '2'],
      ['b', '1'],
      ['b', '2'],
    ])
  })

  it('handles empty list', () => {
    expect(cartesianProduct([])).toEqual([[]])
  })

  it('handles list with empty sublist', () => {
    expect(cartesianProduct([['a'], []])).toEqual([])
  })
})

describe('resolvePrompts', () => {
  it('resolves single tag with multiple values', () => {
    const result = resolvePrompts(
      'Redesign in style of {{designer}}',
      [{ name: 'designer', values: ['Dieter Rams', 'Massimo Vignelli'] }]
    )
    expect(result).toEqual([
      { text: 'Redesign in style of Dieter Rams', tags: { designer: 'Dieter Rams' } },
      { text: 'Redesign in style of Massimo Vignelli', tags: { designer: 'Massimo Vignelli' } },
    ])
  })

  it('resolves multiple tags as cartesian product', () => {
    const result = resolvePrompts(
      '{{designer}} × {{style}}',
      [
        { name: 'designer', values: ['Rams', 'Scher'] },
        { name: 'style', values: ['minimal', 'bold'] },
      ]
    )
    expect(result).toHaveLength(4)
    expect(result[0]).toEqual({ text: 'Rams × minimal', tags: { designer: 'Rams', style: 'minimal' } })
    expect(result[3]).toEqual({ text: 'Scher × bold', tags: { designer: 'Scher', style: 'bold' } })
  })

  it('returns original prompt when no tags', () => {
    const result = resolvePrompts('static prompt', [])
    expect(result).toEqual([{ text: 'static prompt', tags: {} }])
  })
})
