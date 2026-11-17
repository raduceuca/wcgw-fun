import { describe, expect, it } from 'vitest'
import { countsOf, tally, type Idea } from './roadmap'

const no = (text: string, cut = true): Idea => ({ text, verdict: 'no', cut })
const yes = (text: string, cut = false): Idea => ({ text, verdict: 'yes', cut })

const perfect = [no('pivot to agents'), no('make the logo pop'), yes('ask a user')]

describe('tally', () => {
  it('praises the perfect edit', () => {
    expect(tally(perfect)).toBe('2 cut, 1 kept. Whatever survives is the work worth doing.')
  })

  it('reacts to un-cutting a bad idea', () => {
    const ideas = [no('pivot to agents', false), no('make the logo pop'), yes('ask a user')]
    expect(tally(ideas, ideas[0])).toBe('1 cut, 2 kept. “pivot to agents” is back. Brave.')
  })

  it('reacts to cutting a good idea', () => {
    const ideas = [no('pivot to agents'), no('make the logo pop'), yes('ask a user', true)]
    expect(tally(ideas, ideas[2])).toBe('3 cut, 0 kept. Nothing ships. Also a choice.')
    const more = [...ideas, yes('make it faster')]
    expect(tally(more, more[2])).toBe('3 cut, 1 kept. Even “ask a user”? Ruthless.')
  })

  it('approves cutting a bad idea on the way to perfect', () => {
    const ideas = [no('pivot to agents'), no('make the logo pop', false), no('a chatbot'), yes('ask a user')]
    expect(tally(ideas, ideas[0])).toBe('2 cut, 2 kept. Good call.')
  })

  it('accepts keeping a good idea again', () => {
    const ideas = [no('pivot to agents', false), yes('ask a user')]
    expect(tally(ideas, ideas[1])).toBe('0 cut, 2 kept. Everything ships. What could go wrong?')
    const more = [no('pivot to agents', false), no('make the logo pop'), yes('ask a user')]
    expect(tally(more, more[2])).toBe('1 cut, 2 kept. Fair, keep it.')
  })
})

describe('countsOf', () => {
  it('counts what is cut and kept', () => {
    expect(countsOf(perfect)).toBe('2 cut, 1 kept.')
  })
})
