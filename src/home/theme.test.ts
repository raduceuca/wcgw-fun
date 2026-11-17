import { describe, expect, it } from 'vitest'
import { nextTheme } from './theme'

describe('nextTheme', () => {
  it('toggles paper and night', () => {
    expect(nextTheme('paper')).toBe('night')
    expect(nextTheme('night')).toBe('paper')
  })

  it('falls back to paper for unknown themes', () => {
    expect(nextTheme('classified')).toBe('paper')
    expect(nextTheme('dark')).toBe('paper')
  })
})
