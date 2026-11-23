import { describe, expect, it } from 'vitest'
import { canonical, jsonLd, markdownPath } from './seo'
import { pages } from './site'

describe('seo', () => {
  it('builds canonical and markdown URLs without trailing slashes', () => {
    expect(canonical(pages.home.path)).toBe('https://wcgw.fun/')
    expect(canonical(pages.privacy.path)).toBe('https://wcgw.fun/privacy')
    expect(markdownPath('/')).toBe('/index.md')
    expect(markdownPath('/privacy')).toBe('/privacy.md')
  })

  it('describes the studio, its founder, the site and the page, with dates and profiles', () => {
    const graph = jsonLd({ page: pages.privacy, title: 'Privacy. WCGW', description: 'd' })['@graph']
    const byType = Object.fromEntries(graph.map(node => [node['@type'], node]))
    expect(Object.keys(byType)).toEqual(['Organization', 'Person', 'WebSite', 'WebPage'])
    expect(byType.Organization.sameAs).toContain('https://x.com/wcgwfun')
    expect(byType.WebPage).toMatchObject({ url: 'https://wcgw.fun/privacy', datePublished: '2026-11-18', dateModified: '2026-11-18' })
    expect(byType.WebPage.dateModified).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('lists the tools on the home page only', () => {
    const home = jsonLd({ page: pages.home, title: 't', description: 'd' })['@graph'].at(-1) as Record<string, any>
    expect(home.mainEntity.itemListElement.length).toBeGreaterThan(0)
    expect(home.dateModified).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})
