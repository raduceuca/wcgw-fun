import { describe, expect, it } from 'vitest'
import { draftPaths, livePages, pages } from './site'

describe('drafts', () => {
  it('keeps draft pages out of what production publishes', () => {
    const live = livePages.map(page => page.path)
    for (const path of draftPaths) expect(live).not.toContain(path)
    expect(live).toContain(pages.thisIsNotIt.path)
  })
  it('marks the producer story and its making-of as drafts', () => {
    expect(draftPaths).toEqual([pages.theProducer.path, pages.theProducerMakingOf.path])
  })
})
