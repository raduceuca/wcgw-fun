import { afterEach, describe, expect, it, vi } from 'vitest'
import { CONSENT_KEY, decide, stored } from './consent'

function setup(storage: Partial<Storage>) {
  const clarity = vi.fn()
  const gtag = vi.fn()
  vi.stubGlobal('localStorage', storage)
  vi.stubGlobal('window', { clarity, gtag })
  return { clarity, gtag }
}

afterEach(() => vi.unstubAllGlobals())

describe('consent', () => {
  it('stores a yes and grants analytics only', () => {
    const items = new Map<string, string>()
    const { clarity, gtag } = setup({
      setItem: (k, v) => void items.set(k, v),
      getItem: k => items.get(k) ?? null,
    })
    decide('yes')
    expect(items.get(CONSENT_KEY)).toBe('yes')
    expect(stored()).toBe('yes')
    expect(clarity).toHaveBeenCalledWith('consentv2', { ad_Storage: 'denied', analytics_Storage: 'granted' })
    expect(gtag).toHaveBeenCalledWith('consent', 'update', {
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      analytics_storage: 'granted',
    })
  })

  it('sends a no to Clarity and GTM even when storage throws', () => {
    const fail = () => {
      throw new Error('blocked')
    }
    const { clarity, gtag } = setup({ setItem: fail, getItem: fail })
    decide('no')
    expect(stored()).toBeNull()
    expect(clarity).toHaveBeenCalledWith('consentv2', { ad_Storage: 'denied', analytics_Storage: 'denied' })
    expect(gtag).toHaveBeenCalledWith('consent', 'update', {
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      analytics_storage: 'denied',
    })
  })
})
