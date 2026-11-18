import { afterEach, describe, expect, it, vi } from 'vitest'
import { CONSENT_KEY, decide, stored } from './consent'

function setup(storage: Partial<Storage>) {
  const clarity = vi.fn()
  vi.stubGlobal('localStorage', storage)
  vi.stubGlobal('window', { clarity })
  return clarity
}

afterEach(() => vi.unstubAllGlobals())

describe('consent', () => {
  it('stores a yes and grants analytics only', () => {
    const items = new Map<string, string>()
    const clarity = setup({ setItem: (k, v) => void items.set(k, v), getItem: k => items.get(k) ?? null })
    decide('yes')
    expect(items.get(CONSENT_KEY)).toBe('yes')
    expect(stored()).toBe('yes')
    expect(clarity).toHaveBeenCalledWith('consentv2', { ad_Storage: 'denied', analytics_Storage: 'granted' })
  })

  it('sends a no to Clarity even when storage throws', () => {
    const fail = () => {
      throw new Error('blocked')
    }
    const clarity = setup({ setItem: fail, getItem: fail })
    decide('no')
    expect(stored()).toBeNull()
    expect(clarity).toHaveBeenCalledWith('consentv2', { ad_Storage: 'denied', analytics_Storage: 'denied' })
  })
})
