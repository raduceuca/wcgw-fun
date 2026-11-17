import { describe, expect, it } from 'vitest'
import { tokenize } from './stream'

describe('tokenize', () => {
  it('keeps the text exactly', () => {
    const text = 'You can ship anything now. Congratulations.'
    expect(tokenize(text).join('')).toBe(text)
  })

  it('gives each word its leading space, like model tokens', () => {
    expect(tokenize('What could go')).toEqual(['What', ' could', ' go'])
  })

  it('splits long words in two', () => {
    const pieces = tokenize(' Congratulations.')
    expect(pieces).toHaveLength(2)
    expect(pieces.join('')).toBe(' Congratulations.')
  })

  it('has no tokens for whitespace', () => {
    expect(tokenize('\n   ')).toEqual([])
  })
})
