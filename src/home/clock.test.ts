import { describe, expect, it } from 'vitest'
import { bucharest } from './clock'

// November: Bucharest is UTC+2.
const at = (utc: string) => bucharest(new Date(`2026-11-11T${utc}:00Z`))

describe('bucharest', () => {
  it('reads the local time', () => {
    expect(at('21:40').time).toBe('23:40')
    expect(at('22:05').time).toBe('00:05')
  })

  it('knows when it is late', () => {
    expect(at('21:40').mood).toBe('Late.')
    expect(at('01:00').mood).toBe('Late.')
    expect(at('04:30').mood).toBe('Early.')
    expect(at('10:00').mood).toBe('Not late yet.')
    expect(at('17:15').mood).toBe('Getting late.')
  })
})
